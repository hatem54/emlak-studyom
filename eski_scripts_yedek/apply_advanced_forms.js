const fs = require('fs');

// 1. UPDATE APP.HTML
let appHtml = fs.readFileSync('app.html', 'utf8');

// Update dropdown options
appHtml = appHtml.replace('<option value="kiralik_daire">🔑 Kiralık Daire</option>', 
    '<option value="kiralik_daire">🔑 Kiralık Daire</option>\n                <option value="mustakil_ev">🏡 Müstakil Ev</option>\n                <option value="koy_evi">🛖 Köy Evi</option>');

// Find the konutForm block
const startKonut = appHtml.indexOf('<div id="konutForm">');
const endKonut = appHtml.indexOf('<div id="araziForm"', startKonut);
const konutFormText = appHtml.substring(startKonut, endKonut);

const newDaireForm = `<div id="daireForm">
            <div class="section-title">🏢 Daire / Residence Bilgileri</div>
            <div class="row-2"><div class="input-group"><label>Oda</label><input type="text" id="roomsInput" value="4+1"></div><div class="input-group"><label>m² (Net/Brüt)</label><input type="text" id="sizeInput" value="180 m²"></div></div>
            <div class="row-2"><div class="input-group"><label>Kat</label><input type="text" id="floorInput" value="5. Kat"></div><div class="input-group"><label>Bina Yaşı</label><input type="text" id="ageInput" value="3"></div></div>
            <div class="row-2"><div class="input-group"><label>Isıtma</label><input type="text" id="heatingInput" value="Doğalgaz"></div><div class="input-group"><label>Banyo</label><input type="text" id="bathInput" value="2"></div></div>
            <div class="row-2"><div class="input-group"><label>Balkon</label><input type="text" id="balconyInput" value="Var"></div><div class="input-group"><label>Eşya Durumu</label><input type="text" id="furnitureInput" value="Boş"></div></div>
            <div id="daireExtraFields"></div>
            <button class="btn-action btn-cyan" onclick="addExtraField('daire')">+ Bilgi Ekle</button>
        </div>
        `;

appHtml = appHtml.replace(konutFormText, newDaireForm);

// Add Mustakil and Ticari after araziForm
const startArazi = appHtml.indexOf('<div id="araziForm"');
const endArazi = appHtml.indexOf('<div id="customForm"', startArazi);
const araziFormText = appHtml.substring(startArazi, endArazi);

const mustakilAndTicariForms = `<div id="mustakilForm" style="display:none">
            <div class="section-title">🏡 Müstakil Yaşam Bilgileri</div>
            <div class="row-2"><div class="input-group"><label>Oda</label><input type="text" id="m_roomsInput" value="5+2"></div><div class="input-group"><label>Kapalı Alan</label><input type="text" id="m_sizeInput" value="250 m²"></div></div>
            <div class="row-2"><div class="input-group"><label>Arsa/Bahçe Payı</label><input type="text" id="m_lotInput" value="500 m²"></div><div class="input-group"><label>Kat Sayısı</label><input type="text" id="m_floorInput" value="3 Katlı"></div></div>
            <div class="row-2"><div class="input-group"><label>Bina Yaşı</label><input type="text" id="m_ageInput" value="Sıfır"></div><div class="input-group"><label>Isıtma</label><input type="text" id="m_heatingInput" value="Yerden Isıtma"></div></div>
            <div class="row-2"><div class="input-group"><label>Havuz</label><input type="text" id="m_poolInput" value="Özel Havuzlu"></div><div class="input-group"><label>Otopark</label><input type="text" id="m_parkingInput" value="Var"></div></div>
            <div id="mustakilExtraFields"></div>
            <button class="btn-action btn-cyan" onclick="addExtraField('mustakil')">+ Bilgi Ekle</button>
        </div>
        <div id="ticariForm" style="display:none">
            <div class="section-title">🏪 Ticari Mülk Bilgileri</div>
            <div class="row-2"><div class="input-group"><label>Kapalı Alan</label><input type="text" id="t_sizeInput" value="180 m²"></div><div class="input-group"><label>Vitrin/Cephe</label><input type="text" id="t_frontInput" value="8 Metre"></div></div>
            <div class="row-2"><div class="input-group"><label>Bölüm/Oda</label><input type="text" id="t_roomsInput" value="4 Bölüm"></div><div class="input-group"><label>Bulunduğu Kat</label><input type="text" id="t_floorInput" value="Düz Giriş"></div></div>
            <div class="row-2"><div class="input-group"><label>Isıtma/Soğutma</label><input type="text" id="t_heatingInput" value="Merkezi VRV"></div><div class="input-group"><label>Yapı Durumu</label><input type="text" id="t_statusInput" value="İçi Yapılı"></div></div>
            <div class="row-2"><div class="input-group"><label>Kullanım Durumu</label><input type="text" id="t_useInput" value="Boş"></div><div class="input-group"><label>Otopark/Vale</label><input type="text" id="t_parkingInput" value="Yok"></div></div>
            <div id="ticariExtraFields"></div>
            <button class="btn-action btn-cyan" onclick="addExtraField('ticari')">+ Bilgi Ekle</button>
        </div>
        `;

appHtml = appHtml.replace(araziFormText, araziFormText + mustakilAndTicariForms);
fs.writeFileSync('app.html', appHtml);

// 2. UPDATE CORE.JS
let coreJs = fs.readFileSync('core.js', 'utf8');

// Update switchPropertyType
const oldSwitchProp = `window.switchPropertyType = function(type) {
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
    }`;

const newSwitchProp = `window.switchPropertyType = function(type) {
    let mode = 'daire';
    let badgeText = 'SATILIK DAİRE';
    
    switch(type) {
        case 'satilik_daire': mode = 'daire'; badgeText = 'SATILIK DAİRE'; break;
        case 'kiralik_daire': mode = 'daire'; badgeText = 'KİRALIK DAİRE'; break;
        case 'residence': mode = 'daire'; badgeText = 'RESIDENCE'; break;
        case 'mustakil_ev': mode = 'mustakil'; badgeText = 'MÜSTAKİL EV'; break;
        case 'koy_evi': mode = 'mustakil'; badgeText = 'KÖY EVİ'; break;
        case 'villa': mode = 'mustakil'; badgeText = 'LÜKS VİLLA'; break;
        case 'yazlik': mode = 'mustakil'; badgeText = 'YAZLIK'; break;
        case 'bungalov': mode = 'mustakil'; badgeText = 'BUNGALOV'; break;
        case 'arsa': mode = 'arazi'; badgeText = 'SATILIK ARSA'; break;
        case 'dukkan': mode = 'ticari'; badgeText = 'SATILIK DÜKKAN'; break;
        case 'ofis': mode = 'ticari'; badgeText = 'SATILIK OFİS'; break;
        case 'custom': mode = 'custom'; badgeText = 'ÖZEL İLAN'; break;
    }`;
coreJs = coreJs.replace(oldSwitchProp, newSwitchProp);

// Update switchMode
const oldSwitchMode = `window.switchMode = function(m) {
    currentMode = m;
    
    if (m === 'konut') {
        if(document.getElementById('statusInput')) document.getElementById('statusInput').value = 'SATILIK EV';
        if(document.getElementById('canvaTitle')) document.getElementById('canvaTitle').value = 'SATILIK EV';
    } else if (m === 'arazi') {
        if(document.getElementById('statusInput')) document.getElementById('statusInput').value = 'SATILIK ARAZİ';
        if(document.getElementById('canvaTitle')) document.getElementById('canvaTitle').value = 'SATILIK ARAZİ';
    }

    ['subKonut','subArazi','subCustom'].forEach(id=>{
        if(document.getElementById(id)) document.getElementById(id).classList.remove('active');
    });
    const b = {konut:'subKonut', arazi:'subArazi', custom:'subCustom'};
    if(document.getElementById(b[m])) document.getElementById(b[m]).classList.add('active');

    ['konutForm','araziForm','customForm'].forEach(id=>{
        if(document.getElementById(id)) document.getElementById(id).style.display='none';
    });
    const f = {konut:'konutForm', arazi:'araziForm', custom:'customForm'};
    if(document.getElementById(f[m])) document.getElementById(f[m]).style.display='block';

    renderData();
};`;

const newSwitchMode = `window.switchMode = function(m) {
    currentMode = m;
    
    if (m === 'daire') {
        if(document.getElementById('statusInput')) document.getElementById('statusInput').value = 'SATILIK DAİRE';
        if(document.getElementById('canvaTitle')) document.getElementById('canvaTitle').value = 'SATILIK DAİRE';
    } else if (m === 'arazi') {
        if(document.getElementById('statusInput')) document.getElementById('statusInput').value = 'SATILIK ARSA';
        if(document.getElementById('canvaTitle')) document.getElementById('canvaTitle').value = 'SATILIK ARSA';
    } else if (m === 'mustakil') {
        if(document.getElementById('statusInput')) document.getElementById('statusInput').value = 'MÜSTAKİL EV';
        if(document.getElementById('canvaTitle')) document.getElementById('canvaTitle').value = 'MÜSTAKİL EV';
    } else if (m === 'ticari') {
        if(document.getElementById('statusInput')) document.getElementById('statusInput').value = 'SATILIK DÜKKAN';
        if(document.getElementById('canvaTitle')) document.getElementById('canvaTitle').value = 'SATILIK DÜKKAN';
    }

    ['daireForm','mustakilForm','araziForm','ticariForm','customForm'].forEach(id=>{
        if(document.getElementById(id)) document.getElementById(id).style.display='none';
    });
    const f = {daire:'daireForm', mustakil:'mustakilForm', arazi:'araziForm', ticari:'ticariForm', custom:'customForm'};
    if(document.getElementById(f[m])) document.getElementById(f[m]).style.display='block';

    renderData();
};`;
coreJs = coreJs.replace(oldSwitchMode, newSwitchMode);

// Update renderData
const oldRenderData = `        let canvaLines=[];
        if(currentMode==='konut'){
            if(v('roomsInput'))canvaLines.push(v('roomsInput')+' Geniş Salon');
            if(v('sizeInput'))canvaLines.push(v('sizeInput')+' Net Kullanım');
            if(v('heatingInput'))canvaLines.push(v('heatingInput'));
            if(v('floorInput')||v('ageInput'))canvaLines.push((v('floorInput')?v('floorInput'):'')+(v('ageInput')?' / '+v('ageInput')+' Yaşında':''));
        }else if(currentMode==='arazi'){`;

const newRenderData = `        let canvaLines=[];
        if(currentMode==='daire'){
            if(v('roomsInput'))canvaLines.push(v('roomsInput')+' Geniş Salon');
            if(v('sizeInput'))canvaLines.push(v('sizeInput')+' Net/Brüt');
            if(v('heatingInput'))canvaLines.push(v('heatingInput'));
            if(v('floorInput')||v('ageInput'))canvaLines.push((v('floorInput')?v('floorInput'):'')+(v('ageInput')?' / '+v('ageInput')+' Yaşında':''));
            if(v('balconyInput')&&v('balconyInput').toLowerCase()!=='yok')canvaLines.push(v('balconyInput')+' Balkon');
            if(v('furnitureInput')&&v('furnitureInput').toLowerCase()!=='boş')canvaLines.push(v('furnitureInput'));
        }else if(currentMode==='mustakil'){
            if(v('m_roomsInput'))canvaLines.push(v('m_roomsInput')+' Geniş Salon');
            if(v('m_sizeInput')||v('m_lotInput'))canvaLines.push((v('m_sizeInput')?v('m_sizeInput')+' Kapalı':'')+(v('m_lotInput')?' / '+v('m_lotInput')+' Arsa':''));
            if(v('m_heatingInput'))canvaLines.push(v('m_heatingInput'));
            if(v('m_poolInput')&&v('m_poolInput').toLowerCase()!=='yok')canvaLines.push(v('m_poolInput'));
            if(v('m_parkingInput')&&v('m_parkingInput').toLowerCase()!=='yok')canvaLines.push(v('m_parkingInput')+' Otopark');
        }else if(currentMode==='ticari'){
            if(v('t_sizeInput'))canvaLines.push(v('t_sizeInput')+' Kapalı Alan');
            if(v('t_frontInput'))canvaLines.push(v('t_frontInput')+' Vitrin');
            if(v('t_roomsInput'))canvaLines.push(v('t_roomsInput'));
            if(v('t_heatingInput'))canvaLines.push(v('t_heatingInput'));
            if(v('t_useInput')&&v('t_useInput').toLowerCase()!=='boş')canvaLines.push(v('t_useInput'));
        }else if(currentMode==='arazi'){`;
coreJs = coreJs.replace(oldRenderData, newRenderData);

// Update extraFieldsData initialization
coreJs = coreJs.replace(/const extraFieldsData = \{konut:\[\], arazi:\[\]\};/g, "const extraFieldsData = {daire:[], mustakil:[], arazi:[], ticari:[]};");
// Also there's another occurrence in removeExtraField? No, addExtraField and removeExtraField are dynamic.

// Update smartParse logic inside core.js
const oldSmartParseElse = `switchMode('konut');
        const dukkanMatch = t.match(/(dükkan|işyeri|mağaza)/i);
        if (/daire/i.test(t)) { status += ' DAİRE'; propType = status.includes('KİRALIK') ? 'kiralik_daire' : 'satilik_daire'; }
        else if (/villa/i.test(t)) { status += ' VİLLA'; propType = 'villa'; }
        else if (dukkanMatch) { status += ' ' + dukkanMatch[1].toUpperCase(); propType = 'dukkan'; }
        else if (/ofis/i.test(t)) { status += ' OFİS'; propType = 'ofis'; }
        else if (/residence/i.test(t)) { status += ' RESIDENCE'; propType = 'residence'; }
        else if (/yazlık/i.test(t)) { status += ' YAZLIK'; propType = 'yazlik'; }
        else if (/bungalov/i.test(t)) { status += ' BUNGALOV'; propType = 'bungalov'; }
        else status += ' EV';`;

const newSmartParseElse = `const dukkanMatch = t.match(/(dükkan|işyeri|mağaza)/i);
        if (/daire/i.test(t)) { status += ' DAİRE'; propType = status.includes('KİRALIK') ? 'kiralik_daire' : 'satilik_daire'; switchMode('daire'); }
        else if (/(müstakil ev|köy evi)/i.test(t)) { const m = t.match(/(müstakil ev|köy evi)/i); status += ' ' + m[1].toUpperCase(); propType = m[1].toLowerCase().replace(' ', '_').replace('ü', 'u').replace('ö', 'o'); switchMode('mustakil'); }
        else if (/villa/i.test(t)) { status += ' VİLLA'; propType = 'villa'; switchMode('mustakil'); }
        else if (dukkanMatch) { status += ' ' + dukkanMatch[1].toUpperCase(); propType = 'dukkan'; switchMode('ticari'); }
        else if (/ofis/i.test(t)) { status += ' OFİS'; propType = 'ofis'; switchMode('ticari'); }
        else if (/residence/i.test(t)) { status += ' RESIDENCE'; propType = 'residence'; switchMode('daire'); }
        else if (/yazlık/i.test(t)) { status += ' YAZLIK'; propType = 'yazlik'; switchMode('mustakil'); }
        else if (/bungalov/i.test(t)) { status += ' BUNGALOV'; propType = 'bungalov'; switchMode('mustakil'); }
        else { status += ' EV'; switchMode('daire'); }`;
coreJs = coreJs.replace(oldSmartParseElse, newSmartParseElse);

fs.writeFileSync('core.js', coreJs);

// 3. UPDATE AUTO_SAVE.JS
let autoSaveJs = fs.readFileSync('js/autoSave.js', 'utf8');

autoSaveJs = autoSaveJs.replace(
    /const newExtra = state\.extraFieldsData \|\| \{konut:\[\],arazi:\[\]\};\s*extraFieldsData\.konut = newExtra\.konut \|\| \[\];\s*extraFieldsData\.arazi = newExtra\.arazi \|\| \[\];/g,
    "const newExtra = state.extraFieldsData || {daire:[],mustakil:[],arazi:[],ticari:[]};\n                extraFieldsData.daire = newExtra.daire || newExtra.konut || [];\n                extraFieldsData.mustakil = newExtra.mustakil || [];\n                extraFieldsData.arazi = newExtra.arazi || [];\n                extraFieldsData.ticari = newExtra.ticari || [];"
);
// Also 'konut' default mode in loadProject
autoSaveJs = autoSaveJs.replace(
    /window\.currentMode = state\.currentMode \|\| 'konut';/,
    "window.currentMode = state.currentMode || 'daire';\n        if (window.currentMode === 'konut') window.currentMode = 'daire';"
);
autoSaveJs = autoSaveJs.replace(
    /currentMode = state\.currentMode \|\| 'konut';/,
    "currentMode = state.currentMode || 'daire';\n                if (currentMode === 'konut') currentMode = 'daire';"
);

fs.writeFileSync('js/autoSave.js', autoSaveJs);

console.log("Successfully applied dynamic forms logic!");
