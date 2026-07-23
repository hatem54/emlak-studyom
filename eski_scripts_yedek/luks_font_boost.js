/**
 * Lüks Şablon Font Büyütme Scripti
 * Her şablonun kendi geometrisine göre akıllıca büyütür.
 * Çerçeve yapısına DOKUNULMAZ, sadece font-size değerleri değiştirilir.
 */
const fs = require('fs');

const luks = fs.readFileSync('tpl_luks/luks.js', 'utf8');

// Mevcut variations JSON'ı çıkart
const match = luks.match(/const variations = (\[[\s\S]*?\]);/);
if (!match) { console.error("variations bulunamadı!"); process.exit(1); }

let vars = JSON.parse(match[1]);

// =============================================================
// Her şablon için hedef font boyutları (önceki → sonraki)
// scaleMin(X) değerlerini sırayla güncelliyoruz
// =============================================================

// Lüks 1: Koyu Kraliyet
// badge=24→28, başlık=51→60, fiyat=43→50, contact=20→22, tag=17→19, feats=15→19
vars[0].html = vars[0].html
    .replace('scaleMin(24)}px;color:#d4af37;text-transform:uppercase', 'scaleMin(28)}px;color:#d4af37;text-transform:uppercase')
    .replace('scaleMin(51)}px;color:#fff;font-weight:700;line-height:1;', 'scaleMin(62)}px;color:#fff;font-weight:700;line-height:1;')
    .replace('scaleMin(43)}px;color:#d4af37;font-weight:bold', 'scaleMin(50)}px;color:#d4af37;font-weight:bold')
    .replace('scaleMin(20)}px;color:#d4af37;font-family:Montserrat,sans-serif;margin-bottom', 'scaleMin(22)}px;color:#d4af37;font-family:Montserrat,sans-serif;margin-bottom')
    .replace('scaleMin(17)}px;color:#cbd5e1', 'scaleMin(20)}px;color:#cbd5e1')
    .replace('scaleMin(15)}px;color:#e2e8f0;font-family:Montserrat,sans-serif;line-height:2.2', 'scaleMin(20)}px;color:#e2e8f0;font-family:Montserrat,sans-serif;line-height:2.0')
    .replace('line-height:2;background:rgba(255,255,255,0.05)', 'line-height:1.9;background:rgba(255,255,255,0.05)');

// Lüks 2: Sarı Modern (yatay iki panel)
// tag=19→22, başlık=47→58, fiyat=38→46, feats=15→21, sağ panel=17→22
vars[1].html = vars[1].html
    .replace('scaleMin(19)}px;color:#d4af37;font-family:Montserrat,sans-serif;margin-bottom:${scaleY(5)}px', 'scaleMin(22)}px;color:#d4af37;font-family:Montserrat,sans-serif;margin-bottom:${scaleY(5)}px')
    .replace('scaleMin(47)}px;color:#fff;font-weight:700;line-height:1;', 'scaleMin(58)}px;color:#fff;font-weight:700;line-height:1;')
    .replace('scaleMin(38)}px;color:#d4af37;font-weight:bold', 'scaleMin(46)}px;color:#d4af37;font-weight:bold')
    .replace('scaleMin(15)}px;color:#d4af37;font-family:Montserrat,sans-serif;line-height:1.8', 'scaleMin(21)}px;color:#d4af37;font-family:Montserrat,sans-serif;line-height:1.7')
    .replace('scaleMin(17)}px;color:#fff;font-family:Montserrat,sans-serif;text-align:center', 'scaleMin(22)}px;color:#fff;font-family:Montserrat,sans-serif;text-align:center');

// Lüks 3: SEÇKİN EMLAK (orta kartı)
// badge=20→24, başlık=60→68, fiyat=38→44, feats=19→24
vars[2].html = vars[2].html
    .replace('scaleMin(20)}px;color:#fff;text-transform:uppercase;font-family:Montserrat', 'scaleMin(24)}px;color:#fff;text-transform:uppercase;font-family:Montserrat')
    .replace('scaleMin(60)}px;color:#fff;font-weight:700;line-height:1.1', 'scaleMin(68)}px;color:#fff;font-weight:700;line-height:1.1')
    .replace('scaleMin(38)}px;color:#d4af37;text-align:center', 'scaleMin(46)}px;color:#d4af37;text-align:center')
    .replace('scaleMin(19)}px;color:#d4af37;font-family:Montserrat,sans-serif;line-height:2.0', 'scaleMin(24)}px;color:#d4af37;font-family:Montserrat,sans-serif;line-height:1.9');

// Lüks 4: Bordo (Özel Seri - right side)
// badge=17→21, başlık=43→54, fiyat=30→38, feats=15→21
vars[3].html = vars[3].html
    .replace('scaleMin(17)}px;color:#d4af37;text-transform:uppercase;letter-spacing:4px', 'scaleMin(21)}px;color:#d4af37;text-transform:uppercase;letter-spacing:4px')
    .replace('scaleMin(43)}px;color:#fff;font-weight:700;line-height:1.1;margin-bottom:${scaleY(20)}px;text-shadow', 'scaleMin(54)}px;color:#fff;font-weight:700;line-height:1.1;margin-bottom:${scaleY(20)}px;text-shadow')
    .replace('scaleMin(30)}px;color:#fcd34d', 'scaleMin(38)}px;color:#fcd34d')
    .replace('scaleMin(15)}px;color:#cbd5e1;font-family:Montserrat,sans-serif;line-height:2.2;background:rgba(255,255,255,0.03)', 'scaleMin(21)}px;color:#cbd5e1;font-family:Montserrat,sans-serif;line-height:2.0;background:rgba(255,255,255,0.03)');

// Lüks 5: Yeşil PRO (yatay - fotoğraf sağda)
// badge=17→21, başlık=64→72, fiyat=38→46
vars[4].html = vars[4].html
    .replace('scaleMin(17)}px;color:#fcd34d;font-family:Montserrat,sans-serif;text-transform:uppercase;letter-spacing:4px', 'scaleMin(21)}px;color:#fcd34d;font-family:Montserrat,sans-serif;text-transform:uppercase;letter-spacing:4px')
    .replace('scaleMin(64)}px;color:#fff;font-weight:700;line-height:1.1', 'scaleMin(72)}px;color:#fff;font-weight:700;line-height:1.1')
    .replace('scaleMin(38)}px;color:#fcd34d;font-family:Montserrat,sans-serif;font-weight:300', 'scaleMin(46)}px;color:#fcd34d;font-family:Montserrat,sans-serif;font-weight:300');

// Lüks 6: Pembe Gece (yatay bar)
// başlık=51→60, fiyat=34→42, feats=17→22, ÖZEL TEKLİF=17→20
vars[5].html = vars[5].html
    .replace('scaleMin(51)}px;color:#fff;font-weight:700;line-height:1.1;margin-bottom:${scaleY(15)}px', 'scaleMin(60)}px;color:#fff;font-weight:700;line-height:1.1;margin-bottom:${scaleY(15)}px')
    .replace('scaleMin(34)}px;color:#b76e79;font-family:Montserrat,sans-serif;font-weight:bold', 'scaleMin(42)}px;color:#b76e79;font-family:Montserrat,sans-serif;font-weight:bold')
    .replace('scaleMin(17)}px;color:#e2e8f0;font-family:Montserrat,sans-serif;line-height:2.0', 'scaleMin(22)}px;color:#e2e8f0;font-family:Montserrat,sans-serif;line-height:1.9')
    .replace('scaleMin(17)}px;font-weight:bold;border-radius:8px', 'scaleMin(20)}px;font-weight:bold;border-radius:8px');

// Lüks 7: LÜKS KOLEKSİYON (sol panel kartı)
// badge=20→24, başlık=43→52, fiyat=34→42, feats=15→21
vars[6].html = vars[6].html
    .replace('scaleMin(20)}px;font-family:Montserrat,sans-serif;text-align:center;padding:20px', 'scaleMin(24)}px;font-family:Montserrat,sans-serif;text-align:center;padding:20px')
    .replace('scaleMin(43)}px;color:#fff;font-weight:700;line-height:1.1;margin-bottom:${scaleY(30)}px;text-align:center', 'scaleMin(52)}px;color:#fff;font-weight:700;line-height:1.1;margin-bottom:${scaleY(30)}px;text-align:center')
    .replace('scaleMin(34)}px;color:#d4af37;font-weight:bold;margin-bottom:${scaleY(40)}px;text-align:center', 'scaleMin(42)}px;color:#d4af37;font-weight:bold;margin-bottom:${scaleY(40)}px;text-align:center')
    .replace('scaleMin(15)}px;color:#cbd5e1;font-family:Montserrat,sans-serif;line-height:2.2', 'scaleMin(21)}px;color:#cbd5e1;font-family:Montserrat,sans-serif;line-height:1.9');

// Lüks 8: Yeni Fırsat (köşegen)
// tag=17→21, başlık=55→64, fiyat=38→46, feats=15→21
vars[7].html = vars[7].html
    .replace('scaleMin(17)}px;color:#d4af37;font-family:Montserrat,sans-serif;letter-spacing:5px', 'scaleMin(21)}px;color:#d4af37;font-family:Montserrat,sans-serif;letter-spacing:5px')
    .replace('scaleMin(55)}px;color:#fff;font-weight:700;line-height:1.1', 'scaleMin(64)}px;color:#fff;font-weight:700;line-height:1.1')
    .replace('scaleMin(38)}px;color:#d4af37;font-family:Montserrat,sans-serif;font-weight:bold;margin-bottom', 'scaleMin(46)}px;color:#d4af37;font-family:Montserrat,sans-serif;font-weight:bold;margin-bottom')
    .replace('scaleMin(15)}px;color:#e2e8f0;font-family:Montserrat,sans-serif;line-height:2;', 'scaleMin(21)}px;color:#e2e8f0;font-family:Montserrat,sans-serif;line-height:1.9;');

// Lüks 9: Mavi İkili Panel (alt bölünmüş)
// başlık=51→62, fiyat=34→42, feats=19→26
vars[8].html = vars[8].html
    .replace('scaleMin(51)}px;color:#fff;font-weight:700;line-height:1.1;margin-bottom:${scaleY(20)}px', 'scaleMin(62)}px;color:#fff;font-weight:700;line-height:1.1;margin-bottom:${scaleY(20)}px')
    .replace('scaleMin(34)}px;color:#e5e7eb;font-family:Montserrat,sans-serif;font-weight:bold', 'scaleMin(42)}px;color:#e5e7eb;font-family:Montserrat,sans-serif;font-weight:bold')
    .replace('scaleMin(19)}px;color:#cbd5e1;font-family:Montserrat,sans-serif;line-height:2.2', 'scaleMin(26)}px;color:#cbd5e1;font-family:Montserrat,sans-serif;line-height:1.9');

// Lüks 10: ÖZEL LİSTE (çerçeveli yatay)
// tag=17→21, başlık=47→58, fiyat=34→42, feats=15→21, rozet=20→23
vars[9].html = vars[9].html
    .replace('scaleMin(17)}px;color:#cfb53b;font-family:Montserrat,sans-serif;text-transform:uppercase;letter-spacing:3px', 'scaleMin(21)}px;color:#cfb53b;font-family:Montserrat,sans-serif;text-transform:uppercase;letter-spacing:3px')
    .replace('scaleMin(47)}px;color:#fff;font-weight:700;line-height:1.1;margin-bottom:${scaleY(15)}px', 'scaleMin(58)}px;color:#fff;font-weight:700;line-height:1.1;margin-bottom:${scaleY(15)}px')
    .replace('scaleMin(34)}px;color:#cfb53b;font-family:Montserrat,sans-serif;font-weight:bold', 'scaleMin(42)}px;color:#cfb53b;font-family:Montserrat,sans-serif;font-weight:bold')
    .replace('scaleMin(15)}px;color:#e2e8f0;font-family:Montserrat,sans-serif;line-height:2;', 'scaleMin(21)}px;color:#e2e8f0;font-family:Montserrat,sans-serif;line-height:1.9;')
    .replace('scaleMin(20)}px;font-weight:bold;border-radius:0 0 15px 15px', 'scaleMin(23)}px;font-weight:bold;border-radius:0 0 15px 15px');

// JSON'a geri yaz
const newVariationsStr = JSON.stringify(vars, null, null);
const updatedLuks = luks.replace(match[0], 'const variations = ' + newVariationsStr + ';');
fs.writeFileSync('tpl_luks/luks.js', updatedLuks, 'utf8');

console.log("Tüm 10 Lüks şablonu başarıyla güncellendi!");
