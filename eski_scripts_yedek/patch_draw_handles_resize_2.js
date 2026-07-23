const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/modules/draw.js';
let content = fs.readFileSync(file, 'utf8');

const start = content.indexOf('window.showVertexHandles = function');
const end = content.indexOf('window.hideVertexHandles = function');

const newCode = `window.showVertexHandles = function(el) {
    if (!el || el.dataset.hasHandles === 'true') return;
    const svg = el.querySelector('svg');
    if (!svg) return;
    const polygon = svg.querySelector('polygon');
    const lineEl = svg.querySelector('line');
    let shape = svg.querySelector('ellipse, path, line, polyline, rect');
    if(!shape && polygon) shape = polygon;
    
    // YENİ EKLENEN FONKSİYON: Şeklin (özellikle çokgenin) sınırlarını yeniden hesapla
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
        
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        pts.forEach(pt => {
            if (pt.x < minX) minX = pt.x;
            if (pt.y < minY) minY = pt.y;
            if (pt.x > maxX) maxX = pt.x;
            if (pt.y > maxY) maxY = pt.y;
        });
        
        const newW = (maxX - minX) + padding;
        const newH = (maxY - minY) + padding;
        const newL = minX - padding/2;
        const newT = minY - padding/2;
        
        svg.setAttribute('width', newW);
        svg.setAttribute('height', newH);
        svg.style.width = newW + 'px';
        svg.style.height = newH + 'px';
        svg.setAttribute('viewBox', \`0 0 \${newW} \${newH}\`);
        
        el.style.width = newW + 'px';
        el.style.height = newH + 'px';
        el.style.left = newL + 'px';
        el.style.top = newT + 'px';
        el.dataset.baseLeft = newL;
        el.dataset.baseTop = newT;
        el.dataset.baseWidth = newW;
        el.dataset.baseHeight = newH;
        
        const cx = newW / 2;
        const cy = newH / 2;
        
        if (polygon) {
            const newPts = pts.map(pt => ({
                x: pt.x - newL,
                y: pt.y - newT
            }));
            polygon.setAttribute('points', newPts.map(p => \`\${p.x},\${p.y}\`).join(' '));
            if(pObj) pObj.points = newPts;
            
            // Eğer varsa transform'u merkeze göre güncelle
            const r = parseFloat(el.dataset.innerRotation || 0);
            if (r) {
                polygon.setAttribute('transform', \`rotate(\${r}, \${cx}, \${cy})\`);
            }
            
            // Handle'ların pozisyonlarını yeni boyuta göre güncelle
            const container = el.querySelector('.vertex-handles-container');
            if (container) {
                newPts.forEach((pt, i) => {
                    const hDiv = container.children[i];
                    if (hDiv && hDiv.classList.contains('vertex-handle')) {
                        hDiv.style.left = (pt.x / newW * 100) + '%'
                        hDiv.style.top = (pt.y / newH * 100) + '%'
                    }
                });
            }
        } else if (lineEl) {
            const newX1 = pts[0].x - newL;
            const newY1 = pts[0].y - newT;
            const newX2 = pts[1].x - newL;
            const newY2 = pts[1].y - newT;
            lineEl.setAttribute('x1', newX1);
            lineEl.setAttribute('y1', newY1);
            lineEl.setAttribute('x2', newX2);
            lineEl.setAttribute('y2', newY2);
            if(pObj) { pObj.x1 = newX1; pObj.y1 = newY1; pObj.x2 = newX2; pObj.y2 = newY2; }
            
            const r = parseFloat(el.dataset.innerRotation || 0);
            if (r) {
                lineEl.setAttribute('transform', \`rotate(\${r}, \${cx}, \${cy})\`);
            }
            
            const container = el.querySelector('.vertex-handles-container');
            if (container) {
                const h1 = container.children[0];
                const h2 = container.children[1];
                if (h1) {
                    h1.style.left = (newX1 / newW * 100) + '%';
                    h1.style.top = (newY1 / newH * 100) + '%';
                }
                if (h2) {
                    h2.style.left = (newX2 / newW * 100) + '%';
                    h2.style.top = (newY2 / newH * 100) + '%';
                }
            }
        }
        
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
    }
    
    let baseW = parseFloat(el.dataset.baseWidth) || el.offsetWidth;
    let baseH = parseFloat(el.dataset.baseHeight) || el.offsetHeight;
    let points = [];
    
    if (polygon) {
        if (el.dataset.polygonPoints) {
            points = JSON.parse(el.dataset.polygonPoints);
        } else {
            const ptsStr = polygon.getAttribute('points');
            if (ptsStr) {
                points = ptsStr.split(' ').map(p => {
                    const [x,y] = p.split(',').map(Number);
                    return {x,y};
                });
                el.dataset.polygonPoints = JSON.stringify(points);
            }
        }
    } else if (lineEl) {
        points = [
            {x: parseFloat(lineEl.getAttribute('x1')), y: parseFloat(lineEl.getAttribute('y1'))},
            {x: parseFloat(lineEl.getAttribute('x2')), y: parseFloat(lineEl.getAttribute('y2'))}
        ];
    }
    
    if (points.length === 0) return;
    
    const container = document.createElement('div');
    container.className = 'vertex-handles-container';
    container.style.position = 'absolute';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none'; 
    container.style.zIndex = '9999';
    
    if (lineEl) {
        const h1 = createHandle(points[0], (nx, ny) => {
            lineEl.setAttribute('x1', nx);
            lineEl.setAttribute('y1', ny);
            let pObj = null;
            if (typeof drawPaths !== 'undefined') pObj = drawPaths.find(p => p.el === el);
            if (pObj) { pObj.x1 = nx; pObj.y1 = ny; }
        }, baseW, baseH);
        
        const h2 = createHandle(points[1], (nx, ny) => {
            lineEl.setAttribute('x2', nx);
            lineEl.setAttribute('y2', ny);
            let pObj = null;
            if (typeof drawPaths !== 'undefined') pObj = drawPaths.find(p => p.el === el);
            if (pObj) { pObj.x2 = nx; pObj.y2 = ny; }
        }, baseW, baseH);
        
        container.appendChild(h1);
        container.appendChild(h2);
    } else if (polygon) {
        points.forEach((pt, i) => {
            const handle = createHandle(pt, (nx, ny) => {
                points[i] = {x: nx, y: ny};
                polygon.setAttribute('points', points.map(p => \`\${p.x},\${p.y}\`).join(' '));
                el.dataset.polygonPoints = JSON.stringify(points);
                let pObj = null;
                if (typeof drawPaths !== 'undefined') pObj = drawPaths.find(p => p.el === el);
                if (pObj) pObj.points = points;
            }, baseW, baseH);
            container.appendChild(handle);
        });
    }

    function createHandle(pt, onUpdate, bW, bH) {
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
\n\n`;

content = content.substring(0, start) + newCode + content.substring(end);
fs.writeFileSync(file, content);
console.log("Replaced showVertexHandles successfully!");
