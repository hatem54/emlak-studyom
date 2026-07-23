const fs = require('fs');
let txt = fs.readFileSync('tpl_kurumsal/kurumsal.js', 'utf8');
const lines = txt.split('\n');
let html = lines[106]; // Kurumsal 6

// 1. Remove the global contact div
const contactRegex = /<div style="position:absolute;bottom:\$\{scaleY\(20\)\}px;left:0;width:100%;text-align:center;font-size:\$\{scaleMin\(35\)\}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba\(0,0,0,0\.8\);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">\$\{contact\}<\/span><\/div>/;
html = html.replace(contactRegex, '');

// 2. Add contact to the left side
const priceEndRegex = /<div style="font-size:\$\{scaleMin\(57\)\}px;color:#38bdf8;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">\$\{price\}<\/span><\/div><\/div>/;
const newContactHtml = '<div style="font-size:${scaleMin(30)}px;color:#1e293b;font-family:sans-serif;font-weight:800;letter-spacing:1px;margin-top:${scaleY(15)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div>';

html = html.replace(priceEndRegex, '<div style="font-size:${scaleMin(57)}px;color:#38bdf8;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div>' + newContactHtml);

lines[106] = html;
fs.writeFileSync('tpl_kurumsal/kurumsal.js', lines.join('\n'));
console.log('Fixed Kurumsal 6 layout.');
