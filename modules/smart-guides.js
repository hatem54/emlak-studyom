/**
 * ========================================================
 * EMLAK STÜDYOM - AKILLI HİZALAMA VE MANYETİK ÇEKİM MOTORU
 * modules/smart-guides.js
 * ========================================================
 * 
 * Canva & PowerPoint tarzı:
 * - Tuval sınırları (sol, sağ, üst, alt) ve tuval merkezi (yatay/dikey)
 * - Diğer tüm çerçeveler ve metinlerle kenar-kenara, merkez-merkeze hizalama
 * - Manyetik 8px çekim mesafesi
 * - Canlı pembe / turkuaz akıllı rehber çizgileri ve mesafe rozetleri
 */

(function(window) {
    'use strict';

    const SmartGuides = {
        enabled: false,
        threshold: 5, // 🌟 Hafif ve zarif manyetik çekim mesafesi (Canva/Figma standardı: 5px, takılma yapmaz)

        /**
         * Akıllı Hizalama Katmanını Getir veya Oluştur
         */
        getLayer: function() {
            const container = document.getElementById('canvas-container');
            if (!container) return null;

            let layer = document.getElementById('smart-guides-layer');
            if (!layer) {
                layer = document.createElement('div');
                layer.id = 'smart-guides-layer';
                container.appendChild(layer);
            }
            return layer;
        },

        /**
         * Tuval Boyutlarını Al
         * NOT: Kılavuz çizgileri #canvas-container içine yerleştiği için
         * DAİMA #canvas-container'ın CSS düzen boyutları (1920x1080 veya görsel boyutu)
         * baz alınmalıdır. WebGL buffer genişliği (three-d-layer.width) yüksek DPI'da
         * 1.5x/2x büyüdüğünden koordinat olarak KESİNLİKLE kullanılmamalıdır!
         */
        getCanvasDimensions: function() {
            const container = document.getElementById('canvas-container');
            if (container) {
                const w = parseFloat(container.style.width) || container.offsetWidth || 1920;
                const h = parseFloat(container.style.height) || container.offsetHeight || 1080;
                if (w > 0 && h > 0) return { w, h };
            }
            const drawCvs = document.getElementById('draw-layer');
            if (drawCvs && drawCvs.width && drawCvs.height) {
                return { w: drawCvs.width, h: drawCvs.height };
            }
            return { w: 1920, h: 1080 };
        },

        /**
         * Tuvaldeki Hizalanabilir Aday Nesneleri Topla
         */
        getCandidates: function(excludeEl) {
            const selector = '.tb-image-frame, .draggable, .canvas-el, .callout-wrap, .co-neon-block';
            const all = Array.from(document.querySelectorAll(selector));
            const candidates = [];

            all.forEach(el => {
                if (el === excludeEl) return;
                if (el.dataset.locked === 'true') return;
                if (el.style.display === 'none' || el.style.visibility === 'hidden') return;
                if (el.classList.contains('smart-guide-line') || el.id === 'smart-guides-layer') return;
                if (el.closest('.tb-frame-floating-tools') || el.closest('.tb-frame-handle')) return;

                const l = parseFloat(el.style.left);
                const t = parseFloat(el.style.top);
                const w = el.offsetWidth;
                const h = el.offsetHeight;

                if (!isNaN(l) && !isNaN(t) && w > 8 && h > 8) {
                    candidates.push({
                        el: el,
                        left: l,
                        right: l + w,
                        centerX: l + w / 2,
                        top: t,
                        bottom: t + h,
                        centerY: t + h / 2,
                        width: w,
                        height: h
                    });
                }
            });

            // 3D Nesneleri Aday Olarak Ekle (ThreeDEngine sahnede aktifse)
            if (window.ThreeDEngine && typeof window.ThreeDEngine.getElements === 'function') {
                try {
                    const threeEls = window.ThreeDEngine.getElements() || [];
                    const active3DId = (excludeEl && excludeEl.is3D) ? excludeEl.activeElementId : (window.ThreeDEngine.getActiveElement ? window.ThreeDEngine.getActiveElement()?.id : null);
                    const { w: cW, h: cH } = this.getCanvasDimensions();
                    threeEls.forEach(tEl => {
                        if (!tEl || tEl.visible === false) return;
                        if (excludeEl && excludeEl.is3D && tEl.id === active3DId) return;
                        let elW = 200, elH = 80;
                        if (window.ThreeDEngine && typeof window.ThreeDEngine.getElementDimensions === 'function') {
                            const dims = window.ThreeDEngine.getElementDimensions(tEl);
                            if (dims && dims.w && dims.h) {
                                elW = dims.w;
                                elH = dims.h;
                            }
                        }
                        const elCx = cW / 2 + (tEl.posX || 0);
                        const elCy = cH / 2 - (tEl.posY || 0);
                        candidates.push({
                            el: null,
                            is3D: true,
                            left: elCx - elW / 2,
                            right: elCx + elW / 2,
                            centerX: elCx,
                            top: elCy - elH / 2,
                            bottom: elCy + elH / 2,
                            centerY: elCy,
                            width: elW,
                            height: elH
                        });
                    });
                } catch(ex){}
            }

            return candidates;
        },

        /**
         * Manyetik Hizalama Hesaplayıcı (Snap Calculator)
         */
        snap: function(el, targetLeft, targetTop, width, height) {
            if (!this.enabled) {
                this.clear();
                return { left: targetLeft, top: targetTop };
            }

            const { w: cW, h: cH } = this.getCanvasDimensions();
            const curW = width || (el ? el.offsetWidth : 100);
            const curH = height || (el ? el.offsetHeight : 100);

            const scale = (typeof window.getGlobalScale === 'function') ? window.getGlobalScale() : 1;
            const snapDist = this.threshold / (scale || 1);

            let bestSnapX = null;
            let minDiffX = snapDist;

            let bestSnapY = null;
            let minDiffY = snapDist;

            const tL = targetLeft;
            const tR = targetLeft + curW;
            const tCX = targetLeft + curW / 2;

            const tT = targetTop;
            const tB = targetTop + curH;
            const tCY = targetTop + curH / 2;

            const candidates = this.getCandidates(el);

            // 1. Dikey Hizalamalar (X Ekseni)
            // 1.1 Tuval Merkezine Hizalama
            const canvasCX = cW / 2;
            const diffCanvasCX = Math.abs(tCX - canvasCX);
            if (diffCanvasCX < minDiffX) {
                minDiffX = diffCanvasCX;
                bestSnapX = {
                    left: canvasCX - curW / 2,
                    guidePos: canvasCX,
                    isCenter: true,
                    type: 'v',
                    label: 'Tuval Ortası'
                };
            }

            // 1.2 Tuval Sol ve Sağ Kenarları
            const diffCanvasL = Math.abs(tL - 0);
            if (diffCanvasL < minDiffX) {
                minDiffX = diffCanvasL;
                bestSnapX = { left: 0, guidePos: 0, isCenter: false, type: 'v', label: 'Sol Kenar' };
            }
            const diffCanvasR = Math.abs(tR - cW);
            if (diffCanvasR < minDiffX) {
                minDiffX = diffCanvasR;
                bestSnapX = { left: cW - curW, guidePos: cW, isCenter: false, type: 'v', label: 'Sağ Kenar' };
            }

            // 1.3 Diğer Nesnelere Hizalama (Merkez, Sol, Sağ)
            candidates.forEach(c => {
                // Merkez - Merkez
                const diffCX = Math.abs(tCX - c.centerX);
                if (diffCX < minDiffX) {
                    minDiffX = diffCX;
                    bestSnapX = { left: c.centerX - curW / 2, guidePos: c.centerX, isCenter: true, type: 'v', label: 'Merkez Hizalı' };
                }
                // Sol - Sol
                const diffLL = Math.abs(tL - c.left);
                if (diffLL < minDiffX) {
                    minDiffX = diffLL;
                    bestSnapX = { left: c.left, guidePos: c.left, isCenter: false, type: 'v', label: 'Sol Hizalı' };
                }
                // Sağ - Sağ
                const diffRR = Math.abs(tR - c.right);
                if (diffRR < minDiffX) {
                    minDiffX = diffRR;
                    bestSnapX = { left: c.right - curW, guidePos: c.right, isCenter: false, type: 'v', label: 'Sağ Hizalı' };
                }
                // Sol - Sağ (Bitişik / Yan Yana)
                const diffLR = Math.abs(tL - c.right);
                if (diffLR < minDiffX) {
                    minDiffX = diffLR;
                    bestSnapX = { left: c.right, guidePos: c.right, isCenter: false, type: 'v', label: 'Kenar Bitişik' };
                }
                // Sağ - Sol
                const diffRL = Math.abs(tR - c.left);
                if (diffRL < minDiffX) {
                    minDiffX = diffRL;
                    bestSnapX = { left: c.left - curW, guidePos: c.left, isCenter: false, type: 'v', label: 'Kenar Bitişik' };
                }
            });

            // 2. Yatay Hizalamalar (Y Ekseni)
            // 2.1 Tuval Merkezine Hizalama
            const canvasCY = cH / 2;
            const diffCanvasCY = Math.abs(tCY - canvasCY);
            if (diffCanvasCY < minDiffY) {
                minDiffY = diffCanvasCY;
                bestSnapY = {
                    top: canvasCY - curH / 2,
                    guidePos: canvasCY,
                    isCenter: true,
                    type: 'h',
                    label: 'Tuval Ortası'
                };
            }

            // 2.2 Tuval Üst ve Alt Kenarları
            const diffCanvasT = Math.abs(tT - 0);
            if (diffCanvasT < minDiffY) {
                minDiffY = diffCanvasT;
                bestSnapY = { top: 0, guidePos: 0, isCenter: false, type: 'h', label: 'Üst Kenar' };
            }
            const diffCanvasB = Math.abs(tB - cH);
            if (diffCanvasB < minDiffY) {
                minDiffY = diffCanvasB;
                bestSnapY = { top: cH - curH, guidePos: cH, isCenter: false, type: 'h', label: 'Alt Kenar' };
            }

            // 2.3 Diğer Nesnelere Hizalama (Merkez, Üst, Alt)
            candidates.forEach(c => {
                // Merkez - Merkez
                const diffCY = Math.abs(tCY - c.centerY);
                if (diffCY < minDiffY) {
                    minDiffY = diffCY;
                    bestSnapY = { top: c.centerY - curH / 2, guidePos: c.centerY, isCenter: true, type: 'h', label: 'Merkez Hizalı' };
                }
                // Üst - Üst
                const diffTT = Math.abs(tT - c.top);
                if (diffTT < minDiffY) {
                    minDiffY = diffTT;
                    bestSnapY = { top: c.top, guidePos: c.top, isCenter: false, type: 'h', label: 'Üst Hizalı' };
                }
                // Alt - Alt
                const diffBB = Math.abs(tB - c.bottom);
                if (diffBB < minDiffY) {
                    minDiffY = diffBB;
                    bestSnapY = { top: c.bottom - curH, guidePos: c.bottom, isCenter: false, type: 'h', label: 'Alt Hizalı' };
                }
                // Üst - Alt (Alt Alta Bitişik)
                const diffTB = Math.abs(tT - c.bottom);
                if (diffTB < minDiffY) {
                    minDiffY = diffTB;
                    bestSnapY = { top: c.bottom, guidePos: c.bottom, isCenter: false, type: 'h', label: 'Alt Bitişik' };
                }
                // Alt - Üst
                const diffBT = Math.abs(tB - c.top);
                if (diffBT < minDiffY) {
                    minDiffY = diffBT;
                    bestSnapY = { top: c.top - curH, guidePos: c.top, isCenter: false, type: 'h', label: 'Üst Bitişik' };
                }
            });

            const finalLeft = (bestSnapX !== null) ? bestSnapX.left : targetLeft;
            const finalTop = (bestSnapY !== null) ? bestSnapY.top : targetTop;

            const guidesToDraw = [];
            if (bestSnapX) guidesToDraw.push(bestSnapX);
            if (bestSnapY) guidesToDraw.push(bestSnapY);

            this.render(guidesToDraw, finalLeft, finalTop, curW, curH);

            return {
                left: Math.round(finalLeft),
                top: Math.round(finalTop),
                snappedX: bestSnapX !== null,
                snappedY: bestSnapY !== null
            };
        },

        /**
         * Kılavuz Çizgilerini ve Rozetleri Tuval Üzerine Çiz
         */
        render: function(guides, curL, curT, curW, curH) {
            const layer = this.getLayer();
            if (!layer) return;

            layer.innerHTML = '';
            if (!guides || guides.length === 0) return;

            guides.forEach(g => {
                const line = document.createElement('div');
                line.className = `smart-guide-line ${g.type === 'v' ? 'v-line' : 'h-line'} ${g.isCenter ? 'center-line' : ''}`;

                const badge = document.createElement('div');
                badge.className = `smart-guide-badge ${g.isCenter ? 'center-badge' : ''}`;
                badge.textContent = g.label;

                if (g.type === 'v') {
                    line.style.left = Math.round(g.guidePos) + 'px';
                    badge.style.left = Math.round(g.guidePos) + 'px';
                    badge.style.top = Math.max(20, Math.round(curT - 14)) + 'px';
                } else {
                    line.style.top = Math.round(g.guidePos) + 'px';
                    badge.style.top = Math.round(g.guidePos) + 'px';
                    badge.style.left = Math.max(40, Math.round(curL + curW / 2)) + 'px';
                }

                layer.appendChild(line);
                layer.appendChild(badge);
            });
        },

        /**
         * Kılavuz Çizgilerini Temizle
         */
        clear: function() {
            const layer = document.getElementById('smart-guides-layer');
            if (layer) {
                layer.innerHTML = '';
            }
        }
    };

    window.SmartGuides = SmartGuides;

    // Merkezi Akıllı Hizalama Durumu (Kullanıcı talebi: Varsayılan olarak DAİMA KAPALI başlar)
    window.isSmartGuidesEnabled = false;
    SmartGuides.enabled = false;
    try {
        localStorage.setItem('es_smart_guides_enabled', '0');
    } catch(e) {}

    window.toggleSmartGuides = function(forcedState) {
        if (typeof forcedState === 'boolean') {
            window.isSmartGuidesEnabled = forcedState;
        } else {
            window.isSmartGuidesEnabled = !window.isSmartGuidesEnabled;
        }

        SmartGuides.enabled = window.isSmartGuidesEnabled;

        if (!window.isSmartGuidesEnabled) {
            SmartGuides.clear();
            if (typeof window.clearSnapGuides === 'function') window.clearSnapGuides();
        } else {
            // Canlı görsel geri bildirim: merkez çizgilerini zarifçe 450ms gösterip tuvalin hazır olduğunu hissettir
            const { w: cW, h: cH } = SmartGuides.getCanvasDimensions();
            SmartGuides.render([
                { type: 'v', guidePos: cW / 2, isCenter: true, label: 'Tuval Dikey Merkez' },
                { type: 'h', guidePos: cH / 2, isCenter: true, label: 'Tuval Yatay Merkez' }
            ], cW / 2, cH / 2, 100, 50);
            setTimeout(() => {
                SmartGuides.clear();
            }, 450);
        }

        // Tüm switchleri senkronize et
        document.querySelectorAll('#drawSnapToggle, #tbSnapToggle').forEach(el => {
            el.checked = window.isSmartGuidesEnabled;
        });

        // Tüm dock butonlarını senkronize et
        document.querySelectorAll('.dock-snap-btn').forEach(btn => {
            btn.classList.toggle('lock-active', window.isSmartGuidesEnabled);
            btn.classList.toggle('active', window.isSmartGuidesEnabled);
            btn.title = window.isSmartGuidesEnabled ? 'Akıllı Manyetik Hizalamayı Kapat' : 'Akıllı Manyetik Hizalamayı Aç';
        });

        try {
            localStorage.setItem('es_smart_guides_enabled', window.isSmartGuidesEnabled ? '1' : '0');
        } catch(e) {}

        console.log('🧲 Akıllı Hizalama:', window.isSmartGuidesEnabled ? 'AÇIK' : 'KAPALI');
        return window.isSmartGuidesEnabled;
    };

    // DOM yüklendiğinde butonları ve switchleri senkronize et
    function syncAllSnapControls() {
        document.querySelectorAll('#drawSnapToggle, #tbSnapToggle').forEach(el => {
            el.checked = !!window.isSmartGuidesEnabled;
        });
        document.querySelectorAll('.dock-snap-btn').forEach(btn => {
            btn.classList.toggle('lock-active', !!window.isSmartGuidesEnabled);
            btn.classList.toggle('active', !!window.isSmartGuidesEnabled);
            btn.title = window.isSmartGuidesEnabled ? 'Akıllı Manyetik Hizalamayı Kapat' : 'Akıllı Manyetik Hizalamayı Aç';
        });
    }
    if (document.readyState !== 'loading') {
        syncAllSnapControls();
    } else {
        document.addEventListener('DOMContentLoaded', syncAllSnapControls);
    }

    // Legacy hooks entegrasyonu (core/drag.js ve diğer modüller için)
    window.getSnapGuides = function(px, py, excludeEl, isDrawingMode) {
        if (!window.isSmartGuidesEnabled) return { x: px, y: py, guides: [] };

        // Çizim modundaysa (çokgen, çizgi vb.) vektör köşe/kenar yakalamasını kullan
        if (isDrawingMode) {
            if (typeof window._legacyGetSnapGuides === 'function') {
                return window._legacyGetSnapGuides(px, py, excludeEl, true);
            }
            return { x: px, y: py, guides: [] };
        }

        const curW = excludeEl ? (excludeEl._cachedDragW || excludeEl.offsetWidth || 100) : 100;
        const curH = excludeEl ? (excludeEl._cachedDragH || excludeEl.offsetHeight || 100) : 100;
        const currentL = px - curW / 2;
        const currentT = py - curH / 2;

        const res = SmartGuides.snap(excludeEl, currentL, currentT, curW, curH);
        return {
            x: res.left + curW / 2,
            y: res.top + curH / 2,
            guides: []
        };
    };

    window.clearSnapGuides = function() {
        SmartGuides.clear();
        document.querySelectorAll('.snap-guide-line, .snap-guide-point').forEach(e => e.remove());
    };

})(window);
