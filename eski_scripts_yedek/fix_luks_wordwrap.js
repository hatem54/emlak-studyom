const fs = require('fs');
let luks = fs.readFileSync('tpl_luks/luks.js', 'utf8');

luks = luks.replace(/style=\\"display:inline-block;/g, 'style=\\"display:inline-block;word-break:break-word;white-space:pre-wrap;max-width:100%;');

fs.writeFileSync('tpl_luks/luks.js', luks, 'utf8');
console.log("Applied word wrap!");
