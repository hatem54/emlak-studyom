const fs = require('fs');
let txt = fs.readFileSync('tpl_kurumsal/kurumsal.js', 'utf8');
const lines = txt.split('\n');
let html = lines[94];

// The current contact div is at the end:
// <div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div>`;
const contactRegex = /<div style="position:absolute;bottom:\$\{scaleY\(20\)\}px;left:0;width:100%;text-align:center;font-size:\$\{scaleMin\(35\)\}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba\(0,0,0,0\.8\);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">\$\{contact\}<\/span><\/div>/;

// We will remove the old contact div
html = html.replace(contactRegex, '');

// The left container ends with:
// </span></div></div><div style="position:absolute;bottom:
// So the left container's closing tag is the first </div> after ${feats}
// Let's add the contact div inside the left container, at the bottom.
const featsEnd = '<span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div>';

const newContactHtml = '<div style="margin-top:auto;padding-top:${scaleY(40)}px;font-size:${scaleMin(30)}px;color:#cbd5e1;font-family:sans-serif;font-weight:800;letter-spacing:2px;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div>';

html = html.replace(featsEnd, featsEnd + newContactHtml);

lines[94] = html;
fs.writeFileSync('tpl_kurumsal/kurumsal.js', lines.join('\n'));
console.log('Fixed Kurumsal 2 contact position.');
