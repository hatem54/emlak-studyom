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
            let defSize = parseFloat(el.dataset.defaultFont);
            if (!defSize || isNaN(defSize) || defSize <= 0) {
                const sf = typeof scaleFactor !== 'undefined' && scaleFactor > 0 ? scaleFactor : 1;
                defSize = Math.round(60 / sf);
            }
            el.style.fontSize = defSize + 'px';
            el.dataset.rotation = '0';
            const currentScale = el.dataset.scale || 1;
            el.style.transform = `rotate(0deg) scale(${currentScale})`;
            
            const fsSlider = document.getElementById('elFontSize') || document.getElementById('fontSize');
            if (fsSlider) fsSlider.value = defSize;
            const fsVal = document.getElementById('elFontSizeVal') || document.getElementById('fontSizeVal');
            if (fsVal) fsVal.textContent = defSize + 'px';
            
            const rotSlider = document.getElementById('elRotate');
            if (rotSlider) rotSlider.value = 0;
            const rotVal = document.getElementById('elRotateVal');
            if (rotVal) rotVal.textContent = '0°';
            
            if (typeof saveState === 'function') saveState();
        });
        return;
    }

    if (el.dataset.inlineEditEnabled) return;
    el.dataset.inlineEditEnabled = '1';

    const startEditing = function(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (el.isContentEditable) return;
        
        // ⚡ Çift tıklamada sol paneldeki düzenleme ekranını aç ve font sekmesine geç
        if (typeof selectElement === 'function') {
            selectElement(el, false, false, true);
        } else if (typeof window.selectElement === 'function') {
            window.selectElement(el, false, false, true);
        }
        const elSettings = document.getElementById('elSettings');
        if (elSettings) elSettings.style.display = 'block';
        if (typeof loadElSettings === 'function') loadElSettings(el);
        if (typeof loadElFont === 'function') loadElFont(el);
        if (typeof switchTab === 'function') switchTab('font');

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



