import os
import re

draw_file = r'C:\Users\Hatemi\Desktop\emlak düzenlemeleri için uygulama\emlak-studiom v7-0\modules\draw.js'

with open(draw_file, 'r', encoding='utf-8') as f:
    draw_code = f.read()

# Vertex handles touch support (in redrawPaths)
# We look for handle.addEventListener('mousedown'
# and replace it with a unified event listener function
vertex_mouse_pattern = r"handle\.addEventListener\('mousedown', \(e\) => \{[\s\S]*?document\.addEventListener\('mouseup', onUp\);\n                \}\);"

new_vertex_events = """function handleDown(e) {
                    if (e.type === 'mousedown') { e.preventDefault(); e.stopPropagation(); }
                    const evt = e.touches ? e.touches[0] : e;
                    const startX = evt.clientX;
                    const startY = evt.clientY;
                    const startPtX = pt.x;
                    const startPtY = pt.y;
                    
                    const rect = el.getBoundingClientRect();
                    const sFactor = window.scaleFactor || 1;
                    const scaleX = (rect.width / sFactor) / baseW;
                    const scaleY = (rect.height / sFactor) / baseH;
                    
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
                        pt.x = newX;
                        pt.y = newY;
                        handle.style.left = (pt.x / baseW * 100) + '%';
                        handle.style.top = (pt.y / baseH * 100) + '%';
                        polygon.setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' '));
                    }
                    
                    function onUp() {
                        if(window.clearSnapGuides) window.clearSnapGuides();
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                        document.removeEventListener('touchmove', onMove);
                        document.removeEventListener('touchend', onUp);
                    }
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                    document.addEventListener('touchmove', onMove, {passive: false});
                    document.addEventListener('touchend', onUp);
                }
                handle.addEventListener('mousedown', handleDown);
                handle.addEventListener('touchstart', handleDown, {passive: false});"""

draw_code = re.sub(vertex_mouse_pattern, new_vertex_events, draw_code)

# Same for rotHandle
rot_mouse_pattern = r"rotHandle\.addEventListener\('mousedown', \(e\) => \{[\s\S]*?document\.addEventListener\('mouseup', onUp\);\n    \}\);"

new_rot_events = """function rotHandleDown(e) {
        if (e.type === 'mousedown') { e.preventDefault(); e.stopPropagation(); }
        const evt = e.touches ? e.touches[0] : e;
        rotHandle.style.cursor = 'grabbing';
        
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let startAngle = Math.atan2(evt.clientY - centerY, evt.clientX - centerX);
        let prevAngle = el.dataset.innerRotation ? parseFloat(el.dataset.innerRotation) : 0;
        
        // For polygon, save initial points
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
                polygon.setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' '));
                el.dataset.polygonPoints = JSON.stringify(points);
            } else if (shape) {
                let totalAngle = prevAngle + (diffAngle * 180 / Math.PI);
                shape.setAttribute('transform', `rotate(${totalAngle}, ${cx}, ${cy})`);
                el.dataset.innerRotation = totalAngle;
            }
        }
        function onUp() {
            rotHandle.style.cursor = 'grab';
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onUp);
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchmove', onMove, {passive: false});
        document.addEventListener('touchend', onUp);
    }
    rotHandle.addEventListener('mousedown', rotHandleDown);
    rotHandle.addEventListener('touchstart', rotHandleDown, {passive: false});"""

draw_code = re.sub(rot_mouse_pattern, new_rot_events, draw_code)

with open(draw_file, 'w', encoding='utf-8') as f:
    f.write(draw_code)
print('Patched touch support for vertex and rotation handles in draw.js')
