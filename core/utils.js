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
    el.addEventListener('dblclick', function(e) {
        e.stopPropagation();
        
        if (el.isContentEditable) return;
        
        // Sürüklemeyi geçici olarak durdur (core/drag.js ile uyumlu)
        el.dataset.editingText = '1';
        
        el.contentEditable = 'true';
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
    });
}
