/**
 * ============================================================================
 * 🎬 9:16 FORMAT PRO JSON ŞABLONLARI (STORY / REELS / TIKTOK - 1080x1920)
 * templates_json/templates_9_16.js
 * ============================================================================
 */

(function(window) {
    'use strict';

    const TEMPLATES_9_16 = [
        {
            id: 'pj_9x16_story_vip_villa',
            name: 'Story VIP Lüks Villa',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'villa',
            badge: '🎬 STORY VILLA',
            previewBg: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            elements: [
                {
                    id: 'el_s_top_bar', field: 'badge',
                    style: 'position:absolute; top:70px; left:50px; right:50px; display:flex; justify-content:space-between; align-items:center; z-index:20;',
                    html: `
                        <div style="background:#6366f1; color:#fff; padding:12px 28px; border-radius:30px; font-size:22px; font-weight:800;" data-field="badge">LÜKS VİLLA</div>
                        <div style="background:rgba(0,0,0,0.8); color:#38bdf8; padding:10px 22px; border-radius:30px; font-size:20px; font-weight:700;" data-field="location"><i class="fas fa-map-marker-alt"></i> Bodrum</div>
                    `
                },
                {
                    id: 'el_s_price', field: 'price',
                    style: 'position:absolute; bottom:220px; left:50px; right:50px; background:linear-gradient(135deg,#d97706,#f59e0b); color:#fff; padding:20px; border-radius:18px; text-align:center; font-size:46px; font-weight:900; box-shadow:0 15px 35px rgba(217,119,6,0.5); z-index:20;',
                    html: '38.500.000 ₺'
                },
                {
                    id: 'el_s_details', field: 'features',
                    style: 'position:absolute; bottom:90px; left:50px; right:50px; background:rgba(15,23,42,0.92); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.15); border-radius:18px; padding:22px; display:flex; justify-content:space-around; color:#fff; font-size:20px; font-weight:700; z-index:20;',
                    html: `
                        <div><i class="fas fa-bed" style="color:#818cf8;"></i> <span data-field="rooms">6+2</span></div>
                        <div><i class="fas fa-vector-square" style="color:#38bdf8;"></i> <span data-field="size">520 m²</span></div>
                        <div><i class="fas fa-swimming-pool" style="color:#34d399;"></i> Özel Havuz</div>
                    `
                }
            ]
        },
        {
            id: 'pj_9x16_reels_cover',
            name: 'Reels Emlak Kapağı',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'konut',
            badge: '🎥 REELS COVER',
            previewBg: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
            elements: [
                {
                    id: 'el_reels_b', field: 'badge',
                    style: 'position:absolute; top:80px; left:50px; background:#dc2626; color:#fff; padding:12px 28px; border-radius:8px; font-size:22px; font-weight:900; z-index:20;',
                    html: '🔥 YENİ İLAN'
                },
                {
                    id: 'el_reels_card', field: 'features',
                    style: 'position:absolute; bottom:90px; left:50px; right:50px; background:rgba(24,24,27,0.92); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.15); border-radius:24px; padding:32px; z-index:20;',
                    html: `
                        <div style="font-size:24px; font-weight:800; color:#fff; margin-bottom:8px;" data-field="location">İstanbul / Kadıköy</div>
                        <div style="font-size:46px; font-weight:900; color:#38bdf8; margin-bottom:18px;" data-field="price">6.900.000 ₺</div>
                        <div style="display:flex; justify-content:space-between; background:rgba(255,255,255,0.06); padding:14px 20px; border-radius:12px; color:#fff; font-size:20px; font-weight:700;">
                            <span><strong data-field="rooms">3+1</strong></span>
                            <span>•</span>
                            <span><strong data-field="size">140 m²</strong></span>
                            <span>•</span>
                            <span><strong data-field="floor">4. Kat</strong></span>
                        </div>
                    `
                }
            ]
        },
        {
            id: 'pj_9x16_story_arsa',
            name: 'Arsa Yatırım Hikayesi',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'arsa',
            badge: '🌱 ARSA STORY',
            previewBg: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)',
            elements: [
                {
                    id: 'el_s_arsa_b', field: 'badge',
                    style: 'position:absolute; top:80px; left:50px; background:#059669; color:#fff; padding:12px 28px; border-radius:30px; font-size:22px; font-weight:800; z-index:20;',
                    html: '🌱 YATIRIMLIK ARSA'
                },
                {
                    id: 'el_s_arsa_ap', field: 'land',
                    style: 'position:absolute; top:80px; right:50px; background:rgba(0,0,0,0.85); border:1px solid #10b981; color:#34d399; padding:10px 22px; border-radius:30px; font-size:18px; font-weight:700; z-index:20;',
                    html: 'ADA: 108 / PARSEL: 5'
                },
                {
                    id: 'el_s_arsa_card', field: 'features',
                    style: 'position:absolute; bottom:90px; left:50px; right:50px; background:rgba(2,44,34,0.94); border:1px solid rgba(16,185,129,0.4); border-radius:24px; padding:32px; z-index:20;',
                    html: `
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                            <div style="font-size:24px; font-weight:800; color:#fff;" data-field="location">Bursa / İznik</div>
                            <div style="font-size:42px; font-weight:900; color:#34d399;" data-field="price">2.450.000 ₺</div>
                        </div>
                        <div style="background:rgba(0,0,0,0.3); padding:14px 20px; border-radius:12px; display:flex; justify-content:space-between; color:#fff; font-size:18px; font-weight:700;">
                            <span><i class="fas fa-ruler-combined" style="color:#34d399;"></i> <strong data-field="size">920 m²</strong></span>
                            <span><i class="fas fa-file-contract" style="color:#34d399;"></i> Müstakil Tapu</span>
                        </div>
                    `
                }
            ]
        },
        {
            id: 'pj_9x16_cyber_story',
            name: 'Cyber Neon Story',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'konut',
            badge: '⚡ CYBER STORY',
            previewBg: 'linear-gradient(135deg, #18032b 0%, #030014 100%)',
            elements: [
                {
                    id: 'el_s_cy_b', field: 'badge',
                    style: 'position:absolute; top:80px; left:50px; background:rgba(236,72,153,0.25); border:2px solid #ec4899; color:#f472b6; padding:12px 28px; border-radius:30px; font-size:22px; font-weight:900; text-shadow:0 0 12px #ec4899; z-index:20;',
                    html: '⚡ KAÇIRILMAYACAK FIRSAT'
                },
                {
                    id: 'el_s_cy_p', field: 'price',
                    style: 'position:absolute; bottom:200px; left:50px; right:50px; background:rgba(14,165,233,0.25); border:2px solid #0ea5e9; color:#38bdf8; padding:18px; border-radius:18px; text-align:center; font-size:48px; font-weight:900; text-shadow:0 0 20px #0ea5e9; z-index:20;',
                    html: '8.400.000 ₺'
                },
                {
                    id: 'el_s_cy_f', field: 'features',
                    style: 'position:absolute; bottom:90px; left:50px; right:50px; background:rgba(0,0,0,0.85); padding:18px 24px; border-radius:16px; display:flex; justify-content:space-around; color:#fff; font-size:20px; font-weight:700; z-index:20;',
                    html: `
                        <div><span data-field="rooms">3+1</span></div>
                        <div>•</div>
                        <div><span data-field="size">165 m²</span></div>
                        <div>•</div>
                        <div><span data-field="location">İzmir / Bornova</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_9x16_story_gold',
            name: 'Gold Prestij Story',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'villa',
            badge: '⚜️ GOLD STORY',
            previewBg: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
            elements: [
                {
                    id: 'el_s_g_frame', field: 'badge',
                    style: 'position:absolute; top:40px; left:40px; right:40px; bottom:40px; border:2px solid rgba(234,179,8,0.4); pointer-events:none; z-index:15;',
                    html: ''
                },
                {
                    id: 'el_s_g_b', field: 'badge',
                    style: 'position:absolute; top:75px; left:75px; background:linear-gradient(135deg,#ca8a04,#eab308); color:#000; padding:12px 28px; border-radius:8px; font-size:22px; font-weight:900; z-index:20;',
                    html: '⚜️ ÖZEL PORTFÖY'
                },
                {
                    id: 'el_s_g_p', field: 'price',
                    style: 'position:absolute; bottom:200px; left:75px; right:75px; background:rgba(0,0,0,0.92); border:2px solid #eab308; color:#facc15; padding:18px; border-radius:14px; text-align:center; font-size:44px; font-weight:900; z-index:20;',
                    html: '29.000.000 ₺'
                },
                {
                    id: 'el_s_g_f', field: 'features',
                    style: 'position:absolute; bottom:85px; left:75px; right:75px; background:rgba(0,0,0,0.9); padding:18px 24px; border-radius:12px; display:flex; justify-content:space-around; color:#fff; font-size:20px; font-weight:700; z-index:20;',
                    html: `
                        <div><span style="color:#eab308;">ODA:</span> <span data-field="rooms">6+2</span></div>
                        <div><span style="color:#eab308;">M²:</span> <span data-field="size">550 m²</span></div>
                        <div><span style="color:#eab308;">YER:</span> <span data-field="location">Çeşme</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_9x16_dikey_kartlar',
            name: '4\'lü Dikey Özellik Story',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'konut',
            badge: '📱 KARTLI STORY',
            previewBg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            elements: [
                {
                    id: 'el_s_dk_b', field: 'badge',
                    style: 'position:absolute; top:80px; left:50px; background:#4f46e5; color:#fff; padding:12px 28px; border-radius:30px; font-size:22px; font-weight:800; z-index:20;',
                    html: 'SATILIK DAİRE'
                },
                {
                    id: 'el_s_dk_p', field: 'price',
                    style: 'position:absolute; top:75px; right:50px; color:#38bdf8; font-size:42px; font-weight:900; z-index:20;',
                    html: '5.650.000 ₺'
                },
                {
                    id: 'el_s_dk_cards', field: 'features',
                    style: 'position:absolute; bottom:80px; left:50px; right:50px; display:flex; flex-direction:column; gap:12px; z-index:20;',
                    html: `
                        <div style="background:rgba(15,23,42,0.92); padding:16px 24px; border-radius:14px; display:flex; justify-content:space-between; color:#fff; font-size:20px; font-weight:700;">
                            <span><i class="fas fa-bed" style="color:#818cf8; margin-right:10px;"></i> Oda Sayısı</span>
                            <strong data-field="rooms">3+1</strong>
                        </div>
                        <div style="background:rgba(15,23,42,0.92); padding:16px 24px; border-radius:14px; display:flex; justify-content:space-between; color:#fff; font-size:20px; font-weight:700;">
                            <span><i class="fas fa-vector-square" style="color:#38bdf8; margin-right:10px;"></i> Brüt Alan</span>
                            <strong data-field="size">145 m²</strong>
                        </div>
                        <div style="background:rgba(15,23,42,0.92); padding:16px 24px; border-radius:14px; display:flex; justify-content:space-between; color:#fff; font-size:20px; font-weight:700;">
                            <span><i class="fas fa-building" style="color:#34d399; margin-right:10px;"></i> Kat Bilgisi</span>
                            <strong data-field="floor">3. Kat</strong>
                        </div>
                        <div style="background:rgba(15,23,42,0.92); padding:16px 24px; border-radius:14px; display:flex; justify-content:space-between; color:#fff; font-size:20px; font-weight:700;">
                            <span><i class="fas fa-map-marker-alt" style="color:#f43f5e; margin-right:10px;"></i> Konum</span>
                            <strong data-field="location">Ankara / Etimesgut</strong>
                        </div>
                    `
                }
            ]
        },
        {
            id: 'pj_9x16_fiyat_soku',
            name: 'Büyük Fiyat Vurgusu',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'konut',
            badge: '🏷️ FİYAT ŞOKU',
            previewBg: 'linear-gradient(135deg, #991b1b 0%, #450a0a 100%)',
            elements: [
                {
                    id: 'el_s_sh_b', field: 'badge',
                    style: 'position:absolute; top:80px; left:50px; background:#ef4444; color:#fff; padding:12px 28px; border-radius:8px; font-size:22px; font-weight:900; z-index:20;',
                    html: '🔥 ACİL SATILIK'
                },
                {
                    id: 'el_s_sh_p', field: 'price',
                    style: 'position:absolute; bottom:200px; left:50px; right:50px; background:#dc2626; color:#fff; padding:22px; border-radius:20px; text-align:center; font-size:52px; font-weight:900; box-shadow:0 15px 35px rgba(220,38,38,0.5); z-index:20;',
                    html: '3.850.000 ₺'
                },
                {
                    id: 'el_s_sh_f', field: 'features',
                    style: 'position:absolute; bottom:80px; left:50px; right:50px; background:rgba(0,0,0,0.9); padding:18px 24px; border-radius:14px; display:flex; justify-content:space-around; color:#fff; font-size:20px; font-weight:700; z-index:20;',
                    html: `
                        <div><strong data-field="rooms">2+1</strong></div>
                        <div>•</div>
                        <div><strong data-field="size">105 m²</strong></div>
                        <div>•</div>
                        <div><span data-field="location">Antalya / Kepez</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_9x16_ticari_story',
            name: 'Ticari & Dükkan Story',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'ticari',
            badge: '🏬 TİCARİ STORY',
            previewBg: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
            elements: [
                {
                    id: 'el_s_tc_b', field: 'badge',
                    style: 'position:absolute; top:80px; left:50px; background:#0d9488; color:#fff; padding:12px 28px; border-radius:8px; font-size:22px; font-weight:800; z-index:20;',
                    html: 'SATILIK DÜKKAN / MAĞAZA'
                },
                {
                    id: 'el_s_tc_p', field: 'price',
                    style: 'position:absolute; bottom:200px; left:50px; right:50px; background:#134e4a; color:#5eead4; padding:18px; border-radius:16px; text-align:center; font-size:46px; font-weight:900; z-index:20;',
                    html: '14.500.000 ₺'
                },
                {
                    id: 'el_s_tc_f', field: 'features',
                    style: 'position:absolute; bottom:80px; left:50px; right:50px; background:rgba(0,0,0,0.9); padding:18px 24px; border-radius:14px; display:flex; justify-content:space-around; color:#fff; font-size:20px; font-weight:700; z-index:20;',
                    html: `
                        <div><i class="fas fa-store" style="color:#5eead4;"></i> <span data-field="size">190 m²</span></div>
                        <div><i class="fas fa-coins" style="color:#fbbf24;"></i> Yüksek Getiri</div>
                        <div><span data-field="location">Bursa</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_9x16_doga_story',
            name: 'Doğa & Taş Ev Story',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'villa',
            badge: '🌲 DOĞA STORY',
            previewBg: 'linear-gradient(135deg, #14532d 0%, #052e16 100%)',
            elements: [
                {
                    id: 'el_s_dg_b', field: 'badge',
                    style: 'position:absolute; top:80px; left:50px; background:#16a34a; color:#fff; padding:12px 28px; border-radius:30px; font-size:22px; font-weight:800; z-index:20;',
                    html: '🌲 MÜSTAKİL TAŞ EV'
                },
                {
                    id: 'el_s_dg_p', field: 'price',
                    style: 'position:absolute; bottom:200px; left:50px; right:50px; background:#15803d; color:#fff; padding:18px; border-radius:16px; text-align:center; font-size:46px; font-weight:900; z-index:20;',
                    html: '15.200.000 ₺'
                },
                {
                    id: 'el_s_dg_f', field: 'features',
                    style: 'position:absolute; bottom:80px; left:50px; right:50px; background:rgba(0,0,0,0.88); padding:18px 24px; border-radius:14px; display:flex; justify-content:space-around; color:#fff; font-size:20px; font-weight:700; z-index:20;',
                    html: `
                        <div><i class="fas fa-tree" style="color:#4ade80;"></i> <span data-field="land">1.500 m² Bahçe</span></div>
                        <div><i class="fas fa-home" style="color:#4ade80;"></i> <span data-field="rooms">3+1</span></div>
                        <div><span data-field="location">Kazdağları</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_9x16_danisman_story',
            name: 'Kurumsal Danışman Story',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'konut',
            badge: '👔 DANIŞMAN',
            previewBg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            elements: [
                {
                    id: 'el_s_dn_b', field: 'badge',
                    style: 'position:absolute; top:80px; left:50px; background:#3b82f6; color:#fff; padding:12px 28px; border-radius:30px; font-size:22px; font-weight:800; z-index:20;',
                    html: 'SATILIK PORTFÖY'
                },
                {
                    id: 'el_s_dn_p', field: 'price',
                    style: 'position:absolute; bottom:220px; left:50px; right:50px; background:rgba(15,23,42,0.92); border:2px solid #3b82f6; color:#38bdf8; padding:18px; border-radius:16px; text-align:center; font-size:46px; font-weight:900; z-index:20;',
                    html: '8.350.000 ₺'
                },
                {
                    id: 'el_s_dn_contact', field: 'contact',
                    style: 'position:absolute; bottom:80px; left:50px; right:50px; background:#2563eb; color:#fff; padding:18px 24px; border-radius:16px; display:flex; justify-content:space-between; align-items:center; font-size:20px; font-weight:800; z-index:20;',
                    html: `
                        <div><i class="fas fa-user-tie" style="margin-right:8px;"></i> Detaylı Bilgi & Randevu</div>
                        <div><i class="fas fa-phone-alt" style="margin-right:6px;"></i> Hemen Arayın</div>
                    `
                }
            ]
        }
    ];

    // Otomatik Kayıt Motoruna Ekle
    TEMPLATES_9_16.forEach(t => {
        if (typeof window.registerProJsonTemplate === 'function') {
            window.registerProJsonTemplate(t);
        }
    });

})(window);
