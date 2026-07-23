const fs = require('fs');
let c = fs.readFileSync('tpl_elit/elit.js', 'utf8');

// Fix Canva 1 Features
c = c.replace(
    "addCanvaItem(feats, 80, 570, 28, '#4a3b32', 'transparent', 16, 0, 640);",
    "addCanvaItem(feats, 80, 500, 38, '#4a3b32', 'transparent', 24, 0, 640);"
);

// Fix Canva 8 background frame removal
c = c.replace(
    "addCanvaPanel(1240, 80, 600, 140, 'rgba(255,255,255,0.12)', 20, '1px solid rgba(255,255,255,0.25)', '0 20px 50px rgba(0,0,0,0.3)');",
    "// addCanvaPanel(1240, 80, 600, 140, 'rgba(255,255,255,0.12)', 20, '1px solid rgba(255,255,255,0.25)', '0 20px 50px rgba(0,0,0,0.3)');"
);

// Fix literal \\n syntax error from fix_canva8_v2 (if it exists)
c = c.split('\\n    addCanvaPanel(').join('\n    addCanvaPanel(');

// Remove the two blue bars
const blueBar1 = '<div class="edit-hint">💡 Yazıya/panele ÇİFT TIKLA düzenle, TEK TIKLA seç!</div>';
const blueBar2Regex = /<button class="btn-action btn-purple" onclick="addCustomTextBox\(\)" style="margin-bottom:8px">.*?Özel Çerçeveli Kutu \/ Metin Ekle<\/button>/;

c = c.replace(blueBar1, '');
c = c.replace(blueBar2Regex, '');

fs.writeFileSync('tpl_elit/elit.js', c);
console.log('All recent fixes applied successfully!');
