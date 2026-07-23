const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core.js';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `        if (pl && pl.dataset.zpReady === '1') {
            currObj = {
                v4: true,
                z: parseFloat(pl.dataset.zpScale) || 1,
                px: parseFloat(pl.dataset.zpX) || 0,
                py: parseFloat(pl.dataset.zpY) || 0,
                sliderX: parseFloat(pl.dataset.zpSliderX) || 50,
                sliderY: parseFloat(pl.dataset.zpSliderY) || 50,
                panelW: panel ? panel.offsetWidth : 1920,
                panelH: panel ? panel.offsetHeight : 1080,
                panelL: 0,
                panelT: 0
            };
        } else if (panel) {
            currObj.panelW = panel.offsetWidth;
            currObj.panelH = panel.offsetHeight;
            currObj.panelL = 0;
            currObj.panelT = 0;
            currObj.extraZ = parseFloat(panel.dataset.extraZ) || 1;
            currObj.extraPx = parseFloat(panel.dataset.extraPx) || 0;
            currObj.extraPy = parseFloat(panel.dataset.extraPy) || 0;
        }`;

const replaceStr = `        if (pl && pl.dataset.zpReady === '1') {
            currObj = {
                v4: true,
                z: parseFloat(pl.dataset.zpScale) || 1,
                px: parseFloat(pl.dataset.zpX) || 0,
                py: parseFloat(pl.dataset.zpY) || 0,
                sliderX: parseFloat(pl.dataset.zpSliderX) || 50,
                sliderY: parseFloat(pl.dataset.zpSliderY) || 50,
                panelW: panel ? panel.w : 1920,
                panelH: panel ? panel.h : 1080,
                panelL: 0,
                panelT: 0
            };
        } else if (panel) {
            currObj.panelW = panel.w;
            currObj.panelH = panel.h;
            currObj.panelL = 0;
            currObj.panelT = 0;
        }`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replaceStr);
    fs.writeFileSync(file, code);
    console.log("Patched snap guides panel properties successfully!");
} else {
    console.log("Could not find target string in core.js for panel properties.");
}
