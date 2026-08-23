// ============================================
// EmlakStüdyom - Lisans & Abonelik Sistemi
// js/subscription.js
// ============================================

(function() {
    'use strict';

    // Rastgele benzersiz kod üretici
    function generateRandomString(length = 6) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Okunması zor 0, O, 1, I hariç
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // 🔑 Admin için: Yeni Lisans Kodu Üret
    async function createLicenseCode(days = 30, label = '1 Aylık Pro', note = '') {
        if (!window.supabaseClient) throw new Error('Supabase bağlantısı bulunamadı.');

        let prefix = 'ES-';
        if (days === 30) prefix += '1M-';
        else if (days === 90) prefix += '3M-';
        else if (days === 180) prefix += '6M-';
        else if (days === 365) prefix += '1Y-';
        else if (days > 1000) prefix += 'VIP-';
        else prefix += days + 'D-';

        const randomPart = generateRandomString(6);
        const code = `${prefix}${randomPart}`;

        const { data: { session } } = await window.supabaseClient.auth.getSession();
        const createdBy = session?.user?.id || null;

        const { data, error } = await window.supabaseClient
            .from('license_codes')
            .insert([{
                code: code,
                duration_days: parseInt(days),
                duration_label: label,
                status: 'active',
                note: note || '',
                created_by: createdBy
            }])
            .select()
            .single();

        if (error) {
            console.error('Lisans kodu oluşturma hatası:', error);
            throw error;
        }

        return data;
    }

    // 🎁 Kullanıcı için: Lisans Kodunu Kullan / Aktif Et
    async function redeemLicenseCode(targetCode) {
        if (!window.supabaseClient) throw new Error('Supabase bağlantısı bulunamadı.');

        const cleanCode = (targetCode || '').trim().toUpperCase();
        if (!cleanCode) {
            return { success: false, message: 'Lütfen geçerli bir lisans kodu girin.' };
        }

        const { data: { session } } = await window.supabaseClient.auth.getSession();
        const userId = session?.user?.id || null;
        const userEmail = session?.user?.email || null;

        // 1. Giriş yapılmışsa RPC yöntemini dene (en güvenli atomik yol)
        if (userId) {
            try {
                const { data: rpcRes, error: rpcErr } = await window.supabaseClient.rpc('redeem_license_code', {
                    target_code: cleanCode
                });

                if (!rpcErr && rpcRes && rpcRes.success) {
                    if (typeof window.checkUserMode === 'function') await window.checkUserMode();
                    return rpcRes;
                }
            } catch (e) {
                console.warn('RPC çalıştırılamadı, doğrudan sorguya geçiliyor:', e);
            }
        }

        // 2. Lisans Kodunu Veritabanında Ara
        const { data: codeRow, error: findErr } = await window.supabaseClient
            .from('license_codes')
            .select('*')
            .eq('code', cleanCode)
            .eq('status', 'active')
            .maybeSingle();

        if (findErr || !codeRow) {
            return { success: false, message: 'Geçersiz veya daha önce kullanılmış lisans kodu.' };
        }

        // 3. Bitiş Tarihini Hesapla
        let newExpires;
        const now = new Date();
        newExpires = new Date(now.getTime() + (codeRow.duration_days * 24 * 60 * 60 * 1000));

        // 4. Kodu veritabanında kullanıldı yap
        await window.supabaseClient
            .from('license_codes')
            .update({
                status: 'used',
                used_by: userId,
                used_by_email: userEmail || 'Misafir Kullanıcı',
                used_at: now.toISOString()
            })
            .eq('id', codeRow.id);

        // 5. Eğer oturum açıksa profili güncelle
        if (userId) {
            await window.supabaseClient
                .from('profiles')
                .update({
                    subscription_plan: 'pro',
                    subscription_expires_at: newExpires.toISOString()
                })
                .eq('id', userId);
        }

        if (typeof window.checkUserMode === 'function') await window.checkUserMode();

        return {
            success: true,
            message: `🎉 Tebrikler! ${codeRow.duration_label} hesabınıza başarıyla tanımlandı.`,
            expires_at: newExpires,
            duration_label: codeRow.duration_label
        };
    }

    // 🖥️ Modal: Lisans Kodu Giriş Penceresi
    function openRedeemCodeModal() {
        if (typeof Swal === 'undefined') {
            const code = prompt('Lütfen Promosyon / Lisans Kodunuzu girin:');
            if (code) {
                redeemLicenseCode(code).then(res => {
                    alert(res.message);
                    if (res.success && typeof window.checkUserMode === 'function') window.checkUserMode();
                });
            }
            return;
        }

        Swal.fire({
            title: '🔑 Lisans Kodu Etkinleştir',
            html: `
                <div style="text-align:center; margin-bottom:12px; color:#94a3b8; font-size:13px;">
                    Satın aldığınız veya size özel tanımlanan aktivasyon kodunu buraya girerek Pro özellikleri anında açabilirsiniz.
                </div>
                <div style="position:relative; margin-top:10px;">
                    <input type="text" id="swalLicenseCode" class="swal2-input" placeholder="Örn: ES-1M-AB12CD" style="text-transform:uppercase; font-weight:bold; letter-spacing:1px; text-align:center; margin:0; width:100%; border-radius:10px;">
                </div>
            `,
            background: '#1e293b',
            color: '#ffffff',
            showCancelButton: true,
            confirmButtonText: '⚡ Aktif Et',
            cancelButtonText: 'Vazgeç',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#64748b',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                const codeInput = document.getElementById('swalLicenseCode');
                const code = codeInput ? codeInput.value.trim() : '';
                if (!code) {
                    Swal.showValidationMessage('Lütfen bir kod yazın.');
                    return false;
                }
                try {
                    const result = await redeemLicenseCode(code);
                    if (!result.success) {
                        Swal.showValidationMessage(result.message);
                        return false;
                    }
                    return result;
                } catch (err) {
                    Swal.showValidationMessage('Hata: ' + (err.message || err));
                    return false;
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed && result.value?.success) {
                Swal.fire({
                    icon: 'success',
                    title: '🎉 Tebrikler!',
                    text: result.value.message,
                    background: '#1e293b',
                    color: '#ffffff',
                    confirmButtonColor: '#3b82f6'
                });
            }
        });
    }

    // Dışa aktar
    window.SubscriptionManager = {
        createLicenseCode,
        redeemLicenseCode,
        openRedeemCodeModal
    };

    window.openRedeemCodeModal = openRedeemCodeModal;

    console.log('✅ SubscriptionManager yüklendi');
})();
