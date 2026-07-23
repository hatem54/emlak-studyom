const fs = require('fs');
let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

const targetLines = `    addCanvaItem(price, 60, 820, 52, '#38bdf8', 'rgba(56,189,248,0.12)', 12, 15, 500, 'center');
    addCanvaItem(contact, 60, 960, 22, '#94a3b8', 'transparent', 0, 0, 500, 'center');`;

const replaceLines = `    addCanvaItem(price, 60, 820, 52, '#38bdf8', 'rgba(56,189,248,0.12)', 12, 15, 0, 'left');
    addCanvaItem(contact, 60, 960, 22, '#94a3b8', 'transparent', 0, 0, 0, 'left');`;

if (cElit.includes(targetLines)) {
    cElit = cElit.replace(targetLines, replaceLines);
    fs.writeFileSync('tpl_elit/elit.js', cElit);
    console.log("Fixed canva3 left alignment!");
} else {
    console.log("Could not find the exact target lines for canva3.");
}
