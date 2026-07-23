const fs = require('fs');
let html = fs.readFileSync('app.html', 'utf-8');

// 1. Add QR Kod button if missing
const btnTarget = `<button class="tab-btn" data-tab="icons" onclick="switchTab('icons')" data-tooltip="Emlak & iletişim ikonları">🏢 İkon</button>`;
if (!html.includes('data-tab="qr"')) {
    html = html.replace(btnTarget, `${btnTarget}\n    <button class="tab-btn" data-tab="qr" onclick="switchTab('qr')" data-tooltip="QR Kod oluştur ve ekle">📱 QR Kod</button>`);
}

// 2. Add original scale option if missing
const scaleTarget = '<select id="exportScale">';
const newScaleOption = '            <option value="original" selected>Orijinal Fotoğraf Çözünürlüğü (Birebir Kayıpsız)</option>';
if (!html.includes('value="original"')) {
    html = html.replace(scaleTarget, `${scaleTarget}\n${newScaleOption}`);
    html = html.replace('<option value="1.5" selected>', '<option value="1.5">');
}

fs.writeFileSync('app.html', html);
console.log('Phase 1 v7-0 complete.');
