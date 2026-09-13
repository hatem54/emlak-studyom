/**
 * ============================================================
 * V8 EXPORT ENGINE - Native Canvas API Migration
 * ============================================================
 * 
 * MIMARI: html2canvas artÄ±k SADECE text/UI iÃ§in kullanÄ±lÄ±r.
 * FotoÄŸraflar native Canvas API ile Ã§izilir.
 * Koordinat hesabÄ± offsetLeft/offsetTop Ã¼zerinden yapÄ±lÄ±r.
 * 
 * Migration Phase: 0 (Cleanup)
 * Next Phase: 1 (Export Engine Rewrite)
 * ============================================================
 */
/**
 * ============================================
 * EXPORT & IMPORT MODULE
 * modules/export.js
 * ============================================
 * 
 * BaÃ„Å¸Ã„Â±mlÃ„Â±lÃ„Â±klar:
 * - config.js
 * - core/drag.js
 * 
 * KullanÃ„Â±lan yerler:
 * - main.js
 */

function isExportIgnoredElement(el) {
    if (!el) return false;
    if (el.id === 'photo-layer') return true;
    if (el.id === 'saber-layer') return true;
    if (window.isExportingVideo && (el.id === 'draw-layer' || el.id === 'drawCanvas')) return true;
    if (el.id === 'export-loading-overlay') return true;
    if (el.id === 'app-custom-context-menu' || el.id === 'native-context-menu' || el.id === 'native-context-overlay') return true;

    // 🚫 Gizli overlay katmanları (html2canvas'ın siyah gölge kutusu basmasını önler)
    if (el.id === 'shadow-overlay' || el.id === 'highlight-overlay' || el.id === 'vignette-layer' || el.id === 'mask-layer' || el.id === 'canva-render-layer') {
        if (el.style && (el.style.display === 'none' || el.style.visibility === 'hidden' || el.style.opacity === '0')) return true;
        if (typeof window.getComputedStyle === 'function') {
            try {
                const comp = window.getComputedStyle(el);
                if (comp.display === 'none' || comp.visibility === 'hidden' || comp.opacity === '0') return true;
            } catch(e){}
        }
    }

    // 🚫 Gizli şablon elemanları (elBadge, elPrice, elDetails, elLogo)
    if (el.id === 'elBadge' || el.id === 'elPrice' || el.id === 'elDetails' || el.id === 'elLogo') {
        if (el.style && (el.style.visibility === 'hidden' || el.style.display === 'none')) return true;
        if (typeof window.getComputedStyle === 'function') {
            try {
                const comp = window.getComputedStyle(el);
                if (comp.visibility === 'hidden' || comp.display === 'none') return true;
            } catch(e){}
        }
    }

    // 🚫 Genel gizli eleman kontrolü
    if (el.style && (el.style.display === 'none' || el.style.visibility === 'hidden')) return true;

    if (el.classList) {
        if (el.classList.contains('editable-draw')) return true;
        if (el.classList.contains('el-selected')) return true;
        if (el.classList.contains('photo-inner-zoom')) return true;
        if (el.classList.contains('text-handle') ||
            el.classList.contains('text-lock-handle') ||
            el.classList.contains('text-resize-handle') ||
            el.classList.contains('text-rotate-handle') ||
            el.classList.contains('text-delete-handle') ||
            el.classList.contains('callout-lock-btn') ||
            el.classList.contains('callout-controls') ||
            el.classList.contains('callout-resizer') ||
            el.classList.contains('callout-rotator') ||
            el.classList.contains('callout-select-border') ||
            el.classList.contains('cbtn-del') ||
            el.classList.contains('draw-handle') ||
            el.classList.contains('vertex-handle') ||
            el.classList.contains('polygon-vertex') ||
            el.classList.contains('app-context-menu') ||
            el.classList.contains('draw-selection-box') ||
            el.classList.contains('cerceve-handle') ||
            el.classList.contains('kolaj-handle') ||
            el.classList.contains('kolaj-tutamac')) {
            return true;
        }
    }
    return false;
}

function sanitizeExportClone(clonedDoc) {
    if (!clonedDoc) return;
    try {
        // 0. Tuval arka planını ve ölçek dönüşümünü klonda tamamen sıfırla (Beyaz kutu veya kayık ölçeklenmeyi kesinlikle önler)
        const clonedContainer = clonedDoc.getElementById('canvas-container');
        if (clonedContainer) {
            clonedContainer.style.setProperty('background-color', 'transparent', 'important');
            clonedContainer.style.backgroundColor = 'transparent';
            clonedContainer.style.background = 'transparent';
            clonedContainer.style.transform = 'none';
            clonedContainer.style.webkitTransform = 'none';
            clonedContainer.style.position = 'static';
            clonedContainer.style.margin = '0px';
            clonedContainer.style.padding = '0px';
        }
        const clonedSaber = clonedDoc.getElementById('saber-layer');
        if (clonedSaber) clonedSaber.remove();
        clonedDoc.querySelectorAll('.editable-draw').forEach(el => el.remove());

        if (window.isExportingVideo) {
            const clonedDraw = clonedDoc.getElementById('draw-layer') || clonedDoc.getElementById('drawCanvas');
            if (clonedDraw) clonedDraw.remove();
            const clonedPhoto = clonedDoc.getElementById('photo-layer');
            if (clonedPhoto) clonedPhoto.remove();
        }

        // 1. Dışa aktarma maskesi ve loading pencerelerini klondan derhal temizle
        const globalMask = clonedDoc.getElementById('download-overlay-mask');
        if (globalMask) globalMask.remove();
        const exportLoader = clonedDoc.getElementById('export-loading-overlay');
        if (exportLoader) exportLoader.remove();

        // 2. Gizli veya kapalı tüm şablon, overlay ve arayüz kontrol elemanlarını klondan tamamen kaldır
        const hiddenSelectors = [
            '#download-overlay-mask', '#export-loading-overlay',
            '#shadow-overlay', '#highlight-overlay', '#vignette-layer', '#mask-layer', '#maskInteractiveSvg',
            '#canva-render-layer', '#app-custom-context-menu', '#native-context-menu', '#native-context-overlay',
            '#elBadge', '#elPrice', '#elDetails', '#elLogo',
            '.text-handle', '.text-lock-handle', '.text-resize-handle', '.text-rotate-handle', '.text-delete-handle',
            '.callout-lock-btn', '.callout-controls', '.callout-resizer', '.callout-rotator', '.callout-select-border',
            '.cbtn-del', '.draw-handle', '.vertex-handle', '.polygon-vertex', '.app-context-menu', '.draw-selection-box',
            '.cerceve-handle', '.kolaj-handle', '.kolaj-tutamac', '#cerceveEditor',
            '.photo-inner-zoom'
        ];
        
        hiddenSelectors.forEach(sel => {
            clonedDoc.querySelectorAll(sel).forEach(node => {
                const isControlOrHandle = node.classList && (
                    node.classList.contains('text-handle') || node.classList.contains('callout-controls') ||
                    node.classList.contains('callout-resizer') || node.classList.contains('callout-rotator') ||
                    node.classList.contains('callout-select-border') || node.classList.contains('callout-lock-btn') ||
                    node.classList.contains('cbtn-del') || node.classList.contains('draw-handle') ||
                    node.classList.contains('vertex-handle') || node.classList.contains('polygon-vertex') ||
                    node.classList.contains('cerceve-handle') || node.classList.contains('kolaj-handle') ||
                    node.classList.contains('kolaj-tutamac') ||
                    node.classList.contains('photo-inner-zoom')
                );

                // Orijinal DOM'daki gerçek duruma ve klondaki duruma bak
                let isHidden = false;
                if (node.style && (node.style.display === 'none' || node.style.visibility === 'hidden' || node.style.opacity === '0')) {
                    isHidden = true;
                }
                const orig = node.id ? document.getElementById(node.id) : null;
                if (!isHidden && orig && typeof window.getComputedStyle === 'function') {
                    try {
                        const comp = window.getComputedStyle(orig);
                        if (comp.display === 'none' || comp.visibility === 'hidden' || comp.opacity === '0') {
                            isHidden = true;
                        }
                    } catch(e) {}
                }
                if (!isHidden && clonedDoc.defaultView && typeof clonedDoc.defaultView.getComputedStyle === 'function') {
                    try {
                        const comp = clonedDoc.defaultView.getComputedStyle(node);
                        if (comp && (comp.display === 'none' || comp.visibility === 'hidden' || comp.opacity === '0')) {
                            isHidden = true;
                        }
                    } catch(e) {}
                }

                if (node.id === 'mask-layer' && !node.style.backgroundImage && (!orig || !orig.style.backgroundImage)) {
                    isHidden = true;
                }
                if (node.id === 'cerceveEditor' || node.id === 'export-loading-overlay' || node.id === 'download-overlay-mask') {
                    isHidden = true;
                }

                if (isControlOrHandle || isHidden) {
                    node.remove();
                }
            });
        });

        // Kolaj çerçevelerindeki aktif seçim mavi/cyan kesikli çizgisini temizle
        clonedDoc.querySelectorAll('.kolaj-cerceve').forEach(node => {
            if (node.style) {
                node.style.outline = 'none';
            }
        });

        // 3. html2canvas UYUMLULUK TEMİZLİĞİ (Gölge, Çerçeve ve Blur Anormalliklerini Önleme):
        // a) html2canvas 'backdrop-filter' desteklemez ve şeffaf katmanda leke/siyah kutu basar. Tüm düğümlerden temizle.
        // b) html2canvas 'inset' gölgeleri ve '0 0 30px' gibi büyük yayılma bulanıklıklarını yanlış hesaplayıp
        //    kayık leke dikdörtgenleri veya katı beyaz iç çerçeveler basar. Box-shadow'u temiz, tekil bir drop-shadow'a dönüştür.
        const allNodes = clonedDoc.querySelectorAll('*');
        allNodes.forEach(node => {
            if (node.style) {
                if (node.style.backdropFilter) node.style.backdropFilter = 'none';
                if (node.style.webkitBackdropFilter) node.style.webkitBackdropFilter = 'none';

                // Box-shadow sanitizasyonu (html2canvas şeffaf tuval uyumluluğu)
                const rawShadow = node.style.boxShadow;
                if (rawShadow && rawShadow !== 'none' && rawShadow !== '') {
                    // Spread-border kontrolü: Örn "0 0 0 1px rgba(245,158,11,.3)" gibi gölgeler gerçekte kenarlıktır
                    const shadowParts = rawShadow.split(/,(?![^(]*\))/).map(s => s.trim());
                    shadowParts.forEach(part => {
                        const spreadMatch = part.match(/0(?:px)?\s+0(?:px)?\s+0(?:px)?\s+([\d.]+)px\s+(.+)/);
                        if (spreadMatch && (!node.style.border || node.style.border === 'none' || node.style.border === '')) {
                            node.style.border = `${spreadMatch[1]}px solid ${spreadMatch[2]}`;
                        }
                    });

                    // Standart şablon öğeleri (elBadge, elPrice, elDetails) ve tuval elemanlarında
                    // html2canvas'ın kirli koyu siyah leke/hale basmasını engellemek için
                    // gölgeleri tamamen temizle. Öğelerin kendi parlak renkleri ve altın çerçeveleri jilet gibi net kalsın.
                    node.style.boxShadow = 'none';
                }
            }
        });
    } catch (e) {
        console.warn("Clone sanitization error:", e);
    }
}


let _appLoadingTimeout = null;
function showAppLoading(title = 'İşlem Yapılıyor...', subtitle = 'Lütfen bekleyin...', timeoutMs = 8000) {
    if (_appLoadingTimeout) clearTimeout(_appLoadingTimeout);
    let overlay = document.getElementById('export-loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'export-loading-overlay';
        overlay.innerHTML = `
            <div class="export-loader-card">
                <div class="export-loader-spinner"></div>
                <div class="export-content-wrapper">
                    <div class="export-loader-title">${title}</div>
                    <div class="export-loader-sub">${subtitle}</div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    } else {
        const titleEl = overlay.querySelector('.export-loader-title');
        const subEl = overlay.querySelector('.export-loader-sub');
        if (titleEl) titleEl.textContent = title;
        if (subEl) subEl.textContent = subtitle;
        overlay.style.display = 'flex';
    }
    void overlay.offsetWidth;
    overlay.classList.add('active');

    // Güvenlik zaman aşımı (loading sonsuza kadar kalmasın)
    _appLoadingTimeout = setTimeout(() => {
        hideAppLoading(0, true);
    }, timeoutMs);
}

function showExportLoading(title = 'Görsel Hazırlanıyor...', subtitle = 'Yüksek çözünürlüklü grafikler ve fontlar işleniyor...') {
    // Export işlemi 4K veya detaylı olabileceğinden 60 saniye süre verilir
    showAppLoading(title, subtitle, 60000);
}

function hideAppLoading(delay = 0, force = false) {
    // Export işlemi sürerken ara fonksiyonların loader'ı kapatmasını engelle
    if (!force && document.body && document.body.classList.contains('is-exporting')) {
        return;
    }
    if (_appLoadingTimeout) {
        clearTimeout(_appLoadingTimeout);
        _appLoadingTimeout = null;
    }
    const doHide = () => {
        const overlay = document.getElementById('export-loading-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay && !overlay.classList.contains('active')) {
                    overlay.remove();
                }
            }, 240);
        }
    };
    if (delay > 0) {
        setTimeout(doHide, delay);
    } else {
        doHide();
    }
}

window.showAppLoading = showAppLoading;
window.hideAppLoading = hideAppLoading;
window.showExportLoading = showExportLoading;
window.hideExportLoading = (delay = 0, force = false) => hideAppLoading(delay, force);

function switchPreviewFormat(){
    const formatName=$('previewFormat').value;
    const format=EXPORT_FORMATS[formatName];
    if(!format) {
        hideAppLoading();
        return;
    }

    document.querySelectorAll('.dock-pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.format === formatName);
    });

    const oldW = parseInt(canvasEl.style.width) || 1920;
    const oldH = parseInt(canvasEl.style.height) || 1080;
    const newW = format.w;
    const newH = format.h;

    // Şık yükleme ekranı göster
    if (!window.isInitialLoad) {
        showAppLoading('Format Ayarlanıyor...', 'Tuval ve katmanlar yeni boyuta uyarlanıyor...');
    }

    const oldPhotoState = window.getCurrentPhotoState ? window.getCurrentPhotoState() : null;

    canvasEl.style.width=format.w+'px';
    canvasEl.style.height=format.h+'px';
    drawCanvas.width=format.w;
    drawCanvas.height=format.h;
    drawCanvas.style.width=format.w+'px';
    drawCanvas.style.height=format.h+'px';

    // Saber canvas resize
    if (window.SaberEngine && typeof SaberEngine.resize === 'function') {
        SaberEngine.resize(format.w, format.h);
    }

    if (window.isRestoringState === true) {
        hideAppLoading();
        return;
    }
    
    // Scale and adapt custom draggable items immediately
    if (oldW && oldH && newW && newH && (oldW !== newW || oldH !== newH)) {
        try {
            const isTemplateMode = (typeof isCanvaMode !== 'undefined' && isCanvaMode);

            // 1. Canva Şablonu Aktifse, şablonu yeni formata göre TAM BOYUTTA yeniden oluştur
            if (isTemplateMode && typeof refreshActiveCanvaTemplate === 'function') {
                refreshActiveCanvaTemplate();
            } else if (!isTemplateMode && typeof activeLayout !== 'undefined' && activeLayout && typeof TPL !== 'undefined' && TPL[activeLayout]) {
                // Standart Şablon (Giriş sekmesi) aktifse yeni format boyutlarına göre tam oranla
                const t = TPL[activeLayout];
                if (typeof elBadge !== 'undefined' && elBadge && t.badge) applyStylePos(elBadge, t.badge);
                if (typeof elPrice !== 'undefined' && elPrice && t.price) applyStylePos(elPrice, t.price);
                if (typeof elDetails !== 'undefined' && elDetails && t.details) applyStylePos(elDetails, t.details);
                if (typeof elLogo !== 'undefined' && elLogo && t.logo) applyStylePos(elLogo, t.logo);
            }

            // 2. Fotoğraf panellerini güncelle ve native canvas'a çiz (redrawAll tetiklenir)
            document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => { 
                if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p); 
            });
            
            const newPhotoState = window.getCurrentPhotoState ? window.getCurrentPhotoState() : null;
            
            // Select only user-added UI text items (Callouts, Neon Blocks, Free Texts, Icons)
            const customItems = document.querySelectorAll('#canvas-container .draggable, #canvas-container .callout-wrap, #canvas-container .co-neon-block');
            
            let tParams = null;
            if (oldPhotoState && newPhotoState && typeof calculateTransformParams === 'function') {
                tParams = calculateTransformParams(oldPhotoState, newPhotoState);
            }
            
            if (window.isRestoringState !== true) {
                customItems.forEach(el => {
                    // Skip standard template elements and canva panels
                    if (el.id === 'elBadge' || el.id === 'elPrice' || el.id === 'elDetails' || el.id === 'elLogo' || 
                        el.classList.contains('normal-el') || el.classList.contains('canva-generated') || el.classList.contains('canva-panel')) return;

                    const isWrap = el.classList.contains('callout-wrap') || el.classList.contains('co-neon-block') || el.classList.contains('svg-callout');
                    
                    el.style.maxWidth = 'none';
                    if (isWrap) {
                        el.style.whiteSpace = 'nowrap';
                    }
                    
                    void el.offsetHeight;
                    
                    if (isTemplateMode) {
                        if (tParams) {
                            const oldLeft = parseFloat(el.style.left || 0);
                            const oldTop = parseFloat(el.style.top || 0);
                            
                            if (isWrap) {
                                const W = parseFloat(el.style.width) || el.offsetWidth || 0;
                                const H = parseFloat(el.style.height) || el.offsetHeight || 0;
                                
                                const cx_old = oldLeft + W / 2;
                                const cy_old = oldTop + H / 2;
                                
                                const cx_new = cx_old * tParams.scale + tParams.dx;
                                const cy_new = cy_old * tParams.scale + tParams.dy;
                                
                                el.style.left = (cx_new - W / 2) + 'px';
                                el.style.top = (cy_new - H / 2) + 'px';
                                
                                const currentScale = parseFloat(el.dataset.scale) || 1;
                                const newScale = currentScale * tParams.scale;
                                el.dataset.scale = newScale;
                                const rot = el.dataset.rotation || 0;
                                el.style.transform = `rotate(${rot}deg) scale(${newScale})`;
                            } else {
                                el.style.left = (oldLeft * tParams.scale + tParams.dx) + 'px';
                                el.style.top = (oldTop * tParams.scale + tParams.dy) + 'px';
                                
                                if (el.style.width) el.style.width = (parseFloat(el.style.width) * tParams.scale) + 'px';
                                if (el.style.height) el.style.height = (parseFloat(el.style.height) * tParams.scale) + 'px';
                                if (el.style.fontSize) el.style.fontSize = (parseFloat(el.style.fontSize) * tParams.scale) + 'px';
                                if (el.style.padding) el.style.padding = (parseFloat(el.style.padding) * tParams.scale) + 'px';
                            }
                        }
                    } else {
                        const oldLeft = parseFloat(el.style.left || 0);
                        const oldTop = parseFloat(el.style.top || 0);
                        const W = parseFloat(el.style.width) || el.offsetWidth || 0;
                        const H = parseFloat(el.style.height) || el.offsetHeight || 0;
                        
                        if (isWrap) {
                            const cx_old = oldLeft + W / 2;
                            const cy_old = oldTop + H / 2;
                            
                            const percX = cx_old / oldW;
                            const percY = cy_old / oldH;
                            
                            const cx_new = percX * newW;
                            const cy_new = percY * newH;
                            
                            el.style.left = (cx_new - W / 2) + 'px';
                            el.style.top = (cy_new - H / 2) + 'px';
                        } else {
                            const percX = oldLeft / oldW;
                            const percY = oldTop / oldH;
                            
                            el.style.left = (percX * newW) + 'px';
                            el.style.top = (percY * newH) + 'px';
                        }
                        
                        if (!el.dataset.origCanvasW) {
                            el.dataset.origCanvasW = oldW;
                            el.dataset.origCanvasH = oldH;
                        }
                        const origW = parseFloat(el.dataset.origCanvasW) || 1920;
                        const origH = parseFloat(el.dataset.origCanvasH) || 1080;
                        
                        const oldFormatScale = Math.min(oldW / origW, oldH / origH);
                        const newFormatScale = Math.min(newW / origW, newH / origH);
                        const incrementalScale = oldFormatScale > 0 ? (newFormatScale / oldFormatScale) : 1;
                        
                        if (isWrap) {
                            let userScale = parseFloat(el.dataset.userScale);
                            if (isNaN(userScale) || userScale <= 0) {
                                userScale = 1;
                                el.dataset.userScale = 1;
                            }
                            const newScale = userScale * newFormatScale;
                            el.dataset.scale = newScale;
                            const rot = el.dataset.rotation || 0;
                            el.style.transform = `rotate(${rot}deg) scale(${newScale})`;
                        } else {
                            if (el.style.width) el.style.width = (parseFloat(el.style.width) * incrementalScale) + 'px';
                            if (el.style.height) el.style.height = (parseFloat(el.style.height) * incrementalScale) + 'px';
                            if (el.style.fontSize) el.style.fontSize = (parseFloat(el.style.fontSize) * incrementalScale) + 'px';
                            if (el.style.padding) el.style.padding = (parseFloat(el.style.padding) * incrementalScale) + 'px';
                        }
                    }
                });
            }
        } catch (err) {
            console.error("Format transform error:", err);
        }
    }

    resizeCanvas();
    redrawAll();
    if(window.SaberEngine && typeof window.SaberEngine.resize === 'function') window.SaberEngine.resize(format.w, format.h);

    // Standart rozet/fiyat/detay katmanlarÃ„Â± yalnÃ„Â±zca 1920x1080'de gÃƒÂ¶ster
    var isBase = (format.w===1920 && format.h===1080);
    var hasStandardTemplate = (typeof activeLayout !== 'undefined' && activeLayout !== '');
    var vis = (hasStandardTemplate && !(typeof isCanvaMode !== 'undefined' && isCanvaMode)) ? '' : 'hidden';
    if(typeof elBadge !== 'undefined' && elBadge) elBadge.style.visibility = vis;
    if(typeof elPrice !== 'undefined' && elPrice) elPrice.style.visibility = vis;
    if(typeof elDetails !== 'undefined' && elDetails) elDetails.style.visibility = vis;
    if(typeof elLogo !== 'undefined' && elLogo) elLogo.style.visibility = vis;
    var _iL = document.getElementById('infoLineText');
    if(_iL) _iL.style.visibility = vis;

    // Format değiştiğinde ölçek çözünürlüklerini dinamik güncelle
    updateExportScaleDisplay();

    // Yükleme ekranını kapat
    setTimeout(() => {
        hideAppLoading(80);
    }, 200);
}

function updateExportScaleDisplay() {
    const scaleSelect = document.getElementById('exportScale');
    if (!scaleSelect) return;

    const formatSelect = document.getElementById('exportFormat') || document.getElementById('previewFormat');
    const formatName = formatSelect ? formatSelect.value : '16:9 Full HD';
    const format = (typeof EXPORT_FORMATS !== 'undefined' && EXPORT_FORMATS[formatName]) 
        ? EXPORT_FORMATS[formatName] 
        : { w: 1920, h: 1080 };

    const baseW = format.w || 1920;
    const baseH = format.h || 1080;

    const scaleConfig = [
        { val: '0.5', scale: 0.5, label: '0.5x' },
        { val: '0.75', scale: 0.75, label: '0.75x' },
        { val: '1', scale: 1.0, label: '1x' },
        { val: '1.5', scale: 1.5, label: '1.5x' },
        { val: '2', scale: 2.0, label: '2x' }
    ];

    const currentVal = scaleSelect.value || '1';
    const isProUser = (typeof APP_MODE !== 'undefined' && APP_MODE === 'pro');

    scaleSelect.innerHTML = '';
    scaleConfig.forEach(item => {
        const targetW = Math.round(baseW * item.scale);
        const targetH = Math.round(baseH * item.scale);
        const opt = document.createElement('option');
        opt.value = item.val;
        
        const isLocked = (!isProUser && item.scale > 1.0);
        opt.textContent = `${item.label} — ${targetW} × ${targetH} px${isLocked ? ' 🔒 Pro' : ''}`;
        if (isLocked) {
            opt.disabled = true;
        }
        if (item.val === currentVal) {
            opt.selected = true;
        }
        scaleSelect.appendChild(opt);
    });

    if (!isProUser && parseFloat(scaleSelect.value) > 1.0) {
        scaleSelect.value = '1';
    }

    const existingBadge = document.getElementById('exportResolutionBadge');
    if (existingBadge) existingBadge.remove();
}

window.updateExportScaleDisplay = updateExportScaleDisplay;

function buildExportFormats(){
    const sel1=$('exportFormat'),sel2=$('previewFormat');
    if(!sel1||!sel2)return;
    sel1.innerHTML='';
    sel2.innerHTML='';
    Object.keys(EXPORT_FORMATS).forEach(name=>{
        const f=EXPORT_FORMATS[name];
        const label=f.icon+' '+name+' — '+f.w+'x'+f.h;
        const opt1=document.createElement('option');
        opt1.value=name;
        opt1.textContent=label;
        sel1.appendChild(opt1);
        const opt2=document.createElement('option');
        opt2.value=name;
        opt2.textContent=label;
        sel2.appendChild(opt2);
    });
    updateExportScaleDisplay();
}


function drawMasterPhotoManually(ctx, el, masterImg, outputScale, canvasRect, actualElement = null) {
    if(!actualElement) actualElement = el; // Fallback
    const rect = actualElement.getBoundingClientRect();
    const x = (rect.left - canvasRect.left) * outputScale;
    const y = (rect.top - canvasRect.top) * outputScale;
    const w = rect.width * outputScale;
    const h = rect.height * outputScale;

    // Parse border-radius
    const style = window.getComputedStyle(actualElement);
    let br = style.borderRadius;
    let radius = 0;
    if (br && br.indexOf('px') !== -1) {
        radius = parseFloat(br) * outputScale;
    }

    ctx.save();
    ctx.beginPath();
    if (radius > 0) {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
    } else {
        ctx.rect(x, y, w, h);
    }
    ctx.closePath();
    ctx.clip();

    let drawW, drawH, drawX, drawY;

    if (el.classList.contains('photo-inner-zoom')) {
        // Handle photo-zoom.js math
        const parent = actualElement;
        const s = parseFloat(parent.dataset.zpScale) || 1;
        const pX = parseFloat(parent.dataset.zpX) || 0;
        const pY = parseFloat(parent.dataset.zpY) || 0;
        
        let sX = 50, sY = 50;
        const xCtrl = document.getElementById('photoXCtrl');
        const yCtrl = document.getElementById('photoYCtrl');
        if (xCtrl) sX = parseFloat(xCtrl.value) || 50;
        if (yCtrl) sY = parseFloat(yCtrl.value) || 50;

        const natW = (parent && parent.dataset.naturalW) ? parseFloat(parent.dataset.naturalW) : (window.uploadedImgW || masterImg.naturalWidth || masterImg.width || 1920);
        const natH = (parent && parent.dataset.naturalH) ? parseFloat(parent.dataset.naturalH) : (window.uploadedImgH || masterImg.naturalHeight || masterImg.height || 1080);

        const imgRatio = natW / natH;
        const boxRatio = w / h;
        
        let coverW, coverH;
        if (imgRatio > boxRatio) {
            coverH = h;
            coverW = natW * (h / natH);
        } else {
            coverW = w;
            coverH = natH * (w / natW);
        }

        const offsetX_percent = (w - coverW) * (sX / 100);
        const offsetY_percent = (h - coverH) * (sY / 100);
        
        const unscaledX = x + offsetX_percent + (pX * outputScale);
        const unscaledY = y + offsetY_percent + (pY * outputScale);

        const cx = x + w/2;
        const cy = y + h/2;

        drawW = coverW * s;
        drawH = coverH * s;
        drawX = cx + (unscaledX - cx) * s;
        drawY = cy + (unscaledY - cy) * s;
        window.lastDrawDebug = { s, pX, pY, sX, sY, coverW, coverH, drawX, drawY, drawW, drawH, w, h, outputScale };

    } else {
        let bgSize = el.style.backgroundSize;
        let bgPos = el.style.backgroundPosition;
        
        if (bgSize && bgSize.indexOf('px') !== -1 && bgPos && bgPos.indexOf('px') !== -1 && bgSize.indexOf('cover') === -1) {
            // Pixel based positioning (user dragged or zoomed)
            const sizeParts = bgSize.split(' ');
            const posParts = bgPos.split(' ');
            
            const cssW = parseFloat(sizeParts[0]);
            const cssH = parseFloat(sizeParts[1] || sizeParts[0]);
            const cssX = parseFloat(posParts[0]);
            const cssY = parseFloat(posParts[1] || posParts[0]);
            
            drawW = cssW * outputScale;
            drawH = cssH * outputScale;
            drawX = x + (cssX * outputScale);
            drawY = y + (cssY * outputScale);
        } else {
            // Fallback to "cover" but respect background-position percentages
            let sX = 50, sY = 50;
            let bgPosStr = el.style.backgroundPosition || '';
            let m = bgPosStr.match(/([\d.]+)%\s+([\d.]+)%/);
            if (m) {
                sX = parseFloat(m[1]);
                sY = parseFloat(m[2]);
            }

            const natW = (el && el.dataset.naturalW) ? parseFloat(el.dataset.naturalW) : (window.uploadedImgW || masterImg.naturalWidth || masterImg.width || 1920);
            const natH = (el && el.dataset.naturalH) ? parseFloat(el.dataset.naturalH) : (window.uploadedImgH || masterImg.naturalHeight || masterImg.height || 1080);

            const imgRatio = natW / natH;
            const boxRatio = w / h;
            
            if (imgRatio > boxRatio) {
                drawH = h;
                drawW = natW * (h / natH);
                drawX = x + (w - drawW) * (sX / 100);
                drawY = y;
            } else {
                drawW = w;
                drawH = natH * (w / natW);
                drawX = x;
                drawY = y + (h - drawH) * (sY / 100);
            }
        }
    }
    
        ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    let imageToDraw = masterImg;
    let isWebGLProcessed = false;

    // WebGL Donanım Hızlandırmalı Lightroom Motoru (Tam Çözünürlüklü 4K/8K GPU Çıktısı)
    if (window.WebGLPhotoEngine && window.WebGLPhotoEngine.initialized && typeof window.getWebGLPhotoOptions === 'function' && masterImg.width > 0) {
        try {
            const photoOpts = window.getWebGLPhotoOptions();
            // Export dosyasında kırmızı kılavuz maskesini kapat
            photoOpts.showMaskOverlay = false;
            imageToDraw = window.WebGLPhotoEngine.getProcessedCanvas(masterImg, photoOpts);
            isWebGLProcessed = true;
        } catch(e) {
            console.error('WebGL export fotoğraf işleme hatası: ', e);
            imageToDraw = masterImg;
            isWebGLProcessed = false;
        }
    } else if (window.applyPixelAdjustmentsToImageData && masterImg.width > 0) {
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = masterImg.width;
        tmpCanvas.height = masterImg.height;
        const tCtx = tmpCanvas.getContext('2d', {willReadFrequently:true});
        tCtx.drawImage(masterImg, 0, 0);
        
        try {
            const imgData = tCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
            const newImgData = tCtx.createImageData(tmpCanvas.width, tmpCanvas.height);
            if (window.applyPixelAdjustmentsToImageData(imgData.data, newImgData.data, tmpCanvas.width, tmpCanvas.height)) {
                tCtx.putImageData(newImgData, 0, 0);
                imageToDraw = tmpCanvas;
            }
        } catch(e) {
            console.error('Error applying high-res pixel adjustments: ', e);
        }
    }

    if (!isWebGLProcessed) {
        let computedFilter = window.getComputedStyle(actualElement).filter;
        if (computedFilter && computedFilter !== 'none') {
            computedFilter = computedFilter.replace(/drop-shadow\([^)]+\)/g, '').trim();
            if (computedFilter.length > 0) {
                ctx.filter = computedFilter;
            } else {
                ctx.filter = 'none';
            }
        }
    } else {
        ctx.filter = 'none';
    }
    
    ctx.drawImage(imageToDraw, drawX, drawY, drawW, drawH);
    ctx.filter = 'none'; // reset
    ctx.restore();
}

// ==========================================
// FONT VE VARLIK DOĞRULAMA (FONT READY SYNC)
// ==========================================
async function ensureFontsLoaded() {
    try {
        if (document.fonts && typeof document.fonts.ready !== 'undefined') {
            await document.fonts.ready;
        }
        // Tuvaldeki tüm yazı tiplerinin belleğe ve DOM'a oturması için kısa bir layout döngüsü
        await new Promise(r => requestAnimationFrame(() => setTimeout(r, 60)));
    } catch (err) {
        console.warn('Font loading wait warning:', err);
    }
}

async function saveImage(){
    const fileType = document.getElementById('exportFileType') ? document.getElementById('exportFileType').value : 'jpg';
    if (fileType === 'mp4' || fileType === 'video') {
        return exportAnimatedVideo();
    }
    showExportLoading('Tasarım İndiriliyor...', 'Tasarımınız yüksek çözünürlüklü olarak indirmeye hazırlanıyor...');
    
    // 1. Yazı tiplerinin (Google Fonts) belleğe tam oturmasını ve render edilmesini bekle
    await ensureFontsLoaded();
    // Pro / Demo Yetki ve Kilit Kontrolü
    if (typeof window.validateExportAllowed === 'function') {
        const check = window.validateExportAllowed();
        if (!check.allowed) {
            hideExportLoading();
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'warning',
                    title: check.title || '🔒 Pro Özellik Kullanımı',
                    html: `<div style="font-size:14px; line-height:1.6; color:#cbd5e1; text-align:left; margin-top:8px;">${check.message}</div>`,
                    background: '#1e293b',
                    color: '#fff',
                    confirmButtonText: 'Tamam, Anladım',
                    confirmButtonColor: '#6366f1'
                });
            } else if (typeof showProUpgradeToast === 'function') {
                showProUpgradeToast(check.message);
            } else {
                alert('🔒 ' + check.message);
            }
            return;
        }
    }

    // Arayüzün yükleniyor kartını çizmesi için küçük bir nefes payı
    await new Promise(r => setTimeout(r, 60));

    try {
        console.log('SAVEIMAGE CALISTI');
        const debugSlots = document.querySelectorAll('[data-photo-slot]');
        console.log('--- EXPORT DEBUG ---');
        console.log('Bulunan [data-photo-slot] sayisi:', debugSlots.length);
        debugSlots.forEach((slot, i) => {
            console.log(`Slot ${i} inline background-image:`, slot.style.backgroundImage);
            console.log(`Slot ${i} computed background-image:`, window.getComputedStyle(slot).backgroundImage);
            const rc = slot.querySelector('.photo-render-canvas');
            console.log(`Slot ${i} renderCanvas var mi:`, !!rc);
        });
        console.log('--------------------');

        document.body.classList.add('is-exporting');
        
        // Şablon geçici gizlenmişse dışa aktarmada tam görünmesini sağla
        var _wasTplHidden = window.isTemplateHidden;
        if (_wasTplHidden && typeof window.toggleTemplateVisibility === 'function') {
            window.toggleTemplateVisibility(false);
        }

        if(typeof deselectAll === 'function') deselectAll();
        if(typeof _cerceveSecimKaldir === 'function') _cerceveSecimKaldir();
        if(typeof window._cerceveSecimKaldir === 'function') window._cerceveSecimKaldir();
        document.querySelectorAll('.el-selected').forEach(e=>e.classList.remove('el-selected'));
        document.querySelectorAll('.text-handle').forEach(h=>h.remove());
        document.querySelectorAll('.callout-controls, .callout-resizer, .callout-rotator, .callout-select-border, .callout-lock-btn, .cbtn-del, .draw-handle, .vertex-handle, .cerceve-handle, .kolaj-handle').forEach(c => c.style.display = 'none');
        const existingCtxMenu = document.getElementById('app-custom-context-menu');
        if (existingCtxMenu) existingCtxMenu.remove();
    
    // ZORUNLU PREPARE (SABLON VEYA LAYER ICIN)
    let needsPrep = false;
    document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => {
        if (!p.querySelector('.photo-render-canvas') && p.style.backgroundImage && p.style.backgroundImage !== 'none') {
            if (typeof _preparePhoto === 'function') {
                _preparePhoto(p);
                needsPrep = true;
            }
        }
    });
        document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => {
        if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p);
    });

    if (needsPrep) {
        // _applyPhotoTransform async calistigi icin image yuklenmesini biraz bekliyoruz.
        await new Promise(r => setTimeout(r, 150));
    }

    const wz=drawCanvas.style.zIndex,wp=drawCanvas.style.pointerEvents;
    drawCanvas.style.zIndex='7';
    drawCanvas.style.pointerEvents='none';
    
    const formatName=exportFormat?exportFormat.value:'16:9 Full HD';
    const format=EXPORT_FORMATS[formatName]||{w:1920,h:1080};
    const fitMode=exportFitMode?exportFitMode.value:'cover';
    const bgColor=exportBgColor?exportBgColor.value:'#ffffff';
    let outputScale = 1.5;
    const scaleVal1 = exportScale?exportScale.value:'1.5';

    let safeMasterImage = (typeof uploadedImgUrl !== 'undefined' ? uploadedImgUrl : null) || (typeof masterImageBase64 !== 'undefined' ? masterImageBase64 : null);
    if (!safeMasterImage) {
        const pLayer = document.getElementById('photo-layer');
        if (pLayer && pLayer.style.backgroundImage && pLayer.style.backgroundImage !== 'none') {
            safeMasterImage = pLayer.style.backgroundImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
        } else {
            const innerZoom = document.querySelector('.photo-inner-zoom');
            if (innerZoom && innerZoom.style.backgroundImage && innerZoom.style.backgroundImage !== 'none') {
                safeMasterImage = innerZoom.style.backgroundImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
            }
        }
    }

    let masterImgObj = null;
    if (safeMasterImage) {
        masterImgObj = new Image();
        if (!safeMasterImage.startsWith('data:') && !safeMasterImage.startsWith('blob:')) { masterImgObj.crossOrigin = 'anonymous'; }
        await new Promise(r => { masterImgObj.onload = r; masterImgObj.onerror = r; masterImgObj.src = safeMasterImage; });
    }

    if (scaleVal1 === 'original' && safeMasterImage) {
        outputScale = 1; 
    } else {
        outputScale = parseFloat(scaleVal1) || 1.5;
    }
    const currentW=parseInt(canvasEl.style.width)||1920;
    const currentH=parseInt(canvasEl.style.height)||1080;
    
    if (scaleVal1 === 'original' && masterImgObj && masterImgObj.width > 0) {
        outputScale = Math.min(masterImgObj.width / currentW, masterImgObj.height / currentH);
    }
    
    if (typeof window.isMobileDevice === 'function' && window.isMobileDevice()) {
        const maxMobileScale = 2.5;
        if (outputScale > maxMobileScale) {
            console.warn('Mobile memory lock active: Reduced export scale from ' + outputScale + ' to ' + maxMobileScale);
            outputScale = maxMobileScale;
        }
    }

    const targetW = Math.round(format.w * outputScale);
    const targetH = Math.round(format.h * outputScale);
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetW;
    finalCanvas.height = targetH;
    const ctx = finalCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Sablonlu Mod kontrolu (Canva, Kolaj veya Klasik Şablonlar)
    const cvrBase = document.querySelector('.cvr-base');
    const hasKolaj = !!document.getElementById('kolaj-wrapper');
    const isTemplateMode = !!cvrBase || !!document.querySelector('.photo-panel') || hasKolaj;

    if (isTemplateMode) {
        // ==========================================
        // SABLONLU MOD
        // ==========================================
        
        // ==========================================
        // SABLONLU MOD - 3 KATMANLI (SANDWICH) RENDER
        // ==========================================
        
        canvasEl.style.transition='none';
        canvasEl.style.transform='none';
        
        const overlay = document.createElement('div');
        overlay.id = 'download-overlay-mask';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'transparent';
        overlay.style.zIndex = '9999990';
        overlay.style.pointerEvents = 'none';
        document.body.appendChild(overlay);

        const oldPosition = canvasEl.style.position;
        const oldLeft = canvasEl.style.left;
        const oldTop = canvasEl.style.top;
        const oldMargin = canvasEl.style.margin;
        const oldZIndex = canvasEl.style.zIndex;

        canvasEl.style.position = 'fixed';
        canvasEl.style.left = '0px';
        canvasEl.style.top = '0px';
        canvasEl.style.margin = '0px';
        canvasEl.style.zIndex = '9999998';

        try {
            // 1. Çizimlerin kaymasını ve bulanık çıkmasını önlemek için PixiJS motorunu Yüksek Çözünürlüğe hazırla
            if (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') {
                const saberApp = window.SaberEngine.getApp();
                if (saberApp && saberApp.view && saberApp.renderer && saberApp.stage) {
                    saberApp.renderer.resize(targetW, targetH);
                    saberApp.stage.scale.set(outputScale);
                    saberApp.renderer.render(saberApp.stage);
                    // html2canvas'ın doğru yakalaması için CSS boyutlarını ana ekranla aynı tutuyoruz (iç çözünürlük 4K kalıyor)
                    saberApp.view.style.width = currentW + 'px';
                    saberApp.view.style.height = currentH + 'px';
                }
            }

            // 2. --- SINGLE PASS RENDER V2 ---
            // ÇİFT FİLTRE (DOUBLE-FILTER) ÖNLEMİ:
            // Sadece export işlemi sırasında filtrenin fiziksel canvasa çizilmesi için bayrak:
            window.isExportingNow = true;
            window.exportingScale = outputScale;

            // Sistem '.photo-render-canvas' içine zaten donanım seviyesinde filtreleri bastığı için,
            // HTML2Canvas'ın '.photo-panel' üzerindeki CSS filtrelerini tekrar uygulamasını engelliyoruz.
            const filterPanels = document.querySelectorAll('.photo-panel, #photo-layer');
            const savedFilters = new Map();
            filterPanels.forEach(p => {
                savedFilters.set(p, p.style.filter);
                if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p); // Filtreyi fiziksel canvasa bas (okuyabilmesi için ÖNCE çalışmalı)
                p.style.filter = 'none'; // HTML2Canvas çift göstermesin diye SONRA sıfırla
            });

            let reqScaleX = targetW / currentW;
            let reqScaleY = targetH / currentH;
            let supersamplingScale = Math.max(outputScale, (window.devicePixelRatio || 3), reqScaleX, reqScaleY);
            const MAX_DIM = 5000;
            if (currentW * supersamplingScale > MAX_DIM) supersamplingScale = MAX_DIM / currentW;
            if (currentH * supersamplingScale > MAX_DIM) supersamplingScale = MAX_DIM / currentH;
            if ((currentW * currentH * supersamplingScale * supersamplingScale) > 16000000) supersamplingScale = Math.sqrt(16000000 / (currentW * currentH));
            supersamplingScale = Math.floor(supersamplingScale * 10) / 10;
            const finalHtml2Canvas = await html2canvas(canvasEl, {
                width: currentW,
                height: currentH,
                scale: supersamplingScale,
                useCORS: true,
                allowTaint: false,
                imageTimeout: 0,
                
                logging: false,
                backgroundColor: bgColor && bgColor !== 'transparent' ? bgColor : null,
                ignoreElements: (el) => isExportIgnoredElement(el),
                onclone: (clonedDoc) => sanitizeExportClone(clonedDoc)
            });
            ctx.drawImage(finalHtml2Canvas, 0, 0, targetW, targetH);

            // Çizimleri ve dolguları export canvasına bas
            if (typeof window.redrawAllToContext === 'function') {
                const hasSaberActive = !!(window.SaberEngine && typeof window.SaberEngine.getApp === 'function');
                window.redrawAllToContext(ctx, outputScale, { skipNeonStrokes: hasSaberActive });
            }

            // 3. PixiJS Saber Neon ekle ve motoru eski haline geri getir
            if (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') {
                const saberApp = window.SaberEngine.getApp();
                if (saberApp && saberApp.view) {
                    ctx.drawImage(saberApp.view, 0, 0, targetW, targetH);
                    if (saberApp.renderer && saberApp.stage) {
                        saberApp.renderer.resize(currentW, currentH);
                        saberApp.stage.scale.set(1);
                        saberApp.renderer.render(saberApp.stage);
                        saberApp.view.style.width = '100%';
                        saberApp.view.style.height = '100%';
                    }
                }
            }
            
            // Filtreleri eski haline döndür
            window.isExportingNow = false;
            window.exportingScale = null;
            filterPanels.forEach(p => {
                p.style.filter = savedFilters.get(p) || '';
                if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p); // Tekrar preview çözünürlüğünde ve filtresiz fiziksel canvas olarak geri yükle
            });

        } catch (e) {
            console.error("Single Pass V2 Render Error:", e);
        }
        
        window.isExportingNow = false;

        canvasEl.style.position = oldPosition;
        canvasEl.style.left = oldLeft;
        canvasEl.style.top = oldTop;
        canvasEl.style.margin = oldMargin;
        canvasEl.style.zIndex = oldZIndex;
        document.body.removeChild(overlay);
        if (typeof resizeCanvas === 'function') resizeCanvas();

        // --- UI RESTORE ---
        document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => { if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p); });
        
    } else {
        // ==========================================
        // SABLONSUZ MOD
        // ==========================================
        
        // Fill the background color of the canvas first (so it's exported)
        let customBg = window.getComputedStyle(canvasEl).backgroundColor;
        if (customBg && customBg !== 'rgba(0, 0, 0, 0)' && customBg !== 'transparent') {
            ctx.fillStyle = customBg;
            ctx.fillRect(0, 0, targetW, targetH);
        }
        
        // 1. Fallback fotograf ciz
        if (masterImgObj && masterImgObj.width > 0) {
            const panel = document.getElementById('photo-layer');
            if (panel) {
            const w = targetW;
            const h = targetH;
            
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, w, h);
            ctx.clip();
            const style = window.getComputedStyle(panel);
            let filter = style.filter;
            if (filter && filter !== 'none') {
                filter = filter.replace(/drop-shadow\([^)]+\)/g, '').trim();
                if (filter !== '') ctx.filter = filter;
            }
            
            const renderCanvas = panel.querySelector('.photo-render-canvas');
            if (renderCanvas && renderCanvas.width > 0) {
                ctx.drawImage(renderCanvas, 0, 0, w, h);
            } else {
                const natW = (panel && panel.dataset.naturalW) ? parseFloat(panel.dataset.naturalW) : (window.uploadedImgW || masterImgObj.naturalWidth || masterImgObj.width || 1920);
                const natH = (panel && panel.dataset.naturalH) ? parseFloat(panel.dataset.naturalH) : (window.uploadedImgH || masterImgObj.naturalHeight || masterImgObj.height || 1080);
                if (fitMode === 'contain') {
                    const ratio = Math.min(w / natW, h / natH);
                    const dw = natW * ratio;
                    const dh = natH * ratio;
                    const dx = (w - dw) / 2;
                    const dy = (h - dh) / 2;
                    ctx.drawImage(masterImgObj, dx, dy, dw, dh);
                } else {
                    const imgRatio = natW / natH;
                    const panelRatio = w / h;
                    let dw = w;
                    let dh = h;
                    let dx = 0;
                    let dy = 0;
                    if (imgRatio > panelRatio) {
                        dw = h * imgRatio;
                        dx = (w - dw) / 2;
                    } else {
                        dh = w / imgRatio;
                        dy = (h - dh) / 2;
                    }
                    ctx.drawImage(masterImgObj, dx, dy, dw, dh);
                }
            }
            ctx.filter = 'none';
            ctx.restore();
        }
        } // Close the masterImgObj condition

        // Çizimleri ve dolguları export canvasına bas (html2canvas öncesi z-index uyumu)
        if (typeof window.redrawAllToContext === 'function') {
            const hasSaberActive = !!(window.SaberEngine && typeof window.SaberEngine.getApp === 'function');
            window.redrawAllToContext(ctx, outputScale, { skipNeonStrokes: hasSaberActive });
        }

        // 2. ui-layer custom items render using html2canvas
        const overlay = document.createElement('div');
        overlay.id = 'download-overlay-mask';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'transparent';
        overlay.style.zIndex = '9999990';
        overlay.style.pointerEvents = 'none';
        document.body.appendChild(overlay);

        const oldPosition = canvasEl.style.position;
        const oldLeft = canvasEl.style.left;
        const oldTop = canvasEl.style.top;
        const oldMargin = canvasEl.style.margin;
        const oldZIndex = canvasEl.style.zIndex;
        const oldBg = canvasEl.style.backgroundColor;
        const oldTransform = canvasEl.style.transform;
        const oldTransition = canvasEl.style.transition;

        canvasEl.style.position = 'fixed';
        canvasEl.style.left = '0px';
        canvasEl.style.top = '0px';
        canvasEl.style.margin = '0px';
        canvasEl.style.zIndex = '9999998';
        canvasEl.style.setProperty('background-color', 'transparent', 'important');
        canvasEl.style.transform = 'none';
        canvasEl.style.transition = 'none';

        try {
            let reqScaleX = targetW / currentW;
            let reqScaleY = targetH / currentH;
            let supersamplingScale = Math.max(outputScale, (window.devicePixelRatio || 3), reqScaleX, reqScaleY);
            const MAX_DIM = 5000;
            if (currentW * supersamplingScale > MAX_DIM) supersamplingScale = MAX_DIM / currentW;
            if (currentH * supersamplingScale > MAX_DIM) supersamplingScale = MAX_DIM / currentH;
            if ((currentW * currentH * supersamplingScale * supersamplingScale) > 16000000) supersamplingScale = Math.sqrt(16000000 / (currentW * currentH));
            supersamplingScale = Math.floor(supersamplingScale * 10) / 10;
            const finalHtml2Canvas = await html2canvas(canvasEl, {
                width: currentW,
                height: currentH,
                scale: supersamplingScale,
                useCORS: true,
                allowTaint: false,
                imageTimeout: 0,
                
                logging: false,
                backgroundColor: null,
                ignoreElements: (el) => isExportIgnoredElement(el),
                onclone: (clonedDoc) => sanitizeExportClone(clonedDoc)
            });
            ctx.drawImage(finalHtml2Canvas, 0, 0, targetW, targetH);
        } catch (e) {
            console.error("Non-template HTML2Canvas Error:", e);
        }

        canvasEl.style.position = oldPosition;
        canvasEl.style.left = oldLeft;
        canvasEl.style.top = oldTop;
        canvasEl.style.margin = oldMargin;
        canvasEl.style.zIndex = oldZIndex;
        if(oldBg) { canvasEl.style.setProperty('background-color', oldBg, 'important'); } else { canvasEl.style.removeProperty('background-color'); }
        canvasEl.style.transform = oldTransform;
        canvasEl.style.transition = oldTransition;
        document.body.removeChild(overlay);
        resizeCanvas();

        
        // --- UI RESTORE ---
        document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => { if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p); });

        
        // 3. PixiJS ekle
        if (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') {
            const saberApp = window.SaberEngine.getApp();
            if (saberApp && saberApp.view) {
                if (saberApp.renderer && saberApp.stage) {
                    saberApp.renderer.resize(targetW, targetH);
                    saberApp.stage.scale.set(outputScale);
                    saberApp.renderer.render(saberApp.stage);
                    ctx.drawImage(saberApp.view, 0, 0, targetW, targetH);
                    saberApp.renderer.resize(currentW, currentH);
                    saberApp.stage.scale.set(1);
                    saberApp.renderer.render(saberApp.stage);
                    saberApp.view.style.width = '100%';
                    saberApp.view.style.height = '100%';
                } else {
                    ctx.drawImage(saberApp.view, 0, 0, targetW, targetH);
                }
            }
        }
    }

        drawCanvas.style.zIndex=wz;
        drawCanvas.style.pointerEvents=wp;

        // DEMO FILIGRAN / WATERMARK
        if (typeof window.addWatermark === 'function') {
            await window.addWatermark(finalCanvas);
        }

        // INDIRME
        const a = document.createElement('a');
        const fmtSafe = formatName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const fileType = document.getElementById('exportFileType') ? document.getElementById('exportFileType').value : 'jpg';
        if (fileType === 'jpg') {
            a.download = 'emlak-studiom-' + fmtSafe + '-' + targetW + 'x' + targetH + '.jpg';
            a.href = finalCanvas.toDataURL('image/jpeg', 1.0);
        } else {
            a.download = 'emlak-studiom-' + fmtSafe + '-' + targetW + 'x' + targetH + '.png';
            a.href = finalCanvas.toDataURL('image/png', 1.0);
        }
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch(err) {
        console.error("SaveImage Error:", err);
        alert("Dışa aktarma sırasında bir hata oluştu: " + (err.message || err));
    } finally {
        if (typeof _wasTplHidden !== 'undefined' && _wasTplHidden && typeof window.toggleTemplateVisibility === 'function') {
            window.toggleTemplateVisibility(true);
        }
        if (typeof resizeCanvas === 'function') resizeCanvas();
        window.isExportingNow = false;
        document.body.classList.remove('is-exporting');
        // Tuvalin yerine tam oturup ekranın boyanması için yükleme ekranını tuval hazır olunca kapatıyoruz
        setTimeout(() => {
            hideAppLoading(0, true);
        }, 350);
    }
}

// ══════════════════════════════════════════════
// 🎬 YÜZEN MİNİ VİDEO BİLDİRİMİ / ARKA PLAN WİDGETI
// ══════════════════════════════════════════════
let _videoToastTimeout = null;
let _videoToastBlobUrl = null; // Bellek sızıntısını önlemek için blob URL referansı


function createOrGetVideoToast() {
    let toast = document.getElementById('emlak-video-export-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'emlak-video-export-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999999;
            background: rgba(15, 23, 42, 0.96);
            border: 1px solid rgba(99, 102, 241, 0.4);
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(99, 102, 241, 0.25);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-radius: 12px;
            padding: 14px 18px;
            display: flex;
            align-items: center;
            gap: 14px;
            min-width: 320px;
            max-width: 420px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #ffffff;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: auto;
        `;
        document.body.appendChild(toast);
    }
    return toast;
}

function updateVideoToastProgress(pct, remainingSec) {
    const toast = createOrGetVideoToast();
    toast.style.borderColor = 'rgba(99, 102, 241, 0.4)';
    toast.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(99, 102, 241, 0.25)';
    toast.innerHTML = `
        <div style="width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #ec4899); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 12px rgba(245, 158, 11, 0.5);">
            <i class="fa-solid fa-video" style="color: #fff; font-size: 16px;"></i>
        </div>
        <div style="flex: 1; min-width: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 13px; font-weight: 700; color: #f1f5f9;">Canlı Video Kaydediliyor</span>
                <span style="font-size: 12px; font-weight: 800; color: #f59e0b;">%${pct}</span>
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                Arka planda işleniyor, çalışmaya devam edebilirsiniz
            </div>
            <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.12); border-radius: 99px; overflow: hidden;">
                <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, #f59e0b, #ec4899, #6366f1); border-radius: 99px; transition: width 0.08s linear;"></div>
            </div>
        </div>
        <button type="button" onclick="closeVideoToast()" style="background: none; border: none; color: #64748b; font-size: 18px; cursor: pointer; padding: 0 4px; line-height: 1;" title="Kapat">&times;</button>
    `;
    toast.style.display = 'flex';
}

function finishVideoToastSuccess(filename, sizeMb, url) {
    _videoToastBlobUrl = url;
    const toast = createOrGetVideoToast();
    toast.style.borderColor = 'rgba(16, 185, 129, 0.6)';
    toast.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(16, 185, 129, 0.35)';
    toast.innerHTML = `
        <div style="width: 38px; height: 38px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 14px rgba(16, 185, 129, 0.5);">
            <i class="fa-solid fa-check" style="color: #fff; font-size: 18px;"></i>
        </div>
        <div style="flex: 1; min-width: 0;">
            <div style="font-size: 13px; font-weight: 700; color: #10b981; margin-bottom: 2px;">
                Video Hazır! (${sizeMb} MB)
            </div>
            <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${filename}">
                ${filename}
            </div>
            <a href="${url}" download="${filename}" id="toastDirectDownloadBtn" style="display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 6px; text-decoration: none; box-shadow: 0 2px 10px rgba(16, 185, 129, 0.4);">
                <i class="fa-solid fa-download"></i> Hemen İndir
            </a>
        </div>
        <button type="button" onclick="closeVideoToast()" style="background: none; border: none; color: #64748b; font-size: 18px; cursor: pointer; padding: 0 4px; line-height: 1;" title="Kapat">&times;</button>
    `;

    if (_videoToastTimeout) clearTimeout(_videoToastTimeout);
    _videoToastTimeout = setTimeout(closeVideoToast, 8000);
}

function finishVideoToastError(message) {
    const toast = createOrGetVideoToast();
    toast.style.borderColor = 'rgba(239, 68, 68, 0.6)';
    toast.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(239, 68, 68, 0.3)';
    toast.innerHTML = `
        <div style="width: 38px; height: 38px; border-radius: 50%; background: #ef4444; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i class="fa-solid fa-triangle-exclamation" style="color: #fff; font-size: 18px;"></i>
        </div>
        <div style="flex: 1; min-width: 0;">
            <div style="font-size: 13px; font-weight: 700; color: #ef4444; margin-bottom: 2px;">Video Kaydedilemedi</div>
            <div style="font-size: 11px; color: #cbd5e1;">${message}</div>
        </div>
        <button type="button" onclick="closeVideoToast()" style="background: none; border: none; color: #64748b; font-size: 18px; cursor: pointer; padding: 0 4px; line-height: 1;">&times;</button>
    `;
    if (_videoToastTimeout) clearTimeout(_videoToastTimeout);
    _videoToastTimeout = setTimeout(closeVideoToast, 6000);
}

function closeVideoToast() {
    const toast = document.getElementById('emlak-video-export-toast');
    if (toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        setTimeout(() => { 
            if (toast.parentNode) toast.parentNode.removeChild(toast); 
            if (_videoToastBlobUrl) {
                URL.revokeObjectURL(_videoToastBlobUrl);
                _videoToastBlobUrl = null;
            }
        }, 250);
    }
}
window.closeVideoToast = closeVideoToast;

function getBestSupportedVideoMime() {
    // Canvas kaydı için saf video codec'leri (mp4a ses codec'i ASLA eklenmez)
    const candidates = [
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm'
    ];
    const testCanvas = document.createElement('canvas');
    testCanvas.width = 16; testCanvas.height = 16;
    const testStream = testCanvas.captureStream ? testCanvas.captureStream(10) : null;
    if (testStream && typeof MediaRecorder !== 'undefined') {
        for (const type of candidates) {
            try {
                if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
                    const testRec = new MediaRecorder(testStream, { mimeType: type });
                    if (testRec && testRec.state === 'inactive') {
                        return type;
                    }
                }
            } catch(e) {}
        }
    }
    return 'video/webm';
}

// ══════════════════════════════════════════════
// 🎬 CANLI ANİMASYONLU VİDEO KAYIT MOTORU (ARKA PLANDA ÇALIŞIR)
// ══════════════════════════════════════════════
async function exportAnimatedVideo(options = {}) {
    // 1. Zaten arka planda kayıt varsa uyar
    if (window.isExportingVideo) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'info',
                title: 'Video Zaten Hazırlanıyor',
                text: 'Şu anda arka planda bir video kaydediliyor. Lütfen bitmesini bekleyin.',
                background: '#1e293b',
                color: '#fff',
                confirmButtonColor: '#6366f1'
            });
        }
        return;
    }

    // 2. Pro / Demo Yetki ve Kilit Kontrolü
    if (typeof window.validateExportAllowed === 'function') {
        const check = window.validateExportAllowed();
        if (!check.allowed) {
            hideExportLoading();
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'warning',
                    title: check.title || '🔒 Pro Özellik Kullanımı',
                    html: `<div style="font-size:14px; line-height:1.6; color:#cbd5e1; text-align:left; margin-top:8px;">${check.message}</div>`,
                    background: '#1e293b',
                    color: '#fff',
                    confirmButtonText: 'Tamam, Anladım',
                    confirmButtonColor: '#6366f1'
                });
            } else if (typeof showProUpgradeToast === 'function') {
                showProUpgradeToast(check.message);
            } else {
                alert('🔒 ' + check.message);
            }
            return;
        }
    }

    // 3. Tarayıcı Video Desteği Kontrolü
    if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Tarayıcı Desteği Gerekli',
                text: 'Tarayıcınız video kaydetme özelliğini (MediaRecorder) desteklemiyor. Lütfen güncel Chrome, Edge veya Safari kullanın.',
                background: '#1e293b',
                color: '#fff'
            });
        } else {
            alert('Tarayıcınız video kaydetmeyi desteklemiyor. Lütfen güncel bir tarayıcı kullanın.');
        }
        return;
    }

    const chosenMime = getBestSupportedVideoMime();
    const durationSeconds = (options && options.duration) ? options.duration : 3;
    const durationMs = durationSeconds * 1000;

    // 🚀 Video dışa aktarma bayrağını en baştan aktifleştir (Saber motorunu uyarır ve clonelama temizliğini tetikler)
    window.isExportingVideo = true;

    // 🚀 Tam ekran engelleyici loader'ı kesinlikle açma, açıksa derhal kapat
    hideAppLoading(0, true);

    // Sağ altta yüzen mini bildirim kartını başlat
    updateVideoToastProgress(5, durationSeconds.toFixed(1));

    await ensureFontsLoaded();
    await new Promise(r => setTimeout(r, 40));

    // Deselect UI
    if (typeof deselectAll === 'function') deselectAll();
    if (typeof _cerceveSecimKaldir === 'function') _cerceveSecimKaldir();
    if (typeof window._cerceveSecimKaldir === 'function') window._cerceveSecimKaldir();
    document.querySelectorAll('.el-selected').forEach(e => e.classList.remove('el-selected'));
    document.querySelectorAll('.text-handle').forEach(h => h.remove());
    document.querySelectorAll('.callout-controls, .callout-resizer, .callout-rotator, .callout-select-border, .callout-lock-btn, .cbtn-del, .draw-handle, .vertex-handle, .cerceve-handle, .kolaj-handle').forEach(c => c.style.display = 'none');
    const existingCtxMenu = document.getElementById('app-custom-context-menu');
    if (existingCtxMenu) existingCtxMenu.remove();

    // Prepare photos (varsa)
    document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => {
        if (!p.querySelector('.photo-render-canvas') && p.style.backgroundImage && p.style.backgroundImage !== 'none') {
            if (typeof _preparePhoto === 'function') _preparePhoto(p);
        }
        if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p);
    });

    // Calculate dimensions
    const formatName = exportFormat ? exportFormat.value : '16:9 Full HD';
    const format = (typeof EXPORT_FORMATS !== 'undefined' && EXPORT_FORMATS[formatName]) || { w: 1920, h: 1080 };
    const currentW = parseInt(canvasEl.style.width) || 1920;
    const currentH = parseInt(canvasEl.style.height) || 1080;

    let targetW = Math.round(format.w);
    let targetH = Math.round(format.h);

    // Video donanım hızlandırma ve yüksek kalite standardı için maksimum 4K UHD (3840x2160) sınırla
    const MAX_VID_W = 3840;
    const MAX_VID_H = 2160;
    if (targetW > MAX_VID_W || targetH > MAX_VID_H) {
        const fitRatio = Math.min(MAX_VID_W / targetW, MAX_VID_H / targetH);
        targetW = Math.round(targetW * fitRatio);
        targetH = Math.round(targetH * fitRatio);
    }
    // Video codec'leri (H.264 / VP8 / VP9) için kesinlikle çift sayı (even) olmalıdır
    if (targetW % 2 !== 0) targetW += 1;
    if (targetH % 2 !== 0) targetH += 1;

    const saberApp = (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') ? window.SaberEngine.getApp() : null;
    const saberView = saberApp ? saberApp.view : document.getElementById('saber-layer');
    if (saberView) saberView.style.visibility = 'hidden';

    // ══════════════════════════════════════════════════
    // STATİK TABAN CANVAS'INI HIZLI VE KESİNTİSİZ OLUŞTUR
    // ══════════════════════════════════════════════════
    const baseCanvas = document.createElement('canvas');
    baseCanvas.width = targetW;
    baseCanvas.height = targetH;
    const baseCtx = baseCanvas.getContext('2d');
    baseCtx.imageSmoothingEnabled = true;
    baseCtx.imageSmoothingQuality = 'high';

    // 1. Arka plan rengi
    let customBg = window.getComputedStyle(canvasEl).backgroundColor;
    if (customBg && customBg !== 'rgba(0, 0, 0, 0)' && customBg !== 'transparent') {
        baseCtx.fillStyle = customBg;
        baseCtx.fillRect(0, 0, targetW, targetH);
    } else {
        baseCtx.fillStyle = '#1e293b';
        baseCtx.fillRect(0, 0, targetW, targetH);
    }

    // 2. Fotoğraf katmanını doğrudan fiziksel canvas'tan bas (Milisaniyeler sürer, asla asılı kalmaz)
    const renderCanvas = document.querySelector('.photo-render-canvas');
    if (renderCanvas && renderCanvas.width > 0) {
        try {
            baseCtx.drawImage(renderCanvas, 0, 0, targetW, targetH);
        } catch(e) {}
    } else {
        // Fallback fotoğraf URL'si varsa zaman aşımlı yükle (maksimum 1.5 sn)
        let safeMasterImage = (typeof uploadedImgUrl !== 'undefined' ? uploadedImgUrl : null) || (typeof masterImageBase64 !== 'undefined' ? masterImageBase64 : null);
        if (safeMasterImage) {
            await new Promise(resolve => {
                const img = new Image();
                if (!safeMasterImage.startsWith('data:') && !safeMasterImage.startsWith('blob:')) img.crossOrigin = 'anonymous';
                const timer = setTimeout(resolve, 1500);
                img.onload = () => { clearTimeout(timer); try { baseCtx.drawImage(img, 0, 0, targetW, targetH); } catch(e){} resolve(); };
                img.onerror = () => { clearTimeout(timer); resolve(); };
                img.src = safeMasterImage;
            });
        }
    }

    // 3. Çizim katmanını (draw-layer) doğrudan bas
    const drawCanvas = document.getElementById('draw-layer') || document.getElementById('drawCanvas');
    if (drawCanvas && drawCanvas.width > 0) {
        try {
            baseCtx.drawImage(drawCanvas, 0, 0, targetW, targetH);
        } catch(e) {}
    }

    // Çizimleri ve dolguları video temel tuvaline bas
    if (typeof window.redrawAllToContext === 'function') {
        const hasSaberActive = !!(window.SaberEngine && typeof window.SaberEngine.getApp === 'function');
        window.redrawAllToContext(baseCtx, outputScale, { skipNeonStrokes: hasSaberActive });
    }

    // 4. Şablon, metinler ve rozetler (Sadece varsa html2canvas çalıştır)
    const hasTemplates = !!canvasEl.querySelector('#canva-render-layer > *');
    const hasBadges = Array.from(canvasEl.querySelectorAll('#ui-layer .canvas-el')).some(el => {
        return el.style.display !== 'none' && el.style.visibility !== 'hidden' && el.style.opacity !== '0';
    });
    const hasCallouts = Array.from(canvasEl.querySelectorAll('.callout-wrap, .co-neon-block, .svg-callout')).some(el => {
        return el.style.display !== 'none' && el.style.visibility !== 'hidden';
    });
    const hasLogo = (() => {
        const l = canvasEl.querySelector('#elLogo');
        return !!(l && l.style.display !== 'none' && l.style.visibility !== 'hidden');
    })();
    const needsHtml2Canvas = hasTemplates || hasBadges || hasCallouts || hasLogo;

    if (needsHtml2Canvas) {
        try {
            const savedBg = canvasEl.style.backgroundColor;
            canvasEl.style.setProperty('background-color', 'transparent', 'important');

            const h2cPromise = html2canvas(canvasEl, {
                width: currentW,
                height: currentH,
                scale: 1,
                useCORS: true,
                allowTaint: false,
                imageTimeout: 1500,
                logging: false,
                backgroundColor: null,
                ignoreElements: (el) => isExportIgnoredElement(el),
                onclone: (clonedDoc) => sanitizeExportClone(clonedDoc)
            });
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('html2canvas-timeout')), 2000));
            const capturedCanvas = await Promise.race([h2cPromise, timeoutPromise]);

            if (savedBg) {
                canvasEl.style.setProperty('background-color', savedBg, 'important');
            } else {
                canvasEl.style.removeProperty('background-color');
            }

            if (capturedCanvas) {
                baseCtx.drawImage(capturedCanvas, 0, 0, targetW, targetH);
            }
        } catch(h2cErr) {
            console.warn("Hızlı sahne yakalama fallback:", h2cErr.message || h2cErr);
        }
    }

    // 5. Filigran / Watermark ekle
    if (typeof window.addWatermark === 'function') {
        try { await window.addWatermark(baseCanvas); } catch(e) {}
    }

    // Neon katmanını yeniden görünür yap (Tuval anında eski haline döner)
    if (saberView) saberView.style.visibility = 'visible';

    // ══════════════════════════════════════════════════
    // 4. ARKA PLANDA VİDEO KAYIT DÖNGÜSÜ BAŞLATILIYOR
    // ══════════════════════════════════════════════════
    // Yüzen progress widget'ını göster
    updateVideoToastProgress(0, durationSeconds.toFixed(1));

    // Animasyon ticker'ı açık tut
    const wasTickerStarted = saberApp && saberApp.ticker && saberApp.ticker.started;
    if (saberApp && saberApp.ticker && !saberApp.ticker.started) {
        saberApp.ticker.start();
    }

    // 5. KAYIT CANVAS'I VE MEDIARECORDER KURULUMU
    const recCanvas = document.createElement('canvas');
    recCanvas.width = targetW;
    recCanvas.height = targetH;
    const recCtx = recCanvas.getContext('2d', { alpha: false });
    recCtx.imageSmoothingEnabled = true;
    recCtx.imageSmoothingQuality = 'high';

    // İlk kareyi hemen çiz (CaptureStream'in canlı video track başlatması için)
    recCtx.drawImage(baseCanvas, 0, 0, targetW, targetH);
    if (saberApp && saberApp.view && saberApp.stage) {
        try {
            saberApp.renderer.render(saberApp.stage);
            recCtx.drawImage(saberApp.view, 0, 0, targetW, targetH);
        } catch(e) {}
    }

    // Yüksek Kalite / Bitrate Hesaplama:
    // 1080p: ~15 Mbps, 2K: ~24 Mbps, 4K UHD: ~35-40 Mbps
    const totalPixels = targetW * targetH;
    const videoBitrate = Math.round(Math.min(40000000, Math.max(14000000, totalPixels * 4.5)));

    const stream = recCanvas.captureStream(30);
    let recorder;
    try {
        recorder = new MediaRecorder(stream, {
            mimeType: chosenMime,
            videoBitsPerSecond: videoBitrate
        });
    } catch(recInitErr) {
        console.warn("Seçilen yüksek bitrate ile başlatılamadı, alternatif deneniyor:", recInitErr);
        try {
            recorder = new MediaRecorder(stream, {
                mimeType: chosenMime,
                videoBitsPerSecond: 12000000 // 12 Mbps
            });
        } catch(e2) {
            recorder = new MediaRecorder(stream);
        }
    }

    const chunks = [];
    recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = (e) => {
        console.error("MediaRecorder hata verdi:", e);
        finishVideoToastError("Video kaydı sırasında bir hata oluştu.");
    };

    // 6. ANİMASYON DÖNGÜSÜ VE KAYIT
    recorder.start(100);
    const startTs = performance.now();
    let animId = null;
    let timerId = null;

    return new Promise((resolve) => {
        const cleanup = () => {
            window.isExportingVideo = false;
            if (animId) cancelAnimationFrame(animId);
            if (timerId) clearTimeout(timerId);
            if (saberApp && saberApp.ticker && !wasTickerStarted) {
                saberApp.ticker.stop();
            }
        };

        recorder.onstop = () => {
            cleanup();

            try {
                const actualMime = recorder.mimeType || chosenMime;
                const blob = new Blob(chunks, { type: actualMime });
                console.log(`🎬 Video kaydı tamamlandı! Boyut: ${(blob.size / 1024).toFixed(1)} KB, MIME: ${actualMime}, Parça: ${chunks.length}`);

                if (!blob || blob.size === 0) {
                    console.error("Video blob boyutu 0!");
                    finishVideoToastError("Video verisi oluşturulamadı. Lütfen tekrar deneyin.");
                    resolve();
                    return;
                }

                const isMp4 = actualMime.toLowerCase().includes('mp4');
                const ext = isMp4 ? 'mp4' : 'webm';
                const fmtSafe = formatName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
                const filename = `emlak-studiom-animasyon-${fmtSafe}-${targetW}x${targetH}.${ext}`;
                const sizeMb = (blob.size / (1024 * 1024)).toFixed(1);

                const url = URL.createObjectURL(blob);

                // 1. Otomatik indirmeyi tetikle
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    if (a.parentNode) a.parentNode.removeChild(a);
                }, 2000);

                // 2. Yüzen widget'ı başarı durumuna geçir (Kullanıcı dilerse 'Hemen İndir' butonuna da basabilir)
                finishVideoToastSuccess(filename, sizeMb, url);
            } catch(err) {
                console.error("Video dosya oluşturma hatası:", err);
                finishVideoToastError("Video oluşturulurken hata: " + (err.message || err));
            }
            resolve();
        };

        function renderFrame(now) {
            const elapsed = now - startTs;
            if (elapsed >= durationMs) {
                if (recorder.state === 'recording') {
                    try { recorder.requestData(); } catch(e) {}
                    recorder.stop();
                }
                return;
            }

            // 1. Statik temel tasarımı çiz
            recCtx.imageSmoothingEnabled = true;
            recCtx.imageSmoothingQuality = 'high';
            recCtx.drawImage(baseCanvas, 0, 0, targetW, targetH);

            // 2. Canlı neon / saber animasyon katmanını çiz
            if (saberApp && saberApp.view && saberApp.stage) {
                try {
                    saberApp.renderer.render(saberApp.stage);
                    recCtx.drawImage(saberApp.view, 0, 0, targetW, targetH);
                } catch(e) {}
            }

            // 3. Yüzen toast ilerleme durumunu güncelle
            const pct = Math.min(99, Math.round((elapsed / durationMs) * 100));
            const remainingSec = Math.max(0, ((durationMs - elapsed) / 1000)).toFixed(1);
            updateVideoToastProgress(pct, remainingSec);

            // 4. Sonraki kare (arka planda sekme gizliyse setTimeout fallback ile devam eder)
            if (document.hidden) {
                timerId = setTimeout(() => renderFrame(performance.now()), 33);
            } else {
                animId = requestAnimationFrame(renderFrame);
            }
        }

        if (document.hidden) {
            timerId = setTimeout(() => renderFrame(performance.now()), 33);
        } else {
            animId = requestAnimationFrame(renderFrame);
        }
    });
}

function renderBatchList(){
    const l=$('batchFileList');
    l.innerHTML='';
    batchFiles.forEach((f,i)=>{
        const d=document.createElement('div');
        d.className='batch-file-item';
        d.innerHTML='<span>'+(i+1)+'. '+f.name+'</span><span>'+(f.size/1024).toFixed(0)+'KB</span>';
        l.appendChild(d);
    });
}

function clearBatchFiles(){
    batchFiles=[];
    $('batchInput').value='';
    renderBatchList();
    $('batchProgress').style.display='none';
}

async function startBatchExport(){
    if(!batchFiles.length){alert('Dosya ekleyin!');return}

    // Pro / Demo Yetki ve Kilit Kontrolü
    if (typeof window.validateExportAllowed === 'function') {
        const check = window.validateExportAllowed();
        if (!check.allowed) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'warning',
                    title: check.title || '🔒 Pro Özellik Kullanımı',
                    html: `<div style="font-size:14px; line-height:1.6; color:#cbd5e1; text-align:left; margin-top:8px;">${check.message}</div>`,
                    background: '#1e293b',
                    color: '#fff',
                    confirmButtonText: 'Tamam, Anladım',
                    confirmButtonColor: '#6366f1'
                });
            } else if (typeof showProUpgradeToast === 'function') {
                showProUpgradeToast(check.message);
            } else {
                alert('🔒 ' + check.message);
            }
            return;
        }
    }

    await ensureFontsLoaded();

      console.log('--- STARTBATCHEXPORT ÇALIŞTI ---');
      const debugSlots = document.querySelectorAll('[data-photo-slot]');
      console.log('Bulunan [data-photo-slot] sayisi:', debugSlots.length);
      debugSlots.forEach((slot, i) => {
          console.log(`Slot ${i} HTML İçi:`, slot.innerHTML);
          console.log(`Slot ${i} inline background-image:`, slot.style.backgroundImage);
          console.log(`Slot ${i} computed background-image:`, window.getComputedStyle(slot).backgroundImage);
          const rc = slot.querySelector('.photo-render-canvas');
          console.log(`Slot ${i} .photo-render-canvas var mi:`, !!rc);
      });
      console.log('--------------------');

    var _wasTplHiddenBatch = window.isTemplateHidden;
    if (_wasTplHiddenBatch && typeof window.toggleTemplateVisibility === 'function') {
        window.toggleTemplateVisibility(false);
    }
    
    batchProgress.style.display='block';
    if(drawMode!=='off')setDrawMode('off');
    
    document.body.classList.add('is-exporting');
    if(typeof deselectAll === 'function') deselectAll();
    document.querySelectorAll('.el-selected').forEach(e=>e.classList.remove('el-selected'));
    document.querySelectorAll('.text-handle').forEach(h=>h.remove());
    document.querySelectorAll('.callout-controls, .callout-resizer, .callout-rotator, .callout-select-border, .callout-lock-btn, .cbtn-del, .draw-handle, .vertex-handle').forEach(c => c.style.display = 'none');
    const existingBatchCtx = document.getElementById('app-custom-context-menu');
    if (existingBatchCtx) existingBatchCtx.remove();
    
    const wz=drawCanvas.style.zIndex,wp=drawCanvas.style.pointerEvents;
    drawCanvas.style.zIndex='7';
    drawCanvas.style.pointerEvents='none';
    
    const formatName=exportFormat?exportFormat.value:'16:9 Full HD';
    const format=EXPORT_FORMATS[formatName]||{w:1920,h:1080};
    const fitMode=exportFitMode?exportFitMode.value:'cover';
    const bgColor=exportBgColor?exportBgColor.value:'#ffffff';
    const scaleVal1 = exportScale?exportScale.value:'1.5';
    const currentW=parseInt(canvasEl.style.width)||1920;
    const currentH=parseInt(canvasEl.style.height)||1080;

    for(let i=0;i<batchFiles.length;i++){
        batchStatus.textContent=batchFiles[i].name;
        batchPercent.textContent=Math.round(i/batchFiles.length*100)+'%';
        batchBar.style.width=Math.round(i/batchFiles.length*100)+'%';
        
        const url=await readFileUrl(batchFiles[i]);
        if(typeof uploadedImgUrl !== 'undefined') uploadedImgUrl=url; 
        if(typeof trackImageSize==='function') trackImageSize(url);
        
        const pLayer = document.getElementById('photo-layer');
        if (pLayer) pLayer.style.backgroundImage="url('"+url+"')";
        
        if(typeof isCanvaMode !== 'undefined' && isCanvaMode && typeof refreshActiveCanvaTemplate === 'function') refreshActiveCanvaTemplate();
        else if(typeof isCanvaMode !== 'undefined' && isCanvaMode) buildCanvaRender();
        
        // Gorsel panele yerlestirildikten sonra hazirla
        let needsPrep = false;
        document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => {
            if (!p.querySelector('.photo-render-canvas') && p.style.backgroundImage && p.style.backgroundImage !== 'none') {
                if (typeof _preparePhoto === 'function') {
                    _preparePhoto(p);
                    needsPrep = true;
                }
            }
        });
        
        // Her iterasyonda photo-render-canvas'i yeniden cizmeye zorluyoruz (cunku arkaplan degisti)
        document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => {
            if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p);
        });
        
        await new Promise(r => setTimeout(r, 200));

        let masterImgObj = new Image();
        masterImgObj.crossOrigin = 'anonymous';
        await new Promise(r => { masterImgObj.onload = r; masterImgObj.onerror = r; masterImgObj.src = url; });

        let outputScale = 1.5;
        if (scaleVal1 === 'original') {
            if (masterImgObj.width > 0) {
                outputScale = Math.min(masterImgObj.width / currentW, masterImgObj.height / currentH);
            } else {
                outputScale = 1;
            }
        } else {
            outputScale = parseFloat(scaleVal1) || 1.5;
        }
        
        if (typeof window.isMobileDevice === 'function' && window.isMobileDevice()) {
            const maxMobileScale = 2.5;
            if (outputScale > maxMobileScale) {
                outputScale = maxMobileScale;
            }
        }

        const targetW = Math.round(format.w * outputScale);
        const targetH = Math.round(format.h * outputScale);
        let finalCanvas = document.createElement('canvas');
        finalCanvas.width = targetW;
        finalCanvas.height = targetH;
        let ctx = finalCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const cvrBase = document.querySelector('.cvr-base');
        const hasKolaj = !!document.getElementById('kolaj-wrapper');
        const isTemplateMode = !!cvrBase || !!document.querySelector('.photo-panel') || hasKolaj;

        if (isTemplateMode) {
            // ==========================================
              // SABLONLU MOD - 3 KATMANLI (SANDWICH) RENDER
              // ==========================================
              
              canvasEl.style.transition='none';
              canvasEl.style.transform='none';
              
              const overlay = document.createElement('div');
              overlay.id = 'download-overlay-mask';
              overlay.style.position = 'fixed';
              overlay.style.top = '0';
              overlay.style.left = '0';
              overlay.style.width = '100vw';
              overlay.style.height = '100vh';
              overlay.style.backgroundColor = 'transparent';
              overlay.style.zIndex = '9999990';
              overlay.style.pointerEvents = 'none';
              document.body.appendChild(overlay);

              const oldPosition = canvasEl.style.position;
              const oldLeft = canvasEl.style.left;
              const oldTop = canvasEl.style.top;
              const oldMargin = canvasEl.style.margin;
              const oldZIndex = canvasEl.style.zIndex;

              canvasEl.style.position = 'fixed';
              canvasEl.style.left = '0px';
              canvasEl.style.top = '0px';
              canvasEl.style.margin = '0px';
              canvasEl.style.zIndex = '9999998';

              try {
                  // --- SINGLE PASS RENDER ---
                    let reqScaleX = targetW / currentW;
                    let reqScaleY = targetH / currentH;
                    let supersamplingScale = Math.max(outputScale, (window.devicePixelRatio || 3), reqScaleX, reqScaleY);
                    const MAX_DIM = 5000;
                    if (currentW * supersamplingScale > MAX_DIM) supersamplingScale = MAX_DIM / currentW;
                    if (currentH * supersamplingScale > MAX_DIM) supersamplingScale = MAX_DIM / currentH;
                    if ((currentW * currentH * supersamplingScale * supersamplingScale) > 16000000) supersamplingScale = Math.sqrt(16000000 / (currentW * currentH));
                    supersamplingScale = Math.floor(supersamplingScale * 10) / 10;
                    const finalHtml2Canvas = await html2canvas(canvasEl, {
                        width: currentW,
                        height: currentH,
                        scale: supersamplingScale,
                        useCORS: true,
                        allowTaint: false,
                        imageTimeout: 0,
                        logging: false,
                        backgroundColor: null,
                        ignoreElements: (el) => isExportIgnoredElement(el),
                        onclone: (clonedDoc) => sanitizeExportClone(clonedDoc)
                    });
                    ctx.drawImage(finalHtml2Canvas, 0, 0, targetW, targetH);
                  
                  

              } catch (e) {
                  console.error("Sandwich Render Error:", e);
              }

              canvasEl.style.position = oldPosition;
              canvasEl.style.left = oldLeft;
              canvasEl.style.top = oldTop;
              canvasEl.style.margin = oldMargin;
              canvasEl.style.zIndex = oldZIndex;
              document.body.removeChild(overlay);
            resizeCanvas();
        // --- UI RESTORE ---
        document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => { if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p); });

        // Çizimleri ve dolguları export canvasına bas
        if (typeof window.redrawAllToContext === 'function') {
            const hasSaberActive = !!(window.SaberEngine && typeof window.SaberEngine.getApp === 'function');
            window.redrawAllToContext(ctx, outputScale, { skipNeonStrokes: hasSaberActive });
        }
            
        if (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') {
                const saberApp = window.SaberEngine.getApp();
                if (saberApp && saberApp.view) {
                    if (saberApp.renderer && saberApp.stage) {
                        saberApp.renderer.resize(targetW, targetH);
                        saberApp.stage.scale.set(outputScale);
                        saberApp.renderer.render(saberApp.stage);
                        ctx.drawImage(saberApp.view, 0, 0, targetW, targetH);
                        saberApp.renderer.resize(currentW, currentH);
                        saberApp.stage.scale.set(1);
                        saberApp.renderer.render(saberApp.stage);
                    } else {
                        ctx.drawImage(saberApp.view, 0, 0, targetW, targetH);
                    }
                }
            }
        } else if (masterImgObj && masterImgObj.width > 0) {
            // SABLONSUZ MOD
            const panel = document.getElementById('photo-layer');
            if (panel) {
                const w = targetW;
                const h = targetH;
                
                ctx.save();
                ctx.beginPath();
                ctx.rect(0, 0, w, h);
                ctx.clip();
                
                // Faz 3: CSS Filter Korunmasi
                const style = window.getComputedStyle(panel);
                let filter = style.filter;
                if (filter && filter !== 'none') {
                    filter = filter.replace(/drop-shadow\([^)]+\)/g, '').trim();
                    if (filter !== '') ctx.filter = filter;
                }

                const renderCanvas = panel.querySelector('.photo-render-canvas');
                if (renderCanvas && renderCanvas.width > 0) {
                    ctx.drawImage(renderCanvas, 0, 0, w, h);
                } else {
                    const natW = (panel && panel.dataset.naturalW) ? parseFloat(panel.dataset.naturalW) : (window.uploadedImgW || masterImgObj.naturalWidth || masterImgObj.width || 1920);
                    const natH = (panel && panel.dataset.naturalH) ? parseFloat(panel.dataset.naturalH) : (window.uploadedImgH || masterImgObj.naturalHeight || masterImgObj.height || 1080);
                    if (fitMode === 'contain') {
                        const ratio = Math.min(w / natW, h / natH);
                        const dw = natW * ratio;
                        const dh = natH * ratio;
                        const dx = (w - dw) / 2;
                        const dy = (h - dh) / 2;
                        ctx.drawImage(masterImgObj, dx, dy, dw, dh);
                    } else {
                        const imgRatio = natW / natH;
                        const panelRatio = w / h;
                        let dw = w;
                        let dh = h;
                        let dx = 0;
                        let dy = 0;
                        if (imgRatio > panelRatio) {
                            dw = h * imgRatio;
                            dx = (w - dw) / 2;
                        } else {
                            dh = w / imgRatio;
                            dy = (h - dh) / 2;
                        }
                        ctx.drawImage(masterImgObj, dx, dy, dw, dh);
                    }
                }
                ctx.filter = 'none'; // Sifirla
                ctx.restore();
            }

            // Çizimleri ve dolguları export canvasına bas (html2canvas öncesi z-index uyumu)
            if (typeof window.redrawAllToContext === 'function') {
                const hasSaberActive = !!(window.SaberEngine && typeof window.SaberEngine.getApp === 'function');
                window.redrawAllToContext(ctx, outputScale, { skipNeonStrokes: hasSaberActive });
            }

            // 2. ui-layer custom items render using html2canvas (SABLONSUZ MOD - Batch)
            const overlay = document.createElement('div');
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
            document.body.appendChild(overlay);

            const oldPosition = canvasEl.style.position;
            const oldLeft = canvasEl.style.left;
            const oldTop = canvasEl.style.top;
            const oldMargin = canvasEl.style.margin;
            const oldZIndex = canvasEl.style.zIndex;
            const oldBg = canvasEl.style.backgroundColor;
            const oldTransform = canvasEl.style.transform;
            const oldTransition = canvasEl.style.transition;

            canvasEl.style.position = 'fixed';
            canvasEl.style.left = '0px';
            canvasEl.style.top = '0px';
            canvasEl.style.margin = '0px';
            canvasEl.style.zIndex = '9999998';
            canvasEl.style.setProperty('background-color', 'transparent', 'important');
            canvasEl.style.transform = 'none';
            canvasEl.style.transition = 'none';

            try {
                let reqScaleX = targetW / currentW;
                let reqScaleY = targetH / currentH;
                let supersamplingScale = Math.max(outputScale, (window.devicePixelRatio || 3), reqScaleX, reqScaleY);
                const MAX_DIM = 5000;
                if (currentW * supersamplingScale > MAX_DIM) supersamplingScale = MAX_DIM / currentW;
                if (currentH * supersamplingScale > MAX_DIM) supersamplingScale = MAX_DIM / currentH;
                if ((currentW * currentH * supersamplingScale * supersamplingScale) > 16000000) supersamplingScale = Math.sqrt(16000000 / (currentW * currentH));
                supersamplingScale = Math.floor(supersamplingScale * 10) / 10;
                const finalHtml2Canvas = await html2canvas(canvasEl, {
                    width: currentW,
                    height: currentH,
                    scale: supersamplingScale,
                    useCORS: true,
                    allowTaint: false,
                    imageTimeout: 0,
                    logging: false,
                    backgroundColor: null,
                    ignoreElements: (el) => isExportIgnoredElement(el),
                    onclone: (clonedDoc) => sanitizeExportClone(clonedDoc)
                });
                ctx.drawImage(finalHtml2Canvas, 0, 0, targetW, targetH);
            } catch (e) {
                console.error("Non-template HTML2Canvas Error:", e);
            }

            canvasEl.style.position = oldPosition;
            canvasEl.style.left = oldLeft;
            canvasEl.style.top = oldTop;
            canvasEl.style.margin = oldMargin;
            canvasEl.style.zIndex = oldZIndex;
            if(oldBg) { canvasEl.style.setProperty('background-color', oldBg, 'important'); } else { canvasEl.style.removeProperty('background-color'); }
            canvasEl.style.transform = oldTransform;
            canvasEl.style.transition = oldTransition;
            document.body.removeChild(overlay);
            resizeCanvas();

            
            // --- UI RESTORE ---
        document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => { if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p); });

            
            if (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') {
                const saberApp = window.SaberEngine.getApp();
                if (saberApp && saberApp.view) {
                    if (saberApp.renderer && saberApp.stage) {
                        saberApp.renderer.resize(targetW, targetH);
                        saberApp.stage.scale.set(outputScale);
                        saberApp.renderer.render(saberApp.stage);
                        ctx.drawImage(saberApp.view, 0, 0, targetW, targetH);
                        saberApp.renderer.resize(currentW, currentH);
                        saberApp.stage.scale.set(1);
                        saberApp.renderer.render(saberApp.stage);
                    } else {
                        ctx.drawImage(saberApp.view, 0, 0, targetW, targetH);
                    }
                }
            }
        }

        // DEMO FILIGRAN / WATERMARK
        if (typeof window.addWatermark === 'function') {
            await window.addWatermark(finalCanvas);
        }

        // INDIRME
        const a = document.createElement('a');
        const fmtSafe = formatName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const fileType = document.getElementById('exportFileType') ? document.getElementById('exportFileType').value : 'jpg';
        const batchName = batchFiles[i].name.replace(/\.[^/.]+$/, ""); // strip original extension
        if (fileType === 'jpg') {
            a.download = batchName + '-' + fmtSafe + '-' + targetW + 'x' + targetH + '.jpg';
            a.href = finalCanvas.toDataURL('image/jpeg', 1.0);
        } else {
            a.download = batchName + '-' + fmtSafe + '-' + targetW + 'x' + targetH + '.png';
            a.href = finalCanvas.toDataURL('image/png', 1.0);
        }
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Memory leak temizligi
        finalCanvas = null;
        ctx = null;
        masterImgObj = null;
    } // for loop end

    drawCanvas.style.zIndex=wz;
    drawCanvas.style.pointerEvents=wp;
    
    document.body.classList.remove('is-exporting');
    if (typeof _wasTplHiddenBatch !== 'undefined' && _wasTplHiddenBatch && typeof window.toggleTemplateVisibility === 'function') {
        window.toggleTemplateVisibility(true);
    }
    batchProgress.style.display='none';
    batchStatus.textContent='Tamamlandı';
    batchPercent.textContent='100%';
    batchBar.style.width='100%';
}

function readFileUrl(f){
    return new Promise(r=>{
        const fr=new FileReader();
        fr.onload=e=>r(e.target.result);
        fr.readAsDataURL(f);
    });
}

async function shareImage(platform) {
    if(!window.html2canvas) return alert('html2canvas yüklenmedi!');
    await ensureFontsLoaded();
    try {
        const c = await html2canvas(canvasEl, {
            useCORS: true,
            allowTaint: false,
            scale: 1, // just standard scale for sharing to be fast
            backgroundColor: null,
            ignoreElements: (el) => isExportIgnoredElement(el),
            onclone: (clonedDoc) => sanitizeExportClone(clonedDoc)
        });
        
        c.toBlob(async (blob) => {
            if (!blob) {
                return alert('Resim oluşturulamadı!');
            }
            const file = new File([blob], 'emlak_tasarimi.jpg', { type: 'image/jpeg' });
            
            // Web Share API support check
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: 'Emlak Tasarımı',
                        text: 'Yeni emlak tasarımına göz atın!',
                        files: [file]
                    });
                } catch (err) {
                    console.log('Share API iptal veya hata:', err);
                }
            } else {
                alert(platform.charAt(0).toUpperCase() + platform.slice(1) + ' için doğrudan paylaşma tarayıcınızda desteklenmiyor. Lütfen resmi indirip manuel paylaşın.');
            }
        }, 'image/jpeg', 0.9);
    } catch(err) {
        console.error(err);
        alert('Paylaşma hatası: ' + err.message);
    }
}

async function getBase64FromBlobUrl(blobUrl, maxWidth = null) {
    if(!blobUrl || !blobUrl.startsWith('blob:')) return blobUrl;
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            let targetW = img.width;
            let targetH = img.height;
            
            if (maxWidth && img.width > maxWidth) {
                targetW = maxWidth;
                targetH = (img.height / img.width) * maxWidth;
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, targetW, targetH);
            
            // Eğer küçültme yapıldıysa (taslak), kaliteyi de 0.6 yap. Aksi halde orijinal kalite.
            const quality = maxWidth ? 0.6 : 0.8;
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve('');
        img.src = blobUrl;
    });
}

async function getBase64FromCSSUrl(cssUrl) {
    if(!cssUrl || cssUrl === 'none') return '';
    const match = cssUrl.match(/url\(['"]?(.*?)['"]?\)/);
    if(match && match[1]) {
        return await getBase64FromBlobUrl(match[1]);
    }
    return '';
}

async function saveProject() {
    try {
        const state = {
            version: 1,
            currentMode, activeLayout, isCanvaMode, activeCanvaId,
            uploadedImgW, uploadedImgH,
            drawMode, drawPaths, extraFieldCounter, extraFieldsData,
            inputs: {},
            customElements: []
        };

        // Resimleri Base64'e çevir ki kalıcı olsun
        state.uploadedImgUrl = await getBase64FromBlobUrl(uploadedImgUrl);

        state.logoImgUrl = logoUrl;
        state.customSlotImages = window.customSlotImages || {};
        if (window.activeCustomTemplateData) {
            state.customTemplate = window.activeCustomTemplateData;
        }

        // Tüm inputları tara
        document.querySelectorAll('input, select, textarea').forEach(el => {
            if(el.id && el.type !== 'file') {
                state.inputs[el.id] = (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value;
            }
        });

        // Tüm özel elemanları (ikonlar ve yazılar) kaydet
        document.querySelectorAll('#photo-layer .draggable').forEach(el => {
            if(['badge', 'price', 'details', 'logo_overlay'].includes(el.id)) return;
            state.customElements.push({
                id: el.id,
                className: el.className,
                innerHTML: el.innerHTML,
                style: el.getAttribute('style'),
                dataset: Object.assign({}, el.dataset)
            });
        });

        // JSON olarak indir
        const jsonString = JSON.stringify(state);
        const blob = new Blob([jsonString], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'emlak_proje.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch(err) {
        console.error("Save error:", err);
        alert("Proje kaydedilirken bir hata oluştu: " + err.message);
    }
}

window.loadProjectFromFile = function(file) {
    if(!file) return;
    if (typeof window.showAppLoading === 'function') {
        window.showAppLoading('Şablon Yüklendi...', 'Tasarım ve katmanlar tuvale yerleştiriliyor...', 8000);
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const state = JSON.parse(event.target.result);
            if(!state.version) throw new Error("Geçersiz proje veya şablon dosyası");

            currentMode = state.currentMode || 'konut';
            activeLayout = typeof state.activeLayout !== 'undefined' ? state.activeLayout : '';
            isCanvaMode = !!state.isCanvaMode;
            activeCanvaId = state.activeCanvaId || '';
            if(isCanvaMode && !activeCanvaId) isCanvaMode = false;
            uploadedImgW = state.uploadedImgW || 1920;
            uploadedImgH = state.uploadedImgH || 1080;
            drawPaths = state.drawPaths || [];
            extraFieldCounter = state.extraFieldCounter || 0;
            
            // extraFieldsData is a const, we must mutate its properties
            const newExtra = state.extraFieldsData || {konut:[],arazi:[]};
            extraFieldsData.konut = newExtra.konut || [];
            extraFieldsData.arazi = newExtra.arazi || [];

            document.querySelectorAll('#photo-layer .draggable').forEach(el => {
                if(['badge', 'price', 'details', 'logo_overlay'].includes(el.id)) return;
                el.remove();
            });
            allIcons = [];

            if(state.inputs) {
                Object.keys(state.inputs).forEach(id => {
                    const el = document.getElementById(id);
                    if(el && el.type !== 'file') {
                        if(el.type === 'checkbox' || el.type === 'radio') el.checked = state.inputs[id];
                        else el.value = state.inputs[id];
                    }
                });
            }

            Object.keys(extraFieldsData).forEach(mode => {
                const c = document.getElementById(mode+'ExtraFields');
                if(c) {
                    c.innerHTML = '';
                    extraFieldsData[mode].forEach(id => {
                        const row = document.createElement('div');
                        row.className = 'extra-field-row';
                        row.id = 'row_'+id;
                        row.innerHTML = '<input type="text" id="lbl_'+id+'" placeholder="Başlık"><input type="text" id="val_'+id+'" placeholder="Değer"><button class="remove-field" onclick="removeExtraField(\''+id+'\',\''+mode+'\')">🗑️</button>';
                        c.appendChild(row);
                        document.getElementById('lbl_'+id).addEventListener('input', renderData);
                        document.getElementById('val_'+id).addEventListener('input', renderData);
                        
                        if(state.inputs && state.inputs['lbl_'+id]) document.getElementById('lbl_'+id).value = state.inputs['lbl_'+id];
                        if(state.inputs && state.inputs['val_'+id]) document.getElementById('val_'+id).value = state.inputs['val_'+id];
                    });
                }
            });

            if(state.customElements) {
                state.customElements.forEach(data => {
                    const el = document.createElement('div');
                    if(data.id) el.id = data.id;
                    el.className = data.className;
                    el.innerHTML = data.innerHTML;
                    if(data.style) el.setAttribute('style', data.style);
                    if(data.dataset) {
                        Object.keys(data.dataset).forEach(k => el.dataset[k] = data.dataset[k]);
                    }

                    // Eski serileştirilmiş tutamaçları temizle ki canlı olay dinleyicileri sıfırdan bağlansın
                    el.querySelectorAll('.text-handle, .cbtn-del, .callout-resizer, .callout-rotator, .callout-lock-btn').forEach(h => h.remove());

                    const pl = document.getElementById('photo-layer');
                    if (pl) pl.appendChild(el);
                    makeDraggable(el);
                    if(el.classList.contains('icon-el') || el.classList.contains('icon-wrap')) {
                        allIcons.push(el);
                    }
                    if(typeof window.addTextHandles === 'function') {
                        window.addTextHandles(el);
                    }
                });
            }

            if (state.uploadedImgUrl) {
                uploadedImgUrl = state.uploadedImgUrl;
                const pl = document.getElementById('photo-layer');
                if(pl) pl.style.backgroundImage = "url('" + uploadedImgUrl + "')";
                if(typeof trackImageSize === 'function') trackImageSize(uploadedImgUrl);
            }

            if(state.logoImgUrl && typeof elLogo !== 'undefined' && elLogo) {
                const img = elLogo.querySelector('img');
                if (img) {
                    img.src = state.logoImgUrl;
                    img.style.display = 'block';
                }
                elLogo.src = state.logoImgUrl; 
                elLogo.style.display = 'block';
                elLogo.style.visibility = 'visible';
            }

            if(typeof switchMode === 'function') switchMode(currentMode);
            
            if (state.customSlotImages) {
                window.customSlotImages = state.customSlotImages;
            } else {
                window.customSlotImages = {};
            }

            if (state.customTemplate || state.isCustomTemplate) {
                const tpl = state.customTemplate || state;
                window.activeCustomTemplateData = tpl;
                isCanvaMode = true;
                activeCanvaId = 'custom';
                if (typeof window.renderCustomDynamicTemplate === 'function') {
                    window.renderCustomDynamicTemplate(tpl);
                }
            } else if(isCanvaMode) {
                if(typeof refreshActiveCanvaTemplate === 'function') refreshActiveCanvaTemplate();
            } else {
                if(typeof clearCanvaTemplate === 'function') clearCanvaTemplate(true);
                const canvaLayer = document.getElementById('canva-render-layer');
                if (canvaLayer) { canvaLayer.innerHTML = ''; canvaLayer.style.display = 'none'; }
                const photoL = document.getElementById('photo-layer');
                if (photoL) photoL.style.display = 'block';

                document.querySelectorAll('.normal-el').forEach(el => {
                    el.style.display = 'block';
                    el.style.visibility = 'visible';
                });

                if(activeLayout) {
                    if(typeof setTemplate === 'function') setTemplate(activeLayout);
                } else {
                    if(typeof clearAllTemplates === 'function') clearAllTemplates();
                    if(typeof elBadge !== 'undefined' && elBadge) elBadge.style.visibility='hidden';
                    if(typeof elPrice !== 'undefined' && elPrice) elPrice.style.visibility='hidden';
                    if(typeof elDetails !== 'undefined' && elDetails) elDetails.style.visibility='hidden';
                }
            }

            if(typeof renderData === 'function') renderData();
            if(typeof resizeCanvas === 'function') resizeCanvas();
            if(typeof redrawAll === 'function') redrawAll();
            if(typeof updateDrawHistory === 'function') updateDrawHistory();
            if(typeof renderLayers === 'function') renderLayers();
            if(typeof window.saveState === 'function') window.saveState();

            // Tuval ve font yerleşimlerinin %100 oturmasını garantile:
            setTimeout(() => { if(typeof resizeCanvas === 'function') resizeCanvas(); }, 150);
            setTimeout(() => { if(typeof resizeCanvas === 'function') resizeCanvas(); }, 400);

            // Bekleme ekranını tüm yerleşimler kesin olarak tamamlandıktan sonra (1200ms) pürüzsüz kapat:
            setTimeout(() => {
                if (typeof window.hideAppLoading === 'function') {
                    window.hideAppLoading(250);
                }
            }, 1200);
        } catch(e) {
            if (typeof window.hideAppLoading === 'function') window.hideAppLoading();
            console.error("Load error:", e);
            alert("Hata Detayı:\n" + e.message + "\n\nStack:\n" + (e.stack || '').split('\n').slice(0,3).join('\n'));
        }
    };
    reader.readAsText(file);
};

function loadProject() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        window.loadProjectFromFile(file);
    };
    input.click();
}

window.saveImage = saveImage;
window.exportAnimatedVideo = exportAnimatedVideo;
window.downloadOriginalFromDock = function() {
    if (typeof saveImage === 'function') {
        saveImage();
    }
};







