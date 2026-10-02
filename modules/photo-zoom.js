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

    // Fotoğraf kilidi serbest bırakıldığında ("Serbest" modu) tuvaldeki tıklamalar doğrudan fotoğrafı pan yapsın (etkileşimli kontrol elemanları hariç)
    if (!window.isPhotoLocked || document.body.classList.contains('photo-unlocked')) {
        if (!target.closest || !target.closest('.editable-draw, .draggable, .canvas-el, .cvi-item, .added-icon, .callout-wrap, .svg-callout, .co-neon-block, .vertex-handle, .text-handle, .text-rotate-handle, .text-resize-handle, .callout-controls, .callout-resizer, .callout-rotator, .arrow-heads-group, .color-picker, .ui-panel, button, input, select, textarea')) {
            if (target === pl || (target.closest && target.closest('#canvas-container, .preview-area, .canvas-wrapper, #maskInteractiveSvg, #draw-layer, #photo-layer, .photo-panel'))) {
                return pl;
            }
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

    // "Serbest" modunda kilit doğrudan açık (false) kabul edilir
    if (window.isPhotoLocked === false || document.body.classList.contains('photo-unlocked')) return false;

    if (window.AppState && window.AppState.photo && window.AppState.photo.isLocked) return true;
    if (window.isPhotoLocked === true) return true;
    const lockToggle = document.getElementById('photoLockToggle');
    if (lockToggle && lockToggle.checked) return true;
    const lockBtn = document.getElementById('lockPhotoBtn');
    if (lockBtn && lockBtn.classList.contains('active')) return true;
    const dockBtn = document.getElementById('dockLockBtn');
    if (dockBtn && dockBtn.classList.contains('lock-active')) return true;
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

// ========== SÜRÜKLEME (PAN) & ÇİFT TIK SIFIRLAMA ==========
var _dragEl = null, _dsx, _dsy, _dix, _diy;
var _panMoved = false;
var _lastMouseDownTime = 0;
var _lastMouseDownX = 0;
var _lastMouseDownY = 0;
var _lastCanvasClickTime = 0;
var _lastCanvasClickX = 0;
var _lastCanvasClickY = 0;
var _lastTouchStartTime = 0;
var _lastTouchStartX = 0;
var _lastTouchStartY = 0;
var _lastTouchEndTime = 0;
var _lastTouchEndX = 0;
var _lastTouchEndY = 0;

function _triggerPhotoReset() {
    _lastMouseDownTime = 0;
    _lastCanvasClickTime = 0;
    _lastTouchStartTime = 0;
    _lastTouchEndTime = 0;
    _dragEl = null;
    _panMoved = false;
    window._isPhotoDragging = false;
    if (_photoMoveRAF) {
        cancelAnimationFrame(_photoMoveRAF);
        _photoMoveRAF = null;
    }
    document.querySelectorAll('.grabbing').forEach(function(el) { el.classList.remove('grabbing'); });

    if (typeof window.resetPhotoPos === 'function') {
        window.resetPhotoPos();
    } else if (typeof window.fitImageToCanvas === 'function') {
        window.fitImageToCanvas(window.photoFitMode || 'cover');
    }
}

function startPhotoPan(el, e) {
    _preparePhoto(el);
    _panMoved = false;
    _dragEl = el;
    _dsx = e.clientX;
    _dsy = e.clientY;
    _dix = parseFloat(el.dataset.zpX) || 0;
    _diy = parseFloat(el.dataset.zpY) || 0;
    
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
    
    const hasPhoto = el && (
        (el.style.backgroundImage && el.style.backgroundImage !== 'none') || 
        el.querySelector('.photo-inner-zoom') || 
        el.querySelector('.photo-render-canvas') ||
        (el._nativeImg && el._nativeImgSrc) ||
        el.dataset.savedBg ||
        (typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl) ||
        el.tagName.toLowerCase() === 'img'
    );
    if (!hasPhoto) return;
    
    // 🎯 HIZLI ÇİFT TIKLAMA YAKALAYICI (2. Tıklama Anında Sıfırla)
    if (e.button === 0) {
        var now = Date.now();
        var timeSinceDown = now - _lastMouseDownTime;
        var distSinceDown = Math.hypot(e.clientX - _lastMouseDownX, e.clientY - _lastMouseDownY);
        
        if (timeSinceDown > 40 && timeSinceDown < 550 && distSinceDown < 40) {
            e.preventDefault();
            e.stopPropagation();
            _triggerPhotoReset();
            return;
        }
        _lastMouseDownTime = now;
        _lastMouseDownX = e.clientX;
        _lastMouseDownY = e.clientY;
    }
    
    e.preventDefault();
    startPhotoPan(el, e);
});

var _photoMoveRAF = null;
var _lastMoveEvt = null;

function _onPhotoPointerMove(e) {
    if (!_dragEl) {
        _onPhotoPointerUp(e);
        return;
    }
    if (!window.spaceBarPressed && _isPhotoLocked(true)) {
        _onPhotoPointerUp(e);
        return;
    }
    
    _lastMoveEvt = { clientX: e.clientX, clientY: e.clientY };

    // Sürükleme eşiği (Micro-drag engelleyici): 8 pikselden az titreşimlerde sürükleme başlatma
    if (!_panMoved) {
        var dist = Math.hypot(e.clientX - _dsx, e.clientY - _dsy);
        if (dist < 8) return;
        _panMoved = true;
        window._isPhotoDragging = true;
        if (_dragEl && _dragEl.classList) _dragEl.classList.add('grabbing');
        updateSpacePanCursor(true, true);
    }
    
    if (_photoMoveRAF) return;
    
    _photoMoveRAF = requestAnimationFrame(function(){
        _photoMoveRAF = null;
        if (!_dragEl || (!window.spaceBarPressed && _isPhotoLocked(true)) || !_lastMoveEvt) {
            _onPhotoPointerUp();
            return;
        }
        
        var sf = (typeof window.scaleFactor !== 'undefined' && window.scaleFactor > 0) ? window.scaleFactor : ((typeof scaleFactor !== 'undefined' && scaleFactor > 0) ? scaleFactor : 1);
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

function _onPhotoPointerUp(e) {
    document.removeEventListener('mousemove', _onPhotoPointerMove);
    document.removeEventListener('mouseup', _onPhotoPointerUp);

    if (_photoMoveRAF) {
        cancelAnimationFrame(_photoMoveRAF);
        _photoMoveRAF = null;
    }
    window._isPhotoDragging = false;
    window._cachedPhotoPanelMetrics = null;
    updateSpacePanCursor(window.spaceBarPressed, false);

    var elToBake = _dragEl;
    var wasMoved = _panMoved;
    _dragEl = null;
    _panMoved = false;

    if (elToBake && elToBake.classList) elToBake.classList.remove('grabbing');
    var pl = document.getElementById('photo-layer');
    if (pl && pl.classList) pl.classList.remove('grabbing');

    if (wasMoved && elToBake) {
        _applyPhotoTransform(elToBake);
        if (window.CloneStamp && window.CloneStamp.isActive) {
            window.CloneStamp.renderSvg();
        }
        if (window.PhotoMasksManager && window.PhotoMasksManager.isGuidesVisible) {
            window.PhotoMasksManager.renderSvg();
        }
    } else if (!wasMoved && e) {
        // Sabit tıklama (Micro-drag olmadı) -> Çift Tıklama Takibi (Mouseup Yedek)
        var cx = (typeof e.clientX !== 'undefined') ? e.clientX : 0;
        var cy = (typeof e.clientY !== 'undefined') ? e.clientY : 0;
        var now = Date.now();
        var timeDiff = now - _lastCanvasClickTime;
        var distDiff = Math.hypot(cx - _lastCanvasClickX, cy - _lastCanvasClickY);

        if (timeDiff > 40 && timeDiff < 550 && distDiff < 40) {
            _triggerPhotoReset();
            return;
        }
        _lastCanvasClickTime = now;
        _lastCanvasClickX = cx;
        _lastCanvasClickY = cy;
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
        
        // 🎯 Dokunmatik Çift Tıklama (Double-Tap) Yakalayıcı
        var now = Date.now();
        var timeDiff = now - _lastTouchStartTime;
        var distDiff = Math.hypot(e.touches[0].clientX - _lastTouchStartX, e.touches[0].clientY - _lastTouchStartY);
        if (timeDiff > 50 && timeDiff < 500 && distDiff < 50) {
            if (e.cancelable) e.preventDefault();
            _triggerPhotoReset();
            return;
        }
        _lastTouchStartTime = now;
        _lastTouchStartX = e.touches[0].clientX;
        _lastTouchStartY = e.touches[0].clientY;

        _preparePhoto(el);
        _dragEl = el;
        _panMoved = false;
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
        _panMoved = false;
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
        if (!_panMoved) {
            var dist = Math.hypot(e.touches[0].clientX - _dsx, e.touches[0].clientY - _dsy);
            if (dist < 8) return;
            _panMoved = true;
            window._isPhotoDragging = true;
            if (_dragEl && _dragEl.classList) _dragEl.classList.add('grabbing');
        }
        if (e.cancelable) e.preventDefault();
        window._isPhotoDragging = true;
        var sf = (typeof window.scaleFactor !== 'undefined' && window.scaleFactor > 0) ? window.scaleFactor : ((typeof scaleFactor !== 'undefined' && scaleFactor > 0) ? scaleFactor : 1);
        if (sf <= 0) sf = 1;
        var s = parseFloat(_dragEl.dataset.zpScale) || 1;
        var x = _dix + (e.touches[0].clientX - _dsx) / (sf * s);
        var y = _diy + (e.touches[0].clientY - _dsy) / (sf * s);
        
        // Sınırlandırma (Clamp) eklenerek fotoğrafın sonsuza kayması engellenir
        x = Math.max(-5000, Math.min(5000, x));
        y = Math.max(-5000, Math.min(5000, y));

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
        var elToBake = _dragEl;
        var wasMoved = _panMoved;
        _dragEl = null;
        _panMoved = false;

        if (elToBake && elToBake.classList) elToBake.classList.remove('grabbing');
        var pl = document.getElementById('photo-layer');
        if (pl && pl.classList) pl.classList.remove('grabbing');

        if (wasMoved && elToBake) {
            _applyPhotoTransform(elToBake);
        } else if (!wasMoved && e.changedTouches && e.changedTouches[0]) {
            var ct = e.changedTouches[0];
            var now = Date.now();
            var timeDiff = now - _lastTouchEndTime;
            var distDiff = Math.hypot(ct.clientX - _lastTouchEndX, ct.clientY - _lastTouchEndY);
            if (timeDiff > 50 && timeDiff < 500 && distDiff < 50) {
                _triggerPhotoReset();
                return;
            }
            _lastTouchEndTime = now;
            _lastTouchEndX = ct.clientX;
            _lastTouchEndY = ct.clientY;
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
    if (typeof drawMode !== 'undefined' && drawMode !== 'off' && drawMode !== null) return;

    // Etkileşimli kontrol elemanları üzerinde çift tıklandıysa fotoğrafı sıfırlama
    if (e.target.closest && e.target.closest('.canvas-el, .cvi-item, .added-icon, .vertex-handle, .text-handle, .callout-resizer, .callout-rotator, .callout-controls, .draggable, .editable-draw, .editable-text, .tb-frame-handle, .tb-floating-btn, button, input, select, textarea, .panel, .modal-overlay, .app-context-menu')) {
        return;
    }

    // Tuval veya görsel alanı üzerinde çift tıklandıysa varsayılana dön
    const isCanvasClick = (e.target.closest && e.target.closest('#canvas-container, .main-preview, .preview-area, .canvas-wrapper, .workspace, #photo-layer, .photo-panel')) ||
                          e.target.id === 'canvas-container' ||
                          e.target.id === 'photo-layer' ||
                          e.target.id === 'draw-layer' ||
                          (e.target.classList && e.target.classList.contains('photo-render-canvas'));
    if (!isCanvasClick) return;

    e.preventDefault();
    if (_photoMoveRAF) {
        cancelAnimationFrame(_photoMoveRAF);
        _photoMoveRAF = null;
    }
    _dragEl = null;
    window._isPhotoDragging = false;
    document.querySelectorAll('.grabbing').forEach(el => el.classList.remove('grabbing'));

    if (typeof window.resetPhotoPos === 'function') {
        window.resetPhotoPos();
    } else if (typeof window.fitImageToCanvas === 'function') {
        window.fitImageToCanvas(window.photoFitMode || 'cover');
    } else {
        if (typeof resizeCanvas === 'function') resizeCanvas();
        const pl = document.getElementById('photo-layer') || document.querySelector('.photo-panel');
        if (pl) {
            pl.dataset.zpScale = 1;
            pl.dataset.zpX = 0;
            pl.dataset.zpY = 0;
            if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(pl);
        }
        document.querySelectorAll('.photo-panel').forEach(p => {
            p.dataset.zpScale = 1;
            p.dataset.zpX = 0;
            p.dataset.zpY = 0;
            if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p);
        });
        const zCtrl = document.getElementById('photoZoomCtrl');
        const xCtrl = document.getElementById('photoXCtrl');
        const yCtrl = document.getElementById('photoYCtrl');
        if (zCtrl) { zCtrl.value = 100; const valEl = document.getElementById('photoZoomVal'); if (valEl) valEl.textContent = '100%'; }
        if (xCtrl) { xCtrl.value = 50; const valEl = document.getElementById('photoXVal'); if (valEl) valEl.textContent = '50%'; }
        if (yCtrl) { yCtrl.value = 50; const valEl = document.getElementById('photoYVal'); if (valEl) valEl.textContent = '50%'; }
        if (typeof applyPhotoPos === 'function') applyPhotoPos();
        if (typeof redrawAll === 'function') redrawAll();
    }
    if (typeof window.resetCanvasZoom === 'function' && window.pinchScale && window.pinchScale !== 1) {
        window.resetCanvasZoom();
    }
});

console.log('🎬 Zoom v6 (photo-panel + photo-layer) yüklendi');
