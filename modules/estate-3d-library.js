/**
 * Emlak Stüdyom - 3D Emlak & Mimari Ögeler Kütüphanesi (Estate 3D Library)
 * Arsa, arazi ve konut projeleri için zengin, birebir özgün ve yüksek çözünürlüklü 3D model kataloğu.
 * Lisans: MIT / CC0 uyumlu
 */

(function(window) {
    'use strict';

    const CATEGORIES = [
        { id: 'all', title: 'Tümü', icon: 'fa-cubes' },
        { id: 'fences', title: 'Çit & Sınır', icon: 'fa-shield-halved' },
        { id: 'buildings', title: 'Binalar & Evler', icon: 'fa-house' },
        { id: 'signs', title: 'Tabelalar', icon: 'fa-sign-hanging' },
        { id: 'landscape', title: 'Peyzaj & Ağaçlar', icon: 'fa-tree' },
        { id: 'utility', title: 'Otopark & Tesis', icon: 'fa-car' }
    ];

    // SVG Yardımcı Üreteçleri (Ultra yüksek çözünürlüklü vektörler)
    function createSvg(vbW, vbH, bodyContent) {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" width="${vbW}" height="${vbH}">${bodyContent}</svg>`;
    }

    const ITEMS = [
        // ==========================================
        // 1. ÇİTLER & SINIRLAR (FENCES & BOUNDARIES)
        // ==========================================
        {
            id: 'fence_panel_green',
            name: 'Yeşil Panel Çit',
            category: 'fences',
            orientation: 'standing',
            depth: 8,
            frontColor: '#16a34a',
            sideColor: '#14532d',
            tags: ['çit', 'panel', 'tel', 'yeşil', 'güvenlik', 'arsa', 'sınır'],
            svg: createSvg(320, 160, `
                <defs>
                    <linearGradient id="gPost" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#14532d"/><stop offset="50%" stop-color="#22c55e"/><stop offset="100%" stop-color="#14532d"/></linearGradient>
                    <pattern id="patGridGreen" width="16" height="20" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="16" y2="0" stroke="#16a34a" stroke-width="2"/>
                        <line x1="0" y1="0" x2="0" y2="20" stroke="#16a34a" stroke-width="2"/>
                    </pattern>
                </defs>
                <rect x="0" y="20" width="320" height="135" fill="url(#patGridGreen)" stroke="#15803d" stroke-width="2"/>
                <path d="M0,50 L320,50 M0,90 L320,90 M0,130 L320,130" stroke="#14532d" stroke-width="4"/>
                <rect x="10" y="5" width="14" height="155" rx="3" fill="url(#gPost)"/>
                <rect x="105" y="5" width="14" height="155" rx="3" fill="url(#gPost)"/>
                <rect x="201" y="5" width="14" height="155" rx="3" fill="url(#gPost)"/>
                <rect x="296" y="5" width="14" height="155" rx="3" fill="url(#gPost)"/>
                <circle cx="17" cy="6" r="4" fill="#22c55e"/>
                <circle cx="112" cy="6" r="4" fill="#22c55e"/>
                <circle cx="208" cy="6" r="4" fill="#22c55e"/>
                <circle cx="303" cy="6" r="4" fill="#22c55e"/>
            `)
        },
        {
            id: 'fence_panel_anthracite',
            name: 'Antrasit Panel Çit',
            category: 'fences',
            orientation: 'standing',
            depth: 8,
            frontColor: '#334155',
            sideColor: '#0f172a',
            tags: ['çit', 'panel', 'antrasit', 'gri', 'modern', 'villa', 'sınır'],
            svg: createSvg(320, 160, `
                <defs>
                    <linearGradient id="gPostAnth" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#0f172a"/><stop offset="50%" stop-color="#64748b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>
                    <pattern id="patGridAnth" width="16" height="20" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="16" y2="0" stroke="#475569" stroke-width="2"/>
                        <line x1="0" y1="0" x2="0" y2="20" stroke="#475569" stroke-width="2"/>
                    </pattern>
                </defs>
                <rect x="0" y="20" width="320" height="135" fill="url(#patGridAnth)" stroke="#334155" stroke-width="2"/>
                <path d="M0,50 L320,50 M0,90 L320,90 M0,130 L320,130" stroke="#1e293b" stroke-width="4"/>
                <rect x="10" y="5" width="14" height="155" rx="3" fill="url(#gPostAnth)"/>
                <rect x="105" y="5" width="14" height="155" rx="3" fill="url(#gPostAnth)"/>
                <rect x="201" y="5" width="14" height="155" rx="3" fill="url(#gPostAnth)"/>
                <rect x="296" y="5" width="14" height="155" rx="3" fill="url(#gPostAnth)"/>
            `)
        },
        {
            id: 'fence_wire_mesh',
            name: 'Galvaniz Tel Örgü',
            category: 'fences',
            orientation: 'standing',
            depth: 6,
            frontColor: '#94a3b8',
            sideColor: '#475569',
            tags: ['tel', 'örgü', 'galvaniz', 'çit', 'tarla', 'arsa', 'sınır'],
            svg: createSvg(320, 160, `
                <defs>
                    <pattern id="patWire" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="20" y2="0" stroke="#94a3b8" stroke-width="1.8"/>
                        <line x1="0" y1="0" x2="0" y2="20" stroke="#94a3b8" stroke-width="1.8"/>
                    </pattern>
                </defs>
                <rect x="0" y="20" width="320" height="135" fill="url(#patWire)"/>
                <line x1="0" y1="20" x2="320" y2="20" stroke="#64748b" stroke-width="3"/>
                <line x1="0" y1="85" x2="320" y2="85" stroke="#64748b" stroke-width="2.5"/>
                <line x1="0" y1="155" x2="320" y2="155" stroke="#64748b" stroke-width="3.5"/>
                <rect x="8" y="10" width="12" height="150" fill="#64748b" rx="2"/>
                <rect x="108" y="10" width="12" height="150" fill="#64748b" rx="2"/>
                <rect x="208" y="10" width="12" height="150" fill="#64748b" rx="2"/>
                <rect x="300" y="10" width="12" height="150" fill="#64748b" rx="2"/>
            `)
        },
        {
            id: 'fence_grass_hedge',
            name: 'Yeşil Çim Çit',
            category: 'fences',
            orientation: 'standing',
            depth: 14,
            frontColor: '#15803d',
            sideColor: '#14532d',
            tags: ['çim', 'çit', 'yaprak', 'yeşil', 'mahremiyet', 'villa', 'bahçe'],
            svg: createSvg(320, 160, `
                <defs>
                    <linearGradient id="gGrass" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#22c55e"/><stop offset="50%" stop-color="#16a34a"/><stop offset="100%" stop-color="#14532d"/>
                    </linearGradient>
                </defs>
                <rect x="0" y="15" width="320" height="142" rx="4" fill="url(#gGrass)"/>
                <path d="M0,25 Q15,10 30,25 T60,25 T90,25 T120,25 T150,25 T180,25 T210,25 T240,25 T270,25 T300,25 T320,25" fill="none" stroke="#4ade80" stroke-width="3"/>
                <path d="M0,75 Q15,60 30,75 T60,75 T90,75 T120,75 T150,75 T180,75 T210,75 T240,75 T270,75 T300,75 T320,75" fill="none" stroke="#22c55e" stroke-width="3"/>
                <path d="M0,125 Q15,110 30,125 T60,125 T90,125 T120,125 T150,125 T180,125 T210,125 T240,125 T270,125 T300,125 T320,125" fill="none" stroke="#15803d" stroke-width="3"/>
                <rect x="15" y="8" width="10" height="152" fill="#0f172a" opacity="0.6"/>
                <rect x="155" y="8" width="10" height="152" fill="#0f172a" opacity="0.6"/>
                <rect x="295" y="8" width="10" height="152" fill="#0f172a" opacity="0.6"/>
            `)
        },
        {
            id: 'fence_wood_picket',
            name: 'Ahşap Sivri Kazık Çit',
            category: 'fences',
            orientation: 'standing',
            depth: 12,
            frontColor: '#d97706',
            sideColor: '#78350f',
            tags: ['ahşap', 'çit', 'kazık', 'bahçe', 'köy', 'bungalov'],
            svg: createSvg(320, 160, `
                <rect x="0" y="55" width="320" height="14" fill="#92400e" rx="2"/>
                <rect x="0" y="115" width="320" height="14" fill="#92400e" rx="2"/>
                <polygon points="18,12 28,30 28,155 8,155 8,30" fill="#d97706" stroke="#78350f" stroke-width="2"/>
                <polygon points="44,12 54,30 54,155 34,155 34,30" fill="#d97706" stroke="#78350f" stroke-width="2"/>
                <polygon points="70,12 80,30 80,155 60,155 60,30" fill="#d97706" stroke="#78350f" stroke-width="2"/>
                <polygon points="96,12 106,30 106,155 86,155 86,30" fill="#d97706" stroke="#78350f" stroke-width="2"/>
                <polygon points="122,12 132,30 132,155 112,155 112,30" fill="#d97706" stroke="#78350f" stroke-width="2"/>
                <polygon points="148,12 158,30 158,155 138,155 138,30" fill="#d97706" stroke="#78350f" stroke-width="2"/>
                <polygon points="174,12 184,30 184,155 164,155 164,30" fill="#d97706" stroke="#78350f" stroke-width="2"/>
                <polygon points="200,12 210,30 210,155 190,155 190,30" fill="#d97706" stroke="#78350f" stroke-width="2"/>
                <polygon points="226,12 236,30 236,155 216,155 216,30" fill="#d97706" stroke="#78350f" stroke-width="2"/>
                <polygon points="252,12 262,30 262,155 242,155 242,30" fill="#d97706" stroke="#78350f" stroke-width="2"/>
                <polygon points="278,12 288,30 288,155 268,155 268,30" fill="#d97706" stroke="#78350f" stroke-width="2"/>
                <polygon points="304,12 314,30 314,155 294,155 294,30" fill="#d97706" stroke="#78350f" stroke-width="2"/>
            `)
        },
        {
            id: 'fence_stone_wall',
            name: 'Taş İstinat Duvarı',
            category: 'fences',
            orientation: 'standing',
            depth: 28,
            frontColor: '#78716c',
            sideColor: '#44403c',
            tags: ['taş', 'duvar', 'istinat', 'bahçe', 'arsa', 'doğal', 'sınır'],
            svg: createSvg(320, 160, `
                <defs>
                    <linearGradient id="gStoneWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a8a29e"/><stop offset="100%" stop-color="#57534e"/></linearGradient>
                </defs>
                <rect x="0" y="25" width="320" height="135" fill="url(#gStoneWall)" stroke="#292524" stroke-width="3"/>
                <rect x="0" y="15" width="320" height="16" rx="3" fill="#d6d3d1" stroke="#44403c" stroke-width="2"/>
                <path d="M0,55 L320,55 M0,90 L320,90 M0,125 L320,125" stroke="#292524" stroke-width="2"/>
                <path d="M45,25 L45,55 M110,25 L110,55 M180,25 L180,55 M250,25 L250,55 M310,25 L310,55" stroke="#292524" stroke-width="1.8"/>
                <path d="M20,55 L20,90 M85,55 L85,90 M150,55 L150,90 M215,55 L215,90 M285,55 L285,90" stroke="#292524" stroke-width="1.8"/>
                <path d="M55,90 L55,125 M125,90 L125,125 M195,90 L195,125 M265,90 L265,125" stroke="#292524" stroke-width="1.8"/>
                <path d="M30,125 L30,160 M95,125 L95,160 M165,125 L165,160 M235,125 L235,160 M305,125 L305,160" stroke="#292524" stroke-width="1.8"/>
            `)
        },
        {
            id: 'fence_ranch_white',
            name: 'Beyaz Çiftlik Çiti',
            category: 'fences',
            orientation: 'standing',
            depth: 10,
            frontColor: '#ffffff',
            sideColor: '#94a3b8',
            tags: ['çiftlik', 'beyaz', 'ahşap', 'çit', 'at', 'tarla', 'arsa'],
            svg: createSvg(320, 160, `
                <rect x="0" y="45" width="320" height="15" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
                <rect x="0" y="80" width="320" height="15" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
                <rect x="0" y="115" width="320" height="15" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
                <rect x="15" y="25" width="16" height="135" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
                <rect x="110" y="25" width="16" height="135" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
                <rect x="205" y="25" width="16" height="135" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
                <rect x="295" y="25" width="16" height="135" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
            `)
        },
        {
            id: 'fence_wrought_iron',
            name: 'Ferforje Demir Korkuluk',
            category: 'fences',
            orientation: 'standing',
            depth: 10,
            frontColor: '#0f172a',
            sideColor: '#1e293b',
            tags: ['ferforje', 'demir', 'korkuluk', 'siyah', 'lüks', 'villa'],
            svg: createSvg(320, 160, `
                <rect x="0" y="35" width="320" height="8" fill="#0f172a"/>
                <rect x="0" y="145" width="320" height="12" fill="#0f172a"/>
                <path d="M0,20 L320,20" stroke="#0f172a" stroke-width="4"/>
                <g fill="#0f172a">
                    <polygon points="20,10 24,25 16,25"/><rect x="18" y="25" width="4" height="125"/>
                    <polygon points="40,10 44,25 36,25"/><rect x="38" y="25" width="4" height="125"/>
                    <polygon points="60,10 64,25 56,25"/><rect x="58" y="25" width="4" height="125"/>
                    <polygon points="80,10 84,25 76,25"/><rect x="78" y="25" width="4" height="125"/>
                    <polygon points="100,10 104,25 96,25"/><rect x="98" y="25" width="4" height="125"/>
                    <polygon points="120,10 124,25 116,25"/><rect x="118" y="25" width="4" height="125"/>
                    <polygon points="140,10 144,25 136,25"/><rect x="138" y="25" width="4" height="125"/>
                    <polygon points="160,10 164,25 156,25"/><rect x="158" y="25" width="4" height="125"/>
                    <polygon points="180,10 184,25 176,25"/><rect x="178" y="25" width="4" height="125"/>
                    <polygon points="200,10 204,25 196,25"/><rect x="198" y="25" width="4" height="125"/>
                    <polygon points="220,10 224,25 216,25"/><rect x="218" y="25" width="4" height="125"/>
                    <polygon points="240,10 244,25 236,25"/><rect x="238" y="25" width="4" height="125"/>
                    <polygon points="260,10 264,25 256,25"/><rect x="258" y="25" width="4" height="125"/>
                    <polygon points="280,10 284,25 276,25"/><rect x="278" y="25" width="4" height="125"/>
                    <polygon points="300,10 304,25 296,25"/><rect x="298" y="25" width="4" height="125"/>
                </g>
            `)
        },
        {
            id: 'fence_sliding_gate',
            name: 'Sürgülü Araç Giriş Kapısı',
            category: 'fences',
            orientation: 'standing',
            depth: 14,
            frontColor: '#1e293b',
            sideColor: '#0f172a',
            tags: ['kapı', 'giriş', 'otomatik', 'sürgülü', 'garaj', 'villa'],
            svg: createSvg(320, 160, `
                <rect x="5" y="10" width="310" height="145" rx="4" fill="none" stroke="#1e293b" stroke-width="6"/>
                <line x1="5" y1="10" x2="315" y2="155" stroke="#334155" stroke-width="4"/>
                <line x1="5" y1="155" x2="315" y2="10" stroke="#334155" stroke-width="4"/>
                <circle cx="50" cy="155" r="8" fill="#475569"/>
                <circle cx="270" cy="155" r="8" fill="#475569"/>
                <rect x="285" y="45" width="22" height="110" fill="#f59e0b" rx="3"/>
                <circle cx="296" cy="65" r="5" fill="#ef4444"/>
            `)
        },
        {
            id: 'fence_gabion_wall',
            name: 'Gabion Tel Kafes Taş Duvar',
            category: 'fences',
            orientation: 'standing',
            depth: 30,
            frontColor: '#64748b',
            sideColor: '#334155',
            tags: ['gabion', 'taş', 'sepet', 'tel', 'duvar', 'modern', 'istinat'],
            svg: createSvg(320, 160, `
                <rect x="10" y="15" width="300" height="140" fill="#475569" rx="3"/>
                <defs>
                    <pattern id="patGabionGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="20" height="20" fill="none" stroke="#cbd5e1" stroke-width="1.8"/>
                        <circle cx="6" cy="6" r="4" fill="#94a3b8"/>
                        <circle cx="14" cy="14" r="5" fill="#64748b"/>
                    </pattern>
                </defs>
                <rect x="10" y="15" width="300" height="140" fill="url(#patGabionGrid)" stroke="#334155" stroke-width="4"/>
            `)
        },
        {
            id: 'fence_barbed_wire',
            name: 'Dikenli Tel Sınır Çiti',
            category: 'fences',
            orientation: 'standing',
            depth: 8,
            frontColor: '#64748b',
            sideColor: '#334155',
            tags: ['dikenli tel', 'tarla', 'arsa', 'sınır', 'güvenlik', 'beton direk'],
            svg: createSvg(320, 160, `
                <!-- Eğik Başlıklı Beton Direkler -->
                <path d="M15,155 L15,35 L28,15 L36,19 L25,38 L25,155 Z" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
                <path d="M115,155 L115,35 L128,15 L136,19 L125,38 L125,155 Z" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
                <path d="M215,155 L215,35 L228,15 L236,19 L225,38 L225,155 Z" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
                <path d="M295,155 L295,35 L308,15 L316,19 L305,38 L305,155 Z" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
                <!-- 4 Sıra Dikenli Tel Çizgileri -->
                <line x1="0" y1="22" x2="320" y2="22" stroke="#64748b" stroke-width="2"/>
                <line x1="0" y1="45" x2="320" y2="45" stroke="#64748b" stroke-width="2"/>
                <line x1="0" y1="85" x2="320" y2="85" stroke="#64748b" stroke-width="2"/>
                <line x1="0" y1="125" x2="320" y2="125" stroke="#64748b" stroke-width="2"/>
                <!-- Diken Düğümleri -->
                <path d="M60,18 L68,26 M68,18 L60,26 M160,18 L168,26 M168,18 L160,26 M260,18 L268,26 M268,18 L260,26" stroke="#ef4444" stroke-width="2"/>
                <path d="M50,41 L58,49 M58,41 L50,49 M150,41 L158,49 M158,41 L150,49 M250,41 L258,49 M258,41 L250,49" stroke="#ef4444" stroke-width="2"/>
                <path d="M70,81 L78,89 M78,81 L70,89 M170,81 L178,89 M178,81 L170,89 M270,81 L278,89 M278,81 L270,89" stroke="#ef4444" stroke-width="2"/>
                <path d="M40,121 L48,129 M48,121 L40,129 M140,121 L148,129 M148,121 L140,129 M240,121 L248,129 M248,121 L240,129" stroke="#ef4444" stroke-width="2"/>
            `)
        },
        {
            id: 'fence_garden_hedge_low',
            name: 'Bodur Şimşir Çit',
            category: 'fences',
            orientation: 'standing',
            depth: 18,
            frontColor: '#16a34a',
            sideColor: '#14532d',
            tags: ['şimşir', 'bodur', 'çit', 'peyzaj', 'bahçe', 'yeşil'],
            svg: createSvg(320, 160, `
                <defs>
                    <linearGradient id="gBoxwood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#4ade80"/><stop offset="50%" stop-color="#16a34a"/><stop offset="100%" stop-color="#14532d"/>
                    </linearGradient>
                </defs>
                <rect x="0" y="65" width="320" height="90" rx="12" fill="url(#gBoxwood)" stroke="#14532d" stroke-width="3"/>
                <!-- Dalgalı yaprak kümeleri -->
                <circle cx="30" cy="65" r="22" fill="#22c55e"/>
                <circle cx="75" cy="60" r="25" fill="#4ade80"/>
                <circle cx="120" cy="65" r="22" fill="#16a34a"/>
                <circle cx="165" cy="60" r="24" fill="#22c55e"/>
                <circle cx="210" cy="65" r="23" fill="#4ade80"/>
                <circle cx="255" cy="60" r="25" fill="#16a34a"/>
                <circle cx="295" cy="65" r="20" fill="#22c55e"/>
            `)
        },

        // ==========================================
        // 2. BİNALAR & EVLER (HOUSES & STRUCTURES)
        // ==========================================
        {
            id: 'house_bungalow_aframe',
            name: 'A-Frame Ahşap Dağ Evi',
            category: 'buildings',
            orientation: 'standing',
            depth: 65,
            frontColor: '#78350f',
            sideColor: '#451a03',
            tags: ['bungalov', 'a-frame', 'ahşap', 'dağ evi', 'tiny house', 'arsa'],
            svg: createSvg(260, 260, `
                <defs>
                    <linearGradient id="gRoof" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stop-color="#1c1917"/><stop offset="50%" stop-color="#44403c"/><stop offset="100%" stop-color="#1c1917"/>
                    </linearGradient>
                    <linearGradient id="gGlass" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.85"/>
                        <stop offset="100%" stop-color="#0284c7" stop-opacity="0.95"/>
                    </linearGradient>
                </defs>
                <rect x="10" y="235" width="240" height="20" rx="4" fill="#b45309" stroke="#78350f" stroke-width="2"/>
                <polygon points="130,25 225,235 35,235" fill="url(#gGlass)" stroke="#78350f" stroke-width="3"/>
                <polygon points="130,15 240,235 220,235 130,45 40,235 20,235" fill="url(#gRoof)"/>
                <line x1="80" y1="135" x2="180" y2="135" stroke="#451a03" stroke-width="4"/>
                <line x1="60" y1="180" x2="200" y2="180" stroke="#451a03" stroke-width="4"/>
                <line x1="130" y1="45" x2="130" y2="235" stroke="#451a03" stroke-width="4"/>
                <rect x="108" y="182" width="44" height="53" rx="3" fill="#d97706" stroke="#78350f" stroke-width="2"/>
                <circle cx="144" cy="210" r="3" fill="#fef08a"/>
                <rect x="165" y="45" width="18" height="40" fill="#78716c" stroke="#44403c" stroke-width="1.5"/>
            `)
        },
        {
            id: 'house_modern_villa',
            name: 'Modern Kübik Villa',
            category: 'buildings',
            orientation: 'standing',
            depth: 70,
            frontColor: '#ffffff',
            sideColor: '#64748b',
            tags: ['villa', 'modern', 'müstakil', 'lüks', 'ev', 'arsa', 'konut'],
            svg: createSvg(280, 240, `
                <rect x="25" y="115" width="230" height="115" rx="3" fill="#ffffff" stroke="#94a3b8" stroke-width="3"/>
                <rect x="45" y="30" width="190" height="95" rx="3" fill="#f8fafc" stroke="#334155" stroke-width="3"/>
                <rect x="155" y="32" width="78" height="90" fill="#b45309"/>
                <rect x="55" y="48" width="90" height="65" fill="#38bdf8" opacity="0.85" stroke="#1e293b" stroke-width="2"/>
                <line x1="55" y1="95" x2="145" y2="95" stroke="#ffffff" stroke-width="2"/>
                <rect x="45" y="135" width="110" height="90" fill="#0284c7" opacity="0.85" stroke="#1e293b" stroke-width="2"/>
                <rect x="175" y="145" width="45" height="85" fill="#0f172a" rx="2"/>
                <circle cx="210" cy="188" r="3" fill="#f59e0b"/>
                <line x1="25" y1="115" x2="255" y2="115" stroke="#0ea5e9" stroke-width="3"/>
            `)
        },
        {
            id: 'house_luxury_triplex',
            name: 'Lüks Triplex Villa',
            category: 'buildings',
            orientation: 'standing',
            depth: 85,
            frontColor: '#0f172a',
            sideColor: '#1e293b',
            tags: ['triplex', 'lüks', 'rezidans', 'villa', 'malikane', 'büyük ev'],
            svg: createSvg(300, 260, `
                <!-- Zemin Kat -->
                <rect x="20" y="160" width="260" height="90" fill="#f1f5f9" stroke="#334155" stroke-width="3"/>
                <!-- 1. Kat -->
                <rect x="35" y="90" width="230" height="75" fill="#e2e8f0" stroke="#334155" stroke-width="3"/>
                <!-- 2. Kat (Çatı Katı & Penthouse) -->
                <rect x="65" y="25" width="170" height="68" fill="#0f172a" stroke="#1e293b" stroke-width="3"/>
                <!-- Çatı Teras Korkuluğu & Pergola -->
                <rect x="55" y="15" width="190" height="12" fill="#b45309" rx="2"/>
                <!-- Boydan Boya Cam Cepheler -->
                <rect x="40" y="175" width="120" height="70" fill="#38bdf8" opacity="0.85" stroke="#0f172a" stroke-width="2"/>
                <rect x="50" y="105" width="150" height="55" fill="#0284c7" opacity="0.85" stroke="#0f172a" stroke-width="2"/>
                <rect x="80" y="40" width="120" height="48" fill="#38bdf8" opacity="0.85" stroke="#ffffff" stroke-width="2"/>
                <!-- Cam Balkon Korkulukları -->
                <rect x="30" y="145" width="180" height="18" fill="#bae6fd" opacity="0.6" stroke="#0284c7" stroke-width="1.5"/>
                <!-- Çift Kanat Lüks Kapı -->
                <rect x="180" y="175" width="50" height="75" fill="#0f172a" stroke="#d97706" stroke-width="2"/>
                <line x1="205" y1="175" x2="205" y2="250" stroke="#d97706" stroke-width="2"/>
                <circle cx="200" cy="212" r="3" fill="#f59e0b"/>
                <circle cx="210" cy="212" r="3" fill="#f59e0b"/>
            `)
        },
        {
            id: 'house_single_floor',
            name: 'Tek Katlı Müstakil Ev',
            category: 'buildings',
            orientation: 'standing',
            depth: 60,
            frontColor: '#f8fafc',
            sideColor: '#94a3b8',
            tags: ['müstakil', 'tek katlı', 'köy evi', 'çiftlik', 'konut', 'arsa'],
            svg: createSvg(280, 220, `
                <polygon points="140,20 270,95 10,95" fill="#b91c1c" stroke="#7f1d1d" stroke-width="3"/>
                <rect x="30" y="95" width="220" height="115" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>
                <rect x="50" y="115" width="45" height="50" fill="#38bdf8" stroke="#475569" stroke-width="2"/>
                <rect x="185" y="115" width="45" height="50" fill="#38bdf8" stroke="#475569" stroke-width="2"/>
                <rect x="120" y="125" width="40" height="85" fill="#78350f" stroke="#451a03" stroke-width="2"/>
                <rect x="210" y="35" width="20" height="40" fill="#991b1b"/>
            `)
        },
        {
            id: 'house_stone_farmhouse',
            name: 'Ege Taş Çiftlik Evi',
            category: 'buildings',
            orientation: 'standing',
            depth: 70,
            frontColor: '#d6d3d1',
            sideColor: '#78716c',
            tags: ['taş ev', 'çiftlik', 'ege', 'alaçatı', 'köy evi', 'doğal taş'],
            svg: createSvg(280, 240, `
                <!-- Kiremit Çatı -->
                <polygon points="140,25 275,100 5,100" fill="#c2410c" stroke="#9a3412" stroke-width="3"/>
                <!-- Taş Duvar Gövdesi -->
                <rect x="25" y="100" width="230" height="130" fill="#d6d3d1" stroke="#57534e" stroke-width="3"/>
                <!-- Taş Doku Çizgileri -->
                <path d="M25,130 L255,130 M25,165 L255,165 M25,195 L255,195" stroke="#78716c" stroke-width="2"/>
                <path d="M60,100 L60,130 M130,100 L130,130 M210,100 L210,130 M90,130 L90,165 M170,130 L170,165 M70,165 L70,195 M150,165 L150,195 M220,165 L220,195" stroke="#78716c" stroke-width="1.8"/>
                <!-- Ahşap Hatıllı Pencereler -->
                <rect x="45" y="120" width="40" height="45" fill="#38bdf8" stroke="#78350f" stroke-width="3"/>
                <rect x="195" y="120" width="40" height="45" fill="#38bdf8" stroke="#78350f" stroke-width="3"/>
                <!-- Kemerli Ahşap Kapı -->
                <path d="M115,230 L115,160 Q140,135 165,160 L165,230 Z" fill="#78350f" stroke="#451a03" stroke-width="3"/>
                <circle cx="155" cy="190" r="3" fill="#f59e0b"/>
                <!-- Taş Baca -->
                <rect x="195" y="35" width="22" height="45" fill="#78716c" stroke="#44403c" stroke-width="2"/>
            `)
        },
        {
            id: 'house_tiny_house_wheels',
            name: 'Tekerlekli Tiny House',
            category: 'buildings',
            orientation: 'standing',
            depth: 55,
            frontColor: '#0f172a',
            sideColor: '#1e293b',
            tags: ['tiny house', 'karavan', 'mobil', 'tekerlekli', 'ahşap', 'arsa'],
            svg: createSvg(280, 200, `
                <polygon points="15,160 35,160 35,150 15,150" fill="#64748b"/>
                <rect x="35" y="152" width="220" height="10" fill="#334155"/>
                <path d="M40,55 L210,35 L255,55 L255,152 L40,152 Z" fill="#1e293b" stroke="#0f172a" stroke-width="3"/>
                <rect x="95" y="50" width="80" height="102" fill="#d97706" stroke="#92400e" stroke-width="2"/>
                <circle cx="65" cy="75" r="16" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/>
                <rect x="105" y="65" width="40" height="87" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
                <rect x="195" y="70" width="45" height="50" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/>
                <circle cx="120" cy="165" r="22" fill="#0f172a" stroke="#cbd5e1" stroke-width="4"/>
                <circle cx="120" cy="165" r="8" fill="#94a3b8"/>
                <circle cx="175" cy="165" r="22" fill="#0f172a" stroke="#cbd5e1" stroke-width="4"/>
                <circle cx="175" cy="165" r="8" fill="#94a3b8"/>
            `)
        },
        {
            id: 'house_container_office',
            name: 'Modern Konteyner & Ofis',
            category: 'buildings',
            orientation: 'standing',
            depth: 50,
            frontColor: '#0284c7',
            sideColor: '#0369a1',
            tags: ['konteyner', 'ofis', 'şantiye', 'arsa', 'prefabrik'],
            svg: createSvg(280, 160, `
                <rect x="10" y="25" width="260" height="120" rx="4" fill="#0284c7" stroke="#0369a1" stroke-width="3"/>
                <path d="M25,25 L25,145 M45,25 L45,145 M65,25 L65,145 M85,25 L85,145 M105,25 L105,145 M125,25 L125,145 M145,25 L145,145 M165,25 L165,145 M185,25 L185,145 M205,25 L205,145 M225,25 L225,145 M245,25 L245,145" stroke="#0369a1" stroke-width="2"/>
                <rect x="40" y="45" width="120" height="80" fill="#38bdf8" stroke="#0f172a" stroke-width="3"/>
                <rect x="180" y="45" width="55" height="100" fill="#bae6fd" stroke="#0f172a" stroke-width="3"/>
            `)
        },
        {
            id: 'house_chalet_wood',
            name: 'Rustik Kütük Dağ Evi',
            category: 'buildings',
            orientation: 'standing',
            depth: 65,
            frontColor: '#b45309',
            sideColor: '#78350f',
            tags: ['kütük ev', 'dağ evi', 'ahşap', 'chalet', 'orman', 'hobi bahçesi'],
            svg: createSvg(280, 240, `
                <!-- Alp Tipi Dik Çatı -->
                <polygon points="140,15 270,95 10,95" fill="#44403c" stroke="#292524" stroke-width="3"/>
                <!-- Kütük Katmanları -->
                <g fill="#b45309" stroke="#78350f" stroke-width="2">
                    <rect x="25" y="95" width="230" height="18" rx="6"/>
                    <rect x="25" y="113" width="230" height="18" rx="6"/>
                    <rect x="25" y="131" width="230" height="18" rx="6"/>
                    <rect x="25" y="149" width="230" height="18" rx="6"/>
                    <rect x="25" y="167" width="230" height="18" rx="6"/>
                    <rect x="25" y="185" width="230" height="18" rx="6"/>
                    <rect x="25" y="203" width="230" height="25" rx="6" fill="#78716c" stroke="#44403c"/>
                </g>
                <!-- Pencereler & Kapı -->
                <rect x="45" y="120" width="45" height="50" fill="#fef08a" stroke="#451a03" stroke-width="3"/>
                <line x1="67" y1="120" x2="67" y2="170" stroke="#451a03" stroke-width="2"/>
                <line x1="45" y1="145" x2="90" y2="145" stroke="#451a03" stroke-width="2"/>
                <rect x="190" y="120" width="45" height="50" fill="#fef08a" stroke="#451a03" stroke-width="3"/>
                <line x1="212" y1="120" x2="212" y2="170" stroke="#451a03" stroke-width="2"/>
                <line x1="190" y1="145" x2="235" y2="145" stroke="#451a03" stroke-width="2"/>
                <rect x="120" y="135" width="40" height="75" fill="#451a03" stroke="#292524" stroke-width="2"/>
                <circle cx="150" cy="172" r="3" fill="#f59e0b"/>
            `)
        },
        {
            id: 'house_twin_villas',
            name: 'Modern İkiz Villa Projesi',
            category: 'buildings',
            orientation: 'standing',
            depth: 75,
            frontColor: '#f8fafc',
            sideColor: '#334155',
            tags: ['ikiz villa', 'dubleks', 'modern', 'proje', 'arsa', 'villa'],
            svg: createSvg(320, 220, `
                <!-- Sol Villa -->
                <rect x="15" y="85" width="140" height="125" fill="#ffffff" stroke="#94a3b8" stroke-width="3"/>
                <rect x="25" y="30" width="120" height="65" fill="#f1f5f9" stroke="#334155" stroke-width="3"/>
                <rect x="35" y="42" width="60" height="42" fill="#38bdf8" stroke="#1e293b" stroke-width="2"/>
                <rect x="30" y="105" width="65" height="60" fill="#0284c7" stroke="#1e293b" stroke-width="2"/>
                <rect x="105" y="125" width="35" height="85" fill="#0f172a" rx="2"/>
                <!-- Sağ Villa (Simetrik) -->
                <rect x="165" y="85" width="140" height="125" fill="#ffffff" stroke="#94a3b8" stroke-width="3"/>
                <rect x="175" y="30" width="120" height="65" fill="#f1f5f9" stroke="#334155" stroke-width="3"/>
                <rect x="225" y="42" width="60" height="42" fill="#38bdf8" stroke="#1e293b" stroke-width="2"/>
                <rect x="225" y="105" width="65" height="60" fill="#0284c7" stroke="#1e293b" stroke-width="2"/>
                <rect x="180" y="125" width="35" height="85" fill="#0f172a" rx="2"/>
                <!-- Ortak Bölücü Duvar & Ahşap Detay -->
                <rect x="153" y="25" width="14" height="185" fill="#b45309" stroke="#78350f" stroke-width="2"/>
            `)
        },
        {
            id: 'house_city_apartment',
            name: 'Şehir Apartman Bloğu',
            category: 'buildings',
            orientation: 'standing',
            depth: 80,
            frontColor: '#475569',
            sideColor: '#1e293b',
            tags: ['apartman', 'bina', 'kat', 'konut', 'şehir', 'daire'],
            svg: createSvg(260, 300, `
                <!-- Ana Bina Gövdesi -->
                <rect x="20" y="20" width="220" height="265" rx="4" fill="#f8fafc" stroke="#334155" stroke-width="4"/>
                <!-- Çatı Katı Silmesi -->
                <rect x="10" y="12" width="240" height="16" rx="3" fill="#0f172a"/>
                <!-- Kat Pencereleri ve Balkonlar -->
                <!-- 4. Kat -->
                <rect x="40" y="45" width="45" height="35" fill="#38bdf8" stroke="#334155" stroke-width="2"/>
                <rect x="110" y="45" width="45" height="35" fill="#38bdf8" stroke="#334155" stroke-width="2"/>
                <rect x="175" y="45" width="45" height="35" fill="#38bdf8" stroke="#334155" stroke-width="2"/>
                <!-- 3. Kat + Balkon -->
                <rect x="40" y="105" width="45" height="35" fill="#38bdf8" stroke="#334155" stroke-width="2"/>
                <rect x="105" y="95" width="55" height="45" fill="#0284c7" stroke="#334155" stroke-width="2"/>
                <rect x="100" y="125" width="65" height="18" fill="#cbd5e1" stroke="#334155" stroke-width="2"/>
                <rect x="175" y="105" width="45" height="35" fill="#38bdf8" stroke="#334155" stroke-width="2"/>
                <!-- 2. Kat + Balkon -->
                <rect x="40" y="165" width="45" height="35" fill="#38bdf8" stroke="#334155" stroke-width="2"/>
                <rect x="105" y="155" width="55" height="45" fill="#0284c7" stroke="#334155" stroke-width="2"/>
                <rect x="100" y="185" width="65" height="18" fill="#cbd5e1" stroke="#334155" stroke-width="2"/>
                <rect x="175" y="165" width="45" height="35" fill="#38bdf8" stroke="#334155" stroke-width="2"/>
                <!-- Zemin Kat Giriş Kapısı -->
                <rect x="95" y="220" width="70" height="65" fill="#0f172a" stroke="#d97706" stroke-width="2"/>
                <rect x="105" y="230" width="50" height="55" fill="#38bdf8" opacity="0.6"/>
            `)
        },
        {
            id: 'house_commercial_store',
            name: 'Ticari Dükkan & Mağaza',
            category: 'buildings',
            orientation: 'standing',
            depth: 60,
            frontColor: '#ef4444',
            sideColor: '#991b1b',
            tags: ['dükkan', 'mağaza', 'ticari', 'işyeri', 'vitrin', 'arsa'],
            svg: createSvg(280, 220, `
                <!-- Tabela Bandı -->
                <rect x="15" y="20" width="250" height="45" rx="4" fill="#0f172a" stroke="#d97706" stroke-width="3"/>
                <text x="140" y="48" font-family="'ClassicAmpersand', sans-serif" font-weight="900" font-size="18" fill="#f59e0b" text-anchor="middle" letter-spacing="2">TİCARİ MAĞAZA</text>
                <!-- Çizgili Tente -->
                <path d="M10,65 L270,65 L255,100 L25,100 Z" fill="#ef4444"/>
                <path d="M40,65 L70,65 L65,100 L35,100 Z M100,65 L130,65 L125,100 L95,100 Z M160,65 L190,65 L185,100 L155,100 Z M220,65 L250,65 L245,100 L215,100 Z" fill="#ffffff"/>
                <!-- Vitrin Camları & Giriş -->
                <rect x="25" y="100" width="230" height="110" fill="#f8fafc" stroke="#334155" stroke-width="3"/>
                <rect x="35" y="115" width="85" height="85" fill="#38bdf8" opacity="0.8" stroke="#1e293b" stroke-width="2"/>
                <rect x="160" y="115" width="85" height="85" fill="#38bdf8" opacity="0.8" stroke="#1e293b" stroke-width="2"/>
                <!-- Camlı Giriş Kapısı -->
                <rect x="120" y="115" width="40" height="95" fill="#e2e8f0" stroke="#0f172a" stroke-width="2"/>
                <circle cx="152" cy="165" r="3" fill="#0f172a"/>
            `)
        },
        {
            id: 'house_barn_ranch',
            name: 'Çiftlik Ahırı & Hangar',
            category: 'buildings',
            orientation: 'standing',
            depth: 70,
            frontColor: '#b91c1c',
            sideColor: '#7f1d1d',
            tags: ['ahır', 'çiftlik', 'hangar', 'depo', 'tarla', 'kırsal'],
            svg: createSvg(280, 220, `
                <!-- Kavisli Gambrel Ahır Çatısı -->
                <polygon points="140,15 220,40 260,95 20,95 60,40" fill="#991b1b" stroke="#7f1d1d" stroke-width="3"/>
                <!-- Kırmızı Ahşap Gövde -->
                <rect x="30" y="95" width="220" height="115" fill="#b91c1c" stroke="#7f1d1d" stroke-width="3"/>
                <!-- Çift Kanatlı Büyük Ahır Kapısı -->
                <rect x="100" y="115" width="80" height="95" fill="#ffffff" stroke="#7f1d1d" stroke-width="3"/>
                <line x1="140" y1="115" x2="140" y2="210" stroke="#7f1d1d" stroke-width="3"/>
                <!-- Kapı Çapraz 'X' Çıtaları -->
                <line x1="100" y1="115" x2="140" y2="210" stroke="#b91c1c" stroke-width="2.5"/>
                <line x1="140" y1="115" x2="100" y2="210" stroke="#b91c1c" stroke-width="2.5"/>
                <line x1="140" y1="115" x2="180" y2="210" stroke="#b91c1c" stroke-width="2.5"/>
                <line x1="180" y1="115" x2="140" y2="210" stroke="#b91c1c" stroke-width="2.5"/>
                <!-- Üst Samanlık Penceresi -->
                <rect x="125" y="50" width="30" height="35" rx="3" fill="#ffffff" stroke="#7f1d1d" stroke-width="2"/>
            `)
        },
        {
            id: 'house_glass_greenhouse',
            name: 'Modern Cam Sera',
            category: 'buildings',
            orientation: 'standing',
            depth: 45,
            frontColor: '#0284c7',
            sideColor: '#0369a1',
            tags: ['sera', 'cam sera', 'tarım', 'fide', 'hobi bahçesi', 'tarla'],
            svg: createSvg(280, 180, `
                <!-- Kemerli Cam Gövde -->
                <path d="M20,165 L20,75 Q140,15 260,75 L260,165 Z" fill="#bae6fd" opacity="0.75" stroke="#0284c7" stroke-width="3"/>
                <!-- Çelik İskelet Kemerleri -->
                <path d="M70,165 L70,55 Q140,25 210,55 L210,165" fill="none" stroke="#0284c7" stroke-width="2.5"/>
                <path d="M140,165 L140,32" fill="none" stroke="#0284c7" stroke-width="2.5"/>
                <!-- Yatay Cam Bölmeleri -->
                <line x1="20" y1="75" x2="260" y2="75" stroke="#0284c7" stroke-width="2"/>
                <line x1="20" y1="120" x2="260" y2="120" stroke="#0284c7" stroke-width="2"/>
                <!-- İçerideki Yeşil Bitkiler/Fideler -->
                <g fill="#16a34a">
                    <circle cx="50" cy="150" r="10"/><circle cx="90" cy="150" r="12"/><circle cx="140" cy="150" r="11"/>
                    <circle cx="190" cy="150" r="12"/><circle cx="230" cy="150" r="10"/>
                </g>
                <circle cx="52" cy="146" r="3" fill="#ef4444"/>
                <circle cx="92" cy="148" r="3" fill="#ef4444"/>
                <circle cx="192" cy="146" r="3" fill="#ef4444"/>
                <!-- Sürgülü Giriş Kapısı -->
                <rect x="115" y="75" width="50" height="90" fill="none" stroke="#0f172a" stroke-width="2.5"/>
            `)
        },

        // ==========================================
        // 3. TABELALAR & TANITIM (SIGNPOSTS & BOARDS)
        // ==========================================
        {
            id: 'sign_for_sale_standing',
            name: 'Ayaklı Satılık Tabelası',
            category: 'signs',
            orientation: 'standing',
            depth: 14,
            frontColor: '#ef4444',
            sideColor: '#991b1b',
            tags: ['tabela', 'satılık', 'arsa', 'emlak', 'pano', 'ayaklı'],
            svg: createSvg(240, 280, `
                <rect x="45" y="140" width="14" height="135" fill="#475569" stroke="#1e293b" stroke-width="2"/>
                <rect x="181" y="140" width="14" height="135" fill="#475569" stroke="#1e293b" stroke-width="2"/>
                <rect x="15" y="20" width="210" height="130" rx="8" fill="#ef4444" stroke="#ffffff" stroke-width="4"/>
                <rect x="25" y="30" width="190" height="110" rx="5" fill="#dc2626"/>
                <text x="120" y="72" font-family="'ClassicAmpersand', sans-serif" font-weight="900" font-size="32" fill="#ffffff" text-anchor="middle" letter-spacing="2">SATILIK</text>
                <rect x="35" y="86" width="170" height="42" rx="4" fill="#ffffff"/>
                <text x="120" y="105" font-family="'ClassicAmpersand', sans-serif" font-weight="800" font-size="14" fill="#0f172a" text-anchor="middle">EMLAK STÜDYOM</text>
                <text x="120" y="121" font-family="'ClassicAmpersand', sans-serif" font-weight="700" font-size="11" fill="#ef4444" text-anchor="middle">ADA / PARSEL HAZIR</text>
            `)
        },
        {
            id: 'sign_for_rent_standing',
            name: 'Ayaklı Kiralık Tabelası',
            category: 'signs',
            orientation: 'standing',
            depth: 14,
            frontColor: '#0284c7',
            sideColor: '#0369a1',
            tags: ['tabela', 'kiralık', 'arsa', 'emlak', 'pano', 'mavi'],
            svg: createSvg(240, 280, `
                <rect x="45" y="140" width="14" height="135" fill="#475569" stroke="#1e293b" stroke-width="2"/>
                <rect x="181" y="140" width="14" height="135" fill="#475569" stroke="#1e293b" stroke-width="2"/>
                <rect x="15" y="20" width="210" height="130" rx="8" fill="#0284c7" stroke="#ffffff" stroke-width="4"/>
                <rect x="25" y="30" width="190" height="110" rx="5" fill="#0369a1"/>
                <text x="120" y="72" font-family="'ClassicAmpersand', sans-serif" font-weight="900" font-size="32" fill="#ffffff" text-anchor="middle" letter-spacing="2">KİRALIK</text>
                <rect x="35" y="86" width="170" height="42" rx="4" fill="#ffffff"/>
                <text x="120" y="105" font-family="'ClassicAmpersand', sans-serif" font-weight="800" font-size="14" fill="#0f172a" text-anchor="middle">EMLAK STÜDYOM</text>
                <text x="120" y="121" font-family="'ClassicAmpersand', sans-serif" font-weight="700" font-size="11" fill="#0284c7" text-anchor="middle">HEMEN TESLİM</text>
            `)
        },
        {
            id: 'sign_parsel_board',
            name: 'Ada / Parsel Köşe Tabelası',
            category: 'signs',
            orientation: 'standing',
            depth: 12,
            frontColor: '#f59e0b',
            sideColor: '#92400e',
            tags: ['tabela', 'ada', 'parsel', 'm2', 'kadastro', 'harita', 'sınır'],
            svg: createSvg(220, 260, `
                <rect x="103" y="130" width="14" height="125" fill="#78350f" stroke="#451a03" stroke-width="2"/>
                <rect x="15" y="20" width="190" height="115" rx="6" fill="#0f172a" stroke="#f59e0b" stroke-width="3"/>
                <text x="110" y="52" font-family="'ClassicAmpersand', sans-serif" font-weight="900" font-size="18" fill="#f59e0b" text-anchor="middle">ADA: 101 / PARSEL: 1</text>
                <line x1="30" y1="62" x2="190" y2="62" stroke="#334155" stroke-width="1.5"/>
                <text x="110" y="86" font-family="'ClassicAmpersand', sans-serif" font-weight="800" font-size="20" fill="#ffffff" text-anchor="middle">1.250 m²</text>
                <text x="110" y="112" font-family="'ClassicAmpersand', sans-serif" font-weight="700" font-size="12" fill="#10b981" text-anchor="middle">MÜSTAKİL PARSEL</text>
            `)
        },
        {
            id: 'sign_direction_arrow',
            name: 'Yol Giriş Yönlendirme Totemi',
            category: 'signs',
            orientation: 'standing',
            depth: 14,
            frontColor: '#10b981',
            sideColor: '#065f46',
            tags: ['ok', 'yön', 'tabela', 'yol', 'giriş', 'totem'],
            svg: createSvg(260, 260, `
                <!-- Alt Kaide -->
                <rect x="85" y="240" width="90" height="16" rx="3" fill="#334155" stroke="#1e293b" stroke-width="2"/>
                <!-- Taşıyıcı Ayak / Direk (Pano içine 25px biner, ayrık kopukluğu önler) -->
                <rect x="122" y="75" width="16" height="170" fill="#475569" stroke="#1e293b" stroke-width="2"/>
                <!-- Tabela Yön Gövdesi -->
                <path d="M20,30 L195,30 L245,65 L195,100 L20,100 Z" fill="#10b981" stroke="#ffffff" stroke-width="3.5"/>
                <text x="110" y="72" font-family="'ClassicAmpersand', sans-serif" font-weight="900" font-size="20" fill="#ffffff" text-anchor="middle">PROJE GİRİŞİ ➔</text>
            `)
        },
        {
            id: 'sign_luxury_gold',
            name: 'Altın Varaklı Emlak Tabelası',
            category: 'signs',
            orientation: 'standing',
            depth: 16,
            frontColor: '#f59e0b',
            sideColor: '#78350f',
            tags: ['lüks', 'altın', 'tabela', 'villa', 'prestij', 'emlak'],
            svg: createSvg(240, 280, `
                <!-- Alt Kaide -->
                <rect x="70" y="240" width="100" height="25" rx="4" fill="#0f172a" stroke="#d97706" stroke-width="2"/>
                <rect x="112" y="130" width="16" height="115" fill="#d97706" stroke="#78350f" stroke-width="2"/>
                <!-- Tabela Gövdesi -->
                <rect x="15" y="20" width="210" height="120" rx="8" fill="#0f172a" stroke="#f59e0b" stroke-width="4"/>
                <rect x="25" y="30" width="190" height="100" rx="4" fill="#1e293b"/>
                <text x="120" y="58" font-family="'ClassicAmpersand', sans-serif" font-weight="900" font-size="14" fill="#f59e0b" text-anchor="middle" letter-spacing="3">★ PRESTİJ PROJE ★</text>
                <text x="120" y="85" font-family="'ClassicAmpersand', sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle">SATILIK VİLLA</text>
                <text x="120" y="112" font-family="'ClassicAmpersand', sans-serif" font-weight="700" font-size="12" fill="#38bdf8" text-anchor="middle">ÖZEL HAVUZLU</text>
            `)
        },

        // ==========================================
        // 4. PEYZAJ & AĞAÇLAR (LANDSCAPE & TREES)
        // ==========================================
        {
            id: 'nature_pine_tree',
            name: 'Dağ Çamı',
            category: 'landscape',
            orientation: 'standing',
            depth: 22,
            frontColor: '#166534',
            sideColor: '#14532d',
            tags: ['ağaç', 'çam', 'peyzaj', 'bahçe', 'yeşil', 'doğa'],
            svg: createSvg(200, 260, `
                <rect x="88" y="200" width="24" height="55" rx="3" fill="#78350f" stroke="#451a03" stroke-width="2"/>
                <polygon points="100,20 155,90 135,90 170,145 145,145 185,205 15,205 55,145 30,145 65,90 45,90" fill="#15803d" stroke="#14532d" stroke-width="3"/>
                <path d="M100,20 L135,65 L100,55 L65,65 Z" fill="#22c55e" opacity="0.6"/>
            `)
        },
        {
            id: 'nature_olive_tree',
            name: 'Asırlık Zeytin Ağacı',
            category: 'landscape',
            orientation: 'standing',
            depth: 24,
            frontColor: '#4d7c0f',
            sideColor: '#365314',
            tags: ['zeytin', 'ağaç', 'peyzaj', 'ege', 'arsa', 'tarla', 'zeytinlik'],
            svg: createSvg(220, 260, `
                <!-- Burgulu Kalın Kütük -->
                <path d="M95,255 Q80,185 105,145 Q115,115 110,85" fill="none" stroke="#78350f" stroke-width="24" stroke-linecap="round"/>
                <path d="M110,150 Q135,120 150,95" fill="none" stroke="#78350f" stroke-width="14" stroke-linecap="round"/>
                <!-- Gümüşi Yeşil Zeytin Yaprak Kümeleri -->
                <circle cx="110" cy="80" r="55" fill="#65a30d" stroke="#365314" stroke-width="3"/>
                <circle cx="65" cy="110" r="38" fill="#4d7c0f" stroke="#365314" stroke-width="2.5"/>
                <circle cx="155" cy="105" r="42" fill="#4d7c0f" stroke="#365314" stroke-width="2.5"/>
                <!-- Zeytin Daneleri -->
                <ellipse cx="65" cy="120" rx="4" ry="6" fill="#1e293b"/>
                <ellipse cx="105" cy="95" rx="4" ry="6" fill="#1e293b"/>
                <ellipse cx="150" cy="120" rx="4" ry="6" fill="#1e293b"/>
            `)
        },
        {
            id: 'nature_palm_tree',
            name: 'Akdeniz Palmiye Ağacı',
            category: 'landscape',
            orientation: 'standing',
            depth: 25,
            frontColor: '#15803d',
            sideColor: '#14532d',
            tags: ['palmiye', 'ağaç', 'sahil', 'villa', 'tropik', 'yazlık'],
            svg: createSvg(240, 280, `
                <!-- Kavisli Boğumlu Palmiye Gövdesi -->
                <path d="M100,270 Q115,180 120,90" fill="none" stroke="#78350f" stroke-width="16" stroke-linecap="round"/>
                <!-- Hindistan Cevizleri -->
                <circle cx="115" cy="90" r="7" fill="#451a03"/>
                <circle cx="125" cy="92" r="7" fill="#451a03"/>
                <!-- Sarkan Tropikal Palmiye Yaprakları -->
                <path d="M120,90 Q70,40 15,75 Q60,95 120,90 Z" fill="#16a34a" stroke="#14532d" stroke-width="2"/>
                <path d="M120,90 Q90,20 60,15 Q95,50 120,90 Z" fill="#22c55e" stroke="#14532d" stroke-width="2"/>
                <path d="M120,90 Q120,10 135,10 Q140,50 120,90 Z" fill="#15803d" stroke="#14532d" stroke-width="2"/>
                <path d="M120,90 Q160,20 190,20 Q160,55 120,90 Z" fill="#22c55e" stroke="#14532d" stroke-width="2"/>
                <path d="M120,90 Q185,45 225,85 Q170,100 120,90 Z" fill="#16a34a" stroke="#14532d" stroke-width="2"/>
                <path d="M120,90 Q165,115 195,145 Q150,130 120,90 Z" fill="#15803d" stroke="#14532d" stroke-width="2"/>
                <path d="M120,90 Q75,115 45,140 Q85,125 120,90 Z" fill="#15803d" stroke="#14532d" stroke-width="2"/>
            `)
        },
        {
            id: 'nature_cypress_tree',
            name: 'Kalem Selvi Ağacı',
            category: 'landscape',
            orientation: 'standing',
            depth: 20,
            frontColor: '#14532d',
            sideColor: '#052e16',
            tags: ['selvi', 'servi', 'ağaç', 'kalem', 'sınır', 'arsa', 'akdeniz'],
            svg: createSvg(140, 280, `
                <!-- Kısa Kütük -->
                <rect x="64" y="240" width="12" height="35" rx="2" fill="#451a03"/>
                <!-- Sütun Gövde / Kalem Selvi Alev Formu -->
                <path d="M70,15 C55,50 40,110 40,180 C40,225 55,245 70,245 C85,245 100,225 100,180 C100,110 85,50 70,15 Z" fill="#14532d" stroke="#052e16" stroke-width="3"/>
                <!-- Dokulu İğne Yaprak Vurguları -->
                <path d="M70,25 C62,60 52,110 52,175 C52,215 62,235 70,235 C78,235 88,215 88,175 C88,110 78,60 70,25 Z" fill="#166534"/>
                <path d="M70,35 C66,70 60,115 60,165 C60,205 66,220 70,220 C74,220 80,205 80,165 C80,115 74,70 70,35 Z" fill="#15803d"/>
            `)
        },
        {
            id: 'nature_oak_tree',
            name: 'Gövdeli Ulu Meşe Ağacı',
            category: 'landscape',
            orientation: 'standing',
            depth: 30,
            frontColor: '#15803d',
            sideColor: '#14532d',
            tags: ['meşe', 'ağaç', 'ulu ağaç', 'gölge', 'doğa', 'arsa'],
            svg: createSvg(280, 280, `
                <!-- Geniş Heybetli Meşe Gövdesi -->
                <path d="M120,270 L130,175 L115,135 L125,95 L140,140 L160,120 L150,175 L160,270 Z" fill="#451a03" stroke="#292524" stroke-width="3"/>
                <!-- Kök Çıkıntıları -->
                <path d="M120,270 L95,275 M160,270 L185,275" stroke="#451a03" stroke-width="8" stroke-linecap="round"/>
                <!-- Devasa Yuvarlak Yaprak Kümeleri -->
                <circle cx="140" cy="90" r="60" fill="#166534" stroke="#14532d" stroke-width="3"/>
                <circle cx="85" cy="115" r="50" fill="#15803d" stroke="#14532d" stroke-width="3"/>
                <circle cx="195" cy="115" r="50" fill="#15803d" stroke="#14532d" stroke-width="3"/>
                <circle cx="110" cy="65" r="45" fill="#22c55e" opacity="0.9"/>
                <circle cx="170" cy="65" r="45" fill="#22c55e" opacity="0.9"/>
                <circle cx="140" cy="50" r="38" fill="#4ade80" opacity="0.75"/>
            `)
        },
        {
            id: 'nature_fruit_tree',
            name: 'Meyve & Elma Ağacı',
            category: 'landscape',
            orientation: 'standing',
            depth: 25,
            frontColor: '#15803d',
            sideColor: '#14532d',
            tags: ['meyve', 'elma', 'ağaç', 'meyve bahçesi', 'tarla', 'hobi bahçesi'],
            svg: createSvg(240, 260, `
                <rect x="108" y="165" width="24" height="90" rx="4" fill="#78350f" stroke="#451a03" stroke-width="3"/>
                <!-- Dolgun Yuvarlak Taç -->
                <circle cx="120" cy="100" r="75" fill="#16a34a" stroke="#15803d" stroke-width="3"/>
                <circle cx="80" cy="110" r="45" fill="#22c55e"/>
                <circle cx="160" cy="110" r="45" fill="#22c55e"/>
                <circle cx="120" cy="70" r="50" fill="#4ade80" opacity="0.6"/>
                <!-- Kırmızı Elmalar -->
                <circle cx="75" cy="85" r="7" fill="#ef4444"/><circle cx="77" cy="83" r="2" fill="#fecaca"/>
                <circle cx="110" cy="60" r="7" fill="#ef4444"/><circle cx="112" cy="58" r="2" fill="#fecaca"/>
                <circle cx="155" cy="80" r="7" fill="#ef4444"/><circle cx="157" cy="78" r="2" fill="#fecaca"/>
                <circle cx="90" cy="125" r="7" fill="#ef4444"/><circle cx="92" cy="123" r="2" fill="#fecaca"/>
                <circle cx="145" cy="130" r="7" fill="#ef4444"/><circle cx="147" cy="128" r="2" fill="#fecaca"/>
                <circle cx="125" cy="100" r="7" fill="#ef4444"/><circle cx="127" cy="98" r="2" fill="#fecaca"/>
            `)
        },
        {
            id: 'nature_walnut_tree',
            name: 'Verimli Ceviz Ağacı',
            category: 'landscape',
            orientation: 'standing',
            depth: 26,
            frontColor: '#365314',
            sideColor: '#1a2e05',
            tags: ['ceviz', 'ağaç', 'cevizlik', 'tarla', 'arsa', 'tarım'],
            svg: createSvg(280, 260, `
                <!-- Kalın Sağlam Ceviz Gövdesi -->
                <path d="M125,255 L135,160 Q110,120 85,95 M135,160 Q165,120 195,95" fill="none" stroke="#57534e" stroke-width="20" stroke-linecap="round"/>
                <!-- Geniş Açılı Ceviz Tacı -->
                <circle cx="140" cy="85" r="65" fill="#4d7c0f" stroke="#365314" stroke-width="3"/>
                <circle cx="75" cy="105" r="50" fill="#3f6212" stroke="#365314" stroke-width="2.5"/>
                <circle cx="205" cy="105" r="50" fill="#3f6212" stroke="#365314" stroke-width="2.5"/>
                <circle cx="140" cy="60" r="45" fill="#65a30d" opacity="0.8"/>
            `)
        },
        {
            id: 'nature_blossom_tree',
            name: 'Çiçekli Erguvan Ağacı',
            category: 'landscape',
            orientation: 'standing',
            depth: 24,
            frontColor: '#ec4899',
            sideColor: '#be185d',
            tags: ['erguvan', 'kiraz çiçeği', 'pembe', 'çiçekli', 'ağaç', 'bahçe'],
            svg: createSvg(240, 260, `
                <path d="M120,255 Q115,180 120,135 Q100,105 85,85 M120,135 Q145,105 160,85" fill="none" stroke="#292524" stroke-width="16" stroke-linecap="round"/>
                <!-- Pembe Çiçek Kümeleri -->
                <circle cx="120" cy="85" r="60" fill="#ec4899" stroke="#db2777" stroke-width="3"/>
                <circle cx="75" cy="105" r="45" fill="#f472b6"/>
                <circle cx="165" cy="105" r="45" fill="#f472b6"/>
                <circle cx="120" cy="55" r="42" fill="#fbcfe8"/>
            `)
        },
        {
            id: 'landscape_pool_rect',
            name: 'Yüzme Havuzu (Dikdörtgen)',
            category: 'landscape',
            orientation: 'flat',
            depth: 16,
            frontColor: '#0284c7',
            sideColor: '#0369a1',
            tags: ['havuz', 'yüzme', 'villa', 'su', 'mavi', 'lüks'],
            svg: createSvg(280, 160, `
                <rect x="10" y="10" width="260" height="140" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4"/>
                <rect x="25" y="25" width="230" height="110" rx="6" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
                <path d="M35,45 Q70,35 105,45 T175,45 T245,45" fill="none" stroke="#38bdf8" stroke-width="2"/>
                <path d="M35,80 Q70,70 105,80 T175,80 T245,80" fill="none" stroke="#38bdf8" stroke-width="2"/>
                <path d="M35,115 Q70,105 105,115 T175,115 T245,115" fill="none" stroke="#38bdf8" stroke-width="2"/>
                <rect x="35" y="30" width="25" height="12" fill="#ffffff" opacity="0.9" rx="2"/>
                <rect x="35" y="46" width="25" height="12" fill="#ffffff" opacity="0.8" rx="2"/>
                <rect x="35" y="62" width="25" height="12" fill="#ffffff" opacity="0.7" rx="2"/>
            `)
        },
        {
            id: 'landscape_pool_oval',
            name: 'Oval Jakuzili Lüks Havuz',
            category: 'landscape',
            orientation: 'flat',
            depth: 16,
            frontColor: '#0284c7',
            sideColor: '#0369a1',
            tags: ['havuz', 'oval', 'jakuzi', 'lüks', 'villa', 'su'],
            svg: createSvg(280, 180, `
                <!-- Traverten Bordür -->
                <ellipse cx="140" cy="90" rx="130" ry="80" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4"/>
                <!-- Turkuaz Su Havzası -->
                <ellipse cx="140" cy="90" rx="115" ry="68" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
                <!-- Entegre Daire Jakuzi -->
                <circle cx="70" cy="90" r="30" fill="#0ea5e9" stroke="#ffffff" stroke-width="3"/>
                <circle cx="70" cy="90" r="16" fill="#38bdf8"/>
                <!-- Su Hareketleri -->
                <path d="M120,65 Q160,50 200,65" fill="none" stroke="#bae6fd" stroke-width="2"/>
                <path d="M120,95 Q160,80 200,95" fill="none" stroke="#bae6fd" stroke-width="2"/>
                <path d="M120,125 Q160,110 200,125" fill="none" stroke="#bae6fd" stroke-width="2"/>
            `)
        },
        {
            id: 'landscape_pergola_gazebo',
            name: 'Bahçe Kamelyası & Çardak',
            category: 'landscape',
            orientation: 'standing',
            depth: 50,
            frontColor: '#b45309',
            sideColor: '#78350f',
            tags: ['kamelya', 'çardak', 'pergola', 'bahçe', 'villa', 'ahşap'],
            svg: createSvg(240, 240, `
                <polygon points="120,20 225,85 15,85" fill="#78350f" stroke="#451a03" stroke-width="3"/>
                <rect x="30" y="85" width="14" height="145" fill="#b45309"/>
                <rect x="80" y="90" width="10" height="140" fill="#92400e"/>
                <rect x="150" y="90" width="10" height="140" fill="#92400e"/>
                <rect x="196" y="85" width="14" height="145" fill="#b45309"/>
                <rect x="15" y="225" width="210" height="12" rx="2" fill="#92400e"/>
                <rect x="30" y="165" width="180" height="35" fill="none" stroke="#78350f" stroke-width="2"/>
            `)
        },
        {
            id: 'landscape_bbq_patio',
            name: 'Taş Fırın & Barbekü Verandası',
            category: 'landscape',
            orientation: 'standing',
            depth: 40,
            frontColor: '#78350f',
            sideColor: '#451a03',
            tags: ['barbekü', 'fırın', 'mangal', 'bahçe', 'taş fırın', 'veranda'],
            svg: createSvg(240, 240, `
                <!-- Taş Gövde -->
                <rect x="30" y="120" width="180" height="110" fill="#78716c" stroke="#44403c" stroke-width="3"/>
                <!-- Kemerli Fırın Ağzı -->
                <path d="M60,190 L60,150 Q90,125 120,150 L120,190 Z" fill="#1c1917" stroke="#44403c" stroke-width="2"/>
                <circle cx="90" cy="165" r="8" fill="#f59e0b"/>
                <!-- Duman Bacası -->
                <rect x="75" y="45" width="30" height="75" fill="#57534e" stroke="#292524" stroke-width="2"/>
                <rect x="65" y="40" width="50" height="10" fill="#292524"/>
                <!-- Paslanmaz Izgara Tezgahı -->
                <rect x="135" y="140" width="65" height="10" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
                <!-- Ahşap Gölgelik Tente -->
                <line x1="20" y1="120" x2="220" y2="120" stroke="#b45309" stroke-width="6"/>
            `)
        },
        {
            id: 'landscape_flower_bed',
            name: 'Bahçe Çiçekliği & Çalılar',
            category: 'landscape',
            orientation: 'standing',
            depth: 18,
            frontColor: '#a855f7',
            sideColor: '#7e22ce',
            tags: ['çiçek', 'lavanta', 'çalı', 'peyzaj', 'bahçe', 'renkli'],
            svg: createSvg(280, 120, `
                <!-- Yeşil Çalı Tabanı -->
                <ellipse cx="60" cy="85" rx="50" ry="30" fill="#15803d"/>
                <ellipse cx="140" cy="80" rx="55" ry="35" fill="#16a34a"/>
                <ellipse cx="220" cy="85" rx="50" ry="30" fill="#15803d"/>
                <!-- Mor Lavanta Başakları -->
                <g fill="#9333ea" stroke="#7e22ce" stroke-width="1">
                    <line x1="45" y1="90" x2="45" y2="40" stroke="#14532d" stroke-width="2"/><circle cx="45" cy="40" r="5"/>
                    <line x1="65" y1="90" x2="65" y2="30" stroke="#14532d" stroke-width="2"/><circle cx="65" cy="30" r="6"/>
                    <line x1="85" y1="90" x2="85" y2="45" stroke="#14532d" stroke-width="2"/><circle cx="85" cy="45" r="5"/>
                    <line x1="125" y1="85" x2="125" y2="25" stroke="#14532d" stroke-width="2"/><circle cx="125" cy="25" r="6"/>
                    <line x1="145" y1="85" x2="145" y2="20" stroke="#14532d" stroke-width="2"/><circle cx="145" cy="20" r="7"/>
                    <line x1="165" y1="85" x2="165" y2="30" stroke="#14532d" stroke-width="2"/><circle cx="165" cy="30" r="6"/>
                    <line x1="205" y1="90" x2="205" y2="40" stroke="#14532d" stroke-width="2"/><circle cx="205" cy="40" r="5"/>
                    <line x1="225" y1="90" x2="225" y2="35" stroke="#14532d" stroke-width="2"/><circle cx="225" cy="35" r="6"/>
                    <line x1="245" y1="90" x2="245" y2="45" stroke="#14532d" stroke-width="2"/><circle cx="245" cy="45" r="5"/>
                </g>
                <!-- Sarı Çiçek Noktaları -->
                <circle cx="105" cy="65" r="6" fill="#facc15"/><circle cx="185" cy="65" r="6" fill="#facc15"/>
            `)
        },
        {
            id: 'landscape_stone_path',
            name: 'Kayrak Taş Bahçe Yolu',
            category: 'landscape',
            orientation: 'flat',
            depth: 6,
            frontColor: '#94a3b8',
            sideColor: '#475569',
            tags: ['taş yol', 'kayrak', 'adım taşı', 'patika', 'bahçe yolu'],
            svg: createSvg(280, 120, `
                <!-- Çim Zemin -->
                <rect x="5" y="10" width="270" height="100" rx="8" fill="#15803d" opacity="0.4"/>
                <!-- Düzensiz Kayrak Taşları -->
                <polygon points="30,35 65,25 75,60 40,70" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
                <polygon points="90,45 130,35 145,75 105,85" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
                <polygon points="160,25 200,30 215,65 170,75" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
                <polygon points="225,40 260,35 270,70 235,80" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
            `)
        },

        // ==========================================
        // 5. OTOPARK & TESİS (PARKING & UTILITY)
        // ==========================================
        {
            id: 'utility_carport_canopy',
            name: 'Araç Otopark Sundurması',
            category: 'utility',
            orientation: 'standing',
            depth: 45,
            frontColor: '#334155',
            sideColor: '#1e293b',
            tags: ['otopark', 'araç', 'sundurma', 'çatı', 'garaj', 'villa'],
            svg: createSvg(280, 200, `
                <polygon points="10,40 270,25 270,45 10,60" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
                <line x1="40" y1="58" x2="40" y2="185" stroke="#334155" stroke-width="8" stroke-linecap="round"/>
                <line x1="220" y1="45" x2="220" y2="185" stroke="#334155" stroke-width="8" stroke-linecap="round"/>
                <line x1="40" y1="80" x2="60" y2="55" stroke="#64748b" stroke-width="5"/>
                <line x1="220" y1="70" x2="200" y2="47" stroke="#64748b" stroke-width="5"/>
                <rect x="20" y="185" width="240" height="8" rx="2" fill="#f59e0b"/>
            `)
        },
        {
            id: 'utility_solar_array',
            name: 'Güneş Paneli Tarlası',
            category: 'utility',
            orientation: 'standing',
            depth: 25,
            frontColor: '#1e3a8a',
            sideColor: '#172554',
            tags: ['güneş paneli', 'ges', 'enerji', 'arsa', 'tarla', 'çatı'],
            svg: createSvg(260, 200, `
                <line x1="50" y1="80" x2="40" y2="185" stroke="#64748b" stroke-width="6"/>
                <line x1="210" y1="80" x2="220" y2="185" stroke="#64748b" stroke-width="6"/>
                <polygon points="30,45 230,45 250,130 10,130" fill="#1e3a8a" stroke="#cbd5e1" stroke-width="3"/>
                <line x1="30" y1="85" x2="240" y2="85" stroke="#93c5fd" stroke-width="2"/>
                <line x1="85" y1="45" x2="70" y2="130" stroke="#93c5fd" stroke-width="2"/>
                <line x1="130" y1="45" x2="130" y2="130" stroke="#93c5fd" stroke-width="2"/>
                <line x1="175" y1="45" x2="190" y2="130" stroke="#93c5fd" stroke-width="2"/>
            `)
        },
        {
            id: 'utility_water_well',
            name: 'Kuyu & Sondaj Su Deposu',
            category: 'utility',
            orientation: 'standing',
            depth: 35,
            frontColor: '#0ea5e9',
            sideColor: '#0369a1',
            tags: ['kuyu', 'sondaj', 'su', 'depo', 'tarla', 'arsa', 'tarım'],
            svg: createSvg(220, 240, `
                <rect x="40" y="65" width="140" height="150" rx="20" fill="#0284c7" stroke="#0f172a" stroke-width="4"/>
                <ellipse cx="110" cy="65" rx="70" ry="18" fill="#38bdf8" stroke="#0f172a" stroke-width="3"/>
                <text x="110" y="150" font-family="'ClassicAmpersand', sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle">SU DEPOSU</text>
            `)
        },
        {
            id: 'utility_detached_garage',
            name: 'Kapalı Müstakil Garaj',
            category: 'utility',
            orientation: 'standing',
            depth: 65,
            frontColor: '#475569',
            sideColor: '#1e293b',
            tags: ['garaj', 'kapalı garaj', 'otopark', 'araç', 'müstakil'],
            svg: createSvg(280, 200, `
                <!-- Beşik Çatı -->
                <polygon points="140,20 270,75 10,75" fill="#334155" stroke="#0f172a" stroke-width="3"/>
                <!-- Garaj Gövdesi -->
                <rect x="25" y="75" width="230" height="115" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>
                <!-- Otomatik Seksiyonel Garaj Kapısı -->
                <rect x="55" y="88" width="170" height="102" fill="#475569" stroke="#1e293b" stroke-width="3"/>
                <line x1="55" y1="112" x2="225" y2="112" stroke="#64748b" stroke-width="2"/>
                <line x1="55" y1="138" x2="225" y2="138" stroke="#64748b" stroke-width="2"/>
                <line x1="55" y1="164" x2="225" y2="164" stroke="#64748b" stroke-width="2"/>
                <!-- Yan Güvenlik Lambası -->
                <circle cx="40" cy="100" r="6" fill="#f59e0b"/>
            `)
        },
        {
            id: 'utility_street_light',
            name: 'Sokak & Bahçe Aydınlatma Direği',
            category: 'utility',
            orientation: 'standing',
            depth: 14,
            frontColor: '#fef08a',
            sideColor: '#1e293b',
            tags: ['aydınlatma', 'direk', 'lamba', 'sokak lambası', 'bahçe'],
            svg: createSvg(160, 280, `
                <!-- Siyah Döküm Kaide ve Direk -->
                <rect x="65" y="250" width="30" height="25" rx="3" fill="#0f172a"/>
                <rect x="76" y="55" width="8" height="200" fill="#1e293b"/>
                <!-- Kavisli Kol -->
                <path d="M80,65 Q80,25 115,25 Q135,25 135,45" fill="none" stroke="#1e293b" stroke-width="8" stroke-linecap="round"/>
                <!-- Fener Gövdesi & Sıcak Sarı Işık Halesi -->
                <circle cx="135" cy="55" r="28" fill="#fef08a" opacity="0.3"/>
                <polygon points="120,45 150,45 145,75 125,75" fill="#fef08a" stroke="#0f172a" stroke-width="2"/>
                <polygon points="115,45 155,45 135,35" fill="#0f172a"/>
            `)
        }
    ];

    // ==========================================
    // 6. UI VİTRİNİ & ETKİLEŞİM YÖNETİCİSİ (SHOWCASE CONTROLLER)
    // ==========================================
    let currentCategory = 'all';

    function initEstate3DShowcase() {
        const catTabsEl = document.getElementById('estate3DCatTabs');
        const gridEl = document.getElementById('estate3DGrid');
        const searchInput = document.getElementById('estate3DSearchInput');
        const countBadge = document.getElementById('estate3DCountBadge');

        if (!document.getElementById('estate-3d-styles')) {
            const style = document.createElement('style');
            style.id = 'estate-3d-styles';
            style.textContent = `
                .estate-3d-card-thumb svg {
                    max-width: 100% !important;
                    max-height: 100% !important;
                    width: auto !important;
                    height: auto !important;
                    display: block;
                }
                .three-d-estate-btn {
                    padding: 5px 3px !important;
                    font-size: 9.5px !important;
                    flex-direction: column !important;
                    gap: 3px !important;
                    height: auto !important;
                    text-align: center !important;
                    white-space: nowrap !important;
                }
                .three-d-estate-btn i {
                    font-size: 12px !important;
                }
                #calloutAccordion #estate3DShowcaseSection > div {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    transform: none !important;
                }
                #calloutAccordion #estate3DShowcaseSection .estate-3d-card {
                    background: #ffffff !important;
                    border: 1px solid #e2e8f0 !important;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02) !important;
                }
                #calloutAccordion #estate3DShowcaseSection .estate-3d-card:hover {
                    border-color: #0284c7 !important;
                    box-shadow: 0 2px 6px rgba(2, 132, 199, 0.15) !important;
                    transform: translateY(-1px) !important;
                }
            `;
            document.head.appendChild(style);
        }

        if (!catTabsEl || !gridEl) return;

        if (countBadge) {
            countBadge.textContent = ITEMS.length + ' Model';
        }

        // 1. Kategori Tabları
        catTabsEl.innerHTML = '';
        CATEGORIES.forEach(cat => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'estate-cat-btn' + (cat.id === currentCategory ? ' active' : '');
            btn.setAttribute('data-cat', cat.id);
            btn.style.cssText = `
                padding: 3px 8px;
                font-size: 10px;
                font-weight: 600;
                border-radius: 12px;
                border: 1px solid ${cat.id === currentCategory ? '#0284c7' : '#cbd5e1'};
                background: ${cat.id === currentCategory ? '#0284c7' : '#f8fafc'};
                color: ${cat.id === currentCategory ? '#ffffff' : '#334155'};
                cursor: pointer;
                white-space: nowrap;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: all 0.15s ease;
            `;
            btn.innerHTML = `<i class="fa-solid ${cat.icon}" style="font-size:9.5px;"></i><span>${cat.title}</span>`;
            btn.addEventListener('click', () => {
                currentCategory = cat.id;
                catTabsEl.querySelectorAll('.estate-cat-btn').forEach(b => {
                    const isActive = b.getAttribute('data-cat') === currentCategory;
                    b.style.border = isActive ? '1px solid #0284c7' : '1px solid #cbd5e1';
                    b.style.background = isActive ? '#0284c7' : '#f8fafc';
                    b.style.color = isActive ? '#ffffff' : '#334155';
                });
                renderShowcaseGrid();
            });
            catTabsEl.appendChild(btn);
        });

        // 2. Arama Girişi
        if (searchInput && !searchInput._hasEvent) {
            searchInput._hasEvent = true;
            searchInput.addEventListener('input', () => {
                renderShowcaseGrid();
            });
        }

        renderShowcaseGrid();
    }

    function renderShowcaseGrid() {
        const gridEl = document.getElementById('estate3DGrid');
        const searchInput = document.getElementById('estate3DSearchInput');
        if (!gridEl) return;

        const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
        const filtered = window.Estate3DLibrary.search(query, currentCategory);

        gridEl.innerHTML = '';

        if (filtered.length === 0) {
            gridEl.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 18px; text-align: center; color: #94a3b8; font-size: 11px;">
                    Aradığınız kriterde 3D model bulunamadı.
                </div>
            `;
            return;
        }

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'estate-3d-card';
            card.setAttribute('data-id', item.id);
            card.title = item.name + ' - 3D Olarak Ekle';
            card.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 6px 4px;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
                cursor: pointer;
                transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
                user-select: none;
            `;

            card.innerHTML = `
                <div class="estate-3d-card-thumb" style="width:100%; height:54px; display:flex; align-items:center; justify-content:center; overflow:hidden; pointer-events:none;">
                    <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
                        ${item.svg}
                    </div>
                </div>
                <div class="estate-3d-card-label" style="margin-top:4px; font-size:10px; font-weight:700; color:#0f172a; text-align:center; line-height:1.2; width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                    ${item.name}
                </div>
            `;

            card.addEventListener('mouseenter', () => {
                card.style.borderColor = '#0284c7';
                card.style.boxShadow = '0 2px 6px rgba(2, 132, 199, 0.15)';
                card.style.transform = 'translateY(-1px)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.borderColor = '#e2e8f0';
                card.style.boxShadow = 'none';
                card.style.transform = 'none';
            });

            card.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.ThreeDEngine && typeof window.ThreeDEngine.add3DEstateElement === 'function') {
                    window.ThreeDEngine.add3DEstateElement(item);
                }
            });

            gridEl.appendChild(card);
        });
    }

    // Public API
    window.Estate3DLibrary = {
        getCategories: () => CATEGORIES,
        getItems: () => ITEMS,
        getItemById: (id) => ITEMS.find(item => item.id === id) || null,
        initShowcase: initEstate3DShowcase,
        renderShowcaseGrid: renderShowcaseGrid,
        search: (query = '', category = 'all') => {
            const q = query.toLowerCase().trim();
            return ITEMS.filter(item => {
                const matchCat = (category === 'all' || item.category === category);
                if (!matchCat) return false;
                if (!q) return true;
                const matchName = item.name.toLowerCase().includes(q);
                const matchTags = item.tags && item.tags.some(t => t.toLowerCase().includes(q));
                return matchName || matchTags;
            });
        }
    };

    // Sayfa hazır olduğunda vitrini yükle
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initEstate3DShowcase, 200);
        });
    } else {
        setTimeout(initEstate3DShowcase, 200);
    }

})(window);
