const fs = require('fs');
let txt = fs.readFileSync('tpl_kurumsal/kurumsal.js', 'utf8');
const lines = txt.split('\n');

lines[104] = '    }';

fs.writeFileSync('tpl_kurumsal/kurumsal.js', lines.join('\n'));
console.log('Explicitly set line 105 to just }.');
