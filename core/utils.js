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
    const startEditing = function(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (el.isContentEditable) return;
        
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

        const finishEdit = function() {
            el.contentEditable = 'false';
            el.style.cursor = '';
            delete el.dataset.editingText;
            
            if (!el.textContent.trim()) {
                el.textContent = 'Metin';
            }
            
            // Restore handles if still selected
            if (el.classList.contains('el-selected') && typeof window.addTextHandles === 'function') {
                window.addTextHandles(el);
            }
            
            el.removeEventListener('blur', finishEdit);
            el.removeEventListener('keydown', handleKey);
        };

        const handleKey = function(ev) {
            // Enter'a basınca kaydet, Shift+Enter'a basınca alt satıra geç
            if (ev.key === 'Enter' && !ev.shiftKey) {
                ev.preventDefault();
                finishEdit();
                window.getSelection().removeAllRanges();
            }
        };

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

        const toast = document.createElement('div');
        toast.id = 'appGlobalToast';
        toast.setAttribute('role', 'alert');

        // Renk paleti - Varsayılan / info: Klasik Emlak Stüdiom Derin Kraliyet Mavisi (#1d4ed8 -> #2563eb)
        let bg = 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)';
        let defaultIcon = '💡';
        let shadow = '0 10px 25px -5px rgba(37, 99, 235, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.35)';

        if (type === 'success') {
            bg = 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
            defaultIcon = '✨';
            shadow = '0 10px 25px -5px rgba(16, 185, 129, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.35)';
        } else if (type === 'error') {
            bg = 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)';
            defaultIcon = '⚠️';
            shadow = '0 10px 25px -5px rgba(239, 68, 68, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.35)';
        } else if (type === 'warning') {
            bg = 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)';
            defaultIcon = '⚡';
            shadow = '0 10px 25px -5px rgba(245, 158, 11, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.35)';
        }

        const isMobile = (typeof window !== 'undefined' && window.innerWidth <= 768);

        toast.style.cssText = `
            position: fixed;
            top: ${isMobile ? '16px' : '24px'};
            ${isMobile ? 'left: 50%; right: auto; width: calc(100% - 32px); max-width: 380px;' : 'right: 24px; left: auto; max-width: 440px;'}
            transform: ${isMobile ? 'translate(-50%, -16px)' : 'translateY(-16px)'};
            background: ${bg};
            color: #ffffff;
            padding: 12px 20px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.25);
            box-shadow: ${shadow};
            font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            font-size: 13.5px;
            font-weight: 600;
            letter-spacing: 0.2px;
            line-height: 1.45;
            display: flex;
            align-items: center;
            justify-content: ${isMobile ? 'center' : 'flex-start'};
            gap: 10px;
            opacity: 0;
            z-index: 999999999;
            pointer-events: auto;
            cursor: pointer;
            transition: opacity 0.26s cubic-bezier(0.16, 1, 0.3, 1), transform 0.26s cubic-bezier(0.16, 1, 0.3, 1);
            user-select: none;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        `;

        // Eğer mesaj başında emoji veya ikon yoksa varsayılan ikon ekle
        const msgStr = String(message || '');
        const hasLeadingEmoji = /^[^\p{L}\p{N}\s]/u.test(msgStr.trim());
        const contentHtml = hasLeadingEmoji ? msgStr : `<span style="font-size:16px;">${defaultIcon}</span> <span>${msgStr}</span>`;
        toast.innerHTML = contentHtml;

        const dismissToast = () => {
            if (!toast || !toast.parentNode) return;
            toast.style.opacity = '0';
            toast.style.transform = isMobile ? 'translate(-50%, -16px)' : 'translateY(-16px)';
            setTimeout(() => {
                if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
            }, 280);
        };

        toast.addEventListener('click', dismissToast);
        document.body.appendChild(toast);

        // Giriş animasyonu
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = isMobile ? 'translate(-50%, 0)' : 'translateY(0)';
        });

        setTimeout(dismissToast, durationMs);
    } catch(err) {
        console.warn('showAppToast error:', err);
    }
};



