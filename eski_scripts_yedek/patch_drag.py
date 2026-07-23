import os

drag_file = r'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core/drag.js'

with open(drag_file, 'r', encoding='utf-8') as f:
    drag_code = f.read()

# Find the specific block in up()
search_block = """                if (typeof getActivePhotoPanel === 'function') {
                    const pnl = getActivePhotoPanel();
                    const pl = typeof getActiveV4Element === 'function' ? getActiveV4Element() : null;
                    if (pl && pl.dataset.zpReady === '1') {
                        currentRef = { v4: true, z: parseFloat(pl.dataset.zpScale) || 1, px: parseFloat(pl.dataset.zpX) || 0, py: parseFloat(pl.dataset.zpY) || 0, panelW: pnl.w, panelH: pnl.h, panelL: pnl.left, panelT: pnl.top, sliderX: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), sliderY: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50) };
                    } else {
                        currentRef = { v4: false, z: parseInt(document.getElementById('photoZoomCtrl') ? document.getElementById('photoZoomCtrl').value : 100), px: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), py: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50), panelW: pnl.w, panelH: pnl.h, panelL: pnl.left, panelT: pnl.top };
                    }
                }"""

replacement = "                currentRef = window.getCurrentPhotoState();"

if search_block in drag_code:
    drag_code = drag_code.replace(search_block, replacement)
    with open(drag_file, 'w', encoding='utf-8') as f:
        f.write(drag_code)
    print("Patched drag.js successfully")
else:
    print("Could not find the target block in drag.js")
