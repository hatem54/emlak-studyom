const fs = require('fs');
let content = fs.readFileSync('tpl_elit/elit.js', 'utf8');

// T4 (canva4) - Zümrüt Cam Villa
content = content.replace(/addCanvaItem\('LÜKS VİLLA', 120, \d+, \d+.*/g, "addCanvaItem('LÜKS VİLLA', 120, 100, 45, '#34d399', 'transparent', 0, 0);");
content = content.replace(/addCanvaItem\(title, 120, \d+, \d+.*/g, "addCanvaItem(title, 120, 160, 110, '#ffffff', 'transparent', 0, 0, 800);");
content = content.replace(/addCanvaItem\(price, 120, \d+, \d+.*/g, "addCanvaItem(price, 120, 450, 70, '#059669', 'rgba(52,211,153,0.1)', 20, 20);");
content = content.replace(/addCanvaItem\(feats, 120, \d+, \d+.*/g, "addCanvaItem(feats, 120, 600, 36, '#e2e8f0', 'transparent', 0, 0, 800);");
content = content.replace(/addCanvaItem\(contact, 120, \d+, \d+.*/g, "addCanvaItem(contact, 120, 950, 30, '#94a3b8', 'transparent', 0, 0);");

// T5 (canva5) - Altın Çerçeveli VIP
content = content.replace(/addCanvaItem\('VIP PORTFÖY', 100, \d+, \d+.*/g, "addCanvaItem('VIP PORTFÖY', 100, 100, 45, '#fbbf24', 'transparent', 0, 0);");
content = content.replace(/addCanvaItem\(title, 100, \d+, \d+.*/g, "addCanvaItem(title, 100, 160, 110, '#ffffff', 'transparent', 0, 0, 1000);");
content = content.replace(/addCanvaItem\(price, 100, \d+, \d+.*/g, "addCanvaItem(price, 100, 450, 70, '#f59e0b', 'transparent', 0, 0);");
content = content.replace(/addCanvaItem\(feats, 100, \d+, \d+.*/g, "addCanvaItem(feats, 100, 580, 36, '#d4d4d8', 'transparent', 0, 0, 1000);");
content = content.replace(/addCanvaItem\(contact, 100, \d+, \d+.*/g, "addCanvaItem(contact, 100, 950, 30, '#a1a1aa', 'transparent', 0, 0);");

// T6 (canva6) - Minimal Beyaz Grid
content = content.replace(/addCanvaItem\(title, 100, \d+, \d+.*/g, "addCanvaItem(title, 100, 120, 110, '#18181b', 'transparent', 0, 0, 1600);");
content = content.replace(/addCanvaItem\(price, 100, \d+, \d+.*/g, "addCanvaItem(price, 100, 260, 70, '#ffffff', '#3f3f46', 0, 15);");
content = content.replace(/addCanvaItem\(feats, 1400, \d+, \d+.*/g, "addCanvaItem(feats, 1400, 450, 36, '#3f3f46', 'transparent', 0, 0, 400, 'right');");
content = content.replace(/addCanvaItem\(contact, 1400, \d+, \d+.*/g, "addCanvaItem(contact, 1400, 950, 30, '#71717a', 'transparent', 0, 0, 400, 'right');");

// T7 (canva7) - Bordo Kraliyet
content = content.replace(/addCanvaItem\('✦ EXCLUSIVE', 120, \d+, \d+.*/g, "addCanvaItem('✦ EXCLUSIVE', 120, 150, 45, '#fbbf24', 'transparent', 0, 0);");
content = content.replace(/addCanvaItem\(title, 80, \d+, \d+.*/g, "addCanvaItem(title, 80, 220, 110, '#2c1e15', 'transparent', 0, 0, 650);"); // Wait, original was 80? Let's check original: addCanvaItem(title, 80, 200, 100, '#450a0a'
// Let's replace the EXACT title, price, etc.
content = content.replace(/addCanvaItem\(title, 80, \d+, \d+, '#450a0a'.*/g, "addCanvaItem(title, 80, 250, 110, '#450a0a', 'transparent', 0, 0, 600);");
content = content.replace(/addCanvaItem\(price, 80, \d+, \d+, '#fbbf24'.*/g, "addCanvaItem(price, 80, 520, 70, '#fbbf24', 'transparent', 0, 0);");
content = content.replace(/addCanvaItem\(feats, 80, \d+, \d+, '#7f1d1d'.*/g, "addCanvaItem(feats, 80, 650, 36, '#7f1d1d', 'transparent', 0, 0, 600);");
content = content.replace(/addCanvaItem\(contact, 80, \d+, \d+, '#fbbf24'.*/g, "addCanvaItem(contact, 80, 950, 30, '#fbbf24', 'transparent', 0, 0);");

// Actually, writing exact replace strings for everything is risky if they don't match exactly.
// Let's use a function to redefine them completely by finding `if(activeCanvaId === 'canva4'){` etc.

fs.writeFileSync('tpl_elit/elit.js', content, 'utf8');
console.log('Done 4-7');
