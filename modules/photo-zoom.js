// ==================== PHOTO ZOOM & PAN ====================
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
    _preparePhoto(el);
    
    var s = parseFloat(el.dataset.zpScale) || 1;
    s = e.deltaY < 0 ? s + 0.1 : s - 0.1;
    if(s < 0.3) s = 0.3;
    if(s > 5) s = 5;
    
    el.dataset.zpScale = s;
    _applyPhotoTransform(el);
    if(typeof redrawAll === 'function') redrawAll();
    console.log('Zoom:', s.toFixed(2));
}, { passive: false });

// ========== SÜRÜKLEME ==========
var _dragEl = null, _dsx, _dsy, _dix, _diy;

window.spaceBarPressed = false;
window.addEventListener('keydown', e => { 
    if (e.code === 'Space') { 
        window.spaceBarPressed = true; 
        if(document.activeElement && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') e.preventDefault(); 
    } 
});
window.addEventListener('keyup', e => { 
    if (e.code === 'Space') window.spaceBarPressed = false; 
});

document.addEventListener('mousedown', function(e){
    var el = _getZoomTarget(e.target);
    if(!el) return;
    
    const isModifierPressed = e.ctrlKey || e.altKey || e.metaKey;
    const canPanWithLeftClick = (typeof drawMode === 'undefined' || drawMode === 'off' || drawMode === null) && !isModifierPressed;
    
    if(e.button === 0 && !window.spaceBarPressed && !canPanWithLeftClick) return;
    if(e.button !== 0 && e.button !== 1) return;
    
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
    
    var x = _dix + (e.clientX - _dsx);
    var y = _diy + (e.clientY - _dsy);
    
    _dragEl.dataset.zpX = x;
    _dragEl.dataset.zpY = y;
    _applyPhotoTransform(_dragEl);
    if(typeof redrawAll === 'function') redrawAll();
});

document.addEventListener('mouseup', function(){
    if(_dragEl) _dragEl.style.cursor = 'grab';
    _dragEl = null;
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
    if(typeof redrawAll === 'function') redrawAll();
    console.log('Sıfırlandı');
});

console.log('🎬 Zoom v6 (photo-panel + photo-layer) yüklendi');
