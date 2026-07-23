const fs = require('fs');
let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

// ================= CANVA 6 =================
cElit = cElit.replace(
    "addCanvaItem(price, 110, 500, 58, '#ffffff', 'linear-gradient(135deg,#0f172a 0%,#334155 100%)', 12, 20);",
    "addCanvaItem(price, 110, 380, 58, '#ffffff', 'linear-gradient(135deg,#0f172a 0%,#334155 100%)', 12, 20);"
);
cElit = cElit.replace(
    "addCanvaItem('▸ ÖZELLİKLER', 110, 630, 18, '#64748b', 'transparent', 0, 0);",
    "addCanvaItem('▸ ÖZELLİKLER', 110, 530, 20, '#64748b', 'transparent', 0, 0, Math.min(750, textMaxW), 'center');"
);
cElit = cElit.replace(
    "addCanvaItem(feats, 110, 675, 26, '#334155', 'transparent', 0, 0, Math.min(750, textMaxW));",
    "addCanvaItem(feats, 110, 580, 32, '#334155', 'transparent', 0, 0, Math.min(750, textMaxW), 'center');"
);

// ================= CANVA 7 =================
cElit = cElit.replace(
    "addCanvaItem(price, 80, 470, 56, '#fef08a', 'rgba(0,0,0,0.35)', 12, 20, 620);",
    "addCanvaItem(price, 80, 430, 56, '#fef08a', 'rgba(0,0,0,0.35)', 12, 20, 620);"
);
cElit = cElit.replace(
    "addCanvaItem('▸ ÖZELLİKLER', 80, 650, 18, 'rgba(255,255,255,0.6)', 'transparent', 0, 0);",
    "addCanvaItem('▸ ÖZELLİKLER', 80, 560, 20, 'rgba(255,255,255,0.6)', 'transparent', 0, 0, 600, 'center');"
);
cElit = cElit.replace(
    "addCanvaItem(feats, 80, 690, 24, '#e2e8f0', 'transparent', 0, 0, 600);",
    "addCanvaItem(feats, 80, 610, 30, '#e2e8f0', 'transparent', 0, 0, 600, 'center');"
);

// ================= CANVA 10 =================
cElit = cElit.replace(
    "addCanvaItem(price, 1260, 490, 52, '#ffffff', C.primary, 55, 18, 520, 'center');",
    "addCanvaItem(price, 1260, 370, 52, '#ffffff', C.primary, 55, 18, 520, 'center');"
);
cElit = cElit.replace(
    "addCanvaItem('▸ BİLGİLER', 1285, 620, 16, C.textSoft, 'transparent', 0, 0);",
    "addCanvaItem('▸ BİLGİLER', 1285, 480, 20, C.textSoft, 'transparent', 0, 0, 550, 'center');"
);
cElit = cElit.replace(
    "addCanvaItem(feats, 1285, 660, 22, C.textDark, 'transparent', 0, 0, 550);",
    "addCanvaItem(feats, 1285, 530, 28, C.textDark, 'transparent', 0, 0, 550, 'center');"
);

fs.writeFileSync('tpl_elit/elit.js', cElit);
console.log("Fixed spacing, size, and alignment in canva6, 7, and 10!");
