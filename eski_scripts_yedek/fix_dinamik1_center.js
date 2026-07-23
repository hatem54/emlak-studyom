const fs = require('fs');
let txt = fs.readFileSync('tpl_dinamik/dinamik.js', 'utf8');
const lines = txt.split('\n');

const d1LineIndex = lines.findIndex(l => l.includes('canvaD1\')'));
let html = lines[d1LineIndex + 1];

const oldContact = '<div style="position:absolute;bottom:${scaleY(20)}px;left:${scaleX(80)}px;font-size:${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:1px;z-index:20;">';
const newContact = '<div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:1px;z-index:20;">';

html = html.replace(oldContact, newContact);

lines[d1LineIndex + 1] = html;

fs.writeFileSync('tpl_dinamik/dinamik.js', lines.join('\n'));
console.log('Centered contact info in Dinamik 1');
