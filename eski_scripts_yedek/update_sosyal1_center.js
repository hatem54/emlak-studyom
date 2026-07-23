const fs = require('fs');
let txt = fs.readFileSync('tpl_sosyal/sosyal.js', 'utf8');
const lines = txt.split('\n');

const canvaLines = lines.reduce((acc, l, idx) => {
    if (l.includes('canvaRenderLayer.innerHTML = `')) acc.push(idx);
    return acc;
}, []);

const s1Idx = canvaLines[0];

let endIdx = s1Idx;
while(!lines[endIdx].includes('    }')) {
    endIdx++;
}

let oldHtml = lines.slice(s1Idx, endIdx).join('\n');

// 1. Center the white box
// <div style="position:absolute;bottom:${scaleY(50)}px;right:${scaleX(150)}px;background:#fff;padding:${scaleY(30)}px ${scaleX(60)}px;border-radius:40px;box-shadow:0 20px 50px rgba(0,0,0,0.1);display:flex;align-items:center;gap:${scaleX(40)}px;">
let newHtml = oldHtml.replace(
    /right:\$\{scaleX\(150\)\}px;background:#fff;padding:\$\{scaleY\(30\)\}px \$\{scaleX\(60\)\}px;/g,
    'left:50%;transform:translateX(-50%);background:#fff;padding:${scaleY(20)}px ${scaleX(50)}px;'
);
// I also slightly reduced the padding from 30x60 to 20x50 to make the box less wide, giving more room for the brand.

// 2. Make Brand smaller and constrain width so it wraps nicely
// <div style="position:absolute;bottom:${scaleY(60)}px;left:${scaleX(150)}px;text-align:left;font-size:${scaleMin(30)}px;color:#be185d;font-family:sans-serif;font-weight:800;letter-spacing:1px;z-index:20;width:${scaleX(400)}px;line-height:1.3;word-wrap:break-word;">
newHtml = newHtml.replace(
    /bottom:\$\{scaleY\(60\)\}px;left:\$\{scaleX\(150\)\}px;text-align:left;font-size:\$\{scaleMin\(30\)\}px;color:#be185d;font-family:sans-serif;font-weight:800;letter-spacing:1px;z-index:20;width:\$\{scaleX\(400\)\}px;line-height:1\.3;word-wrap:break-word;/g,
    'bottom:${scaleY(50)}px;left:${scaleX(150)}px;text-align:left;font-size:${scaleMin(22)}px;color:#be185d;font-family:sans-serif;font-weight:800;letter-spacing:1px;z-index:20;width:${scaleX(220)}px;line-height:1.4;word-wrap:break-word;'
);

lines.splice(s1Idx, endIdx - s1Idx);
lines.splice(s1Idx, 0, newHtml);

fs.writeFileSync('tpl_sosyal/sosyal.js', lines.join('\n'));
console.log('Sosyal 1 layout updated: white box centered, brand smaller on bottom left.');
