const fs = require('fs');

let content = fs.readFileSync('tpl_elit/elit.js', 'utf8');

// The original lines for canva1 are:
//         addCanvaItem('LÜKS YAŞAM', 80, 80, 36, '#4a3b32', 'transparent', 0, 0);
//         addCanvaItem(title, 80, 140, 85, '#2c1e15', 'transparent', 0, 0, 650);
//         addCanvaItem(price, 80, 380, 54, '#b45309', 'transparent', 0, 0);
//         addCanvaItem(feats, 80, 510, 28, '#4a3b32', 'transparent', 16, 0, 640);
//         addCanvaItem(contact, 80, 980, 26, '#2c1e15', 'transparent', 0, 0);

// We want to replace these exact 5 lines with:
const c1Orig = `        addCanvaItem('LÜKS YAŞAM', 80, 80, 36, '#4a3b32', 'transparent', 0, 0);
        addCanvaItem(title, 80, 140, 85, '#2c1e15', 'transparent', 0, 0, 650);
        addCanvaItem(price, 80, 380, 54, '#b45309', 'transparent', 0, 0);
        addCanvaItem(feats, 80, 510, 28, '#4a3b32', 'transparent', 16, 0, 640);
        addCanvaItem(contact, 80, 980, 26, '#2c1e15', 'transparent', 0, 0);`;

const c1New = `        addCanvaItem('LÜKS YAŞAM', 80, 60, 50, '#4a3b32', 'transparent', 0, 0);
        addCanvaItem(title, 80, 130, 110, '#2c1e15', 'transparent', 0, 0, 650);
        addCanvaItem(price, 80, 400, 75, '#b45309', 'transparent', 0, 0);
        addCanvaItem(feats, 80, 530, 42, '#4a3b32', 'transparent', 16, 0, 640);
        addCanvaItem(contact, 80, 980, 36, '#2c1e15', 'transparent', 0, 0);`;

if(content.includes(c1Orig)) {
    content = content.replace(c1Orig, c1New);
    console.log("canvaE1 (Bej Gri Modern Konut) maxed successfully.");
} else {
    console.log("Error finding canvaE1 original text!");
}

// The original lines for canva7 are:
//         <div class="royal-crown" style="position:absolute;top:${scaleY(60)}px;left:${scaleX(60)}px;font-size:${scaleSize(50)}px;z-index:6;filter:drop-shadow(0 5px 15px rgba(251,191,36,.5))">👑</div>
//     </div>`;
// addCanvaItem('◆ EXCLUSIVE', 80, 180, 26, '#fbbf24', 'transparent', 0, 0);
// addCanvaItem(title, 80, 230, 72, '#ffffff', 'transparent', 0, 0, 640);
// addCanvaItem(price, 80, 470, 56, '#fef08a', 'rgba(0,0,0,0.35)', 12, 20, 620);
// addCanvaItem(feats, 80, 610, 26, '#fecaca', 'transparent', 0, 0, 620);
// addCanvaItem('✆ ' + contact, 80, 960, 22, '#fbbf24', 'transparent', 0, 0);

const c7Orig = `                <div class="royal-crown" style="position:absolute;top:\${scaleY(60)}px;left:\${scaleX(60)}px;font-size:\${scaleSize(50)}px;z-index:6;filter:drop-shadow(0 5px 15px rgba(251,191,36,.5))">👑</div>
            </div>\`;
        addCanvaItem('◆ EXCLUSIVE', 80, 180, 26, '#fbbf24', 'transparent', 0, 0);
        addCanvaItem(title, 80, 230, 72, '#ffffff', 'transparent', 0, 0, 640);
        addCanvaItem(price, 80, 470, 56, '#fef08a', 'rgba(0,0,0,0.35)', 12, 20, 620);
        addCanvaItem(feats, 80, 610, 26, '#fecaca', 'transparent', 0, 0, 620);
        addCanvaItem('✆ ' + contact, 80, 960, 22, '#fbbf24', 'transparent', 0, 0);`;

const c7New = `                <div class="royal-crown" style="position:absolute;top:\${scaleY(60)}px;left:\${scaleX(60)}px;font-size:\${scaleSize(90)}px;z-index:6;filter:drop-shadow(0 5px 15px rgba(251,191,36,.5))">👑</div>
            </div>\`;
        addCanvaItem('◆ EXCLUSIVE', 80, 170, 40, '#fbbf24', 'transparent', 0, 0);
        addCanvaItem(title, 80, 240, 110, '#ffffff', 'transparent', 0, 0, 640);
        addCanvaItem(price, 80, 500, 75, '#fef08a', 'rgba(0,0,0,0.35)', 12, 20, 620);
        addCanvaItem(feats, 80, 640, 40, '#fecaca', 'transparent', 0, 0, 620);
        addCanvaItem('✆ ' + contact, 80, 960, 36, '#fbbf24', 'transparent', 0, 0);`;

if(content.includes(c7Orig)) {
    content = content.replace(c7Orig, c7New);
    console.log("canvaE7 (Bordo Kraliyet) maxed successfully.");
} else {
    console.log("Error finding canvaE7 original text!");
}

fs.writeFileSync('tpl_elit/elit.js', content, 'utf8');
