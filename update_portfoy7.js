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
    
    let newHtml = `        canvaRenderLayer.innerHTML = \`<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#fff;font-family:Raleway,sans-serif;"><div class="photo-panel" style="width:100%;height:\$\{scaleY(540)\}px;position:absolute;left:0;top:0;\$\{bgPos\}"></div><div style="position:absolute;left:0;top:\$\{scaleY(540)\}px;width:50%;height:\$\{scaleY(540)\}px;background:#166534;padding:\$\{scaleY(80)\}px;box-sizing:border-box;"><div style="font-size:\$\{scaleMin(65)\}px;color:#fff;font-weight:800;line-height:1.2;"><span class="editable-text" style="display:inline-block;min-width:50px;">\$\{title\}</span></div></div><div style="position:absolute;right:0;top:\$\{scaleY(540)\}px;width:50%;height:\$\{scaleY(540)\}px;background:#f8f9fa;padding:\$\{scaleY(80)\}px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;"><div style="font-size:\$\{scaleMin(45)\}px;color:#166534;font-weight:700;margin-bottom:\$\{scaleY(30)\}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">\$\{price\}</span></div><div style="font-size:\$\{scaleMin(20)\}px;color:#444;font-family:Roboto,sans-serif;line-height:1.8;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">\$\{feats\}</span></div></div><div style="position:absolute;bottom:\$\{scaleY(30)\}px;left:\$\{scaleX(80)\}px;text-align:left;font-size:\$\{scaleMin(26)\}px;color:#ffffff;font-family:sans-serif;font-weight:700;letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">\$\{contact\}</span></div></div>\`;`;

    canvaLines.splice(sIdx, eIdx - sIdx, newHtml);
    fs.writeFileSync('tpl_portfoy/portfoy.js', canvaLines.join('\n'));
    console.log('Portfoy 7 updated successfully: brand moved to left.');
} else {
    console.log('canvaP7 not found.');
}
