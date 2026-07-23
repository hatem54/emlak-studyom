const fs = require('fs');
let c = fs.readFileSync('tpl_elit/elit.js', 'utf8');

c = c.replace(/\\n/g, '\n');

fs.writeFileSync('tpl_elit/elit.js', c);
console.log('Fixed \\n syntax error in elit.js');
