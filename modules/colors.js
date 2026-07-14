/**
 * ============================================
 * COLORS MODULE
 * modules/colors.js
 * ============================================
 * 
 * Bağımlılıklar:
 * - core/utils.js
 * 
 * Kullanılan yerler:
 * - modules/photo.js
 * - ui/element.js vb.
 */

function processPixels(sync = false, applyFiltersAfterLoad = false) {
    globalApplyFiltersAfterLoad = applyFiltersAfterLoad;
    if(pixelTimeout) clearTimeout(pixelTimeout);
    if(sync) {
        applyPixelAdjustments();
    } else {
        pixelTimeout = setTimeout(() => {
            applyPixelAdjustments();
        }, 50);
    }
}

function processHSL() {
    processPixels();
}

function applyPixelAdjustments() {
    if(typeof isShowingBefore !== 'undefined' && isShowingBefore) {
        if(typeof uploadedImgUrl !== 'undefined') photoLayer.style.backgroundImage = 'url("'+uploadedImgUrl+'")';
        return;
    }
    
    if(!originalImageData || !workingCtx) {
        cacheOriginalImageForPixels();
        return;
    }
    
    const sv = document.getElementById('shadowsCtrl') ? +document.getElementById('shadowsCtrl').value : 0;
    const hv = document.getElementById('highlightsCtrl') ? +document.getElementById('highlightsCtrl').value : 0;
    const bl = document.getElementById('blacksCtrl') ? +document.getElementById('blacksCtrl').value : 0;
    const wh = document.getElementById('whitesCtrl') ? +document.getElementById('whitesCtrl').value : 0;
    
    // UI values update
    if(document.getElementById('shadowsVal')) document.getElementById('shadowsVal').textContent = sv;
    if(document.getElementById('highlightsVal')) document.getElementById('highlightsVal').textContent = hv;
    if(document.getElementById('blacksVal')) document.getElementById('blacksVal').textContent = bl;
    if(document.getElementById('whitesVal')) document.getElementById('whitesVal').textContent = wh;

    // HSL Values
    const hslColors = ['red','orange','yellow','green','blue','purple','magenta'];
    let hasHsl = false;
    let vals = {h:{}, s:{}, l:{}};
    hslColors.forEach(c => {
        let hEl = document.querySelector('.hsl-slider[data-type="h"][data-color="'+c+'"]');
        let sEl = document.querySelector('.hsl-slider[data-type="s"][data-color="'+c+'"]');
        let lEl = document.querySelector('.hsl-slider[data-type="l"][data-color="'+c+'"]');
        let h = hEl ? +hEl.value : 0;
        let s = sEl ? +sEl.value : 0;
        let l = lEl ? +lEl.value : 0;
        vals.h[c] = h; vals.s[c] = s; vals.l[c] = l;
        if(h!==0 || s!==0 || l!==0) hasHsl = true;
    });

    if(sv === 0 && hv === 0 && bl === 0 && wh === 0 && !hasHsl) {
        if(typeof uploadedImgUrl !== 'undefined') photoLayer.style.backgroundImage = 'url("'+uploadedImgUrl+'")';
        return;
    }

    const src = originalImageData.data;
    const w = originalImageData.width;
    const h = originalImageData.height;
    const newImgData = workingCtx.createImageData(w, h);
    const dst = newImgData.data;

    // Shadows/Highlights logic factors
    const shadowFactor = sv / 100; // -1 to 1
    const highlightFactor = hv / 100; // -1 to 1
    const blackFactor = bl / 100; // -1 to 1
    const whiteFactor = wh / 100; // -1 to 1

    for(let i=0; i<src.length; i+=4) {
        let r = src[i], g = src[i+1], b = src[i+2], a = src[i+3];
        if(a === 0) {
            dst[i]=0; dst[i+1]=0; dst[i+2]=0; dst[i+3]=0;
            continue;
        }
        
        let hsl = rgbToHslFast(r, g, b);
        
        // --- 1. SHADOWS & HIGHLIGHTS ---
        let lum = hsl[2];
        
        // Shadows: affect only darker pixels (lum < 0.5)
        if (shadowFactor !== 0) {
            let weight = 1 - Math.min(1, lum / 0.5); // 1 at lum=0, 0 at lum=0.5
            weight = weight * weight; // ease-out
            lum += shadowFactor * weight * 0.4;
        }
        
        // Highlights: affect only brighter pixels (lum > 0.5)
        if (highlightFactor !== 0) {
            let weight = Math.max(0, (lum - 0.5) / 0.5); // 0 at lum=0.5, 1 at lum=1.0
            weight = weight * weight;
            lum += highlightFactor * weight * 0.4;
        }

        // Blacks & Whites
        if (blackFactor !== 0) {
            lum += blackFactor * (1 - lum) * 0.2;
        }
        if (whiteFactor !== 0) {
            lum += whiteFactor * lum * 0.2;
        }

        // Clamp
        if(lum < 0) lum = 0;
        if(lum > 1) lum = 1;
        hsl[2] = lum;

        // --- 2. HSL ADJUSTMENTS ---
        if (hasHsl) {
            let category = getColorCategory(hsl[0]);
            let hShift = vals.h[category];
            let sShift = vals.s[category];
            let lShift = vals.l[category];
            
            if(hShift !== 0 || sShift !== 0 || lShift !== 0) {
                hsl[0] += (hShift * 0.3) / 360;
                if(hsl[0] < 0) hsl[0] += 1;
                if(hsl[0] > 1) hsl[0] -= 1;
                
                hsl[1] += (sShift / 100);
                if(hsl[1] < 0) hsl[1] = 0;
                if(hsl[1] > 1) hsl[1] = 1;
                
                hsl[2] += (lShift / 200);
                if(hsl[2] < 0) hsl[2] = 0;
                if(hsl[2] > 1) hsl[2] = 1;
            }
        }
        
        let rgb = hslToRgbFast(hsl[0], hsl[1], hsl[2]);
        dst[i] = rgb[0];
        dst[i+1] = rgb[1];
        dst[i+2] = rgb[2];
        dst[i+3] = a;
    }
    
    workingCtx.putImageData(newImgData, 0, 0);
    photoLayer.style.backgroundImage = 'url("' + workingCanvas.toDataURL('image/jpeg', 0.9) + '")';
}

function applyShadowHighlight(){
    if(typeof shadowOverlay !== 'undefined' && shadowOverlay) shadowOverlay.style.background = 'transparent';
    if(typeof highlightOverlay !== 'undefined' && highlightOverlay) highlightOverlay.style.background = 'transparent';
    if(typeof processPixels === 'function') processPixels();
}

function autoEnhancePhoto() {
    if (typeof uploadedImgUrl === 'undefined' || !uploadedImgUrl) {
        alert('Lütfen önce bir fotoğraf yükleyin!');
        return;
    }
    
    const btn = document.querySelector('button[onclick="autoEnhancePhoto()"]');
    let oldText = '<i class="fa-solid fa-wand-magic-sparkles"></i> Otomatik İyileştir (AI)';
    if(btn) {
        oldText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analiz Ediliyor...';
    }
    
    const img = new Image();
    img.onload = function() {
        const c = document.createElement('canvas');
        c.width = 100; c.height = 100;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, 100, 100);
        
        const data = ctx.getImageData(0,0,100,100).data;
        let rSum = 0, gSum = 0, bSum = 0;
        let lums = [];
        
        for(let i=0; i<data.length; i+=4) {
            const r = data[i], g = data[i+1], b = data[i+2];
            rSum += r; gSum += g; bSum += b;
            const lum = 0.299*r + 0.587*g + 0.114*b;
            lums.push(lum);
        }
        
        const pixels = data.length / 4;
        const avgR = rSum / pixels;
        const avgG = gSum / pixels;
        const avgB = bSum / pixels;
        const avgLum = 0.299*avgR + 0.587*avgG + 0.114*avgB;
        
        let lumVar = 0;
        for(let i=0; i<lums.length; i++) {
            lumVar += Math.pow(lums[i] - avgLum, 2);
        }
        const stdDev = Math.sqrt(lumVar / pixels);
        
        // Reset all first
        Object.keys(FILTER_DEFAULTS).forEach(id => {
            if(document.getElementById(id)) document.getElementById(id).value = FILTER_DEFAULTS[id];
        });
        
        let exp = 100, con = 100, sat = 100;
        let shadows = 0, highlights = 0, clarity = 0, vib = 0, temp = 0;
        
        // 1. Exposure & Shadows
        if (avgLum < 110) {
            exp = 100 + ((110 - avgLum) * 0.15); 
            shadows = (110 - avgLum) * 1.0; 
            if(shadows > 80) shadows = 80;
        } else if (avgLum > 170) {
            exp = 100 - ((avgLum - 170) * 0.15);
            highlights = -((avgLum - 170) * 1.0);
            if(highlights < -80) highlights = -80;
        }
        
        // 2. Contrast & Clarity
        if (stdDev < 55) {
            con = 100 + ((55 - stdDev) * 1.2);
            clarity = (55 - stdDev) * 1.5;
            if(clarity > 50) clarity = 50;
        }
        
        // 3. Color Temperature
        const colorDiff = avgB - avgR;
        if (colorDiff > 20) {
            temp = colorDiff * 0.6; 
            if(temp > 40) temp = 40;
        } else if (colorDiff < -20) {
            temp = colorDiff * 0.4;
            if(temp < -30) temp = -30;
        }
        
        // 4. Saturation
        const maxAvg = Math.max(avgR, avgG, avgB);
        const minAvg = Math.min(avgR, avgG, avgB);
        const avgSat = maxAvg - minAvg;
        if (avgSat < 25 && stdDev > 20) { 
            sat = 100 + ((25 - avgSat) * 1.2);
            vib = (25 - avgSat) * 1.5;
            if(vib > 40) vib = 40;
        }
        
        // Set slider values
        if(document.getElementById('exposure')) document.getElementById('exposure').value = Math.round(exp);
        if(document.getElementById('contrast')) document.getElementById('contrast').value = Math.round(con);
        if(document.getElementById('saturate')) document.getElementById('saturate').value = Math.round(sat);
        if(document.getElementById('shadowsCtrl')) document.getElementById('shadowsCtrl').value = Math.round(shadows);
        if(document.getElementById('highlightsCtrl')) document.getElementById('highlightsCtrl').value = Math.round(highlights);
        if(document.getElementById('clarityCtrl')) document.getElementById('clarityCtrl').value = Math.round(clarity);
        if(document.getElementById('vibranceCtrl')) document.getElementById('vibranceCtrl').value = Math.round(vib);
        if(document.getElementById('tempCtrl')) document.getElementById('tempCtrl').value = Math.round(temp);
        
        // Apply all at once - no animation, no delay
        if(typeof applyPhotoFilters === 'function') applyPhotoFilters();
        if(typeof processPixels === 'function') processPixels(true);
        
        if(btn) {
            btn.innerHTML = '<i class="fa-solid fa-check"></i> İyileştirme Başarılı!';
            setTimeout(() => { btn.innerHTML = oldText; }, 2000);
        }
    };
    img.src = uploadedImgUrl;
}

function toggleBeforeAfter() {
    isShowingBefore = !isShowingBefore;
    const btn = document.getElementById('btnBeforeAfter');
    if(!btn) return;
    
    if(isShowingBefore) {
        if(typeof photoLayer !== 'undefined' && photoLayer) {
            photoLayer.style.filter = 'none';
            if(typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl) photoLayer.style.backgroundImage = 'url("'+uploadedImgUrl+'")';
        }
        if(typeof vignetteLayer !== 'undefined' && vignetteLayer) vignetteLayer.style.opacity = '0';
        document.querySelectorAll('.photo-panel').forEach(p=>p.style.filter='none');
        
        btn.style.backgroundColor = '#f59e0b';
        btn.style.color = '#fff';
        btn.innerHTML = '<i class="fa-solid fa-eye"></i> Orijinal Haline Bakıyorsunuz (Tıkla Dön)';
    } else {
        btn.style.backgroundColor = '#334155';
        btn.style.color = '#cbd5e1';
        btn.innerHTML = '<i class="fa-solid fa-code-compare"></i> Öncesi / Sonrası Karşılaştır';
        
        if(typeof applyPhotoFilters === 'function') applyPhotoFilters();
        const v = document.getElementById('vignette') ? +document.getElementById('vignette').value : 0;
        if(typeof vignetteLayer !== 'undefined' && vignetteLayer) vignetteLayer.style.opacity = v / 100;
        if(typeof processHSL === 'function') processHSL();
    }
}

function cacheOriginalImageForPixels() {
    const bg = photoLayer.style.backgroundImage;
    if(!bg || bg === 'none') return;
    const url = bg.slice(5, -2).replace(/['"]/g, '');
    
    let img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
        let w = img.width;
        let h = img.height;
        const MAX_SIZE = 1600; // Limit processing resolution for 60fps performance
        if(w > MAX_SIZE || h > MAX_SIZE) {
            let ratio = Math.min(MAX_SIZE/w, MAX_SIZE/h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
        }
        workingCanvas = document.createElement('canvas');
        workingCanvas.width = w;
        workingCanvas.height = h;
        workingCtx = workingCanvas.getContext('2d', {willReadFrequently:true});
        workingCtx.drawImage(img, 0, 0, w, h);
        originalImageData = workingCtx.getImageData(0, 0, w, h);
        processPixels();
    };
    img.src = url;
}

