const fs = require('fs');
let txt = fs.readFileSync('tpl_kurumsal/kurumsal.js', 'utf8');
const lines = txt.split('\n');

const k8LineIndex = lines.findIndex(l => l.includes('canvaK8'));
let html = lines[k8LineIndex + 1];

// 1. Remove global contact
const contactRegex = /<div style="position:absolute;bottom:\$\{scaleY\(20\)\}px;left:0;width:100%;text-align:center;font-size:\$\{scaleMin\(53\)\}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba\(0,0,0,0\.8\);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">\$\{contact\}<\/span><\/div>/;
html = html.replace(contactRegex, '');

// 2. Add new contact at bottom right inside the frame
// `right:100px` aligns it with the right edge of the photo.
// `bottom:80px` puts it 20px above the bottom frame line (since frame is 60px from bottom).
const newContactHtml = '<div style="position:absolute;bottom:${scaleY(80)}px;right:${scaleX(100)}px;font-size:${scaleMin(35)}px;color:#1e293b;font-family:sans-serif;font-weight:800;letter-spacing:1px;z-index:20;text-align:right;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div>';

// Find the last </div>
const lastDivIndex = html.lastIndexOf('</div>');
html = html.substring(0, lastDivIndex) + newContactHtml + '</div>';

lines[k8LineIndex + 1] = html;
fs.writeFileSync('tpl_kurumsal/kurumsal.js', lines.join('\n'));
console.log('Fixed Kurumsal 8 layout.');
