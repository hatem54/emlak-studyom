// ==================== SNAP GUIDES ====================
window.getSnapGuides = function(px, py, excludeEl, isDrawingMode) {
    const snapToggle = document.getElementById('drawSnapToggle');
    if (!snapToggle || !snapToggle.checked) return { x: px, y: py, guides: [] };
    
    const pointSnapThreshold = 40 / (typeof scaleFactor !== "undefined" ? scaleFactor : 1);
    const lineSnapThreshold = 10 / (typeof scaleFactor !== "undefined" ? scaleFactor : 1);
    
    const drawCanvas = document.getElementById('draw-layer') || document.getElementById('drawCanvas');
    const baseW = drawCanvas ? drawCanvas.width : 1080;
    const baseH = drawCanvas ? drawCanvas.height : 1080;

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
            
            let svg = el.querySelector('svg');
            let isVector = false;
            if (svg) {
                let line = svg.querySelector('line');
                if (line) {
                    isVector = true;
                    let x1 = parseFloat(line.getAttribute('x1'));
                    let y1 = parseFloat(line.getAttribute('y1'));
                    let x2 = parseFloat(line.getAttribute('x2'));
                    let y2 = parseFloat(line.getAttribute('y2'));
                    if(!isNaN(x1) && !isNaN(y1)) points.push({x: left + x1, y: top + y1, type: 'line-end'});
                    if(!isNaN(x2) && !isNaN(y2)) points.push({x: left + x2, y: top + y2, type: 'line-end'});
                }
                let poly = svg.querySelector('polyline') || svg.querySelector('polygon');
                if (poly) {
                    isVector = true;
                    let ptsStr = poly.getAttribute('points');
                    if (ptsStr) {
                        let pts = ptsStr.split(' ').map(p => {
                            let coords = p.split(',');
                            return {x: parseFloat(coords[0]), y: parseFloat(coords[1])};
                        }).filter(p => !isNaN(p.x) && !isNaN(p.y));
                        if (pts.length > 0) {
                            points.push({x: left + pts[0].x, y: top + pts[0].y, type: 'path-end'});
                            points.push({x: left + pts[pts.length-1].x, y: top + pts[pts.length-1].y, type: 'path-end'});
                            pts.forEach(pt => points.push({x: left + pt.x, y: top + pt.y, type: 'polygon-vertex'}));
                        }
                    }
                }
                let ellipse = svg.querySelector('ellipse');
                if (ellipse) {
                    isVector = true;
                    let cx = parseFloat(ellipse.getAttribute('cx'));
                    let cy = parseFloat(ellipse.getAttribute('cy'));
                    let rx = parseFloat(ellipse.getAttribute('rx'));
                    let ry = parseFloat(ellipse.getAttribute('ry'));
                    if (!isNaN(cx) && !isNaN(cy) && !isNaN(rx) && !isNaN(ry)) {
                        points.push({x: left + cx, y: top + cy - ry, type: 'ellipse-quadrant'});
                        points.push({x: left + cx, y: top + cy + ry, type: 'ellipse-quadrant'});
                        points.push({x: left + cx - rx, y: top + cy, type: 'ellipse-quadrant'});
                        points.push({x: left + cx + rx, y: top + cy, type: 'ellipse-quadrant'});
                        points.push({x: left + cx, y: top + cy, type: 'ellipse-center'});
                    }
                }
                let path = svg.querySelector('path');
                if (path) {
                    isVector = true;
                    let d = path.getAttribute('d');
                    if (d) {
                        const matches = [...d.matchAll(/([ML])\s+([-.\d]+)\s+([-.\d]+)/g)];
                        matches.forEach(m => {
                            points.push({x: left + parseFloat(m[2]), y: top + parseFloat(m[3]), type: 'path-point'});
                        });
                    }
                }
            }

            if (isDrawingMode && !isVector) {
                // When drawing, allow snapping to corners of non-vector objects (rects, text, images)
                points.push({x: left, y: top, type: 'obj-corner'});
                points.push({x: left + w, y: top, type: 'obj-corner'});
                points.push({x: left, y: top + h, type: 'obj-corner'});
                points.push({x: left + w, y: top + h, type: 'obj-corner'});
                // And edge midpoints
                points.push({x: left + w/2, y: top, type: 'obj-edge'});
                points.push({x: left + w/2, y: top + h, type: 'obj-edge'});
                points.push({x: left, y: top + h/2, type: 'obj-edge'});
                points.push({x: left + w, y: top + h/2, type: 'obj-edge'});
            }

            if (!isDrawingMode) {
                // Sadece obje ortalarina ve kenarlarina cizgi cek (karmasikligi onlemek icin köselere nokta atama)
                vLines.push(left, left + w / 2, left + w);
                hLines.push(top, top + h / 2, top + h);
            }
        }
    });

    const currObj = window.getCurrentPhotoState ? window.getCurrentPhotoState() : null;

    if (typeof drawPaths !== 'undefined') {
        drawPaths.forEach(p => {
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