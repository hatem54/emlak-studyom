const fs = require('fs');
let content = fs.readFileSync('tpl_elit/elit.js', 'utf8');

// Replace canvaE1 block
const c1Regex = /addCanvaItem\('LÜKS YAŞAM'[\s\S]*?addCanvaItem\(contact,\s*80,\s*980,\s*26,\s*'#2c1e15',\s*'transparent',\s*0,\s*0\);/m;
const c1New = `addCanvaItem('LÜKS YAŞAM', 80, 60, 50, '#4a3b32', 'transparent', 0, 0);
        addCanvaItem(title, 80, 130, 110, '#2c1e15', 'transparent', 0, 0, 650);
        addCanvaItem(price, 80, 400, 75, '#b45309', 'transparent', 0, 0);
        addCanvaItem(feats, 80, 530, 42, '#4a3b32', 'transparent', 16, 0, 640);
        addCanvaItem(contact, 80, 980, 36, '#2c1e15', 'transparent', 0, 0);`;

if (c1Regex.test(content)) {
    content = content.replace(c1Regex, c1New);
    console.log("canvaE1 (Bej Gri Modern Konut) maxed successfully.");
} else {
    console.log("canvaE1 regex didn't match");
}

// Replace canvaE7 block
const c7Regex = /<div class="royal-crown" style="position:absolute;top:\$\{scaleY\(60\)\}px;left:\$\{scaleX\(60\)\}px;font-size:\$\{scaleSize\(50\)\}px;z-index:6;filter:drop-shadow\(0 5px 15px rgba\(251,191,36,\.5\)\)">👑<\/div>[\s\S]*?addCanvaItem\('✆ ' \+ contact,\s*80,\s*960,\s*22,\s*'#fbbf24',\s*'transparent',\s*0,\s*0\);/m;
const c7New = `<div class="royal-crown" style="position:absolute;top:\${scaleY(60)}px;left:\${scaleX(60)}px;font-size:\${scaleSize(90)}px;z-index:6;filter:drop-shadow(0 5px 15px rgba(251,191,36,.5))">👑</div>
            </div>\`;
        addCanvaItem('◆ EXCLUSIVE', 80, 170, 40, '#fbbf24', 'transparent', 0, 0);
        addCanvaItem(title, 80, 240, 110, '#ffffff', 'transparent', 0, 0, 640);
        addCanvaItem(price, 80, 500, 75, '#fef08a', 'rgba(0,0,0,0.35)', 12, 20, 620);
        addCanvaItem(feats, 80, 640, 40, '#fecaca', 'transparent', 0, 0, 620);
        addCanvaItem('✆ ' + contact, 80, 960, 36, '#fbbf24', 'transparent', 0, 0);`;

if (c7Regex.test(content)) {
    content = content.replace(c7Regex, c7New);
    console.log("canvaE7 (Bordo Kraliyet) maxed successfully.");
} else {
    console.log("canvaE7 regex didn't match");
}

fs.writeFileSync('tpl_elit/elit.js', content, 'utf8');
