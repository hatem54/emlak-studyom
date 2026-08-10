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
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                e.preventDefault();
                resetPhotoPos();
                lastTap = 0;
                return;
            }
            lastTap = currentTime;
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
        const dx=(c.clientX-startX)/scaleFactor*sensitivity/19.2;
        const dy=(c.clientY-startY)/scaleFactor*sensitivity/10.8;
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
    let pW = photoLayer.offsetWidth || 1920;
    let pH = photoLayer.offsetHeight || 1080;
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
    $('photoZoomCtrl').value=100;
    $('photoXCtrl').value=50;
    $('photoYCtrl').value=50;
    applyPhotoPos();
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
    if(el.dataset.zpReady === '1') return;
    el.dataset.zpReady = '1';
    el.dataset.zpScale = 1;
    el.dataset.zpX = 0;
    el.dataset.zpY = 0;
    
    // Photo panel'in overflow hidden olmalı
    el.style.overflow = 'hidden';
    
    // Create the native canvas for rendering
    var renderCanvas = document.createElement('canvas');
    renderCanvas.className = 'photo-render-canvas';
    renderCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
    
    //  div oluştur (background bunun üstüne taşınacak)
    var inner = document.createElement('div');
    inner.className = 'photo-inner-zoom';
    // We make the inner div transparent so it holds state but doesn't show!
    inner.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background-size:cover;background-position:center;background-repeat:no-repeat;transform-origin:center center;transition:none;pointer-events:none;opacity:0;';
    
    var bg = el.style.backgroundImage;
    if(bg && bg !== 'none') inner.style.backgroundImage = bg;
    
    // Orijinal background'ı div'e taşı, dış div'den kaldır
    // el.style.backgroundImage = 'none'; (moved to _drawToNativeCanvas)
    _applyPhotoTransform(el);
    
    el.appendChild(renderCanvas);
    el.appendChild(inner);
    
    console.log('✅ Foto hazırlandı (Native Canvas Destekli):', el);
}

function _applyPhotoTransform(el){
    var inner = el.querySelector('.photo-inner-zoom');
    var canvas = el.querySelector('.photo-render-canvas');
    if(!inner) return;
    
    var s = parseFloat(el.dataset.zpScale) || 1;
    var x = parseFloat(el.dataset.zpX) || 0;
    var y = parseFloat(el.dataset.zpY) || 0;
    
    var sX = document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50;
    var sY = document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50;
    
    inner.style.backgroundPosition = 'calc(' + sX + '% + ' + x + 'px) calc(' + sY + '% + ' + y + 'px)';
    inner.style.transform = 'scale(' + s + ')';
    
    if (canvas) {
        // Hareket takibini belirle (Debounce)
        window._isZoomPanActive = true;
        clearTimeout(window._zoomPanTimeout);
        window._zoomPanTimeout = setTimeout(() => {
            window._isZoomPanActive = false;
            // Hareket bitince Yüksek Kalitede tekrar çiz
            _drawToNativeCanvas(el, inner, canvas, s, x, y, sX, sY);
        }, 150);

        _drawToNativeCanvas(el, inner, canvas, s, x, y, sX, sY);
    }
    
    if(typeof redrawAll === 'function') redrawAll();
}

function _drawToNativeCanvas(el, inner, canvas, scale, panX, panY, sliderX, sliderY) {
    let imgUrl = inner.style.backgroundImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    if (!imgUrl || imgUrl === 'none') return;
        if (!el._nativeImg || el._nativeImgSrc !== imgUrl) {
          if (window._globalNativeImgSrc === imgUrl && window._globalNativeImg && window._globalNativeImg.complete) {
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
    
    let boxW = el.clientWidth || el.offsetWidth || 1920;
    let boxH = el.clientHeight || el.offsetHeight || 1080;
    
    // PERFECT 1:1 MAPPING LOGIC:
    // When exporting, match html2canvas's scale exactly to prevent double-resampling blur!
    let activeScale = parseFloat(scale) || 1;
    let baseResMul = window.exportingScale ? window.exportingScale : 1.5;
    let smoothQuality = 'high';
    
    // If we are just previewing on screen, we want it to look sharp even if zoomed in
    if (!window.exportingScale) {
        let nativeScaleX = img.width / boxW;
        let nativeScaleY = img.height / boxH;
        let maxNativeScale = Math.max(nativeScaleX, nativeScaleY);
        
        if (window._isZoomPanActive) {
            // Hareket anında (Pan/Zoom) cihazı (özellikle mobil) yormamak için kısıtla
            baseResMul = (window.isMobileDevice && window.isMobileDevice()) ? 1.0 : 1.5;
            smoothQuality = 'low';
        } else {
            // Durgun (Idle) anında veya Yüksek kaliteli render gerektiğinde
            baseResMul = Math.min(4, Math.max(1.5, maxNativeScale * activeScale));
        }
    }
    
    const HIGH_RES_MUL = baseResMul;
    
    canvas.width = boxW * HIGH_RES_MUL;
    canvas.height = boxH * HIGH_RES_MUL;
    
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let imgRatio = img.width / img.height;
    let boxRatio = canvas.width / canvas.height;
    
    let drawW, drawH;
    if (imgRatio > boxRatio) {
        drawH = canvas.height;
        drawW = Math.round(img.width * (canvas.height / img.height));
    } else {
        drawW = canvas.width;
        drawH = Math.round(img.height * (canvas.width / img.width));
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
    ctx.imageSmoothingQuality = smoothQuality;
    
    let filter = inner.style.filter || el.style.filter;
    // Çift Filtre Çakışmasını (Ekranda Kalma) Önlemek İçin:
    // Filtreyi canvas'a FİZİKSEL olarak SADECE çıktı (export) alırken basıyoruz.
    // Normal düzenleme esnasında canvas saf kalıyor, CSS filtresi üstüne biniyor (Böylece 1 katman oluyor).
    if (filter && filter !== 'none' && window.isExportingNow) {
        ctx.filter = filter;
    }
    
    ctx.drawImage(img, baseX, baseY, drawW, drawH);
    if (!el.classList.contains('has-render-canvas')) {
        el.classList.add('has-render-canvas');
        el.style.setProperty('background-image', 'none', 'important');
    }
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

