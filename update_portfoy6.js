const fs = require('fs');
let txt = fs.readFileSync('tpl_portfoy/portfoy.js', 'utf8');

const canvaLines = txt.split('\n');
const sIdx = canvaLines.findIndex(l => l.includes("canvaRenderLayer.innerHTML = `") && txt.split('\n')[canvaLines.indexOf(l)-1].includes("if (id === 'canvaP6') {"));
if(sIdx === -1) {
    // try to find by ID
    const match = txt.match(/if\s*\(id\s*===\s*'canvaP6'\)\s*\{\s*canvaRenderLayer\.innerHTML\s*=\s*`([\s\S]*?)`;\s*\}/);
    if(match) {
        let newHtml = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#166534;font-family:Raleway,sans-serif;">
    <div style="position:absolute;bottom:\$\{scaleY(-20)\}px;left:\$\{scaleX(40)\}px;font-size:\$\{scaleMin(400)\}px;color:rgba(255,255,255,0.05);font-weight:900;line-height:0.8;white-space:nowrap;pointer-events:none;">01</div>
    <div class="photo-panel" style="width:\$\{scaleX(950)\}px;height:\$\{scaleY(760)\}px;position:absolute;right:\$\{scaleX(80)\}px;top:\$\{scaleY(140)\}px;\$\{bgPos\};box-shadow:0 20px 40px rgba(0,0,0,0.5);border-radius:10px;"></div>
    <div style="position:absolute;left:\$\{scaleX(80)\}px;top:\$\{scaleY(200)\}px;width:\$\{scaleX(700)\}px;">
        <div style="font-size:\$\{scaleMin(54)\}px;color:#fff;font-weight:900;line-height:1.2;margin-bottom:\$\{scaleY(40)\}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">\$\{title\}</span></div>
        <div style="font-size:\$\{scaleMin(42)\}px;color:#bbf7d0;font-weight:800;background:rgba(0,0,0,0.3);padding:\$\{scaleY(15)\}px \$\{scaleX(30)\}px;border-radius:15px;display:inline-block;margin-bottom:\$\{scaleY(50)\}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">\$\{price\}</span></div>
        <div style="font-size:\$\{scaleMin(32)\}px;color:#e2e8f0;font-family:Roboto,sans-serif;line-height:1.7;font-weight:700;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">\$\{feats\}</span></div>
    </div>
    <div style="position:absolute;bottom:\$\{scaleY(30)\}px;left:0;width:100%;text-align:center;font-size:\$\{scaleMin(26)\}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">\$\{contact\}</span></div>
</div>`;
        txt = txt.replace(match[1], newHtml);
        fs.writeFileSync('tpl_portfoy/portfoy.js', txt);
        console.log('Portfoy 6 updated successfully');
    } else {
        console.log('canvaP6 not found');
    }
} else {
    // using array replace if regex fails
    console.log("Could use another method.");
}
