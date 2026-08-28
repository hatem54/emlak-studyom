/**
 * ============================================
 * PHOTO MODULE
 * modules/photo.js
 * ============================================
 * 
 * Bağımlılıklar:
 * - core/utils.js
 * - core/drag.js
 * 
 * Kullanılan yerler:
 * - main.js
 * - ui/element.js vb.
 */

function enablePhotoDrag(el){
    let dragging=false,startX,startY,startPX,startPY;
    let lastTap = 0;

    function resetPhotoPos() {
        const xCtrl = document.getElementById('photoXCtrl');
        const yCtrl = document.getElementById('photoYCtrl');
        const zoomCtrl = document.getElementById('photoZoomCtrl');
        if (xCtrl) xCtrl.value = 50;
        if (yCtrl) yCtrl.value = 50;
        if (zoomCtrl) zoomCtrl.value = 100;
        if (typeof applyPhotoPos === 'function') applyPhotoPos();
        
        // Fotoğraf v4+ Zoom/Pan transform reset desteği
        if (el) {
            el.dataset.zpScale = 1;
            el.dataset.zpX = 0;
            el.dataset.zpY = 0;
            if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(el);
        }
        if (typeof redrawAll === 'function') redrawAll();
    }

    function down(e){
        if (typeof uploadedImgUrl === 'undefined' || !uploadedImgUrl) return;
        const photoLock = document.getElementById('photoLockToggle');
        if(photoLock && photoLock.checked) return;
        
        // Prevent legacy drag if V4 zoom is active to avoid double-panning
        if(el && (el.dataset.zpReady === '1' || el.querySelector('.photo-inner-zoom'))) return;
        
        if(e.target.closest('.canvas-el')||e.target.closest('.draggable'))return;
        if(typeof drawMode !== 'undefined' && drawMode!=='off')return;
        
        if(e.type === 'touchstart') {
            lastTap = new Date().getTime();
        }

        e.preventDefault();
        dragging=true;
        el.classList.add('grabbing');
        const c=e.touches?e.touches[0]:e;
        startX=c.clientX;
        startY=c.clientY;
        startPX=parseFloat($('photoXCtrl').value);
        startPY=parseFloat($('photoYCtrl').value);
    }
    function move(e){
        if(!dragging)return;
        e.preventDefault();
        const c=e.touches?e.touches[0]:e;
        const zoom=parseFloat($('photoZoomCtrl').value);
        const sensitivity=100/Math.max(zoom-50,50);
        const sf = typeof window.getGlobalScale === 'function' ? window.getGlobalScale() : 1;
        const dx=(c.clientX-startX)/sf*sensitivity/19.2;
        const dy=(c.clientY-startY)/sf*sensitivity/10.8;
        $('photoXCtrl').value=Math.max(0,Math.min(100,startPX-dx));
        $('photoYCtrl').value=Math.max(0,Math.min(100,startPY-dy));
        applyPhotoPos();
    }
    function up(){
        if(!dragging)return;
        dragging=false;
        el.classList.remove('grabbing');
    }
    el.addEventListener('mousedown',down);
    el.addEventListener('touchstart',down,{passive:false});
    el.addEventListener('dblclick', (e) => {
        if(e.target.closest('.canvas-el')||e.target.closest('.draggable'))return;
        if(typeof drawMode !== 'undefined' && drawMode!=='off')return;
        e.preventDefault();
        resetPhotoPos();
    });
    document.addEventListener('mousemove',move);
    document.addEventListener('touchmove',move,{passive:false});
    document.addEventListener('mouseup',up);
    document.addEventListener('touchend',up);
}

function applyPhotoPos(){
    const zoom=parseFloat($('photoZoomCtrl').value);
    const x=parseFloat($('photoXCtrl').value);
    const y=parseFloat($('photoYCtrl').value);
    
    $('photoZoomVal').textContent=zoom+'%';
    $('photoXVal').textContent=x+'%';
    $('photoYVal').textContent=y+'%';
    
    // YENİ: Çizim kaymasını önlemek için matematiksel olarak birebir aynı piksel hesabı
    let pW = photoLayer.offsetWidth;
    let pH = photoLayer.offsetHeight;
    if (typeof canvasEl !== 'undefined' && canvasEl) {
        pW = parseFloat(canvasEl.style.width) || pW || 1920;
        pH = parseFloat(canvasEl.style.height) || pH || 1080;
    } else {
        pW = pW || 1920;
        pH = pH || 1080;
    }

    let imgW = typeof uploadedImgW !== 'undefined' ? uploadedImgW : 1920;
    let imgH = typeof uploadedImgH !== 'undefined' ? uploadedImgH : 1080;
    
    if (photoLayer.dataset.naturalW) {
        imgW = parseFloat(photoLayer.dataset.naturalW) || imgW;
        imgH = parseFloat(photoLayer.dataset.naturalH) || imgH;
    }
    
    let coverScale = Math.max(pW / imgW, pH / imgH);
    if (zoom !== 100) {
        coverScale = (pW * (zoom / 100)) / imgW;
    }
    
    let renderedW = imgW * coverScale;
    let renderedH = imgH * coverScale;
    
    let offsetX = pW / 2 - renderedW / 2;
    let offsetY = pH / 2 - renderedH / 2;
    
    if (renderedW > pW) {
        offsetX = (pW - renderedW) * (x / 100);
    }
    if (renderedH > pH) {
        offsetY = (pH - renderedH) * (y / 100);
    }
    
    const sizeStr = renderedW + 'px ' + renderedH + 'px';
    const posStr = offsetX + 'px ' + offsetY + 'px';
    
    photoLayer.style.backgroundSize=sizeStr;
    photoLayer.style.backgroundPosition=posStr;
    photoLayer.style.backgroundRepeat='no-repeat';
    photoLayer.style.backgroundColor='transparent';
    
    // Kesin çözüm: Canva modundaysa orijinal fotoğraf katmanını zorla gizle
    if (typeof isCanvaMode !== 'undefined' && isCanvaMode) {
        photoLayer.style.setProperty('display', 'none', 'important');
        photoLayer.style.opacity = '0';
    } else {
        photoLayer.style.display = 'block';
        photoLayer.style.opacity = '1';
    }

    document.querySelectorAll('.photo-panel').forEach(p=>{
        if (p.closest('#canva-render-layer') || (typeof isCanvaMode !== 'undefined' && isCanvaMode)) {
            const x = document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50;
            const y = document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50;
            p.style.backgroundSize = 'cover';
            p.style.backgroundPosition = x + '% ' + y + '%';
            p.style.backgroundRepeat = 'no-repeat';
            p.style.backgroundColor = 'transparent';
        } else {
            p.style.backgroundSize=sizeStr;
            p.style.backgroundPosition=posStr;
            p.style.backgroundRepeat='no-repeat';
            p.style.backgroundColor='transparent';
        }
    });
    if(typeof redrawAll === 'function') redrawAll();
}

function resetPhotoPos(){
    const pl = document.getElementById('photo-layer');
    if (pl) {
        pl.dataset.zpX = 0;
        pl.dataset.zpY = 0;
        pl.dataset.zpScale = 1;
        if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(pl);
    }

    $('photoZoomCtrl').value=100;
    $('photoXCtrl').value=50;
    $('photoYCtrl').value=50;
    applyPhotoPos();
    
    // Fotoğrafı tekrar kilitle
    const lockToggle = document.getElementById('photoLockToggle');
    if (lockToggle) {
        lockToggle.checked = true;
        window.isPhotoLocked = true;
    }
    if (typeof redrawAll === 'function') redrawAll();
}

function applyPhotoFilters(){
    if(typeof isShowingBefore !== 'undefined' && isShowingBefore) { toggleBeforeAfter(); }
    const exp=+$('exposure').value,con=+$('contrast').value,sat=+$('saturate').value;
    const blur=+$('fblur').value,sep=+$('sepia').value,hue=+$('hueRotate').value;
    const gray=+$('grayscale').value,inv=+$('invertCtrl').value,temp=+$('tempCtrl').value;
    const tint=+$('tintCtrl').value,vib=+$('vibranceCtrl').value;
    const sharp=+$('sharpnessCtrl').value,clarity=+$('clarityCtrl').value,dehaze=+$('dehazeCtrl').value;
    let effectiveSat=sat+vib*0.5;
    let effectiveContrast=con+clarity*0.4+dehaze*0.3;
    let effectiveBrightness=exp+dehaze*0.15;
    let effectiveHue=hue+temp*0.3-tint*0.3;
    let filter='brightness('+effectiveBrightness+'%) contrast('+effectiveContrast+'%) saturate('+effectiveSat+'%) blur('+blur+'px) sepia('+sep+'%) hue-rotate('+effectiveHue+'deg) grayscale('+gray+'%) invert('+inv+'%)';
    if(sharp>0)filter+=' drop-shadow(0 0 0.5px rgba(0,0,0,'+(sharp/200)+'))';
    photoLayer.style.filter=filter;
    document.querySelectorAll('.photo-panel').forEach(p=>p.style.filter=filter);
    
    // Zoom Canvas Repaint Tetikleyicisi (Tarayıcı GPU hatasını aşmak için)
    const activeZoomCanvas = document.querySelector('.photo-render-canvas');
    if (activeZoomCanvas) {
        activeZoomCanvas.style.opacity = '0.99';
        requestAnimationFrame(() => {
            activeZoomCanvas.style.opacity = '1';
        });
    }
    $('exposureVal').textContent=exp+'%';
    $('contrastVal').textContent=con+'%';
    $('saturateVal').textContent=sat+'%';
    $('fblurVal').textContent=blur+'px';
    $('sepiaVal').textContent=sep+'%';
    $('hueRotateVal').textContent=hue+'°';
    $('grayscaleVal').textContent=gray+'%';
    $('invertVal').textContent=inv+'%';
    $('tempVal').textContent=temp;
    $('tintVal').textContent=tint;
    $('vibranceVal').textContent=vib;
    $('sharpnessVal').textContent=sharp;
    $('clarityVal').textContent=clarity;
    $('dehazeVal').textContent=dehaze;
    const v=$('vignette').value;
    vignetteLayer.style.opacity=v/100;
    $('vignetteVal').textContent=v+'%';
}

function resetFilters(){
    Object.keys(FILTER_DEFAULTS).forEach(id=>{if($(id))$(id).value=FILTER_DEFAULTS[id]});
    document.querySelectorAll('.hsl-slider').forEach(s => {
        s.value = 0;
        const valSpan = document.getElementById('hsl_'+s.dataset.type+'_'+s.dataset.color+'Val');
        if(valSpan) valSpan.textContent = '0';
    });
    if(typeof processHSL === 'function') processHSL();
    applyPhotoFilters();
    if(typeof applyShadowHighlight === 'function') applyShadowHighlight();

}

function applyPreset(name){
    const p = PRESETS[name];
    if(!p) return;
    
    Object.keys(FILTER_DEFAULTS).forEach(id=>{if(document.getElementById(id))document.getElementById(id).value=FILTER_DEFAULTS[id]});
    Object.keys(p).forEach(k=>{if(document.getElementById(k))document.getElementById(k).value=p[k]});
    
    // CSS filtreleri (brightness/contrast/sat) anında uygula
    if(typeof applyPhotoFilters === 'function') applyPhotoFilters();
    // Piksel motoru (gölge/highlight) senkron çalıştır
    if(typeof processPixels === 'function') processPixels(true);
}

function _preparePhoto(el){
    if(!el) return;
    el.dataset.zpReady = '1';
    if (!el.dataset.zpScale) el.dataset.zpScale = 1;
    if (!el.dataset.zpX) el.dataset.zpX = 0;
    if (!el.dataset.zpY) el.dataset.zpY = 0;
    
    el.style.overflow = 'hidden';
    
    let renderCanvas = el.querySelector('.photo-render-canvas');
    if (!renderCanvas) {
        renderCanvas = document.createElement('canvas');
        renderCanvas.className = 'photo-render-canvas';
        renderCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
        el.appendChild(renderCanvas);
    }
    
    let inner = el.querySelector('.photo-inner-zoom');
    if (!inner) {
        inner = document.createElement('div');
        inner.className = 'photo-inner-zoom';
        inner.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background-size:cover;background-position:center;background-repeat:no-repeat;transform-origin:center center;transition:none;pointer-events:none;opacity:0;z-index:0;';
        el.appendChild(inner);
    }
    
    var bg = el.style.backgroundImage;
    if(bg && bg !== 'none') {
        inner.style.backgroundImage = bg;
        el.dataset.savedBg = bg;
        el.style.backgroundImage = 'none';
    } else if (typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl) {
        inner.style.backgroundImage = "url('" + uploadedImgUrl + "')";
        el.dataset.savedBg = "url('" + uploadedImgUrl + "')";
        el.style.backgroundImage = 'none';
    } else if (el.dataset.savedBg) {
        inner.style.backgroundImage = el.dataset.savedBg;
        el.style.backgroundImage = 'none';
    }
    
    _applyPhotoTransform(el);
}

function _applyPhotoTransform(el){
    if(!el) return;
    var inner = el.querySelector('.photo-inner-zoom');
    var canvas = el.querySelector('.photo-render-canvas');
    if(!inner) {
        _preparePhoto(el);
        inner = el.querySelector('.photo-inner-zoom');
        canvas = el.querySelector('.photo-render-canvas');
        if(!inner) return;
    }
    
    var s = parseFloat(el.dataset.zpScale) || 1;
    var x = parseFloat(el.dataset.zpX) || 0;
    var y = parseFloat(el.dataset.zpY) || 0;
    
    var sX = document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50;
    var sY = document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50;
    
    inner.style.backgroundPosition = 'calc(' + sX + '% + ' + x + 'px) calc(' + sY + '% + ' + y + 'px)';
    inner.style.transform = 'scale(' + s + ')';
    
    if (canvas) {
        _drawToNativeCanvas(el, inner, canvas, s, x, y, sX, sY);
    }
    
    if(typeof redrawAll === 'function') redrawAll();
}

function _drawToNativeCanvas(el, inner, canvas, scale, panX, panY, sliderX, sliderY) {
    let rawBg = inner.style.backgroundImage || el.dataset.savedBg || el.style.backgroundImage || '';
    if ((!rawBg || rawBg === 'none') && typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl) {
        rawBg = "url('" + uploadedImgUrl + "')";
        inner.style.backgroundImage = rawBg;
    }
    
    let imgUrl = rawBg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    if (!imgUrl || imgUrl === 'none') {
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }
    
    if (!el._nativeImg || el._nativeImgSrc !== imgUrl) {
        if (window._globalNativeImgSrc === imgUrl && window._globalNativeImg && window._globalNativeImg.complete && window._globalNativeImg.naturalWidth > 0) {
            el._nativeImg = window._globalNativeImg;
            el._nativeImgSrc = imgUrl;
        } else {
            let img = new Image();
            if (imgUrl.startsWith('http')) img.crossOrigin = 'anonymous';
            img.onload = () => {
                window._globalNativeImg = img;
                window._globalNativeImgSrc = imgUrl;
                el._nativeImg = img;
                el._nativeImgSrc = imgUrl;
                _drawToNativeCanvas(el, inner, canvas, scale, panX, panY, sliderX, sliderY);
            };
            img.src = imgUrl;
            return;
        }
    }
    
    let img = el._nativeImg;
    if (!img || img.width === 0) return;
    
    let cContainer = document.getElementById('canvas-container');
    let cW = cContainer ? (parseInt(cContainer.style.width) || cContainer.offsetWidth || 1920) : 1920;
    let cH = cContainer ? (parseInt(cContainer.style.height) || cContainer.offsetHeight || 1080) : 1080;
    
    let boxW = (el.id === 'photo-layer') ? cW : (el.offsetWidth || cW);
    let boxH = (el.id === 'photo-layer') ? cH : (el.offsetHeight || cH);
    if (boxW <= 0) boxW = 1920;
    if (boxH <= 0) boxH = 1080;
    
    let activeScale = parseFloat(scale) || 1;
    let baseResMul = window.exportingScale ? window.exportingScale : 1.5;
    
    let natW = (el && el.dataset.naturalW) ? parseFloat(el.dataset.naturalW) : (window.uploadedImgW || img.naturalWidth || img.width || 1920);
    let natH = (el && el.dataset.naturalH) ? parseFloat(el.dataset.naturalH) : (window.uploadedImgH || img.naturalHeight || img.height || 1080);
    if (!natW || natW <= 0) natW = 1920;
    if (!natH || natH <= 0) natH = 1080;

    if (!window.exportingScale) {
        let nativeScaleX = natW / boxW;
        let nativeScaleY = natH / boxH;
        let maxNativeScale = Math.max(nativeScaleX, nativeScaleY);
        baseResMul = Math.min(4, Math.max(1, maxNativeScale * activeScale));
    }
    
    const HIGH_RES_MUL = baseResMul;
    
    let finalW = Math.round(boxW * HIGH_RES_MUL);
    let finalH = Math.round(boxH * HIGH_RES_MUL);
    
    // Güvenlik: Mobil tarayıcılarda (özellikle iOS Safari) canvas alan limiti 16.7 Milyon pikseldir.
    // Ancak RAM yetersizliğinde 6MP-12MP bile yarıda kesilebiliyor (GPU silent truncation).
    // Mobilde kesilme olmaması için stabil ve tam sığan 3 Megapiksele çekiyoruz.
    const isMob = typeof window.isMobileDevice === 'function' ? window.isMobileDevice() : window.innerWidth <= 768;
    const MAX_AREA = isMob ? 3000000 : 12000000;
    
    if ((finalW * finalH) > MAX_AREA) {
        const reductionRatio = Math.sqrt(MAX_AREA / (finalW * finalH));
        finalW = Math.round(finalW * reductionRatio);
        finalH = Math.round(finalH * reductionRatio);
    }
    
    canvas.width = finalW;
    canvas.height = finalH;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let imgRatio = natW / natH;
    let boxRatio = canvas.width / canvas.height;
    
    let drawW, drawH;
    if (imgRatio > boxRatio) {
        drawH = canvas.height;
        drawW = Math.round(natW * (canvas.height / natH));
    } else {
        drawW = canvas.width;
        drawH = Math.round(natH * (canvas.width / natW));
    }
    
    let baseX = Math.round((canvas.width - drawW) * (sliderX / 100));
    let baseY = Math.round((canvas.height - drawH) * (sliderY / 100));
    
    let cx = Math.round(canvas.width / 2);
    let cy = Math.round(canvas.height / 2);
    
    let trX = Math.round(panX * HIGH_RES_MUL);
    let trY = Math.round(panY * HIGH_RES_MUL);
    
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(trX, trY);
    ctx.translate(-cx, -cy);
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    let filter = inner.style.filter || el.style.filter;
    if (filter && filter !== 'none' && window.isExportingNow) {
        ctx.filter = filter;
    }
    
    ctx.drawImage(img, baseX, baseY, drawW, drawH);
    ctx.restore();
}

// Şablon Değişimlerinde Filtrelerin Korunması İçin Observer
// Gelişmiş şablonlar (Dinamik, Elit vs.) DOM'u manuel olarak değiştirdiğinde
// filtrelerin kaybolmaması için canva-render-layer değişikliklerini dinliyoruz.
document.addEventListener('DOMContentLoaded', () => {
    const layer = document.getElementById('canva-render-layer');
    if (layer) {
        new MutationObserver((mutations) => {
            let shouldUpdate = false;
            mutations.forEach(m => {
                if (m.addedNodes.length > 0) shouldUpdate = true;
            });
            if (shouldUpdate) {
                // Microtask seviyesinde anında çalıştır, böylece tarayıcı henüz ekranı çizmeden filtre uygulanır (sıfır gecikme/flicker)
                if (typeof applyPhotoFilters === 'function') applyPhotoFilters();
            }
        }).observe(layer, { childList: true, subtree: true });
    }
});

