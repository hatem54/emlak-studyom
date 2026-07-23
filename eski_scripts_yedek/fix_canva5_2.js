const fs = require('fs');
let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

// 1. Feats
cElit = cElit.replace(
    "addCanvaItem(feats, infoX + 925, infoY + 30, 24, '#e5e5e5', 'transparent', 0, 0, 750);",
    "addCanvaItem(feats, infoX + 925, infoY + 20, 22, '#e5e5e5', 'transparent', 0, 0, 750);"
);

// 2. Gold Line
cElit = cElit.replace(
    "addCanvaPanel(infoX + 50, infoY + 180, 1660, 1,",
    "addCanvaPanel(infoX + 50, infoY + 170, 1660, 1,"
);

// 3. Contact (Remove icon, adjust Y, change alignment to 'right')
cElit = cElit.replace(
    "addCanvaItem('✆ ' + contact, infoX + 50, infoY + 190, 20, '#fbbf24', 'transparent', 0, 0, 1660, 'center');",
    "addCanvaItem(contact, infoX + 50, infoY + 185, 20, '#fbbf24', 'transparent', 0, 0, 1660, 'right');"
);

fs.writeFileSync('tpl_elit/elit.js', cElit);
console.log("Fixed canva5 layout individually!");
