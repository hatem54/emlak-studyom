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

            // Yan panel kaydırıcıları (slider) bırakıldığında (change) geçmişe kaydet
            ['tbFrameRadius', 'tbFrameBorderWidth', 'tbFrameShadow', 'tbFrameZoom', 'tbFramePanX', 'tbFramePanY', 'tbFrameRotation'].forEach(id => {
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

            // 9. Boş durum kartlarını güncelle
            if (window.CanvasEmptyState && typeof window.CanvasEmptyState.updateState === 'function') {
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

            // Boş tuval başlangıç ekranını anında kapat
            if (window.CanvasEmptyState && typeof window.CanvasEmptyState.hide === 'function') {
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
         * 2. AŞAMA: Akıllı Görsel Çerçevesi Ekle (Image Frame / Photo Holder)
         */
        createImageFrame: function(opts = {}) {
            const cContainer = document.getElementById('canvas-container');
            const uiLayer = document.getElementById('ui-layer') || cContainer;
            if (!cContainer || !uiLayer) return null;

            const cW = parseFloat(cContainer.style.width) || cContainer.offsetWidth || 1920;
            const cH = parseFloat(cContainer.style.height) || cContainer.offsetHeight || 1080;

            const isCirc = (opts.isCircle === 'true' || opts.isCircle === true);
            const defW = opts.width || Math.min(Math.round(cW * 0.45), 600);
            const defH = opts.height || (isCirc ? defW : Math.min(Math.round(cH * 0.45), 450));
            const defX = opts.x !== undefined ? opts.x : Math.max(32, Math.round((cW - defW) / 2));
            const defY = opts.y !== undefined ? opts.y : Math.max(32, Math.round((cH - defH) / 2));

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
            frame.dataset.imgZoom = 1.0;
            frame.dataset.imgPanX = 0;
            frame.dataset.imgPanY = 0;
            frame.dataset.pitch = opts.pitch !== undefined ? opts.pitch : 0;
            frame.dataset.yaw = opts.yaw !== undefined ? opts.yaw : 0;
            frame.dataset.elevation = opts.elevation !== undefined ? opts.elevation : 0;
            frame.dataset.perspective = opts.perspective !== undefined ? opts.perspective : 1000;
            frame.dataset.isPolygon = opts.isPolygon || (opts.polygonClip ? 'true' : 'false');
            frame.dataset.polygonClip = opts.polygonClip || '';
            frame.dataset.polygonPoints = opts.polygonPoints ? (typeof opts.polygonPoints === 'string' ? opts.polygonPoints : JSON.stringify(opts.polygonPoints)) : '';

            frame.style.width = defW + 'px';
            frame.style.height = defH + 'px';
            frame.style.left = defX + 'px';
            frame.style.top = defY + 'px';
            frame.style.borderRadius = isCirc ? '50%' : (frame.dataset.radius + 'px');
            frame.style.zIndex = '50';

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
                <button type="button" class="tb-floating-btn tb-btn-pan" title="Fotoğrafın Odak Noktasını Kaydır"><i class="fa-solid fa-arrows-up-down-left-right"></i></button>
                <button type="button" class="tb-floating-btn tb-btn-3d" title="3D Düzlemde Eğ (Sürükleyin)"><i class="fa-solid fa-cube"></i></button>
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
                <button type="button" class="tb-floating-btn tb-btn-pan" title="Fotoğrafın Odak Noktasını Kaydır"><i class="fa-solid fa-arrows-up-down-left-right"></i></button>
                <button type="button" class="tb-floating-btn tb-btn-3d" title="3D Düzlemde Eğ"><i class="fa-solid fa-cube"></i></button>
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

            return frame;
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

            // 2. Yaratıcı Şekil Maskesi Uygula (SVG Mask)
            if (hasShape) {
                clip.classList.add('shape-' + shape);
                frame.style.borderRadius = '0px';
                frame.style.border = 'none';
                frame.style.boxShadow = 'none';
                inner.style.border = 'none';

                // ORGANİK / ŞEKİL KONTUR GÖLGESİ (SVG Silhouette Drop-Shadow & Glow)
                if (effect === 'gold') {
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

                    if (parseInt(sh) > 0) {
                        frame.style.boxShadow = `0 ${Math.round(sh * 0.6)}px ${sh * 2}px rgba(0,0,0,0.35)`;
                    } else {
                        frame.style.boxShadow = 'none';
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
        },

        /**
         * Çerçeve İçi Olayları (Tıklama, Sürükle-Bırak, Tutamaçlar)
         */
        bindFrameEvents: function(frame) {
            const placeholder = frame.querySelector('.tb-frame-placeholder');
            const fileInput = frame.querySelector('.tb-frame-file-input');
            let wasAlreadySelected = false;

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
                wasAlreadySelected = (this.selectedFrame === frame);
                this.selectFrame(frame);

                // Pan Modu VEYA Alt Tuşu basılıysa: Fotoğrafı çerçeve içinde kaydır
                if (frame.classList.contains('has-image') && (e.altKey || frame.classList.contains('tb-pan-mode'))) {
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startPanX = parseFloat(frame.dataset.imgPanX) || 0;
                    const startPanY = parseFloat(frame.dataset.imgPanY) || 0;

                    const cContainer = document.getElementById('canvas-container');
                    const scaleFactor = (cContainer && cContainer._scaleFactor) ? cContainer._scaleFactor : 1;

                    const onPanMove = (moveEvent) => {
                        const dx = (moveEvent.clientX - startX) / scaleFactor;
                        const dy = (moveEvent.clientY - startY) / scaleFactor;
                        const newX = Math.round(startPanX + dx);
                        const newY = Math.round(startPanY + dy);
                        frame.dataset.imgPanX = newX;
                        frame.dataset.imgPanY = newY;

                        const pxInput = document.getElementById('tbFramePanX');
                        const pxVal = document.getElementById('tbFramePanXVal');
                        const pyInput = document.getElementById('tbFramePanY');
                        const pyVal = document.getElementById('tbFramePanYVal');
                        if (pxInput) pxInput.value = newX;
                        if (pxVal) pxVal.textContent = newX + 'px';
                        if (pyInput) pyInput.value = newY;
                        if (pyVal) pyVal.textContent = newY + 'px';

                        this.applyImageZoomPan(frame);
                    };

                    const onPanUp = () => {
                        document.removeEventListener('mousemove', onPanMove);
                        document.removeEventListener('mouseup', onPanUp);
                    };

                    document.addEventListener('mousemove', onPanMove);
                    document.addEventListener('mouseup', onPanUp);
                    return;
                }

                // Normal Çerçeve Sürüklemesi Sırasında: Başka bir çerçevenin üzerine bırakılırsa görselleri takas et!
                const origLeft = parseFloat(frame.style.left) || frame.offsetLeft;
                const origTop = parseFloat(frame.style.top) || frame.offsetTop;
                const startPointerX = e.clientX;
                const startPointerY = e.clientY;
                let hasMoved = false;
                let currentHoverTarget = null;

                const onFrameTrackMove = (moveEv) => {
                    const dist = Math.hypot(moveEv.clientX - startPointerX, moveEv.clientY - startPointerY);
                    if (dist > 18) {
                        hasMoved = true;
                    }

                    if (hasMoved) {
                        // İmleç altındaki diğer çerçeveyi bul (hit-test)
                        const allFrames = document.querySelectorAll('.tb-image-frame');
                        let hovered = null;
                        allFrames.forEach(other => {
                            if (other === frame) return;
                            const r = other.getBoundingClientRect();
                            if (
                                moveEv.clientX >= r.left &&
                                moveEv.clientX <= r.right &&
                                moveEv.clientY >= r.top &&
                                moveEv.clientY <= r.bottom
                            ) {
                                hovered = other;
                            }
                        });

                        if (hovered !== currentHoverTarget) {
                            if (currentHoverTarget) {
                                currentHoverTarget.classList.remove('tb-swap-target-hover');
                                const b = currentHoverTarget.querySelector('.tb-swap-badge');
                                if (b) b.remove();
                            }
                            currentHoverTarget = hovered;
                            if (currentHoverTarget) {
                                currentHoverTarget.classList.add('tb-swap-target-hover');
                                let badge = currentHoverTarget.querySelector('.tb-swap-badge');
                                if (!badge) {
                                    badge = document.createElement('div');
                                    badge.className = 'tb-swap-badge';
                                    badge.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Yer Değiştir';
                                    currentHoverTarget.appendChild(badge);
                                }
                            }
                        }
                    }
                };

                const onFrameTrackUp = (upEv) => {
                    document.removeEventListener('mousemove', onFrameTrackMove);
                    document.removeEventListener('mouseup', onFrameTrackUp);

                    const targetToSwap = currentHoverTarget;
                    if (currentHoverTarget) {
                        currentHoverTarget.classList.remove('tb-swap-target-hover');
                        const b = currentHoverTarget.querySelector('.tb-swap-badge');
                        if (b) b.remove();
                        currentHoverTarget = null;
                    }

                    if (hasMoved && targetToSwap && (frame.classList.contains('has-image') || targetToSwap.classList.contains('has-image'))) {
                        // Sürüklenen çerçeveyi eski koordinatlarına geri oturt (şablon düzeni bozulmasın)
                        frame.style.left = origLeft + 'px';
                        frame.style.top = origTop + 'px';

                        // İki çerçevenin görsellerini takas et!
                        this.swapFrameImages(frame, targetToSwap);
                    }

                    if (window.SmartGuides && typeof window.SmartGuides.clear === 'function') {
                        window.SmartGuides.clear();
                    }
                };

                document.addEventListener('mousemove', onFrameTrackMove);
                document.addEventListener('mouseup', onFrameTrackUp);
            });

            // Fare Tekerleği ile Çerçeve İçi Zoom (Alt veya Pan Modunda)
            frame.addEventListener('wheel', (e) => {
                if (frame.classList.contains('has-image') && (e.altKey || frame.classList.contains('tb-pan-mode'))) {
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
                }
            }, { passive: false });

            // 2. Dosya Seçme Girişi (İlk tıklama çerçeveyi aktif yapar, ikinci tıklama dosya penceresini açar)
            if (placeholder && fileInput) {
                placeholder.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (!wasAlreadySelected) {
                        // İlk tıklamada çerçeve zaten seçildi; hemen dosya penceresi açılmasın
                        wasAlreadySelected = true;
                        return;
                    }
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
            const scaleFactor = (cContainer && cContainer._scaleFactor) ? cContainer._scaleFactor : 1;

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

                this.syncSettingsPanelWithFrame(frame);
                if (window.Template3DFrame && typeof window.Template3DFrame.updateGizmoPosition === 'function') {
                    window.Template3DFrame.updateGizmoPosition(frame);
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
         * Çerçevenin İçine Fotoğraf Yükle
         */
        loadPhotoIntoFrame: function(frame, fileOrUrl) {
            const applyImg = (dataUrl) => {
                const clip = frame.querySelector('.tb-frame-clip') || frame;
                const inner = clip.querySelector('.tb-frame-inner') || clip;
                let img = frame.querySelector('.tb-frame-img');
                if (!img) {
                    img = document.createElement('img');
                    img.className = 'tb-frame-img';
                    inner.insertBefore(img, inner.firstChild);
                }

                img.src = dataUrl;
                frame.dataset.imgSrc = dataUrl;
                frame.classList.add('has-image');

                const placeholder = frame.querySelector('.tb-frame-placeholder');
                if (placeholder) placeholder.style.display = 'none';

                this.applyFrameStyling(frame);
                this.applyImageZoomPan(frame);
                this.selectFrame(frame);

                if (typeof window.recordHistory === 'function') {
                    window.recordHistory('Çerçeveye Fotoğraf Yüklendi');
                }
            };

            if (typeof fileOrUrl === 'string') {
                applyImg(fileOrUrl);
            } else if (fileOrUrl instanceof File) {
                const reader = new FileReader();
                reader.onload = (e) => applyImg(e.target.result);
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
                img.src = data.src;
                img.style.display = 'block';

                if (placeholder) placeholder.style.display = 'none';
                this.applyFrameStyling(frame);
                this.applyImageZoomPan(frame);
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
            const img = frame.querySelector('.tb-frame-img');
            if (!img) return;

            const zoom = parseFloat(frame.dataset.imgZoom) || 1.0;
            const panX = parseFloat(frame.dataset.imgPanX) || 0;
            const panY = parseFloat(frame.dataset.imgPanY) || 0;

            img.style.transform = `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${zoom})`;
        },

        /**
         * Çerçeve Seçimi
         */
        selectFrame: function(frame) {
            document.querySelectorAll('.tb-image-frame').forEach(f => {
                f.classList.remove('selected', 'el-selected');
            });
            this.selectedFrame = frame;
            if (frame) {
                frame.classList.add('selected', 'el-selected');
                window.selectedEl = frame;
                window.selectedElements = [frame];
                if (typeof selectedEl !== 'undefined') selectedEl = frame;

                this.syncSettingsPanelWithFrame(frame);

                if (window.Template3DFrame && typeof window.Template3DFrame.syncPanel === 'function') {
                    window.Template3DFrame.syncPanel(frame);
                }

                const settingsPanel = document.getElementById('tbFrameSettingsSection');
                if (settingsPanel) {
                    settingsPanel.style.display = 'block';

                    // Kullanıcı isteği: Çerçeve seçilince panel otomatik olarak Çerçeve Ayarları bölümüne kaysın
                    setTimeout(() => {
                        settingsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 60);
                }

                if (window.Template3DFrame && typeof window.Template3DFrame.isGizmoActive === 'function' && window.Template3DFrame.isGizmoActive()) {
                    window.Template3DFrame.showGizmo(frame);
                }

                this.updateDockControls(true);
                if (window.DockContextManager && typeof window.DockContextManager.onElementSelected === 'function') {
                    window.DockContextManager.onElementSelected(frame);
                }
            } else {
                if (window.selectedEl && window.selectedEl.classList && window.selectedEl.classList.contains('tb-image-frame')) {
                    window.selectedEl = null;
                    window.selectedElements = [];
                    if (typeof selectedEl !== 'undefined') selectedEl = null;
                }
                const settingsPanel = document.getElementById('tbFrameSettingsSection');
                if (settingsPanel) settingsPanel.style.display = 'none';

                if (window.Template3DFrame && typeof window.Template3DFrame.syncPanel === 'function') {
                    window.Template3DFrame.syncPanel(null);
                }
                if (window.Template3DFrame && typeof window.Template3DFrame.hideGizmo === 'function') {
                    window.Template3DFrame.hideGizmo();
                }

                document.querySelectorAll('.tb-shape-card').forEach(card => card.classList.remove('active'));
                this.updateDockControls(false);
            }
        },

        /**
         * Çerçeve Seçimini Kaldır
         */
        deselectFrame: function() {
            document.querySelectorAll('.tb-image-frame').forEach(f => {
                f.classList.remove('selected', 'el-selected');
                if (f.classList.contains('tb-pan-mode')) {
                    this.toggleImagePanMode(f, false);
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
            const panYInput = document.getElementById('tbFramePanY');
            const panYVal = document.getElementById('tbFramePanYVal');
            if (panXInput) panXInput.value = panX;
            if (panXVal) panXVal.textContent = panX + 'px';
            if (panYInput) panYInput.value = panY;
            if (panYVal) panYVal.textContent = panY + 'px';

            const rotInput = document.getElementById('tbFrameRotation');
            const rotVal = document.getElementById('tbFrameRotationVal');
            if (rotInput) rotInput.value = frame.dataset.rotation || 0;
            if (rotVal) rotVal.textContent = (frame.dataset.rotation || 0) + '°';

            // Degrade butonlarının aktifliğini güncelle
            const curBlend = frame.dataset.blendMode || 'none';
            document.querySelectorAll('.tb-blend-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.blend === curBlend);
            });

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
        },

        /**
         * Pürüzsüz Degrade Geçiş Modunu Ayarla (Fade to Background)
         */
        setFrameBlend: function(mode) {
            if (!this.selectedFrame) return;
            this.selectedFrame.dataset.blendMode = mode;
            this.applyFrameStyling(this.selectedFrame);

            document.querySelectorAll('.tb-blend-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.blend === mode);
            });
            this.syncSettingsPanelWithFrame(this.selectedFrame);
            this.updateDockControls(true);
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Çerçeve Geçişi Değiştirildi');
            }
        },

        /**
         * Yaratıcı Vektör Maske Şekli Ayarla (Bulut, Fırça, Kemer, Yırtık, vb.)
         */
        setFrameShape: function(shapeId) {
            if (!this.selectedFrame) return;
            this.selectedFrame.dataset.shape = shapeId;
            if (shapeId === 'none') {
                this.selectedFrame.dataset.isPolygon = 'false';
                this.selectedFrame.dataset.polygonClip = '';
                this.selectedFrame.dataset.isCircle = 'false';
                this.selectedFrame.dataset.radius = 12;
                const clip = this.selectedFrame.querySelector('.tb-frame-clip') || this.selectedFrame;
                clip.style.clipPath = 'none';
                clip.style.webkitClipPath = 'none';
            }
            this.applyFrameStyling(this.selectedFrame);
            this.syncSettingsPanelWithFrame(this.selectedFrame);
            this.updateDockControls(true);
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Çerçeve Şekli Değiştirildi');
            }
        },

        /**
         * Seçili Çerçeveyi Kareye ve Tam Daireye Eşitle
         */
        makeSelectedFrameCircle: function() {
            if (!this.selectedFrame) return;
            const frame = this.selectedFrame;
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
            const clip = frame.querySelector('.tb-frame-clip') || frame;
            clip.style.clipPath = 'none';
            clip.style.webkitClipPath = 'none';
            this.applyFrameStyling(frame);
            this.syncSettingsPanelWithFrame(frame);
            this.updateDockControls(true);
            if (window.Template3DFrame && typeof window.Template3DFrame.updateGizmoPosition === 'function') {
                window.Template3DFrame.updateGizmoPosition(frame);
            }
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Çerçeve Tam Daire Yapıldı');
            }
        },

        /**
         * Şekil Kartına Tıklandığında: Seçili çerçeve varsa şeklini değiştir, yoksa yeni şekilli çerçeve aç
         */
        applyShapeOrNew: function(shapeId) {
            if (this.selectedFrame) {
                const curShape = this.selectedFrame.dataset.shape || 'none';
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
            if (!this.selectedFrame) return;
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
            const curShape = this.selectedFrame.dataset.shape || 'none';
            const curIdx = cycleList.indexOf(curShape);
            const nextIdx = (curIdx + 1) % cycleList.length;
            this.setFrameShape(cycleList[nextIdx]);
        },

        /**
         * Yan Panelden Seçili Çerçeve Özelliğini Güncelle
         */
        updateSelectedFrameProp: function(prop, val) {
            if (!this.selectedFrame) return;
            const frame = this.selectedFrame;

            if (prop === 'radius') {
                const num = parseInt(val) || 0;
                if (num >= 300) {
                    frame.dataset.isCircle = 'true';
                    frame.dataset.radius = 999;
                    const v = document.getElementById('tbFrameRadiusVal');
                    if (v) v.textContent = 'Tam Daire';
                } else {
                    frame.dataset.isCircle = 'false';
                    frame.dataset.radius = num;
                    const v = document.getElementById('tbFrameRadiusVal');
                    if (v) v.textContent = num + 'px';
                }
                const shapeLabel = document.getElementById('tbCurrentShapeLabel');
                if (shapeLabel && (!frame.dataset.shape || frame.dataset.shape === 'none') && frame.dataset.isPolygon !== 'true') {
                    shapeLabel.textContent = frame.dataset.isCircle === 'true' ? 'Tam Daire' : 'Standart Kutu';
                }
            } else if (prop === 'borderWidth') {
                frame.dataset.borderWidth = val;
                const v = document.getElementById('tbFrameBorderWidthVal');
                if (v) v.textContent = val + 'px';
            } else if (prop === 'borderColor') {
                frame.dataset.borderColor = val;
            } else if (prop === 'shadow') {
                frame.dataset.shadow = val;
                const v = document.getElementById('tbFrameShadowVal');
                if (v) v.textContent = val + 'px';
            } else if (prop === 'rotation') {
                frame.dataset.rotation = val;
                const v = document.getElementById('tbFrameRotationVal');
                if (v) v.textContent = val + '°';
            } else if (prop === 'zoom') {
                const z = (parseInt(val) || 100) / 100;
                frame.dataset.imgZoom = z;
                const v = document.getElementById('tbFrameZoomVal');
                if (v) v.textContent = val + '%';
                this.applyImageZoomPan(frame);
                return;
            } else if (prop === 'panX') {
                frame.dataset.imgPanX = parseInt(val) || 0;
                const v = document.getElementById('tbFramePanXVal');
                if (v) v.textContent = (parseInt(val) || 0) + 'px';
                this.applyImageZoomPan(frame);
                return;
            } else if (prop === 'panY') {
                frame.dataset.imgPanY = parseInt(val) || 0;
                const v = document.getElementById('tbFramePanYVal');
                if (v) v.textContent = (parseInt(val) || 0) + 'px';
                this.applyImageZoomPan(frame);
                return;
            }

            this.applyFrameStyling(frame);
        },

        /**
         * Çerçeve İçi Fotoğraf Konumunu Sıfırla (Ortala)
         */
        resetImagePan: function() {
            if (!this.selectedFrame) return;
            this.selectedFrame.dataset.imgPanX = 0;
            this.selectedFrame.dataset.imgPanY = 0;
            this.syncSettingsPanelWithFrame(this.selectedFrame);
            this.applyImageZoomPan(this.selectedFrame);
        },

        /**
         * Seçili Çerçeveye Hızlı Efekt Uygula (Altın, Neon, Polaroid, Sıfırla)
         */
        setFrameEffect: function(effect) {
            if (!this.selectedFrame) return;
            const frame = this.selectedFrame;
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
            this.syncSettingsPanelWithFrame(frame);
        },

        /**
         * Seçili Çerçeveyi Çoğalt
         */
        duplicateSelectedFrame: function() {
            if (!this.selectedFrame) return;
            this.duplicateFrame(this.selectedFrame);
        },

        duplicateFrame: function(frame) {
            const w = frame.offsetWidth;
            const h = frame.offsetHeight;
            const x = (parseFloat(frame.style.left) || frame.offsetLeft) + 30;
            const y = (parseFloat(frame.style.top) || frame.offsetTop) + 30;

            this.createImageFrame({
                width: w,
                height: h,
                x: x,
                y: y,
                radius: frame.dataset.radius,
                borderWidth: frame.dataset.borderWidth,
                borderColor: frame.dataset.borderColor,
                shadow: frame.dataset.shadow,
                rotation: frame.dataset.rotation,
                effect: frame.dataset.effect,
                blend: frame.dataset.blendMode,
                shape: frame.dataset.shape || 'none',
                imgUrl: frame.dataset.imgSrc
            });
        },

        /**
         * Seçili Çerçeveyi Sil
         */
        deleteSelectedFrame: function() {
            if (!this.selectedFrame) return;
            this.deleteFrame(this.selectedFrame);
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
                el.style.bottom = '60px';
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
                el.style.bottom = '130px';
            } else if (type === 'agent_strip') {
                el.innerHTML = '<span style="font-weight:700;">Ahmet Yılmaz</span> • 0532 123 45 67 • Remax Gold';
                el.dataset.label = 'Danışman Şeridi';
                el.style.fontSize = Math.max(18, Math.round(cW * 0.016)) + 'px';
                el.style.fontWeight = '600';
                el.style.color = '#ffffff';
                el.style.background = 'rgba(2, 132, 199, 0.9)';
                el.style.padding = '8px 18px';
                el.style.borderRadius = '6px';
                el.style.right = '60px';
                el.style.bottom = '60px';
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
                alert('Lütfen önce bir hazır düzen veya görsel çerçevesi ekleyin.');
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
                window.PortfolioManager.applyPreset(layoutKey);
                return;
            }

            // Önceki görsel çerçevelerini ve hazır düzen/portföy yazılarını temizle
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
                            radius: f.radius !== undefined ? f.radius : 12,
                            shadow: f.shadow !== undefined ? f.shadow : 10,
                            blend: f.blend || 'none',
                            shape: f.shape || 'none',
                            rotation: f.rotation || 0,
                            borderWidth: f.borderWidth || 0,
                            borderColor: f.borderColor || '#ffffff',
                            label: `Fotoğraf ${idx + 1}`
                        });
                    });
                }

                if (targetLayout.texts && targetLayout.texts.length > 0) {
                    targetLayout.texts.forEach(t => {
                        this.createLayoutTextFrame(t, cW, cH);
                    });
                }

                this.deselectFrame();
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

                this.createImageFrame({ x: pad, y: pad, width: leftW, height: cH - (pad * 2), radius: 14 });
                this.createImageFrame({ x: pad + leftW + gap, y: pad, width: rightW, height: rightH, radius: 14 });
                this.createImageFrame({ x: pad + leftW + gap, y: pad, width: rightW, height: rightH, radius: 14 });

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

        saveCurrentTemplate: function(name) {
            const templateName = name || prompt('Şablonunuza bir isim verin:', 'Özel Portföy Şablonum');
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
                    radius: f.dataset.radius,
                    borderWidth: f.dataset.borderWidth,
                    borderColor: f.dataset.borderColor,
                    shadow: f.dataset.shadow,
                    blend: f.dataset.blendMode || 'none',
                    shape: f.dataset.shape || 'none',
                    imgUrl: f.dataset.imgSrc || ''
                });
            });

            const templateObj = {
                id: 'tpl_' + Date.now(),
                name: templateName.trim(),
                createdAt: new Date().toLocaleDateString('tr-TR'),
                ratio: this.currentRatio,
                width: cW,
                height: cH,
                bgColor: cContainer.style.backgroundColor || '',
                bgImage: cContainer.style.backgroundImage || '',
                frames: framesData
            };

            this.customTemplates.unshift(templateObj);
            this.persistCustomTemplates();
            this.renderSavedTemplatesList();

            alert('Tebrikler! "' + templateName + '" şablonunuz başarıyla kaydedildi.');
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
            if (tpl.bgColor) this.setCanvasBackground('color', tpl.bgColor);
            if (tpl.bgImage) this.setCanvasBackground('gradient', tpl.bgImage);

            document.querySelectorAll('.tb-image-frame').forEach(f => f.remove());

            tpl.frames.forEach(f => {
                this.createImageFrame({
                    width: f.width,
                    height: f.height,
                    x: f.left,
                    y: f.top,
                    radius: f.radius,
                    borderWidth: f.borderWidth,
                    borderColor: f.borderColor,
                    shadow: f.shadow,
                    blend: f.blend || 'none',
                    shape: f.shape || 'none',
                    imgUrl: f.imgUrl
                });
            });

            this.deselectFrame();
        },

        deleteCustomTemplate: function(idx) {
            this.customTemplates.splice(idx, 1);
            this.persistCustomTemplates();
            this.renderSavedTemplatesList();
        },

        /**
         * 6. AŞAMA: Tuval Altı Dinamik Dock Güncellemesi
         */
        updateDockControls: function(hasSelectedFrame) {
            const dockGroup = document.getElementById('dockGroup_create-template');
            if (!dockGroup) return;

            if (hasSelectedFrame && this.selectedFrame) {
                const curBlend = this.selectedFrame.dataset.blendMode || 'none';
                const isBlendActive = curBlend !== 'none';
                const curShape = this.selectedFrame.dataset.shape || 'none';
                const isShapeActive = curShape !== 'none';
                dockGroup.innerHTML = `
                    <button type="button" class="dock-btn" onclick="TemplateBuilder.triggerSelectedFrameUpload()" title="Fotoğraf Yükle veya Değiştir">
                        <span class="dock-icon"><i class="fa-solid fa-camera"></i></span>
                        <span class="dock-label">Foto</span>
                    </button>
                    <button type="button" class="dock-btn" onclick="TemplateBuilder.addInfoCard('bottom')" title="Alta Bilgi Kartı Ekle">
                        <span class="dock-icon"><i class="fa-solid fa-id-card"></i></span>
                        <span class="dock-label">Kart</span>
                    </button>
                    <button type="button" class="dock-btn ${isShapeActive ? 'lock-active' : ''}" onclick="TemplateBuilder.cycleFrameShape()" title="Yaratıcı Şekli Değiştir">
                        <span class="dock-icon"><i class="fa-solid fa-shapes"></i></span>
                        <span class="dock-label">Şekil</span>
                    </button>
                    <button type="button" class="dock-btn ${isBlendActive ? 'lock-active' : ''}" onclick="TemplateBuilder.toggleSelectedFrameBlend()" title="Zemine Eriyen Degrade Geçiş">
                        <span class="dock-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></span>
                        <span class="dock-label">Degrade</span>
                    </button>
                    <button type="button" class="dock-btn" onclick="TemplateBuilder.cycleSelectedFrameRadius()" title="Köşe Kavisini Değiştir">
                        <span class="dock-icon"><i class="fa-solid fa-border-all"></i></span>
                        <span class="dock-label">Kavis</span>
                    </button>
                    <button type="button" class="dock-btn" onclick="if(window.Template3DFrame) Template3DFrame.applyPreset('isoLeft')" title="3D İzometrik Açı Uygula">
                        <span class="dock-icon"><i class="fa-solid fa-cube"></i></span>
                        <span class="dock-label">3D</span>
                    </button>
                    <button type="button" class="dock-btn" onclick="TemplateBuilder.zoomSelectedFrame(15)" title="Fotoğrafı Yakınlaştır">
                        <span class="dock-icon"><i class="fa-solid fa-magnifying-glass-plus"></i></span>
                        <span class="dock-label">Büyüt</span>
                    </button>
                    <button type="button" class="dock-btn ${this.selectedFrame.classList.contains('tb-pan-mode') ? 'lock-active' : ''}" onclick="TemplateBuilder.toggleImagePanMode(TemplateBuilder.selectedFrame)" title="Fotoğrafın Odak Noktasını Kaydır">
                        <span class="dock-icon"><i class="fa-solid fa-arrows-up-down-left-right"></i></span>
                        <span class="dock-label">Kaydır</span>
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
                    <button type="button" class="dock-btn" onclick="if(window.CarouselManager) CarouselManager.toggleBar()" title="Çoklu Gönderi Albüm Şeridini Aç veya Kapat">
                        <span class="dock-icon"><i class="fa-solid fa-film"></i></span>
                        <span class="dock-label">Çoklu Gönderi</span>
                    </button>
                    <button type="button" class="dock-btn" onclick="TemplateBuilder.createImageFrame()" title="Yeni Görsel Çerçevesi Ekle">
                        <span class="dock-icon"><i class="fa-solid fa-image"></i></span>
                        <span class="dock-label">Çerçeve</span>
                    </button>
                    <button type="button" class="dock-btn dock-snap-btn" onclick="if(typeof window.toggleSmartGuides === 'function') window.toggleSmartGuides()" title="Akıllı Manyetik Hizalamayı Aç veya Kapat">
                        <span class="dock-icon"><i class="fa-solid fa-magnet"></i></span>
                        <span class="dock-label">Hizalama</span>
                    </button>
                    <button type="button" class="dock-btn" onclick="TemplateBuilder.uploadMultiplePhotos()" title="Tüm Çerçevelere Sırayla Fotoğraf Yükle">
                        <span class="dock-icon"><i class="fa-solid fa-images"></i></span>
                        <span class="dock-label">Toplu Görsel</span>
                    </button>
                    <button type="button" class="dock-btn" onclick="TemplateBuilder.addInfoCard('bottom')" title="Alta Bilgi Kartı Ekle">
                        <span class="dock-icon"><i class="fa-solid fa-id-card"></i></span>
                        <span class="dock-label">Kart</span>
                    </button>
                    <button type="button" class="dock-btn" onclick="if(window.TemplatePolygonFrame) TemplatePolygonFrame.startDrawing()" title="Serbest Çokgen Çerçeve Çiz">
                        <span class="dock-icon"><i class="fa-solid fa-draw-polygon"></i></span>
                        <span class="dock-label">Çokgen</span>
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
            if (!this.selectedFrame) return;
            const input = this.selectedFrame.querySelector('.tb-frame-file-input');
            if (input) input.click();
        },

        toggleSelectedFrameBlend: function() {
            if (!this.selectedFrame) return;
            const cur = this.selectedFrame.dataset.blendMode || 'none';
            const next = cur === 'none' ? 'bottom' : (cur === 'bottom' ? 'right' : 'none');
            this.setFrameBlend(next);
        },

        cycleSelectedFrameRadius: function() {
            if (!this.selectedFrame) return;
            const cur = parseInt(this.selectedFrame.dataset.radius) || 0;
            let next = 16;
            if (cur === 16) next = 36;
            else if (cur === 36) next = 999;
            else if (cur >= 999) next = 0;
            this.updateSelectedFrameProp('radius', next);
            const rInput = document.getElementById('tbFrameRadius');
            if (rInput) rInput.value = next;
        },

        zoomSelectedFrame: function(deltaPercent) {
            if (!this.selectedFrame) return;
            const curZoom = parseFloat(this.selectedFrame.dataset.imgZoom) || 1.0;
            let newZoom = Math.min(2.5, Math.max(1.0, curZoom + (deltaPercent / 100)));
            if (curZoom >= 2.45) newZoom = 1.0; // döngüsel sıfırlama
            this.updateSelectedFrameProp('zoom', Math.round(newZoom * 100));
        }
    };

    window.TemplateBuilder = TemplateBuilder;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => TemplateBuilder.init());
    } else {
        TemplateBuilder.init();
    }

})(window);
