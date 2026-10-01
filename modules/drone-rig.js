/**
 * =========================================================================
 * EMLAK STÜDYOM - 6 YÖNLÜ OTONOM 3B DRONE ÇEKİM MOTORU (PRO v7.1)
 * modules/drone-rig.js
 * =========================================================================
 * - KML / KMZ arsa poligonu merkezine ve sınırlarına kilitlenir.
 * - Otomatik 6 Açı Çekimi:
 *   1. Kuzey Cephesi (45° Eğim, 0° Yön)
 *   2. Doğu Cephesi (45° Eğim, 90° Yön)
 *   3. Güney Cephesi (45° Eğim, 180° Yön)
 *   4. Batı Cephesi (45° Eğim, 270° Yön)
 *   5. Kuşbakışı Kadastro Planı (0° Eğim - Tam Tepe)
 *   6. Çevre & Yerleşim Geniş Kadrajı (38° Eğim, 1.8 - 3 km irtifa)
 * - Çekimleri WebGL üzerinden yüksek çözünürlükle yakalar ve
 *   "Geçici Görsel Arşivi" (PhotoStagingArchive) çekmecesine aktarır.
 * =========================================================================
 */

(function(window) {
    'use strict';

    const DroneRigEngine = {
        isBusy: false,
        isAborted: false,
        hudElement: null,
        currentShotIndex: 0,
        capturedShotKeys: new Set(),

        /**
         * 12 Açılı Standart Drone Çekim Setini Döndürür
         */
        getShots: function(info) {
            const rd = (info && info.rangeDetail) ? info.rangeDetail : 450;
            const rw = (info && info.rangeWide) ? info.rangeWide : 1000;
            const rnc = (info && info.rangeNadirClose) ? info.rangeNadirClose : 400;
            const rnf = (info && info.rangeNadirFar) ? info.rangeNadirFar : 850;

            return [
                // --- 6 YAKIN CEPHE (Dinamik Drone Açısı: 65° Sinematik Yatay Eğim) ---
                { key: 'north_close', title: 'Kuzey Cephesi', subTitle: 'Kuzeyden Yakın Kadraj', heading: 0, tilt: 65, range: rd, icon: 'fa-compass' },
                { key: 'northeast_close', title: 'Kuzeydoğu Cephesi', subTitle: 'Kuzeydoğudan Çapraz Kadraj', heading: 45, tilt: 65, range: rd, icon: 'fa-compass' },
                { key: 'east_close', title: 'Doğu Cephesi', subTitle: 'Doğudan Yakın Kadraj', heading: 90, tilt: 65, range: rd, icon: 'fa-compass' },
                { key: 'south_close', title: 'Güney Cephesi', subTitle: 'Güneyden Yakın Kadraj', heading: 180, tilt: 65, range: rd, icon: 'fa-compass' },
                { key: 'southwest_close', title: 'Güneybatı Cephesi', subTitle: 'Güneybatıdan Çapraz Kadraj', heading: 225, tilt: 65, range: rd, icon: 'fa-compass' },
                { key: 'west_close', title: 'Batı Cephesi', subTitle: 'Batıdan Yakın Kadraj', heading: 270, tilt: 65, range: rd, icon: 'fa-compass' },

                // --- 4 UZAK ÇEVRE & YERLEŞİM (70° Geniş Ufuk Eğimi) ---
                { key: 'north_wide', title: 'Kuzey Geniş Çevre', subTitle: 'Kuzeyden Geniş Bölge Kadrajı', heading: 0, tilt: 70, range: rw, icon: 'fa-mountain-sun' },
                { key: 'east_wide', title: 'Doğu Geniş Çevre', subTitle: 'Doğudan Geniş Bölge Kadrajı', heading: 90, tilt: 70, range: rw, icon: 'fa-mountain-sun' },
                { key: 'south_wide', title: 'Güney Geniş Çevre', subTitle: 'Güneyden Geniş Bölge Kadrajı', heading: 180, tilt: 70, range: rw, icon: 'fa-mountain-sun' },
                { key: 'west_wide', title: 'Batı Geniş Çevre', subTitle: 'Batıdan Geniş Bölge Kadrajı', heading: 270, tilt: 70, range: rw, icon: 'fa-mountain-sun' },

                // --- 2 TEPE KUŞBAKIŞI (0° Dik Ortotik) ---
                { key: 'nadir_close', title: 'Kuşbakışı Parsel', subTitle: 'Tam Dik Yakın Parsel Planı', heading: 0, tilt: 0, range: rnc, icon: 'fa-crosshairs' },
                { key: 'nadir_far', title: 'Kuşbakışı Bölge', subTitle: 'Tam Dik Geniş Bölge Planı', heading: 0, tilt: 0, range: rnf, icon: 'fa-map' }
            ];
        },

        /**
         * Geçerli Parsel ve Mesafe Bilgilerini Getirir
         */
        getParcelInfo: async function() {
            const sat = window.SatelliteMapModule;
            if (!sat) return null;
            let info = null;
            if (typeof sat.getParcelDimensionsAndRanges === 'function') {
                info = sat.getParcelDimensionsAndRanges();
            }
            if (!info) {
                const cb = sat.getParcelCenterAndBounds ? sat.getParcelCenterAndBounds() : null;
                const c = cb ? cb.center : { lat: sat.currentLat, lng: sat.currentLng };
                info = {
                    center: c,
                    rangeDetail: 450,
                    rangeWide: 1000,
                    rangeNadirClose: 400,
                    rangeNadirFar: 850,
                    elevation: sat.parcelElevation || 0
                };
            }
            if (info && info.center && (!info.elevation || info.elevation === 0) && typeof sat.getGroundElevation === 'function') {
                try {
                    info.elevation = await sat.getGroundElevation(info.center.lat, info.center.lng);
                    sat.parcelElevation = info.elevation;
                } catch(e) {}
            }
            return info;
        },

        /**
         * Belirtilen İndeksteki Drone Açısına Yumuşakça Uçar
         */
        goToShot: async function(index) {
            const sat = window.SatelliteMapModule;
            if (!sat) return;

            const info = await this.getParcelInfo();
            if (!info) return;

            const shots = this.getShots(info);
            this.currentShotIndex = ((index % shots.length) + shots.length) % shots.length;
            const shot = shots[this.currentShotIndex];

            // 3D Haritayı ve poligonu hazırla
            if (!sat.is3DActive || !sat.map3dElement) {
                await this.ensure3DReady(sat, info);
            }

            const map3d = sat.map3dElement || document.querySelector('gmp-map-3d');
            if (map3d) {
                let camTarget = info.center;
                if (typeof sat.getPerspectiveCameraTarget === 'function') {
                    camTarget = sat.getPerspectiveCameraTarget(info.center, shot.heading, shot.tilt, shot.range);
                }

                const targetLat = Number(camTarget.lat).toFixed(7);
                const targetLng = Number(camTarget.lng).toFixed(7);
                const targetAlt = (typeof camTarget.altitude === 'number') ? camTarget.altitude : (info.elevation || sat.parcelElevation || 0);

                if (typeof map3d.stopCameraAnimation === 'function') {
                    try { map3d.stopCameraAnimation(); } catch(e) {}
                }

                try {
                    map3d.range = parseFloat(shot.range);
                    map3d.tilt = parseFloat(shot.tilt);
                    map3d.heading = parseFloat(shot.heading);
                    map3d.roll = 0;
                    map3d.center = { lat: parseFloat(targetLat), lng: parseFloat(targetLng), altitude: targetAlt };
                } catch(e) {}

                map3d.setAttribute('center', `${targetLat},${targetLng},${targetAlt}`);
                map3d.setAttribute('range', shot.range.toString());
                map3d.setAttribute('tilt', shot.tilt.toString());
                map3d.setAttribute('heading', shot.heading.toString());

                if (typeof sat.mount3DParcelPolygon === 'function') {
                    sat.mount3DParcelPolygon(map3d);
                }
            }

            this.syncNavUI(shots);
        },

        nextShot: function() {
            this.goToShot(this.currentShotIndex + 1);
        },

        prevShot: function() {
            this.goToShot(this.currentShotIndex - 1);
        },

        /**
         * O Anki Açı Bilgisini ve Durumunu Alt Barda Günceller
         */
        syncNavUI: function(shotsList) {
            const sat = window.SatelliteMapModule;
            let info = (sat && typeof sat.getParcelDimensionsAndRanges === 'function') ? sat.getParcelDimensionsAndRanges() : null;
            if (!info) info = { rangeDetail: 450, rangeWide: 1000, rangeNadirClose: 400, rangeNadirFar: 850 };
            const shots = shotsList || this.getShots(info);
            const shot = shots[this.currentShotIndex] || shots[0];

            const countEl = document.getElementById('satDroneNavCount');
            const titleEl = document.getElementById('satDroneNavTitle');
            const statusEl = document.getElementById('satDroneNavStatus');
            const camBadgeEl = document.getElementById('sat3dCameraText');

            if (countEl) countEl.textContent = `${this.currentShotIndex + 1} / ${shots.length}`;
            if (titleEl) titleEl.textContent = shot.title;
            if (statusEl) {
                const isCaptured = this.capturedShotKeys.has(shot.key);
                statusEl.style.display = isCaptured ? 'inline-block' : 'none';
            }
            if (camBadgeEl) {
                camBadgeEl.textContent = `${shot.range}m • ${shot.tilt}°`;
            }
        },

        /**
         * Mevcut Açıyı Havuzda Olarak İşaretler
         */
        markCurrentShotCaptured: function() {
            const sat = window.SatelliteMapModule;
            let info = (sat && typeof sat.getParcelDimensionsAndRanges === 'function') ? sat.getParcelDimensionsAndRanges() : null;
            if (!info) info = { rangeDetail: 450, rangeWide: 1000, rangeNadirClose: 400, rangeNadirFar: 850 };
            const shots = this.getShots(info);
            const shot = shots[this.currentShotIndex];
            if (shot) {
                this.capturedShotKeys.add(shot.key);
                this.syncNavUI(shots);
            }
        },

        /**
         * Otonom 12 Açılı Drone Çekim Dizisini Başlatır
         */
        start: async function() {
            if (this.isBusy) return;

            const sat = window.SatelliteMapModule;
            if (!sat) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Uydu haritası modülü henüz hazır değil.', 'warning');
                }
                return;
            }

            // 1. Parsel kontrolü
            if (!sat.parcelData || !sat.parcelData.latLngs || sat.parcelData.latLngs.length < 3) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Lütfen önce bir KML/KMZ dosyası yükleyin veya harita üzerinde arsa sınırlarını belirleyin.', 'warning', 4500);
                } else {
                    alert('Lütfen önce bir KML/KMZ arsa dosyası yükleyin.');
                }
                return;
            }

            this.isBusy = true;
            this.isAborted = false;

            // 2. Arsa boyut ve mesafe hesaplamaları
            let info = null;
            if (typeof sat.getParcelDimensionsAndRanges === 'function') {
                info = sat.getParcelDimensionsAndRanges();
            }
            if (!info) {
                const cb = sat.getParcelCenterAndBounds ? sat.getParcelCenterAndBounds() : null;
                const c = cb ? cb.center : { lat: sat.currentLat, lng: sat.currentLng };
                info = {
                    center: c,
                    rangeDetail: 450,
                    rangeWide: 1000,
                    rangeNadirClose: 400,
                    rangeNadirFar: 850,
                    rangeNadir: 400,
                    diagonalMeters: 80,
                    elevation: sat.parcelElevation || 0
                };
            }
            if (info && info.center && (!info.elevation || info.elevation === 0) && typeof sat.getGroundElevation === 'function') {
                try {
                    info.elevation = await sat.getGroundElevation(info.center.lat, info.center.lng);
                    sat.parcelElevation = info.elevation;
                } catch(e) {}
            }

            const centerLat = Number(info.center.lat).toFixed(6);
            const centerLng = Number(info.center.lng).toFixed(6);

            // 3. 3D Modun ve Parsel Çiziminin Kesin Hazır Olduğundan Emin Ol
            try {
                await this.ensure3DReady(sat, info);
            } catch(e) {
                this.isBusy = false;
                this.hideHud();
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('3D Harita hazırlanamadı: ' + e.message, 'error', 4500);
                }
                return;
            }

            if (this.isAborted) {
                this.isBusy = false;
                this.hideHud();
                return;
            }

            // 4. Profesyonel 12 Açılı Çekim Seti
            const shots = this.getShots(info);
            const capturedResults = [];

            try {
                for (let i = 0; i < shots.length; i++) {
                    if (this.isAborted) {
                        break;
                    }

                    const shot = shots[i];
                    this.currentShotIndex = i;
                    this.capturedShotKeys.add(shot.key);
                    this.syncNavUI(shots);

                    const progressPct = Math.round(((i) / shots.length) * 100);
                    this.showHud(
                        `${shot.title} Çekiliyor`,
                        `Kamera yönlendiriliyor ve 3B doku netleştiriliyor (${i + 1} / ${shots.length})`,
                        progressPct
                    );

                    // Kamerayı yeni açıya uçur (Perspektif düşey merkezleme hesaplaması ile)
                    const map3d = sat.map3dElement || document.querySelector('gmp-map-3d');
                    if (map3d) {
                        let camTarget = info.center;
                        if (typeof sat.getPerspectiveCameraTarget === 'function') {
                            camTarget = sat.getPerspectiveCameraTarget(info.center, shot.heading, shot.tilt, shot.range);
                        }

                        const targetLat = Number(camTarget.lat).toFixed(7);
                        const targetLng = Number(camTarget.lng).toFixed(7);

                        // Varsa süren önceki animasyonu durdur (çarpışmaları ve gökyüzüne sıçramaları önle)
                        if (typeof map3d.stopCameraAnimation === 'function') {
                            try { map3d.stopCameraAnimation(); } catch(e) {}
                        }

                        // Kamerayı doğrudan hedef açıya ve mesafeye konumlandır (Parabolik gökyüzü sıçraması ve gidip-gelme olmadan temiz dönüş)
                        const targetAlt = (typeof camTarget.altitude === 'number') ? camTarget.altitude : (info.elevation || sat.parcelElevation || 0);
                        try {
                            map3d.range = parseFloat(shot.range);
                            map3d.tilt = parseFloat(shot.tilt);
                            map3d.heading = parseFloat(shot.heading);
                            map3d.roll = 0;
                            map3d.center = { lat: parseFloat(targetLat), lng: parseFloat(targetLng), altitude: targetAlt };
                        } catch(e) {}

                        map3d.setAttribute('center', `${targetLat},${targetLng},${targetAlt}`);
                        map3d.setAttribute('range', shot.range.toString());
                        map3d.setAttribute('tilt', shot.tilt.toString());
                        map3d.setAttribute('heading', shot.heading.toString());

                        if (typeof sat.mount3DParcelPolygon === 'function') {
                            sat.mount3DParcelPolygon(map3d);
                        }
                    }

                    // 3D doku ve fotogerçekçi poligonun tam oturması için bekle
                    const waitTime = (i === 0) ? 3800 : 3000;
                    await this.waitForTiles(map3d, waitTime);

                    if (this.isAborted) break;

                    // Çekim anında poligonun çizildiğinden emin ol
                    if (map3d && typeof sat.mount3DParcelPolygon === 'function') {
                        sat.mount3DParcelPolygon(map3d);
                    }

                    // Çift katmanlı çekim: 2K/4K Master (Tuval için) + 25KB Mikro-Thumbnail (Panel için)
                    let snapResult = null;
                    if (typeof sat.captureSnapshotDataUrl === 'function') {
                        snapResult = await sat.captureSnapshotDataUrl({
                            isFullRes: true,
                            withThumb: true,
                            format: 'image/jpeg',
                            quality: 0.94
                        });
                    }

                    const dataUrl = (snapResult && typeof snapResult === 'object') ? snapResult.dataUrl : snapResult;
                    const thumbUrl = (snapResult && typeof snapResult === 'object') ? snapResult.thumbUrl : dataUrl;

                    if (dataUrl) {
                        capturedResults.push({
                            id: 'drone_' + shot.key + '_' + Date.now(),
                            key: shot.key,
                            title: shot.title,
                            subTitle: shot.subTitle,
                            icon: shot.icon,
                            dataUrl: dataUrl,       // 🎯 Tam 2K/4K Master Görsel (Tuval ve Dışa Aktarma İçin)
                            thumbUrl: thumbUrl,     // 🪶 Hafif 25 KB Önizleme (Sol Panel DOM İçin)
                            heading: shot.heading,
                            tilt: shot.tilt,
                            range: shot.range,
                            parcelMeta: sat.parcelData || {},
                            timestamp: Date.now()
                        });
                    }
                }

                this.showHud('Çekimler Tamamlandı', 'Geçici arşive aktarılıyor...', 100);
                await new Promise(r => setTimeout(r, 400));
            } catch(err) {
                console.error("DroneRigEngine çekim hatası:", err);
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('Çekim sırasında hata oluştu: ' + err.message, 'error');
                }
            } finally {
                this.hideHud();
                this.isBusy = false;

                if (!this.isAborted && capturedResults.length > 0) {
                    // 1. Önce çekimleri Geçici Görsel Arşivine aktar ve tuvale uygula
                    if (window.PhotoStagingArchive && typeof window.PhotoStagingArchive.openWithItems === 'function') {
                        window.PhotoStagingArchive.openWithItems(capturedResults);
                    }

                    // 2. Harita modalını güvenli kapat
                    if (typeof window.closeSatelliteMapModal === 'function') {
                        window.closeSatelliteMapModal();
                    }

                    if (typeof window.showAppToast === 'function') {
                        window.showAppToast(`${capturedResults.length} açılı drone çekimi tamamlandı • Arşivden sırayla düzenleyebilirsiniz`, 'success', 4500);
                    }
                }
            }
        },

        /**
         * Google 3D Earth ve Parsel Poligonunun Kesin Hazır Olmasını Bekler
         */
        ensure3DReady: async function(sat, info) {
            // 1. 3D mod aktif değilse veya bileşen yoksa başlat
            if (!sat.is3DActive || !sat.map3dElement) {
                this.showHud('3D Harita Hazırlanıyor...', 'Google 3D Dünya başlatılıyor...', 5);
                sat.loadAndMountGoogle3D();
            }

            // 2. map3dElement'in DOM'a bağlanmasını bekle
            let map3d = null;
            const startWait = Date.now();
            while (Date.now() - startWait < 12000) {
                map3d = sat.map3dElement || document.querySelector('gmp-map-3d') || document.getElementById('sat3dMapHost')?.querySelector('gmp-map-3d');
                if (map3d && map3d.isConnected) {
                    sat.map3dElement = map3d;
                    sat.is3DActive = true;
                    break;
                }
                await new Promise(r => setTimeout(r, 200));
            }

            if (!map3d) {
                throw new Error("Google 3D haritası yüklenemedi. Lütfen internet bağlantınızı kontrol edin.");
            }

            // 3. Web bileşeni CustomElements kaydını bekle
            if (window.customElements && typeof window.customElements.whenDefined === 'function') {
                try {
                    await Promise.race([
                        window.customElements.whenDefined('gmp-map-3d'),
                        new Promise(r => setTimeout(r, 4000))
                    ]);
                } catch(e) {}
            }

            const initialTilt = 65;
            const initialHeading = 0;
            const initialRange = info.rangeDetail;
            let initialTarget = info.center;
            if (typeof sat.getPerspectiveCameraTarget === 'function') {
                initialTarget = sat.getPerspectiveCameraTarget(info.center, initialHeading, initialTilt, initialRange);
            }
            const initLat = Number(initialTarget.lat).toFixed(7);
            const initLng = Number(initialTarget.lng).toFixed(7);

            // Başlangıç kamerasını parsele ve perspektif optik merkezine kilitle
            const initAlt = (typeof initialTarget.altitude === 'number') ? initialTarget.altitude : (info.elevation || sat.parcelElevation || 0);
            if (typeof map3d.stopCameraAnimation === 'function') {
                try { map3d.stopCameraAnimation(); } catch(e) {}
            }
            try {
                map3d.range = parseFloat(initialRange);
                map3d.tilt = initialTilt;
                map3d.heading = initialHeading;
                map3d.roll = 0;
                map3d.center = { lat: parseFloat(initLat), lng: parseFloat(initLng), altitude: initAlt };
            } catch(e) {}

            map3d.setAttribute('center', `${initLat},${initLng},${initAlt}`);
            map3d.setAttribute('range', initialRange.toString());
            map3d.setAttribute('tilt', initialTilt.toString());
            map3d.setAttribute('heading', initialHeading.toString());

            // Poligonu monte et
            if (typeof sat.mount3DParcelPolygon === 'function') {
                sat.mount3DParcelPolygon(map3d);
            }

            // İlk dokuların ve WebGL sahnesinin oturmasını bekle
            this.showHud('3D Dokular Netleştiriliyor...', 'Fotogerçekçi dünya ve arsa sınırları yükleniyor...', 8);
            await this.waitForTiles(map3d, 4000);

            // İkinci kez doğrula (dokular oturunca poligon çizimi tazelenir)
            if (typeof sat.mount3DParcelPolygon === 'function') {
                sat.mount3DParcelPolygon(map3d);
            }
        },

        /**
         * 3B Karoların ve Dokuların Netleşmesini Bekler
         */
        waitForTiles: function(map3d, waitMs = 3000) {
            return new Promise(resolve => {
                let resolved = false;
                const startTime = Date.now();
                const minWait = Math.max(1600, waitMs * 0.6);

                const checkSteady = () => {
                    const elapsed = Date.now() - startTime;
                    if (elapsed >= minWait && !resolved) {
                        // Eğer map3d.steady özelliği varsa ve true ise erken tamamla
                        if (map3d && (map3d.steady === true || map3d.isSteady === true)) {
                            cleanup();
                            resolve();
                        }
                    }
                };

                const onSteady = () => {
                    checkSteady();
                };

                const cleanup = () => {
                    resolved = true;
                    if (map3d && typeof map3d.removeEventListener === 'function') {
                        map3d.removeEventListener('gmp-steadychange', onSteady);
                        map3d.removeEventListener('gmp-steady-change', onSteady);
                    }
                };

                if (map3d && typeof map3d.addEventListener === 'function') {
                    map3d.addEventListener('gmp-steadychange', onSteady);
                    map3d.addEventListener('gmp-steady-change', onSteady);
                }

                // Periyodik kontrol
                const pollInterval = setInterval(() => {
                    if (resolved) {
                        clearInterval(pollInterval);
                        return;
                    }
                    checkSteady();
                }, 200);

                setTimeout(() => {
                    if (!resolved) {
                        clearInterval(pollInterval);
                        cleanup();
                        resolve();
                    }
                }, waitMs);
            });
        },

        /**
         * Çekim sürecini iptal et
         */
        abort: function() {
            this.isAborted = true;
            this.hideHud();
            this.isBusy = false;
            if (typeof window.showAppToast === 'function') {
                window.showAppToast('Drone çekimi kullanıcı tarafından durduruldu.', 'info');
            }
        },

        /**
         * Şık HUD İlerleme Bildirimi
         */
        showHud: function(title, sub, pct) {
            let hud = document.getElementById('satDroneRigHud');
            if (!hud) {
                hud = document.createElement('div');
                hud.id = 'satDroneRigHud';
                hud.style.cssText = `
                    position: fixed;
                    top: 28px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(15, 23, 42, 0.92);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(56, 189, 248, 0.35);
                    border-radius: 12px;
                    padding: 14px 22px;
                    color: #f8fafc;
                    z-index: 9999999;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    min-width: 320px;
                    font-family: 'Space Grotesk', 'Inter', sans-serif;
                    pointer-events: auto;
                    transition: all 0.25s ease;
                `;
                hud.innerHTML = `
                    <div style="display:flex; align-items:center; justify-content:space-between; width:100%; gap:12px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <i class="fa-solid fa-crosshairs" style="color:#38bdf8; font-size:16px;"></i>
                            <span id="satDroneHudTitle" style="font-weight:700; font-size:14px; color:#f8fafc;">Otonom Drone Çekimi</span>
                        </div>
                        <button type="button" onclick="DroneRigEngine.abort()" style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size:11.5px; font-weight:600; padding:2px 6px; border-radius:4px;" title="İptal Et">İptal</button>
                    </div>
                    <div id="satDroneHudSub" style="font-size:11.5px; color:#94a3b8; width:100%; text-align:left;">Kamera yönlendiriliyor...</div>
                    <div style="width:100%; height:5px; background:rgba(255,255,255,0.12); border-radius:3px; overflow:hidden;">
                        <div id="satDroneHudBar" style="width:${pct}%; height:100%; background:linear-gradient(90deg, #38bdf8, #00cec9); transition:width 0.3s ease;"></div>
                    </div>
                `;
                document.body.appendChild(hud);
                this.hudElement = hud;
            }

            const tEl = document.getElementById('satDroneHudTitle');
            const sEl = document.getElementById('satDroneHudSub');
            const bEl = document.getElementById('satDroneHudBar');
            if (tEl) tEl.textContent = title;
            if (sEl) sEl.textContent = sub;
            if (bEl) bEl.style.width = `${Math.min(100, Math.max(5, pct))}%`;
            hud.style.display = 'flex';
        },

        hideHud: function() {
            const hud = document.getElementById('satDroneRigHud');
            if (hud) hud.style.display = 'none';
        }
    };

    window.DroneRigEngine = DroneRigEngine;
    window.startAutoDroneCapture = function() {
        DroneRigEngine.start();
    };

})(window);
