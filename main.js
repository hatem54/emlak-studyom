/* ============================================================

   main.js — v14.1 Güvenli Sürüm

============================================================ */



window.isMobileDevice = function() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (window.innerWidth <= 768 && window.innerHeight > window.innerWidth);
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


        if(typeof redrawAll === 'function') redrawAll();

        if (window.CanvasEmptyState && typeof window.CanvasEmptyState.updateState === 'function') {
            window.CanvasEmptyState.resetDismiss();
            window.CanvasEmptyState.updateState();
        }
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

    


}











window.clearBgImage = function() {

    uploadedImgUrl = '';
    if (typeof masterImageBase64 !== 'undefined') masterImageBase64 = '';
    window.masterImageBase64 = '';
    if (typeof window.resetPixelCache === 'function') window.resetPixelCache();
    if (window.WebGLPhotoEngine) {
        window.WebGLPhotoEngine.currentImage = null;
        window._photoFilterDirty = true;
    }
    if (window.CloneStamp && typeof window.CloneStamp.reset === 'function') {
        window.CloneStamp.reset();
    }

    if (typeof photoLayer !== 'undefined') {

        photoLayer.style.backgroundImage = 'none';
        photoLayer.style.backgroundColor = '#ffffff';
        const cContainerEl = document.getElementById('canvas-container');
        if (cContainerEl) cContainerEl.style.backgroundColor = '#ffffff';

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

    if (window.CanvasEmptyState && typeof window.CanvasEmptyState.updateState === 'function') {
        window.CanvasEmptyState.resetDismiss();
        window.CanvasEmptyState.updateState();
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

// Global Proje Fotoğrafı Uygulama Motoru (Dosya yükleme, Uydu Haritası, Pano/Ekran Yakalama için ortak)
function applyFinalProjectImage(img, finalDataUrl, finalW, finalH) {
    try {
        if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
            window.CanvasEmptyState.dismiss();
        } else {
            const emptyStateEl = document.getElementById('canvasEmptyState');
            if (emptyStateEl) emptyStateEl.classList.add('is-hidden');
        }
        const oldW = (typeof uploadedImgW !== 'undefined' && uploadedImgW > 0) ? uploadedImgW : (parseInt(canvasEl && canvasEl.style.width) || 1920);
        const oldH = (typeof uploadedImgH !== 'undefined' && uploadedImgH > 0) ? uploadedImgH : (parseInt(canvasEl && canvasEl.style.height) || 1080);

        uploadedImgUrl = finalDataUrl;
        window.uploadedImgUrl = finalDataUrl;
        window.activePreviewThumbUrl = null;
        if (typeof window.generateCardPreviewThumb === 'function') {
            window.generateCardPreviewThumb(finalDataUrl, () => {
                if (typeof window.updateTemplateCardPreviews === 'function') {
                    window.updateTemplateCardPreviews();
                }
            });
        } else if (typeof window.updateTemplateCardPreviews === 'function') {
            window.updateTemplateCardPreviews();
        }
        if (!window._isApplyingAiEnhance) {
            window._aiOriginalImgDataUrl = finalDataUrl;
        }
        uploadedImgW = finalW;
        window.uploadedImgW = uploadedImgW;
        uploadedImgH = finalH;
        window.uploadedImgH = uploadedImgH;
        window._globalNativeImg = img;
        window._globalNativeImgSrc = finalDataUrl;
        if (window.WebGLPhotoEngine) {
            window.WebGLPhotoEngine.currentImage = img;
            window._photoFilterDirty = true;
        }
        if (window.CloneStamp && typeof window.CloneStamp.reset === 'function') {
            window.CloneStamp.reset();
        }

        const pl = document.getElementById('photo-layer');
        if (pl) {
            pl.dataset.naturalW = uploadedImgW;
            pl.dataset.naturalH = uploadedImgH;
        }

        // 1. Tuval formatını görselin orijinal ölçülerine uyarla (Canva şablonu modunda şablon oranını koru)
        if (typeof autoAdjustFormat === 'function' && window.isRestoringState !== true && !window.isCanvaMode) {
            autoAdjustFormat(uploadedImgW, uploadedImgH);
        }

        // 2. Standart moddaysa tuval boyutlarını doğrudan görsel boyutlarına eşitle
        if (!window.isCanvaMode) {
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
        }
        if (window.SaberEngine && typeof window.SaberEngine.resize === 'function') {
            window.SaberEngine.resize(uploadedImgW, uploadedImgH);
        }
    
        // 3. Tuval ölçeğini hesapla
        if (typeof resizeCanvas === 'function') resizeCanvas();

        // Görsel yüklenmeden önce tuvalde yapılmış çizimleri koru ve yeni çözünürlüğe orantıla
        if (!window.isRestoringState && typeof drawPaths !== 'undefined' && drawPaths.length > 0) {
            const hasDimensionChange = oldW > 0 && oldH > 0 && (oldW !== uploadedImgW || oldH !== uploadedImgH);
            const sX = hasDimensionChange ? (uploadedImgW / oldW) : 1;
            const sY = hasDimensionChange ? (uploadedImgH / oldH) : 1;
            const scaleRatio = typeof getDrawScaleRatio === 'function' ? getDrawScaleRatio() : (uploadedImgW / 1920);

            drawPaths.forEach(p => {
                if (hasDimensionChange) {
                    if (p.points && Array.isArray(p.points)) {
                        p.points.forEach(pt => {
                            pt.x *= sX;
                            pt.y *= sY;
                            if (pt.cpIn) { pt.cpIn.x *= sX; pt.cpIn.y *= sY; }
                            if (pt.cpOut) { pt.cpOut.x *= sX; pt.cpOut.y *= sY; }
                        });
                    }
                    if (typeof p.x1 !== 'undefined') {
                        p.x1 *= sX; p.y1 *= sY; p.x2 *= sX; p.y2 *= sY;
                    }
                    p.rawWidth = p.rawWidth || 4;
                    p.width = Math.max(1, Math.round(p.rawWidth * scaleRatio));
                }
                p.photoRef = { v4: false, z: 100, px: 50, py: 50, panelW: uploadedImgW, panelH: uploadedImgH, panelL: 0, panelT: 0 };

                if (typeof createSVGFromPath === 'function') {
                    if (p.el && p.el.parentNode) {
                        const oldEl = p.el;
                        const newEl = createSVGFromPath(p);
                        if (newEl) {
                            oldEl.parentNode.replaceChild(newEl, oldEl);
                            p.el = newEl;
                            if (typeof selectedEl !== 'undefined' && selectedEl === oldEl) selectedEl = newEl;
                            if (window.selectedEl === oldEl) window.selectedEl = newEl;
                        }
                    } else if (!p.el) {
                        p.el = createSVGFromPath(p);
                    }
                }

                if (p.hasSaber && typeof window.applySaberToPath === 'function') {
                    const pIdx = drawPaths.indexOf(p);
                    if (pIdx >= 0) {
                        p.saberRef = window.applySaberToPath(pIdx, p.saberOptions || window.saberState);
                    }
                }
            });
        }

        const isCanva = !!(window.isCanvaMode || (typeof isCanvaMode !== 'undefined' && isCanvaMode));

        // 4. Fotoğraf panellerini güncelle (Canva şablonlarındaki kutucuklar)
        document.querySelectorAll('.photo-panel').forEach(p => {
            p.style.display = 'block';
            p.style.visibility = 'visible';
            p._nativeImg = img;
            p._nativeImgSrc = finalDataUrl;
            p.dataset.savedBg = `url('${finalDataUrl}')`;
            delete p.dataset.zpScale;
            delete p.dataset.zpX;
            delete p.dataset.zpY;
            const inner = p.querySelector('.photo-inner-zoom');
            if (inner) {
                inner.style.backgroundImage = `url('${finalDataUrl}')`;
                inner.style.opacity = '0';
                p.style.backgroundImage = 'none';
            } else {
                p.style.backgroundImage = `url('${finalDataUrl}')`;
                p.style.backgroundSize = 'cover';
            }
            if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p);
        });

        // 5. Orijinal fotoğraf katmanını güncelle (Canva modundaysa kesinlikle gizli tutulur)
        const photoLayerEl = document.getElementById('photo-layer');
        if (photoLayerEl) {
            photoLayerEl._nativeImg = img;
            photoLayerEl._nativeImgSrc = finalDataUrl;
            photoLayerEl.dataset.savedBg = `url('${finalDataUrl}')`;
            if (isCanva) {
                photoLayerEl.style.setProperty('display', 'none', 'important');
                photoLayerEl.style.opacity = '0';
            } else {
                photoLayerEl.style.display = 'block';
                photoLayerEl.style.visibility = 'visible';
                photoLayerEl.style.opacity = '1';
                delete photoLayerEl.dataset.zpScale;
                delete photoLayerEl.dataset.zpX;
                delete photoLayerEl.dataset.zpY;
                const inner = photoLayerEl.querySelector('.photo-inner-zoom');
                if (inner) {
                    inner.style.backgroundImage = `url('${finalDataUrl}')`;
                    inner.style.opacity = '0';
                    photoLayerEl.style.backgroundImage = 'none';
                } else {
                    photoLayerEl.style.backgroundImage = `url('${finalDataUrl}')`;
                    photoLayerEl.style.backgroundSize = 'cover';
                }
                if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(photoLayerEl);
            }
        }

        if (isCanva) {
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
        if (photoLayerEl) {
            if (isCanva) {
                photoLayerEl.style.setProperty('display', 'none', 'important');
                photoLayerEl.style.opacity = '0';
            } else if (typeof _preparePhoto === 'function') {
                _preparePhoto(photoLayerEl);
            }
        }
        if (typeof resetPixelCache === 'function') resetPixelCache();
        if (typeof resizeCanvas === 'function') resizeCanvas();
        if (typeof applyPhotoPos === 'function') applyPhotoPos();
        if (typeof applyPhotoFilters === 'function') {
            applyPhotoFilters();
        } else if (typeof requestPhotoRepaint === 'function') {
            requestPhotoRepaint();
        }
        if (typeof redrawAll === 'function') redrawAll();
        
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof requestAutoSave === 'function') requestAutoSave();
        if (typeof window.renderLayers === 'function') window.renderLayers();

        // 5. İlk görsel durumunu Geçmiş Yığınına (Undo/Redo) kaydet
        if (window.undoStack && window.undoStack.length <= 1 && (!window.undoStack[0] || !window.undoStack[0].photoImgUrl)) {
            window.undoStack = [];
            window.redoStack = [];
        }
        if (typeof window.recordHistoryImmediate === 'function') {
            window.recordHistoryImmediate('Fotoğraf Yüklendi');
        } else if (typeof window.recordHistory === 'function') {
            window.recordHistory('Fotoğraf Yüklendi', true);
        }
        
        if (typeof window.analyzeUploadedImageVision === 'function') {
            try {
                window.analyzeUploadedImageVision(img, finalDataUrl);
            } catch(vErr) {
                console.warn("Vision analizi atlandı:", vErr);
            }
        }
    } catch (applyErr) {
        console.error("applyFinalProjectImage hatası:", applyErr);
    } finally {
        if (typeof window.hideAppLoading === 'function') {
            window.hideAppLoading();
        }
        setTimeout(() => {
            if (typeof window.hideAppLoading === 'function') window.hideAppLoading(60);
        }, 120);
    }
}
window.applyFinalImage = applyFinalProjectImage;
window.applyFinalProjectImage = applyFinalProjectImage;

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
                if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
                    window.CanvasEmptyState.dismiss();
                }
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
                            if (initialW > 140) initialW = 140;
                            if (initialW < 60) initialW = 60;
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

    window.loadPhotoFile = function(f) {
        if (!f) return;

        // 📁 Eğer seçilen dosya JSON şablon/proje dosyası ise doğrudan şablon motoruna yönlendir:
        if (f.name.toLowerCase().endsWith('.json') || f.type === 'application/json') {
            if (typeof window.loadProjectFromFile === 'function') {
                window.loadProjectFromFile(f);
            } else if (typeof loadProjectFile === 'function') {
                loadProjectFile(f);
            }
            if ($('imageInput')) $('imageInput').value = '';
            return;
        }

        if (!window.validateImageUpload(f)) { 
            if ($('imageInput')) $('imageInput').value = ''; 
            return; 
        }

        // 🖼️ Tekil Havuz Mimarisi: Seçilen fotoğraf doğrudan PhotoStagingArchive'e eklenir, aktif yapılır ve tuvale basılır
        if (window.PhotoStagingArchive && typeof window.PhotoStagingArchive.processUploadedFiles === 'function') {
            window.PhotoStagingArchive.processUploadedFiles([f], false);
            if ($('imageInput')) $('imageInput').value = '';
            return;
        }
        
        if (typeof window.showAppLoading === 'function') {
            window.showAppLoading('Fotoğraf Yükleniyor...', 'Görsel işleniyor ve tuvale yerleştiriliyor...');
        }

        const applyFinalImage = applyFinalProjectImage;

        const processPhotoChange = async () => {
            try {
                const objectUrl = URL.createObjectURL(f);
                
                const img = new Image();
                img.onload = () => {
                    let finalW = img.naturalWidth || 1920;
                    let finalH = img.naturalHeight || 1080;
                    
                    const isMob = typeof window.isMobileDevice === 'function' ? window.isMobileDevice() : window.innerWidth <= 768;
                    const MAX_DIM = isMob ? 2048 : 8192;
                    const MAX_AREA = isMob ? 3000000 : 48000000;
                    
                    let needsDownscale = false;
                    if (finalW > MAX_DIM || finalH > MAX_DIM) {
                        const ratio = Math.min(MAX_DIM / finalW, MAX_DIM / finalH);
                        finalW = Math.round(finalW * ratio);
                        finalH = Math.round(finalH * ratio);
                        needsDownscale = true;
                    }
                    
                    if ((finalW * finalH) > MAX_AREA) {
                        const areaRatio = Math.sqrt(MAX_AREA / (finalW * finalH));
                        finalW = Math.round(finalW * areaRatio);
                        finalH = Math.round(finalH * areaRatio);
                        needsDownscale = true;
                    }
                    
                    // Görsel zaten desteklenen boyutlardaysa doğrudan orijinal kayıpsız veriyi uygula
                    if (!needsDownscale) {
                        const reader = new FileReader();
                        reader.onload = ev => {
                            const originalDataUrl = ev.target.result;
                            applyFinalImage(img, originalDataUrl, finalW, finalH);
                            URL.revokeObjectURL(objectUrl);
                        };
                        reader.readAsDataURL(f);
                        return;
                    }

                    try {
                        const offCanvas = document.createElement('canvas');
                        offCanvas.width = finalW;
                        offCanvas.height = finalH;
                        const ctx = offCanvas.getContext('2d');
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(img, 0, 0, finalW, finalH);
                        const mime = (f.type === 'image/png') ? 'image/png' : 'image/jpeg';
                        const scaledDataUrl = offCanvas.toDataURL(mime, 0.98);
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

        processPhotoChange();
    };

    if($('imageInput')){
        $('imageInput').addEventListener('change', e => {
            const files = Array.from(e.target.files || []);
            if (files.length === 0) return;
            if (files.length > 1 && window.PhotoStagingArchive && typeof window.PhotoStagingArchive.processUploadedFiles === 'function') {
                window.PhotoStagingArchive.processUploadedFiles(files, false);
            } else {
                window.loadPhotoFile(files[0]);
            }
            e.target.value = '';
        });
    }

    // Tuvale dışarıdan sürükle-bırak (Drag & Drop) ile görsel açma
    if (!window._canvasDragAndDropInitialized) {
        window._canvasDragAndDropInitialized = true;
        ['dragenter', 'dragover'].forEach(name => {
            window.addEventListener(name, (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
            }, false);
        });
        ['dragleave'].forEach(name => {
            window.addEventListener(name, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
        window.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const f = e.dataTransfer.files[0];
                if (f.name.toLowerCase().endsWith('.json') || f.type === 'application/json') {
                    if (typeof window.loadProjectFromFile === 'function') window.loadProjectFromFile(f);
                    else if (typeof loadProjectFile === 'function') loadProjectFile(f);
                } else if (f.type.startsWith('image/')) {
                    const allImages = Array.from(e.dataTransfer.files).filter(fl => fl.type && fl.type.startsWith('image/'));
                    if (allImages.length > 1 && window.PhotoStagingArchive && typeof window.PhotoStagingArchive.processUploadedFiles === 'function') {
                        window.PhotoStagingArchive.processUploadedFiles(allImages, false);
                    } else if (typeof window.loadPhotoFile === 'function') {
                        window.loadPhotoFile(f);
                    }
                } else if (f.name.toLowerCase().endsWith('.kml') || f.name.toLowerCase().endsWith('.kmz') || f.name.toLowerCase().endsWith('.geojson')) {
                    if (typeof window.openSatelliteMapModal === 'function') {
                        window.openSatelliteMapModal();
                        setTimeout(() => {
                            if (window.SatelliteMapModule && typeof window.SatelliteMapModule.handleKmlFile === 'function') {
                                window.SatelliteMapModule.handleKmlFile(f);
                            }
                        }, 400);
                    }
                }
            }
        }, false);
    }

    // Tuval altı dock üzerindeki KML / KMZ yükleme butonu tetikleyicisi
    window.handleDockKmlUpload = function(event) {
        const file = event && event.target && event.target.files && event.target.files[0];
        if (!file) return;
        if (typeof window.openSatelliteMapModal === 'function') {
            window.openSatelliteMapModal(true);
            let attempts = 0;
            const checkSat = () => {
                attempts++;
                if (window.SatelliteMapModule && typeof window.SatelliteMapModule.handleKmlFile === 'function') {
                    if (typeof window.SatelliteMapModule.initGoogle3DEarthMode === 'function' && !window.SatelliteMapModule.is3DActive) {
                        window.SatelliteMapModule.initGoogle3DEarthMode();
                    }
                    window.SatelliteMapModule.handleKmlFile(file);
                } else if (attempts < 25) {
                    setTimeout(checkSat, 100);
                }
            };
            setTimeout(checkSat, 150);
        }
        if (event.target) event.target.value = '';
    };

    // Harita / Uydu veya dış kaynaklardan gelen dataUrl görsellerini projeye doğrudan uygular
    window.applyProjectImageFromDataUrl = function(dataUrl, callback, skipLoading = false) {
        if (!dataUrl) return;
        if (!skipLoading && typeof window.showAppLoading === 'function') {
            window.showAppLoading('Görsel İşleniyor...', 'Uydu görüntüsü tuvale aktarılıyor...');
        }

        // Eğer görsel doğrudan panodan (Ctrl+V) veya dış çağrıdan geldiyse ve henüz havuzda yoksa havuza da kaydet
        if (window.PhotoStagingArchive && typeof window.PhotoStagingArchive.addItem === 'function' && !window._isApplyingToCanvas) {
            const exists = window.PhotoStagingArchive.items && window.PhotoStagingArchive.items.some(it => it.dataUrl === dataUrl);
            if (!exists) {
                window.PhotoStagingArchive.createThumbnailAsync(dataUrl, 480).then(thumbUrl => {
                    window.PhotoStagingArchive.addItem({
                        id: 'photo_' + Date.now(),
                        key: 'local_file',
                        title: 'Ekran Alıntısı',
                        subTitle: 'Görsel Girişi',
                        icon: 'fa-paste',
                        dataUrl: dataUrl,
                        thumbUrl: thumbUrl,
                        timestamp: Date.now()
                    }, false);
                }).catch(() => {});
            }
        }

        const proceed = () => {
            const img = new Image();
            // data: şemasında crossOrigin ayarlanmamalıdır (tarayıcı CORS hatası üretir)
            if (typeof dataUrl === 'string' && !dataUrl.startsWith('data:')) {
                img.crossOrigin = 'anonymous';
            }
            img.onload = () => {
                try {
                    let finalW = img.naturalWidth || 1920;
                    let finalH = img.naturalHeight || 1080;

                    applyFinalProjectImage(img, dataUrl, finalW, finalH);
                    if (typeof window.hideAppLoading === 'function') window.hideAppLoading();
                    if (typeof callback === 'function') callback(null, dataUrl);
                } catch(err) {
                    console.error('applyProjectImageFromDataUrl hata:', err);
                    if (typeof window.hideAppLoading === 'function') window.hideAppLoading();
                    if (typeof callback === 'function') callback(err);
                }
            };
            img.onerror = (err) => {
                console.error('Görsel yüklenemedi:', err);
                if (typeof window.hideAppLoading === 'function') window.hideAppLoading();
                alert('Görsel tuvale aktarılırken hata oluştu.');
                if (typeof callback === 'function') callback(err);
            };
            img.src = dataUrl;
        };

        proceed();
    };

    // 📋 Panodan Görsel / Ekran Alıntısı Yapıştırma (Ctrl + V) Desteği
    // Google Earth, TKGM Parsel Sorgu veya başka bir kaynaktan Win+Shift+S ile kopyalanan görseli anında şablona aktarır
    window.addEventListener('paste', function(e) {
        if (!e.clipboardData || !e.clipboardData.items) return;

        const active = document.activeElement;
        const isTextInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);

        const items = Array.from(e.clipboardData.items);
        const imageItem = items.find(item => item.type && item.type.startsWith('image/'));

        if (imageItem) {
            // Eğer doğrudan "ilan metni (aiText)" kutusuna yapıştırılıyorsa tuvale (canvas'a) uygulama!
            if (active && active.id === 'aiText') {
                return; 
            }

            if (!isTextInput) {
                e.preventDefault();
            }
            const blob = imageItem.getAsFile();
            if (blob) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const dataUrl = evt.target.result;
                    if (typeof window.applyProjectImageFromDataUrl === 'function') {
                        window.applyProjectImageFromDataUrl(dataUrl);
                    }
                };
                reader.readAsDataURL(blob);
            }
        }
    });

    // 📋 Butonla Panodan Görsel Alma
    window.pasteImageFromClipboard = async function() {
        try {
            if (navigator.clipboard && navigator.clipboard.read) {
                const items = await navigator.clipboard.read();
                for (const item of items) {
                    for (const type of item.types) {
                        if (type.startsWith('image/')) {
                            const blob = await item.getType(type);
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                                if (typeof window.applyProjectImageFromDataUrl === 'function') {
                                    window.applyProjectImageFromDataUrl(evt.target.result);
                                }
                            };
                            reader.readAsDataURL(blob);
                            return;
                        }
                    }
                }
            }
            alert('Panoda kopyalanmış bir görsel bulunamadı.\n\nİpucu: Google Earth 3D veya TKGM ekranındayken klavyenizden Win + Shift + S tuşlarına basarak istediğiniz alanı kırpın, ardından uygulamaya dönüp Ctrl + V tuşlarına basın.');
        } catch(err) {
            console.warn('Clipboard read hatası:', err);
            alert('Tarayıcı güvenlik izni nedeniyle panoya butonla doğrudan erişilemedi.\n\nLütfen klavyenizden Ctrl + V tuşlarına basarak yapıştırın.');
        }
    };

    // 📸 Google Earth / TKGM veya Herhangi Bir Sekmeyi / Pencereyi Canlı Yakalama (WebRTC Screen Capture API)
    window.captureScreenOrTabToTemplate = async function() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            alert('Sekme yakalama bu tarayıcıda desteklenmiyor.\n\nAlternatif olarak: Google Earth veya TKGM ekranında Win + Shift + S ile ekran görüntüsü alıp uygulamada Ctrl + V tuşlarına basabilirsiniz.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: 'browser',
                    cursor: 'never'
                },
                audio: false
            });

            if (typeof window.showAppLoading === 'function') {
                window.showAppLoading('Görüntü Yakalanıyor...', 'Seçilen Google Earth / TKGM sekmesinden yüksek çözünürlüklü görüntü alınıyor...');
            }

            const video = document.createElement('video');
            video.playsInline = true;
            video.muted = true;
            video.srcObject = stream;

            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play().then(resolve).catch(resolve);
                };
                setTimeout(resolve, 1500);
            });

            await new Promise(r => setTimeout(r, 250));

            const vw = video.videoWidth || 1920;
            const vh = video.videoHeight || 1080;

            // Aktif tuval ölçülerini al (Varsayılan 16:9 Full HD: 1920x1080)
            let targetW = 1920;
            let targetH = 1080;
            if (window.SatelliteMapModule && typeof window.SatelliteMapModule.getActiveFormatDimensions === 'function') {
                const dim = window.SatelliteMapModule.getActiveFormatDimensions();
                if (dim && dim.w && dim.h) {
                    targetW = dim.w;
                    targetH = dim.h;
                }
            } else {
                const activePill = document.querySelector('.dock-pill-btn.active');
                const previewSel = document.getElementById('previewFormat');
                const fmt = (activePill ? (activePill.dataset.format || '') : '') + ' ' + (previewSel ? previewSel.value : '');
                if (fmt.includes('1:1') || fmt.includes('Kare')) { targetW = 1080; targetH = 1080; }
                else if (fmt.includes('4:5') || fmt.includes('Portre')) { targetW = 1080; targetH = 1350; }
                else if (fmt.includes('9:16') || fmt.includes('Story') || fmt.includes('Hikaye')) { targetW = 1080; targetH = 1920; }
            }

            const targetRatio = targetW / targetH;
            let sw, sh, sx, sy;
            if (vw / vh >= targetRatio) {
                sh = vh;
                sw = Math.round(vh * targetRatio);
                sx = Math.round((vw - sw) / 2);
                sy = 0;
            } else {
                sw = vw;
                sh = Math.round(vw / targetRatio);
                sx = 0;
                sy = Math.round((vh - sh) / 2);
            }

            const offCanvas = document.createElement('canvas');
            offCanvas.width = targetW;
            offCanvas.height = targetH;
            const ctx = offCanvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetW, targetH);

            // Yayını hemen kapat
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;

            const dataUrl = offCanvas.toDataURL('image/png');

            if (typeof window.applyProjectImageFromDataUrl === 'function') {
                window._skipDrawConfirm = true;
                if (typeof window.clearAllDrawings === 'function') window.clearAllDrawings();
                window.applyProjectImageFromDataUrl(dataUrl, (err) => {
                    delete window._skipDrawConfirm;
                    if (typeof window.hideAppLoading === 'function') window.hideAppLoading();
                    if (!err) {
                        if (typeof window.closeSatelliteMapModal === 'function') {
                            window.closeSatelliteMapModal();
                        }
                    }
                });
            }

        } catch(err) {
            console.warn('getDisplayMedia iptal veya hata:', err);
            if (typeof window.hideAppLoading === 'function') window.hideAppLoading();
            if (err.name !== 'NotAllowedError') {
                alert('Görüntü yakalanırken bir sorun oluştu: ' + err.message);
            }
        }
    };
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
                elLogo.src = '';
                elLogo.style.display = 'none';
                elLogo.style.visibility = 'hidden';
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

        let resizeCanvasRaf = null;
        const debouncedResizeCanvas = () => {
            if (resizeCanvasRaf) cancelAnimationFrame(resizeCanvasRaf);
            resizeCanvasRaf = requestAnimationFrame(() => {
                resizeCanvas();
            });
        };
        window.addEventListener('resize', debouncedResizeCanvas);

        // iOS orientationchange resize'dan önce tetiklenebilir — açıkça dinle
        window.addEventListener('orientationchange', () => {
            // iOS 100ms sonra boyutu netleştirir
            setTimeout(debouncedResizeCanvas, 150);
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
}, 100);

        

        // Close all tabs by default on mobile
        const isMobDev = (typeof window.isMobileDevice === 'function') ? window.isMobileDevice() : (window.innerWidth <= 768);
        if(isMobDev) {

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

function clearAllTemplates(isSwitching){

    // 1. Canva şablonunu kaldır

    if(typeof clearCanvaTemplate === 'function' && isCanvaMode){

        clearCanvaTemplate(true);

    }

    // 1b. Kolaj şablonunu tamamen kaldır
    if(typeof window._kolajTemizle === 'function') window._kolajTemizle();
    else if(typeof _kolajTemizle === 'function') _kolajTemizle();
    const kolajWrap = document.getElementById('kolaj-wrapper');
    if(kolajWrap) kolajWrap.remove();

    

    // 2. Standart şablon elemanlarını GİZLE

    if(elBadge) elBadge.style.visibility = 'hidden';

    if(elPrice) elPrice.style.visibility = 'hidden';

    if(elDetails) elDetails.style.visibility = 'hidden';

    var infoLine = document.getElementById('infoLineText');

    if(infoLine) infoLine.style.visibility = 'hidden';

    

    // 3. Aktif şablon değişkenini sıfırla
    if(typeof activeTemplate !== 'undefined') activeTemplate = null;
    window.activeTemplate = null;
    activeLayout = '';
    window.activeLayout = '';
    window.isCanvaMode = false;
    if (typeof isCanvaMode !== 'undefined') isCanvaMode = false;
    if (typeof activeCanvaId !== 'undefined') activeCanvaId = '';
    window.activeCanvaId = '';
    window.lastClickedTemplateElement = null;

    const canvaLayer = document.getElementById('canva-render-layer');
    if (canvaLayer) {
        canvaLayer.innerHTML = '';
        canvaLayer.style.display = 'none';
    }
    
    // 4. Tüm şablon butonlarından "active" class'ını kaldır
    document.querySelectorAll('.template-btn').forEach(function(b){
        b.classList.remove('active');
    });

    

    // 5. Canva kartlarından da active kaldır (varsa)

    document.querySelectorAll('.canva-tpl-card, [class*="canva-card"]').forEach(function(b){

        b.classList.remove('active', 'selected');

    });

    

    if (window.isTemplateHidden) window.toggleTemplateVisibility(false);
    if (!isSwitching && window.CanvasEmptyState && typeof window.CanvasEmptyState.updateState === 'function') {
        window.CanvasEmptyState.resetDismiss();
        window.CanvasEmptyState.updateState();
    }
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
    const dockIcon = document.getElementById('dockTemplatePaletteIcon');
    if (dockBtn) {
        if (isHidden) {
            dockBtn.classList.add('active');
            dockBtn.title = 'Şablonu Göster';
            if (dockIcon) dockIcon.className = 'fa-solid fa-eye';
        } else {
            dockBtn.classList.remove('active');
            dockBtn.title = 'Şablonu Gizle';
            if (dockIcon) dockIcon.className = 'fa-solid fa-eye-slash';
        }
    }

    // Şablonlar Sekmesi Butonu (Mobil & PC Tab)
    const tabBtn = document.getElementById('btnToggleTemplateTab');
    const tabIcon = document.getElementById('tabTemplateEyeIcon');
    const tabText = document.getElementById('tabTemplateEyeText');
    if (tabBtn) {
        if (isHidden) {
            tabBtn.classList.add('active');
            if (tabIcon) tabIcon.className = 'fa-solid fa-eye';
            if (tabText) tabText.textContent = 'Şablonu Göster';
        } else {
            tabBtn.classList.remove('active');
            if (tabIcon) tabIcon.className = 'fa-solid fa-eye-slash';
            if (tabText) tabText.textContent = 'Şablonu Gizle';
        }
    }
};

// ========== 🔄 ŞABLONU VARSAYILANA SIFIRLA (KONUM VE BOYUTLARI YENİLE) ==========
window.resetActiveTemplateToDefault = function() {
    // 0. Varsa seçimi kaldır ve dock kontekstini temizle
    if (typeof window.deselectAll === 'function') window.deselectAll();
    if (window.DockContextManager && typeof window.DockContextManager.onElementDeselected === 'function') {
        window.DockContextManager.onElementDeselected();
    }

    // 1. Eğer şablon geçici gizlenmişse önce görünür yap
    if (window.isTemplateHidden) {
        window.toggleTemplateVisibility(false);
    }
    window.lastParsedData = null;
    const inputsToClear = ['canvaTitle','canvaPrice','canvaContact','canvaFeatures','statusInput','priceInput','canvaKTitle','canvaKPrice','canvaKContact','canvaKFeatures','canvaKurumsalTitle','canvaKurumsalPrice','canvaKurumsalContact','canvaKurumsalFeatures','canvaMTitle','canvaMPrice','canvaMContact','canvaMFeatures'];
    inputsToClear.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });


    // 2. Boş ekrandan yazılı hale döndür (Empty State kartlarını ve yönlendirmeleri geri getir)
    if (window.CanvasEmptyState) {
        window.CanvasEmptyState.resetDismiss();
        window.CanvasEmptyState.updateState();
    }

    // 3. Aktif bir şablon olup olmadığını ve hedef ID'yi kesin olarak tespit et
    const canvaLayer = document.getElementById('canva-render-layer');
    const hasCanvaContent = canvaLayer && canvaLayer.children && canvaLayer.children.length > 0 && canvaLayer.style.display !== 'none';

    const isStdVisible = (
        (typeof elBadge !== 'undefined' && elBadge && elBadge.style.visibility !== 'hidden' && elBadge.style.display !== 'none') ||
        (typeof elPrice !== 'undefined' && elPrice && elPrice.style.visibility !== 'hidden' && elPrice.style.display !== 'none') ||
        (typeof elDetails !== 'undefined' && elDetails && elDetails.style.visibility !== 'hidden' && elDetails.style.display !== 'none')
    );
    const hasStandardActive = !!(typeof activeLayout !== 'undefined' && activeLayout && activeLayout !== 'none' && activeLayout !== 'empty' && isStdVisible);
    const hasKolaj = !!document.getElementById('kolaj-wrapper');

    // ⚡ Tuvalde halihazırda aktif bir şablon veya kolaj yoksa hayalet şablon yükleme!
    if (!hasCanvaContent && !hasStandardActive && !hasKolaj) {
        if (typeof resetCanvasZoomAndPan === 'function') resetCanvasZoomAndPan();
        if (typeof window.fitCanvasToScreen === 'function') window.fitCanvasToScreen();
        if (typeof window.showToast === 'function') {
            window.showToast('Tuvalde aktif bir şablon bulunmuyor.', 'info');
        }
        return;
    }

    let targetTemplateId = window.activeCanvaId || 
                           (typeof activeCanvaId !== 'undefined' ? activeCanvaId : '') ||
                           (canvaLayer ? canvaLayer.dataset.activeTemplateId : '') ||
                           window.lastActiveTemplateId ||
                           '';

    if (!targetTemplateId) {
        const activeCard = document.querySelector('.canva-tpl-card.active');
        if (activeCard && activeCard.dataset.id) {
            targetTemplateId = activeCard.dataset.id;
        }
    }

    const isCanvaActive = !!((typeof isCanvaMode !== 'undefined' && isCanvaMode) || window.isCanvaMode || targetTemplateId || hasCanvaContent || window.activeTemplate || hasKolaj);

    // Tuval arka plan rengini ve zoom/pan durumunu varsayılana getir
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
        canvasContainer.style.removeProperty('background-color');
        canvasContainer.style.backgroundColor = '';
    }
    if (typeof resetCanvasZoomAndPan === 'function') resetCanvasZoomAndPan();
    if (typeof window.fitCanvasToScreen === 'function') window.fitCanvasToScreen();
    // Fotoğraf kaydırma ve zoom değerlerini varsayılana getir
    const pxCtrl = document.getElementById('photoXCtrl');
    const pyCtrl = document.getElementById('photoYCtrl');
    const pzCtrl = document.getElementById('photoZoomCtrl');
    if (pxCtrl) pxCtrl.value = 50;
    if (pyCtrl) pyCtrl.value = 50;
    if (pzCtrl) pzCtrl.value = 100;

    // 4. Şablon kontrolleri
    if (isCanvaActive) {
        if (targetTemplateId) {
            window.activeCanvaId = targetTemplateId;
            if (typeof activeCanvaId !== 'undefined') activeCanvaId = targetTemplateId;
            window.lastActiveTemplateId = targetTemplateId;
            if (canvaLayer) canvaLayer.dataset.activeTemplateId = targetTemplateId;

            const targetCard = document.querySelector(`.canva-tpl-card[data-id="${targetTemplateId}"]`);
            if (targetCard) {
                document.querySelectorAll('.canva-tpl-card').forEach(c => c.classList.remove('active'));
                targetCard.classList.add('active');
            }

            if (targetTemplateId.startsWith('canvaM')) {
                if (typeof window.renderMTemplate === 'function') window.renderMTemplate(targetTemplateId);
                else if (typeof renderMTemplate === 'function') renderMTemplate(targetTemplateId);
            } else if (targetTemplateId.startsWith('canvaP')) {
                if (typeof window.renderPTemplate === 'function') window.renderPTemplate(targetTemplateId);
                else if (typeof renderPTemplate === 'function') renderPTemplate(targetTemplateId);
            } else if (targetTemplateId.startsWith('canvaKurumsal')) {
                if (typeof window.renderKurumsalTemplate === 'function') window.renderKurumsalTemplate(targetTemplateId);
                else if (typeof renderKurumsalTemplate === 'function') renderKurumsalTemplate(targetTemplateId);
            } else if (targetTemplateId.startsWith('canvaK')) {
                if (typeof window.renderKTemplate === 'function') window.renderKTemplate(targetTemplateId);
                else if (typeof renderKTemplate === 'function') renderKTemplate(targetTemplateId);
            } else if (targetTemplateId.startsWith('canvaD')) {
                if (typeof window.renderDTemplate === 'function') window.renderDTemplate(targetTemplateId);
                else if (typeof renderDTemplate === 'function') renderDTemplate(targetTemplateId);
            } else if (targetTemplateId.startsWith('canvaC')) {
                if (typeof window.renderCTemplate === 'function') window.renderCTemplate(targetTemplateId);
                else if (typeof renderCTemplate === 'function') renderCTemplate(targetTemplateId);
            } else if (targetTemplateId.startsWith('canvaS')) {
                if (typeof window.renderSTemplate === 'function') window.renderSTemplate(targetTemplateId);
                else if (typeof renderSTemplate === 'function') renderSTemplate(targetTemplateId);
            } else if (targetTemplateId.startsWith('canvaO')) {
                if (typeof window.renderOTemplate === 'function') window.renderOTemplate(targetTemplateId);
                else if (typeof renderOTemplate === 'function') renderOTemplate(targetTemplateId);
            } else if (targetTemplateId.startsWith('canvaL')) {
                if (typeof window.renderLTemplate === 'function') window.renderLTemplate(targetTemplateId);
                else if (typeof renderLTemplate === 'function') renderLTemplate(targetTemplateId);
            } else if (targetTemplateId === 'custom' && window.activeCustomTemplateData && typeof window.renderCustomDynamicTemplate === 'function') {
                window.renderCustomDynamicTemplate(window.activeCustomTemplateData);
            } else if (/^canva\d+$/.test(targetTemplateId)) {
                if (typeof buildCanvaRender === 'function') buildCanvaRender();
            } else if (typeof refreshActiveCanvaTemplate === 'function') {
                refreshActiveCanvaTemplate();
            }
        } else if (typeof refreshActiveCanvaTemplate === 'function') {
            refreshActiveCanvaTemplate();
        }
    } else if (hasStandardActive) {
        if (typeof setTemplate === 'function') {
            setTemplate(activeLayout);
        }
    }

    if (typeof renderData === 'function') renderData();
    if (typeof resizeCanvas === 'function') resizeCanvas();
    if (typeof redrawAll === 'function') redrawAll();
    if (typeof renderLayers === 'function') renderLayers();
    if (typeof window.saveState === 'function') window.saveState();
};

// ========== 🚀 TÜM SAYFAYI / TUVALİ SIFIRLA (SIFIRDAN BAŞLA) ==========
window.resetEntireWorkspace = function() {
    const doReset = function() {
        // Overlay göster (ekran kaymasını gizle ve pürüzsüz geçiş sağla)
        let loader = document.getElementById('resetWorkspaceLoader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'resetWorkspaceLoader';
            loader.style.cssText = 'position:fixed; inset:0; background:rgba(10,15,30,0.94); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); z-index:99999999; display:flex; flex-direction:column; align-items:center; justify-content:center; opacity:0; transition:opacity 0.25s ease;';
            loader.innerHTML = `
                <div style="width:52px; height:52px; border:4px solid rgba(56,189,248,0.2); border-top-color:#38bdf8; border-radius:50%; animation:resetSpin 0.8s linear infinite; margin-bottom:16px;"></div>
                <div style="font-size:16px; font-weight:700; color:#f8fafc; letter-spacing:-0.2px; margin-bottom:4px;">Tuval Temizleniyor...</div>
                <div style="font-size:12px; color:#94a3b8;">Yeni çalışma alanı hazırlanıyor</div>
                <style>@keyframes resetSpin { 100% { transform: rotate(360deg); } }</style>
            `;
            document.body.appendChild(loader);
        }
        
        loader.style.opacity = '1';

        // Fail-safe: Her koşulda en geç 800ms içinde loader'ı temizle
        const cleanupLoader = () => {
            const l = document.getElementById('resetWorkspaceLoader');
            if (l) {
                l.style.opacity = '0';
                setTimeout(() => { if (l && l.parentNode) l.parentNode.removeChild(l); }, 250);
            }
            const g = document.getElementById('globalLoadingOverlay');
            if (g && g.parentNode) g.parentNode.removeChild(g);
        };

        setTimeout(() => {
            try {
                // 1. Şablon bayraklarını ve katmanını ÖNCE temizle (clearBgImage'ın şablon tetiklemesini engelle)
                window.isCanvaMode = false;
                if (typeof isCanvaMode !== 'undefined') isCanvaMode = false;
                if (typeof activeCanvaId !== 'undefined') activeCanvaId = '';
                window.activeCanvaId = '';
                if (typeof activeJsonTemplateId !== 'undefined') activeJsonTemplateId = '';
                window.activeJsonTemplateId = '';
                window.activeTemplate = null;
                if (typeof activeTemplate !== 'undefined') activeTemplate = null;
                if (typeof window.canvaOverlays !== 'undefined') window.canvaOverlays = [];

                if (typeof clearAllTemplates === 'function') {
                    try { clearAllTemplates(); } catch(eTpl) { console.warn("clearAllTemplates error:", eTpl); }
                }
                const canvaRenderLayer = document.getElementById('canva-render-layer');
                if (canvaRenderLayer) {
                    canvaRenderLayer.innerHTML = '';
                    canvaRenderLayer.style.display = 'none';
                }

                // 1b. Kolaj şablonunu tamamen temizle
                if (typeof window._kolajTemizle === 'function') {
                    try { window._kolajTemizle(); } catch(eKol) { console.warn("kolajTemizle error:", eKol); }
                }
                const kolajWrap = document.getElementById('kolaj-wrapper');
                if (kolajWrap) kolajWrap.remove();

                // 2. Arka plan görseli ve logo temizle
                if (typeof window.clearBgImage === 'function') {
                    try { window.clearBgImage(); } catch(eBg) { console.warn("clearBgImage error:", eBg); }
                }
                if (typeof window.clearLogoImage === 'function') {
                    try { window.clearLogoImage(); } catch(eLogo) { console.warn("clearLogoImage error:", eLogo); }
                }
                if (typeof masterImageBase64 !== 'undefined') masterImageBase64 = '';
                window.masterImageBase64 = '';
                if (typeof uploadedImgUrl !== 'undefined') uploadedImgUrl = '';
                window.uploadedImgUrl = '';
                if (typeof masterPhotoDataUrl !== 'undefined') masterPhotoDataUrl = '';
                window.masterPhotoDataUrl = '';
                if (typeof window.resetPixelCache === 'function') window.resetPixelCache();
                if (window.WebGLPhotoEngine) {
                    window.WebGLPhotoEngine.currentImage = null;
                    window._photoFilterDirty = true;
                }
                if (window.CloneStamp && typeof window.CloneStamp.reset === 'function') {
                    window.CloneStamp.reset();
                }

                // 2b. Tuval Arka Plan Rengini Varsayılana Sıfırla
                const canvasContainer = document.getElementById('canvas-container');
                if (canvasContainer) {
                    canvasContainer.style.removeProperty('background-color');
                    canvasContainer.style.backgroundColor = '';
                }
                const canvasBgColorInput = document.getElementById('canvasBgColor');
                if (canvasBgColorInput) {
                    canvasBgColorInput.value = '#12122A';
                }
                const exportBgColorInput = document.getElementById('exportBgColor');
                if (exportBgColorInput) {
                    exportBgColorInput.value = '#12122A';
                }
                try {
                    localStorage.removeItem('emlakstudiom_canvasBgColor');
                } catch(e){}

                // 3. Filtreleri sıfırla
                if (typeof resetFilters === 'function') {
                    try { resetFilters(); } catch(eFilt) { console.warn("resetFilters error:", eFilt); }
                }
                if (window.PhotoMasksManager && typeof window.PhotoMasksManager.resetAll === 'function') {
                    try { window.PhotoMasksManager.resetAll(); } catch(eMask) { console.warn("photoMasks reset error:", eMask); }
                }

                // 4. İkonları sil
                if (typeof deleteAllIcons === 'function') {
                    try { deleteAllIcons(); } catch(eIco) { console.warn("deleteAllIcons error:", eIco); }
                }

                // 5. Çizimleri ve serbest çizgileri sil
                if (typeof clearAllDrawings === 'function') {
                    try { clearAllDrawings(); } catch(eDraw) { console.warn("clearAllDrawings error:", eDraw); }
                }
                if (window.SaberEngine && typeof window.SaberEngine.clear === 'function') {
                    try { window.SaberEngine.clear(); } catch(eSab) { console.warn("saber clear error:", eSab); }
                }
                const drawLayer = document.getElementById('draw-layer');
                if (drawLayer) {
                    const ctx = drawLayer.getContext('2d');
                    if (ctx) ctx.clearRect(0, 0, drawLayer.width, drawLayer.height);
                }
                const maskLayer = document.getElementById('mask-layer');
                if (maskLayer) maskLayer.innerHTML = '';

                // 5.1. 3D Ögeleri Tuvalden Temizle (Batch & Sessiz Mod)
                try {
                    if (window.ThreeDEngine) {
                        if (typeof window.ThreeDEngine.clearAll3D === 'function') {
                            window.ThreeDEngine.clearAll3D(true);
                        } else if (typeof window.ThreeDEngine.clearScene === 'function') {
                            window.ThreeDEngine.clearScene(true);
                        } else if (typeof window.ThreeDEngine.delete3DElement === 'function') {
                            window.ThreeDEngine.delete3DElement(null, true);
                        }
                    }
                    const threeDLayer = document.getElementById('three-d-layer');
                    if (threeDLayer) threeDLayer.style.display = 'none';
                    const dock3D = document.getElementById('dock3DControls');
                    if (dock3D) dock3D.style.display = 'none';
                    const dock3DDiv = document.getElementById('dock3DDivider');
                    if (dock3DDiv) dock3DDiv.style.display = 'none';
                } catch(e3d) {
                    console.warn("3D temizleme hatası:", e3d);
                }

                // 6. Tuvaldeki tüm ek nesneleri temizle
                const container = document.getElementById('canvas-container');
                if (container) {
                    const extraEls = container.querySelectorAll('.draggable:not(#elBadge):not(#elPrice):not(#elDetails):not(#elLogo), .callout-wrap, .co-neon-block, .svg-callout, .added-icon, .added-text, .custom-text-box, .is-svg-icon, .canvas-el:not(#elBadge):not(#elPrice):not(#elDetails):not(#elLogo), .pro-json-el, .cvr-base');
                    extraEls.forEach(el => el.remove());
                }
                const uiLayer = document.getElementById('ui-layer');
                if (uiLayer) {
                    const uiExtras = uiLayer.querySelectorAll(':scope > *:not(#elBadge):not(#elPrice):not(#elDetails):not(#elLogo)');
                    uiExtras.forEach(el => el.remove());
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
                if (typeof window.fitCanvasToScreen === 'function') window.fitCanvasToScreen();

                // 10. Seçimleri kaldır ve panelleri güncelle
                if (typeof deselectAll === 'function') deselectAll();
                if (typeof renderLayersList === 'function') renderLayersList();
                if (typeof updateLayerPanel === 'function') updateLayerPanel();

                // 11. Bellek ve Geçmişi Tamamen Sıfırla (Undo/Redo Stack & DB Purge)
                if (typeof window.clearHistory === 'function') {
                    window.clearHistory();
                } else {
                    window.undoStack = [];
                    window.redoStack = [];
                }
                if (typeof window.deleteStateFromDB === 'function') {
                    window.deleteStateFromDB();
                }
                if (typeof window.recordHistory === 'function') {
                    window.recordHistory('Başlangıç Durumu');
                }
                
                // Boş tuval bilgilendirme ekranını yeniden göster
                if (window.CanvasEmptyState && typeof window.CanvasEmptyState.show === 'function') {
                    window.CanvasEmptyState.resetDismiss();
                    window.CanvasEmptyState.show();
                } else {
                    const emptyStateEl = document.getElementById('canvasEmptyState');
                    if (emptyStateEl) {
                        emptyStateEl.classList.remove('is-hidden');
                        emptyStateEl.style.removeProperty('display');
                        emptyStateEl.style.removeProperty('visibility');
                        emptyStateEl.style.removeProperty('opacity');
                        emptyStateEl.style.removeProperty('pointer-events');
                        emptyStateEl.style.display = 'flex';
                    }
                }

                // İlk sekmeye dön
                if (typeof switchTab === 'function') switchTab('data');
            } catch(err) {
                console.error("Reset workspace error:", err);
            } finally {
                setTimeout(cleanupLoader, 350);
            }
        }, 80);
    };

    // Tuvalde kullanıcıya ait herhangi bir aktif içerik / öge / çizim / fotoğraf var mı kontrol et
    const pLayer = document.getElementById('photo-layer');
    const hasPhoto = !!((typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl) || 
                        (typeof masterImageBase64 !== 'undefined' && masterImageBase64) ||
                        (pLayer && pLayer.style.backgroundImage && pLayer.style.backgroundImage !== 'none' && pLayer.style.backgroundImage !== ''));
    const hasDrawings = typeof drawPaths !== 'undefined' && drawPaths && drawPaths.length > 0;
    const hasItems = document.querySelectorAll(
        '#canvas-container .editable-item, #canvas-container .callout-wrap, #canvas-container .custom-shape, ' +
        '#canvas-container .editable-draw, #canvas-container .svg-callout-el, #canvas-container [data-element-type]'
    ).length > 0;
    const canvaLayer = document.getElementById('canva-render-layer');
    const hasCanva = !!(canvaLayer && canvaLayer.children && canvaLayer.children.length > 0 && canvaLayer.style.display !== 'none');

    const hasAnyContent = hasPhoto || hasDrawings || hasItems || hasCanva;

    // 🌟 Durum 1: Açılış ekranındayken veya tuvalde hiçbir öge yokken tıklandıysa:
    // Doğrudan başlangıç kartlarını kaldır, tuvali tamamen boş ve tertemiz beyaz tuval yap
    if (!hasAnyContent) {
        if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
            window.CanvasEmptyState.dismiss();
        } else {
            const emptyStateEl = document.getElementById('canvasEmptyState');
            if (emptyStateEl) {
                emptyStateEl.classList.add('is-hidden');
                emptyStateEl.style.display = 'none';
            }
        }
        return;
    }

    // 🌟 Durum 2: Tuvalde öge / çizim / fotoğraf varsa onay iste ve temizle
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Tuvali Temizle?',
            text: 'Tüm görsel, şablon, çizim ve eklenen yazılar temizlenecek, boş bir tuval açılacak.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Tuvali Temizle',
            cancelButtonText: 'İptal',
            heightAuto: false,
            scrollbarPadding: false,
            background: '#1e293b',
            color: '#ffffff'
        }).then((result) => {
            if (result.isConfirmed) {
                doReset();
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
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        const isEditable = document.activeElement && (document.activeElement.isContentEditable || activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select');
        if (!isEditable) {
            if (typeof selectedCalloutEl !== 'undefined' && selectedCalloutEl) {
                deleteSelectedCallout();
            } else if (
                (typeof selectedEl !== 'undefined' && selectedEl) ||
                (Array.isArray(window.selectedElements) && window.selectedElements.length > 0) ||
                (window.ThreeDEngine && typeof window.ThreeDEngine.isSelected === 'function' && window.ThreeDEngine.isSelected()) ||
                (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function' && window.ThreeDGrouping.getSelected3DElements().length > 0) ||
                document.querySelector('.el-selected')
            ) {
                if (typeof deleteSelected === 'function') deleteSelected();
                else if (typeof window.deleteSelected === 'function') window.deleteSelected();
            }
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
})();

// ==================== UNIVERSAL SLIDER RESET (INSTANT RENDER ON DBLCLICK) ====================
window.resetSliderToDefault = function(input) {
    if (!input || input.type !== 'range') return;
    const id = input.id || '';
    let defaultVal = null;

    // 1. HSL Kaydırıcıları
    if (id.startsWith('hsl_') || input.classList.contains('hsl-slider')) {
        defaultVal = 0;
    }
    // 2. Fotoğraf Filtreleri & Perspektif Varsayılanları
    else if (typeof FILTER_DEFAULTS !== 'undefined' && FILTER_DEFAULTS[id] !== undefined) {
        defaultVal = FILTER_DEFAULTS[id];
    }
    // 3. AI HD Netleştirici Kaydırıcısı
    else if (id === 'aiPhotoEnhanceSlider') {
        defaultVal = 0;
    }

    // 4. Yerel Maske Kaydırıcıları (Radyal & Lineer)
    else if (id === 'mask_rad_amount' || id === 'mask_lin_amount' || id === 'mask_rad_sat' || id === 'mask_lin_sat') {
        defaultVal = 100;
    } else if (id === 'mask_rad_feather' || id === 'mask_lin_feather' || id === 'mask_rad_cx' || id === 'mask_rad_cy' || id === 'mask_lin_x1' || id === 'mask_lin_x2' || id === 'mask_lin_y2') {
        defaultVal = 50;
    } else if (id === 'mask_lin_y1') {
        defaultVal = 12;
    } else if (id === 'mask_rad_rx') {
        defaultVal = 25;
    } else if (id === 'mask_rad_ry') {
        defaultVal = 20;
    } else if (id.startsWith('mask_rad_') || id.startsWith('mask_lin_')) {
        defaultVal = 0;
    }
    // 5. Tuval, Yakınlaştırma & Konumlandırma
    else if (id === 'zoomCtrl' || id === 'photoZoomCtrl' || id === 'keystoneZoom') {
        defaultVal = 100;
    } else if (id === 'photoXCtrl' || id === 'photoYCtrl' || id === 'panX' || id === 'panY') {
        defaultVal = 50;
    } else if (id === 'deOpacity' || id === 'drawOpacity' || id === 'elOpacity') {
        defaultVal = 100;
    } else if (id === 'deFillOp' || id === 'fillOpacity') {
        defaultVal = 0;
    }
    // 6. Genel HTML Varsayılan Değeri (value="..." niteliği veya defaultValue)
    else if (input.hasAttribute('value')) {
        defaultVal = input.getAttribute('value');
    } else if (input.defaultValue !== undefined && input.defaultValue !== '') {
        defaultVal = input.defaultValue;
    } else {
        const min = parseFloat(input.min) || 0;
        const max = parseFloat(input.max) || 100;
        defaultVal = (min <= 0 && max >= 0) ? 0 : min;
    }

    if (defaultVal !== null) {
        input.value = defaultVal;

        // Özel Durum: HSL Kaydırıcıları (8 Renk Kanalı Senkronizasyonu)
        if (id === 'hsl_h_slider' || id === 'hsl_s_slider' || id === 'hsl_l_slider') {
            const type = id.split('_')[1]; // 'h', 's' veya 'l'
            const activeDot = document.querySelector('.hsl-color-dot.active');
            const color = (activeDot && activeDot.dataset.color) ? activeDot.dataset.color : 'red';
            const hiddenInput = document.querySelector(`.hsl-slider[data-color="${color}"][data-type="${type}"]`) ||
                                document.getElementById(`hsl_${type}_${color}Val_input`);
            if (hiddenInput) {
                hiddenInput.value = defaultVal;
                hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
                hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            const hslValSpan = document.getElementById(`hsl_${type}_val`);
            if (hslValSpan) hslValSpan.textContent = defaultVal;
        }

        // Özel Durum: AI HD Netleştirici
        if (id === 'aiPhotoEnhanceSlider') {
            const aiValSpan = document.getElementById('aiPhotoEnhanceLevelVal');
            if (aiValSpan) aiValSpan.textContent = '0%';
        }


        // Özel Durum: Yerel Maskeler (Radyal, Lineer & AI Parametre Senkronu)
        if (window.PhotoMasksManager) {
            if (id.startsWith('mask_rad_')) {
                const param = id.replace('mask_rad_', '');
                const val = (param === 'amount' || param === 'saturate' || param === 'sat' || param === 'feather' || param === 'spread' || param === 'cx' || param === 'cy' || param === 'rx' || param === 'ry' || param === 'exp' || param === 'temp' || param === 'hl' || param === 'sh') ? (parseFloat(defaultVal) / 100) : parseFloat(defaultVal);
                const mapParam = (param === 'exp' ? 'exposure' : (param === 'hl' ? 'highlights' : (param === 'sh' ? 'shadows' : (param === 'sat' ? 'saturate' : param))));
                window.PhotoMasksManager.updateRadialParam(mapParam, val);
            } else if (id.startsWith('mask_lin_')) {
                const param = id.replace('mask_lin_', '');
                const val = (param === 'amount' || param === 'saturate' || param === 'sat' || param === 'feather' || param === 'spread' || param === 'x1' || param === 'y1' || param === 'x2' || param === 'y2' || param === 'exp' || param === 'temp' || param === 'hl' || param === 'sh') ? (parseFloat(defaultVal) / 100) : parseFloat(defaultVal);
                const mapParam = (param === 'exp' ? 'exposure' : (param === 'hl' ? 'highlights' : (param === 'sh' ? 'shadows' : (param === 'sat' ? 'saturate' : param))));
                window.PhotoMasksManager.updateLinearParam(mapParam, val);
            } else if (id.startsWith('mask_ai_')) {
                const param = id.replace('mask_ai_', '');
                const val = (param === 'amount' || param === 'saturate' || param === 'sat' || param === 'exp' || param === 'temp' || param === 'hl' || param === 'sh') ? (parseFloat(defaultVal) / 100) : parseFloat(defaultVal);
                const mapParam = (param === 'exp' ? 'exposure' : (param === 'hl' ? 'highlights' : (param === 'sh' ? 'shadows' : (param === 'sat' ? 'saturate' : param))));
                window.PhotoMasksManager.updateSelectedParam(mapParam, val);
            }
        }

        // Girdi olaylarını tetikle
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));

        // UI Değer Göstergelerini Güncelle
        let valSpan = null;
        if (id) {
            valSpan = document.getElementById(id + 'Val') ||
                      document.getElementById(id.replace('Ctrl', 'Val')) ||
                      document.getElementById(id.replace('_slider', '_val'));
        }
        if (!valSpan) {
            const parent = input.closest('.slider-group, .input-group, .filter-slider-box') || input.parentElement;
            if (parent) {
                valSpan = parent.querySelector('label span:nth-child(2), label span[id], .val-display');
            }
        }

        if (valSpan && id !== 'aiPhotoEnhanceSlider') {
            let unit = '';
            if (id === 'exposure' || id === 'contrast' || id === 'saturate' || id === 'grayscale' || id === 'sepia' || id === 'invertCtrl' || id === 'vignette' || id === 'keystoneZoom' || id.endsWith('amount') || id.endsWith('feather') || id.endsWith('spread') || id.endsWith('sat') || id.endsWith('cx') || id.endsWith('cy') || id.endsWith('rx') || id.endsWith('ry') || id.endsWith('x1') || id.endsWith('y1') || id.endsWith('x2') || id.endsWith('y2') || id.includes('Opacity')) {
                unit = '%';
            } else if (id === 'fblur' || id.includes('Radius') || id.includes('Padding') || id.includes('Width') || id.includes('Size')) {
                unit = 'px';
            } else if (id === 'hueRotate' || id === 'keystoneRotate' || id.includes('Rotate') || id.includes('angle') || id.includes('Angle')) {
                unit = '°';
            }
            valSpan.textContent = defaultVal + unit;
        }

        // Fotoğraf Filtreleri ve Piksel Motorlarını Yeniden Çiz
        if (typeof applyPhotoFilters === 'function') applyPhotoFilters();
        if (typeof processPixels === 'function') processPixels(true);
        if (typeof processHSL === 'function') processHSL();
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof applyShadowHighlight === 'function') applyShadowHighlight();
        if (typeof renderCanvas === 'function') renderCanvas();
    }
};

// Hedef kaydırıcıyı bulma yardımcısı
function findTargetRangeSlider(target) {
    if (!target) return null;
    if (target.tagName && target.tagName.toLowerCase() === 'input' && target.type === 'range') {
        return target;
    }
    // Önce slider-group veya input-group kapsayıcısına bak (label ve input kardeştir)
    const group = target.closest('.slider-group, .input-group, .filter-slider-box');
    if (group) {
        const range = group.querySelector('input[type="range"]');
        if (range) return range;
    }
    const container = target.closest('.mask-section-card, .hsl-accordion, .photo-ai-card, label') || target.parentElement;
    if (container) {
        const range = container.querySelector('input[type="range"]');
        if (range) return range;
        if (container.parentElement) {
            const parentRange = container.parentElement.querySelector('input[type="range"]');
            if (parentRange) return parentRange;
        }
    }
    return null;
}

// 1. Doğrudan Çift Tıklama (Desktop dblclick)
document.addEventListener('dblclick', function(e) {
    const slider = findTargetRangeSlider(e.target);
    if (slider) {
        e.preventDefault();
        e.stopPropagation();
        window.resetSliderToDefault(slider);
    }
}, true);

// 2. Hızlı Çift Tıklama Takibi (Tarayıcının range input dblclick'i yutması durumuna karşı)
let lastSliderClickTime = 0;
let lastSliderClickTarget = null;
document.addEventListener('click', function(e) {
    const slider = findTargetRangeSlider(e.target);
    if (!slider) {
        lastSliderClickTarget = null;
        return;
    }
    const now = Date.now();
    if (lastSliderClickTarget === slider && (now - lastSliderClickTime) < 350) {
        e.preventDefault();
        window.resetSliderToDefault(slider);
        lastSliderClickTime = 0;
        lastSliderClickTarget = null;
    } else {
        lastSliderClickTime = now;
        lastSliderClickTarget = slider;
    }
}, true);

// 3. Mobil Çift Dokunma (Mobile Double-Tap)
let lastSliderTap = 0;
document.addEventListener('touchend', function(e) {
    const slider = findTargetRangeSlider(e.target);
    if (slider) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastSliderTap;
        if (tapLength < 400 && tapLength > 0) {
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
        if (didTriggerBeforeAfter) {
            didTriggerBeforeAfter = false;
            if (typeof setOriginalView === 'function') {
                setOriginalView(false);
            } else if (typeof toggleBeforeAfter === 'function') {
                toggleBeforeAfter(false);
            }
            
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
        // Tuval üzerinde varsayılan tarayıcı menüsünü tamamen engelle (metin girişleri hariç)
        if (!e.target.closest('input:not([type="button"]):not([type="submit"]):not([type="range"]), textarea, [contenteditable="true"]')) {
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
                    if (typeof showToast === 'function') showToast('Taslaklar temizlendi', 'info');
                }).catch(err => {
                    console.error(err);
                    if (typeof showToast === 'function') showToast('Hata oluştu', 'error');
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
});// ==============================================
// ?? �EK�LLER MOD�L� (CANVA TARZI TEMEL �EK�LLER)
// ==============================================

window.hexToRgba = function(hex, opacity) {
    if(!hex || !hex.startsWith('#')) return hex;
    if(hex.length === 4) {
        hex = '#' + hex[1]+hex[1] + hex[2]+hex[2] + hex[3]+hex[3];
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
};

window.addShape = function(type) {
    if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
        window.CanvasEmptyState.dismiss();
    }
    const cContainer = document.getElementById('canvas-container');
    if (!cContainer) return;
    const el = document.createElement('div');
    el.className = 'canvas-el draggable shape-el';
    el.dataset.shapeType = type;
    el.dataset.bgColor = '#3b82f6';
    el.dataset.bgOpacity = '100';
    el.dataset.borderColor = '#ffffff';
    el.dataset.borderOpacity = '100';
    el.dataset.borderWidth = '0';
    el.dataset.radius = '0';
    el.dataset.opacity = '100';
    
    const targetCanvasW = cContainer.offsetWidth || 1920;
    const targetCanvasH = cContainer.offsetHeight || 1080;
    el.style.left = Math.round(targetCanvasW / 2 - 50) + 'px';
    el.style.top = Math.round(targetCanvasH / 2 - 50) + 'px';
    el.style.position = 'absolute';
    el.style.boxSizing = 'border-box';
    el.style.zIndex = '50';

    const inner = document.createElement('div');
    inner.className = 'shape-inner';
    inner.style.width = '100%';
    inner.style.height = '100%';
    inner.style.boxSizing = 'border-box';
    inner.style.display = 'flex';
    inner.style.alignItems = 'center';
    inner.style.justifyContent = 'center';
    
    el.style.width = '100px';
    el.style.height = '100px';

    const svgs = {
        'triangle': '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; overflow:visible; fill:var(--shape-bg); stroke:var(--shape-border); stroke-width:var(--shape-border-width); stroke-linejoin:round;"><polygon points="50,5 95,95 5,95"/></svg>',
        'star': '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; overflow:visible; fill:var(--shape-bg); stroke:var(--shape-border); stroke-width:var(--shape-border-width); stroke-linejoin:round;"><polygon points="50,5 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35"/></svg>',
        'heart': '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; overflow:visible; fill:var(--shape-bg); stroke:var(--shape-border); stroke-width:var(--shape-border-width); stroke-linejoin:round;"><path d="M50,90 C50,90 5,60 5,30 C5,10 30,10 50,30 C70,10 95,10 95,30 C95,60 50,90 50,90 Z"/></svg>',
        'hexagon': '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; overflow:visible; fill:var(--shape-bg); stroke:var(--shape-border); stroke-width:var(--shape-border-width); stroke-linejoin:round;"><polygon points="25,5 75,5 95,50 75,95 25,95 5,50"/></svg>',
        'arrow-right': '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; overflow:visible; fill:var(--shape-bg); stroke:var(--shape-border); stroke-width:var(--shape-border-width); stroke-linejoin:round;"><polygon points="5,35 60,35 60,15 95,50 60,85 60,65 5,65"/></svg>',
        'arrow-left': '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; overflow:visible; fill:var(--shape-bg); stroke:var(--shape-border); stroke-width:var(--shape-border-width); stroke-linejoin:round;"><polygon points="95,35 40,35 40,15 5,50 40,85 40,65 95,65"/></svg>',
        'arrow-up': '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; overflow:visible; fill:var(--shape-bg); stroke:var(--shape-border); stroke-width:var(--shape-border-width); stroke-linejoin:round;"><polygon points="35,95 35,40 15,40 50,5 85,40 65,40 65,95"/></svg>'
    };

    if (type === 'rectangle') {
        el.style.width = '120px';
        el.style.height = '80px';
        inner.style.backgroundColor = 'var(--shape-bg)';
    } else if (type === 'circle') {
        el.dataset.radius = '50';
        inner.style.backgroundColor = 'var(--shape-bg)';
        inner.style.borderRadius = '50%';
    } else if (type === 'line') {
        el.style.width = '150px';
        el.style.height = '10px';
        el.dataset.bgColor = 'transparent';
        el.dataset.borderColor = '#ffffff';
        el.dataset.borderWidth = '4';
        inner.style.borderTop = 'var(--shape-border-width) solid var(--shape-border)';
    } else if (type === 'dashed-line') {
        el.style.width = '150px';
        el.style.height = '10px';
        el.dataset.bgColor = 'transparent';
        el.dataset.borderColor = '#ffffff';
        el.dataset.borderWidth = '4';
        inner.style.borderTop = 'var(--shape-border-width) dashed var(--shape-border)';
    } else if (type === 'dotted-line') {
        el.style.width = '150px';
        el.style.height = '10px';
        el.dataset.bgColor = 'transparent';
        el.dataset.borderColor = '#ffffff';
        el.dataset.borderWidth = '4';
        inner.style.borderTop = 'var(--shape-border-width) dotted var(--shape-border)';
    } else if (svgs[type]) {
        el.dataset.borderWidth = '0';
        inner.innerHTML = svgs[type];
    }
    
    el.appendChild(inner);
    cContainer.appendChild(el);
    
    const bgRgba = window.hexToRgba(el.dataset.bgColor, el.dataset.bgOpacity);
    const bcRgba = window.hexToRgba(el.dataset.borderColor, el.dataset.borderOpacity);
    
    el.style.setProperty('--shape-bg', bgRgba);
    el.style.setProperty('--shape-border', bcRgba);
    el.style.setProperty('--shape-border-width', el.dataset.borderWidth + 'px');
    el.style.opacity = el.dataset.opacity / 100;

    if (typeof bindDrag === 'function') bindDrag(el);
    if (typeof selectElement === 'function') selectElement(el);
    if (typeof saveState === 'function') saveState();
};

window.loadShapeSettings = function(el) {
    try {
    const panel = document.getElementById('shapeSettingsPanel');
    if (!panel) return;
    panel.style.display = 'block';
    
    const type = el.dataset.shapeType || '';
    const isLine = type.includes('line');
    
    if (document.getElementById('shapeBgColor')) document.getElementById('shapeBgColor').value = el.dataset.bgColor || '#3b82f6';
    if (document.getElementById('shapeBgOpacity')) {
        const val = el.dataset.bgOpacity || '100';
        document.getElementById('shapeBgOpacity').value = val;
        if(document.getElementById('shapeBgOpacityVal')) document.getElementById('shapeBgOpacityVal').textContent = val + '%';
    }
    
    if (document.getElementById('shapeBorderColor')) document.getElementById('shapeBorderColor').value = el.dataset.borderColor || '#ffffff';
    if (document.getElementById('shapeBorderOpacity')) {
        const val = el.dataset.borderOpacity || '100';
        document.getElementById('shapeBorderOpacity').value = val;
        if(document.getElementById('shapeBorderOpacityVal')) document.getElementById('shapeBorderOpacityVal').textContent = val + '%';
    }
    
    const bW = document.getElementById('shapeBorderWidth');
    if (bW) {
        bW.value = el.dataset.borderWidth || '0';
        if (document.getElementById('shapeBorderWidthVal')) document.getElementById('shapeBorderWidthVal').textContent = bW.value + 'px';
    }
    
    const rC = document.getElementById('shapeRadiusContainer');
    if (rC) {
        if (type === 'rectangle' || type === 'circle') {
            rC.style.display = 'block';
            const sR = document.getElementById('shapeRadius');
            if(sR) {
                sR.value = el.dataset.radius || '0';
                if (document.getElementById('shapeRadiusVal')) document.getElementById('shapeRadiusVal').textContent = sR.value + (type === 'circle' ? '%' : 'px');
            }
        } else {
            rC.style.display = 'none';
        }
    }
    
    const opW = document.getElementById('shapeOpacity');
    if (opW) {
        opW.value = el.dataset.opacity || '100';
        if (document.getElementById('shapeOpacityVal')) document.getElementById('shapeOpacityVal').textContent = opW.value + '%';
    }
    } catch(err) { console.error('Shape Settings Load Error:', err); }
};

window.applyShapeSettings = function() {
    try {
    if (!selectedEl || !selectedEl.classList.contains('shape-el')) return;
    
    const bg = document.getElementById('shapeBgColor').value;
    const bgOp = document.getElementById('shapeBgOpacity').value;
    const bc = document.getElementById('shapeBorderColor').value;
    const bcOp = document.getElementById('shapeBorderOpacity').value;
    const bw = document.getElementById('shapeBorderWidth').value;
    const op = document.getElementById('shapeOpacity').value;
    
    selectedEl.dataset.bgColor = bg;
    selectedEl.dataset.bgOpacity = bgOp;
    selectedEl.dataset.borderColor = bc;
    selectedEl.dataset.borderOpacity = bcOp;
    selectedEl.dataset.borderWidth = bw;
    selectedEl.dataset.opacity = op;
    
    const bgRgba = window.hexToRgba(bg, bgOp);
    const bcRgba = window.hexToRgba(bc, bcOp);
    
    selectedEl.style.setProperty('--shape-bg', bgRgba);
    selectedEl.style.setProperty('--shape-border', bcRgba);
    selectedEl.style.setProperty('--shape-border-width', bw + 'px');
    selectedEl.style.opacity = op / 100;

    if (document.getElementById('shapeBgOpacityVal')) document.getElementById('shapeBgOpacityVal').textContent = bgOp + '%';
    if (document.getElementById('shapeBorderOpacityVal')) document.getElementById('shapeBorderOpacityVal').textContent = bcOp + '%';
    if (document.getElementById('shapeBorderWidthVal')) document.getElementById('shapeBorderWidthVal').textContent = bw + 'px';
    if (document.getElementById('shapeOpacityVal')) document.getElementById('shapeOpacityVal').textContent = op + '%';

    const inner = selectedEl.querySelector('.shape-inner');
    if (inner) {
        const type = selectedEl.dataset.shapeType;
        
        if (type === 'rectangle' || type === 'circle') {
            const rad = document.getElementById('shapeRadius').value;
            selectedEl.dataset.radius = rad;
            if (document.getElementById('shapeRadiusVal')) document.getElementById('shapeRadiusVal').textContent = rad + (type === 'circle' ? '%' : 'px');
            
            inner.style.borderRadius = rad + (type === 'circle' ? '%' : 'px');
            if(type === 'rectangle') {
               inner.style.border = bw + 'px solid ' + bcRgba;
               inner.style.backgroundColor = bgRgba;
            } else {
               inner.style.border = bw + 'px solid ' + bcRgba;
               inner.style.backgroundColor = bgRgba;
            }
        } else if (type === 'line') {
            inner.style.borderTop = bw + 'px solid ' + bcRgba;
        } else if (type === 'dashed-line') {
            inner.style.borderTop = bw + 'px dashed ' + bcRgba;
        } else if (type === 'dotted-line') {
            inner.style.borderTop = bw + 'px dotted ' + bcRgba;
        }
    }
    
    if (typeof requestAutoSave === 'function') requestAutoSave();
    } catch(err) { console.error('Shape Settings Error:', err); }
};

window.deleteSelectedShape = function() {
    if (!selectedEl || !selectedEl.classList.contains('shape-el')) return;
    selectedEl.remove();
    if (typeof deselectAll === 'function') deselectAll();
    if (typeof saveState === 'function') saveState();
};

window.convertSelectedShapeTo3D = function() {
    const rawEl = window.selectedEl || document.querySelector('.shape-el.el-selected, .shape-el.selected, .canvas-el.selected');
    const el = rawEl ? (rawEl.closest('.shape-el') || rawEl) : null;
    if (!el || !el.classList.contains('shape-el')) {
        if (typeof window.showToast === 'function') {
            window.showToast('Lütfen önce dönüştürülecek bir şekil seçin', 'warning');
        }
        return;
    }
    if (window.ThreeDEngine && typeof window.ThreeDEngine.convert2DBadgeTo3D === 'function') {
        window.ThreeDEngine.convert2DBadgeTo3D(el);
    }
};

document.addEventListener('mousedown', (e) => {
    if (e.target.id === 'canvas-container' || e.target.id === 'workArea') {
        const p = document.getElementById('shapeSettingsPanel');
        if (p) p.style.display = 'none';
        
        // Hide shape handles
        document.querySelectorAll('.shape-el').forEach(el => {
            const res = el.querySelector('.callout-resizer');
            const rot = el.querySelector('.callout-rotator');
            if (res) res.style.display = 'none';
            if (rot) rot.style.display = 'none';
            el.style.outline = 'none';
        });
    }
});









