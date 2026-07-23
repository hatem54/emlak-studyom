const fs = require('fs');
let code = fs.readFileSync('ui/element.js', 'utf8');

// 1. Add Text Saber logic at the end
const insertion = `
// ==================== YAZI SABER (GLOW) ====================
function loadTextSaberSettings(el) {
    if (!el) return;
    const isSaber = el.dataset.saberActive === 'true';
    const chk = document.getElementById('elTextSaber');
    const optsDiv = document.getElementById('textSaberOptions');
    if (!chk || !optsDiv) return;

    window._loadingElSettings = true;
    chk.checked = isSaber;
    optsDiv.style.display = isSaber ? 'block' : 'none';

    if (isSaber) {
        let opts = { glowColor: '#00aaff', coreSize: 4, glowSize: 30, intensity: 2.5, coreColor: '#ffffff' };
        try {
            if (el.dataset.saberOpts) opts = JSON.parse(el.dataset.saberOpts);
        } catch(e) {}
        
        document.getElementById('textSaberCustomGlow').value = opts.glowColor;
        document.getElementById('textSaberCustomCore').value = opts.coreColor;
        document.getElementById('textSaberCoreSize').value = opts.coreSize;
        document.getElementById('textSaberCoreSizeVal').textContent = opts.coreSize;
        document.getElementById('textSaberGlowSize').value = opts.glowSize;
        document.getElementById('textSaberGlowSizeVal').textContent = opts.glowSize;
        document.getElementById('textSaberIntensity').value = opts.intensity;
        document.getElementById('textSaberIntensityVal').textContent = opts.intensity;
    }
    setTimeout(()=>{ window._loadingElSettings = false; }, 100);
}

window.applyTextSaberToggle = function() {
    if(!selectedEl || window._loadingElSettings) return;
    const isSaber = document.getElementById('elTextSaber').checked;
    document.getElementById('textSaberOptions').style.display = isSaber ? 'block' : 'none';
    
    selectedEl.dataset.saberActive = isSaber ? 'true' : 'false';
    
    if (isSaber) {
        applyTextSaberOpts();
    } else {
        selectedEl.style.color = document.getElementById('elTextColor').value;
        if (window.SaberEngine && typeof SaberEngine.removeTextSaber === 'function') {
            const id = selectedEl.id || ('el_' + Math.random().toString(36).substr(2,9));
            selectedEl.id = id;
            SaberEngine.removeTextSaber(id);
        }
    }
};

window.applyTextSaberOpts = function() {
    if(!selectedEl || window._loadingElSettings) return;
    const isSaber = document.getElementById('elTextSaber').checked;
    if (!isSaber) return;

    const opts = {
        glowColor: document.getElementById('textSaberCustomGlow').value,
        coreColor: document.getElementById('textSaberCustomCore').value,
        coreSize: parseFloat(document.getElementById('textSaberCoreSize').value),
        glowSize: parseFloat(document.getElementById('textSaberGlowSize').value),
        intensity: parseFloat(document.getElementById('textSaberIntensity').value)
    };

    document.getElementById('textSaberCoreSizeVal').textContent = opts.coreSize;
    document.getElementById('textSaberGlowSizeVal').textContent = opts.glowSize;
    document.getElementById('textSaberIntensityVal').textContent = opts.intensity;

    selectedEl.dataset.saberOpts = JSON.stringify(opts);
    
    // Make DOM text transparent to hide it but keep bounding box
    selectedEl.style.color = 'transparent';

    if (window.SaberEngine && typeof SaberEngine.addTextSaber === 'function') {
        const id = selectedEl.id || ('el_' + Math.random().toString(36).substr(2,9));
        selectedEl.id = id;
        SaberEngine.addTextSaber(id, selectedEl, opts);
    }
};
`;

code += insertion;

// 2. Modify loadElSettings to call loadTextSaberSettings
const loadAnchor = "    $('elBorderWidth').value=parseInt(el.dataset.storedBorderWidth)||0;\n    $('elBorderWidthVal').textContent=parseInt(el.dataset.storedBorderWidth)||0;";
const loadInsert = "\n    if(typeof loadTextSaberSettings === 'function') loadTextSaberSettings(el);";

if (code.includes(loadAnchor)) {
    code = code.replace(loadAnchor, loadAnchor + loadInsert);
} else {
    console.log('loadAnchor not found');
}

// 3. Modifying applyElSettings to respect saber color override
const applyAnchor = "    el.style.color=tc;";
const applyInsert = "\n    if(el.dataset.saberActive === 'true') { el.style.color = 'transparent'; }";
if (code.includes(applyAnchor)) {
    code = code.replace(applyAnchor, applyAnchor + applyInsert);
} else {
    console.log('applyAnchor not found');
}

// 4. Force Pixi text update if text content or font settings change in UI
// font size, padding, weight changes -> we need to call SaberEngine.addTextSaber again to recreate PIXI.Text!
// In applyElSettings:
const applyEndAnchor = "    $('elBorderWidthVal').textContent=brw;\n}";
const applyEndInsert = "\n    if(el.dataset.saberActive === 'true' && typeof applyTextSaberOpts === 'function') { setTimeout(applyTextSaberOpts, 10); }\n";
if (code.includes(applyEndAnchor)) {
    code = code.replace(applyEndAnchor, applyEndAnchor + applyEndInsert);
} else {
    console.log('applyEndAnchor not found');
}


fs.writeFileSync('ui/element.js', code);
console.log('ui/element.js patched');
