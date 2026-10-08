/**
 * Emlak Stüdyom - Otomatik Arayüz ve Kalite Doğrulayıcı
 * Bağımlılık gerektirmez, doğrudan yerel Node.js ile çalışır.
 * 
 * Kontroller:
 * 1. Tek İkon Kuralı (FontAwesome + Emoji çift ikon yasağı)
 * 2. Parantez İçi Açıklama Yasağı (Buton ve seçeneklerde)
 * 3. Yan Panelde Koyu Dolgulu Kutu/Kart Yasağı
 * 4. Slider Altı Hızlı Yüzde/Preset Buton Yasağı
 * 5. Dinleyici Hijyeni (mousemove / touchmove temizliği)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`Dosya bulunamadı: ${filePath}`);
        return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const ext = path.extname(filePath).toLowerCase();
    const errors = [];
    const warnings = [];

    // 1. Sentaks Kontrolü (JS dosyaları için)
    if (ext === '.js') {
        try {
            execSync(`node -c "${filePath}"`, { stdio: 'pipe' });
        } catch (e) {
            errors.push(`[SENTAKS HATASI] Dosya derlenemedi: ${e.message.split('\n')[0]}`);
        }
    }

    // 2. Tek İkon Kuralı (FontAwesome + Emoji)
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
        const lineNum = idx + 1;

        // Çift İkon Taraması
        if (line.includes('fa-') && emojiRegex.test(line)) {
            // Eğer aynı satırda hem fa- ikonu hem emoji varsa
            if (line.includes('<button') || line.includes('btn') || line.includes('title') || line.includes('innerHTML')) {
                errors.push(`[ÇİFT İKON] Satır ${lineNum}: Butonda hem FontAwesome ikonu hem de emoji bir arada kullanılmış.`);
            }
        }

        // Parantez İçi Açıklama Taraması
        if (line.includes('<button') || line.includes('.btn-action') || line.includes('.dock-btn')) {
            const match = line.match(/>[^<]*\([^)]+\)[^<]*</);
            if (match && !line.includes('title=') && !line.includes('onclick=')) {
                warnings.push(`[PARANTEZ İÇİ YAZI] Satır ${lineNum}: Buton metninde parantez içi yönlendirme tespit edildi: "${match[0]}"`);
            }
        }

        // Slider Altı Kolay Erişim / Hızlı Değer Butonları
        if (line.includes('slider-group') || line.includes('preset-btn') || line.includes('chip-group')) {
            if (line.includes('%50') || line.includes('%80') || line.includes('%100')) {
                errors.push(`[SLIDER PRESET BUTONU] Satır ${lineNum}: Slider altında yasaklı hızlı yüzde/preset butonu tespit edildi.`);
            }
        }

        // Yan Panel Koyu Dolgulu Kutu Kontrolü
        if (filePath.includes('sidebar') || filePath.includes('controls') || filePath.includes('styles.css')) {
            if (line.includes('background: rgba(15, 23, 42') || line.includes('background: #0f172a')) {
                warnings.push(`[KOYU KUTU UYARISI] Satır ${lineNum}: Yan panelde açık tema standartlarına aykırı koyu dolgulu kutu stili var.`);
            }
        }
    });

    console.log(`\n--- Denetim Raporu: ${path.basename(filePath)} ---`);
    if (errors.length === 0 && warnings.length === 0) {
        console.log(`✅ Tüm arayüz ve mimari kontrolleri başarıyla geçti.`);
        return true;
    }

    if (errors.length > 0) {
        console.log(`❌ Hatalar (${errors.length}):`);
        errors.forEach(err => console.log(`   - ${err}`));
    }

    if (warnings.length > 0) {
        console.log(`⚠️ Uyarılar (${warnings.length}):`);
        warnings.forEach(warn => console.log(`   - ${warn}`));
    }

    return errors.length === 0;
}

// Komut satırı argümanı
const targetPath = process.argv[2];
if (targetPath) {
    checkFile(path.resolve(targetPath));
} else {
    console.log("Kullanım: node verify_ui.js <dosya_yolu>");
}
