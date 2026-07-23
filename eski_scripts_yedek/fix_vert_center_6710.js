const fs = require('fs');
let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

// --- CANVA 6 ---
cElit = cElit.replace(
    "addCanvaItem('▸ ÖZELLİKLER', 110, 560, 20, '#64748b', 'transparent', 0, 0);",
    "addCanvaItem('▸ ÖZELLİKLER', 110, 600, 20, '#64748b', 'transparent', 0, 0);"
);
cElit = cElit.replace(
    "addCanvaItem(feats, 110, 610, 32, '#334155', 'transparent', 0, 0, Math.min(750, textMaxW));",
    "addCanvaItem(feats, 110, 650, 32, '#334155', 'transparent', 0, 0, Math.min(750, textMaxW));"
);

// --- CANVA 7 ---
cElit = cElit.replace(
    "addCanvaItem(feats, 80, 470, 32, '#fecaca', 'transparent', 0, 0, 620);",
    "addCanvaItem(feats, 80, 600, 32, '#fecaca', 'transparent', 0, 0, 620);"
);

// --- CANVA 10 ---
cElit = cElit.replace(
    "addCanvaItem('▸ ÖZELLİKLER', 1260, 470, 22, C.accent, 'transparent', 0, 0);",
    "addCanvaItem('▸ ÖZELLİKLER', 1260, 600, 22, C.accent, 'transparent', 0, 0);"
);
cElit = cElit.replace(
    "addCanvaItem(feats, 1260, 520, 30, C.text, 'transparent', 0, 0, 580);",
    "addCanvaItem(feats, 1260, 650, 30, C.text, 'transparent', 0, 0, 580);"
);
cElit = cElit.replace(
    "<div style=\"position:absolute;top:${scaleY(455)}px;left:${scaleX(1260)}px;",
    "<div style=\"position:absolute;top:${scaleY(560)}px;left:${scaleX(1260)}px;"
);

fs.writeFileSync('tpl_elit/elit.js', cElit);
console.log("Vertically centered features between price and logo for 6, 7, 10!");
