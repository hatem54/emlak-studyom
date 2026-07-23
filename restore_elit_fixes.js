const fs = require('fs');
let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

// 1. Fix default input value in left menu
cElit = cElit.replace(
    'id="canvaContact" value="SÜMER GAYRİMENKUL | 0532 790 74 86"',
    'id="canvaContact" value="emlakstudyomtr@gmail.com"'
);

// 2. Fix the contact variable definition and logic
// Find where contact is defined.
const oldContactLine = "const contact = $('canvaContact').value;";
const newContactLogic = `let contactInput = $('canvaContact').value.trim();
        let contact = '';
        if (contactInput === '' || contactInput.includes('emlakstudyomtr@gmail.com')) {
            contact = \`<div style="line-height:1;"><img src="assets/logo/logo-icon.png" style="height:6em; width:6em; object-fit:contain; vertical-align:middle; margin-left:-2.2em; margin-right:-1.8em; margin-top:-2.5em; margin-bottom:-2.5em; pointer-events:none;"> <span style="vertical-align:middle; position:relative; z-index:2;">emlakstudyomtr@gmail.com</span></div>\`;
        } else {
            contact = contactInput;
        }`;

cElit = cElit.replace(oldContactLine, newContactLogic);

// 3. Canva 1 Features adjustments
cElit = cElit.replace(
    "addCanvaItem(feats, 80, 610, 30, '#4a3b32', 'transparent', 16, 0, 680);",
    "addCanvaItem(feats, 80, 630, 36, '#4a3b32', 'transparent', 20, 0, 680);"
);

// 4. Canva 2 Layout adjustments
cElit = cElit.replace(
    "addCanvaItem(`<div style=\"font-weight:900;margin-bottom:10px\">DAHA FAZLA BİLGİ İÇİN</div><div>${contact}</div>`, 1150, 770, 30, '#18181b', 'rgba(245,158,11,0.15)', 16, 20, 650, 'right');",
    "addCanvaItem(`<div style=\"font-weight:900;margin-bottom:10px;padding-top:10px;\">DAHA FAZLA BİLGİ İÇİN</div><div style=\"padding-bottom:15px;\">${contact}</div>`, 1220, 830, 30, '#18181b', 'rgba(245,158,11,0.15)', 16, 20, 600, 'right');"
);

// 5. Canva 4 Contact centering (The task the user actually requested)
cElit = cElit.replace(
    "addCanvaItem(contact, 1240, 950, 20, '#a7f3d0', 'transparent', 0, 0, 580, 'center');",
    "addCanvaItem(contact, 1240, 935, 20, '#a7f3d0', 'transparent', 0, 0, 580, 'center');"
);

fs.writeFileSync('tpl_elit/elit.js', cElit);
console.log('All elit.js fixes restored successfully.');
