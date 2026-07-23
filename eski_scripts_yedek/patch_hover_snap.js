const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/modules/draw.js';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `let isSnapping = isDrawing || (drawMode === 'polygon' && polygonBuilding);
    if(drawMode !== 'free' && typeof window.getSnapGuides === 'function' && isSnapping) {
        const snapResult = window.getSnapGuides(p.x, p.y, null, true);
        p.x = snapResult.x;
        p.y = snapResult.y;
        if(typeof window.drawSnapGuides === 'function') window.drawSnapGuides(snapResult.guides);
    }`;

const replacementStr = `if(drawMode !== 'free' && typeof window.getSnapGuides === 'function') {
        const snapResult = window.getSnapGuides(p.x, p.y, null, true);
        // Only modify p if we are actually drawing, otherwise just show the guide
        if (isDrawing || (drawMode === 'polygon' && polygonBuilding)) {
            p.x = snapResult.x;
            p.y = snapResult.y;
        }
        if(typeof window.drawSnapGuides === 'function') window.drawSnapGuides(snapResult.guides);
    }`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacementStr);
    fs.writeFileSync(file, code);
    console.log("Patched dMove for hover previews successfully!");
} else {
    console.log("Could not find target string.");
}
