const fs = require('fs');
let html = fs.readFileSync('app.html', 'utf-8');

// 1. Add QR Kod button
const btnTarget = `<button class="tab-btn" data-tab="icons" onclick="switchTab('icons')" data-tooltip="Emlak & iletişim ikonları">🏢 İkon</button>`;
if (!html.includes('data-tab="qr"')) {
    html = html.replace(btnTarget, `${btnTarget}\n    <button class="tab-btn" data-tab="qr" onclick="switchTab('qr')" data-tooltip="QR Kod oluştur ve ekle">📱 QR Kod</button>`);
}

// 2. Add tab-qr panel
const tabTarget = `<div id="tab-batch" class="dynamic-field">`;
const qrPanel = `
    <!-- 📱 QR KOD PANELİ -->
    <div id="tab-qr" class="dynamic-field" style="display:none;">
        <p class="info-text">İlan için QR kod oluşturup ekrana ekleyin</p>
        <div class="input-group">
            <label>🔗 URL veya Metin</label>
            <input type="text" id="qrInputText" placeholder="https://emlak.com/ilan-linki" style="width:100%; margin-bottom:10px;">
        </div>
        <div class="row-2" style="margin-bottom:10px;">
            <div class="input-group">
                <label>🎨 Ön Renk</label>
                <input type="color" id="qrColorDark" value="#000000">
            </div>
            <div class="input-group">
                <label>🖌️ Arka Plan</label>
                <input type="color" id="qrColorLight" value="#ffffff">
            </div>
        </div>
        <div class="input-group" style="margin-bottom:15px;">
            <label>📐 Kare Boyutu (Örn: 200)</label>
            <input type="number" id="qrSize" value="200" min="50" max="1000">
        </div>
        <button class="btn-action btn-blue" onclick="window.qrManager && window.qrManager.generateQR()" style="width:100%;"><i class="fa-solid fa-qrcode"></i> QR Kodu Üret ve Ekle</button>
    </div>
`;
if (!html.includes('id="tab-qr"')) {
    html = html.replace(tabTarget, qrPanel + '\n' + tabTarget);
}

// 3. Add script tag for qrManager.js
const scriptTarget = `<script src="main.js`;
if (!html.includes('qrManager.js')) {
    html = html.replace(scriptTarget, `<script src="js/modules/qrManager.js?v=2"></script>\n<script src="main.js`);
}

// 4. Update Scale Dropdown
const scaleTarget = '<select id="exportScale">';
const newScaleOption = '            <option value="original" selected>Orijinal Fotoğraf Çözünürlüğü (Birebir Kayıpsız)</option>';
if (!html.includes('value="original"')) {
    html = html.replace(scaleTarget, `${scaleTarget}\n${newScaleOption}`);
    html = html.replace('<option value="1.5" selected>', '<option value="1.5">');
}

// Write back intermediate file
fs.writeFileSync('app.html', html);
console.log('Phase 1 complete: QR code added, Scale dropdown fixed.');
