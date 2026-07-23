const fs = require('fs');
let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

// 1. Title and Price (bump up slightly for vertical balance)
cElit = cElit.replace(
    "addCanvaItem(title, infoX + 50, infoY + 40, 48, '#ffffff', 'transparent', 0, 0, 700);",
    "addCanvaItem(title, infoX + 50, infoY + 35, 48, '#ffffff', 'transparent', 0, 0, 700);"
);
cElit = cElit.replace(
    "addCanvaItem(price, infoX + 50, infoY + 110, 42, '#fbbf24', 'transparent', 0, 0, 700);",
    "addCanvaItem(price, infoX + 50, infoY + 105, 42, '#fbbf24', 'transparent', 0, 0, 700);"
);

// 2. Vertical Line (adjust height to not cross the horizontal line)
cElit = cElit.replace(
    "addCanvaPanel(infoX + 900, infoY + 30, 1, 150,",
    "addCanvaPanel(infoX + 900, infoY + 30, 1, 145,"
);

// 3. Features (move up and reduce font size by 1px to fit above gold line)
cElit = cElit.replace(
    "addCanvaItem(feats, infoX + 925, infoY + 20, 22, '#e5e5e5', 'transparent', 0, 0, 750);",
    "addCanvaItem(feats, infoX + 925, infoY + 15, 21, '#e5e5e5', 'transparent', 0, 0, 750);"
);

// 4. Horizontal Line (move down slightly to give features more room)
cElit = cElit.replace(
    "addCanvaPanel(infoX + 50, infoY + 170, 1660, 1,",
    "addCanvaPanel(infoX + 50, infoY + 175, 1660, 1,"
);

fs.writeFileSync('tpl_elit/elit.js', cElit);
console.log("Fixed canva5 features overflow and lines intersection!");
