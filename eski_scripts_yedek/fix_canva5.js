const fs = require('fs');
let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

const targetLines = `    // Sağ bölüm: Özellikler
    addCanvaItem(feats, infoX + 925, infoY + 30, 24, '#e5e5e5', 'transparent', 0, 0, 750);
    
    // Alt ayırıcı çizgi
    addCanvaPanel(infoX + 50, infoY + 180, 1660, 1, 
        'rgba(251,191,36,0.3)', 0, null, null);
    
    // İletişim (alt orta)
    addCanvaItem('✆ ' + contact, infoX + 50, infoY + 190, 20, '#fbbf24', 'transparent', 0, 0, 1660, 'center');`;

const replaceLines = `    // Sağ bölüm: Özellikler
    addCanvaItem(feats, infoX + 925, infoY + 20, 22, '#e5e5e5', 'transparent', 0, 0, 750);
    
    // Alt ayırıcı çizgi
    addCanvaPanel(infoX + 50, infoY + 170, 1660, 1, 
        'rgba(251,191,36,0.3)', 0, null, null);
    
    // İletişim (alt sağ)
    addCanvaItem(contact, infoX + 50, infoY + 185, 20, '#fbbf24', 'transparent', 0, 0, 1660, 'right');`;

if (cElit.includes(targetLines)) {
    cElit = cElit.replace(targetLines, replaceLines);
    fs.writeFileSync('tpl_elit/elit.js', cElit);
    console.log("Fixed canva5 layout successfully!");
} else {
    console.log("Could not find the exact target lines for canva5.");
}
