const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core/drag.js';
let code = fs.readFileSync(file, 'utf8');

const moveSearch = `            const deltaX = (c.clientX - sx) / scaleFactor;
            const deltaY = (c.clientY - sy) / scaleFactor;
            
            el.style.left = (il + deltaX) + 'px';
            el.style.top = (it + deltaY) + 'px';`;

const moveReplace = `            const deltaX = (c.clientX - sx) / scaleFactor;
            const deltaY = (c.clientY - sy) / scaleFactor;
            
            let newL = il + deltaX;
            let newT = it + deltaY;
            if(typeof window.getSnapGuides === 'function') {
                // Sadece draw sekmesindeyse veya global bir ayarsa:
                // Şimdilik sadece tekli seçimde snap yapalım
                if(!window.selectedElements || window.selectedElements.length <= 1) {
                    const snap = window.getSnapGuides(newL, newT, el);
                    newL = snap.x;
                    newT = snap.y;
                    if(typeof window.drawSnapGuides === 'function') window.drawSnapGuides(snap.guides);
                }
            }
            
            el.style.left = newL + 'px';
            el.style.top = newT + 'px';`;

const upSearch = `    function up(){
        if(!dragging && !resizing)return;
        dragging=false;
        resizing=false;`;

const upReplace = `    function up(){
        if(typeof window.clearSnapGuides === 'function') window.clearSnapGuides();
        if(!dragging && !resizing)return;
        dragging=false;
        resizing=false;`;

let modified = false;

if(code.includes(moveSearch) && !code.includes('newL = snap.x;')) {
    code = code.replace(moveSearch, moveReplace);
    modified = true;
}

if(code.includes(upSearch) && !code.includes('clearSnapGuides()')) {
    code = code.replace(upSearch, upReplace);
    modified = true;
}

if(modified) {
    fs.writeFileSync(file, code, 'utf8');
    console.log('Patched drag.js with snap logic');
} else {
    console.log('drag.js already patched or string not found');
}
