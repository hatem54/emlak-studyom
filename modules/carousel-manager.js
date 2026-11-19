/**
 * ========================================================
 * EMLAK STÜDYOM - ÇOKLU SAYFA / KARUSEL (CAROUSEL) YÖNETİCİSİ
 * modules/carousel-manager.js
 * ========================================================
 */

(function(window) {
    'use strict';

    const CarouselManager = {
        pages: [],
        activePageIndex: 0,
        isVisible: false,

        /**
         * Başlatıcı: İlk Sayfayı Oluştur
         */
        init: function() {
            if (this.pages.length === 0) {
                this.pages.push({
                    id: 'page_' + Date.now(),
                    title: 'Kapak',
                    snapshot: null,
                    thumb: null
                });
                this.activePageIndex = 0;
            }
            this.renderFilmstrip();
        },

        /**
         * Film Şeridini Dock Üzerine Hizala
         */
        positionBarAboveDock: function() {
            const bar = document.getElementById('carouselFilmstripBar');
            const dock = document.getElementById('canvasBottomDock');
            if (!bar) return;

            if (dock && dock.offsetParent !== null) {
                const dockRect = dock.getBoundingClientRect();
                const bottomDist = window.innerHeight - dockRect.top + 6;
                bar.style.bottom = `${Math.max(52, Math.round(bottomDist))}px`;
            } else {
                bar.style.bottom = '58px';
            }
        },

        /**
         * Karusel Film Şeridini Aç / Kapat veya Tuval Göstergesini Senkronize Et
         */
        toggleBar: function(forceState) {
            if (forceState !== undefined) {
                this.isVisible = !!forceState;
            } else {
                this.isVisible = !this.isVisible;
            }
            if (this.isVisible) {
                this.syncFromStaging(true);
            }
            const badge = document.getElementById('canvasCarouselBadge');
            if (badge) {
                badge.style.display = (this.isVisible && this.pages.length > 1) ? 'flex' : 'none';
            }
            const bar = document.getElementById('carouselFilmstripBar');
            if (bar) bar.style.display = 'none';
        },

        /**
         * Görsel Havuzundaki Fotoğrafları Karusel Albüm Sayfalarına Senkronize Eder
         */
        syncFromStaging: function(silent = false) {
            const psa = window.PhotoStagingArchive;
            if (!psa || !Array.isArray(psa.items) || psa.items.length === 0) {
                const batchCounter = document.getElementById('carouselBatchCountText');
                if (batchCounter) batchCounter.textContent = '0 Sayfa Mevcut';
                if (!silent && typeof window.showAppToast === 'function') {
                    window.showAppToast('Görsel havuzunda fotoğraf bulunamadı.', 'warning');
                }
                return;
            }

            const targets = (typeof psa.getSelectedItems === 'function') ? psa.getSelectedItems() : [];
            const itemsToUse = (targets && targets.length > 0) ? targets : psa.items;

            // Mevcut düzenlenmiş sayfaların snapshot ve özel başlıklarını koru
            const prevByStagingId = new Map();
            const customStandalonePages = [];
            (this.pages || []).forEach(p => {
                if (p && p.stagingItemId) prevByStagingId.set(p.stagingItemId, p);
                else if (p && p.snapshot) customStandalonePages.push(p);
            });

            const synced = itemsToUse.map((it, idx) => {
                const existing = prevByStagingId.get(it.id);
                if (existing) {
                    existing.thumb = it.thumbUrl || it.dataUrl || existing.thumb;
                    if (existing.snapshot && !existing.snapshot._carouselEdited) {
                        existing.snapshot.photoImgUrl = it.dataUrl;
                        existing.snapshot.uploadedImgUrl = it.dataUrl;
                    }
                    return existing;
                }
                return {
                    id: 'page_staging_' + (it.key || 'snap') + '_' + Date.now() + '_' + idx,
                    title: it.title || `Sayfa ${idx + 1}`,
                    stagingItemId: it.id,
                    snapshot: {
                        photoImgUrl: it.dataUrl,
                        uploadedImgUrl: it.dataUrl,
                        activeLayout: window.activeLayout || '',
                        timestamp: Date.now()
                    },
                    thumb: it.thumbUrl || it.dataUrl
                };
            });

            this.pages = synced.concat(customStandalonePages);

            this.isVisible = true;
            if (this.activePageIndex >= this.pages.length) {
                this.activePageIndex = 0;
            }

            // Çıktı sekmesindeki sayacı anında güncelle
            const batchCounter = document.getElementById('carouselBatchCountText');
            if (batchCounter) {
                batchCounter.textContent = `${this.pages.length} Sayfa Mevcut`;
            }

            if (typeof psa.syncCanvasCarouselBadge === 'function') {
                psa.syncCanvasCarouselBadge();
            }

            if (!silent && typeof window.showAppToast === 'function') {
                window.showAppToast(`Havuzdaki ${this.pages.length} görsel albüme eşitlendi.`, 'success', 2500);
            }
        },

        /**
         * Önceki Sayfaya Geç
         */
        prevPage: function() {
            if (this.pages.length <= 1) return;
            const targetIdx = (this.activePageIndex - 1 + this.pages.length) % this.pages.length;
            this.switchPage(targetIdx);
        },

        /**
         * Sonraki Sayfaya Geç
         */
        nextPage: function() {
            if (this.pages.length <= 1) return;
            const targetIdx = (this.activePageIndex + 1) % this.pages.length;
            this.switchPage(targetIdx);
        },

        /**
         * Sayfa Sırasını Değiştir (Sola/Sağa Taşı)
         */
        movePage: function(idx, direction) {
            const targetIdx = idx + direction;
            if (targetIdx < 0 || targetIdx >= this.pages.length) return;

            if (typeof window.captureFullState === 'function') {
                this.pages[this.activePageIndex].snapshot = window.captureFullState();
            }

            const temp = this.pages[idx];
            this.pages[idx] = this.pages[targetIdx];
            this.pages[targetIdx] = temp;

            if (this.activePageIndex === idx) {
                this.activePageIndex = targetIdx;
            } else if (this.activePageIndex === targetIdx) {
                this.activePageIndex = idx;
            }

            this.renderFilmstrip();
            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Sayfa Sırası Değiştirildi');
            }
        },

        /**
         * Yeni Sayfa Ekle (+)
         */
        addPage: function(title) {
            // 1. Mevcut sayfayı kaydet
            if (typeof window.captureFullState === 'function') {
                this.pages[this.activePageIndex].snapshot = window.captureFullState();
            }

            const newPageNumber = this.pages.length + 1;
            const newTitle = title || (newPageNumber === 2 ? 'Salon' : (newPageNumber === 3 ? 'Mutfak' : `Sayfa ${newPageNumber}`));

            // 2. Yeni sayfa kaydı oluştur
            const newPage = {
                id: 'page_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                title: newTitle,
                snapshot: null,
                thumb: null
            };

            this.pages.push(newPage);
            const targetIdx = this.pages.length - 1;

            // 3. Tuvali yeni sayfa için temizle
            document.querySelectorAll('.tb-image-frame, .tb-portfolio-text, .tb-layout-text').forEach(el => el.remove());

            this.activePageIndex = targetIdx;
            this.pages[targetIdx].snapshot = typeof window.captureFullState === 'function' ? window.captureFullState() : null;

            this.renderFilmstrip();

            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Yeni Albüm Sayfası Eklendi: ' + newTitle);
            }
            if (typeof window.renderLayers === 'function') {
                window.renderLayers();
            }
            if (window.CanvasEmptyState && typeof window.CanvasEmptyState.updateState === 'function') {
                window.CanvasEmptyState.resetDismiss();
                window.CanvasEmptyState.updateState();
            }
        },

        /**
         * Seçili Sayfayı Çoğalt (Duplicate)
         */
        duplicatePage: function(idx) {
            if (typeof window.captureFullState === 'function') {
                this.pages[this.activePageIndex].snapshot = window.captureFullState();
            }

            const sourcePage = this.pages[idx];
            if (!sourcePage) return;

            const clonedSnapshot = sourcePage.snapshot ? JSON.parse(JSON.stringify(sourcePage.snapshot)) : null;

            const duplicated = {
                id: 'page_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                title: sourcePage.title + ' Kopya',
                snapshot: clonedSnapshot,
                thumb: sourcePage.thumb
            };

            this.pages.splice(idx + 1, 0, duplicated);
            this.switchPage(idx + 1);

            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Albüm Sayfası Çoğaltıldı');
            }
        },

        /**
         * Sayfayı Sil
         */
        deletePage: function(idx) {
            if (this.pages.length <= 1) return;

            this.pages.splice(idx, 1);
            if (this.activePageIndex >= this.pages.length) {
                this.activePageIndex = this.pages.length - 1;
            }

            const targetPage = this.pages[this.activePageIndex];
            if (targetPage && targetPage.snapshot && typeof window.applySnapshot === 'function') {
                window.applySnapshot(targetPage.snapshot);
            }

            this.renderFilmstrip();

            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Albüm Sayfası Silindi');
            }
            if (typeof window.renderLayers === 'function') {
                window.renderLayers();
            }
        },

        /**
         * Sayfa Değiştir (Switch Page)
         */
        switchPage: function(targetIdx) {
            if (targetIdx === this.activePageIndex || targetIdx < 0 || targetIdx >= this.pages.length) return;

            // 1. Mevcut sayfayı kaydet
            if (typeof window.captureFullState === 'function' && this.pages[this.activePageIndex]) {
                this.pages[this.activePageIndex].snapshot = window.captureFullState();
            }

            this.activePageIndex = targetIdx;
            const targetPage = this.pages[targetIdx];

            // 2. Hedef sayfanın staging havuzuyla senkronizasyonu
            if (targetPage && targetPage.stagingItemId && window.PhotoStagingArchive) {
                window.PhotoStagingArchive.activeItemId = targetPage.stagingItemId;
                window.PhotoStagingArchive.updateActiveCardUI();
            }

            // 3. Hedef sayfanın snapshot'ını veya görselini tuvale yükle
            if (targetPage && targetPage.snapshot && typeof window.applySnapshot === 'function') {
                window.applySnapshot(targetPage.snapshot);
            } else if (targetPage && targetPage.stagingItemId && window.PhotoStagingArchive) {
                window.PhotoStagingArchive.applyToCanvas(targetPage.stagingItemId, true);
            } else if (targetPage && (targetPage.thumb || (targetPage.snapshot && (targetPage.snapshot.photoImgUrl || targetPage.snapshot.uploadedImgUrl)))) {
                const imgUrl = targetPage.thumb || (targetPage.snapshot && (targetPage.snapshot.photoImgUrl || targetPage.snapshot.uploadedImgUrl));
                if (typeof window.applyProjectImageFromDataUrl === 'function') {
                    window.applyProjectImageFromDataUrl(imgUrl);
                }
            } else {
                document.querySelectorAll('.tb-image-frame, .tb-portfolio-text, .tb-layout-text').forEach(el => el.remove());
            }

            this.renderFilmstrip();

            if (typeof window.renderLayers === 'function') {
                window.renderLayers();
            }
        },

        /**
         * Sayfa Başlığını Düzenle
         */
        editPageTitle: function(idx, newTitle) {
            if (this.pages[idx]) {
                const clean = (newTitle || '').trim();
                if (clean) {
                    this.pages[idx].title = clean;
                    this.renderFilmstrip();
                }
            }
        },

        /**
         * Film Şeridini Render Et
         */
        renderFilmstrip: function() {
            const container = document.getElementById('carouselSlidesStrip');
            if (!container) return;

            // 1. Çıktı sekmesindeki sayaç
            const batchCounter = document.getElementById('carouselBatchCountText');
            if (batchCounter) {
                batchCounter.textContent = `${this.pages.length} Sayfa Mevcut`;
            }

            // 2. Tuval sol üst otomatik sayfa rozeti
            const canvasBadge = document.getElementById('canvasCarouselBadge');
            const canvasBadgeText = document.getElementById('canvasCarouselBadgeText');
            if (canvasBadge) {
                canvasBadge.style.display = this.pages.length > 1 ? 'flex' : 'none';
            }
            if (canvasBadgeText && this.pages[this.activePageIndex]) {
                canvasBadgeText.textContent = `Sayfa ${this.activePageIndex + 1} / ${this.pages.length} • ${this.pages[this.activePageIndex].title}`;
            }

            // 3. Film şeridi kartları
            container.innerHTML = '';

            this.pages.forEach((page, idx) => {
                const card = document.createElement('div');
                card.className = `carousel-slide-card ${idx === this.activePageIndex ? 'active' : ''}`;
                card.title = `${page.title} — Düzenlemek için tıkla`;
                card.onclick = () => this.switchPage(idx);

                // Küçük Resim (Thumbnail)
                const thumbSrc = page.thumb || (page.snapshot && (page.snapshot.photoImgUrl || page.snapshot.uploadedImgUrl));
                if (thumbSrc) {
                    const thumbImg = document.createElement('img');
                    thumbImg.className = 'carousel-slide-thumb';
                    thumbImg.src = thumbSrc;
                    thumbImg.alt = page.title || `Sayfa ${idx + 1}`;
                    card.appendChild(thumbImg);
                }

                // Sayfa Numarası Rozeti
                const badge = document.createElement('span');
                badge.className = 'carousel-slide-badge';
                badge.textContent = idx + 1;
                card.appendChild(badge);

                // Başlık & İsim Değiştirme
                const title = document.createElement('span');
                title.className = 'carousel-slide-title';
                title.title = 'İsmi düzenlemek için tıkla';
                title.innerHTML = `<span>${page.title}</span><i class="fa-solid fa-pen" style="font-size:7px; opacity:0.8;"></i>`;
                title.onclick = async (e) => {
                    e.stopPropagation();
                    let newT = null;
                    if (window.AppDialog && typeof window.AppDialog.prompt === 'function') {
                        newT = await window.AppDialog.prompt({
                            title: 'Sayfa Başlığı',
                            message: 'Sayfa için yeni bir başlık girin:',
                            defaultValue: page.title,
                            icon: 'fa-pen',
                            confirmText: 'Kaydet',
                            cancelText: 'Vazgeç'
                        });
                    } else {
                        newT = prompt('Sayfa Adı:', page.title);
                    }
                    if (newT !== null && newT.trim()) {
                        this.editPageTitle(idx, newT.trim());
                    }
                };
                card.appendChild(title);

                // Hover Araçları: Sola Taşı, Sağa Taşı, Çoğalt, Sil
                const tools = document.createElement('div');
                tools.className = 'carousel-slide-tools';

                if (idx > 0) {
                    const leftBtn = document.createElement('button');
                    leftBtn.className = 'carousel-slide-btn';
                    leftBtn.title = 'Sola Taşı';
                    leftBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
                    leftBtn.onclick = (e) => {
                        e.stopPropagation();
                        this.movePage(idx, -1);
                    };
                    tools.appendChild(leftBtn);
                }

                if (idx < this.pages.length - 1) {
                    const rightBtn = document.createElement('button');
                    rightBtn.className = 'carousel-slide-btn';
                    rightBtn.title = 'Sağa Taşı';
                    rightBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
                    rightBtn.onclick = (e) => {
                        e.stopPropagation();
                        this.movePage(idx, 1);
                    };
                    tools.appendChild(rightBtn);
                }

                const dupBtn = document.createElement('button');
                dupBtn.className = 'carousel-slide-btn';
                dupBtn.title = 'Sayfayı Çoğalt';
                dupBtn.innerHTML = '<i class="fa-solid fa-clone"></i>';
                dupBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.duplicatePage(idx);
                };
                tools.appendChild(dupBtn);

                if (this.pages.length > 1) {
                    const delBtn = document.createElement('button');
                    delBtn.className = 'carousel-slide-btn btn-del';
                    delBtn.title = 'Sayfayı Sil';
                    delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
                    delBtn.onclick = (e) => {
                        e.stopPropagation();
                        this.deletePage(idx);
                    };
                    tools.appendChild(delBtn);
                }

                card.appendChild(tools);
                container.appendChild(card);
            });

            if (this.isVisible) {
                this.positionBarAboveDock();
            }
        },

        /**
         * Tüm Albümü Tek Tıkla ZIP Olarak İndir (Batch Export)
         */
        exportAllPages: async function(mode = 'folder', options = {}) {
            if (this.pages.length === 0) return;

            // 1. Mevcut sayfayı kaydet
            if (typeof window.captureFullState === 'function' && this.pages[this.activePageIndex]) {
                const snap = window.captureFullState();
                snap._carouselEdited = true;
                this.pages[this.activePageIndex].snapshot = snap;
            }

            if (typeof window.validateExportAllowed === 'function') {
                const check = window.validateExportAllowed();
                if (!check.allowed) {
                    if (typeof showProUpgradeToast === 'function') showProUpgradeToast(check.message);
                    else alert(check.message || 'Pro özellik gereklidir.');
                    return;
                }
            }

            const origIndex = this.activePageIndex;

            // 2. Klasör modunda dizin seçimi (File System Access API)
            let dirHandle = null;
            if (mode === 'folder') {
                if ('showDirectoryPicker' in window) {
                    try {
                        dirHandle = await window.showDirectoryPicker({
                            mode: 'readwrite',
                            startIn: 'pictures'
                        });
                    } catch (err) {
                        if (err.name === 'AbortError') {
                            return; // Kullanıcı iptal etti
                        }
                        console.warn('showDirectoryPicker error:', err);
                    }
                }

                if (!dirHandle) {
                    mode = 'individual';
                }
            }

            // 3. İlerleme Bannerı
            let progressModal = document.getElementById('carouselExportProgress');
            if (!progressModal) {
                progressModal = document.createElement('div');
                progressModal.id = 'carouselExportProgress';
                progressModal.style.position = 'fixed';
                progressModal.style.top = '20px';
                progressModal.style.left = '50%';
                progressModal.style.transform = 'translateX(-50%)';
                progressModal.style.background = '#0f172a';
                progressModal.style.color = '#ffffff';
                progressModal.style.padding = '12px 24px';
                progressModal.style.borderRadius = '8px';
                progressModal.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4)';
                progressModal.style.zIndex = '999999';
                progressModal.style.fontSize = '13px';
                progressModal.style.fontWeight = '700';
                progressModal.style.display = 'flex';
                progressModal.style.alignItems = 'center';
                progressModal.style.gap = '10px';
                document.body.appendChild(progressModal);
            }

            progressModal.style.display = 'flex';
            progressModal.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="color:#0ea5e9;"></i> <span>Çoklu gönderi albümü hazırlanıyor...</span>';

            const zip = (mode === 'zip' && window.JSZip) ? new window.JSZip() : null;

            // Çıktı parametreleri (Format & Kalite)
            const scaleVal = (document.getElementById('exportScale') ? parseFloat(document.getElementById('exportScale').value) : 2) || 2;
            const outputScale = Math.max(scaleVal, 2);
            const fileType = (document.getElementById('exportFileType') ? document.getElementById('exportFileType').value : 'png');
            const isJpg = fileType === 'jpg' || fileType === 'jpeg';
            const mimeType = isJpg ? 'image/jpeg' : 'image/png';
            const quality = isJpg ? 0.95 : undefined;
            const ext = isJpg ? 'jpg' : 'png';

            try {
                for (let i = 0; i < this.pages.length; i++) {
                    const page = this.pages[i];
                    this.activePageIndex = i;
                    progressModal.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="color:#0ea5e9;"></i> <span>Sayfa ${i + 1} / ${this.pages.length}: ${page.title} işleniyor...</span>`;

                    // Sayfayı tuvale yükle (özel düzenleme varsa tam snapshot öncelikli)
                    if (page.snapshot && page.snapshot._carouselEdited && typeof window.applySnapshot === 'function') {
                        await window.applySnapshot(page.snapshot);
                    } else if (page.stagingItemId && window.PhotoStagingArchive) {
                        window.PhotoStagingArchive.applyToCanvas(page.stagingItemId, true);
                    } else if (page.snapshot && typeof window.applySnapshot === 'function') {
                        await window.applySnapshot(page.snapshot);
                    }

                    // Render tamamlanması için bekleme
                    await new Promise(r => setTimeout(r, 260));

                    const cleanTitle = (page.title || `Sayfa_${i + 1}`).replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ_-]/g, '_');
                    const fileName = `Sayfa_${i + 1}_${cleanTitle}.${ext}`;
                    let blob = null;

                    if (typeof window.saveImage === 'function') {
                        const res = await window.saveImage(`Sayfa_${i + 1}_${cleanTitle}`, {
                            returnBlob: true,
                            skipDownload: true,
                            silentLoading: true,
                            fileType: isJpg ? 'jpg' : 'png'
                        });
                        if (res && res.blob) blob = res.blob;
                    }

                    if (!blob) {
                        const cContainer = document.getElementById('canvas-container');
                        if (cContainer && window.html2canvas) {
                            const prevTransform = cContainer.style.transform;
                            cContainer.style.transform = 'none';
                            try {
                                const canvas = await window.html2canvas(cContainer, {
                                    scale: outputScale,
                                    useCORS: true,
                                    backgroundColor: isJpg ? '#ffffff' : null,
                                    logging: false
                                });
                                blob = await new Promise(res => canvas.toBlob(res, mimeType, quality));
                            } finally {
                                cContainer.style.transform = prevTransform;
                            }
                        }
                    }

                    if (blob) {
                        if (mode === 'folder' && dirHandle) {
                            const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
                            const writable = await fileHandle.createWritable();
                            await writable.write(blob);
                            await writable.close();
                        } else if (mode === 'zip' && zip) {
                            zip.file(fileName, blob);
                        } else {
                            const dlUrl = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.download = fileName;
                            a.href = dlUrl;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            setTimeout(() => { try { URL.revokeObjectURL(dlUrl); } catch(_){} }, 5000);
                            await new Promise(r => setTimeout(r, 450));
                        }
                    }
                }

                if (mode === 'zip' && zip) {
                    progressModal.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="color:#10b981;"></i> <span>ZIP arşivi paketleniyor...</span>';
                    const content = await zip.generateAsync({ type: 'blob' });
                    const zipUrl = URL.createObjectURL(content);
                    const a = document.createElement('a');
                    a.download = 'Emlak_Studyom_Coklu_Gonderi_Albumu.zip';
                    a.href = zipUrl;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    setTimeout(() => { try { URL.revokeObjectURL(zipUrl); } catch(_){} }, 120000);
                }

                let successMsg = 'Tüm albüm başarıyla indirildi!';
                if (mode === 'folder') {
                    successMsg = `${this.pages.length} sayfa seçtiğiniz klasöre başarıyla kaydedildi!`;
                } else if (mode === 'individual') {
                    successMsg = `${this.pages.length} sayfa ayrı görsel olarak indirildi!`;
                } else if (mode === 'zip') {
                    successMsg = 'Çoklu gönderi ZIP arşivi başarıyla indirildi!';
                }

                progressModal.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#10b981;"></i> <span>${successMsg}</span>`;
                setTimeout(() => { progressModal.style.display = 'none'; }, 2600);

            } catch (err) {
                console.error("Carousel export error:", err);
                progressModal.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color:#ef4444;"></i> <span>Dışa aktarma sırasında hata oluştu.</span>';
                setTimeout(() => { progressModal.style.display = 'none'; }, 3000);
            } finally {
                // Orijinal sayfayı mutlaka geri yükle (activePageIndex aynı kalsa bile zorla uygula)
                const origPage = this.pages[origIndex];
                this.activePageIndex = origIndex;
                if (origPage) {
                    if (origPage.snapshot && typeof window.applySnapshot === 'function') {
                        try { await window.applySnapshot(origPage.snapshot); } catch(_) {}
                    } else if (origPage.stagingItemId && window.PhotoStagingArchive) {
                        window.PhotoStagingArchive.applyToCanvas(origPage.stagingItemId, true);
                    }
                }
                this.renderFilmstrip();
            }
        },

        /**
         * Geriye uyumluluk için ZIP fonksiyonu
         */
        exportAllPagesZip: function() {
            return this.exportAllPages('zip');
        }
    };

    window.CarouselManager = CarouselManager;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CarouselManager.init());
    } else {
        CarouselManager.init();
    }

})(window);
