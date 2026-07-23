const fs = require('fs');

// --- 1. Fix app.html text labels ---
let appHtml = fs.readFileSync('app.html', 'utf8');

const replacements = {
    "'satilik_residence', this)\">Residence": "'satilik_residence', this)\">Satılık Residence",
    "'satilik_yazlik', this)\">Yazlık": "'satilik_yazlik', this)\">Satılık Yazlık",
    "'satilik_bungalov', this)\">Bungalov": "'satilik_bungalov', this)\">Satılık Bungalov",
    "'satilik_plaza_ofisi', this)\">Plaza Ofisi": "'satilik_plaza_ofisi', this)\">Satılık Plaza Ofisi",
    "'satilik_is_merkezi', this)\">İş Merkezi": "'satilik_is_merkezi', this)\">Satılık İş Merkezi",
    "'satilik_tarla', this)\">Tarla": "'satilik_tarla', this)\">Satılık Arazi",
    "'satilik_bag_bahce', this)\">Bağ-Bahçe": "'satilik_bag_bahce', this)\">Satılık Bağ-Bahçe",
    "'satilik_ticari_arsa', this)\">Ticari Arsa": "'satilik_ticari_arsa', this)\">Satılık Ticari Arsa",
    "'satilik_sanayi_arsasi', this)\">Sanayi Arsası": "'satilik_sanayi_arsasi', this)\">Satılık Sanayi Arsası",
    "'satilik_konut_projesi', this)\">Konut Projesi": "'satilik_konut_projesi', this)\">Satılık Konut Projesi",
    "'satilik_villa_projesi', this)\">Villa Projesi": "'satilik_villa_projesi', this)\">Satılık Villa Projesi",
    "'satilik_rezidans_projesi', this)\">Rezidans Projesi": "'satilik_rezidans_projesi', this)\">Satılık Rezidans Projesi",
    "'satilik_ticari_proje', this)\">Ticari Proje": "'satilik_ticari_proje', this)\">Satılık Ticari Proje",
    "'satilik_luks_villa', this)\">Lüks Villa": "'satilik_luks_villa', this)\">Satılık Lüks Villa",
    "'satilik_deniz_manzarali', this)\">Deniz Manzaralı": "'satilik_deniz_manzarali', this)\">Satılık Deniz Manzaralı",
    "'satilik_havuzlu_villa', this)\">Havuzlu Villa": "'satilik_havuzlu_villa', this)\">Satılık Havuzlu Villa",
    "'satilik_akilli_ev', this)\">Akıllı Ev": "'satilik_akilli_ev', this)\">Satılık Akıllı Ev",
    "'satilik_ultra_luks_villa', this)\">Ultra Lüks": "'satilik_ultra_luks_villa', this)\">Satılık Ultra Lüks"
};

for (const [key, value] of Object.entries(replacements)) {
    appHtml = appHtml.replace(key, value);
}
fs.writeFileSync('app.html', appHtml);
console.log('app.html updated.');


// --- 2. Fix core.js ---
let coreJs = fs.readFileSync('core.js', 'utf8');

// 2a. Inject switchPropertyType if missing
const newSwitchProp = `window.switchPropertyType = function(type) {
    const config = window.propertyForms && window.propertyForms[type];
    if(!config) {
        if(type === 'custom') {
            window.switchMode('custom');
            if(document.getElementById('statusInput')) document.getElementById('statusInput').value = 'ÖZEL İLAN';
            if(document.getElementById('canvaTitle')) document.getElementById('canvaTitle').value = 'ÖZEL İLAN';
            return;
        }
        return;
    }
    
    if(document.getElementById('customForm')) document.getElementById('customForm').style.display = 'none';
    const container = document.getElementById('dynamicFormContainer');
    if(!container) return;
    
    let html = \`<input type="hidden" id="statusInput" value="\${config.badge}">\`;
    html += \`<div class="section-title">✨ \${config.badge} BİLGİLERİ</div>\`;
    
    for(let i=0; i<config.fields.length; i+=2) {
        let f1 = config.fields[i];
        let f2 = config.fields[i+1];
        html += '<div class="row-2">';
        html += \`<div class="input-group"><label>\${f1.label}</label><input type="text" id="\${f1.id}" value="\${f1.value}" oninput="renderData()"></div>\`;
        if(f2) {
            html += \`<div class="input-group"><label>\${f2.label}</label><input type="text" id="\${f2.id}" value="\${f2.value}" oninput="renderData()"></div>\`;
        }
        html += '</div>';
    }
    
    html += \`<div id="dynamicExtraFields"></div>\`;
    html += \`<button class="btn-action btn-cyan" onclick="addExtraField('dynamic')">+ Bilgi Ekle</button>\`;
    
    container.innerHTML = html;
    
    if(document.getElementById('canvaTitle')) document.getElementById('canvaTitle').value = config.badge;
    window.currentMode = type;
    renderData();
};\n\n`;

if (!coreJs.includes('window.switchPropertyType = function')) {
    coreJs = coreJs.replace("window.switchMode = function(m) {", newSwitchProp + "window.switchMode = function(m) {");
} else {
    coreJs = coreJs.replace(/window\.switchPropertyType = function\(type\) \{[\s\S]*?(?=window\.switchMode = function\(m\))/m, newSwitchProp);
}

// 2b. Null fix for renderData
coreJs = coreJs.replace(
    "elBadge.innerText=$('statusInput').value;",
    "elBadge.innerText= $('statusInput') ? $('statusInput').value : '';"
);
coreJs = coreJs.replace(
    "elPrice.innerText=$('priceInput').value || 'FİYAT İÇİN BİZE ULAŞIN';",
    "elPrice.innerText= $('priceInput') ? ($('priceInput').value || 'FİYAT İÇİN BİZE ULAŞIN') : 'FİYAT İÇİN BİZE ULAŞIN';"
);

// 2c. Replace renderData canvas lines logic completely using regex
const renderDataRegex = /let canvaLines=\[\];[\s\S]*?(?=if\(document\.getElementById\('descInput'\))/m;
const dynamicRenderData = `let canvaLines=[];
        if (window.currentMode === 'custom') {
            if(v('c_l1')&&v('c_v1'))canvaLines.push(v('c_l1')+': '+v('c_v1'));
            if(v('c_l2')&&v('c_v2'))canvaLines.push(v('c_l2')+': '+v('c_v2'));
            if(v('c_l3')&&v('c_v3'))canvaLines.push(v('c_l3')+': '+v('c_v3'));
            if(v('c_l4')&&v('c_v4'))canvaLines.push(v('c_l4')+': '+v('c_v4'));
        } else if (window.propertyForms && window.propertyForms[window.currentMode]) {
            const config = window.propertyForms[window.currentMode];
            config.fields.forEach(f => {
                if (f.id === 'priceInput') return;
                const val = document.getElementById(f.id) ? document.getElementById(f.id).value : '';
                if (val && val.toLowerCase() !== 'yok') {
                    if (f.canvasFormat) {
                        canvaLines.push(f.canvasFormat.replace('{value}', val));
                    } else {
                        canvaLines.push(val);
                    }
                }
            });
            const extraContainer = document.getElementById('dynamicExtraFields');
            if (extraContainer) {
                const rows = extraContainer.querySelectorAll('.row-2');
                rows.forEach(r => {
                    const inputs = r.querySelectorAll('input');
                    if (inputs.length === 2 && inputs[0].value && inputs[1].value) {
                        canvaLines.push(inputs[0].value + ': ' + inputs[1].value);
                    }
                });
            }
        }
        
        `;
coreJs = coreJs.replace(renderDataRegex, dynamicRenderData);

// 2d. smartParse
const smartParseRegex = /const araziMatch = t\.match[\s\S]*?(?=const finalStatus = status\.toUpperCase\(\);)/m;
const dynamicSmartParse = `const propMapping = {
            'daire': t.includes('kiralık') ? 'kiralik_daire' : 'satilik_daire',
            'villa': t.includes('kiralık') ? 'kiralik_villa' : (t.includes('lüks') ? 'satilik_luks_villa' : 'satilik_villa'),
            'müstakil ev': 'satilik_mustakil_ev',
            'köy evi': 'satilik_koy_evi',
            'residence': 'satilik_residence',
            'yazlık': 'satilik_yazlik',
            'bungalov': 'satilik_bungalov',
            'dükkan': t.includes('kiralık') ? 'kiralik_dukkan' : 'satilik_dukkan',
            'işyeri': t.includes('kiralık') ? 'kiralik_dukkan' : 'satilik_dukkan',
            'ofis': t.includes('kiralık') ? 'kiralik_ofis' : 'satilik_ofis',
            'arsa': 'satilik_arsa',
            'tarla': 'satilik_tarla',
            'bağ': 'satilik_bag_bahce',
            'bahçe': 'satilik_bag_bahce'
        };
        
        let foundType = 'satilik_daire';
        for (const [key, val] of Object.entries(propMapping)) {
            if (new RegExp(key, 'i').test(t)) {
                foundType = val;
                break;
            }
        }
        
        document.querySelectorAll('.cat-item').forEach(item => item.classList.remove('active'));
        const targetEl = document.querySelector(\`.cat-item[onclick*="\${foundType}"]\`);
        if(targetEl) {
            targetEl.classList.add('active');
            targetEl.closest('.cat-body').classList.add('open');
            const icon = targetEl.closest('.cat-group').querySelector('i');
            if(icon) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        }
        
        window.switchPropertyType(foundType);
        
        // Temizle
        `;
coreJs = coreJs.replace(smartParseRegex, dynamicSmartParse);

// 2e. Extra fields logic
if (!coreJs.includes('if (type === \'dynamic\') type = window.currentMode;')) {
    coreJs = coreJs.replace(/function addExtraField\(type\) \{/g, `function addExtraField(type) {
    if (type === 'dynamic') type = window.currentMode;`);
    coreJs = coreJs.replace(/function removeExtraField\(btn, type, index\) \{/g, `function removeExtraField(btn, type, index) {
    if (type === 'dynamic') type = window.currentMode;`);

    const extraAppend = `document.getElementById(type+'ExtraFields').appendChild(div);`;
    coreJs = coreJs.replace(extraAppend, `const container = document.getElementById(type+'ExtraFields') || document.getElementById('dynamicExtraFields');
    if(container) container.appendChild(div);`);
}

fs.writeFileSync('core.js', coreJs);
console.log('core.js updated completely and safely.');
