const fs = require('fs');
let c = fs.readFileSync('modules/export.js', 'utf8');
// Fix the broken literals
c = c.replace(/if \(el\.classList && el\.classList\.contains\(\\'text-handle\\'\)\) return true;\\n                          if \(el\.classList && el\.classList\.contains\(\\'photo-inner-zoom\\'\)\) return true;/g, "if (el.classList && el.classList.contains('text-handle')) return true;\n                          if (el.classList && el.classList.contains('photo-inner-zoom')) return true;");
fs.writeFileSync('modules/export.js', c);
