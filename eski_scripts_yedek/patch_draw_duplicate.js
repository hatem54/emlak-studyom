const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/modules/draw.js';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `    } else {
        if (p.hasSaber && p.saberRef && window.SaberEngine && SaberEngine.setSaberTransform) {
            SaberEngine.setSaberTransform(p.saberRef, 1, 0, 0);
        }
    }
    
    drawCtx.globalAlpha = p.opacity;`;

const newStr = `    } else {
        if (p.hasSaber && p.saberRef && window.SaberEngine && SaberEngine.setSaberTransform) {
            SaberEngine.setSaberTransform(p.saberRef, 1, 0, 0);
        }
    }

    // DO NOT DRAW ON CANVAS IF WE HAVE AN INTERACTIVE SVG ELEMENT!
    // This prevents the duplicate "ghost" line from appearing when dragging or clicking.
    if (p.el) {
        drawCtx.restore();
        return;
    }
    
    drawCtx.globalAlpha = p.opacity;`;

content = content.replace(targetStr, newStr);
fs.writeFileSync(file, content);
