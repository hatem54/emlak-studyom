const fs = require('fs');
let txt = fs.readFileSync('tpl_dinamik/dinamik.js', 'utf8');
const lines = txt.split('\n');

const d4LineIndex = lines.findIndex(l => l.includes('canvaD4\')'));
let html = lines[d4LineIndex + 1];

// 1. Move title and price higher (top:38% -> top:28%)
html = html.replace(/top:38%;transform:translateY\(-50%\);/, 'top:28%;transform:translateY(-50%);');

// 2. Reduce font size of contact (scaleMin(40) -> scaleMin(28))
// and maybe pull it up slightly from bottom:20px to bottom:25px
html = html.replace(/font-size:\$\{scaleMin\(40\)\}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba\(0,0,0,0\.8\);letter-spacing:2px;z-index:20;/, 'font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;');

lines[d4LineIndex + 1] = html;

fs.writeFileSync('tpl_dinamik/dinamik.js', lines.join('\n'));
console.log('Fixed Dinamik 4 Layout - Moved title up and reduced contact font size.');
