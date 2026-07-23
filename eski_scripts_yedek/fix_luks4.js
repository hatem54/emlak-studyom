const fs = require('fs');
let luks = fs.readFileSync('tpl_luks/luks.js', 'utf8');
const match = luks.match(/const variations = (\[[\s\S]*?\]);/);
let vars = JSON.parse(match[1]);
let html = vars[3].html;

// Replace width:${scaleX(500)}px; right:0 with dynamic centering
html = html.replace('position:absolute;right:0;top:0;width:${scaleX(500)}px;height:100%;', 'position:absolute;left:${scaleX(1100)}px;right:0;top:0;height:100%;display:flex;flex-direction:column;justify-content:center;');

vars[3].html = html;
const newArr = JSON.stringify(vars);
luks = luks.substring(0, match.index) + 'const variations = ' + newArr + ';' + luks.substring(match.index + match[0].length);
fs.writeFileSync('tpl_luks/luks.js', luks);
console.log('Fixed Luks 4 correctly.');
