const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core.js';
let code = fs.readFileSync(file, 'utf8');

// Patch getSnapGuides
const targetStr1 = `    const baseW = window.baseW || 1080;
    const baseH = window.baseH || 1080;`;
const replaceStr1 = `    const baseW = (typeof uploadedImgW !== 'undefined' ? uploadedImgW : 1080);
    const baseH = (typeof uploadedImgH !== 'undefined' ? uploadedImgH : 1080);`;

// Patch drawSnapGuides
// First replacement
const targetStr2 = `pt.style.left = (g.x / (window.baseW || 1080) * 100) + '%';
            pt.style.top = (g.y / (window.baseH || 1080) * 100) + '%';`;
const replaceStr2 = `pt.style.left = (g.x / (typeof uploadedImgW !== 'undefined' ? uploadedImgW : 1080) * 100) + '%';
            pt.style.top = (g.y / (typeof uploadedImgH !== 'undefined' ? uploadedImgH : 1080) * 100) + '%';`;

// Second replacement (v line)
const targetStr3 = `line.style.left = (g.x / (window.baseW || 1080) * 100) + '%';`;
const replaceStr3 = `line.style.left = (g.x / (typeof uploadedImgW !== 'undefined' ? uploadedImgW : 1080) * 100) + '%';`;

// Third replacement (h line)
const targetStr4 = `line.style.top = (g.y / (window.baseH || 1080) * 100) + '%';`;
const replaceStr4 = `line.style.top = (g.y / (typeof uploadedImgH !== 'undefined' ? uploadedImgH : 1080) * 100) + '%';`;


if (code.includes(targetStr1) && code.includes(targetStr2) && code.includes(targetStr3) && code.includes(targetStr4)) {
    code = code.replace(targetStr1, replaceStr1);
    code = code.replace(targetStr2, replaceStr2);
    code = code.replace(targetStr3, replaceStr3);
    code = code.replace(targetStr4, replaceStr4);
    fs.writeFileSync(file, code);
    console.log("Patched snap guides dimensions successfully!");
} else {
    console.log("Could not find some target strings in core.js.");
}
