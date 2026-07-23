const fs = require('fs');

const content = fs.readFileSync('tpl_luks/luks.js', 'utf8');
const match = content.match(/const variations = (\[[\s\S]*?\]);/);
if(match) {
    const vars = eval(match[1]);
    vars.forEach((v, i) => {
        console.log('--- Template ' + i + ' ---');
        // Simple extraction
        const widthMatch = v.html.match(/width:\$\{scaleX\((\d+)\)\}px/g) || [];
        console.log('Widths:', widthMatch.join(', '));
        const fonts = v.html.match(/font-size:\$\{scaleMin\(\d+\)\}px/g) || [];
        console.log('Fonts:', fonts.join(', '));
    });
}
