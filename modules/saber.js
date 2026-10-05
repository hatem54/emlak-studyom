// ================================================================
// ⚡ EMLAK STÜDYOM - SABER EFFECT ENGINE
// After Effects Saber benzeri profesyonel efekt motoru
// PixiJS + WebGL tabanlı
// ================================================================

window.SaberEngine = (function() {
    let app = null;
    let container = null;
    let sabers = []; // Aktif saber'lar
    let animationTicker = null;
    let currentPreset = 'fully-lit';
    
    // Varsayılan ayarlar
    const defaults = {
        preset: 'fully-lit',
        coreColor: 0x00CEC9,      // İç renk (turkuaz/mavi)
        glowColor: 0x00CEC9,      // Dış parlama (turkuaz/mavi)
        coreSize: 0,               // İç akkor çekirdek (0 = saf doygun cam neon tüpü)
        glowSize: 22,              // Dış parlama boyutu
        intensity: 2.4,            // Parlama şiddeti
        groundSpill: 0,            // Zemin ışığı sisi kapalı (iç alan berrak)
        energyNodes: false,        // Işıklı köşe pinleri (varsayılan kapalı)
        flickerAmount: 0.02,       // Titreme
        pulseSpeed: 0,             // Nabız hızı (0=kapalı)
        distortionAmount: 0,       // Bozulma (geometrik çizimlerde bozulma kapalı)
        segments: 50               // Çizgi segmentleri
    };
    
    // ⚡ PRESET TANIMLARI
    const presets = {
        'fully-lit': {
            name: 'Fully Lit',
            icon: '✨',
            settings: { 
                glowSize: 22, intensity: 2.4, flickerAmount: 0.02, 
                pulseSpeed: 0, distortionAmount: 0,
                coreColor: 0x00CEC9, glowColor: 0x00CEC9,
                coreSize: 0, energyNodes: false
            }
        },
        'full-neon': {
            name: 'Full Neon',
            icon: '💧',
            settings: { 
                glowSize: 35, intensity: 3.2, flickerAmount: 0.02, 
                pulseSpeed: 0, distortionAmount: 0,
                coreColor: 0xFFFFFF, glowColor: 0x00D2FF,
                coreSize: 4
            }
        },
        'electric': {
            name: 'Electric',
            icon: '⚡',
            settings: { 
                glowSize: 28, intensity: 3, flickerAmount: 0.08, 
                pulseSpeed: 1, distortionAmount: 0,
                coreColor: 0xEEFFFF, glowColor: 0x4488FF,
                coreSize: 4
            }
        },
        'fire': {
            name: 'Fire',
            icon: '🔥',
            settings: { 
                glowSize: 38, intensity: 3.2, flickerAmount: 0.08, 
                pulseSpeed: 1, distortionAmount: 0,
                coreColor: 0xFFFFCC, glowColor: 0xFF4400,
                coreSize: 4
            }
        },
        'sparks': {
            name: 'Sparks',
            icon: '💫',
            settings: { 
                glowSize: 22, intensity: 3.5, flickerAmount: 0.1, 
                pulseSpeed: 1, distortionAmount: 0,
                coreColor: 0xFFFFCC, glowColor: 0xFFAA00,
                coreSize: 3
            }
        },
        'energize': {
            name: 'Energize',
            icon: '🎯',
            settings: { 
                glowSize: 35, intensity: 3, flickerAmount: 0.05, 
                pulseSpeed: 1.5, distortionAmount: 0,
                coreColor: 0xFFFFFF, glowColor: 0x00FF44,
                coreSize: 4
            }
        },
        'sine': {
            name: 'Sine Wave',
            icon: '🌊',
            settings: { 
                glowSize: 28, intensity: 2.8, flickerAmount: 0.03, 
                pulseSpeed: 1.5, distortionAmount: 0,
                coreColor: 0xFFFFFF, glowColor: 0x00CEC9,
                coreSize: 4
            }
        },
        'vortex': {
            name: 'Vortex',
            icon: '🌪️',
            settings: { 
                glowSize: 32, intensity: 3.2, flickerAmount: 0.05, 
                pulseSpeed: 2, distortionAmount: 0,
                coreColor: 0xFFEEFF, glowColor: 0xAA00FF,
                coreSize: 4
            }
        },
        'liquid': {
            name: 'Liquid',
            icon: '💧',
            settings: { 
                glowSize: 40, intensity: 2.5, flickerAmount: 0.01, 
                pulseSpeed: 1, distortionAmount: 0,
                coreColor: 0xEEFFFF, glowColor: 0x00AAFF,
                coreSize: 4
            }
        },
        'lightning': {
            name: 'Lightning',
            icon: '⚡',
            settings: { 
                glowSize: 25, intensity: 3.8, flickerAmount: 0.15, 
                pulseSpeed: 1, distortionAmount: 0,
                coreColor: 0xFFFFFF, glowColor: 0xBB88FF,
                coreSize: 3
            }
        },
        'rainbow': {
            name: 'Rainbow',
            icon: '🌈',
            settings: { 
                glowSize: 35, intensity: 3, flickerAmount: 0.03, 
                pulseSpeed: 1, distortionAmount: 0, rainbow: true,
                coreColor: 0xFFFFFF, glowColor: 0xFF0088,
                coreSize: 4
            }
        }
    };
    
    // 🎨 HAZIR RENK PALETİ
    const colorPresets = {
        'kirmizi':  { core: 0xFFFFFF, glow: 0xFF0044 },
        'yesil':    { core: 0xFFFFFF, glow: 0x00FF44 },
        'mavi':     { core: 0xFFFFFF, glow: 0x0088FF },
        'altin':    { core: 0xFFFFCC, glow: 0xFFB800 },
        'mor':      { core: 0xFFFFFF, glow: 0xAA00FF },
        'turkuaz':  { core: 0xFFFFFF, glow: 0x00CEC9 },
        'pembe':    { core: 0xFFFFFF, glow: 0xFF00AA },
        'beyaz':    { core: 0xFFFFFF, glow: 0xFFFFFF }
    };
    
    // 🚀 MOTORU BAŞLAT
    function init(canvasContainer) {
        if (app) return; // Zaten başlatılmış
        
        const dc = document.getElementById('draw-layer') || document.getElementById('drawCanvas');
        const w = (dc && dc.width) ? dc.width : (canvasContainer.offsetWidth || 1920);
        const h = (dc && dc.height) ? dc.height : (canvasContainer.offsetHeight || 1080);
        
        app = new PIXI.Application({
            width: w,
            height: h,
            transparent: true,
            backgroundAlpha: 0,
            antialias: true,
            resolution: 1,
            autoDensity: true,
            preserveDrawingBuffer: true,
            autoStart: false // 🌟 GPU ve pil tasarrufu: Otomatik 60 FPS döngüsünü engelle
        });
        
        app.view.style.position = 'absolute';
        app.view.style.top = '0';
        app.view.style.left = '0';
        app.view.style.width = '100%';
        app.view.style.height = '100%';
        app.view.style.pointerEvents = 'none';
        app.view.style.zIndex = '55'; // Template layer'larının ve çizimlerin (50) üzerinde
        app.view.id = 'saber-layer';
        
        canvasContainer.appendChild(app.view);
        
        container = new PIXI.Container();
        app.stage.addChild(container);
        const textContainer = new PIXI.Container();
        app.stage.addChild(textContainer);
        app.textContainer = textContainer;
        app.textObjects = {};
        
        // Animasyon ticker (Yalnızca canlı animasyon aktifken çalışır, statik modda kesinlikle uyur)
        app.ticker.add(animate);
        const isAnimActive = (typeof window !== 'undefined' && window.isExportingVideo) || ((typeof window.isSaberAnimationActive === 'function')
            ? window.isSaberAnimationActive()
            : (typeof document !== 'undefined' && document.body && document.body.classList.contains('saber-animation-active')));
        if (!isAnimActive) {
            if (app.ticker && app.ticker.started) app.ticker.stop();
        } else {
            if (app.ticker && !app.ticker.started) app.ticker.start();
        }
        
        return app;
    }
    
    // ═══════════════════════════════════════
    // 🎨 PATH NOKTALARINI ÇİZ (Düz, Kesikli veya Noktalı)
    // ═══════════════════════════════════════
    function renderPathPoints(targetLine, pts, dashStyle) {
        if (!pts || pts.length === 0) return;
        if (!dashStyle || dashStyle === 'solid') {
            targetLine.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) {
                if (pts[i].moveTo) {
                    targetLine.moveTo(pts[i].x, pts[i].y);
                } else {
                    targetLine.lineTo(pts[i].x, pts[i].y);
                }
            }
            return;
        }
        
        const isDotted = dashStyle === 'dotted';
        const dashLen = isDotted ? 6 : 24;
        const gapLen = isDotted ? 12 : 14;
        
        let isDrawing = true;
        let remaining = dashLen;
        let curX = pts[0].x;
        let curY = pts[0].y;
        targetLine.moveTo(curX, curY);
        
        for (let i = 1; i < pts.length; i++) {
            if (pts[i].moveTo) {
                curX = pts[i].x;
                curY = pts[i].y;
                targetLine.moveTo(curX, curY);
                isDrawing = true;
                remaining = dashLen;
                continue;
            }
            const targetX = pts[i].x;
            const targetY = pts[i].y;
            if (pts[i].solid) {
                targetLine.lineTo(targetX, targetY);
                curX = targetX;
                curY = targetY;
                continue;
            }
            let segDist = Math.hypot(targetX - curX, targetY - curY);
            if (segDist < 0.001) continue;
            
            const dirX = (targetX - curX) / segDist;
            const dirY = (targetY - curY) / segDist;
            
            while (segDist > 0) {
                if (segDist <= remaining) {
                    curX = targetX;
                    curY = targetY;
                    if (isDrawing) targetLine.lineTo(curX, curY);
                    else targetLine.moveTo(curX, curY);
                    remaining -= segDist;
                    segDist = 0;
                } else {
                    curX += dirX * remaining;
                    curY += dirY * remaining;
                    if (isDrawing) targetLine.lineTo(curX, curY);
                    else targetLine.moveTo(curX, curY);
                    segDist -= remaining;
                    isDrawing = !isDrawing;
                    remaining = isDrawing ? dashLen : gapLen;
                }
            }
        }
    }

    // 🎨 SABER ÇİZGİSİ EKLE
    function drawSaberLine(points, options = {}) {
        if (!app) return null;
        
        // 1. Varsayılanlar
        const opts = Object.assign({}, defaults);
        // 2. Preset'i uygula (preset varsayılanı ezer)
        const preset = presets[options.preset || 'fully-lit'] || presets['fully-lit'];
        Object.assign(opts, preset.settings);
        // 3. Kullanıcının verdiği options preset'i EZER (öncelikli)
        Object.assign(opts, options);
        // Rainbow özel bayrağını preset'ten koru
        if (preset.settings.rainbow) opts.rainbow = true;
        
        // Ana çizgi (neon tüp gövdesi + akkor iç çekirdek)
        const line = new PIXI.Graphics();

        // 1. Neon tüp gövdesi (doygun, renkli parlak ana neon tüpü)
        const coreSizeVal = (opts.coreSize !== undefined && opts.coreSize !== null) ? Number(opts.coreSize) : 0;
        const tubeThickness = Math.max(2, coreSizeVal + 3);
        line.lineStyle(tubeThickness, opts.glowColor, 0.95);
        renderPathPoints(line, points, opts.dashStyle);

        // 2. Akkor iç çekirdek (SADECE kullanıcı akkor çekirdek slider'ını açtıysa çizilir)
        if (coreSizeVal > 0) {
            const coreThickness = Math.max(1, Math.round(coreSizeVal * 0.5));
            const coreAlpha = Math.min(0.65, 0.25 + (coreSizeVal / 30) * 0.4);
            line.lineStyle(coreThickness, opts.coreColor || opts.glowColor, coreAlpha);
            renderPathPoints(line, points, opts.dashStyle);
        }
        
        // 3. Işıklı Köşe Pinleri (Energy Nodes)
        // Yalnızca basit geometrik poligonlarda (3-8 köşe veya rect) ve energyNodes aktifse çizilir
        const isCurvedOrFree = opts.pathType === 'circle' || opts.pathType === 'free' || opts.shapeType === 'circle' || opts.shapeType === 'free' || opts.isCircle || opts.isFree;
        const isSimplePoly = (opts.pathType === 'polygon' || opts.pathType === 'rect') && points.length >= 3 && points.length <= 8;
        if (opts.energyNodes === true && !isCurvedOrFree && isSimplePoly) {
            const pinRadius = Math.max(3, (opts.coreSize || 0) + 2.5);
            for (let i = 0; i < points.length; i++) {
                // SADECE TEK RENK SAF DOYGUN PİN (SIFIR BEYAZ İZ)
                line.beginFill(opts.glowColor, 1.0);
                line.drawCircle(points[i].x, points[i].y, pinRadius);
                line.endFill();
            }
        }
        
        // Glow filtreleri (Odaklı, Net Dış Neon Parlaması - İç alan berrak)
        const safeGlowSize = Math.max(5, Math.min(150, opts.glowSize !== undefined ? opts.glowSize : 22));
        const glowFilter = new PIXI.filters.GlowFilter({
            distance: safeGlowSize,
            outerStrength: Math.max(0.5, Math.min(10, opts.intensity !== undefined ? opts.intensity : 2.4)),
            innerStrength: 0, // İçeriye sis yayılmasını engelle, iç alan temiz kalsın
            color: opts.glowColor,
            quality: 0.25 // Net, pürüzsüz ve canlı neon halesi
        });
        
        line.filters = [glowFilter];
        
        // Partikül container (Partiküller PIXI.BLEND_MODES.ADD ile zaten parlak ışık gibi harmanlanır; ek tam ekran filtre kaldırıldı)
        const particleContainer = new PIXI.Container();
        const presetName = options.preset || 'fully-lit';
        
        // Lightning dalları için ayrı container
        const branchContainer = new PIXI.Container();
        
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        if (points && points.length > 0) {
            for (let i = 0; i < points.length; i++) {
                const pt = points[i];
                if (pt.x < minX) minX = pt.x;
                if (pt.x > maxX) maxX = pt.x;
                if (pt.y < minY) minY = pt.y;
                if (pt.y > maxY) maxY = pt.y;
            }
        }
        const centerX = isFinite(minX) ? (minX + maxX) / 2 : 0;
        const centerY = isFinite(minY) ? (minY + maxY) / 2 : 0;

        // Saber verisini sakla (animasyon için)
        const saberData = {
            graphics: line,
            particleContainer: particleContainer,
            branchContainer: branchContainer,
            particles: [],
            branches: [],
            points: points,
            options: opts,
            time: 0,
            baseIntensity: opts.intensity,
            filter: glowFilter,
            spillFilter: null,
            presetName: options.preset || 'fully-lit',
            centerX: centerX,
            centerY: centerY,
            rotation: 0,
            scale: 1,
            dx: 0,
            dy: 0
        };
        
        sabers.push(saberData);
        container.addChild(line);
        container.addChild(particleContainer);
        container.addChild(branchContainer);
        
        return saberData;
    }
    
    // 🎬 ANİMASYON DÖNGÜSÜ
    function animate(delta) {
        if (typeof updateTextSaberPositions === 'function') updateTextSaberPositions();
        
        // Animasyon toggle'ı kapalıysa kesinlikle hareket/titreme yapma! (Video export istisnası)
        const isAnimActive = (typeof window !== 'undefined' && window.isExportingVideo) || ((typeof window.isSaberAnimationActive === 'function')
            ? window.isSaberAnimationActive()
            : document.body.classList.contains('saber-animation-active'));

        if (!isAnimActive) {
            // Animasyon kapalı: Çizimi sabit parlaklıkta ve hareketsiz tut
            sabers.forEach(saber => {
                if (saber.visible === false) return;
                if (saber.filter) saber.filter.outerStrength = saber.baseIntensity;
                if (saber.spillFilter) {
                    const sp = parseFloat(saber.options?.groundSpill !== undefined ? saber.options.groundSpill : 0.4);
                    saber.spillFilter.outerStrength = saber.baseIntensity * sp * 0.75;
                }
                if (saber.particles && saber.particles.length > 0) {
                    saber.particles.forEach(p => {
                        const s = p.sprite || p;
                        if (s && s.parent) s.parent.removeChild(s);
                        if (s && s.destroy) s.destroy();
                    });
                    saber.particles = [];
                }
                if (saber.branches && saber.branches.length > 0) {
                    saber.branches.forEach(b => {
                        const s = b.sprite || b;
                        if (s && s.parent) s.parent.removeChild(s);
                        if (s && s.destroy) s.destroy();
                    });
                    saber.branches = [];
                }
                if (saber._wasDistorted) {
                    redrawWithDistortion(saber, 0);
                    saber._wasDistorted = false;
                }
            });
            if (app && app.renderer && app.stage) {
                try { app.renderer.render(app.stage); } catch(e) {}
            }
            if (app && app.ticker && app.ticker.started) {
                app.ticker.stop();
            }
            return;
        }
        
        sabers.forEach(saber => {
            if (saber.visible === false) return;
            const opts = saber.options || {};
            const preset = saber.presetName;

            const pulseSpd = (opts.pulseSpeed !== undefined && opts.pulseSpeed !== null) ? Number(opts.pulseSpeed) : 0;
            const flickerAmt = (opts.flickerAmount !== undefined && opts.flickerAmount !== null) ? Number(opts.flickerAmount) : 0;
            
            // Animasyon zaman ilerlemesi doğrudan Nabız Hızı (pulseSpeed)'e bağlı olsun
            // Nabız Hızı 0 ise hareketli dalgalar durur (zaman donar)
            const speedMultiplier = pulseSpd > 0 ? pulseSpd : (flickerAmt > 0 ? 0.3 : 0);
            saber.time += delta * 0.05 * speedMultiplier;
            
            // ═══ FLICKER & PULSE MODÜLASYONU ═══
            const pulseFactor = (pulseSpd > 0 && preset !== 'fire')
                ? (1 + Math.sin(saber.time * pulseSpd * 2) * 0.35)
                : 1.0;
            const flickerFactor = (flickerAmt > 0)
                ? (1 + (Math.random() - 0.5) * (flickerAmt * 2.5))
                : 1.0;
            const totalFactor = pulseFactor * flickerFactor;

            if (preset !== 'lightning') {
                if (saber.filter) {
                    saber.filter.outerStrength = saber.baseIntensity * totalFactor;
                }
                if (saber.spillFilter) {
                    const sp = parseFloat(opts.groundSpill !== undefined ? opts.groundSpill : 0.4);
                    saber.spillFilter.outerStrength = saber.baseIntensity * sp * 0.75 * totalFactor;
                }
            }
            
            // ═══ RAINBOW (renk geçişi) ═══
            if (opts.rainbow) {
                if (pulseSpd > 0) {
                    const hue = (saber.time * 20) % 360;
                    const rgb = hslToRgb(hue / 360, 1, 0.5);
                    const color = (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
                    if (saber.filter) saber.filter.color = color;
                    if (saber.spillFilter) saber.spillFilter.color = color;
                }
            }
            
            // ═══ PRESET'E ÖZEL EFEKTLER ═══
            
            // 🔥 FIRE - Alev dilleri + yükselen partiküller
            if (preset === 'fire') {
                animateFire(saber);
            }
            // 💫 SPARKS - Kıvılcım partikülleri
            else if (preset === 'sparks') {
                animateSparks(saber);
            }
            // ⚡ LIGHTNING - Rastgele elektrik dalları
            else if (preset === 'lightning') {
                animateLightning(saber);
            }
            // 🎯 ENERGIZE - Titreşen yoğun enerji
            else if (preset === 'energize') {
                if (flickerAmt > 0 && Math.random() < Math.min(0.6, flickerAmt * 2.5) && saber.graphics && saber.points) {
                    redrawWithDistortion(saber, flickerAmt * 10);
                } else if (saber._wasDistorted && flickerAmt === 0) {
                    redrawWithDistortion(saber, 0);
                    saber._wasDistorted = false;
                }
                
                // Küçük enerji parçacıkları
                if ((pulseSpd > 0 || flickerAmt > 0) && Math.random() < Math.min(0.5, flickerAmt * 2 + pulseSpd * 0.15) && saber.particles.length < 20) {
                    const points = saber.points;
                    const basePoint = getRandomPoint(saber);
                    if (basePoint) {
                        const particle = new PIXI.Graphics();
                        particle.beginFill(opts.coreColor || 0xFFFFFF, 1);
                        particle.drawCircle(0, 0, 1.5);
                        particle.endFill();
                        particle.blendMode = PIXI.BLEND_MODES.ADD;
                        particle.x = basePoint.x;
                        particle.y = basePoint.y;
                        
                        saber.particleContainer.addChild(particle);
                        const angle = Math.random() * Math.PI * 2;
                        const spd = (1.5 + Math.random() * 2) * Math.max(0.5, pulseSpd);
                        saber.particles.push({
                            sprite: particle,
                            vx: Math.cos(angle) * spd,
                            vy: Math.sin(angle) * spd,
                            life: 1.0,
                            decay: 0.05 * Math.max(0.5, pulseSpd),
                            energize: true
                        });
                    }
                }
                
                // Enerji parçacıklarını hareket ettir
                for (let i = saber.particles.length - 1; i >= 0; i--) {
                    const p = saber.particles[i];
                    if (p.energize) {
                        if (pulseSpd > 0) {
                            p.sprite.x += p.vx;
                            p.sprite.y += p.vy;
                            p.vx *= 0.95;
                            p.vy *= 0.95;
                            p.life -= p.decay;
                            p.sprite.alpha = p.life;
                        }
                        if (p.life <= 0 || (pulseSpd === 0 && flickerAmt === 0)) {
                            if (p.sprite.parent) p.sprite.parent.removeChild(p.sprite);
                            if (p.sprite.destroy) p.sprite.destroy();
                            saber.particles.splice(i, 1);
                        }
                    }
                }
            }

            // ⚡ ELECTRIC - Titreşen elektrik arkı
            else if (preset === 'electric') {
                if (flickerAmt > 0 && Math.random() < Math.min(0.85, flickerAmt * 2.5)) {
                    redrawWithDistortion(saber, flickerAmt * 10);
                } else if (saber._wasDistorted && flickerAmt === 0) {
                    redrawWithDistortion(saber, 0);
                    saber._wasDistorted = false;
                }
            }
            // 🌊 SINE - Dalga hareketi
            else if (preset === 'sine') {
                animateSine(saber);
            }
            // 🌪️ VORTEX - Dönen bozulma
            else if (preset === 'vortex') {
                animateVortex(saber);
            }
            // 💧 LIQUID - Yavaş organik dalga
            else if (preset === 'liquid') {
                animateLiquid(saber);
            }
        });
    }
    
    // ═══════════════════════════════════════
    // 🔮 YARDIMCI: Hem çizgi hem metin için rastgele nokta üret
    function getRandomPoint(saber) {
        if (saber.points && saber.points.length >= 2) {
            const segIdx = Math.floor(Math.random() * (saber.points.length - 1));
            const p1 = saber.points[segIdx];
            const p2 = saber.points[segIdx + 1];
            const t = Math.random();
            return {
                x: p1.x + (p2.x - p1.x) * t,
                y: p1.y + (p2.y - p1.y) * t
            };
        } else if (saber.points && saber.points.length === 1) {
            return saber.points[0];
        } else if (saber.pixiText) {
            const w = Math.max(1, (saber.pixiText.width || 100) * 0.7);
            const h = Math.max(1, (saber.pixiText.height || 40) * 0.7);
            const localX = (Math.random() - 0.5) * w;
            const localY = (Math.random() - 0.5) * h;
            const rot = saber.pixiText.rotation || 0;
            const cos = Math.cos(rot);
            const sin = Math.sin(rot);
            return {
                x: saber.pixiText.x + localX * cos - localY * sin,
                y: saber.pixiText.y + localX * sin + localY * cos
            };
        }
        return {x: 0, y: 0};
    }

    // 🔥 FIRE - Gerçek alev dilleri
    // ═══════════════════════════════════════
    function animateFire(saber) {
        const opts = saber.options || {};
        const flickerAmt = (opts.flickerAmount !== undefined && opts.flickerAmount !== null) ? Number(opts.flickerAmount) : 0;
        const pulseSpd = (opts.pulseSpeed !== undefined && opts.pulseSpeed !== null) ? Number(opts.pulseSpeed) : 0;

        // Parlaklık titremesi: Titreme ve Nabız Hızı kontrolünde
        const flicker = 1.0 + (flickerAmt > 0 ? (Math.random() - 0.5) * (flickerAmt * 2.0) : 0) + (pulseSpd > 0 ? Math.sin(saber.time * pulseSpd * 2) * 0.15 : 0);
        if (saber.filter) saber.filter.outerStrength = saber.baseIntensity * flicker;

        // Titreme ve Nabız 0 ise mevcut partikülleri temizle ve yenilerini üretme
        if (flickerAmt === 0 && pulseSpd === 0) {
            if (saber.particles && saber.particles.length > 0) {
                for (let i = saber.particles.length - 1; i >= 0; i--) {
                    const p = saber.particles[i];
                    if (p.sprite && p.sprite.parent) p.sprite.parent.removeChild(p.sprite);
                    if (p.sprite && p.sprite.destroy) p.sprite.destroy();
                    saber.particles.splice(i, 1);
                }
            }
            return;
        }

        // Partikül üretimi: Titreme ve Nabız Hızı ile orantılı
        const spawnChance = Math.min(0.8, (flickerAmt * 2.2 + pulseSpd * 0.2));
        const points = saber.points;
        if (((points && points.length > 0) || saber.pixiText) && saber.particles.length < 20 && Math.random() < spawnChance) {
            const basePoint = getRandomPoint(saber);
            if (basePoint) {
                const particle = new PIXI.Graphics();
                const size = 3 + Math.random() * 4;
                const isCore = Math.random() < 0.4;
                const colors = isCore 
                    ? [0xFFFFCC, 0xFFEE00] 
                    : [0xFF6600, 0xFF3300, 0xFF8800];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                particle.beginFill(color, 0.85);
                particle.drawEllipse(0, 0, size * 0.5, size * 1.1);
                particle.endFill();
                
                particle.x = basePoint.x + (Math.random() - 0.5) * 10;
                particle.y = basePoint.y + (Math.random() - 0.5) * 4;
                particle.blendMode = PIXI.BLEND_MODES.ADD;
                
                saber.particleContainer.addChild(particle);
                saber.particles.push({
                    sprite: particle,
                    vx: (Math.random() - 0.5) * 0.6,
                    vy: (-1.5 - Math.random() * 2.5) * Math.max(0.5, pulseSpd),
                    life: 1.0,
                    decay: (0.045 + Math.random() * 0.03) * Math.max(0.5, pulseSpd),
                    wobble: Math.random() * Math.PI * 2
                });
            }
        }
        
        // Alev partiküllerini hareket ettir
        const spdMul = Math.max(0.4, pulseSpd);
        for (let i = saber.particles.length - 1; i >= 0; i--) {
            const p = saber.particles[i];
            p.wobble += 0.12 * spdMul;
            p.sprite.x += p.vx + Math.sin(p.wobble) * 0.3;
            p.sprite.y += p.vy;
            p.vy -= 0.05 * spdMul;
            p.life -= p.decay;
            p.sprite.alpha = Math.max(0, p.life * 0.85);
            
            const scale = Math.max(0.1, p.life);
            p.sprite.scale.x = scale;
            p.sprite.scale.y = scale * 1.2;
            
            if (p.life < 0.35) {
                p.sprite.tint = 0x882200;
            }
            
            if (p.life <= 0) {
                if (p.sprite.parent) p.sprite.parent.removeChild(p.sprite);
                if (p.sprite.destroy) p.sprite.destroy();
                saber.particles.splice(i, 1);
            }
        }
    }
    
    // ═══════════════════════════════════════
    // 💫 SPARKS - Yoğun kıvılcım fıskiyesi
    // ═══════════════════════════════════════
    function animateSparks(saber) {
        const opts = saber.options || {};
        const flickerAmt = (opts.flickerAmount !== undefined && opts.flickerAmount !== null) ? Number(opts.flickerAmount) : 0;
        const pulseSpd = (opts.pulseSpeed !== undefined && opts.pulseSpeed !== null) ? Number(opts.pulseSpeed) : 0;

        const flicker = 1.0 + (flickerAmt > 0 ? (Math.random() - 0.5) * (flickerAmt * 2.5) : 0);
        if (saber.filter) saber.filter.outerStrength = saber.baseIntensity * flicker;

        // Titreme ve Nabız 0 ise partikülleri temizle
        if (flickerAmt === 0 && pulseSpd === 0) {
            if (saber.particles && saber.particles.length > 0) {
                for (let i = saber.particles.length - 1; i >= 0; i--) {
                    const p = saber.particles[i];
                    if (p.sprite && p.sprite.parent) p.sprite.parent.removeChild(p.sprite);
                    if (p.sprite && p.sprite.destroy) p.sprite.destroy();
                    saber.particles.splice(i, 1);
                }
            }
            return;
        }

        const maxParticles = Math.min(60, Math.round(flickerAmt * 120 + pulseSpd * 10));
        const spawnCount = (flickerAmt > 0 || pulseSpd > 0) ? Math.min(2, Math.round(flickerAmt * 4 + pulseSpd * 0.3)) : 0;
        
        for (let s = 0; s < spawnCount; s++) {
            if (saber.particles.length >= maxParticles) break;
            
            const basePoint = getRandomPoint(saber);
            if (!basePoint) continue;
            
            const particle = new PIXI.Graphics();
            const size = 1 + Math.random() * 2.5;
            const colors = [0xFFFFCC, 0xFFDD44, 0xFFAA00, 0xFFFFFF];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.beginFill(color, 1);
            particle.drawCircle(0, 0, size);
            particle.endFill();
            particle.blendMode = PIXI.BLEND_MODES.ADD;
            particle.x = basePoint.x;
            particle.y = basePoint.y;
            
            saber.particleContainer.addChild(particle);
            const angle = Math.random() * Math.PI * 2;
            const speed = (2 + Math.random() * 6) * Math.max(0.5, pulseSpd);
            saber.particles.push({
                sprite: particle,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: (0.02 + Math.random() * 0.03) * Math.max(0.5, pulseSpd),
                gravity: 0.2 * Math.max(0.5, pulseSpd),
                trail: []
            });
        }
        
        // Kıvılcımlar
        for (let i = saber.particles.length - 1; i >= 0; i--) {
            const p = saber.particles[i];
            p.sprite.x += p.vx;
            p.sprite.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.97;
            p.life -= p.decay;
            p.sprite.alpha = p.life;
            p.sprite.scale.set(0.5 + p.life * 0.5);
            
            if (p.life <= 0) {
                if (p.sprite.parent) p.sprite.parent.removeChild(p.sprite);
                if (p.sprite.destroy) p.sprite.destroy();
                saber.particles.splice(i, 1);
            }
        }
    }
    
    // ═══════════════════════════════════════
    // ⚡ LIGHTNING - Yoğun yıldırım dalları
    // ═══════════════════════════════════════
    function animateLightning(saber) {
        const opts = saber.options || {};
        const flickerAmt = (opts.flickerAmount !== undefined && opts.flickerAmount !== null) ? Number(opts.flickerAmount) : 0;
        const pulseSpd = (opts.pulseSpeed !== undefined && opts.pulseSpeed !== null) ? Number(opts.pulseSpeed) : 0;
        
        // Titreme miktarına göre parlaklık modülasyonu
        const pulseFactor = pulseSpd > 0 ? (1 + Math.sin(saber.time * pulseSpd * 2) * 0.35) : 1.0;
        const flickerFactor = flickerAmt > 0 ? (1 + (Math.random() - 0.5) * (flickerAmt * 2.5)) : 1.0;
        const totalFactor = pulseFactor * flickerFactor;
        
        if (saber.filter) {
            saber.filter.outerStrength = saber.baseIntensity * totalFactor;
        }
        if (saber.spillFilter) {
            const sp = parseFloat(opts.groundSpill !== undefined ? opts.groundSpill : 0.4);
            saber.spillFilter.outerStrength = saber.baseIntensity * sp * 0.75 * totalFactor;
        }
        
        // Titreme > 0 ise çizgide elektrik bozulması (jitter)
        if (flickerAmt > 0 && Math.random() < Math.min(0.85, flickerAmt * 2.5)) {
            redrawWithDistortion(saber, flickerAmt * 12);
        } else if (saber._wasDistorted && flickerAmt === 0) {
            redrawWithDistortion(saber, 0);
            saber._wasDistorted = false;
        }
        
        // Dallar için filtre güvencesi
        if (saber.branchContainer && (!saber.branchContainer.filters || saber.branchContainer.filters.length === 0)) {
            saber.branchContainer.filters = [new PIXI.filters.GlowFilter({
                distance: (opts.glowSize || 25) * 0.5,
                outerStrength: opts.intensity || 3,
                innerStrength: 1,
                color: opts.glowColor || 0xBB88FF,
                quality: 0.25
            })];
        }
        
        // Mevcut dalların ömrünü azalt ve bitenleri sil
        for (let i = saber.branches.length - 1; i >= 0; i--) {
            const b = saber.branches[i];
            const sprite = b.sprite || b;
            b.life = (b.life !== undefined) ? b.life - (pulseSpd > 0 ? Math.max(0.5, pulseSpd) : 1) : 0;
            if (b.life <= 0 || flickerAmt === 0) {
                if (sprite.parent) sprite.parent.removeChild(sprite);
                if (sprite.destroy) sprite.destroy();
                saber.branches.splice(i, 1);
            } else {
                sprite.alpha = b.life / (b.maxLife || 4);
            }
        }
        
        // Yeni yıldırım dalları: YALNIZCA Titreme > 0 ise üretilir
        if (flickerAmt > 0 && saber.branches.length < Math.min(8, Math.round(flickerAmt * 20) + 1)) {
            const spawnChance = Math.min(0.85, flickerAmt * 2.5);
            if (Math.random() < spawnChance) {
                const branchCount = 1 + Math.floor(Math.random() * 2);
                for (let b = 0; b < branchCount; b++) {
                    const basePoint = getRandomPoint(saber);
                    if (!basePoint) continue;
                    
                    const branch = new PIXI.Graphics();
                    const thickness = 1.5 + Math.random() * 2;
                    branch.lineStyle(thickness, 0xFFFFFF, 0.95);
                    branch.moveTo(basePoint.x, basePoint.y);
                    
                    let x = basePoint.x;
                    let y = basePoint.y;
                    const angle = Math.random() * Math.PI * 2;
                    const length = 20 + Math.random() * (35 + flickerAmt * 120);
                    const segments = 3 + Math.floor(Math.random() * 5);
                    
                    for (let i = 0; i < segments; i++) {
                        const segLen = length / segments;
                        x += Math.cos(angle + (Math.random() - 0.5) * 1.8) * segLen;
                        y += Math.sin(angle + (Math.random() - 0.5) * 1.8) * segLen;
                        branch.lineTo(x, y);
                    }
                    
                    if (Math.random() < 0.5) {
                        const subAngle = angle + (Math.random() - 0.5) * 2;
                        const subLen = 10 + Math.random() * 20;
                        const subX = x + Math.cos(subAngle) * subLen;
                        const subY = y + Math.sin(subAngle) * subLen;
                        branch.moveTo(x, y);
                        branch.lineTo(subX, subY);
                    }
                    
                    saber.branchContainer.addChild(branch);
                    const lifeSpan = Math.max(2, Math.round((3 + Math.random() * 3) / Math.max(0.5, pulseSpd)));
                    saber.branches.push({
                        sprite: branch,
                        life: lifeSpan,
                        maxLife: lifeSpan
                    });
                }
            }
        }
    }
    
    // ═══════════════════════════════════════
    // 🌊 SINE - Belirgin dalga
    // ═══════════════════════════════════════
    function animateSine(saber) {
        if (!saber.graphics || !saber.points) return;
        const opts = saber.options || {};
        const pulseSpd = (opts.pulseSpeed !== undefined && opts.pulseSpeed !== null) ? Number(opts.pulseSpeed) : 0;
        const line = saber.graphics;
        const points = saber.points;
        const t = saber.time;
        
        line.clear();
        const coreVal = (opts.coreSize !== undefined && opts.coreSize !== null) ? Number(opts.coreSize) : 0;
        const tubeThick = Math.max(2, coreVal + 3);
        line.lineStyle(tubeThick, opts.glowColor, 0.95);
        
        const isClosed = points.length > 2 && Math.hypot(points[0].x - points[points.length - 1].x, points[0].y - points[points.length - 1].y) < 3;
        const len = points.length;
        const waveAmp = Math.min(1.5, pulseSpd);
        
        if (len > 0) {
            line.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < len; i++) {
                const phase = isClosed ? ((i / (len - 1)) * Math.PI * 2 * 4) : (i * 0.5);
                const wave = (pulseSpd > 0) ? Math.sin(t * 4 + phase) * 10 * waveAmp : 0;
                const wave2 = (pulseSpd > 0) ? Math.cos(t * 2 + phase * 0.6) * 3 * waveAmp : 0;
                line.lineTo(points[i].x + wave2, points[i].y + wave);
            }
        }
        if (coreVal > 0) {
            const coreThick = Math.max(1, Math.round(coreVal * 0.5));
            const coreAlpha = Math.min(0.65, 0.25 + (coreVal / 30) * 0.4);
            line.lineStyle(coreThick, opts.coreColor || opts.glowColor, coreAlpha);
            if (len > 0) {
                line.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < len; i++) {
                    const phase = isClosed ? ((i / (len - 1)) * Math.PI * 2 * 4) : (i * 0.5);
                    const wave = (pulseSpd > 0) ? Math.sin(t * 4 + phase) * 10 * waveAmp : 0;
                    const wave2 = (pulseSpd > 0) ? Math.cos(t * 2 + phase * 0.6) * 3 * waveAmp : 0;
                    line.lineTo(points[i].x + wave2, points[i].y + wave);
                }
            }
        }
    }
    
    // ═══════════════════════════════════════
    // 🌪️ VORTEX - Spiral helezon
    // ═══════════════════════════════════════
    function animateVortex(saber) {
        const opts = saber.options || {};
        const pulseSpd = (opts.pulseSpeed !== undefined && opts.pulseSpeed !== null) ? Number(opts.pulseSpeed) : 0;
        const flickerAmt = (opts.flickerAmount !== undefined && opts.flickerAmount !== null) ? Number(opts.flickerAmount) : 0;
        const t = saber.time;
        if (saber.pixiText && saber.filter) {
            const pulse = pulseSpd > 0 ? Math.sin(t * 3.5) * 0.28 : 0;
            saber.filter.outerStrength = saber.baseIntensity * (1 + pulse);
        }
        if (saber.graphics && saber.points) {
            const line = saber.graphics;
            const points = saber.points;
            line.clear();
            const coreVal = (opts.coreSize !== undefined && opts.coreSize !== null) ? Number(opts.coreSize) : 0;
            const tubeThick = Math.max(2, coreVal + 3);
            line.lineStyle(tubeThick, opts.glowColor, 0.95);
            
            const isClosed = points.length > 2 && Math.hypot(points[0].x - points[points.length - 1].x, points[0].y - points[points.length - 1].y) < 3;
            const len = points.length;
            const waveAmp = Math.min(1.5, pulseSpd);
            
            if (len > 0) {
                line.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < len; i++) {
                    const phase = isClosed ? ((i / (len - 1)) * Math.PI * 2 * 3) : (i * 0.2);
                    const wave = (pulseSpd > 0) ? Math.sin(t * 3 - phase) * 6 * waveAmp : 0;
                    line.lineTo(points[i].x + (pulseSpd > 0 ? Math.sin(t*2)*wave : 0), points[i].y + (pulseSpd > 0 ? Math.cos(t*2)*wave : 0));
                }
            }
            if (coreVal > 0) {
                const coreThick = Math.max(1, Math.round(coreVal * 0.5));
                const coreAlpha = Math.min(0.65, 0.25 + (coreVal / 30) * 0.4);
                line.lineStyle(coreThick, opts.coreColor || opts.glowColor, coreAlpha);
                if (len > 0) {
                    line.moveTo(points[0].x, points[0].y);
                    for (let i = 1; i < len; i++) {
                        const phase = isClosed ? ((i / (len - 1)) * Math.PI * 2 * 3) : (i * 0.2);
                        const wave = (pulseSpd > 0) ? Math.sin(t * 3 - phase) * 6 * waveAmp : 0;
                        line.lineTo(points[i].x + (pulseSpd > 0 ? Math.sin(t*2)*wave : 0), points[i].y + (pulseSpd > 0 ? Math.cos(t*2)*wave : 0));
                    }
                }
            }
        }
        
        // Vortex partikülleri (dönen enerji)
        if (pulseSpd === 0 && flickerAmt === 0) {
            if (saber.particles && saber.particles.length > 0) {
                for (let i = saber.particles.length - 1; i >= 0; i--) {
                    const p = saber.particles[i];
                    if (p.sprite && p.sprite.parent) p.sprite.parent.removeChild(p.sprite);
                    if (p.sprite && p.sprite.destroy) p.sprite.destroy();
                    saber.particles.splice(i, 1);
                }
            }
            return;
        }

        if (pulseSpd > 0 && Math.random() < Math.min(0.4, 0.1 + pulseSpd * 0.1) && saber.particles.length < 40) {
            const basePoint = getRandomPoint(saber);
            if (basePoint) {
                const particle = new PIXI.Graphics();
                particle.beginFill(opts.glowColor, 0.8);
                particle.drawCircle(0, 0, 2);
                particle.endFill();
                particle.blendMode = PIXI.BLEND_MODES.ADD;
                particle.x = basePoint.x;
                particle.y = basePoint.y;
                
                saber.particleContainer.addChild(particle);
                saber.particles.push({
                    sprite: particle,
                    baseX: basePoint.x,
                    baseY: basePoint.y,
                    angle: Math.random() * Math.PI * 2,
                    radius: 10,
                    life: 1.0,
                    decay: 0.02 * Math.max(0.5, pulseSpd)
                });
            }
        }
        
        // Vortex partiküllerini döndür
        const rotSpd = 0.15 * Math.max(0.5, pulseSpd);
        for (let i = saber.particles.length - 1; i >= 0; i--) {
            const p = saber.particles[i];
            p.angle += rotSpd;
            p.radius += 0.5 * Math.max(0.5, pulseSpd);
            p.sprite.x = p.baseX + Math.cos(p.angle) * p.radius;
            p.sprite.y = p.baseY + Math.sin(p.angle) * p.radius;
            p.life -= p.decay;
            p.sprite.alpha = p.life;
            
            if (p.life <= 0) {
                if (p.sprite.parent) p.sprite.parent.removeChild(p.sprite);
                if (p.sprite.destroy) p.sprite.destroy();
                saber.particles.splice(i, 1);
            }
        }
    }
    
    // ═══════════════════════════════════════
    // 💧 LIQUID - Organik sıvı akış
    // ═══════════════════════════════════════
    function animateLiquid(saber) {
        const opts = saber.options || {};
        const pulseSpd = (opts.pulseSpeed !== undefined && opts.pulseSpeed !== null) ? Number(opts.pulseSpeed) : 0;
        const flickerAmt = (opts.flickerAmount !== undefined && opts.flickerAmount !== null) ? Number(opts.flickerAmount) : 0;
        const t = saber.time;
        if (saber.graphics && saber.points) {
            const line = saber.graphics;
            const points = saber.points;
            line.clear();
            const coreVal = (opts.coreSize !== undefined && opts.coreSize !== null) ? Number(opts.coreSize) : 0;
            const tubeThick = Math.max(2, coreVal + 3);
            line.lineStyle(tubeThick, opts.glowColor, 0.95);
            
            const isClosed = points.length > 2 && Math.hypot(points[0].x - points[points.length - 1].x, points[0].y - points[points.length - 1].y) < 3;
            const len = points.length;
            const waveAmp = Math.min(1.5, pulseSpd);
            
            if (len > 0) {
                line.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < len; i++) {
                    const phase = isClosed ? ((i / (len - 1)) * Math.PI * 2 * 2) : (i * 0.15);
                    const w1 = (pulseSpd > 0) ? Math.sin(t * 1.2 + phase) * 5 * waveAmp : 0;
                    const w2 = (pulseSpd > 0) ? Math.cos(t * 0.7 + phase * 0.7) * 3 * waveAmp : 0;
                    const w3 = (pulseSpd > 0) ? Math.sin(t * 0.4 + phase * 0.3) * 2 * waveAmp : 0;
                    line.lineTo(points[i].x + w2 + w3, points[i].y + w1 + w3);
                }
            }
            if (coreVal > 0) {
                const coreThick = Math.max(1, Math.round(coreVal * 0.5));
                const coreAlpha = Math.min(0.65, 0.25 + (coreVal / 30) * 0.4);
                line.lineStyle(coreThick, opts.coreColor || opts.glowColor, coreAlpha);
                if (len > 0) {
                    line.moveTo(points[0].x, points[0].y);
                    for (let i = 1; i < len; i++) {
                        const phase = isClosed ? ((i / (len - 1)) * Math.PI * 2 * 2) : (i * 0.15);
                        const w1 = (pulseSpd > 0) ? Math.sin(t * 1.2 + phase) * 5 * waveAmp : 0;
                        const w2 = (pulseSpd > 0) ? Math.cos(t * 0.7 + phase * 0.7) * 3 * waveAmp : 0;
                        const w3 = (pulseSpd > 0) ? Math.sin(t * 0.4 + phase * 0.3) * 2 * waveAmp : 0;
                        line.lineTo(points[i].x + w2 + w3, points[i].y + w1 + w3);
                    }
                }
            }
        }
        
        // Damla partikülleri
        if (pulseSpd === 0 && flickerAmt === 0) {
            if (saber.particles && saber.particles.length > 0) {
                for (let i = saber.particles.length - 1; i >= 0; i--) {
                    const p = saber.particles[i];
                    if (p.sprite && p.sprite.parent) p.sprite.parent.removeChild(p.sprite);
                    if (p.sprite && p.sprite.destroy) p.sprite.destroy();
                    saber.particles.splice(i, 1);
                }
            }
            return;
        }

        if (pulseSpd > 0 && Math.random() < Math.min(0.3, 0.05 + pulseSpd * 0.05) && saber.particles.length < 20) {
            const basePoint = getRandomPoint(saber);
            if (basePoint) {
                const particle = new PIXI.Graphics();
                particle.beginFill(opts.glowColor, 0.7);
                particle.drawEllipse(0, 0, 2, 3);
                particle.endFill();
                particle.blendMode = PIXI.BLEND_MODES.ADD;
                particle.x = basePoint.x;
                particle.y = basePoint.y;
                
                saber.particleContainer.addChild(particle);
                saber.particles.push({
                    sprite: particle,
                    vx: 0,
                    vy: 0.5 * Math.max(0.5, pulseSpd),
                    life: 1.0,
                    decay: 0.015 * Math.max(0.5, pulseSpd)
                });
            }
        }
        
        // Damlaları düşür
        for (let i = saber.particles.length - 1; i >= 0; i--) {
            const p = saber.particles[i];
            p.sprite.x += p.vx;
            p.sprite.y += p.vy;
            p.vy += 0.05 * Math.max(0.5, pulseSpd);
            p.life -= p.decay;
            p.sprite.alpha = p.life;
            
            if (p.life <= 0) {
                if (p.sprite.parent) p.sprite.parent.removeChild(p.sprite);
                if (p.sprite.destroy) p.sprite.destroy();
                saber.particles.splice(i, 1);
            }
        }
    }
    
    // ⚡ ELECTRIC/LIGHTNING/ENERGIZE için titreşimli yeniden çizim
    function redrawWithDistortion(saber, forcedAmount) {
        if (!saber.graphics || !saber.points) return;
        const line = saber.graphics;
        const points = saber.points;
        const opts = saber.options || {};
        const isFreehand = opts.pathType === 'free' || opts.shapeType === 'free' || opts.isFree;
        const amount = (forcedAmount !== undefined) ? forcedAmount : (isFreehand ? (opts.distortionAmount || 0) : 0);
        
        const coreSizeVal = (opts.coreSize !== undefined && opts.coreSize !== null) ? Number(opts.coreSize) : 0;
        const tubeThickness = Math.max(2, coreSizeVal + 3);
        
        // Kapalı geometri kontrolü (daire, dikdörtgen, kapalı poligon)
        const isClosed = points.length > 2 && Math.hypot(points[0].x - points[points.length - 1].x, points[0].y - points[points.length - 1].y) < 3;
        
        // Noktaları bozulma miktarına göre sars
        const distorted = [];
        if (amount <= 0) {
            for (let i = 0; i < points.length; i++) {
                distorted.push({ x: points[i].x, y: points[i].y });
            }
        } else {
            for (let i = 0; i < points.length; i++) {
                if (i === points.length - 1 && isClosed && distorted.length > 0) {
                    distorted.push({ x: distorted[0].x, y: distorted[0].y });
                } else {
                    const ox = (Math.random() - 0.5) * amount;
                    const oy = (Math.random() - 0.5) * amount;
                    distorted.push({ x: points[i].x + ox, y: points[i].y + oy });
                }
            }
        }
        
        line.clear();
        
        // 1. Neon tüp gövdesi (doygun, renkli parlak ana neon tüpü)
        line.lineStyle(tubeThickness, opts.glowColor, 0.95);
        renderPathPoints(line, distorted, opts.dashStyle);
        
        // 2. Akkor iç çekirdek (SADECE coreSize > 0 ise)
        if (coreSizeVal > 0) {
            const coreThickness = Math.max(1, Math.round(coreSizeVal * 0.5));
            const coreAlpha = Math.min(0.65, 0.25 + (coreSizeVal / 30) * 0.4);
            line.lineStyle(coreThickness, opts.coreColor || opts.glowColor, coreAlpha);
            renderPathPoints(line, distorted, opts.dashStyle);
        }
        
        // 3. Işıklı Köşe Pinleri (Energy Nodes)
        const isCurvedOrFree = opts.pathType === 'circle' || opts.pathType === 'free' || opts.shapeType === 'circle' || opts.shapeType === 'free' || opts.isCircle || opts.isFree;
        if (opts.energyNodes === true && !isCurvedOrFree && distorted.length > 2 && (distorted.length <= 16 || opts.pathType === 'polygon' || opts.pathType === 'rect')) {
            const pinRadius = Math.max(3, (opts.coreSize || 0) + 2.5);
            for (let i = 0; i < distorted.length; i++) {
                line.beginFill(opts.glowColor, 1.0);
                line.drawCircle(distorted[i].x, distorted[i].y, pinRadius);
                line.endFill();
            }
        }
        
        saber._wasDistorted = (amount > 0);
    }
    
    // 🧹 TÜM SABER'LARI TEMİZLE
    function clear() {
        if (!container) return;
        // Sadece çizim saber'larını (graphics olanları) temizle
        sabers = sabers.filter(s => {
            if (s.graphics) {
                container.removeChild(s.graphics);
                if (s.particleContainer) container.removeChild(s.particleContainer);
                if (s.branchContainer) container.removeChild(s.branchContainer);
                return false; // Sil
            }
            return true; // Metin saber'ı ise tut
        });
    }
    
    // 🎨 RENK YARDIMCISI (HSL → RGB)
    function hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) { r = g = b = l; }
        else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
    
    // ═══════════════════════════════════════
    // 🎯 RESIZE SABER CANVAS
    // ═══════════════════════════════════════
    function resize(w, h) {
        if (!w || !h) {
            const dc = document.getElementById('draw-layer') || document.getElementById('drawCanvas');
            if (dc && dc.width && dc.height) {
                w = dc.width;
                h = dc.height;
            } else {
                const canvasContainer = document.getElementById('canvas-container');
                if (canvasContainer) {
                    w = canvasContainer.offsetWidth || parseInt(canvasContainer.style.width) || 1920;
                    h = canvasContainer.offsetHeight || parseInt(canvasContainer.style.height) || 1080;
                } else {
                    w = 1920;
                    h = 1080;
                }
            }
        }
        if (app && app.renderer) {
            if (app.renderer.width !== w || app.renderer.height !== h) {
                app.renderer.resize(w, h);
            }
        }
    }

    // ═══════════════════════════════════════
    // 🎯 INDIVIDUAL SABER TRANSFORM
    // ═══════════════════════════════════════
    function setSaberTransform(saber, scale = 1, dx = 0, dy = 0, autoRender = true, rotationDeg = 0, pivotX = null, pivotY = null) {
        if (!saber) return;
        
        const hasCustomPivot = (pivotX !== null && pivotX !== undefined) || (pivotY !== null && pivotY !== undefined);
        const hasRotation = (rotationDeg !== 0 && rotationDeg !== null && rotationDeg !== undefined);
        const cx = hasCustomPivot ? pivotX : (hasRotation ? (saber.centerX || 0) : 0);
        const cy = hasCustomPivot ? pivotY : (hasRotation ? (saber.centerY || 0) : 0);
        const rotRad = (rotationDeg || 0) * Math.PI / 180;
        const s = (scale !== undefined && scale !== null) ? scale : 1;
        
        saber.rotation = rotationDeg || 0;
        saber.dx = dx || 0;
        saber.dy = dy || 0;
        saber.scale = s;
        if (pivotX !== null && pivotX !== undefined) saber.centerX = pivotX;
        if (pivotY !== null && pivotY !== undefined) saber.centerY = pivotY;

        const targets = [saber.graphics, saber.particleContainer, saber.branchContainer];
        for (let i = 0; i < targets.length; i++) {
            const obj = targets[i];
            if (!obj) continue;
            
            if (rotRad !== 0 || cx !== 0 || cy !== 0) {
                obj.pivot.set(cx, cy);
                obj.position.set(cx + (dx || 0), cy + (dy || 0));
            } else {
                obj.pivot.set(0, 0);
                obj.position.set(dx || 0, dy || 0);
            }
            obj.rotation = rotRad;
            obj.scale.set(s);
        }

        if (autoRender && app && app.renderer && app.stage) {
            try { app.renderer.render(app.stage); } catch(e) {}
        }
    }

    // ═══════════════════════════════════════
    // 👁️ SABER GÖRÜNÜRLÜK AYARI (Gizle / Göster)
    // ═══════════════════════════════════════
    function setSaberVisibility(saber, isVisible = true) {
        if (!saber) return;
        const v = !!isVisible;
        saber.visible = v;
        if (saber.graphics) saber.graphics.visible = v;
        if (saber.particleContainer) saber.particleContainer.visible = v;
        if (saber.branchContainer) saber.branchContainer.visible = v;
        if (app && app.renderer && app.stage) {
            try { app.renderer.render(app.stage); } catch(e) {}
        }
    }

    // 💡 PUBLIC API

    function hexToPixiColor(hex) {
        return parseInt(hex.replace(/^#/, ''), 16);
    }


    // TEXT NODE CENTER AND BOUNDING BOX
    function getTextCenterAndMetrics(el) {
        if (!el) return null;
        let tRect = null;
        try {
            // Neon metin veya tuval metin öğelerinde doğrudan elemanın kendi transform merkezini kullan
            if (el.classList.contains('neon-text-el') || el.dataset?.saberActive === 'true' || el.classList.contains('canvas-el')) {
                tRect = el.getBoundingClientRect();
            } else {
                const editableSpan = el.querySelector('.editable-text');
                if (editableSpan) {
                    tRect = editableSpan.getBoundingClientRect();
                } else if (el.childNodes.length > 0) {
                    for (let i = 0; i < el.childNodes.length; i++) {
                        if (el.childNodes[i].nodeType === 3 && el.childNodes[i].textContent.trim() !== '') {
                            const range = document.createRange();
                            range.selectNode(el.childNodes[i]);
                            tRect = range.getBoundingClientRect();
                            break;
                        }
                    }
                }
            }
        } catch(e) {}

        if (!tRect || tRect.width === 0 || tRect.height === 0) {
            tRect = el.getBoundingClientRect();
        }

        return {
            centerX: tRect.left + tRect.width / 2,
            centerY: tRect.top + tRect.height / 2,
            rect: tRect
        };
    }

    function addTextSaber(id, el, opts) {
        if (!app) {
            const c = document.getElementById('canvas-container');
            if (c) init(c);
        }
        if (!app || !app.textContainer) return;
        
        removeTextSaber(id); // Clear existing
        
        const elId = el.id || el.dataset.saberElId;
        if (elId && app.textObjects && app.textObjects[elId]) {
            const oldText = app.textObjects[elId];
            try {
                if (oldText.parent) oldText.parent.removeChild(oldText);
                if (oldText.filters) oldText.filters = null;
                oldText.destroy({children: true, texture: true, baseTexture: true});
            } catch(e) {}
            delete app.textObjects[elId];
        }
        if (!el.id && !el.dataset.saberElId) {
            el.dataset.saberElId = 'saber-el-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
        }

        const computed = window.getComputedStyle(el);
        const sf = (typeof window.getGlobalScale === 'function' ? window.getGlobalScale() : 1);
        
        // Basic style extraction
        const fontSize = parseFloat(computed.fontSize) || 48;
        let fontFamily = computed.fontFamily;
        if (fontFamily) fontFamily = fontFamily.replace(/['"]/g, '');
        const fontWeight = computed.fontWeight;
        const fontStyle = computed.fontStyle;
        const letterSpacing = computed.letterSpacing === 'normal' ? 0 : (parseFloat(computed.letterSpacing) / sf);
        
        const presetObj = presets[opts.preset || 'fully-lit'] || presets['fully-lit'];
        const finalOpts = Object.assign({}, defaults, presetObj.settings, opts);
        if (presetObj.settings.rainbow) finalOpts.rainbow = true;
        
        let fillPixiColor = '#FFFFFF';
        if (finalOpts.preset === 'full-neon' || finalOpts.coreColor === 'match') {
            if (typeof finalOpts.glowColor === 'number') {
                fillPixiColor = '#' + finalOpts.glowColor.toString(16).padStart(6, '0');
            } else {
                fillPixiColor = finalOpts.glowColor || '#00D2FF';
            }
        } else if (finalOpts.coreColor) {
            if (typeof finalOpts.coreColor === 'number') {
                fillPixiColor = '#' + finalOpts.coreColor.toString(16).padStart(6, '0');
            } else {
                fillPixiColor = finalOpts.coreColor;
            }
        } else if (computed.color && computed.color !== 'transparent' && computed.color !== 'rgba(0, 0, 0, 0)') {
            fillPixiColor = computed.color;
        }
        
        // update opts with finalOpts for animation
        Object.assign(opts, finalOpts);
        
        const fill = fillPixiColor;

        const textContent = el.innerText || el.textContent;
        const textAlign = computed.textAlign || 'left';

        // Set up PIXI Text Style
        const textStyle = new PIXI.TextStyle({
            fontFamily: fontFamily,
            fontSize: fontSize,
            fontWeight: fontWeight,
            fontStyle: fontStyle,
            fill: fill,
            letterSpacing: letterSpacing,
            align: textAlign,
            wordWrap: false,
            padding: Math.max((parseFloat(opts.glowSize || 30)) * 2, 40)
        });

        const pixiText = new PIXI.Text(textContent, textStyle);
        pixiText.anchor.set(0.5, 0.5);
        
        // Calculate position based on center
        const container = document.getElementById('canvas-container');
        const cRect = (typeof canvasEl !== 'undefined' ? canvasEl : container) ? (typeof canvasEl !== 'undefined' ? canvasEl : container).getBoundingClientRect() : null;
        const logicalW = container ? (container.offsetWidth || 1920) : 1920;
        const scaleFactor = cRect ? (cRect.width / logicalW) : sf;
        const metrics = getTextCenterAndMetrics(el);
        
        if (metrics && cRect) {
            pixiText.x = (metrics.centerX - cRect.left) / scaleFactor;
            pixiText.y = (metrics.centerY - cRect.top) / scaleFactor;
        }
        const rotDeg = parseFloat(el.dataset?.rotation) || 0;
        pixiText.rotation = (rotDeg * Math.PI) / 180;
        const elScale = parseFloat(el.dataset?.scale) || 1;
        pixiText.scale.set(elScale, elScale);

        // Add Glow Filter
        const glowColorNum = typeof opts.glowColor === 'number' ? opts.glowColor : hexToPixiColor(opts.glowColor || '#00aaff');
        let coreColorNum;
        if (opts.preset === 'full-neon' || opts.coreColor === 'match') {
            coreColorNum = glowColorNum;
        } else {
            coreColorNum = typeof opts.coreColor === 'number' ? opts.coreColor : hexToPixiColor(opts.coreColor || '#ffffff');
        }
        opts.glowColor = glowColorNum;
        opts.coreColor = coreColorNum;
        
        const glowColor = glowColorNum;
        const coreSize = parseFloat(opts.coreSize || 4);
        const glowSize = parseFloat(opts.glowSize || 30);
        const intensity = parseFloat(opts.intensity || 2.5);

        const glowFilter = new PIXI.filters.GlowFilter({
            distance: glowSize,
            outerStrength: intensity,
            innerStrength: 0,
            color: glowColor,
            quality: 0.3
        });
        
        pixiText.filters = [glowFilter];
        
        const particleContainer = new PIXI.Container();
        const branchContainer = new PIXI.Container();
        
        app.textContainer.addChild(branchContainer);
        app.textContainer.addChild(pixiText);
        app.textContainer.addChild(particleContainer);
        
        const obj = { 
            pixiText, el, opts, options: opts,
            particleContainer, branchContainer,
            particles: [], branches: [],
            time: 0, baseIntensity: intensity,
            filter: glowFilter, presetName: opts.preset || 'fully-lit'
        };
        app.textObjects[id] = obj;
        sabers.push(obj);

        // Canlı animasyon kontrolü: Kullanıcı animasyonu açmadıkça (window.isNeonTextAnimActive === true)
        // metin saberi için ticker çalıştırılmaz, statik tek kare render alınır.
        const isAnimatedPreset = ['fire', 'vortex', 'electric', 'sparks', 'lightning', 'energize', 'rainbow'].includes(opts.preset) || (opts.pulseSpeed > 0) || (opts.flickerAmount > 0) || opts.rainbow;
        const shouldAnimate = isAnimatedPreset && (window.isNeonTextAnimActive === true);
        if (shouldAnimate && app.ticker && !app.ticker.started) {
            app.ticker.start();
        } else if (!shouldAnimate && app.renderer && app.stage) {
            try { app.renderer.render(app.stage); } catch(e) {}
        }
    }

    function removeTextSaber(id) {
        if (!app || !app.textContainer || !app.textObjects[id]) return;
        const obj = app.textObjects[id];
        
        try {
            if (obj.pixiText) {
                if (obj.pixiText.parent) obj.pixiText.parent.removeChild(obj.pixiText);
                if (obj.pixiText.filters) obj.pixiText.filters = null;
                obj.pixiText.destroy({children: true, texture: true, baseTexture: true});
            }
        } catch(e) {
            console.warn('Text saber silme hatasi:', e);
        }
        if (obj.particleContainer) { app.textContainer.removeChild(obj.particleContainer); obj.particleContainer.destroy({children: true}); }
        if (obj.branchContainer) { app.textContainer.removeChild(obj.branchContainer); obj.branchContainer.destroy({children: true}); }
        
        // Remove from sabers loop
        const sIdx = sabers.indexOf(obj);
        if (sIdx !== -1) sabers.splice(sIdx, 1);
        
        delete app.textObjects[id];

    }

    function setTextSaberVisibility(id, isVisible = true) {
        if (!app || !app.textObjects) return;
        let obj = app.textObjects[id];
        if (!obj && typeof id === 'object' && id !== null) {
            for (const k in app.textObjects) {
                if (app.textObjects[k] && app.textObjects[k].el === id) {
                    obj = app.textObjects[k];
                    break;
                }
            }
        }
        if (!obj && typeof id === 'string') {
            for (const k in app.textObjects) {
                const item = app.textObjects[k];
                if (item && item.el && (item.el.id === id || item.el.dataset?.layerUid === id || (item.el.dataset && item.el.dataset.saberElId === id))) {
                    obj = item;
                    break;
                }
            }
        }
        if (!obj) return;
        const v = !!isVisible;
        obj.visible = v;
        if (obj.pixiText) obj.pixiText.visible = v;
        if (obj.particleContainer) obj.particleContainer.visible = v;
        if (obj.branchContainer) obj.branchContainer.visible = v;
        if (app.renderer && app.stage) {
            try { app.renderer.render(app.stage); } catch(e) {}
        }
    }

    function updateTextSaberPositions() {
        if (!app || !app.textContainer) return;
        if (!app.textObjects || Object.keys(app.textObjects).length === 0) return;
        const container = document.getElementById('canvas-container');
        if (container && app.renderer) {
            const currentW = container.offsetWidth || 1920;
            const currentH = container.offsetHeight || 1080;
            if (app._lastContainerW !== currentW || app._lastContainerH !== currentH) {
                app._lastContainerW = currentW;
                app._lastContainerH = currentH;
                app.view.style.width = '100%';
                app.view.style.height = '100%';
                app.renderer.resize(currentW, currentH);
            }
        }
        const cRect = (typeof canvasEl !== 'undefined' ? canvasEl : document.getElementById('canvas-container')) ? (typeof canvasEl !== 'undefined' ? canvasEl : document.getElementById('canvas-container')).getBoundingClientRect() : null;
        if (!cRect) return;
        const logicalW = container ? (container.offsetWidth || 1920) : 1920;
        const sf = cRect.width / logicalW;

        for (const id in app.textObjects) {
            const obj = app.textObjects[id];
            if (!obj || !obj.el || !obj.pixiText) continue;

            const isElHidden = (obj.visible === false) ||
                               (obj.el.dataset && obj.el.dataset.hiddenLayer === 'true') ||
                               obj.el.style.display === 'none' ||
                               obj.el.style.visibility === 'hidden' ||
                               (obj.el.closest && (obj.el.closest('[data-hidden-layer="true"]') || obj.el.closest('.is-hidden')));

            if (isElHidden) {
                obj.pixiText.visible = false;
                if (obj.particleContainer) obj.particleContainer.visible = false;
                if (obj.branchContainer) obj.branchContainer.visible = false;
                continue;
            }

            obj.pixiText.visible = true;
            if (obj.particleContainer) obj.particleContainer.visible = true;
            if (obj.branchContainer) obj.branchContainer.visible = true;

            if (obj.pixiText.anchor.x !== 0.5 || obj.pixiText.anchor.y !== 0.5) {
                obj.pixiText.anchor.set(0.5, 0.5);
            }

            const metrics = getTextCenterAndMetrics(obj.el);
            if (metrics) {
                obj.pixiText.x = (metrics.centerX - cRect.left) / sf;
                obj.pixiText.y = (metrics.centerY - cRect.top) / sf;
            }

            const rotDeg = parseFloat(obj.el.dataset?.rotation) || 0;
            obj.pixiText.rotation = (rotDeg * Math.PI) / 180;

            const scale = parseFloat(obj.el.dataset?.scale) || 1;
            obj.pixiText.scale.set(scale, scale);

            // Re-sync text content in case of inline edit
            const textContent = obj.el.innerText || obj.el.textContent || '';
            if (obj.pixiText.text !== textContent) {
                obj.pixiText.text = textContent;
            }

            // Sync font size and styles if changed
            const cs = window.getComputedStyle(obj.el);
            const currentFontSize = parseFloat(cs.fontSize) || 48;
            if (obj.pixiText.style.fontSize !== currentFontSize) {
                obj.pixiText.style.fontSize = currentFontSize;
            }
            if (cs.fontFamily) {
                const cleanFont = cs.fontFamily.replace(/['"]/g, '');
                if (obj.pixiText.style.fontFamily !== cleanFont) {
                    obj.pixiText.style.fontFamily = cleanFont;
                }
            }
            if (cs.fontWeight && obj.pixiText.style.fontWeight !== cs.fontWeight) {
                obj.pixiText.style.fontWeight = cs.fontWeight;
            }
        }

        if (app.renderer && app.stage && (!app.ticker || !app.ticker.started)) {
            try { app.renderer.render(app.stage); } catch(e) {}
        }
    }

    // ═══════════════════════════════════════
    // ⚡ SLIDER CANLI GÜNCELLEME (In-Place Fast Update)
    // Sürükleme anında WebGL filtrelerini sıfırdan yaratmak yerine
    // sadece uniform değerlerini ve kaliteyi günceller (120 FPS akıcılık)
    // ═══════════════════════════════════════
    function updateSaberParameters(saber, newOptions = {}, isSliding = false) {
        if (!saber) return;
        const opts = Object.assign(saber.options || {}, newOptions);
        
        // 1. Kalite yönetimi: Kaydırma anında da net ve akıcı tut (0.20 / 0.25)
        const targetGlowQuality = isSliding ? 0.20 : 0.25;
        const targetSpillQuality = isSliding ? 0.08 : 0.12;
        
        if (saber.filter) {
            if (saber.filter.quality !== targetGlowQuality) saber.filter.quality = targetGlowQuality;
            if (opts.glowSize !== undefined) saber.filter.distance = Math.max(5, Math.min(150, opts.glowSize));
            if (opts.intensity !== undefined) {
                saber.baseIntensity = opts.intensity;
                saber.filter.outerStrength = Math.max(0.5, Math.min(10, opts.intensity));
            }
            if (opts.glowColor !== undefined) saber.filter.color = opts.glowColor;
        }
        
        if (saber.spillFilter) {
            if (saber.spillFilter.quality !== targetSpillQuality) saber.spillFilter.quality = targetSpillQuality;
            if (opts.glowSize !== undefined) saber.spillFilter.distance = Math.max(10, Math.min(200, Math.round(opts.glowSize * 1.5)));
            if (opts.intensity !== undefined || opts.groundSpill !== undefined) {
                const sp = parseFloat(opts.groundSpill !== undefined ? opts.groundSpill : 0.4);
                saber.spillFilter.outerStrength = (saber.baseIntensity || 2.4) * sp * 0.75;
            }
            if (opts.glowColor !== undefined) saber.spillFilter.color = opts.glowColor;
        }
        
        // 2. Çizgi geometrisi güncellemesi (coreSize veya renk değişimi için)
        if (saber.graphics && saber.points) {
            const line = saber.graphics;
            const points = saber.points;
            const coreSizeVal = (opts.coreSize !== undefined && opts.coreSize !== null) ? Number(opts.coreSize) : 0;
            const tubeThickness = Math.max(2, coreSizeVal + 3);
            
            line.clear();
            line.lineStyle(tubeThickness, opts.glowColor, 0.95);
            renderPathPoints(line, points, opts.dashStyle);
            
            if (coreSizeVal > 0) {
                const coreThickness = Math.max(1, Math.round(coreSizeVal * 0.5));
                const coreAlpha = Math.min(0.65, 0.25 + (coreSizeVal / 30) * 0.4);
                line.lineStyle(coreThickness, opts.coreColor || opts.glowColor, coreAlpha);
                renderPathPoints(line, points, opts.dashStyle);
            }
            
            // Energy nodes (Işıklı Köşe Pinleri)
            // Yalnızca basit geometrik poligonlarda (3-8 köşe) ve energyNodes aktifse çizilir
            const isCurvedOrFree = opts.pathType === 'circle' || opts.pathType === 'free' || opts.shapeType === 'circle' || opts.shapeType === 'free' || opts.isCircle || opts.isFree;
            const isSimplePoly = (opts.pathType === 'polygon' || opts.pathType === 'rect') && points.length >= 3 && points.length <= 8;
            if (opts.energyNodes === true && !isCurvedOrFree && isSimplePoly) {
                const pinRadius = Math.max(3, (opts.coreSize || 0) + 2.5);
                for (let i = 0; i < points.length; i++) {
                    line.beginFill(opts.glowColor, 1.0);
                    line.drawCircle(points[i].x, points[i].y, pinRadius);
                    line.endFill();
                }
            }
        }

        // 3. Titreme ve Nabız Hızı sıfırlandığında dal veya partikül kalıntılarını derhal temizle
        const flickerVal = (opts.flickerAmount !== undefined && opts.flickerAmount !== null) ? Number(opts.flickerAmount) : 0;
        const pulseVal = (opts.pulseSpeed !== undefined && opts.pulseSpeed !== null) ? Number(opts.pulseSpeed) : 0;

        if (flickerVal === 0) {
            if (saber.branches && saber.branches.length > 0) {
                for (let i = saber.branches.length - 1; i >= 0; i--) {
                    const b = saber.branches[i];
                    const sprite = b.sprite || b;
                    if (sprite && sprite.parent) sprite.parent.removeChild(sprite);
                    if (sprite && sprite.destroy) sprite.destroy();
                }
                saber.branches = [];
            }
            redrawWithDistortion(saber, 0);
            saber._wasDistorted = false;
        }

        if (flickerVal === 0 && pulseVal === 0) {
            if (saber.particles && saber.particles.length > 0) {
                for (let i = saber.particles.length - 1; i >= 0; i--) {
                    const p = saber.particles[i];
                    if (p.sprite && p.sprite.parent) p.sprite.parent.removeChild(p.sprite);
                    if (p.sprite && p.sprite.destroy) p.sprite.destroy();
                }
                saber.particles = [];
            }
            saber.time = 0;
            if (saber.filter && saber.baseIntensity !== undefined) {
                saber.filter.outerStrength = saber.baseIntensity;
            }
        }
        
        // Tuvali tek kare render et ve animasyon kapalıysa ticker'ı kesinlikle durdur
        if (app && app.renderer && app.stage) {
            try { app.renderer.render(app.stage); } catch(e) {}
        }
        const isAnim = (typeof window.isSaberAnimationActive === 'function') ? window.isSaberAnimationActive() : false;
        if (!isAnim && app && app.ticker && app.ticker.started) {
            app.ticker.stop();
        }
    }

    return {
        init: init,
        resize: resize,
        addTextSaber: addTextSaber,
        removeTextSaber: removeTextSaber,
        updateTextSaberPositions: updateTextSaberPositions,
        drawSaberLine: drawSaberLine,
        updateSaberParameters: updateSaberParameters,
        clear: clear,
        presets: presets,
        colorPresets: colorPresets,
        defaults: defaults,
        getApp: () => app,
        getSabers: () => sabers,
        setSaberTransform: setSaberTransform,
        setSaberVisibility: setSaberVisibility,
        setTextSaberVisibility: setTextSaberVisibility
    };
})();

// ═══════════════════════════════════════
// 🏹 20 PROFESYONEL OK UCU SABER GEOMETRİSİ
// ═══════════════════════════════════════
function getArrowHeadSaberPoints(tipX, tipY, headAngle, styleId, isStart, width) {
    const s = parseInt(styleId) || 1;
    const w = width || 4;
    const baseH = Math.max(w * 4.5, 14);
    const baseW = Math.max(w * 2.2, 7);
    const cos = (rad) => Math.cos(headAngle + rad);
    const sin = (rad) => Math.sin(headAngle + rad);

    switch(s) {
        case 1: { // 1. Klasik Keskin Ok
            const h = baseH;
            return [
                { x: tipX, y: tipY, moveTo: true, solid: true },
                { x: tipX - h * cos(-0.42), y: tipY - h * sin(-0.42), solid: true },
                { x: tipX - h * cos(0.42), y: tipY - h * sin(0.42), solid: true },
                { x: tipX, y: tipY, solid: true }
            ];
        }
        case 2: { // 2. Stealth / Çentikli Kanat
            const h = baseH * 1.1;
            return [
                { x: tipX, y: tipY, moveTo: true, solid: true },
                { x: tipX - h * cos(-0.45), y: tipY - h * sin(-0.45), solid: true },
                { x: tipX - (h * 0.5) * cos(0), y: tipY - (h * 0.5) * sin(0), solid: true },
                { x: tipX - h * cos(0.45), y: tipY - h * sin(0.45), solid: true },
                { x: tipX, y: tipY, solid: true }
            ];
        }
        case 3: { // 3. Zarif Açık V
            const h = baseH * 1.1;
            return [
                { x: tipX - h * cos(-0.5), y: tipY - h * sin(-0.5), moveTo: true, solid: true },
                { x: tipX, y: tipY, solid: true },
                { x: tipX - h * cos(0.5), y: tipY - h * sin(0.5), solid: true }
            ];
        }
        case 4: { // 4. Kalın Dolu Chevron
            const h = baseH;
            const thick = Math.max(w * 1.5, 5);
            const p1x = tipX - h * cos(-0.5), p1y = tipY - h * sin(-0.5);
            const p2x = tipX - (h - thick) * cos(-0.5) - thick * cos(0), p2y = tipY - (h - thick) * sin(-0.5) - thick * sin(0);
            const p3x = tipX - thick * 1.2 * cos(0), p3y = tipY - thick * 1.2 * sin(0);
            const p4x = tipX - (h - thick) * cos(0.5) - thick * cos(0), p4y = tipY - (h - thick) * sin(0.5) - thick * sin(0);
            const p5x = tipX - h * cos(0.5), p5y = tipY - h * sin(0.5);
            return [
                { x: tipX, y: tipY, moveTo: true, solid: true },
                { x: p1x, y: p1y, solid: true },
                { x: p2x, y: p2y, solid: true },
                { x: p3x, y: p3y, solid: true },
                { x: p4x, y: p4y, solid: true },
                { x: p5x, y: p5y, solid: true },
                { x: tipX, y: tipY, solid: true }
            ];
        }
        case 5:   // 5. Dolu Elmas
        case 6: { // 6. İçi Boş Elmas
            const h = baseH * 0.7;
            return [
                { x: tipX, y: tipY, moveTo: true, solid: true },
                { x: tipX - h * cos(-0.5), y: tipY - h * sin(-0.5), solid: true },
                { x: tipX - (h * 2) * cos(0), y: tipY - (h * 2) * sin(0), solid: true },
                { x: tipX - h * cos(0.5), y: tipY - h * sin(0.5), solid: true },
                { x: tipX, y: tipY, solid: true }
            ];
        }
        case 7:   // 7. Dairesel Dolu Nokta
        case 8: { // 8. Hedef / Halka
            const r = baseW;
            const pts = [];
            const steps = 16;
            for (let i = 0; i <= steps; i++) {
                const th = (i / steps) * Math.PI * 2;
                pts.push({
                    x: tipX + r * Math.cos(th),
                    y: tipY + r * Math.sin(th),
                    moveTo: i === 0,
                    solid: true
                });
            }
            return pts;
        }
        case 9:    // 9. Kare / Teknik Blok
        case 10: { // 10. İçi Boş Kare
            const sSize = baseW * 1.6;
            const s2 = sSize / 2;
            const cosA = Math.cos(headAngle);
            const sinA = Math.sin(headAngle);
            const localCorners = [
                { lx: -s2, ly: -s2 },
                { lx: s2, ly: -s2 },
                { lx: s2, ly: s2 },
                { lx: -s2, ly: s2 },
                { lx: -s2, ly: -s2 }
            ];
            return localCorners.map((c, idx) => ({
                x: tipX + c.lx * cosA - c.ly * sinA,
                y: tipY + c.lx * sinA + c.ly * cosA,
                moveTo: idx === 0,
                solid: true
            }));
        }
        case 11: { // 11. T-Çizgi / Stoper
            const barLen = Math.max(w * 5, 16);
            return [
                { x: tipX - (barLen / 2) * cos(Math.PI / 2), y: tipY - (barLen / 2) * sin(Math.PI / 2), moveTo: true, solid: true },
                { x: tipX + (barLen / 2) * cos(Math.PI / 2), y: tipY + (barLen / 2) * sin(Math.PI / 2), solid: true }
            ];
        }
        case 12: { // 12. 45° Çapraz Kesit
            const slashLen = Math.max(w * 5, 16);
            return [
                { x: tipX - (slashLen / 2) * cos(Math.PI / 4), y: tipY - (slashLen / 2) * sin(Math.PI / 4), moveTo: true, solid: true },
                { x: tipX + (slashLen / 2) * cos(Math.PI / 4), y: tipY + (slashLen / 2) * sin(Math.PI / 4), solid: true }
            ];
        }
        case 13: { // 13. Çift Katman Ok
            const h = baseH * 0.85;
            const off = h * 0.8;
            return [
                { x: tipX, y: tipY, moveTo: true, solid: true },
                { x: tipX - h * cos(-0.45), y: tipY - h * sin(-0.45), solid: true },
                { x: tipX - h * cos(0.45), y: tipY - h * sin(0.45), solid: true },
                { x: tipX, y: tipY, solid: true },
                { x: tipX - off * cos(0), y: tipY - off * sin(0), moveTo: true, solid: true },
                { x: tipX - (off + h) * cos(-0.45), y: tipY - (off + h) * sin(-0.45), solid: true },
                { x: tipX - (off + h) * cos(0.45), y: tipY - (off + h) * sin(0.45), solid: true },
                { x: tipX - off * cos(0), y: tipY - off * sin(0), solid: true }
            ];
        }
        case 14: { // 14. Üç Katman Akış
            const h = baseH * 0.7;
            const pts = [];
            for (let i = 0; i < 3; i++) {
                const off = i * (h * 0.65);
                const tx = tipX - off * cos(0);
                const ty = tipY - off * sin(0);
                pts.push({ x: tx - h * cos(-0.5), y: ty - h * sin(-0.5), moveTo: true, solid: true });
                pts.push({ x: tx, y: ty, solid: true });
                pts.push({ x: tx - h * cos(0.5), y: ty - h * sin(0.5), solid: true });
            }
            return pts;
        }
        case 15: { // 15. Kavisli Bıçak
            const h = baseH * 1.1;
            const cp1x = tipX - h * 0.4 * cos(0) - h * 0.6 * sin(0);
            const cp1y = tipY - h * 0.4 * sin(0) + h * 0.6 * cos(0);
            const p1x = tipX - h * cos(-0.5);
            const p1y = tipY - h * sin(-0.5);
            const backX = tipX - (h * 0.4) * cos(0);
            const backY = tipY - (h * 0.4) * sin(0);
            const p2x = tipX - h * cos(0.5);
            const p2y = tipY - h * sin(0.5);
            const cp2x = tipX - h * 0.4 * cos(0) + h * 0.6 * sin(0);
            const cp2y = tipY - h * 0.4 * sin(0) - h * 0.6 * cos(0);

            const pts = [{ x: tipX, y: tipY, moveTo: true, solid: true }];
            for (let t = 0.25; t <= 1; t += 0.25) {
                const it = 1 - t;
                pts.push({
                    x: it * it * tipX + 2 * it * t * cp1x + t * t * p1x,
                    y: it * it * tipY + 2 * it * t * cp1y + t * t * p1y,
                    solid: true
                });
            }
            pts.push({ x: backX, y: backY, solid: true });
            pts.push({ x: p2x, y: p2y, solid: true });
            for (let t = 0.25; t <= 1; t += 0.25) {
                const it = 1 - t;
                pts.push({
                    x: it * it * p2x + 2 * it * t * cp2x + t * t * tipX,
                    y: it * it * p2y + 2 * it * t * cp2y + t * t * tipY,
                    solid: true
                });
            }
            pts.push({ x: tipX, y: tipY, solid: true });
            return pts;
        }
        case 16: { // 16. Yumuşak Yuvarlak Üçgen
            const h = baseH;
            return [
                { x: tipX, y: tipY, moveTo: true, solid: true },
                { x: tipX - h * cos(-0.45), y: tipY - h * sin(-0.45), solid: true },
                { x: tipX - h * cos(0.45), y: tipY - h * sin(0.45), solid: true },
                { x: tipX, y: tipY, solid: true }
            ];
        }
        case 17: { // 17. İğne Roket Dart
            const h = baseH * 1.5;
            return [
                { x: tipX, y: tipY, moveTo: true, solid: true },
                { x: tipX - h * cos(-0.28), y: tipY - h * sin(-0.28), solid: true },
                { x: tipX - (h * 0.65) * cos(0), y: tipY - (h * 0.65) * sin(0), solid: true },
                { x: tipX - h * cos(0.28), y: tipY - h * sin(0.28), solid: true },
                { x: tipX, y: tipY, solid: true }
            ];
        }
        case 18: { // 18. Harita Pini
            if (isStart) {
                return getArrowHeadSaberPoints(tipX, tipY, headAngle, 7, false, w);
            } else {
                return getArrowHeadSaberPoints(tipX, tipY, headAngle, 1, false, w);
            }
        }
        case 19: { // 19. Çift Yönlü Mimari Ok
            return getArrowHeadSaberPoints(tipX, tipY, headAngle, 1, false, w);
        }
        case 20: { // 20. T-Bar ve Ok Kombosu
            if (isStart) {
                return getArrowHeadSaberPoints(tipX, tipY, headAngle, 11, false, w);
            } else {
                return getArrowHeadSaberPoints(tipX, tipY, headAngle, 1, false, w);
            }
        }
        default: {
            const h = baseH;
            return [
                { x: tipX, y: tipY, moveTo: true, solid: true },
                { x: tipX - h * cos(-0.42), y: tipY - h * sin(-0.42), solid: true },
                { x: tipX - h * cos(0.42), y: tipY - h * sin(0.42), solid: true },
                { x: tipX, y: tipY, solid: true }
            ];
        }
    }
}

function getArrowSaberPoints(path) {
    let x1 = path.x1;
    let y1 = path.y1;
    let x2 = path.x2;
    let y2 = path.y2;
    if (typeof x1 === 'undefined' && path.points && path.points.length >= 2) {
        x1 = path.points[0].x;
        y1 = path.points[0].y;
        x2 = path.points[path.points.length - 1].x;
        y2 = path.points[path.points.length - 1].y;
    }
    if (typeof x1 === 'undefined' || typeof x2 === 'undefined') {
        return [];
    }
    
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const totalDist = Math.hypot(x2 - x1, y2 - y1);
    const sId = parseInt(path.arrowStyle || path.style) || 1;
    const dir = path.arrowDir || path.dir || 'outward';
    const w = path.width || 4;
    const baseH = Math.max(w * 4.5, 14);
    const cutDist = (sId === 3 || sId === 11 || sId === 12) ? 0 : Math.min(baseH * 0.45, 14);
    const effectiveCut = Math.min(cutDist, totalDist * 0.4);
    
    let lx1 = x1, ly1 = y1, lx2 = x2, ly2 = y2;
    if (dir === 'outward' || dir === 'both' || sId >= 18) {
        lx2 -= effectiveCut * Math.cos(angle);
        ly2 -= effectiveCut * Math.sin(angle);
    }
    if (dir === 'inward' || dir === 'both' || sId >= 18) {
        lx1 += effectiveCut * Math.cos(angle);
        ly1 += effectiveCut * Math.sin(angle);
    }
    
    // 1. Ok gövde çizgisi
    const points = [
        { x: lx1, y: ly1 },
        { x: lx2, y: ly2 }
    ];
    
    // 2. Seçili ok ucu şekli
    if (sId === 18 || sId === 19 || sId === 20) {
        const head2 = getArrowHeadSaberPoints(x2, y2, angle, sId, false, w);
        const head1 = getArrowHeadSaberPoints(x1, y1, angle + Math.PI, sId, true, w);
        points.push(...head2);
        points.push(...head1);
    } else {
        if (dir === 'outward' || dir === 'both') {
            const head2 = getArrowHeadSaberPoints(x2, y2, angle, sId, false, w);
            points.push(...head2);
        }
        if (dir === 'inward' || dir === 'both') {
            const head1 = getArrowHeadSaberPoints(x1, y1, angle + Math.PI, sId, true, w);
            points.push(...head1);
        }
    }
    
    return points;
}
window.getArrowSaberPoints = getArrowSaberPoints;

// ═══════════════════════════════════════
// PATH'E SABER EKLE / KALDIR / DÜZENLE
// ═══════════════════════════════════════

// Path'ten saber çıkar (path noktalarını al, motora gönder)
window.applySaberToPath = function(pathIndex, saberOptions) {
    if (typeof drawPaths === 'undefined' || !window.SaberEngine) return null;
    const path = drawPaths[pathIndex];
    if (!path) return null;
    
    // Eski saber varsa temizle
    if (path.saberRef) {
        try {
            const sabers = SaberEngine.getSabers();
            const idx = sabers.indexOf(path.saberRef);
            if (idx > -1) {
                const s = sabers[idx];
                if (s.graphics?.parent) s.graphics.parent.removeChild(s.graphics);
                if (s.particleContainer?.parent) s.particleContainer.parent.removeChild(s.particleContainer);
                if (s.branchContainer?.parent) s.branchContainer.parent.removeChild(s.branchContainer);
                sabers.splice(idx, 1);
            }
        } catch(e) {}
    }
    
    // Path tipine göre noktalar
    let points = [];
    if (path.type === 'free' || path.type === 'polygon') {
        if (path.type === 'polygon' && window.BezierCurves && typeof window.BezierCurves.samplePathWithCurves === 'function' && path.points) {
            points = window.BezierCurves.samplePathWithCurves(path.points, true);
        } else {
            points = path.points ? path.points.slice() : [];
            if (path.type === 'polygon' && points.length > 2) {
                const first = points[0];
                const last = points[points.length - 1];
                if (Math.hypot(first.x - last.x, first.y - last.y) > 2) {
                    points.push({ x: first.x, y: first.y });
                }
            }
        }
    } else if (path.type === 'line') {
        points = [{x: path.x1, y: path.y1}, {x: path.x2, y: path.y2}];
    } else if (path.type === 'arrow') {
        points = getArrowSaberPoints(path);
    } else if (path.type === 'rect') {
        if (path.points && path.points.length >= 4) {
            points = path.points.slice();
            const first = points[0];
            const last = points[points.length - 1];
            if (Math.hypot(first.x - last.x, first.y - last.y) > 2) {
                points.push({ x: first.x, y: first.y });
            }
        } else {
            const minX = Math.min(path.x1, path.x2);
            const maxX = Math.max(path.x1, path.x2);
            const minY = Math.min(path.y1, path.y2);
            const maxY = Math.max(path.y1, path.y2);
            points = [
                {x: minX, y: minY}, {x: maxX, y: minY},
                {x: maxX, y: maxY}, {x: minX, y: maxY},
                {x: minX, y: minY}
            ];
        }
    } else if (path.type === 'circle') {
        const cx = (path.x1 + path.x2) / 2;
        const cy = (path.y1 + path.y2) / 2;
        const rx = Math.abs(path.x2 - path.x1) / 2;
        const ry = Math.abs(path.y2 - path.y1) / 2;
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            points.push({x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry});
        }
    }
    
    if (points.length < 2) return null;
    
    if (!SaberEngine.getApp()) {
        SaberEngine.init(document.getElementById('canvas-container'));
    }
    
    const app = SaberEngine.getApp();
    const isAnimActive = (typeof window.isSaberAnimationActive === 'function')
        ? window.isSaberAnimationActive()
        : document.body.classList.contains('saber-animation-active');

    if (app && app.ticker) {
        if (isAnimActive && !app.ticker.started) {
            app.ticker.start();
        } else if (!isAnimActive && app.ticker.started) {
            app.ticker.stop();
        }
    }
    
    const dc = document.getElementById('draw-layer') || document.getElementById('drawCanvas');
    if (dc && app && app.renderer) {
        const targetW = dc.width || 1920;
        const targetH = dc.height || 1080;
        if (app.renderer.width !== targetW || app.renderer.height !== targetH) {
            SaberEngine.resize(targetW, targetH);
        }
    }
    
    const effectiveOptions = Object.assign({}, saberOptions);
    effectiveOptions.pathType = path.type;
    effectiveOptions.dashStyle = path.dashStyle || 'solid';
    if (path.type !== 'free') {
        effectiveOptions.distortionAmount = 0;
    }
    if (path.type === 'circle' || path.type === 'free' || path.type === 'arrow' || path.type === 'line' || (path.points && path.points.length > 8)) {
        effectiveOptions.energyNodes = false;
    }
    const saberObj = SaberEngine.drawSaberLine(points, effectiveOptions);
    if (saberObj) {
        path.saberRef = saberObj;
        path.hasSaber = true;
        path.saber = true;
        path.saberOptions = saberOptions;
        const gHex = (saberOptions && saberOptions.glowColor)
            ? (typeof saberOptions.glowColor === 'number' ? '#' + saberOptions.glowColor.toString(16).padStart(6, '0') : saberOptions.glowColor)
            : null;
        if (gHex) {
            path.color = gHex;
            if (!path.fillColor || path.fillColor === '#ef4444' || path.fillColor === '#e74c3c') {
                path.fillColor = gHex;
            }
        }
        
        // Element rotasyonu ve merkezini belirle
        const rot = (path.rotation !== undefined) 
            ? path.rotation 
            : (path.el && path.el.dataset.rotation ? parseFloat(path.el.dataset.rotation) : 0);
        path.rotation = rot;

        const curScale = (path.scale !== undefined)
            ? path.scale
            : (path.el && path.el.dataset.scale ? parseFloat(path.el.dataset.scale) : 1);

        let cx = saberObj.centerX;
        let cy = saberObj.centerY;
        if (path.el) {
            const baseL = parseFloat(path.el.dataset.baseLeft !== undefined ? path.el.dataset.baseLeft : path.el.style.left) || 0;
            const baseT = parseFloat(path.el.dataset.baseTop !== undefined ? path.el.dataset.baseTop : path.el.style.top) || 0;
            const baseW = parseFloat(path.el.dataset.baseWidth) || path.el.offsetWidth || 0;
            const baseH = parseFloat(path.el.dataset.baseHeight) || path.el.offsetHeight || 0;
            if (baseW > 0 && baseH > 0) {
                cx = baseL + baseW / 2;
                cy = baseT + baseH / 2;
            }
        }

        // Fotoğraf halihazırda hareket ettirilmişse transformu hemen ver!
        let tScale = curScale;
        let tDx = 0;
        let tDy = 0;
        if (path.photoRef && typeof window.getCurrentPhotoState === 'function' && typeof window.calculateTransformParams === 'function') {
            const currObj = window.getCurrentPhotoState();
            if (currObj) {
                const tParams = window.calculateTransformParams(path.photoRef, currObj);
                if (tParams) {
                    tScale = tParams.scale * curScale;
                    tDx = cx * (tParams.scale - 1) + tParams.dx;
                    tDy = cy * (tParams.scale - 1) + tParams.dy;
                }
            }
        }
        
        if (rot !== 0 || tScale !== 1 || tDx !== 0 || tDy !== 0) {
            SaberEngine.setSaberTransform(saberObj, tScale, tDx, tDy, false, rot, cx, cy);
        }
    }
    if (app && app.renderer && app.stage) {
        try { app.renderer.render(app.stage); } catch(e) {}
    }
    if (!isAnimActive && app && app.ticker && app.ticker.started) {
        app.ticker.stop();
    }
    return saberObj;
};

// PATH'E SABER EKLE (mevcut state ile)
window.addSaberToPath = function(pathIndex) {
    const state = window.saberState || {};
    const options = {
        preset: state.preset || 'fully-lit',
        coreColor: state.coreColor || 0xFFFFFF,
        glowColor: state.glowColor || 0x00CEC9,
        coreSize: (state.coreSize !== undefined) ? state.coreSize : 0,
        glowSize: state.glowSize || 26,
        intensity: state.intensity || 2.6,
        energyNodes: (state.energyNodes !== undefined) ? state.energyNodes : false,
        flickerAmount: state.flickerAmount || 0.05,
        pulseSpeed: state.pulseSpeed || 0
    };
    if (typeof drawPaths !== 'undefined' && drawPaths[pathIndex]) {
        const p = drawPaths[pathIndex];
        const gHex = typeof options.glowColor === 'number' 
            ? '#' + options.glowColor.toString(16).padStart(6, '0') 
            : options.glowColor;
        p.color = gHex;
        if (!p.fillColor || p.fillColor === '#ef4444' || p.fillColor === '#e74c3c') {
            p.fillColor = gHex;
        }
    }
    applySaberToPath(pathIndex, options);
    if (typeof updateDrawHistory === 'function') updateDrawHistory();
    if (typeof startDrawEdit === 'function') {
        startDrawEdit(pathIndex, true);
    }
};

// PATH'İN SABER'INI KALDIR
window.removeSaberFromPath = function(pathIndex) {
    if (typeof drawPaths === 'undefined') return;
    const path = drawPaths[pathIndex];
    if (!path) return;
    
    if (path.saberRef && window.SaberEngine) {
        try {
            const sabers = SaberEngine.getSabers();
            const idx = sabers.indexOf(path.saberRef);
            if (idx > -1) {
                const s = sabers[idx];
                if (s.graphics?.parent) s.graphics.parent.removeChild(s.graphics);
                if (s.particleContainer?.parent) s.particleContainer.parent.removeChild(s.particleContainer);
                if (s.branchContainer?.parent) s.branchContainer.parent.removeChild(s.branchContainer);
                if (s.graphics?.destroy) s.graphics.destroy();
                if (s.particleContainer?.destroy) s.particleContainer.destroy();
                if (s.branchContainer?.destroy) s.branchContainer.destroy();
                sabers.splice(idx, 1);
            }
        } catch(e) {}
    }
    
    delete path.saberRef;
    delete path.hasSaber;
    path.hasSaber = false;
    path.saber = false;
    delete path.saberOptions;

    // WebGL sahnesini anında yeniden render et (kalan izler silinsin)
    if (window.SaberEngine) {
        const app = SaberEngine.getApp ? SaberEngine.getApp() : null;
        if (app && app.renderer && app.stage) {
            try { app.renderer.render(app.stage); } catch(e) {}
        }
        const sabers = SaberEngine.getSabers ? SaberEngine.getSabers() : [];
        if (sabers.length === 0 && app && app.ticker && app.ticker.started) {
            app.ticker.stop();
        }
    }

    if (path.el && typeof updateSinglePathSvg === 'function') {
        updateSinglePathSvg(path);
    }
    if (typeof redrawAll === 'function') {
        redrawAll();
    }
    if (typeof updateDrawHistory === 'function') updateDrawHistory();
};





