const fs = require('fs');
let txt = fs.readFileSync('tpl_dinamik/dinamik.js', 'utf8');
const lines = txt.split('\n');

const d4LineIndex = lines.findIndex(l => l.includes('canvaD4\')'));
let html = lines[d4LineIndex + 1];

// 1. Adjust circle size and position
html = html.replace(/width:\$\{scaleX\(1000\)\}px;height:\$\{scaleX\(1000\)\}px;/, 'width:${scaleX(900)}px;height:${scaleX(900)}px;');
html = html.replace(/right:-\$\{scaleX\(100\)\}px;/, 'right:${scaleX(50)}px;');

// 2. Adjust text container position
const oldContainerStyles = 'left:${scaleX(100)}px;top:50%;transform:translateY(-50%);width:${scaleX(800)}px;';
const newContainerStyles = 'left:${scaleX(80)}px;top:38%;transform:translateY(-50%);width:${scaleX(850)}px;';
html = html.replace(oldContainerStyles, newContainerStyles);

lines[d4LineIndex + 1] = html;

fs.writeFileSync('tpl_dinamik/dinamik.js', lines.join('\n'));
console.log('Fixed Dinamik 4 Layout');
