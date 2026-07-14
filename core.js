








const $=id=>document.getElementById(id);

let currentMode='konut',activeLayout='',scaleFactor=1,selectedEl=null,allIcons=[];
let drawMode='off',isDrawing=false,drawStartX=0,drawStartY=0,drawPaths=[],currentPath=[];
let extraFieldCounter=0,editingDrawIndex=-1,isCanvaMode=false,activeCanvaId='';
let polygonPoints=[],polygonBuilding=false,lastClickTime=0;
const extraFieldsData={konut:[],arazi:[]};
let uploadedImgUrl=''; if(typeof trackImageSize==='function') trackImageSize(uploadedImgUrl);
let canvaOverlays=[];

let uploadedImgW = 1920;
let uploadedImgH = 1080;
function trackImageSize(url) {
    const img = new Image();
    img.onload = function() {
        uploadedImgW = img.naturalWidth || 1920;
        uploadedImgH = img.naturalHeight || 1080;
        const pl = document.getElementById('photo-layer');
        if (pl) {
            pl.dataset.naturalW = uploadedImgW;
            pl.dataset.naturalH = uploadedImgH;
        }
        if(typeof redrawAll === 'function') redrawAll();
    };
    img.src = url;
}



function getBgMetrics(panelW, panelH, imgW, imgH, zoom, posX, posY) {
    let scale = Math.max(panelW / imgW, panelH / imgH);
    if (zoom !== 100) {
        let renderedW = panelW * (zoom / 100);
        scale = renderedW / imgW;
    }
    let renderedW = imgW * scale;
    let renderedH = imgH * scale;
    let offsetX = (panelW - renderedW) * (posX / 100);
    let offsetY = (panelH - renderedH) * (posY / 100);
    return { offsetX, offsetY, scale };
}



let currentFont=FONTS[16].family;
let batchFiles=[];

let canvasEl,photoLayer,vignetteLayer,uiLayer,shadowOverlay,highlightOverlay,maskLayer,canvaRenderLayer;
let elBadge,elPrice,elDetails,elLogo,drawCanvas,drawCtx;

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
    document.querySelectorAll('#mainTabs .tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
    document.querySelectorAll('.panel>.dynamic-field').forEach(f=>f.classList.remove('show'));
    $('tab-'+name).classList.add('show');
    if(name!=='draw'&&drawMode!=='off')setDrawMode('off');
    if(name!=='draw'&&typeof cancelDrawEdit==='function')cancelDrawEdit();
    if(name==='callout' && typeof renderCalloutPanel==='function') renderCalloutPanel();

    if(document.getElementById('kolaj-wrapper')){
        photoLayer.style.display = 'block';
        canvaRenderLayer.style.display = 'none';
    } else if(typeof isCanvaMode !== 'undefined' && isCanvaMode) {
        canvaRenderLayer.style.display = 'block';
        photoLayer.style.display = 'none';
    }
}



































































function resizeCanvas(){
    const w=document.querySelector('.canvas-wrapper');
    const pa=document.querySelector('.preview-area');
    if(!w || !pa) return;
    
    const canvasW=parseInt(canvasEl.style.width)||1920;
    const canvasH=parseInt(canvasEl.style.height)||1080;
    
    const availableW = pa.clientWidth - 40; // padding
    const availableH = window.innerHeight - 150; // padding for top bar/margins
    
    const scaleW = availableW / canvasW;
    const scaleH = availableH / canvasH;
    
    scaleFactor = Math.min(scaleW, scaleH);
    
    w.style.width = (canvasW * scaleFactor) + 'px';
    w.style.height = (canvasH * scaleFactor) + 'px';
    w.style.aspectRatio = 'auto'; // Remove aspect ratio since height is fixed
    
    canvasEl.style.transform='scale('+scaleFactor+')';
}

// Global click tracker for templates
document.addEventListener('click', function(e){
    const card = e.target.closest('.canva-tpl-card, .template-btn');
    if(card) window.lastClickedTemplateElement = card;
}, true);

function refreshActiveCanvaTemplate(){
    if(document.getElementById('kolaj-wrapper')){
        if(typeof _kolajFormatGuncelle === 'function') _kolajFormatGuncelle();
        return;
    }

    if(typeof isCanvaMode === 'undefined' || !isCanvaMode) return;

    if(window.lastClickedTemplateElement) {
        window.lastClickedTemplateElement.classList.remove('active');
        window.lastClickedTemplateElement.click();
        return;
    }

    if (typeof activeCanvaId !== 'undefined' && activeCanvaId) {
        const exactCard = document.querySelector('.canva-tpl-card[data-id="' + activeCanvaId + '"]');
        if (exactCard) {
            exactCard.classList.remove('active');
            exactCard.click();
            return;
        }
    }

    const luksBtn = document.querySelector('#tpl-content-luks .template-btn.active');
    if(luksBtn){
        luksBtn.classList.remove('active');
        luksBtn.click();
        return;
    }

    const activeCard = document.querySelector('.canva-tpl-card.active');
    if(activeCard){
        activeCard.classList.remove('active');
        activeCard.click();
        return;
    }

    if(typeof activeCanvaId !== 'undefined' && activeCanvaId && typeof buildCanvaRender === 'function'){
        buildCanvaRender();
    }
}








window.showGlobalLoadingOverlay = function(durationMs, text) {
    if (document.getElementById('global-loading-mask')) return;
    const overlay = document.createElement('div');
    overlay.id = 'global-loading-mask';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = '#0f172a';
    overlay.style.zIndex = '9999999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.color = '#fbbf24';
    overlay.style.fontSize = '24px';
    overlay.style.fontWeight = 'bold';
    overlay.style.fontFamily = 'sans-serif';
    overlay.style.flexDirection = 'column';
    overlay.style.gap = '15px';
    const displayTxt = text || 'Şablon Yükleniyor...';
    overlay.innerHTML = '<div style="width: 50px; height: 50px; border: 5px solid #fbbf24; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div><div>' + displayTxt + '</div><style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>';
    document.body.appendChild(overlay);
    setTimeout(() => { if(overlay) overlay.remove(); }, durationMs || 500);
};

function setTemplate(k){
    try {
        if(window.showGlobalLoadingOverlay) window.showGlobalLoadingOverlay(400, "Görsel Hazırlanıyor...");
        if(typeof isCanvaMode !== 'undefined' && isCanvaMode) {
            isCanvaMode = false;
            if(typeof clearCanvaTemplate === 'function') clearCanvaTemplate(true);
        }
        activeLayout=k;
        document.querySelectorAll('.template-btn').forEach(b=>b.classList.toggle('active',b.id==='tpl-'+k));
        const t=TPL[k];
        if(!t) return; // Güvenlik kontrolü, eğer boş şablon veya geçersiz bir k geldiyse dur.
        applyStylePos(elBadge,t.badge);
        applyStylePos(elPrice,t.price);
        applyStylePos(elDetails,t.details);
        if(typeof elLogo !== 'undefined' && elLogo && t.logo) {
            applyStylePos(elLogo, t.logo);
        }
        deselectAll();
        renderData();
    } catch(err) {
        console.error("setTemplate HATA:", err);
        const errDiv = document.createElement('div');
        errDiv.style.position = 'fixed'; errDiv.style.top = '50px'; errDiv.style.left = '10px';
        errDiv.style.background = 'red'; errDiv.style.color = 'white'; errDiv.style.zIndex = '999999';
        errDiv.style.padding = '10px'; errDiv.style.fontSize = '14px';
        errDiv.innerText = "setTemplate HATA: " + err.message + "\n\n" + err.stack;
        document.body.appendChild(errDiv);
    }
}

function applyStylePos(el,c){
    el.style.top='';
    el.style.bottom='';
    el.style.left='';
    el.style.right='';
    el.style.transform='';
    if(c.top!==undefined)el.style.top=typeof c.top==='number'?c.top+'px':c.top;
    if(c.bottom!==undefined)el.style.bottom=typeof c.bottom==='number'?c.bottom+'px':c.bottom;
    if(c.left!==undefined)el.style.left=typeof c.left==='number'?c.left+'px':c.left;
    if(c.right!==undefined)el.style.right=typeof c.right==='number'?c.right+'px':c.right;
    if(c.transform)el.style.transform=c.transform;
    if(c.bg)el.style.background=c.bg;
    if(c.color)el.style.color=c.color;
    if(c.radius!==undefined)el.style.borderRadius=c.radius+'px';
    if(c.border)el.style.border=c.border;
    if(c.padding)el.style.padding=c.padding;
    el.dataset.storedBgHex='#0f172a';
    el.dataset.storedBgOpacity='85';
    el.dataset.rotation='0';
    el.dataset.shadowVal='0';
    el.dataset.blurVal='0';
    el.dataset.storedBorderColor='#38bdf8';
    el.dataset.storedBorderWidth='0';
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
};

function renderData(){
    try {
        elBadge.innerText=$('statusInput').value;
        elPrice.innerText=$('priceInput').value || 'FİYAT İÇİN BİZE ULAŞIN';

        const v=i=>document.getElementById(i)?document.getElementById(i).value:'';
        let canvaLines=[];
        if(currentMode==='konut'){
            if(v('roomsInput'))canvaLines.push(v('roomsInput')+' Geniş Salon');
            if(v('sizeInput'))canvaLines.push(v('sizeInput')+' Net Kullanım');
            if(v('heatingInput'))canvaLines.push(v('heatingInput'));
            if(v('floorInput')||v('ageInput'))canvaLines.push((v('floorInput')?v('floorInput'):'')+(v('ageInput')?' / '+v('ageInput')+' Yaşında':''));
        }else if(currentMode==='arazi'){
            if(v('araziSizeInput'))canvaLines.push(v('araziSizeInput')+' Geniş Alan');
            if(v('imarInput'))canvaLines.push(v('imarInput'));
            if(v('adaParselInput'))canvaLines.push('Ada/Parsel: '+v('adaParselInput'));
            if(v('tapuInput'))canvaLines.push(v('tapuInput')+' Tapu');
        }
        
        if(document.getElementById('descInput') && document.getElementById('descInput').value.trim()){
            const dLines = document.getElementById('descInput').value.split('\n');
            dLines.forEach(l => {
                if(l.trim()) canvaLines.push(l.trim());
            });
        }
        
        if(currentMode!=='custom'){
            const featsStr = canvaLines.filter(l=>l.trim().length>0).join('\n');
            const featsInputs = ['canvaFeatures', 'canvaDFeats', 'canvaCFeats', 'canvaKFeats', 'canvaLFeats', 'canvaMFeats', 'canvaOFeats', 'canvaPFeats', 'canvaSFeats', 'kolajAciklama'];
            featsInputs.forEach(id => {
                if(document.getElementById(id)) document.getElementById(id).value = featsStr;
            });
            if(typeof refreshActiveCanvaTemplate === 'function') {
                refreshActiveCanvaTemplate();
            }
        }
        if(currentMode==='custom')return;

        let h='';
        
        if(currentMode==='konut'){
            h+='<div><i class="fas fa-bed"></i> Oda: <b>'+v('roomsInput')+'</b></div><div><i class="fas fa-ruler-combined"></i> Alan: <b>'+v('sizeInput')+'</b></div>';
            if(v('floorInput'))h+='<div><i class="fas fa-layer-group"></i> Kat: <b>'+v('floorInput')+'</b></div>';
            if(v('ageInput'))h+='<div><i class="fas fa-calendar-alt"></i> Yaş: <b>'+v('ageInput')+'</b></div>';
            if(v('heatingInput'))h+='<div><i class="fas fa-fire"></i> Isıtma: <b>'+v('heatingInput')+'</b></div>';
            if(v('bathInput'))h+='<div><i class="fas fa-bath"></i> Banyo: <b>'+v('bathInput')+'</b></div>';
            extraFieldsData.konut.forEach(id=>{const l=$('lbl_'+id),vl=$('val_'+id);if(l&&vl&&(l.value||vl.value))h+='<div><i class="fas fa-check-circle"></i> '+l.value+': <b>'+vl.value+'</b></div>'});
        }else{
            h+='<div><i class="fas fa-ruler-combined"></i> Alan: <b>'+v('araziSizeInput')+'</b></div><div><i class="fas fa-map"></i> İmar: <b>'+v('imarInput')+'</b></div><div><i class="fas fa-layer-group"></i> Ada/P: <b>'+v('adaParselInput')+'</b></div>';
            if(v('gabariInput'))h+='<div><i class="fas fa-building"></i> Gabari: <b>'+v('gabariInput')+'</b></div>';
            if(v('taksInput'))h+='<div><i class="fas fa-chart-area"></i> TAKS: <b>'+v('taksInput')+'</b></div>';
            if(v('kaksInput'))h+='<div><i class="fas fa-chart-bar"></i> KAKS: <b>'+v('kaksInput')+'</b></div>';
            if(v('cepheInput'))h+='<div><i class="fas fa-compass"></i> Cephe: <b>'+v('cepheInput')+'</b></div>';
            if(v('tapuInput'))h+='<div><i class="fas fa-file-contract"></i> Tapu: <b>'+v('tapuInput')+'</b></div>';
            extraFieldsData.arazi.forEach(id=>{const l=$('lbl_'+id),vl=$('val_'+id);if(l&&vl&&(l.value||vl.value))h+='<div><i class="fas fa-check-circle"></i> '+l.value+': <b>'+vl.value+'</b></div>'});
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

function smartParse(){
    let t = $('aiText').value;
    if(!t.trim()) return;

    // Metin içindeki yazıyla yazılmış sayıları rakamlara çevir ("bin dört yüz yirmi dokuz" -> 1429)
    const nums = { 'bir':1, 'iki':2, 'üç':3, 'dört':4, 'beş':5, 'altı':6, 'yedi':7, 'sekiz':8, 'dokuz':9, 
                   'on':10, 'yirmi':20, 'otuz':30, 'kırk':40, 'elli':50, 'altmış':60, 'yetmiş':70, 'seksen':80, 'doksan':90, 
                   'yüz':100, 'bin':1000 };
    // \b doesn't work well for Turkish chars, using lookarounds or simpler non-letter boundaries
    const regex = new RegExp('(^|[^a-zA-ZçğıöşüÇĞİÖŞÜ])((?:(?:' + Object.keys(nums).join('|') + ')(?:[^a-zA-ZçğıöşüÇĞİÖŞÜ]+|$))+)', 'gi');
    t = t.replace(regex, (fullMatch, prefix, matchStr) => {
        let words = matchStr.toLowerCase().trim().split(/[^a-zçğıöşü]+/);
        let total = 0, current = 0, valid = true, wordCount = 0;
        for (let w of words) {
            if(!w) continue;
            let val = nums[w];
            if (!val) { valid = false; break; }
            wordCount++;
            if (val === 100) { current = current === 0 ? 100 : current * 100; }
            else if (val === 1000) { current = current === 0 ? 1000 : current * 1000; total += current; current = 0; }
            else { current += val; }
        }
        let result = total + current;
        return (valid && wordCount > 0 && result > 0) ? prefix + result + matchStr.substring(matchStr.trim().length) : fullMatch;
    });

    // 1. Temel Durum (SATILIK / KİRALIK / GÜNLÜK)
    let status = 'SATILIK';
    if (/kiralık/i.test(t)) status = 'KİRALIK';
    if (/günlük/i.test(t)) status = 'GÜNLÜK KİRALIK';
    
    // Arazi mi Konut mu?
    const araziMatch = t.match(/(arsa|arazi|tarla|bahçe|zeytinlik)/i);
    const isArazi = araziMatch !== null;
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
    $('statusInput').value = finalStatus;
    
    const titleInputs = ['canvaTitle', 'canvaDTitle', 'canvaCTitle', 'canvaKTitle', 'canvaLTitle', 'canvaMTitle', 'canvaOTitle', 'canvaPTitle', 'canvaSTitle', 'kolajBaslik'];
    titleInputs.forEach(id => {
        if(document.getElementById(id)) document.getElementById(id).value = finalStatus;
    });

    // 2. Fiyat Çıkarma
    const priceMatch = t.match(/((?:\d{1,3}(?:[\.\,]\d{3})+|\d+(?:[\.\,]\d+)?))\s*(buçuk|yarım)?\s*(milyon|bin|tl|lira|euro|dolar|€|\$|₺)/i) || 
                       t.match(/fiyat[ıi]?\s*[:=]?\s*((?:\d{1,3}(?:[\.\,]\d{3})+|\d+(?:[\.\,]\d+)?))\s*(buçuk|yarım)?/i);
    
    if (priceMatch) {
        let rawNumStr = priceMatch[1].replace(',', '.');
        let rawNum = parseFloat(rawNumStr);
        let isBucuk = priceMatch[2] ? /buçuk|yarım/i.test(priceMatch[2]) : false;
        let suffix = (priceMatch[3] || (isBucuk ? '' : priceMatch[2]) || '').toLowerCase();
        
        if (isBucuk) {
            rawNum += 0.5;
        }

        let isMilyon = suffix === 'milyon';
        let isBin = suffix === 'bin';
        
        let currency = "TL";
        const currMatch = t.match(/(tl|lira|euro|dolar|€|\$|₺)/i);
        if (currMatch) {
            let c = currMatch[1].toUpperCase();
            if (c === 'LİRA' || c === '₺') c = 'TL';
            currency = c;
        }

        let finalNumStr = rawNum.toLocaleString('tr-TR'); // Default case if neither milyon nor bin
        if (isMilyon || isBin) {
            finalNumStr = (rawNum * (isMilyon ? 1000000 : 1000)).toLocaleString('tr-TR');
        } else if (rawNum > 999) {
            finalNumStr = rawNum.toLocaleString('tr-TR');
        }
        
        const finalPrice = finalNumStr + ' ' + currency;
        $('priceInput').value = finalPrice;
        
        const priceInputs = ['canvaPrice', 'canvaDPrice', 'canvaCPrice', 'canvaKPrice', 'canvaLPrice', 'canvaMPrice', 'canvaOPrice', 'canvaPPrice', 'canvaSPrice'];
        priceInputs.forEach(id => {
            if(document.getElementById(id)) document.getElementById(id).value = finalPrice;
        });
    } else {
        // Eğer metinde fiyat yoksa, ama input'ta varsa bırak. Eğer input tamamen default ise veya boşsa, 'FİYAT İÇİN ARAYINIZ' yap.
        if ($('priceInput').value === '12.500.000 TL' || $('priceInput').value === '6.750.000 TL' || $('priceInput').value === '') {
            $('priceInput').value = 'FİYAT İÇİN BİZE ULAŞIN';
            const priceInputs = ['canvaPrice', 'canvaDPrice', 'canvaCPrice', 'canvaKPrice', 'canvaLPrice', 'canvaMPrice', 'canvaOPrice', 'canvaPPrice', 'canvaSPrice'];
            priceInputs.forEach(id => {
                if(document.getElementById(id)) document.getElementById(id).value = 'FİYAT İÇİN BİZE ULAŞIN';
            });
        }
    }

    // 3. Konut Detayları
    if (!isArazi) {
        const roomMatch = t.match(/(\d)\s*[\+]\s*(\d)/);
        if (roomMatch) $('roomsInput').value = `${roomMatch[1]}+${roomMatch[2]}`;

        const sizeMatch = t.match(/(\d[\d\.\,]*)\s*(?:m2|m²|metrekare|metre\s*kare)/i);
        if (sizeMatch) $('sizeInput').value = sizeMatch[1] + ' m²';

        const floorMatch = t.match(/(\d+)\.?\s*kat/i) || t.match(/(giriş|yüksek giriş|ara kat|zemin|çatı)/i);
        if (floorMatch) {
            let f = floorMatch[1].charAt(0).toUpperCase() + floorMatch[1].slice(1).toLowerCase();
            $('floorInput').value = isNaN(parseInt(f)) ? f : `${f}. Kat`;
        }

        const ageMatch = t.match(/(?:yaş|yaşı)\s*[:=]?\s*(\d+)/i) || t.match(/(\d+)\s*(?:yıllık|yaşında)/i) || t.match(/(sıfır|yeni)/i);
        if (ageMatch) {
            let a = ageMatch[1].toLowerCase();
            $('ageInput').value = (a === 'sıfır' || a === 'yeni') ? '0' : a;
        }
    } 
    // 4. Arazi Detayları
    else {
        const sizeMatch = t.match(/(\d[\d\.\,]*)\s*(?:m2|m²|metrekare|metre\s*kare|dönüm)/i);
        if (sizeMatch) {
            let unit = /dönüm/i.test(sizeMatch[0]) ? 'Dönüm' : 'm²';
            $('araziSizeInput').value = sizeMatch[1] + ' ' + unit;
        }

        const adaParselMatch = t.match(/(?:ada\s*[:=]?\s*)?(\d+)\s*(?:\/|ve|ile|-)\s*(?:parsel\s*[:=]?\s*)?(\d+)/i) || t.match(/(\d+)\s*ada\s*(\d+)\s*parsel/i);
        if (adaParselMatch) $('adaParselInput').value = `${adaParselMatch[1]} / ${adaParselMatch[2]}`;

        const imarMatch = t.match(/(konut|ticari|sanayi|tarım|bağ|bahçe)\s*imar/i) || t.match(/imar\s*[:=]?\s*(var|yok)/i);
        if (imarMatch) $('imarInput').value = imarMatch[1].charAt(0).toUpperCase() + imarMatch[1].slice(1).toLowerCase() + (imarMatch[0].toLowerCase().includes('imar') ? ' İmarlı' : '');
        
        const gabariMatch = t.match(/gabari\s*[:=]?\s*(\d+(?:\.\d+)?)/i) || t.match(/emsal\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
        if (gabariMatch) $('gabariInput').value = gabariMatch[1];
    }
    
    // 5. Ek Açıklamaları Çıkar (Sadece Konum / Temel Özet)
    let originalText = $('aiText').value;
    let locationStr = '';
    
    // Konum bulmak için: "Sakarya, Kaynarca, Gaziler Mahallesinde bulunan..." gibi yapıları ara
    const locMatch = originalText.match(/([a-zA-ZçğıöşüÇĞİÖŞÜ]+(?:\s*,\s*[a-zA-ZçğıöşüÇĞİÖŞÜ]+)*\s*(?:Mahallesi|Mah\.|Köyü|Mevkii|İlçesi|Merkez)(?:'nde|'nda|nde|nda|'de|'da|de|da)?)/i);
    if(locMatch) {
        locationStr = locMatch[1].replace(/(?:'nde|'nda|nde|nda|'de|'da|de|da)$/i, '').trim();
    } else {
        // Bulunamazsa ilk cümlenin başındaki virgüllü kısımları al
        const altLoc = originalText.match(/^([a-zA-ZçğıöşüÇĞİÖŞÜ]+\s*,\s*[a-zA-ZçğıöşüÇĞİÖŞÜ]+)/);
        if(altLoc) locationStr = altLoc[1];
    }
    
    let extraLines = [];
    if(locationStr) {
        extraLines.push('📍 ' + locationStr);
    }
    
    if(document.getElementById('descInput')) {
        document.getElementById('descInput').value = extraLines.join('\n');
    }
    
    renderData();
}




















































// Boş alana tıklayınca seçimi kaldır
document.addEventListener('click', function(e){
    // Eğer tıklanan yer bir canva elemanı, panel veya editor değilse
    if(!e.target.closest('.cvi-item') && 
       !e.target.closest('.cvi-panel') && 
       !e.target.closest('.cvr-base') &&
       !e.target.closest('input') &&
       !e.target.closest('textarea') &&
       !e.target.closest('button')){
        
        // Tüm seçimleri kaldır
        document.querySelectorAll('.selected, [style*="outline"]').forEach(el => {
            el.classList.remove('selected');
            el.style.outline = 'none';
            el.style.boxShadow = '';
        });
    }
});












function calculateTransformParams(ref, curr) {
    if(!ref || !curr) return { scale: 1, dx: 0, dy: 0, v4: false };
    
    let imgW = typeof uploadedImgW !== 'undefined' ? uploadedImgW : 1920;
    let imgH = typeof uploadedImgH !== 'undefined' ? uploadedImgH : 1080;
    
    function getMetricsForState(s) {
        let AbsCX, AbsCY, TotalScale;
        let pW = s.panelW || 1920;
        let pH = s.panelH || 1080;
        let pL = s.panelL || 0;
        let pT = s.panelT || 0;
        let sX = s.sliderX !== undefined ? s.sliderX : 50;
        let sY = s.sliderY !== undefined ? s.sliderY : 50;
        
        if (s.v4) {
            let coverScale = Math.max(pW / imgW, pH / imgH);
            TotalScale = coverScale * s.z;
            
            // Calculate base offset due to background-position
            let offsetX = pW / 2 - (imgW * coverScale) / 2;
            let offsetY = pH / 2 - (imgH * coverScale) / 2;
            if (imgW * coverScale > pW) {
                offsetX = (pW - imgW * coverScale) * (sX / 100);
            }
            if (imgH * coverScale > pH) {
                offsetY = (pH - imgH * coverScale) * (sY / 100);
            }
            
            let BaseAbsCX = pL + offsetX + (imgW * coverScale) / 2;
            let BaseAbsCY = pT + offsetY + (imgH * coverScale) / 2;
            
            // Apply scale distance transform
            let DistX = BaseAbsCX - (pL + pW / 2);
            let DistY = BaseAbsCY - (pT + pH / 2);
            
            let ScaledAbsCX = pL + pW / 2 + DistX * s.z;
            let ScaledAbsCY = pT + pH / 2 + DistY * s.z;
            
            // Apply translation (scaled by z since it's a DOM transform)
            AbsCX = ScaledAbsCX + s.px * s.z;
            AbsCY = ScaledAbsCY + s.py * s.z;
        } else {
            let coverScale = Math.max(pW / imgW, pH / imgH);
            if (s.z != 100) coverScale = (pW * (s.z / 100)) / imgW;
            TotalScale = coverScale * (s.extraZ || 1);
            
            let offsetX = pW / 2 - (imgW * coverScale) / 2;
            let offsetY = pH / 2 - (imgH * coverScale) / 2;
            if (imgW * coverScale > pW) {
                offsetX = (pW - imgW * coverScale) * (s.px / 100);
            }
            if (imgH * coverScale > pH) {
                offsetY = (pH - imgH * coverScale) * (s.py / 100);
            }
            let BaseAbsCX = pL + offsetX + (imgW * coverScale) / 2;
            let BaseAbsCY = pT + offsetY + (imgH * coverScale) / 2;
            
            let DistX = BaseAbsCX - (pL + pW / 2);
            let DistY = BaseAbsCY - (pT + pH / 2);
            
            let ScaledAbsCX = pL + pW / 2 + DistX * (s.extraZ || 1);
            let ScaledAbsCY = pT + pH / 2 + DistY * (s.extraZ || 1);
            
            AbsCX = ScaledAbsCX + (s.extraPx || 0) * (s.extraZ || 1);
            AbsCY = ScaledAbsCY + (s.extraPy || 0) * (s.extraZ || 1);
        }
        return { AbsCX, AbsCY, TotalScale };
    }
    
    let m1 = getMetricsForState(ref);
    let m2 = getMetricsForState(curr);
    
    let relScale = m1.TotalScale === 0 ? 1 : m2.TotalScale / m1.TotalScale;
    let dx = m2.AbsCX - m1.AbsCX * relScale;
    let dy = m2.AbsCY - m1.AbsCY * relScale;
    
    return { scale: relScale, dx: dx, dy: dy, v4: curr.v4 };
}



// ==================== PROJE KAYDET / AÇ ====================








// ================= GLOBAL TOOLTIP LOGIC =================

window.addEventListener('DOMContentLoaded', initGlobalTooltip);



// ========== YZ OTOMATIK IYILESTIRME ==========



let isShowingBefore = false;




// --- PIXEL ENGINE ---
let originalImageData = null;
let workingCanvas = null;
let workingCtx = null;
let pixelTimeout = null;



let globalApplyFiltersAfterLoad = false;


// Map processHSL to processPixels for backward compatibility











// Global HSL slider event listener
document.addEventListener('input', function(e) {
    if(e.target.classList && e.target.classList.contains('hsl-slider')) {
        const type = e.target.dataset.type;
        const color = e.target.dataset.color;
        const valSpan = document.getElementById('hsl_'+type+'_'+color+'Val');
        if(valSpan) valSpan.textContent = e.target.value;
        if(typeof processPixels === 'function') processPixels();
    }
});

function duplicateSelected(){
    if(!selectedEl)return;
    const n = selectedEl.cloneNode(true);
    n.removeAttribute('id');
    const left = parseInt(selectedEl.style.left) || 0;
    const top = parseInt(selectedEl.style.top) || 0;
    n.style.left = (left + 20) + 'px';
    n.style.top = (top + 20) + 'px';
    selectedEl.parentNode.appendChild(n);
    if (typeof makeDraggable === 'function' && (n.classList.contains('draggable') || n.classList.contains('canvas-el'))) {
        makeDraggable(n);
    }
    if (typeof selectElement === 'function') {
        setTimeout(() => selectElement(n), 50);
    }
}

// --- UNDO (GERİ AL) / REDO (İLERİ AL) SİSTEMİ ---
window.undoStack = [];
window.redoStack = [];
window.currentHistoryState = "";
window.isUndoing = false;

function initUndoSystem() {
    const renderLayer = document.getElementById('canvas-container');
    if (!renderLayer) return;
    
    window.currentHistoryState = renderLayer.innerHTML;
    
    let historyTimeout;
    const observer = new MutationObserver(() => {
        if (window.isUndoing) return;
        
        clearTimeout(historyTimeout);
        historyTimeout = setTimeout(() => {
            const newState = renderLayer.innerHTML;
            if (window.currentHistoryState !== "" && window.currentHistoryState !== newState) {
                window.undoStack.push(window.currentHistoryState);
                if (window.undoStack.length > 30) window.undoStack.shift();
                window.redoStack = []; // Yeni bir hamle yapıldığında ileri al listesi sıfırlanır
            }
            window.currentHistoryState = newState;
        }, 300); // 300ms bekler, peş peşe olan değişiklikleri (sürükleme gibi) tek adım sayar.
    });
    
    observer.observe(renderLayer, { childList: true, subtree: true, attributes: true, characterData: true });
}

window.undoGlobal = function() {
    if (window.undoStack.length === 0) {
        console.log("Geri alınacak işlem yok.");
        return;
    }
    
    window.redoStack.push(window.currentHistoryState);
    const previousState = window.undoStack.pop();
    const renderLayer = document.getElementById('canvas-container');
    if (!renderLayer) return;
    
    window.isUndoing = true;
    renderLayer.innerHTML = previousState;
    window.currentHistoryState = previousState;
    
    if (typeof makeDraggable === 'function') {
        renderLayer.querySelectorAll('.draggable, .canvas-el, .callout-item, .callout-wrap, .co-neon-block').forEach(el => makeDraggable(el));
    }
    if (typeof deselectAll === 'function') deselectAll();
    
    // Küçük bir gecikmeyle isUndoing'i kapatıyoruz ki observer hemen tetiklenmesin
    setTimeout(() => { window.isUndoing = false; }, 50);
};

window.redoGlobal = function() {
    if (window.redoStack.length === 0) {
        console.log("İleri alınacak işlem yok.");
        return;
    }
    
    window.undoStack.push(window.currentHistoryState);
    const nextState = window.redoStack.pop();
    const renderLayer = document.getElementById('canvas-container');
    if (!renderLayer) return;
    
    window.isUndoing = true;
    renderLayer.innerHTML = nextState;
    window.currentHistoryState = nextState;
    
    if (typeof makeDraggable === 'function') {
        renderLayer.querySelectorAll('.draggable, .canvas-el, .callout-item, .callout-wrap, .co-neon-block').forEach(el => makeDraggable(el));
    }
    if (typeof deselectAll === 'function') deselectAll();
    
    setTimeout(() => { window.isUndoing = false; }, 50);
};

// Global Event Delegates (Undo sonrasi yeniden baglanmayan eventleri yakalamak icin)
document.addEventListener('contextmenu', function(e) {
    const callout = e.target.closest('.callout-item, .callout-wrap, .co-neon-block, .canvas-icon');
    if (callout) {
        e.preventDefault();
        if (confirm('Bu öğeyi silmek istediğinize emin misiniz?')) {
            callout.remove();
        }
    }
});

document.addEventListener('dblclick', function(e) {
    const callout = e.target.closest('.callout-item');
    if (callout && !callout.classList.contains('callout-wrap')) {
        e.stopPropagation();
        const newText = prompt('Metni düzenle:', callout.textContent);
        if(newText !== null && newText.trim()) callout.textContent = newText;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initUndoSystem, 1000); // Uygulama tamamen yüklendikten sonra geçmişi dinlemeye başla
});
