// Moved getCurrentPhotoState to module
;

// Snap logic moved to modules/snap.js







const $=id=>document.getElementById(id);

window.getCanvasScaleRatio = function() {
    let canvasW = 1920;
    const cContainer = document.getElementById('canvas-container');
    if (cContainer && parseFloat(cContainer.style.width)) {
        canvasW = parseFloat(cContainer.style.width);
    } else if (typeof uploadedImgW !== 'undefined' && uploadedImgW > 0) {
        canvasW = uploadedImgW;
    }
    return Math.max(0.5, canvasW / 1920);
};

window.getGlobalScale = function() { return (typeof scaleFactor !== 'undefined' ? scaleFactor : 1) * (window.pinchScale || 1); };
var currentMode='satilik_daire',activeLayout='',scaleFactor=1,selectedEl=null,allIcons=[];
let drawMode='off',isDrawing=false,drawStartX=0,drawStartY=0,drawPaths=[],drawRedoPaths=[],currentPath=[];
let extraFieldCounter=0,editingDrawIndex=-1,isCanvaMode=false,activeCanvaId='';
let polygonPoints=[],polygonRedoPoints=[],polygonBuilding=false,lastClickTime=0;
const extraFieldsData={konut:[],arazi:[]};
let uploadedImgUrl=''; if(typeof trackImageSize==='function') trackImageSize(uploadedImgUrl);
let canvaOverlays=[];

let uploadedImgW = 1920;
let uploadedImgH = 1080;
function trackImageSize(url, callback) {
    if (!url) {
        if (typeof callback === 'function') callback();
        return;
    }
    const img = new Image();
    img.onload = function() {
        const oldW = (typeof uploadedImgW !== 'undefined' && uploadedImgW > 0) ? uploadedImgW : 1920;
        const oldH = (typeof uploadedImgH !== 'undefined' && uploadedImgH > 0) ? uploadedImgH : 1080;
        
        uploadedImgW = img.naturalWidth || (window.innerWidth <= 768 ? 1080 : 1920);
        uploadedImgH = img.naturalHeight || (window.innerWidth <= 768 ? 1920 : 1080);
        const pl = document.getElementById('photo-layer');
        if (pl) {
            pl.dataset.naturalW = uploadedImgW;
            pl.dataset.naturalH = uploadedImgH;
        }
        
        // Lock photo by default when loaded
        const lockToggle = document.getElementById('photoLockToggle');
        if (lockToggle) {
            lockToggle.checked = true;
            window.isPhotoLocked = true;
        }
        
        // Auto-adjust format (Sadece yeni manuel görsel yüklendiğinde, geri yükleme harici)
        if (typeof autoAdjustFormat === 'function' && window.isRestoringState !== true) {
            autoAdjustFormat(uploadedImgW, uploadedImgH);
        }
        
        // Tuvali yeniden boyutlandır ve yeni scaleFactor'ü hesapla
        if (typeof resizeCanvas === 'function') resizeCanvas();
        
        // Fotoğraf yüklenmeden önce eklenmiş çizimleri ve öğeleri yeni tuval çözünürlüğüne orantılı adapte et
        if (window.isRestoringState !== true && oldW > 0 && oldH > 0 && (oldW !== uploadedImgW || oldH !== uploadedImgH)) {
            const sX = uploadedImgW / oldW;
            const sY = uploadedImgH / oldH;
            
            // 1. Çizimleri ölçekle
            if (typeof drawPaths !== 'undefined' && drawPaths.length > 0) {
                const scaleRatio = typeof getDrawScaleRatio === 'function' ? getDrawScaleRatio() : (uploadedImgW / 1920);
                drawPaths.forEach(p => {
                    if (p.points && Array.isArray(p.points)) {
                        p.points.forEach(pt => { pt.x *= sX; pt.y *= sY; });
                    }
                    if (typeof p.x1 !== 'undefined') {
                        p.x1 *= sX; p.y1 *= sY; p.x2 *= sX; p.y2 *= sY;
                    }
                    p.rawWidth = p.rawWidth || 4;
                    p.width = Math.max(1, Math.round(p.rawWidth * scaleRatio));
                    p.photoRef = { v4: false, z: 100, px: 50, py: 50, panelW: uploadedImgW, panelH: uploadedImgH, panelL: 0, panelT: 0 };
                    
                    if (p.el && p.el.parentNode && typeof createSVGFromPath === 'function') {
                        const oldEl = p.el;
                        const newEl = createSVGFromPath(p);
                        if (newEl) {
                            oldEl.parentNode.replaceChild(newEl, oldEl);
                            p.el = newEl;
                            if (typeof makeDraggable === 'function') makeDraggable(newEl);
                            if (typeof makeSvgTransformable === 'function') makeSvgTransformable(newEl);
                            if (typeof allIcons !== 'undefined') {
                                const iconIdx = allIcons.indexOf(oldEl);
                                if (iconIdx > -1) allIcons[iconIdx] = newEl;
                            }
                        }
                    }
                });
            }
        }
        
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof callback === 'function') callback();
    };
    img.onerror = function() {
        if (typeof callback === 'function') callback();
    };
    img.src = url;
}

function autoAdjustFormat(imgW, imgH) {
    if (typeof EXPORT_FORMATS === 'undefined' || !imgW || !imgH) return;
    
    if (EXPORT_FORMATS['Orijinal Görsel Boyutu']) {
        EXPORT_FORMATS['Orijinal Görsel Boyutu'].w = imgW;
        EXPORT_FORMATS['Orijinal Görsel Boyutu'].h = imgH;
    }
    
    const f = EXPORT_FORMATS['Orijinal Görsel Boyutu'];
    const newLabel = f ? (f.icon + ' Orijinal Görsel Boyutu ⇾ ' + imgW + 'x' + imgH) : 'Orijinal Görsel Boyutu';
    
    const formatSelect = document.getElementById('previewFormat');
    const exportSelect = document.getElementById('exportFormat');
    
    if (formatSelect) {
        let opt = Array.from(formatSelect.options).find(o => o.value === 'Orijinal Görsel Boyutu');
        if (opt) opt.textContent = newLabel;
        formatSelect.value = 'Orijinal Görsel Boyutu';
        if (typeof switchPreviewFormat === 'function') switchPreviewFormat();
    }
    if (exportSelect) {
        let opt = Array.from(exportSelect.options).find(o => o.value === 'Orijinal Görsel Boyutu');
        if (opt) opt.textContent = newLabel;
        exportSelect.value = 'Orijinal Görsel Boyutu';
    }
    window.userHasManuallyChangedFormat = true;
    if (typeof window.updateExportScaleDisplay === 'function') window.updateExportScaleDisplay();
}




function getBgMetrics(panelW, panelH, imgW, imgH, zoom, posX, posY) {
    let scale = Math.max(panelW / imgW, panelH / imgH);
    if (zoom !== 100) {
        let renderedW = panelW * (zoom / 100);
        scale = renderedW / imgW;
    }
    let renderedW = imgW * scale;
    let renderedH = imgH * scale;
    let offsetX = (panelW - renderedW) * (posX / 100);
    let offsetY = (panelH - renderedH) * (posY / 100);
    return { offsetX, offsetY, scale };
}



let currentFont=FONTS[16].family;
let batchFiles=[];

let canvasEl,photoLayer,vignetteLayer,uiLayer,shadowOverlay,highlightOverlay,maskLayer,canvaRenderLayer;
let elBadge,elPrice,elDetails,elLogo,drawCanvas,drawCtx;

// Moved initCoreRefs to module


// Moved switchTab to module




































































// Moved resizeCanvas to module


// Global click tracker for templates
document.addEventListener('click', function(e){
    const card = e.target.closest('.canva-tpl-card, .template-btn');
    if(card) window.lastClickedTemplateElement = card;
}, true);

// Moved refreshActiveCanvaTemplate to module









// Moved showGlobalLoadingOverlay to module
;

// Moved setTemplate to module


// Moved applyStylePos to module


// Moved switchPropertyType to module
;

// Moved switchMode to module
;

// Moved renderData to module


// Moved addExtraField to module


// Moved removeExtraField to module


// Moved applyCustomCode to module


function smartParse(){
    if (window.SmartParserPro && typeof window.SmartParserPro.execute === 'function') {
        window.SmartParserPro.execute();
    }
}




















































// Boş alana tıklayınca seçimi kaldır
document.addEventListener('click', function(e){
    // Eğer tıklanan yer bir canva elemanı, panel veya editor değilse
    if(!e.target.closest('.cvi-item') && 
       !e.target.closest('.cvi-panel') && 
       !e.target.closest('.cvr-base') &&
       !e.target.closest('input') &&
       !e.target.closest('textarea') &&
       !e.target.closest('button')){
        
        // Tüm seçimleri kaldır
        document.querySelectorAll('.selected, [style*="outline"]').forEach(el => {
            el.classList.remove('selected');
            el.style.outline = 'none';
            el.style.boxShadow = '';
        });
    }
});












// Moved calculateTransformParams to module




// ==================== PROJE KAYDET / AÇ ====================








// ================= GLOBAL TOOLTIP LOGIC =================

window.addEventListener('DOMContentLoaded', initGlobalTooltip);

// [YENİ] Mobil Sayfa Kayması (Bounce) Engelleyici
document.addEventListener('touchmove', function(e) {
    if (typeof window.isMobileDevice === 'function' && window.isMobileDevice()) {
        const isScrollable = e.target.closest('.sidebar') || e.target.closest('.right-sidebar') || e.target.closest('.draw-mode-btns') || e.target.closest('.cat-items') || e.target.closest('.swal2-popup') || e.target.closest('#mainTabs') || e.target.closest('.tabs') || e.target.closest('.dynamic-field') || e.target.closest('.accordion-container');
        const isSlider = e.target.tagName === 'INPUT' && e.target.type === 'range';
        
        if (!isScrollable && !isSlider && e.cancelable) {
            e.preventDefault();
        }
    }
}, { passive: false });

// ========== YZ OTOMATIK IYILESTIRME ==========



let isShowingBefore = false;




// --- PIXEL ENGINE ---
let originalImageData = null;
let workingCanvas = null;
let workingCtx = null;
let previewImageData = null;
let previewWorkingCanvas = null;
let previewWorkingCtx = null;
let isQualityPreviewMode = false;
let pixelTimeout = null;



let globalApplyFiltersAfterLoad = false;


// Map processHSL to processPixels for backward compatibility











// Global HSL slider event listener
document.addEventListener('input', function(e) {
    if(e.target.classList && e.target.classList.contains('hsl-slider')) {
        const type = e.target.dataset.type;
        const color = e.target.dataset.color;
        const valSpan = document.getElementById('hsl_'+type+'_'+color+'Val');
        if(valSpan) valSpan.textContent = e.target.value;
        if(typeof processPixels === 'function') processPixels();
    }
});

function duplicateSelected(){
    if(!selectedEl)return;
    const n = selectedEl.cloneNode(true);
    n.removeAttribute('id');
    const left = parseInt(selectedEl.style.left) || 0;
    const top = parseInt(selectedEl.style.top) || 0;
    n.style.left = (left + 20) + 'px';
    n.style.top = (top + 20) + 'px';
    selectedEl.parentNode.appendChild(n);
    if (typeof makeDraggable === 'function' && (n.classList.contains('draggable') || n.classList.contains('canvas-el'))) {
        makeDraggable(n);
    }
    if (typeof selectElement === 'function') {
        setTimeout(() => selectElement(n), 50);
    }
}

// State and Undo logic moved to modules/state.js

// Event listeners moved to modules/events.js

// PC'de yn tularnn sayfay kaydrmasn engelle
window.addEventListener('keydown', function(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.isContentEditable)) {
            return;
        }
        e.preventDefault();
    }
}, {passive: false});

