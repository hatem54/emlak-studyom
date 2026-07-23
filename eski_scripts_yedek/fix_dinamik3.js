const fs = require('fs');
let txt = fs.readFileSync('tpl_dinamik/dinamik.js', 'utf8');
const lines = txt.split('\n');

const d3LineIndex = lines.findIndex(l => l.includes('canvaD3\')'));
let html = lines[d3LineIndex + 1];

// 1. Increase the size of the purple triangle from 900x900 to 1200x1200
html = html.replace(/width:\$\{scaleX\(900\)\}px;height:\$\{scaleY\(900\)\}px;background:#4c1d95;/, 'width:${scaleX(1200)}px;height:${scaleY(1200)}px;background:#4c1d95;');

// 2. Increase the size of the yellow triangle from 800x800 to 1100x1100
html = html.replace(/width:\$\{scaleX\(800\)\}px;height:\$\{scaleY\(800\)\}px;background:#fbbf24;/, 'width:${scaleX(1100)}px;height:${scaleY(1100)}px;background:#fbbf24;');

// 3. Move the text container up slightly to ensure it stays in the fat part of the triangle
// top:100px -> top:50px
html = html.replace(/top:\$\{scaleY\(100\)\}px;width:\$\{scaleX\(500\)\}px;text-align:right;/, 'top:${scaleY(80)}px;width:${scaleX(550)}px;text-align:right;');

// 4. Center the text as requested? "çerçeve içine oratılayalım"
// It's currently right aligned (text-align:right). If the user means "center it within the frame", I can leave it right-aligned but the frame is bigger so it fits better, OR I can change text-align:center.
// Since the shape is a right triangle hugging the top-right corner, right-aligned looks like it's centered against the right edge. If I center it, it will look weird relative to the straight right edge. I will keep it right-aligned but just reduce margin-bottom so it's tighter.
html = html.replace(/margin-bottom:\$\{scaleY\(30\)\}px/g, 'margin-bottom:${scaleY(15)}px');

lines[d3LineIndex + 1] = html;

fs.writeFileSync('tpl_dinamik/dinamik.js', lines.join('\n'));
console.log('Fixed Dinamik 3 layout by increasing triangle size.');
