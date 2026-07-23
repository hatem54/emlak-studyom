const fs = require('fs');
let txt = fs.readFileSync('tpl_klasik/klasik.js', 'utf8');
const lines = txt.split('\n');

const canvaLines = lines.reduce((acc, l, idx) => {
    if (l.includes('canvaRenderLayer.innerHTML = `')) acc.push(idx);
    return acc;
}, []);

const k1Idx = canvaLines[0];

let endIdx = k1Idx;
while(!lines[endIdx].includes('    }')) {
    endIdx++;
}

// Change the price div from:
// <div style="position:absolute;bottom:${scaleY(240)}px;width:100%;text-align:center;z-index:10;">
// to:
// <div style="position:absolute;bottom:${scaleY(140)}px;width:100%;text-align:center;z-index:10;">
// This puts it OUTSIDE the photo frame, in the maroon background, just below the photo.

let oldBlock = lines.slice(k1Idx, endIdx).join('\n');
let newBlock = oldBlock.replace('bottom:${scaleY(240)}px', 'bottom:${scaleY(140)}px');

lines.splice(k1Idx, endIdx - k1Idx);
lines.splice(k1Idx, 0, newBlock);

fs.writeFileSync('tpl_klasik/klasik.js', lines.join('\n'));
console.log('Klasik 1 price moved to the maroon area below the photo frame.');
