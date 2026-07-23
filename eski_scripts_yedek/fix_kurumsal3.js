const fs = require('fs');
let txt = fs.readFileSync('tpl_kurumsal/kurumsal.js', 'utf8');
const lines = txt.split('\n');
let html = lines[97];

// Remove the global contact div:
const contactRegex = /<div style="position:absolute;bottom:\$\{scaleY\(20\)\}px;left:0;width:100%;text-align:center;font-size:\$\{scaleMin\(53\)\}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba\(0,0,0,0\.8\);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">\$\{contact\}<\/span><\/div>/;
html = html.replace(contactRegex, '');

// The left column ends with the price div:
// <div style="font-size:${scaleMin(62)}px;color:#38bdf8;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div>
const priceEnd = '<div style="font-size:${scaleMin(62)}px;color:#38bdf8;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div>';
const newContactHtml = '<div style="font-size:${scaleMin(35)}px;color:#1e293b;font-family:sans-serif;font-weight:800;letter-spacing:1px;margin-top:${scaleY(20)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div>';
html = html.replace(priceEnd, priceEnd + newContactHtml);

// Move features more to the right:
// Change padding from `padding:${scaleY(50)}px ${scaleX(80)}px;` to `padding:${scaleY(50)}px ${scaleX(40)}px ${scaleY(50)}px ${scaleX(80)}px;`
html = html.replace('padding:${scaleY(50)}px ${scaleX(80)}px;', 'padding:${scaleY(50)}px ${scaleX(40)}px ${scaleY(50)}px ${scaleX(80)}px;');
// Also reduce width of features slightly to pull it closer to the right edge
html = html.replace('width:${scaleX(500)}px;', 'width:${scaleX(450)}px;');

lines[97] = html;
fs.writeFileSync('tpl_kurumsal/kurumsal.js', lines.join('\n'));
console.log('Fixed Kurumsal 3 layout.');
