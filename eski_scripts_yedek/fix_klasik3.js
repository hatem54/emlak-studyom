const fs = require('fs');
let txt = fs.readFileSync('tpl_klasik/klasik.js', 'utf8');
const lines = txt.split('\n');

const canvaLines = lines.reduce((acc, l, idx) => {
    if (l.includes('canvaRenderLayer.innerHTML = `')) acc.push(idx);
    return acc;
}, []);

// Klasik 3
const k3Idx = canvaLines[2];
if (lines[k3Idx]) {
    lines[k3Idx] = lines[k3Idx].replace(/font-size:\$\{scaleMin\(35\)\}px;(.*?\$\{contact\})/, 'font-size:${scaleMin(26)}px;$1');
}

// Klasik 8
const k8Idx = canvaLines[7];
if (lines[k8Idx]) {
    lines[k8Idx] = lines[k8Idx].replace(/font-size:\$\{scaleMin\(35\)\}px;(.*?\$\{contact\})/, 'font-size:${scaleMin(26)}px;$1');
}

// And maybe for Klasik 10, which is also on the left... actually Klasik 10 text was at right. Wait, Klasik 10 has no text side-pane.

fs.writeFileSync('tpl_klasik/klasik.js', lines.join('\n'));
console.log('Fixed Klasik 3 and Klasik 8 contact font size.');
