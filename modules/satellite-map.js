/**
 * =========================================================================
 * EMLAK STÜDYOM - CANLI UYDU HARİTASI & KONUM GÖRSELİ (PRO v7.1)
 * modules/satellite-map.js (Modular Shim & Backward Compatibility)
 * =========================================================================
 * Bu dosya performansı artırmak amacıyla 3 bağımsız alt modüle ayrılmıştır:
 * 1. modules/satellite-core.js     (Harita motoru, Leaflet, Google 3D, Arama, Modal DOM)
 * 2. modules/satellite-cadastre.js (TKGM Parsel, KML / GeoJSON ayrıştırma)
 * 3. modules/satellite-measure.js  (Çok noktalı mesafe, alan ve cephe analizi)
 * 
 * Orijinal yedek: archive/satellite-map.original.js
 */

(function(window) {
    'use strict';

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const cleanSrc = src.split('?')[0];
            const existing = document.querySelector(`script[src*="${cleanSrc}"]`);
            if (existing) {
                if (window.SatelliteMapModule && window.openSatelliteMapModal) return resolve();
                existing.addEventListener('load', () => resolve(), { once: true });
                existing.addEventListener('error', (e) => reject(e), { once: true });
                return;
            }
            const s = document.createElement('script');
            s.src = src;
            s.async = false;
            s.onload = () => resolve();
            s.onerror = (e) => reject(e);
            document.head.appendChild(s);
        });
    }

    // Gerekli alt modülleri asenkron hazırla
    window.ensureSatelliteMapLoaded = async function() {
        if (window.openSatelliteMapModal && window.SatelliteMapModule && typeof window.SatelliteMapModule.openModal === 'function') {
            return true;
        }
        const v = '20260918-6';
        try {
            await loadScript(`modules/satellite-core.js?v=${v}`);
            await loadScript(`modules/satellite-cadastre.js?v=${v}`);
            await loadScript(`modules/satellite-measure.js?v=${v}`);
            return true;
        } catch(e) {
            console.error('[SatelliteMap] Alt modüller yüklenirken hata oluştu:', e);
            return false;
        }
    };

    // Global açılış fonksiyonu hazır değilse güvenli vekil fonksiyon (proxy)
    if (!window.openSatelliteMapModal) {
        window.openSatelliteMapModal = async function() {
            if (window.innerWidth <= 768) {
                if (typeof window.showAppToast === 'function') {
                    window.showAppToast('🛰️ Uydu haritası özelliği masaüstü cihazlar için optimize edilmiştir.', 'info');
                }
                return;
            }
            if (typeof window.showAppLoading === 'function') {
                window.showAppLoading('Uydu Haritası Başlatılıyor...', 'Google Earth & Kadastro modülleri hazırlanıyor...');
            }
            const ok = await window.ensureSatelliteMapLoaded();
            if (typeof window.hideAppLoading === 'function') {
                window.hideAppLoading();
            }
            if (ok && window.SatelliteMapModule && typeof window.SatelliteMapModule.openModal === 'function') {
                window.SatelliteMapModule.openModal();
            } else if (typeof window.showAppToast === 'function') {
                window.showAppToast('Uydu haritası başlatılamadı. Lütfen sayfayı yenileyin.', 'error');
            }
        };
    }
})(typeof window !== 'undefined' ? window : this);
