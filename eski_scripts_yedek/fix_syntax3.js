const fs = require('fs');
let txt = fs.readFileSync('tpl_kurumsal/kurumsal.js', 'utf8');
const lines = txt.split('\n');

if (lines[104].includes('}`;')) {
    lines[104] = lines[104].replace('}`;', '}');
}

fs.writeFileSync('tpl_kurumsal/kurumsal.js', lines.join('\n'));
console.log('Fixed line 104.');
