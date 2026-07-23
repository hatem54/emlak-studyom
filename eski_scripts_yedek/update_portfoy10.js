const fs = require('fs');
let txt = fs.readFileSync('tpl_portfoy/portfoy.js', 'utf8');
const canvaLines = txt.split('\n');

let sIdx = -1;
for(let i=0; i<canvaLines.length; i++) {
    if(canvaLines[i].includes("canvaRenderLayer.innerHTML = `") && canvaLines[i-1].includes("if (id === 'canvaP10') {")) {
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
    let newHtml = oldHtml.replace(/font-size:\$\{scaleMin\(45\)\}px;/, 'font-size:${scaleMin(65)}px;');
    newHtml = newHtml.replace(/font-size:\$\{scaleMin\(30\)\}px;/, 'font-size:${scaleMin(50)}px;');
    
    canvaLines.splice(sIdx, eIdx - sIdx, newHtml);
    fs.writeFileSync('tpl_portfoy/portfoy.js', canvaLines.join('\n'));
    console.log('Portfoy 10 updated successfully: title and price enlarged.');
} else {
    console.log('canvaP10 not found.');
}
