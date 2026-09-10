/**
 * ====================================================================
 * EmlakStüdyom Pro Tone Curve Editor (Lightroom Seviye Ton Eğrisi)
 * modules/photo-curves.js
 * ====================================================================
 * 
 * Monotone Cubic Hermite Spline algoritması ile taşmasız, pürüzsüz
 * 4-kanal (RGB, Kırmızı, Yeşil, Mavi) eğri manipülasyonu, Hi-DPI
 * Retina desteği, canlı Girdi/Çıktı HUD göstergesi ve WebGL 1D LUT motoru.
 */

(function(window) {
    'use strict';

    class PhotoCurvesManager {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.activeChannel = 'rgb'; // 'rgb', 'r', 'g', 'b'
            this.dpr = 1;
            this.displayWidth = 280;
            this.displayHeight = 190;
            
            // Kanalların kontrol noktaları [x, y] (0.0 .. 1.0)
            this.curves = {
                rgb: [[0, 0], [1, 1]],
                r:   [[0, 0], [1, 1]],
                g:   [[0, 0], [1, 1]],
                b:   [[0, 0], [1, 1]]
            };

            this.selectedPointIndex = -1;
            this.isDragging = false;
            this.hoveredPointIndex = -1;
            this.currentCursorPos = null;

            // 256x4 RGBA LUT (R, G, B, Composite RGB)
            this.lut = new Uint8Array(256 * 4);
            for (let i = 0; i < 256; i++) {
                this.lut[i * 4] = i;     // R
                this.lut[i * 4 + 1] = i; // G
                this.lut[i * 4 + 2] = i; // B
                this.lut[i * 4 + 3] = i; // RGB
            }
        }

        init(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            
            this.setupHiDPI();
            this.bindEvents();
            this.updateLUT();
            this.draw();

            // Akordeon açıldığında veya pencere boyutu değiştiğinde netliği ve tam genişliği koru
            if (window.ResizeObserver && this.canvas.parentElement) {
                const ro = new ResizeObserver((entries) => {
                    for (let entry of entries) {
                        const cr = entry.contentRect;
                        if (cr && cr.width > 0 && Math.abs(cr.width - this.displayWidth) > 2) {
                            this.setupHiDPI();
                            this.draw();
                        }
                    }
                });
                ro.observe(this.canvas.parentElement);
            }

            // Details akordeon açıldığında tam genişliği anında yakala
            const accordion = document.getElementById('toneCurvesAccordion');
            if (accordion) {
                accordion.addEventListener('toggle', () => {
                    if (accordion.open) {
                        requestAnimationFrame(() => {
                            this.setupHiDPI();
                            this.draw();
                        });
                    }
                });
            }
        }

        setupHiDPI() {
            if (!this.canvas || !this.ctx) return;
            
            // Konteynerin gerçek genişliğini al (100% responsive)
            const container = this.canvas.parentElement;
            let w = container ? container.clientWidth : 0;
            if (!w || w <= 0) {
                const rect = this.canvas.getBoundingClientRect();
                w = rect.width;
            }
            if (!w || w <= 0) {
                const panel = document.getElementById('tab-photo') || document.querySelector('.panel');
                w = panel ? panel.clientWidth - 28 : 440;
            }
            if (w < 100) w = 320;

            this.displayWidth = w;
            this.displayHeight = 195;
            this.dpr = Math.max(1, window.devicePixelRatio || 1);

            // Fiziksel piksel çözünürlüğü ayarla (Retina / 4K için razor-sharp)
            this.canvas.width = Math.round(this.displayWidth * this.dpr);
            this.canvas.height = Math.round(this.displayHeight * this.dpr);

            // CSS piksel genişliği DAİMA %100 olmalı (sabit px atanırsa yarım kalır!)
            this.canvas.style.width = '100%';
            this.canvas.style.height = this.displayHeight + 'px';

            this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        }

        bindEvents() {
            if (!this.canvas) return;

            const getPos = (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                const x = Math.max(0, Math.min(1, (clientX - rect.left) / (rect.width || 1)));
                const y = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / (rect.height || 1))); // Y yukarı pozitif
                return { x, y };
            };

            const findPoint = (pos, threshold = 0.07) => {
                const pts = this.curves[this.activeChannel];
                for (let i = 0; i < pts.length; i++) {
                    const dx = pts[i][0] - pos.x;
                    const dy = pts[i][1] - pos.y;
                    if (Math.sqrt(dx * dx + dy * dy) < threshold) {
                        return i;
                    }
                }
                return -1;
            };

            // Fare / Dokunmatik İniş (Down)
            const onDown = (e) => {
                const pos = getPos(e);
                const idx = findPoint(pos);

                if (idx !== -1) {
                    this.selectedPointIndex = idx;
                    this.isDragging = true;
                } else {
                    // Yeni nokta ekle
                    const pts = this.curves[this.activeChannel];
                    if (pts.length < 12) { // Maksimum 12 nokta
                        pts.push([pos.x, pos.y]);
                        pts.sort((a, b) => a[0] - b[0]);
                        this.selectedPointIndex = pts.findIndex(p => Math.abs(p[0] - pos.x) < 0.001 && Math.abs(p[1] - pos.y) < 0.001);
                        this.isDragging = true;
                        this.onCurveChanged();
                    }
                }
                this.currentCursorPos = pos;
                this.updateHud(pos);
                this.draw();
            };

            // Hareket (Move)
            const onMove = (e) => {
                const pos = getPos(e);
                this.currentCursorPos = pos;

                if (this.isDragging && this.selectedPointIndex !== -1) {
                    const pts = this.curves[this.activeChannel];
                    const idx = this.selectedPointIndex;

                    // Uç noktaların X'i sabittir (0 ve 1)
                    if (idx === 0) {
                        pts[idx][0] = 0;
                        pts[idx][1] = pos.y;
                    } else if (idx === pts.length - 1) {
                        pts[idx][0] = 1;
                        pts[idx][1] = pos.y;
                    } else {
                        // Ara noktalar komşularının arasına sıkışır
                        const minX = pts[idx - 1][0] + 0.02;
                        const maxX = pts[idx + 1][0] - 0.02;
                        pts[idx][0] = Math.max(minX, Math.min(maxX, pos.x));
                        pts[idx][1] = pos.y;
                    }

                    this.updateHud({ x: pts[idx][0], y: pts[idx][1] });
                    this.onCurveChanged();
                    this.draw();
                } else {
                    const idx = findPoint(pos);
                    if (idx !== this.hoveredPointIndex) {
                        this.hoveredPointIndex = idx;
                        this.canvas.style.cursor = idx !== -1 ? 'grab' : 'crosshair';
                    }
                    if (idx !== -1) {
                        const pt = this.curves[this.activeChannel][idx];
                        this.updateHud({ x: pt[0], y: pt[1] });
                    } else {
                        this.updateHud(pos);
                    }
                    this.draw();
                }
            };

            // Bitiş (Up)
            const onUp = () => {
                this.isDragging = false;
                this.draw();
            };

            const onLeave = () => {
                if (!this.isDragging) {
                    this.currentCursorPos = null;
                    this.hoveredPointIndex = -1;
                    this.updateHud(null);
                    this.draw();
                }
            };

            // Çift Tıklama ile Nokta Silme
            this.canvas.addEventListener('dblclick', (e) => {
                const pos = getPos(e);
                const idx = findPoint(pos);
                const pts = this.curves[this.activeChannel];
                // Sadece ara noktalar silinebilir (0 ve son nokta kalır)
                if (idx > 0 && idx < pts.length - 1) {
                    pts.splice(idx, 1);
                    this.selectedPointIndex = -1;
                    this.hoveredPointIndex = -1;
                    this.onCurveChanged();
                    this.draw();
                }
            });

            // Sağ Tık ile Nokta Silme
            this.canvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const pos = getPos(e);
                const idx = findPoint(pos);
                const pts = this.curves[this.activeChannel];
                if (idx > 0 && idx < pts.length - 1) {
                    pts.splice(idx, 1);
                    this.selectedPointIndex = -1;
                    this.onCurveChanged();
                    this.draw();
                }
            });

            this.canvas.addEventListener('mousedown', onDown);
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
            this.canvas.addEventListener('mouseleave', onLeave);

            this.canvas.addEventListener('touchstart', onDown, { passive: true });
            window.addEventListener('touchmove', onMove, { passive: true });
            window.addEventListener('touchend', onUp);
        }

        updateHud(pos) {
            const hudEl = document.getElementById('toneCurveHud');
            if (!hudEl) return;
            const isLight = document.body.getAttribute('data-theme') === 'light';
            if (!pos) {
                hudEl.textContent = 'Girdi: -- | Çıktı: --';
                hudEl.style.color = isLight ? '#64748b' : '#94a3b8';
                return;
            }
            const inVal = Math.round(pos.x * 255);
            const outVal = Math.round(pos.y * 255);
            hudEl.textContent = `Girdi: ${inVal} | Çıktı: ${outVal}`;
            hudEl.style.color = isLight ? '#0284c7' : '#38bdf8';
        }

        setChannel(ch) {
            if (!['rgb', 'r', 'g', 'b'].includes(ch)) return;
            this.activeChannel = ch;
            this.selectedPointIndex = -1;
            this.hoveredPointIndex = -1;
            this.draw();
            
            // Buton stillerini güncelle
            document.querySelectorAll('.curve-channel-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.channel === ch);
            });
        }

        resetActiveChannel() {
            this.curves[this.activeChannel] = [[0, 0], [1, 1]];
            this.selectedPointIndex = -1;
            this.onCurveChanged();
            this.draw();
        }

        resetAllChannels() {
            this.curves = {
                rgb: [[0, 0], [1, 1]],
                r:   [[0, 0], [1, 1]],
                g:   [[0, 0], [1, 1]],
                b:   [[0, 0], [1, 1]]
            };
            this.selectedPointIndex = -1;
            this.onCurveChanged();
            this.draw();
        }

        applyPreset(name) {
            const presets = {
                linear:         [[0, 0], [1, 1]],
                mediumContrast: [[0, 0], [0.25, 0.18], [0.75, 0.82], [1, 1]],
                highContrast:   [[0, 0], [0.20, 0.10], [0.80, 0.90], [1, 1]],
                liftShadows:    [[0, 0.14], [0.35, 0.44], [1, 1]],
                matte:          [[0, 0.08], [0.25, 0.22], [0.75, 0.78], [1, 0.92]],
                vintageWarmth:  {
                    rgb: [[0, 0.05], [0.5, 0.5], [1, 0.95]],
                    r:   [[0, 0.04], [1, 1]],
                    b:   [[0, 0], [1, 0.92]]
                }
            };

            if (name === 'vintageWarmth') {
                this.curves.rgb = [[0, 0.05], [0.5, 0.5], [1, 0.95]];
                this.curves.r = [[0, 0.04], [1, 1]];
                this.curves.b = [[0, 0], [1, 0.92]];
            } else if (presets[name]) {
                this.curves[this.activeChannel] = JSON.parse(JSON.stringify(presets[name]));
            }
            this.selectedPointIndex = -1;
            this.onCurveChanged();
            this.draw();
        }

        /**
         * Monotone Cubic Hermite Spline hesaplar (Osilasyonsuz, pürüzsüz)
         */
        calculateSplineSamples(points) {
            const n = points.length;
            if (n === 2) {
                const m = (points[1][1] - points[0][1]) / (points[1][0] - points[0][0] || 0.0001);
                const samples = new Float32Array(256);
                for (let i = 0; i < 256; i++) {
                    const x = i / 255;
                    samples[i] = Math.max(0, Math.min(1, points[0][1] + m * (x - points[0][0])));
                }
                return samples;
            }

            const d = new Float32Array(n - 1);
            const m = new Float32Array(n);

            for (let i = 0; i < n - 1; i++) {
                const dx = points[i + 1][0] - points[i][0];
                const dy = points[i + 1][1] - points[i][1];
                d[i] = dy / (dx || 0.0001);
            }

            m[0] = d[0];
            m[n - 1] = d[n - 2];
            for (let i = 1; i < n - 1; i++) {
                m[i] = (d[i - 1] + d[i]) * 0.5;
            }

            for (let i = 0; i < n - 1; i++) {
                if (Math.abs(d[i]) < 0.00001) {
                    m[i] = 0;
                    m[i + 1] = 0;
                } else {
                    const a = m[i] / d[i];
                    const b = m[i + 1] / d[i];
                    const h = Math.hypot(a, b);
                    if (h > 9) {
                        const tau = 3 / h;
                        m[i] = tau * a * d[i];
                        m[i + 1] = tau * b * d[i];
                    }
                }
            }

            const samples = new Float32Array(256);
            let k = 0;
            for (let i = 0; i < 256; i++) {
                const x = i / 255;
                while (k < n - 2 && points[k + 1][0] < x) {
                    k++;
                }

                const hx = points[k + 1][0] - points[k][0];
                const t = (x - points[k][0]) / (hx || 0.0001);
                const t2 = t * t;
                const t3 = t2 * t;

                const h00 = 2 * t3 - 3 * t2 + 1;
                const h10 = t3 - 2 * t2 + t;
                const h01 = -2 * t3 + 3 * t2;
                const h11 = t3 - t2;

                const val = h00 * points[k][1] + h10 * hx * m[k] + h01 * points[k + 1][1] + h11 * hx * m[k + 1];
                samples[i] = Math.max(0, Math.min(1, val));
            }
            return samples;
        }

        updateLUT() {
            const redSamples   = this.calculateSplineSamples(this.curves.r);
            const greenSamples = this.calculateSplineSamples(this.curves.g);
            const blueSamples  = this.calculateSplineSamples(this.curves.b);
            const rgbSamples   = this.calculateSplineSamples(this.curves.rgb);

            for (let i = 0; i < 256; i++) {
                this.lut[i * 4]     = Math.round(redSamples[i] * 255);
                this.lut[i * 4 + 1] = Math.round(greenSamples[i] * 255);
                this.lut[i * 4 + 2] = Math.round(blueSamples[i] * 255);
                this.lut[i * 4 + 3] = Math.round(rgbSamples[i] * 255);
            }

            if (window.WebGLPhotoEngine && typeof window.WebGLPhotoEngine.updateCurveTexture === 'function') {
                window.WebGLPhotoEngine.updateCurveTexture(this.lut);
            }
        }

        onCurveChanged() {
            this.updateLUT();
            if (typeof window.applyPhotoFilters === 'function') {
                window.applyPhotoFilters();
            }
        }

        draw() {
            if (!this.canvas || !this.ctx) return;
            const ctx = this.ctx;
            const w = this.displayWidth;
            const h = this.displayHeight;

            ctx.clearRect(0, 0, w, h);

            // 1. Sleek Pro Koyu Arka Plan
            const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
            bgGrad.addColorStop(0, '#0b1120');
            bgGrad.addColorStop(1, '#070b14');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);

            // 2. Lightroom Çeyrek Ton Kılavuz Çizgileri (%25, %50, %75)
            ctx.lineWidth = 1;
            const gridP = [0.25, 0.5, 0.75];
            gridP.forEach((p, idx) => {
                ctx.strokeStyle = idx === 1 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.06)';
                // Dikey
                ctx.beginPath();
                ctx.moveTo(p * w, 0);
                ctx.lineTo(p * w, h);
                ctx.stroke();
                // Yatay
                ctx.beginPath();
                ctx.moveTo(0, p * h);
                ctx.lineTo(w, p * h);
                ctx.stroke();
            });

            // 3. Tonal Bölge İsimleri (Lightroom Ton Bölgeleri - Gölgeler, Karanlık, Aydınlık, Açık Alan)
            ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
            ctx.font = '9px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText('Gölgeler', 0.125 * w, h - 4);
            ctx.fillText('Karanlık', 0.375 * w, h - 4);
            ctx.fillText('Aydınlık', 0.625 * w, h - 4);
            ctx.fillText('Açık Alan', 0.875 * w, h - 4);

            // 4. İnce 45° Diyagonal Referans Çizgisi
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.setLineDash([3, 4]);
            ctx.beginPath();
            ctx.moveTo(0, h);
            ctx.lineTo(w, 0);
            ctx.stroke();
            ctx.setLineDash([]);

            // 5. İnaktif Kanalların Hayalet Eğrileri (Ghost Curves)
            const channels = ['rgb', 'r', 'g', 'b'];
            const ghostColors = {
                rgb: 'rgba(255, 255, 255, 0.22)',
                r:   'rgba(239, 68, 68, 0.25)',
                g:   'rgba(34, 197, 94, 0.25)',
                b:   'rgba(59, 130, 246, 0.25)'
            };

            channels.forEach(ch => {
                if (ch === this.activeChannel) return;
                const samples = this.calculateSplineSamples(this.curves[ch]);
                ctx.strokeStyle = ghostColors[ch];
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                for (let i = 0; i < 256; i++) {
                    const x = (i / 255) * w;
                    const y = (1 - samples[i]) * h;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            });

            // 6. Aktif Kanal Eğrisi & Yumuşak Gradyan Alan Dolgusu
            const activeColors = {
                rgb: '#38bdf8',
                r:   '#ef4444',
                g:   '#22c55e',
                b:   '#60a5fa'
            };
            const activeColor = activeColors[this.activeChannel];
            const activeSamples = this.calculateSplineSamples(this.curves[this.activeChannel]);

            // Yumuşak Işık Dolgusu (Gradient Area Fill)
            const areaGrad = ctx.createLinearGradient(0, 0, 0, h);
            areaGrad.addColorStop(0, activeColor + '30'); // %19 opaklık
            areaGrad.addColorStop(1, activeColor + '02'); // %1 opaklık
            ctx.fillStyle = areaGrad;
            ctx.beginPath();
            ctx.moveTo(0, h);
            for (let i = 0; i < 256; i++) {
                const x = (i / 255) * w;
                const y = (1 - activeSamples[i]) * h;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(w, h);
            ctx.closePath();
            ctx.fill();

            // Ana Eğri Çizgisi (Glow efektli)
            ctx.save();
            ctx.strokeStyle = activeColor;
            ctx.lineWidth = 2.4;
            ctx.shadowColor = activeColor;
            ctx.shadowBlur = 7;
            ctx.beginPath();
            for (let i = 0; i < 256; i++) {
                const x = (i / 255) * w;
                const y = (1 - activeSamples[i]) * h;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.restore();

            // 7. Kontrol Noktaları (Pro Pin Tasarımı)
            const pts = this.curves[this.activeChannel];
            pts.forEach((pt, idx) => {
                const px = pt[0] * w;
                const py = (1 - pt[1]) * h;
                const isSelected = (idx === this.selectedPointIndex);
                const isHovered  = (idx === this.hoveredPointIndex);

                // Dış Halka / Halo
                if (isSelected || isHovered) {
                    ctx.fillStyle = activeColor + '33';
                    ctx.beginPath();
                    ctx.arc(px, py, 9, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Gövde
                ctx.fillStyle = '#0b1120';
                ctx.strokeStyle = activeColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(px, py, isSelected || isHovered ? 5.5 : 4.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Merkez Dolgu
                if (isSelected) {
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // 8. İnce Çerçeve
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
        }

        getState() {
            return JSON.parse(JSON.stringify(this.curves));
        }

        setState(state) {
            if (!state) return;
            ['rgb', 'r', 'g', 'b'].forEach(ch => {
                if (state[ch] && Array.isArray(state[ch])) {
                    this.curves[ch] = JSON.parse(JSON.stringify(state[ch]));
                }
            });
            this.selectedPointIndex = -1;
            this.onCurveChanged();
            this.draw();
        }
    }

    const instance = new PhotoCurvesManager();
    window.PhotoCurvesManager = instance;

    if (typeof document !== 'undefined') {
        const autoInit = () => {
            if (!instance.canvas) {
                instance.init('toneCurveCanvas');
            }
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', autoInit);
        } else {
            setTimeout(autoInit, 50);
        }
    }
})(window);
