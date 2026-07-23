const fs = require('fs');

let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

const oldContactString = `let contactInput = $('canvaContact').value || 'emlakstudyomtr@gmail.com';
        let contact = \`<div style="line-height:1;"><img src="assets/logo/logo-icon.png" style="height:6em; width:6em; object-fit:contain; vertical-align:middle; margin-left:-2.2em; margin-right:-1.8em; margin-top:-2.5em; margin-bottom:-2.5em; pointer-events:none;"> <span style="vertical-align:middle; position:relative; z-index:2;">\${contactInput}</span></div>\`;`;

const newContactString = `let contactInput = $('canvaContact').value.trim();
        let contact = '';
        if (contactInput === '' || contactInput.includes('emlakstudyomtr@gmail.com')) {
            contact = \`<div style="line-height:1;"><img src="assets/logo/logo-icon.png" style="height:6em; width:6em; object-fit:contain; vertical-align:middle; margin-left:-2.2em; margin-right:-1.8em; margin-top:-2.5em; margin-bottom:-2.5em; pointer-events:none;"> <span style="vertical-align:middle; position:relative; z-index:2;">emlakstudyomtr@gmail.com</span></div>\`;
        } else {
            contact = contactInput;
        }`;

if (cElit.includes(oldContactString)) {
    cElit = cElit.replace(oldContactString, newContactString);
    fs.writeFileSync('tpl_elit/elit.js', cElit);
    console.log('Contact conditional logic applied.');
} else {
    console.log('Contact string not found for replacement.');
}
