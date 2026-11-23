/**
 * ============================================================
 * EMLAK STÜDYOM - ÇOKLU FORMAT & ŞABLON DÜZEN ADAPTÖRÜ
 * modules/format-layout-adapter.js
 * ============================================================
 *
 * Amaç:
 * - Çoklu format çıktılarında (16:9 -> 1:1 / 9:16) tasarımın ortada küçük kalıp
 *   üst/altta dev boşluklar oluşturmasını engeller.
 * - Düzenli ızgaralar (2x3, 2x2, 1x3 vb.) için Akıllı Izgara Dönüşümü (Smart Reflow)
 *   uygular; üst başlık / alt fiyat rozeti varsa güvenli alan ayırır.
 * - Serbest / çapraz yerleşimli tasarımlar (ör. farklı köşelerde çerçeve + rozet)
 *   için Çapa Tabanlı Yayılım (Anchor Spread + Alan Dengeli Ölçek) kullanır;
 *   köşe ve merkez hizalarını koruyarak yeni tuvali dengeli doldurur.
 * - Üzerinde piksele bağlı serbest çizim (drawPaths) varsa tek tip orantılı
 *   merkezleme ile çizimlerin kaymasını önler.
 */
(function (window) {
    'use strict';

    const EXCLUDED_IDS = new Set(['elBadge', 'elPrice', 'elDetails', 'elLogo']);
    const EXCLUDED_CLASSES = ['normal-el', 'canva-generated', 'canva-panel', 'editable-draw'];

    function isExcludedCustomElement(el) {
        if (!el || EXCLUDED_IDS.has(el.id)) return true;
        if (el.classList.contains('tb-image-frame')) return true;
        return EXCLUDED_CLASSES.some(cls => el.classList.contains(cls));
    }

    function collectCustomElements() {
        const selectors = [
            '#canvas-container .draggable',
            '#canvas-container .callout-wrap',
            '#canvas-container .co-neon-block',
            '#ui-layer > .draggable',
            '#ui-layer > .canvas-el',
            '#ui-layer > .added-icon',
            '#tb-active-info-card'
        ].join(', ');
        const seen = new Set();
        const result = [];
        document.querySelectorAll(selectors).forEach(el => {
            if (seen.has(el) || isExcludedCustomElement(el)) return;
            seen.add(el);
            result.push(el);
        });
        return result;
    }

    function refreshFrameVisuals(frame) {
        if (!window.TemplateBuilder || !frame) return;
        if (typeof window.TemplateBuilder.applyFrameStyling === 'function') {
            window.TemplateBuilder.applyFrameStyling(frame);
        }
        if (typeof window.TemplateBuilder.applyImageZoomPan === 'function') {
            window.TemplateBuilder.applyImageZoomPan(frame);
        }
    }

    function cloneDrawPaths(paths) {
        if (!Array.isArray(paths)) return [];
        return paths.map(p => {
            const copy = Object.assign({}, p);
            if (Array.isArray(p.points)) {
                copy.points = p.points.map(pt => {
                    const ptCopy = Object.assign({}, pt);
                    if (pt.cpIn) ptCopy.cpIn = Object.assign({}, pt.cpIn);
                    if (pt.cpOut) ptCopy.cpOut = Object.assign({}, pt.cpOut);
                    return ptCopy;
                });
            }
            return copy;
        });
    }

    function captureWorkspaceLayout() {
        const cEl = document.getElementById('canvas-container');
        const canvasW = cEl ? (parseInt(cEl.style.width, 10) || cEl.offsetWidth || 1920) : 1920;
        const canvasH = cEl ? (parseInt(cEl.style.height, 10) || cEl.offsetHeight || 1080) : 1080;

        const frames = Array.from(document.querySelectorAll('.tb-image-frame')).map(frame => ({
            el: frame,
            left: frame.style.left,
            top: frame.style.top,
            width: frame.style.width,
            height: frame.style.height,
            borderRadius: frame.style.borderRadius,
            radius: frame.dataset.radius,
            origLeft: frame.dataset.origLeft,
            origTop: frame.dataset.origTop,
            origWidth: frame.dataset.origWidth,
            origHeight: frame.dataset.origHeight,
            imgPanX: frame.dataset.imgPanX,
            imgPanY: frame.dataset.imgPanY
        }));

        const customEls = collectCustomElements().map(el => ({
            el,
            left: el.style.left,
            top: el.style.top,
            width: el.style.width,
            height: el.style.height,
            fontSize: el.style.fontSize,
            padding: el.style.padding,
            borderRadius: el.style.borderRadius,
            transform: el.style.transform,
            maxWidth: el.style.maxWidth,
            whiteSpace: el.style.whiteSpace,
            scale: el.dataset.scale,
            userScale: el.dataset.userScale,
            origCanvasW: el.dataset.origCanvasW,
            origCanvasH: el.dataset.origCanvasH
        }));

        const drawSnapshot = (typeof drawPaths !== 'undefined' && Array.isArray(drawPaths))
            ? cloneDrawPaths(drawPaths)
            : null;

        return {
            canvasW,
            canvasH,
            uploadedImgW: window.uploadedImgW,
            uploadedImgH: window.uploadedImgH,
            frames,
            customEls,
            drawSnapshot
        };
    }

    function restoreWorkspaceLayout(snapshot) {
        if (!snapshot) return;

        const cEl = document.getElementById('canvas-container');
        const dEl = document.getElementById('draw-canvas');
        if (cEl && snapshot.canvasW && snapshot.canvasH) {
            cEl.style.width = snapshot.canvasW + 'px';
            cEl.style.height = snapshot.canvasH + 'px';
        }
        if (dEl && snapshot.canvasW && snapshot.canvasH) {
            dEl.width = snapshot.canvasW;
            dEl.height = snapshot.canvasH;
            dEl.style.width = snapshot.canvasW + 'px';
            dEl.style.height = snapshot.canvasH + 'px';
        }
        if (typeof window.SaberEngine !== 'undefined' && typeof window.SaberEngine.resize === 'function' && snapshot.canvasW && snapshot.canvasH) {
            window.SaberEngine.resize(snapshot.canvasW, snapshot.canvasH);
        }

        if (snapshot.uploadedImgW !== undefined) window.uploadedImgW = snapshot.uploadedImgW;
        if (snapshot.uploadedImgH !== undefined) window.uploadedImgH = snapshot.uploadedImgH;

        (snapshot.frames || []).forEach(item => {
            const f = item.el;
            if (!f || !f.parentNode) return;
            f.style.left = item.left;
            f.style.top = item.top;
            f.style.width = item.width;
            f.style.height = item.height;
            f.style.borderRadius = item.borderRadius;
            if (item.radius !== undefined) f.dataset.radius = item.radius;
            if (item.origLeft !== undefined) f.dataset.origLeft = item.origLeft;
            if (item.origTop !== undefined) f.dataset.origTop = item.origTop;
            if (item.origWidth !== undefined) f.dataset.origWidth = item.origWidth;
            if (item.origHeight !== undefined) f.dataset.origHeight = item.origHeight;
            if (item.imgPanX !== undefined) f.dataset.imgPanX = item.imgPanX;
            if (item.imgPanY !== undefined) f.dataset.imgPanY = item.imgPanY;
            refreshFrameVisuals(f);
        });

        (snapshot.customEls || []).forEach(item => {
            const el = item.el;
            if (!el || !el.parentNode) return;
            el.style.left = item.left;
            el.style.top = item.top;
            el.style.width = item.width;
            el.style.height = item.height;
            el.style.fontSize = item.fontSize;
            el.style.padding = item.padding;
            el.style.borderRadius = item.borderRadius;
            el.style.transform = item.transform;
            el.style.maxWidth = item.maxWidth;
            el.style.whiteSpace = item.whiteSpace;
            if (item.scale !== undefined) el.dataset.scale = item.scale; else delete el.dataset.scale;
            if (item.userScale !== undefined) el.dataset.userScale = item.userScale; else delete el.dataset.userScale;
            if (item.origCanvasW !== undefined) el.dataset.origCanvasW = item.origCanvasW; else delete el.dataset.origCanvasW;
            if (item.origCanvasH !== undefined) el.dataset.origCanvasH = item.origCanvasH; else delete el.dataset.origCanvasH;
        });

        if (snapshot.drawSnapshot && typeof drawPaths !== 'undefined' && Array.isArray(drawPaths)) {
            const restored = cloneDrawPaths(snapshot.drawSnapshot);
            drawPaths.splice(0, drawPaths.length, ...restored);
        }

        if (typeof window.hideVertexHandles === 'function') window.hideVertexHandles();
    }

    function rectsOverlap(a, b) {
        const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
        const iy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
        return (ix * iy) > 0;
    }

    function getOverlapRatio(a, b) {
        const areaA = Math.max(1, a.w * a.h);
        const areaB = Math.max(1, b.w * b.h);
        const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
        const iy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
        return (ix * iy) / Math.min(areaA, areaB);
    }

    function getFrameRects(frames) {
        return frames.map(el => ({
            el,
            x: parseFloat(el.style.left) || el.offsetLeft || 0,
            y: parseFloat(el.style.top) || el.offsetTop || 0,
            w: parseFloat(el.style.width) || el.offsetWidth || 300,
            h: parseFloat(el.style.height) || el.offsetHeight || 200,
            isCircle: el.dataset.isCircle === 'true'
        }));
    }

    function hasSignificantFrameOverlap(rects) {
        for (let i = 0; i < rects.length; i++) {
            for (let j = i + 1; j < rects.length; j++) {
                if (getOverlapRatio(rects[i], rects[j]) > 0.15) return true;
            }
        }
        return false;
    }

    function groupRowsByY(rects) {
        const avgH = rects.reduce((sum, r) => sum + r.h, 0) / rects.length;
        const rowTolerance = Math.max(30, avgH * 0.38);

        const byY = rects.slice().sort((a, b) => (a.y + a.h / 2) - (b.y + b.h / 2));
        const rows = [];
        byY.forEach(item => {
            const cy = item.y + item.h / 2;
            const lastRow = rows[rows.length - 1];
            if (lastRow && Math.abs(cy - lastRow.centerY) <= rowTolerance) {
                lastRow.items.push(item);
                lastRow.centerY = lastRow.items.reduce((s, r) => s + r.y + r.h / 2, 0) / lastRow.items.length;
            } else {
                rows.push({ centerY: cy, items: [item] });
            }
        });
        rows.forEach(row => row.items.sort((a, b) => (a.x + a.w / 2) - (b.x + b.w / 2)));
        return rows;
    }

    function isStructuredGrid(rects) {
        if (rects.length < 2) return false;
        const rows = groupRowsByY(rects);
        const maxPerRow = Math.max(...rows.map(r => r.items.length));
        if (maxPerRow >= 2) return true;

        // Tek dikey sütunda alt alta hizalı çerçeveler
        const xCenters = rects.map(r => r.x + r.w / 2);
        const xSpread = Math.max(...xCenters) - Math.min(...xCenters);
        const avgW = rects.reduce((s, r) => s + r.w, 0) / rects.length;
        return xSpread < avgW * 0.35;
    }

    function chooseBestGrid(rects, availW, availH, padX, padY, gap) {
        const n = rects.length;
        const rectAspects = rects.filter(r => !r.isCircle).map(r => r.w / Math.max(1, r.h));
        const targetAspect = rectAspects.length > 0
            ? rectAspects.reduce((a, b) => a + b, 0) / rectAspects.length
            : 1.25;

        let best = null;
        for (let cols = 1; cols <= n; cols++) {
            const rows = Math.ceil(n / cols);
            const cellW = (availW - padX * 2 - gap * (cols - 1)) / cols;
            const cellH = (availH - padY * 2 - gap * (rows - 1)) / rows;
            if (cellW < 80 || cellH < 80) continue;

            const emptySlots = cols * rows - n;
            const cellAspect = cellW / cellH;
            const aspectPenalty = Math.abs(Math.log(Math.max(0.1, cellAspect) / Math.max(0.1, targetAspect)));
            const extremeStripPenalty = (n >= 4 && (cols === 1 || rows === 1)) ? 1.2 : 0;
            const skinnyPenalty = (cellAspect < 0.55 || cellAspect > 2.2) ? 0.9 : 0;
            const score = aspectPenalty + (emptySlots * 0.45) + extremeStripPenalty + skinnyPenalty;

            if (!best || score < best.score) {
                best = { cols, rows, cellW, cellH, score };
            }
        }
        return best;
    }

    function scalePxString(val, s) {
        if (!val || typeof val !== 'string' || !val.includes('px')) return val;
        return val.replace(/([\d.]+)px/g, (_, num) => Math.max(1, Math.round(parseFloat(num) * s)) + 'px');
    }

    function measureAndApplyCustomScale(el, s, baseState) {
        const isWrap = el.classList.contains('callout-wrap') || el.classList.contains('co-neon-block') || el.classList.contains('svg-callout');
        el.style.maxWidth = 'none';
        if (isWrap) el.style.whiteSpace = 'nowrap';

        if (isWrap) {
            const nextScale = (baseState.scale || 1) * s;
            el.dataset.scale = nextScale;
            const rot = el.dataset.rotation || 0;
            el.style.transform = `rotate(${rot}deg) scale(${nextScale})`;
        } else {
            if (baseState.widthPx > 0) el.style.width = Math.max(16, Math.round(baseState.widthPx * s)) + 'px';
            if (baseState.heightPx > 0) el.style.height = Math.max(16, Math.round(baseState.heightPx * s)) + 'px';
            if (baseState.fontSizePx > 0) el.style.fontSize = Math.max(10, Math.round(baseState.fontSizePx * s)) + 'px';
            if (baseState.paddingStr) el.style.padding = scalePxString(baseState.paddingStr, s);
            if (baseState.borderRadiusPx > 0 && baseState.borderRadiusPx < 300) {
                el.style.borderRadius = Math.max(2, Math.round(baseState.borderRadiusPx * s)) + 'px';
            }
        }
        void el.offsetWidth;
        return {
            w: (parseFloat(el.style.width) || el.offsetWidth || baseState.w) * (isWrap ? 1 : 1),
            h: (parseFloat(el.style.height) || el.offsetHeight || baseState.h)
        };
    }

    function captureBaseItemRect(el, isFrame) {
        const x = parseFloat(el.style.left) || el.offsetLeft || 0;
        const y = parseFloat(el.style.top) || el.offsetTop || 0;
        const w = parseFloat(el.style.width) || el.offsetWidth || 120;
        const h = parseFloat(el.style.height) || el.offsetHeight || 40;
        return {
            el,
            isFrame,
            x,
            y,
            w,
            h,
            isCircle: isFrame && el.dataset.isCircle === 'true',
            radiusNum: isFrame ? (parseFloat(el.dataset.radius) || 0) : 0,
            scale: parseFloat(el.dataset.scale) || 1,
            widthPx: (el.style.width && el.style.width.endsWith('px')) ? parseFloat(el.style.width) : 0,
            heightPx: (el.style.height && el.style.height.endsWith('px') && el.style.height !== 'auto') ? parseFloat(el.style.height) : 0,
            fontSizePx: (el.style.fontSize && el.style.fontSize.endsWith('px')) ? parseFloat(el.style.fontSize) : 0,
            paddingStr: (el.style.padding && el.style.padding.includes('px')) ? el.style.padding : '',
            borderRadiusPx: (!isFrame && el.style.borderRadius && el.style.borderRadius.endsWith('px')) ? parseFloat(el.style.borderRadius) : 0
        };
    }

    function placeItemsByAnchorSpread(items, oldW, oldH, newW, newH, scale) {
        const placed = [];
        items.forEach(item => {
            let newItemW, newItemH;
            if (item.isFrame) {
                newItemW = Math.max(40, Math.round(item.w * scale));
                newItemH = Math.max(40, Math.round(item.h * scale));
                if (item.isCircle) {
                    const side = Math.min(newItemW, newItemH);
                    newItemW = side;
                    newItemH = side;
                }
                item.el.style.width = newItemW + 'px';
                item.el.style.height = newItemH + 'px';
                if (!item.isCircle && item.radiusNum > 0 && item.radiusNum < 300) {
                    item.el.style.borderRadius = Math.max(2, Math.round(item.radiusNum * scale)) + 'px';
                }
            } else {
                const dims = measureAndApplyCustomScale(item.el, scale, item);
                newItemW = Math.min(newW - 24, dims.w);
                newItemH = Math.min(newH - 24, dims.h);
            }

            const spanOldX = Math.max(1, oldW - item.w);
            const spanOldY = Math.max(1, oldH - item.h);
            const u = Math.max(0, Math.min(1, item.x / spanOldX));
            const v = Math.max(0, Math.min(1, item.y / spanOldY));

            const spanNewX = Math.max(0, newW - newItemW);
            const spanNewY = Math.max(0, newH - newItemH);

            const newX = Math.round(u * spanNewX);
            const newY = Math.round(v * spanNewY);

            item.el.style.left = newX + 'px';
            item.el.style.top = newY + 'px';
            if (item.isFrame) refreshFrameVisuals(item.el);

            placed.push({ item, x: newX, y: newY, w: newItemW, h: newItemH });
        });
        return placed;
    }

    function adaptAnchorSpread(frames, customEls, oldW, oldH, newW, newH) {
        const items = [
            ...frames.map(f => captureBaseItemRect(f, true)),
            ...customEls.map(el => captureBaseItemRect(el, false))
        ];
        if (items.length === 0) return;

        // Hangi çiftler başlangıçta çakışmıyordu kaydet
        const nonOverlappingPairs = [];
        for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
                if (!rectsOverlap(items[i], items[j])) {
                    nonOverlappingPairs.push([i, j]);
                }
            }
        }

        // Tuval alan oranına göre doğal boyut ölçeği hesapla (şerit gibi küçülmesin)
        const areaScale = Math.sqrt((newW * newH) / Math.max(1, oldW * oldH));
        let maxFitScale = 1.25;
        items.forEach(item => {
            if (item.w > 0) maxFitScale = Math.min(maxFitScale, (newW * 0.88) / item.w);
            if (item.h > 0) maxFitScale = Math.min(maxFitScale, (newH * 0.88) / item.h);
        });

        let candidateScale = Math.max(0.45, Math.min(areaScale, maxFitScale));
        const minFallbackScale = Math.max(0.4, Math.min(newW / oldW, newH / oldH));

        for (let step = 0; step < 6; step++) {
            const placed = placeItemsByAnchorSpread(items, oldW, oldH, newW, newH, candidateScale);
            const hasNewCollision = nonOverlappingPairs.some(([i, j]) => rectsOverlap(placed[i], placed[j]));
            if (!hasNewCollision || candidateScale <= minFallbackScale) break;
            candidateScale = Math.max(minFallbackScale, candidateScale * 0.9);
        }

        if (typeof window.hideVertexHandles === 'function') window.hideVertexHandles();
    }

    function trySmartReflowFrames(frames, customEls, oldW, oldH, newW, newH, hasDrawPaths) {
        if (!frames || frames.length < 2) return false;
        if (hasDrawPaths) return false;

        const hasAnchoredOverlay = customEls.some(el =>
            el.classList.contains('callout-wrap') ||
            el.classList.contains('co-neon-block') ||
            el.classList.contains('svg-callout')
        );
        if (hasAnchoredOverlay) return false;

        const oldAspect = oldW / Math.max(1, oldH);
        const newAspect = newW / Math.max(1, newH);
        if (Math.abs(newAspect - oldAspect) <= 0.18) return false;

        const rects = getFrameRects(frames);
        if (hasSignificantFrameOverlap(rects)) return false;

        const areas = rects.map(r => Math.max(1, r.w * r.h));
        if (Math.max(...areas) / Math.min(...areas) > 2.8) return false;

        // Çapraz/serbest yerleşimleri (ör. sol-üst + orta + sağ-alt) ızgaraya zorlama -> Anchor Spread'e bırak
        if (!isStructuredGrid(rects)) return false;

        // Üst/alt şeritte serbest metin veya fiyat rozeti varsa önce yerini uyarla ve güvenli şerit bırak
        const customItems = customEls.map(el => captureBaseItemRect(el, false));
        const areaScale = Math.max(0.65, Math.min(1.05, Math.sqrt((newW * newH) / Math.max(1, oldW * oldH))));

        let safeTop = 0;
        let safeBottom = newH;
        const placedCustom = [];

        if (customItems.length > 0) {
            const minFrameY = Math.min(...rects.map(r => r.y));
            const maxFrameBottom = Math.max(...rects.map(r => r.y + r.h));

            for (const cItem of customItems) {
                const inTopBand = (cItem.y + cItem.h) <= (minFrameY + 24) || (cItem.y + cItem.h / 2) < oldH * 0.25;
                const inBottomBand = cItem.y >= (maxFrameBottom - 24) || (cItem.y + cItem.h / 2) > oldH * 0.72;
                if (!inTopBand && !inBottomBand) return false;
            }

            const padEdge = Math.max(28, Math.round(Math.min(newW, newH) * 0.04));
            customItems.forEach(cItem => {
                const dims = measureAndApplyCustomScale(cItem.el, areaScale, cItem);
                const cW = Math.min(newW - padEdge * 2, dims.w);
                const cH = Math.min(newH - padEdge * 2, dims.h);
                const u = Math.max(0, Math.min(1, cItem.x / Math.max(1, oldW - cItem.w)));
                const v = Math.max(0, Math.min(1, cItem.y / Math.max(1, oldH - cItem.h)));
                const cx = Math.round(u * Math.max(0, newW - cW));
                const cy = Math.round(v * Math.max(0, newH - cH));
                cItem.el.style.left = cx + 'px';
                cItem.el.style.top = cy + 'px';
                placedCustom.push({ x: cx, y: cy, w: cW, h: cH });

                if ((cItem.y + cItem.h / 2) < oldH * 0.5) {
                    safeTop = Math.max(safeTop, cy + cH + 24);
                } else {
                    safeBottom = Math.min(safeBottom, cy - 24);
                }
            });
        }

        const regionY = safeTop;
        const regionH = safeBottom - safeTop;
        if (regionH < 240) return false;

        const padX = Math.max(24, Math.round(newW * 0.045));
        const isTallStory = (newH / Math.max(1, newW)) > 1.45;
        const padY = (placedCustom.length === 0 && isTallStory)
            ? Math.max(48, Math.round(regionH * 0.062))
            : Math.max(20, Math.round(regionH * 0.035));
        const gap = Math.max(16, Math.round(Math.min(newW, regionH) * 0.025));

        const grid = chooseBestGrid(rects, newW, regionH, padX, padY, gap);
        if (!grid) return false;

        const ordered = [];
        groupRowsByY(rects).forEach(row => ordered.push(...row.items));

        const totalItems = ordered.length;
        const lastRowIndex = Math.floor((totalItems - 1) / grid.cols);

        const finalCellW = Math.round(grid.cellW);
        let finalCellH = Math.round(grid.cellH);
        const maxBalancedH = Math.round(finalCellW * 1.25);
        if (isTallStory && finalCellH > maxBalancedH && grid.rows >= 2) {
            finalCellH = maxBalancedH;
        }

        const totalGridH = (finalCellH * grid.rows) + (gap * (grid.rows - 1));
        const startY = Math.round(regionY + (regionH - totalGridH) / 2);

        ordered.forEach((item, idx) => {
            const row = Math.floor(idx / grid.cols);
            const col = idx % grid.cols;
            const itemsInThisRow = (row === lastRowIndex) ? (totalItems - lastRowIndex * grid.cols) : grid.cols;
            const rowContentW = (finalCellW * itemsInThisRow) + (gap * (itemsInThisRow - 1));
            const rowStartX = Math.round((newW - rowContentW) / 2);

            const cellX = rowStartX + col * (finalCellW + gap);
            const cellY = startY + row * (finalCellH + gap);

            let boxW = finalCellW;
            let boxH = finalCellH;
            let boxX = cellX;
            let boxY = cellY;

            if (item.isCircle) {
                const diam = Math.min(finalCellW, finalCellH);
                boxW = diam;
                boxH = diam;
                boxX = Math.round(cellX + (finalCellW - diam) / 2);
                boxY = Math.round(cellY + (finalCellH - diam) / 2);
            }

            const f = item.el;
            f.style.left = boxX + 'px';
            f.style.top = boxY + 'px';
            f.style.width = boxW + 'px';
            f.style.height = boxH + 'px';
            refreshFrameVisuals(f);
        });

        return true;
    }

    function scaleDrawPathsProportionally(s, dx, dy) {
        if (typeof drawPaths === 'undefined' || !Array.isArray(drawPaths) || drawPaths.length === 0) return;
        drawPaths.forEach(p => {
            if (Array.isArray(p.points)) {
                p.points.forEach(pt => {
                    pt.x = pt.x * s + dx;
                    pt.y = pt.y * s + dy;
                    if (pt.cpIn) { pt.cpIn.x = pt.cpIn.x * s + dx; pt.cpIn.y = pt.cpIn.y * s + dy; }
                    if (pt.cpOut) { pt.cpOut.x = pt.cpOut.x * s + dx; pt.cpOut.y = pt.cpOut.y * s + dy; }
                });
            }
            if (typeof p.x1 !== 'undefined') {
                p.x1 = p.x1 * s + dx;
                p.y1 = p.y1 * s + dy;
                p.x2 = p.x2 * s + dx;
                p.y2 = p.y2 * s + dy;
            }
            if (p.width) p.width = Math.max(1, Math.round(p.width * s));
        });
    }

    function adaptProportionalCentered(frames, customEls, oldW, oldH, newW, newH) {
        const s = Math.min(newW / oldW, newH / oldH);
        const dx = (newW - oldW * s) / 2;
        const dy = (newH - oldH * s) / 2;

        frames.forEach(f => {
            const oldL = parseFloat(f.style.left) || 0;
            const oldT = parseFloat(f.style.top) || 0;
            const oldFW = parseFloat(f.style.width) || f.offsetWidth || 300;
            const oldFH = parseFloat(f.style.height) || f.offsetHeight || 200;

            f.style.left = Math.round(oldL * s + dx) + 'px';
            f.style.top = Math.round(oldT * s + dy) + 'px';
            f.style.width = Math.max(40, Math.round(oldFW * s)) + 'px';
            f.style.height = Math.max(40, Math.round(oldFH * s)) + 'px';

            if (f.dataset.isCircle !== 'true' && f.dataset.radius) {
                const rad = parseFloat(f.dataset.radius) || 0;
                if (rad > 0 && rad < 300) {
                    f.dataset.radius = String(Math.max(2, Math.round(rad * s)));
                }
            }
            refreshFrameVisuals(f);
        });

        customEls.forEach(el => {
            const isWrap = el.classList.contains('callout-wrap') || el.classList.contains('co-neon-block') || el.classList.contains('svg-callout');
            el.style.maxWidth = 'none';
            if (isWrap) el.style.whiteSpace = 'nowrap';

            const oldLeft = parseFloat(el.style.left);
            const oldTop = parseFloat(el.style.top);
            if (isNaN(oldLeft) || isNaN(oldTop)) return;

            if (isWrap) {
                const w = parseFloat(el.style.width) || el.offsetWidth || 0;
                const h = parseFloat(el.style.height) || el.offsetHeight || 0;
                const cxNew = (oldLeft + w / 2) * s + dx;
                const cyNew = (oldTop + h / 2) * s + dy;
                el.style.left = Math.round(cxNew - w / 2) + 'px';
                el.style.top = Math.round(cyNew - h / 2) + 'px';
                const curScale = parseFloat(el.dataset.scale) || 1;
                const nextScale = curScale * s;
                el.dataset.scale = nextScale;
                const rot = el.dataset.rotation || 0;
                el.style.transform = `rotate(${rot}deg) scale(${nextScale})`;
            } else {
                el.style.left = Math.round(oldLeft * s + dx) + 'px';
                el.style.top = Math.round(oldTop * s + dy) + 'px';
                if (el.style.width && el.style.width.endsWith('px')) {
                    el.style.width = Math.max(16, Math.round(parseFloat(el.style.width) * s)) + 'px';
                }
                if (el.style.height && el.style.height.endsWith('px') && el.style.height !== 'auto') {
                    el.style.height = Math.max(16, Math.round(parseFloat(el.style.height) * s)) + 'px';
                }
                if (el.style.fontSize && el.style.fontSize.endsWith('px')) {
                    el.style.fontSize = Math.max(8, Math.round(parseFloat(el.style.fontSize) * s)) + 'px';
                }
                if (el.style.padding && el.style.padding.includes('px')) {
                    el.style.padding = scalePxString(el.style.padding, s);
                }
            }
        });

        scaleDrawPathsProportionally(s, dx, dy);
        if (typeof window.hideVertexHandles === 'function') window.hideVertexHandles();
    }

    function adaptForFormat(oldW, oldH, newW, newH) {
        if (!oldW || !oldH || !newW || !newH || (oldW === newW && oldH === newH)) return;
        const frames = Array.from(document.querySelectorAll('.tb-image-frame'));
        const customEls = collectCustomElements();
        const hasDrawPaths = (typeof drawPaths !== 'undefined' && Array.isArray(drawPaths) && drawPaths.length > 0);

        // 1. Önce düzenli ızgara (ör. 2x3 -> 3x2) olup olmadığını kontrol et
        if (trySmartReflowFrames(frames, customEls, oldW, oldH, newW, newH, hasDrawPaths)) {
            if (typeof window.hideVertexHandles === 'function') window.hideVertexHandles();
            return;
        }

        // 2. Serbest / köşeli yerleşimlerde (çizim/ok yoksa) köşe-merkez çapa yayılımı ile tuvali doldur
        const hasAnchoredArrow = customEls.some(el =>
            el.classList.contains('callout-wrap') ||
            el.classList.contains('co-neon-block') ||
            el.classList.contains('svg-callout')
        );
        if (!hasDrawPaths && !hasAnchoredArrow && (frames.length > 0 || customEls.length > 0)) {
            adaptAnchorSpread(frames, customEls, oldW, oldH, newW, newH);
            return;
        }

        // 3. Serbest çizimler veya fotoğraf üstü ok/callout varsa piksel kilidi için orantılı merkezle
        adaptProportionalCentered(frames, customEls, oldW, oldH, newW, newH);
    }

    window.FormatLayoutAdapter = {
        captureWorkspaceLayout,
        restoreWorkspaceLayout,
        adaptForFormat
    };
})(window);
