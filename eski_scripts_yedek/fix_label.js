const fs = require('fs');

let luks = fs.readFileSync('tpl_luks/luks.js', 'utf8');

// Replace "Ana Başlık (Title)" with "Ana Başlık"
luks = luks.replace('<label>Ana Başlık (Title)</label>', '<label>Ana Başlık</label>');

fs.writeFileSync('tpl_luks/luks.js', luks, 'utf8');
console.log("Label fixed!");
