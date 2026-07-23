const fs = require('fs');
let txt = fs.readFileSync('tpl_kurumsal/kurumsal.js', 'utf8');
const unmodified = txt.includes('min-width:50px;">${contact}</span>');
console.log('Unmodified matches exist:', unmodified);
if (unmodified) {
    // some might have different formatting, let's just do a global replace
    txt = txt.replace(/min-width:50px;">\$\{contact\}<\/span>/g, 'min-width:50px;white-space:nowrap;">${contact}</span>');
    fs.writeFileSync('tpl_kurumsal/kurumsal.js', txt);
    console.log('Fixed remaining unwrapped contacts.');
}
