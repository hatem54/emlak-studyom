const fs = require('fs');

let appHtml = fs.readFileSync('app.html', 'utf8');

// 1. Inject formConfig.js
if (!appHtml.includes('js/formConfig.js')) {
    appHtml = appHtml.replace('<script src="core.js"></script>', '<script src="js/formConfig.js"></script>\n    <script src="core.js"></script>');
}

// 2. Build the Custom Accordion UI
const accordionHtml = `
        <div class="custom-accordion-menu">
            <style>
                .cat-group { margin-bottom: 8px; border: 1px solid #334155; border-radius: 6px; overflow: hidden; }
                .cat-header { background: #1e293b; color: #e2e8f0; padding: 10px 12px; font-weight: bold; font-size: 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s; }
                .cat-header:hover { background: #334155; }
                .cat-body { background: #0f172a; display: none; }
                .cat-body.open { display: block; }
                .cat-item { padding: 10px 15px 10px 30px; color: #cbd5e1; font-size: 13px; cursor: pointer; border-top: 1px solid #1e293b; transition: background 0.2s, color 0.2s; position: relative; }
                .cat-item:hover { background: #1e293b; color: #fff; }
                .cat-item.active { background: #3b82f6; color: #fff; border-color: #3b82f6; font-weight: bold; }
                .cat-item::before { content: '✅'; position: absolute; left: 10px; font-size: 10px; opacity: 0.5; top: 12px; }
                .cat-item.active::before { opacity: 1; }
            </style>
            
            <!-- 🏠 KONUTLAR -->
            <div class="cat-group">
                <div class="cat-header" onclick="toggleCat(this)">
                    <span>🏠 KONUTLAR</span><i class="fa-solid fa-chevron-down"></i>
                </div>
                <div class="cat-body">
                    <div class="cat-item" onclick="selectProperty('satilik_daire', this)">Satılık Daire</div>
                    <div class="cat-item" onclick="selectProperty('kiralik_daire', this)">Kiralık Daire</div>
                    <div class="cat-item" onclick="selectProperty('satilik_villa', this)">Satılık Villa</div>
                    <div class="cat-item" onclick="selectProperty('kiralik_villa', this)">Kiralık Villa</div>
                    <div class="cat-item" onclick="selectProperty('satilik_mustakil_ev', this)">Satılık Müstakil Ev</div>
                    <div class="cat-item" onclick="selectProperty('satilik_koy_evi', this)">Satılık Köy Evi</div>
                    <div class="cat-item" onclick="selectProperty('satilik_residence', this)">Residence</div>
                    <div class="cat-item" onclick="selectProperty('satilik_yazlik', this)">Yazlık</div>
                    <div class="cat-item" onclick="selectProperty('satilik_bungalov', this)">Bungalov</div>
                </div>
            </div>

            <!-- 🏢 TİCARİ -->
            <div class="cat-group">
                <div class="cat-header" onclick="toggleCat(this)">
                    <span>🏢 TİCARİ</span><i class="fa-solid fa-chevron-down"></i>
                </div>
                <div class="cat-body">
                    <div class="cat-item" onclick="selectProperty('satilik_dukkan', this)">Satılık Dükkan</div>
                    <div class="cat-item" onclick="selectProperty('kiralik_dukkan', this)">Kiralık Dükkan</div>
                    <div class="cat-item" onclick="selectProperty('satilik_ofis', this)">Satılık Ofis</div>
                    <div class="cat-item" onclick="selectProperty('kiralik_ofis', this)">Kiralık Ofis</div>
                    <div class="cat-item" onclick="selectProperty('satilik_plaza_ofisi', this)">Plaza Ofisi</div>
                    <div class="cat-item" onclick="selectProperty('satilik_is_merkezi', this)">İş Merkezi</div>
                </div>
            </div>

            <!-- 🌲 ARSA -->
            <div class="cat-group">
                <div class="cat-header" onclick="toggleCat(this)">
                    <span>🌲 ARSA</span><i class="fa-solid fa-chevron-down"></i>
                </div>
                <div class="cat-body">
                    <div class="cat-item" onclick="selectProperty('satilik_arsa', this)">Satılık Arsa</div>
                    <div class="cat-item" onclick="selectProperty('satilik_tarla', this)">Tarla</div>
                    <div class="cat-item" onclick="selectProperty('satilik_bag_bahce', this)">Bağ-Bahçe</div>
                    <div class="cat-item" onclick="selectProperty('satilik_ticari_arsa', this)">Ticari Arsa</div>
                    <div class="cat-item" onclick="selectProperty('satilik_sanayi_arsasi', this)">Sanayi Arsası</div>
                </div>
            </div>

            <!-- 🏗️ PROJELER -->
            <div class="cat-group">
                <div class="cat-header" onclick="toggleCat(this)">
                    <span>🏗️ PROJELER</span><i class="fa-solid fa-chevron-down"></i>
                </div>
                <div class="cat-body">
                    <div class="cat-item" onclick="selectProperty('satilik_konut_projesi', this)">Konut Projesi</div>
                    <div class="cat-item" onclick="selectProperty('satilik_villa_projesi', this)">Villa Projesi</div>
                    <div class="cat-item" onclick="selectProperty('satilik_rezidans_projesi', this)">Rezidans Projesi</div>
                    <div class="cat-item" onclick="selectProperty('satilik_ticari_proje', this)">Ticari Proje</div>
                </div>
            </div>

            <!-- ⭐ PREMIUM -->
            <div class="cat-group">
                <div class="cat-header" onclick="toggleCat(this)">
                    <span>⭐ PREMIUM</span><i class="fa-solid fa-chevron-down"></i>
                </div>
                <div class="cat-body">
                    <div class="cat-item" onclick="selectProperty('satilik_luks_villa', this)">Lüks Villa</div>
                    <div class="cat-item" onclick="selectProperty('satilik_deniz_manzarali', this)">Deniz Manzaralı</div>
                    <div class="cat-item" onclick="selectProperty('satilik_havuzlu_villa', this)">Havuzlu Villa</div>
                    <div class="cat-item" onclick="selectProperty('satilik_akilli_ev', this)">Akıllı Ev</div>
                    <div class="cat-item" onclick="selectProperty('satilik_ultra_luks_villa', this)">Ultra Lüks</div>
                </div>
            </div>
            
            <script>
                function toggleCat(el) {
                    const body = el.nextElementSibling;
                    const icon = el.querySelector('i');
                    body.classList.toggle('open');
                    if (body.classList.contains('open')) {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                    } else {
                        icon.classList.remove('fa-chevron-up');
                        icon.classList.add('fa-chevron-down');
                    }
                }
                function selectProperty(type, el) {
                    document.querySelectorAll('.cat-item').forEach(item => item.classList.remove('active'));
                    if(el) el.classList.add('active');
                    window.switchPropertyType(type);
                }
            </script>
        </div>`;

// Replace propertyTypeSelect div
const selectStart = appHtml.indexOf('<div class="input-group" style="margin-bottom:10px;">');
const selectEnd = appHtml.indexOf('</div>', appHtml.indexOf('</select>', selectStart)) + 6;
if (selectStart > -1) {
    appHtml = appHtml.substring(0, selectStart) + accordionHtml + appHtml.substring(selectEnd);
}

// 3. Remove static row-2 containing statusInput and priceInput
const row2Start = appHtml.indexOf('<div class="row-2">\n            <div class="input-group"><label>Durum</label><input type="text" id="statusInput" value="SATILIK EV"></div>\n            <div class="input-group"><label>Fiyat</label><input type="text" id="priceInput" value="6.750.000 TL"></div>\n        </div>');
if (row2Start > -1) {
    appHtml = appHtml.substring(0, row2Start) + appHtml.substring(row2Start + 269);
}

// 4. Replace daireForm, mustakilForm, araziForm, ticariForm with dynamicFormContainer
const startDaire = appHtml.indexOf('<div id="daireForm">');
const endTicari = appHtml.indexOf('<div id="customForm"', startDaire);
if (startDaire > -1 && endTicari > -1) {
    const dynamicContainer = '<div id="dynamicFormContainer"></div>\n        ';
    appHtml = appHtml.substring(0, startDaire) + dynamicContainer + appHtml.substring(endTicari);
}

// We also need to hide 'statusInput' so that 'canvaTitle' fallback logic works correctly, 
// because 'canvaTitle' defaults to 'statusInput'. Wait! 
// In switchPropertyType, we set canvaTitle directly: document.getElementById('canvaTitle').value = badgeText;
// We also need a hidden statusInput so other code doesn't break.
// I will append a hidden statusInput inside dynamicFormContainer.

fs.writeFileSync('app.html', appHtml);
console.log('Successfully updated app.html');
