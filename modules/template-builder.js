/**
 * ========================================================
 * EMLAK STÜDYOM - ŞABLON OLUŞTURUCU (TEMPLATE BUILDER)
 * modules/template-builder.js
 * ========================================================
 */

(function(window) {
    'use strict';

    const TemplateBuilder = {
        currentRatio: '16:9',
        selectedFrame: null,
        customTemplates: [],
        resizingFrame: null,
        shapes: (typeof window !== 'undefined' && window.TemplateShapesData) ? window.TemplateShapesData : [],
        activeShapeFilter: 'all',
        shapeSearchQuery: '',

        bgPresets: (typeof window !== 'undefined' && window.TemplateBgData) ? window.TemplateBgData : [],
        isBgPaletteOpen: false,
        activeBgFilter: 'all',
        userChosenBg: null,

        layouts: [],
        activeLayoutFilter: 'all',
        layoutSearchQuery: '',

        /**
         * Hazır Düzenler ve Portföy Vitrini Şablonlarını Birleştir
         */
        getCombinedLayouts: function() {
            const baseLayouts = (typeof window !== 'undefined' && Array.isArray(window.TemplateLayoutsData)) ? window.TemplateLayoutsData : [];
            const portfolioPresets = (typeof window !== 'undefined' && Array.isArray(window.PortfolioPresetsData)) ? window.PortfolioPresetsData : [];
            return [].concat(portfolioPresets, baseLayouts);
        },

        /**
         * Modülü Başlat
         */
        init: function() {
            if ((!this.shapes || this.shapes.length === 0) && typeof window !== 'undefined' && window.TemplateShapesData) {
                this.shapes = window.TemplateShapesData;
            }
            if ((!this.bgPresets || this.bgPresets.length === 0) && typeof window !== 'undefined' && window.TemplateBgData) {
                this.bgPresets = window.TemplateBgData;
            }
            if (!this.layouts || this.layouts.length === 0) {
                this.layouts = this.getCombinedLayouts();
            }
            this.loadCustomTemplates();
            this.bindGlobalEvents();
            this.renderSavedTemplatesList();
            this.renderShapeSelector();
            this.renderBackgroundPalette();
            this.renderLayoutsSelector();
        },

        /**
         * Sekme Açıldığında Otomatik Tuval Başlatıcı
         * Kullanıcı Şablon Oluşturucu sekmesine tıkladığında varsayılan 1920x1080 tuvali hazırlar
         */
        onTabActivated: function() {
            const cContainer = document.getElementById('canvas-container');

            // Kullanıcı daha önce bir oran seçmediyse varsayılan 16:9 yap, seçtiyse o oranı koru
            if (!this.currentRatio) {
                this.setCanvasRatio('16:9');
            } else {
                this.setCanvasRatio(this.currentRatio);
            }

            // Varsayılan tuval arka planı BEYAZ kalsın; sadece kullanıcı paletten veya seçiciden tıklarsa değişsin
            if (cContainer) {
                const bg = cContainer.style.backgroundColor;
                const bgImg = cContainer.style.backgroundImage;
                if (this.userChosenBg) {
                    this.setCanvasBackground(this.userChosenBg.type, this.userChosenBg.value, false);
                } else if ((!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') && (!bgImg || bgImg === 'none')) {
                    this.setCanvasBackground('color', '#ffffff', false);
                }
            }

            // Düzen ve Arka plan verilerini tazele
            if (!this.layouts || this.layouts.length === 0) {
                this.layouts = this.getCombinedLayouts();
                this.renderLayoutsSelector();
            }
            if ((!this.bgPresets || this.bgPresets.length === 0) && typeof window !== 'undefined' && window.TemplateBgData) {
                this.bgPresets = window.TemplateBgData;
                this.renderBackgroundPalette();
            }

            this.updateDockControls(false);

            setTimeout(() => {
                document.querySelectorAll('.tb-image-frame.has-image').forEach(f => {
                    this.applyImageZoomPan(f);
                });
            }, 60);
        },

        /**
         * Global Olayları Dinle
         */
        bindGlobalEvents: function() {
            // Tuvalde boş bir yere tıklandığında çerçeve seçimini kaldır
            const cContainer = document.getElementById('canvas-container');
            if (cContainer) {
                cContainer.addEventListener('mousedown', (e) => {
                    if (e.target.closest && e.target.closest('.three-d-gizmo-overlay, .tb-3d-gizmo, .three-d-gizmo-tip, .three-d-gizmo-dot, .three-d-gizmo-arc, .three-d-gizmo-hit-line, .three-d-gizmo-origin-dot, .three-d-gizmo-close-btn')) {
                        return;
                    }
                    if (window.Template3DFrame && window.Template3DFrame.isInteracting) {
                        return;
                    }
                    if (e.target === cContainer || e.target.id === 'photo-layer' || e.target.id === 'draw-layer') {
                        this.deselectFrame();
                    }
                });
            }

            // Klavyeden Delete / Backspace ile seçili çerçeveyi sil
            window.addEventListener('keydown', (e) => {
                if (this.selectedFrame && (e.key === 'Delete' || e.key === 'Backspace')) {
                    const activeTag = document.activeElement ? document.activeElement.tagName : '';
                    if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA' && !document.activeElement.isContentEditable) {
                        e.preventDefault();
                        this.deleteSelectedFrame();
                    }
                }
            });

            // Yan panel kaydırıcıları (slider) ve renk seçicileri bırakıldığında (change) geçmişe kaydet
            ['tbFrameRadius', 'tbFrameBorderWidth', 'tbFrameBorderColor', 'tbFrameShadow', 'tbFrameZoom', 'tbFramePanX', 'tbFramePanY', 'tbFrameRotation', 'tbFrameDepthColor'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener('change', () => {
                        if (typeof window.recordHistory === 'function') {
                            window.recordHistory('Çerçeve Ayarları Güncellendi');
                        }
                    });
                }
            });
        },

        /**
         * 1. AŞAMA: Tuval En-Boy Oranı & Boyutu Ayarla
         */
        setCanvasRatio: function(ratioKey, customW, customH) {
            let targetW = 1920;
            let targetH = 1080;
            let formatName = '16:9 Full HD (YouTube/Banner)';

            if (ratioKey === '1:1') {
                targetW = 1080; targetH = 1080;
                formatName = '1:1 Instagram Post (Kare)';
            } else if (ratioKey === '9:16') {
                targetW = 1080; targetH = 1920;
                formatName = '9:16 Instagram/TikTok Story';
            } else if (ratioKey === '4:5') {
                targetW = 1080; targetH = 1350;
                formatName = '4:5 Instagram Portrait';
            } else if (ratioKey === '16:9') {
                targetW = 1920; targetH = 1080;
                formatName = '16:9 Full HD (YouTube/Banner)';
            } else if (ratioKey === 'custom' && customW && customH) {
                targetW = parseInt(customW) || 1920;
                targetH = parseInt(customH) || 1080;
                formatName = 'Özel Boyut';
            }

            this.currentRatio = ratioKey;
            window.userHasManuallyChangedFormat = true;

            // 1. EXPORT_FORMATS nesnesine özel formatı veya boyutu ekle
            if (typeof EXPORT_FORMATS !== 'undefined') {
                if (formatName === 'Özel Boyut') {
                    EXPORT_FORMATS['Özel Boyut'] = { w: targetW, h: targetH, icon: '📐' };
                }
            }

            // 2. previewFormat ve exportFormat dropdownlarını güncelle
            const prv = document.getElementById('previewFormat');
            const exp = document.getElementById('exportFormat');
            [prv, exp].forEach(sel => {
                if (sel) {
                    if (formatName === 'Özel Boyut') {
                        let opt = sel.querySelector('option[value="Özel Boyut"]');
                        if (!opt) {
                            opt = document.createElement('option');
                            opt.value = 'Özel Boyut';
                            sel.appendChild(opt);
                        }
                        opt.textContent = `📐 Özel Boyut — ${targetW}x${targetH}`;
                    }
                    sel.value = formatName;
                }
            });

            // 3. Global değişkenleri güncelle
            window.uploadedImgW = targetW;
            window.uploadedImgH = targetH;

            // 4. Tuval elemanlarını güncelle
            const cContainer = document.getElementById('canvas-container');
            if (cContainer) {
                cContainer.style.width = targetW + 'px';
                cContainer.style.height = targetH + 'px';
            }

            if (typeof window.canvasEl !== 'undefined' && window.canvasEl) {
                window.canvasEl.style.width = targetW + 'px';
                window.canvasEl.style.height = targetH + 'px';
            }

            const drawCanvas = document.getElementById('draw-layer');
            if (drawCanvas) {
                drawCanvas.width = targetW;
                drawCanvas.height = targetH;
                drawCanvas.style.width = targetW + 'px';
                drawCanvas.style.height = targetH + 'px';
            }

            // 5. Diğer motorları haberdar et (Three.js ve PixiJS)
            if (window.SaberEngine && typeof window.SaberEngine.resize === 'function') {
                window.SaberEngine.resize(targetW, targetH);
            }
            if (window.ThreeDEngine && typeof window.ThreeDEngine.resize === 'function') {
                window.ThreeDEngine.resize(targetW, targetH);
            }

            // 6. Varsa aktif bilgi kartını yeni tuval boyutuna uyarla
            if (window.TemplateInfoCard && typeof window.TemplateInfoCard.repositionCard === 'function') {
                window.TemplateInfoCard.repositionCard(targetW, targetH);
            }

            // 7. Tuvali önizleme alanına otomatik sığdır
            if (typeof window.resizeCanvas === 'function') {
                window.resizeCanvas();
            }

            // 8. Çizimleri tekrar çiz
            if (typeof window.redrawAll === 'function') {
                window.redrawAll();
            }

            // 9. Boş durum kartlarını güncelle ve kaldır
            if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
                window.CanvasEmptyState.dismiss();
            } else if (window.CanvasEmptyState && typeof window.CanvasEmptyState.updateState === 'function') {
                window.CanvasEmptyState.updateState();
            }

            // 10. Aktif buton görselini güncelle
            document.querySelectorAll('.tb-ratio-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.ratio === ratioKey);
            });
        },

        /**
         * 1. AŞAMA: Tuval Arka Plan Rengi & Gradyan
         */
        setCanvasBackground: function(type, val, isUserAction = false) {
            const cContainer = document.getElementById('canvas-container');
            if (!cContainer) return;

            const pLayer = document.getElementById('photo-layer');

            if (type === 'color') {
                cContainer.style.setProperty('background-color', val, 'important');
                cContainer.style.setProperty('background-image', 'none', 'important');
                if (pLayer) {
                    pLayer.style.setProperty('background-color', 'transparent', 'important');
                    if (!window.uploadedImgUrl || pLayer.style.backgroundImage === 'none') {
                        pLayer.style.setProperty('background-image', 'none', 'important');
                    }
                }
            } else if (type === 'gradient') {
                cContainer.style.setProperty('background-image', val, 'important');
                cContainer.style.setProperty('background-color', 'transparent', 'important');
                if (pLayer) {
                    pLayer.style.setProperty('background-color', 'transparent', 'important');
                    if (!window.uploadedImgUrl || pLayer.style.backgroundImage === 'none') {
                        pLayer.style.setProperty('background-image', 'none', 'important');
                    }
                }
            } else if (type === 'transparent') {
                cContainer.style.setProperty('background-color', 'transparent', 'important');
                cContainer.style.setProperty('background-image', 'none', 'important');
                if (pLayer) {
                    pLayer.style.setProperty('background-color', 'transparent', 'important');
                    if (!window.uploadedImgUrl || pLayer.style.backgroundImage === 'none') {
                        pLayer.style.setProperty('background-image', 'none', 'important');
                    }
                }
            }

            const colorInput = document.getElementById('tbCanvasBgColor');
            if (colorInput && type === 'color' && typeof val === 'string' && val.startsWith('#')) {
                colorInput.value = val;
            }

            // Sol panel ve dışa aktarma paneli renk seçicilerini senkronize et
            const generalCanvasBg = document.getElementById('canvasBgColor');
            if (generalCanvasBg && type === 'color' && typeof val === 'string' && val.startsWith('#')) {
                generalCanvasBg.value = val;
            }
            const exportBgColor = document.getElementById('exportBgColor');
            if (exportBgColor && type === 'color' && typeof val === 'string' && val.startsWith('#')) {
                exportBgColor.value = val;
            }

            if (isUserAction) {
                this.userChosenBg = { type: type, value: val };
            }

            // Boş tuval başlangıç ekranını anında kapat ve kalıcı olarak kaldır
            if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
                window.CanvasEmptyState.dismiss();
            } else if (window.CanvasEmptyState && typeof window.CanvasEmptyState.hide === 'function') {
                window.CanvasEmptyState.hide();
            }

            // 3D motor render tazele
            if (window.ThreeDEngine && typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }

            // Bilgi Kartını Arka Planla Otomatik Senkronize Et
            if (window.TemplateInfoCard && typeof window.TemplateInfoCard.applyMatchingThemeForBackground === 'function') {
                window.TemplateInfoCard.applyMatchingThemeForBackground(type, val);
            }

            try {
                localStorage.setItem('emlakstudiom_tb_bgcolor', val);
                if (type === 'color') localStorage.setItem('emlakstudiom_canvasBgColor', val);
            } catch (e) {}

            if (typeof window.requestAutoSave === 'function') {
                window.requestAutoSave();
            }
        },

        resetUserBg: function() {
            this.userChosenBg = null;
            this.setCanvasBackground('color', '#ffffff', false);
            document.querySelectorAll('.tb-palette-chip').forEach(c => c.classList.remove('active'));
        },

        /**
         * Açılır Hazır Arka Plan Paletini Aç / Kapat
         */
        toggleBgPalette: function() {
            const wrapper = document.getElementById('tbBgPaletteWrapper');
            if (!wrapper) return;
            this.isBgPaletteOpen = !this.isBgPaletteOpen;
            wrapper.style.display = this.isBgPaletteOpen ? 'block' : 'none';
            if (this.isBgPaletteOpen) {
                this.renderBackgroundPalette();
            }
        },

        filterBgPalette: function(cat) {
            let normalized = cat;
            if (cat === 'gradient') normalized = 'gradyan';
            else if (cat === 'dark') normalized = 'koyu';
            else if (cat === 'vibrant') normalized = 'canli';

            this.activeBgFilter = normalized;
            document.querySelectorAll('#tbBgCatTabs .tb-bg-cat-btn').forEach(btn => {
                const bCat = btn.dataset.cat;
                const isMatch = (bCat === cat) || (bCat === normalized) ||
                    (cat === 'gradyan' && bCat === 'gradient') ||
                    (cat === 'koyu' && bCat === 'dark') ||
                    (cat === 'canli' && bCat === 'vibrant');
                btn.classList.toggle('active', isMatch);
            });
            this.renderBackgroundPalette();
        },

        renderBackgroundPalette: function() {
            const grid = document.getElementById('tbBgPaletteGrid');
            if (!grid) return;

            if ((!this.bgPresets || this.bgPresets.length === 0) && typeof window !== 'undefined' && window.TemplateBgData) {
                this.bgPresets = window.TemplateBgData;
            }

            let list = this.bgPresets || [];
            if (this.activeBgFilter && this.activeBgFilter !== 'all') {
                const targetCat = this.activeBgFilter.toLowerCase();
                list = list.filter(item => {
                    if (!item.category) return false;
                    const c = item.category.toLowerCase();
                    if (targetCat === 'gradyan' || targetCat === 'gradient') {
                        return c === 'gradyan' || c === 'gradient' || item.type === 'gradient';
                    }
                    if (targetCat === 'koyu' || targetCat === 'dark') {
                        return c === 'koyu' || c === 'dark';
                    }
                    if (targetCat === 'canli' || targetCat === 'vibrant') {
                        return c === 'canli' || c === 'vibrant';
                    }
                    if (targetCat === 'pastel') {
                        return c === 'pastel';
                    }
                    return c === targetCat;
                });
            }

            grid.innerHTML = '';
            list.forEach(p => {
                const chip = document.createElement('div');
                chip.className = 'tb-palette-chip';
                chip.title = p.name;
                chip.dataset.id = p.id;

                if (p.type === 'color') {
                    chip.style.backgroundColor = p.value;
                } else if (p.type === 'gradient') {
                    chip.style.backgroundImage = p.value;
                }

                chip.onclick = (e) => {
                    if (e) e.stopPropagation();
                    if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
                        window.CanvasEmptyState.dismiss();
                    }
                    this.setCanvasBackground(p.type, p.value, true);
                    document.querySelectorAll('.tb-palette-chip').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                };

                grid.appendChild(chip);
            });
        },

        /**
         * Tam Daire Görsel Çerçevesi Ekle (1:1 Daire)
         */
        createCircleFrame: function() {
            const cContainer = document.getElementById('canvas-container');
            const cH = cContainer ? (parseFloat(cContainer.style.height) || cContainer.offsetHeight || 1080) : 1080;
            const size = Math.min(Math.round(cH * 0.45), 450);
            return this.createImageFrame({
                width: size,
                height: size,
                isCircle: 'true',
                radius: 999,
                label: 'Tam Daire'
            });
        },

        /**
         * Altıgen Görsel Çerçevesi Ekle (1:1 Dikey Altıgen)
         */
        createHexagonFrame: function() {
            const cContainer = document.getElementById('canvas-container');
            const cH = cContainer ? (parseFloat(cContainer.style.height) || cContainer.offsetHeight || 1080) : 1080;
            const size = Math.min(Math.round(cH * 0.45), 450);
            return this.createImageFrame({
                width: size,
                height: size,
                radius: 0,
                shape: 'polygon-hexagon',
                label: 'Altıgen',
                isPolygon: 'true',
                polygonClip: 'polygon(50% 2%, 96% 26%, 96% 74%, 50% 98%, 4% 74%, 4% 26%)',
                polygonPoints: [
                    { x: 50, y: 2 },
                    { x: 96, y: 26 },
                    { x: 96, y: 74 },
                    { x: 50, y: 98 },
                    { x: 4, y: 74 },
                    { x: 4, y: 26 }
                ]
            });
        },

        /**
         * 2. AŞAMA: Akıllı Görsel Çerçevesi Ekle (Image Frame / Photo Holder)
         */
        createImageFrame: function(opts = {}) {
            if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
                window.CanvasEmptyState.dismiss();
            }
            const cContainer = document.getElementById('canvas-container');
            const uiLayer = document.getElementById('ui-layer') || cContainer;
            if (!cContainer || !uiLayer) return null;

            const cW = parseFloat(cContainer.style.width) || cContainer.offsetWidth || 1920;
            const cH = parseFloat(cContainer.style.height) || cContainer.offsetHeight || 1080;

            const isCirc = (opts.isCircle === 'true' || opts.isCircle === true || (parseInt(opts.radius) >= 300));
            const defW = opts.width || Math.min(Math.round(cW * 0.45), 600);
            const defH = opts.height || (isCirc ? defW : Math.min(Math.round(cH * 0.45), 450));
            const finalW = isCirc ? Math.min(defW, defH) : defW;
            const finalH = isCirc ? Math.min(defW, defH) : defH;
            const defX = opts.x !== undefined ? opts.x : Math.max(32, Math.round((cW - finalW) / 2));
            const defY = opts.y !== undefined ? opts.y : Math.max(32, Math.round((cH - finalH) / 2));

            const frame = document.createElement('div');
            frame.className = 'draggable canvas-el tb-image-frame';
            frame.dataset.label = opts.label || (isCirc ? 'Tam Daire' : 'Görsel Çerçevesi');
            frame.dataset.frameId = 'frame_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            frame.dataset.isCircle = isCirc ? 'true' : 'false';
            frame.dataset.radius = opts.radius !== undefined ? opts.radius : (isCirc ? 999 : (opts.blend ? 0 : 14));
            frame.dataset.borderWidth = opts.borderWidth !== undefined ? opts.borderWidth : (opts.blend ? 0 : 0);
            frame.dataset.borderColor = opts.borderColor || '#ffffff';
            frame.dataset.shadow = opts.shadow !== undefined ? opts.shadow : (opts.blend ? 0 : 12);
            frame.dataset.blendMode = opts.blend || 'none';
            frame.dataset.shape = opts.shape || 'none';
            frame.dataset.rotation = opts.rotation || 0;
            frame.dataset.effect = opts.effect || 'none';
            frame.dataset.imgZoom = opts.imgZoom !== undefined ? opts.imgZoom : 1.0;
            frame.dataset.imgPanX = opts.imgPanX !== undefined ? opts.imgPanX : 0;
            frame.dataset.imgPanY = opts.imgPanY !== undefined ? opts.imgPanY : 0;
            frame.dataset.pitch = opts.pitch !== undefined ? opts.pitch : 0;
            frame.dataset.yaw = opts.yaw !== undefined ? opts.yaw : 0;
            frame.dataset.elevation = opts.elevation !== undefined ? opts.elevation : 0;
            frame.dataset.perspective = opts.perspective !== undefined ? opts.perspective : 1000;
            frame.dataset.depth = opts.depth !== undefined ? opts.depth : 0;
            frame.dataset.depthColor = opts.depthColor || '#334155';
            frame.dataset.isPolygon = opts.isPolygon || (opts.polygonClip ? 'true' : 'false');
            frame.dataset.polygonClip = opts.polygonClip || '';
            frame.dataset.polygonPoints = opts.polygonPoints ? (typeof opts.polygonPoints === 'string' ? opts.polygonPoints : JSON.stringify(opts.polygonPoints)) : '';
            if (frame.dataset.shape && frame.dataset.shape !== 'none' && !frame.dataset.polygonClip) {
                const shapeList = this.shapes || (typeof window !== 'undefined' && window.TemplateShapesData) || [];
                const shapeDef = shapeList.find(s => s.id === frame.dataset.shape);
                const normPts = this.normalizeShapePolygonPoints(shapeDef);
                if (normPts) {
                    frame.dataset.isPolygon = 'true';
                    frame.dataset.polygonPoints = JSON.stringify(normPts);
                    frame.dataset.polygonClip = `polygon(${normPts.map(p => `${p.x}% ${p.y}%`).join(', ')})`;
                }
            }

            frame.style.width = finalW + 'px';
            frame.style.height = finalH + 'px';
            frame.style.left = defX + 'px';
            frame.style.top = defY + 'px';
            frame.style.borderRadius = isCirc ? '50%' : (frame.dataset.radius + 'px');
            frame.style.zIndex = '50';

            // İlk konum, boyut ve açı yedeğini sakla (Yerini Sıfırla butonu için)
            frame.dataset.origLeft = String(defX);
            frame.dataset.origTop = String(defY);
            frame.dataset.origWidth = String(finalW);
            frame.dataset.origHeight = String(finalH);
            frame.dataset.origRotation = String(frame.dataset.rotation || 0);
            frame.dataset.origPitch = String(frame.dataset.pitch || 0);
            frame.dataset.origYaw = String(frame.dataset.yaw || 0);
            frame.dataset.origElevation = String(frame.dataset.elevation || 0);
            frame.dataset.origDepth = String(frame.dataset.depth || 0);
            frame.dataset.origPerspective = String(frame.dataset.perspective || 1000);

            // 1. İç Kırpma Konteyneri (Fotoğraf, maske ve placeholder burada yer alır)
            const clip = document.createElement('div');
            clip.className = 'tb-frame-clip';
            frame.appendChild(clip);

            // 1.1 İç Gövde Taşıyıcısı (Degrade ve Dolgu Maskesi)
            const inner = document.createElement('div');
            inner.className = 'tb-frame-inner';
            clip.appendChild(inner);

            // Çerçeve Boş Durum Şablonu
            const placeholder = document.createElement('div');
            placeholder.className = 'tb-frame-placeholder';
            placeholder.innerHTML = `
                <i class="fa-solid fa-camera"></i>
                <span>Fotoğraf Ekle</span>
                <small>Tıkla veya Sürükle Bırak</small>
                <input type="file" accept="image/*" multiple style="display:none;" class="tb-frame-file-input">
            `;
            inner.appendChild(placeholder);

            // 2. Yeniden Boyutlandırma Tutamaçları (clip DIŞINDA, doğrudan frame üzerinde - ASLA KESİLMEZ!)
            ['tl', 'tr', 'bl', 'br'].forEach(pos => {
                const handle = document.createElement('div');
                handle.className = `tb-frame-handle ${pos}`;
                handle.dataset.handle = pos;
                frame.appendChild(handle);
            });

            // 3. Hızlı Aksiyon Araçları (Foto Değiştir, Pan/Kaydır, 3D Eğ, Takas/Taşı, Çoğalt, Sil)
            const tools = document.createElement('div');
            tools.className = 'tb-frame-floating-tools';
            tools.innerHTML = `
                <button type="button" class="tb-floating-btn tb-btn-replace" title="Fotoğrafı Değiştir"><i class="fa-solid fa-camera"></i></button>
                <button type="button" class="tb-floating-btn tb-btn-zoom-out" title="Fotoğrafı Uzaklaştır"><i class="fa-solid fa-magnifying-glass-minus"></i></button>
                <button type="button" class="tb-floating-btn tb-btn-zoom-in" title="Fotoğrafı Yakınlaştır"><i class="fa-solid fa-magnifying-glass-plus"></i></button>
                <button type="button" class="tb-floating-btn tb-btn-pan" title="Fotoğrafın Odak Noktasını Kaydır"><i class="fa-solid fa-arrows-up-down-left-right"></i></button>
                <button type="button" class="tb-floating-btn tb-btn-3d" title="3D Düzlemde Eğ"><i class="fa-solid fa-cube"></i></button>
                <button type="button" class="tb-floating-btn tb-btn-reset-pos" title="Çerçeveyi Eski Yerine Sıfırla"><i class="fa-solid fa-rotate-left"></i></button>
                <button type="button" class="tb-floating-btn tb-btn-swap" draggable="true" title="Görseli Başka Çerçeveye Sürükle veya Değiştir"><i class="fa-solid fa-arrows-rotate"></i></button>
                <button type="button" class="tb-floating-btn tb-btn-dup" title="Çerçeveyi Çoğalt"><i class="fa-solid fa-clone"></i></button>
                <button type="button" class="tb-floating-btn tb-btn-del" title="Çerçeveyi Sil" style="background:#dc2626;"><i class="fa-solid fa-trash-can"></i></button>
            `;
            tools.addEventListener('mousedown', (e) => e.stopPropagation());
            tools.addEventListener('pointerdown', (e) => e.stopPropagation());
            frame.appendChild(tools);

            uiLayer.appendChild(frame);

            // Stilleri Uygula
            this.applyFrameStyling(frame);

            // Olayları Bağla
            this.bindFrameEvents(frame);

            // core/drag.js sürükleme motorunu bağla
            if (typeof window.bindDrag === 'function') {
                window.bindDrag(frame);
            }

            if (typeof window.renderLayers === 'function') {
                window.renderLayers();
            }

            // Otomatik seç
            this.selectFrame(frame);
            frame._readyForImageClick = false;

            if (opts.imgUrl) {
                this.loadPhotoIntoFrame(frame, opts.imgUrl);
            }

            if (!opts.skipHistory && typeof window.recordHistory === 'function') {
                window.recordHistory('Çerçeve Eklendi');
            }

            return frame;
        },

        /**
         * Geçmişten (Undo / Redo Snapshot) Şablon Çerçevesini Eksiksiz Yeniden İnşa Et
         */
        restoreFrameFromSnapshot: function(data) {
            if (!data) return null;
            const cContainer = document.getElementById('canvas-container');
            const uiLayer = document.getElementById('ui-layer') || cContainer;
            if (!cContainer || !uiLayer) return null;

            const isCirc = (data.dataset && (data.dataset.isCircle === 'true' || data.dataset.isCircle === true));
            const frame = document.createElement('div');
            frame.className = 'draggable canvas-el tb-image-frame';
            if (data.id) frame.id = data.id;

            if (data.dataset) {
                Object.keys(data.dataset).forEach(k => {
                    frame.dataset[k] = data.dataset[k];
                });
            }
            delete frame.dataset.dragBound;

            if (data.style) {
                if (data.style.width) frame.style.width = data.style.width;
                if (data.style.height) frame.style.height = data.style.height;
                if (data.style.left) frame.style.left = data.style.left;
                if (data.style.top) frame.style.top = data.style.top;
                frame.style.zIndex = data.style.zIndex || '50';
            }
            if (frame.dataset.origLeft === undefined && frame.style.left) frame.dataset.origLeft = String(parseFloat(frame.style.left) || 0);
            if (frame.dataset.origTop === undefined && frame.style.top) frame.dataset.origTop = String(parseFloat(frame.style.top) || 0);
            if (frame.dataset.origWidth === undefined && frame.style.width) frame.dataset.origWidth = String(parseFloat(frame.style.width) || 300);
            if (frame.dataset.origHeight === undefined && frame.style.height) frame.dataset.origHeight = String(parseFloat(frame.style.height) || 300);

            // 1. İç Kırpma Konteyneri
            const clip = document.createElement('div');
            clip.className = 'tb-frame-clip';
            frame.appendChild(clip);

            // 1.1 İç Gövde Taşıyıcısı
            const inner = document.createElement('div');
            inner.className = 'tb-frame-inner';
            clip.appendChild(inner);

            // Placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'tb-frame-placeholder';
            placeholder.innerHTML = `
                <i class="fa-solid fa-camera"></i>
                <span>Fotoğraf Ekle</span>
                <small>Tıkla veya Sürükle Bırak</small>
                <input type="file" accept="image/*" multiple style="display:none;" class="tb-frame-file-input">
            `;
            inner.appendChild(placeholder);

            // 2. Tutamaçlar
            ['tl', 'tr', 'bl', 'br'].forEach(pos => {
                const handle = document.createElement('div');
                handle.className = `tb-frame-handle ${pos}`;
                handle.dataset.handle = pos;
                frame.appendChild(handle);
            });

            // 3. Hızlı Aksiyon Araçları
            const tools = document.createElement('div');
            tools.className = 'tb-frame-floating-tools';
            tools.innerHTML = `
                <button type="button" class="tb-floating-btn tb-btn-replace" title="Fotoğrafı Değiştir"><i class="fa-solid fa-camera"></i></button>
                <button type="button" class="tb-floating-btn tb-btn-zoom-out" title="Fotoğrafı Uzaklaştır"><i class="fa-solid fa-magnifying-glass-minus"></i></button>
                <button type="button" class="tb-floating-btn tb-btn-zoom-in" title="Fotoğrafı Yakınlaştır"><i class="fa-solid fa-magnifying-glass-plus"></i></button>
                <button type="button" class="tb-floating-btn tb-btn-pan" title="Fotoğrafın Odak Noktasını Kaydır"><i class="fa-solid fa-arrows-up-down-left-right"></i></button>
                <button type="button" class="tb-floating-btn tb-btn-3d" title="3D Düzlemde Eğ"><i class="fa-solid fa-cube"></i></button>
                <button type="button" class="tb-floating-btn tb-btn-reset-pos" title="Çerçeveyi Eski Yerine Sıfırla"><i class="fa-solid fa-rotate-left"></i></button>
                <button type="button" class="tb-floating-btn tb-btn-swap" draggable="true" title="Görseli Başka Çerçeveye Sürükle veya Değiştir"><i class="fa-solid fa-arrows-rotate"></i></button>
                <button type="button" class="tb-floating-btn tb-btn-dup" title="Çerçeveyi Çoğalt"><i class="fa-solid fa-clone"></i></button>
                <button type="button" class="tb-floating-btn tb-btn-del" title="Çerçeveyi Sil" style="background:#dc2626;"><i class="fa-solid fa-trash-can"></i></button>
            `;
            tools.addEventListener('mousedown', (e) => e.stopPropagation());
            tools.addEventListener('pointerdown', (e) => e.stopPropagation());
            frame.appendChild(tools);

            uiLayer.appendChild(frame);

            // Stilleri ve olayları bağla
            this.applyFrameStyling(frame);
            this.bindFrameEvents(frame);

            if (typeof window.bindDrag === 'function') {
                window.bindDrag(frame);
            }

            const imgSrc = data.imgSrc || (data.dataset ? data.dataset.imgSrc : null);
            if (imgSrc) {
                this.loadPhotoIntoFrame(frame, imgSrc);
            }

            if (data.isSelected) {
                this.selectFrame(frame);
            }
            frame._readyForImageClick = false;

            return frame;
        },

        /**
         * Şekil poligon köşelerini viewBox (örn. 0 0 100 90) değerine göre 0-100% koordinatına normalize et
         */
        normalizeShapePolygonPoints: function(sDef) {
            if (!sDef || !sDef.polygon) return null;
            const vbParts = (sDef.viewBox || '0 0 100 100').trim().split(/[\s,]+/).map(Number);
            const vbX = Number.isFinite(vbParts[0]) ? vbParts[0] : 0;
            const vbY = Number.isFinite(vbParts[1]) ? vbParts[1] : 0;
            const vbW = (Number.isFinite(vbParts[2]) && vbParts[2] > 0) ? vbParts[2] : 100;
            const vbH = (Number.isFinite(vbParts[3]) && vbParts[3] > 0) ? vbParts[3] : 100;
            const pts = sDef.polygon.trim().split(/\s+/).map(pair => {
                const parts = pair.split(',');
                const rawX = parseFloat(parts[0]);
                const rawY = parseFloat(parts[1]);
                if (isNaN(rawX) || isNaN(rawY)) return null;
                return {
                    x: parseFloat((((rawX - vbX) / vbW) * 100).toFixed(4)),
                    y: parseFloat((((rawY - vbY) / vbH) * 100).toFixed(4))
                };
            }).filter(Boolean);
            return pts.length >= 3 ? pts : null;
        },

        /**
         * Çerçevenin Stilini ve Degrade Maskesini Uygula
         */
        applyFrameStyling: function(frame) {
            const rad = frame.dataset.radius || 0;
            const bw = frame.dataset.borderWidth || 0;
            const bc = frame.dataset.borderColor || '#ffffff';
            const sh = frame.dataset.shadow || 0;
            const blend = frame.dataset.blendMode || 'none';
            const shape = frame.dataset.shape || 'none';
            const rotation = frame.dataset.rotation || 0;
            const effect = frame.dataset.effect || 'none';
            const clip = frame.querySelector('.tb-frame-clip') || frame;

            // İç gövde konteynerini garantiye al
            let inner = clip.querySelector('.tb-frame-inner');
            if (!inner) {
                inner = document.createElement('div');
                inner.className = 'tb-frame-inner';
                while (clip.firstChild) {
                    inner.appendChild(clip.firstChild);
                }
                clip.appendChild(inner);
            }

            // 1. Açı / 3D Düzlem Dönüşümü (Pitch, Yaw, Roll, Elevation, Perspective)
            if (window.Template3DFrame && typeof window.Template3DFrame.applyTransform === 'function') {
                window.Template3DFrame.applyTransform(frame);
            } else if (parseInt(rotation) !== 0) {
                frame.style.transform = `rotate(${rotation}deg)`;
            } else {
                frame.style.transform = 'none';
            }

            // Üst sınıra yakınsa butonları alta al
            const fTop = parseFloat(frame.style.top) || frame.offsetTop || 0;
            frame.classList.toggle('tools-below', fTop < 42);

            // Önceki maske ve efekt sınıflarını temizle
            clip.classList.remove('fade-bottom', 'fade-right', 'fade-left');
            inner.classList.remove('fade-bottom', 'fade-right', 'fade-left');
            clip.className = clip.className.replace(/\bshape-[a-z0-9-]+\b/g, '').trim();

            const hasShape = shape && shape !== 'none';
            const hasBlend = blend && blend !== 'none';
            const isPolygon = (frame.dataset.isPolygon === 'true' && frame.dataset.polygonClip);

            // 1.5 Serbest Çokgen Kırpma (Polygon Clip-Path)
            if (isPolygon) {
                clip.style.clipPath = frame.dataset.polygonClip;
                clip.style.webkitClipPath = frame.dataset.polygonClip;
                frame.style.borderRadius = '0px';
                clip.style.borderRadius = '0px';
                inner.style.borderRadius = '0px';
            } else {
                clip.style.clipPath = 'none';
                clip.style.webkitClipPath = 'none';
            }

            // 2. Yaratıcı Şekil Maskesi veya Serbest Çokgen Uygula (SVG Mask & Native ClipPath)
            if (hasShape || isPolygon) {
                if (hasShape) {
                    clip.classList.add('shape-' + shape);
                }
                frame.classList.add('has-shape');
                frame.style.borderRadius = '0px';
                frame.style.border = 'none';
                frame.style.boxShadow = 'none';
                inner.style.border = 'none';
                inner.style.borderRadius = '0px';
                clip.style.borderRadius = '0px';
                if (!frame.classList.contains('has-image')) {
                    inner.style.background = 'transparent';
                }

                // Poligon şekillerinde native CSS clipPath ile ekstra net kırpma (viewBox 0-100% normalize)
                const list = this.shapes || (typeof window !== 'undefined' && window.TemplateShapesData) || [];
                const sDef = hasShape ? list.find(s => s.id === shape) : null;
                const normPts = this.normalizeShapePolygonPoints(sDef);
                if (normPts) {
                    const clipVal = `polygon(${normPts.map(p => `${p.x}% ${p.y}%`).join(', ')})`;
                    clip.style.clipPath = clipVal;
                    clip.style.webkitClipPath = clipVal;
                    frame.dataset.isPolygon = 'true';
                    frame.dataset.polygonPoints = JSON.stringify(normPts);
                    frame.dataset.polygonClip = clipVal;
                } else if (!isPolygon) {
                    clip.style.clipPath = 'none';
                    clip.style.webkitClipPath = 'none';
                }

                // ORGANİK / ŞEKİL KONTUR GÖLGESİ (SVG Silhouette Drop-Shadow & Glow)
                const depthVal = parseFloat(frame.dataset.depth) || 0;
                if (depthVal > 0) {
                    // 3D derinlikte preserve-3d bağlamını bozmamak için frame üzerinde filter 'none' olmalıdır
                    frame.style.filter = 'none';
                } else if (effect === 'gold') {
                    frame.style.filter = 'drop-shadow(0 0 14px rgba(245, 158, 11, 0.75)) drop-shadow(0 8px 18px rgba(0,0,0,0.5))';
                } else if (effect === 'neon') {
                    frame.style.filter = 'drop-shadow(0 0 16px rgba(6, 182, 212, 0.8)) drop-shadow(0 8px 18px rgba(0,0,0,0.5))';
                } else if (parseInt(sh) > 0) {
                    const shX = Math.round(sh * 0.2);
                    const shY = Math.round(sh * 0.6);
                    const shBlur = Math.round(sh * 1.4);
                    frame.style.filter = `drop-shadow(${shX}px ${shY}px ${shBlur}px rgba(0,0,0,0.45))`;
                } else {
                    frame.style.filter = 'none';
                }
            } else {
                // Şekil yok (standart veya tam daire çerçeve)
                if (frame.dataset.isCircle === 'true') {
                    frame.style.borderRadius = '50%';
                    clip.style.borderRadius = '50%';
                    inner.style.borderRadius = '50%';
                } else {
                    frame.style.borderRadius = rad + 'px';
                    clip.style.borderRadius = rad + 'px';
                    inner.style.borderRadius = rad + 'px';
                }
                frame.style.filter = 'none';

                if (hasBlend) {
                    frame.style.border = 'none';
                    frame.style.boxShadow = 'none';
                    inner.style.border = 'none';
                } else if (effect === 'gold') {
                    frame.style.border = '3px solid #f59e0b';
                    frame.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.6), 0 8px 24px rgba(0,0,0,0.4)';
                    inner.style.border = 'none';
                } else if (effect === 'neon') {
                    frame.style.border = '2px solid #06b6d4';
                    frame.style.boxShadow = '0 0 22px rgba(6, 182, 212, 0.7), 0 8px 24px rgba(0,0,0,0.4)';
                    inner.style.border = 'none';
                } else {
                    if (parseInt(bw) > 0) {
                        frame.style.border = `${bw}px solid ${bc}`;
                        inner.style.border = 'none';
                    } else if (!frame.classList.contains('has-image')) {
                        frame.style.border = 'none';
                        inner.style.border = '2px dashed rgba(2, 132, 199, 0.6)';
                    } else {
                        frame.style.border = 'none';
                        inner.style.border = 'none';
                    }

                    const has3D = (parseFloat(frame.dataset.pitch) || 0) !== 0 ||
                                  (parseFloat(frame.dataset.yaw) || 0) !== 0 ||
                                  (parseFloat(frame.dataset.elevation) || 0) !== 0 ||
                                  (parseFloat(frame.dataset.depth) || 0) !== 0;

                    if (has3D && window.Template3DFrame && typeof window.Template3DFrame.applyTransform === 'function') {
                        window.Template3DFrame.applyTransform(frame);
                    } else {
                        if (parseInt(sh) > 0) {
                            frame.style.boxShadow = `0 ${Math.round(sh * 0.6)}px ${sh * 2}px rgba(0,0,0,0.35)`;
                        } else {
                            frame.style.boxShadow = 'none';
                        }
                    }
                }
            }

            // 3. Pürüzsüz Degrade Geçiş Maskesi Uygula (Fade to Background)
            if (hasBlend) {
                inner.classList.add('fade-' + blend);
                if (!hasShape) {
                    clip.classList.add('fade-' + blend);
                }
            }

            // 4. Şekil veya Çokgen İçin Vektör Hat Güncellemesi
            this.updateShapeContour(frame);
        },

        /**
         * Yaratıcı Şekil ve Çokgen Çerçeveler İçin Dinamik Vektör Hat (SVG Contour & Selection Border)
         */
        updateShapeContour: function(frame) {
            if (!frame) return;
            const shape = frame.dataset.shape || 'none';
            const hasShape = (shape && shape !== 'none');
            const isPolygon = (frame.dataset.isPolygon === 'true');
            const hasImage = frame.classList.contains('has-image');
            const isSelected = frame.classList.contains('selected') || frame.classList.contains('el-selected');
            const bw = parseInt(frame.dataset.borderWidth) || 0;
            const bc = frame.dataset.borderColor || '#ffffff';

            let contourSvg = frame.querySelector('.tb-shape-contour-svg');

            if (!hasShape && !isPolygon) {
                if (contourSvg) contourSvg.remove();
                frame.classList.remove('has-shape');
                return;
            }

            frame.classList.add('has-shape');

            if (!contourSvg) {
                contourSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                contourSvg.setAttribute('class', 'tb-shape-contour-svg');
                contourSvg.style.position = 'absolute';
                contourSvg.style.inset = '0';
                contourSvg.style.width = '100%';
                contourSvg.style.height = '100%';
                contourSvg.style.pointerEvents = 'none';
                contourSvg.style.zIndex = '45';
                contourSvg.style.overflow = 'visible';
                frame.appendChild(contourSvg);
            }

            let shapeDef = null;
            if (hasShape) {
                const list = this.shapes || (typeof window !== 'undefined' && window.TemplateShapesData) || [];
                shapeDef = list.find(s => s.id === shape);
            }

            let strokeColor = 'none';
            let strokeW = 0;
            let strokeDash = 'none';
            let fillColor = 'none';

            if (!hasImage) {
                // Görsel Yokken: Boş durum için belirgin mavi kesik çizgili hat + hafif mavi transparan dolgu
                strokeColor = isSelected ? '#0284c7' : 'rgba(2, 132, 199, 0.75)';
                strokeW = isSelected ? 2.5 : 2;
                strokeDash = isSelected ? 'none' : '6 4';
                fillColor = 'rgba(2, 132, 199, 0.05)';
            } else {
                // Görsel Varken: Kullanıcı kenarlık vermişse veya seçiliyse
                if (bw > 0) {
                    strokeColor = bc;
                    strokeW = bw;
                } else if (isSelected) {
                    strokeColor = '#0284c7';
                    strokeW = 2.5;
                }
            }

            contourSvg.innerHTML = '';

            if (isPolygon) {
                let ptsStr = '';
                try {
                    const rawPts = frame.dataset.polygonPoints;
                    if (rawPts) {
                        const parsed = JSON.parse(rawPts);
                        if (Array.isArray(parsed)) {
                            ptsStr = parsed.map(p => `${p.x},${p.y}`).join(' ');
                        }
                    }
                } catch (e) {}

                if (!ptsStr && frame.dataset.polygonClip) {
                    const m = frame.dataset.polygonClip.match(/polygon\((.+)\)/);
                    if (m && m[1]) {
                        ptsStr = m[1].split(',').map(s => s.trim().replace(/%/g, '').replace(/\s+/g, ',')).join(' ');
                    }
                }

                if (ptsStr) {
                    contourSvg.setAttribute('viewBox', '0 0 100 100');
                    contourSvg.setAttribute('preserveAspectRatio', 'none');
                    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                    poly.setAttribute('points', ptsStr);
                    poly.setAttribute('fill', fillColor);
                    poly.setAttribute('stroke', strokeColor);
                    poly.setAttribute('stroke-width', strokeW);
                    if (strokeDash !== 'none') poly.setAttribute('stroke-dasharray', strokeDash);
                    poly.setAttribute('vector-effect', 'non-scaling-stroke');
                    contourSvg.appendChild(poly);
                }
            } else if (shapeDef) {
                const vb = shapeDef.viewBox || '0 0 100 100';
                contourSvg.setAttribute('viewBox', vb);
                contourSvg.setAttribute('preserveAspectRatio', 'none');

                if (shapeDef.polygon) {
                    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                    poly.setAttribute('points', shapeDef.polygon);
                    poly.setAttribute('fill', fillColor);
                    poly.setAttribute('stroke', strokeColor);
                    poly.setAttribute('stroke-width', strokeW);
                    if (strokeDash !== 'none') poly.setAttribute('stroke-dasharray', strokeDash);
                    poly.setAttribute('vector-effect', 'non-scaling-stroke');
                    contourSvg.appendChild(poly);
                } else if (shapeDef.id === 'frame-polaroid' || shapeDef.id === 'frame-film') {
                    // Polaroid & Sinema Şeridi: İç fotoğraf penceresi + dış kart çerçevesi (Kenarlık Rengi kart dolgusunu boyar)
                    const isFilm = shapeDef.id === 'frame-film';
                    const defaultMatColor = isFilm ? '#1e293b' : '#ffffff';
                    const hasCustomColor = bc && bc.trim() && bc.trim().toLowerCase() !== '#ffffff';
                    const matColor = isFilm ? (hasCustomColor ? bc.trim() : defaultMatColor) : ((bc && bc.trim()) ? bc.trim() : '#ffffff');
                    const isWhiteMat = /^#f{3,6}$/i.test(matColor) || matColor.toLowerCase() === 'white';
                    const winD = isFilm ? 'M 8,14 L 112,14 L 112,76 L 8,76 Z' : 'M 8,8 L 92,8 L 92,92 L 8,92 Z';

                    const winPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    winPath.setAttribute('d', winD);
                    winPath.setAttribute('fill', !hasImage ? 'rgba(2, 132, 199, 0.05)' : 'none');
                    winPath.setAttribute('stroke', !hasImage ? (isSelected ? '#0284c7' : 'rgba(2, 132, 199, 0.65)') : 'rgba(148, 163, 184, 0.45)');
                    winPath.setAttribute('stroke-width', !hasImage ? 1.5 : 1);
                    if (!hasImage) winPath.setAttribute('stroke-dasharray', '5 4');
                    winPath.setAttribute('vector-effect', 'non-scaling-stroke');
                    contourSvg.appendChild(winPath);

                    const matPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    matPath.setAttribute('d', shapeDef.path);
                    matPath.setAttribute('fill', matColor);
                    matPath.setAttribute('stroke', bw > 0 ? matColor : (isSelected ? '#0284c7' : (isWhiteMat ? '#cbd5e1' : 'rgba(0,0,0,0.18)')));
                    matPath.setAttribute('stroke-width', bw > 0 ? bw : (isSelected ? 2 : 1.5));
                    matPath.setAttribute('vector-effect', 'non-scaling-stroke');
                    contourSvg.appendChild(matPath);
                } else if (shapeDef.path) {
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', shapeDef.path);
                    path.setAttribute('fill', fillColor);
                    path.setAttribute('stroke', strokeColor);
                    path.setAttribute('stroke-width', strokeW);
                    if (strokeDash !== 'none') path.setAttribute('stroke-dasharray', strokeDash);
                    path.setAttribute('vector-effect', 'non-scaling-stroke');
                    contourSvg.appendChild(path);
                }
            }
        },

        /**
         * Çerçeve İçi Olayları (Tıklama, Sürükle-Bırak, Tutamaçlar)
         */
        bindFrameEvents: function(frame) {
            const placeholder = frame.querySelector('.tb-frame-placeholder');
            const fileInput = frame.querySelector('.tb-frame-file-input');

            // 0. Çift Tıklama ile Fotoğraf Pan / Odak Modunu Aç
            frame.addEventListener('dblclick', (e) => {
                if (e.target.closest('.tb-frame-handle') || e.target.closest('.tb-floating-btn')) return;
                if (frame.classList.contains('has-image')) {
                    e.stopPropagation();
                    this.toggleImagePanMode(frame);
                }
            });

            // 1. Tıklayarak Seçme, Pan / Odak Sürükleme ve Çerçeveler Arası Akıllı Takas
            frame.addEventListener('mousedown', (e) => {
                if (e.target.closest('.tb-frame-handle') || e.target.closest('.tb-floating-btn') || e.target.closest('.tb-frame-floating-tools')) return;
                const isMultiKey = e.ctrlKey || e.shiftKey;
                const count3D = (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function')
                    ? window.ThreeDGrouping.getSelected3DElements().length
                    : 0;
                const isAlreadyInMulti = Array.isArray(window.selectedElements) && (window.selectedElements.length + count3D > 1) && window.selectedElements.includes(frame);
                if (e.button === 0 && !isMultiKey && !isAlreadyInMulti) {
                    this.selectFrame(frame);
                } else if (isAlreadyInMulti) {
                    this.selectedFrame = frame;
                    if (typeof this.syncSettingsPanelWithFrame === 'function') {
                        this.syncSettingsPanelWithFrame(frame);
                    }
                }

                // Pan Modu VEYA Alt Tuşu basılıysa: Fotoğrafı çerçeve içinde kaydır
                if (frame.classList.contains('has-image') && (e.altKey || frame.classList.contains('tb-pan-mode'))) {
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startPanX = parseFloat(frame.dataset.imgPanX) || 0;
                    const startPanY = parseFloat(frame.dataset.imgPanY) || 0;

                    const cContainer = document.getElementById('canvas-container');
                    const scaleFactor = (typeof window.getGlobalScale === 'function' ? window.getGlobalScale() : (typeof window.scaleFactor !== 'undefined' ? window.scaleFactor : 1)) || 1;

                    const onPanMove = (moveEvent) => {
                        const dx = (moveEvent.clientX - startX) / scaleFactor;
                        const dy = (moveEvent.clientY - startY) / scaleFactor;
                        const newX = Math.round(startPanX + dx);
                        const newY = Math.round(startPanY + dy);
                        frame.dataset.imgPanX = newX;
                        frame.dataset.imgPanY = newY;

                        this.applyImageZoomPan(frame);

                        const clampedX = Math.round(parseFloat(frame.dataset.imgPanX) || 0);
                        const clampedY = Math.round(parseFloat(frame.dataset.imgPanY) || 0);
                        const pxInput = document.getElementById('tbFramePanX');
                        const pxVal = document.getElementById('tbFramePanXVal');
                        const pyInput = document.getElementById('tbFramePanY');
                        const pyVal = document.getElementById('tbFramePanYVal');
                        if (pxInput) pxInput.value = clampedX;
                        if (pxVal) pxVal.textContent = clampedX + 'px';
                        if (pyInput) pyInput.value = clampedY;
                        if (pyVal) pyVal.textContent = clampedY + 'px';
                    };

                    const onPanUp = () => {
                        document.removeEventListener('mousemove', onPanMove);
                        document.removeEventListener('mouseup', onPanUp);
                        if (typeof window.recordHistory === 'function') {
                            window.recordHistory('Fotoğraf Konumu Kaydırıldı');
                        }
                    };

                    document.addEventListener('mousemove', onPanMove);
                    document.addEventListener('mouseup', onPanUp);
                    return;
                }
            });

            frame.addEventListener('click', (e) => {
                if (e.target.closest('.tb-frame-handle') || e.target.closest('.tb-floating-btn') || e.target.closest('.tb-frame-floating-tools')) return;
                if (!frame._justDragged && !frame.classList.contains('dragging')) {
                    // İlk tıklama ile seçim tamamlandığında, sonraki doğrudan tıklama görsel açmaya hazır olsun
                    frame._readyForImageClick = true;
                }
            });

            // Fare Tekerleği ile Çerçeve İçi Zoom (Alt, Pan Modunda veya Seçili Durumda)
            frame.addEventListener('wheel', (e) => {
                if (frame.classList.contains('has-image') && (e.altKey || frame.classList.contains('tb-pan-mode') || this.selectedFrame === frame)) {
                    e.preventDefault();
                    e.stopPropagation();
                    let curZoom = parseFloat(frame.dataset.imgZoom) || 1.0;
                    const delta = e.deltaY > 0 ? -0.05 : 0.05;
                    curZoom = Math.max(0.2, Math.min(3.0, curZoom + delta));
                    frame.dataset.imgZoom = curZoom.toFixed(2);
                    const zoomInput = document.getElementById('tbFrameZoom');
                    const zoomVal = document.getElementById('tbFrameZoomVal');
                    if (zoomInput) zoomInput.value = Math.round(curZoom * 100);
                    if (zoomVal) zoomVal.textContent = Math.round(curZoom * 100) + '%';
                    this.applyImageZoomPan(frame);
                    clearTimeout(this._wheelZoomHistoryTimer);
                    this._wheelZoomHistoryTimer = setTimeout(() => {
                        if (typeof window.recordHistory === 'function') {
                            window.recordHistory('Fotoğraf Yakınlaştırıldı');
                        }
                    }, 350);
                }
            }, { passive: false });

            // 2. Dosya Seçme Girişi (1. Tıklama: Öge Seçimi | 2. Direkt Tıklama: Görsel Açma | Taşıma/Sürüklemede: Asla Açılmaz)
            if (placeholder && fileInput) {
                let pDownX = 0;
                let pDownY = 0;
                let pDownTime = 0;
                let wasReadyForImage = false;

                placeholder.addEventListener('mousedown', (e) => {
                    pDownX = e.clientX;
                    pDownY = e.clientY;
                    pDownTime = Date.now();
                    // Fare basıldığı anda bu çerçeve zaten seçili ve 2. tıklamaya hazır mıydı?
                    wasReadyForImage = (this.selectedFrame === frame && frame._readyForImageClick === true);
                });

                placeholder.addEventListener('touchstart', (e) => {
                    if (e.touches && e.touches[0]) {
                        pDownX = e.touches[0].clientX;
                        pDownY = e.touches[0].clientY;
                        pDownTime = Date.now();
                        wasReadyForImage = (this.selectedFrame === frame && frame._readyForImageClick === true);
                    }
                }, { passive: true });

                placeholder.addEventListener('click', (e) => {
                    e.stopPropagation();

                    // 1. Sürükleme / Taşıma kontrolü:
                    // Çerçeve taşındıysa, sürükleniyorsa veya imleç hareket ettiyse dosya penceresini ASLA açma
                    if (frame._justDragged || frame.classList.contains('dragging')) {
                        return;
                    }
                    const dist = Math.hypot(e.clientX - pDownX, e.clientY - pDownY);
                    const elapsed = pDownTime > 0 ? (Date.now() - pDownTime) : 0;
                    if (dist > 6 || elapsed > 600) {
                        return; // Taşıma, sürükleme veya uzun basış; direkt tıklama değil
                    }

                    // 2. İlk Tıklama Kontrolü (1. Tıklama = Sadece Öge Seçimi):
                    // Eğer fare basıldığı anda çerçeve 2. tıklamaya hazır değil idiyse, bu 1. tıklamadır;
                    // yalnızca öge seçimini doğrular ve sonraki tıklama için hazırlar.
                    if (!wasReadyForImage) {
                        frame._readyForImageClick = true;
                        return;
                    }

                    // 3. İkinci Direkt Tıklama (2. Direkt Tıklama = Görsel Seçme Penceresini Aç):
                    fileInput.click();
                });

                fileInput.addEventListener('change', (e) => {
                    const files = Array.from(fileInput.files || []);
                    if (files.length === 0) return;
                    if (files.length === 1) {
                        this.loadPhotoIntoFrame(frame, files[0]);
                    } else {
                        this.distributeBatchPhotos(files, frame);
                    }
                    fileInput.value = '';
                });
            }

            // 3. Sürükle-Bırak (Drag & Drop): Çerçeveler Arası Görsel Takas Et veya Dosya Yükle
            frame.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.draggedFrame && this.draggedFrame !== frame) {
                    e.dataTransfer.dropEffect = 'move';
                    frame.classList.add('tb-swap-target-hover');
                    let badge = frame.querySelector('.tb-swap-badge');
                    if (!badge) {
                        badge = document.createElement('div');
                        badge.className = 'tb-swap-badge';
                        badge.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Yer Değiştir';
                        frame.appendChild(badge);
                    }
                } else {
                    frame.classList.add('drag-hover');
                }
            });

            frame.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                frame.classList.remove('drag-hover', 'tb-swap-target-hover');
                const b = frame.querySelector('.tb-swap-badge');
                if (b) b.remove();
            });

            frame.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                frame.classList.remove('drag-hover', 'tb-swap-target-hover');
                const b = frame.querySelector('.tb-swap-badge');
                if (b) b.remove();

                // Başka bir çerçeveden görsel sürüklenip bırakıldıysa: Takas et!
                if (this.draggedFrame && this.draggedFrame !== frame) {
                    const source = this.draggedFrame;
                    this.draggedFrame = null;
                    document.querySelectorAll('.tb-image-frame').forEach(f => f.classList.remove('tb-can-swap'));
                    this.swapFrameImages(source, frame);
                    return;
                }

                const stagingId = e.dataTransfer ? (e.dataTransfer.getData('application/x-staging-id') || e.dataTransfer.getData('text/plain')) : null;
                if (stagingId && window.PhotoStagingArchive && typeof window.PhotoStagingArchive.getItemById === 'function') {
                    const item = window.PhotoStagingArchive.getItemById(stagingId);
                    if (item && (item.fullDataUrl || item.originalDataUrl || item.thumbUrl)) {
                        this.loadPhotoIntoFrame(frame, item.fullDataUrl || item.originalDataUrl || item.thumbUrl);
                        return;
                    }
                }

                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const files = Array.from(e.dataTransfer.files);
                    if (files.length === 1) {
                        this.loadPhotoIntoFrame(frame, files[0]);
                    } else {
                        this.distributeBatchPhotos(files, frame);
                    }
                }
            });

            // 4. Hızlı Araçlar
            const btnReplace = frame.querySelector('.tb-btn-replace');
            if (btnReplace && fileInput) {
                btnReplace.addEventListener('click', (e) => {
                    e.stopPropagation();
                    fileInput.click();
                });
            }

            const btnZoomOut = frame.querySelector('.tb-btn-zoom-out');
            if (btnZoomOut) {
                btnZoomOut.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectFrame(frame);
                    this.zoomOut();
                });
            }

            const btnZoomIn = frame.querySelector('.tb-btn-zoom-in');
            if (btnZoomIn) {
                btnZoomIn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectFrame(frame);
                    this.zoomIn();
                });
            }

            const btnSwap = frame.querySelector('.tb-btn-swap');
            if (btnSwap) {
                btnSwap.addEventListener('dragstart', (e) => {
                    this.draggedFrame = frame;
                    e.dataTransfer.setData('text/plain', 'tb-swap');
                    e.dataTransfer.effectAllowed = 'move';
                    document.querySelectorAll('.tb-image-frame').forEach(f => {
                        if (f !== frame) f.classList.add('tb-can-swap');
                    });
                });

                btnSwap.addEventListener('dragend', () => {
                    this.draggedFrame = null;
                    document.querySelectorAll('.tb-image-frame').forEach(f => {
                        f.classList.remove('tb-can-swap', 'tb-swap-target-hover');
                        const b = f.querySelector('.tb-swap-badge');
                        if (b) b.remove();
                    });
                });
            }

            const btnPan = frame.querySelector('.tb-btn-pan');
            if (btnPan) {
                btnPan.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleImagePanMode(frame);
                });
            }

            const btn3D = frame.querySelector('.tb-btn-3d');
            if (btn3D) {
                btn3D.dataset.tb3dBound = 'true';
                btn3D.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isPartOfMulti = Array.isArray(window.selectedElements) && window.selectedElements.length > 1 && window.selectedElements.includes(frame);
                    if (isPartOfMulti) {
                        const targets = window.selectedElements.slice();
                        const hasNonFrame = targets.some(t => t && t.classList && !t.classList.contains('tb-image-frame'));
                        if (hasNonFrame && window.ThreeDEngine && typeof window.ThreeDEngine.convert2DBadgeTo3D === 'function') {
                            window.ThreeDEngine.convert2DBadgeTo3D(targets);
                            return;
                        }
                        const frames = targets.filter(t => t && t.classList && t.classList.contains('tb-image-frame'));
                        const wasGizmoActive = window.Template3DFrame && window.Template3DFrame.isGizmoActive() && window.Template3DFrame.activeGizmoFrame === frame;
                        this.selectedFrame = frame;
                        frames.forEach(f => {
                            delete f._gizmoDismissed;
                            const curDepth = parseFloat(f.dataset.depth) || 0;
                            const curPitch = parseFloat(f.dataset.pitch) || 0;
                            const curYaw = parseFloat(f.dataset.yaw) || 0;
                            if (curDepth <= 0) f.dataset.depth = 25;
                            if (curPitch === 0 && curYaw === 0) {
                                f.dataset.pitch = -12;
                                f.dataset.yaw = 20;
                                f.dataset.perspective = 1200;
                            }
                            f.dataset.has3D = 'true';
                            if (window.Template3DFrame) window.Template3DFrame.applyTransform(f);
                        });
                        if (window.Template3DFrame) {
                            window.Template3DFrame.syncPanel(frame);
                            if (wasGizmoActive) {
                                frame._gizmoDismissed = true;
                                window.Template3DFrame.hideGizmo();
                            } else {
                                window.Template3DFrame.showGizmo(frame);
                            }
                        }
                        return;
                    }

                    const wasGizmoActive = window.Template3DFrame && window.Template3DFrame.isGizmoActive() && window.Template3DFrame.activeGizmoFrame === frame;
                    delete frame._gizmoDismissed;
                    this.selectFrame(frame, { skipGizmoAutoOpen: true });
                    const curDepth = parseFloat(frame.dataset.depth) || 0;
                    const curPitch = parseFloat(frame.dataset.pitch) || 0;
                    const curYaw = parseFloat(frame.dataset.yaw) || 0;
                    if (curDepth <= 0) {
                        frame.dataset.depth = 25;
                    }
                    if (curPitch === 0 && curYaw === 0) {
                        frame.dataset.pitch = -12;
                        frame.dataset.yaw = 20;
                        frame.dataset.perspective = 1200;
                    }
                    frame.dataset.has3D = 'true';
                    if (window.Template3DFrame) {
                        window.Template3DFrame.applyTransform(frame);
                        window.Template3DFrame.syncPanel(frame);
                    }
                    if (window.Template3DFrame) {
                        if (wasGizmoActive) {
                            frame._gizmoDismissed = true;
                            window.Template3DFrame.hideGizmo();
                        } else {
                            window.Template3DFrame.showGizmo(frame);
                        }
                    }
                });
            }

            const btnDup = frame.querySelector('.tb-btn-dup');
            if (btnDup) {
                btnDup.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.duplicateFrame(frame);
                });
            }

            const btnDel = frame.querySelector('.tb-btn-del');
            if (btnDel) {
                btnDel.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteFrame(frame);
                });
            }

            const btnResetPos = frame.querySelector('.tb-btn-reset-pos');
            if (btnResetPos) {
                btnResetPos.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.resetFramePlacement(frame);
                });
            }

            // 5. Yeniden Boyutlandırma Tutamaçları (Handles)
            frame.querySelectorAll('.tb-frame-handle').forEach(handle => {
                handle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.startResizing(frame, handle.dataset.handle, e);
                });
            });

            // 6. 3D İnteraktif Eğim Tutamaçlarını Bağla
            if (window.Template3DFrame && typeof window.Template3DFrame.bindInteractiveTilt === 'function') {
                window.Template3DFrame.bindInteractiveTilt(frame);
            }
        },

        /**
         * Tutamaçla Yeniden Boyutlandırma (Resize) Başlat - Shift & Şekil Oran Kilidi Korumalı
         */
        startResizing: function(frame, handleType, e) {
            this.resizingFrame = frame;
            const startW = frame.offsetWidth;
            const startH = frame.offsetHeight;
            const startX = e.clientX;
            const startY = e.clientY;
            const startLeft = parseFloat(frame.style.left) || frame.offsetLeft;
            const startTop = parseFloat(frame.style.top) || frame.offsetTop;
            const origAspect = (startW > 0 && startH > 0) ? (startW / startH) : 1;
            const hasShape = (frame.dataset.shape && frame.dataset.shape !== 'none');

            const cContainer = document.getElementById('canvas-container');
            const scaleFactor = (typeof window.getGlobalScale === 'function' ? window.getGlobalScale() : (typeof window.scaleFactor !== 'undefined' ? window.scaleFactor : 1)) || 1;

            const onMouseMove = (moveEvent) => {
                if (!this.resizingFrame) return;
                const dx = (moveEvent.clientX - startX) / scaleFactor;
                const dy = (moveEvent.clientY - startY) / scaleFactor;

                // Shift basılıysa VEYA çerçevede özel organik şekil / tam daire varsa (ve Alt basılı değilse) en-boy oranını kilitle
                const isCircle = frame.dataset.isCircle === 'true';
                const keepAspect = (hasShape && !moveEvent.altKey) || (isCircle && !moveEvent.altKey) || moveEvent.shiftKey;

                let newW = startW;
                let newH = startH;
                let newLeft = startLeft;
                let newTop = startTop;

                if (handleType === 'br') {
                    if (keepAspect) {
                        const scaleW = Math.max(80, startW + dx) / startW;
                        const scaleH = Math.max(80, startH + dy) / startH;
                        const scale = (Math.abs(dx) > Math.abs(dy)) ? scaleW : scaleH;
                        newW = Math.max(80, startW * scale);
                        newH = Math.max(80, newW / origAspect);
                    } else {
                        newW = Math.max(80, startW + dx);
                        newH = Math.max(80, startH + dy);
                    }
                } else if (handleType === 'bl') {
                    if (keepAspect) {
                        const scaleW = Math.max(80, startW - dx) / startW;
                        const scaleH = Math.max(80, startH + dy) / startH;
                        const scale = (Math.abs(dx) > Math.abs(dy)) ? scaleW : scaleH;
                        newW = Math.max(80, startW * scale);
                        newH = Math.max(80, newW / origAspect);
                        newLeft = startLeft + (startW - newW);
                    } else {
                        newW = Math.max(80, startW - dx);
                        newH = Math.max(80, startH + dy);
                        newLeft = startLeft + (startW - newW);
                    }
                } else if (handleType === 'tr') {
                    if (keepAspect) {
                        const scaleW = Math.max(80, startW + dx) / startW;
                        const scaleH = Math.max(80, startH - dy) / startH;
                        const scale = (Math.abs(dx) > Math.abs(dy)) ? scaleW : scaleH;
                        newW = Math.max(80, startW * scale);
                        newH = Math.max(80, newW / origAspect);
                        newTop = startTop + (startH - newH);
                    } else {
                        newW = Math.max(80, startW + dx);
                        newH = Math.max(80, startH - dy);
                        newTop = startTop + (startH - newH);
                    }
                } else if (handleType === 'tl') {
                    if (keepAspect) {
                        const scaleW = Math.max(80, startW - dx) / startW;
                        const scaleH = Math.max(80, startH - dy) / startH;
                        const scale = (Math.abs(dx) > Math.abs(dy)) ? scaleW : scaleH;
                        newW = Math.max(80, startW * scale);
                        newH = Math.max(80, newW / origAspect);
                        newLeft = startLeft + (startW - newW);
                        newTop = startTop + (startH - newH);
                    } else {
                        newW = Math.max(80, startW - dx);
                        newH = Math.max(80, startH - dy);
                        newLeft = startLeft + (startW - newW);
                        newTop = startTop + (startH - newH);
                    }
                }

                frame.style.width = Math.round(newW) + 'px';
                frame.style.height = Math.round(newH) + 'px';
                frame.style.left = Math.round(newLeft) + 'px';
                frame.style.top = Math.round(newTop) + 'px';

                this.applyImageZoomPan(frame);
                this.syncSettingsPanelWithFrame(frame);
                if (window.Template3DFrame) {
                    if ((parseFloat(frame.dataset.depth) || 0) > 0 && typeof window.Template3DFrame.updateExtrusion === 'function') {
                        window.Template3DFrame.updateExtrusion(frame);
                    }
                    if (typeof window.Template3DFrame.updateGizmoPosition === 'function') {
                        window.Template3DFrame.updateGizmoPosition(frame);
                    }
                }
            };

            const onMouseUp = () => {
                this.resizingFrame = null;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                if (window.SmartGuides && typeof window.SmartGuides.clear === 'function') {
                    window.SmartGuides.clear();
                }
                if (typeof window.recordHistory === 'function') {
                    window.recordHistory('Çerçeve Boyutlandırıldı');
                }
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        },

        /**
         * 🧠 Bellek Koruması: Çerçeve fotoğrafını makul çözünürlüğe indirir (uzun kenar en fazla 3200 px).
         * - Yalnızca File veya büyük data: URL'ler işlenir; http URL'ler ve küçük görseller aynen döner.
         * - Bir kez optimize edilen görsel tekrar sıkıştırılmaz (geri al / ileri al sırasında kalite kaybı olmaz).
         * - PNG / WEBP / GIF kaynaklar şeffaflık korunsun diye PNG, diğerleri JPEG 0.92 olarak kodlanır.
         */
        _FRAME_IMG_MAX_SIDE: 3200,
        _FRAME_IMG_STRING_THRESHOLD: 3500000,
        _optimizedFrameSrcKeys: new Set(),

        _frameSrcKey: function(src) {
            if (typeof src !== 'string') return '';
            return src.length + ':' + src.slice(-48);
        },

        _optimizeFrameImageSrc: function(src, mimeHint) {
            return new Promise((resolve) => {
                if (typeof src !== 'string' || !src.startsWith('data:image/')) return resolve(src);
                if (src.length < this._FRAME_IMG_STRING_THRESHOLD) return resolve(src);
                if (this._optimizedFrameSrcKeys.has(this._frameSrcKey(src))) return resolve(src);

                const probe = new Image();
                probe.onload = () => {
                    try {
                        const w = probe.naturalWidth || probe.width;
                        const h = probe.naturalHeight || probe.height;
                        const maxSide = Math.max(w, h);
                        if (!w || !h || maxSide <= this._FRAME_IMG_MAX_SIDE) {
                            this._optimizedFrameSrcKeys.add(this._frameSrcKey(src));
                            return resolve(src);
                        }
                        const ratio = this._FRAME_IMG_MAX_SIDE / maxSide;
                        const canvas = document.createElement('canvas');
                        canvas.width = Math.round(w * ratio);
                        canvas.height = Math.round(h * ratio);
                        const ctx = canvas.getContext('2d');
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(probe, 0, 0, canvas.width, canvas.height);

                        const mime = (mimeHint || src.slice(5, src.indexOf(';'))).toLowerCase();
                        const keepAlpha = /png|webp|gif/.test(mime);
                        const out = keepAlpha ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.92);
                        canvas.width = canvas.height = 0; // GPU / bellek tahliyesi
                        this._optimizedFrameSrcKeys.add(this._frameSrcKey(out));
                        resolve(out);
                    } catch (err) {
                        console.warn('[TemplateBuilder] Görsel optimize edilemedi, orijinal kullanılıyor:', err);
                        resolve(src);
                    }
                };
                probe.onerror = () => resolve(src);
                probe.src = src;
            });
        },

        /**
         * Çerçevenin İçine Fotoğraf Yükle
         */
        loadPhotoIntoFrame: function(frame, fileOrUrl) {
            // Geri al / ileri al geri yüklemesi sırasında çağrıldıysa yeni geçmiş adımı yazılmamalı
            const calledDuringRestore = !!window.isHistoryRestoring;
            const applyImg = (dataUrl) => {
                const clip = frame.querySelector('.tb-frame-clip') || frame;
                const inner = clip.querySelector('.tb-frame-inner') || clip;
                let img = frame.querySelector('.tb-frame-img');
                if (!img) {
                    img = document.createElement('img');
                    img.className = 'tb-frame-img';
                    inner.insertBefore(img, inner.firstChild);
                }

                const finalizeImageLoad = () => {
                    this.applyFrameStyling(frame);
                    this.applyImageZoomPan(frame);
                    this.syncSettingsPanelWithFrame(frame);

                    if (window.Template3DFrame) {
                        if (typeof window.Template3DFrame.applyTransform === 'function') {
                            window.Template3DFrame.applyTransform(frame);
                        }
                        if (typeof window.Template3DFrame.syncPanel === 'function') {
                            window.Template3DFrame.syncPanel(frame);
                        }
                        if (typeof window.Template3DFrame.updateGizmoPosition === 'function') {
                            window.Template3DFrame.updateGizmoPosition(frame);
                        }
                    }
                };

                img.onload = () => {
                    finalizeImageLoad();
                };
                img.src = dataUrl;
                frame.dataset.imgSrc = dataUrl;
                frame.classList.add('has-image');

                const placeholder = frame.querySelector('.tb-frame-placeholder');
                if (placeholder) placeholder.style.display = 'none';

                if (img.complete && img.naturalWidth > 0) {
                    finalizeImageLoad();
                }
                this.selectFrame(frame);

                if (!calledDuringRestore && !window.isHistoryRestoring && typeof window.recordHistory === 'function') {
                    window.recordHistory('Çerçeveye Fotoğraf Yüklendi');
                }
            };

            if (typeof fileOrUrl === 'string') {
                const key = this._frameSrcKey(fileOrUrl);
                if (!fileOrUrl.startsWith('data:image/') || fileOrUrl.length < this._FRAME_IMG_STRING_THRESHOLD || this._optimizedFrameSrcKeys.has(key)) {
                    applyImg(fileOrUrl); // Küçük / uzak / zaten optimize görsel: eskisi gibi anında uygula
                } else {
                    this._optimizeFrameImageSrc(fileOrUrl).then(applyImg);
                }
            } else if (fileOrUrl instanceof File) {
                const reader = new FileReader();
                const mimeHint = fileOrUrl.type || '';
                reader.onload = (e) => {
                    this._optimizeFrameImageSrc(e.target.result, mimeHint).then(applyImg);
                };
                reader.onerror = () => {
                    if (typeof window.showAppToast === 'function') window.showAppToast('Fotoğraf okunamadı.', 'error');
                };
                reader.readAsDataURL(fileOrUrl);
            }
        },

        /**
         * İki Çerçeve Arasında Görselleri ve Ayarlarını Takas Et (Swap Images)
         */
        swapFrameImages: function(frameA, frameB) {
            if (!frameA || !frameB || frameA === frameB) return;

            const hasImgA = frameA.classList.contains('has-image') && !!frameA.dataset.imgSrc;
            const hasImgB = frameB.classList.contains('has-image') && !!frameB.dataset.imgSrc;

            // İki çerçeve de boşsa işlem yapma
            if (!hasImgA && !hasImgB) return;

            // A çerçevenin görsel verilerini sakla
            const dataA = {
                hasImage: hasImgA,
                src: frameA.dataset.imgSrc || '',
                zoom: frameA.dataset.imgZoom || '1.0',
                panX: frameA.dataset.imgPanX || '0',
                panY: frameA.dataset.imgPanY || '0'
            };

            // B çerçevenin görsel verilerini sakla
            const dataB = {
                hasImage: hasImgB,
                src: frameB.dataset.imgSrc || '',
                zoom: frameB.dataset.imgZoom || '1.0',
                panX: frameB.dataset.imgPanX || '0',
                panY: frameB.dataset.imgPanY || '0'
            };

            // Verileri çapraz olarak uygula
            this._applyImageDataToFrame(frameA, dataB);
            this._applyImageDataToFrame(frameB, dataA);

            // Başarı görsel parıltı animasyonu (Swap Pop)
            [frameA, frameB].forEach(f => {
                f.classList.add('tb-swap-pop');
                setTimeout(() => f.classList.remove('tb-swap-pop'), 400);
            });

            this.selectFrame(frameB);

            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Çerçeve Görselleri Yer Değiştirildi');
            }
        },

        /**
         * Çerçeveye Görsel Veri Paketini Uygula
         */
        _applyImageDataToFrame: function(frame, data) {
            const clip = frame.querySelector('.tb-frame-clip') || frame;
            const inner = clip.querySelector('.tb-frame-inner') || clip;
            const placeholder = frame.querySelector('.tb-frame-placeholder');
            let img = frame.querySelector('.tb-frame-img');

            if (data.hasImage && data.src) {
                frame.dataset.imgSrc = data.src;
                frame.dataset.imgZoom = data.zoom;
                frame.dataset.imgPanX = data.panX;
                frame.dataset.imgPanY = data.panY;
                frame.classList.add('has-image');

                if (!img) {
                    img = document.createElement('img');
                    img.className = 'tb-frame-img';
                    inner.insertBefore(img, inner.firstChild);
                }
                const finalizeSwapImage = () => {
                    this.applyFrameStyling(frame);
                    this.applyImageZoomPan(frame);
                    this.syncSettingsPanelWithFrame(frame);

                    if (window.Template3DFrame) {
                        if (typeof window.Template3DFrame.applyTransform === 'function') {
                            window.Template3DFrame.applyTransform(frame);
                        }
                        if (typeof window.Template3DFrame.syncPanel === 'function') {
                            window.Template3DFrame.syncPanel(frame);
                        }
                        if (typeof window.Template3DFrame.updateGizmoPosition === 'function') {
                            window.Template3DFrame.updateGizmoPosition(frame);
                        }
                    }
                };

                img.onload = () => {
                    finalizeSwapImage();
                };
                img.src = data.src;
                img.style.display = 'block';

                if (placeholder) placeholder.style.display = 'none';

                if (img.complete && img.naturalWidth > 0) {
                    finalizeSwapImage();
                }
            } else {
                delete frame.dataset.imgSrc;
                frame.dataset.imgZoom = '1.0';
                frame.dataset.imgPanX = '0';
                frame.dataset.imgPanY = '0';
                frame.classList.remove('has-image');

                if (img) img.remove();
                if (placeholder) placeholder.style.display = 'flex';
                this.applyFrameStyling(frame);
            }
        },

        /**
         * Çerçeve İçi Fotoğraf Odak / Pan Modunu Aç / Kapat
         */
        toggleImagePanMode: function(frame, forceState) {
            if (!frame || !frame.classList.contains('has-image')) return;
            const willEnable = (forceState !== undefined) ? forceState : !frame.classList.contains('tb-pan-mode');

            // Diğer tüm çerçevelerdeki pan modunu temizle
            document.querySelectorAll('.tb-image-frame.tb-pan-mode').forEach(f => {
                if (f !== frame) {
                    f.classList.remove('tb-pan-mode');
                    const ind = f.querySelector('.tb-pan-indicator');
                    if (ind) ind.remove();
                    const b = f.querySelector('.tb-btn-pan');
                    if (b) b.classList.remove('active');
                }
            });

            if (willEnable) {
                frame.classList.add('tb-pan-mode');
                let indicator = frame.querySelector('.tb-pan-indicator');
                if (!indicator) {
                    indicator = document.createElement('div');
                    indicator.className = 'tb-pan-indicator';
                    indicator.innerHTML = '<i class="fa-solid fa-arrows-up-down-left-right"></i> Foto Kaydır';
                    frame.appendChild(indicator);
                }
            } else {
                frame.classList.remove('tb-pan-mode');
                const ind = frame.querySelector('.tb-pan-indicator');
                if (ind) ind.remove();
            }

            const panBtn = frame.querySelector('.tb-btn-pan');
            if (panBtn) panBtn.classList.toggle('active', willEnable);
            if (this.selectedFrame === frame) {
                this.updateDockControls(true);
            }
        },

        /**
         * Çerçeve İçi Fotoğraf Zoom & Pan
         */
        applyImageZoomPan: function(frame) {
            if (!frame) return;
            const img = frame.querySelector('.tb-frame-img');
            if (!img) return;

            const zoom = Math.max(0.2, parseFloat(frame.dataset.imgZoom) || 1.0);
            let panX = parseFloat(frame.dataset.imgPanX) || 0;
            let panY = parseFloat(frame.dataset.imgPanY) || 0;

            const frameW = frame.offsetWidth || parseFloat(frame.style.width) || 300;
            const frameH = frame.offsetHeight || parseFloat(frame.style.height) || 300;

            const natW = img.naturalWidth || 0;
            const natH = img.naturalHeight || 0;

            if (natW > 0 && natH > 0 && frameW > 0 && frameH > 0) {
                const coverScale = Math.max(frameW / natW, frameH / natH) * zoom;
                const imgW = Math.round(natW * coverScale);
                const imgH = Math.round(natH * coverScale);

                img.style.width = imgW + 'px';
                img.style.height = imgH + 'px';
                img.style.minWidth = '0';
                img.style.minHeight = '0';
                img.style.maxWidth = 'none';
                img.style.maxHeight = 'none';
                img.style.objectFit = 'fill';

                // Arka boşluk görünse dahi fotoğrafın istenilen kısmının çerçeve merkezine rahatça ortalanabilmesi için serbest kaydırma sınırı
                const maxPanX = Math.max(Math.round(frameW * 0.95), Math.round(imgW * 0.95), 500);
                const maxPanY = Math.max(Math.round(frameH * 0.95), Math.round(imgH * 0.95), 500);

                if (panX > maxPanX) panX = maxPanX;
                if (panX < -maxPanX) panX = -maxPanX;
                if (panY > maxPanY) panY = maxPanY;
                if (panY < -maxPanY) panY = -maxPanY;

                frame.dataset.imgPanX = panX;
                frame.dataset.imgPanY = panY;

                const pxInput = document.getElementById('tbFramePanX');
                const pxVal = document.getElementById('tbFramePanXVal');
                const pyInput = document.getElementById('tbFramePanY');
                const pyVal = document.getElementById('tbFramePanYVal');

                const boundX = Math.round(maxPanX);
                const boundY = Math.round(maxPanY);

                if (pxInput && document.activeElement !== pxInput) {
                    pxInput.min = -boundX;
                    pxInput.max = boundX;
                    pxInput.value = Math.round(panX);
                }
                if (pxVal) pxVal.textContent = Math.round(panX) + 'px';

                if (pyInput && document.activeElement !== pyInput) {
                    pyInput.min = -boundY;
                    pyInput.max = boundY;
                    pyInput.value = Math.round(panY);
                }
                if (pyVal) pyVal.textContent = Math.round(panY) + 'px';
            }

            img.style.transform = 'translate(calc(-50% + ' + panX + 'px), calc(-50% + ' + panY + 'px))';
        },

        /**
         * Çerçeve Seçimi
         */
        selectFrame: function(frame, opts) {
            document.querySelectorAll('.tb-image-frame').forEach(f => {
                f.classList.remove('selected', 'el-selected');
                if (f !== frame) {
                    f._readyForImageClick = false;
                    if (f.classList.contains('tb-pan-mode')) {
                        f.classList.remove('tb-pan-mode');
                        const ind = f.querySelector('.tb-pan-indicator');
                        if (ind) ind.remove();
                    }
                    if (f.classList.contains('has-shape') || (f.dataset.shape && f.dataset.shape !== 'none') || f.dataset.isPolygon === 'true') {
                        this.updateShapeContour(f);
                    }
                }
            });
            if (this.selectedFrame !== frame && frame) {
                frame._readyForImageClick = false;
            }
            this.selectedFrame = frame;
            if (frame) {
                frame.classList.add('selected', 'el-selected');
                this.updateShapeContour(frame);
                const fTop = parseFloat(frame.style.top) || frame.offsetTop || 0;
                frame.classList.toggle('tools-below', fTop < 42);
                window.selectedEl = frame;
                window.selectedElements = [frame];
                if (typeof selectedEl !== 'undefined') selectedEl = frame;

                this.applyImageZoomPan(frame);
                this.syncSettingsPanelWithFrame(frame);

                if (window.Template3DFrame) {
                    if (typeof window.Template3DFrame.applyTransform === 'function') {
                        window.Template3DFrame.applyTransform(frame);
                    }
                    if (typeof window.Template3DFrame.syncPanel === 'function') {
                        window.Template3DFrame.syncPanel(frame);
                    }
                }

                const settingsPanel = document.getElementById('tbFrameSettingsSection');
                if (settingsPanel) {
                    settingsPanel.style.display = 'block';

                    // Kullanıcı isteği: Çerçeve seçilince panel otomatik olarak Çerçeve Ayarları bölümüne kaysın
                    setTimeout(() => {
                        settingsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 60);
                }

                // 3D Gizmo Otomatik Yönetimi: 3D öge seçildiğinde veya zaten aktifse Gizmo'yu aç
                const has3D = (parseFloat(frame.dataset.pitch) || 0) !== 0 ||
                              (parseFloat(frame.dataset.yaw) || 0) !== 0 ||
                              (parseFloat(frame.dataset.elevation) || 0) !== 0 ||
                              (parseFloat(frame.dataset.depth) || 0) !== 0 ||
                              frame.dataset.has3D === 'true';

                if (window.Template3DFrame && typeof window.Template3DFrame.showGizmo === 'function') {
                    const shouldOpenGizmo = (opts && opts.skipGizmoAutoOpen) ? false : (has3D && !frame._gizmoDismissed);
                    if (shouldOpenGizmo || (window.Template3DFrame.isGizmoActive && window.Template3DFrame.isGizmoActive())) {
                        window.Template3DFrame.showGizmo(frame);
                    }
                }

                this.updateDockControls(true);
                if (window.DockContextManager && typeof window.DockContextManager.onElementSelected === 'function') {
                    window.DockContextManager.onElementSelected(frame);
                }
            } else {
                document.querySelectorAll('.tb-image-frame').forEach(f => {
                    delete f._gizmoDismissed;
                });
                if (window.selectedEl && window.selectedEl.classList && window.selectedEl.classList.contains('tb-image-frame')) {
                    window.selectedEl = null;
                    window.selectedElements = [];
                    if (typeof selectedEl !== 'undefined') selectedEl = null;
                }
                const settingsPanel = document.getElementById('tbFrameSettingsSection');
                if (settingsPanel) settingsPanel.style.display = 'none';
                this._lastSelectedFrameForAccordion = null;

                if (window.Template3DFrame && typeof window.Template3DFrame.syncPanel === 'function') {
                    window.Template3DFrame.syncPanel(null);
                }
                if (window.Template3DFrame && typeof window.Template3DFrame.hideGizmo === 'function') {
                    window.Template3DFrame.hideGizmo();
                }

                document.querySelectorAll('.tb-shape-card').forEach(card => card.classList.remove('active'));
                this.updateDockControls(false);

            setTimeout(() => {
                document.querySelectorAll('.tb-image-frame.has-image').forEach(f => {
                    this.applyImageZoomPan(f);
                });
            }, 60);
            }
        },

        /**
         * Çerçeve Seçimini Kaldır
         */
        deselectFrame: function() {
            document.querySelectorAll('.tb-image-frame').forEach(f => {
                f.classList.remove('selected', 'el-selected');
                f._readyForImageClick = false;
                if (f.classList.contains('tb-pan-mode')) {
                    this.toggleImagePanMode(f, false);
                }
                if (f.classList.contains('has-shape') || (f.dataset.shape && f.dataset.shape !== 'none') || f.dataset.isPolygon === 'true') {
                    this.updateShapeContour(f);
                }
            });
            this.selectFrame(null);
        },

        /**
         * Yan Panel Ayarlarını Seçili Çerçeveyle Eşitle
         */
        syncSettingsPanelWithFrame: function(frame) {
            if (!frame) return;

            const radInput = document.getElementById('tbFrameRadius');
            const radVal = document.getElementById('tbFrameRadiusVal');
            const bwInput = document.getElementById('tbFrameBorderWidth');
            const bwVal = document.getElementById('tbFrameBorderWidthVal');
            const bcInput = document.getElementById('tbFrameBorderColor');
            const shInput = document.getElementById('tbFrameShadow');
            const shVal = document.getElementById('tbFrameShadowVal');
            const zoomInput = document.getElementById('tbFrameZoom');
            const zoomVal = document.getElementById('tbFrameZoomVal');

            const isCircle = frame.dataset.isCircle === 'true';
            if (radInput) radInput.value = isCircle ? 300 : (frame.dataset.radius || 0);
            if (radVal) radVal.textContent = isCircle ? 'Tam Daire' : ((frame.dataset.radius || 0) + 'px');

            if (bwInput) bwInput.value = frame.dataset.borderWidth || 0;
            if (bwVal) bwVal.textContent = (frame.dataset.borderWidth || 0) + 'px';

            if (bcInput) bcInput.value = frame.dataset.borderColor || '#ffffff';

            if (shInput) shInput.value = frame.dataset.shadow || 0;
            if (shVal) shVal.textContent = (frame.dataset.shadow || 0) + 'px';

            const zoom = parseFloat(frame.dataset.imgZoom) || 1.0;
            if (zoomInput) zoomInput.value = Math.round(zoom * 100);
            if (zoomVal) zoomVal.textContent = Math.round(zoom * 100) + '%';

            const panX = parseInt(frame.dataset.imgPanX) || 0;
            const panY = parseInt(frame.dataset.imgPanY) || 0;
            const panXInput = document.getElementById('tbFramePanX');
            const panXVal = document.getElementById('tbFramePanXVal');
            const pyInput = document.getElementById('tbFramePanY');
            const pyVal = document.getElementById('tbFramePanYVal');

            const fImg = frame.querySelector('.tb-frame-img');
            const fFrameW = frame.offsetWidth || parseFloat(frame.style.width) || 300;
            const fFrameH = frame.offsetHeight || parseFloat(frame.style.height) || 300;
            const fNatW = (fImg && fImg.naturalWidth) || 0;
            const fNatH = (fImg && fImg.naturalHeight) || 0;
            if (fNatW > 0 && fNatH > 0 && fFrameW > 0 && fFrameH > 0) {
                const fCoverScale = Math.max(fFrameW / fNatW, fFrameH / fNatH) * zoom;
                const fImgW = Math.round(fNatW * fCoverScale);
                const fImgH = Math.round(fNatH * fCoverScale);
                const fMaxPanX = Math.max(Math.round(fFrameW * 0.95), Math.round(fImgW * 0.95), 500);
                const fMaxPanY = Math.max(Math.round(fFrameH * 0.95), Math.round(fImgH * 0.95), 500);
                if (panXInput) {
                    panXInput.min = -Math.round(fMaxPanX);
                    panXInput.max = Math.round(fMaxPanX);
                }
                if (pyInput) {
                    pyInput.min = -Math.round(fMaxPanY);
                    pyInput.max = Math.round(fMaxPanY);
                }
            } else {
                const fMaxPanX = Math.max(Math.round(fFrameW * 0.95), 500);
                const fMaxPanY = Math.max(Math.round(fFrameH * 0.95), 500);
                if (panXInput) {
                    panXInput.min = -fMaxPanX;
                    panXInput.max = fMaxPanX;
                }
                if (pyInput) {
                    pyInput.min = -fMaxPanY;
                    pyInput.max = fMaxPanY;
                }
            }

            if (panXInput) panXInput.value = panX;
            if (panXVal) panXVal.textContent = panX + 'px';
            if (pyInput) pyInput.value = panY;
            if (pyVal) pyVal.textContent = panY + 'px';

            const rotInput = document.getElementById('tbFrameRotation');
            const rotVal = document.getElementById('tbFrameRotationVal');
            if (rotInput) rotInput.value = frame.dataset.rotation || 0;
            if (rotVal) rotVal.textContent = (frame.dataset.rotation || 0) + '°';

            const depthInput = document.getElementById('tbFrameDepth');
            const depthVal = document.getElementById('tbFrameDepthVal');
            const depthColorInput = document.getElementById('tbFrameDepthColor');
            if (depthInput) depthInput.value = frame.dataset.depth || 0;
            if (depthVal) depthVal.textContent = (frame.dataset.depth || 0) + 'px';
            if (depthColorInput) depthColorInput.value = frame.dataset.depthColor || '#334155';

            // Degrade butonlarının aktifliğini ve akordiyon durumunu güncelle
            const curBlend = frame.dataset.blendMode || 'none';
            document.querySelectorAll('.tb-blend-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.blend === curBlend);
            });
            const blendAcc = document.getElementById('tbBlendAccordion');
            const blendBadge = document.getElementById('tbBlendBadge');
            if (blendBadge) {
                blendBadge.textContent = curBlend === 'bottom' ? 'Aşağı' : (curBlend === 'right' ? 'Sağa' : '');
            }
            if (blendAcc) {
                if (curBlend !== 'none') {
                    blendAcc.open = true;
                } else if (this._lastSelectedFrameForAccordion !== frame) {
                    blendAcc.open = false;
                }
            }
            this._lastSelectedFrameForAccordion = frame;

            // Şekil kartlarının ve etiketinin aktifliğini güncelle
            const curShape = frame.dataset.shape || 'none';
            document.querySelectorAll('.tb-shape-card').forEach(card => {
                card.classList.toggle('active', card.dataset.shape === curShape);
            });

            const shapeLabel = document.getElementById('tbCurrentShapeLabel');
            if (shapeLabel) {
                if (frame.dataset.isPolygon === 'true') {
                    shapeLabel.textContent = 'Serbest Çokgen';
                } else if (frame.dataset.isCircle === 'true') {
                    shapeLabel.textContent = 'Tam Daire';
                } else if (curShape === 'none') {
                    shapeLabel.textContent = 'Standart Kutu';
                } else {
                    const found = this.shapes.find(s => s.id === curShape);
                    shapeLabel.textContent = found ? found.name : curShape;
                }
            }

            if (window.Template3DFrame && typeof window.Template3DFrame.syncPanel === 'function') {
                window.Template3DFrame.syncPanel(frame);
            }
        },

        /**
         * Aktif veya Çoklu Seçili Tüm Çerçeveleri Döner
         */
        getTargetFrames: function(explicitFrame) {
            if (explicitFrame && explicitFrame.parentNode) return [explicitFrame];
            const list = Array.isArray(window.selectedElements)
                ? window.selectedElements.filter(el => el && el.parentNode && el.classList && el.classList.contains('tb-image-frame'))
                : [];
            if (list.length > 0) return Array.from(new Set(list));
            return (this.selectedFrame && this.selectedFrame.parentNode) ? [this.selectedFrame] : [];
        },

        /**
         * Pürüzsüz Degrade Geçiş Modunu Ayarla (Fade to Background)
         */
        setFrameBlend: function(mode) {
            const frames = this.getTargetFrames();
            if (frames.length === 0) return;
            const primary = this.selectedFrame && frames.includes(this.selectedFrame) ? this.selectedFrame : frames[frames.length - 1];
            this.selectedFrame = primary;

            frames.forEach(frame => {
                frame.dataset.blendMode = mode;
                this.applyFrameStyling(frame);
            });

            document.querySelectorAll('.tb-blend-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.blend === mode);
            });
            const blendAcc = document.getElementById('tbBlendAccordion');
            const blendBadge = document.getElementById('tbBlendBadge');
            if (blendAcc && mode !== 'none') {
                blendAcc.open = true;
            }
            if (blendBadge) {
                blendBadge.textContent = mode === 'bottom' ? 'Aşağı' : (mode === 'right' ? 'Sağa' : '');
            }
            this.syncSettingsPanelWithFrame(primary);
            this.updateDockControls(true);
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Çerçeve Geçişi Değiştirildi');
            }
        },

        /**
         * Yaratıcı Vektör Maske Şekli Ayarla (Bulut, Fırça, Kemer, Yırtık, vb.)
         */
        setFrameShape: function(shapeId) {
            const frames = this.getTargetFrames();
            if (frames.length === 0) return;
            const primary = this.selectedFrame && frames.includes(this.selectedFrame) ? this.selectedFrame : frames[frames.length - 1];
            this.selectedFrame = primary;

            const list = this.shapes || (typeof window !== 'undefined' && window.TemplateShapesData) || [];
            const sDef = list.find(s => s.id === shapeId);

            frames.forEach(frame => {
                frame.dataset.shape = shapeId;
                if (shapeId === 'none') {
                    frame.dataset.isPolygon = 'false';
                    frame.dataset.polygonClip = '';
                    frame.dataset.polygonPoints = '';
                    frame.dataset.isCircle = 'false';
                    frame.dataset.radius = 12;
                    const clip = frame.querySelector('.tb-frame-clip') || frame;
                    clip.style.clipPath = 'none';
                    clip.style.webkitClipPath = 'none';
                } else {
                    frame.dataset.isCircle = 'false';
                    const polyPts = this.normalizeShapePolygonPoints(sDef);
                    if (polyPts) {
                        frame.dataset.isPolygon = 'true';
                        frame.dataset.polygonPoints = JSON.stringify(polyPts);
                        frame.dataset.polygonClip = `polygon(${polyPts.map(p => `${p.x}% ${p.y}%`).join(', ')})`;
                    } else if (shapeId === 'polygon-hexagon') {
                        frame.dataset.isPolygon = 'true';
                        frame.dataset.polygonPoints = JSON.stringify([
                            { x: 50, y: 2 }, { x: 96, y: 26 }, { x: 96, y: 74 },
                            { x: 50, y: 98 }, { x: 4, y: 74 }, { x: 4, y: 26 }
                        ]);
                        frame.dataset.polygonClip = 'polygon(50% 2%, 96% 26%, 96% 74%, 50% 98%, 4% 74%, 4% 26%)';
                    } else {
                        frame.dataset.isPolygon = 'false';
                        frame.dataset.polygonPoints = '';
                        frame.dataset.polygonClip = '';
                    }
                }
                this.applyFrameStyling(frame);
            });

            this.syncSettingsPanelWithFrame(primary);
            this.updateDockControls(true);
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Çerçeve Şekli Değiştirildi');
            }
        },

        /**
         * Seçili Çerçeveleri Kareye ve Tam Daireye Eşitle
         */
        makeSelectedFrameCircle: function() {
            const frames = this.getTargetFrames();
            if (frames.length === 0) return;
            const primary = this.selectedFrame && frames.includes(this.selectedFrame) ? this.selectedFrame : frames[frames.length - 1];
            this.selectedFrame = primary;

            frames.forEach(frame => {
                const w = frame.offsetWidth || parseFloat(frame.style.width) || 400;
                const h = frame.offsetHeight || parseFloat(frame.style.height) || 400;
                const s = Math.min(w, h);
                frame.style.width = s + 'px';
                frame.style.height = s + 'px';
                frame.dataset.isCircle = 'true';
                frame.dataset.radius = 999;
                frame.dataset.shape = 'none';
                frame.dataset.isPolygon = 'false';
                frame.dataset.polygonClip = '';
                frame.dataset.polygonPoints = '';
                const clip = frame.querySelector('.tb-frame-clip') || frame;
                clip.style.clipPath = 'none';
                clip.style.webkitClipPath = 'none';
                this.applyFrameStyling(frame);
            });

            this.syncSettingsPanelWithFrame(primary);
            this.updateDockControls(true);
            if (window.Template3DFrame && typeof window.Template3DFrame.updateGizmoPosition === 'function') {
                window.Template3DFrame.updateGizmoPosition(primary);
            }
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Çerçeve Tam Daire Yapıldı');
            }
        },

        /**
         * Seçili Çerçeveleri Kareye ve Altıgene Eşitle
         */
        makeSelectedFrameHexagon: function() {
            const frames = this.getTargetFrames();
            if (frames.length === 0) return;
            const primary = this.selectedFrame && frames.includes(this.selectedFrame) ? this.selectedFrame : frames[frames.length - 1];
            this.selectedFrame = primary;

            const hexPoints = JSON.stringify([
                { x: 50, y: 2 },
                { x: 96, y: 26 },
                { x: 96, y: 74 },
                { x: 50, y: 98 },
                { x: 4, y: 74 },
                { x: 4, y: 26 }
            ]);
            const hexClip = 'polygon(50% 2%, 96% 26%, 96% 74%, 50% 98%, 4% 74%, 4% 26%)';

            frames.forEach(frame => {
                const w = frame.offsetWidth || parseFloat(frame.style.width) || 400;
                const h = frame.offsetHeight || parseFloat(frame.style.height) || 400;
                const s = Math.min(w, h);
                frame.style.width = s + 'px';
                frame.style.height = s + 'px';
                frame.dataset.isCircle = 'false';
                frame.dataset.shape = 'polygon-hexagon';
                frame.dataset.radius = 0;
                frame.dataset.isPolygon = 'true';
                frame.dataset.polygonClip = hexClip;
                frame.dataset.polygonPoints = hexPoints;
                const clip = frame.querySelector('.tb-frame-clip') || frame;
                clip.style.clipPath = hexClip;
                clip.style.webkitClipPath = hexClip;
                this.applyFrameStyling(frame);
            });

            this.syncSettingsPanelWithFrame(primary);
            this.updateDockControls(true);
            if (window.Template3DFrame && typeof window.Template3DFrame.updateGizmoPosition === 'function') {
                window.Template3DFrame.updateGizmoPosition(primary);
            }
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Çerçeve Altıgen Yapıldı');
            }
        },

        /**
         * Şekil Kartına Tıklandığında: Seçili çerçeve varsa şeklini değiştir, yoksa yeni şekilli çerçeve aç
         */
        applyShapeOrNew: function(shapeId) {
            const frames = this.getTargetFrames();
            if (frames.length > 0) {
                const primary = this.selectedFrame && frames.includes(this.selectedFrame) ? this.selectedFrame : frames[frames.length - 1];
                const curShape = primary.dataset.shape || 'none';
                if (curShape === shapeId) {
                    this.setFrameShape('none');
                } else {
                    this.setFrameShape(shapeId);
                }
            } else {
                this.createImageFrame({ shape: shapeId });
            }
        },

        /**
         * Şekil Kategorisi Filtreleme
         */
        filterShapes: function(cat) {
            this.activeShapeFilter = cat;
            document.querySelectorAll('.tb-shapes-cat-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.cat === cat);
            });
            this.renderShapeSelector();
        },

        /**
         * Şekil Arama Girişi
         */
        onShapeSearch: function(query) {
            this.shapeSearchQuery = (query || '').trim().toLowerCase();
            const clearBtn = document.getElementById('tbShapeSearchClear');
            if (clearBtn) clearBtn.style.display = this.shapeSearchQuery ? 'block' : 'none';
            this.renderShapeSelector();
        },

        /**
         * Şekil Arama Temizleme
         */
        clearShapeSearch: function() {
            this.shapeSearchQuery = '';
            const input = document.getElementById('tbShapeSearchInput');
            if (input) input.value = '';
            const clearBtn = document.getElementById('tbShapeSearchClear');
            if (clearBtn) clearBtn.style.display = 'none';
            this.renderShapeSelector();
        },

        /**
         * Şekil Seçici Izgarasını Doldur (134 Şekil & SVG Canlı Önizleme)
         */
        renderShapeSelector: function() {
            const grid = document.getElementById('tbShapesGrid');
            if (!grid) return;

            if ((!this.shapes || this.shapes.length === 0) && typeof window !== 'undefined' && window.TemplateShapesData) {
                this.shapes = window.TemplateShapesData;
            }

            grid.innerHTML = '';
            let filtered = this.shapes || [];

            // Kategori Filtresi
            if (this.activeShapeFilter !== 'all') {
                filtered = filtered.filter(s => s.category === this.activeShapeFilter);
            }

            // Arama Sorgusu
            if (this.shapeSearchQuery) {
                filtered = filtered.filter(s => 
                    s.name.toLowerCase().includes(this.shapeSearchQuery) ||
                    s.id.toLowerCase().includes(this.shapeSearchQuery)
                );
            }

            if (filtered.length === 0) {
                grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:18px 8px; font-size:11px; color:var(--text-muted, #64748b);">Aradığınız kriterde şekil bulunamadı.</div>';
                return;
            }

            const selectedShape = this.selectedFrame ? (this.selectedFrame.dataset.shape || 'none') : 'none';

            filtered.forEach(s => {
                const card = document.createElement('div');
                card.className = 'tb-shape-card' + (selectedShape === s.id ? ' active' : '');
                card.dataset.shape = s.id;
                card.dataset.cat = s.category;
                card.title = s.name + ' Çerçeve';
                card.onclick = () => this.applyShapeOrNew(s.id);
                
                const previewSvg = s.path 
                    ? `<path d="${s.path}" fill="currentColor"/>`
                    : `<polygon points="${s.polygon}" fill="currentColor"/>`;

                card.innerHTML = `
                    <svg viewBox="${s.viewBox}" class="tb-shape-svg-preview">
                        ${previewSvg}
                    </svg>
                    <span>${s.name}</span>
                `;
                grid.appendChild(card);
            });
        },

        /**
         * Tuval Altı Dock İçin Döngüsel Şekil Değiştirici
         */
        cycleFrameShape: function() {
            const frames = this.getTargetFrames();
            if (frames.length === 0) return;
            const primary = this.selectedFrame && frames.includes(this.selectedFrame) ? this.selectedFrame : frames[frames.length - 1];
            const cycleList = [
                'none', 
                'cloud-fluffy', 
                'brush-bold', 
                'brush-wash', 
                'blob-organic', 
                'blob-smooth', 
                'arch-classic', 
                'arch-gothic', 
                'torn-paper', 
                'polygon-hexagon', 
                'polygon-diamond', 
                'shield', 
                'heart', 
                'badge-seal-12', 
                'frame-stamp', 
                'nature-leaf'
            ];
            const curShape = primary.dataset.shape || 'none';
            const curIdx = cycleList.indexOf(curShape);
            const nextIdx = (curIdx + 1) % cycleList.length;
            this.setFrameShape(cycleList[nextIdx]);
        },

        /**
         * Yan Panelden Seçili Çerçeve Özelliğini Güncelle
         */
        updateSelectedFrameProp: function(prop, val) {
            const frames = this.getTargetFrames();
            if (frames.length === 0) return;
            const primary = this.selectedFrame && frames.includes(this.selectedFrame) ? this.selectedFrame : frames[frames.length - 1];

            if (prop === 'depth' || prop === 'depthColor') {
                if (window.Template3DFrame && typeof window.Template3DFrame.updateProp === 'function') {
                    window.Template3DFrame.updateProp(prop, val);
                } else {
                    frames.forEach(f => { f.dataset[prop] = val; });
                }
                return;
            }

            if (prop === 'radius') {
                const num = parseInt(val) || 0;
                const v = document.getElementById('tbFrameRadiusVal');
                if (v) v.textContent = num >= 300 ? 'Tam Daire' : (num + 'px');
                const shapeLabel = document.getElementById('tbCurrentShapeLabel');
                if (shapeLabel && (!primary.dataset.shape || primary.dataset.shape === 'none') && primary.dataset.isPolygon !== 'true') {
                    shapeLabel.textContent = num >= 300 ? 'Tam Daire' : 'Standart Kutu';
                }
                frames.forEach(frame => {
                    if (num >= 300) {
                        frame.dataset.isCircle = 'true';
                        frame.dataset.radius = 999;
                    } else {
                        frame.dataset.isCircle = 'false';
                        frame.dataset.radius = num;
                    }
                    this.applyFrameStyling(frame);
                });
                return;
            } else if (prop === 'borderWidth') {
                const v = document.getElementById('tbFrameBorderWidthVal');
                if (v) v.textContent = val + 'px';
                frames.forEach(frame => {
                    frame.dataset.borderWidth = val;
                    this.applyFrameStyling(frame);
                });
                return;
            } else if (prop === 'borderColor') {
                let updatedWidth = false;
                frames.forEach(frame => {
                    frame.dataset.borderColor = val;
                    const isCardFrame = (frame.dataset.shape === 'frame-polaroid' || frame.dataset.shape === 'frame-film');
                    if (!isCardFrame && (parseInt(frame.dataset.borderWidth) || 0) <= 0) {
                        frame.dataset.borderWidth = 4;
                        updatedWidth = true;
                    }
                    this.applyFrameStyling(frame);
                });
                if (updatedWidth) {
                    const primaryBw = parseInt(primary.dataset.borderWidth) || 4;
                    const bwInput = document.getElementById('tbFrameBorderWidth');
                    const bwVal = document.getElementById('tbFrameBorderWidthVal');
                    if (bwInput) bwInput.value = primaryBw;
                    if (bwVal) bwVal.textContent = primaryBw + 'px';
                }
                return;
            } else if (prop === 'shadow') {
                const v = document.getElementById('tbFrameShadowVal');
                if (v) v.textContent = val + 'px';
                frames.forEach(frame => {
                    frame.dataset.shadow = val;
                    const has3D = (parseFloat(frame.dataset.pitch) || 0) !== 0 ||
                                  (parseFloat(frame.dataset.yaw) || 0) !== 0 ||
                                  (parseFloat(frame.dataset.elevation) || 0) !== 0 ||
                                  (parseFloat(frame.dataset.depth) || 0) !== 0;
                    if (has3D && window.Template3DFrame && typeof window.Template3DFrame.applyTransform === 'function') {
                        window.Template3DFrame.applyTransform(frame);
                    } else {
                        this.applyFrameStyling(frame);
                    }
                });
                return;
            } else if (prop === 'rotation') {
                const v = document.getElementById('tbFrameRotationVal');
                if (v) v.textContent = val + '°';
                frames.forEach(frame => {
                    frame.dataset.rotation = val;
                    this.applyFrameStyling(frame);
                });
                return;
            } else if (prop === 'zoom') {
                const z = (parseInt(val) || 100) / 100;
                const v = document.getElementById('tbFrameZoomVal');
                if (v) v.textContent = val + '%';
                frames.forEach(frame => {
                    frame.dataset.imgZoom = z;
                    this.applyImageZoomPan(frame);
                });
                return;
            } else if (prop === 'panX') {
                const num = parseInt(val) || 0;
                const v = document.getElementById('tbFramePanXVal');
                if (v) v.textContent = num + 'px';
                frames.forEach(frame => {
                    frame.dataset.imgPanX = num;
                    this.applyImageZoomPan(frame);
                });
                return;
            } else if (prop === 'panY') {
                const num = parseInt(val) || 0;
                const v = document.getElementById('tbFramePanYVal');
                if (v) v.textContent = num + 'px';
                frames.forEach(frame => {
                    frame.dataset.imgPanY = num;
                    this.applyImageZoomPan(frame);
                });
                return;
            }
        },

        /**
         * Çerçeve İçi Fotoğraf Konumunu Sıfırla (Ortala)
         */
        resetImagePan: function() {
            const frames = this.getTargetFrames();
            if (frames.length === 0) return;
            const primary = this.selectedFrame && frames.includes(this.selectedFrame) ? this.selectedFrame : frames[frames.length - 1];
            frames.forEach(frame => {
                frame.dataset.imgPanX = '0';
                frame.dataset.imgPanY = '0';
                this.applyImageZoomPan(frame);
            });
            this.syncSettingsPanelWithFrame(primary);
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Çerçeve Fotoğrafı Ortalandı');
            }
        },

        /**
         * Çerçeveyi İlk Şablon / Oluşturma Konum ve Boyutuna Sıfırlar
         */
        resetFramePlacement: function(targetFrame) {
            const frames = targetFrame ? [targetFrame] : this.getTargetFrames();
            if (!frames || frames.length === 0) return;
            const cContainer = document.getElementById('canvas-container');
            const cW = cContainer ? (parseFloat(cContainer.style.width) || cContainer.offsetWidth || 1920) : 1920;
            const cH = cContainer ? (parseFloat(cContainer.style.height) || cContainer.offsetHeight || 1080) : 1080;

            frames.forEach(frame => {
                if (!frame) return;
                const curW = frame.offsetWidth || parseFloat(frame.style.width) || Math.min(Math.round(cW * 0.45), 600);
                const curH = frame.offsetHeight || parseFloat(frame.style.height) || Math.min(Math.round(cH * 0.45), 450);
                const origL = (frame.dataset.origLeft !== undefined) ? parseFloat(frame.dataset.origLeft) : Math.max(32, Math.round((cW - curW) / 2));
                const origT = (frame.dataset.origTop !== undefined) ? parseFloat(frame.dataset.origTop) : Math.max(32, Math.round((cH - curH) / 2));
                const origW = (frame.dataset.origWidth !== undefined) ? parseFloat(frame.dataset.origWidth) : curW;
                const origH = (frame.dataset.origHeight !== undefined) ? parseFloat(frame.dataset.origHeight) : curH;

                delete frame.dataset.dragStartX;
                delete frame.dataset.dragStartY;
                delete frame.dataset.scale;
                frame.style.margin = '';
                frame.style.transformOrigin = 'center center';
                frame.style.left = Math.round(origL) + 'px';
                frame.style.top = Math.round(origT) + 'px';
                frame.style.width = Math.round(origW) + 'px';
                frame.style.height = Math.round(origH) + 'px';
                frame.style.right = 'auto';
                frame.style.bottom = 'auto';

                frame.dataset.rotation = frame.dataset.origRotation !== undefined ? frame.dataset.origRotation : '0';
                frame.dataset.pitch = frame.dataset.origPitch !== undefined ? frame.dataset.origPitch : '0';
                frame.dataset.yaw = frame.dataset.origYaw !== undefined ? frame.dataset.origYaw : '0';
                frame.dataset.elevation = frame.dataset.origElevation !== undefined ? frame.dataset.origElevation : '0';
                frame.dataset.depth = frame.dataset.origDepth !== undefined ? frame.dataset.origDepth : '0';
                frame.dataset.perspective = frame.dataset.origPerspective !== undefined ? frame.dataset.origPerspective : '1000';

                const is3DOrig = (parseFloat(frame.dataset.pitch) || 0) !== 0 ||
                                 (parseFloat(frame.dataset.yaw) || 0) !== 0 ||
                                 (parseFloat(frame.dataset.elevation) || 0) !== 0 ||
                                 (parseFloat(frame.dataset.depth) || 0) > 0;
                frame.dataset.has3D = is3DOrig ? 'true' : 'false';

                frame.dataset.imgZoom = '1';
                frame.dataset.imgPanX = '0';
                frame.dataset.imgPanY = '0';

                this.applyFrameStyling(frame);
                this.applyImageZoomPan(frame);
                if (window.Template3DFrame && typeof window.Template3DFrame.applyTransform === 'function') {
                    window.Template3DFrame.applyTransform(frame);
                }
            });

            const primary = this.selectedFrame && frames.includes(this.selectedFrame) ? this.selectedFrame : frames[frames.length - 1];
            if (primary) {
                this.syncSettingsPanelWithFrame(primary);
                if (window.Template3DFrame) {
                    if (typeof window.Template3DFrame.syncPanel === 'function') window.Template3DFrame.syncPanel(primary);
                    if (typeof window.Template3DFrame.isGizmoActive === 'function' && window.Template3DFrame.isGizmoActive()) {
                        window.Template3DFrame.updateGizmoPosition(primary);
                    }
                }
            }
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Çerçeve Eski Yerine Sıfırlandı');
            }
        },

        resetSelectedFramePlacement: function() {
            this.resetFramePlacement(null);
        },

        /**
         * Seçili Çerçeveye Hızlı Efekt Uygula (Altın, Neon, Polaroid, Sıfırla)
         */
        setFrameEffect: function(effect) {
            const frames = this.getTargetFrames();
            if (frames.length === 0) return;
            const primary = this.selectedFrame && frames.includes(this.selectedFrame) ? this.selectedFrame : frames[frames.length - 1];
            frames.forEach(frame => {
                frame.dataset.effect = effect;
                if (effect === 'gold') {
                    frame.dataset.borderColor = '#f59e0b';
                    frame.dataset.borderWidth = '3';
                    frame.dataset.shadow = '20';
                } else if (effect === 'neon') {
                    frame.dataset.borderColor = '#06b6d4';
                    frame.dataset.borderWidth = '2';
                    frame.dataset.shadow = '24';
                } else if (effect === 'polaroid') {
                    frame.dataset.borderColor = '#ffffff';
                    frame.dataset.borderWidth = '8';
                    frame.dataset.shadow = '18';
                    frame.dataset.rotation = '-3';
                } else if (effect === 'none') {
                    frame.dataset.borderColor = '#ffffff';
                    frame.dataset.borderWidth = '0';
                    frame.dataset.shadow = '10';
                    frame.dataset.rotation = '0';
                }
                this.applyFrameStyling(frame);
            });
            this.syncSettingsPanelWithFrame(primary);
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Çerçeve Efekti Uygulandı');
            }
        },

        /**
         * Seçili Çerçeveleri Çoğalt
         */
        duplicateSelectedFrame: function() {
            const frames = this.getTargetFrames();
            if (frames.length === 0) return;
            const clones = [];
            frames.forEach(f => {
                const cloned = this.duplicateFrame(f);
                if (cloned) clones.push(cloned);
            });
            if (clones.length > 1) {
                if (typeof deselectAll === 'function') deselectAll();
                window.selectedElements = clones;
                clones.forEach(c => c.classList.add('selected', 'el-selected'));
                const last = clones[clones.length - 1];
                this.selectedFrame = last;
                window.selectedEl = last;
                if (typeof window.updateMultiSelectUI === 'function') window.updateMultiSelectUI();
            } else if (clones.length === 1) {
                this.selectFrame(clones[0]);
            }
        },

        duplicateFrame: function(frame) {
            const w = frame.offsetWidth;
            const h = frame.offsetHeight;
            const x = (parseFloat(frame.style.left) || frame.offsetLeft) + 30;
            const y = (parseFloat(frame.style.top) || frame.offsetTop) + 30;

            return this.createImageFrame({
                width: w,
                height: h,
                x: x,
                y: y,
                isCircle: frame.dataset.isCircle,
                isPolygon: frame.dataset.isPolygon,
                polygonClip: frame.dataset.polygonClip,
                polygonPoints: frame.dataset.polygonPoints,
                radius: frame.dataset.radius,
                borderWidth: frame.dataset.borderWidth,
                borderColor: frame.dataset.borderColor,
                shadow: frame.dataset.shadow,
                rotation: frame.dataset.rotation,
                effect: frame.dataset.effect,
                blend: frame.dataset.blendMode,
                shape: frame.dataset.shape || 'none',
                pitch: frame.dataset.pitch || 0,
                yaw: frame.dataset.yaw || 0,
                elevation: frame.dataset.elevation || 0,
                perspective: frame.dataset.perspective || 1000,
                depth: frame.dataset.depth || 0,
                depthColor: frame.dataset.depthColor || '',
                imgZoom: frame.dataset.imgZoom,
                imgPanX: frame.dataset.imgPanX,
                imgPanY: frame.dataset.imgPanY,
                imgUrl: frame.dataset.imgSrc
            });
        },

        /**
         * Seçili Çerçeveleri Sil
         */
        deleteSelectedFrame: function() {
            const frames = this.getTargetFrames();
            if (frames.length === 0) return;
            frames.forEach(f => {
                if (Array.isArray(window.selectedElements)) {
                    const idx = window.selectedElements.indexOf(f);
                    if (idx > -1) window.selectedElements.splice(idx, 1);
                }
                if (this.selectedFrame === f) this.selectedFrame = null;
                f.remove();
            });
            this.deselectFrame();
            if (typeof window.updateMultiSelectUI === 'function') window.updateMultiSelectUI();
            if (typeof window.renderLayers === 'function') window.renderLayers();
            if (typeof window.recordHistory === 'function') window.recordHistory('Çerçeve Silindi');
        },

        deleteFrame: function(frame) {
            if (this.selectedFrame === frame) {
                this.deselectFrame();
            }
            frame.remove();
            if (typeof window.renderLayers === 'function') {
                window.renderLayers();
            }
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Çerçeve Silindi');
            }
        },

        /**
         * 3. AŞAMA: Akıllı Yazı & Rozet Alanları Ekle
         */
        createTextFrame: function(type) {
            if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
                window.CanvasEmptyState.dismiss();
            }
            const cContainer = document.getElementById('canvas-container');
            const uiLayer = document.getElementById('ui-layer') || cContainer;
            if (!cContainer || !uiLayer) return;

            const cW = parseFloat(cContainer.style.width) || cContainer.offsetWidth || 1920;
            const cH = parseFloat(cContainer.style.height) || cContainer.offsetHeight || 1080;

            const el = document.createElement('div');
            el.className = 'draggable canvas-el tb-layout-text';
            el.style.position = 'absolute';
            el.style.zIndex = '300';
            el.addEventListener('mousedown', () => {
                if (uiLayer.lastChild !== el) {
                    uiLayer.appendChild(el);
                }
            });

            if (type === 'heading') {
                el.textContent = 'LÜKS VİLLA';
                el.dataset.label = 'Ana Başlık';
                el.style.fontSize = Math.max(48, Math.round(cW * 0.045)) + 'px';
                el.style.fontWeight = '900';
                el.style.color = '#ffffff';
                el.style.fontFamily = "'Archivo Black', sans-serif";
                el.style.textShadow = '0 4px 12px rgba(0,0,0,0.6)';
                el.style.left = '60px';
                el.style.top = '60px';
            } else if (type === 'subheading') {
                el.textContent = 'Deniz Manzaralı • Müstakil Havuzlu';
                el.dataset.label = 'Alt Başlık';
                el.style.fontSize = Math.max(24, Math.round(cW * 0.022)) + 'px';
                el.style.fontWeight = '700';
                el.style.color = '#fbbf24';
                el.style.fontFamily = "'Inter', sans-serif";
                el.style.textShadow = '0 3px 12px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,1)';
                el.style.left = '60px';
                el.style.top = '140px';
            } else if (type === 'price_badge') {
                el.textContent = '14.500.000 TL';
                el.dataset.label = 'Fiyat Rozeti';
                el.style.fontSize = Math.max(32, Math.round(cW * 0.03)) + 'px';
                el.style.fontWeight = '800';
                el.style.color = '#0f172a';
                el.style.background = '#ffffff';
                el.style.padding = '12px 24px';
                el.style.borderRadius = '30px';
                el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
                el.style.border = '2px solid #0284c7';
                el.style.left = '60px';
                el.style.top = Math.max(60, cH - 130) + 'px';
                el.style.bottom = 'auto';
            } else if (type === 'feature_pills') {
                el.textContent = '4+1 • 280 m² • Akıllı Ev • Otopark';
                el.dataset.label = 'Özellik Rozeti';
                el.style.fontSize = Math.max(20, Math.round(cW * 0.018)) + 'px';
                el.style.fontWeight = '700';
                el.style.color = '#ffffff';
                el.style.background = 'rgba(15, 23, 42, 0.85)';
                el.style.padding = '10px 20px';
                el.style.borderRadius = '8px';
                el.style.border = '1px solid rgba(255,255,255,0.2)';
                el.style.left = '60px';
                el.style.top = Math.max(60, cH - 200) + 'px';
                el.style.bottom = 'auto';
            } else if (type === 'agent_strip') {
                el.innerHTML = '<span style="font-weight:700;">Ahmet Yılmaz</span> • 0532 123 45 67 • Remax Gold';
                el.dataset.label = 'Danışman Şeridi';
                el.style.fontSize = Math.max(18, Math.round(cW * 0.016)) + 'px';
                el.style.fontWeight = '600';
                el.style.color = '#ffffff';
                el.style.background = 'rgba(2, 132, 199, 0.9)';
                el.style.padding = '8px 18px';
                el.style.borderRadius = '6px';
                el.style.left = Math.max(60, cW - 400) + 'px';
                el.style.top = Math.max(60, cH - 130) + 'px';
                el.style.bottom = 'auto';
                el.style.right = 'auto';
            }

            uiLayer.appendChild(el);

            if (typeof window.bindDrag === 'function') window.bindDrag(el);
            if (typeof window.enableInlineEdit === 'function') window.enableInlineEdit(el);
            if (typeof window.renderLayers === 'function') window.renderLayers();
            if (typeof window.selectElement === 'function') window.selectElement(el);
        },

        /**
         * 4. AŞAMA: 100+ Hazır Düzen Şablonları (Pre-built Layouts)
         */
        filterLayouts: function(cat) {
            this.activeLayoutFilter = cat;
            document.querySelectorAll('#tbLayoutCatTabs .tb-layout-cat-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.cat === cat);
            });
            this.renderLayoutsSelector();
        },

        onLayoutSearch: function(query) {
            this.layoutSearchQuery = (query || '').trim().toLowerCase();
            const clearBtn = document.getElementById('tbLayoutSearchClear');
            if (clearBtn) clearBtn.style.display = this.layoutSearchQuery ? 'block' : 'none';
            this.renderLayoutsSelector();
        },

        clearLayoutSearch: function() {
            this.layoutSearchQuery = '';
            const input = document.getElementById('tbLayoutSearchInput');
            if (input) input.value = '';
            const clearBtn = document.getElementById('tbLayoutSearchClear');
            if (clearBtn) clearBtn.style.display = 'none';
            this.renderLayoutsSelector();
        },

        renderLayoutsSelector: function() {
            const grid = document.getElementById('tbLayoutsGrid');
            if (!grid) return;

            if (!this.layouts || this.layouts.length === 0) {
                this.layouts = this.getCombinedLayouts();
            }

            let filtered = this.layouts || [];

            if (this.activeLayoutFilter && this.activeLayoutFilter !== 'all') {
                filtered = filtered.filter(l => l.category === this.activeLayoutFilter);
            }

            if (this.layoutSearchQuery) {
                filtered = filtered.filter(l =>
                    (l.name && l.name.toLowerCase().includes(this.layoutSearchQuery)) ||
                    (l.id && l.id.toLowerCase().includes(this.layoutSearchQuery))
                );
            }

            grid.innerHTML = '';
            if (filtered.length === 0) {
                grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:16px 8px; font-size:11px; color:var(--text-muted, #64748b);">Aradığınız kriterde düzen bulunamadı.</div>';
                return;
            }

            filtered.forEach(lay => {
                const card = document.createElement('div');
                card.className = 'tb-layout-card';
                card.title = `${lay.name}${lay.ratio ? ' — ' + lay.ratio : ''}`;
                card.onclick = () => this.applyPrebuiltLayout(lay.id);

                let miniFramesHtml = '';
                if (lay.frames && lay.frames.length > 0) {
                    lay.frames.forEach(f => {
                        const left = (f.x * 100).toFixed(1);
                        const top = (f.y * 100).toFixed(1);
                        const w = (f.w * 100).toFixed(1);
                        const h = (f.h * 100).toFixed(1);

                        let shapeStyle = '';
                        if (f.radius >= 100 || f.shape === 'circle' || f.isCircle === 'true' || f.isCircle === true) {
                            shapeStyle = 'border-radius:50%;';
                        } else if (f.shape && f.shape.startsWith('arch')) {
                            shapeStyle = 'border-radius:7px 7px 1.5px 1.5px;';
                        } else if (f.shape && f.shape.includes('cloud')) {
                            shapeStyle = 'border-radius:6px 6px 3px 3px; border:1px dashed #38bdf8;';
                        } else if (f.shape && f.shape.includes('brush')) {
                            shapeStyle = 'border-radius:2px; transform:skewX(-5deg);';
                        } else if (f.shape && f.shape.includes('blob')) {
                            shapeStyle = 'border-radius:8px 3px 8px 3px;';
                        } else if (f.shape && (f.shape.includes('stamp') || f.shape.includes('badge'))) {
                            shapeStyle = 'border:1px dashed #f59e0b; border-radius:3px;';
                        } else if (f.shape && f.shape.includes('hexagon')) {
                            shapeStyle = 'clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); border:none;';
                        } else if (f.radius && f.radius > 0) {
                            const rPx = Math.max(1, Math.min(Math.round(f.radius / 4), 8));
                            shapeStyle = `border-radius:${rPx}px;`;
                        }

                        if (f.rotation) {
                            shapeStyle += `transform:rotate(${f.rotation}deg);`;
                        }
                        if (f.borderWidth && f.borderWidth > 0 && !shapeStyle.includes('border:none')) {
                            shapeStyle += `border:${Math.max(1, Math.round(f.borderWidth / 4))}px solid ${f.borderColor || '#ffffff'};`;
                        }

                        if (f.blend === 'bottom') {
                            shapeStyle += 'background:linear-gradient(180deg, #38bdf8 0%, rgba(56,189,248,0.08) 100%); border-bottom:none;';
                        } else if (f.blend === 'top') {
                            shapeStyle += 'background:linear-gradient(0deg, #38bdf8 0%, rgba(56,189,248,0.08) 100%); border-top:none;';
                        } else if (f.blend === 'right') {
                            shapeStyle += 'background:linear-gradient(90deg, #38bdf8 0%, rgba(56,189,248,0.08) 100%); border-right:none;';
                        } else if (f.blend === 'left') {
                            shapeStyle += 'background:linear-gradient(270deg, #38bdf8 0%, rgba(56,189,248,0.08) 100%); border-left:none;';
                        } else if (f.blend === 'radial') {
                            shapeStyle += 'border-radius:50%; background:radial-gradient(circle, #38bdf8 30%, rgba(56,189,248,0.08) 100%); border:none;';
                        }

                        miniFramesHtml += `<div class="tb-layout-mini-frame" style="left:${left}%; top:${top}%; width:${w}%; height:${h}%; ${shapeStyle}"></div>`;
                    });
                }
                let miniTextsHtml = '';
                if (lay.texts && lay.texts.length > 0) {
                    lay.texts.slice(0, 2).forEach(t => {
                        const left = (t.x * 100).toFixed(1);
                        const top = (t.y * 100).toFixed(1);
                        const textBg = t.color || '#f59e0b';
                        miniTextsHtml += `<div class="tb-layout-mini-text" style="left:${left}%; top:${top}%; width:28%; background:${textBg};"></div>`;
                    });
                }

                const ratioBadge = lay.ratio ? `<span style="position:absolute; top:2px; right:2px; font-size:7.5px; font-weight:700; color:#fff; background:rgba(15,23,42,0.75); padding:0 3px; border-radius:2px; pointer-events:none; line-height:11px;">${lay.ratio}</span>` : '';
                const bgVal = lay.bgColor || lay.bg || '#0f172a';
                card.innerHTML = `
                    <div class="tb-layout-preview-wrapper" style="background:${bgVal};">
                        ${miniFramesHtml}
                        ${miniTextsHtml}
                        ${ratioBadge}
                    </div>
                    <span class="tb-layout-name">${lay.name}</span>
                `;

                grid.appendChild(card);
            });
        },

        /**
         * Çoklu / Toplu Görselleri Çerçevelere Otomatik Dağıtma
         * - Tıklanan çerçeveden başlar, sonrakilere sırayla dağıtır
         * - Fazla gelen görseller yok sayılır (alınmaz)
         * - Az gelirse kalan çerçeveler boş kalır
         */
        distributeBatchPhotos: function(files, startFrame) {
            const fileList = Array.from(files || []);
            if (fileList.length === 0) return;

            // DOM'daki tüm görsel çerçevelerini bul
            const allFrames = Array.from(document.querySelectorAll('.tb-image-frame'));
            if (allFrames.length === 0) return;

            // Çerçeveleri sol-üstten sağ-alta doğal konumsal okuma sırasına göre diz
            allFrames.sort((a, b) => {
                const topA = parseFloat(a.style.top) || a.offsetTop;
                const topB = parseFloat(b.style.top) || b.offsetTop;
                if (Math.abs(topA - topB) > 30) return topA - topB;
                return (parseFloat(a.style.left) || a.offsetLeft) - (parseFloat(b.style.left) || b.offsetLeft);
            });

            // Tıklanan çerçeveden başla, sonraki çerçevelere sırayla dağıt
            let targetFrames = allFrames;
            if (startFrame) {
                const startIdx = allFrames.indexOf(startFrame);
                if (startIdx !== -1) {
                    targetFrames = allFrames.slice(startIdx).concat(allFrames.slice(0, startIdx));
                }
            }

            // Çerçeve sayısı kadarını al; fazla gelenler yoksayılır, az gelirse kalanlar boş kalır
            const count = Math.min(fileList.length, targetFrames.length);
            for (let i = 0; i < count; i++) {
                this.loadPhotoIntoFrame(targetFrames[i], fileList[i]);
            }

            if (startFrame) {
                this.selectFrame(startFrame);
            }

            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Toplu Görseller Çerçevelere Yerleştirildi');
            }
        },

        /**
         * Toplu Görsel Açma & Çerçevelere Otomatik Sıralı Yükleme (Geriye Uyumluluk)
         */
        uploadMultiplePhotos: function() {
            const frames = document.querySelectorAll('.tb-image-frame');
            if (frames.length === 0) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Lütfen önce bir hazır düzen veya görsel çerçevesi ekleyin.', 'warning');
                }
                return;
            }

            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            input.style.display = 'none';

            input.onchange = (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;
                this.distributeBatchPhotos(files, this.selectedFrame || null);
            };

            document.body.appendChild(input);
            input.click();
            setTimeout(() => input.remove(), 1000);
        },

        /**
         * Akıllı Bilgi Kartı Ekleme / Kaldırma / Tema
         */
        addInfoCard: function(pos, customData) {
            if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
                window.CanvasEmptyState.dismiss();
            }
            if (window.TemplateInfoCard && typeof window.TemplateInfoCard.addCard === 'function') {
                window.TemplateInfoCard.addCard(pos, customData);
            }
        },

        removeInfoCard: function() {
            if (window.TemplateInfoCard && typeof window.TemplateInfoCard.removeCard === 'function') {
                window.TemplateInfoCard.removeCard();
            }
        },

        changeInfoCardTheme: function(theme) {
            if (window.TemplateInfoCard && typeof window.TemplateInfoCard.setTheme === 'function') {
                window.TemplateInfoCard.setTheme(theme, true);
            }
        },

        setInfoCardBg: function(val) {
            if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
                window.CanvasEmptyState.dismiss();
            }
            if (window.TemplateInfoCard && typeof window.TemplateInfoCard.setCustomBackground === 'function') {
                window.TemplateInfoCard.setCustomBackground(val);
            }
        },

        resetInfoCardBg: function() {
            if (window.TemplateInfoCard && typeof window.TemplateInfoCard.resetCustomBackground === 'function') {
                window.TemplateInfoCard.resetCustomBackground();
            }
        },

        applyPrebuiltLayout: function(layoutKey) {
            if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
                window.CanvasEmptyState.dismiss();
            }
            // Eğer portföy vitrini şablonu ise PortfolioManager üzerinden çalıştır
            if (layoutKey && layoutKey.startsWith('preset_') && window.PortfolioManager && typeof window.PortfolioManager.applyPreset === 'function') {
                this.activePrebuiltLayoutKey = layoutKey;
                window.PortfolioManager.applyPreset(layoutKey);
                return;
            }
            this.activePrebuiltLayoutKey = layoutKey || null;

            // Önceki görsel çerçevelerini, bilgi kartını ve hazır düzen/portföy yazılarını temizle
            const activeCard = document.getElementById('tb-active-info-card');
            if (activeCard) activeCard.remove();
            if (window.TemplateInfoCard) window.TemplateInfoCard.savedFrameSnapshots = null;
            document.querySelectorAll('.tb-image-frame').forEach(f => f.remove());
            document.querySelectorAll('.tb-layout-text, .tb-portfolio-text').forEach(t => t.remove());

            if (!this.layouts || this.layouts.length === 0) {
                this.layouts = this.getCombinedLayouts();
            }

            const targetLayout = this.layouts ? this.layouts.find(l => l.id === layoutKey) : null;

            if (targetLayout) {
                if (targetLayout.ratio) {
                    this.setCanvasRatio(targetLayout.ratio);
                }

                if (this.userChosenBg) {
                    this.setCanvasBackground(this.userChosenBg.type, this.userChosenBg.value, false);
                } else if (targetLayout.bgColor) {
                    const isGrad = targetLayout.bgColor.includes('gradient');
                    this.setCanvasBackground(isGrad ? 'gradient' : 'color', targetLayout.bgColor, false);
                }

                const cContainer = document.getElementById('canvas-container');
                const cW = parseFloat(cContainer.style.width) || cContainer.offsetWidth || 1920;
                const cH = parseFloat(cContainer.style.height) || cContainer.offsetHeight || 1080;

                if (targetLayout.frames && targetLayout.frames.length > 0) {
                    targetLayout.frames.forEach((f, idx) => {
                        const frameW = Math.round(cW * f.w);
                        const frameH = Math.round(cH * f.h);
                        const frameX = Math.round(cW * f.x);
                        const frameY = Math.round(cH * f.y);

                        this.createImageFrame({
                            x: frameX,
                            y: frameY,
                            width: frameW,
                            height: frameH,
                            isCircle: f.isCircle || (f.radius >= 300),
                            radius: f.radius !== undefined ? f.radius : 12,
                            shadow: f.shadow !== undefined ? f.shadow : 10,
                            blend: f.blend || 'none',
                            shape: f.shape || 'none',
                            rotation: f.rotation || 0,
                            borderWidth: f.borderWidth || 0,
                            borderColor: f.borderColor || '#ffffff',
                            label: `Fotoğraf ${idx + 1}`,
                            skipHistory: true
                        });
                    });
                }

                if (targetLayout.texts && targetLayout.texts.length > 0) {
                    targetLayout.texts.forEach(t => {
                        this.createLayoutTextFrame(t, cW, cH);
                    });
                }

                this.deselectFrame();
                if (typeof window.recordHistory === 'function') {
                    window.recordHistory('Hazır Şablon Uygulandı');
                }
                return;
            }

            // Geleneksel Anahtarlar İçin Geriye Uyumluluk (Legacy Fallback)
            const cContainer = document.getElementById('canvas-container');
            const cW = parseFloat(cContainer.style.width) || cContainer.offsetWidth || 1920;
            const cH = parseFloat(cContainer.style.height) || cContainer.offsetHeight || 1080;
            const pad = 32;
            const gap = 16;

            if (layoutKey === 'hero_split_right') {
                const totalW = cW - (pad * 2) - gap;
                const leftW = Math.round(totalW * 0.6);
                const rightW = totalW - leftW;
                const rightH = Math.round((cH - (pad * 2) - gap) / 2);

                this.createImageFrame({ x: pad, y: pad, width: leftW, height: cH - (pad * 2), radius: 14, skipHistory: true });
                this.createImageFrame({ x: pad + leftW + gap, y: pad, width: rightW, height: rightH, radius: 14, skipHistory: true });
                this.createImageFrame({ x: pad + leftW + gap, y: pad + rightH + gap, width: rightW, height: rightH, radius: 14 });

            } else if (layoutKey === 'two_horizontal') {
                const itemH = Math.round((cH - (pad * 2) - gap) / 2);
                this.createImageFrame({ x: pad, y: pad, width: cW - (pad * 2), height: itemH, radius: 12 });
                this.createImageFrame({ x: pad, y: pad + itemH + gap, width: cW - (pad * 2), height: itemH, radius: 12 });

            } else if (layoutKey === 'three_vertical') {
                const colW = Math.round((cW - (pad * 2) - (gap * 2)) / 3);
                this.createImageFrame({ x: pad, y: pad, width: colW, height: cH - (pad * 2), radius: 12 });
                this.createImageFrame({ x: pad + colW + gap, y: pad, width: colW, height: cH - (pad * 2), radius: 12 });
                this.createImageFrame({ x: pad + (colW * 2) + (gap * 2), y: pad, width: colW, height: cH - (pad * 2), radius: 12 });

            } else if (layoutKey === 'four_grid') {
                const boxW = Math.round((cW - (pad * 2) - gap) / 2);
                const boxH = Math.round((cH - (pad * 2) - gap) / 2);
                this.createImageFrame({ x: pad, y: pad, width: boxW, height: boxH, radius: 12 });
                this.createImageFrame({ x: pad + boxW + gap, y: pad, width: boxW, height: boxH, radius: 12 });
                this.createImageFrame({ x: pad, y: pad + boxH + gap, width: boxW, height: boxH, radius: 12 });
                this.createImageFrame({ x: pad + boxW + gap, y: pad, width: boxW, height: boxH, radius: 12 });

            } else if (layoutKey === 'magazine_card') {
                const photoH = Math.round(cH * 0.72);
                this.createImageFrame({ x: pad, y: pad, width: cW - (pad * 2), height: photoH, radius: 0, blend: 'bottom' });
                this.createTextFrame('heading');
                this.createTextFrame('price_badge');
            }

            this.deselectFrame();
        },

        createLayoutTextFrame: function(tObj, cW, cH) {
            const cContainer = document.getElementById('canvas-container');
            const uiLayer = document.getElementById('ui-layer') || cContainer;
            if (!cContainer || !uiLayer) return;

            const el = document.createElement('div');
            el.className = 'draggable canvas-el tb-layout-text';
            el.style.position = 'absolute';
            el.style.zIndex = '300';
            el.addEventListener('mousedown', () => {
                if (uiLayer.lastChild !== el) {
                    uiLayer.appendChild(el);
                }
            });

            const leftPx = Math.round(cW * (tObj.x || 0.05));
            const topPx = Math.round(cH * (tObj.y || 0.05));
            el.style.left = leftPx + 'px';
            el.style.top = topPx + 'px';

            const scaleRatio = cW / 1920;
            const scaledFontSize = Math.max(14, Math.round((tObj.fontSize || 24) * scaleRatio));
            el.style.fontSize = scaledFontSize + 'px';

            // Açık mavi (#38bdf8) parlak/gündüz fotoğraflarında silikleştiğinden parlak altın sarısı (#fbbf24) ile güçlendirilir
            const textColor = (tObj.color === '#38bdf8' || (tObj.type === 'subheading' && (!tObj.color || tObj.color === '#38bdf8')))
                ? '#fbbf24'
                : (tObj.color || '#ffffff');
            el.style.color = textColor;

            if (tObj.type === 'heading') {
                el.textContent = tObj.text || 'LÜKS VİLLA';
                el.dataset.label = 'Ana Başlık';
                el.style.fontWeight = '900';
                el.style.fontFamily = "'Archivo Black', sans-serif";
                el.style.textShadow = '0 3px 14px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,1)';
            } else if (tObj.type === 'subheading') {
                el.textContent = tObj.text || 'Müstakil Havuzlu';
                el.dataset.label = 'Alt Başlık';
                el.style.fontWeight = '700';
                el.style.fontFamily = "'Inter', sans-serif";
                el.style.textShadow = '0 3px 12px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,1)';
            } else if (tObj.type === 'price_badge') {
                el.textContent = tObj.text || '15.000.000 TL';
                el.dataset.label = 'Fiyat Rozeti';
                el.style.fontWeight = '800';
                el.style.background = tObj.bg || '#ffffff';
                el.style.padding = '8px 20px';
                el.style.borderRadius = '30px';
                el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
                el.style.border = '2px solid #0284c7';
            } else if (tObj.type === 'feature_pills') {
                el.textContent = tObj.text || '4+1 • Akıllı Ev';
                el.dataset.label = 'Özellik Rozeti';
                el.style.fontWeight = '700';
                el.style.background = tObj.bg || 'rgba(15, 23, 42, 0.85)';
                el.style.padding = '8px 16px';
                el.style.borderRadius = '8px';
                el.style.border = '1px solid rgba(255,255,255,0.2)';
            } else if (tObj.type === 'agent_strip') {
                el.textContent = tObj.text || 'Gayrimenkul Danışmanı';
                el.dataset.label = 'Danışman Şeridi';
                el.style.fontWeight = '600';
                el.style.background = tObj.bg || 'rgba(2, 132, 199, 0.9)';
                el.style.padding = '8px 18px';
                el.style.borderRadius = '6px';
                el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
            } else {
                el.textContent = tObj.text || '';
                el.dataset.label = 'Metin';
                if (tObj.bg) {
                    el.style.background = tObj.bg;
                    el.style.padding = '6px 14px';
                    el.style.borderRadius = '6px';
                }
            }

            uiLayer.appendChild(el);

            if (typeof window.bindDrag === 'function') window.bindDrag(el);
            if (typeof window.enableInlineEdit === 'function') window.enableInlineEdit(el);
            if (typeof window.renderLayers === 'function') window.renderLayers();
        },

        saveCurrentTemplate: async function(name) {
            let templateName = name;
            if (!templateName) {
                if (window.AppDialog && typeof window.AppDialog.prompt === 'function') {
                    templateName = await window.AppDialog.prompt({
                        title: 'Şablonu Kaydet',
                        message: 'Şablonunuza bir isim verin:',
                        defaultValue: 'Özel Portföy Şablonum',
                        icon: 'fa-layer-group',
                        confirmText: 'Kaydet',
                        cancelText: 'Vazgeç'
                    });
                } else {
                    templateName = prompt('Şablonunuza bir isim verin:', 'Özel Portföy Şablonum');
                }
            }
            if (!templateName || !templateName.trim()) return;

            const cContainer = document.getElementById('canvas-container');
            const cW = parseFloat(cContainer.style.width) || cContainer.offsetWidth || 1920;
            const cH = parseFloat(cContainer.style.height) || cContainer.offsetHeight || 1080;

            const framesData = [];
            document.querySelectorAll('.tb-image-frame').forEach(f => {
                framesData.push({
                    width: f.offsetWidth,
                    height: f.offsetHeight,
                    left: parseFloat(f.style.left) || f.offsetLeft,
                    top: parseFloat(f.style.top) || f.offsetTop,
                    isCircle: f.dataset.isCircle,
                    isPolygon: f.dataset.isPolygon,
                    polygonClip: f.dataset.polygonClip,
                    polygonPoints: f.dataset.polygonPoints,
                    radius: f.dataset.radius,
                    borderWidth: f.dataset.borderWidth,
                    borderColor: f.dataset.borderColor,
                    shadow: f.dataset.shadow,
                    rotation: f.dataset.rotation,
                    effect: f.dataset.effect,
                    blend: f.dataset.blendMode || 'none',
                    shape: f.dataset.shape || 'none',
                    pitch: f.dataset.pitch || 0,
                    yaw: f.dataset.yaw || 0,
                    elevation: f.dataset.elevation || 0,
                    perspective: f.dataset.perspective || 1000,
                    depth: f.dataset.depth || 0,
                    depthColor: f.dataset.depthColor || '',
                    imgZoom: f.dataset.imgZoom,
                    imgPanX: f.dataset.imgPanX,
                    imgPanY: f.dataset.imgPanY,
                    imgUrl: f.dataset.imgSrc || ''
                });
            });

            const rawBgImg = cContainer.style.backgroundImage || '';
            const templateObj = {
                id: 'tpl_' + Date.now(),
                name: templateName.trim(),
                createdAt: new Date().toLocaleDateString('tr-TR'),
                ratio: this.currentRatio,
                width: cW,
                height: cH,
                bgColor: cContainer.style.backgroundColor || '',
                bgImage: (rawBgImg && rawBgImg !== 'none') ? rawBgImg : '',
                frames: framesData
            };

            this.customTemplates.unshift(templateObj);
            const saveResult = this.persistCustomTemplates();
            this.renderSavedTemplatesList();

            const notify = (msg, type) => {
                if (typeof window.showAppToast === 'function') window.showAppToast(msg, type);
            };
            if (saveResult === true) {
                notify('"' + templateName + '" şablonunuz başarıyla kaydedildi.', 'success');
            } else if (saveResult === 'lightweight') {
                notify('"' + templateName + '" yerleşim düzeni kaydedildi.', 'info');
            } else {
                this.customTemplates.shift();
                this.renderSavedTemplatesList();
                notify('Tarayıcı depolama alanı dolu olduğu için şablon kaydedilemedi.', 'error');
            }
        },

        loadCustomTemplates: function() {
            try {
                const data = localStorage.getItem('emlakstudiom_custom_templates');
                if (data) this.customTemplates = JSON.parse(data);
            } catch (e) {
                this.customTemplates = [];
            }
        },

        persistCustomTemplates: function() {
            try {
                localStorage.setItem('emlakstudiom_custom_templates', JSON.stringify(this.customTemplates));
                return true;
            } catch (e) {
                try {
                    if (this.customTemplates.length > 0) {
                        const latest = this.customTemplates[0];
                        if (latest.bgImage && latest.bgImage.length > 1024) latest.bgImage = '';
                        if (Array.isArray(latest.frames)) {
                            latest.frames.forEach(f => {
                                if (f.imgUrl && f.imgUrl.startsWith('data:')) f.imgUrl = '';
                            });
                        }
                        localStorage.setItem('emlakstudiom_custom_templates', JSON.stringify(this.customTemplates));
                        return 'lightweight';
                    }
                } catch (retryErr) {
                    console.warn('Özel şablon kaydedilemedi (Kota aşımı):', retryErr);
                }
                return false;
            }
            try {
                // fallback no-op
            } catch (e) {}
        },

        renderSavedTemplatesList: function() {
            const listEl = document.getElementById('tbSavedTemplatesList');
            if (!listEl) return;

            if (this.customTemplates.length === 0) {
                listEl.innerHTML = '<p style="font-size:11px; color:var(--text-muted); margin:4px 0;">Henüz kaydedilmiş özel şablonunuz bulunmuyor.</p>';
                return;
            }

            listEl.innerHTML = '';
            this.customTemplates.forEach((tpl, idx) => {
                const item = document.createElement('div');
                item.className = 'tb-saved-item';
                item.innerHTML = `
                    <div style="display:flex; flex-direction:column; gap:2px;">
                        <span style="color:var(--text);">${tpl.name}</span>
                        <small style="font-size:9.5px; color:var(--text-muted);">${tpl.ratio} • ${tpl.frames.length} Çerçeve • ${tpl.createdAt}</small>
                    </div>
                    <div class="tb-saved-item-actions">
                        <button type="button" class="btn-action" style="padding:3px 8px; font-size:10.5px;" title="Şablonu Tuvale Uygula" onclick="TemplateBuilder.applyCustomTemplate(${idx})"><i class="fa-solid fa-play"></i></button>
                        <button type="button" class="btn-action btn-red" style="padding:3px 8px; font-size:10.5px;" title="Şablonu Sil" onclick="TemplateBuilder.deleteCustomTemplate(${idx})"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                `;
                listEl.appendChild(item);
            });
        },

        applyCustomTemplate: function(idx) {
            const tpl = this.customTemplates[idx];
            if (!tpl) return;

            this.setCanvasRatio(tpl.ratio, tpl.width, tpl.height);
            if (tpl.bgImage && tpl.bgImage !== 'none') {
                this.setCanvasBackground('gradient', tpl.bgImage);
            } else if (tpl.bgColor) {
                this.setCanvasBackground('color', tpl.bgColor);
            }

            document.querySelectorAll('.tb-image-frame').forEach(f => f.remove());

            tpl.frames.forEach(f => {
                this.createImageFrame({
                    width: f.width,
                    height: f.height,
                    x: f.left,
                    y: f.top,
                    isCircle: f.isCircle,
                    isPolygon: f.isPolygon,
                    polygonClip: f.polygonClip,
                    polygonPoints: f.polygonPoints,
                    radius: f.radius,
                    borderWidth: f.borderWidth,
                    borderColor: f.borderColor,
                    shadow: f.shadow,
                    rotation: f.rotation,
                    effect: f.effect,
                    blend: f.blend || 'none',
                    shape: f.shape || 'none',
                    pitch: f.pitch,
                    yaw: f.yaw,
                    elevation: f.elevation,
                    perspective: f.perspective,
                    depth: f.depth,
                    depthColor: f.depthColor,
                    imgZoom: f.imgZoom,
                    imgPanX: f.imgPanX,
                    imgPanY: f.imgPanY,
                    imgUrl: f.imgUrl,
                    skipHistory: true
                });
            });

            this.deselectFrame();
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Özel Şablon Uygulandı');
            }
        },

        deleteCustomTemplate: function(idx) {
            this.customTemplates.splice(idx, 1);
            const saveResult = this.persistCustomTemplates();
            this.renderSavedTemplatesList();
        },

        /**
         * 6. AŞAMA: Tuval Altı Dinamik Dock Güncellemesi
         */
        updateDockControls: function(hasSelectedFrame) {
            const dockGroup = document.getElementById('dockGroup_create-template');
            if (!dockGroup) return;

            const frames = this.getTargetFrames();
            const primary = (this.selectedFrame && frames.includes(this.selectedFrame))
                ? this.selectedFrame
                : (frames.length > 0 ? frames[frames.length - 1] : null);

            if (hasSelectedFrame && primary) {
                dockGroup.innerHTML = `
                    <button type="button" class="dock-btn" onclick="TemplateBuilder.triggerSelectedFrameUpload()" title="Fotoğraf Yükle veya Değiştir">
                        <span class="dock-icon"><i class="fa-solid fa-camera"></i></span>
                        <span class="dock-label">Foto</span>
                    </button>
                    <button type="button" class="dock-btn" onclick="if(window.selectedElements && window.selectedElements.length > 1 && window.selectedElements.some(el => el && el.classList && !el.classList.contains('tb-image-frame')) && window.ThreeDEngine) { ThreeDEngine.convert2DBadgeTo3D(window.selectedElements.slice()); } else if(window.Template3DFrame) { Template3DFrame.applyPreset('isoLeft'); }" title="3D İzometrik Açı Uygula">
                        <span class="dock-icon"><i class="fa-solid fa-cube"></i></span>
                        <span class="dock-label">3D</span>
                    </button>
                    <button type="button" class="dock-btn" onclick="TemplateBuilder.resetSelectedFramePlacement()" title="Çerçeveyi Eski Yerine ve Boyutuna Sıfırla">
                        <span class="dock-icon"><i class="fa-solid fa-rotate-left"></i></span>
                        <span class="dock-label">Yerini Sıfırla</span>
                    </button>
                    <button type="button" class="dock-btn" onclick="TemplateBuilder.duplicateSelectedFrame()" title="Çerçeveyi Çoğalt">
                        <span class="dock-icon"><i class="fa-solid fa-clone"></i></span>
                        <span class="dock-label">Çoğalt</span>
                    </button>
                    <button type="button" class="dock-btn btn-red" onclick="TemplateBuilder.deleteSelectedFrame()" title="Çerçeveyi Sil">
                        <span class="dock-icon"><i class="fa-solid fa-trash-can"></i></span>
                        <span class="dock-label">Sil</span>
                    </button>
                `;
            } else {
                dockGroup.innerHTML = `
                    <button type="button" class="dock-btn" onclick="TemplateBuilder.createImageFrame()" title="Yeni Görsel Çerçevesi Ekle">
                        <span class="dock-icon"><i class="fa-solid fa-image"></i></span>
                        <span class="dock-label">Çerçeve</span>
                    </button>
                    <button type="button" class="dock-btn dock-snap-btn" onclick="if(typeof window.toggleSmartGuides === 'function') window.toggleSmartGuides()" title="Akıllı Manyetik Hizalamayı Aç veya Kapat">
                        <span class="dock-icon"><i class="fa-solid fa-magnet"></i></span>
                        <span class="dock-label">Hizalama</span>
                    </button>
                    <button type="button" class="dock-btn" onclick="TemplateBuilder.createTextFrame('heading')" title="Başlık Yazısı Ekle">
                        <span class="dock-icon"><i class="fa-solid fa-font"></i></span>
                        <span class="dock-label">Yazı</span>
                    </button>
                    <button type="button" class="dock-btn" onclick="TemplateBuilder.saveCurrentTemplate()" title="Mevcut Düzeni Şablon Olarak Kaydet">
                        <span class="dock-icon"><i class="fa-solid fa-floppy-disk"></i></span>
                        <span class="dock-label">Kaydet</span>
                    </button>
                `;
            }
        },

        triggerSelectedFrameUpload: function() {
            const frames = this.getTargetFrames();
            const primary = this.selectedFrame && frames.includes(this.selectedFrame) ? this.selectedFrame : frames[frames.length - 1];
            if (!primary) return;
            const input = primary.querySelector('.tb-frame-file-input');
            if (input) input.click();
        },

        toggleSelectedFrameBlend: function() {
            const frames = this.getTargetFrames();
            if (frames.length === 0) return;
            const primary = this.selectedFrame && frames.includes(this.selectedFrame) ? this.selectedFrame : frames[frames.length - 1];
            const cur = primary.dataset.blendMode || 'none';
            const next = cur === 'none' ? 'bottom' : (cur === 'bottom' ? 'right' : 'none');
            this.setFrameBlend(next);
        },

        cycleSelectedFrameRadius: function() {
            const frames = this.getTargetFrames();
            if (frames.length === 0) return;
            const primary = this.selectedFrame && frames.includes(this.selectedFrame) ? this.selectedFrame : frames[frames.length - 1];
            const cur = parseInt(primary.dataset.radius) || 0;
            let next = 16;
            if (cur === 16) next = 36;
            else if (cur === 36) next = 999;
            else if (cur >= 999) next = 0;
            this.updateSelectedFrameProp('radius', next);
            const rInput = document.getElementById('tbFrameRadius');
            if (rInput) rInput.value = next;
        },

        zoomSelectedFrame: function(deltaPercent) {
            const frames = this.getTargetFrames();
            if (frames.length === 0) return;
            const primary = this.selectedFrame && frames.includes(this.selectedFrame) ? this.selectedFrame : frames[frames.length - 1];
            const curZoom = parseFloat(primary.dataset.imgZoom) || 1.0;
            const targetPercent = Math.round(Math.min(3.0, Math.max(0.2, curZoom + (deltaPercent / 100))) * 100);
            frames.forEach(frame => {
                const fCur = parseFloat(frame.dataset.imgZoom) || 1.0;
                const fNew = Math.min(3.0, Math.max(0.2, fCur + (deltaPercent / 100)));
                frame.dataset.imgZoom = fNew;
                this.applyImageZoomPan(frame);
            });
            const v = document.getElementById('tbFrameZoomVal');
            if (v) v.textContent = targetPercent + '%';
            const zoomInput = document.getElementById('tbFrameZoom');
            if (zoomInput) zoomInput.value = targetPercent;
        },

        zoomIn: function() {
            this.zoomSelectedFrame(15);
            if (typeof window.recordHistory === 'function') window.recordHistory('Fotoğraf Yakınlaştırıldı');
        },

        zoomOut: function() {
            this.zoomSelectedFrame(-15);
            if (typeof window.recordHistory === 'function') window.recordHistory('Fotoğraf Uzaklaştırıldı');
        },

        zoomReset: function() {
            const frames = this.getTargetFrames();
            if (frames.length === 0) return;
            this.updateSelectedFrameProp('zoom', 100);
            const zoomInput = document.getElementById('tbFrameZoom');
            if (zoomInput) zoomInput.value = 100;
            if (typeof window.recordHistory === 'function') window.recordHistory('Yakınlaştırma Sıfırlandı');
        }
    };

    window.TemplateBuilder = TemplateBuilder;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => TemplateBuilder.init());
    } else {
        TemplateBuilder.init();
    }

})(window);
