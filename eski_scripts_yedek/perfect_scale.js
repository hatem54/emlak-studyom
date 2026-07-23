const fs = require('fs');

// --- ELIT.JS ---
let elit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

// 1. Reduce default feats from 8 to 4 lines
elit = elit.replace(/<textarea id="canvaFeatures" rows="4"[^>]*>[\s\S]*?<\/textarea>/, 
`<textarea id="canvaFeatures" rows="4" style="width:100%;padding:6px;background:#0f172a;border:1px solid #334155;color:#fff;border-radius:5px;font-size:11px;resize:vertical">• 4+1 Geniş Salon
• 180 m² Brüt / 155 m² Net
• Ebeveyn Banyolu
• Merkezi Konum</textarea>`);

// 2. Gently scale fonts in addCanvaItem by ~1.3x (not 1.8x)
elit = elit.replace(/(addCanvaItem\([^,]+,\s*\d+,\s*\d+,\s*)(\d+)/g, (match, prefix, sizeStr) => {
    let s = parseInt(sizeStr);
    s = Math.round(s * 1.3);
    return prefix + s;
});

fs.writeFileSync('tpl_elit/elit.js', elit, 'utf8');


// --- LUKS.JS ---
let luks = fs.readFileSync('tpl_luks/luks.js', 'utf8');

// 1. Add missing parser for scaleMin
const targetStr = `    parsedHtml = parsedHtml.replace(/font-size:\\$\\{scaleX\\((\\d+)\\)\\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10))));`;
const newStr = `    parsedHtml = parsedHtml.replace(/font-size:\\$\\{scaleX\\((\\d+)\\)\\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10))));
    parsedHtml = parsedHtml.replace(/font-size:\\$\\{scaleMin\\((\\d+)\\)\\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10))));
    parsedHtml = parsedHtml.replace(/padding:\\$\\{scaleMin\\((\\d+)\\)\\}/g, (m, p1) => 'padding:' + Math.round(scaleMin(parseInt(p1, 10))));`;

luks = luks.replace(targetStr, newStr);

// 2. Gently scale Lüks fonts by 1.3x (since original sizes + parser fix is good, but user wants them slightly bigger inside the frames)
luks = luks.replace(/font-size:\$\{scaleMin\((\d+)\)\}px/g, (match, num) => {
    let n = Math.round(parseInt(num) * 1.3);
    return `font-size:\${scaleMin(${n})}px`;
});

fs.writeFileSync('tpl_luks/luks.js', luks, 'utf8');

console.log("Perfect gentle scaling applied.");
