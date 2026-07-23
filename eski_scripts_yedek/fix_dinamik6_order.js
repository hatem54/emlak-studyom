const fs = require('fs');
let txt = fs.readFileSync('tpl_dinamik/dinamik.js', 'utf8');
const lines = txt.split('\n');

const d6LineIndex = lines.findIndex(l => l.includes('canvaD6\')'));

// Create the new canvaD6 HTML from scratch to ensure correct order
const newHtml = `        canvaRenderLayer.innerHTML = \`<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#4c1d95;font-family:Poppins,sans-serif;">
    <div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;\${bgPos};clip-path:polygon(0 0, 100% 0, 60% 100%, 0% 100%);"></div>
    
    <div style="position:absolute;right:\${scaleX(50)}px;bottom:\${scaleY(60)}px;max-width:\${scaleX(800)}px;text-align:right;display:flex;flex-direction:column;align-items:flex-end;">
        <div style="font-size:\${scaleMin(32)}px;color:#ccc;font-family:Nunito,sans-serif;line-height:1.6;margin-bottom:\${scaleY(20)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">\${feats}</span></div>
        <div style="font-size:\${scaleMin(57)}px;color:#fff;font-weight:900;margin-bottom:\${scaleY(15)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">\${price}</span></div>
        <div style="font-size:\${scaleMin(73)}px;color:#fbbf24;font-weight:900;font-style:italic;line-height:1;"><span class="editable-text" style="display:inline-block;min-width:50px;">\${title}</span></div>
    </div>
    
    <div style="position:absolute;bottom:\${scaleY(30)}px;left:\${scaleX(50)}px;text-align:left;font-size:\${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;">
        <span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">\${contact}</span>
    </div>
</div>\`;`;

lines[d6LineIndex + 1] = newHtml.replace(/\n\s+/g, ''); // Compact it safely

fs.writeFileSync('tpl_dinamik/dinamik.js', lines.join('\n'));
console.log('Fixed Dinamik 6 Layout - Reordered text and reduced frame size.');
