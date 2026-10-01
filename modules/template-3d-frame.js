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

            const is3D = (pitch !== 0 || yaw !== 0 || elevation !== 0);

            if (is3D || roll !== 0) {
                frame.style.transform = `perspective(${perspective}px) rotateX(${pitch}deg) rotateY(${yaw}deg) rotateZ(${roll}deg) translateZ(${elevation}px)`;
                frame.style.transformStyle = 'preserve-3d';
                frame.style.transformOrigin = 'center center';
            } else {
                frame.style.transform = 'none';
                frame.style.transformStyle = 'flat';
            }

            // 3D Dinamik Zemin Gölgesi
            if (is3D) {
                const radY = (yaw * Math.PI) / 180;
                const radX = (pitch * Math.PI) / 180;
                const shX = Math.round(-Math.sin(radY) * (elevation + 24) * 0.85);
                const shY = Math.round(Math.sin(radX) * (elevation + 24) * 0.85 + (elevation * 0.45) + 10);
                const blur = Math.round(16 + (elevation * 0.55) + (Math.abs(pitch) + Math.abs(yaw)) * 0.25);
                const opacity = Math.min(0.55, 0.26 + (elevation * 0.002)).toFixed(2);

                const hasShape = (frame.dataset.shape && frame.dataset.shape !== 'none');
                const isPolygon = (frame.dataset.isPolygon === 'true');

                if (hasShape || isPolygon) {
                    frame.style.filter = `drop-shadow(${shX}px ${shY}px ${blur}px rgba(0,0,0,${opacity}))`;
                    frame.style.boxShadow = 'none';
                } else {
                    frame.style.boxShadow = `${shX}px ${shY}px ${blur}px rgba(0,0,0,${opacity})`;
                    frame.style.filter = 'none';
                }
            } else {
                // 3D eğim yoksa standart TemplateBuilder gölgesine izin ver
                if (!frame.dataset.shadow || parseInt(frame.dataset.shadow) === 0) {
                    frame.style.boxShadow = 'none';
                }
            }
        },

        /**
         * Paneldeki Değer Değişikliğini Seçili Çerçeveye Aktar
         */
        updateProp: function(prop, val) {
            const frame = (window.TemplateBuilder && window.TemplateBuilder.selectedFrame) 
                ? window.TemplateBuilder.selectedFrame 
                : document.querySelector('.tb-image-frame.selected');
            if (!frame) return;

            frame.dataset[prop] = val;

            // Yan panel sayı göstergelerini güncelle
            const pitchVal = document.getElementById('tbFramePitchVal');
            const yawVal = document.getElementById('tbFrameYawVal');
            const perspVal = document.getElementById('tbFramePerspectiveVal');
            const elevVal = document.getElementById('tbFrameElevationVal');

            if (prop === 'pitch' && pitchVal) pitchVal.textContent = val + '°';
            if (prop === 'yaw' && yawVal) yawVal.textContent = val + '°';
            if (prop === 'perspective' && perspVal) perspVal.textContent = val + 'px';
            if (prop === 'elevation' && elevVal) elevVal.textContent = val + 'px';

            this.applyTransform(frame);
            this.updateGizmoPosition(frame);
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

            if (!frame) {
                if (pitchInput) pitchInput.value = 0;
                if (pitchVal) pitchVal.textContent = '0°';
                if (yawInput) yawInput.value = 0;
                if (yawVal) yawVal.textContent = '0°';
                if (perspInput) perspInput.value = 1000;
                if (perspVal) perspVal.textContent = '1000px';
                if (elevInput) elevInput.value = 0;
                if (elevVal) elevVal.textContent = '0px';
                return;
            }

            const pitch = frame.dataset.pitch || 0;
            const yaw = frame.dataset.yaw || 0;
            const perspective = frame.dataset.perspective || 1000;
            const elevation = frame.dataset.elevation || 0;

            if (pitchInput) pitchInput.value = pitch;
            if (pitchVal) pitchVal.textContent = pitch + '°';
            if (yawInput) yawInput.value = yaw;
            if (yawVal) yawVal.textContent = yaw + '°';
            if (perspInput) perspInput.value = perspective;
            if (perspVal) perspVal.textContent = perspective + 'px';
            if (elevInput) elevInput.value = elevation;
            if (elevVal) elevVal.textContent = elevation + 'px';
        },

        /**
         * 3D Açıları Sıfırla (Düz 2D Konuma Getir)
         */
        reset3DTransform: function() {
            const frame = (window.TemplateBuilder && window.TemplateBuilder.selectedFrame) 
                ? window.TemplateBuilder.selectedFrame 
                : document.querySelector('.tb-image-frame.selected');
            if (!frame) return;

            frame.dataset.pitch = 0;
            frame.dataset.yaw = 0;
            frame.dataset.elevation = 0;
            frame.dataset.perspective = 1000;

            this.syncPanel(frame);
            this.applyTransform(frame);
            this.updateGizmoPosition(frame);
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('3D Açıları Sıfırlandı');
            }
        },

        /**
         * Hazır 3D Açı Şablonunu Uygula
         */
        applyPreset: function(presetKey) {
            const frame = (window.TemplateBuilder && window.TemplateBuilder.selectedFrame) 
                ? window.TemplateBuilder.selectedFrame 
                : document.querySelector('.tb-image-frame.selected');
            if (!frame) return;

            const presets = {
                flat:      { pitch: 0,   yaw: 0,   roll: 0,  elevation: 0 },
                isoLeft:   { pitch: 26,  yaw: -32, roll: 6,  elevation: 16 },
                isoRight:  { pitch: 26,  yaw: 32,  roll: -6, elevation: 16 },
                floor:     { pitch: 52,  yaw: 0,   roll: 0,  elevation: 8 },
                wallLeft:  { pitch: 0,   yaw: 32,  roll: 0,  elevation: 12 },
                wallRight: { pitch: 0,   yaw: -32, roll: 0,  elevation: 12 }
            };

            const p = presets[presetKey] || presets.flat;
            frame.dataset.pitch = p.pitch;
            frame.dataset.yaw = p.yaw;
            frame.dataset.elevation = p.elevation;
            if (p.roll !== undefined) {
                frame.dataset.rotation = p.roll;
                const rotInput = document.getElementById('tbFrameRotation');
                const rotVal = document.getElementById('tbFrameRotationVal');
                if (rotInput) rotInput.value = p.roll;
                if (rotVal) rotVal.textContent = p.roll + '°';
            }

            this.syncPanel(frame);
            this.applyTransform(frame);
            this.updateGizmoPosition(frame);
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
                this.hideGizmo();
            } else {
                this.showGizmo(target);
            }
        },

        /**
         * Seçili Çerçeve Üzerinde Native 3D Eksen Gizmo'yu Göster (After Effects Style)
         */
        showGizmo: function(frame) {
            if (!frame) return;

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

            const rx = (pitch * Math.PI) / 180;
            const ry = (yaw * Math.PI) / 180;
            const rz = (roll * Math.PI) / 180;

            // Oblique Axonometric 3D Projection (smooth, continuous, no snapping or jumps)
            // Z depth points at a natural isometric 135° down-left direction
            const cosA = -0.7071;
            const sinA = 0.7071;
            const sz = 0.75; // Depth scale factor

            const projectLocal = (vx, vy, vz) => {
                // 1. Roll around Z
                const x1 = vx * Math.cos(rz) - vy * Math.sin(rz);
                const y1 = vx * Math.sin(rz) + vy * Math.cos(rz);
                const z1 = vz;

                // 2. Yaw around Y
                const x2 = x1 * Math.cos(ry) + z1 * Math.sin(ry);
                const y2 = y1;
                const z2 = -x1 * Math.sin(ry) + z1 * Math.cos(ry);

                // 3. Pitch around X
                const x3 = x2;
                const y3 = y2 * Math.cos(rx) - z2 * Math.sin(rx);
                const z3 = y2 * Math.sin(rx) + z2 * Math.cos(rx);

                // 4. Smooth continuous axonometric depth projection
                // (vy is UP in local 3D, so -y3 in screen coords; Z projects along down-left depth)
                const xProj = x3 + z3 * sz * cosA;
                const yProj = -y3 + z3 * sz * sinA;

                return {
                    x: cx + xProj,
                    y: cy + yProj,
                    z: z3
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
                    const newPitch = Math.max(-60, Math.min(60, Math.round(origPitch - dy * 0.75)));
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
                    const newYaw = Math.max(-60, Math.min(60, Math.round(origYaw + dx * 0.75)));
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
                    const fRect = frame.getBoundingClientRect();
                    originScreenX = fRect.left + fRect.width / 2;
                    originScreenY = fRect.top + fRect.height / 2;
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
                    while (newRoll > 180) newRoll -= 360;
                    while (newRoll < -180) newRoll += 360;

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
            if (btn3D) {
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

            // 3D açı yoksa özel Three.js renderına gerek yok
            if (pitch === 0 && yaw === 0 && elevation === 0) return null;

            const frameW = frame.offsetWidth || 300;
            const frameH = frame.offsetHeight || 300;

            // 1. Önce çerçevenin 2D düzlemsel halini geçici bir 2D canvasa çiz
            const srcCanvas = document.createElement('canvas');
            srcCanvas.width = Math.round(frameW * supersample);
            srcCanvas.height = Math.round(frameH * supersample);
            const srcCtx = srcCanvas.getContext('2d');
            if (!srcCtx) return null;

            const img = frame.querySelector('.tb-frame-img');
            if (img && img.complete && img.naturalWidth) {
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
                if (frame.dataset.isPolygon === 'true' && frame.dataset.polygonPoints) {
                    try {
                        const pts = JSON.parse(frame.dataset.polygonPoints);
                        srcCtx.beginPath();
                        pts.forEach((pt, idx) => {
                            const px = (parseFloat(pt.x) / 100) * srcCanvas.width;
                            const py = (parseFloat(pt.y) / 100) * srcCanvas.height;
                            if (idx === 0) srcCtx.moveTo(px, py);
                            else srcCtx.lineTo(px, py);
                        });
                        srcCtx.closePath();
                        srcCtx.clip();
                    } catch(e){}
                }

                srcCtx.drawImage(img, drawX, drawY, drawW, drawH);
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

                    const planeGeo = new THREE.PlaneGeometry(frameW * supersample, frameH * supersample);
                    const planeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
                    const mesh = new THREE.Mesh(planeGeo, planeMat);

                    // Açıları Three.js uzayına aktar
                    mesh.rotation.order = 'ZYX';
                    mesh.rotation.x = THREE.MathUtils.degToRad(-pitch);
                    mesh.rotation.y = THREE.MathUtils.degToRad(yaw);
                    mesh.rotation.z = THREE.MathUtils.degToRad(-roll);
                    mesh.position.z = elevation * supersample;

                    scene.add(mesh);
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
        ['tbFramePitch', 'tbFrameYaw', 'tbFrameElevation', 'tbFramePerspective'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => {
                    if (typeof window.recordHistory === 'function') {
                        window.recordHistory('3D Eğim Parametresi Değiştirildi');
                    }
                });
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bind3DSliderHistory);
    } else {
        bind3DSliderHistory();
    }

})(window);
