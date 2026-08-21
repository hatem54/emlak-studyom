/**
 * ============================================================================
 * 🖼️ 1:1 FORMAT PRO JSON ŞABLONLARI (INSTAGRAM POST / KARE - 1080x1080)
 * templates_json/templates_1_1.js
 * ============================================================================
 */

(function(window) {
    'use strict';

    const TEMPLATES_1_1 = [
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
        }
    ];

    // Otomatik Kayıt Motoruna Ekle
    TEMPLATES_1_1.forEach(t => {
        if (typeof window.registerProJsonTemplate === 'function') {
            window.registerProJsonTemplate(t);
        }
    });

})(window);
