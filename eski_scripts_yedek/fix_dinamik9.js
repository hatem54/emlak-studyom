const fs = require('fs');
let txt = fs.readFileSync('tpl_dinamik/dinamik.js', 'utf8');
const lines = txt.split('\n');

const d9LineIndex = lines.findIndex(l => l.includes('canvaD9\')'));
let html = lines[d9LineIndex + 1];

const oldContact = '<div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(40)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;">';
const newContact = '<div style="position:absolute;bottom:${scaleY(40)}px;left:${scaleX(100)}px;text-align:left;font-size:${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:2px;z-index:20;">';
html = html.replace(oldContact, newContact);

lines[d9LineIndex + 1] = html;

fs.writeFileSync('tpl_dinamik/dinamik.js', lines.join('\n'));
console.log('Fixed Dinamik 9 Layout - Moved contact to left inside the purple frame.');
