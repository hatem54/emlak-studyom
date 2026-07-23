const fs = require('fs');
let txt = fs.readFileSync('tpl_portfoy/portfoy.js', 'utf8');

// 1. Remove blue info bar
txt = txt.replace(/<div class="edit-hint">[^<]+<\/div>\n?/, '');

// 2. Change EMLAK STUDIO to EMLAK STUDYOM
txt = txt.replace(/EMLAK STUDIO/g, 'EMLAK STUDYOM');

// 3. Fix grid insertion logic because we removed edit-hint
txt = txt.replace(
    /const hint = document\.querySelector\('#tpl-content-portfoy \.edit-hint'\);\s*if\(hint\) hint\.parentNode\.insertBefore\(grid, hint\.nextSibling\);/,
    "const anchor = document.querySelector('#tpl-content-portfoy .section-title');\n        if(anchor) anchor.parentNode.insertBefore(grid, anchor);"
);

// 4. Scale down font sizes
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
console.log('portfoy.js updated successfully: layout fixed and buttons restored.');
