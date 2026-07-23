const fs = require('fs');

// 1. Update app.html
let html = fs.readFileSync('app.html', 'utf8');
const oldLine = 'const availableW = window.innerWidth - 40;';
const newLine = 'const availableW = window.innerWidth - 0; // zero padding for full width';

if (html.includes(oldLine)) {
    html = html.replace(oldLine, newLine);
    fs.writeFileSync('app.html', html, 'utf8');
    console.log('Updated app.html');
} else {
    console.log('Line not found in app.html');
}

// 2. Update core.js
let corejs = fs.readFileSync('core.js', 'utf8');
const oldLineCore = 'const availableW = pa.clientWidth - 40; // padding';
const newLineCore = 'const availableW = pa.clientWidth - 0; // padding';

if (corejs.includes(oldLineCore)) {
    corejs = corejs.replace(oldLineCore, newLineCore);
    fs.writeFileSync('core.js', corejs, 'utf8');
    console.log('Updated core.js');
} else {
    console.log('Line not found in core.js');
}
