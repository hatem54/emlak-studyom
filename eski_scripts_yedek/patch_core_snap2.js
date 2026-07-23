const fs = require('fs');
const coreFile = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core.js';
let coreCode = fs.readFileSync(coreFile, 'utf8');

const snapStart = coreCode.indexOf('window.getSnapGuides = function(px, py, excludeEl) {');
const snapEnd = coreCode.indexOf('window.drawSnapGuides = function(guides) {');

if (snapStart !== -1 && snapEnd !== -1) {
    const newSnapLogic = `window.getSnapGuides = function(px, py, excludeEl) {
    const snapToggle = document.getElementById('drawSnapToggle');
    if (!snapToggle || !snapToggle.checked) return { x: px, y: py, guides: [] };
    
    const snapThreshold = 15;
    let closestX = null, closestY = null;
    let minDistX = snapThreshold, minDistY = snapThreshold;
    const guides = [];

    const baseW = window.baseW || 1080;
    const baseH = window.baseH || 1080;

    const targetsX = [0, baseW / 2, baseW];
    const targetsY = [0, baseH / 2, baseH];

    // Read DOM elements except SVGs which have padding
    const allEls = document.querySelectorAll('.editable-text, .canvas-el, .cvi-item, .callout-wrap, .svg-callout');
    allEls.forEach(el => {
        if (el === excludeEl || el.dataset.locked === 'true' || el.style.display === 'none') return;
        let left = parseFloat(el.style.left);
        let top = parseFloat(el.style.top);
        let w = el.offsetWidth;
        let h = el.offsetHeight;
        if (!isNaN(left) && !isNaN(top) && w > 0 && h > 0) {
            targetsX.push(left, left + w / 2, left + w);
            targetsY.push(top, top + h / 2, top + h);
        }
    });

    // Parse exact paths
    if (window.drawPaths) {
        window.drawPaths.forEach(p => {
            if (p.el === excludeEl) return;
            if (p.type === 'free' && p.points) {
                p.points.forEach(pt => { targetsX.push(pt.x); targetsY.push(pt.y); });
            } else if (p.type === 'polygon' && p.points) {
                p.points.forEach(pt => { targetsX.push(pt.x); targetsY.push(pt.y); });
            } else if (p.x1 !== undefined && p.x2 !== undefined) {
                targetsX.push(p.x1, p.x2, (p.x1+p.x2)/2);
                targetsY.push(p.y1, p.y2, (p.y1+p.y2)/2);
            }
        });
    }

    if (window.polygonPoints && window.polygonPoints.length > 0) {
        window.polygonPoints.forEach(pt => {
            targetsX.push(pt.x);
            targetsY.push(pt.y);
        });
    }

    targetsX.forEach(tx => {
        if (Math.abs(tx - px) < minDistX) { minDistX = Math.abs(tx - px); closestX = tx; }
    });

    targetsY.forEach(ty => {
        if (Math.abs(ty - py) < minDistY) { minDistY = Math.abs(ty - py); closestY = ty; }
    });

    let finalX = px, finalY = py;
    if (closestX !== null) { finalX = closestX; guides.push({ type: 'v', x: closestX }); }
    if (closestY !== null) { finalY = closestY; guides.push({ type: 'h', y: closestY }); }

    return { x: finalX, y: finalY, guides };
};

`;
    coreCode = coreCode.substring(0, snapStart) + newSnapLogic + coreCode.substring(snapEnd);
    fs.writeFileSync(coreFile, coreCode);
}
