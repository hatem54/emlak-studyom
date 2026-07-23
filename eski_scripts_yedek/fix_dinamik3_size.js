const fs = require('fs');
let txt = fs.readFileSync('tpl_dinamik/dinamik.js', 'utf8');
const lines = txt.split('\n');

const d3LineIndex = lines.findIndex(l => l.includes('canvaD3\')'));
let html = lines[d3LineIndex + 1];

// 1. Revert triangle size to 950 and 850
html = html.replace(/width:\$\{scaleX\(1200\)\}px;height:\$\{scaleY\(1200\)\}px;background:#4c1d95;/, 'width:${scaleX(950)}px;height:${scaleY(950)}px;background:#4c1d95;');
html = html.replace(/width:\$\{scaleX\(1100\)\}px;height:\$\{scaleY\(1100\)\}px;background:#fbbf24;/, 'width:${scaleX(850)}px;height:${scaleY(850)}px;background:#fbbf24;');

// 2. Adjust text container
const oldContainer = 'right:${scaleX(50)}px;top:${scaleY(80)}px;width:${scaleX(550)}px;text-align:right;';
const newContainer = 'right:${scaleX(40)}px;top:${scaleY(40)}px;max-width:${scaleX(650)}px;text-align:right;display:flex;flex-direction:column;align-items:flex-end;';
html = html.replace(oldContainer, newContainer);

// 3. Keep margin-bottom at 15px

lines[d3LineIndex + 1] = html;

fs.writeFileSync('tpl_dinamik/dinamik.js', lines.join('\n'));
console.log('Fixed Dinamik 3 layout by reverting triangle size and adjusting container.');
