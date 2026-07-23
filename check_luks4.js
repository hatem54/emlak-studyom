const fs = require('fs');
const content = fs.readFileSync('tpl_luks/luks.js', 'utf8');
const match = content.match(/const variations = (\[[\s\S]*?\]);/);
if(match) {
    const vars = eval(match[1]);
    console.log(vars[3].html.replace(/`/g, ''));
}
