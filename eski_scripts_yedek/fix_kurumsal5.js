const fs = require('fs');
let txt = fs.readFileSync('tpl_kurumsal/kurumsal.js', 'utf8');
const lines = txt.split('\n');
let html = lines[103];

// 1. Remove the global contact div:
const contactRegex = /<div style="position:absolute;bottom:\$\{scaleY\(20\)\}px;left:0;width:100%;text-align:center;font-size:\$\{scaleMin\(53\)\}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba\(0,0,0,0\.8\);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">\$\{contact\}<\/span><\/div>/;
html = html.replace(contactRegex, '');

// 2. Add the new contact div at the bottom left.
// We can just append it before the final closing </div>.
const newContactHtml = '<div style="position:absolute;bottom:${scaleY(40)}px;left:${scaleX(80)}px;font-size:${scaleMin(35)}px;color:#1e293b;font-family:sans-serif;font-weight:800;letter-spacing:1px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div>';

// Find the last </div>
const lastDivIndex = html.lastIndexOf('</div>');
html = html.substring(0, lastDivIndex) + newContactHtml + '</div>';

lines[103] = html;
fs.writeFileSync('tpl_kurumsal/kurumsal.js', lines.join('\n'));
console.log('Fixed Kurumsal 5 layout: Moved contact to bottom left.');
