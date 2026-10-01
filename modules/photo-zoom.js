// ==================== PHOTO ZOOM & PAN ====================
// ========== FOTOĞRAF ZOOM & PAN v4 - TRANSFORM ==========
console.log('🎬 Zoom modülü v4 başlıyor...');

// Photo panel'i transform'a hazırla


// Transform uygula (SADECE iç div'e)


// ========== YARDIMCI: Zoom yapılabilir eleman bul ==========
function _getZoomTarget(target) {
    if (!target) return null;
    var pl = document.getElementById('photo-layer') || document.querySelector('.photo-panel');
    
    // Space tuşuna basılıyken tuval alanı üzerindeki herhangi bir tıklama (SVG, ikon, metin, çizim vb.) doğrudan fotoğrafı pan yapsın
    if (window.spaceBarPressed) {
        if (target === pl || (target.closest && target.closest('#canvas-container, .preview-area, .canvas-wrapper, #maskInteractiveSvg, #draw-layer, #photo-layer, .photo-panel'))) {
            return pl;
        }
    }

    if (target.closest && target.closest('.editable-draw, .draggable, .canvas-el, .cvi-item, .added-icon, .callout-wrap, .svg-callout, .co-neon-block, .vertex-handle, .text-handle, .text-rotate-handle, .text-resize-handle, .callout-controls, .callout-resizer, .callout-rotator, .arrow-heads-group, .color-picker, .ui-panel, button, input, select, textarea')) {
        return null;
    }
    var el = target;
    if (el && el.classList && el.classList.contains('photo-inner-zoom')) el = el.parentElement;
    if (!el || !el.classList) return null;
    if (el.classList.contains('photo-panel') || el.id === 'photo-layer') return el;
    var photoLayer = el.closest && el.closest('#photo-layer');
    if (photoLayer) return photoLayer;
    if (el.id === 'canvas-container' || (el.classList && el.classList.contains('canvas-wrapper')) || (el.closest && el.closest('#canvas-container'))) {
        if (pl) return pl;
    }
    return null;
}
window._getZoomTarget = _getZoomTarget;

function _isPhotoLocked(ignoreSpace = false) {
    // Space pan aktifken araç kilitlerini (çizim modu, maske kılavuzları vb.) geçersiz kıl
    if (!ignoreSpace && window.spaceBarPressed) return false;

    if (window.AppState && window.AppState.photo && window.AppState.photo.isLocked) return true;
    if (window.isPhotoLocked === true) return true;
    const lockToggle = document.getElementById('photoLockToggle');
    if (lockToggle && lockToggle.checked) return true;
    const lockBtn = document.getElementById('lockPhotoBtn');
    if (lockBtn && lockBtn.classList.contains('active')) return true;
    if (typeof drawMode !== 'undefined' && drawMode !== null && drawMode !== 'off') return true;
    if (typeof polyMarqueeBox !== 'undefined' && polyMarqueeBox) return true;
    if (document.querySelector('.poly-marquee-box')) return true;
    if (window.PhotoMasksManager && window.PhotoMasksManager.isGuidesVisible) return true;
    return false;
}

// ========== SPACE TUŞU & İMLEÇ YÖNETİMİ ==========
window.spaceBarPressed = false;

function updateSpacePanCursor(active, dragging = false) {
    if (active) {
        document.body.classList.add('space-pan-active');
        if (dragging) {
            document.body.classList.add('space-pan-dragging');
        } else {
            document.body.classList.remove('space-pan-dragging');
        }
    } else {
        document.body.classList.remove('space-pan-active', 'space-pan-dragging');
    }
}
window.updateSpacePanCursor = updateSpacePanCursor;

window.addEventListener('keydown', e => { 
    if (e.code === 'Space') { 
        const ae = document.activeElement;
        if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) {
            return; 
        }
        e.preventDefault(); 
        if (!window.spaceBarPressed) {
            window.spaceBarPressed = true;
            updateSpacePanCursor(true, false);
            if (window.CloneStamp && window.CloneStamp.isActive) window.CloneStamp.renderSvg();
            if (window.PhotoMasksManager && window.PhotoMasksManager.isGuidesVisible) window.PhotoMasksManager.renderSvg();
        }
    } 
}, { capture: true });

window.addEventListener('keyup', e => { 
    if (e.code === 'Space') {
        window.spaceBarPressed = false;
        updateSpacePanCursor(false, false);
        if (window.CloneStamp && window.CloneStamp.isActive) window.CloneStamp.renderSvg();
        if (window.PhotoMasksManager && window.PhotoMasksManager.isGuidesVisible) window.PhotoMasksManager.renderSvg();
    } 
}, { capture: true });

window.addEventListener('blur', () => {
    if (window.spaceBarPressed) {
        window.spaceBarPressed = false;
        updateSpacePanCursor(false, false);
    }
});

// ========== TEKERLEK - ZOOM (Ctrl veya Space ile veya Boşta) ==========
document.addEventListener('wheel', function(e){
    const isZoomOverride = e.ctrlKey || window.spaceBarPressed;
    if (!isZoomOverride && _isPhotoLocked()) return;

    var el = _getZoomTarget(e.target);
    if (!el && isZoomOverride) {
        el = document.getElementById('photo-layer') || document.querySelector('.photo-panel');
    }
    if(!el) return;
    
    e.preventDefault();
    e.stopPropagation();
    _preparePhoto(el);
    
    var s = parseFloat(el.dataset.zpScale) || 1;
    var step = (s > 2) ? 0.2 : 0.1;
    s = e.deltaY < 0 ? s + step : s - step;
    if(s < 0.3) s = 0.3;
    if(s > 8.0) s = 8.0;
    
    el.dataset.zpScale = s;
    _applyPhotoTransform(el);

    if (window.CloneStamp && window.CloneStamp.isActive) window.CloneStamp.renderSvg();
    if (window.PhotoMasksManager && window.PhotoMasksManager.isGuidesVisible) window.PhotoMasksManager.renderSvg();
}, { passive: false, capture: true });

// ========== SÜRÜKLEME (PAN) ==========
var _dragEl = null, _dsx, _dsy, _dix, _diy;

function startPhotoPan(el, e) {
    _preparePhoto(el);
    window._isPhotoDragging = true;
    _dragEl = el;
    _dsx = e.clientX;
    _dsy = e.clientY;
    _dix = parseFloat(el.dataset.zpX) || 0;
    _diy = parseFloat(el.dataset.zpY) || 0;
    
    updateSpacePanCursor(true, true);
    document.addEventListener('mousemove', _onPhotoPointerMove);
    document.addEventListener('mouseup', _onPhotoPointerUp);
}

// 1. Capture Phase: Space + Sol Tık ile Anında Pan (Araçların çizim yapmasını engeller)
document.addEventListener('mousedown', function(e){
    if (window.spaceBarPressed && e.button === 0) {
        var el = _getZoomTarget(e.target);
        if (el) {
            e.preventDefault();
            e.stopPropagation();
            startPhotoPan(el, e);
            return;
        }
    }
}, { capture: true });

// 2. Normal Phase: Standart Sol Tık Pan (Araçlar aktif değilken)
document.addEventListener('mousedown', function(e){
    if(_isPhotoLocked()) return;
    var el = _getZoomTarget(e.target);
    if(!el) return;
    
    const isModifierPressed = e.ctrlKey || e.altKey || e.metaKey;
    const canPanWithLeftClick = (typeof drawMode === 'undefined' || drawMode === 'off' || drawMode === null) && !isModifierPressed;
    
    if(e.button === 0 && !window.spaceBarPressed && !canPanWithLeftClick) return;
    if(e.button !== 0 && e.button !== 1) return;
    
    const hasPhoto = el && ((el.style.backgroundImage && el.style.backgroundImage !== 'none') || el.querySelector('.photo-inner-zoom') || el.tagName.toLowerCase() === 'img');
    if (!hasPhoto) return;
    
    e.preventDefault();
    startPhotoPan(el, e);
});

var _photoMoveRAF = null;
var _lastMoveEvt = null;

function _onPhotoPointerMove(e) {
    if (!_dragEl) {
        _onPhotoPointerUp();
        return;
    }
    if (!window.spaceBarPressed && _isPhotoLocked(true)) {
        _onPhotoPointerUp();
        return;
    }
    
    _lastMoveEvt = { clientX: e.clientX, clientY: e.clientY };
    if (_photoMoveRAF) return;
    
    _photoMoveRAF = requestAnimationFrame(function(){
        _photoMoveRAF = null;
        if (!_dragEl || (!window.spaceBarPressed && _isPhotoLocked(true)) || !_lastMoveEvt) {
            _onPhotoPointerUp();
            return;
        }
        
        window._isPhotoDragging = true;
        var sf = typeof scaleFactor !== 'undefined' ? scaleFactor : 1;
        if (sf <= 0) sf = 1;
        var s = parseFloat(_dragEl.dataset.zpScale) || 1;
        var x = _dix + (_lastMoveEvt.clientX - _dsx) / (sf * s);
        var y = _diy + (_lastMoveEvt.clientY - _dsy) / (sf * s);
        
        x = Math.max(-5000, Math.min(5000, x));
        y = Math.max(-5000, Math.min(5000, y));

        _dragEl.dataset.zpX = x;
        _dragEl.dataset.zpY = y;
        _applyPhotoTransform(_dragEl);

        if (window.CloneStamp && window.CloneStamp.isActive) {
            window.CloneStamp.renderSvg();
        }
        if (window.PhotoMasksManager && window.PhotoMasksManager.isGuidesVisible) {
            window.PhotoMasksManager.renderSvg();
        }
    });
}

function _onPhotoPointerUp() {
    document.removeEventListener('mousemove', _onPhotoPointerMove);
    document.removeEventListener('mouseup', _onPhotoPointerUp);

    if (_photoMoveRAF) {
        cancelAnimationFrame(_photoMoveRAF);
        _photoMoveRAF = null;
    }
    window._isPhotoDragging = false;
    window._cachedPhotoPanelMetrics = null;
    updateSpacePanCursor(window.spaceBarPressed, false);

    if(_dragEl) {
        var elToBake = _dragEl;
        _dragEl = null;
        _applyPhotoTransform(elToBake);

        if (window.CloneStamp && window.CloneStamp.isActive) {
            window.CloneStamp.renderSvg();
        }
        if (window.PhotoMasksManager && window.PhotoMasksManager.isGuidesVisible) {
            window.PhotoMasksManager.renderSvg();
        }
    }
}

// ========== TOUCH: PINCH TO ZOOM & PAN ==========
var _initialPinchDist = null;
var _initialPinchScale = null;

document.addEventListener('touchstart', function(e){
    if(_isPhotoLocked()) return;
    var el = _getZoomTarget(e.target);
    if(!el) return;

    if(e.touches.length === 2) {
        // Pinch to zoom başladı
        e.preventDefault();
        _initialPinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        _preparePhoto(el);
        _initialPinchScale = parseFloat(el.dataset.zpScale) || 1;
        _dragEl = null; // Pinch yaparken pan iptal
    } else if(e.touches.length === 1) {
        const canPanWithLeftClick = (typeof drawMode === 'undefined' || drawMode === 'off' || drawMode === null);
        if(!canPanWithLeftClick) return;
        
        _preparePhoto(el);
        window._isPhotoDragging = true;
        _dragEl = el;
        _dsx = e.touches[0].clientX;
        _dsy = e.touches[0].clientY;
        _dix = parseFloat(el.dataset.zpX) || 0;
        _diy = parseFloat(el.dataset.zpY) || 0;
    }
}, {passive: false});

document.addEventListener('touchmove', function(e){
    if(_isPhotoLocked()) {
        _initialPinchDist = null;
        _dragEl = null;
        window._isPhotoDragging = false;
        window._cachedPhotoPanelMetrics = null;
        return;
    }
    if(e.touches.length === 2 && _initialPinchDist !== null) {
        e.preventDefault();
        var el = _getZoomTarget(e.target);
        if(!el) return;
        
        window._isPhotoDragging = true;
        var currentDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        var ratio = currentDist / _initialPinchDist;
        var s = _initialPinchScale * ratio;
        
        if(s < 0.3) s = 0.3;
        if(s > 5) s = 5;
        
        el.dataset.zpScale = s;
        _applyPhotoTransform(el);
    } else if(e.touches.length === 1 && _dragEl) {
        e.preventDefault();
        window._isPhotoDragging = true;
        var sf = typeof scaleFactor !== 'undefined' ? scaleFactor : 1;
        if (sf <= 0) sf = 1;
        var s = parseFloat(_dragEl.dataset.zpScale) || 1;
        var x = _dix + (e.touches[0].clientX - _dsx) / (sf * s);
        var y = _diy + (e.touches[0].clientY - _dsy) / (sf * s);
        
        // Sınırlandırma (Clamp) eklenerek fotoğrafın sonsuza kayması engellenir
        x = Math.max(-3000, Math.min(3000, x));
        y = Math.max(-3000, Math.min(3000, y));

        _dragEl.dataset.zpX = x;
        _dragEl.dataset.zpY = y;
        _applyPhotoTransform(_dragEl);
    }
}, {passive: false});

document.addEventListener('touchend', function(e){
    if(e.touches.length < 2) {
        _initialPinchDist = null;
        _initialPinchScale = null;
    }
    if(e.touches.length === 0) {
        window._isPhotoDragging = false;
        window._cachedPhotoPanelMetrics = null;
        if(_dragEl) {
            var elToBake = _dragEl;
            _dragEl = null;
            _applyPhotoTransform(elToBake);
        }
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
    
    _applyPhotoTransform(el);
    console.log('Sıfırlandı');
});

console.log('🎬 Zoom v6 (photo-panel + photo-layer) yüklendi');
