const fs = require('fs');

// Patch core.js
const coreFile = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core.js';
let coreCode = fs.readFileSync(coreFile, 'utf8');

const snapStart = coreCode.indexOf('window.getSnapGuides = function(px, py, excludeEl');
const snapEnd = coreCode.indexOf('window.drawSnapGuides = function(guides)');

const newSnapLogic = `window.getSnapGuides = function(px, py, excludeEl, isDrawingMode) {
    const snapToggle = document.getElementById('drawSnapToggle');
    if (!snapToggle || !snapToggle.checked) return { x: px, y: py, guides: [] };
    
    const pointSnapThreshold = 12 / (window.scaleFactor || 1);
    const lineSnapThreshold = 5 / (window.scaleFactor || 1);
    
    const baseW = window.baseW || 1080;
    const baseH = window.baseH || 1080;

    let points = []; 
    let vLines = [0, baseW / 2, baseW]; 
    let hLines = [0, baseH / 2, baseH]; 

    points.push({x: baseW/2, y: baseH/2, type: 'canvas-center'});

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

    if (window.drawPaths) {
        window.drawPaths.forEach(p => {
            if (p.el === excludeEl) return;
            if (p.type === 'free' && p.points && p.points.length > 0) {
                points.push({x: p.points[0].x, y: p.points[0].y, type: 'path-end'});
                points.push({x: p.points[p.points.length-1].x, y: p.points[p.points.length-1].y, type: 'path-end'});
            } else if (p.type === 'polygon' && p.points) {
                p.points.forEach(pt => { points.push({x: pt.x, y: pt.y, type: 'polygon-vertex'}); });
            } else if (p.x1 !== undefined && p.x2 !== undefined) {
                points.push({x: p.x1, y: p.y1, type: 'line-end'});
                points.push({x: p.x2, y: p.y2, type: 'line-end'});
                points.push({x: (p.x1+p.x2)/2, y: (p.y1+p.y2)/2, type: 'line-mid'});
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

`;
coreCode = coreCode.substring(0, snapStart) + newSnapLogic + coreCode.substring(snapEnd);
fs.writeFileSync(coreFile, coreCode);


// Patch draw.js
const drawFile = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/modules/draw.js';
let drawCode = fs.readFileSync(drawFile, 'utf8');

drawCode = drawCode.replace(
    `const snapResult = window.getSnapGuides(p.x, p.y, null);`,
    `const snapResult = window.getSnapGuides(p.x, p.y, null, true);`
);
drawCode = drawCode.replace(
    `const snapResult = window.getSnapGuides(p.x, p.y, null);`,
    `const snapResult = window.getSnapGuides(p.x, p.y, null, true);`
);

fs.writeFileSync(drawFile, drawCode);
