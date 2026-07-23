const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/modules/draw.js';
let code = fs.readFileSync(file, 'utf8');

// Patch 1: dMove isSnapping logic
const moveTarget = `if(drawMode !== 'free' && typeof window.getSnapGuides === 'function' && isDrawing) {`;
const moveReplacement = `let isSnapping = isDrawing || (drawMode === 'polygon' && polygonBuilding);
    if(drawMode !== 'free' && typeof window.getSnapGuides === 'function' && isSnapping) {`;
code = code.replace(moveTarget, moveReplacement);

// Patch 2: closePolygon logic
const closeTarget = `function closePolygon(){
    if(polygonPoints.length<3)return;`;
const closeReplacement = `function closePolygon(){
    if (polygonPoints.length >= 3) {
        let last = polygonPoints[polygonPoints.length - 1];
        let prev = polygonPoints[polygonPoints.length - 2];
        if (Math.abs(last.x - prev.x) < 5 && Math.abs(last.y - prev.y) < 5) {
            polygonPoints.pop();
        }
    }
    if (polygonPoints.length >= 3) {
        let first = polygonPoints[0];
        let last = polygonPoints[polygonPoints.length - 1];
        if (Math.abs(last.x - first.x) < 5 && Math.abs(last.y - first.y) < 5) {
            polygonPoints.pop();
        }
    }
    if(polygonPoints.length<3) { polygonBuilding = false; return; }`;
code = code.replace(closeTarget, closeReplacement);

fs.writeFileSync(file, code);
