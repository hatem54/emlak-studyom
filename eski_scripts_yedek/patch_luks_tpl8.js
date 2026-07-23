const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/tpl_luks/luks.js';
let code = fs.readFileSync(file, 'utf8');

const tpl8_start = 'background:#1e293b;clip-path:polygon(0 0, 100% 0, 0 100%);\\\"></div><div style=\\\"position:absolute;left:${scaleX(60)}px;top:${scaleY(80)}px;width:${scaleX(600)}px;\\\">';
const tpl8_new = 'background:#1e293b;clip-path:polygon(0 0, 100% 0, 0 100%);\\\"></div><div style=\\\"position:absolute;left:${scaleX(60)}px;top:${scaleY(80)}px;width:${scaleX(450)}px;\\\">';

if (code.includes(tpl8_start)) {
    code = code.replace(tpl8_start, tpl8_new);
    fs.writeFileSync(file, code, 'utf8');
    console.log('Successfully updated template 8 width to 450px');
} else {
    console.log('Template 8 specific string not found');
}
