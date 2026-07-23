const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/modules/draw.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /if\s*\(typeof\s+drawPaths\s*!==\s*'undefined'\)\s*\{\s*drawPaths\.push\([\s\S]*?\/\/\s*setDrawMode\('off'\);\s*removed\s*for\s*continuous\s*drawing/g;

const replacement = `if (typeof drawPaths !== 'undefined') {
            const hasEl = drawPaths.some(p => p.el === el);
            if (!hasEl) {
                drawPaths.push(Object.assign({}, pObj, {
                    hasSaber: false,
                    photoRef:  (typeof getActivePhotoPanel === 'function' ? (function(){
                            const pnl = getActivePhotoPanel();
                            const pl = typeof getActiveV4Element === 'function' ? getActiveV4Element() : null;
                            if (pl && pl.dataset.zpReady === '1') {
                                return { v4: true, z: parseFloat(pl.dataset.zpScale) || 1, px: parseFloat(pl.dataset.zpX) || 0, py: parseFloat(pl.dataset.zpY) || 0, panelW: pnl.w, panelH: pnl.h, panelL: pnl.left, panelT: pnl.top, sliderX: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), sliderY: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50) };
                            } else {
                                return { v4: false, z: parseInt(document.getElementById('photoZoomCtrl') ? document.getElementById('photoZoomCtrl').value : 100), px: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), py: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50), panelW: pnl.w, panelH: pnl.h, panelL: pnl.left, panelT: pnl.top };
                            }
                        })() : null),
                    el: el
                }));
                if (typeof updateDrawHistory === 'function') updateDrawHistory();
            }
        }
            // Optionally, switch draw mode to off so they can interact with the element
            // setDrawMode('off'); removed for continuous drawing`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
    console.log("Successfully replaced block using regex!");
} else {
    console.log("Could not find regex match.");
}
