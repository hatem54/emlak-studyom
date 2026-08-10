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

function checkConvertPolygonButton() {
    let btn = document.getElementById('btnConvertPolygon');
    if (!window.selectedElements || window.selectedElements.length < 2) {
        if (btn) btn.style.display = 'none';
        return;
    }
    
    const lines = window.selectedElements.filter(el => {
        if (!el.classList.contains('editable-draw')) return false;
        if (typeof drawPaths !== 'undefined') {
            const pObj = drawPaths.find(p => p.el === el);
            return pObj && (pObj.type === 'line' || pObj.x1 !== undefined);
        }
        return false;
    });
    
    if (lines.length >= 2) {
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'btnConvertPolygon';
            btn.innerHTML = '🔷 Çokgene Çevir';
            btn.style.position = 'absolute';
            btn.style.zIndex = '9999999';
            btn.style.background = '#6366f1';
            btn.style.color = '#fff';
            btn.style.border = 'none';
            btn.style.padding = '8px 12px';
            btn.style.borderRadius = '6px';
            btn.style.cursor = 'pointer';
            btn.style.fontWeight = 'bold';
            btn.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            btn.onclick = createPolygonFromSelectedLines;
            document.body.appendChild(btn);
        }
        
        const lastEl = window.selectedElements[window.selectedElements.length - 1];
        const rect = lastEl.getBoundingClientRect();
        btn.style.left = (rect.right + 10) + 'px';
        btn.style.top = rect.top + 'px';
        btn.style.display = 'block';
    } else {
        if (btn) btn.style.display = 'none';
    }
}

// Override or inject into selection changes
const originalSelectElement = window.selectElement;
window.selectElement = function(el, multi) {
    if (originalSelectElement) originalSelectElement(el, multi);
    setTimeout(checkConvertPolygonButton, 10);
};

const originalDeselectAll = window.deselectAll;
window.deselectAll = function() {
    if (originalDeselectAll) originalDeselectAll();
    setTimeout(checkConvertPolygonButton, 10);
};

// ========== MARQUEE SELECTION ==========
let polyMarqueeBox = null;
let polyMarqueeStartX = 0;
let polyMarqueeStartY = 0;

document.addEventListener('mousedown', e => {
    if(typeof drawMode !== 'undefined' && drawMode !== 'off') return;
    if(!e.target || !e.target.closest) return;
    const cTarget = e.target.closest('.canvas-el, .added-icon, .draggable, .cvi-item, .co-neon-block, .vertex-handle, .lp-item, .panel, .lp-header, .editable-draw');
    
    if (e.target.closest('.panel, .lp-header')) return;
    
    // Instead of duplicating deselectAll logic here, we just start the marquee if we clicked on the background
    // Since canvasEl already calls deselectAll() for clicks that aren't on items, we just check if it IS on the background
    const isBackground = e.target.id === 'photo-layer' || e.target.id === 'drawCanvas' || e.target.id === 'canva-render-layer' || e.target.classList.contains('photo-wrap') || e.target.classList.contains('workspace');
    
    if(!cTarget && isBackground && (e.ctrlKey || e.altKey || e.metaKey)) {
        polyMarqueeStartX = e.clientX;
        polyMarqueeStartY = e.clientY;
        
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
    }
});

document.addEventListener('mousemove', function(e) {
    if(polyMarqueeBox) {
        const currentX = e.clientX;
        const currentY = e.clientY;
        const left = Math.min(polyMarqueeStartX, currentX);
        const top = Math.min(polyMarqueeStartY, currentY);
        const width = Math.abs(currentX - polyMarqueeStartX);
        const height = Math.abs(currentY - polyMarqueeStartY);
        
        polyMarqueeBox.style.left = left + 'px';
        polyMarqueeBox.style.top = top + 'px';
        polyMarqueeBox.style.width = width + 'px';
        polyMarqueeBox.style.height = height + 'px';
    }
});

document.addEventListener('mouseup', function(e) {
    if(polyMarqueeBox) {
        const mRect = polyMarqueeBox.getBoundingClientRect();
        polyMarqueeBox.remove();
        polyMarqueeBox = null;
        
        if (mRect.width > 5 && mRect.height > 5) {
            const multiSelectKey = e.ctrlKey || e.shiftKey;
            if (!multiSelectKey && typeof deselectAll === 'function') {
                deselectAll();
            }
            const elements = document.querySelectorAll('.cvi-item, .co-neon-block, .draggable, .added-icon, .canvas-el, .editable-draw');
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
                          selectElement(el, true);
                          lastEl = el;
                          selectedAny = true;
                      }
                }
            });
            
            if(selectedAny && lastEl) {
                if(typeof window.selectedEl !== 'undefined') window.selectedEl = lastEl;
                if(typeof updateGroupUI === 'function') updateGroupUI();
                
                if(window.LayerPanelV2 && window.LayerPanelV2.highlightActiveLayer) {
                    setTimeout(() => window.LayerPanelV2.highlightActiveLayer(), 80);
                }
            }
        }
    }
});
