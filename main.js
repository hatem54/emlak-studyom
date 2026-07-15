/* ============================================================
   main.js — v14.1 Güvenli Sürüm
============================================================ */

function buildTemplates(){
    const g=$('templateGrid');if(!g)return;
    g.innerHTML=''; // Önce temizle
    
    // Boş Sayfa butonu (İlk sırada)
    const emptyBtn=document.createElement('button');
    emptyBtn.className='template-btn active'; // Başlangıçta aktif
    emptyBtn.id='tpl-empty';
    emptyBtn.textContent='⬜ Boş Sayfa';
    emptyBtn.onclick=function(){
        if(typeof clearAllTemplates === 'function') clearAllTemplates();
        if(elBadge)elBadge.style.visibility='hidden';
        if(elPrice)elPrice.style.visibility='hidden';
        if(elDetails)elDetails.style.visibility='hidden';
        if(elLogo)elLogo.style.visibility='hidden';
        const il=document.getElementById('infoLineText');
        if(il)il.style.visibility='hidden';
        document.querySelectorAll('.template-btn').forEach(function(b){b.classList.remove('active');});
        activeLayout = '';
        emptyBtn.classList.add('active');
        console.log('Boş sayfa moduna geçildi');
        if(typeof redrawAll === 'function') redrawAll();
    };
    g.appendChild(emptyBtn);
    
    // Diğer şablonlar
    Object.keys(TPL).forEach(function(k){
        const b=document.createElement('button');
        b.className='template-btn';
        b.id='tpl-'+k;
        b.textContent=TPL[k].name;
        b.onclick=function(){
            if(typeof clearAllTemplates === 'function') clearAllTemplates();
            if(elBadge)elBadge.style.visibility='visible';
            if(elPrice)elPrice.style.visibility='visible';
            if(elDetails)elDetails.style.visibility='visible';
            if(elLogo && elLogo.src && elLogo.src !== window.location.href) elLogo.style.visibility='visible';
            const il=document.getElementById('infoLineText');
            if(il)il.style.visibility='visible';
            setTemplate(k);
        };
        g.appendChild(b);
    });
    
    console.log('✅ Şablonlar oluşturuldu (Boş Sayfa dahil)');
}





function bindInputs(){
    if($('logoInput')){
        $('logoInput').addEventListener('change', e => {
            const f = e.target.files[0];
            if(f){
                const r = new FileReader();
                r.onload = ev => {
                    const logoEl = document.getElementById('elLogo');
                    if(logoEl) {
                        logoEl.src = ev.target.result;
                        logoEl.style.display = 'block';
                        logoEl.style.visibility = 'visible';
                    }
                };
                r.readAsDataURL(f);
            }
            // e.target.value reset removed to show filename
        });
    }

    ['statusInput','priceInput','roomsInput','sizeInput','floorInput','ageInput','heatingInput','bathInput','araziSizeInput','imarInput','adaParselInput','gabariInput','taksInput','kaksInput','cepheInput','tapuInput', 'c_rooms','c_size','c_floor','c_age','c_heating','c_bath','c_araziSize','c_imar','c_adaParsel','c_gabari','c_taks','c_kaks','c_cephe','c_tapu','c_l1','c_v1','c_l2','c_v2','c_l3','c_v3','c_l4','c_v4'].forEach(id=>{
        if($(id))$(id).addEventListener('input',renderData);
    });

    if($('imageInput')){
        $('imageInput').addEventListener('change',e=>{
            const f=e.target.files[0];
            if(f){
                const r=new FileReader();
                r.onload=ev=>{
                    uploadedImgUrl=ev.target.result; if(typeof trackImageSize==='function') trackImageSize(uploadedImgUrl);
                    photoLayer.style.backgroundImage=`url('${ev.target.result}')`;
                    if(isCanvaMode)buildCanvaRender();
                };
                r.readAsDataURL(f);
            }
            // e.target.value reset removed to show filename
        });
    }
}
function bindPhotoFilters(){
    FILTER_IDS.forEach(id=>{if($(id))$(id).addEventListener('input',applyPhotoFilters)});
    if($('shadowsCtrl'))$('shadowsCtrl').addEventListener('input',applyShadowHighlight);
    if($('highlightsCtrl'))$('highlightsCtrl').addEventListener('input',applyShadowHighlight);
    if($('blacksCtrl'))$('blacksCtrl').addEventListener('input',applyShadowHighlight);
    if($('whitesCtrl'))$('whitesCtrl').addEventListener('input',applyShadowHighlight);
}

function init(){
    try {
        console.log('🚀 Init başladı');
        initCoreRefs();
        if(canvasEl){
            canvasEl.style.width='1920px';
            canvasEl.style.height='1080px';
        }
        buildTemplates();
        buildIconCategoriesUI();
        buildFontUI();
        buildElFontSelect();
        if(typeof buildExportFormats==='function')buildExportFormats();
        bindInputs();
        bindElSettings();
        bindPhotoFilters();
        ['photoZoomCtrl','photoXCtrl','photoYCtrl'].forEach(id=>{if($(id))$(id).addEventListener('input',applyPhotoPos)});
        ['fontWeight','fontStyle','letterSpacing','lineHeight','textAlign','textShadowColor','textShadow','textTransform'].forEach(id=>{if($(id))$(id).addEventListener('input',applyFontSettings)});
        if($('fontWeightSlider')){
            $('fontWeightSlider').addEventListener('input',()=>{
                $('fontWeight').value=$('fontWeightSlider').value;
                $('fontWeightSliderVal').textContent=$('fontWeightSlider').value;
                applyFontSettings();
            });
        }
        function syncTopToEdit() {
            if ($('drawEditPanel') && $('drawEditPanel').style.display !== 'none' && typeof liveUpdateDrawEdit === 'function') {
                if($('deColor') && $('drawColor')) $('deColor').value = $('drawColor').value;
                if($('deWidth') && $('drawWidth')) { $('deWidth').value = $('drawWidth').value; if($('deWidthVal')) $('deWidthVal').textContent = $('drawWidth').value; }
                if($('deOpacity') && $('drawOpacity')) { $('deOpacity').value = $('drawOpacity').value; if($('deOpacityVal')) $('deOpacityVal').textContent = $('drawOpacity').value + '%'; }
                if($('deGlow') && $('drawGlow')) { $('deGlow').value = $('drawGlow').value; if($('deGlowVal')) $('deGlowVal').textContent = $('drawGlow').value; }
                if($('deFillColor') && $('fillColor')) $('deFillColor').value = $('fillColor').value;
                if($('deFillOp') && $('fillOpacity')) { $('deFillOp').value = $('fillOpacity').value; if($('deFillOpVal')) $('deFillOpVal').textContent = $('fillOpacity').value + '%'; }
                if($('deFillGlow') && $('fillGlow')) { $('deFillGlow').value = $('fillGlow').value; if($('deFillGlowVal')) $('deFillGlowVal').textContent = $('fillGlow').value; }
                if($('deSaber') && $('drawSaber')) $('deSaber').checked = $('drawSaber').checked;
                liveUpdateDrawEdit();
            }
        }
        if($('drawWidth'))$('drawWidth').addEventListener('input',()=>{ $('drawWidthVal').textContent=$('drawWidth').value+'px'; syncTopToEdit(); });
        if($('drawOpacity'))$('drawOpacity').addEventListener('input',()=>{ $('drawOpacityVal').textContent=$('drawOpacity').value+'%'; syncTopToEdit(); });
        if($('drawDash'))$('drawDash').addEventListener('change', syncTopToEdit);
        if($('fillColor'))$('fillColor').addEventListener('input', syncTopToEdit);
        if($('fillOpacity'))$('fillOpacity').addEventListener('input',()=>{ $('fillOpacityVal').textContent=$('fillOpacity').value+'%'; syncTopToEdit(); });
        if($('drawGlow'))$('drawGlow').addEventListener('input',()=>{ if($('drawGlowVal'))$('drawGlowVal').textContent=$('drawGlow').value; syncTopToEdit(); });
        if($('fillGlow'))$('fillGlow').addEventListener('input',()=>{ if($('fillGlowVal'))$('fillGlowVal').textContent=$('fillGlow').value; syncTopToEdit(); });
        if($('drawColor'))$('drawColor').addEventListener('input', syncTopToEdit);
        if($('drawSaber'))$('drawSaber').addEventListener('change', syncTopToEdit);

        if($('deColor'))$('deColor').addEventListener('input', liveUpdateDrawEdit);
        if($('deFillColor'))$('deFillColor').addEventListener('input', liveUpdateDrawEdit);
        if($('deWidth'))$('deWidth').addEventListener('input',()=>{if($('deWidthVal'))$('deWidthVal').textContent=$('deWidth').value; liveUpdateDrawEdit();});
        if($('deOpacity'))$('deOpacity').addEventListener('input',()=>{if($('deOpacityVal'))$('deOpacityVal').textContent=$('deOpacity').value+'%'; liveUpdateDrawEdit();});
        if($('deGlow'))$('deGlow').addEventListener('input',()=>{if($('deGlowVal'))$('deGlowVal').textContent=$('deGlow').value; liveUpdateDrawEdit();});
        if($('deFillOp'))$('deFillOp').addEventListener('input',()=>{if($('deFillOpVal'))$('deFillOpVal').textContent=$('deFillOp').value+'%'; liveUpdateDrawEdit();});
        if($('deFillGlow'))$('deFillGlow').addEventListener('input',()=>{if($('deFillGlowVal'))$('deFillGlowVal').textContent=$('deFillGlow').value; liveUpdateDrawEdit();});
        if($('deSaber'))$('deSaber').addEventListener('change', liveUpdateDrawEdit);
        if($('batchInput'))$('batchInput').addEventListener('change',e=>{batchFiles=batchFiles.concat(Array.from(e.target.files));renderBatchList();e.target.value='';});
        if(drawCanvas){
            drawCanvas.addEventListener('mousedown',dStart);
            drawCanvas.addEventListener('mousemove',dMove);
            drawCanvas.addEventListener('mouseup',dEnd);
            drawCanvas.addEventListener('mouseleave',e=>{if(isDrawing)dEnd(e)});
            drawCanvas.addEventListener('touchstart',dStart,{passive:false});
            drawCanvas.addEventListener('touchmove',dMove,{passive:false});
            drawCanvas.addEventListener('touchend',dEnd,{passive:false});
        }
        [elBadge,elPrice,elDetails,elLogo].forEach(el=>{if(el)bindDrag(el)});
        if(elLogo) {
            elLogo.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                if(confirm('Logoyu kaldırmak istiyor musunuz?')) {
                    elLogo.src = '';
                    elLogo.style.display = 'none';
                    elLogo.style.visibility = 'hidden';
                }
            });
        }
        [elBadge,elPrice,elDetails].forEach(el=>{if(el)enableInlineEdit(el)});
        if(canvasEl){
            canvasEl.addEventListener('mousedown',e=>{
                if(drawMode!=='off')return;
                if(!e.target.closest('.canvas-el')&&!e.target.closest('.added-icon')&&!e.target.closest('.draggable'))deselectAll();
            });
        }
        if(photoLayer)enablePhotoDrag(photoLayer);
        setDrawMode('off');
        resizeCanvas();
        window.addEventListener('resize',resizeCanvas);
                // setTemplate('t1'); // Otomatik şablon kapatıldı
renderData();
applyFontSettings();

// ✅ Uygulama açılışında şablon elemanlarını GİZLE
setTimeout(function(){
    if(elBadge) elBadge.style.visibility = 'hidden';
    if(elPrice) elPrice.style.visibility = 'hidden';
    if(elDetails) elDetails.style.visibility = 'hidden';
    if(elLogo) elLogo.style.visibility = 'hidden';
    if(elLogo) elLogo.style.visibility = 'hidden';
    var infoLine = document.getElementById('infoLineText');
    if(infoLine) infoLine.style.visibility = 'hidden';
    console.log('🎨 Boş başlangıç');
}, 100);
        
        // Close all tabs by default on mobile
        if(window.innerWidth <= 768) {
            // Set default format to 9:16 on mobile load
            const formatSelect = document.getElementById('previewFormat');
            const exportSelect = document.getElementById('exportFormat');
            if (formatSelect) {
                formatSelect.value = '9:16 Instagram/TikTok Story';
                if (typeof switchPreviewFormat === 'function') switchPreviewFormat();
            }
            if (exportSelect) {
                exportSelect.value = '9:16 Instagram/TikTok Story';
            }
            document.querySelectorAll('#mainTabs .tab-btn').forEach(b=>b.classList.remove('active'));
            document.querySelectorAll('.panel>.dynamic-field').forEach(f=>f.classList.remove('show'));
            const mo = document.getElementById('mobileSheetOverlay');
            if(mo) { mo.style.display='none'; mo.style.opacity='0'; }
        }
        
        console.log('🎉 Init tamamlandı');
    } catch(err){
        console.error('❌ INIT HATASI:',err);
        alert('HATA: '+err.message+'\n\nF12 → Console açıp ekran görüntüsü at.');
    }
}
window.addEventListener('DOMContentLoaded',init);

// ========== CALLOUT MODÜLÜ ==========

// Obsolete renderCalloutPool removed
// Sürükleme fonksiyonu (yoksa)






// ========== FOTOĞRAF ZOOM & PAN v4 - TRANSFORM ==========
console.log('🎬 Zoom modülü v4 başlıyor...');

// Photo panel'i transform'a hazırla


// Transform uygula (SADECE iç div'e)


// ========== YARDIMCI: Zoom yapılabilir eleman bul ==========


// ========== TEKERLEK - ZOOM ==========
document.addEventListener('wheel', function(e){
    var el = _getZoomTarget(e.target);
    if(!el) return;
    
    e.preventDefault();
    _preparePhoto(el);
    
    var s = parseFloat(el.dataset.zpScale) || 1;
    s = e.deltaY < 0 ? s + 0.1 : s - 0.1;
    if(s < 0.3) s = 0.3;
    if(s > 5) s = 5;
    
    el.dataset.zpScale = s;
    _applyPhotoTransform(el);
    if(typeof redrawAll === 'function') redrawAll();
    console.log('Zoom:', s.toFixed(2));
}, { passive: false });

// ========== SÜRÜKLEME ==========
var _dragEl = null, _dsx, _dsy, _dix, _diy;

document.addEventListener('mousedown', function(e){
    var el = _getZoomTarget(e.target);
    if(!el) return;
    if(e.button !== 0) return;
    
    _preparePhoto(el);
    
    _dragEl = el;
    _dsx = e.clientX;
    _dsy = e.clientY;
    _dix = parseFloat(el.dataset.zpX) || 0;
    _diy = parseFloat(el.dataset.zpY) || 0;
    
    el.style.cursor = 'grabbing';
    e.preventDefault();
});

document.addEventListener('mousemove', function(e){
    if(!_dragEl) return;
    
    var x = _dix + (e.clientX - _dsx);
    var y = _diy + (e.clientY - _dsy);
    
    _dragEl.dataset.zpX = x;
    _dragEl.dataset.zpY = y;
    _applyPhotoTransform(_dragEl);
    if(typeof redrawAll === 'function') redrawAll();
});

document.addEventListener('mouseup', function(){
    if(_dragEl) _dragEl.style.cursor = 'grab';
    _dragEl = null;
});

// ========== ÇİFT TIK - SIFIRLA ==========
document.addEventListener('dblclick', function(e){
    // Sürgülere (Slider) çift tıklanınca varsayılan değere dönme mantığı
    if (e.target.tagName.toLowerCase() === 'input' && e.target.type === 'range') {
        const input = e.target;
        let defaultVal = null;
        const id = input.id;
        
        if (input.classList.contains('hsl-slider')) {
            defaultVal = 0;
        } else if (typeof FILTER_DEFAULTS !== 'undefined' && FILTER_DEFAULTS[id] !== undefined) {
            defaultVal = FILTER_DEFAULTS[id];
        } else if (id === 'zoomCtrl') {
            defaultVal = 100;
        } else if (id === 'photoZoomCtrl') {
            defaultVal = 100;
        } else if (id === 'photoXCtrl' || id === 'photoYCtrl') {
            defaultVal = 50;
        } else if (id === 'panX' || id === 'panY') {
            defaultVal = 50;
        } else if (id === 'deOpacity') {
            defaultVal = 100;
        } else if (id === 'deFillOp') {
            defaultVal = 0;
        }
        
        if (defaultVal !== null) {
            input.value = defaultVal;
            input.dispatchEvent(new Event('input'));
            if (input.classList.contains('hsl-slider') && typeof processHSL === 'function') {
                processHSL();
            }
        }
        return; // İşlemi burada kes, foto zoom sıfırlamasına gitme
    }

    // Orijinal Zoom Sıfırlama Mantığı
    var el = _getZoomTarget(e.target);
    if(!el) {
        if(e.target.id === 'ui-layer' || e.target.id === 'canvas-container' || e.target.id === 'draw-layer') {
            el = document.getElementById('photo-layer');
        }
    }
    if(!el) return;
    
    el.dataset.zpScale = 1;
    el.dataset.zpX = 0;
    el.dataset.zpY = 0;
    
    const zCtrl = document.getElementById('photoZoomCtrl');
    const xCtrl = document.getElementById('photoXCtrl');
    const yCtrl = document.getElementById('photoYCtrl');
    if(zCtrl) { zCtrl.value = 100; zCtrl.dispatchEvent(new Event('input')); }
    if(xCtrl) { xCtrl.value = 50; xCtrl.dispatchEvent(new Event('input')); }
    if(yCtrl) { yCtrl.value = 50; yCtrl.dispatchEvent(new Event('input')); }
    
    _applyPhotoTransform(el);
    if(typeof redrawAll === 'function') redrawAll();
    console.log('Sıfırlandı');
});

console.log('🎬 Zoom v6 (photo-panel + photo-layer) yüklendi');

// ========== BOŞ SAYFAYA DÖN ==========
function clearAllTemplates(){
    // 1. Canva şablonunu kaldır
    if(typeof clearCanvaTemplate === 'function' && isCanvaMode){
        clearCanvaTemplate(true);
    }
    
    // 2. Standart şablon elemanlarını GİZLE
    if(elBadge) elBadge.style.visibility = 'hidden';
    if(elPrice) elPrice.style.visibility = 'hidden';
    if(elDetails) elDetails.style.visibility = 'hidden';
    var infoLine = document.getElementById('infoLineText');
    if(infoLine) infoLine.style.visibility = 'hidden';
    
    // 3. Aktif şablon değişkenini sıfırla
    if(typeof activeTemplate !== 'undefined') activeTemplate = null;
    
    // 4. Tüm şablon butonlarından "active" class'ını kaldır
    document.querySelectorAll('.template-btn').forEach(function(b){
        b.classList.remove('active');
    });
    
    // 5. Canva kartlarından da active kaldır (varsa)
    document.querySelectorAll('.canva-tpl-card, [class*="canva-card"]').forEach(function(b){
        b.classList.remove('active', 'selected');
    });
    
    console.log('🗑️ Tüm şablonlar temizlendi - Boş sayfa');
}
// ================= NEON CALLOUT INIT =================
const NEON_CALLOUTS = [
    { icon: 'fas fa-home', text: 'GAYRİMENKUL\nDETAYI', cat: 'Temel' },
    { icon: 'fas fa-key', text: 'ANAHTAR\nTESLİM', cat: 'Temel' },
    { icon: 'fas fa-map-marker-alt', text: 'YEREL\nKONUM', cat: 'Temel' },
    { icon: 'fas fa-building', text: 'YENİ\nİLAN', cat: 'Temel' },
    { icon: 'fas fa-search', text: 'ARAMA\nHİZMETİ', cat: 'Temel' },
    { icon: 'fas fa-file-signature', text: 'SÖZLEŞME\nHİZMETİ', cat: 'Temel' },
    { icon: 'fas fa-star', text: 'FIRSAT\nİLAN', cat: 'Temel' },
    { icon: 'fas fa-tag', text: 'SATILIK\nDAİRE', cat: 'Temel' },
    { icon: 'fas fa-calendar-check', text: 'KİRALIK\nDAİRE', cat: 'Temel' },
    { icon: 'fas fa-crown', text: 'LÜKS\nBİNA', cat: 'Özellik' },
    { icon: 'fas fa-tree', text: 'MANZARALI\nKONUM', cat: 'Özellik' },
    { icon: 'fas fa-swimming-pool', text: 'YÜZME\nHAVUZU', cat: 'Özellik' },
    { icon: 'fas fa-parking', text: 'OTOPARK\nDEPOSU', cat: 'Özellik' },
    { icon: 'fas fa-shield-alt', text: 'GÜVENLİK\nSİSTEMİ', cat: 'Özellik' },
    { icon: 'fas fa-ruler-combined', text: 'GENİŞ\nBAHÇE', cat: 'Özellik' },
    { icon: 'fas fa-fire', text: 'ISITMA\nSİSTEMİ', cat: 'Özellik' },
    { icon: 'fas fa-elevator', text: 'ASANSÖR\nLİ', cat: 'Özellik' },
    { icon: 'fas fa-wifi', text: 'AKILLI\nEV', cat: 'Özellik' },
    { icon: 'fas fa-lira-sign', text: 'UYGUN\nFİYAT', cat: 'Fiyat' },
    { icon: 'fas fa-percent', text: 'KREDİYE\nUYGUN', cat: 'Fiyat' },
    { icon: 'fas fa-handshake', text: 'PAZARLIK\nVAR', cat: 'Fiyat' },
    { icon: 'fas fa-video', text: 'VİDEO\nTURU', cat: 'Pazarlama' },
    { icon: 'fas fa-vr-cardboard', text: '3D\nTUR', cat: 'Pazarlama' },
    { icon: 'fas fa-phone-alt', text: 'HEMEN\nARAYIN', cat: 'Pazarlama' },
    { icon: 'fas fa-clock', text: 'ACİL\nSATILIK', cat: 'Pazarlama' },
    { icon: 'fas fa-award', text: 'ONAYLANMIŞ\nİLAN', cat: 'Pazarlama' },
    { icon: 'fas fa-bolt', text: 'HIZLI\nTESLİM', cat: 'Pazarlama' },
];

let selectedCalloutEl = null;

















// Dışarı tıklanınca paneli kapat
document.addEventListener('mousedown', function(e) {
    if (!selectedCalloutEl) return;
    if (selectedCalloutEl.contains(e.target)) return;
    
    const panel = document.getElementById('calloutSettingsPanel');
    if (panel && panel.contains(e.target)) return;
    
    const neonPool = document.getElementById('neonCalloutPool');
    if (neonPool && neonPool.contains(e.target)) return;

    const normalPool = document.getElementById('calloutPool');
    if (normalPool && normalPool.contains(e.target)) return;

    closeCalloutPanel();
}, true);

// Klavye Kısayolları (Delete tuşuyla silme)
document.addEventListener('keydown', function(e) {
    // Eğer bir input veya textarea içindeysek işlem yapma (yazı yazarken silmesin)
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
        return;
    }
    
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (typeof selectedCalloutEl !== 'undefined' && selectedCalloutEl) {
            deleteSelectedCallout();
        } else if (typeof selectedEl !== 'undefined' && selectedEl) {
            // core.js'deki normal elemanlar için silme
            if (typeof deleteSelected === 'function') deleteSelected();
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Şablon ve elementlerin orijinal stillerini kaydet (Sıfırla butonu için)
    const styleObserver = new MutationObserver((mutations) => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    if (node.classList.contains('canvas-el') && !node.dataset.originalStyle) {
                        node.dataset.originalStyle = node.style.cssText;
                    }
                    const els = node.querySelectorAll('.canvas-el');
                    els.forEach(el => {
                        if (!el.dataset.originalStyle) {
                            el.dataset.originalStyle = el.style.cssText;
                        }
                    });
                }
            });
        });
    });
    const renderLayer = document.getElementById('canva-render-layer');
    if(renderLayer) styleObserver.observe(renderLayer, { childList: true, subtree: true });
    
    setTimeout(renderNeonCallouts, 500);

    // Tüm slider'lara (range) çift tıklandığında varsayılan değere dönme özelliği
    document.querySelectorAll('input[type="range"]').forEach(slider => {
        slider.addEventListener('dblclick', function() {
            if (this.hasAttribute('value')) {
                this.value = this.getAttribute('value');
                this.dispatchEvent(new Event('input', { bubbles: true }));
                this.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    });
});



// Mobile Double-Tap to Reset Sliders
let lastSliderTap = 0;
document.addEventListener('touchstart', function(e) {
    if (e.target.tagName && e.target.tagName.toLowerCase() === 'input' && e.target.type === 'range') {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastSliderTap;
        if (tapLength < 600 && tapLength > 0) {
            // Double tap detected, trigger dblclick and PREVENT default browser behavior
            e.preventDefault(); 
            const evt = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window });
            e.target.dispatchEvent(evt);
        }
        lastSliderTap = currentTime;
    }
}, {passive: false});