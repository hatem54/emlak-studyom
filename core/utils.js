/**
 * ============================================
 * core/utils.js MODULE
 * Temel Yardımcı Fonksiyonlar
 * ============================================
 * 
 * Bağımlılıklar:
 * - Yok
 * 
 * Kullanılan yerler:
 * - modules/colors.js
 * - core/drag.js
 * - main.js vb.
 */

window.getGlobalScale = function() {
    const sf = (typeof scaleFactor !== 'undefined' && scaleFactor > 0 && !isNaN(scaleFactor)) ? scaleFactor : (window.scaleFactor || 1);
    const ps = (typeof window.pinchScale !== 'undefined' && window.pinchScale > 0 && !isNaN(window.pinchScale)) ? window.pinchScale : 1;
    return sf * ps;
};

if (typeof window.isMobileDevice !== 'function') {
    window.isMobileDevice = function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (window.innerWidth <= 768 && window.innerHeight > window.innerWidth);
    };
}

if (typeof window.hasImageOnCanvas !== 'function') {
    window.hasImageOnCanvas = function() {
        if (typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl && uploadedImgUrl !== '') return true;
        if (typeof window.uploadedImgUrl !== 'undefined' && window.uploadedImgUrl) return true;
        const pl = document.getElementById('photo-layer');
        if (pl && pl.style.backgroundImage && pl.style.backgroundImage !== 'none' && pl.style.backgroundImage !== '') return true;
        const panel = document.querySelector('.photo-panel');
        if (panel && ((panel.style.backgroundImage && panel.style.backgroundImage !== 'none') || panel.querySelector('img'))) return true;
        return false;
    };
}

function sleep(ms){return new Promise(r=>setTimeout(r,ms))}

function hexToRgb(h){
    let c=h.replace('#','');
    if(c.length===3)c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
    const n=parseInt(c,16);
    return{r:(n>>16)&255,g:(n>>8)&255,b:n&255};
}

function rgbToHex(rgb){
    if(rgb.startsWith('#'))return rgb;
    const m=rgb.match(/\d+/g);
    if(!m||m.length<3)return'#ffffff';
    return'#'+[m[0],m[1],m[2]].map(x=>parseInt(x).toString(16).padStart(2,'0')).join('');
}

function rgbToHslFast(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l];
}

function hslToRgbFast(h, s, l) {
    let r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        let hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function getColorCategory(h) {
    let deg = h * 360;
    if(deg >= 345 || deg < 15) return 'red';
    if(deg >= 15 && deg < 45) return 'orange';
    if(deg >= 45 && deg < 75) return 'yellow';
    if(deg >= 75 && deg < 165) return 'green';
    if(deg >= 165 && deg < 255) return 'blue';
    if(deg >= 255 && deg < 315) return 'purple';
    if(deg >= 315 && deg < 345) return 'magenta';
    return 'red';
}

function enableInlineEdit(el) {
    if(!el) return;
    if(el.classList.contains('added-icon') || el.classList.contains('svg-icon') || el.classList.contains('icon-wrapper')) {
        el.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            e.preventDefault();
            if (typeof setSelected === 'function') setSelected(el);
            if (typeof window.openSelectedElementSettings === 'function') {
                window.openSelectedElementSettings(el);
            } else if (typeof switchTab === 'function') {
                switchTab('icons');
            }
        });
        return;
    }

    if (el.dataset.inlineEditEnabled) return;
    el.dataset.inlineEditEnabled = '1';

    const startEditing = function(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (el.isContentEditable) return;
        
        // ⚡ Tuvalde doğrudan düzenleme moduna geç (sol panel sekmesini ve akordiyonları asla bozma)
        if (typeof selectElement === 'function') {
            selectElement(el, false, true, false);
        } else if (typeof window.selectElement === 'function') {
            window.selectElement(el, false, true, false);
        }

        // Remove text handles so they don't get deleted by text selection/typing
        el.querySelectorAll('.text-handle').forEach(h => h.remove());
        
        // Sürüklemeyi geçici olarak durdur (core/drag.js ile uyumlu)
        el.dataset.editingText = '1';
        
        el.contentEditable = 'true';
        el.spellcheck = false;
        el.focus();
        el.style.cursor = 'text';
        
        // Metni seç
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        const handleInput = function() {
            if (el.classList.contains('neon-text-el') || el.dataset.saberActive === 'true') {
                el.dataset.rawText = el.textContent.trim();
            }
            if (window.SaberEngine && typeof window.SaberEngine.updateTextSaberPositions === 'function') {
                window.SaberEngine.updateTextSaberPositions();
            }
        };

        const finishEdit = function() {
            el.contentEditable = 'false';
            el.style.cursor = '';
            delete el.dataset.editingText;
            
            if (!el.textContent.trim()) {
                el.textContent = 'Metin';
            }
            if (el.classList.contains('neon-text-el') || el.dataset.saberActive === 'true') {
                el.dataset.rawText = el.textContent.trim();
            }
            
            // Restore handles if still selected (yalnızca serbest kanvas ögeleri için)
            if (el.classList.contains('el-selected') && typeof window.addTextHandles === 'function') {
                if (!el.classList.contains('editable-text') && !el.closest('#canva-render-layer, .cvr-base, .canva-panel, .canva-generated')) {
                    window.addTextHandles(el);
                }
            }

            if (window.SaberEngine && typeof window.SaberEngine.updateTextSaberPositions === 'function') {
                window.SaberEngine.updateTextSaberPositions();
            }
            
            el.removeEventListener('blur', finishEdit);
            el.removeEventListener('keydown', handleKey);
            el.removeEventListener('input', handleInput);
        };

        const handleKey = function(ev) {
            // Enter'a basınca kaydet, Shift+Enter'a basınca alt satıra geç
            if (ev.key === 'Enter' && !ev.shiftKey) {
                ev.preventDefault();
                finishEdit();
                window.getSelection().removeAllRanges();
            }
        };

        el.addEventListener('input', handleInput);
        el.addEventListener('blur', finishEdit);
        el.addEventListener('keydown', handleKey);
    };

    el.addEventListener('dblclick', startEditing);
    // Not: Tek tıkla düzenleme modu kaldırıldı; seçili ögelerin (özellikle Fiyat Etiketi) fareyle serbestçe sürüklenmesini engellemez

    // Mobil çift dokunma (double-tap) ile anında metin düzenleme
    let lastTapTime = 0;
    el.addEventListener('touchend', function(e) {
        const now = Date.now();
        if (now - lastTapTime < 350 && now - lastTapTime > 0) {
            startEditing(e);
        }
        lastTapTime = now;
    }, { passive: true });
}

/**
 * Global App Toast (Klasik Mavi Bilgi & Bildirim Ekranı)
 * Emlak Stüdiom genelinde kullanılan şık, animasyonlu bildirim balonu.
 */
window.showAppToast = function(message, type = 'info', durationMs = 2800) {
    try {
        const oldToast = document.getElementById('appGlobalToast');
        if (oldToast) {
            oldToast.remove();
        }

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || 
                       (document.body && document.body.getAttribute('data-theme') === 'dark');

        // Durum belirteçleri ve ikonları (Tek İkon Kuralı: Saf FontAwesome)
        let iconHtml = '<i class="fa-solid fa-circle-info" style="color: #0284c7; font-size: 15px; flex-shrink: 0;"></i>';
        let accentBorder = '#0284c7';

        if (type === 'success') {
            iconHtml = '<i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 15px; flex-shrink: 0;"></i>';
            accentBorder = '#10b981';
        } else if (type === 'error') {
            iconHtml = '<i class="fa-solid fa-circle-exclamation" style="color: #ef4444; font-size: 15px; flex-shrink: 0;"></i>';
            accentBorder = '#ef4444';
            if (typeof window.reportManualError === 'function') {
                try { window.reportManualError(String(message || 'Uygulama Hatası'), 'showAppToast', { silent: true }); } catch(_) {}
            }
        } else if (type === 'warning') {
            iconHtml = '<i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b; font-size: 15px; flex-shrink: 0;"></i>';
            accentBorder = '#f59e0b';
        }

        // Dolgulu parlak renkli kutu YASAK: Standart uygulama yüzeyi mikro-gradyanı
        const bg = isDark 
            ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' 
            : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)';
        const textColor = isDark ? '#f8fafc' : '#0f172a';
        const borderColor = isDark ? 'rgba(108, 92, 231, 0.3)' : '#cbd5e1';
        const shadow = isDark 
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)' 
            : '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.05)';

        const isMobile = (typeof window !== 'undefined' && window.innerWidth <= 768);

        const toast = document.createElement('div');
        toast.id = 'appGlobalToast';
        toast.setAttribute('role', 'alert');

        toast.style.cssText = `
            position: fixed;
            top: ${isMobile ? '16px' : '22px'};
            ${isMobile ? 'left: 50%; right: auto; width: calc(100% - 32px); max-width: 380px;' : 'right: 24px; left: auto; max-width: 420px;'}
            transform: ${isMobile ? 'translate(-50%, -12px)' : 'translateY(-12px)'};
            background: ${bg};
            color: ${textColor};
            padding: 10px 16px;
            border-radius: 8px;
            border: 1px solid ${borderColor};
            border-left: 3.5px solid ${accentBorder};
            box-shadow: ${shadow};
            font-family: 'ClassicAmpersand', 'Space Grotesk', system-ui, -apple-system, sans-serif;
            font-size: 12.5px;
            font-weight: 600;
            letter-spacing: 0.15px;
            line-height: 1.4;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 10px;
            opacity: 0;
            z-index: 999999999;
            pointer-events: auto;
            cursor: pointer;
            transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
            user-select: none;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        `;

        // Tek İkon Kuralı: Mesaj başındaki emojileri otomatik temizle
        let cleanText = String(message || '')
            .replace(/^[\s\uFE0F\u200D\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1FA00}-\u{1FAFF}\u{2300}-\u{23FF}]+[:\s-]*/u, '')
            .trim();

        // Parantez içi yönlendirmeleri ayıkla
        cleanText = cleanText.replace(/\s*\([^)]{1,25}\)$/, '');

        toast.innerHTML = `
            ${iconHtml}
            <span style="flex: 1; word-break: break-word;">${cleanText}</span>
            <span style="opacity: 0.5; font-size: 11px; margin-left: 4px; flex-shrink: 0;" title="Kapat">
                <i class="fa-solid fa-xmark"></i>
            </span>
        `;

        const dismissToast = () => {
            if (!toast || !toast.parentNode) return;
            toast.style.opacity = '0';
            toast.style.transform = isMobile ? 'translate(-50%, -12px)' : 'translateY(-12px)';
            setTimeout(() => {
                if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
            }, 240);
        };

        toast.addEventListener('click', dismissToast);
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = isMobile ? 'translate(-50%, 0)' : 'translateY(0)';
        });

        setTimeout(dismissToast, durationMs);
    } catch(err) {
        console.warn('showAppToast error:', err);
    }
};

/**
 * Modern Global AppDialog (Modal Onay ve Metin Giriş Ekranı)
 * Tarayıcının standart prompt() ve confirm() pencerelerini modern,
 * animasyonlu, tema uyumlu özel tasarım ekranımızla değiştirir.
 */
(function() {
    // Dialog stil tanımlarını bir kez ekle
    if (!document.getElementById('appDialogStyles')) {
        const style = document.createElement('style');
        style.id = 'appDialogStyles';
        style.textContent = `
            @keyframes appDialogBackdropFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes appDialogPopIn {
                from { opacity: 0; transform: scale(0.92) translateY(8px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .app-dialog-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(10, 14, 26, 0.72);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                z-index: 100000005;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 18px;
                animation: appDialogBackdropFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                box-sizing: border-box;
            }
            .app-dialog-card {
                width: 100%;
                max-width: 420px;
                border-radius: 18px;
                padding: 26px 28px;
                text-align: center;
                box-sizing: border-box;
                animation: appDialogPopIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                font-family: 'ClassicAmpersand', 'Inter', system-ui, -apple-system, sans-serif;
            }
            .app-dialog-card.theme-dark {
                background: rgba(18, 22, 38, 0.96);
                border: 1px solid rgba(255, 255, 255, 0.12);
                box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.85), 0 0 30px rgba(2, 132, 199, 0.15);
                color: #f8fafc;
            }
            .app-dialog-card.theme-light {
                background: #ffffff;
                border: 1px solid #cbd5e1;
                box-shadow: 0 25px 60px -10px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(15, 23, 42, 0.06);
                color: #0f172a;
            }
            .app-dialog-icon-badge {
                width: 54px;
                height: 54px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 16px;
                font-size: 22px;
                flex-shrink: 0;
            }
            .app-dialog-title {
                font-family: 'ClassicAmpersand', 'Space Grotesk', sans-serif;
                font-size: 17px;
                font-weight: 700;
                letter-spacing: -0.2px;
                margin: 0 0 8px 0;
                line-height: 1.35;
            }
            .app-dialog-desc {
                font-size: 13px;
                line-height: 1.55;
                margin: 0 0 20px 0;
                word-break: break-word;
            }
            .app-dialog-card.theme-dark .app-dialog-desc { color: #94a3b8; }
            .app-dialog-card.theme-light .app-dialog-desc { color: #64748b; }
            .app-dialog-input {
                width: 100%;
                height: 38px;
                padding: 0 12px;
                border-radius: 8px;
                font-size: 13px;
                font-family: inherit;
                box-sizing: border-box;
                margin-bottom: 20px;
                outline: none;
                transition: border-color 0.2s, box-shadow 0.2s;
            }
            .app-dialog-card.theme-dark .app-dialog-input {
                background: rgba(30, 41, 59, 0.7);
                border: 1px solid rgba(255, 255, 255, 0.16);
                color: #f8fafc;
            }
            .app-dialog-card.theme-dark .app-dialog-input:focus {
                border-color: #38bdf8;
                box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.25);
            }
            .app-dialog-card.theme-light .app-dialog-input {
                background: #f8fafc;
                border: 1px solid #cbd5e1;
                color: #0f172a;
            }
            .app-dialog-card.theme-light .app-dialog-input:focus {
                border-color: #0284c7;
                box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.2);
            }
            .app-dialog-actions {
                display: flex;
                gap: 10px;
                width: 100%;
                align-items: center;
            }
            .app-dialog-btn {
                flex: 1 1 0;
                min-width: 0;
                height: 36px;
                border-radius: 8px;
                font-family: 'ClassicAmpersand', 'Space Grotesk', sans-serif;
                font-size: 12.5px;
                font-weight: 700;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 7px;
                white-space: nowrap;
                border: none;
                transition: transform 0.15s, opacity 0.15s;
                user-select: none;
            }
            .app-dialog-btn:hover {
                transform: translateY(-1px);
            }
            .app-dialog-btn:active {
                transform: translateY(0);
            }
            .app-dialog-btn-cancel {
                background: rgba(148, 163, 184, 0.15);
                border: 1px solid rgba(148, 163, 184, 0.25);
            }
            .app-dialog-card.theme-dark .app-dialog-btn-cancel {
                color: #cbd5e1;
                background: rgba(30, 41, 59, 0.85);
                border-color: rgba(255, 255, 255, 0.12);
            }
            .app-dialog-card.theme-light .app-dialog-btn-cancel {
                color: #334155;
                background: #f1f5f9;
                border-color: #cbd5e1;
            }
            .app-dialog-btn-primary {
                background: linear-gradient(135deg, #0284c7, #2563eb);
                color: #ffffff;
                box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
            }
            .app-dialog-btn-danger {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: #ffffff;
                box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
            }
        `;
        document.head.appendChild(style);
    }

    const isAppDark = () => {
        return document.documentElement.getAttribute('data-theme') === 'dark' || 
               (document.body && document.body.getAttribute('data-theme') === 'dark');
    };

    window.AppDialog = {
        toast: function(message, type = 'info', durationMs = 2800) {
            if (typeof window.showAppToast === 'function') {
                window.showAppToast(message, type, durationMs);
            }
        },

        alert: function(message, type = 'info') {
            this.toast(message, type, 3800);
        },

        confirm: function(options = {}) {
            return new Promise((resolve) => {
                const title = options.title || 'Onay Gerekiyor';
                const message = options.message || options.text || '';
                const confirmText = options.confirmText || 'Onayla';
                const cancelText = options.cancelText || 'Vazgeç';
                const danger = !!options.danger;
                const icon = options.icon || (danger ? 'fa-triangle-exclamation' : 'fa-circle-question');

                const isDark = isAppDark();
                const themeClass = isDark ? 'theme-dark' : 'theme-light';

                const backdrop = document.createElement('div');
                backdrop.className = 'app-dialog-backdrop';

                const iconBg = danger ? 'rgba(239, 68, 68, 0.12)' : 'rgba(2, 132, 199, 0.12)';
                const iconBorder = danger ? 'rgba(239, 68, 68, 0.35)' : 'rgba(2, 132, 199, 0.35)';
                const iconColor = danger ? '#ef4444' : '#0284c7';
                const primaryBtnClass = danger ? 'app-dialog-btn-danger' : 'app-dialog-btn-primary';
                const confirmIcon = danger ? 'fa-trash-can' : 'fa-check';

                backdrop.innerHTML = `
                    <div class="app-dialog-card ${themeClass}" role="dialog" aria-modal="true">
                        <div class="app-dialog-icon-badge" style="background:${iconBg}; border:1.5px solid ${iconBorder}; color:${iconColor};">
                            <i class="fa-solid ${icon}"></i>
                        </div>
                        <h3 class="app-dialog-title">${title}</h3>
                        <p class="app-dialog-desc">${message}</p>
                        <div class="app-dialog-actions">
                            <button type="button" class="app-dialog-btn app-dialog-btn-cancel" id="appDialogCancelBtn">
                                <i class="fa-solid fa-xmark"></i>
                                <span>${cancelText}</span>
                            </button>
                            <button type="button" class="app-dialog-btn ${primaryBtnClass}" id="appDialogConfirmBtn">
                                <i class="fa-solid ${confirmIcon}"></i>
                                <span>${confirmText}</span>
                            </button>
                        </div>
                    </div>
                `;

                const cleanup = (result) => {
                    document.removeEventListener('keydown', onKey);
                    backdrop.style.opacity = '0';
                    backdrop.style.transition = 'opacity 0.15s ease-out';
                    setTimeout(() => {
                        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
                    }, 160);
                    resolve(result);
                };

                const onKey = (e) => {
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        cleanup(false);
                    } else if (e.key === 'Enter') {
                        e.preventDefault();
                        cleanup(true);
                    }
                };

                backdrop.querySelector('#appDialogCancelBtn').onclick = () => cleanup(false);
                backdrop.querySelector('#appDialogConfirmBtn').onclick = () => cleanup(true);
                backdrop.onclick = (e) => {
                    if (e.target === backdrop) cleanup(false);
                };

                document.addEventListener('keydown', onKey);
                document.body.appendChild(backdrop);
                backdrop.querySelector('#appDialogConfirmBtn').focus();
            });
        },

        prompt: function(options = {}) {
            return new Promise((resolve) => {
                const title = options.title || 'Değer Girin';
                const message = options.message || options.text || '';
                const defaultValue = options.defaultValue != null ? String(options.defaultValue) : '';
                const placeholder = options.placeholder || '';
                const confirmText = options.confirmText || 'Kaydet';
                const cancelText = options.cancelText || 'İptal';
                const inputType = options.inputType || 'text';
                const icon = options.icon || 'fa-pen-to-square';

                const isDark = isAppDark();
                const themeClass = isDark ? 'theme-dark' : 'theme-light';

                const backdrop = document.createElement('div');
                backdrop.className = 'app-dialog-backdrop';

                const iconBg = 'rgba(2, 132, 199, 0.12)';
                const iconBorder = 'rgba(2, 132, 199, 0.35)';
                const iconColor = '#0284c7';

                backdrop.innerHTML = `
                    <div class="app-dialog-card ${themeClass}" role="dialog" aria-modal="true">
                        <div class="app-dialog-icon-badge" style="background:${iconBg}; border:1.5px solid ${iconBorder}; color:${iconColor};">
                            <i class="fa-solid ${icon}"></i>
                        </div>
                        <h3 class="app-dialog-title">${title}</h3>
                        ${message ? `<p class="app-dialog-desc">${message}</p>` : ''}
                        <input type="${inputType}" class="app-dialog-input" id="appDialogPromptInput" placeholder="${placeholder}" value="${defaultValue.replace(/"/g, '&quot;')}" autocomplete="off" />
                        <div class="app-dialog-actions">
                            <button type="button" class="app-dialog-btn app-dialog-btn-cancel" id="appDialogCancelBtn">
                                <i class="fa-solid fa-xmark"></i>
                                <span>${cancelText}</span>
                            </button>
                            <button type="button" class="app-dialog-btn app-dialog-btn-primary" id="appDialogConfirmBtn">
                                <i class="fa-solid fa-check"></i>
                                <span>${confirmText}</span>
                            </button>
                        </div>
                    </div>
                `;

                const input = backdrop.querySelector('#appDialogPromptInput');

                const cleanup = (result) => {
                    document.removeEventListener('keydown', onKey);
                    backdrop.style.opacity = '0';
                    backdrop.style.transition = 'opacity 0.15s ease-out';
                    setTimeout(() => {
                        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
                    }, 160);
                    resolve(result);
                };

                const onKey = (e) => {
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        cleanup(null);
                    } else if (e.key === 'Enter') {
                        e.preventDefault();
                        cleanup(input.value);
                    }
                };

                backdrop.querySelector('#appDialogCancelBtn').onclick = () => cleanup(null);
                backdrop.querySelector('#appDialogConfirmBtn').onclick = () => cleanup(input.value);
                backdrop.onclick = (e) => {
                    if (e.target === backdrop) cleanup(null);
                };

                document.addEventListener('keydown', onKey);
                document.body.appendChild(backdrop);
                input.focus();
                input.select();
            });
        }
    };

    // Global native alert() yönlendirmesi:
    // Tarayıcının blocking ve çirkin alert popup'ını zarif bildirim kartımıza yönlendirir.
    if (typeof window !== 'undefined') {
        if (!window._nativeAlert) {
            window._nativeAlert = window.alert;
        }
        window.alert = function(msg) {
            const text = String(msg || '');
            let type = 'info';
            const lower = text.toLowerCase();
            if (lower.includes('hata') || lower.includes('başarısız') || lower.includes('failed') || lower.includes('error')) {
                type = 'error';
            } else if (lower.includes('başarı') || lower.includes('kaydedildi') || lower.includes('yüklendi') || lower.includes('tamamlandı')) {
                type = 'success';
            } else if (lower.includes('uyarı') || lower.includes('dikkat') || lower.includes('emin')) {
                type = 'warning';
            }
            window.showAppToast(text, type, 3800);
        };
    }
})();

/**
 * 🍏 Apple iPhone (.HEIC / .HEIF) Görsel Çözücü & Dönüştürücü (On-Demand & Idle Lazy Load)
 * Açılışı 1.3 MB hafifletmek için kütüphane ilk açılışta bloklamaz;
 * sistem boştayken arka planda veya HEIC fotoğraf seçildiği anda dinamik yüklenir.
 */
let _heicLoadingPromise = null;
window.ensureHeic2anyLoaded = function() {
    if (typeof heic2any === 'function') return Promise.resolve(true);
    if (_heicLoadingPromise) return _heicLoadingPromise;

    _heicLoadingPromise = new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
        s.integrity = 'sha384-OTofQ0MEeiSgh62havBcemCIK0gqj809wX6UA0uPISNMRnR6NZyCdGzX3SbLrgwL';
        s.crossOrigin = 'anonymous';
        s.onload = () => resolve(true);
        s.onerror = (err) => {
            console.warn('[HEIC] heic2any dinamik yüklenemedi:', err);
            resolve(false);
        };
        document.head.appendChild(s);
    });
    return _heicLoadingPromise;
};

// Sayfa açılıp stüdyo hazır olduktan sonra, sistem boştayken arka planda sessizce ön-yükle
if (typeof window !== 'undefined') {
    const _scheduleHeicPreload = () => {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => window.ensureHeic2anyLoaded(), { timeout: 6000 });
        } else {
            setTimeout(() => window.ensureHeic2anyLoaded(), 4000);
        }
    };
    if (document.readyState === 'complete') {
        _scheduleHeicPreload();
    } else {
        window.addEventListener('load', _scheduleHeicPreload, { once: true });
    }
}

window.convertHeicIfNeeded = async function(file) {
    if (!file) return file;
    const name = (file.name || '').toLowerCase();
    const type = (file.type || '').toLowerCase();
    const isHeic = name.endsWith('.heic') || name.endsWith('.heif') || type.includes('heic') || type.includes('heif');
    if (!isHeic) return file;

    // 1. heic2any kütüphanesi henüz inmediyse ihtiyaç anında hemen dinamik olarak indir ve hazırla
    if (typeof heic2any !== 'function') {
        if (typeof window.showAppLoading === 'function') {
            window.showAppLoading('iPhone Fotoğrafı İşleniyor...', 'Gerekli dönüştürücü hazırlanıyor...');
        }
        await window.ensureHeic2anyLoaded();
    }

    // 2. heic2any kütüphanesi aktifse otomatik dönüştür
    if (typeof heic2any === 'function') {
        try {
            if (typeof window.showAppLoading === 'function') {
                window.showAppLoading('iPhone Fotoğrafı İşleniyor...', 'HEIC görseli yüksek kalite JPG formatına dönüştürülüyor...');
            }
            const blobResult = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.94
            });
            const finalBlob = Array.isArray(blobResult) ? blobResult[0] : blobResult;
            const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
            const convertedFile = new File([finalBlob], newName, { type: 'image/jpeg' });
            if (typeof window.hideAppLoading === 'function') {
                window.hideAppLoading();
            }
            return convertedFile;
        } catch(err) {
            console.warn('[HEIC] heic2any dönüştürme uyarısı:', err);
            if (typeof window.hideAppLoading === 'function') window.hideAppLoading();
        }
    }

    // 3. Kütüphane yoksa veya dönüştürme başarısız olduysa rehberlik modalı
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'info',
            title: 'Apple iPhone (.HEIC) Fotoğrafı',
            html: `<div style="font-size:13px; line-height:1.6; color:#cbd5e1; text-align:left; margin-top:8px;">
                Seçtiğiniz fotoğraf Apple <b>.HEIC</b> formatındadır.<br><br>
                Tarayıcınızda doğrudan ve en yüksek hızda çalışabilmek için fotoğrafı <b>JPG</b> veya <b>PNG</b> olarak yüklemeniz önerilir.<br><br>
                <b>💡 İpucu:</b> iPhone'unuzda <i>Ayarlar &gt; Kamera &gt; Biçimler</i> menüsünden <b>"En Yüksek Uyumluluk"</b> seçeneğini aktif ederek fotoğraflarınızın doğrudan JPG kaydedilmesini sağlayabilirsiniz.
            </div>`,
            background: '#1e293b',
            color: '#fff',
            confirmButtonText: 'Tamam, Anladım',
            confirmButtonColor: '#00CEC9'
        });
    } else {
        alert('Seçtiğiniz fotoğraf .HEIC formatındadır. Lütfen JPG veya PNG formatında bir görsel yükleyin.');
    }
    return null;
};



