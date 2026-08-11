// ========== FOTOĞRAF ZOOM & PAN v4 - TRANSFORM ==========
console.log('🎬 Zoom modülü v4 başlıyor...');

// Photo panel'i transform'a hazırla


// Transform uygula (SADECE iç div'e)


// ========== YARDIMCI: Zoom yapılabilir eleman bul ==========


// ========== TEKERLEK - ZOOM ==========
document.addEventListener('wheel', function(e){
    var el = _getZoomTarget(e.target);
    if(!el) return;
    
    e.preventDefault();
    _preparePhoto(el); console.log('panel bg:', el.style.backgroundImage);
    
    var s = parseFloat(el.dataset.zpScale) || 1;
    s = e.deltaY < 0 ? s + 0.1 : s - 0.1;
    if(s < 0.3) s = 0.3;
    if(s > 5) s = 5;
    
    el.dataset.zpScale = s;
    if (isNaN(window.panX)) window.panX = 0;
        if (isNaN(window.panY)) window.panY = 0;
        if (isNaN(window.scaleFactor)) window.scaleFactor = 1;
        _applyPhotoTransform(el);
    if(typeof redrawAll === 'function') redrawAll();
    console.log('Zoom:', s.toFixed(2));
}, { passive: false });

// ========== SÜRÜKLEME ==========
var _dragEl = null, _dsx, _dsy, _dix, _diy;

window.spaceBarPressed = false;

function isTextInput(el) {
    if (!el) return false;
    if (el.tagName === 'TEXTAREA') return true;
    if (el.tagName === 'INPUT') {
        const type = el.type.toLowerCase();
        return ['text', 'password', 'number', 'email', 'url', 'search', 'tel'].includes(type);
    }
    return false;
}

window.addEventListener('keydown', e => { 
    if (e.code === 'Space') { 
        window.spaceBarPressed = true; 
        if (!isTextInput(document.activeElement)) {
            e.preventDefault(); 
            if (document.activeElement) document.activeElement.blur();
        }
    } 
});
window.addEventListener('keyup', e => { 
    if (e.code === 'Space') {
        window.spaceBarPressed = false; 
        if (!isTextInput(document.activeElement)) {
            e.preventDefault(); 
        }
    }
});

document.addEventListener('mousedown', function(e){
    const isObj = e.target.closest && e.target.closest('.draggable, .is-svg-icon, .editable-draw, .callout-wrap, .callout-item, .co-neon-block');
    const hasImage = typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl;
    
    if (!isObj && !hasImage) {
        return; 
    }

    var el = _getZoomTarget(e.target);
    const hasPhoto = el && ((el.style.backgroundImage && el.style.backgroundImage !== 'none') || el.querySelector('.photo-inner-zoom') || el.tagName.toLowerCase() === 'img');
    if (!hasPhoto) return;
    
    _preparePhoto(el);
    
    _dragEl = el;
    _dsx = e.clientX;
    _dsy = e.clientY;
    _dix = parseFloat(el.dataset.zpX) || 0;
    _diy = parseFloat(el.dataset.zpY) || 0;
    
    el.style.cursor = 'grabbing';
    e.preventDefault();
});

document.addEventListener('mousemove', function(e){
    if(!_dragEl) return;

    if (e.pointerType === 'pen' && e.buttons === 0) return;
    const isMouse = e.pointerType === 'mouse' || typeof e.pointerType === 'undefined';
    if ((typeof uploadedImgUrl === 'undefined' || !uploadedImgUrl) && !isMouse) return;
    
    var sf = typeof scaleFactor !== 'undefined' ? scaleFactor : 1;
    if (sf <= 0) sf = 1;
    var s = parseFloat(_dragEl.dataset.zpScale) || 1;
    var x = _dix + (e.clientX - _dsx) / (sf * s);
    var y = _diy + (e.clientY - _dsy) / (sf * s);
    
    _dragEl.dataset.zpX = x;
    _dragEl.dataset.zpY = y;
        if (window.debugLog) window.debugLog('HATA: photo-zoom pan yapıyor!');
        if (isNaN(window.panX)) window.panX = 0;
    if (isNaN(window.panY)) window.panY = 0;
    if (isNaN(window.scaleFactor)) window.scaleFactor = 1;
    _applyPhotoTransform(_dragEl);
    if(typeof redrawAll === 'function') redrawAll();
});

document.addEventListener('mouseup', function(){
    if(_dragEl) _dragEl.style.cursor = 'grab';
    _dragEl = null;
});

// ========== TOUCH: PINCH TO ZOOM & PAN ==========
var _initialPinchDist = null;
var _initialPinchScale = null;

var _touchTimer = null;
var _touchStartTime = 0;
var _touchMoved = false;

document.addEventListener('touchstart', function(e){
    const isObj = e.target.closest && e.target.closest('.draggable, .is-svg-icon, .editable-draw, .callout-wrap, .callout-item, .co-neon-block');
    const hasImage = typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl;
    
    if (!isObj && !hasImage) {
        return; 
    }

    var el = _getZoomTarget(e.target);
    if(!el) return;

    if(document.getElementById('photoLockToggle') && document.getElementById('photoLockToggle').checked) return;

    if(e.touches.length === 2) {
        e.preventDefault();
        _initialPinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        _preparePhoto(el);
        _initialPinchScale = parseFloat(el.dataset.zpScale) || 1;
        _dragEl = null;
        if(_touchTimer) { clearTimeout(_touchTimer); _touchTimer = null; }
    } else if(e.touches.length === 1) {
        const canPanWithLeftClick = (typeof drawMode === 'undefined' || drawMode === 'off' || drawMode === null);
        if(!canPanWithLeftClick) return;
        
        _preparePhoto(el);
        _dsx = e.touches[0].clientX;
        _dsy = e.touches[0].clientY;
        _dix = parseFloat(el.dataset.zpX) || 0;
        _diy = parseFloat(el.dataset.zpY) || 0;
        
        _touchStartTime = Date.now();
        _touchMoved = false;
        
        if (window.isPhotoLocked) {
            if (window.longPressUnlocked) {
                _dragEl = el;
            } else {
                _touchTimer = setTimeout(function() {
                    window.longPressUnlocked = true;
                    _dragEl = el;
                    if(navigator.vibrate) navigator.vibrate(50);
                    console.log("Uzun basma ile kaydırma kalıcı aktif (Mobil)");
                }, 400);
            }
        } else {
            _dragEl = el;
        }
    }
}, {passive: false});

document.addEventListener('touchmove', function(e){
    if(e.touches.length === 2 && _initialPinchDist !== null) {
        e.preventDefault();
        var el = _getZoomTarget(e.target);
        if(!el) return;
        
        var currentDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        var ratio = currentDist / _initialPinchDist;
        var s = _initialPinchScale * ratio;
        
        if(s < 0.3) s = 0.3;
        if(s > 5) s = 5;
        
        el.dataset.zpScale = s;
        if (isNaN(window.panX)) window.panX = 0;
        if (isNaN(window.panY)) window.panY = 0;
        if (isNaN(window.scaleFactor)) window.scaleFactor = 1;
        _applyPhotoTransform(el);
        if(typeof redrawAll === 'function') redrawAll();
    } else if(e.touches.length === 1 && _dragEl) {
        if (typeof uploadedImgUrl === 'undefined' || !uploadedImgUrl) return; // Empty canvas pan guard
        e.preventDefault();
        var sf = typeof scaleFactor !== 'undefined' ? scaleFactor : 1;
        if (sf <= 0) sf = 1;
        var s = parseFloat(_dragEl.dataset.zpScale) || 1;
        var x = _dix + (e.touches[0].clientX - _dsx) / (sf * s);
        var y = _diy + (e.touches[0].clientY - _dsy) / (sf * s);
        
        _dragEl.dataset.zpX = x;
        _dragEl.dataset.zpY = y;
        if (window.debugLog) window.debugLog('HATA: photo-zoom pan yapıyor!');
        if (isNaN(window.panX)) window.panX = 0;
    if (isNaN(window.panY)) window.panY = 0;
    if (isNaN(window.scaleFactor)) window.scaleFactor = 1;
    _applyPhotoTransform(_dragEl);
        if(typeof redrawAll === 'function') redrawAll();
    }
}, {passive: false});

document.addEventListener('touchend', function(e){
    if(e.touches.length < 2) {
        _initialPinchDist = null;
        _initialPinchScale = null;
    }
    if(e.touches.length === 0) {
        _dragEl = null;
    }
});

// ========== ÇİFT TIK - SIFIRLA ==========
document.addEventListener('dblclick', function(e){
    // Sürgülere (Slider) çift tıklanınca varsayılan değere dönme mantığı
    if (e.target.tagName.toLowerCase() === 'input' && e.target.type === 'range') {
        const input = e.target;
        let defaultVal = null;
        const id = input.id;
        
        if (input.classList.contains('hsl-slider')) {
            defaultVal = 0;
        } else if (typeof FILTER_DEFAULTS !== 'undefined' && FILTER_DEFAULTS[id] !== undefined) {
            defaultVal = FILTER_DEFAULTS[id];
        } else if (id === 'zoomCtrl') {
            defaultVal = 100;
        } else if (id === 'photoZoomCtrl') {
            defaultVal = 100;
        } else if (id === 'photoXCtrl' || id === 'photoYCtrl') {
            defaultVal = 50;
        } else if (id === 'panX' || id === 'panY') {
            defaultVal = 50;
        } else if (id === 'deOpacity') {
            defaultVal = 100;
        } else if (id === 'deFillOp') {
            defaultVal = 0;
        }
        
        if (defaultVal !== null) {
            input.value = defaultVal;
            input.dispatchEvent(new Event('input'));
            if (input.classList.contains('hsl-slider') && typeof processHSL === 'function') {
                processHSL();
            }
        }
        return; // İşlemi burada kes, foto zoom sıfırlamasına gitme
    }

    // Çizim modundaysa fotoğrafı sıfırlama (Çift tık çizimi bitirir, fotoğrafı değil)
    if (typeof drawMode !== 'undefined' && drawMode !== 'off') return;

    // Orijinal Zoom Sıfırlama Mantığı
    var el = _getZoomTarget(e.target);
    if(!el) {
        if(e.target.id === 'ui-layer' || e.target.id === 'canvas-container' || e.target.id === 'draw-layer') {
            el = document.getElementById('photo-layer');
        }
    }
    if(!el) return;
    
    el.dataset.zpScale = 1;
    el.dataset.zpX = 0;
    el.dataset.zpY = 0;
    
    const zCtrl = document.getElementById('photoZoomCtrl');
    const xCtrl = document.getElementById('photoXCtrl');
    const yCtrl = document.getElementById('photoYCtrl');
    if(zCtrl) { zCtrl.value = 100; zCtrl.dispatchEvent(new Event('input')); }
    if(xCtrl) { xCtrl.value = 50; xCtrl.dispatchEvent(new Event('input')); }
    if(yCtrl) { yCtrl.value = 50; yCtrl.dispatchEvent(new Event('input')); }
    
    if (isNaN(window.panX)) window.panX = 0;
        if (isNaN(window.panY)) window.panY = 0;
        if (isNaN(window.scaleFactor)) window.scaleFactor = 1;
        _applyPhotoTransform(el);
    if(typeof redrawAll === 'function') redrawAll();
    console.log('Sıfırlandı');
});

console.log('🎬 Zoom v6 (photo-panel + photo-layer) yüklendi');
