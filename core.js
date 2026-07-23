// Moved getCurrentPhotoState to module
;

// Snap logic moved to modules/snap.js







const $=id=>document.getElementById(id);

let currentMode='satilik_daire',activeLayout='',scaleFactor=1,selectedEl=null,allIcons=[];
let drawMode='off',isDrawing=false,drawStartX=0,drawStartY=0,drawPaths=[],drawRedoPaths=[],currentPath=[];
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
        uploadedImgW = img.naturalWidth || (window.innerWidth <= 768 ? 1080 : 1920);
        uploadedImgH = img.naturalHeight || (window.innerWidth <= 768 ? 1920 : 1080);
        const pl = document.getElementById('photo-layer');
        if (pl) {
            pl.dataset.naturalW = uploadedImgW;
            pl.dataset.naturalH = uploadedImgH;
        }
        
        // Auto-adjust format
        if (typeof autoAdjustFormat === 'function') {
            autoAdjustFormat(uploadedImgW, uploadedImgH);
        }
        
        if(typeof redrawAll === 'function') redrawAll();
    };
    img.src = url;
}

function autoAdjustFormat(imgW, imgH) {
    if (typeof EXPORT_FORMATS === 'undefined' || !imgW || !imgH) return;
    
    const imgRatio = imgW / imgH;
    let closestFormatName = '';
    let smallestDiff = Infinity;
    
    for (const [name, data] of Object.entries(EXPORT_FORMATS)) {
        const formatRatio = data.w / data.h;
        const diff = Math.abs(imgRatio - formatRatio);
        if (diff < smallestDiff) {
            smallestDiff = diff;
            closestFormatName = name;
        }
    }
    
    if (closestFormatName) {
        console.log('Auto-adjusting format to:', closestFormatName, 'based on image size:', imgW, imgH);
        const formatSelect = document.getElementById('previewFormat');
        const exportSelect = document.getElementById('exportFormat');
        
        if (formatSelect) {
            formatSelect.value = closestFormatName;
            if (typeof switchPreviewFormat === 'function') {
                switchPreviewFormat();
            }
        }
        if (exportSelect) {
            exportSelect.value = closestFormatName;
        }
    }
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

// Moved initCoreRefs to module


// Moved switchTab to module




































































// Moved resizeCanvas to module


// Global click tracker for templates
document.addEventListener('click', function(e){
    const card = e.target.closest('.canva-tpl-card, .template-btn');
    if(card) window.lastClickedTemplateElement = card;
}, true);

// Moved refreshActiveCanvaTemplate to module









// Moved showGlobalLoadingOverlay to module
;

// Moved setTemplate to module


// Moved applyStylePos to module


// Moved switchPropertyType to module
;

// Moved switchMode to module
;

// Moved renderData to module


// Moved addExtraField to module


// Moved removeExtraField to module


// Moved applyCustomCode to module


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
    const propMapping = {
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
        
        document.querySelectorAll('.cat-item').forEach(item => item.classList.remove('active'));
        const targetEl = document.querySelector(`.cat-item[onclick*="${foundType}"]`);
        if(targetEl) {
            targetEl.classList.add('active');
            targetEl.closest('.cat-body').classList.add('open');
            const icon = targetEl.closest('.cat-group').querySelector('i');
            if(icon) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        }
        
        window.switchPropertyType(foundType);
        
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












// Moved calculateTransformParams to module




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

// State and Undo logic moved to modules/state.js

// Event listeners moved to modules/events.js
