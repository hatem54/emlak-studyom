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
        exportQuality: (() => {
            try {
                const saved = localStorage.getItem('staging_export_quality');
                if (['web', 'high', 'ultra', 'lossless'].includes(saved)) return saved;
            } catch(e) {}
            return 'web';
        })(),
        formatQuality: (() => {
            try {
                const saved = localStorage.getItem('staging_format_quality');
                if (['hd', '2k', '4k', 'png'].includes(saved)) return saved;
            } catch(e) {}
            return '2k';
        })(),
        isExportingZip: false,
        isExportingPlatforms: false,
        isCompareOpen: false,
        compareMode: 'toggle',
        watermarkOptions: {
            position: 'bottom-right',
            scale: 20,
            opacity: 100,
            customLogoUrl: null,
            applyToAll: true
        },
        globalLogoPos: null,
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

            // ESC tuşuyla karşılaştırma ekranını anında kapat
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isCompareOpen) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.closeCanvasCompare();
                }
            }, true);

            // İlk render
            this.renderPanel();
            this.syncExternalTabs();

            // Sürükle-bırak olaylarını kur
            this.initDropzoneListeners();
            this.syncCanvasCarouselBadge();
        },

        /**
         * Yeni Çekim Öğeleriyle Havuzu Doldurur ve Sol Sekmeyi Açar
         */
        openWithItems: function(newItems) {
            if (!Array.isArray(newItems) || newItems.length === 0) return;

            // Yeni gelen çekimleri ekle (aynı id varsa ez)
            newItems.forEach(item => {
                if (!item.originalDataUrl) item.originalDataUrl = item.dataUrl;
                if (!item.rawOriginalDataUrl) item.rawOriginalDataUrl = item.dataUrl;
                if (!item.thumbUrl) item.thumbUrl = item.dataUrl;
                if (!item.rawOriginalThumbUrl) item.rawOriginalThumbUrl = item.thumbUrl;
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
            if (!item.rawOriginalDataUrl) item.rawOriginalDataUrl = item.dataUrl;
            if (!item.thumbUrl) item.thumbUrl = item.dataUrl;
            if (!item.rawOriginalThumbUrl) item.rawOriginalThumbUrl = item.thumbUrl;

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
        addItems: function(itemsList, shouldSwitchTab = true, skipApplyToCanvas = false) {
            if (!Array.isArray(itemsList) || itemsList.length === 0) return;
            const validItems = itemsList.filter(it => it && it.dataUrl);
            validItems.forEach(it => {
                if (!it.id) it.id = 'photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
                if (!it.originalDataUrl) it.originalDataUrl = it.dataUrl;
                if (!it.rawOriginalDataUrl) it.rawOriginalDataUrl = it.dataUrl;
                if (!it.thumbUrl) it.thumbUrl = it.dataUrl;
                if (!it.rawOriginalThumbUrl) it.rawOriginalThumbUrl = it.thumbUrl;
                this.selectedIds.add(it.id);
            });
            this.items.unshift(...validItems);
            if (validItems[0]) this.activeItemId = validItems[0].id;

            this.renderPanel();
            this.updateBadgeCount();
            this.syncExternalTabs();

            if (shouldSwitchTab) {
                this.switchToStagingTab();
            }

            // Eklenen ilk görseli otomatik olarak tuvale aktar (skipApplyToCanvas false ise)
            if (!skipApplyToCanvas && validItems[0] && validItems[0].dataUrl) {
                this.applyToCanvas(validItems[0].id, false);
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

                // Önceki görselin logo konumunu güvenle yakala ve kaydet
                const prevActiveId = this.activeItemId;
                const prevItem = (prevActiveId && this.items) ? this.items.find(it => it.id === prevActiveId) : null;
                if (prevItem && typeof this.captureCanvasLogoForImage === 'function') {
                    this.captureCanvasLogoForImage(prevItem);
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

                // 2. Fotoğraf katmanını görünür yap (Canva modundaysa gizli kalır)
                const isCanvaModeActive = !!(window.isCanvaMode || (typeof isCanvaMode !== 'undefined' && isCanvaMode));
                const pl = document.getElementById('photo-layer');
                if (pl) {
                    if (isCanvaModeActive) {
                        pl.style.setProperty('display', 'none', 'important');
                        pl.style.opacity = '0';
                    } else {
                        pl.style.display = 'block';
                        pl.style.visibility = 'visible';
                    }
                }
                const canvaL = document.getElementById('canva-render-layer');
                if (canvaL) {
                    canvaL.style.display = isCanvaModeActive ? 'block' : 'none';
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
                    const isCanva = !!(window.isCanvaMode || (typeof isCanvaMode !== 'undefined' && isCanvaMode));
                    const pl = document.getElementById('photo-layer');
                    if (pl) {
                        if (isCanva) {
                            pl.style.setProperty('display', 'none', 'important');
                            pl.style.opacity = '0';
                        } else {
                            pl.style.display = 'block';
                            pl.style.visibility = 'visible';
                            pl.style.opacity = '1';
                        }
                    }
                    const canvaL = document.getElementById('canva-render-layer');
                    if (canvaL && isCanva) {
                        canvaL.style.display = 'block';
                    }
                    if (typeof applyPhotoFilters === 'function') {
                        applyPhotoFilters();
                    } else if (typeof requestPhotoRepaint === 'function') {
                        requestPhotoRepaint();
                    }
                    if (typeof redrawAll === 'function') {
                        redrawAll();
                    }
                    if (isCanva && typeof refreshActiveCanvaTemplate === 'function') {
                        refreshActiveCanvaTemplate();
                    }
                    this.syncExternalTabs();
                    if (typeof window.renderLayers === 'function') window.renderLayers();

                    // AI Netleştirme tepsisi açıksa veya görsel netleştirilmişse canlı GPU filtresini uygula
                    if (item && item.aiIntensity && item.aiIntensity > 0.05) {
                        this.previewAiIntensityLive(Math.round(item.aiIntensity * 100));
                    } else if (this.aiTrayOpen) {
                        this.previewAiIntensityLive(Math.round((this.aiIntensity || 0.35) * 100));
                    }

                    // Karusel açıksa aktif sayfanın görsel ve önizlemesini senkronize et
                    if (window.CarouselManager && window.CarouselManager.isVisible && Array.isArray(window.CarouselManager.pages)) {
                        const curPage = window.CarouselManager.pages[window.CarouselManager.activePageIndex];
                        if (curPage) {
                            curPage.thumb = item.thumbUrl || item.dataUrl;
                            curPage.stagingItemId = item.id;
                            if (curPage.snapshot) {
                                curPage.snapshot.photoImgUrl = item.dataUrl;
                                curPage.snapshot.uploadedImgUrl = item.dataUrl;
                            }
                            window.CarouselManager.renderFilmstrip();
                        }
                    }

                    // 🛡️ Logo Katmanı (elLogo) Koruma & En Üste Taşıma:
                    // Havuzda görseller arası gezinirken logonun görselin altında kalmasını kesinlikle önle
                    const logoEl = document.getElementById('elLogo');
                    const canvasContainer = document.getElementById('canvas-container');
                    const currentLogoUrl = (typeof this.getCurrentLogoUrl === 'function') ? this.getCurrentLogoUrl() : (window.companyLogo || null);

                    const isLogoActive = logoEl && (
                        (logoEl.style.display !== 'none' && logoEl.style.visibility !== 'hidden' && logoEl.style.opacity !== '0') ||
                        (currentLogoUrl && (this.watermarkTrayOpen || this.watermarkOptions.applyToAll))
                    );

                    if (logoEl && canvasContainer && isLogoActive && currentLogoUrl) {
                        const img = logoEl.querySelector('img') || logoEl.querySelector('#elLogoImg');
                        logoEl.src = currentLogoUrl;
                        if (img) {
                            img.src = currentLogoUrl;
                            img.style.display = 'block';
                            img.style.visibility = 'visible';
                            img.style.width = '100%';
                            img.style.height = 'auto';
                            img.style.objectFit = 'contain';
                        }
                        
                        logoEl.style.display = 'block';
                        logoEl.style.visibility = 'visible';
                        logoEl.style.zIndex = '99999';

                        // Daima canvas-container'ın en son elemanı yap (Hiçbir katman örtemez)
                        if (canvasContainer.lastElementChild !== logoEl) {
                            canvasContainer.appendChild(logoEl);
                        }

                        const cW = parseInt(canvasContainer.style.width) || canvasContainer.offsetWidth || 1920;
                        const cH = parseInt(canvasContainer.style.height) || canvasContainer.offsetHeight || 1080;

                        // Boyut ve konumu yeni görsel boyutuna uyarla (taşmayı engelle ve akıllı konumlandır)
                        let targetPos = null;
                        if (item && item.excludeLogo && item.customLogoPos) {
                            targetPos = item.customLogoPos;
                        } else if (this.watermarkOptions.applyToAll !== false && this.globalLogoPos) {
                            targetPos = this.globalLogoPos;
                        } else if (item && item.customLogoPos) {
                            targetPos = item.customLogoPos;
                        } else {
                            targetPos = this.captureLogoCoords(logoEl, canvasContainer);
                            if (targetPos && this.watermarkOptions.applyToAll !== false && !this.globalLogoPos) {
                                this.globalLogoPos = targetPos;
                            }
                        }

                        if (!targetPos && typeof this.getDefaultLogoCoords === 'function') {
                            targetPos = this.getDefaultLogoCoords(cW, cH);
                            if (this.watermarkOptions.applyToAll !== false && !this.globalLogoPos) {
                                this.globalLogoPos = targetPos;
                            }
                        }

                        if (targetPos && typeof this.applyLogoCoordsToCanvas === 'function') {
                            this.applyLogoCoordsToCanvas(targetPos);
                        } else if (this.watermarkOptions && this.watermarkOptions.position && this.watermarkOptions.position !== 'custom') {
                            this.applyWatermarkToCanvas(true);
                        }
                        if (typeof this.syncWatermarkUiControls === 'function') {
                            this.syncWatermarkUiControls();
                        }
                    }

                    if (typeof window.recordHistoryImmediate === 'function' && !window.isHistoryRestoring) {
                        window.recordHistoryImmediate('Aktif Görsel Tuvale Aktarıldı');
                    }
                    this.syncCanvasCarouselBadge();
                };

                if (typeof window.applyProjectImageFromDataUrl === 'function') {
                    window.applyProjectImageFromDataUrl(item.dataUrl, (err) => {
                        window._isApplyingToCanvas = false;
                        if (!err) {
                            finishRender();
                        }
                    }, true);
                } else if (typeof window.applyFinalProjectImage === 'function') {
                    const img = new Image();
                    img.onload = () => {
                        window._isApplyingToCanvas = false;
                        window.applyFinalProjectImage(img, item.dataUrl, img.naturalWidth || 1920, img.naturalHeight || 1080);
                        finishRender();
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
         * Seçili veya Aktif Görseli Tuvale Aktarır
         * Tüm görseller seçili olsa dahi o an aktif üzerinde çalışılan görseli korur, zorla 1. görsele zıplamaz
         */
        applySelectedToCanvas: function() {
            const targets = this.getSelectedItems();
            if (targets.length === 0 && !this.activeItemId) {
                if (typeof window.showAppToast === 'function') window.showAppToast('Lütfen önce bir görsel seçin.', 'warning');
                return;
            }

            // 1. Tek bir görsel seçilmişse doğrudan onu aktar
            if (targets.length === 1) {
                this.applyToCanvas(targets[0].id);
                return;
            }

            // 2. Çoklu seçim varsa (veya Tümünü Seç aktifse):
            // Kullanıcının o an üzerinde çalıştığı aktif görsel seçilenler arasındaysa onu koru
            if (this.activeItemId) {
                const activeInTargets = targets.find(it => it.id === this.activeItemId);
                if (activeInTargets) {
                    this.applyToCanvas(this.activeItemId);
                    return;
                }
                const activeInItems = this.items ? this.items.find(it => it.id === this.activeItemId) : null;
                if (activeInItems) {
                    this.applyToCanvas(this.activeItemId);
                    return;
                }
            }

            // 3. Aktif görsel yoksa seçilenlerin ilkini aktar
            if (targets.length > 0) {
                this.applyToCanvas(targets[0].id);
            }
        },

        /**
         * Tekil Görseli Bilgisayara İndirir (Aktif Logo Varsa Ekler & Kaliteyi Korur)
         */
        downloadSingle: async function(id) {
            const item = this.items.find(it => it.id === id);
            if (!item || !item.dataUrl) return;

            const ada = item.parcelMeta?.ada ? `Ada_${item.parcelMeta.ada}` : '';
            const parsel = item.parcelMeta?.parsel ? `Parsel_${item.parcelMeta.parsel}` : '';
            const tag = (ada || parsel) ? `_${ada}_${parsel}` : '';
            const cleanTitle = (item.title || 'gorsel').replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ_-]/g, '_');

            const qKey = this.exportQuality || 'lossless';
            const res = await this.getItemExportBlobAsync(item, qKey);
            if (res && res.blob) {
                const ext = res.ext || 'png';
                const filename = `EmlakStudyom_${cleanTitle}${tag}.${ext}`;
                const blobUrl = URL.createObjectURL(res.blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            } else {
                const filename = `EmlakStudyom_${cleanTitle}${tag}.png`;
                const a = document.createElement('a');
                a.href = item.dataUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        },

        setExportQuality: function(quality) {
            const valid = ['web', 'high', 'ultra', 'lossless'];
            this.exportQuality = valid.includes(quality) ? quality : 'web';
            try {
                localStorage.setItem('staging_export_quality', this.exportQuality);
            } catch(e) {}
        },

        setFormatQuality: function(quality) {
            const valid = ['hd', '2k', '4k', 'png'];
            this.formatQuality = valid.includes(quality) ? quality : '2k';
            try {
                localStorage.setItem('staging_format_quality', this.formatQuality);
            } catch(e) {}
        },

        /**
         * En-Boy Oranı ve Kalite Seviyesine Göre Hedef Çözünürlük ve Sıkıştırma Parametrelerini Döndürür
         */
        getFormatTargetSpecs: function(ratio, qualityKey, srcW = 1920, srcH = 1080) {
            const q = qualityKey || this.formatQuality || '2k';
            let targetW = 2048;
            let targetH = 2048;
            let mime = (q === 'png') ? 'image/png' : 'image/jpeg';
            let quality = (q === '4k') ? 0.98 : (q === '2k' ? 0.96 : 0.92);

            if (ratio === 'original') {
                targetW = srcW;
                targetH = srcH;
                return { targetW, targetH, mime, quality };
            }

            if (ratio === '1:1') {
                if (q === 'hd') { targetW = 1080; targetH = 1080; }
                else if (q === '4k') { targetW = 3072; targetH = 3072; }
                else { targetW = 2048; targetH = 2048; }
            } else if (ratio === '16:9') {
                if (q === 'hd') { targetW = 1920; targetH = 1080; }
                else if (q === '4k') { targetW = 3840; targetH = 2160; }
                else { targetW = 2560; targetH = 1440; }
            } else if (ratio === '9:16') {
                if (q === 'hd') { targetW = 1080; targetH = 1920; }
                else if (q === '4k') { targetW = 2160; targetH = 3840; }
                else { targetW = 1440; targetH = 2560; }
            } else if (ratio === '4:3') {
                if (q === 'hd') { targetW = 1440; targetH = 1080; }
                else if (q === '4k') { targetW = 2880; targetH = 2160; }
                else { targetW = 2048; targetH = 1536; }
            }

            return { targetW, targetH, mime, quality };
        },

        /**
         * Tuvalde veya Havuzda Aktif Bir Filigran/Logo Bulunup Bulunmadığını Kontrol Eder
         */
        hasActiveWatermark: function() {
            const logoUrl = this.getCurrentLogoUrl();
            if (!logoUrl || !this.isValidLogoUrl(logoUrl)) {
                return false;
            }

            const logoEl = document.getElementById('elLogo');
            const isCanvasLogoVisible = !!(
                logoEl &&
                logoEl.style.display !== 'none' &&
                logoEl.style.visibility !== 'hidden' &&
                parseFloat(logoEl.style.opacity || '1') > 0
            );

            return isCanvasLogoVisible || !!this.watermarkTrayOpen || (this.watermarkOptions && this.watermarkOptions.applyToAll !== false && !!this.globalLogoPos);
        },

        /**
         * Verilen Tuval Context'ine Aktif Filigran/Logoyu Kusursuz Şekilde Çizer
         */
        renderLogoToCanvasContext: function(ctx, canvas, item, logoImg) {
            if (!ctx || !canvas || !logoImg || !logoImg.naturalWidth) return false;

            const logoEl = document.getElementById('elLogo');
            const cc = document.getElementById('canvas-container');
            const ccW = cc ? (parseInt(cc.style.width) || cc.offsetWidth || 1920) : 1920;
            const ccH = cc ? (parseInt(cc.style.height) || cc.offsetHeight || 1080) : 1080;

            const { position, scale, opacity } = this.watermarkOptions || {};

            // Aktif veya özel konum ayarı (Görsel bazlı bağımsız konum veya paylaşımlı global konum)
            const itemPos = (item && item.excludeLogo && item.customLogoPos) 
                ? item.customLogoPos 
                : (this.globalLogoPos || (item && item.customLogoPos) || this.watermarkOptions);

            const itScale = (itemPos && typeof itemPos.scale === 'number') ? itemPos.scale : (scale || 20);
            const itOpacity = (itemPos && typeof itemPos.opacity === 'number') ? itemPos.opacity : (opacity || 100);
            const itPosition = (itemPos && itemPos.position) ? itemPos.position : (position || 'bottom-right');

            // Hedef tuval boyutuna göre logonun piksel boyutunu hesapla
            let logoW = Math.max(20, Math.round(canvas.width * (itScale / 100)));
            let logoH = Math.round(logoW * (logoImg.naturalHeight / logoImg.naturalWidth));
            let x = 0;
            let y = 0;

            if (itPosition && itPosition !== 'custom') {
                // Kullanıcı sol panelden hazır köşe seçtiyse
                const margin = Math.round(canvas.width * 0.035);
                x = canvas.width - logoW - margin;
                y = canvas.height - logoH - margin;

                if (itPosition === 'bottom-left') {
                    x = margin;
                    y = canvas.height - logoH - margin;
                } else if (itPosition === 'top-right') {
                    x = canvas.width - logoW - margin;
                    y = margin;
                } else if (itPosition === 'top-left') {
                    x = margin;
                    y = margin;
                } else if (itPosition === 'center') {
                    x = Math.round((canvas.width - logoW) / 2);
                    y = Math.round((canvas.height - logoH) / 2);
                }
            } else {
                // Serbest tuval konumu: oransal ve çıpa korumalı yerleşim
                const hasItemPos = !!(itemPos && (itemPos.anchorX || itemPos.relX !== undefined));
                
                let anchorX = 'right';
                let anchorY = 'bottom';
                let marginRightRatio = 0.035;
                let marginBottomRatio = 0.035;
                let marginLeftRatio = 0.035;
                let marginTopRatio = 0.035;
                let relX = 0;
                let relY = 0;
                let relW = itScale / 100;

                if (hasItemPos) {
                    anchorX = itemPos.anchorX || (itemPos.relX > 0.5 ? 'right' : 'left');
                    anchorY = itemPos.anchorY || (itemPos.relY > 0.5 ? 'bottom' : 'top');
                    marginRightRatio = itemPos.marginRightRatio !== undefined ? itemPos.marginRightRatio : Math.max(0, 1 - (itemPos.relX || 0) - (itemPos.relW || relW));
                    marginBottomRatio = itemPos.marginBottomRatio !== undefined ? itemPos.marginBottomRatio : Math.max(0, 1 - (itemPos.relY || 0) - ((itemPos.relW || relW) * (logoImg.naturalHeight / logoImg.naturalWidth)));
                    marginLeftRatio = itemPos.marginLeftRatio !== undefined ? itemPos.marginLeftRatio : (itemPos.relX || 0);
                    marginTopRatio = itemPos.marginTopRatio !== undefined ? itemPos.marginTopRatio : (itemPos.relY || 0);
                    relX = itemPos.relX || 0;
                    relY = itemPos.relY || 0;
                } else if (logoEl && logoEl.style.display !== 'none') {
                    // Tuvaldeki mevcut logo elementinden anlık oranları oku
                    const curLeft = (logoEl.offsetLeft !== undefined && !isNaN(logoEl.offsetLeft)) ? logoEl.offsetLeft : (ccW - (ccW * (itScale / 100)) - 50);
                    const curTop = (logoEl.offsetTop !== undefined && !isNaN(logoEl.offsetTop)) ? logoEl.offsetTop : (ccH - (ccW * (itScale / 100) * (logoImg.naturalHeight / logoImg.naturalWidth)) - 50);
                    const curW = logoEl.offsetWidth || (ccW * (itScale / 100));

                    relX = Math.max(0, curLeft) / ccW;
                    relY = Math.max(0, curTop) / ccH;
                    relW = Math.max(0.02, curW / ccW);
                    anchorX = relX > 0.5 ? 'right' : 'left';
                    anchorY = relY > 0.5 ? 'bottom' : 'top';
                    marginRightRatio = Math.max(0, 1 - relX - relW);
                    marginBottomRatio = Math.max(0, 1 - relY - (relW * (logoImg.naturalHeight / logoImg.naturalWidth)));
                    marginLeftRatio = relX;
                    marginTopRatio = relY;
                }

                if (anchorX === 'right') {
                    const mR = Math.round(canvas.width * marginRightRatio);
                    x = canvas.width - logoW - Math.max(0, mR);
                } else {
                    const mL = Math.round(canvas.width * marginLeftRatio);
                    x = Math.max(0, mL);
                }

                if (anchorY === 'bottom') {
                    const mB = Math.round(canvas.height * marginBottomRatio);
                    y = canvas.height - logoH - Math.max(0, mB);
                } else {
                    const mT = Math.round(canvas.height * marginTopRatio);
                    y = Math.max(0, mT);
                }

                x = Math.max(0, Math.min(canvas.width - logoW, x));
                y = Math.max(0, Math.min(canvas.height - logoH, y));
            }

            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.globalAlpha = Math.max(0.1, Math.min(1, itOpacity / 100));
            ctx.drawImage(logoImg, x, y, logoW, logoH);
            ctx.restore();
            return true;
        },

        /**
         * Tekil Bir Görseli Seçilen Kaliteye Göre Asenkron Blob Olarak Üretir (Non-blocking, RAM Korumalı & Aktif Logo Otomatik Eklemeli)
         */
        getItemExportBlobAsync: async function(item, qualityKey, preloadedLogoImg = null) {
            if (!item || !item.dataUrl) return null;
            const isPngReq = (qualityKey === 'lossless' || qualityKey === 'png');
            const isCurrentlyPng = item.dataUrl.startsWith('data:image/png');

            // Aktif filigran durumu kontrolü
            const shouldApplyLogo = !item.watermarkBaked && this.hasActiveWatermark();

            // Eğer filigran eklenmeyecekse ve zaten istenen formatta ise hızlı yoldan blob al
            if (!shouldApplyLogo) {
                if ((isPngReq && isCurrentlyPng) || (qualityKey === 'web' && !isCurrentlyPng)) {
                    try {
                        const res = await fetch(item.dataUrl);
                        const blob = await res.blob();
                        const ext = isPngReq ? 'png' : 'jpg';
                        return { blob, ext };
                    } catch(e) {}
                }
            }

            // Temiz tuval üzerinden asenkron re-encode
            const img = await this.loadImageAsync(item.dataUrl);
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || 1920;
            canvas.height = img.naturalHeight || 1080;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Eğer aktif logo varsa tuvale oransal ve çıpalı olarak çiz
            if (shouldApplyLogo) {
                let logoImg = preloadedLogoImg;
                if (!logoImg) {
                    const logoUrl = this.getCurrentLogoUrl();
                    if (logoUrl && this.isValidLogoUrl(logoUrl)) {
                        try {
                            logoImg = await this.loadImageAsync(logoUrl);
                        } catch(err) {
                            console.warn("Logo export esnasında yüklenemedi:", err);
                        }
                    }
                }
                if (logoImg) {
                    this.renderLogoToCanvasContext(ctx, canvas, item, logoImg);
                }
            }

            let mime = 'image/jpeg';
            let q = 0.92;
            let ext = 'jpg';

            if (isPngReq) {
                mime = 'image/png';
                ext = 'png';
            } else if (qualityKey === 'ultra') {
                q = 0.98;
            } else if (qualityKey === 'high') {
                q = 0.96;
            } else {
                q = 0.92;
            }

            const blob = await new Promise(resolve => {
                canvas.toBlob(b => resolve(b), mime, q);
            });

            // Anında bellek tahliyesi (RAM koruması)
            canvas.width = 0;
            canvas.height = 0;

            return { blob, ext };
        },

        /**
         * Dışa Aktarma İlerleme Durumunu Toplu İndir Butonuna Yansıtır
         */
        updateExportProgress: function(current, total, isGenerating = false) {
            const btn = document.getElementById('stagingBatchDownloadBtn');
            if (!btn) return;
            if (isGenerating) {
                btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sıkıştırılıyor';
            } else if (current > 0) {
                btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> ${current}/${total} Paketleniyor`;
            } else {
                btn.innerHTML = '<i class="fa-solid fa-file-zipper"></i> Toplu İndir';
            }
        },

        /**
         * Seçili (veya Tüm) Görselleri ZIP Arşivi Olarak İndirir (JSZip, Arka Plan Asenkron & RAM Korumalı)
         */
        downloadSelectedZip: async function() {
            if (this.isExportingZip) {
                if (typeof window.showAppToast === 'function') window.showAppToast('İndirme işlemi arka planda devam ediyor...', 'info');
                return;
            }

            const targets = this.getSelectedItems();
            if (targets.length === 0) {
                if (typeof window.showAppToast === 'function') window.showAppToast('İndirilecek görsel bulunamadı.', 'warning');
                return;
            }
            if (typeof JSZip === 'undefined' && window.LazyLoader) {
                await window.LazyLoader.load('zip', { label: 'ZIP Kütüphanesi' });
            }
            if (typeof JSZip === 'undefined') {
                if (typeof window.showAppToast === 'function') window.showAppToast('JSZip kütüphanesi yüklenemedi.', 'error');
                return;
            }

            this.isExportingZip = true;
            this.updateExportProgress(0, targets.length);

            try {
                const zip = new JSZip();
                const folder = zip.folder('EmlakStudyom_Gorsel_Havuzu');
                const qKey = this.exportQuality || 'web';

                // Aktif logo varsa döngüden önce tek seferde yükle (yüksek performans & sıfır gecikme)
                let preloadedLogoImg = null;
                if (this.hasActiveWatermark()) {
                    const logoUrl = this.getCurrentLogoUrl();
                    if (logoUrl && this.isValidLogoUrl(logoUrl)) {
                        try {
                            preloadedLogoImg = await this.loadImageAsync(logoUrl);
                        } catch(err) {
                            console.warn("Toplu ZIP öncesi logo yüklenemedi:", err);
                        }
                    }
                }

                for (let idx = 0; idx < targets.length; idx++) {
                    const it = targets[idx];
                    this.updateExportProgress(idx + 1, targets.length);

                    // Asenkron nefes payı (UI thread'e kontrol ver - sıfır donma)
                    await new Promise(r => setTimeout(r, 25));

                    const res = await this.getItemExportBlobAsync(it, qKey, preloadedLogoImg);
                    if (res && res.blob) {
                        const prefix = String(idx + 1).padStart(2, '0');
                        const cleanTitle = (it.title || 'gorsel').replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ_-]/g, '_');
                        const filename = `${prefix}_${cleanTitle}.${res.ext}`;
                        const arrayBuf = await res.blob.arrayBuffer();
                        folder.file(filename, arrayBuf);
                    }
                }

                // ZIP sıkıştırma adımı
                this.updateExportProgress(targets.length, targets.length, true);
                await new Promise(r => setTimeout(r, 25));

                const content = await zip.generateAsync({ 
                    type: 'blob',
                    compression: 'DEFLATE',
                    compressionOptions: { level: 6 }
                });

                const a = document.createElement('a');
                a.href = URL.createObjectURL(content);
                a.download = `EmlakStudyom_Gorseller_${Date.now()}.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                if (typeof window.showAppToast === 'function') {
                    window.showAppToast(`${targets.length} görsel ZIP olarak indirildi.`, 'success', 3500);
                }
            } catch(e) {
                console.error("ZIP indirme hatası:", e);
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('ZIP oluşturulurken hata oluştu: ' + e.message, 'error');
                }
            } finally {
                this.isExportingZip = false;
                this.updateExportProgress(0, 0);
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

        openWatermarkModal: function() {
            return this.toggleWatermarkTray();
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

        openFormatModal: function() {
            return this.toggleFormatTray();
        },

        /**
         * AI Netleştirme Ayar Panelini Açar / Kapatır
         */
        toggleAiTray: function() {
            this.aiTrayOpen = !this.aiTrayOpen;
            if (this.aiTrayOpen) {
                this.watermarkTrayOpen = false;
                this.formatTrayOpen = false;
                this.previewAiIntensityLive(Math.round((this.aiIntensity || 0.35) * 100));
            } else {
                window._photoFilterDirty = true;
                if (typeof window.applyPhotoFilters === 'function') {
                    window.applyPhotoFilters();
                } else if (typeof window.requestPhotoRepaint === 'function') {
                    window.requestPhotoRepaint();
                }
            }
            this.renderPanel();
            const dockCompareBtn = document.getElementById('dockStagingCompareBtn');
            if (dockCompareBtn) {
                dockCompareBtn.classList.toggle('active', this.isCompareOpen);
            }
        },

        setAiIntensity: function(val) {
            const num = Math.max(5, Math.min(100, parseInt(val) || 35));
            this.aiIntensity = num / 100;
            const badge = document.getElementById('stagingAiIntensityVal');
            if (badge) badge.textContent = `%${num}`;
        },

        /**
         * Slider Sürüklenirken Anlık Canlı GPU Önizlemesi Gösterir (Sıfır Donma / 60fps)
         */
        previewAiIntensityLive: function(val) {
            this.setAiIntensity(val);
            const num = Math.max(5, Math.min(100, parseInt(val) || 35));
            const intensity = num / 100;
            this.aiIntensity = intensity;

            // Aktif görseli bul, tuval boşsa tuvale aktar
            const targets = this.getSelectedItems();
            const activeItem = targets[0] || this.items.find(it => it.id === this.activeItemId) || this.items[0];
            if (activeItem && activeItem.dataUrl && !window.uploadedImgUrl) {
                this.applyToCanvas(activeItem.id, true);
            }
            if (activeItem) {
                activeItem.aiIntensity = intensity;
            }

            // 1. WebGL & Tuval Render Motorunu Tetikle (Anında 60 FPS GPU Render)
            window._photoFilterDirty = true;
            if (typeof window.applyPhotoFilters === 'function') {
                window.applyPhotoFilters();
            } else if (typeof window.requestPhotoRepaint === 'function') {
                window.requestPhotoRepaint();
            }

            // 2. Karşılaştırma ekranı açıksa "Sonrası" katmanını anında güncelle
            const afterImg = document.getElementById('canvasCompareAfterImg');
            const sliderAfterImg = document.getElementById('canvasCompareSliderAfterImg');
            if (this.isCompareOpen && (afterImg || sliderAfterImg)) {
                const k = intensity;
                const contrastPct = Math.round(100 + 16 * k);
                const satPct = Math.round(100 + 18 * k);
                const brightPct = Math.round(100 + 2 * k);
                const filterStr = `contrast(${contrastPct}%) saturate(${satPct}%) brightness(${brightPct}%) drop-shadow(0 0 0.5px rgba(0,0,0,${(k * 0.45).toFixed(2)}))`;
                if (afterImg) afterImg.style.filter = filterStr;
                if (sliderAfterImg) sliderAfterImg.style.filter = filterStr;
            }
        },

        /**
         * Slider Bırakıldığında Değeri Aktif Görsele Sabitler
         */
        commitAiIntensity: function(val) {
            this.previewAiIntensityLive(val);
        },

        /**
         * Verilen URL/String'in Gerçek Bir Görsel Kaynağı Olup Olmadığını Doğrular
         */
        isValidLogoUrl: function(url) {
            if (!url || typeof url !== 'string') return false;
            const str = url.trim();
            if (str.length < 5) return false;
            // HTML sayfası veya doküman url'si kesinlikle olamaz
            if (str.includes('.html') || (typeof window !== 'undefined' && str === window.location.href)) return false;
            if (str.startsWith('data:image/')) return true;
            if (str.startsWith('blob:')) return true;
            if (/\.(png|jpe?g|webp|svg|gif|ico|bmp)(\?.*)?$/i.test(str)) return true;
            if (str.startsWith('assets/') || str.startsWith('/assets/') || str.startsWith('./assets/')) return true;
            if (/^https?:\/\//i.test(str) && !str.endsWith('/') && !str.endsWith('#')) {
                return /\.(png|jpe?g|webp|svg|gif|ico)(\?.*)?$/i.test(str);
            }
            return false;
        },

        /**
         * Mevcut Firma Logosunu Güvenli Bir Şekilde Döndürür
         */
        getCurrentLogoUrl: function() {
            // 1. Kullanıcının bu sekmede yüklediği özel logo
            if (this.isValidLogoUrl(this.watermarkOptions.customLogoUrl)) {
                return this.watermarkOptions.customLogoUrl;
            }

            // 2. Global firma logosu
            if (this.isValidLogoUrl(window.companyLogo)) {
                return window.companyLogo;
            }

            // 3. Tuvaldeki logo katmanı (elLogo) - sadece geçerli bir resim src'si varsa ve görünür durumdaysa
            const logoEl = document.getElementById('elLogo');
            if (logoEl && logoEl.style.display !== 'none' && logoEl.style.visibility !== 'hidden') {
                const img = logoEl.querySelector('img');
                const rawAttr = img ? img.getAttribute('src') : logoEl.getAttribute('src');
                const fullSrc = (img && img.src) || logoEl.src;
                
                if (fullSrc && !this.isValidLogoUrl(fullSrc)) {
                    if (img) img.removeAttribute('src');
                    logoEl.removeAttribute('src');
                } else if (this.isValidLogoUrl(rawAttr)) {
                    return rawAttr;
                } else if (this.isValidLogoUrl(fullSrc)) {
                    return fullSrc;
                }
            }

            // 4. Marka yöneticisindeki önizleme (brandLogoPreview)
            const brandPreview = document.getElementById('brandLogoPreview');
            if (brandPreview && brandPreview.style.display !== 'none') {
                const rawAttr = brandPreview.getAttribute('src');
                const fullSrc = brandPreview.src;
                if (fullSrc && !this.isValidLogoUrl(fullSrc)) {
                    brandPreview.removeAttribute('src');
                } else if (this.isValidLogoUrl(rawAttr) && rawAttr !== 'assets/logo/logo.png') {
                    return rawAttr;
                } else if (this.isValidLogoUrl(fullSrc) && !fullSrc.includes('assets/logo/logo.png')) {
                    return fullSrc;
                }
            }

            // 5. LocalStorage'daki kayıtlı marka şablonu logosu
            try {
                const brands = JSON.parse(localStorage.getItem('canvaBrandTemplates') || '[]');
                if (brands.length > 0 && this.isValidLogoUrl(brands[0].logo) && !brands[0].logo.includes('assets/logo/logo.png')) {
                    return brands[0].logo;
                }
            } catch(e) {}

            return null;
        },

        /**
         * Varsayılan Emlak Stüdyom Logosunu Tuvale Ekler
         */
        addDefaultLogoToCanvas: function() {
            const defaultLogoUrl = 'assets/logo/logo.png';
            this.watermarkOptions.customLogoUrl = defaultLogoUrl;
            window.companyLogo = defaultLogoUrl;

            if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
                window.CanvasEmptyState.dismiss();
            }

            if (!this.watermarkOptions.position || this.watermarkOptions.position === 'custom') {
                this.watermarkOptions.position = 'bottom-right';
            }

            this.applyWatermarkToCanvas(true);

            const logoEl = document.getElementById('elLogo');
            if (logoEl) {
                if (typeof window.selectElement === 'function') {
                    window.selectElement(logoEl, false, true);
                }
                if (typeof window.renderLayers === 'function') {
                    window.renderLayers();
                }
            }

            if (typeof window.syncLogoUI === 'function') {
                window.syncLogoUI(defaultLogoUrl);
            }

            this.renderPanel();

            if (typeof window.showAppToast === 'function') {
                window.showAppToast('Emlak Stüdyom logosu tuvale eklendi.', 'success', 2200);
            }
        },

        /**
         * Tuvaldeki Logoyu Kaldırır ve Sıfırlar
         */
        removeLogoFromCanvas: function() {
            if (typeof window.clearLogoImage === 'function') {
                try { window.clearLogoImage(); } catch(e) {}
            }
            const logoEl = document.getElementById('elLogo');
            if (logoEl) {
                logoEl.src = '';
                logoEl.style.display = 'none';
                logoEl.style.visibility = 'hidden';
                const img = logoEl.querySelector('img') || logoEl.querySelector('#elLogoImg');
                if (img) {
                    img.src = '';
                    img.style.display = 'none';
                }
            }
            this.watermarkOptions.customLogoUrl = null;
            this.globalLogoPos = null;
            const activeItem = (this.items && this.items.length > 0) ? this.items.find(it => it.id === this.activeItemId) : null;
            if (activeItem) {
                activeItem.customLogoPos = null;
            }
            window.companyLogo = '';

            // Daha önce damgalanmış görsellerin ham hallerini geri yükle
            if (Array.isArray(this.items)) {
                this.items.forEach(it => {
                    if (it.watermarkBaked && it.rawOriginalDataUrl) {
                        it.dataUrl = it.rawOriginalDataUrl;
                        it.watermarkBaked = false;
                    }
                });
            }
            if (activeItem && activeItem.rawOriginalDataUrl) {
                this.applyToCanvas(activeItem.id, true);
            }

            if (typeof window.syncLogoUI === 'function') window.syncLogoUI('');
            this.renderPanel();
            if (typeof window.renderLayers === 'function') window.renderLayers();
            if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
            if (typeof window.showAppToast === 'function') {
                window.showAppToast('Logo kaldırıldı.', 'info', 2000);
            }
        },

        /**
         * Logo Seçim / Değiştirme Dosya Penceresini Açar
         */
        triggerWatermarkLogoInput: function() {
            if (typeof window.triggerLogoUpload === 'function') {
                window.triggerLogoUpload();
            } else {
                let input = document.getElementById('stagingWatermarkLogoInput') || document.getElementById('logoInput');
                if (input) {
                    input.value = '';
                    input.click();
                }
            }
        },

        /**
         * Firma Logosu Güvenlik ve Bütünlük Doğrulayıcısı (Security & Robustness Guard)
         * - Dosya türü ve tehlikeli uzantı kontrolü
         * - SVG XSS / script / foreignObject enjeksiyon taraması
         * - Boş / aşırı büyük dosya engeli (Maks 20MB, Min > 0B)
         * - Gerçek görsel çözme (decode) ve boyut testi (Decompression Bomb koruması)
         */
        validateLogoFileAsync: async function(file) {
            if (!file) {
                return { valid: false, error: 'Lütfen bir dosya seçin.' };
            }

            if (window.SecurityGuard && typeof window.SecurityGuard.validateImageFileAsync === 'function') {
                return await window.SecurityGuard.validateImageFileAsync(file, {
                    maxSize: 20 * 1024 * 1024,
                    maxDimension: 8192
                });
            }

            const fileName = (file.name || '').toLowerCase();
            const fileType = (file.type || '').toLowerCase();
            const fileSize = file.size || 0;

            // 1. Sıfır Bayt (Bozuk/Boş) Dosya Engeli
            if (fileSize === 0) {
                return { valid: false, error: 'Seçilen dosya boş (0 bayt) veya bozuk.' };
            }

            // 2. Maksimum Boyut Engeli (Logo için maksimum 20 MB)
            const maxLogoSize = 20 * 1024 * 1024;
            if (fileSize > maxLogoSize) {
                return { valid: false, error: 'Logo dosya boyutu çok büyük (maksimum 20 MB olabilir).' };
            }

            // 3. Tehlikeli Dosya Uzantıları Engeli (Blacklist)
            const dangerousExtensions = [
                '.exe', '.bat', '.cmd', '.sh', '.php', '.phtml', '.js', '.vbs', 
                '.ps1', '.py', '.pl', '.jar', '.apk', '.msi', '.dll', '.scr', 
                '.com', '.hta', '.html', '.htm', '.xhtml', '.shtml', '.asp', '.aspx',
                '.cgi', '.bin', '.wsf', '.reg'
            ];
            if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
                return { valid: false, error: 'Güvenlik Uyarısı: Seçilen dosya türü çalıştırılabilir veya zararlı kod içerebilir.' };
            }

            // 4. İzin Verilen Görsel Formatları (Whitelist)
            const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico', '.bmp'];
            const isImageMime = fileType.startsWith('image/');
            const hasAllowedExt = allowedExtensions.some(ext => fileName.endsWith(ext));

            if (!isImageMime && !hasAllowedExt) {
                return { valid: false, error: 'Lütfen geçerli bir görsel formatı (PNG, JPG, WebP veya SVG) seçin.' };
            }

            // 5. SVG Güvenlik Taraması (XSS, Script & ForeignObject Enjeksiyon Koruması)
            const isSvg = fileType === 'image/svg+xml' || fileName.endsWith('.svg');
            if (isSvg) {
                try {
                    const text = await file.text();
                    const lowerText = text.toLowerCase();

                    // Tehlikeli SVG etiket ve nitelikleri
                    const dangerousPatterns = [
                        '<script', 'javascript:', 'data:text/html', 'onload=',
                        'onerror=', 'onclick=', 'onmouseover=', '<foreignobject',
                        '<iframe', '<embed', '<object', '<!entity'
                    ];

                    const foundPattern = dangerousPatterns.find(pat => lowerText.includes(pat));
                    if (foundPattern) {
                        return { 
                            valid: false, 
                            error: `Güvenlik Uyarısı: Seçilen SVG dosyası potansiyel olarak zararlı kod (${foundPattern}) içeriyor ve engellendi.` 
                        };
                    }
                } catch(svgErr) {
                    return { valid: false, error: 'SVG dosyası okunamadı veya biçimi bozuk.' };
                }
            }

            // 6. Gerçek Görsel Çözümleme ve Boyut Güvenlik Testi (Decompression Bomb / Fake Image Koruması)
            if (!isSvg) {
                try {
                    const objectUrl = URL.createObjectURL(file);
                    try {
                        await new Promise((resolve, reject) => {
                            const testImg = new Image();
                            let timeout = setTimeout(() => {
                                testImg.onload = null;
                                testImg.onerror = null;
                                reject(new Error('Görsel çözümleme zaman aşımına uğradı.'));
                            }, 4000);

                            testImg.onload = () => {
                                clearTimeout(timeout);
                                const w = testImg.naturalWidth || testImg.width || 0;
                                const h = testImg.naturalHeight || testImg.height || 0;

                                if (w <= 0 || h <= 0) {
                                    return reject(new Error('Görsel boyutları geçersiz (0x0 piksel).'));
                                }

                                // Decompression Bomb koruması: Aşırı devasa görseller tarayıcı sekmesini çökertir (Maks: 8192 x 8192 veya 40 MP)
                                if (w > 8192 || h > 8192 || (w * h > 40000000)) {
                                    return reject(new Error(`Görsel boyutları çok büyük (${w}x${h} piksel). Maksimum 8192x8192 piksel desteklenmektedir.`));
                                }

                                resolve();
                            };

                            testImg.onerror = () => {
                                clearTimeout(timeout);
                                reject(new Error('Dosya içeriği geçerli bir resim olarak çözümlenemedi (bozuk dosya).'));
                            };

                            testImg.src = objectUrl;
                        });
                    } finally {
                        URL.revokeObjectURL(objectUrl);
                    }
                } catch(probeErr) {
                    return { valid: false, error: probeErr.message || 'Dosya geçerli bir görsel değil veya bozuk.' };
                }
            }

            return { valid: true };
        },

        /**
         * Kullanıcı Filigran İçin Özel Logo Yüklediğinde Karşılar
         */
        handleWatermarkLogoUpload: async function(event) {
            const file = event?.target?.files?.[0];
            if (!file) return;

            // Güvenlik ve Bütünlük Doğrulaması
            const check = await this.validateLogoFileAsync(file);
            if (!check.valid) {
                if (event.target) event.target.value = '';
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast(check.error, 'error', 4500);
                } else {
                    alert(check.error);
                }
                return;
            }

            if (typeof window.showAppLoading === 'function') {
                window.showAppLoading('Logo Yükleniyor...', 'Firma logosu yerleştiriliyor...');
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const newLogoUrl = e.target.result;
                this.watermarkOptions.customLogoUrl = newLogoUrl;
                window.companyLogo = newLogoUrl;

                if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
                    window.CanvasEmptyState.dismiss();
                }

                if (!this.watermarkOptions.position || this.watermarkOptions.position === 'custom') {
                    this.watermarkOptions.position = 'bottom-right';
                }

                this.applyWatermarkToCanvas(true);

                const logoEl = document.getElementById('elLogo');
                if (logoEl && typeof window.selectElement === 'function') {
                    window.selectElement(logoEl, false, true);
                }

                if (typeof window.syncLogoUI === 'function') {
                    window.syncLogoUI(newLogoUrl);
                }

                if (event.target) event.target.value = '';

                if (typeof window.hideAppLoading === 'function') window.hideAppLoading(60);
                if (typeof window.renderLayers === 'function') window.renderLayers();
                if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Logo başarıyla eklendi.', 'success', 2500);
                }

                this.renderPanel();
            };
            reader.onerror = () => {
                if (event.target) event.target.value = '';
                if (typeof window.hideAppLoading === 'function') window.hideAppLoading();
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Dosya okunurken bir hata oluştu.', 'error');
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
                this.triggerWatermarkLogoInput();
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

            let logoImg;
            try {
                logoImg = await this.loadImageAsync(logoUrl);
            } catch(err) {
                console.error("Filigran logo yüklenemedi:", err);
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Firma logosu yüklenemedi veya bozuk. Lütfen geçerli bir logo seçin.', 'error', 3500);
                }
                return;
            }
            const { position, scale, opacity } = this.watermarkOptions;

            const logoEl = document.getElementById('elLogo');
            const hasCanvasLogo = logoEl && logoEl.style.display !== 'none' && logoEl.style.visibility !== 'hidden';
            const cc = document.getElementById('canvas-container');
            const ccW = cc ? (parseInt(cc.style.width) || cc.offsetWidth || 1920) : 1920;
            const ccH = cc ? (parseInt(cc.style.height) || cc.offsetHeight || 1080) : 1080;

            // Varsayılan: Kullanıcının tuvalde serbestçe bıraktığı konum
            const isCustomPosition = (position === 'custom' || !position) && hasCanvasLogo;

            let customRelX = 0;
            let customRelY = 0;
            let customRelW = (scale || 20) / 100;

            if (isCustomPosition) {
                const curLeft = (logoEl.offsetLeft !== undefined && !isNaN(logoEl.offsetLeft)) ? logoEl.offsetLeft : (ccW - (ccW * customRelW) - 50);
                const curTop = (logoEl.offsetTop !== undefined && !isNaN(logoEl.offsetTop)) ? logoEl.offsetTop : (ccH - (ccW * customRelW * (logoImg.naturalHeight / logoImg.naturalWidth)) - 50);
                const curW = logoEl.offsetWidth || (ccW * customRelW);

                customRelX = Math.max(0, curLeft) / ccW;
                customRelY = Math.max(0, curTop) / ccH;
                customRelW = Math.max(0.02, curW / ccW);
            }

            const damgalaBtn = document.getElementById('stagingApplyWatermarkBtn');

            for (let i = 0; i < targets.length; i++) {
                const it = targets[i];
                if (damgalaBtn) {
                    damgalaBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> ${i + 1}/${targets.length} Damgalanıyor`;
                }
                // Asenkron nefes payı (UI thread'e kontrol ver - sıfır donma)
                await new Promise(r => setTimeout(r, 20));

                try {
                    if (!it.rawOriginalDataUrl) it.rawOriginalDataUrl = it.dataUrl;
                    const baseImg = await this.loadImageAsync(it.rawOriginalDataUrl || it.dataUrl);
                    const canvas = document.createElement('canvas');
                    canvas.width = baseImg.naturalWidth || 1920;
                    canvas.height = baseImg.naturalHeight || 1080;
                    const ctx = canvas.getContext('2d');
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';

                    // 1. Orijinal fotoğrafı çiz
                    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

                    // 2. Logoyu çiz (renderLogoToCanvasContext ile tutarlı ve çıpa korumalı)
                    this.renderLogoToCanvasContext(ctx, canvas, it, logoImg);

                    const qKey = this.exportQuality || 'web';
                    if (qKey === 'lossless' || qKey === 'png') {
                        it.dataUrl = canvas.toDataURL('image/png');
                    } else {
                        const qVal = qKey === 'ultra' ? 0.98 : (qKey === 'high' ? 0.96 : 0.92);
                        it.dataUrl = canvas.toDataURL('image/jpeg', qVal);
                    }
                    it.watermarkBaked = true;

                    // Anında bellek tahliyesi (RAM koruması)
                    canvas.width = 0;
                    canvas.height = 0;

                    if (it.id === this.activeItemId) {
                        this.applyToCanvas(it.id, true);
                    }
                } catch(err) {
                    console.warn("Filigran uygulama hatası:", err);
                }
            }

            if (damgalaBtn) {
                damgalaBtn.innerHTML = '<i class="fa-solid fa-stamp"></i> Seçilenlere Damgala';
            }

            this.renderPanel();
            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`${targets.length} görsele filigran uygulandı.`, 'success', 3500);
            }
        },

        /**
         * Logoyu Mevcut Tuvale Katman Olarak Ekler veya Günceller
         */
        addLogoToCanvas: function() {
            let logoUrl = this.getCurrentLogoUrl();
            if (!logoUrl || !this.isValidLogoUrl(logoUrl)) {
                logoUrl = 'assets/logo/logo.png';
                this.watermarkOptions.customLogoUrl = logoUrl;
                window.companyLogo = logoUrl;
            }

            if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
                window.CanvasEmptyState.dismiss();
            }

            if (!this.watermarkOptions.position || this.watermarkOptions.position === 'custom') {
                this.watermarkOptions.position = 'bottom-right';
            }

            this.applyWatermarkToCanvas(true);

            const logoEl = document.getElementById('elLogo');
            if (logoEl) {
                if (typeof window.selectElement === 'function') {
                    window.selectElement(logoEl, false, true);
                }
                if (typeof window.renderLayers === 'function') {
                    window.renderLayers();
                }
            }

            if (typeof window.syncLogoUI === 'function') {
                window.syncLogoUI(logoUrl);
            }

            this.renderPanel();

            if (typeof window.showAppToast === 'function') {
                window.showAppToast('Logo tuvale eklendi.', 'success', 2200);
            }
        },

        /**
          * Logoyu Sağ Alt Köşeye Hizalar (Kullanıcı Butona Bastığında)
          */
        alignLogoBottomRight: function() {
            this.watermarkOptions.position = 'bottom-right';
            const posSel = document.getElementById('watermarkPosSelect');
            if (posSel) posSel.value = 'bottom-right';
            const logoEl = document.getElementById('elLogo');
            const logoUrl = this.getCurrentLogoUrl();
            if (logoUrl) {
                this.applyWatermarkToCanvas(true);
                if (logoEl && typeof window.selectElement === 'function') {
                    window.selectElement(logoEl);
                }
                if (typeof this.syncCurrentLogoPosition === 'function') {
                    this.syncCurrentLogoPosition();
                }
            }
        },

        /**
          * Filigran Boyut Slider Değişimi
          */
        setWatermarkScale: function(val) {
            const scale = parseInt(val, 10);
            if (isNaN(scale)) return;
            this.watermarkOptions.scale = scale;
            const valEl = document.getElementById('wmScaleVal');
            if (valEl) valEl.textContent = scale + '%';
            
            const logoEl = document.getElementById('elLogo');
            if (logoEl && logoEl.style.display !== 'none' && logoEl.style.visibility !== 'hidden') {
                this.applyWatermarkToCanvas(false);
                if (typeof this.syncCurrentLogoPosition === 'function') {
                    this.syncCurrentLogoPosition();
                }
            }
        },

        /**
          * Filigran Opaklık Slider Değişimi
          */
        setWatermarkOpacity: function(val) {
            const opacity = parseInt(val, 10);
            if (isNaN(opacity)) return;
            this.watermarkOptions.opacity = opacity;
            const valEl = document.getElementById('wmOpacityVal');
            if (valEl) valEl.textContent = opacity + '%';
            
            const logoEl = document.getElementById('elLogo');
            if (logoEl && logoEl.style.display !== 'none' && logoEl.style.visibility !== 'hidden') {
                this.applyWatermarkToCanvas(false);
                if (typeof this.syncCurrentLogoPosition === 'function') {
                    this.syncCurrentLogoPosition();
                }
            }
        },

        /**
          * Filigran Konum Dropdown Değişimi
          */
        setWatermarkPosition: function(val) {
            this.watermarkOptions.position = val;
            const posSel = document.getElementById('watermarkPosSelect');
            if (posSel && posSel.value !== val) {
                posSel.value = val;
            }
            
            const logoEl = document.getElementById('elLogo');
            if (logoEl && logoEl.style.display !== 'none' && logoEl.style.visibility !== 'hidden') {
                if (val !== 'custom') {
                    this.applyWatermarkToCanvas(true);
                }
                if (typeof this.syncCurrentLogoPosition === 'function') {
                    this.syncCurrentLogoPosition();
                }
            }
        },

        /**
         * Tuvaldeki Logonun Koordinatlarını ve Oransal Çıpa Değerlerini Yakalar
         */
        captureLogoCoords: function(logoEl, canvasContainer) {
            if (!logoEl || !canvasContainer) return null;
            // 🛡️ Görünmeyen veya 0 genişlikli elemandan koordinat yakalama (hatalı 0,0 kaydını önle)
            const isVisible = (
                logoEl.style.display !== 'none' &&
                logoEl.style.visibility !== 'hidden' &&
                parseFloat(logoEl.style.opacity || '1') > 0 &&
                logoEl.offsetWidth > 0 &&
                logoEl.offsetHeight > 0
            );
            if (!isVisible) return null;

            const cW = parseInt(canvasContainer.style.width) || canvasContainer.offsetWidth || 1920;
            const cH = parseInt(canvasContainer.style.height) || canvasContainer.offsetHeight || 1080;
            if (cW <= 0 || cH <= 0) return null;

            const scale = (typeof this.watermarkOptions.scale === 'number') ? this.watermarkOptions.scale : 20;
            const curW = logoEl.offsetWidth || Math.max(40, Math.round(cW * (scale / 100)));
            const curH = logoEl.offsetHeight || Math.round(curW * 0.4);
            const leftPx = (logoEl.offsetLeft !== undefined && !isNaN(logoEl.offsetLeft)) ? logoEl.offsetLeft : 0;
            const topPx = (logoEl.offsetTop !== undefined && !isNaN(logoEl.offsetTop)) ? logoEl.offsetTop : 0;

            const relX = leftPx / cW;
            const relY = topPx / cH;
            const relW = curW / cW;
            const calculatedScale = Math.max(5, Math.min(50, Math.round(relW * 100)));

            const marginRightRatio = Math.max(0, (cW - (leftPx + curW)) / cW);
            const marginBottomRatio = Math.max(0, (cH - (topPx + curH)) / cH);
            const marginLeftRatio = Math.max(0, leftPx / cW);
            const marginTopRatio = Math.max(0, topPx / cH);

            const anchorX = relX > 0.5 ? 'right' : 'left';
            const anchorY = relY > 0.5 ? 'bottom' : 'top';

            return {
                position: this.watermarkOptions.position || 'custom',
                scale: calculatedScale,
                opacity: (typeof this.watermarkOptions.opacity === 'number') ? this.watermarkOptions.opacity : 100,
                leftPx,
                topPx,
                relX,
                relY,
                relW,
                anchorX,
                anchorY,
                marginRightRatio,
                marginBottomRatio,
                marginLeftRatio,
                marginTopRatio,
                origCanvasW: cW,
                origCanvasH: cH
            };
        },

        /**
         * Standart Sağ Alt Logo Koordinatlarını Üretir
         */
        getDefaultLogoCoords: function(cW, cH) {
            const scale = (typeof this.watermarkOptions.scale === 'number') ? this.watermarkOptions.scale : 20;
            const curW = Math.max(40, Math.round(cW * (scale / 100)));
            const curH = Math.round(curW * 0.4);
            const mR = Math.round(cW * 0.035);
            const mB = Math.round(cH * 0.035);
            const leftPx = Math.max(0, cW - curW - mR);
            const topPx = Math.max(0, cH - curH - mB);
            return {
                position: 'bottom-right',
                scale: scale,
                opacity: (typeof this.watermarkOptions.opacity === 'number') ? this.watermarkOptions.opacity : 100,
                leftPx,
                topPx,
                relX: leftPx / cW,
                relY: topPx / cH,
                relW: curW / cW,
                anchorX: 'right',
                anchorY: 'bottom',
                marginRightRatio: mR / cW,
                marginBottomRatio: mB / cH,
                marginLeftRatio: leftPx / cW,
                marginTopRatio: topPx / cH,
                origCanvasW: cW,
                origCanvasH: cH
            };
        },

        /**
         * Verilen Logo Koordinat Objelerini Tuvaldeki Logoya Uygular
         */
        applyLogoCoordsToCanvas: function(logoPos) {
            const logoEl = document.getElementById('elLogo');
            const canvasContainer = document.getElementById('canvas-container');
            if (!logoEl || !canvasContainer) return;

            const cW = parseInt(canvasContainer.style.width) || canvasContainer.offsetWidth || 1920;
            const cH = parseInt(canvasContainer.style.height) || canvasContainer.offsetHeight || 1080;
            if (cW <= 0 || cH <= 0) return;

            if (!logoPos || (logoPos.leftPx === 0 && logoPos.topPx === 0 && !logoPos.userMoved && logoPos.anchorX !== 'left')) {
                logoPos = this.getDefaultLogoCoords(cW, cH);
            }

            // Görünürlük ve katman garantisi
            logoEl.style.display = 'block';
            logoEl.style.visibility = 'visible';
            logoEl.style.zIndex = '99999';
            if (canvasContainer.lastElementChild !== logoEl) {
                canvasContainer.appendChild(logoEl);
            }

            const img = logoEl.querySelector('img') || logoEl.querySelector('#elLogoImg');
            if (img) {
                img.style.display = 'block';
                img.style.visibility = 'visible';
            }

            // 1. Standart köşe konumu ise doğrudan köşe motorunu çalıştır
            if (logoPos.position && logoPos.position !== 'custom') {
                this.watermarkOptions.position = logoPos.position;
                if (typeof logoPos.scale === 'number') this.watermarkOptions.scale = logoPos.scale;
                if (typeof logoPos.opacity === 'number') this.watermarkOptions.opacity = logoPos.opacity;
                this.applyWatermarkToCanvas(true);
                return;
            }

            // 2. Boyut
            const scale = (typeof logoPos.scale === 'number') ? logoPos.scale : (this.watermarkOptions.scale || 20);
            this.watermarkOptions.scale = scale;
            const logoW = Math.max(40, Math.round(cW * (scale / 100)));
            logoEl.style.width = logoW + 'px';
            logoEl.style.height = 'auto';

            // 3. Opaklık
            if (typeof logoPos.opacity === 'number') {
                this.watermarkOptions.opacity = logoPos.opacity;
                logoEl.style.opacity = Math.max(0.1, Math.min(1, logoPos.opacity / 100)).toString();
            }

            // 4. Çıpa ve kenar payı korumalı koordinat hesabı
            const logoH = logoEl.offsetHeight || Math.round(logoW * 0.4);
            let newL, newT;

            if (logoPos.anchorX === 'right') {
                const mR = Math.round(cW * (logoPos.marginRightRatio !== undefined ? logoPos.marginRightRatio : Math.max(0, 1 - (logoPos.relX || 0) - (logoPos.relW || (scale/100)))));
                newL = cW - logoW - Math.max(0, mR);
            } else {
                const mL = Math.round(cW * (logoPos.marginLeftRatio !== undefined ? logoPos.marginLeftRatio : (logoPos.relX || 0)));
                newL = Math.max(0, mL);
            }

            if (logoPos.anchorY === 'bottom') {
                const mB = Math.round(cH * (logoPos.marginBottomRatio !== undefined ? logoPos.marginBottomRatio : Math.max(0, 1 - (logoPos.relY || 0))));
                newT = cH - logoH - Math.max(0, mB);
            } else {
                const mT = Math.round(cH * (logoPos.marginTopRatio !== undefined ? logoPos.marginTopRatio : (logoPos.relY || 0)));
                newT = Math.max(0, mT);
            }

            const maxL = Math.max(0, cW - logoW);
            const maxT = Math.max(0, cH - logoH);
            newL = Math.max(0, Math.min(maxL, newL));
            newT = Math.max(0, Math.min(maxT, newT));

            logoEl.style.left = newL + 'px';
            logoEl.style.top = newT + 'px';
            logoEl.style.right = 'auto';
            logoEl.style.bottom = 'auto';
            logoEl.style.transform = 'none';

            this.syncWatermarkUiControls();
        },

        /**
         * Belirli Bir Görsel İçin O Anki Tuval Logo Konumunu Kaydeder
         */
        captureCanvasLogoForImage: function(targetItem) {
            const logoEl = document.getElementById('elLogo');
            const canvasContainer = document.getElementById('canvas-container');
            if (!logoEl || !canvasContainer) return;
            const isVisible = (logoEl.style.display !== 'none' && logoEl.style.visibility !== 'hidden' && logoEl.style.opacity !== '0');
            if (!isVisible) return;

            const coords = this.captureLogoCoords(logoEl, canvasContainer);
            if (!coords) return;

            if (targetItem && targetItem.excludeLogo) {
                targetItem.customLogoPos = coords;
            } else if (this.watermarkOptions.applyToAll !== false) {
                this.globalLogoPos = coords;
            }
        },

        /**
         * Aktif Görselin Logo Konumunu Senkronize Eder
         */
        syncCurrentLogoPosition: function() {
            const activeItem = this.items ? this.items.find(it => it.id === this.activeItemId) : null;
            this.captureCanvasLogoForImage(activeItem);
        },

        /**
         * Logo Tuvalde Taşındığında veya Boyutlandırıldığında Çağrılır
         */
        onCanvasLogoMoved: function(targetLogo) {
            if (!targetLogo) return;
            const canvasContainer = document.getElementById('canvas-container') || targetLogo.parentElement;
            if (!canvasContainer) return;

            this.watermarkOptions.position = 'custom';
            const posSel = document.getElementById('watermarkPosSelect');
            if (posSel) posSel.value = 'custom';

            const coords = this.captureLogoCoords(targetLogo, canvasContainer);
            if (!coords) return;

            this.watermarkOptions.scale = coords.scale;
            const scaleSlider = document.getElementById('wmScaleSlider');
            const scaleVal = document.getElementById('wmScaleVal');
            if (scaleSlider) scaleSlider.value = coords.scale;
            if (scaleVal) scaleVal.textContent = coords.scale + '%';

            const activeItem = this.items ? this.items.find(it => it.id === this.activeItemId) : null;
            if (activeItem && activeItem.excludeLogo) {
                activeItem.customLogoPos = coords;
            } else if (this.watermarkOptions.applyToAll !== false) {
                this.globalLogoPos = coords;
            }
        },

        /**
         * "Konumu Tümüne Uygula" Seçeneği Değiştiğinde
         */
        setWatermarkApplyToAll: function(checked) {
            this.watermarkOptions.applyToAll = !!checked;
            if (checked) {
                const logoEl = document.getElementById('elLogo');
                const canvasContainer = document.getElementById('canvas-container');
                if (logoEl && canvasContainer) {
                    this.globalLogoPos = this.captureLogoCoords(logoEl, canvasContainer);
                }
            }
        },

        /**
         * Aktif Görseli Global Logo Konumundan Hariç Tut / Dahil Et
         */
        toggleExcludeActiveItem: function(checked) {
            const activeItem = this.items ? this.items.find(it => it.id === this.activeItemId) : null;
            if (!activeItem) return;

            activeItem.excludeLogo = !!checked;

            const logoEl = document.getElementById('elLogo');
            const canvasContainer = document.getElementById('canvas-container');

            if (checked) {
                const currentCoords = (logoEl && canvasContainer)
                    ? this.captureLogoCoords(logoEl, canvasContainer)
                    : (this.globalLogoPos ? Object.assign({}, this.globalLogoPos) : null);
                activeItem.customLogoPos = currentCoords;
            } else {
                if (this.globalLogoPos) {
                    this.applyLogoCoordsToCanvas(this.globalLogoPos);
                }
            }

            this.renderPanel();
        },

        /**
         * Paneldeki Kontrolleri Aktif Görselin ve Logonun Durumuna Göre Senkronize Eder
         */
        syncWatermarkUiControls: function() {
            const activeItem = this.items ? this.items.find(it => it.id === this.activeItemId) : null;
            const isExcluded = !!(activeItem && activeItem.excludeLogo);
            const posObj = (isExcluded && activeItem.customLogoPos) ? activeItem.customLogoPos : (this.globalLogoPos || this.watermarkOptions);

            const posSel = document.getElementById('watermarkPosSelect');
            if (posSel && posObj && posObj.position) posSel.value = posObj.position;

            const scaleSlider = document.getElementById('wmScaleSlider');
            const scaleVal = document.getElementById('wmScaleVal');
            if (scaleSlider && posObj && typeof posObj.scale === 'number') {
                scaleSlider.value = posObj.scale;
                if (scaleVal) scaleVal.textContent = posObj.scale + '%';
            }

            const opacitySlider = document.getElementById('wmOpacitySlider');
            const opacityVal = document.getElementById('wmOpacityVal');
            if (opacitySlider && posObj && typeof posObj.opacity === 'number') {
                opacitySlider.value = posObj.opacity;
                if (opacityVal) opacityVal.textContent = posObj.opacity + '%';
            }

            const applyAllCheck = document.getElementById('stagingWmApplyAllCheck');
            if (applyAllCheck) applyAllCheck.checked = (this.watermarkOptions.applyToAll !== false);

            const excludeCheck = document.getElementById('stagingWmExcludeCheck');
            if (excludeCheck) excludeCheck.checked = isExcluded;
        },

        /**
         * Tuval Üzerindeki Logo Katmanını (elLogo) Günceller
         */
        applyWatermarkToCanvas: function(updatePosition = false) {
            const logoEl = document.getElementById('elLogo');
            if (!logoEl) return;

            let logoUrl = this.getCurrentLogoUrl();
            if (!logoUrl || !this.isValidLogoUrl(logoUrl)) {
                logoUrl = 'assets/logo/logo.png';
                this.watermarkOptions.customLogoUrl = logoUrl;
                window.companyLogo = logoUrl;
            }

            logoEl.src = logoUrl;
            const img = logoEl.querySelector('img') || logoEl.querySelector('#elLogoImg');
            if (img) {
                img.src = logoUrl;
                img.style.display = 'block';
                img.style.visibility = 'visible';
                img.style.width = '100%';
                img.style.height = 'auto';
                img.style.objectFit = 'contain';
            }

            logoEl.style.display = 'block';
            logoEl.style.visibility = 'visible';
            logoEl.style.zIndex = '99999';
            logoEl.style.maxWidth = 'none';

            const canvasContainer = document.getElementById('canvas-container');
            if (canvasContainer && canvasContainer.lastElementChild !== logoEl) {
                canvasContainer.appendChild(logoEl);
            }

            // 1. Opaklık (0.1 - 1.0)
            const opacity = (typeof this.watermarkOptions.opacity === 'number') ? this.watermarkOptions.opacity : 100;
            const alpha = Math.max(0.1, Math.min(1, opacity / 100));
            logoEl.style.opacity = alpha.toString();

            // 2. Boyutlandırma (Tuval genişliğine göre oransal piksel)
            const scale = (typeof this.watermarkOptions.scale === 'number') ? this.watermarkOptions.scale : 20;
            const cW = canvasContainer ? (parseInt(canvasContainer.style.width) || canvasContainer.offsetWidth || 1920) : 1920;
            const logoW = Math.max(40, Math.round(cW * (scale / 100)));
            logoEl.style.width = logoW + 'px';
            logoEl.style.height = 'auto';

            // 3. Konumlandırma
            const pos = this.watermarkOptions.position || 'bottom-right';
            if (updatePosition || pos !== 'custom') {
                const margin = Math.round(cW * 0.035);

                logoEl.style.left = '';
                logoEl.style.right = '';
                logoEl.style.top = '';
                logoEl.style.bottom = '';
                logoEl.style.transform = 'none';

                if (pos === 'bottom-right' || (!pos || pos === 'custom')) {
                    logoEl.style.right = margin + 'px';
                    logoEl.style.bottom = margin + 'px';
                } else if (pos === 'bottom-left') {
                    logoEl.style.left = margin + 'px';
                    logoEl.style.bottom = margin + 'px';
                } else if (pos === 'top-right') {
                    logoEl.style.right = margin + 'px';
                    logoEl.style.top = margin + 'px';
                } else if (pos === 'top-left') {
                    logoEl.style.left = margin + 'px';
                    logoEl.style.top = margin + 'px';
                } else if (pos === 'center') {
                    logoEl.style.left = '50%';
                    logoEl.style.top = '50%';
                    logoEl.style.transform = 'translate(-50%, -50%)';
                }
            }

            if (typeof this.syncCurrentLogoPosition === 'function') {
                this.syncCurrentLogoPosition();
            }

            if (typeof window.requestAutoSave === 'function') {
                window.requestAutoSave();
            }
        },

        /**
         * Seçili Görselleri İstenen Format & En-Boy Oranına Dönüştürür (Ham Orijinalden & Asenkron)
         */
        applyFormatSelected: async function() {
            const targets = this.getSelectedItems();
            if (targets.length === 0) {
                if (typeof window.showAppToast === 'function') window.showAppToast('Lütfen boyutlandırılacak görselleri seçin.', 'warning');
                return;
            }

            const { ratio, mode } = this.formatOptions;

            // Eğer "original" seçildiyse doğrudan sıfırla
            if (ratio === 'original') {
                return this.resetFormatSelected();
            }

            const qKey = this.formatQuality || '2k';

            for (let i = 0; i < targets.length; i++) {
                const it = targets[i];
                // Asenkron nefes payı (UI donmasını önler)
                await new Promise(r => setTimeout(r, 35));

                // DAİMA İLK HAM ORİJİNAL KAYNAĞI KULLAN (Asla önceden kırpılmış/bulanıklaşmış tuvali ezme!)
                const rawUrl = it.rawOriginalDataUrl || it.originalDataUrl || (it.id === this.activeItemId ? (window._aiOriginalImgDataUrl || window.uploadedImgUrl || window.masterImageBase64) : null) || it.dataUrl;

                if (!it.rawOriginalDataUrl && rawUrl) {
                    it.rawOriginalDataUrl = rawUrl;
                }
                if (!it.rawOriginalThumbUrl) {
                    it.rawOriginalThumbUrl = it.thumbUrl || rawUrl;
                }

                try {
                    const img = await this.loadImageAsync(rawUrl);
                    const srcW = img.naturalWidth || 1920;
                    const srcH = img.naturalHeight || 1080;

                    const specs = this.getFormatTargetSpecs(ratio, qKey, srcW, srcH);
                    const canvas = this.renderFormattedCanvas(img, specs.targetW, specs.targetH, mode);

                    it.dataUrl = canvas.toDataURL(specs.mime, specs.quality);
                    it.formatRatio = ratio;

                    // Thumbnail'i de yeni formata göre güncelle
                    try {
                        const thumbW = Math.min(480, specs.targetW);
                        const thumbH = Math.max(1, Math.round(thumbW * (specs.targetH / specs.targetW)));
                        const thumbCanvas = document.createElement('canvas');
                        thumbCanvas.width = thumbW;
                        thumbCanvas.height = thumbH;
                        const tctx = thumbCanvas.getContext('2d');
                        tctx.imageSmoothingEnabled = true;
                        tctx.imageSmoothingQuality = 'medium';
                        tctx.drawImage(canvas, 0, 0, thumbW, thumbH);
                        it.thumbUrl = thumbCanvas.toDataURL('image/jpeg', 0.72);
                        thumbCanvas.width = 0;
                        thumbCanvas.height = 0;
                    } catch(eThumb){}

                    // Bellek tahliyesi
                    canvas.width = 0;
                    canvas.height = 0;

                    if (it.id === this.activeItemId) {
                        this.applyToCanvas(it.id, true);
                    }
                } catch(err) {
                    console.warn("Format dönüştürme hatası:", err);
                }
            }

            this.renderPanel();
            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`${targets.length} görsel ${ratio} formatına (${qKey.toUpperCase()}) uyarlandı.`, 'success', 3500);
            }
        },

        /**
         * Seçili Görselleri İlk Orijinal Ham Boyutuna ve Kadrajına Döndürür
         */
        resetFormatSelected: function() {
            const targets = this.getSelectedItems();
            if (targets.length === 0) {
                if (typeof window.showAppToast === 'function') window.showAppToast('Lütfen sıfırlanacak görselleri seçin.', 'warning');
                return;
            }

            let restoredCount = 0;
            targets.forEach(it => {
                const raw = it.rawOriginalDataUrl || it.originalDataUrl || (it.id === this.activeItemId ? (window._aiOriginalImgDataUrl || window.uploadedImgUrl || window.masterImageBase64) : null);
                if (raw) {
                    it.dataUrl = raw;
                    if (it.rawOriginalThumbUrl) it.thumbUrl = it.rawOriginalThumbUrl;
                    it.formatRatio = 'original';
                    restoredCount++;
                }
                if (it.id === this.activeItemId) {
                    this.applyToCanvas(it.id, true);
                }
            });

            this.renderPanel();
            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`${restoredCount} görsel orijinal haline döndürüldü.`, 'success', 3000);
            }
        },

        /**
         * Görseli İstenen Çözünürlük ve Kırpma/Bulanıklık Modunda Canvas Olarak Üretir
         */
        renderFormattedCanvas: function(img, targetW, targetH, mode = 'contain_blur') {
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
                const scaleCover = Math.max(targetW / srcW, targetH / srcH);
                const covW = srcW * scaleCover;
                const covH = srcH * scaleCover;
                const covX = (targetW - covW) / 2;
                const covY = (targetH - covH) / 2;
                ctx.drawImage(img, covX - 20, covY - 20, covW + 40, covH + 40);
                ctx.restore();

                // 2. Orijinal görseli sığdır (contain)
                const scaleFit = Math.min(targetW / srcW, targetH / srcH);
                const fitW = Math.round(srcW * scaleFit);
                const fitH = Math.round(srcH * scaleFit);
                const fitX = Math.round((targetW - fitW) / 2);
                const fitY = Math.round((targetH - fitH) / 2);

                ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
                ctx.shadowBlur = 24;
                ctx.drawImage(img, fitX, fitY, fitW, fitH);
                ctx.shadowBlur = 0;
            } else {
                // Cover mod
                const scaleCover = Math.max(targetW / srcW, targetH / srcH);
                const covW = srcW * scaleCover;
                const covH = srcH * scaleCover;
                const covX = (targetW - covW) / 2;
                const covY = (targetH - covH) / 2;
                ctx.drawImage(img, covX, covY, covW, covH);
            }
            return canvas;
        },

        /**
         * Seçili Görselleri Instagram (1:1), Sahibinden/Web (16:9) ve Story (9:16) Formatlarında Arka Planda Tek ZIP Olarak Paketler
         */
        downloadMultiPlatformZip: async function() {
            if (this.isExportingPlatforms) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Paketleme işlemi zaten arka planda devam ediyor.', 'info');
                }
                return;
            }

            const targets = this.getSelectedItems();
            if (targets.length === 0) {
                if (typeof window.showAppToast === 'function') window.showAppToast('Lütfen paketlenecek görselleri seçin.', 'warning');
                return;
            }

            if (typeof window.JSZip === 'undefined') {
                if (window.LazyLoader && typeof window.LazyLoader.load === 'function') {
                    try { await window.LazyLoader.load('zip'); } catch(e){}
                }
                if (typeof window.JSZip === 'undefined') {
                    await new Promise((resolve, reject) => {
                        const s = document.createElement('script');
                        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
                        s.onload = resolve;
                        s.onerror = reject;
                        document.head.appendChild(s);
                    }).catch(e => console.warn('JSZip CDN fallback error:', e));
                }
            }

            if (typeof window.JSZip === 'undefined') {
                if (typeof window.showAppToast === 'function') window.showAppToast('Arşivleme motoru (JSZip) yüklenemedi.', 'error');
                return;
            }

            this.isExportingPlatforms = true;

            const btn = document.getElementById('stagingMultiPlatformZipBtn');
            const origHtml = btn ? btn.innerHTML : '';
            const updateBtnProgress = (current, total) => {
                const b = document.getElementById('stagingMultiPlatformZipBtn');
                if (b) {
                    b.disabled = true;
                    b.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Paket Hazırlanıyor: ${current} / ${total}`;
                }
            };

            updateBtnProgress(0, targets.length);

            if (typeof window.showAppToast === 'function') {
                window.showAppToast('Paketleme arka planda başladı. İşlemlerinize kesintisiz devam edebilirsiniz.', 'info', 3500);
            }

            try {
                const zip = new window.JSZip();
                const folderInsta = zip.folder('01_Instagram_1x1');
                const folderSahibinden = zip.folder('02_Sahibinden_16x9');
                const folderStory = zip.folder('03_Story_9x16');

                const mode = this.formatOptions?.mode || 'contain_blur';
                const qKey = this.formatQuality || '2k';

                // Platform hedefleri
                const platforms = [
                    { ratio: '1:1', folder: folderInsta, suffix: '_1x1_Instagram' },
                    { ratio: '16:9', folder: folderSahibinden, suffix: '_16x9_Sahibinden' },
                    { ratio: '9:16', folder: folderStory, suffix: '_9x16_Story' }
                ];

                // Aktif logo varsa döngüden önce tek seferde yükle (yüksek performans)
                let preloadedLogoImg = null;
                if (this.hasActiveWatermark()) {
                    const logoUrl = this.getCurrentLogoUrl();
                    if (logoUrl && this.isValidLogoUrl(logoUrl)) {
                        try {
                            preloadedLogoImg = await this.loadImageAsync(logoUrl);
                        } catch(err) {
                            console.warn("Çoklu platform ZIP öncesi logo yüklenemedi:", err);
                        }
                    }
                }

                for (let i = 0; i < targets.length; i++) {
                    const it = targets[i];
                    updateBtnProgress(i + 1, targets.length);

                    // Ana işlem döngüsüne nefes payı (UI thread'e kontrol ver - sıfır donma & GC)
                    await new Promise(r => setTimeout(r, 45));

                    const rawUrl = it.rawOriginalDataUrl || it.originalDataUrl || (it.id === this.activeItemId ? (window._aiOriginalImgDataUrl || window.uploadedImgUrl || window.masterImageBase64) : null) || it.dataUrl;
                    const img = await this.loadImageAsync(rawUrl);
                    const cleanTitle = (it.title || `Gorsel_${i + 1}`).replace(/[^\w\d_-]/gi, '_');
                    const srcW = img.naturalWidth || 1920;
                    const srcH = img.naturalHeight || 1080;

                    for (const p of platforms) {
                        const specs = this.getFormatTargetSpecs(p.ratio, qKey, srcW, srcH);
                        const cvs = this.renderFormattedCanvas(img, specs.targetW, specs.targetH, mode);

                        if (preloadedLogoImg && !it.watermarkBaked) {
                            this.renderLogoToCanvasContext(cvs.getContext('2d'), cvs, it, preloadedLogoImg);
                        }

                        // Blob olarak al (RAM tüketimini 3 kat azaltır, çökmeyi önler)
                        const blob = await new Promise(res => {
                            if (cvs.toBlob) {
                                cvs.toBlob(res, specs.mime, specs.quality);
                            } else {
                                const dUrl = cvs.toDataURL(specs.mime, specs.quality);
                                const arr = dUrl.split(',');
                                const bstr = atob(arr[1]);
                                let n = bstr.length;
                                const u8arr = new Uint8Array(n);
                                while(n--) u8arr[n] = bstr.charCodeAt(n);
                                res(new Blob([u8arr], { type: specs.mime }));
                            }
                        });

                        // Tuval belleğini anında tahliye et (GPU buffer dispose)
                        cvs.width = 0;
                        cvs.height = 0;

                        const ext = (specs.mime === 'image/png') ? 'png' : 'jpg';
                        p.folder.file(`${String(i + 1).padStart(2, '0')}_${cleanTitle}${p.suffix}.${ext}`, blob);

                        // Platform arası mikro nefes
                        await new Promise(r => setTimeout(r, 20));
                    }
                }

                const b = document.getElementById('stagingMultiPlatformZipBtn');
                if (b) b.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Arşiv Sıkıştırılıyor...';

                const zipBlob = await zip.generateAsync({
                    type: 'blob',
                    compression: 'DEFLATE',
                    compressionOptions: { level: 6 }
                });

                const dlLink = document.createElement('a');
                dlLink.href = URL.createObjectURL(zipBlob);
                dlLink.download = `Emlak_Coklu_Platform_${qKey.toUpperCase()}_${Date.now()}.zip`;
                document.body.appendChild(dlLink);
                dlLink.click();
                setTimeout(() => {
                    URL.revokeObjectURL(dlLink.href);
                    dlLink.remove();
                }, 1000);

                if (typeof window.showAppToast === 'function') {
                    window.showAppToast(`${targets.length} görsel (${qKey.toUpperCase()}) tüm platformlar için paketlendi ve indirildi.`, 'success', 4000);
                }
            } catch(err) {
                console.error('MultiPlatform Zip Hatası:', err);
                if (typeof window.showAppToast === 'function') window.showAppToast('Paketleme sırasında bir hata oluştu.', 'error');
            } finally {
                this.isExportingPlatforms = false;
                const b = document.getElementById('stagingMultiPlatformZipBtn');
                if (b) {
                    b.disabled = false;
                    b.innerHTML = origHtml || '<i class="fa-solid fa-file-zipper"></i> Tüm Platformlara Paketle';
                }
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
                if (window.LazyLoader) {
                    await window.LazyLoader.load('pdf', { label: 'PDF Motoru' });
                } else {
                    await this.loadScriptAsync('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
                }
            }

            const { jsPDF } = window.jspdf || window;
            if (!jsPDF) {
                if (typeof window.showAppToast === 'function') window.showAppToast('PDF motoru başlatılamadı.', 'error');
                return;
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
                    window.showAppToast('PDF sunum broşürü başarıyla indirildi.', 'success', 3500);
                }
            } catch(pdfErr) {
                console.error("PDF oluşturma hatası:", pdfErr);
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('PDF oluşturulurken hata oluştu: ' + pdfErr.message, 'error');
                }
            }
        },

        /**
         * 🪟 Canlı Tuval Üzerinde Öncesi / Sonrası Karşılaştırma
         */
        openCanvasCompare: function(mode) {
            const overlay = document.getElementById('canvasCompareSliderOverlay');
            if (!overlay) return;

            const targets = this.getSelectedItems();
            const activeItem = targets[0] || this.items.find(it => it.id === this.activeItemId) || this.items[0];

            // Tuval boşsa veya aktif öğe tuvalde değilse tuvale uygula (sessizce)
            if (activeItem && activeItem.id && activeItem.id !== this.activeItemId) {
                this.applyToCanvas(activeItem.id, true);
            } else if (!window.uploadedImgUrl && activeItem) {
                this.applyToCanvas(activeItem.id, true);
            }

            // 1. Öncesi (Orijinal) URL'ini belirle
            let beforeUrl = '';
            if (activeItem) {
                beforeUrl = activeItem.rawOriginalDataUrl || activeItem.originalDataUrl || window._aiOriginalImgDataUrl || window.uploadedImgUrl || activeItem.dataUrl;
            } else {
                beforeUrl = window._aiOriginalImgDataUrl || window.uploadedImgUrl || window.masterImageBase64 || '';
            }

            // 2. Sonrası (Düzenlenmiş) URL'ini belirle
            let afterUrl = '';
            if (activeItem && activeItem.dataUrl) {
                afterUrl = activeItem.dataUrl;
            } else {
                const pl = document.getElementById('photo-layer');
                const innerZoom = pl ? pl.querySelector('.photo-inner-zoom') : null;
                const bg = (innerZoom && innerZoom.style.backgroundImage) || (pl && (pl.dataset.savedBg || pl.style.backgroundImage));
                if (bg && bg !== 'none') {
                    afterUrl = bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                }
                if (!afterUrl) {
                    afterUrl = window.uploadedImgUrl || window.masterImageBase64 || beforeUrl;
                }
            }

            if (!beforeUrl && !afterUrl) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Karşılaştırma için tuvalde bir görsel bulunmalıdır.', 'warning');
                }
                return;
            }

            if (!beforeUrl) beforeUrl = afterUrl;
            if (!afterUrl) afterUrl = beforeUrl;

            // Eğer anlık "Öncesi" modundaysa, live tuvali normal (sonrası) durumuna getir
            if (window.isShowingBefore && typeof window.setOriginalView === 'function') {
                window.setOriginalView(false);
            }

            // İkili Görünüm İmajları
            const beforeImg = document.getElementById('canvasCompareBeforeImg');
            if (beforeImg) {
                beforeImg.src = beforeUrl;
                beforeImg.style.filter = 'none';
            }

            // Kaydırmalı Görünüm İmajları
            const sliderBeforeImg = document.getElementById('canvasCompareSliderBeforeImg');
            if (sliderBeforeImg) {
                sliderBeforeImg.src = beforeUrl;
                sliderBeforeImg.style.filter = 'none';
            }

            const afterImg = document.getElementById('canvasCompareAfterImg');
            const sliderAfterImg = document.getElementById('canvasCompareSliderAfterImg');

            const k = (this.aiIntensity !== undefined) ? this.aiIntensity : 0.35;
            const contrastPct = Math.round(100 + 16 * k);
            const satPct = Math.round(100 + 18 * k);
            const brightPct = Math.round(100 + 2 * k);
            const filterStr = `contrast(${contrastPct}%) saturate(${satPct}%) brightness(${brightPct}%) drop-shadow(0 0 0.5px rgba(0,0,0,${(k * 0.45).toFixed(2)}))`;

            if (afterImg) {
                afterImg.src = afterUrl;
                afterImg.style.filter = filterStr;
            }
            if (sliderAfterImg) {
                sliderAfterImg.src = afterUrl;
                sliderAfterImg.style.filter = filterStr;
            }

            const targetMode = mode || (this.compareMode === 'toggle' ? 'side-by-side' : this.compareMode) || 'side-by-side';
            this.compareMode = targetMode;

            this.isCompareOpen = true;
            overlay.style.display = 'block';

            this.setCompareMode(targetMode);

            const dockBtn = document.getElementById('dockBeforeAfterBtn');
            if (dockBtn) dockBtn.classList.add('active');

            const stagingBtn = document.getElementById('stagingCompareBtn');
            if (stagingBtn) stagingBtn.classList.add('active');

            const stagingDockBtn = document.getElementById('dockStagingCompareBtn');
            if (stagingDockBtn) stagingDockBtn.classList.add('active');
        },

        closeCanvasCompare: function() {
            this.isCompareOpen = false;
            const overlay = document.getElementById('canvasCompareSliderOverlay');
            if (overlay) overlay.style.display = 'none';

            const dockBtn = document.getElementById('dockBeforeAfterBtn');
            if (dockBtn && !window.isShowingBefore) dockBtn.classList.remove('active');

            const stagingBtn = document.getElementById('stagingCompareBtn');
            if (stagingBtn && !window.isShowingBefore) stagingBtn.classList.remove('active');

            const stagingDockBtn = document.getElementById('dockStagingCompareBtn');
            if (stagingDockBtn && !window.isShowingBefore) stagingDockBtn.classList.remove('active');
        },

        toggleCanvasCompare: function() {
            return this.triggerCompareAction();
        },

        /**
         * Karşılaştırma Modunu Ayarlar:
         * 'toggle' (Tıklamalı) | 'side-by-side' (İkili) | 'slider' (Kaydırmalı)
         */
        setCompareMode: function(mode) {
            let m = mode || 'toggle';
            if (m === 'split-vertical') m = 'side-by-side';
            if (m === 'split-slider') m = 'slider';
            this.compareMode = m;

            // 1. Paneldeki Mod Butonlarını Güncelle
            const btnToggle = document.getElementById('btnStagingModeToggle');
            const btnSide = document.getElementById('btnStagingModeSideBySide');
            const btnSlider = document.getElementById('btnStagingModeSlider');
            if (btnToggle) btnToggle.classList.toggle('active', this.compareMode === 'toggle');
            if (btnSide) btnSide.classList.toggle('active', this.compareMode === 'side-by-side');
            if (btnSlider) btnSlider.classList.toggle('active', this.compareMode === 'slider');

            // 2. Katman Üst Çubuğundaki Butonları Güncelle
            const ovlToggle = document.getElementById('ovlCompareToggle');
            const ovlSide = document.getElementById('ovlCompareSideBySide');
            const ovlSlider = document.getElementById('ovlCompareSplitSlider');
            if (ovlToggle) ovlToggle.classList.toggle('active', this.compareMode === 'toggle');
            if (ovlSide) ovlSide.classList.toggle('active', this.compareMode === 'side-by-side');
            if (ovlSlider) ovlSlider.classList.toggle('active', this.compareMode === 'slider');

            // 3. Görünüm Kapsayıcılarını Yönet
            const sideBySideContainer = document.getElementById('canvasCompareViewContainer');
            const splitSliderWrap = document.getElementById('canvasCompareSplitSliderWrap');

            if (this.compareMode === 'toggle') {
                if (this.isCompareOpen) {
                    this.closeCanvasCompare();
                    this.toggleCanvasInstantBeforeAfter();
                }
            } else if (this.compareMode === 'side-by-side') {
                if (!this.isCompareOpen) {
                    this.openCanvasCompare('side-by-side');
                } else {
                    if (sideBySideContainer) sideBySideContainer.style.display = 'flex';
                    if (splitSliderWrap) splitSliderWrap.style.display = 'none';
                }
            } else if (this.compareMode === 'slider') {
                if (!this.isCompareOpen) {
                    this.openCanvasCompare('slider');
                } else {
                    if (sideBySideContainer) sideBySideContainer.style.display = 'none';
                    if (splitSliderWrap) splitSliderWrap.style.display = 'flex';
                    const sliderRange = document.getElementById('canvasCompareSliderRange');
                    if (sliderRange) sliderRange.value = 50;
                    this.updateSplitSlider(50);
                }
            }
        },

        /**
         * "Öncesi / Sonrası" Butonuna Basıldığında Seçili Moda Göre Davranır
         */
        triggerCompareAction: function() {
            if (this.compareMode === 'side-by-side') {
                if (this.isCompareOpen) {
                    this.closeCanvasCompare();
                } else {
                    this.openCanvasCompare('side-by-side');
                }
            } else if (this.compareMode === 'slider') {
                if (this.isCompareOpen) {
                    this.closeCanvasCompare();
                } else {
                    this.openCanvasCompare('slider');
                }
            } else {
                // Varsayılan: Tıklamalı anlık A/B tuval geçişi
                this.toggleCanvasInstantBeforeAfter();
            }
        },

        /**
         * Tuval Üzerinde Anlık Öncesi / Sonrası A/B Geçişi Yapar (Her Tıklamada Değişir)
         */
        toggleCanvasInstantBeforeAfter: function() {
            if (this.isCompareOpen) {
                this.closeCanvasCompare();
            }
            if (typeof window.togglePhotoBeforeAfterInstant === 'function') {
                window.togglePhotoBeforeAfterInstant();
            } else if (typeof window.setOriginalView === 'function') {
                window.setOriginalView();
            }
            this.syncCompareButtonStates();
        },

        /**
         * Öncesi / Sonrası Butonlarının (Dock & Panel) Durumunu Senkronize Eder
         */
        syncCompareButtonStates: function() {
            const isShowing = !!window.isShowingBefore;

            // Tuval altı dock butonu
            const dockBtn = document.getElementById('dockStagingCompareBtn');
            if (dockBtn) {
                if (isShowing) {
                    dockBtn.classList.add('active');
                    dockBtn.innerHTML = '<span class="dock-icon"><i class="fa-solid fa-eye"></i></span><span class="dock-label">Sonrası</span>';
                    dockBtn.title = 'Düzenlenmiş haline dön (Sonrası)';
                } else {
                    dockBtn.classList.remove('active');
                    dockBtn.innerHTML = '<span class="dock-icon"><i class="fa-solid fa-code-compare"></i></span><span class="dock-label">Öncesi / Sonrası</span>';
                    dockBtn.title = 'Öncesi ve Sonrası Karşılaştırma';
                }
            }

            // Panel içi buton
            const trayActionBtn = document.getElementById('stagingCompareActionBtn') || document.getElementById('stagingCompareBtn');
            if (trayActionBtn) {
                if (isShowing) {
                    trayActionBtn.classList.add('active');
                    trayActionBtn.innerHTML = '<i class="fa-solid fa-eye"></i> Sonrası';
                    trayActionBtn.title = 'Düzenlenmiş haline dön (Sonrası)';
                } else {
                    trayActionBtn.classList.remove('active');
                    trayActionBtn.innerHTML = '<i class="fa-solid fa-code-compare"></i> Öncesi / Sonrası';
                    trayActionBtn.title = 'Netleştirilmiş görsel ile orijinali karşılaştır';
                }
            }
        },

        /**
         * Kaydırmalı Karşılaştırma Bölücü Çizgisini ve Maskesini Günceller
         */
        updateSplitSlider: function(val) {
            const v = Math.max(0, Math.min(100, Number(val) || 50));
            const clipEl = document.getElementById('canvasCompareClipContainer');
            const lineEl = document.getElementById('canvasCompareDividerLine');
            const handleEl = document.getElementById('canvasCompareSliderHandle');

            if (clipEl) {
                const rightInset = 100 - v;
                clipEl.style.clipPath = `inset(0 ${rightInset}% 0 0)`;
                clipEl.style.webkitClipPath = `inset(0 ${rightInset}% 0 0)`;
            }
            if (lineEl) {
                lineEl.style.left = `${v}%`;
            }
            if (handleEl) {
                handleEl.style.left = `${v}%`;
            }
        },

        showOverlayLayer: function(layer) {
            this.currentOverlayLayer = (layer === 'before') ? 'before' : 'after';
            const cardBefore = document.getElementById('canvasCompareCardBefore');
            const cardAfter = document.getElementById('canvasCompareCardAfter');
            const btnBefore = document.getElementById('btnOverlayShowBefore');
            const btnAfter = document.getElementById('btnOverlayShowAfter');

            if (cardBefore) {
                cardBefore.classList.toggle('card-hidden', this.currentOverlayLayer !== 'before');
                cardBefore.style.cursor = 'pointer';
            }
            if (cardAfter) {
                cardAfter.classList.toggle('card-hidden', this.currentOverlayLayer !== 'after');
                cardAfter.style.cursor = 'pointer';
            }
            if (btnBefore) btnBefore.classList.toggle('active', this.currentOverlayLayer === 'before');
            if (btnAfter) btnAfter.classList.toggle('active', this.currentOverlayLayer === 'after');
        },

        toggleOverlayLayer: function() {
            if (this.compareMode !== 'overlay') return;
            const next = (this.currentOverlayLayer === 'before') ? 'after' : 'before';
            this.showOverlayLayer(next);
        },

        openCompareModal: function() {
            return this.triggerCompareAction();
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
         * Görsel Yükleme Yardımcısı (Zaman Aşımı ve Çökme Korumalı)
         */
        loadImageAsync: function(src, timeoutMs = 8000) {
            return new Promise((resolve, reject) => {
                if (!src) return reject(new Error('Görsel kaynağı boş.'));
                const img = new Image();
                img.crossOrigin = 'anonymous';
                let timer = setTimeout(() => {
                    img.onload = null;
                    img.onerror = null;
                    reject(new Error('Görsel yükleme zaman aşımına uğradı.'));
                }, timeoutMs);
                img.onload = () => {
                    clearTimeout(timer);
                    resolve(img);
                };
                img.onerror = (e) => {
                    clearTimeout(timer);
                    reject(e || new Error('Görsel çözümlenemedi.'));
                };
                img.src = src;
            });
        },

        /**
         * Karusel / Çoklu Gönderi Modunu Açar veya Açıksa Kapatır (Toggle)
         */
        toggleCarousel: async function() {
            if ((!window.CarouselManager || window.CarouselManager._isProxy) && window.LazyLoader) {
                await window.LazyLoader.load('carousel', { label: 'Karusel Yöneticisi' });
            }
            const cm = window.CarouselManager;
            if (!cm) return;

            if (cm.isVisible) {
                cm.toggleBar(false);
                cm.isVisible = false;
                const badge = document.getElementById('canvasCarouselBadge');
                if (badge) badge.style.display = 'none';
                this.renderPanel();
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Çoklu gönderi modu kapatıldı.', 'info');
                }
                return;
            }
            this.exportToCarousel();
        },

        /**
         * Seçili Görselleri Çoklu Gönderi / Albüm Sayfalarına Aktarır
         */
        exportToCarousel: async function() {
            const targets = this.getSelectedItems();
            if (targets.length === 0) {
                if (typeof window.showAppToast === 'function') window.showAppToast('Çoklu gönderi için en az 1 görsel gereklidir.', 'warning');
                return;
            }

            if ((!window.CarouselManager || window.CarouselManager._isProxy) && window.LazyLoader) {
                await window.LazyLoader.load('carousel', { label: 'Karusel Yöneticisi' });
            }
            const cm = window.CarouselManager;
            if (!cm) {
                if (typeof window.showAppToast === 'function') window.showAppToast('Albüm yöneticisi bulunamadı.', 'error');
                return;
            }

            cm.pages = [];
            targets.forEach((it, idx) => {
                cm.pages.push({
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
                });
            });

            cm.activePageIndex = 0;
            cm.isVisible = true;

            // Alt film şeridi çubuğunu açmıyoruz (kapalı kalır)
            cm.toggleBar(false);

            if (targets[0] && targets[0].dataUrl) {
                this.applyToCanvas(targets[0].id, true);
            }

            this.syncCanvasCarouselBadge();
            this.renderPanel();

            if (typeof window.showAppToast === 'function') {
                window.showAppToast('Çoklu gönderi aktif. Tuval üstündeki oklardan veya sol havuzdan görseller arasında geçiş yapabilirsiniz.', 'info', 4000);
            }
        },

        /**
         * Tuvaldeki Aktif Görseli Havuz Listesinde Sırayla Gezer (-1: Önceki, 1: Sonraki)
         */
        stepCanvasPhoto: function(direction) {
            const list = this.getFilteredItems();
            if (!list || list.length === 0) return;
            let currIdx = list.findIndex(it => it.id === this.activeItemId);
            if (currIdx === -1) currIdx = 0;
            let nextIdx = currIdx + direction;
            if (nextIdx < 0) nextIdx = list.length - 1;
            if (nextIdx >= list.length) nextIdx = 0;
            const nextItem = list[nextIdx];
            if (nextItem) {
                this.applyToCanvas(nextItem.id, true);
                this.syncCanvasCarouselBadge();
            }
        },

        /**
         * Tuval Üstü Sayfa & Görsel Gezinme Rozetini Günceller
         */
        syncCanvasCarouselBadge: function() {
            const badge = document.getElementById('canvasCarouselBadge');
            if (!badge) return;
            const list = this.getFilteredItems();
            if (!list || list.length <= 1) {
                badge.style.display = 'none';
                return;
            }
            let currIdx = list.findIndex(it => it.id === this.activeItemId);
            if (currIdx === -1) currIdx = 0;
            const currItem = list[currIdx];
            badge.style.display = 'inline-flex';
            const textEl = document.getElementById('canvasCarouselBadgeText');
            if (textEl) {
                const titleStr = currItem?.title ? ` • ${currItem.title}` : '';
                textEl.textContent = `Görsel ${currIdx + 1} / ${list.length}${titleStr}`;
            }
        },

        /**
         * Görselin Havuzdaki Sırasını Değiştirir (-1: Öne, +1: Arkaya)
         */
        moveItemById: function(itemId, direction) {
            const idx = this.items.findIndex(it => it.id === itemId);
            if (idx === -1) return;
            const targetIdx = idx + direction;
            if (targetIdx < 0 || targetIdx >= this.items.length) return;
            const temp = this.items[idx];
            this.items[idx] = this.items[targetIdx];
            this.items[targetIdx] = temp;
            if (typeof this.saveToStorage === 'function') this.saveToStorage();
            this.renderPanel();
            this.syncCanvasCarouselBadge();
        },

        /**
         * Kart Sürükle-Bırak Sıralama Bırakma Olayı
         */
        dropItem: function(targetId, evt) {
            const srcId = evt.dataTransfer.getData('application/x-staging-id') || evt.dataTransfer.getData('text/plain');
            if (!srcId || srcId === targetId) return;
            const srcIdx = this.items.findIndex(it => it.id === srcId);
            const targetIdx = this.items.findIndex(it => it.id === targetId);
            if (srcIdx === -1 || targetIdx === -1) return;

            const [movedItem] = this.items.splice(srcIdx, 1);
            this.items.splice(targetIdx, 0, movedItem);
            if (typeof this.saveToStorage === 'function') this.saveToStorage();
            this.renderPanel();
            this.syncCanvasCarouselBadge();
        },

        /**
         * Seçili Görsellere Toplu AI Netleştirme Uygular (Tümüne Uygula)
         */
        applyAiEnhanceSelected: async function() {
            const targets = this.getSelectedItems();
            if (targets.length === 0) {
                if (typeof window.showAppToast === 'function') window.showAppToast('Lütfen önce işlem yapılacak görselleri seçin.', 'warning');
                return;
            }

            const intensity = (typeof this.aiIntensity === 'number') ? this.aiIntensity : 0.35;
            const btn = document.getElementById('stagingApplyAiAllBtn');
            const originalBtnHtml = btn ? btn.innerHTML : '';
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Uygulanıyor...';
            }

            try {
                for (let i = 0; i < targets.length; i++) {
                    const it = targets[i];
                    if (btn) {
                        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> ${i + 1}/${targets.length}`;
                    }
                    // Asenkron nefes payı (UI thread dondurmaz)
                    await new Promise(r => setTimeout(r, 20));

                    try {
                        if (!it.rawOriginalDataUrl) {
                            it.rawOriginalDataUrl = it.originalDataUrl || it.dataUrl;
                        }
                        if (!it.originalDataUrl) {
                            it.originalDataUrl = it.dataUrl;
                        }
                        const enhancedDataUrl = await this.enhanceImageDataUrl(it.rawOriginalDataUrl || it.originalDataUrl || it.dataUrl, intensity);
                        it.dataUrl = enhancedDataUrl;
                        it.isEnhanced = true;
                        it.aiIntensity = intensity;

                        // Thumbnail güncellemesi (Havuz kartlarında netlik görünür)
                        try {
                            const img = await this.loadImageAsync(enhancedDataUrl);
                            const thumbCanvas = document.createElement('canvas');
                            const thumbW = 320;
                            const thumbH = Math.max(1, Math.round(thumbW * ((img.naturalHeight || 1080) / (img.naturalWidth || 1920))));
                            thumbCanvas.width = thumbW;
                            thumbCanvas.height = thumbH;
                            const tctx = thumbCanvas.getContext('2d');
                            tctx.drawImage(img, 0, 0, thumbW, thumbH);
                            it.thumbUrl = thumbCanvas.toDataURL('image/jpeg', 0.72);
                            thumbCanvas.width = 0;
                            thumbCanvas.height = 0;
                        } catch(eThumb) {}

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
                    window.showAppToast(`${targets.length} görsel netleştirildi.`, 'success', 3000);
                }
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = originalBtnHtml || '<i class="fa-solid fa-check"></i> Tümüne Uygula';
                }
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
                    const contrastPct = Math.round(100 + 16 * intensity);
                    const satPct = Math.round(100 + 20 * intensity);
                    const brightPct = Math.round(100 + 3 * intensity);
                    ctx.filter = `contrast(${contrastPct}%) saturate(${satPct}%) brightness(${brightPct}%)`;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    ctx.filter = 'none';

                    const qKey = this.exportQuality || 'web';
                    let mime = 'image/jpeg';
                    let q = 0.94;
                    if (qKey === 'lossless' || qKey === 'png') {
                        mime = 'image/png';
                    } else if (qKey === 'ultra') {
                        q = 0.98;
                    } else if (qKey === 'high') {
                        q = 0.96;
                    }

                    if (window.AiEnhancer && typeof window.AiEnhancer.applyAiFilters === 'function') {
                        try {
                            const finalCanvas = window.AiEnhancer.applyAiFilters(canvas, 'picsart_hd', intensity);
                            const res = finalCanvas.toDataURL(mime, q);
                            canvas.width = 0;
                            canvas.height = 0;
                            resolve(res);
                            return;
                        } catch(e) {}
                    }
                    const res = canvas.toDataURL(mime, q);
                    canvas.width = 0;
                    canvas.height = 0;
                    resolve(res);
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
                this.resetCanvasToEmpty();
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
                this.resetCanvasToEmpty();
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
         * Tuvali ve şablon/kolaj artıklarını tamamen temizler, boş durum kartlarını geri getirir
         */
        resetCanvasToEmpty: function() {
            // 1. Şablonları temizle
            if (typeof window.clearAllTemplates === 'function') {
                window.clearAllTemplates();
            }

            // 2. Kolajı temizle
            if (typeof window._kolajTemizle === 'function') {
                window._kolajTemizle();
            } else if (typeof window.kolajTemizle === 'function') {
                window.kolajTemizle();
            }

            // 3. Kolaj ve canva DOM artıklarını zorla temizle
            const kw = document.getElementById('kolaj-wrapper');
            if (kw) kw.remove();
            
            document.querySelectorAll('.kolaj-cerceve, .kolaj-foto, .canva-generated, .slot-photo-change-btn').forEach(el => {
                if (el.parentNode) el.remove();
            });

            // 4. Arka plan görselini ve katmanları temizle
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

            // 5. Canva modunu sıfırla
            window.isCanvaMode = false;
            window.activeCanvaId = '';
            if (typeof isCanvaMode !== 'undefined') isCanvaMode = false;
            if (typeof activeCanvaId !== 'undefined') activeCanvaId = '';
            const canvaLayer = document.getElementById('canva-render-layer');
            if (canvaLayer) {
                canvaLayer.innerHTML = '';
                canvaLayer.style.display = 'none';
            }

            // 6. Tuval arka planını varsayılana getir (beyaz)
            const cContainerEl = document.getElementById('canvas-container');
            if (cContainerEl) {
                const savedBg = localStorage.getItem('emlakstudiom_canvasBgColor') || '#ffffff';
                cContainerEl.style.backgroundColor = savedBg;
                cContainerEl.style.backgroundImage = 'none';
            }

            // 7. Boş durum kartlarını (CanvasEmptyState) temiz bir şekilde geri aç
            const es = document.getElementById('canvasEmptyState');
            if (es) {
                es.classList.remove('is-hidden');
                es.style.removeProperty('display');
                es.style.removeProperty('visibility');
                es.style.removeProperty('opacity');
                es.style.removeProperty('pointer-events');
                es.style.display = 'flex';
            }
            if (window.CanvasEmptyState && typeof window.CanvasEmptyState.resetDismiss === 'function') {
                window.CanvasEmptyState.resetDismiss();
                window.CanvasEmptyState.updateState();
            }
        },

        /**
         * Tüm Havuzu Boşaltır ve Tuvali Sıfırlar (Sessiz ve Bildirimsiz)
         */
        clearAllPool: function() {
            if (!this.items || this.items.length === 0) {
                this.resetCanvasToEmpty();
                return;
            }

            if (typeof window.recordHistoryImmediate === 'function' && !window.isHistoryRestoring) {
                window.recordHistoryImmediate('Havuz Temizleme Öncesi');
            }

            this.items = [];
            this.activeItemId = null;
            this.selectedIds.clear();

            this.resetCanvasToEmpty();

            this.renderPanel();
            this.updateBadgeCount();
            this.syncExternalTabs();

            if (typeof window.recordHistoryImmediate === 'function' && !window.isHistoryRestoring) {
                window.recordHistoryImmediate('Havuz Temizlendi');
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
         * Yüksek Çözünürlüklü Fotoğrafları Güvenli Bellek Sınırlarına Ölçekler (Out of Memory Koruması)
         */
        downscaleImageIfNeeded: function(file, dataUrl) {
            return new Promise((resolve) => {
                if (!dataUrl || typeof dataUrl !== 'string') return resolve(dataUrl);
                const img = new Image();
                img.onload = () => {
                    const natW = img.naturalWidth || 1920;
                    const natH = img.naturalHeight || 1080;
                    const isMob = typeof window.isMobileDevice === 'function' ? window.isMobileDevice() : window.innerWidth <= 768;
                    const MAX_DIM = isMob ? 2048 : 2880; // 2.5K Ultra Net, bellek dostu tavan çözünürlük
                    const MAX_AREA = isMob ? 3000000 : 7000000;
                    
                    if (natW <= MAX_DIM && natH <= MAX_DIM && (natW * natH) <= MAX_AREA) {
                        return resolve(dataUrl);
                    }
                    
                    try {
                        let finalW = natW;
                        let finalH = natH;
                        if (finalW > MAX_DIM || finalH > MAX_DIM) {
                            const ratio = Math.min(MAX_DIM / finalW, MAX_DIM / finalH);
                            finalW = Math.round(finalW * ratio);
                            finalH = Math.round(finalH * ratio);
                        }
                        if ((finalW * finalH) > MAX_AREA) {
                            const areaRatio = Math.sqrt(MAX_AREA / (finalW * finalH));
                            finalW = Math.round(finalW * areaRatio);
                            finalH = Math.round(finalH * areaRatio);
                        }
                        const canvas = document.createElement('canvas');
                        canvas.width = finalW;
                        canvas.height = finalH;
                        const ctx = canvas.getContext('2d');
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(img, 0, 0, finalW, finalH);
                        const mime = (file && file.type === 'image/png') ? 'image/png' : 'image/jpeg';
                        const scaledUrl = canvas.toDataURL(mime, 0.92);
                        resolve(scaledUrl);
                    } catch(err) {
                        console.warn("Downscale fallback:", err);
                        resolve(dataUrl);
                    }
                };
                img.onerror = () => resolve(dataUrl);
                img.src = dataUrl;
            });
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
         * Yükleme Butonlarında Dönen Spinner ve Yükleniyor Durumunu Yönetir
         */
        setButtonLoading: function(isLoading) {
            const btn = document.getElementById('bgUploadBtn') || document.querySelector('.pro-upload-container .btn-blue');
            if (btn) {
                if (isLoading) {
                    if (!btn._origHtml) btn._origHtml = btn.innerHTML;
                    btn.disabled = true;
                    btn.style.pointerEvents = 'none';
                    btn.style.opacity = '0.85';
                    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin" style="font-size:14px;"></i> <span id="bgUploadBtnText">Yükleniyor...</span>';
                } else {
                    btn.disabled = false;
                    btn.style.pointerEvents = '';
                    btn.style.opacity = '';
                    if (btn._origHtml) {
                        btn.innerHTML = btn._origHtml;
                        btn._origHtml = null;
                    }
                }
            }

            const dropzone = document.getElementById('stagingDropzone');
            if (dropzone) {
                const icon = dropzone.querySelector('.staging-drop-icon');
                const text = dropzone.querySelector('.staging-drop-main');
                if (isLoading) {
                    if (icon) {
                        if (!icon._origClass) icon._origClass = icon.className;
                        icon.className = 'fa-solid fa-circle-notch fa-spin staging-drop-icon';
                    }
                    if (text) {
                        if (!text._origText) text._origText = text.textContent;
                        text.textContent = 'Görseller İşleniyor...';
                    }
                } else {
                    if (icon && icon._origClass) {
                        icon.className = icon._origClass;
                        icon._origClass = null;
                    }
                    if (text && text._origText) {
                        text.textContent = text._origText;
                        text._origText = null;
                    }
                }
            }
        },

        /**
         * Tekil Bir Görseli Native Blob ve Canvas ile Turbo Optimize Eder (Thumbnail Dahil)
         */
        processSingleFile: function(file, idx) {
            return new Promise((resolve) => {
                if (!file) return resolve(null);
                const blobUrl = URL.createObjectURL(file);
                const img = new Image();
                img.onload = () => {
                    try {
                        const natW = img.naturalWidth || 1920;
                        const natH = img.naturalHeight || 1080;
                        const isMob = typeof window.isMobileDevice === 'function' ? window.isMobileDevice() : window.innerWidth <= 768;
                        const MAX_DIM = isMob ? 2048 : 2880;
                        const MAX_AREA = isMob ? 3000000 : 7000000;

                        let finalW = natW;
                        let finalH = natH;
                        if (finalW > MAX_DIM || finalH > MAX_DIM) {
                            const ratio = Math.min(MAX_DIM / finalW, MAX_DIM / finalH);
                            finalW = Math.round(finalW * ratio);
                            finalH = Math.round(finalH * ratio);
                        }
                        if ((finalW * finalH) > MAX_AREA) {
                            const areaRatio = Math.sqrt(MAX_AREA / (finalW * finalH));
                            finalW = Math.round(finalW * areaRatio);
                            finalH = Math.round(finalH * areaRatio);
                        }

                        // 1. Optimize Master Canvas (2.5K Ultra Net)
                        const canvas = document.createElement('canvas');
                        canvas.width = finalW;
                        canvas.height = finalH;
                        const ctx = canvas.getContext('2d');
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(img, 0, 0, finalW, finalH);
                        const mime = (file.type === 'image/png') ? 'image/png' : 'image/jpeg';
                        const dataUrl = canvas.toDataURL(mime, 0.92);

                        // 2. Doğrudan Canvas Üzerinden 480px Thumbnail (Gecikmesiz & Sıfır Bellek Atığı)
                        const thumbW = Math.min(480, finalW);
                        const thumbH = Math.max(1, Math.round(thumbW * (finalH / finalW)));
                        const thumbCanvas = document.createElement('canvas');
                        thumbCanvas.width = thumbW;
                        thumbCanvas.height = thumbH;
                        const tctx = thumbCanvas.getContext('2d');
                        tctx.imageSmoothingEnabled = true;
                        tctx.imageSmoothingQuality = 'medium';
                        tctx.drawImage(canvas, 0, 0, thumbW, thumbH);
                        const thumbUrl = thumbCanvas.toDataURL('image/jpeg', 0.72);

                        URL.revokeObjectURL(blobUrl);

                        const cleanName = (file.name || `Fotoğraf ${idx + 1}`).replace(/\.[^/.]+$/, "");
                        resolve({
                            id: 'upload_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substr(2, 4),
                            key: 'local_file',
                            title: cleanName,
                            subTitle: 'Yüklenen Fotoğraf',
                            icon: 'fa-image',
                            dataUrl: dataUrl,
                            thumbUrl: thumbUrl,
                            originalDataUrl: dataUrl,
                            rawOriginalDataUrl: dataUrl,
                            rawOriginalThumbUrl: thumbUrl,
                            timestamp: Date.now()
                        });
                    } catch(err) {
                        console.warn("processSingleFile error:", err);
                        URL.revokeObjectURL(blobUrl);
                        resolve(null);
                    }
                };
                img.onerror = () => {
                    URL.revokeObjectURL(blobUrl);
                    resolve(null);
                };
                img.src = blobUrl;
            });
        },

        /**
         * Yüklenen Dosyaları DataURL'e Çevirip Havuzda Toplar (Progressive Canlı Akış)
         */
        processUploadedFiles: async function(files, shouldSwitchTab = true, skipApplyToCanvas = false) {
            if (!Array.isArray(files) || files.length === 0) return;

            this.setButtonLoading(true);

            try {
                // 🍏 HEIC / iPhone Fotoğrafları için Otomatik Dönüştürme Kontrolü
                const processedFiles = [];
                for (let f of files) {
                    if (typeof window.convertHeicIfNeeded === 'function') {
                        const converted = await window.convertHeicIfNeeded(f);
                        if (converted) processedFiles.push(converted);
                    } else {
                        processedFiles.push(f);
                    }
                }
                if (processedFiles.length === 0) {
                    this.setButtonLoading(false);
                    return;
                }

                const imageFiles = processedFiles.filter(f => (f.type && f.type.startsWith('image/')) || /\.(jpg|jpeg|png|webp|jfif|bmp)$/i.test(f.name || ''));
                if (imageFiles.length === 0) {
                    this.setButtonLoading(false);
                    return;
                }

                if (shouldSwitchTab) {
                    this.switchToStagingTab();
                }

                // 🚀 ADIM 1: İlk görseli turbo hızda (~200ms) hazırla ve anında tuvale aktar
                const firstEntry = await this.processSingleFile(imageFiles[0], 0);
                if (firstEntry) {
                    this.addItems([firstEntry], false, skipApplyToCanvas);
                }

                // 🚀 ADIM 2: Kalan görselleri tarayıcıyı dondurmadan arka planda peş peşe akıt
                for (let i = 1; i < imageFiles.length; i++) {
                    await new Promise(r => setTimeout(r, 15));
                    const entry = await this.processSingleFile(imageFiles[i], i);
                    if (entry) {
                        this.items.splice(i, 0, entry);
                        this.selectedIds.add(entry.id);
                        this.renderPanel();
                        this.updateBadgeCount();
                        this.syncExternalTabs();
                    }
                }

                if (typeof window.recordHistoryImmediate === 'function' && !window.isHistoryRestoring) {
                    window.recordHistoryImmediate('Havuz Toplu Görsel Eklendi');
                }
            } catch(e) {
                console.error('processUploadedFiles error:', e);
            } finally {
                this.setButtonLoading(false);
            }
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
                    const safeTitle = (typeof window.escapeHtml === 'function') ? window.escapeHtml(it.title || '') : String(it.title || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
                    const isActive = (it.id === this.activeItemId);
                    const isSelected = this.selectedIds.has(it.id);
                    const tagParts = [];
                    if (it.tilt !== undefined) tagParts.push(`${it.tilt}° Eğim`);
                    if (it.heading !== undefined) tagParts.push(`${it.heading}° Yön`);
                    if (it.parcelMeta?.ada && it.parcelMeta?.parsel) tagParts.push(`${it.parcelMeta.ada}/${it.parcelMeta.parsel}`);
                    const tagStr = tagParts.join(' • ');

                    return `
                        <div class="staging-card ${isActive ? 'is-active' : ''} ${isSelected ? 'is-selected' : ''}" data-id="${it.id}" draggable="true" ondragstart="event.dataTransfer.setData('text/plain', '${it.id}'); event.dataTransfer.setData('application/x-staging-id', '${it.id}'); event.dataTransfer.effectAllowed = 'copy';" ondragover="event.preventDefault();" ondrop="event.preventDefault(); PhotoStagingArchive.dropItem('${it.id}', event);">
                            <div class="staging-card-thumb-wrap" onclick="PhotoStagingArchive.applyToCanvas('${it.id}')">
                                <label class="staging-card-check" onclick="event.stopPropagation()">
                                    <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="PhotoStagingArchive.toggleSelect('${it.id}')">
                                </label>
                                ${isActive ? '<span class="staging-active-pill"><i class="fa-solid fa-circle-check"></i> Tuvalde</span>' : ''}
                                ${it.excludeLogo ? '<span class="staging-card-badge-custom-logo" title="Bu görselde bağımsız logo konumu var"><i class="fa-solid fa-location-crosshairs"></i> Özel Konum</span>' : ''}
                                <img class="staging-card-img" src="${it.thumbUrl || it.dataUrl}" alt="${safeTitle}" loading="lazy">
                                <div class="staging-card-hover-actions">
                                    <button type="button" class="staging-hover-btn" onclick="event.stopPropagation(); PhotoStagingArchive.moveItemById('${it.id}', -1)" title="Öne Taşı">
                                        <i class="fa-solid fa-chevron-left"></i>
                                    </button>
                                    <button type="button" class="staging-hover-btn" onclick="event.stopPropagation(); PhotoStagingArchive.moveItemById('${it.id}', 1)" title="Arkaya Taşı">
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </button>
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
                                    <div class="staging-order-stepper" onclick="event.stopPropagation()">
                                        <button type="button" class="staging-step-btn" onclick="PhotoStagingArchive.moveItemById('${it.id}', -1)" title="Öne Taşı"><i class="fa-solid fa-chevron-left"></i></button>
                                        <span class="staging-card-idx">${idx + 1}</span>
                                        <button type="button" class="staging-step-btn" onclick="PhotoStagingArchive.moveItemById('${it.id}', 1)" title="Arkaya Taşı"><i class="fa-solid fa-chevron-right"></i></button>
                                    </div>
                                    <span class="staging-card-title" title="${safeTitle}">${safeTitle}</span>
                                </div>
                                ${tagStr ? `<div class="staging-card-tag" title="${tagStr}">${tagStr}</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');

                cardsHtml = `<div class="staging-grid" id="stagingCardsGrid">${cardsInner}</div>`;
            }

            const currentLogo = this.getCurrentLogoUrl();
            const hasCustomLogo = !!(currentLogo && !currentLogo.includes('assets/logo/logo.png'));
            const activeItem = (this.items && this.items.length > 0) ? this.items.find(it => it.id === this.activeItemId) : null;
            const isActiveItemExcluded = !!(activeItem && activeItem.excludeLogo);

            const logoEl = document.getElementById('elLogo');
            const isLogoOnCanvas = !!(
                logoEl &&
                logoEl.style.display !== 'none' &&
                logoEl.style.visibility !== 'hidden' &&
                parseFloat(logoEl.style.opacity || '1') > 0 &&
                (logoEl.src || (logoEl.querySelector('img') && logoEl.querySelector('img').src))
            );

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
                        <div class="staging-quality-row">
                            <span class="staging-quality-label"><i class="fa-solid fa-sliders"></i> Kalite</span>
                            <select class="staging-tray-select staging-quality-select" id="stagingExportQualitySelect" onchange="PhotoStagingArchive.setExportQuality(this.value)" title="Toplu indirme ve damgalama için çıktı kalitesi">
                                <option value="web" ${this.exportQuality === 'web' ? 'selected' : ''}>Web ve Portallar</option>
                                <option value="high" ${this.exportQuality === 'high' ? 'selected' : ''}>Yüksek Kalite</option>
                                <option value="ultra" ${this.exportQuality === 'ultra' ? 'selected' : ''}>Ultra Netlik</option>
                                <option value="lossless" ${this.exportQuality === 'lossless' ? 'selected' : ''}>Kayıpsız PNG</option>
                            </select>
                        </div>
                        <div class="staging-batch-actions-grid">
                            <button type="button" class="btn-action staging-batch-btn" onclick="PhotoStagingArchive.applySelectedToCanvas()" title="Seçilen görseli tuvale aktarır">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i> Tuvale Aktar
                            </button>
                            <button type="button" id="stagingBatchDownloadBtn" class="btn-action staging-batch-btn" onclick="PhotoStagingArchive.downloadSelectedZip()" title="Seçilen görselleri tek ZIP olarak indirir">
                                ${this.isExportingZip ? '<i class="fa-solid fa-circle-notch fa-spin"></i> İndiriliyor' : '<i class="fa-solid fa-file-zipper"></i> Toplu İndir'}
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
                            <button type="button" id="stagingCompareBtn" class="btn-action staging-batch-btn ${(this.isCompareOpen || window.isShowingBefore) ? 'active' : ''}" onclick="PhotoStagingArchive.triggerCompareAction()" title="Orijinal ve düzenlenen görseli karşılaştırın">
                                <i class="fa-solid ${window.isShowingBefore ? 'fa-eye' : 'fa-code-compare'}"></i> ${window.isShowingBefore ? 'Sonrası' : 'Öncesi / Sonrası'}
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
                                <span class="staging-tray-title-text"><i class="fa-solid fa-shield-halved" style="color:#0284c7;"></i> Filigran &amp; Logo</span>
                                <button type="button" class="btn-action staging-tray-close-btn" onclick="PhotoStagingArchive.toggleWatermarkTray()">Kapat</button>
                            </div>
                            <div class="staging-tray-row">
                                <!-- Solda Logo Önizleme Kutusu (Tıklayınca Tuvale Ekler) -->
                                <div class="staging-logo-preview-box" id="stagingLogoPreviewBox" onclick="PhotoStagingArchive.addLogoToCanvas()" style="cursor:pointer;" title="Logoyu tuvale ekle">
                                    <img src="${currentLogo || 'assets/logo/logo.png'}" class="staging-logo-preview-img" alt="Logo" onerror="this.style.display='none'; const ph=this.parentElement.querySelector('.staging-logo-fallback-icon'); if(ph) ph.style.display='inline-block';">
                                    <i class="fa-solid fa-shield-halved staging-logo-fallback-icon" style="display:none; color:#0284c7; font-size:14px;"></i>
                                </div>
                                <input type="file" id="stagingWatermarkLogoInput" accept="image/*" style="display:none;" onchange="PhotoStagingArchive.handleWatermarkLogoUpload(event)">
                                ${isLogoOnCanvas ? `
                                    <button type="button" id="stagingLogoUploadBtn" class="btn-action staging-tray-btn" onclick="PhotoStagingArchive.triggerWatermarkLogoInput()" title="Kendi logonuzu seçin veya değiştirin">
                                        <i class="fa-solid fa-arrow-up-from-bracket"></i> <span id="stagingLogoUploadBtnText">${hasCustomLogo ? 'Logo Değiştir' : 'Logo Seç'}</span>
                                    </button>
                                    <button type="button" id="stagingLogoRemoveBtn" class="btn-action staging-tray-btn staging-tray-btn-danger" onclick="PhotoStagingArchive.removeLogoFromCanvas()" title="Logoyu tuvalden kaldırır">
                                        <i class="fa-solid fa-trash-can"></i> Logoyu Kaldır
                                    </button>
                                ` : `
                                    <button type="button" id="stagingLogoAddBtn" class="btn-action staging-tray-btn" onclick="PhotoStagingArchive.addLogoToCanvas()" title="Logoyu tuvale yerleştirir">
                                        <i class="fa-solid fa-stamp"></i> Logo Ekle
                                    </button>
                                    <button type="button" id="stagingLogoUploadBtn" class="btn-action staging-tray-btn" onclick="PhotoStagingArchive.triggerWatermarkLogoInput()" title="Kendi logonuzu seçin">
                                        <i class="fa-solid fa-arrow-up-from-bracket"></i> <span id="stagingLogoUploadBtnText">Logo Seç</span>
                                    </button>
                                `}
                            </div>
                            <div class="staging-tray-row">
                                <select class="staging-tray-select" id="watermarkPosSelect" onchange="PhotoStagingArchive.setWatermarkPosition(this.value)">
                                    <option value="bottom-right" ${this.watermarkOptions.position === 'bottom-right' ? 'selected' : ''}>Konum: Sağ Alt</option>
                                    <option value="bottom-left" ${this.watermarkOptions.position === 'bottom-left' ? 'selected' : ''}>Konum: Sol Alt</option>
                                    <option value="top-right" ${this.watermarkOptions.position === 'top-right' ? 'selected' : ''}>Konum: Sağ Üst</option>
                                    <option value="top-left" ${this.watermarkOptions.position === 'top-left' ? 'selected' : ''}>Konum: Sol Üst</option>
                                    <option value="center" ${this.watermarkOptions.position === 'center' ? 'selected' : ''}>Konum: Merkez</option>
                                    <option value="custom" ${this.watermarkOptions.position === 'custom' ? 'selected' : ''}>Konum: Serbest Taşıma</option>
                                </select>
                                <button type="button" class="btn-action staging-tray-btn" onclick="PhotoStagingArchive.alignLogoBottomRight()" title="Logoyu sağ alt köşeye yerleştirir">
                                    <i class="fa-solid fa-arrows-to-dot"></i> Sağ Alta Hizala
                                </button>
                            </div>
                            <div class="staging-logo-sync-bar">
                                <label class="staging-logo-sync-item" title="Logonun belirlenen konumunu havuzdaki tüm görsellere uygular">
                                    <input type="checkbox" id="stagingWmApplyAllCheck" ${this.watermarkOptions.applyToAll !== false ? 'checked' : ''} onchange="PhotoStagingArchive.setWatermarkApplyToAll(this.checked)">
                                    <span>Konumu Tümüne Uygula</span>
                                </label>
                                <label class="staging-logo-sync-item ${isActiveItemExcluded ? 'is-excluded' : ''}" title="Seçili görselde logo konumunu bağımsız olarak ayarlayın">
                                    <input type="checkbox" id="stagingWmExcludeCheck" ${isActiveItemExcluded ? 'checked' : ''} onchange="PhotoStagingArchive.toggleExcludeActiveItem(this.checked)">
                                    <span>Bu Görseli Hariç Tut</span>
                                </label>
                            </div>
                            <div class="slider-group" style="margin:0;">
                                <label style="display:flex; justify-content:space-between; margin-bottom:2px; font-size:11px; font-weight:600;"><span>Boyut</span><span id="wmScaleVal">${this.watermarkOptions.scale}%</span></label>
                                <input type="range" id="wmScaleSlider" min="5" max="50" value="${this.watermarkOptions.scale}" oninput="PhotoStagingArchive.setWatermarkScale(this.value)">
                            </div>
                            <div class="slider-group" style="margin:0;">
                                <label style="display:flex; justify-content:space-between; margin-bottom:2px; font-size:11px; font-weight:600;"><span>Opaklık</span><span id="wmOpacityVal">${this.watermarkOptions.opacity}%</span></label>
                                <input type="range" id="wmOpacitySlider" min="10" max="100" value="${this.watermarkOptions.opacity}" oninput="PhotoStagingArchive.setWatermarkOpacity(this.value)">
                            </div>
                            <button type="button" id="stagingApplyWatermarkBtn" class="btn-action" style="width:100%; height:34px; margin:0; font-size:11.5px; font-weight:700; display:inline-flex; align-items:center; justify-content:center; gap:6px;" onclick="PhotoStagingArchive.applyWatermarkSelected()">
                                <i class="fa-solid fa-stamp"></i> Seçilenlere Damgala
                            </button>
                        </div>

                        <!-- 📐 FORMAT & KADRAJ PANELİ (Açılır) -->
                        <div class="staging-sub-tray ${this.formatTrayOpen ? 'is-open' : ''}" id="stagingFormatTray">
                            <div class="staging-tray-title">
                                <span class="staging-tray-title-text"><i class="fa-solid fa-crop-simple" style="color:#0284c7;"></i> Format &amp; Kadraj</span>
                                <button type="button" class="btn-action staging-tray-close-btn" onclick="PhotoStagingArchive.toggleFormatTray()">Kapat</button>
                            </div>
                            <div class="staging-tray-row">
                                <select class="staging-tray-select" id="formatRatioSelect" onchange="PhotoStagingArchive.formatOptions.ratio = this.value">
                                    <option value="original" ${this.formatOptions.ratio === 'original' ? 'selected' : ''}>Orijinal Boyut</option>
                                    <option value="1:1" ${this.formatOptions.ratio === '1:1' ? 'selected' : ''}>1:1 Instagram Post</option>
                                    <option value="16:9" ${this.formatOptions.ratio === '16:9' ? 'selected' : ''}>16:9 Sahibinden ve Portallar</option>
                                    <option value="9:16" ${this.formatOptions.ratio === '9:16' ? 'selected' : ''}>9:16 Story ve Reels</option>
                                    <option value="4:3" ${this.formatOptions.ratio === '4:3' ? 'selected' : ''}>4:3 Portallar</option>
                                </select>
                                <select class="staging-tray-select" id="formatModeSelect" onchange="PhotoStagingArchive.formatOptions.mode = this.value">
                                    <option value="contain_blur" ${this.formatOptions.mode === 'contain_blur' ? 'selected' : ''}>Bulanık Zeminle Sığdır</option>
                                    <option value="cover" ${this.formatOptions.mode === 'cover' ? 'selected' : ''}>Ortalayarak Doldur</option>
                                </select>
                            </div>
                            <div class="staging-tray-row" style="margin-top:4px;">
                                <select class="staging-tray-select" id="formatQualitySelect" style="width:100%;" onchange="PhotoStagingArchive.setFormatQuality(this.value)" title="Dışa aktarma ve formatlama çözünürlük kalitesi">
                                    <option value="hd" ${this.formatQuality === 'hd' ? 'selected' : ''}>Standart HD 1080p</option>
                                    <option value="2k" ${(this.formatQuality === '2k' || !this.formatQuality) ? 'selected' : ''}>Yüksek Kalite 2K</option>
                                    <option value="4k" ${this.formatQuality === '4k' ? 'selected' : ''}>Ultra Netlik 4K</option>
                                    <option value="png" ${this.formatQuality === 'png' ? 'selected' : ''}>Kayıpsız PNG</option>
                                </select>
                            </div>
                            <div class="staging-tray-row" style="margin-top:4px;">
                                <button type="button" class="btn-action staging-tray-btn" onclick="PhotoStagingArchive.applyFormatSelected()" title="Seçilen en-boy oranına dönüştürür">
                                    <i class="fa-solid fa-arrows-split-up-and-left"></i> Boyutlandır
                                </button>
                                <button type="button" class="btn-action staging-tray-btn staging-tray-btn-danger" onclick="PhotoStagingArchive.resetFormatSelected()" title="Görselleri orijinal kadrajına ve boyutuna döndürür">
                                    <i class="fa-solid fa-rotate-left"></i> Orijinale Dön
                                </button>
                            </div>
                            <div class="staging-tray-row" style="margin-top:6px;">
                                <button type="button" id="stagingMultiPlatformZipBtn" class="btn-action staging-tray-btn" style="width:100%; height:32px;" onclick="PhotoStagingArchive.downloadMultiPlatformZip()" title="Seçili görselleri Instagram 1:1, Sahibinden 16:9 ve Story 9:16 klasörlerine ayırıp tek ZIP olarak indirir">
                                    ${this.isExportingPlatforms ? '<i class="fa-solid fa-circle-notch fa-spin"></i> Paket Hazırlanıyor...' : '<i class="fa-solid fa-file-zipper"></i> Tüm Platformlara Paketle'}
                                </button>
                            </div>
                        </div>

                        <!-- 🪄 AI NETLEŞTİRME AYAR PANELİ (Açılır) -->
                        <div class="staging-sub-tray ${this.aiTrayOpen ? 'is-open' : ''}" id="stagingAiTray">
                            <div class="staging-tray-title">
                                <span class="staging-tray-title-text"><i class="fa-solid fa-wand-magic-sparkles" style="color:#0284c7;"></i> AI Netleştirme</span>
                                <button type="button" class="btn-action staging-tray-close-btn" onclick="PhotoStagingArchive.toggleAiTray()">Kapat</button>
                            </div>
                            <div class="slider-group" style="margin:0;">
                                <label style="display:flex; justify-content:space-between; margin-bottom:2px; font-size:11px; font-weight:600;"><span>Netlik Miktarı</span><span id="stagingAiIntensityVal">%${Math.round((this.aiIntensity || 0.35) * 100)}</span></label>
                                <input type="range" id="stagingAiIntensitySlider" min="10" max="100" step="5" value="${Math.round((this.aiIntensity || 0.35) * 100)}" 
                                       oninput="PhotoStagingArchive.previewAiIntensityLive(this.value)" 
                                       onchange="PhotoStagingArchive.commitAiIntensity(this.value)"
                                       title="Canlı netlik önizlemesi">
                            </div>
                            <!-- Karşılaştırma Mod Seçenekleri -->
                            <div class="compare-mode-row" style="margin-top:6px; margin-bottom:2px;">
                                <button type="button" class="compare-mode-pill ${this.compareMode === 'toggle' ? 'active' : ''}" id="btnStagingModeToggle" onclick="PhotoStagingArchive.setCompareMode('toggle')" title="Tıklamayla tuvalde anlık öncesi ve sonrası geçişi">
                                    <i class="fa-solid fa-repeat"></i> Tıklamalı
                                </button>
                                <button type="button" class="compare-mode-pill ${this.compareMode === 'side-by-side' ? 'active' : ''}" id="btnStagingModeSideBySide" onclick="PhotoStagingArchive.setCompareMode('side-by-side')" title="Yan yana iki görselle karşılaştır">
                                    <i class="fa-solid fa-table-columns"></i> İkili
                                </button>
                                <button type="button" class="compare-mode-pill ${this.compareMode === 'slider' ? 'active' : ''}" id="btnStagingModeSlider" onclick="PhotoStagingArchive.setCompareMode('slider')" title="Ortadan kaydırarak karşılaştır">
                                    <i class="fa-solid fa-arrows-left-right"></i> Kaydırmalı
                                </button>
                            </div>
                            <div class="staging-tray-row" style="margin-top:6px;">
                                <button type="button" id="stagingCompareActionBtn" class="btn-action staging-tray-btn ${window.isShowingBefore ? 'active' : ''}" onclick="PhotoStagingArchive.triggerCompareAction()" title="Netleştirilmiş görsel ile orijinali karşılaştır">
                                    <i class="fa-solid ${window.isShowingBefore ? 'fa-eye' : 'fa-code-compare'}"></i> ${window.isShowingBefore ? 'Sonrası' : 'Öncesi / Sonrası'}
                                </button>
                                <button type="button" id="stagingApplyAiAllBtn" class="btn-action staging-tray-btn" onclick="PhotoStagingArchive.applyAiEnhanceSelected()" title="Seçili tüm görsellere bu netliği kalıcı olarak uygula">
                                    <i class="fa-solid fa-check"></i> Tümüne Uygula
                                </button>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Görseller Izgarası veya Boş Durum -->
                ${cardsHtml}
            `;

            this.initDropzoneListeners();
            this.syncCanvasCarouselBadge();
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
    window.validateLogoFileAsync = (file) => PhotoStagingArchive.validateLogoFileAsync(file);
    window.addLogoToCanvas = () => PhotoStagingArchive.addLogoToCanvas();

    // Sayfa hazır olduğunda başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PhotoStagingArchive.init());
    } else {
        setTimeout(() => PhotoStagingArchive.init(), 100);
    }

})(window);
