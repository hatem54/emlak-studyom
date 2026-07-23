const fs = require('fs');
let txt = fs.readFileSync('tpl_kurumsal/kurumsal.js', 'utf8');
const lines = txt.split('\n');
const line91 = lines[91];

// Make adjustments to Kurumsal 1 (line 91)
let newHtml = line91;

// Left side: Reduce font sizes to fit within the frame
newHtml = newHtml.replace('font-size:${scaleMin(101)}px;color:#fff;font-weight:900;margin-bottom:${scaleY(20)}px;', 'font-size:${scaleMin(80)}px;color:#fff;font-weight:900;margin-bottom:${scaleY(10)}px;');
newHtml = newHtml.replace('font-size:${scaleMin(42)}px;color:#cbd5e1;font-family:Roboto,sans-serif;line-height:1.6;', 'font-size:${scaleMin(35)}px;color:#cbd5e1;font-family:Roboto,sans-serif;line-height:1.5;');

// Right side: Move price and brand closer to bottom
newHtml = newHtml.replace('font-size:${scaleMin(85)}px;color:#38bdf8;font-weight:900;margin-bottom:${scaleY(15)}px;', 'font-size:${scaleMin(85)}px;color:#38bdf8;font-weight:900;margin-bottom:${scaleY(15)}px;margin-top:${scaleY(40)}px;');

lines[91] = newHtml;
fs.writeFileSync('tpl_kurumsal/kurumsal.js', lines.join('\n'));
console.log('Fixed Kurumsal 1 layout adjustments.');
