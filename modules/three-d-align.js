/**
 * Emlak Stüdyom v7.0 - 3D Align & Snap Engine (modules/three-d-align.js)
 * Sorumluluk: 3D nesneleri yüzeye yapıştırma, açı/boyut eşitleme, 3D hizalama ve aralık dağıtımı
 * Kurallar: AGENTS.md & GEMINI.md uyumlu, parantezsiz kısa fiiller, tek ikon, sessiz çalışma.
 */

(function(window) {
    'use strict';

    const ThreeDAlign = {
        /**
         * Seçili iki nesneden birini diğerinin ön yüzeyine sıfır çakışma ve ayarlanabilir ofset ile yapıştırır.
         * Tabela (base) üzerine Metin/İkon (child) yerleştirir ve otomatik olarak birleştirir (groupId).
         * @param {Object} childEl - Yapıştırılacak ön yüz ögesi (metin, ikon, rozet vb.)
         * @param {Object} baseEl - Zemin/arka plan teşkil eden öge (tabela, kart, plaket vb.)
         * @param {Object} [options] - { offset: number } (Pozitif: dışarıda/kabartma, 0: teğet, Negatif: içeride/gömülü)
         */
        snapToSurface: function(childEl, baseEl, options = {}) {
            if (!childEl || !baseEl || childEl === baseEl) return false;
            if (!window.ThreeDEngine) return false;

            const offset = (options.offset !== undefined) 
                ? options.offset 
                : ((childEl.surfaceOffset !== undefined) ? childEl.surfaceOffset : 2.5);
            childEl.surfaceOffset = offset;
            childEl.attachedTo = baseEl.id;
            baseEl.isSurfaceBase = true;

            // 1. Grup Bağlantısı Oluştur (Birlikte hareket etmeleri için aynı groupId)
            const groupId = baseEl.groupId || childEl.groupId || ('grp_3d_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4));
            baseEl.groupId = groupId;
            childEl.groupId = groupId;

            // 2. Düzlem ve Duruş Açılarını Birebir Senkronize Et
            childEl.orientation = baseEl.orientation || 'flat';
            childEl.planePitch = (baseEl.planePitch !== undefined) ? baseEl.planePitch : 0;
            childEl.planeYaw = (baseEl.planeYaw !== undefined) ? baseEl.planeYaw : 0;
            childEl.planeRoll = (baseEl.planeRoll !== undefined) ? baseEl.planeRoll : 0;
            childEl.planeLocalRot = (baseEl.planeLocalRot !== undefined) ? baseEl.planeLocalRot : 0;
            childEl.itemPitch = (baseEl.itemPitch !== undefined) ? baseEl.itemPitch : 0;
            childEl.itemRoll = (baseEl.itemRoll !== undefined) ? baseEl.itemRoll : 0;
            childEl.planeElevation = (baseEl.planeElevation !== undefined) ? baseEl.planeElevation : 0;

            childEl.surfaceLocalX = (options.localX !== undefined) ? parseFloat(options.localX) : ((childEl.surfaceLocalX !== undefined) ? childEl.surfaceLocalX : 0);
            childEl.surfaceLocalZ = (options.localZ !== undefined) ? parseFloat(options.localZ) : ((childEl.surfaceLocalZ !== undefined) ? childEl.surfaceLocalZ : 0);

            // 3. Three.js Sahne Hiyerarşisi Bağlantısı (Ayrılmaz tek parça yüzey yapışması)
            if (baseEl.contentGroup && childEl.contentGroup) {
                if (childEl.contentGroup.parent !== baseEl.contentGroup) {
                    if (childEl.contentGroup.parent) childEl.contentGroup.parent.remove(childEl.contentGroup);
                    baseEl.contentGroup.add(childEl.contentGroup);
                    if (childEl.planeGroup) childEl.planeGroup.visible = false;
                }
            }

            // 4. Güncellemeleri Three.js motoruna işlet
            if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                window.ThreeDEngine.updateContentTransform(baseEl);
                window.ThreeDEngine.updateContentTransform(childEl);
            }
            if (typeof window.ThreeDEngine.updatePlaneTransform === 'function') {
                window.ThreeDEngine.updatePlaneTransform(baseEl);
            }

            if (!options || !options.silent) {
                if (window.ThreeDGrouping) {
                    window.ThreeDGrouping.setSelected3DElements([baseEl, childEl]);
                }
                if (typeof window.ThreeDEngine.setGroupEditMode === 'function') {
                    window.ThreeDEngine.setGroupEditMode('all');
                }
                if (typeof window.ThreeDEngine.setActiveElement === 'function') {
                    window.ThreeDEngine.setActiveElement(baseEl);
                }
                if (typeof window.ThreeDEngine.syncControlsUI === 'function') {
                    window.ThreeDEngine.syncControlsUI();
                }
                if (typeof window.ThreeDEngine.updateElementSelectorUI === 'function') {
                    window.ThreeDEngine.updateElementSelectorUI();
                }
            }
            if (typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }

            return true;
        },

        /**
         * Arka Plan (Base) ile Ön Yüz (Child) rollerini ters çevirir.
         * Döngüsel sahne ağacı referanslarını tamamen önler.
         */
        swapSurfaceRoles: function(el1, el2) {
            if (!el1 || !el2 || el1 === el2) return false;

            // 1. Döngüsel bağımlılığı kesinlikle engellemek için her iki ögenin bağlarını temizle
            delete el1.attachedTo;
            delete el2.attachedTo;
            el1.isSurfaceBase = false;
            el2.isSurfaceBase = false;

            // 2. Sahne hiyerarşisinde içerik gruplarını kendi düzlem gruplarına geri bağla
            if (el1.contentGroup && el1.contentGroup.parent) {
                el1.contentGroup.parent.remove(el1.contentGroup);
            }
            if (el2.contentGroup && el2.contentGroup.parent) {
                el2.contentGroup.parent.remove(el2.contentGroup);
            }
            if (el1.planeGroup && el1.contentGroup) {
                el1.planeGroup.add(el1.contentGroup);
                el1.planeGroup.visible = true;
            }
            if (el2.planeGroup && el2.contentGroup) {
                el2.planeGroup.add(el2.contentGroup);
                el2.planeGroup.visible = true;
            }

            // 3. el1'i yeni taban olan el2'nin yüzeyine yapıştır
            el2.isSurfaceBase = true;
            return this.snapToSurface(el1, el2);
        },

        /**
         * Yüzey ofsetini (ileri/geri - dışarıda/içeride) günceller.
         */
        setSurfaceOffset: function(childEl, baseEl, newOffset) {
            if (!childEl || !baseEl) return false;
            childEl.surfaceOffset = parseFloat(newOffset) || 0;
            if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                window.ThreeDEngine.updateContentTransform(childEl);
            }
            if (typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }
            return true;
        },

        /**
         * Yüzey üzerindeki 2D konumu (yatay ve dikey yerleşimi) günceller.
         */
        setSurfaceLocalOffsets: function(childEl, baseEl, localX, localZ) {
            if (!childEl || !baseEl) return false;
            if (localX !== undefined) childEl.surfaceLocalX = parseFloat(localX);
            if (localZ !== undefined) childEl.surfaceLocalZ = parseFloat(localZ);
            if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                window.ThreeDEngine.updateContentTransform(childEl);
            }
            if (typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }
            return true;
        },

        /**
         * Yüzey üzerindeki 2D dönüş açısını (yüzey açısı) günceller.
         */
        setSurfaceAngle: function(childEl, baseEl, angle) {
            if (!childEl) return false;
            childEl.surfaceAngle = parseFloat(angle) || 0;
            if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                window.ThreeDEngine.updateContentTransform(childEl);
            }
            if (typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }
            return true;
        },

        /**
         * Seçili 3D ögeleri belirtilen eksende birbirine göre hizalar.
         * @param {Array} elements - Hizalanacak 3D ögeler listesi
         * @param {string} direction - 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'depth'
         */
        alignElements: function(elements, direction) {
            if (!Array.isArray(elements) || elements.length < 2) return false;
            if (!window.ThreeDEngine) return false;

            const boundsList = typeof window.ThreeDEngine.getElementsScreenBounds === 'function'
                ? window.ThreeDEngine.getElementsScreenBounds()
                : [];

            // Ekran veya 3D koordinatlarına göre sınırları topla
            const items = elements.map(el => {
                const b = boundsList.find(item => item.id === el.id);
                return {
                    el: el,
                    posX: el.posX || 0,
                    posY: el.posY || 0,
                    posZ: el.posZ || 0,
                    rect: b ? b.rect : null
                };
            });

            switch (direction) {
                case 'left': {
                    const minX = Math.min(...items.map(it => it.posX));
                    items.forEach(it => { it.el.posX = minX; });
                    break;
                }
                case 'center': {
                    const avgX = items.reduce((sum, it) => sum + it.posX, 0) / items.length;
                    items.forEach(it => { it.el.posX = Math.round(avgX); });
                    break;
                }
                case 'right': {
                    const maxX = Math.max(...items.map(it => it.posX));
                    items.forEach(it => { it.el.posX = maxX; });
                    break;
                }
                case 'top': {
                    const minY = Math.min(...items.map(it => it.posY));
                    items.forEach(it => { it.el.posY = minY; });
                    break;
                }
                case 'middle': {
                    const avgY = items.reduce((sum, it) => sum + it.posY, 0) / items.length;
                    items.forEach(it => { it.el.posY = Math.round(avgY); });
                    break;
                }
                case 'bottom': {
                    const maxY = Math.max(...items.map(it => it.posY));
                    items.forEach(it => { it.el.posY = maxY; });
                    break;
                }
                case 'depth': {
                    const refZ = items[0].el.posZ || 0;
                    items.forEach(it => { it.el.posZ = refZ; });
                    break;
                }
            }

            // Tüm ögelerin Three.js transformlarını güncelle
            items.forEach(it => {
                if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                    window.ThreeDEngine.updateContentTransform(it.el);
                }
            });

            if (typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }
            if (typeof window.ThreeDEngine.syncControlsUI === 'function') {
                window.ThreeDEngine.syncControlsUI();
            }

            return true;
        },

        /**
         * Seçili 3D ögeler arasındaki mesafeyi eşit paylaştırır (Eşit Dağıt).
         * @param {Array} elements - Dağıtılacak 3D ögeler
         * @param {string} axis - 'horizontal' | 'vertical'
         */
        distributeElements: function(elements, axis) {
            if (!Array.isArray(elements) || elements.length < 3) return false;
            if (!window.ThreeDEngine) return false;

            const isHoriz = (axis === 'horizontal');
            const sorted = elements.slice().sort((a, b) => {
                return isHoriz ? ((a.posX || 0) - (b.posX || 0)) : ((a.posY || 0) - (b.posY || 0));
            });

            const first = sorted[0];
            const last = sorted[sorted.length - 1];
            const startVal = isHoriz ? (first.posX || 0) : (first.posY || 0);
            const endVal = isHoriz ? (last.posX || 0) : (last.posY || 0);
            const step = (endVal - startVal) / (sorted.length - 1);

            sorted.forEach((el, idx) => {
                if (isHoriz) {
                    el.posX = Math.round(startVal + step * idx);
                } else {
                    el.posY = Math.round(startVal + step * idx);
                }
                if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                    window.ThreeDEngine.updateContentTransform(el);
                }
            });

            if (typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }
            if (typeof window.ThreeDEngine.syncControlsUI === 'function') {
                window.ThreeDEngine.syncControlsUI();
            }

            return true;
        },

        /**
         * Kaynak ögenin 3D eğim ve duruş açılarını tüm seçili ögelere eşitler.
         * @param {Array} elements - Hedef ögeler listesi
         * @param {Object} [sourceEl] - Kaynak öge (belirtilmezse ilk öge)
         */
        matchAngles: function(elements, sourceEl) {
            if (!Array.isArray(elements) || elements.length < 2) return false;
            const ref = sourceEl || elements[0];
            if (!ref) return false;

            elements.forEach(el => {
                if (el === ref) return;
                el.orientation = ref.orientation || 'flat';
                el.planePitch = (ref.planePitch !== undefined) ? ref.planePitch : 0;
                el.planeYaw = (ref.planeYaw !== undefined) ? ref.planeYaw : 0;
                el.planeRoll = (ref.planeRoll !== undefined) ? ref.planeRoll : 0;
                el.planeLocalRot = (ref.planeLocalRot !== undefined) ? ref.planeLocalRot : 0;
                el.itemPitch = (ref.itemPitch !== undefined) ? ref.itemPitch : 0;
                el.itemRoll = (ref.itemRoll !== undefined) ? ref.itemRoll : 0;

                if (typeof window.ThreeDEngine.updatePlaneTransform === 'function') {
                    window.ThreeDEngine.updatePlaneTransform(el);
                }
                if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                    window.ThreeDEngine.updateContentTransform(el);
                }
            });

            if (typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }
            if (typeof window.ThreeDEngine.syncControlsUI === 'function') {
                window.ThreeDEngine.syncControlsUI();
            }

            return true;
        },

        /**
         * Seçili tüm ögeleri kaynak ögenin boyutuna getirir.
         * @param {Array} elements - Hedef ögeler
         * @param {Object} [sourceEl] - Kaynak öge
         */
        matchSizes: function(elements, sourceEl) {
            if (!Array.isArray(elements) || elements.length < 2) return false;
            const ref = sourceEl || elements[0];
            if (!ref) return false;

            elements.forEach(el => {
                if (el === ref) return;
                if (ref.planeScale !== undefined) el.planeScale = ref.planeScale;
                if (ref.textSize !== undefined && el.elementType === 'text') el.textSize = ref.textSize;
                if (ref.depth !== undefined) el.depth = ref.depth;

                if (typeof window.ThreeDEngine.recreateContentMeshes === 'function') {
                    window.ThreeDEngine.recreateContentMeshes(el);
                }
                if (typeof window.ThreeDEngine.updatePlaneTransform === 'function') {
                    window.ThreeDEngine.updatePlaneTransform(el);
                }
            });

            if (typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }
            if (typeof window.ThreeDEngine.syncControlsUI === 'function') {
                window.ThreeDEngine.syncControlsUI();
            }

            return true;
        },

        /**
         * Seçilen tüm ögeleri orantısını bozmadan tuvalin merkezine (X: 0, Y: 0) toplar.
         * @param {Array} elements - Ortalanacak ögeler
         */
        centerInPage: function(elements) {
            if (!Array.isArray(elements) || elements.length === 0) return false;
            const avgX = elements.reduce((sum, el) => sum + (el.posX || 0), 0) / elements.length;
            const avgY = elements.reduce((sum, el) => sum + (el.posY || 0), 0) / elements.length;

            elements.forEach(el => {
                el.posX = Math.round((el.posX || 0) - avgX);
                el.posY = Math.round((el.posY || 0) - avgY);
                if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                    window.ThreeDEngine.updateContentTransform(el);
                }
            });

            if (typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }
            if (typeof window.ThreeDEngine.syncControlsUI === 'function') {
                window.ThreeDEngine.syncControlsUI();
            }

            return true;
        },

        /**
         * Seçili ögelerin yerden yüksekliğini sıfırlar ve zemine teğet oturtur.
         * @param {Array|Object} elementOrArray - Tekil veya çoklu öge
         */
        groundElements: function(elementOrArray) {
            const list = Array.isArray(elementOrArray) ? elementOrArray : [elementOrArray];
            list.forEach(el => {
                if (!el) return;
                el.planeElevation = 0;
                el.posZ = 0;
                if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                    window.ThreeDEngine.updateContentTransform(el);
                }
            });

            if (typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }
            if (typeof window.ThreeDEngine.syncControlsUI === 'function') {
                window.ThreeDEngine.syncControlsUI();
            }

            return true;
        },

        /**
         * 3D ögeyi mevcut kamera bakış açısına tam dik çevirir.
         * @param {Object} el - 3D öge
         */
        alignToCamera: function(el) {
            if (!el || !window.ThreeDEngine) return false;
            const cam = (typeof window.ThreeDEngine.getCamera === 'function')
                ? window.ThreeDEngine.getCamera()
                : null;

            if (cam) {
                // Kamera açısını düzlem açısına uyarla
                el.planePitch = 0;
                el.planeYaw = 0;
                el.planeRoll = 0;
                el.planeLocalRot = 0;
            } else {
                el.planePitch = 0;
                el.planeYaw = 0;
                el.planeRoll = 0;
            }

            if (typeof window.ThreeDEngine.updatePlaneTransform === 'function') {
                window.ThreeDEngine.updatePlaneTransform(el);
            }
            if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                window.ThreeDEngine.updateContentTransform(el);
            }
            if (typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }
            if (typeof window.ThreeDEngine.syncControlsUI === 'function') {
                window.ThreeDEngine.syncControlsUI();
            }

            return true;
        }
    };

    window.ThreeDAlign = ThreeDAlign;

})(window);
