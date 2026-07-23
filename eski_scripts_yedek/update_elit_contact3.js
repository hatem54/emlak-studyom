const fs = require('fs');

let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

const oldHtml = 'contact = \'<div><img src="assets/logo/logo-icon.png" style="height:6em; width:6em; object-fit:contain; vertical-align:middle; margin-left:-2em; margin-right:-1.8em; margin-bottom:6px;"> <span style="vertical-align:middle; position:relative; z-index:2;">emlakstudyomtr@gmail.com</span></div>\';';

const newHtml = 'contact = \'<div style="line-height:1;"><img src="assets/logo/logo-icon.png" style="height:6em; width:6em; object-fit:contain; vertical-align:middle; margin-left:-2.2em; margin-right:-1.8em; margin-top:-2.5em; margin-bottom:-2.5em; pointer-events:none;"> <span style="vertical-align:middle; position:relative; z-index:2;">emlakstudyomtr@gmail.com</span></div>\';';

if (cElit.includes(oldHtml)) {
    cElit = cElit.replace(oldHtml, newHtml);
    fs.writeFileSync('tpl_elit/elit.js', cElit);
    console.log('Update successful.');
} else {
    console.log('Old HTML not found. Fallback not implemented.');
}
