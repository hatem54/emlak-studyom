const fs = require('fs');
let code = fs.readFileSync('core/drag.js', 'utf8');

const { parse } = require('acorn');
try {
    parse(code, { ecmaVersion: 2020 });
    console.log('✅ Valid');
} catch (e) {
    console.log(e.message + ' at line ' + e.loc.line + ' col ' + e.loc.column);
    const lines = code.split('\n');
    const start = Math.max(0, e.loc.line - 5);
    const end = Math.min(lines.length, e.loc.line + 5);
    for(let i=start; i<end; i++) {
        console.log((i+1) + ': ' + lines[i]);
    }
}
