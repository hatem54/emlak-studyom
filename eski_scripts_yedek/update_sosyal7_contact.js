const fs = require('fs');
let txt = fs.readFileSync('tpl_sosyal/sosyal.js', 'utf8');
const lines = txt.split('\n');

const canvaLines = lines.reduce((acc, l, idx) => {
    if (l.includes('canvaRenderLayer.innerHTML = `')) acc.push(idx);
    return acc;
}, []);

const s7Idx = canvaLines[6]; // canvaS7 is index 6

let endIdx = s7Idx;
while(!lines[endIdx].includes('    }')) {
    endIdx++;
}

let oldHtml = lines.slice(s7Idx, endIdx).join('\n');

// Update the contact div
// from: <div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(53)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;">
// to: <div style="position:absolute;bottom:${scaleY(30)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(30)}px;color:#be185d;font-family:sans-serif;font-weight:800;letter-spacing:2px;z-index:20;">
let newHtml = oldHtml.replace(
    /bottom:\$\{scaleY\(20\)\}px;left:0;width:100%;text-align:center;font-size:\$\{scaleMin\(53\)\}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba\(0,0,0,0\.8\);letter-spacing:2px;z-index:20;/g,
    'bottom:${scaleY(30)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(30)}px;color:#be185d;font-family:sans-serif;font-weight:800;letter-spacing:2px;z-index:20;'
);

lines.splice(s7Idx, endIdx - s7Idx);
lines.splice(s7Idx, 0, newHtml);

fs.writeFileSync('tpl_sosyal/sosyal.js', lines.join('\n'));
console.log('Sosyal 7 layout adjusted: brand shrunk, colored pink, centered at bottom.');
