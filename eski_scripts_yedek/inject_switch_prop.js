const fs = require('fs');
let coreJs = fs.readFileSync('core.js', 'utf8');

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
};\n\n`;

if (!coreJs.includes('window.switchPropertyType = function')) {
    coreJs = coreJs.replace("window.switchMode = function(m) {", newSwitchProp + "window.switchMode = function(m) {");
    fs.writeFileSync('core.js', coreJs);
    console.log("Injected switchPropertyType successfully.");
} else {
    console.log("switchPropertyType already exists.");
}
