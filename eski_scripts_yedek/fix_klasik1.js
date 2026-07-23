const fs = require('fs');
let txt = fs.readFileSync('tpl_klasik/klasik.js', 'utf8');
const lines = txt.split('\n');

const k1LineIndex = lines.findIndex(l => l.includes('canvaRenderLayer.innerHTML = `') && lines[l-1] && lines[l-1].includes('// Klasik 1') || lines.findIndex(l => l.includes('canvaK1\')')));

// Actually canvaK1 doesn't have an explicit ID check like that in the init array, 
// let's just find the first canvaRenderLayer in the file, which corresponds to Klasik 1.
const canvaLines = lines.reduce((acc, l, idx) => {
    if (l.includes('canvaRenderLayer.innerHTML = `')) acc.push(idx);
    return acc;
}, []);

const targetIndex = canvaLines[0];

const newHtml = `        canvaRenderLayer.innerHTML = \`<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#450a0a;font-family:Cinzel,serif;">
    <div class="photo-panel" style="width:\${scaleX(1600)}px;height:\${scaleY(700)}px;position:absolute;left:\${scaleX(160)}px;top:\${scaleY(160)}px;\${bgPos};border:8px double #fef3c7;"></div>
    
    <div style="position:absolute;top:\${scaleY(40)}px;width:100%;text-align:center;">
        <div style="font-size:\${scaleMin(101)}px;color:#fef3c7;font-weight:900;letter-spacing:10px;"><span class="editable-text" style="display:inline-block;min-width:50px;">\${title}</span></div>
    </div>
    
    <div style="position:absolute;bottom:\${scaleY(60)}px;left:\${scaleX(80)}px;text-align:left;font-size:\${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:2px;z-index:20;text-shadow:0 2px 5px rgba(0,0,0,0.8);">
        <span class="editable-text" style="display:inline-block;min-width:50px;">\${contact}</span>
    </div>
    
    <div style="position:absolute;bottom:\${scaleY(60)}px;left:0;width:100%;text-align:center;">
        <div style="font-size:\${scaleMin(70)}px;color:#fef3c7;font-weight:800;"><span class="editable-text" style="display:inline-block;min-width:50px;">\${price}</span></div>
    </div>
    
    <div style="position:absolute;bottom:\${scaleY(60)}px;right:\${scaleX(80)}px;text-align:right;display:flex;flex-direction:column;align-items:flex-end;">
        <div style="font-size:\${scaleMin(39)}px;color:#fff;font-family:Lora,serif;letter-spacing:2px;line-height:1.4;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">\${feats}</span></div>
    </div>
</div>\`;`;

lines[targetIndex] = newHtml.replace(/\n\s+/g, ''); // compact it

fs.writeFileSync('tpl_klasik/klasik.js', lines.join('\n'));
console.log('Fixed Klasik 1 Layout - Distributed elements left, center, and right.');
