const fs = require('fs');
let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

cElit = cElit.replace(
    "addCanvaItem(feats, 1100, 760, 24, '#d1d5db', 'transparent', 0, 0, 750);",
    "addCanvaItem(feats, 1000, 760, 32, '#d1d5db', 'transparent', 0, 0, 850, 'center');"
);

fs.writeFileSync('tpl_elit/elit.js', cElit);
console.log("Centered and enlarged features for canva9!");
