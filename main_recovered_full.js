/* ============================================================
   main.js — v14.1 Güvenli Sürüm
============================================================ */

window.isMobileDevice = function() {
    if (window.innerWidth <= 768) return true;
    if (window.innerWidth <= 1100 && window.innerWidth > window.innerHeight) return true; // Mobile Landscape
    return false;
};

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
        // Favorileri localStorage'dan al
    let favTpls = [];
    try { favTpls = JSON.parse(localStorage.getItem('favTemplates') || '[]'); } catch(e){}

    // TPL nesnesinin anahtarlarini favori durumuna gore sirala (Favoriler ustte)
    const sortedKeys = Object.keys(TPL).sort((a, b) => {
        const aFav = favTpls.includes(a);
        const bFav = favTpls.includes(b);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return 0; // Kendi iclerindeki sira ayni kalir
    });

    // Diger sablonlar
    sortedKeys.forEach(function(k){
        const isFav = favTpls.includes(k);
        
        const btnWrapper = document.createElement('div');
        btnWrapper.style.position = 'relative';
        btnWrapper.style.width = '100%';
        btnWrapper.style.display = 'flex';
        
        const b=document.createElement('button');
        b.className='template-btn';
        b.id='tpl-'+k;
        b.style.flex = '1';
        b.style.paddingRight = '20px';
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
        
        const starBtn = document.createElement('div');
        starBtn.innerHTML = isFav ? '⭐' : '☆';
        starBtn.style.position = 'absolute';
        starBtn.style.right = '5px';
        starBtn.style.top = '50%';
        starBtn.style.transform = 'translateY(-50%)';
        starBtn.style.cursor = 'pointer';
        starBtn.style.fontSize = '14px';
        starBtn.style.zIndex = '2';
        starBtn.style.color = isFav ? '#ffd700' : '#cbd5e1';
        starBtn.style.padding = '5px';
        starBtn.title = isFav ? 'Favorilerden Çikar' : 'Favorilere Ekle';
        starBtn.onclick = function(e) {
            e.stopPropagation(); // Buton tiklamasini engelle
            if (isFav) {
                favTpls = favTpls.filter(id => id !== k);
            } else {
                favTpls.push(k);
            }
            localStorage.setItem('favTemplates', JSON.stringify(favTpls));
            
            // Aktif butonu bul
            const activeBtn = document.querySelector('.template-btn.active');
            const activeId = activeBtn ? activeBtn.id : null;
            
            buildTemplates();
            
            // Aktif butonu geri yukle
            if (activeId) {
                setTimeout(() => {
                    const newBtn = document.getElementById(activeId);
                    if (newBtn) {
                        document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
                        newBtn.classList.add('active');
                    }
                }, 10);
            }
        };
        
        btnWrapper.appendChild(b);
        btnWrapper.appendChild(starBtn);
        g.appendChild(btnWrapper);
    });
    
    console.log('✅ Şablonlar oluşturuldu (Boş Sayfa dahil)');
}





window.clearBgImage = function() {
    uploadedImgUrl = '';
    if (typeof photoLayer !== 'undefined') {
        photoLayer.style.backgroundImage = 'none';
        const innerZoom = photoLayer.querySelector('.photo-inner-zoom');
        if (innerZoom) {
            innerZoom.style.backgroundImage = 'none';
            photoLayer.dataset.zpScale = 1;
            photoLayer.dataset.zpX = 0;
            photoLayer.dataset.zpY = 0;
            if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(photoLayer);
        }
    }
    if ($('imageInput')) $('imageInput').value = '';
    if ($('clearBgBtn')) $('clearBgBtn').style.display = 'none';
    if (typeof isCanvaMode !== 'undefined' && isCanvaMode) {
        if (typeof refreshActiveCanvaTemplate === 'function') refreshActiveCanvaTemplate();
        else if (typeof buildCanvaRender === 'function') buildCanvaRender();
    }
};

window.clearLogoImage = function() {
    const logoEl = document.getElementById('elLogo');
    if(logoEl) {
        logoEl.src = '';
        logoEl.style.display = 'none';
    }
    if ($('logoInput')) $('logoInput').value = '';
    if ($('clearLogoBtn')) $('clearLogoBtn').style.display = 'none';
};

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
                    if ($('clearLogoBtn')) $('clearLogoBtn').style.display = 'block';
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
            if(!f) return;

            const processPhotoChange = () => {
                const r=new FileReader();
                r.onload=ev=>{
                    uploadedImgUrl=ev.target.result; if(typeof trackImageSize==='function') trackImageSize(uploadedImgUrl);
                    
                    // PRELOAD NATIVE IMAGE FOR INSTANT CANVAS RENDERING
                    window._globalNativeImgSrc = uploadedImgUrl;
                    window._globalNativeImg = new Image();
                    window._globalNativeImg.onload = () => console.log('Preloaded global image for instant drag');
                    window._globalNativeImg.src = uploadedImgUrl;
                    
                    photoLayer.style.backgroundImage=`url('${ev.target.result}')`;
                    if (isCanvaMode) {
                        if (typeof refreshActiveCanvaTemplate === 'function') refreshActiveCanvaTemplate();
                        else if (typeof buildCanvaRender === 'function') buildCanvaRender();
                    }
                    if ($('clearBgBtn')) $('clearBgBtn').style.display = 'block';
                };
                r.readAsDataURL(f);
                $('imageInput').value = '';
            };

            // Eğer çizim varsa kullanıcıyı uyar (AŞAMA 3 - KORUMA KURALLARI)
            if (typeof drawPaths !== 'undefined' && drawPaths.length > 0) {
                const modal = document.createElement('div');
                modal.id = 'photo-change-warning-modal';
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100%';
                modal.style.height = '100%';
                modal.style.backgroundColor = 'rgba(15,23,42,0.9)';
                modal.style.zIndex = '9999999';
                modal.style.display = 'flex';
                modal.style.alignItems = 'center';
                modal.style.justifyContent = 'center';
                modal.style.backdropFilter = 'blur(5px)';

                modal.innerHTML = `
                    <div style="background: #1e293b; padding: 30px; border-radius: 12px; width: 420px; max-width: 90%; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; color: white; font-family: 'Inter', sans-serif;">
                        <h3 style="margin-top:0; color:#f87171; font-size: 1.3rem;">⚠️ Çizimler Bulunuyor</h3>
                        <p style="font-size: 1rem; line-height: 1.5; margin-bottom: 25px; color:#cbd5e1;">Bu tasarımda fotoğraf üzerine eklenmiş çizimler bulunuyor. Fotoğraf değişirse bu işaretler yeni görselle uyumunu kaybedebilir.</p>
                        <div style="display:flex; justify-content:center; gap: 15px;">
                            <button id="photo-change-cancel" style="background: #475569; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: background 0.2s;">Vazgeç</button>
                            <button id="photo-change-confirm" style="background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: background 0.2s;">Değiştir ve Çizimleri Sil</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);

                document.getElementById('photo-change-cancel').onclick = () => {
                    modal.remove();
                    $('imageInput').value = ''; 
                };

                document.getElementById('photo-change-confirm').onclick = () => {
                    modal.remove();
                    drawPaths.length = 0; // Çizimleri temizle
                    if (typeof redrawAll === 'function') redrawAll(); // DOM'dan sil
                    processPhotoChange();
                };
            } else {
                processPhotoChange();
            }
        });
    }
}
function bindPhotoFilters(){
    FILTER_IDS.forEach(id=>{if($(id))$(id).addEventListener('input',applyPhotoFilters)});
    if($('shadowsCtrl'))$('shadowsCtrl').addEventListener('input',applyShadowHighlight);
    if($('highlightsCtrl'))$('highlightsCtrl').addEventListener('input',applyShadowHighlight);
    if($('blacksCtrl'))$('blacksCtrl').addEventListener('input',applyShadowHighlight);
    if($('whitesCtrl'))$('whitesCtrl').addEventListener('input',applyShadowHighlight);
    if($('tempCtrl'))$('tempCtrl').addEventListener('input',applyShadowHighlight);
    if($('tintCtrl'))$('tintCtrl').addEventListener('input',applyShadowHighlight);
    if($('vibranceCtrl'))$('vibranceCtrl').addEventListener('input',applyShadowHighlight);
    if($('sharpnessCtrl'))$('sharpnessCtrl').addEventListener('input',applyShadowHighlight);
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
            const handleCanvasClick = e => {
                if(drawMode!=='off')return;
                if(!e.target.closest('.canvas-el')&&!e.target.closest('.added-icon')&&!e.target.closest('.draggable')&&!e.target.closest('.editable-draw')){
                    if (document.activeElement && document.activeElement.contentEditable === 'true') {
                        document.activeElement.blur();
                    }
                    deselectAll();
                }
            };
            canvasEl.addEventListener('mousedown', handleCanvasClick);
            canvasEl.addEventListener('touchstart', handleCanvasClick, {passive: false});
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
        if(window.isMobileDevice()) {
            // Remove tooltips on mobile
            document.querySelectorAll('[data-tooltip]').forEach(el => el.removeAttribute('data-tooltip'));
            
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






// Photo zoom and pan logic moved to modules/photo-zoom.js
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
    const wrap = selectedCalloutEl.closest('.callout-wrap') || selectedCalloutEl;
    if (wrap.contains(e.target)) return;
    
    const tabCallout = document.getElementById('tab-callout');
    if (tabCallout && tabCallout.contains(e.target)) return;
    
    const neonPool = document.getElementById('neonCalloutPool');
    if (neonPool && neonPool.contains(e.target)) return;

    const normalPool = document.getElementById('calloutPool');
    if (normalPool && normalPool.contains(e.target)) return;

    // Eğer sol menüdeki tab butonlarına tıklanıyorsa seçimi kaldırma
    if (e.target.closest('.tab-btn')) return;

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
    
    // Geri Al (Undo) - Ctrl+Z
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (typeof undoLastDraw === 'function') undoLastDraw();
    }
    
    // İleri Al (Redo) - Ctrl+Y veya Ctrl+Shift+Z
    if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') || 
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        if (typeof redoLastDraw === 'function') redoLastDraw();
    }
    
    // İptal / Seçimi Bırak - Escape
    if (e.key === 'Escape') {
        if (typeof deselectAll === 'function') deselectAll();
        if (typeof closePolygon === 'function') closePolygon(); // Eğer çokgen çizimi yarım kaldıysa
    }
});

(() => {
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
document.addEventListener('touchend', function(e) {
    if (e.target.tagName && e.target.tagName.toLowerCase() === 'input' && e.target.type === 'range') {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastSliderTap;
        if (tapLength < 500 && tapLength > 0) {
            e.preventDefault(); 
            const input = e.target;
            let defaultVal = null;
            const id = input.id;
            
            if (input.classList.contains('hsl-slider')) {
                defaultVal = 0;
            } else if (typeof FILTER_DEFAULTS !== 'undefined' && FILTER_DEFAULTS[id] !== undefined) {
                defaultVal = FILTER_DEFAULTS[id];
            } else if (id === 'zoomCtrl' || id === 'photoZoomCtrl') {
                defaultVal = 100;
            } else if (id === 'photoXCtrl' || id === 'photoYCtrl' || id === 'panX' || id === 'panY') {
                defaultVal = 50;
            } else if (id === 'deOpacity') {
                defaultVal = 100;
            } else if (id === 'deFillOp') {
                defaultVal = 0;
            }
            
            if (defaultVal !== null) {
                input.value = defaultVal;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                if (typeof applyPhotoFilters === 'function') applyPhotoFilters();
                if (typeof processPixels === 'function') processPixels(true);
                if (input.classList.contains('hsl-slider') && typeof processHSL === 'function') {
                    processHSL();
                }
            }
            lastSliderTap = 0; // reset
        } else {
            lastSliderTap = currentTime;
        }
    }
}, {passive: false});

// Open in Browser Button Logic
document.addEventListener('click', (e) => {
    if (e.target.closest('#openInBrowserBtn')) {
        const currentUrl = window.location.href;
        if (/Android/i.test(navigator.userAgent)) {
            window.open(currentUrl, '_system');
        } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.open(currentUrl, '_blank');
        } else {
            window.open(currentUrl, '_blank');
        }
        if (typeof toggleMobileMenu === 'function') toggleMobileMenu();
    }
});

// Visual Viewport API for Chrome AI bar
if (window.visualViewport && window.innerWidth <= 640) {
  const adjustLayout = () => {
    const offset = window.innerHeight - window.visualViewport.height;
    document.documentElement.style.setProperty('--browser-bar-height', `${offset}px`);
  };
  window.visualViewport.addEventListener('resize', adjustLayout);
  window.addEventListener('load', adjustLayout);
}



// Polygon and marquee logic moved to modules/polygon.js
// Long press on canvas for before/after comparison
(() => {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) return;
    
    let longPressTimer;
    let startX, startY;
    let didTriggerBeforeAfter = false;
    
    const startPress = (e) => {
        const activeTab = document.querySelector('.tab-btn.active');
        if (!activeTab || activeTab.getAttribute('data-tab') !== 'photo') return;
        if (e.target.closest('.canvas-el') || e.target.closest('.draggable')) return;
        if (typeof drawMode !== 'undefined' && drawMode !== 'off') return;
        
        const c = e.touches ? e.touches[0] : e;
        startX = c.clientX;
        startY = c.clientY;
        didTriggerBeforeAfter = false;
        
        longPressTimer = setTimeout(() => {
            if (typeof toggleBeforeAfter === 'function') {
                toggleBeforeAfter();
                didTriggerBeforeAfter = true;
                if (navigator.vibrate) navigator.vibrate(50);
            }
        }, 300);
    };
    
    const movePress = (e) => {
        if (!longPressTimer) return;
        const c = e.touches ? e.touches[0] : e;
        const dx = Math.abs(c.clientX - startX);
        const dy = Math.abs(c.clientY - startY);
        if (dx > 60 || dy > 60) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    };
    
    const endPress = () => {
        clearTimeout(longPressTimer);
        longPressTimer = null;
        if (didTriggerBeforeAfter && typeof toggleBeforeAfter === 'function') {
            toggleBeforeAfter();
            didTriggerBeforeAfter = false;
        }
    };
    
    canvasContainer.addEventListener('touchstart', startPress, {passive: true});
    canvasContainer.addEventListener('touchmove', movePress, {passive: true});
    canvasContainer.addEventListener('touchend', endPress, {passive: true});
    canvasContainer.addEventListener('touchcancel', endPress, {passive: true});
    
    canvasContainer.addEventListener('mousedown', startPress);
    canvasContainer.addEventListener('mousemove', movePress);
    window.addEventListener('mouseup', endPress);
})();

// Anti-jump for mobile range sliders
document.addEventListener('touchstart', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'range' && window.isMobileDevice()) {
        e.target._initialValue = e.target.value;
        e.target._blockNextInput = true;
        const allowInput = () => { e.target._blockNextInput = false; };
        e.target.addEventListener('touchmove', allowInput, {once: true});
        e.target.addEventListener('touchend', allowInput, {once: true});
        e.target.addEventListener('touchcancel', allowInput, {once: true});
    }
}, true);

document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'range' && window.isMobileDevice()) {
        if (e.target._blockNextInput) {
            e.target.value = e.target._initialValue;
            e.stopImmediatePropagation();
        }
    }
}, true);

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btnSafeDeleteCallout');
    if(btn) {
        let isDrag = false, startX = 0, startY = 0;
        btn.addEventListener('touchstart', (e) => {
            isDrag = false;
            if(e.touches.length) { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }
        }, {passive: true});
        btn.addEventListener('touchmove', (e) => {
            if(e.touches.length) {
                if(Math.abs(e.touches[0].clientX - startX) > 10 || Math.abs(e.touches[0].clientY - startY) > 10) isDrag = true;
            }
        }, {passive: true});
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if(isDrag) { isDrag = false; return; }
            if(typeof deleteSelectedCallout === 'function') deleteSelectedCallout();
        });
    }
});

window.toggleFloatingPanelMode = function(isActive) {
    if (isActive) {
        document.body.classList.add('floating-panels-active');
        const mo = document.getElementById('mobileSheetOverlay');
        if (mo) { mo.style.display = 'none'; mo.style.opacity = '0'; }
        document.querySelectorAll('.dynamic-field').forEach(p => {
            // Give them a default sensible size and position when becoming floating
            p.style.setProperty('top', '10%', 'important');
            p.style.setProperty('left', '10%', 'important');
            p.style.setProperty('width', 'min(85vw, 280px)', 'important');
            p.style.setProperty('min-width', '260px', 'important');
            p.style.setProperty('max-width', '100vw', 'important');
            p.style.setProperty('height', 'min(65vh, 360px)', 'important');
            p.style.setProperty('max-height', '85vh', 'important');
            p.style.setProperty('bottom', 'auto', 'important');
            p.style.setProperty('right', 'auto', 'important');
            
        });
    } else {
        document.body.classList.remove('floating-panels-active');
        document.querySelectorAll('.dynamic-field').forEach(p => {
            p.style.removeProperty('top');
            p.style.removeProperty('left');
            p.style.removeProperty('width');
            p.style.removeProperty('height');
            p.style.removeProperty('bottom');
            p.style.removeProperty('right');
        });
    }
};



// Auto disable logic removed









/* =========================================================
   Z-INDEX SANDWICH FIX (DOM MUTATION OBSERVER)
   =========================================================
   Bu script, canva-render-layer'da bir �ablon olu�turuldu�unda,
   �izim katman�n� (draw-layer) �ablonun i�ine (photo-panel'in 
   hemen �st�ne) ta��r. B�ylece �izimler foto�raf�n �st�nde,
   �er�evelerin ise alt�nda kal�r (Sandvi� y�ntemi).
========================================================= */
document.addEventListener('DOMContentLoaded', function() {
    const renderLayer = document.getElementById('canva-render-layer');
    if (!renderLayer) return;

    const observer = new MutationObserver((mutations) => {
        let shouldProcess = false;
        for (let m of mutations) {
            if (m.type === 'childList') {
                shouldProcess = true; break;
            }
        }
        if (!shouldProcess) return;

        const cvrBase = document.querySelector('.cvr-base');
        const drawCanvas = document.getElementById('draw-layer') || window.drawCanvas;
        if (!drawCanvas) return;

        if (cvrBase) {
            // �ablon aktif, drawCanvas cvrBase i�inde de�ilse ta��
            if (drawCanvas.parentNode !== cvrBase) {
                const photoPanel = cvrBase.querySelector('.photo-panel');
                if (photoPanel) {
                    photoPanel.after(drawCanvas);
                } else {
                    cvrBase.appendChild(drawCanvas);
                }
                
                drawCanvas.style.removeProperty('z-index');
            }
        } else {
            // �ablon yok, drawCanvas eski yerine d�nmeli
            const container = document.getElementById('canvas-container');
            if (container && drawCanvas.parentNode !== container) {
                // mask-layer veya canva-render-layer'dan �nceye koy
                container.insertBefore(drawCanvas, renderLayer);
                drawCanvas.style.removeProperty('z-index');
            }
        }
    });

    observer.observe(renderLayer, { childList: true, subtree: false });
});


