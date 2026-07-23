const fs = require('fs');
let txt = fs.readFileSync('tpl_klasik/klasik.js', 'utf8');
const lines = txt.split('\n');

const canvaLines = lines.reduce((acc, l, idx) => {
    if (l.includes('canvaRenderLayer.innerHTML = `')) acc.push(idx);
    return acc;
}, []);

// Klasik 7 is index 6
const k7Idx = canvaLines[6];
if (lines[k7Idx]) {
    lines[k7Idx] = lines[k7Idx].replace(
        /bottom:\$\{scaleY\(60\)\}px;right:\$\{scaleX\(80\)\}px;text-align:right;font-size:\$\{scaleMin\(35\)\}px;/, 
        'bottom:${scaleY(60)}px;left:${scaleX(80)}px;text-align:left;font-size:${scaleMin(30)}px;'
    );
    fs.writeFileSync('tpl_klasik/klasik.js', lines.join('\n'));
    console.log('Moved contact info to the left in Klasik 7.');
}
