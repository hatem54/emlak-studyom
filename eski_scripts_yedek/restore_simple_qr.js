const fs = require('fs');
let lines = fs.readFileSync('app.html', 'utf-8').split(/\r?\n/);

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('id="tab-qr"')) {
        startIdx = i; // This line contains <div id="tab-qr"
    }
    if (startIdx !== -1 && i > startIdx && lines[i].includes('<div id="tab-batch"')) {
        endIdx = i - 1; // The line before tab-batch
        // find the nearest blank line or </div> before tab-batch
        while (lines[endIdx].trim() === '' && endIdx > startIdx) {
            endIdx--;
        }
        break;
    }
}

if (startIdx !== -1 && endIdx !== -1) {
    const simplePanel = `    <div id="tab-qr" class="dynamic-field">
        <div class="section-title">📱 QR Kod Oluşturucu</div>
        <p class="info-text">İlan linki, Instagram, WhatsApp veya herhangi bir web adresini QR koda dönüştürüp tuvale ekleyin.</p>
        <div class="input-group">
            <label>Bağlantı (URL)</label>
            <input type="text" id="qrUrlInput" placeholder="Örn: https://sahibinden.com/..." style="width:100%; padding:8px; border-radius:5px; border:1px solid #cbd5e1; background: #fff; color: #000;">
        </div>
        <button class="btn-action btn-blue" onclick="if(window.generateQRCode) window.generateQRCode()" style="width:100%; margin-top:10px; display:flex; align-items:center; justify-content:center; gap:8px;">
            <i class="fa-solid fa-qrcode"></i> QR Kod Ekle
        </button>
        <p class="info-text" style="margin-top:10px; font-size:10px;">* Oluşturulan QR kod, "🎯 Element" sekmesinden boyutlandırılabilir ve taşınabilir.</p>
    </div>`;
    
    // Remove complex panel
    lines.splice(startIdx, endIdx - startIdx + 1, simplePanel);
    
    fs.writeFileSync('app.html', lines.join('\n'));
    console.log("Simple QR panel restored successfully.");
} else {
    console.log("Could not find boundaries.");
}
