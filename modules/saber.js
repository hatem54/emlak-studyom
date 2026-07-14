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
        coreColor: 0xFFFFFF,      // İç renk (beyaz)
        glowColor: 0x00AAFF,      // Dış parlama (mavi)
        coreSize: 4,               // İç kalınlık
        glowSize: 30,              // Dış parlama boyutu
        intensity: 2.5,            // Parlama şiddeti
        flickerAmount: 0.05,       // Titreme
        pulseSpeed: 0,             // Nabız hızı (0=kapalı)
        distortionAmount: 0,       // Bozulma
        segments: 50               // Çizgi segmentleri
    };
    
    // ⚡ PRESET TANIMLARI
    const presets = {
        'fully-lit': {
            name: 'Fully Lit',
            icon: '✨',
            settings: { 
                glowSize: 30, intensity: 2.5, flickerAmount: 0.02, 
                pulseSpeed: 0, distortionAmount: 0,
                coreColor: 0xFFFFFF, glowColor: 0x00AAFF 
            }
        },
        'electric': {
            name: 'Electric',
            icon: '⚡',
            settings: { 
                glowSize: 25, intensity: 3, flickerAmount: 0.15, 
                pulseSpeed: 0, distortionAmount: 8,
                coreColor: 0xEEFFFF, glowColor: 0x4488FF 
            }
        },
        'fire': {
            name: 'Fire',
            icon: '🔥',
            settings: { 
                glowSize: 40, intensity: 3.5, flickerAmount: 0.2, 
                pulseSpeed: 2, distortionAmount: 5,
                coreColor: 0xFFEE88, glowColor: 0xFF4400 
            }
        },
        'sparks': {
            name: 'Sparks',
            icon: '💫',
            settings: { 
                glowSize: 20, intensity: 4, flickerAmount: 0.3, 
                pulseSpeed: 0, distortionAmount: 3,
                coreColor: 0xFFFFCC, glowColor: 0xFFAA00 
            }
        },
        'energize': {
            name: 'Energize',
            icon: '🎯',
            settings: { 
                glowSize: 35, intensity: 3, flickerAmount: 0.08, 
                pulseSpeed: 3, distortionAmount: 4,
                coreColor: 0xFFFFFF, glowColor: 0x00FF44 
            }
        },
        'sine': {
            name: 'Sine Wave',
            icon: '🌊',
            settings: { 
                glowSize: 28, intensity: 2.8, flickerAmount: 0.03, 
                pulseSpeed: 1.5, distortionAmount: 6,
                coreColor: 0xFFFFFF, glowColor: 0x00CEC9 
            }
        },
        'vortex': {
            name: 'Vortex',
            icon: '🌪️',
            settings: { 
                glowSize: 32, intensity: 3.2, flickerAmount: 0.05, 
                pulseSpeed: 4, distortionAmount: 10,
                coreColor: 0xFFEEFF, glowColor: 0xAA00FF 
            }
        },
        'liquid': {
            name: 'Liquid',
            icon: '💧',
            settings: { 
                glowSize: 45, intensity: 2, flickerAmount: 0.01, 
                pulseSpeed: 1, distortionAmount: 3,
                coreColor: 0xEEFFFF, glowColor: 0x00AAFF 
            }
        },
        'lightning': {
            name: 'Lightning',
            icon: '⚡',
            settings: { 
                glowSize: 22, intensity: 4.5, flickerAmount: 0.4, 
                pulseSpeed: 0, distortionAmount: 15,
                coreColor: 0xFFFFFF, glowColor: 0xBB88FF 
            }
        },
        'rainbow': {
            name: 'Rainbow',
            icon: '🌈',
            settings: { 
                glowSize: 35, intensity: 3, flickerAmount: 0.05, 
                pulseSpeed: 0, distortionAmount: 0, rainbow: true,
                coreColor: 0xFFFFFF, glowColor: 0xFF0088 
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
        
        const w = canvasContainer.offsetWidth || 1920;
        const h = canvasContainer.offsetHeight || 1080;
        
        app = new PIXI.Application({
            width: w,
            height: h,
            transparent: true,
            backgroundAlpha: 0,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });
        
        app.view.style.position = 'absolute';
        app.view.style.top = '0';
        app.view.style.left = '0';
        app.view.style.width = '100%';
        app.view.style.height = '100%';
        app.view.style.pointerEvents = 'none';
        app.view.style.zIndex = '40'; // Template layer'larının ve arka planların üzerinde, ui-layer'ın (50) altında
        app.view.id = 'saber-layer';
        
        canvasContainer.appendChild(app.view);
        
        container = new PIXI.Container();
        app.stage.addChild(container);
        const textContainer = new PIXI.Container();
        app.stage.addChild(textContainer);
        app.textContainer = textContainer;
        app.textObjects = {};
        
        // Animasyon ticker
        app.ticker.add(animate);
        
        console.log('⚡ SaberEngine başlatıldı');
        return app;
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
        
        // Ana çizgi (core)
        const line = new PIXI.Graphics();
        line.lineStyle(opts.coreSize, opts.coreColor, 1);
        
        if (points.length > 0) {
            line.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                line.lineTo(points[i].x, points[i].y);
            }
        }
        
        // Glow filtresi
        const glowFilter = new PIXI.filters.GlowFilter({
            distance: opts.glowSize,
            outerStrength: opts.intensity,
            innerStrength: 1,
            color: opts.glowColor,
            quality: 0.5
        });
        
        line.filters = [glowFilter];
        
        // Partikül container (fire/sparks için)
        const particleContainer = new PIXI.Container();
        particleContainer.filters = [new PIXI.filters.GlowFilter({
            distance: opts.glowSize * 0.6,
            outerStrength: opts.intensity * 0.8,
            innerStrength: 1,
            color: opts.glowColor,
            quality: 0.3
        })];
        
        // Lightning dalları için ayrı container
        const branchContainer = new PIXI.Container();
        branchContainer.filters = [new PIXI.filters.GlowFilter({
            distance: opts.glowSize * 0.5,
            outerStrength: opts.intensity,
            innerStrength: 1,
            color: opts.glowColor,
            quality: 0.3
        })];
        
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
            presetName: options.preset || 'fully-lit'
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
        
        
        sabers.forEach(saber => {
            saber.time += delta * 0.05;
            const opts = saber.options;
            const preset = saber.presetName;
            
            // ═══ FLICKER (titreme) ═══
            if (opts.flickerAmount > 0 && !opts.pulseSpeed) {
                const flicker = 1 + (Math.random() - 0.5) * opts.flickerAmount;
                saber.filter.outerStrength = saber.baseIntensity * flicker;
            }
            
            // ═══ PULSE (nabız) ═══
            if (opts.pulseSpeed > 0 && preset !== 'fire') {
                const pulse = 1 + Math.sin(saber.time * opts.pulseSpeed) * 0.3;
                saber.filter.outerStrength = saber.baseIntensity * pulse;
            }
            
            // ═══ RAINBOW (renk geçişi) ═══
            if (opts.rainbow) {
                const hue = (saber.time * 20) % 360;
                const rgb = hslToRgb(hue / 360, 1, 0.5);
                const color = (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
                saber.filter.color = color;
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
                // Hızlı titreşim (elektrik gibi ama daha düzenli)
                const pulse1 = Math.sin(saber.time * 12) * 0.4;
                const pulse2 = Math.sin(saber.time * 7) * 0.3;
                const combined = 1 + pulse1 + pulse2;
                saber.filter.outerStrength = saber.baseIntensity * combined;
                
                // Ana çizgide hafif titreşim (electric'ten daha yumuşak)
                if (Math.random() < 0.25 && saber.graphics && saber.points) {
                    const line = saber.graphics;
                    const points = saber.points;
                    line.clear();
                    line.lineStyle(saber.options.coreSize, saber.options.coreColor, 1);
                    if (points.length > 0) {
                        line.moveTo(points[0].x, points[0].y);
                        for (let i = 1; i < points.length; i++) {
                            const offset = (Math.random() - 0.5) * 3;
                            line.lineTo(points[i].x, points[i].y + offset);
                        }
                    }
                }
                
                // Küçük enerji parçacıkları (nadir, ince)
                if (Math.random() < 0.15 && saber.particles.length < 20) {
                    const points = saber.points;
                    const basePoint = getRandomPoint(saber);
                    if (basePoint) {
                        const particle = new PIXI.Graphics();
                        particle.beginFill(opts.coreColor, 1);
                        particle.drawCircle(0, 0, 1);
                        particle.endFill();
                        particle.blendMode = PIXI.BLEND_MODES.ADD;
                        particle.x = basePoint.x;
                        particle.y = basePoint.y;
                        
                        saber.particleContainer.addChild(particle);
                        const angle = Math.random() * Math.PI * 2;
                        saber.particles.push({
                            sprite: particle,
                            vx: Math.cos(angle) * 1.5,
                            vy: Math.sin(angle) * 1.5,
                            life: 1.0,
                            decay: 0.05,
                            energize: true
                        });
                    }
                }
                
                // Enerji parçacıklarını hareket ettir
                for (let i = saber.particles.length - 1; i >= 0; i--) {
                    const p = saber.particles[i];
                    if (p.energize) {
                        p.sprite.x += p.vx;
                        p.sprite.y += p.vy;
                        p.vx *= 0.95;
                        p.vy *= 0.95;
                        p.life -= p.decay;
                        p.sprite.alpha = p.life;
                        
                        if (p.life <= 0) {
                            saber.particleContainer.removeChild(p.sprite);
                            p.sprite.destroy();
                            saber.particles.splice(i, 1);
                        }
                    }
                }
            }

            // ⚡ ELECTRIC - Klasik titreme (mevcut)
            else if (preset === 'electric' && opts.distortionAmount > 0 && Math.random() < 0.4) {
                redrawWithDistortion(saber);
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
        if (saber.points && saber.points.length > 0) {
            return saber.points[Math.floor(Math.random() * saber.points.length)];
        } else if (saber.pixiText) {
            const p = saber.pixiText.style.padding || 0;
            return {
                x: saber.pixiText.x + p + Math.random() * (Math.max(1, saber.pixiText.width - 2*p)),
                y: saber.pixiText.y + p + Math.random() * (Math.max(1, saber.pixiText.height - 2*p))
            };
        }
        return {x: 0, y: 0};
    }

    // 🔥 FIRE - Gerçek alev dilleri
    // ═══════════════════════════════════════
    function animateFire(saber) {
        // Ana çizgide yoğun titreme
        const flicker = 0.7 + Math.random() * 0.6;
        saber.filter.outerStrength = saber.baseIntensity * flicker;
        
        // ÇOK yeni partikül üret (yoğun alev için)
        const points = saber.points;
        const spawnCount = 1; // Her frame'de 1 partikül
        
        for (let s = 0; s < spawnCount; s++) {
            if (saber.particles.length >= 80) break;
            
            const basePoint = getRandomPoint(saber);
            if (!basePoint) continue;
            
            const particle = new PIXI.Graphics();
            
            // Alev şekli - uzun oval (baloncuk değil)
            const size = 3 + Math.random() * 5;
            const isCore = Math.random() < 0.4;
            const colors = isCore 
                ? [0xFFFFCC, 0xFFEE00, 0xFFDD00] // İç kısım: sarı-beyaz
                : [0xFF6600, 0xFF3300, 0xFF8800, 0xCC2200]; // Dış: turuncu-kırmızı
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // OVAL çiz (baloncuk değil, alev dili)
            particle.beginFill(color, 0.85);
            particle.drawEllipse(0, 0, size * 0.6, size * 1.3);
            particle.endFill();
            
            particle.x = basePoint.x + (Math.random() - 0.5) * 15;
            particle.y = basePoint.y + (Math.random() - 0.5) * 5;
            particle.blendMode = PIXI.BLEND_MODES.ADD; // Işık gibi karışsın
            
            saber.particleContainer.addChild(particle);
            saber.particles.push({
                sprite: particle,
                vx: (Math.random() - 0.5) * 0.8,
                vy: -2 - Math.random() * 3, // Hızlı yükseliş
                life: 1.0,
                decay: 0.025 + Math.random() * 0.02,
                initialSize: size,
                wobble: Math.random() * Math.PI * 2
            });
        }
        
        // Alev partiküllerini hareket ettir
        for (let i = saber.particles.length - 1; i >= 0; i--) {
            const p = saber.particles[i];
            p.wobble += 0.15;
            p.sprite.x += p.vx + Math.sin(p.wobble) * 0.4; // Salınım
            p.sprite.y += p.vy;
            p.vy -= 0.08; // Sıcak hava ivmesi (yukarı)
            p.life -= p.decay;
            p.sprite.alpha = p.life * 0.9;
            
            // Yükseldikçe küçül ve inceli (alev dili gibi)
            const scale = p.life;
            p.sprite.scale.x = scale;
            p.sprite.scale.y = scale * 1.3;
            
            // Renk soğuma (kırmızıya dön)
            if (p.life < 0.4) {
                p.sprite.tint = 0x882200;
            }
            
            if (p.life <= 0) {
                saber.particleContainer.removeChild(p.sprite);
                p.sprite.destroy();
                saber.particles.splice(i, 1);
            }
        }
    }
    
    // ═══════════════════════════════════════
    // 💫 SPARKS - Yoğun kıvılcım fıskiyesi
    // ═══════════════════════════════════════
    function animateSparks(saber) {
        const flicker = 0.6 + Math.random() * 0.8;
        saber.filter.outerStrength = saber.baseIntensity * flicker;
        
        const points = saber.points;
        
        // Yoğun kıvılcım üretimi
        for (let s = 0; s < 2; s++) {
            if (saber.particles.length >= 60) break;
            
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
            const speed = 2 + Math.random() * 6;
            saber.particles.push({
                sprite: particle,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.03,
                gravity: 0.2,
                trail: [] // İz noktaları
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
                saber.particleContainer.removeChild(p.sprite);
                p.sprite.destroy();
                saber.particles.splice(i, 1);
            }
        }
    }
    
    // ═══════════════════════════════════════
    // ⚡ LIGHTNING - Yoğun yıldırım dalları
    // ═══════════════════════════════════════
    function animateLightning(saber) {
        // Delice titreme
        const flicker = 0.4 + Math.random() * 1.2;
        saber.filter.outerStrength = saber.baseIntensity * flicker;
        
        // Ana çizgide sürekli bozulma
        if (Math.random() < 0.7) redrawWithDistortion(saber);
        
        // Eski dalları temizle
        saber.branches.forEach(b => {
            saber.branchContainer.removeChild(b);
            b.destroy();
        });
        saber.branches = [];
        
        // Yeni dallar - çok yoğun
        if (Math.random() < 0.35) {
            const points = saber.points;
            const branchCount = 1 + Math.floor(Math.random() * 2);
            
            for (let b = 0; b < branchCount; b++) {
                const basePoint = getRandomPoint(saber);
                if (!basePoint) continue;
                
                const branch = new PIXI.Graphics();
                const thickness = 1 + Math.random() * 2;
                branch.lineStyle(thickness, 0xFFFFFF, 0.95);
                branch.moveTo(basePoint.x, basePoint.y);
                
                let x = basePoint.x;
                let y = basePoint.y;
                const angle = Math.random() * Math.PI * 2;
                const length = 30 + Math.random() * 100;
                const segments = 5 + Math.floor(Math.random() * 6);
                
                for (let i = 0; i < segments; i++) {
                    const segLen = length / segments;
                    x += Math.cos(angle + (Math.random() - 0.5) * 2) * segLen;
                    y += Math.sin(angle + (Math.random() - 0.5) * 2) * segLen;
                    branch.lineTo(x, y);
                }
                
                // Alt dallar (küçük çatallar)
                if (Math.random() < 0.5) {
                    const subAngle = angle + (Math.random() - 0.5) * 2;
                    const subLen = 15 + Math.random() * 30;
                    const subX = x + Math.cos(subAngle) * subLen;
                    const subY = y + Math.sin(subAngle) * subLen;
                    branch.moveTo(x, y);
                    branch.lineTo(subX, subY);
                }
                
                saber.branchContainer.addChild(branch);
                saber.branches.push(branch);
            }
        }
    }
    
    // ═══════════════════════════════════════
    // 🌊 SINE - Belirgin dalga
    // ═══════════════════════════════════════
    function animateSine(saber) {
        if (!saber.graphics || !saber.points) return;
        const line = saber.graphics;
        const points = saber.points;
        const t = saber.time;
        
        line.clear();
        line.lineStyle(saber.options.coreSize, saber.options.coreColor, 1);
        
        if (points.length > 0) {
            line.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                // Belirgin sinüs dalgası
                const wave = Math.sin(t * 4 + i * 0.5) * 12;
                const wave2 = Math.cos(t * 2 + i * 0.3) * 4;
                line.lineTo(points[i].x + wave2, points[i].y + wave);
            }
        }
    }
    
    // ═══════════════════════════════════════
    // 🌪️ VORTEX - Spiral helezon
    // ═══════════════════════════════════════
    function animateVortex(saber) {
        const t = saber.time;
        if (saber.graphics && saber.points) {
            const line = saber.graphics;
            const points = saber.points;
            line.clear();
            line.lineStyle(saber.options.coreSize, saber.options.coreColor, 1);
            if (points.length > 0) {
                line.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    const wave = Math.sin(t * 3 - i * 0.2) * 6;
                    line.lineTo(points[i].x + Math.sin(t*2)*wave, points[i].y + Math.cos(t*2)*wave);
                }
            }
        }
        
        // Vortex partikülleri (dönen enerji)
        if (Math.random() < 0.3 && saber.particles.length < 40) {
            const basePoint = getRandomPoint(saber);
            if (basePoint) {
                const particle = new PIXI.Graphics();
                particle.beginFill(saber.options.glowColor, 0.8);
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
                    decay: 0.02
                });
            }
        }
        
        // Vortex partiküllerini döndür
        for (let i = saber.particles.length - 1; i >= 0; i--) {
            const p = saber.particles[i];
            p.angle += 0.15;
            p.radius += 0.5;
            p.sprite.x = p.baseX + Math.cos(p.angle) * p.radius;
            p.sprite.y = p.baseY + Math.sin(p.angle) * p.radius;
            p.life -= p.decay;
            p.sprite.alpha = p.life;
            
            if (p.life <= 0) {
                saber.particleContainer.removeChild(p.sprite);
                p.sprite.destroy();
                saber.particles.splice(i, 1);
            }
        }
    }
    
    // ═══════════════════════════════════════
    // 💧 LIQUID - Organik sıvı akış
    // ═══════════════════════════════════════
    function animateLiquid(saber) {
        const t = saber.time;
        if (saber.graphics && saber.points) {
            const line = saber.graphics;
            const points = saber.points;
            line.clear();
            line.lineStyle(saber.options.coreSize, saber.options.coreColor, 1);
            if (points.length > 0) {
                line.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    const w1 = Math.sin(t * 1.2 + i * 0.15) * 5;
                    const w2 = Math.cos(t * 0.7 + i * 0.1) * 3;
                    const w3 = Math.sin(t * 0.4 + i * 0.05) * 2;
                    line.lineTo(points[i].x + w2 + w3, points[i].y + w1 + w3);
                }
            }
        }
        
        // Damla partikülleri
        if (Math.random() < 0.15 && saber.particles.length < 20) {
            const basePoint = getRandomPoint(saber);
            if (basePoint) {
                const particle = new PIXI.Graphics();
                particle.beginFill(saber.options.glowColor, 0.7);
                particle.drawEllipse(0, 0, 2, 3);
                particle.endFill();
                particle.blendMode = PIXI.BLEND_MODES.ADD;
                particle.x = basePoint.x;
                particle.y = basePoint.y;
                
                saber.particleContainer.addChild(particle);
                saber.particles.push({
                    sprite: particle,
                    vx: 0,
                    vy: 0.5,
                    life: 1.0,
                    decay: 0.015
                });
            }
        }
        
        // Damlaları düşür
        for (let i = saber.particles.length - 1; i >= 0; i--) {
            const p = saber.particles[i];
            p.sprite.x += p.vx;
            p.sprite.y += p.vy;
            p.vy += 0.05;
            p.life -= p.decay;
            p.sprite.alpha = p.life;
            
            if (p.life <= 0) {
                saber.particleContainer.removeChild(p.sprite);
                p.sprite.destroy();
                saber.particles.splice(i, 1);
            }
        }
    }
    
    // ⚡ ELECTRIC/LIGHTNING için titreşimli yeniden çizim
    function redrawWithDistortion(saber) {
        if (!saber.graphics || !saber.points) return;
        const line = saber.graphics;
        const points = saber.points;
        const amount = saber.options.distortionAmount;
        
        line.clear();
        line.lineStyle(saber.options.coreSize, saber.options.coreColor, 1);
        
        if (points.length > 0) {
            line.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                const offsetX = (Math.random() - 0.5) * amount;
                const offsetY = (Math.random() - 0.5) * amount;
                line.lineTo(points[i].x + offsetX, points[i].y + offsetY);
            }
        }
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
            const canvasContainer = document.getElementById('canvas-container');
            if (canvasContainer) {
                w = canvasContainer.offsetWidth || parseInt(canvasContainer.style.width) || 1920;
                h = canvasContainer.offsetHeight || parseInt(canvasContainer.style.height) || 1080;
            } else {
                w = 1920;
                h = 1080;
            }
        }
        if (app && app.renderer) {
            app.renderer.resize(w, h);
        }
    }

    // ═══════════════════════════════════════
    // 🎯 INDIVIDUAL SABER TRANSFORM
    // ═══════════════════════════════════════
    function setSaberTransform(saber, scale, dx, dy) {
        if (!saber) return;
        if (saber.graphics) {
            saber.graphics.x = dx;
            saber.graphics.y = dy;
            saber.graphics.scale.set(scale);
        }
        if (saber.particleContainer) {
            saber.particleContainer.x = dx;
            saber.particleContainer.y = dy;
            saber.particleContainer.scale.set(scale);
        }
        if (saber.branchContainer) {
            saber.branchContainer.x = dx;
            saber.branchContainer.y = dy;
            saber.branchContainer.scale.set(scale);
        }
    }

    // 💡 PUBLIC API

    function hexToPixiColor(hex) {
        return parseInt(hex.replace(/^#/, ''), 16);
    }


    // TEXT NODE BOUNDING BOX
    function getActualTextRect(el) {
        if (!el) return null;
        
        // Emlak Studio wraps text in .editable-text spans.
        // We should get the bounding box of that span to avoid padding offsets!
        const editableSpan = el.querySelector('.editable-text');
        if (editableSpan) {
            return editableSpan.getBoundingClientRect();
        }

        if (el.childNodes.length > 0) {
            const range = document.createRange();
            let textNode = null;
            // find the first non-empty text node
            for (let i = 0; i < el.childNodes.length; i++) {
                if (el.childNodes[i].nodeType === 3 && el.childNodes[i].textContent.trim() !== '') {
                    textNode = el.childNodes[i];
                    break;
                }
            }
            if (textNode) {
                range.selectNode(textNode);
                return range.getBoundingClientRect();
            }
        }
        return el.getBoundingClientRect();
    }

    function addTextSaber(id, el, opts) {

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
        const sf = (typeof scaleFactor !== 'undefined' ? scaleFactor : 1) || 1;
        
        // Basic style extraction
        const fontSize = parseFloat(computed.fontSize);
        let fontFamily = computed.fontFamily;
        if (fontFamily) fontFamily = fontFamily.replace(/['"]/g, '');
        const fontWeight = computed.fontWeight;
        const fontStyle = computed.fontStyle;
        const letterSpacing = computed.letterSpacing === 'normal' ? 0 : (parseFloat(computed.letterSpacing) / sf);
        
        const presetObj = presets[opts.preset || 'fully-lit'] || presets['fully-lit'];
        const finalOpts = Object.assign({}, defaults, presetObj.settings, opts);
        if (presetObj.settings.rainbow) finalOpts.rainbow = true;
        
        let fillPixiColor = '#FFFFFF';
        if (finalOpts.coreColor) {
            if (typeof finalOpts.coreColor === 'number') {
                fillPixiColor = '#' + finalOpts.coreColor.toString(16).padStart(6, '0');
            } else {
                fillPixiColor = finalOpts.coreColor;
            }
        } else if (computed.color) {
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
        
        // Calculate position
        const cRect = (typeof canvasEl !== 'undefined' ? canvasEl : document.getElementById('canvas-container')).getBoundingClientRect();
        const tRect = getActualTextRect(el) || el.getBoundingClientRect();
        
        const p = textStyle.padding || 0;
        pixiText.x = (tRect.left - cRect.left) / sf;
        pixiText.y = (tRect.top - cRect.top) / sf;

        // Add Glow Filter
        const glowColorNum = typeof opts.glowColor === 'number' ? opts.glowColor : hexToPixiColor(opts.glowColor || '#00aaff');
        const coreColorNum = typeof opts.coreColor === 'number' ? opts.coreColor : hexToPixiColor(opts.coreColor || '#ffffff');
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

    function updateTextSaberPositions() {
        if (!app || !app.textContainer) return;
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
                console.log('Saber canvas format degisimine uyduruldu (LOGICAL):', currentW, 'x', currentH);
            }
        }
        const cRect = (typeof canvasEl !== 'undefined' ? canvasEl : document.getElementById('canvas-container')) ? (typeof canvasEl !== 'undefined' ? canvasEl : document.getElementById('canvas-container')).getBoundingClientRect() : null;
        if (!cRect) return;
        const logicalW = container ? (container.offsetWidth || 1920) : 1920;
        const sf = cRect.width / logicalW;

        for (const id in app.textObjects) {
            const obj = app.textObjects[id];
            const tRect = getActualTextRect(obj.el) || obj.el.getBoundingClientRect();
            const p = obj.pixiText.style.padding || 0;
            
            obj.pixiText.x = (tRect.left - cRect.left) / sf;
            obj.pixiText.y = (tRect.top - cRect.top) / sf;
            
            // Re-sync text content in case of inline edit
            const textContent = obj.el.innerText || obj.el.textContent;
            if (obj.pixiText.text !== textContent) {
                obj.pixiText.text = textContent;
                
            }
        }
    }

    return {
        init: init,
        resize: resize,
        addTextSaber: addTextSaber,
        removeTextSaber: removeTextSaber,
        updateTextSaberPositions: updateTextSaberPositions,
        drawSaberLine: drawSaberLine,
        clear: clear,
        presets: presets,
        colorPresets: colorPresets,
        defaults: defaults,
        getApp: () => app,
        getSabers: () => sabers,
        setSaberTransform: setSaberTransform
    };
})();

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
        points = path.points || [];
    } else if (path.type === 'line') {
        points = [{x: path.x1, y: path.y1}, {x: path.x2, y: path.y2}];
    } else if (path.type === 'arrow') {
        const angle = Math.atan2(path.y2 - path.y1, path.x2 - path.x1);
        const headLen = (path.width || 4) * 5;
        points = [
            {x: path.x1, y: path.y1},
            {x: path.x2, y: path.y2},
            {x: path.x2 - headLen * Math.cos(angle - Math.PI/6), y: path.y2 - headLen * Math.sin(angle - Math.PI/6)},
            {x: path.x2 - headLen * Math.cos(angle + Math.PI/6), y: path.y2 - headLen * Math.sin(angle + Math.PI/6)},
            {x: path.x2, y: path.y2}
        ];
    } else if (path.type === 'rect') {
        points = [
            {x: path.x1, y: path.y1}, {x: path.x2, y: path.y1},
            {x: path.x2, y: path.y2}, {x: path.x1, y: path.y2},
            {x: path.x1, y: path.y1}
        ];
    } else if (path.type === 'circle') {
        const cx = (path.x1 + path.x2) / 2;
        const cy = (path.y1 + path.y2) / 2;
        const rx = Math.abs(path.x2 - path.x1) / 2;
        const ry = Math.abs(path.y2 - path.y1) / 2;
        for (let i = 0; i <= 40; i++) {
            const angle = (i / 40) * Math.PI * 2;
            points.push({x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry});
        }
    }
    
    if (points.length < 2) return null;
    
    if (!SaberEngine.getApp()) {
        SaberEngine.init(document.getElementById('canvas-container'));
    }
    
    const saberObj = SaberEngine.drawSaberLine(points, saberOptions);
    if (saberObj) {
        path.saberRef = saberObj;
        path.hasSaber = true;
        path.saberOptions = saberOptions;
    }
    return saberObj;
};

// PATH'E SABER EKLE (mevcut state ile)
window.addSaberToPath = function(pathIndex) {
    const state = window.saberState || {};
    const options = {
        preset: state.preset || 'fully-lit',
        coreColor: state.coreColor || 0xFFFFFF,
        glowColor: state.glowColor || 0x00AAFF,
        coreSize: state.coreSize || 4,
        glowSize: state.glowSize || 30,
        intensity: state.intensity || 2.5,
        flickerAmount: state.flickerAmount || 0.05,
        pulseSpeed: state.pulseSpeed || 0
    };
    applySaberToPath(pathIndex, options);
    if (typeof updateDrawHistory === 'function') updateDrawHistory();
    console.log('⚡ Saber path #' + pathIndex + ' e eklendi');
};

// PATH'İN SABER'INI KALDIR
window.removeSaberFromPath = function(pathIndex) {
    if (typeof drawPaths === 'undefined') return;
    const path = drawPaths[pathIndex];
    if (!path || !path.saberRef) return;
    
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
    
    delete path.saberRef;
    delete path.hasSaber;
    delete path.saberOptions;
    if (typeof updateDrawHistory === 'function') updateDrawHistory();
    console.log('🚫 Saber kaldırıldı');
};





console.log('⚡ Saber modülü yüklendi');
