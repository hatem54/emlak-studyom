const fs = require('fs');
let txt = fs.readFileSync('tpl_sosyal/sosyal.js', 'utf8');
const lines = txt.split('\n');

const canvaLines = lines.reduce((acc, l, idx) => {
    if (l.includes('canvaRenderLayer.innerHTML = `')) acc.push(idx);
    return acc;
}, []);

// S2 is index 1
const s2Idx = canvaLines[1];

let endIdx = s2Idx;
while(!lines[endIdx].includes('    }')) {
    endIdx++;
}

let oldHtml = lines.slice(s2Idx, endIdx).join('\n');

// 1. Move Title and Features to top
// <div style="position:absolute;bottom:${scaleY(80)}px;left:${scaleX(80)}px;width:${scaleX(1000)}px;">
let newHtml = oldHtml.replace(
    /position:absolute;bottom:\$\{scaleY\(80\)\}px;left:\$\{scaleX\(80\)\}px;width:\$\{scaleX\(1000\)\}px;/g,
    'position:absolute;top:${scaleY(80)}px;left:${scaleX(80)}px;width:${scaleX(1000)}px;text-shadow:0 4px 15px rgba(0,0,0,0.8);'
);

// 2. Move Brand to bottom left and reduce font size
// <div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(53)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;">
newHtml = newHtml.replace(
    /<div style="position:absolute;bottom:\$\{scaleY\(20\)\}px;left:0;width:100%;text-align:center;font-size:\$\{scaleMin\(53\)\}px;/g,
    '<div style="position:absolute;bottom:${scaleY(80)}px;left:${scaleX(80)}px;text-align:left;font-size:${scaleMin(35)}px;'
);

lines.splice(s2Idx, endIdx - s2Idx);
lines.splice(s2Idx, 0, newHtml);

fs.writeFileSync('tpl_sosyal/sosyal.js', lines.join('\n'));
console.log('Sosyal 2 layout adjusted: title and features on top, brand on bottom left.');
