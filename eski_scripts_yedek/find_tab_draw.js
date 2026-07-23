const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/app.html', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('id="tab-draw"'));
if(idx !== -1) {
    for(let i=idx; i<idx+60; i++) {
        console.log((i+1) + ': ' + lines[i].trimEnd());
    }
}
