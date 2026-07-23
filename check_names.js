const fs = require('fs');
const c = fs.readFileSync('tpl_luks/luks.js', 'utf8');
const m = c.match(/name:\s*['"`](.*?)['"`]/g);
console.log(m.slice(0, 5));
