const fs = require('fs');

let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

const oldHtml = 'contact = \'<div style="display:inline-block;"><img src="assets/logo/logo-icon.png" style="height:3.5em; vertical-align:middle; margin-right:10px; margin-bottom:4px;"> <span style="vertical-align:middle;">Emlak Stüdyom | emlakstudyomtr@gmail.com</span></div>\';';

const newHtml = 'contact = \'<div style="display:inline-block;"><img src="assets/logo/logo-icon.png" style="height:5em; vertical-align:middle; margin-right:2px; margin-bottom:4px;"> <span style="vertical-align:middle;">emlakstudyomtr@gmail.com</span></div>\';';

if (cElit.includes(oldHtml)) {
    cElit = cElit.replace(oldHtml, newHtml);
    fs.writeFileSync('tpl_elit/elit.js', cElit);
    console.log('Update successful.');
} else {
    console.log('Old HTML not found. Applying fallback replacement...');
    const fallbackRegex = /contact = '<div style="display:inline-block;"><img src="assets\/logo\/logo-icon\.png"[\s\S]*?<\/div>';/;
    cElit = cElit.replace(fallbackRegex, newHtml);
    fs.writeFileSync('tpl_elit/elit.js', cElit);
    console.log('Fallback update applied.');
}
