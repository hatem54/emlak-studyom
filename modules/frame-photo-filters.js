/**
 * ============================================================
 * EMLAK STÜDYOM - ÇERÇEVE İÇİ FOTOĞRAF IŞIK & RENK MOTORU
 * modules/frame-photo-filters.js
 * ============================================================
 *
 * Amaç:
 * - Seçili Şablon Oluştur çerçevelerinin (.tb-image-frame) içindeki
 *   fotoğraflara, ana Fotoğraf sekmesindeki aynı GPU WebGL motorunu
 *   (window.WebGLPhotoEngine + window.getWebGLPhotoOptions) kullanarak
 *   kayıpsız pozlama, kontrast, HDR ışık/gölge, beyaz/siyahlar, sıcaklık,
 *   canlılık, keskinlik, AI netleştirme, vinyet ve tonlama uygular.
 * - Ana arka plan fotoğrafının ayarlarına veya eğrilerine (LUT) karışmaz.
 */
(function (window) {
    'use strict';

    const DEFAULTS = {
        exposure: 100,
        contrast: 100,
        highlightsCtrl: 0,
        shadowsCtrl: 0,
        whitesCtrl: 0,
        blacksCtrl: 0,
        tempCtrl: 0,
        tintCtrl: 0,
        saturate: 100,
        vibranceCtrl: 0,
        sharpnessCtrl: 0,
        aiPhotoEnhanceSlider: 0,
        clarityCtrl: 0,
        dehazeCtrl: 0,
        vignette: 0,
        hueRotate: 0,
        sepia: 0,
        grayscale: 0,
        fblur: 0
    };

    const FILTER_META = {
        exposure: { suffix: '%' },
        contrast: { suffix: '%' },
        highlightsCtrl: { suffix: '' },
        shadowsCtrl: { suffix: '' },
        whitesCtrl: { suffix: '' },
        blacksCtrl: { suffix: '' },
        tempCtrl: { suffix: '' },
        tintCtrl: { suffix: '' },
        saturate: { suffix: '%' },
        vibranceCtrl: { suffix: '' },
        sharpnessCtrl: { suffix: '' },
        aiPhotoEnhanceSlider: { suffix: '%' },
        clarityCtrl: { suffix: '' },
        dehazeCtrl: { suffix: '' },
        vignette: { suffix: '%' },
        hueRotate: { suffix: '°' },
        sepia: { suffix: '%' },
        grayscale: { suffix: '%' },
        fblur: { suffix: 'px' }
    };

    const LINEAR_LUT = (() => {
        const arr = new Uint8Array(256 * 4);
        for (let i = 0; i < 256; i++) {
            arr[i * 4] = i;
            arr[i * 4 + 1] = i;
            arr[i * 4 + 2] = i;
            arr[i * 4 + 3] = i;
        }
        return arr;
    })();

    const _rafQueue = new WeakMap();
    let _historyTimer = null;

    function getFrameFilters(frame) {
        const result = Object.assign({}, DEFAULTS);
        if (!frame || !frame.dataset || !frame.dataset.photoFilters) return result;
        try {
            const parsed = JSON.parse(frame.dataset.photoFilters);
            if (parsed && typeof parsed === 'object') {
                Object.keys(DEFAULTS).forEach(k => {
                    if (parsed[k] !== undefined && !isNaN(Number(parsed[k]))) {
                        result[k] = Number(parsed[k]);
                    }
                });
            }
        } catch (_) {}
        return result;
    }

    function isModified(filters) {
        if (!filters) return false;
        return Object.keys(DEFAULTS).some(k => Math.abs((Number(filters[k]) ?? DEFAULTS[k]) - DEFAULTS[k]) > 0.001);
    }

    function setFrameFilters(frame, filters) {
        if (!frame) return;
        if (!isModified(filters)) {
            delete frame.dataset.photoFilters;
        } else {
            const compact = {};
            Object.keys(DEFAULTS).forEach(k => {
                if (Math.abs((Number(filters[k]) ?? DEFAULTS[k]) - DEFAULTS[k]) > 0.001) {
                    compact[k] = Number(filters[k]);
                }
            });
            frame.dataset.photoFilters = JSON.stringify(compact);
        }
    }

    function getOrCreateRenderCanvas(frame, img) {
        const inner = (frame.querySelector('.tb-frame-inner') || frame.querySelector('.tb-frame-clip') || frame);
        let canvas = inner.querySelector('.tb-frame-render-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.className = 'tb-frame-render-canvas tb-frame-img-proxy';
            canvas.style.position = 'absolute';
            canvas.style.top = '50%';
            canvas.style.left = '50%';
            canvas.style.minWidth = '0';
            canvas.style.minHeight = '0';
            canvas.style.maxWidth = 'none';
            canvas.style.maxHeight = 'none';
            canvas.style.objectFit = 'fill';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '1';
            inner.insertBefore(canvas, img ? img.nextSibling : inner.firstChild);
        }
        return canvas;
    }

    function removeRenderCanvas(frame) {
        if (!frame) return;
        const c = frame.querySelector('.tb-frame-render-canvas');
        if (c) c.remove();
        const img = frame.querySelector('.tb-frame-img');
        if (img) {
            img.style.visibility = '';
            img.style.display = 'block';
        }
    }

    function renderFrameNow(frame) {
        if (!frame) return;
        const hasImg = frame.classList.contains('has-image') && !!frame.dataset.imgSrc;
        const img = frame.querySelector('.tb-frame-img');
        if (!hasImg || !img) {
            removeRenderCanvas(frame);
            return;
        }

        const filters = getFrameFilters(frame);
        if (!isModified(filters)) {
            removeRenderCanvas(frame);
            if (window.TemplateBuilder && typeof window.TemplateBuilder.applyImageZoomPan === 'function') {
                window.TemplateBuilder.applyImageZoomPan(frame);
            }
            return;
        }

        if (!img.complete || !img.naturalWidth) {
            if (!img._tbFilterPending) {
                img._tbFilterPending = true;
                img.addEventListener('load', () => {
                    img._tbFilterPending = false;
                    renderFrameNow(frame);
                }, { once: true });
            }
            return;
        }

        const natW = img.naturalWidth || 1200;
        const natH = img.naturalHeight || 800;
        const maxPreviewSide = 1280;
        const scale = Math.min(1, maxPreviewSide / Math.max(natW, natH));
        const renderW = Math.max(1, Math.round(natW * scale));
        const renderH = Math.max(1, Math.round(natH * scale));

        const targetCanvas = getOrCreateRenderCanvas(frame, img);
        if (targetCanvas.width !== renderW || targetCanvas.height !== renderH) {
            targetCanvas.width = renderW;
            targetCanvas.height = renderH;
        }

        const engine = window.WebGLPhotoEngine;
        let rendered = false;

        if (engine && engine.initialized && typeof window.getWebGLPhotoOptions === 'function') {
            let prevCurveLut = null;
            try {
                if (window.PhotoCurvesManager && window.PhotoCurvesManager.lut) {
                    prevCurveLut = window.PhotoCurvesManager.lut;
                    engine.updateCurveTexture(LINEAR_LUT);
                }

                const fullAdj = { filters: Object.assign({}, filters) };
                const opts = window.getWebGLPhotoOptions(fullAdj);
                opts.showMaskOverlay = false;
                opts.showRadialOverlay = false;
                opts.showLinearOverlay = false;

                rendered = engine.renderToCanvas(targetCanvas, img, opts);
            } catch (err) {
                console.warn('[FramePhotoFilters] WebGL önizleme hatası:', err);
                rendered = false;
            } finally {
                if (prevCurveLut && typeof engine.updateCurveTexture === 'function') {
                    engine.updateCurveTexture(prevCurveLut);
                }
            }
        }

        if (!rendered) {
            const ctx = targetCanvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, renderW, renderH);
                const effExp = filters.exposure + (filters.dehazeCtrl * 0.15) + (filters.aiPhotoEnhanceSlider * 0.02);
                const effCon = filters.contrast + (filters.clarityCtrl * 0.4) + (filters.dehazeCtrl * 0.3) + (filters.aiPhotoEnhanceSlider * 0.22);
                const effSat = filters.saturate + (filters.vibranceCtrl * 0.5) + (filters.aiPhotoEnhanceSlider * 0.18);
                const effHue = filters.hueRotate + (filters.tempCtrl * 0.3) - (filters.tintCtrl * 0.3);
                ctx.filter = `brightness(${effExp}%) contrast(${effCon}%) saturate(${effSat}%) sepia(${filters.sepia}%) grayscale(${filters.grayscale}%) blur(${filters.fblur}px) hue-rotate(${effHue}deg)`;
                ctx.drawImage(img, 0, 0, renderW, renderH);
                ctx.filter = 'none';

                if (filters.vignette > 0) {
                    const grad = ctx.createRadialGradient(renderW / 2, renderH / 2, Math.min(renderW, renderH) * 0.28, renderW / 2, renderH / 2, Math.hypot(renderW, renderH) * 0.55);
                    grad.addColorStop(0, 'rgba(0,0,0,0)');
                    grad.addColorStop(1, `rgba(0,0,0,${Math.min(0.9, filters.vignette / 100)})`);
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, renderW, renderH);
                }
            }
        }

        img.style.visibility = 'hidden';
        targetCanvas.style.display = 'block';

        if (window.TemplateBuilder && typeof window.TemplateBuilder.applyImageZoomPan === 'function') {
            window.TemplateBuilder.applyImageZoomPan(frame);
        }
    }

    function scheduleRender(frame) {
        if (!frame) return;
        const prev = _rafQueue.get(frame);
        if (prev) cancelAnimationFrame(prev);
        const id = requestAnimationFrame(() => {
            _rafQueue.delete(frame);
            renderFrameNow(frame);
        });
        _rafQueue.set(frame, id);
    }

    function syncLabel(key, val) {
        const meta = FILTER_META[key];
        const span = document.getElementById('tbFlt_' + key + 'Val');
        if (span && meta) {
            span.textContent = Math.round(Number(val)) + meta.suffix;
        }
    }

    function syncPanel(frame) {
        const filters = getFrameFilters(frame);
        Object.keys(DEFAULTS).forEach(key => {
            const val = filters[key] !== undefined ? filters[key] : DEFAULTS[key];
            const input = document.getElementById('tbFlt_' + key);
            if (input) input.value = val;
            syncLabel(key, val);
        });
    }

    function getTargetFrames() {
        if (window.TemplateBuilder && typeof window.TemplateBuilder.getTargetFrames === 'function') {
            return window.TemplateBuilder.getTargetFrames();
        }
        const active = window.TemplateBuilder && window.TemplateBuilder.selectedFrame;
        return active ? [active] : [];
    }

    function updateProp(key, rawVal) {
        if (!(key in DEFAULTS)) return;
        const val = Number(rawVal);
        if (isNaN(val)) return;

        syncLabel(key, val);

        const frames = getTargetFrames();
        frames.forEach(frame => {
            const filters = getFrameFilters(frame);
            filters[key] = val;
            setFrameFilters(frame, filters);
            scheduleRender(frame);
        });

        clearTimeout(_historyTimer);
        _historyTimer = setTimeout(() => {
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Çerçeve Fotoğraf Ayarı');
            }
        }, 350);
    }

    function resetSlider(key) {
        if (!(key in DEFAULTS)) return;
        const defVal = DEFAULTS[key];
        const input = document.getElementById('tbFlt_' + key);
        if (input) input.value = defVal;
        updateProp(key, defVal);
    }

    function resetAll() {
        const frames = getTargetFrames();
        if (frames.length === 0) return;

        frames.forEach(frame => {
            delete frame.dataset.photoFilters;
            removeRenderCanvas(frame);
            if (window.TemplateBuilder && typeof window.TemplateBuilder.applyImageZoomPan === 'function') {
                window.TemplateBuilder.applyImageZoomPan(frame);
            }
        });

        syncPanel(frames[frames.length - 1]);
        if (typeof window.recordHistory === 'function') {
            window.recordHistory('Çerçeve Fotoğraf Ayarları Sıfırlandı');
        }
    }

    function renderAllFrames() {
        document.querySelectorAll('.tb-image-frame.has-image').forEach(f => {
            if (f.dataset.photoFilters) {
                renderFrameNow(f);
            }
        });
    }

    window.FramePhotoFilters = {
        DEFAULTS,
        getFrameFilters,
        isModified,
        renderFrameNow,
        scheduleRender,
        renderAllFrames,
        syncPanel,
        updateProp,
        resetSlider,
        resetAll,
        removeRenderCanvas
    };
})(window);
