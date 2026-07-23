const fs = require('fs');
let content = fs.readFileSync('modules/draw.js', 'utf8');
content = content.replace(/drawCanvas\.style\.cursor='crosshair';/g, "drawCanvas.style.cursor='default';");
fs.writeFileSync('modules/draw.js', content, 'utf8');
