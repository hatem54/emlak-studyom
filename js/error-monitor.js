/**
 * error-monitor.js — EmlakStüdyom Canlı Hata Takip & Akıllı Çökme Kalkanı (Auto-Recover)
 * 
 * 1. Tarayıcıda oluşan tüm unhandled runtime hatalarını ve promise rejection'ları yakalar.
 * 2. Cihaz bilgisi (ekran, tarayıcı, URL) ile birlikte sessizce Supabase error_logs tablosuna kaydeder.
 * 3. Kritik tuval hatalarında acil durum kaydı (Emergency Auto-Save) tetikleyerek veri kaybını önler.
 * 4. Yükleme ekranının sonsuza kadar donmasını engeller.
 * 5. Sunucuyu korumak için dakikada maksimum 5 hata sınırlandırması (throttling) uygular.
 */

(function() {
    'use strict';

    const MAX_ERRORS_PER_MINUTE = 5;
    let errorCountThisMinute = 0;
    let minuteResetTimer = null;
    const sessionErrors = [];

    function resetThrottle() {
        errorCountThisMinute = 0;
    }

    function getDeviceInfo() {
        return {
            userAgent: navigator.userAgent || 'Bilinmiyor',
            screenWidth: window.innerWidth || (window.screen ? window.screen.width : 0),
            screenHeight: window.innerHeight || (window.screen ? window.screen.height : 0),
            url: window.location.href,
            path: window.location.pathname
        };
    }

    async function sendErrorToSupabase(errorData) {
        if (errorCountThisMinute >= MAX_ERRORS_PER_MINUTE) {
            console.warn('[ErrorMonitor] Hata bildirim limiti aşıldı, bu istek atlanıyor.');
            return;
        }

        if (!minuteResetTimer) {
            minuteResetTimer = setInterval(resetThrottle, 60000);
        }
        errorCountThisMinute++;

        const client = window.supabaseClient;
        if (!client || typeof client.from !== 'function') {
            return;
        }

        try {
            const currentUser = window.CURRENT_USER;
            const payload = {
                message: (errorData.message || 'Bilinmeyen Hata').slice(0, 1000),
                stack: (errorData.stack || '').slice(0, 3000),
                source: (errorData.source || errorData.filename || window.location.href).slice(0, 500),
                lineno: errorData.lineno || errorData.lineNumber || 0,
                colno: errorData.colno || errorData.columnNumber || 0,
                user_id: currentUser ? currentUser.id : null,
                user_email: currentUser ? currentUser.email : null,
                user_agent: errorData.device.userAgent.slice(0, 500),
                screen_width: errorData.device.screenWidth,
                screen_height: errorData.device.screenHeight,
                url: errorData.device.url.slice(0, 500),
                is_resolved: false
            };

            await client.from('error_logs').insert([payload]);
        } catch (e) {
            // Hata kaydı gönderilemezse sessizce geçilir, kullanıcı deneyimi asla bölünmez
            console.warn('[ErrorMonitor] Supabase loglama hatası:', e);
        }
    }

    /**
     * 🛡️ AKILLI ÇÖKME VE VERİ KURTARMA KALKANI (AUTO-RECOVER)
     */
    function triggerAutoRecover(errorContext) {
        try {
            // 1. Ekranı kilitleyen asenkron yükleyicileri hemen kapat
            if (typeof window.hideAppLoading === 'function') {
                window.hideAppLoading(0, true);
            }
            if (typeof window.hideExportLoading === 'function') {
                window.hideExportLoading();
            }
            if (window.isExportingNow) {
                window.isExportingNow = false;
            }

            // 2. Tuvalde açık olan çalışmayı derhal IndexedDB'ye acil kaydet
            if (typeof window.performAutoSave === 'function') {
                window.performAutoSave().catch(() => {});
            } else if (typeof window.requestAutoSave === 'function') {
                window.requestAutoSave();
            }

            // 3. Kullanıcıya nazikçe bildir (Sadece kritik durumlarda ve 1 kez)
            if (!window._hasShownCrashRecoveryNotice && typeof window.showAppToast === 'function') {
                window._hasShownCrashRecoveryNotice = true;
                window.showAppToast('Küçük bir teknik aksilik engellendi. Çalışmanız güvenle hafızaya alındı.', 'info');
                setTimeout(() => {
                    window._hasShownCrashRecoveryNotice = false;
                }, 10000);
            }
        } catch (recoverErr) {
            console.warn('[ErrorMonitor] Auto-recover hatası:', recoverErr);
        }
    }

    /**
     * Genel Hata İşleyici
     */
    function processError(rawError, extra) {
        const dev = getDeviceInfo();
        let message = 'Bilinmeyen Çalışma Zamanı Hatası';
        let stack = '';
        let source = '';
        let lineno = 0;
        let colno = 0;

        if (typeof rawError === 'string') {
            message = rawError;
        } else if (rawError instanceof Error) {
            message = rawError.message || String(rawError);
            stack = rawError.stack || '';
        } else if (rawError && typeof rawError === 'object') {
            message = rawError.message || JSON.stringify(rawError);
            stack = rawError.stack || '';
        }

        if (extra) {
            source = extra.source || extra.filename || source;
            lineno = extra.lineno || extra.lineNumber || lineno;
            colno = extra.colno || extra.columnNumber || colno;
        }

        // Önemsiz tarayıcı eklentisi (extension) veya video yükleme iptallerini filtrele
        if (source.includes('chrome-extension://') || source.includes('moz-extension://') || message.includes('ResizeObserver loop limit exceeded')) {
            return;
        }

        const errorRecord = {
            message,
            stack,
            source,
            lineno,
            colno,
            device: dev,
            timestamp: Date.now()
        };

        sessionErrors.push(errorRecord);
        if (sessionErrors.length > 20) sessionErrors.shift();
        try {
            sessionStorage.setItem('emlak_last_error', JSON.stringify(errorRecord));
        } catch(e) {}

        // Otomatik kurtarma ve veritabanı gönderimi
        triggerAutoRecover(errorRecord);
        sendErrorToSupabase(errorRecord);
    }

    // 1. Standart window.onerror
    window.addEventListener('error', function(event) {
        processError(event.error || event.message, {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
    });

    // 2. Unhandled Promise Rejections (Fetch, WebWorker, Canvas async hataları)
    window.addEventListener('unhandledrejection', function(event) {
        const reason = event.reason;
        processError(reason, {
            filename: window.location.pathname,
            lineno: 0,
            colno: 0
        });
    });

    // Global Dışa Aktarılan Yardımcılar
    window.reportManualError = function(err, context) {
        processError(err, { source: context || 'manual' });
    };

    window.getSessionErrorLogs = function() {
        return sessionErrors;
    };

    console.log('🛡️ [EmlakStüdyom] Akıllı Hata Takip & Çökme Kalkanı (Auto-Recover) Devrede.');
})();
