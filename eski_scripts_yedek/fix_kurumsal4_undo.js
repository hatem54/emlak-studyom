const fs = require('fs');
let txt = fs.readFileSync('tpl_kurumsal/kurumsal.js', 'utf8');
const lines = txt.split('\n');
let html = lines[100];

// 1. Restore the white box
const wrongTopHtml = '<div style="font-size:${scaleMin(76)}px;color:#38bdf8;font-weight:900;text-align:right;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(35)}px;color:#1e293b;font-family:sans-serif;font-weight:800;letter-spacing:1px;margin-top:${scaleY(20)}px;text-align:right;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div>';
const correctTopHtml = '<div style="font-size:${scaleMin(76)}px;color:#38bdf8;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div>';
html = html.replace(wrongTopHtml, correctTopHtml);

// 2. Add contact to the dark box
const darkBoxEnd = '</span></div></div></div>';
const contactDiv = '<div style="position:absolute;bottom:${scaleY(40)}px;right:${scaleX(80)}px;font-size:${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:1px;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div>';
const newDarkBoxEnd = '</span></div>' + contactDiv + '</div></div>';
html = html.replace(darkBoxEnd, newDarkBoxEnd);

lines[100] = html;
fs.writeFileSync('tpl_kurumsal/kurumsal.js', lines.join('\n'));
console.log('Fixed Kurumsal 4: contact moved to bottom right box.');
