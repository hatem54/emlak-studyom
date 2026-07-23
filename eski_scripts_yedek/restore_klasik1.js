const fs = require('fs');
let txt = fs.readFileSync('tpl_klasik/klasik.js', 'utf8');
const lines = txt.split('\n');

const canvaLines = lines.reduce((acc, l, idx) => {
    if (l.includes('canvaRenderLayer.innerHTML = `')) acc.push(idx);
    return acc;
}, []);

const k1Idx = canvaLines[0];
if (lines[k1Idx]) {
    const originalHtml = `        canvaRenderLayer.innerHTML = \`<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#450a0a;font-family:Cinzel,serif;">
    <div class="photo-panel" style="width:\${scaleX(1600)}px;height:\${scaleY(700)}px;position:absolute;left:\${scaleX(160)}px;top:\${scaleY(160)}px;\${bgPos};border:8px double #fef3c7;"></div>
    
    <div style="position:absolute;top:\${scaleY(40)}px;width:100%;text-align:center;">
        <div style="font-size:\${scaleMin(65)}px;color:#fef3c7;font-weight:700;letter-spacing:10px;"><span class="editable-text" style="display:inline-block;min-width:50px;">\${title}</span></div>
    </div>
    
    <div style="position:absolute;bottom:\${scaleY(50)}px;width:100%;text-align:center;display:flex;justify-content:center;align-items:center;gap:\${scaleX(50)}px;">
        <div style="font-size:\${scaleMin(40)}px;color:#fef3c7;font-weight:600;"><span class="editable-text" style="display:inline-block;min-width:50px;">\${price}</span></div>
        <div style="font-size:\${scaleMin(20)}px;color:#fff;font-family:Lora,serif;letter-spacing:2px;display:flex;gap:\${scaleX(20)}px;text-align:left;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">\${feats}</span></div>
    </div>
    
    <div style="position:absolute;bottom:\${scaleY(20)}px;left:\${scaleX(160)}px;text-align:left;font-size:\${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;">
        <span class="editable-text" style="display:inline-block;min-width:50px;">\${contact}</span>
    </div>
</div>\`;`;

    lines[k1Idx] = originalHtml.replace(/\n\s+/g, '');
    fs.writeFileSync('tpl_klasik/klasik.js', lines.join('\n'));
    console.log('Restored original Klasik 1 layout with contact on the left.');
}
