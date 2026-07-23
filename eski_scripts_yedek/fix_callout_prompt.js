const fs = require('fs');
let calloutJs = fs.readFileSync('modules/callout.js', 'utf8');

calloutJs = calloutJs.replace(/prompt\('Callout metnini d[a-zA-Z\u0080-\uFFFF]*zenle:'/g, "prompt('Metni düzenle (Silmek için boş bırakın):'");
calloutJs = calloutJs.replace(/if\(newText !== null && newText\.trim\(\)\) this\.textContent = newText;/g, "if(newText !== null) this.textContent = newText.trim();");

fs.writeFileSync('modules/callout.js', calloutJs, 'utf8');
