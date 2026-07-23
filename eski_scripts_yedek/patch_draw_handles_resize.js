const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/modules/draw.js';
let content = fs.readFileSync(file, 'utf8');

const s = content.indexOf('window.showVertexHandles = function(el) {');
const e = content.indexOf('window.hideVertexHandles = function() {');
if (s !== -1 && e !== -1) {
    const oldCode = content.substring(s, e);
    const newCode = `window.showVertexHandles = function(el) {
    if(typeof hideVertexHandles === 'function') hideVertexHandles();
    if(!el) return;
    const svg = el.querySelector('svg');
    if(!svg) return;
    
    const baseW = parseFloat(el.dataset.baseWidth) || parseFloat(el.style.width) || 100;
    const baseH = parseFloat(el.dataset.baseHeight) || parseFloat(el.style.height) || 100;
    
    const container = document.createElement('div');
    container.className = 'vertex-handles-container';
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '999'; 
    
    const polygon = svg.querySelector('polygon');
    const lineEl = svg.querySelector('line');
    const shape = svg.querySelector('ellipse, path, line, polyline, rect') || polygon; 
    
    function recalculateShapeBounds(el) {
        const svg = el.querySelector('svg');
        const polygon = svg.querySelector('polygon');
        const lineEl = svg.querySelector('line');
        const shape = svg.querySelector('ellipse, path, line, polyline, rect') || polygon;
        
        const strokeW = shape ? (parseFloat(shape.getAttribute('stroke-width')) || 4) : 4;
        const padding = strokeW * 10 + 30;
        
        let pts = [];
        if (polygon && el.dataset.polygonPoints) {
            pts = JSON.parse(el.dataset.polygonPoints);
        } else if (lineEl) {
            pts = [
                {x: parseFloat(lineEl.getAttribute('x1')), y: parseFloat(lineEl.getAttribute('y1'))},
                {x: parseFloat(lineEl.getAttribute('x2')), y: parseFloat(lineEl.getAttribute('y2'))}
            ];
        }
        if (pts.length === 0) return;

        let pObj = null;
        if (typeof drawPaths !== 'undefined') pObj = drawPaths.find(p => p.el === el);
        
        const oldBaseLeft = parseFloat(el.dataset.baseLeft);
        const oldBaseTop = parseFloat(el.dataset.baseTop);

        let absPts = pts.map(pt => ({
            x: pt.x + oldBaseLeft,
            y: pt.y + oldBaseTop
        }));

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        absPts.forEach(pt => {
            if(pt.x < minX) minX = pt.x;
            if(pt.y < minY) minY = pt.y;
            if(pt.x > maxX) maxX = pt.x;
            if(pt.y > maxY) maxY = pt.y;
        });

        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;
        
        const w = maxX - minX;
        const h = maxY - minY;

        pts.forEach((pt, i) => {
            pt.x = absPts[i].x - minX;
            pt.y = absPts[i].y - minY;
        });

        el.dataset.baseLeft = minX;
        el.dataset.baseTop = minY;
        el.dataset.baseWidth = w;
        el.dataset.baseHeight = h;

        el.style.left = minX + 'px';
        el.style.top = minY + 'px';
        el.style.width = w + 'px';
        el.style.height = h + 'px';

        svg.setAttribute('viewBox', \`0 0 \${w} \${h}\`);
        
        if (polygon) {
            polygon.setAttribute('points', pts.map(p => \`\${p.x},\${p.y}\`).join(' '));
            el.dataset.polygonPoints = JSON.stringify(pts);
        } else if (lineEl) {
            lineEl.setAttribute('x1', pts[0].x);
            lineEl.setAttribute('y1', pts[0].y);
            lineEl.setAttribute('x2', pts[1].x);
            lineEl.setAttribute('y2', pts[1].y);
        }

        if (pObj) {
            if (pObj.type === 'polygon' || pObj.type === 'free' || pObj.type === 'rect') {
                pObj.points = absPts;
            } else if (pObj.type === 'line' || pObj.type === 'arrow' || pObj.type === 'circle') {
                pObj.x1 = absPts[0].x;
                pObj.y1 = absPts[0].y;
                pObj.x2 = absPts[1].x;
                pObj.y2 = absPts[1].y;
            }
        }
        
        if (typeof redrawAll === 'function') redrawAll();
        
        // Recreate handles to update positions visually within the new blue bounding box
        window.showVertexHandles(el);
    }
    
    if (polygon) {
        const pointsStr = polygon.getAttribute('points');
        if(pointsStr) {
            const points = pointsStr.split(' ').map(p => {
                const parts = p.split(',');
                if(parts.length < 2) return null;
                return {x: parseFloat(parts[0]), y: parseFloat(parts[1])};
            }).filter(p => p !== null);
            
            points.forEach((pt, i) => {
                const handle = createHandle(pt, baseW, baseH, (newX, newY) => {
                    pt.x = newX;
                    pt.y = newY;
                    polygon.setAttribute('points', points.map(p => \`\${p.x},\${p.y}\`).join(' '));
                    el.dataset.polygonPoints = JSON.stringify(points);
                });
                container.appendChild(handle);
            });
            el.dataset.polygonPoints = JSON.stringify(points);
        }
    } else if (lineEl) {
        const pt1 = {x: parseFloat(lineEl.getAttribute('x1')), y: parseFloat(lineEl.getAttribute('y1'))};
        const pt2 = {x: parseFloat(lineEl.getAttribute('x2')), y: parseFloat(lineEl.getAttribute('y2'))};
        const points = [pt1, pt2];
        
        points.forEach((pt, i) => {
            const handle = createHandle(pt, baseW, baseH, (newX, newY) => {
                pt.x = newX;
                pt.y = newY;
                if (i === 0) {
                    lineEl.setAttribute('x1', pt.x);
                    lineEl.setAttribute('y1', pt.y);
                } else {
                    lineEl.setAttribute('x2', pt.x);
                    lineEl.setAttribute('y2', pt.y);
                }
            });
            container.appendChild(handle);
        });
    }

    function createHandle(pt, bW, bH, onUpdate) {
        const handle = document.createElement('div');
        handle.className = 'vertex-handle';
        handle.style.position = 'absolute';
        handle.style.left = (pt.x / bW * 100) + '%';
        handle.style.top = (pt.y / bH * 100) + '%';
        handle.style.width = '30px';
        handle.style.height = '30px';
        handle.style.transform = 'translate(-50%, -50%)';
        handle.style.background = 'transparent';
        handle.style.borderRadius = '50%';
        handle.style.cursor = 'default';
        handle.style.pointerEvents = 'auto';
        
        const visual = document.createElement('div');
        visual.style.position = 'absolute';
        visual.style.left = '50%';
        visual.style.top = '50%';
        visual.style.transform = 'translate(-50%, -50%)';
        visual.style.width = '12px';
        visual.style.height = '12px';
        visual.style.background = '#fff';
        visual.style.border = '2px solid #3b82f6';
        visual.style.borderRadius = '50%';
        visual.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
        visual.style.pointerEvents = 'none';
        handle.appendChild(visual);
        
        function handleDown(e) {
            if (e.type === 'mousedown') { e.preventDefault(); e.stopPropagation(); }
            const evt = e.touches ? e.touches[0] : e;
            const startX = evt.clientX;
            const startY = evt.clientY;
            const startPtX = pt.x;
            const startPtY = pt.y;
            
            const rect = el.getBoundingClientRect();
            const sFactor = (typeof scaleFactor !== "undefined" ? scaleFactor : 1) || 1;
            const scaleX = (rect.width / sFactor) / bW;
            const scaleY = (rect.height / sFactor) / bH;
            
            function onMove(me) {
                const meEvt = me.touches ? me.touches[0] : me;
                const dx = (meEvt.clientX - startX) / sFactor / scaleX;
                const dy = (meEvt.clientY - startY) / sFactor / scaleY;
                let newX = startPtX + dx;
                let newY = startPtY + dy;
                if(window.getSnapGuides) {
                    const snap = window.getSnapGuides(newX, newY, null, true);
                    newX = snap.x;
                    newY = snap.y;
                    if(window.drawSnapGuides) window.drawSnapGuides(snap.guides);
                }
                handle.style.left = (newX / bW * 100) + '%';
                handle.style.top = (newY / bH * 100) + '%';
                onUpdate(newX, newY);
            }
            
            function onUp() {
                if(window.clearSnapGuides) window.clearSnapGuides();
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('touchend', onUp);
                
                recalculateShapeBounds(el);
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
            document.addEventListener('touchmove', onMove, {passive: false});
            document.addEventListener('touchend', onUp);
        }
        handle.addEventListener('mousedown', handleDown);
        handle.addEventListener('touchstart', handleDown, {passive: false});
        
        return handle;
    }

    const rotHandle = document.createElement('div');
    rotHandle.style.position = 'absolute';
    rotHandle.style.left = '50%';
    rotHandle.style.top = '-30px';
    rotHandle.style.width = '30px';
    rotHandle.style.height = '30px';
    rotHandle.style.transform = 'translate(-50%, -50%)';
    rotHandle.style.background = 'transparent';
    rotHandle.style.borderRadius = '50%';
    rotHandle.style.cursor = 'grab';
    rotHandle.style.pointerEvents = 'auto';

    const rotVisual = document.createElement('div');
    rotVisual.style.position = 'absolute';
    rotVisual.style.left = '50%';
    rotVisual.style.top = '50%';
    rotVisual.style.transform = 'translate(-50%, -50%)';
    rotVisual.style.width = '16px';
    rotVisual.style.height = '16px';
    rotVisual.style.background = '#fff';
    rotVisual.style.border = '2px solid #10b981';
    rotVisual.style.borderRadius = '50%';
    rotVisual.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
    rotVisual.style.pointerEvents = 'none';
    rotHandle.appendChild(rotVisual);
    
    const rotLine = document.createElement('div');
    rotLine.style.position = 'absolute';
    rotLine.style.left = '50%';
    rotLine.style.top = '-22px';
    rotLine.style.width = '2px';
    rotLine.style.height = '22px';
    rotLine.style.transform = 'translateX(-50%)';
    rotLine.style.background = '#10b981';
    container.appendChild(rotLine);
    
    function rotHandleDown(e) {
        if (e.type === 'mousedown') { e.preventDefault(); e.stopPropagation(); }
        const evt = e.touches ? e.touches[0] : e;
        rotHandle.style.cursor = 'grabbing';
        
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let startAngle = Math.atan2(evt.clientY - centerY, evt.clientX - centerX);
        let prevAngle = el.dataset.innerRotation ? parseFloat(el.dataset.innerRotation) : 0;
        
        let initialPoints = [];
        let points = [];
        if (polygon && el.dataset.polygonPoints) {
            points = JSON.parse(el.dataset.polygonPoints);
            initialPoints = points.map(p => ({x: p.x, y: p.y}));
            startAngle = Math.atan2(evt.clientY - centerY, evt.clientX - centerX);
        }
        
        function onMove(me) {
            const meEvt = me.touches ? me.touches[0] : me;
            const currentAngle = Math.atan2(meEvt.clientY - centerY, meEvt.clientX - centerX);
            let diffAngle = currentAngle - startAngle;
            
            const cx = baseW / 2;
            const cy = baseH / 2;
            
            if (polygon) {
                points.forEach((pt, i) => {
                    const ip = initialPoints[i];
                    const dx = ip.x - cx;
                    const dy = ip.y - cy;
                    pt.x = cx + dx * Math.cos(diffAngle) - dy * Math.sin(diffAngle);
                    pt.y = cy + dx * Math.sin(diffAngle) + dy * Math.cos(diffAngle);
                    
                    const hDiv = container.children[i];
                    if (hDiv && hDiv.classList.contains('vertex-handle')) {
                        hDiv.style.left = (pt.x / baseW * 100) + '%';
                        hDiv.style.top = (pt.y / baseH * 100) + '%';
                    }
                });
                polygon.setAttribute('points', points.map(p => \`\${p.x},\${p.y}\`).join(' '));
                el.dataset.polygonPoints = JSON.stringify(points);
            } else if (shape) {
                let totalAngle = prevAngle + (diffAngle * 180 / Math.PI);
                shape.setAttribute('transform', \`rotate(\${totalAngle}, \${cx}, \${cy})\`);
                el.dataset.innerRotation = totalAngle;
            }
        }
        function onUp() {
            rotHandle.style.cursor = 'grab';
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onUp);
            if (polygon) {
                recalculateShapeBounds(el);
            }
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchmove', onMove, {passive: false});
        document.addEventListener('touchend', onUp);
    }
    rotHandle.addEventListener('mousedown', rotHandleDown);
    rotHandle.addEventListener('touchstart', rotHandleDown, {passive: false});
    container.appendChild(rotHandle);
    
    el.appendChild(container);
    el.dataset.hasHandles = 'true';
};
`;
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(file, content);
}
