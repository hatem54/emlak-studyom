/**
 * ========================================================
 * EMLAK STÜDYOM - SERBEST ÇOKGEN ÇERÇEVE OLUŞTURUCU MOTORU
 * modules/template-polygon-frame.js
 * ========================================================
 * 
 * - Tuval Üzerinde Ok İmleciyle Hassas Çokgen Çizimi (Pixel-Perfect Arrow Cursor)
 * - Manyetik Başlangıç Noktası Yakalama (Magnetic Snap to Origin)
 * - Çift Tık veya İlk Noktayla Kapatma (Double-Click / Origin Close)
 * - Çokgeni Akıllı Görsel Çerçevesine (.tb-image-frame) Dönüştürme
 * - Görsel Yükleme, Zoom/Pan ve 3D Düzlem Entegrasyonu
 */

(function(window) {
    'use strict';

    const TemplatePolygonFrame = {
        isDrawing: false,
        points: [],
        overlayEl: null,
        hudEl: null,
        _activeListeners: null,

        /**
         * Çokgen Çizim Modunu Başlat
         */
        startDrawing: function() {
            if (this.isDrawing) return;

            const cContainer = document.getElementById('canvas-container');
            if (!cContainer) return;

            // Varsa mevcut seçimi kaldır
            if (window.TemplateBuilder && typeof window.TemplateBuilder.deselectFrame === 'function') {
                window.TemplateBuilder.deselectFrame();
            }

            if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
                window.CanvasEmptyState.dismiss();
            }

            this.isDrawing = true;
            this.points = [];

            const canvasW = parseFloat(cContainer.style.width) || cContainer.offsetWidth || 1920;
            const canvasH = parseFloat(cContainer.style.height) || cContainer.offsetHeight || 1080;

            // 1. Çizim Katmanı (SVG Overlay - Tuval koordinatlarıyla 1:1 kilitli)
            const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            overlay.setAttribute('id', 'tbPolygonDrawOverlay');
            overlay.setAttribute('class', 'tb-polygon-draw-overlay');
            overlay.setAttribute('viewBox', `0 0 ${canvasW} ${canvasH}`);
            overlay.setAttribute('width', canvasW);
            overlay.setAttribute('height', canvasH);
            overlay.style.position = 'absolute';
            overlay.style.left = '0';
            overlay.style.top = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.zIndex = '500';
            overlay.style.cursor = 'default'; // Kullanıcı isteği: artı işareti yerine ok işareti
            overlay.style.pointerEvents = 'auto';

            cContainer.appendChild(overlay);
            this.overlayEl = overlay;

            // 2. Canlı Bilgilendirme Rozeti (HUD - preview-area içerisine ölçekten bağımsız eklenir)
            const hud = document.createElement('div');
            hud.id = 'tbPolygonHud';
            hud.className = 'tb-polygon-hud';
            hud.innerHTML = `
                <i class="fa-solid fa-draw-polygon" style="color:#38bdf8; margin-right:8px;"></i>
                <span>Köşeleri tıklayın. İlk noktaya tıklayarak veya çift tıklayarak kapatın.</span>
                <button type="button" class="btn-action" style="padding:2px 10px; font-size:11px; margin-left:12px; cursor:pointer;" onclick="TemplatePolygonFrame.cancelDrawing()">İptal</button>
            `;
            const previewArea = document.querySelector('.preview-area') || cContainer.parentElement || cContainer;
            previewArea.appendChild(hud);
            this.hudEl = hud;

            this.bindDrawingEvents(cContainer, overlay);
        },

        /**
         * Çizim Olaylarını Bağla
         */
        bindDrawingEvents: function(cContainer, overlay) {
            let previewPt = null;

            /**
             * Ekran fare koordinatlarını (clientX/Y) tuvalin iç çözünürlük koordinatlarına (0..canvasW, 0..canvasH) dönüştürür.
             * Zoom, pan ve scale faktörlerinden bağımsız olarak %100 piksel-kesin eşleşme sağlar.
             */
            const getCanvasPos = (e) => {
                const rect = cContainer.getBoundingClientRect();
                const canvasW = parseFloat(cContainer.style.width) || cContainer.offsetWidth || 1920;
                const canvasH = parseFloat(cContainer.style.height) || cContainer.offsetHeight || 1080;
                const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
                const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;

                const rw = rect.width > 0 ? rect.width : canvasW;
                const rh = rect.height > 0 ? rect.height : canvasH;

                const x = Math.round((clientX - rect.left) * (canvasW / rw));
                const y = Math.round((clientY - rect.top) * (canvasH / rh));

                return {
                    x: Math.max(0, Math.min(canvasW, x)),
                    y: Math.max(0, Math.min(canvasH, y))
                };
            };

            const onClick = (e) => {
                if (e.target.closest('#tbPolygonHud button')) return;
                e.preventDefault();
                e.stopPropagation();

                const pos = getCanvasPos(e);
                const rect = cContainer.getBoundingClientRect();
                const canvasW = parseFloat(cContainer.style.width) || cContainer.offsetWidth || 1920;
                const screenScale = (rect.width > 0) ? (rect.width / canvasW) : 1;

                // Eğer 3 veya daha fazla nokta varsa ve ilk noktaya yakın tıklandıysa tamamla
                if (this.points.length >= 3) {
                    const firstPt = this.points[0];
                    const distScreen = Math.hypot(pos.x - firstPt.x, pos.y - firstPt.y) * screenScale;
                    if (distScreen <= 22) {
                        this.finishDrawing();
                        return;
                    }
                }

                this.points.push(pos);
                this.renderSvg(pos);
            };

            const onMouseMove = (e) => {
                previewPt = getCanvasPos(e);
                this.renderSvg(previewPt);
            };

            const onDblClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.points.length >= 3) {
                    this.finishDrawing();
                }
            };

            const onKeyDown = (e) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.cancelDrawing();
                } else if (e.key === 'Backspace' || (e.key === 'z' && (e.ctrlKey || e.metaKey))) {
                    e.preventDefault();
                    if (this.points.length > 0) {
                        this.points.pop();
                        this.renderSvg(previewPt);
                    }
                }
            };

            overlay.addEventListener('click', onClick);
            overlay.addEventListener('mousemove', onMouseMove);
            overlay.addEventListener('dblclick', onDblClick);
            window.addEventListener('keydown', onKeyDown);

            this._activeListeners = {
                cleanup: () => {
                    overlay.removeEventListener('click', onClick);
                    overlay.removeEventListener('mousemove', onMouseMove);
                    overlay.removeEventListener('dblclick', onDblClick);
                    window.removeEventListener('keydown', onKeyDown);
                }
            };
        },

        /**
         * SVG Çizim Kılavuzunu Canlı Olarak Çiz
         */
        renderSvg: function(previewPt) {
            if (!this.overlayEl) return;
            const overlay = this.overlayEl;
            overlay.innerHTML = '';

            if (this.points.length === 0 && !previewPt) return;

            const pts = [...this.points];
            let isSnapFirst = false;

            if (pts.length >= 3 && previewPt) {
                const cContainer = document.getElementById('canvas-container');
                const rect = cContainer ? cContainer.getBoundingClientRect() : null;
                const canvasW = cContainer ? (parseFloat(cContainer.style.width) || cContainer.offsetWidth || 1920) : 1920;
                const screenScale = (rect && rect.width > 0) ? (rect.width / canvasW) : 1;

                const distScreen = Math.hypot(previewPt.x - pts[0].x, previewPt.y - pts[0].y) * screenScale;
                if (distScreen <= 22) {
                    previewPt = { x: pts[0].x, y: pts[0].y };
                    isSnapFirst = true;
                }
            }

            // Manyetik ilk nokta üzerindeyken el imleci (pointer), çizim alanında ok imleci (default)
            overlay.style.cursor = isSnapFirst ? 'pointer' : 'default';

            const allPts = previewPt ? [...pts, previewPt] : pts;

            // 1. Çokgen Dolgu Önizlemesi (Yarı Saydam Gökyüzü Mavisi)
            if (allPts.length >= 3) {
                const polyEl = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                const ptsStr = allPts.map(p => `${p.x},${p.y}`).join(' ');
                polyEl.setAttribute('points', ptsStr);
                polyEl.setAttribute('fill', 'rgba(2, 132, 199, 0.12)');
                polyEl.setAttribute('stroke', 'none');
                overlay.appendChild(polyEl);
            }

            // 2. Çizgiler
            if (allPts.length >= 2) {
                for (let i = 0; i < allPts.length - 1; i++) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', allPts[i].x);
                    line.setAttribute('y1', allPts[i].y);
                    line.setAttribute('x2', allPts[i + 1].x);
                    line.setAttribute('y2', allPts[i + 1].y);
                    const isLastPreview = (i === allPts.length - 2);
                    line.setAttribute('stroke', isLastPreview ? '#0284c7' : '#0ea5e9');
                    line.setAttribute('stroke-width', isLastPreview ? '2.5' : '3');
                    if (isLastPreview) {
                        line.setAttribute('stroke-dasharray', '6 5');
                    }
                    overlay.appendChild(line);
                }
            }

            // 3. Noktalar (Vertices)
            pts.forEach((p, idx) => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', p.x);
                circle.setAttribute('cy', p.y);
                const isOrigin = (idx === 0);
                circle.setAttribute('r', isOrigin ? (isSnapFirst ? '10' : '7') : '5');
                circle.setAttribute('fill', isOrigin ? (isSnapFirst ? '#10b981' : '#0284c7') : '#ffffff');
                circle.setAttribute('stroke', (isOrigin && isSnapFirst) ? '#ffffff' : '#0284c7');
                circle.setAttribute('stroke-width', (isOrigin && isSnapFirst) ? '3' : '2');
                overlay.appendChild(circle);
            });

            // 4. İmleç Kılavuz Noktası (Preview Guide Dot)
            if (previewPt && !isSnapFirst) {
                const guideDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                guideDot.setAttribute('cx', previewPt.x);
                guideDot.setAttribute('cy', previewPt.y);
                guideDot.setAttribute('r', '4.5');
                guideDot.setAttribute('fill', '#0284c7');
                guideDot.setAttribute('stroke', '#ffffff');
                guideDot.setAttribute('stroke-width', '1.5');
                overlay.appendChild(guideDot);
            }
        },

        /**
         * Çizimi Tamamla ve Akıllı Görsel Çerçevesine Dönüştür
         */
        finishDrawing: function() {
            if (this.points.length < 3) {
                this.cancelDrawing();
                return;
            }

            const pts = [...this.points];

            // Dış Sınır Kutusunu (Bounding Box) Hesapla
            const minX = Math.min(...pts.map(p => p.x));
            const maxX = Math.max(...pts.map(p => p.x));
            const minY = Math.min(...pts.map(p => p.y));
            const maxY = Math.max(...pts.map(p => p.y));

            const w = Math.max(80, maxX - minX);
            const h = Math.max(80, maxY - minY);

            // Koordinatları 0-100% bağıl oranlara normalize et
            const normPoints = pts.map(p => ({
                x: (((p.x - minX) / w) * 100).toFixed(2),
                y: (((p.y - minY) / h) * 100).toFixed(2)
            }));

            const clipPathVal = 'polygon(' + normPoints.map(p => `${p.x}% ${p.y}%`).join(', ') + ')';

            // Çizim katmanını temizle
            this.cleanup();

            // Standart Akıllı Çerçeveyi Oluştur
            if (window.TemplateBuilder && typeof window.TemplateBuilder.createImageFrame === 'function') {
                const frame = window.TemplateBuilder.createImageFrame({
                    x: minX,
                    y: minY,
                    width: w,
                    height: h,
                    label: 'Çokgen Çerçeve',
                    radius: 0
                });

                if (frame) {
                    frame.dataset.isPolygon = 'true';
                    frame.dataset.polygonClip = clipPathVal;
                    frame.dataset.polygonPoints = JSON.stringify(normPoints);

                    const clip = frame.querySelector('.tb-frame-clip') || frame;
                    clip.style.clipPath = clipPathVal;
                    clip.style.webkitClipPath = clipPathVal;
                    clip.style.borderRadius = '0px';
                    frame.style.borderRadius = '0px';
                    frame.style.border = 'none';

                    // 3D Dönüşüm dinleyicilerini bağla
                    if (window.Template3DFrame && typeof window.Template3DFrame.bindInteractiveTilt === 'function') {
                        window.Template3DFrame.bindInteractiveTilt(frame);
                    }

                    // Çerçeveyi seç
                    window.TemplateBuilder.selectFrame(frame);
                }
            }
        },

        /**
         * Çizimi İptal Et
         */
        cancelDrawing: function() {
            this.cleanup();
        },

        /**
         * Kaynakları ve Dinleyicileri Temizle (Memory Gate)
         */
        cleanup: function() {
            this.isDrawing = false;
            this.points = [];

            if (this._activeListeners) {
                this._activeListeners.cleanup();
                this._activeListeners = null;
            }

            if (this.overlayEl && this.overlayEl.parentNode) {
                this.overlayEl.parentNode.removeChild(this.overlayEl);
            }
            this.overlayEl = null;

            if (this.hudEl && this.hudEl.parentNode) {
                this.hudEl.parentNode.removeChild(this.hudEl);
            }
            this.hudEl = null;
        }
    };

    window.TemplatePolygonFrame = TemplatePolygonFrame;

})(window);
