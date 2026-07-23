const fs = require('fs');
let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

const targetLine = "addCanvaItem('✆ ' + contact, 1240, 950, 20, '#a7f3d0', 'transparent', 0, 0, 580, 'center');";
const replaceLine = "addCanvaItem(contact, 1240, 935, 20, '#a7f3d0', 'transparent', 0, 0, 580, 'center');";

if (cElit.includes(targetLine)) {
    cElit = cElit.replace(targetLine, replaceLine);
    fs.writeFileSync('tpl_elit/elit.js', cElit);
    console.log("Fixed canva4 contact line!");
} else {
    console.log("Could not find the exact target line.");
}
