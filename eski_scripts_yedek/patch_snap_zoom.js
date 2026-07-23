const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core.js';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `    if (window.drawPaths) {
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
    }`;

const replaceStr = `    let currObj = null;
    if (typeof getActivePhotoPanel === 'function') {
        const z = parseInt(document.getElementById('photoZoomCtrl') ? document.getElementById('photoZoomCtrl').value : 100);
        const cpx = parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50);
        const cpy = parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50);
        const panel = getActivePhotoPanel();
        const pl = typeof getActiveV4Element === 'function' ? getActiveV4Element() : null;
        currObj = { z: z, px: cpx, py: cpy, v4: false };
        if (pl && pl.dataset.zpReady === '1') {
            currObj = {
                v4: true,
                z: parseFloat(pl.dataset.zpScale) || 1,
                px: parseFloat(pl.dataset.zpX) || 0,
                py: parseFloat(pl.dataset.zpY) || 0,
                sliderX: parseFloat(pl.dataset.zpSliderX) || 50,
                sliderY: parseFloat(pl.dataset.zpSliderY) || 50,
                panelW: panel ? panel.offsetWidth : 1920,
                panelH: panel ? panel.offsetHeight : 1080,
                panelL: 0,
                panelT: 0
            };
        } else if (panel) {
            currObj.panelW = panel.offsetWidth;
            currObj.panelH = panel.offsetHeight;
            currObj.panelL = 0;
            currObj.panelT = 0;
            currObj.extraZ = parseFloat(panel.dataset.extraZ) || 1;
            currObj.extraPx = parseFloat(panel.dataset.extraPx) || 0;
            currObj.extraPy = parseFloat(panel.dataset.extraPy) || 0;
        }
    }

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
    }`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replaceStr);
    fs.writeFileSync(file, code);
    console.log("Patched snap guides zoom transform successfully!");
} else {
    console.log("Could not find target string in core.js for zoom transform.");
}
