const fs = require('fs');
let drawJs = fs.readFileSync('modules/draw.js', 'utf8');

// 1. Add state variables at the top
const stateVars = `let drawMode = 'off'; // existing
let selectedDrawIndex = -1;
let dragMode = null; // 'translate', 'rotate', 'vertex'
let dragVertexIndex = -1;
let dragStartX = 0;
let dragStartY = 0;
let initialPathState = null;`;

if (!drawJs.includes('let selectedDrawIndex = -1;')) {
    drawJs = drawJs.replace(/let drawMode\s*=\s*'off';/, stateVars);
}

// 2. Update setDrawMode
const setDrawModeStr = `function setDrawMode(mode){
    removeTempPolygonSaber();
    if(mode!=='polygon'&&polygonBuilding){polygonPoints=[];polygonBuilding=false;redrawAll()}
    drawMode=mode;
    ['dmOff','dmSelect','dmFree','dmLine','dmArrow','dmRect','dmCircle','dmPoly'].forEach(id=>{if($(id))$(id).classList.remove('active')});
    const map={off:'dmOff',select:'dmSelect',free:'dmFree',line:'dmLine',arrow:'dmArrow',rect:'dmRect',circle:'dmCircle',polygon:'dmPoly'};
    if($(map[mode]))$(map[mode]).classList.add('active');
    $('polyInfo').style.display=mode==='polygon'?'block':'none';
    
    selectedDrawIndex = -1;
    
    if(mode==='off'){
        drawCanvas.style.pointerEvents='none';
        $('drawIndicator').classList.remove('show');
        $('canvasHint').textContent='💡 Tek tık: Seç | Çift tık: Yazıyı Düzenle | Sürükle: Taşı';
    }else{
        drawCanvas.style.pointerEvents='auto';
        if(mode === 'select'){
            drawCanvas.style.cursor='default';
            $('canvasHint').textContent='🖱️ Çizimi seç, serbest taşı veya köşelerinden düzenle';
        } else {
            drawCanvas.style.cursor='crosshair';
            $('canvasHint').textContent=mode==='polygon'?'🔷 Tıklayarak köşe ekle, çift tıkla kapat':'✏️ ÇİZİM AKTİF';
        }
        $('drawIndicator').classList.add('show');
    }
    redrawAll();
}`;

// Replace existing setDrawMode
const setDrawModeRegex = /function setDrawMode\([^{]*\{[\s\S]*?\n\}/;
if (drawJs.match(setDrawModeRegex)) {
    drawJs = drawJs.replace(setDrawModeRegex, setDrawModeStr);
}

// 3. Update drawSinglePath to support transform
const applyTransformRegex = /drawCtx\.lineJoin = 'round';/;
const applyTransformCode = `drawCtx.lineJoin = 'round';
    
    // Apply Vector Transforms
    if (p.translateX || p.translateY || p.rotation) {
        const tx = p.translateX || 0;
        const ty = p.translateY || 0;
        const rot = p.rotation || 0;
        
        let cx = 0, cy = 0;
        if (p.type === 'free' || p.type === 'polygon') {
            let sumX = 0, sumY = 0;
            p.points.forEach(pt => { sumX += pt.x; sumY += pt.y; });
            cx = sumX / p.points.length;
            cy = sumY / p.points.length;
        } else {
            cx = (p.x1 + p.x2) / 2;
            cy = (p.y1 + p.y2) / 2;
        }
        
        // Save center for bounding box logic later
        p.centerX = cx;
        p.centerY = cy;

        drawCtx.translate(cx + tx, cy + ty);
        drawCtx.rotate(rot);
        drawCtx.translate(-cx, -cy);
    }`;

if (drawJs.match(applyTransformRegex) && !drawJs.includes('// Apply Vector Transforms')) {
    drawJs = drawJs.replace(applyTransformRegex, applyTransformCode);
}

// 4. Hit testing and Bounding Box
const extraFunctions = `

function getPathBoundingBox(p) {
    let minX=99999, minY=99999, maxX=-99999, maxY=-99999;
    const pts = [];
    if(p.type==='free' || p.type==='polygon') pts.push(...p.points);
    else if(p.type==='line' || p.type==='arrow' || p.type==='rect' || p.type==='circle') {
        pts.push({x:p.x1, y:p.y1}, {x:p.x2, y:p.y2});
        if(p.type==='circle') {
             const cx = (p.x1+p.x2)/2, cy = (p.y1+p.y2)/2;
             const rx = Math.abs(p.x2-p.x1)/2, ry = Math.abs(p.y2-p.y1)/2;
             pts.push({x:cx-rx, y:cy-ry}, {x:cx+rx, y:cy+ry});
        }
    }
    pts.forEach(pt => {
        if(pt.x<minX) minX=pt.x; if(pt.x>maxX) maxX=pt.x;
        if(pt.y<minY) minY=pt.y; if(pt.y>maxY) maxY=pt.y;
    });
    return { minX, minY, maxX, maxY, cx: (minX+maxX)/2, cy: (minY+maxY)/2, w: maxX-minX, h: maxY-minY };
}

function drawSelectionUI(p) {
    drawCtx.save();
    
    const tx = p.translateX || 0;
    const ty = p.translateY || 0;
    const rot = p.rotation || 0;
    const box = getPathBoundingBox(p);
    
    drawCtx.translate(box.cx + tx, box.cy + ty);
    drawCtx.rotate(rot);
    drawCtx.translate(-box.cx, -box.cy);
    
    // Draw Bounding Box
    drawCtx.strokeStyle = '#3b82f6'; // Blue
    drawCtx.lineWidth = 1;
    drawCtx.setLineDash([5, 5]);
    drawCtx.strokeRect(box.minX - 10, box.minY - 10, box.w + 20, box.h + 20);
    
    // Draw Rotate Handle
    drawCtx.beginPath();
    drawCtx.moveTo(box.cx, box.minY - 10);
    drawCtx.lineTo(box.cx, box.minY - 30);
    drawCtx.stroke();
    
    drawCtx.beginPath();
    drawCtx.fillStyle = '#10b981'; // Green rotate handle
    drawCtx.arc(box.cx, box.minY - 30, 6, 0, Math.PI * 2);
    drawCtx.fill();
    drawCtx.setLineDash([]);
    drawCtx.stroke();
    
    // Draw Vertices for Lines and Polygons
    if (p.type === 'line' || p.type === 'arrow' || p.type === 'polygon') {
        drawCtx.fillStyle = '#ffffff';
        drawCtx.strokeStyle = '#3b82f6';
        drawCtx.lineWidth = 2;
        
        if (p.type === 'polygon') {
            p.points.forEach(pt => {
                drawCtx.beginPath();
                drawCtx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
                drawCtx.fill();
                drawCtx.stroke();
            });
        } else {
            drawCtx.beginPath(); drawCtx.arc(p.x1, p.y1, 5, 0, Math.PI * 2); drawCtx.fill(); drawCtx.stroke();
            drawCtx.beginPath(); drawCtx.arc(p.x2, p.y2, 5, 0, Math.PI * 2); drawCtx.fill(); drawCtx.stroke();
        }
    }
    
    drawCtx.restore();
}

function isPointInTransformedRect(px, py, rx, ry, rw, rh, tx, ty, rot, cx, cy) {
    // Transform point backwards
    const dx = px - (cx + tx);
    const dy = py - (cy + ty);
    const unrotX = dx * Math.cos(-rot) - dy * Math.sin(-rot) + cx;
    const unrotY = dx * Math.sin(-rot) + dy * Math.cos(-rot) + cy;
    
    return unrotX >= rx && unrotX <= rx + rw && unrotY >= ry && unrotY <= ry + rh;
}

function hitTestSelection(px, py) {
    if (selectedDrawIndex !== -1) {
        const p = drawPaths[selectedDrawIndex];
        const tx = p.translateX || 0;
        const ty = p.translateY || 0;
        const rot = p.rotation || 0;
        const box = getPathBoundingBox(p);
        
        // Transform mouse point backwards to local space
        const dx = px - (box.cx + tx);
        const dy = py - (box.cy + ty);
        const unrotX = dx * Math.cos(-rot) - dy * Math.sin(-rot) + box.cx;
        const unrotY = dx * Math.sin(-rot) + dy * Math.cos(-rot) + box.cy;
        
        // Check rotate handle (radius 10)
        if (Math.hypot(unrotX - box.cx, unrotY - (box.minY - 30)) < 15) {
            return { type: 'rotate' };
        }
        
        // Check vertices
        if (p.type === 'line' || p.type === 'arrow') {
            if (Math.hypot(unrotX - p.x1, unrotY - p.y1) < 10) return { type: 'vertex', index: 0 };
            if (Math.hypot(unrotX - p.x2, unrotY - p.y2) < 10) return { type: 'vertex', index: 1 };
        } else if (p.type === 'polygon') {
            for (let i = 0; i < p.points.length; i++) {
                if (Math.hypot(unrotX - p.points[i].x, unrotY - p.points[i].y) < 10) return { type: 'vertex', index: i };
            }
        }
        
        // Check bounding box body
        if (unrotX >= box.minX - 10 && unrotX <= box.maxX + 10 && unrotY >= box.minY - 10 && unrotY <= box.maxY + 10) {
            return { type: 'translate' };
        }
    }
    
    // Check all paths (reverse order for z-index)
    for (let i = drawPaths.length - 1; i >= 0; i--) {
        const p = drawPaths[i];
        const tx = p.translateX || 0;
        const ty = p.translateY || 0;
        const rot = p.rotation || 0;
        const box = getPathBoundingBox(p);
        
        if (isPointInTransformedRect(px, py, box.minX - 5, box.minY - 5, box.w + 10, box.h + 10, tx, ty, rot, box.cx, box.cy)) {
            return { type: 'select', index: i };
        }
    }
    return null;
}
`;

if (!drawJs.includes('function getPathBoundingBox')) {
    drawJs += extraFunctions;
}

// 5. Inject drawSelectionUI into redrawAll
const redrawAllMatch = /drawPaths\.forEach\(p=>drawSinglePath\(p\)\);/;
if (drawJs.match(redrawAllMatch) && !drawJs.includes('drawSelectionUI(drawPaths[selectedDrawIndex]);')) {
    drawJs = drawJs.replace(redrawAllMatch, `drawPaths.forEach(p=>drawSinglePath(p));
        if (selectedDrawIndex !== -1 && selectedDrawIndex < drawPaths.length) {
            drawSelectionUI(drawPaths[selectedDrawIndex]);
        }`);
}

// 6. Update dStart, dMove, dEnd
const dStartRegex = /function dStart\(e\)\{[\s\S]*?if\(drawMode==='polygon'\)\{/m;
const dStartReplacement = `function dStart(e){
    if(drawMode==='off')return;
    e.preventDefault();
    e.stopPropagation();
    const p=canvasXY(e.touches?e.touches[0]:e);
    
    if (drawMode === 'select') {
        const hit = hitTestSelection(p.x, p.y);
        if (hit) {
            if (hit.type === 'select') {
                selectedDrawIndex = hit.index;
                startDrawEdit(hit.index); // Select in UI too
                dragMode = 'translate';
            } else {
                dragMode = hit.type;
                dragVertexIndex = hit.index;
            }
            dragStartX = p.x;
            dragStartY = p.y;
            initialPathState = JSON.parse(JSON.stringify(drawPaths[selectedDrawIndex]));
            redrawAll();
        } else {
            selectedDrawIndex = -1;
            dragMode = null;
            cancelDrawEdit();
            redrawAll();
        }
        return;
    }
    
    if(drawMode==='polygon'){`;
if (drawJs.match(dStartRegex)) {
    drawJs = drawJs.replace(dStartRegex, dStartReplacement);
}

const dMoveRegex = /function dMove\(e\)\{[\s\S]*?if\(drawMode==='polygon'\)\{/m;
const dMoveReplacement = `function dMove(e){
    if(drawMode==='off')return;
    e.preventDefault();
    e.stopPropagation();
    const p=canvasXY(e.touches?e.touches[0]:e);
    
    if (drawMode === 'select' && dragMode && selectedDrawIndex !== -1) {
        const path = drawPaths[selectedDrawIndex];
        const dx = p.x - dragStartX;
        const dy = p.y - dragStartY;
        
        if (dragMode === 'translate') {
            path.translateX = (initialPathState.translateX || 0) + dx;
            path.translateY = (initialPathState.translateY || 0) + dy;
        } else if (dragMode === 'rotate') {
            const box = getPathBoundingBox(initialPathState);
            const cx = box.cx + (initialPathState.translateX || 0);
            const cy = box.cy + (initialPathState.translateY || 0);
            const initialAngle = Math.atan2(dragStartY - cy, dragStartX - cx);
            const currentAngle = Math.atan2(p.y - cy, p.x - cx);
            path.rotation = (initialPathState.rotation || 0) + (currentAngle - initialAngle);
        } else if (dragMode === 'vertex') {
            // Need to apply inverse transform to the delta
            const rot = path.rotation || 0;
            const idx = dragVertexIndex;
            
            // For vertices, we modify the raw points, so we un-rotate the movement vector
            const unrotDx = dx * Math.cos(-rot) - dy * Math.sin(-rot);
            const unrotDy = dx * Math.sin(-rot) + dy * Math.cos(-rot);
            
            if (path.type === 'line' || path.type === 'arrow') {
                if (idx === 0) { path.x1 = initialPathState.x1 + unrotDx; path.y1 = initialPathState.y1 + unrotDy; }
                if (idx === 1) { path.x2 = initialPathState.x2 + unrotDx; path.y2 = initialPathState.y2 + unrotDy; }
            } else if (path.type === 'polygon') {
                path.points[idx].x = initialPathState.points[idx].x + unrotDx;
                path.points[idx].y = initialPathState.points[idx].y + unrotDy;
            }
        }
        redrawAll();
        return;
    }
    
    if(drawMode==='polygon'){`;
if (drawJs.match(dMoveRegex)) {
    drawJs = drawJs.replace(dMoveRegex, dMoveReplacement);
}

const dEndRegex = /function dEnd\(e\)\{[\s\S]*?if\(!isDrawing\)return;/m;
const dEndReplacement = `function dEnd(e){
    if(drawMode==='off'||drawMode==='polygon')return;
    if (drawMode === 'select') {
        if (dragMode) {
            // Commit changes, trigger Saber update if needed
            const path = drawPaths[selectedDrawIndex];
            if (path && path.hasSaber && window.saberState && window.applySaberToPath) {
                // If it's translated or rotated, we just update transform
                // If vertex moved, we must redraw the saber
                if (dragMode === 'vertex') {
                    window.applySaberToPath(selectedDrawIndex, path.saberOptions || window.saberState);
                } else {
                    // Handled automatically in drawSinglePath via setSaberTransform
                    redrawAll();
                }
            }
            dragMode = null;
        }
        return;
    }
    if(!isDrawing)return;`;
if (drawJs.match(dEndRegex)) {
    drawJs = drawJs.replace(dEndRegex, dEndReplacement);
}

// 7. Add dmSelect to CSS check if needed, but the button class is already draw-mode-btn.

fs.writeFileSync('modules/draw.js', drawJs, 'utf8');
console.log('Successfully updated modules/draw.js');
