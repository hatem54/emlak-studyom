/**
 * =========================================================================
 * EMLAK STÜDYOM - ÇOK NOKTALI ARSA ÖLÇÜMÜ, ALAN & CEPHE ANALİZİ (PRO v7.1)
 * modules/satellite-measure.js
 * =========================================================================
 */

(function(window) {
    'use strict';

    if (!window.SatelliteMapModule) {
        window.SatelliteMapModule = {};
    }

    Object.assign(window.SatelliteMapModule, {
        // ==========================================
        // 📏 ÇOK NOKTALI ARSA ÖLÇÜMÜ, ALAN & CEPHE ANALİZ SİSTEMİ
        // ==========================================

        /**
         * Ölçüm Aracını Açar veya Kapatır
         */
        toggleMeasure: function(forceState) {
            const panel = document.getElementById('satMeasureFloatingPanel');
            const isPanelHidden = panel && (panel.style.display === 'none' || !this.measurePanelVisible);

            // Eğer ölçüm zaten haritada açıksa ve sadece panel gizlenmişse, butona tıklandığında paneli geri getir
            if (forceState === undefined && this.measureActive && isPanelHidden) {
                panel.style.display = 'flex';
                this.measurePanelVisible = true;
                this.restoreMeasurePanelPosition(panel);
                this.updateUIModeFor2D3D(this.is3DActive);
                this.syncMeasureUI();
                if (!this.is3DActive) {
                    this.updateMeasureGraphics();
                }
                return;
            }

            const newState = (forceState !== undefined) ? !!forceState : !this.measureActive;
            this.measureActive = newState;

            const btn = document.getElementById('satToggleMeasureBtn');
            const statusText = document.getElementById('satMeasureStatusText');
            if (btn) btn.classList.toggle('active', this.measureActive);
            if (statusText) statusText.textContent = this.measureActive ? 'Açık' : 'Kapalı';

            if (panel) {
                panel.style.display = this.measureActive ? 'flex' : 'none';
                this.measurePanelVisible = this.measureActive;
                if (this.measurePanelCollapsed) {
                    panel.classList.add('collapsed');
                } else {
                    panel.classList.remove('collapsed');
                }
                if (this.measureActive) {
                    this.restoreMeasurePanelPosition(panel);
                }
            }

            this.updateUIModeFor2D3D(this.is3DActive);
            this.syncMeasureUI();
            if (!this.is3DActive) {
                this.updateMeasureGraphics();
            }

            const mapEl = document.getElementById('satelliteLeafletMap');
            if (mapEl) {
                if (this.measureActive) {
                    if (this.measureInteractionMode === 'pan') {
                        mapEl.classList.add('measure-mode-panning');
                        mapEl.classList.remove('measure-mode-cursor');
                    } else {
                        mapEl.classList.add('measure-mode-cursor');
                        mapEl.classList.remove('measure-mode-panning');
                    }
                } else {
                    mapEl.classList.remove('measure-mode-cursor', 'measure-mode-panning', 'measure-mode-panning-active');
                }
            }

            if (this.measureActive) {
                const active = this.getActiveDrawing();
                // Eğer daha önce belirlenmiş nokta yoksa
                if (!active.points || active.points.length === 0) {
                    if (this.parcelData && this.parcelData.latLngs && this.parcelData.latLngs.length >= 3) {
                        // Yüklü parsel varsa otomatik tüm parsel köşelerini çevrele
                        this.snapDrawingToParcel(active.id);
                    } else if (this.map) {
                        // Parsel yoksa harita merkezinde iki nokta oluştur
                        const c = this.map.getCenter();
                        const ptA = L.latLng(c.lat, c.lng - 0.00032);
                        const ptB = L.latLng(c.lat, c.lng + 0.00032);
                        active.points = [ptA, ptB];
                        active.isClosed = false;
                        active.distanceMeters = ptA.distanceTo(ptB);
                    }
                }
                this.syncMeasureUI();
                this.updateParcelSnapButtons();
                this.updateMeasureGraphics();
                this.renderDrawingsListUI();
            } else {
                this.removeMeasureGraphicsFromMap();
                if (this.parcelPolygon && this.map) {
                    if (!this.map.hasLayer(this.parcelPolygon)) {
                        this.parcelPolygon.addTo(this.map);
                    }
                    this.updateParcelPolygonStyle();
                }
            }

            this.saveLastLocation({
                measureData: this.getMeasureDataToSave()
            });
        },

        /**
         * Ölçüm Panelini Gizler (Ölçümler ve Çizimler Haritada Kalır)
         */
        closeMeasurePanel: function() {
            const panel = document.getElementById('satMeasureFloatingPanel');
            if (panel) {
                panel.style.display = 'none';
            }
            this.measurePanelVisible = false;
            if (typeof window.showAppToast === 'function') {
                window.showAppToast('📏 Ölçüm paneli gizlendi. Ölçümler haritada aktif kalır.', 'info');
            }
            this.saveLastLocation({
                measureData: this.getMeasureDataToSave()
            });
        },

        /**
         * Etkileşim Modunu Ayarlar: 'draw' (Nokta Ekle) veya 'pan' (Haritada Gezin)
         */
        setMeasureInteractionMode: function(mode) {
            this.measureInteractionMode = mode || 'draw';
            const drawBtn = document.getElementById('satMeasureModeDrawBtn');
            const panBtn = document.getElementById('satMeasureModePanBtn');
            if (drawBtn) drawBtn.classList.toggle('active', this.measureInteractionMode === 'draw');
            if (panBtn) panBtn.classList.toggle('active', this.measureInteractionMode === 'pan');

            const mapEl = document.getElementById('satelliteLeafletMap');
            if (mapEl) {
                if (this.measureInteractionMode === 'pan') {
                    mapEl.classList.add('measure-mode-panning');
                    mapEl.classList.remove('measure-mode-cursor');
                } else {
                    mapEl.classList.add('measure-mode-cursor');
                    mapEl.classList.remove('measure-mode-panning');
                }
            }

            const hintEl = document.getElementById('satMeasureHintText');
            if (hintEl) {
                if (this.measureInteractionMode === 'pan') {
                    hintEl.textContent = '✋ Gezinme Modu: Sol tık ile haritayı serbestçe kaydırın, fare tekeriyle yakınlaşın';
                } else {
                    hintEl.textContent = '📍 Çizim Modu: Nokta eklemek için haritaya tıklayın • Kaydırmak için Ctrl veya Boşluk tuşuna basılı tutun';
                }
            }
        },

        /**
         * Harita Gezinme (Ctrl, Space, Sağ Tık Drag) Dinleyicilerini Kurar
         */
        initMeasureNavigationListeners: function() {
            if (this._measureNavListenersInitialized) return;
            this._measureNavListenersInitialized = true;

            const mapEl = document.getElementById('satelliteLeafletMap');

            // 1. Klavye Kısayolları (Ctrl ve Space)
            window.addEventListener('keydown', (e) => {
                if (!this.measureActive) return;
                // Form inputlarında yazarken klavye gezinmesini engelle
                if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

                if (e.code === 'Space') {
                    e.preventDefault();
                    this.isSpacePressed = true;
                    if (mapEl) mapEl.classList.add('measure-mode-panning');
                }
                if (e.key === 'Control') {
                    this.isCtrlPressed = true;
                    if (mapEl) mapEl.classList.add('measure-mode-panning');
                }
            });

            window.addEventListener('keyup', (e) => {
                if (!this.measureActive) return;
                if (e.code === 'Space') {
                    this.isSpacePressed = false;
                }
                if (e.key === 'Control') {
                    this.isCtrlPressed = false;
                }
                if (!this.isSpacePressed && !this.isCtrlPressed && this.measureInteractionMode !== 'pan') {
                    if (mapEl) mapEl.classList.remove('measure-mode-panning');
                }
            });

            // 2. Mouse Drag (Sağ Tık Pan veya Ctrl/Space Pan)
            if (mapEl) {
                mapEl.addEventListener('mousedown', (e) => {
                    if (!this.measureActive) return;
                    const isRightClick = (e.button === 2);
                    const isPanKey = (e.button === 0 && (e.ctrlKey || e.shiftKey || this.isSpacePressed || this.measureInteractionMode === 'pan'));

                    if (isRightClick || isPanKey) {
                        this.measureIsNavPanning = true;
                        this.navDragStart = { x: e.clientX, y: e.clientY };
                        mapEl.classList.add('measure-mode-panning-active');
                    }
                });

                window.addEventListener('mousemove', (e) => {
                    if (!this.measureActive || !this.measureIsNavPanning || !this.navDragStart || !this.map) return;
                    const dx = e.clientX - this.navDragStart.x;
                    const dy = e.clientY - this.navDragStart.y;
                    this.navDragStart = { x: e.clientX, y: e.clientY };
                    this.map.panBy([-dx, -dy], { animate: false });
                });

                window.addEventListener('mouseup', (e) => {
                    if (this.measureIsNavPanning) {
                        this.measureIsNavPanning = false;
                        this.navDragStart = null;
                        if (mapEl) mapEl.classList.remove('measure-mode-panning-active');
                    }
                });

                mapEl.addEventListener('contextmenu', (e) => {
                    if (this.measureActive) {
                        e.preventDefault(); // Sağ tık tarayıcı menüsünü engelle
                    }
                });
            }
        },

        /**
         * Ölçüm Panelini Küçültür / Büyütür
         */
        toggleMeasurePanelCollapse: function() {
            this.measurePanelCollapsed = !this.measurePanelCollapsed;
            const panel = document.getElementById('satMeasureFloatingPanel');
            const icon = document.getElementById('satMeasureMinIcon');
            const btn = icon ? icon.closest('.sat-measure-btn-min') : null;
            if (panel) {
                panel.classList.toggle('collapsed', this.measurePanelCollapsed);
            }
            if (icon) {
                icon.className = this.measurePanelCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
            }
            if (btn) {
                btn.title = this.measurePanelCollapsed ? 'Paneli Büyüt (Aç)' : 'Paneli Küçült';
            }
            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
        },

        /**
         * Hızlı Metin Şablonunu Ayarlar
         */
        setMeasurePreset: function(preset) {
            this.measurePreset = preset || 'frontage';
            document.querySelectorAll('.sat-measure-chip').forEach(chip => {
                chip.classList.toggle('active', chip.dataset.preset === this.measurePreset);
            });
            this.updateMeasureGraphics();
            this.saveLastLocation({
                measureData: this.getMeasureDataToSave()
            });
        },

        /**
         * Özel Metin Girişini Ayarlar
         */
        setMeasureCustomText: function(text) {
            this.measureCustomText = (typeof text === 'string') ? text : '';
            this.updateMeasureGraphics();
            this.saveLastLocation({
                measureData: this.getMeasureDataToSave()
            });
        },

        /**
         * Çizgi ve İşaretleme Stilini Ayarlar
         */
        setMeasureStyle: function(style) {
            this.measureStyle = style || 'cad';
            document.querySelectorAll('.sat-measure-style-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.style === this.measureStyle);
            });
            this.updateMeasureGraphics();
            this.saveLastLocation({
                measureData: this.getMeasureDataToSave()
            });
        },

        /**
         * 2D CAD Ölçüm Çizgisi Rengini Ayarlar
         */
        setMeasureColor: function(color) {
            if (!color) return;
            this.measureColor = color;
            this.syncAllColorPickersUI();
            this.updateMeasureGraphics();
            this.saveLastLocation({
                measureData: this.getMeasureDataToSave()
            });
        },

        /**
         * 2D ve 3D Modları Arasında Ölçüm Paneli ve Harita Araç Çubuğunu Dinamik Uyarlar
         */
        updateUIModeFor2D3D: function(is3D) {
            this.is3DActive = !!is3D;
            const panel = document.getElementById('satMeasureFloatingPanel');
            const headerTitle = document.getElementById('satMeasureHeaderTitle');
            const headerIcon = document.getElementById('satMeasureHeaderIcon');
            const modeSwitcher = document.getElementById('satMeasureModeSwitcher');
            const toggleParcelBtn = document.getElementById('satMeasureToggleParcelBtn');
            const notice3d = document.getElementById('satMeasure3dNotice');

            // 3D'de desteklenmeyen üst butonlar
            const labelsBtn = document.getElementById('satToggleLabelsBtn');
            const markerBtn = document.getElementById('satToggleMarkerBtn');
            const markerSettings = document.getElementById('satMarkerSettingsWrapper');
            const pinOverlay = document.getElementById('satMapPinOverlay');
            const reticleOverlay = document.getElementById('satReticleOverlay');

            if (this.is3DActive) {
                if (panel) {
                    panel.classList.add('sat-panel-mode-3d');
                }
                if (headerTitle) headerTitle.textContent = '3D Arsa & Çizgi Ayarları';
                if (headerIcon) headerIcon.className = 'fas fa-cube';
                if (modeSwitcher) modeSwitcher.style.display = 'none';
                if (toggleParcelBtn) toggleParcelBtn.style.display = 'none';
                if (notice3d) notice3d.style.display = 'flex';

                // 2D'ye özel satırları gizle
                document.querySelectorAll('.sat-2d-only-row').forEach(el => {
                    el.style.display = 'none';
                });

                // 3D'de desteklenmeyen araçları gizle
                if (labelsBtn) labelsBtn.style.display = 'none';
                if (markerBtn) markerBtn.style.display = 'none';
                if (markerSettings) markerSettings.style.display = 'none';
                if (pinOverlay) pinOverlay.style.display = 'none';
                if (reticleOverlay) reticleOverlay.style.display = 'none';
            } else {
                if (panel) {
                    panel.classList.remove('sat-panel-mode-3d');
                }
                if (headerTitle) headerTitle.textContent = 'Ölçüm & Alan';
                if (headerIcon) headerIcon.className = 'fas fa-ruler-combined';
                if (modeSwitcher) modeSwitcher.style.display = 'inline-flex';
                if (toggleParcelBtn) toggleParcelBtn.style.display = 'inline-flex';
                if (notice3d) notice3d.style.display = 'none';

                // 2D satırlarını geri göster
                document.querySelectorAll('.sat-2d-only-row').forEach(el => {
                    if (el.id === 'satMeasureRowSnapAll' || el.id === 'satMeasureRowEdgeNav') {
                        // Parsel kilitleme butonları updateParcelSnapButtons ile yönetilir
                    } else if (el.id === 'satMeasureSubStats') {
                        // Sub stats kendi durumuna göre açılır
                    } else {
                        el.style.display = '';
                    }
                });

                // Üst butonları geri göster
                if (labelsBtn) labelsBtn.style.display = '';
                if (markerBtn) markerBtn.style.display = '';
                if (this.markerEnabled) {
                    if (pinOverlay) pinOverlay.style.display = 'flex';
                    if (reticleOverlay) reticleOverlay.style.display = 'flex';
                }
            }

            this.syncAllColorPickersUI();
        },

        /**
         * Tüm Harita Arayüzündeki (Panel, Çekmece, Rozet Popover) Renk Seçicileri Senkronize Eder
         */
        syncAllColorPickersUI: function() {
            const strokeColorLower = (this.parcelStrokeColor || '#ffffff').toLowerCase();
            const neonColorLower = (this.parcelNeonColor || '#00CEC9').toLowerCase();
            const fillColorLower = (this.parcelFillColor || '#f59e0b').toLowerCase();
            const cadColorLower = (this.measureColor || '#f59e0b').toLowerCase();
            const fillMode = this.parcelFillMode || 'white';
            const isNeon = !!this.parcelNeonEnabled;

            // =====================================
            // 1. Kenar Çizgisi Rengi & Kalınlığı
            // =====================================
            let matchedStroke = false;
            document.querySelectorAll('.sat-stroke-dot').forEach(dot => {
                const isMatch = dot.dataset.color && dot.dataset.color.toLowerCase() === strokeColorLower;
                dot.classList.toggle('active', isMatch);
                if (isMatch) matchedStroke = true;
            });
            const strokeCustomLabel = document.getElementById('satStrokeCustomLabel');
            const strokeCustomInput = document.getElementById('satStrokeCustomInput');
            if (strokeCustomLabel) {
                strokeCustomLabel.classList.toggle('active', !matchedStroke);
                if (!matchedStroke) {
                    strokeCustomLabel.style.color = this.parcelStrokeColor || '#ffffff';
                    strokeCustomLabel.style.borderColor = this.parcelStrokeColor || '#ffffff';
                } else {
                    strokeCustomLabel.style.color = '';
                    strokeCustomLabel.style.borderColor = '';
                }
            }
            if (strokeCustomInput && typeof this.parcelStrokeColor === 'string' && this.parcelStrokeColor.startsWith('#')) {
                strokeCustomInput.value = this.parcelStrokeColor;
            }

            // Çekmece Sınır Çizgisi Noktaları
            document.querySelectorAll('.sat-stroke-color-picks .sat-color-dot-sm').forEach(dot => {
                const bg = (dot.style.background || '').toLowerCase();
                dot.classList.toggle('active', bg.includes(strokeColorLower));
            });
            const drawerStrokeCustom = document.getElementById('satParcelStrokeCustom');
            if (drawerStrokeCustom && typeof this.parcelStrokeColor === 'string' && this.parcelStrokeColor.startsWith('#')) {
                drawerStrokeCustom.value = this.parcelStrokeColor;
            }

            // Çizgi Kalınlığı Slider ve Değerleri
            const strokeWidthVal = this.parcelStrokeWidth || 3;
            const mStrokeText = document.getElementById('satMeasureStrokeWidthText');
            if (mStrokeText) mStrokeText.textContent = `${strokeWidthVal}px`;
            const mStrokeSlider = document.getElementById('satMeasureStrokeWidthSlider');
            if (mStrokeSlider && parseFloat(mStrokeSlider.value) !== strokeWidthVal) mStrokeSlider.value = strokeWidthVal;
            const drawerStrokeVal = document.getElementById('satParcelStrokeWidthVal');
            if (drawerStrokeVal) drawerStrokeVal.textContent = `${strokeWidthVal}px`;
            const drawerStrokeSlider = document.getElementById('satParcelStrokeWidthSlider');
            if (drawerStrokeSlider && parseFloat(drawerStrokeSlider.value) !== strokeWidthVal) drawerStrokeSlider.value = strokeWidthVal;
            const popoverStrokeVal = document.getElementById('satPopoverStrokeVal');
            if (popoverStrokeVal) popoverStrokeVal.textContent = `${strokeWidthVal}px`;
            const popoverStrokeSlider = document.getElementById('satPopoverStrokeSlider');
            if (popoverStrokeSlider && parseFloat(popoverStrokeSlider.value) !== strokeWidthVal) popoverStrokeSlider.value = strokeWidthVal;

            // =====================================
            // 2. ⚡ Saber Neon Parlama Hattı
            // =====================================
            const neonToggleBtn = document.getElementById('satMeasureNeonToggleBtn');
            if (neonToggleBtn) {
                neonToggleBtn.classList.toggle('active', isNeon);
                const activeNeonColor = this.parcelStrokeColor || '#00CEC9';
                neonToggleBtn.style.borderColor = isNeon ? activeNeonColor : '#475569';
                neonToggleBtn.style.color = isNeon ? activeNeonColor : '#94a3b8';
                neonToggleBtn.style.boxShadow = isNeon ? `0 0 10px ${activeNeonColor}55` : 'none';
                neonToggleBtn.innerHTML = `<i class="fas fa-bolt"></i> Neon: <b>${isNeon ? 'Açık' : 'Kapalı'}</b>`;
            }

            // Çekmece & Popover Neon Kontrolleri
            const drawerNeonToggle = document.getElementById('satDrawerNeonToggleBtn');
            const drawerNeonText = document.getElementById('satDrawerNeonToggleText');
            const drawerNeonDetails = document.getElementById('satDrawerNeonDetails');
            if (drawerNeonToggle) drawerNeonToggle.classList.toggle('active', isNeon);
            if (drawerNeonText) drawerNeonText.textContent = isNeon ? 'Açık' : 'Kapalı';
            if (drawerNeonDetails) drawerNeonDetails.style.display = isNeon ? 'block' : 'none';
            document.querySelectorAll('#satDrawerNeonDetails .sat-color-dot-sm').forEach(dot => {
                const bg = (dot.style.background || '').toLowerCase();
                dot.classList.toggle('active', bg.includes(neonColorLower));
            });
            const drawerNeonCustom = document.getElementById('satDrawerNeonColorCustom');
            if (drawerNeonCustom && typeof this.parcelNeonColor === 'string' && this.parcelNeonColor.startsWith('#')) {
                drawerNeonCustom.value = this.parcelNeonColor;
            }

            const popoverNeonToggle = document.getElementById('satPopoverNeonToggle');
            if (popoverNeonToggle) {
                popoverNeonToggle.classList.toggle('active', isNeon);
                popoverNeonToggle.style.borderColor = isNeon ? (this.parcelNeonColor || '#00CEC9') : '#475569';
                popoverNeonToggle.style.color = isNeon ? (this.parcelNeonColor || '#00CEC9') : '#94a3b8';
                popoverNeonToggle.innerHTML = `<i class="fas fa-bolt"></i> Neon: <b>${isNeon ? 'Açık' : 'Kapalı'}</b>`;
            }
            document.querySelectorAll('.sat-popover-color-dot').forEach(dot => {
                const isMatch = dot.dataset.color && dot.dataset.color.toLowerCase() === neonColorLower;
                dot.classList.toggle('active', isMatch);
            });
            const popoverCustom = document.getElementById('satPopoverCustomColor');
            if (popoverCustom && typeof this.parcelNeonColor === 'string' && this.parcelNeonColor.startsWith('#')) {
                popoverCustom.value = this.parcelNeonColor;
            }

            const topNeonBtn = document.getElementById('satToggleNeonBtn');
            const topNeonStatus = document.getElementById('satNeonStatusText');
            if (topNeonBtn) topNeonBtn.classList.toggle('active', isNeon);
            if (topNeonStatus) topNeonStatus.textContent = isNeon ? 'Açık' : 'Kapalı';

            const floatNeonBtn = document.getElementById('satFloatNeonBtn');
            if (floatNeonBtn) {
                floatNeonBtn.classList.toggle('active', isNeon);
                floatNeonBtn.style.borderColor = isNeon ? (this.parcelNeonColor || '#00CEC9') : 'rgba(255, 255, 255, 0.15)';
                floatNeonBtn.style.color = isNeon ? (this.parcelNeonColor || '#00CEC9') : '#cbd5e1';
            }

            // =====================================
            // 3. 🎨 Arsa Zemin Dolgusu
            // =====================================
            document.querySelectorAll('#satMeasureFillModeChips .sat-measure-chip[data-fill]').forEach(chip => {
                chip.classList.toggle('active', chip.dataset.fill === fillMode);
            });
            const fillPalette = document.getElementById('satFillColorPalette');
            if (fillPalette) {
                fillPalette.style.display = 'flex';
                fillPalette.style.opacity = (fillMode === 'nofill') ? '0.5' : '1';
            }
            let matchedFill = false;
            document.querySelectorAll('.sat-fill-dot').forEach(dot => {
                let isMatch = false;
                if (fillMode === 'white') {
                    isMatch = dot.dataset.color && dot.dataset.color.toLowerCase() === '#ffffff';
                } else if (fillMode === 'color') {
                    isMatch = dot.dataset.color && dot.dataset.color.toLowerCase() === fillColorLower;
                }
                dot.classList.toggle('active', isMatch);
                if (isMatch) matchedFill = true;
            });
            const fillCustomLabel = document.getElementById('satFillCustomLabel');
            const fillCustomInput = document.getElementById('satFillCustomInput');
            if (fillCustomLabel) {
                const isCustomActive = (fillMode === 'color' && !matchedFill);
                fillCustomLabel.classList.toggle('active', isCustomActive);
                if (isCustomActive) {
                    fillCustomLabel.style.color = this.parcelFillColor || '#f59e0b';
                    fillCustomLabel.style.borderColor = this.parcelFillColor || '#f59e0b';
                } else {
                    fillCustomLabel.style.color = '';
                    fillCustomLabel.style.borderColor = '';
                }
            }
            if (fillCustomInput && typeof this.parcelFillColor === 'string' && this.parcelFillColor.startsWith('#')) {
                fillCustomInput.value = this.parcelFillColor;
            }

            // Çekmece Dolgu Elemanları
            document.querySelectorAll('#satFillModeBtns .sat-fill-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === fillMode);
            });
            const drawerFillGroup = document.getElementById('satParcelColorGroup');
            if (drawerFillGroup) {
                drawerFillGroup.style.display = (fillMode === 'color') ? 'block' : 'none';
            }
            document.querySelectorAll('#satParcelColorPalette .sat-color-dot').forEach(dot => {
                const bg = (dot.style.background || '').toLowerCase();
                dot.classList.toggle('active', bg.includes(fillColorLower));
            });
            const drawerFillCustom = document.getElementById('satParcelColorCustom');
            if (drawerFillCustom && typeof this.parcelFillColor === 'string' && this.parcelFillColor.startsWith('#')) {
                drawerFillCustom.value = this.parcelFillColor;
            }

            // Popover Dolgu Butonları
            document.querySelectorAll('.sat-fill-btn[onclick*="setParcelFillMode"]').forEach(btn => {
                const isMatch = (btn.getAttribute('onclick') || '').includes(`'${fillMode}'`);
                btn.classList.toggle('active', isMatch);
            });

            // Dolgu Saydamlığı (Slider & Text)
            const opPct = Math.round((this.parcelFillOpacity !== undefined ? this.parcelFillOpacity : 0.40) * 100);
            const mOpText = document.getElementById('satMeasureFillOpacityText');
            if (mOpText) mOpText.textContent = `%${opPct}`;
            const mOpSlider = document.getElementById('satMeasureFillOpacitySlider');
            if (mOpSlider && parseInt(mOpSlider.value, 10) !== opPct) mOpSlider.value = opPct;
            const drawerOpVal = document.getElementById('satParcelOpacityVal');
            if (drawerOpVal) drawerOpVal.textContent = `%${opPct}`;
            const drawerOpSlider = document.getElementById('satParcelOpacitySlider');
            if (drawerOpSlider && parseInt(drawerOpSlider.value, 10) !== opPct) drawerOpSlider.value = opPct;
            const popoverOpVal = document.getElementById('satPopoverOpVal');
            if (popoverOpVal) popoverOpVal.textContent = `%${opPct}`;

            // =====================================
            // 4. 2D CAD Boyut / Mesafe Çizgisi Rengi
            // =====================================
            let matchedCad = false;
            document.querySelectorAll('#satCadColorPalette .sat-measure-color-dot').forEach(dot => {
                const isMatch = dot.dataset.color && dot.dataset.color.toLowerCase() === cadColorLower;
                dot.classList.toggle('active', isMatch);
                if (isMatch) matchedCad = true;
            });
            const cadCustomLabel = document.getElementById('satMeasureCustomColorLabel');
            const cadCustomInput = document.getElementById('satMeasureCustomColorInput');
            if (cadCustomLabel) {
                cadCustomLabel.classList.toggle('active', !matchedCad);
                if (!matchedCad) {
                    cadCustomLabel.style.color = this.measureColor || '#f59e0b';
                    cadCustomLabel.style.borderColor = this.measureColor || '#f59e0b';
                } else {
                    cadCustomLabel.style.color = '';
                    cadCustomLabel.style.borderColor = '';
                }
            }
            if (cadCustomInput && typeof this.measureColor === 'string' && this.measureColor.startsWith('#')) {
                cadCustomInput.value = this.measureColor;
            }
        },

        /**
         * WGS-84 Elipsoidi Yerel Teğet Düzlem Projeksiyonu ile Gerçek Poligon Alanını (m²) Hesaplar
         * Parsellerde kayan nokta hatası olmaksızın santimetre hassasiyetinde kadastro alanı verir.
         */
        calculateGeodesicPolygonArea: function(latLngs) {
            if (!latLngs || latLngs.length < 3) return 0;

            const pts = latLngs.map(ll => {
                const lat = Array.isArray(ll) ? ll[0] : ll.lat;
                const lng = Array.isArray(ll) ? ll[1] : ll.lng;
                return { lat: Number(lat), lng: Number(lng) };
            }).filter(p => !isNaN(p.lat) && !isNaN(p.lng));

            if (pts.length > 3) {
                const first = pts[0];
                const last = pts[pts.length - 1];
                if (Math.abs(first.lat - last.lat) < 1e-7 && Math.abs(first.lng - last.lng) < 1e-7) {
                    pts.pop();
                }
            }
            if (pts.length < 3) return 0;

            // Ağırlık merkezi (centroid) hesapla - yerel orijin
            let cLat = 0, cLng = 0;
            for (let i = 0; i < pts.length; i++) {
                cLat += pts[i].lat;
                cLng += pts[i].lng;
            }
            cLat /= pts.length;
            cLng /= pts.length;

            const radLat = (cLat * Math.PI) / 180;
            // WGS-84 Elipsoid Parametreleri
            const a = 6378137.0; // Yarı büyük eksen (m)
            const e2 = 0.00669437999014; // Birinci basıklık karesi (eccentricity squared)
            const sinLat = Math.sin(radLat);
            const w = Math.sqrt(1 - e2 * sinLat * sinLat);
            
            // Meridyen boyunca ve paralel boyunca 1 derecenin metre karşılığı
            const mLat = (Math.PI / 180) * (a * (1 - e2)) / (w * w * w);
            const mLng = (Math.PI / 180) * (a * Math.cos(radLat)) / w;

            // Gauss Shoelace Formülü
            let area2 = 0;
            const len = pts.length;
            for (let i = 0; i < len; i++) {
                const j = (i + 1) % len;
                const x1 = (pts[i].lng - cLng) * mLng;
                const y1 = (pts[i].lat - cLat) * mLat;
                const x2 = (pts[j].lng - cLng) * mLng;
                const y2 = (pts[j].lat - cLat) * mLat;
                area2 += (x1 * y2 - x2 * y1);
            }

            const area = Math.abs(area2) / 2.0;
            return isNaN(area) ? 0 : area;
        },

        /**
         * Poligonun Toplam Çevre Uzunluğunu (metre) Hesaplar
         */
        calculatePolygonPerimeter: function(latLngs, isClosed) {
            if (!latLngs || latLngs.length < 2) return 0;
            let total = 0;
            for (let i = 0; i < latLngs.length - 1; i++) {
                total += latLngs[i].distanceTo(latLngs[i + 1]);
            }
            if (isClosed && latLngs.length >= 3) {
                total += latLngs[latLngs.length - 1].distanceTo(latLngs[0]);
            }
            return total;
        },

        /**
         * Alanı Metrekare, Dönüm ve Hektar Olarak Formatlar
         */
        getFormattedAreaInfo: function(areaM2) {
            if (!areaM2 || areaM2 <= 0) {
                return { m2Text: '0 m²', donumText: '', subText: '', fullBadgeText: '0 m²' };
            }

            const m2Rounded = Math.round(areaM2);
            const m2Formatted = m2Rounded.toLocaleString('tr-TR') + ' m²';

            const donumVal = (areaM2 / 1000).toFixed(2).replace('.', ',');
            const donumFormatted = `${donumVal} Dönüm`;

            let subText = donumFormatted;
            if (areaM2 >= 10000) {
                const hektarVal = (areaM2 / 10000).toFixed(2).replace('.', ',');
                subText += ` (${hektarVal} Ha)`;
            }

            return {
                m2Text: m2Formatted,
                donumText: donumFormatted,
                subText: subText,
                fullBadgeText: `${m2Formatted} • ${donumFormatted}`
            };
        },

        /**
         * Poligon Noktalarının Ağırlık Merkezini (Centroid) Döndürür
         */
        getPolygonCentroid: function(latLngs) {
            if (!latLngs || latLngs.length === 0) return null;
            let sumLat = 0, sumLng = 0;
            latLngs.forEach(p => {
                sumLat += p.lat;
                sumLng += p.lng;
            });
            return L.latLng(sumLat / latLngs.length, sumLng / latLngs.length);
        },

        /**
         * Çizgi Hattının Toplam Mesafe Boyunca Tam Orta Noktasını Bulur
         */
        getPolylineMidpoint: function(latLngs, isClosed) {
            if (!latLngs || latLngs.length === 0) return null;
            if (latLngs.length === 1) return latLngs[0];
            if (latLngs.length === 2) {
                return L.latLng((latLngs[0].lat + latLngs[1].lat) / 2, (latLngs[0].lng + latLngs[1].lng) / 2);
            }
            const totalDist = this.calculatePolygonPerimeter(latLngs, isClosed);
            if (totalDist <= 0) return latLngs[0];
            const halfDist = totalDist / 2;
            let accumulated = 0;
            const count = isClosed ? latLngs.length : (latLngs.length - 1);
            for (let i = 0; i < count; i++) {
                const pA = latLngs[i];
                const pB = latLngs[(i + 1) % latLngs.length];
                const d = pA.distanceTo(pB);
                if (accumulated + d >= halfDist && d > 0) {
                    const remain = halfDist - accumulated;
                    const ratio = Math.max(0, Math.min(1, remain / d));
                    return L.latLng(
                        pA.lat + (pB.lat - pA.lat) * ratio,
                        pA.lng + (pB.lng - pA.lng) * ratio
                    );
                }
                accumulated += d;
            }
            return latLngs[Math.floor(latLngs.length / 2)];
        },

        /**
         * Aktif Ölçüm Çizimini Döndürür (Yoksa Varsayılan Çizim 1'i Başlatır)
         */
        getActiveDrawing: function() {
            if (!this.measureDrawings || !Array.isArray(this.measureDrawings) || this.measureDrawings.length === 0) {
                const initialPts = (Array.isArray(this.measurePoints) && this.measurePoints.length > 0) ? this.measurePoints : [];
                const d1 = {
                    id: 'draw_1',
                    title: 'Çizim 1',
                    visible: true,
                    isExpanded: true,
                    points: initialPts,
                    isClosed: (this.measureIsClosed !== undefined) ? this.measureIsClosed : (initialPts.length >= 3),
                    style: this.measureStyle || 'cad',
                    color: this.measureColor || '#f59e0b',
                    preset: this.measurePreset || 'frontage',
                    customText: this.measureCustomText || '',
                    distanceMode: 'edges', // 'edges' (ayrı kenarlar) | 'total' (toplam mesafe) | 'none'
                    showEdgeDistances: this.measureShowEdgeDistances !== false,
                    showArea: this.measureShowArea !== false,
                    showHandles: this.measureShowHandles !== false,
                    hiddenEdges: Object.assign({}, this.measureHiddenEdges || {}),
                    badgeCustomPositions: Object.assign({}, this.measureBadgeCustomPositions || {}),
                    totalBadgeCustomPos: null,
                    totalBadgeRotation: 0,
                    totalBadgeScale: 1.0,
                    totalBadgeSelected: false,
                    areaBadgeCustomPos: this.measureAreaBadgeCustomPos || null,
                    areaRotation: this.measureAreaRotation || 0,
                    areaScale: this.measureAreaScale || 1.0,
                    areaSelected: false,
                    areaDisplayMode: this.measureAreaDisplayMode || 'frameless',
                    areaContentMode: this.measureAreaContentMode || 'm2_only',
                    distanceMeters: this.measureDistanceMeters || 0,
                    areaM2: this.measureAreaM2 || 0,
                    perimeterMeters: this.measurePerimeterMeters || 0,
                    markers: Array.isArray(this.measureMarkers) ? this.measureMarkers : [],
                    lines: Array.isArray(this.measureLines) ? this.measureLines : [],
                    polygonLayer: this.measurePolygonLayer || null,
                    badgeMarkers: Array.isArray(this.measureBadgeMarkers) ? this.measureBadgeMarkers : [],
                    totalBadgeMarker: null,
                    areaBadgeMarker: this.measureAreaBadgeMarker || null
                };
                this.measureDrawings = [d1];
                this.activeDrawingId = 'draw_1';
            }
            let active = this.measureDrawings.find(d => d.id === this.activeDrawingId);
            if (!active) {
                active = this.measureDrawings[0];
                this.activeDrawingId = active.id;
            }
            // Geriye dönük uyumluluk: Tekil özellikler aktif çizim ile senkronize tutulur
            this.measurePoints = active.points;
            this.measureColor = active.color;
            this.measureStyle = active.style;
            this.measurePreset = active.preset;
            this.measureCustomText = active.customText;
            this.measureIsClosed = active.isClosed;
            this.measureDistanceMeters = active.distanceMeters;
            this.measureAreaM2 = active.areaM2;
            this.measurePerimeterMeters = active.perimeterMeters;
            this.measureDistanceMode = active.distanceMode || 'edges';
            this.measureShowEdgeDistances = active.showEdgeDistances;
            this.measureShowArea = active.showArea;
            this.measureShowHandles = active.showHandles;
            this.measureHiddenEdges = active.hiddenEdges;
            this.measureBadgeCustomPositions = active.badgeCustomPositions;
            this.measureAreaBadgeCustomPos = active.areaBadgeCustomPos;
            this.measureAreaRotation = active.areaRotation;
            this.measureAreaScale = active.areaScale;
            this.measureAreaDisplayMode = active.areaDisplayMode;
            this.measureAreaContentMode = active.areaContentMode;
            return active;
        },

        /**
         * Tüm Çizimleri Döndürür
         */
        getAllDrawings: function() {
            this.getActiveDrawing();
            return this.measureDrawings || [];
        },

        /**
         * En Az 2 Noktası Olan Görünür Çizim Var mı Kontrol Eder
         */
        hasVisibleDrawings: function() {
            if (!this.measureActive) return false;
            const drawings = this.getAllDrawings();
            return drawings.some(d => d.visible !== false && d.points && d.points.length >= 2);
        },

        /**
         * Yeni Bağımsız Çizim Ekler
         */
        addNewDrawing: function(options = {}) {
            this.getActiveDrawing();
            const count = this.measureDrawings.length + 1;
            const colorIdx = (count - 1) % this.DRAWING_COLORS.length;
            const color = options.color || this.DRAWING_COLORS[colorIdx] || '#00f5d4';
            const newId = 'draw_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

            // Önceki çizimlerin akordiyonlarını kapat
            this.measureDrawings.forEach(d => { d.isExpanded = false; });

            const newDrawing = {
                id: newId,
                title: options.title || `Çizim ${count}`,
                visible: true,
                isExpanded: true,
                points: options.points ? options.points.map(p => L.latLng(p.lat || p[0], p.lng || p[1])) : [],
                isClosed: options.isClosed !== undefined ? options.isClosed : false,
                style: options.style || 'cad',
                color: color,
                preset: options.preset || 'frontage',
                customText: options.customText || '',
                distanceMode: 'edges', // 'edges' | 'total' | 'none'
                showEdgeDistances: options.showEdgeDistances !== false,
                showArea: options.showArea !== false,
                showHandles: options.showHandles !== false,
                hiddenEdges: {},
                badgeCustomPositions: {},
                totalBadgeCustomPos: null,
                totalBadgeRotation: 0,
                totalBadgeScale: 1.0,
                totalBadgeSelected: false,
                areaBadgeCustomPos: null,
                areaRotation: 0,
                areaScale: 1.0,
                areaSelected: false,
                areaDisplayMode: 'frameless',
                areaContentMode: 'm2_only',
                distanceMeters: 0,
                areaM2: 0,
                perimeterMeters: 0,
                markers: [],
                lines: [],
                polygonLayer: null,
                badgeMarkers: [],
                totalBadgeMarker: null,
                areaBadgeMarker: null
            };

            this.measureDrawings.push(newDrawing);
            this.activeDrawingId = newId;

            if (!this.measureActive) {
                this.toggleMeasure(true);
            }
            this.setMeasureInteractionMode('draw');

            this.updateMeasureGraphics();
            this.renderDrawingsListUI();

            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`➕ ${newDrawing.title} eklendi. Haritada tıklayarak yeni noktaları belirleyin.`, 'success');
            }

            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
            return newDrawing;
        },

        /**
         * Belirtilen Çizimi Aktif Olarak Seçer
         */
        selectDrawing: function(id) {
            const drawing = this.measureDrawings.find(d => d.id === id);
            if (!drawing) return;
            this.activeDrawingId = id;
            drawing.isExpanded = true;
            this.updateMeasureGraphics();
            this.renderDrawingsListUI();
            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`📍 ${drawing.title} seçildi.`, 'info');
            }
        },

        /**
         * Çizimi Siler
         */
        deleteDrawing: function(id) {
            if (!this.measureDrawings || this.measureDrawings.length <= 1) {
                this.resetDrawingPoints(id);
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('ℹ️ Çizim sıfırlandı.', 'info');
                }
                return;
            }
            const idx = this.measureDrawings.findIndex(d => d.id === id);
            if (idx === -1) return;
            const removed = this.measureDrawings.splice(idx, 1)[0];
            this.removeLayersForDrawing(removed);

            if (this.activeDrawingId === id) {
                const newActive = this.measureDrawings[Math.max(0, idx - 1)] || this.measureDrawings[0];
                this.activeDrawingId = newActive.id;
                newActive.isExpanded = true;
            }

            this.updateMeasureGraphics();
            this.renderDrawingsListUI();
            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`🗑️ ${removed.title} silindi.`, 'info');
            }
            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
        },

        /**
         * Çizimin Harita/Şablon Görünürlüğünü Açıp Kapatır
         */
        toggleDrawingVisibility: function(id) {
            const drawing = this.measureDrawings.find(d => d.id === id);
            if (!drawing) return;
            drawing.visible = (drawing.visible === false) ? true : false;
            if (!drawing.visible) {
                this.removeLayersForDrawing(drawing);
            }
            this.updateMeasureGraphics();
            this.renderDrawingsListUI();
            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`${drawing.visible ? '👁️' : '🚫'} ${drawing.title} ${drawing.visible ? 'gösterildi' : 'gizlendi'}.`, 'info');
            }
            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
        },

        /**
         * Çizim Akordiyonunu Açar / Kapatır
         */
        toggleDrawingAccordion: function(id) {
            const drawing = this.measureDrawings.find(d => d.id === id);
            if (!drawing) return;
            drawing.isExpanded = !drawing.isExpanded;
            this.renderDrawingsListUI();
        },

        /**
         * Çizimin Leaflet Harita Katmanlarını Temizler
         */
        removeLayersForDrawing: function(drawing) {
            if (!drawing || !this.map) return;
            if (Array.isArray(drawing.markers)) {
                drawing.markers.forEach(m => { if (m && this.map.hasLayer(m)) this.map.removeLayer(m); });
                drawing.markers = [];
            }
            if (Array.isArray(drawing.lines)) {
                drawing.lines.forEach(l => { if (l && this.map.hasLayer(l)) this.map.removeLayer(l); });
                drawing.lines = [];
            }
            if (drawing.polygonLayer && this.map.hasLayer(drawing.polygonLayer)) {
                this.map.removeLayer(drawing.polygonLayer);
                drawing.polygonLayer = null;
            }
            if (Array.isArray(drawing.badgeMarkers)) {
                drawing.badgeMarkers.forEach(b => { if (b && this.map.hasLayer(b)) this.map.removeLayer(b); });
                drawing.badgeMarkers = [];
            }
            if (drawing.totalBadgeMarker && this.map.hasLayer(drawing.totalBadgeMarker)) {
                this.map.removeLayer(drawing.totalBadgeMarker);
                drawing.totalBadgeMarker = null;
            }
            if (drawing.areaBadgeMarker && this.map.hasLayer(drawing.areaBadgeMarker)) {
                this.map.removeLayer(drawing.areaBadgeMarker);
                drawing.areaBadgeMarker = null;
            }
        },

        /**
         * Çizimin Kapalı Poligon / Açık Çizgi Durumunu Değiştirir
         */
        toggleDrawingClosed: function(id) {
            const drawing = id ? this.measureDrawings.find(d => d.id === id) : this.getActiveDrawing();
            if (!drawing) return;
            if (!drawing.points || drawing.points.length < 3) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('ℹ️ Alanı kapatmak için en az 3 nokta gereklidir.', 'info');
                }
                return;
            }
            drawing.isClosed = !drawing.isClosed;
            this.updateMeasureGraphics();
            this.renderDrawingsListUI();
            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
        },

        /**
         * Çizimdeki Son Eklenen Noktayı Geri Alır
         */
        undoLastPointForDrawing: function(id) {
            const drawing = id ? this.measureDrawings.find(d => d.id === id) : this.getActiveDrawing();
            if (!drawing || !drawing.points || drawing.points.length === 0) return;
            drawing.points.pop();
            if (drawing.points.length < 3) {
                drawing.isClosed = false;
            }
            this.updateMeasureGraphics();
            this.renderDrawingsListUI();
            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`↩️ ${drawing.title}: Son nokta geri alındı.`, 'info');
            }
        },

        /**
         * Çizimdeki Tüm Noktaları Sıfırlar
         */
        resetDrawingPoints: function(id) {
            const drawing = id ? this.measureDrawings.find(d => d.id === id) : this.getActiveDrawing();
            if (!drawing) return;
            drawing.points = [];
            drawing.distanceMeters = 0;
            drawing.areaM2 = 0;
            drawing.perimeterMeters = 0;
            drawing.isClosed = false;
            drawing.badgeCustomPositions = {};
            drawing.totalBadgeCustomPos = null;
            drawing.totalBadgeRotation = 0;
            drawing.totalBadgeScale = 1.0;
            drawing.totalBadgeSelected = false;
            drawing.areaBadgeCustomPos = null;
            drawing.areaRotation = 0;
            drawing.areaScale = 1.0;
            drawing.areaSelected = false;
            this.removeLayersForDrawing(drawing);
            this.updateMeasureGraphics();
            this.renderDrawingsListUI();
            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
        },

        /**
         * Çizimi Yüklü TKGM Parseline Kilitler
         */
        snapDrawingToParcel: function(id) {
            const drawing = id ? this.measureDrawings.find(d => d.id === id) : this.getActiveDrawing();
            if (!drawing) return;
            if (!this.parcelData || !this.parcelData.latLngs || this.parcelData.latLngs.length < 3) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('⚠️ Parseli çevrelemek için önce KML / GeoJSON parseli yükleyin.', 'warning');
                }
                return;
            }
            const cleanPts = [];
            this.parcelData.latLngs.forEach((p, idx) => {
                const lat = Array.isArray(p) ? p[0] : p.lat;
                const lng = Array.isArray(p) ? p[1] : p.lng;
                if (idx > 0) {
                    const prev = cleanPts[cleanPts.length - 1];
                    if (Math.abs(lat - prev.lat) < 1e-7 && Math.abs(lng - prev.lng) < 1e-7) return;
                }
                cleanPts.push(L.latLng(lat, lng));
            });
            if (cleanPts.length > 2) {
                const first = cleanPts[0];
                const last = cleanPts[cleanPts.length - 1];
                if (Math.abs(first.lat - last.lat) < 1e-7 && Math.abs(first.lng - last.lng) < 1e-7) {
                    cleanPts.pop();
                }
            }
            drawing.points = cleanPts;
            drawing.isClosed = true;
            this.updateMeasureGraphics();
            this.renderDrawingsListUI();
            if (this.map) {
                const bounds = L.latLngBounds(drawing.points);
                this.map.panInsideBounds(bounds, { animate: true, padding: [40, 40] });
            }
            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
            if (typeof window.showAppToast === 'function') {
                const area = this.calculateGeodesicPolygonArea(drawing.points);
                const areaInfo = this.getFormattedAreaInfo(area);
                window.showAppToast(`📐 ${drawing.title}: Parsel çevrelendi (${cleanPts.length} köşe, ${areaInfo.m2Text}).`, 'success');
            }
        },

        setDrawingStyle: function(id, style) {
            const d = this.measureDrawings.find(x => x.id === id);
            if (d) {
                d.style = style;
                this.updateMeasureGraphics();
                this.renderDrawingsListUI();
                this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
            }
        },

        setDrawingColor: function(id, color) {
            const d = this.measureDrawings.find(x => x.id === id);
            if (d) {
                d.color = color;
                this.updateMeasureGraphics();
                this.renderDrawingsListUI();
                this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
            }
        },

        setDrawingPreset: function(id, preset) {
            const d = this.measureDrawings.find(x => x.id === id);
            if (d) {
                d.preset = preset;
                this.updateMeasureGraphics();
                this.renderDrawingsListUI();
                this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
            }
        },

        setDrawingCustomText: function(id, text) {
            const d = this.measureDrawings.find(x => x.id === id);
            if (d) {
                d.customText = (typeof text === 'string') ? text : '';
                this.updateMeasureGraphics();
                this.renderDrawingsListUI();
                this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
            }
        },

        setDrawingAreaDisplayMode: function(id, mode) {
            const d = this.measureDrawings.find(x => x.id === id);
            if (d) {
                d.areaDisplayMode = mode;
                this.updateMeasureGraphics();
                this.renderDrawingsListUI();
                this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
            }
        },

        setDrawingAreaContentMode: function(id, mode) {
            const d = this.measureDrawings.find(x => x.id === id);
            if (d) {
                d.areaContentMode = mode;
                this.updateMeasureGraphics();
                this.renderDrawingsListUI();
                this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
            }
        },

        setDrawingDistanceDisplay: function(id, targetMode) {
            const d = this.measureDrawings.find(x => x.id === id);
            if (!d) return;
            const currentMode = d.distanceMode || (d.showEdgeDistances !== false ? 'edges' : 'none');
            if (currentMode === targetMode) {
                // Tıklanan mod zaten aktifse ikisini de kapat (gizle)
                d.distanceMode = 'none';
                d.showEdgeDistances = false;
            } else {
                d.distanceMode = targetMode;
                if (targetMode === 'total') {
                    d.showEdgeDistances = false;
                } else if (targetMode === 'edges') {
                    d.showEdgeDistances = true;
                } else {
                    d.showEdgeDistances = false;
                }
            }
            this.updateMeasureGraphics();
            this.renderDrawingsListUI();
            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
        },

        toggleDrawingEdgeDistances: function(id) {
            this.setDrawingDistanceDisplay(id, 'edges');
        },

        toggleDrawingAreaBadge: function(id) {
            const d = this.measureDrawings.find(x => x.id === id);
            if (d) {
                d.showArea = (d.showArea === false) ? true : false;
                this.updateMeasureGraphics();
                this.renderDrawingsListUI();
                this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
            }
        },

        toggleDrawingHandles: function(id) {
            const d = this.measureDrawings.find(x => x.id === id);
            if (d) {
                d.showHandles = (d.showHandles === false) ? true : false;
                this.updateMeasureGraphics();
                this.renderDrawingsListUI();
                this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
            }
        },

        toggleDrawingSingleEdge: function(id, edgeIdx, e) {
            if (e && e.stopPropagation) e.stopPropagation();
            const d = this.measureDrawings.find(x => x.id === id);
            if (!d) return;
            d.hiddenEdges = d.hiddenEdges || {};
            d.hiddenEdges[edgeIdx] = !d.hiddenEdges[edgeIdx];
            this.updateMeasureGraphics();
            this.renderDrawingsListUI();
            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
        },

        /**
         * Çizimler Akordiyon Listesini Panel Üzerinde Dinamik Render Eder
         */
        renderDrawingsListUI: function() {
            const listEl = document.getElementById('satMeasureDrawingsList');
            if (!listEl) return;
            const drawings = this.getAllDrawings();
            if (drawings.length === 0) {
                listEl.innerHTML = `
                    <div style="padding:10px; text-align:center; color:#94a3b8; font-size:11px; background:rgba(0,0,0,0.3); border-radius:8px;">
                        Henüz çizim eklenmedi. Yukarıdaki <b>"Yeni Çizim Ekle"</b> butonuna basarak başlayabilirsiniz.
                    </div>
                `;
                return;
            }

            let html = '';
            drawings.forEach((drawing, idx) => {
                const isActive = (drawing.id === this.activeDrawingId);
                const pts = drawing.points || [];
                const isClosed = drawing.isClosed && (pts.length >= 3);
                const perimeter = drawing.perimeterMeters || (pts.length >= 2 ? this.calculatePolygonPerimeter(pts, isClosed) : 0);
                const areaM2 = drawing.areaM2 || (isClosed ? this.calculateGeodesicPolygonArea(pts) : 0);
                const dist = drawing.distanceMeters || (pts.length === 2 ? pts[0].distanceTo(pts[1]) : perimeter);
                const areaInfo = this.getFormattedAreaInfo(areaM2);

                let valText = '0.0 m';
                let typeBadge = 'Mesafe';
                let subStatsHtml = '';
                let hintText = 'Haritaya tıklayarak yeni noktalar ekleyin';

                if (pts.length === 0) {
                    valText = '0.0 m';
                    hintText = 'Haritaya tıklayarak ilk noktayı ekleyin';
                } else if (pts.length === 1) {
                    valText = '0.0 m';
                    hintText = '2. noktaya tıklayarak çizgiyi oluşturun';
                } else if (pts.length === 2) {
                    valText = this.getFormattedMeasureText(dist, false, drawing.preset, drawing.customText, drawing.distanceMode === 'total');
                    hintText = '3. noktaya tıklayarak alanı çevreleyebilir veya uçlardan sürükleyebilirsiniz';
                } else {
                    if (isClosed) {
                        typeBadge = 'Alan';
                        valText = `${areaInfo.m2Text} (${areaInfo.donumText})`;
                        const perimStr = (perimeter >= 1000) ? (perimeter / 1000).toFixed(2) + ' km' : Math.round(perimeter) + ' m';
                        subStatsHtml = `
                            <div class="sat-measure-sub-stats">
                                <span><i class="fas fa-arrows-split-up-and-left"></i> Çevre: <b>${perimStr}</b></span>
                                <span><i class="fas fa-draw-polygon"></i> <b>${pts.length} Kenar</b></span>
                            </div>`;
                        hintText = 'Köşeleri sürükleyerek arsayı düzenleyin veya kenarlara tıklayarak yeni köşe ekleyin';
                    } else {
                        typeBadge = 'Açık Sınır';
                        const perimStr = (perimeter >= 1000) ? (perimeter / 1000).toFixed(2) + ' km' : Math.round(perimeter) + ' m';
                        valText = `Toplam Uzunluk: ${perimStr}`;
                        subStatsHtml = `
                            <div class="sat-measure-sub-stats">
                                <span><i class="fas fa-bezier-curve"></i> <b>${pts.length} Noktalı Çizgi</b></span>
                            </div>`;
                        hintText = 'Alanı kapatmak için "Alanı Kapat" butonuna veya ilk noktaya tıklayın';
                    }
                }

                const colorPalette = ['#f59e0b', '#00f5d4', '#0ea5e9', '#ef4444', '#10b981', '#a855f7', '#ffffff'];
                const colorsHtml = colorPalette.map(c => `
                    <button type="button" class="sat-measure-color-dot ${drawing.color.toLowerCase() === c.toLowerCase() ? 'active' : ''}" style="background:${c};" onclick="window.setSatelliteDrawingColor('${drawing.id}', '${c}')"></button>
                `).join('');

                const hasParcel = !!(this.parcelData && this.parcelData.latLngs && this.parcelData.latLngs.length >= 3);

                html += `
                    <div class="sat-drawing-card ${isActive ? 'is-active' : ''} ${drawing.isExpanded ? 'is-expanded' : 'is-collapsed'}" data-drawing-id="${drawing.id}">
                        <div class="sat-drawing-header" onclick="window.selectSatelliteDrawing('${drawing.id}')">
                            <div class="sat-drawing-header-left">
                                <span class="sat-drawing-dot" style="background:${drawing.color}; box-shadow: 0 0 6px ${drawing.color}aa;"></span>
                                <span class="sat-drawing-title" title="${this.escapeHtml(drawing.title)}">${this.escapeHtml(drawing.title)}</span>
                                <span class="sat-drawing-type-pill ${isClosed ? 'poly' : 'line'}">${typeBadge}</span>
                            </div>
                            <div class="sat-drawing-header-actions" onclick="event.stopPropagation()">
                                <button type="button" class="sat-drawing-act-btn vis ${drawing.visible !== false ? '' : 'muted'}" onclick="window.toggleSatelliteDrawingVisibility('${drawing.id}')" title="${drawing.visible !== false ? 'Haritada ve Şablonda Gizle' : 'Haritada ve Şablonda Göster'}">
                                     <i class="fas fa-${drawing.visible !== false ? 'eye' : 'eye-slash'}"></i>
                                </button>
                                ${drawings.length > 1 ? `
                                <button type="button" class="sat-drawing-act-btn del" onclick="window.deleteSatelliteDrawing('${drawing.id}')" title="Bu Çizimi Sil">
                                    <i class="fas fa-trash-alt"></i>
                                </button>` : ''}
                                <button type="button" class="sat-drawing-act-btn toggle" onclick="window.toggleSatelliteDrawingAccordion('${drawing.id}')" title="Ayarları Aç / Kapat">
                                    <i class="fas fa-chevron-${drawing.isExpanded ? 'up' : 'down'}"></i>
                                </button>
                            </div>
                        </div>

                        ${drawing.isExpanded ? `
                        <div class="sat-drawing-body">
                            <!-- Canlı Mesafe & Alan Göstergesi -->
                            <div class="sat-measure-display-box">
                                <div class="sat-measure-val">${valText}</div>
                                ${subStatsHtml}
                                <div class="sat-measure-hint">${hintText}</div>
                            </div>

                            <!-- Hızlı Eylemler (Parsel Kilidi & Kapat/Geri Al/Temizle) -->
                            ${hasParcel ? `
                            <div class="sat-measure-actions-bar full-row" style="margin-bottom:4px;">
                                <button type="button" class="sat-measure-act-btn snap-all" onclick="window.snapSatelliteDrawingToParcel('${drawing.id}')" title="Yüklü parselin tüm sınırlarını bu çizime kilitler">
                                    <i class="fas fa-vector-square"></i> <span>📐 Tüm Parseli Çevrele</span>
                                </button>
                            </div>` : ''}

                            <div class="sat-measure-actions-bar second-row" style="margin-bottom:6px;">
                                <button type="button" class="sat-measure-act-btn close-poly" onclick="window.toggleSatelliteDrawingClosed('${drawing.id}')" title="Alanı kapat veya açık çizgiye dönüştür">
                                    <i class="fas fa-object-group"></i> <span>${isClosed ? 'Açık Çizgi Yap' : 'Alanı Kapat'}</span>
                                </button>
                                <button type="button" class="sat-measure-act-btn undo" onclick="window.undoSatelliteDrawingLastPoint('${drawing.id}')" title="Son eklenen noktayı geri al">
                                    <i class="fas fa-rotate-left"></i> <span>Geri Al</span>
                                </button>
                                <button type="button" class="sat-measure-act-btn reset" onclick="window.resetSatelliteDrawingPoints('${drawing.id}')" title="Bu çizimdeki tüm noktaları temizle">
                                    <i class="fas fa-trash-alt"></i> <span>Temizle</span>
                                </button>
                            </div>

                            <!-- Çizim Rengi Paleti -->
                            <div class="sat-measure-row" style="margin-bottom:4px;">
                                <div class="sat-measure-sub-row">
                                    <label class="sat-measure-label"><i class="fas fa-palette" style="color:${drawing.color}; margin-right:4px;"></i> Çizim Rengi:</label>
                                    <div class="sat-measure-colors">
                                        ${colorsHtml}
                                        <label class="sat-measure-color-custom-btn" title="Özel Renk Seçici">
                                            <i class="fas fa-eye-dropper"></i>
                                            <input type="color" value="${drawing.color}" oninput="window.setSatelliteDrawingColor('${drawing.id}', this.value)">
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- CAD Stili -->
                            <div class="sat-measure-row" style="margin-bottom:4px;">
                                <div class="sat-measure-sub-row">
                                    <label class="sat-measure-label">CAD Stili:</label>
                                    <div class="sat-measure-style-pills">
                                        <button type="button" class="sat-measure-style-btn ${drawing.style === 'cad' ? 'active' : ''}" onclick="window.setSatelliteDrawingStyle('${drawing.id}', 'cad')">📐 CAD</button>
                                        <button type="button" class="sat-measure-style-btn ${drawing.style === 'neon' ? 'active' : ''}" onclick="window.setSatelliteDrawingStyle('${drawing.id}', 'neon')">⚡ Neon</button>
                                        <button type="button" class="sat-measure-style-btn ${drawing.style === 'arrow' ? 'active' : ''}" onclick="window.setSatelliteDrawingStyle('${drawing.id}', 'arrow')">🏹 Ok</button>
                                        <button type="button" class="sat-measure-style-btn ${drawing.style === 'dashed' ? 'active' : ''}" onclick="window.setSatelliteDrawingStyle('${drawing.id}', 'dashed')">〰️ Kesikli</button>
                                    </div>
                                </div>
                            </div>

                            <!-- Hızlı Metin Şablonları -->
                            <div class="sat-measure-row" style="margin-bottom:4px;">
                                <label class="sat-measure-label">Etiket Şablonu:</label>
                                <div class="sat-measure-chips">
                                    <button type="button" class="sat-measure-chip ${drawing.preset === 'frontage' ? 'active' : ''}" onclick="window.setSatelliteDrawingPreset('${drawing.id}', 'frontage')">Yola Cephe</button>
                                    <button type="button" class="sat-measure-chip ${drawing.preset === 'road_dist' ? 'active' : ''}" onclick="window.setSatelliteDrawingPreset('${drawing.id}', 'road_dist')">Yola Mesafe</button>
                                    <button type="button" class="sat-measure-chip ${drawing.preset === 'front' ? 'active' : ''}" onclick="window.setSatelliteDrawingPreset('${drawing.id}', 'front')">Ön Cephe</button>
                                    <button type="button" class="sat-measure-chip ${drawing.preset === 'depth' ? 'active' : ''}" onclick="window.setSatelliteDrawingPreset('${drawing.id}', 'depth')">Derinlik</button>
                                    <button type="button" class="sat-measure-chip ${drawing.preset === 'setback' ? 'active' : ''}" onclick="window.setSatelliteDrawingPreset('${drawing.id}', 'setback')">Yol Terki</button>
                                    <button type="button" class="sat-measure-chip ${drawing.preset === 'distance_only' ? 'active' : ''}" onclick="window.setSatelliteDrawingPreset('${drawing.id}', 'distance_only')">Sadece Metre</button>
                                </div>
                            </div>

                            <!-- Özel Metin Girişi -->
                            <div class="sat-measure-row" style="margin-bottom:4px;">
                                <input type="text" class="sat-measure-text-input" placeholder="Özel etiket metni (örn: Yola 50 m)..." value="${this.escapeHtml(drawing.customText || '')}" oninput="window.setSatelliteDrawingCustomText('${drawing.id}', this.value)">
                            </div>

                            <!-- Arsa Alanı Gösterimi (Eğer 3+ nokta ve kapalıysa) -->
                            ${isClosed && pts.length >= 3 ? `
                            <div class="sat-measure-row" style="margin-bottom:4px;">
                                <div class="sat-measure-sub-row">
                                    <label class="sat-measure-label">Alan Rozeti:</label>
                                    <div class="sat-measure-chips">
                                        <button type="button" class="sat-measure-chip ${drawing.areaDisplayMode === 'frameless' ? 'active' : ''}" onclick="window.setSatelliteDrawingAreaDisplayMode('${drawing.id}', 'frameless')">✨ Çerçevesiz</button>
                                        <button type="button" class="sat-measure-chip ${drawing.areaDisplayMode === 'box' ? 'active' : ''}" onclick="window.setSatelliteDrawingAreaDisplayMode('${drawing.id}', 'box')">🏷️ Kutulu</button>
                                    </div>
                                </div>
                                <div class="sat-measure-chips" style="margin-top: 3px;">
                                    <button type="button" class="sat-measure-chip ${drawing.areaContentMode === 'm2_only' ? 'active' : ''}" onclick="window.setSatelliteDrawingAreaContentMode('${drawing.id}', 'm2_only')">Sadece m²</button>
                                    <button type="button" class="sat-measure-chip ${drawing.areaContentMode === 'm2_donum' ? 'active' : ''}" onclick="window.setSatelliteDrawingAreaContentMode('${drawing.id}', 'm2_donum')">m² + Dönüm</button>
                                    <button type="button" class="sat-measure-chip ${drawing.areaContentMode === 'detailed' ? 'active' : ''}" onclick="window.setSatelliteDrawingAreaContentMode('${drawing.id}', 'detailed')">Detaylı (+Çevre)</button>
                                </div>
                            </div>` : ''}

                            <!-- Gösterim Seçenekleri (Ayrı Kenarlar, Toplam Mesafe, Arsa m², Köşeler) -->
                            <div class="sat-measure-row">
                                <div class="sat-measure-sub-row">
                                    <label class="sat-measure-label">Gösterim:</label>
                                    <div class="sat-measure-chips">
                                        <button type="button" class="sat-measure-chip ${drawing.distanceMode !== 'total' && drawing.distanceMode !== 'none' && drawing.showEdgeDistances !== false ? 'active' : ''}" onclick="window.setSatelliteDrawingDistanceDisplay('${drawing.id}', 'edges')" title="Her iki köşe arasındaki mesafeleri ayrı ayrı gösterir">📏 Ayrı Kenarlar</button>
                                        <button type="button" class="sat-measure-chip ${drawing.distanceMode === 'total' ? 'active' : ''}" onclick="window.setSatelliteDrawingDistanceDisplay('${drawing.id}', 'total')" title="Tüm hattın toplam mesafesini tek rozet olarak gösterir">∑ Toplam Mesafe</button>
                                        <button type="button" class="sat-measure-chip ${drawing.showArea !== false ? 'active' : ''}" onclick="window.toggleSatelliteDrawingAreaBadge('${drawing.id}')">🏷️ Arsa m²</button>
                                        <button type="button" class="sat-measure-chip ${drawing.showHandles !== false ? 'active' : ''}" onclick="window.toggleSatelliteDrawingHandles('${drawing.id}')">📍 Köşeler</button>
                                    </div>
                                </div>
                            </div>
                        </div>` : ''}
                    </div>
                `;
            });

            listEl.innerHTML = html;
        },

        /**
         * Haritaya Tıklandığında Ölçüm Noktası Ekler (Aktif Çizime Ekler)
         */
        handleMeasureMapClick: function(latlng) {
            if (!this.measureActive || !latlng) return;

            const active = this.getActiveDrawing();
            if (!active.points) active.points = [];
            active.points.push(L.latLng(latlng.lat, latlng.lng));

            // 3 veya daha fazla nokta olduğunda ve daha önce kapatılmamışsa alan moduna al
            if (active.points.length >= 3 && active.isClosed === undefined) {
                active.isClosed = true;
            }

            this.updateMeasureGraphics();
            this.renderDrawingsListUI();
            this.saveLastLocation({
                measureData: this.getMeasureDataToSave()
            });
        },

        /**
         * Belirtilen İndekse Yeni Ölçüm Noktası Araya Ekler
         */
        addMeasurePointAtIndex: function(latlng, index, drawingId) {
            const drawing = drawingId ? this.measureDrawings.find(d => d.id === drawingId) : this.getActiveDrawing();
            if (!drawing || !drawing.points || !latlng) return;
            const insertIdx = Math.max(0, Math.min(drawing.points.length, index));
            drawing.points.splice(insertIdx, 0, L.latLng(latlng.lat, latlng.lng));
            this.updateMeasureGraphics();
            this.renderDrawingsListUI();
            this.saveLastLocation({
                measureData: this.getMeasureDataToSave()
            });
        },

        /**
         * Belirtilen İndeksteki Ölçüm Noktasını Siler
         */
        removeMeasurePointAtIndex: function(index, drawingId) {
            const drawing = drawingId ? this.measureDrawings.find(d => d.id === drawingId) : this.getActiveDrawing();
            if (!drawing || !drawing.points || drawing.points.length <= index) return;
            drawing.points.splice(index, 1);
            if (drawing.points.length < 3) {
                drawing.isClosed = false;
            }
            this.updateMeasureGraphics();
            this.renderDrawingsListUI();
            this.saveLastLocation({
                measureData: this.getMeasureDataToSave()
            });
            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`🗑️ ${index + 1}. köşe noktası silindi.`, 'info');
            }
        },

        /**
         * Son Eklenen Ölçüm Noktasını Geri Alır
         */
        undoLastMeasurePoint: function(drawingId) {
            this.undoLastPointForDrawing(drawingId);
        },

        /**
         * Poligonun Alanını Kapatır veya Açık Çizgi Yapar
         */
        toggleMeasureClosed: function(drawingId) {
            this.toggleDrawingClosed(drawingId);
        },

        /**
         * Ölçüm Noktalarını Sıfırlar
         */
        resetMeasurePoints: function(drawingId) {
            this.resetDrawingPoints(drawingId);
            if (typeof window.showAppToast === 'function') {
                window.showAppToast('📏 Ölçüm sıfırlandı. Haritada noktalara tıklayarak yeni ölçüm başlatabilirsiniz.', 'info');
            }
        },

        /**
         * Mesafe ve Şablona Göre Etiket Metnini Formatlar
         */
        getFormattedMeasureText: function(meters, isPerimeter, customPreset, customText, isTotal) {
            const m = (meters !== undefined) ? meters : (this.measureDistanceMeters || 0);
            let distStr = '';
            if (m >= 1000) {
                distStr = (m / 1000).toFixed(2) + ' km';
            } else {
                distStr = m.toFixed(1) + ' m';
                if (distStr.endsWith('.0 m')) {
                    distStr = distStr.replace('.0 m', ' m');
                }
            }

            if (isPerimeter) {
                return `Çevre: ${distStr}`;
            }

            const cText = (customText !== undefined) ? customText : this.measureCustomText;
            let result = '';
            if (cText && cText.trim()) {
                const ct = cText.trim();
                if (ct.includes('{d}') || ct.includes('{m}')) {
                    result = ct.replace(/\{[dm]\}/g, distStr);
                } else {
                    result = `${distStr} ${ct}`;
                }
            } else {
                const preset = (customPreset !== undefined) ? customPreset : this.measurePreset;
                switch (preset) {
                    case 'frontage':
                        result = `${distStr} Yola Cephe`;
                        break;
                    case 'road_dist':
                        result = `${distStr} Yola Mesafe`;
                        break;
                    case 'front':
                        result = `${distStr} Ön Cephe`;
                        break;
                    case 'depth':
                        result = `${distStr} Derinlik`;
                        break;
                    case 'setback':
                        result = `${distStr} Yol Terki`;
                        break;
                    case 'distance_only':
                        result = distStr;
                        break;
                    default:
                        result = `${distStr} Yola Cephe`;
                        break;
                }
            }

            if (isTotal) {
                if (result.startsWith('Toplam:')) return result;
                return `Toplam: ${result}`;
            }
            return result;
        },

        /**
         * Yüklü Arsa Parselinin Kenarlarını Çıkarır
         */
        getParcelEdges: function() {
            if (!this.parcelData || !this.parcelData.latLngs || this.parcelData.latLngs.length < 3) {
                return [];
            }
            const pts = [];
            this.parcelData.latLngs.forEach((p, idx) => {
                const lat = Array.isArray(p) ? p[0] : p.lat;
                const lng = Array.isArray(p) ? p[1] : p.lng;
                if (idx > 0) {
                    const prev = pts[pts.length - 1];
                    if (Math.abs(lat - prev.lat) < 1e-7 && Math.abs(lng - prev.lng) < 1e-7) return;
                }
                pts.push(L.latLng(lat, lng));
            });
            if (pts.length > 2) {
                const first = pts[0];
                const last = pts[pts.length - 1];
                if (Math.abs(first.lat - last.lat) < 1e-7 && Math.abs(first.lng - last.lng) < 1e-7) {
                    pts.pop();
                }
            }
            if (pts.length < 3) return [];

            const edges = [];
            for (let i = 0; i < pts.length; i++) {
                const p1 = pts[i];
                const p2 = pts[(i + 1) % pts.length];
                const dist = p1.distanceTo(p2);
                edges.push({
                    index: i,
                    p1: p1,
                    p2: p2,
                    dist: dist
                });
            }
            return edges;
        },

        /**
         * Yüklü Arsa Parselinin Tüm Köşelerine Tek Tıkla Kilitlenir ve Alanı Çevreler
         */
        snapMeasureToAllParcelVertices: function() {
            if (!this.parcelData || !this.parcelData.latLngs || this.parcelData.latLngs.length < 3) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('⚠️ Önce KML / GeoJSON parseli yükleyin.', 'warning');
                }
                return;
            }

            const cleanPts = [];
            this.parcelData.latLngs.forEach((p, idx) => {
                const lat = Array.isArray(p) ? p[0] : p.lat;
                const lng = Array.isArray(p) ? p[1] : p.lng;
                if (idx > 0) {
                    const prev = cleanPts[cleanPts.length - 1];
                    if (Math.abs(lat - prev.lat) < 1e-7 && Math.abs(lng - prev.lng) < 1e-7) return;
                }
                cleanPts.push(L.latLng(lat, lng));
            });
            if (cleanPts.length > 2) {
                const first = cleanPts[0];
                const last = cleanPts[cleanPts.length - 1];
                if (Math.abs(first.lat - last.lat) < 1e-7 && Math.abs(first.lng - last.lng) < 1e-7) {
                    cleanPts.pop();
                }
            }

            this.measurePoints = cleanPts;
            this.measureIsClosed = true;
            this.updateMeasureGraphics();

            if (this.map) {
                const bounds = L.latLngBounds(this.measurePoints);
                this.map.panInsideBounds(bounds, { animate: true, padding: [40, 40] });
            }

            this.saveLastLocation({
                measureData: this.getMeasureDataToSave()
            });

            if (typeof window.showAppToast === 'function') {
                const area = this.calculateGeodesicPolygonArea(this.measurePoints);
                const areaInfo = this.getFormattedAreaInfo(area);
                window.showAppToast(`📐 Tüm parsel çevrelendi: ${cleanPts.length} köşe, ${areaInfo.m2Text} (${areaInfo.donumText}).`, 'success');
            }
        },

        /**
         * Ölçüm Noktalarını Parselin Tek Bir Kenarına Oturtur
         */
        snapMeasureToParcelEdge: function(targetIndex) {
            const edges = this.getParcelEdges();
            if (edges.length === 0) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('⚠️ Parsel kenarına oturtmak için önce KML / GeoJSON parseli yükleyin.', 'warning');
                }
                return;
            }

            let chosenEdge = null;
            if (targetIndex === undefined || targetIndex === null) {
                const sorted = [...edges].sort((a, b) => b.dist - a.dist);
                chosenEdge = sorted[0];
                this.measureEdgeIndex = chosenEdge.index;
            } else {
                const idx = ((targetIndex % edges.length) + edges.length) % edges.length;
                chosenEdge = edges[idx];
                this.measureEdgeIndex = idx;
            }

            this.measurePoints = [chosenEdge.p1, chosenEdge.p2];
            this.measureIsClosed = false;
            this.measureDistanceMeters = chosenEdge.dist;
            this.updateParcelSnapButtons();
            this.updateMeasureGraphics();

            if (this.map) {
                const bounds = L.latLngBounds(this.measurePoints);
                this.map.panInsideBounds(bounds, { animate: true, padding: [40, 40] });
            }

            this.saveLastLocation({
                measureData: this.getMeasureDataToSave()
            });

            if (typeof window.showAppToast === 'function') {
                window.showAppToast(`📐 Parsel Kenarı ${this.measureEdgeIndex + 1}/${edges.length} kilitlendi (${chosenEdge.dist.toFixed(1)} m).`, 'info');
            }
        },

        /**
         * Parselin Sıradaki Diğer Kenarına Geçer
         */
        cycleMeasureParcelEdge: function() {
            const nextIdx = (this.measureEdgeIndex !== undefined ? this.measureEdgeIndex + 1 : 0);
            this.snapMeasureToParcelEdge(nextIdx);
        },

        /**
         * Parsel Kenar Kilit Butonlarının Görünürlüğünü Günceller
         */
        updateParcelSnapButtons: function() {
            const rowSnapAll = document.getElementById('satMeasureRowSnapAll');
            const rowEdgeNav = document.getElementById('satMeasureRowEdgeNav');
            const snapAllBtn = document.getElementById('satBtnSnapAllParcel');
            const snapBtn = document.getElementById('satBtnSnapParcelEdge');
            const cycleBtn = document.getElementById('satBtnCycleParcelEdge');
            const cycleSpan = document.getElementById('satCycleEdgeText');
            const hasParcel = !!(this.parcelData && this.parcelData.latLngs && this.parcelData.latLngs.length >= 3);
            const edges = hasParcel ? this.getParcelEdges() : [];

            if (rowSnapAll) {
                rowSnapAll.style.display = hasParcel ? 'flex' : 'none';
            }
            if (snapAllBtn) {
                snapAllBtn.style.display = hasParcel ? 'inline-flex' : 'none';
            }
            if (rowEdgeNav) {
                rowEdgeNav.style.display = hasParcel ? 'flex' : 'none';
            }
            if (snapBtn) {
                snapBtn.style.display = hasParcel ? 'inline-flex' : 'none';
            }
            if (cycleBtn) {
                if (hasParcel && edges.length > 1) {
                    cycleBtn.style.display = 'inline-flex';
                    const cur = (this.measureEdgeIndex !== undefined ? this.measureEdgeIndex : 0) + 1;
                    if (cycleSpan) {
                        cycleSpan.textContent = `Diğer Kenar (${cur}/${edges.length})`;
                    } else {
                        const span = cycleBtn.querySelector('span');
                        if (span) span.textContent = `Diğer Kenar (${cur}/${edges.length})`;
                    }
                } else {
                    cycleBtn.style.display = 'none';
                }
            }
        },

        /**
         * Haritadaki Çoklu Ölçüm Grafiklerini (Tüm Çizimler, Köşeler, Kenarlar, Rozetler) Günceller
         */
        updateMeasureGraphics: function(isFastDrag) {
            if (!this.map) return;
            const drawings = this.getAllDrawings();
            const active = this.getActiveDrawing();

            // Beyaz TKGM Parsel Katmanı Çakışmasını Önle
            const hasVisibleWithPoints = drawings.some(d => d.visible !== false && d.points && d.points.length >= 2);
            if (this.parcelPolygon && this.map) {
                const shouldHideParcel = this.measureActive && this.measureHideDefaultParcel && hasVisibleWithPoints;
                if (shouldHideParcel) {
                    if (this.map.hasLayer(this.parcelPolygon)) {
                        this.map.removeLayer(this.parcelPolygon);
                    }
                } else {
                    if (!this.map.hasLayer(this.parcelPolygon)) {
                        this.parcelPolygon.addTo(this.map);
                    }
                    this.updateParcelPolygonStyle();
                }
            }

            // Her çizimi sırayla güncelle
            drawings.forEach(drawing => {
                if (drawing.visible === false) {
                    this.removeLayersForDrawing(drawing);
                    return;
                }

                const pts = drawing.points || [];
                const color = drawing.color || '#f59e0b';
                const isClosed = drawing.isClosed && (pts.length >= 3);
                const isActive = (drawing.id === this.activeDrawingId);

                drawing.perimeterMeters = pts.length >= 2 ? this.calculatePolygonPerimeter(pts, isClosed) : 0;
                drawing.areaM2 = isClosed ? this.calculateGeodesicPolygonArea(pts) : 0;
                drawing.distanceMeters = pts.length === 2 ? pts[0].distanceTo(pts[1]) : drawing.perimeterMeters;

                // 1. Köşe İşaretçileri (Handles) - YALNIZCA AKTİF ÇİZİM İÇİN GÖSTERİLİR
                if (!isActive || pts.length === 0) {
                    while (drawing.markers.length > 0) {
                        const rm = drawing.markers.pop();
                        if (rm && this.map.hasLayer(rm)) this.map.removeLayer(rm);
                    }
                } else {
                    while (drawing.markers.length > pts.length) {
                        const rm = drawing.markers.pop();
                        if (rm && this.map.hasLayer(rm)) this.map.removeLayer(rm);
                    }
                    pts.forEach((p, idx) => {
                        const label = `${idx + 1}`;
                        if (!drawing.markers[idx]) {
                            drawing.markers[idx] = this.createMeasureHandleMarker(p, label, idx, color, drawing.id);
                            if (drawing.showHandles !== false) {
                                drawing.markers[idx].addTo(this.map);
                            }
                        } else {
                            drawing.markers[idx].setLatLng(p);
                            drawing.markers[idx]._pointIndex = idx;
                            drawing.markers[idx]._drawingId = drawing.id;
                            this.updateMeasureHandleMarkerContent(drawing.markers[idx], label, color);
                            if (drawing.showHandles !== false) {
                                if (!this.map.hasLayer(drawing.markers[idx])) {
                                    drawing.markers[idx].addTo(this.map);
                                }
                            } else {
                                if (this.map.hasLayer(drawing.markers[idx])) {
                                    this.map.removeLayer(drawing.markers[idx]);
                                }
                            }
                        }
                    });
                }

                // 2. Kenar Çizgileri & Kenar Rozetleri
                const edgeCount = (pts.length < 2) ? 0 : (isClosed ? pts.length : (pts.length - 1));

                while (drawing.lines.length > edgeCount) {
                    const rl = drawing.lines.pop();
                    if (rl && this.map.hasLayer(rl)) this.map.removeLayer(rl);
                }
                while (drawing.badgeMarkers.length > edgeCount) {
                    const rb = drawing.badgeMarkers.pop();
                    if (rb && this.map.hasLayer(rb)) this.map.removeLayer(rb);
                }

                if (edgeCount > 0) {
                    let lineOpts = {
                        color: color,
                        weight: isActive ? 3.8 : 3.2,
                        opacity: isActive ? 0.98 : 0.85,
                        lineCap: 'round',
                        lineJoin: 'round',
                        dashArray: null
                    };

                    if (drawing.style === 'dashed') {
                        lineOpts.dashArray = '7, 6';
                        lineOpts.weight = 3;
                    } else if (drawing.style === 'neon') {
                        lineOpts.color = color;
                        lineOpts.weight = 4.2;
                    }

                    for (let i = 0; i < edgeCount; i++) {
                        const pA = pts[i];
                        const pB = pts[(i + 1) % pts.length];
                        const segDist = pA.distanceTo(pB);

                        const onLineClick = (e) => {
                            L.DomEvent.stopPropagation(e);
                            if (this.measureInteractionMode === 'pan' || this.isCtrlPressed || this.isSpacePressed) return;
                            if (drawing.id !== this.activeDrawingId) {
                                this.selectDrawing(drawing.id);
                                return;
                            }
                            this.addMeasurePointAtIndex(e.latlng, i + 1, drawing.id);
                        };

                        if (!drawing.lines[i]) {
                            drawing.lines[i] = L.polyline([pA, pB], lineOpts).addTo(this.map);
                            drawing.lines[i].on('click', onLineClick);
                        } else {
                            drawing.lines[i].setLatLngs([pA, pB]);
                            drawing.lines[i].setStyle(lineOpts);
                            drawing.lines[i].off('click');
                            drawing.lines[i].on('click', onLineClick);
                        }

                        if (drawing.lines[i]._path) {
                            if (drawing.style === 'neon') {
                                drawing.lines[i]._path.style.filter = `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 10px ${color})`;
                                drawing.lines[i]._path.style.transition = 'filter 0.2s ease, stroke 0.2s ease';
                            } else {
                                drawing.lines[i]._path.style.filter = '';
                            }
                        }

                        // Segment Rozeti
                        const isEdgeHidden = (drawing.distanceMode === 'total') || (drawing.distanceMode === 'none') || (drawing.showEdgeDistances === false) || !!(drawing.hiddenEdges && drawing.hiddenEdges[i]);
                        if (isEdgeHidden) {
                            if (drawing.badgeMarkers[i] && this.map.hasLayer(drawing.badgeMarkers[i])) {
                                this.map.removeLayer(drawing.badgeMarkers[i]);
                            }
                        } else {
                            const midLat = (pA.lat + pB.lat) / 2;
                            const midLng = (pA.lng + pB.lng) / 2;
                            const defaultMid = L.latLng(midLat, midLng);
                            const customBadgePos = drawing.badgeCustomPositions && (drawing.badgeCustomPositions[i] || drawing.badgeCustomPositions[String(i)]);
                            const badgePos = customBadgePos || defaultMid;

                            const segDistStr = (segDist >= 1000) ? (segDist / 1000).toFixed(2) + ' km' : segDist.toFixed(1) + ' m';
                            const badgeLabel = (pts.length <= 2) ? this.getFormattedMeasureText(segDist, false, drawing.preset, drawing.customText) : `${segDistStr}`;
                            const edgeFontSize = this.measureEdgeFontSize || 12;
                            const fontFamily = this.measureFontFamily || 'Montserrat';

                            const badgeHtml = `
                                <div class="sat-measure-map-badge style-${drawing.style || 'cad'}" style="border-color:${color}; font-family:'${fontFamily}', sans-serif; font-size:${edgeFontSize}px;" title="${this.escapeHtml(drawing.title)}: Sürükleyerek taşıyabilirsiniz (Kaldırmak için ✕'e tıklayın)">
                                    <span class="sat-badge-icon" style="color:${color}; font-size:${Math.round(edgeFontSize * 0.9)}px;"><i class="fas fa-ruler"></i></span>
                                    <span class="sat-badge-text">${badgeLabel}</span>
                                    <button type="button" class="sat-badge-hide-btn" onclick="window.toggleSatelliteDrawingSingleEdge('${drawing.id}', ${i}, event)" title="Bu kenar metresini kaldır">✕</button>
                                </div>
                            `;

                            const badgeIcon = L.divIcon({
                                className: 'sat-measure-badge-divicon',
                                html: badgeHtml,
                                iconSize: [160, 40],
                                iconAnchor: [80, 20]
                            });

                            if (!drawing.badgeMarkers[i]) {
                                const badgeMarker = L.marker(badgePos, {
                                    icon: badgeIcon,
                                    draggable: true,
                                    zIndexOffset: 1300
                                }).addTo(this.map);

                                const edgeIdx = i;
                                const dId = drawing.id;
                                const updateEdgeBadgePos = (pos) => {
                                    if (!pos) return;
                                    const targetD = this.measureDrawings.find(x => x.id === dId);
                                    if (targetD) {
                                        targetD.badgeCustomPositions = targetD.badgeCustomPositions || {};
                                        targetD.badgeCustomPositions[edgeIdx] = pos;
                                        targetD.badgeCustomPositions[String(edgeIdx)] = pos;
                                    }
                                };

                                badgeMarker.on('drag', (e) => {
                                    badgeMarker._hasBeenDragged = true;
                                    updateEdgeBadgePos(e.target.getLatLng());
                                });
                                badgeMarker.on('dragend', (e) => {
                                    badgeMarker._hasBeenDragged = true;
                                    updateEdgeBadgePos(e.target.getLatLng());
                                    this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
                                });
                                badgeMarker.on('dblclick', (e) => {
                                    L.DomEvent.stopPropagation(e);
                                    badgeMarker._hasBeenDragged = false;
                                    const targetD = this.measureDrawings.find(x => x.id === dId);
                                    if (targetD && targetD.badgeCustomPositions) {
                                        delete targetD.badgeCustomPositions[edgeIdx];
                                        delete targetD.badgeCustomPositions[String(edgeIdx)];
                                    }
                                    this.updateMeasureGraphics();
                                });
                                badgeMarker.on('click', (e) => {
                                    L.DomEvent.stopPropagation(e);
                                    if (this.activeDrawingId !== dId) {
                                        this.selectDrawing(dId);
                                    }
                                });

                                if (customBadgePos) {
                                    badgeMarker._hasBeenDragged = true;
                                }
                                drawing.badgeMarkers[i] = badgeMarker;
                            } else {
                                if (!this.map.hasLayer(drawing.badgeMarkers[i])) {
                                    drawing.badgeMarkers[i].addTo(this.map);
                                }
                                if (customBadgePos) {
                                    drawing.badgeMarkers[i]._hasBeenDragged = true;
                                }
                                drawing.badgeMarkers[i].setLatLng(badgePos);
                                drawing.badgeMarkers[i].setIcon(badgeIcon);
                            }
                        }
                    }
                }

                // 2.1 Toplam Mesafe Rozeti (Eğer distanceMode === 'total' ise)
                if (drawing.distanceMode === 'total' && pts.length >= 2) {
                    const totalDist = drawing.perimeterMeters || this.calculatePolygonPerimeter(pts, isClosed);
                    const defaultMid = this.getPolylineMidpoint(pts, isClosed) || pts[0];
                    const badgePos = drawing.totalBadgeCustomPos || defaultMid;
                    const badgeLabel = this.getFormattedMeasureText(totalDist, false, drawing.preset, drawing.customText, true);
                    const edgeFontSize = this.measureEdgeFontSize || 12;
                    const fontFamily = this.measureFontFamily || 'Montserrat';

                    const isSelected = !!drawing.totalBadgeSelected;
                    const rot = drawing.totalBadgeRotation || 0;
                    const scale = drawing.totalBadgeScale || 1.0;

                    const totalBadgeHtml = `
                        <div class="sat-measure-total-wrapper ${isSelected ? 'is-selected' : ''}" data-drawing-id="${drawing.id}" style="transform: rotate(${rot}deg) scale(${scale}); transform-origin: center center;">
                            <div class="sat-measure-map-badge sat-measure-total-badge style-${drawing.style || 'cad'}" style="border-color:${color}; font-family:'${fontFamily}', sans-serif; font-size:${edgeFontSize}px;" title="${this.escapeHtml(drawing.title)}: Toplam Mesafe (Tıklayınca tutamaçlar açılır, sürükleyerek taşıyabilirsiniz)">
                                <span class="sat-badge-icon" style="color:${color}; font-size:${Math.round(edgeFontSize * 0.9)}px;"><i class="fas fa-arrows-left-right-to-line"></i></span>
                                <span class="sat-badge-text">${badgeLabel}</span>
                            </div>
                            <div class="sat-area-select-border"></div>
                            <div class="sat-area-handle sat-area-rotate-handle" title="Döndür">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" stroke-width="2.5" style="pointer-events:none;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.22-10.27l-5.3 5.3"></path></svg>
                            </div>
                            <div class="sat-area-handle sat-area-resize-handle" title="Büyüt / Küçült">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" stroke-width="2.5" style="pointer-events:none;"><path d="M21 15v6h-6M3 9V3h6M21 21l-7-7M3 3l7 7"></path></svg>
                            </div>
                            <div class="sat-area-handle sat-area-delete-handle" title="Kapat / Gizle">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5" style="pointer-events:none;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </div>
                        </div>
                    `;

                    const totalBadgeIcon = L.divIcon({
                        className: 'sat-measure-badge-divicon sat-measure-total-divicon',
                        html: totalBadgeHtml,
                        iconSize: [260, 80],
                        iconAnchor: [130, 40]
                    });

                    if (!drawing.totalBadgeMarker) {
                        const tMarker = L.marker(badgePos, {
                            icon: totalBadgeIcon,
                            draggable: true,
                            zIndexOffset: 1350
                        }).addTo(this.map);

                        const dId = drawing.id;
                        tMarker.on('drag', (e) => {
                            tMarker._hasBeenDragged = true;
                            const targetD = this.measureDrawings.find(x => x.id === dId);
                            if (targetD) targetD.totalBadgeCustomPos = e.target.getLatLng();
                        });
                        tMarker.on('dragend', (e) => {
                            tMarker._hasBeenDragged = true;
                            const targetD = this.measureDrawings.find(x => x.id === dId);
                            if (targetD) targetD.totalBadgeCustomPos = e.target.getLatLng();
                            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
                        });
                        tMarker.on('dblclick', (e) => {
                            L.DomEvent.stopPropagation(e);
                            tMarker._hasBeenDragged = false;
                            const targetD = this.measureDrawings.find(x => x.id === dId);
                            if (targetD) {
                                targetD.totalBadgeCustomPos = null;
                                targetD.totalBadgeRotation = 0;
                                targetD.totalBadgeScale = 1.0;
                            }
                            this.updateMeasureGraphics();
                            if (typeof window.showAppToast === 'function') {
                                window.showAppToast('🔄 Toplam mesafe konumu ve boyutu sıfırlandı.', 'info');
                            }
                        });
                        tMarker.on('click', (e) => {
                            L.DomEvent.stopPropagation(e);
                            if (this.activeDrawingId !== dId) {
                                this.selectDrawing(dId);
                            }
                            this.selectMeasureTotalBadge(dId);
                        });

                        if (drawing.totalBadgeCustomPos) {
                            tMarker._hasBeenDragged = true;
                        }
                        drawing.totalBadgeMarker = tMarker;
                        this.attachMeasureTotalBadgeListeners(tMarker, drawing.id);
                    } else {
                        if (!this.map.hasLayer(drawing.totalBadgeMarker)) {
                            drawing.totalBadgeMarker.addTo(this.map);
                        }
                        if (drawing.totalBadgeCustomPos) {
                            drawing.totalBadgeMarker._hasBeenDragged = true;
                        }
                        drawing.totalBadgeMarker.setLatLng(badgePos);
                        drawing.totalBadgeMarker.setIcon(totalBadgeIcon);
                        this.attachMeasureTotalBadgeListeners(drawing.totalBadgeMarker, drawing.id);
                    }
                } else {
                    if (drawing.totalBadgeMarker && this.map.hasLayer(drawing.totalBadgeMarker)) {
                        this.map.removeLayer(drawing.totalBadgeMarker);
                        drawing.totalBadgeMarker = null;
                    }
                }

                // 3. Poligon Yarı Saydam Dolgu Katmanı & Merkez Alan Rozeti (3+ Nokta ve Kapalıysa)
                if (isClosed && pts.length >= 3) {
                    if (!drawing.polygonLayer) {
                        drawing.polygonLayer = L.polygon(pts, {
                            stroke: false,
                            weight: 0,
                            fillColor: color,
                            fillOpacity: 0.16,
                            interactive: false
                        }).addTo(this.map);
                    } else {
                        drawing.polygonLayer.setLatLngs(pts);
                        drawing.polygonLayer.setStyle({
                            stroke: false,
                            weight: 0,
                            fillColor: color,
                            fillOpacity: 0.16
                        });
                    }

                    // Merkez Alan Rozeti
                    if (drawing.showArea !== false) {
                        const centroid = this.getPolygonCentroid(pts);
                        if (centroid) {
                            const areaInfo = this.getFormattedAreaInfo(drawing.areaM2);
                            const perimStr = (drawing.perimeterMeters >= 1000) ? (drawing.perimeterMeters / 1000).toFixed(2) + ' km' : Math.round(drawing.perimeterMeters) + ' m';
                            const areaPos = drawing.areaBadgeCustomPos || centroid;
                            const areaDisplayMode = drawing.areaDisplayMode || 'frameless';
                            const areaContentMode = drawing.areaContentMode || 'm2_only';
                            const areaFontSize = this.measureAreaFontSize || 16;
                            const fontFamily = this.measureFontFamily || 'Montserrat';

                            let titleText = '';
                            let subTextHtml = '';

                            if (areaContentMode === 'm2_only') {
                                titleText = `${areaInfo.m2Text}`;
                            } else if (areaContentMode === 'm2_donum') {
                                titleText = `${areaInfo.m2Text} <small style="opacity:0.85; font-size:0.85em;">(${areaInfo.donumText})</small>`;
                            } else {
                                titleText = `${areaInfo.m2Text} <small style="opacity:0.85; font-size:0.85em;">(${areaInfo.donumText})</small>`;
                                subTextHtml = `<div class="area-sub" style="color:${color}; font-size:${Math.round(areaFontSize * 0.68)}px;">Çevre: ${perimStr} • ${pts.length} Köşe</div>`;
                            }

                            const isFrameless = (areaDisplayMode === 'frameless');
                            const isSelected = !!drawing.areaSelected;
                            const rot = drawing.areaRotation || 0;
                            const scale = drawing.areaScale || 1.0;

                            const areaBadgeHtml = `
                                <div class="sat-measure-area-wrapper ${isSelected ? 'is-selected' : ''}" data-drawing-id="${drawing.id}" style="transform: rotate(${rot}deg) scale(${scale}); transform-origin: center center;">
                                    <div class="sat-measure-area-map-badge ${isFrameless ? 'frameless' : ''}" style="${isFrameless ? '' : `border-color:${color};`} font-family:'${fontFamily}', sans-serif;" title="${this.escapeHtml(drawing.title)} Alanı: Tıklayınca tutamaçlar açılır, sürükleyerek taşıyabilirsiniz">
                                        <div class="area-title" style="font-size:${areaFontSize}px;">
                                            ${isFrameless ? '' : `<i class="fas fa-vector-square" style="color:${color};"></i> `}<span>${titleText}</span>
                                        </div>
                                        ${subTextHtml}
                                    </div>
                                    <div class="sat-area-select-border"></div>
                                    <div class="sat-area-handle sat-area-rotate-handle" title="Döndür">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" stroke-width="2.5" style="pointer-events:none;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.22-10.27l-5.3 5.3"></path></svg>
                                    </div>
                                    <div class="sat-area-handle sat-area-resize-handle" title="Büyüt / Küçült">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" stroke-width="2.5" style="pointer-events:none;"><path d="M21 15v6h-6M3 9V3h6M21 21l-7-7M3 3l7 7"></path></svg>
                                    </div>
                                    <div class="sat-area-handle sat-area-delete-handle" title="Sil / Gizle">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5" style="pointer-events:none;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </div>
                                </div>
                            `;

                            const areaBadgeIcon = L.divIcon({
                                className: 'sat-measure-area-badge-divicon',
                                html: areaBadgeHtml,
                                iconSize: [300, 100],
                                iconAnchor: [150, 50]
                            });

                            if (!drawing.areaBadgeMarker) {
                                const aMarker = L.marker(areaPos, {
                                    icon: areaBadgeIcon,
                                    draggable: true,
                                    zIndexOffset: 1450
                                }).addTo(this.map);

                                const dId = drawing.id;
                                aMarker.on('drag', (e) => {
                                    aMarker._hasBeenDragged = true;
                                    const targetD = this.measureDrawings.find(x => x.id === dId);
                                    if (targetD) targetD.areaBadgeCustomPos = e.target.getLatLng();
                                });
                                aMarker.on('dragend', (e) => {
                                    aMarker._hasBeenDragged = true;
                                    const targetD = this.measureDrawings.find(x => x.id === dId);
                                    if (targetD) targetD.areaBadgeCustomPos = e.target.getLatLng();
                                    this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
                                });
                                aMarker.on('dblclick', (e) => {
                                    L.DomEvent.stopPropagation(e);
                                    aMarker._hasBeenDragged = false;
                                    const targetD = this.measureDrawings.find(x => x.id === dId);
                                    if (targetD) {
                                        targetD.areaBadgeCustomPos = null;
                                        targetD.areaRotation = 0;
                                        targetD.areaScale = 1.0;
                                    }
                                    this.updateMeasureGraphics();
                                    if (typeof window.showAppToast === 'function') {
                                        window.showAppToast('🔄 Alan konumu ve boyutu sıfırlandı.', 'info');
                                    }
                                });
                                aMarker.on('click', (e) => {
                                    L.DomEvent.stopPropagation(e);
                                    if (this.activeDrawingId !== dId) {
                                        this.selectDrawing(dId);
                                    }
                                    this.selectMeasureAreaBadge(dId);
                                });

                                if (drawing.areaBadgeCustomPos) {
                                    aMarker._hasBeenDragged = true;
                                }

                                drawing.areaBadgeMarker = aMarker;
                                this.attachMeasureAreaBadgeListeners(aMarker, drawing.id);
                            } else {
                                if (!this.map.hasLayer(drawing.areaBadgeMarker)) {
                                    drawing.areaBadgeMarker.addTo(this.map);
                                }
                                if (drawing.areaBadgeCustomPos) {
                                    drawing.areaBadgeMarker._hasBeenDragged = true;
                                }
                                drawing.areaBadgeMarker.setLatLng(areaPos);
                                drawing.areaBadgeMarker.setIcon(areaBadgeIcon);
                                this.attachMeasureAreaBadgeListeners(drawing.areaBadgeMarker, drawing.id);
                            }
                        }
                    } else {
                        if (drawing.areaBadgeMarker && this.map.hasLayer(drawing.areaBadgeMarker)) {
                            this.map.removeLayer(drawing.areaBadgeMarker);
                            drawing.areaBadgeMarker = null;
                        }
                    }
                } else {
                    if (drawing.polygonLayer && this.map.hasLayer(drawing.polygonLayer)) {
                        this.map.removeLayer(drawing.polygonLayer);
                        drawing.polygonLayer = null;
                    }
                    if (drawing.areaBadgeMarker && this.map.hasLayer(drawing.areaBadgeMarker)) {
                        this.map.removeLayer(drawing.areaBadgeMarker);
                        drawing.areaBadgeMarker = null;
                    }
                }
            });

            // UI Kartlarını Güncelle
            this.renderDrawingsListUI();
        },

        /**
         * Harita Ortasındaki Arsa m² Rozetini Seçer ve Tutamaçları Gösterir
         */
        selectMeasureAreaBadge: function(drawingId) {
            const d = drawingId ? this.measureDrawings.find(x => x.id === drawingId) : this.getActiveDrawing();
            if (d) d.areaSelected = true;
            this.measureAreaSelected = true;
            document.querySelectorAll('.sat-measure-area-wrapper').forEach(wrap => {
                if (!drawingId || wrap.dataset.drawingId === drawingId) {
                    wrap.classList.add('is-selected');
                }
            });
        },

        /**
         * Arsa m² Rozeti Seçimini Kaldırır ve Tutamaçları Gizler
         */
        deselectMeasureAreaBadge: function(drawingId) {
            if (drawingId) {
                const d = this.measureDrawings.find(x => x.id === drawingId);
                if (d) d.areaSelected = false;
            } else {
                if (this.measureDrawings) this.measureDrawings.forEach(d => { d.areaSelected = false; });
            }
            this.measureAreaSelected = false;
            document.querySelectorAll('.sat-measure-area-wrapper').forEach(wrap => {
                if (!drawingId || wrap.dataset.drawingId === drawingId) {
                    wrap.classList.remove('is-selected');
                }
            });
        },

        /**
         * Arsa m² Rozetinin Döndürme, Büyütme ve Silme Tutamaç Dinleyicilerini Bağlar
         */
        attachMeasureAreaBadgeListeners: function(aMarker, drawingId) {
            if (!aMarker) return;
            const el = (typeof aMarker.getElement === 'function') ? aMarker.getElement() : aMarker._icon;
            if (!el) {
                setTimeout(() => this.attachMeasureAreaBadgeListeners(aMarker, drawingId), 35);
                return;
            }
            const wrapper = el.querySelector('.sat-measure-area-wrapper');
            if (!wrapper || wrapper._handlesBound) return;
            wrapper._handlesBound = true;

            const self = this;
            const dId = drawingId || wrapper.dataset.drawingId;
            const rotHandle = wrapper.querySelector('.sat-area-rotate-handle');
            const resHandle = wrapper.querySelector('.sat-area-resize-handle');
            const delHandle = wrapper.querySelector('.sat-area-delete-handle');

            // 1. Rozete Tıklandığında Seçim
            wrapper.addEventListener('pointerdown', (e) => {
                if (e.target.closest('.sat-area-handle')) return;
                L.DomEvent.stopPropagation(e);
                self.selectMeasureAreaBadge(dId);
            });

            // 2. 🔄 Döndürme Tutamacı
            if (rotHandle) {
                const onRotDown = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    L.DomEvent.stopPropagation(e);

                    if (aMarker.dragging && typeof aMarker.dragging.disable === 'function') {
                        aMarker.dragging.disable();
                    }

                    const targetD = self.measureDrawings.find(x => x.id === dId);
                    const evt = e.touches ? e.touches[0] : e;
                    const rect = wrapper.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const startAngle = Math.atan2(evt.clientY - centerY, evt.clientX - centerX) * (180 / Math.PI);
                    const startRot = targetD ? (targetD.areaRotation || 0) : 0;

                    rotHandle.style.cursor = 'grabbing';

                    const onMove = (me) => {
                        me.preventDefault();
                        me.stopPropagation();
                        const mEvt = me.touches ? me.touches[0] : me;
                        const currentAngle = Math.atan2(mEvt.clientY - centerY, mEvt.clientX - centerX) * (180 / Math.PI);
                        let diff = currentAngle - startAngle;
                        let newRot = Math.round((startRot + diff) % 360);
                        if (newRot > 180) newRot -= 360;
                        else if (newRot < -180) newRot += 360;

                        if (targetD) targetD.areaRotation = newRot;
                        self.measureAreaRotation = newRot;
                        const curScale = targetD ? (targetD.areaScale || 1.0) : 1.0;
                        wrapper.style.transform = `rotate(${newRot}deg) scale(${curScale})`;
                    };

                    const onUp = () => {
                        rotHandle.style.cursor = 'grab';
                        window.removeEventListener('pointermove', onMove, { capture: true });
                        window.removeEventListener('pointerup', onUp, { capture: true });
                        window.removeEventListener('touchmove', onMove, { capture: true });
                        window.removeEventListener('touchend', onUp, { capture: true });

                        if (aMarker.dragging && typeof aMarker.dragging.enable === 'function') {
                            aMarker.dragging.enable();
                        }
                        self.saveLastLocation({ measureData: self.getMeasureDataToSave() });
                    };

                    window.addEventListener('pointermove', onMove, { capture: true, passive: false });
                    window.addEventListener('pointerup', onUp, { capture: true });
                    window.addEventListener('touchmove', onMove, { capture: true, passive: false });
                    window.addEventListener('touchend', onUp, { capture: true });
                };

                rotHandle.addEventListener('pointerdown', onRotDown);
                rotHandle.addEventListener('touchstart', onRotDown, { passive: false });
            }

            // 3. 📐 Boyutlandırma Tutamacı
            if (resHandle) {
                const onResDown = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    L.DomEvent.stopPropagation(e);

                    if (aMarker.dragging && typeof aMarker.dragging.disable === 'function') {
                        aMarker.dragging.disable();
                    }

                    const targetD = self.measureDrawings.find(x => x.id === dId);
                    const evt = e.touches ? e.touches[0] : e;
                    const rect = wrapper.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const startDist = Math.hypot(evt.clientX - centerX, evt.clientY - centerY);
                    const startScale = targetD ? (targetD.areaScale || 1.0) : 1.0;

                    const onMove = (me) => {
                        me.preventDefault();
                        me.stopPropagation();
                        const mEvt = me.touches ? me.touches[0] : me;
                        const curDist = Math.hypot(mEvt.clientX - centerX, mEvt.clientY - centerY);
                        let ratio = startDist > 0 ? (curDist / startDist) : 1;
                        let newScale = Math.max(0.5, Math.min(3.0, parseFloat((startScale * ratio).toFixed(2))));

                        if (targetD) targetD.areaScale = newScale;
                        self.measureAreaScale = newScale;
                        const curRot = targetD ? (targetD.areaRotation || 0) : 0;
                        wrapper.style.transform = `rotate(${curRot}deg) scale(${newScale})`;
                    };

                    const onUp = () => {
                        window.removeEventListener('pointermove', onMove, { capture: true });
                        window.removeEventListener('pointerup', onUp, { capture: true });
                        window.removeEventListener('touchmove', onMove, { capture: true });
                        window.removeEventListener('touchend', onUp, { capture: true });

                        if (aMarker.dragging && typeof aMarker.dragging.enable === 'function') {
                            aMarker.dragging.enable();
                        }
                        self.saveLastLocation({ measureData: self.getMeasureDataToSave() });
                    };

                    window.addEventListener('pointermove', onMove, { capture: true, passive: false });
                    window.addEventListener('pointerup', onUp, { capture: true });
                    window.addEventListener('touchmove', onMove, { capture: true, passive: false });
                    window.addEventListener('touchend', onUp, { capture: true });
                };

                resHandle.addEventListener('pointerdown', onResDown);
                resHandle.addEventListener('touchstart', onResDown, { passive: false });
            }

            // 4. 🗑️ Silme Tutamacı
            if (delHandle) {
                const onDelAction = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    L.DomEvent.stopPropagation(e);
                    self.deselectMeasureAreaBadge(dId);
                    self.toggleDrawingAreaBadge(dId);
                };

                delHandle.addEventListener('pointerdown', (e) => { e.stopPropagation(); L.DomEvent.stopPropagation(e); });
                delHandle.addEventListener('touchstart', (e) => { e.stopPropagation(); L.DomEvent.stopPropagation(e); }, { passive: false });
                delHandle.addEventListener('click', onDelAction);
            }
        },

        /**
         * Harita Üzerindeki Toplam Mesafe Rozetini Seçer ve Tutamaçları Gösterir
         */
        selectMeasureTotalBadge: function(drawingId) {
            const d = drawingId ? this.measureDrawings.find(x => x.id === drawingId) : this.getActiveDrawing();
            if (d) d.totalBadgeSelected = true;
            this.measureTotalBadgeSelected = true;
            document.querySelectorAll('.sat-measure-total-wrapper').forEach(wrap => {
                if (!drawingId || wrap.dataset.drawingId === drawingId) {
                    wrap.classList.add('is-selected');
                }
            });
        },

        /**
         * Toplam Mesafe Rozeti Seçimini Kaldırır ve Tutamaçları Gizler
         */
        deselectMeasureTotalBadge: function(drawingId) {
            if (drawingId) {
                const d = this.measureDrawings.find(x => x.id === drawingId);
                if (d) d.totalBadgeSelected = false;
            } else {
                if (this.measureDrawings) this.measureDrawings.forEach(d => { d.totalBadgeSelected = false; });
            }
            this.measureTotalBadgeSelected = false;
            document.querySelectorAll('.sat-measure-total-wrapper').forEach(wrap => {
                if (!drawingId || wrap.dataset.drawingId === drawingId) {
                    wrap.classList.remove('is-selected');
                }
            });
        },

        /**
         * Toplam Mesafe Rozetinin Döndürme, Büyütme ve Silme/Kapatma Tutamaç Dinleyicilerini Bağlar
         */
        attachMeasureTotalBadgeListeners: function(tMarker, drawingId) {
            if (!tMarker) return;
            const el = (typeof tMarker.getElement === 'function') ? tMarker.getElement() : tMarker._icon;
            if (!el) {
                setTimeout(() => this.attachMeasureTotalBadgeListeners(tMarker, drawingId), 35);
                return;
            }
            const wrapper = el.querySelector('.sat-measure-total-wrapper');
            if (!wrapper || wrapper._handlesBound) return;
            wrapper._handlesBound = true;

            const self = this;
            const dId = drawingId || wrapper.dataset.drawingId;
            const rotHandle = wrapper.querySelector('.sat-area-rotate-handle');
            const resHandle = wrapper.querySelector('.sat-area-resize-handle');
            const delHandle = wrapper.querySelector('.sat-area-delete-handle');

            // 1. Rozete Tıklandığında Seçim
            wrapper.addEventListener('pointerdown', (e) => {
                if (e.target.closest('.sat-area-handle')) return;
                L.DomEvent.stopPropagation(e);
                self.selectMeasureTotalBadge(dId);
            });

            // 2. 🔄 Döndürme Tutamacı
            if (rotHandle) {
                const onRotDown = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    L.DomEvent.stopPropagation(e);

                    if (tMarker.dragging && typeof tMarker.dragging.disable === 'function') {
                        tMarker.dragging.disable();
                    }

                    const targetD = self.measureDrawings.find(x => x.id === dId);
                    const evt = e.touches ? e.touches[0] : e;
                    const rect = wrapper.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const startAngle = Math.atan2(evt.clientY - centerY, evt.clientX - centerX) * (180 / Math.PI);
                    const startRot = targetD ? (targetD.totalBadgeRotation || 0) : 0;

                    rotHandle.style.cursor = 'grabbing';

                    const onMove = (me) => {
                        me.preventDefault();
                        me.stopPropagation();
                        const mEvt = me.touches ? me.touches[0] : me;
                        const currentAngle = Math.atan2(mEvt.clientY - centerY, mEvt.clientX - centerX) * (180 / Math.PI);
                        let diff = currentAngle - startAngle;
                        let newRot = Math.round((startRot + diff) % 360);
                        if (newRot > 180) newRot -= 360;
                        else if (newRot < -180) newRot += 360;

                        if (targetD) targetD.totalBadgeRotation = newRot;
                        const curScale = targetD ? (targetD.totalBadgeScale || 1.0) : 1.0;
                        wrapper.style.transform = `rotate(${newRot}deg) scale(${curScale})`;
                    };

                    const onUp = () => {
                        rotHandle.style.cursor = 'grab';
                        window.removeEventListener('pointermove', onMove, { capture: true });
                        window.removeEventListener('pointerup', onUp, { capture: true });
                        window.removeEventListener('touchmove', onMove, { capture: true });
                        window.removeEventListener('touchend', onUp, { capture: true });

                        if (tMarker.dragging && typeof tMarker.dragging.enable === 'function') {
                            tMarker.dragging.enable();
                        }
                        self.saveLastLocation({ measureData: self.getMeasureDataToSave() });
                    };

                    window.addEventListener('pointermove', onMove, { capture: true, passive: false });
                    window.addEventListener('pointerup', onUp, { capture: true });
                    window.addEventListener('touchmove', onMove, { capture: true, passive: false });
                    window.addEventListener('touchend', onUp, { capture: true });
                };

                rotHandle.addEventListener('pointerdown', onRotDown);
                rotHandle.addEventListener('touchstart', onRotDown, { passive: false });
            }

            // 3. 📐 Boyutlandırma Tutamacı
            if (resHandle) {
                const onResDown = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    L.DomEvent.stopPropagation(e);

                    if (tMarker.dragging && typeof tMarker.dragging.disable === 'function') {
                        tMarker.dragging.disable();
                    }

                    const targetD = self.measureDrawings.find(x => x.id === dId);
                    const evt = e.touches ? e.touches[0] : e;
                    const rect = wrapper.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const startDist = Math.hypot(evt.clientX - centerX, evt.clientY - centerY);
                    const startScale = targetD ? (targetD.totalBadgeScale || 1.0) : 1.0;

                    const onMove = (me) => {
                        me.preventDefault();
                        me.stopPropagation();
                        const mEvt = me.touches ? me.touches[0] : me;
                        const curDist = Math.hypot(mEvt.clientX - centerX, mEvt.clientY - centerY);
                        let ratio = startDist > 0 ? (curDist / startDist) : 1;
                        let newScale = Math.max(0.5, Math.min(3.0, parseFloat((startScale * ratio).toFixed(2))));

                        if (targetD) targetD.totalBadgeScale = newScale;
                        const curRot = targetD ? (targetD.totalBadgeRotation || 0) : 0;
                        wrapper.style.transform = `rotate(${curRot}deg) scale(${newScale})`;
                    };

                    const onUp = () => {
                        window.removeEventListener('pointermove', onMove, { capture: true });
                        window.removeEventListener('pointerup', onUp, { capture: true });
                        window.removeEventListener('touchmove', onMove, { capture: true });
                        window.removeEventListener('touchend', onUp, { capture: true });

                        if (tMarker.dragging && typeof tMarker.dragging.enable === 'function') {
                            tMarker.dragging.enable();
                        }
                        self.saveLastLocation({ measureData: self.getMeasureDataToSave() });
                    };

                    window.addEventListener('pointermove', onMove, { capture: true, passive: false });
                    window.addEventListener('pointerup', onUp, { capture: true });
                    window.addEventListener('touchmove', onMove, { capture: true, passive: false });
                    window.addEventListener('touchend', onUp, { capture: true });
                };

                resHandle.addEventListener('pointerdown', onResDown);
                resHandle.addEventListener('touchstart', onResDown, { passive: false });
            }

            // 4. 🗑️ Silme / Kapatma Tutamacı
            if (delHandle) {
                const onDelAction = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    L.DomEvent.stopPropagation(e);
                    self.deselectMeasureTotalBadge(dId);
                    self.setDrawingDistanceDisplay(dId, 'none');
                };

                delHandle.addEventListener('pointerdown', (e) => { e.stopPropagation(); L.DomEvent.stopPropagation(e); });
                delHandle.addEventListener('touchstart', (e) => { e.stopPropagation(); L.DomEvent.stopPropagation(e); }, { passive: false });
                delHandle.addEventListener('click', onDelAction);
            }
        },

        /**
         * Ölçüm Uç Noktası İçin Draggable Marker Oluşturur
         */
        createMeasureHandleMarker: function(latlng, label, pointIndex, color, drawingId) {
            const handleColor = color || this.measureColor || '#f59e0b';
            const html = `
                <div class="sat-measure-handle-pin" style="--handle-color:${handleColor};" title="Köşe ${label}: Sürükleyerek taşıyın, sağ tıklayarak silin">
                    <span class="sat-handle-core" style="border-color:${handleColor}; color:${handleColor};">${label}</span>
                    <div class="sat-handle-pulse" style="border-color:${handleColor};"></div>
                </div>
            `;
            const icon = L.divIcon({
                className: 'sat-measure-handle-divicon',
                html: html,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });

            const marker = L.marker(latlng, {
                icon: icon,
                draggable: true,
                zIndexOffset: 1600
            });

            marker._pointIndex = pointIndex;
            marker._drawingId = drawingId || (this.getActiveDrawing() ? this.getActiveDrawing().id : null);

            marker.on('drag', (e) => {
                const curPos = e.target.getLatLng();
                const idx = e.target._pointIndex;
                const dId = e.target._drawingId;
                const drawing = dId ? this.measureDrawings.find(d => d.id === dId) : this.getActiveDrawing();
                if (drawing && drawing.points && drawing.points[idx]) {
                    drawing.points[idx] = curPos;
                    this.updateMeasureGraphics(true);
                }
            });

            marker.on('dragend', () => {
                this.updateMeasureGraphics();
                this.saveLastLocation({
                    measureData: this.getMeasureDataToSave()
                });
            });

            marker.on('click', (e) => {
                L.DomEvent.stopPropagation(e);
                const dId = marker._drawingId;
                const drawing = dId ? this.measureDrawings.find(d => d.id === dId) : this.getActiveDrawing();
                if (drawing && marker._pointIndex === 0 && drawing.points.length >= 3 && !drawing.isClosed) {
                    this.toggleDrawingClosed(drawing.id);
                }
            });

            marker.on('contextmenu', (e) => {
                L.DomEvent.stopPropagation(e);
                this.removeMeasurePointAtIndex(marker._pointIndex, marker._drawingId);
            });

            return marker;
        },

        /**
         * Tutamaç İçeriğini Günceller
         */
        updateMeasureHandleMarkerContent: function(marker, label, color) {
            marker._pointIndex = parseInt(label) - 1;
            const el = marker.getElement();
            if (!el) return;
            const pin = el.querySelector('.sat-measure-handle-pin');
            if (pin && color) {
                pin.style.setProperty('--handle-color', color);
            }
            const core = el.querySelector('.sat-handle-core');
            if (core) {
                core.textContent = label;
                if (color) {
                    core.style.borderColor = color;
                    core.style.color = color;
                }
            }
            const pulse = el.querySelector('.sat-handle-pulse');
            if (pulse && color) {
                pulse.style.borderColor = color;
            }
        },

        createMeasureMidpointMarker: function() {
            return null;
        },

        /**
         * Haritadaki Tüm Ölçüm Katmanlarını Kaldırır
         */
        removeMeasureGraphicsFromMap: function() {
            if (!this.map) return;
            if (this.measureDrawings && Array.isArray(this.measureDrawings)) {
                this.measureDrawings.forEach(d => this.removeLayersForDrawing(d));
            }
            if (this.measureMarkers && this.measureMarkers.length > 0) {
                this.measureMarkers.forEach(m => {
                    if (m && this.map.hasLayer(m)) this.map.removeLayer(m);
                });
                this.measureMarkers = [];
            }
            if (this.measureLines && this.measureLines.length > 0) {
                this.measureLines.forEach(l => {
                    if (l && this.map.hasLayer(l)) this.map.removeLayer(l);
                });
                this.measureLines = [];
            }
            if (this.measureBadgeMarkers && this.measureBadgeMarkers.length > 0) {
                this.measureBadgeMarkers.forEach(b => {
                    if (b && this.map.hasLayer(b)) this.map.removeLayer(b);
                });
                this.measureBadgeMarkers = [];
            }
            if (this.measureMidpointMarkers && this.measureMidpointMarkers.length > 0) {
                this.measureMidpointMarkers.forEach(m => {
                    if (m && this.map.hasLayer(m)) this.map.removeLayer(m);
                });
                this.measureMidpointMarkers = [];
            }
            if (this.measurePolygonLayer && this.map.hasLayer(this.measurePolygonLayer)) {
                this.map.removeLayer(this.measurePolygonLayer);
                this.measurePolygonLayer = null;
            }
            if (this.measureAreaBadgeMarker && this.map.hasLayer(this.measureAreaBadgeMarker)) {
                this.map.removeLayer(this.measureAreaBadgeMarker);
                this.measureAreaBadgeMarker = null;
            }
            if (this.parcelPolygon && this.map) {
                if (!this.map.hasLayer(this.parcelPolygon)) {
                    this.parcelPolygon.addTo(this.map);
                }
                this.updateParcelPolygonStyle();
            }
        },

        /**
         * Tuval Aktarımında Vektörel Çoklu Ölçüm Çizgilerini, Cephe Rozetlerini & Alan Rozetini Çizer (1080p, 2K, 4K Tam Uyumlu)
         */
        drawVectorMeasurement: function(ctx, targetW, mapContainer, cropInfo, options = {}) {
            if (!this.measureActive) return;
            const drawings = this.getAllDrawings().filter(d => d.visible !== false && d.points && d.points.length >= 2);
            if (drawings.length === 0) return;

            this._cachedMeasureCanvasBadgesList = [];

            drawings.forEach(drawing => {
                this._drawSingleVectorMeasurement(ctx, drawing, targetW, mapContainer, cropInfo, options);
            });

            // Geriye dönük uyumluluk: tekil önbellek aktif veya ilk çizim verisini tutsun
            if (this._cachedMeasureCanvasBadgesList.length > 0) {
                const activeCached = this._cachedMeasureCanvasBadgesList.find(b => b.drawingId === this.activeDrawingId) || this._cachedMeasureCanvasBadgesList[0];
                this._cachedMeasureCanvasBadges = activeCached;
            }
        },

        _drawSingleVectorMeasurement: function(ctx, drawing, targetW, mapContainer, cropInfo, options = {}) {
            if (!drawing || !drawing.points || drawing.points.length < 2) return;
            const pts = drawing.points;
            const bakeBadges = options.bakeBadges !== false;
            const bakeHandles = (options && options.bakeHandles === true && drawing.showHandles !== false && drawing.id === this.activeDrawingId);

            try {
                ctx.save();

                // Koordinat dönüştürme fonksiyonu (Harita -> Tuval)
                const latLngToCanvasPoint = (p) => {
                    if (!p || !this.map) return null;
                    const pt = this.map.latLngToContainerPoint(p);
                    if (cropInfo) {
                        const targetH = (targetW / (cropInfo.cropW || 800)) * (cropInfo.cropH || 450);
                        return {
                            x: ((pt.x - cropInfo.cropX) / cropInfo.cropW) * targetW,
                            y: ((pt.y - cropInfo.cropY) / cropInfo.cropH) * targetH
                        };
                    } else {
                        const wrapW = mapContainer ? mapContainer.offsetWidth : 800;
                        const scale = targetW / wrapW;
                        return {
                            x: pt.x * scale,
                            y: pt.y * scale
                        };
                    }
                };

                // Tüm noktaları tuval piksel koordinatlarına dönüştür
                const canvasPts = [];
                for (let i = 0; i < pts.length; i++) {
                    const cp = latLngToCanvasPoint(pts[i]);
                    if (cp) canvasPts.push(cp);
                }

                if (canvasPts.length < 2) {
                    ctx.restore();
                    return;
                }

                const baseScale = Math.max(1.0, Math.min(3.2, targetW / 1280));
                const color = drawing.color || '#f59e0b';
                const style = drawing.style || 'cad';
                const isClosed = drawing.isClosed && (canvasPts.length >= 3);
                const edgeCount = isClosed ? canvasPts.length : (canvasPts.length - 1);

                // Tuvale canlı aktarılacak rozetlerin koordinat ve metin verilerini önbelleğe al
                const drawingBadgeData = {
                    drawingId: drawing.id,
                    drawingTitle: drawing.title,
                    color: color,
                    fontFamily: this.measureFontFamily || 'Montserrat',
                    edges: [],
                    totalDistance: null,
                    area: null
                };

                // 1. Poligon Yarı Saydam Dolgusu (Kapalıysa)
                if (isClosed) {
                    ctx.save();
                    ctx.beginPath();
                    canvasPts.forEach((p, idx) => {
                        if (idx === 0) ctx.moveTo(p.x, p.y);
                        else ctx.lineTo(p.x, p.y);
                    });
                    ctx.closePath();
                    ctx.fillStyle = this.hexToRgba(color, 0.16);
                    ctx.fill();
                    ctx.restore();
                }

                // 2. Kenar Sınır Çizgileri
                if (isClosed && canvasPts.length >= 3) {
                    // 🛡️ Kapalı Poligon / Arsa Sınırı: Tek parça, pürüzsüz ve temiz arsa sınır çizgisi
                    ctx.save();
                    ctx.beginPath();
                    canvasPts.forEach((p, idx) => {
                        if (idx === 0) ctx.moveTo(p.x, p.y);
                        else ctx.lineTo(p.x, p.y);
                    });
                    ctx.closePath();
                    ctx.lineJoin = 'round';
                    ctx.lineCap = 'round';

                    if (style === 'neon') {
                        ctx.shadowColor = color;
                        ctx.shadowBlur = 24 * baseScale;
                        ctx.strokeStyle = this.hexToRgba(color, 0.75);
                        ctx.lineWidth = 7 * baseScale;
                        ctx.stroke();

                        ctx.shadowColor = 'transparent';
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 2.4 * baseScale;
                        ctx.stroke();
                    } else if (style === 'dashed') {
                        ctx.setLineDash([9 * baseScale, 6 * baseScale]);
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 3.2 * baseScale;
                        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                        ctx.shadowBlur = 5 * baseScale;
                        ctx.stroke();
                    } else {
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 3.2 * baseScale;
                        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                        ctx.shadowBlur = 5 * baseScale;
                        ctx.stroke();
                    }
                    ctx.restore();
                }

                // 3. Kenar Çizgileri (Sadece Açık Çizgilerde) ve Mesafe Rozetleri
                for (let i = 0; i < edgeCount; i++) {
                    const pA = canvasPts[i];
                    const pB = canvasPts[(i + 1) % canvasPts.length];
                    const origA = pts[i];
                    const origB = pts[(i + 1) % pts.length];

                    const dx = pB.x - pA.x;
                    const dy = pB.y - pA.y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    if (len < 5) continue;

                    const ux = dx / len;
                    const uy = dy / len;
                    const nx = -uy;
                    const ny = ux;

                    // Eğer poligon kapalı değilse (açık çizgi / cetvel ölçümü), çizgiyi segment olarak çiz
                    if (!isClosed) {
                        if (style === 'neon') {
                            ctx.save();
                            ctx.beginPath();
                            ctx.moveTo(pA.x, pA.y);
                            ctx.lineTo(pB.x, pB.y);
                            ctx.shadowColor = color;
                            ctx.shadowBlur = 24 * baseScale;
                            ctx.strokeStyle = this.hexToRgba(color, 0.7);
                            ctx.lineWidth = 8 * baseScale;
                            ctx.lineCap = 'round';
                            ctx.stroke();
                            ctx.restore();

                            ctx.beginPath();
                            ctx.moveTo(pA.x, pA.y);
                            ctx.lineTo(pB.x, pB.y);
                            ctx.strokeStyle = color;
                            ctx.lineWidth = 3.2 * baseScale;
                            ctx.lineCap = 'round';
                            ctx.stroke();
                        } else if (style === 'arrow') {
                            ctx.beginPath();
                            ctx.moveTo(pA.x, pA.y);
                            ctx.lineTo(pB.x, pB.y);
                            ctx.strokeStyle = color;
                            ctx.lineWidth = 3.5 * baseScale;
                            ctx.lineCap = 'round';
                            ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
                            ctx.shadowBlur = 4 * baseScale;
                            ctx.stroke();

                            if (canvasPts.length === 2) {
                                const arrowLen = 14 * baseScale;
                                const arrowAngle = 0.45;
                                ctx.beginPath();
                                ctx.moveTo(pA.x, pA.y);
                                ctx.lineTo(pA.x + (ux * Math.cos(arrowAngle) - uy * Math.sin(arrowAngle)) * arrowLen,
                                           pA.y + (uy * Math.cos(arrowAngle) + ux * Math.sin(arrowAngle)) * arrowLen);
                                ctx.moveTo(pA.x, pA.y);
                                ctx.lineTo(pA.x + (ux * Math.cos(-arrowAngle) - uy * Math.sin(-arrowAngle)) * arrowLen,
                                           pA.y + (uy * Math.cos(-arrowAngle) + ux * Math.sin(-arrowAngle)) * arrowLen);
                                ctx.moveTo(pB.x, pB.y);
                                ctx.lineTo(pB.x - (ux * Math.cos(arrowAngle) - uy * Math.sin(arrowAngle)) * arrowLen,
                                           pB.y - (uy * Math.cos(arrowAngle) + ux * Math.sin(arrowAngle)) * arrowLen);
                                ctx.moveTo(pB.x, pB.y);
                                ctx.lineTo(pB.x - (ux * Math.cos(-arrowAngle) - uy * Math.sin(-arrowAngle)) * arrowLen,
                                           pB.y - (uy * Math.cos(-arrowAngle) + ux * Math.sin(-arrowAngle)) * arrowLen);
                                ctx.strokeStyle = color;
                                ctx.lineWidth = 3.5 * baseScale;
                                ctx.stroke();
                            }
                        } else if (style === 'dashed') {
                            ctx.save();
                            ctx.beginPath();
                            ctx.moveTo(pA.x, pA.y);
                            ctx.lineTo(pB.x, pB.y);
                            ctx.setLineDash([9 * baseScale, 6 * baseScale]);
                            ctx.strokeStyle = color;
                            ctx.lineWidth = 3.2 * baseScale;
                            ctx.stroke();
                            ctx.restore();
                        } else {
                            ctx.beginPath();
                            ctx.moveTo(pA.x, pA.y);
                            ctx.lineTo(pB.x, pB.y);
                            ctx.strokeStyle = color;
                            ctx.lineWidth = 3.2 * baseScale;
                            ctx.lineCap = 'round';
                            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                            ctx.shadowBlur = 5 * baseScale;
                            ctx.stroke();

                            if (canvasPts.length === 2) {
                                const tickLen = 13 * baseScale;
                                [ [pA.x, pA.y], [pB.x, pB.y] ].forEach(([x, y]) => {
                                    ctx.beginPath();
                                    ctx.moveTo(x - nx * tickLen, y - ny * tickLen);
                                    ctx.lineTo(x + nx * tickLen, y + ny * tickLen);
                                    ctx.strokeStyle = color;
                                    ctx.lineWidth = 3.5 * baseScale;
                                    ctx.stroke();
                                });
                            }
                        }
                    }

                    // 3. Kenar Mesafe Rozeti (Taşınmış koordinat desteği)
                    const isEdgeHidden = (drawing.distanceMode === 'total') || (drawing.distanceMode === 'none') || (drawing.showEdgeDistances === false) || !!(drawing.hiddenEdges && drawing.hiddenEdges[i]);
                    if (!isEdgeHidden) {
                        const segDist = origA.distanceTo(origB);
                        const segDistStr = (segDist >= 1000) ? (segDist / 1000).toFixed(2) + ' km' : segDist.toFixed(1) + ' m';
                        const edgeLabel = (canvasPts.length <= 2) ? this.getFormattedMeasureText(segDist, false, drawing.preset, drawing.customText) : segDistStr;

                        let badgeX, badgeY;
                        const isCustomEdgeBadge = (drawing.badgeMarkers && drawing.badgeMarkers[i] && drawing.badgeMarkers[i]._hasBeenDragged) ||
                                                  (drawing.badgeCustomPositions && (drawing.badgeCustomPositions[i] || drawing.badgeCustomPositions[String(i)]));

                        let markerLatLng = null;
                        if (isCustomEdgeBadge) {
                            if (drawing.badgeMarkers && drawing.badgeMarkers[i] && typeof drawing.badgeMarkers[i].getLatLng === 'function') {
                                markerLatLng = drawing.badgeMarkers[i].getLatLng();
                            } else if (drawing.badgeCustomPositions) {
                                markerLatLng = drawing.badgeCustomPositions[i] || drawing.badgeCustomPositions[String(i)];
                            }
                        }

                        if (markerLatLng) {
                            const customCp = latLngToCanvasPoint(markerLatLng);
                            if (customCp && !isNaN(customCp.x) && !isNaN(customCp.y)) {
                                badgeX = customCp.x;
                                badgeY = customCp.y;
                            }
                        }

                        if (badgeX === undefined) {
                            const midX = (pA.x + pB.x) / 2;
                            const midY = (pA.y + pB.y) / 2;
                            const offsetDist = 24 * baseScale;
                            const badgeNormY = (ny < 0) ? ny : -ny;
                            const badgeNormX = (ny < 0) ? nx : -nx;
                            badgeX = midX + badgeNormX * offsetDist;
                            badgeY = midY + badgeNormY * offsetDist;
                        }

                        drawingBadgeData.edges.push({
                            index: i,
                            label: edgeLabel,
                            x: badgeX,
                            y: badgeY
                        });

                        if (bakeBadges) {
                            ctx.save();
                            ctx.translate(badgeX, badgeY);

                            const fontFamily = this.measureFontFamily || 'Montserrat';
                            const edgeFontSize = Math.round((this.measureEdgeFontSize || 12) * baseScale);
                            ctx.font = `bold ${edgeFontSize}px "${fontFamily}", -apple-system, sans-serif`;
                            const textW = ctx.measureText(edgeLabel).width;
                            const badgeW = Math.max(68 * baseScale, textW + (22 * baseScale));
                            const badgeH = Math.round(edgeFontSize * 1.8) + (6 * baseScale);
                            const bX = -(badgeW / 2);
                            const bY = -(badgeH / 2);

                            ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
                            ctx.shadowBlur = 10 * baseScale;
                            ctx.shadowOffsetY = 3 * baseScale;

                            ctx.beginPath();
                            if (typeof ctx.roundRect === 'function') {
                                ctx.roundRect(bX, bY, badgeW, badgeH, 6 * baseScale);
                            } else {
                                ctx.rect(bX, bY, badgeW, badgeH);
                            }
                            ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
                            ctx.fill();

                            ctx.lineWidth = 1.6 * baseScale;
                            ctx.strokeStyle = color;
                            ctx.stroke();

                            ctx.shadowColor = 'transparent';
                            ctx.fillStyle = '#ffffff';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(edgeLabel, 0, 0);

                            ctx.restore();
                        }
                    }
                }

                // 3.1 Toplam Mesafe Rozeti (Eğer distanceMode === 'total' ise)
                if (drawing.distanceMode === 'total' && canvasPts.length >= 2) {
                    const totalDist = drawing.perimeterMeters || this.calculatePolygonPerimeter(pts, isClosed);
                    const totalLabel = this.getFormattedMeasureText(totalDist, false, drawing.preset, drawing.customText, true);

                    let badgeX, badgeY;
                    let markerLatLng = null;

                    if (drawing.totalBadgeCustomPos) {
                        markerLatLng = (drawing.totalBadgeMarker && typeof drawing.totalBadgeMarker.getLatLng === 'function')
                            ? drawing.totalBadgeMarker.getLatLng()
                            : drawing.totalBadgeCustomPos;
                    } else if (drawing.totalBadgeMarker && drawing.totalBadgeMarker._hasBeenDragged && typeof drawing.totalBadgeMarker.getLatLng === 'function') {
                        markerLatLng = drawing.totalBadgeMarker.getLatLng();
                    } else {
                        markerLatLng = (drawing.totalBadgeMarker && typeof drawing.totalBadgeMarker.getLatLng === 'function')
                            ? drawing.totalBadgeMarker.getLatLng()
                            : this.getPolylineMidpoint(pts, isClosed);
                    }

                    if (markerLatLng) {
                        const customCp = latLngToCanvasPoint(markerLatLng);
                        if (customCp && !isNaN(customCp.x) && !isNaN(customCp.y)) {
                            badgeX = customCp.x;
                            badgeY = customCp.y;
                        }
                    }

                    if (badgeX === undefined) {
                        const midIdx = Math.floor(canvasPts.length / 2);
                        badgeX = canvasPts[midIdx].x;
                        badgeY = canvasPts[midIdx].y;
                    }

                    drawingBadgeData.totalDistance = {
                        label: totalLabel,
                        x: badgeX,
                        y: badgeY,
                        rotation: drawing.totalBadgeRotation || 0,
                        scale: drawing.totalBadgeScale || 1.0
                    };

                    if (bakeBadges) {
                        ctx.save();
                        ctx.translate(badgeX, badgeY);
                        if (drawing.totalBadgeRotation) {
                            ctx.rotate((drawing.totalBadgeRotation * Math.PI) / 180);
                        }
                        if (drawing.totalBadgeScale && drawing.totalBadgeScale !== 1.0) {
                            ctx.scale(drawing.totalBadgeScale, drawing.totalBadgeScale);
                        }

                        const fontFamily = this.measureFontFamily || 'Montserrat';
                        const edgeFontSize = Math.round((this.measureEdgeFontSize || 12) * baseScale);
                        ctx.font = `bold ${edgeFontSize}px "${fontFamily}", -apple-system, sans-serif`;
                        const textW = ctx.measureText(totalLabel).width;
                        const badgeW = Math.max(78 * baseScale, textW + (26 * baseScale));
                        const badgeH = Math.round(edgeFontSize * 1.8) + (6 * baseScale);
                        const bX = -(badgeW / 2);
                        const bY = -(badgeH / 2);

                        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
                        ctx.shadowBlur = 10 * baseScale;
                        ctx.shadowOffsetY = 3 * baseScale;

                        ctx.beginPath();
                        if (typeof ctx.roundRect === 'function') {
                            ctx.roundRect(bX, bY, badgeW, badgeH, 6 * baseScale);
                        } else {
                            ctx.rect(bX, bY, badgeW, badgeH);
                        }
                        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
                        ctx.fill();

                        ctx.lineWidth = 1.6 * baseScale;
                        ctx.strokeStyle = color;
                        ctx.stroke();

                        ctx.shadowColor = 'transparent';
                        ctx.fillStyle = '#ffffff';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(totalLabel, 0, 0);

                        ctx.restore();
                    }
                }

                // 4. Poligon Merkezindeki Büyük Alan Rozeti (3+ Nokta ve Kapalıysa)
                if (isClosed && canvasPts.length >= 3 && (drawing.showArea !== false)) {
                    let cenX, cenY;
                    let areaTargetLatLng = null;

                    if (drawing.areaBadgeCustomPos) {
                        areaTargetLatLng = (drawing.areaBadgeMarker && typeof drawing.areaBadgeMarker.getLatLng === 'function')
                            ? drawing.areaBadgeMarker.getLatLng()
                            : drawing.areaBadgeCustomPos;
                    } else if (drawing.areaBadgeMarker && drawing.areaBadgeMarker._hasBeenDragged && typeof drawing.areaBadgeMarker.getLatLng === 'function') {
                        areaTargetLatLng = drawing.areaBadgeMarker.getLatLng();
                    } else {
                        areaTargetLatLng = (drawing.areaBadgeMarker && typeof drawing.areaBadgeMarker.getLatLng === 'function')
                            ? drawing.areaBadgeMarker.getLatLng()
                            : this.getPolygonCentroid(pts);
                    }

                    if (areaTargetLatLng) {
                        const customAreaCp = latLngToCanvasPoint(areaTargetLatLng);
                        if (customAreaCp && !isNaN(customAreaCp.x) && !isNaN(customAreaCp.y)) {
                            cenX = customAreaCp.x;
                            cenY = customAreaCp.y;
                        }
                    }

                    if (cenX === undefined) {
                        let sumX = 0, sumY = 0;
                        canvasPts.forEach(p => { sumX += p.x; sumY += p.y; });
                        cenX = sumX / canvasPts.length;
                        cenY = sumY / canvasPts.length;
                    }

                    const areaM2 = this.calculateGeodesicPolygonArea(pts);
                    const perimeter = this.calculatePolygonPerimeter(pts, true);
                    const areaInfo = this.getFormattedAreaInfo(areaM2);
                    const perimStr = (perimeter >= 1000) ? (perimeter / 1000).toFixed(2) + ' km' : Math.round(perimeter) + ' m';

                    const areaDisplayMode = drawing.areaDisplayMode || 'frameless';
                    const areaContentMode = drawing.areaContentMode || 'm2_only';
                    const areaFontSize = Math.round((this.measureAreaFontSize || 16) * baseScale);
                    const fontFamily = this.measureFontFamily || 'Montserrat';

                    let titleText = '';
                    let subText = '';

                    if (areaContentMode === 'm2_only') {
                        titleText = `${areaInfo.m2Text}`;
                    } else if (areaContentMode === 'm2_donum') {
                        titleText = `${areaInfo.m2Text} (${areaInfo.donumText})`;
                    } else {
                        titleText = `${areaInfo.m2Text} (${areaInfo.donumText})`;
                        subText = `Çevre: ${perimStr} • ${canvasPts.length} Kenar`;
                    }

                    drawingBadgeData.area = {
                        titleText: titleText,
                        subText: subText,
                        areaDisplayMode: areaDisplayMode,
                        x: cenX,
                        y: cenY,
                        rotation: drawing.areaRotation || 0,
                        scale: drawing.areaScale || 1.0
                    };

                    if (bakeBadges) {
                        ctx.save();
                        ctx.translate(cenX, cenY);
                        if (drawing.areaRotation) {
                            ctx.rotate((drawing.areaRotation * Math.PI) / 180);
                        }
                        if (drawing.areaScale && drawing.areaScale !== 1.0) {
                            ctx.scale(drawing.areaScale, drawing.areaScale);
                        }

                        if (areaDisplayMode === 'frameless') {
                            ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
                            ctx.shadowBlur = 14 * baseScale;
                            ctx.shadowOffsetY = 3 * baseScale;

                            ctx.fillStyle = '#ffffff';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.font = `800 ${areaFontSize}px "${fontFamily}", -apple-system, sans-serif`;
                            ctx.fillText(titleText, 0, subText ? -(8 * baseScale) : 0);

                            if (subText) {
                                ctx.fillStyle = color;
                                ctx.font = `700 ${Math.round(areaFontSize * 0.68)}px "${fontFamily}", -apple-system, sans-serif`;
                                ctx.fillText(subText, 0, 10 * baseScale);
                            }
                        } else {
                            ctx.font = `bold ${areaFontSize}px "${fontFamily}", -apple-system, sans-serif`;
                            const titleW = ctx.measureText('📐 ' + titleText).width;
                            const subW = subText ? ctx.measureText(subText).width : 0;
                            const areaBadgeW = Math.max(titleW, subW) + (32 * baseScale);
                            const areaBadgeH = subText ? (46 * baseScale) : (34 * baseScale);
                            const abX = -(areaBadgeW / 2);
                            const abY = -(areaBadgeH / 2);

                            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
                            ctx.shadowBlur = 16 * baseScale;
                            ctx.shadowOffsetY = 6 * baseScale;

                            ctx.beginPath();
                            if (typeof ctx.roundRect === 'function') {
                                ctx.roundRect(abX, abY, areaBadgeW, areaBadgeH, 8 * baseScale);
                            } else {
                                ctx.rect(abX, abY, areaBadgeW, areaBadgeH);
                            }
                            ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
                            ctx.fill();

                            ctx.lineWidth = 2 * baseScale;
                            ctx.strokeStyle = color;
                            ctx.stroke();

                            ctx.shadowColor = 'transparent';
                            ctx.fillStyle = '#ffffff';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.font = `bold ${areaFontSize}px "${fontFamily}", -apple-system, sans-serif`;
                            ctx.fillText('📐 ' + titleText, 0, subText ? abY + (16 * baseScale) : 0);

                            if (subText) {
                                ctx.fillStyle = color;
                                ctx.font = `600 ${Math.round(areaFontSize * 0.65)}px "${fontFamily}", -apple-system, sans-serif`;
                                ctx.fillText(subText, 0, abY + (33 * baseScale));
                            }
                        }

                        ctx.restore();
                    }
                }

                // 5. Köşe Tutamaç Çemberleri (1, 2, 3...)
                if (bakeHandles && drawing.showHandles !== false) {
                    canvasPts.forEach((p, idx) => {
                        ctx.save();
                        ctx.translate(p.x, p.y);

                        const r = 11 * baseScale;
                        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                        ctx.shadowBlur = 8 * baseScale;

                        ctx.beginPath();
                        ctx.arc(0, 0, r, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
                        ctx.fill();

                        ctx.lineWidth = 2.2 * baseScale;
                        ctx.strokeStyle = color;
                        ctx.stroke();

                        ctx.shadowColor = 'transparent';
                        ctx.fillStyle = color;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.font = `bold ${Math.round(10 * baseScale)}px monospace`;
                        ctx.fillText(`${idx + 1}`, 0, 0.5);

                        ctx.restore();
                    });
                }

                this._cachedMeasureCanvasBadgesList.push(drawingBadgeData);
                ctx.restore();

            } catch(e) {
                console.warn('drawVectorMeasurement hatası:', e);
                ctx.restore();
            }
        },

        /**
         * Ölçüm Rozetlerini (Metre & Alan) Tuval Üzerine Canlı, Serbestçe Taşınabilir SVG Callout Elemanları Olarak Ekler
         */
        addMeasureBadgesToCanvas: function(targetW, targetH) {
            const badgeLists = (this._cachedMeasureCanvasBadgesList && this._cachedMeasureCanvasBadgesList.length > 0)
                ? this._cachedMeasureCanvasBadgesList
                : (this._cachedMeasureCanvasBadges ? [this._cachedMeasureCanvasBadges] : []);

            if (badgeLists.length === 0) return;

            const addSvgFn = (typeof window.addSVGCalloutToCanvas === 'function')
                ? window.addSVGCalloutToCanvas
                : (typeof addSVGCalloutToCanvas === 'function' ? addSVGCalloutToCanvas : null);
            if (!addSvgFn) return;

            // Önceki ölçüm rozetlerini temizle (tekrarlı eklemeyi önle)
            document.querySelectorAll('.sat-measure-badge-callout, .sat-measure-area-callout').forEach(e => e.remove());

            const cContainer = document.getElementById('canvas-container');
            const cW = (cContainer && parseFloat(cContainer.style.width)) || targetW || 1920;
            const cH = (cContainer && parseFloat(cContainer.style.height)) || targetH || 1080;
            const formatRatio = Math.max(1, cW / 1920);

            badgeLists.forEach(badgeData => {
                if ((!badgeData.edges || badgeData.edges.length === 0) && !badgeData.area && !badgeData.totalDistance) return;
                const color = badgeData.color || '#f59e0b';
                const fontFamily = badgeData.fontFamily || 'Montserrat';
                const dTitle = badgeData.drawingTitle || 'Çizim';

                // 1. Kenar Mesafe Rozetleri (Canlı & Sürüklenebilir)
                if (Array.isArray(badgeData.edges)) {
                    badgeData.edges.forEach(edge => {
                        const badgeSvgW = Math.max(88, Math.round(edge.label.length * 11 + 32));
                        const badgeSvgH = 34;
                        const badgeId = 'meas_b_' + (badgeData.drawingId || 'd') + '_' + edge.index + '_' + Math.random().toString(36).substr(2, 5);

                        const svgHtml = `
<svg width="${badgeSvgW}" height="${badgeSvgH}" viewBox="0 0 ${badgeSvgW} ${badgeSvgH}" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision">
  <defs>
    <filter id="sh_${badgeId}" x="-20%" y="-25%" width="140%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.85"/>
    </filter>
  </defs>
  <rect x="2" y="2" width="${badgeSvgW - 4}" height="${badgeSvgH - 4}" rx="6" fill="#0f172a" fill-opacity="0.94" stroke="${color}" stroke-width="1.6" filter="url(#sh_${badgeId})"/>
  <text x="${badgeSvgW / 2}" y="${badgeSvgH / 2 + 1}" font-family="${fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="13" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.3px">${edge.label}</text>
</svg>`.trim();

                        const wrap = addSvgFn({
                            name: `${dTitle} Kenar ${edge.index + 1}: ${edge.label}`,
                            svg: svgHtml
                        });

                        if (wrap) {
                            wrap.classList.add('sat-measure-callout', 'sat-measure-badge-callout');
                            wrap.dataset.isMeasureBadge = 'true';
                            wrap.dataset.drawingId = badgeData.drawingId || '';
                            wrap.dataset.edgeIndex = String(edge.index);
                            wrap.dataset.edgeDist = edge.label;

                            const finalW = Math.round(badgeSvgW * 1.15 * formatRatio);
                            const finalH = Math.round(badgeSvgH * 1.15 * formatRatio);

                            wrap.style.width = finalW + 'px';
                            wrap.style.height = finalH + 'px';
                            const el = wrap.querySelector('.callout-item');
                            if (el) {
                                el.style.width = finalW + 'px';
                                el.style.height = finalH + 'px';
                            }

                            // Rozet merkezini tam haritadaki konumuna denk getir
                            const posX = Math.round(edge.x - finalW / 2);
                            const posY = Math.round(edge.y - finalH / 2);

                            wrap.style.left = posX + 'px';
                            wrap.style.top = posY + 'px';
                        }
                    });
                }

                // 1.1 Toplam Mesafe Rozeti (Canlı & Sürüklenebilir)
                if (badgeData.totalDistance) {
                    const total = badgeData.totalDistance;
                    const badgeSvgW = Math.max(98, Math.round(total.label.length * 11 + 36));
                    const badgeSvgH = 34;
                    const badgeId = 'meas_tot_' + (badgeData.drawingId || 'd') + '_' + Math.random().toString(36).substr(2, 5);

                    const svgHtml = `
<svg width="${badgeSvgW}" height="${badgeSvgH}" viewBox="0 0 ${badgeSvgW} ${badgeSvgH}" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision">
  <defs>
    <filter id="sh_${badgeId}" x="-20%" y="-25%" width="140%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.85"/>
    </filter>
  </defs>
  <rect x="2" y="2" width="${badgeSvgW - 4}" height="${badgeSvgH - 4}" rx="6" fill="#0f172a" fill-opacity="0.94" stroke="${color}" stroke-width="1.8" filter="url(#sh_${badgeId})"/>
  <text x="${badgeSvgW / 2}" y="${badgeSvgH / 2 + 1}" font-family="${fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="13" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.3px">${total.label}</text>
</svg>`.trim();

                    const wrap = addSvgFn({
                        name: `${dTitle} Toplam Mesafe: ${total.label}`,
                        svg: svgHtml
                    });

                    if (wrap) {
                        wrap.classList.add('sat-measure-callout', 'sat-measure-badge-callout', 'sat-measure-total-callout');
                        wrap.dataset.isMeasureBadge = 'true';
                        wrap.dataset.isMeasureTotalBadge = 'true';
                        wrap.dataset.drawingId = badgeData.drawingId || '';
                        wrap.dataset.totalDist = total.label;

                        const finalW = Math.round(badgeSvgW * 1.15 * formatRatio);
                        const finalH = Math.round(badgeSvgH * 1.15 * formatRatio);

                        wrap.style.width = finalW + 'px';
                        wrap.style.height = finalH + 'px';
                        const el = wrap.querySelector('.callout-item');
                        if (el) {
                            el.style.width = finalW + 'px';
                            el.style.height = finalH + 'px';
                        }

                        const posX = Math.round(total.x - finalW / 2);
                        const posY = Math.round(total.y - finalH / 2);

                        wrap.style.left = posX + 'px';
                        wrap.style.top = posY + 'px';

                        const totalScale = (total.scale !== undefined && !isNaN(total.scale)) ? total.scale : 1.0;
                        const rotation = (total.rotation !== undefined && !isNaN(total.rotation)) ? total.rotation : 0;

                        wrap.dataset.rotation = String(rotation);
                        wrap.dataset.scale = String(totalScale);
                        wrap.dataset.userScale = String(totalScale);
                        wrap.style.transform = `rotate(${rotation}deg) scale(${totalScale})`;
                    }
                }

                // 2. Alan Rozeti (Canlı & Sürüklenebilir)
                if (badgeData.area) {
                    const area = badgeData.area;
                    const areaBadgeId = 'meas_area_' + (badgeData.drawingId || 'd') + '_' + Math.random().toString(36).substr(2, 5);
                    let areaSvgHtml = '';
                    let badgeSvgW, badgeSvgH;

                    if (area.areaDisplayMode === 'boxed') {
                        const titleW = Math.round(area.titleText.length * 10.5 + 44);
                        const subW = area.subText ? Math.round(area.subText.length * 7.5 + 32) : 0;
                        badgeSvgW = Math.max(170, Math.max(titleW, subW) + 24);
                        badgeSvgH = area.subText ? 52 : 38;

                        areaSvgHtml = `
<svg width="${badgeSvgW}" height="${badgeSvgH}" viewBox="0 0 ${badgeSvgW} ${badgeSvgH}" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision">
  <defs>
    <filter id="sh_${areaBadgeId}" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.9"/>
    </filter>
  </defs>
  <rect x="2" y="2" width="${badgeSvgW - 4}" height="${badgeSvgH - 4}" rx="8" fill="#0f172a" fill-opacity="0.96" stroke="${color}" stroke-width="2" filter="url(#sh_${areaBadgeId})"/>
  <text x="${badgeSvgW / 2}" y="${area.subText ? 20 : badgeSvgH / 2 + 1}" font-family="${fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="14" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.2px">📐 ${area.titleText}</text>
  ${area.subText ? `<text x="${badgeSvgW / 2}" y="37" font-family="${fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif" font-weight="600" font-size="11" fill="${color}" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.2px">${area.subText}</text>` : ''}
</svg>`.trim();
                    } else {
                        const titleW = Math.round(area.titleText.length * 12 + 30);
                        const subW = area.subText ? Math.round(area.subText.length * 8 + 20) : 0;
                        badgeSvgW = Math.max(160, Math.max(titleW, subW) + 16);
                        badgeSvgH = area.subText ? 48 : 34;

                        areaSvgHtml = `
<svg width="${badgeSvgW}" height="${badgeSvgH}" viewBox="0 0 ${badgeSvgW} ${badgeSvgH}" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision">
  <defs>
    <filter id="sh_${areaBadgeId}" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.95"/>
    </filter>
  </defs>
  <text x="${badgeSvgW / 2}" y="${area.subText ? 18 : badgeSvgH / 2 + 1}" font-family="${fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="16" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.3px" filter="url(#sh_${areaBadgeId})">${area.titleText}</text>
  ${area.subText ? `<text x="${badgeSvgW / 2}" y="35" font-family="${fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="11.5" fill="${color}" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.2px" filter="url(#sh_${areaBadgeId})">${area.subText}</text>` : ''}
</svg>`.trim();
                    }

                    const wrap = addSvgFn({
                        name: `${dTitle} Alanı: ${area.titleText}`,
                        svg: areaSvgHtml
                    });

                    if (wrap) {
                        wrap.classList.add('sat-measure-callout', 'sat-measure-area-callout');
                        wrap.dataset.isMeasureAreaBadge = 'true';
                        wrap.dataset.drawingId = badgeData.drawingId || '';

                        const finalW = Math.round(badgeSvgW * 1.25 * formatRatio);
                        const finalH = Math.round(badgeSvgH * 1.25 * formatRatio);

                        wrap.style.width = finalW + 'px';
                        wrap.style.height = finalH + 'px';
                        const el = wrap.querySelector('.callout-item');
                        if (el) {
                            el.style.width = finalW + 'px';
                            el.style.height = finalH + 'px';
                        }

                        const posX = Math.round(area.x - finalW / 2);
                        const posY = Math.round(area.y - finalH / 2);

                        wrap.style.left = posX + 'px';
                        wrap.style.top = posY + 'px';

                        const areaScale = (area.scale !== undefined && !isNaN(area.scale)) ? area.scale : 1.0;
                        const rotation = (area.rotation !== undefined && !isNaN(area.rotation)) ? area.rotation : 0;

                        wrap.dataset.rotation = String(rotation);
                        wrap.dataset.scale = String(areaScale);
                        wrap.dataset.userScale = String(areaScale);
                        wrap.style.transform = `rotate(${rotation}deg) scale(${areaScale})`;
                    }
                }
            });

            if (typeof window.recordHistory === 'function') {
                window.recordHistory('Ölçüm Rozetleri Tuvale Eklendi');
            }
        },

        /**
         * Ölçüm Paneli Arayüz Elemanlarını (Renk, Stil, Font, Çipler, Filtreler) Mevcut Ayarlarla Eşler
         */
        syncMeasureUI: function() {
            // 0. 2D / 3D Mod Uyarlaması
            this.updateUIModeFor2D3D(this.is3DActive);

            // 1. Özel Metin Inputu
            const input = document.getElementById('satMeasureTextInput');
            if (input) input.value = this.measureCustomText || '';

            // 2. Hızlı Metin Şablonu Çipleri
            document.querySelectorAll('.sat-measure-chip[data-preset]').forEach(chip => {
                chip.classList.toggle('active', chip.dataset.preset === (this.measurePreset || 'frontage'));
            });

            // 3. Çizgi ve İşaretleme Stili Butonları
            document.querySelectorAll('.sat-measure-style-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.style === (this.measureStyle || 'cad'));
            });

            // 4. Renk Paleti, Dolgu ve Neon Kontrolleri Senkronizasyonu
            this.syncAllColorPickersUI();

            // 5. Beyaz Parsel Katmanı Göz Butonu
            this.updateMeasureParcelVisibilityButton();

            // 6. Gösterim Butonları (Kenarlar, Arsa m², Köşeler)
            const edgeVisBtn = document.getElementById('satVisEdgeDistancesBtn');
            if (edgeVisBtn) edgeVisBtn.classList.toggle('active', this.measureShowEdgeDistances !== false);
            const areaVisBtn = document.getElementById('satVisAreaBtn');
            if (areaVisBtn) areaVisBtn.classList.toggle('active', this.measureShowArea !== false);
            const handlesVisBtn = document.getElementById('satVisHandlesBtn');
            if (handlesVisBtn) handlesVisBtn.classList.toggle('active', this.measureShowHandles !== false);

            // 7. Alan Görünüm ve İçerik Butonları
            const framelessBtn = document.getElementById('satAreaModeFramelessBtn');
            const boxBtn = document.getElementById('satAreaModeBoxBtn');
            if (framelessBtn) framelessBtn.classList.toggle('active', (this.measureAreaDisplayMode || 'frameless') === 'frameless');
            if (boxBtn) boxBtn.classList.toggle('active', this.measureAreaDisplayMode === 'box');

            const m2OnlyBtn = document.getElementById('satAreaContentM2OnlyBtn');
            const m2DonumBtn = document.getElementById('satAreaContentM2DonumBtn');
            const detailedBtn = document.getElementById('satAreaContentDetailedBtn');
            if (m2OnlyBtn) m2OnlyBtn.classList.toggle('active', (this.measureAreaContentMode || 'm2_only') === 'm2_only');
            if (m2DonumBtn) m2DonumBtn.classList.toggle('active', this.measureAreaContentMode === 'm2_donum');
            if (detailedBtn) detailedBtn.classList.toggle('active', this.measureAreaContentMode === 'detailed');

            // 8. Font ve Boyut Arayüzü
            this.populateMeasureFonts();
            const fontSel = document.getElementById('satMeasureFontSelect');
            if (fontSel) fontSel.value = this.measureFontFamily || 'Montserrat';

            const curSize = (this.measureFontTarget === 'edges') ? (this.measureEdgeFontSize || 12) : (this.measureAreaFontSize || 16);
            const sizeEl = document.getElementById('satMeasureFontSizeText');
            if (sizeEl) sizeEl.textContent = `${curSize}px`;

            const allBtn = document.getElementById('satFontTargetAllBtn');
            const areaBtn = document.getElementById('satFontTargetAreaBtn');
            const edgesBtn = document.getElementById('satFontTargetEdgesBtn');
            if (allBtn) allBtn.classList.toggle('active', (this.measureFontTarget || 'all') === 'all');
            if (areaBtn) areaBtn.classList.toggle('active', this.measureFontTarget === 'area');
            if (edgesBtn) edgesBtn.classList.toggle('active', this.measureFontTarget === 'edges');

            // 9. Küçültme (Collapse) İkonu
            const minIcon = document.getElementById('satMeasureMinIcon');
            if (minIcon) {
                minIcon.className = this.measurePanelCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
            }
            const minBtn = minIcon ? minIcon.closest('.sat-measure-btn-min') : null;
            if (minBtn) {
                minBtn.title = this.measurePanelCollapsed ? 'Paneli Büyüt (Aç)' : 'Paneli Küçült';
            }

            // 10. Etkileşim Modu (Nokta / Gezin)
            const drawBtn = document.getElementById('satMeasureModeDrawBtn');
            const panBtn = document.getElementById('satMeasureModePanBtn');
            if (drawBtn) drawBtn.classList.toggle('active', (this.measureInteractionMode || 'draw') === 'draw');
            if (panBtn) panBtn.classList.toggle('active', this.measureInteractionMode === 'pan');

            // 11. Parsel Kenar Kilit Butonları
            this.updateParcelSnapButtons();

            // 12. Kenar Çipleri Listesi
            if (this.measurePoints && this.measurePoints.length >= 2) {
                this.updateEdgeSelectorUI(this.measurePoints, this.measureIsClosed);
            }

            // 13. Akordiyon Çizimler Listesi Render
            this.renderDrawingsListUI();
        },

        /**
         * Kaydedilecek Ölçüm Verilerini Döndürür (Çoklu Çizimler Destekli)
         */
        getMeasureDataToSave: function() {
            const active = this.getActiveDrawing();
            const drawings = (this.measureDrawings || []).map(d => ({
                id: d.id,
                title: d.title,
                visible: d.visible !== false,
                isExpanded: !!d.isExpanded,
                points: (d.points && d.points.length > 0) ? d.points.map(p => ({ lat: p.lat, lng: p.lng })) : [],
                distanceMeters: d.distanceMeters || 0,
                areaM2: d.areaM2 || 0,
                perimeterMeters: d.perimeterMeters || 0,
                isClosed: !!d.isClosed,
                style: d.style || 'cad',
                color: d.color || '#f59e0b',
                preset: d.preset || 'frontage',
                customText: d.customText || '',
                distanceMode: d.distanceMode || 'edges',
                showEdgeDistances: d.showEdgeDistances !== false,
                showArea: d.showArea !== false,
                showHandles: d.showHandles !== false,
                hiddenEdges: d.hiddenEdges || {},
                badgeCustomPositions: d.badgeCustomPositions
                    ? Object.keys(d.badgeCustomPositions).reduce((acc, k) => {
                        const p = d.badgeCustomPositions[k];
                        if (p) acc[k] = { lat: p.lat, lng: p.lng };
                        return acc;
                    }, {})
                    : {},
                totalBadgeCustomPos: d.totalBadgeCustomPos ? { lat: d.totalBadgeCustomPos.lat, lng: d.totalBadgeCustomPos.lng } : null,
                totalBadgeRotation: d.totalBadgeRotation || 0,
                totalBadgeScale: d.totalBadgeScale || 1.0,
                areaBadgeCustomPos: d.areaBadgeCustomPos ? { lat: d.areaBadgeCustomPos.lat, lng: d.areaBadgeCustomPos.lng } : null,
                areaRotation: d.areaRotation || 0,
                areaScale: d.areaScale || 1.0,
                areaDisplayMode: d.areaDisplayMode || 'frameless',
                areaContentMode: d.areaContentMode || 'm2_only'
            }));

            return {
                active: !!this.measureActive,
                panelVisible: (this.measurePanelVisible !== undefined ? !!this.measurePanelVisible : true),
                activeDrawingId: this.activeDrawingId || (drawings[0] ? drawings[0].id : 'draw_1'),
                drawings: drawings,
                // Tekil çizim geriye dönük uyumluluk alanları:
                points: active && active.points ? active.points.map(p => ({ lat: p.lat, lng: p.lng })) : [],
                distanceMeters: active ? (active.distanceMeters || 0) : 0,
                areaM2: active ? (active.areaM2 || 0) : 0,
                perimeterMeters: active ? (active.perimeterMeters || 0) : 0,
                isClosed: active ? !!active.isClosed : false,
                interactionMode: this.measureInteractionMode || 'draw',
                preset: active ? (active.preset || 'frontage') : 'frontage',
                customText: active ? (active.customText || '') : '',
                style: active ? (active.style || 'cad') : 'cad',
                color: active ? (active.color || '#f59e0b') : '#f59e0b',
                edgeIndex: this.measureEdgeIndex || 0,
                collapsed: !!this.measurePanelCollapsed,
                distanceMode: active ? (active.distanceMode || 'edges') : 'edges',
                badgeCustomPositions: active && active.badgeCustomPositions
                    ? Object.keys(active.badgeCustomPositions).reduce((acc, k) => {
                        const p = active.badgeCustomPositions[k];
                        if (p) acc[k] = { lat: p.lat, lng: p.lng };
                        return acc;
                    }, {})
                    : {},
                totalBadgeCustomPos: active && active.totalBadgeCustomPos ? { lat: active.totalBadgeCustomPos.lat, lng: active.totalBadgeCustomPos.lng } : null,
                totalBadgeRotation: active ? (active.totalBadgeRotation || 0) : 0,
                totalBadgeScale: active ? (active.totalBadgeScale || 1.0) : 1.0,
                areaBadgeCustomPos: active && active.areaBadgeCustomPos ? { lat: active.areaBadgeCustomPos.lat, lng: active.areaBadgeCustomPos.lng } : null,
                areaRotation: active ? (active.areaRotation || 0) : 0,
                areaScale: active ? (active.areaScale || 1.0) : 1.0,
                areaDisplayMode: active ? (active.areaDisplayMode || 'frameless') : 'frameless',
                areaContentMode: active ? (active.areaContentMode || 'm2_only') : 'm2_only',
                fontFamily: this.measureFontFamily || 'Montserrat',
                fontTarget: this.measureFontTarget || 'all',
                areaFontSize: this.measureAreaFontSize || 16,
                edgeFontSize: this.measureEdgeFontSize || 12,
                hideDefaultParcel: (this.measureHideDefaultParcel !== undefined ? !!this.measureHideDefaultParcel : true),
                panelPos: this.measurePanelPos || null,
                showEdgeDistances: active ? (active.showEdgeDistances !== false) : true,
                showArea: active ? (active.showArea !== false) : true,
                showHandles: active ? (active.showHandles !== false) : true,
                hiddenEdges: active ? (active.hiddenEdges || {}) : {}
            };
        },

        /**
         * Hafızadan Gelen Ölçüm Verilerini Geri Yükler (Çoklu Çizimler Destekli)
         */
        restoreMeasureData: function(data) {
            if (!data) return;
            if (data.interactionMode) this.measureInteractionMode = data.interactionMode;
            if (data.collapsed !== undefined) this.measurePanelCollapsed = data.collapsed;
            if (data.fontFamily) this.measureFontFamily = data.fontFamily;
            if (data.fontTarget) this.measureFontTarget = data.fontTarget;
            if (data.areaFontSize) this.measureAreaFontSize = data.areaFontSize;
            if (data.edgeFontSize) this.measureEdgeFontSize = data.edgeFontSize;
            if (data.hideDefaultParcel !== undefined) this.measureHideDefaultParcel = data.hideDefaultParcel;
            if (data.panelPos) this.measurePanelPos = data.panelPos;
            if (data.panelVisible !== undefined) this.measurePanelVisible = data.panelVisible;

            if (data.drawings && Array.isArray(data.drawings) && data.drawings.length > 0) {
                // Çoklu çizimleri geri yükle
                this.measureDrawings = data.drawings.map(d => {
                    const pts = (d.points && Array.isArray(d.points))
                        ? d.points.map(p => L.latLng(p.lat, p.lng))
                        : [];
                    const badgePos = {};
                    if (d.badgeCustomPositions) {
                        Object.keys(d.badgeCustomPositions).forEach(k => {
                            const p = d.badgeCustomPositions[k];
                            if (p && p.lat !== undefined && p.lng !== undefined) {
                                badgePos[k] = L.latLng(p.lat, p.lng);
                            }
                        });
                    }
                    let totalPos = null;
                    if (d.totalBadgeCustomPos && d.totalBadgeCustomPos.lat !== undefined) {
                        totalPos = L.latLng(d.totalBadgeCustomPos.lat, d.totalBadgeCustomPos.lng);
                    }
                    let areaPos = null;
                    if (d.areaBadgeCustomPos && d.areaBadgeCustomPos.lat !== undefined) {
                        areaPos = L.latLng(d.areaBadgeCustomPos.lat, d.areaBadgeCustomPos.lng);
                    }
                    return {
                        id: d.id || ('draw_' + Math.random().toString(36).substr(2, 6)),
                        title: d.title || 'Çizim',
                        visible: d.visible !== false,
                        isExpanded: !!d.isExpanded,
                        points: pts,
                        isClosed: !!d.isClosed,
                        style: d.style || 'cad',
                        color: d.color || '#f59e0b',
                        preset: d.preset || 'frontage',
                        customText: d.customText || '',
                        distanceMode: d.distanceMode || (d.showEdgeDistances === false ? 'none' : 'edges'),
                        showEdgeDistances: d.showEdgeDistances !== false,
                        showArea: d.showArea !== false,
                        showHandles: d.showHandles !== false,
                        hiddenEdges: Object.assign({}, d.hiddenEdges || {}),
                        badgeCustomPositions: badgePos,
                        totalBadgeCustomPos: totalPos,
                        totalBadgeRotation: d.totalBadgeRotation || 0,
                        totalBadgeScale: d.totalBadgeScale || 1.0,
                        totalBadgeSelected: false,
                        areaBadgeCustomPos: areaPos,
                        areaRotation: d.areaRotation || 0,
                        areaScale: d.areaScale || 1.0,
                        areaSelected: false,
                        areaDisplayMode: d.areaDisplayMode || 'frameless',
                        areaContentMode: d.areaContentMode || 'm2_only',
                        distanceMeters: d.distanceMeters || 0,
                        areaM2: d.areaM2 || 0,
                        perimeterMeters: d.perimeterMeters || 0,
                        markers: [],
                        lines: [],
                        polygonLayer: null,
                        badgeMarkers: [],
                        totalBadgeMarker: null,
                        areaBadgeMarker: null
                    };
                });
                this.activeDrawingId = data.activeDrawingId || this.measureDrawings[0].id;
                this.getActiveDrawing();
            } else if (data.points && Array.isArray(data.points) && data.points.length >= 1) {
                // Tekil eski veriyi Çizim 1 olarak geri yükle
                const pts = data.points.map(p => L.latLng(p.lat, p.lng));
                const badgePos = {};
                if (data.badgeCustomPositions) {
                    Object.keys(data.badgeCustomPositions).forEach(k => {
                        const p = data.badgeCustomPositions[k];
                        if (p && p.lat !== undefined && p.lng !== undefined) {
                            badgePos[k] = L.latLng(p.lat, p.lng);
                        }
                    });
                }
                const d1 = {
                    id: 'draw_1',
                    title: 'Çizim 1',
                    visible: true,
                    isExpanded: true,
                    points: pts,
                    isClosed: !!data.isClosed,
                    style: data.style || 'cad',
                    color: data.color || '#f59e0b',
                    preset: data.preset || 'frontage',
                    customText: data.customText || '',
                    distanceMode: data.distanceMode || (data.showEdgeDistances === false ? 'none' : 'edges'),
                    showEdgeDistances: data.showEdgeDistances !== false,
                    showArea: data.showArea !== false,
                    showHandles: data.showHandles !== false,
                    hiddenEdges: Object.assign({}, data.hiddenEdges || {}),
                    badgeCustomPositions: badgePos,
                    totalBadgeCustomPos: (data.totalBadgeCustomPos && data.totalBadgeCustomPos.lat !== undefined) ? L.latLng(data.totalBadgeCustomPos.lat, data.totalBadgeCustomPos.lng) : null,
                    totalBadgeRotation: data.totalBadgeRotation || 0,
                    totalBadgeScale: data.totalBadgeScale || 1.0,
                    totalBadgeSelected: false,
                    areaBadgeCustomPos: (data.areaBadgeCustomPos && data.areaBadgeCustomPos.lat !== undefined) ? L.latLng(data.areaBadgeCustomPos.lat, data.areaBadgeCustomPos.lng) : null,
                    areaRotation: data.areaRotation || 0,
                    areaScale: data.areaScale || 1.0,
                    areaSelected: false,
                    areaDisplayMode: data.areaDisplayMode || 'frameless',
                    areaContentMode: data.areaContentMode || 'm2_only',
                    distanceMeters: data.distanceMeters || 0,
                    areaM2: data.areaM2 || 0,
                    perimeterMeters: data.perimeterMeters || 0,
                    markers: [],
                    lines: [],
                    polygonLayer: null,
                    badgeMarkers: [],
                    totalBadgeMarker: null,
                    areaBadgeMarker: null
                };
                this.measureDrawings = [d1];
                this.activeDrawingId = 'draw_1';
                this.getActiveDrawing();
            }

            // Arayüz elemanlarını senkronize et
            this.syncMeasureUI();
            this.restoreMeasurePanelPosition();

            if (data.active) {
                this.toggleMeasure(true);
            }
        },

        /**
         * Arsa Alanı Gösterim Modunu Ayarlar ('frameless' | 'box')
         */
        setMeasureAreaDisplayMode: function(mode) {
            this.measureAreaDisplayMode = mode || 'frameless';
            const framelessBtn = document.getElementById('satAreaModeFramelessBtn');
            const boxBtn = document.getElementById('satAreaModeBoxBtn');
            if (framelessBtn) framelessBtn.classList.toggle('active', this.measureAreaDisplayMode === 'frameless');
            if (boxBtn) boxBtn.classList.toggle('active', this.measureAreaDisplayMode === 'box');
            this.updateMeasureGraphics();
            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
        },

        /**
         * Arsa Alanı İçerik Formatını Ayarlar ('m2_only' | 'm2_donum' | 'detailed')
         */
        setMeasureAreaContentMode: function(mode) {
            this.measureAreaContentMode = mode || 'm2_only';
            const m2OnlyBtn = document.getElementById('satAreaContentM2OnlyBtn');
            const m2DonumBtn = document.getElementById('satAreaContentM2DonumBtn');
            const detailedBtn = document.getElementById('satAreaContentDetailedBtn');
            if (m2OnlyBtn) m2OnlyBtn.classList.toggle('active', this.measureAreaContentMode === 'm2_only');
            if (m2DonumBtn) m2DonumBtn.classList.toggle('active', this.measureAreaContentMode === 'm2_donum');
            if (detailedBtn) detailedBtn.classList.toggle('active', this.measureAreaContentMode === 'detailed');
            this.updateMeasureGraphics();
            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
        },

        /**
         * Ölçüm Yazı Tipi Ailesini Ayarlar
         */
        setMeasureFontFamily: function(font) {
            this.measureFontFamily = font || 'Montserrat';
            this.updateMeasureGraphics();
            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
        },

        /**
         * Boyutlandırmanın Uygulanacağı Hedefi Seçer ('all' | 'area' | 'edges')
         */
        setMeasureFontTarget: function(target) {
            this.measureFontTarget = target || 'all';
            const allBtn = document.getElementById('satFontTargetAllBtn');
            const areaBtn = document.getElementById('satFontTargetAreaBtn');
            const edgesBtn = document.getElementById('satFontTargetEdgesBtn');
            if (allBtn) allBtn.classList.toggle('active', this.measureFontTarget === 'all');
            if (areaBtn) areaBtn.classList.toggle('active', this.measureFontTarget === 'area');
            if (edgesBtn) edgesBtn.classList.toggle('active', this.measureFontTarget === 'edges');

            const curSize = (this.measureFontTarget === 'edges') ? (this.measureEdgeFontSize || 12) : (this.measureAreaFontSize || 16);
            const sizeEl = document.getElementById('satMeasureFontSizeText');
            if (sizeEl) sizeEl.textContent = `${curSize}px`;
        },

        /**
         * Yazı Boyutunu Artırır veya Azaltır
         */
        adjustMeasureFontSize: function(delta) {
            const target = this.measureFontTarget || 'all';
            if (target === 'all' || target === 'area') {
                const s = (this.measureAreaFontSize || 16) + (delta * 2);
                this.measureAreaFontSize = Math.max(10, Math.min(38, s));
            }
            if (target === 'all' || target === 'edges') {
                const s = (this.measureEdgeFontSize || 12) + delta;
                this.measureEdgeFontSize = Math.max(9, Math.min(28, s));
            }

            const curSize = (target === 'edges') ? (this.measureEdgeFontSize || 12) : (this.measureAreaFontSize || 16);
            const sizeEl = document.getElementById('satMeasureFontSizeText');
            if (sizeEl) sizeEl.textContent = `${curSize}px`;

            this.updateMeasureGraphics();
            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
        },

        /**
         * Ölçüm Esnasında Varsayılan Beyaz Parsel Katmanını Gizler / Gösterir
         */
        toggleMeasureParcelLayer: function() {
            this.measureHideDefaultParcel = !this.measureHideDefaultParcel;
            this.updateMeasureParcelVisibilityButton();
            this.updateMeasureGraphics();
            if (typeof window.showAppToast === 'function') {
                const msg = this.measureHideDefaultParcel 
                    ? '👁️ Orijinal beyaz parsel katmanı gizlendi (sadece ölçüm görünür).' 
                    : '👁️ Orijinal beyaz parsel katmanı görünür yapıldı.';
                window.showAppToast(msg, 'info');
            }
            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
        },

        /**
         * Parsel Katmanı Gizle/Göster Butonunun İkonunu ve Başlığını Günceller
         */
        updateMeasureParcelVisibilityButton: function() {
            const btn = document.getElementById('satMeasureToggleParcelBtn');
            const icon = document.getElementById('satMeasureParcelLayerIcon');
            if (btn && icon) {
                if (this.measureHideDefaultParcel) {
                    btn.classList.add('active');
                    icon.className = 'fas fa-eye-slash';
                    btn.title = 'Beyaz Parsel Katmanı Gizli (Göstermek için tıklayın)';
                } else {
                    btn.classList.remove('active');
                    icon.className = 'fas fa-eye';
                    btn.title = 'Beyaz Parsel Katmanı Görünür (Gizlemek için tıklayın)';
                }
            }
        },

        /**
         * Tüm Kenar Mesafe Metrelerini Aç / Kapat
         */
        toggleMeasureAllEdges: function(forceState) {
            this.measureShowEdgeDistances = (forceState !== undefined) ? !!forceState : !this.measureShowEdgeDistances;
            const btn = document.getElementById('satVisEdgeDistancesBtn');
            if (btn) btn.classList.toggle('active', this.measureShowEdgeDistances);
            this.updateMeasureGraphics();
            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
            if (typeof window.showAppToast === 'function') {
                window.showAppToast(this.measureShowEdgeDistances ? '📏 Kenar metreleri gösterildi.' : '📏 Kenar metreleri gizlendi.', 'info');
            }
        },

        /**
         * Arsa Alanı m² Rozetini Aç / Kapat
         */
        toggleMeasureAreaBadge: function(forceState) {
            this.measureShowArea = (forceState !== undefined) ? !!forceState : !this.measureShowArea;
            const btn = document.getElementById('satVisAreaBtn');
            if (btn) btn.classList.toggle('active', this.measureShowArea);
            this.updateMeasureGraphics();
            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
            if (typeof window.showAppToast === 'function') {
                window.showAppToast(this.measureShowArea ? '🏷️ Arsa m² alanı gösterildi.' : '🏷️ Arsa m² alanı gizlendi.', 'info');
            }
        },

        /**
         * Köşe Tutamaçlarını (1, 2, 3...) Aç / Kapat
         */
        toggleMeasureHandles: function(forceState) {
            this.measureShowHandles = (forceState !== undefined) ? !!forceState : !this.measureShowHandles;
            const btn = document.getElementById('satVisHandlesBtn');
            if (btn) btn.classList.toggle('active', this.measureShowHandles);
            this.updateMeasureGraphics();
            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
            if (typeof window.showAppToast === 'function') {
                window.showAppToast(this.measureShowHandles ? '📍 Köşe tutamaçları açıldı.' : '📍 Köşe tutamaçları gizlendi.', 'info');
            }
        },

        /**
         * Tek Bir Kenarın Metresini Göster / Gizle (Harita üzerindeki ✕ butonu veya panel çipi ile)
         */
        toggleMeasureSingleEdge: function(idx, event) {
            if (event) {
                if (typeof event.stopPropagation === 'function') event.stopPropagation();
                if (typeof event.preventDefault === 'function') event.preventDefault();
            }
            this.measureHiddenEdges = this.measureHiddenEdges || {};
            if (this.measureHiddenEdges[idx]) {
                delete this.measureHiddenEdges[idx];
            } else {
                this.measureHiddenEdges[idx] = true;
            }
            this.updateMeasureGraphics();
            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
            if (typeof window.showAppToast === 'function') {
                const isHidden = !!this.measureHiddenEdges[idx];
                window.showAppToast(isHidden ? `📏 Kenar ${idx + 1} metresi gizlendi.` : `📏 Kenar ${idx + 1} metresi açıldı.`, 'info');
            }
        },

        /**
         * Tüm Kenarları Topluca Aç veya Gizle (Filtre Paneli Butonları)
         */
        toggleMeasureAllEdgesBulk: function(show) {
            this.measureHiddenEdges = this.measureHiddenEdges || {};
            const pts = this.measurePoints || [];
            const isClosed = this.measureIsClosed && (pts.length >= 3);
            const edgeCount = (pts.length >= 2) ? (isClosed ? pts.length : pts.length - 1) : 0;

            if (show) {
                this.measureHiddenEdges = {};
                this.measureShowEdgeDistances = true;
            } else {
                for (let i = 0; i < edgeCount; i++) {
                    this.measureHiddenEdges[i] = true;
                }
            }
            const btn = document.getElementById('satVisEdgeDistancesBtn');
            if (btn) btn.classList.toggle('active', this.measureShowEdgeDistances);
            this.updateMeasureGraphics();
            this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
        },

        /**
         * Paneldeki Dinamik Kenar Seçici Çip Listesini Günceller
         */
        updateEdgeSelectorUI: function(pts, isClosed) {
            const wrap = document.getElementById('satMeasureEdgeSelectorWrap');
            const grid = document.getElementById('satMeasureEdgeChipsGrid');
            if (!wrap || !grid) return;

            const edgeCount = (pts && pts.length >= 2) ? (isClosed ? pts.length : pts.length - 1) : 0;
            if (edgeCount === 0) {
                wrap.style.display = 'none';
                grid.innerHTML = '';
                return;
            }

            wrap.style.display = 'block';
            let html = '';
            for (let i = 0; i < edgeCount; i++) {
                const pA = pts[i];
                const pB = pts[(i + 1) % pts.length];
                const segDist = pA.distanceTo(pB);
                const segDistStr = (segDist >= 1000) ? (segDist / 1000).toFixed(2) + ' km' : segDist.toFixed(1) + ' m';
                const isHidden = !this.measureShowEdgeDistances || !!(this.measureHiddenEdges && this.measureHiddenEdges[i]);

                html += `
                    <button type="button" class="sat-measure-edge-chip ${isHidden ? 'hidden' : 'active'}" onclick="window.toggleSatelliteMeasureSingleEdge(${i}, event)" title="Kenar ${i + 1} (${segDistStr}) - ${isHidden ? 'Göstermek için tıklayın' : 'Gizlemek için tıklayın'}">
                        <span class="chip-num">K${i + 1}:</span>
                        <span class="chip-val">${segDistStr}</span>
                        <span class="chip-status">${isHidden ? '✕' : '✓'}</span>
                    </button>
                `;
            }
            grid.innerHTML = html;
        },

        /**
         * Font Seçici Açılır Kutusunu Projedeki Tüm Fontlarla (js/fonts.config.js - 42 Font) Doldurur
         */
        populateMeasureFonts: function() {
            const fontSel = document.getElementById('satMeasureFontSelect');
            if (!fontSel) return;

            const fontSource = (typeof window !== 'undefined' && window.FONTS && Array.isArray(window.FONTS)) 
                ? window.FONTS 
                : (typeof FONTS !== 'undefined' && Array.isArray(FONTS) ? FONTS : null);

            const fallbackFonts = [
                {name:'✒️ Dancing Script',family:"'Dancing Script',cursive",cat:'✒️ Kıvrımlı & Zarif'},
                {name:'✒️ Great Vibes',family:"'Great Vibes',cursive",cat:'✒️ Kıvrımlı & Zarif'},
                {name:'✒️ Pacifico',family:"'Pacifico',cursive",cat:'✒️ Kıvrımlı & Zarif'},
                {name:'✒️ Satisfy',family:"'Satisfy',cursive",cat:'✒️ Kıvrımlı & Zarif'},
                {name:'✒️ Allura',family:"'Allura',cursive",cat:'✒️ Kıvrımlı & Zarif'},
                {name:'✒️ Sacramento',family:"'Sacramento',cursive",cat:'✒️ Kıvrımlı & Zarif'},
                {name:'✒️ Yellowtail',family:"'Yellowtail',cursive",cat:'✒️ Kıvrımlı & Zarif'},
                {name:'✒️ Kaushan Script',family:"'Kaushan Script',cursive",cat:'✒️ Kıvrımlı & Zarif'},
                {name:'✒️ Alex Brush',family:"'Alex Brush',cursive",cat:'✒️ Kıvrımlı & Zarif'},
                {name:'✒️ Parisienne',family:"'Parisienne',cursive",cat:'✒️ Kıvrımlı & Zarif'},
                {name:'✒️ Marck Script',family:"'Marck Script',cursive",cat:'✒️ Kıvrımlı & Zarif'},
                {name:'✒️ Cookie',family:"'Cookie',cursive",cat:'✒️ Kıvrımlı & Zarif'},
                {name:'✒️ Tangerine',family:"'Tangerine',cursive",cat:'✒️ Kıvrımlı & Zarif'},
                {name:'✒️ Berkshire Swash',family:"'Berkshire Swash',cursive",cat:'✒️ Kıvrımlı & Zarif'},
                {name:'✒️ Yesteryear',family:"'Yesteryear',cursive",cat:'✒️ Kıvrımlı & Zarif'},
                {name:'✒️ Caveat',family:"'Caveat',cursive",cat:'✒️ Kıvrımlı & Zarif'},
                {name:'👑 Playfair Display',family:"'Playfair Display',serif",cat:'👑 Klasik & Lüks'},
                {name:'👑 Cormorant Garamond',family:"'Cormorant Garamond',serif",cat:'👑 Klasik & Lüks'},
                {name:'👑 Cinzel',family:"'Cinzel',serif",cat:'👑 Klasik & Lüks'},
                {name:'👑 Cinzel Decorative',family:"'Cinzel Decorative',serif",cat:'👑 Klasik & Lüks'},
                {name:'👑 Italiana',family:"'Italiana',serif",cat:'👑 Klasik & Lüks'},
                {name:'👑 Prata',family:"'Prata',serif",cat:'👑 Klasik & Lüks'},
                {name:'👑 Abril Fatface',family:"'Abril Fatface',cursive",cat:'👑 Klasik & Lüks'},
                {name:'👑 Yeseva One',family:"'Yeseva One',serif",cat:'👑 Klasik & Lüks'},
                {name:'👑 Libre Baskerville',family:"'Libre Baskerville',serif",cat:'👑 Klasik & Lüks'},
                {name:'👑 Lora',family:"'Lora',serif",cat:'👑 Klasik & Lüks'},
                {name:'👑 Merriweather',family:"'Merriweather',serif",cat:'👑 Klasik & Lüks'},
                {name:'👑 Georgia',family:"Georgia,serif",cat:'👑 Klasik & Lüks'},
                {name:'🚀 Montserrat',family:"'Montserrat',sans-serif",cat:'🚀 Modern Sans-Serif'},
                {name:'🚀 Poppins',family:"'Poppins',sans-serif",cat:'🚀 Modern Sans-Serif'},
                {name:'🚀 Raleway',family:"'Raleway',sans-serif",cat:'🚀 Modern Sans-Serif'},
                {name:'🚀 Inter',family:"'Inter',sans-serif",cat:'🚀 Modern Sans-Serif'},
                {name:'🚀 Nunito',family:"'Nunito',sans-serif",cat:'🚀 Modern Sans-Serif'},
                {name:'🚀 Roboto',family:"'Roboto',sans-serif",cat:'🚀 Modern Sans-Serif'},
                {name:'🚀 Josefin Sans',family:"'Josefin Sans',sans-serif",cat:'🚀 Modern Sans-Serif'},
                {name:'💥 Bebas Neue',family:"'Bebas Neue',sans-serif",cat:'💥 Bold & Impact'},
                {name:'💥 Oswald',family:"'Oswald',sans-serif",cat:'💥 Bold & Impact'},
                {name:'💥 Archivo Black',family:"'Archivo Black',sans-serif",cat:'💥 Bold & Impact'},
                {name:'💥 Shrikhand',family:"'Shrikhand',cursive",cat:'💥 Bold & Impact'},
                {name:'🎯 Amatic SC',family:"'Amatic SC',cursive",cat:'🎯 Dekoratif'}
            ];

            const list = (fontSource && fontSource.length > 0) ? fontSource : fallbackFonts;
            const groups = {};
            list.forEach(f => {
                const cat = f.cat || 'Diğer Fontlar';
                if (!groups[cat]) groups[cat] = [];
                groups[cat].push(f);
            });

            let html = '';
            const selectedVal = (this.measureFontFamily || 'Montserrat').toLowerCase();

            Object.keys(groups).forEach(catName => {
                html += `<optgroup label="${catName}">`;
                groups[catName].forEach(item => {
                    const cleanName = item.family.split(',')[0].replace(/['"]/g, '').trim();
                    const isSel = (cleanName.toLowerCase() === selectedVal);
                    html += `<option value="${cleanName}" ${isSel ? 'selected' : ''}>${item.name || cleanName}</option>`;
                });
                html += `</optgroup>`;
            });

            fontSel.innerHTML = html;
            const options = Array.from(fontSel.options);
            const found = options.find(opt => opt.value.toLowerCase() === selectedVal);
            if (found) {
                fontSel.value = found.value;
            } else if (fontSel.options.length > 0) {
                fontSel.value = fontSel.options[0].value;
            }
        },

        /**
         * Ölçüm Paneline Sürükleme (Draggable) Yeteneği Kazandırır (Serbest / Ekrandan Taşabilir)
         */
        initMeasurePanelDraggable: function() {
            const panel = document.getElementById('satMeasureFloatingPanel');
            if (!panel || panel._hasDraggable) return;
            panel._hasDraggable = true;

            const header = panel.querySelector('.sat-measure-panel-header');
            if (!header) return;

            let isDragging = false;
            let startX = 0;
            let startY = 0;
            let initialLeft = 0;
            let initialTop = 0;

            const onPointerDown = (e) => {
                if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('label')) return;

                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                const rect = panel.getBoundingClientRect();
                initialLeft = rect.left;
                initialTop = rect.top;

                panel.style.left = initialLeft + 'px';
                panel.style.top = initialTop + 'px';
                panel.style.bottom = 'auto';
                panel.style.right = 'auto';
                panel.classList.add('is-dragging');
                header.style.cursor = 'grabbing';

                window.addEventListener('pointermove', onPointerMove);
                window.addEventListener('pointerup', onPointerUp);
                e.preventDefault();
            };

            const onPointerMove = (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                let newLeft = initialLeft + dx;
                let newTop = initialTop + dy;

                const winW = window.innerWidth;
                const winH = window.innerHeight;
                const pW = panel.offsetWidth || 320;
                const pH = panel.offsetHeight || 400;

                // Serbest sürükleme: Harita sınırlarına veya ekrana hapsolmaz.
                // Kullanıcı alt butonları görmek için paneli yukarıya (negatif top) taşıyabilir,
                // sağa/sola serbestçe kaydırabilir. Sadece panelin ekrandan tamamen kaybolmasını önleyen güvenlik payı:
                newLeft = Math.max(-pW + 60, Math.min(newLeft, winW - 60));
                newTop = Math.max(-pH + 50, Math.min(newTop, winH - 40));

                panel.style.left = newLeft + 'px';
                panel.style.top = newTop + 'px';
                panel.style.bottom = 'auto';
                panel.style.right = 'auto';

                this.measurePanelPos = {
                    left: newLeft,
                    top: newTop
                };
            };

            const onPointerUp = () => {
                if (!isDragging) return;
                isDragging = false;
                panel.classList.remove('is-dragging');
                header.style.cursor = 'move';
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);

                if (this.measurePanelPos) {
                    try {
                        localStorage.setItem('sat_measure_panel_pos', JSON.stringify(this.measurePanelPos));
                    } catch(e) {}
                }
                this.saveLastLocation({ measureData: this.getMeasureDataToSave() });
            };

            header.addEventListener('pointerdown', onPointerDown);

            // Küçültülmüş panel başlığına tıklandığında paneli tekrar büyüt
            header.addEventListener('click', (e) => {
                if (e.target.closest('button') || e.target.closest('input')) return;
                if (panel.classList.contains('collapsed')) {
                    this.toggleMeasurePanelCollapse();
                }
            });
        },

        /**
         * Ölçüm Panelinin Konumunu Hafızadan Geri Yükler (Serbest Pozisyon)
         */
        restoreMeasurePanelPosition: function(panel) {
            if (!panel) panel = document.getElementById('satMeasureFloatingPanel');
            if (!panel) return;

            let pos = this.measurePanelPos;
            if (!pos) {
                try {
                    const saved = localStorage.getItem('sat_measure_panel_pos');
                    if (saved) pos = JSON.parse(saved);
                } catch(e) {}
            }

            const winW = window.innerWidth;
            const winH = window.innerHeight;

            if (pos && typeof pos.left === 'number' && typeof pos.top === 'number') {
                const pW = panel.offsetWidth || 320;
                const pH = panel.offsetHeight || 400;
                const left = Math.max(-pW + 60, Math.min(pos.left, winW - 60));
                const top = Math.max(-pH + 50, Math.min(pos.top, winH - 40));
                panel.style.left = `${left}px`;
                panel.style.top = `${top}px`;
                panel.style.bottom = 'auto';
                panel.style.right = 'auto';
                return;
            }

            // Varsayılan serbest pozisyon: Haritanın sol üst köşesine hizala
            const stage = document.getElementById('satMapStage') || document.querySelector('.sat-modal-container');
            if (stage) {
                const sRect = stage.getBoundingClientRect();
                const defLeft = Math.max(16, Math.round(sRect.left + 16));
                const defTop = Math.max(16, Math.round(sRect.top + 16));
                panel.style.left = `${defLeft}px`;
                panel.style.top = `${defTop}px`;
                panel.style.bottom = 'auto';
                panel.style.right = 'auto';
            } else {
                panel.style.left = '24px';
                panel.style.top = '90px';
                panel.style.bottom = 'auto';
                panel.style.right = 'auto';
            }
        },

        /**
         * Google 3D Earth (Maps Platform Photorealistic 3D) Modunu Başlatır
         */
        /**
         * Aktif Google Maps / 3D API Anahtarını Çözer
         * Kullanıcının hesabına bağlı anahtarı veya varsayılan anahtarı döndürür.
         */
    });

})(window);
