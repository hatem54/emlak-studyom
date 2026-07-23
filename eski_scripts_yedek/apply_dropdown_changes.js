const fs = require('fs');

// 1. APP.HTML
let appHtml = fs.readFileSync('app.html', 'utf8');

const oldTabsStr = `<div class="tabs" style="background:#1e293b;border:1px solid #334155">
            <button class="tab-btn active" id="subKonut" onclick="switchMode('konut')">🏠 Emlak</button>
            <button class="tab-btn" id="subArazi" onclick="switchMode('arazi')">🌲 Arazi</button>
            <button class="tab-btn" id="subCustom" onclick="switchMode('custom')">🛠️ Özel</button>
        </div>`;

const newSelectStr = `<div class="input-group" style="margin-bottom:10px;">
            <select id="propertyTypeSelect" onchange="window.switchPropertyType(this.value)" style="width:100%; padding:10px; border-radius:5px; border:1px solid #334155; background:#1e293b; color:#fff; font-weight:bold; font-size:14px; cursor:pointer; outline:none; appearance:none;">
                <option value="satilik_daire">🏠 Satılık Daire (Emlak)</option>
                <option value="kiralik_daire">🔑 Kiralık Daire</option>
                <option value="villa">🏰 Lüks Villa</option>
                <option value="arsa">🌲 Arsa (Arazi)</option>
                <option value="dukkan">🏪 Dükkan</option>
                <option value="ofis">🏢 Ofis</option>
                <option value="residence">🏙️ Residence</option>
                <option value="yazlik">🏖️ Yazlık</option>
                <option value="bungalov">🏕️ Bungalov</option>
                <option value="custom">🛠️ Özel</option>
            </select>
        </div>`;

appHtml = appHtml.replace(oldTabsStr, newSelectStr);
fs.writeFileSync('app.html', appHtml);

// 2. CORE.JS
let coreJs = fs.readFileSync('core.js', 'utf8');

// Insert window.switchPropertyType
const switchPropertyTypeScript = `window.switchPropertyType = function(type) {
    let mode = 'konut';
    let badgeText = 'SATILIK DAİRE';
    
    switch(type) {
        case 'satilik_daire': mode = 'konut'; badgeText = 'SATILIK DAİRE'; break;
        case 'kiralik_daire': mode = 'konut'; badgeText = 'KİRALIK DAİRE'; break;
        case 'villa': mode = 'konut'; badgeText = 'LÜKS VİLLA'; break;
        case 'arsa': mode = 'arazi'; badgeText = 'SATILIK ARSA'; break;
        case 'dukkan': mode = 'konut'; badgeText = 'SATILIK DÜKKAN'; break;
        case 'ofis': mode = 'konut'; badgeText = 'SATILIK OFİS'; break;
        case 'residence': mode = 'konut'; badgeText = 'RESIDENCE'; break;
        case 'yazlik': mode = 'konut'; badgeText = 'YAZLIK'; break;
        case 'bungalov': mode = 'konut'; badgeText = 'BUNGALOV'; break;
        case 'custom': mode = 'custom'; badgeText = 'ÖZEL İLAN'; break;
    }
    
    window.switchMode(mode);
    
    if(document.getElementById('statusInput')) document.getElementById('statusInput').value = badgeText;
    if(document.getElementById('canvaTitle')) document.getElementById('canvaTitle').value = badgeText;
    
    if(typeof renderData === 'function') renderData();
};

window.switchMode = function(m) {`;

coreJs = coreJs.replace("window.switchMode = function(m) {", switchPropertyTypeScript);

// Update smartParse
const oldSmartParseBlock = `    const isArazi = araziMatch !== null;
    if (isArazi) {
        switchMode('arazi');
        status += ' ' + araziMatch[1].toUpperCase();
    } else {
        switchMode('konut');
        const dukkanMatch = t.match(/(dükkan|işyeri|mağaza)/i);
        if (/daire/i.test(t)) status += ' DAİRE';
        else if (/villa/i.test(t)) status += ' VİLLA';
        else if (dukkanMatch) status += ' ' + dukkanMatch[1].toUpperCase();
        else status += ' EV';
    }
    
    // Temizle
    const finalStatus = status.toUpperCase();
    $('statusInput').value = finalStatus;`;

const newSmartParseBlock = `    const isArazi = araziMatch !== null;
    let propType = 'satilik_daire';
    if (isArazi) {
        propType = 'arsa';
        switchMode('arazi');
        status += ' ' + araziMatch[1].toUpperCase();
    } else {
        switchMode('konut');
        const dukkanMatch = t.match(/(dükkan|işyeri|mağaza)/i);
        if (/daire/i.test(t)) { status += ' DAİRE'; propType = status.includes('KİRALIK') ? 'kiralik_daire' : 'satilik_daire'; }
        else if (/villa/i.test(t)) { status += ' VİLLA'; propType = 'villa'; }
        else if (dukkanMatch) { status += ' ' + dukkanMatch[1].toUpperCase(); propType = 'dukkan'; }
        else if (/ofis/i.test(t)) { status += ' OFİS'; propType = 'ofis'; }
        else if (/residence/i.test(t)) { status += ' RESIDENCE'; propType = 'residence'; }
        else if (/yazlık/i.test(t)) { status += ' YAZLIK'; propType = 'yazlik'; }
        else if (/bungalov/i.test(t)) { status += ' BUNGALOV'; propType = 'bungalov'; }
        else status += ' EV';
    }
    
    // Temizle
    const finalStatus = status.toUpperCase();
    $('statusInput').value = finalStatus;
    if (document.getElementById('propertyTypeSelect')) {
        document.getElementById('propertyTypeSelect').value = propType;
    }`;

coreJs = coreJs.replace(oldSmartParseBlock, newSmartParseBlock);
fs.writeFileSync('core.js', coreJs);

// 3. AUTO_SAVE.JS
let autoSaveJs = fs.readFileSync('js/autoSave.js', 'utf8');

// Insert save propertyType
autoSaveJs = autoSaveJs.replace(
    /currentMode: window\.currentMode,\s*activeLayout: window\.activeLayout,/,
    "currentMode: window.currentMode,\n            propertyType: document.getElementById('propertyTypeSelect') ? document.getElementById('propertyTypeSelect').value : 'satilik_daire',\n            activeLayout: window.activeLayout,"
);

// Insert restore propertyType
autoSaveJs = autoSaveJs.replace(
    /window\.currentMode = state\.currentMode \|\| 'konut';/,
    "window.currentMode = state.currentMode || 'konut';\n        if(state.propertyType && document.getElementById('propertyTypeSelect')) {\n            document.getElementById('propertyTypeSelect').value = state.propertyType;\n        }"
);

fs.writeFileSync('js/autoSave.js', autoSaveJs);
console.log('Successfully applied changes.');
