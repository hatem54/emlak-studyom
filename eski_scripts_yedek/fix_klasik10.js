const fs = require('fs');
let txt = fs.readFileSync('tpl_klasik/klasik.js', 'utf8');
const lines = txt.split('\n');

const canvaLines = lines.reduce((acc, l, idx) => {
    if (l.includes('canvaRenderLayer.innerHTML = `')) acc.push(idx);
    return acc;
}, []);

const k10Idx = canvaLines[9];
if (lines[k10Idx]) {
    // We will rewrite the innerHTML for Klasik 10 to fix the layout.
    const newHtml = `        canvaRenderLayer.innerHTML = \`<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#2c1b18;font-family:Cinzel,serif;">
    <div class="photo-panel" style="width:\${scaleX(1600)}px;height:\${scaleY(650)}px;position:absolute;left:\${scaleX(160)}px;top:\${scaleY(100)}px;\${bgPos};border:10px solid #efece6;"></div>
    <div style="position:absolute;left:\${scaleX(160)}px;bottom:\${scaleY(80)}px;width:\${scaleX(1280)}px;display:flex;justify-content:space-between;align-items:center;">
        <div>
            <div style="font-size:\${scaleMin(75)}px;color:#fef3c7;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">\${title}</span></div>
            <div style="font-size:\${scaleMin(35)}px;color:#ccc;font-family:sans-serif;letter-spacing:2px;margin-top:\${scaleY(10)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">\${contact}</span></div>
        </div>
        <div style="font-size:\${scaleMin(70)}px;color:#fff;font-family:Lora,serif;"><span class="editable-text" style="display:inline-block;min-width:50px;">\${price}</span></div>
    </div>
</div>\`;`;

    lines[k10Idx] = newHtml.replace(/\n\s+/g, '');
    fs.writeFileSync('tpl_klasik/klasik.js', lines.join('\n'));
    console.log('Fixed Klasik 10 layout.');
}
