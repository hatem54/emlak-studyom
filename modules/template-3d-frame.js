/**
 * ========================================================
 * EMLAK STÜDYOM - ŞABLON ÇERÇEVELERİ 3D DÜZLEM & PERSPEKTİF MOTORU
 * modules/template-3d-frame.js
 * ========================================================
 * 
 * - Çerçeveleri 3D Düzlemde Eğme, Döndürme ve Konumlandırma (Pitch, Yaw, Roll, Elevation, Perspective)
 * - Tuval Üstü İnteraktif 3D Eğim Sürükleme (Alt + Drag veya 3D Tutamaç)
 * - Dinamik Perspektif Zemin Gölgesi (Dynamic Depth Shadow)
 * - Three.js Offscreen 4K Dışa Aktarma Köprüsü (Hi-Res Export Bridge)
 */

(function(window) {
    'use strict';

    const Template3DFrame = {
        /**
         * Çerçevenin 3D Dönüşümünü ve Gölgesini Tuvale Uygula
         */
        applyTransform: function(frame) {
            if (!frame) return;

            const pitch = parseFloat(frame.dataset.pitch) || 0;
            const yaw = parseFloat(frame.dataset.yaw) || 0;
            const roll = parseFloat(frame.dataset.rotation) || 0;
            const perspective = parseFloat(frame.dataset.perspective) || 1000;
            const elevation = parseFloat(frame.dataset.elevation) || 0;
            const depth = parseFloat(frame.dataset.depth) || 0;

            const is3D = (pitch !== 0 || yaw !== 0 || elevation !== 0 || depth > 0);

            if (is3D || roll !== 0) {
                frame.style.transform = `perspective(${perspective}px) rotateX(${pitch}deg) rotateY(${yaw}deg) rotateZ(${roll}deg) translateZ(${elevation}px)`;
                frame.style.transformStyle = 'preserve-3d';
                frame.style.transformOrigin = 'center center';
            } else {
                frame.style.transform = 'none';
                frame.style.transformStyle = 'flat';
            }

            // 3D Kalınlık / Derinlik (Arkaya Doğru Extrusion)
            this.updateExtrusion(frame);

            // 3D Dinamik Zemin Gölgesi (Gölge Slider'ı ile Tam Senkronize)
            if (is3D) {
                const userSh = (frame.dataset.shadow !== undefined) ? parseFloat(frame.dataset.shadow) : 12;
                const ext = frame.querySelector('.tb-frame-extrusion');
                const backCap = ext ? ext.querySelector('.tb-depth-back') : null;
                const groundSh = ext ? ext.querySelector('.tb-ground-shadow') : null;
                if (groundSh) groundSh.remove(); // 🌟 Beyaz delik/halka yaratan içi boş div tamamen kaldırılır

                if (userSh <= 0) {
                    frame.style.boxShadow = 'none';
                    frame.style.filter = 'none';
                    if (backCap) backCap.style.boxShadow = 'none';
                } else {
                    const absElev = Math.abs(elevation);
                    const contactBlur = Math.round(userSh * 0.4 + 4);
                    const contactSpread = Math.round(userSh * 0.1 + 1);
                    const contactAlpha = Math.min(0.75, (0.30 + userSh * 0.015)).toFixed(2);

                    const diffuseY = Math.round(userSh * 0.65 + absElev * 0.4 + 4);
                    const diffuseBlur = Math.round(userSh * 1.6 + absElev * 0.6 + 14);
                    const diffuseSpread = Math.round(userSh * 0.2);
                    const diffuseAlpha = Math.min(0.65, (0.18 + userSh * 0.008)).toFixed(2);

                    // 1. Arka Kapak 3D Zemin Gölgesi (Katı gövdeden çıktığı için asla beyaz boşluk veya delik bırakmaz)
                    if (backCap && !(backCap.parentElement && backCap.parentElement.classList.contains('tb-depth-back-wrap'))) {
                        backCap.style.boxShadow = `0 2px ${contactBlur}px ${contactSpread}px rgba(0,0,0,${contactAlpha}), 0 ${diffuseY}px ${diffuseBlur}px ${diffuseSpread}px rgba(0,0,0,${diffuseAlpha})`;
                    }

                    // 2. Ana Gövde
                    const hasShape = (frame.dataset.shape && frame.dataset.shape !== 'none');
                    const isPolygon = (frame.dataset.isPolygon === 'true');

                    if (depth > 0) {
                        // 3D kalınlık varken tüm gölge tb-depth-back katı arka kapağından sızar; ana gövdeye 2D gölge verilmez
                        frame.style.boxShadow = 'none';
                        frame.style.filter = 'none';
                    } else if (hasShape || isPolygon) {
                        frame.style.filter = `drop-shadow(0 ${diffuseY}px ${diffuseBlur}px rgba(0,0,0,${diffuseAlpha}))`;
                        frame.style.boxShadow = 'none';
                    } else {
                        frame.style.boxShadow = `0 ${diffuseY}px ${diffuseBlur}px rgba(0,0,0,${diffuseAlpha})`;
                        frame.style.filter = 'none';
                    }
                }
            } else {
                // 3D eğim yoksa standart 2D TemplateBuilder gölgesini uygula
                frame.style.filter = 'none';
                const userSh = (frame.dataset.shadow !== undefined) ? parseFloat(frame.dataset.shadow) : 12;
                if (userSh > 0) {
                    frame.style.boxShadow = `0 ${Math.round(userSh * 0.6)}px ${userSh * 2}px rgba(0,0,0,0.35)`;
                } else {
                    frame.style.boxShadow = 'none';
                }
            }
        },

        /**
         * Çerçevenin Poligon / Çokgen Köşe Noktalarını Döndürür ([{x, y}, ...], 0-100 yüzdelik)
         */
        getPolygonPoints: function(frame) {
            if (!frame) return null;
            const shape = frame.dataset.shape;

            // 1. Hazır kütüphane poligon şekli varsa daima viewBox'a göre 0-100%'e normalize ederek kullan
            if (shape && shape !== 'none') {
                const list = (window.TemplateBuilder && window.TemplateBuilder.shapes)
                    || (typeof window !== 'undefined' && window.TemplateShapesData)
                    || [];
                const sDef = list.find(s => s.id === shape);
                if (sDef && sDef.polygon) {
                    if (window.TemplateBuilder && typeof window.TemplateBuilder.normalizeShapePolygonPoints === 'function') {
                        const pts = window.TemplateBuilder.normalizeShapePolygonPoints(sDef);
                        if (pts && pts.length >= 3) return pts;
                    }
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
                    if (pts.length >= 3) return pts;
                }
            }

            // 2. Serbest çokgen / dataset.polygonPoints varsa
            if (frame.dataset.polygonPoints) {
                try {
                    const parsed = typeof frame.dataset.polygonPoints === 'string'
                        ? JSON.parse(frame.dataset.polygonPoints)
                        : frame.dataset.polygonPoints;
                    if (Array.isArray(parsed) && parsed.length >= 3) {
                        return parsed.map(p => ({ x: parseFloat(p.x), y: parseFloat(p.y) }));
                    }
                } catch(e) {}
            }

            // 3. dataset.polygonClip stringi varsa (örn: polygon(50% 2%, 96% 26%, ...))
            if (frame.dataset.polygonClip) {
                const match = frame.dataset.polygonClip.match(/polygon\((.+)\)/);
                if (match && match[1]) {
                    const pairs = match[1].split(',').map(s => s.trim().replace(/%/g, ''));
                    const pts = pairs.map(str => {
                        const parts = str.trim().split(/\s+/);
                        return { x: parseFloat(parts[0]), y: parseFloat(parts[1]) };
                    }).filter(p => !isNaN(p.x) && !isNaN(p.y));
                    if (pts.length >= 3) return pts;
                }
            }

            // 4. Altıgen (polygon-hexagon) standart köşe noktaları (kütüphane yüklenmediyse yedek)
            if (shape === 'polygon-hexagon') {
                return [
                    { x: 50, y: 2 },
                    { x: 96, y: 26 },
                    { x: 96, y: 74 },
                    { x: 50, y: 98 },
                    { x: 4, y: 74 },
                    { x: 4, y: 26 }
                ];
            }

            return null;
        },

        /**
         * Şekil kütüphanesinden şekil tanımını döndürür
         */
        getShapeDef: function(shapeId) {
            if (!shapeId || shapeId === 'none') return null;
            const list = (window.TemplateBuilder && window.TemplateBuilder.shapes)
                || (typeof window !== 'undefined' && window.TemplateShapesData)
                || [];
            return list.find(s => s.id === shapeId) || null;
        },

        /**
         * SVG path şeklinin kapalı alt yollarını 0-100% koordinatlı poligon halkalarına örnekler
         */
        getShapePathLoops: function(sDef) {
            if (!sDef || !sDef.path || typeof document === 'undefined') return [];
            const vbParts = (sDef.viewBox || '0 0 100 100').trim().split(/[\s,]+/).map(Number);
            const vbX = Number.isFinite(vbParts[0]) ? vbParts[0] : 0;
            const vbY = Number.isFinite(vbParts[1]) ? vbParts[1] : 0;
            const vbW = (Number.isFinite(vbParts[2]) && vbParts[2] > 0) ? vbParts[2] : 100;
            const vbH = (Number.isFinite(vbParts[3]) && vbParts[3] > 0) ? vbParts[3] : 100;

            if (!this._scratchSvgPath) {
                this._scratchSvgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            }
            const pathEl = this._scratchSvgPath;
            const subpaths = sDef.path.trim().split(/(?=[Mm])/).map(s => s.trim()).filter(Boolean);
            const loops = [];

            for (const sub of subpaths) {
                if (!/[Zz]\s*$/.test(sub)) continue;
                try {
                    pathEl.setAttribute('d', sub);
                    const totalLen = pathEl.getTotalLength();
                    if (!Number.isFinite(totalLen) || totalLen <= 1) continue;
                    const segCount = Math.min(72, Math.max(24, Math.round(totalLen / 8)));
                    const pts = [];
                    for (let i = 0; i < segCount; i++) {
                        const pt = pathEl.getPointAtLength((i / segCount) * totalLen);
                        const nx = Math.max(0, Math.min(100, ((pt.x - vbX) / vbW) * 100));
                        const ny = Math.max(0, Math.min(100, ((pt.y - vbY) / vbH) * 100));
                        pts.push({ x: nx, y: ny });
                    }
                    if (pts.length >= 3) loops.push(pts);
                } catch (e) {}
            }
            return loops;
        },

        /**
         * Çokgen / eğrisel şekil halkaları için gerçek 3D yanal duvar panellerini üretir
         */
        buildExtrusionWallsHtml: function(loops, totalW, totalH, depth, depthColor) {
            if (!Array.isArray(loops) || loops.length === 0) return '';
            const cx = totalW / 2;
            const cy = totalH / 2;
            const halfDepth = (depth / 2).toFixed(2);
            let html = '';

            for (const loop of loops) {
                const N = loop.length;
                for (let i = 0; i < N; i++) {
                    const p1 = loop[i];
                    const p2 = loop[(i + 1) % N];

                    const x1 = (p1.x / 100) * totalW - cx;
                    const y1 = (p1.y / 100) * totalH - cy;
                    const x2 = (p2.x / 100) * totalW - cx;
                    const y2 = (p2.y / 100) * totalH - cy;

                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const edgeLen = Math.hypot(dx, dy);
                    if (edgeLen < 0.5) continue;

                    const mx = (x1 + x2) / 2;
                    const my = (y1 + y2) / 2;
                    const thetaDeg = Math.atan2(dy, dx) * (180 / Math.PI);

                    // Saat yönünde dış normal: (dy, -dx)
                    const nx = dy / edgeLen;
                    const ny = -dx / edgeLen;
                    const lightDot = nx * (-0.707) + ny * (-0.707);
                    const light = Math.max(0.45, Math.min(1.30, 0.85 + 0.40 * lightDot)).toFixed(2);

                    const wallW = (edgeLen + 1.8).toFixed(2);
                    const halfWallW = (parseFloat(wallW) / 2).toFixed(2);

                    html += `<div class="tb-polygon-wall" style="position:absolute; left:50%; top:50%; width:${wallW}px; height:${depth}px; margin-left:-${halfWallW}px; margin-top:-${halfDepth}px; background-color:${depthColor}; filter:brightness(${light}); transform:translate3d(${mx.toFixed(1)}px, ${my.toFixed(1)}px, -${halfDepth}px) rotateZ(${thetaDeg.toFixed(2)}deg) rotateX(90deg); transform-origin:center center; pointer-events:none; box-sizing:border-box; backface-visibility:visible !important;"></div>`;
                }
            }
            return html;
        },

        /**
         * 3D Çerçeve Kalınlığı / Gerçek 3D Extrusion Geometrisi (Silindirik Madalyon / Çokgen Prizma / Yaratıcı Şekil / Katı Kutu)
         */
        updateExtrusion: function(frame) {
            if (!frame) return;
            const depth = parseFloat(frame.dataset.depth) || 0;
            let ext = frame.querySelector('.tb-frame-extrusion');

            if (depth <= 0) {
                if (ext) ext.remove();
                frame.classList.remove('has-3d-depth');
                const clip = frame.querySelector('.tb-frame-clip');
                if (clip) {
                    clip.style.transform = '';
                    clip.style.background = '';
                }
                const inner = frame.querySelector('.tb-frame-inner');
                if (inner && !frame.classList.contains('has-image')) {
                    inner.style.background = '';
                }
                return;
            }

            frame.classList.add('has-3d-depth');

            if (!ext) {
                ext = document.createElement('div');
                ext.className = 'tb-frame-extrusion';
                ext.style.position = 'absolute';
                ext.style.pointerEvents = 'none';
                ext.style.transformStyle = 'preserve-3d';
                ext.style.zIndex = '0';
                frame.insertBefore(ext, frame.firstChild);
            }

            const bw = parseFloat(frame.dataset.borderWidth) || 0;
            ext.style.top = (-bw) + 'px';
            ext.style.left = (-bw) + 'px';
            ext.style.right = (-bw) + 'px';
            ext.style.bottom = (-bw) + 'px';

            const frameW = frame.offsetWidth || parseFloat(frame.style.width) || 300;
            const frameH = frame.offsetHeight || parseFloat(frame.style.height) || 300;
            const isCircle = frame.dataset.isCircle === 'true';
            const polyPoints = this.getPolygonPoints(frame);
            const isPolygon = !!(polyPoints && polyPoints.length >= 3);
            const shapeId = frame.dataset.shape || 'none';
            const shapeDef = (!isCircle && !isPolygon) ? this.getShapeDef(shapeId) : null;
            const isPathShape = !!(shapeDef && shapeDef.path);
            const depthColor = frame.dataset.depthColor || '#334155';
            const userSh = (frame.dataset.shadow !== undefined) ? parseFloat(frame.dataset.shadow) : 12;
            const elevation = parseFloat(frame.dataset.elevation) || 0;
            const absElev = Math.abs(elevation);
            const yaw = parseFloat(frame.dataset.yaw) || 0;
            const pitch = parseFloat(frame.dataset.pitch) || 0;

            let html = '';

            // 🌟 3D Organik Zemin ve Temas Gölgesi (Katı Arka Kapak tb-depth-back Üzerinde İki Katmanlı Zengin Gölge)
            // İçi boş ayrı div kullanılmaz; böylece ürün kenarı ile gölge arasında asla beyaz halka/delik oluşmaz.
            const contactBlur = Math.round(userSh * 0.4 + 4);
            const contactSpread = Math.round(userSh * 0.1 + 1);
            const contactAlpha = Math.min(0.75, (0.30 + userSh * 0.015)).toFixed(2);

            const diffuseY = Math.round(userSh * 0.65 + absElev * 0.4 + 4);
            const diffuseBlur = Math.round(userSh * 1.6 + absElev * 0.6 + 14);
            const diffuseSpread = Math.round(userSh * 0.2);
            const diffuseAlpha = Math.min(0.65, (0.18 + userSh * 0.008)).toFixed(2);

            const backShadow = userSh > 0 
                ? `0 2px ${contactBlur}px ${contactSpread}px rgba(0,0,0,${contactAlpha}), 0 ${diffuseY}px ${diffuseBlur}px ${diffuseSpread}px rgba(0,0,0,${diffuseAlpha})`
                : 'none';

            if (isCircle) {
                // 🪙 GERÇEK 3D SİLİNDİRİK MADALYON / PARA GÖVDESİ (36 Yanal Çeper Paneli)
                ext.style.borderRadius = '50%';
                ext.style.clipPath = 'none';
                ext.style.webkitClipPath = 'none';
                const totalW = Math.min(frameW, frameH) + bw * 2;
                const radius = totalW / 2;
                const N = 36;
                const dDeg = 360 / N;
                const chord = 2 * radius * Math.sin(Math.PI / N);
                const stripW = (chord + 2.5).toFixed(2); // 2.5px mikro-bindirme ile paneller arası sıfır boşluk / ışık sızıntısı
                const halfStrip = (parseFloat(stripW) / 2).toFixed(2);
                const halfDepth = (depth / 2).toFixed(2);

                for (let i = 0; i < N; i++) {
                    const deg = i * dDeg;
                    const rad = deg * (Math.PI / 180);
                    // Daire çeperindeki kesin (x, y) koordinatları
                    const x = radius * Math.sin(rad);
                    const y = -radius * Math.cos(rad);
                    // Doğal 3D ışıklandırma gradyanı
                    const light = Math.max(0.48, Math.min(1.28, 0.85 + 0.38 * Math.cos(rad + 0.6))).toFixed(2);
                    html += `<div class="tb-cylinder-strip" style="position:absolute; left:50%; top:50%; width:${stripW}px; height:${depth}px; margin-left:-${halfStrip}px; margin-top:-${halfDepth}px; background-color:${depthColor}; filter:brightness(${light}); transform:translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, -${halfDepth}px) rotateZ(${deg}deg) rotateX(90deg); transform-origin:center center; pointer-events:none; box-sizing:border-box; backface-visibility:visible !important;"></div>`;
                }

                // 🧱 Silindirik Katı İç Dolgu (Solid Infill Slices)
                const sliceStep = depth <= 20 ? 2 : (depth <= 50 ? 3 : (depth <= 100 ? 4 : (depth <= 200 ? 7 : (depth <= 350 ? 11 : 16))));
                const sliceCount = Math.max(1, Math.round(depth / sliceStep));
                for (let s = 1; s < sliceCount; s++) {
                    const z = -(s * sliceStep).toFixed(1);
                    html += `<div class="tb-depth-slice" style="position:absolute; inset:0; border-radius:50%; background-color:${depthColor}; transform:translateZ(${z}px); pointer-events:none; backface-visibility:visible !important;"></div>`;
                }

                // Madalyon Arka Kapağı (Z = -depth)
                html += `<div class="tb-depth-back" style="position:absolute; inset:0; border-radius:50%; background-color:${depthColor}; filter:brightness(0.60); transform:translateZ(-${depth}px); pointer-events:none; box-shadow:${backShadow}; backface-visibility:visible !important;"></div>`;

                // Ön Yüz Katı Taban & Kenar Kabartması
                html += `<div class="tb-depth-front" style="position:absolute; inset:0; border-radius:50%; background-color:${depthColor}; transform:translateZ(0px); pointer-events:none; backface-visibility:visible !important;"></div>`;
                html += `<div class="tb-depth-bezel" style="position:absolute; inset:0; border-radius:50%; border:2px solid ${depthColor}; filter:brightness(1.15); pointer-events:none; transform:translateZ(1px); box-sizing:border-box;"></div>`;

            } else if (isPolygon) {
                // 🛑 GERÇEK 3D ÇOKGEN PRİZMASI (ALTIGEN / POLYGON PRISM - N Adet 3D Yanal Duvar Paneli)
                ext.style.borderRadius = '0px';
                ext.style.clipPath = 'none';
                ext.style.webkitClipPath = 'none';

                const totalW = frameW + bw * 2;
                const totalH = frameH + bw * 2;
                const clipStr = `polygon(${polyPoints.map(p => `${p.x}% ${p.y}%`).join(', ')})`;

                // 1. Çokgenin her bir kenarı için gerçek 3D yanal duvar panelleri
                html += this.buildExtrusionWallsHtml([polyPoints], totalW, totalH, depth, depthColor);

                // 2. 🧱 Çokgen Katı İç Dolgu Dilimleri (Solid Infill Slices)
                const sliceStep = depth <= 20 ? 2 : (depth <= 50 ? 3 : (depth <= 100 ? 4 : (depth <= 200 ? 7 : (depth <= 350 ? 11 : 16))));
                const sliceCount = Math.max(1, Math.round(depth / sliceStep));
                for (let s = 1; s < sliceCount; s++) {
                    const z = -(s * sliceStep).toFixed(1);
                    html += `<div class="tb-depth-slice" style="position:absolute; inset:0; clip-path:${clipStr}; -webkit-clip-path:${clipStr}; background-color:${depthColor}; transform:translateZ(${z}px); pointer-events:none; backface-visibility:visible !important;"></div>`;
                }

                // 3. Çokgen Katı Arka Kapağı ve Organik Zemin Gölgesi (wrap filtresi ile)
                const polyDropShadow = userSh > 0
                    ? `drop-shadow(0 2px ${contactBlur}px rgba(0,0,0,${contactAlpha})) drop-shadow(0 ${diffuseY}px ${diffuseBlur}px rgba(0,0,0,${diffuseAlpha}))`
                    : 'none';
                html += `<div class="tb-depth-back-wrap" style="position:absolute; inset:0; transform:translateZ(-${depth}px); filter:${polyDropShadow}; pointer-events:none;"><div class="tb-depth-back" style="position:absolute; inset:0; clip-path:${clipStr}; -webkit-clip-path:${clipStr}; background-color:${depthColor}; filter:brightness(0.60); backface-visibility:visible !important;"></div></div>`;

                // 4. Ön Yüz Katı Kapak & Kenar Çerçevesi
                html += `<div class="tb-depth-front" style="position:absolute; inset:0; clip-path:${clipStr}; -webkit-clip-path:${clipStr}; background-color:${depthColor}; transform:translateZ(0px); pointer-events:none; backface-visibility:visible !important;"></div>`;

            } else if (isPathShape) {
                // 🎨 YARATICI SVG PATH ŞEKİL 3D EXTRUSION (Bulut, Fırça, Sıvı, Yırtık Kağıt, Kemer, Rozet vb.)
                ext.style.borderRadius = '0px';
                ext.style.clipPath = 'none';
                ext.style.webkitClipPath = 'none';

                const totalW = frameW + bw * 2;
                const totalH = frameH + bw * 2;
                const vbStr = shapeDef.viewBox || '0 0 100 100';
                const extrudePath = (shapeDef.id === 'frame-polaroid')
                    ? 'M 0,0 L 100,0 L 100,125 L 0,125 Z'
                    : ((shapeDef.id === 'frame-film') ? 'M 0,0 L 120,0 L 120,90 L 0,90 Z' : shapeDef.path);
                const extrudeDef = (extrudePath === shapeDef.path) ? shapeDef : Object.assign({}, shapeDef, { path: extrudePath });
                const svgMask = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbStr}" preserveAspectRatio="none"><path d="${extrudePath}" fill="#000"/></svg>`;
                const maskUrl = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMask)}")`;
                const maskStyle = `-webkit-mask-image:${maskUrl}; mask-image:${maskUrl}; -webkit-mask-size:100% 100%; mask-size:100% 100%; -webkit-mask-repeat:no-repeat; mask-repeat:no-repeat; -webkit-mask-position:center; mask-position:center;`;

                // 1. Örneklenen çevre boyunca 3D yanal duvar panelleri (dikdörtgen köşe taşması olmadan)
                const loops = this.getShapePathLoops(extrudeDef);
                html += this.buildExtrusionWallsHtml(loops, totalW, totalH, depth, depthColor);

                // 2. Şekle maskelenmiş katı dolgu katmanları
                const sliceStep = loops.length > 0
                    ? (depth <= 20 ? 3 : (depth <= 50 ? 5 : (depth <= 100 ? 8 : (depth <= 200 ? 12 : 18))))
                    : (depth <= 20 ? 2 : (depth <= 50 ? 3 : (depth <= 100 ? 4 : 8)));
                const sliceCount = Math.max(1, Math.round(depth / sliceStep));
                for (let s = 1; s < sliceCount; s++) {
                    const z = -(s * sliceStep).toFixed(1);
                    html += `<div class="tb-depth-slice" style="position:absolute; inset:0; ${maskStyle} background-color:${depthColor}; transform:translateZ(${z}px); pointer-events:none; backface-visibility:visible !important;"></div>`;
                }

                // 3. Şekil siluetine uygun arka kapak + zemin gölgesi
                const shapeDropShadow = userSh > 0
                    ? `drop-shadow(0 2px ${contactBlur}px rgba(0,0,0,${contactAlpha})) drop-shadow(0 ${diffuseY}px ${diffuseBlur}px rgba(0,0,0,${diffuseAlpha}))`
                    : 'none';
                html += `<div class="tb-depth-back-wrap" style="position:absolute; inset:0; transform:translateZ(-${depth}px); filter:${shapeDropShadow}; pointer-events:none;"><div class="tb-depth-back" style="position:absolute; inset:0; ${maskStyle} background-color:${depthColor}; filter:brightness(0.60); backface-visibility:visible !important;"></div></div>`;

                // 4. Ön yüz şekil tabanı
                html += `<div class="tb-depth-front" style="position:absolute; inset:0; ${maskStyle} background-color:${depthColor}; transform:translateZ(0px); pointer-events:none; backface-visibility:visible !important;"></div>`;

            } else {
                // 📦 GERÇEK 4 DUVARLI + KATI DOLGULU PRİZMATİK 3D KUTU GÖVDESİ (Dikdörtgen / Kare)
                const rad = (frame.dataset.radius || 0) + 'px';
                ext.style.borderRadius = rad;
                ext.style.clipPath = 'none';
                ext.style.webkitClipPath = 'none';

                // 1. Dış 4 Duvar (Top, Bottom, Left, Right - Continuous Walls)
                // Üst Duvar (Işıklı)
                html += `<div class="tb-wall-top" style="position:absolute; left:0; top:0; width:100%; height:${depth}px; transform-origin:top center; transform:rotateX(-90deg); filter:brightness(1.20); background-color:${depthColor}; pointer-events:none; backface-visibility:visible !important;"></div>`;
                // Alt Duvar (Gölgeli)
                html += `<div class="tb-wall-bottom" style="position:absolute; left:0; bottom:0; width:100%; height:${depth}px; transform-origin:bottom center; transform:rotateX(90deg); filter:brightness(0.55); background-color:${depthColor}; pointer-events:none; backface-visibility:visible !important;"></div>`;
                // Sol Duvar
                html += `<div class="tb-wall-left" style="position:absolute; left:0; top:0; width:${depth}px; height:100%; transform-origin:center left; transform:rotateY(90deg); filter:brightness(0.95); background-color:${depthColor}; pointer-events:none; backface-visibility:visible !important;"></div>`;
                // Sağ Duvar
                html += `<div class="tb-wall-right" style="position:absolute; right:0; top:0; width:${depth}px; height:100%; transform-origin:center right; transform:rotateY(-90deg); filter:brightness(0.70); background-color:${depthColor}; pointer-events:none; backface-visibility:visible !important;"></div>`;

                // 2. 🧱 KATI DOLGU KATMANLARI (Solid Infill Slices - Asla İçi Boş veya Delik Görünmez, Köşe Kavislerini 3D Besler)
                const sliceStep = depth <= 20 ? 2 : (depth <= 50 ? 3 : (depth <= 100 ? 4 : (depth <= 200 ? 7 : (depth <= 350 ? 11 : 16))));
                const sliceCount = Math.max(1, Math.round(depth / sliceStep));
                for (let s = 1; s < sliceCount; s++) {
                    const z = -(s * sliceStep).toFixed(1);
                    html += `<div class="tb-depth-slice" style="position:absolute; inset:0; border-radius:${rad}; background-color:${depthColor}; transform:translateZ(${z}px); pointer-events:none; backface-visibility:visible !important;"></div>`;
                }

                // 3. Arka Kapak (Z = -depth)
                html += `<div class="tb-depth-back" style="position:absolute; inset:0; border-radius:${rad}; background-color:${depthColor}; filter:brightness(0.60); transform:translateZ(-${depth}px); pointer-events:none; box-shadow:${backShadow}; backface-visibility:visible !important;"></div>`;

                // 4. Ön Yüz Katı Kapak & Kenar Çerçevesi
                html += `<div class="tb-depth-front" style="position:absolute; inset:0; border-radius:${rad}; background-color:${depthColor}; transform:translateZ(0px); pointer-events:none; backface-visibility:visible !important;"></div>`;
                html += `<div class="tb-depth-front-bezel" style="position:absolute; inset:0; border-radius:${rad}; border:2px solid ${depthColor}; filter:brightness(1.15); pointer-events:none; transform:translateZ(1px); box-sizing:border-box;"></div>`;
            }

            ext.innerHTML = html;
        },

        getTargetFrames: function(explicitFrame) {
            if (explicitFrame && explicitFrame.parentNode) return [explicitFrame];
            if (window.TemplateBuilder && typeof window.TemplateBuilder.getTargetFrames === 'function') {
                return window.TemplateBuilder.getTargetFrames();
            }
            const frame = (window.TemplateBuilder && window.TemplateBuilder.selectedFrame)
                ? window.TemplateBuilder.selectedFrame
                : document.querySelector('.tb-image-frame.selected');
            return frame ? [frame] : [];
        },

        /**
         * Paneldeki Değer Değişikliğini Seçili Tüm Çerçevelere Aktar
         */
        updateProp: function(prop, val, explicitFrame) {
            const frames = this.getTargetFrames(explicitFrame);
            if (frames.length === 0) return;

            const primary = (window.TemplateBuilder && window.TemplateBuilder.selectedFrame && frames.includes(window.TemplateBuilder.selectedFrame))
                ? window.TemplateBuilder.selectedFrame
                : frames[frames.length - 1];

            // Yan panel sayı göstergelerini güncelle
            const pitchVal = document.getElementById('tbFramePitchVal');
            const yawVal = document.getElementById('tbFrameYawVal');
            const perspVal = document.getElementById('tbFramePerspectiveVal');
            const elevVal = document.getElementById('tbFrameElevationVal');

            if (prop === 'pitch' && pitchVal) pitchVal.textContent = val + '°';
            if (prop === 'yaw' && yawVal) yawVal.textContent = val + '°';
            if (prop === 'perspective' && perspVal) perspVal.textContent = val + 'px';
            if (prop === 'elevation' && elevVal) elevVal.textContent = val + 'px';
            const depthVal = document.getElementById('tbFrameDepthVal');
            const depthColorInput = document.getElementById('tbFrameDepthColor');
            if (prop === 'depth') {
                const depthInput = document.getElementById('tbFrameDepth');
                if (depthInput && parseFloat(val) > parseFloat(depthInput.max)) {
                    depthInput.max = Math.max(parseFloat(val), 600);
                }
                if (depthVal) depthVal.textContent = val + 'px';
            }
            if (prop === 'depthColor' && depthColorInput) depthColorInput.value = val;

            frames.forEach(frame => {
                frame.dataset[prop] = val;
                if (prop === 'depth' && !frame.dataset.depthColor) {
                    frame.dataset.depthColor = '#334155';
                }
                this.applyTransform(frame);
            });
            this.updateGizmoPosition(primary);
        },

        /**
         * Yan Paneldeki 3D Slider Kontrollerini Seçili Çerçeveyle Senkronize Et
         */
        syncPanel: function(frame) {
            const pitchInput = document.getElementById('tbFramePitch');
            const pitchVal = document.getElementById('tbFramePitchVal');
            const yawInput = document.getElementById('tbFrameYaw');
            const yawVal = document.getElementById('tbFrameYawVal');
            const perspInput = document.getElementById('tbFramePerspective');
            const perspVal = document.getElementById('tbFramePerspectiveVal');
            const elevInput = document.getElementById('tbFrameElevation');
            const elevVal = document.getElementById('tbFrameElevationVal');
            const depthInput = document.getElementById('tbFrameDepth');
            const depthVal = document.getElementById('tbFrameDepthVal');
            const depthColorInput = document.getElementById('tbFrameDepthColor');

            if (!frame) {
                if (pitchInput) pitchInput.value = 0;
                if (pitchVal) pitchVal.textContent = '0°';
                if (yawInput) yawInput.value = 0;
                if (yawVal) yawVal.textContent = '0°';
                if (perspInput) perspInput.value = 1000;
                if (perspVal) perspVal.textContent = '1000px';
                if (elevInput) elevInput.value = 0;
                if (elevVal) elevVal.textContent = '0px';
                if (depthInput) depthInput.value = 0;
                if (depthVal) depthVal.textContent = '0px';
                return;
            }

            const pitch = frame.dataset.pitch || 0;
            const yaw = frame.dataset.yaw || 0;
            const perspective = frame.dataset.perspective || 1000;
            const elevation = frame.dataset.elevation || 0;
            const depth = frame.dataset.depth || 0;
            const depthColor = frame.dataset.depthColor || '#334155';

            if (pitchInput) pitchInput.value = pitch;
            if (pitchVal) pitchVal.textContent = pitch + '°';
            if (yawInput) yawInput.value = yaw;
            if (yawVal) yawVal.textContent = yaw + '°';
            if (perspInput) perspInput.value = perspective;
            if (perspVal) perspVal.textContent = perspective + 'px';
            if (elevInput) elevInput.value = elevation;
            if (elevVal) elevVal.textContent = elevation + 'px';
            if (depthInput) {
                if (parseFloat(depth) > parseFloat(depthInput.max)) {
                    depthInput.max = Math.max(parseFloat(depth), 600);
                }
                depthInput.value = depth;
            }
            if (depthVal) depthVal.textContent = depth + 'px';
            if (depthColorInput) depthColorInput.value = depthColor;
        },

        /**
         * 3D Açıları Sıfırla (Düz 2D Konuma Getir)
         */
        reset3DTransform: function(explicitFrame) {
            const frames = this.getTargetFrames(explicitFrame);
            if (frames.length === 0) return;

            const primary = (window.TemplateBuilder && window.TemplateBuilder.selectedFrame && frames.includes(window.TemplateBuilder.selectedFrame))
                ? window.TemplateBuilder.selectedFrame
                : frames[frames.length - 1];

            frames.forEach(frame => {
                frame.dataset.pitch = 0;
                frame.dataset.yaw = 0;
                frame.dataset.elevation = 0;
                frame.dataset.perspective = 1000;
                frame.dataset.depth = 0;
                this.applyTransform(frame);
            });

            this.syncPanel(primary);
            this.updateGizmoPosition(primary);
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('3D Açıları Sıfırlandı');
            }
        },

        /**
         * Hazır 3D Açı Şablonunu Uygula
         */
        applyPreset: function(presetKey, explicitFrame) {
            const frames = this.getTargetFrames(explicitFrame);
            if (frames.length === 0) return;

            const primary = (window.TemplateBuilder && window.TemplateBuilder.selectedFrame && frames.includes(window.TemplateBuilder.selectedFrame))
                ? window.TemplateBuilder.selectedFrame
                : frames[frames.length - 1];

            const presets = {
                flat:         { pitch: 0,   yaw: 0,   roll: 0,  elevation: 0 },
                isoLeft:      { pitch: 26,  yaw: -32, roll: 6,  elevation: 16 },
                'iso-left':   { pitch: 26,  yaw: -32, roll: 6,  elevation: 16 },
                isoRight:     { pitch: 26,  yaw: 32,  roll: -6, elevation: 16 },
                'iso-right':  { pitch: 26,  yaw: 32,  roll: -6, elevation: 16 },
                floor:        { pitch: 52,  yaw: 0,   roll: 0,  elevation: 8 },
                wallLeft:     { pitch: 0,   yaw: 32,  roll: 0,  elevation: 12 },
                'wall-left':  { pitch: 0,   yaw: 32,  roll: 0,  elevation: 12 },
                wallRight:    { pitch: 0,   yaw: -32, roll: 0,  elevation: 12 },
                'wall-right': { pitch: 0,   yaw: -32, roll: 0,  elevation: 12 }
            };

            const p = presets[presetKey] || presets.flat;
            frames.forEach(frame => {
                frame.dataset.pitch = p.pitch;
                frame.dataset.yaw = p.yaw;
                frame.dataset.elevation = p.elevation;
                if (presetKey !== 'flat') {
                    if ((parseFloat(frame.dataset.depth) || 0) <= 0) {
                        frame.dataset.depth = 25;
                    }
                    if (!frame.dataset.perspective) {
                        frame.dataset.perspective = 1200;
                    }
                    frame.dataset.has3D = 'true';
                }
                if (p.roll !== undefined) {
                    frame.dataset.rotation = p.roll;
                }
                this.applyTransform(frame);
            });

            if (p.roll !== undefined) {
                const rotInput = document.getElementById('tbFrameRotation');
                const rotVal = document.getElementById('tbFrameRotationVal');
                if (rotInput) rotInput.value = p.roll;
                if (rotVal) rotVal.textContent = p.roll + '°';
            }

            this.syncPanel(primary);
            this.updateGizmoPosition(primary);
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('3D Hazır Ayar Uygulandı');
            }
        },

        gizmoEl: null,
        activeGizmoFrame: null,
        isInteracting: false,

        /**
         * Gizmo Aktif mi?
         */
        isGizmoActive: function() {
            return !!(this.gizmoEl && this.gizmoEl.parentNode);
        },

        /**
         * 3D Gizmo'yu Tuvalden Gizle / Kaldır
         */
        hideGizmo: function() {
            if (this.gizmoEl) {
                if (this.gizmoEl.parentNode) {
                    this.gizmoEl.parentNode.removeChild(this.gizmoEl);
                }
                this.gizmoEl = null;
            }
            if (this.activeGizmoFrame) {
                const btn = this.activeGizmoFrame.querySelector('.tb-btn-3d');
                if (btn) btn.classList.remove('active');
                this.activeGizmoFrame = null;
            }
            const sideBtn = document.getElementById('tbBtn3DGizmo');
            if (sideBtn) sideBtn.classList.remove('active');
        },

        /**
         * 3D Gizmo'yu Aç / Kapat (Toggle)
         */
        toggleGizmo: function(frame) {
            const target = frame || (window.TemplateBuilder && window.TemplateBuilder.selectedFrame);
            if (!target) return;

            if (this.isGizmoActive() && this.activeGizmoFrame === target) {
                target._gizmoDismissed = true;
                this.hideGizmo();
            } else {
                delete target._gizmoDismissed;
                this.showGizmo(target);
            }
        },

        /**
         * Seçili Çerçeve Üzerinde Native 3D Eksen Gizmo'yu Göster (After Effects Style)
         */
        showGizmo: function(frame) {
            if (!frame) return;

            delete frame._gizmoDismissed;

            const cContainer = document.getElementById('canvas-container');
            if (!cContainer) return;

            if (this.gizmoEl && this.activeGizmoFrame === frame) {
                this.updateGizmoPosition(frame);
                return;
            }

            this.hideGizmo();
            this.activeGizmoFrame = frame;

            const overlay = document.createElement('div');
            overlay.id = 'tb3DGizmoOverlay';
            overlay.className = 'three-d-gizmo-overlay show-labels tb-3d-gizmo';

            overlay.innerHTML = `
                <svg id="tb3DGizmoSvg" class="three-d-gizmo-svg">
                    <defs>
                        <marker id="tbGizmoArrowX" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
                            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#ef4444"/>
                        </marker>
                        <marker id="tbGizmoArrowY" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
                            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#10b981"/>
                        </marker>
                        <marker id="tbGizmoArrowZ" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
                            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#00d2ff"/>
                        </marker>
                    </defs>
                    <!-- Şeffaf Geniş Tutma Çizgileri -->
                    <line id="tbGizmoHitX" class="three-d-gizmo-hit-line" x1="0" y1="0" x2="0" y2="0"></line>
                    <line id="tbGizmoHitY" class="three-d-gizmo-hit-line" x1="0" y1="0" x2="0" y2="0"></line>
                    <line id="tbGizmoHitZ" class="three-d-gizmo-hit-line" x1="0" y1="0" x2="0" y2="0"></line>
                    <!-- 3D Döndürme Yayları (Quadrant Arcs) -->
                    <path id="tbGizmoArcX" class="three-d-gizmo-arc three-d-gizmo-arc-x"></path>
                    <path id="tbGizmoArcY" class="three-d-gizmo-arc three-d-gizmo-arc-y"></path>
                    <path id="tbGizmoArcZ" class="three-d-gizmo-arc three-d-gizmo-arc-z"></path>
                    <!-- 3D Eksen Çizgileri ve Ok Uçları -->
                    <line id="tbGizmoLineX" class="three-d-gizmo-axis-x" x1="0" y1="0" x2="0" y2="0" marker-end="url(#tbGizmoArrowX)"></line>
                    <line id="tbGizmoLineY" class="three-d-gizmo-axis-y" x1="0" y1="0" x2="0" y2="0" marker-end="url(#tbGizmoArrowY)"></line>
                    <line id="tbGizmoLineZ" class="three-d-gizmo-axis-z" x1="0" y1="0" x2="0" y2="0" marker-end="url(#tbGizmoArrowZ)"></line>
                    <!-- Merkez Pivot Referans Noktası (Tıklanıp Sürüklenebilir) -->
                    <circle id="tbGizmoOriginDot" class="three-d-gizmo-origin-dot interactive-origin" cx="0" cy="0" r="4.5" title="Merkez Pivot: Çerçeveyi Taşı"></circle>
                </svg>
                <!-- Eksen Ucu Tutamaçları (Kaydırma / Eksen Boyunca Taşıma) -->
                <div id="tbGizmoTipX" class="three-d-gizmo-tip three-d-gizmo-tip-x" title="X Ekseni: Sol ve Sağ Taşıma">X</div>
                <div id="tbGizmoTipY" class="three-d-gizmo-tip three-d-gizmo-tip-y" title="Y Ekseni: Yukarı ve Aşağı Taşıma">Y</div>
                <div id="tbGizmoTipZ" class="three-d-gizmo-tip three-d-gizmo-tip-z" title="Z Ekseni: İleri ve Geri Derinlik">Z</div>
                <!-- Yay Üzerindeki Renkli Döndürme Noktaları (Beads / Dots) -->
                <div id="tbGizmoDotX" class="three-d-gizmo-dot three-d-gizmo-dot-x" title="Dikey Eğim: Öne ve Arkaya"><span class="three-d-gizmo-dot-lbl">Eğim</span></div>
                <div id="tbGizmoDotY" class="three-d-gizmo-dot three-d-gizmo-dot-y" title="Yatay Dönüş: Sağa ve Sola"><span class="three-d-gizmo-dot-lbl">Yatay</span></div>
                <div id="tbGizmoDotZ" class="three-d-gizmo-dot three-d-gizmo-dot-z" title="Yatırma: Sağa ve Sola"><span class="three-d-gizmo-dot-lbl">Yatır</span></div>
                <!-- Kapatma Butonu -->
                <button type="button" class="three-d-gizmo-close-btn" id="tbGizmoCloseBtn" title="3D Gizmo Kapat">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <!-- Canlı HUD Göstergesi -->
                <div id="tbGizmoHud" class="three-d-gizmo-hud"></div>
            `;

            cContainer.appendChild(overlay);
            this.gizmoEl = overlay;

            const btn = frame.querySelector('.tb-btn-3d');
            if (btn) btn.classList.add('active');

            const sideBtn = document.getElementById('tbBtn3DGizmo');
            if (sideBtn) sideBtn.classList.add('active');

            this.attachGizmoEvents(overlay, frame);
            this.updateGizmoPosition(frame);
        },

        /**
         * Çerçeve Taşındığında / Döndürüldüğünde 3D Eksen Gizmo Konumunu ve Çizgilerini Güncelle
         */
        updateGizmoPosition: function(frame) {
            if (!this.gizmoEl || !frame) return;

            const cContainer = document.getElementById('canvas-container');
            if (!cContainer) return;

            const cw = cContainer.offsetWidth || 1920;
            let sf = (typeof window.scaleFactor === 'number' && window.scaleFactor > 0) ? window.scaleFactor : null;
            if (!sf) {
                const previewArea = document.getElementById('preview-area');
                const availW = previewArea ? (previewArea.offsetWidth - 40) : 1200;
                sf = cw > 0 ? (availW / cw) : 0.62;
            }
            const referenceSf = 0.62;
            const zoomComp = Math.max(1.0, referenceSf / sf);
            this.gizmoEl.style.setProperty('--gizmo-scale', zoomComp.toFixed(3));

            const frameLeft = parseFloat(frame.style.left) || frame.offsetLeft || 0;
            const frameTop = parseFloat(frame.style.top) || frame.offsetTop || 0;
            const frameW = frame.offsetWidth || 300;
            const frameH = frame.offsetHeight || 300;
            const cx = frameLeft + frameW / 2;
            const cy = frameTop + frameH / 2;

            const pitch = parseFloat(frame.dataset.pitch) || 0;
            const yaw = parseFloat(frame.dataset.yaw) || 0;
            const roll = parseFloat(frame.dataset.rotation) || 0;
            const persp = parseFloat(frame.dataset.perspective) || 1000;

            const localRadius = Math.max(50, Math.min(130, Math.max(frameW, frameH) * 0.28));
            const arcR = localRadius * 1.15;
            const baseLen = localRadius * 1.45;

            // Oblique Axonometric 3D Projection (smooth, continuous, no snapping or jumps)
            // Z depth points at a natural isometric 135° down-left direction
            const cosA = -0.7071;
            const sinA = 0.7071;
            const sz = 0.75; // Depth scale factor

            // 🎯 Kararlı Ekran/Düzlem Koordinat Sistemi (Screen / View Space 3D Gizmo):
            // Gizmo eksenleri ve yayları çerçevenin kendi 2D/3D dönüş açılarından (özellikle yuvarlak rozet
            // döndürme ve roll açılarından) etkilenmez; tuval düzleminde daima kararlı, dik ve sabit kalır.
            // Böylece rozet dönerken gizmo fırıldak gibi dönmez, tüm tutamaçlar (Eğim, Yatay, Yatır, X, Y, Z)
            // daima ergonomik, temiz ve tahmin edilebilir standart yerlerinde kalır.
            const projectLocal = (vx, vy, vz) => {
                const xProj = vx + vz * sz * cosA;
                const yProj = -vy + vz * sz * sinA;

                return {
                    x: cx + xProj,
                    y: cy + yProj,
                    z: vz
                };
            };

            // Eksen Uçları:
            // X Ekseni: Sağ (+X)
            const pLineX = projectLocal(baseLen, 0, 0);
            // Y Ekseni: Yukarı (+Y in 3D, -Y in screen)
            const pLineY = projectLocal(0, baseLen, 0);
            // Z Ekseni: Derinlik (+Z in 3D, down-left in screen)
            const pLineZ = projectLocal(0, 0, baseLen);

            // Quadrant Arcs (Pure continuous 3D interpolation without thresholds or snapping):
            const buildArc = (vStart, vEnd, steps = 24) => {
                const pts = [];
                let midPt = null;
                for (let i = 0; i <= steps; i++) {
                    const a = (i / steps) * (Math.PI / 2);
                    const vx = (vStart.x * Math.cos(a) + vEnd.x * Math.sin(a)) * arcR;
                    const vy = (vStart.y * Math.cos(a) + vEnd.y * Math.sin(a)) * arcR;
                    const vz = (vStart.z * Math.cos(a) + vEnd.z * Math.sin(a)) * arcR;
                    const pt = projectLocal(vx, vy, vz);
                    pts.push(pt);
                    if (i === Math.floor(steps / 2)) midPt = pt;
                }
                return {
                    d: 'M ' + pts.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L '),
                    midPt: midPt
                };
            };

            // 1. Red Arc YZ (Pitch / Eğim: Y ile Z arası)
            const arcYZ = buildArc({ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 1 });
            // 2. Green Arc XZ (Yaw / Yatay: X ile Z arası)
            const arcXZ = buildArc({ x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
            // 3. Cyan Arc XY (Roll / Yatır: X ile Y arası)
            const arcXY = buildArc({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 });

            // SVG Elements update
            const lineX = this.gizmoEl.querySelector('#tbGizmoLineX');
            const lineY = this.gizmoEl.querySelector('#tbGizmoLineY');
            const lineZ = this.gizmoEl.querySelector('#tbGizmoLineZ');
            const hitX = this.gizmoEl.querySelector('#tbGizmoHitX');
            const hitY = this.gizmoEl.querySelector('#tbGizmoHitY');
            const hitZ = this.gizmoEl.querySelector('#tbGizmoHitZ');
            const arcXEl = this.gizmoEl.querySelector('#tbGizmoArcX');
            const arcYEl = this.gizmoEl.querySelector('#tbGizmoArcY');
            const arcZEl = this.gizmoEl.querySelector('#tbGizmoArcZ');
            const originDot = this.gizmoEl.querySelector('#tbGizmoOriginDot');

            if (lineX) { lineX.setAttribute('x1', cx); lineX.setAttribute('y1', cy); lineX.setAttribute('x2', pLineX.x); lineX.setAttribute('y2', pLineX.y); }
            if (lineY) { lineY.setAttribute('x1', cx); lineY.setAttribute('y1', cy); lineY.setAttribute('x2', pLineY.x); lineY.setAttribute('y2', pLineY.y); }
            if (lineZ) { lineZ.setAttribute('x1', cx); lineZ.setAttribute('y1', cy); lineZ.setAttribute('x2', pLineZ.x); lineZ.setAttribute('y2', pLineZ.y); }

            if (hitX) { hitX.setAttribute('x1', cx); hitX.setAttribute('y1', cy); hitX.setAttribute('x2', pLineX.x); hitX.setAttribute('y2', pLineX.y); }
            if (hitY) { hitY.setAttribute('x1', cx); hitY.setAttribute('y1', cy); hitY.setAttribute('x2', pLineY.x); hitY.setAttribute('y2', pLineY.y); }
            if (hitZ) { hitZ.setAttribute('x1', cx); hitZ.setAttribute('y1', cy); hitZ.setAttribute('x2', pLineZ.x); hitZ.setAttribute('y2', pLineZ.y); }

            if (arcXEl) arcXEl.setAttribute('d', arcYZ.d);
            if (arcYEl) arcYEl.setAttribute('d', arcXZ.d);
            if (arcZEl) arcZEl.setAttribute('d', arcXY.d);

            if (originDot) {
                originDot.setAttribute('cx', cx);
                originDot.setAttribute('cy', cy);
                originDot.setAttribute('r', (4.5 * zoomComp).toFixed(1));
            }

            // HTML Tips & Dots
            const tipXEl = this.gizmoEl.querySelector('#tbGizmoTipX');
            const tipYEl = this.gizmoEl.querySelector('#tbGizmoTipY');
            const tipZEl = this.gizmoEl.querySelector('#tbGizmoTipZ');
            const dotXEl = this.gizmoEl.querySelector('#tbGizmoDotX');
            const dotYEl = this.gizmoEl.querySelector('#tbGizmoDotY');
            const dotZEl = this.gizmoEl.querySelector('#tbGizmoDotZ');
            const closeBtn = this.gizmoEl.querySelector('#tbGizmoCloseBtn');

            if (tipXEl) { tipXEl.style.left = pLineX.x + 'px'; tipXEl.style.top = pLineX.y + 'px'; }
            if (tipYEl) { tipYEl.style.left = pLineY.x + 'px'; tipYEl.style.top = pLineY.y + 'px'; }
            if (tipZEl) { tipZEl.style.left = pLineZ.x + 'px'; tipZEl.style.top = pLineZ.y + 'px'; }

            if (dotXEl && arcYZ.midPt) { dotXEl.style.left = arcYZ.midPt.x + 'px'; dotXEl.style.top = arcYZ.midPt.y + 'px'; }
            if (dotYEl && arcXZ.midPt) { dotYEl.style.left = arcXZ.midPt.x + 'px'; dotYEl.style.top = arcXZ.midPt.y + 'px'; }
            if (dotZEl && arcXY.midPt) { dotZEl.style.left = arcXY.midPt.x + 'px'; dotZEl.style.top = arcXY.midPt.y + 'px'; }

            if (closeBtn) {
                closeBtn.style.left = (cx + baseLen * 0.95) + 'px';
                closeBtn.style.top = (cy - baseLen * 0.95) + 'px';
            }
        },

        /**
         * Gizmo Altındaki Açı Göstergesini Güncelle (Geriye Uyumluluk Köprüsü)
         */
        updateGizmoBadge: function(frame) {
            this.updateGizmoPosition(frame);
        },

        /**
         * Gizmo Olaylarını Dinle (Memory Gate ve Event Bubble Güvenli)
         */
        attachGizmoEvents: function(overlay, frame) {
            const self = this;
            const cContainer = document.getElementById('canvas-container');

            const getSf = () => {
                let sf = (typeof window.scaleFactor === 'number' && window.scaleFactor > 0) ? window.scaleFactor : null;
                if (!sf && cContainer) {
                    const previewArea = document.getElementById('preview-area');
                    const availW = previewArea ? (previewArea.offsetWidth - 40) : 1200;
                    const cw = cContainer.offsetWidth || 1920;
                    sf = cw > 0 ? (availW / cw) : 0.62;
                }
                return sf || 1.0;
            };

            const showHud = (text, clientX, clientY) => {
                const hud = overlay.querySelector('#tbGizmoHud');
                if (!hud) return;
                hud.textContent = text;
                hud.style.display = 'block';
                if (cContainer) {
                    const rect = cContainer.getBoundingClientRect();
                    const sf = getSf();
                    const hx = (clientX - rect.left) / sf;
                    const hy = (clientY - rect.top) / sf;
                    hud.style.left = hx + 'px';
                    hud.style.top = hy + 'px';
                }
            };

            const hideHud = () => {
                const hud = overlay.querySelector('#tbGizmoHud');
                if (hud) hud.style.display = 'none';
            };

            // Kapat butonu
            const closeBtn = overlay.querySelector('#tbGizmoCloseBtn');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    if (frame) frame._gizmoDismissed = true;
                    self.hideGizmo();
                });
            }

            // 1. Tip X & Hit X & Line X (X Ekseni Taşıma)
            const tipX = overlay.querySelector('#tbGizmoTipX');
            const lineX = overlay.querySelector('#tbGizmoLineX');
            const hitX = overlay.querySelector('#tbGizmoHitX');
            const bindTipX = (el) => {
                if (!el) return;
                let isDragging = false;
                let startClientX, origLeft;
                const onDown = (e) => {
                    if (e.button !== 0 && e.type === 'pointerdown') return;
                    isDragging = true;
                    self.isInteracting = true;
                    startClientX = e.clientX;
                    origLeft = parseFloat(frame.style.left) || frame.offsetLeft || 0;
                    try { el.setPointerCapture(e.pointerId); } catch(ex){}
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    showHud(`📍 X Konumu: ${Math.round(origLeft)}px`, e.clientX, e.clientY);
                };
                const onMove = (e) => {
                    if (!isDragging) return;
                    const sf = getSf();
                    const dx = (e.clientX - startClientX) / sf;
                    const newLeft = Math.round(origLeft + dx);
                    frame.style.left = newLeft + 'px';
                    if (window.TemplateBuilder && typeof window.TemplateBuilder.syncSettingsPanelWithFrame === 'function') {
                        window.TemplateBuilder.syncSettingsPanelWithFrame(frame);
                    }
                    self.updateGizmoPosition(frame);
                    showHud(`📍 X Konumu: ${newLeft}px`, e.clientX, e.clientY);
                };
                const onUp = (e) => {
                    if (!isDragging) return;
                    isDragging = false;
                    hideHud();
                    try { el.releasePointerCapture(e.pointerId); } catch(ex){}
                    setTimeout(() => { self.isInteracting = false; }, 80);
                };
                el.addEventListener('pointerdown', onDown);
                el.addEventListener('pointermove', onMove);
                el.addEventListener('pointerup', onUp);
                el.addEventListener('pointercancel', onUp);
            };
            bindTipX(tipX);
            bindTipX(lineX);
            bindTipX(hitX);

            // 2. Tip Y & Hit Y & Line Y (Y Ekseni Taşıma)
            const tipY = overlay.querySelector('#tbGizmoTipY');
            const lineY = overlay.querySelector('#tbGizmoLineY');
            const hitY = overlay.querySelector('#tbGizmoHitY');
            const bindTipY = (el) => {
                if (!el) return;
                let isDragging = false;
                let startClientY, origTop;
                const onDown = (e) => {
                    if (e.button !== 0 && e.type === 'pointerdown') return;
                    isDragging = true;
                    self.isInteracting = true;
                    startClientY = e.clientY;
                    origTop = parseFloat(frame.style.top) || frame.offsetTop || 0;
                    try { el.setPointerCapture(e.pointerId); } catch(ex){}
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    showHud(`📍 Y Konumu: ${Math.round(origTop)}px`, e.clientX, e.clientY);
                };
                const onMove = (e) => {
                    if (!isDragging) return;
                    const sf = getSf();
                    const dy = (e.clientY - startClientY) / sf;
                    const newTop = Math.round(origTop + dy);
                    frame.style.top = newTop + 'px';
                    if (window.TemplateBuilder && typeof window.TemplateBuilder.syncSettingsPanelWithFrame === 'function') {
                        window.TemplateBuilder.syncSettingsPanelWithFrame(frame);
                    }
                    self.updateGizmoPosition(frame);
                    showHud(`📍 Y Konumu: ${newTop}px`, e.clientX, e.clientY);
                };
                const onUp = (e) => {
                    if (!isDragging) return;
                    isDragging = false;
                    hideHud();
                    try { el.releasePointerCapture(e.pointerId); } catch(ex){}
                    setTimeout(() => { self.isInteracting = false; }, 80);
                };
                el.addEventListener('pointerdown', onDown);
                el.addEventListener('pointermove', onMove);
                el.addEventListener('pointerup', onUp);
                el.addEventListener('pointercancel', onUp);
            };
            bindTipY(tipY);
            bindTipY(lineY);
            bindTipY(hitY);

            // 3. Tip Z & Hit Z & Line Z (Derinlik / Yükseklik Taşıma)
            const tipZ = overlay.querySelector('#tbGizmoTipZ');
            const lineZ = overlay.querySelector('#tbGizmoLineZ');
            const hitZ = overlay.querySelector('#tbGizmoHitZ');
            const bindTipZ = (el) => {
                if (!el) return;
                let isDragging = false;
                let startClientY, origElev;
                const onDown = (e) => {
                    if (e.button !== 0 && e.type === 'pointerdown') return;
                    isDragging = true;
                    self.isInteracting = true;
                    startClientY = e.clientY;
                    origElev = parseFloat(frame.dataset.elevation) || 0;
                    try { el.setPointerCapture(e.pointerId); } catch(ex){}
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    showHud(`📐 Yükseklik: ${Math.round(origElev)}px`, e.clientX, e.clientY);
                };
                const onMove = (e) => {
                    if (!isDragging) return;
                    const sf = getSf();
                    const dy = (e.clientY - startClientY) / sf;
                    const newElev = Math.max(0, Math.min(150, Math.round(origElev - dy * 0.8)));
                    frame.dataset.elevation = newElev;
                    self.syncPanel(frame);
                    self.applyTransform(frame);
                    self.updateGizmoPosition(frame);
                    showHud(`📐 Yükseklik: ${newElev}px`, e.clientX, e.clientY);
                };
                const onUp = (e) => {
                    if (!isDragging) return;
                    isDragging = false;
                    hideHud();
                    try { el.releasePointerCapture(e.pointerId); } catch(ex){}
                    setTimeout(() => { self.isInteracting = false; }, 80);
                };
                el.addEventListener('pointerdown', onDown);
                el.addEventListener('pointermove', onMove);
                el.addEventListener('pointerup', onUp);
                el.addEventListener('pointercancel', onUp);
            };
            bindTipZ(tipZ);
            bindTipZ(lineZ);
            bindTipZ(hitZ);

            // 4. Dot X & Arc X (Kırmızı Yay / Dikey Eğim - Pitch)
            const dotX = overlay.querySelector('#tbGizmoDotX');
            const arcX = overlay.querySelector('#tbGizmoArcX');
            const bindDotX = (el) => {
                if (!el) return;
                let isDragging = false;
                let startClientY, origPitch;
                const onDown = (e) => {
                    if (e.button !== 0 && e.type === 'pointerdown') return;
                    isDragging = true;
                    self.isInteracting = true;
                    startClientY = e.clientY;
                    origPitch = parseFloat(frame.dataset.pitch) || 0;
                    try { el.setPointerCapture(e.pointerId); } catch(ex){}
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    showHud(`📐 Dikey Eğim: ${Math.round(origPitch)}°`, e.clientX, e.clientY);
                };
                const onMove = (e) => {
                    if (!isDragging) return;
                    const sf = getSf();
                    const dy = (e.clientY - startClientY) / sf;
                    const newPitch = Math.max(-360, Math.min(360, Math.round(origPitch - dy * 0.75)));
                    frame.dataset.pitch = newPitch;
                    self.syncPanel(frame);
                    self.applyTransform(frame);
                    self.updateGizmoPosition(frame);
                    showHud(`📐 Dikey Eğim: ${newPitch}°`, e.clientX, e.clientY);
                };
                const onUp = (e) => {
                    if (!isDragging) return;
                    isDragging = false;
                    hideHud();
                    try { el.releasePointerCapture(e.pointerId); } catch(ex){}
                    setTimeout(() => { self.isInteracting = false; }, 80);
                };
                el.addEventListener('pointerdown', onDown);
                el.addEventListener('pointermove', onMove);
                el.addEventListener('pointerup', onUp);
                el.addEventListener('pointercancel', onUp);
            };
            bindDotX(dotX);
            bindDotX(arcX);

            // 5. Dot Y & Arc Y (Yeşil Yay / Yatay Dönüş - Yaw)
            const dotY = overlay.querySelector('#tbGizmoDotY');
            const arcY = overlay.querySelector('#tbGizmoArcY');
            const bindDotY = (el) => {
                if (!el) return;
                let isDragging = false;
                let startClientX, origYaw;
                const onDown = (e) => {
                    if (e.button !== 0 && e.type === 'pointerdown') return;
                    isDragging = true;
                    self.isInteracting = true;
                    startClientX = e.clientX;
                    origYaw = parseFloat(frame.dataset.yaw) || 0;
                    try { el.setPointerCapture(e.pointerId); } catch(ex){}
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    showHud(`🔄 Yatay Dönüş: ${Math.round(origYaw)}°`, e.clientX, e.clientY);
                };
                const onMove = (e) => {
                    if (!isDragging) return;
                    const sf = getSf();
                    const dx = (e.clientX - startClientX) / sf;
                    const newYaw = Math.max(-360, Math.min(360, Math.round(origYaw + dx * 0.75)));
                    frame.dataset.yaw = newYaw;
                    self.syncPanel(frame);
                    self.applyTransform(frame);
                    self.updateGizmoPosition(frame);
                    showHud(`🔄 Yatay Dönüş: ${newYaw}°`, e.clientX, e.clientY);
                };
                const onUp = (e) => {
                    if (!isDragging) return;
                    isDragging = false;
                    hideHud();
                    try { el.releasePointerCapture(e.pointerId); } catch(ex){}
                    setTimeout(() => { self.isInteracting = false; }, 80);
                };
                el.addEventListener('pointerdown', onDown);
                el.addEventListener('pointermove', onMove);
                el.addEventListener('pointerup', onUp);
                el.addEventListener('pointercancel', onUp);
            };
            bindDotY(dotY);
            bindDotY(arcY);

            // 6. Dot Z & Arc Z (Cyan Yay / Yatırma - Roll / Rotation)
            const dotZ = overlay.querySelector('#tbGizmoDotZ');
            const arcZ = overlay.querySelector('#tbGizmoArcZ');
            const bindDotZ = (el) => {
                if (!el) return;
                let isDragging = false;
                let originScreenX = 0, originScreenY = 0;
                let prevAngle = 0, accumRoll = 0;
                const onDown = (e) => {
                    if (e.button !== 0 && e.type === 'pointerdown') return;
                    isDragging = true;
                    self.isInteracting = true;
                    const frameLeft = parseFloat(frame.style.left) || frame.offsetLeft || 0;
                    const frameTop = parseFloat(frame.style.top) || frame.offsetTop || 0;
                    const frameW = frame.offsetWidth || 300;
                    const frameH = frame.offsetHeight || 300;
                    const sf = getSf();
                    if (cContainer) {
                        const cRect = cContainer.getBoundingClientRect();
                        originScreenX = cRect.left + (frameLeft + frameW / 2) * sf;
                        originScreenY = cRect.top + (frameTop + frameH / 2) * sf;
                    } else {
                        const fRect = frame.getBoundingClientRect();
                        originScreenX = fRect.left + fRect.width / 2;
                        originScreenY = fRect.top + fRect.height / 2;
                    }
                    prevAngle = Math.atan2(e.clientY - originScreenY, e.clientX - originScreenX);
                    accumRoll = parseFloat(frame.dataset.rotation) || 0;
                    try { el.setPointerCapture(e.pointerId); } catch(ex){}
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    showHud(`📐 Yatırma: ${Math.round(accumRoll)}°`, e.clientX, e.clientY);
                };
                const onMove = (e) => {
                    if (!isDragging) return;
                    const curAngle = Math.atan2(e.clientY - originScreenY, e.clientX - originScreenX);
                    let diff = curAngle - prevAngle;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    prevAngle = curAngle;

                    accumRoll += diff * (180 / Math.PI);
                    let newRoll = Math.round(accumRoll);
                    while (newRoll > 360) newRoll -= 360;
                    while (newRoll < -360) newRoll += 360;

                    frame.dataset.rotation = newRoll;
                    const rotInput = document.getElementById('tbFrameRotation');
                    const rotVal = document.getElementById('tbFrameRotationVal');
                    if (rotInput) rotInput.value = newRoll;
                    if (rotVal) rotVal.textContent = newRoll + '°';

                    self.applyTransform(frame);
                    self.updateGizmoPosition(frame);
                    showHud(`📐 Yatırma: ${newRoll}°`, e.clientX, e.clientY);
                };
                const onUp = (e) => {
                    if (!isDragging) return;
                    isDragging = false;
                    hideHud();
                    try { el.releasePointerCapture(e.pointerId); } catch(ex){}
                    setTimeout(() => { self.isInteracting = false; }, 80);
                };
                el.addEventListener('pointerdown', onDown);
                el.addEventListener('pointermove', onMove);
                el.addEventListener('pointerup', onUp);
                el.addEventListener('pointercancel', onUp);
            };
            bindDotZ(dotZ);
            bindDotZ(arcZ);

            // 7. Merkez Pivot Referans Noktası (Çerçeveyi Serbest Taşıma)
            const originDot = overlay.querySelector('#tbGizmoOriginDot');
            if (originDot) {
                let isDragging = false;
                let startClientX, startClientY, origLeft, origTop;
                const onDown = (e) => {
                    if (e.button !== 0 && e.type === 'pointerdown') return;
                    isDragging = true;
                    self.isInteracting = true;
                    startClientX = e.clientX;
                    startClientY = e.clientY;
                    origLeft = parseFloat(frame.style.left) || frame.offsetLeft || 0;
                    origTop = parseFloat(frame.style.top) || frame.offsetTop || 0;
                    try { originDot.setPointerCapture(e.pointerId); } catch(ex){}
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    showHud(`📍 Konum: ${Math.round(origLeft)}px, ${Math.round(origTop)}px`, e.clientX, e.clientY);
                };
                const onMove = (e) => {
                    if (!isDragging) return;
                    const sf = getSf();
                    const dx = (e.clientX - startClientX) / sf;
                    const dy = (e.clientY - startClientY) / sf;
                    const newLeft = Math.round(origLeft + dx);
                    const newTop = Math.round(origTop + dy);
                    frame.style.left = newLeft + 'px';
                    frame.style.top = newTop + 'px';
                    if (window.TemplateBuilder && typeof window.TemplateBuilder.syncSettingsPanelWithFrame === 'function') {
                        window.TemplateBuilder.syncSettingsPanelWithFrame(frame);
                    }
                    self.updateGizmoPosition(frame);
                    showHud(`📍 Konum: ${newLeft}px, ${newTop}px`, e.clientX, e.clientY);
                };
                const onUp = (e) => {
                    if (!isDragging) return;
                    isDragging = false;
                    hideHud();
                    try { originDot.releasePointerCapture(e.pointerId); } catch(ex){}
                    setTimeout(() => { self.isInteracting = false; }, 80);
                };
                originDot.addEventListener('pointerdown', onDown);
                originDot.addEventListener('pointermove', onMove);
                originDot.addEventListener('pointerup', onUp);
                originDot.addEventListener('pointercancel', onUp);
            }
        },

        /**
         * Tuval Üzerinde Canlı 3D Açılandırma Olaylarını Bağla
         */
        bindInteractiveTilt: function(frame) {
            if (!frame) return;

            const btn3D = frame.querySelector('.tb-btn-3d');
            if (btn3D && btn3D.dataset.tb3dBound !== 'true') {
                btn3D.dataset.tb3dBound = 'true';
                btn3D.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    this.toggleGizmo(frame);
                });
            }
        },

        /**
         * Dışa Aktarma Köprüsü: 3D Açılı Çerçeveyi Three.js Offscreen ile 4K Rasterize Et
         */
        render3DPlaneToCanvas: async function(frame, supersample = 2) {
            const pitch = parseFloat(frame.dataset.pitch) || 0;
            const yaw = parseFloat(frame.dataset.yaw) || 0;
            const roll = parseFloat(frame.dataset.rotation) || 0;
            const elevation = parseFloat(frame.dataset.elevation) || 0;
            const depth = parseFloat(frame.dataset.depth) || 0;

            // 3D açı ve kalınlık yoksa özel Three.js renderına gerek yok
            if (pitch === 0 && yaw === 0 && elevation === 0 && depth === 0) return null;

            const frameW = frame.offsetWidth || 300;
            const frameH = frame.offsetHeight || 300;

            // 1. Önce çerçevenin 2D düzlemsel halini geçici bir 2D canvasa çiz
            const srcCanvas = document.createElement('canvas');
            srcCanvas.width = Math.round(frameW * supersample);
            srcCanvas.height = Math.round(frameH * supersample);
            const srcCtx = srcCanvas.getContext('2d');
            if (!srcCtx) return null;

            const preExportCanvas = frame.querySelector('.tb-frame-export-canvas');
            const img = frame.querySelector('.tb-frame-img');
            if (preExportCanvas && preExportCanvas.width > 0 && preExportCanvas.height > 0) {
                srcCtx.drawImage(preExportCanvas, 0, 0, srcCanvas.width, srcCanvas.height);
            } else if (img && img.complete && img.naturalWidth) {
                const zoom = parseFloat(frame.dataset.imgZoom) || 1.0;
                const panX = (parseFloat(frame.dataset.imgPanX) || 0) * supersample;
                const panY = (parseFloat(frame.dataset.imgPanY) || 0) * supersample;

                const natW = img.naturalWidth;
                const natH = img.naturalHeight;
                const coverScale = Math.max(srcCanvas.width / natW, srcCanvas.height / natH) * zoom;
                const drawW = natW * coverScale;
                const drawH = natH * coverScale;
                const drawX = (srcCanvas.width - drawW) / 2 + panX;
                const drawY = (srcCanvas.height - drawH) / 2 + panY;

                // Çokgen veya şekil maskesini 2D canvasa uygula
                const polyPts = this.getPolygonPoints(frame);
                if (polyPts && polyPts.length >= 3) {
                    srcCtx.beginPath();
                    polyPts.forEach((pt, idx) => {
                        const px = (pt.x / 100) * srcCanvas.width;
                        const py = (pt.y / 100) * srcCanvas.height;
                        if (idx === 0) srcCtx.moveTo(px, py);
                        else srcCtx.lineTo(px, py);
                    });
                    srcCtx.closePath();
                    srcCtx.clip();
                } else if (frame.dataset.isCircle === 'true') {
                    srcCtx.beginPath();
                    srcCtx.arc(srcCanvas.width / 2, srcCanvas.height / 2, Math.min(srcCanvas.width, srcCanvas.height) / 2, 0, Math.PI * 2);
                    srcCtx.closePath();
                    srcCtx.clip();
                }

                srcCtx.drawImage(img, drawX, drawY, drawW, drawH);
            } else {
                // Görsel henüz yüklenmemişse boş çerçeve ön yüzünü çiz
                const polyPts = this.getPolygonPoints(frame);
                srcCtx.fillStyle = '#f8fafc';
                if (polyPts && polyPts.length >= 3) {
                    srcCtx.beginPath();
                    polyPts.forEach((pt, idx) => {
                        const px = (pt.x / 100) * srcCanvas.width;
                        const py = (pt.y / 100) * srcCanvas.height;
                        if (idx === 0) srcCtx.moveTo(px, py);
                        else srcCtx.lineTo(px, py);
                    });
                    srcCtx.closePath();
                    srcCtx.fill();
                } else if (frame.dataset.isCircle === 'true') {
                    srcCtx.beginPath();
                    srcCtx.arc(srcCanvas.width / 2, srcCanvas.height / 2, Math.min(srcCanvas.width, srcCanvas.height) / 2, 0, Math.PI * 2);
                    srcCtx.closePath();
                    srcCtx.fill();
                } else {
                    srcCtx.fillRect(0, 0, srcCanvas.width, srcCanvas.height);
                }
            }

            // 2. Three.js mevcutsa 3D perspektif projection renderı yap
            if (window.THREE) {
                try {
                    const THREE = window.THREE;
                    const outW = Math.round(frameW * supersample * 1.5);
                    const outH = Math.round(frameH * supersample * 1.5);

                    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
                    renderer.setSize(outW, outH);
                    renderer.setClearColor(0x000000, 0);

                    const scene = new THREE.Scene();
                    const camera = new THREE.PerspectiveCamera(45, outW / outH, 1, 5000);
                    camera.position.z = 1000;

                    const texture = new THREE.CanvasTexture(srcCanvas);
                    texture.generateMipmaps = true;
                    texture.minFilter = THREE.LinearMipmapLinearFilter;

                    const meshGroup = new THREE.Group();

                    const planeGeo = new THREE.PlaneGeometry(frameW * supersample, frameH * supersample);
                    const planeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.FrontSide });
                    const mesh = new THREE.Mesh(planeGeo, planeMat);
                    mesh.position.z = 0.5;
                    meshGroup.add(mesh);

                    // 3D Kalınlık (Extrusion) Geometrisi
                    let depthGeo = null;
                    let depthMat = null;
                    if (depth > 0) {
                        const depthScaled = depth * supersample;
                        const depthColorHex = frame.dataset.depthColor || frame.dataset.borderColor || '#334155';
                        const isCircle = frame.dataset.isCircle === 'true';
                        const shapeId = frame.dataset.shape || 'none';
                        const shapeDef = (!isCircle) ? this.getShapeDef(shapeId) : null;
                        let polyPts = this.getPolygonPoints(frame);
                        if ((!polyPts || polyPts.length < 3) && shapeDef && shapeDef.path) {
                            const extrudePath = (shapeDef.id === 'frame-polaroid')
                                ? 'M 0,0 L 100,0 L 100,125 L 0,125 Z'
                                : ((shapeDef.id === 'frame-film') ? 'M 0,0 L 120,0 L 120,90 L 0,90 Z' : shapeDef.path);
                            const extrudeDef = (extrudePath === shapeDef.path) ? shapeDef : Object.assign({}, shapeDef, { path: extrudePath });
                            const loops = this.getShapePathLoops(extrudeDef);
                            if (loops && loops.length > 0) polyPts = loops[0];
                        }

                        if (isCircle) {
                            const radius = (frameW * supersample) / 2;
                            depthGeo = new THREE.CylinderGeometry(radius, radius, depthScaled, 64, 1, false);
                            depthGeo.rotateX(Math.PI / 2);
                            depthMat = new THREE.MeshStandardMaterial({ color: depthColorHex, roughness: 0.45, metalness: 0.15 });
                            const cylMesh = new THREE.Mesh(depthGeo, depthMat);
                            cylMesh.position.z = -depthScaled / 2;
                            meshGroup.add(cylMesh);
                        } else if (polyPts && polyPts.length >= 3) {
                            const shape2D = new THREE.Shape();
                            const w = frameW * supersample;
                            const h = frameH * supersample;
                            polyPts.forEach((pt, idx) => {
                                const sx = (pt.x / 100) * w - w / 2;
                                const sy = -((pt.y / 100) * h - h / 2);
                                if (idx === 0) shape2D.moveTo(sx, sy);
                                else shape2D.lineTo(sx, sy);
                            });
                            shape2D.closePath();

                            const extrudeSettings = {
                                steps: 1,
                                depth: depthScaled,
                                bevelEnabled: false
                            };
                            depthGeo = new THREE.ExtrudeGeometry(shape2D, extrudeSettings);
                            depthGeo.translate(0, 0, -depthScaled);
                            depthMat = new THREE.MeshStandardMaterial({ color: depthColorHex, roughness: 0.45, metalness: 0.15 });
                            const polyMesh = new THREE.Mesh(depthGeo, depthMat);
                            meshGroup.add(polyMesh);
                        } else {
                            depthGeo = new THREE.BoxGeometry(frameW * supersample, frameH * supersample, depthScaled);
                            depthMat = new THREE.MeshStandardMaterial({ color: depthColorHex, roughness: 0.45, metalness: 0.15 });
                            const boxMesh = new THREE.Mesh(depthGeo, depthMat);
                            boxMesh.position.z = -depthScaled / 2;
                            meshGroup.add(boxMesh);
                        }

                        scene.add(new THREE.AmbientLight(0xffffff, 0.75));
                        const dirLight = new THREE.DirectionalLight(0xffffff, 0.65);
                        dirLight.position.set(1, 1, 2);
                        scene.add(dirLight);
                    }

                    // Açıları Three.js uzayına aktar
                    meshGroup.rotation.order = 'ZYX';
                    meshGroup.rotation.x = THREE.MathUtils.degToRad(-pitch);
                    meshGroup.rotation.y = THREE.MathUtils.degToRad(yaw);
                    meshGroup.rotation.z = THREE.MathUtils.degToRad(-roll);
                    meshGroup.position.z = elevation * supersample;

                    scene.add(meshGroup);
                    renderer.render(scene, camera);

                    const resCanvas = document.createElement('canvas');
                    resCanvas.width = outW;
                    resCanvas.height = outH;
                    const resCtx = resCanvas.getContext('2d');
                    if (resCtx) {
                        resCtx.drawImage(renderer.domElement, 0, 0);
                    }

                    renderer.dispose();
                    planeGeo.dispose();
                    planeMat.dispose();
                    if (depthGeo) depthGeo.dispose();
                    if (depthMat) depthMat.dispose();
                    texture.dispose();

                    return resCanvas;
                } catch(err) {
                    console.warn('[Template3DFrame] Three.js render fallback:', err);
                }
            }

            return null;
        }
    };

    window.Template3DFrame = Template3DFrame;

    // 3D slider kontrolleri bırakıldığında geçmiş kaydet
    const bind3DSliderHistory = () => {
        ['tbFramePitch', 'tbFrameYaw', 'tbFrameElevation', 'tbFramePerspective', 'tbFrameDepth'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => {
                    if (typeof window.recordHistory === 'function') {
                        window.recordHistory('3D Eğim Parametresi Değiştirildi');
                    }
                });
            }
        });

        // 3D Kalınlık Değer Rozetine Tıklayarak Serbest Rakam Girişi (Limitsiz Özel Kalınlık - Tıkla-Yaz)
        const depthValBadge = document.getElementById('tbFrameDepthVal');
        if (depthValBadge && depthValBadge.dataset.boundClick !== 'true') {
            depthValBadge.dataset.boundClick = 'true';
            depthValBadge.style.cursor = 'pointer';
            depthValBadge.title = 'Özel 3D kalınlık girmek için tıklayın';
            depthValBadge.addEventListener('click', (e) => {
                if (depthValBadge.querySelector('input')) return; // Zaten düzenleme modunda
                e.stopPropagation();

                const sel = (window.TemplateBuilder && window.TemplateBuilder.selectedFrame)
                    || document.querySelector('.tb-image-frame.selected');
                const cur = sel ? (parseFloat(sel.dataset.depth) || 0) : (parseFloat(depthValBadge.textContent) || 0);

                const origText = depthValBadge.textContent;
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || 
                               (document.body && document.body.getAttribute('data-theme') === 'dark');

                const input = document.createElement('input');
                input.type = 'number';
                input.min = '0';
                input.max = '2000';
                input.value = cur;
                input.style.cssText = `
                    width: 48px;
                    height: 18px;
                    padding: 0 2px;
                    font-family: inherit;
                    font-size: 11px;
                    font-weight: 700;
                    text-align: center;
                    border: 1px solid #0284c7;
                    border-radius: 4px;
                    background: ${isDark ? '#1e293b' : '#ffffff'};
                    color: ${isDark ? '#f8fafc' : '#0f172a'};
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.25);
                    box-sizing: border-box;
                `;

                depthValBadge.innerHTML = '';
                depthValBadge.appendChild(input);
                input.focus();
                input.select();

                let committed = false;
                const commit = () => {
                    if (committed) return;
                    committed = true;
                    const val = parseFloat(input.value);
                    if (!isNaN(val)) {
                        const num = Math.max(0, Math.round(val));
                        const slider = document.getElementById('tbFrameDepth');
                        if (slider && num > parseFloat(slider.max)) {
                            slider.max = Math.max(num, 600);
                        }
                        if (slider) slider.value = num;
                        Template3DFrame.updateProp('depth', num);
                        depthValBadge.textContent = num + 'px';
                    } else {
                        depthValBadge.textContent = origText;
                    }
                };

                const cancel = () => {
                    if (committed) return;
                    committed = true;
                    depthValBadge.textContent = origText;
                };

                input.addEventListener('keydown', (ke) => {
                    if (ke.key === 'Enter') {
                        ke.preventDefault();
                        commit();
                    } else if (ke.key === 'Escape') {
                        ke.preventDefault();
                        cancel();
                    }
                });

                input.addEventListener('blur', commit);
            });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bind3DSliderHistory);
    } else {
        bind3DSliderHistory();
    }

})(window);
