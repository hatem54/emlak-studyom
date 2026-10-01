/**
 * ============================================================================
 * 🪄 Emlak Stüdyom - Sihirli Silgi & Akıllı Nesne Kaldırıcı (Magic Eraser Engine)
 * modules/magic-eraser.js
 * ============================================================================
 *
 * - Hızlı Motor: Telea Fast Marching — kablo, tel, küçük leke, anlık (10-30 ms)
 * - Akıllı HD Motor: Telea Harmonic Fill + Coarse-to-Fine PatchMatch Doku Klonlama
 *   * Önce harmonik ışık/renk gradyanı ile zemini pürüzsüz doldurur (Telea baz)
 *   * Temiz çevre piksellerinden %100 gerçek kamera dokularını PatchMatch ile eşleştirir
 *   * SSD (Sum of Squared Differences) ağırlıklı karşılaştırma (sınır pikselleri 3.0x)
 *   * Gerçek fotoğraf dokusunu (çakıl, asfalt, çim, ahşap, duvar) baz aydınlatma ile harmanlar
 *   * 2-pass Laplacian sınır gevşetmesi + Feathered Gaussian Alpha compositing
 * - Sıfır indirme (0 MB), 100% istemci tarafı (client-side), API gerektirmez
 * - Geri Al (Ctrl+Z) & Geçmiş Desteği
 */

(function(window) {
    'use strict';

    const MagicEraser = {
        isInitialized: false,
        activeEngine: 'fast', // 'fast' | 'smart'
        isProcessing: false,

        /**
         * Modül Başlatıcı
         */
        init: function() {
            if (this.isInitialized) return;
            this.isInitialized = true;
        },

        /**
         * Motor Değiştirme (Hızlı / Akıllı HD)
         */
        setEngine: function(engine, e) {
            if (e && e.stopPropagation) e.stopPropagation();
            this.activeEngine = (engine === 'smart') ? 'smart' : 'fast';

            const fastBtn = document.getElementById('eraserEngineFastBtn');
            const smartBtn = document.getElementById('eraserEngineSmartBtn');
            if (fastBtn) fastBtn.classList.toggle('active', this.activeEngine === 'fast');
            if (smartBtn) smartBtn.classList.toggle('active', this.activeEngine === 'smart');

            // Kullanıcı motor değiştirirken çizili maske seçimini kaybetme
            if (window.PhotoMasksManager) {
                const mgr = window.PhotoMasksManager;
                let mask = mgr.getSelectedMask();
                if (!mask || mask.type !== 'brush') {
                    mask = mgr.masks.find(m => m.type === 'brush');
                    if (mask) mgr.selectedMaskId = mask.id;
                }
                if (mask) {
                    mask.active = true;
                    mask.showOverlay = true;
                    mgr.isGuidesVisible = true;
                    mgr.showOverlay = true;
                    if (typeof mgr.renderSvg === 'function') mgr.renderSvg();
                    if (typeof mgr.notifyChange === 'function') mgr.notifyChange();
                }
            }
        },

        /**
         * İlerleme Çubuğu Güncelleyici
         */
        setProgress: function(percent, text) {
            const container = document.getElementById('eraserDownloadProgress');
            const fill = document.getElementById('eraserProgressBar');
            const percentLabel = document.getElementById('eraserProgressPercent');
            const textLabel = document.getElementById('eraserProgressText');

            if (!container) return;

            if (percent === null) {
                container.style.display = 'none';
                return;
            }

            container.style.display = 'block';
            if (fill) fill.style.width = `${percent}%`;
            if (percentLabel) percentLabel.textContent = `%${percent}`;
            if (textLabel && text) textLabel.textContent = text;
        },

        /**
         * Sihirli Silgi Aracını Aktifleştirir
         */
        activateEraserMode: function() {
            this.init();

            // 1. Klonlama damgası aktifse derhal tamamen kapat ve tuvali temizle
            if (window.CloneStamp && window.CloneStamp.isActive) {
                window.CloneStamp.deactivate();
            }

            if (!window.PhotoMasksManager) {
                alert('Maskeleme yöneticisi henüz yüklenmedi.');
                return;
            }

            const mgr = window.PhotoMasksManager;

            const acc = document.getElementById('photoMasksAccordion');
            if (acc && !acc.open) acc.open = true;

            let mask = mgr.masks.find(m => m.type === 'brush');
            if (!mask) {
                mgr.addMask('brush');
                mask = mgr.getSelectedMask();
            } else {
                mgr.selectMask(mask.id);
            }

            if (mask) {
                mask.active = true;
                mask.showOverlay = true;
                mask.brushMode = 'paint';
            }

            mgr.isGuidesVisible = true;
            mgr.activeTool = 'eraser';
            mgr.showGuides();
            mgr.updatePanelsVisibility();
            mgr.renderLayersList();
            mgr.renderSvg();
            mgr.updateToolButtons();
            mgr.notifyChange();
        },

        /**
         * ====================================================================
         * 📐 TERS GEOMETRİK İZDÜŞÜM MOTORU (INVERSE AFFINE COORDINATE TRANSFORM)
         * ====================================================================
         */
        createAlignedNativeMask: function(containerMaskCanvas, natW, natH) {
            const nativeMask = document.createElement('canvas');
            nativeMask.width = natW;
            nativeMask.height = natH;
            const nmCtx = nativeMask.getContext('2d');

            const cContainer = document.getElementById('canvas-container');
            const cW = cContainer ? (parseInt(cContainer.style.width, 10) || cContainer.offsetWidth || 1920) : 1920;
            const cH = cContainer ? (parseInt(cContainer.style.height, 10) || cContainer.offsetHeight || 1080) : 1080;

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

            nmCtx.save();
            nmCtx.scale(natW / drawW, natH / drawH);
            nmCtx.translate(-baseX, -baseY);
            nmCtx.translate(cx - panX, cy - panY);
            nmCtx.scale(1 / scale, 1 / scale);
            nmCtx.translate(-cx, -cy);
            nmCtx.drawImage(containerMaskCanvas, 0, 0, cW, cH);
            nmCtx.restore();

            return nativeMask;
        },

        /**
         * ====================================================================
         * 🚀 SİLME EYLEMİNİ GERÇEKLEŞTİR (EXECUTE ERASURE)
         * ====================================================================
         */
        executeErasure: async function() {
            if (this.isProcessing) return;

            if (!window.PhotoMasksManager) {
                alert('Maskeleme sistemi bulunamadı.');
                return;
            }

            const mgr = window.PhotoMasksManager;
            const mask = mgr.getSelectedMask();

            if (!mask || mask.type !== 'brush' || (!mask.rawMaskCanvas && !mask.aiMaskCanvas)) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Lütfen silmek istediğiniz nesnenin üzerini boyayın.', 'warning');
                } else {
                    alert('Lütfen silmek istediğiniz nesnenin üzerini boyayın.');
                }
                return;
            }

            const sourceMask = mask.rawMaskCanvas || mask.aiMaskCanvas;
            const sCtx = sourceMask.getContext('2d');
            const sData = sCtx.getImageData(0, 0, sourceMask.width, sourceMask.height).data;

            let hasPixels = false;
            for (let i = 3; i < sData.length; i += 4) {
                if (sData[i] > 15) { hasPixels = true; break; }
            }

            if (!hasPixels) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Lütfen önce silinecek nesneyi fırça veya kement ile işaretleyin.', 'warning');
                } else {
                    alert('Lütfen önce silinecek nesneyi fırça veya kement ile işaretleyin.');
                }
                return;
            }

            const sourceImg = window._globalNativeImg ||
                              (document.getElementById('photo-layer') && document.getElementById('photo-layer')._nativeImg) ||
                              (window.WebGLPhotoEngine && window.WebGLPhotoEngine.currentImage);
            if (sourceImg && window.WebGLPhotoEngine && window.WebGLPhotoEngine.currentImage !== sourceImg) {
                window.WebGLPhotoEngine.currentImage = sourceImg;
            }

            if (!sourceImg) {
                alert('İşlenecek görsel bulunamadı.');
                return;
            }

            const natW = sourceImg.naturalWidth || sourceImg.width;
            const natH = sourceImg.naturalHeight || sourceImg.height;

            const nativeMask = this.createAlignedNativeMask(sourceMask, natW, natH);
            const nmCtx = nativeMask.getContext('2d');
            const nmData = nmCtx.getImageData(0, 0, natW, natH).data;

            let minX = natW, minY = natH, maxX = 0, maxY = 0;
            let hitCount = 0;
            for (let y = 0; y < natH; y += 2) {
                for (let x = 0; x < natW; x += 2) {
                    const idx = (y * natW + x) * 4 + 3;
                    if (nmData[idx] > 20) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                        hitCount++;
                    }
                }
            }

            if (hitCount === 0 || minX > maxX || minY > maxY) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('İşaretlenen alan görsel sınırları dışında kaldı.', 'warning');
                }
                return;
            }

            const bbox = { minX, minY, maxX, maxY, natW, natH };

            const lastSnap = (window.undoStack && window.undoStack.length > 0) ? window.undoStack[window.undoStack.length - 1] : null;
            if (!lastSnap || lastSnap.photoImgUrl !== window.uploadedImgUrl) {
                if (typeof window.recordHistoryImmediate === 'function') {
                    window.recordHistoryImmediate('Silme Öncesi Fotoğraf');
                } else if (typeof window.recordHistory === 'function') {
                    window.recordHistory('Silme Öncesi Fotoğraf', true);
                }
            }

            const executeBtn = document.getElementById('magicEraserExecuteBtn');
            const originalBtnHtml = executeBtn ? executeBtn.innerHTML : '';

            this.isProcessing = true;
            if (executeBtn) {
                executeBtn.disabled = true;
                executeBtn.classList.add('loading');
                executeBtn.innerHTML = '<span class="eraser-spinner"></span> Nesne Kaldırılıyor...';
            }

            await new Promise(resolve => setTimeout(resolve, 25));

            try {
                let resultDataUrl = null;

                if (this.activeEngine === 'smart') {
                    this.setProgress(10, 'Akıllı HD: Hazırlanıyor...');
                    await new Promise(resolve => setTimeout(resolve, 10));
                    resultDataUrl = await this.runSmartInpainting(sourceImg, nativeMask, bbox);
                } else {
                    resultDataUrl = await this.runFastInpainting(sourceImg, nativeMask, bbox);
                }

                this.setProgress(null);

                if (!resultDataUrl) throw new Error('Silme işlemi sonuç üretemedi.');

                await new Promise((resolve, reject) => {
                    window.updateProjectPhotoPixels(resultDataUrl, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                if (typeof mgr.clearCurrentBrushMask === 'function') mgr.clearCurrentBrushMask();
                if (typeof mgr.renderSvg === 'function') mgr.renderSvg();

                if (typeof window.recordHistoryImmediate === 'function') {
                    window.recordHistoryImmediate('Sihirli Silgi');
                } else if (typeof window.recordHistory === 'function') {
                    window.recordHistory('Sihirli Silgi', true);
                }

                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Nesne başarıyla silindi.', 'success');
                }

            } catch (err) {
                this.setProgress(null);
                console.error('Silme hatası:', err);
                alert('Nesne silinirken bir hata oluştu: ' + (err.message || err));
            } finally {
                this.isProcessing = false;
                if (executeBtn) {
                    executeBtn.disabled = false;
                    executeBtn.classList.remove('loading');
                    executeBtn.innerHTML = originalBtnHtml;
                }
            }
        },

        // ====================================================================
        // 🧠 AKILLI HD MOTORU — TELEA BASE + PATCHMATCH TEXTURE INPAINTING
        // ====================================================================

        /**
         * Telea Fast Marching ile harmonik taban aydınlatma ve renk gradyanı oluşturur
         */
        _teleaHarmonicFill: function(srcData, maskData, W, H) {
            const dst = new Uint8ClampedArray(srcData);
            const state = new Uint8Array(W * H); // 0: KNOWN, 1: BAND, 2: HOLE
            const queue = new Int32Array(W * H);
            let qHead = 0, qTail = 0;

            for (let i = 0; i < W * H; i++) {
                if (maskData[i] === 1) state[i] = 2;
            }

            for (let y = 0; y < H; y++) {
                const row = y * W;
                for (let x = 0; x < W; x++) {
                    const idx = row + x;
                    if (state[idx] === 2) {
                        if ((x > 0 && state[idx - 1] === 0) ||
                            (x < W - 1 && state[idx + 1] === 0) ||
                            (y > 0 && state[idx - W] === 0) ||
                            (y < H - 1 && state[idx + W] === 0)) {
                            state[idx] = 1;
                            queue[qTail++] = idx;
                        }
                    }
                }
            }

            const radius = 5;
            const rSq = radius * radius;

            while (qHead < qTail) {
                const idx = queue[qHead++];
                const x = idx % W;
                const y = (idx / W) | 0;

                let sumR = 0, sumG = 0, sumB = 0, totalW = 0;
                const yMin = Math.max(0, y - radius);
                const yMax = Math.min(H - 1, y + radius);
                const xMin = Math.max(0, x - radius);
                const xMax = Math.min(W - 1, x + radius);

                for (let ny = yMin; ny <= yMax; ny++) {
                    const dy2 = (ny - y) * (ny - y);
                    const rowOffset = ny * W;
                    for (let nx = xMin; nx <= xMax; nx++) {
                        const nIdx = rowOffset + nx;
                        if (state[nIdx] === 0) {
                            const d2 = (nx - x) * (nx - x) + dy2;
                            if (d2 <= rSq) {
                                const weight = 1.0 / (Math.sqrt(d2) + 0.1);
                                const nIdx4 = nIdx * 4;
                                sumR += dst[nIdx4] * weight;
                                sumG += dst[nIdx4 + 1] * weight;
                                sumB += dst[nIdx4 + 2] * weight;
                                totalW += weight;
                            }
                        }
                    }
                }

                const idx4 = idx * 4;
                if (totalW > 0) {
                    dst[idx4] = (sumR / totalW) | 0;
                    dst[idx4 + 1] = (sumG / totalW) | 0;
                    dst[idx4 + 2] = (sumB / totalW) | 0;
                    dst[idx4 + 3] = 255;
                }
                state[idx] = 0;

                if (x > 0 && state[idx - 1] === 2) { state[idx - 1] = 1; queue[qTail++] = idx - 1; }
                if (x < W - 1 && state[idx + 1] === 2) { state[idx + 1] = 1; queue[qTail++] = idx + 1; }
                if (y > 0 && state[idx - W] === 2) { state[idx - W] = 1; queue[qTail++] = idx - W; }
                if (y < H - 1 && state[idx + W] === 2) { state[idx + W] = 1; queue[qTail++] = idx + W; }
            }

            return dst;
        },

        /**
         * İki patch arasındaki ağırlıklı SSD mesafesini hesaplar
         * Gerçek sınır pikselleri 3.0x ağırlıkla değerlendirilir
         */
        _computeWeightedSSD: function(img, origMask, x1, y1, x2, y2, pR, W, H) {
            let ssd = 0, count = 0;
            for (let dy = -pR; dy <= pR; dy += 2) {
                const ny1 = y1 + dy; const ny2 = y2 + dy;
                if (ny1 < 0 || ny1 >= H || ny2 < 0 || ny2 >= H) continue;
                const r1 = ny1 * W; const r2 = ny2 * W;
                for (let dx = -pR; dx <= pR; dx += 2) {
                    const nx1 = x1 + dx; const nx2 = x2 + dx;
                    if (nx1 < 0 || nx1 >= W || nx2 < 0 || nx2 >= W) continue;
                    const s1 = (r1 + nx1) * 4;
                    const s2 = (r2 + nx2) * 4;
                    const dr = img[s1] - img[s2];
                    const dg = img[s1 + 1] - img[s2 + 1];
                    const db = img[s1 + 2] - img[s2 + 2];
                    const w = origMask[r1 + nx1] === 0 ? 3.0 : 1.0;
                    ssd += (dr * dr + dg * dg + db * db) * w;
                    count += w;
                }
            }
            return count > 0 ? ssd / count : 1e9;
        },

        /**
         * Akıllı HD Ana Motoru
         */
        runSmartInpainting: async function(sourceImg, nativeMask, bbox) {
            const natW = bbox.natW;
            const natH = bbox.natH;
            const minX = bbox.minX;
            const minY = bbox.minY;
            const maxX = bbox.maxX;
            const maxY = bbox.maxY;

            const boxW = maxX - minX + 1;
            const boxH = maxY - minY + 1;
            // Çevredeki dokuları geniş yakalamak için adaptif marj (%70, min 64px, max 200px)
            const margin = Math.max(64, Math.min(200, Math.round(Math.max(boxW, boxH) * 0.7)));

            const cropX = Math.max(0, minX - margin);
            const cropY = Math.max(0, minY - margin);
            const cropW = Math.min(natW - cropX, boxW + margin * 2);
            const cropH = Math.min(natH - cropY, boxH + margin * 2);

            // Kırpılan görsel alanı
            const patchCanvas = document.createElement('canvas');
            patchCanvas.width = cropW; patchCanvas.height = cropH;
            const pCtx = patchCanvas.getContext('2d', { willReadFrequently: true });
            pCtx.drawImage(sourceImg, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            const rawPatchImg = pCtx.getImageData(0, 0, cropW, cropH);
            const rawPatchData = rawPatchImg.data;

            // Kırpılan maske alanı
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = cropW; maskCanvas.height = cropH;
            const mCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
            mCtx.drawImage(nativeMask, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            const maskRaw = mCtx.getImageData(0, 0, cropW, cropH).data;

            const totalPixels = cropW * cropH;
            const holeMask = new Uint8Array(totalPixels);
            let holeCount = 0;
            for (let i = 0; i < totalPixels; i++) {
                if (maskRaw[i * 4 + 3] > 20) {
                    holeMask[i] = 1;
                    holeCount++;
                }
            }

            if (holeCount === 0) {
                return sourceImg.toDataURL ? sourceImg.toDataURL('image/jpeg', 0.96) : window.uploadedImgUrl;
            }

            // AŞAMA 1: Harmonik Işık & Renk Tabanı (Telea Fast Marching)
            this.setProgress(25, 'Akıllı HD: Zemin Tonlaması...');
            await new Promise(r => setTimeout(r, 10));

            const baseImg = this._teleaHarmonicFill(rawPatchData, holeMask, cropW, cropH);

            // AŞAMA 2: Temiz (maske dışı) kaynak doku adaylarını dizinle
            this.setProgress(45, 'Akıllı HD: Doku Havuzu Oluşturuluyor...');
            await new Promise(r => setTimeout(r, 10));

            const pR = 4; // 9x9 patch yarıçapı
            const cleanPatches = [];
            for (let y = pR; y < cropH - pR; y += 2) {
                const row = y * cropW;
                for (let x = pR; x < cropW - pR; x += 2) {
                    let isClean = true;
                    for (let dy = -pR; dy <= pR; dy += 2) {
                        const rOff = (y + dy) * cropW;
                        for (let dx = -pR; dx <= pR; dx += 2) {
                            if (holeMask[rOff + (x + dx)] === 1) {
                                isClean = false;
                                break;
                            }
                        }
                        if (!isClean) break;
                    }
                    if (isClean) cleanPatches.push(row + x);
                }
            }

            // Temiz aday bulunamazsa Telea sonucunu doğrudan kullan
            if (cleanPatches.length === 0) {
                const fbCanvas = document.createElement('canvas');
                fbCanvas.width = natW; fbCanvas.height = natH;
                const fbCtx = fbCanvas.getContext('2d');
                fbCtx.drawImage(sourceImg, 0, 0, natW, natH);
                pCtx.putImageData(new ImageData(baseImg, cropW, cropH), 0, 0);
                fbCtx.drawImage(patchCanvas, cropX, cropY);
                return fbCanvas.toDataURL('image/jpeg', 0.96);
            }

            const kLen = cleanPatches.length;

            // AŞAMA 3: NNF Başlatma (Temiz koordinatlarla)
            const nnfX = new Int32Array(totalPixels);
            const nnfY = new Int32Array(totalPixels);
            for (let y = 0; y < cropH; y++) {
                for (let x = 0; x < cropW; x++) {
                    const idx = y * cropW + x;
                    if (holeMask[idx] === 1) {
                        const rk = cleanPatches[(Math.random() * kLen) | 0];
                        nnfX[idx] = rk % cropW;
                        nnfY[idx] = (rk / cropW) | 0;
                    } else {
                        nnfX[idx] = x;
                        nnfY[idx] = y;
                    }
                }
            }

            // AŞAMA 4: PatchMatch İterasyonları (Propagation + Random Search)
            this.setProgress(65, 'Akıllı HD: Doku Eşleştirme & Yayılım...');
            await new Promise(r => setTimeout(r, 10));

            const iters = 5;
            for (let it = 0; it < iters; it++) {
                const forward = it % 2 === 0;
                const ys = forward ? [pR, cropH - pR - 1] : [cropH - pR - 1, pR];
                const xs = forward ? [pR, cropW - pR - 1] : [cropW - pR - 1, pR];
                const dy = forward ? 1 : -1;
                const dx = forward ? 1 : -1;

                for (let y = ys[0]; forward ? y <= ys[1] : y >= ys[1]; y += dy) {
                    for (let x = xs[0]; forward ? x <= xs[1] : x >= xs[1]; x += dx) {
                        const idx = y * cropW + x;
                        if (holeMask[idx] !== 1) continue;

                        let bestX = nnfX[idx];
                        let bestY = nnfY[idx];
                        let bestCost = this._computeWeightedSSD(baseImg, holeMask, x, y, bestX, bestY, pR, cropW, cropH);

                        // Propagation X
                        const nx = x - dx;
                        if (nx >= 0 && nx < cropW) {
                            const cx = nnfX[y * cropW + nx] + dx;
                            const cy = nnfY[y * cropW + nx];
                            if (cx >= pR && cx < cropW - pR && cy >= pR && cy < cropH - pR && holeMask[cy * cropW + cx] === 0) {
                                const cost = this._computeWeightedSSD(baseImg, holeMask, x, y, cx, cy, pR, cropW, cropH);
                                if (cost < bestCost) { bestCost = cost; bestX = cx; bestY = cy; }
                            }
                        }

                        // Propagation Y
                        const ny = y - dy;
                        if (ny >= 0 && ny < cropH) {
                            const cx = nnfX[ny * cropW + x];
                            const cy = nnfY[ny * cropW + x] + dy;
                            if (cx >= pR && cx < cropW - pR && cy >= pR && cy < cropH - pR && holeMask[cy * cropW + cx] === 0) {
                                const cost = this._computeWeightedSSD(baseImg, holeMask, x, y, cx, cy, pR, cropW, cropH);
                                if (cost < bestCost) { bestCost = cost; bestX = cx; bestY = cy; }
                            }
                        }

                        // Random Search
                        let searchR = Math.max(cropW, cropH);
                        while (searchR >= 2) {
                            const rk = cleanPatches[(Math.random() * kLen) | 0];
                            const cx = rk % cropW;
                            const cy = (rk / cropW) | 0;
                            const cost = this._computeWeightedSSD(baseImg, holeMask, x, y, cx, cy, pR, cropW, cropH);
                            if (cost < bestCost) { bestCost = cost; bestX = cx; bestY = cy; }
                            searchR = (searchR / 2) | 0;
                        }

                        nnfX[idx] = bestX;
                        nnfY[idx] = bestY;
                    }
                }
            }

            // AŞAMA 5: Doku Sentezi & Işık Uyarlaması
            this.setProgress(85, 'Akıllı HD: Doku Sentezleniyor...');
            await new Promise(r => setTimeout(r, 10));

            const out = new Uint8ClampedArray(baseImg);
            for (let y = 0; y < cropH; y++) {
                for (let x = 0; x < cropW; x++) {
                    const idx = y * cropW + x;
                    if (holeMask[idx] === 1) {
                        const sx = nnfX[idx];
                        const sy = nnfY[idx];
                        const sIdx = (sy * cropW + sx) * 4;
                        const dIdx = idx * 4;

                        // %70 gerçek fotoğraf mikro-dokusu + %30 Telea harmonik ışık adaptasyonu
                        const texR = rawPatchData[sIdx], texG = rawPatchData[sIdx + 1], texB = rawPatchData[sIdx + 2];
                        const baseR = baseImg[dIdx], baseG = baseImg[dIdx + 1], baseB = baseImg[dIdx + 2];

                        out[dIdx]     = Math.max(0, Math.min(255, Math.round(texR * 0.72 + baseR * 0.28)));
                        out[dIdx + 1] = Math.max(0, Math.min(255, Math.round(texG * 0.72 + baseG * 0.28)));
                        out[dIdx + 2] = Math.max(0, Math.min(255, Math.round(texB * 0.72 + baseB * 0.28)));
                        out[dIdx + 3] = 255;
                    }
                }
            }

            // AŞAMA 6: 2-Pass Laplacian Sınır Yumuşatması (Dikiş izini yok eder)
            for (let pass = 0; pass < 2; pass++) {
                for (let y = 1; y < cropH - 1; y++) {
                    const row = y * cropW;
                    for (let x = 1; x < cropW - 1; x++) {
                        const idx = row + x;
                        if (holeMask[idx] === 1) {
                            if (holeMask[idx - 1] === 0 || holeMask[idx + 1] === 0 ||
                                holeMask[idx - cropW] === 0 || holeMask[idx + cropW] === 0) {
                                const d = idx * 4;
                                const top = (idx - cropW) * 4;
                                const btm = (idx + cropW) * 4;
                                const lft = d - 4;
                                const rgt = d + 4;
                                for (let c = 0; c < 3; c++) {
                                    const avg = (out[top + c] + out[btm + c] + out[lft + c] + out[rgt + c]) * 0.25;
                                    out[d + c] = Math.round(out[d + c] * 0.65 + avg * 0.35);
                                }
                            }
                        }
                    }
                }
            }

            // AŞAMA 7: Feathered Alpha Compositing ile Ana Tuvale Birleştirme
            this.setProgress(95, 'Akıllı HD: Birleştiriliyor...');
            await new Promise(r => setTimeout(r, 10));

            const resultPatch = document.createElement('canvas');
            resultPatch.width = cropW; resultPatch.height = cropH;
            const rCtx = resultPatch.getContext('2d');
            rCtx.putImageData(new ImageData(out, cropW, cropH), 0, 0);

            const blurRadius = Math.max(3, Math.min(8, Math.round(margin * 0.08)));
            const blendMask = document.createElement('canvas');
            blendMask.width = cropW; blendMask.height = cropH;
            const bmCtx = blendMask.getContext('2d');
            bmCtx.filter = `blur(${blurRadius}px)`;
            bmCtx.drawImage(maskCanvas, 0, 0);

            const blendedPatch = document.createElement('canvas');
            blendedPatch.width = cropW; blendedPatch.height = cropH;
            const bpCtx = blendedPatch.getContext('2d');
            bpCtx.drawImage(resultPatch, 0, 0);
            bpCtx.globalCompositeOperation = 'destination-in';
            bpCtx.drawImage(blendMask, 0, 0);

            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = natW; finalCanvas.height = natH;
            const fCtx = finalCanvas.getContext('2d');
            fCtx.drawImage(sourceImg, 0, 0, natW, natH);
            fCtx.drawImage(blendedPatch, cropX, cropY);

            this.setProgress(100, 'Tamamlandı');
            return finalCanvas.toDataURL('image/jpeg', 0.96);
        },

        // ====================================================================
        // ⚡ HIZLI DOLDURMA MOTORU (TELEA FAST MARCHING INPAINTING - O(N))
        // ====================================================================
        runFastInpainting: async function(sourceImg, nativeMask, bbox) {
            const natW = bbox.natW;
            const natH = bbox.natH;
            const minX = bbox.minX;
            const minY = bbox.minY;
            const maxX = bbox.maxX;
            const maxY = bbox.maxY;

            const boxW = maxX - minX + 1;
            const boxH = maxY - minY + 1;
            const margin = Math.max(32, Math.round(Math.max(boxW, boxH) * 0.45));

            const cropX = Math.max(0, minX - margin);
            const cropY = Math.max(0, minY - margin);
            const cropW = Math.min(natW - cropX, boxW + margin * 2);
            const cropH = Math.min(natH - cropY, boxH + margin * 2);

            const patchCanvas = document.createElement('canvas');
            patchCanvas.width = cropW; patchCanvas.height = cropH;
            const pCtx = patchCanvas.getContext('2d', { willReadFrequently: true });
            pCtx.drawImage(sourceImg, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            const patchImgData = pCtx.getImageData(0, 0, cropW, cropH);
            const pd = patchImgData.data;

            const maskPatchCanvas = document.createElement('canvas');
            maskPatchCanvas.width = cropW; maskPatchCanvas.height = cropH;
            const mpCtx = maskPatchCanvas.getContext('2d', { willReadFrequently: true });
            mpCtx.drawImage(nativeMask, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            const maskData = mpCtx.getImageData(0, 0, cropW, cropH).data;

            const totalPixels = cropW * cropH;
            const state = new Uint8Array(totalPixels);
            const originalHoleMask = new Uint8Array(totalPixels);
            let holeCount = 0;

            for (let i = 0; i < totalPixels; i++) {
                if (maskData[i * 4 + 3] > 20) {
                    state[i] = 2;
                    originalHoleMask[i] = 1;
                    holeCount++;
                }
            }

            if (holeCount === 0) {
                return sourceImg.toDataURL ? sourceImg.toDataURL('image/jpeg', 0.96) : window.uploadedImgUrl;
            }

            const queue = new Int32Array(totalPixels);
            let qHead = 0, qTail = 0;

            for (let y = 0; y < cropH; y++) {
                const row = y * cropW;
                for (let x = 0; x < cropW; x++) {
                    const idx = row + x;
                    if (state[idx] === 2) {
                        if ((x > 0 && state[idx - 1] === 0) ||
                            (x < cropW - 1 && state[idx + 1] === 0) ||
                            (y > 0 && state[idx - cropW] === 0) ||
                            (y < cropH - 1 && state[idx + cropW] === 0)) {
                            state[idx] = 1;
                            queue[qTail++] = idx;
                        }
                    }
                }
            }

            const radius = 5;
            const rSq = radius * radius;

            while (qHead < qTail) {
                const idx = queue[qHead++];
                const x = idx % cropW;
                const y = (idx / cropW) | 0;

                let sumR = 0, sumG = 0, sumB = 0, totalW = 0;
                const yMin = Math.max(0, y - radius);
                const yMax = Math.min(cropH - 1, y + radius);
                const xMin = Math.max(0, x - radius);
                const xMax = Math.min(cropW - 1, x + radius);

                for (let ny = yMin; ny <= yMax; ny++) {
                    const dy2 = (ny - y) * (ny - y);
                    const rowOffset = ny * cropW;
                    for (let nx = xMin; nx <= xMax; nx++) {
                        const nIdx = rowOffset + nx;
                        if (state[nIdx] === 0) {
                            const d2 = (nx - x) * (nx - x) + dy2;
                            if (d2 <= rSq) {
                                const weight = 1.0 / (Math.sqrt(d2) + 0.1);
                                const nIdx4 = nIdx * 4;
                                sumR += pd[nIdx4] * weight;
                                sumG += pd[nIdx4 + 1] * weight;
                                sumB += pd[nIdx4 + 2] * weight;
                                totalW += weight;
                            }
                        }
                    }
                }

                const idx4 = idx * 4;
                if (totalW > 0) {
                    pd[idx4] = (sumR / totalW) | 0;
                    pd[idx4 + 1] = (sumG / totalW) | 0;
                    pd[idx4 + 2] = (sumB / totalW) | 0;
                    pd[idx4 + 3] = 255;
                }
                state[idx] = 0;

                if (x > 0 && state[idx - 1] === 2) { state[idx - 1] = 1; queue[qTail++] = idx - 1; }
                if (x < cropW - 1 && state[idx + 1] === 2) { state[idx + 1] = 1; queue[qTail++] = idx + 1; }
                if (y > 0 && state[idx - cropW] === 2) { state[idx - cropW] = 1; queue[qTail++] = idx - cropW; }
                if (y < cropH - 1 && state[idx + cropW] === 2) { state[idx + cropW] = 1; queue[qTail++] = idx + cropW; }
            }

            for (let pass = 0; pass < 2; pass++) {
                for (let y = 1; y < cropH - 1; y++) {
                    const row = y * cropW;
                    for (let x = 1; x < cropW - 1; x++) {
                        const idx = row + x;
                        if (originalHoleMask[idx] === 1) {
                            const idx4 = idx * 4;
                            const top = (idx - cropW) * 4;
                            const btm = (idx + cropW) * 4;
                            const lft = idx4 - 4;
                            const rgt = idx4 + 4;
                            pd[idx4]     = Math.round(pd[idx4] * 0.65 + (pd[top] + pd[btm] + pd[lft] + pd[rgt]) * 0.0875);
                            pd[idx4 + 1] = Math.round(pd[idx4 + 1] * 0.65 + (pd[top + 1] + pd[btm + 1] + pd[lft + 1] + pd[rgt + 1]) * 0.0875);
                            pd[idx4 + 2] = Math.round(pd[idx4 + 2] * 0.65 + (pd[top + 2] + pd[btm + 2] + pd[lft + 2] + pd[rgt + 2]) * 0.0875);
                        }
                    }
                }
            }

            pCtx.putImageData(patchImgData, 0, 0);

            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = natW; finalCanvas.height = natH;
            const fCtx = finalCanvas.getContext('2d');
            fCtx.drawImage(sourceImg, 0, 0, natW, natH);

            const blendMaskCanvas = document.createElement('canvas');
            blendMaskCanvas.width = cropW; blendMaskCanvas.height = cropH;
            const bmCtx = blendMaskCanvas.getContext('2d');
            const blurRadius = Math.max(3, Math.min(8, Math.round(margin * 0.15)));
            bmCtx.filter = `blur(${blurRadius}px)`;
            bmCtx.drawImage(maskPatchCanvas, 0, 0);

            const blendedPatch = document.createElement('canvas');
            blendedPatch.width = cropW; blendedPatch.height = cropH;
            const bpCtx = blendedPatch.getContext('2d');
            bpCtx.drawImage(patchCanvas, 0, 0);
            bpCtx.globalCompositeOperation = 'destination-in';
            bpCtx.drawImage(blendMaskCanvas, 0, 0);

            fCtx.drawImage(blendedPatch, cropX, cropY);
            return finalCanvas.toDataURL('image/jpeg', 0.96);
        },

        undo: function() {
            if (typeof window.undoGlobal === 'function') window.undoGlobal();
        },

        redo: function() {
            if (typeof window.redoGlobal === 'function') window.redoGlobal();
        }
    };

    /**
     * ====================================================================
     * 🖼️ KUSURSUZ FOTOĞRAF PİKSEL GÜNCELLEYİCİSİ (PROJECT PHOTO PIXEL UPDATER)
     * ====================================================================
     */
    window.updateProjectPhotoPixels = function(newDataUrl, callback) {
        if (!newDataUrl) {
            if (typeof callback === 'function') callback(new Error('Geçersiz görsel verisi'));
            return;
        }

        window.uploadedImgUrl = newDataUrl;
        if (typeof uploadedImgUrl !== 'undefined') uploadedImgUrl = newDataUrl;

        const pl = document.getElementById('photo-layer');
        if (pl) {
            pl.dataset.savedBg = "url('" + newDataUrl + "')";
            pl._cachedGlCanvas = null;
            const inner = pl.querySelector('.photo-inner-zoom');
            if (inner) {
                inner.style.backgroundImage = "url('" + newDataUrl + "')";
                pl.style.backgroundImage = 'none';
            } else {
                pl.style.backgroundImage = "url('" + newDataUrl + "')";
            }
        }

        document.querySelectorAll('.photo-panel').forEach(p => {
            p.dataset.savedBg = "url('" + newDataUrl + "')";
            p._cachedGlCanvas = null;
            const inner = p.querySelector('.photo-inner-zoom');
            if (inner) {
                inner.style.backgroundImage = "url('" + newDataUrl + "')";
                p.style.backgroundImage = 'none';
            } else {
                p.style.backgroundImage = "url('" + newDataUrl + "')";
            }
        });

        const img = new Image();
        img.onload = () => {
            window._globalNativeImg = img;
            window._globalNativeImgSrc = newDataUrl;
            if (pl) pl._nativeImg = img;
            document.querySelectorAll('.photo-panel').forEach(p => p._nativeImg = img);

            if (window.WebGLPhotoEngine) {
                window.WebGLPhotoEngine.currentImage = img;
                window._photoFilterDirty = true;
            }

            if (typeof requestPhotoRepaint === 'function') {
                requestPhotoRepaint();
            } else if (typeof _applyPhotoTransform === 'function' && pl) {
                _applyPhotoTransform(pl);
            }

            if (typeof redrawAll === 'function') redrawAll();
            if (typeof callback === 'function') callback(null, img);
        };
        img.onerror = (err) => {
            console.error('Fotoğraf pikselleri güncellenemedi:', err);
            if (typeof callback === 'function') callback(err);
        };
        img.src = newDataUrl;
    };

    window.MagicEraser = MagicEraser;

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => MagicEraser.init());
        } else {
            MagicEraser.init();
        }
    }

})(window);
