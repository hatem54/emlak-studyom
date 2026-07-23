const fs = require('fs');

// app.html
let cApp = fs.readFileSync('app.html', 'utf8');
cApp = cApp.replace(/height="55"/g, 'height="120"');
cApp = cApp.replace(/\?v=3\.\d+/g, '?v=3.' + Math.floor(Date.now()/1000));
fs.writeFileSync('app.html', cApp);
console.log('app.html updated');

// index.html
let cIndex = fs.readFileSync('index.html', 'utf8');
cIndex = cIndex.replace(/height="68"/g, 'height="150"').replace(/height="35"/g, 'height="80"');
cIndex = cIndex.replace(/\?v=3\.\d+/g, '?v=3.' + Math.floor(Date.now()/1000));
fs.writeFileSync('index.html', cIndex);
console.log('index.html updated');

// elit.js
let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');
cElit = cElit.replace(/height:1\.6em/g, 'height:3.5em');
fs.writeFileSync('tpl_elit/elit.js', cElit);
console.log('elit.js updated');
