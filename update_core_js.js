const fs = require('fs');

let coreJs = fs.readFileSync('core.js', 'utf8');

if (!coreJs.includes('window.switchPropertyType = function')) {
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
}

// Update smartParse
let oldSmartParseBlock = `    const isArazi = araziMatch !== null;
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

let newSmartParseBlock = `    const isArazi = araziMatch !== null;
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
console.log('Successfully updated core.js');
