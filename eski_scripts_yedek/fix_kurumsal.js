const fs = require('fs');
let kurumsal = fs.readFileSync('tpl_kurumsal/kurumsal.js', 'utf8');

// 1. Change default input value to EMLAK STUDYOM
kurumsal = kurumsal.replace('value="EMLAK STUDIO | 0532 000 0000"', 'value="EMLAK STUDYOM | 0532 000 0000"');

// 2. Add white-space:nowrap to all ${contact} spans to prevent wrapping
kurumsal = kurumsal.replace(/<span class="editable-text" style="display:inline-block;min-width:50px;">\$\{contact\}<\/span>/g, '<span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span>');

fs.writeFileSync('tpl_kurumsal/kurumsal.js', kurumsal);
console.log('Fixed Kurumsal brand and wrapping.');
