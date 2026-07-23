const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/modules/draw.js';
let code = fs.readFileSync(file, 'utf8');

const moveSearch = `                    function onMove(me) {
                        const dx = (me.clientX - startX) / sFactor / scaleX;
                        const dy = (me.clientY - startY) / sFactor / scaleY;
                        pt.x = startPtX + dx;
                        pt.y = startPtY + dy;
                        handle.style.left = (pt.x / baseW * 100) + '%';
                        handle.style.top = (pt.y / baseH * 100) + '%';
                        polygon.setAttribute('points', points.map(p => \`\${p.x},\${p.y}\`).join(' '));
                    }`;

const moveReplace = `                    function onMove(me) {
                        const dx = (me.clientX - startX) / sFactor / scaleX;
                        const dy = (me.clientY - startY) / sFactor / scaleY;
                        let newX = startPtX + dx;
                        let newY = startPtY + dy;
                        
                        if(typeof window.getSnapGuides === 'function') {
                            const snap = window.getSnapGuides(newX, newY, null);
                            newX = snap.x;
                            newY = snap.y;
                            if(typeof window.drawSnapGuides === 'function') window.drawSnapGuides(snap.guides);
                        }
                        
                        pt.x = newX;
                        pt.y = newY;
                        handle.style.left = (pt.x / baseW * 100) + '%';
                        handle.style.top = (pt.y / baseH * 100) + '%';
                        polygon.setAttribute('points', points.map(p => \`\${p.x},\${p.y}\`).join(' '));
                    }`;

const upSearch = `                    function onUp() {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    }`;

const upReplace = `                    function onUp() {
                        if(typeof window.clearSnapGuides === 'function') window.clearSnapGuides();
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    }`;

let modified = false;

if(code.includes(moveSearch) && !code.includes('window.getSnapGuides(newX, newY')) {
    code = code.replace(moveSearch, moveReplace);
    modified = true;
}

if(code.includes(upSearch) && !code.includes('clearSnapGuides()')) {
    code = code.replace(upSearch, upReplace);
    modified = true;
}

if(modified) {
    fs.writeFileSync(file, code, 'utf8');
    console.log('Patched draw.js with snap logic for vertex handles');
} else {
    console.log('draw.js vertex handle already patched or string not found');
}
