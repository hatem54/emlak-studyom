const fs = require('fs');
let txt = fs.readFileSync('tpl_kurumsal/kurumsal.js', 'utf8');
const lines = txt.split('\n');
let html = lines[100];

// Remove the global contact div:
const contactRegex = /<div style="position:absolute;bottom:\$\{scaleY\(20\)\}px;left:0;width:100%;text-align:center;font-size:\$\{scaleMin\(53\)\}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba\(0,0,0,0\.8\);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">\$\{contact\}<\/span><\/div>/;
html = html.replace(contactRegex, '');

// The white box has the price:
// <div style="font-size:${scaleMin(76)}px;color:#38bdf8;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div>
const priceRegex = /<div style="font-size:\$\{scaleMin\(76\)\}px;color:#38bdf8;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">\$\{price\}<\/span><\/div>/;

// We will change the price to have text-align:right, and add the contact div with text-align:right under it.
const newPriceHtml = '<div style="font-size:${scaleMin(76)}px;color:#38bdf8;font-weight:900;text-align:right;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div>';
const newContactHtml = '<div style="font-size:${scaleMin(35)}px;color:#1e293b;font-family:sans-serif;font-weight:800;letter-spacing:1px;margin-top:${scaleY(20)}px;text-align:right;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div>';

html = html.replace(priceRegex, newPriceHtml + newContactHtml);

lines[100] = html;
fs.writeFileSync('tpl_kurumsal/kurumsal.js', lines.join('\n'));
console.log('Fixed Kurumsal 4 layout.');
