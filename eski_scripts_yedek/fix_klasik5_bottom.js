const fs = require('fs');
let txt = fs.readFileSync('tpl_klasik/klasik.js', 'utf8');
const lines = txt.split('\n');

const canvaLines = lines.reduce((acc, l, idx) => {
    if (l.includes('canvaRenderLayer.innerHTML = `')) acc.push(idx);
    return acc;
}, []);

const k5Idx = canvaLines[4];
if (lines[k5Idx]) {
    // Both features and contact are at bottom: ${scaleY(60)}px. 
    // We will change them to bottom: ${scaleY(40)}px.
    lines[k5Idx] = lines[k5Idx].replace(/bottom:\$\{scaleY\(60\)\}px;/g, 'bottom:${scaleY(40)}px;');
    fs.writeFileSync('tpl_klasik/klasik.js', lines.join('\n'));
    console.log('Moved features and brand down in Klasik 5.');
}
