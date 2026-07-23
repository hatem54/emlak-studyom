const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/modules/draw.js';
let code = fs.readFileSync(file, 'utf8');

const moveSearch = `    const p=canvasXY(e.touches?e.touches[0]:e);`;
const moveReplace = `    let p=canvasXY(e.touches?e.touches[0]:e);
    if(drawMode !== 'free' && typeof window.getSnapGuides === 'function') {
        const snapResult = window.getSnapGuides(p.x, p.y, null);
        p.x = snapResult.x;
        p.y = snapResult.y;
        if(typeof window.drawSnapGuides === 'function') window.drawSnapGuides(snapResult.guides);
    }`;

const endSearch = `    isDrawing=false;
    const s=getDS();`;
const endReplace = `    isDrawing=false;
    if(typeof window.clearSnapGuides === 'function') window.clearSnapGuides();
    const s=getDS();`;

let modified = false;

if(code.includes(moveSearch) && !code.includes('window.getSnapGuides(')) {
    code = code.replace(moveSearch, moveReplace);
    modified = true;
}

if(code.includes(endSearch) && !code.includes('clearSnapGuides()')) {
    code = code.replace(endSearch, endReplace);
    modified = true;
}

if(modified) {
    fs.writeFileSync(file, code, 'utf8');
    console.log('Patched draw.js with snap logic');
} else {
    console.log('draw.js already patched or string not found');
}
