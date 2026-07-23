const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/modules/draw.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /SaberEngine\.setSaberTransform\(p\.saberRef,\s*1,\s*0,\s*0\);\s*\}\s*\}\s*drawCtx\.globalAlpha = p\.opacity;/g;
const replacement = `SaberEngine.setSaberTransform(p.saberRef, 1, 0, 0);
        }
    }

    if (p.el) {
        drawCtx.restore();
        return;
    }
    
    drawCtx.globalAlpha = p.opacity;`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
    console.log("Successfully patched duplicate ghost drawing!");
} else {
    console.log("Could not find regex match for duplicate patch.");
}
