const fs = require('fs');
let luks = fs.readFileSync('tpl_luks/luks.js', 'utf8');
const match = luks.match(/const variations = (\[[\s\S]*?\]);/);
let vars = JSON.parse(match[1]);
let html = vars[1].html;

// Reduce header spacing
html = html.replace('margin-bottom:${scaleY(30)}px;border-bottom:2px solid rgba(212, 175, 55, 0.3);padding-bottom:${scaleY(20)}px;', 'margin-bottom:${scaleY(15)}px;border-bottom:2px solid rgba(212, 175, 55, 0.3);padding-bottom:${scaleY(15)}px;');

// Add margin bottom to frames
html = html.replace('<div style="display:flex;gap:${scaleX(40)}px;">', '<div style="display:flex;gap:${scaleX(40)}px;margin-bottom:${scaleY(30)}px;">');

vars[1].html = html;
const newArr = JSON.stringify(vars);
luks = luks.substring(0, match.index) + 'const variations = ' + newArr + ';' + luks.substring(match.index + match[0].length);
fs.writeFileSync('tpl_luks/luks.js', luks);
console.log('Applied new frame lift properly.');
