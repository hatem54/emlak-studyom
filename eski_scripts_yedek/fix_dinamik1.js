const fs = require('fs');
let txt = fs.readFileSync('tpl_dinamik/dinamik.js', 'utf8');
const lines = txt.split('\n');

const d1LineIndex = lines.findIndex(l => l.includes('canvaD1\')'));
let html = lines[d1LineIndex + 1];

// Rewrite canvaD1 completely
const newHtml = `        canvaRenderLayer.innerHTML = \`<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#4c1d95;font-family:Poppins,sans-serif;">
    <div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;\${bgPos};clip-path:polygon(0 0, 100% 0, 100% 75%, 0 100%);"></div>
    <div style="position:absolute;bottom:0;left:0;width:100%;height:\${scaleY(350)}px;background:#4c1d95;z-index:1;"></div>
    
    <!-- Title & Price (Pulled Down - anchored to bottom:80px to make room for contact at 20px) -->
    <div style="position:absolute;bottom:\${scaleY(80)}px;left:\${scaleX(80)}px;z-index:2;">
        <div style="font-size:\${scaleMin(83)}px;color:#fff;font-weight:900;text-transform:uppercase;font-style:italic;line-height:0.9;">
            <span class="editable-text" style="display:inline-block;min-width:50px;">\${title}</span>
        </div>
        <div style="margin-top:\${scaleY(20)}px;">
            <div style="display:inline-block;background:#fbbf24;color:#000;padding:\${scaleY(10)}px \${scaleX(30)}px;font-size:\${scaleMin(57)}px;font-weight:900;transform:skew(-15deg);">
                <div style="transform:skew(15deg);">
                    <span class="editable-text" style="display:inline-block;min-width:50px;">\${price}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Features on the Right -->
    <div style="position:absolute;bottom:\${scaleY(80)}px;right:\${scaleX(80)}px;z-index:2;text-align:right;">
        <div style="font-size:\${scaleMin(35)}px;color:#ccc;font-family:Nunito,sans-serif;line-height:1.6;">
            <span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">\${feats}</span>
        </div>
    </div>

    <!-- Contact at bottom left -->
    <div style="position:absolute;bottom:\${scaleY(20)}px;left:\${scaleX(80)}px;font-size:\${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:1px;z-index:20;">
        <span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">\${contact}</span>
    </div>
</div>\`;`;

lines[d1LineIndex + 1] = newHtml.replace(/\n/g, ''); // Must be one line

fs.writeFileSync('tpl_dinamik/dinamik.js', lines.join('\n'));
console.log('Fixed Dinamik 1 Layout');
