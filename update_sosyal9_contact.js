const fs = require('fs');
let txt = fs.readFileSync('tpl_sosyal/sosyal.js', 'utf8');
const lines = txt.split('\n');

const canvaLines = lines.reduce((acc, l, idx) => {
    if (l.includes('canvaRenderLayer.innerHTML = `')) acc.push(idx);
    return acc;
}, []);

const s9Idx = canvaLines[8]; // canvaS9 is index 8

let endIdx = s9Idx;
while(!lines[endIdx].includes('    }')) {
    endIdx++;
}

let oldHtml = lines.slice(s9Idx, endIdx).join('\n');

// Replace contact div in Sosyal 9
let newHtml = oldHtml.replace(
    /bottom:\$\{scaleY\(20\)\}px;left:0;width:100%;text-align:center;font-size:\$\{scaleMin\(53\)\}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba\(0,0,0,0\.8\);letter-spacing:2px;z-index:20;/g,
    'bottom:${scaleY(25)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(26)}px;color:#be185d;font-family:sans-serif;font-weight:800;letter-spacing:2px;z-index:20;'
);

lines.splice(s9Idx, endIdx - s9Idx);
lines.splice(s9Idx, 0, newHtml);

fs.writeFileSync('tpl_sosyal/sosyal.js', lines.join('\n'));
console.log('Sosyal 9 layout adjusted: brand shrunk, colored pink, centered at bottom.');
