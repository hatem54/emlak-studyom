const fs = require('fs');
let txt = fs.readFileSync('tpl_dinamik/dinamik.js', 'utf8');
const lines = txt.split('\n');

const d10LineIndex = lines.findIndex(l => l.includes('canvaD10\')'));
let html = lines[d10LineIndex + 1];

// Change price color from #fbbf24 (yellow) to #4c1d95 (purple) and remove the heavy black text shadow
const oldPrice = 'color:#fbbf24;font-weight:900;text-shadow:0 4px 10px rgba(0,0,0,0.9);margin-top:${scaleY(20)}px;';
const newPrice = 'color:#4c1d95;font-weight:900;text-shadow:0 2px 5px rgba(255,255,255,0.5);margin-top:${scaleY(20)}px;';

html = html.replace(oldPrice, newPrice);

lines[d10LineIndex + 1] = html;

fs.writeFileSync('tpl_dinamik/dinamik.js', lines.join('\n'));
console.log('Fixed Dinamik 10 Layout - Changed price color to purple.');
