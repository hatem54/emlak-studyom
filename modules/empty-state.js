/**
 * ==========================================================================
 * CANVAS EMPTY STATE CONTROLLER (TUVAL BAŞLANGIÇ KARTLARI MODÜLÜ)
 * Emlak Stüdyom v7.0
 * ==========================================================================
 */

(function() {
    'use strict';

    const CanvasEmptyState = {
        initialized: false,
        el: null,
        isDismissed: false,

        init() {
            if (this.initialized) return;
            this.el = document.getElementById('canvasEmptyState');
            if (!this.el) return;

            this.bindCardEvents();
            this.bindDragAndDrop();
            this.hookAppLifecycle();
            this.observeCanvas();
            this.bindGlobalInteractions();

            // İlk açılışta tuval durumuna göre göster veya gizle
            this.updateState();
            this.initialized = true;
            setTimeout(() => this.updateState(), 250);
        },

        bindCardEvents() {
            // 1. Kart: Fotoğraf Yükle
            const uploadCard = document.getElementById('emptyCardUpload');
            if (uploadCard) {
                uploadCard.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const input = document.getElementById('imageInput');
                    if (input) input.click();
                });
            }

            // 2. Kart: 3B Uydu Görseli Çek
            const satCard = document.getElementById('emptyCardSatellite');
            if (satCard) {
                satCard.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof window.openSatelliteMapModal === 'function') {
                        window.openSatelliteMapModal();
                    } else {
                        const satBtn = document.getElementById('openSatelliteMapBtn');
                        if (satBtn) satBtn.click();
                    }
                });
            }

            // 3. Kart: Hazır Şablon Seç
            const tplCard = document.getElementById('emptyCardTemplate');
            if (tplCard) {
                tplCard.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof window.switchTab === 'function') {
                        window.switchTab('canva');
                    } else if (typeof switchTab === 'function') {
                        switchTab('canva');
                    }
                });
            }
        },

        bindDragAndDrop() {
            if (!this.el) return;

            ['dragenter', 'dragover'].forEach(name => {
                this.el.addEventListener(name, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.el.classList.add('drag-over');
                    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
                }, false);
            });

            ['dragleave', 'drop'].forEach(name => {
                this.el.addEventListener(name, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.el.classList.remove('drag-over');
                }, false);
            });

            this.el.addEventListener('drop', (e) => {
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
        },

        bindGlobalInteractions() {
            // Şablon seçildiğinde, çizim aracına tıklandığında veya tuvale öge eklendiğinde anında kaldır (Capture phase)
            document.addEventListener('click', (e) => {
                const target = e.target;
                if (!target) return;

                // Çizim modu kapama (#dmOff) veya Boş Sayfa (#tpl-empty) hariç tut
                if (target.closest('#dmOff') || target.closest('#tpl-empty')) return;

                // 1. Çizim araçları (Kare, Serbest Çizim, Düz Çizgi, Ok, Daire, Çokgen vb.)
                const isDrawToolClick = target.closest(
                    '#dmFree, #dmLine, #dmArrow, #dmRect, #dmCircle, #dmPoly, ' +
                    '.draw-mode-btn, .draw-tool-btn, .tool-btn, [onclick*="setDrawMode"]'
                );

                // 2. Gerçek şablon kartı veya butonu tıklandı mı?
                const isRealTemplateClick = target.closest(
                    '.canva-tpl-card, .tb-layout-card, .pro-json-card, .pro-tpl-card, .kolaj-btn, .fav-card, ' +
                    '.template-btn:not(#tpl-empty), ' +
                    '[data-id^="canva"], [data-id^="pj_"], ' +
                    '[onclick*="renderKTemplate"], [onclick*="renderCanvaTemplate"], ' +
                    '[onclick*="applyPreset"], [onclick*="applyLayout"]'
                );

                // 3. Tuvale öge ekleyen eylem butonları (Metin, Rozet, Şekil, İkon, Damga)
                const isElementAddClick = target.closest(
                    '.btn-add-badge, .btn-add-text, .btn-add-shape, .callout-chip, .badge-preset-btn, ' +
                    '.stamp-item, .icon-item, .canva-badge-item, .shape-btn, .shape-card, .callout-card, .callout-item, ' +
                    '[onclick*="addCustomText"], [onclick*="addBadge"], [onclick*="addCustomShape"], ' +
                    '[onclick*="addShape"], [onclick*="addCallout"], [onclick*="addSVGCallout"], ' +
                    '[onclick*="addSmartBadge"], [onclick*="addIcon"], [onclick*="addNeon"], [onclick*="addStamp"]'
                );

                if (isDrawToolClick || isRealTemplateClick || isElementAddClick) {
                    this.dismiss();
                }
            }, true);
        },

        dismiss() {
            this.isDismissed = true;
            this.hide();
            this.ensureWhiteCanvas();
        },

        resetDismiss() {
            this.isDismissed = false;
        },

        ensureWhiteCanvas() {
            const container = document.getElementById('canvas-container');
            if (container) {
                container.style.backgroundColor = '#ffffff';
            }
            const pLayer = document.getElementById('photo-layer');
            if (pLayer && (!pLayer.style.backgroundImage || pLayer.style.backgroundImage === 'none')) {
                pLayer.style.backgroundColor = '#ffffff';
            }
        },

        observeCanvas() {
            const container = document.getElementById('canvas-container');
            if (!container) return;

            let debounceTimer = null;
            const observer = new MutationObserver(() => {
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.updateState();
                }, 50);
            });

            // Hem container'ın kendisini hem canva-render-layer, ui-layer vb. tüm alt ağacı izle
            observer.observe(container, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class', 'src']
            });
        },

        hookAppLifecycle() {
            // clearBgImage çağrıldığında tuval durumunu güncelle
            const origClearBg = window.clearBgImage;
            if (typeof origClearBg === 'function') {
                window.clearBgImage = function(...args) {
                    const res = origClearBg.apply(window, args);
                    setTimeout(() => CanvasEmptyState.updateState(), 60);
                    return res;
                };
            }

            // applyFinalProjectImage veya applyProjectImageFromDataUrl çağrıldığında kartları gizle
            const origApplyFinal = window.applyFinalProjectImage;
            if (typeof origApplyFinal === 'function') {
                window.applyFinalProjectImage = function(...args) {
                    CanvasEmptyState.dismiss();
                    const res = origApplyFinal.apply(window, args);
                    CanvasEmptyState.hide();
                    return res;
                };
            }

            // setDrawMode çağrıldığında (kare, serbest, çizgi vb. açıldığında) kartları anında gizle
            const origSetDrawMode = window.setDrawMode;
            if (typeof origSetDrawMode === 'function') {
                window.setDrawMode = function(mode, ...args) {
                    if (mode && mode !== 'off') {
                        CanvasEmptyState.dismiss();
                    }
                    return origSetDrawMode.apply(this, [mode, ...args]);
                };
            }

            // resetEntireWorkspace çağrıldığında boş tuval bilgilendirme ekranını yeniden getir
            const origReset = window.resetEntireWorkspace;
            if (typeof origReset === 'function') {
                window.resetEntireWorkspace = function(...args) {
                    const res = origReset.apply(window, args);
                    setTimeout(() => {
                        CanvasEmptyState.resetDismiss();
                        CanvasEmptyState.show();
                    }, 120);
                    return res;
                };
            }

            // Öge ekleme ve şablon seçme fonksiyonları çağrıldığında kartları gizle
            const wrapDismissAction = (fnName) => {
                const orig = window[fnName];
                if (typeof orig === 'function') {
                    window[fnName] = (...args) => {
                        this.dismiss();
                        return orig.apply(window, args);
                    };
                }
            };

            [
                'addCustomTextOnly', 'addCustomTextBox', 'addBadgeElement', 'addCustomShape',
                'addShape', 'addCalloutPreset', 'addSVGCalloutToCanvas', 'addSmartBadgeToCanvas', 'addStampToCanvas',
                'addIconElement', 'addLogoToCanvas', 'addNeonText', 'addCallout', 'addParcelBadge',
                'renderCanvaTemplate', 'renderKTemplate', 'loadPhotoFile', 'loadProjectFromFile', 'applySatelliteImage'
            ].forEach(wrapDismissAction);
        },

        hasActiveCanvasContent() {
            // 1. Arka plan fotoğrafı var mı?
            const hasUploadUrl = !!(typeof window.uploadedImgUrl !== 'undefined' && window.uploadedImgUrl && typeof window.uploadedImgUrl === 'string' && window.uploadedImgUrl.trim() !== '');
            const hasMasterBase64 = !!(typeof window.masterImageBase64 !== 'undefined' && window.masterImageBase64 && typeof window.masterImageBase64 === 'string' && window.masterImageBase64.trim() !== '');

            const pLayer = document.getElementById('photo-layer');
            const hasLayerBg = !!(pLayer && (
                (pLayer.dataset && pLayer.dataset.savedBg && pLayer.dataset.savedBg !== 'none' && pLayer.dataset.savedBg !== '') ||
                (pLayer._nativeImgSrc && pLayer._nativeImgSrc !== '') ||
                (pLayer.style && pLayer.style.backgroundImage && pLayer.style.backgroundImage !== 'none' && pLayer.style.backgroundImage !== '' && pLayer.style.backgroundImage !== 'url("")' && pLayer.style.backgroundImage !== 'url("none")')
            ));

            if (hasUploadUrl || hasMasterBase64 || hasLayerBg) return true;

            // 2. Canva / Kolaj katmanı dolu mu?
            const canvaLayer = document.getElementById('canva-render-layer');
            if (canvaLayer && canvaLayer.children && canvaLayer.children.length > 0 && canvaLayer.style.display !== 'none' && canvaLayer.innerHTML.trim().length > 10) {
                return true;
            }

            // 3. Tuvalde aktif çizimler var mı?
            if (typeof window.drawPaths !== 'undefined' && window.drawPaths && window.drawPaths.length > 0) {
                return true;
            }

            // 4. Tuvalde eklenmiş herhangi bir kullanıcı ögesi var mı? (Metin, rozet, şekil, ikon, callout vb.)
            const editableElements = document.querySelectorAll(
                '#canvas-container .editable-item, #canvas-container .callout-wrap, #canvas-container .custom-shape, ' +
                '#canvas-container .editable-draw, #canvas-container .svg-callout-el, #canvas-container [data-element-type]'
            );
            if (editableElements && editableElements.length > 0) {
                return true;
            }

            // 5. Çizim modu aktif mi? (Kullanıcı çizim aracına bastıysa boş tuvalde çizim yapacak)
            if (typeof window.drawMode !== 'undefined' && window.drawMode && window.drawMode !== 'off') {
                return true;
            }

            return false;
        },

        show() {
            this.isDismissed = false;
            if (!this.el) this.el = document.getElementById('canvasEmptyState');
            if (this.el) {
                this.el.classList.remove('is-hidden');
                this.el.style.removeProperty('display');
                this.el.style.removeProperty('visibility');
                this.el.style.removeProperty('opacity');
                this.el.style.removeProperty('pointer-events');
                this.el.style.setProperty('display', 'flex', 'important');
                this.el.style.setProperty('opacity', '1', 'important');
                this.el.style.setProperty('visibility', 'visible', 'important');
                this.el.style.setProperty('pointer-events', 'auto', 'important');
            }
        },

        hide() {
            if (!this.el) this.el = document.getElementById('canvasEmptyState');
            if (this.el) {
                this.el.classList.add('is-hidden');
                this.el.style.display = 'none';
                this.el.style.setProperty('display', 'none', 'important');
                this.el.style.setProperty('visibility', 'hidden', 'important');
                this.el.style.setProperty('opacity', '0', 'important');
                this.el.style.setProperty('pointer-events', 'none', 'important');
            }
        },

        updateState() {
            // Kullanıcı açıkça kartları kapattıysa (dismissed) veya tuvalde herhangi bir içerik/çizim/öge varsa gizle
            if (this.isDismissed || this.hasActiveCanvasContent()) {
                this.hide();
                this.ensureWhiteCanvas();
            } else {
                this.show();
            }
        }
    };

    window.CanvasEmptyState = CanvasEmptyState;
    window.updateCanvasEmptyStateUI = function() {
        CanvasEmptyState.updateState();
    };

    // DOM Hazır olduğunda başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CanvasEmptyState.init());
    } else {
        setTimeout(() => CanvasEmptyState.init(), 60);
    }
})();
