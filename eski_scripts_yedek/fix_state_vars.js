const fs = require('fs');
let drawJs = fs.readFileSync('modules/draw.js', 'utf8');

const stateVars = `let selectedDrawIndex = -1;
let dragMode = null;
let dragVertexIndex = -1;
let dragStartX = 0;
let dragStartY = 0;
let initialPathState = null;
`;

if (!drawJs.includes('let selectedDrawIndex = -1;')) {
    drawJs = stateVars + '\n' + drawJs;
    fs.writeFileSync('modules/draw.js', drawJs, 'utf8');
    console.log('Successfully injected state vars into draw.js');
} else {
    console.log('Already injected.');
}
