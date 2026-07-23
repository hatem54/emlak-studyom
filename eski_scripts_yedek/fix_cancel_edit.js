const fs = require('fs');
let drawJs = fs.readFileSync('modules/draw.js', 'utf8');

if (!drawJs.includes('selectedDrawIndex=-1;')) {
    drawJs = drawJs.replace('editingDrawIndex=-1;', 'editingDrawIndex=-1;\n    selectedDrawIndex=-1;\n    redrawAll();');
    fs.writeFileSync('modules/draw.js', drawJs, 'utf8');
    console.log('Successfully added selectedDrawIndex=-1; to cancelDrawEdit');
} else {
    console.log('Already added.');
}
