const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/modules/draw.js';
let content = fs.readFileSync(file, 'utf8');

const startIdx = content.indexOf("if (typeof allIcons !== 'undefined') {");
if (startIdx !== -1) {
    const nextPart = content.indexOf("allIcons.push(el);", startIdx);
    const endPart = content.indexOf("if (document.getElementById('iconCount'))", nextPart);
    const closeIconIf = content.indexOf("}", endPart);
    
    const endFunction = content.indexOf("currentPath=[];", closeIconIf);
    
    const newBlock = 
"        if (typeof drawPaths !== 'undefined') {\n" +
"            const hasEl = drawPaths.some(p => p.el === el);\n" +
"            if (!hasEl) {\n" +
"                drawPaths.push(Object.assign({}, pObj, {\n" +
"                    hasSaber: false,\n" +
"                    photoRef:  (typeof getActivePhotoPanel === 'function' ? (function(){\n" +
"                            const pnl = getActivePhotoPanel();\n" +
"                            const pl = typeof getActiveV4Element === 'function' ? getActiveV4Element() : null;\n" +
"                            if (pl && pl.dataset.zpReady === '1') {\n" +
"                                return { v4: true, z: parseFloat(pl.dataset.zpScale) || 1, px: parseFloat(pl.dataset.zpX) || 0, py: parseFloat(pl.dataset.zpY) || 0, panelW: pnl.w, panelH: pnl.h, panelL: pnl.left, panelT: pnl.top, sliderX: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), sliderY: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50) };\n" +
"                            } else {\n" +
"                                return { v4: false, z: parseInt(document.getElementById('photoZoomCtrl') ? document.getElementById('photoZoomCtrl').value : 100), px: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), py: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50), panelW: pnl.w, panelH: pnl.h, panelL: pnl.left, panelT: pnl.top };\n" +
"                            }\n" +
"                        })() : null),\n" +
"                    el: el\n" +
"                }));\n" +
"                if (typeof updateDrawHistory === 'function') updateDrawHistory();\n" +
"            }\n" +
"        }\n" +
"    }\n";
    
    content = content.substring(0, closeIconIf + 1) + "\n" + newBlock + "\n    " + content.substring(endFunction);
    fs.writeFileSync(file, content);
    console.log("Successfully replaced via manual search.");
}
