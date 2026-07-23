const fs = require('fs');
let content = fs.readFileSync('tpl_elit/elit.js', 'utf8');

const targetStr = `        addCanvaItem('◆ EXCLUSIVE', 80, 180, 26, '#fbbf24', 'transparent', 0, 0);`;

const newStr = `        addCanvaItem('◆ EXCLUSIVE', 80, 170, 40, '#fbbf24', 'transparent', 0, 0);
        addCanvaItem(title, 80, 240, 110, '#ffffff', 'transparent', 0, 0, 640);
        addCanvaItem(price, 80, 500, 75, '#fef08a', 'rgba(0,0,0,0.35)', 12, 20, 620);
        addCanvaItem(feats, 80, 640, 40, '#fecaca', 'transparent', 0, 0, 620);
        addCanvaItem('✆ ' + contact, 80, 960, 36, '#fbbf24', 'transparent', 0, 0);`;

const startIndex = content.indexOf(targetStr);
if (startIndex !== -1) {
    const endStr = `addCanvaItem('✆ ' + contact, 80, 960, 22, '#fbbf24', 'transparent', 0, 0);`;
    const endIndex = content.indexOf(endStr, startIndex) + endStr.length;
    
    content = content.substring(0, startIndex) + newStr + content.substring(endIndex);
    fs.writeFileSync('tpl_elit/elit.js', content, 'utf8');
    console.log("canvaE7 fixed precisely!");
} else {
    console.log("Could not find exact string for E7");
}
