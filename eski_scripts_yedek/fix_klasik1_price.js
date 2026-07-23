const fs = require('fs');
let txt = fs.readFileSync('tpl_klasik/klasik.js', 'utf8');
const lines = txt.split('\n');

const idx = 91; 
if (lines[idx]) {
    lines[idx] = lines[idx].replace(
        /<div style="position:absolute;bottom:\$\{scaleY\(40\)\}px;left:0;width:100%;text-align:center;"><div style="font-size:\$\{scaleMin\(70\)\}px;/,
        '<div style="position:absolute;bottom:${scaleY(120)}px;left:0;width:100%;text-align:center;"><div style="font-size:${scaleMin(70)}px;'
    );
    fs.writeFileSync('tpl_klasik/klasik.js', lines.join('\n'));
    console.log('Fixed price position for Klasik 1.');
}
