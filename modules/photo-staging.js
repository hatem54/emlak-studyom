/**
 * =========================================================================
 * EMLAK STÜDYOM - SOL PANEL GÖRSEL HAVUZU (PHOTO STAGING PANEL) (PRO v7.2)
 * modules/photo-staging.js
 * =========================================================================
 * - 3B Drone çekimleri, uydu kadrajları ve bilgisayardan yüklenen fotoğrafları
 *   sol paneldeki "Görseller" sekmesinde depolar.
 * - Tıkla-Düzenle: Herhangi bir karta tıklandığında anında tuvale aktarılır.
 * - Kaynak Filtreleri: Tümü, 3B Drone, Uydu, Yüklenenler
 * - Toplu İşlemler & Yeni Yetenekler:
 *   * Toplu İndir (ZIP)
 *   * Filigran & Logo Damgalama (Konum, Boyut, Opaklık ayarlı)
 *   * Format & Kadraj Uyarlama (1:1 Kare, 9:16 Dikey, 16:9 Yatay - Bulanık Zemin)
 *   * PDF Portföy / Sunum Broşürü (A4 şık emlak tanıtım broşürü)
 *   * Öncesi / Sonrası İnteraktif Karşılaştırma Modalı
 *   * Karusel Çok Sayfalı Albüme Dönüştür
 *   * Toplu AI Netleştirme & Keskinleştirme
 *   * Toplu & Tekil Silme
 * =========================================================================
 */

(function(window) {
    'use strict';

    const PhotoStagingArchive = {
        items: [],
        activeItemId: null,
        selectedIds: new Set(),
        currentFilter: 'all', // 'all', 'drone', 'satellite', 'upload'
        watermarkTrayOpen: false,
        formatTrayOpen: false,
        aiTrayOpen: false,
        aiIntensity: 0.35,
        watermarkOptions: {
            position: 'bottom-right',
            scale: 20,
            opacity: 85,
            customLogoUrl: null
        },
        formatOptions: {
            ratio: '1:1', // '1:1', '9:16', '16:9'
            mode: 'contain_blur' // 'contain_blur', 'cover'
        },
        initialized: false,

        /**
         * Modülü Başlatır ve Dinleyicileri Kurar
         */
        init: function() {
            if (this.initialized) return;
            this.initialized = true;

            // Eski tuval altı çekmecesi varsa DOM'dan temizle
            const oldDrawer = document.getElementById('photoStagingDrawer');
            if (oldDrawer) oldDrawer.remove();

            // İlk render
            this.renderPanel();
            this.syncExternalTabs();

            // Sürükle-bırak olaylarını kur
            this.initDropzoneListeners();
        },

        /**
         * Yeni Çekim Öğeleriyle Havuzu Doldurur ve Sol Sekmeyi Açar
         */
        openWithItems: function(newItems) {
            if (!Array.isArray(newItems) || newItems.length === 0) return;

            // Yeni gelen çekimleri ekle (aynı id varsa ez)
            newItems.forEach(item => {
                const existingIdx = this.items.findIndex(it => it.id === item.id);
                if (existingIdx >= 0) {
                    this.items[existingIdx] = item;
                } else {
                    this.items.push(item);
                }
            });

            this.activeItemId = newItems[0].id;
            this.selectedIds = new Set(this.items.map(it => it.id));

            this.renderPanel();
            this.updateBadgeCount();
            this.syncExternalTabs();

            // İlk görseli tuvale otomatik yükle
            if (newItems[0] && newItems[0].dataUrl) {
                this.applyToCanvas(newItems[0].id, true);
            }

            // Sol sekmeyi otomatik "Görseller" sekmesine geçir
            this.switchToStagingTab();
        },

        /**
         * Tekil Yeni Görsel Ekler (Uydu anlık çekimi, ekran alıntısı vb.)
         */
        addItem: function(item, shouldSwitchTab = false) {
            if (!item || !item.dataUrl) return;
            if (!item.id) item.id = 'photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
            if (!item.originalDataUrl) item.originalDataUrl = item.dataUrl;
            if (!item.thumbUrl) item.thumbUrl = item.dataUrl;

            // Havuzun en başına ekle
            this.items.unshift(item);
            this.activeItemId = item.id;
            this.selectedIds.add(item.id);

            this.renderPanel();
            this.updateBadgeCount();
            this.syncExternalTabs();

            if (shouldSwitchTab) {
                this.switchToStagingTab();
            }

            // Otomatik olarak tuvale aktar
            this.applyToCanvas(item.id, true);

            if (typeof window.recordHistoryImmediate === 'function' && !window.isHistoryRestoring) {
                window.recordHistoryImmediate('Havuz Görsel Eklendi');
            }
        },

        /**
         * Toplu Görseller Ekler
         */
        addItems: function(itemsList, shouldSwitchTab = true) {
            if (!Array.isArray(itemsList) || itemsList.length === 0) return;
            itemsList.forEach(it => {
                if (it && it.dataUrl) {
                    if (!it.id) it.id = 'photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
                    if (!it.originalDataUrl) it.originalDataUrl = it.dataUrl;
                    if (!it.thumbUrl) it.thumbUrl = it.dataUrl;
                    this.items.unshift(it);
                    this.selectedIds.add(it.id);
                }
            });
            if (itemsList[0]) this.activeItemId = itemsList[0].id;

            this.renderPanel();
            this.updateBadgeCount();
            this.syncExternalTabs();

            if (shouldSwitchTab) {
                this.switchToStagingTab();
            }

            // Eklenen ilk görseli otomatik olarak tuvale aktar
            if (itemsList[0] && itemsList[0].dataUrl) {
                this.applyToCanvas(itemsList[0].id, false);
            }

            if (typeof window.recordHistoryImmediate === 'function' && !window.isHistoryRestoring) {
                window.recordHistoryImmediate('Havuz Toplu Görsel Eklendi');
            }
        },

        /**
         * Sol Sekmeyi "Görseller"e Geçirir
         */
        switchToStagingTab: function() {
            if (typeof window.switchTab === 'function') {
                window.switchTab('staging');
            } else {
                const btn = document.getElementById('tabBtnStaging');
                if (btn) btn.click();
            }
        },

        /**
         * Sekme Rozet Sayısını Günceller
         */
        updateBadgeCount: function() {
            const badge = document.getElementById('stagingBadgeCount');
            if (badge) {
                const count = this.items.length;
                badge.textContent = count.toString();
                badge.style.display = (count > 0) ? 'inline-block' : 'none';
            }
        },

        /**
         * Kaynak Filtresini Günceller (Tümü, 3B Drone, Uydu, Yüklenenler)
         */
        setFilter: function(type) {
            this.currentFilter = type || 'all';
            this.renderPanel();
        },

        /**
         * Mevcut Filtreye Göre Öğeleri Döndürür
         */
        getFilteredItems: function() {
            if (this.currentFilter === 'drone') {
                return this.items.filter(it => it.key === 'drone_3d' || it.tilt !== undefined);
            }
            if (this.currentFilter === 'satellite') {
                return this.items.filter(it => it.key === 'satellite_2d' || (it.key !== 'drone_3d' && it.tilt === undefined && it.key !== 'local_file'));
            }
            if (this.currentFilter === 'upload') {
                return this.items.filter(it => it.key === 'local_file');
            }
            return this.items;
        },

        /**
         * Seçili Görseli Tuvale Aktarır
         */
        applyToCanvas: function(id, skipToast) {
            if (this._isApplying) return;
            this._isApplying = true;
            window._isApplyingToCanvas = true;

            try {
                const item = this.items.find(it => it.id === id);
                if (!item || !item.dataUrl) {
                    this._isApplying = false;
                    window._isApplyingToCanvas = false;
                    return;
                }

                this.activeItemId = id;
                this.updateActiveCardUI();

                // 0. Açık olabilecek harita modalını kapat ve tuvali öne çıkar (sadece modal gerçekten açıksa)
                const satModal = document.getElementById('satelliteMapModal');
                if (satModal && satModal.style.display !== 'none' && typeof window.closeSatelliteMapModal === 'function') {
                    try { window.closeSatelliteMapModal(); } catch(e) {}
                }

                // 1. Boş tuval bilgilendirme ekranını gizle
                if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
                    window.CanvasEmptyState.dismiss();
                }
                if (window.CanvasEmptyState && typeof window.CanvasEmptyState.hide === 'function') {
                    window.CanvasEmptyState.hide();
                }
                const es = document.getElementById('canvasEmptyState');
                if (es) {
                    es.classList.add('is-hidden');
                    es.style.display = 'none';
                }

                // 2. Fotoğraf katmanını görünür yap
                const pl = document.getElementById('photo-layer');
                if (pl) {
                    pl.style.display = 'block';
                    pl.style.visibility = 'visible';
                }
                const canvaL = document.getElementById('canva-render-layer');
                if (canvaL && !window.isCanvaMode) {
                    canvaL.style.display = 'none';
                }

                // 3. Görseli projeye uygula
                const finishRender = () => {
                    if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
                        window.CanvasEmptyState.dismiss();
                    }
                    if (window.CanvasEmptyState && typeof window.CanvasEmptyState.hide === 'function') {
                        window.CanvasEmptyState.hide();
                    }
                    const es = document.getElementById('canvasEmptyState');
                    if (es) {
                        es.classList.add('is-hidden');
                        es.style.display = 'none';
                    }
                    const pl = document.getElementById('photo-layer');
                    if (pl) {
                        pl.style.display = 'block';
                        pl.style.visibility = 'visible';
                        pl.style.opacity = '1';
                    }
                    if (typeof applyPhotoFilters === 'function') {
                        applyPhotoFilters();
                    } else if (typeof requestPhotoRepaint === 'function') {
                        requestPhotoRepaint();
                    }
                    if (typeof redrawAll === 'function') {
                        redrawAll();
                    }
                    this.syncExternalTabs();
                    if (typeof window.recordHistoryImmediate === 'function' && !window.isHistoryRestoring) {
                        window.recordHistoryImmediate('Aktif Görsel Tuvale Aktarıldı');
                    }
                };

                if (typeof window.applyProjectImageFromDataUrl === 'function') {
                    window.applyProjectImageFromDataUrl(item.dataUrl, (err) => {
                        window._isApplyingToCanvas = false;
                        if (!err) {
                            finishRender();
                            if (!skipToast && typeof window.showAppToast === 'function') {
                                window.showAppToast(`${item.title} tuvale aktarıldı`, 'info', 2000);
                            }
                        }
                    }, true);
                } else if (typeof window.applyFinalProjectImage === 'function') {
                    const img = new Image();
                    img.onload = () => {
                        window._isApplyingToCanvas = false;
                        window.applyFinalProjectImage(img, item.dataUrl, img.naturalWidth || 1920, img.naturalHeight || 1080);
                        finishRender();
                        if (!skipToast && typeof window.showAppToast === 'function') {
                            window.showAppToast(`${item.title} tuvale aktarıldı`, 'info', 2000);
                        }
                    };
                    img.onerror = () => { window._isApplyingToCanvas = false; };
                    img.src = item.dataUrl;
                } else {
                    window._isApplyingToCanvas = false;
                }
            } finally {
                this._isApplying = false;
            }
        },

        /**
         * Çoklu Seçim Durumunu Değiştirir
         */
        toggleSelect: function(id) {
            if (this.selectedIds.has(id)) {
                this.selectedIds.delete(id);
            } else {
                this.selectedIds.add(id);
            }
            this.updateSelectToolbarUI();
        },

        /**
         * Tümünü Seç / Seçimi Kaldır
         */
        toggleSelectAll: function(forceState) {
            const currentList = this.getFilteredItems();
            const shouldSelect = (typeof forceState === 'boolean') ? forceState : (this.selectedIds.size < currentList.length);
            if (shouldSelect) {
                currentList.forEach(it => this.selectedIds.add(it.id));
            } else {
                this.selectedIds.clear();
            }
            this.renderPanel();
        },

        /**
         * Seçilen Öğelerin Listesini Döndürür (Hiçbiri seçilmemişse filtrelenmiş tümünü baz alır)
         */
        getSelectedItems: function() {
            const currentList = this.getFilteredItems();
            if (this.selectedIds.size === 0) return currentList.slice();
            return currentList.filter(it => this.selectedIds.has(it.id));
        },

        /**
         * Seçili Görsellerden İlkini Tuvale Aktarır
         */
        applySelectedToCanvas: function() {
            const targets = this.getSelectedItems();
            if (targets.length === 0) {
                if (typeof window.showAppToast === 'function') window.showAppToast('Lütfen önce bir görsel seçin.', 'warning');
                return;
            }
            this.applyToCanvas(targets[0].id);
        },

        /**
         * Tekil Görseli Bilgisayara İndirir
         */
        downloadSingle: function(id) {
            const item = this.items.find(it => it.id === id);
            if (!item || !item.dataUrl) return;

            const ada = item.parcelMeta?.ada ? `Ada_${item.parcelMeta.ada}` : '';
            const parsel = item.parcelMeta?.parsel ? `Parsel_${item.parcelMeta.parsel}` : '';
            const tag = (ada || parsel) ? `_${ada}_${parsel}` : '';
            const cleanTitle = (item.title || 'gorsel').replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ_-]/g, '_');
            const filename = `EmlakStudyom_${cleanTitle}${tag}.png`;

            const a = document.createElement('a');
            a.href = item.dataUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },

        /**
         * Seçili (veya Tüm) Görselleri ZIP Arşivi Olarak İndirir (JSZip)
         */
        downloadSelectedZip: async function() {
            const targets = this.getSelectedItems();
            if (targets.length === 0) {
                if (typeof window.showAppToast === 'function') window.showAppToast('İndirilecek görsel bulunamadı.', 'warning');
                return;
            }
            if (typeof JSZip === 'undefined') {
                if (typeof window.showAppToast === 'function') window.showAppToast('JSZip kütüphanesi yüklenemedi.', 'error');
                return;
            }

            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`📦 ${targets.length} görsel ZIP arşivine paketleniyor...`, 'info', 2500);
            }

            try {
                const zip = new JSZip();
                const folder = zip.folder('EmlakStudyom_Gorsel_Havuzu');

                targets.forEach((it, idx) => {
                    const base64Data = it.dataUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
                    const prefix = String(idx + 1).padStart(2, '0');
                    const cleanTitle = (it.title || 'gorsel').replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ_-]/g, '_');
                    const filename = `${prefix}_${cleanTitle}.png`;
                    folder.file(filename, base64Data, { base64: true });
                });

                const content = await zip.generateAsync({ type: 'blob' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(content);
                a.download = `EmlakStudyom_Gorseller_${Date.now()}.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                if (typeof window.showAppToast === 'function') {
                    window.showAppToast(`✅ ${targets.length} görsel ZIP olarak indirildi!`, 'success', 3500);
                }
            } catch(e) {
                console.error("ZIP indirme hatası:", e);
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('ZIP oluşturulurken hata oluştu: ' + e.message, 'error');
                }
            }
        },

        downloadAllZip: function() {
            return this.downloadSelectedZip();
        },

        /**
         * Filigran & Logo Panelini Açar / Kapatır
         */
        toggleWatermarkTray: function() {
            this.watermarkTrayOpen = !this.watermarkTrayOpen;
            if (this.watermarkTrayOpen) {
                this.formatTrayOpen = false;
                this.aiTrayOpen = false;
            }
            this.renderPanel();
        },

        /**
         * Format & Kadraj Panelini Açar / Kapatır
         */
        toggleFormatTray: function() {
            this.formatTrayOpen = !this.formatTrayOpen;
            if (this.formatTrayOpen) {
                this.watermarkTrayOpen = false;
                this.aiTrayOpen = false;
            }
            this.renderPanel();
        },

        /**
         * AI Netleştirme Ayar Panelini Açar / Kapatır
         */
        toggleAiTray: function() {
            this.aiTrayOpen = !this.aiTrayOpen;
            if (this.aiTrayOpen) {
                this.watermarkTrayOpen = false;
                this.formatTrayOpen = false;
            }
            this.renderPanel();
        },

        setAiIntensity: function(val) {
            const num = Math.max(5, Math.min(100, parseInt(val) || 35));
            this.aiIntensity = num / 100;
            const badge = document.getElementById('stagingAiIntensityVal');
            if (badge) badge.textContent = `%${num}`;
        },

        /**
         * Slider Sürüklenirken Anlık Canlı CSS Önizlemesi Gösterir (Hareket Anında Düşük Maliyetli / 60fps)
         */
        previewAiIntensityLive: function(val) {
            this.setAiIntensity(val);

            // Aktif görseli bul, tuval boşsa tuvale aktar
            const targets = this.getSelectedItems();
            const activeItem = targets[0] || this.items.find(it => it.id === this.activeItemId) || this.items[0];
            if (activeItem && activeItem.dataUrl && !window.uploadedImgUrl) {
                this.applyToCanvas(activeItem.id, true);
            }

            const intensity = (parseInt(val) || 35) / 100;
            const contrastPct = Math.round(100 + 24 * intensity);
            const satPct = Math.round(100 + 32 * intensity);
            const brightPct = Math.round(100 + 4 * intensity);
            const filterStr = `contrast(${contrastPct}%) saturate(${satPct}%) brightness(${brightPct}%)`;

            const pl = document.getElementById('photo-layer');
            if (pl) {
                pl.style.filter = filterStr;
                pl.style.webkitFilter = filterStr;
            }
            document.querySelectorAll('.photo-panel').forEach(p => {
                p.style.filter = filterStr;
                p.style.webkitFilter = filterStr;
            });

            // Debounce: Kullanıcı slider üzerinde 350ms durakladığında tam çözünürlüklü işlemi arka planda işle
            if (this._aiCommitTimer) clearTimeout(this._aiCommitTimer);
            this._aiCommitTimer = setTimeout(() => {
                this.commitAiIntensity(val);
            }, 350);
        },

        /**
         * Slider Bırakıldığında / Değişim Kesinleştiğinde Yüksek Kaliteli AI Netleştirmeyi Tuvale Uygular
         */
        commitAiIntensity: async function(val) {
            if (this._aiCommitTimer) clearTimeout(this._aiCommitTimer);
            const num = Math.max(5, Math.min(100, parseInt(val) || 35));
            const intensity = num / 100;
            this.aiIntensity = intensity;

            const targets = this.getSelectedItems();
            const activeItem = targets[0] || this.items.find(it => it.id === this.activeItemId) || this.items[0];
            if (!activeItem || !activeItem.dataUrl) return;

            if (!activeItem.originalDataUrl) {
                activeItem.originalDataUrl = activeItem.dataUrl;
            }

            try {
                const enhancedDataUrl = await this.enhanceImageDataUrl(activeItem.originalDataUrl, intensity);
                activeItem.dataUrl = enhancedDataUrl;
                activeItem.isEnhanced = true;
                activeItem.aiIntensity = intensity;
                window._aiOriginalImgDataUrl = activeItem.originalDataUrl;

                // Tuvale yüksek kaliteli net görseli yerleştir
                this.applyToCanvas(activeItem.id, true);

                // Geçici CSS filtresini temizle
                const pl = document.getElementById('photo-layer');
                if (pl) {
                    pl.style.filter = 'none';
                    pl.style.webkitFilter = 'none';
                }
                document.querySelectorAll('.photo-panel').forEach(p => {
                    p.style.filter = 'none';
                    p.style.webkitFilter = 'none';
                });
            } catch(e) {
                console.warn("AI canlı netleştirme hatası:", e);
            }
        },

        /**
         * Mevcut Firma Logosunu Döndürür
         */
        getCurrentLogoUrl: function() {
            if (this.watermarkOptions.customLogoUrl) return this.watermarkOptions.customLogoUrl;
            const logoEl = document.getElementById('elLogo');
            if (logoEl && logoEl.src && logoEl.src.length > 20 && !logoEl.src.endsWith('#')) {
                return logoEl.src;
            }
            const brandPreview = document.getElementById('brandLogoPreview');
            if (brandPreview && brandPreview.src && brandPreview.src.length > 20) {
                return brandPreview.src;
            }
            try {
                const brands = JSON.parse(localStorage.getItem('canvaBrandTemplates') || '[]');
                if (brands.length > 0 && brands[0].logo) return brands[0].logo;
            } catch(e) {}
            return null;
        },

        /**
         * Kullanıcı Filigran İçin Özel Logo Yüklediğinde Karşılar
         */
        handleWatermarkLogoUpload: function(event) {
            const file = event?.target?.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                this.watermarkOptions.customLogoUrl = e.target.result;
                this.renderPanel();
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('✅ Logo yüklendi, filigran olarak hazır.', 'success', 2500);
                }
            };
            reader.readAsDataURL(file);
        },

        /**
         * Seçili Görsellere Firma Logosu / Filigran Damgalar
         */
        applyWatermarkSelected: async function() {
            const logoUrl = this.getCurrentLogoUrl();
            if (!logoUrl) {
                const input = document.getElementById('stagingWatermarkLogoInput');
                if (input) input.click();
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Lütfen önce firmanızın logosunu seçin.', 'warning', 3000);
                }
                return;
            }

            const targets = this.getSelectedItems();
            if (targets.length === 0) {
                if (typeof window.showAppToast === 'function') window.showAppToast('Lütfen filigran eklenecek görselleri seçin.', 'warning');
                return;
            }

            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`🛡️ ${targets.length} Görsele filigran uygulanıyor...`, 'info', 2000);
            }

            const logoImg = await this.loadImageAsync(logoUrl);
            const { position, scale, opacity } = this.watermarkOptions;

            for (let i = 0; i < targets.length; i++) {
                const it = targets[i];
                try {
                    const baseImg = await this.loadImageAsync(it.dataUrl);
                    const canvas = document.createElement('canvas');
                    canvas.width = baseImg.naturalWidth || 1920;
                    canvas.height = baseImg.naturalHeight || 1080;
                    const ctx = canvas.getContext('2d');
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';

                    // 1. Orijinal fotoğrafı çiz
                    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

                    // 2. Logo boyutlarını hesapla
                    const margin = Math.round(canvas.width * 0.035);
                    const logoW = Math.round(canvas.width * (scale / 100));
                    const logoH = Math.round(logoW * (logoImg.naturalHeight / logoImg.naturalWidth));

                    // 3. Konum koordinatları
                    let x = canvas.width - logoW - margin;
                    let y = canvas.height - logoH - margin;

                    if (position === 'bottom-left') {
                        x = margin;
                        y = canvas.height - logoH - margin;
                    } else if (position === 'top-right') {
                        x = canvas.width - logoW - margin;
                        y = margin;
                    } else if (position === 'top-left') {
                        x = margin;
                        y = margin;
                    } else if (position === 'center') {
                        x = Math.round((canvas.width - logoW) / 2);
                        y = Math.round((canvas.height - logoH) / 2);
                    }

                    // 4. Opaklık ile logoyu damgala
                    ctx.globalAlpha = Math.max(0.1, Math.min(1, opacity / 100));
                    ctx.drawImage(logoImg, x, y, logoW, logoH);
                    ctx.globalAlpha = 1.0;

                    it.dataUrl = canvas.toDataURL('image/png');

                    if (it.id === this.activeItemId) {
                        this.applyToCanvas(it.id, true);
                    }
                } catch(err) {
                    console.warn("Filigran uygulama hatası:", err);
                }
            }

            this.renderPanel();
            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`✅ ${targets.length} Görsele filigran başarıyla damgalandı!`, 'success', 3500);
            }
        },

        /**
         * Logoyu Mevcut Tuvale Katman Olarak Ekler
         */
        addLogoToCanvas: function() {
            const logoUrl = this.getCurrentLogoUrl();
            if (!logoUrl) {
                const input = document.getElementById('stagingWatermarkLogoInput');
                if (input) input.click();
                return;
            }
            const logoEl = document.getElementById('elLogo');
            if (logoEl) {
                logoEl.src = logoUrl;
                logoEl.style.display = 'block';
                logoEl.style.visibility = 'visible';
                logoEl.style.zIndex = '9999';
                if (typeof window.selectElement === 'function') {
                    window.selectElement(logoEl);
                }
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('✅ Logo tuvale eklendi.', 'success', 2000);
                }
            }
        },

        /**
         * Seçili Görselleri İstenen Format & En-Boy Oranına Dönüştürür
         */
        applyFormatSelected: async function() {
            const targets = this.getSelectedItems();
            if (targets.length === 0) {
                if (typeof window.showAppToast === 'function') window.showAppToast('Lütfen boyutlandırılacak görselleri seçin.', 'warning');
                return;
            }

            const { ratio, mode } = this.formatOptions;
            let targetW = 1080;
            let targetH = 1080;

            if (ratio === '9:16') {
                targetW = 1080;
                targetH = 1920;
            } else if (ratio === '16:9') {
                targetW = 1920;
                targetH = 1080;
            }

            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`📐 ${targets.length} Görsel ${ratio} formatına uyarlanıyor...`, 'info', 2000);
            }

            for (let i = 0; i < targets.length; i++) {
                const it = targets[i];
                try {
                    const img = await this.loadImageAsync(it.dataUrl);
                    const canvas = document.createElement('canvas');
                    canvas.width = targetW;
                    canvas.height = targetH;
                    const ctx = canvas.getContext('2d');
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';

                    const srcW = img.naturalWidth || targetW;
                    const srcH = img.naturalHeight || targetH;

                    if (mode === 'contain_blur') {
                        // 1. Arka planı bulanık doldur
                        ctx.save();
                        ctx.filter = 'blur(30px) brightness(60%) saturate(120%)';
                        // Cover zemin
                        const scaleCover = Math.max(targetW / srcW, targetH / srcH);
                        const covW = srcW * scaleCover;
                        const covH = srcH * scaleCover;
                        const covX = (targetW - covW) / 2;
                        const covY = (targetH - covH) / 2;
                        ctx.drawImage(img, covX - 20, covY - 20, covW + 40, covH + 40);
                        ctx.restore();

                        // 2. Ortaya kırpılmamış orijinal görseli yerleştir (contain)
                        const scaleFit = Math.min(targetW / srcW, targetH / srcH);
                        const fitW = Math.round(srcW * scaleFit);
                        const fitH = Math.round(srcH * scaleFit);
                        const fitX = Math.round((targetW - fitW) / 2);
                        const fitY = Math.round((targetH - fitH) / 2);

                        // Hafif gölge
                        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
                        ctx.shadowBlur = 24;
                        ctx.drawImage(img, fitX, fitY, fitW, fitH);
                        ctx.shadowBlur = 0;
                    } else {
                        // Cover mod: Merkezden tam kırparak doldur
                        const scaleCover = Math.max(targetW / srcW, targetH / srcH);
                        const covW = srcW * scaleCover;
                        const covH = srcH * scaleCover;
                        const covX = (targetW - covW) / 2;
                        const covY = (targetH - covH) / 2;
                        ctx.drawImage(img, covX, covY, covW, covH);
                    }

                    it.dataUrl = canvas.toDataURL('image/png');
                    it.title = `${it.title || 'gorsel'}_${ratio.replace(':', '_')}`;

                    if (it.id === this.activeItemId) {
                        this.applyToCanvas(it.id, true);
                    }
                } catch(err) {
                    console.warn("Format dönüştürme hatası:", err);
                }
            }

            this.renderPanel();
            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`✅ ${targets.length} Görsel ${ratio} formatına başarıyla uyarlandı!`, 'success', 3500);
            }
        },

        /**
         * Şık A4 Emlak Portföy / Sunum Broşürü PDF'i Oluşturur (jsPDF)
         */
        generatePortfolioPdf: async function() {
            const targets = this.getSelectedItems();
            if (targets.length === 0) {
                if (typeof window.showAppToast === 'function') window.showAppToast('Lütfen sunum için görsel seçin.', 'warning');
                return;
            }

            // jsPDF kontrolü
            if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
                if (typeof window.showAppToast === 'function') window.showAppToast('jsPDF kütüphanesi yükleniyor...', 'info', 2000);
                await this.loadScriptAsync('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            }

            const { jsPDF } = window.jspdf || window;
            if (!jsPDF) {
                if (typeof window.showAppToast === 'function') window.showAppToast('PDF motoru başlatılamadı.', 'error');
                return;
            }

            if (typeof window.showAppToast === 'function') {
                window.showAppToast('📄 A4 Portföy broşürü oluşturuluyor...', 'info', 3000);
            }

            try {
                const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                const pageW = 210;
                const pageH = 297;

                // Emlak Detayları
                const titleVal = document.getElementById('title')?.value || 'Özel Emlak Portföyü';
                const adaVal = document.getElementById('ada')?.value || targets[0]?.parcelMeta?.ada || '-';
                const parselVal = document.getElementById('parsel')?.value || targets[0]?.parcelMeta?.parsel || '-';
                const priceVal = document.getElementById('price')?.value || '';
                const detailsVal = document.getElementById('details')?.value || '';
                const districtVal = document.getElementById('district')?.value || '';
                const cityVal = document.getElementById('city')?.value || '';
                const locationStr = [districtVal, cityVal].filter(Boolean).join(' / ') || 'Türkiye';
                const logoUrl = this.getCurrentLogoUrl();

                // ------------------ SAYFA 1: KAPAK & ANA GÖRSEL ------------------
                // Üst Başlık Şeridi
                doc.setFillColor(15, 23, 42); // Slate 900
                doc.rect(0, 0, pageW, 26, 'F');

                doc.setTextColor(255, 255, 255);
                doc.setFontSize(13);
                doc.setFont('helvetica', 'bold');
                doc.text('EMLAK STUDYOM', 14, 13);
                doc.setFontSize(8.5);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(148, 163, 184);
                doc.text('PROFESYONEL PORTFOY SUNUM BROSURO', 14, 19);

                // Logo varsa sağ üste koy
                if (logoUrl) {
                    try {
                        doc.addImage(logoUrl, 'PNG', pageW - 38, 4, 24, 18);
                    } catch(eLogo){}
                }

                // İlan Başlığı
                doc.setTextColor(15, 23, 42);
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                const cleanTitle = titleVal.replace(/[\u0100-\uffff]/g, c => ({ 'ğ':'g','Ğ':'G','ı':'i','İ':'I','ö':'o','Ö':'O','ü':'u','Ü':'U','ş':'s','Ş':'S','ç':'c','Ç':'C' }[c] || c));
                doc.text(cleanTitle.substring(0, 50), 14, 38);

                // Fiyat Vurgusu
                if (priceVal) {
                    doc.setFillColor(2, 132, 199);
                    doc.roundedRect(pageW - 68, 30, 54, 11, 2, 2, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');
                    doc.text(priceVal, pageW - 41, 37.5, { align: 'center' });
                }

                // Bilgi Kartları Tablosu (Ada, Parsel, Konum, Tarih)
                doc.setFillColor(248, 250, 252);
                doc.setDrawColor(203, 213, 225);
                doc.roundedRect(14, 46, pageW - 28, 16, 2, 2, 'FD');

                doc.setFontSize(8.5);
                doc.setTextColor(100, 116, 139);
                doc.text('ADA / PARSEL', 20, 52);
                doc.text('KONUM', 75, 52);
                doc.text('TARIH', 150, 52);

                doc.setFontSize(10);
                doc.setTextColor(15, 23, 42);
                doc.setFont('helvetica', 'bold');
                doc.text(`${adaVal} / ${parselVal}`, 20, 58);
                doc.text(locationStr, 75, 58);
                doc.text(new Date().toLocaleDateString('tr-TR'), 150, 58);

                // Ana Hero Görseli (İlk Çekim / Tepe Açısı)
                if (targets[0] && targets[0].dataUrl) {
                    try {
                        doc.addImage(targets[0].dataUrl, 'JPEG', 14, 68, pageW - 28, 110);
                        doc.setDrawColor(203, 213, 225);
                        doc.rect(14, 68, pageW - 28, 110, 'S');
                    } catch(eImg){}
                }

                // Açıklama / Özellikler Kutusu
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.setTextColor(15, 23, 42);
                doc.text('Portfoy Aciklamasi & Detaylar', 14, 190);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(51, 65, 85);
                const cleanDetails = (detailsVal || 'Parsel sinirlari ve cevre planlamasi 3B harita uzerinden olcekli olarak tespit edilmistir.')
                    .replace(/[\u0100-\uffff]/g, c => ({ 'ğ':'g','Ğ':'G','ı':'i','İ':'I','ö':'o','Ö':'O','ü':'u','Ü':'U','ş':'s','Ş':'S','ç':'c','Ç':'C' }[c] || c));
                const splitText = doc.splitTextToSize(cleanDetails, pageW - 28);
                doc.text(splitText.slice(0, 8), 14, 198);

                // Sayfa 1 Altbilgi
                doc.setDrawColor(226, 232, 240);
                doc.line(14, pageH - 14, pageW - 14, pageH - 14);
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184);
                doc.text('Emlak Studyom Proje Ciktisi • Sayfa 1 / ' + (targets.length > 1 ? '2' : '1'), 14, pageH - 8);

                // ------------------ SAYFA 2: ÇOKLU AÇILAR & 3B DRONE ÇEKİMLERİ ------------------
                if (targets.length > 1) {
                    doc.addPage();

                    // Üst Başlık
                    doc.setFillColor(15, 23, 42);
                    doc.rect(0, 0, pageW, 20, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');
                    doc.text('3B DRONE VE CEVRE ACI DETAYLARI', 14, 13);

                    // 4'lü Görsel Izgarası (2x2)
                    const subPhotos = targets.slice(1, 5);
                    const gridCoords = [
                        { x: 14, y: 28, w: 86, h: 56 },
                        { x: 110, y: 28, w: 86, h: 56 },
                        { x: 14, y: 92, w: 86, h: 56 },
                        { x: 110, y: 92, w: 86, h: 56 }
                    ];

                    subPhotos.forEach((photo, pIdx) => {
                        const coord = gridCoords[pIdx];
                        if (coord && photo.dataUrl) {
                            try {
                                doc.addImage(photo.dataUrl, 'JPEG', coord.x, coord.y, coord.w, coord.h);
                                doc.setDrawColor(203, 213, 225);
                                doc.rect(coord.x, coord.y, coord.w, coord.h, 'S');

                                // Açı Etiketi
                                doc.setFillColor(15, 23, 42);
                                doc.rect(coord.x, coord.y + coord.h - 6, coord.w, 6, 'F');
                                doc.setTextColor(255, 255, 255);
                                doc.setFontSize(7.5);
                                doc.text((photo.title || `Aci ${pIdx + 1}`).substring(0, 30), coord.x + 3, coord.y + coord.h - 2);
                            } catch(eSub){}
                        }
                    });

                    // Sayfa 2 Altbilgi
                    doc.setDrawColor(226, 232, 240);
                    doc.line(14, pageH - 14, pageW - 14, pageH - 14);
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text('Emlak Studyom Proje Ciktisi • Sayfa 2 / 2', 14, pageH - 8);
                }

                // PDF Kaydet
                const safeAda = (adaVal || '').replace(/[^a-zA-Z0-9]/g, '');
                const safeParsel = (parselVal || '').replace(/[^a-zA-Z0-9]/g, '');
                doc.save(`Emlak_Sunum_Portfoyu_${safeAda || 'Ada'}_${safeParsel || 'Parsel'}.pdf`);

                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('✅ PDF sunum broşürü başarıyla indirildi!', 'success', 3500);
                }
            } catch(pdfErr) {
                console.error("PDF oluşturma hatası:", pdfErr);
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('PDF oluşturulurken hata oluştu: ' + pdfErr.message, 'error');
                }
            }
        },

        /**
         * 🪟 Canlı Tuval Üzerinde Öncesi / Sonrası Karşılaştırma (Aynı Ekranda)
         */
        openCanvasCompare: function() {
            const overlay = document.getElementById('canvasCompareSliderOverlay');
            if (!overlay) return;

            const targets = this.getSelectedItems();
            const activeItem = targets[0] || this.items.find(it => it.id === this.activeItemId) || this.items[0];

            // Tuval boşsa veya aktif öğe tuvalde değilse tuvale uygula (sessizce, loading çıkarmadan)
            if (activeItem && activeItem.id && activeItem.id !== this.activeItemId) {
                this.applyToCanvas(activeItem.id, true);
            } else if (!window.uploadedImgUrl && activeItem) {
                this.applyToCanvas(activeItem.id, true);
            }

            let beforeUrl = window._aiOriginalImgDataUrl || window.uploadedImgUrl;
            let beforeLabel = 'Orijinal Çekim';
            let afterLabel = 'Düzenlenen Tuval';

            if (activeItem) {
                if (activeItem.isEnhanced && activeItem.originalDataUrl) {
                    beforeUrl = activeItem.originalDataUrl;
                    beforeLabel = 'Orijinal Çekim';
                    afterLabel = 'AI Netleştirilmiş';
                } else if (activeItem.originalDataUrl) {
                    beforeUrl = activeItem.originalDataUrl;
                } else if (activeItem.dataUrl) {
                    beforeUrl = activeItem.dataUrl;
                }
            }

            if (!beforeUrl) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Karşılaştırma için tuvalde veya havuzda bir görsel bulunmalıdır.', 'warning');
                }
                return;
            }

            const imgEl = document.getElementById('canvasCompareBeforeImg');
            if (imgEl) imgEl.src = beforeUrl;

            const bLeft = document.getElementById('canvasCompareBadgeLeft');
            const bRight = document.getElementById('canvasCompareBadgeRight');
            if (bLeft) bLeft.textContent = beforeLabel;
            if (bRight) bRight.textContent = afterLabel;

            this.updateCanvasCompareSplit(50);
            overlay.style.display = 'block';
            this.initCanvasCompareDragListeners();

            const dockBtn = document.getElementById('dockBeforeAfterBtn');
            if (dockBtn) dockBtn.classList.add('active');
        },

        closeCanvasCompare: function() {
            const overlay = document.getElementById('canvasCompareSliderOverlay');
            if (overlay) overlay.style.display = 'none';

            const dockBtn = document.getElementById('dockBeforeAfterBtn');
            if (dockBtn) dockBtn.classList.remove('active');
        },

        toggleCanvasCompare: function() {
            const overlay = document.getElementById('canvasCompareSliderOverlay');
            if (overlay && overlay.style.display !== 'none') {
                this.closeCanvasCompare();
            } else {
                this.openCanvasCompare();
            }
        },

        updateCanvasCompareSplit: function(val) {
            const clip = document.getElementById('canvasCompareClipWrap');
            const divider = document.getElementById('canvasCompareDivider');
            const handle = document.getElementById('canvasCompareHandle');
            const range = document.getElementById('canvasCompareRange');
            const pct = Math.max(0, Math.min(100, parseFloat(val) || 50));

            if (clip) {
                clip.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
                clip.style.webkitClipPath = `inset(0 ${100 - pct}% 0 0)`;
            }
            if (divider) divider.style.left = pct + '%';
            if (handle) handle.style.left = pct + '%';
            if (range && Math.abs(range.value - pct) > 0.5) range.value = pct;
        },

        initCanvasCompareDragListeners: function() {
            const overlay = document.getElementById('canvasCompareSliderOverlay');
            if (!overlay || overlay._dragInitialized) return;
            overlay._dragInitialized = true;

            let isDragging = false;
            const onPointerMove = (e) => {
                if (!isDragging) return;
                const rect = overlay.getBoundingClientRect();
                if (rect.width <= 0) return;
                const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                this.updateCanvasCompareSplit(pct);
            };

            const onPointerUp = () => {
                if (isDragging) {
                    isDragging = false;
                    window.removeEventListener('pointermove', onPointerMove);
                    window.removeEventListener('pointerup', onPointerUp);
                    window.removeEventListener('pointercancel', onPointerUp);
                }
            };

            overlay.onpointerdown = (e) => {
                if (e.target && e.target.closest('.canvas-compare-close-btn')) return;
                isDragging = true;
                const rect = overlay.getBoundingClientRect();
                if (rect.width > 0) {
                    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                    this.updateCanvasCompareSplit(pct);
                }
                window.addEventListener('pointermove', onPointerMove);
                window.addEventListener('pointerup', onPointerUp);
                window.addEventListener('pointercancel', onPointerUp);
            };
        },

        openCompareModal: function() {
            this.openCanvasCompare();
        },

        closeCompareModal: function() {
            this.closeCanvasCompare();
        },

        /**
         * Harici Script Yükleme Yardımcısı
         */
        loadScriptAsync: function(src) {
            return new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = src;
                s.onload = () => resolve();
                s.onerror = (e) => reject(e);
                document.head.appendChild(s);
            });
        },

        /**
         * Görsel Yükleme Yardımcısı
         */
        loadImageAsync: function(src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = (e) => reject(e);
                img.src = src;
            });
        },

        /**
         * Karusel Film Şeridini Açar veya Açıksa Kapatır (Toggle)
         */
        toggleCarousel: function() {
            const cm = window.CarouselManager;
            if (!cm) return;

            if (cm.isVisible) {
                cm.toggleBar(false);
                this.renderPanel();
                return;
            }
            this.exportToCarousel();
        },

        /**
         * Seçili Görselleri Çoklu Gönderi / Albüm Sayfalarına Aktarır
         */
        exportToCarousel: function() {
            const targets = this.getSelectedItems();
            if (targets.length === 0) {
                if (typeof window.showAppToast === 'function') window.showAppToast('Çoklu gönderi için en az 1 görsel gereklidir.', 'warning');
                return;
            }

            const cm = window.CarouselManager;
            if (!cm) {
                if (typeof window.showAppToast === 'function') window.showAppToast('Albüm yöneticisi bulunamadı.', 'warning');
                return;
            }

            cm.pages = [];
            targets.forEach((it, idx) => {
                cm.pages.push({
                    id: 'page_staging_' + (it.key || 'snap') + '_' + Date.now() + '_' + idx,
                    title: it.title || `Sayfa ${idx + 1}`,
                    snapshot: {
                        uploadedImgUrl: it.dataUrl,
                        activeLayout: window.activeLayout || '',
                        timestamp: Date.now()
                    },
                    thumb: it.dataUrl
                });
            });

            cm.activePageIndex = 0;
            cm.renderFilmstrip();
            cm.toggleBar(true);

            if (targets[0] && targets[0].dataUrl) {
                this.applyToCanvas(targets[0].id, true);
            }

            this.renderPanel();

            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`${targets.length} görsel çoklu gönderi albümüne aktarıldı`, 'success', 3500);
            }
        },

        /**
         * Seçili Görsellere Toplu AI Netleştirme Uygular
         */
        applyAiEnhanceSelected: async function() {
            const targets = this.getSelectedItems();
            if (targets.length === 0) {
                if (typeof window.showAppToast === 'function') window.showAppToast('Lütfen önce işlem yapılacak görselleri seçin.', 'warning');
                return;
            }

            const intensity = (typeof this.aiIntensity === 'number') ? this.aiIntensity : 0.35;
            const pct = Math.round(intensity * 100);

            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`${targets.length} görsel %${pct} netlik ile işleniyor...`, 'info', 2500);
            }

            for (let i = 0; i < targets.length; i++) {
                const it = targets[i];
                try {
                    if (!it.originalDataUrl) {
                        it.originalDataUrl = it.dataUrl;
                    }
                    const enhancedDataUrl = await this.enhanceImageDataUrl(it.originalDataUrl || it.dataUrl, intensity);
                    it.dataUrl = enhancedDataUrl;
                    it.isEnhanced = true;
                    it.aiIntensity = intensity;
                    if (it.id === this.activeItemId) {
                        window._aiOriginalImgDataUrl = it.originalDataUrl;
                        this.applyToCanvas(it.id, true);
                    }
                } catch(err) {
                    console.warn("Görsel netleştirme atlandı:", err);
                }
            }

            this.renderPanel();
            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`${targets.length} görsel başarıyla netleştirildi`, 'success', 3500);
            }
        },

        /**
         * Tek Bir DataURL Görselini AI / Keskinlik Filtresinden Geçirir
         */
        enhanceImageDataUrl: function(dataUrl, intensity = 0.35) {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth || 1920;
                    canvas.height = img.naturalHeight || 1080;
                    const ctx = canvas.getContext('2d');
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    // Canlı kontrast, doygunluk ve netlik mikro-filtresi (intensity ölçeğinde)
                    const contrastPct = Math.round(100 + 20 * intensity);
                    const satPct = Math.round(100 + 35 * intensity);
                    const brightPct = Math.round(100 + 5 * intensity);
                    ctx.filter = `contrast(${contrastPct}%) saturate(${satPct}%) brightness(${brightPct}%)`;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    ctx.filter = 'none';

                    if (window.AiEnhancer && typeof window.AiEnhancer.applyAiFilters === 'function') {
                        try {
                            const finalCanvas = window.AiEnhancer.applyAiFilters(canvas, 'picsart_hd', intensity);
                            resolve(finalCanvas.toDataURL('image/png'));
                            return;
                        } catch(e) {}
                    }
                    resolve(canvas.toDataURL('image/png'));
                };
                img.onerror = () => resolve(dataUrl);
                img.src = dataUrl;
            });
        },

        /**
         * Seçilen Görselleri Havuzdan Siler
         */
        deleteSelected: function() {
            const targets = this.getSelectedItems();
            if (targets.length === 0) return;

            if (typeof window.recordHistoryImmediate === 'function' && !window.isHistoryRestoring) {
                window.recordHistoryImmediate('Silme Öncesi Havuz');
            }

            const targetIds = new Set(targets.map(it => it.id));
            this.items = this.items.filter(it => !targetIds.has(it.id));
            this.selectedIds.clear();

            if (this.items.length === 0) {
                this.activeItemId = null;
                if (typeof window.clearBgImage === 'function') window.clearBgImage();
                if (window.CanvasEmptyState && typeof window.CanvasEmptyState.resetDismiss === 'function') {
                    window.CanvasEmptyState.resetDismiss();
                    window.CanvasEmptyState.updateState();
                }
            } else if (targetIds.has(this.activeItemId)) {
                this.activeItemId = this.items[0] ? this.items[0].id : null;
                if (this.activeItemId) {
                    this.applyToCanvas(this.activeItemId, true);
                }
            }

            this.renderPanel();
            this.updateBadgeCount();
            this.syncExternalTabs();

            if (typeof window.recordHistoryImmediate === 'function' && !window.isHistoryRestoring) {
                window.recordHistoryImmediate('Seçilen Görseller Silindi');
            }

            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`${targets.length} görsel havuzdan silindi`, 'info', 2000);
            }
        },

        /**
         * Tekil Görseli Havuzdan Siler
         */
        deleteSingle: function(id) {
            if (typeof window.recordHistoryImmediate === 'function' && !window.isHistoryRestoring) {
                window.recordHistoryImmediate('Silme Öncesi Havuz');
            }

            this.items = this.items.filter(it => it.id !== id);
            this.selectedIds.delete(id);

            if (this.items.length === 0) {
                this.activeItemId = null;
                if (typeof window.clearBgImage === 'function') window.clearBgImage();
                if (window.CanvasEmptyState && typeof window.CanvasEmptyState.resetDismiss === 'function') {
                    window.CanvasEmptyState.resetDismiss();
                    window.CanvasEmptyState.updateState();
                }
            } else if (this.activeItemId === id) {
                this.activeItemId = this.items[0] ? this.items[0].id : null;
                if (this.activeItemId) {
                    this.applyToCanvas(this.activeItemId, true);
                }
            }

            this.renderPanel();
            this.updateBadgeCount();
            this.syncExternalTabs();

            if (typeof window.recordHistoryImmediate === 'function' && !window.isHistoryRestoring) {
                window.recordHistoryImmediate('Görsel Silindi');
            }
        },

        /**
         * Tüm Havuzu Boşaltır ve Tuvali Sıfırlar
         */
        clearAllPool: function(forceWithoutConfirm = false) {
            if (!this.items || this.items.length === 0) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Görsel havuzu zaten boş.', 'info');
                }
                return;
            }

            if (!forceWithoutConfirm) {
                const count = this.items.length;
                const ok = confirm(`Görsel havuzundaki tüm fotoğraflar (${count} adet) silinecek ve tuval sıfırlanacaktır. Devam etmek istiyor musunuz?`);
                if (!ok) return;
            }

            if (typeof window.recordHistoryImmediate === 'function' && !window.isHistoryRestoring) {
                window.recordHistoryImmediate('Havuz Temizleme Öncesi');
            }

            this.items = [];
            this.activeItemId = null;
            this.selectedIds.clear();

            if (typeof window.clearBgImage === 'function') {
                window.clearBgImage();
            } else {
                window.uploadedImgUrl = '';
                window._aiOriginalImgDataUrl = null;
                const pl = document.getElementById('photo-layer');
                if (pl) {
                    pl.style.display = 'none';
                    pl.style.backgroundImage = 'none';
                }
            }

            if (window.CanvasEmptyState && typeof window.CanvasEmptyState.resetDismiss === 'function') {
                window.CanvasEmptyState.resetDismiss();
                window.CanvasEmptyState.updateState();
            }
            const es = document.getElementById('canvasEmptyState');
            if (es) {
                es.classList.remove('is-hidden');
                es.style.display = 'flex';
            }

            this.renderPanel();
            this.updateBadgeCount();
            this.syncExternalTabs();

            if (typeof window.recordHistoryImmediate === 'function' && !window.isHistoryRestoring) {
                window.recordHistoryImmediate('Havuz Temizlendi');
            }

            if (typeof window.showAppToast === 'function') {
                window.showAppToast('Görsel havuzu ve tuval temizlendi', 'info', 2500);
            }
        },

        /**
         * Dosya Seçim Girişini Karşılar (Çoklu Dosya)
         */
        handleFileInput: function(event) {
            const files = event && event.target && event.target.files;
            if (!files || files.length === 0) return;
            this.processUploadedFiles(Array.from(files));
            if (event.target) event.target.value = '';
        },

        /**
         * Hızlı ve Düşük Bellekli Mikro Önizleme (Thumbnail) Üretir
         */
        createThumbnailAsync: function(dataUrl, maxW = 480) {
            return new Promise((resolve) => {
                if (!dataUrl || typeof dataUrl !== 'string') return resolve(dataUrl);
                const img = new Image();
                img.onload = () => {
                    try {
                        const aspect = (img.naturalHeight || 1080) / (img.naturalWidth || 1920);
                        const w = Math.min(maxW, img.naturalWidth || maxW);
                        const h = Math.round(w * aspect);
                        const canvas = document.createElement('canvas');
                        canvas.width = w;
                        canvas.height = h;
                        const ctx = canvas.getContext('2d');
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'medium';
                        ctx.drawImage(img, 0, 0, w, h);
                        resolve(canvas.toDataURL('image/jpeg', 0.72));
                    } catch(e) {
                        resolve(dataUrl);
                    }
                };
                img.onerror = () => resolve(dataUrl);
                img.src = dataUrl;
            });
        },

        /**
         * Yüklenen Dosyaları DataURL'e Çevirip Havuzda Toplar (Thumbnail ile Birlikte)
         */
        processUploadedFiles: function(files, shouldSwitchTab = true) {
            const imageFiles = files.filter(f => f.type && f.type.startsWith('image/'));
            if (imageFiles.length === 0) return;

            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`${imageFiles.length} görsel havuza ekleniyor...`, 'info', 2000);
            }

            let loadedCount = 0;
            const newEntries = [];

            imageFiles.forEach((file, idx) => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const dataUrl = e.target.result;
                    const thumbUrl = await this.createThumbnailAsync(dataUrl, 480);
                    const cleanName = (file.name || `Fotoğraf ${idx + 1}`).replace(/\.[^/.]+$/, "");
                    newEntries.push({
                        id: 'upload_' + Date.now() + '_' + idx,
                        key: 'local_file',
                        title: cleanName,
                        subTitle: 'Yüklenen Fotoğraf',
                        icon: 'fa-image',
                        dataUrl: dataUrl,       // Orijinal Master
                        thumbUrl: thumbUrl,     // Hafif 25KB Thumbnail
                        timestamp: Date.now()
                    });
                    loadedCount++;
                    if (loadedCount === imageFiles.length) {
                        this.addItems(newEntries, shouldSwitchTab);
                        if (typeof window.showAppToast === 'function') {
                            window.showAppToast(`${imageFiles.length} görsel başarıyla havuza eklendi`, 'success', 3000);
                        }
                    }
                };
                reader.readAsDataURL(file);
            });
        },

        /**
         * Sürükle Bırak Dinleyicilerini Kurar
         */
        initDropzoneListeners: function() {
            const dropzone = document.getElementById('stagingDropzone');
            if (dropzone && !dropzone._dzBound) {
                dropzone._dzBound = true;
                ['dragenter', 'dragover'].forEach(name => {
                    dropzone.addEventListener(name, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        dropzone.classList.add('is-dragover');
                    });
                });
                ['dragleave', 'drop'].forEach(name => {
                    dropzone.addEventListener(name, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        dropzone.classList.remove('is-dragover');
                    });
                });
                dropzone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        this.processUploadedFiles(Array.from(e.dataTransfer.files));
                    }
                });
            }

            const panel = document.getElementById('tab-staging');
            if (panel && !this._panelDropBound) {
                this._panelDropBound = true;
                panel.addEventListener('dragover', (e) => e.preventDefault());
                panel.addEventListener('drop', (e) => {
                    e.preventDefault();
                    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        this.processUploadedFiles(Array.from(e.dataTransfer.files));
                    }
                });
            }
        },

        /**
         * Aktif Kart Vurgusunu Günceller
         */
        updateActiveCardUI: function() {
            const container = document.getElementById('stagingCardsGrid');
            if (!container) return;
            const cards = container.querySelectorAll('.staging-card');
            cards.forEach(card => {
                const isActive = (card.dataset.id === this.activeItemId);
                card.classList.toggle('is-active', isActive);
                const pill = card.querySelector('.staging-active-pill');
                if (isActive && !pill) {
                    const wrap = card.querySelector('.staging-card-thumb-wrap');
                    if (wrap) {
                        const newPill = document.createElement('span');
                        newPill.className = 'staging-active-pill';
                        newPill.innerHTML = '<i class="fa-solid fa-circle-check"></i> Tuvalde';
                        wrap.appendChild(newPill);
                    }
                } else if (!isActive && pill) {
                    pill.remove();
                }
            });
        },

        /**
         * Seçim Çubuğu UI'sini Günceller
         */
        updateSelectToolbarUI: function() {
            const selectAllCb = document.getElementById('stagingSelectAllCb');
            const countEl = document.getElementById('stagingSelectedCount');
            const filteredList = this.getFilteredItems();
            if (selectAllCb) {
                selectAllCb.checked = (filteredList.length > 0 && this.selectedIds.size >= filteredList.length);
            }
            if (countEl) {
                countEl.textContent = `${this.selectedIds.size} / ${filteredList.length} Seçili`;
            }
            const container = document.getElementById('stagingCardsGrid');
            if (container) {
                container.querySelectorAll('.staging-card').forEach(c => {
                    const isSel = this.selectedIds.has(c.dataset.id);
                    c.classList.toggle('is-selected', isSel);
                    const cb = c.querySelector('.staging-card-check input');
                    if (cb) cb.checked = isSel;
                });
            }
        },

        /**
         * Sol Paneli DOM'a Basar
         */
        renderPanel: function() {
            const root = document.getElementById('stagingPanelRoot');
            if (!root) return;

            const total = this.items.length;
            const filteredList = this.getFilteredItems();
            const selCount = this.selectedIds.size;
            const allSelected = (filteredList.length > 0 && selCount >= filteredList.length);

            // Sayaçlar
            const droneCount = this.items.filter(it => it.key === 'drone_3d' || it.tilt !== undefined).length;
            const satCount = this.items.filter(it => it.key === 'satellite_2d' || (it.key !== 'drone_3d' && it.tilt === undefined && it.key !== 'local_file')).length;
            const uploadCount = this.items.filter(it => it.key === 'local_file').length;

            this.updateBadgeCount();

            // Kartlar HTML
            let cardsHtml = '';
            if (filteredList.length === 0) {
                cardsHtml = `
                    <div class="staging-empty-state">
                        <div class="staging-empty-icon-wrap">
                            <i class="fa-solid fa-images"></i>
                        </div>
                        <div class="staging-empty-title">Görsel Bulunamadı</div>
                        <p class="staging-empty-desc">${total === 0 ? '3B Drone çekimleri, uydu kadrajları veya bilgisayarınızdan eklediğiniz fotoğraflar burada toplanır.' : 'Seçilen filtreye ait kayıtlı görsel bulunmamaktadır.'}</p>
                        <div class="staging-empty-actions">
                            <button type="button" class="btn-action" onclick="if(window.openSatelliteMapModal) window.openSatelliteMapModal();" title="Harita ve 3B Drone Çekimini Açar">
                                <i class="fa-solid fa-crosshairs"></i> Harita &amp; Drone
                            </button>
                            <button type="button" class="btn-action" onclick="document.getElementById('stagingFileInput').click();" title="Bilgisayardan fotoğraf yükler">
                                <i class="fa-solid fa-folder-open"></i> Fotoğraf Yükle
                            </button>
                        </div>
                    </div>
                `;
            } else {
                const cardsInner = filteredList.map((it, idx) => {
                    const isActive = (it.id === this.activeItemId);
                    const isSelected = this.selectedIds.has(it.id);
                    const tagParts = [];
                    if (it.tilt !== undefined) tagParts.push(`${it.tilt}° Eğim`);
                    if (it.heading !== undefined) tagParts.push(`${it.heading}° Yön`);
                    if (it.parcelMeta?.ada && it.parcelMeta?.parsel) tagParts.push(`${it.parcelMeta.ada}/${it.parcelMeta.parsel}`);
                    const tagStr = tagParts.join(' • ');

                    return `
                        <div class="staging-card ${isActive ? 'is-active' : ''} ${isSelected ? 'is-selected' : ''}" data-id="${it.id}">
                            <div class="staging-card-thumb-wrap" onclick="PhotoStagingArchive.applyToCanvas('${it.id}')">
                                <label class="staging-card-check" onclick="event.stopPropagation()">
                                    <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="PhotoStagingArchive.toggleSelect('${it.id}')">
                                </label>
                                ${isActive ? '<span class="staging-active-pill"><i class="fa-solid fa-circle-check"></i> Tuvalde</span>' : ''}
                                <img class="staging-card-img" src="${it.thumbUrl || it.dataUrl}" alt="${it.title}" loading="lazy">
                                <div class="staging-card-hover-actions">
                                    <button type="button" class="staging-hover-btn" onclick="event.stopPropagation(); PhotoStagingArchive.applyToCanvas('${it.id}')" title="Tuvale Aktar">
                                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                                    </button>
                                    <button type="button" class="staging-hover-btn" onclick="event.stopPropagation(); PhotoStagingArchive.downloadSingle('${it.id}')" title="İndir">
                                        <i class="fa-solid fa-download"></i>
                                    </button>
                                    <button type="button" class="staging-hover-btn staging-hover-delete" onclick="event.stopPropagation(); PhotoStagingArchive.deleteSingle('${it.id}')" title="Sil">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="staging-card-meta" onclick="PhotoStagingArchive.applyToCanvas('${it.id}')">
                                <div class="staging-card-title-row">
                                    <span class="staging-card-idx">${idx + 1}</span>
                                    <span class="staging-card-title" title="${it.title}">${it.title}</span>
                                </div>
                                ${tagStr ? `<div class="staging-card-tag" title="${tagStr}">${tagStr}</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');

                cardsHtml = `<div class="staging-grid" id="stagingCardsGrid">${cardsInner}</div>`;
            }

            const currentLogo = this.getCurrentLogoUrl();

            root.innerHTML = `
                <!-- Başlık ve Sayaç -->
                <div class="staging-panel-header">
                    <div class="section-title" style="margin:0; border:none; padding:0;">
                        <i class="fa-solid fa-images" style="color:#0284c7; margin-right:6px;"></i>Görsel Havuzu
                    </div>
                    <span class="staging-panel-counter">${total} Görsel</span>
                </div>

                <!-- Fotoğraf Ekleme & Sürükle Bırak Dropzone -->
                <div class="staging-upload-dropzone" id="stagingDropzone">
                    <input type="file" id="stagingFileInput" accept="image/*" multiple style="display:none;" onchange="PhotoStagingArchive.handleFileInput(event)">
                    <div class="staging-dropzone-content" onclick="document.getElementById('stagingFileInput').click()">
                        <i class="fa-solid fa-cloud-arrow-up staging-drop-icon"></i>
                        <div class="staging-drop-texts">
                            <span class="staging-drop-main">Fotoğraf Ekle veya Sürükle</span>
                            <span class="staging-drop-sub">PNG, JPG, WebP çoklu seçim destekli</span>
                        </div>
                    </div>
                </div>

                <!-- Kaynak Filtreleri (Filter Pills) -->
                ${total > 0 ? `
                    <div class="staging-filter-pills">
                        <button type="button" class="staging-pill ${this.currentFilter === 'all' ? 'is-active' : ''}" onclick="PhotoStagingArchive.setFilter('all')">
                            Tümü (${total})
                        </button>
                        <button type="button" class="staging-pill ${this.currentFilter === 'drone' ? 'is-active' : ''}" onclick="PhotoStagingArchive.setFilter('drone')">
                            3B Drone (${droneCount})
                        </button>
                        <button type="button" class="staging-pill ${this.currentFilter === 'satellite' ? 'is-active' : ''}" onclick="PhotoStagingArchive.setFilter('satellite')">
                            Uydu (${satCount})
                        </button>
                        <button type="button" class="staging-pill ${this.currentFilter === 'upload' ? 'is-active' : ''}" onclick="PhotoStagingArchive.setFilter('upload')">
                            Yüklenenler (${uploadCount})
                        </button>
                    </div>
                ` : ''}

                <!-- Toplu İşlem Çubuğu -->
                ${total > 0 ? `
                    <div class="staging-batch-toolbar">
                        <div class="staging-select-all-row">
                            <label class="staging-select-all-label">
                                <input type="checkbox" id="stagingSelectAllCb" ${allSelected ? 'checked' : ''} onchange="PhotoStagingArchive.toggleSelectAll(this.checked)">
                                <span>Tümünü Seç</span>
                            </label>
                            <span id="stagingSelectedCount" class="staging-selected-count">${selCount} / ${filteredList.length} Seçili</span>
                        </div>
                        <div class="staging-batch-actions-grid">
                            <button type="button" class="btn-action staging-batch-btn" onclick="PhotoStagingArchive.applySelectedToCanvas()" title="Seçilen görseli tuvale aktarır">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i> Tuvale Aktar
                            </button>
                            <button type="button" class="btn-action staging-batch-btn" onclick="PhotoStagingArchive.downloadSelectedZip()" title="Seçilen görselleri tek ZIP olarak indirir">
                                <i class="fa-solid fa-file-zipper"></i> Toplu İndir
                            </button>
                            <button type="button" class="btn-action staging-batch-btn ${this.watermarkTrayOpen ? 'active' : ''}" onclick="PhotoStagingArchive.toggleWatermarkTray()" title="Görsellere firma logosu ve filigran damgalayın">
                                <i class="fa-solid fa-shield-halved"></i> Filigran &amp; Logo
                            </button>
                            <button type="button" class="btn-action staging-batch-btn ${this.formatTrayOpen ? 'active' : ''}" onclick="PhotoStagingArchive.toggleFormatTray()" title="Görselleri 1:1, 9:16 veya 16:9 boyutlarına dönüştürün">
                                <i class="fa-solid fa-crop-simple"></i> Format &amp; Kadraj
                            </button>
                            <button type="button" class="btn-action staging-batch-btn" onclick="PhotoStagingArchive.generatePortfolioPdf()" title="Görseller ve emlak detaylarıyla A4 PDF sunum broşürü indirin">
                                <i class="fa-solid fa-file-pdf"></i> PDF Portföy
                            </button>
                            <button type="button" class="btn-action staging-batch-btn" onclick="PhotoStagingArchive.openCompareModal()" title="Orijinal ve düzenlenen görseli karşılaştırın">
                                <i class="fa-solid fa-table-columns"></i> Öncesi / Sonrası
                            </button>
                            <button type="button" id="stagingCarouselBtn" class="btn-action staging-batch-btn ${window.CarouselManager && window.CarouselManager.isVisible ? 'active' : ''}" onclick="PhotoStagingArchive.toggleCarousel()" title="Çoklu Gönderi: Seçilen fotoğrafları Instagram ve sosyal medya için çok sayfalı kaydırmalı albüme dönüştürür. Açmak veya kapatmak için tıklayın.">
                                <i class="fa-solid fa-layer-group"></i> Çoklu Gönderi
                            </button>
                            <button type="button" class="btn-action staging-batch-btn ${this.aiTrayOpen ? 'active' : ''}" onclick="PhotoStagingArchive.toggleAiTray()" title="Yapay zeka netleştirme ayarını açar">
                                <i class="fa-solid fa-wand-magic-sparkles"></i> AI Netleştir
                            </button>
                            <button type="button" class="btn-action staging-batch-btn staging-btn-danger" onclick="PhotoStagingArchive.deleteSelected()" title="Seçilen görselleri havuzdan siler">
                                <i class="fa-solid fa-trash-can"></i> Seçilenleri Sil
                            </button>
                            <button type="button" class="btn-action staging-batch-btn staging-btn-danger" onclick="PhotoStagingArchive.clearAllPool()" title="Görsel havuzunu ve tuvali tamamen temizler">
                                <i class="fa-solid fa-broom"></i> Havuzu Boşalt
                            </button>
                        </div>

                        <!-- 🛡️ FİLİGRAN & LOGO AYAR PANELİ (Açılır) -->
                        <div class="staging-sub-tray ${this.watermarkTrayOpen ? 'is-open' : ''}" id="stagingWatermarkTray">
                            <div class="staging-tray-title">
                                <span><i class="fa-solid fa-shield-halved" style="color:#0284c7; margin-right:5px;"></i>Filigran &amp; Logo Damgalama</span>
                                <button type="button" class="btn-action" style="padding:1px 6px; height:20px; font-size:10px;" onclick="PhotoStagingArchive.toggleWatermarkTray()">Kapat</button>
                            </div>
                            <div class="staging-tray-row">
                                <div class="staging-logo-preview-box">
                                    ${currentLogo ? `<img src="${currentLogo}" class="staging-logo-preview-img" alt="Logo">` : '<i class="fa-solid fa-image" style="color:#94a3b8; font-size:14px;"></i>'}
                                </div>
                                <input type="file" id="stagingWatermarkLogoInput" accept="image/*" style="display:none;" onchange="PhotoStagingArchive.handleWatermarkLogoUpload(event)">
                                <button type="button" class="btn-action" style="flex:1; height:32px; font-size:11px;" onclick="document.getElementById('stagingWatermarkLogoInput').click()">
                                    <i class="fa-solid fa-arrow-up-from-bracket"></i> ${currentLogo ? 'Logoyu Değiştir' : 'Logo Seç'}
                                </button>
                                <button type="button" class="btn-action" style="height:32px; padding:0 8px; font-size:11px;" onclick="PhotoStagingArchive.addLogoToCanvas()" title="Logoyu tuval tasarımına ekleyin">
                                    <i class="fa-solid fa-plus"></i> Tuvale
                                </button>
                            </div>
                            <div class="staging-tray-row">
                                <select class="staging-tray-select" id="watermarkPosSelect" onchange="PhotoStagingArchive.watermarkOptions.position = this.value">
                                    <option value="bottom-right" ${this.watermarkOptions.position === 'bottom-right' ? 'selected' : ''}>Konum: Sağ Alt</option>
                                    <option value="bottom-left" ${this.watermarkOptions.position === 'bottom-left' ? 'selected' : ''}>Konum: Sol Alt</option>
                                    <option value="top-right" ${this.watermarkOptions.position === 'top-right' ? 'selected' : ''}>Konum: Sağ Üst</option>
                                    <option value="top-left" ${this.watermarkOptions.position === 'top-left' ? 'selected' : ''}>Konum: Sol Üst</option>
                                    <option value="center" ${this.watermarkOptions.position === 'center' ? 'selected' : ''}>Konum: Merkez</option>
                                </select>
                            </div>
                            <div class="slider-group">
                                <label><span>Boyut</span><span id="wmScaleVal">${this.watermarkOptions.scale}%</span></label>
                                <input type="range" min="10" max="45" value="${this.watermarkOptions.scale}" oninput="PhotoStagingArchive.watermarkOptions.scale = parseInt(this.value); document.getElementById('wmScaleVal').textContent = this.value + '%';">
                            </div>
                            <div class="slider-group">
                                <label><span>Opaklık</span><span id="wmOpacityVal">${this.watermarkOptions.opacity}%</span></label>
                                <input type="range" min="20" max="100" value="${this.watermarkOptions.opacity}" oninput="PhotoStagingArchive.watermarkOptions.opacity = parseInt(this.value); document.getElementById('wmOpacityVal').textContent = this.value + '%';">
                            </div>
                            <button type="button" class="btn-action" style="width:100%; height:32px; font-size:11.5px; font-weight:700;" onclick="PhotoStagingArchive.applyWatermarkSelected()">
                                <i class="fa-solid fa-stamp"></i> Seçilenlere Damgala
                            </button>
                        </div>

                        <!-- 📐 FORMAT & KADRAJ PANELİ (Açılır) -->
                        <div class="staging-sub-tray ${this.formatTrayOpen ? 'is-open' : ''}" id="stagingFormatTray">
                            <div class="staging-tray-title">
                                <span><i class="fa-solid fa-crop-simple" style="color:#0284c7; margin-right:5px;"></i>Format &amp; Sosyal Medya</span>
                                <button type="button" class="btn-action" style="padding:1px 6px; height:20px; font-size:10px;" onclick="PhotoStagingArchive.toggleFormatTray()">Kapat</button>
                            </div>
                            <div class="staging-tray-row">
                                <select class="staging-tray-select" id="formatRatioSelect" onchange="PhotoStagingArchive.formatOptions.ratio = this.value">
                                    <option value="1:1" ${this.formatOptions.ratio === '1:1' ? 'selected' : ''}>1:1 Kare Post</option>
                                    <option value="9:16" ${this.formatOptions.ratio === '9:16' ? 'selected' : ''}>9:16 Dikey Story</option>
                                    <option value="16:9" ${this.formatOptions.ratio === '16:9' ? 'selected' : ''}>16:9 Yatay Web</option>
                                </select>
                                <select class="staging-tray-select" id="formatModeSelect" onchange="PhotoStagingArchive.formatOptions.mode = this.value">
                                    <option value="contain_blur" ${this.formatOptions.mode === 'contain_blur' ? 'selected' : ''}>Bulanık Zeminle Sığdır</option>
                                    <option value="cover" ${this.formatOptions.mode === 'cover' ? 'selected' : ''}>Ortalayarak Doldur</option>
                                </select>
                            </div>
                            <button type="button" class="btn-action" style="width:100%; height:32px; font-size:11.5px; font-weight:700;" onclick="PhotoStagingArchive.applyFormatSelected()">
                                <i class="fa-solid fa-arrows-split-up-and-left"></i> Seçilenleri Boyutlandır
                            </button>
                        </div>

                        <!-- 🪄 AI NETLEŞTİRME AYAR PANELİ (Açılır) -->
                        <div class="staging-sub-tray ${this.aiTrayOpen ? 'is-open' : ''}" id="stagingAiTray">
                            <div class="staging-tray-title">
                                <span><i class="fa-solid fa-wand-magic-sparkles" style="color:#0284c7; margin-right:5px;"></i>AI Netleştirme Ayarı</span>
                                <button type="button" class="btn-action" style="padding:1px 6px; height:20px; font-size:10px;" onclick="PhotoStagingArchive.toggleAiTray()">Kapat</button>
                            </div>
                            <div class="slider-group">
                                <label><span>Netlik Miktarı</span><span id="stagingAiIntensityVal">%${Math.round((this.aiIntensity || 0.35) * 100)}</span></label>
                                <input type="range" id="stagingAiIntensitySlider" min="10" max="100" step="5" value="${Math.round((this.aiIntensity || 0.35) * 100)}" 
                                       oninput="PhotoStagingArchive.previewAiIntensityLive(this.value)" 
                                       onchange="PhotoStagingArchive.commitAiIntensity(this.value)"
                                       title="Sliderı kaydırarak canlı netlik önizlemesini izleyin">
                            </div>
                            <button type="button" class="btn-action" style="width:100%; height:32px; font-size:11.5px; font-weight:700;" onclick="PhotoStagingArchive.applyAiEnhanceSelected()" title="Seçili tüm görsellere bu netliği kalıcı olarak uygula">
                                <i class="fa-solid fa-wand-magic-sparkles"></i> Netleştir
                            </button>
                        </div>
                    </div>
                ` : ''}

                <!-- Görseller Izgarası veya Boş Durum -->
                ${cardsHtml}
            `;

            this.initDropzoneListeners();
        },

        /**
         * Giriş Sekmesindeki (tab-data) Aktif Görsel & Havuz Kartını Günceller
         */
        renderDataTabWidget: function() {
            const container = document.getElementById('dataTabPoolWidget');
            if (!container) return;

            const total = this.items ? this.items.length : 0;
            const activeItem = (this.items && this.items.length > 0)
                ? (this.items.find(it => it.id === this.activeItemId) || this.items[0])
                : null;

            if (total === 0 || !activeItem) {
                container.innerHTML = `
                    <div style="display:flex; align-items:center; gap:6px;">
                        <button type="button" class="btn-action btn-blue" style="flex:1; height:38px; padding:0 12px; font-size:12.5px; font-weight:700; border-radius:8px; display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer;" onclick="document.getElementById('imageInput').click()" title="Bilgisayarınızdan fotoğraf yükleyin">
                            <i class="fa-solid fa-cloud-arrow-up" style="font-size:14px;"></i>
                            <span id="bgUploadBtnText">Fotoğraf Seç &amp; Yükle</span>
                        </button>
                    </div>
                `;
                return;
            }

            const thumb = activeItem.thumbUrl || activeItem.dataUrl;
            const safeTitle = (activeItem.title || 'Aktif Görsel').replace(/"/g, '&quot;');

            container.innerHTML = `
                <div class="data-pool-card">
                    <div class="data-pool-card-header" onclick="PhotoStagingArchive.switchToStagingTab()" title="Görseller sekmesine git">
                        <img src="${thumb}" alt="${safeTitle}" class="data-pool-card-thumb">
                        <div class="data-pool-card-info">
                            <div class="data-pool-card-title-row">
                                <span class="data-pool-card-title" title="${safeTitle}">${safeTitle}</span>
                                <span class="data-pool-card-badge">${total} Görsel</span>
                            </div>
                            <div class="data-pool-card-sub">
                                <i class="fa-solid fa-circle-check" style="color:#10b981; font-size:11px;"></i> Tuvalde Aktif
                            </div>
                        </div>
                    </div>
                    <div class="data-pool-card-actions">
                        <button type="button" class="btn-action" style="flex:1;" onclick="document.getElementById('imageInput').click()" title="Yeni bir fotoğraf seçip havuza ekleyin ve tuvale aktarın">
                            <i class="fa-solid fa-plus"></i> Görsel Ekle
                        </button>
                        <button type="button" class="btn-action" style="flex:1;" onclick="PhotoStagingArchive.switchToStagingTab()" title="Görsel havuzunu açın">
                            <i class="fa-solid fa-images"></i> Havuzu Yönet
                        </button>
                        <button type="button" class="btn-action staging-btn-danger" style="width:28px; height:28px; padding:0; flex-shrink:0;" onclick="PhotoStagingArchive.clearAllPool()" title="Görsel havuzunu ve tuvali tamamen temizle">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `;
        },

        /**
         * Çıktı Sekmesindeki (tab-batch) Havuz Durumunu ve Listeyi Günceller
         */
        renderExportTabBatchList: function() {
            const statusContainer = document.getElementById('batchPoolStatusContainer');
            const total = this.items ? this.items.length : 0;

            if (statusContainer) {
                if (total === 0) {
                    statusContainer.innerHTML = `
                        <div style="border:1px dashed #cbd5e1; border-radius:8px; padding:10px; text-align:center; background:#f8fafc; color:#64748b; font-size:11.5px; margin-bottom:10px;">
                            <div style="margin-bottom:6px;"><i class="fa-solid fa-images" style="font-size:18px; color:#94a3b8;"></i></div>
                            <div>Görsel havuzu henüz boş.</div>
                            <div style="margin-top:8px; display:flex; justify-content:center; gap:6px;">
                                <button type="button" class="btn-action" style="font-size:11px; height:26px; padding:0 8px;" onclick="document.getElementById('imageInput').click()">
                                    <i class="fa-solid fa-plus"></i> Görsel Ekle
                                </button>
                                <button type="button" class="btn-action" style="font-size:11px; height:26px; padding:0 8px;" onclick="PhotoStagingArchive.switchToStagingTab()">
                                    <i class="fa-solid fa-crosshairs"></i> Harita &amp; Drone
                                </button>
                            </div>
                        </div>
                    `;
                } else {
                    statusContainer.innerHTML = `
                        <div style="border:1px solid #cbd5e1; border-radius:8px; padding:8px 10px; background:#f8fafc; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; gap:8px;">
                            <div style="display:flex; align-items:center; gap:8px; min-width:0;">
                                <i class="fa-solid fa-boxes-stacked" style="color:#0284c7; font-size:15px; flex-shrink:0;"></i>
                                <div style="min-width:0;">
                                    <div style="font-size:11.5px; font-weight:700; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Görsel Havuzu Hazır</div>
                                    <div style="font-size:10.5px; color:#64748b;">${total} görsel dışa aktarılmaya hazır</div>
                                </div>
                            </div>
                            <button type="button" class="btn-action" style="height:26px; font-size:10.5px; padding:0 8px; flex-shrink:0;" onclick="PhotoStagingArchive.switchToStagingTab()" title="Görseller sekmesinde havuzu düzenle">
                                <i class="fa-solid fa-pen-to-square"></i> Düzenle
                            </button>
                        </div>
                    `;
                }
            }

            if (typeof window.renderBatchList === 'function') {
                try { window.renderBatchList(); } catch(eBatch) {}
            }
        },

        /**
         * Tüm Harici Sekmeleri Havuz Verisiyle Senkronize Eder
         */
        syncExternalTabs: function() {
            this.renderDataTabWidget();
            this.renderExportTabBatchList();
        },

        close: function() {
            // Panelde kapatma gerekmez, sol sekme olarak açık kalır
        }
    };

    window.PhotoStagingArchive = PhotoStagingArchive;

    // Sayfa hazır olduğunda başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PhotoStagingArchive.init());
    } else {
        setTimeout(() => PhotoStagingArchive.init(), 100);
    }

})(window);
