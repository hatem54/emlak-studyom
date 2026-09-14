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

if (typeof window.$ === 'undefined') {
    window.$ = id => document.getElementById(id);
}

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
        
        if(e.target.closest('.canvas-el, .canva-el, .editable-draw, .draggable, .cvi-item, .added-icon, .callout-wrap, .co-neon-block, .vertex-handle, .text-handle')) return;
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

window.getWebGLPhotoOptions = function() {
    const getVal = (id, def = 0) => {
        const el = document.getElementById(id);
        return el ? parseFloat(el.value) : def;
    };

    // 1. Temel Işık (Pozlama, Kontrast, HDR Highlights & Shadows, Whites, Blacks)
    const expRaw = getVal('exposure', 100);
    // 100% -> 0 EV, 0% -> -2 EV, 200% -> +1.5 EV, 300% -> +3 EV
    const exposure = (expRaw - 100) / 100.0 * 1.5;
    
    const conRaw = getVal('contrast', 100);
    // 100% -> 0.0, 0% -> -0.8, 200% -> +0.8, 300% -> +1.5
    const contrast = (conRaw - 100) / 100.0 * 0.8;
    
    const highlights = getVal('highlightsCtrl', 0) / 100.0;
    const shadows = getVal('shadowsCtrl', 0) / 100.0;
    const blacks = getVal('blacksCtrl', 0) / 100.0;
    const whites = getVal('whitesCtrl', 0) / 100.0;

    // 2. Renk ve Beyaz Dengesi
    const temp = getVal('tempCtrl', 0) / 100.0;
    const tint = getVal('tintCtrl', 0) / 100.0;
    const satRaw = getVal('saturate', 100);
    const saturate = satRaw / 100.0;
    const vibrance = getVal('vibranceCtrl', 0) / 100.0;

    // 3. Detay & Efektler
    const sharpness = getVal('sharpnessCtrl', 0) / 100.0;
    const isAiEnhanceEnabled = !!window._photoAiEnabled;
    const aiSlider = document.getElementById('aiPhotoEnhanceSlider');
    const aiSharpen = isAiEnhanceEnabled ? ((aiSlider ? parseFloat(aiSlider.value) : 35) / 100.0) : 0.0;
    const clarity = getVal('clarityCtrl', 0) / 100.0;
    const dehaze = getVal('dehazeCtrl', 0) / 100.0;
    const sepia = getVal('sepia', 0) / 100.0;
    const grayscale = getVal('grayscale', 0) / 100.0;
    const invert = getVal('invertCtrl', 0) / 100.0;
    const vignette = getVal('vignette', 0) / 100.0;
    const hueRaw = getVal('hueRotate', 0); // -180 .. +180
    const hueRotate = hueRaw / 360.0; // -0.5 .. +0.5
    const blur = getVal('fblur', 0); // 0 .. 50 px

    // 4. 8-Kanal Emlak HSL
    // Renk sırası: Red(0), Orange(1), Yellow(2), Green(3), Aqua(4), Blue(5), Purple(6), Magenta(7)
    const hslColors = ['red', 'orange', 'yellow', 'green', 'aqua', 'blue', 'purple', 'magenta'];
    const hslHue = new Float32Array(8);
    const hslSat = new Float32Array(8);
    const hslLum = new Float32Array(8);

    hslColors.forEach((color, idx) => {
        const hEl = document.querySelector('.hsl-slider[data-color="' + color + '"][data-type="h"]');
        const sEl = document.querySelector('.hsl-slider[data-color="' + color + '"][data-type="s"]');
        const lEl = document.querySelector('.hsl-slider[data-color="' + color + '"][data-type="l"]');
        hslHue[idx] = hEl ? (parseFloat(hEl.value) / 100.0) : 0.0;
        hslSat[idx] = sEl ? (parseFloat(sEl.value) / 100.0) : 0.0;
        hslLum[idx] = lEl ? (parseFloat(lEl.value) / 100.0) : 0.0;
    });

    // 5. Mimari Keystone & Geometri
    const vKeystone = getVal('keystoneV', 0) / 100.0;
    const hKeystone = getVal('keystoneH', 0) / 100.0;
    const rotate = getVal('keystoneRotate', 0);
    const aspect = getVal('keystoneAspect', 0) / 100.0;
    const zoom = getVal('keystoneZoom', 100) / 100.0;

    // 6. Yerel Maskeler
    const pmm = window.PhotoMasksManager;
    const radialMask = pmm ? pmm.radial : {};
    const linearMask = pmm ? pmm.linear : {};
    const radialMasks = pmm && typeof pmm.getActiveRadialMasks === 'function' ? pmm.getActiveRadialMasks() : (radialMask.active ? [radialMask] : []);
    const linearMasks = pmm && typeof pmm.getActiveLinearMasks === 'function' ? pmm.getActiveLinearMasks() : (linearMask.active ? [linearMask] : []);
    const aiMasks = pmm && typeof pmm.getActiveAiMasks === 'function' ? pmm.getActiveAiMasks() : [];
    const aiMaskCanvas = pmm && typeof pmm.getCompositeAiCanvas === 'function' ? pmm.getCompositeAiCanvas() : null;
    const aiMaskBuffer = pmm && typeof pmm.getCompositeAiBuffer === 'function' ? pmm.getCompositeAiBuffer() : null;

    const showMaskOverlay = pmm ? (pmm.showOverlay !== undefined ? pmm.showOverlay : true) : true;
    const showRadialOverlay = pmm ? (radialMask.showOverlay !== undefined ? radialMask.showOverlay : (!!showMaskOverlay && pmm.activeMaskType === 'radial')) : true;
    const showLinearOverlay = pmm ? (linearMask.showOverlay !== undefined ? linearMask.showOverlay : (!!showMaskOverlay && pmm.activeMaskType === 'linear')) : true;
    const activeMaskType = pmm ? (pmm.activeTool || pmm.activeMaskType) : null;

    return {
        exposure,
        contrast,
        highlights,
        shadows,
        blacks,
        whites,
        temp,
        tint,
        saturate,
        vibrance,
        sharpness,
        aiSharpen,
        isAiEnhanceEnabled,
        clarity,
        dehaze,
        sepia,
        grayscale,
        invert,
        vignette,
        hueRotate,
        blur,
        hslHue,
        hslSat,
        hslLum,
        vKeystone,
        hKeystone,
        rotate,
        aspect,
        zoom,
        radialMask,
        linearMask,
        radialMasks,
        linearMasks,
        aiMasks,
        aiMaskCanvas,
        aiMaskBuffer,
        showMaskOverlay,
        showRadialOverlay,
        showLinearOverlay,
        activeMaskType
    };
};

window.getPhotoFilterOptions = window.getWebGLPhotoOptions;

let _photoRenderRaf = null;
function requestPhotoRepaint() {
    if (_photoRenderRaf) return;
    _photoRenderRaf = requestAnimationFrame(() => {
        _photoRenderRaf = null;
        const pl = document.getElementById('photo-layer');
        if (pl && typeof _applyPhotoTransform === 'function') _applyPhotoTransform(pl);
        document.querySelectorAll('.photo-panel').forEach(p => {
            if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p);
        });
    });
}

function applyPhotoFilters(){
    window._photoFilterDirty = true;
    if(typeof isShowingBefore !== 'undefined' && isShowingBefore) { 
        if(typeof setOriginalView === 'function') setOriginalView(false); 
    }
    const exp=+$('exposure').value,con=+$('contrast').value,sat=+$('saturate').value;
    const blur=+$('fblur').value,sep=+$('sepia').value,hue=+$('hueRotate').value;
    const gray=+$('grayscale').value,inv=+$('invertCtrl').value,temp=+$('tempCtrl').value;
    const tint=+$('tintCtrl').value,vib=+$('vibranceCtrl').value;
    const sharp=+$('sharpnessCtrl').value,clarity=+$('clarityCtrl').value,dehaze=+$('dehazeCtrl').value;
    const hl = $('highlightsCtrl') ? +$('highlightsCtrl').value : 0;
    const sh = $('shadowsCtrl') ? +$('shadowsCtrl').value : 0;
    const wh = $('whitesCtrl') ? +$('whitesCtrl').value : 0;
    const bl = $('blacksCtrl') ? +$('blacksCtrl').value : 0;
    
    // UI Label güncellemeleri
    if($('exposureVal')) $('exposureVal').textContent=exp+'%';
    if($('contrastVal')) $('contrastVal').textContent=con+'%';
    if($('highlightsVal')) $('highlightsVal').textContent=hl;
    if($('shadowsVal')) $('shadowsVal').textContent=sh;
    if($('whitesVal')) $('whitesVal').textContent=wh;
    if($('blacksVal')) $('blacksVal').textContent=bl;
    if($('saturateVal')) $('saturateVal').textContent=sat+'%';
    if($('fblurVal')) $('fblurVal').textContent=blur+'px';
    if($('sepiaVal')) $('sepiaVal').textContent=sep+'%';
    if($('hueRotateVal')) $('hueRotateVal').textContent=hue+'°';
    if($('grayscaleVal')) $('grayscaleVal').textContent=gray+'%';
    if($('invertVal')) $('invertVal').textContent=inv+'%';
    if($('tempVal')) $('tempVal').textContent=temp;
    if($('tintVal')) $('tintVal').textContent=tint;
    if($('vibranceVal')) $('vibranceVal').textContent=vib;
    if($('sharpnessVal')) $('sharpnessVal').textContent=sharp;
    if($('clarityVal')) $('clarityVal').textContent=clarity;
    if($('dehazeVal')) $('dehazeVal').textContent=dehaze;
    
    const v=$('vignette').value;
    if(typeof vignetteLayer !== 'undefined' && vignetteLayer) vignetteLayer.style.opacity=v/100;
    if($('vignetteVal')) $('vignetteVal').textContent=v+'%';
    
    // Keystone etiketleri (varsa)
    if($('keystoneVVal')) $('keystoneVVal').textContent = ($('keystoneV') ? $('keystoneV').value : 0) + '°';
    if($('keystoneHVal')) $('keystoneHVal').textContent = ($('keystoneH') ? $('keystoneH').value : 0) + '°';
    if($('keystoneRotateVal')) $('keystoneRotateVal').textContent = ($('keystoneRotate') ? $('keystoneRotate').value : 0) + '°';
    if($('keystoneAspectVal')) $('keystoneAspectVal').textContent = ($('keystoneAspect') ? $('keystoneAspect').value : 0);
    if($('keystoneZoomVal')) $('keystoneZoomVal').textContent = ($('keystoneZoom') ? $('keystoneZoom').value : 100) + '%';
    
    if (window.WebGLPhotoEngine && window.WebGLPhotoEngine.initialized) {
        // WebGL devredeyken DOM filter'ı temizle (çift filtreleme ve bulanıklığı önle)
        if (typeof photoLayer !== 'undefined' && photoLayer) photoLayer.style.filter = 'none';
        document.querySelectorAll('.photo-panel').forEach(p => p.style.filter = 'none');
        
        // Canvas'ı GPU motoru ile yeniden çiz
        requestPhotoRepaint();
    } else {
        // WebGL desteklenmiyorsa eski CSS filtresi yedeği
        let effectiveSat=sat+vib*0.5;
        let effectiveContrast=con+clarity*0.4+dehaze*0.3;
        let effectiveBrightness=exp+dehaze*0.15;
        let effectiveHue=hue+temp*0.3-tint*0.3;
        let filter='brightness('+effectiveBrightness+'%) contrast('+effectiveContrast+'%) saturate('+effectiveSat+'%) blur('+blur+'px) sepia('+sep+'%) hue-rotate('+effectiveHue+'deg) grayscale('+gray+'%) invert('+inv+'%)';
        if(sharp>0)filter+=' drop-shadow(0 0 0.5px rgba(0,0,0,'+(sharp/200)+'))';
        if (typeof photoLayer !== 'undefined' && photoLayer) photoLayer.style.filter=filter;
        document.querySelectorAll('.photo-panel').forEach(p=>p.style.filter=filter);
    }
}

function resetFilters(){
    Object.keys(FILTER_DEFAULTS).forEach(id=>{if($(id))$(id).value=FILTER_DEFAULTS[id]});
    document.querySelectorAll('.hsl-slider').forEach(s => {
        s.value = 0;
        const valSpan = document.getElementById('hsl_'+s.dataset.type+'_'+s.dataset.color+'Val');
        if(valSpan) valSpan.textContent = '0';
    });
    
    // Ton Eğrisini Sıfırla
    if (window.PhotoCurvesManager && typeof window.PhotoCurvesManager.resetAllChannels === 'function') {
        window.PhotoCurvesManager.resetAllChannels();
    }
    
    // Maskeleri Sıfırla
    if (window.PhotoMasksManager) {
        if (typeof window.PhotoMasksManager.resetAll === 'function') {
            window.PhotoMasksManager.resetAll();
        } else {
            window.PhotoMasksManager.toggleRadial(false);
            window.PhotoMasksManager.toggleLinear(false);
            window.PhotoMasksManager.toggleOverlay(false);
        }
    }

    // AI Netleştirmeyi Kapat
    if (typeof window.togglePhotoAiEnhance === 'function' && window._photoAiEnabled) {
        window.togglePhotoAiEnhance(false);
    }

    if(typeof processHSL === 'function') processHSL();
    applyPhotoFilters();
    if(typeof applyShadowHighlight === 'function') applyShadowHighlight();
}

function autoFitPerspective() {
    const vKey = (document.getElementById('keystoneV') ? parseFloat(document.getElementById('keystoneV').value) : 0) / 100.0;
    const hKey = (document.getElementById('keystoneH') ? parseFloat(document.getElementById('keystoneH').value) : 0) / 100.0;
    const rotate = document.getElementById('keystoneRotate') ? parseFloat(document.getElementById('keystoneRotate').value) : 0;
    const aspect = (document.getElementById('keystoneAspect') ? parseFloat(document.getElementById('keystoneAspect').value) : 0) / 100.0;

    // Eğer hiçbir perspektif dönüşümü uygulanmamışsa %100'e getir
    if (Math.abs(vKey) < 0.001 && Math.abs(hKey) < 0.001 && Math.abs(rotate) < 0.001 && Math.abs(aspect) < 0.001) {
        const zoomEl = document.getElementById('keystoneZoom');
        if (zoomEl) zoomEl.value = 100;
        if (document.getElementById('keystoneZoomVal')) document.getElementById('keystoneZoomVal').textContent = '100%';
        applyPhotoFilters();
        return;
    }

    // Tepe noktası gölgelendiricisindeki projektif dönüşüm fonksiyonu
    function transform(x, y) {
        let px = x, py = y;
        const kY = vKey * 0.45;
        const kX = hKey * 0.45;
        let w = Math.max(1.0 - (py * kY + px * kX), 0.15);
        px /= w;
        py /= w;
        if (aspect > 0) py *= (1.0 + aspect * 0.5);
        else if (aspect < 0) px *= (1.0 - aspect * 0.5);
        if (Math.abs(rotate) > 0.0001) {
            const rad = (rotate * Math.PI) / 180.0;
            const c = Math.cos(rad), s = Math.sin(rad);
            const rx = px * c - py * s;
            const ry = px * s + py * c;
            px = rx; py = ry;
        }
        return { x: px, y: py };
    }

    // Deforme olmuş görselin 4 dış köşe noktası
    const corners = [
        transform(-1,  1), // Üst-Sol
        transform( 1,  1), // Üst-Sağ
        transform( 1, -1), // Alt-Sağ
        transform(-1, -1)  // Alt-Sol
    ];

    // Tuvalin 4 köşesinin ([-1, 1] x [-1, 1]) hiçbir boşluk bırakmadan
    // görselin içine tam girmesi için gereken minimum ölçeklendirme (zoom) faktörü
    let maxZoom = 1.0;
    for (let i = 0; i < 4; i++) {
        const p1 = corners[i];
        const p2 = corners[(i + 1) % 4];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        let nx = -dy;
        let ny = dx;
        let c = -(nx * p1.x + ny * p1.y);
        if (c < 0) {
            nx = -nx;
            ny = -ny;
            c = -c;
        }
        const requiredZoom = (Math.abs(nx) + Math.abs(ny)) / Math.max(c, 0.0001);
        if (requiredZoom > maxZoom) maxZoom = requiredZoom;
    }

    // % cinsinden tamsayı ve en az 100
    let zoomPercent = Math.max(100, Math.ceil(maxZoom * 100));
    const zoomEl = document.getElementById('keystoneZoom');
    if (zoomEl) {
        if (zoomPercent > parseInt(zoomEl.max || '200')) {
            zoomEl.max = zoomPercent + 20;
        }
        zoomEl.value = zoomPercent;
    }
    if (document.getElementById('keystoneZoomVal')) {
        document.getElementById('keystoneZoomVal').textContent = zoomPercent + '%';
    }
    applyPhotoFilters();
}

function resetPerspective() {
    ['keystoneV', 'keystoneH', 'keystoneRotate', 'keystoneAspect'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = 0;
    });
    const zoomEl = document.getElementById('keystoneZoom');
    if (zoomEl) zoomEl.value = 100;
    applyPhotoFilters();
}

window.autoFitPerspective = autoFitPerspective;
window.resetPerspective = resetPerspective;

function applyPreset(name){
    const p = PRESETS[name];
    if(!p) return;
    
    Object.keys(FILTER_DEFAULTS).forEach(id=>{if(document.getElementById(id))document.getElementById(id).value=FILTER_DEFAULTS[id]});
    Object.keys(p).forEach(k=>{if(document.getElementById(k))document.getElementById(k).value=p[k]});
    
    // CSS filtreleri / WebGL anında uygula
    if(typeof applyPhotoFilters === 'function') applyPhotoFilters();
    // Piksel motoru senkron çalıştır
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

function hasActiveWebGLFilters(opts) {
    if (!opts) return false;
    if (Math.abs(opts.exposure || 0) > 0.001) return true;
    if (Math.abs(opts.contrast || 0) > 0.001) return true;
    if (Math.abs(opts.highlights || 0) > 0.001) return true;
    if (Math.abs(opts.shadows || 0) > 0.001) return true;
    if (Math.abs(opts.whites || 0) > 0.001) return true;
    if (Math.abs(opts.blacks || 0) > 0.001) return true;
    if (Math.abs(opts.temp || 0) > 0.001) return true;
    if (Math.abs(opts.tint || 0) > 0.001) return true;
    if (Math.abs((opts.saturate !== undefined ? opts.saturate : 1.0) - 1.0) > 0.01) return true;
    if (Math.abs(opts.vibrance || 0) > 0.001) return true;
    if ((opts.sharpness || 0) > 0.001 || (opts.aiSharpen || 0) > 0.001) return true;
    if ((opts.clarity || 0) > 0.001 || (opts.dehaze || 0) > 0.001) return true;
    if ((opts.sepia || 0) > 0.001 || (opts.grayscale || 0) > 0.001 || (opts.invert || 0) > 0.001 || (opts.vignette || 0) > 0.001) return true;
    if (Math.abs(opts.hueRotate || 0) > 0.001 || (opts.blur || 0) > 0.001) return true;
    if (Math.abs(opts.vKeystone || 0) > 0.001 || Math.abs(opts.hKeystone || 0) > 0.001 || Math.abs(opts.rotate || 0) > 0.001 || Math.abs((opts.aspect || 0)) > 0.001) return true;
    if (opts.hslHue && Array.from(opts.hslHue).some(v => Math.abs(v) > 0.001)) return true;
    if (opts.hslSat && Array.from(opts.hslSat).some(v => Math.abs(v) > 0.001)) return true;
    if (opts.hslLum && Array.from(opts.hslLum).some(v => Math.abs(v) > 0.001)) return true;
    if (opts.radialMasks && opts.radialMasks.some(m => m.active)) return true;
    if (opts.linearMasks && opts.linearMasks.some(m => m.active)) return true;
    if (opts.aiMasks && opts.aiMasks.some(m => m.active)) return true;
    return false;
}
window.hasActiveWebGLFilters = hasActiveWebGLFilters;

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
    
    if (canvas.width !== finalW || canvas.height !== finalH) {
        canvas.width = finalW;
        canvas.height = finalH;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
    }
    
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
    
    const effectiveScaleX = canvas.width / boxW;
    const effectiveScaleY = canvas.height / boxH;
    let trX = Math.round(panX * effectiveScaleX);
    let trY = Math.round(panY * effectiveScaleY);
    
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(trX, trY);
    ctx.translate(-cx, -cy);
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = window._isPhotoDragging ? 'low' : 'high';
    
    let imageDrawn = false;
    if (window.isShowingBefore) {
        // Öncesi / Sonrası Orijinal Görünümü: Ham, filtrelenmemiş saf görseli çiz
        ctx.filter = 'none';
        ctx.drawImage(img, baseX, baseY, drawW, drawH);
        imageDrawn = true;
    } else if (window.WebGLPhotoEngine && window.WebGLPhotoEngine.initialized && typeof window.getWebGLPhotoOptions === 'function') {
        const opts = window.getWebGLPhotoOptions();
        const hasFilters = hasActiveWebGLFilters(opts);
        
        if (!hasFilters) {
            // ⚡ SIFIR GECİKME: Hiçbir filtre aktif değilken doğrudan donanım hızlandırmalı GPU blit (0.2ms, 120 FPS akıcı!)
            ctx.filter = 'none';
            ctx.drawImage(img, baseX, baseY, drawW, drawH);
            imageDrawn = true;
        } else {
            // ⚡ FİLTRELER AKTİFKEN: Sadece filtreler değiştiğinde WebGL render et;
            // Fotoğrafı taşırken (pan/zoom) her karede WebGL render çalıştırma, önbellekten çiz (0.2ms)!
            try {
                if (window._photoFilterDirty || !el._cachedGlCanvas || el._cachedGlCanvas.width !== drawW || el._cachedGlCanvas.height !== drawH) {
                    window.WebGLPhotoEngine.uploadImage(img);
                    const glCanvas = window.WebGLPhotoEngine.render(drawW, drawH, opts);
                    if (glCanvas) {
                        if (!el._cachedGlCanvas) {
                            el._cachedGlCanvas = document.createElement('canvas');
                        }
                        if (el._cachedGlCanvas.width !== drawW || el._cachedGlCanvas.height !== drawH) {
                            el._cachedGlCanvas.width = drawW;
                            el._cachedGlCanvas.height = drawH;
                        }
                        const cCtx = el._cachedGlCanvas.getContext('2d');
                        cCtx.clearRect(0, 0, drawW, drawH);
                        if (opts.blur && opts.blur > 0) {
                            cCtx.filter = 'blur(' + opts.blur + 'px)';
                        } else {
                            cCtx.filter = 'none';
                        }
                        cCtx.drawImage(glCanvas, 0, 0, drawW, drawH);
                        cCtx.filter = 'none';
                        window._photoFilterDirty = false;
                    }
                }
                if (el._cachedGlCanvas) {
                    ctx.drawImage(el._cachedGlCanvas, baseX, baseY, drawW, drawH);
                    imageDrawn = true;
                }
            } catch(err) {
                console.warn('WebGL render hatası, 2D fallback yapılıyor:', err);
                imageDrawn = false;
            }
        }
    }
    
    if (!imageDrawn) {
        let filter = inner.style.filter || el.style.filter;
        if (filter && filter !== 'none' && window.isExportingNow) {
            ctx.filter = filter;
        }
        ctx.drawImage(img, baseX, baseY, drawW, drawH);
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

