const fs = require('fs');
let txt = fs.readFileSync('tpl_sosyal/sosyal.js', 'utf8');
const lines = txt.split('\n');

const canvaLines = lines.reduce((acc, l, idx) => {
    if (l.includes('canvaRenderLayer.innerHTML = `')) acc.push(idx);
    return acc;
}, []);

const s4Idx = canvaLines[3]; // canvaS4 is index 3

let endIdx = s4Idx;
while(!lines[endIdx].includes('    }')) {
    endIdx++;
}

// Construct the completely new, highly professional "PRO" design for Sosyal 4
const newHtml = `        canvaRenderLayer.innerHTML = \`<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#111827;font-family:Poppins,sans-serif;">
    <div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;\${bgPos}"></div>
    
    <div style="position:absolute;left:0;top:0;width:\${scaleX(1300)}px;height:100%;background:linear-gradient(90deg, rgba(17,24,39,0.95) 0%, rgba(17,24,39,0.85) 45%, transparent 100%);pointer-events:none;"></div>
    
    <div style="position:absolute;left:\${scaleX(120)}px;top:\${scaleY(180)}px;width:\${scaleX(800)}px;display:flex;flex-direction:column;align-items:flex-start;">
        
        <div style="border-left:\${scaleX(12)}px solid #be185d;padding-left:\${scaleX(40)}px;margin-bottom:\${scaleY(50)}px;">
            <div style="font-size:\${scaleMin(80)}px;color:#fff;font-weight:900;line-height:1.1;text-transform:uppercase;text-shadow:0 4px 20px rgba(0,0,0,0.5);">
                <span class="editable-text" style="display:inline-block;min-width:50px;">\${title}</span>
            </div>
        </div>
        
        <div style="padding-left:\${scaleX(52)}px;margin-bottom:\${scaleY(60)}px;">
            <div style="font-size:\${scaleMin(38)}px;color:#cbd5e1;font-weight:500;line-height:1.8;text-shadow:0 2px 10px rgba(0,0,0,0.5);">
                <span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">\${feats}</span>
            </div>
        </div>
        
        <div style="margin-left:\${scaleX(52)}px;background:#be185d;padding:\${scaleY(20)}px \${scaleX(50)}px;border-radius:\${scaleMin(20)}px;box-shadow:0 20px 40px rgba(190,24,93,0.4);">
            <div style="font-size:\${scaleMin(65)}px;color:#fff;font-weight:900;letter-spacing:1px;">
                <span class="editable-text" style="display:inline-block;min-width:50px;">\${price}</span>
            </div>
        </div>
        
    </div>
    
    <div style="position:absolute;bottom:\${scaleY(60)}px;left:\${scaleX(172)}px;font-size:\${scaleMin(30)}px;color:#94a3b8;font-weight:600;letter-spacing:2px;">
        <span class="editable-text" style="display:inline-block;min-width:50px;">\${contact}</span>
    </div>
</div>\`;`;

lines.splice(s4Idx, endIdx - s4Idx);
lines.splice(s4Idx, 0, newHtml.replace(/\n\s+/g, ''));

fs.writeFileSync('tpl_sosyal/sosyal.js', lines.join('\n'));
console.log('Sosyal 4 layout completely redesigned for a premium PRO look.');
