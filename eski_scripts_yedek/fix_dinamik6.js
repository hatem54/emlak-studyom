const fs = require('fs');
let txt = fs.readFileSync('tpl_dinamik/dinamik.js', 'utf8');
const lines = txt.split('\n');

const d6LineIndex = lines.findIndex(l => l.includes('canvaD6\')'));
let html = lines[d6LineIndex + 1];

// 1. Move contact to bottom-left
const oldContact = '<div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(40)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;">';
const newContact = '<div style="position:absolute;bottom:${scaleY(30)}px;left:${scaleX(50)}px;text-align:left;font-size:${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;">';
html = html.replace(oldContact, newContact);

// 2. Adjust clip-path to give more purple area on the bottom right
html = html.replace(/clip-path:polygon\(0 0, 100% 0, 50% 100%, 0% 100%\);/, 'clip-path:polygon(0 0, 100% 0, 20% 100%, 0% 100%);');

// 3. Adjust text container to be lower and align-right dynamically
const oldContainer = 'right:${scaleX(100)}px;bottom:${scaleY(150)}px;width:${scaleX(700)}px;text-align:right;';
const newContainer = 'right:${scaleX(50)}px;bottom:${scaleY(60)}px;max-width:${scaleX(800)}px;text-align:right;display:flex;flex-direction:column;align-items:flex-end;';
html = html.replace(oldContainer, newContainer);

// 4. Reduce margin-bottoms slightly inside the text container so it's more compact
html = html.replace(/margin-bottom:\$\{scaleY\(20\)\}px;/g, 'margin-bottom:${scaleY(15)}px;');
html = html.replace(/margin-bottom:\$\{scaleY\(30\)\}px;/g, 'margin-bottom:${scaleY(20)}px;');

lines[d6LineIndex + 1] = html;

fs.writeFileSync('tpl_dinamik/dinamik.js', lines.join('\n'));
console.log('Fixed Dinamik 6 Layout - Moved contact left and fitted text in frame.');
