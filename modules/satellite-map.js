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
    if (typeof window !== 'undefined' && !window.SatelliteMapModule) {
        console.warn('[SatelliteMap] Modüler yapı devrede. satellite-core.js, satellite-cadastre.js ve satellite-measure.js kullanılmaktadır.');
    }
})(typeof window !== 'undefined' ? window : this);
