const fs = require('fs');
let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

// 1. Fix default input value in left menu
cElit = cElit.replace(
    'id="canvaContact" value="SÜMER GAYRİMENKUL | 0532 790 74 86"',
    'id="canvaContact" value="emlakstudyomtr@gmail.com"'
);

// 2. Put back the conditional logic exactly as requested by user
const currentContactLogic = `let contact = \`<div style="line-height:1;"><img src="assets/logo/logo-icon.png" style="height:6em; width:6em; object-fit:contain; vertical-align:middle; margin-left:-2.2em; margin-right:-1.8em; margin-top:-2.5em; margin-bottom:-2.5em; pointer-events:none;"> <span style="vertical-align:middle; position:relative; z-index:2;">\${contactInput || 'emlakstudyomtr@gmail.com'}</span></div>\`;`;

const newContactLogic = `let contact = '';
        if (contactInput === '' || contactInput.includes('emlakstudyomtr@gmail.com')) {
            contact = \`<div style="line-height:1;"><img src="assets/logo/logo-icon.png" style="height:6em; width:6em; object-fit:contain; vertical-align:middle; margin-left:-2.2em; margin-right:-1.8em; margin-top:-2.5em; margin-bottom:-2.5em; pointer-events:none;"> <span style="vertical-align:middle; position:relative; z-index:2;">emlakstudyomtr@gmail.com</span></div>\`;
        } else {
            contact = contactInput;
        }`;

cElit = cElit.replace(currentContactLogic, newContactLogic);
fs.writeFileSync('tpl_elit/elit.js', cElit);
console.log('Fixed completely!');
