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


window.applyPixelAdjustmentsToImageData = function(src, dst, width, height) {
    const sv = document.getElementById('shadowsCtrl') ? +document.getElementById('shadowsCtrl').value : 0;
    const hv = document.getElementById('highlightsCtrl') ? +document.getElementById('highlightsCtrl').value : 0;
    const bl = document.getElementById('blacksCtrl') ? +document.getElementById('blacksCtrl').value : 0;
    const wh = document.getElementById('whitesCtrl') ? +document.getElementById('whitesCtrl').value : 0;
    const tmp = document.getElementById('tempCtrl') ? +document.getElementById('tempCtrl').value : 0;
    const tnt = document.getElementById('tintCtrl') ? +document.getElementById('tintCtrl').value : 0;
    const vbr = document.getElementById('vibranceCtrl') ? +document.getElementById('vibranceCtrl').value : 0;
    const shp = document.getElementById('sharpnessCtrl') ? +document.getElementById('sharpnessCtrl').value : 0;
    
    // HSL Values
    const hslColors = ['red','orange','yellow','green','blue','purple','magenta'];
    let hasHsl = false;
    let vals = {h:{}, s:{}, l:{}};
    hslColors.forEach(cl => {
        let hEl = document.querySelector('.hsl-slider[data-type="h"][data-color="'+cl+'"]');
        let sEl = document.querySelector('.hsl-slider[data-type="s"][data-color="'+cl+'"]');
        let lEl = document.querySelector('.hsl-slider[data-type="l"][data-color="'+cl+'"]');
        let h = hEl ? +hEl.value : 0;
        let s = sEl ? +sEl.value : 0;
        let l = lEl ? +lEl.value : 0;
        vals.h[cl] = h; vals.s[cl] = s; vals.l[cl] = l;
        if(h!==0 || s!==0 || l!==0) hasHsl = true;
    });

    const hasCustomColor = (window.customColorState && window.customColorState.active &&
        ((window.customColorState.shiftH || 0) !== 0 || (window.customColorState.shiftS || 0) !== 0 || (window.customColorState.shiftL || 0) !== 0));
    if(sv === 0 && hv === 0 && bl === 0 && wh === 0 && tmp === 0 && tnt === 0 && vbr === 0 && shp === 0 && !hasHsl && !hasCustomColor) return false;

    // Safety checks for 1D arrays
    if (!width || !height) {
        width = Math.sqrt(src.length / 4);
        height = width;
    }

    const shadowFactor = sv / 100;
    const highlightFactor = hv / 100;
    const blackFactor = bl / 100;
    const whiteFactor = wh / 100;
    const tempFactor = tmp / 100;
    const tintFactor = tnt / 100;
    const vibranceFactor = vbr / 100;
    const sharpFactor = shp / 100;

    for(let y=0; y<height; y++) {
        for(let x=0; x<width; x++) {
            let i = (y * width + x) * 4;
            let r = src[i], g = src[i+1], b = src[i+2], a = src[i+3];
            
            if(a === 0) {
                dst[i]=0; dst[i+1]=0; dst[i+2]=0; dst[i+3]=0;
                continue;
            }
            
            // SHARPEN (Convolution Matrix)
            if (sharpFactor > 0 && y > 0 && y < height-1 && x > 0 && x < width-1) {
                let c = 1 + 4 * sharpFactor;
                let n = -sharpFactor;
                
                let up = i - width * 4;
                let down = i + width * 4;
                let left = i - 4;
                let right = i + 4;
                
                let sharpR = src[i]*c + (src[up]+src[down]+src[left]+src[right])*n;
                let sharpG = src[i+1]*c + (src[up+1]+src[down+1]+src[left+1]+src[right+1])*n;
                let sharpB = src[i+2]*c + (src[up+2]+src[down+2]+src[left+2]+src[right+2])*n;
                
                r = Math.min(255, Math.max(0, sharpR));
                g = Math.min(255, Math.max(0, sharpG));
                b = Math.min(255, Math.max(0, sharpB));
            }
            
            // WHITE BALANCE
            if (tempFactor > 0) {
                r += tempFactor * 50; g += tempFactor * 20; b -= tempFactor * 40;
            } else if (tempFactor < 0) {
                r += tempFactor * 40; b -= tempFactor * 50;
            }
            if (tintFactor > 0) {
                r += tintFactor * 30; b += tintFactor * 30; g -= tintFactor * 40;
            } else if (tintFactor < 0) {
                g -= tintFactor * 40; r += tintFactor * 30; b += tintFactor * 30;
            }
            r = Math.min(255, Math.max(0, r)); g = Math.min(255, Math.max(0, g)); b = Math.min(255, Math.max(0, b));
            
            let hsl = rgbToHslFast(r, g, b);
            
            // VIBRANCE (Akıllı Canlılık - Lightroom Standardı)
            if (vibranceFactor !== 0) {
                let s = hsl[1];
                if (vibranceFactor < 0) {
                    // Negatif Canlılık: Tüm renkleri homojen ve orantılı olarak griye çeker; -1.0'da %100 monokrom
                    s = Math.max(0, Math.min(1, s * (1.0 + vibranceFactor)));
                } else {
                    // Pozitif Canlılık: Düşük doymuş renklere daha çok, doymuş renklere daha az etki eder (patlamayı önler)
                    let vBoost = (1.0 - s) * 1.25;
                    let hue = hsl[0];
                    if (hue >= 0.04 && hue <= 0.14) vBoost *= 0.80; // İnsan teni ve aşırı sıcak tonlar
                    s = Math.max(0, Math.min(1, s * (1.0 + vibranceFactor * vBoost)));
                }
                hsl[1] = s;
            }
            
            // TONE (Profesyonel Fotoğrafik Lightroom Eğrisi)
            let lum = hsl[2];
            if (lum > 0.0001) {
                let newLum = lum;
                if (shadowFactor !== 0) {
                    if (shadowFactor > 0) {
                        let sExp = 1.0 / (1.0 + shadowFactor * 1.35 * (1.0 - lum) * (1.0 - lum));
                        newLum = Math.pow(newLum, sExp);
                    } else {
                        let sExp = 1.0 + (-shadowFactor) * 0.9 * (1.0 - lum) * (1.0 - lum);
                        newLum = Math.pow(newLum, sExp);
                    }
                }
                if (highlightFactor !== 0) {
                    let invY = Math.max(0, Math.min(1, 1.0 - newLum));
                    let hWeight = Math.pow(newLum, 1.5);
                    if (highlightFactor < 0) {
                        let hComp = -highlightFactor;
                        let hExp = 1.0 / (1.0 + hComp * 1.35 * hWeight);
                        newLum = 1.0 - Math.pow(invY, hExp);
                    } else {
                        let hBoost = highlightFactor;
                        let hExp = 1.0 + hBoost * 1.35 * hWeight;
                        newLum = 1.0 - Math.pow(invY, hExp);
                    }
                }
                if (blackFactor !== 0) {
                    if (blackFactor > 0) {
                        let bWeight = Math.pow(Math.max(0, Math.min(1, 1.0 - newLum * 1.6)), 1.2);
                        newLum += blackFactor * 0.35 * bWeight * (1.0 - newLum * 0.4);
                    } else {
                        let bComp = -blackFactor;
                        let bWeight = Math.pow(Math.max(0, Math.min(1, 1.0 - newLum * 1.7)), 1.25);
                        newLum = Math.max(0, newLum - bComp * 0.52 * bWeight * Math.pow(Math.max(0, newLum), 0.82));
                    }
                }
                if (whiteFactor !== 0) {
                    let wWeight = Math.pow(Math.max(0, Math.min(1, (newLum - 0.20) / 0.80)), 1.3);
                    if (whiteFactor > 0) {
                        let invY = Math.max(0, Math.min(1, 1.0 - newLum));
                        let wExp = 1.0 + whiteFactor * 1.45 * wWeight;
                        newLum = 1.0 - Math.pow(invY, wExp);
                    } else {
                        let wComp = -whiteFactor;
                        newLum -= wComp * 0.38 * wWeight * Math.pow(Math.max(0, newLum), 0.85);
                    }
                }
                hsl[2] = Math.max(0, Math.min(1, newLum));
            }

            if (hasHsl) {
                let category = getColorCategory(hsl[0]);
                let hShift = vals.h[category], sShift = vals.s[category], lShift = vals.l[category];
                if(hShift !== 0 || sShift !== 0 || lShift !== 0) {
                    hsl[0] += (hShift * 0.3) / 360;
                    if(hsl[0] < 0) hsl[0] += 1; if(hsl[0] > 1) hsl[0] -= 1;
                    hsl[1] += (sShift / 100);
                    if(hsl[1] < 0) hsl[1] = 0; if(hsl[1] > 1) hsl[1] = 1;
                    hsl[2] += (lShift / 200);
                    if(hsl[2] < 0) hsl[2] = 0; if(hsl[2] > 1) hsl[2] = 1;
                }
            }

            if (window.customColorState && window.customColorState.active) {
                const cs = window.customColorState;
                const cShiftH = cs.shiftH || 0, cShiftS = cs.shiftS || 0, cShiftL = cs.shiftL || 0;
                if (cShiftH !== 0 || cShiftS !== 0 || cShiftL !== 0) {
                    let distH = Math.abs(hsl[0] - cs.h);
                    if (distH > 0.5) distH = 1.0 - distH;
                    let tol = Math.max(0.015, (cs.range !== undefined ? cs.range : 0.20) * 0.45);
                    if (distH < tol) {
                        let wHue = 1.0 - (distH / tol);
                        let distS = Math.abs(hsl[1] - cs.s);
                        let distL = Math.abs(hsl[2] - cs.l);
                        let wSat = Math.max(0, 1.0 - (distS / 0.50));
                        let wLum = Math.max(0, 1.0 - (distL / 0.55));
                        let wTarget = wHue * wSat * wLum;
                        if (wTarget > 0.001) {
                            hsl[0] = (hsl[0] + (cShiftH / 100.0) * 0.25 * wTarget) % 1.0;
                            if (hsl[0] < 0) hsl[0] += 1.0;
                            hsl[1] = Math.max(0, Math.min(1, hsl[1] + (cShiftS / 100.0) * 0.60 * wTarget));
                            hsl[2] = Math.max(0, Math.min(1, hsl[2] + (cShiftL / 100.0) * 0.50 * wTarget));
                        }
                    }
                }
            }
            let rgb = hslToRgbFast(hsl[0], hsl[1], hsl[2]);
            dst[i] = rgb[0]; dst[i+1] = rgb[1]; dst[i+2] = rgb[2]; dst[i+3] = a;
        }
    }
    return true;
};

function applyPixelAdjustments() {
    if(typeof isShowingBefore !== 'undefined' && isShowingBefore) {
        if(typeof uploadedImgUrl !== 'undefined') photoLayer.style.backgroundImage = 'url("'+uploadedImgUrl+'")';
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

    // WebGL Motoru Etkinse Doğrudan GPU Render Çağır (Sıfır CPU Gecikmesi)
    if (window.WebGLPhotoEngine && window.WebGLPhotoEngine.initialized) {
        if (typeof applyPhotoFilters === 'function') {
            applyPhotoFilters();
        }
        return;
    }
    
    let activeImageData = originalImageData;
    let activeCtx = workingCtx;
    let activeCanvas = workingCanvas;
    
    if (isQualityPreviewMode && previewImageData && previewWorkingCtx && previewWorkingCanvas) {
        activeImageData = previewImageData;
        activeCtx = previewWorkingCtx;
        activeCanvas = previewWorkingCanvas;
    }

    if(!activeImageData || !activeCtx) {
        cacheOriginalImageForPixels();
        return;
    }

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

    if(sv === 0 && hv === 0 && bl === 0 && wh === 0 && tmp === 0 && tnt === 0 && vbr === 0 && shp === 0 && !hasHsl) {
        const rawImg = (typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl) ? uploadedImgUrl : '';
        let targetEls = document.querySelectorAll('.photo-inner-zoom');
        if (targetEls.length === 0) {
            let pl = document.getElementById('photo-layer');
            if (pl) targetEls = [pl];
        }
        targetEls.forEach(targetEl => {
            if (rawImg) targetEl.style.backgroundImage = 'url("' + rawImg + '")';
            let parent = targetEl.classList.contains('photo-inner-zoom') ? targetEl.parentElement : targetEl;
            if (parent) {
                if (rawImg) parent.dataset.savedBg = 'url("' + rawImg + '")';
                parent.style.backgroundImage = 'none';
            }
            if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(parent);
        });
        if (typeof photoLayer !== 'undefined' && photoLayer) {
            if (rawImg) photoLayer.dataset.savedBg = 'url("' + rawImg + '")';
            photoLayer.style.backgroundImage = 'none';
        }
        document.querySelectorAll('.photo-panel').forEach(p => {
            let inner = p.querySelector('.photo-inner-zoom') || p;
            if (rawImg) inner.style.backgroundImage = 'url("' + rawImg + '")';
            p.dataset.savedBg = 'url("' + rawImg + '")';
            p.style.backgroundImage = 'none';
            if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p);
        });
        return;
    }

    const src = activeImageData.data;
    const w = activeImageData.width;
    const h = activeImageData.height;
    const newImgData = activeCtx.createImageData(w, h);
    const dst = newImgData.data;

    const wasAdjusted = window.applyPixelAdjustmentsToImageData(src, dst, activeCanvas.width, activeCanvas.height);
    if (!wasAdjusted) {
        const rawImg = (typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl) ? uploadedImgUrl : '';
        let targetEls = document.querySelectorAll('.photo-inner-zoom');
        if (targetEls.length === 0) {
            let pl = document.getElementById('photo-layer');
            if (pl) targetEls = [pl];
        }
        targetEls.forEach(targetEl => {
            if (rawImg) targetEl.style.backgroundImage = 'url("' + rawImg + '")';
            let parent = targetEl.classList.contains('photo-inner-zoom') ? targetEl.parentElement : targetEl;
            if (parent) {
                if (rawImg) parent.dataset.savedBg = 'url("' + rawImg + '")';
                parent.style.backgroundImage = 'none';
            }
            if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(parent);
        });
        if (typeof photoLayer !== 'undefined' && photoLayer) {
            if (rawImg) photoLayer.dataset.savedBg = 'url("' + rawImg + '")';
            photoLayer.style.backgroundImage = 'none';
        }
        document.querySelectorAll('.photo-panel').forEach(p => {
            let inner = p.querySelector('.photo-inner-zoom') || p;
            if (rawImg) inner.style.backgroundImage = 'url("' + rawImg + '")';
            p.dataset.savedBg = 'url("' + rawImg + '")';
            p.style.backgroundImage = 'none';
            if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p);
        });
        return;
    }

    activeCtx.putImageData(newImgData, 0, 0);
    const dataUrl = activeCanvas.toDataURL('image/jpeg', isQualityPreviewMode ? 0.6 : 0.92);
    
    let targetEls = document.querySelectorAll('.photo-inner-zoom');
    if (targetEls.length === 0) {
        let pl = document.getElementById('photo-layer');
        if (pl) targetEls = [pl];
    }
    targetEls.forEach(targetEl => {
        targetEl.style.backgroundImage = 'url("' + dataUrl + '")';
        let parent = targetEl.classList.contains('photo-inner-zoom') ? targetEl.parentElement : targetEl;
        if (parent) {
            parent.dataset.savedBg = 'url("' + dataUrl + '")';
            parent.style.backgroundImage = 'none';
        }
        if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(parent);
    });
}

function applyShadowHighlight(){
    if(typeof shadowOverlay !== 'undefined' && shadowOverlay) shadowOverlay.style.background = 'transparent';
    if(typeof highlightOverlay !== 'undefined' && highlightOverlay) highlightOverlay.style.background = 'transparent';
    if(typeof applyPhotoFilters === 'function') applyPhotoFilters();
    else if(typeof processPixels === 'function') processPixels();
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

function setOriginalView(show) {
    if (typeof show === 'boolean') {
        isShowingBefore = show;
    } else {
        isShowingBefore = !isShowingBefore;
    }
    window.isShowingBefore = isShowingBefore;
    const btn = document.getElementById('btnBeforeAfter');
    
    if(isShowingBefore) {
        if(typeof photoLayer !== 'undefined' && photoLayer) {
            photoLayer.style.filter = 'none';
            let targetEl = photoLayer.querySelector('.photo-inner-zoom') || photoLayer;
            if(typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl) targetEl.style.backgroundImage = 'url("'+uploadedImgUrl+'")';
        }
        if(typeof vignetteLayer !== 'undefined' && vignetteLayer) vignetteLayer.style.opacity = '0';
        document.querySelectorAll('.photo-panel').forEach(p=>p.style.filter='none');
        
        ['draw-layer', 'mask-layer', 'canva-render-layer', 'ui-layer', 'shadow-overlay', 'highlight-overlay'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.style.opacity = '0';
        });
        document.querySelectorAll('.canvas-el').forEach(el => el.style.opacity = '0');
        
        const maskSvg = document.getElementById('maskInteractiveSvg');
        if (maskSvg) maskSvg.style.display = 'none';
        
        let badge = document.getElementById('originalViewBadge');
        if(!badge) {
            badge = document.createElement('div');
            badge.id = 'originalViewBadge';
            badge.innerHTML = '<i class="fa-solid fa-eye"></i> ÖNCESİ (ORİJİNAL)';
            badge.style.cssText = 'position:absolute; top:20px; left:50%; transform:translateX(-50%); background:rgba(15,23,42,0.88); color:#f8fafc; border:1px solid rgba(255,255,255,0.25); padding:6px 18px; border-radius:20px; font-size:12px; font-weight:700; z-index:999999; pointer-events:none; font-family:\'Space Grotesk\', sans-serif; backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); box-shadow:0 4px 16px rgba(0,0,0,0.35); letter-spacing:0.5px; transition:opacity 0.2s;';
            const container = document.getElementById('canvas-container');
            if(container) container.appendChild(badge);
        }
        if(badge) badge.style.opacity = '1';
        
        if (btn) {
            btn.style.backgroundColor = '#f59e0b';
            btn.style.color = '#fff';
            btn.innerHTML = '<i class="fa-solid fa-eye"></i> Sonrası';
            btn.title = 'Düzenlenmiş haline dön (Sonrası)';
        }
        
        const dockBtns = document.querySelectorAll('#dockBeforeAfterBtn, #dockGlobalBeforeAfterBtn');
        dockBtns.forEach(dockBtn => {
            dockBtn.style.backgroundColor = '#f59e0b';
            dockBtn.style.color = '#fff';
            dockBtn.classList.add('active');
            dockBtn.innerHTML = '<span class="dock-icon"><i class="fa-solid fa-eye"></i></span><span class="dock-label">Sonrası</span>';
            dockBtn.title = 'Düzenlenmiş haline dön (Sonrası)';
        });

        if (typeof requestPhotoRepaint === 'function') requestPhotoRepaint();
        if (window.PhotoStagingArchive && typeof window.PhotoStagingArchive.syncCompareButtonStates === 'function') {
            window.PhotoStagingArchive.syncCompareButtonStates();
        }
    } else {
        if (btn) {
            btn.style.backgroundColor = '';
            btn.style.color = '';
            btn.innerHTML = '<i class="fa-solid fa-code-compare"></i> Öncesi / Sonrası';
            btn.title = 'Orijinal görseli göster (Öncesi)';
        }

        const dockBtns = document.querySelectorAll('#dockBeforeAfterBtn, #dockGlobalBeforeAfterBtn');
        dockBtns.forEach(dockBtn => {
            dockBtn.style.backgroundColor = '';
            dockBtn.style.color = '';
            dockBtn.classList.remove('active');
            dockBtn.innerHTML = '<span class="dock-icon"><i class="fa-solid fa-code-compare"></i></span><span class="dock-label">Öncesi / Sonrası</span>';
            dockBtn.title = 'Orijinal görseli göster (Öncesi)';
        });
        
        ['draw-layer', 'mask-layer', 'canva-render-layer', 'ui-layer', 'shadow-overlay', 'highlight-overlay'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.style.opacity = '1';
        });
        document.querySelectorAll('.canvas-el').forEach(el => el.style.opacity = '1');
        
        const maskSvg = document.getElementById('maskInteractiveSvg');
        if (maskSvg) maskSvg.style.display = '';
        
        let badge = document.getElementById('originalViewBadge');
        if(badge) badge.style.opacity = '0';
        
        if(typeof applyPhotoFilters === 'function') applyPhotoFilters();
        const v = document.getElementById('vignette') ? +document.getElementById('vignette').value : 0;
        if(typeof vignetteLayer !== 'undefined' && vignetteLayer) vignetteLayer.style.opacity = v / 100;
        if(typeof processPixels === 'function') processPixels(true);
        if (typeof requestPhotoRepaint === 'function') requestPhotoRepaint();
        if (window.PhotoStagingArchive && typeof window.PhotoStagingArchive.syncCompareButtonStates === 'function') {
            window.PhotoStagingArchive.syncCompareButtonStates();
        }
    }
}

function togglePhotoBeforeAfterInstant(forceState) {
    if (window.PhotoStagingArchive && typeof window.PhotoStagingArchive.closeCanvasCompare === 'function') {
        const overlay = document.getElementById('canvasCompareSliderOverlay');
        if (overlay && overlay.style.display !== 'none') {
            window.PhotoStagingArchive.closeCanvasCompare();
        }
    }
    setOriginalView(forceState);
}

function toggleBeforeAfter(forceState) {
    togglePhotoBeforeAfterInstant(forceState);
}

window.togglePhotoBeforeAfterInstant = togglePhotoBeforeAfterInstant;
window.toggleBeforeAfter = toggleBeforeAfter;
window.setOriginalView = setOriginalView;

window.resetPixelCache = function() {
    originalImageData = null;
    previewImageData = null;
    workingCanvas = null;
    workingCtx = null;
    previewWorkingCanvas = null;
    previewWorkingCtx = null;
    window._isCachingOriginalImage = false;
};

function cacheOriginalImageForPixels() {
    if (window._isCachingOriginalImage) return;
    window._isCachingOriginalImage = true;
    
    let url = '';
    if (typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl) {
        url = uploadedImgUrl;
    } else if (typeof masterImageBase64 !== 'undefined' && masterImageBase64) {
        url = masterImageBase64;
    } else {
        let targetEl = document.querySelector('.photo-inner-zoom') || document.getElementById('photo-layer');
        if (targetEl && targetEl.style.backgroundImage && targetEl.style.backgroundImage !== 'none') {
            url = targetEl.style.backgroundImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        }
    }
    if (!url || url === 'none') {
        window._isCachingOriginalImage = false;
        return;
    }
    
    let img = new Image();
    if (url.startsWith('http')) img.crossOrigin = 'Anonymous';
    img.onload = () => {
        let w = img.width;
        let h = img.height;
        const MAX_SIZE = 1400; // High-resolution quality
        const PREVIEW_SIZE = 360; // Fast real-time slider drag resolution
        
        let ratio = 1;
        let pRatio = 1;

        if(w > MAX_SIZE || h > MAX_SIZE) {
            ratio = Math.min(MAX_SIZE/w, MAX_SIZE/h);
        }
        if(w > PREVIEW_SIZE || h > PREVIEW_SIZE) {
            pRatio = Math.min(PREVIEW_SIZE/w, PREVIEW_SIZE/h);
        }
        
        let wHigh = Math.round(w * ratio);
        let hHigh = Math.round(h * ratio);
        
        let wLow = Math.round(w * pRatio);
        let hLow = Math.round(h * pRatio);

        // High Res Caching
        workingCanvas = document.createElement('canvas');
        workingCanvas.width = wHigh;
        workingCanvas.height = hHigh;
        workingCtx = workingCanvas.getContext('2d', {willReadFrequently:true});
        workingCtx.drawImage(img, 0, 0, wHigh, hHigh);
        originalImageData = workingCtx.getImageData(0, 0, wHigh, hHigh);
        
        // Low Res (Preview) Caching
        previewWorkingCanvas = document.createElement('canvas');
        previewWorkingCanvas.width = wLow;
        previewWorkingCanvas.height = hLow;
        previewWorkingCtx = previewWorkingCanvas.getContext('2d', {willReadFrequently:true});
        previewWorkingCtx.drawImage(img, 0, 0, wLow, hLow);
        previewImageData = previewWorkingCtx.getImageData(0, 0, wLow, hLow);

        window._isCachingOriginalImage = false;
        processPixels();
    };
    img.onerror = () => {
        window._isCachingOriginalImage = false;
    };
    img.src = url;
}

// Bulletproof pixel slider bindings
function bindPixelSliders() {
    const ids = ['shadowsCtrl', 'highlightsCtrl', 'blacksCtrl', 'whitesCtrl', 'tempCtrl', 'tintCtrl', 'vibranceCtrl', 'sharpnessCtrl'];
    let slideTimeout = null;
    ids.forEach(id => {
        let el = document.getElementById(id);
        if (el && !el._boundPixelSlider) {
            el._boundPixelSlider = true;
            el.addEventListener('input', () => {
                isQualityPreviewMode = true; // Hızlı önizleme (Low Res) modu
                if(typeof applyShadowHighlight === 'function') applyShadowHighlight();
                
                clearTimeout(slideTimeout);
                slideTimeout = setTimeout(() => {
                    isQualityPreviewMode = false;
                    if(typeof applyShadowHighlight === 'function') applyShadowHighlight();
                }, 220);
            });
            el.addEventListener('change', () => {
                clearTimeout(slideTimeout);
                isQualityPreviewMode = false; // Bırakınca Yüksek Kalite (High Res) modu
                if(typeof applyShadowHighlight === 'function') applyShadowHighlight();
            });
        }
    });

    document.querySelectorAll('.hsl-slider').forEach(el => {
        if (!el._boundPixelSlider) {
            el._boundPixelSlider = true;
            let hslTimeout = null;
            el.addEventListener('input', () => {
                isQualityPreviewMode = true;
                if(typeof processHSL === 'function') processHSL();
                clearTimeout(hslTimeout);
                hslTimeout = setTimeout(() => {
                    isQualityPreviewMode = false;
                    if(typeof processHSL === 'function') processHSL();
                }, 220);
                if (typeof window.triggerPhotoFilterHistory === 'function') {
                    window.triggerPhotoFilterHistory(false);
                }
            });
            el.addEventListener('change', () => {
                clearTimeout(hslTimeout);
                isQualityPreviewMode = false;
                if(typeof processHSL === 'function') processHSL();
                if (typeof window.triggerPhotoFilterHistory === 'function') {
                    window.triggerPhotoFilterHistory(true);
                }
            });
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindPixelSliders);
} else {
    bindPixelSliders();
}
setTimeout(bindPixelSliders, 800);
setTimeout(bindPixelSliders, 2000);

// =========================================================================
// 🎯 8-KANAL HSL DAMLALIK MOTORU (EYEDROPPER & COLOR PICKER)
// =========================================================================
(function() {
    function hexToRgb(hex) {
        if (!hex) return { r: 0, g: 0, b: 0 };
        let c = hex.replace('#', '').trim();
        if (c.length === 3) {
            c = c.split('').map(x => x + x).join('');
        }
        const num = parseInt(c, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    }

    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
                case g: h = ((b - r) / d + 2); break;
                case b: h = ((r - g) / d + 4); break;
            }
            h *= 60;
        }
        return { h: (h % 360 + 360) % 360, s: s * 100, l: l * 100 };
    }

    function matchHslChannel(h) {
        h = (h % 360 + 360) % 360;
        if (h >= 345 || h < 15) return 'red';
        if (h >= 15 && h < 40) return 'orange';
        if (h >= 40 && h < 70) return 'yellow';
        if (h >= 70 && h < 165) return 'green';
        if (h >= 165 && h < 200) return 'aqua';
        if (h >= 200 && h < 255) return 'blue';
        if (h >= 255 && h < 305) return 'purple';
        if (h >= 305 && h < 345) return 'magenta';
        return 'red';
    }

    window.applyPickedColorToHsl = function(hex) {
        if (!hex) return;
        const rgb = hexToRgb(hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        // Damlalıkla seçilen rengi doğrudan nokta atışı hedef özel renk durumuna ata
        window.customColorState = {
            active: true,
            hex: hex.toUpperCase(),
            h: (hsl.h % 360) / 360.0,
            s: Math.max(0, Math.min(1, hsl.s / 100.0)),
            l: Math.max(0, Math.min(1, hsl.l / 100.0)),
            shiftH: 0,
            shiftS: 0,
            shiftL: 0,
            range: 0.20
        };

        if (typeof window.syncCustomColorUI === 'function') {
            window.syncCustomColorUI(true);
        } else {
            const customDot = document.getElementById('hslCustomColorDot');
            if (customDot) customDot.click();
        }

        if (typeof applyPhotoFilters === 'function') applyPhotoFilters();
        if (typeof processHSL === 'function') processHSL();
    };

    window.resetHslAdjustments = function() {
        // 8 Renk Kanalı Sıfırla
        const hslColors = ['red', 'orange', 'yellow', 'green', 'aqua', 'blue', 'purple', 'magenta'];
        hslColors.forEach(color => {
            ['h', 's', 'l'].forEach(type => {
                const slider = document.querySelector(`.hsl-slider[data-color="${color}"][data-type="${type}"]`);
                if (slider) slider.value = 0;
                const span = document.getElementById(`hsl_${type}_${color}Val`);
                if (span) span.textContent = '0';
            });
        });

        // Özel Hedef Renk Durumunu Sıfırla
        window.customColorState = null;
        
        // Arayüz Sliderlarını Sıfırla
        ['h', 's', 'l'].forEach(t => {
            const s = document.getElementById(`hsl_${t}_slider`);
            if (s) s.value = 0;
            const v = document.getElementById(`hsl_${t}_val`);
            if (v) v.textContent = '0';
        });
        const tolSlider = document.getElementById('hsl_range_slider');
        if (tolSlider) tolSlider.value = 20;
        const tolVal = document.getElementById('hsl_range_val');
        if (tolVal) tolVal.textContent = '20%';

        // UI Senkronizasyonu
        if (typeof window.syncCustomColorUI === 'function') {
            window.syncCustomColorUI(false);
        }

        // Kırmızı Noktayı Aktif Yap
        const redDot = document.querySelector('.hsl-color-dot[data-color="red"]');
        if (redDot) redDot.click();

        // Filtreleri Güncelle
        if (typeof applyPhotoFilters === 'function') applyPhotoFilters();
        if (typeof processHSL === 'function') processHSL();
    };

    window.pickHslColorFromPhoto = async function() {
        const btn = document.getElementById('hslEyedropperBtn');

        // 1. Modern Chromium EyeDropper API (Piksel büyüteçli doğal damlalık)
        if (window.EyeDropper) {
            try {
                if (btn) {
                    btn.style.borderColor = '#3b82f6';
                    btn.style.color = '#3b82f6';
                }
                const eyeDropper = new window.EyeDropper();
                const result = await eyeDropper.open();
                if (result && result.sRGBHex) {
                    window.applyPickedColorToHsl(result.sRGBHex);
                }
            } catch (err) {
                // Kullanıcı ESC ile iptal ettiğinde
            } finally {
                if (btn) {
                    btn.style.borderColor = '';
                    btn.style.color = '';
                }
            }
            return;
        }

        // 2. Fallback: EyeDropper desteklenmiyorsa tuval üzerinden piksel yakalama
        const canvasContainer = document.getElementById('canvas-container');
        if (!canvasContainer) return;

        if (btn) {
            btn.style.borderColor = '#3b82f6';
            btn.style.color = '#3b82f6';
        }
        const oldCursor = canvasContainer.style.cursor;
        canvasContainer.style.cursor = 'crosshair';

        const onCancelKey = (e) => {
            if (e.key === 'Escape') cleanup();
        };

        const cleanup = () => {
            canvasContainer.style.cursor = oldCursor;
            if (btn) {
                btn.style.borderColor = '';
                btn.style.color = '';
            }
            canvasContainer.removeEventListener('click', onCanvasClick, true);
            window.removeEventListener('keydown', onCancelKey);
        };

        const onCanvasClick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            try {
                const rect = canvasContainer.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;

                const scaleX = (canvasContainer.offsetWidth > 0) ? (1920 / canvasContainer.offsetWidth) : 1;
                const scaleY = (canvasContainer.offsetHeight > 0) ? (1080 / canvasContainer.offsetHeight) : 1;

                const targetX = Math.max(0, Math.min(1919, Math.round(clickX * scaleX)));
                const targetY = Math.max(0, Math.min(1079, Math.round(clickY * scaleY)));

                const masterImg = window.masterImageBase64 || window.uploadedImgUrl;
                if (masterImg) {
                    const tempImg = new Image();
                    tempImg.onload = () => {
                        try {
                            const offCanvas = document.createElement('canvas');
                            offCanvas.width = 1;
                            offCanvas.height = 1;
                            const offCtx = offCanvas.getContext('2d');
                            const natW = tempImg.naturalWidth || 1920;
                            const natH = tempImg.naturalHeight || 1080;
                            const imgX = (targetX / 1920) * natW;
                            const imgY = (targetY / 1080) * natH;
                            offCtx.drawImage(tempImg, imgX, imgY, 1, 1, 0, 0, 1, 1);
                            const pixel = offCtx.getImageData(0, 0, 1, 1).data;
                            const hex = '#' + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);
                            window.applyPickedColorToHsl(hex);
                        } catch(errOff) {}
                    };
                    tempImg.src = masterImg;
                }
            } catch (errPick) {
                console.warn('Piksel rengi okunamadı:', errPick);
            } finally {
                cleanup();
            }
        };

        canvasContainer.addEventListener('click', onCanvasClick, true);
        window.addEventListener('keydown', onCancelKey);
    };
})();


