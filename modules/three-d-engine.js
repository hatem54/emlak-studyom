/**
 * Emlak Stüdyom - 3D Düzlem & Metin Yerleştirici Motoru (ThreeDEngine)
 * Faz 3: Katmanlar Paneli Entegrasyonu, Otomatik Kayıt (AutoSave / State Persistence),
 * İnteraktif Güneş Pusulası ve 4K Ultra-HD Fırınlama.
 * 
 * Lisans: MIT (Three.js r128 tabanlı, %100 ticari kullanıma uygun)
 */

(function(window) {
    'use strict';

    // 🌟 MOTOR DURUMU VE AYARLARI (FAZ 3)
    const state = {
        loaded: false,
        active: false,
        elementType: 'text',   // 'text' | 'pin' | 'arrow' | 'combo_pin' | 'combo_arrow'
        text: 'SATILIK 1.250 m²',
        textSize: 36,
        depth: 16,             // Kalınlık (3D Extrusion derinliği)
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1.5,
        frontColor: '#f59e0b', // Ön yüz rengi (Altın Sarısı)
        sideColor: '#92400e',  // Yan kalınlık / gölge rengi
        roughness: 0.35,       // Pürüzlülük
        metalness: 0.40,       // Metalik yansıma
        orientation: 'flat',   // 'flat' (zemine/duvara yatık) | 'standing' (zemine dik totem)
        planePitch: -65,       // Eğim (-90° yatay zemin, 0° dikey duvar)
        planeYaw: 15,          // Yatay dönüş
        planeRoll: 0,          // Yan yatırma
        planeElevation: 0,     // Düzlemden yukarı yükseklik (havada süzülme offseti)
        planeLocalRot: 0,      // Düzlem yüzeyinde kendi etrafında dönüş (0° - 360°)
        planeScale: 1.0,
        showPlaneGrid: true,
        gridColor: '#00d2ff',
        sunPosX: 550,          // 3D Güneş X Konumu (Sağ Pencere: +550)
        sunPosY: 250,          // 3D Güneş Y Konumu (Pencere yüksekliği: +250)
        sunPosZ: -50,          // 3D Güneş Z Konumu (Oda içi pencere derinliği: -50)
        lightAngle: 45,        // Güneş ışığı açısı (0° - 360°)
        lightIntensity: 1.3,
        shadowOpacity: 0.45,   // Zemin gölgesi koyuluğu
        shadowSoftness: 1.5,   // Gölge yumuşaklığı (blur radius)
        posX: 0,               // Düzlem üzerinde X konumu
        posY: 0,               // Düzlem üzerinde Y konumu
        posZ: 0,               // Düzlem üzerinde Z derinlik konumu (Grid ile birlikte hareket eder)
        cornerPinActive: false,// 4 Köşe Tutamaç modu aktif mi?
        gizmoActive: true,     // After Effects tarzı 3D Eksen Gizmo modu aktif mi?
        gizmoScale: 1.0,       // Tutamaç boyutu ölçeği (0.6 - 2.0) -> Varsayılan %100 (zarif, estetik ve kompakt)
        gizmoAutoFit: true,    // Nesne ve metin boyutuna göre akıllı orantılama
        gizmoDistance: 75,     // Eksen açılma mesafesi (40px - 200px) -> Varsayılan 75px (ögeye yakın ve dengeli)
        gizmoShowLabels: false,// Eksen rozet metinleri (false: şık dairesel X,Y,Z,⟳ rozetleri | true: metinli mikro-kapsül)
        gizmoShowHud: true,    // Canlı derece HUD bildirimini göster
        gizmoOpacity: 1.0,     // Gizmo opaklığı (0.3 - 1.0)
        gizmoSettingsOpen: false, // Sol panel ayar kutusu açık mı?
        selected: true,        // 3D öge tuvalde seçili mi? (Görsel serbestken false olur)
        hasBaked: false,
        // 🌟 3D ROZET & İKON DURUMU
        badgeBgColor: '#0f172a',      // Rozet taban zemin rengi
        badgeSubtext: '',             // Rozet alt başlık (Slogan)
        selectedIconId: 'ev-14',      // Seçili ikon ID'si (window.ICON_LIBRARY)
        customIconSvg: null           // Tuvalden aktarılan özel SVG içeriği
    };

    // 🌟 THREE.JS SAHNE NESNELERİ
    let scene = null;
    let camera = null;
    let renderer = null;
    let canvasEl = null;       // #three-d-layer canvas
    let canvasBadgeEl = null;  // Tuval üstü yüzen 3D/Görsel durum rozeti
    let animFrameId = null;

    let planeGroup = null;     // Açı ve pozisyon alan ana düzlem grubu
    let gridHelper = null;     // Görsel 3D ızgara
    let shadowPlane = null;    // Gerçekçi zemin gölgesi alan şeffaf düzlem
    let contentGroup = null;   // Metin ve ögeleri taşıyan grup
    let textMesh = null;       // 3D kabartma harf mesh'i
    let iconMesh = null;       // 3D ikon mesh'i (İğne veya Ok)
    let badgeMesh = null;      // 🌟 3D Rozet / Kalkan / Plaket / Madalyon gövdesi
    let dirLight = null;       // Güneş ışığı
    let ambLight = null;       // Çevre ışığı
    let sunGroup = null;       // 3D Güneş Grubu (Sphere + Halo)
    let sunRayLine = null;     // 3D Işık Hüzmesi Çizgisi

    let loadedFont = null;
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let dragMode = 'move';     // 'move' | 'rotate'

    // 🎯 4 KÖŞE TUTAMAÇ VERİLERİ (Corner Pin Coordinates)
    const cornerPins = [
        { x: 0, y: 0 }, // P0: Sol-Üst
        { x: 0, y: 0 }, // P1: Sağ-Üst
        { x: 0, y: 0 }, // P2: Sağ-Alt
        { x: 0, y: 0 }  // P3: Sol-Alt
    ];
    let cornerPinOverlayEl = null;
    let gizmoOverlayEl = null;      // 🎯 After Effects 3D Transform Gizmo Overlay
    let axisScreenDirs = {
        x: { x: 1, y: 0 },
        y: { x: 0, y: -1 },
        z: { x: 1, y: 0 }
    };
    let arcScreenTangents = {
        yz: { x: 0, y: 1 }
    };
    let lastOriginScreen = { x: 0, y: 0 };

    /**
     * 1. Dinamik Kütüphane Yükleyici
     * Three.js ve Font dosyasını yalnızca ihtiyaç duyulduğunda yükler.
     */
    async function loadThreeLibraries(onProgress) {
        if (state.loaded && window.THREE && loadedFont) {
            return true;
        }

        if (typeof onProgress === 'function') onProgress('3D WebGL Motoru Hazırlanıyor...');

        // 1. Three.js Core yükle (Önce yerel, sonra CDN)
        if (!window.THREE) {
            try {
                await loadScript('./assets/vendor/three.min.js');
            } catch (err) {
                console.warn('[ThreeDEngine] Yerel three.min.js yüklenemedi, CDN deneniyor...', err);
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
            }
        }

        if (!window.THREE) {
            throw new Error('Three.js kütüphanesi yüklenemedi.');
        }

        // 2. 3D Font yükle
        if (typeof onProgress === 'function') onProgress('3D Font Hazırlanıyor...');
        
        await new Promise((resolve, reject) => {
            const fontLoader = new THREE.FontLoader();
            const fontUrl = './assets/fonts/helvetiker_bold.typeface.json';

            fontLoader.load(
                fontUrl,
                (font) => {
                    loadedFont = font;
                    resolve();
                },
                undefined,
                (err) => {
                    console.warn('[ThreeDEngine] Yerel font yüklenemedi, CDN deneniyor...', err);
                    fontLoader.load(
                        'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_bold.typeface.json',
                        (font) => {
                            loadedFont = font;
                            resolve();
                        },
                        undefined,
                        (finalErr) => reject(new Error('3D Font yüklenemedi: ' + finalErr))
                    );
                }
            );
        });

        state.loaded = true;
        return true;
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = (e) => reject(e);
            document.head.appendChild(script);
        });
    }

    /**
     * 2. WebGL Tuvalini ve 3D Sahneyi Başlatma
     */
    function initScene() {
        const container = document.getElementById('canvas-container');
        if (!container) return false;

        const w = container.offsetWidth || 1920;
        const h = container.offsetHeight || 1080;

        // Mevcut canvas varsa güncelle
        if (!canvasEl) {
            canvasEl = document.createElement('canvas');
            canvasEl.id = 'three-d-layer';
            canvasEl.style.position = 'absolute';
            canvasEl.style.top = '0';
            canvasEl.style.left = '0';
            canvasEl.style.width = '100%';
            canvasEl.style.height = '100%';
            canvasEl.style.zIndex = '54'; // Çizimlerin üstünde, UI tutamaçlarının altında
            canvasEl.style.pointerEvents = 'auto'; // 3D etkileşim için
            container.appendChild(canvasEl);
            attachCanvasEvents(canvasEl);
        }

        canvasEl.width = w;
        canvasEl.height = h;

        if (!renderer) {
            renderer = new THREE.WebGLRenderer({
                canvas: canvasEl,
                alpha: true,
                antialias: true,
                preserveDrawingBuffer: true
            });
            renderer.setSize(w, h, false);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        } else {
            renderer.setSize(w, h, false);
        }

        // Sahne & Kamera
        scene = new THREE.Scene();
        const fov = 45;
        const aspect = w / h;
        camera = new THREE.PerspectiveCamera(fov, aspect, 1, 10000);
        camera.position.set(0, 0, 850);
        camera.lookAt(0, 0, 0);

        // Işıklandırma
        ambLight = new THREE.AmbientLight(0xffffff, 0.75);
        scene.add(ambLight);

        dirLight = new THREE.DirectionalLight(0xffffff, state.lightIntensity);
        dirLight.position.set(state.sunPosX, state.sunPosY, state.sunPosZ);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 10;
        dirLight.shadow.camera.far = 4500;
        const d = 900;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        dirLight.shadow.bias = -0.0008;
        dirLight.shadow.radius = state.shadowSoftness || 1.5;
        scene.add(dirLight);
        scene.add(dirLight.target);

        // ☀️ 3D Güneş Nesnesi (Gerçek 3D Sahne Ögesi)
        sunGroup = new THREE.Group();
        sunGroup.position.set(state.sunPosX, state.sunPosY, state.sunPosZ);
        const sunSphereGeo = new THREE.SphereGeometry(18, 20, 20);
        const sunSphereMat = new THREE.MeshBasicMaterial({ color: 0xffd000 });
        const sunSphere = new THREE.Mesh(sunSphereGeo, sunSphereMat);
        sunSphere.name = 'sunSphere';
        sunGroup.add(sunSphere);

        const sunRingGeo = new THREE.RingGeometry(20, 26, 32);
        const sunRingMat = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        const sunRing = new THREE.Mesh(sunRingGeo, sunRingMat);
        sunGroup.add(sunRing);
        scene.add(sunGroup);

        const rayGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
        const rayMat = new THREE.LineDashedMaterial({
            color: 0xf59e0b,
            dashSize: 12,
            gapSize: 8,
            transparent: true,
            opacity: 0.65
        });
        sunRayLine = new THREE.Line(rayGeo, rayMat);
        scene.add(sunRayLine);

        // Ana Düzlem Grubu
        planeGroup = new THREE.Group();
        scene.add(planeGroup);

        // 3D Izgara (Grid Helper)
        const gridSubdivisions = 16;
        const gridTotalSize = 800;
        gridHelper = new THREE.GridHelper(gridTotalSize, gridSubdivisions, 0x00d2ff, 0x334155);
        gridHelper.rotation.x = Math.PI / 2; // XY düzlemine yatır
        gridHelper.position.z = 0;
        planeGroup.add(gridHelper);

        // Zemin Gölge Düzlemi (Şeffaf ShadowMaterial - Çift taraflı ve geniş)
        const shadowPlaneGeo = new THREE.PlaneGeometry(3200, 3200);
        const shadowPlaneMat = new THREE.ShadowMaterial({
            opacity: state.shadowOpacity,
            side: THREE.DoubleSide
        });
        shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
        shadowPlane.receiveShadow = true;
        shadowPlane.position.z = -0.5; // Harflerin hemen arkasında tam duvar yüzeyinde
        planeGroup.add(shadowPlane);

        // Metin ve Öge Taşıyıcı Grup
        contentGroup = new THREE.Group();
        planeGroup.add(contentGroup);

        updatePlaneTransform();
        updateLighting();
        recreateContentMeshes();

        // Render döngüsü
        startRenderLoop();
        return true;
    }

    /**
     * 3. 3D Vektörel Şekil ve İkon Geometrileri (Procedural THREE.Shape)
     */
    function createPillShape(width = 220, height = 70) {
        const s = new THREE.Shape();
        const r = height / 2;
        const straightW = (width / 2) - r;
        s.moveTo(-straightW, -r);
        s.lineTo(straightW, -r);
        s.absarc(straightW, 0, r, -Math.PI / 2, Math.PI / 2, false);
        s.lineTo(-straightW, r);
        s.absarc(-straightW, 0, r, Math.PI / 2, (3 * Math.PI) / 2, false);
        s.closePath();
        return s;
    }

    function createShieldShape(width = 160, height = 180) {
        const s = new THREE.Shape();
        const halfW = width / 2;
        const top = height * 0.45;
        const bottom = -height * 0.55;
        const midY = -height * 0.05;
        s.moveTo(0, top + 10);
        s.quadraticCurveTo(halfW * 0.5, top + 14, halfW, top);
        s.lineTo(halfW, midY);
        s.bezierCurveTo(halfW, bottom * 0.5, halfW * 0.4, bottom * 0.85, 0, bottom);
        s.bezierCurveTo(-halfW * 0.4, bottom * 0.85, -halfW, bottom * 0.5, -halfW, midY);
        s.lineTo(-halfW, top);
        s.quadraticCurveTo(-halfW * 0.5, top + 14, 0, top + 10);
        s.closePath();
        return s;
    }

    function createCardShape(width = 220, height = 120, radius = 16) {
        const s = new THREE.Shape();
        const halfW = width / 2;
        const halfH = height / 2;
        const r = Math.min(radius, halfW, halfH);
        s.moveTo(-halfW + r, -halfH);
        s.lineTo(halfW - r, -halfH);
        s.absarc(halfW - r, -halfH + r, r, -Math.PI / 2, 0, false);
        s.lineTo(halfW, halfH - r);
        s.absarc(halfW - r, halfH - r, r, 0, Math.PI / 2, false);
        s.lineTo(-halfW + r, halfH);
        s.absarc(-halfW + r, halfH - r, r, Math.PI / 2, Math.PI, false);
        s.lineTo(-halfW, -halfH + r);
        s.absarc(-halfW + r, -halfH + r, r, Math.PI, (3 * Math.PI) / 2, false);
        s.closePath();
        return s;
    }

    function createCoinShape(radius = 75) {
        const s = new THREE.Shape();
        s.absarc(0, 0, radius, 0, Math.PI * 2, false);
        return s;
    }

    function getShapeBounds(shape) {
        if (!shape || typeof shape.extractPoints !== 'function') {
            return { minX: -100, maxX: 100, minY: -50, maxY: 50, width: 200, height: 100 };
        }
        const points = shape.extractPoints(12).shape || [];
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        points.forEach(p => {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        });
        if (minX === Infinity) {
            minX = -100; maxX = 100; minY = -50; maxY = 50;
        }
        return { minX, maxX, minY, maxY, width: maxX - minX || 1, height: maxY - minY || 1 };
    }

    function getNormalizedUVGenerator(minX, maxX, minY, maxY) {
        const w = maxX - minX || 1;
        const h = maxY - minY || 1;
        return {
            generateTopUV: function(geometry, vertices, indexA, indexB, indexC) {
                const ax = (vertices[indexA * 3] - minX) / w;
                const ay = (vertices[indexA * 3 + 1] - minY) / h;
                const bx = (vertices[indexB * 3] - minX) / w;
                const by = (vertices[indexB * 3 + 1] - minY) / h;
                const cx = (vertices[indexC * 3] - minX) / w;
                const cy = (vertices[indexC * 3 + 1] - minY) / h;
                return [
                    new THREE.Vector2(ax, ay),
                    new THREE.Vector2(bx, by),
                    new THREE.Vector2(cx, cy)
                ];
            },
            generateSideWallUV: function() {
                return [
                    new THREE.Vector2(0, 0),
                    new THREE.Vector2(1, 0),
                    new THREE.Vector2(1, 1),
                    new THREE.Vector2(0, 1)
                ];
            }
        };
    }

    function getIconSvgById(iconId) {
        if (!iconId || iconId === 'none') return null;
        if (window.ICON_LIBRARY) {
            for (const catKey of Object.keys(window.ICON_LIBRARY)) {
                const cat = window.ICON_LIBRARY[catKey];
                if (cat && Array.isArray(cat.items)) {
                    const found = cat.items.find(it => it.id === iconId);
                    if (found && found.svg) return found.svg;
                }
            }
        }
        return null;
    }

    function ensureSvgXmlns(svgStr) {
        if (!svgStr) return '';
        if (!svgStr.includes('xmlns=')) {
            return svgStr.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        return svgStr;
    }

    const svgImageCache = new Map();

    function getSvgImage(iconId, callback) {
        if (!iconId || iconId === 'none') {
            if (typeof callback === 'function') callback(null);
            return;
        }
        if (svgImageCache.has(iconId)) {
            const cached = svgImageCache.get(iconId);
            if (cached && cached.complete) {
                if (typeof callback === 'function') callback(cached);
                return;
            }
        }
        const rawSvg = getIconSvgById(iconId);
        if (!rawSvg) {
            if (typeof callback === 'function') callback(null);
            return;
        }
        try {
            const safeSvg = ensureSvgXmlns(rawSvg);
            const blob = new Blob([safeSvg], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(url);
                svgImageCache.set(iconId, img);
                if (typeof callback === 'function') callback(img);
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                if (typeof callback === 'function') callback(null);
            };
            img.src = url;
        } catch(e) {
            if (typeof callback === 'function') callback(null);
        }
    }

    function drawRoundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    function drawShieldPath(ctx, x, y, w, h) {
        const halfW = w / 2;
        const topY = y + 10;
        const midY = y + h * 0.45;
        const botY = y + h;
        ctx.beginPath();
        ctx.moveTo(x + halfW, y);
        ctx.quadraticCurveTo(x + w * 0.75, topY, x + w, topY + 20);
        ctx.lineTo(x + w, midY);
        ctx.bezierCurveTo(x + w, botY * 0.8, x + halfW * 1.3, botY - 10, x + halfW, botY);
        ctx.bezierCurveTo(x + halfW * 0.7, botY - 10, x, botY * 0.8, x, midY);
        ctx.lineTo(x, topY + 20);
        ctx.quadraticCurveTo(x + w * 0.25, topY, x + halfW, y);
        ctx.closePath();
    }

    function drawBadgeText(ctx, mainText, subText, x, y, maxW, textColor, accentColor, align = 'center') {
        ctx.save();
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';

        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        const hasSub = !!subText;

        if (hasSub) {
            ctx.fillStyle = textColor || '#ffffff';
            ctx.font = '900 76px "ClassicAmpersand", "Space Grotesk", "Inter", sans-serif';
            let fontSize = 76;
            while (ctx.measureText(mainText).width > maxW && fontSize > 32) {
                fontSize -= 4;
                ctx.font = '900 ' + fontSize + 'px "ClassicAmpersand", "Space Grotesk", "Inter", sans-serif';
            }
            ctx.fillText(mainText, x, y - 32);

            ctx.fillStyle = accentColor || '#f59e0b';
            let subFontSize = Math.round(fontSize * 0.52);
            ctx.font = '700 ' + subFontSize + 'px "ClassicAmpersand", "Space Grotesk", "Inter", sans-serif';
            while (ctx.measureText(subText).width > maxW && subFontSize > 20) {
                subFontSize -= 2;
                ctx.font = '700 ' + subFontSize + 'px "ClassicAmpersand", "Space Grotesk", "Inter", sans-serif';
            }
            ctx.fillText(subText, x, y + 42);
        } else {
            ctx.fillStyle = textColor || '#ffffff';
            let fontSize = 86;
            ctx.font = '900 ' + fontSize + 'px "ClassicAmpersand", "Space Grotesk", "Inter", sans-serif';
            while (ctx.measureText(mainText).width > maxW && fontSize > 32) {
                fontSize -= 4;
                ctx.font = '900 ' + fontSize + 'px "ClassicAmpersand", "Space Grotesk", "Inter", sans-serif';
            }
            ctx.fillText(mainText, x, y);
        }
        ctx.restore();
    }

    
    function getSvgImageFromRaw(rawSvg, callback) {
        if (!rawSvg) { if (typeof callback === 'function') callback(null); return; }
        try {
            const safeSvg = ensureSvgXmlns(rawSvg);
            const blob = new Blob([safeSvg], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(url);
                if (typeof callback === 'function') callback(img);
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                if (typeof callback === 'function') callback(null);
            };
            img.src = url;
        } catch(e) {
            if (typeof callback === 'function') callback(null);
        }
    }

    function createBadgeTexture(type, text, subtext, iconId, bgColor, textColor, accentColor, onUpdate) {
        let cw = 1024;
        let ch = 512;
        if (type === 'badge_pill') {
            cw = 1024; ch = 326;
        } else if (type === 'badge_shield') {
            cw = 896; ch = 1024;
        } else if (type === 'badge_card') {
            cw = 1024; ch = 560;
        } else if (type === 'badge_coin' || type === 'icon_3d') {
            cw = 1024; ch = 1024;
        }

        const canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        if (renderer && renderer.capabilities) {
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        }

        function renderPass(iconImg) {
            ctx.clearRect(0, 0, cw, ch);

            // 1. Zemin Dolgusu
            ctx.fillStyle = bgColor || '#0f172a';
            ctx.fillRect(0, 0, cw, ch);

            // 2. Yüzey Lüks Sheen Gradyanı
            const sheen = ctx.createLinearGradient(0, 0, cw, ch);
            sheen.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
            sheen.addColorStop(0.35, 'rgba(255, 255, 255, 0.03)');
            sheen.addColorStop(0.7, 'rgba(0, 0, 0, 0.10)');
            sheen.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
            ctx.fillStyle = sheen;
            ctx.fillRect(0, 0, cw, ch);

            // 3. İç Rozet Çerçevesi
            ctx.save();
            ctx.strokeStyle = accentColor || textColor || '#f59e0b';
            ctx.lineWidth = 10;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 8;

            if (type === 'badge_pill') {
                const r = (ch - 32) / 2;
                drawRoundRect(ctx, 16, 16, cw - 32, ch - 32, r);
                ctx.stroke();
            } else if (type === 'badge_card') {
                drawRoundRect(ctx, 20, 20, cw - 40, ch - 40, 36);
                ctx.stroke();
            } else if (type === 'badge_coin' || type === 'icon_3d') {
                ctx.beginPath();
                ctx.arc(cw / 2, ch / 2, (cw / 2) - 24, 0, Math.PI * 2);
                ctx.stroke();
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(cw / 2, ch / 2, (cw / 2) - 44, 0, Math.PI * 2);
                ctx.stroke();
            } else if (type === 'badge_shield') {
                drawShieldPath(ctx, 24, 24, cw - 48, ch - 48);
                ctx.stroke();
            }
            ctx.restore();

            // 4. İkon ve Metin Yerleşimi
            const hasIcon = !!iconImg;
            const mainStr = (text || '').trim();
            const subStr = (subtext || '').trim();

            if (type === 'badge_pill') {
                if (hasIcon) {
                    const iconCenterX = 163;
                    const iconCenterY = ch / 2;
                    const iconBoxSize = 190;

                    ctx.save();
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
                    ctx.beginPath();
                    ctx.arc(iconCenterX, iconCenterY, 95, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = accentColor || textColor || '#f59e0b';
                    ctx.lineWidth = 5;
                    ctx.stroke();

                    ctx.drawImage(iconImg, iconCenterX - iconBoxSize / 2, iconCenterY - iconBoxSize / 2, iconBoxSize, iconBoxSize);
                    ctx.restore();

                    const textLeft = 295;
                    const textMaxW = cw - textLeft - 60;
                    drawBadgeText(ctx, mainStr, subStr, textLeft, ch / 2, textMaxW, textColor, accentColor, 'left');
                } else {
                    drawBadgeText(ctx, mainStr, subStr, cw / 2, ch / 2, cw - 120, textColor, accentColor, 'center');
                }
            } else if (type === 'badge_shield') {
                if (hasIcon) {
                    const iconSize = 340;
                    const iconY = 320;
                    ctx.save();
                    ctx.drawImage(iconImg, (cw - iconSize) / 2, iconY - iconSize / 2, iconSize, iconSize);
                    ctx.restore();

                    const textY = 660;
                    drawBadgeText(ctx, mainStr, subStr, cw / 2, textY, cw - 160, textColor, accentColor, 'center');
                } else {
                    drawBadgeText(ctx, mainStr, subStr, cw / 2, ch / 2, cw - 160, textColor, accentColor, 'center');
                }
            } else if (type === 'badge_card') {
                if (hasIcon) {
                    const iconCenterX = 180;
                    const iconCenterY = ch / 2;
                    const iconBoxSize = 200;

                    ctx.save();
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    drawRoundRect(ctx, iconCenterX - 100, iconCenterY - 100, 200, 200, 26);
                    ctx.fill();
                    ctx.strokeStyle = accentColor || textColor || '#f59e0b';
                    ctx.lineWidth = 4;
                    ctx.stroke();

                    ctx.drawImage(iconImg, iconCenterX - 85, iconCenterY - 85, 170, 170);
                    ctx.restore();

                    const textLeft = 330;
                    const textMaxW = cw - textLeft - 50;
                    drawBadgeText(ctx, mainStr, subStr, textLeft, ch / 2, textMaxW, textColor, accentColor, 'left');
                } else {
                    drawBadgeText(ctx, mainStr, subStr, cw / 2, ch / 2, cw - 120, textColor, accentColor, 'center');
                }
            } else if (type === 'badge_coin') {
                if (hasIcon) {
                    const iconSize = 400;
                    const iconY = 410;
                    ctx.drawImage(iconImg, (cw - iconSize) / 2, iconY - iconSize / 2, iconSize, iconSize);
                    drawBadgeText(ctx, mainStr, subStr, cw / 2, 770, cw - 200, textColor, accentColor, 'center');
                } else {
                    drawBadgeText(ctx, mainStr, subStr, cw / 2, ch / 2, cw - 200, textColor, accentColor, 'center');
                }
            } else if (type === 'icon_3d') {
                if (hasIcon) {
                    if (mainStr) {
                        const iconSize = 480;
                        const iconY = 400;
                        ctx.drawImage(iconImg, (cw - iconSize) / 2, iconY - iconSize / 2, iconSize, iconSize);
                        drawBadgeText(ctx, mainStr, subStr, cw / 2, 800, cw - 180, textColor, accentColor, 'center');
                    } else {
                        const iconSize = 650;
                        ctx.drawImage(iconImg, (cw - iconSize) / 2, (ch - iconSize) / 2, iconSize, iconSize);
                    }
                } else {
                    drawBadgeText(ctx, mainStr || '3D İKON', subStr, cw / 2, ch / 2, cw - 180, textColor, accentColor, 'center');
                }
            }

            texture.needsUpdate = true;
            if (typeof onUpdate === 'function') onUpdate();
        }

        // Pass 1: Senkron çizim
        let initialImg = null;
        if (iconId && iconId !== 'none' && svgImageCache.has(iconId)) {
            const cached = svgImageCache.get(iconId);
            if (cached && cached.complete) initialImg = cached;
        }
        renderPass(initialImg);

        // Pass 2: Asenkron (eğer önbellekte yoksa) veya özel tuval SVG'si
        if (state.customIconSvg) {
            getSvgImageFromRaw(state.customIconSvg, (loadedImg) => {
                if (loadedImg) {
                    renderPass(loadedImg);
                }
            });
        } else if (!initialImg && iconId && iconId !== 'none') {
            getSvgImage(iconId, (loadedImg) => {
                if (loadedImg) {
                    renderPass(loadedImg);
                }
            });
        }

        return texture;
    }

    function createPinShape() {
        const s = new THREE.Shape();
        s.moveTo(0, 0);
        s.bezierCurveTo(-14, 22, -24, 42, -24, 60);
        s.absarc(0, 60, 24, Math.PI, 0, false);
        s.bezierCurveTo(24, 42, 14, 22, 0, 0);

        const hole = new THREE.Path();
        hole.absarc(0, 60, 9, 0, Math.PI * 2, true);
        s.holes.push(hole);
        return s;
    }

    function createArrowShape() {
        const s = new THREE.Shape();
        s.moveTo(0, 50);
        s.lineTo(24, 18);
        s.lineTo(10, 18);
        s.lineTo(10, -35);
        s.lineTo(-10, -35);
        s.lineTo(-10, 18);
        s.lineTo(-24, 18);
        s.closePath();
        return s;
    }

    /**
     * 4. 3D Geometrileri ve Mesh'leri Yeniden Oluşturma
     */
    function recreateContentMeshes() {
        if (!contentGroup) return;

        if (textMesh) {
            contentGroup.remove(textMesh);
            if (textMesh.geometry) textMesh.geometry.dispose();
            textMesh = null;
        }
        if (iconMesh) {
            contentGroup.remove(iconMesh);
            if (iconMesh.geometry) iconMesh.geometry.dispose();
            iconMesh = null;
        }
        if (badgeMesh) {
            contentGroup.remove(badgeMesh);
            if (badgeMesh.geometry) badgeMesh.geometry.dispose();
            if (badgeMesh.material) {
                if (Array.isArray(badgeMesh.material)) {
                    badgeMesh.material.forEach(m => {
                        if (m && m.map) m.map.dispose();
                        if (m) m.dispose();
                    });
                } else {
                    if (badgeMesh.material.map) badgeMesh.material.map.dispose();
                    badgeMesh.material.dispose();
                }
            }
            badgeMesh = null;
        }

        const frontMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(state.frontColor),
            roughness: state.roughness,
            metalness: state.metalness
        });

        const sideMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(state.sideColor),
            roughness: Math.min(1.0, state.roughness + 0.15),
            metalness: Math.max(0.1, state.metalness - 0.1)
        });

        const extrudeOpts = {
            depth: Math.max(1, state.depth),
            bevelEnabled: !!state.bevelEnabled,
            bevelThickness: state.bevelThickness,
            bevelSize: state.bevelSize,
            bevelSegments: 3,
            curveSegments: 8
        };

        const type = state.elementType;

        if (type === 'pin' || type === 'combo_pin') {
            const pinGeo = new THREE.ExtrudeGeometry(createPinShape(), extrudeOpts);
            pinGeo.center();
            iconMesh = new THREE.Mesh(pinGeo, [frontMat, sideMat]);
            iconMesh.castShadow = true;
            contentGroup.add(iconMesh);
        } else if (type === 'arrow' || type === 'combo_arrow') {
            const arrowGeo = new THREE.ExtrudeGeometry(createArrowShape(), extrudeOpts);
            arrowGeo.center();
            iconMesh = new THREE.Mesh(arrowGeo, [frontMat, sideMat]);
            iconMesh.castShadow = true;
            contentGroup.add(iconMesh);
        }

        if ((type === 'text' || type === 'combo_pin' || type === 'combo_arrow') && loadedFont) {
            const textString = state.text.trim() || 'METİN';
            const textGeo = new THREE.TextGeometry(textString, {
                font: loadedFont,
                size: state.textSize,
                height: Math.max(1, state.depth),
                curveSegments: 8,
                bevelEnabled: !!state.bevelEnabled,
                bevelThickness: state.bevelThickness,
                bevelSize: state.bevelSize,
                bevelOffset: 0,
                bevelSegments: 3
            });
            textGeo.center();

            textMesh = new THREE.Mesh(textGeo, [frontMat, sideMat]);
            textMesh.castShadow = true;
            contentGroup.add(textMesh);
        } else if (type.startsWith('badge_') || type === 'icon_3d') {
            let shape = null;
            if (type === 'badge_pill') {
                shape = createPillShape(220, 70);
            } else if (type === 'badge_shield') {
                shape = createShieldShape(160, 180);
            } else if (type === 'badge_card') {
                shape = createCardShape(220, 120, 16);
            } else if (type === 'badge_coin' || type === 'icon_3d') {
                shape = createCoinShape(75);
            } else {
                shape = createPillShape(220, 70);
            }

            const bounds = getShapeBounds(shape);
            const uvGen = getNormalizedUVGenerator(bounds.minX, bounds.maxX, bounds.minY, bounds.maxY);

            const badgeExtrudeOpts = {
                depth: Math.max(1, state.depth),
                bevelEnabled: !!state.bevelEnabled,
                bevelThickness: state.bevelThickness,
                bevelSize: state.bevelSize,
                bevelSegments: 3,
                curveSegments: 16,
                UVGenerator: uvGen
            };

            const badgeGeo = new THREE.ExtrudeGeometry(shape, badgeExtrudeOpts);
            badgeGeo.center();

            const badgeTex = createBadgeTexture(
                type,
                state.text,
                state.badgeSubtext,
                state.selectedIconId,
                state.badgeBgColor,
                state.frontColor,
                state.frontColor,
                () => requestRender()
            );

            const badgeFrontMat = new THREE.MeshStandardMaterial({
                map: badgeTex,
                roughness: state.roughness,
                metalness: state.metalness
            });

            badgeMesh = new THREE.Mesh(badgeGeo, [badgeFrontMat, sideMat]);
            badgeMesh.castShadow = true;
            badgeMesh.receiveShadow = true;
            contentGroup.add(badgeMesh);
        }

        const halfDepth = Math.max(1, state.depth) / 2 + (state.bevelEnabled ? state.bevelThickness : 0);
        if (type === 'combo_pin' && iconMesh && textMesh) {
            const iconWidth = 55;
            textMesh.position.set(iconWidth / 2 + 10, 0, halfDepth);
            iconMesh.position.set(-100, 0, halfDepth);
        } else if (type === 'combo_arrow' && iconMesh && textMesh) {
            iconMesh.rotation.set(0, 0, -Math.PI / 2);
            iconMesh.position.set(-110, 0, halfDepth);
            textMesh.position.set(30, 0, halfDepth);
        } else {
            if (iconMesh) iconMesh.position.set(0, 0, halfDepth);
            if (textMesh) textMesh.position.set(0, 0, halfDepth);
            if (badgeMesh) badgeMesh.position.set(0, 0, halfDepth);
        }

        updateContentTransform();
        notifyExternalUpdates();
        requestRender();
    }

    /**
     * 5. Düzlem ve İçerik Dönüşüm Güncellemeleri
     */
    function updatePlaneTransform() {
        if (!planeGroup) return;

        const pitchRad = THREE.MathUtils.degToRad(state.planePitch);
        const yawRad = THREE.MathUtils.degToRad(state.planeYaw);
        const rollRad = THREE.MathUtils.degToRad(state.planeRoll);

        planeGroup.rotation.order = 'ZYX';
        planeGroup.rotation.set(pitchRad, yawRad, rollRad);
        planeGroup.scale.set(state.planeScale, state.planeScale, state.planeScale);

        if (gridHelper) {
            gridHelper.visible = !!state.selected && !!state.showPlaneGrid;
        }
        if (shadowPlane && shadowPlane.material) {
            shadowPlane.material.opacity = state.shadowOpacity;
        }
        updateGizmoPositions();
    }

    function updateContentTransform() {
        if (!contentGroup) return;

        const zPos = (state.posZ || 0);
        const elev = (state.planeElevation || 0);

        // 3D Metin ve İkon Grubu (Z ekseni derinlik konumu + zeminden süzülme mesafesi)
        contentGroup.position.set(state.posX, state.posY, zPos + elev);
        const localRotRad = THREE.MathUtils.degToRad(state.planeLocalRot);
        const standX = (state.orientation === 'standing') ? (Math.PI / 2) : 0;
        contentGroup.rotation.set(standX, 0, -localRotRad);

        // 🎯 Grid ve gölge düzlemi ögeyle BİRLİKTE hareket eder!
        // Duvara yaslandığında gride dayanınca kalmaz, grid ögeden asla kopmaz.
        if (gridHelper) {
            gridHelper.position.set(state.posX, state.posY, zPos);
            gridHelper.visible = !!state.selected && !!state.showPlaneGrid;
        }
        if (shadowPlane) {
            shadowPlane.position.set(state.posX, state.posY, zPos - 0.5);
        }

        updateLighting();
        updateGizmoPositions();
    }

    function updateLighting() {
        if (!dirLight) return;

        if (sunGroup) {
            sunGroup.position.set(state.sunPosX, state.sunPosY, state.sunPosZ);
            if (camera) {
                sunGroup.quaternion.copy(camera.quaternion);
            }
        }

        const targetWorldPos = new THREE.Vector3();
        if (contentGroup) {
            contentGroup.getWorldPosition(targetWorldPos);
        } else {
            targetWorldPos.set(0, 0, 0);
        }

        dirLight.position.set(state.sunPosX, state.sunPosY, state.sunPosZ);
        if (dirLight.target) {
            dirLight.target.position.copy(targetWorldPos);
            dirLight.target.updateMatrixWorld(true);
        }
        dirLight.updateMatrixWorld(true);
        dirLight.intensity = state.lightIntensity;

        if (dirLight.shadow) {
            dirLight.shadow.radius = state.shadowSoftness || 1.5;
            const dist = dirLight.position.distanceTo(targetWorldPos);
            const d = Math.max(700, dist * 0.85);
            dirLight.shadow.camera.left = -d;
            dirLight.shadow.camera.right = d;
            dirLight.shadow.camera.top = d;
            dirLight.shadow.camera.bottom = -d;
            dirLight.shadow.camera.near = 10;
            dirLight.shadow.camera.far = Math.max(3500, dist + 2000);
            dirLight.shadow.camera.updateProjectionMatrix();
        }

        if (sunRayLine && sunRayLine.geometry && sunGroup) {
            const pts = [sunGroup.position.clone(), targetWorldPos.clone()];
            sunRayLine.geometry.setFromPoints(pts);
            sunRayLine.computeLineDistances();
        }
    }

    /**
     * 6. Render Ticker Döngüsü
     */
    function startRenderLoop() {
        if (animFrameId) cancelAnimationFrame(animFrameId);

        function tick() {
            if (state.active && renderer && scene && camera) {
                renderer.render(scene, camera);
            }
            animFrameId = requestAnimationFrame(tick);
        }
        animFrameId = requestAnimationFrame(tick);
    }

    function requestRender() {
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    /**
     * 7. 🎯 4 KÖŞE TUTAMAÇ KALİBRATÖRÜ (Corner Pin Plane Controller)
     */
    function initCornerPinOverlay() {
        const container = document.getElementById('canvas-container');
        if (!container) return;

        if (cornerPinOverlayEl) {
            updateCornerPinHandlesFromScene();
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'threeDCornerPinOverlay';
        overlay.className = 'three-d-corner-pin-overlay';
        overlay.style.display = 'none';

        overlay.innerHTML = `
            <svg id="threeDCornerPinSvg" class="three-d-corner-pin-svg">
                <polygon id="threeDCornerPinPoly" class="three-d-corner-pin-poly" points="0,0 0,0 0,0 0,0"></polygon>
            </svg>
            <div class="three-d-pin-node" data-idx="0" title="Sol-Üst Köşe"><span class="pin-tag">1</span></div>
            <div class="three-d-pin-node" data-idx="1" title="Sağ-Üst Köşe"><span class="pin-tag">2</span></div>
            <div class="three-d-pin-node" data-idx="2" title="Sağ-Alt Köşe"><span class="pin-tag">3</span></div>
            <div class="three-d-pin-node" data-idx="3" title="Sol-Alt Köşe"><span class="pin-tag">4</span></div>
        `;

        container.appendChild(overlay);
        cornerPinOverlayEl = overlay;
        attachCornerPinEvents(overlay);
        updateCornerPinHandlesFromScene();
    }

    function toggleCornerPinMode(forceState) {
        state.cornerPinActive = (forceState !== undefined) ? !!forceState : !state.cornerPinActive;
        initCornerPinOverlay();
        if (cornerPinOverlayEl) {
            cornerPinOverlayEl.style.display = state.cornerPinActive ? 'block' : 'none';
        }
        // Corner Pin aktifken Gizmo'yu gizle, kapatılınca Gizmo aktifse geri getir
        if (state.cornerPinActive) {
            if (gizmoOverlayEl) gizmoOverlayEl.style.display = 'none';
        } else if (state.gizmoActive) {
            if (gizmoOverlayEl) {
                gizmoOverlayEl.style.display = 'block';
                updateGizmoPositions();
            }
        }
        const btn = document.getElementById('threeDCornerPinToggleBtn');
        if (btn) {
            btn.classList.toggle('active', state.cornerPinActive);
            btn.innerHTML = state.cornerPinActive
                ? '<i class="fas fa-bullseye"></i> 4 Köşe (Aktif)'
                : '<i class="fas fa-crosshairs"></i> 4 Köşe Oturtma';
        }
    }

    function updateCornerPinHandlesFromScene() {
        const container = document.getElementById('canvas-container');
        if (!container || !cornerPinOverlayEl) return;

        const cw = container.offsetWidth || 1920;
        const ch = container.offsetHeight || 1080;
        const cx = cw / 2 + state.posX;
        const cy = ch / 2 - state.posY;

        const halfW = 180 * state.planeScale;
        const halfH = 90 * state.planeScale;

        if (cornerPins[0].x === 0 && cornerPins[0].y === 0) {
            cornerPins[0] = { x: cx - halfW * 0.75, y: cy - halfH * 1.1 };
            cornerPins[1] = { x: cx + halfW * 0.75, y: cy - halfH * 1.1 };
            cornerPins[2] = { x: cx + halfW * 1.1,  y: cy + halfH * 1.1 };
            cornerPins[3] = { x: cx - halfW * 1.1,  y: cy + halfH * 1.1 };
        }

        renderCornerPinDOM();
    }

    function renderCornerPinDOM() {
        if (!cornerPinOverlayEl) return;
        const nodes = cornerPinOverlayEl.querySelectorAll('.three-d-pin-node');
        const poly = cornerPinOverlayEl.querySelector('#threeDCornerPinPoly');

        let pointsStr = '';
        nodes.forEach((node, idx) => {
            const p = cornerPins[idx];
            node.style.left = p.x + 'px';
            node.style.top = p.y + 'px';
            pointsStr += `${p.x},${p.y} `;
        });

        if (poly) poly.setAttribute('points', pointsStr.trim());
    }

    function attachCornerPinEvents(overlay) {
        const nodes = overlay.querySelectorAll('.three-d-pin-node');
        nodes.forEach(node => {
            const idx = parseInt(node.getAttribute('data-idx'));
            let isDown = false;
            let startClientX, startClientY, startPinX, startPinY;

            node.addEventListener('pointerdown', (e) => {
                isDown = true;
                startClientX = e.clientX;
                startClientY = e.clientY;
                startPinX = cornerPins[idx].x;
                startPinY = cornerPins[idx].y;
                node.setPointerCapture(e.pointerId);
                e.stopPropagation();
                e.preventDefault();
            });

            node.addEventListener('pointermove', (e) => {
                if (!isDown) return;
                const dx = e.clientX - startClientX;
                const dy = e.clientY - startClientY;
                cornerPins[idx].x = Math.round(startPinX + dx);
                cornerPins[idx].y = Math.round(startPinY + dy);

                renderCornerPinDOM();
                solvePerspectiveFromCornerPins();
            });

            const onUp = (e) => {
                if (!isDown) return;
                isDown = false;
                try { node.releasePointerCapture(e.pointerId); } catch(ex){}
            };

            node.addEventListener('pointerup', onUp);
            node.addEventListener('pointercancel', onUp);
        });
    }

    function solvePerspectiveFromCornerPins() {
        const container = document.getElementById('canvas-container');
        if (!container) return;
        const cw = container.offsetWidth || 1920;
        const ch = container.offsetHeight || 1080;

        const p0 = cornerPins[0];
        const p1 = cornerPins[1];
        const p2 = cornerPins[2];
        const p3 = cornerPins[3];

        const cx = (p0.x + p1.x + p2.x + p3.x) / 4;
        const cy = (p0.y + p1.y + p2.y + p3.y) / 4;
        state.posX = Math.round(cx - cw / 2);
        state.posY = Math.round(-(cy - ch / 2));

        const topW = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        const botW = Math.hypot(p2.x - p3.x, p2.y - p3.y);
        const leftH = Math.hypot(p3.x - p0.x, p3.y - p0.y);
        const rightH = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        const widthRatio = topW / Math.max(1, botW);
        let solvedPitch = 0;
        if (widthRatio < 1) {
            solvedPitch = -Math.round((1 - widthRatio) * 115);
        } else {
            solvedPitch = Math.round((widthRatio - 1) * 115);
        }
        state.planePitch = Math.max(-85, Math.min(85, solvedPitch));

        const heightRatio = leftH / Math.max(1, rightH);
        let solvedYaw = 0;
        if (heightRatio > 1) {
            solvedYaw = Math.round((heightRatio - 1) * 85);
        } else {
            solvedYaw = -Math.round((1 / heightRatio - 1) * 85);
        }
        state.planeYaw = Math.max(-80, Math.min(80, solvedYaw));

        const rollRad = Math.atan2(p2.y - p3.y, p2.x - p3.x);
        state.planeRoll = Math.round(rollRad * (180 / Math.PI));

        const avgW = (topW + botW) / 2;
        state.planeScale = Math.max(0.25, Math.min(3.0, parseFloat((avgW / 360).toFixed(2))));

        updatePlaneTransform();
        updateContentTransform();
        syncControlsUI();
        notifyExternalUpdates();
        requestRender();
    }

    /**
     * 7.1 🎯 3D EKSEN GİZMO (3D Transform Gimbal with Arcs, Beads & Axis Tips)
     */
    function showGizmoHud(text, x, y) {
        if (!gizmoOverlayEl || state.gizmoShowHud === false) return;
        const hud = gizmoOverlayEl.querySelector('#threeDGizmoHud');
        if (!hud) return;
        hud.textContent = text;
        hud.style.left = (x + 14) + 'px';
        hud.style.top = (y - 32) + 'px';
        hud.style.display = 'block';
    }

    function hideGizmoHud() {
        if (!gizmoOverlayEl) return;
        const hud = gizmoOverlayEl.querySelector('#threeDGizmoHud');
        if (hud) hud.style.display = 'none';
    }

    function initGizmoOverlay() {
        const container = document.getElementById('canvas-container');
        if (!container) return;

        if (gizmoOverlayEl) {
            updateGizmoPositions();
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'threeDGizmoOverlay';
        overlay.className = 'three-d-gizmo-overlay';
        overlay.style.display = (state.gizmoActive && !state.cornerPinActive) ? 'block' : 'none';

        overlay.innerHTML = `
            <svg id="threeDGizmoSvg" class="three-d-gizmo-svg">
                <defs>
                    <marker id="gizmoArrowX" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#ef4444"/>
                    </marker>
                    <marker id="gizmoArrowY" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#10b981"/>
                    </marker>
                    <marker id="gizmoArrowZ" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#00d2ff"/>
                    </marker>
                </defs>
                <!-- 3D Döndürme Yayları (Quadrant Arcs) -->
                <path id="threeDGizmoArcX" class="three-d-gizmo-arc three-d-gizmo-arc-x"></path>
                <path id="threeDGizmoArcY" class="three-d-gizmo-arc three-d-gizmo-arc-y"></path>
                <path id="threeDGizmoArcZ" class="three-d-gizmo-arc three-d-gizmo-arc-z"></path>
                <!-- 3D Eksen Çizgileri ve Ok Uçları -->
                <line id="threeDGizmoLineX" class="three-d-gizmo-axis-x" x1="0" y1="0" x2="0" y2="0" marker-end="url(#gizmoArrowX)"></line>
                <line id="threeDGizmoLineY" class="three-d-gizmo-axis-y" x1="0" y1="0" x2="0" y2="0" marker-end="url(#gizmoArrowY)"></line>
                <line id="threeDGizmoLineZ" class="three-d-gizmo-axis-z" x1="0" y1="0" x2="0" y2="0" marker-end="url(#gizmoArrowZ)"></line>
                <!-- Güneş Işık Çizgisi -->
                <line id="threeDGizmoSunLine" class="three-d-gizmo-sun-line" x1="0" y1="0" x2="0" y2="0"></line>
                <!-- Merkez Pivot Referans Noktası (Kaba buton yerine estetik pivot) -->
                <circle id="threeDGizmoOriginDot" class="three-d-gizmo-origin-dot" cx="0" cy="0" r="3.5"></circle>
            </svg>
            <!-- Eksen Ucu Tutamaçları (Kaydırma / Eksen Boyunca Taşıma) -->
            <div id="threeDGizmoTipX" class="three-d-gizmo-tip three-d-gizmo-tip-x" title="X Ekseni Kaydır (Sürükleyin)">X</div>
            <div id="threeDGizmoTipY" class="three-d-gizmo-tip three-d-gizmo-tip-y" title="Y Ekseni Kaydır (Sürükleyin)">Y</div>
            <div id="threeDGizmoTipZ" class="three-d-gizmo-tip three-d-gizmo-tip-z" title="Z Yükseklik / Derinlik (Sürükleyin)">Z</div>
            <!-- Yay Üzerindeki Renkli Döndürme Noktaları (Beads / Dots) -->
            <div id="threeDGizmoDotX" class="three-d-gizmo-dot three-d-gizmo-dot-x" title="Eğim (Pitch) Döndür - Kırmızı Nokta"><span class="three-d-gizmo-dot-lbl">Eğim</span></div>
            <div id="threeDGizmoDotY" class="three-d-gizmo-dot three-d-gizmo-dot-y" title="Yatay (Yaw) Döndür - Yeşil Nokta"><span class="three-d-gizmo-dot-lbl">Yatay</span></div>
            <div id="threeDGizmoDotZ" class="three-d-gizmo-dot three-d-gizmo-dot-z" title="Düzlem İçi Dönüş (Roll) - Mavi Nokta"><span class="three-d-gizmo-dot-lbl">Dönüş</span></div>
            <!-- Tuval Üstü 360° Güneş Işık Tutamacı -->
            <div id="threeDGizmoSun" class="three-d-gizmo-sun" title="☀️ Güneş Işık Yönü (Tuvalde 360° Serbestçe Sürükleyin)"><i class="fas fa-sun"></i></div>
            <div id="threeDGizmoHud" class="three-d-gizmo-hud"></div>
        `;

        container.appendChild(overlay);
        gizmoOverlayEl = overlay;
        attachGizmoEvents(overlay);
        updateGizmoPositions();
    }

    function toggleGizmoMode(forceState) {
        state.gizmoActive = (forceState !== undefined) ? !!forceState : !state.gizmoActive;
        if (state.gizmoActive) {
            initGizmoOverlay();
            if (gizmoOverlayEl) {
                gizmoOverlayEl.style.display = (state.cornerPinActive || !state.selected) ? 'none' : 'block';
            }
            updateGizmoPositions();
        } else {
            if (gizmoOverlayEl) gizmoOverlayEl.style.display = 'none';
        }

        const btn = document.getElementById('threeDGizmoToggleBtn');
        if (btn) {
            btn.classList.toggle('active', state.gizmoActive);
            btn.innerHTML = state.gizmoActive
                ? '<i class="fas fa-arrows-spin"></i> 3D Eksen Gizmo (Aktif)'
                : '<i class="fas fa-arrows-spin"></i> 3D Eksen Gizmo (Kapalı)';
        }
        notifyExternalUpdates();
    }

    function updateGizmoPositions() {
        if (!gizmoOverlayEl || !state.gizmoActive || !state.selected || !contentGroup || !camera) return;

        const container = document.getElementById('canvas-container');
        if (!container) return;

        const cw = container.offsetWidth || 1920;
        const ch = container.offsetHeight || 1080;

        // 🧠 Akıllı Orantılama: 3D nesnenin/metnin gerçek sınır kutusunu (bounding box) hesapla
        let autoRatio = 1.0;
        if (state.gizmoAutoFit && contentGroup) {
            try {
                contentGroup.updateMatrixWorld(true);
                const bbox = new THREE.Box3().setFromObject(contentGroup);
                if (!bbox.isEmpty()) {
                    const sz = new THREE.Vector3();
                    bbox.getSize(sz);
                    const maxDim = Math.max(sz.x, sz.y, sz.z);
                    autoRatio = Math.max(1.0, Math.min(2.5, maxDim / 150));
                }
            } catch (ex) {
                autoRatio = 1.0;
            }
        }

        const currentScale = state.gizmoScale || 1.0;
        const currentOpacity = (state.gizmoOpacity !== undefined) ? state.gizmoOpacity : 1.0;

        gizmoOverlayEl.style.setProperty('--gizmo-scale', currentScale);
        gizmoOverlayEl.style.setProperty('--gizmo-opacity', currentOpacity);
        gizmoOverlayEl.classList.toggle('show-labels', !!state.gizmoShowLabels);

        // 3D Dünya koordinatlarını ekrana yansıtıcı yardımcı fonksiyon
        function projectLocalPoint(vec3) {
            const v = vec3.clone();
            contentGroup.localToWorld(v);
            v.project(camera);
            return {
                x: (v.x + 1) * cw / 2,
                y: (-v.y + 1) * ch / 2,
                z: v.z
            };
        }

        // Merkez (Origin)
        const pOrigin = projectLocalPoint(new THREE.Vector3(0, 0, 0));
        const cx = pOrigin.x;
        const cy = pOrigin.y;

        // 📏 Kompakt & Doğal Mesafe
        const baseLen = (state.gizmoDistance || 75) * (state.gizmoAutoFit ? Math.min(1.25, autoRatio) : 1.0) * Math.max(0.9, Math.min(1.15, Math.sqrt(state.planeScale)));

        // Eksen Çizgisi Bitişleri (Ok uçları)
        const pLineX = projectLocalPoint(new THREE.Vector3(baseLen, 0, 0));
        const pLineY = projectLocalPoint(new THREE.Vector3(0, baseLen, 0));
        const pLineZ = projectLocalPoint(new THREE.Vector3(0, 0, baseLen));

        // Eksen Ucu Butonları (X, Y, Z harfleri - çizginin hemen ucunda)
        const pTipX = projectLocalPoint(new THREE.Vector3(baseLen * 1.16, 0, 0));
        const pTipY = projectLocalPoint(new THREE.Vector3(0, baseLen * 1.16, 0));
        const pTipZ = projectLocalPoint(new THREE.Vector3(0, 0, baseLen * 1.16));

        // 🎯 Eksenlerin 2D Ekrana Yansıyan Yön Vektörleri (Screen-Space Axis Vectors)
        function calcScreenDir(pTip) {
            const vx = pTip.x - cx;
            const vy = pTip.y - cy;
            const len = Math.hypot(vx, vy);
            if (len > 0.5) {
                return { x: vx / len, y: vy / len };
            }
            return { x: 1, y: 0 };
        }

        axisScreenDirs.x = calcScreenDir(pTipX);
        axisScreenDirs.y = calcScreenDir(pTipY);
        axisScreenDirs.z = calcScreenDir(pTipZ);

        // 3D Yaylar (Quadrant Arcs) ve Üzerindeki Renkli Noktalar
        const arcR = baseLen * 0.72;

        // 🎯 Kırmızı YZ Yayının teğet yön vektörü (Yay üzerinde döndürme yönü)
        const pMidYZ = projectLocalPoint(new THREE.Vector3(0, arcR * 0.7071, arcR * 0.7071));
        const pFwdYZ = projectLocalPoint(new THREE.Vector3(0, arcR * 0.6428, arcR * 0.7660)); // 50°
        const tLenYZ = Math.hypot(pFwdYZ.x - pMidYZ.x, pFwdYZ.y - pMidYZ.y);
        if (tLenYZ > 0.5) {
            arcScreenTangents.yz = { x: (pFwdYZ.x - pMidYZ.x) / tLenYZ, y: (pFwdYZ.y - pMidYZ.y) / tLenYZ };
        }

        function build3DArc(vStartDir, vEndDir, steps = 6) {
            const pts = [];
            let midPt = null;
            for (let i = 0; i <= steps; i++) {
                const angle = (i / steps) * (Math.PI / 2);
                const vx = (vStartDir.x * Math.cos(angle) + vEndDir.x * Math.sin(angle)) * arcR;
                const vy = (vStartDir.y * Math.cos(angle) + vEndDir.y * Math.sin(angle)) * arcR;
                const vz = (vStartDir.z * Math.cos(angle) + vEndDir.z * Math.sin(angle)) * arcR;
                const pt = projectLocalPoint(new THREE.Vector3(vx, vy, vz));
                pts.push(pt);
                if (i === Math.floor(steps / 2)) {
                    midPt = pt;
                }
            }
            const d = 'M ' + pts.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ');
            return { d, midPt };
        }

        // 1. Kırmızı Yay YZ (Pitch / Eğim: Y ile Z ekseni arası, X etrafında döner)
        const arcYZ = build3DArc(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
        // 2. Yeşil Yay XZ (Yaw / Yatay: X ile Z ekseni arası, Y etrafında döner)
        const arcXZ = build3DArc(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1));
        // 3. Mavi Yay XY (LocalRot / Dönüş: X ile Y ekseni arası, Z etrafında döner)
        const arcXY = build3DArc(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0));

        // SVG Güncelle
        const lineX = gizmoOverlayEl.querySelector('#threeDGizmoLineX');
        const lineY = gizmoOverlayEl.querySelector('#threeDGizmoLineY');
        const lineZ = gizmoOverlayEl.querySelector('#threeDGizmoLineZ');
        const arcXEl = gizmoOverlayEl.querySelector('#threeDGizmoArcX');
        const arcYEl = gizmoOverlayEl.querySelector('#threeDGizmoArcY');
        const arcZEl = gizmoOverlayEl.querySelector('#threeDGizmoArcZ');
        const originDot = gizmoOverlayEl.querySelector('#threeDGizmoOriginDot');

        if (lineX) { lineX.setAttribute('x1', cx); lineX.setAttribute('y1', cy); lineX.setAttribute('x2', pLineX.x); lineX.setAttribute('y2', pLineX.y); }
        if (lineY) { lineY.setAttribute('x1', cx); lineY.setAttribute('y1', cy); lineY.setAttribute('x2', pLineY.x); lineY.setAttribute('y2', pLineY.y); }
        if (lineZ) { lineZ.setAttribute('x1', cx); lineZ.setAttribute('y1', cy); lineZ.setAttribute('x2', pLineZ.x); lineZ.setAttribute('y2', pLineZ.y); }

        if (arcXEl) arcXEl.setAttribute('d', arcYZ.d);
        if (arcYEl) arcYEl.setAttribute('d', arcXZ.d);
        if (arcZEl) arcZEl.setAttribute('d', arcXY.d);

        if (originDot) { originDot.setAttribute('cx', cx); originDot.setAttribute('cy', cy); }

        // HTML Tutamaçları ve Noktaları Konumlandır
        const tipXEl = gizmoOverlayEl.querySelector('#threeDGizmoTipX');
        const tipYEl = gizmoOverlayEl.querySelector('#threeDGizmoTipY');
        const tipZEl = gizmoOverlayEl.querySelector('#threeDGizmoTipZ');

        const dotXEl = gizmoOverlayEl.querySelector('#threeDGizmoDotX');
        const dotYEl = gizmoOverlayEl.querySelector('#threeDGizmoDotY');
        const dotZEl = gizmoOverlayEl.querySelector('#threeDGizmoDotZ');

        if (tipXEl) { tipXEl.style.left = pTipX.x + 'px'; tipXEl.style.top = pTipX.y + 'px'; }
        if (tipYEl) { tipYEl.style.left = pTipY.x + 'px'; tipYEl.style.top = pTipY.y + 'px'; }
        if (tipZEl) { tipZEl.style.left = pTipZ.x + 'px'; tipZEl.style.top = pTipZ.y + 'px'; }

        if (dotXEl && arcYZ.midPt) { dotXEl.style.left = arcYZ.midPt.x + 'px'; dotXEl.style.top = arcYZ.midPt.y + 'px'; }
        if (dotYEl && arcXZ.midPt) { dotYEl.style.left = arcXZ.midPt.x + 'px'; dotYEl.style.top = arcXZ.midPt.y + 'px'; }
        if (dotZEl && arcXY.midPt) { dotZEl.style.left = arcXY.midPt.x + 'px'; dotZEl.style.top = arcXY.midPt.y + 'px'; }

        lastOriginScreen = { x: cx, y: cy };

        // 4. Tuval Üstü 3D Güneş Işık Tutamacı (Real 3D Perspective Projection)
        const sunWorldVec = new THREE.Vector3(state.sunPosX, state.sunPosY, state.sunPosZ);
        sunWorldVec.project(camera);
        const sunScreenX = (sunWorldVec.x + 1) * cw / 2;
        const sunScreenY = (-sunWorldVec.y + 1) * ch / 2;

        const sunLineEl = gizmoOverlayEl.querySelector('#threeDGizmoSunLine');
        if (sunLineEl) {
            sunLineEl.setAttribute('x1', cx);
            sunLineEl.setAttribute('y1', cy);
            sunLineEl.setAttribute('x2', sunScreenX);
            sunLineEl.setAttribute('y2', sunScreenY);
        }
        const sunEl = gizmoOverlayEl.querySelector('#threeDGizmoSun');
        if (sunEl) {
            sunEl.style.left = sunScreenX + 'px';
            sunEl.style.top = sunScreenY + 'px';
        }
    }

    function attachGizmoEvents(overlay) {
        // 1. Tip X (X Ekseni Kaydırma - Ok Yönünde İzdüşüm)
        const tipX = overlay.querySelector('#threeDGizmoTipX');
        if (tipX) {
            let isDragging = false;
            let startClientX, startClientY, origPosX;
            tipX.addEventListener('pointerdown', (e) => {
                isDragging = true;
                startClientX = e.clientX;
                startClientY = e.clientY;
                origPosX = state.posX;
                tipX.setPointerCapture(e.pointerId);
                e.stopPropagation();
                e.preventDefault();
            });
            tipX.addEventListener('pointermove', (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startClientX;
                const dy = e.clientY - startClientY;
                const proj = dx * axisScreenDirs.x.x + dy * axisScreenDirs.x.y;
                state.posX = Math.round(origPosX + proj * (1 / state.planeScale));
                updateContentTransform();
                syncControlsUI();
                notifyExternalUpdates();
                requestRender();
                showGizmoHud(`📐 X Ekseni: ${Math.round(state.posX)}px`, e.clientX, e.clientY);
            });
            const onUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                hideGizmoHud();
                try { tipX.releasePointerCapture(e.pointerId); } catch(ex){}
            };
            tipX.addEventListener('pointerup', onUp);
            tipX.addEventListener('pointercancel', onUp);
        }

        // 2. Tip Y (Y Ekseni Kaydırma - Ok Yönünde İzdüşüm)
        const tipY = overlay.querySelector('#threeDGizmoTipY');
        if (tipY) {
            let isDragging = false;
            let startClientX, startClientY, origPosY;
            tipY.addEventListener('pointerdown', (e) => {
                isDragging = true;
                startClientX = e.clientX;
                startClientY = e.clientY;
                origPosY = state.posY;
                tipY.setPointerCapture(e.pointerId);
                e.stopPropagation();
                e.preventDefault();
            });
            tipY.addEventListener('pointermove', (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startClientX;
                const dy = e.clientY - startClientY;
                const proj = dx * axisScreenDirs.y.x + dy * axisScreenDirs.y.y;
                state.posY = Math.round(origPosY + proj * (1 / state.planeScale));
                updateContentTransform();
                syncControlsUI();
                notifyExternalUpdates();
                requestRender();
                showGizmoHud(`📐 Y Ekseni: ${Math.round(state.posY)}px`, e.clientX, e.clientY);
            });
            const onUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                hideGizmoHud();
                try { tipY.releasePointerCapture(e.pointerId); } catch(ex){}
            };
            tipY.addEventListener('pointerup', onUp);
            tipY.addEventListener('pointercancel', onUp);
        }

        // 3. Tip Z (Z Ekseni Derinlik - Ok Yönünde İzdüşüm, Gridle Birlikte Hareket Eder)
        const tipZ = overlay.querySelector('#threeDGizmoTipZ');
        if (tipZ) {
            let isDragging = false;
            let startClientX, startClientY, origPosZ;
            tipZ.addEventListener('pointerdown', (e) => {
                isDragging = true;
                startClientX = e.clientX;
                startClientY = e.clientY;
                origPosZ = (state.posZ || 0);
                tipZ.setPointerCapture(e.pointerId);
                e.stopPropagation();
                e.preventDefault();
            });
            tipZ.addEventListener('pointermove', (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startClientX;
                const dy = e.clientY - startClientY;
                // 🎯 Ok hangi yöne bakıyorsa fareyi o yöne çekince çalışır
                const proj = dx * axisScreenDirs.z.x + dy * axisScreenDirs.z.y;
                state.posZ = Math.round(origPosZ + proj * (1 / state.planeScale));
                updateContentTransform();
                syncControlsUI();
                notifyExternalUpdates();
                requestRender();
                showGizmoHud(`📐 Z Derinlik (Gridle): ${Math.round(state.posZ)}px`, e.clientX, e.clientY);
            });
            const onUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                hideGizmoHud();
                try { tipZ.releasePointerCapture(e.pointerId); } catch(ex){}
            };
            tipZ.addEventListener('pointerup', onUp);
            tipZ.addEventListener('pointercancel', onUp);
        }

        // 4. Dot X (Kırmızı Nokta: Eğim / Pitch - Yay Teğeti İzdüşümü ve Doğal Yön)
        const dotX = overlay.querySelector('#threeDGizmoDotX');
        if (dotX) {
            let isDragging = false;
            let startClientX, startClientY, startPitch;
            dotX.addEventListener('pointerdown', (e) => {
                isDragging = true;
                startClientX = e.clientX;
                startClientY = e.clientY;
                startPitch = state.planePitch;
                dotX.setPointerCapture(e.pointerId);
                e.stopPropagation();
                e.preventDefault();
            });
            dotX.addEventListener('pointermove', (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startClientX;
                const dy = e.clientY - startClientY;
                // 🎯 Yay teğeti boyunca izdüşüm: yay yönünde çekince o yöne döner
                const proj = dx * arcScreenTangents.yz.x + dy * arcScreenTangents.yz.y;
                state.planePitch = Math.max(-90, Math.min(90, Math.round(startPitch + proj * 0.75)));
                updatePlaneTransform();
                syncControlsUI();
                notifyExternalUpdates();
                requestRender();
                showGizmoHud(`📐 Eğim (Pitch): ${state.planePitch}°`, e.clientX, e.clientY);
            });
            const onUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                hideGizmoHud();
                try { dotX.releasePointerCapture(e.pointerId); } catch(ex){}
            };
            dotX.addEventListener('pointerup', onUp);
            dotX.addEventListener('pointercancel', onUp);
        }

        // 5. Dot Y (Yeşil Nokta: Yatay Dönüş / Yaw)
        const dotY = overlay.querySelector('#threeDGizmoDotY');
        if (dotY) {
            let isDragging = false;
            let startClientX, startYaw;
            dotY.addEventListener('pointerdown', (e) => {
                isDragging = true;
                startClientX = e.clientX;
                startYaw = state.planeYaw;
                dotY.setPointerCapture(e.pointerId);
                e.stopPropagation();
                e.preventDefault();
            });
            dotY.addEventListener('pointermove', (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startClientX;
                // Sağa çekince sağa dönsün (+dx)
                let val = Math.round(startYaw + dx * 0.75);
                if (val > 180) val -= 360;
                if (val < -180) val += 360;
                state.planeYaw = val;
                updatePlaneTransform();
                syncControlsUI();
                notifyExternalUpdates();
                requestRender();
                showGizmoHud(`🔄 Yatay (Yaw): ${state.planeYaw}°`, e.clientX, e.clientY);
            });
            const onUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                hideGizmoHud();
                try { dotY.releasePointerCapture(e.pointerId); } catch(ex){}
            };
            dotY.addEventListener('pointerup', onUp);
            dotY.addEventListener('pointercancel', onUp);
        }

        // 6. Dot Z (Mavi Nokta: Düzlem İçi Dönüş / Local Rotation)
        const dotZ = overlay.querySelector('#threeDGizmoDotZ');
        if (dotZ) {
            let isDragging = false;
            let startPointerAngle = 0;
            let startLocalRot = 0;
            dotZ.addEventListener('pointerdown', (e) => {
                isDragging = true;
                const vOrigin = new THREE.Vector3(0, 0, 0);
                contentGroup.localToWorld(vOrigin);
                vOrigin.project(camera);
                const container = document.getElementById('canvas-container');
                const rect = container ? container.getBoundingClientRect() : { left: 0, top: 0, width: 1920, height: 1080 };
                const cx = rect.left + (vOrigin.x + 1) * rect.width / 2;
                const cy = rect.top + (-vOrigin.y + 1) * rect.height / 2;

                startPointerAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
                startLocalRot = state.planeLocalRot || 0;
                dotZ.setPointerCapture(e.pointerId);
                e.stopPropagation();
                e.preventDefault();
            });
            dotZ.addEventListener('pointermove', (e) => {
                if (!isDragging) return;
                const vOrigin = new THREE.Vector3(0, 0, 0);
                contentGroup.localToWorld(vOrigin);
                vOrigin.project(camera);
                const container = document.getElementById('canvas-container');
                const rect = container ? container.getBoundingClientRect() : { left: 0, top: 0, width: 1920, height: 1080 };
                const cx = rect.left + (vOrigin.x + 1) * rect.width / 2;
                const cy = rect.top + (-vOrigin.y + 1) * rect.height / 2;

                const currentPointerAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
                let deltaDeg = (currentPointerAngle - startPointerAngle) * (180 / Math.PI);
                let newRot = Math.round((startLocalRot + deltaDeg) % 360);
                if (newRot < 0) newRot += 360;
                state.planeLocalRot = newRot;
                updateContentTransform();
                syncControlsUI();
                notifyExternalUpdates();
                requestRender();
                showGizmoHud(`🔄 Düzlem İçi Dönüş: ${state.planeLocalRot}°`, e.clientX, e.clientY);
            });
            const onUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                hideGizmoHud();
                try { dotZ.releasePointerCapture(e.pointerId); } catch(ex){}
            };
            dotZ.addEventListener('pointerup', onUp);
            dotZ.addEventListener('pointercancel', onUp);
        }

        // 7. Tuval Üstü 3D Güneş Işık Tutamacı (Canvas 3D Sun Controller)
        const sunEl = overlay.querySelector('#threeDGizmoSun');
        if (sunEl) {
            let isDraggingSun = false;
            let startClientX = 0;
            let startClientY = 0;
            let startSunX = 0;
            let startSunY = 0;
            let startSunZ = 0;

            sunEl.addEventListener('pointerdown', (e) => {
                isDraggingSun = true;
                startClientX = e.clientX;
                startClientY = e.clientY;
                startSunX = state.sunPosX;
                startSunY = state.sunPosY;
                startSunZ = state.sunPosZ;
                sunEl.setPointerCapture(e.pointerId);
                e.stopPropagation();
                e.preventDefault();
                showGizmoHud(`☀️ 3D Güneş: X: ${state.sunPosX}, Y: ${state.sunPosY}, Z: ${state.sunPosZ} (Shift: Derinlik)`, e.clientX, e.clientY);
            });

            sunEl.addEventListener('pointermove', (e) => {
                if (!isDraggingSun) return;
                const dx = e.clientX - startClientX;
                const dy = e.clientY - startClientY;

                if (e.shiftKey) {
                    // Shift basılıyken: Derinlik (Z ekseni - Odanın içine/dışına)
                    state.sunPosZ = Math.round(startSunZ - dy * 2.0);
                } else {
                    // Normal sürükleme: X (Sol/Sağ - Pencereye doğru) ve Y (Aşağı/Yukarı)
                    state.sunPosX = Math.round(startSunX + dx * 1.5);
                    state.sunPosY = Math.round(startSunY - dy * 1.5);
                }

                updateLighting();
                syncControlsUI();
                updateGizmoPositions();
                notifyExternalUpdates();
                requestRender();
                showGizmoHud(`☀️ 3D Güneş: X: ${state.sunPosX}, Y: ${state.sunPosY}, Z: ${state.sunPosZ}px`, e.clientX, e.clientY);
            });

            // Tekerlek ile Güneş Derinliği (Z)
            sunEl.addEventListener('wheel', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const delta = e.deltaY > 0 ? -30 : 30;
                state.sunPosZ = Math.max(-1200, Math.min(1200, state.sunPosZ + delta));
                updateLighting();
                syncControlsUI();
                updateGizmoPositions();
                notifyExternalUpdates();
                requestRender();
                showGizmoHud(`☀️ 3D Güneş Derinlik (Z): ${state.sunPosZ}px`, e.clientX, e.clientY);
            }, { passive: false });

            const onSunUp = (e) => {
                if (!isDraggingSun) return;
                isDraggingSun = false;
                hideGizmoHud();
                try { sunEl.releasePointerCapture(e.pointerId); } catch(ex){}
            };
            sunEl.addEventListener('pointerup', onSunUp);
            sunEl.addEventListener('pointercancel', onSunUp);
        }
    }

    /**
     * 8.1. 3D Nesne Tıklama Algılama (Raycasting)
     * Tuvalde doğrudan 3D yazı/nesne üzerine tıklanıp tıklanmadığını tespit eder.
     */
    function check3DHit(clientX, clientY) {
        if (!camera || !contentGroup || !canvasEl) return false;
        const container = document.getElementById('canvas-container');
        if (!container) return false;
        const rect = container.getBoundingClientRect();
        if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return false;

        const mouseVec = new THREE.Vector2(
            ((clientX - rect.left) / rect.width) * 2 - 1,
            -((clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseVec, camera);

        const targetObjects = [];
        if (textMesh) targetObjects.push(textMesh);
        if (iconMesh) targetObjects.push(iconMesh);
        if (badgeMesh) targetObjects.push(badgeMesh);
        if (targetObjects.length === 0 && contentGroup) {
            contentGroup.traverse((child) => {
                if (child.isMesh && child !== shadowPlane) targetObjects.push(child);
            });
        }
        const intersects = raycaster.intersectObjects(targetObjects, true);
        if (intersects && intersects.length > 0) return true;

        // Harfler arası boşluklar için tolerans payı (Bounding box testi)
        try {
            const box = new THREE.Box3().setFromObject(contentGroup);
            if (!box.isEmpty()) {
                box.expandByScalar(12);
                if (raycaster.ray.intersectsBox(box)) return true;
            }
        } catch (ex) {}
        return false;
    }

    /**
     * 8.2. 3D Öge Seçim Yönetimi
     * Görsel serbestken seçimi düşürür, tuşla/tıklamayla yeniden seçildiğinde fotoğrafı kilitler.
     */
    function setSelected(selected, options = {}) {
        if (!state.active && selected) return;
        state.selected = !!selected;

        if (state.selected) {
            // 3D öge seçildiğinde görseli kilitle ki tekerlek/sürükleme çakışmasın
            if (options.autoLockPhoto !== false && window.isPhotoLocked === false) {
                if (typeof window.updatePhotoLockState === 'function') {
                    window.updatePhotoLockState(true);
                }
            }
            if (canvasEl) canvasEl.style.pointerEvents = 'auto';
            if (gridHelper) {
                gridHelper.visible = !!state.showPlaneGrid;
            }
            if (sunGroup) sunGroup.visible = true;
            if (sunRayLine) sunRayLine.visible = true;
            if (state.gizmoActive && !state.cornerPinActive) {
                initGizmoOverlay();
                if (gizmoOverlayEl) {
                    gizmoOverlayEl.style.display = 'block';
                    updateGizmoPositions();
                }
            }
            if (state.cornerPinActive) {
                initCornerPinOverlay();
                if (cornerPinOverlayEl) {
                    cornerPinOverlayEl.style.display = 'block';
                    updateCornerPinVisuals();
                }
            }
            if (!options.silent && window.showToast) {
                window.showToast('🎯 3D Öge Seçildi — Tutamaçlar & Grid Aktif (Kısayol: 3 | Bırakmak: Boşa Tıkla/ESC)', 'info');
            }
        } else {
            // 3D öge seçimi bırakıldı
            if (options.autoUnlockPhoto === true && window.isPhotoLocked === true) {
                if (typeof window.updatePhotoLockState === 'function') {
                    window.updatePhotoLockState(false);
                }
            }
            if (canvasEl) canvasEl.style.pointerEvents = 'none';
            if (gridHelper) {
                gridHelper.visible = false;
            }
            if (sunGroup) sunGroup.visible = false;
            if (sunRayLine) sunRayLine.visible = false;
            if (gizmoOverlayEl) gizmoOverlayEl.style.display = 'none';
            if (cornerPinOverlayEl) cornerPinOverlayEl.style.display = 'none';
            if (!options.silent && window.showToast) {
                window.showToast('🔓 3D Seçimi Bırakıldı — Tutamaçlar & Grid Kapandı (Seçmek İçin Yazıya Tıkla/[3])', 'info');
            }
        }

        updateSelectionUI();
        notifyExternalUpdates();
        requestRender();
    }

    function toggleSelection(options = {}) {
        if (!state.active) return;
        setSelected(!state.selected, options);
    }

    function onPhotoLockChanged(isLocked) {
        if (!state.active) return;
        if (!isLocked) {
            // Görsel serbest bırakıldıysa 3D ögenin seçimi otomatik düşsün
            if (state.selected) {
                setSelected(false, { silent: false, autoUnlockPhoto: false });
            }
        }
    }

    /**
     * 8.3. Tuval Üstü Durum Rozeti & Arayüz Senkronizasyonu
     */
    function initCanvasBadge() {
        const container = document.getElementById('canvas-container');
        if (!container) return;
        if (canvasBadgeEl && canvasBadgeEl.parentElement) return;

        const badge = document.createElement('div');
        badge.id = 'threeDCanvasBadge';
        badge.className = 'three-d-canvas-badge';
        badge.innerHTML = `
            <div class="three-d-badge-pill">
                <span class="three-d-badge-dot"></span>
                <span class="three-d-badge-text">3D Öge Seçili</span>
                <kbd class="three-d-badge-kbd">3</kbd>
            </div>
        `;
        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleSelection();
        });
        container.appendChild(badge);
        canvasBadgeEl = badge;
        updateSelectionUI();
    }

    function updateSelectionUI() {
        // 1. Sol Panel Bölüm 3 Güncellemesi
        const bar = document.getElementById('threeDSelectionBar');
        const title = document.getElementById('threeDSelTitle');
        const sub = document.getElementById('threeDSelSub');
        const btnText = document.getElementById('threeDSelBtnText');
        const selBtn = document.getElementById('threeDSelectionToggleBtn');

        if (bar) {
            bar.classList.toggle('is-selected', !!state.selected);
            bar.classList.toggle('is-free', !state.selected);
        }
        if (title) {
            title.textContent = state.selected ? '🎯 3D Öge Seçili' : '⚪ 3D Öge Boşta (Görsel Serbest)';
        }
        if (sub) {
            sub.textContent = state.selected
                ? 'Tekerlek ile 3D büyütme & sürükleme aktif'
                : 'Fotoğraf zoom & kaydırma serbest (Seçmek için [3])';
        }
        if (btnText) {
            btnText.textContent = state.selected ? 'Seçimi Bırak' : '3D Seç & Kilitle';
        }
        if (selBtn) {
            selBtn.classList.toggle('btn-deselect', !!state.selected);
            selBtn.classList.toggle('btn-select', !state.selected);
            selBtn.title = state.selected ? '3D Seçimini Bırak (Görseli Serbest Yap)' : '3D Ögeyi Seç ve Görseli Kilitle';
        }

        // 2. Tuval Üstü Yüzen Rozet (Canvas Badge) Güncellemesi
        if (!canvasBadgeEl && state.active) {
            initCanvasBadge();
        }
        if (canvasBadgeEl) {
            canvasBadgeEl.style.display = state.active ? 'flex' : 'none';
            canvasBadgeEl.classList.toggle('is-selected', !!state.selected);
            canvasBadgeEl.classList.toggle('is-free', !state.selected);
            const txt = canvasBadgeEl.querySelector('.three-d-badge-text');
            if (txt) {
                txt.textContent = state.selected ? '3D Öge Seçili' : 'Görsel Serbest';
            }
            const pill = canvasBadgeEl.querySelector('.three-d-badge-pill');
            if (pill) {
                pill.title = state.selected
                    ? '3D Öge Seçili. Tekerlekle boyutlandırabilir veya sürükleyebilirsiniz. Bırakmak için tıklayın veya [3] tuşuna basın.'
                    : 'Görsel Serbest. Zoom ve kaydırma aktif. 3D ögeyi seçmek için tıklayın veya [3] tuşuna basın.';
            }
        }
    }

    /**
     * 8. Tuval Etkileşim Dinleyicileri (Sürükleme, Döndürme, Tıklama & Tekerlek)
     */
    function attachCanvasEvents(cvs) {
        let isPointerDown = false;

        cvs.addEventListener('pointerdown', (e) => {
            if (!state.active || !state.selected || state.cornerPinActive) return;
            const isHit = check3DHit(e.clientX, e.clientY);
            const isRotateModifier = (e.button === 2 || e.altKey || e.shiftKey);
            if (!isHit && !isRotateModifier) {
                // Boş alana tıklandı: 3D seçimini bırak, tutamaçlar ve grid kapansın, görsel serbest kalsın!
                setSelected(false);
                return;
            }

            isPointerDown = true;
            dragStart.x = e.clientX;
            dragStart.y = e.clientY;
            dragMode = isRotateModifier ? 'rotate' : 'move';
            cvs.style.cursor = (dragMode === 'move') ? 'grabbing' : 'crosshair';
            cvs.setPointerCapture(e.pointerId);
            if (dragMode === 'move') {
                showGizmoHud(`📍 Konum: X: ${Math.round(state.posX)}, Y: ${Math.round(state.posY)}`, e.clientX, e.clientY);
            }
            e.stopPropagation();
            e.preventDefault();
        });

        cvs.addEventListener('pointermove', (e) => {
            if (!state.active || !state.selected || state.cornerPinActive) return;

            if (!isPointerDown) {
                // Üzerine gelindiğinde (Hover) doğrudan tutma imleci göster
                if (check3DHit(e.clientX, e.clientY)) {
                    cvs.style.cursor = 'grab';
                } else if (cvs.style.cursor === 'grab') {
                    cvs.style.cursor = 'default';
                }
                return;
            }

            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            dragStart.x = e.clientX;
            dragStart.y = e.clientY;

            if (dragMode === 'rotate') {
                state.planeYaw = Math.round((state.planeYaw + dx * 0.5) % 360);
                state.planePitch = Math.max(-90, Math.min(90, Math.round(state.planePitch - dy * 0.5)));
                updatePlaneTransform();
                syncControlsUI();
                showGizmoHud(`🔄 Yatay: ${state.planeYaw}°, Eğim: ${state.planePitch}°`, e.clientX, e.clientY);
            } else {
                // 🎯 3D Perspektif Eksen İzdüşümleriyle Doğal Taşıma
                const projX = dx * axisScreenDirs.x.x + dy * axisScreenDirs.x.y;
                const projY = dx * axisScreenDirs.y.x + dy * axisScreenDirs.y.y;
                state.posX += projX * (1 / state.planeScale);
                state.posY += projY * (1 / state.planeScale);
                updateContentTransform();
                syncControlsUI();
                showGizmoHud(`📍 Konum: X: ${Math.round(state.posX)}, Y: ${Math.round(state.posY)}`, e.clientX, e.clientY);
            }
            notifyExternalUpdates();
            requestRender();
        });

        const onPointerUp = (e) => {
            if (!isPointerDown) return;
            isPointerDown = false;
            hideGizmoHud();
            try { cvs.releasePointerCapture(e.pointerId); } catch(ex){}
            if (check3DHit(e.clientX, e.clientY)) {
                cvs.style.cursor = 'grab';
            } else {
                cvs.style.cursor = 'default';
            }
        };

        cvs.addEventListener('pointerup', onPointerUp);
        cvs.addEventListener('pointercancel', onPointerUp);

        cvs.addEventListener('contextmenu', (e) => {
            if (state.active) e.preventDefault();
        });

        cvs.addEventListener('wheel', (e) => {
            if (!state.active || !state.selected || window.isPhotoLocked === false) return;
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.05 : 0.05;
            state.planeScale = Math.max(0.2, Math.min(3.0, parseFloat((state.planeScale + delta).toFixed(2))));
            updatePlaneTransform();
            syncControlsUI();
            notifyExternalUpdates();
            requestRender();
        }, { passive: false });

        // 🎯 Tuval Konteyneri Dinleyicileri (Seçim kapalıyken tıklamayla doğrudan seçme & Hover cursor)
        const container = document.getElementById('canvas-container');
        if (container && !container._threeDContainerEventsAttached) {
            container._threeDContainerEventsAttached = true;

            // Capture phase: 3D öge seçili değilken (görsel serbestken) doğrudan 3D yazı/mesh'e tıklanırsa seç ve hemen taşımaya başla
            container.addEventListener('pointerdown', (e) => {
                if (!state.active || state.selected) return;
                if (e.button !== 0) return; // Yalnızca sol tık
                if (check3DHit(e.clientX, e.clientY)) {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelected(true, { autoLockPhoto: true });
                    // İlk tıklamada bırakmadan hemen taşımaya başla
                    isPointerDown = true;
                    dragStart.x = e.clientX;
                    dragStart.y = e.clientY;
                    dragMode = 'move';
                    cvs.style.cursor = 'grabbing';
                    try { cvs.setPointerCapture(e.pointerId); } catch(ex){}
                    showGizmoHud(`📍 Konum: X: ${Math.round(state.posX)}, Y: ${Math.round(state.posY)}`, e.clientX, e.clientY);
                }
            }, true);

            // Hover imleci (Üzerine gelindiğinde el işareti göster)
            let lastCheckTime = 0;
            container.addEventListener('pointermove', (e) => {
                if (!state.active || state.selected) return;
                const now = Date.now();
                if (now - lastCheckTime < 60) return;
                lastCheckTime = now;

                if (check3DHit(e.clientX, e.clientY)) {
                    container.style.cursor = 'pointer';
                } else if (container.style.cursor === 'pointer') {
                    container.style.cursor = '';
                }
            });
        }

        // ⌨️ Klavye Kısayolları (3 ve ESC)
        if (!window._threeDKeyEventsAttached) {
            window._threeDKeyEventsAttached = true;
            window.addEventListener('keydown', (e) => {
                // Metin kutusu veya form elemanındayken kısayolları engelle
                const tag = (document.activeElement && document.activeElement.tagName) ? document.activeElement.tagName.toUpperCase() : '';
                if (tag === 'INPUT' || tag === 'TEXTAREA' || (document.activeElement && document.activeElement.isContentEditable)) {
                    return;
                }

                if (e.key === '3' || e.code === 'Digit3' || e.code === 'Numpad3') {
                    if (state.active) {
                        e.preventDefault();
                        toggleSelection();
                    }
                } else if (e.key === 'Escape') {
                    if (state.active && state.selected) {
                        setSelected(false);
                    }
                }
            });
        }
    }

    /**
     * 9. Hazır Perspektif Şablonları (Presets)
     */
    function applyPreset(presetKey) {
        switch (presetKey) {
            case 'ground':
                state.planePitch = -65;
                state.planeYaw = 15;
                state.planeRoll = 0;
                state.orientation = 'flat';
                break;
            case 'totem':
                state.planePitch = -65;
                state.planeYaw = 15;
                state.planeRoll = 0;
                state.orientation = 'standing';
                break;
            case 'left_wall':
                state.planePitch = 0;
                state.planeYaw = 35;
                state.planeRoll = 0;
                state.orientation = 'flat';
                break;
            case 'right_wall':
                state.planePitch = 0;
                state.planeYaw = -35;
                state.planeRoll = 0;
                state.orientation = 'flat';
                break;
            case 'straight':
            default:
                state.planePitch = 0;
                state.planeYaw = 0;
                state.planeRoll = 0;
                state.orientation = 'flat';
                break;
        }

        updatePlaneTransform();
        updateContentTransform();
        syncControlsUI();
        if (state.cornerPinActive) updateCornerPinHandlesFromScene();
        notifyExternalUpdates();
        requestRender();
    }

    /**
     * 10. 4K Ultra-HD Tuvale Fırınlama (Hi-Res Bake)
     */
    function bakeToCanvas() {
        if (!renderer || !canvasEl) return false;

        const prevGrid = state.showPlaneGrid;
        const prevPinActive = state.cornerPinActive;
        const prevGizmoActive = state.gizmoActive;
        if (gridHelper) gridHelper.visible = false;
        if (sunGroup) sunGroup.visible = false;
        if (sunRayLine) sunRayLine.visible = false;
        if (cornerPinOverlayEl) cornerPinOverlayEl.style.display = 'none';
        if (gizmoOverlayEl) gizmoOverlayEl.style.display = 'none';

        const drawCanvas = document.getElementById('draw-layer') || document.getElementById('drawCanvas');
        const photoCanvas = document.querySelector('.photo-render-canvas');

        const nativeW = (photoCanvas && photoCanvas.width > 0) ? photoCanvas.width : (drawCanvas ? drawCanvas.width : 1920);
        const nativeH = (photoCanvas && photoCanvas.height > 0) ? photoCanvas.height : (drawCanvas ? drawCanvas.height : 1080);

        // Geçici Ultra-HD Çözünürlükte Render
        const curW = canvasEl.width;
        const curH = canvasEl.height;
        renderer.setSize(nativeW, nativeH, false);
        camera.aspect = nativeW / nativeH;
        camera.updateProjectionMatrix();

        renderer.render(scene, camera);

        if (drawCanvas && drawCanvas.getContext) {
            const ctx = drawCanvas.getContext('2d');
            ctx.drawImage(canvasEl, 0, 0, drawCanvas.width, drawCanvas.height);
            state.hasBaked = true;
        }

        // Boyutları orijinal durumuna geri getir
        renderer.setSize(curW, curH, false);
        camera.aspect = curW / curH;
        camera.updateProjectionMatrix();

        if (gridHelper) gridHelper.visible = !!state.selected && prevGrid;
        if (sunGroup) sunGroup.visible = !!state.selected;
        if (sunRayLine) sunRayLine.visible = !!state.selected;
        if (cornerPinOverlayEl && prevPinActive) cornerPinOverlayEl.style.display = 'block';
        if (gizmoOverlayEl && prevGizmoActive && !prevPinActive) {
            gizmoOverlayEl.style.display = 'block';
            updateGizmoPositions();
        }
        requestRender();

        notifyExternalUpdates();

        if (window.showToast) {
            window.showToast('✅ 3D Ögeler 4K Ultra-HD Kalitede Tuvale Fırınlandı!', 3500);
        } else {
            alert('3D Ögeler 4K Ultra-HD Kalitede Tuvale Fırınlandı!');
        }
        return true;
    }

    /**
     * 11. Arayüz ve Kontrol Paneli Eşitlemesi
     */
    function syncControlsUI() {
        const panel = document.getElementById('threeDStudioPanel');
        if (!panel) return;

        const textInput = panel.querySelector('#threeDTextInput');
        const sizeInput = panel.querySelector('#threeDSizeInput');
        const depthInput = panel.querySelector('#threeDDepthInput');
        const pitchInput = panel.querySelector('#threeDPitchInput');
        const yawInput = panel.querySelector('#threeDYawInput');
        const rollInput = panel.querySelector('#threeDRollInput');
        const scaleInput = panel.querySelector('#threeDScaleInput');
        const bevelCheck = panel.querySelector('#threeDBevelCheck');
        const frontColor = panel.querySelector('#threeDFrontColor');
        const sideColor = panel.querySelector('#threeDSideColor');
        const sunPosXInput = panel.querySelector('#threeDSunPosX');
        const sunPosYInput = panel.querySelector('#threeDSunPosY');
        const sunPosZInput = panel.querySelector('#threeDSunPosZ');
        const lightIntInput = panel.querySelector('#threeDLightIntensity');
        const shadowOp = panel.querySelector('#threeDShadowOpacity');
        const shadowSoft = panel.querySelector('#threeDShadowSoftness');
        const elevInput = panel.querySelector('#threeDElevationInput');
        const localRotInput = panel.querySelector('#threeDLocalRotInput');

        if (textInput && textInput.value !== state.text) textInput.value = state.text;
        if (sizeInput) {
            sizeInput.value = state.textSize;
            panel.querySelector('#threeDSizeVal').textContent = state.textSize + 'px';
        }
        if (depthInput) {
            depthInput.value = state.depth;
            panel.querySelector('#threeDDepthVal').textContent = state.depth + 'px';
        }
        if (pitchInput) {
            pitchInput.value = state.planePitch;
            panel.querySelector('#threeDPitchVal').textContent = state.planePitch + '°';
        }
        if (yawInput) {
            yawInput.value = state.planeYaw;
            panel.querySelector('#threeDYawVal').textContent = state.planeYaw + '°';
        }
        if (rollInput) {
            rollInput.value = state.planeRoll;
            panel.querySelector('#threeDRollVal').textContent = state.planeRoll + '°';
        }
        if (scaleInput) {
            scaleInput.value = Math.round(state.planeScale * 100);
            panel.querySelector('#threeDScaleVal').textContent = Math.round(state.planeScale * 100) + '%';
        }
        if (elevInput) {
            elevInput.value = state.planeElevation;
            panel.querySelector('#threeDElevationVal').textContent = state.planeElevation + 'px';
        }
        if (localRotInput) {
            localRotInput.value = state.planeLocalRot;
            panel.querySelector('#threeDLocalRotVal').textContent = state.planeLocalRot + '°';
        }
        if (bevelCheck) bevelCheck.checked = !!state.bevelEnabled;
        if (frontColor) frontColor.value = state.frontColor;
        if (sideColor) sideColor.value = state.sideColor;
        if (sunPosXInput) {
            sunPosXInput.value = state.sunPosX;
            panel.querySelector('#threeDSunPosXVal').textContent = state.sunPosX + 'px';
        }
        if (sunPosYInput) {
            sunPosYInput.value = state.sunPosY;
            panel.querySelector('#threeDSunPosYVal').textContent = state.sunPosY + 'px';
        }
        if (sunPosZInput) {
            sunPosZInput.value = state.sunPosZ;
            panel.querySelector('#threeDSunPosZVal').textContent = state.sunPosZ + 'px';
        }
        if (lightIntInput) {
            lightIntInput.value = state.lightIntensity;
            panel.querySelector('#threeDLightIntensityVal').textContent = state.lightIntensity + 'x';
        }
        if (shadowOp) {
            shadowOp.value = Math.round(state.shadowOpacity * 100);
            panel.querySelector('#threeDShadowVal').textContent = Math.round(state.shadowOpacity * 100) + '%';
        }
        if (shadowSoft) {
            shadowSoft.value = state.shadowSoftness;
            panel.querySelector('#threeDShadowSoftVal').textContent = state.shadowSoftness + 'x';
        }

        panel.querySelectorAll('.three-d-elem-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-type') === state.elementType);
        });

        // 🌟 Rozet & İkon Paneli Senkronizasyonu
        const badgeSection = panel.querySelector('#threeDBadgeSection');
        const textRow = panel.querySelector('#threeDTextRow');
        const sizeRow = panel.querySelector('#threeDSizeRow');
        const textSecTitle = panel.querySelector('#threeDTextSectionTitle');

        const isBadge = state.elementType && (state.elementType.startsWith('badge_') || state.elementType === 'icon_3d');
        if (badgeSection) badgeSection.style.display = isBadge ? 'block' : 'none';
        if (textRow) textRow.style.display = isBadge ? 'none' : 'flex';
        if (sizeRow) sizeRow.style.display = isBadge ? 'none' : 'flex';
        if (textSecTitle) textSecTitle.textContent = isBadge ? '📐 3D KALINLIK & IŞIK PAHI' : '🔤 METİN & 3D KALINLIK';

        if (isBadge) {
            const bMainText = panel.querySelector('#threeDBadgeMainText');
            if (bMainText && bMainText.value !== state.text) bMainText.value = state.text;

            const bSubText = panel.querySelector('#threeDBadgeSubText');
            if (bSubText && bSubText.value !== (state.badgeSubtext || '')) bSubText.value = state.badgeSubtext || '';

            const bBgColor = panel.querySelector('#threeDBadgeBgColor');
            if (bBgColor) bBgColor.value = state.badgeBgColor || '#0f172a';

            const bTextColor = panel.querySelector('#threeDBadgeTextColor');
            if (bTextColor) bTextColor.value = state.frontColor;

            const bSideColor = panel.querySelector('#threeDBadgeSideColor');
            if (bSideColor) bSideColor.value = state.sideColor;

            // İkon Önizleme
            const iconPreview = panel.querySelector('#threeDSelectedIconPreview');
            if (iconPreview) {
                if (state.selectedIconId && state.selectedIconId !== 'none') {
                    const svgStr = getIconSvgById(state.selectedIconId);
                    iconPreview.innerHTML = svgStr || '<span style="font-size:11px; color:#64748b;">(İkonsuz)</span>';
                } else {
                    iconPreview.innerHTML = '<span style="font-size:11px; color:#64748b;">(İkonsuz)</span>';
                }
            }
        }

        const flatBtn = panel.querySelector('#threeDOrientFlatBtn');
        const standBtn = panel.querySelector('#threeDOrientStandBtn');
        if (flatBtn) flatBtn.classList.toggle('active', state.orientation === 'flat');
        if (standBtn) standBtn.classList.toggle('active', state.orientation === 'standing');

        const pinBtn = panel.querySelector('#threeDCornerPinToggleBtn');
        if (pinBtn) pinBtn.classList.toggle('active', !!state.cornerPinActive);

        const gizmoBtn = panel.querySelector('#threeDGizmoToggleBtn');
        if (gizmoBtn) {
            gizmoBtn.classList.toggle('active', !!state.gizmoActive);
            gizmoBtn.innerHTML = state.gizmoActive
                ? '<i class="fas fa-arrows-spin"></i> 3D Eksen Gizmo (Aktif)'
                : '<i class="fas fa-arrows-spin"></i> 3D Eksen Gizmo (Kapalı)';
        }

        const gizmoSettingsBox = panel.querySelector('#threeDGizmoSettingsBox');
        if (gizmoSettingsBox) {
            gizmoSettingsBox.style.display = state.gizmoSettingsOpen ? 'block' : 'none';
        }
        const gizmoSettingsBtn = panel.querySelector('#threeDGizmoSettingsToggleBtn');
        if (gizmoSettingsBtn) {
            gizmoSettingsBtn.classList.toggle('active', !!state.gizmoSettingsOpen);
        }
        const autoFitCheck = panel.querySelector('#threeDGizmoAutoFitCheck');
        if (autoFitCheck) autoFitCheck.checked = !!state.gizmoAutoFit;

        const scaleVal = Math.round((state.gizmoScale || 1.0) * 100);
        const gizmoScaleInput = panel.querySelector('#threeDGizmoScaleInput');
        if (gizmoScaleInput) {
            gizmoScaleInput.value = scaleVal;
            const scaleLbl = panel.querySelector('#threeDGizmoScaleVal');
            if (scaleLbl) scaleLbl.textContent = scaleVal + '%';
        }
        panel.querySelectorAll('.three-d-scale-chip').forEach(chip => {
            chip.classList.toggle('active', parseInt(chip.dataset.scale) === scaleVal);
        });

        const currentDist = state.gizmoDistance || 75;
        const distInput = panel.querySelector('#threeDGizmoDistanceInput');
        if (distInput) {
            distInput.value = currentDist;
            const distLbl = panel.querySelector('#threeDGizmoDistanceVal');
            if (distLbl) distLbl.textContent = currentDist + 'px';
        }
        panel.querySelectorAll('.three-d-dist-chip').forEach(chip => {
            chip.classList.toggle('active', parseInt(chip.dataset.dist) === currentDist);
        });

        const opInput = panel.querySelector('#threeDGizmoOpacityInput');
        if (opInput) {
            const opVal = Math.round((state.gizmoOpacity !== undefined ? state.gizmoOpacity : 1.0) * 100);
            opInput.value = opVal;
            const opLbl = panel.querySelector('#threeDGizmoOpacityVal');
            if (opLbl) opLbl.textContent = opVal + '%';
        }

        const labelsCheck = panel.querySelector('#threeDGizmoShowLabelsCheck');
        if (labelsCheck) labelsCheck.checked = !!state.gizmoShowLabels;

        const hudCheck = panel.querySelector('#threeDGizmoShowHudCheck');
        if (hudCheck) hudCheck.checked = state.gizmoShowHud !== false;

        updateSelectionUI();
    }

    /**
     * 12. Kayan Pro Kontrol Panelini Dinamik Oluşturma (Faz 3)
     */
    function ensureStudioPanel() {
        let panel = document.getElementById('threeDStudioPanel');
        if (panel) return panel;

        panel = document.createElement('div');
        panel.id = 'threeDStudioPanel';
        panel.className = 'three-d-panel';

        panel.innerHTML = `
            <div id="threeDPanelHeader" class="three-d-header">
                <div class="three-d-title">
                    <i class="fas fa-cube" style="color:#0ea5e9;"></i>
                    <span>3D Düzlem & Metin (PRO)</span>
                </div>
                <div class="three-d-header-actions">
                    <button id="threeDResetBtn" title="Varsayılana Sıfırla" class="three-d-icon-btn"><i class="fas fa-rotate-left"></i></button>
                    <button id="threeDVisHeaderBtn" title="Görünürlüğü Aç/Kapat" class="three-d-icon-btn"><i class="fas fa-eye"></i></button>
                    <button id="threeDCloseBtn" title="Kapat" class="three-d-icon-btn"><i class="fas fa-times"></i></button>
                </div>
            </div>

            <div id="threeDLoadingStatus" class="three-d-loading" style="display:none;">
                <i class="fas fa-circle-notch fa-spin"></i> 3D Motoru Hazırlanıyor...
            </div>

            <div class="three-d-body custom-scrollbar">
                <!-- 1. ÖGE TÜRÜ SEÇİMİ -->
                <div class="three-d-section">
                    <div class="three-d-section-title">📦 3D ÖGE TÜRÜ</div>
                    <div class="three-d-elem-subhead">🔤 Metin & Yön</div>
                    <div class="three-d-elem-grid">
                        <button class="three-d-elem-btn active" data-type="text"><i class="fas fa-font"></i> Metin</button>
                        <button class="three-d-elem-btn" data-type="pin"><i class="fas fa-map-marker-alt"></i> 3D İğne</button>
                        <button class="three-d-elem-btn" data-type="arrow"><i class="fas fa-arrow-up"></i> 3D Yön Oku</button>
                        <button class="three-d-elem-btn" data-type="combo_pin"><i class="fas fa-map-pin"></i> İğne & Metin</button>
                        <button class="three-d-elem-btn" data-type="combo_arrow"><i class="fas fa-location-arrow"></i> Ok & Metin</button>
                    </div>
                    <div class="three-d-elem-subhead" style="margin-top:8px;">🏷️ 3D Rozetler & İkon (Kalınlık & 6 Yön)</div>
                    <div class="three-d-elem-grid">
                        <button class="three-d-elem-btn" data-type="badge_pill" title="Kapsül Rozet"><i class="fas fa-capsules"></i> Kapsül Rozet</button>
                        <button class="three-d-elem-btn" data-type="badge_shield" title="Güvenlik Kalkanı"><i class="fas fa-shield-halved"></i> Kalkan Rozet</button>
                        <button class="three-d-elem-btn" data-type="badge_card" title="Bilgi Kartı / Plaket"><i class="fas fa-id-card"></i> Plaket Kart</button>
                        <button class="three-d-elem-btn" data-type="badge_coin" title="Dairesel Madalyon"><i class="fas fa-coins"></i> Madalyon</button>
                        <button class="three-d-elem-btn" data-type="icon_3d" title="3D Bağımsız İkon"><i class="fas fa-gem"></i> 3D İkon</button>
                    </div>
                </div>

                <!-- 🌟 1B. 3D ROZET & İKON AYARLARI -->
                <div class="three-d-section" id="threeDBadgeSection" style="display:none;">
                    <div class="three-d-section-title">🏷️ 3D ROZET & İKON AYARLARI</div>
                    
                    <!-- İkon Seçimi & Önizleme -->
                    <div class="three-d-badge-icon-row">
                        <div class="three-d-selected-icon-preview" id="threeDSelectedIconPreview" title="Seçili İkon Önizleme">
                            <!-- SVG dinamik yüklenir -->
                        </div>
                        <div style="flex:1; display:flex; gap:6px;">
                            <button type="button" id="threeDOpenIconPickerBtn" class="three-d-icon-picker-btn">
                                <i class="fas fa-icons"></i> 🖼️ İkon Seç (200+ İkon)
                            </button>
                            <button type="button" id="threeDRemoveIconBtn" class="three-d-icon-clear-btn" title="İkonsuz Kullan">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Rozet Metinleri -->
                    <div class="three-d-row" style="margin-top:8px; margin-bottom:6px;">
                        <input type="text" id="threeDBadgeMainText" class="three-d-input" placeholder="Ana Rozet Başlığı (örn: SATILIK 1.250 m²)..." value="${state.text}">
                    </div>
                    <div class="three-d-row" style="margin-bottom:8px;">
                        <input type="text" id="threeDBadgeSubText" class="three-d-input" placeholder="Alt Başlık / Slogan (örn: MÜSTAKİL TAPU)..." value="${state.badgeSubtext || ''}">
                    </div>

                    <!-- Rozet Zemin & Kenarlık Renkleri -->
                    <div class="three-d-color-row" style="margin-bottom:8px;">
                        <div class="three-d-color-item">
                            <span class="three-d-color-lbl">Rozet Gövde</span>
                            <input type="color" id="threeDBadgeBgColor" value="${state.badgeBgColor || '#0f172a'}" class="three-d-color-picker">
                        </div>
                        <div class="three-d-color-item">
                            <span class="three-d-color-lbl">Yazı / Vurgu</span>
                            <input type="color" id="threeDBadgeTextColor" value="${state.frontColor}" class="three-d-color-picker">
                        </div>
                        <div class="three-d-color-item">
                            <span class="three-d-color-lbl">3D Yan Kalınlık</span>
                            <input type="color" id="threeDBadgeSideColor" value="${state.sideColor}" class="three-d-color-picker">
                        </div>
                    </div>

                    <!-- Hızlı Emlak Rozet Temaları -->
                    <div class="three-d-badge-themes-title">Hızlı Emlak Rozet Temaları:</div>
                    <div class="three-d-badge-themes-row">
                        <button type="button" class="three-d-badge-theme-chip" data-bg="#b91c1c" data-front="#ffffff" data-side="#7f1d1d" title="Emlak Kırmızı"><span style="background:#b91c1c;"></span>🔴 Kırmızı</button>
                        <button type="button" class="three-d-badge-theme-chip" data-bg="#0f172a" data-front="#f59e0b" data-side="#92400e" title="Altın Lüks"><span style="background:#f59e0b;"></span>🟡 Altın</button>
                        <button type="button" class="three-d-badge-theme-chip" data-bg="#1e3a8a" data-front="#ffffff" data-side="#172554" title="Kurumsal Mavi"><span style="background:#1e3a8a;"></span>🔵 Kurumsal</button>
                        <button type="button" class="three-d-badge-theme-chip" data-bg="#047857" data-front="#ffffff" data-side="#064e3b" title="Fırsat Zümrüt"><span style="background:#047857;"></span>🟢 Fırsat</button>
                        <button type="button" class="three-d-badge-theme-chip" data-bg="#ffffff" data-front="#0f172a" data-side="#94a3b8" title="Mat Beyaz"><span style="background:#ffffff; border:1px solid #cbd5e1;"></span>⚪ Beyaz</button>
                        <button type="button" class="three-d-badge-theme-chip" data-bg="#581c87" data-front="#facc15" data-side="#3b0764" title="VIP Mor"><span style="background:#581c87;"></span>🟣 VIP Mor</button>
                        <button type="button" class="three-d-badge-theme-chip" data-bg="#c2410c" data-front="#ffffff" data-side="#7c2d12" title="Canlı Turuncu"><span style="background:#c2410c;"></span>🟠 Turuncu</button>
                        <button type="button" class="three-d-badge-theme-chip" data-bg="#1e293b" data-front="#38bdf8" data-side="#0284c7" title="Neon Cyan"><span style="background:#38bdf8;"></span>💎 Neon</button>
                    </div>
                </div>

                <!-- 2. METİN & 3D KALINLIK -->
                <div class="three-d-section" id="threeDTextSection">
                    <div class="three-d-section-title" id="threeDTextSectionTitle">🔤 METİN & 3D KALINLIK</div>
                    <div class="three-d-row" id="threeDTextRow" style="margin-bottom:8px;">
                        <input type="text" id="threeDTextInput" class="three-d-input" placeholder="Yazı metni girin..." value="${state.text}">
                    </div>
                    <div class="three-d-row" id="threeDSizeRow">
                        <span class="three-d-label">Boyut:</span>
                        <input type="range" id="threeDSizeInput" class="three-d-range" min="14" max="110" value="${state.textSize}">
                        <span id="threeDSizeVal" class="three-d-val">${state.textSize}px</span>
                    </div>
                    <div class="three-d-row">
                        <span class="three-d-label"><strong>3D Kalınlık:</strong></span>
                        <input type="range" id="threeDDepthInput" class="three-d-range" min="1" max="80" value="${state.depth}">
                        <span id="threeDDepthVal" class="three-d-val" style="color:#38bdf8; font-weight:bold;">${state.depth}px</span>
                    </div>
                    <div class="three-d-row" style="justify-content:space-between; margin-top:4px;">
                        <label style="font-size:11px; display:flex; align-items:center; gap:6px; cursor:pointer; color:#94a3b8;">
                            <input type="checkbox" id="threeDBevelCheck" checked> Kenarlarda Işık Pahı (Bevel)
                        </label>
                    </div>
                </div>

                <!-- 3. DÜZLEM VE AÇI AYARLARI -->
                <div class="three-d-section">
                    <div class="three-d-section-title">📐 DÜZLEM & AÇI (ARAZİ / DUVAR UYUMU)</div>
                    
                    <!-- 🎯 3D SEÇİM & MOD ÇUBUĞU (Kullanıcı İsteği: Görsel serbestken seçim düşer, 3 tuşuyla tekrar seçilir) -->
                    <div id="threeDSelectionBar" class="three-d-selection-bar ${state.selected ? 'is-selected' : 'is-free'}">
                        <div class="three-d-selection-info">
                            <span class="three-d-status-dot"></span>
                            <div class="three-d-status-texts">
                                <span class="three-d-status-title" id="threeDSelTitle">${state.selected ? '🎯 3D Öge Seçili' : '⚪ 3D Öge Boşta (Görsel Serbest)'}</span>
                                <span class="three-d-status-sub" id="threeDSelSub">${state.selected ? 'Tekerlek ile 3D büyütme & sürükleme aktif' : 'Fotoğraf zoom & kaydırma serbest (Seçmek için [3])'}</span>
                            </div>
                        </div>
                        <button type="button" id="threeDSelectionToggleBtn" class="three-d-sel-btn ${state.selected ? 'btn-deselect' : 'btn-select'}" title="${state.selected ? '3D Seçimini Bırak (Görseli Serbest Yap)' : '3D Ögeyi Seç ve Görseli Kilitle'}">
                            <span id="threeDSelBtnText">${state.selected ? 'Seçimi Bırak' : '3D Seç & Kilitle'}</span>
                            <kbd class="three-d-kbd">3</kbd>
                        </button>
                    </div>

                    <div style="display:flex; gap:6px; margin-bottom:8px;">
                        <button id="threeDGizmoToggleBtn" class="three-d-gizmo-btn ${state.gizmoActive ? 'active' : ''}" style="flex:1;">
                            <i class="fas fa-arrows-spin"></i> 3D Eksen Gizmo (${state.gizmoActive ? 'Aktif' : 'Kapalı'})
                        </button>
                        <button id="threeDGizmoSettingsToggleBtn" class="three-d-gizmo-gear-btn ${state.gizmoSettingsOpen ? 'active' : ''}" title="Tutamaç & Eksen Ayarları">
                            <i class="fas fa-sliders"></i>
                        </button>
                        <button id="threeDCornerPinToggleBtn" class="three-d-corner-pin-btn ${state.cornerPinActive ? 'active' : ''}" style="flex:1;">
                            <i class="fas fa-crosshairs"></i> 4 Köşe Oturtma
                        </button>
                    </div>

                    <!-- TUTAMAÇ & GİZMO AYARLARI ALT PANELİ (Panel Stilinde, Dolgusuz / Temiz Çizgili) -->
                    <div id="threeDGizmoSettingsBox" class="three-d-gizmo-settings-box" style="display:${state.gizmoSettingsOpen ? 'block' : 'none'};">
                        <div class="three-d-settings-box-header">
                            <div class="three-d-settings-box-title">
                                <i class="fas fa-sliders" style="color:#0284c7;"></i> Tutamaç & Eksen Ayarları
                            </div>
                            <button id="threeDGizmoSettingsCloseBtn" class="three-d-box-close-btn" title="Kapat">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <!-- 1. Akıllı Orantılama Switch -->
                        <div class="three-d-setting-item">
                            <label class="three-d-checkbox-label">
                                <input type="checkbox" id="threeDGizmoAutoFitCheck" ${state.gizmoAutoFit ? 'checked' : ''}>
                                <span class="three-d-setting-name">🧠 Nesneye Göre Akıllı Orantıla</span>
                            </label>
                            <div class="three-d-setting-desc">Metin veya nesne büyüdükçe tutamaçlar otomatik dışarıya açılır.</div>
                        </div>

                        <!-- 2. Tutamaç Boyutu (Scale) Slider + Presets -->
                        <div class="three-d-setting-item">
                            <div class="three-d-setting-row">
                                <span class="three-d-setting-lbl">Tutamaç Boyutu:</span>
                                <input type="range" id="threeDGizmoScaleInput" class="three-d-range" min="60" max="200" step="5" value="${Math.round((state.gizmoScale || 1.0) * 100)}">
                                <span id="threeDGizmoScaleVal" class="three-d-val">${Math.round((state.gizmoScale || 1.0) * 100)}%</span>
                            </div>
                            <div class="three-d-scale-presets">
                                <button class="three-d-scale-chip ${Math.round((state.gizmoScale || 1.0) * 100) === 80 ? 'active' : ''}" data-scale="80">Kompakt %80</button>
                                <button class="three-d-scale-chip ${Math.round((state.gizmoScale || 1.0) * 100) === 100 ? 'active' : ''}" data-scale="100">Normal %100</button>
                                <button class="three-d-scale-chip ${Math.round((state.gizmoScale || 1.0) * 100) === 125 ? 'active' : ''}" data-scale="125">Belirgin %125</button>
                                <button class="three-d-scale-chip ${Math.round((state.gizmoScale || 1.0) * 100) === 150 ? 'active' : ''}" data-scale="150">Geniş %150</button>
                            </div>
                        </div>

                        <!-- 3. Açılma Mesafesi (Eksen Uzunluğu) + Presets -->
                        <div class="three-d-setting-item">
                            <div class="three-d-setting-row">
                                <span class="three-d-setting-lbl">Eksen Mesafesi:</span>
                                <input type="range" id="threeDGizmoDistanceInput" class="three-d-range" min="40" max="200" step="5" value="${state.gizmoDistance || 75}">
                                <span id="threeDGizmoDistanceVal" class="three-d-val">${state.gizmoDistance || 75}px</span>
                            </div>
                            <div class="three-d-dist-presets">
                                <button class="three-d-dist-chip ${(state.gizmoDistance || 75) === 55 ? 'active' : ''}" data-dist="55">Kompakt (55px)</button>
                                <button class="three-d-dist-chip ${(state.gizmoDistance || 75) === 75 ? 'active' : ''}" data-dist="75">Dengeli (75px)</button>
                                <button class="three-d-dist-chip ${(state.gizmoDistance || 75) === 110 ? 'active' : ''}" data-dist="110">Açık (110px)</button>
                            </div>
                        </div>

                        <!-- 4. Gizmo Opaklığı -->
                        <div class="three-d-setting-item">
                            <div class="three-d-setting-row">
                                <span class="three-d-setting-lbl">Gizmo Opaklığı:</span>
                                <input type="range" id="threeDGizmoOpacityInput" class="three-d-range" min="30" max="100" step="5" value="${Math.round((state.gizmoOpacity || 1.0) * 100)}">
                                <span id="threeDGizmoOpacityVal" class="three-d-val">${Math.round((state.gizmoOpacity || 1.0) * 100)}%</span>
                            </div>
                        </div>

                        <!-- 5. Eksen Rozetleri & Canlı HUD -->
                        <div class="three-d-setting-toggles">
                            <label class="three-d-checkbox-label">
                                <input type="checkbox" id="threeDGizmoShowLabelsCheck" ${state.gizmoShowLabels ? 'checked' : ''}>
                                <span>🏷️ Eksen Rozet Metinleri (Eğim, Yatay vb.)</span>
                            </label>
                            <label class="three-d-checkbox-label">
                                <input type="checkbox" id="threeDGizmoShowHudCheck" ${state.gizmoShowHud !== false ? 'checked' : ''}>
                                <span>💬 Canlı Derece HUD Bildirimi</span>
                            </label>
                        </div>
                    </div>

                    <div class="three-d-presets-grid" style="margin-top:8px;">
                        <button class="three-d-preset-btn" data-preset="ground"><i class="fas fa-mountain"></i> Arsa & Zemin</button>
                        <button class="three-d-preset-btn" data-preset="totem"><i class="fas fa-sign-hanging"></i> Arsa Totem</button>
                        <button class="three-d-preset-btn" data-preset="left_wall"><i class="fas fa-building"></i> Sol Duvar</button>
                        <button class="three-d-preset-btn" data-preset="right_wall"><i class="fas fa-building"></i> Sağ Duvar</button>
                        <button class="three-d-preset-btn" data-preset="straight"><i class="fas fa-square"></i> Düz Cephe</button>
                    </div>

                    <div class="three-d-row" style="margin-top:10px;">
                        <span class="three-d-label">Eğim (Pitch):</span>
                        <input type="range" id="threeDPitchInput" class="three-d-range" min="-90" max="90" value="${state.planePitch}">
                        <span id="threeDPitchVal" class="three-d-val">${state.planePitch}°</span>
                    </div>
                    <div class="three-d-row">
                        <span class="three-d-label">Yatay (Yaw):</span>
                        <input type="range" id="threeDYawInput" class="three-d-range" min="-180" max="180" value="${state.planeYaw}">
                        <span id="threeDYawVal" class="three-d-val">${state.planeYaw}°</span>
                    </div>
                    <div class="three-d-row">
                        <span class="three-d-label">Yatırma (Roll):</span>
                        <input type="range" id="threeDRollInput" class="three-d-range" min="-180" max="180" value="${state.planeRoll}">
                        <span id="threeDRollVal" class="three-d-val">${state.planeRoll}°</span>
                    </div>
                    <div class="three-d-row">
                        <span class="three-d-label">Ölçek:</span>
                        <input type="range" id="threeDScaleInput" class="three-d-range" min="20" max="300" value="${Math.round(state.planeScale * 100)}">
                        <span id="threeDScaleVal" class="three-d-val">${Math.round(state.planeScale * 100)}%</span>
                    </div>
                    <div class="three-d-row" style="justify-content:space-between; margin-top:4px;">
                        <label style="font-size:11px; display:flex; align-items:center; gap:6px; cursor:pointer; color:#94a3b8;">
                            <input type="checkbox" id="threeDGridCheck" checked> 3D Referans Izgarasını Göster
                        </label>
                    </div>
                </div>

                <!-- 4. İNCE AYARLAR (DÖNÜŞ & HAVADA SÜZÜLME) -->
                <div class="three-d-section">
                    <div class="three-d-section-title">🔄 İNCE AYARLAR & HAVADA SÜZÜLME</div>
                    <div class="three-d-row">
                        <span class="three-d-label">Düzlem İçi Dönüş:</span>
                        <input type="range" id="threeDLocalRotInput" class="three-d-range" min="0" max="360" value="${state.planeLocalRot}">
                        <span id="threeDLocalRotVal" class="three-d-val">${state.planeLocalRot}°</span>
                    </div>
                    <div class="three-d-row">
                        <span class="three-d-label">Yerden Yükseklik:</span>
                        <input type="range" id="threeDElevationInput" class="three-d-range" min="0" max="80" value="${state.planeElevation}">
                        <span id="threeDElevationVal" class="three-d-val">${state.planeElevation}px</span>
                    </div>
                </div>

                <!-- 5. RENK & DURUŞ MODU -->
                <div class="three-d-section">
                    <div class="three-d-section-title">🎨 RENK & DURUŞ MODU</div>
                    <div class="three-d-btn-group" style="margin-bottom:10px;">
                        <button id="threeDOrientFlatBtn" class="three-d-tab-btn active"><i class="fas fa-layer-group"></i> Zemin & Duvara Yatık</button>
                        <button id="threeDOrientStandBtn" class="three-d-tab-btn"><i class="fas fa-monument"></i> Zemine Dik (Tabela)</button>
                    </div>

                    <div class="three-d-color-row">
                        <div class="three-d-color-item">
                            <span class="three-d-color-lbl">Ön Yüz Rengi</span>
                            <input type="color" id="threeDFrontColor" value="${state.frontColor}" class="three-d-color-picker">
                        </div>
                        <div class="three-d-color-item">
                            <span class="three-d-color-lbl">Kalınlık (Yan) Rengi</span>
                            <input type="color" id="threeDSideColor" value="${state.sideColor}" class="three-d-color-picker">
                        </div>
                    </div>

                    <div class="three-d-chips-row">
                        <button class="three-d-chip" style="background:#f59e0b;" data-front="#f59e0b" data-side="#92400e" title="Altın Sarısı"></button>
                        <button class="three-d-chip" style="background:#ffffff;" data-front="#ffffff" data-side="#64748b" title="Mat Beyaz"></button>
                        <button class="three-d-chip" style="background:#00d2ff;" data-front="#00d2ff" data-side="#0284c7" title="Neon Cyan"></button>
                        <button class="three-d-chip" style="background:#ef4444;" data-front="#ef4444" data-side="#991b1b" title="Emlak Kırmızısı"></button>
                        <button class="three-d-chip" style="background:#10b981;" data-front="#10b981" data-side="#065f46" title="Zümrüt Yeşili"></button>
                    </div>
                </div>

                <!-- 6. 3D GÜNEŞ & ODA IŞIK KAYNAĞI -->
                <div class="three-d-section">
                    <div class="three-d-section-title">☀️ 3D GÜNEŞ & ODA IŞIK KAYNAĞI</div>
                    
                    <!-- Hızlı Oda Işığı Presetleri -->
                    <div class="three-d-presets-grid" style="margin-bottom:8px;">
                        <button class="three-d-preset-btn" id="threeDSunPresetRight" type="button" title="Sağ Pencere (Işık sağdan vurur, gölge sola duvara düşer)"><i class="fas fa-sun"></i> Sağ Pencere</button>
                        <button class="three-d-preset-btn" id="threeDSunPresetLeft" type="button" title="Sol Pencere (Işık soldan vurur, gölge sağa duvara düşer)"><i class="fas fa-sun"></i> Sol Pencere</button>
                        <button class="three-d-preset-btn" id="threeDSunPresetTop" type="button" title="Tavan / Tepe Işığı"><i class="fas fa-lightbulb"></i> Tavan</button>
                        <button class="three-d-preset-btn" id="threeDSunPresetFront" type="button" title="Karşı / Flaş Işık"><i class="fas fa-camera"></i> Karşı</button>
                    </div>

                    <!-- 3D Oda Konum Koordinatları -->
                    <div class="three-d-row" style="margin-bottom:4px;">
                        <span class="three-d-label" style="width:85px;"><i class="fas fa-arrows-alt-h" style="color:#f59e0b;"></i> X (Pencere):</span>
                        <input type="range" id="threeDSunPosX" class="three-d-range" min="-1000" max="1000" value="${state.sunPosX}">
                        <span id="threeDSunPosXVal" class="three-d-val">${state.sunPosX}px</span>
                    </div>
                    <div class="three-d-row" style="margin-bottom:4px;">
                        <span class="three-d-label" style="width:85px;"><i class="fas fa-arrows-alt-v" style="color:#10b981;"></i> Y (Yükseklik):</span>
                        <input type="range" id="threeDSunPosY" class="three-d-range" min="-600" max="1000" value="${state.sunPosY}">
                        <span id="threeDSunPosYVal" class="three-d-val">${state.sunPosY}px</span>
                    </div>
                    <div class="three-d-row" style="margin-bottom:4px;">
                        <span class="three-d-label" style="width:85px;"><i class="fas fa-cube" style="color:#00d2ff;"></i> Z (Derinlik):</span>
                        <input type="range" id="threeDSunPosZ" class="three-d-range" min="-1200" max="1200" value="${state.sunPosZ}">
                        <span id="threeDSunPosZVal" class="three-d-val">${state.sunPosZ}px</span>
                    </div>

                    <!-- Gölge ve Işık Ayarları -->
                    <div class="three-d-row" style="margin-top:6px; margin-bottom:4px;">
                        <span class="three-d-label" style="width:85px;">Gölge Tonu:</span>
                        <input type="range" id="threeDShadowOpacity" class="three-d-range" min="0" max="100" value="${Math.round(state.shadowOpacity * 100)}">
                        <span id="threeDShadowVal" class="three-d-val">${Math.round(state.shadowOpacity * 100)}%</span>
                    </div>
                    <div class="three-d-row" style="margin-bottom:4px;">
                        <span class="three-d-label" style="width:85px;">Yumuşaklık:</span>
                        <input type="range" id="threeDShadowSoftness" class="three-d-range" min="0.5" max="6" step="0.5" value="${state.shadowSoftness || 1.5}">
                        <span id="threeDShadowSoftVal" class="three-d-val">${state.shadowSoftness || 1.5}x</span>
                    </div>
                    <div class="three-d-row">
                        <span class="three-d-label" style="width:85px;">Işık Gücü:</span>
                        <input type="range" id="threeDLightIntensity" class="three-d-range" min="0.5" max="3.0" step="0.1" value="${state.lightIntensity}">
                        <span id="threeDLightIntensityVal" class="three-d-val">${state.lightIntensity}x</span>
                    </div>
                </div>

                <div class="three-d-tip-text" style="font-size:10.5px; line-height:1.4; padding:0 2px;">
                    💡 <em>İpucu: Tuvaldeki ☀️ Güneş rozetini tutup pencereye doğru sürükleyerek doğal pencere ışığı ve gölgesi elde edebilirsiniz. Shift tuşu veya tekerlek ile oda derinliğini ayarlayabilirsiniz.</em>
                </div>
            </div>

            <!-- FOOTER AKSİYONLAR -->
            <div class="three-d-footer">
                <button id="threeDBakeBtn" class="three-d-primary-btn">
                    <i class="fas fa-magic"></i> 4K Ultra-HD Tuvale Fırınla
                </button>
            </div>
        `;

        document.body.appendChild(panel);
        bindPanelEvents(panel);
        makeDraggable(panel, document.getElementById('threeDPanelHeader'));
        return panel;
    }

    /**
     * 13. Panel Kontrol Olay Dinleyicileri
     */
    function bindPanelEvents(panel) {
        // Öge Türü
        panel.querySelectorAll('.three-d-elem-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                panel.querySelectorAll('.three-d-elem-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.elementType = btn.getAttribute('data-type');
                recreateContentMeshes();
            });
        });

        // 🌟 Rozet & İkon Girişleri ve Butonları
        const bMainText = panel.querySelector('#threeDBadgeMainText');
        if (bMainText) {
            bMainText.addEventListener('input', (e) => {
                state.text = e.target.value;
                const origText = panel.querySelector('#threeDTextInput');
                if (origText) origText.value = state.text;
                recreateContentMeshes();
            });
        }

        const bSubText = panel.querySelector('#threeDBadgeSubText');
        if (bSubText) {
            bSubText.addEventListener('input', (e) => {
                state.badgeSubtext = e.target.value;
                recreateContentMeshes();
            });
        }

        const bBgColor = panel.querySelector('#threeDBadgeBgColor');
        if (bBgColor) {
            bBgColor.addEventListener('input', (e) => {
                state.badgeBgColor = e.target.value;
                recreateContentMeshes();
            });
        }

        const bTextColor = panel.querySelector('#threeDBadgeTextColor');
        if (bTextColor) {
            bTextColor.addEventListener('input', (e) => {
                state.frontColor = e.target.value;
                const origFront = panel.querySelector('#threeDFrontColor');
                if (origFront) origFront.value = state.frontColor;
                recreateContentMeshes();
            });
        }

        const bSideColor = panel.querySelector('#threeDBadgeSideColor');
        if (bSideColor) {
            bSideColor.addEventListener('input', (e) => {
                state.sideColor = e.target.value;
                const origSide = panel.querySelector('#threeDSideColor');
                if (origSide) origSide.value = state.sideColor;
                recreateContentMeshes();
            });
        }

        // Hızlı Rozet Temaları
        panel.querySelectorAll('.three-d-badge-theme-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const bg = chip.getAttribute('data-bg');
                const front = chip.getAttribute('data-front');
                const side = chip.getAttribute('data-side');
                if (bg) state.badgeBgColor = bg;
                if (front) state.frontColor = front;
                if (side) state.sideColor = side;
                recreateContentMeshes();
                syncControlsUI();
                if (window.showToast) window.showToast('🎨 Rozet Teması Uygulandı', 'info');
            });
        });

        // İkon Seç & Kaldır Butonları
        const openIconBtn = panel.querySelector('#threeDOpenIconPickerBtn');
        if (openIconBtn) {
            openIconBtn.addEventListener('click', () => {
                openIconPicker();
            });
        }

        const removeIconBtn = panel.querySelector('#threeDRemoveIconBtn');
        if (removeIconBtn) {
            removeIconBtn.addEventListener('click', () => {
                state.selectedIconId = 'none';
                recreateContentMeshes();
                syncControlsUI();
                if (window.showToast) window.showToast('İkon kaldırıldı (salt rozet modu)', 'info');
            });
        }

        // 🎯 3D Seçim Aç/Kapa Butonu
        const selToggleBtn = panel.querySelector('#threeDSelectionToggleBtn');
        if (selToggleBtn) {
            selToggleBtn.addEventListener('click', () => {
                toggleSelection();
            });
        }

        // 3D Eksen Gizmo Butonu
        const gizmoToggleBtn = panel.querySelector('#threeDGizmoToggleBtn');
        if (gizmoToggleBtn) {
            gizmoToggleBtn.addEventListener('click', () => {
                toggleGizmoMode();
            });
        }

        // Tutamaç & Gizmo Ayarları Aç/Kapat
        const gizmoSettingsToggleBtn = panel.querySelector('#threeDGizmoSettingsToggleBtn');
        const gizmoSettingsBox = panel.querySelector('#threeDGizmoSettingsBox');
        const gizmoSettingsCloseBtn = panel.querySelector('#threeDGizmoSettingsCloseBtn');

        function toggleGizmoSettings(open) {
            state.gizmoSettingsOpen = (open !== undefined) ? !!open : !state.gizmoSettingsOpen;
            if (gizmoSettingsBox) {
                gizmoSettingsBox.style.display = state.gizmoSettingsOpen ? 'block' : 'none';
            }
            if (gizmoSettingsToggleBtn) {
                gizmoSettingsToggleBtn.classList.toggle('active', !!state.gizmoSettingsOpen);
            }
            notifyExternalUpdates();
        }

        if (gizmoSettingsToggleBtn) {
            gizmoSettingsToggleBtn.addEventListener('click', () => toggleGizmoSettings());
        }
        if (gizmoSettingsCloseBtn) {
            gizmoSettingsCloseBtn.addEventListener('click', () => toggleGizmoSettings(false));
        }

        // Akıllı Orantılama Checkbox
        const autoFitCheck = panel.querySelector('#threeDGizmoAutoFitCheck');
        if (autoFitCheck) {
            autoFitCheck.addEventListener('change', (e) => {
                state.gizmoAutoFit = e.target.checked;
                updateGizmoPositions();
                notifyExternalUpdates();
            });
        }

        // Tutamaç Boyutu Slider & Presets
        const gizmoScaleInput = panel.querySelector('#threeDGizmoScaleInput');
        if (gizmoScaleInput) {
            gizmoScaleInput.addEventListener('input', (e) => {
                const val = parseInt(e.target.value) || 100;
                state.gizmoScale = val / 100;
                panel.querySelector('#threeDGizmoScaleVal').textContent = val + '%';
                updateGizmoPositions();
                notifyExternalUpdates();
                syncControlsUI();
            });
        }

        panel.querySelectorAll('.three-d-scale-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const scaleVal = parseInt(chip.dataset.scale) || 100;
                state.gizmoScale = scaleVal / 100;
                if (gizmoScaleInput) gizmoScaleInput.value = scaleVal;
                panel.querySelector('#threeDGizmoScaleVal').textContent = scaleVal + '%';
                updateGizmoPositions();
                notifyExternalUpdates();
                syncControlsUI();
            });
        });

        // Eksen Mesafesi Slider & Presets
        const distanceInput = panel.querySelector('#threeDGizmoDistanceInput');
        if (distanceInput) {
            distanceInput.addEventListener('input', (e) => {
                state.gizmoDistance = parseInt(e.target.value) || 75;
                panel.querySelector('#threeDGizmoDistanceVal').textContent = state.gizmoDistance + 'px';
                updateGizmoPositions();
                notifyExternalUpdates();
                syncControlsUI();
            });
        }

        panel.querySelectorAll('.three-d-dist-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const distVal = parseInt(chip.dataset.dist) || 75;
                state.gizmoDistance = distVal;
                if (distanceInput) distanceInput.value = distVal;
                panel.querySelector('#threeDGizmoDistanceVal').textContent = distVal + 'px';
                updateGizmoPositions();
                notifyExternalUpdates();
                syncControlsUI();
            });
        });

        // Opaklık Slider
        const opacityInput = panel.querySelector('#threeDGizmoOpacityInput');
        if (opacityInput) {
            opacityInput.addEventListener('input', (e) => {
                const val = parseInt(e.target.value) || 100;
                state.gizmoOpacity = val / 100;
                panel.querySelector('#threeDGizmoOpacityVal').textContent = val + '%';
                updateGizmoPositions();
                notifyExternalUpdates();
            });
        }

        // Eksen Rozetleri Checkbox
        const showLabelsCheck = panel.querySelector('#threeDGizmoShowLabelsCheck');
        if (showLabelsCheck) {
            showLabelsCheck.addEventListener('change', (e) => {
                state.gizmoShowLabels = e.target.checked;
                updateGizmoPositions();
                notifyExternalUpdates();
            });
        }

        // Canlı HUD Checkbox
        const showHudCheck = panel.querySelector('#threeDGizmoShowHudCheck');
        if (showHudCheck) {
            showHudCheck.addEventListener('change', (e) => {
                state.gizmoShowHud = e.target.checked;
                notifyExternalUpdates();
            });
        }

        // Corner Pin Butonu
        const pinToggleBtn = panel.querySelector('#threeDCornerPinToggleBtn');
        pinToggleBtn.addEventListener('click', () => {
            toggleCornerPinMode();
        });

        // Metin ve Kalınlık
        const textInput = panel.querySelector('#threeDTextInput');
        textInput.addEventListener('input', (e) => {
            state.text = e.target.value;
            recreateContentMeshes();
        });

        const sizeInput = panel.querySelector('#threeDSizeInput');
        sizeInput.addEventListener('input', (e) => {
            state.textSize = parseInt(e.target.value) || 36;
            panel.querySelector('#threeDSizeVal').textContent = state.textSize + 'px';
            recreateContentMeshes();
        });

        const depthInput = panel.querySelector('#threeDDepthInput');
        depthInput.addEventListener('input', (e) => {
            state.depth = parseInt(e.target.value) || 16;
            panel.querySelector('#threeDDepthVal').textContent = state.depth + 'px';
            recreateContentMeshes();
        });

        const bevelCheck = panel.querySelector('#threeDBevelCheck');
        bevelCheck.addEventListener('change', (e) => {
            state.bevelEnabled = e.target.checked;
            recreateContentMeshes();
        });

        // Düzlem Açısı
        const pitchInput = panel.querySelector('#threeDPitchInput');
        pitchInput.addEventListener('input', (e) => {
            state.planePitch = parseFloat(e.target.value) || 0;
            panel.querySelector('#threeDPitchVal').textContent = state.planePitch + '°';
            updatePlaneTransform();
            if (state.cornerPinActive) updateCornerPinHandlesFromScene();
            notifyExternalUpdates();
            requestRender();
        });

        const yawInput = panel.querySelector('#threeDYawInput');
        yawInput.addEventListener('input', (e) => {
            state.planeYaw = parseFloat(e.target.value) || 0;
            panel.querySelector('#threeDYawVal').textContent = state.planeYaw + '°';
            updatePlaneTransform();
            if (state.cornerPinActive) updateCornerPinHandlesFromScene();
            notifyExternalUpdates();
            requestRender();
        });

        const rollInput = panel.querySelector('#threeDRollInput');
        rollInput.addEventListener('input', (e) => {
            state.planeRoll = parseFloat(e.target.value) || 0;
            panel.querySelector('#threeDRollVal').textContent = state.planeRoll + '°';
            updatePlaneTransform();
            if (state.cornerPinActive) updateCornerPinHandlesFromScene();
            notifyExternalUpdates();
            requestRender();
        });

        const scaleInput = panel.querySelector('#threeDScaleInput');
        scaleInput.addEventListener('input', (e) => {
            state.planeScale = (parseFloat(e.target.value) || 100) / 100;
            panel.querySelector('#threeDScaleVal').textContent = Math.round(state.planeScale * 100) + '%';
            updatePlaneTransform();
            if (state.cornerPinActive) updateCornerPinHandlesFromScene();
            notifyExternalUpdates();
            requestRender();
        });

        const gridCheck = panel.querySelector('#threeDGridCheck');
        gridCheck.addEventListener('change', (e) => {
            state.showPlaneGrid = e.target.checked;
            if (gridHelper) gridHelper.visible = !!state.selected && state.showPlaneGrid;
            requestRender();
        });

        // İnce Ayarlar: Düzlem İçi Dönüş & Yükseklik
        const localRotInput = panel.querySelector('#threeDLocalRotInput');
        localRotInput.addEventListener('input', (e) => {
            state.planeLocalRot = parseFloat(e.target.value) || 0;
            panel.querySelector('#threeDLocalRotVal').textContent = state.planeLocalRot + '°';
            updateContentTransform();
            notifyExternalUpdates();
            requestRender();
        });

        const elevInput = panel.querySelector('#threeDElevationInput');
        elevInput.addEventListener('input', (e) => {
            state.planeElevation = parseFloat(e.target.value) || 0;
            panel.querySelector('#threeDElevationVal').textContent = state.planeElevation + 'px';
            updateContentTransform();
            notifyExternalUpdates();
            requestRender();
        });

        // Presets
        panel.querySelectorAll('.three-d-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const p = btn.getAttribute('data-preset');
                applyPreset(p);
            });
        });

        // Duruş Modu
        const flatBtn = panel.querySelector('#threeDOrientFlatBtn');
        const standBtn = panel.querySelector('#threeDOrientStandBtn');
        flatBtn.addEventListener('click', () => {
            state.orientation = 'flat';
            syncControlsUI();
            updateContentTransform();
            notifyExternalUpdates();
            requestRender();
        });
        standBtn.addEventListener('click', () => {
            state.orientation = 'standing';
            syncControlsUI();
            updateContentTransform();
            notifyExternalUpdates();
            requestRender();
        });

        // Renkler
        const frontColor = panel.querySelector('#threeDFrontColor');
        frontColor.addEventListener('input', (e) => {
            state.frontColor = e.target.value;
            recreateContentMeshes();
        });

        const sideColor = panel.querySelector('#threeDSideColor');
        sideColor.addEventListener('input', (e) => {
            state.sideColor = e.target.value;
            recreateContentMeshes();
        });

        panel.querySelectorAll('.three-d-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                state.frontColor = chip.getAttribute('data-front');
                state.sideColor = chip.getAttribute('data-side');
                frontColor.value = state.frontColor;
                sideColor.value = state.sideColor;
                recreateContentMeshes();
            });
        });

        // ☀️ 3D Güneş & Oda Işığı Dinleyicileri
        const presetRight = panel.querySelector('#threeDSunPresetRight');
        if (presetRight) {
            presetRight.addEventListener('click', () => {
                state.sunPosX = 550;
                state.sunPosY = 250;
                state.sunPosZ = -50;
                updateLighting();
                syncControlsUI();
                updateGizmoPositions();
                notifyExternalUpdates();
                requestRender();
            });
        }

        const presetLeft = panel.querySelector('#threeDSunPresetLeft');
        if (presetLeft) {
            presetLeft.addEventListener('click', () => {
                state.sunPosX = -550;
                state.sunPosY = 250;
                state.sunPosZ = -50;
                updateLighting();
                syncControlsUI();
                updateGizmoPositions();
                notifyExternalUpdates();
                requestRender();
            });
        }

        const presetTop = panel.querySelector('#threeDSunPresetTop');
        if (presetTop) {
            presetTop.addEventListener('click', () => {
                state.sunPosX = 0;
                state.sunPosY = 650;
                state.sunPosZ = 100;
                updateLighting();
                syncControlsUI();
                updateGizmoPositions();
                notifyExternalUpdates();
                requestRender();
            });
        }

        const presetFront = panel.querySelector('#threeDSunPresetFront');
        if (presetFront) {
            presetFront.addEventListener('click', () => {
                state.sunPosX = 0;
                state.sunPosY = 200;
                state.sunPosZ = 600;
                updateLighting();
                syncControlsUI();
                updateGizmoPositions();
                notifyExternalUpdates();
                requestRender();
            });
        }

        const sunPosXInput = panel.querySelector('#threeDSunPosX');
        if (sunPosXInput) {
            sunPosXInput.addEventListener('input', (e) => {
                state.sunPosX = parseInt(e.target.value) || 0;
                panel.querySelector('#threeDSunPosXVal').textContent = state.sunPosX + 'px';
                updateLighting();
                updateGizmoPositions();
                notifyExternalUpdates();
                requestRender();
            });
        }

        const sunPosYInput = panel.querySelector('#threeDSunPosY');
        if (sunPosYInput) {
            sunPosYInput.addEventListener('input', (e) => {
                state.sunPosY = parseInt(e.target.value) || 0;
                panel.querySelector('#threeDSunPosYVal').textContent = state.sunPosY + 'px';
                updateLighting();
                updateGizmoPositions();
                notifyExternalUpdates();
                requestRender();
            });
        }

        const sunPosZInput = panel.querySelector('#threeDSunPosZ');
        if (sunPosZInput) {
            sunPosZInput.addEventListener('input', (e) => {
                state.sunPosZ = parseInt(e.target.value) || 0;
                panel.querySelector('#threeDSunPosZVal').textContent = state.sunPosZ + 'px';
                updateLighting();
                updateGizmoPositions();
                notifyExternalUpdates();
                requestRender();
            });
        }

        const lightIntensityInput = panel.querySelector('#threeDLightIntensity');
        if (lightIntensityInput) {
            lightIntensityInput.addEventListener('input', (e) => {
                state.lightIntensity = parseFloat(e.target.value) || 1.3;
                panel.querySelector('#threeDLightIntensityVal').textContent = state.lightIntensity + 'x';
                updateLighting();
                notifyExternalUpdates();
                requestRender();
            });
        }

        const shadowOp = panel.querySelector('#threeDShadowOpacity');
        if (shadowOp) {
            shadowOp.addEventListener('input', (e) => {
                state.shadowOpacity = (parseFloat(e.target.value) || 45) / 100;
                panel.querySelector('#threeDShadowVal').textContent = Math.round(state.shadowOpacity * 100) + '%';
                updatePlaneTransform();
                notifyExternalUpdates();
                requestRender();
            });
        }

        const shadowSoft = panel.querySelector('#threeDShadowSoftness');
        if (shadowSoft) {
            shadowSoft.addEventListener('input', (e) => {
                state.shadowSoftness = parseFloat(e.target.value) || 1.5;
                panel.querySelector('#threeDShadowSoftVal').textContent = state.shadowSoftness + 'x';
                updateLighting();
                notifyExternalUpdates();
                requestRender();
            });
        }

        // Header Actions
        panel.querySelector('#threeDResetBtn').addEventListener('click', resetToDefaults);
        panel.querySelector('#threeDVisHeaderBtn').addEventListener('click', () => toggleVisibility());
        panel.querySelector('#threeDCloseBtn').addEventListener('click', closeStudio);
        panel.querySelector('#threeDBakeBtn').addEventListener('click', bakeToCanvas);
    }

    /**
     * 14. Masaüstü Taşıma (Draggable Header)
     */
    function makeDraggable(el, handle) {
        let isDown = false;
        let startX, startY, initialLeft, initialTop;

        handle.addEventListener('pointerdown', (e) => {
            if (e.target.closest('button')) return;
            isDown = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = el.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            handle.setPointerCapture(e.pointerId);
            e.preventDefault();
        });

        handle.addEventListener('pointermove', (e) => {
            if (!isDown) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            el.style.left = Math.max(10, Math.min(window.innerWidth - el.offsetWidth - 10, initialLeft + dx)) + 'px';
            el.style.top = Math.max(10, Math.min(window.innerHeight - el.offsetHeight - 10, initialTop + dy)) + 'px';
            el.style.right = 'auto';
            el.style.bottom = 'auto';
        });

        const onUp = (e) => {
            if (!isDown) return;
            isDown = false;
            try { handle.releasePointerCapture(e.pointerId); } catch(ex){}
        };

        handle.addEventListener('pointerup', onUp);
        handle.addEventListener('pointercancel', onUp);
    }

    /**
     * 15. Modalı Aç / Kapat
     */
    async function openStudio() {
        const panel = ensureStudioPanel();
        panel.style.display = 'flex';
        state.active = true;

        if (!state.loaded) {
            const statusEl = panel.querySelector('#threeDLoadingStatus');
            if (statusEl) statusEl.style.display = 'block';

            try {
                await loadThreeLibraries((msg) => {
                    if (statusEl) statusEl.textContent = msg;
                });
                if (statusEl) statusEl.style.display = 'none';
            } catch (err) {
                if (statusEl) statusEl.textContent = 'Hata: ' + err.message;
                console.error(err);
                return;
            }
        }

        initScene();
        setSelected(true, { silent: true, autoLockPhoto: false });
        syncControlsUI();
        initCanvasBadge();
        if (canvasEl) canvasEl.style.display = 'block';
        if (state.gizmoActive && !state.cornerPinActive) {
            initGizmoOverlay();
            if (gizmoOverlayEl) gizmoOverlayEl.style.display = 'block';
            updateGizmoPositions();
        }
        notifyExternalUpdates();
    }

    function closeStudio() {
        const panel = document.getElementById('threeDStudioPanel');
        if (panel) panel.style.display = 'none';
        state.active = false;
        if (gridHelper) gridHelper.visible = false;
        if (sunGroup) sunGroup.visible = false;
        if (sunRayLine) sunRayLine.visible = false;
        if (cornerPinOverlayEl) cornerPinOverlayEl.style.display = 'none';
        if (gizmoOverlayEl) gizmoOverlayEl.style.display = 'none';
        if (canvasBadgeEl) canvasBadgeEl.style.display = 'none';
        state.cornerPinActive = false;
        notifyExternalUpdates();
        requestRender();
    }

    function toggleVisibility(forceVisible) {
        if (!canvasEl) return;
        const isVisible = (forceVisible !== undefined) ? forceVisible : (canvasEl.style.display !== 'none');
        canvasEl.style.display = isVisible ? 'none' : 'block';
        if (cornerPinOverlayEl) cornerPinOverlayEl.style.display = (isVisible && state.cornerPinActive && state.selected) ? 'block' : 'none';
        if (gizmoOverlayEl) gizmoOverlayEl.style.display = (isVisible && state.gizmoActive && !state.cornerPinActive && state.selected) ? 'block' : 'none';
        if (canvasBadgeEl) canvasBadgeEl.style.display = (isVisible && state.active) ? 'flex' : 'none';
        const btn = document.getElementById('threeDVisHeaderBtn');
        if (btn) {
            btn.innerHTML = isVisible ? '<i class="fas fa-eye-slash" style="color:#ef4444;"></i>' : '<i class="fas fa-eye"></i>';
        }
        notifyExternalUpdates();
    }

    function resetToDefaults() {
        state.elementType = 'text';
        state.text = 'SATILIK 1.250 m²';
        state.textSize = 36;
        state.depth = 16;
        state.bevelEnabled = true;
        state.planePitch = -65;
        state.planeYaw = 15;
        state.planeRoll = 0;
        state.planeScale = 1.0;
        state.planeElevation = 0;
        state.planeLocalRot = 0;
        state.posX = 0;
        state.posY = 0;
        state.posZ = 0;
        state.frontColor = '#f59e0b';
        state.sideColor = '#92400e';
        state.orientation = 'flat';
        state.showPlaneGrid = true;
        state.sunPosX = 550;
        state.sunPosY = 250;
        state.sunPosZ = -50;
        state.lightIntensity = 1.2;
        state.shadowOpacity = 0.45;
        state.shadowSoftness = 1.5;
        state.cornerPinActive = false;
        state.gizmoActive = true;
        state.gizmoScale = 1.0;
        state.gizmoAutoFit = true;
        state.gizmoDistance = 75;
        state.gizmoShowLabels = false;
        state.gizmoShowHud = true;
        state.gizmoOpacity = 1.0;
        state.gizmoSettingsOpen = false;
        state.selected = true;

        cornerPins[0] = { x: 0, y: 0 };
        if (cornerPinOverlayEl) cornerPinOverlayEl.style.display = 'none';
        if (gizmoOverlayEl) {
            gizmoOverlayEl.style.display = 'block';
            updateGizmoPositions();
        }

        setSelected(true, { silent: true, autoLockPhoto: false });
        updatePlaneTransform();
        updateLighting();
        recreateContentMeshes();
        syncControlsUI();
        notifyExternalUpdates();
    }

    /**
     * 16. Dış Sistemleri Tetikleme (Katmanlar Paneli & AutoSave)
     */
    function notifyExternalUpdates() {
        if (typeof window.renderLayers === 'function') {
            window.renderLayers();
        }
        if (typeof window.triggerAutoSave === 'function') {
            window.triggerAutoSave();
        }
    }

    /**
     * 17. 💾 Proje Kaydetme & Geri Yükleme API'si (Faz 3)
     */
    function getDataToSave() {
        if (!state.active && !canvasEl) return null;
        return {
            active: !!state.active,
            elementType: state.elementType,
            text: state.text,
            textSize: state.textSize,
            depth: state.depth,
            bevelEnabled: state.bevelEnabled,
            bevelThickness: state.bevelThickness,
            bevelSize: state.bevelSize,
            frontColor: state.frontColor,
            sideColor: state.sideColor,
            roughness: state.roughness,
            metalness: state.metalness,
            orientation: state.orientation,
            planePitch: state.planePitch,
            planeYaw: state.planeYaw,
            planeRoll: state.planeRoll,
            planeElevation: state.planeElevation,
            planeLocalRot: state.planeLocalRot,
            planeScale: state.planeScale,
            showPlaneGrid: state.showPlaneGrid,
            lightAngle: state.lightAngle,
            lightIntensity: state.lightIntensity,
            shadowOpacity: state.shadowOpacity,
            shadowSoftness: state.shadowSoftness,
            sunPosX: state.sunPosX !== undefined ? state.sunPosX : 550,
            sunPosY: state.sunPosY !== undefined ? state.sunPosY : 250,
            sunPosZ: state.sunPosZ !== undefined ? state.sunPosZ : -50,
            posX: state.posX,
            posY: state.posY,
            posZ: state.posZ || 0,
            cornerPinActive: state.cornerPinActive,
            gizmoActive: state.gizmoActive,
            gizmoScale: state.gizmoScale,
            gizmoAutoFit: !!state.gizmoAutoFit,
            gizmoDistance: state.gizmoDistance,
            gizmoShowLabels: state.gizmoShowLabels !== false,
            gizmoShowHud: state.gizmoShowHud !== false,
            gizmoOpacity: state.gizmoOpacity,
            gizmoSettingsOpen: !!state.gizmoSettingsOpen,
            selected: state.selected !== false,
            cornerPins: cornerPins.map(p => ({ x: p.x, y: p.y })),
            visible: canvasEl ? (canvasEl.style.display !== 'none') : true,
            hasBaked: !!state.hasBaked,
            badgeBgColor: state.badgeBgColor,
            badgeSubtext: state.badgeSubtext,
            selectedIconId: state.selectedIconId
        };
    }

    async function restoreData(data) {
        if (!data) return;
        Object.assign(state, data);
        if (data.badgeBgColor) state.badgeBgColor = data.badgeBgColor;
        if (data.badgeSubtext !== undefined) state.badgeSubtext = data.badgeSubtext;
        if (data.selectedIconId) state.selectedIconId = data.selectedIconId;

        if (data.selected !== undefined) {
            state.selected = !!data.selected;
        }
        if (data.gizmoActive !== undefined) {
            state.gizmoActive = !!data.gizmoActive;
        }
        if (data.gizmoScale !== undefined) state.gizmoScale = data.gizmoScale;
        if (data.gizmoAutoFit !== undefined) state.gizmoAutoFit = !!data.gizmoAutoFit;
        if (data.gizmoDistance !== undefined) state.gizmoDistance = data.gizmoDistance;
        if (data.gizmoShowLabels !== undefined) state.gizmoShowLabels = data.gizmoShowLabels !== false;
        if (data.gizmoShowHud !== undefined) state.gizmoShowHud = data.gizmoShowHud !== false;
        if (data.gizmoOpacity !== undefined) state.gizmoOpacity = data.gizmoOpacity;
        if (data.gizmoSettingsOpen !== undefined) state.gizmoSettingsOpen = !!data.gizmoSettingsOpen;

        if (data.cornerPins && Array.isArray(data.cornerPins)) {
            data.cornerPins.forEach((p, i) => {
                if (cornerPins[i]) {
                    cornerPins[i].x = p.x;
                    cornerPins[i].y = p.y;
                }
            });
        }

        if (data.active || data.visible) {
            await openStudio();
            if (data.visible === false) {
                toggleVisibility(false);
            }
        } else if (scene) {
            updateLighting();
            updatePlaneTransform();
            recreateContentMeshes();
            syncControlsUI();
            requestRender();
        }
    }

    /**
     * 14. 3D İkon Seçici Modal & Popover Motoru
     */
    let iconPickerModalEl = null;
    let activeIconCategory = 'all';

    function ensureIconPickerModal() {
        if (iconPickerModalEl && document.body.contains(iconPickerModalEl)) return iconPickerModalEl;

        iconPickerModalEl = document.createElement('div');
        iconPickerModalEl.id = 'threeDIconPickerModal';
        iconPickerModalEl.className = 'three-d-modal-backdrop';
        iconPickerModalEl.style.display = 'none';

        iconPickerModalEl.innerHTML = `
            <div class="three-d-modal-content">
                <div class="three-d-modal-header">
                    <div class="three-d-modal-title">
                        <i class="fas fa-icons" style="color:#38bdf8;"></i> 3D İkon Kütüphanesi
                        <span class="three-d-modal-badge">200+ İkon</span>
                    </div>
                    <button type="button" class="three-d-modal-close" id="threeDIconPickerCloseBtn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="three-d-icon-search-wrap">
                    <i class="fas fa-search three-d-icon-search-icon"></i>
                    <input type="text" id="threeDIconSearchInput" class="three-d-icon-search-input" placeholder="🔍 İkon ara... (örn: villa, havuz, araba, tapu, bahçe, anahtar)" autocomplete="off">
                </div>

                <div class="three-d-category-chips-scroll custom-scrollbar" id="threeDIconCategoryChips"></div>

                <div class="three-d-icon-cards-grid custom-scrollbar" id="threeDIconCardsGrid"></div>
            </div>
        `;

        document.body.appendChild(iconPickerModalEl);

        // Kapatma butonu & Arka plan tıklaması
        const closeBtn = iconPickerModalEl.querySelector('#threeDIconPickerCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeIconPicker());
        }
        iconPickerModalEl.addEventListener('click', (e) => {
            if (e.target === iconPickerModalEl) closeIconPicker();
        });

        // Arama kutusu dinleyicisi
        const searchInput = iconPickerModalEl.querySelector('#threeDIconSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                filterIconGrid(e.target.value);
            });
        }

        renderIconCategories();
        renderIconGrid();
        return iconPickerModalEl;
    }

    function renderIconCategories() {
        if (!iconPickerModalEl) return;
        const container = iconPickerModalEl.querySelector('#threeDIconCategoryChips');
        if (!container || !window.ICON_LIBRARY) return;

        let html = `<button type="button" class="three-d-cat-chip ${activeIconCategory === 'all' ? 'active' : ''}" data-cat="all">✨ Tümü (200)</button>`;

        Object.keys(window.ICON_LIBRARY).forEach(key => {
            const cat = window.ICON_LIBRARY[key];
            const title = cat.title || key;
            const count = (cat.items && cat.items.length) || 0;
            html += `<button type="button" class="three-d-cat-chip ${activeIconCategory === key ? 'active' : ''}" data-cat="${key}">${title} (${count})</button>`;
        });

        container.innerHTML = html;

        container.querySelectorAll('.three-d-cat-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.three-d-cat-chip').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeIconCategory = btn.getAttribute('data-cat') || 'all';
                renderIconGrid();
            });
        });
    }

    function renderIconGrid() {
        if (!iconPickerModalEl) return;
        const grid = iconPickerModalEl.querySelector('#threeDIconCardsGrid');
        if (!grid || !window.ICON_LIBRARY) return;

        grid.innerHTML = '';
        const searchInput = iconPickerModalEl.querySelector('#threeDIconSearchInput');
        const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

        Object.keys(window.ICON_LIBRARY).forEach(key => {
            if (activeIconCategory !== 'all' && activeIconCategory !== key) return;

            const cat = window.ICON_LIBRARY[key];
            if (!cat || !Array.isArray(cat.items)) return;

            cat.items.forEach(item => {
                const name = (item.name || '').toLowerCase();
                const id = (item.id || '').toLowerCase();
                if (query && !name.includes(query) && !id.includes(query)) return;

                const card = document.createElement('div');
                card.className = 'three-d-icon-card' + (state.selectedIconId === item.id ? ' selected' : '');
                card.setAttribute('data-id', item.id);
                card.title = item.name;

                card.innerHTML = `
                    <div class="three-d-icon-card-svg">${item.svg}</div>
                    <div class="three-d-icon-card-title">${item.name}</div>
                `;

                card.addEventListener('click', () => {
                    state.selectedIconId = item.id;
                    recreateContentMeshes();
                    syncControlsUI();
                    closeIconPicker();
                    if (window.showToast) window.showToast('✅ ' + item.name + ' ikonu seçildi', 'success');
                });

                grid.appendChild(card);
            });
        });
    }

    function filterIconGrid(query) {
        if (!iconPickerModalEl) return;
        const grid = iconPickerModalEl.querySelector('#threeDIconCardsGrid');
        if (!grid) return;
        const q = (query || '').toLowerCase().trim();
        const cards = grid.querySelectorAll('.three-d-icon-card');
        cards.forEach(card => {
            const title = (card.querySelector('.three-d-icon-card-title')?.textContent || '').toLowerCase();
            const id = (card.getAttribute('data-id') || '').toLowerCase();
            const matches = !q || title.includes(q) || id.includes(q);
            card.style.display = matches ? 'flex' : 'none';
        });
    }

    function openIconPicker() {
        ensureIconPickerModal();
        if (!iconPickerModalEl) return;
        renderIconGrid();
        iconPickerModalEl.style.display = 'flex';
        const searchInput = iconPickerModalEl.querySelector('#threeDIconSearchInput');
        if (searchInput) {
            searchInput.value = '';
            setTimeout(() => searchInput.focus(), 100);
        }
    }

    function closeIconPicker() {
        if (iconPickerModalEl) {
            iconPickerModalEl.style.display = 'none';
        }
    }

    /**
     * 15. 2D Rozeti 3D'ye Dönüştürme Köprüsü (2D-to-3D Bridge)
     */
    function convert2DBadgeTo3D(badgeEl) {
        const el = badgeEl || (typeof window.selectedCalloutEl !== 'undefined' ? window.selectedCalloutEl : (typeof selectedCalloutEl !== 'undefined' ? selectedCalloutEl : (typeof window.selectedEl !== 'undefined' ? window.selectedEl : null)));
        if (!el) {
            if (typeof window.showToast === 'function') {
                window.showToast('⚠️ Lütfen önce tuvalde dönüştürmek istediğiniz rozet veya ikonu seçin.', 'warning');
            }
            return false;
        }

        const root = el.closest('.callout-wrap, .callout-wrapper, .draggable, .added-icon, .canvas-el') || el;
        const classList = ((el.className || '') + ' ' + (root.className || '')).toLowerCase();
        const isStandaloneIcon = classList.includes('added-icon') || classList.includes('is-svg-icon') || classList.includes('svg-icon') || (!classList.includes('callout-wrap') && !classList.includes('callout-item') && !classList.includes('co-neon-block') && (el.querySelector('svg') || root.querySelector('svg')));

        if (isStandaloneIcon) {
            // 💎 BAĞIMSIZ İKONU 3D'YE DÖNÜŞTÜR
            const svgNode = el.querySelector('svg') || root.querySelector('svg');
            const rawSvg = svgNode ? svgNode.outerHTML : (el.innerHTML || root.innerHTML);
            state.elementType = 'icon_3d';
            state.customIconSvg = rawSvg;
            state.selectedIconId = 'custom';
            state.text = '';
            state.badgeSubtext = '';
            state.badgeBgColor = el.dataset.storedBgHex || root.dataset.storedBgHex || '#0f172a';
            state.frontColor = el.style.color || root.style.color || el.dataset.storedBorderColor || '#38bdf8';
            state.sideColor = autoGenerateSideColor(state.badgeBgColor);
            state.depth = 16;
            state.bevelEnabled = true;

            // Pozisyon aktarımı
            const posEl = (root.style.left && root.style.top) ? root : el;
            if (posEl.style.left && posEl.style.top) {
                const left = parseFloat(posEl.style.left) || 0;
                const top = parseFloat(posEl.style.top) || 0;
                const cvs = document.getElementById('mainCanvas') || canvasEl;
                if (cvs) {
                    const cw = cvs.width || cvs.clientWidth || 1000;
                    const ch = cvs.height || cvs.clientHeight || 750;
                    state.posX = Math.round(left - cw / 2 + (posEl.offsetWidth || 50) / 2);
                    state.posY = Math.round(ch / 2 - top - (posEl.offsetHeight || 50) / 2);
                }
            }

            el.style.display = 'none';
            el.dataset.convertedTo3D = 'true';
            if (root !== el) {
                root.style.display = 'none';
                root.dataset.convertedTo3D = 'true';
            }

            openStudio();
            recreateContentMeshes();
            syncControlsUI();
            setSelected(true);

            if (typeof window.showToast === 'function') {
                window.showToast('✨ İkon başarıyla 3D\'ye dönüştürüldü! Kalınlık ve 6 yön hazır.', 'success');
            }
            return true;
        }

        // Metin ve alt metin çıkarımı
        let label = el.dataset.coLabel || root.dataset.coLabel || '';
        if (!label) {
            const textNodes = (el.querySelectorAll ? el : root).querySelectorAll('text, span, .co-text, p, h1, h2, h3, h4');
            const texts = [];
            textNodes.forEach(t => {
                const s = t.textContent.trim();
                if (s) texts.push(s);
            });
            label = texts.join('\n');
        }
        if (!label) label = root.textContent.trim();
        if (!label) label = 'SATILIK 1.250 m²';

        const parts = label.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        const mainText = parts[0] || 'SATILIK';
        const subText = parts.slice(1).join(' ');

        // Renk çıkarımı (SVG veya veri özelliklerinden)
        let bgColor = el.dataset.coBgColor || root.dataset.coBgColor || '';
        if (!bgColor) {
            const stop = (el.querySelector ? el : root).querySelector('stop');
            if (stop && stop.getAttribute('stop-color')) {
                bgColor = stop.getAttribute('stop-color');
            } else {
                const rect = (el.querySelector ? el : root).querySelector('rect[fill]:not([fill="none"]):not([fill^="url"])');
                if (rect) bgColor = rect.getAttribute('fill');
            }
        }
        if (!bgColor || bgColor === 'none') bgColor = '#e63946';

        let textColor = el.dataset.coTextColor || root.dataset.coTextColor || '';
        if (!textColor) {
            const txtEl = (el.querySelector ? el : root).querySelector('text[fill]');
            if (txtEl) textColor = txtEl.getAttribute('fill');
        }
        if (!textColor || textColor === 'none') textColor = '#ffffff';

        const iconColor = el.dataset.coIconColor || root.dataset.coIconColor || '#38bdf8';

        // Şekil tespiti
        let detectedType = 'badge_pill';
        const rectNode = (el.querySelector ? el : root).querySelector('rect');
        const rxVal = rectNode ? parseFloat(rectNode.getAttribute('rx') || '0') : 999;

        if (classList.includes('shield') || classList.includes('kalkan')) {
            detectedType = 'badge_shield';
        } else if (classList.includes('card') || classList.includes('plaket') || classList.includes('rect') || (rectNode && rxVal <= 12)) {
            detectedType = 'badge_card';
        } else if (classList.includes('coin') || classList.includes('circle') || classList.includes('madalyon')) {
            detectedType = 'badge_coin';
        }

        // İkon tespiti
        let iconId = el.dataset.iconId || root.dataset.iconId || 'none';

        // 3D motor parametrelerini ata
        state.elementType = detectedType;
        state.text = mainText;
        state.badgeSubtext = subText;
        state.badgeBgColor = bgColor;
        state.frontColor = textColor;
        state.sideColor = autoGenerateSideColor(bgColor);
        state.selectedIconId = iconId;
        state.depth = 18;
        state.bevelEnabled = true;

        // Koordinatları haritala
        const posEl = (root.style.left && root.style.top) ? root : el;
        if (posEl.style.left && posEl.style.top) {
            const left = parseFloat(posEl.style.left) || 0;
            const top = parseFloat(posEl.style.top) || 0;
            const cvs = document.getElementById('mainCanvas') || canvasEl;
            if (cvs) {
                const cw = cvs.width || cvs.clientWidth || 1000;
                const ch = cvs.height || cvs.clientHeight || 750;
                const w = posEl.offsetWidth || 200;
                const h = posEl.offsetHeight || 100;
                state.posX = Math.round(left - cw / 2 + w / 2);
                state.posY = Math.round(ch / 2 - top - h / 2);
            }
        }

        // 2D rozeti gizle
        el.style.display = 'none';
        el.dataset.convertedTo3D = 'true';
        if (root !== el) {
            root.style.display = 'none';
            root.dataset.convertedTo3D = 'true';
        }
        if (typeof window.removeCalloutControls === 'function') {
            window.removeCalloutControls();
        }

        // 3D motoru aç ve yeniden çiz
        openStudio();
        recreateContentMeshes();
        syncControlsUI();
        setSelected(true);

        if (typeof window.showToast === 'function') {
            window.showToast('✨ Rozet başarıyla 3D\'ye dönüştürüldü! 6 eksende hareket ve kalınlık hazır.', 'success');
        }
        return true;
    }

    // 🌟 DIŞA AÇILAN API (Public API)
    window.ThreeDEngine = {
        state: state,
        loadLibraries: loadThreeLibraries,
        openStudio: openStudio,
        closeStudio: closeStudio,
        applyPreset: applyPreset,
        bakeToCanvas: bakeToCanvas,
        toggleVisibility: toggleVisibility,
        resetToDefaults: resetToDefaults,
        setSelected: setSelected,
        toggleSelection: toggleSelection,
        isSelected: () => !!state.selected,
        isActive: () => !!state.active,
        onPhotoLockChanged: onPhotoLockChanged,
        toggleCornerPin: toggleCornerPinMode,
        toggleGizmo: toggleGizmoMode,
        updateGizmo: updateGizmoPositions,
        setGizmoScale: (s) => { state.gizmoScale = parseFloat(s) || 1.0; updateGizmoPositions(); syncControlsUI(); },
        setGizmoAutoFit: (af) => { state.gizmoAutoFit = !!af; updateGizmoPositions(); syncControlsUI(); },
        setGizmoDistance: (d) => { state.gizmoDistance = parseInt(d) || 75; updateGizmoPositions(); syncControlsUI(); },
        setGizmoOpacity: (op) => { state.gizmoOpacity = parseFloat(op) || 1.0; updateGizmoPositions(); syncControlsUI(); },
        getCanvas: () => canvasEl,
        isLayerActive: () => (canvasEl && canvasEl.style.display !== 'none'),
        getDataToSave: getDataToSave,
        restoreData: restoreData,
        convert2DBadgeTo3D: convert2DBadgeTo3D,
        openIconPicker: openIconPicker,
        closeIconPicker: closeIconPicker,
        setBadgeBgColor: (c) => { state.badgeBgColor = c; recreateContentMeshes(); syncControlsUI(); },
        setBadgeSubtext: (s) => { state.badgeSubtext = s; recreateContentMeshes(); syncControlsUI(); },
        setSelectedIcon: (id) => { state.selectedIconId = id; recreateContentMeshes(); syncControlsUI(); },

        // Canlı Parametre Güncelleyiciler
        setElementType: (t) => { state.elementType = t; recreateContentMeshes(); syncControlsUI(); },
        setText: (t) => { state.text = t; recreateContentMeshes(); },
        setSize: (s) => { state.textSize = parseInt(s) || 36; recreateContentMeshes(); },
        setDepth: (d) => { state.depth = parseInt(d) || 16; recreateContentMeshes(); },
        setBevel: (b) => { state.bevelEnabled = !!b; recreateContentMeshes(); },
        setFrontColor: (c) => { state.frontColor = c; recreateContentMeshes(); },
        setSideColor: (c) => { state.sideColor = c; recreateContentMeshes(); },
        setPitch: (p) => { state.planePitch = parseFloat(p) || 0; updatePlaneTransform(); requestRender(); },
        setYaw: (y) => { state.planeYaw = parseFloat(y) || 0; updatePlaneTransform(); requestRender(); },
        setRoll: (r) => { state.planeRoll = parseFloat(r) || 0; updatePlaneTransform(); requestRender(); },
        setScale: (s) => { state.planeScale = (parseFloat(s) || 100) / 100; updatePlaneTransform(); requestRender(); },
        setElevation: (e) => { state.planeElevation = parseFloat(e) || 0; updateContentTransform(); requestRender(); },
        setLocalRot: (r) => { state.planeLocalRot = parseFloat(r) || 0; updateContentTransform(); requestRender(); },
        setOrientation: (o) => { state.orientation = o; updateContentTransform(); requestRender(); },
        setLightAngle: (a) => { state.lightAngle = parseFloat(a) || 45; updateLighting(); requestRender(); },
        setSunPosition: (x, y, z) => {
            if (x !== undefined) state.sunPosX = parseFloat(x) || 0;
            if (y !== undefined) state.sunPosY = parseFloat(y) || 0;
            if (z !== undefined) state.sunPosZ = parseFloat(z) || 0;
            updateLighting();
            updateGizmoPositions();
            syncControlsUI();
            requestRender();
        },
        setLightIntensity: (i) => {
            state.lightIntensity = parseFloat(i) || 1.2;
            updateLighting();
            syncControlsUI();
            requestRender();
        },
        setShadowOpacity: (o) => { state.shadowOpacity = (parseFloat(o) || 45) / 100; updatePlaneTransform(); requestRender(); },
        setShadowSoftness: (s) => { state.shadowSoftness = parseFloat(s) || 1.5; updateLighting(); requestRender(); },
        toggleGrid: (show) => { 
            state.showPlaneGrid = (show !== undefined) ? !!show : !state.showPlaneGrid;
            if (gridHelper) gridHelper.visible = !!state.selected && state.showPlaneGrid;
            requestRender();
        }
    };

})(window);
