const fs = require('fs');
let txt = fs.readFileSync('tpl_portfoy/portfoy.js', 'utf8');

// 1. Remove blue info bar
txt = txt.replace(/<div class="edit-hint">[^<]+<\/div>/g, '');

// 2. Change EMLAK STUDIO to EMLAK STUDYOM
txt = txt.replace(/EMLAK STUDIO/g, 'EMLAK STUDYOM');

// 3. Scale down font sizes
// Only replace the known sizes that cause overflow
const scaleMap = {
    '110': '80',
    '101': '72',
    '93': '68',
    '81': '60',
    '76': '58',
    '70': '54',
    '62': '48',
    '57': '44',
    '53': '35', // contact / large feats
    '49': '38',
    '39': '32', // feats
    '35': '26', // contact
    '29': '22'
};

for (const [oldVal, newVal] of Object.entries(scaleMap)) {
    const regex = new RegExp(`scaleMin\\(${oldVal}\\)`, 'g');
    txt = txt.replace(regex, `scaleMin(${newVal})`);
}

fs.writeFileSync('tpl_portfoy/portfoy.js', txt);
console.log('portfoy.js updated successfully: info bar removed, brand renamed, font sizes scaled down.');
