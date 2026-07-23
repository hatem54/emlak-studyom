const fs = require('fs');
let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

const targetStr = `    addCanvaPanel(80, 80, 820, 180, 'rgba(255,255,255,0.12)', 20, '1px solid rgba(255,255,255,0.25)', '0 20px 50px rgba(0,0,0,0.3)');
    
    // ✅ Alt panel: Üst panelle aynı açık tonlu buzlu cam
    addCanvaPanel(80, 850, 1760, 180, 'rgba(255,255,255,0.12)', 24, '1px solid rgba(255,255,255,0.25)', '0 20px 50px rgba(0,0,0,0.4)');
    
    // Mavi iletişim şeridi
    addCanvaPanel(1230, 970, 590, 50, 'rgba(56,189,248,0.85)', 12, '1px solid rgba(125,211,252,0.6)', '0 10px 30px rgba(0,0,0,0.3)');
    
    addCanvaItem(title, 110, 115, 60, '#ffffff', 'transparent', 0, 0, 760);
    addCanvaItem(price, 110, 205, 40, '#38bdf8', 'transparent', 0, 0, 760);
    addCanvaItem(feats, 120, 865, 24, '#f1f5f9', 'transparent', 0, 0, 1100);
    addCanvaItem(contact, 1250, 980, 24, '#0f172a', 'transparent', 0, 0, 550, 'center');`;

const replaceStr = `    // Sol üst başlık çerçevesi (sadece başlığa orantılı)
    addCanvaPanel(80, 80, 860, 140, 'rgba(255,255,255,0.12)', 20, '1px solid rgba(255,255,255,0.25)', '0 20px 50px rgba(0,0,0,0.3)');
    
    // Sağ üst fiyat çerçevesi (yeni)
    addCanvaPanel(1240, 80, 600, 140, 'rgba(255,255,255,0.12)', 20, '1px solid rgba(255,255,255,0.25)', '0 20px 50px rgba(0,0,0,0.3)');
    
    // ✅ Alt panel: Özelliklerin sığması için daha yüksek (240px)
    addCanvaPanel(80, 800, 1760, 240, 'rgba(255,255,255,0.12)', 24, '1px solid rgba(255,255,255,0.25)', '0 20px 50px rgba(0,0,0,0.4)');
    
    // Mavi iletişim şeridi (yukarıdaki büyümeye göre hizalandı)
    addCanvaPanel(1230, 960, 590, 50, 'rgba(56,189,248,0.85)', 12, '1px solid rgba(125,211,252,0.6)', '0 10px 30px rgba(0,0,0,0.3)');
    
    addCanvaItem(title, 110, 110, 64, '#ffffff', 'transparent', 0, 0, 800);
    addCanvaItem(price, 1260, 115, 54, '#38bdf8', 'transparent', 0, 0, 560, 'center');
    addCanvaItem(feats, 120, 830, 28, '#f1f5f9', 'transparent', 0, 0, 1100);
    addCanvaItem(contact, 1250, 970, 24, '#0f172a', 'transparent', 0, 0, 550, 'center');`;

cElit = cElit.replace(targetStr, replaceStr);

fs.writeFileSync('tpl_elit/elit.js', cElit);
console.log("Updated canva8 (Cam Loft) layout!");
