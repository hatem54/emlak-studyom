/**
 * ============================================================================
 * 📺 16:9 FORMAT PRO JSON ŞABLONLARI (YOUTUBE / WEB / BANNER - 1920x1080)
 * templates_json/templates_16_9.js
 * ============================================================================
 */

(function(window) {
    'use strict';

    const TEMPLATES_16_9 = [
        {
            id: 'pj_16x9_safir_villa',
            name: 'Safir Lüks Villa',
            format: '16:9',
            w: 1920, h: 1080,
            category: 'villa',
            badge: '👑 PRO VILLA',
            previewBg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
            elements: [
                {
                    id: 'el_badge', field: 'badge',
                    style: 'position:absolute; top:40px; left:50px; background:linear-gradient(135deg,#6366f1,#4f46e5); color:#fff; padding:12px 28px; border-radius:50px; font-size:22px; font-weight:800; letter-spacing:1px; box-shadow:0 10px 25px rgba(99,102,241,0.4); text-transform:uppercase; z-index:20;',
                    html: '<i class="fas fa-gem" style="margin-right:8px;"></i> SATILIK LÜKS VİLLA'
                },
                {
                    id: 'el_loc', field: 'location',
                    style: 'position:absolute; top:45px; right:50px; background:rgba(15,23,42,0.85); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.15); color:#38bdf8; padding:10px 24px; border-radius:30px; font-size:20px; font-weight:700; z-index:20;',
                    html: '<i class="fas fa-map-marker-alt" style="margin-right:8px; color:#f43f5e;"></i> BODRUM / YALIKAVAK'
                },
                {
                    id: 'el_price', field: 'price',
                    style: 'position:absolute; bottom:50px; left:50px; background:linear-gradient(135deg,#d97706,#f59e0b); color:#fff; padding:18px 40px; border-radius:18px; font-size:42px; font-weight:900; letter-spacing:0.5px; box-shadow:0 15px 35px rgba(217,119,6,0.5); z-index:20;',
                    html: '45.000.000 ₺'
                },
                {
                    id: 'el_card', field: 'features',
                    style: 'position:absolute; bottom:50px; right:50px; background:rgba(15,23,42,0.88); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.12); padding:16px 28px; border-radius:18px; display:flex; gap:20px; align-items:center; box-shadow:0 20px 40px rgba(0,0,0,0.5); z-index:20;',
                    html: `
                        <div style="display:flex; align-items:center; gap:8px; color:#fff; font-size:20px; font-weight:700;"><i class="fas fa-bed" style="color:#818cf8;"></i> <span data-field="rooms">5+2</span></div>
                        <div style="width:1px; height:28px; background:rgba(255,255,255,0.2);"></div>
                        <div style="display:flex; align-items:center; gap:8px; color:#fff; font-size:20px; font-weight:700;"><i class="fas fa-vector-square" style="color:#38bdf8;"></i> <span data-field="size">480 m²</span></div>
                        <div style="width:1px; height:28px; background:rgba(255,255,255,0.2);"></div>
                        <div style="display:flex; align-items:center; gap:8px; color:#fff; font-size:20px; font-weight:700;"><i class="fas fa-swimming-pool" style="color:#34d399;"></i> <span>Müstakil Havuz</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_16x9_minimal_dark',
            name: 'Ultra Minimal Dark',
            format: '16:9',
            w: 1920, h: 1080,
            category: 'konut',
            badge: '✨ MINIMAL',
            previewBg: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
            elements: [
                {
                    id: 'el_bar', field: 'badge',
                    style: 'position:absolute; top:0; left:0; width:100%; height:12px; background:linear-gradient(90deg, #38bdf8, #818cf8, #c084fc); z-index:20;',
                    html: ''
                },
                {
                    id: 'el_badge', field: 'badge',
                    style: 'position:absolute; top:50px; left:60px; background:#18181b; border:1px solid #27272a; color:#fafafa; padding:10px 24px; border-radius:8px; font-size:20px; font-weight:700; z-index:20;',
                    html: 'SATILIK DAİRE'
                },
                {
                    id: 'el_price', field: 'price',
                    style: 'position:absolute; top:42px; right:60px; color:#38bdf8; font-size:46px; font-weight:900; letter-spacing:-1px; text-shadow:0 0 30px rgba(56,189,248,0.4); z-index:20;',
                    html: '6.850.000 ₺'
                },
                {
                    id: 'el_bottom', field: 'features',
                    style: 'position:absolute; bottom:50px; left:60px; right:60px; background:rgba(24,24,27,0.9); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:18px 36px; display:flex; justify-content:space-between; align-items:center; z-index:20;',
                    html: `
                        <div style="font-size:22px; font-weight:700; color:#fff;" data-field="location"><i class="fas fa-location-dot" style="color:#ef4444; margin-right:8px;"></i> Kadıköy / Moda</div>
                        <div style="display:flex; gap:30px;">
                            <span style="font-size:20px; color:#a1a1aa;"><strong style="color:#fff;" data-field="rooms">3+1</strong> Oda</span>
                            <span style="font-size:20px; color:#a1a1aa;"><strong style="color:#fff;" data-field="size">145 m²</strong> Net</span>
                            <span style="font-size:20px; color:#a1a1aa;"><strong style="color:#fff;" data-field="floor">4. Kat</strong></span>
                        </div>
                    `
                }
            ]
        },
        {
            id: 'pj_16x9_arsa_pro',
            name: 'Arsa & Tarla Pro',
            format: '16:9',
            w: 1920, h: 1080,
            category: 'arsa',
            badge: '🌾 ARSA/TARLA',
            previewBg: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
            elements: [
                {
                    id: 'el_land_badge', field: 'badge',
                    style: 'position:absolute; top:40px; left:50px; background:#059669; color:#fff; padding:12px 28px; border-radius:12px; font-size:24px; font-weight:800; z-index:20;',
                    html: '🌱 YATIRIMLIK İMARLI ARSA'
                },
                {
                    id: 'el_ada_parsel', field: 'land',
                    style: 'position:absolute; top:40px; right:50px; background:rgba(2,44,34,0.9); border:2px solid #10b981; color:#fff; padding:12px 26px; border-radius:12px; font-size:22px; font-weight:800; z-index:20;',
                    html: '<i class="fas fa-map" style="color:#34d399; margin-right:8px;"></i> ADA: 104 / PARSEL: 12'
                },
                {
                    id: 'el_price_box', field: 'price',
                    style: 'position:absolute; bottom:50px; left:50px; background:rgba(0,0,0,0.85); border-left:6px solid #10b981; padding:16px 32px; border-radius:0 14px 14px 0; color:#fff; font-size:44px; font-weight:900; z-index:20;',
                    html: '4.200.000 ₺'
                },
                {
                    id: 'el_land_desc', field: 'features',
                    style: 'position:absolute; bottom:50px; right:50px; background:rgba(2,44,34,0.92); border:1px solid rgba(16,185,129,0.3); padding:16px 28px; border-radius:14px; color:#fff; font-size:20px; font-weight:700; z-index:20; display:flex; gap:20px;',
                    html: `
                        <div><i class="fas fa-chart-area" style="color:#34d399;"></i> <span data-field="size">1.850 m²</span></div>
                        <div style="width:1px; height:24px; background:rgba(255,255,255,0.2);"></div>
                        <div><i class="fas fa-road" style="color:#fbbf24;"></i> <span>Yola Cephe</span></div>
                        <div style="width:1px; height:24px; background:rgba(255,255,255,0.2);"></div>
                        <div><i class="fas fa-file-contract" style="color:#60a5fa;"></i> <span>Müstakil Tapu</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_16x9_cyber_neon',
            name: 'Cyber Neon Emlak',
            format: '16:9',
            w: 1920, h: 1080,
            category: 'konut',
            badge: '⚡ NEON GLOW',
            previewBg: 'linear-gradient(135deg, #18032b 0%, #030014 100%)',
            elements: [
                {
                    id: 'el_neon_badge', field: 'badge',
                    style: 'position:absolute; top:40px; left:50px; background:rgba(236,72,153,0.2); border:2px solid #ec4899; color:#f472b6; padding:10px 26px; border-radius:30px; font-size:22px; font-weight:900; text-shadow:0 0 15px #ec4899; box-shadow:0 0 25px rgba(236,72,153,0.3); z-index:20;',
                    html: '⚡ FIRSAT GAYRİMENKUL'
                },
                {
                    id: 'el_neon_price', field: 'price',
                    style: 'position:absolute; bottom:50px; left:50px; background:rgba(14,165,233,0.2); border:2px solid #0ea5e9; color:#38bdf8; padding:16px 36px; border-radius:16px; font-size:48px; font-weight:900; text-shadow:0 0 20px #0ea5e9; box-shadow:0 0 30px rgba(14,165,233,0.3); z-index:20;',
                    html: '12.500.000 ₺'
                },
                {
                    id: 'el_neon_features', field: 'features',
                    style: 'position:absolute; bottom:50px; right:50px; background:rgba(0,0,0,0.8); border:1px solid rgba(236,72,153,0.4); padding:16px 30px; border-radius:16px; display:flex; gap:24px; color:#fff; font-size:22px; font-weight:700; z-index:20;',
                    html: `
                        <div><i class="fas fa-home" style="color:#f472b6;"></i> <span data-field="rooms">4+1 Dubleks</span></div>
                        <div><i class="fas fa-expand-arrows-alt" style="color:#38bdf8;"></i> <span data-field="size">220 m²</span></div>
                        <div><i class="fas fa-building" style="color:#a855f7;"></i> <span data-field="floor">7. Kat</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_16x9_modern_residence',
            name: 'Modern Residence',
            format: '16:9',
            w: 1920, h: 1080,
            category: 'konut',
            badge: '🏢 RESIDENCE',
            previewBg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            elements: [
                {
                    id: 'el_card', field: 'features',
                    style: 'position:absolute; right:50px; top:50px; bottom:50px; width:440px; background:rgba(15,23,42,0.92); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.15); border-radius:24px; padding:40px 32px; display:flex; flex-direction:column; justify-content:space-between; z-index:20; box-shadow:0 25px 50px rgba(0,0,0,0.6);',
                    html: `
                        <div>
                            <div style="background:#3b82f6; color:#fff; display:inline-block; padding:6px 16px; border-radius:20px; font-size:16px; font-weight:800; margin-bottom:14px;" data-field="badge">SATILIK REZİDANS</div>
                            <h2 style="font-size:28px; font-weight:900; color:#fff; margin:0 0 10px 0;" data-field="location">Ataşehir / Finans Merkezi</h2>
                            <p style="color:#94a3b8; font-size:16px; line-height:1.4; margin:0 0 24px 0;" data-field="desc">7/24 Güvenlik, Kapalı Havuz, Fitness, Vale ve Akıllı Ev Sistemi</p>
                            
                            <div style="display:flex; flex-direction:column; gap:12px;">
                                <div style="background:rgba(255,255,255,0.05); padding:10px 16px; border-radius:10px; display:flex; justify-content:space-between; color:#cbd5e1; font-size:18px;">
                                    <span><i class="fas fa-door-open" style="color:#38bdf8; margin-right:8px;"></i> Oda</span>
                                    <strong style="color:#fff;" data-field="rooms">2+1</strong>
                                </div>
                                <div style="background:rgba(255,255,255,0.05); padding:10px 16px; border-radius:10px; display:flex; justify-content:space-between; color:#cbd5e1; font-size:18px;">
                                    <span><i class="fas fa-ruler-combined" style="color:#38bdf8; margin-right:8px;"></i> Alan</span>
                                    <strong style="color:#fff;" data-field="size">115 m²</strong>
                                </div>
                                <div style="background:rgba(255,255,255,0.05); padding:10px 16px; border-radius:10px; display:flex; justify-content:space-between; color:#cbd5e1; font-size:18px;">
                                    <span><i class="fas fa-layer-group" style="color:#38bdf8; margin-right:8px;"></i> Kat</span>
                                    <strong style="color:#fff;" data-field="floor">18. Kat</strong>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div style="color:#94a3b8; font-size:14px; font-weight:600; margin-bottom:4px;">SATIŞ FİYATI</div>
                            <div style="font-size:38px; font-weight:900; color:#38bdf8; letter-spacing:-0.5px;" data-field="price">8.900.000 ₺</div>
                        </div>
                    `
                }
            ]
        },
        {
            id: 'pj_16x9_gold_prestige',
            name: 'Gold Prestij Emlak',
            format: '16:9',
            w: 1920, h: 1080,
            category: 'villa',
            badge: '⚜️ GOLD PRESTIGE',
            previewBg: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
            elements: [
                {
                    id: 'el_gold_top', field: 'badge',
                    style: 'position:absolute; top:40px; left:50px; background:linear-gradient(135deg, #ca8a04, #eab308); color:#000; padding:12px 30px; border-radius:8px; font-size:22px; font-weight:900; letter-spacing:1px; z-index:20;',
                    html: '⚜️ ÖZEL PORTFÖY'
                },
                {
                    id: 'el_gold_price', field: 'price',
                    style: 'position:absolute; bottom:50px; left:50px; background:rgba(0,0,0,0.85); border:2px solid #eab308; color:#facc15; padding:18px 40px; border-radius:14px; font-size:44px; font-weight:900; z-index:20;',
                    html: '32.000.000 ₺'
                },
                {
                    id: 'el_gold_details', field: 'features',
                    style: 'position:absolute; bottom:50px; right:50px; background:rgba(0,0,0,0.85); border:1px solid rgba(234,179,8,0.4); padding:18px 36px; border-radius:14px; display:flex; gap:28px; color:#fff; font-size:20px; font-weight:700; z-index:20;',
                    html: `
                        <div><span style="color:#eab308;">ODA:</span> <strong data-field="rooms">6+2</strong></div>
                        <div><span style="color:#eab308;">M²:</span> <strong data-field="size">650 m²</strong></div>
                        <div><span style="color:#eab308;">ARSA:</span> <strong data-field="land">1.200 m²</strong></div>
                    `
                }
            ]
        },
        {
            id: 'pj_16x9_yatirim_firsati',
            name: 'Yatırım Fırsatı',
            format: '16:9',
            w: 1920, h: 1080,
            category: 'ticari',
            badge: '🔥 ACİL FIRSAT',
            previewBg: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
            elements: [
                {
                    id: 'el_fire_badge', field: 'badge',
                    style: 'position:absolute; top:40px; left:50px; background:#dc2626; color:#fff; padding:12px 28px; border-radius:50px; font-size:22px; font-weight:900; box-shadow:0 10px 25px rgba(220,38,38,0.5); z-index:20;',
                    html: '🔥 ACİL YATIRIM FIRSATI'
                },
                {
                    id: 'el_fire_price', field: 'price',
                    style: 'position:absolute; bottom:50px; left:50px; background:#b91c1c; color:#fff; padding:16px 36px; border-radius:14px; font-size:46px; font-weight:900; z-index:20;',
                    html: '3.950.000 ₺'
                },
                {
                    id: 'el_fire_ret', field: 'features',
                    style: 'position:absolute; bottom:50px; right:50px; background:rgba(0,0,0,0.85); border:1px solid #ef4444; color:#fff; padding:16px 30px; border-radius:14px; font-size:22px; font-weight:700; z-index:20; display:flex; gap:20px;',
                    html: `
                        <div><i class="fas fa-coins" style="color:#fbbf24;"></i> Yüksek Kira Getirili</div>
                        <div style="width:1px; height:24px; background:rgba(255,255,255,0.2);"></div>
                        <div><i class="fas fa-store" style="color:#60a5fa;"></i> <span data-field="size">95 m² Dükkan</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_16x9_doga_mustakil',
            name: 'Doğa & Müstakil Ev',
            format: '16:9',
            w: 1920, h: 1080,
            category: 'villa',
            badge: '🌿 DOĞA İÇİ',
            previewBg: 'linear-gradient(135deg, #14532d 0%, #052e16 100%)',
            elements: [
                {
                    id: 'el_nature_badge', field: 'badge',
                    style: 'position:absolute; top:40px; left:50px; background:#16a34a; color:#fff; padding:12px 28px; border-radius:30px; font-size:22px; font-weight:800; z-index:20;',
                    html: '🌲 DOĞA İÇERİSİNDE MÜSTAKİL'
                },
                {
                    id: 'el_nature_price', field: 'price',
                    style: 'position:absolute; bottom:50px; left:50px; background:rgba(5,46,22,0.9); border:2px solid #22c55e; color:#4ade80; padding:16px 36px; border-radius:14px; font-size:44px; font-weight:900; z-index:20;',
                    html: '16.500.000 ₺'
                },
                {
                    id: 'el_nature_grid', field: 'features',
                    style: 'position:absolute; bottom:50px; right:50px; background:rgba(0,0,0,0.85); padding:16px 28px; border-radius:14px; display:flex; gap:24px; color:#fff; font-size:20px; font-weight:700; z-index:20;',
                    html: `
                        <div><i class="fas fa-tree" style="color:#4ade80;"></i> <span data-field="land">2.500 m² Bahçe</span></div>
                        <div><i class="fas fa-home" style="color:#86efac;"></i> <span data-field="rooms">4+1 Taş Ev</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_16x9_diagonal_split',
            name: 'Açılı Modern Şerit',
            format: '16:9',
            w: 1920, h: 1080,
            category: 'konut',
            badge: '📐 DİAGONAL',
            previewBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            elements: [
                {
                    id: 'el_diag_header', field: 'badge',
                    style: 'position:absolute; top:40px; left:50px; background:#2563eb; color:#fff; padding:12px 32px; border-radius:12px; font-size:24px; font-weight:800; transform:skewX(-8deg); z-index:20;',
                    html: '<span style="display:inline-block; transform:skewX(8deg);">SATILIK LÜKS DAİRE</span>'
                },
                {
                    id: 'el_diag_price', field: 'price',
                    style: 'position:absolute; bottom:50px; left:50px; background:#1e3a8a; color:#93c5fd; padding:16px 36px; border-radius:12px; font-size:44px; font-weight:900; transform:skewX(-8deg); z-index:20;',
                    html: '<span style="display:inline-block; transform:skewX(8deg);">7.450.000 ₺</span>'
                },
                {
                    id: 'el_diag_info', field: 'features',
                    style: 'position:absolute; bottom:50px; right:50px; background:rgba(15,23,42,0.9); border-right:5px solid #3b82f6; padding:16px 30px; border-radius:12px 0 0 12px; color:#fff; font-size:22px; font-weight:700; z-index:20; display:flex; gap:20px;',
                    html: `
                        <div><strong data-field="rooms">3+1</strong></div>
                        <div>|</div>
                        <div><strong data-field="size">160 m²</strong></div>
                        <div>|</div>
                        <div><span data-field="location">Bursa / Nilüfer</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_16x9_panoramic_clean',
            name: 'Panoramik Manzara',
            format: '16:9',
            w: 1920, h: 1080,
            category: 'konut',
            badge: '🌊 PANORAMİK',
            previewBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            elements: [
                {
                    id: 'el_pano_badge', field: 'badge',
                    style: 'position:absolute; top:40px; left:50px; background:rgba(255,255,255,0.95); color:#0369a1; padding:10px 24px; border-radius:30px; font-size:20px; font-weight:800; z-index:20;',
                    html: '🌊 KESİNTİSİZ DENİZ MANZARALI'
                },
                {
                    id: 'el_pano_price', field: 'price',
                    style: 'position:absolute; bottom:50px; left:50px; background:#0284c7; color:#fff; padding:16px 36px; border-radius:14px; font-size:44px; font-weight:900; z-index:20;',
                    html: '14.800.000 ₺'
                },
                {
                    id: 'el_pano_meta', field: 'features',
                    style: 'position:absolute; bottom:50px; right:50px; background:rgba(0,0,0,0.8); padding:16px 28px; border-radius:14px; color:#fff; font-size:20px; font-weight:700; z-index:20; display:flex; gap:24px;',
                    html: `
                        <div><i class="fas fa-home" style="color:#38bdf8;"></i> <span data-field="rooms">3+1</span></div>
                        <div><i class="fas fa-ruler" style="color:#38bdf8;"></i> <span data-field="size">185 m²</span></div>
                        <div><i class="fas fa-map-pin" style="color:#f43f5e;"></i> <span data-field="location">İzmir / Karşıyaka</span></div>
                    `
                }
            ]
        }
    ];

    // Otomatik Kayıt Motoruna Ekle
    TEMPLATES_16_9.forEach(t => {
        if (typeof window.registerProJsonTemplate === 'function') {
            window.registerProJsonTemplate(t);
        }
    });

})(window);
