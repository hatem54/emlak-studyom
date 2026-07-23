const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core.js';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `window.drawSnapGuides = function(guides) {
    const container = document.getElementById('photo-layer') || document.body;`;
const replaceStr = `window.drawSnapGuides = function(guides) {
    const container = document.getElementById('canvas-container') || document.body;`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replaceStr);
    fs.writeFileSync(file, code);
    console.log("Patched snap guides container successfully!");
} else {
    console.log("Could not find target string in core.js. Maybe it was already changed?");
}
