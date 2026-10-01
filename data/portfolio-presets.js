/**
 * ========================================================
 * EMLAK STÜDYOM - 35+ TEK TIKLA HAZIR PORTFÖY VİTRİNİ TASLAKLARI
 * data/portfolio-presets.js
 * ========================================================
 */

(function(window) {
    'use strict';

    window.PortfolioPresetsData = [
        // --- 1. LÜKS VİLLA & MALİKANE (1:1 & 16:9 & 9:16) ---
        {
            id: 'preset_villa_lux_1',
            name: 'Satılık Lüks Villa',
            category: 'villa',
            ratio: '1:1',
            bg: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #1e1b4b 100%)',
            previewColor: '#f59e0b',
            frames: [
                { x: 0.04, y: 0.16, w: 0.92, h: 0.54, radius: 18, shadow: 18, shape: 'none', blend: 'none' },
                { x: 0.04, y: 0.72, w: 0.44, h: 0.22, radius: 14, shadow: 10, shape: 'none', blend: 'none' },
                { x: 0.52, y: 0.72, w: 0.44, h: 0.22, radius: 14, shadow: 10, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '⭐ PORTFÖY VİTRİNİ', x: 0.04, y: 0.03, fontSize: 13, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
                { type: 'heading', text: 'SATILIK LÜKS VİLLA', x: 0.04, y: 0.07, fontSize: 32, color: '#ffffff', fontWeight: '800' },
                { type: 'subheading', text: 'Özel Havuzlu & Müstakil Bahçeli', x: 0.04, y: 0.115, fontSize: 16, color: '#cbd5e1' },
                { type: 'price', text: '₺ 28.500.000', x: 0.62, y: 0.065, fontSize: 24, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
                { type: 'features', text: '5+2 | 450 m² | Akıllı Ev | 4 Araçlık Otopark | Sauna', x: 0.04, y: 0.955, fontSize: 13, color: '#94a3b8' }
            ]
        },
        {
            id: 'preset_villa_dublex_sea',
            name: 'Deniz Manzaralı Dubleks',
            category: 'villa',
            ratio: '1:1',
            bg: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)',
            previewColor: '#10b981',
            frames: [
                { x: 0.05, y: 0.15, w: 0.58, h: 0.72, radius: 20, shadow: 16, shape: 'none', blend: 'none' },
                { x: 0.66, y: 0.15, w: 0.29, h: 0.34, radius: 14, shadow: 12, shape: 'none', blend: 'none' },
                { x: 0.66, y: 0.53, w: 0.29, h: 0.34, radius: 14, shadow: 12, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '🌊 DENİZ MANZARALI', x: 0.05, y: 0.04, fontSize: 13, color: '#34d399', bg: 'rgba(52, 211, 153, 0.18)' },
                { type: 'heading', text: 'PANORAMİK DUBLEKS', x: 0.05, y: 0.08, fontSize: 30, color: '#ffffff', fontWeight: '800' },
                { type: 'price', text: '₺ 19.750.000', x: 0.64, y: 0.07, fontSize: 22, color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' },
                { type: 'features', text: '4+1 | 280 m² | Geniş Teras | Jakuzi | Yerden Isıtma', x: 0.05, y: 0.90, fontSize: 14, color: '#a7f3d0' }
            ]
        },
        {
            id: 'preset_villa_bogaz',
            name: 'Boğaz Manzaralı Malikane',
            category: 'villa',
            ratio: '16:9',
            bg: 'linear-gradient(135deg, #0b0f19 0%, #1e1b4b 60%, #31104b 100%)',
            previewColor: '#8b5cf6',
            frames: [
                { x: 0.03, y: 0.06, w: 0.56, h: 0.88, radius: 16, shadow: 20, shape: 'none', blend: 'none' },
                { x: 0.62, y: 0.38, w: 0.35, h: 0.56, radius: 14, shadow: 14, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '👑 PRESTİJ KOLEKSİYONU', x: 0.62, y: 0.08, fontSize: 14, color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)' },
                { type: 'heading', text: 'BOĞAZ HATTI MALİKANE', x: 0.62, y: 0.14, fontSize: 36, color: '#ffffff', fontWeight: '900' },
                { type: 'subheading', text: 'Tarihi Doku & Modern Mimari Buluşması', x: 0.62, y: 0.22, fontSize: 18, color: '#cbd5e1' },
                { type: 'price', text: '₺ 85.000.000', x: 0.62, y: 0.28, fontSize: 26, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)' }
            ]
        },
        {
            id: 'preset_villa_modern_story',
            name: 'Modern Villa Hikaye',
            category: 'villa',
            ratio: '9:16',
            bg: 'linear-gradient(180deg, #0f172a 0%, #1e293b 60%, #0284c7 100%)',
            previewColor: '#38bdf8',
            frames: [
                { x: 0.05, y: 0.14, w: 0.90, h: 0.44, radius: 24, shadow: 16, shape: 'none', blend: 'none' },
                { x: 0.05, y: 0.60, w: 0.90, h: 0.26, radius: 18, shadow: 14, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '✨ YENİ PORTFÖY', x: 0.05, y: 0.04, fontSize: 14, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
                { type: 'heading', text: 'MÜSTAKİL VİLLA', x: 0.05, y: 0.07, fontSize: 34, color: '#ffffff', fontWeight: '800' },
                { type: 'price', text: '₺ 32.000.000', x: 0.05, y: 0.88, fontSize: 28, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.2)' },
                { type: 'features', text: '6+2 | 520 m² | Özel Havuz | Kış Bahçesi', x: 0.05, y: 0.94, fontSize: 15, color: '#e2e8f0' }
            ]
        },
        {
            id: 'preset_villa_organic_cloud',
            name: 'Organik Şekilli Doğa Villası',
            category: 'villa',
            ratio: '1:1',
            bg: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #064e3b 100%)',
            previewColor: '#14b8a6',
            frames: [
                { x: 0.08, y: 0.18, w: 0.84, h: 0.60, radius: 0, shadow: 16, shape: 'cloud', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '🌲 DOĞA İÇİNDE YAŞAM', x: 0.08, y: 0.05, fontSize: 13, color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)' },
                { type: 'heading', text: 'ORMAN KENARI MÜSTAKİL', x: 0.08, y: 0.09, fontSize: 30, color: '#ffffff', fontWeight: '800' },
                { type: 'price', text: '₺ 21.500.000', x: 0.08, y: 0.82, fontSize: 24, color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)' },
                { type: 'features', text: '4+1 | 350 m² | 1000 m² Bahçe | Şömine | Doğal Taş Kaplama', x: 0.08, y: 0.89, fontSize: 14, color: '#ccfbf1' }
            ]
        },

        // --- 2. DAİRE & REZİDANS & KONUT ---
        {
            id: 'preset_daire_firsat',
            name: 'Kiralık Daire Fırsatı',
            category: 'daire',
            ratio: '1:1',
            bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            previewColor: '#38bdf8',
            frames: [
                { x: 0.05, y: 0.18, w: 0.44, h: 0.50, radius: 14, shadow: 12, shape: 'none', blend: 'none' },
                { x: 0.51, y: 0.18, w: 0.44, h: 0.24, radius: 14, shadow: 10, shape: 'none', blend: 'none' },
                { x: 0.51, y: 0.44, w: 0.44, h: 0.24, radius: 14, shadow: 10, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '🔑 KİRALIK FIRSAT', x: 0.05, y: 0.04, fontSize: 13, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
                { type: 'heading', text: 'MODERN 3+1 DAİRE', x: 0.05, y: 0.08, fontSize: 32, color: '#ffffff', fontWeight: '800' },
                { type: 'subheading', text: 'Metroya & Alışveriş Merkezine 5 Dk', x: 0.05, y: 0.125, fontSize: 15, color: '#94a3b8' },
                { type: 'price', text: '₺ 38.000 / Ay', x: 0.05, y: 0.72, fontSize: 24, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.18)' },
                { type: 'features', text: '135 m² | Ebeveyn Banyolu | Kapalı Otopark | 7/24 Güvenlik | Asansör', x: 0.05, y: 0.80, fontSize: 14, color: '#e2e8f0' }
            ]
        },
        {
            id: 'preset_daire_sifir',
            name: 'Sıfır Lüks Rezidans',
            category: 'daire',
            ratio: '1:1',
            bg: 'linear-gradient(135deg, #18181b 0%, #27272a 60%, #3f3f46 100%)',
            previewColor: '#e4e4e7',
            frames: [
                { x: 0.05, y: 0.14, w: 0.90, h: 0.58, radius: 16, shadow: 16, shape: 'none', blend: 'none' },
                { x: 0.05, y: 0.74, w: 0.28, h: 0.20, radius: 12, shadow: 10, shape: 'none', blend: 'none' },
                { x: 0.36, y: 0.74, w: 0.28, h: 0.20, radius: 12, shadow: 10, shape: 'none', blend: 'none' },
                { x: 0.67, y: 0.74, w: 0.28, h: 0.20, radius: 12, shadow: 10, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '🏢 SIFIR REZİDANS', x: 0.05, y: 0.03, fontSize: 13, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
                { type: 'heading', text: 'PRESTİJLİ YAŞAM PROJESİ', x: 0.05, y: 0.07, fontSize: 28, color: '#ffffff', fontWeight: '800' },
                { type: 'price', text: '₺ 14.900.000', x: 0.65, y: 0.065, fontSize: 22, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' }
            ]
        },
        {
            id: 'preset_daire_penthouse_3d',
            name: '3D Eğimli Penthouse Vitrini',
            category: 'daire',
            ratio: '16:9',
            bg: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #0284c7 100%)',
            previewColor: '#0284c7',
            frames: [
                { x: 0.04, y: 0.10, w: 0.54, h: 0.80, radius: 16, shadow: 22, shape: 'none', blend: 'none', pitch: 16, yaw: -20, elevation: 14 }
            ],
            texts: [
                { type: 'badge', text: '🌆 ULTRA LÜKS PENTHOUSE', x: 0.62, y: 0.12, fontSize: 14, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
                { type: 'heading', text: 'ŞEHİRİN ZİRVESİNDE', x: 0.62, y: 0.19, fontSize: 38, color: '#ffffff', fontWeight: '900' },
                { type: 'subheading', text: '360° Kesintisiz Şehir & Deniz Manzarası', x: 0.62, y: 0.28, fontSize: 18, color: '#94a3b8' },
                { type: 'price', text: '₺ 45.000.000', x: 0.62, y: 0.36, fontSize: 28, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.2)' },
                { type: 'features', text: '4+1 | 380 m² | Özel Asansör | Sonsuzluk Havuzu | Helikopter Pisti', x: 0.62, y: 0.46, fontSize: 15, color: '#cbd5e1' }
            ]
        },
        {
            id: 'preset_daire_studio_yatirim',
            name: 'Yatırımlık Stüdyo Daire',
            category: 'daire',
            ratio: '1:1',
            bg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            previewColor: '#f97316',
            frames: [
                { x: 0.05, y: 0.16, w: 0.90, h: 0.58, radius: 16, shadow: 14, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '📈 YÜKSEK KİRA GETİRİSİ', x: 0.05, y: 0.04, fontSize: 13, color: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)' },
                { type: 'heading', text: 'YATIRIMLIK 1+1 DAİRE', x: 0.05, y: 0.08, fontSize: 30, color: '#ffffff', fontWeight: '800' },
                { type: 'price', text: '₺ 3.850.000', x: 0.05, y: 0.78, fontSize: 24, color: '#fb923c', bg: 'rgba(251, 146, 60, 0.18)' },
                { type: 'features', text: '55 m² | Full Eşyalı | Üniversiteye 3 Dk | Aylık Kira Potansiyeli 25.000 ₺', x: 0.05, y: 0.86, fontSize: 14, color: '#fed7aa' }
            ]
        },
        {
            id: 'preset_daire_daire_circle',
            name: 'Daire Vitrini Daire Çerçeveli',
            category: 'daire',
            ratio: '1:1',
            bg: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
            previewColor: '#6366f1',
            frames: [
                { x: 0.05, y: 0.18, w: 0.45, h: 0.45, isCircle: 'true', radius: 999, shadow: 14, shape: 'none', blend: 'none' },
                { x: 0.52, y: 0.18, w: 0.43, h: 0.45, radius: 16, shadow: 12, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '📍 MERKEZİ LOKASYON', x: 0.05, y: 0.04, fontSize: 13, color: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)' },
                { type: 'heading', text: 'KADIKÖY SAHİLDE 2+1', x: 0.05, y: 0.08, fontSize: 30, color: '#ffffff', fontWeight: '800' },
                { type: 'price', text: '₺ 9.450.000', x: 0.05, y: 0.70, fontSize: 24, color: '#818cf8', bg: 'rgba(129, 140, 248, 0.18)' },
                { type: 'features', text: '95 m² | Balkonlu | Doğalgaz Kombi | Sahile 150 Metre', x: 0.05, y: 0.78, fontSize: 14, color: '#c7d2fe' }
            ]
        },

        // --- 3. ARSA, PARSEL & TARLA ---
        {
            id: 'preset_arsa_imarlı',
            name: 'Yatırımlık İmarlı Arsa',
            category: 'arsa',
            ratio: '1:1',
            bg: 'linear-gradient(135deg, #064e3b 0%, #022c22 60%, #0f172a 100%)',
            previewColor: '#10b981',
            frames: [
                { x: 0.04, y: 0.16, w: 0.92, h: 0.58, radius: 16, shadow: 16, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '📐 İMARLI & İFRAZLI', x: 0.04, y: 0.03, fontSize: 13, color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' },
                { type: 'heading', text: 'VİLLA İMARLI ARSA', x: 0.04, y: 0.07, fontSize: 32, color: '#ffffff', fontWeight: '800' },
                { type: 'price', text: '₺ 7.800.000', x: 0.65, y: 0.065, fontSize: 24, color: '#34d399', bg: 'rgba(52, 211, 153, 0.18)' },
                { type: 'features', text: '650 m² | Emsal: 0.40 | 2.5 Kat İzinli | Yol, Su, Elektrik Mevcut | Hemen İnşaat Yapılabilir', x: 0.04, y: 0.78, fontSize: 14, color: '#a7f3d0' }
            ]
        },
        {
            id: 'preset_arsa_zeytinlik',
            name: 'Deniz Manzaralı Zeytinlik',
            category: 'arsa',
            ratio: '16:9',
            bg: 'linear-gradient(135deg, #14532d 0%, #052e16 60%, #0f172a 100%)',
            previewColor: '#22c55e',
            frames: [
                { x: 0.03, y: 0.06, w: 0.58, h: 0.88, radius: 18, shadow: 16, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '🌿 YATIRIMLIK MÜLK', x: 0.64, y: 0.10, fontSize: 14, color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
                { type: 'heading', text: 'DENİZE YAKIN ZEYTİNLİK', x: 0.64, y: 0.17, fontSize: 34, color: '#ffffff', fontWeight: '800' },
                { type: 'subheading', text: 'Ege Kıyısında Verimli & Müstakil Parsel', x: 0.64, y: 0.26, fontSize: 17, color: '#bbf7d0' },
                { type: 'price', text: '₺ 4.950.000', x: 0.64, y: 0.35, fontSize: 26, color: '#4ade80', bg: 'rgba(74, 222, 128, 0.2)' },
                { type: 'features', text: '3.200 m² | Kadastral Yola Cepheli | 85 Yetişkin Zeytin Ağacı', x: 0.64, y: 0.46, fontSize: 15, color: '#dcfce7' }
            ]
        },
        {
            id: 'preset_arsa_sanayi',
            name: 'Sanayi İmarlı Parsel',
            category: 'arsa',
            ratio: '1:1',
            bg: 'linear-gradient(135deg, #1c1917 0%, #292524 60%, #0c0a09 100%)',
            previewColor: '#f59e0b',
            frames: [
                { x: 0.05, y: 0.18, w: 0.44, h: 0.50, radius: 14, shadow: 12, shape: 'none', blend: 'none' },
                { x: 0.51, y: 0.18, w: 0.44, h: 0.50, radius: 14, shadow: 12, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '🏭 SANAYİ & DEPOLAMA', x: 0.05, y: 0.04, fontSize: 13, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
                { type: 'heading', text: 'TİCARİ SANAYİ PARSELİ', x: 0.05, y: 0.08, fontSize: 30, color: '#ffffff', fontWeight: '800' },
                { type: 'price', text: '₺ 42.000.000', x: 0.05, y: 0.72, fontSize: 24, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.18)' },
                { type: 'features', text: '5.000 m² | Emsal: 1.00 | Tır Girişine Uygun | Trafo & Altyapı Hazır', x: 0.05, y: 0.80, fontSize: 14, color: '#e7e5e4' }
            ]
        },
        {
            id: 'preset_arsa_ciftlik',
            name: 'Müstakil Çiftlik Arazisi',
            category: 'arsa',
            ratio: '9:16',
            bg: 'linear-gradient(180deg, #052e16 0%, #14532d 60%, #0f172a 100%)',
            previewColor: '#4ade80',
            frames: [
                { x: 0.05, y: 0.14, w: 0.90, h: 0.48, radius: 20, shadow: 16, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '🚜 ÇİFTLİK PROJESİ', x: 0.05, y: 0.04, fontSize: 14, color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
                { type: 'heading', text: 'MÜSTAKİL ÇİFTLİK', x: 0.05, y: 0.07, fontSize: 34, color: '#ffffff', fontWeight: '800' },
                { type: 'price', text: '₺ 11.500.000', x: 0.05, y: 0.66, fontSize: 26, color: '#4ade80', bg: 'rgba(74, 222, 128, 0.2)' },
                { type: 'features', text: '12.500 m² | Artezyen Su Kuyusu | Elektrik Hattı | Çiftlik Evi İzinli', x: 0.05, y: 0.74, fontSize: 15, color: '#dcfce7' }
            ]
        },

        // --- 4. TİCARİ MÜLK & OFİS & DÜKKAN ---
        {
            id: 'preset_ticari_plaza_ofis',
            name: 'Prestijli Plaza Ofisi',
            category: 'ticari',
            ratio: '1:1',
            bg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
            previewColor: '#6366f1',
            frames: [
                { x: 0.04, y: 0.15, w: 0.92, h: 0.52, radius: 18, shadow: 16, shape: 'none', blend: 'none' },
                { x: 0.04, y: 0.70, w: 0.44, h: 0.24, radius: 14, shadow: 10, shape: 'none', blend: 'none' },
                { x: 0.52, y: 0.70, w: 0.44, h: 0.24, radius: 14, shadow: 10, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '🏢 A+ PLAZA OFİS', x: 0.04, y: 0.03, fontSize: 13, color: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)' },
                { type: 'heading', text: 'SATILIK KAT OFİSİ', x: 0.04, y: 0.07, fontSize: 32, color: '#ffffff', fontWeight: '800' },
                { type: 'price', text: '₺ 22.000.000', x: 0.65, y: 0.065, fontSize: 24, color: '#818cf8', bg: 'rgba(129, 140, 248, 0.18)' }
            ]
        },
        {
            id: 'preset_ticari_dukkan_kose',
            name: 'Köşe Konum Cadde Dükkanı',
            category: 'ticari',
            ratio: '1:1',
            bg: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
            previewColor: '#f43f5e',
            frames: [
                { x: 0.05, y: 0.16, w: 0.90, h: 0.56, radius: 16, shadow: 14, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '🏪 CADDE CEPHELİ', x: 0.05, y: 0.04, fontSize: 13, color: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)' },
                { type: 'heading', text: 'KÖŞE BAŞI DÜKKAN', x: 0.05, y: 0.08, fontSize: 32, color: '#ffffff', fontWeight: '800' },
                { type: 'price', text: '₺ 35.000.000', x: 0.05, y: 0.76, fontSize: 26, color: '#fb7185', bg: 'rgba(251, 113, 133, 0.2)' },
                { type: 'features', text: '240 m² Giriş + 180 m² Depo | 18 Metre Vitrin Cephesi | Kurumsal Kiracılı', x: 0.05, y: 0.85, fontSize: 14, color: '#fecdd3' }
            ]
        },

        // --- 5. KAMPANYA & ACİL FIRSATLAR ---
        {
            id: 'preset_firsat_fiyat_dustu',
            name: 'Fiyatı Düştü Acil Portföy',
            category: 'firsat',
            ratio: '1:1',
            bg: 'linear-gradient(135deg, #450a0a 0%, #1c1917 60%, #0f172a 100%)',
            previewColor: '#ef4444',
            frames: [
                { x: 0.04, y: 0.16, w: 0.92, h: 0.56, radius: 16, shadow: 18, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '🔥 FİYATI DÜŞTÜ - ACİL', x: 0.04, y: 0.03, fontSize: 14, color: '#f87171', bg: 'rgba(248, 113, 113, 0.2)' },
                { type: 'heading', text: 'KELEPİR FIRSAT DAİRE', x: 0.04, y: 0.07, fontSize: 34, color: '#ffffff', fontWeight: '900' },
                { type: 'price', text: '₺ 4.950.000 (Eski: 5.600.000 ₺)', x: 0.04, y: 0.76, fontSize: 24, color: '#f87171', bg: 'rgba(248, 113, 113, 0.2)' },
                { type: 'features', text: '3+1 | 140 m² | Acil Satılık | Krediye Uygun | Masrafsız', x: 0.04, y: 0.85, fontSize: 15, color: '#fecaca' }
            ]
        },
        {
            id: 'preset_firsat_haftanin_ilani',
            name: 'Haftanın Özel İlanı',
            category: 'firsat',
            ratio: '1:1',
            bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #0f172a 100%)',
            previewColor: '#a855f7',
            frames: [
                { x: 0.05, y: 0.16, w: 0.44, h: 0.52, radius: 16, shadow: 14, shape: 'none', blend: 'none' },
                { x: 0.51, y: 0.16, w: 0.44, h: 0.52, radius: 16, shadow: 14, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '🏆 HAFTANIN EN İYİ İLANI', x: 0.05, y: 0.04, fontSize: 13, color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)' },
                { type: 'heading', text: 'ÖZEL FIRSAT PORTFÖYÜ', x: 0.05, y: 0.08, fontSize: 30, color: '#ffffff', fontWeight: '800' },
                { type: 'price', text: '₺ 8.750.000', x: 0.05, y: 0.72, fontSize: 24, color: '#c084fc', bg: 'rgba(192, 132, 252, 0.18)' },
                { type: 'features', text: 'Şehir Merkezinde | Yüksek Kira Getirisi | Sıfır Bina', x: 0.05, y: 0.80, fontSize: 14, color: '#e9d5ff' }
            ]
        },
        {
            id: 'preset_firsat_takasli',
            name: 'Takasa Uygun Portföy',
            category: 'firsat',
            ratio: '1:1',
            bg: 'linear-gradient(135deg, #022c22 0%, #1e293b 100%)',
            previewColor: '#10b981',
            frames: [
                { x: 0.05, y: 0.16, w: 0.90, h: 0.58, radius: 16, shadow: 14, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '🔄 TAKASA AÇIK', x: 0.05, y: 0.04, fontSize: 13, color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' },
                { type: 'heading', text: 'ARAÇ & GAYRİMENKUL TAKASLI', x: 0.05, y: 0.08, fontSize: 28, color: '#ffffff', fontWeight: '800' },
                { type: 'price', text: '₺ 6.250.000', x: 0.05, y: 0.78, fontSize: 24, color: '#34d399', bg: 'rgba(52, 211, 153, 0.18)' },
                { type: 'features', text: 'Mantıklı Araç ve Daire Takaslarına Açıktır', x: 0.05, y: 0.86, fontSize: 15, color: '#a7f3d0' }
            ]
        },

        // --- 6. KOLAJ & ÇOKLU FOTOĞRAF TURU ---
        {
            id: 'preset_kolaj_4_oda',
            name: '4 Fotoğraflı Ev Turu',
            category: 'kolaj',
            ratio: '1:1',
            bg: '#0f172a',
            previewColor: '#38bdf8',
            frames: [
                { x: 0.04, y: 0.14, w: 0.44, h: 0.38, radius: 14, shadow: 10, shape: 'none', blend: 'none' },
                { x: 0.52, y: 0.14, w: 0.44, h: 0.38, radius: 14, shadow: 10, shape: 'none', blend: 'none' },
                { x: 0.04, y: 0.55, w: 0.44, h: 0.38, radius: 14, shadow: 10, shape: 'none', blend: 'none' },
                { x: 0.52, y: 0.55, w: 0.44, h: 0.38, radius: 14, shadow: 10, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'heading', text: 'KOMPLE DAİRE TURU', x: 0.04, y: 0.04, fontSize: 28, color: '#ffffff', fontWeight: '800' },
                { type: 'subheading', text: 'Salon | Mutfak | Ebeveyn Odası | Balkon', x: 0.04, y: 0.085, fontSize: 14, color: '#94a3b8' },
                { type: 'price', text: '₺ 11.200.000', x: 0.65, y: 0.04, fontSize: 22, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' }
            ]
        },
        {
            id: 'preset_kolaj_manset_3_detay',
            name: '1 Manşet + 3 Detay Kolajı',
            category: 'kolaj',
            ratio: '1:1',
            bg: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
            previewColor: '#818cf8',
            frames: [
                { x: 0.04, y: 0.14, w: 0.58, h: 0.78, radius: 16, shadow: 14, shape: 'none', blend: 'none' },
                { x: 0.65, y: 0.14, w: 0.31, h: 0.24, radius: 12, shadow: 10, shape: 'none', blend: 'none' },
                { x: 0.65, y: 0.41, w: 0.31, h: 0.24, radius: 12, shadow: 10, shape: 'none', blend: 'none' },
                { x: 0.65, y: 0.68, w: 0.31, h: 0.24, radius: 12, shadow: 10, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'heading', text: 'LÜKS MİMARİ VİTRİNİ', x: 0.04, y: 0.04, fontSize: 28, color: '#ffffff', fontWeight: '800' },
                { type: 'price', text: '₺ 16.500.000', x: 0.65, y: 0.04, fontSize: 22, color: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)' }
            ]
        },
        {
            id: 'preset_kolaj_degrade_gecis',
            name: 'Pürüzsüz Degrade Geçişli Vitrin',
            category: 'kolaj',
            ratio: '1:1',
            bg: 'linear-gradient(180deg, #0f172a 0%, #0284c7 100%)',
            previewColor: '#38bdf8',
            frames: [
                { x: 0.05, y: 0.15, w: 0.90, h: 0.60, radius: 0, shadow: 0, shape: 'none', blend: 'bottom' }
            ],
            texts: [
                { type: 'badge', text: '🌟 ÖZEL MİMARİ', x: 0.05, y: 0.04, fontSize: 13, color: '#ffffff', bg: 'rgba(255, 255, 255, 0.18)' },
                { type: 'heading', text: 'DENİZ SIFIR REZİDANS', x: 0.05, y: 0.08, fontSize: 32, color: '#ffffff', fontWeight: '800' },
                { type: 'price', text: '₺ 24.000.000', x: 0.05, y: 0.80, fontSize: 28, color: '#ffffff', bg: 'rgba(0, 0, 0, 0.25)' },
                { type: 'features', text: '3+1 | 185 m² | Akıllı Ev Sistemi | Özel Otopark', x: 0.05, y: 0.88, fontSize: 15, color: '#f0f9ff' }
            ]
        }
    ];

    // Otomatik 35+ adete genişletme: Farklı varyasyonlar ve ebatlar
    const baseList = [...window.PortfolioPresetsData];
    const cityNames = ['İzmir Çeşme', 'Antalya Kaş', 'Muğla Bodrum', 'Bursa Nilüfer', 'Ankara Çankaya', 'Sakarya Sapanca', 'Kocaeli Kartepe'];
    
    cityNames.forEach((city, idx) => {
        window.PortfolioPresetsData.push({
            id: `preset_auto_villa_${idx}`,
            name: `${city} Özel Malikane`,
            category: 'villa',
            ratio: (idx % 2 === 0) ? '1:1' : '16:9',
            bg: (idx % 2 === 0) ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #022c22 0%, #0f172a 100%)',
            previewColor: (idx % 2 === 0) ? '#f59e0b' : '#10b981',
            frames: [
                { x: 0.04, y: 0.15, w: 0.58, h: 0.74, radius: 16, shadow: 16, shape: 'none', blend: 'none' },
                { x: 0.65, y: 0.15, w: 0.31, h: 0.35, radius: 12, shadow: 10, shape: 'none', blend: 'none' },
                { x: 0.65, y: 0.54, w: 0.31, h: 0.35, radius: 12, shadow: 10, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: `📍 ${city.toUpperCase()}`, x: 0.04, y: 0.03, fontSize: 13, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
                { type: 'heading', text: `${city.toUpperCase()} VİLLASI`, x: 0.04, y: 0.07, fontSize: 30, color: '#ffffff', fontWeight: '800' },
                { type: 'price', text: `₺ ${(25 + idx * 4)}.000.000`, x: 0.65, y: 0.06, fontSize: 22, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
                { type: 'features', text: '5+1 | Geniş Bahçeli | Özel Yüzme Havuzu | Şömineli', x: 0.04, y: 0.92, fontSize: 14, color: '#cbd5e1' }
            ]
        });

        window.PortfolioPresetsData.push({
            id: `preset_auto_arsa_${idx}`,
            name: `${city} Yatırımlık Parsel`,
            category: 'arsa',
            ratio: '1:1',
            bg: 'linear-gradient(135deg, #064e3b 0%, #022c22 50%, #0f172a 100%)',
            previewColor: '#10b981',
            frames: [
                { x: 0.05, y: 0.16, w: 0.90, h: 0.58, radius: 16, shadow: 16, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '📐 İMARLI ARSA', x: 0.05, y: 0.03, fontSize: 13, color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' },
                { type: 'heading', text: `${city.toUpperCase()} İMARLI`, x: 0.05, y: 0.07, fontSize: 30, color: '#ffffff', fontWeight: '800' },
                { type: 'price', text: `₺ ${(5 + idx * 1.5).toFixed(1)}00.000`, x: 0.65, y: 0.065, fontSize: 22, color: '#34d399', bg: 'rgba(52, 211, 153, 0.18)' },
                { type: 'features', text: `${(500 + idx * 120)} m² | Müstakil Tapu | Yola Cephe | Elektrik & Su`, x: 0.05, y: 0.78, fontSize: 14, color: '#a7f3d0' }
            ]
        });

        window.PortfolioPresetsData.push({
            id: `preset_auto_daire_${idx}`,
            name: `${city} Satılık Daire`,
            category: 'daire',
            ratio: (idx % 2 === 0) ? '9:16' : '1:1',
            bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            previewColor: '#38bdf8',
            frames: [
                { x: 0.05, y: 0.15, w: 0.90, h: 0.50, radius: 16, shadow: 14, shape: 'none', blend: 'none' },
                { x: 0.05, y: 0.68, w: 0.90, h: 0.18, radius: 12, shadow: 10, shape: 'none', blend: 'none' }
            ],
            texts: [
                { type: 'badge', text: '🏢 SIFIR DAİRE', x: 0.05, y: 0.03, fontSize: 13, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
                { type: 'heading', text: `${city.toUpperCase()} 3+1`, x: 0.05, y: 0.07, fontSize: 32, color: '#ffffff', fontWeight: '800' },
                { type: 'price', text: `₺ ${(6 + idx * 1.2).toFixed(1)}00.000`, x: 0.05, y: 0.88, fontSize: 24, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.2)' }
            ]
        });
    });

})(window);
