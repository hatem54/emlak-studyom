/**
 * ============================================
 * ELEMENT UI MODULE
 * ui/element.js
 * ============================================
 * 
 * Bağımlılıklar:
 * - config.js
 * - core/drag.js
 * 
 * Kullanılan yerler:
 * - core.js
 * - main.js
 */

function loadElSettings(el){
    window._loadingElSettings=true;
    const cs=getComputedStyle(el);
    $('elFontSize').value=parseInt(cs.fontSize)||32;
    $('elFontSizeVal').textContent=parseInt(cs.fontSize)||32;
    $('elPadding').value=parseInt(cs.paddingTop)||0;
    $('elPaddingVal').textContent=parseInt(cs.paddingTop)||0;
    const hasW=el.style.width&&el.style.width!=='auto';
    const hasH=el.style.height&&el.style.height!=='auto';
    $('elWidth').value=hasW?parseInt(el.style.width):0;
    $('elWidthVal').textContent=hasW?parseInt(el.style.width)+'px':'Otomatik';
    $('elHeight').value=hasH?parseInt(el.style.height):0;
    $('elHeightVal').textContent=hasH?parseInt(el.style.height)+'px':'Otomatik';
    $('elTextColor').value=rgbToHex(cs.color);
    $('elBgColor').value=el.dataset.storedBgHex||'#0f172a';
    const bgOp=el.dataset.storedBgOpacity||85;
    $('elBgOpacity').value=bgOp;
    $('elBgOpacityVal').textContent=bgOp+'%';
    $('elOpacity').value=Math.round((parseFloat(cs.opacity)||1)*100);
    $('elOpacityVal').textContent=Math.round((parseFloat(cs.opacity)||1)*100)+'%';
    $('elRotate').value=parseInt(el.dataset.rotation)||0;
    $('elRotateVal').textContent=(parseInt(el.dataset.rotation)||0)+'°';
    $('elRadius').value=parseInt(cs.borderRadius)||0;
    $('elRadiusVal').textContent=parseInt(cs.borderRadius)||0;
    $('elShadow').value=parseInt(el.dataset.shadowVal)||0;
    $('elShadowVal').textContent=parseInt(el.dataset.shadowVal)||0;
    $('elBlur').value=parseInt(el.dataset.blurVal)||0;
    $('elBlurVal').textContent=parseInt(el.dataset.blurVal)||0;
    $('elBorderColor').value=el.dataset.storedBorderColor||'#38bdf8';
    $('elBorderWidth').value=parseInt(el.dataset.storedBorderWidth)||0;
    $('elBorderWidthVal').textContent=parseInt(el.dataset.storedBorderWidth)||0;
    
    if(typeof loadTextSaberSettings === 'function') loadTextSaberSettings(el);
    
    setTimeout(()=>{window._loadingElSettings=false},100);
}

function applyElSettings(){
    if(!selectedEl)return;
    if(window._loadingElSettings)return;
    if(selectedEl.dataset.editingText)return;
    const el=selectedEl;
    const fs=$('elFontSize').value,pd=$('elPadding').value;
    const tc=$('elTextColor').value,bc=$('elBgColor').value,bo=$('elBgOpacity').value;
    const op=$('elOpacity').value,rot=$('elRotate').value,rad=$('elRadius').value;
    const sh=$('elShadow').value,bl=$('elBlur').value;
    const brc=$('elBorderColor').value,brw=$('elBorderWidth').value;
    const w=$('elWidth').value,h=$('elHeight').value;
    el.style.fontSize=fs+'px';
    el.style.padding=pd+'px';
    el.style.color=tc;
    if(el.dataset.saberActive === 'true') { el.style.color = 'transparent'; }
    el.style.opacity=op/100;
    const rgb=hexToRgb(bc);
    el.style.background='rgba('+rgb.r+','+rgb.g+','+rgb.b+','+(bo/100)+')';
    el.dataset.storedBgHex=bc;
    el.dataset.storedBgOpacity=bo;
    el.dataset.rotation=rot;
    el.style.transform='rotate('+rot+'deg)';
    el.style.borderRadius=rad+'px';
    el.dataset.shadowVal=sh;
    el.style.boxShadow=+sh>0?'0 '+sh+'px '+(sh*2)+'px rgba(0,0,0,.5)':'none';
    el.dataset.blurVal=bl;
    el.style.backdropFilter=+bl>0?'blur('+bl+'px)':'none';
    el.dataset.storedBorderColor=brc;
    el.dataset.storedBorderWidth=brw;
    el.style.border=+brw>0?brw+'px solid '+brc:'none';
    if(+w>0){el.style.width=w+'px';$('elWidthVal').textContent=w+'px'}
    else{el.style.width='';$('elWidthVal').textContent='Otomatik'}
    if(+h>0){el.style.height=h+'px';$('elHeightVal').textContent=h+'px'}
    else{el.style.height='';$('elHeightVal').textContent='Otomatik'}
    $('elFontSizeVal').textContent=fs;
    $('elPaddingVal').textContent=pd;
    $('elBgOpacityVal').textContent=bo+'%';
    $('elOpacityVal').textContent=op+'%';
    $('elRotateVal').textContent=rot+'°';
    $('elRadiusVal').textContent=rad;
    $('elShadowVal').textContent=sh;
    $('elBlurVal').textContent=bl;
    $('elBorderWidthVal').textContent=brw;
    
    if(el.dataset.saberActive === 'true' && typeof applyTextSaberOpts === 'function') { setTimeout(applyTextSaberOpts, 10); }
}

function bindElSettings(){
    const ids=['elFontSize','elPadding','elWidth','elHeight','elTextColor','elBgColor','elBgOpacity','elOpacity','elRotate','elRadius','elShadow','elBlur','elBorderColor','elBorderWidth'];
    ids.forEach(id=>{
        $(id).addEventListener('input',function(){
            if(window._loadingElSettings)return;
            if(selectedEl && selectedEl.dataset.editingText)return;
            applyElSettings();
        });
    });
}

function resetElSettings(){
    if(!selectedEl)return;

    if (selectedEl.dataset.originalStyle) {
        selectedEl.style.cssText = selectedEl.dataset.originalStyle;
        delete selectedEl.dataset.customFont;
        
        if(typeof loadElSettings === 'function') loadElSettings(selectedEl);
        if(typeof loadElFont === 'function') loadElFont(selectedEl);
    } else {
        $('elFontSize').value=selectedEl.dataset.defaultFont||32;
        $('elPadding').value=15;
        $('elWidth').value=0;
        $('elHeight').value=0;
        $('elTextColor').value='#ffffff';
        $('elBgColor').value='#0f172a';
        $('elBgOpacity').value=85;
        $('elOpacity').value=100;
        $('elRotate').value=0;
        $('elRadius').value=8;
        $('elShadow').value=0;
        $('elBlur').value=0;
        $('elBorderColor').value='#38bdf8';
        $('elBorderWidth').value=0;
        $('elFontFamily').value='';
        $('elFontWeight2').value='';
        $('elFontStyle2').value='';
        $('elLetterSp').value=0;
        $('elLetterSpVal').textContent='0';
        $('elWeightSlider').value=700;
        $('elWeightVal').textContent='700';
        delete selectedEl.dataset.customFont;
        applyElSettings();
        applyFontSettings();
    }
}

function addCustomTextBox(){
    const el=document.createElement('div');
    el.className='draggable canvas-el';
    el.textContent='ÖZEL METİN VEYA BAŞLIK';
    el.dataset.label='Özel Kutu';
    el.dataset.defaultFont='36';
    el.dataset.rotation='0';
    el.dataset.shadowVal='10';
    el.dataset.blurVal='0';
    el.dataset.storedBgHex='#0f172a';
    el.dataset.storedBgOpacity='90';
    el.dataset.storedBorderColor='#38bdf8';
    el.dataset.storedBorderWidth='2';
    el.style.left='600px';
    el.style.top='400px';
    el.style.fontSize='36px';
    el.style.padding='20px 30px';
    el.style.borderRadius='12px';
    el.style.background='rgba(15,23,42,0.9)';
    el.style.color='#ffffff';
    el.style.border='2px solid #38bdf8';
    el.style.boxShadow='0 10px 20px rgba(0,0,0,0.5)';
    el.style.zIndex='9999';
    el.style.fontFamily=currentFont;
    uiLayer.appendChild(el);
    bindDrag(el);
    enableInlineEdit(el);
    if(typeof isCanvaMode!=='undefined' && isCanvaMode)canvaOverlays.push(el);
    selectElement(el);
}

function addCustomTextOnly(){
    const el=document.createElement('div');
    el.className='draggable canvas-el';
    el.textContent='SERBEST YAZI';
    el.dataset.label='Serbest Yazı';
    el.dataset.defaultFont='36';
    el.dataset.rotation='0';
    el.dataset.shadowVal='10';
    el.dataset.blurVal='0';
    el.dataset.storedBgHex='#000000';
    el.dataset.storedBgOpacity='0';
    el.dataset.storedBorderColor='#000000';
    el.dataset.storedBorderWidth='0';
    el.style.left='600px';
    el.style.top='450px';
    el.style.fontSize='36px';
    el.style.padding='10px';
    el.style.background='transparent';
    el.style.color='#ffffff';
    el.style.border='none';
    el.style.textShadow='0 5px 15px rgba(0,0,0,0.8)';
    el.style.zIndex='9999';
    el.style.fontFamily=currentFont;
    uiLayer.appendChild(el);
    bindDrag(el);
    enableInlineEdit(el);
    if(typeof isCanvaMode!=='undefined' && isCanvaMode)canvaOverlays.push(el);
    selectElement(el);
}

function initGlobalTooltip() {
    const tip = document.createElement('div');
    tip.className = 'global-tooltip';
    document.body.appendChild(tip);

    document.querySelectorAll('[data-tooltip]').forEach(el => {
        el.addEventListener('mouseenter', (e) => {
            const text = el.getAttribute('data-tooltip');
            if(!text) return;
            tip.innerHTML = text;
            tip.classList.add('show');
            
            const rect = el.getBoundingClientRect();
            
            // Calculate position (below the button)
            let top = rect.bottom + 8;
            let left = rect.left + (rect.width / 2) - (tip.offsetWidth / 2);
            
            // Edge correction
            if(left < 10) left = 10;
            if(left + tip.offsetWidth > window.innerWidth - 10) {
                left = window.innerWidth - tip.offsetWidth - 10;
            }
            
            tip.style.top = top + 'px';
            tip.style.left = left + 'px';
        });
        
        el.addEventListener('mouseleave', () => {
            tip.classList.remove('show');
        });
    });
}


// ==================== YAZI SABER (GLOW) ====================

window.setTextSaberPreset = function(key) {
    if (!$('textSaberPresets')) return;
    $('textSaberPresets').querySelectorAll('.sep-preset').forEach(x => x.classList.remove('active'));
    const el = $('textSaberPresets').querySelector(`[data-preset="${key}"]`);
    if (el) el.classList.add('active');
    
    if (window.SaberEngine && window.SaberEngine.presets[key]) {
        const pData = SaberEngine.presets[key];
        if (pData.settings.coreSize) $('textSaberCoreSize').value = pData.settings.coreSize;
        if (pData.settings.glowSize) $('textSaberGlowSize').value = pData.settings.glowSize;
        if (pData.settings.intensity) $('textSaberIntensity').value = pData.settings.intensity;
        if (pData.settings.flickerAmount !== undefined) $('textSaberFlicker').value = Math.round(pData.settings.flickerAmount * 100);
        
        if (pData.settings.glowColor !== undefined) {
            const hexGlow = typeof pData.settings.glowColor === 'string' ? pData.settings.glowColor : '#' + pData.settings.glowColor.toString(16).padStart(6, '0');
            $('textSaberCustomGlow').value = hexGlow;
        }
        if (pData.settings.coreColor !== undefined) {
            const hexCore = typeof pData.settings.coreColor === 'string' ? pData.settings.coreColor : '#' + pData.settings.coreColor.toString(16).padStart(6, '0');
            $('textSaberCustomCore').value = hexCore;
        }

        $('textSaberCoreSizeVal').textContent = $('textSaberCoreSize').value;
        $('textSaberGlowSizeVal').textContent = $('textSaberGlowSize').value;
        $('textSaberIntensityVal').textContent = $('textSaberIntensity').value;
        $('textSaberFlickerVal').textContent = $('textSaberFlicker').value;
    }
    applyTextSaberOpts();
};

window.setTextSaberColor = function(key) {
    if (!$('textSaberColors')) return;
    if (window.SaberEngine && window.SaberEngine.colorPresets[key]) {
        const c = window.SaberEngine.colorPresets[key];
        const glowHex = '#' + c.glow.toString(16).padStart(6, '0');
        const coreHex = '#' + c.core.toString(16).padStart(6, '0');
        $('textSaberCustomGlow').value = glowHex;
        $('textSaberCustomCore').value = coreHex;
    }
    applyTextSaberOpts();
};

function loadTextSaberSettings(el) {
    if (!el) return;
    const isSaber = el.dataset.saberActive === 'true';
    const chk = document.getElementById('elTextSaber');
    const optsDiv = document.getElementById('textSaberOptions');
    if (!chk || !optsDiv) return;

    window._loadingElSettings = true;
    chk.checked = isSaber;
    optsDiv.style.display = isSaber ? 'block' : 'none';

    let opts = { glowColor: '#00aaff', coreSize: 4, glowSize: 30, intensity: 2.5, coreColor: '#ffffff', preset: 'fully-lit', flickerAmount: 0.05 };
    if (isSaber) {
        try {
            if (el.dataset.saberOpts) opts = Object.assign(opts, JSON.parse(el.dataset.saberOpts));
        } catch(e) {}
    }

    // Render Presets
    const presets = window.SaberEngine ? SaberEngine.presets : {};
    let presetsHTML = '';
    Object.keys(presets).forEach(key => {
        const presetData = presets[key];
        const active = (key === opts.preset || (!opts.preset && key === 'fully-lit')) ? 'active' : '';
        presetsHTML += `<div class="sep-preset ${active}" data-preset="${key}" onclick="setTextSaberPreset('${key}')"><div>${presetData.icon}</div><div class="sep-preset-name">${presetData.name}</div></div>`;
    });
    if ($('textSaberPresets')) $('textSaberPresets').innerHTML = presetsHTML;

    // Render Colors
    const colors = window.SaberEngine ? SaberEngine.colorPresets : {};
    let colorsHTML = '';
    Object.keys(colors).forEach(key => {
        const c = colors[key];
        const hex = '#' + c.glow.toString(16).padStart(6, '0');
        colorsHTML += `<div class="sep-color" data-color="${key}" style="background:${hex}" title="${key}" onclick="setTextSaberColor('${key}')"></div>`;
    });
    if ($('textSaberColors')) $('textSaberColors').innerHTML = colorsHTML;

    document.getElementById('textSaberCustomGlow').value = opts.glowColor;
    document.getElementById('textSaberCustomCore').value = opts.coreColor;
    document.getElementById('textSaberCoreSize').value = opts.coreSize;
    document.getElementById('textSaberCoreSizeVal').textContent = opts.coreSize;
    document.getElementById('textSaberGlowSize').value = opts.glowSize;
    document.getElementById('textSaberGlowSizeVal').textContent = opts.glowSize;
    document.getElementById('textSaberIntensity').value = opts.intensity;
    document.getElementById('textSaberIntensityVal').textContent = opts.intensity;
    const fval = Math.round((opts.flickerAmount !== undefined ? opts.flickerAmount : 0.05) * 100);
    if(document.getElementById('textSaberFlicker')) {
        document.getElementById('textSaberFlicker').value = fval;
        document.getElementById('textSaberFlickerVal').textContent = fval;
    }

    setTimeout(()=>{ window._loadingElSettings = false; }, 100);
}

window.applyTextSaberToggle = function() {
    if(!selectedEl || window._loadingElSettings) return;
    const isSaber = document.getElementById('elTextSaber').checked;
    document.getElementById('textSaberOptions').style.display = isSaber ? 'block' : 'none';
    
    selectedEl.dataset.saberActive = isSaber ? 'true' : 'false';
    
    if (isSaber) {
        // Çerçeve opaklığını ve kenarlıkları sıfırla
        const inputsToZero = ['elBgOpacity', 'elBorderWidth', 'elShadow', 'elBlur'];
        let changed = false;
        inputsToZero.forEach(id => {
            const el = document.getElementById(id);
            if (el && parseFloat(el.value) > 0) {
                el.value = 0;
                const valEl = document.getElementById(id + 'Val');
                if (valEl) valEl.innerText = '0';
                changed = true;
            }
        });
        if (changed) applyElSettings();

        // Render options logic before applying
        loadTextSaberSettings(selectedEl);
        setTimeout(() => {
            applyTextSaberOpts();
        }, 110);
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

    const activePresetEl = $('textSaberPresets') ? $('textSaberPresets').querySelector('.active') : null;
    const presetKey = activePresetEl ? activePresetEl.dataset.preset : 'fully-lit';

    const opts = {
        preset: presetKey,
        glowColor: document.getElementById('textSaberCustomGlow').value,
        coreColor: document.getElementById('textSaberCustomCore').value,
        coreSize: parseFloat(document.getElementById('textSaberCoreSize').value),
        glowSize: parseFloat(document.getElementById('textSaberGlowSize').value),
        intensity: parseFloat(document.getElementById('textSaberIntensity').value),
        flickerAmount: document.getElementById('textSaberFlicker') ? parseFloat(document.getElementById('textSaberFlicker').value)/100 : 0
    };

    document.getElementById('textSaberCoreSizeVal').textContent = opts.coreSize;
    document.getElementById('textSaberGlowSizeVal').textContent = opts.glowSize;
    document.getElementById('textSaberIntensityVal').textContent = opts.intensity;
    if(document.getElementById('textSaberFlickerVal')) document.getElementById('textSaberFlickerVal').textContent = document.getElementById('textSaberFlicker').value;

    selectedEl.dataset.saberOpts = JSON.stringify(opts);
    
    // Make DOM text transparent to hide it but keep bounding box
    selectedEl.style.color = 'transparent';

    if (window.SaberEngine && typeof SaberEngine.addTextSaber === 'function') {
        const id = selectedEl.id || ('el_' + Math.random().toString(36).substr(2,9));
        selectedEl.id = id;
        SaberEngine.addTextSaber(id, selectedEl, opts);
    }
};
