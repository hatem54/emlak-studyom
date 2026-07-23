const fs = require('fs');
let c = fs.readFileSync('tpl_elit/elit.js', 'utf8');

// Canva 8 fixes:
c = c.replace(
    "addCanvaPanel(80, 80, 820, 180, 'rgba(255,255,255,0.12)', 20, '1px solid rgba(255,255,255,0.25)', '0 20px 50px rgba(0,0,0,0.3)');",
    "addCanvaPanel(80, 80, 700, 140, 'rgba(255,255,255,0.12)', 20, '1px solid rgba(255,255,255,0.25)', '0 20px 50px rgba(0,0,0,0.3)');"
);
c = c.replace(
    "addCanvaPanel(80, 850, 1760, 180, 'rgba(255,255,255,0.12)', 24, '1px solid rgba(255,255,255,0.25)', '0 20px 50px rgba(0,0,0,0.4)');",
    "addCanvaPanel(80, 800, 1760, 240, 'rgba(255,255,255,0.12)', 24, '1px solid rgba(255,255,255,0.25)', '0 20px 50px rgba(0,0,0,0.4)');"
);
c = c.replace(
    "addCanvaPanel(1230, 970, 590, 50, 'rgba(56,189,248,0.85)', 12, '1px solid rgba(125,211,252,0.6)', '0 10px 30px rgba(0,0,0,0.3)');",
    "addCanvaPanel(1230, 960, 590, 50, 'rgba(56,189,248,0.85)', 12, '1px solid rgba(125,211,252,0.6)', '0 10px 30px rgba(0,0,0,0.3)');"
);
c = c.replace(
    "addCanvaItem(title, 110, 115, 60, '#ffffff', 'transparent', 0, 0, 760);",
    "addCanvaItem(title, 80, 115, 64, '#ffffff', 'transparent', 0, 0, 700, 'center');"
);
c = c.replace(
    "addCanvaItem(price, 110, 205, 40, '#38bdf8', 'transparent', 0, 0, 760);",
    "addCanvaItem(price, 1260, 115, 54, '#38bdf8', 'transparent', 0, 0, 560, 'center');"
);
c = c.replace(
    "addCanvaItem(feats, 120, 865, 24, '#f1f5f9', 'transparent', 0, 0, 1100);",
    "addCanvaItem(feats, 120, 820, 28, '#f1f5f9', 'transparent', 0, 0, 1000);"
);
c = c.replace(
    "addCanvaItem(contact, 1250, 980, 24, '#0f172a', 'transparent', 0, 0, 550, 'center');",
    "addCanvaItem(contact, 1250, 970, 24, '#0f172a', 'transparent', 0, 0, 550, 'center');"
);

// Canva 1 fixes:
c = c.replace(
    "addCanvaItem(price, 80, 380, 54, '#b45309', 'transparent', 0, 0);",
    "addCanvaItem(price, 80, 260, 72, '#b45309', 'transparent', 0, 0);"
);
c = c.replace(
    "addCanvaItem(feats, 80, 510, 28, '#4a3b32', 'transparent', 16, 0, 640);",
    "addCanvaItem(feats, 80, 570, 28, '#4a3b32', 'transparent', 16, 0, 640);"
);

fs.writeFileSync('tpl_elit/elit.js', c);
console.log('Restored and applied all fixes correctly!');
