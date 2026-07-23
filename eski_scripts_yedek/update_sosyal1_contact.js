const fs = require('fs');
let txt = fs.readFileSync('tpl_sosyal/sosyal.js', 'utf8');
const lines = txt.split('\n');

const canvaLines = lines.reduce((acc, l, idx) => {
    if (l.includes('canvaRenderLayer.innerHTML = `')) acc.push(idx);
    return acc;
}, []);

// S1 is index 0
const s1Idx = canvaLines[0];

let endIdx = s1Idx;
while(!lines[endIdx].includes('    }')) {
    endIdx++;
}

let oldHtml = lines.slice(s1Idx, endIdx).join('\n');

// Replace the contact div
// <div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(53)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div>
// WITH
// <div style="position:absolute;bottom:${scaleY(60)}px;left:${scaleX(150)}px;text-align:left;font-size:${scaleMin(30)}px;color:#be185d;font-family:sans-serif;font-weight:800;letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div>

let newHtml = oldHtml.replace(
    /<div style="position:absolute;bottom:\$\{scaleY\(20\)\}px;left:0;width:100%;text-align:center;font-size:\$\{scaleMin\(53\)\}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba\(0,0,0,0\.8\);letter-spacing:2px;z-index:20;">/g,
    '<div style="position:absolute;bottom:${scaleY(60)}px;left:${scaleX(150)}px;text-align:left;font-size:${scaleMin(30)}px;color:#be185d;font-family:sans-serif;font-weight:800;letter-spacing:1px;z-index:20;">'
);

lines.splice(s1Idx, endIdx - s1Idx);
lines.splice(s1Idx, 0, newHtml);

fs.writeFileSync('tpl_sosyal/sosyal.js', lines.join('\n'));
console.log('Sosyal 1 contact moved to the left and restyled.');
