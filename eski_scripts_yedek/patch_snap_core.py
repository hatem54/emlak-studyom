import re
import os

drag_file = r'C:\Users\Hatemi\Desktop\emlak düzenlemeleri için uygulama\emlak-studiom v7-0\core\drag.js'
draw_file = r'C:\Users\Hatemi\Desktop\emlak düzenlemeleri için uygulama\emlak-studiom v7-0\modules\draw.js'

with open(drag_file, 'r', encoding='utf-8') as f:
    drag_code = f.read()

# Patch move() in drag.js
move_target = """        } else {
            const deltaX = (c.clientX - sx) / scaleFactor;
            const deltaY = (c.clientY - sy) / scaleFactor;
            
            el.style.left = (il + deltaX) + 'px';
            el.style.top = (it + deltaY) + 'px';"""
move_replacement = """        } else {
            const deltaX = (c.clientX - sx) / scaleFactor;
            const deltaY = (c.clientY - sy) / scaleFactor;
            
            let newL = il + deltaX;
            let newT = it + deltaY;
            
            if (window.getSnapGuides && !multiSelectKey && !resizing) {
                // Determine logic dimensions based on parent container scale if v4
                const rect = el.getBoundingClientRect();
                const snap = window.getSnapGuides(newL + (el.offsetWidth)/2, newT + (el.offsetHeight)/2, el, false);
                newL = snap.x - (el.offsetWidth)/2;
                newT = snap.y - (el.offsetHeight)/2;
                if (window.drawSnapGuides) window.drawSnapGuides(snap.guides);
            }

            el.style.left = newL + 'px';
            el.style.top = newT + 'px';"""

if move_target in drag_code:
    drag_code = drag_code.replace(move_target, move_replacement)
    print("Patched drag.js move()")
else:
    print("Could not find move() target in drag.js")


up_target = """    function up(){
        if(!dragging && !resizing)return;"""
up_replacement = """    function up(){
        if (window.clearSnapGuides) window.clearSnapGuides();
        if(!dragging && !resizing)return;"""
if up_target in drag_code:
    drag_code = drag_code.replace(up_target, up_replacement)
    print("Patched drag.js up()")

with open(drag_file, 'w', encoding='utf-8') as f:
    f.write(drag_code)

# Now patch draw.js
with open(draw_file, 'r', encoding='utf-8') as f:
    draw_code = f.read()

dstart_target = """function dStart(e){
    if(drawMode==='off')return;
    e.preventDefault();
    e.stopPropagation();
    const p=canvasXY(e.touches?e.touches[0]:e);"""
dstart_replacement = """function dStart(e){
    if(drawMode==='off')return;
    e.preventDefault();
    e.stopPropagation();
    let p=canvasXY(e.touches?e.touches[0]:e);
    if(window.clearSnapGuides) window.clearSnapGuides();
    if(window.getSnapGuides && (drawMode==='line' || drawMode==='arrow' || drawMode==='polygon' || drawMode==='free')) {
        const snap = window.getSnapGuides(p.x, p.y, null, true);
        p.x = snap.x;
        p.y = snap.y;
    }"""
if dstart_target in draw_code:
    draw_code = draw_code.replace(dstart_target, dstart_replacement)
    print("Patched draw.js dStart()")

dmove_target = """function dMove(e){
    if(drawMode==='off')return;
    e.preventDefault();
    e.stopPropagation();
    const p=canvasXY(e.touches?e.touches[0]:e);"""
dmove_replacement = """function dMove(e){
    if(drawMode==='off')return;
    e.preventDefault();
    e.stopPropagation();
    let p=canvasXY(e.touches?e.touches[0]:e);
    if(window.getSnapGuides && (drawMode==='line' || drawMode==='arrow' || drawMode==='polygon' || drawMode==='free' || drawMode==='rect' || drawMode==='circle')) {
        const snap = window.getSnapGuides(p.x, p.y, null, true);
        p.x = snap.x;
        p.y = snap.y;
        if(window.drawSnapGuides) window.drawSnapGuides(snap.guides);
    }"""
if dmove_target in draw_code:
    draw_code = draw_code.replace(dmove_target, dmove_replacement)
    print("Patched draw.js dMove()")

dend_target = """function dEnd(e){
    if(drawMode==='off'||drawMode==='polygon')return;
    if(!isDrawing)return;
    isDrawing=false;
    const s=getDS();
    let ep;
    if(e.changedTouches)ep=canvasXY(e.changedTouches[0]);
    else if(e.clientX!==undefined)ep=canvasXY(e);
    else ep={x:drawStartX,y:drawStartY};"""
dend_replacement = """function dEnd(e){
    if(window.clearSnapGuides) window.clearSnapGuides();
    if(drawMode==='off'||drawMode==='polygon')return;
    if(!isDrawing)return;
    isDrawing=false;
    const s=getDS();
    let ep;
    if(e.changedTouches)ep=canvasXY(e.changedTouches[0]);
    else if(e.clientX!==undefined)ep=canvasXY(e);
    else ep={x:drawStartX,y:drawStartY};
    
    if(window.getSnapGuides) {
        const snap = window.getSnapGuides(ep.x, ep.y, null, true);
        ep.x = snap.x;
        ep.y = snap.y;
    }"""
if dend_target in draw_code:
    draw_code = draw_code.replace(dend_target, dend_replacement)
    print("Patched draw.js dEnd()")

close_target = """function closePolygon(){
    if(polygonPoints.length<3)return;
    removeTempPolygonSaber();"""
close_replacement = """function closePolygon(){
    if(polygonPoints.length<3)return;
    if(window.clearSnapGuides) window.clearSnapGuides();
    removeTempPolygonSaber();"""
if close_target in draw_code:
    draw_code = draw_code.replace(close_target, close_replacement)
    print("Patched draw.js closePolygon()")

vertex_target = """                    function onMove(me) {
                        const dx = (me.clientX - startX) / sFactor / scaleX;
                        const dy = (me.clientY - startY) / sFactor / scaleY;
                        pt.x = startPtX + dx;
                        pt.y = startPtY + dy;
                        handle.style.left = (pt.x / baseW * 100) + '%';
                        handle.style.top = (pt.y / baseH * 100) + '%';
                        polygon.setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' '));
                    }
                    
                    function onUp() {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    }"""
vertex_replacement = """                    function onMove(me) {
                        const dx = (me.clientX - startX) / sFactor / scaleX;
                        const dy = (me.clientY - startY) / sFactor / scaleY;
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
                    }"""
if vertex_target in draw_code:
    draw_code = draw_code.replace(vertex_target, vertex_replacement)
    print("Patched draw.js vertex drag")
else:
    print("Could not find vertex drag in draw.js")


with open(draw_file, 'w', encoding='utf-8') as f:
    f.write(draw_code)
