const fs = require('fs');

let code = fs.readFileSync('core.js', 'utf8');
const lines = code.split(/\r?\n/);

// Remove first 41 lines (0 to 40)
lines.splice(0, 41);

// Find the line index of `        if (g.type === 'point') {`
let badIndex = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("if (g.type === 'point') {")) {
        // Double check that the previous line is "    });"
        if (lines[i-1] && lines[i-1].includes("    });")) {
            badIndex = i;
            break;
        }
        if (lines[i-2] && lines[i-2].includes("    });")) {
            badIndex = i;
            break;
        }
    }
}

if (badIndex !== -1) {
    const replacementLines = `    const currObj = window.getCurrentPhotoState ? window.getCurrentPhotoState() : null;

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
};

window.drawSnapGuides = function(guides) {
    const container = document.getElementById('photo-layer') || document.body;
    const drawCanvas = document.getElementById('draw-layer') || document.getElementById('drawCanvas');
    const logicW = drawCanvas ? drawCanvas.width : 1080;
    const logicH = drawCanvas ? drawCanvas.height : 1080;
    document.querySelectorAll('.snap-guide-line, .snap-guide-point').forEach(e => e.remove());
    
    if (!guides || guides.length === 0) return;
    
    guides.forEach(g => {`.split('\n');

    lines.splice(badIndex, 0, ...replacementLines);
    
    fs.writeFileSync('core.js', lines.join('\n'));
    console.log("Successfully fixed core.js");
} else {
    console.log("Could not find badIndex");
}
