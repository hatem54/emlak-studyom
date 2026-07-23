const fs = require('fs');

let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

// 1. Fix contact dynamic value
const oldContactRegex = /let contact = \$\('canvaContact'\)\.value;\s*contact = '<div style="line-height:1;"><img src="assets\/logo\/logo-icon\.png" style="height:6em; width:6em; object-fit:contain; vertical-align:middle; margin-left:-2\.2em; margin-right:-1\.8em; margin-top:-2\.5em; margin-bottom:-2\.5em; pointer-events:none;"> <span style="vertical-align:middle; position:relative; z-index:2;">emlakstudyomtr@gmail\.com<\/span><\/div>';/;

const newContactString = `let contactInput = $('canvaContact').value || 'emlakstudyomtr@gmail.com';
        let contact = \`<div style="line-height:1;"><img src="assets/logo/logo-icon.png" style="height:6em; width:6em; object-fit:contain; vertical-align:middle; margin-left:-2.2em; margin-right:-1.8em; margin-top:-2.5em; margin-bottom:-2.5em; pointer-events:none;"> <span style="vertical-align:middle; position:relative; z-index:2;">\${contactInput}</span></div>\`;`;

if (oldContactRegex.test(cElit)) {
    cElit = cElit.replace(oldContactRegex, newContactString);
    console.log('Contact dynamic value fixed.');
} else {
    console.log('Contact regex did not match.');
}

// 2. Adjust Canva 2 Layout
const oldCanva2 = "addCanvaItem(`<div style=\"font-weight:900;margin-bottom:10px\">DAHA FAZLA BİLGİ İÇİN</div><div>${contact}</div>`, 1150, 770, 30, '#18181b', 'rgba(245,158,11,0.15)', 16, 20, 650, 'right');";
const newCanva2 = "addCanvaItem(`<div style=\"font-weight:900;margin-bottom:10px;padding-top:10px;\">DAHA FAZLA BİLGİ İÇİN</div><div style=\"padding-bottom:15px;\">${contact}</div>`, 1220, 830, 30, '#18181b', 'rgba(245,158,11,0.15)', 16, 20, 600, 'right');";

if (cElit.includes(oldCanva2)) {
    cElit = cElit.replace(oldCanva2, newCanva2);
    console.log('Canva 2 layout updated.');
} else {
    console.log('Canva 2 layout string not found.');
}

fs.writeFileSync('tpl_elit/elit.js', cElit);
console.log('Done.');
