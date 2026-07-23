const fs = require('fs');
let txt = fs.readFileSync('tpl_portfoy/portfoy.js', 'utf8');
const canvaLines = txt.split('\n');

let sIdx = -1;
for(let i=0; i<canvaLines.length; i++) {
    if(canvaLines[i].includes("canvaRenderLayer.innerHTML = `") && canvaLines[i-1].includes("if (id === 'canvaP7') {")) {
        sIdx = i;
        break;
    }
}

if(sIdx !== -1) {
    let eIdx = sIdx;
    while(!canvaLines[eIdx].includes('    }')) {
        eIdx++;
    }
    
    let oldHtml = canvaLines.slice(sIdx, eIdx).join('\n');
    let newHtml = oldHtml.replace(/font-size:\$\{scaleMin\(45\)\}px;/, 'font-size:${scaleMin(60)}px;');
    newHtml = newHtml.replace(/font-size:\$\{scaleMin\(20\)\}px;/, 'font-size:${scaleMin(32)}px;');
    
    canvaLines.splice(sIdx, eIdx - sIdx, newHtml);
    fs.writeFileSync('tpl_portfoy/portfoy.js', canvaLines.join('\n'));
    console.log('Portfoy 7 updated successfully: price and feats enlarged.');
} else {
    console.log('canvaP7 not found.');
}
