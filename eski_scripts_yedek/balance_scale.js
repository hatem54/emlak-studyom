const fs = require('fs');

// --- ELIT.JS ---
let elit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

// 1. Reduce default feats from 8 to 4 lines
elit = elit.replace(/<textarea id="canvaFeatures" rows="4"[^>]*>[\s\S]*?<\/textarea>/, 
`<textarea id="canvaFeatures" rows="4" style="width:100%;padding:6px;background:#0f172a;border:1px solid #334155;color:#fff;border-radius:5px;font-size:11px;resize:vertical">• 4+1 Geniş Salon
• 180 m² Brüt / 155 m² Net
• Ebeveyn Banyolu
• Merkezi Konum</textarea>`);

// 2. Gently scale TITLE and PRICE in Elit by 1.15x, leave others alone so they don't overlap vertically!
elit = elit.replace(/(addCanvaItem\(\s*title\s*,\s*\d+,\s*\d+,\s*)(\d+)/g, (match, prefix, sizeStr) => {
    return prefix + Math.round(parseInt(sizeStr) * 1.15);
});
elit = elit.replace(/(addCanvaItem\(\s*price\s*,\s*\d+,\s*\d+,\s*)(\d+)/g, (match, prefix, sizeStr) => {
    return prefix + Math.round(parseInt(sizeStr) * 1.15);
});
elit = elit.replace(/(addCanvaItem\(\s*'[A-ZĞÜŞİÖÇ]+'\s*,\s*\d+,\s*\d+,\s*)(\d+)/g, (match, prefix, sizeStr) => {
    // Static uppercase titles like 'SATILIK', 'DAİRE'
    return prefix + Math.round(parseInt(sizeStr) * 1.15);
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

// 2. REDUCE the overly ambitious original sizes in Luks so they fit within their frames!
// Originally, template author used 65px, 95px, 110px. We multiply by 0.6 to make them reasonable.
luks = luks.replace(/font-size:\$\{scaleMin\((\d+)\)\}px/g, (match, num) => {
    let n = Math.round(parseInt(num) * 0.65);
    return `font-size:\${scaleMin(${n})}px`;
});

fs.writeFileSync('tpl_luks/luks.js', luks, 'utf8');

console.log("Balanced scaling applied to both templates!");
