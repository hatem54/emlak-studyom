/**
 * ============================================================================
 * 🎯 Emlak Stüdyom - Doku Klonlama Damgası & Alan Yaması (Clone Stamp Engine)
 * modules/clone-stamp.js
 * ============================================================================
 *
 * - 0..1000 SVG ViewBox Koordinat Senkronizasyonu
 * - 60 FPS Donanım Hızında Canlı Fırça (Önceden Üretilmiş Feather Maskesi & Donanım Hızı)
 * - Alan Fırçası (Area Brush): Villanın üzerini fırçayla boyayarak serbest seçim
 * - Çokgen Seçim (Polygon): Köşelere tıklayarak mimari yapı/villa seçimi & canlı elastik kılavuz
 * - Serbest Kement (Lasso): Serbest el hareketiyle nesne çevreleme
 * - Eşzamanlı Çift Şablon Önizlemesi: Mavi Hedef Alanı ↔ Yeşil Kaynak Doku Alanı
 * - Sürüklenebilir Yeşil Kaynak Göstergesi & Alanı (🎯 Kaynak Doku Alanı)
 * - Yumuşak Radyal & Çokgen Kenar Geçişi (Feather Alpha Compositing)
 * - 1:1 Doğal Fotoğraf Çözünürlüğü & Kesintisiz Geçmiş (Ctrl+Z) Desteği
 */

(function(window) {
    'use strict';

    const CloneStamp = {
        isInitialized: false,
        isActive: false,

        // Modlar: 'brush' (canlı fırça), 'area_brush' (alan fırçası), 'polygon' (çokgen seçim), 'lasso' (serbest kement)
        mode: 'brush',

        // Parametreler
        brushSize: 60,       // px (tuval ölçeğinde)
        feather: 0.5,        // 0..1 (yumuşak kenar geçişi)
        opacity: 1.0,        // 0.1..1.0
        aligned: true,       // ofset korunsun mu

        // Kaynak Noktası (Normalized 0..1)
        sourcePoint: null,   // { x: 0.5, y: 0.5 }
        isPickingSource: false,
        isDraggingSourcePin: false,
        isDraggingSourceArea: false,
        dragSourceAreaOffset: null,

        // Canlı Boyama Durumu (60 FPS canlı fırça motoru)
        isPainting: false,
        lastPaintPt: null,
        paintStrokeOffset: null,
        _workCanvas: null,
        _workCtx: null,
        _strokeBufferCanvas: null,
        _strokeBufferCtx: null,
        _liveCanvas: null,
        _liveCtx: null,
        _featherMaskCanvas: null,
        _cachedFeatherRadius: 0,
        _cachedFeatherVal: -1,
        _stampBufferCanvas: null,
        _rafPending: false,
        _cachedRect: null,
        _cachedRectTime: 0,
        _activeTransform: null,

        // Seçim Alanı Durumu (Polygon, Lasso, Area Brush)
        areaPoints: [],          // Çokgen ve kement için nokta listesi [{x, y}]
        brushStrokes: [],        // Alan fırçası için darbeler listesi [[{x, y, r}, ...]]
        currentBrushStroke: null,
        isDrawingLasso: false,
        isDrawingAreaBrush: false,
        isAreaClosed: false,

        // Tuval & SVG Referansları
        containerEl: null,
        svgEl: null,
        lastHoverPos: null,

        /**
         * Başlatıcı
         */
        init: function() {
            if (this.isInitialized) return;
            this.isInitialized = true;
            this.containerEl = document.getElementById('canvas-container');
            this.svgEl = document.getElementById('maskInteractiveSvg');
            this.ensureLiveCanvas();
            this.bindEvents();
        },

        ensureLiveCanvas: function() {
            if (!this.containerEl) this.containerEl = document.getElementById('canvas-container');
            if (!this.containerEl) return;

            let cv = document.getElementById('cloneLivePreviewCanvas');
            if (!cv) {
                cv = document.createElement('canvas');
                cv.id = 'cloneLivePreviewCanvas';
                cv.style.position = 'absolute';
                cv.style.top = '0';
                cv.style.left = '0';
                cv.style.width = '100%';
                cv.style.height = '100%';
                cv.style.pointerEvents = 'none';
                cv.style.zIndex = '5';
                cv.style.display = 'none';
                this.containerEl.appendChild(cv);
            }
            this._liveCanvas = cv;
            this._liveCtx = cv.getContext('2d');
        },

        /**
         * Klonlama Aracını Açar veya Kapatır (Toggle)
         */
        toggle: function() {
            if (this.isActive) {
                this.deactivate();
            } else {
                this.activate();
            }
        },

        /**
         * Klonlama Aracını Aktifleştirir
         */
        activate: function() {
            this.init();

            // Diğer standart maske panellerini ve rehberlerini tamamen kapat
            if (window.PhotoMasksManager) {
                const mgr = window.PhotoMasksManager;
                mgr.panelsCollapsed = true;
                mgr.isGuidesVisible = false;
                mgr.activeTool = null;
                mgr.hideGuides();
                mgr.updatePanelsVisibility();
            }

            this.isActive = true;

            if (!this.svgEl) this.svgEl = document.getElementById('maskInteractiveSvg');
            if (!this.containerEl) this.containerEl = document.getElementById('canvas-container');

            // SVG katmanını tıklanabilir yap ve görünür kıl
            if (this.svgEl) {
                this.svgEl.style.display = '';
                this.svgEl.style.pointerEvents = 'auto';
                this.svgEl.style.cursor = 'none';
            }

            // Klonlama panelini göster
            const clonePanel = document.getElementById('cloneStampControls');
            if (clonePanel) clonePanel.style.display = 'block';

            // Akordeon açık olsun
            const acc = document.getElementById('photoMasksAccordion');
            if (acc && !acc.open) acc.open = true;

            // Araç butonlarının aktiflik sınıfını güncelle
            if (window.PhotoMasksManager) {
                window.PhotoMasksManager.updateToolButtons();
            } else {
                document.querySelectorAll('.mask-tool-btn').forEach(b => b.classList.remove('active'));
                const cloneBtn = document.getElementById('maskToolCloneBtn');
                if (cloneBtn) cloneBtn.classList.add('active');
            }

            // Aktif görseli kontrol et; eğer görsel değişmişse veya workCanvas eski görselin ölçülerinde değilse sıfırla
            const sourceImg = this.getSourceImage();
            if (sourceImg) {
                const natW = sourceImg.naturalWidth || sourceImg.width;
                const natH = sourceImg.naturalHeight || sourceImg.height;
                if (this._workCanvas && (this._workCanvas.width !== natW || this._workCanvas.height !== natH)) {
                    this._workCanvas = null;
                    this._workCtx = null;
                    this._strokeBufferCanvas = null;
                    this._strokeBufferCtx = null;
                    this.sourcePoint = null;
                }
            }

            // Kaynak daha önce belirlenmemişse temiz kaynak seçme modunda başlat (rastgele daire konmaz)
            if (!this.sourcePoint) {
                this.isPickingSource = true;
            }

            // Slider değerlerini DOM ile senkronize et
            const sInp = document.getElementById('mask_clone_size');
            if (sInp) this.brushSize = parseInt(sInp.value, 10) || 60;
            const fInp = document.getElementById('mask_clone_feather');
            if (fInp) this.feather = (parseFloat(fInp.value) / 100);
            const oInp = document.getElementById('mask_clone_opacity');
            if (oInp) this.opacity = (parseFloat(oInp.value) / 100);

            this.updateSourceStatusUI();
            this.updateModeUI();
            this.renderSvg();
        },

        /**
         * Klonlama Aracını Kapatır
         */
        deactivate: function() {
            this.isActive = false;
            this.isPainting = false;
            this.isPickingSource = false;
            this.isDraggingSourcePin = false;
            this.isDraggingSourceArea = false;
            this.areaPoints = [];
            this.brushStrokes = [];
            this.currentBrushStroke = null;
            this.isAreaClosed = false;
            this.lastHoverPos = null;

            if (this._liveCanvas) {
                this._liveCanvas.style.display = 'none';
                if (this._liveCtx) this._liveCtx.clearRect(0, 0, this._liveCanvas.width, this._liveCanvas.height);
            }

            if (this.svgEl) {
                this.svgEl.style.cursor = 'default';
                this.svgEl.innerHTML = '';
            }

            const clonePanel = document.getElementById('cloneStampControls');
            if (clonePanel) clonePanel.style.display = 'none';

            const cloneBtn = document.getElementById('maskToolCloneBtn');
            if (cloneBtn) cloneBtn.classList.remove('active');

            if (window.PhotoMasksManager) {
                window.PhotoMasksManager.updateSvgPointerEvents();
                window.PhotoMasksManager.updateToolButtons();
                if (window.PhotoMasksManager.isGuidesVisible) {
                    window.PhotoMasksManager.renderSvg();
                }
            }
        },

        /**
         * Klonlama Aracını ve Bellek Ön Belleklerini Tamamen Sıfırlar (Sayfa temizleme ve yeni görsel açma için)
         */
        reset: function() {
            this.deactivate();
            this.sourcePoint = null;
            if (this._workCanvas) {
                this._workCanvas.width = 1;
                this._workCanvas.height = 1;
                this._workCanvas = null;
                this._workCtx = null;
            }
            if (this._strokeBufferCanvas) {
                this._strokeBufferCanvas.width = 1;
                this._strokeBufferCanvas.height = 1;
                this._strokeBufferCanvas = null;
                this._strokeBufferCtx = null;
            }
            if (this._stampBufferCanvas) {
                this._stampBufferCanvas.width = 1;
                this._stampBufferCanvas.height = 1;
                this._stampBufferCanvas = null;
            }
            if (this._featherMaskCanvas) {
                this._featherMaskCanvas.width = 1;
                this._featherMaskCanvas.height = 1;
                this._featherMaskCanvas = null;
            }
            if (this._liveCanvas && this._liveCtx) {
                this._liveCtx.clearRect(0, 0, this._liveCanvas.width, this._liveCanvas.height);
                this._liveCanvas.style.display = 'none';
            }
            this._cachedFeatherRadius = 0;
            this._cachedFeatherVal = -1;
            this._activeTransform = null;
            this.invalidateRectCache();
            this.areaPoints = [];
            this.brushStrokes = [];
            this.currentBrushStroke = null;
            this.isAreaClosed = false;
            this.lastHoverPos = null;
        },

        /**
         * Mod Değiştirme ('brush', 'area_brush', 'polygon', 'lasso')
         */
        setMode: function(newMode) {
            this.mode = newMode;
            this.areaPoints = [];
            this.brushStrokes = [];
            this.currentBrushStroke = null;
            this.isAreaClosed = false;
            this.isDrawingLasso = false;
            this.isDrawingAreaBrush = false;

            this.updateModeUI();
            this.renderSvg();
        },

        /**
         * 60 FPS Donanım Senkronlu SVG Güncelleyici (Kasmaları ve donmaları tamamen önler)
         */
        requestSvgRender: function() {
            if (this._rafPending) return;
            this._rafPending = true;
            requestAnimationFrame(() => {
                this._rafPending = false;
                if (this.isActive) {
                    this.renderSvg();
                }
            });
        },

        /**
         * Fırça ve Damga Boyutunu Ayarlar (10px - 250px)
         */
        setSize: function(val) {
            this.brushSize = Math.max(10, Math.min(250, parseInt(val, 10) || 60));
            const sInp = document.getElementById('mask_clone_size');
            const sVal = document.getElementById('mask_clone_sizeVal');
            if (sInp && parseInt(sInp.value, 10) !== this.brushSize) sInp.value = this.brushSize;
            if (sVal) sVal.textContent = this.brushSize + 'px';
            this._cachedFeatherRadius = -1;
            this.requestSvgRender();
        },

        /**
         * Kenar Yumuşatma / Gradyan Oranını Ayarlar (0.00 = Keskin, 1.00 = Tam Yumuşak)
         */
        setFeather: function(val) {
            this.feather = Math.max(0, Math.min(1, parseFloat(val) || 0));
            const fInp = document.getElementById('mask_clone_feather');
            const fVal = document.getElementById('mask_clone_featherVal');
            const pct = Math.round(this.feather * 100);
            if (fInp && Math.round(parseFloat(fInp.value)) !== pct) fInp.value = pct;
            if (fVal) fVal.textContent = pct + '%';
            this._cachedFeatherVal = -1;
            this.requestSvgRender();
        },

        /**
         * Klonlama Baskı Opaklığını Ayarlar (10% - 100%)
         */
        setOpacity: function(val) {
            this.opacity = Math.max(0.1, Math.min(1, parseFloat(val) || 1));
            const oInp = document.getElementById('mask_clone_opacity');
            const oVal = document.getElementById('mask_clone_opacityVal');
            const pct = Math.round(this.opacity * 100);
            if (oInp && Math.round(parseFloat(oInp.value)) !== pct) oInp.value = pct;
            if (oVal) oVal.textContent = pct + '%';
            if (this._liveCanvas) {
                this._liveCanvas.style.opacity = String(this.opacity);
            }
            this.requestSvgRender();
        },

        updateModeUI: function() {
            const bBtn = document.getElementById('cloneModeBrushBtn');
            const abBtn = document.getElementById('cloneModeAreaBrushBtn');
            const pBtn = document.getElementById('cloneModePolyBtn');
            const lBtn = document.getElementById('cloneModeLassoBtn');

            if (bBtn) bBtn.classList.toggle('active', this.mode === 'brush');
            if (abBtn) abBtn.classList.toggle('active', this.mode === 'area_brush');
            if (pBtn) pBtn.classList.toggle('active', this.mode === 'polygon');
            if (lBtn) lBtn.classList.toggle('active', this.mode === 'lasso');

            const isAreaMode = (this.mode === 'area_brush' || this.mode === 'polygon' || this.mode === 'lasso');
            const areaActionRow = document.getElementById('cloneAreaActionRow');
            if (areaActionRow) {
                areaActionRow.style.display = isAreaMode ? 'block' : 'none';
            }

            // Mod rehber metnini güncelle
            const hintEl = document.getElementById('cloneModeHintText');
            if (hintEl) {
                if (this.mode === 'area_brush') {
                    hintEl.innerHTML = 'Kapatılacak villanın üzerini fırçayla boyayın. Yeşil kaynak çerçevesini temiz çime sürükleyip <b>Alanı Klonla</b>ya basın.';
                } else if (this.mode === 'polygon') {
                    hintEl.innerHTML = 'Köşelere tıklayarak villayı çevreleyin. İlk noktaya veya çift tıklayarak kapatın, ardından <b>Alanı Klonla</b>ya basın.';
                } else if (this.mode === 'lasso') {
                    hintEl.innerHTML = 'Fareyi basılı tutarak villanın etrafını çizin. Bıraktığınızda yeşil alanı temiz çime taşıyıp <b>Alanı Klonla</b>ya basın.';
                } else {
                    hintEl.innerHTML = 'Kaynak Seç butonuna basıp temiz çime tıklayın, ardından fareyi basılı tutarak villanın üzerine canlı boyayın.';
                }
            }
        },

        /**
         * Kaynak Seçme Modunu Açar / Kapatır
         */
        togglePickSource: function() {
            this.isPickingSource = !this.isPickingSource;
            this.updateSourceStatusUI();
            this.renderSvg();
        },

        setPickingSource: function(val) {
            this.isPickingSource = !!val;
            this.updateSourceStatusUI();
            this.renderSvg();
        },

        clearMask: function() {
            if (typeof this.clearAreaDrawing === 'function') {
                this.clearAreaDrawing();
            }
        },

        updateSourceStatusUI: function() {
            const statusEl = document.getElementById('cloneSourceStatus');
            const rowEl = document.getElementById('cloneSourceRow');
            const pickBtn = document.getElementById('clonePickSourceBtn');

            if (rowEl) {
                rowEl.classList.toggle('setting-source', this.isPickingSource);
            }

            if (pickBtn) {
                pickBtn.classList.toggle('active', this.isPickingSource);
            }

            if (statusEl) {
                if (this.isPickingSource) {
                    statusEl.textContent = 'Tuvalde kopyalanacak temiz dokuya tıklayın';
                    statusEl.style.color = '#10b981';
                } else if (this.sourcePoint) {
                    const px = Math.round(this.sourcePoint.x * 100);
                    const py = Math.round(this.sourcePoint.y * 100);
                    statusEl.textContent = `Kaynak: X:%${px} Y:%${py}`;
                    statusEl.style.color = '';
                } else {
                    statusEl.textContent = 'Kaynak: Belirlenmedi';
                    statusEl.style.color = '';
                }
            }
        },

        /**
         * ====================================================================
         * 📐 KOORDİNAT DÖNÜŞÜMLERİ
         * ====================================================================
         */
        getContainerRect: function() {
            const now = performance.now();
            if (!this._cachedRect || (now - this._cachedRectTime) > 300) {
                if (!this.containerEl) this.containerEl = document.getElementById('canvas-container');
                this._cachedRect = this.containerEl ? this.containerEl.getBoundingClientRect() : { left: 0, top: 0, width: 1920, height: 1080 };
                this._cachedRectTime = now;
            }
            return this._cachedRect;
        },

        invalidateRectCache: function() {
            this._cachedRect = null;
            this._cachedRectTime = 0;
            this._activeTransform = null;
        },

        getContainerDimensions: function() {
            const rect = this.getContainerRect();
            return { cW: rect.width || 1920, cH: rect.height || 1080 };
        },

        getSourceImage: function() {
            const globalImg = window._globalNativeImg;
            const pl = document.getElementById('photo-layer');
            const plImg = pl && pl._nativeImg;
            const glImg = window.WebGLPhotoEngine && window.WebGLPhotoEngine.currentImage;

            // Her zaman tuvaldeki en taze, aktif görseli baz al
            let activeImg = globalImg || plImg || glImg || null;

            // WebGL motoru eski görselde kalmışsa anında senkronize et
            if (activeImg && window.WebGLPhotoEngine && window.WebGLPhotoEngine.currentImage !== activeImg) {
                window.WebGLPhotoEngine.currentImage = activeImg;
            }
            return activeImg;
        },

        getTransformInfo: function() {
            if (this._activeTransform) return this._activeTransform;

            const sourceImg = this.getSourceImage();
            const natW = sourceImg ? (sourceImg.naturalWidth || sourceImg.width) : 1920;
            const natH = sourceImg ? (sourceImg.naturalHeight || sourceImg.height) : 1080;
            const { cW, cH } = this.getContainerDimensions();

            const pl = document.getElementById('photo-layer');
            const scale = pl ? (parseFloat(pl.dataset.zpScale) || 1) : 1;
            const panX = pl ? (parseFloat(pl.dataset.zpX) || 0) : 0;
            const panY = pl ? (parseFloat(pl.dataset.zpY) || 0) : 0;

            const sliderX = document.getElementById('photoXCtrl') ? parseFloat(document.getElementById('photoXCtrl').value) : 50;
            const sliderY = document.getElementById('photoYCtrl') ? parseFloat(document.getElementById('photoYCtrl').value) : 50;
            const zoomCtrl = document.getElementById('photoZoomCtrl') ? parseFloat(document.getElementById('photoZoomCtrl').value) : 100;

            const imgRatio = natW / natH;
            const boxRatio = cW / cH;

            let drawW, drawH;
            if (zoomCtrl !== 100) {
                const coverScale = (cW * (zoomCtrl / 100)) / natW;
                drawW = natW * coverScale;
                drawH = natH * coverScale;
            } else {
                if (imgRatio > boxRatio) {
                    drawH = cH;
                    drawW = natW * (cH / natH);
                } else {
                    drawW = cW;
                    drawH = natH * (cW / natW);
                }
            }

            const baseX = (cW - drawW) * (sliderX / 100);
            const baseY = (cH - drawH) * (sliderY / 100);
            const cx = cW / 2;
            const cy = cH / 2;

            const info = {
                cW, cH, natW, natH,
                scale, panX, panY,
                drawW, drawH,
                baseX, baseY,
                cx, cy,
                scaleRatio: natW / drawW
            };

            return info;
        },

        containerToNative: function(normX, normY) {
            const t = this.getTransformInfo();
            const px = normX * t.cW;
            const py = normY * t.cH;

            const x1 = px - t.cx;
            const y1 = py - t.cy;
            const x2 = x1 / t.scale;
            const y2 = y1 / t.scale;
            const x3 = x2 + (t.cx - t.panX);
            const y3 = y2 + (t.cy - t.panY);
            const x4 = x3 - t.baseX;
            const y4 = y3 - t.baseY;
            const natX = x4 * (t.natW / t.drawW);
            const natY = y4 * (t.natH / t.drawH);

            return {
                x: Math.max(0, Math.min(t.natW, natX)),
                y: Math.max(0, Math.min(t.natH, natY)),
                natW: t.natW,
                natH: t.natH,
                scaleRatio: t.scaleRatio
            };
        },

        nativeToContainer: function(natX, natY) {
            const t = this.getTransformInfo();
            const x4 = natX / (t.natW / t.drawW);
            const y4 = natY / (t.natH / t.drawH);
            const x3 = x4 + t.baseX;
            const y3 = y4 + t.baseY;
            const x2 = x3 - (t.cx - t.panX);
            const y2 = y3 - (t.cy - t.panY);
            const x1 = x2 * t.scale;
            const y1 = y2 * t.scale;
            const px = x1 + t.cx;
            const py = y1 + t.cy;

            return {
                normX: Math.max(0, Math.min(1, px / t.cW)),
                normY: Math.max(0, Math.min(1, py / t.cH)),
                px,
                py
            };
        },

        getNormalizedCoords: function(e) {
            const rect = this.getContainerRect();
            const rw = (rect && rect.width > 0) ? rect.width : 800;
            const rh = (rect && rect.height > 0) ? rect.height : 600;
            const rLeft = rect ? rect.left : 0;
            const rTop = rect ? rect.top : 0;
            const clientX = (e && e.touches && e.touches[0]) ? e.touches[0].clientX : (e && e.clientX !== undefined ? e.clientX : 0);
            const clientY = (e && e.touches && e.touches[0]) ? e.touches[0].clientY : (e && e.clientY !== undefined ? e.clientY : 0);
            const x = Math.max(0, Math.min(1, (clientX - rLeft) / rw));
            const y = Math.max(0, Math.min(1, (clientY - rTop) / rh));
            return { x, y };
        },

        /**
         * ====================================================================
         * ⚡ 60 FPS DONANIM HIZINDA CANLI FIRÇA MOTORU (ZERO-LAG LIVE BRUSH)
         * ====================================================================
         */

        /**
         * Yumuşak radyal maskeyi önceden üretir (Sıfır çöp toplayıcı / Zero-GC)
         * feather <= 0.01 iken %100 jilet gibi keskin çember üretir
         * feather > 0.01 iken %100'e doğru genişleyen, gerçek ve ultra-yumuşak gradyan geçişi üretir
         */
        ensureFeatherMaskCanvas: function(radiusNat, feather) {
            const fVal = Math.max(0, Math.min(1, Math.round(feather * 100) / 100));
            const rNat = Math.round(radiusNat * 10) / 10;
            const rEff = (fVal <= 0.01) ? rNat : (rNat * (1 + fVal * 0.45));
            const d = Math.max(4, Math.ceil(rEff * 2));

            if (!this._featherMaskCanvas) {
                this._featherMaskCanvas = document.createElement('canvas');
            }

            if (this._featherMaskCanvas.width !== d || this._featherMaskCanvas.height !== d ||
                this._cachedFeatherVal !== fVal || this._cachedFeatherRadius !== rNat) {
                this._featherMaskCanvas.width = d;
                this._featherMaskCanvas.height = d;
                this._cachedFeatherRadius = rNat;
                this._cachedFeatherVal = fVal;
                this._featherMaskCanvas._radiusEff = rEff;

                const ctx = this._featherMaskCanvas.getContext('2d');
                ctx.clearRect(0, 0, d, d);
                const cx = d / 2;
                const cy = d / 2;

                if (fVal <= 0.01) {
                    // %0 Yumuşaklık: Jilet gibi keskin kenar (100% Solid Crisp Circle, sıfır bulanıklık)
                    ctx.fillStyle = '#000000';
                    ctx.beginPath();
                    ctx.arc(cx, cy, rNat, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // %1 - %100 Yumuşaklık: Gerçek ultra-geniş, pürüzsüz ve kadifemsi gradyan geçişi
                    // 100%'de innerR = 0 olup en merkezden en dışa kadar kesintisiz akıcı gradyan üretir
                    const innerR = rEff * Math.pow(Math.max(0, 1 - fVal * 1.25), 2);
                    const grad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, rEff);
                    grad.addColorStop(0.00, 'rgba(0,0,0,1.0)');
                    grad.addColorStop(0.12, 'rgba(0,0,0,0.88)');
                    grad.addColorStop(0.25, 'rgba(0,0,0,0.72)');
                    grad.addColorStop(0.40, 'rgba(0,0,0,0.52)');
                    grad.addColorStop(0.55, 'rgba(0,0,0,0.34)');
                    grad.addColorStop(0.70, 'rgba(0,0,0,0.18)');
                    grad.addColorStop(0.85, 'rgba(0,0,0,0.06)');
                    grad.addColorStop(0.95, 'rgba(0,0,0,0.015)');
                    grad.addColorStop(1.00, 'rgba(0,0,0,0.0)');

                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(cx, cy, rEff, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (!this._featherMaskCanvas._radiusEff) {
                this._featherMaskCanvas._radiusEff = rEff;
            }
            return this._featherMaskCanvas;
        },

        startLiveBrush: function(pos) {
            const sourceImg = this.getSourceImage();
            if (!sourceImg) return;

            const natW = sourceImg.naturalWidth || sourceImg.width;
            const natH = sourceImg.naturalHeight || sourceImg.height;

            if (!this._workCanvas) {
                this._workCanvas = document.createElement('canvas');
            }
            if (this._workCanvas.width !== natW || this._workCanvas.height !== natH) {
                this._workCanvas.width = natW;
                this._workCanvas.height = natH;
            }
            this._workCtx = this._workCanvas.getContext('2d');
            this._workCtx.drawImage(sourceImg, 0, 0, natW, natH);

            // 4K İzole İnme Tuvali (Dabs'lerin birbirini katlayarak opaklığı %100 yapmasını önler)
            if (!this._strokeBufferCanvas) {
                this._strokeBufferCanvas = document.createElement('canvas');
            }
            if (this._strokeBufferCanvas.width !== natW || this._strokeBufferCanvas.height !== natH) {
                this._strokeBufferCanvas.width = natW;
                this._strokeBufferCanvas.height = natH;
            }
            this._strokeBufferCtx = this._strokeBufferCanvas.getContext('2d');
            this._strokeBufferCtx.clearRect(0, 0, natW, natH);

            const { cW, cH } = this.getContainerDimensions();
            this.ensureLiveCanvas();
            if (this._liveCanvas) {
                if (this._liveCanvas.width !== cW || this._liveCanvas.height !== cH) {
                    this._liveCanvas.width = cW;
                    this._liveCanvas.height = cH;
                }
                this._liveCanvas.style.display = 'block';
                this._liveCanvas.style.opacity = String(this.opacity);
                if (this._liveCtx) this._liveCtx.clearRect(0, 0, cW, cH);
            }

            this.isPainting = true;
            this.lastPaintPt = { x: pos.x, y: pos.y };

            const natTarget = this.containerToNative(pos.x, pos.y);
            const natSource = this.containerToNative(this.sourcePoint.x, this.sourcePoint.y);
            this.paintStrokeOffset = {
                dx: natTarget.x - natSource.x,
                dy: natTarget.y - natSource.y
            };

            this.applyBrushStep(pos.x, pos.y, pos.x, pos.y);
        },

        applyBrushStep: function(x0, y0, x1, y1) {
            if (!this._strokeBufferCanvas || !this._strokeBufferCtx) return;

            const sourceImg = this.getSourceImage();
            if (!sourceImg) return;

            const natTarget0 = this.containerToNative(x0, y0);
            const natTarget1 = this.containerToNative(x1, y1);
            const radiusNat = this.brushSize * natTarget1.scaleRatio * 0.5;

            const featherCanvas = this.ensureFeatherMaskCanvas(radiusNat, this.feather);
            const rEff = featherCanvas._radiusEff || (featherCanvas.width / 2);
            const d = featherCanvas.width;

            const dist = Math.hypot(natTarget1.x - natTarget0.x, natTarget1.y - natTarget0.y);
            // Akıcı ve homojen dabs aralığı: Yumuşaklıkta dabs yığılmasını ve kenar sertleşmesini önler
            const step = Math.max(4, radiusNat * (0.40 + (1 - this.feather) * 0.25));
            const isFirstDab = (dist < 0.001);
            const numSteps = isFirstDab ? 0 : Math.max(1, Math.ceil(dist / step));
            const startI = isFirstDab ? 0 : 1;

            // Yeniden kullanılabilir küçük damga tuvali
            if (!this._stampBufferCanvas) {
                this._stampBufferCanvas = document.createElement('canvas');
            }
            if (this._stampBufferCanvas.width !== d || this._stampBufferCanvas.height !== d) {
                this._stampBufferCanvas.width = d;
                this._stampBufferCanvas.height = d;
            }
            const sCtx = this._stampBufferCanvas.getContext('2d');

            const { cW, cH } = this.getContainerDimensions();
            const rContEff = (this.brushSize * 0.5) * (rEff / radiusNat);
            const dContEff = rContEff * 2;

            for (let i = startI; i <= numSteps; i++) {
                const t = numSteps > 0 ? (i / numSteps) : 0;
                const ntx = natTarget0.x + (natTarget1.x - natTarget0.x) * t;
                const nty = natTarget0.y + (natTarget1.y - natTarget0.y) * t;
                const nsx = ntx - this.paintStrokeOffset.dx;
                const nsy = nty - this.paintStrokeOffset.dy;

                // 1. Damgayı hazırla (Kaynak dokudan kes ve yumuşat)
                sCtx.globalCompositeOperation = 'source-over';
                sCtx.clearRect(0, 0, d, d);
                sCtx.drawImage(sourceImg, nsx - rEff, nsy - rEff, d, d, 0, 0, d, d);

                sCtx.globalCompositeOperation = 'destination-in';
                sCtx.drawImage(featherCanvas, 0, 0);

                // 2. İzole 4K inme tamponuna tam yoğunlukla bas (Opaklık inme sonunda tek seferde uygulanacak)
                this._strokeBufferCtx.drawImage(this._stampBufferCanvas, ntx - rEff, nty - rEff);

                // 3. Ekrana canlı önizleme bas (Hafif ve 60 FPS, CSS opacity ile tek katmanda görünür)
                if (this._liveCtx) {
                    const ctx = (x0 + (x1 - x0) * t) * cW;
                    const cty = (y0 + (y1 - y0) * t) * cH;
                    this._liveCtx.drawImage(this._stampBufferCanvas, ctx - rContEff, cty - rContEff, dContEff, dContEff);
                }
            }
        },

        commitLiveBrush: async function() {
            if (!this._workCanvas || !this._workCtx || !this._strokeBufferCanvas) return;

            // Tek seferde tam inme opasitesi ile 4K ana tuvale bas (Photoshop Mantığı)
            this._workCtx.save();
            this._workCtx.globalAlpha = this.opacity;
            this._workCtx.drawImage(this._strokeBufferCanvas, 0, 0);
            this._workCtx.restore();

            // Tamponu bir sonraki çizim için temizle
            this._strokeBufferCtx.clearRect(0, 0, this._strokeBufferCanvas.width, this._strokeBufferCanvas.height);

            const resultDataUrl = this._workCanvas.toDataURL('image/jpeg', 0.96);

            await new Promise((resolve, reject) => {
                window.updateProjectPhotoPixels(resultDataUrl, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            if (this._liveCanvas && this._liveCtx) {
                this._liveCtx.clearRect(0, 0, this._liveCanvas.width, this._liveCanvas.height);
                this._liveCanvas.style.display = 'none';
            }

            if (typeof window.recordHistoryImmediate === 'function') {
                window.recordHistoryImmediate('Klonlama Fırçası');
            }
        },

        /**
         * ====================================================================
         * 📐 ALAN KLONLAMA & DOKU YAMASI (AREA CLONE & PATCH ENGINE)
         * Desteklenen seçimler: Alan Fırçası, Çokgen, Kement
         * ====================================================================
         */

        hasSelectionArea: function() {
            if (this.mode === 'area_brush') {
                return this.brushStrokes.length > 0;
            } else {
                return this.areaPoints.length >= 3;
            }
        },

        /**
         * Seçim alanının merkezini ve sınır kutusunu (bounding box) hesaplar
         */
        getAreaBounds: function() {
            let minX = 1, minY = 1, maxX = 0, maxY = 0;
            let count = 0;

            if (this.mode === 'area_brush') {
                this.brushStrokes.forEach(stroke => {
                    stroke.forEach(pt => {
                        if (pt.x < minX) minX = pt.x;
                        if (pt.x > maxX) maxX = pt.x;
                        if (pt.y < minY) minY = pt.y;
                        if (pt.y > maxY) maxY = pt.y;
                        count++;
                    });
                });
            } else {
                this.areaPoints.forEach(pt => {
                    if (pt.x < minX) minX = pt.x;
                    if (pt.x > maxX) maxX = pt.x;
                    if (pt.y < minY) minY = pt.y;
                    if (pt.y > maxY) maxY = pt.y;
                    count++;
                });
            }

            if (count === 0) {
                return { minX: 0.4, minY: 0.4, maxX: 0.6, maxY: 0.6, cx: 0.5, cy: 0.5, w: 0.2, h: 0.2 };
            }

            return {
                minX, minY, maxX, maxY,
                cx: (minX + maxX) / 2,
                cy: (minY + maxY) / 2,
                w: maxX - minX,
                h: maxY - minY
            };
        },

        applyAreaClone: async function() {
            if (!this.hasSelectionArea()) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Lütfen önce kapatılacak nesneyi seçin veya boyayın.', 'warning');
                } else {
                    alert('Lütfen önce kapatılacak villayı fırça, çokgen veya kement ile seçin.');
                }
                return;
            }

            if (!this.sourcePoint) {
                alert('Lütfen kopyalanacak temiz doku alanını belirleyin.');
                return;
            }

            const sourceImg = this.getSourceImage();
            if (!sourceImg) return;

            const natW = sourceImg.naturalWidth || sourceImg.width;
            const natH = sourceImg.naturalHeight || sourceImg.height;

            const { cW, cH } = this.getContainerDimensions();
            const rw = (cW > 0) ? cW : 800;

            const bounds = this.getAreaBounds();
            const natCenterTarget = this.containerToNative(bounds.cx, bounds.cy);
            const natSource = this.containerToNative(this.sourcePoint.x, this.sourcePoint.y);

            const offsetDX = natCenterTarget.x - natSource.x;
            const offsetDY = natCenterTarget.y - natSource.y;

            const natScale = Math.max(1, natW / rw);
            const isSharp = (this.feather <= 0.01);

            // Ekranda net hissedilen ve hassas ayarlanabilen yumuşaklık ölçeği (0..90 ekran pikseli)
            const screenFeather = this.feather * 90;
            const featherPx = isSharp ? 0 : Math.max(2, Math.round(screenFeather * natScale));

            // Sınır kutusu kırpma (4K tuvali gereksiz yere baştan sona filtrelemeyi önleyerek aşırı kasmayı yok eder)
            const pad = isSharp ? 4 : Math.ceil(featherPx * 3.5);
            const minX = Math.max(0, Math.floor(bounds.minX * natW) - pad);
            const minY = Math.max(0, Math.floor(bounds.minY * natH) - pad);
            const maxX = Math.min(natW, Math.ceil(bounds.maxX * natW) + pad);
            const maxY = Math.min(natH, Math.ceil(bounds.maxY * natH) + pad);
            const bW = maxX - minX;
            const bH = maxY - minY;

            if (bW <= 0 || bH <= 0) return;

            // 1. Kırpılmış Maske Tuvali (Hafif ve Hızlı)
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = bW;
            maskCanvas.height = bH;
            const mCtx = maskCanvas.getContext('2d');
            mCtx.fillStyle = '#ffffff';
            mCtx.strokeStyle = '#ffffff';

            if (this.mode === 'area_brush') {
                this.brushStrokes.forEach(stroke => {
                    if (stroke.length === 0) return;
                    const rNat = this.brushSize * natCenterTarget.scaleRatio * 0.5;
                    mCtx.lineWidth = rNat * 2;
                    mCtx.lineCap = 'round';
                    mCtx.lineJoin = 'round';

                    if (stroke.length === 1) {
                        const pt = this.containerToNative(stroke[0].x, stroke[0].y);
                        mCtx.beginPath();
                        mCtx.arc(pt.x - minX, pt.y - minY, rNat, 0, Math.PI * 2);
                        mCtx.fill();
                    } else {
                        mCtx.beginPath();
                        const p0 = this.containerToNative(stroke[0].x, stroke[0].y);
                        mCtx.moveTo(p0.x - minX, p0.y - minY);
                        for (let i = 1; i < stroke.length; i++) {
                            const pi = this.containerToNative(stroke[i].x, stroke[i].y);
                            mCtx.lineTo(pi.x - minX, pi.y - minY);
                        }
                        mCtx.stroke();
                    }
                });
            } else {
                const natPoints = this.areaPoints.map(p => this.containerToNative(p.x, p.y));
                if (natPoints.length >= 3) {
                    mCtx.beginPath();
                    mCtx.moveTo(natPoints[0].x - minX, natPoints[0].y - minY);
                    for (let i = 1; i < natPoints.length; i++) {
                        mCtx.lineTo(natPoints[i].x - minX, natPoints[i].y - minY);
                    }
                    mCtx.closePath();
                    mCtx.fill();
                }
            }

            // 2. Kenar Yumuşatma (Feather): Doğal, pürüzsüz ve kadifemsi gradyan geçişi
            let finalMaskCanvas = maskCanvas;
            if (!isSharp) {
                const blurMaskCanvas = document.createElement('canvas');
                blurMaskCanvas.width = bW;
                blurMaskCanvas.height = bH;
                const bmCtx = blurMaskCanvas.getContext('2d');

                // Gerçek Gaussian yumuşatma ile kenarlarda kadifemsi geçiş
                bmCtx.filter = `blur(${featherPx}px)`;
                bmCtx.drawImage(maskCanvas, 0, 0);

                finalMaskCanvas = blurMaskCanvas;
            }

            // 3. Klon Tuvali (Kaydırılmış kaynak doku)
            const cloneCanvas = document.createElement('canvas');
            cloneCanvas.width = bW;
            cloneCanvas.height = bH;
            const cCtx = cloneCanvas.getContext('2d');

            const srcCropX = minX - offsetDX;
            const srcCropY = minY - offsetDY;
            cCtx.drawImage(sourceImg, srcCropX, srcCropY, bW, bH, 0, 0, bW, bH);
            cCtx.globalCompositeOperation = 'destination-in';
            cCtx.drawImage(finalMaskCanvas, 0, 0);

            // 4. Ana Görselle Birleştir
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = natW;
            finalCanvas.height = natH;
            const fCtx = finalCanvas.getContext('2d');
            fCtx.drawImage(sourceImg, 0, 0, natW, natH);

            fCtx.globalAlpha = this.opacity;
            fCtx.drawImage(cloneCanvas, minX, minY);

            const resultDataUrl = finalCanvas.toDataURL('image/jpeg', 0.96);

            await new Promise((resolve, reject) => {
                window.updateProjectPhotoPixels(resultDataUrl, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            this.areaPoints = [];
            this.brushStrokes = [];
            this.currentBrushStroke = null;
            this.isAreaClosed = false;
            this.renderSvg();

            if (typeof window.recordHistoryImmediate === 'function') {
                window.recordHistoryImmediate('Alan Klonlama');
            }

            if (typeof window.showAppToast === 'function') {
                window.showAppToast('Alan temiz dokuyla başarıyla kapatıldı.', 'success');
            }
        },

        clearAreaDrawing: function() {
            this.areaPoints = [];
            this.brushStrokes = [];
            this.currentBrushStroke = null;
            this.isAreaClosed = false;
            this.renderSvg();
        },

        /**
         * ====================================================================
         * 🖱️ TUVAL ETKİLEŞİMİ (MOUSE & TOUCH EVENTS)
         * ====================================================================
         */
        bindEvents: function() {
            if (!this.svgEl) this.svgEl = document.getElementById('maskInteractiveSvg');
            if (!this.svgEl) return;

            this.onPointerDown = (e) => this.handlePointerDown(e);
            this.onPointerMove = (e) => this.handlePointerMove(e);
            this.onPointerUp = (e) => this.handlePointerUp(e);

            this.svgEl.addEventListener('mousedown', this.onPointerDown);
            this.svgEl.addEventListener('touchstart', this.onPointerDown, { passive: false });

            // Tuvalde fare gezdirme (Hover)
            this.svgEl.addEventListener('mousemove', (e) => {
                if (!this.isActive) return;
                this.lastHoverPos = this.getNormalizedCoords(e);
                if (!this.isPainting && !this.isDrawingAreaBrush && !this.isDraggingSourcePin && !this.isDraggingSourceArea) {
                    this.requestSvgRender();
                }
            });

            this.svgEl.addEventListener('mouseleave', () => {
                if (!this.isActive) return;
                this.lastHoverPos = null;
                this.requestSvgRender();
            });

            // Çift tıklama: Çokgeni anında kapat
            this.svgEl.addEventListener('dblclick', (e) => {
                if (!this.isActive || this.mode !== 'polygon') return;
                e.preventDefault();
                e.stopPropagation();
                if (this.areaPoints.length >= 3) {
                    this.isAreaClosed = true;
                    this.renderSvg();
                }
            });

            // Tekerlek ile damga/fırça boyutu (Normal) ve Yumuşaklık (Shift + Tekerlek)
            this.svgEl.addEventListener('wheel', (e) => {
                if (!this.isActive || e.ctrlKey) return;
                e.preventDefault();
                if (e.shiftKey) {
                    const deltaF = e.deltaY < 0 ? 0.05 : -0.05;
                    this.setFeather(this.feather + deltaF);
                    return;
                }
                const delta = e.deltaY < 0 ? 5 : -5;
                this.setSize(this.brushSize + delta);
            }, { passive: false });

            // Kısayollar
            window.addEventListener('keydown', (e) => {
                if (!this.isActive) return;
                if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

                if (e.key === 'Alt') {
                    this.isPickingSource = true;
                    this.updateSourceStatusUI();
                    this.renderSvg();
                } else if (e.key === 'Escape') {
                    if (this.hasSelectionArea()) this.clearAreaDrawing();
                } else if (e.key === 'Enter') {
                    if (this.hasSelectionArea()) {
                        this.applyAreaClone();
                    }
                } else if ((e.key === '[' || e.key === 'bracketleft') && e.shiftKey) {
                    e.preventDefault();
                    this.setFeather(this.feather - 0.05);
                } else if ((e.key === ']' || e.key === 'bracketright') && e.shiftKey) {
                    e.preventDefault();
                    this.setFeather(this.feather + 0.05);
                } else if (e.key === '[' || e.key === 'bracketleft') {
                    e.preventDefault();
                    this.setSize(this.brushSize - 5);
                } else if (e.key === ']' || e.key === 'bracketright') {
                    e.preventDefault();
                    this.setSize(this.brushSize + 5);
                }
            });

            window.addEventListener('keyup', (e) => {
                if (!this.isActive) return;
                if (e.key === 'Alt') {
                    this.isPickingSource = false;
                    this.updateSourceStatusUI();
                    this.renderSvg();
                }
            });

            window.addEventListener('resize', () => {
                if (this.isActive) {
                    this.invalidateRectCache();
                    this.requestSvgRender();
                }
            });
        },

        handlePointerDown: function(e) {
            if (!this.isActive) return;
            if (e.button !== undefined && e.button !== 0) return;
            if (window.spaceBarPressed) return; // Space basılıyken pan yapılır, çizim yapılmaz!

            this.invalidateRectCache();
            this._activeTransform = this.getTransformInfo();

            const pos = this.getNormalizedCoords(e);
            const { cW, cH } = this.getContainerDimensions();

            window.addEventListener('mousemove', this.onPointerMove);
            window.addEventListener('mouseup', this.onPointerUp);
            window.addEventListener('touchmove', this.onPointerMove, { passive: false });
            window.addEventListener('touchend', this.onPointerUp);

            // 1. Kaynak Belirleme Tıklaması
            if (this.isPickingSource || !this.sourcePoint) {
                if (e.stopPropagation) e.stopPropagation();
                if (e.preventDefault) e.preventDefault();
                this.sourcePoint = { x: pos.x, y: pos.y };
                this.isPickingSource = false;
                this.updateSourceStatusUI();
                this.renderSvg();
                return;
            }

            // 2. Kaynak Pini veya Kaynak Alanı Sürükleme Tıklaması
            if (this.sourcePoint) {
                const distPin = Math.hypot((pos.x - this.sourcePoint.x) * cW, (pos.y - this.sourcePoint.y) * cH);
                if (distPin < 35) {
                    if (e.stopPropagation) e.stopPropagation();
                    if (e.preventDefault) e.preventDefault();
                    this.isDraggingSourcePin = true;
                    return;
                }

                // Yeşil kaynak çerçevesi üzerinden sürükleme
                if (this.hasSelectionArea()) {
                    const bounds = this.getAreaBounds();
                    const offX = this.sourcePoint.x - bounds.cx;
                    const offY = this.sourcePoint.y - bounds.cy;
                    const sMinX = bounds.minX + offX;
                    const sMaxX = bounds.maxX + offX;
                    const sMinY = bounds.minY + offY;
                    const sMaxY = bounds.maxY + offY;

                    if (pos.x >= sMinX - 0.03 && pos.x <= sMaxX + 0.03 && pos.y >= sMinY - 0.03 && pos.y <= sMaxY + 0.03) {
                        if (e.stopPropagation) e.stopPropagation();
                        if (e.preventDefault) e.preventDefault();
                        this.isDraggingSourceArea = true;
                        this.dragSourceAreaOffset = {
                            dx: pos.x - this.sourcePoint.x,
                            dy: pos.y - this.sourcePoint.y
                        };
                        return;
                    }
                }
            }

            // 3. Alan Fırçası Modu (Area Brush):
            if (this.mode === 'area_brush') {
                if (e.stopPropagation) e.stopPropagation();
                if (e.preventDefault) e.preventDefault();
                this.isDrawingAreaBrush = true;
                this.currentBrushStroke = [{ x: pos.x, y: pos.y }];
                this.brushStrokes.push(this.currentBrushStroke);
                this.renderSvg();
                return;
            }

            // 4. Çokgen Seçim Modu (Polygon):
            if (this.mode === 'polygon') {
                if (e.stopPropagation) e.stopPropagation();
                if (e.preventDefault) e.preventDefault();

                // 3 veya daha fazla nokta varsa ve ilk noktaya yakın tıklandıysa kapat
                if (this.areaPoints.length >= 3) {
                    const pt0 = this.areaPoints[0];
                    const dist0 = Math.hypot((pos.x - pt0.x) * cW, (pos.y - pt0.y) * cH);
                    if (dist0 < 25) {
                        this.isAreaClosed = true;
                        this.renderSvg();
                        return;
                    }
                }

                if (this.isAreaClosed) {
                    // Kapalıysa yeni çizime başla
                    this.areaPoints = [{ x: pos.x, y: pos.y }];
                    this.isAreaClosed = false;
                } else {
                    this.areaPoints.push({ x: pos.x, y: pos.y });
                }
                this.renderSvg();
                return;
            }

            // 5. Serbest Kement Modu (Lasso):
            if (this.mode === 'lasso') {
                if (e.stopPropagation) e.stopPropagation();
                if (e.preventDefault) e.preventDefault();
                this.isDrawingLasso = true;
                this.isAreaClosed = false;
                this.areaPoints = [{ x: pos.x, y: pos.y }];
                this.renderSvg();
                return;
            }

            // 6. Canlı Fırça Modu (60 FPS Hardware-Accelerated):
            if (this.mode === 'brush') {
                if (e.stopPropagation) e.stopPropagation();
                if (e.preventDefault) e.preventDefault();
                if (!this.sourcePoint) {
                    alert('Lütfen önce bir kaynak nokta belirleyin.');
                    return;
                }
                this.startLiveBrush(pos);
            }
        },

        handlePointerMove: function(e) {
            if (!this.isActive) return;
            const pos = this.getNormalizedCoords(e);
            this.lastHoverPos = pos;
            const { cW, cH } = this.getContainerDimensions();

            // Kaynak Pini veya Alanı Sürükleme
            if (this.isDraggingSourcePin) {
                if (e.preventDefault) e.preventDefault();
                this.sourcePoint = { x: pos.x, y: pos.y };
                this.updateSourceStatusUI();
                this.requestSvgRender();
                return;
            }

            if (this.isDraggingSourceArea && this.dragSourceAreaOffset) {
                if (e.preventDefault) e.preventDefault();
                this.sourcePoint = {
                    x: Math.max(0.02, Math.min(0.98, pos.x - this.dragSourceAreaOffset.dx)),
                    y: Math.max(0.02, Math.min(0.98, pos.y - this.dragSourceAreaOffset.dy))
                };
                this.updateSourceStatusUI();
                this.requestSvgRender();
                return;
            }

            // Alan Fırçası ile Boyama
            if (this.isDrawingAreaBrush && this.currentBrushStroke) {
                if (e.preventDefault) e.preventDefault();
                const lastPt = this.currentBrushStroke[this.currentBrushStroke.length - 1];
                if (!lastPt || Math.hypot((pos.x - lastPt.x) * cW, (pos.y - lastPt.y) * cH) > 6) {
                    this.currentBrushStroke.push({ x: pos.x, y: pos.y });
                    this.requestSvgRender();
                }
                return;
            }

            // Kement Çizimi
            if (this.isDrawingLasso && this.mode === 'lasso') {
                if (e.preventDefault) e.preventDefault();
                const lastPt = this.areaPoints[this.areaPoints.length - 1];
                if (!lastPt || Math.hypot((pos.x - lastPt.x) * cW, (pos.y - lastPt.y) * cH) > 6) {
                    this.areaPoints.push({ x: pos.x, y: pos.y });
                    this.requestSvgRender();
                }
                return;
            }

            // Canlı Fırça Hareketi (Süper akıcı, sıfır kasma)
            if (this.isPainting && this.lastPaintPt && this.mode === 'brush') {
                if (e.preventDefault) e.preventDefault();
                this.applyBrushStep(this.lastPaintPt.x, this.lastPaintPt.y, pos.x, pos.y);
                this.lastPaintPt = { x: pos.x, y: pos.y };

                if (this.aligned && this.sourcePoint) {
                    const natTarget1 = this.containerToNative(pos.x, pos.y);
                    const natCurrentSource = {
                        x: natTarget1.x - this.paintStrokeOffset.dx,
                        y: natTarget1.y - this.paintStrokeOffset.dy
                    };
                    const containerSource = this.nativeToContainer(natCurrentSource.x, natCurrentSource.y);
                    this.sourcePoint = { x: containerSource.normX, y: containerSource.normY };
                    this.requestSvgRender();
                }
                return;
            }

            // Boşta hover gezinmesi
            if (this.mode === 'polygon' && this.areaPoints.length > 0 && !this.isAreaClosed) {
                this.requestSvgRender();
            }
        },

        handlePointerUp: function() {
            window.removeEventListener('mousemove', this.onPointerMove);
            window.removeEventListener('mouseup', this.onPointerUp);
            window.removeEventListener('touchmove', this.onPointerMove);
            window.removeEventListener('touchend', this.onPointerUp);

            if (this.isPainting && this.mode === 'brush') {
                this.isPainting = false;
                this.lastPaintPt = null;
                this.commitLiveBrush();
            }

            if (this.isDraggingSourcePin) {
                this.isDraggingSourcePin = false;
            }

            if (this.isDraggingSourceArea) {
                this.isDraggingSourceArea = false;
                this.dragSourceAreaOffset = null;
            }

            if (this.isDrawingAreaBrush) {
                this.isDrawingAreaBrush = false;
                this.currentBrushStroke = null;
                this.isAreaClosed = true;
            }

            if (this.isDrawingLasso && this.mode === 'lasso') {
                this.isDrawingLasso = false;
                if (this.areaPoints.length >= 3) {
                    this.isAreaClosed = true;
                }
            }

            this._activeTransform = null;
            this.renderSvg();
        },

        /**
         * ====================================================================
         * 🎨 SVG ÇİZİCİ (0..1000 VIEWBOX & ÇİFT ŞABLON ÖNİZLEMESİ)
         * ====================================================================
         */
        renderSvg: function() {
            if (!this.svgEl) this.svgEl = document.getElementById('maskInteractiveSvg');
            if (!this.svgEl || !this.isActive) return;

            const { cW, cH } = this.getContainerDimensions();
            const rw = (cW > 0) ? cW : 800;
            const rh = (cH > 0) ? cH : 600;

            const rx = (this.brushSize * 0.5 / rw) * 1000;
            const ry = (this.brushSize * 0.5 / rh) * 1000;
            const rEffRatio = (this.feather > 0.01) ? (1 + this.feather * 0.45) : 1;
            const outerRx = rx * rEffRatio;
            const outerRy = ry * rEffRatio;
            const innerRx = Math.max(0, outerRx * Math.pow(Math.max(0, 1 - this.feather * 1.25), 2));
            const innerRy = Math.max(0, outerRy * Math.pow(Math.max(0, 1 - this.feather * 1.25), 2));
            const haloW = Math.min(36, Math.max(2, this.feather * 30));

            const targetFillAlpha = (0.08 + this.opacity * 0.32).toFixed(2);
            const sourceFillAlpha = (0.08 + this.opacity * 0.28).toFixed(2);
            const brushHoverFillAlpha = (0.04 + this.opacity * 0.20).toFixed(2);

            let html = '';

            // 1. KAYNAK GÖSTERGESİ (Kaynak Pin - Kaynak seçme modundayken gizlenir)
            if (this.sourcePoint && !this.isPickingSource) {
                const sx = this.sourcePoint.x * 1000;
                const sy = this.sourcePoint.y * 1000;
                const isDraggingThis = this.isDraggingSourcePin;

                html += `<g class="clone-source-marker" cursor="${isDraggingThis ? 'grabbing' : 'grab'}" style="cursor:${isDraggingThis ? 'grabbing' : 'grab'}; pointer-events:all;">`;

                // Yumuşaklık (Feather) Dış Kılavuz Halkası
                if (this.feather > 0.01 && (this.mode === 'brush' || this.mode === 'area_brush')) {
                    html += `<ellipse cx="${sx}" cy="${sy}" rx="${outerRx}" ry="${outerRy}" fill="none" stroke="rgba(16, 185, 129, 0.35)" stroke-width="1.2" stroke-dasharray="3,3" vector-effect="non-scaling-stroke" />`;
                }

                // Ana Kaynak Halkası (Zarif, saydam iç dolgu)
                html += `<ellipse cx="${sx}" cy="${sy}" rx="${rx}" ry="${ry}" fill="rgba(16, 185, 129, 0.04)" stroke="rgba(0,0,0,0.55)" stroke-width="2.2" vector-effect="non-scaling-stroke" />`;
                html += `<ellipse cx="${sx}" cy="${sy}" rx="${rx}" ry="${ry}" fill="none" stroke="#10b981" stroke-width="1.4" stroke-dasharray="4,3" vector-effect="non-scaling-stroke" />`;

                // İç Yumuşaklık Halkası
                if (this.feather > 0.01 && innerRx > 2 && innerRy > 2 && (this.mode === 'brush' || this.mode === 'area_brush')) {
                    html += `<ellipse cx="${sx}" cy="${sy}" rx="${innerRx}" ry="${innerRy}" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="1.6" stroke-dasharray="3,3" vector-effect="non-scaling-stroke" />`;
                    html += `<ellipse cx="${sx}" cy="${sy}" rx="${innerRx}" ry="${innerRy}" fill="none" stroke="#ffffff" stroke-width="0.9" stroke-dasharray="3,3" vector-effect="non-scaling-stroke" />`;
                }

                // 4 Kardinal Vizör Çentiği (Viewfinder Cardinal Marks)
                html += `<line x1="${sx - rx}" y1="${sy}" x2="${sx - rx + 4}" y2="${sy}" stroke="#10b981" stroke-width="1.6" vector-effect="non-scaling-stroke" />`;
                html += `<line x1="${sx + rx - 4}" y1="${sy}" x2="${sx + rx}" y2="${sy}" stroke="#10b981" stroke-width="1.6" vector-effect="non-scaling-stroke" />`;
                html += `<line x1="${sx}" y1="${sy - ry}" x2="${sx}" y2="${sy - ry + 4}" stroke="#10b981" stroke-width="1.6" vector-effect="non-scaling-stroke" />`;
                html += `<line x1="${sx}" y1="${sy + ry - 4}" x2="${sx}" y2="${sy + ry}" stroke="#10b981" stroke-width="1.6" vector-effect="non-scaling-stroke" />`;

                // Photoshop Tarzı Hassas Mikro Artı (+) (Merkezi tamamen açık, 1px yüksek kontrast)
                html += `<line x1="${sx - 7}" y1="${sy}" x2="${sx - 2.5}" y2="${sy}" stroke="rgba(0,0,0,0.75)" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                html += `<line x1="${sx - 7}" y1="${sy}" x2="${sx - 2.5}" y2="${sy}" stroke="#10b981" stroke-width="1.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                html += `<line x1="${sx + 2.5}" y1="${sy}" x2="${sx + 7}" y2="${sy}" stroke="rgba(0,0,0,0.75)" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                html += `<line x1="${sx + 2.5}" y1="${sy}" x2="${sx + 7}" y2="${sy}" stroke="#10b981" stroke-width="1.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                html += `<line x1="${sx}" y1="${sy - 7}" x2="${sx}" y2="${sy - 2.5}" stroke="rgba(0,0,0,0.75)" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                html += `<line x1="${sx}" y1="${sy - 7}" x2="${sx}" y2="${sy - 2.5}" stroke="#10b981" stroke-width="1.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                html += `<line x1="${sx}" y1="${sy + 2.5}" x2="${sx}" y2="${sy + 7}" stroke="rgba(0,0,0,0.75)" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                html += `<line x1="${sx}" y1="${sy + 2.5}" x2="${sx}" y2="${sy + 7}" stroke="#10b981" stroke-width="1.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;

                // Zarif Yarı Saydam Kapsül Rozet (Dolgulu kutu ve emoji kaldırıldı)
                const badgeY = sy - ry - 20;
                html += `<g transform="translate(${sx}, ${badgeY})" pointer-events="none">`;
                html += `<rect x="-32" y="0" width="64" height="18" rx="9" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1" />`;
                html += `<circle cx="-20" cy="9" r="3" fill="#10b981" />`;
                html += `<text x="4" y="12.5" text-anchor="middle" fill="#f8fafc" font-size="9.5" font-weight="600" letter-spacing="0.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">KAYNAK</text>`;
                html += `</g>`;

                html += `</g>`;
            }

            // 2. ALAN FIRÇASI SEÇİMİ (Mavi Hedef Vurgusu ↔ Yeşil Kaynak Vurgusu)
            if (this.mode === 'area_brush' && this.brushStrokes.length > 0) {
                const strokeW = rx * 2;
                const bounds = this.getAreaBounds();
                const offX = this.sourcePoint ? (this.sourcePoint.x - bounds.cx) * 1000 : 0;
                const offY = this.sourcePoint ? (this.sourcePoint.y - bounds.cy) * 1000 : 0;

                // A. Mavi Hedef Çizimleri (Villanın üzeri)
                html += `<g pointer-events="none" stroke-linecap="round" stroke-linejoin="round">`;
                if (this.feather > 0.01) {
                    this.brushStrokes.forEach(stroke => {
                        if (stroke.length === 0) return;
                        if (stroke.length === 1) {
                            html += `<circle cx="${stroke[0].x * 1000}" cy="${stroke[0].y * 1000}" r="${rx + haloW * 0.5}" fill="rgba(14, 165, 233, 0.20)" />`;
                        } else {
                            let pathD = 'M ' + (stroke[0].x * 1000) + ' ' + (stroke[0].y * 1000);
                            for (let i = 1; i < stroke.length; i++) pathD += ' L ' + (stroke[i].x * 1000) + ' ' + (stroke[i].y * 1000);
                            html += `<path d="${pathD}" fill="none" stroke="rgba(14, 165, 233, 0.20)" stroke-width="${strokeW + haloW}" />`;
                        }
                    });
                }
                this.brushStrokes.forEach(stroke => {
                    if (stroke.length === 0) return;
                    if (stroke.length === 1) {
                        html += `<circle cx="${stroke[0].x * 1000}" cy="${stroke[0].y * 1000}" r="${rx}" fill="rgba(14, 165, 233, ${targetFillAlpha})" />`;
                    } else {
                        let pathD = 'M ' + (stroke[0].x * 1000) + ' ' + (stroke[0].y * 1000);
                        for (let i = 1; i < stroke.length; i++) {
                            pathD += ' L ' + (stroke[i].x * 1000) + ' ' + (stroke[i].y * 1000);
                        }
                        html += `<path d="${pathD}" fill="none" stroke="rgba(14, 165, 233, ${targetFillAlpha})" stroke-width="${strokeW}" />`;
                        html += `<path d="${pathD}" fill="none" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="4,3" />`;
                    }
                });
                html += `</g>`;

                // B. Yeşil Kaynak Çizimleri (Kopyalanacak Temiz Doku Alanı - Sürüklenebilir)
                if (this.sourcePoint && !this.isDrawingAreaBrush) {
                    html += `<g cursor="move" style="cursor:move; pointer-events:all;" stroke-linecap="round" stroke-linejoin="round">`;
                    if (this.feather > 0.01) {
                        this.brushStrokes.forEach(stroke => {
                            if (stroke.length === 0) return;
                            if (stroke.length === 1) {
                                html += `<circle cx="${stroke[0].x * 1000 + offX}" cy="${stroke[0].y * 1000 + offY}" r="${rx + haloW * 0.5}" fill="rgba(16, 185, 129, 0.20)" />`;
                            } else {
                                let pathD = 'M ' + (stroke[0].x * 1000 + offX) + ' ' + (stroke[0].y * 1000 + offY);
                                for (let i = 1; i < stroke.length; i++) pathD += ' L ' + (stroke[i].x * 1000 + offX) + ' ' + (stroke[i].y * 1000 + offY);
                                html += `<path d="${pathD}" fill="none" stroke="rgba(16, 185, 129, 0.20)" stroke-width="${strokeW + haloW}" />`;
                            }
                        });
                    }
                    this.brushStrokes.forEach(stroke => {
                        if (stroke.length === 0) return;
                        if (stroke.length === 1) {
                            html += `<circle cx="${stroke[0].x * 1000 + offX}" cy="${stroke[0].y * 1000 + offY}" r="${rx}" fill="rgba(16, 185, 129, ${sourceFillAlpha})" stroke="#10b981" stroke-width="1.8" stroke-dasharray="4,3" />`;
                        } else {
                            let pathD = 'M ' + (stroke[0].x * 1000 + offX) + ' ' + (stroke[0].y * 1000 + offY);
                            for (let i = 1; i < stroke.length; i++) {
                                pathD += ' L ' + (stroke[i].x * 1000 + offX) + ' ' + (stroke[i].y * 1000 + offY);
                            }
                            html += `<path d="${pathD}" fill="none" stroke="rgba(16, 185, 129, ${sourceFillAlpha})" stroke-width="${strokeW}" />`;
                            html += `<path d="${pathD}" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="5,3" />`;
                        }
                    });

                    // Başlık etiketi (Saydam Kapsül)
                    const tagY = Math.max(20, (bounds.minY * 1000 + offY) - 10);
                    html += `<g transform="translate(${this.sourcePoint.x * 1000}, ${tagY})" pointer-events="none">`;
                    html += `<rect x="-70" y="-12" width="140" height="20" rx="10" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(16, 185, 129, 0.5)" stroke-width="1" />`;
                    html += `<circle cx="-56" cy="-2" r="3" fill="#10b981" />`;
                    html += `<text x="4" y="2" text-anchor="middle" fill="#f8fafc" font-size="10" font-weight="600" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">Kaynak Doku Alanı</text>`;
                    html += `</g>`;
                    html += `</g>`;
                }
            }

            // 3. ÇOKGEN & KEMENT SEÇİM ALANI (MAVİ HEDEF & YEŞİL KAYNAK)
            if ((this.mode === 'polygon' || this.mode === 'lasso') && this.areaPoints.length > 0) {
                const isClosed = this.isAreaClosed;
                let targetPathD = 'M ' + (this.areaPoints[0].x * 1000) + ' ' + (this.areaPoints[0].y * 1000);
                for (let i = 1; i < this.areaPoints.length; i++) {
                    targetPathD += ' L ' + (this.areaPoints[i].x * 1000) + ' ' + (this.areaPoints[i].y * 1000);
                }
                if (!isClosed && this.lastHoverPos && this.mode === 'polygon') {
                    targetPathD += ' L ' + (this.lastHoverPos.x * 1000) + ' ' + (this.lastHoverPos.y * 1000);
                } else if (isClosed) {
                    targetPathD += ' Z';
                }

                // A. Mavi Hedef Alanı (Kapatılacak Villa)
                html += `<g pointer-events="none">`;
                if (isClosed && this.feather > 0.01) {
                    html += `<path d="${targetPathD}" fill="none" stroke="rgba(14, 165, 233, 0.28)" stroke-width="${haloW}" stroke-linejoin="round" vector-effect="non-scaling-stroke" />`;
                }
                html += `<path d="${targetPathD}" fill="rgba(14, 165, 233, ${targetFillAlpha})" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="${this.feather <= 0.01 ? 'none' : '5,3'}" vector-effect="non-scaling-stroke" />`;

                // Köşe Noktaları (Çokgen modu için)
                if (this.mode === 'polygon') {
                    for (let i = 0; i < this.areaPoints.length; i++) {
                        const pt = this.areaPoints[i];
                        const px = pt.x * 1000;
                        const py = pt.y * 1000;
                        const isFirst = (i === 0);

                        let isClosing = false;
                        if (isFirst && !isClosed && this.lastHoverPos && this.areaPoints.length >= 3) {
                            const distPx = Math.hypot((this.lastHoverPos.x - pt.x) * rw, (this.lastHoverPos.y - pt.y) * rh);
                            if (distPx < 25) isClosing = true;
                        }

                        if (isClosing) {
                            html += `<circle cx="${px}" cy="${py}" r="8" fill="#f59e0b" stroke="#ffffff" stroke-width="2" />`;
                            html += `<rect x="${px + 12}" y="${py - 9}" width="46" height="18" rx="4" fill="#f59e0b" />`;
                            html += `<text x="${px + 35}" y="${py + 3.5}" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="600" font-family="sans-serif">Kapat</text>`;
                        } else if (isFirst) {
                            html += `<circle cx="${px}" cy="${py}" r="5.5" fill="#10b981" stroke="#ffffff" stroke-width="1.8" />`;
                        } else {
                            html += `<circle cx="${px}" cy="${py}" r="4" fill="#ffffff" stroke="#0ea5e9" stroke-width="1.8" />`;
                        }
                    }
                }
                html += `</g>`;

                // B. Eşzamanlı Yeşil Kaynak Çerçevesi (Temiz Doku Alanı - Sürüklenebilir)
                if (isClosed && this.sourcePoint) {
                    const bounds = this.getAreaBounds();
                    const offX = (this.sourcePoint.x - bounds.cx) * 1000;
                    const offY = (this.sourcePoint.y - bounds.cy) * 1000;

                    let sourcePathD = 'M ' + (this.areaPoints[0].x * 1000 + offX) + ' ' + (this.areaPoints[0].y * 1000 + offY);
                    for (let i = 1; i < this.areaPoints.length; i++) {
                        sourcePathD += ' L ' + (this.areaPoints[i].x * 1000 + offX) + ' ' + (this.areaPoints[i].y * 1000 + offY);
                    }
                    sourcePathD += ' Z';

                    html += `<g cursor="move" style="cursor:move; pointer-events:all;">`;
                    if (this.feather > 0.01) {
                        html += `<path d="${sourcePathD}" fill="none" stroke="rgba(16, 185, 129, 0.28)" stroke-width="${haloW}" stroke-linejoin="round" vector-effect="non-scaling-stroke" />`;
                    }
                    html += `<path d="${sourcePathD}" fill="rgba(16, 185, 129, ${sourceFillAlpha})" stroke="#10b981" stroke-width="2.2" stroke-dasharray="${this.feather <= 0.01 ? 'none' : '6,4'}" vector-effect="non-scaling-stroke" />`;

                    // Rozet (Saydam Kapsül)
                    const tagY = Math.max(20, (bounds.minY * 1000 + offY) - 10);
                    html += `<g transform="translate(${this.sourcePoint.x * 1000}, ${tagY})" pointer-events="none">`;
                    html += `<rect x="-70" y="-12" width="140" height="20" rx="10" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(16, 185, 129, 0.5)" stroke-width="1" />`;
                    html += `<circle cx="-56" cy="-2" r="3" fill="#10b981" />`;
                    html += `<text x="4" y="2" text-anchor="middle" fill="#f8fafc" font-size="10" font-weight="600" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">Kaynak Doku Alanı</text>`;
                    html += `</g>`;
                    html += `</g>`;
                }
            }

            // 4. FARE HOVER İŞARETÇİSİ (Ok veya Fırça Çemberi - Space basılıyken gizlenir)
            if (this.lastHoverPos && !window.spaceBarPressed) {
                const cx = this.lastHoverPos.x * 1000;
                const cy = this.lastHoverPos.y * 1000;

                // Kaynak pini yakını kontrolü (Kaynak konumlandırılırken fırça imleci gizlenir)
                let isNearSourcePin = false;
                if (this.sourcePoint && !this.isPickingSource) {
                    const distPin = Math.hypot((this.lastHoverPos.x - this.sourcePoint.x) * rw, (this.lastHoverPos.y - this.sourcePoint.y) * rh);
                    if (distPin < Math.max(35, (this.brushSize || 40) * 0.75) || this.isDraggingSourcePin) {
                        isNearSourcePin = true;
                    }
                }

                html += `<g pointer-events="none">`;

                if (this.isPickingSource) {
                    // Kaynak Seçme Modunda Zarif Vizör & Şeffaf Kapsül Rozet (Dolgulu DEĞİL - Kullanıcı Kuralı)
                    html += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(16, 185, 129, 0.04)" stroke="rgba(0, 0, 0, 0.55)" stroke-width="2" vector-effect="non-scaling-stroke" />`;
                    html += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#10b981" stroke-width="1.4" stroke-dasharray="4,3" vector-effect="non-scaling-stroke" />`;

                    // Kardinal vizör çentikleri
                    html += `<line x1="${cx - rx}" y1="${cy}" x2="${cx - rx + 4}" y2="${cy}" stroke="#10b981" stroke-width="1.5" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx + rx - 4}" y1="${cy}" x2="${cx + rx}" y2="${cy}" stroke="#10b981" stroke-width="1.5" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx}" y1="${cy - ry}" x2="${cx}" y2="${cy - ry + 4}" stroke="#10b981" stroke-width="1.5" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx}" y1="${cy + ry - 4}" x2="${cx}" y2="${cy + ry}" stroke="#10b981" stroke-width="1.5" vector-effect="non-scaling-stroke" />`;

                    // Hassas açık mikro artı (+)
                    html += `<line x1="${cx - 7}" y1="${cy}" x2="${cx - 2.5}" y2="${cy}" stroke="rgba(0,0,0,0.75)" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx - 7}" y1="${cy}" x2="${cx - 2.5}" y2="${cy}" stroke="#10b981" stroke-width="1.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx + 2.5}" y1="${cy}" x2="${cx + 7}" y2="${cy}" stroke="rgba(0,0,0,0.75)" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx + 2.5}" y1="${cy}" x2="${cx + 7}" y2="${cy}" stroke="#10b981" stroke-width="1.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx}" y1="${cy - 7}" x2="${cx}" y2="${cy - 2.5}" stroke="rgba(0,0,0,0.75)" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx}" y1="${cy - 7}" x2="${cx}" y2="${cy - 2.5}" stroke="#10b981" stroke-width="1.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx}" y1="${cy + 2.5}" x2="${cx}" y2="${cy + 7}" stroke="rgba(0,0,0,0.75)" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx}" y1="${cy + 2.5}" x2="${cx}" y2="${cy + 7}" stroke="#10b981" stroke-width="1.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;

                    // Şeffaf Cam Kapsül Rozet (Dolgulu DEĞİL, şık ve okunabilir)
                    const badgeY = cy - ry - 20;
                    html += `<g transform="translate(${cx}, ${badgeY})">`;
                    html += `<rect x="-44" y="0" width="88" height="18" rx="9" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1" />`;
                    html += `<circle cx="-28" cy="9" r="3" fill="#10b981" />`;
                    html += `<text x="7" y="12.5" text-anchor="middle" fill="#f8fafc" font-size="9.5" font-weight="600" letter-spacing="0.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">KAYNAK SEÇ</text>`;
                    html += `</g>`;

                } else if (isNearSourcePin) {
                    // Kaynak pininin üzerindeyken veya taşırken mavi fırça GİZLENİR (Görüş alanını kapatmaz)
                    // Boş bırakılır, böylece sadece kaynak pini temizce görünür ve sürüklenebilir.

                } else if (this.mode === 'polygon') {
                    // Çokgen Modunda Hassas Ok & Köşe İpucu
                    html += `<path d="M ${cx + 1} ${cy + 1} L ${cx + 1} ${cy + 18} L ${cx + 5.2} ${cy + 14.2} L ${cx + 8.5} ${cy + 21} L ${cx + 10.8} ${cy + 20} L ${cx + 7.6} ${cy + 13.2} L ${cx + 13} ${cy + 13.2} Z" fill="rgba(0, 0, 0, 0.45)" />`;
                    html += `<path d="M ${cx} ${cy} L ${cx} ${cy + 17} L ${cx + 4.2} ${cy + 13.2} L ${cx + 7.5} ${cy + 20} L ${cx + 9.8} ${cy + 19} L ${cx + 6.6} ${cy + 12.2} L ${cx + 12} ${cy + 12.2} Z" fill="#ffffff" stroke="#0f172a" stroke-width="1.3" stroke-linejoin="round" />`;
                    html += `<circle cx="${cx}" cy="${cy}" r="2.5" fill="#8b5cf6" stroke="#ffffff" stroke-width="1" />`;

                    // Çokgen Köşe Bilgilendirme Rozeti
                    if (!this.isAreaClosed && this.areaPoints.length > 0) {
                        const count = this.areaPoints.length;
                        const hintText = count === 1 ? '1. Köşe — 2. Köşeye Tıklayın' : (count === 2 ? '2. Köşe — 3. Köşeye Tıklayın' : `${count}. Köşe — Kapatmak İçin Çift Tıklayın`);
                        const w = hintText.length * 6.5 + 16;
                        html += `<rect x="${cx + 14}" y="${cy - 24}" width="${w}" height="20" rx="4" fill="#1e293b" stroke="#8b5cf6" stroke-width="1" />`;
                        html += `<text x="${cx + 14 + w / 2}" y="${cy - 10}" text-anchor="middle" fill="#f8fafc" font-size="10" font-weight="600" font-family="sans-serif">${hintText}</text>`;
                    }

                } else if (this.mode === 'lasso') {
                    // Kement Modunda Hassas Ok
                    html += `<path d="M ${cx + 1} ${cy + 1} L ${cx + 1} ${cy + 18} L ${cx + 5.2} ${cy + 14.2} L ${cx + 8.5} ${cy + 21} L ${cx + 10.8} ${cy + 20} L ${cx + 7.6} ${cy + 13.2} L ${cx + 13} ${cy + 13.2} Z" fill="rgba(0, 0, 0, 0.45)" />`;
                    html += `<path d="M ${cx} ${cy} L ${cx} ${cy + 17} L ${cx + 4.2} ${cy + 13.2} L ${cx + 7.5} ${cy + 20} L ${cx + 9.8} ${cy + 19} L ${cx + 6.6} ${cy + 12.2} L ${cx + 12} ${cy + 12.2} Z" fill="#ffffff" stroke="#0f172a" stroke-width="1.3" stroke-linejoin="round" />`;
                    html += `<circle cx="${cx}" cy="${cy}" r="2.5" fill="#10b981" stroke="#ffffff" stroke-width="1" />`;

                } else if (this.mode === 'area_brush') {
                    // Alan Fırçası: Turuncu Çember + Hassas Mikro Artı (+) (Daire tarzı şekiller kaldırıldı)
                    html += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(245, 158, 11, 0.03)" stroke="rgba(0, 0, 0, 0.55)" stroke-width="2" vector-effect="non-scaling-stroke" />`;
                    html += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#f59e0b" stroke-width="1.3" vector-effect="non-scaling-stroke" />`;

                    if (this.feather > 0.01 && innerRx > 2 && innerRy > 2) {
                        html += `<ellipse cx="${cx}" cy="${cy}" rx="${innerRx}" ry="${innerRy}" fill="none" stroke="rgba(0, 0, 0, 0.4)" stroke-width="1.6" stroke-dasharray="3,3" vector-effect="non-scaling-stroke" />`;
                        html += `<ellipse cx="${cx}" cy="${cy}" rx="${innerRx}" ry="${innerRy}" fill="none" stroke="#ffffff" stroke-width="0.9" stroke-dasharray="3,3" vector-effect="non-scaling-stroke" />`;
                    }

                    // Photoshop Tarzı Hassas Mikro Artı (+)
                    html += `<line x1="${cx - 5}" y1="${cy}" x2="${cx - 1.5}" y2="${cy}" stroke="rgba(0,0,0,0.75)" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx - 5}" y1="${cy}" x2="${cx - 1.5}" y2="${cy}" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx + 1.5}" y1="${cy}" x2="${cx + 5}" y2="${cy}" stroke="rgba(0,0,0,0.75)" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx + 1.5}" y1="${cy}" x2="${cx + 5}" y2="${cy}" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx}" y1="${cy - 5}" x2="${cx}" y2="${cy - 1.5}" stroke="rgba(0,0,0,0.75)" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx}" y1="${cy - 5}" x2="${cx}" y2="${cy - 1.5}" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx}" y1="${cy + 1.5}" x2="${cx}" y2="${cy + 5}" stroke="rgba(0,0,0,0.75)" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx}" y1="${cy + 1.5}" x2="${cx}" y2="${cy + 5}" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;

                } else {
                    // Canlı Fırça: Mavi Kılavuz Çember + Hassas Mikro Artı (+) (Daire tarzı şekiller kaldırıldı)
                    if (this.feather > 0.01) {
                        html += `<ellipse cx="${cx}" cy="${cy}" rx="${outerRx}" ry="${outerRy}" fill="none" stroke="rgba(14, 165, 233, 0.35)" stroke-width="1.2" stroke-dasharray="3,3" vector-effect="non-scaling-stroke" />`;
                    }
                    html += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(14, 165, 233, 0.03)" stroke="rgba(0, 0, 0, 0.55)" stroke-width="2" vector-effect="non-scaling-stroke" />`;
                    html += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#0ea5e9" stroke-width="1.3" vector-effect="non-scaling-stroke" />`;

                    if (this.feather > 0.01 && innerRx > 2 && innerRy > 2) {
                        html += `<ellipse cx="${cx}" cy="${cy}" rx="${innerRx}" ry="${innerRy}" fill="none" stroke="rgba(0, 0, 0, 0.4)" stroke-width="1.6" stroke-dasharray="3,3" vector-effect="non-scaling-stroke" />`;
                        html += `<ellipse cx="${cx}" cy="${cy}" rx="${innerRx}" ry="${innerRy}" fill="none" stroke="#ffffff" stroke-width="0.9" stroke-dasharray="3,3" vector-effect="non-scaling-stroke" />`;
                    }

                    // Photoshop Tarzı Hassas Mikro Artı (+)
                    html += `<line x1="${cx - 5}" y1="${cy}" x2="${cx - 1.5}" y2="${cy}" stroke="rgba(0,0,0,0.75)" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx - 5}" y1="${cy}" x2="${cx - 1.5}" y2="${cy}" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx + 1.5}" y1="${cy}" x2="${cx + 5}" y2="${cy}" stroke="rgba(0,0,0,0.75)" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx + 1.5}" y1="${cy}" x2="${cx + 5}" y2="${cy}" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx}" y1="${cy - 5}" x2="${cx}" y2="${cy - 1.5}" stroke="rgba(0,0,0,0.75)" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx}" y1="${cy - 5}" x2="${cx}" y2="${cy - 1.5}" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx}" y1="${cy + 1.5}" x2="${cx}" y2="${cy + 5}" stroke="rgba(0,0,0,0.75)" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                    html += `<line x1="${cx}" y1="${cy + 1.5}" x2="${cx}" y2="${cy + 5}" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
                }

                html += `</g>`;
            }

            this.svgEl.innerHTML = html;
        }
    };

    window.CloneStamp = CloneStamp;

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => CloneStamp.init());
        } else {
            CloneStamp.init();
        }
    }

})(window);
