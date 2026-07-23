const fs = require('fs');
let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

cElit = cElit.replace(
    "addCanvaItem(price, 110, 380, 58, '#ffffff', 'linear-gradient(135deg,#0f172a 0%,#334155 100%)', 12, 20);",
    "addCanvaItem(price, 110, 400, 58, '#ffffff', 'linear-gradient(135deg,#0f172a 0%,#334155 100%)', 12, 20);"
);

cElit = cElit.replace(
    "addCanvaItem('▸ ÖZELLİKLER', 110, 530, 20, '#64748b', 'transparent', 0, 0);",
    "addCanvaItem('▸ ÖZELLİKLER', 110, 560, 20, '#64748b', 'transparent', 0, 0);"
);

cElit = cElit.replace(
    "addCanvaItem(feats, 110, 580, 32, '#334155', 'transparent', 0, 0, Math.min(750, textMaxW));",
    "addCanvaItem(feats, 110, 610, 32, '#334155', 'transparent', 0, 0, Math.min(750, textMaxW));"
);

fs.writeFileSync('tpl_elit/elit.js', cElit);
console.log("Fixed canva6 overlaps and gaps!");
