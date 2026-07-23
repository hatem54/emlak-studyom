const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/modules/draw.js';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `drawPaths.push({
                    type: pObj.type,
                    color: pObj.color,
                    fillOpacity: pObj.fillOpacity,
                  hasSaber: false,`;

const replacementStr = `drawPaths.push({
                    type: pObj.type,
                    color: pObj.color,
                    fillOpacity: pObj.fillOpacity,
                  hasSaber: false,
                  points: pObj.points,
                  x1: pObj.x1,
                  y1: pObj.y1,
                  x2: pObj.x2,
                  y2: pObj.y2,`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacementStr);
    code = code.replace(targetStr, replacementStr); // in case there are multiple
    fs.writeFileSync(file, code);
    console.log("Patched drawPaths.push successfully!");
} else {
    console.log("Could not find target string.");
}
