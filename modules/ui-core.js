// ==================== UI CORE ====================
function initCoreRefs(){
    canvasEl=$('canvas-container');
    photoLayer=$('photo-layer');
    vignetteLayer=$('vignette-layer');
    uiLayer=$('ui-layer');
    shadowOverlay=$('shadow-overlay');
    highlightOverlay=$('highlight-overlay');
    maskLayer=$('mask-layer');
    canvaRenderLayer=$('canva-render-layer');
    elBadge=$('elBadge');
    elPrice=$('elPrice');
    elDetails=$('elDetails');
    elLogo=$('elLogo');
    if (elLogo && elLogo.tagName !== 'IMG') {
        if (!Object.getOwnPropertyDescriptor(elLogo, 'src')) {
            Object.defineProperty(elLogo, 'src', {
                get() {
                    const img = this.querySelector('img');
                    return img ? img.src : '';
                },
                set(val) {
                    const img = this.querySelector('img');
                    if (img) img.src = val;
                },
                configurable: true
            });
        }
    }
    drawCanvas=$('draw-layer');
    drawCtx=drawCanvas.getContext('2d');
}

function switchTab(name){
    const isMobile = window.innerWidth <= 768;
    const btn = document.querySelector('#mainTabs .tab-btn[data-tab="'+name+'"]');
    const isAlreadyActive = btn && btn.classList.contains('active');

    if (isMobile && isAlreadyActive) {
        // Toggle OFF if already active on mobile
        btn.classList.remove('active');
        const panel = document.getElementById('tab-'+name);
        if (panel) panel.classList.remove('show');
        
        // Hide overlay if it exists
        const mo = document.getElementById('mobileSheetOverlay');
        if (mo) { mo.style.display = 'none'; mo.style.opacity = '0'; }
        return; // stop execution
    }

    document.querySelectorAll('#mainTabs .tab-btn').forEach(b => {
        if(b.dataset.tab === name || b === btn) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });

    // Ana butonu (tab) merkeze kaydır (scroll), böylece mobilde seçili olan net görünsün
    if (btn && btn.scrollIntoView) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    
    document.querySelectorAll('.panel>.dynamic-field').forEach(f=>f.classList.remove('show'));
    const targetPanel = document.getElementById('tab-'+name);
    if(targetPanel) targetPanel.classList.add('show');
    
    // Show overlay on mobile when a tab opens
    if (isMobile) {
        const mo = document.getElementById('mobileSheetOverlay');
        if (mo) { mo.style.display = 'block'; mo.style.opacity = '1'; }
    }

    if(name!=='draw' && typeof drawMode !== 'undefined' && drawMode!=='off') setDrawMode('off');
    if(name!=='draw' && typeof applyDrawEdit==='function') applyDrawEdit();
    if(name==='callout' && typeof renderCalloutPanel==='function') renderCalloutPanel();

    if(document.getElementById('kolaj-wrapper')){
        const photoLayer = document.getElementById('photo-layer');
        const canvaRenderLayer = document.getElementById('canva-render-layer');
        if(photoLayer) photoLayer.style.display = 'block';
        if(canvaRenderLayer) canvaRenderLayer.style.display = 'none';
    } else if(typeof isCanvaMode !== 'undefined' && isCanvaMode) {
        const photoLayer = document.getElementById('photo-layer');
        const canvaRenderLayer = document.getElementById('canva-render-layer');
        if(canvaRenderLayer) canvaRenderLayer.style.display = 'block';
        if(photoLayer) photoLayer.style.display = 'none';
    }
}

window.switchPropertyType = function(type) {
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
    
    let html = `<input type="hidden" id="statusInput" value="${config.badge}">`;
    html += `<div class="section-title">✨ ${config.badge} BİLGİLERİ</div>`;
    
    for(let i=0; i<config.fields.length; i+=2) {
        let f1 = config.fields[i];
        let f2 = config.fields[i+1];
        html += '<div class="row-2">';
        html += `<div class="input-group"><label>${f1.label}</label><input type="text" id="${f1.id}" value="${f1.value}" oninput="renderData()"></div>`;
        if(f2) {
            html += `<div class="input-group"><label>${f2.label}</label><input type="text" id="${f2.id}" value="${f2.value}" oninput="renderData()"></div>`;
        }
        html += '</div>';
    }
    
    html += `<div id="dynamicExtraFields"></div>`;
    html += `<button class="btn-action btn-cyan" onclick="addExtraField('dynamic')">+ Bilgi Ekle</button>`;
    
    container.innerHTML = html;
    
    if(document.getElementById('canvaTitle')) document.getElementById('canvaTitle').value = config.badge;
    // Lüks, Elit, Dinamik, Minimal, Kurumsal, Sosyal vs. tüm şablonların başlık alanlarını güncelle
    const allTitleIds = ['canvaLTitle','canvaDTitle','canvaCTitle','canvaKTitle','canvaMTitle','canvaOTitle','canvaPTitle','canvaSTitle','canvaETitle'];
    allTitleIds.forEach(tid => {
        const el = document.getElementById(tid);
        if(el) el.value = config.badge;
    });
    window.currentMode = type;
    renderData();
    if(typeof window.syncKolajFromForm === 'function') window.syncKolajFromForm();
}

window.switchMode = function(m) {
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
}

// ==================== SMART ICON DEFINITIONS & EXTRA FIELDS ====================
const EXTRA_FIELD_ICONS = [
    { icon: 'fa-check-circle', name: 'Onay / Standart', emoji: '✅' },
    { icon: 'fa-car', name: 'Otopark / Garaj', emoji: '🚗' },
    { icon: 'fa-swimming-pool', name: 'Havuz', emoji: '🏊' },
    { icon: 'fa-water', name: 'Deniz / Göl / Su', emoji: '🌊' },
    { icon: 'fa-sun', name: 'Balkon / Teras', emoji: '☀️' },
    { icon: 'fa-mountain', name: 'Manzara / Doğa', emoji: '🏔️' },
    { icon: 'fa-layer-group', name: 'Kat / Bina', emoji: '🏢' },
    { icon: 'fa-bed', name: 'Oda / Yatak', emoji: '🛏️' },
    { icon: 'fa-ruler-combined', name: 'Metrekare / Alan', emoji: '📐' },
    { icon: 'fa-calendar-alt', name: 'Bina Yaşı / Tarih', emoji: '📅' },
    { icon: 'fa-fire', name: 'Isıtma / Kombi / Gaz', emoji: '🔥' },
    { icon: 'fa-snowflake', name: 'Klima / Soğutma', emoji: '❄️' },
    { icon: 'fa-bath', name: 'Banyo / WC', emoji: '🛁' },
    { icon: 'fa-sort-numeric-up', name: 'Asansör', emoji: '⬆️' },
    { icon: 'fa-shield-alt', name: 'Güvenlik / Kamera', emoji: '🛡️' },
    { icon: 'fa-couch', name: 'Eşyalı / Mobilya', emoji: '🛋️' },
    { icon: 'fa-tree', name: 'Bahçe / Peyzaj', emoji: '🌳' },
    { icon: 'fa-file-contract', name: 'Tapu / İskan / Ruhsat', emoji: '📜' },
    { icon: 'fa-drafting-compass', name: 'İmar / Parsel / Emsal', emoji: '📐' },
    { icon: 'fa-credit-card', name: 'Kredi / İpotek', emoji: '💳' },
    { icon: 'fa-coins', name: 'Aidat / Kira / Fiyat', emoji: '💰' },
    { icon: 'fa-subway', name: 'Metro / Ulaşım', emoji: '🚇' },
    { icon: 'fa-city', name: 'Site / Rezidans', emoji: '🏙️' },
    { icon: 'fa-bolt', name: 'Elektrik / Akıllı Ev', emoji: '⚡' },
    { icon: 'fa-key', name: 'Anahtar / Teslim / Devir', emoji: '🔑' },
    { icon: 'fa-phone-alt', name: 'Telefon / İletişim', emoji: '📞' },
    { icon: 'fa-map-marker-alt', name: 'Konum / Lokasyon', emoji: '📍' },
    { icon: 'fa-wifi', name: 'İnternet / Fiber', emoji: '📶' }
];

window.getSmartIconForLabel = function(label) {
    if (!label) return 'fa-check-circle';
    const l = label.toLowerCase();
    if (l.includes('otopark') || l.includes('garaj') || l.includes('araç')) return 'fa-car';
    if (l.includes('havuz') || l.includes('pool')) return 'fa-swimming-pool';
    if (l.includes('deniz') || l.includes('su') || l.includes('göl') || l.includes('sahil') || l.includes('kıyı')) return 'fa-water';
    if (l.includes('balkon') || l.includes('teras') || l.includes('veranda')) return 'fa-sun';
    if (l.includes('manzara') || l.includes('view') || l.includes('dağ') || l.includes('orman')) return 'fa-mountain';
    if (l.includes('kat') || l.includes('bina') || l.includes('apartman') || l.includes('blok')) return 'fa-layer-group';
    if (l.includes('oda') || l.includes('salon') || l.includes('yatak')) return 'fa-bed';
    if (l.includes('m²') || l.includes('alan') || l.includes('metrekare') || l.includes('ölçü')) return 'fa-ruler-combined';
    if (l.includes('yaş') || l.includes('tarih') || l.includes('yapım') || l.includes('sene')) return 'fa-calendar-alt';
    if (l.includes('ısıtma') || l.includes('kombi') || l.includes('doğalgaz') || l.includes('kalorifer') || l.includes('soba')) return 'fa-fire';
    if (l.includes('klima') || l.includes('soğutma') || l.includes('havalandırma')) return 'fa-snowflake';
    if (l.includes('banyo') || l.includes('wc') || l.includes('duş') || l.includes('lavabo')) return 'fa-bath';
    if (l.includes('asansör') || l.includes('lift')) return 'fa-sort-numeric-up';
    if (l.includes('güvenlik') || l.includes('kamera') || l.includes('bekçi') || l.includes('alarm')) return 'fa-shield-alt';
    if (l.includes('eşyalı') || l.includes('mobilya') || l.includes('dekor')) return 'fa-couch';
    if (l.includes('bahçe') || l.includes('peyzaj') || l.includes('ağaç') || l.includes('yeşil')) return 'fa-tree';
    if (l.includes('tapu') || l.includes('hisse') || l.includes('müstakil') || l.includes('iskan') || l.includes('ruhsat')) return 'fa-file-contract';
    if (l.includes('imar') || l.includes('ada') || l.includes('parsel') || l.includes('kaks') || l.includes('emsal') || l.includes('gabari')) return 'fa-drafting-compass';
    if (l.includes('kredi') || l.includes('banka') || l.includes('ipotek') || l.includes('taksit')) return 'fa-credit-card';
    if (l.includes('aidat') || l.includes('kira') || l.includes('depozito') || l.includes('fiyat') || l.includes('bedel')) return 'fa-coins';
    if (l.includes('metro') || l.includes('ulaşım') || l.includes('durak') || l.includes('otobüs') || l.includes('metrobüs')) return 'fa-subway';
    if (l.includes('site') || l.includes('rezidans') || l.includes('kompleks')) return 'fa-city';
    if (l.includes('elektrik') || l.includes('trafo') || l.includes('enerji')) return 'fa-bolt';
    if (l.includes('telefon') || l.includes('iletişim') || l.includes('danışman') || l.includes('ofis') || l.includes('gsm')) return 'fa-phone-alt';
    if (l.includes('konum') || l.includes('lokasyon') || l.includes('adres') || l.includes('merkez')) return 'fa-map-marker-alt';
    if (l.includes('takas') || l.includes('devir') || l.includes('anahtar') || l.includes('teslim')) return 'fa-key';
    if (l.includes('internet') || l.includes('fiber') || l.includes('wifi')) return 'fa-wifi';
    return 'fa-check-circle';
};

window.openExtraIconPicker = function(fieldId) {
    const existing = document.getElementById('extraIconPickerModal');
    if (existing) existing.remove();
    
    const targetBtn = document.getElementById('icn_' + fieldId);
    if (!targetBtn) return;
    
    const modal = document.createElement('div');
    modal.id = 'extraIconPickerModal';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.65); backdrop-filter:blur(4px); z-index:999999; display:flex; align-items:center; justify-content:center;';
    
    const content = document.createElement('div');
    content.style.cssText = 'background:#1e293b; border:1px solid #334155; border-radius:12px; padding:18px; width:90%; max-width:440px; box-shadow:0 20px 50px rgba(0,0,0,0.8); display:flex; flex-direction:column; gap:12px;';
    
    content.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #334155; padding-bottom:10px;">
            <span style="font-weight:700; color:#f8fafc; font-size:14px; display:flex; align-items:center; gap:8px;">
                <span>✨ İkon Seç / Değiştir</span>
            </span>
            <button type="button" onclick="document.getElementById('extraIconPickerModal').remove()" style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer; padding:4px 8px;">✕</button>
        </div>
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; max-height:320px; overflow-y:auto; padding:4px;">
            ${EXTRA_FIELD_ICONS.map(item => `
                <button type="button" class="picker-icon-opt" data-icon="${item.icon}" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; padding:10px 4px; background:#0f172a; border:1px solid #334155; border-radius:8px; color:#e2e8f0; cursor:pointer; transition:all 0.2s; font-size:11px;">
                    <i class="fas ${item.icon}" style="font-size:20px; color:#38bdf8;"></i>
                    <span style="font-size:10px; color:#94a3b8; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:90%;">${item.name.split('/')[0].trim()}</span>
                </button>
            `).join('')}
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    modal.onclick = function(e) {
        if (e.target === modal) modal.remove();
    };
    
    content.querySelectorAll('.picker-icon-opt').forEach(btn => {
        btn.onclick = function() {
            const chosenIcon = this.dataset.icon;
            targetBtn.dataset.icon = chosenIcon;
            targetBtn.dataset.manual = 'true';
            targetBtn.innerHTML = `<i class="fas ${chosenIcon}"></i>`;
            modal.remove();
            renderData();
        };
    });
};

// ==================== DESCRIPTION / EXTRA INFO TOGGLE SYSTEM ====================
window.descTogglesState = {};

window.onDescInputChanged = function() {
    window.syncDescToggles();
    renderData();
};

window.syncDescToggles = function() {
    const descEl = document.getElementById('descInput');
    const toggleSection = document.getElementById('descToggleSection');
    const toggleList = document.getElementById('descToggleList');
    if (!descEl || !toggleList || !toggleSection) return;
    
    const lines = descEl.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
        toggleSection.style.display = 'none';
        toggleList.innerHTML = '';
        return;
    }
    
    toggleSection.style.display = 'block';
    toggleList.innerHTML = '';
    
    lines.forEach((line) => {
        if (window.descTogglesState[line] === undefined) {
            window.descTogglesState[line] = false; // Varsayılan: KAPALI
        }
        const isChecked = window.descTogglesState[line] === true;
        
        const row = document.createElement('div');
        row.className = 'desc-toggle-item';
        row.style.cssText = `display:flex; align-items:center; justify-content:space-between; gap:8px; padding:7px 10px; background:${isChecked ? 'rgba(56,189,248,0.12)' : '#0f172a'}; border:1px solid ${isChecked ? '#0284c7' : '#334155'}; border-radius:6px; cursor:pointer; transition:all 0.2s;`;
        
        let iconHtml = '';
        const emojiMatch = line.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\uD83C-\uD83E][\uDF00-\uDFFF]|\p{Emoji})\s*(.*)$/u);
        let displayText = line;
        if (emojiMatch) {
            iconHtml = `<span style="font-size:15px; flex-shrink:0;">${emojiMatch[1]}</span>`;
            displayText = emojiMatch[2] || line;
        } else {
            const faIcon = window.getSmartIconForLabel(line);
            iconHtml = `<i class="fas ${faIcon}" style="color:#38bdf8; font-size:13px; flex-shrink:0;"></i>`;
        }
        
        const escapedLine = line.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        row.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
                ${iconHtml}
                <span style="font-size:12px; color:${isChecked ? '#f8fafc' : '#94a3b8'}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-decoration:${isChecked ? 'none' : 'none'}; font-weight:${isChecked ? '600' : '400'};">${displayText}</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                <span style="font-size:10px; font-weight:700; color:${isChecked ? '#38bdf8' : '#64748b'};">${isChecked ? 'EKLENDİ' : 'KAPALI'}</span>
                <input type="checkbox" ${isChecked ? 'checked' : ''} style="cursor:pointer; width:16px; height:16px; accent-color:#0284c7;" onclick="event.stopPropagation(); window.setDescToggle('${escapedLine}', this.checked)">
            </div>
        `;
        
        row.onclick = function() {
            window.setDescToggle(line, !window.descTogglesState[line]);
        };
        
        toggleList.appendChild(row);
    });
};

window.setDescToggle = function(line, state) {
    window.descTogglesState[line] = state;
    window.syncDescToggles();
    renderData();
};

window.toggleDescListCollapse = function() {
    const wrapper = document.getElementById('descToggleListWrapper');
    const chevron = document.getElementById('descToggleChevron');
    if (!wrapper) return;
    const isHidden = (wrapper.style.display === 'none' || getComputedStyle(wrapper).display === 'none');
    wrapper.style.display = isHidden ? 'block' : 'none';
    if (chevron) {
        chevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    }
};

window.setAllDescToggles = function(state) {
    const descEl = document.getElementById('descInput');
    if (!descEl) return;
    const lines = descEl.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    lines.forEach(l => {
        window.descTogglesState[l] = state;
    });
    if (state === true) {
        const wrapper = document.getElementById('descToggleListWrapper');
        const chevron = document.getElementById('descToggleChevron');
        if (wrapper) wrapper.style.display = 'block';
        if (chevron) chevron.style.transform = 'rotate(180deg)';
    }
    window.syncDescToggles();
    renderData();
};

window.getActiveDescLines = function() {
    const descEl = document.getElementById('descInput');
    if (!descEl) return [];
    const lines = descEl.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    return lines.filter(l => window.descTogglesState[l] === true);
};

function renderData(){
    try {
        const defaultBadge = (window.propertyForms && window.propertyForms[window.currentMode]) ? window.propertyForms[window.currentMode].badge : 'SATILIK DAİRE';
        const defaultPrice = (window.propertyForms && window.propertyForms[window.currentMode] && window.propertyForms[window.currentMode].fields && window.propertyForms[window.currentMode].fields[0] && window.propertyForms[window.currentMode].fields[0].value) ? window.propertyForms[window.currentMode].fields[0].value : '6.750.000 TL';

        if (typeof elBadge !== 'undefined' && elBadge) {
            elBadge.innerText = $('statusInput') && $('statusInput').value ? $('statusInput').value : defaultBadge;
        }
        if (typeof elPrice !== 'undefined' && elPrice) {
            elPrice.innerText = $('priceInput') && $('priceInput').value ? $('priceInput').value : defaultPrice;
        }

        const v=i=>document.getElementById(i)?document.getElementById(i).value:'';
        let canvaLines=[];
        if (window.currentMode === 'custom') {
            if(v('c_l1')&&v('c_v1'))canvaLines.push(v('c_l1')+': '+v('c_v1'));
            if(v('c_l2')&&v('c_v2'))canvaLines.push(v('c_l2')+': '+v('c_v2'));
            if(v('c_l3')&&v('c_v3'))canvaLines.push(v('c_l3')+': '+v('c_v3'));
            if(v('c_l4')&&v('c_v4'))canvaLines.push(v('c_l4')+': '+v('c_v4'));
        } else if (window.propertyForms && window.propertyForms[window.currentMode]) {
            const config = window.propertyForms[window.currentMode];
            config.fields.forEach(f => {
                if (f.id === 'priceInput') return;
                const inputEl = document.getElementById(f.id);
                const val = inputEl ? inputEl.value : '';
                const currentLabel = (inputEl && inputEl.previousElementSibling && inputEl.previousElementSibling.tagName === 'LABEL') ? inputEl.previousElementSibling.innerText : f.label;
                if (val && val.toLowerCase() !== 'yok') {
                    if (currentLabel !== f.label) {
                        let cleanLabel = currentLabel.replace(' Sayısı', '').replace(' Durumu', '').replace(' Alanı', '').replace(' Türü', '').replace(' Ölçüsü', '').replace(' Bedeli', '');
                        canvaLines.push(cleanLabel + ': ' + val);
                    } else if (f.canvasFormat) {
                        canvaLines.push(f.canvasFormat.replace('{value}', val));
                    } else {
                        canvaLines.push(val);
                    }
                }
            });
            const extraContainer = document.getElementById('dynamicExtraFields') || (window.currentMode && document.getElementById(window.currentMode + 'ExtraFields'));
            if (extraContainer) {
                const rows = extraContainer.querySelectorAll('.extra-field-row, .row-2');
                rows.forEach(r => {
                    const lblInput = r.querySelector('.extra-lbl-input') || r.querySelector('input:nth-child(1)') || r.querySelector('input:nth-child(2)');
                    const valInput = r.querySelector('.extra-val-input') || r.querySelector('input:nth-child(2)') || r.querySelector('input:nth-child(3)');
                    if (lblInput && valInput && lblInput.value.trim() && valInput.value.trim()) {
                        canvaLines.push(lblInput.value.trim() + ': ' + valInput.value.trim());
                    }
                });
            }
        }
        
        // İşaretli / Aktif Açıklama Satırlarını Canva Satırlarına Ekle
        const activeDescLines = window.getActiveDescLines ? window.getActiveDescLines() : [];
        activeDescLines.forEach(l => {
            if(l.trim()) canvaLines.push(l.trim());
        });
        
        if(currentMode!=='custom'){
            const allLines = canvaLines.filter(l=>l.trim().length>0);
            // Tüm şablonlar için en fazla 6 satır (çerçeve taşmasını önler)
            const featsStr = allLines.slice(0,6).join('\n');
            const featsInputs = ['canvaFeatures', 'canvaDFeats', 'canvaCFeats', 'canvaKFeats', 'canvaMFeats', 'canvaOFeats', 'canvaPFeats', 'canvaSFeats', 'canvaLFeats'];
            featsInputs.forEach(id => {
                if(document.getElementById(id)) document.getElementById(id).value = featsStr;
            });
            if(typeof refreshActiveCanvaTemplate === 'function') {
                refreshActiveCanvaTemplate();
            }
        }
        if(currentMode==='custom')return;

        let h='';
        
        if (window.propertyForms && window.propertyForms[window.currentMode]) {
            const config = window.propertyForms[window.currentMode];
            config.fields.forEach(f => {
                if(f.id === 'priceInput') return; // fiyatı yukarda basıyoruz
                const inputEl = document.getElementById(f.id);
                const val = inputEl ? inputEl.value : '';
                const currentLabel = (inputEl && inputEl.previousElementSibling && inputEl.previousElementSibling.tagName === 'LABEL') ? inputEl.previousElementSibling.innerText : f.label;
                if (val && val.toLowerCase() !== 'yok') {
                    let icon = window.getSmartIconForLabel(currentLabel);
                    let cleanLabel = currentLabel.replace(' Sayısı', '').replace(' Durumu', '').replace(' Alanı', '').replace(' Türü', '').replace(' Ölçüsü', '').replace(' Bedeli', '');
                    h += '<div><i class="fas ' + icon + '"></i> ' + cleanLabel + ': <b>' + val + '</b></div>';
                }
            });
            
            const extraContainer = document.getElementById('dynamicExtraFields') || (window.currentMode && document.getElementById(window.currentMode + 'ExtraFields'));
            if (extraContainer) {
                const rows = extraContainer.querySelectorAll('.extra-field-row, .row-2');
                rows.forEach(r => {
                    const lblInput = r.querySelector('.extra-lbl-input') || r.querySelector('input:nth-child(1)') || r.querySelector('input:nth-child(2)');
                    const valInput = r.querySelector('.extra-val-input') || r.querySelector('input:nth-child(2)') || r.querySelector('input:nth-child(3)');
                    const icnBtn = r.querySelector('.extra-icon-btn');
                    
                    if (lblInput && valInput && lblInput.value.trim() && valInput.value.trim()) {
                        const lblVal = lblInput.value.trim();
                        const vVal = valInput.value.trim();
                        let iconClass = icnBtn ? (icnBtn.dataset.icon || window.getSmartIconForLabel(lblVal)) : window.getSmartIconForLabel(lblVal);
                        h += '<div><i class="fas ' + iconClass + '"></i> ' + lblVal + ': <b>' + vVal + '</b></div>';
                    }
                });
            }

            // İşaretli / Seçili Açıklama Satırlarını Çerçeveye Ekle
            if (activeDescLines.length > 0) {
                activeDescLines.forEach(line => {
                    if (!line) return;
                    const emojiMatch = line.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\uD83C-\uD83E][\uDF00-\uDFFF]|\p{Emoji})\s*(.*)$/u);
                    if (emojiMatch) {
                        const emoji = emojiMatch[1];
                        const rest = emojiMatch[2] || line;
                        h += `<div><span style="display:inline-block; width:1.3em; text-align:center; margin-right:4px;">${emoji}</span> <b>${rest}</b></div>`;
                    } else {
                        let icon = window.getSmartIconForLabel(line);
                        h += `<div><i class="fas ${icon}"></i> <b>${line}</b></div>`;
                    }
                });
            }

            // Eğer form ve açıklama tamamen boşsa varsayılan alan değerlerini bas
            if (!h) {
                config.fields.forEach(f => {
                    if (f.id === 'priceInput') return;
                    const val = f.value;
                    if (val && val.toLowerCase() !== 'yok') {
                        let icon = window.getSmartIconForLabel(f.label);
                        let cleanLabel = f.label.replace(' Sayısı', '').replace(' Durumu', '').replace(' Alanı', '').replace(' Türü', '').replace(' Ölçüsü', '').replace(' Bedeli', '');
                        h += '<div><i class="fas ' + icon + '"></i> ' + cleanLabel + ': <b>' + val + '</b></div>';
                    }
                });
            }
        } else if (window.currentMode === 'custom') {
            if(v('c_rooms')) h += '<div><i class="fas fa-bed"></i> Oda: <b>' + v('c_rooms') + '</b></div>';
            if(v('c_size')) h += '<div><i class="fas fa-ruler-combined"></i> Alan: <b>' + v('c_size') + '</b></div>';
            if(v('c_floor')) h += '<div><i class="fas fa-layer-group"></i> Kat: <b>' + v('c_floor') + '</b></div>';
            if(v('c_age')) h += '<div><i class="fas fa-calendar-alt"></i> Yaş: <b>' + v('c_age') + '</b></div>';
            
            // Custom modda da aktif satırları bas
            if (activeDescLines.length > 0) {
                activeDescLines.forEach(line => {
                    h += `<div><i class="fas fa-check-circle"></i> <b>${line}</b></div>`;
                });
            }
        }
        
        const infoLine = $('infoLineText');
        if (infoLine) infoLine.innerHTML = h;

        if (typeof window.syncKolajFromForm === 'function') {
            window.syncKolajFromForm();
        }
    } catch(err) {
        console.error("renderData HATA:", err);
    }
}

function addExtraField(mode){
    mode = mode || (window.currentMode || 'dynamic');
    if (typeof window.extraFieldCounter === 'undefined') window.extraFieldCounter = 0;
    window.extraFieldCounter++;
    const id = 'ex' + window.extraFieldCounter;
    
    if (typeof window.extraFieldsData === 'undefined') window.extraFieldsData = {};
    if (!window.extraFieldsData[mode]) window.extraFieldsData[mode] = [];
    
    let c = document.getElementById(mode + 'ExtraFields') || 
            document.getElementById('dynamicExtraFields') || 
            document.getElementById('konutExtraFields') || 
            document.getElementById('extraFieldsContainer');
            
    if (!c && document.getElementById('dynamicFormContainer')) {
        c = document.createElement('div');
        c.id = 'dynamicExtraFields';
        c.className = 'extra-fields-container';
        document.getElementById('dynamicFormContainer').appendChild(c);
    }
    if (!c) return;

    const row = document.createElement('div');
    row.className = 'extra-field-row';
    row.id = 'row_' + id;
    row.style.cssText = 'display:flex; gap:6px; align-items:center; margin-bottom:6px; background:#1e293b; padding:6px; border-radius:6px; border:1px solid #334155;';
    
    row.innerHTML = `
        <button type="button" class="extra-icon-btn" id="icn_${id}" data-icon="fa-check-circle" onclick="window.openExtraIconPicker('${id}')" title="İkon Seç / Değiştir" style="background:#0f172a; border:1px solid #334155; border-radius:6px; color:#38bdf8; width:34px; height:34px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:14px; flex-shrink:0;">
            <i class="fas fa-check-circle"></i>
        </button>
        <input type="text" id="lbl_${id}" class="extra-lbl-input" placeholder="Başlık (örn: Havuz)" style="flex:1; min-width:0; padding:6px 8px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:4px; font-size:12px;">
        <input type="text" id="val_${id}" class="extra-val-input" placeholder="Değer (örn: Açık Yüzme)" style="flex:1; min-width:0; padding:6px 8px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:4px; font-size:12px;">
        <button type="button" class="remove-field" onclick="removeExtraField('${id}','${mode}')" title="Bilgiyi Sil" style="background:#ef4444; color:#fff; border:none; border-radius:4px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:12px; font-weight:700; flex-shrink:0;">✕</button>
    `;
    
    c.appendChild(row);
    window.extraFieldsData[mode].push(id);
    
    const lblInput = document.getElementById('lbl_' + id);
    const valInput = document.getElementById('val_' + id);
    const icnBtn = document.getElementById('icn_' + id);
    
    if (lblInput) {
        lblInput.addEventListener('input', function() {
            if (icnBtn && !icnBtn.dataset.manual) {
                const autoIcon = window.getSmartIconForLabel(this.value);
                icnBtn.dataset.icon = autoIcon;
                icnBtn.innerHTML = `<i class="fas ${autoIcon}"></i>`;
            }
            renderData();
        });
    }
    if (valInput) {
        valInput.addEventListener('input', renderData);
    }
    
    renderData();
}

function removeExtraField(id, mode){
    mode = mode || (window.currentMode || 'dynamic');
    const r = $('row_' + id) || document.getElementById('row_' + id);
    if (r) r.remove();
    if (typeof window.extraFieldsData !== 'undefined' && window.extraFieldsData[mode]) {
        window.extraFieldsData[mode] = window.extraFieldsData[mode].filter(x => x !== id);
    }
    renderData();
}

function applyCustomCode(){
    const c=document.createElement('div');
    c.innerHTML=$('customHtml').value;
    c.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none';
    uiLayer.appendChild(c);
}

window.closeBottomSheet = function() {
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.panel>.dynamic-field').forEach(f => f.classList.remove('show'));
        document.querySelectorAll('#mainTabs .tab-btn').forEach(b => b.classList.remove('active'));
        const mo = document.getElementById('mobileSheetOverlay');
        if (mo) { mo.style.display = 'none'; mo.style.opacity = '0'; }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.syncDescToggles === 'function') {
        setTimeout(window.syncDescToggles, 150);
    }
});