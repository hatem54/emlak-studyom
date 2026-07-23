const fs = require('fs');
let txt = fs.readFileSync('tpl_klasik/klasik.js', 'utf8');
const lines = txt.split('\n');

// 1. Change defaultFeats
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('let defaultFeats =')) {
        lines[i] = '    let defaultFeats = "• 140 m² Brüt\\n• 3+1 Geniş Oda\\n• Sıfır Yaşında\\n• 5. Kat\\n• Doğalgaz Kombi";';
        break;
    }
}

// 2. Rewrite canvaC10
const canvaLines = lines.reduce((acc, l, idx) => {
    if (l.includes('canvaRenderLayer.innerHTML = `')) acc.push(idx);
    return acc;
}, []);

const k10Idx = canvaLines[9];
let endIdx = k10Idx;
while(!lines[endIdx].includes('    }')) {
    endIdx++;
}

const newHtml = `        canvaRenderLayer.innerHTML = \`<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#2c1b18;font-family:Cinzel,serif;">
    <div class="photo-panel" style="width:\${scaleX(1600)}px;height:\${scaleY(650)}px;position:absolute;left:\${scaleX(160)}px;top:\${scaleY(100)}px;\${bgPos};border:10px solid #efece6;"></div>
    
    <div style="position:absolute;left:\${scaleX(160)}px;bottom:\${scaleY(160)}px;white-space:nowrap;">
        <div style="font-size:\${scaleMin(65)}px;color:#fef3c7;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">\${title}</span></div>
    </div>
    
    <div style="position:absolute;left:0;width:100%;bottom:\${scaleY(120)}px;text-align:center;">
        <div style="font-size:\${scaleMin(70)}px;color:#fff;font-family:Lora,serif;font-weight:800;text-shadow:0 3px 10px rgba(0,0,0,0.8);"><span class="editable-text" style="display:inline-block;min-width:50px;">\${price}</span></div>
    </div>
    
    <div style="position:absolute;left:\${scaleX(160)}px;bottom:\${scaleY(60)}px;font-size:\${scaleMin(28)}px;color:#ccc;font-family:sans-serif;letter-spacing:2px;text-shadow:0 2px 5px rgba(0,0,0,0.8);">
        <span class="editable-text" style="display:inline-block;min-width:50px;">\${contact}</span>
    </div>
    
    <div style="position:absolute;right:\${scaleX(160)}px;bottom:\${scaleY(60)}px;text-align:right;display:flex;flex-direction:column;align-items:flex-end;">
        <div style="font-size:\${scaleMin(26)}px;color:#fff;font-family:Lora,serif;letter-spacing:1px;line-height:1.4;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">\${feats}</span></div>
    </div>
</div>\`;`;

lines.splice(k10Idx, endIdx - k10Idx);
lines.splice(k10Idx, 0, newHtml.replace(/\n\s+/g, ''));

fs.writeFileSync('tpl_klasik/klasik.js', lines.join('\n'));
console.log('Klasik 10 updated to final requested layout with 5 default features.');
