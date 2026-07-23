const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/modules/draw.js';
let code = fs.readFileSync(file, 'utf8');

const target = `const p=canvasXY(e.touches?e.touches[0]:e);`;
const replace = `let p=canvasXY(e.touches?e.touches[0]:e);
    if(drawMode !== 'free' && typeof window.getSnapGuides === 'function' && isDrawing) {
        const snapResult = window.getSnapGuides(p.x, p.y, null);
        p.x = snapResult.x;
        p.y = snapResult.y;
        if(typeof window.drawSnapGuides === 'function') window.drawSnapGuides(snapResult.guides);
    }`;

if(code.includes(target)) {
    code = code.replace(target, replace);
    fs.writeFileSync(file, code, 'utf8');
    console.log('Patched dMove with snap logic (using short target)');
} else {
    console.log('Target string not found');
}
