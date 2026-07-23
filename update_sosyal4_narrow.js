const fs = require('fs');
let txt = fs.readFileSync('tpl_sosyal/sosyal.js', 'utf8');
const lines = txt.split('\n');

const canvaLines = lines.reduce((acc, l, idx) => {
    if (l.includes('canvaRenderLayer.innerHTML = `')) acc.push(idx);
    return acc;
}, []);

const s4Idx = canvaLines[3]; // canvaS4 is index 3

let endIdx = s4Idx;
while(!lines[endIdx].includes('    }')) {
    endIdx++;
}

let oldHtml = lines.slice(s4Idx, endIdx).join('\n');

// 1. Shrink white panel width
oldHtml = oldHtml.replace(
    /width:\$\{scaleX\(1050\)\}px;height:100%;background:#ffffff/g,
    'width:${scaleX(880)}px;height:100%;background:#ffffff'
);

// 2. Shift text container left and reduce its width
oldHtml = oldHtml.replace(
    /left:\$\{scaleX\(120\)\}px;top:\$\{scaleY\(180\)\}px;width:\$\{scaleX\(800\)\}px;/g,
    'left:${scaleX(80)}px;top:${scaleY(180)}px;width:${scaleX(750)}px;'
);

// 3. Shift contact left to align
oldHtml = oldHtml.replace(
    /left:\$\{scaleX\(172\)\}px;font-size:\$\{scaleMin\(30\)\}px;color:#888;/g,
    'left:${scaleX(132)}px;font-size:${scaleMin(30)}px;color:#888;'
);

lines.splice(s4Idx, endIdx - s4Idx);
lines.splice(s4Idx, 0, oldHtml);

fs.writeFileSync('tpl_sosyal/sosyal.js', lines.join('\n'));
console.log('Sosyal 4 layout adjusted: white panel narrowed and shifted left to reveal more photo.');
