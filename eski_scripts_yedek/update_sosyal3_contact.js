const fs = require('fs');
let txt = fs.readFileSync('tpl_sosyal/sosyal.js', 'utf8');
const lines = txt.split('\n');

const canvaLines = lines.reduce((acc, l, idx) => {
    if (l.includes('canvaRenderLayer.innerHTML = `')) acc.push(idx);
    return acc;
}, []);

const s3Idx = canvaLines[2]; // canvaS3 is index 2

let endIdx = s3Idx;
while(!lines[endIdx].includes('    }')) {
    endIdx++;
}

let oldHtml = lines.slice(s3Idx, endIdx).join('\n');

// Replace contact div in Sosyal 3
// <div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;">
let newHtml = oldHtml.replace(
    /bottom:\$\{scaleY\(20\)\}px;left:0;width:100%;text-align:center;font-size:\$\{scaleMin\(35\)\}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba\(0,0,0,0\.8\);letter-spacing:2px;/g,
    'bottom:${scaleY(15)}px;right:${scaleX(60)}px;text-align:right;font-size:${scaleMin(26)}px;color:#888888;font-family:sans-serif;font-weight:700;letter-spacing:1px;'
);

lines.splice(s3Idx, endIdx - s3Idx);
lines.splice(s3Idx, 0, newHtml);

fs.writeFileSync('tpl_sosyal/sosyal.js', lines.join('\n'));
console.log('Sosyal 3 layout adjusted: brand moved to bottom right gap.');
