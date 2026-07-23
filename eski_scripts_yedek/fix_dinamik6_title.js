const fs = require('fs');
let txt = fs.readFileSync('tpl_dinamik/dinamik.js', 'utf8');
const lines = txt.split('\n');

const d6LineIndex = lines.findIndex(l => l.includes('canvaD6\')'));
let html = lines[d6LineIndex + 1];

// Reduce title font size from 73 to 60
html = html.replace(/font-size:\$\{scaleMin\(73\)\}px;color:#fbbf24;font-weight:900;font-style:italic;line-height:1;/, 'font-size:${scaleMin(60)}px;color:#fbbf24;font-weight:900;font-style:italic;line-height:1;');

lines[d6LineIndex + 1] = html;

fs.writeFileSync('tpl_dinamik/dinamik.js', lines.join('\n'));
console.log('Fixed Dinamik 6 Layout - Reduced title font size.');
