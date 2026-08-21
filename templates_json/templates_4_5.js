/**
 * ============================================================================
 * 📱 4:5 FORMAT PRO JSON ŞABLONLARI (INSTAGRAM PORTRAIT / PORTRE - 1080x1350)
 * templates_json/templates_4_5.js
 * ============================================================================
 */

(function(window) {
    'use strict';

    const TEMPLATES_4_5 = [
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
        }
    ];

    // Otomatik Kayıt Motoruna Ekle
    TEMPLATES_4_5.forEach(t => {
        if (typeof window.registerProJsonTemplate === 'function') {
            window.registerProJsonTemplate(t);
        }
    });

})(window);
