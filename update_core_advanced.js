const fs = require('fs');

let coreJs = fs.readFileSync('core.js', 'utf8');

// 1. Rewrite switchPropertyType
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
    
    // Hide custom mode
    if(document.getElementById('customForm')) document.getElementById('customForm').style.display = 'none';
    
    const container = document.getElementById('dynamicFormContainer');
    if(!container) return;
    
    // Hidden statusInput to preserve compatibility with title syncing logic
    let html = \`<input type="hidden" id="statusInput" value="\${config.badge}">\`;
    html += \`<div class="section-title">✨ \${config.badge} BİLGİLERİ</div>\`;
    
    // We group fields by 2 for the row-2 layout
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
    
    // Extra fields wrapper
    html += \`<div id="dynamicExtraFields"></div>\`;
    html += \`<button class="btn-action btn-cyan" onclick="addExtraField('dynamic')">+ Bilgi Ekle</button>\`;
    
    container.innerHTML = html;
    
    // Update Canvas title explicitly
    if(document.getElementById('canvaTitle')) document.getElementById('canvaTitle').value = config.badge;
    
    // We update window.currentMode to the 'type' to let autoSave and renderData know what form we are on.
    window.currentMode = type;
    
    renderData();
};`;

coreJs = coreJs.replace(/window\.switchPropertyType = function\(type\) \{[\s\S]*?(?=window\.switchMode = function\(m\))/m, newSwitchProp + '\n\n');

// 2. Rewrite renderData
const newRenderData = `        let canvaLines=[];
        if (window.currentMode === 'custom') {
            // keep custom logic if exists or just skip
        } else if (window.propertyForms && window.propertyForms[window.currentMode]) {
            const config = window.propertyForms[window.currentMode];
            config.fields.forEach(f => {
                // Skip priceInput from canvaLines because templates render priceInput natively!
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
            // also load dynamicExtraFields
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
        }`;

// Find the start of the if(currentMode==='daire') block in renderData
const renderDataBlockStart = coreJs.indexOf('let canvaLines=[];\n        if(currentMode===\'daire\')');
const renderDataBlockEnd = coreJs.indexOf('else if(currentMode===\'arazi\')', renderDataBlockStart);
if (renderDataBlockStart > -1 && renderDataBlockEnd > -1) {
    // We will replace the whole block up to the end of arazi logic
    const customEnd = coreJs.indexOf('if(v(\'c_l1\')&&v(\'c_v1\'))canvaLines.push', renderDataBlockEnd);
    if(customEnd > -1) {
        const fullBlockEnd = coreJs.indexOf('}', customEnd) + 1;
        coreJs = coreJs.substring(0, renderDataBlockStart) + newRenderData + '\n        ' + coreJs.substring(fullBlockEnd);
    }
}

// 3. Update addExtraField and removeExtraField logic
coreJs = coreJs.replace(/function addExtraField\(type\) \{/g, `function addExtraField(type) {
    if (type === 'dynamic') type = window.currentMode;`);
coreJs = coreJs.replace(/function removeExtraField\(btn, type, index\) \{/g, `function removeExtraField(btn, type, index) {
    if (type === 'dynamic') type = window.currentMode;`);

// Also update where the extra fields are appended
const extraAppend = `document.getElementById(type+'ExtraFields').appendChild(div);`;
coreJs = coreJs.replace(extraAppend, `const container = document.getElementById(type+'ExtraFields') || document.getElementById('dynamicExtraFields');
    if(container) container.appendChild(div);`);

// 4. smartParse logic updates
const oldSmartParseElse = `const dukkanMatch = t.match(/(dükkan|işyeri|mağaza)/i);
        if (/daire/i.test(t)) { status += ' DAİRE'; propType = status.includes('KİRALIK') ? 'kiralik_daire' : 'satilik_daire'; switchMode('daire'); }
        else if (/(müstakil ev|köy evi)/i.test(t)) { const m = t.match(/(müstakil ev|köy evi)/i); status += ' ' + m[1].toUpperCase(); propType = m[1].toLowerCase().replace(' ', '_').replace('ü', 'u').replace('ö', 'o'); switchMode('mustakil'); }
        else if (/villa/i.test(t)) { status += ' VİLLA'; propType = 'villa'; switchMode('mustakil'); }
        else if (dukkanMatch) { status += ' ' + dukkanMatch[1].toUpperCase(); propType = 'dukkan'; switchMode('ticari'); }
        else if (/ofis/i.test(t)) { status += ' OFİS'; propType = 'ofis'; switchMode('ticari'); }
        else if (/residence/i.test(t)) { status += ' RESIDENCE'; propType = 'residence'; switchMode('daire'); }
        else if (/yazlık/i.test(t)) { status += ' YAZLIK'; propType = 'yazlik'; switchMode('mustakil'); }
        else if (/bungalov/i.test(t)) { status += ' BUNGALOV'; propType = 'bungalov'; switchMode('mustakil'); }
        else { status += ' EV'; switchMode('daire'); }`;

const newSmartParseElse = `const propMapping = {
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
        
        // Remove active class from accordion
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
        
        window.switchPropertyType(foundType);`;

// The old smartParse had an `isArazi` check. Let's just replace the whole block starting from `const araziMatch`
const smartParseStart = coreJs.indexOf('const araziMatch = t.match');
const smartParseEnd = coreJs.indexOf('const finalStatus = status.toUpperCase();', smartParseStart);
if (smartParseStart > -1 && smartParseEnd > -1) {
    coreJs = coreJs.substring(0, smartParseStart) + newSmartParseElse + '\n    \n    // Temizle\n    ' + coreJs.substring(smartParseEnd);
}

fs.writeFileSync('core.js', coreJs);
console.log('Successfully updated core.js');
