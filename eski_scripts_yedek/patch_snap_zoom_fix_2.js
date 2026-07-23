const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core.js';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `        } else if (panel) {
            currObj.panelW = panel.w;
            currObj.panelH = panel.h;
            currObj.panelL = 0;
            currObj.panelT = 0;
        }`;

const replaceStr = `        } else if (panel) {
            currObj.panelW = panel.w;
            currObj.panelH = panel.h;
            currObj.panelL = panel.left || 0;
            currObj.panelT = panel.top || 0;
        }`;

// Let's also check the v4 section in core.js getSnapGuides just in case it hardcoded 0.
const targetStrV4 = `                panelW: panel ? panel.w : 1920,
                panelH: panel ? panel.h : 1080,
                panelL: 0,
                panelT: 0
            };`;

const replaceStrV4 = `                panelW: panel ? panel.w : 1920,
                panelH: panel ? panel.h : 1080,
                panelL: panel ? panel.left : 0,
                panelT: panel ? panel.top : 0
            };`;


let patched = false;
if (code.includes(targetStr)) {
    code = code.replace(targetStr, replaceStr);
    patched = true;
}
if (code.includes(targetStrV4)) {
    code = code.replace(targetStrV4, replaceStrV4);
    patched = true;
}

if (patched) {
    fs.writeFileSync(file, code);
    console.log("Patched snap guides panel left/top successfully!");
} else {
    console.log("Could not find target strings.");
}
