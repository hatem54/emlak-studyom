const fs = require('fs');
const coreFile = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core.js';
let coreCode = fs.readFileSync(coreFile, 'utf8');

const snapStart = coreCode.indexOf('window.getSnapGuides = function(px, py, excludeEl) {');
const snapEnd = coreCode.indexOf('window.clearSnapGuides = function() {') + 'window.clearSnapGuides = function() {\n    document.querySelectorAll(\'.snap-guide-line\').forEach(e => e.remove());\n};\n'.length;

const newSnapLogic = `window.getSnapGuides = function(px, py, excludeEl) {
    const snapToggle = document.getElementById('drawSnapToggle');
    if (!snapToggle || !snapToggle.checked) return { x: px, y: py, guides: [] };
    
    const snapThreshold = 15;
    
    const baseW = window.baseW || 1080;
    const baseH = window.baseH || 1080;

    let points = []; 
    let vLines = [0, baseW / 2, baseW]; 
    let hLines = [0, baseH / 2, baseH]; 

    // Center point of canvas
    points.push({x: baseW/2, y: baseH/2, type: 'canvas-center'});

    // Read DOM elements except SVGs which have padding
    const allEls = document.querySelectorAll('.editable-text, .canvas-el, .cvi-item, .callout-wrap, .svg-callout');
    allEls.forEach(el => {
        if (el === excludeEl || el.dataset.locked === 'true' || el.style.display === 'none') return;
        let left = parseFloat(el.style.left);
        let top = parseFloat(el.style.top);
        let w = el.offsetWidth;
        let h = el.offsetHeight;
        if (!isNaN(left) && !isNaN(top) && w > 0 && h > 0) {
            points.push({x: left + w/2, y: top + h/2, type: 'obj-center'});
            points.push({x: left, y: top, type: 'obj-corner'});
            points.push({x: left + w, y: top, type: 'obj-corner'});
            points.push({x: left, y: top + h, type: 'obj-corner'});
            points.push({x: left + w, y: top + h, type: 'obj-corner'});
            
            vLines.push(left, left + w / 2, left + w);
            hLines.push(top, top + h / 2, top + h);
        }
    });

    // Parse exact paths
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

    // 1. Point Snapping (Highest Priority)
    let closestPoint = null;
    let minPointDist = snapThreshold;
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
        // 2. Line Snapping (Lower Priority)
        let closestX = null, closestY = null;
        let minDistX = snapThreshold, minDistY = snapThreshold;

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
    const container = document.getElementById('photo-layer') || document.body;
    document.querySelectorAll('.snap-guide-line, .snap-guide-point').forEach(e => e.remove());
    
    if (!guides || guides.length === 0) return;
    
    guides.forEach(g => {
        if (g.type === 'point') {
            const pt = document.createElement('div');
            pt.className = 'snap-guide-point';
            pt.style.position = 'absolute';
            pt.style.left = g.x + 'px';
            pt.style.top = g.y + 'px';
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
                line.style.left = g.x + 'px';
                line.style.top = '0';
                line.style.width = '1px';
                line.style.height = '100%';
                line.style.borderLeft = '1px dashed rgba(245, 158, 11, 0.4)';
            } else {
                line.style.top = g.y + 'px';
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
`;

if (snapStart !== -1) {
    let endIdx = snapEnd;
    if (endIdx < snapStart) {
        // If couldn't find exact clearSnapGuides length, fallback to simple end
        endIdx = coreCode.indexOf('window.clearSnapGuides = function()', snapStart);
        let endBracket = coreCode.indexOf('}', endIdx);
        endIdx = endBracket + 2; 
    }
    
    coreCode = coreCode.substring(0, snapStart) + newSnapLogic + coreCode.substring(endIdx);
    fs.writeFileSync(coreFile, coreCode);
} else {
    console.error('Could not find window.getSnapGuides');
}
