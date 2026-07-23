const fs = require('fs');
let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

cElit = cElit.replace(
    "addCanvaItem('★ ' + contact, 110, 960, 22, '#0f172a', 'transparent', 0, 0);",
    "addCanvaItem(contact, 110, 960, 22, '#0f172a', 'transparent', 0, 0);"
);

cElit = cElit.replace(
    "addCanvaItem('✆ ' + contact, 80, 960, 22, '#fbbf24', 'transparent', 0, 0);",
    "addCanvaItem(contact, 80, 960, 22, '#fbbf24', 'transparent', 0, 0);"
);

cElit = cElit.replace(
    "addCanvaItem('▸ ' + contact, 80, 1000, 22, '#06b6d4', 'transparent', 0, 0);",
    "addCanvaItem(contact, 80, 1000, 22, '#06b6d4', 'transparent', 0, 0);"
);

cElit = cElit.replace(
    "addCanvaItem('✆ ' + contact, 1285, 985, 22, C.textSoft, 'transparent', 0, 0, 550);",
    "addCanvaItem(contact, 1285, 985, 22, C.textSoft, 'transparent', 0, 0, 550);"
);

fs.writeFileSync('tpl_elit/elit.js', cElit);
console.log("Fixed all contact prefixes in canva6, 7, 8, 10!");
