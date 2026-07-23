const fs = require('fs');

// --- ELIT.JS ---
let elit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

// 1. Shrink feats size by multiplying by 0.8 (e.g. 24 -> 19)
elit = elit.replace(/(addCanvaItem\(\s*feats\s*,\s*\d+,\s*\d+,\s*)(\d+)/g, (match, prefix, sizeStr) => {
    return prefix + Math.round(parseInt(sizeStr) * 0.8);
});

// 2. Change default canvaFeatures to 5 lines
elit = elit.replace(/<textarea id="canvaFeatures" rows="4"[^>]*>[\s\S]*?<\/textarea>/, 
`<textarea id="canvaFeatures" rows="5" style="width:100%;padding:6px;background:#0f172a;border:1px solid #334155;color:#fff;border-radius:5px;font-size:11px;resize:vertical">• 4+1 Geniş Salon
• 180 m² Brüt / 155 m² Net
• Ebeveyn Banyolu
• Site İçi Otopark
• Merkezi Konum</textarea>`);

// 3. Translate English words
elit = elit.replace('◆ PRESTIGE COLLECTION', '◆ PRESTİJ SERİSİ');
elit = elit.replace('✔ PROPERTY', '✔ GAYRİMENKUL');
elit = elit.replace('◆ EXCLUSIVE', '◆ ÖZEL PORTFÖY');

fs.writeFileSync('tpl_elit/elit.js', elit, 'utf8');


// --- LUKS.JS ---
let luks = fs.readFileSync('tpl_luks/luks.js', 'utf8');

// 1. Add missing parser for scaleMin
const targetStr = `    parsedHtml = parsedHtml.replace(/font-size:\\$\\{scaleX\\((\\d+)\\)\\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10))));`;
const newStr = `    parsedHtml = parsedHtml.replace(/font-size:\\$\\{scaleX\\((\\d+)\\)\\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10))));
    parsedHtml = parsedHtml.replace(/font-size:\\$\\{scaleMin\\((\\d+)\\)\\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10))));
    parsedHtml = parsedHtml.replace(/padding:\\$\\{scaleMin\\((\\d+)\\)\\}/g, (m, p1) => 'padding:' + Math.round(scaleMin(parseInt(p1, 10))));`;
if (luks.includes(targetStr)) {
    luks = luks.replace(targetStr, newStr);
}

// 2. Translate English words inside variations HTML
luks = luks.replace('LUXURY<br>COLLECTION', 'LÜKS<br>KOLEKSİYON');
luks = luks.replace('Exclusive', 'Özel Seri');
luks = luks.replace('PRESTIGE COLLECTION', 'PRESTİJ KOLEKSİYON');

fs.writeFileSync('tpl_luks/luks.js', luks, 'utf8');

console.log("Translations and final font adjustments applied!");
