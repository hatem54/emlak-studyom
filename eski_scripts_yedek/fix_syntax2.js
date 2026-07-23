const fs = require('fs');
let txt = fs.readFileSync('tpl_kurumsal/kurumsal.js', 'utf8');
const lines = txt.split('\n');

// The line with the HTML is lines[103].
// Let's add `; to lines[103] and fix lines[104].
if (!lines[103].endsWith('`;')) {
    lines[103] = lines[103] + '`;';
}

if (lines[104].trim() === '}`;') {
    lines[104] = '    }';
}

fs.writeFileSync('tpl_kurumsal/kurumsal.js', lines.join('\n'));
console.log('Syntax error fixed properly.');
