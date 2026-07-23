const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core.js';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/g\.x \+ 'px'/g, "(g.x / (window.baseW || 1080) * 100) + '%'");
code = code.replace(/g\.y \+ 'px'/g, "(g.y / (window.baseH || 1080) * 100) + '%'");

fs.writeFileSync(file, code);
