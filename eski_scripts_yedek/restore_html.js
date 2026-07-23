const fs = require('fs');
let html = fs.readFileSync('app.html', 'utf8');

const anchor = `        <div class="template-grid" id="templateGrid"></div>`;
const restoration = `</div>

    <!-- VERİLER -->
    <div id="tab-data" class="dynamic-field show">
        <div class="tabs" style="background:#1e293b;border:1px solid #334155">
            <button class="tab-btn active" id="subKonut" onclick="switchMode('konut')">🏠 Emlak</button>
            <button class="tab-btn" id="subArazi" onclick="switchMode('arazi')">🌳 Arazi</button>
            <button class="tab-btn" id="subCustom" onclick="switchMode('custom')">🛠️ Özel</button>
        </div>
        <div class="ai-box">
            <textarea id="aiText" placeholder="İlan metnini yapıştır..." rows="5" style="height:110px; resize:vertical;"></textarea>
            <button class="btn-ai" onclick="smartParse()">🤖 Metni Süz</button>
        </div>
        <div class="input-group"><label>📁 Arka Plan Fotoğrafı</label><input type="file" id="imageInput" onclick="this.value=null" accept="image/*"></div>
        <div class="input-group" style="margin-bottom:8px"><label>🖼️ Firma Logosu (Opsiyonel)</label><input type="file" id="logoInput" accept="image/*"></div>
        <div class="row-2">
            <div class="input-group"><label>Durum</label><input type="text" id="statusInput" value="SATILIK EV"></div>
            <div class="input-group"><label>Fiyat</label><input type="text" id="priceInput" value="6.750.000 TL"></div>
        </div>
        <div class="input-group">
            <label>Açıklama / Ek Bilgiler</label>
            <textarea id="descInput" rows="2" style="width:100%;padding:10px;background:rgba(0,0,0,0.2);border:1px solid #334155;color:#fff;border-radius:8px;font-size:12px;resize:vertical;transition:border-color 0.2s;" oninput="renderData()" placeholder="Örn: Merkezi konum, masrafsız..."></textarea>
        </div>
        <div class="section-title">📐 Standart Şablonlar</div>
        <div class="template-grid" id="templateGrid"></div>`;

html = html.replace(anchor, restoration);
fs.writeFileSync('app.html', html, 'utf8');
console.log('Restored HTML successfully.');
