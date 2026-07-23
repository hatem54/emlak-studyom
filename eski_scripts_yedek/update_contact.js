const fs = require('fs');
let c = fs.readFileSync('tpl_elit/elit.js', 'utf8');

const oldHtml = `contact = '<img src="assets/logo/logo-icon.jpg" style="height:1.6em; vertical-align:middle; margin-right:10px; margin-bottom:4px; mix-blend-mode: multiply; border-radius: 4px;"> <span style="vertical-align:middle;">Emlak Stüdyom | emlakstudyomtr@gmail.com</span>';`;

const newHtml = `contact = '<div><img src="assets/logo/logo-icon.jpg" style="height:1.6em; vertical-align:middle; margin-right:10px; margin-bottom:4px; mix-blend-mode: multiply; border-radius: 4px;"> <span style="vertical-align:middle;">Emlak Stüdyom | emlakstudyomtr@gmail.com</span></div>';`;

if (c.includes(oldHtml)) {
    c = c.replace(oldHtml, newHtml);
    fs.writeFileSync('tpl_elit/elit.js', c);
    console.log('Update successful.');
} else {
    console.log('Old HTML not found. Applying fallback replacement...');
    const fallbackRegex = /contact = '<img src="assets\/logo\/logo-icon\.jpg"[\s\S]*?<\/span>';/;
    c = c.replace(fallbackRegex, newHtml);
    fs.writeFileSync('tpl_elit/elit.js', c);
    console.log('Fallback update applied.');
}
