const fs = require('fs');

let coreJs = fs.readFileSync('core.js', 'utf8');

// 2. Rewrite renderData
const newRenderData = `        let canvaLines=[];
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
        }`;

const renderDataBlockStart = coreJs.indexOf('let canvaLines=[];\n        if(currentMode===\'konut\')');
const customEnd = coreJs.indexOf('if(v(\'c_l4\')&&v(\'c_v4\'))canvaLines.push(v(\'c_l4\')+\': \'+v(\'c_v4\'));');
if (renderDataBlockStart > -1 && customEnd > -1) {
    const fullBlockEnd = coreJs.indexOf('}', customEnd) + 1;
    coreJs = coreJs.substring(0, renderDataBlockStart) + newRenderData + '\n        ' + coreJs.substring(fullBlockEnd);
}

// 3. Update addExtraField and removeExtraField logic
if (!coreJs.includes('if (type === \'dynamic\') type = window.currentMode;')) {
    coreJs = coreJs.replace(/function addExtraField\(type\) \{/g, `function addExtraField(type) {
    if (type === 'dynamic') type = window.currentMode;`);
    coreJs = coreJs.replace(/function removeExtraField\(btn, type, index\) \{/g, `function removeExtraField(btn, type, index) {
    if (type === 'dynamic') type = window.currentMode;`);

    const extraAppend = `document.getElementById(type+'ExtraFields').appendChild(div);`;
    coreJs = coreJs.replace(extraAppend, `const container = document.getElementById(type+'ExtraFields') || document.getElementById('dynamicExtraFields');
    if(container) container.appendChild(div);`);
}

// 4. smartParse logic updates
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

const smartParseStart = coreJs.indexOf('const araziMatch = t.match');
const smartParseEnd = coreJs.indexOf('const finalStatus = status.toUpperCase();', smartParseStart);
if (smartParseStart > -1 && smartParseEnd > -1) {
    coreJs = coreJs.substring(0, smartParseStart) + newSmartParseElse + '\n    \n    // Temizle\n    ' + coreJs.substring(smartParseEnd);
}

fs.writeFileSync('core.js', coreJs);
console.log('Successfully re-updated core.js with all advanced features.');
