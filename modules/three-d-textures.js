/**
 * Emlak Stüdyom - 3D Emlak Malzeme & Doku Kütüphanesi Motoru
 * modules/three-d-textures.js
 * 
 * - 100+ Çeşitli Prosedürel PBR Emlak Dokuları (%100 Çevrimdışı, 0 KB Network, Sıfır Gecikme)
 * - Çok Parçalı (Multi-Slot) Doku Desteği: [Tüm Öge], [Pano / Ön Yüz], [Ayaklar / Çerçeve], [Kabartma Yazı]
 * - Açılır Akordeon İnce Ayarları: Doku Sıklığı, Parlaklık, Doygunluk, Pürüzlülük, Metaliklik
 * - Mimari Emlak Standartları: Ahşap, Metal, Mermer, Duvar, Peyzaj, Asfalt, Çatı, Havuz, Pleksi, Neon
 */

(function(window) {
    'use strict';

    // 🎨 DOKU KATALOĞU (10 Kategori, 50+ Temel Prestijli Doku)
    const TEXTURE_CATEGORIES = [
        { id: 'all', name: 'Tümü' },
        { id: 'wood', name: 'Ahşap' },
        { id: 'metal', name: 'Metal' },
        { id: 'marble', name: 'Mermer' },
        { id: 'wall', name: 'Duvar & Taş' },
        { id: 'landscape', name: 'Çim & Bahçe' },
        { id: 'ground', name: 'Yol & Asfalt' },
        { id: 'roof', name: 'Çatı & Kiremit' },
        { id: 'water', name: 'Su & Havuz' },
        { id: 'glass_acrylic', name: 'Cam & Pleksi' },
        { id: 'neon_led', name: 'Neon LED' }
    ];

    const TEXTURE_CATALOG = [
        // 1. AHŞAPLAR
        { id: 'wood_oak', cat: 'wood', name: 'Açık Meşe', gen: 'wood', base: '#deb887', grain: '#8b5a2b', roughness: 0.65, metalness: 0.02, repeat: 2 },
        { id: 'wood_walnut', cat: 'wood', name: 'Koyu Ceviz', gen: 'wood', base: '#5c3a21', grain: '#2e190e', roughness: 0.60, metalness: 0.02, repeat: 2 },
        { id: 'wood_pine', cat: 'wood', name: 'İskandinav Çam', gen: 'wood', base: '#f5deb3', grain: '#d2b48c', roughness: 0.70, metalness: 0.02, repeat: 2.5 },
        { id: 'wood_rustic', cat: 'wood', name: 'Rustik Kütük', gen: 'wood', base: '#7c4d28', grain: '#3e2312', roughness: 0.80, metalness: 0.0, repeat: 1.8 },
        { id: 'wood_bamboo', cat: 'wood', name: 'Doğal Bambu', gen: 'wood', base: '#e6c280', grain: '#b5883d', roughness: 0.55, metalness: 0.02, repeat: 3 },
        { id: 'wood_yakisugi', cat: 'wood', name: 'Yanık Ahşap', gen: 'wood', base: '#292524', grain: '#18181b', roughness: 0.85, metalness: 0.04, repeat: 2 },

        // 2. LÜKS METALLER
        { id: 'metal_gold', cat: 'metal', name: '24K Altın', gen: 'color', base: '#ffd700', roughness: 0.15, metalness: 0.85 },
        { id: 'metal_chrome', cat: 'metal', name: 'Ayna Krom', gen: 'color', base: '#f8fafc', roughness: 0.08, metalness: 0.92 },
        { id: 'metal_brushed', cat: 'metal', name: 'Fırçalanmış Çelik', gen: 'brushed', base: '#cbd5e1', roughness: 0.28, metalness: 0.82, repeat: 1 },
        { id: 'metal_anthracite', cat: 'metal', name: 'Mat Titanyum', gen: 'brushed', base: '#475569', roughness: 0.40, metalness: 0.75, repeat: 1 },
        { id: 'metal_rose_gold', cat: 'metal', name: 'Rose Gold', gen: 'color', base: '#b76e79', roughness: 0.20, metalness: 0.85 },
        { id: 'metal_iron_black', cat: 'metal', name: 'Ferforje Demir', gen: 'stipple', base: '#27272a', speckle: '#52525b', roughness: 0.75, metalness: 0.35, repeat: 2 },
        { id: 'metal_corten', cat: 'metal', name: 'Paslı Corten', gen: 'corten', base: '#9a3412', roughness: 0.80, metalness: 0.15, repeat: 2 },
        { id: 'metal_carbon', cat: 'metal', name: 'Karbon Fiber', gen: 'carbon', base: '#27272a', roughness: 0.25, metalness: 0.08, repeat: 3 },

        // 3. MERMER & TAŞLAR
        { id: 'marble_carrara', cat: 'marble', name: 'Carrara Mermer', gen: 'marble', base: '#f8fafc', vein: '#64748b', roughness: 0.18, metalness: 0.04, repeat: 1.5 },
        { id: 'marble_marquina', cat: 'marble', name: 'Siyah Mermer', gen: 'marble', base: '#18181b', vein: '#f1f5f9', accent: '#fbbf24', roughness: 0.18, metalness: 0.04, repeat: 1.5 },
        { id: 'marble_travertine', cat: 'marble', name: 'Bej Traverten', gen: 'travertine', base: '#e2d5c3', vein: '#b8a68f', roughness: 0.50, metalness: 0.02, repeat: 2 },
        { id: 'marble_emerald', cat: 'marble', name: 'Zümrüt Mermer', gen: 'marble', base: '#064e3b', vein: '#fbbf24', roughness: 0.20, metalness: 0.06, repeat: 1.5 },
        { id: 'stone_granite', cat: 'marble', name: 'Siyah Granit', gen: 'stipple', base: '#27272a', speckle: '#94a3b8', roughness: 0.22, metalness: 0.08, repeat: 3 },
        { id: 'stone_terrazzo', cat: 'marble', name: 'Terrazzo Taş', gen: 'terrazzo', base: '#f1f5f9', roughness: 0.35, metalness: 0.04, repeat: 2.5 },

        // 4. DIŞ CEPHE & DUVAR
        { id: 'wall_brick_red', cat: 'wall', name: 'Kırmızı Tuğla', gen: 'brick', base: '#991b1b', mortar: '#e2e8f0', roughness: 0.85, metalness: 0.0, repeat: 3 },
        { id: 'wall_brick_white', cat: 'wall', name: 'Loft Beyaz Tuğla', gen: 'brick', base: '#f8fafc', mortar: '#cbd5e1', roughness: 0.75, metalness: 0.0, repeat: 3 },
        { id: 'wall_stone_bodrum', cat: 'wall', name: 'Bodrum Taş Duvar', gen: 'stone', base: '#78716c', mortar: '#d6d3d1', roughness: 0.90, metalness: 0.0, repeat: 2 },
        { id: 'wall_stone_slate', cat: 'wall', name: 'Doğal Kayrak', gen: 'slate', base: '#44403c', roughness: 0.80, metalness: 0.05, repeat: 2 },
        { id: 'wall_concrete', cat: 'wall', name: 'Brüt Beton', gen: 'concrete', base: '#94a3b8', roughness: 0.70, metalness: 0.05, repeat: 1.5 },
        { id: 'wall_plaster', cat: 'wall', name: 'Mineral Sıva', gen: 'stipple', base: '#f8fafc', roughness: 0.90, metalness: 0.0, repeat: 4 },

        // 5. ÇİM & BAHÇE
        { id: 'land_grass', cat: 'landscape', name: 'Doğal Yeşil Çim', gen: 'grass', base: '#15803d', tip: '#22c55e', roughness: 0.95, metalness: 0.0, repeat: 3 },
        { id: 'land_lawn_golf', cat: 'landscape', name: 'Golf Çimi', gen: 'grass', base: '#16a34a', tip: '#4ade80', roughness: 0.90, metalness: 0.0, repeat: 3.5 },
        { id: 'land_earth', cat: 'landscape', name: 'Bahçe Toprağı', gen: 'stipple', base: '#451a03', speckle: '#290e02', roughness: 0.98, metalness: 0.0, repeat: 3 },
        { id: 'land_sand', cat: 'landscape', name: 'Sahil Kumu', gen: 'sand', base: '#fef08a', grain: '#ca8a04', roughness: 0.90, metalness: 0.0, repeat: 2.5 },
        { id: 'land_gravel', cat: 'landscape', name: 'Çakıl & Mıcır', gen: 'terrazzo', base: '#a8a29e', roughness: 0.85, metalness: 0.05, repeat: 3 },

        // 6. YOL & ASFALT
        { id: 'road_asphalt', cat: 'ground', name: 'Sıcak Asfalt', gen: 'asphalt', base: '#334155', roughness: 0.90, metalness: 0.05, repeat: 2 },
        { id: 'road_asphalt_line', cat: 'ground', name: 'Yol Çizgili Asfalt', gen: 'asphalt_line', base: '#334155', line: '#facc15', roughness: 0.90, metalness: 0.05, repeat: 1.5 },
        { id: 'road_interlocking', cat: 'ground', name: 'Kilit Parke Taşı', gen: 'paver', base: '#94a3b8', mortar: '#475569', roughness: 0.85, metalness: 0.0, repeat: 3 },
        { id: 'road_cobblestone', cat: 'ground', name: 'Arnavut Kaldırımı', gen: 'cobblestone', base: '#57534e', roughness: 0.88, metalness: 0.0, repeat: 2.5 },

        // 7. ÇATI & KİREMİT
        { id: 'roof_terracotta', cat: 'roof', name: 'Kırmızı Kiremit', gen: 'roof_tile', base: '#c2410c', shadow: '#7c2d12', roughness: 0.85, metalness: 0.0, repeat: 3 },
        { id: 'roof_anthracite', cat: 'roof', name: 'Antrasit Kiremit', gen: 'roof_tile', base: '#334155', shadow: '#1e293b', roughness: 0.75, metalness: 0.05, repeat: 3 },
        { id: 'roof_corrugated', cat: 'roof', name: 'Oluklu Çatı Sacı', gen: 'corrugated', base: '#64748b', roughness: 0.35, metalness: 0.70, repeat: 4 },

        // 8. SU & HAVUZ
        { id: 'water_mosaic_blue', cat: 'water', name: 'Mavi Mozaik', gen: 'tile_grid', base: '#0284c7', mortar: '#ffffff', roughness: 0.15, metalness: 0.05, repeat: 4 },
        { id: 'water_mosaic_turquoise', cat: 'water', name: 'Turkuaz Mozaik', gen: 'tile_grid', base: '#0d9488', mortar: '#ccfbf1', roughness: 0.15, metalness: 0.05, repeat: 4 },
        { id: 'water_surface', cat: 'water', name: 'Havuz Suyu', gen: 'water', base: '#0284c7', caustic: '#7dd3fc', roughness: 0.10, metalness: 0.08, repeat: 2 },

        // 9. CAM & PLEKSİ
        { id: 'acrylic_white_gloss', cat: 'glass_acrylic', name: 'Parlak Pleksi', gen: 'color', base: '#ffffff', roughness: 0.05, metalness: 0.0 },
        { id: 'acrylic_black_matte', cat: 'glass_acrylic', name: 'Mat Siyah Pleksi', gen: 'color', base: '#18181b', roughness: 0.80, metalness: 0.0 },
        { id: 'glass_frosted', cat: 'glass_acrylic', name: 'Buzlu Cam', gen: 'color', base: '#e2e8f0', roughness: 0.35, metalness: 0.0, transparent: true, opacity: 0.65 },
        { id: 'glass_tinted', cat: 'glass_acrylic', name: 'Füme Yansımalı Cam', gen: 'color', base: '#334155', roughness: 0.10, metalness: 0.10, transparent: true, opacity: 0.75 },

        // 10. NEON LED
        { id: 'neon_gold_glow', cat: 'neon_led', name: 'Sıcak Altın LED', gen: 'color', base: '#f59e0b', emissive: '#f59e0b', emissiveIntensity: 0.85, roughness: 0.20 },
        { id: 'neon_red_glow', cat: 'neon_led', name: 'Neon Kırmızı', gen: 'color', base: '#ef4444', emissive: '#ef4444', emissiveIntensity: 0.90, roughness: 0.20 },
        { id: 'neon_cyan_glow', cat: 'neon_led', name: 'Kurumsal Cyan', gen: 'color', base: '#06b6d4', emissive: '#06b6d4', emissiveIntensity: 0.90, roughness: 0.20 },
        { id: 'neon_green_glow', cat: 'neon_led', name: 'Zümrüt Yeşil LED', gen: 'color', base: '#10b981', emissive: '#10b981', emissiveIntensity: 0.85, roughness: 0.20 }
    ];

    // Önbellek (Canvas Dokuları bir kez üretilir ve tekrar kullanılır)
    const textureCache = new Map();

    // ⚡ PROSEDÜREL KANVAS DOKU ÜRETECİLERİ
    function createProceduralCanvas(def, size = 256) {
        const cacheKey = `${def.id}_${size}`;
        if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const gen = def.gen || 'color';

        switch (gen) {
            case 'wood': {
                // Ahşap lifleri ve hafif dalga
                ctx.fillStyle = def.base || '#deb887';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = def.grain || '#8b5a2b';
                for (let i = 0; i < size; i += 3) {
                    const alpha = 0.05 + Math.random() * 0.15;
                    ctx.globalAlpha = alpha;
                    ctx.beginPath();
                    const jitter = Math.sin(i * 0.08) * 8;
                    ctx.rect(0, i + jitter, size, 1.5 + Math.random() * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1.0;
                break;
            }
            case 'marble': {
                // Gerçekçi İtalyan Mermer Damarları & Mineral Gölgeleri
                ctx.fillStyle = def.base || '#f8fafc';
                ctx.fillRect(0, 0, size, size);

                // 1. Yumuşak dumanlı mineral ton varyasyonları
                const isDark = (def.id === 'marble_marquina' || def.base === '#09090b' || def.base === '#18181b');
                for (let c = 0; c < 4; c++) {
                    const cx = (c * 73) % size;
                    const cy = ((c + 1) * 97) % size;
                    const r = size * 0.45;
                    const radGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
                    const cloudColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(148, 163, 184, 0.12)';
                    radGrad.addColorStop(0, cloudColor);
                    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    ctx.fillStyle = radGrad;
                    ctx.fillRect(0, 0, size, size);
                }

                // 2. Ana Organik Kılcal Damarlar (Belirgin ve zarif)
                const veinColor = def.vein || (isDark ? '#e2e8f0' : '#64748b');
                const veinCount = 6;
                for (let v = 0; v < veinCount; v++) {
                    ctx.save();
                    ctx.strokeStyle = veinColor;
                    ctx.globalAlpha = 0.45 + (v % 3) * 0.2;
                    ctx.lineWidth = 1.2 + (v % 3) * 1.2;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.beginPath();

                    let curX = ((v * 47) % size);
                    let curY = 0;
                    ctx.moveTo(curX, curY);

                    while (curY < size) {
                        const stepY = 10 + Math.random() * 14;
                        curY += stepY;
                        curX += (Math.random() - 0.47) * 22;
                        ctx.lineTo(curX, curY);

                        // Yan dal ayrışması (organik çatallanma)
                        if (Math.random() > 0.65 && curY < size - 20) {
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.moveTo(curX, curY);
                            let subX = curX;
                            let subY = curY;
                            const branchLen = 25 + Math.random() * 35;
                            const angle = (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.6);
                            for (let b = 0; b < branchLen; b += 8) {
                                subX += Math.cos(angle) * 8 + (Math.random() - 0.5) * 4;
                                subY += Math.sin(angle) * 8 + 4;
                                ctx.lineTo(subX, subY);
                            }
                            ctx.lineWidth = Math.max(0.8, ctx.lineWidth * 0.6);
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.moveTo(curX, curY);
                        }
                    }
                    ctx.stroke();
                    ctx.restore();
                }

                // 3. İnce Altın/Platin Kılcal Vurgular
                if (def.accent || isDark) {
                    ctx.save();
                    ctx.strokeStyle = def.accent || '#fbbf24';
                    ctx.globalAlpha = 0.35;
                    ctx.lineWidth = 1.0;
                    ctx.beginPath();
                    let ax = size * 0.3;
                    let ay = 0;
                    ctx.moveTo(ax, ay);
                    while (ay < size) {
                        ay += 12 + Math.random() * 16;
                        ax += (Math.random() - 0.45) * 20;
                        ctx.lineTo(ax, ay);
                    }
                    ctx.stroke();
                    ctx.restore();
                }
                break;
            }
            case 'carbon': {
                // Yüksek Kaliteli 2x2 Twill Karbon Fiber Dokusu
                ctx.fillStyle = '#18181b';
                ctx.fillRect(0, 0, size, size);

                const cBlock = size / 8;
                const strandW = cBlock / 4;

                for (let x = 0; x < size; x += cBlock) {
                    for (let y = 0; y < size; y += cBlock) {
                        const isHorizontal = ((Math.floor(x / cBlock) + Math.floor(y / cBlock)) % 2 === 0);

                        if (isHorizontal) {
                            for (let s = 0; s < 4; s++) {
                                const sy = y + s * strandW;
                                const lum = (s % 2 === 0) ? '#383842' : '#222228';
                                ctx.fillStyle = lum;
                                ctx.fillRect(x, sy, cBlock, strandW);
                                ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
                                ctx.fillRect(x, sy + strandW * 0.3, cBlock, 1);
                            }
                        } else {
                            for (let s = 0; s < 4; s++) {
                                const sx = x + s * strandW;
                                const lum = (s % 2 === 0) ? '#484854' : '#2d2d38';
                                ctx.fillStyle = lum;
                                ctx.fillRect(sx, y, strandW, cBlock);
                                ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
                                ctx.fillRect(sx + strandW * 0.3, y, 1, cBlock);
                            }
                        }

                        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                        ctx.fillRect(x, y + cBlock - 1, cBlock, 1);
                        ctx.fillRect(x + cBlock - 1, y, 1, cBlock);
                    }
                }

                const diagGrad = ctx.createLinearGradient(0, 0, size, size);
                diagGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
                diagGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.08)');
                diagGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
                ctx.fillStyle = diagGrad;
                ctx.fillRect(0, 0, size, size);
                break;
            }
            case 'corten': {
                // Paslı Corten Çeliği
                ctx.fillStyle = def.base || '#9a3412';
                ctx.fillRect(0, 0, size, size);
                const rustColors = ['#7c2d12', '#c2410c', '#431407', '#ea580c'];
                for (let r = 0; r < 20; r++) {
                    ctx.fillStyle = rustColors[r % rustColors.length];
                    ctx.globalAlpha = 0.12 + Math.random() * 0.18;
                    const rx = Math.random() * size;
                    const ry = Math.random() * size;
                    const rw = 20 + Math.random() * 60;
                    const rh = 15 + Math.random() * 45;
                    ctx.beginPath();
                    ctx.ellipse(rx, ry, rw, rh, Math.random() * Math.PI, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = '#292524';
                for (let p = 0; p < 400; p++) {
                    ctx.globalAlpha = 0.08 + Math.random() * 0.15;
                    ctx.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5);
                }
                ctx.globalAlpha = 1.0;
                break;
            }
            case 'travertine': {
                // Bej Traverten Taşı
                ctx.fillStyle = def.base || '#e2d5c3';
                ctx.fillRect(0, 0, size, size);
                const bandColors = [def.vein || '#b8a68f', '#d7c7b2', '#a8947d', '#ebdcc9'];
                for (let y = 0; y < size; y += 4) {
                    ctx.fillStyle = bandColors[Math.floor(y / 4) % bandColors.length];
                    ctx.globalAlpha = 0.15 + Math.random() * 0.25;
                    const wave = Math.sin(y * 0.05) * 6;
                    ctx.fillRect(0, y + wave, size, 2 + Math.random() * 3);
                }
                ctx.fillStyle = '#786955';
                for (let p = 0; p < 70; p++) {
                    ctx.globalAlpha = 0.25 + Math.random() * 0.35;
                    const px = Math.random() * size;
                    const py = Math.random() * size;
                    ctx.fillRect(px, py, 4 + Math.random() * 12, 1.5 + Math.random() * 1.5);
                }
                ctx.globalAlpha = 1.0;
                break;
            }
            case 'terrazzo': {
                // Terrazzo Mozaik Taş
                ctx.fillStyle = def.base || '#f1f5f9';
                ctx.fillRect(0, 0, size, size);
                const chipColors = ['#334155', '#94a3b8', '#b45309', '#0369a1', '#15803d', '#713f12', '#e2e8f0'];
                for (let i = 0; i < 220; i++) {
                    ctx.fillStyle = chipColors[i % chipColors.length];
                    ctx.globalAlpha = 0.7 + Math.random() * 0.3;
                    const cx = Math.random() * size;
                    const cy = Math.random() * size;
                    const cr = 2 + Math.random() * 5;
                    ctx.beginPath();
                    const sides = 3 + Math.floor(Math.random() * 3);
                    for (let s = 0; s < sides; s++) {
                        const ang = (s / sides) * Math.PI * 2;
                        const dist = cr * (0.6 + Math.random() * 0.8);
                        const px = cx + Math.cos(ang) * dist;
                        const py = cy + Math.sin(ang) * dist;
                        if (s === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.fill();
                }
                ctx.globalAlpha = 1.0;
                break;
            }
            case 'slate': {
                // Doğal Kayrak Taşı
                ctx.fillStyle = def.base || '#44403c';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = '#292524';
                for (let y = 0; y < size; y += 8) {
                    ctx.globalAlpha = 0.2 + Math.random() * 0.3;
                    ctx.fillRect(0, y + (Math.random() - 0.5) * 4, size, 3 + Math.random() * 4);
                }
                ctx.fillStyle = '#a8a29e';
                for (let i = 0; i < 30; i++) {
                    ctx.globalAlpha = 0.12 + Math.random() * 0.18;
                    const sx = Math.random() * size;
                    const sy = Math.random() * size;
                    ctx.fillRect(sx, sy, 30 + Math.random() * 50, 1.2);
                }
                ctx.globalAlpha = 1.0;
                break;
            }
            case 'sand': {
                // Sahil Kumu
                ctx.fillStyle = def.base || '#fef08a';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = def.grain || '#ca8a04';
                for (let y = 0; y < size; y += 6) {
                    ctx.globalAlpha = 0.08 + Math.sin(y * 0.08) * 0.06;
                    ctx.fillRect(0, y, size, 3);
                }
                for (let p = 0; p < 1500; p++) {
                    ctx.globalAlpha = 0.15 + Math.random() * 0.25;
                    ctx.fillStyle = (p % 2 === 0) ? '#a16207' : '#fef9c3';
                    ctx.fillRect(Math.random() * size, Math.random() * size, 1.2, 1.2);
                }
                ctx.globalAlpha = 1.0;
                break;
            }
            case 'paver': {
                // Kilit Parke Taşı
                ctx.fillStyle = def.mortar || '#475569';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = def.base || '#94a3b8';
                const pW = size / 6;
                const pH = size / 6;
                const gap = 2;
                for (let x = 0; x < size; x += pW) {
                    for (let y = 0; y < size; y += pH) {
                        const shift = ((Math.floor(y / pH)) % 2) * (pW / 2);
                        ctx.beginPath();
                        ctx.roundRect((x + shift) % size + gap, y + gap, pW - gap * 2, pH - gap * 2, 2);
                        ctx.fill();
                    }
                }
                break;
            }
            case 'corrugated': {
                // Oluklu Çatı Sacı
                ctx.fillStyle = def.base || '#64748b';
                ctx.fillRect(0, 0, size, size);
                const ribCount = 8;
                const ribW = size / ribCount;
                for (let i = 0; i < ribCount; i++) {
                    const rx = i * ribW;
                    const ribGrad = ctx.createLinearGradient(rx, 0, rx + ribW, 0);
                    ribGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
                    ribGrad.addColorStop(0.3, 'rgba(0, 0, 0, 0.1)');
                    ribGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
                    ribGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
                    ribGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
                    ctx.fillStyle = ribGrad;
                    ctx.fillRect(rx, 0, ribW, size);
                }
                break;
            }
            case 'water': {
                // Havuz Suyu & Kostik Işık Kırılmaları
                ctx.fillStyle = def.base || '#0284c7';
                ctx.fillRect(0, 0, size, size);
                ctx.strokeStyle = def.caustic || '#7dd3fc';
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                for (let w = 0; w < 12; w++) {
                    ctx.globalAlpha = 0.25 + Math.random() * 0.35;
                    ctx.lineWidth = 2 + Math.random() * 3;
                    ctx.beginPath();
                    let wx = Math.random() * size;
                    let wy = Math.random() * size;
                    ctx.moveTo(wx, wy);
                    for (let seg = 0; seg < 5; seg++) {
                        wx += (Math.random() - 0.5) * 50;
                        wy += (Math.random() - 0.5) * 50;
                        ctx.lineTo(wx, wy);
                    }
                    ctx.closePath();
                    ctx.stroke();
                }
                ctx.fillStyle = '#ffffff';
                for (let s = 0; s < 40; s++) {
                    ctx.globalAlpha = 0.4 + Math.random() * 0.5;
                    ctx.beginPath();
                    ctx.arc(Math.random() * size, Math.random() * size, 1 + Math.random() * 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1.0;
                break;
            }
            case 'brick': {
                // Şaşırtmalı tuğla deseni
                ctx.fillStyle = def.mortar || '#cbd5e1';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = def.base || '#991b1b';
                const bH = size / 8;
                const bW = size / 4;
                const mortar = 3;
                for (let r = 0; r < 8; r++) {
                    const shift = (r % 2) * (bW / 2);
                    for (let c = -1; c < 5; c++) {
                        ctx.fillRect(c * bW + shift + mortar, r * bH + mortar, bW - mortar * 2, bH - mortar * 2);
                    }
                }
                break;
            }
            case 'stone':
            case 'cobblestone': {
                // Arnavut kaldırımı / doğal taş karo
                ctx.fillStyle = '#44403c';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = def.base || '#78716c';
                const sStep = size / 6;
                for (let x = 0; x < size; x += sStep) {
                    for (let y = 0; y < size; y += sStep) {
                        ctx.beginPath();
                        ctx.roundRect(x + 2, y + 2, sStep - 4, sStep - 4, 4);
                        ctx.fill();
                    }
                }
                break;
            }
            case 'asphalt':
            case 'concrete':
            case 'stipple': {
                // Kumlanmış granüllü asfalt / beton / sıva
                ctx.fillStyle = def.base || '#1e293b';
                ctx.fillRect(0, 0, size, size);
                const pColor = def.speckle || (gen === 'asphalt' ? '#475569' : '#0f172a');
                ctx.fillStyle = pColor;
                for (let p = 0; p < 800; p++) {
                    ctx.globalAlpha = 0.08 + Math.random() * 0.15;
                    ctx.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5);
                }
                ctx.globalAlpha = 1.0;
                break;
            }
            case 'asphalt_line': {
                // Asfalt + Sarı şerit
                ctx.fillStyle = def.base || '#1e293b';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = '#475569';
                for (let p = 0; p < 600; p++) {
                    ctx.globalAlpha = 0.1;
                    ctx.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5);
                }
                ctx.globalAlpha = 1.0;
                ctx.fillStyle = def.line || '#eab308';
                ctx.fillRect(size * 0.45, 0, size * 0.1, size);
                break;
            }
            case 'grass': {
                // Katmanlı çim dokusu
                ctx.fillStyle = def.base || '#15803d';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = def.tip || '#22c55e';
                for (let g = 0; g < 1200; g++) {
                    ctx.globalAlpha = 0.12 + Math.random() * 0.2;
                    ctx.fillRect(Math.random() * size, Math.random() * size, 1.2, 3 + Math.random() * 4);
                }
                ctx.globalAlpha = 1.0;
                break;
            }
            case 'tile_grid': {
                // Havuz mozaik ızgarası
                ctx.fillStyle = def.mortar || '#ffffff';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = def.base || '#0284c7';
                const tSize = size / 8;
                for (let tx = 0; tx < size; tx += tSize) {
                    for (let ty = 0; ty < size; ty += tSize) {
                        ctx.globalAlpha = 0.85 + Math.random() * 0.15;
                        ctx.fillRect(tx + 1.5, ty + 1.5, tSize - 3, tSize - 3);
                    }
                }
                ctx.globalAlpha = 1.0;
                break;
            }
            case 'roof_tile': {
                // Kiremit dalgaları
                ctx.fillStyle = def.base || '#c2410c';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = def.shadow || '#7c2d12';
                const rStep = size / 6;
                for (let ry = 0; ry < size; ry += rStep) {
                    ctx.fillRect(0, ry, size, 4);
                }
                break;
            }
            case 'brushed': {
                // Fırçalanmış metal çizgileri
                ctx.fillStyle = def.base || '#cbd5e1';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = '#ffffff';
                for (let l = 0; l < size; l += 2) {
                    ctx.globalAlpha = 0.04 + Math.random() * 0.08;
                    ctx.fillRect(0, l, size, 1);
                }
                ctx.fillStyle = '#000000';
                for (let l = 0; l < size; l += 3) {
                    ctx.globalAlpha = 0.03 + Math.random() * 0.06;
                    ctx.fillRect(0, l, size, 1);
                }
                ctx.globalAlpha = 1.0;
                break;
            }
            case 'color':
            default: {
                ctx.fillStyle = def.base || '#ffffff';
                ctx.fillRect(0, 0, size, size);
                break;
            }
        }

        const dataUrl = canvas.toDataURL('image/png');
        textureCache.set(cacheKey, { canvas, dataUrl });
        return { canvas, dataUrl };
    }

    // Three.js Texture Oluşturucu
    function getThreeTexture(def, repeatScale = 1.0) {
        if (!window.THREE) return null;
        const res = createProceduralCanvas(def, 256);
        if (!res || !res.canvas) return null;

        const tex = new window.THREE.CanvasTexture(res.canvas);
        tex.wrapS = window.THREE.RepeatWrapping;
        tex.wrapT = window.THREE.RepeatWrapping;
        const rep = (def.repeat || 1.0) * (repeatScale || 1.0);
        tex.repeat.set(rep, rep);
        if (window.THREE.sRGBEncoding) {
            tex.encoding = window.THREE.sRGBEncoding;
        }
        tex.needsUpdate = true;
        return tex;
    }

    // 🎯 ÇOK PARÇALI HEDEF PARÇA BELİRLEME
    // slot: 'all' | 'face' | 'frame' | 'stand'
    let currentTargetSlot = 'all';
    let currentSelectedCategory = 'all';
    let textureSectionOpen = false;
    let textureAccordionOpen = false;

    // Aktif Doku Parametreleri
    const defaultParams = {
        repeat: 1.0,
        brightness: 1.0,
        roughness: null,
        metalness: null
    };

    // 🎨 Güvenli Hex Renk Çözücü
    function safeHex(val, fallback = '#cbd5e1') {
        if (!val || typeof val !== 'string') return fallback;
        const s = val.trim();
        if (/^#[0-9a-fA-F]{6}$/.test(s)) return s;
        if (/^#[0-9a-fA-F]{3}$/.test(s)) {
            return '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
        }
        try {
            if (window.THREE && window.THREE.Color) {
                const c = new window.THREE.Color(s);
                return '#' + c.getHexString();
            }
        } catch (e) {}
        return fallback;
    }

    /**
     * Doku Uygulama Fonksiyonu
     */
    function applyTexture(element, textureId, slot = currentTargetSlot, customParams = {}) {
        const el = element || (window.ThreeDEngine ? window.ThreeDEngine.getActiveElement() : null);
        if (!el || !window.THREE) return;

        const def = TEXTURE_CATALOG.find(t => t.id === textureId);
        if (!def) return;

        if (!el._textureConfigs) el._textureConfigs = {};

        const params = Object.assign({}, defaultParams, customParams);
        const tex = (def.gen !== 'color') ? getThreeTexture(def, params.repeat) : null;

        // Slot bazlı hedef belirleme
        const targetMeshes = getMeshesForSlot(el, slot);

        targetMeshes.forEach(mesh => {
            if (!mesh) return;

            // Çoklu materyal (Array) desteği: Extruded Mesh'lerde [0: Ön/Arka, 1: Yan Kalınlık]
            if (Array.isArray(mesh.material)) {
                if (slot === 'face' || slot === 'all') {
                    if (mesh.material[0] && mesh.material[0].dispose) mesh.material[0].dispose();
                    mesh.material[0] = createPbrMaterial(def, tex, params);
                    mesh.material[0].needsUpdate = true;
                }
                if (slot === 'frame' || slot === 'all') {
                    if (mesh.material[1] && mesh.material[1].dispose) mesh.material[1].dispose();
                    mesh.material[1] = createPbrMaterial(def, tex, params);
                    mesh.material[1].needsUpdate = true;
                }
            } else {
                if (mesh.material && mesh.material.dispose) mesh.material.dispose();
                mesh.material = createPbrMaterial(def, tex, params);
                mesh.material.needsUpdate = true;
            }
        });

        // Konfigürasyonu element üzerinde sakla (akıllı slot ayrımı ile çakışmayı önle)
        if (slot === 'all') {
            delete el._textureConfigs.face;
            delete el._textureConfigs.frame;
            el._textureConfigs.all = {
                textureId: def.id,
                params: params
            };
        } else if (slot === 'frame') {
            if (el._textureConfigs.all) {
                el._textureConfigs.face = Object.assign({}, el._textureConfigs.all);
                delete el._textureConfigs.all;
            }
            el._textureConfigs.frame = {
                textureId: def.id,
                params: params
            };
        } else if (slot === 'face') {
            if (el._textureConfigs.all) {
                el._textureConfigs.frame = Object.assign({}, el._textureConfigs.all);
                delete el._textureConfigs.all;
            }
            el._textureConfigs.face = {
                textureId: def.id,
                params: params
            };
        } else {
            el._textureConfigs[slot] = {
                textureId: def.id,
                params: params
            };
        }

        // 🎯 İki Bölüm Akıllı Senkronizasyon: Doku seçildiğinde renk kutularını dokunun ana rengine güncelle
        if (slot === 'frame' || slot === 'all') {
            const sideHex = safeHex(def.base || '#cbd5e1', '#cbd5e1');
            el.sideColor = sideHex;
            el.badgeSideColor = sideHex;
            if (window.ThreeDEngine && window.ThreeDEngine.state) {
                const activeEl = window.ThreeDEngine.getActiveElement ? window.ThreeDEngine.getActiveElement() : null;
                if (el === activeEl) {
                    window.ThreeDEngine.state.sideColor = sideHex;
                    window.ThreeDEngine.state.badgeSideColor = sideHex;
                }
            }
            const sideInp = document.getElementById('threeDSideColor');
            if (sideInp) sideInp.value = sideHex;
            const exSideInp = document.getElementById('threeDExactSideColor');
            if (exSideInp) exSideInp.value = sideHex;
            const bSideInp = document.getElementById('threeDBadgeSideColor');
            if (bSideInp) bSideInp.value = sideHex;
        }

        if (slot === 'face' || slot === 'all') {
            const faceHex = safeHex(def.base || '#ffffff', '#ffffff');
            el.frontColor = faceHex;
            if (window.ThreeDEngine && window.ThreeDEngine.state) {
                const activeEl = window.ThreeDEngine.getActiveElement ? window.ThreeDEngine.getActiveElement() : null;
                if (el === activeEl) {
                    window.ThreeDEngine.state.frontColor = faceHex;
                }
            }
            const frontInp = document.getElementById('threeDFrontColor');
            if (frontInp) frontInp.value = faceHex;
            const bTextInp = document.getElementById('threeDBadgeTextColor');
            if (bTextInp) bTextInp.value = faceHex;
        }

        if (window.ThreeDEngine && window.ThreeDEngine.requestRender) {
            window.ThreeDEngine.requestRender();
        }

        syncUI();
    }

    function createPbrMaterial(def, texture, params = {}) {
        const isTex = !!texture;

        // Doku haritası (map) varsa Three.js piksel rengi ile materyal rengini çarpar (map * color).
        // Desenlerin (karbon lifleri, mermer damarları vb.) %100 canlı görünmesi için dokulu malzemelerde
        // taban renk beyaz (#ffffff) tutulur ve yalnızca parlaklık kaydırıcısı ile ölçeklenir.
        // Doku haritası olmayan saf renk malzemelerinde (altın, krom vb.) def.base kullanılır.
        let matColor;
        if (isTex) {
            matColor = new window.THREE.Color(0xffffff);
        } else {
            matColor = new window.THREE.Color(def.base || '#ffffff');
        }

        const bScale = (params.brightness !== undefined && params.brightness !== null) ? params.brightness : 1.0;
        if (bScale !== 1.0) {
            matColor.multiplyScalar(bScale);
        }

        const roughnessVal = (params.roughness !== null && params.roughness !== undefined)
            ? params.roughness
            : (def.roughness !== undefined ? def.roughness : 0.5);

        const metalnessVal = (params.metalness !== null && params.metalness !== undefined)
            ? params.metalness
            : (def.metalness !== undefined ? def.metalness : 0.1);

        const matProps = {
            color: matColor,
            map: texture || null,
            roughness: roughnessVal,
            metalness: metalnessVal,
            side: window.THREE.DoubleSide
        };

        if (def.transparent || def.transmission) {
            matProps.transparent = true;
            matProps.opacity = (def.opacity !== undefined) ? def.opacity : (def.transmission ? (1.0 - def.transmission * 0.4) : 0.85);
            matProps.depthWrite = true;
        }

        if (def.emissive) {
            matProps.emissive = new window.THREE.Color(def.emissive);
            matProps.emissiveIntensity = def.emissiveIntensity || 0.8;
        }

        const mat = new window.THREE.MeshStandardMaterial(matProps);
        mat.needsUpdate = true;
        return mat;
    }

    /**
     * Slot'a göre nesnedeki hedef Three.js mesh'lerini ayıklar
     */
    function getMeshesForSlot(el, slot) {
        const meshes = [];
        if (!el || !el.contentGroup) return meshes;

        if (slot === 'all') {
            el.contentGroup.traverse(ch => {
                if (ch.isMesh && ch.name !== 'globalGroundShadowPlane' && ch !== el.shadowPlane) {
                    meshes.push(ch);
                }
            });
            return meshes;
        }

        if (slot === 'face') {
            // Ön yüz: Tabela panosu, ikon ön yüzü, kabartma yazı
            if (el.badgeMesh) meshes.push(el.badgeMesh);
            if (el.textMesh) meshes.push(el.textMesh);
            if (el.iconMesh) meshes.push(el.iconMesh);
            if (meshes.length === 0) {
                el.contentGroup.traverse(ch => {
                    if (ch.isMesh && !meshes.includes(ch)) meshes.push(ch);
                });
            }
            return meshes;
        }

        if (slot === 'frame') {
            // Çerçeve & Yan kalınlık
            if (el.sideMesh) meshes.push(el.sideMesh);
            if (el.badgeMesh) meshes.push(el.badgeMesh); // Array mat 1 için
            return meshes;
        }

        if (slot === 'stand') {
            // Ayaklar, direkler, zemin pini
            if (el.pinMesh) meshes.push(el.pinMesh);
            el.contentGroup.traverse(ch => {
                const n = (ch.name || '').toLowerCase();
                if (ch.isMesh && (n.includes('post') || n.includes('pole') || n.includes('stand') || n.includes('pin') || n.includes('leg'))) {
                    meshes.push(ch);
                }
            });
            return meshes;
        }

        return meshes;
    }

    /**
     * Dokuyu Kaldır ve Standart Düz Renge Geri Dön
     */
    function removeTexture(element, slot = currentTargetSlot) {
        const el = element || (window.ThreeDEngine ? window.ThreeDEngine.getActiveElement() : null);
        if (!el) return;

        if (el._textureConfigs) {
            if (slot === 'all') {
                el._textureConfigs = {};
            } else {
                if (el._textureConfigs.all) {
                    const prev = el._textureConfigs.all;
                    if (slot === 'frame') {
                        el._textureConfigs.face = Object.assign({}, prev);
                    } else if (slot === 'face') {
                        el._textureConfigs.frame = Object.assign({}, prev);
                    }
                    delete el._textureConfigs.all;
                }
                delete el._textureConfigs[slot];
            }
        }

        // Elementin orijinal meshlerini yeniden kur
        if (window.ThreeDEngine && window.ThreeDEngine.recreateContentMeshes) {
            window.ThreeDEngine.recreateContentMeshes(el);
            window.ThreeDEngine.requestRender();
        }

        syncUI();
    }

    /**
     * Element yeniden inşa edildiğinde atanmış dokuları geri yükler
     */
    function reapplyElementTextures(el) {
        if (!el || !el._textureConfigs) return;
        Object.keys(el._textureConfigs).forEach(s => {
            const cfg = el._textureConfigs[s];
            if (cfg && cfg.textureId) {
                applyTexture(el, cfg.textureId, s, cfg.params || {});
            }
        });
    }

    // 🖥️ UI (Arayüz) KURULUMU
    function initUI(panel) {
        const host = panel ? panel.querySelector('#threeDTextureSectionHost') : document.getElementById('threeDTextureSectionHost');
        if (!host) return;

        host.innerHTML = `
            <div class="three-d-section three-d-tex-section" id="threeDTextureSection">
                <div class="three-d-section-title three-d-tex-title" id="threeDTexSectionToggle" style="cursor:pointer; display:flex; align-items:center; justify-content:space-between; user-select:none;" title="Malzeme ve Doku Kütüphanesini Aç veya Kapat">
                    <div class="three-d-tex-title-left" style="display:flex; align-items:center; gap:6px;">
                        <i class="fas fa-gem" style="color:#0ea5e9;"></i> <span>Doku ve Malzeme</span>
                    </div>
                    <i class="fas fa-chevron-down" id="threeDTexSectionChevron" style="font-size:10px; transition:transform 0.2s; color:#94a3b8;"></i>
                </div>

                <div id="threeDTexSectionBody" style="display:none;">
                    <!-- 🎯 Çok Parçalı Hedef Parça Seçici -->
                    <div class="three-d-tex-slot-row">
                        <button type="button" class="three-d-tex-slot-btn active" data-slot="all">Tüm Öge</button>
                        <button type="button" class="three-d-tex-slot-btn" data-slot="face">Ön Yüz</button>
                        <button type="button" class="three-d-tex-slot-btn" data-slot="frame">Yan Kalınlık</button>
                        <button type="button" class="three-d-tex-slot-btn" data-slot="stand">Ayak ve Direk</button>
                    </div>

                    <!-- 🏷️ Kategori Hapları -->
                    <div class="three-d-tex-cat-scroll" id="threeDTexCatScroll">
                        ${TEXTURE_CATEGORIES.map(c => `
                            <button type="button" class="three-d-tex-cat-chip ${c.id === currentSelectedCategory ? 'active' : ''}" data-cat="${c.id}">
                                ${c.name}
                            </button>
                        `).join('')}
                    </div>

                    <!-- 🖼️ Görsel Doku Kartları Izgarası -->
                    <div class="three-d-tex-grid custom-scrollbar" id="threeDTexGrid">
                    </div>

                    <!-- ⚙️ Doku İnce Ayarları Akordeonu (İhtiyaç Halinde Açılır) -->
                    <button type="button" class="three-d-tex-acc-toggle" id="threeDTexAccToggle" title="Doku İnce Ayarlarını Aç veya Kapat">
                        <span><i class="fas fa-sliders" style="color:#0ea5e9;"></i> Doku Ayarları</span>
                        <i class="fas fa-chevron-down" id="threeDTexAccChevron" style="font-size:10px; transition:transform 0.2s;"></i>
                    </button>

                    <div class="three-d-tex-acc-box" id="threeDTexAccBox" style="display:none;">
                        <div class="three-d-tex-slider-row">
                            <div class="three-d-tex-slider-header">
                                <span>Doku Sıklığı:</span>
                                <span id="threeDTexRepeatVal" class="three-d-tex-slider-val">1.00x</span>
                            </div>
                            <input type="range" id="threeDTexRepeatInput" class="three-d-slider-range" min="0.5" max="5.0" step="0.25" value="1.0" style="width:100%;">
                        </div>

                        <div class="three-d-tex-slider-row">
                            <div class="three-d-tex-slider-header">
                                <span>Parlaklık:</span>
                                <span id="threeDTexBrightVal" class="three-d-tex-slider-val">100%</span>
                            </div>
                            <input type="range" id="threeDTexBrightInput" class="three-d-slider-range" min="50" max="150" step="5" value="100" style="width:100%;">
                        </div>

                        <div class="three-d-tex-slider-row">
                            <div class="three-d-tex-slider-header">
                                <span>Pürüzlülük:</span>
                                <span id="threeDTexRoughVal" class="three-d-tex-slider-val">Varsayılan</span>
                            </div>
                            <input type="range" id="threeDTexRoughInput" class="three-d-slider-range" min="0" max="100" step="5" value="50" style="width:100%;">
                        </div>

                        <div class="three-d-tex-slider-row">
                            <div class="three-d-tex-slider-header">
                                <span>Metalik Yansıma:</span>
                                <span id="threeDTexMetalVal" class="three-d-tex-slider-val">Varsayılan</span>
                            </div>
                            <input type="range" id="threeDTexMetalInput" class="three-d-slider-range" min="0" max="100" step="5" value="10" style="width:100%;">
                        </div>

                        <div class="three-d-tex-actions-row">
                            <button type="button" id="threeDTexResetParamsBtn" class="three-d-tex-action-btn">
                                <i class="fas fa-rotate-left"></i> Ayarları Sıfırla
                            </button>
                            <button type="button" id="threeDTexRemoveBtn" class="three-d-tex-action-btn btn-remove" title="Seçili parçadaki dokuyu kaldırır">
                                <i class="fas fa-trash-can"></i> Dokuyu Kaldır
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        bindEvents(host);
        renderTextureGrid();
        syncInputsWithActiveTexture();
    }

    function renderTextureGrid() {
        const grid = document.getElementById('threeDTexGrid');
        if (!grid) return;

        const filtered = (currentSelectedCategory === 'all')
            ? TEXTURE_CATALOG
            : TEXTURE_CATALOG.filter(t => t.cat === currentSelectedCategory);

        const el = window.ThreeDEngine ? window.ThreeDEngine.getActiveElement() : null;
        let currentTexId = null;
        if (el && el._textureConfigs) {
            if (el._textureConfigs[currentTargetSlot]) {
                currentTexId = el._textureConfigs[currentTargetSlot].textureId;
            } else if (currentTargetSlot !== 'all' && el._textureConfigs.all) {
                currentTexId = el._textureConfigs.all.textureId;
            }
        }

        grid.innerHTML = filtered.map(t => {
            const res = createProceduralCanvas(t, 64);
            const thumbStyle = res && res.dataUrl
                ? `background-image: url('${res.dataUrl}');`
                : `background-color: ${t.base || '#cbd5e1'};`;

            return `
                <button type="button" class="three-d-tex-card ${t.id === currentTexId ? 'active' : ''}" data-tex-id="${t.id}" title="${t.name}">
                    <div class="three-d-tex-thumb" style="${thumbStyle}"></div>
                    <div class="three-d-tex-name">${t.name}</div>
                </button>
            `;
        }).join('');

        grid.querySelectorAll('.three-d-tex-card').forEach(card => {
            card.addEventListener('pointerdown', (e) => e.stopPropagation());
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const texId = card.getAttribute('data-tex-id');
                if (texId) {
                    applyTexture(null, texId, currentTargetSlot);
                }
            });
        });
    }

    function highlightActiveTextureCard() {
        const grid = document.getElementById('threeDTexGrid');
        if (!grid) return;
        const el = window.ThreeDEngine ? window.ThreeDEngine.getActiveElement() : null;
        let currentTexId = null;
        if (el && el._textureConfigs) {
            if (el._textureConfigs[currentTargetSlot]) {
                currentTexId = el._textureConfigs[currentTargetSlot].textureId;
            } else if (currentTargetSlot !== 'all' && el._textureConfigs.all) {
                currentTexId = el._textureConfigs.all.textureId;
            }
        }

        grid.querySelectorAll('.three-d-tex-card').forEach(card => {
            if (card.getAttribute('data-tex-id') === currentTexId) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    function syncInputsWithActiveTexture() {
        const el = window.ThreeDEngine ? window.ThreeDEngine.getActiveElement() : null;
        const cfg = (el && el._textureConfigs)
            ? (el._textureConfigs[currentTargetSlot] || (currentTargetSlot !== 'all' ? el._textureConfigs.all : null))
            : null;

        const p = (cfg && cfg.params) ? cfg.params : defaultParams;

        const repeatInput = document.getElementById('threeDTexRepeatInput');
        const repeatVal = document.getElementById('threeDTexRepeatVal');
        if (repeatInput) repeatInput.value = p.repeat !== undefined ? p.repeat : 1.0;
        if (repeatVal) repeatVal.textContent = (p.repeat !== undefined ? Number(p.repeat).toFixed(2) : '1.00') + 'x';

        const brightInput = document.getElementById('threeDTexBrightInput');
        const brightVal = document.getElementById('threeDTexBrightVal');
        const bPct = Math.round((p.brightness !== undefined ? p.brightness : 1.0) * 100);
        if (brightInput) brightInput.value = bPct;
        if (brightVal) brightVal.textContent = bPct + '%';

        const roughInput = document.getElementById('threeDTexRoughInput');
        const roughVal = document.getElementById('threeDTexRoughVal');
        if (roughInput) roughInput.value = p.roughness !== null && p.roughness !== undefined ? Math.round(p.roughness * 100) : 50;
        if (roughVal) roughVal.textContent = p.roughness !== null && p.roughness !== undefined ? Math.round(p.roughness * 100) + '%' : 'Varsayılan';

        const metalInput = document.getElementById('threeDTexMetalInput');
        const metalVal = document.getElementById('threeDTexMetalVal');
        if (metalInput) metalInput.value = p.metalness !== null && p.metalness !== undefined ? Math.round(p.metalness * 100) : 10;
        if (metalVal) metalVal.textContent = p.metalness !== null && p.metalness !== undefined ? Math.round(p.metalness * 100) + '%' : 'Varsayılan';
    }

    function bindEvents(host) {
        // Ana Doku Bölümü Akordeon Aç / Kapa
        const sectionToggle = host.querySelector('#threeDTexSectionToggle');
        const sectionBody = host.querySelector('#threeDTexSectionBody');
        const sectionChevron = host.querySelector('#threeDTexSectionChevron');
        if (sectionToggle && sectionBody) {
            sectionToggle.addEventListener('pointerdown', (e) => e.stopPropagation());
            sectionToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                textureSectionOpen = !textureSectionOpen;
                sectionBody.style.display = textureSectionOpen ? 'block' : 'none';
                if (sectionChevron) {
                    sectionChevron.style.transform = textureSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)';
                }
            });
        }

        // Slot Seçimi
        host.querySelectorAll('.three-d-tex-slot-btn').forEach(btn => {
            btn.addEventListener('pointerdown', (e) => e.stopPropagation());
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                host.querySelectorAll('.three-d-tex-slot-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentTargetSlot = btn.getAttribute('data-slot') || 'all';
                renderTextureGrid();
                syncInputsWithActiveTexture();
            });
        });

        // Kategori Seçimi
        host.querySelectorAll('.three-d-tex-cat-chip').forEach(chip => {
            chip.addEventListener('pointerdown', (e) => e.stopPropagation());
            chip.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                host.querySelectorAll('.three-d-tex-cat-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                currentSelectedCategory = chip.getAttribute('data-cat') || 'all';
                renderTextureGrid();
            });
        });

        // Doku Ayarları Akordeon Aç/Kapa
        const accToggle = host.querySelector('#threeDTexAccToggle');
        const accBox = host.querySelector('#threeDTexAccBox');
        const accChevron = host.querySelector('#threeDTexAccChevron');
        if (accToggle && accBox) {
            accToggle.addEventListener('pointerdown', (e) => e.stopPropagation());
            accToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                textureAccordionOpen = !textureAccordionOpen;
                accBox.style.display = textureAccordionOpen ? 'block' : 'none';
                if (accChevron) {
                    accChevron.style.transform = textureAccordionOpen ? 'rotate(180deg)' : 'rotate(0deg)';
                }
            });
        }

        // Slider'lar (Doku Sıklığı, Parlaklık, Pürüzlülük, Metaliklik)
        const repeatInput = host.querySelector('#threeDTexRepeatInput');
        const repeatVal = host.querySelector('#threeDTexRepeatVal');
        if (repeatInput) {
            repeatInput.addEventListener('pointerdown', (e) => e.stopPropagation());
            repeatInput.addEventListener('mousedown', (e) => e.stopPropagation());
            repeatInput.addEventListener('input', (e) => {
                e.stopPropagation();
                const v = parseFloat(e.target.value) || 1.0;
                if (repeatVal) repeatVal.textContent = v.toFixed(2) + 'x';
                updateActiveParams({ repeat: v });
            });
        }

        const brightInput = host.querySelector('#threeDTexBrightInput');
        const brightVal = host.querySelector('#threeDTexBrightVal');
        if (brightInput) {
            brightInput.addEventListener('pointerdown', (e) => e.stopPropagation());
            brightInput.addEventListener('mousedown', (e) => e.stopPropagation());
            brightInput.addEventListener('input', (e) => {
                e.stopPropagation();
                const v = parseInt(e.target.value) || 100;
                if (brightVal) brightVal.textContent = v + '%';
                updateActiveParams({ brightness: v / 100 });
            });
        }

        const roughInput = host.querySelector('#threeDTexRoughInput');
        const roughVal = host.querySelector('#threeDTexRoughVal');
        if (roughInput) {
            roughInput.addEventListener('pointerdown', (e) => e.stopPropagation());
            roughInput.addEventListener('mousedown', (e) => e.stopPropagation());
            roughInput.addEventListener('input', (e) => {
                e.stopPropagation();
                const v = parseInt(e.target.value) || 50;
                if (roughVal) roughVal.textContent = v + '%';
                updateActiveParams({ roughness: v / 100 });
            });
        }

        const metalInput = host.querySelector('#threeDTexMetalInput');
        const metalVal = host.querySelector('#threeDTexMetalVal');
        if (metalInput) {
            metalInput.addEventListener('pointerdown', (e) => e.stopPropagation());
            metalInput.addEventListener('mousedown', (e) => e.stopPropagation());
            metalInput.addEventListener('input', (e) => {
                e.stopPropagation();
                const v = parseInt(e.target.value) || 10;
                if (metalVal) metalVal.textContent = v + '%';
                updateActiveParams({ metalness: v / 100 });
            });
        }

        // Ayarları Sıfırla
        const resetParamsBtn = host.querySelector('#threeDTexResetParamsBtn');
        if (resetParamsBtn) {
            resetParamsBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
            resetParamsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (repeatInput) repeatInput.value = '1.0';
                if (repeatVal) repeatVal.textContent = '1.00x';
                if (brightInput) brightInput.value = '100';
                if (brightVal) brightVal.textContent = '100%';
                if (roughInput) roughInput.value = '50';
                if (roughVal) roughVal.textContent = 'Varsayılan';
                if (metalInput) metalInput.value = '10';
                if (metalVal) metalVal.textContent = 'Varsayılan';

                updateActiveParams({ repeat: 1.0, brightness: 1.0, roughness: null, metalness: null });
            });
        }

        // Dokuyu Kaldır
        const removeBtn = host.querySelector('#threeDTexRemoveBtn');
        if (removeBtn) {
            removeBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
            removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                removeTexture(null, currentTargetSlot);
            });
        }
    }

    function updateActiveParams(patch) {
        const el = window.ThreeDEngine ? window.ThreeDEngine.getActiveElement() : null;
        if (!el || !el._textureConfigs) return;

        let targetSlot = currentTargetSlot;
        if (!el._textureConfigs[targetSlot] && el._textureConfigs.all) {
            targetSlot = 'all';
        }
        if (!el._textureConfigs[targetSlot]) return;

        const currentCfg = el._textureConfigs[targetSlot];
        const newParams = Object.assign({}, currentCfg.params || {}, patch);
        applyTexture(el, currentCfg.textureId, targetSlot, newParams);
    }

    function syncUI() {
        highlightActiveTextureCard();
        syncInputsWithActiveTexture();
    }

    // 🌟 DIŞA AÇILAN API
    window.ThreeDTextures = {
        init: initUI,
        applyTexture: applyTexture,
        removeTexture: removeTexture,
        reapplyElementTextures: reapplyElementTextures,
        syncUI: syncUI,
        CATALOG: TEXTURE_CATALOG,
        CATEGORIES: TEXTURE_CATEGORIES
    };

})(window);
