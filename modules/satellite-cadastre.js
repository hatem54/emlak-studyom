/**
 * =========================================================================
 * EMLAK STÜDYOM - TKGM KML / GEOJSON ARSA PARSEL MODÜLÜ (PRO v7.1)
 * modules/satellite-cadastre.js
 * =========================================================================
 */

(function(window) {
    'use strict';

    if (!window.SatelliteMapModule) {
        window.SatelliteMapModule = {};
    }

    Object.assign(window.SatelliteMapModule, {
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

            // KML yüklendiğinde Saber Neon'u otomatik aktif et ve hem 2D hem 3D stilini anında uygula
            this.parcelNeonEnabled = true;
            this.updateParcelPolygonStyle();
            this.updateParcelNeonUI();

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
                    const safeMaxZoom = (this.activeLayer === 'esri_sat') ? 16 : 19;
                    this.map.fitBounds(bounds, {
                        padding: [45, 45],
                        maxZoom: safeMaxZoom,
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

                this.saveLastLocation({
                    address: (searchInput ? searchInput.value : '') || (adaParselStr + (locStr ? ' (' + locStr + ')' : '')),
                    lat: this.currentLat,
                    lng: this.currentLng,
                    zoom: this.map ? this.map.getZoom() : (this.currentZoom || 17),
                    markerLat: this.markerLatLng ? this.markerLatLng.lat : this.currentLat,
                    markerLng: this.markerLatLng ? this.markerLatLng.lng : this.currentLng,
                    is3D: this.is3DActive,
                    range: this.google3DRange || 650,
                    tilt: this.google3DTilt || 45,
                    parcelData: this.parcelData
                });
            }

            this.updateParcelUI();

            // 📐 Parsel Yüklendiğinde Varsayılan Kenar Metrelerini ve Alan Rozetini Otomatik Başlat
            if (!this.measurePoints || this.measurePoints.length === 0) {
                this.measureActive = true;
                this.snapMeasureToAllParcelVertices();
                const mBtn = document.getElementById('satToggleMeasureBtn');
                const mStatus = document.getElementById('satMeasureStatusText');
                if (mBtn) mBtn.classList.add('active');
                if (mStatus) mStatus.textContent = 'Açık';
                const mPanel = document.getElementById('satMeasureFloatingPanel');
                if (mPanel) {
                    mPanel.style.display = 'flex';
                    this.restoreMeasurePanelPosition(mPanel);
                }
            }

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
                const named = {
                    'white': 'ffffff',
                    'black': '000000',
                    'red': 'ef4444',
                    'blue': '0284c7',
                    'green': '10b981',
                    'yellow': 'f59e0b',
                    'cyan': '00cec9',
                    'purple': 'aa00ff',
                    'transparent': 'ffffff00'
                };
                hex = named[hex.toLowerCase()] || 'ffffff';
                if (hex.length === 8) return '#' + hex.toLowerCase();
            }
            const alphaInt = Math.round(Math.max(0, Math.min(1, opacity)) * 255);
            const alphaHex = alphaInt.toString(16).padStart(2, '0');
            return ('#' + hex + alphaHex).toLowerCase();
        },

        /**
         * Google 3D (<gmp-map-3d>) Üzerine Arsa Poligonunu Yerleştirir (Google Earth 3D Dolgu & Kenarlık)
         * Var olan poligon ve polyline elemanlarını silip baştan yaratmak yerine yerinde (in-place)
         * attribute ve property güncelleyerek WebGL takılmalarını, renk donmalarını ve bellek sızıntılarını önler.
         */
        mount3DParcelPolygon: async function(map3d) {
            const map3dEl = map3d || this.map3dElement || document.querySelector('gmp-map-3d') || document.getElementById('sat3dMapHost')?.querySelector('gmp-map-3d');
            if (!map3dEl) return;
            this.map3dElement = map3dEl;

            if (!this.parcelData || !this.parcelData.latLngs || this.parcelData.latLngs.length < 3) return;

            try {
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

                // Winding sırasını counter-clockwise (saat yönünün tersi) yap
                // WebGL'de saat yönü poligonların normal yüzü aşağı baktığı için dolgu görünmez!
                let sum = 0;
                for (let i = 0; i < coords.length; i++) {
                    const c1 = coords[i];
                    const c2 = coords[(i + 1) % coords.length];
                    sum += (c2.lng - c1.lng) * (c2.lat + c1.lat);
                }
                const orientedCoords = (sum > 0) ? coords.slice().reverse() : coords;

                // Google Maps 3D standartları: Kapalı poligon ve çizgi halkası (ilk nokta = son nokta)
                const firstPt = orientedCoords[0];
                const lastPt = orientedCoords[orientedCoords.length - 1];
                const isClosed = Math.abs(firstPt.lat - lastPt.lat) < 1e-7 && Math.abs(firstPt.lng - lastPt.lng) < 1e-7;
                const closedCoords = orientedCoords.slice();
                if (!isClosed) {
                    closedCoords.push({ lat: firstPt.lat, lng: firstPt.lng, altitude: 0 });
                }

                // Dolgu ve Kenarlık Renkleri (Google 3D Maps katı #RRGGBBAA hex standardı)
                const isNeon3d = !!this.parcelNeonEnabled;
                const neonColor = this.parcelNeonColor || this.parcelStrokeColor || '#00CEC9';
                const strokeColor = this.parcelStrokeColor || '#ffffff';
                const opacity = (this.parcelFillOpacity !== undefined ? this.parcelFillOpacity : 0.40);

                let fillHex8 = '#ffffff66';
                if (this.parcelFillMode === 'nofill') {
                    fillHex8 = '#ffffff00'; // Tam saydam dolgusuz
                } else if (this.parcelFillMode === 'color') {
                    fillHex8 = this.colorToHex8(this.parcelFillColor || '#f59e0b', opacity);
                } else if (this.parcelFillMode === 'neon') {
                    fillHex8 = this.colorToHex8(neonColor, opacity);
                } else {
                    // 'white' modu: Saf beyaz yarı saydam dolgu (neon aktif olsa bile zemin beyaz kalır)
                    fillHex8 = this.colorToHex8('#ffffff', opacity);
                }

                const strokeW = Math.max(1, this.parcelStrokeWidth || 3);
                // Neon aktifken poligonun kendi konturunu tamamen saydam yapıyoruz ki çok katmanlı Saber aurası temiz ışısın
                const polyStrokeHex8 = isNeon3d ? '#ffffff00' : this.colorToHex8(strokeColor, 1.0);
                const polyStrokeW = isNeon3d ? 0 : strokeW;

                // AltitudeMode: CLAMP_TO_GROUND arazi kabartmasına yapışmayı sağlar
                let altModeObj = 'CLAMP_TO_GROUND';
                if (window.google && window.google.maps && window.google.maps.maps3d && window.google.maps.maps3d.AltitudeMode) {
                    altModeObj = window.google.maps.maps3d.AltitudeMode.CLAMP_TO_GROUND || 'CLAMP_TO_GROUND';
                }

                // ==========================================
                // 1. Zemin Dolgu Poligonu (<gmp-polygon-3d>)
                // ==========================================
                let poly3d = map3dEl.querySelector('gmp-polygon-3d');
                if (!poly3d) {
                    const PolygonClass = (window.google && window.google.maps && window.google.maps.maps3d && typeof window.google.maps.maps3d.Polygon3DElement === 'function')
                        ? window.google.maps.maps3d.Polygon3DElement
                        : null;
                    if (PolygonClass) {
                        try {
                            poly3d = new PolygonClass({
                                altitudeMode: altModeObj,
                                fillColor: fillHex8,
                                strokeColor: '#ffffff00',
                                strokeWidth: 0,
                                extruded: false
                            });
                        } catch(e) {}
                    }
                    if (!poly3d || !(poly3d instanceof Node)) {
                        poly3d = document.createElement('gmp-polygon-3d');
                    }
                    map3dEl.appendChild(poly3d);
                }

                // Dolgu poligonunun kenarlığını her zaman sıfır yapıyoruz; tüm kenar çizgilerini tek elden Polyline3D yönetecek (z-fighting önleme)
                poly3d.setAttribute('altitude-mode', 'clamp-to-ground');
                poly3d.setAttribute('fill-color', fillHex8);
                poly3d.setAttribute('stroke-color', '#ffffff00');
                poly3d.setAttribute('stroke-width', '0');
                poly3d.setAttribute('draws-occluded-segments', '');

                poly3d.altitudeMode = altModeObj;
                poly3d.fillColor = fillHex8;
                poly3d.strokeColor = '#ffffff00';
                poly3d.strokeWidth = 0;
                poly3d.extruded = false;
                poly3d.path = closedCoords;
                poly3d.outerCoordinates = closedCoords;
                poly3d.coordinates = closedCoords;

                // =========================================================
                // 2. Canlı 3D Vektörel Sınır & Neon Hatları (<gmp-polyline-3d>)
                // =========================================================
                const PolylineClass = (window.google && window.google.maps && window.google.maps.maps3d && typeof window.google.maps.maps3d.Polyline3DElement === 'function')
                    ? window.google.maps.maps3d.Polyline3DElement
                    : null;

                const existingLines = Array.from(map3dEl.querySelectorAll('gmp-polyline-3d'));

                // Hedef Çizgi Katmanları Listesi: [{ color, width }]
                // Pürüzsüz mikro-gradyan mimarisi: Çizgiler ayrışmaz, ortada garip beyaz çizgi veya zayıf soluk şeritler oluşturmaz.
                const desiredLines = [];
                const activeColor = strokeColor || '#f59e0b';

                if (isNeon3d) {
                    // ⚡ 3D Saber Neon Motoru (Pürüzsüz Mikro-Gradyan Işıma)
                    // Seçilen rengi saf ve net gösterir; ayrık beyaz çizgi veya zayıf soluk şeritler oluşturmaz.
                    // Katman 0: En Dış Geniş Yumuşak Korona (Bloom Halesi)
                    const outerW = strokeW + Math.min(8, Math.max(4, strokeW * 0.9));
                    desiredLines.push({
                        color: this.colorToHex8(activeColor, 0.28),
                        width: outerW
                    });

                    // Katman 1: Orta Yoğun Işıma Kuşağı (Plazma Aydınlatması)
                    const midW = strokeW + Math.min(5, Math.max(2.5, strokeW * 0.55));
                    desiredLines.push({
                        color: this.colorToHex8(activeColor, 0.55),
                        width: midW
                    });

                    // Katman 2: İç Plazma Halesi (Sıcak Çekirdek Çevresi)
                    const innerW = strokeW + Math.min(2.5, Math.max(1.2, strokeW * 0.25));
                    desiredLines.push({
                        color: this.colorToHex8(activeColor, 0.85),
                        width: innerW
                    });

                    // Katman 3: En Üst - Saf, Dolgun, Net Çekirdek Hattı (Kullanıcının seçtiği tam renkte ve kalınlıkta!)
                    desiredLines.push({
                        color: this.colorToHex8(activeColor, 1.0),
                        width: strokeW
                    });
                } else {
                    // Klasik Çizim Modu: Net tek katman vektörel sınır çizgisi
                    const strokeColorHex = this.colorToHex8(activeColor, 1.0);
                    desiredLines.push({ color: strokeColorHex, width: strokeW });
                }

                // Gerekli sayıda polyline oluştur veya var olanları yerinde anında güncelle
                for (let i = 0; i < desiredLines.length; i++) {
                    const cfg = desiredLines[i];
                    let line = existingLines[i];
                    if (!line) {
                        if (PolylineClass) {
                            try {
                                line = new PolylineClass({
                                    altitudeMode: altModeObj,
                                    strokeColor: cfg.color,
                                    strokeWidth: cfg.width,
                                    drawsOccludedSegments: true
                                });
                            } catch(e) {}
                        }
                        if (!line || !(line instanceof Node)) {
                            line = document.createElement('gmp-polyline-3d');
                        }
                        map3dEl.appendChild(line);
                    }
                    line.setAttribute('altitude-mode', 'clamp-to-ground');
                    line.setAttribute('stroke-color', cfg.color);
                    line.setAttribute('stroke-width', cfg.width.toString());
                    line.setAttribute('draws-occluded-segments', '');
                    line.altitudeMode = altModeObj;
                    line.strokeColor = cfg.color;
                    line.strokeWidth = cfg.width;
                    line.drawsOccludedSegments = true;
                    line.path = closedCoords;
                    line.coordinates = closedCoords;
                }

                // Fazla kalan polylineler varsa (örneğin Neon modundan Klasik 1 çizgiye dönüldüğünde)
                for (let j = desiredLines.length; j < existingLines.length; j++) {
                    try {
                        existingLines[j].strokeColor = '#ffffff00';
                        existingLines[j].strokeWidth = 0;
                        existingLines[j].setAttribute('stroke-color', '#ffffff00');
                        existingLines[j].setAttribute('stroke-width', '0');
                        existingLines[j].remove();
                    } catch(e) {}
                }
            } catch(err) {
                console.warn('Google 3D polygon yerleştirme hatası:', err);
            }
        },

        /**
         * Arsa Dolgu Modunu Değiştirir ('white' | 'color' | 'nofill')
         */
        setParcelFillMode: function(mode) {
            this.parcelFillMode = mode;
            if (mode === 'color' && !this.parcelFillColor) {
                this.parcelFillColor = '#f59e0b';
            }
            this.updateParcelPolygonStyle();
            this.updateParcelUI();
            this.syncAllColorPickersUI();
        },

        /**
         * Arsa Dolgu Rengini Değiştirir
         */
        setParcelColor: function(color) {
            if (!color) return;
            this.parcelFillColor = color;
            this.parcelFillMode = 'color';
            this.updateParcelPolygonStyle();
            this.updateParcelUI();
            this.syncAllColorPickersUI();
        },

        /**
         * Arsa Dolgu Opaklığını Ayarlar (0-100)
         */
        setParcelOpacity: function(val) {
            this.parcelFillOpacity = parseFloat(val) / 100;
            const opVal = document.getElementById('satParcelOpacityVal');
            if (opVal) opVal.textContent = `%${val}`;
            const mOpVal = document.getElementById('satMeasureFillOpacityText');
            if (mOpVal) mOpVal.textContent = `%${val}`;
            const popoverOpVal = document.getElementById('satPopoverOpVal');
            if (popoverOpVal) popoverOpVal.textContent = `%${val}`;
            const mOpSlider = document.getElementById('satMeasureFillOpacitySlider');
            if (mOpSlider && parseInt(mOpSlider.value, 10) !== parseInt(val, 10)) mOpSlider.value = val;
            const opSlider = document.getElementById('satParcelOpacitySlider');
            if (opSlider && parseInt(opSlider.value, 10) !== parseInt(val, 10)) opSlider.value = val;
            this.updateParcelPolygonStyle();
            this.updateParcelUI();
        },

        /**
         * Kenar Çizgisi Rengini Ayarlar
         */
        setParcelStrokeColor: function(color) {
            if (!color) return;
            this.parcelStrokeColor = color;
            this.parcelNeonColor = color; // Neon her zaman seçilen çizgi rengiyle senkron parlar
            this.updateParcelPolygonStyle();
            this.updateParcelUI();
            this.syncAllColorPickersUI();
        },

        /**
         * Kenar Çizgisi Kalınlığını Slider ile Ayarlar (1px - 10px)
         */
        setParcelStrokeWidth: function(width) {
            this.parcelStrokeWidth = Math.max(0.5, Math.min(15, parseFloat(width) || 3));
            const strokeVal = document.getElementById('satParcelStrokeWidthVal');
            if (strokeVal) strokeVal.textContent = `${this.parcelStrokeWidth}px`;
            const mStrokeVal = document.getElementById('satMeasureStrokeWidthText');
            if (mStrokeVal) mStrokeVal.textContent = `${this.parcelStrokeWidth}px`;
            const strokeSlider = document.getElementById('satParcelStrokeWidthSlider');
            if (strokeSlider && parseFloat(strokeSlider.value) !== this.parcelStrokeWidth) {
                strokeSlider.value = this.parcelStrokeWidth;
            }
            const mStrokeSlider = document.getElementById('satMeasureStrokeWidthSlider');
            if (mStrokeSlider && parseFloat(mStrokeSlider.value) !== this.parcelStrokeWidth) {
                mStrokeSlider.value = this.parcelStrokeWidth;
            }
            const popoverStrokeVal = document.getElementById('satPopoverStrokeVal');
            if (popoverStrokeVal) popoverStrokeVal.textContent = `${this.parcelStrokeWidth}px`;
            const popoverStrokeSlider = document.getElementById('satPopoverStrokeSlider');
            if (popoverStrokeSlider && parseFloat(popoverStrokeSlider.value) !== this.parcelStrokeWidth) {
                popoverStrokeSlider.value = this.parcelStrokeWidth;
            }
            this.updateParcelPolygonStyle();
            this.updateParcelUI();
        },

        /**
         * Ada/Parsel Rozetini Açıp Kapatır
         */
        toggleParcelLabel: function(show) {
            this.parcelShowLabel = !!show;
            this.updateParcelLabelMarker();
        },

        /**
         * Hem 2D Leaflet Hem De 3D Google Earth Poligon/Çizgi Stillerini Anında Günceller
         */
        updateParcelPolygonStyle: function() {
            try {
                if (this.parcelPolygon && this.map) {
                    const shouldHideParcel = this.measureActive && this.measureHideDefaultParcel && (this.measurePoints && this.measurePoints.length >= 2);
                    if (shouldHideParcel) {
                        if (this.map.hasLayer(this.parcelPolygon)) {
                            this.map.removeLayer(this.parcelPolygon);
                        }
                    } else {
                        if (!this.map.hasLayer(this.parcelPolygon)) {
                            this.parcelPolygon.addTo(this.map);
                        }

                        const isNeon = !!this.parcelNeonEnabled;
                        const neonColor = this.parcelNeonColor || this.parcelStrokeColor || '#00CEC9';
                        const strokeColor = this.parcelStrokeColor || '#ffffff';
                        const strokeWidth = this.parcelStrokeWidth || 3;

                        let fillColor = 'transparent';
                        let fillOpacity = 0;
                        if (this.parcelFillMode === 'nofill') {
                            fillColor = 'transparent';
                            fillOpacity = 0;
                        } else if (this.parcelFillMode === 'color') {
                            fillColor = this.parcelFillColor || '#f59e0b';
                            fillOpacity = this.parcelFillOpacity !== undefined ? this.parcelFillOpacity : 0.40;
                        } else if (this.parcelFillMode === 'neon') {
                            fillColor = neonColor;
                            fillOpacity = this.parcelFillOpacity !== undefined ? this.parcelFillOpacity : 0.35;
                        } else {
                            // 'white' modu: Saf beyaz yarı saydam dolgu (neon aktif olsa bile zemin beyaz kalır)
                            fillColor = '#ffffff';
                            fillOpacity = this.parcelFillOpacity !== undefined ? this.parcelFillOpacity : 0.40;
                        }

                        this.parcelPolygon.setStyle({
                            color: strokeColor,
                            weight: strokeWidth,
                            fillColor: fillColor,
                            fillOpacity: fillOpacity
                        });

                        // Canlı Leaflet SVG path neon efekti (Seçilen rengin zengin katmanlı ışıması)
                        if (this.parcelPolygon._path) {
                            if (isNeon) {
                                this.parcelPolygon._path.style.filter = `drop-shadow(0 0 2px ${neonColor}) drop-shadow(0 0 6px ${neonColor}) drop-shadow(0 0 14px ${neonColor})`;
                                this.parcelPolygon._path.style.transition = 'filter 0.3s ease, stroke 0.3s ease';
                            } else {
                                this.parcelPolygon._path.style.filter = '';
                            }
                        }
                    }
                }
            } catch(e) {
                console.warn("Leaflet arsa stil güncelleme hatası:", e);
            }

            // 3D Harita Açık veya DOM'da gmp-map-3d varsa 3D Parseli Hemen Güncelle
            const map3d = this.map3dElement || document.querySelector('gmp-map-3d') || document.getElementById('sat3dMapHost')?.querySelector('gmp-map-3d');
            const is3dContainerVisible = (document.getElementById('sat3dContainer')?.style.display !== 'none');
            if (map3d && (this.is3DActive || is3dContainerVisible)) {
                this.map3dElement = map3d;
                this.is3DActive = true;
                this.mount3DParcelPolygon(map3d);
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

            // 10. Ölçüm Paneli Parsel Kenar Kilit Butonları Senkronizasyonu
            if (typeof this.updateParcelSnapButtons === 'function') {
                this.updateParcelSnapButtons();
            }
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
            popover.style.width = '315px';
            popover.style.maxHeight = '490px';
            popover.style.overflowY = 'auto';

            const curColors = this.parcelBadgeCustomColors || this.getThemeDefaultColors(this.parcelBadgeTheme || 'gold');
            const curActiveColor = (this.parcelNeonColor || this.parcelStrokeColor || '#00CEC9').toLowerCase();

            popover.innerHTML = `
                <div class="sat-popover-header">
                    <span><i class="fas fa-palette" style="color:#f59e0b; margin-right:6px;"></i>Arsa Çizgi, Dolgu & Rozet</span>
                    <button type="button" class="sat-popover-close" onclick="window.closeParcelColorPicker()">&times;</button>
                </div>

                <!-- 1. Bölüm: Arsa Kenar & Saber Neon Çizgisi -->
                <div class="sat-popover-section" style="border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px; margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <label class="sat-popover-label" style="margin-bottom:0;">⚡ Kenar & Neon Çizgisi</label>
                        <button type="button" id="satPopoverNeonToggle" class="sat-pill-toggle-btn ${this.parcelNeonEnabled ? 'active' : ''}" onclick="window.toggleSatelliteParcelNeon(); window.openParcelColorPicker();" style="padding:2px 8px; font-size:10.5px; border-radius:12px; border:1px solid ${this.parcelNeonEnabled ? (this.parcelNeonColor || '#00CEC9') : '#475569'}; background:transparent; color:${this.parcelNeonEnabled ? (this.parcelNeonColor || '#00CEC9') : '#94a3b8'}; cursor:pointer;">
                            <i class="fas fa-bolt"></i> Neon: <b>${this.parcelNeonEnabled ? 'Açık' : 'Kapalı'}</b>
                        </button>
                    </div>

                    <!-- Renk Noktaları -->
                    <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap; margin-bottom:8px;">
                        <button type="button" class="sat-measure-color-dot sat-popover-color-dot ${(curActiveColor === '#00cec9' || curActiveColor === '#00f5d4') ? 'active' : ''}" style="background:#00CEC9;" data-color="#00CEC9" onclick="window.setSatelliteParcelNeonColor('#00CEC9')" title="Turkuaz"></button>
                        <button type="button" class="sat-measure-color-dot sat-popover-color-dot ${(curActiveColor === '#ffb800' || curActiveColor === '#f59e0b') ? 'active' : ''}" style="background:#f59e0b;" data-color="#f59e0b" onclick="window.setSatelliteParcelNeonColor('#f59e0b')" title="Altın"></button>
                        <button type="button" class="sat-measure-color-dot sat-popover-color-dot ${curActiveColor === '#0ea5e9' ? 'active' : ''}" style="background:#0ea5e9;" data-color="#0ea5e9" onclick="window.setSatelliteParcelNeonColor('#0ea5e9')" title="Neon Mavi"></button>
                        <button type="button" class="sat-measure-color-dot sat-popover-color-dot ${curActiveColor === '#10b981' ? 'active' : ''}" style="background:#10b981;" data-color="#10b981" onclick="window.setSatelliteParcelNeonColor('#10b981')" title="Zümrüt Yeşili"></button>
                        <button type="button" class="sat-measure-color-dot sat-popover-color-dot ${curActiveColor === '#ef4444' ? 'active' : ''}" style="background:#ef4444;" data-color="#ef4444" onclick="window.setSatelliteParcelNeonColor('#ef4444')" title="Canlı Kırmızı"></button>
                        <button type="button" class="sat-measure-color-dot sat-popover-color-dot ${curActiveColor === '#aa00ff' ? 'active' : ''}" style="background:#aa00ff;" data-color="#aa00ff" onclick="window.setSatelliteParcelNeonColor('#aa00ff')" title="Neon Mor"></button>
                        <button type="button" class="sat-measure-color-dot sat-popover-color-dot ${curActiveColor === '#ffffff' ? 'active' : ''}" style="background:#ffffff;" data-color="#ffffff" onclick="window.setSatelliteParcelNeonColor('#ffffff')" title="Saf Beyaz"></button>
                        <label class="sat-measure-color-custom-btn" style="width:20px; height:20px;" title="Özel Renk Seç (Damlalık)">
                            <i class="fas fa-eye-dropper"></i>
                            <input type="color" id="satPopoverCustomColor" value="${curActiveColor.startsWith('#') ? curActiveColor : '#00CEC9'}" oninput="window.setSatelliteParcelNeonColor(this.value)">
                        </label>
                    </div>

                    <!-- Çizgi Kalınlığı -->
                    <div class="sat-color-row" style="margin-bottom:0;">
                        <span>Çizgi Kalınlığı (<span id="satPopoverStrokeVal">${this.parcelStrokeWidth || 3}px</span>)</span>
                        <input type="range" id="satPopoverStrokeSlider" min="1" max="10" step="0.5" value="${this.parcelStrokeWidth || 3}" oninput="window.setParcelStrokeWidth(this.value)" style="width:110px;">
                    </div>
                </div>

                <!-- 2. Bölüm: Arsa Zemin Dolgusu -->
                <div class="sat-popover-section" style="border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px; margin-bottom:10px;">
                    <label class="sat-popover-label">🎨 Arsa Zemin Dolgusu</label>
                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px; margin-bottom:8px;">
                        <button type="button" class="sat-fill-btn ${(this.parcelFillMode || 'white') === 'white' ? 'active' : ''}" onclick="window.setParcelFillMode('white'); window.openParcelColorPicker();" title="Beyaz yarı saydam arsa dolgusu">⚪ Beyaz</button>
                        <button type="button" class="sat-fill-btn ${this.parcelFillMode === 'color' ? 'active' : ''}" onclick="window.setParcelFillMode('color'); window.openParcelColorPicker();" title="Seçili renkte arsa dolgusu">🎨 Renkli</button>
                        <button type="button" class="sat-fill-btn ${this.parcelFillMode === 'nofill' ? 'active' : ''}" onclick="window.setParcelFillMode('nofill'); window.openParcelColorPicker();" title="Şeffaf arsa dolgusu (sadece sınır çizgisi)">🚫 Şeffaf</button>
                    </div>
                    <div class="sat-color-row" style="margin-bottom:0;">
                        <span>Dolgu Saydamlığı (<span id="satPopoverOpVal">%${Math.round((this.parcelFillOpacity !== undefined ? this.parcelFillOpacity : 0.40) * 100)}</span>)</span>
                        <input type="range" min="5" max="95" step="5" value="${Math.round((this.parcelFillOpacity !== undefined ? this.parcelFillOpacity : 0.40) * 100)}" oninput="window.setParcelOpacity(this.value)" style="width:110px;">
                    </div>
                </div>

                <!-- 3. Bölüm: Bilgi Rozeti (Kart) Görünümü -->
                <div class="sat-popover-section">
                    <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="const d = document.getElementById('satPopoverBadgeDetails'); if (d) d.style.display = d.style.display === 'none' ? 'block' : 'none';">
                        <label class="sat-popover-label" style="cursor:pointer; margin-bottom:0;">🏷️ Rozet Kartı Teması</label>
                        <i class="fas fa-chevron-down" style="font-size:10px; color:#94a3b8;"></i>
                    </div>
                    <div id="satPopoverBadgeDetails" style="display:none; margin-top:8px;">
                        <div class="sat-popover-theme-grid" style="margin-bottom:8px;">
                            <button type="button" class="sat-theme-chip ${(this.parcelBadgeTheme || 'gold') === 'gold' ? 'active' : ''}" onclick="window.applyParcelPresetTheme('gold')">🟡 Altın Lüks</button>
                            <button type="button" class="sat-theme-chip ${this.parcelBadgeTheme === 'cyan' ? 'active' : ''}" onclick="window.applyParcelPresetTheme('cyan')">🔵 Neon Mavi</button>
                            <button type="button" class="sat-theme-chip ${this.parcelBadgeTheme === 'emerald' ? 'active' : ''}" onclick="window.applyParcelPresetTheme('emerald')">🟢 Zümrüt</button>
                            <button type="button" class="sat-theme-chip ${this.parcelBadgeTheme === 'dark' ? 'active' : ''}" onclick="window.applyParcelPresetTheme('dark')">⚫ Gece Matı</button>
                        </div>
                        <div class="sat-color-row">
                            <span>Rozet Zemin Rengi</span>
                            <input type="color" id="satCustomBgColor" value="${curColors.bgHex || '#0f172a'}" oninput="window.updateParcelCustomStyle()">
                        </div>
                        <div class="sat-color-row">
                            <span>Başlık Yazı Rengi</span>
                            <input type="color" id="satCustomTitleColor" value="${curColors.titleColor || '#fef08a'}" oninput="window.updateParcelCustomStyle()">
                        </div>
                        <div class="sat-color-row">
                            <span>Rozet Çerçeve Rengi</span>
                            <input type="color" id="satCustomBorderColor" value="${curColors.borderColor || '#eab308'}" oninput="window.updateParcelCustomStyle()">
                        </div>
                    </div>
                </div>
            `;

            stage.appendChild(popover);

            // Popover renk noktalarının aktifliğini ayarla
            this.syncAllColorPickersUI(curActiveColor);

            const infoRect = floatInfo.getBoundingClientRect();
            const stageRect = stage.getBoundingClientRect();

            let left = infoRect.left - stageRect.left;
            let top = infoRect.bottom - stageRect.top + 8;

            if (left + 325 > stageRect.width) {
                left = Math.max(10, stageRect.width - 330);
            }
            if (top + 470 > stageRect.height) {
                top = Math.max(10, infoRect.top - stageRect.top - 475);
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
            const map3d = this.map3dElement || document.querySelector('gmp-map-3d');
            if (map3d) {
                map3d.querySelectorAll('gmp-polygon-3d, gmp-polyline-3d').forEach(el => {
                    try {
                        el.setAttribute('stroke-color', '#ffffff00');
                        el.setAttribute('stroke-width', '0');
                        el.remove();
                    } catch(e){}
                });
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
                    const safeMaxZoom = (this.activeLayer === 'esri_sat') ? 16 : 19;
                    this.map.fitBounds(bounds, { padding: [45, 45], maxZoom: safeMaxZoom, animate: true, duration: 1.0 });
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
                        fillColor = this.parcelFillColor || neonColor || '#f59e0b';
                    } else if (this.parcelFillMode === 'neon') {
                        fillColor = neonColor;
                    }
                    ctx.fillStyle = this.hexToRgba(fillColor, this.parcelFillOpacity !== undefined ? this.parcelFillOpacity : 0.40);
                    ctx.fill();
                }

                // 3. Kenar Çizgisi (Vektörel net ve kaliteli)
                const isNeon = !!this.parcelNeonEnabled;
                const neonColor = this.parcelNeonColor || this.parcelStrokeColor || '#00CEC9';
                const strokeColor = this.parcelStrokeColor || '#ffffff';
                const baseWidth = this.parcelStrokeWidth || 3;
                const strokeW = Math.max(1.8, baseWidth * scale * 0.75);
                ctx.lineWidth = strokeW;
                ctx.strokeStyle = strokeColor;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';

                if (isNeon) {
                    // Dış zengin neon halo kuşağı
                    ctx.save();
                    ctx.shadowColor = neonColor;
                    ctx.shadowBlur = 18 * scale;
                    ctx.strokeStyle = this.hexToRgba(neonColor, 0.80);
                    ctx.lineWidth = strokeW * 2.4;
                    ctx.stroke();
                    ctx.restore();

                    // İç süper akkor beyaz çekirdek
                    ctx.save();
                    ctx.shadowColor = neonColor;
                    ctx.shadowBlur = 5 * scale;
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = Math.max(1.5, strokeW * 0.85);
                    ctx.stroke();
                    ctx.restore();
                } else {
                    // Kenarlık için hafif derinlik gölgesi
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
                    ctx.shadowBlur = 5 * scale;
                    ctx.stroke();
                }

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
            if (this.parcelNeonEnabled) {
                this.parcelNeonColor = this.parcelStrokeColor || '#00CEC9';
            }

            this.updateParcelPolygonStyle();
            this.updateParcelNeonUI();
            this.updateParcelUI();
            this.syncAllColorPickersUI();

            if (typeof window.showAppToast === 'function') {
                if (!this.parcelData || !this.parcelData.latLngs || this.parcelData.latLngs.length < 3) {
                    window.showAppToast('ℹ️ Saber Neon efekti arsa/parsel sınırları üzerinde parlar. Önce bir KML/KMZ veya Parsel yükleyin.', 'info', 4500);
                } else if (this.parcelNeonEnabled) {
                    if (this.is3DActive) {
                        window.showAppToast('⚡ 3D Dünya üzerinde parlayan Saber Neon hatları aktif edildi!', 'success', 4000);
                    } else {
                        window.showAppToast('⚡ Arsa parseli için Saber Neon efekti aktif edildi!', 'success');
                    }
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
            this.parcelStrokeColor = color;
            this.parcelNeonEnabled = true;
            this.updateParcelPolygonStyle();
            this.updateParcelNeonUI();
            this.updateParcelUI();
            this.syncAllColorPickersUI();
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
            this.setSatelliteParcelNeonColor(hex);
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
            const strokeColor = this.parcelStrokeColor || '#ffffff';
            const strokeWidth = Math.max(1, parseFloat(this.parcelStrokeWidth) || 3);
            
            let fillColor = 'transparent';
            let fillOpacity = 0;
            if (this.parcelFillMode === 'nofill') {
                fillColor = 'transparent';
                fillOpacity = 0;
            } else if (this.parcelFillMode === 'color') {
                fillColor = this.parcelFillColor || '#f59e0b';
                fillOpacity = this.parcelFillOpacity !== undefined ? this.parcelFillOpacity : 0.40;
            } else if (this.parcelFillMode === 'neon') {
                fillColor = neonColor;
                fillOpacity = this.parcelFillOpacity !== undefined ? this.parcelFillOpacity : 0.35;
            } else {
                // 'white' modu: Saf beyaz yarı saydam dolgu (neon açık olsa bile beyaz kalır)
                fillColor = '#ffffff';
                fillOpacity = this.parcelFillOpacity !== undefined ? this.parcelFillOpacity : 0.40;
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

    });

})(window);
