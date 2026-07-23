const fs = require('fs');

const funcNames = ['sleep', 'hexToRgb', 'rgbToHex', 'rgbToHslFast', 'hslToRgbFast', 'hue2rgb', 'getColorCategory'];

const core = fs.readFileSync('core.js', 'utf8');

let utilsContent = `/**
 * ============================================
 * UTILS MODULE
 * Temel yardımcı fonksiyonlar
 * ============================================
 * 
 * Bağımlılıklar:
 * - Yok
 * 
 * Kullanılan yerler:
 * - modules/colors.js
 * - core/drag.js
 * - main.js
 */\n\n`;

for (let name of funcNames) {
    const regex = new RegExp(`function\\s+${name}\\s*\\([\\s\\S]*?^}`, 'm');
    const match = core.match(regex);
    if (match) {
        utilsContent += match[0] + '\n\n';
    } else {
        console.log(`Fonksiyon bulunamadı: ${name}`);
    }
}

fs.writeFileSync('core/utils.js', utilsContent);
console.log('utils.js oluşturuldu.');
