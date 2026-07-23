const fs = require('fs');
let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

cElit = cElit.replace(
    'id="canvaContact" value="SÜMER GAYRİMENKUL | 0532 790 74 86"',
    'id="canvaContact" value="emlakstudyomtr@gmail.com"'
);

const oldLogic = `const contact = $('canvaContact').value;`;
const newLogic = `let contactInput = $('canvaContact').value.trim();
        let contact = '';
        if (contactInput === '' || contactInput.includes('emlakstudyomtr@gmail.com')) {
            contact = \`<div style="line-height:1;"><img src="assets/logo/logo-icon.png" style="height:6em; width:6em; object-fit:contain; vertical-align:middle; margin-left:-2.2em; margin-right:-1.8em; margin-top:-2.5em; margin-bottom:-2.5em; pointer-events:none;"> <span style="vertical-align:middle; position:relative; z-index:2;">emlakstudyomtr@gmail.com</span></div>\`;
        } else {
            contact = contactInput;
        }`;

cElit = cElit.replace(oldLogic, newLogic);

fs.writeFileSync('tpl_elit/elit.js', cElit);
console.log("Restored the user's logo edits!");
