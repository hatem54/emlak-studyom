/* ============================================================

   main.js — v14.1 Güvenli Sürüm

============================================================ */



window.isMobileDevice = function() {
    return window.innerWidth <= 768 || 
           (window.innerWidth <= 1400 && window.innerHeight < window.innerWidth);
};

// Global image validation logic (Format and Size restriction)
window.validateImageUpload = function(file) {
    if (!file) return false;
    
    // 1. Format Check (Tüm standart görsel türlerini ve uzantıları kabul et)
    const fileName = (file.name || '').toLowerCase();
    const fileType = (file.type || '').toLowerCase();
    const isImageMime = fileType.startsWith('image/') || fileType.includes('jpeg') || fileType.includes('png') || fileType.includes('webp') || fileType.includes('jpg');
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.jfif', '.heic', '.heif', '.bmp', '.gif', '.svg'];
    const hasValidExt = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isImageMime && !hasValidExt && fileType !== '') {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Desteklenmeyen Format!',
                html: 'Lütfen geçerli bir görsel (JPG, PNG, WebP vb.) yükleyin.',
                icon: 'error',
                background: '#1e293b',
                color: '#fff',
                confirmButtonColor: '#3b82f6'
            });
        } else {
            alert('Lütfen geçerli bir görsel (JPG, PNG, WebP vb.) yükleyin.');
        }
        return false;
    }
    
    // 2. Size Check (Maks 35MB)
    const maxSize = 35 * 1024 * 1024;
    if (file.size > maxSize) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Dosya Çok Büyük!',
                text: 'Dosya boyutu çok yüksek (maksimum 35 MB). Lütfen küçültüp tekrar deneyin.',
                icon: 'warning',
                background: '#1e293b',
                color: '#fff',
                confirmButtonColor: '#3b82f6'
            });
        } else {
            alert('Dosya boyutu çok büyük! Maksimum dosya boyutu 35 MB olabilir.');
        }
        return false;
    }
    
    return true;
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

            if(elLogo) {
                const img = elLogo.querySelector('img');
                if ((img && img.src && img.src.length > 10) || (elLogo.src && elLogo.src.length > 10)) {
                    elLogo.style.visibility = 'visible';
                }
            }

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

        // Zoom sistemini kökten temizle (DOM'dan sil)
        const innerZoom = photoLayer.querySelector('.photo-inner-zoom');
        if (innerZoom) innerZoom.remove();
        
        const renderCanvas = photoLayer.querySelector('.photo-render-canvas');
        if (renderCanvas) renderCanvas.remove();

        photoLayer.dataset.zpReady = '0';
        photoLayer.dataset.zpScale = 1;
        photoLayer.dataset.zpX = 0;
        photoLayer.dataset.zpY = 0;
        photoLayer.dataset.savedBg = '';
        if (photoLayer._nativeImg) photoLayer._nativeImg = null;
        if (photoLayer._nativeImgSrc) photoLayer._nativeImgSrc = '';
        window._globalNativeImg = null;
        window._globalNativeImgSrc = '';

    }

    if ($('imageInput')) $('imageInput').value = '';
    if ($('clearBgBtn')) $('clearBgBtn').style.display = 'none';
    if (document.getElementById('bgUploadBtnText')) document.getElementById('bgUploadBtnText').innerText = 'Fotoğraf Seç / Yükle';

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
        logoEl.style.visibility = 'hidden';
    }
    if ($('logoInput')) $('logoInput').value = '';
    if ($('clearLogoBtn')) $('clearLogoBtn').style.display = 'none';
    if (document.getElementById('logoUploadBtnText')) document.getElementById('logoUploadBtnText').innerText = 'Firma Logosu (Opsiyonel)';
    if (typeof deselectAll === 'function') deselectAll();
};

function bindInputs(){
    if($('logoInput')){
        $('logoInput').addEventListener('change', e => {
            const f = e.target.files[0];
            if (!f) return;
            if (!window.validateImageUpload(f)) { e.target.value = ''; return; }
            
            if (typeof window.showAppLoading === 'function') {
                window.showAppLoading('Logo Yükleniyor...', 'Firma logosu optimize ediliyor...');
            }

            const r = new FileReader();
            r.onload = ev => {
                const logoEl = document.getElementById('elLogo');
                if(logoEl) {
                    const img = logoEl.querySelector('img');
                    if (img) {
                        img.src = ev.target.result;
                        img.style.display = 'block';
                    }
                    logoEl.src = ev.target.result;
                    logoEl.style.display = 'block';
                    logoEl.style.visibility = 'visible';
                    logoEl.style.zIndex = '9999';
                    // Logo her zaman en üstte: canvas-container'ın son çocuğuna taşı
                    const canvasContainer = document.getElementById('canvas-container');
                    if (canvasContainer && canvasContainer.lastChild !== logoEl) {
                        canvasContainer.appendChild(logoEl);
                    }

                    const imgTest = new Image();
                    imgTest.onload = () => {
                        const nw = imgTest.naturalWidth || imgTest.width;
                        if (nw > 0) {
                            let initialW = nw;
                            if (initialW > 350) initialW = 350;
                            if (initialW < 120) initialW = 120;
                            logoEl.style.width = initialW + 'px';
                            logoEl.style.height = 'auto';
                        }
                    };
                    imgTest.src = ev.target.result;

                    if (typeof selectElement === 'function') {
                        selectElement(logoEl, false, true);
                    }
                }
                if ($('clearLogoBtn')) $('clearLogoBtn').style.display = 'flex';
                if (document.getElementById('logoUploadBtnText')) document.getElementById('logoUploadBtnText').innerText = 'Logoyu Değiştir';
                if (typeof window.hideAppLoading === 'function') window.hideAppLoading(60);
                if (typeof window.renderLayers === 'function') window.renderLayers();
                if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
            };
            r.onerror = () => {
                if (typeof window.hideAppLoading === 'function') window.hideAppLoading();
            };
            r.readAsDataURL(f);
        });
    }

    ['statusInput','priceInput','roomsInput','sizeInput','floorInput','ageInput','heatingInput','bathInput','araziSizeInput','imarInput','adaParselInput','gabariInput','taksInput','kaksInput','cepheInput','tapuInput', 'c_rooms','c_size','c_floor','c_age','c_heating','c_bath','c_araziSize','c_imar','c_adaParsel','c_gabari','c_taks','c_kaks','c_cephe','c_tapu','c_l1','c_v1','c_l2','c_v2','c_l3','c_v3','c_l4','c_v4'].forEach(id=>{
        if($(id))$(id).addEventListener('input',renderData);
    });

    if($('imageInput')){
        $('imageInput').addEventListener('change',e=>{
            const f=e.target.files[0];
            if(!f) return;

            if(!window.validateImageUpload(f)) { e.target.value = ''; return; }
            
            if (typeof window.showAppLoading === 'function') {
                window.showAppLoading('Fotoğraf Yükleniyor...', 'Görsel işleniyor ve tuvale yerleştiriliyor...');
            }

            const processPhotoChange = async () => {
                const applyFinalImage = (img, finalDataUrl, finalW, finalH) => {
                    uploadedImgUrl = finalDataUrl;
                    window.uploadedImgUrl = finalDataUrl;
                    uploadedImgW = finalW;
                    uploadedImgH = finalH;
                    window.uploadedImgW = uploadedImgW;
                    window.uploadedImgH = uploadedImgH;
                    window._globalNativeImg = img;
                    window._globalNativeImgSrc = finalDataUrl;

                    const pl = document.getElementById('photo-layer');
                    if (pl) {
                        pl.dataset.naturalW = uploadedImgW;
                        pl.dataset.naturalH = uploadedImgH;
                    }

                    // 1. Tuval formatını görselin orijinal ölçülerine uyarla
                    if (typeof autoAdjustFormat === 'function' && window.isRestoringState !== true) {
                        autoAdjustFormat(uploadedImgW, uploadedImgH);
                    }

                    // 2. Tuval boyutlarını doğrudan görsel boyutlarına eşitle
                    const cContainer = document.getElementById('canvas-container');
                    if (cContainer) {
                        cContainer.style.width = uploadedImgW + 'px';
                        cContainer.style.height = uploadedImgH + 'px';
                    }
                    if (typeof canvasEl !== 'undefined' && canvasEl) {
                        canvasEl.style.width = uploadedImgW + 'px';
                        canvasEl.style.height = uploadedImgH + 'px';
                    }
                    const drawCanvas = document.getElementById('draw-layer');
                    if (drawCanvas) {
                        drawCanvas.width = uploadedImgW;
                        drawCanvas.height = uploadedImgH;
                        drawCanvas.style.width = uploadedImgW + 'px';
                        drawCanvas.style.height = uploadedImgH + 'px';
                    }
                    if (window.SaberEngine && typeof window.SaberEngine.resize === 'function') {
                        window.SaberEngine.resize(uploadedImgW, uploadedImgH);
                    }
                
                    // 3. Tuval ölçeğini hesapla
                    if (typeof resizeCanvas === 'function') resizeCanvas();

                    // 4. Fotoğraf katmanını güncelle ve render et
                    document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => {
                        p._nativeImg = img;
                        p._nativeImgSrc = finalDataUrl;
                        p.dataset.savedBg = `url('${finalDataUrl}')`;
                        delete p.dataset.zpScale;
                        delete p.dataset.zpX;
                        delete p.dataset.zpY;
                        const inner = p.querySelector('.photo-inner-zoom');
                        if (inner) inner.style.backgroundImage = `url('${finalDataUrl}')`;
                        p.style.backgroundImage = `url('${finalDataUrl}')`;
                        if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p);
                    });

                    if (typeof isCanvaMode !== 'undefined' && isCanvaMode) {
                        if (typeof refreshActiveCanvaTemplate === 'function') refreshActiveCanvaTemplate();
                        else if (typeof buildCanvaRender === 'function') buildCanvaRender();
                    }

                    if ($('clearBgBtn')) $('clearBgBtn').style.display = 'flex';
                    if (document.getElementById('bgUploadBtnText')) document.getElementById('bgUploadBtnText').innerText = 'Fotoğrafı Değiştir';

                    if (typeof window.updatePhotoLockState === 'function') {
                        window.updatePhotoLockState(true);
                    } else {
                        const lockToggle = document.getElementById('photoLockToggle');
                        if (lockToggle) lockToggle.checked = true;
                        window.isPhotoLocked = true;
                    }
                    if (typeof resetPixelCache === 'function') resetPixelCache();
                    if (typeof resizeCanvas === 'function') resizeCanvas();
                    if (typeof applyPhotoPos === 'function') applyPhotoPos();
                    if (typeof redrawAll === 'function') redrawAll();
                    
                    if (typeof updateDrawHistory === 'function') updateDrawHistory();
                    if (typeof requestAutoSave === 'function') requestAutoSave();
                    
                    if (typeof window.hideAppLoading === 'function') {
                        window.hideAppLoading();
                    }

                    setTimeout(() => {
                        if (typeof window.hideAppLoading === 'function') window.hideAppLoading(60);
                    }, 120);
                };

                try {
                    const objectUrl = URL.createObjectURL(f);
                    
                    const img = new Image();
                    img.onload = () => {
                        let finalW = img.naturalWidth || 1920;
                        let finalH = img.naturalHeight || 1080;
                        
                        // RAM ve iOS Safari Güvenlik Sınırı
                        // PC'de yüksek kaliteyi (12MP) koruyoruz, Mobilde çökme/kesilme olmaması için 3MP seviyesinde tutuyoruz.
                        const isMob = typeof window.isMobileDevice === 'function' ? window.isMobileDevice() : window.innerWidth <= 768;
                        const MAX_DIM = isMob ? 2048 : 4096;
                        const MAX_AREA = isMob ? 3000000 : 12000000;
                        
                        if (finalW > MAX_DIM || finalH > MAX_DIM) {
                            const ratio = Math.min(MAX_DIM / finalW, MAX_DIM / finalH);
                            finalW = Math.round(finalW * ratio);
                            finalH = Math.round(finalH * ratio);
                        }
                        
                        if ((finalW * finalH) > MAX_AREA) {
                            const areaRatio = Math.sqrt(MAX_AREA / (finalW * finalH));
                            finalW = Math.round(finalW * areaRatio);
                            finalH = Math.round(finalH * areaRatio);
                        }
                        
                        try {
                            const offCanvas = document.createElement('canvas');
                            offCanvas.width = finalW;
                            offCanvas.height = finalH;
                            const ctx = offCanvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, finalW, finalH);
                            const scaledDataUrl = offCanvas.toDataURL('image/jpeg', 0.95);
                            URL.revokeObjectURL(objectUrl);
                            
                            const scaledImg = new Image();
                            scaledImg.onload = () => {
                                applyFinalImage(scaledImg, scaledDataUrl, finalW, finalH);
                            };
                            scaledImg.onerror = () => {
                                if (typeof window.showAppToast === 'function') {
                                    window.showAppToast('Görsel işlenirken hata oluştu.', 'error');
                                }
                            };
                            scaledImg.src = scaledDataUrl;
                        } catch (canvasErr) {
                            console.error('Canvas Error:', canvasErr);
                            alert("Canvas Hatası: " + canvasErr.message);
                        }
                    };
                    img.onerror = () => {
                        log('HATA: İlk img yüklenemedi!');
                        URL.revokeObjectURL(objectUrl);
                        alert("Görsel yüklenirken bir hata oluştu.");
                        if (typeof window.hideAppLoading === 'function') window.hideAppLoading();
                    };
                    img.src = objectUrl;
                } catch(err) {
                    console.error('Fotoğraf yükleme hatası:', err);
                    alert("Fotoğraf işlenemedi. Lütfen daha küçük boyutlu bir görsel deneyin.");
                    if (typeof window.hideAppLoading === 'function') window.hideAppLoading();
                }
            };
            // Eğer çizim varsa kullanıcıyı uyar (AŞAMA 3 - KORUMA KURALLARI)
            if (typeof drawPaths !== 'undefined' && drawPaths.length > 0 && typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl) {
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

        if($('batchInput'))$('batchInput').addEventListener('change',e=>{
            const validFiles = Array.from(e.target.files).filter(f => window.validateImageUpload(f));
            if(validFiles.length > 0) {
                batchFiles=batchFiles.concat(validFiles);
                renderBatchList();
            }
            e.target.value='';
        });

        if(drawCanvas){

            drawCanvas.addEventListener('mousedown',dStart);

            drawCanvas.addEventListener('mousemove',dMove);

            drawCanvas.addEventListener('mouseup',dEnd);

            drawCanvas.addEventListener('mouseleave',e=>{if(isDrawing)dEnd(e)});

            drawCanvas.addEventListener('touchstart',dStart,{passive:false});

            drawCanvas.addEventListener('touchmove',dMove,{passive:false});

            drawCanvas.addEventListener('touchend',dEnd,{passive:false});

            // S Pen ve tablet kalem desteği (pointerType='pen' veya 'touch')
            drawCanvas.addEventListener('pointerdown', dStart, {passive: false});
            drawCanvas.addEventListener('pointermove', dMove, {passive: false});
            drawCanvas.addEventListener('pointerup', dEnd, {passive: false});
            drawCanvas.addEventListener('pointercancel', dEnd, {passive: false});
            // Avuç içi reddi: sadece aktif kalem/parmak ile çizim
            drawCanvas.style.touchAction = 'none';

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
                if (e.button !== 0 && e.type === 'mousedown') return; // Sağ tık seçimi bozmasın
                if(drawMode!=='off')return;
                if(!e.target.closest('.canvas-el')&&!e.target.closest('.added-icon')&&!e.target.closest('.draggable')&&!e.target.closest('.editable-draw')&&!e.target.closest('.callout-wrap')&&!e.target.closest('.co-neon-block')&&!e.target.closest('.app-context-menu')){
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

        // iOS orientationchange resize'dan önce tetiklenebilir — açıkça dinle
        window.addEventListener('orientationchange', () => {
            // iOS 100ms sonra boyutu netleştirir
            setTimeout(resizeCanvas, 150);
        });

                // setTemplate('t1'); // Otomatik şablon kapatıldı

renderData();

applyFontSettings();



// ✅ Uygulama açılışında şablon elemanlarını GİZLE

setTimeout(function(){
    if(elBadge) elBadge.style.visibility = 'hidden';
    if(elPrice) elPrice.style.visibility = 'hidden';
    if(elDetails) elDetails.style.visibility = 'hidden';
    
    const logoImg = elLogo ? elLogo.querySelector('img') : null;
    const hasLogo = logoImg && logoImg.src && logoImg.src !== window.location.href && logoImg.src.length > 10;
    if(elLogo && !hasLogo) {
        elLogo.style.visibility = 'hidden';
        elLogo.style.display = 'none';
    }

    var infoLine = document.getElementById('infoLineText');
    if(infoLine) infoLine.style.visibility = 'hidden';
    console.log('🎨 Boş başlangıç');
}, 100);

        

        // Close all tabs by default on mobile

        if(window.isMobileDevice()) {

            // Remove tooltips on mobile

            document.querySelectorAll('[data-tooltip]').forEach(el => el.removeAttribute('data-tooltip'));

            

            // Set default format on mobile load (Orijinal varsayılan ayar: 9:16 Story)
            const formatSelect = document.getElementById('previewFormat');
            const exportSelect = document.getElementById('exportFormat');
            const isLand = window.innerWidth > window.innerHeight;
            const defMobFormat = isLand ? '16:9 Full HD (YouTube/Banner)' : '4:5 Instagram Portrait';
            if (formatSelect) {
                formatSelect.value = defMobFormat;
            }
            if (exportSelect) {
                exportSelect.value = defMobFormat;
            }
            document.querySelectorAll('#mainTabs .tab-btn').forEach(b=>b.classList.remove('active'));
            document.querySelectorAll('.panel>.dynamic-field').forEach(f=>f.classList.remove('show'));
            const mo = document.getElementById('mobileSheetOverlay');
            if(mo) { mo.style.display='none'; mo.style.opacity='0'; }
        }

        console.log('Init tamamlandi');
        window.isInitialLoad = false;
        const initLoader = document.getElementById('initialAppLoader');
        if (initLoader) {
            setTimeout(() => {
                initLoader.style.opacity = '0';
                setTimeout(() => initLoader.remove(), 250);
            }, 500);
        }
    } catch(err){
        console.error('INIT HATASI:',err);
        const initLoader = document.getElementById('initialAppLoader');
        if (initLoader) initLoader.remove();
        alert('HATA: ' + err.message);
    }
}

window.addEventListener('DOMContentLoaded', init);

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
    if (window.isTemplateHidden) window.toggleTemplateVisibility(false);
}

// ========== 👁️ ŞABLONU GEÇİCİ OLARAK GİZLE / GÖSTER ==========
window.isTemplateHidden = false;

window.toggleTemplateVisibility = function(forceState) {
    const newState = typeof forceState === 'boolean' ? forceState : !window.isTemplateHidden;
    window.isTemplateHidden = newState;

    // 1. Canva Render Layer (Kolaj, Dinamik, Lüks, Minimal vb.)
    const canvaLayer = document.getElementById('canva-render-layer');
    if (canvaLayer) {
        if (newState) {
            canvaLayer.dataset.prevDisplay = canvaLayer.style.display || 'block';
            canvaLayer.style.display = 'none';
        } else {
            if (window.isCanvaMode || (canvaLayer.innerHTML && canvaLayer.innerHTML.trim() !== '')) {
                canvaLayer.style.display = canvaLayer.dataset.prevDisplay || 'block';
            }
        }
    }

    // 2. Canva Overlays / Paneller (Elit vb.)
    if (window.canvaOverlays && Array.isArray(window.canvaOverlays)) {
        window.canvaOverlays.forEach(el => {
            if (el) el.style.display = newState ? 'none' : '';
        });
    }
    document.querySelectorAll('.canva-panel, .canva-generated, .cvr-base').forEach(el => {
        el.style.display = newState ? 'none' : '';
    });

    // 3. Standart şablon elemanları (Badge, Price, Details)
    const standardEls = [document.getElementById('elBadge'), document.getElementById('elPrice'), document.getElementById('elDetails')];
    standardEls.forEach(el => {
        if (el) {
            if (newState) {
                el.dataset.prevVis = el.style.visibility || 'visible';
                el.style.visibility = 'hidden';
            } else {
                if (el.dataset.prevVis) {
                    el.style.visibility = el.dataset.prevVis;
                }
            }
        }
    });

    // 4. Arayüz butonlarını güncelle
    if (typeof window.updateTemplateToggleUI === 'function') {
        window.updateTemplateToggleUI(newState);
    }
};

window.updateTemplateToggleUI = function(isHidden) {
    // PC Dock Butonu
    const dockBtn = document.getElementById('dockToggleTemplateBtn');
    const dockSlash = document.getElementById('dockPaletteSlash');
    if (dockBtn) {
        if (isHidden) {
            dockBtn.classList.add('active-hidden');
            dockBtn.title = 'Şablonu Göster (Şu an Gizli)';
            if (dockSlash) dockSlash.style.display = 'block';
        } else {
            dockBtn.classList.remove('active-hidden');
            dockBtn.title = 'Şablonu Geçici Olarak Gizle';
            if (dockSlash) dockSlash.style.display = 'none';
        }
    }

    // Şablonlar Sekmesi Butonu (Mobil & PC Tab)
    const tabBtn = document.getElementById('btnToggleTemplateTab');
    const tabSlash = document.getElementById('tabPaletteSlash');
    const tabText = document.getElementById('tabTemplateEyeText');
    if (tabBtn) {
        if (isHidden) {
            tabBtn.style.background = 'rgba(239, 68, 68, 0.18)';
            tabBtn.style.borderColor = '#ef4444';
            tabBtn.style.color = '#f87171';
            if (tabSlash) tabSlash.style.display = 'block';
            if (tabText) tabText.textContent = 'Şablonu Göster (Gizli)';
        } else {
            tabBtn.style.background = 'rgba(56, 189, 248, 0.15)';
            tabBtn.style.borderColor = 'rgba(56, 189, 248, 0.4)';
            tabBtn.style.color = '#38bdf8';
            if (tabSlash) tabSlash.style.display = 'none';
            if (tabText) tabText.textContent = 'Şablonu Gizle (Geçici)';
        }
    }
};

// ========== 🚀 TÜM SAYFAYI / TUVALİ SIFIRLA (SIFIRDAN BAŞLA) ==========
window.resetEntireWorkspace = function() {
    const doReset = function() {
        // 1. Arka plan görseli ve logo temizle
        if (typeof window.clearBgImage === 'function') window.clearBgImage();
        if (typeof window.clearLogoImage === 'function') window.clearLogoImage();

        // 2. Filtreleri sıfırla
        if (typeof resetFilters === 'function') resetFilters();

        // 3. Şablonları temizle (Canva, Kolaj, Standart vb.)
        if (typeof clearAllTemplates === 'function') clearAllTemplates();
        const canvaRenderLayer = document.getElementById('canva-render-layer');
        if (canvaRenderLayer) {
            canvaRenderLayer.innerHTML = '';
            canvaRenderLayer.style.display = 'none';
        }
        if (typeof window.isCanvaMode !== 'undefined') window.isCanvaMode = false;
        if (typeof window.canvaOverlays !== 'undefined') window.canvaOverlays = [];

        // 4. İkonları sil
        if (typeof deleteAllIcons === 'function') deleteAllIcons();

        // 5. Çizimleri ve serbest çizgileri sil
        if (typeof clearAllDrawings === 'function') clearAllDrawings();
        if (typeof SaberEngine !== 'undefined' && SaberEngine.clearAll) SaberEngine.clearAll();
        const drawLayer = document.getElementById('draw-layer');
        if (drawLayer) {
            const ctx = drawLayer.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, drawLayer.width, drawLayer.height);
        }
        const maskLayer = document.getElementById('mask-layer');
        if (maskLayer) maskLayer.innerHTML = '';

        // 6. Tuvaldeki tüm ek nesneleri (rozetler, ek metinler, çerçeveli yazılar vb.) temizle
        const container = document.getElementById('canvas-container');
        if (container) {
            const extraEls = container.querySelectorAll('.draggable:not(#elBadge):not(#elPrice):not(#elDetails):not(#elLogo), .callout-wrap, .co-neon-block, .svg-callout, .added-icon, .added-text, .custom-text-box, .is-svg-icon, .canvas-el:not(#elBadge):not(#elPrice):not(#elDetails):not(#elLogo)');
            extraEls.forEach(el => el.remove());
        }

        // 7. Standart elemanları gizle ve sıfırla
        const elBadge = document.getElementById('elBadge');
        const elPrice = document.getElementById('elPrice');
        const elDetails = document.getElementById('elDetails');
        if (elBadge) {
            elBadge.style.visibility = 'hidden';
            elBadge.textContent = 'SATILIK EV';
        }
        if (elPrice) {
            elPrice.style.visibility = 'hidden';
            elPrice.textContent = '6.750.000 TL';
        }
        if (elDetails) {
            elDetails.style.visibility = 'hidden';
            const infoLine = document.getElementById('infoLineText');
            if (infoLine) infoLine.innerHTML = '';
        }

        // 8. AI Text / Form alanlarını sıfırla
        const aiText = document.getElementById('aiText');
        if (aiText) aiText.value = '';

        // 9. Zoom ve pan sıfırla
        if (typeof resetCanvasZoomAndPan === 'function') resetCanvasZoomAndPan();

        // 10. Seçimleri kaldır ve panelleri güncelle
        if (typeof deselectAll === 'function') deselectAll();
        if (typeof renderLayersList === 'function') renderLayersList();
        if (typeof updateLayerPanel === 'function') updateLayerPanel();
        if (typeof saveState === 'function') saveState();
        if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
        
        // İlk sekmeye dön
        if (typeof switchTab === 'function') switchTab('data');
    };

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Sayfayı Temizle?',
            text: 'Tüm görsel, şablon, çizim ve eklenen yazılar silinecek, sıfırdan boş bir tuval açılacak.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: '🗑️ Evet, Sıfırla',
            cancelButtonText: 'İptal'
        }).then((result) => {
            if (result.isConfirmed) {
                doReset();
                Swal.fire({
                    title: 'Tuval Sıfırlandı!',
                    text: 'Tertemiz yeni bir çalışma alanı hazırlandı.',
                    icon: 'success',
                    timer: 1400,
                    showConfirmButton: false
                });
            }
        });
    } else {
        if (confirm('Tüm çalışma ve tuval sıfırlansın mı?')) {
            doReset();
        }
    }
};

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
        if (typeof window.undoGlobal === 'function') {
            window.undoGlobal();
        } else if (typeof undoLastDraw === 'function') {
            undoLastDraw();
        }
    }

    // İleri Al (Redo) - Ctrl+Y veya Ctrl+Shift+Z
    if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') || 
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        if (typeof window.redoGlobal === 'function') {
            window.redoGlobal();
        } else if (typeof redoLastDraw === 'function') {
            redoLastDraw();
        }
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

    // ==================== UNIVERSAL SLIDER RESET (INSTANT RENDER ON DBLCLICK) ====================
    window.resetSliderToDefault = function(input) {
        if (!input) return;
        const id = input.id;
        let defaultVal = null;

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
        } else if (input.hasAttribute('value')) {
            defaultVal = input.getAttribute('value');
        } else if (input.defaultValue !== undefined && input.defaultValue !== '') {
            defaultVal = input.defaultValue;
        } else {
            defaultVal = 0;
        }

        if (defaultVal !== null) {
            input.value = defaultVal;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));

            // UI Değer Metinlerini Güncelle
            const valSpanId = id.replace('Ctrl', 'Val') + (id.endsWith('Ctrl') ? '' : 'Val');
            const valSpan = document.getElementById(valSpanId) || document.getElementById(id + 'Val');
            if (valSpan) {
                valSpan.textContent = defaultVal + (id === 'exposure' || id === 'contrast' || id === 'saturate' || id === 'grayscale' || id === 'sepia' || id === 'invertCtrl' || id === 'vignette' ? '%' : (id === 'fblur' ? 'px' : (id === 'hueRotate' ? '°' : '')));
            }

            // CSS Filtrelerini ve Piksel Motorunu (Senkron/Anında) Tetikle
            if (typeof applyPhotoFilters === 'function') applyPhotoFilters();
            if (typeof processPixels === 'function') processPixels(true);
            if (input.classList.contains('hsl-slider') && typeof processHSL === 'function') processHSL();
            if (typeof redrawAll === 'function') redrawAll();
            if (typeof applyShadowHighlight === 'function') applyShadowHighlight();
        }
    };

    // Tüm slider'lara ve slider gruplarına çift tıklandığında anında varsayılana dönme
    document.addEventListener('dblclick', function(e) {
        let slider = null;
        if (e.target.tagName && e.target.tagName.toLowerCase() === 'input' && e.target.type === 'range') {
            slider = e.target;
        } else {
            const group = e.target.closest('.slider-group');
            if (group) {
                slider = group.querySelector('input[type="range"]');
            }
        }
        if (slider) {
            e.preventDefault();
            e.stopPropagation();
            window.resetSliderToDefault(slider);
        }
    });

});

// Mobile Double-Tap to Reset Sliders
let lastSliderTap = 0;
document.addEventListener('touchend', function(e) {
    let slider = null;
    if (e.target.tagName && e.target.tagName.toLowerCase() === 'input' && e.target.type === 'range') {
        slider = e.target;
    } else {
        const group = e.target.closest('.slider-group');
        if (group) {
            slider = group.querySelector('input[type="range"]');
        }
    }

    if (slider) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastSliderTap;
        if (tapLength < 500 && tapLength > 0) {
            e.preventDefault();
            window.resetSliderToDefault(slider);
            lastSliderTap = 0;
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
    let longPressTouchId = null;

    const startPress = (e) => {
        let currentTab = null;
        if (typeof state !== 'undefined' && state.activeTab) {
            currentTab = state.activeTab;
        } else {
            const activeTabBtn = document.querySelector('#mainTabs .tab-btn.active');
            if (activeTabBtn) currentTab = activeTabBtn.getAttribute('data-tab');
        }
        
        if (e.button === 2) return;
        
        if (e.target.closest('.panel') || e.target.closest('.tab-content') || e.target.closest('.dynamic-field') || e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
        
        if (e.target.closest('.canvas-el') || e.target.closest('.draggable')) return;
        if (typeof drawMode !== 'undefined' && drawMode !== 'off') return;
        
        if(longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        
        let c;
        if (e.changedTouches && e.changedTouches.length > 0) {
            c = e.changedTouches[0];
            longPressTouchId = c.identifier;
        } else {
            c = e;
            longPressTouchId = 'mouse';
        }
        startX = c.clientX;
        startY = c.clientY;
        didTriggerBeforeAfter = false;
        
        longPressTimer = setTimeout(() => {
            if (currentTab === 'photo' || currentTab === 'gorsel' || currentTab === 'template' || currentTab === 'sablon') {
                if (typeof setOriginalView === 'function') {
                    setOriginalView(true);
                    didTriggerBeforeAfter = true;
                    if (navigator.vibrate) navigator.vibrate(50);
                }
            } else {
                if (typeof window.startMobileMarquee === 'function') {
                    window.startMobileMarquee(startX, startY);
                    if (navigator.vibrate) navigator.vibrate(50);
                }
            }
        }, 500);
    };

    const movePress = (e) => {
        let c = null;
        if (e.changedTouches) {
            for(let i=0; i<e.changedTouches.length; i++) {
                if(e.changedTouches[i].identifier === longPressTouchId) {
                    c = e.changedTouches[i];
                    break;
                }
            }
            if(!c && e.changedTouches.length > 0) c = e.changedTouches[0];
        } else {
            c = e;
        }
        if (!c) return;
        
        const dx = Math.abs(c.clientX - startX);
        const dy = Math.abs(c.clientY - startY);
        if (dx > 25 || dy > 25) {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            longPressTouchId = null;
            if (didTriggerBeforeAfter) {
                if (typeof setOriginalView === 'function') setOriginalView(false);
                didTriggerBeforeAfter = false;
            }
        }
    };

    const endPress = (e) => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        longPressTouchId = null;
        
        // Ekrana basılı tutma bittiği an her halükarda orijinal görünümü kapat ve şablonu/filtreleri geri yükle
        if (didTriggerBeforeAfter || (typeof isShowingBefore !== 'undefined' && isShowingBefore)) {
            if (typeof setOriginalView === 'function') {
                setOriginalView(false);
            } else if (typeof toggleBeforeAfter === 'function') {
                toggleBeforeAfter(false);
            }
            didTriggerBeforeAfter = false;
            
            if (e && e.cancelable !== false) {
                if(e.preventDefault) e.preventDefault();
                if(e.stopPropagation) e.stopPropagation();
            }
        }
    };

    canvasContainer.addEventListener('touchstart', startPress, {passive: true});
    canvasContainer.addEventListener('touchmove', movePress, {passive: true});
    canvasContainer.addEventListener('touchend', endPress, {passive: false});
    canvasContainer.addEventListener('touchcancel', endPress, {passive: false});
    
    canvasContainer.addEventListener('mousedown', startPress);
    canvasContainer.addEventListener('mousemove', movePress);
    window.addEventListener('mouseup', endPress);
    
    const contextMenuHandler = (e) => {
        let currentTab = null;
        if (typeof state !== 'undefined' && state.activeTab) {
            currentTab = state.activeTab;
        } else {
            const activeTabBtn = document.querySelector('#mainTabs .tab-btn.active');
            if (activeTabBtn) currentTab = activeTabBtn.getAttribute('data-tab');
        }
        if (!currentTab || currentTab === 'photo' || currentTab === 'bilinmiyor') {
            e.preventDefault();
        }
    };
    canvasContainer.addEventListener('contextmenu', contextMenuHandler);

    // Dikey modda canvas'ı kaplayan overlay için aynı event'leri ekle
    const mobileOverlay = document.getElementById('mobileSheetOverlay');
    if (mobileOverlay) {
        mobileOverlay.addEventListener('touchstart', startPress, {passive: true});
        mobileOverlay.addEventListener('touchmove', movePress, {passive: true});
        mobileOverlay.addEventListener('touchend', endPress, {passive: false});
        mobileOverlay.addEventListener('touchcancel', endPress, {passive: false});
        
        mobileOverlay.addEventListener('mousedown', startPress);
        mobileOverlay.addEventListener('mousemove', movePress);
        mobileOverlay.addEventListener('contextmenu', contextMenuHandler);
        
        mobileOverlay.addEventListener('click', (e) => {
            if (!didTriggerBeforeAfter && typeof closeBottomSheet === 'function') {
                closeBottomSheet();
            }
        });
    }

})();

// Smart Anti-Jump for Mobile Range Sliders
document.addEventListener('touchstart', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'range' && window.isMobileDevice && window.isMobileDevice()) {
        e.target._initialValue = e.target.value;
        if(e.touches && e.touches.length) {
            e.target._touchStartX = e.touches[0].clientX;
            e.target._touchStartY = e.touches[0].clientY;
        }
        e.target._isScrolling = false;
        e.target._directionLocked = false;
    }
}, {passive: true, capture: true});

document.addEventListener('touchmove', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'range' && window.isMobileDevice && window.isMobileDevice()) {
        if (!e.touches || !e.touches.length || e.target._directionLocked) return;
        
        const dx = Math.abs(e.touches[0].clientX - e.target._touchStartX);
        const dy = Math.abs(e.touches[0].clientY - e.target._touchStartY);
        
        if (dx > 5 || dy > 5) {
            e.target._directionLocked = true;
            // Dikey hareket yataydan büyükse, kullanıcı menüyü kaydırıyor demektir
            if (dy > dx) {
                e.target._isScrolling = true;
            }
        }
    }
}, {passive: true, capture: true});

document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'range' && window.isMobileDevice && window.isMobileDevice()) {
        // Eğer menü kaydırılıyorsa slider değerinin değişmesini engelle
        if (e.target._isScrolling) {
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





// Taslakları Temizleme (AutoSave DB)
window.confirmClearDrafts = function() {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Taslakları Temizle',
            text: 'Tüm taslak geçmişiniz (IndexedDB) silinecek. Emin misiniz?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#475569',
            confirmButtonText: 'Evet, sil!',
            cancelButtonText: 'Vazgeç',
            background: '#1e293b',
            color: '#fff'
        }).then((result) => {
            if (result.isConfirmed) {
                if(typeof deleteStateFromDB === 'function') {
                    deleteStateFromDB().then(() => {
                        Swal.fire({
                            title: 'Temizlendi!',
                            text: 'Tüm taslaklar başarıyla silindi.',
                            icon: 'success',
                            background: '#1e293b',
                            color: '#fff',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    }).catch(err => {
                        console.error(err);
                        Swal.fire('Hata', 'Taslaklar silinemedi.', 'error');
                    });
                }
            }
        });
    } else {
        if (confirm('Tüm taslaklar silinecek. Emin misiniz?')) {
            if(typeof deleteStateFromDB === 'function') {
                deleteStateFromDB().then(() => {
                    alert('Taslaklar temizlendi.');
                }).catch(err => {
                    console.error(err);
                    alert('Hata oluştu.');
                });
            }
        }
    }
};

// --- DYNAMIC PANEL SLIDER DIM EFFECT ---
document.addEventListener('DOMContentLoaded', () => {
    const dynamicTabs = document.querySelectorAll('.dynamic-field');
    
    dynamicTabs.forEach(tab => {
        const sliders = tab.querySelectorAll('input[type="range"]');
        const parentPanel = tab.closest('.panel');
        
        const restorePanel = () => {
            tab.classList.remove('dimmed');
            document.body.classList.remove('photo-slider-active');
            tab.querySelectorAll('.active-slider').forEach(el => el.classList.remove('active-slider'));
            if (parentPanel) parentPanel.classList.remove('panel-transparent');
        };

        sliders.forEach(slider => {
            const group = slider.closest('.slider-group, .color-row, .input-group') || slider.parentElement;
            
            // Prevent accidental slider movement while scrolling vertically
            slider.style.touchAction = 'pan-y';
            
            const dimPanel = () => {
                if (window.innerWidth > 768) return;
                tab.classList.add('dimmed');
                document.body.classList.add('photo-slider-active');
                if (group) group.classList.add('active-slider');
                if (parentPanel) parentPanel.classList.add('panel-transparent');
            };
            
            slider.addEventListener('input', dimPanel);
            slider.addEventListener('touchstart', dimPanel, {passive: true});
        });
        
        window.addEventListener('mouseup', restorePanel);
        window.addEventListener('touchend', restorePanel);
        window.addEventListener('touchcancel', restorePanel);
    });
});