/**
 * error-monitor.js — EmlakStüdyom Canlı Hata Takip & Akıllı Çökme Kalkanı (Auto-Recover)
 *
 * 1. Tarayıcıda oluşan tüm unhandled runtime hatalarını, promise rejection'ları,
 *    try/catch console.error kayıtlarını ve kullanıcıya gösterilen hata bildirimlerini yakalar.
 * 2. Erken açılışta supabaseClient henüz hazır değilse hataları kuyrukta bekletip hazır olduğunda iletir.
 * 3. Cihaz bilgisi (ekran, tarayıcı, URL) ile birlikte sessizce Supabase error_logs tablosuna kaydeder.
 * 4. Kritik (yakalanmamış) tuval hatalarında acil durum kaydı (Auto-Recover) tetikler.
 * 5. Tekrar önleme (dedup) ve dakika başı hız sınırı (throttling) uygular.
 */

(function() {
    'use strict';

    const MAX_ERRORS_PER_MINUTE = 12;
    const DEDUP_WINDOW_MS = 5000;
    const MAX_PENDING_QUEUE = 20;

    let errorCountThisMinute = 0;
    let minuteResetTimer = null;
    let flushTimer = null;
    let flushAttempts = 0;
    let isHandlingConsoleError = false;

    const sessionErrors = [];
    const pendingQueue = [];
    const recentSignatures = new Map();

    function resetThrottle() {
        errorCountThisMinute = 0;
    }

    function getDeviceInfo() {
        return {
            userAgent: (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : 'Bilinmiyor',
            screenWidth: window.innerWidth || (window.screen ? window.screen.width : 0),
            screenHeight: window.innerHeight || (window.screen ? window.screen.height : 0),
            url: window.location.href,
            path: window.location.pathname
        };
    }

    function isNoiseMessage(msg, src) {
        const m = String(msg || '');
        const s = String(src || '');
        if (s.includes('chrome-extension://') || s.includes('moz-extension://')) return true;
        if (m.includes('ResizeObserver loop limit exceeded') || m.includes('ResizeObserver loop completed')) return true;
        if (m.includes('Failed to update a ServiceWorker')) return true;
        if (m.includes('[ErrorMonitor]')) return true;
        if (m === 'AbortError' || m.startsWith('AbortError:')) return true;
        return false;
    }

    function extractCallerFromStack(stackStr) {
        if (!stackStr) return { source: '', lineno: 0, colno: 0 };
        const lines = String(stackStr).split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes('error-monitor.js') || line.includes('core/utils.js')) continue;
            const match = line.match(/(https?:\/\/[^\s)]+|\/[^\s):]+\.js[^\s):]*):(\d+):(\d+)/i)
                || line.match(/([^\s(/)]+\.js(?:\?[^\s):]*)?):(\d+):(\d+)/i);
            if (match) {
                return {
                    source: match[1],
                    lineno: parseInt(match[2], 10) || 0,
                    colno: parseInt(match[3], 10) || 0
                };
            }
        }
        return { source: '', lineno: 0, colno: 0 };
    }

    function buildPayload(errorData) {
        const currentUser = window.CURRENT_USER;
        return {
            message: (errorData.message || 'Bilinmeyen Hata').slice(0, 1000),
            stack: (errorData.stack || '').slice(0, 3000),
            source: (errorData.source || window.location.href).slice(0, 500),
            lineno: errorData.lineno || 0,
            colno: errorData.colno || 0,
            user_id: currentUser ? currentUser.id : null,
            user_email: currentUser ? currentUser.email : null,
            user_agent: (errorData.device && errorData.device.userAgent ? errorData.device.userAgent : 'Bilinmiyor').slice(0, 500),
            screen_width: errorData.device ? errorData.device.screenWidth : 0,
            screen_height: errorData.device ? errorData.device.screenHeight : 0,
            url: (errorData.device && errorData.device.url ? errorData.device.url : window.location.href).slice(0, 500),
            is_resolved: false
        };
    }

    function enqueuePending(errorData) {
        if (pendingQueue.length >= MAX_PENDING_QUEUE) {
            pendingQueue.shift();
        }
        pendingQueue.push(errorData);
        scheduleFlush();
    }

    function scheduleFlush() {
        if (flushTimer || pendingQueue.length === 0) return;
        flushAttempts = 0;
        flushTimer = setInterval(() => {
            flushAttempts++;
            const client = window.supabaseClient;
            if (client && typeof client.from === 'function') {
                clearInterval(flushTimer);
                flushTimer = null;
                flushPendingErrors();
                return;
            }
            if (flushAttempts >= 25) {
                clearInterval(flushTimer);
                flushTimer = null;
            }
        }, 1000);
    }

    async function flushPendingErrors() {
        const client = window.supabaseClient;
        if (!client || typeof client.from !== 'function' || pendingQueue.length === 0) return;
        const batch = pendingQueue.splice(0, pendingQueue.length);
        for (let i = 0; i < batch.length; i++) {
            await sendErrorToSupabase(batch[i], true);
        }
    }

    async function sendErrorToSupabase(errorData, fromQueue) {
        if (errorCountThisMinute >= MAX_ERRORS_PER_MINUTE) {
            return;
        }

        const client = window.supabaseClient;
        if (!client || typeof client.from !== 'function') {
            if (!fromQueue) enqueuePending(errorData);
            return;
        }

        if (!minuteResetTimer) {
            minuteResetTimer = setInterval(resetThrottle, 60000);
        }
        errorCountThisMinute++;

        try {
            const payload = buildPayload(errorData);
            await client.from('error_logs').insert([payload]);
        } catch (e) {
            // Hata kaydı gönderilemezse kullanıcı deneyimi asla bölünmez
            if (typeof console !== 'undefined' && console.warn) {
                console.warn('[ErrorMonitor] Supabase loglama hatası:', e);
            }
        }
    }

    /**
     * 🛡️ AKILLI ÇÖKME VE VERİ KURTARMA KALKANI (AUTO-RECOVER)
     * Yalnızca yakalanmamış (silent: false) hatalarda çalışır; try/catch içinde
     * kontrollü yakalanan hatalarda mükerrer toast veya müdahale üretmez.
     */
    function triggerAutoRecover(errorContext) {
        try {
            if (typeof window.hideAppLoading === 'function') {
                window.hideAppLoading(0, true);
            }
            if (typeof window.hideExportLoading === 'function') {
                window.hideExportLoading();
            }
            const errStack = (errorContext && errorContext.stack) || '';
            const isExportRelated = !errorContext || !errorContext.isUnhandledRejection || /export|html2canvas|canvas|three/i.test(errStack);
            if (window.isExportingNow && isExportRelated) {
                window.isExportingNow = false;
            }

            if (typeof window.performAutoSave === 'function') {
                window.performAutoSave().catch(() => {});
            } else if (typeof window.requestAutoSave === 'function') {
                window.requestAutoSave();
            }

            if (!window._hasShownCrashRecoveryNotice && typeof window.showAppToast === 'function') {
                window._hasShownCrashRecoveryNotice = true;
                window.showAppToast('Küçük bir teknik aksilik engellendi. Çalışmanız güvenle hafızaya alındı.', 'info');
                setTimeout(() => {
                    window._hasShownCrashRecoveryNotice = false;
                }, 10000);
            }
        } catch (recoverErr) {
            if (typeof console !== 'undefined' && console.warn) {
                console.warn('[ErrorMonitor] Auto-recover hatası:', recoverErr);
            }
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
            if (!stack && extra.stack) stack = extra.stack;
        }

        if (isNoiseMessage(message, source)) {
            return;
        }

        // Kısa süreli aynı hata tekrarını engelle (console.error + showAppToast çakışması vb.)
        const now = Date.now();
        const sig = String(message).slice(0, 160).trim();
        const lastSeen = recentSignatures.get(sig);
        if (lastSeen && (now - lastSeen) < DEDUP_WINDOW_MS) {
            return;
        }
        recentSignatures.set(sig, now);
        if (recentSignatures.size > 40) {
            const firstKey = recentSignatures.keys().next().value;
            recentSignatures.delete(firstKey);
        }

        const errorRecord = {
            message,
            stack,
            source: source || dev.path || window.location.pathname,
            lineno,
            colno,
            isUnhandledRejection: !!(extra && extra.isUnhandledRejection),
            device: dev,
            timestamp: now
        };

        sessionErrors.push(errorRecord);
        if (sessionErrors.length > 30) sessionErrors.shift();
        try {
            sessionStorage.setItem('emlak_last_error', JSON.stringify(errorRecord));
        } catch (e) {}

        const isSilent = !!(extra && extra.silent);
        if (!isSilent) {
            triggerAutoRecover(errorRecord);
        }

        if (pendingQueue.length > 0 && window.supabaseClient && typeof window.supabaseClient.from === 'function') {
            flushPendingErrors();
        }
        sendErrorToSupabase(errorRecord, false);
    }

    // 1. Standart window.onerror
    window.addEventListener('error', function(event) {
        processError(event.error || event.message, {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            silent: false
        });
    });

    // 2. Unhandled Promise Rejections (Fetch, WebWorker, Canvas async hataları)
    window.addEventListener('unhandledrejection', function(event) {
        processError(event.reason, {
            filename: window.location.pathname,
            lineno: 0,
            colno: 0,
            isUnhandledRejection: true,
            silent: false
        });
    });

    // 3. try/catch Bloklarındaki console.error Çağrılarını Yakala (Sessiz Raporlama)
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
        const origConsoleError = console.error.bind(console);
        console.error = function() {
            origConsoleError.apply(console, arguments);
            if (isHandlingConsoleError) return;
            isHandlingConsoleError = true;
            try {
                let errObj = null;
                const parts = [];
                for (let i = 0; i < arguments.length; i++) {
                    const arg = arguments[i];
                    if (arg instanceof Error) {
                        if (!errObj) errObj = arg;
                        parts.push(arg.message || String(arg));
                    } else if (typeof arg === 'string') {
                        parts.push(arg);
                    } else if (arg && typeof arg === 'object') {
                        try {
                            if (arg.message) parts.push(String(arg.message));
                            else parts.push(JSON.stringify(arg));
                        } catch (_) {
                            parts.push(String(arg));
                        }
                    } else if (arg !== undefined && arg !== null) {
                        parts.push(String(arg));
                    }
                }

                const combinedMsg = parts.join(' ').trim();
                const stackStr = (errObj && errObj.stack) ? errObj.stack : (new Error(combinedMsg || 'console.error').stack || '');
                const caller = extractCallerFromStack(stackStr);

                if (combinedMsg) {
                    processError(combinedMsg, {
                        source: caller.source || 'console.error',
                        lineno: caller.lineno,
                        colno: caller.colno,
                        stack: stackStr,
                        silent: true
                    });
                }
            } catch (_) {
                // Hata yakalayıcı kendi içinde asla hata fırlatmaz
            } finally {
                isHandlingConsoleError = false;
            }
        };
    }

    // Sayfa yüklendikten sonra bekleyen erken hataları gönder
    window.addEventListener('load', function() {
        setTimeout(() => { flushPendingErrors(); }, 1500);
    });

    // Global Dışa Aktarılan Yardımcılar
    window.reportManualError = function(err, context, options) {
        const opts = options || {};
        const stackStr = (err instanceof Error && err.stack) ? err.stack : (new Error().stack || '');
        const caller = extractCallerFromStack(stackStr);
        processError(err, {
            source: context ? (context + (caller.source ? ' (' + caller.source + ')' : '')) : (caller.source || 'manual'),
            lineno: caller.lineno,
            colno: caller.colno,
            stack: stackStr,
            silent: opts.silent !== false
        });
    };

    window.getSessionErrorLogs = function() {
        return sessionErrors;
    };

    if (typeof console !== 'undefined' && console.log) {
        console.log('🛡️ [EmlakStüdyom] Tam Kapsamlı Hata Takip & Çökme Kalkanı Devrede.');
    }
})();
