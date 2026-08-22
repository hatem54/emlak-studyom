// ==================== POLYGON & MARQUEE ====================
// ========== CONVERT TO POLYGON ==========
function createPolygonFromSelectedLines() {
    if (!window.selectedElements || window.selectedElements.length < 2) return;
    
    const lines = window.selectedElements.filter(el => {
        if (!el.classList.contains('editable-draw')) return false;
        const pObj = typeof drawPaths !== 'undefined' ? drawPaths.find(p => p.el === el) : null;
        return pObj && (pObj.type === 'line' || pObj.x1 !== undefined);
    });
    
    if (lines.length < 2) {
        alert('Çokgene çevirmek için en az 2 düz çizgi seçili olmalıdır.');
        return;
    }
    
    let linesData = [];
    lines.forEach((el) => {
        const pObj = drawPaths.find(p => p.el === el);
        if (pObj) {
            if (pObj.points && pObj.points.length >= 2) {
                linesData.push({ el, p1: {x: pObj.points[0].x, y: pObj.points[0].y}, p2: {x: pObj.points[pObj.points.length-1].x, y: pObj.points[pObj.points.length-1].y} });
            } else if (pObj.x1 !== undefined && pObj.x2 !== undefined) {
                linesData.push({ el, p1: {x: pObj.x1, y: pObj.y1}, p2: {x: pObj.x2, y: pObj.y2} });
            }
        }
    });
    
    if (linesData.length < 2) {
        alert('Çokgene çevirmek için en az 2 düz çizgi seçili olmalıdır.');
        return;
    }
    
    let firstLine = linesData.shift();
    let orderedPoints = [firstLine.p1, firstLine.p2];
    let usedEls = [firstLine.el];
    
    while(linesData.length > 0) {
        let lastPt = orderedPoints[orderedPoints.length - 1];
        let closestIdx = -1;
        let closestDist = Infinity;
        let p1_or_p2 = 0;
        
        for(let i=0; i<linesData.length; i++) {
            let lData = linesData[i];
            let d1 = Math.hypot(lData.p1.x - lastPt.x, lData.p1.y - lastPt.y);
            let d2 = Math.hypot(lData.p2.x - lastPt.x, lData.p2.y - lastPt.y);
            
            if (d1 < closestDist) { closestDist = d1; closestIdx = i; p1_or_p2 = 0; }
            if (d2 < closestDist) { closestDist = d2; closestIdx = i; p1_or_p2 = 1; }
        }
        
        if (closestIdx !== -1 && closestDist <= 30) {
            let closestLine = linesData[closestIdx];
            usedEls.push(closestLine.el);
            if (p1_or_p2 === 0) {
                orderedPoints.push(closestLine.p2);
            } else {
                orderedPoints.push(closestLine.p1);
            }
            linesData.splice(closestIdx, 1);
        } else {
            break; // No connected line found nearby
        }
    }
    
    if (usedEls.length < 2) {
        alert('Bağlanabilecek yeterli çizgi bulunamadı. Çizgilerinizin birbirine (en az 30px) yakın olduğundan emin olun.');
        return;
    }

    const firstLineObj = Object.assign({}, drawPaths.find(p => p.el === usedEls[0]) || { color: '#ef4444', width: 4, opacity: 1 });
    
    usedEls.forEach(el => {
        const idx = drawPaths.findIndex(p => p.el === el);
        if (idx > -1) drawPaths.splice(idx, 1);
        if (el.parentNode) el.parentNode.removeChild(el);
    });
    
    if (orderedPoints.length > 2) {
        let firstPt = orderedPoints[0];
        let lastPt = orderedPoints[orderedPoints.length - 1];
        if (Math.hypot(firstPt.x - lastPt.x, firstPt.y - lastPt.y) <= 30) {
            orderedPoints.pop();
        }
    }
    
    const pObj = {
        type: 'polygon',
        closed: true,
        points: orderedPoints,
        color: firstLineObj.color || '#ef4444',
        width: firstLineObj.width || 4,
        opacity: firstLineObj.opacity || 1,
        dashStyle: firstLineObj.dashStyle || 'solid',
        glow: firstLineObj.glow || 0,
        fillColor: 'transparent',
        fillOpacity: 0
    };
    
    if (typeof getActivePhotoPanel === 'function' && window.getCurrentPhotoState) {
        pObj.photoRef = window.getCurrentPhotoState();
    }
    
    drawPaths.push(pObj);
    if(typeof createSVGFromPath === 'function') {
        const svgEl = createSVGFromPath(pObj);
        if(svgEl) {
            pObj.el = svgEl;
            const container = typeof getActiveV4Element === 'function' ? getActiveV4Element() : document.getElementById('photo-layer');
            if(container) container.appendChild(svgEl);
        }
    }
    
    if(typeof updateDrawHistory === 'function') updateDrawHistory();
    if(typeof redrawAll === 'function') redrawAll();
    if(typeof deselectAll === 'function') deselectAll();
    if(pObj.el && typeof selectElement === 'function') selectElement(pObj.el, true);
}
window.createPolygonFromSelectedLines = createPolygonFromSelectedLines;

// ========== MARQUEE SELECTION ==========
let polyMarqueeBox = null;
let polyMarqueeStartX = 0;
let polyMarqueeStartY = 0;

window.startMobileMarquee = function(x, y) {
    if(typeof drawMode !== 'undefined' && drawMode !== 'off') return;
    polyMarqueeStartX = x;
    polyMarqueeStartY = y;
    
    polyMarqueeBox = document.createElement('div');
    polyMarqueeBox.style.position = 'fixed';
    polyMarqueeBox.style.border = '1px dashed #3b82f6';
    polyMarqueeBox.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    polyMarqueeBox.style.zIndex = '9999';
    polyMarqueeBox.style.pointerEvents = 'none';
    polyMarqueeBox.style.left = polyMarqueeStartX + 'px';
    polyMarqueeBox.style.top = polyMarqueeStartY + 'px';
    polyMarqueeBox.style.width = '0px';
    polyMarqueeBox.style.height = '0px';
    document.body.appendChild(polyMarqueeBox);
};

document.addEventListener('mousedown', e => {
    if (e.button !== 0) return; // Sağ tık seçim kutusu başlatmasın
    if(typeof drawMode !== 'undefined' && drawMode !== 'off') return;
    if(!e.target || !e.target.closest) return;
    const cTarget = e.target.closest('.canvas-el, .added-icon, .draggable, .cvi-item, .co-neon-block, .vertex-handle, .text-handle, .callout-controls, .callout-resizer, .callout-rotator, .lp-item, .panel, .lp-header, .editable-draw');
    
    if (e.target.closest('.panel, .lp-header, button, input, select, textarea, .modal-overlay, .app-context-menu')) return;
    
    const isBackground = e.target.id === 'photo-layer' || e.target.id === 'drawCanvas' || e.target.id === 'canva-render-layer' || e.target.id === 'canvas-container' || e.target.id === 'ui-layer' || e.target.classList.contains('photo-wrap') || e.target.classList.contains('workspace') || e.target.classList.contains('main-preview') || e.target.closest('#canvas-container, .main-canvas');
    
    const hasPhoto = window.masterImageBase64 && window.masterImageBase64.length > 50;
    const isLocked = window.isPhotoLocked === true || (document.getElementById('photoLockToggle') && document.getElementById('photoLockToggle').checked);
    const isModifier = e.ctrlKey || e.shiftKey || e.altKey || e.metaKey;
    
    if(!cTarget && isBackground) {
        if (!hasPhoto || isLocked || isModifier) {
            window.startMobileMarquee(e.clientX, e.clientY);
        }
    }
});

const handleMarqueeMove = function(e) {
    if(polyMarqueeBox) {
        let currentX = e.clientX;
        let currentY = e.clientY;
        if(e.touches && e.touches.length > 0) {
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        }
        const left = Math.min(polyMarqueeStartX, currentX);
        const top = Math.min(polyMarqueeStartY, currentY);
        const width = Math.abs(currentX - polyMarqueeStartX);
        const height = Math.abs(currentY - polyMarqueeStartY);
        
        polyMarqueeBox.style.left = left + 'px';
        polyMarqueeBox.style.top = top + 'px';
        polyMarqueeBox.style.width = width + 'px';
        polyMarqueeBox.style.height = height + 'px';
    }
};

document.addEventListener('mousemove', handleMarqueeMove);
document.addEventListener('touchmove', handleMarqueeMove, {passive: true});

const handleMarqueeEnd = function(e) {
    if(polyMarqueeBox) {
        const mRect = polyMarqueeBox.getBoundingClientRect();
        polyMarqueeBox.remove();
        polyMarqueeBox = null;
        
        if (mRect.width > 5 && mRect.height > 5) {
            const multiSelectKey = e.ctrlKey || e.shiftKey;
            if (!multiSelectKey && typeof deselectAll === 'function') {
                deselectAll();
            }
            const rawElements = Array.from(document.querySelectorAll('.cvi-item, .co-neon-block, .draggable, .added-icon, .canvas-el, .editable-draw'));
            // Sadece en üst seviye elemanları seç (iç içe seçimi ve çift sayımı önle)
            const elements = rawElements.filter(el => {
                return !rawElements.some(parent => parent !== el && parent.contains(el));
            });
            let selectedAny = false;
            let lastEl = null;
            
            elements.forEach(el => {
                if(el.style.display === 'none' || el.style.visibility === 'hidden' || el.dataset.locked === 'true') return;
                let rect = el.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) {
                    const inner = el.querySelector('svg, .callout-svg-container, div');
                    if (inner) rect = inner.getBoundingClientRect();
                }
                
                if (rect.left < mRect.right &&
                    rect.right > mRect.left &&
                    rect.top < mRect.bottom &&
                    rect.bottom > mRect.top) {
                    
                    if (typeof selectElement === 'function') {
                          selectElement(el, true, true);
                          lastEl = el;
                          selectedAny = true;
                      }
                }
            });
            
            if(selectedAny && lastEl) {
                if(typeof window.selectedEl !== 'undefined') window.selectedEl = lastEl;
                if(typeof updateGroupUI === 'function') updateGroupUI();
                if(typeof window.updateMultiSelectUI === 'function') window.updateMultiSelectUI();
                
                if(window.LayerPanelV2 && window.LayerPanelV2.highlightActiveLayer) {
                    setTimeout(() => window.LayerPanelV2.highlightActiveLayer(), 80);
                }
            }
        }
    }
};

document.addEventListener('mouseup', handleMarqueeEnd);
document.addEventListener('touchend', handleMarqueeEnd);
