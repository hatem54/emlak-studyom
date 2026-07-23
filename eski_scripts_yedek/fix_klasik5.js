const fs = require('fs');
let txt = fs.readFileSync('tpl_klasik/klasik.js', 'utf8');
const lines = txt.split('\n');

const canvaLines = lines.reduce((acc, l, idx) => {
    if (l.includes('canvaRenderLayer.innerHTML = `')) acc.push(idx);
    return acc;
}, []);

// Klasik 5 is index 4
const k5Idx = canvaLines[4];
if (lines[k5Idx]) {
    const newHtml = `        canvaRenderLayer.innerHTML = \`<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#222;font-family:Cinzel,serif;">
    <div class="photo-panel" style="width:100%;height:\${scaleY(540)}px;position:absolute;left:0;top:0;\${bgPos};border-bottom:10px solid #fef3c7;"></div>
    
    <div style="position:absolute;left:0;top:\${scaleY(550)}px;width:100%;height:\${scaleY(530)}px;background:#450a0a;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;">
        <div style="font-size:\${scaleMin(110)}px;color:#fff;margin-bottom:\${scaleY(20)}px;letter-spacing:5px;"><span class="editable-text" style="display:inline-block;min-width:50px;">\${title}</span></div>
        <div style="font-size:\${scaleMin(70)}px;color:#fef3c7;font-family:Lora,serif;"><span class="editable-text" style="display:inline-block;min-width:50px;">\${price}</span></div>
    </div>
    
    <div style="position:absolute;bottom:\${scaleY(60)}px;left:\${scaleX(80)}px;text-align:left;display:flex;flex-direction:column;justify-content:flex-end;">
        <div style="font-size:\${scaleMin(30)}px;color:#ddd;font-family:Lora,serif;letter-spacing:2px;line-height:1.4;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">\${feats}</span></div>
    </div>
    
    <div style="position:absolute;bottom:\${scaleY(60)}px;right:\${scaleX(80)}px;text-align:right;font-size:\${scaleMin(30)}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:2px;z-index:20;text-shadow:0 2px 5px rgba(0,0,0,0.8);">
        <span class="editable-text" style="display:inline-block;min-width:50px;">\${contact}</span>
    </div>
</div>\`;`;

    lines[k5Idx] = newHtml.replace(/\n\s+/g, '');
    fs.writeFileSync('tpl_klasik/klasik.js', lines.join('\n'));
    console.log('Fixed Klasik 5 layout.');
}
