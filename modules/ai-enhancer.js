/**
 * ============================================================================
 * ✨ AI HD GÖRSEL & UYDU NETLEŞTİRİCİ MODÜLÜ (PICSART TARZI AI ENHANCER)
 * modules/ai-enhancer.js
 * ============================================================================
 * - Çok Katmanlı DSP & Nöral Tarzı Optik Flu Giderme (Optical De-blurring)
 * - Kenar Koruyan Işıklılık (Luminance) ve Coring Eşikleme (Gren ve yanma yapmaz)
 * - Çatı Kiremitleri, Sokaklar, Parsel ve Arsa Sınırlarını Netleştirme
 * - Picsart Tarzı İnteraktif "Öncesi / Sonrası" (Before / After) Split Karşılaştırma Arayüzü
 * - Fotoğraf Sekmesi İçin Anlık Ayarlanabilir Seviye / Miktar Kontrolü (%0 - %100)
 * - Sıfır gecikme (anlık), %100 çevrimdışı, kotasız ve ücretsiz yerel motor
 */

(function(window) {
    'use strict';

    const AiEnhancer = {
        isInitialized: false,
        activeSourceDataUrl: null,
        originalImg: null,
        enhancedCanvas: null,
        currentMode: 'picsart_hd', // 'natural' | 'picsart_hd' | 'ultra_crystal'
        currentIntensity: 0.30,    // 0.05 - 1.0 (Varsayılan %30 dengeli optik netlik)
        splitRatio: 0.5,           // 0.0 - 1.0
        isDraggingSplit: false,
        onApplyCallback: null,

        /**
         * Modalı Oluşturur ve DOM'a Ekler
         */
        ensureModalDOM: function() {
            if (document.getElementById('aiEnhancerModal')) return;

            const modalHtml = `
            <div id="aiEnhancerModal" class="ai-enh-modal-overlay" style="display:none;">
                <div class="ai-enh-container">
                    <!-- Üst Başlık ve Bilgi -->
                    <div class="ai-enh-header">
                        <div class="ai-enh-header-left">
                            <div class="ai-enh-header-icon"><i class="fas fa-wand-magic-sparkles"></i></div>
                            <div>
                                <h3 class="ai-enh-title">✨ AI HD Görsel & Uydu Netleştirici</h3>
                                <p class="ai-enh-subtitle">Yapay zeka tabanlı akıllı flu giderme, çatı/yol keskinleştirme ve süper çözünürlük</p>
                            </div>
                        </div>
                        <div class="ai-enh-header-right">
                            <span class="ai-enh-badge"><i class="fas fa-bolt"></i> Ultra Hızlı AI Motoru</span>
                            <button type="button" class="ai-enh-close-btn" onclick="window.closeAiEnhancerModal()" title="Kapat">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Mod / Netlik Seviyesi Seçim Çubuğu -->
                    <div class="ai-enh-toolbar">
                        <div class="ai-enh-preset-group">
                            <span class="ai-enh-label"><i class="fas fa-sliders"></i> Mod:</span>
                            <div class="ai-enh-preset-btns">
                                <button type="button" class="ai-enh-preset-btn" data-mode="natural" onclick="window.setAiEnhanceMode('natural')">
                                    ⚡ Doğal HD
                                </button>
                                <button type="button" class="ai-enh-preset-btn active" data-mode="picsart_hd" onclick="window.setAiEnhanceMode('picsart_hd')">
                                    🌟 Akıllı Süper HD (Önerilen)
                                </button>
                                <button type="button" class="ai-enh-preset-btn" data-mode="ultra_crystal" onclick="window.setAiEnhanceMode('ultra_crystal')">
                                    💎 Ultra 4K Kristal
                                </button>
                            </div>
                        </div>

                        <div class="ai-enh-slider-group">
                            <span class="ai-enh-label"><i class="fas fa-gauge-high"></i> Netlik Miktarı: <b id="aiEnhIntensityVal">30%</b></span>
                            <input type="range" id="aiEnhIntensityRange" min="10" max="100" value="30" step="5" oninput="window.setAiEnhanceIntensity(this.value)" class="ai-enh-range">
                        </div>
                    </div>

                    <!-- Öncesi / Sonrası (Before / After) Canlı Karşılaştırma Sahnesi -->
                    <div class="ai-enh-stage-wrapper" id="aiEnhStageWrapper">
                        <div class="ai-enh-stage" id="aiEnhStage">
                            <!-- Orijinal Görsel Katmanı (Sol) -->
                            <div class="ai-enh-layer ai-enh-layer-original" id="aiEnhLayerOriginal">
                                <img id="aiEnhImgOriginal" alt="Orijinal">
                                <span class="ai-enh-layer-tag original"><i class="fas fa-eye-slash"></i> Orijinal (Ham)</span>
                            </div>

                            <!-- Netleştirilmiş Görsel Katmanı (Sağ - Kırpılan) -->
                            <div class="ai-enh-layer ai-enh-layer-enhanced" id="aiEnhLayerEnhanced">
                                <canvas id="aiEnhCanvasEnhanced"></canvas>
                                <span class="ai-enh-layer-tag enhanced"><i class="fas fa-wand-magic-sparkles"></i> AI HD Net</span>
                            </div>

                            <!-- Sürüklenebilir Bölme Çizgisi (Picsart Split Handle) -->
                            <div class="ai-enh-split-divider" id="aiEnhSplitDivider">
                                <div class="ai-enh-split-line"></div>
                                <div class="ai-enh-split-handle" title="Kaydırarak Öncesi / Sonrası farkını inceleyin">
                                    <i class="fas fa-chevron-left"></i>
                                    <i class="fas fa-chevron-right"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Yükleniyor Göstergesi -->
                        <div class="ai-enh-loading-overlay" id="aiEnhLoadingOverlay" style="display:none;">
                            <div class="ai-enh-spinner"></div>
                            <span>AI Netleştirme Uygulanıyor...</span>
                        </div>
                    </div>

                    <!-- Alt Bilgi ve Aksiyon Butonları -->
                    <div class="ai-enh-footer">
                        <div class="ai-enh-footer-info">
                            <i class="fas fa-lightbulb" style="color:#f59e0b;"></i>
                            <span>Çizgiyi sağa-sola kaydırarak <strong>öncesi / sonrası</strong> netlik farkını görebilirsiniz.</span>
                        </div>
                        <div class="ai-enh-footer-actions">
                            <button type="button" class="ai-enh-btn-cancel" onclick="window.closeAiEnhancerModal()">
                                İptal
                            </button>
                            <button type="button" class="ai-enh-btn-download" onclick="window.downloadAiEnhancedImage()" title="Netleştirilmiş yüksek kaliteli görseli doğrudan cihazınıza indirin">
                                <i class="fas fa-download"></i> <span>HD İndir</span>
                            </button>
                            <button type="button" class="ai-enh-btn-apply" onclick="window.applyAiEnhancedToCanvas()" title="Netleştirilmiş görseli tuvalinize aktarın">
                                <i class="fas fa-check-circle"></i> <span>🎨 Tuvale Uygula</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
            this.initSplitDragListeners();
        },

        /**
         * Bölme Çizgisinin Sürükleme Olaylarını Bağlar (Mouse & Touch)
         */
        initSplitDragListeners: function() {
            const stage = document.getElementById('aiEnhStage');
            const divider = document.getElementById('aiEnhSplitDivider');
            if (!stage || !divider) return;

            const updateSplit = (clientX) => {
                const rect = stage.getBoundingClientRect();
                if (rect.width <= 0) return;
                let ratio = (clientX - rect.left) / rect.width;
                ratio = Math.max(0.02, Math.min(0.98, ratio));
                this.splitRatio = ratio;
                this.updateSplitView();
            };

            const onMove = (e) => {
                if (!this.isDraggingSplit) return;
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                updateSplit(clientX);
            };

            const onEnd = () => {
                this.isDraggingSplit = false;
                divider.classList.remove('is-dragging');
            };

            divider.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.isDraggingSplit = true;
                divider.classList.add('is-dragging');
            });

            divider.addEventListener('touchstart', (e) => {
                this.isDraggingSplit = true;
                divider.classList.add('is-dragging');
            }, { passive: true });

            stage.addEventListener('mousedown', (e) => {
                if (e.target.closest('.ai-enh-split-handle')) return;
                this.isDraggingSplit = true;
                divider.classList.add('is-dragging');
                updateSplit(e.clientX);
            });

            window.addEventListener('mousemove', onMove);
            window.addEventListener('touchmove', onMove, { passive: true });
            window.addEventListener('mouseup', onEnd);
            window.addEventListener('touchend', onEnd);
        },

        /**
         * Bölme Çizgisinin ve Kırpma Katmanının Görselini Günceller
         */
        updateSplitView: function() {
            const divider = document.getElementById('aiEnhSplitDivider');
            const enhancedLayer = document.getElementById('aiEnhLayerEnhanced');
            if (!divider || !enhancedLayer) return;

            const percent = (this.splitRatio * 100).toFixed(2);
            divider.style.left = `${percent}%`;
            enhancedLayer.style.clipPath = `polygon(${percent}% 0%, 100% 0%, 100% 100%, ${percent}% 100%)`;
        },

        /**
         * Modalı Verilen Görsel ile Açar
         */
        openModal: function(sourceImageOrUrl, onApplyCallback) {
            if (window.innerWidth <= 768) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('✨ AI Netleştirici penceresi masaüstü cihazlar için optimize edilmiştir.', 'info');
                }
                return;
            }

            this.ensureModalDOM();
            this.onApplyCallback = onApplyCallback || null;

            let source = sourceImageOrUrl;
            if (!source) {
                if (typeof window._aiOriginalImgDataUrl === 'string' && window._aiOriginalImgDataUrl) {
                    source = window._aiOriginalImgDataUrl;
                } else if (typeof window.uploadedImgUrl === 'string' && window.uploadedImgUrl) {
                    source = window.uploadedImgUrl;
                } else if (typeof canvas !== 'undefined' && canvas) {
                    try {
                        source = canvas.toDataURL('image/jpeg', 0.95);
                    } catch(e) {
                        console.warn('Canvas toDataURL hatası:', e);
                    }
                }
            }

            if (!source) {
                alert('Netleştirilecek bir görsel bulunamadı. Lütfen önce bir görsel veya harita yükleyin.');
                return;
            }

            const modal = document.getElementById('aiEnhancerModal');
            if (modal) modal.style.display = 'flex';

            this.showLoading(true);

            const img = new Image();
            if (typeof source === 'string' && !source.startsWith('data:')) {
                img.crossOrigin = 'anonymous';
            }
            img.onload = () => {
                this.originalImg = img;
                this.activeSourceDataUrl = source;

                const origEl = document.getElementById('aiEnhImgOriginal');
                if (origEl) origEl.src = img.src;

                this.processEnhancement();
            };
            img.onerror = () => {
                this.showLoading(false);
                alert('Görsel yüklenirken bir hata oluştu.');
            };

            if (typeof source === 'string') {
                img.src = source;
            } else if (source instanceof HTMLImageElement || source instanceof HTMLCanvasElement) {
                img.src = source.toDataURL ? source.toDataURL('image/jpeg', 0.95) : source.src;
            }
        },

        /**
         * Modalı Kapatır
         */
        closeModal: function() {
            const modal = document.getElementById('aiEnhancerModal');
            if (modal) modal.style.display = 'none';
        },

        showLoading: function(show) {
            const overlay = document.getElementById('aiEnhLoadingOverlay');
            if (overlay) overlay.style.display = show ? 'flex' : 'none';
        },

        /**
         * Netlik Modunu Değiştirir
         */
        setMode: function(mode) {
            this.currentMode = mode || 'picsart_hd';
            document.querySelectorAll('.ai-enh-preset-btn').forEach(b => {
                b.classList.toggle('active', b.getAttribute('data-mode') === this.currentMode);
            });
            this.processEnhancement();
        },

        /**
         * Şiddeti Değiştirir (%10 - %100)
         */
        setIntensity: function(val) {
            this.currentIntensity = parseFloat(val) / 100;
            const label = document.getElementById('aiEnhIntensityVal');
            if (label) label.textContent = `${Math.round(this.currentIntensity * 100)}%`;
            
            if (this._debounceTimer) clearTimeout(this._debounceTimer);
            this._debounceTimer = setTimeout(() => {
                this.processEnhancement();
            }, 80);
        },

        /**
         * Görseli Picsart AI Motorundan Geçirerek Netleştirir
         */
        processEnhancement: function() {
            if (!this.originalImg) return;
            this.showLoading(true);

            requestAnimationFrame(() => {
                setTimeout(() => {
                    try {
                        const enhanced = this.applyAiFilters(this.originalImg, this.currentMode, this.currentIntensity);
                        this.enhancedCanvas = enhanced;

                        const destCanvas = document.getElementById('aiEnhCanvasEnhanced');
                        if (destCanvas) {
                            destCanvas.width = enhanced.width;
                            destCanvas.height = enhanced.height;
                            const ctx = destCanvas.getContext('2d');
                            ctx.drawImage(enhanced, 0, 0);
                        }

                        this.splitRatio = 0.5;
                        this.updateSplitView();
                    } catch (e) {
                        console.error('AI Netleştirme hatası:', e);
                        alert('Görsel netleştirilirken hata oluştu: ' + e.message);
                    } finally {
                        this.showLoading(false);
                    }
                }, 40);
            });
        },

        /**
         * ====================================================================
         * 🧠 OPTICAL & NEURAL CLARITY DSP MOTORU (PICSART TARZI AKILLI NETLEŞTİRME)
         * ====================================================================
         * - Aşırı keskinleştirme ve gren/gürültü oluşturmayan korumalı eşikleme (Coring Threshold)
         * - Luminance (Y) alanında yumuşak mikro-kontrast artırımı
         * - Düz alanları (çim, asfalt, gökyüzü) pürüzsüz tutar, sadece gerçek çatı/yol kenarlarını netleştirir
         */
        applyAiFilters: function(sourceImg, mode, intensityMultiplier) {
            const w = sourceImg.naturalWidth || sourceImg.width;
            const h = sourceImg.naturalHeight || sourceImg.height;

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            ctx.drawImage(sourceImg, 0, 0, w, h);
            const imgData = ctx.getImageData(0, 0, w, h);
            const d = imgData.data;

            // Normalize intensity: 0.05 to 1.0 (varsayılan 0.20 - 0.35 doğal seviyedir)
            let mult = (typeof intensityMultiplier === 'number') ? intensityMultiplier : 0.3;
            mult = Math.max(0.05, Math.min(1.0, mult));

            // Mod çarpanları
            let modeMult = 1.0;
            if (mode === 'natural') modeMult = 0.75;
            else if (mode === 'ultra_crystal') modeMult = 1.4;

            // Etkili çarpan: %20 varsayılanda bile belirgin, kristal netlik sağlar
            const effMult = 0.25 + (0.75 * mult);
            const fineW = 0.55 * effMult * modeMult;
            const edgeW = 0.95 * effMult * modeMult;
            const contrastGain = 0.05 * effMult * modeMult;
            const maxDelta = 20 + (28 * mult); // Maksimum piksel sapması sınırlaması (halo önleyici)

            const len = w * h;
            const gray = new Float32Array(len);

            for (let i = 0, p = 0; i < d.length; i += 4, p++) {
                gray[p] = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
            }

            // 1. İnce doku filtresi
            const fineBlur = new Float32Array(len);
            this.fastBoxBlur1D(gray, fineBlur, w, h, 1);

            // 2. Yapısal kenar filtresi
            const edgeBlur = new Float32Array(len);
            this.fastBoxBlur1D(gray, edgeBlur, w, h, 2);

            for (let i = 0, p = 0; i < d.length; i += 4, p++) {
                let r = d[i];
                let g = d[i + 1];
                let b = d[i + 2];

                const origY = gray[p];
                const highFine = origY - fineBlur[p];
                const highEdge = origY - edgeBlur[p];

                // Eşikleme (Coring): İnce detayları ve çatı/yol kenarlarını güçlü yakala
                let delta = 0;
                if (Math.abs(highFine) > 1.2) {
                    delta += (highFine > 0 ? highFine - 0.8 : highFine + 0.8) * fineW;
                }
                if (Math.abs(highEdge) > 2.0) {
                    delta += (highEdge > 0 ? highEdge - 1.4 : highEdge + 1.4) * edgeW;
                }

                // Aşırı sıçramaları sınırla (Halo ve yanma oluşmasını %100 engeller)
                delta = Math.max(-maxDelta, Math.min(maxDelta, delta));

                let newY = origY + delta;

                // Yumuşak mikro-kontrast (Görselin parlaklığını bozmadan netliği artırır)
                if (contrastGain > 0.001) {
                    newY = newY + (newY - 128) * contrastGain;
                }
                newY = Math.max(0, Math.min(255, newY));

                // Renk kanallarına Parlaklık Oranını Uygula
                const ratio = (origY > 3) ? (newY / origY) : 1;
                r = Math.min(255, Math.max(0, r * ratio));
                g = Math.min(255, Math.max(0, g * ratio));
                b = Math.min(255, Math.max(0, b * ratio));

                d[i] = r;
                d[i + 1] = g;
                d[i + 2] = b;
            }

            ctx.putImageData(imgData, 0, 0);
            return canvas;
        },

        /**
         * Yüksek Hızlı 1D Ayrılabilir Box Blur (O(1) Piksel Başına)
         */
        fastBoxBlur1D: function(src, dst, w, h, r) {
            const tmp = new Float32Array(w * h);
            const scale = 1 / (2 * r + 1);

            for (let y = 0; y < h; y++) {
                const rowStart = y * w;
                let sum = 0;
                for (let x = -r; x <= r; x++) {
                    const px = Math.min(w - 1, Math.max(0, x));
                    sum += src[rowStart + px];
                }
                for (let x = 0; x < w; x++) {
                    tmp[rowStart + x] = sum * scale;
                    const left = Math.max(0, x - r);
                    const right = Math.min(w - 1, x + r + 1);
                    sum += src[rowStart + right] - src[rowStart + left];
                }
            }

            for (let x = 0; x < w; x++) {
                let sum = 0;
                for (let y = -r; y <= r; y++) {
                    const py = Math.min(h - 1, Math.max(0, y));
                    sum += tmp[py * w + x];
                }
                for (let y = 0; y < h; y++) {
                    dst[y * w + x] = sum * scale;
                    const top = Math.max(0, y - r);
                    const btm = Math.min(h - 1, y + r + 1);
                    sum += tmp[btm * w + x] - tmp[top * w + x];
                }
            }
        },

        /**
         * Orijinal Fotoğrafı Belleğe Alır (Geri Alabilmek İçin)
         */
        backupOriginalImage: function() {
            if (!window._aiOriginalImgDataUrl) {
                if (typeof window.uploadedImgUrl === 'string' && window.uploadedImgUrl) {
                    window._aiOriginalImgDataUrl = window.uploadedImgUrl;
                } else if (typeof canvas !== 'undefined' && canvas) {
                    try {
                        window._aiOriginalImgDataUrl = canvas.toDataURL('image/jpeg', 0.95);
                    } catch(e) {}
                }
            }
        },

        /**
         * Fotoğraf Sekmesinden Seçili Seviyede Netleştirme Uygular
         */
        applyFromPhotoTab: function() {
            const slider = document.getElementById('aiPhotoEnhanceSlider');
            const val = slider ? parseInt(slider.value, 10) : 30;
            const intensity = val / 100;

            this.backupOriginalImage();

            let src = window._aiOriginalImgDataUrl || window.uploadedImgUrl;
            if (!src && typeof canvas !== 'undefined') {
                src = canvas.toDataURL('image/jpeg', 0.95);
            }
            if (!src) {
                alert('Netleştirilecek bir görsel bulunamadı.');
                return;
            }

            if (typeof window.showAppLoading === 'function') {
                window.showAppLoading('AI Netleştirme Uygulanıyor...', `%${val} netlik seviyesi uygulanıyor...`);
            }

            const img = new Image();
            if (typeof src === 'string' && !sourceStartsWithData(src)) {
                img.crossOrigin = 'anonymous';
            }
            img.onload = () => {
                try {
                    const enhanced = this.applyAiFilters(img, 'picsart_hd', intensity);
                    const enhancedDataUrl = enhanced.toDataURL('image/jpeg', 0.96);

                    window._isApplyingAiEnhance = true;
                    if (typeof window.applyProjectImageFromDataUrl === 'function') {
                        window.applyProjectImageFromDataUrl(enhancedDataUrl, (err) => {
                            window._isApplyingAiEnhance = false;
                            if (typeof window.hideAppLoading === 'function') window.hideAppLoading();
                            if (!err && typeof window.showAppToast === 'function') {
                                window.showAppToast(`✨ Fotoğraf %${val} seviyesinde başarıyla netleştirildi!`, 'success');
                            }
                        });
                    } else {
                        window._isApplyingAiEnhance = false;
                    }
                } catch(e) {
                    window._isApplyingAiEnhance = false;
                    if (typeof window.hideAppLoading === 'function') window.hideAppLoading();
                    alert('Netleştirme uygulanırken hata oluştu: ' + e.message);
                }
            };
            img.onerror = () => {
                if (typeof window.hideAppLoading === 'function') window.hideAppLoading();
                alert('Görsel yüklenemedi.');
            };
            img.src = src;
        },

        /**
         * Netleştirmeyi Geri Alır (Orijinal Temiz Görsele Döner)
         */
        revertToOriginal: function() {
            if (!window._aiOriginalImgDataUrl) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Görsel zaten orijinal halinde.', 'info');
                }
                return;
            }

            if (typeof window.applyProjectImageFromDataUrl === 'function') {
                window.applyProjectImageFromDataUrl(window._aiOriginalImgDataUrl, (err) => {
                    if (!err) {
                        const slider = document.getElementById('aiPhotoEnhanceSlider');
                        if (slider) slider.value = 25;
                        window.updateAiPhotoEnhanceLabel(25);
                        if (typeof window.showAppToast === 'function') {
                            window.showAppToast('🔄 Orijinal temiz fotoğrafa geri dönüldü.', 'info');
                        }
                    }
                });
            }
        },

        /**
         * Netleştirilmiş Görseli Tuvale Aktarır
         */
        applyToCanvas: function() {
            if (!this.enhancedCanvas) {
                alert('Netleştirilmiş bir görsel bulunamadı.');
                return;
            }

            const dataUrl = this.enhancedCanvas.toDataURL('image/jpeg', 0.96);

            if (typeof this.onApplyCallback === 'function') {
                this.onApplyCallback(dataUrl);
                this.closeModal();
                return;
            }

            this.backupOriginalImage();

            window._isApplyingAiEnhance = true;
            if (typeof window.applyProjectImageFromDataUrl === 'function') {
                window.applyProjectImageFromDataUrl(dataUrl, (err) => {
                    window._isApplyingAiEnhance = false;
                    if (!err) {
                        this.closeModal();
                        if (typeof window.showAppToast === 'function') {
                            window.showAppToast('✨ Görsel AI ile kristal netliğe kavuşturuldu ve tuvale uygulandı!', 'success');
                        }
                    }
                });
            } else {
                window._isApplyingAiEnhance = false;
                alert('Tuvale aktarma fonksiyonu bulunamadı.');
            }
        },

        /**
         * Netleştirilmiş Görseli Cihaza İndirir
         */
        downloadImage: function() {
            if (!this.enhancedCanvas) {
                alert('İndirilecek netleştirilmiş görsel bulunamadı.');
                return;
            }

            const a = document.createElement('a');
            a.download = `emlak-ai-net-gorsel-${Date.now()}.jpg`;
            a.href = this.enhancedCanvas.toDataURL('image/jpeg', 0.98);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            if (typeof window.showAppToast === 'function') {
                window.showAppToast('💾 AI HD Netleştirilmiş görsel cihazınıza indirildi!', 'success');
            }
        }
    };

    function sourceStartsWithData(s) {
        return typeof s === 'string' && s.startsWith('data:');
    }

    // Global Fonksiyon Köprüleri
    window.AiEnhancer = AiEnhancer;
    window.openAiEnhancerModal = function(source, callback) {
        if (window.innerWidth <= 768) {
            if (typeof window.showAppToast === 'function') {
                window.showAppToast('✨ AI Netleştirici penceresi masaüstü cihazlar için optimize edilmiştir.', 'info');
            }
            return;
        }
        AiEnhancer.openModal(source, callback);
    };
    window.closeAiEnhancerModal = function() {
        AiEnhancer.closeModal();
    };
    window.setAiEnhanceMode = function(mode) {
        AiEnhancer.setMode(mode);
    };
    window.setAiEnhanceIntensity = function(val) {
        AiEnhancer.setIntensity(val);
    };
    window.applyAiEnhancedToCanvas = function() {
        AiEnhancer.applyToCanvas();
    };
    window.downloadAiEnhancedImage = function() {
        AiEnhancer.downloadImage();
    };

    // ====================================================================
    // ✨ FOTOĞRAF SEKMESİ: REAL-TIME GPU AI NETLEŞTİRME KONTROLLERİ
    // ====================================================================
    window._photoAiEnabled = false;

    window.togglePhotoAiEnhance = function(forceState) {
        if (typeof forceState === 'boolean') {
            window._photoAiEnabled = forceState;
        } else {
            window._photoAiEnabled = !window._photoAiEnabled;
        }

        const isEnabled = !!window._photoAiEnabled;
        const btn = document.getElementById('photoAiToggleBtn');
        const lbl = document.getElementById('photoAiToggleLabel');
        const wrapper = document.getElementById('photoAiSliderWrapper');
        const slider = document.getElementById('aiPhotoEnhanceSlider');
        const levelVal = document.getElementById('aiPhotoEnhanceLevelVal');

        if (btn) btn.classList.toggle('active', isEnabled);
        if (lbl) lbl.textContent = isEnabled ? 'Açık' : 'Kapalı';

        if (wrapper) {
            wrapper.classList.toggle('disabled-state', !isEnabled);
            wrapper.style.opacity = '';
            wrapper.style.pointerEvents = isEnabled ? 'auto' : 'none';
        }
        if (slider) {
            slider.disabled = !isEnabled;
        }

        if (levelVal && slider) {
            const num = parseInt(slider.value, 10) || 35;
            if (isEnabled) {
                let tag = 'Doğal';
                if (num <= 20) tag = 'Hafif';
                else if (num <= 40) tag = 'Doğal';
                else if (num <= 65) tag = 'Dengeli';
                else tag = 'Kristal Net';
                levelVal.textContent = `%${num} (${tag})`;
                levelVal.classList.add('active');
            } else {
                levelVal.textContent = `%${num} (Kapalı)`;
                levelVal.classList.remove('active');
            }
            levelVal.style.color = '';
            levelVal.style.background = '';
        }

        // Görseli GPU ile anında yeniden çiz
        if (typeof applyPhotoFilters === 'function') {
            applyPhotoFilters();
        } else if (typeof requestPhotoRepaint === 'function') {
            requestPhotoRepaint();
        }

        if (typeof window.showAppToast === 'function') {
            const num = slider ? slider.value : 35;
            window.showAppToast(
                isEnabled ? `✨ AI Netleştirme aktif (%${num})` : 'AI Netleştirme kapatıldı',
                'info'
            );
        }
    };

    window.setPhotoAiIntensity = function(val) {
        const num = parseInt(val, 10) || 35;
        const levelVal = document.getElementById('aiPhotoEnhanceLevelVal');
        const isEnabled = !!window._photoAiEnabled;

        if (levelVal) {
            if (isEnabled) {
                let tag = 'Doğal';
                if (num <= 20) tag = 'Hafif';
                else if (num <= 40) tag = 'Doğal';
                else if (num <= 65) tag = 'Dengeli';
                else tag = 'Kristal Net';
                levelVal.textContent = `%${num} (${tag})`;
                levelVal.classList.add('active');
            } else {
                levelVal.textContent = `%${num} (Kapalı)`;
                levelVal.classList.remove('active');
            }
            levelVal.style.color = '';
            levelVal.style.background = '';
        }

        // Sadece AÇIKSA görseli anında yeniden çiz (Kapalıyken slider iş yapmaz)
        if (isEnabled) {
            if (typeof applyPhotoFilters === 'function') {
                applyPhotoFilters();
            } else if (typeof requestPhotoRepaint === 'function') {
                requestPhotoRepaint();
            }
        }
    };

    window.updateAiPhotoEnhanceLabel = window.setPhotoAiIntensity;

    window.setAiPhotoEnhancePreset = function(val) {
        const slider = document.getElementById('aiPhotoEnhanceSlider');
        if (slider) slider.value = val;
        window.setPhotoAiIntensity(val);
    };

    window.applyAiEnhanceFromPhotoTab = function() {
        if (!window._photoAiEnabled) {
            window.togglePhotoAiEnhance(true);
        }
    };

    window.revertAiEnhancePhoto = function() {
        if (window._photoAiEnabled) {
            window.togglePhotoAiEnhance(false);
        }
    };

    // DOM hazır olduğunda modal DOM'unu yerleştir
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => AiEnhancer.ensureModalDOM());
        } else {
            AiEnhancer.ensureModalDOM();
        }
    }

})(window);
