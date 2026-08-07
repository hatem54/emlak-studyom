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
        if(b.dataset.tab === name) b.classList.add('active');
        else b.classList.remove('active');
    });
    
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

function renderData(){
    try {
        elBadge.innerText= $('statusInput') ? $('statusInput').value : '';
        elPrice.innerText= $('priceInput') ? ($('priceInput').value || 'FİYAT İÇİN BİZE ULAŞIN') : 'FİYAT İÇİN BİZE ULAŞIN';

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
        
        if(document.getElementById('descInput') && document.getElementById('descInput').value.trim()){
            const dLines = document.getElementById('descInput').value.split('\n');
            dLines.forEach(l => {
                if(l.trim()) canvaLines.push(l.trim());
            });
        }
        
        if(currentMode!=='custom'){
            const allLines = canvaLines.filter(l=>l.trim().length>0);
            // Tüm şablonlar için en fazla 5 satır (çerçeve taşmasını önler)
            const featsStr = allLines.slice(0,5).join('\n');
            const featsInputs = ['canvaFeatures', 'canvaDFeats', 'canvaCFeats', 'canvaKFeats', 'canvaMFeats', 'canvaOFeats', 'canvaPFeats', 'canvaSFeats', 'kolajAciklama', 'canvaLFeats'];
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
                const val = v(f.id);
                if (val && val.toLowerCase() !== 'yok') {
                    let icon = 'fa-check-circle';
                    const lbl = f.label.toLowerCase();
                    if(lbl.includes('oda') || lbl.includes('daire')) icon = 'fa-bed';
                    else if(lbl.includes('m²') || lbl.includes('alan')) icon = 'fa-ruler-combined';
                    else if(lbl.includes('kat') || lbl.includes('gabari')) icon = 'fa-layer-group';
                    else if(lbl.includes('yaş') || lbl.includes('tarih')) icon = 'fa-calendar-alt';
                    else if(lbl.includes('ısıtma') || lbl.includes('enerji')) icon = 'fa-fire';
                    else if(lbl.includes('banyo')) icon = 'fa-bath';
                    else if(lbl.includes('havuz')) icon = 'fa-swimming-pool';
                    else if(lbl.includes('imar') || lbl.includes('ada') || lbl.includes('parsel') || lbl.includes('konum') || lbl.includes('lokasyon')) icon = 'fa-map-marker-alt';
                    else if(lbl.includes('cephe')) icon = 'fa-compass';
                    else if(lbl.includes('tapu') || lbl.includes('emsal') || lbl.includes('kaks')) icon = 'fa-file-contract';
                    else if(lbl.includes('otopark')) icon = 'fa-car';
                    else if(lbl.includes('asansör')) icon = 'fa-sort-numeric-up';
                    else if(lbl.includes('deniz') || lbl.includes('manzara') || lbl.includes('su')) icon = 'fa-water';
                    else if(lbl.includes('ağaç') || lbl.includes('bahçe') || lbl.includes('peyzaj') || lbl.includes('ahır')) icon = 'fa-tree';
                    else if(lbl.includes('akıllı') || lbl.includes('elektrik')) icon = 'fa-bolt';

                    let cleanLabel = f.label.replace(' Sayısı', '').replace(' Durumu', '').replace(' Alanı', '').replace(' Türü', '').replace(' Ölçüsü', '').replace(' Bedeli', '');
                    h += '<div><i class="fas ' + icon + '"></i> ' + cleanLabel + ': <b>' + val + '</b></div>';
                }
            });
            
            const extraContainer = document.getElementById('dynamicExtraFields');
            if (extraContainer) {
                const rows = extraContainer.querySelectorAll('.row-2');
                rows.forEach(r => {
                    const inputs = r.querySelectorAll('input');
                    if (inputs.length === 2 && inputs[0].value && inputs[1].value) {
                        h += '<div><i class="fas fa-check-circle"></i> ' + inputs[0].value + ': <b>' + inputs[1].value + '</b></div>';
                    }
                });
            }
        } else if (window.currentMode === 'custom') {
            if(v('c_rooms')) h += '<div><i class="fas fa-bed"></i> Oda: <b>' + v('c_rooms') + '</b></div>';
            if(v('c_size')) h += '<div><i class="fas fa-ruler-combined"></i> Alan: <b>' + v('c_size') + '</b></div>';
            if(v('c_floor')) h += '<div><i class="fas fa-layer-group"></i> Kat: <b>' + v('c_floor') + '</b></div>';
            if(v('c_age')) h += '<div><i class="fas fa-calendar-alt"></i> Yaş: <b>' + v('c_age') + '</b></div>';
        }
        
        $('infoLineText').innerHTML=h;
    } catch(err) {
        console.error("renderData HATA:", err);
        const errDiv = document.createElement('div');
        errDiv.style.position = 'fixed'; errDiv.style.top = '100px'; errDiv.style.left = '10px';
        errDiv.style.background = 'blue'; errDiv.style.color = 'white'; errDiv.style.zIndex = '999999';
        errDiv.style.padding = '10px'; errDiv.style.fontSize = '14px';
        errDiv.innerText = "renderData HATA: " + err.message + "\n\n" + err.stack;
        document.body.appendChild(errDiv);
    }
}

function addExtraField(mode){
    extraFieldCounter++;
    const id='ex'+extraFieldCounter;
    const c=$(mode+'ExtraFields');
    const row=document.createElement('div');
    row.className='extra-field-row';
    row.id='row_'+id;
    row.innerHTML='<input type="text" id="lbl_'+id+'" placeholder="Başlık"><input type="text" id="val_'+id+'" placeholder="Değer"><button class="remove-field" onclick="removeExtraField(\''+id+'\',\''+mode+'\')">✕</button>';
    c.appendChild(row);
    extraFieldsData[mode].push(id);
    $('lbl_'+id).addEventListener('input',renderData);
    $('val_'+id).addEventListener('input',renderData);
    renderData();
}

function removeExtraField(id,mode){
    const r=$('row_'+id);
    if(r)r.remove();
    extraFieldsData[mode]=extraFieldsData[mode].filter(x=>x!==id);
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
}