const fs = require('fs');
let code = fs.readFileSync('modules/draw.js', 'utf8');
const match = code.match(/function setDrawMode\(mode\)/);
if (match) {
    console.log('Found in modules/draw.js');
} else {
    console.log('Not in modules/draw.js');
}
