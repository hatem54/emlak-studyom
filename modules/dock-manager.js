/**
 * ============================================================================
 * ⚡ Emlak Stüdyom - Dinamik Tuval Altı Kısayol Yöneticisi (Dock Context Manager)
 * modules/dock-manager.js
 * ============================================================================
 *
 * - Kullanıcının seçtiği buton, sekme veya araca göre tuval altına anlık kısayollar yükler
 * - Tuval altının ASLA alt sıraya taşmamasını ve dikeyde şişmemesini sağlar
 * - Sadece aktif duruma ait en fazla 3-4 hayati mikro butonu gösterir
 */

(function(window) {
    'use strict';

    const DockContextManager = {
        currentContext: 'data',
        selectedElement: null,
        selected3DElement: null,
        _initialized: false,

        /**
         * Modül Başlatıcı
         */
        init: function() {
            if (this._initialized) return;
            this._initialized = true;

            // Aktif sekmenin kısayollarını yükle
            const activeTabBtn = document.querySelector('#mainTabs .tab-btn.active');
            const initialTab = activeTabBtn ? activeTabBtn.dataset.tab : 'data';
            this.setContext(initialTab || 'data');

            this.bindTabButtons();
            this.hookCoreFunctions();

            // Tuval altı dock yatay kaydırma koruması (asla taşmama ve her butona her zaman erişim garantisi)
            const dock = document.getElementById('canvasBottomDock');
            if (dock) {
                dock.addEventListener('wheel', (e) => {
                    if (dock.scrollWidth > dock.clientWidth) {
                        e.preventDefault();
                        dock.scrollLeft += (e.deltaY || e.deltaX) * 0.8;
                    }
                }, { passive: false });
            }
        },

        /**
         * Sol Panel Ana Sekme Butonlarını Dinle
         */
        bindTabButtons: function() {
            const tabs = document.querySelectorAll('#mainTabs .tab-btn');
            tabs.forEach(btn => {
                btn.addEventListener('click', () => {
                    const tab = btn.dataset.tab;
                    if (tab) {
                        this.setContext(tab);
                    } else {
                        const txt = (btn.textContent || '').toLowerCase();
                        if (txt.includes('yazı') || txt.includes('metin')) {
                            this.setContext('element');
                        }
                    }
                });
            });
        },

        /**
         * Çekirdek Fonksiyonları Otonom Kancalarla (Hook) Bağla
         */
        hookCoreFunctions: function() {
            // 1. switchTab Kancası
            if (typeof window.switchTab === 'function' && !window._dockSwitchTabHooked) {
                window._dockSwitchTabHooked = true;
                const origSwitchTab = window.switchTab;
                window.switchTab = (name) => {
                    origSwitchTab(name);
                    const hasSelected2D = !!(this.selectedElement || document.querySelector('.el-selected'));
                    const hasSelected3D = !!(this.selected3DElement || (window.ThreeDEngine && window.ThreeDEngine.isSelected && window.ThreeDEngine.isSelected()));
                    if (!hasSelected2D && !hasSelected3D) {
                        this.setContext(name);
                    }
                };
            }

            // 2. setDrawMode Kancası
            if (typeof window.setDrawMode === 'function' && !window._dockDrawModeHooked) {
                window._dockDrawModeHooked = true;
                const origSetDrawMode = window.setDrawMode;
                window.setDrawMode = (mode) => {
                    origSetDrawMode(mode);
                    if (mode === 'polygon') {
                        this.setContext('draw_poly');
                    } else if (mode && mode !== 'off') {
                        this.setContext('draw');
                    } else {
                        const activeTabBtn = document.querySelector('#mainTabs .tab-btn.active');
                        const tab = activeTabBtn ? activeTabBtn.dataset.tab : 'data';
                        this.setContext(tab || 'data');
                    }
                };
            }

            // 3. ThreeDEngine 3D Stüdyo Kancaları
            if (window.ThreeDEngine) {
                this._hookThreeD();
            } else {
                window.addEventListener('DOMContentLoaded', () => {
                    if (window.ThreeDEngine) this._hookThreeD();
                });
            }

            // 4. PhotoMasksManager Kancaları
            if (window.PhotoMasksManager) {
                this._hookPhotoMasks();
            } else {
                window.addEventListener('DOMContentLoaded', () => {
                    if (window.PhotoMasksManager) this._hookPhotoMasks();
                });
            }
        },

        _hookThreeD: function() {
            if (window._dockThreeDHooked) return;
            window._dockThreeDHooked = true;
            const engine = window.ThreeDEngine;

            if (typeof engine.openStudio === 'function') {
                const origOpen = engine.openStudio.bind(engine);
                engine.openStudio = async (...args) => {
                    const res = await origOpen(...args);
                    this.setContext('3d');
                    return res;
                };
            }

            if (typeof engine.closeStudio === 'function') {
                const origClose = engine.closeStudio.bind(engine);
                engine.closeStudio = (...args) => {
                    const res = origClose(...args);
                    const activeTabBtn = document.querySelector('#mainTabs .tab-btn.active');
                    const tab = activeTabBtn ? activeTabBtn.dataset.tab : 'settings';
                    this.setContext(tab || 'settings');
                    return res;
                };
            }
        },

        _hookPhotoMasks: function() {
            if (window._dockMasksHooked) return;
            window._dockMasksHooked = true;
            const mgr = window.PhotoMasksManager;

            if (typeof mgr.clickMaskButton === 'function') {
                const origClickMask = mgr.clickMaskButton.bind(mgr);
                mgr.clickMaskButton = (type) => {
                    origClickMask(type);
                    if (type === 'eraser') {
                        this.setContext('eraser');
                    } else if (type === 'clone') {
                        this.setContext('clone');
                    } else if (type === 'radial' || type === 'linear' || type === 'brush') {
                        this.setContext('mask');
                    } else {
                        this.setContext('photo');
                    }
                };
            }
        },

        /**
         * Aktif Konteksti Değiştir
         * @param {string} contextName - 'data', 'photo', 'eraser', 'clone', 'mask', 'draw', 'draw_poly', 'canva', 'callout', 'icons', 'element', 'layers', 'batch', '3d'
         * @param {any} payload - Ekstra bağlam verisi (örn. seçili element)
         */
        setContext: function(contextName, payload) {
            if (!contextName) return;

            const is3DActive = window.ThreeDEngine && typeof window.ThreeDEngine.isActive === 'function' && window.ThreeDEngine.isActive();

            // Eğer 3D stüdyo açıksa veya contextName === '3d' ise:
            if (contextName === '3d' || (is3DActive && !payload && (this.selected3DElement || (window.ThreeDEngine && window.ThreeDEngine.getActiveElement())))) {
                const el3d = (payload && payload.id) ? payload : (window.ThreeDEngine.getActiveElement ? window.ThreeDEngine.getActiveElement() : this.selected3DElement);
                if (el3d) {
                    this.selected3DElement = el3d;
                    this.selectedElement = null;
                    contextName = '3d';
                    payload = el3d;
                }
            }

            // Eğer bir 2D veya 3D öge seçiliyse kontekste geç
            if (contextName === 'element' || contextName === '3d') {
                if (payload) {
                    if (payload.id && (typeof payload.depth !== 'undefined' || payload.isBaseAligned || payload.estateItemId || (payload.type && String(payload.type).startsWith('3d')))) {
                        this.selected3DElement = payload;
                        this.selectedElement = null;
                        contextName = '3d';
                    } else {
                        this.selectedElement = payload;
                        this.selected3DElement = null;
                        contextName = 'element';
                    }
                }
            }

            this.currentContext = contextName;

            // Tüm kontekst gruplarını gizle
            const groups = document.querySelectorAll('.dock-context-group');
            groups.forEach(g => g.classList.remove('active'));

            // Hedef grubu bul ve aktif yap
            let targetGroup = document.getElementById(`dockGroup_${contextName}`);
            if (!targetGroup) {
                if (contextName === '3d' || contextName === 'shapes') {
                    targetGroup = document.getElementById('dockGroup_element');
                } else if (contextName === 'brand') {
                    targetGroup = document.getElementById('dockGroup_data');
                } else if (contextName === 'qr') {
                    targetGroup = document.getElementById('dockGroup_font');
                } else {
                    targetGroup = document.getElementById('dockGroup_element') || document.getElementById('dockGroup_data');
                }
            }
            if (targetGroup) {
                targetGroup.classList.add('active');
            }

            // 3D stüdyo açıkken 3D alt kontrolleri (eksenler, gizmo) görünür kalır
            const dock3D = document.getElementById('dock3DControls');
            if (dock3D) {
                dock3D.style.display = is3DActive ? 'inline-flex' : 'none';
            }
            const dockDiv = document.getElementById('dockContextDivider');
            if (dockDiv) {
                dockDiv.style.display = is3DActive ? 'block' : 'none';
            }

            // Durum Değerlerini Senkronize Et
            this.syncStateValues(contextName, payload);
        },

        /**
         * Kısayol Butonlarının İkon ve Etiketlerini Senkronize Et
         */
        syncStateValues: function(contextName, payload) {
            // 1. Element Kilit Durumu (2D & 3D Birleşik)
            if (contextName === 'element' || contextName === '3d') {
                let isLocked = false;
                if (window.ThreeDEngine && typeof window.ThreeDEngine.isSelected === 'function' && window.ThreeDEngine.isSelected()) {
                    const el3d = (payload && payload.id) ? payload : (window.ThreeDEngine.getActiveElement ? window.ThreeDEngine.getActiveElement() : null);
                    if (el3d) isLocked = !!el3d.locked;
                } else {
                    const el = payload || this.selectedElement || (window.selectedElements && window.selectedElements[0]) || document.querySelector('.el-selected');
                    if (el) {
                        isLocked = (el.dataset ? el.dataset.locked === 'true' : !!el.locked) || (el.classList && el.classList.contains('locked-el'));
                    }
                }

                ['dockElLockIcon', 'dock3DElLockIcon'].forEach(id => {
                    const icon = document.getElementById(id);
                    if (icon) icon.className = isLocked ? 'fa-solid fa-lock' : 'fa-solid fa-lock-open';
                });
                ['dockElLockLabel', 'dock3DElLockLabel'].forEach(id => {
                    const lbl = document.getElementById(id);
                    if (lbl) lbl.textContent = isLocked ? 'Kilitli' : 'Serbest';
                });
                ['dockElLockIcon', 'dock3DElLockIcon'].forEach(id => {
                    const icon = document.getElementById(id);
                    const dockElLockBtn = icon ? icon.closest('.dock-btn') : null;
                    if (dockElLockBtn) {
                        dockElLockBtn.classList.toggle('lock-active', isLocked);
                        dockElLockBtn.title = isLocked ? 'Kilidi Aç' : 'Kilitle';
                    }
                });
            }

            // 2. Klonlama Modu (Kaynak Seçimi vs Boyama)
            if (contextName === 'clone' && window.CloneStamp) {
                const pickBtn = document.getElementById('dockClonePickBtn');
                const drawBtn = document.getElementById('dockCloneDrawBtn');
                const isPicking = !!window.CloneStamp.isPickingSource;
                if (pickBtn) pickBtn.classList.toggle('btn-accent', isPicking);
                if (drawBtn) drawBtn.classList.toggle('btn-accent', !isPicking);
            }

            // 3. Akıllı Hizalama Buton Senkronizasyonu
            document.querySelectorAll('.dock-snap-btn').forEach(btn => {
                btn.classList.toggle('lock-active', !!window.isSmartGuidesEnabled);
                btn.title = window.isSmartGuidesEnabled ? 'Akıllı Manyetik Hizalamayı Kapat' : 'Akıllı Manyetik Hizalamayı Aç';
            });

            // 4. 3D Eksen Gizmo / Serbest Taşıma Buton Senkronizasyonu
            if (contextName === '3d' && window.ThreeDEngine) {
                const isGizmo = (typeof window.ThreeDEngine.isGizmoActive === 'function')
                    ? window.ThreeDEngine.isGizmoActive()
                    : (window.ThreeDEngine.state ? !!window.ThreeDEngine.state.gizmoActive : false);
                const btnFree = document.getElementById('dock3DBtnFree');
                const btnGizmo = document.getElementById('dock3DBtnGizmo');
                if (btnFree) btnFree.classList.toggle('active', !isGizmo);
                if (btnGizmo) btnGizmo.classList.toggle('active', !!isGizmo);
            }
        },

        /**
         * 3D öge seçildiğinde çağrılır
         */
        on3DElementSelected: function(el) {
            this.selected3DElement = el || (window.ThreeDEngine && window.ThreeDEngine.getActiveElement && window.ThreeDEngine.getActiveElement());
            this.selectedElement = null;
            this.setContext('3d', this.selected3DElement);
        },

        /**
         * 2D Tuvalde bir öge seçildiğinde çağrılır
         */
        onElementSelected: function(el) {
            this.selectedElement = el;
            this.selected3DElement = null;
            if (el && el.classList && el.classList.contains('tb-image-frame')) {
                this.setContext('create-template', el);
                if (window.TemplateBuilder) window.TemplateBuilder.updateDockControls(true);
                return;
            }
            this.setContext('element', el);
        },

        /**
         * Öge seçimi kalktığında çağrılır
         */
        onElementDeselected: function() {
            this.selectedElement = null;
            this.selected3DElement = null;
            // Aktif sekmenin kontekstine geri dön
            const activeTabBtn = document.querySelector('#mainTabs .tab-btn.active');
            const tab = activeTabBtn ? activeTabBtn.dataset.tab : 'data';
            this.setContext(tab || 'data');
            if (tab === 'create-template' && window.TemplateBuilder) {
                window.TemplateBuilder.updateDockControls(false);
            }
        }
    };

    window.DockContextManager = DockContextManager;
    window.DockManager = DockContextManager;
    window.syncDockElementLock = function(el) {
        DockContextManager.syncStateValues('element', el);
    };

    // Geriye dönük uyumluluk köprüsü
    const prevUpdateDock = window.updateDockContextUI;
    window.updateDockContextUI = function(el) {
        if (typeof prevUpdateDock === 'function') {
            try { prevUpdateDock(el); } catch(e) {}
        }
        if (el) {
            DockContextManager.onElementSelected(el);
        } else {
            DockContextManager.onElementDeselected();
        }
    };

    // =========================================================================
    // ⚡ DOCK KISAYOL EYLEM YARDIMCILARI (Standalone & Reliable Actions)
    // =========================================================================

    /**
     * Çokgen Çizimini Kapat ve Tamamla
     */
    window.finishPolygon = function() {
        if (typeof window.closePolygon === 'function') {
            window.closePolygon();
        } else if (typeof closePolygon === 'function') {
            closePolygon();
        }
    };

    /**
     * Çokgen Çizimini İptal Et ve Temizle
     */
    window.cancelPolygon = function() {
        if (typeof window.removeTempPolygonSaber === 'function') window.removeTempPolygonSaber();
        if (typeof window.polygonPoints !== 'undefined') window.polygonPoints = [];
        if (typeof window.polygonBuilding !== 'undefined') window.polygonBuilding = false;
        if (typeof window.redrawAll === 'function') window.redrawAll();
        if (typeof window.setDrawMode === 'function') window.setDrawMode('off');
    };

    /**
     * Çokgenin Son Eklenen Noktasını Geri Al
     */
    window.undoPolygonPoint = function() {
        if (typeof window.polygonPoints !== 'undefined' && Array.isArray(window.polygonPoints) && window.polygonPoints.length > 0) {
            window.polygonPoints.pop();
            if (typeof window.updateTempPolygonSaber === 'function') window.updateTempPolygonSaber();
            if (typeof window.drawTempPolygon === 'function') window.drawTempPolygon();
        }
    };

    /**
     * Rozet Hazır Şablonu Ekle
     */
    window.addCalloutPreset = function(type) {
        if (typeof window.addSVGCalloutToCanvas !== 'function' || typeof window.CALLOUT_LIBRARY === 'undefined') return;
        const lib = window.CALLOUT_LIBRARY;
        let targetItem = null;
        if (type === 'circle' && lib['arsa'] && lib['arsa'].items) {
            targetItem = lib['arsa'].items[0]; // İmarlı Damga (Daire)
        } else if (type === 'ribbon' && lib['arsa'] && lib['arsa'].items) {
            targetItem = lib['arsa'].items[4] || lib['arsa'].items[0]; // Yatırım Şerit
        } else if (type === 'badge' && lib['fiyat'] && lib['fiyat'].items) {
            targetItem = lib['fiyat'].items[2] || lib['fiyat'].items[0]; // Fırsat İndirimi
        }
        if (targetItem) {
            window.addSVGCalloutToCanvas(targetItem);
        }
    };

    /**
     * Hızlı İkon Ekle
     */
    window.addQuickIcon = function(type) {
        if (typeof window.addIcon !== 'function') return;
        if (type === 'location') window.addIcon('map-pin');
        else if (type === 'area') window.addIcon('ruler');
        else if (type === 'price') window.addIcon('coins');
        else window.addIcon(type);
    };

    /**
     * Katmanları Toplu Kilitle / Aç / Göster
     */
    window.lockAllLayers = function() {
        document.querySelectorAll('.canvas-element, .editable-draw').forEach(el => {
            el.dataset.locked = 'true';
        });
        if (typeof window.renderLayersList === 'function') window.renderLayersList();
    };

    window.unlockAllLayers = function() {
        document.querySelectorAll('.canvas-element, .editable-draw').forEach(el => {
            el.dataset.locked = 'false';
        });
        if (typeof window.renderLayersList === 'function') window.renderLayersList();
    };

    window.showAllLayers = function() {
        document.querySelectorAll('.canvas-element, .editable-draw').forEach(el => {
            el.style.display = '';
        });
        if (typeof window.renderLayersList === 'function') window.renderLayersList();
    };

    /**
     * Seçili Ögeyi En Öne Getir
     */
    window.bringToFrontSelected = function() {
        // 🌟 3D Öge Seçiliyse: 3D ögeyi en öne getir
        if (window.ThreeDEngine && typeof window.ThreeDEngine.isSelected === 'function' && window.ThreeDEngine.isSelected()) {
            if (typeof window.ThreeDEngine.bringElementToFront === 'function') {
                window.ThreeDEngine.bringElementToFront();
                return;
            }
        }
        // 2D Eleman Seçiliyse: 2D ögeyi en öne getir
        const el = DockContextManager.selectedElement || document.querySelector('.el-selected') || window.selectedEl || (window.selectedElements && window.selectedElements[0]);
        if (!el) return;
        const container = document.getElementById('canvas-container');
        if (container) {
            let maxZ = 10;
            container.querySelectorAll('.canvas-element, .editable-draw, .draggable, .callout-wrap, .added-icon, [data-layer-uid]').forEach(child => {
                const z = parseInt(window.getComputedStyle(child).zIndex, 10) || 1;
                if (z > maxZ) maxZ = z;
            });
            el.style.zIndex = (maxZ + 1).toString();
        }
    };

    /**
     * Seçili Ögeyi En Arkaya Gönder
     */
    window.sendToBackSelected = function() {
        if (window.ThreeDEngine && typeof window.ThreeDEngine.isSelected === 'function' && window.ThreeDEngine.isSelected()) {
            if (typeof window.ThreeDEngine.sendElementToBack === 'function') {
                window.ThreeDEngine.sendElementToBack();
                return;
            }
        }
        if (typeof window.multiSelectSendToBack === 'function' && window.selectedElements && window.selectedElements.length > 1) {
            window.multiSelectSendToBack();
            return;
        }
        const el = DockContextManager.selectedElement || document.querySelector('.el-selected') || window.selectedEl || (window.selectedElements && window.selectedElements[0]);
        if (!el) return;
        el.style.zIndex = '1';
    };

    /**
     * Seçili Ögeyi Çoğalt (2D & 3D Birleşik)
     */
    window.duplicateSelected = function() {
        if (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function') {
            const multi3D = window.ThreeDGrouping.getSelected3DElements();
            if (multi3D && multi3D.length > 1) {
                window.ThreeDGrouping.duplicateSelectedElements();
                return;
            }
        }
        if (window.ThreeDEngine && typeof window.ThreeDEngine.isSelected === 'function' && window.ThreeDEngine.isSelected()) {
            if (typeof window.ThreeDEngine.duplicateElement === 'function') {
                const el = window.ThreeDEngine.getActiveElement ? window.ThreeDEngine.getActiveElement() : null;
                window.ThreeDEngine.duplicateElement(el);
                return;
            }
        }
        if (typeof window.multiSelectDuplicate === 'function') {
            const el = DockContextManager.selectedElement || document.querySelector('.el-selected') || window.selectedEl;
            if ((!window.selectedElements || window.selectedElements.length === 0) && el) {
                window.selectedElements = [el];
            }
            window.multiSelectDuplicate();
            return;
        }
    };

    /**
     * Seçili Ögeyi Sil (2D & 3D Birleşik)
     */
    window.deleteSelected = function() {
        let deletedAny = false;

        // 1. 🌟 3D Çoklu Seçim: Çoklu 3D ögeleri sil
        if (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function') {
            const multi3D = window.ThreeDGrouping.getSelected3DElements();
            if (multi3D && multi3D.length > 0) {
                window.ThreeDGrouping.deleteSelectedElements();
                deletedAny = true;
            }
        }

        // 2. 🌟 Tekil 3D Öge Seçiliyse Sil
        if (window.ThreeDEngine && typeof window.ThreeDEngine.isSelected === 'function' && window.ThreeDEngine.isSelected()) {
            const activeEl = window.ThreeDEngine.getActiveElement ? window.ThreeDEngine.getActiveElement() : null;
            if (activeEl && !activeEl.locked) {
                if (typeof window.ThreeDEngine.deleteElement === 'function') {
                    window.ThreeDEngine.deleteElement();
                    deletedAny = true;
                } else if (typeof window.ThreeDEngine.delete3DElement === 'function') {
                    window.ThreeDEngine.delete3DElement();
                    deletedAny = true;
                }
            }
        }

        // 3. 🌟 2D Çoklu Seçim: Seçili tüm 2D ögeleri (metin, çizim, şekil, rozet, resim) sil
        if (typeof window.multiSelectDelete === 'function' && Array.isArray(window.selectedElements) && window.selectedElements.length > 0) {
            window.multiSelectDelete();
            deletedAny = true;
        }

        // 4. 🌟 2D Callout Seçiliyse Sil
        if (typeof selectedCalloutEl !== 'undefined' && selectedCalloutEl && typeof deleteSelectedCallout === 'function') {
            deleteSelectedCallout();
            deletedAny = true;
        }

        // 5. 🌟 Tekil 2D Seçili Öge (.el-selected / selectedEl) Silme
        const targets = (Array.isArray(window.selectedElements) && window.selectedElements.length > 0)
            ? [...window.selectedElements]
            : (window.selectedEl ? [window.selectedEl] : (DockContextManager.selectedElement ? [DockContextManager.selectedElement] : Array.from(document.querySelectorAll('.el-selected'))));

        if (targets.length > 0) {
            targets.forEach(sel => {
                if (!sel || (sel.dataset && sel.dataset.locked === 'true')) return;
                if (window.SaberEngine && typeof window.SaberEngine.removeTextSaber === 'function') {
                    window.SaberEngine.removeTextSaber(sel);
                }
                if (typeof drawPaths !== 'undefined' && sel.classList && sel.classList.contains('editable-draw')) {
                    const idx = drawPaths.findIndex(p => p.el === sel);
                    if (idx > -1) {
                        if (typeof window.deleteDrawItem === 'function') window.deleteDrawItem(idx);
                        else drawPaths.splice(idx, 1);
                    }
                }
                if (typeof sel.remove === 'function') {
                    sel.remove();
                    deletedAny = true;
                }
            });
        }

        // 6. 🌟 Temizlik ve Arayüz Senkronizasyonu
        if (deletedAny) {
            if (typeof window.redrawAll === 'function') window.redrawAll();
            if (typeof window.renderLayers === 'function') window.renderLayers();
            if (typeof window.deselectAll === 'function') window.deselectAll();
            if (window.ThreeDGrouping && typeof window.ThreeDGrouping.clearSelection === 'function') {
                window.ThreeDGrouping.clearSelection();
            }
            if (window.ThreeDEngine && typeof window.ThreeDEngine.setSelected === 'function') {
                window.ThreeDEngine.setSelected(false, { silent: true });
            }
            DockContextManager.onElementDeselected();
            if (typeof window.recordHistory === 'function') window.recordHistory('Öge Silindi', true);
        } else {
            // Eğer silinecek hiçbir şey silinemediyse ama hala seçili 2D ögeler varsa dock'u düşürme
            if (Array.isArray(window.selectedElements) && window.selectedElements.length > 0) {
                DockContextManager.onElementSelected(window.selectedElements[0]);
            }
        }
    };

    /**
     * Seçili Ögeyi Kilitle / Kilidi Aç (2D & 3D Birleşik)
     */
    window.toggleLockSelected = function() {
        if (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function') {
            const multi3D = window.ThreeDGrouping.getSelected3DElements();
            if (multi3D && multi3D.length > 1) {
                window.ThreeDGrouping.toggleLockSelectedElements();
                return;
            }
        }
        if (window.ThreeDEngine && typeof window.ThreeDEngine.isSelected === 'function' && window.ThreeDEngine.isSelected()) {
            const activeEl = window.ThreeDEngine.getActiveElement ? window.ThreeDEngine.getActiveElement() : null;
            if (activeEl) {
                const newLocked = !activeEl.locked;
                activeEl.locked = newLocked;
                if (activeEl.groupId && typeof window.ThreeDEngine.getElements === 'function') {
                    const groupMembers = window.ThreeDEngine.getElements().filter(e => e.groupId === activeEl.groupId);
                    groupMembers.forEach(mem => { mem.locked = newLocked; });
                }
                DockContextManager.syncStateValues('element', activeEl);
                if (typeof window.ThreeDEngine.requestRender === 'function') window.ThreeDEngine.requestRender();
                return;
            }
        }
        if (typeof window.multiSelectToggleLock === 'function' && window.selectedElements && window.selectedElements.length > 1) {
            window.multiSelectToggleLock();
            return;
        }
        const el = DockContextManager.selectedElement || document.querySelector('.el-selected') || window.selectedEl;
        if (el) {
            const isLocked = el.dataset.locked === 'true' || el.classList.contains('locked-el');
            el.dataset.locked = (!isLocked).toString();
            el.classList.toggle('locked-el', !isLocked);
            DockContextManager.syncStateValues('element', el);
        }
    };

    window.quickDownloadCurrent = function() {
        if (typeof window.downloadOriginalFromDock === 'function') {
            window.downloadOriginalFromDock();
        } else {
            const btn = document.getElementById('dockDownloadOriginalBtn');
            if (btn) btn.click();
        }
    };

    /**
     * Toplu İndir Başlat
     */
    window.startBatchDownloadProcess = function() {
        const btn = document.getElementById('batchDownloadBtn') || document.getElementById('btnStartBatch');
        if (btn) btn.click();
        else if (typeof window.startBatchDownload === 'function') window.startBatchDownload();
    };

    /**
     * Tasarımı Şablon Olarak Kaydet
     */
    window.saveCustomTemplate = function() {
        const btn = document.getElementById('btnSaveCustomTemplate') || document.getElementById('saveTemplateBtn');
        if (btn) btn.click();
        else if (typeof window.saveTemplateAsCustom === 'function') window.saveTemplateAsCustom();
    };

    /**
     * Toplu Çıktı Bölümünü Aç ve Odakla
     */
    window.openBatchExportSection = function() {
        if (typeof window.switchTab === 'function') {
            window.switchTab('batch');
        }
        const acc = document.getElementById('batchAccordion');
        if (acc) {
            acc.style.display = 'block';
            const sec = acc.previousElementSibling;
            const icon = sec ? sec.querySelector('i') : null;
            if (icon) icon.style.transform = 'rotate(180deg)';
            acc.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };

    /**
     * Seçili Ögenin Açılarını ve Eğimini Sıfırla (2D & 3D Uyumlu)
     */
    window.resetSelectedElementAngles = function() {
        // 1. 3D Öge Seçiliyse:
        if (window.ThreeDEngine && typeof window.ThreeDEngine.isSelected === 'function' && window.ThreeDEngine.isSelected()) {
            const el = window.ThreeDEngine.getActiveElement ? window.ThreeDEngine.getActiveElement() : null;
            if (el) {
                el.orientation = 'flat';
                el.planePitch = 0;
                el.planeYaw = 0;
                el.planeRoll = 0;
                el.planeLocalRot = 0;
                el.planeElevation = 0;
                el.itemPitch = 0;
                el.itemRoll = 0;
                if (window.ThreeDEngine.state) {
                    window.ThreeDEngine.state.orientation = 'flat';
                    window.ThreeDEngine.state.planePitch = 0;
                    window.ThreeDEngine.state.planeYaw = 0;
                    window.ThreeDEngine.state.planeRoll = 0;
                    window.ThreeDEngine.state.planeLocalRot = 0;
                    window.ThreeDEngine.state.planeElevation = 0;
                    window.ThreeDEngine.state.itemPitch = 0;
                    window.ThreeDEngine.state.itemRoll = 0;
                }
                if (typeof window.ThreeDEngine.updatePlaneTransform === 'function') window.ThreeDEngine.updatePlaneTransform(el);
                if (typeof window.ThreeDEngine.updateContentTransform === 'function') window.ThreeDEngine.updateContentTransform(el);
                if (typeof window.ThreeDEngine.updateGizmoPositions === 'function') window.ThreeDEngine.updateGizmoPositions();
                if (typeof window.ThreeDEngine.syncControlsUI === 'function') window.ThreeDEngine.syncControlsUI();
                if (typeof window.ThreeDEngine.requestRender === 'function') window.ThreeDEngine.requestRender();
                if (typeof window.ThreeDEngine.notifyExternalUpdates === 'function') window.ThreeDEngine.notifyExternalUpdates();
                if (typeof window.recordHistory === 'function') window.recordHistory('3D Açıları Sıfırlandı');
                return;
            }
        }

        // 2. 2D Öge Seçiliyse:
        const el = DockContextManager.selectedElement || document.querySelector('.el-selected') || window.selectedEl || (window.selectedElements && window.selectedElements[0]);
        if (el) {
            el.setAttribute('data-rotation', '0');
            el.dataset.rotation = '0';
            const currentScale = el.dataset.scale || 1;
            el.style.transform = `rotate(0deg) scale(${currentScale})`;
            const rotSlider = document.getElementById('elRotate');
            const rotVal = document.getElementById('elRotateVal');
            if (rotSlider) rotSlider.value = 0;
            if (rotVal) rotVal.textContent = '0°';
            if (typeof window.recordHistory === 'function') window.recordHistory('Öge Açısı Sıfırlandı');
        }
    };

    /**
     * Seçili Ögeyi Döndür (2D & 3D Birleşik)
     */
    window.rotateSelectedElement = function(deg = 90) {
        if (deg === 0) {
            window.resetSelectedElementAngles();
            return;
        }

        // 1. 3D Öge Seçiliyse:
        if (window.ThreeDEngine && typeof window.ThreeDEngine.isSelected === 'function' && window.ThreeDEngine.isSelected()) {
            const el = window.ThreeDEngine.getActiveElement ? window.ThreeDEngine.getActiveElement() : null;
            if (el) {
                const cur = el.planeLocalRot || 0;
                let next = Math.round(cur / deg) * deg + deg;
                while (next > 180) next -= 360;
                while (next < -180) next += 360;
                let deltaYaw = next - cur;
                while (deltaYaw > 180) deltaYaw -= 360;
                while (deltaYaw < -180) deltaYaw += 360;

                el.planeLocalRot = next;
                if (window.ThreeDEngine.state) {
                    window.ThreeDEngine.state.planeLocalRot = next;
                }
                if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                    window.ThreeDEngine.updateContentTransform(el);
                }
                if (typeof window.ThreeDEngine.updateGizmoPositions === 'function') {
                    window.ThreeDEngine.updateGizmoPositions();
                }
                if (typeof window.ThreeDEngine.syncControlsUI === 'function') {
                    window.ThreeDEngine.syncControlsUI();
                }
                if (typeof window.ThreeDEngine.notifyExternalUpdates === 'function') {
                    window.ThreeDEngine.notifyExternalUpdates();
                }
                if (typeof window.ThreeDEngine.requestRender === 'function') {
                    window.ThreeDEngine.requestRender();
                }
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateRotationDelta === 'function' && deltaYaw !== 0) {
                    window.ThreeDGrouping.propagateRotationDelta(el, deltaYaw, 0, 0, 'item');
                }
                return;
            }
        }

        // 2. 2D Öge veya Callout Seçiliyse:
        const el = DockContextManager.selectedElement || document.querySelector('.el-selected') || window.selectedEl || (window.selectedElements && window.selectedElements[0]);
        if (el) {
            let curAngle = parseFloat(el.getAttribute('data-rotation') || el.dataset.rotation || '0') || 0;
            let nextAngle = (deg === 0) ? 0 : ((curAngle + deg) % 360);
            if (nextAngle < 0) nextAngle += 360;
            el.setAttribute('data-rotation', nextAngle);
            el.dataset.rotation = nextAngle;
            const currentScale = el.dataset.scale || 1;
            el.style.transform = `rotate(${nextAngle}deg) scale(${currentScale})`;
            const rotSlider = document.getElementById('elRotate');
            const rotVal = document.getElementById('elRotateVal');
            if (rotSlider) rotSlider.value = nextAngle;
            if (rotVal) rotVal.textContent = nextAngle + '°';
            if (typeof window.recordHistory === 'function') window.recordHistory('Öge Döndürüldü');
        }
    };

    /**
     * Seçili Ögeyi Yatay Çevir / Aynala (2D & 3D Birleşik)
     */
    window.flipSelectedElementHorizontal = function() {
        // 1. 3D Öge Seçiliyse:
        if (window.ThreeDEngine && typeof window.ThreeDEngine.isSelected === 'function' && window.ThreeDEngine.isSelected()) {
            const el = window.ThreeDEngine.getActiveElement ? window.ThreeDEngine.getActiveElement() : null;
            if (el) {
                el.planeYaw = ((el.planeYaw || 0) + 180) % 360;
                if (window.ThreeDEngine.state) {
                    window.ThreeDEngine.state.planeYaw = el.planeYaw;
                }
                if (typeof window.ThreeDEngine.updatePlaneTransform === 'function') {
                    window.ThreeDEngine.updatePlaneTransform(el);
                }
                if (typeof window.ThreeDEngine.syncControlsUI === 'function') {
                    window.ThreeDEngine.syncControlsUI();
                }
                if (typeof window.ThreeDEngine.requestRender === 'function') {
                    window.ThreeDEngine.requestRender();
                }
                return;
            }
        }

        // 2. 2D Öge Seçiliyse:
        const el = DockContextManager.selectedElement || document.querySelector('.el-selected') || window.selectedEl || (window.selectedElements && window.selectedElements[0]);
        if (el) {
            const isFlipped = el.getAttribute('data-flipped-h') === 'true';
            el.setAttribute('data-flipped-h', !isFlipped ? 'true' : 'false');
            const curScaleX = !isFlipped ? -1 : 1;
            el.style.transform = (el.style.transform || '').replace(/scaleX\([^)]*\)/g, '').trim() + ` scaleX(${curScaleX})`;
            if (typeof window.recordHistory === 'function') window.recordHistory('Öge Yatay Çevrildi');
        }
    };

    /**
     * Seçili Ögeyi Varsayılan Açı, Boyut ve Duruşa Sıfırla (2D & 3D Evrensel)
     */
    window.resetSelectedElementToDefault = function() {
        if (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function') {
            const multi3D = window.ThreeDGrouping.getSelected3DElements();
            if (multi3D && multi3D.length > 1) {
                window.ThreeDGrouping.resetSelectedElements();
                return;
            }
        }
        // 1. 3D Öge Seçiliyse:
        if (window.ThreeDEngine && typeof window.ThreeDEngine.isSelected === 'function' && window.ThreeDEngine.isSelected()) {
            const el = window.ThreeDEngine.getActiveElement ? window.ThreeDEngine.getActiveElement() : null;
            if (el) {
                // Açıları ve eğimleri sıfırla (Kullanıcıya tam düz baksın)
                el.orientation = el.estateItemId ? (el.orientation || 'standing') : 'flat';
                el.planePitch = 0;
                el.planeYaw = 0;
                el.planeRoll = 0;
                el.planeLocalRot = 0;
                el.planeElevation = 0;
                el.itemPitch = 0;
                el.itemRoll = 0;
                
                // Ölçeği varsayılana getir
                el.planeScale = 1.0;
                el.scaleX = 1.0;
                el.scaleY = 1.0;
                el.scaleZ = 1.0;

                if (window.ThreeDEngine.state) {
                    window.ThreeDEngine.state.orientation = el.orientation;
                    window.ThreeDEngine.state.planePitch = 0;
                    window.ThreeDEngine.state.planeYaw = 0;
                    window.ThreeDEngine.state.planeRoll = 0;
                    window.ThreeDEngine.state.planeLocalRot = 0;
                    window.ThreeDEngine.state.planeElevation = 0;
                    window.ThreeDEngine.state.itemPitch = 0;
                    window.ThreeDEngine.state.itemRoll = 0;
                    window.ThreeDEngine.state.planeScale = 1.0;
                }

                if (typeof window.ThreeDEngine.updatePlaneTransform === 'function') window.ThreeDEngine.updatePlaneTransform(el);
                if (typeof window.ThreeDEngine.updateContentTransform === 'function') window.ThreeDEngine.updateContentTransform(el);
                if (typeof window.ThreeDEngine.updateGizmoPositions === 'function') window.ThreeDEngine.updateGizmoPositions();
                if (typeof window.ThreeDEngine.syncControlsUI === 'function') window.ThreeDEngine.syncControlsUI();
                if (typeof window.ThreeDEngine.requestRender === 'function') window.ThreeDEngine.requestRender();
                if (typeof window.ThreeDEngine.notifyExternalUpdates === 'function') window.ThreeDEngine.notifyExternalUpdates();
                if (typeof window.recordHistory === 'function') window.recordHistory('3D Öge Sıfırlandı');
                if (typeof window.showToast === 'function') {
                    window.showToast('3D öge varsayılan açı ve boyutuna sıfırlandı.', 'info');
                }
                return;
            }
        }

        // 2. 2D Öge veya Callout Seçiliyse:
        const el = DockContextManager.selectedElement || document.querySelector('.el-selected') || window.selectedEl || (window.selectedElements && window.selectedElements[0]);
        if (el) {
            el.setAttribute('data-rotation', '0');
            el.dataset.rotation = '0';
            el.setAttribute('data-scale', '1');
            el.dataset.scale = '1';
            el.setAttribute('data-flipped-h', 'false');
            el.style.transform = 'rotate(0deg) scale(1)';

            if (el.dataset.defaultFont) {
                el.style.fontSize = el.dataset.defaultFont + 'px';
            }

            const rotSlider = document.getElementById('elRotate');
            const rotVal = document.getElementById('elRotateVal');
            if (rotSlider) rotSlider.value = 0;
            if (rotVal) rotVal.textContent = '0°';

            const scaleSlider = document.getElementById('elScale');
            const scaleVal = document.getElementById('elScaleVal');
            if (scaleSlider) scaleSlider.value = 100;
            if (scaleVal) scaleVal.textContent = '100%';

            if (typeof window.recordHistory === 'function') window.recordHistory('Öge Sıfırlandı');
            if (typeof window.showToast === 'function') {
                window.showToast('Öge varsayılan açı ve boyutuna sıfırlandı.', 'info');
            }
        }
    };

    /**
     * Seçili Ögenin Ayarlarını Akıllıca Aç (2D, 3D, Şekil, Çizim Uyumlu)
     */
    window.openSelectedElementSettings = function() {
        if (window.ThreeDEngine && typeof window.ThreeDEngine.isSelected === 'function' && window.ThreeDEngine.isSelected()) {
            if (typeof window.ThreeDEngine.openStudio === 'function') window.ThreeDEngine.openStudio(true, false, true);
            return;
        }
        const el = DockContextManager.selectedElement || document.querySelector('.el-selected') || window.selectedEl;
        if (el) {
            if (el.classList.contains('shape-el')) {
                if (typeof switchTab === 'function') switchTab('shapes');
                if (typeof window.loadShapeSettings === 'function') window.loadShapeSettings(el);
                const p = document.getElementById('shapeSettingsPanel');
                if (p) p.style.display = 'block';
            } else if (el.classList.contains('editable-draw')) {
                if (typeof switchTab === 'function') switchTab('draw');
            } else {
                if (typeof switchTab === 'function') switchTab('font');
                const elSettings = document.getElementById('elSettings');
                if (elSettings) elSettings.style.display = 'block';
            }
        } else {
            if (typeof switchTab === 'function') switchTab('font');
            const elSettings = document.getElementById('elSettings');
            if (elSettings) elSettings.style.display = 'block';
        }
    };

    // DOM hazır olduğunda başlat
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => DockContextManager.init());
        } else {
            setTimeout(() => DockContextManager.init(), 100);
        }
    }
})(window);
