/**
 * ============================================================================
 * 👑 PRO JSON ŞABLON KÜTÜPHANESİ & AKILLI METİN EŞLEŞTİRME MOTORU
 * modules/json-templates.js
 * ============================================================================
 * 4 Farklı Formatta (16:9, 1:1, 4:5, 9:16) toplam 40 adet PRO Seviye
 * Emlak Şablonu ve "Metni Süz" (Smart Parser) otomatik eşleştirme sistemi.
 */

(function(window) {
    'use strict';

    // 40 ADET PRO ŞABLON TANIMI
    const PRO_JSON_TEMPLATES = [
        // ========================================================================
        // 📺 16:9 FORMAT (YOUTUBE / WEB / BANNER - 1920x1080) - 10 ŞABLON
        // ========================================================================
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
        },

        // ========================================================================
        // 🖼️ 1:1 FORMAT (INSTAGRAM POST / KARE - 1080x1080) - 10 ŞABLON
        // ========================================================================
        {
            id: 'pj_1x1_gold_feed',
            name: 'Gold Feed Kare',
            format: '1:1',
            w: 1080, h: 1080,
            category: 'konut',
            badge: '👑 PRO POST',
            previewBg: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
            elements: [
                {
                    id: 'el_gold_frame', field: 'badge',
                    style: 'position:absolute; top:25px; left:25px; right:25px; bottom:25px; border:2px solid rgba(234,179,8,0.5); pointer-events:none; z-index:15;',
                    html: ''
                },
                {
                    id: 'el_sq_badge', field: 'badge',
                    style: 'position:absolute; top:45px; left:45px; background:linear-gradient(135deg,#ca8a04,#eab308); color:#000; padding:10px 22px; border-radius:6px; font-size:18px; font-weight:900; z-index:20;',
                    html: 'SATILIK DAİRE'
                },
                {
                    id: 'el_sq_loc', field: 'location',
                    style: 'position:absolute; top:45px; right:45px; background:rgba(0,0,0,0.8); color:#facc15; padding:8px 18px; border-radius:6px; font-size:16px; font-weight:700; z-index:20;',
                    html: '<i class="fas fa-map-marker-alt"></i> ÇANKAYA / ANKARA'
                },
                {
                    id: 'el_sq_price', field: 'price',
                    style: 'position:absolute; bottom:120px; left:45px; background:rgba(0,0,0,0.9); border-left:4px solid #eab308; color:#fff; padding:12px 24px; font-size:36px; font-weight:900; z-index:20;',
                    html: '5.400.000 ₺'
                },
                {
                    id: 'el_sq_bar', field: 'features',
                    style: 'position:absolute; bottom:45px; left:45px; right:45px; background:rgba(0,0,0,0.88); padding:14px 20px; border-radius:8px; display:flex; justify-content:space-around; color:#fff; font-size:18px; font-weight:700; z-index:20;',
                    html: `
                        <div><i class="fas fa-bed" style="color:#eab308;"></i> <span data-field="rooms">3+1</span></div>
                        <div><i class="fas fa-chart-area" style="color:#eab308;"></i> <span data-field="size">135 m²</span></div>
                        <div><i class="fas fa-layer-group" style="color:#eab308;"></i> <span data-field="floor">3. Kat</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_1x1_glass_bottom',
            name: 'Buzlu Cam Kare',
            format: '1:1',
            w: 1080, h: 1080,
            category: 'konut',
            badge: '✨ GLASS POST',
            previewBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            elements: [
                {
                    id: 'el_top_badge', field: 'badge',
                    style: 'position:absolute; top:40px; left:40px; background:#6366f1; color:#fff; padding:10px 22px; border-radius:20px; font-size:18px; font-weight:800; z-index:20;',
                    html: 'FIRSAT PORTFÖY'
                },
                {
                    id: 'el_glass_panel', field: 'features',
                    style: 'position:absolute; bottom:40px; left:40px; right:40px; background:rgba(15,23,42,0.85); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.15); border-radius:18px; padding:24px; z-index:20;',
                    html: `
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                            <div style="font-size:22px; font-weight:800; color:#fff;" data-field="location">Antalya / Lara</div>
                            <div style="font-size:32px; font-weight:900; color:#38bdf8;" data-field="price">7.250.000 ₺</div>
                        </div>
                        <div style="display:flex; justify-content:space-between; background:rgba(255,255,255,0.05); padding:10px 16px; border-radius:10px; color:#cbd5e1; font-size:16px; font-weight:600;">
                            <span><strong style="color:#fff;" data-field="rooms">2+1</strong> Daire</span>
                            <span>•</span>
                            <span><strong style="color:#fff;" data-field="size">105 m²</strong> Net</span>
                            <span>•</span>
                            <span><strong style="color:#fff;" data-field="heating">Kombili</strong></span>
                        </div>
                    `
                }
            ]
        },
        {
            id: 'pj_1x1_arsa_kare',
            name: 'Arsa Köşe Rozetli',
            format: '1:1',
            w: 1080, h: 1080,
            category: 'arsa',
            badge: '🌱 ARSA KARE',
            previewBg: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
            elements: [
                {
                    id: 'el_land_tag', field: 'badge',
                    style: 'position:absolute; top:40px; left:40px; background:#059669; color:#fff; padding:10px 22px; border-radius:10px; font-size:18px; font-weight:800; z-index:20;',
                    html: '🌱 SATILIK ARSA'
                },
                {
                    id: 'el_ada_parsel', field: 'land',
                    style: 'position:absolute; top:40px; right:40px; background:rgba(0,0,0,0.85); border:1px solid #10b981; color:#fff; padding:10px 20px; border-radius:10px; font-size:16px; font-weight:700; z-index:20;',
                    html: 'ADA: 215 / PARSEL: 8'
                },
                {
                    id: 'el_land_price', field: 'price',
                    style: 'position:absolute; bottom:110px; left:40px; background:#10b981; color:#000; padding:12px 26px; border-radius:10px; font-size:34px; font-weight:900; z-index:20;',
                    html: '2.850.000 ₺'
                },
                {
                    id: 'el_land_spec', field: 'features',
                    style: 'position:absolute; bottom:40px; left:40px; right:40px; background:rgba(0,0,0,0.9); padding:14px 20px; border-radius:10px; display:flex; justify-content:space-between; color:#fff; font-size:17px; font-weight:700; z-index:20;',
                    html: `
                        <div><i class="fas fa-ruler-combined" style="color:#34d399;"></i> <span data-field="size">750 m²</span></div>
                        <div><i class="fas fa-home" style="color:#34d399;"></i> %40 İmarlı</div>
                        <div><i class="fas fa-map-marker-alt" style="color:#f43f5e;"></i> <span data-field="location">Sakarya / Sapanca</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_1x1_koyu_neon_kare',
            name: 'Koyu Tema Neon',
            format: '1:1',
            w: 1080, h: 1080,
            category: 'konut',
            badge: '⚡ NEON KARE',
            previewBg: 'linear-gradient(135deg, #09090b 0%, #1c1917 100%)',
            elements: [
                {
                    id: 'el_neon_b', field: 'badge',
                    style: 'position:absolute; top:40px; left:40px; background:#f97316; color:#fff; padding:10px 22px; border-radius:8px; font-size:18px; font-weight:900; box-shadow:0 0 20px rgba(249,115,22,0.4); z-index:20;',
                    html: 'LÜKS DAİRE'
                },
                {
                    id: 'el_neon_p', field: 'price',
                    style: 'position:absolute; top:40px; right:40px; color:#f97316; font-size:38px; font-weight:900; text-shadow:0 0 25px rgba(249,115,22,0.6); z-index:20;',
                    html: '8.750.000 ₺'
                },
                {
                    id: 'el_neon_bottom', field: 'features',
                    style: 'position:absolute; bottom:40px; left:40px; right:40px; background:#18181b; border:1px solid #27272a; padding:16px 20px; border-radius:12px; display:flex; justify-content:space-around; color:#fff; font-size:18px; font-weight:700; z-index:20;',
                    html: `
                        <div><i class="fas fa-door-open" style="color:#f97316;"></i> <span data-field="rooms">3+1</span></div>
                        <div><i class="fas fa-vector-square" style="color:#f97316;"></i> <span data-field="size">165 m²</span></div>
                        <div><i class="fas fa-map-pin" style="color:#f97316;"></i> <span data-field="location">Bursa / Nilüfer</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_1x1_dergi_stili',
            name: 'Dergi Kapağı Stili',
            format: '1:1',
            w: 1080, h: 1080,
            category: 'villa',
            badge: '📰 EDİTORYAL',
            previewBg: 'linear-gradient(135deg, #27272a 0%, #09090b 100%)',
            elements: [
                {
                    id: 'el_mag_title', field: 'badge',
                    style: 'position:absolute; top:40px; left:40px; right:40px; text-align:center; font-family:"Playfair Display", serif; font-size:36px; font-weight:900; color:#fff; letter-spacing:4px; text-transform:uppercase; z-index:20; border-bottom:1px solid rgba(255,255,255,0.3); padding-bottom:10px;',
                    html: 'EXECUTIVE LIVING'
                },
                {
                    id: 'el_mag_price', field: 'price',
                    style: 'position:absolute; bottom:100px; left:40px; font-size:42px; font-weight:900; color:#fff; text-shadow:0 5px 15px rgba(0,0,0,0.8); z-index:20;',
                    html: '28.000.000 ₺'
                },
                {
                    id: 'el_mag_loc', field: 'location',
                    style: 'position:absolute; bottom:50px; left:40px; font-size:20px; font-weight:600; color:#e4e4e7; z-index:20;',
                    html: 'İstanbul / Sarıyer / Tarabya'
                }
            ]
        },
        {
            id: 'pj_1x1_dortlu_hap',
            name: '4\'lü Kompakt Özellik',
            format: '1:1',
            w: 1080, h: 1080,
            category: 'konut',
            badge: '💊 HAP KARTLAR',
            previewBg: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            elements: [
                {
                    id: 'el_pill_badge', field: 'badge',
                    style: 'position:absolute; top:40px; left:40px; background:#4f46e5; color:#fff; padding:10px 22px; border-radius:20px; font-size:18px; font-weight:800; z-index:20;',
                    html: 'SATILIK DAİRE'
                },
                {
                    id: 'el_pill_price', field: 'price',
                    style: 'position:absolute; top:36px; right:40px; background:#10b981; color:#fff; padding:12px 24px; border-radius:12px; font-size:28px; font-weight:900; z-index:20;',
                    html: '4.750.000 ₺'
                },
                {
                    id: 'el_pills_container', field: 'features',
                    style: 'position:absolute; bottom:40px; left:40px; right:40px; display:grid; grid-template-columns:1fr 1fr; gap:12px; z-index:20;',
                    html: `
                        <div style="background:rgba(0,0,0,0.85); padding:12px; border-radius:10px; color:#fff; font-size:16px; font-weight:700; text-align:center;"><i class="fas fa-bed" style="color:#818cf8;"></i> <span data-field="rooms">3+1 Daire</span></div>
                        <div style="background:rgba(0,0,0,0.85); padding:12px; border-radius:10px; color:#fff; font-size:16px; font-weight:700; text-align:center;"><i class="fas fa-vector-square" style="color:#38bdf8;"></i> <span data-field="size">140 m²</span></div>
                        <div style="background:rgba(0,0,0,0.85); padding:12px; border-radius:10px; color:#fff; font-size:16px; font-weight:700; text-align:center;"><i class="fas fa-building" style="color:#34d399;"></i> <span data-field="floor">5. Kat</span></div>
                        <div style="background:rgba(0,0,0,0.85); padding:12px; border-radius:10px; color:#fff; font-size:16px; font-weight:700; text-align:center;"><i class="fas fa-map-marker-alt" style="color:#f43f5e;"></i> <span data-field="location">İzmir / Bornova</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_1x1_ofis_tanitim',
            name: 'Kurumsal Ofis Kare',
            format: '1:1',
            w: 1080, h: 1080,
            category: 'ticari',
            badge: '🏢 OFİS KARE',
            previewBg: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
            elements: [
                {
                    id: 'el_corp_b', field: 'badge',
                    style: 'position:absolute; top:40px; left:40px; background:#0d9488; color:#fff; padding:10px 24px; border-radius:8px; font-size:18px; font-weight:800; z-index:20;',
                    html: 'KİRALIK PLAZA KATI'
                },
                {
                    id: 'el_corp_p', field: 'price',
                    style: 'position:absolute; bottom:120px; left:40px; background:#134e4a; color:#5eead4; padding:12px 24px; border-radius:8px; font-size:34px; font-weight:900; z-index:20;',
                    html: '65.000 ₺ / Ay'
                },
                {
                    id: 'el_corp_f', field: 'features',
                    style: 'position:absolute; bottom:40px; left:40px; right:40px; background:rgba(0,0,0,0.88); padding:14px 20px; border-radius:8px; display:flex; justify-content:space-between; color:#fff; font-size:17px; font-weight:700; z-index:20;',
                    html: `
                        <div><i class="fas fa-expand" style="color:#5eead4;"></i> <span data-field="size">280 m²</span></div>
                        <div><i class="fas fa-parking" style="color:#5eead4;"></i> 4 Araç Otopark</div>
                        <div><i class="fas fa-map-pin" style="color:#5eead4;"></i> <span data-field="location">Levent / İstanbul</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_1x1_minimal_beyaz',
            name: 'Açık Tema Ferah',
            format: '1:1',
            w: 1080, h: 1080,
            category: 'konut',
            badge: '🤍 AÇIK TEMA',
            previewBg: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
            elements: [
                {
                    id: 'el_light_b', field: 'badge',
                    style: 'position:absolute; top:40px; left:40px; background:#fff; color:#0f172a; padding:10px 22px; border-radius:30px; font-size:18px; font-weight:800; box-shadow:0 5px 15px rgba(0,0,0,0.15); z-index:20;',
                    html: 'SATILIK DAİRE'
                },
                {
                    id: 'el_light_p', field: 'price',
                    style: 'position:absolute; bottom:110px; left:40px; background:#fff; color:#0f172a; padding:12px 24px; border-radius:12px; font-size:36px; font-weight:900; box-shadow:0 8px 20px rgba(0,0,0,0.2); z-index:20;',
                    html: '6.200.000 ₺'
                },
                {
                    id: 'el_light_f', field: 'features',
                    style: 'position:absolute; bottom:40px; left:40px; right:40px; background:#fff; padding:14px 20px; border-radius:12px; display:flex; justify-content:space-around; color:#334155; font-size:18px; font-weight:800; box-shadow:0 8px 20px rgba(0,0,0,0.2); z-index:20;',
                    html: `
                        <div><span data-field="rooms">3+1</span></div>
                        <div>•</div>
                        <div><span data-field="size">150 m²</span></div>
                        <div>•</div>
                        <div><span data-field="location">Ankara / Ümitköy</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_1x1_kelepir_firsat',
            name: 'Kelepir Fırsat İlanı',
            format: '1:1',
            w: 1080, h: 1080,
            category: 'konut',
            badge: '🏷️ İNDİRİM',
            previewBg: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
            elements: [
                {
                    id: 'el_disc_b', field: 'badge',
                    style: 'position:absolute; top:40px; left:40px; background:#dc2626; color:#fff; padding:10px 24px; border-radius:8px; font-size:20px; font-weight:900; z-index:20;',
                    html: '🏷️ FİYATI DÜŞTÜ!'
                },
                {
                    id: 'el_disc_p', field: 'price',
                    style: 'position:absolute; bottom:120px; left:40px; background:#b91c1c; color:#fff; padding:14px 28px; border-radius:12px; font-size:40px; font-weight:900; z-index:20;',
                    html: '3.450.000 ₺'
                },
                {
                    id: 'el_disc_f', field: 'features',
                    style: 'position:absolute; bottom:40px; left:40px; right:40px; background:rgba(0,0,0,0.9); padding:14px 20px; border-radius:10px; display:flex; justify-content:space-between; color:#fff; font-size:18px; font-weight:700; z-index:20;',
                    html: `
                        <div><i class="fas fa-home" style="color:#ef4444;"></i> <span data-field="rooms">2+1</span></div>
                        <div><i class="fas fa-chart-area" style="color:#ef4444;"></i> <span data-field="size">95 m²</span></div>
                        <div><i class="fas fa-map-marker-alt" style="color:#ef4444;"></i> <span data-field="location">Eskişehir / Tepebaşı</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_1x1_panoramic_kare',
            name: 'Kare Çerçeveli Elegance',
            format: '1:1',
            w: 1080, h: 1080,
            category: 'villa',
            badge: '💎 ELEGANCE',
            previewBg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            elements: [
                {
                    id: 'el_eleg_b', field: 'badge',
                    style: 'position:absolute; top:40px; left:40px; background:#4338ca; color:#fff; padding:10px 24px; border-radius:20px; font-size:18px; font-weight:800; z-index:20;',
                    html: 'MÜSTAKİL HAVUZLU VİLLA'
                },
                {
                    id: 'el_eleg_p', field: 'price',
                    style: 'position:absolute; bottom:120px; right:40px; background:#4f46e5; color:#fff; padding:12px 28px; border-radius:12px; font-size:36px; font-weight:900; z-index:20;',
                    html: '19.500.000 ₺'
                },
                {
                    id: 'el_eleg_f', field: 'features',
                    style: 'position:absolute; bottom:40px; left:40px; right:40px; background:rgba(15,23,42,0.92); padding:16px 24px; border-radius:12px; display:flex; justify-content:space-between; color:#fff; font-size:18px; font-weight:700; z-index:20;',
                    html: `
                        <div><i class="fas fa-bed" style="color:#818cf8;"></i> <span data-field="rooms">5+1</span></div>
                        <div><i class="fas fa-vector-square" style="color:#818cf8;"></i> <span data-field="size">380 m²</span></div>
                        <div><i class="fas fa-map-pin" style="color:#818cf8;"></i> <span data-field="location">Muğla / Fethiye</span></div>
                    `
                }
            ]
        },

        // ========================================================================
        // 📱 4:5 FORMAT (INSTAGRAM PORTRAIT / PORTRE AKIŞ - 1080x1350) - 10 ŞABLON
        // ========================================================================
        {
            id: 'pj_4x5_instagram_klasik',
            name: 'Instagram Portre Klasik',
            format: '4:5',
            w: 1080, h: 1350,
            category: 'konut',
            badge: '📱 TOP FEED',
            previewBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            elements: [
                {
                    id: 'el_p45_badge', field: 'badge',
                    style: 'position:absolute; top:50px; left:50px; background:#3b82f6; color:#fff; padding:12px 26px; border-radius:30px; font-size:20px; font-weight:800; z-index:20;',
                    html: 'SATILIK DAİRE'
                },
                {
                    id: 'el_p45_loc', field: 'location',
                    style: 'position:absolute; top:50px; right:50px; background:rgba(0,0,0,0.8); color:#38bdf8; padding:10px 20px; border-radius:30px; font-size:18px; font-weight:700; z-index:20;',
                    html: '<i class="fas fa-map-marker-alt"></i> İSTANBUL / ŞİŞLİ'
                },
                {
                    id: 'el_p45_card', field: 'features',
                    style: 'position:absolute; bottom:50px; left:50px; right:50px; background:rgba(15,23,42,0.92); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.15); border-radius:20px; padding:28px; z-index:20;',
                    html: `
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                            <div style="font-size:16px; color:#94a3b8; font-weight:600;">PEŞİN FİYAT</div>
                            <div style="font-size:38px; font-weight:900; color:#38bdf8;" data-field="price">7.800.000 ₺</div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                            <div style="background:rgba(255,255,255,0.06); padding:12px; border-radius:10px; text-align:center; color:#fff; font-size:18px; font-weight:700;"><i class="fas fa-bed" style="color:#818cf8; display:block; margin-bottom:4px;"></i> <span data-field="rooms">3+1</span></div>
                            <div style="background:rgba(255,255,255,0.06); padding:12px; border-radius:10px; text-align:center; color:#fff; font-size:18px; font-weight:700;"><i class="fas fa-ruler" style="color:#38bdf8; display:block; margin-bottom:4px;"></i> <span data-field="size">145 m²</span></div>
                            <div style="background:rgba(255,255,255,0.06); padding:12px; border-radius:10px; text-align:center; color:#fff; font-size:18px; font-weight:700;"><i class="fas fa-building" style="color:#34d399; display:block; margin-bottom:4px;"></i> <span data-field="floor">6. Kat</span></div>
                        </div>
                    `
                }
            ]
        },
        {
            id: 'pj_4x5_gold_vip_portre',
            name: 'Gold VIP Portre',
            format: '4:5',
            w: 1080, h: 1350,
            category: 'villa',
            badge: '⚜️ GOLD PORTRE',
            previewBg: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
            elements: [
                {
                    id: 'el_p45_g_frame', field: 'badge',
                    style: 'position:absolute; top:30px; left:30px; right:30px; bottom:30px; border:2px solid rgba(234,179,8,0.4); pointer-events:none; z-index:15;',
                    html: ''
                },
                {
                    id: 'el_p45_g_badge', field: 'badge',
                    style: 'position:absolute; top:55px; left:55px; background:linear-gradient(135deg,#ca8a04,#eab308); color:#000; padding:12px 28px; border-radius:8px; font-size:20px; font-weight:900; z-index:20;',
                    html: 'ÖZEL VİLLA PORTFÖYÜ'
                },
                {
                    id: 'el_p45_g_price', field: 'price',
                    style: 'position:absolute; bottom:140px; left:55px; background:rgba(0,0,0,0.9); border-left:5px solid #eab308; color:#facc15; padding:14px 28px; font-size:40px; font-weight:900; z-index:20;',
                    html: '24.500.000 ₺'
                },
                {
                    id: 'el_p45_g_bar', field: 'features',
                    style: 'position:absolute; bottom:55px; left:55px; right:55px; background:rgba(0,0,0,0.9); padding:16px 24px; border-radius:10px; display:flex; justify-content:space-around; color:#fff; font-size:18px; font-weight:700; z-index:20;',
                    html: `
                        <div><span style="color:#eab308;">ODA:</span> <span data-field="rooms">5+2</span></div>
                        <div><span style="color:#eab308;">M²:</span> <span data-field="size">450 m²</span></div>
                        <div><span style="color:#eab308;">LOKASYON:</span> <span data-field="location">Urla / İzmir</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_4x5_arsa_portre',
            name: 'Arsa & Tarla Detay',
            format: '4:5',
            w: 1080, h: 1350,
            category: 'arsa',
            badge: '🌱 ARSA PORTRE',
            previewBg: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)',
            elements: [
                {
                    id: 'el_p45_a_b', field: 'badge',
                    style: 'position:absolute; top:50px; left:50px; background:#059669; color:#fff; padding:12px 26px; border-radius:12px; font-size:20px; font-weight:800; z-index:20;',
                    html: 'YATIRIMLIK ARSA'
                },
                {
                    id: 'el_p45_a_ap', field: 'land',
                    style: 'position:absolute; top:50px; right:50px; background:rgba(0,0,0,0.85); border:1px solid #10b981; color:#34d399; padding:10px 22px; border-radius:12px; font-size:18px; font-weight:700; z-index:20;',
                    html: 'ADA: 312 / PARSEL: 14'
                },
                {
                    id: 'el_p45_a_card', field: 'features',
                    style: 'position:absolute; bottom:50px; left:50px; right:50px; background:rgba(2,44,34,0.92); border:1px solid rgba(16,185,129,0.3); border-radius:18px; padding:24px; z-index:20;',
                    html: `
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                            <div style="font-size:20px; color:#fff; font-weight:800;" data-field="location">Bolu / Abant Yolu</div>
                            <div style="font-size:36px; font-weight:900; color:#34d399;" data-field="price">3.250.000 ₺</div>
                        </div>
                        <div style="display:flex; justify-content:space-between; background:rgba(0,0,0,0.3); padding:10px 16px; border-radius:10px; color:#cbd5e1; font-size:16px; font-weight:600;">
                            <span><i class="fas fa-chart-area" style="color:#34d399;"></i> <strong style="color:#fff;" data-field="size">1.200 m²</strong></span>
                            <span><i class="fas fa-file-signature" style="color:#34d399;"></i> Müstakil Parsel</span>
                            <span><i class="fas fa-road" style="color:#34d399;"></i> Asfalt Cepheli</span>
                        </div>
                    `
                }
            ]
        },
        {
            id: 'pj_4x5_residence_vertical',
            name: 'Dikey Rezidans Portre',
            format: '4:5',
            w: 1080, h: 1350,
            category: 'konut',
            badge: '🏙️ DİKEY REZİDANS',
            previewBg: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            elements: [
                {
                    id: 'el_p45_r_b', field: 'badge',
                    style: 'position:absolute; top:50px; left:50px; background:#6366f1; color:#fff; padding:10px 24px; border-radius:20px; font-size:18px; font-weight:800; z-index:20;',
                    html: 'REZİDANS DAİRE'
                },
                {
                    id: 'el_p45_r_p', field: 'price',
                    style: 'position:absolute; top:46px; right:50px; background:#0ea5e9; color:#fff; padding:10px 24px; border-radius:12px; font-size:26px; font-weight:900; z-index:20;',
                    html: '9.200.000 ₺'
                },
                {
                    id: 'el_p45_r_panel', field: 'features',
                    style: 'position:absolute; bottom:50px; left:50px; right:50px; background:rgba(15,23,42,0.9); backdrop-filter:blur(16px); padding:24px; border-radius:18px; border:1px solid rgba(255,255,255,0.12); z-index:20;',
                    html: `
                        <div style="font-size:22px; font-weight:800; color:#fff; margin-bottom:14px;" data-field="location">İstanbul / Kartal Sahil</div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; color:#cbd5e1; font-size:16px;">
                            <div style="background:rgba(255,255,255,0.05); padding:10px 14px; border-radius:8px;">Oda: <strong style="color:#fff;" data-field="rooms">2+1</strong></div>
                            <div style="background:rgba(255,255,255,0.05); padding:10px 14px; border-radius:8px;">Alan: <strong style="color:#fff;" data-field="size">110 m²</strong></div>
                            <div style="background:rgba(255,255,255,0.05); padding:10px 14px; border-radius:8px;">Kat: <strong style="color:#fff;" data-field="floor">14. Kat</strong></div>
                            <div style="background:rgba(255,255,255,0.05); padding:10px 14px; border-radius:8px;">Manzara: <strong style="color:#fff;">Adalar</strong></div>
                        </div>
                    `
                }
            ]
        },
        {
            id: 'pj_4x5_ticari_plaza',
            name: 'Ticari & Plaza Portre',
            format: '4:5',
            w: 1080, h: 1350,
            category: 'ticari',
            badge: '🏬 TİCARİ PLAZA',
            previewBg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            elements: [
                {
                    id: 'el_p45_t_b', field: 'badge',
                    style: 'position:absolute; top:50px; left:50px; background:#0284c7; color:#fff; padding:12px 26px; border-radius:8px; font-size:20px; font-weight:800; z-index:20;',
                    html: 'SATILIK TİCARİ MÜLK'
                },
                {
                    id: 'el_p45_t_p', field: 'price',
                    style: 'position:absolute; bottom:130px; left:50px; background:#0369a1; color:#fff; padding:14px 28px; border-radius:10px; font-size:38px; font-weight:900; z-index:20;',
                    html: '18.500.000 ₺'
                },
                {
                    id: 'el_p45_t_f', field: 'features',
                    style: 'position:absolute; bottom:50px; left:50px; right:50px; background:rgba(0,0,0,0.9); padding:16px 22px; border-radius:10px; display:flex; justify-content:space-between; color:#fff; font-size:18px; font-weight:700; z-index:20;',
                    html: `
                        <div><i class="fas fa-store" style="color:#38bdf8;"></i> <span data-field="size">350 m² Dükkan</span></div>
                        <div><i class="fas fa-coins" style="color:#fbbf24;"></i> Kurumsal Kiracılı</div>
                        <div><span data-field="location">Bursa / Osmangazi</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_4x5_uc_kolon_modern',
            name: '3\'lü İkonik Kolon',
            format: '4:5',
            w: 1080, h: 1350,
            category: 'konut',
            badge: '✨ 3 KOLON',
            previewBg: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
            elements: [
                {
                    id: 'el_p45_3k_b', field: 'badge',
                    style: 'position:absolute; top:50px; left:50px; background:#4f46e5; color:#fff; padding:10px 24px; border-radius:30px; font-size:18px; font-weight:800; z-index:20;',
                    html: 'LÜKS SİTE İÇİ'
                },
                {
                    id: 'el_p45_3k_p', field: 'price',
                    style: 'position:absolute; top:46px; right:50px; color:#818cf8; font-size:36px; font-weight:900; text-shadow:0 0 20px rgba(129,140,248,0.5); z-index:20;',
                    html: '6.450.000 ₺'
                },
                {
                    id: 'el_p45_3k_cols', field: 'features',
                    style: 'position:absolute; bottom:50px; left:50px; right:50px; display:flex; gap:12px; z-index:20;',
                    html: `
                        <div style="flex:1; background:rgba(15,23,42,0.9); padding:16px; border-radius:12px; text-align:center; color:#fff;"><i class="fas fa-bed" style="color:#818cf8; font-size:22px; margin-bottom:6px; display:block;"></i><span style="font-size:18px; font-weight:800;" data-field="rooms">3+1</span></div>
                        <div style="flex:1; background:rgba(15,23,42,0.9); padding:16px; border-radius:12px; text-align:center; color:#fff;"><i class="fas fa-ruler-combined" style="color:#38bdf8; font-size:22px; margin-bottom:6px; display:block;"></i><span style="font-size:18px; font-weight:800;" data-field="size">155 m²</span></div>
                        <div style="flex:1; background:rgba(15,23,42,0.9); padding:16px; border-radius:12px; text-align:center; color:#fff;"><i class="fas fa-map-marker-alt" style="color:#f43f5e; font-size:22px; margin-bottom:6px; display:block;"></i><span style="font-size:16px; font-weight:800;" data-field="location">Antalya</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_4x5_cyber_portre',
            name: 'Cyber Glow Portre',
            format: '4:5',
            w: 1080, h: 1350,
            category: 'konut',
            badge: '⚡ CYBER 4:5',
            previewBg: 'linear-gradient(135deg, #18032b 0%, #030014 100%)',
            elements: [
                {
                    id: 'el_p45_cb_b', field: 'badge',
                    style: 'position:absolute; top:50px; left:50px; background:rgba(236,72,153,0.2); border:2px solid #ec4899; color:#f472b6; padding:10px 24px; border-radius:30px; font-size:18px; font-weight:900; text-shadow:0 0 10px #ec4899; z-index:20;',
                    html: '⚡ ÖZEL PORTFÖY'
                },
                {
                    id: 'el_p45_cb_p', field: 'price',
                    style: 'position:absolute; bottom:130px; left:50px; color:#38bdf8; font-size:42px; font-weight:900; text-shadow:0 0 20px #0ea5e9; z-index:20;',
                    html: '11.800.000 ₺'
                },
                {
                    id: 'el_p45_cb_f', field: 'features',
                    style: 'position:absolute; bottom:50px; left:50px; right:50px; background:rgba(0,0,0,0.85); border:1px solid rgba(236,72,153,0.3); padding:16px 20px; border-radius:12px; display:flex; justify-content:space-around; color:#fff; font-size:18px; font-weight:700; z-index:20;',
                    html: `
                        <div><span data-field="rooms">4+1 Dubleks</span></div>
                        <div>•</div>
                        <div><span data-field="size">210 m²</span></div>
                        <div>•</div>
                        <div><span data-field="location">İzmir / Çeşme</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_4x5_doga_villa',
            name: 'Doğa & Bahçeli Villa',
            format: '4:5',
            w: 1080, h: 1350,
            category: 'villa',
            badge: '🌲 DOĞA VİLLA',
            previewBg: 'linear-gradient(135deg, #14532d 0%, #052e16 100%)',
            elements: [
                {
                    id: 'el_p45_dv_b', field: 'badge',
                    style: 'position:absolute; top:50px; left:50px; background:#16a34a; color:#fff; padding:10px 24px; border-radius:30px; font-size:18px; font-weight:800; z-index:20;',
                    html: '🌲 MÜSTAKİL BAHÇELİ VİLLA'
                },
                {
                    id: 'el_p45_dv_p', field: 'price',
                    style: 'position:absolute; bottom:130px; left:50px; background:#15803d; color:#fff; padding:12px 28px; border-radius:10px; font-size:38px; font-weight:900; z-index:20;',
                    html: '17.400.000 ₺'
                },
                {
                    id: 'el_p45_dv_f', field: 'features',
                    style: 'position:absolute; bottom:50px; left:50px; right:50px; background:rgba(0,0,0,0.88); padding:16px 20px; border-radius:10px; display:flex; justify-content:space-around; color:#fff; font-size:18px; font-weight:700; z-index:20;',
                    html: `
                        <div><i class="fas fa-tree" style="color:#4ade80;"></i> <span data-field="land">850 m² Bahçe</span></div>
                        <div><i class="fas fa-home" style="color:#4ade80;"></i> <span data-field="rooms">5+1</span></div>
                        <div><i class="fas fa-map-pin" style="color:#4ade80;"></i> <span data-field="location">Sapanca</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_4x5_acik_modern',
            name: 'Açık Tema Portre',
            format: '4:5',
            w: 1080, h: 1350,
            category: 'konut',
            badge: '🤍 AÇIK PORTRE',
            previewBg: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            elements: [
                {
                    id: 'el_p45_wh_b', field: 'badge',
                    style: 'position:absolute; top:50px; left:50px; background:#fff; color:#0f172a; padding:10px 24px; border-radius:30px; font-size:18px; font-weight:800; box-shadow:0 4px 15px rgba(0,0,0,0.15); z-index:20;',
                    html: 'SATILIK DAİRE'
                },
                {
                    id: 'el_p45_wh_p', field: 'price',
                    style: 'position:absolute; bottom:130px; left:50px; background:#fff; color:#0f172a; padding:12px 28px; border-radius:12px; font-size:38px; font-weight:900; box-shadow:0 6px 20px rgba(0,0,0,0.2); z-index:20;',
                    html: '5.900.000 ₺'
                },
                {
                    id: 'el_p45_wh_f', field: 'features',
                    style: 'position:absolute; bottom:50px; left:50px; right:50px; background:#fff; padding:16px 20px; border-radius:12px; display:flex; justify-content:space-around; color:#334155; font-size:18px; font-weight:800; box-shadow:0 6px 20px rgba(0,0,0,0.2); z-index:20;',
                    html: `
                        <div><span data-field="rooms">3+1</span></div>
                        <div>•</div>
                        <div><span data-field="size">138 m²</span></div>
                        <div>•</div>
                        <div><span data-field="location">Mersin / Mezitli</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_4x5_panoramik_deniz',
            name: 'Deniz Manzara Portre',
            format: '4:5',
            w: 1080, h: 1350,
            category: 'konut',
            badge: '🌊 DENİZ PORTRE',
            previewBg: 'linear-gradient(135deg, #0369a1 0%, #0c4a6e 100%)',
            elements: [
                {
                    id: 'el_p45_sea_b', field: 'badge',
                    style: 'position:absolute; top:50px; left:50px; background:#0284c7; color:#fff; padding:10px 24px; border-radius:20px; font-size:18px; font-weight:800; z-index:20;',
                    html: '🌊 FULL DENİZ MANZARALI'
                },
                {
                    id: 'el_p45_sea_p', field: 'price',
                    style: 'position:absolute; bottom:130px; left:50px; background:#0284c7; color:#fff; padding:12px 28px; border-radius:10px; font-size:38px; font-weight:900; z-index:20;',
                    html: '13.900.000 ₺'
                },
                {
                    id: 'el_p45_sea_f', field: 'features',
                    style: 'position:absolute; bottom:50px; left:50px; right:50px; background:rgba(0,0,0,0.85); padding:16px 22px; border-radius:10px; display:flex; justify-content:space-between; color:#fff; font-size:18px; font-weight:700; z-index:20;',
                    html: `
                        <div><i class="fas fa-home" style="color:#38bdf8;"></i> <span data-field="rooms">3+1</span></div>
                        <div><i class="fas fa-ruler" style="color:#38bdf8;"></i> <span data-field="size">170 m²</span></div>
                        <div><i class="fas fa-map-marker-alt" style="color:#f43f5e;"></i> <span data-field="location">Trabzon / Yalıncak</span></div>
                    `
                }
            ]
        },

        // ========================================================================
        // 🎬 9:16 FORMAT (STORY / REELS / TIKTOK - 1080x1920) - 10 ŞABLON
        // ========================================================================
        {
            id: 'pj_9x16_story_vip_villa',
            name: 'Story VIP Lüks Villa',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'villa',
            badge: '🎬 STORY VILLA',
            previewBg: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            elements: [
                {
                    id: 'el_s_top_bar', field: 'badge',
                    style: 'position:absolute; top:70px; left:50px; right:50px; display:flex; justify-content:space-between; align-items:center; z-index:20;',
                    html: `
                        <div style="background:#6366f1; color:#fff; padding:12px 28px; border-radius:30px; font-size:22px; font-weight:800;" data-field="badge">LÜKS VİLLA</div>
                        <div style="background:rgba(0,0,0,0.8); color:#38bdf8; padding:10px 22px; border-radius:30px; font-size:20px; font-weight:700;" data-field="location"><i class="fas fa-map-marker-alt"></i> Bodrum</div>
                    `
                },
                {
                    id: 'el_s_price', field: 'price',
                    style: 'position:absolute; bottom:220px; left:50px; right:50px; background:linear-gradient(135deg,#d97706,#f59e0b); color:#fff; padding:20px; border-radius:18px; text-align:center; font-size:46px; font-weight:900; box-shadow:0 15px 35px rgba(217,119,6,0.5); z-index:20;',
                    html: '38.500.000 ₺'
                },
                {
                    id: 'el_s_details', field: 'features',
                    style: 'position:absolute; bottom:90px; left:50px; right:50px; background:rgba(15,23,42,0.92); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.15); border-radius:18px; padding:22px; display:flex; justify-content:space-around; color:#fff; font-size:20px; font-weight:700; z-index:20;',
                    html: `
                        <div><i class="fas fa-bed" style="color:#818cf8;"></i> <span data-field="rooms">6+2</span></div>
                        <div><i class="fas fa-vector-square" style="color:#38bdf8;"></i> <span data-field="size">520 m²</span></div>
                        <div><i class="fas fa-swimming-pool" style="color:#34d399;"></i> Özel Havuz</div>
                    `
                }
            ]
        },
        {
            id: 'pj_9x16_reels_cover',
            name: 'Reels Emlak Kapağı',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'konut',
            badge: '🎥 REELS COVER',
            previewBg: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
            elements: [
                {
                    id: 'el_reels_b', field: 'badge',
                    style: 'position:absolute; top:80px; left:50px; background:#dc2626; color:#fff; padding:12px 28px; border-radius:8px; font-size:22px; font-weight:900; z-index:20;',
                    html: '🔥 YENİ İLAN'
                },
                {
                    id: 'el_reels_card', field: 'features',
                    style: 'position:absolute; bottom:90px; left:50px; right:50px; background:rgba(24,24,27,0.92); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.15); border-radius:24px; padding:32px; z-index:20;',
                    html: `
                        <div style="font-size:24px; font-weight:800; color:#fff; margin-bottom:8px;" data-field="location">İstanbul / Kadıköy</div>
                        <div style="font-size:46px; font-weight:900; color:#38bdf8; margin-bottom:18px;" data-field="price">6.900.000 ₺</div>
                        <div style="display:flex; justify-content:space-between; background:rgba(255,255,255,0.06); padding:14px 20px; border-radius:12px; color:#fff; font-size:20px; font-weight:700;">
                            <span><strong data-field="rooms">3+1</strong></span>
                            <span>•</span>
                            <span><strong data-field="size">140 m²</strong></span>
                            <span>•</span>
                            <span><strong data-field="floor">4. Kat</strong></span>
                        </div>
                    `
                }
            ]
        },
        {
            id: 'pj_9x16_story_arsa',
            name: 'Arsa Yatırım Hikayesi',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'arsa',
            badge: '🌱 ARSA STORY',
            previewBg: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)',
            elements: [
                {
                    id: 'el_s_arsa_b', field: 'badge',
                    style: 'position:absolute; top:80px; left:50px; background:#059669; color:#fff; padding:12px 28px; border-radius:30px; font-size:22px; font-weight:800; z-index:20;',
                    html: '🌱 YATIRIMLIK ARSA'
                },
                {
                    id: 'el_s_arsa_ap', field: 'land',
                    style: 'position:absolute; top:80px; right:50px; background:rgba(0,0,0,0.85); border:1px solid #10b981; color:#34d399; padding:10px 22px; border-radius:30px; font-size:18px; font-weight:700; z-index:20;',
                    html: 'ADA: 108 / PARSEL: 5'
                },
                {
                    id: 'el_s_arsa_card', field: 'features',
                    style: 'position:absolute; bottom:90px; left:50px; right:50px; background:rgba(2,44,34,0.94); border:1px solid rgba(16,185,129,0.4); border-radius:24px; padding:32px; z-index:20;',
                    html: `
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                            <div style="font-size:24px; font-weight:800; color:#fff;" data-field="location">Bursa / İznik</div>
                            <div style="font-size:42px; font-weight:900; color:#34d399;" data-field="price">2.450.000 ₺</div>
                        </div>
                        <div style="background:rgba(0,0,0,0.3); padding:14px 20px; border-radius:12px; display:flex; justify-content:space-between; color:#fff; font-size:18px; font-weight:700;">
                            <span><i class="fas fa-ruler-combined" style="color:#34d399;"></i> <strong data-field="size">920 m²</strong></span>
                            <span><i class="fas fa-file-contract" style="color:#34d399;"></i> Müstakil Tapu</span>
                        </div>
                    `
                }
            ]
        },
        {
            id: 'pj_9x16_cyber_story',
            name: 'Cyber Neon Story',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'konut',
            badge: '⚡ CYBER STORY',
            previewBg: 'linear-gradient(135deg, #18032b 0%, #030014 100%)',
            elements: [
                {
                    id: 'el_s_cy_b', field: 'badge',
                    style: 'position:absolute; top:80px; left:50px; background:rgba(236,72,153,0.25); border:2px solid #ec4899; color:#f472b6; padding:12px 28px; border-radius:30px; font-size:22px; font-weight:900; text-shadow:0 0 12px #ec4899; z-index:20;',
                    html: '⚡ KAÇIRILMAYACAK FIRSAT'
                },
                {
                    id: 'el_s_cy_p', field: 'price',
                    style: 'position:absolute; bottom:200px; left:50px; right:50px; background:rgba(14,165,233,0.25); border:2px solid #0ea5e9; color:#38bdf8; padding:18px; border-radius:18px; text-align:center; font-size:48px; font-weight:900; text-shadow:0 0 20px #0ea5e9; z-index:20;',
                    html: '8.400.000 ₺'
                },
                {
                    id: 'el_s_cy_f', field: 'features',
                    style: 'position:absolute; bottom:90px; left:50px; right:50px; background:rgba(0,0,0,0.85); padding:18px 24px; border-radius:16px; display:flex; justify-content:space-around; color:#fff; font-size:20px; font-weight:700; z-index:20;',
                    html: `
                        <div><span data-field="rooms">3+1</span></div>
                        <div>•</div>
                        <div><span data-field="size">165 m²</span></div>
                        <div>•</div>
                        <div><span data-field="location">İzmir / Bornova</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_9x16_story_gold',
            name: 'Gold Prestij Story',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'villa',
            badge: '⚜️ GOLD STORY',
            previewBg: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
            elements: [
                {
                    id: 'el_s_g_frame', field: 'badge',
                    style: 'position:absolute; top:40px; left:40px; right:40px; bottom:40px; border:2px solid rgba(234,179,8,0.4); pointer-events:none; z-index:15;',
                    html: ''
                },
                {
                    id: 'el_s_g_b', field: 'badge',
                    style: 'position:absolute; top:75px; left:75px; background:linear-gradient(135deg,#ca8a04,#eab308); color:#000; padding:12px 28px; border-radius:8px; font-size:22px; font-weight:900; z-index:20;',
                    html: '⚜️ ÖZEL PORTFÖY'
                },
                {
                    id: 'el_s_g_p', field: 'price',
                    style: 'position:absolute; bottom:200px; left:75px; right:75px; background:rgba(0,0,0,0.92); border:2px solid #eab308; color:#facc15; padding:18px; border-radius:14px; text-align:center; font-size:44px; font-weight:900; z-index:20;',
                    html: '29.000.000 ₺'
                },
                {
                    id: 'el_s_g_f', field: 'features',
                    style: 'position:absolute; bottom:85px; left:75px; right:75px; background:rgba(0,0,0,0.9); padding:18px 24px; border-radius:12px; display:flex; justify-content:space-around; color:#fff; font-size:20px; font-weight:700; z-index:20;',
                    html: `
                        <div><span style="color:#eab308;">ODA:</span> <span data-field="rooms">6+2</span></div>
                        <div><span style="color:#eab308;">M²:</span> <span data-field="size">550 m²</span></div>
                        <div><span style="color:#eab308;">YER:</span> <span data-field="location">Çeşme</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_9x16_dikey_kartlar',
            name: '4\'lü Dikey Özellik Story',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'konut',
            badge: '📱 KARTLI STORY',
            previewBg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            elements: [
                {
                    id: 'el_s_dk_b', field: 'badge',
                    style: 'position:absolute; top:80px; left:50px; background:#4f46e5; color:#fff; padding:12px 28px; border-radius:30px; font-size:22px; font-weight:800; z-index:20;',
                    html: 'SATILIK DAİRE'
                },
                {
                    id: 'el_s_dk_p', field: 'price',
                    style: 'position:absolute; top:75px; right:50px; color:#38bdf8; font-size:42px; font-weight:900; z-index:20;',
                    html: '5.650.000 ₺'
                },
                {
                    id: 'el_s_dk_cards', field: 'features',
                    style: 'position:absolute; bottom:80px; left:50px; right:50px; display:flex; flex-direction:column; gap:12px; z-index:20;',
                    html: `
                        <div style="background:rgba(15,23,42,0.92); padding:16px 24px; border-radius:14px; display:flex; justify-content:space-between; color:#fff; font-size:20px; font-weight:700;">
                            <span><i class="fas fa-bed" style="color:#818cf8; margin-right:10px;"></i> Oda Sayısı</span>
                            <strong data-field="rooms">3+1</strong>
                        </div>
                        <div style="background:rgba(15,23,42,0.92); padding:16px 24px; border-radius:14px; display:flex; justify-content:space-between; color:#fff; font-size:20px; font-weight:700;">
                            <span><i class="fas fa-vector-square" style="color:#38bdf8; margin-right:10px;"></i> Brüt Alan</span>
                            <strong data-field="size">145 m²</strong>
                        </div>
                        <div style="background:rgba(15,23,42,0.92); padding:16px 24px; border-radius:14px; display:flex; justify-content:space-between; color:#fff; font-size:20px; font-weight:700;">
                            <span><i class="fas fa-building" style="color:#34d399; margin-right:10px;"></i> Kat Bilgisi</span>
                            <strong data-field="floor">3. Kat</strong>
                        </div>
                        <div style="background:rgba(15,23,42,0.92); padding:16px 24px; border-radius:14px; display:flex; justify-content:space-between; color:#fff; font-size:20px; font-weight:700;">
                            <span><i class="fas fa-map-marker-alt" style="color:#f43f5e; margin-right:10px;"></i> Konum</span>
                            <strong data-field="location">Ankara / Etimesgut</strong>
                        </div>
                    `
                }
            ]
        },
        {
            id: 'pj_9x16_fiyat_soku',
            name: 'Büyük Fiyat Vurgusu',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'konut',
            badge: '🏷️ FİYAT ŞOKU',
            previewBg: 'linear-gradient(135deg, #991b1b 0%, #450a0a 100%)',
            elements: [
                {
                    id: 'el_s_sh_b', field: 'badge',
                    style: 'position:absolute; top:80px; left:50px; background:#ef4444; color:#fff; padding:12px 28px; border-radius:8px; font-size:22px; font-weight:900; z-index:20;',
                    html: '🔥 ACİL SATILIK'
                },
                {
                    id: 'el_s_sh_p', field: 'price',
                    style: 'position:absolute; bottom:200px; left:50px; right:50px; background:#dc2626; color:#fff; padding:22px; border-radius:20px; text-align:center; font-size:52px; font-weight:900; box-shadow:0 15px 35px rgba(220,38,38,0.5); z-index:20;',
                    html: '3.850.000 ₺'
                },
                {
                    id: 'el_s_sh_f', field: 'features',
                    style: 'position:absolute; bottom:80px; left:50px; right:50px; background:rgba(0,0,0,0.9); padding:18px 24px; border-radius:14px; display:flex; justify-content:space-around; color:#fff; font-size:20px; font-weight:700; z-index:20;',
                    html: `
                        <div><strong data-field="rooms">2+1</strong></div>
                        <div>•</div>
                        <div><strong data-field="size">105 m²</strong></div>
                        <div>•</div>
                        <div><span data-field="location">Antalya / Kepez</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_9x16_ticari_story',
            name: 'Ticari & Dükkan Story',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'ticari',
            badge: '🏬 TİCARİ STORY',
            previewBg: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
            elements: [
                {
                    id: 'el_s_tc_b', field: 'badge',
                    style: 'position:absolute; top:80px; left:50px; background:#0d9488; color:#fff; padding:12px 28px; border-radius:8px; font-size:22px; font-weight:800; z-index:20;',
                    html: 'SATILIK DÜKKAN / MAĞAZA'
                },
                {
                    id: 'el_s_tc_p', field: 'price',
                    style: 'position:absolute; bottom:200px; left:50px; right:50px; background:#134e4a; color:#5eead4; padding:18px; border-radius:16px; text-align:center; font-size:46px; font-weight:900; z-index:20;',
                    html: '14.500.000 ₺'
                },
                {
                    id: 'el_s_tc_f', field: 'features',
                    style: 'position:absolute; bottom:80px; left:50px; right:50px; background:rgba(0,0,0,0.9); padding:18px 24px; border-radius:14px; display:flex; justify-content:space-around; color:#fff; font-size:20px; font-weight:700; z-index:20;',
                    html: `
                        <div><i class="fas fa-store" style="color:#5eead4;"></i> <span data-field="size">190 m²</span></div>
                        <div><i class="fas fa-coins" style="color:#fbbf24;"></i> Yüksek Getiri</div>
                        <div><span data-field="location">Bursa</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_9x16_doga_story',
            name: 'Doğa & Taş Ev Story',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'villa',
            badge: '🌲 DOĞA STORY',
            previewBg: 'linear-gradient(135deg, #14532d 0%, #052e16 100%)',
            elements: [
                {
                    id: 'el_s_dg_b', field: 'badge',
                    style: 'position:absolute; top:80px; left:50px; background:#16a34a; color:#fff; padding:12px 28px; border-radius:30px; font-size:22px; font-weight:800; z-index:20;',
                    html: '🌲 MÜSTAKİL TAŞ EV'
                },
                {
                    id: 'el_s_dg_p', field: 'price',
                    style: 'position:absolute; bottom:200px; left:50px; right:50px; background:#15803d; color:#fff; padding:18px; border-radius:16px; text-align:center; font-size:46px; font-weight:900; z-index:20;',
                    html: '15.200.000 ₺'
                },
                {
                    id: 'el_s_dg_f', field: 'features',
                    style: 'position:absolute; bottom:80px; left:50px; right:50px; background:rgba(0,0,0,0.88); padding:18px 24px; border-radius:14px; display:flex; justify-content:space-around; color:#fff; font-size:20px; font-weight:700; z-index:20;',
                    html: `
                        <div><i class="fas fa-tree" style="color:#4ade80;"></i> <span data-field="land">1.500 m² Bahçe</span></div>
                        <div><i class="fas fa-home" style="color:#4ade80;"></i> <span data-field="rooms">3+1</span></div>
                        <div><span data-field="location">Kazdağları</span></div>
                    `
                }
            ]
        },
        {
            id: 'pj_9x16_danisman_story',
            name: 'Kurumsal Danışman Story',
            format: '9:16',
            w: 1080, h: 1920,
            category: 'konut',
            badge: '👔 DANIŞMAN',
            previewBg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            elements: [
                {
                    id: 'el_s_dn_b', field: 'badge',
                    style: 'position:absolute; top:80px; left:50px; background:#3b82f6; color:#fff; padding:12px 28px; border-radius:30px; font-size:22px; font-weight:800; z-index:20;',
                    html: 'SATILIK PORTFÖY'
                },
                {
                    id: 'el_s_dn_p', field: 'price',
                    style: 'position:absolute; bottom:220px; left:50px; right:50px; background:rgba(15,23,42,0.92); border:2px solid #3b82f6; color:#38bdf8; padding:18px; border-radius:16px; text-align:center; font-size:46px; font-weight:900; z-index:20;',
                    html: '8.350.000 ₺'
                },
                {
                    id: 'el_s_dn_contact', field: 'contact',
                    style: 'position:absolute; bottom:80px; left:50px; right:50px; background:#2563eb; color:#fff; padding:18px 24px; border-radius:16px; display:flex; justify-content:space-between; align-items:center; font-size:20px; font-weight:800; z-index:20;',
                    html: `
                        <div><i class="fas fa-user-tie" style="margin-right:8px;"></i> Detaylı Bilgi & Randevu</div>
                        <div><i class="fas fa-phone-alt" style="margin-right:6px;"></i> Hemen Arayın</div>
                    `
                }
            ]
        }
    ];

    window.PRO_JSON_TEMPLATES = PRO_JSON_TEMPLATES;

    // ŞABLON YÜKLEME MOTORU
    window.loadJsonTemplate = function(tplIdOrObj) {
        let tpl = typeof tplIdOrObj === 'string' 
            ? PRO_JSON_TEMPLATES.find(t => t.id === tplIdOrObj) 
            : tplIdOrObj;

        if (!tpl) {
            console.error('Şablon bulunamadı:', tplIdOrObj);
            return;
        }

        console.log('👑 PRO JSON Şablonu Yükleniyor:', tpl.name, tpl.format);

        // 1. Tuval Formatını Şablona Uyarla
        const formatMap = {
            '16:9': '16:9 Full HD (YouTube/Banner)',
            '1:1': '1:1 Kare (Instagram/Sahibinden)',
            '4:5': '4:5 Portre (Instagram Gönderi)',
            '9:16': '9:16 Dikey (Story/Reels/TikTok)'
        };

        const targetFormatName = formatMap[tpl.format] || '16:9 Full HD (YouTube/Banner)';
        const previewSelect = document.getElementById('previewFormat');
        const exportSelect = document.getElementById('exportFormat');

        if (previewSelect) previewSelect.value = targetFormatName;
        if (exportSelect) exportSelect.value = targetFormatName;

        if (typeof window.switchPreviewFormat === 'function') {
            window.switchPreviewFormat();
        }

        // 2. Tuval Katmanlarını Temizle (Fotoğrafı Koru, Eski Şablon Elementlerini Kaldır)
        const renderLayer = document.getElementById('canva-render-layer');
        if (renderLayer) {
            renderLayer.innerHTML = '';
            renderLayer.style.display = 'block';
        }

        window.activeJsonTemplateId = tpl.id;
        window.activeJsonTemplateData = tpl;
        window.isCanvaMode = true;

        // 3. Şablon Elemanlarını Tuvale Ekle
        if (tpl.elements && Array.isArray(tpl.elements) && renderLayer) {
            tpl.elements.forEach((elData, idx) => {
                const el = document.createElement('div');
                el.id = elData.id || ('pje_' + idx);
                el.className = 'canvas-el draggable editable-text pro-json-el';
                if (elData.field) el.dataset.field = elData.field;
                if (elData.style) el.setAttribute('style', elData.style);
                el.innerHTML = elData.html || elData.text || '';
                
                renderLayer.appendChild(el);

                // Sürüklenebilir ve çift tıkla düzenlenebilir yap
                if (typeof makeDraggable === 'function') makeDraggable(el);
                if (typeof bindDrag === 'function') bindDrag(el);
            });
        }

        // 4. Eğer önceden süzülmüş metin verisi varsa anında şablona aktar
        if (window.lastParsedData) {
            window.applyParsedDataToJsonTemplate(window.lastParsedData);
        }

        // 5. Katman Düzenleyiciyi Çalıştır
        if (typeof window.arrangeLayers === 'function') {
            window.arrangeLayers(renderLayer);
        }

        if (typeof redrawAll === 'function') redrawAll();
        if (typeof saveHistoryState === 'function') saveHistoryState('PRO Şablon: ' + tpl.name);

        // Bildirim
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: `👑 ${tpl.name} yüklendi (${tpl.format})`,
                showConfirmButton: false,
                timer: 2000,
                background: '#1e293b',
                color: '#fff'
            });
        }
    };

    // AKILLI "METNİ SÜZ" VERİLERİNİ ŞABLONA OTOMATİK AKTARMA MOTORU
    window.applyParsedDataToJsonTemplate = function(parsedData) {
        if (!parsedData) return;
        const renderLayer = document.getElementById('canva-render-layer');
        if (!renderLayer) return;

        const p = parsedData;
        console.log('⚡ Parsed Data PRO Şablona aktarılıyor:', p);

        // 1. Fiyat
        if (p.price) {
            renderLayer.querySelectorAll('[data-field="price"]').forEach(el => {
                el.innerHTML = p.price;
            });
        }

        // 2. Durum / Başlık Rozeti
        if (p.status || p.propertyType) {
            const statusText = p.status || p.propertyType;
            renderLayer.querySelectorAll('[data-field="badge"], [data-field="status"]').forEach(el => {
                const icon = el.querySelector('i');
                const iconHtml = icon ? icon.outerHTML + ' ' : '';
                el.innerHTML = iconHtml + statusText.toUpperCase();
            });
        }

        // 3. Lokasyon / Konum
        if (p.location) {
            renderLayer.querySelectorAll('[data-field="location"]').forEach(el => {
                const icon = el.querySelector('i');
                const iconHtml = icon ? icon.outerHTML + ' ' : '';
                el.innerHTML = iconHtml + p.location;
            });
        }

        // 4. Oda Sayısı
        if (p.rooms) {
            renderLayer.querySelectorAll('[data-field="rooms"]').forEach(el => {
                el.innerHTML = p.rooms;
            });
        }

        // 5. Metrekare (m²)
        const sizeVal = (p.sizes && (p.sizes.brut || p.sizes.net)) ? (p.sizes.brut || p.sizes.net) : (p.size || '');
        if (sizeVal) {
            renderLayer.querySelectorAll('[data-field="size"], [data-field="m2"]').forEach(el => {
                el.innerHTML = sizeVal.includes('m²') ? sizeVal : (sizeVal + ' m²');
            });
        }

        // 6. Kat Bilgisi
        if (p.floor) {
            renderLayer.querySelectorAll('[data-field="floor"]').forEach(el => {
                el.innerHTML = p.floor;
            });
        }

        // 7. Isıtma
        if (p.heating) {
            renderLayer.querySelectorAll('[data-field="heating"]').forEach(el => {
                el.innerHTML = p.heating;
            });
        }

        // 8. Arsa / Ada / Parsel
        if (p.land && (p.land.ada || p.land.parsel)) {
            const apText = `ADA: ${p.land.ada || '-'} / PARSEL: ${p.land.parsel || '-'}`;
            renderLayer.querySelectorAll('[data-field="land"], [data-field="ada_parsel"]').forEach(el => {
                const icon = el.querySelector('i');
                const iconHtml = icon ? icon.outerHTML + ' ' : '';
                el.innerHTML = iconHtml + apText;
            });
        }

        // 9. Açıklama
        if (p.description) {
            renderLayer.querySelectorAll('[data-field="desc"]').forEach(el => {
                el.innerHTML = p.description;
            });
        }

        if (typeof redrawAll === 'function') redrawAll();
    };

    // PRO ŞABLON KARTLARINI RENDER ETME FONKSİYONU (UI)
    window.renderProJsonTemplatesTab = function(containerEl, activeFormat = 'all', activeCat = 'all') {
        if (!containerEl) return;

        let filtered = PRO_JSON_TEMPLATES;
        if (activeFormat !== 'all') {
            filtered = filtered.filter(t => t.format === activeFormat);
        }
        if (activeCat !== 'all') {
            filtered = filtered.filter(t => t.category === activeCat);
        }

        let html = `
            <div style="padding: 12px 10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div style="font-size:12px; font-weight:800; color:#cbd5e1; display:flex; align-items:center; gap:6px;">
                        <span>👑 PRO ŞABLON KÜTÜPHANESİ</span>
                        <span style="background:linear-gradient(135deg,#eab308,#ca8a04); color:#000; font-size:10px; padding:1px 6px; border-radius:10px; font-weight:900;">${filtered.length} Şablon</span>
                    </div>
                </div>

                <!-- Format Filtre Butonları -->
                <div style="display:flex; gap:4px; margin-bottom:10px; overflow-x:auto; padding-bottom:4px;" class="custom-scroll">
                    <button type="button" class="tab-btn ${activeFormat === 'all' ? 'active' : ''}" onclick="window.filterProJsonTab('all', '${activeCat}')" style="font-size:11px; padding:4px 10px; border-radius:6px;">Tümü (${PRO_JSON_TEMPLATES.length})</button>
                    <button type="button" class="tab-btn ${activeFormat === '16:9' ? 'active' : ''}" onclick="window.filterProJsonTab('16:9', '${activeCat}')" style="font-size:11px; padding:4px 10px; border-radius:6px;">16:9 (10)</button>
                    <button type="button" class="tab-btn ${activeFormat === '1:1' ? 'active' : ''}" onclick="window.filterProJsonTab('1:1', '${activeCat}')" style="font-size:11px; padding:4px 10px; border-radius:6px;">1:1 (10)</button>
                    <button type="button" class="tab-btn ${activeFormat === '4:5' ? 'active' : ''}" onclick="window.filterProJsonTab('4:5', '${activeCat}')" style="font-size:11px; padding:4px 10px; border-radius:6px;">4:5 (10)</button>
                    <button type="button" class="tab-btn ${activeFormat === '9:16' ? 'active' : ''}" onclick="window.filterProJsonTab('9:16', '${activeCat}')" style="font-size:11px; padding:4px 10px; border-radius:6px;">9:16 (10)</button>
                </div>

                <!-- Kategori Filtre Butonları -->
                <div style="display:flex; gap:4px; margin-bottom:14px; overflow-x:auto; padding-bottom:4px;" class="custom-scroll">
                    <button type="button" class="dock-pill-btn ${activeCat === 'all' ? 'active' : ''}" onclick="window.filterProJsonTab('${activeFormat}', 'all')" style="font-size:10px; padding:2px 8px; border-radius:4px;">Tüm Tipler</button>
                    <button type="button" class="dock-pill-btn ${activeCat === 'konut' ? 'active' : ''}" onclick="window.filterProJsonTab('${activeFormat}', 'konut')" style="font-size:10px; padding:2px 8px; border-radius:4px;">🏠 Konut</button>
                    <button type="button" class="dock-pill-btn ${activeCat === 'villa' ? 'active' : ''}" onclick="window.filterProJsonTab('${activeFormat}', 'villa')" style="font-size:10px; padding:2px 8px; border-radius:4px;">💎 Lüks Villa</button>
                    <button type="button" class="dock-pill-btn ${activeCat === 'arsa' ? 'active' : ''}" onclick="window.filterProJsonTab('${activeFormat}', 'arsa')" style="font-size:10px; padding:2px 8px; border-radius:4px;">🌱 Arsa / Tarla</button>
                    <button type="button" class="dock-pill-btn ${activeCat === 'ticari' ? 'active' : ''}" onclick="window.filterProJsonTab('${activeFormat}', 'ticari')" style="font-size:10px; padding:2px 8px; border-radius:4px;">🏬 Ticari</button>
                </div>

                <!-- Şablon Kartları Izgarası -->
                <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;">
        `;

        filtered.forEach(tpl => {
            const isFav = typeof window.isTemplateFavorited === 'function' ? window.isTemplateFavorited('pro_json', tpl.id) : false;
            
            // Format oranına göre kart önizleme yüksekliği
            let previewH = '85px';
            if (tpl.format === '1:1') previewH = '110px';
            if (tpl.format === '4:5') previewH = '130px';
            if (tpl.format === '9:16') previewH = '150px';

            html += `
                <div class="canva-tpl-card pro-tpl-card" onclick="window.loadJsonTemplate('${tpl.id}')" style="background:#0f172a; border:1px solid #1e293b; border-radius:10px; padding:8px; cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between;" onmouseover="this.style.borderColor='#818cf8'; this.style.transform='translateY(-2px)';" onmouseout="this.style.borderColor='#1e293b'; this.style.transform='none';">
                    
                    <!-- Kart Önizleme Alanı -->
                    <div style="height:${previewH}; background:${tpl.previewBg}; border-radius:6px; margin-bottom:8px; position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; padding:6px; box-shadow:inset 0 0 15px rgba(0,0,0,0.5);">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="background:rgba(0,0,0,0.7); color:#fff; font-size:9px; font-weight:800; padding:2px 5px; border-radius:4px; border:1px solid rgba(255,255,255,0.15);">${tpl.format}</span>
                            <span style="background:rgba(234,179,8,0.2); color:#facc15; font-size:8px; font-weight:800; padding:2px 5px; border-radius:4px; border:1px solid rgba(234,179,8,0.4);">${tpl.badge}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                            <div style="width:28px; height:6px; background:rgba(255,255,255,0.3); border-radius:3px;"></div>
                            <div style="background:rgba(56,189,248,0.3); width:35px; height:8px; border-radius:3px; border:1px solid #38bdf8;"></div>
                        </div>
                    </div>

                    <!-- Kart Başlığı & Buton -->
                    <div>
                        <div style="font-size:11px; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:4px;" title="${tpl.name}">${tpl.name}</div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:9px; color:#94a3b8; text-transform:uppercase;">${tpl.category}</span>
                            <span style="font-size:10px; color:#818cf8; font-weight:700;">Seç ➔</span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        containerEl.innerHTML = html;
    };

    window.filterProJsonTab = function(format, cat) {
        const container = document.getElementById('tpl-content-pro_json');
        if (container) {
            window.renderProJsonTemplatesTab(container, format, cat);
        }
    };

})(window);
