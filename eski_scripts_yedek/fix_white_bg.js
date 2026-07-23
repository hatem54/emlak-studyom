const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/modules/photo.js';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/photoLayer\.style\.backgroundColor\s*=\s*'#ffffff';/g, "photoLayer.style.backgroundColor='transparent';");
code = code.replace(/p\.style\.backgroundColor\s*=\s*'#ffffff';/g, "p.style.backgroundColor='transparent';");

fs.writeFileSync(file, code, 'utf8');
console.log('Fixed white background issue in photo.js');
