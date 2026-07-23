const fs = require('fs');
let txt = fs.readFileSync('tpl_klasik/klasik.js', 'utf8');
const lines = txt.split('\n');

const canvaLines = lines.reduce((acc, l, idx) => {
    if (l.includes('canvaRenderLayer.innerHTML = `')) acc.push(idx);
    return acc;
}, []);

// Klasik 10 is index 9
const k10Idx = canvaLines[9];

let endIdx = k10Idx;
while(!lines[endIdx].includes('    }')) {
    endIdx++;
}

const newHtml = `        canvaRenderLayer.innerHTML = \`<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#2c1b18;font-family:Cinzel,serif;">
    <div class="photo-panel" style="width:\${scaleX(1600)}px;height:\${scaleY(650)}px;position:absolute;left:\${scaleX(160)}px;top:\${scaleY(100)}px;\${bgPos};border:10px solid #efece6;"></div>
    
    <div style="position:absolute;left:\${scaleX(160)}px;top:\${scaleY(790)}px;display:flex;align-items:center;gap:\${scaleX(40)}px;white-space:nowrap;">
        <div style="font-size:\${scaleMin(75)}px;color:#fef3c7;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">\${title}</span></div>
        <div style="font-size:\${scaleMin(70)}px;color:#fff;font-family:Lora,serif;"><span class="editable-text" style="display:inline-block;min-width:50px;">\${price}</span></div>
    </div>
    
    <div style="position:absolute;left:\${scaleX(160)}px;top:\${scaleY(920)}px;font-size:\${scaleMin(30)}px;color:#ccc;font-family:sans-serif;letter-spacing:2px;text-shadow:0 2px 5px rgba(0,0,0,0.8);">
        <span class="editable-text" style="display:inline-block;min-width:50px;">\${contact}</span>
    </div>
    
    <div style="position:absolute;right:\${scaleX(160)}px;top:\${scaleY(790)}px;text-align:right;display:flex;flex-direction:column;align-items:flex-end;">
        <div style="font-size:\${scaleMin(26)}px;color:#fff;font-family:Lora,serif;letter-spacing:1px;line-height:1.4;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">\${feats}</span></div>
    </div>
</div>\`;`;

lines.splice(k10Idx, endIdx - k10Idx);
lines.splice(k10Idx, 0, newHtml.replace(/\n\s+/g, ''));

fs.writeFileSync('tpl_klasik/klasik.js', lines.join('\n'));
console.log('Klasik 10 updated successfully without breaking Klasik 1.');
