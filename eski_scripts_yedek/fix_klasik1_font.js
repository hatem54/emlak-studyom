const fs = require('fs');
let txt = fs.readFileSync('tpl_klasik/klasik.js', 'utf8');
const lines = txt.split('\n');

const canvaLines = lines.reduce((acc, l, idx) => {
    if (l.includes('canvaRenderLayer.innerHTML = `')) acc.push(idx);
    return acc;
}, []);

// Klasik 1 is index 0
const k1Idx = canvaLines[0];
if (lines[k1Idx]) {
    // Change features font size from 30 to 24 and line-height from 1.4 to 1.3
    lines[k1Idx] = lines[k1Idx].replace(
        /font-size:\$\{scaleMin\(30\)\}px;color:#fff;font-family:Lora,serif;letter-spacing:2px;line-height:1.4;/, 
        'font-size:${scaleMin(24)}px;color:#fff;font-family:Lora,serif;letter-spacing:1px;line-height:1.3;'
    );
    // Change brand font size from 30 to 24
    lines[k1Idx] = lines[k1Idx].replace(
        /text-align:left;font-size:\$\{scaleMin\(30\)\}px;color:#ffffff;/, 
        'text-align:left;font-size:${scaleMin(24)}px;color:#ffffff;'
    );
    fs.writeFileSync('tpl_klasik/klasik.js', lines.join('\n'));
    console.log('Reduced font size for features and brand in Klasik 1 to 24px.');
}
