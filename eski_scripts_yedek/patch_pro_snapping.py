import os
import re

core_file = r'C:\Users\Hatemi\Desktop\emlak düzenlemeleri için uygulama\emlak-studiom v7-0\core.js'
draw_file = r'C:\Users\Hatemi\Desktop\emlak düzenlemeleri için uygulama\emlak-studiom v7-0\modules\draw.js'

with open(core_file, 'r', encoding='utf-8') as f:
    core_code = f.read()

# Replace getSnapGuides
new_snap_guides = """window.getSnapGuides = function(px, py, excludeEl, isDrawingMode) {
    const snapToggle = document.getElementById('drawSnapToggle');
    if (!snapToggle || !snapToggle.checked) return { x: px, y: py, guides: [] };
    
    const pointSnapThreshold = 20 / (window.scaleFactor || 1);
    const lineSnapThreshold = 5 / (window.scaleFactor || 1);
    
    // Default baseW is 1920 for Emlak Studio
    const baseW = window.baseW || 1920;
    const baseH = window.baseH || 1080;

    let points = []; 
    let vLines = []; 
    let hLines = []; 

    // Always allow canvas center and edges
    if (!isDrawingMode) {
        points.push({x: baseW/2, y: baseH/2, type: 'canvas-center'});
        vLines.push(0, baseW/2, baseW);
        hLines.push(0, baseH/2, baseH);
    } else if (window.polygonPoints?.length === 0) {
        points.push({x: baseW/2, y: baseH/2, type: 'canvas-center'});
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
                // Sadece obje ortalarina ve kenarlarina cizgi cek (karmasikligi onlemek icin köselere nokta atama)
                vLines.push(left, left + w / 2, left + w);
                hLines.push(top, top + h / 2, top + h);
            }
        }
    });

    const currObj = window.getCurrentPhotoState ? window.getCurrentPhotoState() : null;

    if (window.drawPaths) {
        window.drawPaths.forEach(p => {
            if (p.el && p.el === excludeEl) return;
            
            let tScale = 1, tDx = 0, tDy = 0;
            // Eger resim transformu varsa
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
    } else if (!isDrawingMode) {
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
};"""

core_code = re.sub(r'window\.getSnapGuides\s*=\s*function[\s\S]*?return \{ x: finalX, y: finalY, guides \};\n\};', new_snap_guides, core_code)

with open(core_file, 'w', encoding='utf-8') as f:
    f.write(core_code)
print('Patched core.js')

with open(draw_file, 'r', encoding='utf-8') as f:
    draw_code = f.read()

# Replace dStart to handle start point click for polygon close
new_dstart = """function dStart(e){
    if(drawMode==='off')return;
    e.preventDefault();
    e.stopPropagation();
    let p=canvasXY(e.touches?e.touches[0]:e);
    if(window.clearSnapGuides) window.clearSnapGuides();
    if(window.getSnapGuides && (drawMode==='line' || drawMode==='arrow' || drawMode==='polygon' || drawMode==='free')) {
        const snap = window.getSnapGuides(p.x, p.y, null, true);
        p.x = snap.x;
        p.y = snap.y;
    }
    if(drawMode==='polygon'){
        const now=Date.now();
        
        // Akıllı hizalama ile başlangıç noktasına tıklandığında (veya çok yakınsa) direkt kapat
        if (polygonPoints.length >= 3) {
            let firstPt = polygonPoints[0];
            let dist = Math.sqrt(Math.pow(p.x - firstPt.x, 2) + Math.pow(p.y - firstPt.y, 2));
            if (dist < 20 / (window.scaleFactor || 1)) {
                closePolygon();
                return;
            }
        }
        
        if(now-lastClickTime<350&&polygonPoints.length>=3){closePolygon();lastClickTime=0;return}
        lastClickTime=now;
        polygonPoints.push(p);
        polygonBuilding=true;
        updateTempPolygonSaber();
        redrawAll();
        drawTempPolygon();
        return;
    }
    isDrawing=true;
    drawStartX=p.x;
    drawStartY=p.y;
    currentPath=[p];
}"""

draw_code = re.sub(r'function dStart\(e\)\{[\s\S]*?currentPath=\[p\];\n\}', new_dstart, draw_code)

# Ensure closePolygon correctly marks polygon as closed
# The previous version popped the last point which was problematic. Let's fix that.
# We don't need to pop if we just close from the last explicitly added point.
new_close_polygon = """function closePolygon(){
    if(!isDrawing || drawMode !== 'polygon' || !window.polygonPoints || window.polygonPoints.length === 0) return;
    isDrawing = false;
    
    polygonBuilding = false;
    const s = getDS();
    
    // Add to drawPaths without modifying polygonPoints so it preserves the exact shape the user wanted
    const z = parseInt(document.getElementById('photoZoomCtrl') ? document.getElementById('photoZoomCtrl').value : 100);
    const px = parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50);
    const py = parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50);
    const panel = getActivePhotoPanel();
    const pl = getActiveV4Element();
    let photoRef;
    if (pl && pl.dataset.zpReady === '1') {
        photoRef = {
            v4: true,
            z: parseFloat(pl.dataset.zpScale) || 1,
            px: parseFloat(pl.dataset.zpX) || 0,
            py: parseFloat(pl.dataset.zpY) || 0,
            panelW: panel.w, panelH: panel.h, panelL: panel.left, panelT: panel.top
        };
    } else {
        photoRef = {
            v4: false,
            z: z,
            px: px,
            py: py,
            panelW: panel.w, panelH: panel.h, panelL: panel.left, panelT: panel.top
        };
    }

    const pObj = Object.assign({type:'polygon',points:window.polygonPoints.slice(),closed:true,photoRef},s);
    window.drawPaths = window.drawPaths || [];
    window.drawPaths.push(pObj);
    
    window.polygonPoints = [];
    if(window.clearSnapGuides) window.clearSnapGuides();
    redrawAll();
    
    setTimeout(() => {
        const pEls = document.querySelectorAll('.canvas-el[data-type="polygon"]');
        if(pEls.length>0){
            if(typeof selectElement === 'function') selectElement(pEls[pEls.length-1]);
        }
    }, 100);
}"""

draw_code = re.sub(r'function closePolygon\(\)\{[\s\S]*?\}, 100\);\n\}', new_close_polygon, draw_code)

with open(draw_file, 'w', encoding='utf-8') as f:
    f.write(draw_code)
print('Patched modules/draw.js')
