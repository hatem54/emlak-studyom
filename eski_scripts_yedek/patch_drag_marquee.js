const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core/drag.js';
let content = fs.readFileSync(file, 'utf8');

const marqueeCode = `
// --- MARQUEE SELECTION & CONVERT TO POLYGON ---
let marqueeEl = null;
let marqueeStartX = 0;
let marqueeStartY = 0;
let isMarqueeDragging = false;

document.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return;
    const target = e.target;
    const isBackground = target.id === 'photo-layer' || target.id === 'drawCanvas' || target.id === 'canva-render-layer' || target.classList.contains('photo-wrap') || target.classList.contains('workspace');
    
    // Check if drawMode is active
    if (isBackground && (typeof drawMode === 'undefined' || drawMode === 'off' || drawMode === null)) {
        isMarqueeDragging = true;
        marqueeStartX = e.clientX;
        marqueeStartY = e.clientY;
        
        if (!e.ctrlKey && !e.shiftKey) {
            if(typeof deselectAll === 'function') deselectAll();
        }
        
        if (!marqueeEl) {
            marqueeEl = document.createElement('div');
            marqueeEl.className = 'marquee-selection';
            marqueeEl.style.position = 'fixed';
            marqueeEl.style.border = '1px dashed #3b82f6';
            marqueeEl.style.background = 'rgba(59, 130, 246, 0.1)';
            marqueeEl.style.pointerEvents = 'none';
            marqueeEl.style.zIndex = '999999';
            document.body.appendChild(marqueeEl);
        }
        marqueeEl.style.left = marqueeStartX + 'px';
        marqueeEl.style.top = marqueeStartY + 'px';
        marqueeEl.style.width = '0px';
        marqueeEl.style.height = '0px';
        marqueeEl.style.display = 'block';
    }
});

document.addEventListener('mousemove', function(e) {
    if (isMarqueeDragging && marqueeEl) {
        const currentX = e.clientX;
        const currentY = e.clientY;
        
        const x = Math.min(marqueeStartX, currentX);
        const y = Math.min(marqueeStartY, currentY);
        const w = Math.abs(currentX - marqueeStartX);
        const h = Math.abs(currentY - marqueeStartY);
        
        marqueeEl.style.left = x + 'px';
        marqueeEl.style.top = y + 'px';
        marqueeEl.style.width = w + 'px';
        marqueeEl.style.height = h + 'px';
    }
});

document.addEventListener('mouseup', function(e) {
    if (isMarqueeDragging && marqueeEl) {
        isMarqueeDragging = false;
        marqueeEl.style.display = 'none';
        
        const rect = marqueeEl.getBoundingClientRect();
        if (rect.width > 5 && rect.height > 5) {
            const photoLayer = getActiveV4Element();
            if (photoLayer) {
                const els = photoLayer.querySelectorAll('.editable-text, .editable-draw, .co-neon-block, .callout-wrap, .svg-callout, .callout-item, .canvas-el, .cvi-item');
                els.forEach(el => {
                    if (el.dataset.locked === 'true') return;
                    
                    const elRect = el.getBoundingClientRect();
                    const overlap = !(rect.right < elRect.left || 
                                      rect.left > elRect.right || 
                                      rect.bottom < elRect.top || 
                                      rect.top > elRect.bottom);
                    if (overlap) {
                        if (typeof selectElement === 'function') {
                            selectElement(el, true);
                        }
                    }
                });
            }
        }
    }
});

function createPolygonFromSelectedLines() {
    if (!window.selectedElements || window.selectedElements.length < 2) return;
    
    // Sadece line (Düz Çizgi) olanları filtrele
    const lines = window.selectedElements.filter(el => {
        if (!el.classList.contains('editable-draw')) return false;
        const pObj = drawPaths.find(p => p.el === el);
        return pObj && pObj.type === 'line';
    });
    
    if (lines.length < 2) {
        alert('Çokgene çevirmek için en az 2 düz çizgi seçili olmalıdır.');
        return;
    }
    
    // Çizgilerin noktalarını topla
    let points = [];
    lines.forEach((el, index) => {
        const pObj = drawPaths.find(p => p.el === el);
        if (pObj && pObj.points && pObj.points.length >= 2) {
            points.push({x: pObj.points[0].x, y: pObj.points[0].y});
            points.push({x: pObj.points[pObj.points.length-1].x, y: pObj.points[pObj.points.length-1].y});
        }
    });
    
    // Çizgileri kaldır
    lines.forEach(el => {
        const idx = drawPaths.findIndex(p => p.el === el);
        if (idx > -1) drawPaths.splice(idx, 1);
        if (el.parentNode) el.parentNode.removeChild(el);
    });
    
    // Noktaları birleştirme algoritması
    let orderedPoints = [points[0], points[1]];
    points.splice(0, 2);
    
    while(points.length > 0) {
        let lastPt = orderedPoints[orderedPoints.length - 1];
        let closestIdx = -1;
        let closestDist = Infinity;
        let p1_or_p2 = 0; // 0 for p1, 1 for p2
        
        for(let i=0; i<points.length; i+=2) {
            let d1 = Math.hypot(points[i].x - lastPt.x, points[i].y - lastPt.y);
            let d2 = Math.hypot(points[i+1].x - lastPt.x, points[i+1].y - lastPt.y);
            
            if (d1 < closestDist) { closestDist = d1; closestIdx = i; p1_or_p2 = 0; }
            if (d2 < closestDist) { closestDist = d2; closestIdx = i; p1_or_p2 = 1; }
        }
        
        if (closestIdx !== -1) {
            if (p1_or_p2 === 0) {
                orderedPoints.push(points[closestIdx], points[closestIdx+1]);
            } else {
                orderedPoints.push(points[closestIdx+1], points[closestIdx]);
            }
            points.splice(closestIdx, 2);
        } else {
            break;
        }
    }
    
    // Yeni bir çokgen (polygon) oluştur
    const firstLineObj = drawPaths.find(p => p.el === lines[0]) || { color: '#ef4444', size: 4, opacity: 1 };
    
    const pObj = {
        type: 'polygon',
        closed: true,
        points: orderedPoints,
        color: firstLineObj.color || '#ef4444',
        size: firstLineObj.size || 4,
        opacity: firstLineObj.opacity || 1,
        fillColor: 'transparent',
        fillOpacity: 0
    };
    
    if (typeof isCanvaMode !== 'undefined' && isCanvaMode) {
        const pnl = getActivePhotoPanel();
        pObj.photoRef = { v4: true, z: parseFloat(getActiveV4Element().dataset.zpScale)||1, px: parseFloat(getActiveV4Element().dataset.zpX)||0, py: parseFloat(getActiveV4Element().dataset.zpY)||0, panelW: pnl.w, panelH: pnl.h, panelL: pnl.left, panelT: pnl.top, sliderX: 50, sliderY: 50 };
    } else {
        const pnl = getActivePhotoPanel();
        pObj.photoRef = { v4: false, z: 100, px: 50, py: 50, panelW: pnl.w, panelH: pnl.h, panelL: pnl.left, panelT: pnl.top };
    }
    
    drawPaths.push(pObj);
    if(typeof drawSinglePath === 'function') drawSinglePath(pObj);
    if(typeof createSVGFromPath === 'function') {
        const svgEl = createSVGFromPath(pObj);
        if(svgEl) {
            pObj.el = svgEl;
            const container = getActiveV4Element();
            if(container) container.appendChild(svgEl);
        }
    }
    
    if(typeof updateDrawHistory === 'function') updateDrawHistory();
    deselectAll();
    if(pObj.el && typeof selectElement === 'function') selectElement(pObj.el);
}

// Float butonu gösterme/gizleme mantığı
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
            return pObj && pObj.type === 'line';
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
            btn.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            btn.onclick = createPolygonFromSelectedLines;
            document.body.appendChild(btn);
        }
        
        // Butonu son seçili elemanın yanına yerleştir
        const lastEl = window.selectedElements[window.selectedElements.length - 1];
        const rect = lastEl.getBoundingClientRect();
        btn.style.left = (rect.right + 10) + 'px';
        btn.style.top = rect.top + 'px';
        btn.style.display = 'block';
    } else {
        if (btn) btn.style.display = 'none';
    }
}
`;

if (!content.includes('MARQUEE SELECTION & CONVERT TO POLYGON')) {
    content += "\n" + marqueeCode;
    
    // Inject checkConvertPolygonButton into updateGroupUI
    content = content.replace(
        /window\.updateGroupUI\s*=\s*function\(\)\s*\{/,
        'window.updateGroupUI = function() {\n    if (typeof checkConvertPolygonButton === "function") checkConvertPolygonButton();\n'
    );
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Drag.js patched with Marquee and Convert button.');
} else {
    console.log('Already patched.');
}
