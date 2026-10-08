/**
 * Emlak Stüdyom v7.0 - 3D Grouping & Multi-Selection Engine (modules/three-d-grouping.js)
 * Sorumluluk: Çoklu 3D seçim, birleştirme (gruplama), grubu dağıtma, birlikte hareket ettirme ve çoklu sağ tık menüsü
 * Kurallar: AGENTS.md & GEMINI.md uyumlu, parantezsiz kısa fiiller, tek ikon, sessiz çalışma, monolit şişirmeme.
 */

(function(window) {
    'use strict';

    let selected3DElements = [];
    let overlayContainer = null;

    /**
     * Çoklu seçim görsel çerçevesini (highlight overlay) oluşturur veya getirir.
     */
    function getOverlayContainer() {
        if (!overlayContainer) {
            overlayContainer = document.getElementById('threeDMultiSelectOverlay');
            if (!overlayContainer) {
                overlayContainer = document.createElement('div');
                overlayContainer.id = 'threeDMultiSelectOverlay';
                overlayContainer.style.position = 'fixed';
                overlayContainer.style.inset = '0';
                overlayContainer.style.pointerEvents = 'none';
                overlayContainer.style.zIndex = '9998';
                document.body.appendChild(overlayContainer);
            }
        }
        return overlayContainer;
    }

    const ThreeDGrouping = {
        /**
         * Seçili 3D ögeler listesini döner.
         */
        getSelected3DElements: function() {
            return selected3DElements;
        },

        /**
         * 3D ögeleri çoklu seçime atar ve ekran çerçevelerini günceller.
         * @param {Array} elements 
         */
        setSelected3DElements: function(elements, options = {}) {
            selected3DElements = Array.isArray(elements) ? elements.slice() : [];

            // Eğer 2D seçim varsa ve keep2DSelection istenmemişse temizle
            if (!options.keep2DSelection && selected3DElements.length > 0 && Array.isArray(window.selectedElements) && window.selectedElements.length > 0) {
                window.selectedElements = [];
                if (typeof window.deselectAll === 'function') {
                    // Sadece 2D eleman seçimlerini kaldır
                    document.querySelectorAll('.canvas-el.selected, .callout-wrap.selected, .added-icon.selected').forEach(el => {
                        el.classList.remove('selected', 'multi-selected');
                    });
                }
            }

            // İlk ögeyi ThreeDEngine'de aktif yap (sidebar senkronizasyonu için)
            if (selected3DElements.length > 0 && window.ThreeDEngine) {
                if (typeof window.ThreeDEngine.setActiveElement === 'function') {
                    window.ThreeDEngine.setActiveElement(selected3DElements[0], { select: true });
                }
            }

            this.updateSelectionVisuals();
        },

        /**
         * Tek bir 3D ögeyi çoklu seçime ekler veya çıkarır (Ctrl/Shift tık için).
         * @param {Object} el 
         */
        toggleSelect3DElement: function(el) {
            if (!el) return;
            const idx = selected3DElements.findIndex(item => item.id === el.id);
            if (idx >= 0) {
                selected3DElements.splice(idx, 1);
            } else {
                selected3DElements.push(el);
            }
            this.setSelected3DElements(selected3DElements);
        },

        /**
         * Çoklu 3D seçimini temizler.
         */
        clearSelection: function() {
            selected3DElements = [];
            this.updateSelectionVisuals();
        },

        /**
         * Tek bir ögeyi çoklu seçimden düşürür (silme veya seçim kaldırma anında).
         * @param {Object|string} elOrId 
         */
        removeElementFromSelection: function(elOrId) {
            const id = (typeof elOrId === 'object' && elOrId) ? elOrId.id : elOrId;
            const idx = selected3DElements.findIndex(item => item && item.id === id);
            if (idx >= 0) {
                selected3DElements.splice(idx, 1);
                this.updateSelectionVisuals();
            }
        },

        /**
         * Seçili tüm 3D ögeleri topluca siler.
         */
        deleteSelectedElements: function() {
            if (!selected3DElements || selected3DElements.length === 0) return;
            if (!window.ThreeDEngine || typeof window.ThreeDEngine.deleteElement !== 'function') return;

            const toDelete = selected3DElements.slice();
            this.clearSelection();

            toDelete.forEach((el, index) => {
                const isLast = (index === toDelete.length - 1);
                window.ThreeDEngine.deleteElement(el, !isLast);
            });

            if (window.DockContextManager) {
                const has2DSel = Array.isArray(window.selectedElements) && window.selectedElements.length > 0;
                if (has2DSel) {
                    if (typeof window.DockContextManager.onElementSelected === 'function') {
                        window.DockContextManager.onElementSelected(window.selectedElements[0]);
                    }
                } else if (!window.ThreeDEngine.getElements || window.ThreeDEngine.getElements().length === 0) {
                    if (typeof window.DockContextManager.onElementDeselected === 'function') {
                        window.DockContextManager.onElementDeselected();
                    }
                }
            }
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Seçili 3D Ögeler Silindi');
            }
        },

        /**
         * Seçili tüm 3D ögeleri topluca çoğaltır.
         */
        duplicateSelectedElements: function() {
            if (!selected3DElements || selected3DElements.length === 0) return;
            if (!window.ThreeDEngine || typeof window.ThreeDEngine.duplicateElement !== 'function') return;

            const clones = [];
            const targets = selected3DElements.slice();
            targets.forEach(el => {
                const clone = window.ThreeDEngine.duplicateElement(el);
                if (clone) clones.push(clone);
            });

            if (clones.length > 0) {
                this.setSelected3DElements(clones);
                if (typeof window.showToast === 'function') {
                    window.showToast(`${clones.length} adet 3D öge çoğaltıldı`, 'info');
                }
            }
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Çoklu 3D Çoğaltma');
            }
        },

        /**
         * Seçili tüm 3D ögeleri topluca kilitler veya kilidini açar.
         */
        toggleLockSelectedElements: function() {
            if (!selected3DElements || selected3DElements.length === 0) return;
            const anyUnlocked = selected3DElements.some(e => !e.locked);
            selected3DElements.forEach(el => {
                el.locked = anyUnlocked;
            });
            if (window.ThreeDEngine && typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }
            if (typeof window.showToast === 'function') {
                window.showToast(anyUnlocked ? 'Seçili 3D ögeler kilitlendi' : '3D ögelerin kilidi açıldı', 'info');
            }
        },

        /**
         * Seçili tüm 3D ögelerin açı ve eğimlerini varsayılana sıfırlar.
         */
        resetSelectedElements: function() {
            if (!selected3DElements || selected3DElements.length === 0) return;
            selected3DElements.forEach(el => {
                el.orientation = 'flat';
                el.planePitch = 0;
                el.planeYaw = 0;
                el.planeRoll = 0;
                el.planeLocalRot = 0;
                el.planeElevation = 0;
                el.itemPitch = 0;
                el.itemRoll = 0;
                if (window.ThreeDEngine && typeof window.ThreeDEngine.updateContentTransform === 'function') {
                    window.ThreeDEngine.updateContentTransform(el);
                }
            });
            if (window.ThreeDEngine) {
                if (typeof window.ThreeDEngine.updateGizmoPositions === 'function') {
                    window.ThreeDEngine.updateGizmoPositions();
                }
                if (typeof window.ThreeDEngine.requestRender === 'function') {
                    window.ThreeDEngine.requestRender();
                }
            }
            this.updateSelectionVisuals();
        },

        /**
         * Tuval üzerinde seçili 3D nesnelerin etrafına mavi kesikli seçim kutuları çizer.
         * Grup 'all' modundayken tüm ögeleri tek bir temiz çerçeve ile sarar.
         * Sıfır gecikme (transition: none) ve DOM yeniden kullanım mimarisiyle 60fps akıcı çalışır.
         */
        updateSelectionVisuals: function() {
            const overlay = getOverlayContainer();
            if (!overlay) return;

            const is3DActive = window.ThreeDEngine && (
                (typeof window.ThreeDEngine.hasElements === 'function' && window.ThreeDEngine.hasElements()) ||
                (typeof window.ThreeDEngine.getElements === 'function' && window.ThreeDEngine.getElements().length > 0) ||
                (typeof window.ThreeDEngine.isActive === 'function' && window.ThreeDEngine.isActive())
            );

            if (selected3DElements.length < 1 || !is3DActive) {
                for (let i = 0; i < overlay.children.length; i++) {
                    overlay.children[i].style.display = 'none';
                }
                return;
            }

            const boundsList = typeof window.ThreeDEngine.getElementsScreenBounds === 'function'
                ? window.ThreeDEngine.getElementsScreenBounds()
                : [];

            const isGroupAll = (window.ThreeDEngine && typeof window.ThreeDEngine.getGroupEditMode === 'function')
                ? (window.ThreeDEngine.getGroupEditMode() === 'all')
                : true;

            const firstGroupId = selected3DElements[0]?.groupId;
            const isSingleUnifiedGroup = isGroupAll && firstGroupId && selected3DElements.every(e => e && e.groupId === firstGroupId);

            function updateBoxDom(boxEl, left, top, width, height) {
                boxEl.style.display = 'block';
                boxEl.style.left = (left - 4) + 'px';
                boxEl.style.top = (top - 4) + 'px';
                boxEl.style.width = (width + 8) + 'px';
                boxEl.style.height = (height + 8) + 'px';
            }

            function getOrCreateBox(index) {
                let box = overlay.children[index];
                if (!box) {
                    box = document.createElement('div');
                    box.className = 'three-d-selection-box';
                    box.style.position = 'fixed';
                    box.style.border = '1.5px dashed #38bdf8';
                    box.style.borderRadius = '4px';
                    box.style.backgroundColor = 'rgba(56, 189, 248, 0.08)';
                    box.style.pointerEvents = 'none';
                    box.style.transition = 'none';

                    const dot = document.createElement('div');
                    dot.className = 'three-d-selection-dot';
                    dot.style.position = 'absolute';
                    dot.style.right = '-4px';
                    dot.style.bottom = '-4px';
                    dot.style.width = '7px';
                    dot.style.height = '7px';
                    dot.style.backgroundColor = '#38bdf8';
                    dot.style.borderRadius = '50%';
                    box.appendChild(dot);

                    overlay.appendChild(box);
                }
                box.style.transition = 'none';
                return box;
            }

            let boxIndex = 0;

            if (isSingleUnifiedGroup) {
                // 🌟 Birlikte Düzenle (All) Modunda: Tüm grup tek bir nesne gibi tek çerçeve ile sarılır
                let minL = Infinity, minT = Infinity, maxR = -Infinity, maxB = -Infinity;
                let found = false;
                selected3DElements.forEach(el => {
                    const b = boundsList.find(item => item.id === el.id);
                    if (b && b.rect) {
                        found = true;
                        if (b.rect.left < minL) minL = b.rect.left;
                        if (b.rect.top < minT) minT = b.rect.top;
                        if (b.rect.right > maxR) maxR = b.rect.right;
                        if (b.rect.bottom > maxB) maxB = b.rect.bottom;
                    }
                });
                if (found && minL < Infinity) {
                    const box = getOrCreateBox(boxIndex++);
                    updateBoxDom(box, minL, minT, Math.max(10, maxR - minL), Math.max(10, maxB - minT));
                }
            } else {
                // Ayrı alt öge seçimleri veya bağımsız çoklu ögeler
                selected3DElements.forEach(el => {
                    const b = boundsList.find(item => item.id === el.id);
                    if (!b || !b.rect) return;
                    const box = getOrCreateBox(boxIndex++);
                    updateBoxDom(box, b.rect.left, b.rect.top, b.rect.width, b.rect.height);
                });
            }

            // Kullanılmayan fazla kutuları gizle (DOM silmeden)
            for (let i = boxIndex; i < overlay.children.length; i++) {
                overlay.children[i].style.display = 'none';
            }
        },

        /**
         * Seçili 3D ögeleri tek birleşik grup çatısı altında birleştirir (Merge / Group).
         * "birleştiri deyince ayrı hareket etmesinler tek öge olsun"
         * @param {Array} [elements] 
         */
        groupSelectedElements: function(elements) {
            const targets = Array.isArray(elements) ? elements : selected3DElements;
            if (!targets || targets.length < 2) return false;

            // 🎯 Tabela + Yazı Mimarisi: 2 öge birleştirildiğinde otomatik yüzey bağlantısı kur
            if (targets.length === 2 && window.ThreeDAlign && typeof window.ThreeDAlign.snapToSurface === 'function') {
                let baseEl = targets.find(e => e.isSurfaceBase || e.elementType === 'element_3d' || e.shapeMode === 'card' || e.shapeMode === 'coin' || (e.elementType && e.elementType.startsWith('badge_')));
                if (!baseEl) {
                    baseEl = targets.find(e => e.elementType !== 'text') || targets[0];
                }
                let childEl = targets.find(e => e !== baseEl) || targets[1];
                
                window.ThreeDAlign.snapToSurface(childEl, baseEl, { offset: childEl.surfaceOffset !== undefined ? childEl.surfaceOffset : 2.5 });
                this.setSelected3DElements([baseEl, childEl]);
                return baseEl.groupId;
            }

            const groupId = 'grp_3d_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

            // Tüm elemanlara groupId ata
            targets.forEach(el => {
                el.groupId = groupId;
            });

            // Seçimi koru
            this.setSelected3DElements(targets);

            if (window.ThreeDEngine && typeof window.ThreeDEngine.updateElementSelectorUI === 'function') {
                window.ThreeDEngine.updateElementSelectorUI();
            }

            if (window.ThreeDEngine && typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }

            return groupId;
        },

        /**
         * Seçili ögelerin veya belirtilen grubun bağlantısını çözer (Ungroup / Grubu Dağıt).
         * @param {Array|string} elementsOrGroupId 
         */
        ungroupElements: function(elementsOrGroupId) {
            let groupIds = new Set();

            if (typeof elementsOrGroupId === 'string') {
                groupIds.add(elementsOrGroupId);
            } else if (Array.isArray(elementsOrGroupId)) {
                elementsOrGroupId.forEach(el => {
                    if (el && el.groupId) groupIds.add(el.groupId);
                });
            } else if (selected3DElements.length > 0) {
                selected3DElements.forEach(el => {
                    if (el && el.groupId) groupIds.add(el.groupId);
                });
            }

            if (groupIds.size === 0) return false;

            const allElements = (window.ThreeDEngine && typeof window.ThreeDEngine.getElements === 'function')
                ? window.ThreeDEngine.getElements()
                : selected3DElements;

            allElements.forEach(el => {
                if (el && el.groupId && groupIds.has(el.groupId)) {
                    if (el.contentGroup && el.attachedTo) {
                        const base = allElements.find(b => b && b.id === el.attachedTo);
                        if (base) {
                            el.posX = base.posX;
                            el.posY = base.posY;
                            if (base.contentGroup && el.contentGroup.parent === base.contentGroup) {
                                base.contentGroup.remove(el.contentGroup);
                            }
                        }
                        if (el.planeGroup) {
                            el.planeGroup.add(el.contentGroup);
                            el.planeGroup.visible = true;
                        }
                    }
                    delete el.groupId;
                    delete el.attachedTo;
                    delete el.isSurfaceBase;
                    if (window.ThreeDEngine && typeof window.ThreeDEngine.updatePlaneTransform === 'function') {
                        window.ThreeDEngine.updatePlaneTransform(el);
                    }
                    if (window.ThreeDEngine && typeof window.ThreeDEngine.updateContentTransform === 'function') {
                        window.ThreeDEngine.updateContentTransform(el);
                    }
                }
            });

            this.updateSelectionVisuals();

            if (window.ThreeDEngine && typeof window.ThreeDEngine.updateElementSelectorUI === 'function') {
                window.ThreeDEngine.updateElementSelectorUI();
            }

            if (window.ThreeDEngine && typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }

            return true;
        },

        /**
         * Bir öge fareyle veya gizmoyla taşındığında grup kardeşlerine veya çoklu seçime delta aktarır.
         * @param {Object} primaryEl - Taşınan ana öge
         * @param {number} deltaX - X ekseni yer değiştirme miktarı
         * @param {number} deltaY - Y ekseni yer değiştirme miktarı
         * @param {number} [deltaZ] - Z ekseni yer değiştirme miktarı
         */
        propagateDragDelta: function(primaryEl, deltaX, deltaY, deltaZ) {
            if (!primaryEl || (!deltaX && !deltaY && !deltaZ)) return;
            if (!window.ThreeDEngine) return;

            // Grup düzenleme modu kontrolü: Sadece 'all' (Birlikte Düzenle) modunda kardeşlere aktarılır
            const isGroupAll = (window.ThreeDEngine && typeof window.ThreeDEngine.getGroupEditMode === 'function')
                ? (window.ThreeDEngine.getGroupEditMode() === 'all')
                : true;
            if (!isGroupAll) return;

            let siblings = [];

            // 1. Önce aynı groupId'ye sahip kardeşleri topla
            if (primaryEl.groupId) {
                const all = (typeof window.ThreeDEngine.getElements === 'function')
                    ? window.ThreeDEngine.getElements()
                    : selected3DElements;
                siblings = all.filter(e => e && e.groupId === primaryEl.groupId && e.id !== primaryEl.id);
            }
            // 2. Eğer grup yok ama çoklu seçim yapılmışsa çoklu seçimdeki kardeşleri topla
            else if (selected3DElements.length > 1 && selected3DElements.some(e => e.id === primaryEl.id)) {
                siblings = selected3DElements.filter(e => e.id !== primaryEl.id);
            }
            if (siblings.length === 0) {
                const all = (typeof window.ThreeDEngine.getElements === 'function') ? window.ThreeDEngine.getElements() : [];
                siblings = all.filter(e => e && e.id !== primaryEl.id && (e.attachedTo === primaryEl.id || primaryEl.attachedTo === e.id));
            }

            if (siblings.length > 0) {
                const dX = deltaX || 0;
                const dY = deltaY || 0;
                const dZ = deltaZ || 0;

                siblings.forEach(sib => {
                    // 1. Eğer sib, primaryEl'in yüzeyine bağlı çocuk ise:
                    if (sib.attachedTo === primaryEl.id) {
                        sib.posX = (sib.posX || 0) + dX;
                        sib.posY = (sib.posY || 0) + dY;
                        if (dZ) sib.posZ = Math.max(-2000, Math.min(600, (sib.posZ || 0) + dZ));
                        return;
                    }
                    // 2. Eğer primaryEl, sib'in yüzeyine bağlı çocuk ise (kullanıcı ön yüzdeki ögeyi tutup taşıdıysa):
                    if (primaryEl.attachedTo === sib.id) {
                        sib.posX = (sib.posX || 0) + dX;
                        sib.posY = (sib.posY || 0) + dY;
                        if (dZ) sib.posZ = Math.max(-2000, Math.min(600, (sib.posZ || 0) + dZ));
                        if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                            window.ThreeDEngine.updateContentTransform(sib);
                        }
                        return;
                    }
                    sib.posX = (sib.posX || 0) + dX;
                    sib.posY = (sib.posY || 0) + dY;
                    if (dZ) sib.posZ = Math.max(-2000, Math.min(600, (sib.posZ || 0) + dZ));
                    if (typeof window.ThreeDEngine.updatePlaneTransform === 'function') {
                        window.ThreeDEngine.updatePlaneTransform(sib);
                    }
                    if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                        window.ThreeDEngine.updateContentTransform(sib);
                    }
                });
            }

            this.updateSelectionVisuals();

            if (typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }
        },

        /**
         * Bir öge döndürüldüğünde grup kardeşlerine rotasyon ve yörünge aktarımı yapar.
         * "birleştirmede iki öge de aynı anda dönsün, tek öge gibi hareket etsinler"
         * @param {Object} primaryEl - Döndürülen ana öge (pivot)
         * @param {number} deltaYaw - Yatay dönüş açısı değişimi (derece)
         * @param {number} deltaPitch - Eğim açısı değişimi (derece)
         * @param {number} deltaRoll - Sağa/sola yatırma açısı değişimi (derece)
         * @param {string} [mode='item'] - 'item' (öge içi / gizmo rotasyonu) | 'plane' (düzlem açısı rotasyonu)
         */
        propagateRotationDelta: function(primaryEl, deltaYaw, deltaPitch, deltaRoll, mode = 'item') {
            if (!primaryEl || (!deltaYaw && !deltaPitch && !deltaRoll)) return;
            if (!window.ThreeDEngine) return;

            // Grup düzenleme modu kontrolü: 'all' modu veya çoklu seçim aktifken kardeşlere aktarılır
            const isGroupAll = (selected3DElements.length > 1) || (window.ThreeDEngine && typeof window.ThreeDEngine.getGroupEditMode === 'function'
                ? (window.ThreeDEngine.getGroupEditMode() === 'all')
                : true);
            if (!isGroupAll) return;

            let siblings = [];
            // 1. Çoklu seçim listesini öncelikli kontrol et
            if (selected3DElements.length > 1 && selected3DElements.some(e => e.id === primaryEl.id)) {
                siblings = selected3DElements.filter(e => e.id !== primaryEl.id);
            }
            // 2. Çoklu seçim yoksa aynı groupId'ye sahip kardeşleri al
            else if (primaryEl.groupId) {
                const all = (typeof window.ThreeDEngine.getElements === 'function')
                    ? window.ThreeDEngine.getElements()
                    : selected3DElements;
                siblings = all.filter(e => e && e.groupId === primaryEl.groupId && e.id !== primaryEl.id);
            }
            // 3. Yüzey bağlantılı kardeşler
            if (siblings.length === 0) {
                const all = (typeof window.ThreeDEngine.getElements === 'function') ? window.ThreeDEngine.getElements() : [];
                siblings = all.filter(e => e && e.id !== primaryEl.id && (e.attachedTo === primaryEl.id || primaryEl.attachedTo === e.id));
            }

            if (siblings.length === 0) return;

            const dYaw = deltaYaw || 0;
            const dPitch = deltaPitch || 0;
            const dRoll = deltaRoll || 0;

            // 1. EĞER BİRİ DİĞERİNİN YÜZEYİNE YAPIŞTIRILMIŞSA (Tabela + Yazı):
            const surfaceSiblings = siblings.filter(s => s.attachedTo === primaryEl.id || primaryEl.attachedTo === s.id);
            surfaceSiblings.forEach(sib => {
                if (sib.attachedTo === primaryEl.id) {
                    sib.planeYaw = primaryEl.planeYaw;
                    sib.planePitch = primaryEl.planePitch;
                    sib.planeRoll = primaryEl.planeRoll;
                    sib.planeLocalRot = primaryEl.planeLocalRot;
                    sib.itemPitch = primaryEl.itemPitch;
                    sib.itemRoll = primaryEl.itemRoll;
                    if (typeof window.ThreeDEngine.updatePlaneTransform === 'function') {
                        window.ThreeDEngine.updatePlaneTransform(sib);
                    } else if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                        window.ThreeDEngine.updateContentTransform(sib);
                    }
                    return;
                }
                if (primaryEl.attachedTo === sib.id) {
                    if (mode === 'plane') {
                        if (dYaw) sib.planeYaw = Math.round(((sib.planeYaw || 0) + dYaw) % 360);
                        if (dPitch) sib.planePitch = Math.max(-90, Math.min(90, Math.round((sib.planePitch || 0) + dPitch)));
                        if (dRoll) sib.planeRoll = Math.round(((sib.planeRoll || 0) + dRoll) % 360);
                        if (typeof window.ThreeDEngine.updatePlaneTransform === 'function') {
                            window.ThreeDEngine.updatePlaneTransform(sib);
                        }
                    } else {
                        // mode === 'item' (Gizmo noktaları: DotX, DotY, DotZ)
                        if (dYaw) {
                            let newYaw = Math.round(((sib.planeLocalRot || 0) + dYaw) % 360);
                            while (newYaw > 180) newYaw -= 360;
                            while (newYaw < -180) newYaw += 360;
                            sib.planeLocalRot = newYaw;
                        }
                        if (dPitch) {
                            sib.itemPitch = Math.max(-75, Math.min(75, Math.round((sib.itemPitch || 0) + dPitch)));
                        }
                        if (dRoll) {
                            let newRoll = Math.round(((sib.itemRoll || 0) + dRoll) % 360);
                            while (newRoll > 180) newRoll -= 360;
                            while (newRoll < -180) newRoll += 360;
                            sib.itemRoll = newRoll;
                        }
                        if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                            window.ThreeDEngine.updateContentTransform(sib);
                        }
                    }
                    return;
                }
            });

            // 2. YANYANA VEYA ÇOKLU BİRLEŞTİRİLMİŞ GRUP (Tek Ortak Merkez Etrafında Dairesel Yörünge & Açı Rotasyonu):
            const independentMembers = [primaryEl, ...siblings.filter(s => s.attachedTo !== primaryEl.id && primaryEl.attachedTo !== s.id)];
            if (independentMembers.length > 1) {
                // Ortak Grup Merkezi (Centroid Pivot)
                let sumX = 0, sumY = 0, sumZ = 0;
                independentMembers.forEach(m => {
                    sumX += (m.posX || 0);
                    sumY += (m.posY || 0);
                    sumZ += (m.posZ || 0);
                });
                const pivotX = sumX / independentMembers.length;
                const pivotY = sumY / independentMembers.length;
                const pivotZ = sumZ / independentMembers.length;

                const isFenceGroup = independentMembers.some(m => m && (m.isFence || m.isFenceGroup || m.isBaseAligned));

                // 🌟 Yatay / Düzlem İçi Dönüş (Yaw / localRot)
                if (dYaw) {
                    const radYaw = (typeof THREE !== 'undefined' && THREE.MathUtils)
                        ? THREE.MathUtils.degToRad(dYaw)
                        : (dYaw * Math.PI / 180);

                    independentMembers.forEach(m => {
                        if (isFenceGroup || mode !== 'plane') {
                            // 2D fotoğraf düzlemi / Z ekseni yörüngesi: (X, Y) yörüngesi
                            // 🛡️ Sabit Yarıçaplı Rijit Gövde Dönüşü: Parçaların merkezden mesafesi asla bozulmaz, çit dağılmaz
                            const dx = (m.posX || 0) - pivotX;
                            const dy = (m.posY || 0) - pivotY;
                            const dist = Math.hypot(dx, dy);
                            if (dist > 0.0001) {
                                const currentAngle = Math.atan2(dy, dx);
                                const newAngle = currentAngle + radYaw;
                                m.posX = pivotX + dist * Math.cos(newAngle);
                                m.posY = pivotY + dist * Math.sin(newAngle);
                            }

                            if (m !== primaryEl) {
                                let newRot = ((m.planeLocalRot || 0) + dYaw) % 360;
                                while (newRot > 180) newRot -= 360;
                                while (newRot < -180) newRot += 360;
                                m.planeLocalRot = Math.round(newRot);
                            }

                            if (isFenceGroup) {
                                m.planeYaw = 0; // Tel çit panelleri asla kendi dikmesi etrafında panjur gibi dönmez
                            }
                        } else {
                            // Serbest 3D nesneler için zemin / dikey eksen dönüşü: (X, Z) yörüngesi
                            const dx = (m.posX || 0) - pivotX;
                            const dz = (m.posZ || 0) - pivotZ;
                            const dist = Math.hypot(dx, dz);
                            if (dist > 0.0001) {
                                const currentAngle = Math.atan2(dz, dx);
                                const newAngle = currentAngle - radYaw;
                                m.posX = pivotX + dist * Math.cos(newAngle);
                                m.posZ = pivotZ + dist * Math.sin(newAngle);
                            }

                            if (m !== primaryEl) {
                                m.planeYaw = Math.round(((m.planeYaw || 0) + dYaw) % 360);
                            }
                        }

                        if (m === primaryEl && window.ThreeDEngine && window.ThreeDEngine.state) {
                            window.ThreeDEngine.state.posX = primaryEl.posX;
                            window.ThreeDEngine.state.posY = primaryEl.posY;
                            window.ThreeDEngine.state.posZ = primaryEl.posZ;
                            if (isFenceGroup) {
                                window.ThreeDEngine.state.planeLocalRot = primaryEl.planeLocalRot;
                                window.ThreeDEngine.state.planeYaw = 0;
                            }
                        }

                        if (typeof window.ThreeDEngine.updatePlaneTransform === 'function') {
                            window.ThreeDEngine.updatePlaneTransform(m);
                        }
                        if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                            window.ThreeDEngine.updateContentTransform(m);
                        }
                    });
                }

                // 🌟 Dikey Eğim Dönüşü (Pitch)
                if (dPitch) {
                    const radPitch = (typeof THREE !== 'undefined' && THREE.MathUtils)
                        ? THREE.MathUtils.degToRad(dPitch)
                        : (dPitch * Math.PI / 180);
                    const cosP = Math.cos(radPitch);
                    const sinP = Math.sin(radPitch);

                    independentMembers.forEach(m => {
                        if (!isFenceGroup) {
                            const dy = (m.posY || 0) - pivotY;
                            const dz = (m.posZ || 0) - pivotZ;
                            m.posY = pivotY + dy * cosP - dz * sinP;
                            m.posZ = pivotZ + dy * sinP + dz * cosP;
                        }

                        if (m !== primaryEl) {
                            if (mode === 'plane') {
                                m.planePitch = Math.max(-90, Math.min(90, Math.round(((m.planePitch || 0) + dPitch))));
                            } else {
                                m.itemPitch = Math.max(-75, Math.min(75, Math.round(((m.itemPitch || 0) + dPitch))));
                            }
                        }
                        if (isFenceGroup) {
                            const pVal = Math.max(-90, Math.min(90, (primaryEl.planePitch || primaryEl.itemPitch || 0)));
                            m.planePitch = pVal;
                            m.itemPitch = pVal;
                        }

                        if (m === primaryEl && window.ThreeDEngine && window.ThreeDEngine.state) {
                            window.ThreeDEngine.state.posY = primaryEl.posY;
                            window.ThreeDEngine.state.posZ = primaryEl.posZ;
                            if (isFenceGroup) {
                                window.ThreeDEngine.state.planePitch = primaryEl.planePitch;
                                window.ThreeDEngine.state.itemPitch = primaryEl.itemPitch;
                            }
                        }

                        if (typeof window.ThreeDEngine.updatePlaneTransform === 'function') {
                            window.ThreeDEngine.updatePlaneTransform(m);
                        }
                        if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                            window.ThreeDEngine.updateContentTransform(m);
                        }
                    });
                }

                // 🌟 Yatırma Dönüşü (Roll - Z Ekseni)
                if (dRoll) {
                    const radRoll = (typeof THREE !== 'undefined' && THREE.MathUtils)
                        ? THREE.MathUtils.degToRad(dRoll)
                        : (dRoll * Math.PI / 180);

                    independentMembers.forEach(m => {
                        // 2D fotoğraf düzlemi / Z ekseni yatırma: (X, Y) yörüngesi
                        const dx = (m.posX || 0) - pivotX;
                        const dy = (m.posY || 0) - pivotY;
                        const dist = Math.hypot(dx, dy);
                        if (dist > 0.0001) {
                            const currentAngle = Math.atan2(dy, dx);
                            const newAngle = currentAngle + radRoll;
                            m.posX = pivotX + dist * Math.cos(newAngle);
                            m.posY = pivotY + dist * Math.sin(newAngle);
                        }

                        if (m !== primaryEl) {
                            if (isFenceGroup) {
                                let nr = ((m.planeLocalRot || 0) + dRoll) % 360;
                                while (nr > 180) nr -= 360;
                                while (nr < -180) nr += 360;
                                m.planeLocalRot = Math.round(nr);
                            } else if (mode === 'plane') {
                                m.planeRoll = Math.round(((m.planeRoll || 0) + dRoll) % 360);
                            } else {
                                let newRoll = Math.round(((m.itemRoll || 0) + dRoll) % 360);
                                while (newRoll > 180) newRoll -= 360;
                                while (newRoll < -180) newRoll += 360;
                                m.itemRoll = newRoll;
                            }
                        }

                        if (m === primaryEl && window.ThreeDEngine && window.ThreeDEngine.state) {
                            window.ThreeDEngine.state.posX = primaryEl.posX;
                            window.ThreeDEngine.state.posY = primaryEl.posY;
                            if (isFenceGroup) {
                                window.ThreeDEngine.state.planeLocalRot = primaryEl.planeLocalRot;
                            }
                        }

                        if (typeof window.ThreeDEngine.updatePlaneTransform === 'function') {
                            window.ThreeDEngine.updatePlaneTransform(m);
                        }
                        if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                            window.ThreeDEngine.updateContentTransform(m);
                        }
                    });
                }
            }

            this.updateSelectionVisuals();

            if (typeof window.ThreeDEngine.updateGizmoPositions === 'function') {
                window.ThreeDEngine.updateGizmoPositions();
            } else if (typeof window.ThreeDEngine.updateGizmo === 'function') {
                window.ThreeDEngine.updateGizmo();
            }

            if (typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }

            if (typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }
        },

        /**
         * Bir öge ölçeklendirildiğinde (scale / boyut değiştiğinde) grup kardeşlerine ölçek aktarımı yapar.
         * "birleştir dedikten sonra boyut ayarlıyorum sadece yıldız büyüyor beraber büyüme ve hareket etmeliler"
         * @param {Object} primaryEl - Boyutu değişen ana öge
         * @param {number} newScale - Yeni planeScale değeri
         * @param {number} oldScale - Önceki planeScale değeri
         */
        propagateScaleDelta: function(primaryEl, newScale, oldScale) {
            if (!primaryEl || !newScale || !oldScale || Math.abs(newScale - oldScale) < 0.001) return;
            if (!window.ThreeDEngine) return;

            // Grup ölçek senkronizasyonu kontrolü (varsayılan: 'all' / Birlikte Düzenle)
            const isGroupAll = (window.ThreeDEngine && typeof window.ThreeDEngine.getGroupEditMode === 'function')
                ? (window.ThreeDEngine.getGroupEditMode() === 'all')
                : true;
            if (!isGroupAll) return;

            let siblings = [];
            if (primaryEl.groupId) {
                const all = (typeof window.ThreeDEngine.getElements === 'function')
                    ? window.ThreeDEngine.getElements()
                    : selected3DElements;
                siblings = all.filter(e => e && e.groupId === primaryEl.groupId && e.id !== primaryEl.id);
            } else if (selected3DElements.length > 1 && selected3DElements.some(e => e.id === primaryEl.id)) {
                siblings = selected3DElements.filter(e => e.id !== primaryEl.id);
            }
            if (siblings.length === 0) {
                const all = (typeof window.ThreeDEngine.getElements === 'function') ? window.ThreeDEngine.getElements() : [];
                siblings = all.filter(e => e && e.id !== primaryEl.id && (e.attachedTo === primaryEl.id || primaryEl.attachedTo === e.id));
            }

            if (siblings.length === 0) return;

            const ratio = newScale / oldScale;

            siblings.forEach(sib => {
                // 1. Eğer sib, primaryEl'in yüzeyine bağlı çocuk ise:
                if (sib.attachedTo === primaryEl.id) {
                    sib.planeScale = Math.max(0.15, Math.min(5.0, parseFloat(((sib.planeScale || 1.0) * ratio).toFixed(3))));
                    if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                        window.ThreeDEngine.updateContentTransform(sib);
                    }
                    return;
                }

                // 2. Eğer primaryEl, sib'in yüzeyine bağlı çocuk ise:
                if (primaryEl.attachedTo === sib.id) {
                    if (isGroupAll) {
                        sib.planeScale = Math.max(0.15, Math.min(5.0, parseFloat(((sib.planeScale || 1.0) * ratio).toFixed(3))));
                        if (typeof window.ThreeDEngine.updatePlaneTransform === 'function') {
                            window.ThreeDEngine.updatePlaneTransform(sib);
                        }
                    }
                    if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                        window.ThreeDEngine.updateContentTransform(primaryEl);
                    }
                    return;
                }

                // 3. Normal grup kardeşleri (yüzeye bağlı olmayan):
                sib.planeScale = Math.max(0.15, Math.min(5.0, parseFloat(((sib.planeScale || 1.0) * ratio).toFixed(3))));
                const dx = (sib.posX - primaryEl.posX) * (ratio - 1.0);
                const dy = (sib.posY - primaryEl.posY) * (ratio - 1.0);
                sib.posX = Math.round(sib.posX + dx);
                sib.posY = Math.round(sib.posY + dy);
                if (typeof window.ThreeDEngine.updatePlaneTransform === 'function') {
                    window.ThreeDEngine.updatePlaneTransform(sib);
                }
            });

            this.updateSelectionVisuals();

            if (typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }
        },

        /**
         * Çoklu 3D öge sağ tık menüsünü açar.
         * Kurallar: AGENTS.md uyumlu, parantezsiz kısa fiiller, tek SVG ikon.
         * @param {number} clientX 
         * @param {number} clientY 
         */
        openMulti3DContextMenu: function(clientX, clientY) {
            const count = selected3DElements.length;
            if (count < 2) return;

            // Varsa açık menüyü kapat
            const existing = document.getElementById('app-custom-context-menu');
            if (existing) existing.remove();

            const menu = document.createElement('div');
            menu.id = 'app-custom-context-menu';
            menu.className = 'app-context-menu';
            menu.style.zIndex = '100000';

            const hasGrouped = selected3DElements.some(el => !!el.groupId);

            let html = `
                <div class="app-context-header" id="acm-drag-header" title="Sürüklemek için basılı tutun">
                    <span style="display:flex; align-items:center; gap:6px; pointer-events:none; font-weight:700;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2"><rect x="2" y="2" width="20" height="20" rx="3" stroke-dasharray="3 3"/><circle cx="8" cy="8" r="2"/><circle cx="16" cy="16" r="2"/></svg>
                        <span>Çoklu 3D Seçim (${count} Öğe)</span>
                    </span>
                    <button class="acm-close-btn" id="acm-close-btn" title="Kapat">✕</button>
                </div>

                <div class="acm-section-label">🧲 YÜZEY VE BİRLEŞTİRME</div>
                <button class="app-context-item" id="acm3d-snap-surface">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M12 12v9m-4-4 4 4 4-4"/></svg>
                    <span>Yüzeye Yapıştır</span>
                </button>
                <button class="app-context-item" id="acm3d-group">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M10 7h4v4m0 6H7v-4"/></svg>
                    <span>Birleştir</span>
                </button>
                ${hasGrouped ? `
                <button class="app-context-item" id="acm3d-swap-roles">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2"><path d="M7 16V4m0 0L3 8m4-4 4 4m6 0v12m0 0 4-4m-4 4-4-4"/></svg>
                    <span>Ön / Arka Değiştir</span>
                </button>
                <div style="display:flex; gap:4px; padding: 2px 8px 6px;">
                    <button class="acm-grid-btn" id="acm3d-offset-out" title="Dışarıda (+5px)"><span>Dışarıda</span></button>
                    <button class="acm-grid-btn" id="acm3d-offset-flush" title="Yüzeyde (+1px)"><span>Yüzeyde</span></button>
                    <button class="acm-grid-btn" id="acm3d-offset-in" title="İçeride (-3px)"><span>İçeride</span></button>
                </div>
                <button class="app-context-item" id="acm3d-ungroup">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="m10 10 4 4m0-4-4 4"/></svg>
                    <span>Grubu Dağıt</span>
                </button>
                <div class="acm-section-label">✏️ TEKİL ÖGE DÜZENLE</div>
                <div style="display:flex; flex-direction:column; gap:2px; padding: 0 4px 6px;">
                    ${selected3DElements.map((el, i) => `
                        <button class="app-context-item acm3d-sub-edit-btn" data-id="${el.id}" style="padding:4px 8px; font-size:11px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                            <span>${el.isSurfaceBase ? 'Zemin: ' : (el.attachedTo ? 'Ön Yüz: ' : '')}${el.text || el.sourceItemName || el.name || ('Öğe ' + (i+1))}</span>
                        </button>
                    `).join('')}
                </div>
                ` : ''}

                <div class="acm-section-label">↔️ BİRBİRİNE GÖRE HİZALA</div>
                <div class="acm-grid-btns">
                    <button class="acm-grid-btn" id="acm3d-align-left" title="Sola Hizala"><span>Sola</span></button>
                    <button class="acm-grid-btn" id="acm3d-align-center" title="Ortaya Hizala"><span>Ortala</span></button>
                    <button class="acm-grid-btn" id="acm3d-align-right" title="Sağa Hizala"><span>Sağa</span></button>
                    <button class="acm-grid-btn" id="acm3d-align-top" title="Üste Hizala"><span>Üste</span></button>
                    <button class="acm-grid-btn" id="acm3d-align-middle" title="Dikey Ortala"><span>Dikey</span></button>
                    <button class="acm-grid-btn" id="acm3d-align-bottom" title="Alta Hizala"><span>Alta</span></button>
                </div>

                <div class="acm-section-label">📏 ARALIKLARI EŞİTLE</div>
                <button class="app-context-item" id="acm3d-distribute-h">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><line x1="4" y1="3" x2="4" y2="21"/><line x1="20" y1="3" x2="20" y2="21"/><rect x="9" y="7" width="6" height="10" rx="1"/></svg>
                    <span>Yatay Aralıkları Eşitle</span>
                </button>
                <button class="app-context-item" id="acm3d-distribute-v">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><line x1="3" y1="4" x2="21" y2="4"/><line x1="3" y1="20" x2="21" y2="20"/><rect x="7" y="9" width="10" height="6" rx="1"/></svg>
                    <span>Dikey Aralıkları Eşitle</span>
                </button>

                <div class="acm-section-label">📐 AÇI VE BOYUT EŞİTLE</div>
                <button class="app-context-item" id="acm3d-match-angles">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    <span>Açıları Eşitle</span>
                </button>
                <button class="app-context-item" id="acm3d-match-sizes">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                    <span>Boyutları Eşitle</span>
                </button>
                <button class="app-context-item" id="acm3d-multi-center">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
                    <span>Sayfada Ortala</span>
                </button>
                <button class="app-context-item" id="acm3d-multi-ground">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><line x1="2" y1="20" x2="22" y2="20"/><path d="m7 15 5 5 5-5"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                    <span>Zemine Oturt</span>
                </button>

                <div class="acm-section-label">📦 TOPLU İŞLEMLER</div>
                <button class="app-context-item item-lock" id="acm3d-multi-lock">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <span>Toplu Kilitle</span>
                </button>
                <button class="app-context-item" id="acm3d-multi-duplicate">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    <span>Toplu Çoğalt</span>
                </button>
                <div class="acm-divider"></div>
                <button class="app-context-item item-delete" id="acm3d-multi-delete">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    <span>Toplu Sil</span>
                </button>
            `;

            menu.innerHTML = html;
            document.body.appendChild(menu);

            // Akıllı Konumlandırma
            const menuWidth = 195;
            const menuHeight = menu.offsetHeight || 440;
            let posX = (typeof clientX === 'number' && clientX > 0) ? clientX + 10 : 200;
            let posY = (typeof clientY === 'number' && clientY > 0) ? clientY + 10 : 150;

            if (posX + menuWidth > window.innerWidth - 10) posX = window.innerWidth - menuWidth - 10;
            if (posY + menuHeight > window.innerHeight - 10) posY = window.innerHeight - menuHeight - 10;
            if (posX < 10) posX = 10;
            if (posY < 10) posY = 10;

            menu.style.left = posX + 'px';
            menu.style.top = posY + 'px';

            const closeMenu = () => {
                if (menu.parentElement) menu.remove();
                document.removeEventListener('pointerdown', onDocClick, true);
                document.removeEventListener('keydown', onKeyDown, true);
            };

            const onDocClick = (e) => {
                if (e.target && (e.target.closest('#app-custom-context-menu') || menu.contains(e.target))) return;
                closeMenu();
            };
            const onKeyDown = (e) => {
                if (e.key === 'Escape') closeMenu();
            };

            setTimeout(() => {
                document.addEventListener('pointerdown', onDocClick, true);
                document.addEventListener('keydown', onKeyDown, true);
            }, 30);

            // Buton Olayları Bağlama
            menu.querySelector('#acm-close-btn').addEventListener('click', closeMenu);

            // 1. Yüzeye Yapıştır
            const snapBtn = menu.querySelector('#acm3d-snap-surface');
            if (snapBtn) {
                snapBtn.addEventListener('click', () => {
                    if (selected3DElements.length >= 2 && window.ThreeDAlign) {
                        // Tabela/Plaket/Rozet olanı veya metin olmayanı taban al, diğerini üstüne oturt
                        let baseEl = selected3DElements.find(el => el.isSurfaceBase || el.elementType === 'element_3d' || el.shapeMode === 'card' || el.shapeMode === 'coin' || (el.elementType && el.elementType.startsWith('badge_')));
                        if (!baseEl) {
                            baseEl = selected3DElements.find(el => el.elementType !== 'text') || selected3DElements[0];
                        }
                        const childEl = selected3DElements.find(el => el !== baseEl) || selected3DElements[1];

                        window.ThreeDAlign.snapToSurface(childEl, baseEl);
                        this.updateSelectionVisuals();
                    }
                    closeMenu();
                });
            }

            // 2. Birleştir
            const groupBtn = menu.querySelector('#acm3d-group');
            if (groupBtn) {
                groupBtn.addEventListener('click', () => {
                    this.groupSelectedElements();
                    closeMenu();
                });
            }

            // 2.1. Rol Değiştir (Arka Plan ⇄ Ön Yüz)
            const swapBtn = menu.querySelector('#acm3d-swap-roles');
            if (swapBtn) {
                swapBtn.addEventListener('click', () => {
                    if (selected3DElements.length >= 2 && window.ThreeDAlign) {
                        const baseEl = selected3DElements.find(e => e.isSurfaceBase) || selected3DElements[0];
                        const childEl = selected3DElements.find(e => e !== baseEl) || selected3DElements[1];
                        window.ThreeDAlign.swapSurfaceRoles(baseEl, childEl);
                        if (window.ThreeDEngine && typeof window.ThreeDEngine.updateElementSelectorUI === 'function') {
                            window.ThreeDEngine.updateElementSelectorUI();
                        }
                        this.updateSelectionVisuals();
                    }
                    closeMenu();
                });
            }

            // 2.2. Hızlı Yüzey Mesafesi (Dışarıda / Yüzeyde / İçeride)
            const offOut = menu.querySelector('#acm3d-offset-out');
            if (offOut) {
                offOut.addEventListener('click', () => {
                    const baseEl = selected3DElements.find(e => e.isSurfaceBase) || selected3DElements[0];
                    const childEl = selected3DElements.find(e => e !== baseEl) || selected3DElements[1];
                    if (window.ThreeDAlign) {
                        window.ThreeDAlign.setSurfaceOffset(childEl, baseEl, 5.0);
                        if (window.ThreeDEngine && typeof window.ThreeDEngine.updateElementSelectorUI === 'function') {
                            window.ThreeDEngine.updateElementSelectorUI();
                        }
                        this.updateSelectionVisuals();
                    }
                    closeMenu();
                });
            }
            const offFlush = menu.querySelector('#acm3d-offset-flush');
            if (offFlush) {
                offFlush.addEventListener('click', () => {
                    const baseEl = selected3DElements.find(e => e.isSurfaceBase) || selected3DElements[0];
                    const childEl = selected3DElements.find(e => e !== baseEl) || selected3DElements[1];
                    if (window.ThreeDAlign) {
                        window.ThreeDAlign.setSurfaceOffset(childEl, baseEl, 1.0);
                        if (window.ThreeDEngine && typeof window.ThreeDEngine.updateElementSelectorUI === 'function') {
                            window.ThreeDEngine.updateElementSelectorUI();
                        }
                        this.updateSelectionVisuals();
                    }
                    closeMenu();
                });
            }
            const offIn = menu.querySelector('#acm3d-offset-in');
            if (offIn) {
                offIn.addEventListener('click', () => {
                    const baseEl = selected3DElements.find(e => e.isSurfaceBase) || selected3DElements[0];
                    const childEl = selected3DElements.find(e => e !== baseEl) || selected3DElements[1];
                    if (window.ThreeDAlign) {
                        window.ThreeDAlign.setSurfaceOffset(childEl, baseEl, -3.0);
                        if (window.ThreeDEngine && typeof window.ThreeDEngine.updateElementSelectorUI === 'function') {
                            window.ThreeDEngine.updateElementSelectorUI();
                        }
                        this.updateSelectionVisuals();
                    }
                    closeMenu();
                });
            }

            // 2.3. Tekil Alt Öge Seçip Doğrudan Düzenleme
            menu.querySelectorAll('.acm3d-sub-edit-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    if (id && window.ThreeDEngine && typeof window.ThreeDEngine.setActiveElement === 'function') {
                        window.ThreeDEngine.setActiveElement(id, { select: true });
                        if (typeof window.ThreeDEngine.openStudio === 'function') {
                            window.ThreeDEngine.openStudio();
                        }
                    }
                    closeMenu();
                });
            });

            // 3. Grubu Dağıt
            const ungroupBtn = menu.querySelector('#acm3d-ungroup');
            if (ungroupBtn) {
                ungroupBtn.addEventListener('click', () => {
                    this.ungroupElements();
                    closeMenu();
                });
            }

            // 4. Hizalama Butonları
            const alignDirs = ['left', 'center', 'right', 'top', 'middle', 'bottom'];
            alignDirs.forEach(dir => {
                const btn = menu.querySelector('#acm3d-align-' + dir);
                if (btn) {
                    btn.addEventListener('click', () => {
                        if (window.ThreeDAlign) {
                            window.ThreeDAlign.alignElements(selected3DElements, dir);
                            this.updateSelectionVisuals();
                        }
                        closeMenu();
                    });
                }
            });

            // 5. Aralık Dağıtımı
            const distH = menu.querySelector('#acm3d-distribute-h');
            if (distH) {
                distH.addEventListener('click', () => {
                    if (window.ThreeDAlign) {
                        window.ThreeDAlign.distributeElements(selected3DElements, 'horizontal');
                        this.updateSelectionVisuals();
                    }
                    closeMenu();
                });
            }
            const distV = menu.querySelector('#acm3d-distribute-v');
            if (distV) {
                distV.addEventListener('click', () => {
                    if (window.ThreeDAlign) {
                        window.ThreeDAlign.distributeElements(selected3DElements, 'vertical');
                        this.updateSelectionVisuals();
                    }
                    closeMenu();
                });
            }

            // 6. Açı ve Boyut Eşitle
            const matchAng = menu.querySelector('#acm3d-match-angles');
            if (matchAng) {
                matchAng.addEventListener('click', () => {
                    if (window.ThreeDAlign) {
                        window.ThreeDAlign.matchAngles(selected3DElements);
                        this.updateSelectionVisuals();
                    }
                    closeMenu();
                });
            }
            const matchSz = menu.querySelector('#acm3d-match-sizes');
            if (matchSz) {
                matchSz.addEventListener('click', () => {
                    if (window.ThreeDAlign) {
                        window.ThreeDAlign.matchSizes(selected3DElements);
                        this.updateSelectionVisuals();
                    }
                    closeMenu();
                });
            }

            // 7. Sayfada Ortala & Zemine Oturt
            const centerBtn = menu.querySelector('#acm3d-multi-center');
            if (centerBtn) {
                centerBtn.addEventListener('click', () => {
                    if (window.ThreeDAlign) {
                        window.ThreeDAlign.centerInPage(selected3DElements);
                        this.updateSelectionVisuals();
                    }
                    closeMenu();
                });
            }
            const groundBtn = menu.querySelector('#acm3d-multi-ground');
            if (groundBtn) {
                groundBtn.addEventListener('click', () => {
                    if (window.ThreeDAlign) {
                        window.ThreeDAlign.groundElements(selected3DElements);
                        this.updateSelectionVisuals();
                    }
                    closeMenu();
                });
            }

            // 8. Toplu Kilitle
            const lockBtn = menu.querySelector('#acm3d-multi-lock');
            if (lockBtn) {
                lockBtn.addEventListener('click', () => {
                    const anyUnlocked = selected3DElements.some(el => !el.locked);
                    selected3DElements.forEach(el => { el.locked = anyUnlocked; });
                    closeMenu();
                });
            }

            // 9. Toplu Çoğalt
            const dupBtn = menu.querySelector('#acm3d-multi-duplicate');
            if (dupBtn) {
                dupBtn.addEventListener('click', () => {
                    this.duplicateSelectedElements();
                    closeMenu();
                });
            }

            // 10. Toplu Sil
            const delBtn = menu.querySelector('#acm3d-multi-delete');
            if (delBtn) {
                delBtn.addEventListener('click', () => {
                    this.deleteSelectedElements();
                    closeMenu();
                });
            }
        }
    };

    // 🎯 Boş alana tıklandığında çoklu 3D seçim çerçevelerini düşür
    document.addEventListener('pointerdown', (e) => {
        if (selected3DElements.length === 0) return;
        if (e.button !== 0) return;
        if (e.ctrlKey || e.shiftKey) return;
        // Eğer menüye, modal'a, context menüye veya UI kontrolüne tıklandıysa seçimi düşürme
        if (e.target && e.target.closest && e.target.closest(
            '#app-custom-context-menu, .context-menu, .app-context-menu, .three-d-panel, #threeDStudioPanel, ' +
            'button, input, select, textarea, .panel, .sidebar, .three-d-gizmo-tip, .three-d-gizmo-dot, .three-d-gizmo-sun'
        )) {
            return;
        }

        // 🌟 Karma Seçim Koruması: Eğer tıklanan nokta seçili bir 2D öge üzerindeyse seçimi düşürme!
        if (e.target && ((e.target.closest && e.target.closest('.el-selected')) || (Array.isArray(window.selectedElements) && window.selectedElements.some(el => el === e.target || (el && (el.contains(e.target) || e.target.contains(el))))))) {
            return;
        }
        // Eğer tıklanan nokta seçili 3D nesnelerden birinin üzerindeyse seçimi düşürme
        if (window.ThreeDEngine && typeof window.ThreeDEngine.checkHit === 'function') {
            const hit = window.ThreeDEngine.checkHit(e.clientX, e.clientY);
            if (hit) {
                if (selected3DElements.some(item => item.id === hit.id)) return;
                if (hit.groupId) {
                    const all = (typeof window.ThreeDEngine.getElements === 'function') ? window.ThreeDEngine.getElements() : [];
                    const groupMembers = all.filter(item => item.groupId === hit.groupId);
                    if (groupMembers.length > 1) {
                        ThreeDGrouping.setSelected3DElements(groupMembers);
                        return;
                    }
                }
            }
        }
        ThreeDGrouping.clearSelection();
    });

    window.ThreeDGrouping = ThreeDGrouping;

})(window);
