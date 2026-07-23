import os

core_file = r'C:\Users\Hatemi\Desktop\emlak düzenlemeleri için uygulama\emlak-studiom v7-0\core.js'
drag_file = r'C:\Users\Hatemi\Desktop\emlak düzenlemeleri için uygulama\emlak-studiom v7-0\core\drag.js'
draw_file = r'C:\Users\Hatemi\Desktop\emlak düzenlemeleri için uygulama\emlak-studiom v7-0\modules\draw.js'

with open(core_file, 'r', encoding='utf-8') as f:
    core_code = f.read()

with open(drag_file, 'r', encoding='utf-8') as f:
    drag_code = f.read()

with open(draw_file, 'r', encoding='utf-8') as f:
    draw_code = f.read()

# 1. Add getCurrentPhotoState to core.js
photo_state_func = """
window.getCurrentPhotoState = function() {
    const pnl = typeof getActivePhotoPanel === 'function' ? getActivePhotoPanel() : null;
    const pl = typeof getActiveV4Element === 'function' ? getActiveV4Element() : null;
    const sx = parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50);
    const sy = parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50);
    
    if (pl && pl.dataset.zpReady === '1') {
        return {
            v4: true,
            z: parseFloat(pl.dataset.zpScale) || 1,
            px: parseFloat(pl.dataset.zpX) || 0,
            py: parseFloat(pl.dataset.zpY) || 0,
            panelW: pnl ? pnl.w : 1920,
            panelH: pnl ? pnl.h : 1080,
            panelL: pnl ? pnl.left : 0,
            panelT: pnl ? pnl.top : 0,
            sliderX: sx,
            sliderY: sy
        };
    } else {
        const pLayer = document.getElementById('photo-layer');
        return {
            v4: false,
            z: parseInt(document.getElementById('photoZoomCtrl') ? document.getElementById('photoZoomCtrl').value : 100),
            px: sx,
            py: sy,
            panelW: pnl ? pnl.w : 1920,
            panelH: pnl ? pnl.h : 1080,
            panelL: pnl ? pnl.left : 0,
            panelT: pnl ? pnl.top : 0,
            sliderX: sx,
            sliderY: sy,
            extraZ: (pLayer && pLayer.dataset.zpReady === '1') ? (parseFloat(pLayer.dataset.zpScale) || 1) : 1,
            extraPx: (pLayer && pLayer.dataset.zpReady === '1') ? (parseFloat(pLayer.dataset.zpX) || 0) : 0,
            extraPy: (pLayer && pLayer.dataset.zpReady === '1') ? (parseFloat(pLayer.dataset.zpY) || 0) : 0
        };
    }
};

window.getSnapGuides = function(px, py, excludeEl, isDrawingMode) {
    const snapToggle = document.getElementById('drawSnapToggle');
    if (!snapToggle || !snapToggle.checked) return { x: px, y: py, guides: [] };
    
    const pointSnapThreshold = 12 / (window.scaleFactor || 1);
    const lineSnapThreshold = 5 / (window.scaleFactor || 1);
    
    const baseW = window.baseW || 1080;
    const baseH = window.baseH || 1080;

    let points = []; 
    let vLines = []; 
    let hLines = []; 

    if (!isDrawingMode || window.polygonPoints?.length === 0) {
        points.push({x: baseW/2, y: baseH/2, type: 'canvas-center'});
        vLines.push(baseW/2);
        hLines.push(baseH/2);
    }

    const allEls = document.querySelectorAll('.editable-text, .canvas-el, .cvi-item, .callout-wrap, .svg-callout');
    allEls.forEach(el => {
        if (el === excludeEl || el.dataset.locked === 'true' || el.style.display === 'none') return;
        let left = parseFloat(el.style.left);
        let top = parseFloat(el.style.top);
        let w = el.offsetWidth;
        let h = el.offsetHeight;
        if (!isNaN(left) && !isNaN(top) && w > 0 && h > 0) {
            points.push({x: left + w/2, y: top + h/2, type: 'obj-center'});
            
            if (!isDrawingMode) {
                points.push({x: left, y: top, type: 'obj-corner'});
                points.push({x: left + w, y: top, type: 'obj-corner'});
                points.push({x: left, y: top + h, type: 'obj-corner'});
                points.push({x: left + w, y: top + h, type: 'obj-corner'});
                
                vLines.push(left, left + w / 2, left + w);
                hLines.push(top, top + h / 2, top + h);
            }
        }
    });

    const currObj = window.getCurrentPhotoState();

    if (window.drawPaths) {
        window.drawPaths.forEach(p => {
            if (p.el === excludeEl) return;
            
            let tScale = 1, tDx = 0, tDy = 0;
            if (p.photoRef && currObj && typeof calculateTransformParams === 'function') {
                const tParams = calculateTransformParams(p.photoRef, currObj);
                tScale = tParams.scale;
                tDx = tParams.dx;
                tDy = tParams.dy;
            }
            
            if (p.type === 'free' && p.points && p.points.length > 0) {
                points.push({x: p.points[0].x * tScale + tDx, y: p.points[0].y * tScale + tDy, type: 'path-end'});
                points.push({x: p.points[p.points.length-1].x * tScale + tDx, y: p.points[p.points.length-1].y * tScale + tDy, type: 'path-end'});
            } else if (p.type === 'polygon' && p.points) {
                p.points.forEach(pt => { points.push({x: pt.x * tScale + tDx, y: pt.y * tScale + tDy, type: 'polygon-vertex'}); });
            } else if (p.x1 !== undefined && p.x2 !== undefined) {
                let px1 = p.x1 * tScale + tDx;
                let py1 = p.y1 * tScale + tDy;
                let px2 = p.x2 * tScale + tDx;
                let py2 = p.y2 * tScale + tDy;
                points.push({x: px1, y: py1, type: 'line-end'});
                points.push({x: px2, y: py2, type: 'line-end'});
                points.push({x: (px1+px2)/2, y: (py1+py2)/2, type: 'line-mid'});
            }
        });
    }

    if (window.polygonPoints && window.polygonPoints.length > 0) {
        window.polygonPoints.forEach(pt => {
            points.push({x: pt.x, y: pt.y, type: 'polygon-vertex'});
        });
    }

    let closestPoint = null;
    let minPointDist = pointSnapThreshold;
    points.forEach(pt => {
        let dist = Math.sqrt(Math.pow(pt.x - px, 2) + Math.pow(pt.y - py, 2));
        if (dist < minPointDist) {
            minPointDist = dist;
            closestPoint = pt;
        }
    });

    let finalX = px, finalY = py;
    const guides = [];

    if (closestPoint) {
        finalX = closestPoint.x;
        finalY = closestPoint.y;
        guides.push({ type: 'point', x: finalX, y: finalY });
    } else {
        let closestX = null, closestY = null;
        let minDistX = lineSnapThreshold, minDistY = lineSnapThreshold;

        vLines.forEach(tx => {
            if (Math.abs(tx - px) < minDistX) { minDistX = Math.abs(tx - px); closestX = tx; }
        });

        hLines.forEach(ty => {
            if (Math.abs(ty - py) < minDistY) { minDistY = Math.abs(ty - py); closestY = ty; }
        });

        if (closestX !== null) { finalX = closestX; guides.push({ type: 'v', x: closestX }); }
        if (closestY !== null) { finalY = closestY; guides.push({ type: 'h', y: closestY }); }
    }

    return { x: finalX, y: finalY, guides };
};

window.drawSnapGuides = function(guides) {
    const container = document.getElementById('canvas-container') || document.body;
    const drawCanvas = document.getElementById('draw-layer') || document.getElementById('drawCanvas');
    const rect = drawCanvas ? drawCanvas.getBoundingClientRect() : {width: 1080, height: 1080};
    const logicW = rect.width / (window.scaleFactor || 1);
    const logicH = rect.height / (window.scaleFactor || 1);
    document.querySelectorAll('.snap-guide-line, .snap-guide-point').forEach(e => e.remove());
    
    if (!guides || guides.length === 0) return;
    
    guides.forEach(g => {
        if (g.type === 'point') {
            const pt = document.createElement('div');
            pt.className = 'snap-guide-point';
            pt.style.position = 'absolute';
            pt.style.left = (g.x / logicW * 100) + '%';
            pt.style.top = (g.y / logicH * 100) + '%';
            pt.style.width = '12px';
            pt.style.height = '12px';
            pt.style.transform = 'translate(-50%, -50%)';
            pt.style.border = '2px solid #f59e0b';
            pt.style.borderRadius = '50%';
            pt.style.background = 'rgba(245, 158, 11, 0.3)';
            pt.style.zIndex = '9999';
            pt.style.pointerEvents = 'none';
            container.appendChild(pt);
        } else {
            const line = document.createElement('div');
            line.className = 'snap-guide-line';
            line.style.position = 'absolute';
            line.style.background = 'transparent';
            line.style.zIndex = '9999';
            line.style.pointerEvents = 'none';
            
            if (g.type === 'v') {
                line.style.left = (g.x / logicW * 100) + '%';
                line.style.top = '0';
                line.style.width = '1px';
                line.style.height = '100%';
                line.style.borderLeft = '1px dashed rgba(245, 158, 11, 0.4)';
            } else {
                line.style.top = (g.y / logicH * 100) + '%';
                line.style.left = '0';
                line.style.width = '100%';
                line.style.height = '1px';
                line.style.borderTop = '1px dashed rgba(245, 158, 11, 0.4)';
            }
            container.appendChild(line);
        }
    });
};

window.clearSnapGuides = function() {
    document.querySelectorAll('.snap-guide-line, .snap-guide-point').forEach(e => e.remove());
};
"""

if 'window.getCurrentPhotoState' not in core_code:
    core_code = photo_state_func + '\\n' + core_code
    with open(core_file, 'w', encoding='utf-8') as f:
        f.write(core_code)
    print('Patched core.js')
else:
    print('core.js already patched')
