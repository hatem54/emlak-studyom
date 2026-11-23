/**
 * Emlak Stüdyom - Evrensel Simetrik Karşıya Aynalama Modülü (Mirror Adapter)
 * Şablon çerçeveleri, 2D rozet/ikon/şekil/yazı/çizimler ve 3D ögeler için
 * orijinal ögeyi silmeden tuvalin tam karşısına içeri bakacak şekilde simetrik karşılık üretir.
 */
(function (global) {
    'use strict';

    const FLIP_PREF_KEY = 'emlak_mirror_flip_photo';

    function getCanvasDims() {
        const cc = document.getElementById('canvas-container');
        const w = cc ? (cc.offsetWidth || parseFloat(cc.style.width) || 1080) : 1080;
        const h = cc ? (cc.offsetHeight || parseFloat(cc.style.height) || 1080) : 1080;
        return { w, h, cc };
    }

    function swapBlendAxis(blend, axis) {
        if (!blend || blend === 'none') return blend || 'none';
        if (axis === 'y') {
            if (blend === 'top') return 'bottom';
            if (blend === 'bottom') return 'top';
            return blend;
        }
        if (blend === 'left') return 'right';
        if (blend === 'right') return 'left';
        return blend;
    }

    function mirrorPolygonData(frame, axis) {
        if (!frame || frame.dataset.isPolygon !== 'true' || !frame.dataset.polygonPoints) {
            return null;
        }
        try {
            const pts = JSON.parse(frame.dataset.polygonPoints);
            if (!Array.isArray(pts) || pts.length < 3) return null;
            const mirrored = pts.map(p => ({
                x: axis === 'y' ? parseFloat(p.x) : Number((100 - parseFloat(p.x)).toFixed(2)),
                y: axis === 'y' ? Number((100 - parseFloat(p.y)).toFixed(2)) : parseFloat(p.y)
            }));
            const clip = `polygon(${mirrored.map(p => `${p.x}% ${p.y}%`).join(', ')})`;
            return {
                polygonPoints: JSON.stringify(mirrored),
                polygonClip: clip
            };
        } catch (e) {
            return null;
        }
    }

    function isElementTextBearing(el) {
        if (!el || !el.classList) return false;
        if (el.classList.contains('editable-text') || el.classList.contains('custom-text-el') || el.classList.contains('custom-text-box') || el.classList.contains('tb-layout-text')) return true;
        if (el.classList.contains('callout-wrap') || el.classList.contains('co-neon-block')) return true;
        const txt = (el.innerText || '').trim();
        return txt.length > 0 && !el.classList.contains('added-icon');
    }

    function refreshElementTransform(el, rotDeg, flipX) {
        if (!el) return;
        let t = (el.style.transform || '')
            .replace(/rotate\([^)]*\)/g, '')
            .replace(/scaleX\([^)]*\)/g, '')
            .trim();
        if (rotDeg !== 0) {
            t = `${t} rotate(${rotDeg}deg)`.trim();
        }
        if (flipX) {
            t = `${t} scaleX(-1)`.trim();
        }
        el.style.transform = t || 'none';
    }

    const MirrorAdapter = {
        getFlipPhotoDefault: function () {
            try {
                const stored = localStorage.getItem(FLIP_PREF_KEY);
                return stored === null ? true : (stored !== 'false');
            } catch (e) {
                return true;
            }
        },

        setFlipPhotoDefault: function (enabled) {
            const val = !!enabled;
            try {
                localStorage.setItem(FLIP_PREF_KEY, val ? 'true' : 'false');
            } catch (e) {}
            const chk = document.getElementById('tbMirrorFlipPhotoCheck');
            if (chk && chk.checked !== val) chk.checked = val;
        },

        syncUI: function (frame) {
            const chk = document.getElementById('tbMirrorFlipPhotoCheck');
            if (chk) {
                chk.checked = this.getFlipPhotoDefault();
            }
            const toggleBtn = document.getElementById('tbMirrorFlipSelectedBtn');
            if (toggleBtn && frame) {
                toggleBtn.classList.toggle('active', frame.dataset.imgFlipX === 'true');
            }
        },

        toggleSelectedFramePhotoFlip: function () {
            const tb = global.TemplateBuilder;
            if (!tb || typeof tb.getTargetFrames !== 'function') return;
            const frames = tb.getTargetFrames();
            if (!frames || frames.length === 0) return;

            const primary = tb.selectedFrame && frames.includes(tb.selectedFrame)
                ? tb.selectedFrame
                : frames[frames.length - 1];
            const nextFlip = primary.dataset.imgFlipX !== 'true';

            frames.forEach(frame => {
                frame.dataset.imgFlipX = nextFlip ? 'true' : 'false';
                if (typeof tb.applyImageZoomPan === 'function') {
                    tb.applyImageZoomPan(frame);
                }
            });

            this.syncUI(primary);
            if (typeof global.recordHistory === 'function') {
                global.recordHistory('Çerçeve Fotoğrafı Yatay Çevrildi');
            }
        },

        mirrorFrame: function (frame, opts = {}) {
            const tb = global.TemplateBuilder;
            if (!frame || !tb || typeof tb.createImageFrame !== 'function') return null;

            const axis = opts.axis === 'y' ? 'y' : 'x';
            const shouldFlipPhoto = (opts.flipPhoto !== undefined)
                ? !!opts.flipPhoto
                : this.getFlipPhotoDefault();

            const { w: canvasW, h: canvasH } = getCanvasDims();
            const fw = frame.offsetWidth || parseFloat(frame.style.width) || 300;
            const fh = frame.offsetHeight || parseFloat(frame.style.height) || 300;
            const oldX = parseFloat(frame.style.left) || frame.offsetLeft || 0;
            const oldY = parseFloat(frame.style.top) || frame.offsetTop || 0;

            let newX = oldX;
            let newY = oldY;
            if (axis === 'y') {
                newY = Math.round(canvasH - (oldY + fh));
                if (Math.abs(newY - oldY) < 6) {
                    newY = Math.min(Math.max(0, canvasH - fh), oldY + 24);
                }
            } else {
                newX = Math.round(canvasW - (oldX + fw));
                if (Math.abs(newX - oldX) < 6) {
                    newX = Math.min(Math.max(0, canvasW - fw), oldX + 24);
                }
            }

            const oldPitch = parseFloat(frame.dataset.pitch) || 0;
            const oldYaw = parseFloat(frame.dataset.yaw) || 0;
            const oldRot = parseFloat(frame.dataset.rotation) || 0;
            const newPitch = axis === 'y' ? -oldPitch : oldPitch;
            const newYaw = axis === 'x' ? -oldYaw : oldYaw;
            const newRot = -oldRot;

            const polyMirror = mirrorPolygonData(frame, axis);
            const curFlipX = frame.dataset.imgFlipX === 'true';
            const nextFlipX = (axis === 'x' && shouldFlipPhoto) ? !curFlipX : curFlipX;
            const panX = parseFloat(frame.dataset.imgPanX) || 0;
            const nextPanX = (axis === 'x' && shouldFlipPhoto) ? -panX : panX;

            return tb.createImageFrame({
                width: fw,
                height: fh,
                x: newX,
                y: newY,
                isCircle: frame.dataset.isCircle,
                isPolygon: frame.dataset.isPolygon,
                polygonClip: polyMirror ? polyMirror.polygonClip : frame.dataset.polygonClip,
                polygonPoints: polyMirror ? polyMirror.polygonPoints : frame.dataset.polygonPoints,
                radius: frame.dataset.radius,
                borderWidth: frame.dataset.borderWidth,
                borderColor: frame.dataset.borderColor,
                shadow: frame.dataset.shadow,
                rotation: newRot,
                effect: frame.dataset.effect,
                blend: swapBlendAxis(frame.dataset.blendMode, axis),
                blendAmount: frame.dataset.blendAmount,
                opacity: frame.dataset.opacity,
                shape: frame.dataset.shape || 'none',
                pitch: newPitch,
                yaw: newYaw,
                elevation: frame.dataset.elevation || 0,
                perspective: frame.dataset.perspective || 1000,
                depth: frame.dataset.depth || 0,
                depthColor: frame.dataset.depthColor || '',
                imgZoom: frame.dataset.imgZoom,
                imgPanX: nextPanX,
                imgPanY: frame.dataset.imgPanY,
                imgFlipX: nextFlipX ? 'true' : 'false',
                photoFilters: frame.dataset.photoFilters || '',
                imgUrl: frame.dataset.imgSrc,
                skipHistory: true
            });
        },

        mirrorDrawElement: function (drawEl, opts = {}) {
            if (typeof global.duplicateDrawPath !== 'function') return null;
            const axis = opts.axis === 'y' ? 'y' : 'x';
            const { w: canvasW, h: canvasH } = getCanvasDims();
            const cloned = global.duplicateDrawPath(drawEl, 0);
            if (!cloned) return null;

            if (typeof global.drawPaths !== 'undefined' && Array.isArray(global.drawPaths)) {
                const pathObj = global.drawPaths.find(p => p && (p.el === cloned || (p.id && cloned.dataset && p.id === cloned.dataset.pathId)));
                if (pathObj && Array.isArray(pathObj.points)) {
                    pathObj.points = pathObj.points.map(pt => ({
                        x: axis === 'y' ? pt.x : (canvasW - pt.x),
                        y: axis === 'y' ? (canvasH - pt.y) : pt.y
                    }));
                    if (typeof global.redrawAll === 'function') global.redrawAll();
                    return cloned;
                }
            }

            const ew = cloned.offsetWidth || parseFloat(cloned.style.width) || 100;
            const eh = cloned.offsetHeight || parseFloat(cloned.style.height) || 100;
            const ox = parseFloat(drawEl.style.left) || drawEl.offsetLeft || 0;
            const oy = parseFloat(drawEl.style.top) || drawEl.offsetTop || 0;
            if (axis === 'y') {
                cloned.style.left = ox + 'px';
                cloned.style.top = Math.round(canvasH - (oy + eh)) + 'px';
            } else {
                cloned.style.left = Math.round(canvasW - (ox + ew)) + 'px';
                cloned.style.top = oy + 'px';
            }
            return cloned;
        },

        mirror2DElement: function (el, opts = {}) {
            if (!el || !el.parentNode) return null;
            if (el.classList.contains('tb-image-frame')) {
                return this.mirrorFrame(el, opts);
            }
            if (el.classList.contains('editable-draw') || (el.closest && el.closest('.editable-draw'))) {
                const drawEl = el.classList.contains('editable-draw') ? el : el.closest('.editable-draw');
                return this.mirrorDrawElement(drawEl, opts);
            }

            const axis = opts.axis === 'y' ? 'y' : 'x';
            const { w: canvasW, h: canvasH } = getCanvasDims();
            const ew = el.offsetWidth || parseFloat(el.style.width) || 120;
            const eh = el.offsetHeight || parseFloat(el.style.height) || 60;
            const ox = parseFloat(el.style.left) || el.offsetLeft || 0;
            const oy = parseFloat(el.style.top) || el.offsetTop || 0;

            let clone = null;
            const prevSel = Array.isArray(global.selectedElements) ? global.selectedElements.slice() : [];
            if (typeof global.multiSelectDuplicate === 'function') {
                global.selectedElements = [el];
                global.multiSelectDuplicate();
                clone = (global.selectedElements && global.selectedElements[0] && global.selectedElements[0] !== el)
                    ? global.selectedElements[0]
                    : null;
                global.selectedElements = prevSel;
            }
            if (!clone) {
                clone = el.cloneNode(true);
                if (clone.id) clone.id = 'clone_' + Math.random().toString(36).substr(2, 9);
                el.parentNode.appendChild(clone);
            }

            let newX = ox;
            let newY = oy;
            if (axis === 'y') {
                newY = Math.round(canvasH - (oy + eh));
                if (Math.abs(newY - oy) < 6) newY = Math.min(Math.max(0, canvasH - eh), oy + 24);
            } else {
                newX = Math.round(canvasW - (ox + ew));
                if (Math.abs(newX - ox) < 6) newX = Math.min(Math.max(0, canvasW - ew), ox + 24);
            }
            clone.style.left = newX + 'px';
            clone.style.top = newY + 'px';

            const oldRot = parseFloat(el.dataset.rotation) || 0;
            const newRot = -oldRot;
            clone.dataset.rotation = String(newRot);

            // Yazı içermeyen saf geometrik şekil/ikonlarda isteğe bağlı yatay form aynalaması uygula (yazıları ters çevirme!)
            const textBearing = isElementTextBearing(clone);
            const curFlip = clone.getAttribute('data-flipped-h') === 'true';
            const applyGraphicFlip = (axis === 'x' && !textBearing);
            const nextFlip = applyGraphicFlip ? !curFlip : curFlip;
            if (applyGraphicFlip) {
                clone.setAttribute('data-flipped-h', nextFlip ? 'true' : 'false');
            }
            refreshElementTransform(clone, newRot, nextFlip);

            return clone;
        },

        mirrorSelection: function (opts = {}) {
            const createdFrames = [];
            const created2D = [];
            const created3D = [];

            // 1. Seçili 3D ögeler (ThreeDEngine)
            const sel3D = (global.ThreeDGrouping && typeof global.ThreeDGrouping.getSelected3DElements === 'function')
                ? global.ThreeDGrouping.getSelected3DElements()
                : [];
            const active3D = (global.ThreeDEngine && global.ThreeDEngine.isSelected && global.ThreeDEngine.isSelected() && global.ThreeDEngine.getActiveElement)
                ? global.ThreeDEngine.getActiveElement()
                : null;
            const targets3D = sel3D.length > 0 ? sel3D : (active3D ? [active3D] : []);

            if (targets3D.length > 0 && global.ThreeDEngine && typeof global.ThreeDEngine.mirrorElement === 'function') {
                targets3D.forEach(el3d => {
                    const cloned3d = global.ThreeDEngine.mirrorElement(el3d, opts);
                    if (cloned3d) created3D.push(cloned3d);
                });
            }

            // 2. Seçili 2D ögeler & Şablon çerçeveleri
            const raw2D = (Array.isArray(global.selectedElements) && global.selectedElements.length > 0)
                ? global.selectedElements.slice()
                : ((global.TemplateBuilder && global.TemplateBuilder.selectedFrame)
                    ? [global.TemplateBuilder.selectedFrame]
                    : ((global.selectedCalloutEl || global.selectedEl) ? [global.selectedCalloutEl || global.selectedEl] : []));

            const unique2D = Array.from(new Set(raw2D
                .filter(el => el && el.parentNode)
                .map(el => (typeof el.closest === 'function' ? el.closest('.tb-image-frame, .callout-wrap, .co-neon-block, .shape-el, .added-icon, .editable-draw, .draggable, .canvas-el, [data-layer-uid]') : null) || el)
                .filter(el => el && el.parentNode)
            ));

            unique2D.forEach(el => {
                if (el.classList.contains('tb-image-frame')) {
                    const f = this.mirrorFrame(el, opts);
                    if (f) createdFrames.push(f);
                } else {
                    const c = this.mirror2DElement(el, opts);
                    if (c) created2D.push(c);
                }
            });

            // Yeni oluşan simetrik karşılığı seçili hale getir
            if (createdFrames.length === 1 && created2D.length === 0 && global.TemplateBuilder) {
                global.TemplateBuilder.selectFrame(createdFrames[0], { skipScroll: true });
            } else if (createdFrames.length + created2D.length > 0) {
                const allNew = createdFrames.concat(created2D);
                document.querySelectorAll('.el-selected, .selected').forEach(s => s.classList.remove('el-selected', 'selected'));
                allNew.forEach(n => n.classList.add('el-selected', 'selected'));
                global.selectedElements = allNew;
                global.selectedEl = allNew[allNew.length - 1];
                if (createdFrames.length > 0 && global.TemplateBuilder) {
                    global.TemplateBuilder.selectedFrame = createdFrames[createdFrames.length - 1];
                    global.TemplateBuilder.syncSettingsPanelWithFrame(global.TemplateBuilder.selectedFrame);
                    global.TemplateBuilder.updateDockControls(true);
                }
                if (typeof global.updateMultiSelectUI === 'function') global.updateMultiSelectUI();
            }

            if (created3D.length > 1 && global.ThreeDGrouping && typeof global.ThreeDGrouping.setSelected3DElements === 'function') {
                global.ThreeDGrouping.setSelected3DElements(created3D, { keep2DSelection: createdFrames.length + created2D.length > 0 });
            }

            if (typeof global.renderLayers === 'function') global.renderLayers();
            if (createdFrames.length + created2D.length + created3D.length > 0 && typeof global.recordHistory === 'function') {
                global.recordHistory('Karşıya Aynalandı', created3D.length > 0);
            }
            return createdFrames.concat(created2D, created3D);
        }
    };

    global.MirrorAdapter = MirrorAdapter;
})(typeof window !== 'undefined' ? window : this);
