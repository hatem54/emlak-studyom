const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core.js';
let code = fs.readFileSync(file, 'utf8');

// Patch getSnapGuides
const targetStr1 = `    const baseW = (typeof uploadedImgW !== 'undefined' ? uploadedImgW : 1080);
    const baseH = (typeof uploadedImgH !== 'undefined' ? uploadedImgH : 1080);`;
const replaceStr1 = `    const drawCanvas = document.getElementById('draw-layer') || document.getElementById('drawCanvas');
    const rect = drawCanvas ? drawCanvas.getBoundingClientRect() : {width: 1080, height: 1080};
    const baseW = rect.width / (window.scaleFactor || 1);
    const baseH = rect.height / (window.scaleFactor || 1);`;

// Patch drawSnapGuides
const targetStr2 = `window.drawSnapGuides = function(guides) {
    const container = document.getElementById('photo-layer') || document.body;`;
const replaceStr2 = `window.drawSnapGuides = function(guides) {
    const container = document.getElementById('photo-layer') || document.body;
    const drawCanvas = document.getElementById('draw-layer') || document.getElementById('drawCanvas');
    const rect = drawCanvas ? drawCanvas.getBoundingClientRect() : {width: 1080, height: 1080};
    const logicW = rect.width / (window.scaleFactor || 1);
    const logicH = rect.height / (window.scaleFactor || 1);`;

// First replacement
const targetStr3 = `pt.style.left = (g.x / (typeof uploadedImgW !== 'undefined' ? uploadedImgW : 1080) * 100) + '%';
            pt.style.top = (g.y / (typeof uploadedImgH !== 'undefined' ? uploadedImgH : 1080) * 100) + '%';`;
const replaceStr3 = `pt.style.left = (g.x / logicW * 100) + '%';
            pt.style.top = (g.y / logicH * 100) + '%';`;

// Second replacement (v line)
const targetStr4 = `line.style.left = (g.x / (typeof uploadedImgW !== 'undefined' ? uploadedImgW : 1080) * 100) + '%';`;
const replaceStr4 = `line.style.left = (g.x / logicW * 100) + '%';`;

// Third replacement (h line)
const targetStr5 = `line.style.top = (g.y / (typeof uploadedImgH !== 'undefined' ? uploadedImgH : 1080) * 100) + '%';`;
const replaceStr5 = `line.style.top = (g.y / logicH * 100) + '%';`;


if (code.includes(targetStr1) && code.includes(targetStr2) && code.includes(targetStr3) && code.includes(targetStr4)) {
    code = code.replace(targetStr1, replaceStr1);
    code = code.replace(targetStr2, replaceStr2);
    code = code.replace(targetStr3, replaceStr3);
    code = code.replace(targetStr4, replaceStr4);
    code = code.replace(targetStr5, replaceStr5);
    fs.writeFileSync(file, code);
    console.log("Patched snap guides dynamic dimensions successfully!");
} else {
    console.log("Could not find some target strings in core.js.");
}
