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
        selectedResolution: '4k', // '1080p' | '2k' | '4k'
        google3DKey: 'AIzaSyB29TnBvpT2vmEiY9US_Op0S5mdJejOb_g',
        is3DActive: false,
        map3dElement: null,
        showMapLabels: true,    // Yer ve yol isimlerini göster/gizle
        google3DMode: 'HYBRID', // 'HYBRID' (Uydu+Yol) | 'SATELLITE' (Saf Uydu)
        google3DRange: 1400,    // 1400m helikopter/hava kuşu bakış mesafesi (sokak görünümünden uzak)
        google3DTilt: 45,       // 45 derece derinlikli 3D açısı
        markerEnabled: false,   // Varsayılan olarak kapalı: Kullanıcı açtığında pin görünür
        markerStyle: 'pin_modern', // 'pushpin_red' | 'pushpin_gold' | 'pin_modern' | 'pin_gold_luxury' | 'pin_real_estate' | 'pin_neon_cyan' | 'pin_target' | 'pin_radar' | 'pin_flag' | 'pin_vip_star'
        customMarkerText: 'PORTFÖYÜMÜZ',
        markerLatLng: null,
        aiEnhanceEnabled: true, // Varsayılan açık: Picsart tarzı AI uydu netleştirme & süper çözünürlük
        aiEnhanceIntensity: 20, // Varsayılan düşük: %20 (Kullanıcı slider ile ayarlayabilir)
        currentLat: 40.6931,
        currentLng: 30.2734,
        currentZoom: 17,
        isInitialized: false,

        // 📐 TKGM KML / GeoJSON Arsa Parsel Yönetimi
        parcelPolygon: null,       // L.polygon katman nesnesi
        parcelData: null,          // { latLngs, name, desc, ada, parsel, il, ilce, mahalle, alan }
        parcelFillMode: 'white',   // 'white' | 'color' | 'nofill'
        parcelFillColor: '#ffffff',
        parcelFillOpacity: 0.40,   // %40 yarı saydam
        parcelStrokeColor: '#ffffff',
        parcelStrokeWidth: 3,      // 1.5, 3, 5
        parcelShowLabel: true,     // Parsel üzerindeki Ada/Parsel rozeti
        parcelLabelMarker: null,   // Leaflet marker / divIcon
        floatingParcelPos: null,   // { relX, relY } kullanıcının sürükleyip bıraktığı bağıl konum
        parcelBadgeScale: 1.0,     // Taşınabilir parsel rozeti boyut ölçeği (0.6x - 2.5x)
        parcelBadgeTheme: 'gold',  // 'gold' | 'cyan' | 'emerald' | 'dark' | 'sapphire' | 'ruby'
        parcelBadgeCustomColors: null, // Kullanıcı özel renk seçtiğinde { bg, titleColor, subColor, borderColor, borderWidth }
        parcelNeonEnabled: false,      // ⚡ Arsa sınırı için Saber Neon açık/kapalı
        parcelNeonColor: '#00CEC9',    // Neon dış parlama rengi (Canlı Turkuaz)
        parcelNeonPreset: 'fully-lit', // Saber hazır teması
        parcelNeonIntensity: 2.8,      // Parlama şiddeti (1.0 - 5.0)
        parcelNeonGlowSize: 32,        // Parlama genişliği (15px - 60px)
        isSettingsDrawerOpen: false, // Hamburger çekmece menüsü açık/kapalı

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

                    <!-- Arama, KML Yükle ve Hamburger Ayar Barı -->
                    <div class="sat-toolbar-unified">
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

                        <div class="sat-toolbar-right-actions">
                            <button type="button" id="satUploadKmlBtn" class="sat-btn-kml-action" onclick="document.getElementById('satKmlFileInput').click()" title="TKGM'den indirilen KML veya GeoJSON dosyasını haritaya yükleyin">
                                <i class="fas fa-draw-polygon"></i> <span>KML / Parsel Yükle</span>
                            </button>
                            <input type="file" id="satKmlFileInput" accept=".kml,.kmz,.geojson,.json" style="display:none;" onchange="window.handleSatelliteKmlUpload(event)">

                            <div id="satParcelLoadedBadge" class="sat-parcel-badge-pill" style="display:none;" title="Yüklü Arsa Parseli">
                                <i class="fas fa-check-circle" style="color:#10b981;"></i>
                                <span id="satParcelBadgeText">Ada: - / Parsel: -</span>
                                <button type="button" class="sat-badge-btn" onclick="window.zoomToCurrentParcel()" title="Arsayı Ortala"><i class="fas fa-crosshairs"></i></button>
                                <button type="button" class="sat-badge-btn" onclick="window.clearSatelliteParcel()" title="Parseli Kaldır"><i class="fas fa-trash-alt"></i></button>
                            </div>

                            <button type="button" id="satHamburgerBtn" class="sat-hamburger-btn" onclick="window.toggleSatelliteSettingsDrawer()" title="Hızlı Ayarlar Menüsü">
                                <i class="fas fa-bars"></i> <span>Ayarlar</span>
                            </button>
                        </div>
                    </div>

                    <!-- Harita Kontrol Barı (Katmanlar, Yol İsimleri, Format, Çözünürlük, Pin) -->
                    <div class="sat-controls-bar">
                        <div class="sat-ctrl-group">
                            <span class="sat-ctrl-label"><i class="fas fa-layer-group"></i> Katman:</span>
                            <div class="sat-layer-btns">
                                <button type="button" class="sat-layer-btn active" id="satBtnGoogleSat" data-layer="google_sat" onclick="window.setSatelliteLayer('google_sat')" title="Google Uydu"><i class="fab fa-google"></i> Google Uydu</button>
                                <button type="button" class="sat-layer-btn" id="satBtnGoogle3D" data-layer="google_3d" onclick="window.initGoogle3DEarthMode()" title="3D Küre (API)"><i class="fas fa-cube"></i> 3D Dünya</button>
                                <button type="button" class="sat-layer-btn" id="satBtnEsriSat" data-layer="esri_sat" onclick="window.setSatelliteLayer('esri_sat')" title="Esri HD Uydu"><i class="fas fa-globe"></i> Esri HD</button>
                            </div>
                            <button type="button" id="satToggleLabelsBtn" class="sat-btn-toggle-labels active" onclick="window.toggleSatelliteLabels()" title="Cadde / Sokak İsimlerini Aç / Kapat">
                                <i class="fas fa-tags"></i> <span>Yollar:</span> <b id="satLabelsStatusText">Açık</b>
                            </button>
                        </div>

                        <div class="sat-ctrl-group">
                            <span class="sat-ctrl-label"><i class="fas fa-crop-alt"></i> Format:</span>
                            <div class="sat-format-btns" id="satFormatBtns">
                                <button type="button" class="sat-fmt-btn active" data-fmt="16:9" onclick="window.setSatelliteExportFormat('16:9')" title="16:9 Yatay">16:9</button>
                                <button type="button" class="sat-fmt-btn" data-fmt="1:1" onclick="window.setSatelliteExportFormat('1:1')" title="1:1 Kare">1:1</button>
                                <button type="button" class="sat-fmt-btn" data-fmt="4:5" onclick="window.setSatelliteExportFormat('4:5')" title="4:5 Portre">4:5</button>
                                <button type="button" class="sat-fmt-btn" data-fmt="9:16" onclick="window.setSatelliteExportFormat('9:16')" title="9:16 Hikaye">9:16</button>
                            </div>
                        </div>

                        <div class="sat-ctrl-group">
                            <span class="sat-ctrl-label"><i class="fas fa-expand"></i> Kalite:</span>
                            <select id="satResolutionSelect" class="sat-res-select" onchange="window.setSatelliteResolution(this.value)" title="Görsel Çıktı Çözünürlüğü">
                                <option value="1080p">1080p HD</option>
                                <option value="2k">⚡ 2K QHD</option>
                                <option value="4k" selected>🌟 4K Ultra HD</option>
                            </select>
                        </div>

                        <div class="sat-ctrl-group">
                            <button type="button" id="satToggleMarkerBtn" class="sat-btn-toggle-pin" onclick="window.toggleSatelliteMarker()" title="Canlı Konum İğnesini (Pin) Göster/Gizle">
                                <i class="fas fa-map-marker-alt"></i> <span>Pin:</span> <b id="satMarkerStatusText">Kapalı</b>
                            </button>
                            <div id="satMarkerSettingsWrapper" class="sat-marker-settings" style="display:none;">
                                <select id="satMarkerStyleSelect" class="sat-style-select" onchange="window.setSatelliteMarkerStyle(this.value)" title="Pin Stili">
                                    <option value="pushpin_red">🔴 Kırmızı Toplu İğne</option>
                                    <option value="pushpin_gold">🟡 Altın Küre İğne</option>
                                    <option value="pin_modern" selected>📍 Modern Konum Pini</option>
                                    <option value="pin_gold_luxury">💎 Altın Lüks Pin</option>
                                    <option value="pin_real_estate">🏠 Emlak & Villa Pini</option>
                                    <option value="pin_neon_cyan">⚡ Neon Cyan Pin</option>
                                    <option value="pin_target">🎯 Taktik Nişangah</option>
                                    <option value="pin_radar">📡 Canlı Radar</option>
                                    <option value="pin_flag">🚩 Sınır Bayrağı</option>
                                    <option value="pin_vip_star">⭐ VIP Yıldız Rozet</option>
                                </select>
                            </div>
                        </div>

                        <div class="sat-ctrl-group">
                            <button type="button" id="satToggleNeonBtn" class="sat-btn-toggle-neon" onclick="window.toggleSatelliteParcelNeon()" title="Arsa Parseli İçin ⚡ Saber Neon Efektini Aç / Kapat">
                                <i class="fas fa-bolt"></i> <span>Neon:</span> <b id="satNeonStatusText">Kapalı</b>
                            </button>
                        </div>
                    </div>

                    <!-- Harita Sahnesi (Görsel Tam Tuval Boyutlarında ve Birebir Orantılı) -->
                    <div class="sat-map-stage" id="satMapStage">
                        <div class="sat-map-wrapper" id="satMapWrapper">
                            <div id="satelliteLeafletMap"></div>
                            <div id="sat3dContainer" style="display:none; width:100%; height:100%; position:absolute; top:0; left:0; z-index:2; background:#000;"></div>
                            
                            <!-- Canlı İnteraktif Konum Pini Overlay (Sürüklenebilir veya Haritaya Tıklanabilir) -->
                            <div class="sat-map-pin-overlay" id="satMapPinOverlay" style="display:flex;" title="Canlı Konum Pini: Haritada istediğiniz parsele veya binaya sürükleyebilir veya haritaya tıklayarak taşıyabilirsiniz"></div>


                            <!-- Yüklü Parsel Bilgi Rozeti (Harita Üzeri Sol Üst) -->
                            <div class="sat-map-floating-parcel-info" id="satFloatingParcelInfo" style="display:none;"></div>

                            <!-- Harita Üzerine Sürükle-Bırak Overlay -->
                            <div class="sat-drag-drop-overlay" id="satDragDropOverlay" style="display:none;">
                                <div class="sat-drag-drop-box">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <h4>TKGM KML / GeoJSON Dosyasını Bırakın</h4>
                                    <p>Arsa sınırları harita üzerinde anında beyaz dolguyla çizilecek</p>
                                </div>
                            </div>

                            <!-- ☰ AÇILIR AYARLAR ÇEKMECESİ (FLYOUT SETTINGS DRAWER) -->
                            <div class="sat-drawer-panel" id="satSettingsDrawer">
                                <div class="sat-drawer-header">
                                    <div class="sat-drawer-title">
                                        <i class="fas fa-sliders-h"></i> <span>Hızlı Konumlar & Parsel</span>
                                    </div>
                                    <button type="button" class="sat-drawer-close" onclick="window.toggleSatelliteSettingsDrawer(false)" title="Kapat">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>

                                <div class="sat-drawer-content">
                                    <!-- 1. BÖLÜM: ⚡ HIZLI KONUMLAR -->
                                    <div class="sat-drawer-section">
                                        <div class="sat-section-title">
                                            <i class="fas fa-bolt" style="color:#f59e0b;"></i> <span>Hızlı Konumlar</span>
                                        </div>
                                        <div class="sat-drawer-quick-grid" id="satQuickChipsContainer"></div>
                                    </div>

                                    <!-- 2. BÖLÜM: 📐 TKGM ARSA & PARSEL AYARLARI -->
                                    <div class="sat-drawer-section">
                                        <div class="sat-section-title">
                                            <i class="fas fa-draw-polygon" style="color:#38bdf8;"></i> <span>TKGM Arsa & Parsel</span>
                                        </div>
                                        <div class="sat-parcel-upload-box">
                                            <button type="button" class="sat-btn-upload-big" onclick="document.getElementById('satKmlFileInput').click()">
                                                <i class="fas fa-file-arrow-up"></i>
                                                <span>KML / GeoJSON Dosyası Seç</span>
                                            </button>
                                            <span class="sat-upload-hint">veya dosyayı harita üzerine sürükleyin</span>
                                        </div>

                                        <!-- Yüklü Parsel Özeti & Metni Süz Butonu -->
                                        <div id="satDrawerParcelInfo" class="sat-drawer-parcel-card" style="display:none;">
                                            <div class="sat-drawer-parcel-row">
                                                <span>İl / İlçe:</span> <b id="satDrawerParcelCity">-</b>
                                            </div>
                                            <div class="sat-drawer-parcel-row">
                                                <span>Mahalle:</span> <b id="satDrawerParcelNeighborhood">-</b>
                                            </div>
                                            <div class="sat-drawer-parcel-row">
                                                <span>Ada / Parsel:</span> <b id="satDrawerParcelAdaParsel" style="color:#0284c7;">-</b>
                                            </div>
                                            <div class="sat-drawer-parcel-row">
                                                <span>Yüzölçümü:</span> <b id="satDrawerParcelArea">-</b>
                                            </div>

                                            <!-- 🤖 Metni Süz'e Aktar & Rozetleri Aç Butonu -->
                                            <button type="button" class="sat-btn-sync-parser" onclick="window.syncCurrentParcelToSmartParser()" title="Parsel bilgilerini ilan metnine aktar, otomatik süz ve önerilen rozetleri aç">
                                                <i class="fas fa-wand-magic-sparkles"></i> <span>🤖 Metni Süz'e Aktar & Rozetleri Aç</span>
                                            </button>

                                            <button type="button" class="sat-btn-remove-parcel" onclick="window.clearSatelliteParcel()">
                                                <i class="fas fa-trash-alt"></i> Parseli Temizle
                                            </button>
                                        </div>

                                        <!-- Dolgu Seçenekleri -->
                                        <div class="sat-drawer-group">
                                            <label class="sat-drawer-label">Arsa Dolgu Stili:</label>
                                            <div class="sat-fill-mode-btns" id="satFillModeBtns">
                                                <button type="button" class="sat-fill-btn active" data-mode="white" onclick="window.setParcelFillMode('white')">
                                                    <i class="fas fa-circle" style="color:#ffffff;"></i> Beyaz Dolgu
                                                </button>
                                                <button type="button" class="sat-fill-btn" data-mode="color" onclick="window.setParcelFillMode('color')">
                                                    <i class="fas fa-palette" style="color:#f59e0b;"></i> Renkli
                                                </button>
                                                <button type="button" class="sat-fill-btn" data-mode="nofill" onclick="window.setParcelFillMode('nofill')">
                                                    <i class="fas fa-ban" style="color:#ef4444;"></i> Dolgusuz
                                                </button>
                                            </div>
                                        </div>

                                        <!-- Renkli Dolgu Seçiliyse Renk Paleti -->
                                        <div class="sat-drawer-group" id="satParcelColorGroup" style="display:none;">
                                            <label class="sat-drawer-label">Dolgu Rengi:</label>
                                            <div class="sat-color-palette" id="satParcelColorPalette">
                                                <button type="button" class="sat-color-dot" style="background:#ffffff;" onclick="window.setParcelColor('#ffffff')" title="Beyaz"></button>
                                                <button type="button" class="sat-color-dot" style="background:#ef4444;" onclick="window.setParcelColor('#ef4444')" title="Kırmızı"></button>
                                                <button type="button" class="sat-color-dot" style="background:#f59e0b;" onclick="window.setParcelColor('#f59e0b')" title="Sarı / Altın"></button>
                                                <button type="button" class="sat-color-dot" style="background:#0ea5e9;" onclick="window.setParcelColor('#0ea5e9')" title="Mavi"></button>
                                                <button type="button" class="sat-color-dot" style="background:#10b981;" onclick="window.setParcelColor('#10b981')" title="Yeşil"></button>
                                                <input type="color" id="satParcelColorCustom" value="#ffffff" oninput="window.setParcelColor(this.value)" class="sat-custom-color-input" title="Özel Renk">
                                            </div>
                                        </div>

                                        <!-- Dolgu Saydamlığı (Dolgusuz değilse) -->
                                        <div class="sat-drawer-group" id="satParcelOpacityGroup">
                                            <div class="sat-drawer-label-row">
                                                <label>Dolgu Saydamlığı (Opaklık):</label>
                                                <span id="satParcelOpacityVal" class="sat-badge-sm">%40</span>
                                            </div>
                                            <input type="range" id="satParcelOpacitySlider" min="5" max="95" value="40" step="5" oninput="window.setParcelOpacity(this.value)" class="sat-range-input">
                                        </div>

                                        <!-- Sınır Çizgisi Rengi ve Kalınlığı -->
                                        <div class="sat-drawer-group">
                                            <div class="sat-drawer-label-row" style="margin-bottom:6px;">
                                                <label>Kenar Çizgisi Rengi:</label>
                                                <div class="sat-stroke-color-picks">
                                                    <button type="button" class="sat-color-dot-sm" style="background:#ffffff;" onclick="window.setParcelStrokeColor('#ffffff')" title="Beyaz Çizgi"></button>
                                                    <button type="button" class="sat-color-dot-sm" style="background:#ef4444;" onclick="window.setParcelStrokeColor('#ef4444')" title="Kırmızı Çizgi"></button>
                                                    <button type="button" class="sat-color-dot-sm" style="background:#f59e0b;" onclick="window.setParcelStrokeColor('#f59e0b')" title="Sarı Çizgi"></button>
                                                    <button type="button" class="sat-color-dot-sm" style="background:#0284c7;" onclick="window.setParcelStrokeColor('#0284c7')" title="Mavi Çizgi"></button>
                                                    <input type="color" id="satParcelStrokeCustom" value="#ffffff" oninput="window.setParcelStrokeColor(this.value)" class="sat-custom-color-input-sm" title="Özel Çizgi Rengi">
                                                </div>
                                            </div>
                                            <div class="sat-drawer-label-row">
                                                <label>Kenar Çizgi Kalınlığı:</label>
                                                <span id="satParcelStrokeWidthVal" class="sat-badge-sm">3px</span>
                                            </div>
                                            <input type="range" id="satParcelStrokeWidthSlider" min="1" max="10" step="0.5" value="3" oninput="window.setParcelStrokeWidth(this.value)" class="sat-range-input">
                                        </div>

                                        <!-- ⚡ Saber Neon Çizim Efekti -->
                                        <div class="sat-drawer-group sat-drawer-neon-card" id="satDrawerNeonCard">
                                            <div class="sat-drawer-label-row">
                                                <label><i class="fas fa-bolt" style="color:#00CEC9;"></i> <b>⚡ Saber Neon Efekti:</b></label>
                                                <button type="button" id="satDrawerNeonToggleBtn" class="sat-pill-toggle-btn" onclick="window.toggleSatelliteParcelNeon()" title="Neon Efektini Aç/Kapat">
                                                    <span id="satDrawerNeonToggleText">Kapalı</span>
                                                </button>
                                            </div>
                                            <div id="satDrawerNeonDetails" style="display:none; margin-top:8px;">
                                                <div class="sat-drawer-label-row" style="margin-bottom:6px;">
                                                    <label>Neon Rengi:</label>
                                                    <div class="sat-neon-color-picks">
                                                        <button type="button" class="sat-color-dot-sm active" style="background:#00CEC9;" onclick="window.setSatelliteParcelNeonColor('#00CEC9')" title="Turkuaz"></button>
                                                        <button type="button" class="sat-color-dot-sm" style="background:#FFB800;" onclick="window.setSatelliteParcelNeonColor('#FFB800')" title="Altın"></button>
                                                        <button type="button" class="sat-color-dot-sm" style="background:#0088FF;" onclick="window.setSatelliteParcelNeonColor('#0088FF')" title="Mavi"></button>
                                                        <button type="button" class="sat-color-dot-sm" style="background:#00FF44;" onclick="window.setSatelliteParcelNeonColor('#00FF44')" title="Yeşil"></button>
                                                        <button type="button" class="sat-color-dot-sm" style="background:#FF0044;" onclick="window.setSatelliteParcelNeonColor('#FF0044')" title="Kırmızı"></button>
                                                        <button type="button" class="sat-color-dot-sm" style="background:#AA00FF;" onclick="window.setSatelliteParcelNeonColor('#AA00FF')" title="Mor"></button>
                                                        <button type="button" class="sat-color-dot-sm" style="background:#FFFFFF;" onclick="window.setSatelliteParcelNeonColor('#FFFFFF')" title="Beyaz"></button>
                                                        <input type="color" id="satDrawerNeonColorCustom" value="#00CEC9" oninput="window.setSatelliteParcelNeonColor(this.value)" class="sat-custom-color-input-sm" title="Özel Renk">
                                                    </div>
                                                </div>
                                                <div class="sat-drawer-label-row">
                                                    <label>Neon Parlama Boyutu (Glow):</label>
                                                    <span id="satNeonGlowVal" class="sat-badge-sm">32px</span>
                                                </div>
                                                <input type="range" id="satNeonGlowSlider" min="15" max="60" value="32" step="1" oninput="window.setSatelliteParcelNeonGlow(this.value)" class="sat-range-input">
                                                
                                                <div class="sat-drawer-label-row" style="margin-top:6px;">
                                                    <label>Parlama Şiddeti (Intensity):</label>
                                                    <span id="satNeonIntensityVal" class="sat-badge-sm">2.8x</span>
                                                </div>
                                                <input type="range" id="satNeonIntensitySlider" min="1.0" max="5.0" value="2.8" step="0.2" oninput="window.setSatelliteParcelNeonIntensity(this.value)" class="sat-range-input">
                                            </div>
                                        </div>

                                        <!-- Ada/Parsel Bilgi Etiketi Göster/Gizle, Boyut ve Tema -->
                                        <div class="sat-drawer-group">
                                            <label class="sat-checkbox-label">
                                                <input type="checkbox" id="satParcelShowLabelCheck" checked onchange="window.toggleParcelLabel(this.checked)">
                                                <span>Taşınabilir Ada/Parsel Rozetini Göster</span>
                                            </label>
                                            
                                            <!-- Rozet Boyut Ayarı -->
                                            <div id="satDrawerBadgeControls" style="margin-top:10px;">
                                                <div class="sat-drawer-label-row">
                                                    <label>Rozet Boyutu:</label>
                                                    <span id="satParcelBadgeScaleVal" class="sat-badge-sm">1.0x</span>
                                                </div>
                                                <input type="range" id="satParcelBadgeScaleSlider" min="0.7" max="1.8" step="0.1" value="1.0" oninput="window.setFloatingParcelScale(this.value)" class="sat-range-input" title="Rozet Boyutunu Ayarla">
                                                
                                                <!-- Rozet Renk Teması -->
                                                <div class="sat-drawer-label-row" style="margin-top:8px;">
                                                    <label>Rozet Teması / Rengi:</label>
                                                </div>
                                                <div class="sat-badge-theme-btns" id="satBadgeThemeBtns">
                                                    <button type="button" class="sat-theme-chip active" data-theme="cyan" onclick="window.setFloatingParcelTheme('cyan')" title="Mavi Neon">🔵 Mavi</button>
                                                    <button type="button" class="sat-theme-chip" data-theme="gold" onclick="window.setFloatingParcelTheme('gold')" title="Altın Lüks">🟡 Altın</button>
                                                    <button type="button" class="sat-theme-chip" data-theme="emerald" onclick="window.setFloatingParcelTheme('emerald')" title="Zümrüt Yeşili">🟢 Yeşil</button>
                                                    <button type="button" class="sat-theme-chip" data-theme="dark" onclick="window.setFloatingParcelTheme('dark')" title="Koyu Cam">⚪ Koyu</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Alt Bilgilendirme ve Eylem Barı (Tüm Bilgiler Harita Dışında) -->
                    <div class="sat-modal-footer">
                        <div class="sat-footer-left">
                            <div class="sat-footer-coords" id="satCoordsBadge" title="Harita Koordinatları ve Zoom">
                                <i class="fas fa-crosshairs" style="color:#38bdf8; font-size:11px;"></i>
                                <span><b id="satCoordLat">40.6931</b>, <b id="satCoordLng">30.2734</b> (<b id="satCoordZoom">17x</b>)</span>
                            </div>
                            <div class="sat-footer-address" id="satFoundAddressBadge" style="display:none;" title="Haritadaki Konum">
                                <i class="fas fa-map-marker-alt"></i>
                                <span id="satFoundAddressText"></span>
                            </div>
                            <div class="sat-footer-ext">
                                <button type="button" class="sat-ext-pill earth" onclick="window.openCurrentInGoogleEarth()" title="Google Earth Web'de Aç">
                                    <i class="fab fa-google"></i> Earth 3D
                                </button>
                                <button type="button" class="sat-ext-pill tkgm" onclick="window.openCurrentInTKGM()" title="TKGM Parsel Sorgu Sayfası">
                                    <i class="fas fa-draw-polygon"></i> TKGM
                                </button>
                                <button type="button" class="sat-ext-pill capture" onclick="window.captureScreenOrTabToTemplate()" title="Açılan Sekmeyi Şablon Boyutunda Canlı Yakala">
                                    <i class="fas fa-camera"></i> Sekme Yakala
                                </button>
                                <button type="button" id="satFooterAiBtn" class="sat-ext-pill ai-preview active" onclick="window.toggleSatelliteAiEnhance()" title="AI HD Uydu Netleştirmeyi Aç / Kapat">
                                    <i class="fas fa-wand-magic-sparkles"></i> <span id="satFooterAiLabel">AI Net: Açık</span>
                                </button>
                                <div id="satAiSliderWrapper" class="sat-footer-ai-slider" style="display:inline-flex; align-items:center; gap:4px;">
                                    <input type="range" id="satAiIntensitySlider" min="5" max="100" value="20" step="5" oninput="window.setSatelliteAiIntensity(this.value)" class="sat-ai-range" title="Netlik Miktarı (Varsayılan: %20)">
                                    <span id="satAiIntensityVal" class="sat-ai-val-badge">%20</span>
                                </div>
                            </div>
                        </div>
                        <div class="sat-footer-actions">
                            <button type="button" class="sat-btn-cancel" onclick="window.closeSatelliteMapModal()">
                                İptal
                            </button>
                            <button type="button" id="satCaptureBtn" class="sat-btn-capture" onclick="window.captureSatelliteToCanvas()">
                                <i class="fas fa-camera-retro"></i>
                                <span>📸 Şablona Aktar</span>
                            </button>
                        </div>
                    </div>

                    <!-- SVG AI Netleştirme Filtresi (GPU Donanım Hızlandırmalı Gerçek Zamanlı Keskinleştirme) -->
                    <svg id="satAiSvgFilters" style="position:absolute; width:0; height:0; pointer-events:none; opacity:0;" aria-hidden="true">
                        <filter id="satAiSharpenFilter" color-interpolation-filters="sRGB">
                            <feConvolveMatrix id="satAiMatrix" order="3" preserveAlpha="true" kernelMatrix="0 -0.4 0 -0.4 2.6 -0.4 0 -0.4 0"/>
                        </filter>
                    </svg>
                </div>
            </div>`;

            const div = document.createElement('div');
            div.innerHTML = modalHtml;
            document.body.appendChild(div.firstElementChild);

            this.suppressGoogleDevBanners();

            // Hızlı butonları bas (Hamburger çekmecesi içine)
            const chipsCont = document.getElementById('satQuickChipsContainer');
            if (chipsCont) {
                chipsCont.innerHTML = '';
                this.QUICK_LOCATIONS.forEach(loc => {
                    const chip = document.createElement('button');
                    chip.type = 'button';
                    chip.className = 'sat-drawer-quick-btn';
                    chip.innerHTML = `<i class="fas fa-location-dot" style="color:#0ea5e9;"></i> <span>${loc.label}</span>`;
                    chip.onclick = () => {
                        SatelliteMapModule.flyTo(loc.lat, loc.lng, loc.zoom);
                        const labelParts = loc.label.split('/');
                        const shortName = (labelParts[labelParts.length - 1] || loc.label).trim();
                        SatelliteMapModule.setMarkerText(shortName.toLocaleUpperCase('tr-TR'));
                        const textInp = document.getElementById('satMarkerCustomTextInput');
                        if (textInp) textInp.value = SatelliteMapModule.customMarkerText;
                        SatelliteMapModule.updateFoundAddressBadge(loc.label);
                        SatelliteMapModule.saveLastLocation({
                            address: loc.label,
                            lat: loc.lat,
                            lng: loc.lng,
                            zoom: loc.zoom,
                            markerLat: loc.lat,
                            markerLng: loc.lng,
                            markerText: SatelliteMapModule.customMarkerText
                        });
                        SatelliteMapModule.toggleSettingsDrawer(false);
                    };
                    chipsCont.appendChild(chip);
                });
            }

            this.initDragDropListeners();
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

            if (!this.markerLatLng) {
                this.markerLatLng = L.latLng(this.currentLat, this.currentLng);
            }

            // Haritaya tıklandığında pin açıksa o noktaya taşı (kapalıyken pin asla çıkmaz)
            this.map.on('click', (e) => {
                if (!this.markerEnabled) return;
                this.setMarkerLatLng(e.latlng);
                this.saveLastLocation({
                    markerLat: e.latlng.lat,
                    markerLng: e.latlng.lng
                });
            });

            // Harita hareket ettikçe koordinatları ve pin pozisyonunu güncelle
            this.map.on('move', () => {
                const c = this.map.getCenter();
                const z = this.map.getZoom();
                this.currentLat = c.lat;
                this.currentLng = c.lng;
                this.currentZoom = z;
                this.updateCoordsBadge();
                this.updateMarkerOverlayPosition();
            });

            this.map.on('moveend', () => {
                const c = this.map.getCenter();
                const z = this.map.getZoom();
                this.currentLat = c.lat;
                this.currentLng = c.lng;
                this.currentZoom = z;
                this.updateCoordsBadge();
                this.updateMarkerOverlayPosition();
            });

            this.map.on('zoomend', () => {
                this.updateMarkerOverlayPosition();
            });

            this.map.on('viewreset', () => {
                this.updateMarkerOverlayPosition();
            });

            // Harita boyutu güncellendiğinde pini yeniden konumlandır
            this.map.on('resize', () => {
                this.updateMarkerOverlayPosition();
            });

            window.addEventListener('resize', () => {
                this.updateMapWrapperDimensions();
            });

            this.attachMarkerDragListeners();

            // Harita hazır olduğunda boyutunu tuvale göre tazele
            setTimeout(() => {
                this.updateMapWrapperDimensions();
                this.updateMarkerOverlayPosition();
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
            if (latEl) latEl.innerText = this.currentLat.toFixed(4);
            if (lngEl) lngEl.innerText = this.currentLng.toFixed(4);
            if (zoomEl) zoomEl.innerText = this.currentZoom + 'x';
        },

        /**
         * Pinin Coğrafi Koordinatını Belirler ve Canlı Overlay'i Oraya Konumlandırır
         */
        setMarkerLatLng: function(latlng) {
            if (!latlng) return;
            this.markerLatLng = L.latLng(latlng.lat, latlng.lng);
            if (!this.markerEnabled) {
                const overlay = document.getElementById('satMapPinOverlay');
                if (overlay) overlay.style.display = 'none';
                return;
            }
            this.updateMarkerOverlayPosition();
        },

        /**
         * Pini Harita Üzerinde Sürükleyip Bırakma (Drag & Drop) Dinleyicilerini Bağlar
         */
        attachMarkerDragListeners: function() {
            const overlay = document.getElementById('satMapPinOverlay');
            const wrapper = document.getElementById('satMapWrapper');
            if (!overlay || !wrapper || overlay._dragBound) return;
            overlay._dragBound = true;

            let isDragging = false;
            let startClientX = 0, startClientY = 0;
            let startPinLeft = 0, startPinTop = 0;

            const onPointerDown = (e) => {
                if (!this.markerEnabled) return;
                if (e.button !== 0 && e.pointerType === 'mouse') return;

                isDragging = true;
                overlay.classList.add('is-dragging');

                if (this.map && this.map.dragging) {
                    this.map.dragging.disable();
                }

                const wrapperRect = wrapper.getBoundingClientRect();
                startClientX = e.clientX;
                startClientY = e.clientY;

                const curLeft = parseFloat(overlay.style.left);
                const curTop = parseFloat(overlay.style.top);
                startPinLeft = !isNaN(curLeft) ? curLeft : (wrapperRect.width / 2);
                startPinTop = !isNaN(curTop) ? curTop : (wrapperRect.height / 2);

                try {
                    overlay.setPointerCapture(e.pointerId);
                } catch (err) {}

                e.stopPropagation();
                e.preventDefault();
            };

            const onPointerMove = (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startClientX;
                const dy = e.clientY - startClientY;

                let newLeft = startPinLeft + dx;
                let newTop = startPinTop + dy;

                const wrapperRect = wrapper.getBoundingClientRect();
                newLeft = Math.max(5, Math.min(wrapperRect.width - 5, newLeft));
                newTop = Math.max(5, Math.min(wrapperRect.height - 5, newTop));

                overlay.style.left = Math.round(newLeft) + 'px';
                overlay.style.top = Math.round(newTop) + 'px';

                if (this.map) {
                    this.markerLatLng = this.map.containerPointToLatLng([newLeft, newTop]);
                }

                e.stopPropagation();
                e.preventDefault();
            };

            const onPointerUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                overlay.classList.remove('is-dragging');

                try {
                    overlay.releasePointerCapture(e.pointerId);
                } catch (err) {}

                if (this.map && this.map.dragging) {
                    this.map.dragging.enable();
                }

                const finalLeft = parseFloat(overlay.style.left);
                const finalTop = parseFloat(overlay.style.top);
                if (this.map && !isNaN(finalLeft) && !isNaN(finalTop)) {
                    this.markerLatLng = this.map.containerPointToLatLng([finalLeft, finalTop]);
                    this.saveLastLocation({
                        markerLat: this.markerLatLng.lat,
                        markerLng: this.markerLatLng.lng
                    });
                }

                e.stopPropagation();
            };

            overlay.addEventListener('pointerdown', onPointerDown);
            overlay.addEventListener('pointermove', onPointerMove);
            overlay.addEventListener('pointerup', onPointerUp);
            overlay.addEventListener('pointercancel', onPointerUp);
        },

        /**
         * Canlı Pin Overlay'inin Ekrandaki Piksel Konumunu markerLatLng'ye Göre Günceller
         */
        updateMarkerOverlayPosition: function() {
            const overlay = document.getElementById('satMapPinOverlay');
            const wrapper = document.getElementById('satMapWrapper');
            if (!overlay || !wrapper) return;

            if (!this.markerEnabled) {
                overlay.style.display = 'none';
                return;
            }
            overlay.style.display = 'flex';

            if (this.is3DActive) {
                if (!overlay.style.left || overlay.style.left === '') {
                    overlay.style.left = '50%';
                    overlay.style.top = '50%';
                }
                return;
            }

            if (!this.map) {
                overlay.style.left = '50%';
                overlay.style.top = '50%';
                return;
            }

            if (!this.markerLatLng) {
                this.markerLatLng = this.map.getCenter();
            }

            const pt = this.map.latLngToContainerPoint(this.markerLatLng);
            overlay.style.left = Math.round(pt.x) + 'px';
            overlay.style.top = Math.round(pt.y) + 'px';
        },

        /**
         * En Son Kullanılan / Aranan Harita Konumunu Tarayıcı Hafızasına Kaydeder
         */
        saveLastLocation: function(data) {
            try {
                if (!data) return;
                const existing = this.getLastLocation() || {};
                const toSave = {
                    address: (data.address !== undefined) ? data.address : (existing.address || ''),
                    lat: (data.lat !== undefined) ? data.lat : (existing.lat || this.currentLat),
                    lng: (data.lng !== undefined) ? data.lng : (existing.lng || this.currentLng),
                    zoom: (data.zoom !== undefined) ? data.zoom : (existing.zoom || this.currentZoom),
                    markerLat: (data.markerLat !== undefined) ? data.markerLat : (this.markerLatLng ? this.markerLatLng.lat : this.currentLat),
                    markerLng: (data.markerLng !== undefined) ? data.markerLng : (this.markerLatLng ? this.markerLatLng.lng : this.currentLng),
                    markerText: (data.markerText !== undefined) ? data.markerText : (existing.markerText || this.customMarkerText || '')
                };
                localStorage.setItem('emlak_sat_last_location', JSON.stringify(toSave));
            } catch(e) {
                console.warn('Konum hafızaya kaydedilemedi:', e);
            }
        },

        /**
         * Tarayıcı Hafızasındaki En Son Konumu Getirir
         */
        getLastLocation: function() {
            try {
                const raw = localStorage.getItem('emlak_sat_last_location');
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
                    return parsed;
                }
            } catch(e) {}
            return null;
        },

        /**
         * Haritada Bulunan Adres Rozetini Günceller
         */
        updateFoundAddressBadge: function(text) {
            const badge = document.getElementById('satFoundAddressBadge');
            const textEl = document.getElementById('satFoundAddressText');
            if (!badge || !textEl) return;
            if (text && text.trim()) {
                textEl.innerText = text.trim();
                badge.style.display = 'flex';
                badge.title = 'Aktif Konum: ' + text.trim();
            } else {
                badge.style.display = 'none';
            }
        },

        /**
         * Belirtilen Koordinata Uçar veya Doğrudan Odaklar
         */
        flyTo: function(lat, lng, zoom, immediate) {
            if (!this.map) return;
            this.currentLat = lat;
            this.currentLng = lng;
            this.currentZoom = zoom || 17;
            this.markerLatLng = L.latLng(lat, lng);

            if (immediate) {
                this.map.setView([lat, lng], this.currentZoom);
                this.updateMarkerOverlayPosition();
            } else {
                this.map.flyTo([lat, lng], this.currentZoom, {
                    duration: 0.9,
                    easeLinearity: 0.25
                });
                this.updateMarkerOverlayPosition();
            }

            // Uçuş animasyonu bittiğinde pinin hedef koordinata kesin ve tam oturmasını sağla
            setTimeout(() => {
                if (this.map) {
                    this.updateMarkerOverlayPosition();
                    this.updateCoordsBadge();
                }
            }, 950);
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
                settingsWrapper.style.opacity = '1.0';
                settingsWrapper.style.pointerEvents = this.markerEnabled ? 'auto' : 'none';
                settingsWrapper.style.filter = 'none';
                const styleSel = document.getElementById('satMarkerStyleSelect');
                const textInput = document.getElementById('satMarkerCustomTextInput');
                if (styleSel) styleSel.disabled = !this.markerEnabled;
                if (textInput) textInput.disabled = !this.markerEnabled;
            }

            this.updateLivePinOverlay();
            this.updateMarkerOverlayPosition();
        },

        /**
         * ✨ AI HD Netleştirme Toggle (Alt Bar Üzerinde Inline ve Slider Kontrollü)
         */
        toggleAiEnhance: function(enabled) {
            if (typeof enabled === 'boolean') {
                this.aiEnhanceEnabled = enabled;
            } else {
                this.aiEnhanceEnabled = !this.aiEnhanceEnabled;
            }
            const sliderWrapper = document.getElementById('satAiSliderWrapper');
            const footerBtn = document.getElementById('satFooterAiBtn');
            const footerLbl = document.getElementById('satFooterAiLabel');

            if (footerBtn) footerBtn.classList.toggle('active', this.aiEnhanceEnabled);
            if (footerLbl) {
                footerLbl.textContent = this.aiEnhanceEnabled ? 'AI Net: Açık' : 'AI Net: Kapalı';
            }

            if (sliderWrapper) {
                sliderWrapper.style.opacity = this.aiEnhanceEnabled ? '1.0' : '0.35';
                sliderWrapper.style.pointerEvents = this.aiEnhanceEnabled ? 'auto' : 'none';
                sliderWrapper.style.filter = this.aiEnhanceEnabled ? 'none' : 'grayscale(0.8)';
                const slider = document.getElementById('satAiIntensitySlider');
                if (slider) slider.disabled = !this.aiEnhanceEnabled;
            }

            this.applyLiveMapAiPreview();

            if (typeof window.showAppToast === 'function') {
                window.showAppToast(
                    this.aiEnhanceEnabled 
                        ? `✨ AI HD Netleştirme aktif (%${this.aiEnhanceIntensity || 20})` 
                        : 'AI Netleştirme kapatıldı', 
                    'info'
                );
            }
        },

        /**
         * ✨ AI Netlik Miktarını Ayarlar & Haritada Anlık Önizler
         */
        setAiIntensity: function(val) {
            this.aiEnhanceIntensity = parseInt(val, 10) || 20;
            const valBadge = document.getElementById('satAiIntensityVal');
            if (valBadge) valBadge.textContent = `%${this.aiEnhanceIntensity}`;
            const footerLbl = document.getElementById('satFooterAiLabel');
            if (footerLbl && this.aiEnhanceEnabled) {
                footerLbl.textContent = 'AI Net: Açık';
            }
            this.applyLiveMapAiPreview();
        },

        /**
         * 👁️ Canlı Harita Görünümüne GPU Destekli Gerçek Zamanlı AI Netleştirme Uygular
         */
        applyLiveMapAiPreview: function() {
            const mapEl = document.getElementById('satelliteLeafletMap');
            const host3d = document.getElementById('sat3dContainer');
            if (!mapEl && !host3d) return;

            if (!this.aiEnhanceEnabled) {
                if (mapEl) mapEl.style.filter = 'none';
                if (host3d) host3d.style.filter = 'none';
                return;
            }

            // SVG donanım filtresinin DOM'da var olduğunu doğrula, yoksa dinamik oluştur
            if (!document.getElementById('satAiSvgFilters')) {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.id = 'satAiSvgFilters';
                svg.setAttribute('style', 'position:absolute; width:0; height:0; pointer-events:none; opacity:0;');
                svg.setAttribute('aria-hidden', 'true');
                svg.innerHTML = `
                    <filter id="satAiSharpenFilter" color-interpolation-filters="sRGB">
                        <feConvolveMatrix id="satAiMatrix" order="3" preserveAlpha="true" kernelMatrix="0 -0.4 0 -0.4 2.6 -0.4 0 -0.4 0"/>
                    </filter>
                `;
                document.body.appendChild(svg);
            }

            const intensity = (this.aiEnhanceIntensity || 20) / 100; // 0.05 ile 1.0 arası

            // 1. SVG Donanım Filtresinin Kernel Matrisini güncelle (Kenar & Çatı/Yol Çizgi Keskinliği)
            const matrixEl = document.getElementById('satAiMatrix');
            if (matrixEl) {
                const k = (0.15 + intensity * 0.95).toFixed(2); // 0.20 - 1.10
                const c = (1 + 4 * parseFloat(k)).toFixed(2);   // 1.80 - 5.40
                matrixEl.setAttribute('kernelMatrix', `0 -${k} 0 -${k} ${c} -${k} 0 -${k} 0`);
            }

            // 2. Doğal kontrast ve renk netliği artışı (Flu uydudan kristal netliğe)
            const contrast = 100 + Math.round(intensity * 32);  // %102 - %132
            const saturate = 100 + Math.round(intensity * 28);  // %101 - %128
            const brightness = 100 + Math.round(intensity * 3); // %100 - %103

            const filterStr = `url(#satAiSharpenFilter) contrast(${contrast}%) saturate(${saturate}%) brightness(${brightness}%)`;

            if (mapEl) mapEl.style.filter = filterStr;
            if (host3d) host3d.style.filter = `contrast(${contrast}%) saturate(${saturate}%) brightness(${brightness}%)`;
        },

        /**
         * ✨ Harita panelindeki AI butonuna tıklandığında ekstra modal AÇMAZ, inline toggle ve ayar yapar
         */
        previewWithAiEnhancer: function() {
            this.toggleAiEnhance();
        },

        /**
         * Marker Stilini Ayarlar
         */
        setMarkerStyle: function(style) {
            this.markerStyle = style || 'badge';
            try { localStorage.setItem('emlak_sat_marker_style', this.markerStyle); } catch(e) {}
            this.updateLivePinOverlay();
            this.updateMarkerOverlayPosition();
        },

        /**
         * Marker Üzerindeki Özel Metni Ayarlar
         */
        setMarkerText: function(text) {
            this.customMarkerText = (typeof text === 'string') ? text : '';
            this.userManuallyChangedMarkerText = true;
            this.updateLivePinOverlay();
            this.updateMarkerOverlayPosition();
            this.saveLastLocation({
                markerText: this.customMarkerText
            });
        },

        /**
         * Çözünürlüğü Ayarlar ('1080p' | '2k' | '4k')
         */
        setResolution: function(res) {
            this.selectedResolution = res || '4k';
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
            let style = this.markerStyle || 'pin_modern';
            // Eski stiller için uyumluluk
            if (style === 'badge') style = 'pin_modern';
            if (style === 'classic') style = 'pushpin_red';
            if (style === 'gold') style = 'pin_gold_luxury';
            if (style === 'radar') style = 'pin_radar';

            const text = (typeof this.customMarkerText === 'string' && this.customMarkerText.trim().length > 0)
                         ? this.customMarkerText.trim()
                         : 'PORTFÖYÜMÜZ';
            const escText = this.escapeHtml(text);

            if (style === 'pushpin_red') {
                overlay.className = 'sat-map-pin-overlay pin-mode';
                overlay.innerHTML = `
                    ${text ? `<div class="sat-live-pin-text" style="border-color:#ef4444; color:#ffffff;">${escText}</div>` : ''}
                    <div class="sat-live-pin-svg">
                        <svg width="42" height="54" viewBox="0 0 42 54" fill="none" style="overflow: visible;">
                            <ellipse cx="21" cy="53" rx="8" ry="2.5" fill="rgba(0,0,0,0.45)" filter="blur(1.5px)"/>
                            <polygon points="19.5,24 22.5,24 21,52" fill="#cbd5e1" stroke="#64748b" stroke-width="0.6"/>
                            <rect x="16" y="21" width="10" height="4" rx="2" fill="url(#satPinMetalCollar)" stroke="#475569" stroke-width="0.5"/>
                            <circle cx="21" cy="14" r="13" fill="url(#satSphereRedGrad)" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/>
                            <ellipse cx="17" cy="10" rx="6" ry="3.5" transform="rotate(-30 17 10)" fill="#ffffff" opacity="0.65"/>
                            <defs>
                                <radialGradient id="satSphereRedGrad" cx="35%" cy="30%" r="65%">
                                    <stop offset="0%" stop-color="#ff7875"/>
                                    <stop offset="40%" stop-color="#ef4444"/>
                                    <stop offset="85%" stop-color="#991b1b"/>
                                    <stop offset="100%" stop-color="#450a0a"/>
                                </radialGradient>
                                <linearGradient id="satPinMetalCollar" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stop-color="#64748b"/>
                                    <stop offset="50%" stop-color="#f1f5f9"/>
                                    <stop offset="100%" stop-color="#475569"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                `;
            } else if (style === 'pushpin_gold') {
                overlay.className = 'sat-map-pin-overlay pin-mode';
                overlay.innerHTML = `
                    ${text ? `<div class="sat-live-pin-text" style="border-color:#f59e0b; color:#fbbf24;">${escText}</div>` : ''}
                    <div class="sat-live-pin-svg">
                        <svg width="42" height="54" viewBox="0 0 42 54" fill="none" style="overflow: visible;">
                            <ellipse cx="21" cy="53" rx="8" ry="2.5" fill="rgba(0,0,0,0.45)" filter="blur(1.5px)"/>
                            <polygon points="19.5,24 22.5,24 21,52" fill="#fde047" stroke="#ca8a04" stroke-width="0.6"/>
                            <rect x="16" y="21" width="10" height="4" rx="2" fill="url(#satPinGoldCollar)" stroke="#a16207" stroke-width="0.5"/>
                            <circle cx="21" cy="14" r="13" fill="url(#satSphereGoldGrad)" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
                            <ellipse cx="17" cy="10" rx="6" ry="3.5" transform="rotate(-30 17 10)" fill="#ffffff" opacity="0.65"/>
                            <defs>
                                <radialGradient id="satSphereGoldGrad" cx="35%" cy="30%" r="65%">
                                    <stop offset="0%" stop-color="#fef9c3"/>
                                    <stop offset="35%" stop-color="#facc15"/>
                                    <stop offset="75%" stop-color="#ca8a04"/>
                                    <stop offset="100%" stop-color="#713f12"/>
                                </radialGradient>
                                <linearGradient id="satPinGoldCollar" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stop-color="#a16207"/>
                                    <stop offset="50%" stop-color="#fef08a"/>
                                    <stop offset="100%" stop-color="#854d0e"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                `;
            } else if (style === 'pin_gold_luxury') {
                overlay.className = 'sat-map-pin-overlay pin-mode';
                overlay.innerHTML = `
                    ${text ? `<div class="sat-live-pin-text" style="border-color:#eab308; color:#fef08a;">${escText}</div>` : ''}
                    <div class="sat-live-pin-svg">
                        <svg width="44" height="58" viewBox="0 0 44 58" fill="none" style="overflow: visible;">
                            <ellipse cx="22" cy="57" rx="10" ry="3" fill="rgba(0,0,0,0.5)" filter="blur(2px)"/>
                            <path d="M22 0C10 0 0 10 0 22C0 37 22 58 22 58S44 37 44 22C44 10 34 0 22 0Z" fill="url(#satLiveGoldGrad)" stroke="#ffffff" stroke-width="2.5"/>
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
                `;
            } else if (style === 'pin_real_estate') {
                overlay.className = 'sat-map-pin-overlay pin-mode';
                overlay.innerHTML = `
                    ${text ? `<div class="sat-live-pin-text" style="border-color:#10b981; color:#ecfdf5;">${escText}</div>` : ''}
                    <div class="sat-live-pin-svg">
                        <svg width="46" height="60" viewBox="0 0 46 60" fill="none" style="overflow: visible;">
                            <ellipse cx="23" cy="59" rx="10" ry="3" fill="rgba(0,0,0,0.5)" filter="blur(2px)"/>
                            <path d="M23 0C10.5 0 0 10.5 0 23C0 39 23 60 23 60S46 39 46 23C46 10.5 35.5 0 23 0Z" fill="url(#satLiveEmeraldGrad)" stroke="#ffffff" stroke-width="2.5"/>
                            <circle cx="23" cy="22" r="10.5" fill="#ffffff"/>
                            <path d="M23 15L16 22H19V28H27V22H30L23 15Z" fill="#047857"/>
                            <defs>
                                <linearGradient id="satLiveEmeraldGrad" x1="0" y1="0" x2="46" y2="60" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#10b981"/>
                                    <stop offset="1" stop-color="#064e3b"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                `;
            } else if (style === 'pin_neon_cyan') {
                overlay.className = 'sat-map-pin-overlay pin-mode';
                overlay.innerHTML = `
                    ${text ? `<div class="sat-live-pin-text" style="border-color:#38bdf8; color:#e0f2fe; box-shadow:0 0 12px rgba(56,189,248,0.4);">${escText}</div>` : ''}
                    <div class="sat-live-pin-svg">
                        <svg width="44" height="58" viewBox="0 0 44 58" fill="none" style="overflow: visible;">
                            <ellipse cx="22" cy="57" rx="10" ry="3" fill="rgba(0,0,0,0.5)" filter="blur(2px)"/>
                            <path d="M22 0C10 0 0 10 0 22C0 37 22 58 22 58S44 37 44 22C44 10 34 0 22 0Z" fill="#090d16" stroke="#38bdf8" stroke-width="2.6"/>
                            <circle cx="22" cy="21" r="8" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="1.8"/>
                            <circle cx="22" cy="21" r="4" fill="#38bdf8"/>
                        </svg>
                    </div>
                `;
            } else if (style === 'pin_target') {
                overlay.className = 'sat-map-pin-overlay radar-mode';
                overlay.innerHTML = `
                    ${text ? `<div class="sat-live-pin-text" style="border-color:#ef4444; color:#ffffff; margin-bottom:10px;">${escText}</div>` : ''}
                    <div class="sat-live-pin-svg">
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style="overflow: visible;">
                            <circle cx="30" cy="30" r="28" stroke="#ef4444" stroke-width="1.5" opacity="0.5"/>
                            <circle cx="30" cy="30" r="20" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 3"/>
                            <circle cx="30" cy="30" r="10" stroke="#ffffff" stroke-width="2"/>
                            <circle cx="30" cy="30" r="4" fill="#ef4444"/>
                            <line x1="2" y1="30" x2="16" y2="30" stroke="#ef4444" stroke-width="2"/>
                            <line x1="44" y1="30" x2="58" y2="30" stroke="#ef4444" stroke-width="2"/>
                            <line x1="30" y1="2" x2="30" y2="16" stroke="#ef4444" stroke-width="2"/>
                            <line x1="30" y1="44" x2="30" y2="58" stroke="#ef4444" stroke-width="2"/>
                        </svg>
                    </div>
                `;
            } else if (style === 'pin_radar') {
                overlay.className = 'sat-map-pin-overlay radar-mode';
                overlay.innerHTML = `
                    ${text ? `<div class="sat-live-pin-text" style="border-color:#10b981; color:#34d399; margin-bottom:10px;">${escText}</div>` : ''}
                    <div class="sat-live-pin-svg">
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style="overflow: visible;">
                            <circle cx="30" cy="30" r="28" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="1.5" opacity="0.6"/>
                            <circle cx="30" cy="30" r="20" stroke="#10b981" stroke-width="2" stroke-dasharray="5 4"/>
                            <circle cx="30" cy="30" r="10" stroke="#34d399" stroke-width="2"/>
                            <circle cx="30" cy="30" r="4.5" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>
                            <line x1="2" y1="30" x2="16" y2="30" stroke="#10b981" stroke-width="2"/>
                            <line x1="44" y1="30" x2="58" y2="30" stroke="#10b981" stroke-width="2"/>
                            <line x1="30" y1="2" x2="30" y2="16" stroke="#10b981" stroke-width="2"/>
                            <line x1="30" y1="44" x2="30" y2="58" stroke="#10b981" stroke-width="2"/>
                        </svg>
                    </div>
                `;
            } else if (style === 'pin_flag') {
                overlay.className = 'sat-map-pin-overlay pin-mode';
                overlay.innerHTML = `
                    ${text ? `<div class="sat-live-pin-text" style="border-color:#ef4444; color:#ffffff;">${escText}</div>` : ''}
                    <div class="sat-live-pin-svg">
                        <svg width="48" height="58" viewBox="0 0 48 58" fill="none" style="overflow: visible;">
                            <ellipse cx="10" cy="57" rx="7" ry="2.2" fill="rgba(0,0,0,0.4)" filter="blur(1.5px)"/>
                            <line x1="10" y1="6" x2="10" y2="56" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
                            <circle cx="10" cy="5" r="3.5" fill="#f59e0b" stroke="#ffffff" stroke-width="1"/>
                            <path d="M10 8 L44 20 L10 32 Z" fill="url(#satFlagRedGrad)" stroke="#f59e0b" stroke-width="1.8" stroke-linejoin="round"/>
                            <circle cx="22" cy="20" r="3.5" fill="#fef08a"/>
                            <defs>
                                <linearGradient id="satFlagRedGrad" x1="10" y1="8" x2="44" y2="32" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#ef4444"/>
                                    <stop offset="1" stop-color="#991b1b"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                `;
            } else if (style === 'pin_vip_star') {
                overlay.className = 'sat-map-pin-overlay pin-mode';
                overlay.innerHTML = `
                    ${text ? `<div class="sat-live-pin-text" style="border-color:#f59e0b; color:#fbbf24;">${escText}</div>` : ''}
                    <div class="sat-live-pin-svg">
                        <svg width="46" height="58" viewBox="0 0 46 58" fill="none" style="overflow: visible;">
                            <ellipse cx="23" cy="57" rx="8" ry="2.5" fill="rgba(0,0,0,0.4)" filter="blur(1.5px)"/>
                            <polygon points="17,34 14,56 23,48 32,56 29,34" fill="#991b1b" stroke="#f59e0b" stroke-width="1.5"/>
                            <circle cx="23" cy="20" r="17" fill="url(#satVipGoldGrad)" stroke="#ffffff" stroke-width="2.5"/>
                            <circle cx="23" cy="20" r="13" fill="#1e1b18" stroke="#fbbf24" stroke-width="1.5"/>
                            <!-- 5-Point Star -->
                            <polygon points="23,11 25.5,17 32,17.5 27,21.5 29,28 23,24 17,28 19,21.5 14,17.5 20.5,17" fill="#fde047"/>
                            <defs>
                                <linearGradient id="satVipGoldGrad" x1="6" y1="3" x2="40" y2="37" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#fef08a"/>
                                    <stop offset="0.5" stop-color="#f59e0b"/>
                                    <stop offset="1" stop-color="#78350f"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                `;
            } else {
                // pin_modern (Varsayılan Kırmızı/Yakut Damla Konum Pini)
                overlay.className = 'sat-map-pin-overlay pin-mode';
                overlay.innerHTML = `
                    ${text ? `<div class="sat-live-pin-text" style="border-color:#ef4444; color:#ffffff;">${escText}</div>` : ''}
                    <div class="sat-live-pin-svg">
                        <svg width="44" height="58" viewBox="0 0 44 58" fill="none" style="overflow: visible;">
                            <ellipse cx="22" cy="57" rx="10" ry="3" fill="rgba(0,0,0,0.5)" filter="blur(2px)"/>
                            <path d="M22 0C10 0 0 10 0 22C0 37 22 58 22 58S44 37 44 22C44 10 34 0 22 0Z" fill="url(#satLiveRedGrad2)" stroke="#ffffff" stroke-width="2.5"/>
                            <circle cx="22" cy="21" r="8" fill="#ffffff"/>
                            <circle cx="22" cy="21" r="4.5" fill="#dc2626"/>
                            <defs>
                                <linearGradient id="satLiveRedGrad2" x1="0" y1="0" x2="44" y2="58" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#ef4444"/>
                                    <stop offset="1" stop-color="#991b1b"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
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
            const allTurkishProvinces = /(Adana|Adıyaman|Afyonkarahisar|Afyon|Ağrı|Amasya|Ankara|Antalya|Artvin|Aydın|Balıkesir|Bilecik|Bingöl|Bitlis|Bolu|Burdur|Bursa|Çanakkale|Çankırı|Çorum|Denizli|Diyarbakır|Edirne|Elazığ|Erzincan|Erzurum|Eskişehir|Gaziantep|Giresun|Gümüşhane|Hakkari|Hatay|Isparta|Mersin|İçel|İstanbul|İzmir|Kars|Kastamonu|Kayseri|Kırklareli|Kırşehir|Kocaeli|Konya|Kütahya|Malatya|Manisa|Kahramanmaraş|Maraş|Mardin|Muğla|Muş|Nevşehir|Niğde|Ordu|Rize|Sakarya|Samsun|Siirt|Sinop|Sivas|Tekirdağ|Tokat|Trabzon|Tunceli|Şanlıurfa|Urfa|Uşak|Van|Yozgat|Zonguldak|Aksaray|Bayburt|Karaman|Kırıkkale|Batman|Şırnak|Bartın|Ardahan|Iğdır|Yalova|Karabük|Kilis|Osmaniye|Düzce|Sapanca|Kaynarca|Serdivan|Karasu|Bodrum|Fethiye|Marmaris|Datça|Alanya|Manavgat|Kemer|Kaş|Kalkan|Kadıköy|Beşiktaş|Üsküdar|Sarıyer|Bakırköy|Çeşme|Urla|Alaçatı|Bornova|Karşıyaka|Nilüfer|Mudanya|Süleymanpaşa|Çorlu|Çerkezköy|Yenice)/i;

            const cleanStr = (s) => {
                if (!s) return '';
                return s.replace(/[\ufffd\?📍📌📐🏢🏠🛣️🌿*]/giu, '')
                        .replace(/^[^\p{L}\p{N}]+/u, '')
                        .trim();
            };

            // 1. Dinamik form konum alanlarından ara (En temiz ve doğrudan kaynak)
            const formFields = ['f_konum', 'f_lokasyon', 'f_adres', 'locationInput', 'canvaLocation', 'c_loc'];
            for (let fId of formFields) {
                const el = document.getElementById(fId);
                if (el && el.value && el.value.trim().length > 2) {
                    const val = cleanStr(el.value);
                    if (val && !['merkez', 'merkezi', 'türkiye', 'turkey'].includes(val.toLowerCase())) {
                        return val;
                    }
                }
            }

            // 2. Açıklama metninden (#descInput) akıllı satır / bölüm arama
            const desc = document.getElementById('descInput')?.value || '';
            if (desc) {
                const lines = desc.split('\n');
                // Öncelik A: 📍 veya 📌 ile başlayan temiz satır
                for (let l of lines) {
                    const tr = l.trim();
                    if (/^[📍📌]/.test(tr)) {
                        const cl = cleanStr(tr.replace(/^[📍📌]\s*/, ''));
                        if (cl.length >= 3) return cl;
                    }
                }
                // Öncelik B: İl adı ve taksim (/ \ |) içeren temiz adres segmenti
                const addrRegex = new RegExp('(' + allTurkishProvinces.source + '\\s*[/\\\\|]\\s*[^,;\\n\\.!]+)', 'i');
                const m = desc.match(addrRegex);
                if (m) {
                    let clean = m[1].replace(/\b(civarında|bölgesinde|mevkiinde|yakınında|konumunda|yer alan|yer alır|satılık|kiralık|fırsat)\b.*$/i, '');
                    clean = cleanStr(clean);
                    if (clean.length >= 3) return clean;
                }
                // Öncelik C: Kısa satırlarda il adı kontrolü (<= 80 karakter)
                for (let l of lines) {
                    const cleanL = cleanStr(l);
                    if (cleanL && cleanL.length <= 80 && allTurkishProvinces.test(cleanL)) {
                        return cleanL;
                    }
                }
            }

            // 3. Başlık veya alt başlık alanlarından ara
            const tInput = document.getElementById('titleInput')?.value || '';
            const subInput = document.getElementById('subTitleInput')?.value || '';
            const combined = (tInput + ' ' + subInput).trim();
            const addrRegex = new RegExp('(' + allTurkishProvinces.source + '\\s*[/\\\\|]\\s*[^,;\\n\\.!]+)', 'i');
            const tm = combined.match(addrRegex);
            if (tm) {
                return cleanStr(tm[1]);
            }

            return '';
        },

        /**
         * Türkçe Karakterleri Normalize Eder (Arama ve Karşılaştırma İçin)
         */
        turkishNormalize: function(s) {
            if (!s) return '';
            return String(s).toLowerCase()
                .replace(/İ/g, 'i').replace(/I/g, 'ı').replace(/ı/g, 'i')
                .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u');
        },

        /**
         * Akıllı Konum Arama Adaylarını Oluşturur (Nominatim Geocoding için hiyerarşik varyantlar)
         */
        buildLocationCandidates: function(raw) {
            if (!raw) return [];
            // Unicode replacement karakterlerini, soru işaretlerini, ikonları ve baştaki özel karakterleri temizle
            const cleaned = raw.replace(/[\ufffd\?📍📌📐🏢🏠🛣️🌿*]/giu, '')
                               .replace(/^[^\p{L}\p{N}]+/u, '')
                               .trim();
            const candidates = [];

            // Parçalara böl (/, \, |, ;, tire veya virgül vb.)
            const rawParts = cleaned.split(/[\/\\|,;]+/).map(p => p.trim()).filter(Boolean);

            if (rawParts.length >= 2) {
                // Türkçe ekleri ('Mahallesi', 'Mah.', 'Mh.', 'Köyü', 'Köy' vb.) harf sınırlarına göre güvenle temizle
                const cleanParts = rawParts.map(p => {
                    return p.replace(/(?:^|\s+)(mahallesi|mah|mh|köyü|köy|mevkii|civarında|bölgesinde|yakınında)(?=[.,:;\s]|$)/giu, ' ')
                            .replace(/[.,:;]/g, '')
                            .trim();
                }).filter(Boolean);

                // 'Mahallesi' / 'Köyü' varyantı
                const fullParts = rawParts.map(p => {
                    let s = p.replace(/[.,:;]/g, '').trim();
                    if (/(?:^|\s+)(mah|mh)(?=[.,:;\s]|$)/iu.test(p) && !/mahallesi/iu.test(p)) {
                        s = s.replace(/(?:^|\s+)(mah|mh)(?=[.,:;\s]|$)/giu, ' ').trim() + ' Mahallesi';
                    }
                    return s;
                }).filter(Boolean);

                // 1. En spesifik kombinasyon: Köy/Mahalle + İlçe + İl (Örn: 'Yalıoba, Yenice, Çanakkale')
                if (cleanParts.length >= 3) {
                    candidates.push(fullParts[fullParts.length - 1] + ', ' + fullParts[fullParts.length - 2] + ', ' + fullParts[0]);
                    candidates.push(cleanParts[cleanParts.length - 1] + ', ' + cleanParts[cleanParts.length - 2] + ', ' + cleanParts[0]);
                    candidates.push(cleanParts[cleanParts.length - 1] + ', ' + cleanParts[cleanParts.length - 2]); // Mahalle, İlçe
                    candidates.push(cleanParts[cleanParts.length - 1] + ' ' + cleanParts[cleanParts.length - 2]); // Mahalle İlçe
                    // 🛡️ İlçe Tutarlılığı: Eğer mahalle bulunamazsa, başka bir ilçeye zıplamamak için DOĞRU İLÇEYİ ara!
                    candidates.push(cleanParts[cleanParts.length - 2] + ', ' + cleanParts[0]); // İlçe, İl (Örn: 'İscehisar, Afyonkarahisar')
                    candidates.push(cleanParts[cleanParts.length - 2]); // İlçe (Örn: 'İscehisar')
                    candidates.push(cleanParts.join(' '));
                } else if (cleanParts.length === 2) {
                    candidates.push(cleanParts[1] + ', ' + cleanParts[0]); // İlçe/Mahalle, İl
                    candidates.push(cleanParts[1] + ' ' + cleanParts[0]);
                    candidates.push(fullParts[1] + ', ' + fullParts[0]);
                    candidates.push(cleanParts[1]);
                }

                // Orijinal ters ve düz sıra
                candidates.push(fullParts.slice().reverse().join(', '));
                candidates.push(cleanParts.slice().reverse().join(', '));
                candidates.push(fullParts.join(', '));
                candidates.push(cleanParts.join(', '));
            }

            // Genel temizleme varyantları
            candidates.push(cleaned.replace(/[\/\\|]+/g, ', '));
            candidates.push(cleaned.replace(/[\/\\|]+/g, ' '));
            candidates.push(cleaned);

            // İl adını yakalayıp son çare olarak ekle
            const provMatch = cleaned.match(/(İstanbul|Ankara|İzmir|Bursa|Antalya|Adana|Konya|Gaziantep|Şanlıurfa|Kocaeli|Mersin|Diyarbakır|Hatay|Manisa|Kayseri|Samsun|Balıkesir|Kahramanmaraş|Van|Aydın|Tekirdağ|Sakarya|Denizli|Muğla|Eskişehir|Trabzon|Ordu|Afyon|Sivas|Malatya|Batman|Tokat|Düzce|Uşak|Kütahya|Yalova|Bolu|Rize|Edirne|Çanakkale)/i);
            if (provMatch) {
                candidates.push(provMatch[0]);
            }

            // Tekilleştirme
            const seen = new Set();
            const result = [];
            for (let c of candidates) {
                const norm = c.trim().replace(/\s+/g, ' ');
                if (norm.length >= 3 && !seen.has(norm.toLowerCase())) {
                    seen.add(norm.toLowerCase());
                    result.push(norm);
                }
            }
            return result;
        },

        /**
         * Nominatim Geocoding ile Arama Yapar (Akıllı Hiyerarşik Arama)
         */
        searchLocation: async function(query) {
            const input = document.getElementById('satSearchInput');
            let q = query || (input ? input.value : '');
            // Temizleme: baştaki soru işaretleri veya bozuk karakterleri gider
            q = q.replace(/[\ufffd\?📍📌📐🏢🏠🛣️🌿*]/giu, '')
                 .replace(/^[^\p{L}\p{N}]+/u, '')
                 .trim();

            if (input && input.value !== q) {
                input.value = q;
            }

            if (!q) {
                alert('Lütfen aramak istediğiniz il, ilçe veya mahalle adını yazın.');
                return;
            }

            const searchBtn = document.getElementById('satSearchBtn');
            if (searchBtn) {
                searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Bulunuyor...';
                searchBtn.disabled = true;
            }

            // Hedef il, ilçe ve mahalle bilgilerini analiz et
            const rawParts = q.split(/[\/\\|,;]+/).map(p => p.trim()).filter(Boolean);
            let targetProvince = '';
            let targetDistrict = '';
            let targetNeighborhood = '';

            if (rawParts.length >= 3) {
                targetProvince = rawParts[0];
                targetDistrict = rawParts[1];
                targetNeighborhood = rawParts[2].replace(/(?:^|\s+)(mahallesi|mah|mh|köyü|köy|mevkii|civarında|bölgesinde|yakınında)(?=[.,:;\s]|$)/giu, ' ').replace(/[.,:;]/g, '').trim();
            } else if (rawParts.length === 2) {
                targetProvince = rawParts[0];
                targetDistrict = rawParts[1];
            }

            const candidates = this.buildLocationCandidates(q);
            let foundResult = null;
            let matchedCandidate = '';

            for (const cand of candidates) {
                try {
                    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cand)}&countrycodes=tr&limit=1`;
                    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
                    const data = await res.json();
                    if (data && data.length > 0) {
                        const disp = data[0].display_name;

                        // 🛡️ İLÇE TUTARLILIK DOĞRULAMASI:
                        // Eğer kullanıcı belirli bir ilçe aramışsa (örn: İscehisar), harita başka bir ilçedeki (örn: Bolvadin) aynı isimli mahalleye ASLA gitmemelidir!
                        if (targetDistrict) {
                            const normDist = this.turkishNormalize(targetDistrict);
                            const normDisp = this.turkishNormalize(disp);
                            if (!normDisp.includes(normDist)) {
                                console.warn(`[Geocoding] İlçe uyuşmazlığı: Aranan '${targetDistrict}', bulunan '${disp}'. Aday atlandı.`);
                                continue;
                            }
                        }

                        foundResult = data[0];
                        matchedCandidate = cand;
                        break;
                    }
                } catch (e) {
                    console.warn('Geocoding denemesi atlandı:', cand, e);
                }
            }

            if (searchBtn) {
                searchBtn.innerHTML = '<i class="fas fa-search"></i> Bul';
                searchBtn.disabled = false;
            }

            if (foundResult) {
                const lat = parseFloat(foundResult.lat);
                const lng = parseFloat(foundResult.lon);
                
                let targetZoom = 16;
                if (foundResult.type === 'village' || foundResult.type === 'hamlet') {
                    targetZoom = 16;
                } else if (foundResult.type === 'administrative' || foundResult.class === 'boundary') {
                    targetZoom = 14;
                } else if (foundResult.type === 'suburb' || foundResult.type === 'town') {
                    targetZoom = 15;
                }
                const low = matchedCandidate.toLowerCase();
                if (low.includes('ada') || low.includes('parsel') || low.includes('sokak') || low.includes('cadde')) {
                    targetZoom = 17;
                }

                // Bulunan hedef koordinatı ve pini birebir haritadaki yere eşitle
                this.currentLat = lat;
                this.currentLng = lng;
                this.currentZoom = targetZoom;
                this.markerLatLng = L.latLng(lat, lng);

                // Pin üzerindeki başlık metnini yer adıyla otomatik güncelle (Örn: "SELÇUKLU", "YALIOBA" veya "NAİPKÖY")
                let placeName = targetNeighborhood || foundResult.name || '';
                if (!placeName && foundResult.display_name) {
                    placeName = foundResult.display_name.split(',')[0].trim();
                }
                if (!placeName && targetDistrict) {
                    placeName = targetDistrict;
                }
                placeName = placeName.replace(/(?:^|\s+)(mahallesi|mah|mh|köyü|köy)(?=[.,:;\s]|$)/giu, ' ').replace(/[.,:;]/g, '').trim();

                if (placeName && (!this.userManuallyChangedMarkerText || this.customMarkerText === 'PORTFÖYÜMÜZ')) {
                    this.customMarkerText = placeName.toLocaleUpperCase('tr-TR');
                    const textInput = document.getElementById('satMarkerCustomTextInput');
                    if (textInput) textInput.value = this.customMarkerText;
                    this.updateLivePinOverlay();
                }

                // Temiz gösterim adresi (Eğer mahalle OpenStreetMap'te ayrı çizilmemişse ilçe + mahalle etiketi oluştur)
                let cleanDisplay = '';
                if (targetDistrict && targetNeighborhood && !this.turkishNormalize(foundResult.display_name).includes(this.turkishNormalize(targetNeighborhood))) {
                    cleanDisplay = `${targetDistrict}, ${targetProvince} (${targetNeighborhood} Mah.)`;
                } else {
                    cleanDisplay = foundResult.display_name
                        ? foundResult.display_name.split(',').slice(0, 3).join(', ').trim()
                        : q;
                }
                this.updateFoundAddressBadge(cleanDisplay);

                // Haritayı bulunan noktaya uçur
                SatelliteMapModule.flyTo(lat, lng, targetZoom);

                // Son konumu ve koordinatları hafızaya kaydet (localStorage)
                this.saveLastLocation({
                    address: cleanDisplay,
                    lat: lat,
                    lng: lng,
                    zoom: targetZoom,
                    markerLat: lat,
                    markerLng: lng,
                    markerText: this.customMarkerText
                });

                if (typeof window.showAppToast === 'function') {
                    window.showAppToast(`📍 Konum bulundu: ${cleanDisplay}`, 'success');
                }
            } else {
                alert(`"${q}" için haritada kesin sonuç bulunamadı. Lütfen il ve ilçe adını kontrol ediniz.`);
            }
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
            const res = this.selectedResolution || '4k';

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
         * Açılan Pencere Tuval Oranında (16:9 / 1:1 / 4:5 / 9:16) Olur
         * Ekranda görünen harita kadrajı ile tuvale aktarılan görüntü %100 birebir aynı olur
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
            const maxW = Math.min(1380, winW - 24);
            const maxH = Math.min(880, winH - 24);

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

            // Hedef tuval oranına göre harita boyutunu hesapla
            let mapW = Math.round(availMapH * targetRatio);
            let mapH = availMapH;

            // Eğer genişlik ekranı aşıyorsa, genişliğe göre dikey alanı uyarla
            if (mapW > maxW) {
                mapW = maxW;
                mapH = Math.round(mapW / targetRatio);
            }

            // Buton ve kontrollerin rahat sığması için makul taban genişlik (dar dikey oranlar için)
            const minBarW = 780;
            const finalContainerW = Math.min(maxW, Math.max(minBarW, mapW));
            const finalContainerH = Math.min(maxH, mapH + overheadH);

            modalContainer.style.width = finalContainerW + 'px';
            modalContainer.style.maxWidth = finalContainerW + 'px';
            modalContainer.style.height = finalContainerH + 'px';
            modalContainer.style.maxHeight = finalContainerH + 'px';

            // Harita sahnesinde harita kadrajı BİREBİR tuval oranında (targetRatio) kalsın!
            // Böylece ekranda ne görünüyorsa tuvale aktarılan da birebir aynı olur, kenarlardan kırpılma olmaz.
            if (finalContainerW > mapW) {
                wrapper.style.width = mapW + 'px';
                wrapper.style.height = mapH + 'px';
                wrapper.style.margin = '0 auto';
            } else {
                wrapper.style.width = '100%';
                wrapper.style.height = '100%';
                wrapper.style.margin = '0';
            }

            wrapper.style.aspectRatio = '';
            wrapper.style.maxWidth = '100%';
            wrapper.style.maxHeight = '100%';
            wrapper.style.borderRadius = '0';
            wrapper.style.boxShadow = 'none';

            if (this.map) {
                this.map.invalidateSize();
                this.updateMarkerOverlayPosition();
            }
        },

        /**
         * Modalı Açar
         */
        openModal: function() {
            if (window.innerWidth <= 768) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('🛰️ Uydu haritası özelliği masaüstü cihazlar için optimize edilmiştir.', 'info');
                }
                return;
            }

            this.ensureModalDOM();

            const modal = document.getElementById('satelliteMapModal');
            if (!modal) return;

            // Mevcut şablonun/tuvalin formatını algıla ve kadraj formatı olarak belirle
            let detectedFmt = '16:9';
            try {
                const activeDockBtn = document.querySelector('.dock-pill-btn.active');
                const expSel = document.getElementById('exportFormat');
                const prvSel = document.getElementById('previewFormat');
                const cContainer = document.getElementById('canvas-container');
                const cEl = typeof canvasEl !== 'undefined' && canvasEl ? canvasEl : document.getElementById('canvas');

                let canvasRatio = 1.7778;
                if (cContainer && cContainer.offsetWidth > 0 && cContainer.offsetHeight > 0) {
                    canvasRatio = cContainer.offsetWidth / cContainer.offsetHeight;
                } else if (cEl) {
                    const cw = parseInt(cEl.style.width) || cEl.width || 1920;
                    const ch = parseInt(cEl.style.height) || cEl.height || 1080;
                    if (ch > 0) canvasRatio = cw / ch;
                }

                const formatStr = ((activeDockBtn ? (activeDockBtn.dataset.format || activeDockBtn.innerText) : '') + ' ' +
                                  (expSel ? expSel.value : '') + ' ' +
                                  (prvSel ? prvSel.value : '')).toLowerCase();

                if (formatStr.includes('1:1') || formatStr.includes('kare') || Math.abs(canvasRatio - 1.0) < 0.08) {
                    detectedFmt = '1:1';
                } else if (formatStr.includes('4:5') || formatStr.includes('portre') || Math.abs(canvasRatio - 0.8) < 0.08) {
                    detectedFmt = '4:5';
                } else if (formatStr.includes('9:16') || formatStr.includes('story') || formatStr.includes('hikaye') || Math.abs(canvasRatio - 0.5625) < 0.08) {
                    detectedFmt = '9:16';
                } else {
                    detectedFmt = '16:9';
                }
            } catch(e) {
                console.warn('Format algılama hatası:', e);
            }

            this.selectedFormat = detectedFmt;
            this.setExportFormat(this.selectedFormat);

            // Çözünürlük ve Pin ayarlarını arayüze yansıt
            const resSel = document.getElementById('satResolutionSelect');
            if (resSel) resSel.value = this.selectedResolution;

            // Hafızadaki son konum ve mevcut projeden algılanan konum
            const lastLoc = this.getLastLocation();
            const detected = this.detectLocationFromProject();

            let targetQuery = '';
            if (detected) {
                targetQuery = detected;
            } else if (lastLoc && lastLoc.lat && lastLoc.lng) {
                targetQuery = lastLoc.address || '';
                this.currentLat = lastLoc.lat;
                this.currentLng = lastLoc.lng;
                this.currentZoom = lastLoc.zoom || 17;
                this.markerLatLng = L.latLng(lastLoc.markerLat || lastLoc.lat, lastLoc.markerLng || lastLoc.lng);
                if (lastLoc.markerText) {
                    this.customMarkerText = lastLoc.markerText;
                }
            }

            const savedMarkerStyle = localStorage.getItem('emlak_sat_marker_style');
            if (savedMarkerStyle) this.markerStyle = savedMarkerStyle;

            const textInput = document.getElementById('satMarkerCustomTextInput');
            if (textInput) textInput.value = this.customMarkerText || 'PORTFÖYÜMÜZ';

            const styleSel = document.getElementById('satMarkerStyleSelect');
            if (styleSel) styleSel.value = this.markerStyle || 'badge';

            if (!this.markerLatLng) {
                this.markerLatLng = L.latLng(this.currentLat, this.currentLng);
            }

            this.toggleMarker(this.markerEnabled);
            this.toggleAiEnhance(this.aiEnhanceEnabled);

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            this.updateParcelUI();
            this.updateParcelNeonUI();

            const input = document.getElementById('satSearchInput');
            if (input && targetQuery) {
                input.value = targetQuery;
            }


            setTimeout(() => {
                this.initMap();
                this.updateMapWrapperDimensions();
                this.attachMarkerDragListeners();
                this.applyLiveMapAiPreview();

                if (detected) {
                    this.searchLocation(detected);
                } else if (lastLoc && lastLoc.lat && lastLoc.lng) {
                    // Son kaydedilen adrese ve koordinata doğrudan git ve pini yerleştir
                    this.map.setView([this.currentLat, this.currentLng], this.currentZoom);
                    this.updateMarkerOverlayPosition();
                    this.updateCoordsBadge();
                    if (lastLoc.address) {
                        this.updateFoundAddressBadge(lastLoc.address);
                    }
                } else if (input && input.value.trim()) {
                    this.searchLocation(input.value.trim());
                } else if (this.map) {
                    this.map.invalidateSize();
                    this.updateMarkerOverlayPosition();
                }
            }, 100);
        },

        /**
         * Modalı Kapatır
         */
        closeModal: function() {
            this.toggleSettingsDrawer(false);
            this.closeParcelColorPicker();
            const modal = document.getElementById('satelliteMapModal');
            if (modal) {
                modal.style.display = 'none';
            }
            document.body.style.overflow = '';
            if (typeof window.hideAppLoading === 'function') {
                window.hideAppLoading();
            }
            const mapEl = document.getElementById('satelliteLeafletMap');
            if (mapEl) mapEl.style.filter = '';
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
            canvas._cropInfo = { cropX, cropY, cropW, cropH, scale, mapW, mapH };
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
                const resName = (this.selectedResolution || '4K').toUpperCase();
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
                            const ctx3d = offCanvas.getContext('2d');
                            const overlay = document.getElementById('satMapPinOverlay');
                            const wrapper = document.getElementById('satMapWrapper');
                            let pinCanvasX = targetW / 2;
                            let pinCanvasY = targetH / 2;
                            if (overlay && overlay.style.left && overlay.style.left.endsWith('px')) {
                                const wrapW = wrapper ? wrapper.offsetWidth : targetW;
                                const wrapH = wrapper ? wrapper.offsetHeight : targetH;
                                pinCanvasX = (parseFloat(overlay.style.left) / wrapW) * targetW;
                                pinCanvasY = (parseFloat(overlay.style.top) / wrapH) * targetH;
                            }
                            this.drawVectorMarker(ctx3d, pinCanvasX, pinCanvasY, this.markerStyle, this.customMarkerText, targetW, wrapper);
                        }

                        // Parsel rozeti tuval fotoğrafının içine sabit basılmaz.
                        // Kullanıcının tuvalde serbestçe taşıyabilmesi ve boyutlandırabilmesi için
                        // aktarım sonrası window.addParcelBadgeToCanvas ile canlı eleman olarak eklenir.

                        let final3dCanvas = offCanvas;
                        if (this.aiEnhanceEnabled) {
                            const intensity = (this.aiEnhanceIntensity || 20) / 100;
                            const contrast = 100 + Math.round(intensity * 32);
                            const saturate = 100 + Math.round(intensity * 28);
                            const brightness = 100 + Math.round(intensity * 3);

                            const filteredCanvas = document.createElement('canvas');
                            filteredCanvas.width = targetW;
                            filteredCanvas.height = targetH;
                            const fCtx = filteredCanvas.getContext('2d');
                            fCtx.imageSmoothingEnabled = true;
                            fCtx.imageSmoothingQuality = 'high';
                            fCtx.filter = `contrast(${contrast}%) saturate(${saturate}%) brightness(${brightness}%)`;
                            fCtx.drawImage(offCanvas, 0, 0);
                            fCtx.filter = 'none';

                            if (window.AiEnhancer && typeof window.AiEnhancer.applyAiFilters === 'function') {
                                try {
                                    final3dCanvas = window.AiEnhancer.applyAiFilters(filteredCanvas, 'picsart_hd', intensity);
                                } catch(e) {
                                    console.warn('AI netleştirme hatası, renk filtreli görsel aktarılıyor:', e);
                                    final3dCanvas = filteredCanvas;
                                }
                            } else {
                                final3dCanvas = filteredCanvas;
                            }
                        }

                        const dataUrl = final3dCanvas.toDataURL('image/jpeg', 0.96);
                        if (dataUrl && dataUrl.length > 1000) {
                            if (typeof window.applyProjectImageFromDataUrl === 'function') {
                                window.applyProjectImageFromDataUrl(dataUrl, (err) => {
                                    if (captureBtn) {
                                        captureBtn.innerHTML = '<i class="fas fa-camera-retro"></i> <span>📸 Şablona Aktar</span>';
                                        captureBtn.disabled = false;
                                    }
                                    if (!err) {
                                        SatelliteMapModule.closeModal();
                                        if (SatelliteMapModule.parcelData) {
                                            SatelliteMapModule.syncParcelToSmartParser(SatelliteMapModule.parcelData);
                                            // Parsel rozetini tuval üzerine serbestçe taşınabilir & boyutlandırılabilir eleman olarak ekle (Varsayılan: Sol üst)
                                            if (typeof window.addParcelBadgeToCanvas === 'function' && SatelliteMapModule.parcelShowLabel) {
                                                const relPos = SatelliteMapModule.floatingParcelPos || { relX: 0.04, relY: 0.04 };
                                                window.addParcelBadgeToCanvas(SatelliteMapModule.parcelData, {
                                                    relX: relPos.relX,
                                                    relY: relPos.relY,
                                                    scale: SatelliteMapModule.parcelBadgeScale || 1.0,
                                                    theme: SatelliteMapModule.parcelBadgeTheme || 'gold',
                                                    customColors: SatelliteMapModule.parcelBadgeCustomColors
                                                });
                                            }
                                        }
                                        if (typeof window.showAppToast === 'function') {
                                            const aiNote = this.aiEnhanceEnabled ? ` (AI %${this.aiEnhanceIntensity || 20} Net)` : '';
                                            window.showAppToast(`🌐 Google 3D görüntüsü${aiNote} (${targetW}x${targetH}) tuvalinize aktarıldı!`, 'success');
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
                        captureBtn.innerHTML = '<i class="fas fa-camera-retro"></i> <span>📸 Şablona Aktar</span>';
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
                    captureBtn.innerHTML = '<i class="fas fa-camera-retro"></i> <span>📸 Şablona Aktar</span>';
                    captureBtn.disabled = false;
                }
                return;
            }

            try {
                // 1) Ekranda görünen harita kadrajını 1:1 piksel hassasiyetiyle doğrudan DOM karolarından al
                let offCanvas = this.renderVisibleDomTilesToCanvas(targetW, targetH);

                // Eğer DOM karoları hazır değilse mevcut zoom seviyesinde yedek karoları çek
                if (!offCanvas) {
                    try {
                        offCanvas = await this.fetchAndStitchHighResTiles(targetW, targetH, this.currentZoom);
                    } catch (stitchErr) {
                        console.warn("Yedek karo motoru hatası:", stitchErr);
                    }
                }

                if (!offCanvas) {
                    throw new Error('Harita görseli oluşturulamadı.');
                }

                const ctx = offCanvas.getContext('2d');
                const cropInfo = offCanvas._cropInfo || { cropX: 0, cropY: 0, cropW: mapContainer.offsetWidth, cropH: mapContainer.offsetHeight };

                // 📐 Eğer TKGM Parsel Poligonu yüklüyse koordinatları tuval piksel kadrajına dönüştür
                let parcelCanvasPoints = null;
                if (this.parcelPolygon && this.parcelData) {
                    if (this.parcelData.latLngs && Array.isArray(this.parcelData.latLngs)) {
                        parcelCanvasPoints = this.parcelData.latLngs.map(ll => {
                            const pt = this.map.latLngToContainerPoint([ll[0], ll[1]]);
                            return {
                                x: ((pt.x - cropInfo.cropX) / cropInfo.cropW) * targetW,
                                y: ((pt.y - cropInfo.cropY) / cropInfo.cropH) * targetH
                            };
                        });
                    }

                    // Eğer drawPaths tanımlı değilse (fallback), doğrudan arka plan görseline yak
                    if (typeof drawPaths === 'undefined') {
                        this.drawVectorParcelPolygon(ctx, targetW, targetH, mapContainer, cropInfo);
                    }
                }

                // 📍 Eğer kullanıcı Konum İğnesi seçtiyse seçilen koordinata vektörel çiz (Kadraj ve çözünürlüğe birebir orantılı)
                if (this.markerEnabled) {
                    const markerPt = this.markerLatLng 
                        ? this.map.latLngToContainerPoint(this.markerLatLng)
                        : { x: mapContainer.offsetWidth / 2, y: mapContainer.offsetHeight / 2 };

                    const pinCanvasX = ((markerPt.x - cropInfo.cropX) / cropInfo.cropW) * targetW;
                    const pinCanvasY = ((markerPt.y - cropInfo.cropY) / cropInfo.cropH) * targetH;

                    this.drawVectorMarker(ctx, pinCanvasX, pinCanvasY, this.markerStyle, this.customMarkerText, targetW, mapContainer);
                }

                // Yüksek kaliteli JPEG DataURL al (AI netleştirme açıksa doğrudan uygula)
                let final2dCanvas = offCanvas;
                if (this.aiEnhanceEnabled) {
                    const intensity = (this.aiEnhanceIntensity || 20) / 100;
                    const contrast = 100 + Math.round(intensity * 32);
                    const saturate = 100 + Math.round(intensity * 28);
                    const brightness = 100 + Math.round(intensity * 3);

                    const filteredCanvas = document.createElement('canvas');
                    filteredCanvas.width = targetW;
                    filteredCanvas.height = targetH;
                    const fCtx = filteredCanvas.getContext('2d');
                    fCtx.imageSmoothingEnabled = true;
                    fCtx.imageSmoothingQuality = 'high';
                    fCtx.filter = `contrast(${contrast}%) saturate(${saturate}%) brightness(${brightness}%)`;
                    fCtx.drawImage(offCanvas, 0, 0);
                    fCtx.filter = 'none';

                    if (window.AiEnhancer && typeof window.AiEnhancer.applyAiFilters === 'function') {
                        try {
                            final2dCanvas = window.AiEnhancer.applyAiFilters(filteredCanvas, 'picsart_hd', intensity);
                        } catch(e) {
                            console.warn('AI netleştirme hatası, renk filtreli görsel aktarılıyor:', e);
                            final2dCanvas = filteredCanvas;
                        }
                    } else {
                        final2dCanvas = filteredCanvas;
                    }
                }

                const dataUrl = final2dCanvas.toDataURL('image/jpeg', 0.96);

                // Ana uygulamaya aktar (Şablonun boyutunu bozmadan tam çözünürlükte uygular)
                if (typeof window.applyProjectImageFromDataUrl === 'function') {
                    window.applyProjectImageFromDataUrl(dataUrl, (err) => {
                        if (captureBtn) {
                            captureBtn.innerHTML = '<i class="fas fa-camera-retro"></i> <span>📸 Şablona Aktar</span>';
                            captureBtn.disabled = false;
                        }

                        if (!err) {
                            SatelliteMapModule.saveLastLocation({
                                address: document.getElementById('satSearchInput')?.value || '',
                                lat: SatelliteMapModule.currentLat,
                                lng: SatelliteMapModule.currentLng,
                                zoom: SatelliteMapModule.currentZoom,
                                markerLat: SatelliteMapModule.markerLatLng ? SatelliteMapModule.markerLatLng.lat : SatelliteMapModule.currentLat,
                                markerLng: SatelliteMapModule.markerLatLng ? SatelliteMapModule.markerLatLng.lng : SatelliteMapModule.currentLng,
                                markerText: SatelliteMapModule.customMarkerText
                            });
                            SatelliteMapModule.closeModal();
                            if (SatelliteMapModule.parcelData) {
                                SatelliteMapModule.syncParcelToSmartParser(SatelliteMapModule.parcelData);

                                // 🚀 Parsel Poligonunu Canlı Tuval Katmanına (drawPaths) ve Saber WebGL Neon Motoruna Aktar
                                if (parcelCanvasPoints && typeof SatelliteMapModule.transferParcelToCanvas === 'function') {
                                    SatelliteMapModule.transferParcelToCanvas(parcelCanvasPoints);
                                }

                                // Parsel rozetini tuval üzerine serbestçe taşınabilir & boyutlandırılabilir eleman olarak ekle (Varsayılan: Sol üst)
                                if (typeof window.addParcelBadgeToCanvas === 'function' && SatelliteMapModule.parcelShowLabel) {
                                    const relPos = SatelliteMapModule.floatingParcelPos || { relX: 0.04, relY: 0.04 };
                                    window.addParcelBadgeToCanvas(SatelliteMapModule.parcelData, {
                                        relX: relPos.relX,
                                        relY: relPos.relY,
                                        scale: SatelliteMapModule.parcelBadgeScale || 1.0,
                                        theme: SatelliteMapModule.parcelBadgeTheme || 'gold',
                                        customColors: SatelliteMapModule.parcelBadgeCustomColors
                                    });
                                }
                            }
                            if (typeof window.showAppToast === 'function') {
                                const resTag = (this.selectedResolution || '4K').toUpperCase();
                                const aiNote = this.aiEnhanceEnabled ? ` (AI %${this.aiEnhanceIntensity || 20} Netleştirildi)` : '';
                                window.showAppToast(`🛰️ ${resTag} Uydu görüntüsü${aiNote} (${targetW}x${targetH}) başarıyla tuvalinize uygulandı!`, 'success');
                            }
                        }
                    });
                } else {
                    throw new Error('applyProjectImageFromDataUrl motoru bulunamadı.');
                }

            } catch (err) {
                console.error('Uydu görüntüsü aktarma hatası:', err);
                if (captureBtn) {
                    captureBtn.innerHTML = '<i class="fas fa-camera-retro"></i> <span>📸 Şablona Aktar</span>';
                    captureBtn.disabled = false;
                }
                if (typeof window.hideAppLoading === 'function') {
                    window.hideAppLoading();
                }
                alert('Uydu görüntüsü aktarılırken bir sorun oluştu: ' + err.message);
            }
        },

        /**
         * Yıldız Çizim Yardımcısı
         */
        drawStarShape: function(ctx, cx, cy, spikes, outerRadius, innerRadius) {
            let rot = Math.PI / 2 * 3;
            let x = cx;
            let y = cy;
            const step = Math.PI / spikes;

            ctx.beginPath();
            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
        },

        /**
         * Tuvalin Tam Merkezine Vektörel Konum İğnesi Çizer (SVG Geometrisi ile Birebir Orantılı - 10 Pro Stil)
         */
        drawVectorMarker: function(ctx, cx, cy, style, text, targetW, mapContainer) {
            ctx.save();
            const containerW = (mapContainer && mapContainer.offsetWidth) ? mapContainer.offsetWidth : 800;
            let s = ((targetW || 1920) / containerW) * 0.72;
            s = Math.max(1.0, Math.min(2.6, s));

            const markerText = (typeof text === 'string' && text.trim().length > 0) ? text.trim() : 'PORTFÖYÜMÜZ';
            const pinStyle = style || 'pin_modern';

            if (pinStyle === 'pin_radar' || pinStyle === 'radar') {
                // 📡 1. Canlı Radar / Parsel Hedef Halkası
                ctx.translate(cx, cy);
                ctx.scale(s, s);

                ctx.beginPath();
                ctx.arc(0, 0, 48, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(0, 0, 40, 0, Math.PI * 2);
                ctx.setLineDash([5, 4]);
                ctx.lineWidth = 2.2;
                ctx.strokeStyle = '#10b981';
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.beginPath();
                ctx.arc(0, 0, 22, 0, Math.PI * 2);
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#34d399';
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(0, 0, 6, 0, Math.PI * 2);
                ctx.fillStyle = '#10b981';
                ctx.fill();
                ctx.lineWidth = 1.8;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();

                ctx.lineWidth = 2;
                ctx.strokeStyle = '#10b981';
                ctx.beginPath(); ctx.moveTo(-56, 0); ctx.lineTo(-28, 0); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(28, 0); ctx.lineTo(56, 0); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, -56); ctx.lineTo(0, -28); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, 28); ctx.lineTo(0, 56); ctx.stroke();

                if (markerText) {
                    this.drawMarkerLabelBadge(ctx, 0, -68, '📍 ' + markerText, '#10b981', '#ffffff', false);
                }

                ctx.restore();
                return;
            }

            if (pinStyle === 'pin_target') {
                // 🎯 2. Taktik Nişangah
                ctx.translate(cx, cy);
                ctx.scale(s, s);

                ctx.beginPath();
                ctx.arc(0, 0, 36, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(239, 68, 68, 0.14)';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(0, 0, 32, 0, Math.PI * 2);
                ctx.setLineDash([4, 3]);
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#f97316';
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.beginPath();
                ctx.arc(0, 0, 18, 0, Math.PI * 2);
                ctx.lineWidth = 2.4;
                ctx.strokeStyle = '#ef4444';
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
                ctx.fillStyle = '#ef4444';
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();

                ctx.lineWidth = 2.2;
                ctx.strokeStyle = '#ef4444';
                ctx.beginPath(); ctx.moveTo(-44, 0); ctx.lineTo(-22, 0); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(44, 0); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, -44); ctx.lineTo(0, -22); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, 22); ctx.lineTo(0, 44); ctx.stroke();

                if (markerText) {
                    this.drawMarkerLabelBadge(ctx, 0, -56, markerText, '#f97316', '#ffffff', false);
                }

                ctx.restore();
                return;
            }

            if (pinStyle === 'pushpin_red') {
                // 🔴 3. Kırmızı Toplu İğne
                ctx.translate(cx, cy);
                ctx.scale(s, s);

                // Gölge
                ctx.beginPath();
                ctx.ellipse(0, 2, 9, 3, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
                ctx.fill();

                // Çelik İğne (0,0)'a batar
                ctx.beginPath();
                ctx.moveTo(9, -24);
                ctx.lineTo(0, 0);
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#cbd5e1';
                ctx.lineCap = 'round';
                ctx.stroke();

                // Çelik yansıma
                ctx.beginPath();
                ctx.moveTo(8.5, -24);
                ctx.lineTo(-0.5, 0);
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#64748b';
                ctx.stroke();

                // Kırmızı Küre
                const headX = 9, headY = -35;
                const redGrad = ctx.createRadialGradient(headX - 4, headY - 4, 2, headX, headY, 14);
                redGrad.addColorStop(0, '#f87171');
                redGrad.addColorStop(0.5, '#dc2626');
                redGrad.addColorStop(1, '#7f1d1d');

                ctx.beginPath();
                ctx.arc(headX, headY, 13, 0, Math.PI * 2);
                ctx.fillStyle = redGrad;
                ctx.fill();
                ctx.lineWidth = 1.8;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();

                // 3D Parlama
                ctx.save();
                ctx.translate(headX - 4, headY - 4);
                ctx.rotate(-0.5);
                ctx.beginPath();
                ctx.ellipse(0, 0, 4.5, 2.5, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fill();
                ctx.restore();

                if (markerText) {
                    this.drawMarkerLabelBadge(ctx, 0, -58, markerText, '#ef4444', '#ffffff', false);
                }

                ctx.restore();
                return;
            }

            if (pinStyle === 'pushpin_gold') {
                // 🟡 4. Altın Küre Toplu İğne
                ctx.translate(cx, cy);
                ctx.scale(s, s);

                // Gölge
                ctx.beginPath();
                ctx.ellipse(0, 2, 9, 3, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
                ctx.fill();

                // Çelik İğne (0,0)'a batar
                ctx.beginPath();
                ctx.moveTo(9, -24);
                ctx.lineTo(0, 0);
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#cbd5e1';
                ctx.lineCap = 'round';
                ctx.stroke();

                // Altın Küre
                const headX = 9, headY = -35;
                const goldSphere = ctx.createRadialGradient(headX - 4, headY - 4, 2, headX, headY, 14);
                goldSphere.addColorStop(0, '#fef08a');
                goldSphere.addColorStop(0.5, '#f59e0b');
                goldSphere.addColorStop(1, '#78350f');

                ctx.beginPath();
                ctx.arc(headX, headY, 13, 0, Math.PI * 2);
                ctx.fillStyle = goldSphere;
                ctx.fill();
                ctx.lineWidth = 1.8;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();

                // Parlama
                ctx.save();
                ctx.translate(headX - 4, headY - 4);
                ctx.rotate(-0.5);
                ctx.beginPath();
                ctx.ellipse(0, 0, 4.5, 2.5, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fill();
                ctx.restore();

                if (markerText) {
                    this.drawMarkerLabelBadge(ctx, 0, -58, markerText, '#f59e0b', '#fef08a', false);
                }

                ctx.restore();
                return;
            }

            if (pinStyle === 'pin_flag') {
                // 🚩 5. Sınır Bayrağı
                ctx.translate(cx, cy);
                ctx.scale(s, s);

                // Gölge
                ctx.beginPath();
                ctx.ellipse(0, 2, 10, 3, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
                ctx.fill();

                // Direk
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -42);
                ctx.lineWidth = 3.5;
                ctx.strokeStyle = '#cbd5e1';
                ctx.lineCap = 'round';
                ctx.stroke();

                // Direk Başı Altın Küre
                ctx.beginPath();
                ctx.arc(0, -42, 3.5, 0, Math.PI * 2);
                ctx.fillStyle = '#f59e0b';
                ctx.fill();

                // Kırmızı Bayrak
                const flagGrad = ctx.createLinearGradient(0, -40, 26, -30);
                flagGrad.addColorStop(0, '#ef4444');
                flagGrad.addColorStop(1, '#b91c1c');

                ctx.beginPath();
                ctx.moveTo(0, -40);
                ctx.lineTo(26, -31);
                ctx.lineTo(0, -22);
                ctx.closePath();
                ctx.fillStyle = flagGrad;
                ctx.fill();
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();

                if (markerText) {
                    this.drawMarkerLabelBadge(ctx, 0, -56, markerText, '#ef4444', '#ffffff', false);
                }

                ctx.restore();
                return;
            }

            // Teardrop Tabanlı Pinler: Modern, Gold Luxury, Real Estate, Neon Cyan, VIP Star
            ctx.translate(cx, cy);
            ctx.scale(s, s);

            // Zemin Gölgesi
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(0, 2, 12, 3.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.fill();
            ctx.restore();

            // Tip (22, 58)'i (0, 0)'a getirmek için kaydır
            ctx.save();
            ctx.translate(-22, -58);
            const teardrop = new Path2D("M22 0C10 0 0 10 0 22C0 37 22 58 22 58S44 37 44 22C44 10 34 0 22 0Z");

            if (pinStyle === 'pin_vip_star') {
                // ⭐ 6. VIP Yıldız Rozet
                ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
                ctx.shadowBlur = 6;
                ctx.shadowOffsetY = 3;

                ctx.fillStyle = '#18181b';
                ctx.fill(teardrop);

                ctx.shadowColor = 'transparent';
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = '#f59e0b';
                ctx.stroke(teardrop);

                // İç Koyu Halka
                ctx.beginPath();
                ctx.arc(22, 21, 11, 0, Math.PI * 2);
                ctx.fillStyle = '#1e1b18';
                ctx.fill();
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = '#fbbf24';
                ctx.stroke();

                // Yıldız
                ctx.fillStyle = '#fde047';
                this.drawStarShape(ctx, 22, 21, 5, 7.5, 3.5);
                ctx.fill();

                ctx.restore();

                if (markerText) {
                    this.drawMarkerLabelBadge(ctx, 0, -68, '⭐ ' + markerText, '#f59e0b', '#fef08a', false);
                }

            } else if (pinStyle === 'pin_real_estate' || pinStyle === 'badge') {
                // 🏠 7. Emlak & Villa Pini
                ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
                ctx.shadowBlur = 6;
                ctx.shadowOffsetY = 3;

                const blueGrad = ctx.createLinearGradient(0, 0, 44, 58);
                blueGrad.addColorStop(0, '#0284c7');
                blueGrad.addColorStop(1, '#0369a1');

                ctx.fillStyle = blueGrad;
                ctx.fill(teardrop);

                ctx.shadowColor = 'transparent';
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke(teardrop);

                // İç Beyaz Daire
                ctx.beginPath();
                ctx.arc(22, 21, 10.5, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();

                // Ev Çizimi
                ctx.fillStyle = '#0284c7';
                ctx.beginPath();
                ctx.moveTo(22, 14);
                ctx.lineTo(16, 19.5);
                ctx.lineTo(18, 19.5);
                ctx.lineTo(18, 27);
                ctx.lineTo(26, 27);
                ctx.lineTo(26, 19.5);
                ctx.lineTo(28, 19.5);
                ctx.closePath();
                ctx.fill();

                // Ev Kapısı
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(20.5, 22.5, 3, 4.5);

                ctx.restore();

                if (markerText) {
                    this.drawMarkerLabelBadge(ctx, 0, -68, '🏠 ' + markerText, '#38bdf8', '#ffffff', true);
                }

            } else if (pinStyle === 'pin_neon_cyan') {
                // ⚡ 8. Neon Cyan Pin
                ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
                ctx.shadowBlur = 8;
                ctx.shadowOffsetY = 2;

                ctx.fillStyle = '#0f172a';
                ctx.fill(teardrop);

                ctx.lineWidth = 3;
                ctx.strokeStyle = '#06b6d4';
                ctx.stroke(teardrop);

                ctx.shadowColor = 'transparent';

                // İç Şeffaf Cyan Halka
                ctx.beginPath();
                ctx.arc(22, 21, 10, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
                ctx.fill();
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = '#22d3ee';
                ctx.stroke();

                // Şimşek İkonu
                ctx.fillStyle = '#22d3ee';
                ctx.beginPath();
                ctx.moveTo(23, 13);
                ctx.lineTo(18, 21);
                ctx.lineTo(22, 21);
                ctx.lineTo(21, 29);
                ctx.lineTo(27, 19.5);
                ctx.lineTo(23, 19.5);
                ctx.closePath();
                ctx.fill();

                ctx.restore();

                if (markerText) {
                    this.drawMarkerLabelBadge(ctx, 0, -68, '⚡ ' + markerText, '#06b6d4', '#67e8f9', false);
                }

            } else if (pinStyle === 'pin_gold_luxury' || pinStyle === 'gold') {
                // 💎 9. Altın Lüks Pin
                ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
                ctx.shadowBlur = 6;
                ctx.shadowOffsetY = 3;

                const goldGrad = ctx.createLinearGradient(0, 0, 44, 58);
                goldGrad.addColorStop(0, '#fef08a');
                goldGrad.addColorStop(0.5, '#eab308');
                goldGrad.addColorStop(1, '#854d0e');

                ctx.fillStyle = goldGrad;
                ctx.fill(teardrop);

                ctx.shadowColor = 'transparent';
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke(teardrop);

                // İç Koyu Halka
                ctx.beginPath();
                ctx.arc(22, 21, 9, 0, Math.PI * 2);
                ctx.fillStyle = '#0f172a';
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#fef08a';
                ctx.stroke();

                // İç Altın Elmas
                ctx.beginPath();
                ctx.moveTo(22, 15);
                ctx.lineTo(27, 21);
                ctx.lineTo(22, 27);
                ctx.lineTo(17, 21);
                ctx.closePath();
                ctx.fillStyle = '#fde047';
                ctx.fill();

                ctx.restore();

                if (markerText) {
                    this.drawMarkerLabelBadge(ctx, 0, -68, markerText, '#eab308', '#fef08a', false);
                }

            } else {
                // 📍 10. Modern Yakut Konum Pini (pin_modern, classic, default)
                ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
                ctx.shadowBlur = 6;
                ctx.shadowOffsetY = 3;

                const redGrad = ctx.createLinearGradient(0, 0, 44, 58);
                redGrad.addColorStop(0, '#ef4444');
                redGrad.addColorStop(1, '#991b1b');

                ctx.fillStyle = redGrad;
                ctx.fill(teardrop);

                ctx.shadowColor = 'transparent';
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke(teardrop);

                // İç Beyaz Daire
                ctx.beginPath();
                ctx.arc(22, 21, 8, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();

                // İç Kırmızı Nokta
                ctx.beginPath();
                ctx.arc(22, 21, 4.5, 0, Math.PI * 2);
                ctx.fillStyle = '#dc2626';
                ctx.fill();

                ctx.restore();

                if (markerText) {
                    this.drawMarkerLabelBadge(ctx, 0, -68, markerText, '#ef4444', '#ffffff', false);
                }
            }

            ctx.restore();
        },

        /**
         * Vektörel Pin Rozetini Çizer (Zarif Yuvarlak Pill Rozet)
         */
        drawMarkerLabelBadge: function(ctx, x, y, text, borderColor, textColor, isProminent) {
            ctx.save();
            ctx.font = 'bold 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Montserrat", sans-serif';
            const textWidth = ctx.measureText(text).width;
            const bWidth = Math.max(72, textWidth + 22);
            const bHeight = isProminent ? 26 : 23;
            const bX = x - (bWidth / 2);
            const bY = y - (bHeight / 2);
            const radius = isProminent ? 6 : bHeight / 2; // Tam yuvarlak hap (pill)

            ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 3;

            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(bX, bY, bWidth, bHeight, radius);
            } else {
                ctx.rect(bX, bY, bWidth, bHeight);
            }
            ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
            ctx.fill();
            ctx.lineWidth = 1.6;
            ctx.strokeStyle = borderColor;
            ctx.stroke();

            ctx.shadowColor = 'transparent';
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, x, y + 0.5);
            ctx.restore();
        },

        /* =========================================================================
         * 📐 TKGM KML / GEOJSON ARSA PARSEL VE HAMBURGER AYARLAR YÖNETİMİ
         * ========================================================================= */

        /**
         * KML Metnini Ayrıştırır (DOMParser)
         */
        parseKmlText: function(kmlText) {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(kmlText, 'text/xml');
                const parseError = xmlDoc.querySelector('parsererror');
                if (parseError) {
                    throw new Error('Geçersiz KML dosya formatı.');
                }

                const coordEls = xmlDoc.getElementsByTagName('coordinates');
                if (!coordEls || coordEls.length === 0) {
                    throw new Error('KML dosyasında koordinat verisi (<coordinates>) bulunamadı.');
                }

                let allPoints = [];
                for (let i = 0; i < coordEls.length; i++) {
                    const rawCoords = coordEls[i].textContent || '';
                    const tokens = rawCoords.trim().split(/\s+/);
                    const ring = [];
                    for (let t = 0; t < tokens.length; t++) {
                        const parts = tokens[t].split(',');
                        if (parts.length >= 2) {
                            const lng = parseFloat(parts[0]);
                            const lat = parseFloat(parts[1]);
                            if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                                ring.push([lat, lng]);
                            }
                        }
                    }
                    if (ring.length >= 3 && ring.length > allPoints.length) {
                        allPoints = ring;
                    }
                }

                if (allPoints.length < 3) {
                    throw new Error('KML dosyasında geçerli poligon köşe noktaları bulunamadı.');
                }

                let meta = {
                    ada: '',
                    parsel: '',
                    il: '',
                    ilce: '',
                    mahalle: '',
                    alan: '',
                    name: '',
                    description: ''
                };

                const nameEl = xmlDoc.querySelector('Placemark > name, name');
                if (nameEl && nameEl.textContent) meta.name = nameEl.textContent.trim();

                const descEl = xmlDoc.querySelector('Placemark > description, description');
                if (descEl && descEl.textContent) meta.description = descEl.textContent.trim();

                const simpleDataEls = xmlDoc.querySelectorAll('SimpleData, Data');
                simpleDataEls.forEach(el => {
                    const attrName = (el.getAttribute('name') || '').toLowerCase();
                    const val = (el.textContent || el.querySelector('value')?.textContent || '').trim();
                    if (!val) return;

                    if (attrName === 'ada' || attrName.includes('ada_no') || attrName === 'adano') meta.ada = val;
                    else if (attrName === 'parsel' || attrName.includes('parsel_no') || attrName === 'parselno') meta.parsel = val;
                    else if (attrName === 'il' || attrName.includes('il_ad') || attrName === 'ilad') meta.il = val;
                    else if (attrName === 'ilce' || attrName.includes('ilce_ad') || attrName === 'ilcead') meta.ilce = val;
                    else if (attrName === 'mahalle' || attrName.includes('mahalle_ad') || attrName === 'mahallead') meta.mahalle = val;
                    else if (attrName === 'alan' || attrName.includes('yuzolcumu') || attrName.includes('yüzölçüm') || attrName.includes('alan_m2')) meta.alan = val;
                });

                // HTML etiketlerini ve &nbsp; temizleyip düz metin oluştur
                const rawCombined = (meta.name + '\n' + meta.description);
                const textToSearch = rawCombined
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/\s+/g, ' ');

                if (!meta.ada) {
                    const adaMatch = textToSearch.match(/ada\s*[:\-\/]?\s*([0-9]+)/i);
                    if (adaMatch) meta.ada = adaMatch[1];
                }
                if (!meta.parsel) {
                    const parselMatch = textToSearch.match(/parsel\s*[:\-\/]?\s*([0-9]+)/i);
                    if (parselMatch) meta.parsel = parselMatch[1];
                }
                if (!meta.ada && !meta.parsel && meta.name) {
                    const slashMatch = meta.name.match(/([0-9]+)\s*[\/\-]\s*([0-9]+)/);
                    if (slashMatch) {
                        meta.ada = slashMatch[1];
                        meta.parsel = slashMatch[2];
                    }
                }
                if (!meta.il) {
                    const ilMatch = textToSearch.match(/\bil\s*[:\-\/]?\s*([a-zA-ZçğıöşüÇĞİÖŞÜ]+)/i);
                    if (ilMatch && !['ilce', 'ilçe', 'mahalle', 'ada'].includes(ilMatch[1].toLowerCase())) meta.il = ilMatch[1].trim();
                }
                if (!meta.ilce) {
                    const ilceMatch = textToSearch.match(/il[cç]e\s*[:\-\/]?\s*([a-zA-ZçğıöşüÇĞİÖŞÜ]+)/i);
                    if (ilceMatch) meta.ilce = ilceMatch[1].trim();
                }
                if (!meta.mahalle) {
                    const mahMatch = textToSearch.match(/mahalle\s*[:\-\/]?\s*([a-zA-ZçğıöşüÇĞİÖŞÜ\s]+?)(?:ada|parsel|alan|nitelik|\n|$|,)/i);
                    if (mahMatch) meta.mahalle = mahMatch[1].trim();
                }
                if (!meta.alan) {
                    const alanMatch = textToSearch.match(/(?:alan|y[uü]z[oö]l[cç][uü]m[uü])\s*[:\-\/]?\s*([0-9.,]+)\s*(?:m2|m²)?/i);
                    if (alanMatch) meta.alan = alanMatch[1].trim();
                }
                if (!meta.nitelik) {
                    const nitelikMatch = textToSearch.match(/nitelik\s*[:\-\/]?\s*([a-zA-ZçğıöşüÇĞİÖŞÜ]+)/i);
                    if (nitelikMatch) meta.nitelik = nitelikMatch[1].trim();
                }
                if (!meta.mevkii) {
                    const mevkiiMatch = textToSearch.match(/mevki[i]?\s*[:\-\/]?\s*([a-zA-ZçğıöşüÇĞİÖŞÜ\s]+?)(?:ada|parsel|alan|nitelik|\n|$|,)/i);
                    if (mevkiiMatch) meta.mevkii = mevkiiMatch[1].trim();
                }

                if (meta.alan && !meta.alan.includes('m²') && !meta.alan.includes('m2')) {
                    meta.alan = meta.alan + ' m²';
                }

                return {
                    latLngs: allPoints,
                    ...meta
                };
            } catch(err) {
                console.error('KML okuma hatası:', err);
                throw err;
            }
        },

        /**
         * GeoJSON Metnini Ayrıştırır
         */
        parseGeoJsonText: function(geoJsonText) {
            try {
                const data = typeof geoJsonText === 'string' ? JSON.parse(geoJsonText) : geoJsonText;
                let feature = null;
                if (data.type === 'FeatureCollection' && Array.isArray(data.features) && data.features.length > 0) {
                    feature = data.features.find(f => f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon')) || data.features[0];
                } else if (data.type === 'Feature') {
                    feature = data;
                } else if (data.type === 'Polygon' || data.type === 'MultiPolygon') {
                    feature = { geometry: data, properties: {} };
                }

                if (!feature || !feature.geometry) {
                    throw new Error('GeoJSON dosyasında geometrik poligon verisi bulunamadı.');
                }

                let rawCoords = [];
                if (feature.geometry.type === 'Polygon') {
                    rawCoords = feature.geometry.coordinates[0] || [];
                } else if (feature.geometry.type === 'MultiPolygon') {
                    let maxRing = [];
                    (feature.geometry.coordinates || []).forEach(poly => {
                        if (poly && poly[0] && poly[0].length > maxRing.length) {
                            maxRing = poly[0];
                        }
                    });
                    rawCoords = maxRing;
                }

                const latLngs = [];
                rawCoords.forEach(pt => {
                    if (Array.isArray(pt) && pt.length >= 2) {
                        const lng = parseFloat(pt[0]);
                        const lat = parseFloat(pt[1]);
                        if (!isNaN(lat) && !isNaN(lng)) {
                            latLngs.push([lat, lng]);
                        }
                    }
                });

                if (latLngs.length < 3) {
                    throw new Error('GeoJSON koordinatları en az 3 nokta içermelidir.');
                }

                const props = feature.properties || {};
                let ada = props.ada || props.Ada || props.ADA || props.ada_no || props.adano || '';
                let parsel = props.parsel || props.Parsel || props.PARSEL || props.parsel_no || props.parselno || '';
                let il = props.il || props.İl || props.IL || props.il_ad || props.ilad || '';
                let ilce = props.ilce || props.İlçe || props.ILCE || props.ilce_ad || props.ilcead || '';
                let mahalle = props.mahalle || props.Mahalle || props.MAHALLE || props.mahalle_ad || props.mahallead || '';
                let alan = props.alan || props.Alan || props.ALAN || props.yuzolcumu || props.alan_m2 || '';
                if (alan && !String(alan).includes('m²')) alan = String(alan) + ' m²';

                return {
                    latLngs: latLngs,
                    ada: String(ada),
                    parsel: String(parsel),
                    il: String(il),
                    ilce: String(ilce),
                    mahalle: String(mahalle),
                    alan: String(alan),
                    name: props.name || (ada && parsel ? `${ada}/${parsel}` : 'TKGM Parseli'),
                    description: props.description || ''
                };
            } catch(err) {
                console.error('GeoJSON okuma hatası:', err);
                throw err;
            }
        },

        /**
         * Dosya Seçim Olayını Karşılar
         */
        handleSatelliteKmlUpload: function(e) {
            const file = e && e.target && e.target.files && e.target.files[0];
            if (!file) return;
            this.handleKmlFile(file);
            if (e.target) e.target.value = '';
        },

        /**
         * KML / GeoJSON Dosyasını Okur ve Yükler
         */
        handleKmlFile: function(file) {
            if (!file) return;
            const name = (file.name || '').toLowerCase();
            const isKml = name.endsWith('.kml');
            const isGeoJson = name.endsWith('.geojson') || name.endsWith('.json');
            const isKmz = name.endsWith('.kmz');

            if (isKmz) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('ℹ️ KMZ sıkıştırılmış arşivdir. Lütfen KMZ içindeki .kml dosyasını veya TKGM Parsel Sorgu KML çıktısını yükleyiniz.', 'info');
                } else {
                    alert('KMZ sıkıştırılmış arşivdir. Lütfen içindeki .kml dosyasını yükleyiniz.');
                }
                return;
            }

            if (!isKml && !isGeoJson) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('⚠️ Lütfen geçerli bir .kml veya .geojson dosyası seçin.', 'warning');
                } else {
                    alert('Lütfen geçerli bir .kml veya .geojson dosyası seçin.');
                }
                return;
            }

            const reader = new FileReader();
            reader.onload = (ev) => {
                const text = ev.target.result;
                try {
                    let parsed = null;
                    if (isGeoJson) {
                        parsed = this.parseGeoJsonText(text);
                    } else {
                        parsed = this.parseKmlText(text);
                    }

                    if (!parsed || !parsed.latLngs || parsed.latLngs.length < 3) {
                        throw new Error('Dosyada geçerli arsa koordinatları bulunamadı.');
                    }

                    this.loadParcelPolygon(parsed);
                } catch(err) {
                    console.error('Parsel dosyası işleme hatası:', err);
                    if (typeof window.showAppToast === 'function') {
                        window.showAppToast('❌ Parsel okunamadı: ' + (err.message || 'Geçersiz dosya'), 'error');
                    } else {
                        alert('Parsel okunamadı: ' + err.message);
                    }
                }
            };
            reader.onerror = () => {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('❌ Dosya okuma hatası oluştu.', 'error');
                }
            };
            reader.readAsText(file, 'UTF-8');
        },

        /**
         * Arsa Poligonunu Haritaya Ekler ve Arsanın Üzerine Uçar
         */
        loadParcelPolygon: function(parcelInfo) {
            if (!this.map) {
                this.initMap();
            }
            if (!this.map) return;

            this.parcelData = parcelInfo;

            // Eski poligon ve etiketi temizle
            if (this.parcelPolygon) {
                this.map.removeLayer(this.parcelPolygon);
                this.parcelPolygon = null;
            }
            if (this.parcelLabelMarker) {
                this.map.removeLayer(this.parcelLabelMarker);
                this.parcelLabelMarker = null;
            }

            const fillColor = this.parcelFillMode === 'nofill' ? 'transparent' : (this.parcelFillMode === 'white' ? '#ffffff' : (this.parcelFillColor || '#ffffff'));
            const fillOpacity = this.parcelFillMode === 'nofill' ? 0 : (this.parcelFillOpacity !== undefined ? this.parcelFillOpacity : 0.40);

            // Leaflet Polygon
            this.parcelPolygon = L.polygon(parcelInfo.latLngs, {
                color: this.parcelStrokeColor || '#ffffff',
                weight: this.parcelStrokeWidth || 3,
                opacity: 0.95,
                fillColor: fillColor,
                fillOpacity: fillOpacity,
                smoothFactor: 1.0,
                interactive: true
            }).addTo(this.map);

            // Hover / Click Popup
            const adaParselStr = (parcelInfo.ada && parcelInfo.parsel) ? `Ada: ${parcelInfo.ada} / Parsel: ${parcelInfo.parsel}` : (parcelInfo.name || 'TKGM Parseli');
            const locStr = [parcelInfo.il, parcelInfo.ilce, parcelInfo.mahalle].filter(Boolean).join(' • ');
            const popupContent = `
                <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif; min-width:140px; color:#0f172a; padding:4px;">
                    <div style="font-weight:700; font-size:13px; color:#0284c7; margin-bottom:2px;"><i class="fas fa-draw-polygon"></i> ${adaParselStr}</div>
                    ${locStr ? `<div style="font-size:11px; color:#64748b; margin-bottom:3px;">${locStr}</div>` : ''}
                    ${parcelInfo.alan ? `<div style="font-weight:600; font-size:12px; color:#10b981;">📐 ${parcelInfo.alan}</div>` : ''}
                </div>
            `;
            this.parcelPolygon.bindPopup(popupContent);

            // Parsel etiket rozetini çiz
            this.updateParcelLabelMarker();

            // Sınırları al ve haritayı arsanın üzerine uçur
            const bounds = this.parcelPolygon.getBounds();
            if (bounds.isValid()) {
                const center = bounds.getCenter();
                this.currentLat = center.lat;
                this.currentLng = center.lng;

                // 3D Harita Modu Aktifse 3D Kamerayı Parsele Uçur ve 3D Poligonu Çiz
                if (this.is3DActive && this.map3dElement) {
                    try {
                        this.map3dElement.setAttribute('center', `${center.lat},${center.lng},0`);
                        this.map3dElement.setAttribute('range', '650');
                        this.map3dElement.setAttribute('tilt', '45');
                        this.mount3DParcelPolygon(this.map3dElement);
                    } catch(e) {
                        console.warn("3D harita parsele odaklanma:", e);
                    }
                } else {
                    this.map.fitBounds(bounds, {
                        padding: [45, 45],
                        maxZoom: 19,
                        animate: true,
                        duration: 1.2
                    });
                }

                // Canlı konum pinini de arsanın merkezine yerleştir
                if (this.markerEnabled) {
                    this.setMarkerLatLng(center);
                }

                // Search barına ve alt bilgiye ada/parsel bilgisini yansıt
                const searchInput = document.getElementById('satSearchInput');
                if (searchInput) {
                    const locQuery = [parcelInfo.il, parcelInfo.ilce, parcelInfo.mahalle, adaParselStr].filter(Boolean).join(' ');
                    searchInput.value = locQuery;
                }

                this.updateFoundAddressBadge(adaParselStr + (locStr ? ' (' + locStr + ')' : ''));
                this.updateCoordsBadge();
            }

            this.updateParcelUI();

            // 🤖 Parsel Bilgilerini "Metni Süz" Alanına Otomatik Aktar, Süz ve Önerilen Rozetleri Aç
            this.syncParcelToSmartParser(parcelInfo);

            if (typeof window.showAppToast === 'function') {
                const toastTitle = (parcelInfo.ada && parcelInfo.parsel) 
                    ? `📐 Ada ${parcelInfo.ada} / Parsel ${parcelInfo.parsel} yüklendi!`
                    : `📐 TKGM Parsel haritada açıldı!`;
                const toastMsg = parcelInfo.alan ? `(${parcelInfo.alan})` : '';
                window.showAppToast(`${toastTitle} ${toastMsg}`, 'success');
            }
        },

        /**
         * 🤖 TKGM Parsel Bilgilerini "Metni Süz" Alanına Aktarır, Otomatik Süzdürür ve Önerileri Açar
         */
        syncParcelToSmartParser: function(parcelInfo) {
            const p = parcelInfo || this.parcelData;
            if (!p) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Önce bir TKGM KML veya Parsel dosyası yükleyin!', 'warning');
                }
                return;
            }

            const il = (p.il || '').trim();
            const ilce = (p.ilce || '').trim();
            const mahalle = (p.mahalle || '').trim();
            const ada = (p.ada || '').trim();
            const parsel = (p.parsel || '').trim();
            const alan = (p.alan || '').trim();
            const nitelik = (p.nitelik || 'Arsa').trim();
            const mevkii = (p.mevkii || '').trim();

            const locParts = [il, ilce, mahalle].filter(Boolean);
            const locStr = locParts.join(' / ');

            let lines = [];
            lines.push(`SATILIK ${nitelik.toLocaleUpperCase('tr-TR') || 'ARSA'}`);
            if (locStr) lines.push(`📍 Konum: ${locStr}`);
            if (mevkii) lines.push(`📌 Mevkii: ${mevkii}`);
            if (ada && parsel) {
                lines.push(`📐 Ada: ${ada} | Parsel: ${parsel}`);
            } else if (ada) {
                lines.push(`📐 Ada: ${ada}`);
            } else if (parsel) {
                lines.push(`📐 Parsel: ${parsel}`);
            }
            if (alan) lines.push(`📏 Toplam Alan: ${alan}`);
            lines.push(`🏷️ Nitelik: ${nitelik || 'Arsa'}`);
            lines.push(`📜 Tapu Durumu: Müstakil Parsel`);
            lines.push(`🛣️ Yola Cepheli, Değerli Lokasyonda Yatırımlık Fırsat Portföy`);
            lines.push(`✨ İmar ve altyapı olanaklarına uygun, gelişen bölgede prim potansiyeli yüksek arsa.`);

            const generatedText = lines.join('\n');

            // 1. aiText (Metni Süz) kutusunu doldur
            const aiTextEl = document.getElementById('aiText');
            if (aiTextEl) {
                aiTextEl.value = generatedText;
            }

            // 2. descInput (Açıklama) kutusunu da doldur
            const descInputEl = document.getElementById('descInput');
            if (descInputEl) {
                descInputEl.value = generatedText;
                if (typeof window.onDescInputChanged === 'function') {
                    window.onDescInputChanged();
                }
            }

            // 3. Sol ana sekmeyi 'data' (Giriş) sekmesine geçir
            if (typeof window.switchTab === 'function') {
                try {
                    window.switchTab('data');
                } catch(e) {
                    console.warn("switchTab('data') hatası:", e);
                }
            }

            // 4. Kategori ve form alanlarını doğrudan ve anında doldur
            const isTarla = nitelik.toLowerCase().includes('tarla') || nitelik.toLowerCase().includes('bağ') || nitelik.toLowerCase().includes('bahçe');
            const targetPropType = isTarla ? 'satilik_tarla' : 'satilik_arsa';
            if (typeof window.switchPropertyType === 'function') {
                try {
                    window.switchPropertyType(targetPropType);
                } catch(e) {}
            }

            const adaParselStr = (ada && parsel) ? `ADA: ${ada} / PARSEL: ${parsel}` : (ada ? `ADA: ${ada}` : (parsel ? `PARSEL: ${parsel}` : ''));
            const directFields = {
                'f_ada': ada,
                'f_parsel': parsel,
                'f_alan': alan,
                'f_m2': alan,
                'f_arsa': alan,
                'sizeInput': alan,
                'c_size': alan,
                'c_araziSize': alan,
                'f_konum': locStr,
                'locationInput': locStr,
                'f_imar': nitelik || 'Arsa',
                'adaParselInput': adaParselStr,
                'c_adaParsel': adaParselStr,
                'c_ada_parsel': adaParselStr
            };

            Object.keys(directFields).forEach(id => {
                const el = document.getElementById(id);
                if (el && directFields[id]) el.value = directFields[id];
            });

            // 5. Metni Süz fonksiyonunu otomatik çalıştır (SmartParserPro)
            if (typeof window.smartParse === 'function') {
                try {
                    window.smartParse();
                } catch(e) {
                    console.warn("smartParse hatası:", e);
                }
            } else if (window.SmartParserPro && typeof window.SmartParserPro.execute === 'function') {
                try {
                    window.SmartParserPro.execute();
                } catch(e) {
                    console.warn("SmartParserPro.execute hatası:", e);
                }
            }

            // 6. İlana Özel Hazır Rozetler & Öğeler üret ve accordion panelini AÇIK yap
            const payload = {
                title: `SATILIK ${nitelik.toLocaleUpperCase('tr-TR') || 'ARSA'}`,
                location: locStr,
                size: alan,
                ada: ada,
                parsel: parsel,
                imar: nitelik,
                type: targetPropType
            };
            if (typeof window.generateSmartSuggestions === 'function') {
                try {
                    window.generateSmartSuggestions(payload, generatedText);
                } catch(e) {}
            }
            if (typeof window.renderSmartSuggestionsUI === 'function') {
                try {
                    window.renderSmartSuggestionsUI();
                } catch(e) {}
            }
            if (typeof window.renderData === 'function') {
                try {
                    window.renderData();
                } catch(e) {}
            }

            // Accordion'ı kesin olarak açık hale getir
            const openSuggestionsAccordion = () => {
                if (typeof window.toggleSmartSuggestions === 'function') {
                    window.toggleSmartSuggestions(true);
                } else {
                    const body = document.getElementById('smartSuggestionsBody');
                    const chevron = document.getElementById('smartSuggestionsChevron');
                    if (body) {
                        body.style.display = 'block';
                        if (chevron) chevron.style.transform = 'rotate(180deg)';
                    }
                }
            };
            openSuggestionsAccordion();
            setTimeout(openSuggestionsAccordion, 200);
            setTimeout(openSuggestionsAccordion, 500);

            if (typeof window.showAppToast === 'function') {
                window.showAppToast('✨ TKGM Parsel bilgileri Metni Süz alanına aktarıldı, otomatik süzüldü ve önerilen rozetler açıldı!', 'success');
            }
        },

        /**
         * Yüklü Arsa Koordinatlarının Merkez ve Sınırlarını Döndürür
         */
        getParcelCenterAndBounds: function() {
            if (!this.parcelData || !this.parcelData.latLngs || this.parcelData.latLngs.length === 0) return null;
            let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
            this.parcelData.latLngs.forEach(pt => {
                const lat = Number(pt[0]);
                const lng = Number(pt[1]);
                if (lat < minLat) minLat = lat;
                if (lat > maxLat) maxLat = lat;
                if (lng < minLng) minLng = lng;
                if (lng > maxLng) maxLng = lng;
            });
            return {
                center: { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 },
                bounds: { minLat, maxLat, minLng, maxLng }
            };
        },

        /**
         * Hex veya renk değerini 8 basamaklı RGBA Hex (#RRGGBBAA) formatına çevirir (Google 3D Maps için zorunludur)
         */
        colorToHex8: function(color, opacity) {
            if (opacity === undefined || opacity === null) opacity = 0.50;
            let hex = (color || '#ffffff').toString().trim();
            if (hex.startsWith('#')) hex = hex.substring(1);
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            } else if (hex.length === 8) {
                return '#' + hex.toLowerCase();
            } else if (hex.length !== 6) {
                hex = 'ffffff';
            }
            const alphaInt = Math.round(Math.max(0, Math.min(1, opacity)) * 255);
            const alphaHex = alphaInt.toString(16).padStart(2, '0');
            return ('#' + hex + alphaHex).toLowerCase();
        },

        /**
         * Google 3D (<gmp-map-3d>) Üzerine Arsa Poligonunu Yerleştirir (Google Earth 3D Dolgu & Kenarlık)
         */
        mount3DParcelPolygon: async function(map3d) {
            if (!map3d) map3d = this.map3dElement;
            if (!map3d || !this.parcelData || !this.parcelData.latLngs || this.parcelData.latLngs.length < 3) return;
            try {
                // Eski 3D poligonları temizle
                const existing = map3d.querySelectorAll('gmp-polygon-3d');
                existing.forEach(el => { try { el.remove(); } catch(e){} });

                // Köşe koordinatlarını hazırla
                const rawPts = this.parcelData.latLngs;
                const coords = [];
                for (let i = 0; i < rawPts.length; i++) {
                    const pt = rawPts[i];
                    const lat = Number(Array.isArray(pt) ? pt[0] : (pt.lat !== undefined ? pt.lat : pt[0]));
                    const lng = Number(Array.isArray(pt) ? pt[1] : (pt.lng !== undefined ? pt.lng : pt[1]));
                    if (!isNaN(lat) && !isNaN(lng)) {
                        coords.push({ lat, lng, altitude: 0 });
                    }
                }
                if (coords.length < 3) return;

                // İlk ve son nokta aynıysa kapatma noktasını temizle (Google Maps 3D poligonu otomatik kapatır)
                if (coords.length > 3) {
                    const first = coords[0];
                    const last = coords[coords.length - 1];
                    if (Math.abs(first.lat - last.lat) < 1e-7 && Math.abs(first.lng - last.lng) < 1e-7) {
                        coords.pop();
                    }
                }

                // Winding sırasını counter-clockwise (saat yönünün tersi) yap
                // WebGL'de saat yönü poligonların normal yüzü aşağı baktığı için dolgu görünmez!
                let sum = 0;
                for (let i = 0; i < coords.length; i++) {
                    const c1 = coords[i];
                    const c2 = coords[(i + 1) % coords.length];
                    sum += (c2.lng - c1.lng) * (c2.lat + c1.lat);
                }
                const orientedCoords = (sum > 0) ? coords.slice().reverse() : coords;

                // Dolgu ve Kenarlık Renkleri (Google 3D Maps katı #RRGGBBAA hex standardı)
                const isNeon3d = !!this.parcelNeonEnabled;
                const neonColor = this.parcelNeonColor || '#00CEC9';
                const opacity = (this.parcelFillOpacity !== undefined ? this.parcelFillOpacity : (isNeon3d ? 0.35 : 0.50));

                let fillHex8 = '#ffffff80';
                if (this.parcelFillMode === 'nofill') {
                    fillHex8 = '#ffffff00'; // Tam saydam dolgusuz
                } else if (this.parcelFillMode === 'color') {
                    fillHex8 = this.colorToHex8(this.parcelFillColor || '#f59e0b', opacity);
                } else {
                    // Neon aktifse dolgu da neon renginde olsun, beyaz olmasın
                    fillHex8 = this.colorToHex8(isNeon3d ? neonColor : '#ffffff', opacity);
                }

                const strokeColorHex = this.colorToHex8(isNeon3d ? neonColor : (this.parcelStrokeColor || '#ffffff'), 1.0);
                const strokeWidthNum = Math.max(isNeon3d ? 4 : 1, Number(this.parcelStrokeWidth) || 3);

                // AltitudeMode: CLAMP_TO_GROUND arazi kabartmasına yapışmayı sağlar
                let altModeObj = 'CLAMP_TO_GROUND';
                if (window.google && window.google.maps && window.google.maps.maps3d && window.google.maps.maps3d.AltitudeMode) {
                    altModeObj = window.google.maps.maps3d.AltitudeMode.CLAMP_TO_GROUND || 'CLAMP_TO_GROUND';
                }

                let poly3d = null;
                if (window.google && window.google.maps && window.google.maps.maps3d && typeof window.google.maps.maps3d.Polygon3DElement === 'function') {
                    try {
                        poly3d = new window.google.maps.maps3d.Polygon3DElement({
                            altitudeMode: altModeObj,
                            fillColor: fillHex8,
                            strokeColor: strokeColorHex,
                            strokeWidth: strokeWidthNum,
                            extruded: false,
                            drawsOccludedSegments: true
                        });
                        poly3d.path = orientedCoords;
                        poly3d.outerCoordinates = orientedCoords;
                        poly3d.coordinates = orientedCoords;
                    } catch(elemErr) {
                        console.warn('Polygon3DElement oluşturma fallback:', elemErr);
                    }
                }

                if (!poly3d || !(poly3d instanceof Node)) {
                    poly3d = document.createElement('gmp-polygon-3d');
                }

                // Hem HTML attribute hem DOM property olarak tanımla (çift güvence)
                poly3d.setAttribute('altitude-mode', 'clamp-to-ground');
                poly3d.setAttribute('fill-color', fillHex8);
                poly3d.setAttribute('stroke-color', strokeColorHex);
                poly3d.setAttribute('stroke-width', strokeWidthNum.toString());
                poly3d.setAttribute('draws-occluded-segments', '');

                poly3d.altitudeMode = altModeObj;
                poly3d.fillColor = fillHex8;
                poly3d.strokeColor = strokeColorHex;
                poly3d.strokeWidth = strokeWidthNum;
                poly3d.extruded = false;
                poly3d.path = orientedCoords;
                poly3d.outerCoordinates = orientedCoords;
                poly3d.coordinates = orientedCoords;

                map3d.appendChild(poly3d);
            } catch(err) {
                console.warn('Google 3D polygon yerleştirme hatası:', err);
            }
        },

        /**
         * Arsa Dolgu Modunu Değiştirir ('white' | 'color' | 'nofill')
         */
        setParcelFillMode: function(mode) {
            this.parcelFillMode = mode;
            this.updateParcelPolygonStyle();
            this.updateParcelUI();
        },

        /**
         * Arsa Dolgu Rengini Değiştirir
         */
        setParcelColor: function(color) {
            this.parcelFillColor = color;
            this.parcelFillMode = 'color';
            this.updateParcelPolygonStyle();
            this.updateParcelUI();
        },

        /**
         * Arsa Dolgu Opaklığını Ayarlar (0-100)
         */
        setParcelOpacity: function(val) {
            this.parcelFillOpacity = parseFloat(val) / 100;
            this.updateParcelPolygonStyle();
            const opVal = document.getElementById('satParcelOpacityVal');
            if (opVal) opVal.textContent = `%${val}`;
        },

        /**
         * Kenar Çizgisi Rengini Ayarlar
         */
        setParcelStrokeColor: function(color) {
            this.parcelStrokeColor = color;
            this.updateParcelPolygonStyle();
        },

        /**
         * Kenar Çizgisi Kalınlığını Slider ile Ayarlar (1px - 10px)
         */
        setParcelStrokeWidth: function(width) {
            this.parcelStrokeWidth = Math.max(0.5, Math.min(15, parseFloat(width) || 3));
            const strokeVal = document.getElementById('satParcelStrokeWidthVal');
            if (strokeVal) {
                strokeVal.textContent = `${this.parcelStrokeWidth}px`;
            }
            const strokeSlider = document.getElementById('satParcelStrokeWidthSlider');
            if (strokeSlider && parseFloat(strokeSlider.value) !== this.parcelStrokeWidth) {
                strokeSlider.value = this.parcelStrokeWidth;
            }
            this.updateParcelPolygonStyle();
        },

        /**
         * Ada/Parsel Rozetini Açıp Kapatır
         */
        toggleParcelLabel: function(show) {
            this.parcelShowLabel = !!show;
            this.updateParcelLabelMarker();
        },

        /**
         * Leaflet Poligonunun Stilini Anlık Günceller
         */
        updateParcelPolygonStyle: function() {
            if (this.parcelPolygon) {
                const isNeon = !!this.parcelNeonEnabled;
                const neonColor = this.parcelNeonColor || '#00CEC9';
                const strokeColor = isNeon ? neonColor : (this.parcelStrokeColor || '#ffffff');
                const strokeWidth = isNeon ? Math.max(3.5, this.parcelStrokeWidth || 3) : (this.parcelStrokeWidth || 3);

                let fillColor = 'transparent';
                let fillOpacity = 0;
                if (this.parcelFillMode === 'nofill') {
                    fillColor = 'transparent';
                    fillOpacity = 0;
                } else if (this.parcelFillMode === 'color') {
                    fillColor = this.parcelFillColor || '#f59e0b';
                    fillOpacity = this.parcelFillOpacity !== undefined ? this.parcelFillOpacity : 0.40;
                } else {
                    fillColor = isNeon ? neonColor : '#ffffff';
                    fillOpacity = this.parcelFillOpacity !== undefined ? this.parcelFillOpacity : (isNeon ? 0.35 : 0.40);
                }

                this.parcelPolygon.setStyle({
                    color: strokeColor,
                    weight: strokeWidth,
                    fillColor: fillColor,
                    fillOpacity: fillOpacity
                });

                // Canlı Leaflet SVG path neon efekti
                if (this.parcelPolygon._path) {
                    if (isNeon) {
                        this.parcelPolygon._path.style.filter = `drop-shadow(0 0 6px ${neonColor}) drop-shadow(0 0 14px ${neonColor})`;
                        this.parcelPolygon._path.style.transition = 'filter 0.3s ease, stroke 0.3s ease';
                    } else {
                        this.parcelPolygon._path.style.filter = '';
                    }
                }
            }
            if (this.is3DActive && this.map3dElement) {
                this.mount3DParcelPolygon(this.map3dElement);
            }
        },

        /**
         * Leaflet Haritası Üzerindeki Ada/Parsel Bilgi Rozetini Günceller
         * (Kullanıcı talebi: Ekranda tek bir taşınabilir bilgi penceresi yeterlidir, arsa üzerinde mükerrer marker basılmaz)
         */
        updateParcelLabelMarker: function() {
            if (this.parcelLabelMarker && this.map) {
                this.map.removeLayer(this.parcelLabelMarker);
                this.parcelLabelMarker = null;
            }
        },

        /**
         * Harita Üzerindeki Ada/Parsel Bilgi Kartının Sürüklenmesini Sağlar (Drag & Drop)
         */
        initFloatingParcelDrag: function() {
            const el = document.getElementById('satFloatingParcelInfo');
            const stage = document.getElementById('satMapStage');
            if (!el || !stage || el._dragInitialized) return;
            el._dragInitialized = true;

            let isDragging = false;
            let startX = 0, startY = 0;
            let initialLeft = 0, initialTop = 0;

            const onPointerDown = (e) => {
                if (e.target.closest('.sat-float-btn') || e.target.closest('.sat-float-resizer') || e.target.closest('.sat-color-popover')) return;
                isDragging = true;
                el.style.cursor = 'grabbing';
                el.style.width = 'max-content';
                el.style.whiteSpace = 'nowrap';
                const rect = el.getBoundingClientRect();
                const stageRect = stage.getBoundingClientRect();

                initialLeft = rect.left - stageRect.left;
                initialTop = rect.top - stageRect.top;
                el.style.left = initialLeft + 'px';
                el.style.top = initialTop + 'px';
                el.style.right = 'auto';

                startX = e.clientX;
                startY = e.clientY;

                window.addEventListener('pointermove', onPointerMove);
                window.addEventListener('pointerup', onPointerUp);
                e.preventDefault();
            };

            const onPointerMove = (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                const stageRect = stage.getBoundingClientRect();
                const elRect = el.getBoundingClientRect();

                let newLeft = initialLeft + dx;
                let newTop = initialTop + dy;

                const maxLeft = Math.max(10, Math.floor(stageRect.width - elRect.width - 12));
                const maxTop = Math.max(10, Math.floor(stageRect.height - elRect.height - 12));

                newLeft = Math.max(10, Math.min(newLeft, maxLeft));
                newTop = Math.max(10, Math.min(newTop, maxTop));

                el.style.left = newLeft + 'px';
                el.style.top = newTop + 'px';
                el.style.right = 'auto';

                SatelliteMapModule.floatingParcelPos = {
                    relX: newLeft / stageRect.width,
                    relY: newTop / stageRect.height
                };
            };

            const onPointerUp = () => {
                if (!isDragging) return;
                isDragging = false;
                el.style.cursor = 'grab';
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
            };

            el.addEventListener('pointerdown', onPointerDown);
        },

        /**
         * Arsa ile İlgili Tüm Arayüz Bileşenlerini (Toolbar, Floating Badge, Drawer) Günceller
         */
        updateParcelUI: function() {
            const hasParcel = !!(this.parcelData && this.parcelData.latLngs && this.parcelData.latLngs.length >= 3);
            const p = this.parcelData;

            // 1. Toolbar Badge
            const badge = document.getElementById('satParcelLoadedBadge');
            const badgeText = document.getElementById('satParcelBadgeText');
            if (badge && badgeText) {
                if (hasParcel) {
                    badge.style.display = 'inline-flex';
                    badgeText.textContent = (p.ada && p.parsel) ? `Ada: ${p.ada} / Parsel: ${p.parsel}` : (p.name || 'Parsel Yüklü');
                } else {
                    badge.style.display = 'none';
                }
            }

            // 2. Floating on-map info (Taşınabilir Tekil Parsel Rozeti - Köşeden Boyutlandırılabilir)
            const floatInfo = document.getElementById('satFloatingParcelInfo');
            if (floatInfo) {
                if (hasParcel && this.parcelShowLabel) {
                    floatInfo.style.display = 'flex';
                    const locStr = [p.il, p.ilce, p.mahalle].filter(Boolean).join(' / ');
                    const apStr = (p.ada && p.parsel) ? `Ada ${p.ada} • Parsel ${p.parsel}` : (p.name || 'TKGM Parsel');
                    floatInfo.innerHTML = `
                        <div class="sat-drag-handle-grip" title="Sürükleyerek İstediğiniz Yere Taşıyın">
                            <i class="fas fa-grip-vertical"></i>
                        </div>
                        <div class="sat-float-icon"><i class="fas fa-location-dot"></i></div>
                        <div class="sat-float-body">
                            <span class="sat-float-title">${apStr}</span>
                            <span class="sat-float-sub">${locStr ? locStr : (p.alan || 'TKGM Parsel')}</span>
                        </div>
                        <div class="sat-float-actions-group">
                            <button type="button" class="sat-float-btn sat-float-neon-btn ${this.parcelNeonEnabled ? 'active' : ''}" onclick="window.toggleSatelliteParcelNeon(event)" title="⚡ Saber Neon Efektini Aç/Kapat" id="satFloatNeonBtn"><i class="fas fa-bolt"></i></button>
                            <button type="button" class="sat-float-btn" onclick="window.toggleParcelColorPicker(event)" title="Renk & Stil Ayarları" id="satFloatColorBtn"><i class="fas fa-palette"></i></button>
                            <button type="button" class="sat-float-btn" onclick="window.zoomToCurrentParcel()" title="Parseli Ortala"><i class="fas fa-crosshairs"></i></button>
                            <button type="button" class="sat-float-btn remove" onclick="window.clearSatelliteParcel()" title="Parseli Kaldır"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="sat-float-resizer" title="Köşeden Çekerek Boyutlandır"></div>
                    `;
                    floatInfo.classList.remove('sat-theme-cyan', 'sat-theme-gold', 'sat-theme-emerald', 'sat-theme-dark');
                    floatInfo.classList.add('sat-theme-' + (this.parcelBadgeTheme || 'gold'));
                    floatInfo.style.transform = `scale(${this.parcelBadgeScale || 1.0})`;
                    floatInfo.style.transformOrigin = 'top left';

                    if (!this.floatingParcelPos) {
                        floatInfo.style.top = '14px';
                        floatInfo.style.left = '70px';
                        floatInfo.style.right = 'auto';
                        floatInfo.style.bottom = 'auto';
                    }
                    if (this.parcelBadgeCustomColors) {
                        this.applyCustomColorsToDOM();
                    } else {
                        floatInfo.style.background = '';
                        floatInfo.style.borderColor = '';
                        floatInfo.style.borderWidth = '';
                    }
                    this.initFloatingParcelDrag();
                    this.initFloatingParcelResize();
                } else {
                    floatInfo.style.display = 'none';
                    floatInfo.innerHTML = '';
                    this.closeParcelColorPicker();
                }
            }

            // 3. Drawer Card
            const drawerCard = document.getElementById('satDrawerParcelInfo');
            if (drawerCard) {
                if (hasParcel) {
                    drawerCard.style.display = 'block';
                    const cityEl = document.getElementById('satDrawerParcelCity');
                    const nbrEl = document.getElementById('satDrawerParcelNeighborhood');
                    const apEl = document.getElementById('satDrawerParcelAdaParsel');
                    const areaEl = document.getElementById('satDrawerParcelArea');
                    if (cityEl) cityEl.textContent = [p.il, p.ilce].filter(Boolean).join(' / ') || '-';
                    if (nbrEl) nbrEl.textContent = p.mahalle || '-';
                    if (apEl) apEl.textContent = (p.ada && p.parsel) ? `${p.ada} / ${p.parsel}` : (p.name || '-');
                    if (areaEl) areaEl.textContent = p.alan || '-';
                } else {
                    drawerCard.style.display = 'none';
                }
            }

            // 4. Fill mode buttons
            const fillBtns = document.querySelectorAll('#satFillModeBtns .sat-fill-btn');
            fillBtns.forEach(btn => {
                if (btn.dataset.mode === this.parcelFillMode) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // 5. Color Palette visibility
            const colorGroup = document.getElementById('satParcelColorGroup');
            if (colorGroup) {
                colorGroup.style.display = this.parcelFillMode === 'color' ? 'block' : 'none';
            }

            // 6. Opacity group visibility
            const opGroup = document.getElementById('satParcelOpacityGroup');
            if (opGroup) {
                opGroup.style.display = this.parcelFillMode === 'nofill' ? 'none' : 'block';
            }

            const opSlider = document.getElementById('satParcelOpacitySlider');
            const opVal = document.getElementById('satParcelOpacityVal');
            if (opSlider && opVal) {
                const valPct = Math.round((this.parcelFillOpacity !== undefined ? this.parcelFillOpacity : 0.40) * 100);
                opSlider.value = valPct;
                opVal.textContent = `%${valPct}`;
            }

            // 7. Stroke width slider & badge
            const strokeSlider = document.getElementById('satParcelStrokeWidthSlider');
            const strokeVal = document.getElementById('satParcelStrokeWidthVal');
            if (strokeSlider && strokeVal) {
                const sw = this.parcelStrokeWidth || 3;
                strokeSlider.value = sw;
                strokeVal.textContent = `${sw}px`;
            }

            // 8. Show label checkbox, scale & theme
            const labelChk = document.getElementById('satParcelShowLabelCheck');
            if (labelChk) {
                labelChk.checked = !!this.parcelShowLabel;
            }
            const scaleSlider = document.getElementById('satParcelBadgeScaleSlider');
            const scaleVal = document.getElementById('satParcelBadgeScaleVal');
            if (scaleSlider && scaleVal) {
                scaleSlider.value = this.parcelBadgeScale || 1.0;
                scaleVal.textContent = `${(this.parcelBadgeScale || 1.0).toFixed(2)}x`;
            }
            document.querySelectorAll('#satBadgeThemeBtns .sat-theme-chip').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === (this.parcelBadgeTheme || 'gold'));
            });

            // 9. Saber Neon Ayarları UI Senkronizasyonu
            this.updateParcelNeonUI();
        },

        /**
         * Harita Üzerindeki Ada/Parsel Rozetinin Köşeden Tutularak Boyutlandırılmasını Sağlar
         */
        initFloatingParcelResize: function() {
            const el = document.getElementById('satFloatingParcelInfo');
            if (!el) return;
            const resizer = el.querySelector('.sat-float-resizer');
            if (!resizer || resizer._resizeInitialized) return;
            resizer._resizeInitialized = true;

            let isResizing = false;
            let startX = 0;
            let startScale = 1.0;

            const onPointerDown = (e) => {
                isResizing = true;
                startX = e.clientX;
                startScale = SatelliteMapModule.parcelBadgeScale || 1.0;
                e.stopPropagation();
                e.preventDefault();
                window.addEventListener('pointermove', onPointerMove);
                window.addEventListener('pointerup', onPointerUp);
            };

            const onPointerMove = (e) => {
                if (!isResizing) return;
                const dx = e.clientX - startX;
                let newScale = startScale + (dx / 160);
                newScale = Math.max(0.6, Math.min(2.2, Math.round(newScale * 20) / 20));
                SatelliteMapModule.setFloatingParcelScale(newScale);

                const stage = document.getElementById('satMapStage');
                if (stage) {
                    const stageRect = stage.getBoundingClientRect();
                    const elRect = el.getBoundingClientRect();
                    if (elRect.right > stageRect.right - 10) {
                        const shift = elRect.right - (stageRect.right - 10);
                        const curLeft = parseFloat(el.style.left) || 16;
                        const adjustedLeft = Math.max(10, curLeft - shift);
                        el.style.left = adjustedLeft + 'px';
                        SatelliteMapModule.floatingParcelPos = {
                            relX: adjustedLeft / stageRect.width,
                            relY: (parseFloat(el.style.top) || 16) / stageRect.height
                        };
                    }
                }
            };

            const onPointerUp = () => {
                if (!isResizing) return;
                isResizing = false;
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
            };

            resizer.addEventListener('pointerdown', onPointerDown);
        },

        /**
         * Taşınabilir Parsel Rozetinin Boyutunu Ayarlar (0.6x - 2.2x)
         */
        setFloatingParcelScale: function(valOrDelta) {
            let newScale = this.parcelBadgeScale || 1.0;
            if (typeof valOrDelta === 'string' || (typeof valOrDelta === 'number' && valOrDelta >= 0.4)) {
                newScale = parseFloat(valOrDelta);
            } else if (typeof valOrDelta === 'number') {
                newScale += valOrDelta;
            }
            newScale = Math.max(0.6, Math.min(2.2, Math.round(newScale * 20) / 20));
            this.parcelBadgeScale = newScale;

            const floatInfo = document.getElementById('satFloatingParcelInfo');
            if (floatInfo) {
                floatInfo.style.transform = `scale(${newScale})`;
                floatInfo.style.transformOrigin = 'top left';
            }
            const slider = document.getElementById('satParcelBadgeScaleSlider');
            if (slider) slider.value = newScale;
            const badge = document.getElementById('satParcelBadgeScaleVal');
            if (badge) badge.textContent = `${newScale.toFixed(2)}x`;
        },

        /**
         * Rozet Renk & Stil Popoverını Açar / Kapatır
         */
        toggleParcelColorPicker: function(e) {
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }
            const existing = document.getElementById('satParcelColorPopover');
            if (existing) {
                this.closeParcelColorPicker();
            } else {
                this.openParcelColorPicker();
            }
        },

        openParcelColorPicker: function() {
            this.closeParcelColorPicker();
            const floatInfo = document.getElementById('satFloatingParcelInfo');
            const stage = document.getElementById('satMapStage') || document.body;
            if (!floatInfo || !stage) return;

            const popover = document.createElement('div');
            popover.id = 'satParcelColorPopover';
            popover.className = 'sat-color-popover';

            const curColors = this.parcelBadgeCustomColors || this.getThemeDefaultColors(this.parcelBadgeTheme || 'gold');

            popover.innerHTML = `
                <div class="sat-popover-header">
                    <span><i class="fas fa-palette" style="color:#eab308; margin-right:6px;"></i>Rozet Renk & Kenarlık</span>
                    <button type="button" class="sat-popover-close" onclick="window.closeParcelColorPicker()">&times;</button>
                </div>
                <div class="sat-popover-section">
                    <label class="sat-popover-label">Hazır Renk Temaları</label>
                    <div class="sat-popover-theme-grid">
                        <button type="button" class="sat-theme-chip ${(this.parcelBadgeTheme || 'gold') === 'gold' ? 'active' : ''}" onclick="window.applyParcelPresetTheme('gold')">🟡 Altın Lüks</button>
                        <button type="button" class="sat-theme-chip ${this.parcelBadgeTheme === 'cyan' ? 'active' : ''}" onclick="window.applyParcelPresetTheme('cyan')">🔵 Neon Mavi</button>
                        <button type="button" class="sat-theme-chip ${this.parcelBadgeTheme === 'emerald' ? 'active' : ''}" onclick="window.applyParcelPresetTheme('emerald')">🟢 Zümrüt Yeşili</button>
                        <button type="button" class="sat-theme-chip ${this.parcelBadgeTheme === 'dark' ? 'active' : ''}" onclick="window.applyParcelPresetTheme('dark')">⚫ Gece Matı</button>
                    </div>
                </div>
                <div class="sat-popover-section" style="margin-top:10px;">
                    <label class="sat-popover-label">Özel Renk İnce Ayarları</label>
                    <div class="sat-color-row">
                        <span>Zemin Rengi</span>
                        <input type="color" id="satCustomBgColor" value="${curColors.bgHex || '#0f172a'}" oninput="window.updateParcelCustomStyle()">
                    </div>
                    <div class="sat-color-row">
                        <span>Zemin Opaklık (%<span id="satCustomBgOpVal">${Math.round((curColors.bgOpacity !== undefined ? curColors.bgOpacity : 0.94) * 100)}</span>)</span>
                        <input type="range" id="satCustomBgOpacity" min="20" max="100" value="${Math.round((curColors.bgOpacity !== undefined ? curColors.bgOpacity : 0.94) * 100)}" oninput="window.updateParcelCustomStyle()" style="width:90px;">
                    </div>
                    <div class="sat-color-row">
                        <span>Başlık Yazı Rengi</span>
                        <input type="color" id="satCustomTitleColor" value="${curColors.titleColor || '#fef08a'}" oninput="window.updateParcelCustomStyle()">
                    </div>
                    <div class="sat-color-row">
                        <span>Alt Bilgi Yazı Rengi</span>
                        <input type="color" id="satCustomSubColor" value="${curColors.subColor || '#e2e8f0'}" oninput="window.updateParcelCustomStyle()">
                    </div>
                    <div class="sat-color-row">
                        <span>Çerçeve / Kenar Rengi</span>
                        <input type="color" id="satCustomBorderColor" value="${curColors.borderColor || '#eab308'}" oninput="window.updateParcelCustomStyle()">
                    </div>
                    <div class="sat-color-row">
                        <span>Kenarlık Kalınlığı (<span id="satCustomBorderWVal">${curColors.borderWidth !== undefined ? curColors.borderWidth : 2}</span>px)</span>
                        <input type="range" id="satCustomBorderWidth" min="0" max="6" value="${curColors.borderWidth !== undefined ? curColors.borderWidth : 2}" oninput="window.updateParcelCustomStyle()" style="width:90px;">
                    </div>
                </div>
            `;

            stage.appendChild(popover);

            const infoRect = floatInfo.getBoundingClientRect();
            const stageRect = stage.getBoundingClientRect();

            let left = infoRect.left - stageRect.left;
            let top = infoRect.bottom - stageRect.top + 8;

            if (left + 295 > stageRect.width) {
                left = Math.max(10, stageRect.width - 300);
            }
            if (top + 330 > stageRect.height) {
                top = Math.max(10, infoRect.top - stageRect.top - 335);
            }

            popover.style.left = left + 'px';
            popover.style.top = top + 'px';
        },

        closeParcelColorPicker: function() {
            const existing = document.getElementById('satParcelColorPopover');
            if (existing) {
                existing.remove();
            }
        },

        getThemeDefaultColors: function(theme) {
            switch(theme) {
                case 'gold':
                    return { bgHex: '#0f172a', bgOpacity: 0.94, titleColor: '#fef08a', subColor: '#fde047', borderColor: '#eab308', borderWidth: 2 };
                case 'cyan':
                    return { bgHex: '#0f172a', bgOpacity: 0.94, titleColor: '#ffffff', subColor: '#38bdf8', borderColor: '#0284c7', borderWidth: 2 };
                case 'emerald':
                    return { bgHex: '#022c22', bgOpacity: 0.94, titleColor: '#ecfdf5', subColor: '#34d399', borderColor: '#10b981', borderWidth: 2 };
                case 'dark':
                    return { bgHex: '#18181b', bgOpacity: 0.95, titleColor: '#ffffff', subColor: '#a1a1aa', borderColor: '#52525b', borderWidth: 1.5 };
                default:
                    return { bgHex: '#0f172a', bgOpacity: 0.94, titleColor: '#fef08a', subColor: '#fde047', borderColor: '#eab308', borderWidth: 2 };
            }
        },

        applyParcelPresetTheme: function(theme) {
            this.parcelBadgeTheme = theme;
            this.parcelBadgeCustomColors = this.getThemeDefaultColors(theme);
            this.applyCustomColorsToDOM();
            this.openParcelColorPicker();
        },

        updateParcelCustomStyle: function() {
            const bgHex = document.getElementById('satCustomBgColor')?.value || '#0f172a';
            const bgOpPct = parseInt(document.getElementById('satCustomBgOpacity')?.value || '94', 10);
            const bgOpacity = bgOpPct / 100;
            const titleColor = document.getElementById('satCustomTitleColor')?.value || '#ffffff';
            const subColor = document.getElementById('satCustomSubColor')?.value || '#cbd5e1';
            const borderColor = document.getElementById('satCustomBorderColor')?.value || '#eab308';
            const borderWidth = parseInt(document.getElementById('satCustomBorderWidth')?.value || '2', 10);

            const opValEl = document.getElementById('satCustomBgOpVal');
            if (opValEl) opValEl.textContent = bgOpPct;
            const bwValEl = document.getElementById('satCustomBorderWVal');
            if (bwValEl) bwValEl.textContent = borderWidth;

            this.parcelBadgeCustomColors = {
                bgHex,
                bgOpacity,
                titleColor,
                subColor,
                borderColor,
                borderWidth
            };

            this.applyCustomColorsToDOM();
        },

        applyCustomColorsToDOM: function() {
            const floatInfo = document.getElementById('satFloatingParcelInfo');
            if (!floatInfo) return;
            const c = this.parcelBadgeCustomColors;
            if (!c) {
                floatInfo.style.background = '';
                floatInfo.style.borderColor = '';
                floatInfo.style.borderWidth = '';
                return;
            }

            let r = 15, g = 23, b = 42;
            if (c.bgHex && c.bgHex.startsWith('#') && c.bgHex.length === 7) {
                r = parseInt(c.bgHex.slice(1, 3), 16);
                g = parseInt(c.bgHex.slice(3, 5), 16);
                b = parseInt(c.bgHex.slice(5, 7), 16);
            }
            floatInfo.style.background = `rgba(${r}, ${g}, ${b}, ${c.bgOpacity !== undefined ? c.bgOpacity : 0.94})`;
            floatInfo.style.borderColor = c.borderColor || '#eab308';
            floatInfo.style.borderWidth = (c.borderWidth !== undefined ? c.borderWidth : 2) + 'px';
            floatInfo.style.borderStyle = (c.borderWidth === 0) ? 'none' : 'solid';

            const titleEl = floatInfo.querySelector('.sat-float-title');
            if (titleEl && c.titleColor) {
                titleEl.style.color = c.titleColor;
            }
            const subEl = floatInfo.querySelector('.sat-float-sub');
            if (subEl && c.subColor) {
                subEl.style.color = c.subColor;
            }
            const iconEl = floatInfo.querySelector('.sat-float-icon');
            if (iconEl && c.borderColor) {
                iconEl.style.color = c.borderColor;
            }
        },

        /**
         * Taşınabilir Parsel Rozetinin Renk Temasını Ayarlar
         */
        setFloatingParcelTheme: function(theme) {
            const validThemes = ['cyan', 'gold', 'emerald', 'dark'];
            this.parcelBadgeTheme = validThemes.includes(theme) ? theme : 'gold';
            const floatInfo = document.getElementById('satFloatingParcelInfo');
            if (floatInfo) {
                floatInfo.classList.remove('sat-theme-cyan', 'sat-theme-gold', 'sat-theme-emerald', 'sat-theme-dark');
                floatInfo.classList.add('sat-theme-' + this.parcelBadgeTheme);
            }
            document.querySelectorAll('#satBadgeThemeBtns .sat-theme-chip').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === this.parcelBadgeTheme);
            });
        },

        /**
         * Hızlı Butonla Parsel Temasını Döndürür
         */
        toggleFloatingParcelTheme: function() {
            const list = ['cyan', 'gold', 'emerald', 'dark'];
            const curIdx = list.indexOf(this.parcelBadgeTheme || 'gold');
            const nextTheme = list[(curIdx + 1) % list.length];
            this.setFloatingParcelTheme(nextTheme);
        },

        /**
         * Arsa Parselini Haritadan Temizler
         */
        clearParcel: function() {
            if (this.parcelPolygon && this.map) {
                this.map.removeLayer(this.parcelPolygon);
                this.parcelPolygon = null;
            }
            if (this.parcelLabelMarker && this.map) {
                this.map.removeLayer(this.parcelLabelMarker);
                this.parcelLabelMarker = null;
            }
            if (this.map3dElement) {
                const existing = this.map3dElement.querySelectorAll('gmp-polygon-3d');
                existing.forEach(el => { try { el.remove(); } catch(e){} });
            }
            this.parcelData = null;
            this.floatingParcelPos = null;
            this.updateParcelUI();

            if (typeof window.showAppToast === 'function') {
                window.showAppToast('📐 Arsa parseli haritadan kaldırıldı.', 'info');
            }
        },

        /**
         * Yüklü Parsele Odaklanır (Zoom)
         */
        zoomToCurrentParcel: function() {
            if (this.parcelData && this.parcelData.latLngs && this.parcelData.latLngs.length >= 3) {
                const bounds = this.getParcelCenterAndBounds();
                if (bounds && bounds.center) {
                    if (this.is3DActive && this.map3dElement) {
                        this.map3dElement.setAttribute('center', `${bounds.center.lat},${bounds.center.lng},0`);
                        this.map3dElement.setAttribute('range', '650');
                        this.map3dElement.setAttribute('tilt', '45');
                        this.mount3DParcelPolygon(this.map3dElement);
                        return;
                    }
                }
            }
            if (this.parcelPolygon && this.map) {
                const bounds = this.parcelPolygon.getBounds();
                if (bounds.isValid()) {
                    this.map.fitBounds(bounds, { padding: [45, 45], maxZoom: 19, animate: true, duration: 1.0 });
                }
            }
        },

        /**
         * Hamburger Hızlı Ayarlar Çekmecesini Açar / Kapatır
         */
        toggleSettingsDrawer: function(forceState) {
            const drawer = document.getElementById('satSettingsDrawer');
            const btn = document.getElementById('satHamburgerBtn');
            const fabBtn = document.getElementById('satFabHamburgerBtn');
            if (!drawer) return;

            if (typeof forceState === 'boolean') {
                this.isSettingsDrawerOpen = forceState;
            } else {
                this.isSettingsDrawerOpen = !this.isSettingsDrawerOpen;
            }

            if (this.isSettingsDrawerOpen) {
                drawer.classList.add('open');
                if (btn) btn.classList.add('active');
                if (fabBtn) fabBtn.classList.add('active');
            } else {
                drawer.classList.remove('open');
                if (btn) btn.classList.remove('active');
                if (fabBtn) fabBtn.classList.remove('active');
            }
        },

        /**
         * Harita Alanı Üzerine Sürükle-Bırak Dinleyicilerini Kurar
         */
        initDragDropListeners: function() {
            const stage = document.getElementById('satMapStage');
            const overlay = document.getElementById('satDragDropOverlay');
            if (!stage || stage._dragDropBound) return;
            stage._dragDropBound = true;

            ['dragenter', 'dragover'].forEach(evtName => {
                stage.addEventListener(evtName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (overlay) overlay.style.display = 'flex';
                });
            });

            ['dragleave'].forEach(evtName => {
                stage.addEventListener(evtName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.target === stage || e.target === overlay) {
                        if (overlay) overlay.style.display = 'none';
                    }
                });
            });

            stage.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (overlay) overlay.style.display = 'none';

                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];
                    SatelliteMapModule.handleKmlFile(file);
                }
            });
        },

        /**
         * Tuval Aktarımında Vektörel Arsa Poligonunu Çizer (Google Earth Kalitesinde Beyaz Dolgu & Kenarlık)
         */
        drawVectorParcelPolygon: function(ctx, targetW, targetH, mapContainer, cropInfo) {
            if (!this.parcelPolygon || !this.parcelData || !this.parcelData.latLngs || this.parcelData.latLngs.length < 3) return;

            try {
                ctx.save();
                const latLngs = this.parcelData.latLngs;
                const pts = latLngs.map(latLng => {
                    const pt = this.map.latLngToContainerPoint(L.latLng(latLng[0], latLng[1]));
                    const canvasX = ((pt.x - cropInfo.cropX) / cropInfo.cropW) * targetW;
                    const canvasY = ((pt.y - cropInfo.cropY) / cropInfo.cropH) * targetH;
                    return { x: canvasX, y: canvasY };
                });

                const scale = targetW / (cropInfo.cropW || 800);

                // 1. Poligon Çizimi
                ctx.beginPath();
                pts.forEach((p, idx) => {
                    if (idx === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                });
                ctx.closePath();

                // 2. Dolgu
                if (this.parcelFillMode !== 'nofill') {
                    const isNeon = !!this.parcelNeonEnabled;
                    const neonColor = this.parcelNeonColor || '#00CEC9';
                    let fillColor = '#ffffff';
                    if (this.parcelFillMode === 'color') {
                        fillColor = this.parcelFillColor || '#f59e0b';
                    } else if (isNeon) {
                        fillColor = neonColor;
                    }
                    ctx.fillStyle = this.hexToRgba(fillColor, this.parcelFillOpacity !== undefined ? this.parcelFillOpacity : (isNeon ? 0.35 : 0.40));
                    ctx.fill();
                }

                // 3. Kenar Çizgisi (Vektörel net ve kaliteli)
                const isNeon = !!this.parcelNeonEnabled;
                const neonColor = this.parcelNeonColor || '#00CEC9';
                const strokeColor = isNeon ? neonColor : (this.parcelStrokeColor || '#ffffff');
                const baseWidth = isNeon ? Math.max(3.5, this.parcelStrokeWidth || 3) : (this.parcelStrokeWidth || 3);
                const strokeW = Math.max(1.8, baseWidth * scale * 0.75);
                ctx.lineWidth = strokeW;
                ctx.strokeStyle = strokeColor;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';

                // Kenarlık için hafif derinlik gölgesi
                ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
                ctx.shadowBlur = 5 * scale;
                ctx.stroke();

                ctx.restore();

                // 4. Ada / Parsel Rozeti tuval fotoğrafının içine sabit basılmaz.
                // Kullanıcının tuvalde serbestçe taşıyabilmesi, büyütebilmesi ve renklerini değiştirebilmesi için
                // aktarım tamamlandığında window.addParcelBadgeToCanvas üzerinden canlı tuval elemanı olarak eklenir.
            } catch(e) {
                console.warn('drawVectorParcelPolygon hatası:', e);
            }
        },

        /**
         * ⚡ Arsa Parseli İçin Saber Neon Efektini Açar / Kapatır
         */
        toggleSatelliteParcelNeon: function(forceState) {
            if (typeof forceState === 'boolean') {
                this.parcelNeonEnabled = forceState;
            } else {
                this.parcelNeonEnabled = !this.parcelNeonEnabled;
            }

            this.updateParcelPolygonStyle();
            this.updateParcelNeonUI();

            if (typeof window.showAppToast === 'function') {
                if (this.parcelNeonEnabled) {
                    window.showAppToast('⚡ Arsa parseli için Saber Neon efekti aktif edildi!', 'success');
                } else {
                    window.showAppToast('⚡ Saber Neon efekti kapatıldı (Klasik Çizim Modu)', 'info');
                }
            }
        },

        /**
         * Neon Rengini Ayarlar (Hex)
         */
        setSatelliteParcelNeonColor: function(color) {
            if (!color) return;
            this.parcelNeonColor = color;
            this.parcelNeonEnabled = true;
            this.updateParcelPolygonStyle();
            this.updateParcelNeonUI();
        },

        /**
         * Neon Hazır Renk Presetini Ayarlar
         */
        setSatelliteParcelNeonPreset: function(presetKey) {
            const mapColors = {
                'turkuaz': '#00CEC9',
                'altin': '#FFB800',
                'mavi': '#0088FF',
                'kirmizi': '#FF0044',
                'yesil': '#00FF44',
                'mor': '#AA00FF',
                'pembe': '#FF00AA',
                'beyaz': '#FFFFFF'
            };
            const hex = mapColors[presetKey] || '#00CEC9';
            this.parcelNeonColor = hex;
            this.parcelNeonEnabled = true;
            this.updateParcelPolygonStyle();
            this.updateParcelNeonUI();
        },

        /**
         * Neon Dış Parlama Boyutunu Ayarlar (15px - 60px)
         */
        setSatelliteParcelNeonGlow: function(val) {
            this.parcelNeonGlowSize = Math.max(15, Math.min(60, parseInt(val, 10) || 32));
            const badge = document.getElementById('satNeonGlowVal');
            if (badge) badge.textContent = `${this.parcelNeonGlowSize}px`;
            const slider = document.getElementById('satNeonGlowSlider');
            if (slider && parseInt(slider.value, 10) !== this.parcelNeonGlowSize) {
                slider.value = this.parcelNeonGlowSize;
            }
        },

        /**
         * Neon Parlama Şiddetini Ayarlar (1.0 - 5.0)
         */
        setSatelliteParcelNeonIntensity: function(val) {
            this.parcelNeonIntensity = Math.max(1.0, Math.min(5.0, parseFloat(val) || 2.8));
            const badge = document.getElementById('satNeonIntensityVal');
            if (badge) badge.textContent = `${this.parcelNeonIntensity.toFixed(1)}x`;
            const slider = document.getElementById('satNeonIntensitySlider');
            if (slider && parseFloat(slider.value) !== this.parcelNeonIntensity) {
                slider.value = this.parcelNeonIntensity;
            }
        },

        /**
         * Hex renge karşılık gelen Saber renk preset ismini bulur
         */
        getMatchingSaberColorPreset: function(hex) {
            if (!hex) return 'turkuaz';
            const h = hex.toString().toLowerCase();
            if (h.includes('ffb800') || h.includes('f59e0b') || h.includes('eab308') || h.includes('gold') || h.includes('yellow')) return 'altin';
            if (h.includes('0088ff') || h.includes('0284c7') || h.includes('0ea5e9') || h.includes('38bdf8')) return 'mavi';
            if (h.includes('ff0044') || h.includes('ef4444') || h.includes('dc2626') || h.includes('red')) return 'kirmizi';
            if (h.includes('00ff44') || h.includes('10b981') || h.includes('059669') || h.includes('green')) return 'yesil';
            if (h.includes('aa00ff') || h.includes('8b5cf6') || h.includes('purple')) return 'mor';
            if (h.includes('ff00aa') || h.includes('ec4899') || h.includes('pink')) return 'pembe';
            if (h.includes('ffffff') || h.includes('white')) return 'beyaz';
            return 'turkuaz';
        },

        /**
         * Harita Arayüzündeki Tüm Neon Kontrollerini Senkronize Eder
         */
        updateParcelNeonUI: function() {
            const isNeon = !!this.parcelNeonEnabled;
            const neonColor = this.parcelNeonColor || '#00CEC9';

            // 1. Üst Kontrol Çubuğu Butonu (Dolgusuz outline buton)
            const btn = document.getElementById('satToggleNeonBtn');
            const statusText = document.getElementById('satNeonStatusText');
            if (btn) {
                btn.classList.toggle('active', isNeon);
                btn.style.borderColor = isNeon ? neonColor : '#334155';
                btn.style.color = isNeon ? neonColor : '#94a3b8';
                btn.style.background = 'transparent';
                btn.style.boxShadow = 'none';
            }
            if (statusText) {
                statusText.textContent = isNeon ? 'Açık' : 'Kapalı';
                statusText.style.color = isNeon ? neonColor : '#64748b';
            }

            // 2. Çekmece Kartı & Butonu (Dolgusuz outline buton)
            const drawerCard = document.getElementById('satDrawerNeonCard');
            const drawerBtn = document.getElementById('satDrawerNeonToggleBtn');
            const drawerText = document.getElementById('satDrawerNeonToggleText');
            const drawerDetails = document.getElementById('satDrawerNeonDetails');
            if (drawerCard) {
                drawerCard.classList.toggle('active', isNeon);
                drawerCard.style.borderColor = isNeon ? neonColor : 'rgba(0, 206, 201, 0.25)';
            }
            if (drawerBtn) {
                drawerBtn.classList.toggle('active', isNeon);
                drawerBtn.style.borderColor = isNeon ? neonColor : '#334155';
                drawerBtn.style.color = isNeon ? neonColor : '#94a3b8';
                drawerBtn.style.background = 'transparent';
                drawerBtn.style.boxShadow = 'none';
            }
            if (drawerText) {
                drawerText.textContent = isNeon ? 'Açık' : 'Kapalı';
                drawerText.style.color = isNeon ? neonColor : '#94a3b8';
            }
            if (drawerDetails) drawerDetails.style.display = isNeon ? 'block' : 'none';

            const glowBadge = document.getElementById('satNeonGlowVal');
            if (glowBadge) glowBadge.textContent = `${this.parcelNeonGlowSize || 32}px`;
            const glowSlider = document.getElementById('satNeonGlowSlider');
            if (glowSlider) glowSlider.value = this.parcelNeonGlowSize || 32;

            const intBadge = document.getElementById('satNeonIntensityVal');
            if (intBadge) intBadge.textContent = `${(this.parcelNeonIntensity || 2.8).toFixed(1)}x`;
            const intSlider = document.getElementById('satNeonIntensitySlider');
            if (intSlider) intSlider.value = this.parcelNeonIntensity || 2.8;

            const drawerCustom = document.getElementById('satDrawerNeonColorCustom');
            if (drawerCustom) drawerCustom.value = neonColor;

            // Çekmece renk noktalarını aktifleştir
            document.querySelectorAll('#satDrawerNeonDetails .sat-color-dot-sm').forEach(dot => {
                const bg = dot.style.background || '';
                const isMatch = bg.toLowerCase().includes(neonColor.toLowerCase());
                dot.classList.toggle('active', isMatch);
                dot.style.boxShadow = 'none';
            });

            // 3. Floating Rozet Butonu
            const floatBtn = document.getElementById('satFloatNeonBtn');
            if (floatBtn) {
                floatBtn.classList.toggle('active', isNeon);
                floatBtn.style.background = 'transparent';
                floatBtn.style.borderColor = isNeon ? neonColor : 'rgba(255, 255, 255, 0.15)';
                floatBtn.style.color = isNeon ? neonColor : '#cbd5e1';
                floatBtn.style.boxShadow = 'none';
            }
        },

        /**
         * 🚀 Parsel Poligonunu Tuval Çizim Katmanına (drawPaths) Canlı Aktarır
         * Saber Neon Efekti Aktifse WebGL Motoruyla Birlikte Başlatır
         */
        transferParcelToCanvas: function(points) {
            if (!points || !Array.isArray(points) || points.length < 3) return;
            if (typeof drawPaths === 'undefined') return;

            const isNeon = !!this.parcelNeonEnabled;
            const neonColor = this.parcelNeonColor || '#00CEC9';
            const strokeColor = isNeon ? neonColor : (this.parcelStrokeColor || '#ffffff');
            const strokeWidth = Math.max(1, parseFloat(this.parcelStrokeWidth) || 3);
            
            let fillColor = 'transparent';
            let fillOpacity = 0;
            if (this.parcelFillMode === 'nofill') {
                fillColor = 'transparent';
                fillOpacity = 0;
            } else if (this.parcelFillMode === 'color') {
                fillColor = this.parcelFillColor || '#f59e0b';
                fillOpacity = this.parcelFillOpacity !== undefined ? this.parcelFillOpacity : 0.40;
            } else {
                // Neon aktifse dolgu da neon renginde olsun, beyaz kalmasın
                fillColor = isNeon ? neonColor : (this.parcelFillColor || '#ffffff');
                fillOpacity = this.parcelFillOpacity !== undefined ? this.parcelFillOpacity : (isNeon ? 0.35 : 0.40);
            }

            // Sayısal RGB hex değeri (PixiJS için)
            let glowNumeric = 0x00CEC9;
            try {
                glowNumeric = parseInt(neonColor.replace('#', '0x'), 16);
            } catch(e) {}

            const saberOpts = isNeon ? {
                preset: this.parcelNeonPreset || 'fully-lit',
                colorPreset: this.getMatchingSaberColorPreset(neonColor),
                coreColor: 0xFFFFFF,
                glowColor: glowNumeric,
                coreSize: 0,
                glowSize: this.parcelNeonGlowSize || 32,
                intensity: this.parcelNeonIntensity || 2.8,
                groundSpill: 0.4,
                energyNodes: true,
                flickerAmount: 0.02,
                pulseSpeed: 0,
                distortionAmount: 0,
                active: true
            } : null;

            const photoRef = (typeof getActivePhotoPanel === 'function' && window.getCurrentPhotoState) 
                ? window.getCurrentPhotoState() 
                : null;

            const pObj = {
                id: 'draw-path-parcel-' + Date.now(),
                type: 'polygon',
                points: points.map(pt => ({ x: pt.x, y: pt.y })),
                color: strokeColor,
                width: strokeWidth,
                opacity: 1,
                dashStyle: 'solid',
                glow: 0,
                fillColor: fillColor,
                fillOpacity: fillOpacity,
                hasSaber: isNeon,
                saber: isNeon,
                saberOptions: saberOpts,
                photoRef: photoRef,
                isParcel: true
            };

            drawPaths.push(pObj);
            const pIdx = drawPaths.length - 1;

            if (typeof createSVGFromPath === 'function') {
                const svgEl = createSVGFromPath(pObj);
                if (svgEl) {
                    pObj.el = svgEl;
                    svgEl.dataset.label = isNeon ? '⚡ Neon Arsa Sınırı' : '📐 Arsa Sınırı (KML)';
                    const container = typeof getActiveV4Element === 'function' ? getActiveV4Element() : (document.getElementById('photo-layer') || document.getElementById('canvas-container'));
                    if (container && !svgEl.parentElement) {
                        container.appendChild(svgEl);
                    }
                    if (typeof bindDrag === 'function') bindDrag(svgEl);
                }
            }

            if (isNeon && typeof window.applySaberToPath === 'function') {
                pObj.saberRef = window.applySaberToPath(pIdx, pObj.saberOptions);
                if (window.saberState) {
                    window.saberState.active = true;
                    window.saberState.glowColor = glowNumeric;
                    window.saberState.colorPreset = this.getMatchingSaberColorPreset(neonColor);
                }
                const saberToggle = document.getElementById('saberModeToggle');
                if (saberToggle) saberToggle.checked = true;
            }

            if (typeof updateDrawHistory === 'function') updateDrawHistory();
            if (typeof redrawAll === 'function') redrawAll();
            if (typeof updateLayersList === 'function') updateLayersList();
            if (typeof renderLayers === 'function') renderLayers();
        },

        /**
         * Tuval Aktarımında Parselin Üzerine Ada/Parsel Rozetini Çizer
         */
        drawCanvasParcelBadge: function(ctx, x, y, parcelData, scale) {
            ctx.save();
            const s = Math.max(0.9, Math.min(2.4, scale * 0.72));
            ctx.translate(x, y);
            ctx.scale(s, s);

            const adaParselText = (parcelData.ada && parcelData.parsel) 
                ? `ADA ${parcelData.ada} / PARSEL ${parcelData.parsel}`
                : (parcelData.name || 'ARSA PARSELİ');
            const areaText = parcelData.alan ? parcelData.alan : '';

            ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Montserrat", sans-serif';
            const mainWidth = ctx.measureText(adaParselText).width;
            ctx.font = '500 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Montserrat", sans-serif';
            const subWidth = areaText ? ctx.measureText(areaText).width : 0;

            const bWidth = Math.max(110, Math.max(mainWidth, subWidth) + 28);
            const bHeight = areaText ? 42 : 28;
            const bX = -(bWidth / 2);
            const bY = -(bHeight / 2);
            const radius = 8;

            // Kutu Gölgesi
            ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 4;

            // Arka Plan
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(bX, bY, bWidth, bHeight, radius);
            } else {
                ctx.rect(bX, bY, bWidth, bHeight);
            }
            ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
            ctx.fill();

            // Sınır Çizgisi
            ctx.lineWidth = 1.8;
            ctx.strokeStyle = '#38bdf8';
            ctx.stroke();

            ctx.shadowColor = 'transparent';

            if (areaText) {
                // İki satırlı
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Montserrat", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(adaParselText, 0, bY + 14);

                ctx.fillStyle = '#38bdf8';
                ctx.font = '600 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Montserrat", sans-serif';
                ctx.fillText('📐 ' + areaText, 0, bY + 30);
            } else {
                // Tek satırlı
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Montserrat", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(adaParselText, 0, 0);
            }

            ctx.restore();
        },

        /**
         * Hex Rengini RGBA'ya Çevirir
         */
        hexToRgba: function(hex, alpha) {
            if (!hex) return `rgba(255, 255, 255, ${alpha !== undefined ? alpha : 1})`;
            let c = hex.replace('#', '');
            if (c.length === 3) {
                c = c.split('').map(char => char + char).join('');
            }
            const num = parseInt(c, 16);
            const r = (num >> 16) & 255;
            const g = (num >> 8) & 255;
            const b = num & 255;
            const a = alpha !== undefined ? alpha : 1;
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        },

        /**
         * Google 3D Earth (Maps Platform Photorealistic 3D) Modunu Başlatır
         */
        /**
         * Aktif Google Maps / 3D API Anahtarını Çözer
         * Kullanıcının hesabına bağlı anahtarı veya varsayılan anahtarı döndürür.
         */
        getActive3DKey: function() {
            // 1. window.GOOGLE_MAPS_3D_KEY
            if (typeof window.GOOGLE_MAPS_3D_KEY === 'string' && window.GOOGLE_MAPS_3D_KEY.trim()) {
                return window.GOOGLE_MAPS_3D_KEY.trim();
            }
            // 2. localStorage GOOGLE_MAPS_3D_KEY
            try {
                const k = localStorage.getItem('GOOGLE_MAPS_3D_KEY');
                if (k && typeof k === 'string' && k.trim()) return k.trim();
            } catch(e) {}
            // 3. Kullanıcının bağlı Gemini / Google API Anahtarı (window.getGeminiApiKey())
            if (typeof window.getGeminiApiKey === 'function') {
                const k = window.getGeminiApiKey();
                if (k && typeof k === 'string' && k.trim()) return k.trim();
            }
            // 4. localStorage emlakstudiom_gemini_api_key
            try {
                const k = localStorage.getItem('emlakstudiom_gemini_api_key');
                if (k && typeof k === 'string' && k.trim()) return k.trim();
            } catch(e) {}
            // 5. this.google3DKey veya varsayılan hesap anahtarı
            if (this.google3DKey && typeof this.google3DKey === 'string' && this.google3DKey.trim()) {
                return this.google3DKey.trim();
            }
            return 'AIzaSyB29TnBvpT2vmEiY9US_Op0S5mdJejOb_g';
        },

        /**
         * Google 3D Earth (Maps Platform Photorealistic 3D) Modunu Başlatır
         */
        initGoogle3DEarthMode: function() {
            const key = this.getActive3DKey() || 'AIzaSyB29TnBvpT2vmEiY9US_Op0S5mdJejOb_g';
            this.google3DKey = key;
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
            this.is3DActive = true;

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
                if (!this.is3DActive) return;
                try {
                    host.innerHTML = '';
                    const map3d = document.createElement('gmp-map-3d');
                    map3d.setAttribute('mode', this.google3DMode || 'HYBRID');

                    let centerLat = this.currentLat;
                    let centerLng = this.currentLng;
                    let range = this.google3DRange || 1400;
                    let tilt = this.google3DTilt || 45;

                    // Yüklü bir arsa/parsel varsa doğrudan parsel merkezine yakınlaşarak aç
                    if (this.parcelData && this.parcelData.latLngs && this.parcelData.latLngs.length >= 3) {
                        const bounds = this.getParcelCenterAndBounds();
                        if (bounds && bounds.center) {
                            centerLat = bounds.center.lat;
                            centerLng = bounds.center.lng;
                            range = 650;
                            tilt = 45;
                        }
                    }

                    map3d.setAttribute('center', `${centerLat},${centerLng},0`);
                    map3d.setAttribute('range', range.toString());
                    map3d.setAttribute('tilt', tilt.toString());
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

                    // 3D Harita üzerine parsel poligonunu bağla
                    if (this.parcelData && this.parcelData.latLngs && this.parcelData.latLngs.length >= 3) {
                        this.mount3DParcelPolygon(map3d);
                        setTimeout(() => this.mount3DParcelPolygon(map3d), 300);
                        setTimeout(() => this.mount3DParcelPolygon(map3d), 1000);
                        setTimeout(() => this.mount3DParcelPolygon(map3d), 2200);
                    }
                } catch(e) {
                    console.error("gmp-map-3d başlatma hatası:", e);
                    host.innerHTML = `<div style="padding:20px; color:#f87171; text-align:center;">3D Bileşen başlatılamadı: ${e.message}</div>`;
                }
            };

            // Google Maps Kota / Auth Hatası: Sadece kota dolduğunda otomatik Google HD Uydu'ya döner
            window.gm_authFailure = () => {
                console.warn("Google Maps 3D: Kota sınırı veya yetki hatası algılandı (gm_authFailure).");
                if (SatelliteMapModule.is3DActive) {
                    SatelliteMapModule.exitGoogle3DMode();
                    if (typeof window.showAppToast === 'function') {
                        window.showAppToast('Google 3D aylık ücretsiz kotası doldu. Otomatik olarak standart Google HD Uydu haritasına geçildi.', 'info', 5000);
                    }
                }
            };

            const activeKey = this.getActive3DKey();

            const readyToMount = () => {
                if (!this.is3DActive) return;
                if (window.google && window.google.maps && typeof window.google.maps.importLibrary === 'function') {
                    window.google.maps.importLibrary("maps3d").catch(() => {}).finally(() => {
                        mountElement();
                    });
                } else {
                    mountElement();
                }
            };

            if (window.google && window.google.maps) {
                readyToMount();
            } else {
                const existingScript = document.getElementById('googleMaps3dScript');
                if (existingScript) existingScript.remove();

                const script = document.createElement('script');
                script.id = 'googleMaps3dScript';
                script.src = `https://maps.googleapis.com/maps/api/js?key=${activeKey}&v=alpha&libraries=maps3d`;
                script.async = true;
                script.onload = () => {
                    setTimeout(readyToMount, 200);
                };
                script.onerror = () => {
                    console.warn("Google Maps 3D scripti yüklenemedi.");
                    SatelliteMapModule.exitGoogle3DMode();
                    if (typeof window.showAppToast === 'function') {
                        window.showAppToast('Google 3D bağlantısı kurulamadı. Standart HD uydu haritasına geçildi.', 'info');
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
        if (window.innerWidth <= 768) {
            if (typeof window.showAppToast === 'function') {
                window.showAppToast('🛰️ Uydu haritası özelliği masaüstü cihazlar için optimize edilmiştir.', 'info');
            }
            return;
        }
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

    window.toggleSatelliteAiEnhance = function(enabled) {
        SatelliteMapModule.toggleAiEnhance(enabled);
    };

    window.setSatelliteAiIntensity = function(val) {
        SatelliteMapModule.setAiIntensity(val);
    };

    window.previewSatelliteWithAiEnhancer = function() {
        SatelliteMapModule.previewWithAiEnhancer();
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

    // 📐 TKGM KML Parsel & Hamburger Çekmece Global Fonksiyonları
    window.handleSatelliteKmlUpload = function(event) {
        SatelliteMapModule.handleSatelliteKmlUpload(event);
    };

    window.clearSatelliteParcel = function() {
        SatelliteMapModule.clearParcel();
    };

    window.zoomToCurrentParcel = function() {
        SatelliteMapModule.zoomToCurrentParcel();
    };

    window.setParcelFillMode = function(mode) {
        SatelliteMapModule.setParcelFillMode(mode);
    };

    window.setParcelColor = function(color) {
        SatelliteMapModule.setParcelColor(color);
    };

    window.setParcelOpacity = function(val) {
        SatelliteMapModule.setParcelOpacity(val);
    };

    window.setParcelStrokeColor = function(color) {
        SatelliteMapModule.setParcelStrokeColor(color);
    };

    window.setParcelStrokeWidth = function(width) {
        SatelliteMapModule.setParcelStrokeWidth(width);
    };

    window.toggleParcelLabel = function(show) {
        SatelliteMapModule.toggleParcelLabel(show);
    };

    window.toggleSatelliteSettingsDrawer = function(forceState) {
        SatelliteMapModule.toggleSettingsDrawer(forceState);
    };

    window.syncCurrentParcelToSmartParser = function() {
        SatelliteMapModule.syncParcelToSmartParser();
    };

    window.setFloatingParcelScale = function(valOrDelta) {
        SatelliteMapModule.setFloatingParcelScale(valOrDelta);
    };

    window.setFloatingParcelTheme = function(theme) {
        SatelliteMapModule.setFloatingParcelTheme(theme);
    };

    window.toggleParcelColorPicker = function(event) {
        SatelliteMapModule.toggleParcelColorPicker(event);
    };

    window.openParcelColorPicker = function() {
        SatelliteMapModule.openParcelColorPicker();
    };

    window.closeParcelColorPicker = function() {
        SatelliteMapModule.closeParcelColorPicker();
    };

    window.applyParcelPresetTheme = function(theme) {
        SatelliteMapModule.applyParcelPresetTheme(theme);
    };

    window.updateParcelCustomStyle = function() {
        SatelliteMapModule.updateParcelCustomStyle();
    };

    window.toggleSatelliteParcelNeon = function(forceState) {
        SatelliteMapModule.toggleSatelliteParcelNeon(forceState);
    };

    window.setSatelliteParcelNeonColor = function(color) {
        SatelliteMapModule.setSatelliteParcelNeonColor(color);
    };

    window.setSatelliteParcelNeonPreset = function(preset) {
        SatelliteMapModule.setSatelliteParcelNeonPreset(preset);
    };

    window.setSatelliteParcelNeonGlow = function(glow) {
        SatelliteMapModule.setSatelliteParcelNeonGlow(glow);
    };

    window.setSatelliteParcelNeonIntensity = function(intensity) {
        SatelliteMapModule.setSatelliteParcelNeonIntensity(intensity);
    };

    window.SatelliteMapModule = SatelliteMapModule;

    // DOM hazır olduğunda modal yapısını kur
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => SatelliteMapModule.ensureModalDOM());
        } else {
            SatelliteMapModule.ensureModalDOM();
        }
    }

})(window);
