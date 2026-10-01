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
            // Şablon seçildiğinde veya tuvale öge eklendiğinde anında kaldır (Capture phase)
            document.addEventListener('click', (e) => {
                const target = e.target;
                if (!target) return;

                // Gerçek şablon kartı veya butonu tıklandı mı? (Boş Sayfa butonu hariç!)
                const isRealTemplateClick = target.closest(
                    '.canva-tpl-card, .tb-layout-card, .pro-json-card, .pro-tpl-card, .kolaj-btn, .fav-card, ' +
                    '.template-btn:not(#tpl-empty), ' +
                    '[data-id^="canva"], [data-id^="pj_"], ' +
                    '[onclick*="renderKTemplate"], [onclick*="renderCanvaTemplate"], ' +
                    '[onclick*="applyPreset"], [onclick*="applyLayout"]'
                );

                // Tuvale öge ekleyen eylem butonları
                const isElementAddClick = target.closest(
                    '.btn-add-badge, .btn-add-text, .btn-add-shape, .callout-chip, .badge-preset-btn, ' +
                    '.stamp-item, .icon-item, .canva-badge-item, [onclick*="addCustomText"], ' +
                    '[onclick*="addBadge"], [onclick*="addCustomShape"], [onclick*="addIcon"], [onclick*="addNeon"]'
                );

                if (isRealTemplateClick || isElementAddClick) {
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

            // 2. Canva / Kolaj / Şablon aktif mi?
            const canvaLayer = document.getElementById('canva-render-layer');
            const hasCanvaContent = !!(canvaLayer && canvaLayer.children && canvaLayer.children.length > 0 && canvaLayer.style.display !== 'none' && canvaLayer.innerHTML.trim().length > 10);
            
            const hasActiveTemplateVar = !!(
                (typeof window.activeLayout !== 'undefined' && window.activeLayout && window.activeLayout !== 'empty' && window.activeLayout !== 'none') ||
                (typeof window.activeCanvaId !== 'undefined' && window.activeCanvaId && window.activeCanvaId !== '') ||
                (typeof window.activeJsonTemplateId !== 'undefined' && window.activeJsonTemplateId && window.activeJsonTemplateId !== '') ||
                (typeof window.isCanvaMode !== 'undefined' && window.isCanvaMode && hasCanvaContent) ||
                document.querySelector('.template-btn.active:not(#tpl-empty), .canva-tpl-card.active, .tb-layout-card.active, .pro-json-card.active')
            );
            const isCanvaActive = hasCanvaContent || hasActiveTemplateVar;

            // 3. Tuvalde görünür herhangi bir öge var mı? (Yazı, Rozet, Şekil, İkon, Logo vb.)
            const uiLayer = document.getElementById('ui-layer');
            let hasVisibleElements = false;
            if (uiLayer) {
                // Eklenen dinamik özel nesneler
                const customEls = uiLayer.querySelectorAll(':scope > *:not(#elBadge):not(#elPrice):not(#elDetails):not(#elLogo)');
                for (let i = 0; i < customEls.length; i++) {
                    const el = customEls[i];
                    const isHidden = (el.style.visibility === 'hidden' || el.style.display === 'none' || el.classList.contains('is-hidden'));
                    if (!isHidden) {
                        hasVisibleElements = true;
                        break;
                    }
                }
                // Standart şablon elemanları (elBadge, elPrice, elDetails) sadece şablon aktifse ve açıkça görünürse sayılır
                if (!hasVisibleElements) {
                    const hasActiveStd = !!(typeof window.activeLayout !== 'undefined' && window.activeLayout && window.activeLayout !== 'empty' && window.activeLayout !== 'none');
                    if (hasActiveStd) {
                        const elBadge = document.getElementById('elBadge');
                        const elPrice = document.getElementById('elPrice');
                        const elDetails = document.getElementById('elDetails');
                        const isStdVisible = (
                            (elBadge && elBadge.style.visibility !== 'hidden' && elBadge.style.display !== 'none' && !elBadge.classList.contains('is-hidden')) ||
                            (elPrice && elPrice.style.visibility !== 'hidden' && elPrice.style.display !== 'none' && !elPrice.classList.contains('is-hidden')) ||
                            (elDetails && elDetails.style.visibility !== 'hidden' && elDetails.style.display !== 'none' && !elDetails.classList.contains('is-hidden'))
                        );
                        if (isStdVisible) hasVisibleElements = true;
                    }
                }
            }

            // 4. Çizim katmanında çizim var mı?
            let hasDraw = false;
            if (typeof window.lines !== 'undefined' && Array.isArray(window.lines) && window.lines.length > 0) hasDraw = true;
            if (typeof window.polygons !== 'undefined' && Array.isArray(window.polygons) && window.polygons.length > 0) hasDraw = true;
            if (typeof window.drawPaths !== 'undefined' && Array.isArray(window.drawPaths) && window.drawPaths.length > 0) hasDraw = true;

            // 5. 3D Sahne aktif ögesi var mı?
            const has3D = !!(typeof window.ThreeDEngine !== 'undefined' && typeof window.ThreeDEngine.getActiveElement === 'function' && window.ThreeDEngine.getActiveElement());

            // 6. Tuvalde özel ögeler veya rozetler var mı?
            const container = document.getElementById('canvas-container');
            let hasCustomEls = false;
            if (container) {
                const extras = container.querySelectorAll('.canvas-custom-el, .added-sticker, .neon-text-el, .badge-element, .callout-container, .tb-image-frame, .cvr-base, .photo-panel');
                for (let i = 0; i < extras.length; i++) {
                    const el = extras[i];
                    if (el.style.display !== 'none' && el.style.visibility !== 'hidden' && !el.classList.contains('is-hidden')) {
                        hasCustomEls = true;
                        break;
                    }
                }
            }

            return !!(hasUploadUrl || hasMasterBase64 || hasLayerBg || isCanvaActive || hasVisibleElements || hasDraw || has3D || hasCustomEls);
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
                this.el.style.display = 'flex';
                this.el.style.opacity = '1';
                this.el.style.visibility = 'visible';
                this.el.style.pointerEvents = 'auto';
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
            if (this.hasActiveCanvasContent()) {
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
