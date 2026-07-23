const fs = require('fs');
const v11Path = 'C:\\Users\\Hatemi\\Desktop\\emlak düzenlemeleri için uygulama\\emlak-studiom v7-11\\tpl_luks\\luks.js';
const v0Path = 'C:\\Users\\Hatemi\\Desktop\\emlak düzenlemeleri için uygulama\\emlak-studiom v7-0\\tpl_luks\\luks.js';

let v11Code = fs.readFileSync(v11Path, 'utf8');
let match = v11Code.match(/const variations = \[\{"html":[\s\S]*?\}\];/);

if (match) {
    let v0Code = fs.readFileSync(v0Path, 'utf8');
    v0Code = v0Code.replace(/const variations = \[\{"html":[\s\S]*?\}\];/, match[0]);
    fs.writeFileSync(v0Path, v0Code, 'utf8');
    console.log('Successfully updated variations from v7-11 to v7-0');
} else {
    console.log('Could not find variations array in v7-11');
}
