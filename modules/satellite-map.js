/**
 * =========================================================================
 * EMLAK STÜDYOM - CANLI UYDU HARİTASI & KONUM GÖRSELİ MODÜLÜ (PRO v7.1)
 * modules/satellite-map.js
 * =========================================================================
 * - Google Earth Kalitesinde Canlı Uydu (Google Satellite mt0-mt3) - Ultra Net HD
 * - Google Hibrit (Uydu + Cadde / Sokak / Mahalle İsimleri)
 * - Esri World Imagery (Maxar HD Alternatif)
 * - OpenStreetMap Şehir Haritası
 * - İnteraktif "Parsel / Ada Sınırı Çizim Aracı" (Harita üzerinde sınır belirleme)
 * - İl / İlçe / Mahalle / Ada-Parsel Otomatik Arama (Nominatim Geocoding)
 * - Proje Metninden (Açıklama / Başlık) Akıllı Konum Algılama
 * - Tuvale Yüksek Çözünürlüklü (Full HD 1920px) Anlık Kadraj Aktarımı (Kilitlenmeyen Hızlı Motor)
 * - 4 Farklı Vektörel Konum Rozeti / Pin Seçeneği (Klasik, Altın, Radar, Rozet)
 * - Google Earth 3D & TKGM Parsel Sorgu Özel Boyutlu Pop-up Entegrasyonu
 */

(function(window) {
    'use strict';

    // Google Maps 3D Canvas Access & DrawingBuffer Hook
    try {
        if (!window._gmp3dHooked && typeof Element !== 'undefined') {
            window._gmp3dHooked = true;
            const origAttachShadow = Element.prototype.attachShadow;
            Element.prototype.attachShadow = function(init) {
                if (this.nodeName === 'GMP-MAP-3D' || this.tagName === 'GMP-MAP-3D') {
                    init = Object.assign({}, init, { mode: 'open' });
                }
                return origAttachShadow.call(this, init);
            };

            if (typeof HTMLCanvasElement !== 'undefined') {
                const origGetContext = HTMLCanvasElement.prototype.getContext;
                HTMLCanvasElement.prototype.getContext = function(type, attributes) {
                    if (type === 'webgl' || type === 'webgl2') {
                        attributes = Object.assign({}, attributes, { preserveDrawingBuffer: true });
                    }
                    return origGetContext.call(this, type, attributes);
                };
            }
        }
    } catch(e) {
        console.warn("GMP 3D hook setup:", e);
    }

    const SatelliteMapModule = {
        map: null,
        googleSatLayer: null,
        googleHybridLayer: null,
        esriSatLayer: null,
        osmLayer: null,
        activeLayer: 'google_sat', // 'google_sat' | 'google_hybrid' | 'esri_sat' | 'osm' | 'google_3d'
        selectedFormat: '16:9', // '16:9' | '1:1' | '4:5' | '9:16'
        selectedResolution: '2k', // '1080p' | '2k' | '4k'
        google3DKey: 'AIzaSyB29TnBvpT2vmEiY9US_Op0S5mdJejOb_g' || (typeof window.GOOGLE_MAPS_3D_KEY === 'string' && window.GOOGLE_MAPS_3D_KEY.trim()) || (typeof window.getGeminiApiKey === 'function' ? window.getGeminiApiKey() : '') || localStorage.getItem('GOOGLE_MAPS_3D_KEY') || '',
        is3DActive: false,
        map3dElement: null,
        showMapLabels: true,    // Yer ve yol isimlerini göster/gizle
        google3DMode: 'HYBRID', // 'HYBRID' (Uydu+Yol) | 'SATELLITE' (Saf Uydu)
        google3DRange: 1400,    // 1400m helikopter/hava kuşu bakış mesafesi (sokak görünümünden uzak)
        google3DTilt: 45,       // 45 derece derinlikli 3D açısı
        markerEnabled: false,
        markerStyle: 'badge',   // 'badge' | 'classic' | 'gold' | 'radar'
        customMarkerText: 'PORTFÖYÜMÜZ',
        currentLat: 40.6931,
        currentLng: 30.2734,
        currentZoom: 17,
        isInitialized: false,

        // Popüler / Hızlı Atlama Konumları (Türkiye)
        QUICK_LOCATIONS: [
            { label: 'Sakarya / Sapanca', lat: 40.6931, lng: 30.2734, zoom: 17 },
            { label: 'İstanbul / Boğaz', lat: 41.0450, lng: 29.0340, zoom: 17 },
            { label: 'Bodrum / Yalıkavak', lat: 37.1042, lng: 27.2917, zoom: 17 },
            { label: 'Antalya / Lara', lat: 36.8520, lng: 30.7710, zoom: 17 },
            { label: 'Ankara / Çankaya', lat: 39.8920, lng: 32.8590, zoom: 17 },
            { label: 'İzmir / Çeşme', lat: 38.3235, lng: 26.3050, zoom: 17 },
            { label: 'Bursa / Nilüfer', lat: 40.2150, lng: 28.9830, zoom: 17 }
        ],

        /**
         * Modalı Oluşturur ve DOM'a Ekler
         */
        ensureModalDOM: function() {
            if (document.getElementById('satelliteMapModal')) return;

            const modalHtml = `
            <div id="satelliteMapModal" class="sat-modal-overlay" style="display:none;">
                <div class="sat-modal-container">
                    <!-- Üst Başlık ve Kapatma Butonu -->
                    <div class="sat-modal-header">
                        <div class="sat-header-left">
                            <div class="sat-header-icon"><i class="fas fa-satellite"></i></div>
                            <div>
                                <h3 class="sat-header-title">Canlı Uydu Haritası & Konum Kadrajı</h3>
                                <p class="sat-header-sub">Google Earth kalitesinde ultra net uydu görüntüsüyle mülkünüzün konumunu tuvalinize birebir aktarın</p>
                            </div>
                        </div>
                        <button type="button" class="sat-close-btn" onclick="window.closeSatelliteMapModal()" title="Kapat">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <!-- Arama ve Hızlı Konum Barı -->
                    <div class="sat-toolbar-search">
                        <div class="sat-search-group">
                            <i class="fas fa-search sat-search-icon"></i>
                            <input type="text" id="satSearchInput" placeholder="İl, İlçe, Mahalle veya Ada/Parsel ara (Örn: Sakarya Sapanca, Bodrum Yalıkavak)..." onkeydown="if(event.key==='Enter') window.searchSatelliteLocation()">
                            <button type="button" id="satSearchBtn" class="sat-btn-search" onclick="window.searchSatelliteLocation()">
                                <i class="fas fa-search"></i> Bul
                            </button>
                            <button type="button" id="satGeoBtn" class="sat-btn-geo" onclick="window.locateCurrentPosition()" title="Mevcut Konumumu Bul">
                                <i class="fas fa-location-crosshairs"></i> Konumum
                            </button>
                        </div>
                        
                        <div class="sat-quick-chips">
                            <span class="sat-chips-label"><i class="fas fa-bolt"></i> Hızlı:</span>
                            <div class="sat-chips-scroll" id="satQuickChipsContainer"></div>
                        </div>
                    </div>

                    <!-- Katman, İsim Aç/Kapat, Çözünürlük, Format ve Canlı Pin Çubuğu -->
                    <div class="sat-controls-bar">
                        <!-- Katman Butonları -->
                        <div class="sat-ctrl-group">
                            <span class="sat-ctrl-label"><i class="fas fa-layer-group"></i> Harita:</span>
                            <div class="sat-layer-btns">
                                <button type="button" class="sat-layer-btn active" id="satBtnGoogleSat" data-layer="google_sat" onclick="window.setSatelliteLayer('google_sat')" title="Google Earth kalitesinde HD uydu görüntüsü">
                                    ⭐ Google Uydu
                                </button>
                                <button type="button" class="sat-layer-btn" id="satBtnGoogle3D" data-layer="google_3d" onclick="window.initGoogle3DEarthMode()" title="Google Photorealistic 3D Dünya (WebGL)">
                                    🌐 Google 3D (API)
                                </button>
                                <button type="button" class="sat-layer-btn" id="satBtnEsriSat" data-layer="esri_sat" onclick="window.setSatelliteLayer('esri_sat')" title="Esri / Maxar HD Uydu">
                                    🛰️ Esri Uydu
                                </button>
                            </div>
                        </div>

                        <!-- 🏷️ Harita Bilgilerini Ekle / Sil (Aç / Kapat) Butonu -->
                        <div class="sat-ctrl-group">
                            <button type="button" id="satToggleLabelsBtn" class="sat-btn-toggle-labels active" onclick="window.toggleSatelliteLabels()" title="Harita üzerindeki cadde, sokak ve işletme/yer isimlerini gizler veya gösterir">
                                <i class="fas fa-tags"></i> <span>Yer/Yol İsimleri:</span> <b id="satLabelsStatusText">Açık</b>
                            </button>
                        </div>

                        <!-- ⚡ Gerçek Çözünürlük Kalitesi (2K / 4K / 1080p) -->
                        <div class="sat-ctrl-group">
                            <span class="sat-ctrl-label"><i class="fas fa-tv"></i> Çözünürlük:</span>
                            <select id="satResolutionSelect" class="sat-res-select" onchange="window.setSatelliteResolution(this.value)" title="Gerçek optik uydu çözünürlüğü">
                                <option value="1080p">1080p Full HD</option>
                                <option value="2k" selected>⚡ 2K QHD (Süper Net)</option>
                                <option value="4k">🌟 4K UHD (Ultra Net 4K)</option>
                            </select>
                        </div>

                        <!-- Tuval Formatı (16:9 / 1:1 / 4:5 / 9:16) -->
                        <div class="sat-ctrl-group">
                            <span class="sat-ctrl-label"><i class="fas fa-crop-alt"></i> Tuval Formatı:</span>
                            <div class="sat-format-btns" id="satFormatBtns">
                                <button type="button" class="sat-fmt-btn active" data-fmt="16:9" onclick="window.setSatelliteExportFormat('16:9')">16:9 Full HD</button>
                                <button type="button" class="sat-fmt-btn" data-fmt="1:1" onclick="window.setSatelliteExportFormat('1:1')">1:1 Kare</button>
                                <button type="button" class="sat-fmt-btn" data-fmt="4:5" onclick="window.setSatelliteExportFormat('4:5')">4:5 Portre</button>
                                <button type="button" class="sat-fmt-btn" data-fmt="9:16" onclick="window.setSatelliteExportFormat('9:16')">9:16 Story</button>
                            </div>
                        </div>

                        <!-- 📍 Canlı Konum İğnesi (Pin) & Başlık Özelleştirme -->
                        <div class="sat-ctrl-group sat-marker-ctrl-group">
                            <button type="button" id="satToggleMarkerBtn" class="sat-btn-toggle-pin" onclick="window.toggleSatelliteMarker()" title="Harita merkezine canlı konum pini ekler">
                                <i class="fas fa-map-marker-alt"></i> <span>Pin:</span> <b id="satMarkerStatusText">Kapalı</b>
                            </button>
                            <div id="satMarkerSettingsWrapper" class="sat-marker-settings" style="display:none; align-items:center; gap:6px;">
                                <select id="satMarkerStyleSelect" class="sat-style-select" onchange="window.setSatelliteMarkerStyle(this.value)" title="Pin Görsel Stili">
                                    <option value="badge" selected>🏷️ Portföy Rozeti</option>
                                    <option value="classic">🔴 Kırmızı Klasik</option>
                                    <option value="gold">💎 Altın Lüks</option>
                                    <option value="radar">🎯 Radar Halkası</option>
                                </select>
                                <input type="text" id="satMarkerCustomTextInput" class="sat-marker-text-input" placeholder="Pin Başlığı..." value="PORTFÖYÜMÜZ" oninput="window.setSatelliteMarkerText(this.value)" title="Pin üzerindeki metni özelleştirin (Örn: Portföyümüz, Satılık Villa, vb.)">
                            </div>
                        </div>
                    </div>

                    <!-- Harita Sahnesi (Görsel Tam Tuval Boyutlarında ve Birebir Orantılı) -->
                    <div class="sat-map-stage" id="satMapStage">
                        <div class="sat-map-wrapper" id="satMapWrapper">
                            <div id="satelliteLeafletMap"></div>
                            <div id="sat3dContainer" style="display:none; width:100%; height:100%; position:absolute; top:0; left:0; z-index:2; background:#000;"></div>
                            
                            <!-- Canlı İnteraktif Konum Pini Overlay (2D ve 3D'de Tam Merkezde) -->
                            <div class="sat-map-pin-overlay" id="satMapPinOverlay" style="display:none;" title="Kadrajın tam merkezi"></div>
                        </div>
                    </div>

                    <!-- Alt Bilgilendirme ve Eylem Barı (Tüm Bilgiler Harita Dışında) -->
                    <div class="sat-modal-footer">
                        <div class="sat-footer-left">
                            <div class="sat-footer-coords" id="satCoordsBadge">
                                <i class="fas fa-crosshairs" style="color:#0284c7;"></i>
                                <span>Enlem: <b id="satCoordLat">40.6931</b> &nbsp;|&nbsp; Boylam: <b id="satCoordLng">30.2734</b> &nbsp;|&nbsp; Zoom: <b id="satCoordZoom">17x</b></span>
                            </div>
                            <div class="sat-footer-ext">
                                <button type="button" class="sat-ext-pill earth" onclick="window.openCurrentInGoogleEarth()" title="Google Earth Web'de Aç">
                                    <i class="fab fa-google"></i> Earth 3D
                                </button>
                                <button type="button" class="sat-ext-pill tkgm" onclick="window.openCurrentInTKGM()" title="TKGM Parsel Sorgu Sayfası">
                                    <i class="fas fa-draw-polygon"></i> TKGM Parsel
                                </button>
                                <button type="button" class="sat-ext-pill capture" onclick="window.captureScreenOrTabToTemplate()" title="Açılan Sekmeyi Şablon Boyutunda Canlı Yakala">
                                    <i class="fas fa-camera"></i> Sekmeyi Yakala
                                </button>
                            </div>
                        </div>
                        <div class="sat-footer-actions">
                            <button type="button" class="sat-btn-cancel" onclick="window.closeSatelliteMapModal()">
                                İptal
                            </button>
                            <button type="button" id="satCaptureBtn" class="sat-btn-capture" onclick="window.captureSatelliteToCanvas()">
                                <i class="fas fa-camera-retro"></i>
                                <span>📸 Bu Görüntüyü Şablona Aktar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;

            const div = document.createElement('div');
            div.innerHTML = modalHtml;
            document.body.appendChild(div.firstElementChild);

            this.suppressGoogleDevBanners();

            // Hızlı butonları bas
            const chipsCont = document.getElementById('satQuickChipsContainer');
            if (chipsCont) {
                this.QUICK_LOCATIONS.forEach(loc => {
                    const chip = document.createElement('button');
                    chip.type = 'button';
                    chip.className = 'sat-chip-btn';
                    chip.innerText = loc.label;
                    chip.onclick = () => {
                        SatelliteMapModule.flyTo(loc.lat, loc.lng, loc.zoom);
                    };
                    chipsCont.appendChild(chip);
                });
            }
        },

        /**
         * Leaflet Haritasını Başlatır
         */
        initMap: function() {
            if (this.map) {
                this.map.invalidateSize();
                return;
            }

            if (typeof L === 'undefined') {
                console.error('Leaflet kütüphanesi yüklenemedi!');
                alert('Harita kütüphanesi yüklenemedi. Lütfen internet bağlantınızı kontrol edin.');
                return;
            }

            const mapEl = document.getElementById('satelliteLeafletMap');
            if (!mapEl) return;

            // 1. Leaflet Haritası
            this.map = L.map('satelliteLeafletMap', {
                center: [this.currentLat, this.currentLng],
                zoom: this.currentZoom,
                maxZoom: 21,
                zoomControl: true,
                attributionControl: false
            });

            // 2. Google Uydu (mt0-mt3) - En Keskin / Google Earth Netliği (CORS *)
            this.googleSatLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
                subdomains: ['0', '1', '2', '3'],
                maxZoom: 21,
                crossOrigin: 'anonymous',
                attribution: '&copy; Google'
            });

            // 3. Google Hibrit (mt0-mt3) - Uydu + Yol ve İlçe İsimleri (CORS *)
            this.googleHybridLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
                subdomains: ['0', '1', '2', '3'],
                maxZoom: 21,
                crossOrigin: 'anonymous',
                attribution: '&copy; Google'
            });

            // 4. Esri World Imagery (Maxar HD Alternatif)
            this.esriSatLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 19,
                crossOrigin: 'anonymous',
                attribution: '&copy; Esri, Maxar'
            });

            // 5. OpenStreetMap Standart Şehir Haritası
            this.osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                crossOrigin: 'anonymous',
                attribution: '&copy; OpenStreetMap'
            });

            // Varsayılan olarak Google Uydu (Ultra Net) ile başla
            // Varsayılan olarak etiket durumuna göre Google katmanını ekle
            if (this.showMapLabels) {
                this.googleHybridLayer.addTo(this.map);
            } else {
                this.googleSatLayer.addTo(this.map);
            }

            // Harita hareket ettikçe koordinatları güncelle
            this.map.on('move', () => {
                const c = this.map.getCenter();
                const z = this.map.getZoom();
                this.currentLat = c.lat;
                this.currentLng = c.lng;
                this.currentZoom = z;
                this.updateCoordsBadge();
            });

            // Harita yeniden boyutlandığında sahne boyutlarını güncelle
            this.map.on('resize', () => {
                this.updateMapWrapperDimensions();
            });

            window.addEventListener('resize', () => {
                this.updateMapWrapperDimensions();
            });

            // Harita hazır olduğunda boyutunu tuvale göre tazele
            setTimeout(() => {
                this.updateMapWrapperDimensions();
            }, 250);

            this.isInitialized = true;
        },

        /**
         * Koordinat Rozetini Günceller
         */
        updateCoordsBadge: function() {
            const latEl = document.getElementById('satCoordLat');
            const lngEl = document.getElementById('satCoordLng');
            const zoomEl = document.getElementById('satCoordZoom');
            if (latEl) latEl.innerText = this.currentLat.toFixed(5);
            if (lngEl) lngEl.innerText = this.currentLng.toFixed(5);
            if (zoomEl) zoomEl.innerText = this.currentZoom + 'x';
        },

        /**
         * Belirtilen Koordinata Uçar
         */
        flyTo: function(lat, lng, zoom) {
            if (!this.map) return;
            this.currentLat = lat;
            this.currentLng = lng;
            this.currentZoom = zoom || 17;
            this.map.flyTo([lat, lng], this.currentZoom, {
                duration: 1.2,
                easeLinearity: 0.25
            });
        },

        /**
         * Harita Katmanını Değiştirir
         */
        setLayer: function(type) {
            if (type === 'google_3d') {
                this.initGoogle3DEarthMode();
                return;
            }

            // 3D mod açıksa kapat
            if (this.is3DActive) {
                const c3d = document.getElementById('sat3dContainer');
                if (c3d) {
                    c3d.style.display = 'none';
                    c3d.innerHTML = '';
                }
                this.is3DActive = false;
                this.map3dElement = null;
            }

            if (!this.map) return;
            this.activeLayer = type;

            // Buton aktiflik sınıfları
            document.querySelectorAll('.sat-layer-btn').forEach(btn => {
                if (btn.dataset.layer === type) btn.classList.add('active');
                else btn.classList.remove('active');
            });

            // Katmanları temizle
            if (this.map.hasLayer(this.googleSatLayer)) this.map.removeLayer(this.googleSatLayer);
            if (this.map.hasLayer(this.googleHybridLayer)) this.map.removeLayer(this.googleHybridLayer);
            if (this.map.hasLayer(this.esriSatLayer)) this.map.removeLayer(this.esriSatLayer);
            if (this.map.hasLayer(this.osmLayer)) this.map.removeLayer(this.osmLayer);

            if (type === 'google_sat') {
                if (this.showMapLabels) {
                    this.googleHybridLayer.addTo(this.map);
                } else {
                    this.googleSatLayer.addTo(this.map);
                }
            } else if (type === 'esri_sat') {
                this.esriSatLayer.addTo(this.map);
            } else if (type === 'osm') {
                this.osmLayer.addTo(this.map);
            }
        },

        /**
         * 🏷️ Haritadaki Bilgileri (Yer ve Yol İsimleri) Ekle / Sil (Aç / Kapat)
         */
        toggleSatelliteLabels: function() {
            this.showMapLabels = !this.showMapLabels;
            const statusText = document.getElementById('satLabelsStatusText');
            const btn = document.getElementById('satToggleLabelsBtn');
            if (statusText) statusText.innerText = this.showMapLabels ? 'Açık' : 'Kapalı';
            if (btn) {
                if (this.showMapLabels) btn.classList.add('active');
                else btn.classList.remove('active');
            }

            if (this.is3DActive) {
                this.google3DMode = this.showMapLabels ? 'HYBRID' : 'SATELLITE';
                if (this.map3dElement) {
                    this.map3dElement.setAttribute('mode', this.google3DMode);
                }
            } else {
                if (this.activeLayer === 'google_sat' || this.activeLayer === 'google_hybrid') {
                    if (this.map.hasLayer(this.googleSatLayer)) this.map.removeLayer(this.googleSatLayer);
                    if (this.map.hasLayer(this.googleHybridLayer)) this.map.removeLayer(this.googleHybridLayer);
                    if (this.showMapLabels) {
                        this.googleHybridLayer.addTo(this.map);
                    } else {
                        this.googleSatLayer.addTo(this.map);
                    }
                }
            }
        },

        /**
         * Marker (İğne/Pin) Toggle
         */
        toggleMarker: function(enabled) {
            if (typeof enabled === 'boolean') {
                this.markerEnabled = enabled;
            } else {
                this.markerEnabled = !this.markerEnabled;
            }

            const btn = document.getElementById('satToggleMarkerBtn');
            const statusText = document.getElementById('satMarkerStatusText');
            const settingsWrapper = document.getElementById('satMarkerSettingsWrapper');

            if (btn) {
                if (this.markerEnabled) btn.classList.add('active');
                else btn.classList.remove('active');
            }
            if (statusText) {
                statusText.innerText = this.markerEnabled ? 'Açık' : 'Kapalı';
            }
            if (settingsWrapper) {
                settingsWrapper.style.display = this.markerEnabled ? 'flex' : 'none';
            }

            this.updateLivePinOverlay();
        },

        /**
         * Marker Stilini Ayarlar
         */
        setMarkerStyle: function(style) {
            this.markerStyle = style || 'badge';
            this.updateLivePinOverlay();
        },

        /**
         * Marker Üzerindeki Özel Metni Ayarlar
         */
        setMarkerText: function(text) {
            this.customMarkerText = (typeof text === 'string') ? text : '';
            this.updateLivePinOverlay();
        },

        /**
         * Çözünürlüğü Ayarlar ('1080p' | '2k' | '4k')
         */
        setResolution: function(res) {
            this.selectedResolution = res || '2k';
            const sel = document.getElementById('satResolutionSelect');
            if (sel) sel.value = this.selectedResolution;
            const footerText = document.getElementById('satFooterText');
            const dim = this.getActiveFormatDimensions();
            if (footerText) {
                footerText.innerHTML = `Haritadaki Google uydu görüntüsü şablonunuzun formatında (<strong>${dim.label}</strong>) birebir tuvalinize aktarılır.`;
            }
        },

        /**
         * Harita Merkezindeki Canlı Pin Overlay'ini Günceller (2D ve 3D Ekranda Birebir Görünür)
         */
        updateLivePinOverlay: function() {
            const overlay = document.getElementById('satMapPinOverlay');
            if (!overlay) return;

            if (!this.markerEnabled) {
                overlay.style.display = 'none';
                return;
            }

            overlay.style.display = 'flex';
            const style = this.markerStyle || 'badge';
            const text = (typeof this.customMarkerText === 'string' && this.customMarkerText.trim().length > 0)
                         ? this.customMarkerText.trim()
                         : 'PORTFÖYÜMÜZ';

            if (style === 'radar') {
                overlay.className = 'sat-map-pin-overlay radar-mode';
                overlay.innerHTML = `
                    <div class="sat-live-radar">
                        <div class="sat-radar-ring-1"></div>
                        <div class="sat-radar-ring-2"></div>
                        <div class="sat-radar-dot"></div>
                        <div class="sat-radar-cross h"></div>
                        <div class="sat-radar-cross v"></div>
                    </div>
                `;
            } else if (style === 'gold') {
                overlay.className = 'sat-map-pin-overlay pin-mode';
                overlay.innerHTML = `
                    ${text ? `<div class="sat-live-pin-text gold">${this.escapeHtml(text)}</div>` : ''}
                    <div class="sat-live-pin-svg">
                        <svg width="44" height="58" viewBox="0 0 44 58" fill="none">
                            <filter id="liveGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.6"/>
                            </filter>
                            <path d="M22 0C10 0 0 10 0 22C0 37 22 58 22 58S44 37 44 22C44 10 34 0 22 0Z" fill="url(#satLiveGoldGrad)" stroke="#ffffff" stroke-width="2.5" filter="url(#liveGoldGlow)"/>
                            <circle cx="22" cy="21" r="9" fill="#0f172a" stroke="#fef08a" stroke-width="2"/>
                            <path d="M22 15L27 21L22 27L17 21Z" fill="#fde047"/>
                            <defs>
                                <linearGradient id="satLiveGoldGrad" x1="0" y1="0" x2="44" y2="58" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#fef08a"/>
                                    <stop offset="0.5" stop-color="#eab308"/>
                                    <stop offset="1" stop-color="#854d0e"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div class="sat-pin-ground-shadow"></div>
                `;
            } else if (style === 'classic') {
                overlay.className = 'sat-map-pin-overlay pin-mode';
                overlay.innerHTML = `
                    ${text ? `<div class="sat-live-pin-text classic">${this.escapeHtml(text)}</div>` : ''}
                    <div class="sat-live-pin-svg">
                        <svg width="42" height="56" viewBox="0 0 42 56" fill="none">
                            <filter id="liveClassicGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.6"/>
                            </filter>
                            <path d="M21 0C9.4 0 0 9.4 0 21C0 35 21 56 21 56S42 35 42 21C42 9.4 32.6 0 21 0Z" fill="url(#satLiveRedGrad)" stroke="#ffffff" stroke-width="2.5" filter="url(#liveClassicGlow)"/>
                            <circle cx="21" cy="20" r="8" fill="#ffffff"/>
                            <circle cx="21" cy="20" r="4.5" fill="#dc2626"/>
                            <defs>
                                <linearGradient id="satLiveRedGrad" x1="0" y1="0" x2="42" y2="56" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#ef4444"/>
                                    <stop offset="1" stop-color="#991b1b"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div class="sat-pin-ground-shadow"></div>
                `;
            } else {
                // badge (Portföy Rozeti)
                overlay.className = 'sat-map-pin-overlay pin-mode';
                overlay.innerHTML = `
                    <div class="sat-live-badge-card">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${this.escapeHtml(text)}</span>
                    </div>
                    <div class="sat-live-pin-svg">
                        <svg width="36" height="46" viewBox="0 0 36 46" fill="none">
                            <filter id="liveBadgePinGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.5"/>
                            </filter>
                            <path d="M18 0C8.1 0 0 8.1 0 18C0 30 18 46 18 46S36 30 36 18C36 8.1 27.9 0 18 0Z" fill="#0284c7" stroke="#ffffff" stroke-width="2" filter="url(#liveBadgePinGlow)"/>
                            <circle cx="18" cy="17" r="7" fill="#ffffff"/>
                        </svg>
                    </div>
                    <div class="sat-pin-ground-shadow"></div>
                `;
            }
        },

        escapeHtml: function(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        },

        /**
         * Mevcut Projeden Konum Bilgisini Otomatik Çıkarır
         */
        detectLocationFromProject: function() {
            let foundQuery = '';

            // 1. Açıklama metninden ara (#descInput)
            const desc = document.getElementById('descInput')?.value || '';
            if (desc) {
                const locRegex = /(İstanbul|Ankara|İzmir|Bursa|Antalya|Adana|Konya|Gaziantep|Şanlıurfa|Kocaeli|Mersin|Diyarbakır|Hatay|Manisa|Kayseri|Samsun|Balıkesir|Kahramanmaraş|Van|Aydın|Tekirdağ|Sakarya|Denizli|Muğla|Eskişehir|Trabzon|Ordu|Afyon|Sivas|Malatya|Batman|Tokat|Düzce|Uşak|Kütahya|Yalova|Bolu|Rize|Edirne|Çanakkale|Sapanca|Kaynarca|Serdivan|Karasu|Bodrum|Fethiye|Marmaris|Datça|Alanya|Manavgat|Kemer|Kaş|Kalkan|Kadıköy|Beşiktaş|Üsküdar|Sarıyer|Bakırköy|Çeşme|Urla|Alaçatı|Bornova|Karşıyaka|Nilüfer|Mudanya)/i;
                const match = desc.match(locRegex);
                if (match) {
                    foundQuery = match[0];
                    const lines = desc.split('\n');
                    for (let l of lines) {
                        if (l.toLowerCase().includes(foundQuery.toLowerCase())) {
                            foundQuery = l.replace(/[📍📌📐🏢🏠🛣️🌿*]/g, '').trim();
                            break;
                        }
                    }
                }
            }

            // 2. Dinamik form konum alanlarından ara
            if (!foundQuery) {
                const fKonum = document.getElementById('f_konum')?.value;
                const fLokasyon = document.getElementById('f_lokasyon')?.value;
                if (fKonum && fKonum.length > 2 && fKonum.toLowerCase() !== 'merkezi') foundQuery = fKonum;
                else if (fLokasyon && fLokasyon.length > 2 && fLokasyon.toLowerCase() !== 'merkez') foundQuery = fLokasyon;
            }

            return foundQuery;
        },

        /**
         * Nominatim Geocoding ile Arama Yapar
         */
        searchLocation: function(query) {
            const input = document.getElementById('satSearchInput');
            const q = query || (input ? input.value.trim() : '');
            if (!q) {
                alert('Lütfen aramak istediğiniz il, ilçe veya mahalle adını yazın.');
                return;
            }

            const searchBtn = document.getElementById('satSearchBtn');
            if (searchBtn) {
                searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Bulunuyor...';
                searchBtn.disabled = true;
            }

            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=tr&limit=1`;

            fetch(url, {
                headers: { 'Accept': 'application/json' }
            })
            .then(res => res.json())
            .then(data => {
                if (searchBtn) {
                    searchBtn.innerHTML = '<i class="fas fa-search"></i> Bul';
                    searchBtn.disabled = false;
                }

                if (data && data.length > 0) {
                    const result = data[0];
                    const lat = parseFloat(result.lat);
                    const lng = parseFloat(result.lon);
                    
                    let targetZoom = 17;
                    if (result.type === 'administrative' || result.class === 'boundary') {
                        targetZoom = 15;
                    }
                    if (q.toLowerCase().includes('ada') || q.toLowerCase().includes('parsel') || q.toLowerCase().includes('mahalle') || q.toLowerCase().includes('sokak') || q.toLowerCase().includes('cadde')) {
                        targetZoom = 18;
                    }

                    SatelliteMapModule.flyTo(lat, lng, targetZoom);

                    if (typeof window.showAppToast === 'function') {
                        window.showAppToast(`📍 Konum bulundu: ${result.display_name.split(',')[0]}`, 'success');
                    }
                } else {
                    alert(`"${q}" için sonuç bulunamadı. Lütfen il ve ilçe adını birlikte yazmayı deneyin (Örn: Sakarya Sapanca).`);
                }
            })
            .catch(err => {
                console.error('Nominatim Geocoding Hatası:', err);
                if (searchBtn) {
                    searchBtn.innerHTML = '<i class="fas fa-search"></i> Bul';
                    searchBtn.disabled = false;
                }
                alert('Arama servisine bağlanırken bir sorun oluştu. Lütfen tekrar deneyin.');
            });
        },

        /**
         * Tarayıcı GPS Konumunu Alır
         */
        locateCurrentPosition: function() {
            const geoBtn = document.getElementById('satGeoBtn');
            if (!navigator.geolocation) {
                alert('Tarayıcınız konum servisini desteklemiyor.');
                return;
            }

            if (geoBtn) {
                geoBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                geoBtn.disabled = true;
            }

            navigator.geolocation.getCurrentPosition(
                pos => {
                    if (geoBtn) {
                        geoBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Konumum';
                        geoBtn.disabled = false;
                    }
                    SatelliteMapModule.flyTo(pos.coords.latitude, pos.coords.longitude, 18);
                },
                err => {
                    if (geoBtn) {
                        geoBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Konumum';
                        geoBtn.disabled = false;
                    }
                    alert('Konum alınamadı. Lütfen tarayıcınızda konum iznini kontrol edin.');
                },
                { enableHighAccuracy: true, timeout: 8000 }
            );
        },

        /**
         * Aktif Şablon Formatına ve Seçili Çözünürlüğe Göre Hedef Boyutları Döndürür
         */
        getActiveFormatDimensions: function() {
            const fmt = this.selectedFormat || '16:9';
            const res = this.selectedResolution || '2k';

            if (res === '4k') {
                switch (fmt) {
                    case '1:1':
                        return { w: 2160, h: 2160, label: '1:1 Kare (2160x2160 - 4K)' };
                    case '4:5':
                        return { w: 2160, h: 2700, label: '4:5 Portre (2160x2700 - 4K)' };
                    case '9:16':
                        return { w: 2160, h: 3840, label: '9:16 Dikey Story (2160x3840 - 4K)' };
                    case '16:9':
                    default:
                        return { w: 3840, h: 2160, label: '16:9 Yatay (3840x2160 - 4K UHD)' };
                }
            } else if (res === '2k') {
                switch (fmt) {
                    case '1:1':
                        return { w: 1440, h: 1440, label: '1:1 Kare (1440x1440 - 2K QHD)' };
                    case '4:5':
                        return { w: 1440, h: 1800, label: '4:5 Portre (1440x1800 - 2K)' };
                    case '9:16':
                        return { w: 1440, h: 2560, label: '9:16 Dikey Story (1440x2560 - 2K)' };
                    case '16:9':
                    default:
                        return { w: 2560, h: 1440, label: '16:9 Yatay (2560x1440 - 2K QHD)' };
                }
            } else {
                // 1080p Full HD
                switch (fmt) {
                    case '1:1':
                        return { w: 1080, h: 1080, label: '1:1 Kare (1080x1080)' };
                    case '4:5':
                        return { w: 1080, h: 1350, label: '4:5 Portre (1080x1350)' };
                    case '9:16':
                        return { w: 1080, h: 1920, label: '9:16 Dikey Story (1080x1920)' };
                    case '16:9':
                    default:
                        return { w: 1920, h: 1080, label: '16:9 Full HD (1920x1080)' };
                }
            }
        },

        /**
         * Kadraj Dışa Aktarım Formatını Değiştirir
         */
        setExportFormat: function(fmt) {
            this.selectedFormat = fmt || '16:9';
            const btns = document.querySelectorAll('.sat-fmt-btn');
            btns.forEach(btn => {
                if (btn.getAttribute('data-fmt') === this.selectedFormat) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            this.updateMapWrapperDimensions();

            const footerText = document.getElementById('satFooterText');
            const dim = this.getActiveFormatDimensions();
            if (footerText) {
                footerText.innerHTML = `Haritadaki Google uydu görüntüsü şablonunuzun formatında (<strong>${dim.label}</strong>) birebir tuvalinize aktarılır.`;
            }
        },

        /**
         * Harita Sahnesini ve Modal Penceresini Tuval Boyutuna Birebir Eşitler
         * Açılan Pencere Tuval Oranında Olur ve Kenarlarda Asla Siyah Kısım Kalmaz
         */
        updateMapWrapperDimensions: function() {
            const modalContainer = document.querySelector('.sat-modal-container');
            const stage = document.getElementById('satMapStage');
            const wrapper = document.getElementById('satMapWrapper');
            if (!modalContainer || !stage || !wrapper) return;

            const dim = this.getActiveFormatDimensions();
            const targetRatio = dim.w / dim.h; // Örn: 16/9 = 1.7778, 1/1 = 1, 4/5 = 0.8, 9/16 = 0.5625

            const winW = window.innerWidth;
            const winH = window.innerHeight;

            // Maksimum sığabileceği ekran alanı (kenar boşlukları çıkarılmış)
            const maxW = Math.min(1450, winW - 24);
            const maxH = Math.min(940, winH - 24);

            // Başlık, arama, kontroller ve alt çubuğun toplam yüksekliği
            const headerEl = modalContainer.querySelector('.sat-modal-header');
            const searchEl = modalContainer.querySelector('.sat-toolbar-search');
            const ctrlEl = modalContainer.querySelector('.sat-controls-bar');
            const footerEl = modalContainer.querySelector('.sat-modal-footer');

            const overheadH = (headerEl ? headerEl.offsetHeight : 54) +
                              (searchEl ? searchEl.offsetHeight : 50) +
                              (ctrlEl ? ctrlEl.offsetHeight : 44) +
                              (footerEl ? footerEl.offsetHeight : 50);

            // Harita için kullanılabilir dikey alan
            let availMapH = maxH - overheadH;
            if (availMapH < 260) availMapH = 260;

            // Hedef orana göre harita boyutunu hesapla
            let mapW = Math.round(availMapH * targetRatio);
            let mapH = availMapH;

            // Eğer genişlik ekranı aşıyorsa, genişliğe göre yüksekliği tekrar hesapla
            if (mapW > maxW) {
                mapW = maxW;
                mapH = Math.round(mapW / targetRatio);
            }

            // Arayüz butonları için minimum okunabilir pencere genişliği
            const finalContainerW = Math.min(maxW, Math.max(580, mapW));
            const finalContainerH = Math.min(maxH, mapH + overheadH);

            modalContainer.style.width = finalContainerW + 'px';
            modalContainer.style.maxWidth = finalContainerW + 'px';
            modalContainer.style.height = finalContainerH + 'px';
            modalContainer.style.maxHeight = finalContainerH + 'px';

            // Harita sahnesi %100 alan kaplasın - kenarlarda asla siyah boşluk kalmasın
            wrapper.style.width = '100%';
            wrapper.style.height = '100%';

            if (this.map) {
                this.map.invalidateSize();
            }
        },

        /**
         * Modalı Açar
         */
        openModal: function() {
            this.ensureModalDOM();

            const modal = document.getElementById('satelliteMapModal');
            if (!modal) return;

            // Mevcut şablonun/tuvalin formatını algıla ve kadraj formatı olarak belirle
            const previewSel = document.getElementById('previewFormat');
            if (previewSel && previewSel.value) {
                const val = previewSel.value;
                if (val.includes('1:1') || val.includes('Kare')) {
                    this.selectedFormat = '1:1';
                } else if (val.includes('4:5') || val.includes('Portre')) {
                    this.selectedFormat = '4:5';
                } else if (val.includes('9:16') || val.includes('Hikaye') || val.includes('Story')) {
                    this.selectedFormat = '9:16';
                } else {
                    this.selectedFormat = '16:9';
                }
            }
            this.setExportFormat(this.selectedFormat);

            // Çözünürlük ve Pin ayarlarını arayüze yansıt
            const resSel = document.getElementById('satResolutionSelect');
            if (resSel) resSel.value = this.selectedResolution;

            const textInput = document.getElementById('satMarkerCustomTextInput');
            if (textInput) textInput.value = this.customMarkerText || 'PORTFÖYÜMÜZ';

            const styleSel = document.getElementById('satMarkerStyleSelect');
            if (styleSel) styleSel.value = this.markerStyle || 'badge';

            this.updateLivePinOverlay();

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            setTimeout(() => {
                this.initMap();
                this.updateMapWrapperDimensions();

                const detected = this.detectLocationFromProject();
                const input = document.getElementById('satSearchInput');
                if (detected && input && !input.value) {
                    input.value = detected;
                    this.searchLocation(detected);
                } else if (this.map) {
                    this.map.invalidateSize();
                }
            }, 100);
        },

        /**
         * Modalı Kapatır
         */
        closeModal: function() {
            const modal = document.getElementById('satelliteMapModal');
            if (modal) {
                modal.style.display = 'none';
            }
            document.body.style.overflow = '';
            if (typeof window.hideAppLoading === 'function') {
                window.hideAppLoading();
            }
        },

        /**
         * Google / Esri / OSM Sunucularından zoom+1 (2K) veya zoom+2 (4K) Derinlikli Orijinal Karoları İndirip Birleştirir
         * Bu sayede piksel büyütme/yapay uzatma DEĞİL, gerçek optik uydu netliğinde 2K ve 4K görsel elde edilir.
         */
        fetchAndStitchHighResTiles: async function(targetW, targetH, targetZoom) {
            if (!this.map) throw new Error('Harita hazır değil.');

            const center = this.map.getCenter();
            const centerPt = this.map.project(center, targetZoom);

            const minX = centerPt.x - (targetW / 2);
            const minY = centerPt.y - (targetH / 2);
            const maxX = minX + targetW;
            const maxY = minY + targetH;

            const tileSize = 256;
            const startTileX = Math.floor(minX / tileSize);
            const endTileX = Math.floor(maxX / tileSize);
            const startTileY = Math.floor(minY / tileSize);
            const endTileY = Math.floor(maxY / tileSize);

            const tileCoords = [];
            const activeLayer = this.activeLayer;
            const showLabels = this.showMapLabels;

            for (let ty = startTileY; ty <= endTileY; ty++) {
                for (let tx = startTileX; tx <= endTileX; tx++) {
                    let url = '';
                    if (activeLayer === 'google_sat' || activeLayer === 'google_hybrid' || activeLayer === 'google_3d') {
                        const lyrs = showLabels ? 'y' : 's';
                        const s = Math.abs((tx + ty) % 4);
                        url = `https://mt${s}.google.com/vt/lyrs=${lyrs}&x=${tx}&y=${ty}&z=${targetZoom}`;
                    } else if (activeLayer === 'esri_sat') {
                        url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${targetZoom}/${ty}/${tx}`;
                    } else if (activeLayer === 'osm') {
                        const sub = ['a', 'b', 'c'][Math.abs((tx + ty) % 3)];
                        url = `https://${sub}.tile.openstreetmap.org/${targetZoom}/${tx}/${ty}.png`;
                    } else {
                        const s = Math.abs((tx + ty) % 4);
                        url = `https://mt${s}.google.com/vt/lyrs=s&x=${tx}&y=${ty}&z=${targetZoom}`;
                    }
                    tileCoords.push({ tx, ty, url });
                }
            }

            const loadTile = (item) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    let finished = false;
                    const timer = setTimeout(() => {
                        if (!finished) {
                            finished = true;
                            resolve({ item, img: null });
                        }
                    }, 5000);

                    img.onload = () => {
                        if (!finished) {
                            finished = true;
                            clearTimeout(timer);
                            resolve({ item, img });
                        }
                    };
                    img.onerror = () => {
                        if (!finished) {
                            finished = true;
                            clearTimeout(timer);
                            resolve({ item, img: null });
                        }
                    };
                    img.src = item.url;
                });
            };

            const results = await Promise.all(tileCoords.map(item => loadTile(item)));

            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, targetW, targetH);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            let validCount = 0;
            results.forEach(({ item, img }) => {
                if (!img) return;
                validCount++;
                const tilePixelX = item.tx * tileSize;
                const tilePixelY = item.ty * tileSize;
                const destX = Math.round(tilePixelX - minX);
                const destY = Math.round(tilePixelY - minY);
                ctx.drawImage(img, destX, destY, tileSize, tileSize);
            });

            // En az %50 karo geldiyse geçerli kabul et
            if (validCount >= Math.ceil(tileCoords.length * 0.5)) {
                return canvas;
            }
            return null;
        },

        /**
         * Ekranda Zaten Yüklü Olan DOM Karolarını Çizen Yedek Motor (İnternet Yavaşsa veya Çevrimdışıysa)
         */
        renderVisibleDomTilesToCanvas: function(targetW, targetH) {
            const mapContainer = document.getElementById('satelliteLeafletMap');
            if (!mapContainer) return null;

            const mapRect = mapContainer.getBoundingClientRect();
            const targetRatio = targetW / targetH;
            const mapW = mapRect.width;
            const mapH = mapRect.height;
            const mapRatio = mapW / mapH;

            let cropW = mapW, cropH = mapH, cropX = 0, cropY = 0;
            if (Math.abs(mapRatio - targetRatio) > 0.01) {
                if (mapRatio > targetRatio) {
                    cropH = mapH;
                    cropW = mapH * targetRatio;
                    cropX = (mapW - cropW) / 2;
                } else {
                    cropW = mapW;
                    cropH = mapW / targetRatio;
                    cropY = (mapH - cropH) / 2;
                }
            }

            const scale = targetW / cropW;
            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, targetW, targetH);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            const tilePane = mapContainer.querySelector('.leaflet-tile-pane');
            const tiles = tilePane ? Array.from(tilePane.querySelectorAll('img.leaflet-tile')) : Array.from(mapContainer.querySelectorAll('.leaflet-tile'));

            tiles.forEach(tile => {
                try {
                    if (!tile.complete || tile.naturalWidth === 0 || !tile.src) return;
                    const style = window.getComputedStyle(tile);
                    if (style.display === 'none' || style.visibility === 'hidden') return;
                    const opacity = parseFloat(style.opacity);
                    if (!isNaN(opacity) && opacity <= 0) return;

                    const tileRect = tile.getBoundingClientRect();
                    const dx = (tileRect.left - mapRect.left - cropX) * scale;
                    const dy = (tileRect.top - mapRect.top - cropY) * scale;
                    const dw = tileRect.width * scale;
                    const dh = tileRect.height * scale;

                    if (dx + dw > 0 && dx < targetW && dy + dh > 0 && dy < targetH) {
                        ctx.globalAlpha = isNaN(opacity) ? 1.0 : opacity;
                        ctx.drawImage(tile, dx, dy, dw, dh);
                    }
                } catch(e) {}
            });
            ctx.globalAlpha = 1.0;
            return canvas;
        },

        /**
         * Haritadaki Mevcut Görünümü Şablon Formatında Çeker ve Canvas'a Birebir Uygular (2K & 4K Destekli)
         */
        captureAndApply: async function() {
            const targetDim = this.getActiveFormatDimensions();
            const targetW = targetDim.w;
            const targetH = targetDim.h;

            const captureBtn = document.getElementById('satCaptureBtn');
            if (captureBtn) {
                const resName = (this.selectedResolution || '2K').toUpperCase();
                captureBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>${resName} Çözünürlükte Çekiliyor...</span>`;
                captureBtn.disabled = true;
            }

            if (this.is3DActive) {
                // 1. Google 3D WebGL Canvas Yakalama
                let capturedDirectly = false;
                try {
                    const host = document.getElementById('sat3dMapHost');
                    const mapEl = this.map3dElement || (host ? host.querySelector('gmp-map-3d') : null);
                    const root = mapEl ? (mapEl.shadowRoot || mapEl) : null;
                    const canvas = root ? root.querySelector('canvas') : null;
                    if (canvas && canvas.width > 0 && canvas.height > 0) {
                        const targetRatio = targetW / targetH;
                        const cW = canvas.width;
                        const cH = canvas.height;
                        const cRatio = cW / cH;

                        let srcX = 0, srcY = 0, srcW = cW, srcH = cH;
                        if (Math.abs(cRatio - targetRatio) > 0.01) {
                            if (cRatio > targetRatio) {
                                srcW = cH * targetRatio;
                                srcX = (cW - srcW) / 2;
                            } else {
                                srcH = cW / targetRatio;
                                srcY = (cH - srcH) / 2;
                            }
                        }

                        const offCanvas = document.createElement('canvas');
                        offCanvas.width = targetW;
                        offCanvas.height = targetH;
                        const ctx = offCanvas.getContext('2d');
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(canvas, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);

                        if (this.markerEnabled) {
                            this.drawVectorMarker(ctx, targetW / 2, targetH / 2, this.markerStyle, this.customMarkerText, targetW);
                        }

                        const dataUrl = offCanvas.toDataURL('image/jpeg', 0.96);
                        if (dataUrl && dataUrl.length > 1000) {
                            if (typeof window.applyProjectImageFromDataUrl === 'function') {
                                window.applyProjectImageFromDataUrl(dataUrl, (err) => {
                                    if (captureBtn) {
                                        captureBtn.innerHTML = '<i class="fas fa-camera-retro"></i> <span>📸 Bu Görüntüyü Şablona Aktar</span>';
                                        captureBtn.disabled = false;
                                    }
                                    if (!err) {
                                        SatelliteMapModule.closeModal();
                                        if (typeof window.showAppToast === 'function') {
                                            window.showAppToast(`🌐 Google 3D görüntüsü (${targetW}x${targetH}) tuvalinize aktarıldı!`, 'success');
                                        }
                                    }
                                });
                                capturedDirectly = true;
                            }
                        }
                    }
                } catch(e) {
                    console.warn("Doğrudan 3D WebGL aktarımı yapılamadı, canlı sekme yakalamaya yönlendiriliyor:", e);
                }

                if (!capturedDirectly) {
                    if (captureBtn) {
                        captureBtn.innerHTML = '<i class="fas fa-camera-retro"></i> <span>📸 Bu Görüntüyü Şablona Aktar</span>';
                        captureBtn.disabled = false;
                    }
                    if (typeof window.captureScreenOrTabToTemplate === 'function') {
                        window.captureScreenOrTabToTemplate();
                    } else {
                        alert("3D görünümü aktarmak için alttaki 'Sekmeyi Yakala' butonunu kullanabilirsiniz.");
                    }
                }
                return;
            }

            // 2. 2D Google / Esri Uydu Haritası Yakalama (Gerçek 2K / 4K Motoru)
            const mapContainer = document.getElementById('satelliteLeafletMap');
            if (!mapContainer || !this.map) {
                alert('Harita henüz hazır değil.');
                if (captureBtn) {
                    captureBtn.innerHTML = '<i class="fas fa-camera-retro"></i> <span>📸 Bu Görüntüyü Şablona Aktar</span>';
                    captureBtn.disabled = false;
                }
                return;
            }

            try {
                // Hedef derinlik zoom seviyesi
                let targetZoom = this.currentZoom;
                if (this.selectedResolution === '4k') {
                    targetZoom = Math.min(21, this.currentZoom + 2); // 16x daha fazla optik detay
                } else if (this.selectedResolution === '2k') {
                    targetZoom = Math.min(21, this.currentZoom + 1); // 4x daha fazla optik detay
                }

                let offCanvas = null;
                try {
                    // Gerçek çoklu karo birleştirme motorunu çalıştır
                    offCanvas = await this.fetchAndStitchHighResTiles(targetW, targetH, targetZoom);
                } catch (stitchErr) {
                    console.warn("Yüksek çözünürlüklü karo motoru hatası, DOM karolarına dönülüyor:", stitchErr);
                }

                // Eğer karo indirme başarısız olduysa mevcut ekrandaki karoları kullan
                if (!offCanvas) {
                    offCanvas = this.renderVisibleDomTilesToCanvas(targetW, targetH);
                }

                if (!offCanvas) {
                    throw new Error('Harita görseli oluşturulamadı.');
                }

                const ctx = offCanvas.getContext('2d');

                // 📍 Eğer kullanıcı Konum İğnesi seçtiyse tam merkeze vektörel çiz (Çözünürlüğe orantılı)
                if (this.markerEnabled) {
                    this.drawVectorMarker(ctx, targetW / 2, targetH / 2, this.markerStyle, this.customMarkerText, targetW);
                }

                // Yüksek kaliteli JPEG DataURL al
                const dataUrl = offCanvas.toDataURL('image/jpeg', 0.96);

                // Ana uygulamaya aktar (Şablonun boyutunu bozmadan tam çözünürlükte uygular)
                if (typeof window.applyProjectImageFromDataUrl === 'function') {
                    window.applyProjectImageFromDataUrl(dataUrl, (err) => {
                        if (captureBtn) {
                            captureBtn.innerHTML = '<i class="fas fa-camera-retro"></i> <span>📸 Bu Görüntüyü Şablona Aktar</span>';
                            captureBtn.disabled = false;
                        }

                        if (!err) {
                            SatelliteMapModule.closeModal();
                            if (typeof window.showAppToast === 'function') {
                                const resTag = (this.selectedResolution || '2K').toUpperCase();
                                window.showAppToast(`🛰️ ${resTag} Uydu görüntüsü (${targetW}x${targetH}) başarıyla tuvalinize uygulandı!`, 'success');
                            }
                        }
                    });
                } else {
                    throw new Error('applyProjectImageFromDataUrl motoru bulunamadı.');
                }

            } catch (err) {
                console.error('Uydu görüntüsü aktarma hatası:', err);
                if (captureBtn) {
                    captureBtn.innerHTML = '<i class="fas fa-camera-retro"></i> <span>📸 Bu Görüntüyü Şablona Aktar</span>';
                    captureBtn.disabled = false;
                }
                if (typeof window.hideAppLoading === 'function') {
                    window.hideAppLoading();
                }
                alert('Uydu görüntüsü aktarılırken bir sorun oluştu: ' + err.message);
            }
        },

        /**
         * Tuvalin Tam Merkezine Vektörel Konum İğnesi Çizer (2K ve 4K Çözünürlüğe Orantılı)
         */
        drawVectorMarker: function(ctx, cx, cy, style, text, targetW) {
            ctx.save();
            const scale = Math.max(1, (targetW || 1920) / 1920);
            ctx.translate(cx, cy);
            ctx.scale(scale, scale);

            const markerText = (typeof text === 'string' && text.trim().length > 0) ? text.trim() : 'PORTFÖYÜMÜZ';

            if (style === 'classic') {
                // 🔴 Kırmızı Klasik Teardrop Pin
                ctx.beginPath();
                ctx.ellipse(0, 4, 18, 6, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-24, -35, -35, -65, -35, -90);
                ctx.arc(0, -90, 35, Math.PI, 0, false);
                ctx.bezierCurveTo(35, -65, 24, -35, 0, 0);
                ctx.closePath();

                const grad = ctx.createLinearGradient(-35, -125, 35, 0);
                grad.addColorStop(0, '#ef4444');
                grad.addColorStop(1, '#b91c1c');
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(0, -90, 15, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(0, -90, 7, 0, Math.PI * 2);
                ctx.fillStyle = '#b91c1c';
                ctx.fill();

                if (markerText) {
                    this.drawMarkerLabelBadge(ctx, 0, -145, markerText, '#ef4444', '#ffffff');
                }

            } else if (style === 'gold') {
                // 💎 Altın Lüks Pin
                ctx.beginPath();
                ctx.ellipse(0, 5, 20, 7, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-26, -38, -38, -68, -38, -95);
                ctx.arc(0, -95, 38, Math.PI, 0, false);
                ctx.bezierCurveTo(38, -68, 26, -38, 0, 0);
                ctx.closePath();

                const goldGrad = ctx.createLinearGradient(-38, -133, 38, 0);
                goldGrad.addColorStop(0, '#fef08a');
                goldGrad.addColorStop(0.5, '#eab308');
                goldGrad.addColorStop(1, '#a16207');
                ctx.fillStyle = goldGrad;
                ctx.fill();
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(0, -95, 17, 0, Math.PI * 2);
                ctx.fillStyle = '#0f172a';
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#fef08a';
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(0, -105);
                ctx.lineTo(8, -95);
                ctx.lineTo(0, -85);
                ctx.lineTo(-8, -95);
                ctx.closePath();
                ctx.fillStyle = '#fef08a';
                ctx.fill();

                if (markerText) {
                    this.drawMarkerLabelBadge(ctx, 0, -150, markerText, '#eab308', '#fef08a');
                }

            } else if (style === 'radar') {
                // 🎯 Radar / Parsel Hedef Halkası
                ctx.beginPath();
                ctx.arc(0, 0, 90, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(0, 0, 75, 0, Math.PI * 2);
                ctx.setLineDash([8, 6]);
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#10b981';
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.beginPath();
                ctx.arc(0, 0, 42, 0, Math.PI * 2);
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = '#34d399';
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fillStyle = '#10b981';
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();

                ctx.lineWidth = 2.5;
                ctx.strokeStyle = '#10b981';
                ctx.beginPath(); ctx.moveTo(-105, 0); ctx.lineTo(-50, 0); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(50, 0); ctx.lineTo(105, 0); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, -105); ctx.lineTo(0, -50); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, 50); ctx.lineTo(0, 105); ctx.stroke();

            } else {
                // badge (🏷️ Portföy Rozeti)
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-20, -25, -28, -50, -28, -70);
                ctx.arc(0, -70, 28, Math.PI, 0, false);
                ctx.bezierCurveTo(28, -50, 20, -25, 0, 0);
                ctx.closePath();
                ctx.fillStyle = '#0284c7';
                ctx.fill();
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(0, -70, 12, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();

                this.drawMarkerLabelBadge(ctx, 0, -135, '📍 ' + markerText, '#38bdf8', '#ffffff', true);
            }

            ctx.restore();
        },

        /**
         * Vektörel Pin Rozetini Çizer
         */
        drawMarkerLabelBadge: function(ctx, x, y, text, borderColor, textColor, isProminent) {
            ctx.save();
            ctx.font = 'bold 18px "Montserrat", sans-serif';
            const textWidth = ctx.measureText(text).width;
            const bWidth = Math.max(180, textWidth + 36);
            const bHeight = isProminent ? 46 : 38;
            const bX = x - (bWidth / 2);
            const bY = y - (bHeight / 2);
            const radius = 10;

            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetY = 4;

            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(bX, bY, bWidth, bHeight, radius);
            } else {
                ctx.rect(bX, bY, bWidth, bHeight);
            }
            ctx.fillStyle = '#0f172a';
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = borderColor;
            ctx.stroke();

            ctx.shadowColor = 'transparent';
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, x, y);
            ctx.restore();
        },

        /**
         * Google 3D Earth (Maps Platform Photorealistic 3D) Modunu Başlatır
         */
        initGoogle3DEarthMode: function() {
            let key = (typeof window.GOOGLE_MAPS_3D_KEY === 'string' && window.GOOGLE_MAPS_3D_KEY.trim())
                      || this.google3DKey 
                      || (typeof window.getGeminiApiKey === 'function' ? window.getGeminiApiKey() : '')
                      || localStorage.getItem('GOOGLE_MAPS_3D_KEY');
            if (!key) {
                const inputKey = prompt(
                    "🌐 GOOGLE 3D EARTH (PHOTOREALISTIC MAPS) ENTEGRASYONU:\n\n" +
                    "Google'ın WebGL 3D Photorealistic Dünya motorunu doğrudan bu pencerede görüntülemek için bir Google Maps Platform API anahtarı gereklidir.\n" +
                    "(Gereken API yetkileri: Photorealistic 3D Tiles ve Maps JavaScript API)\n\n" +
                    "Google Maps API anahtarınız varsa lütfen buraya yapıştırın:\n" +
                    "(API anahtarınız yoksa 'İptal' diyerek pencere altındaki '1. Earth 3D Aç' + '2. Sekmeyi Şablon Boyutunda Canlı Yakala' özelliğiyle tamamen ÜCRETSİZ ve tek tıkla şablonunuza aktarabilirsiniz!)"
                );
                if (!inputKey || !inputKey.trim()) {
                    return;
                }
                key = inputKey.trim();
                this.google3DKey = key;
                try {
                    localStorage.setItem('GOOGLE_MAPS_3D_KEY', key);
                } catch(e) {}
            } else {
                this.google3DKey = key;
            }

            this.loadAndMountGoogle3D();
        },

        /**
         * Google Photorealistic 3D Map (<gmp-map-3d>) Bileşenini Yükler ve Yerleştirir
         */
        loadAndMountGoogle3D: function() {
            const container = document.getElementById('sat3dContainer');
            const reticle = document.getElementById('satReticleOverlay');
            if (!container) return;

            // 3D Haritayı tüm alanı kaplayacak şekilde aç, nişangah kılavuzunu gizle
            container.style.display = 'block';
            if (reticle) reticle.style.display = 'none';

            // 3D Harita butonunu aktif yap
            document.querySelectorAll('.sat-layer-btn').forEach(btn => {
                if (btn.dataset.layer === 'google_3d') btn.classList.add('active');
                else btn.classList.remove('active');
            });

            this.suppressGoogleDevBanners();

            // HARİTA ÜZERİNDE HİÇBİR TOOLBAR VEYA BANNER OLMASIN - TAMAMEN TEMİZ VE NET
            container.innerHTML = `
                <div id="sat3dMapHost" style="width:100%; height:100%; position:relative; overflow:hidden;">
                    <div style="display:flex; align-items:center; justify-content:center; height:100%; color:#94a3b8; font-size:13px; gap:8px;">
                        <i class="fas fa-spinner fa-spin" style="color:#38bdf8; font-size:18px;"></i>
                        <span>Google Photorealistic 3D Earth yükleniyor...</span>
                    </div>
                </div>
            `;

            const host = document.getElementById('sat3dMapHost');

            const mountElement = () => {
                try {
                    host.innerHTML = '';
                    const map3d = document.createElement('gmp-map-3d');
                    map3d.setAttribute('mode', this.google3DMode || 'HYBRID');
                    map3d.setAttribute('center', `${this.currentLat},${this.currentLng},0`);
                    map3d.setAttribute('range', (this.google3DRange || 1400).toString());
                    map3d.setAttribute('tilt', (this.google3DTilt || 45).toString());
                    map3d.setAttribute('heading', '0');
                    map3d.setAttribute('min-tilt', '0');
                    map3d.setAttribute('max-tilt', '80');
                    map3d.style.width = '100%';
                    map3d.style.height = '100%';
                    map3d.style.display = 'block';
                    map3d.style.position = 'absolute';
                    map3d.style.top = '0';
                    map3d.style.left = '0';
                    host.appendChild(map3d);
                    this.map3dElement = map3d;
                    this.is3DActive = true;
                } catch(e) {
                    console.error("gmp-map-3d başlatma hatası:", e);
                    host.innerHTML = `<div style="padding:20px; color:#f87171; text-align:center;">3D Bileşen başlatılamadı: ${e.message}</div>`;
                }
            };

            // Google Maps Auth / Quota Hatası Yakalayıcı (Kota dolduğunda otomatik 2D uyduya döner)
            window.gm_authFailure = () => {
                console.warn("Google Maps 3D: Kota sınırı veya yetki hatası algılandı.");
                SatelliteMapModule.exitGoogle3DMode();
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Google 3D aylık ücretsiz kotası doldu. Otomatik olarak standart HD uydu haritasına geçildi.', 'info');
                }
            };

            if (window.google && window.google.maps && window.google.maps.maps3d) {
                mountElement();
            } else {
                const existingScript = document.getElementById('googleMaps3dScript');
                if (existingScript) existingScript.remove();

                const script = document.createElement('script');
                script.id = 'googleMaps3dScript';
                script.src = `https://maps.googleapis.com/maps/api/js?key=${this.google3DKey}&v=alpha&libraries=maps3d`;
                script.async = true;
                script.onload = () => {
                    setTimeout(mountElement, 300);
                };
                script.onerror = () => {
                    console.warn("Google Maps 3D scripti yüklenemedi.");
                    SatelliteMapModule.exitGoogle3DMode();
                    if (typeof window.showAppToast === 'function') {
                        window.showAppToast('Google 3D bağlantısı kurulamadı veya kotası doldu. Standart HD uydu haritasına geçildi.', 'info');
                    }
                };
                document.head.appendChild(script);
            }
        },

        zoomGoogle3D: function(factor) {
            if (!this.map3dElement) return;
            let currentRange = parseFloat(this.map3dElement.getAttribute('range')) || this.google3DRange || 1400;
            let newRange = Math.round(currentRange * factor);
            if (newRange < 150) newRange = 150;
            if (newRange > 35000) newRange = 35000;
            this.google3DRange = newRange;
            this.map3dElement.setAttribute('range', newRange.toString());
        },

        toggleGoogle3DMode: function() {
            this.google3DMode = (this.google3DMode === 'SATELLITE') ? 'HYBRID' : 'SATELLITE';
            if (this.map3dElement) {
                this.map3dElement.setAttribute('mode', this.google3DMode);
            }
            const btn = document.getElementById('sat3dModeBtn');
            if (btn) {
                btn.innerText = this.google3DMode === 'SATELLITE' ? '🛰️ Saf Uydu' : '🗺️ Hibrit';
            }
        },

        cycleGoogle3DTilt: function() {
            if (!this.map3dElement) return;
            let currentTilt = parseFloat(this.map3dElement.getAttribute('tilt')) || 45;
            let newTilt = 45;
            if (currentTilt < 25) newTilt = 45;
            else if (currentTilt < 55) newTilt = 65;
            else newTilt = 0;
            
            this.google3DTilt = newTilt;
            this.map3dElement.setAttribute('tilt', newTilt.toString());
            const btn = document.getElementById('sat3dTiltBtn');
            if (btn) {
                btn.innerText = `📐 ${newTilt}° Eğim`;
            }
        },

        rotateGoogle3D: function(deg) {
            if (!this.map3dElement) return;
            const currentHeading = parseFloat(this.map3dElement.getAttribute('heading')) || 0;
            const newHeading = (currentHeading + deg + 360) % 360;
            this.map3dElement.setAttribute('heading', newHeading.toString());
        },

        tiltGoogle3D: function(step) {
            if (!this.map3dElement) return;
            let currentTilt = parseFloat(this.map3dElement.getAttribute('tilt')) || 45;
            let newTilt = currentTilt + step;
            if (newTilt > 80) newTilt = 0;
            if (newTilt < 0) newTilt = 0;
            this.google3DTilt = newTilt;
            this.map3dElement.setAttribute('tilt', newTilt.toString());
            const btn = document.getElementById('sat3dTiltBtn');
            if (btn) {
                btn.innerText = `📐 ${newTilt}° Eğim`;
            }
        },

        resetGoogle3DCamera: function() {
            if (!this.map3dElement) return;
            this.google3DRange = 1400;
            this.google3DTilt = 45;
            this.map3dElement.setAttribute('center', `${this.currentLat},${this.currentLng},0`);
            this.map3dElement.setAttribute('range', '1400');
            this.map3dElement.setAttribute('tilt', '45');
            this.map3dElement.setAttribute('heading', '0');
            const tiltBtn = document.getElementById('sat3dTiltBtn');
            if (tiltBtn) tiltBtn.innerText = '📐 45° Eğim';
        },

        exitGoogle3DMode: function() {
            this.is3DActive = false;
            this.map3dElement = null;
            const container = document.getElementById('sat3dContainer');
            const reticle = document.getElementById('satReticleOverlay');
            if (container) {
                container.style.display = 'none';
                container.innerHTML = '';
            }
            if (reticle) reticle.style.display = (this.markerEnabled ? 'flex' : 'none');
            this.setLayer('google_sat');
        },

        /**
         * Google Maps API'nin sayfa tepesine eklediği 'alfa kanalı' geliştirici uyarısını anında gizler ve siler
         */
        suppressGoogleDevBanners: function() {
            const removeDevBanner = (node) => {
                if (!node || node.nodeType !== 1) return;
                if (node.tagName === 'DIV' && node.parentElement === document.body && node.id !== 'satelliteMapModal') {
                    const txt = (node.textContent || '').toLowerCase();
                    if (txt.includes('alfa kanal') || txt.includes('alpha channel') || txt.includes('yalnızca geliştirme') || txt.includes('development purposes only')) {
                        node.style.setProperty('display', 'none', 'important');
                        node.style.setProperty('visibility', 'hidden', 'important');
                        node.style.setProperty('height', '0', 'important');
                        node.style.setProperty('pointer-events', 'none', 'important');
                        try { node.remove(); } catch(e) {}
                    }
                }
            };

            try {
                document.querySelectorAll('body > div').forEach(removeDevBanner);
                if (!this._bannerObserver && typeof MutationObserver !== 'undefined') {
                    this._bannerObserver = new MutationObserver(mutations => {
                        mutations.forEach(m => {
                            m.addedNodes.forEach(removeDevBanner);
                        });
                    });
                    this._bannerObserver.observe(document.body, { childList: true });
                }
            } catch(e) {
                console.warn("Dev banner suppressor:", e);
            }
        },

        /**
         * Google Earth Web 3D'de Açar (Özel Boyutlu Pop-up)
         */
        openInGoogleEarth: function() {
            const lat = this.currentLat.toFixed(6);
            const lng = this.currentLng.toFixed(6);
            const altitude = 120;
            const range = Math.max(150, Math.round(40000 / Math.pow(2, Math.min(this.currentZoom, 19) - 12)));
            const url = `https://earth.google.com/web/@${lat},${lng},${altitude}a,${range}d,35y,0t,0r`;
            const w = Math.min(1200, window.screen.availWidth - 80);
            const h = Math.min(800, window.screen.availHeight - 80);
            const left = Math.round((window.screen.availWidth - w) / 2);
            const top = Math.round((window.screen.availHeight - h) / 2);
            window.open(url, 'GoogleEarth3D', `width=${w},height=${h},top=${top},left=${left},scrollbars=yes,resizable=yes`);
        },

        /**
         * TKGM Parsel Sorgu'da Açar (Özel Boyutlu Pop-up)
         */
        openInTKGM: function() {
            const w = Math.min(1100, window.screen.availWidth - 80);
            const h = Math.min(800, window.screen.availHeight - 80);
            const left = Math.round((window.screen.availWidth - w) / 2);
            const top = Math.round((window.screen.availHeight - h) / 2);
            window.open('https://parselsorgu.tkgm.gov.tr/', 'TKGMParselSorgu', `width=${w},height=${h},top=${top},left=${left},scrollbars=yes,resizable=yes`);
        },

        /**
         * Google Haritalar'da Açar
         */
        openInGoogleMaps: function() {
            const lat = this.currentLat.toFixed(6);
            const lng = this.currentLng.toFixed(6);
            const zoom = this.currentZoom;
            const url = `https://www.google.com/maps/@${lat},${lng},${zoom}z/data=!3m1!1e3`;
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    // Global Fonksiyonlar
    window.setSatelliteExportFormat = function(fmt) {
        SatelliteMapModule.setExportFormat(fmt);
    };

    window.toggleSatelliteLabels = function() {
        SatelliteMapModule.toggleSatelliteLabels();
    };

    window.initGoogle3DEarthMode = function() {
        SatelliteMapModule.initGoogle3DEarthMode();
    };

    window.rotateGoogle3D = function(deg) {
        SatelliteMapModule.rotateGoogle3D(deg);
    };

    window.zoomGoogle3D = function(factor) {
        SatelliteMapModule.zoomGoogle3D(factor);
    };

    window.toggleGoogle3DMode = function() {
        SatelliteMapModule.toggleSatelliteLabels();
    };

    window.cycleGoogle3DTilt = function() {
        SatelliteMapModule.cycleGoogle3DTilt();
    };

    window.tiltGoogle3D = function(step) {
        SatelliteMapModule.tiltGoogle3D(step);
    };

    window.resetGoogle3DCamera = function() {
        SatelliteMapModule.resetGoogle3DCamera();
    };

    window.exitGoogle3DMode = function() {
        SatelliteMapModule.exitGoogle3DMode();
    };

    window.openSatelliteMapModal = function() {
        SatelliteMapModule.openModal();
    };

    window.closeSatelliteMapModal = function() {
        SatelliteMapModule.closeModal();
    };

    window.searchSatelliteLocation = function() {
        SatelliteMapModule.searchLocation();
    };

    window.locateCurrentPosition = function() {
        SatelliteMapModule.locateCurrentPosition();
    };

    window.setSatelliteLayer = function(type) {
        SatelliteMapModule.setLayer(type);
    };

    window.toggleSatelliteMarker = function(enabled) {
        SatelliteMapModule.toggleMarker(enabled);
    };

    window.setSatelliteMarkerStyle = function(style) {
        SatelliteMapModule.setMarkerStyle(style);
    };

    window.setSatelliteMarkerText = function(text) {
        SatelliteMapModule.setMarkerText(text);
    };

    window.setSatelliteResolution = function(res) {
        SatelliteMapModule.setResolution(res);
    };

    window.captureSatelliteToCanvas = function() {
        SatelliteMapModule.captureAndApply();
    };

    window.openCurrentInGoogleEarth = function() {
        SatelliteMapModule.openInGoogleEarth();
    };

    window.openCurrentInTKGM = function() {
        SatelliteMapModule.openInTKGM();
    };

    window.openCurrentInGoogleMaps = function() {
        SatelliteMapModule.openInGoogleMaps();
    };

    window.SatelliteMapModule = SatelliteMapModule;

    // DOM hazır olduğunda modal yapısını kur
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => SatelliteMapModule.ensureModalDOM());
    } else {
        SatelliteMapModule.ensureModalDOM();
    }

})(window);
