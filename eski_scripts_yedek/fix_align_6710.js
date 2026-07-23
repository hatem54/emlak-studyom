const fs = require('fs');
let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

// --- CANVA 6 ---
cElit = cElit.replace(
    "addCanvaItem('▸ ÖZELLİKLER', 110, 530, 20, '#64748b', 'transparent', 0, 0, Math.min(750, textMaxW), 'center');",
    "addCanvaItem('▸ ÖZELLİKLER', 110, 530, 20, '#64748b', 'transparent', 0, 0);"
);
cElit = cElit.replace(
    "addCanvaItem(feats, 110, 580, 32, '#334155', 'transparent', 0, 0, Math.min(750, textMaxW), 'center');",
    "addCanvaItem(feats, 110, 580, 32, '#334155', 'transparent', 0, 0, Math.min(750, textMaxW));"
);

// --- CANVA 7 ---
cElit = cElit.replace(
    "addCanvaItem(price, 80, 430, 56, '#fef08a', 'rgba(0,0,0,0.35)', 12, 20, 620);",
    "addCanvaItem(price, 80, 350, 56, '#fef08a', 'rgba(0,0,0,0.35)', 12, 20, 620);"
);
cElit = cElit.replace(
    "addCanvaItem(feats, 80, 610, 26, '#fecaca', 'transparent', 0, 0, 620);",
    "addCanvaItem(feats, 80, 470, 32, '#fecaca', 'transparent', 0, 0, 620);"
);

// --- CANVA 10 ---
cElit = cElit.replace(
    "addCanvaItem('▸ ÖZELLİKLER', 1260, 660, 18, C.accent, 'transparent', 0, 0);",
    "addCanvaItem('▸ ÖZELLİKLER', 1260, 470, 22, C.accent, 'transparent', 0, 0);"
);
cElit = cElit.replace(
    "addCanvaItem(feats, 1260, 705, 25, C.text, 'transparent', 0, 0, 580);",
    "addCanvaItem(feats, 1260, 520, 30, C.text, 'transparent', 0, 0, 580);"
);

fs.writeFileSync('tpl_elit/elit.js', cElit);
console.log("Fixed alignment and sizes for canva6, canva7, canva10!");
