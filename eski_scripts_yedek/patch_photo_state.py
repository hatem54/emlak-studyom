import os

core_file = r'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core.js'
drag_file = r'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core/drag.js'
draw_file = r'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/modules/draw.js'

helper_code = """
window.getCurrentPhotoState = function() {
    const pnl = typeof getActivePhotoPanel === 'function' ? getActivePhotoPanel() : null;
    const pl = typeof getActiveV4Element === 'function' ? getActiveV4Element() : null;
    const sx = parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50);
    const sy = parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50);
    if (pl && pl.dataset.zpReady === '1') {
        return {
            v4: true,
            z: parseFloat(pl.dataset.zpScale) || 1,
            px: parseFloat(pl.dataset.zpX) || 0,
            py: parseFloat(pl.dataset.zpY) || 0,
            panelW: pnl ? pnl.w : 1920,
            panelH: pnl ? pnl.h : 1080,
            panelL: pnl ? pnl.left : 0,
            panelT: pnl ? pnl.top : 0,
            sliderX: sx,
            sliderY: sy
        };
    } else {
        const pLayer = document.getElementById('photo-layer');
        return {
            v4: false,
            z: parseInt(document.getElementById('photoZoomCtrl') ? document.getElementById('photoZoomCtrl').value : 100),
            px: sx,
            py: sy,
            panelW: pnl ? pnl.w : 1920,
            panelH: pnl ? pnl.h : 1080,
            panelL: pnl ? pnl.left : 0,
            panelT: pnl ? pnl.top : 0,
            sliderX: sx,
            sliderY: sy,
            extraZ: (pLayer && pLayer.dataset.zpReady === '1') ? (parseFloat(pLayer.dataset.zpScale) || 1) : 1,
            extraPx: (pLayer && pLayer.dataset.zpReady === '1') ? (parseFloat(pLayer.dataset.zpX) || 0) : 0,
            extraPy: (pLayer && pLayer.dataset.zpReady === '1') ? (parseFloat(pLayer.dataset.zpY) || 0) : 0
        };
    }
};
"""

with open(core_file, 'r', encoding='utf-8') as f:
    core_code = f.read()

if 'window.getCurrentPhotoState' not in core_code:
    core_code = core_code.replace('const $=id=>document.getElementById(id);', 'const $=id=>document.getElementById(id);\n' + helper_code)
    with open(core_file, 'w', encoding='utf-8') as f:
        f.write(core_code)
    print('Added getCurrentPhotoState to core.js')

snap_start = core_code.find('let currObj = null;')
snap_end = core_code.find('if (window.drawPaths) {')
if snap_start > -1 and snap_end > -1:
    replaced_part = core_code[snap_start:snap_end]
    core_code = core_code.replace(replaced_part, 'let currObj = window.getCurrentPhotoState();\n\n    ')
    with open(core_file, 'w', encoding='utf-8') as f:
        f.write(core_code)
    print('Patched getSnapGuides in core.js')

with open(drag_file, 'r', encoding='utf-8') as f:
    drag_code = f.read()

drag_start = drag_code.find("if (typeof getActivePhotoPanel === 'function') {")
drag_end = drag_code.find('window.selectedElements.forEach(selEl => {')
if drag_start > -1 and drag_end > -1:
    replaced_part = drag_code[drag_start:drag_end]
    drag_code = drag_code.replace(replaced_part, 'currentRef = window.getCurrentPhotoState();\n                \n                ')
    with open(drag_file, 'w', encoding='utf-8') as f:
        f.write(drag_code)
    print('Patched drag.js up() currentRef')

with open(draw_file, 'r', encoding='utf-8') as f:
    draw_code = f.read()

draw_single_start = draw_code.find('const pl = getActiveV4Element();')
draw_single_end = draw_code.find('if(currObj.z !== p.photoRef.z ||')
if draw_single_start > -1 and draw_single_end > -1:
    replaced_part = draw_code[draw_single_start:draw_single_end]
    draw_code = draw_code.replace(replaced_part, 'let currObj = window.getCurrentPhotoState();\n        \n        ')

dend_start = draw_code.find("const z = parseInt(document.getElementById('photoZoomCtrl')")
dend_end = draw_code.find('let pObj = null;')
if dend_start > -1 and dend_end > -1:
    replaced_part = draw_code[dend_start:dend_end]
    draw_code = draw_code.replace(replaced_part, 'let photoRef = window.getCurrentPhotoState();\n    \n    ')

close_poly_start = draw_code.find("const z = parseInt(document.getElementById('photoZoomCtrl')")
close_poly_end = draw_code.find("const pObj = Object.assign({type:'polygon', closed:true, points:polygonPoints.slice(), showVertices: showV, photoRef: (function(){")
if close_poly_start > -1 and close_poly_end > -1:
    replaced_part = draw_code[close_poly_start:close_poly_end]
    draw_code = draw_code.replace(replaced_part, '')

import re
draw_code = re.sub(r'photoRef: \(function\(\)\{[\s\S]*?\}\)\(\)', 'photoRef: window.getCurrentPhotoState()', draw_code)
draw_code = re.sub(r"photoRef: \(typeof getActivePhotoPanel === 'function' \? \(function\(\)\{[\s\S]*?\}\)\(\) : null\)", 'photoRef: window.getCurrentPhotoState()', draw_code)

with open(draw_file, 'w', encoding='utf-8') as f:
    f.write(draw_code)

print('Patched draw.js')
