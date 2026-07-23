const fs = require('fs');
let code = fs.readFileSync('app.html', 'utf8');
const v = Date.now();
code = code.replace(/src="main\.js(\?v=\d+)?"/g, 'src="main.js?v=' + v + '"');
code = code.replace(/src="core\/drag\.js(\?v=\d+)?"/g, 'src="core/drag.js?v=' + v + '"');
code = code.replace(/src="modules\/draw\.js(\?v=\d+)?"/g, 'src="modules/draw.js?v=' + v + '"');
fs.writeFileSync('app.html', code);
console.log('Cache busters updated');
