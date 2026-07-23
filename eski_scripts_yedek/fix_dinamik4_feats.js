const fs = require('fs');
let txt = fs.readFileSync('tpl_dinamik/dinamik.js', 'utf8');
const lines = txt.split('\n');

const d4LineIndex = lines.findIndex(l => l.includes('canvaD4\')'));
let html = lines[d4LineIndex + 1];

// 1. Enlarge circle to 1000x1000 (largest that fits in 1080 without touching borders)
html = html.replace(/width:\$\{scaleX\(900\)\}px;height:\$\{scaleX\(900\)\}px;/, 'width:${scaleX(1000)}px;height:${scaleX(1000)}px;');

// 2. Remove feats from the main text block
const featsDiv = '<div style="font-size:${scaleMin(32)}px;color:#ccc;font-family:Nunito,sans-serif;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div>';
html = html.replace(featsDiv, '');

// 3. Add feats back as absolute positioned element at bottom left
const contactIndex = html.indexOf('<div style="position:absolute;bottom:${scaleY(20)}px;');
const absoluteFeats = `<div style="position:absolute;bottom:\${scaleY(80)}px;left:\${scaleX(80)}px;font-size:\${scaleMin(35)}px;color:#ccc;font-family:Nunito,sans-serif;z-index:20;line-height:1.6;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">\${feats}</span></div>`;

html = html.slice(0, contactIndex) + absoluteFeats + html.slice(contactIndex);

lines[d4LineIndex + 1] = html;

fs.writeFileSync('tpl_dinamik/dinamik.js', lines.join('\n'));
console.log('Fixed Dinamik 4 Layout - Enlarged frame and moved feats.');
