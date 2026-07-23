const fs = require('fs');
let c = fs.readFileSync('tpl_kolaj/kolaj.js', 'utf8');

// 1. Remove the edit-hint blue bar
const blueBar = '<div class="edit-hint">📸 Alt+Sürükle: Taşı | Alt+Köşe: Boyutlandır | Tekerlek: Zoom | Sürükle: Kaydır | <b>Yazıya çift tık: Düzenle</b></div>\'+\n';
c = c.replace(blueBar, '');
// Fallback if newline is different
c = c.replace('<div class="edit-hint">📸 Alt+Sürükle: Taşı | Alt+Köşe: Boyutlandır | Tekerlek: Zoom | Sürükle: Kaydır | <b>Yazıya çift tık: Düzenle</b></div>\'+', '');

// 2. Change the yellow and red buttons to match application colors
c = c.replace(
    '\'<button class="btn-action" style="background:#f59e0b;color:#000;font-weight:900;" onclick="_kolajGeriAl()">↩️ Geri Al</button>\'+',
    '\'<button class="btn-action btn-blue" onclick="_kolajGeriAl()">↩️ Geri Al</button>\'+'
);
c = c.replace(
    '\'<button class="btn-action" style="background:#ef4444;color:#fff;font-weight:900;" onclick="_kolajSifirla()">🔄 Sıfırla</button>\'+',
    '\'<button class="btn-action btn-purple" onclick="_kolajSifirla()">🔄 Sıfırla</button>\'+'
);

// 3. Fix Kolaj 10 (Elmas Magazine) price overlap
c = c.replace(
    '_yazi(3, 82, 94, 16,',
    '_yazi(3, 82, 79, 16,' // Reduced width from 94% to 79% so it doesn't go under the right photos
);

fs.writeFileSync('tpl_kolaj/kolaj.js', c);
console.log('Kolaj UI fixes applied successfully');
