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
        visible: true,          // 👁️ 3D Öge görünürlüğü (üstteki gizle butonu aktifse false olur, tuval ve çıktıdan gizlenir)
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
        customIconSvg: null,          // Tuvalden aktarılan özel SVG içeriği
        sourceSvg: null,              // 🌟 Birebir 3D'ye aktarılan orijinal SVG içeriği
        sourceItemName: ''            // Orijinal ögenin adı (örn. Klasik Kırmızı)
    };

    // 🌟 ÇOKLU 3D ÖGE KOLEKSİYONU (Unlimited Multi-Element System)
    const elements = [];
    let activeElementId = null;

    function createDefaultElement(overrides = {}) {
        const id = 'elem_3d_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        const name = overrides.name || overrides.sourceItemName || ('3D Öge ' + (elements.length + 1));
        return {
            id: id,
            name: name,
            visible: overrides.visible !== undefined ? !!overrides.visible : true,
            elementType: overrides.elementType || 'text',
            text: overrides.text !== undefined ? overrides.text : 'SATILIK 1.250 m²',
            textSize: overrides.textSize || 36,
            depth: overrides.depth !== undefined ? overrides.depth : 16,
            bevelEnabled: overrides.bevelEnabled !== undefined ? !!overrides.bevelEnabled : true,
            bevelThickness: overrides.bevelThickness !== undefined ? overrides.bevelThickness : 2,
            bevelSize: overrides.bevelSize !== undefined ? overrides.bevelSize : 1.5,
            frontColor: overrides.frontColor || '#f59e0b',
            sideColor: overrides.sideColor || '#92400e',
            roughness: overrides.roughness !== undefined ? overrides.roughness : 0.35,
            metalness: overrides.metalness !== undefined ? overrides.metalness : 0.40,
            orientation: overrides.orientation || 'flat',
            planePitch: overrides.planePitch !== undefined ? overrides.planePitch : -65,
            planeYaw: overrides.planeYaw !== undefined ? overrides.planeYaw : 15,
            planeRoll: overrides.planeRoll !== undefined ? overrides.planeRoll : 0,
            planeElevation: overrides.planeElevation !== undefined ? overrides.planeElevation : 0,
            planeLocalRot: overrides.planeLocalRot !== undefined ? overrides.planeLocalRot : 0,
            planeScale: overrides.planeScale !== undefined ? overrides.planeScale : 1.0,
            shadowOpacity: overrides.shadowOpacity !== undefined ? overrides.shadowOpacity : 0.45,
            shadowSoftness: overrides.shadowSoftness !== undefined ? overrides.shadowSoftness : 1.5,
            posX: overrides.posX !== undefined ? overrides.posX : 0,
            posY: overrides.posY !== undefined ? overrides.posY : 0,
            posZ: overrides.posZ !== undefined ? overrides.posZ : 0,
            badgeBgColor: overrides.badgeBgColor || '#0f172a',
            badgeSubtext: overrides.badgeSubtext || '',
            selectedIconId: overrides.selectedIconId || 'ev-14',
            customIconSvg: overrides.customIconSvg || null,
            sourceSvg: overrides.sourceSvg || null,
            sourceItemName: overrides.sourceItemName || name,
            // Three.js groups & meshes
            planeGroup: null,
            contentGroup: null,
            shadowPlane: null,
            textMesh: null,
            iconMesh: null,
            badgeMesh: null
        };
    }

    function getActiveElement() {
        if (activeElementId) {
            const found = elements.find(e => e.id === activeElementId);
            if (found) return found;
        }
        if (elements.length > 0) {
            activeElementId = elements[elements.length - 1].id;
            return elements[elements.length - 1];
        }
        return null;
    }

    function syncStateFromActiveElement() {
        const el = getActiveElement();
        if (!el) return;
        state.active = elements.length > 0;
        state.visible = el.visible !== false;
        state.elementType = el.elementType;
        state.text = el.text;
        state.textSize = el.textSize;
        state.depth = el.depth;
        state.bevelEnabled = el.bevelEnabled;
        state.bevelThickness = el.bevelThickness;
        state.bevelSize = el.bevelSize;
        state.frontColor = el.frontColor;
        state.sideColor = el.sideColor;
        state.roughness = el.roughness;
        state.metalness = el.metalness;
        state.orientation = el.orientation;
        state.planePitch = el.planePitch;
        state.planeYaw = el.planeYaw;
        state.planeRoll = el.planeRoll;
        state.planeElevation = el.planeElevation;
        state.planeLocalRot = el.planeLocalRot;
        state.planeScale = el.planeScale;
        state.shadowOpacity = el.shadowOpacity;
        state.shadowSoftness = el.shadowSoftness;
        state.posX = el.posX;
        state.posY = el.posY;
        state.posZ = el.posZ;
        state.badgeBgColor = el.badgeBgColor;
        state.badgeSubtext = el.badgeSubtext;
        state.selectedIconId = el.selectedIconId;
        state.customIconSvg = el.customIconSvg;
        state.sourceSvg = el.sourceSvg;
        state.sourceItemName = el.sourceItemName;

        planeGroup = el.planeGroup;
        contentGroup = el.contentGroup;
        shadowPlane = el.shadowPlane;
        textMesh = el.textMesh;
        iconMesh = el.iconMesh;
        badgeMesh = el.badgeMesh;
    }

    function syncActiveElementFromState() {
        const el = getActiveElement();
        if (!el) return;
        el.visible = state.visible !== false;
        el.elementType = state.elementType;
        el.text = state.text;
        el.textSize = state.textSize;
        el.depth = state.depth;
        el.bevelEnabled = state.bevelEnabled;
        el.bevelThickness = state.bevelThickness;
        el.bevelSize = state.bevelSize;
        el.frontColor = state.frontColor;
        el.sideColor = state.sideColor;
        el.roughness = state.roughness;
        el.metalness = state.metalness;
        el.orientation = state.orientation;
        el.planePitch = state.planePitch;
        el.planeYaw = state.planeYaw;
        el.planeRoll = state.planeRoll;
        el.planeElevation = state.planeElevation;
        el.planeLocalRot = state.planeLocalRot;
        el.planeScale = state.planeScale;
        el.shadowOpacity = state.shadowOpacity;
        el.shadowSoftness = state.shadowSoftness;
        el.posX = state.posX;
        el.posY = state.posY;
        el.posZ = state.posZ;
        el.badgeBgColor = state.badgeBgColor;
        el.badgeSubtext = state.badgeSubtext;
        el.selectedIconId = state.selectedIconId;
        el.customIconSvg = state.customIconSvg;
        el.sourceSvg = state.sourceSvg;
        el.sourceItemName = state.sourceItemName;
    }

    function initElementThreeObjects(el) {
        if (!scene || !window.THREE) return;
        if (!el.planeGroup) {
            el.planeGroup = new THREE.Group();
            scene.add(el.planeGroup);

            // Zemin Gölge Düzlemi
            const shadowPlaneGeo = new THREE.PlaneGeometry(3200, 3200);
            const shadowPlaneMat = new THREE.ShadowMaterial({
                opacity: el.shadowOpacity !== undefined ? el.shadowOpacity : state.shadowOpacity,
                side: THREE.DoubleSide
            });
            el.shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
            el.shadowPlane.receiveShadow = true;
            el.shadowPlane.position.z = -0.5;
            el.planeGroup.add(el.shadowPlane);

            el.contentGroup = new THREE.Group();
            el.planeGroup.add(el.contentGroup);
        }
    }

    function setActiveElement(elementOrId, options = {}) {
        const target = (typeof elementOrId === 'string')
            ? elements.find(e => e.id === elementOrId)
            : elementOrId;
        
        if (!target) {
            activeElementId = null;
            state.selected = false;
            if (gridHelper && gridHelper.parent) {
                gridHelper.parent.remove(gridHelper);
            }
            if (gizmoOverlayEl) gizmoOverlayEl.style.display = 'none';
            if (cornerPinOverlayEl) cornerPinOverlayEl.style.display = 'none';
            return;
        }

        activeElementId = target.id;
        initElementThreeObjects(target);

        // Attach gridHelper to target element's planeGroup
        if (gridHelper) {
            if (gridHelper.parent) gridHelper.parent.remove(gridHelper);
            target.planeGroup.add(gridHelper);
            gridHelper.position.set(target.posX, target.posY, target.posZ || 0);
            gridHelper.visible = !!(state.selected && state.showPlaneGrid && target.visible !== false);
        }

        syncStateFromActiveElement();

        if (options.select !== false) {
            state.selected = true;
        }

        updatePlaneTransform(target);
        updateContentTransform(target);
        syncControlsUI();
        updateElementSelectorUI();

        const visBtn = document.getElementById('threeDVisHeaderBtn');
        if (visBtn) {
            const isVis = target.visible !== false;
            visBtn.innerHTML = isVis ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash" style="color:#ef4444;"></i>';
            visBtn.title = isVis ? '3D Ögeyi Gizle (Tuval ve Çıktıdan Gizlenir)' : '3D Ögeyi Göster (Tuval ve Çıktıya Dahil)';
        }

        requestRender();
    }

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
    let axisPixelsPerUnit = {
        x: 1.0,
        y: 1.0,
        z: 1.0
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

        // Sahne & Kamera (Yalnızca ilk kez oluştur)
        if (!scene) {
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

            // Ortak 3D Izgara (Grid Helper)
            const gridSubdivisions = 16;
            const gridTotalSize = 800;
            gridHelper = new THREE.GridHelper(gridTotalSize, gridSubdivisions, 0x00d2ff, 0x334155);
            gridHelper.rotation.x = Math.PI / 2; // XY düzlemine yatır
            gridHelper.position.z = 0;
            gridHelper.visible = false;
        }

        // Sahnedeki tüm kayıtlı ögelerin Three.js nesnelerini hazırla
        elements.forEach(el => initElementThreeObjects(el));

        if (elements.length === 0) {
            const defEl = createDefaultElement();
            initElementThreeObjects(defEl);
            elements.push(defEl);
            setActiveElement(defEl);
            recreateContentMeshes(defEl);
        } else {
            const activeEl = getActiveElement();
            if (activeEl) {
                setActiveElement(activeEl);
            }
        }

        // Render döngüsü
        startRenderLoop();
        return true;
    }

    /**
     * 2.1 Tuval Yeniden Boyutlandırma ve Kamera Adaptasyonu (Görsel Yüklendiğinde / Format Değiştiğinde)
     */
    function resize(w, h) {
        const container = document.getElementById('canvas-container');
        if (!container) return;

        const newW = w || container.offsetWidth || 1920;
        const newH = h || container.offsetHeight || 1080;

        if (canvasEl) {
            canvasEl.width = newW;
            canvasEl.height = newH;
            canvasEl.style.width = '100%';
            canvasEl.style.height = '100%';
        }

        if (renderer) {
            renderer.setSize(newW, newH, false);
        }

        if (camera) {
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
        }

        updatePlaneTransform();
        updateContentTransform();
        if (gizmoOverlayEl && state.gizmoActive) updateGizmoPositions();
        if (cornerPinOverlayEl && state.cornerPinActive) updateCornerPinOverlay();
        requestRender();
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

    /**
     * 🌟 Birebir 3D Öge: SVG Metnini Güncelleme (Gerekirse)
     */
    function updateSvgText(svgStr, newText) {
        if (!svgStr || typeof newText !== 'string') return svgStr;
        try {
            const safeSvg = ensureSvgXmlns(svgStr);
            const parser = new DOMParser();
            const doc = parser.parseFromString(safeSvg, 'image/svg+xml');
            const textNodes = doc.querySelectorAll('text');
            if (textNodes.length > 0) {
                let targetNode = textNodes[textNodes.length - 1];
                let maxFs = 0;
                textNodes.forEach(tn => {
                    const fs = parseFloat(tn.getAttribute('font-size')) || 0;
                    if (fs > maxFs) { maxFs = fs; targetNode = tn; }
                });
                targetNode.textContent = newText;
                return new XMLSerializer().serializeToString(doc.documentElement);
            }
        } catch(e){}
        return svgStr;
    }

    /**
     * 🌟 Birebir 3D Öge: SVG'den Yüksek Çözünürlüklü Vektör Dokusu Oluşturucu
     */
    function createExactSvgTexture(rawSvg, vbW, vbH, onUpdate) {
        const maxTexDim = 1024;
        let cw = maxTexDim;
        let ch = Math.round(maxTexDim * ((vbH || 1) / (vbW || 1)));
        if ((vbH || 1) > (vbW || 1)) {
            ch = maxTexDim;
            cw = Math.round(maxTexDim * ((vbW || 1) / (vbH || 1)));
        }
        cw = Math.max(256, Math.min(2048, cw));
        ch = Math.max(256, Math.min(2048, ch));

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

        let safeSvg = ensureSvgXmlns(rawSvg);
        if (!safeSvg.includes('width=')) {
            safeSvg = safeSvg.replace('<svg', `<svg width="${vbW || 200}"`);
        }
        if (!safeSvg.includes('height=')) {
            safeSvg = safeSvg.replace('<svg', `<svg height="${vbH || 200}"`);
        }

        const blob = new Blob([safeSvg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, cw, ch);
            ctx.drawImage(img, 0, 0, cw, ch);
            URL.revokeObjectURL(url);
            texture.needsUpdate = true;
            if (typeof onUpdate === 'function') onUpdate();
        };
        img.onerror = (e) => {
            console.warn('[ThreeDEngine] SVG doku rasterize edilemedi:', e);
            URL.revokeObjectURL(url);
        };
        img.src = url;

        return texture;
    }

    /**
     * 🌟 Birebir 3D Öge: SVG İçeriğini Analiz Edip Otomatik 3D Kontur Silüeti (THREE.Shape) Çıkarıcı
     */
    function createShapeAndBoundsFromSvg(rawSvg) {
        if (!rawSvg) return null;

        const safeSvg = ensureSvgXmlns(rawSvg);
        const parser = new DOMParser();
        const doc = parser.parseFromString(safeSvg, 'image/svg+xml');
        const svgEl = doc.querySelector('svg');
        if (!svgEl) return null;

        let vb = svgEl.getAttribute('viewBox');
        let ox = 0, oy = 0, vbW = 200, vbH = 200;
        if (vb) {
            const parts = vb.trim().split(/[\s,]+/).map(parseFloat);
            if (parts.length === 4 && !isNaN(parts[2]) && !isNaN(parts[3])) {
                ox = parts[0]; oy = parts[1]; vbW = parts[2]; vbH = parts[3];
            }
        } else {
            vbW = parseFloat(svgEl.getAttribute('width')) || 200;
            vbH = parseFloat(svgEl.getAttribute('height')) || 200;
        }

        const maxDim = Math.max(vbW, vbH) || 200;
        const scaleFactor = 220 / maxDim;
        const targetW = vbW * scaleFactor;
        const targetH = vbH * scaleFactor;

        let shape = null;

        // Kontur Önceliği 1: <path> (defs içinde olmayan, ana dış hat)
        const pathNodes = Array.from(svgEl.querySelectorAll('path')).filter(p => !p.closest('defs'));
        if (pathNodes.length > 0) {
            let tempSvg = null;
            try {
                tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                tempSvg.setAttribute('viewBox', `${ox} ${oy} ${vbW} ${vbH}`);
                tempSvg.style.position = 'fixed';
                tempSvg.style.left = '-9999px';
                tempSvg.style.top = '-9999px';
                tempSvg.style.width = '1px';
                tempSvg.style.height = '1px';
                tempSvg.style.opacity = '0';
                tempSvg.style.pointerEvents = 'none';
                document.body.appendChild(tempSvg);

                let bestPathNode = null;
                let maxLen = 0;
                for (const p of pathNodes) {
                    const cloned = p.cloneNode(true);
                    tempSvg.appendChild(cloned);
                    try {
                        const l = cloned.getTotalLength ? cloned.getTotalLength() : 0;
                        if (l > maxLen) {
                            maxLen = l;
                            bestPathNode = cloned;
                        }
                    } catch(e){}
                }

                if (bestPathNode && maxLen > 25) {
                    const numSamples = Math.max(64, Math.min(180, Math.round(maxLen / 3)));
                    shape = new THREE.Shape();
                    for (let i = 0; i <= numSamples; i++) {
                        const pt = bestPathNode.getPointAtLength((i / numSamples) * maxLen);
                        const tx = (pt.x - ox - vbW / 2) * scaleFactor;
                        const ty = -(pt.y - oy - vbH / 2) * scaleFactor;
                        if (i === 0) shape.moveTo(tx, ty);
                        else shape.lineTo(tx, ty);
                    }
                    shape.closePath();
                }
            } catch(err) {
                console.warn('[ThreeDEngine] SVG path sampling hatası:', err);
            } finally {
                if (tempSvg && tempSvg.parentNode) tempSvg.parentNode.removeChild(tempSvg);
            }
        }

        // Kontur Önceliği 2: <polygon> (Ribbon, bayrak, üçgen, elmas vb.)
        if (!shape) {
            const polyNodes = Array.from(svgEl.querySelectorAll('polygon')).filter(p => !p.closest('defs'));
            if (polyNodes.length > 0) {
                const rawPts = (polyNodes[0].getAttribute('points') || '').trim().split(/[\s,]+/).map(parseFloat).filter(n => !isNaN(n));
                if (rawPts.length >= 6) {
                    shape = new THREE.Shape();
                    for (let i = 0; i < rawPts.length; i += 2) {
                        const tx = (rawPts[i] - ox - vbW / 2) * scaleFactor;
                        const ty = -(rawPts[i + 1] - oy - vbH / 2) * scaleFactor;
                        if (i === 0) shape.moveTo(tx, ty);
                        else shape.lineTo(tx, ty);
                    }
                    shape.closePath();
                }
            }
        }

        // Kontur Önceliği 3: <circle> (Damga, madalyon, yuvarlak etiket)
        if (!shape) {
            const circleNodes = Array.from(svgEl.querySelectorAll('circle')).filter(c => !c.closest('defs'));
            if (circleNodes.length > 0) {
                let maxR = 0;
                let bestCircle = circleNodes[0];
                for (const c of circleNodes) {
                    const r = parseFloat(c.getAttribute('r')) || 0;
                    if (r > maxR) { maxR = r; bestCircle = c; }
                }
                if (maxR > 10) {
                    const cx = (parseFloat(bestCircle.getAttribute('cx')) || (vbW / 2));
                    const cy = (parseFloat(bestCircle.getAttribute('cy')) || (vbH / 2));
                    const rScaled = maxR * scaleFactor;
                    const ctx = (cx - ox - vbW / 2) * scaleFactor;
                    const cty = -(cy - oy - vbH / 2) * scaleFactor;
                    shape = new THREE.Shape();
                    shape.absarc(ctx, cty, rScaled, 0, Math.PI * 2, false);
                }
            }
        }

        // Kontur Önceliği 4: <rect> (Kart, plaket, etiket çerçevesi)
        if (!shape) {
            const rectNodes = Array.from(svgEl.querySelectorAll('rect')).filter(r => !r.closest('defs'));
            if (rectNodes.length > 0) {
                let maxArea = 0;
                let bestRect = rectNodes[0];
                for (const r of rectNodes) {
                    const rw = parseFloat(r.getAttribute('width')) || 0;
                    const rh = parseFloat(r.getAttribute('height')) || 0;
                    const area = rw * rh;
                    if (area > maxArea) { maxArea = area; bestRect = r; }
                }
                const rw = (parseFloat(bestRect.getAttribute('width')) || (vbW - 10)) * scaleFactor;
                const rh = (parseFloat(bestRect.getAttribute('height')) || (vbH - 10)) * scaleFactor;
                const rxRaw = parseFloat(bestRect.getAttribute('rx') || bestRect.getAttribute('ry') || '12');
                const rxVal = Math.min(rxRaw * scaleFactor, rw / 2, rh / 2);

                const rxPos = parseFloat(bestRect.getAttribute('x')) || 0;
                const ryPos = parseFloat(bestRect.getAttribute('y')) || 0;
                const rectCenterX = rxPos + (parseFloat(bestRect.getAttribute('width')) || vbW) / 2;
                const rectCenterY = ryPos + (parseFloat(bestRect.getAttribute('height')) || vbH) / 2;
                const offX = (rectCenterX - ox - vbW / 2) * scaleFactor;
                const offY = -(rectCenterY - oy - vbH / 2) * scaleFactor;

                const halfW = rw / 2;
                const halfH = rh / 2;
                shape = new THREE.Shape();
                shape.moveTo(offX - halfW + rxVal, offY + halfH);
                shape.lineTo(offX + halfW - rxVal, offY + halfH);
                shape.quadraticCurveTo(offX + halfW, offY + halfH, offX + halfW, offY + halfH - rxVal);
                shape.lineTo(offX + halfW, offY - halfH + rxVal);
                shape.quadraticCurveTo(offX + halfW, offY - halfH, offX + halfW - rxVal, offY - halfH);
                shape.lineTo(offX - halfW + rxVal, offY - halfH);
                shape.quadraticCurveTo(offX - halfW, offY - halfH, offX - halfW, offY - halfH + rxVal);
                shape.lineTo(offX - halfW, offY + halfH - rxVal);
                shape.quadraticCurveTo(offX - halfW, offY + halfH, offX - halfW + rxVal, offY + halfH);
            }
        }

        // Kontur Önceliği 5: Güvenli Genel Rozet Plakası (Fallback)
        if (!shape) {
            const rw = targetW * 0.94;
            const rh = targetH * 0.94;
            const rx = Math.min(16, rw / 6, rh / 6);
            const halfW = rw / 2;
            const halfH = rh / 2;
            shape = new THREE.Shape();
            shape.moveTo(-halfW + rx, halfH);
            shape.lineTo(halfW - rx, halfH);
            shape.quadraticCurveTo(halfW, halfH, halfW, halfH - rx);
            shape.lineTo(halfW, -halfH + rx);
            shape.quadraticCurveTo(halfW, -halfH, halfW - rx, -halfH);
            shape.lineTo(-halfW + rx, -halfH);
            shape.quadraticCurveTo(-halfW, -halfH, -halfW, -halfH + rx);
            shape.lineTo(-halfW, halfH - rx);
            shape.quadraticCurveTo(-halfW, halfH, -halfW + rx, halfH);
        }

        const bounds = {
            minX: (-vbW / 2) * scaleFactor,
            maxX: (vbW / 2) * scaleFactor,
            minY: (-vbH / 2) * scaleFactor,
            maxY: (vbH / 2) * scaleFactor,
            width: targetW,
            height: targetH,
            vbW,
            vbH
        };

        return { shape, bounds };
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
    function recreateContentMeshes(targetEl) {
        const el = targetEl || getActiveElement();
        if (!el || !el.contentGroup) return;

        // Hedef aktif ögeyse state'ten en güncel değerleri aktar
        if (el === getActiveElement()) {
            syncActiveElementFromState();
        }

        const cGroup = el.contentGroup;

        if (el.textMesh) {
            cGroup.remove(el.textMesh);
            if (el.textMesh.geometry) el.textMesh.geometry.dispose();
            el.textMesh = null;
        }
        if (el.iconMesh) {
            cGroup.remove(el.iconMesh);
            if (el.iconMesh.geometry) el.iconMesh.geometry.dispose();
            el.iconMesh = null;
        }
        if (el.badgeMesh) {
            cGroup.remove(el.badgeMesh);
            if (el.badgeMesh.geometry) el.badgeMesh.geometry.dispose();
            if (el.badgeMesh.material) {
                if (Array.isArray(el.badgeMesh.material)) {
                    el.badgeMesh.material.forEach(m => {
                        if (m && m.map) m.map.dispose();
                        if (m) m.dispose();
                    });
                } else {
                    if (el.badgeMesh.material.map) el.badgeMesh.material.map.dispose();
                    el.badgeMesh.material.dispose();
                }
            }
            el.badgeMesh = null;
        }

        const frontMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(el.frontColor),
            roughness: el.roughness,
            metalness: el.metalness
        });

        const sideMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(el.sideColor),
            roughness: Math.min(1.0, el.roughness + 0.15),
            metalness: Math.max(0.1, el.metalness - 0.1)
        });

        const extrudeOpts = {
            depth: Math.max(1, el.depth),
            bevelEnabled: !!el.bevelEnabled,
            bevelThickness: el.bevelThickness,
            bevelSize: el.bevelSize,
            bevelSegments: 3,
            curveSegments: 8
        };

        const type = el.elementType;

        if (type === 'pin' || type === 'combo_pin') {
            const pinGeo = new THREE.ExtrudeGeometry(createPinShape(), extrudeOpts);
            pinGeo.center();
            el.iconMesh = new THREE.Mesh(pinGeo, [frontMat, sideMat]);
            el.iconMesh.castShadow = true;
            cGroup.add(el.iconMesh);
        } else if (type === 'arrow' || type === 'combo_arrow') {
            const arrowGeo = new THREE.ExtrudeGeometry(createArrowShape(), extrudeOpts);
            arrowGeo.center();
            el.iconMesh = new THREE.Mesh(arrowGeo, [frontMat, sideMat]);
            el.iconMesh.castShadow = true;
            cGroup.add(el.iconMesh);
        }

        if ((type === 'text' || type === 'combo_pin' || type === 'combo_arrow') && loadedFont) {
            const textString = (el.text || '').trim() || 'METİN';
            const textGeo = new THREE.TextGeometry(textString, {
                font: loadedFont,
                size: el.textSize,
                height: Math.max(1, el.depth),
                curveSegments: 8,
                bevelEnabled: !!el.bevelEnabled,
                bevelThickness: el.bevelThickness,
                bevelSize: el.bevelSize,
                bevelOffset: 0,
                bevelSegments: 3
            });
            textGeo.center();

            el.textMesh = new THREE.Mesh(textGeo, [frontMat, sideMat]);
            el.textMesh.castShadow = true;
            cGroup.add(el.textMesh);
        } else if (type === 'element_3d' && el.sourceSvg) {
            const svgToRender = el.text ? updateSvgText(el.sourceSvg, el.text) : el.sourceSvg;
            const res = createShapeAndBoundsFromSvg(svgToRender);
            if (res && res.shape) {
                const shape = res.shape;
                const bounds = res.bounds;
                const uvGen = getNormalizedUVGenerator(bounds.minX, bounds.maxX, bounds.minY, bounds.maxY);

                const badgeExtrudeOpts = {
                    depth: Math.max(1, el.depth),
                    bevelEnabled: !!el.bevelEnabled,
                    bevelThickness: el.bevelThickness,
                    bevelSize: el.bevelSize,
                    bevelSegments: 3,
                    curveSegments: 16,
                    UVGenerator: uvGen
                };

                const badgeGeo = new THREE.ExtrudeGeometry(shape, badgeExtrudeOpts);
                badgeGeo.center();

                const badgeTex = createExactSvgTexture(
                    svgToRender,
                    bounds.vbW,
                    bounds.vbH,
                    () => requestRender()
                );

                const badgeFrontMat = new THREE.MeshStandardMaterial({
                    map: badgeTex,
                    roughness: el.roughness,
                    metalness: el.metalness,
                    transparent: true,
                    alphaTest: 0.05
                });

                el.badgeMesh = new THREE.Mesh(badgeGeo, [badgeFrontMat, sideMat]);
                el.badgeMesh.castShadow = true;
                el.badgeMesh.receiveShadow = true;
                cGroup.add(el.badgeMesh);
            }
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
                depth: Math.max(1, el.depth),
                bevelEnabled: !!el.bevelEnabled,
                bevelThickness: el.bevelThickness,
                bevelSize: el.bevelSize,
                bevelSegments: 3,
                curveSegments: 16,
                UVGenerator: uvGen
            };

            const badgeGeo = new THREE.ExtrudeGeometry(shape, badgeExtrudeOpts);
            badgeGeo.center();

            const badgeTex = createBadgeTexture(
                type,
                el.text,
                el.badgeSubtext,
                el.selectedIconId,
                el.badgeBgColor,
                el.frontColor,
                el.frontColor,
                () => requestRender()
            );

            const badgeFrontMat = new THREE.MeshStandardMaterial({
                map: badgeTex,
                roughness: el.roughness,
                metalness: el.metalness
            });

            el.badgeMesh = new THREE.Mesh(badgeGeo, [badgeFrontMat, sideMat]);
            el.badgeMesh.castShadow = true;
            el.badgeMesh.receiveShadow = true;
            cGroup.add(el.badgeMesh);
        }

        if (type === 'combo_pin' && el.iconMesh && el.textMesh) {
            const iconWidth = 55;
            el.textMesh.position.set(iconWidth / 2 + 10, 0, 0);
            el.iconMesh.position.set(-100, 0, 0);
        } else if (type === 'combo_arrow' && el.iconMesh && el.textMesh) {
            el.iconMesh.rotation.set(0, 0, -Math.PI / 2);
            el.iconMesh.position.set(-110, 0, 0);
            el.textMesh.position.set(30, 0, 0);
        } else {
            if (el.iconMesh) el.iconMesh.position.set(0, 0, 0);
            if (el.textMesh) el.textMesh.position.set(0, 0, 0);
            if (el.badgeMesh) el.badgeMesh.position.set(0, 0, 0);
        }

        // Aktif öge ise modül referanslarını güncelle
        if (el === getActiveElement()) {
            textMesh = el.textMesh;
            iconMesh = el.iconMesh;
            badgeMesh = el.badgeMesh;
        }

        updateContentTransform(el);
        notifyExternalUpdates();
        requestRender();
    }

    /**
     * 5. Düzlem ve İçerik Dönüşüm Güncellemeleri
     */
    function updatePlaneTransform(targetEl) {
        const el = targetEl || getActiveElement();
        if (!el || !el.planeGroup) return;

        if (el === getActiveElement()) {
            syncActiveElementFromState();
        }

        const pitchRad = THREE.MathUtils.degToRad(el.planePitch);
        const yawRad = THREE.MathUtils.degToRad(el.planeYaw);
        const rollRad = THREE.MathUtils.degToRad(el.planeRoll);

        el.planeGroup.rotation.order = 'ZYX';
        el.planeGroup.rotation.set(pitchRad, yawRad, rollRad);
        el.planeGroup.scale.set(el.planeScale, el.planeScale, el.planeScale);

        if (el.shadowPlane && el.shadowPlane.material) {
            el.shadowPlane.material.opacity = (el.shadowOpacity !== undefined) ? el.shadowOpacity : state.shadowOpacity;
        }

        if (el === getActiveElement()) {
            if (gridHelper) {
                gridHelper.visible = !!state.selected && !!state.showPlaneGrid && el.visible !== false;
            }
            updateGizmoPositions();
        }
    }

    function updateContentTransform(targetEl) {
        const el = targetEl || getActiveElement();
        if (!el || !el.contentGroup) return;

        if (el === getActiveElement()) {
            syncActiveElementFromState();
        }

        const zPos = (el.posZ || 0);
        const elev = (el.planeElevation || 0);
        const isStanding = (el.orientation === 'standing');

        // 🧠 Bounding box tespiti ile ögenin gerçek yarı yüksekliğini ve yarı kalınlığını hesapla
        let halfHeight = 85;
        try {
            const m = el.badgeMesh || el.iconMesh || el.textMesh;
            if (m && m.geometry) {
                if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
                const bb = m.geometry.boundingBox;
                halfHeight = Math.max(20, (bb.max.y - bb.min.y) / 2);
            }
        } catch (e) {}

        const halfDepth = Math.max(1, el.depth) / 2 + (el.bevelEnabled ? (el.bevelThickness || 2) : 0);
        const groundLift = isStanding ? halfHeight : halfDepth;

        el.contentGroup.position.set(el.posX, el.posY, zPos + elev + groundLift);
        const localRotRad = THREE.MathUtils.degToRad(el.planeLocalRot || 0);
        const standX = isStanding ? (Math.PI / 2) : 0;
        el.contentGroup.rotation.set(standX, 0, -localRotRad);

        if (el.shadowPlane) {
            el.shadowPlane.position.set(el.posX, el.posY, zPos - 0.5);
        }

        if (el === getActiveElement()) {
            if (gridHelper) {
                gridHelper.position.set(el.posX, el.posY, zPos);
                gridHelper.visible = !!state.selected && !!state.showPlaneGrid && el.visible !== false;
            }
            updateLighting();
            updateGizmoPositions();
        }
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

    function updateCornerPinOverlay() {
        updateCornerPinHandlesFromScene();
    }
    const updateCornerPinVisuals = updateCornerPinOverlay;

    function renderCornerPinDOM() {
        if (!cornerPinOverlayEl) return;
        const container = document.getElementById('canvas-container');
        const cw = container ? (container.offsetWidth || 1920) : 1920;
        let sf = (typeof window.scaleFactor === 'number' && window.scaleFactor > 0) ? window.scaleFactor : null;
        if (!sf) {
            const previewArea = document.getElementById('preview-area');
            const availW = previewArea ? (previewArea.offsetWidth - 40) : 1200;
            sf = cw > 0 ? (availW / cw) : 0.62;
        }
        const referenceSf = 0.62;
        const zoomComp = Math.max(1.0, referenceSf / sf);
        const effectiveGizmoScale = (state.gizmoScale || 1.0) * zoomComp;
        cornerPinOverlayEl.style.setProperty('--gizmo-scale', effectiveGizmoScale.toFixed(3));

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
                const sf = (typeof window.scaleFactor === 'number' && window.scaleFactor > 0) ? window.scaleFactor : 1.0;
                const dx = (e.clientX - startClientX) / sf;
                const dy = (e.clientY - startClientY) / sf;
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
    function showGizmoHud(text, clientX, clientY) {
        if (!gizmoOverlayEl || state.gizmoShowHud === false) return;
        const hud = gizmoOverlayEl.querySelector('#threeDGizmoHud');
        if (!hud) return;
        hud.textContent = text;
        const container = document.getElementById('canvas-container');
        if (container) {
            const rect = container.getBoundingClientRect();
            const sf = (typeof window.scaleFactor === 'number' && window.scaleFactor > 0) ? window.scaleFactor : 1.0;
            const localX = (clientX - rect.left) / sf;
            const localY = (clientY - rect.top) / sf;
            hud.style.left = (localX + 16) + 'px';
            hud.style.top = (localY - 24) + 'px';
        } else {
            hud.style.left = (clientX + 14) + 'px';
            hud.style.top = (clientY - 32) + 'px';
        }
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
        let objRadius = 60;
        if (state.gizmoAutoFit && contentGroup) {
            try {
                contentGroup.updateMatrixWorld(true);
                const bbox = new THREE.Box3().setFromObject(contentGroup);
                if (!bbox.isEmpty()) {
                    const sz = new THREE.Vector3();
                    bbox.getSize(sz);
                    const maxDim = Math.max(sz.x, sz.y, sz.z);
                    objRadius = maxDim / 2;
                    autoRatio = Math.max(1.0, Math.min(3.0, maxDim / 120));
                }
            } catch (ex) {
                autoRatio = 1.0;
            }
        }

        // 🔍 Çözünürlük ve Zoom Adaptasyonu:
        // canvas-container'ın scaleFactor ölçeklemesi nedeniyle yüksek çözünürlüklü fotoğraflarda
        // tutamaçların ekranda minicik kalmasını engeller, ekran boyutunu korur.
        let sf = (typeof window.scaleFactor === 'number' && window.scaleFactor > 0) ? window.scaleFactor : null;
        if (!sf) {
            const previewArea = document.getElementById('preview-area');
            const availW = previewArea ? (previewArea.offsetWidth - 40) : 1200;
            sf = cw > 0 ? (availW / cw) : 0.62;
        }
        const referenceSf = 0.62; // 1920x1080 tuvalde (~1200px preview alanı) tipik scaleFactor
        const zoomComp = Math.max(1.0, referenceSf / sf);
        const effectiveGizmoScale = (state.gizmoScale || 1.0) * zoomComp;
        const currentOpacity = (state.gizmoOpacity !== undefined) ? state.gizmoOpacity : 1.0;

        gizmoOverlayEl.style.setProperty('--gizmo-scale', effectiveGizmoScale.toFixed(3));
        gizmoOverlayEl.style.setProperty('--gizmo-opacity', currentOpacity);
        gizmoOverlayEl.classList.toggle('show-labels', !!state.gizmoShowLabels);

        if (cornerPinOverlayEl) {
            cornerPinOverlayEl.style.setProperty('--gizmo-scale', effectiveGizmoScale.toFixed(3));
        }

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

        // 🎯 Eksenlerin 1 yerel birim başına tuvalde ürettiği gerçek 2D piksel vektörleri
        const pUnitX = projectLocalPoint(new THREE.Vector3(1, 0, 0));
        const pUnitY = projectLocalPoint(new THREE.Vector3(0, 1, 0));
        const pUnitZ = projectLocalPoint(new THREE.Vector3(0, 0, 1));

        const dVx = { x: pUnitX.x - cx, y: pUnitX.y - cy };
        const dVy = { x: pUnitY.x - cx, y: pUnitY.y - cy };
        const dVz = { x: pUnitZ.x - cx, y: pUnitZ.y - cy };

        const lenX = Math.hypot(dVx.x, dVx.y);
        const lenY = Math.hypot(dVy.x, dVy.y);
        const lenZ = Math.hypot(dVz.x, dVz.y);

        // 1 yerel 3D birimi (state.posX/Y/Z) başına düşen tuval pikseli
        axisPixelsPerUnit.x = lenX > 0.0001 ? lenX : 1.0;
        axisPixelsPerUnit.y = lenY > 0.0001 ? lenY : 1.0;
        axisPixelsPerUnit.z = lenZ > 0.0001 ? lenZ : 1.0;

        // Ekrana yansıyan yön birim vektörleri
        axisScreenDirs.x = { x: dVx.x / axisPixelsPerUnit.x, y: dVx.y / axisPixelsPerUnit.x };
        axisScreenDirs.y = { x: dVy.x / axisPixelsPerUnit.y, y: dVy.y / axisPixelsPerUnit.y };
        axisScreenDirs.z = { x: dVz.x / axisPixelsPerUnit.z, y: dVz.y / axisPixelsPerUnit.z };

        // 📏 Akıllı ve Çökmez Kol Uzunluğu (Non-Collapsing Screen-Space Radius):
        // Kullanıcı ögeyi ne kadar ufaltırsa ufaltsın (örneğin scale %10 olsa bile),
        // tutamaçların birbirine girmesini ve ögeden önce kaybolmasını engellemek için
        // tuvalde ASGARİ 85px * effectiveGizmoScale uzunluk garanti edilir.
        const avgPixelsPerUnit = (axisPixelsPerUnit.x + axisPixelsPerUnit.y + axisPixelsPerUnit.z) / 3;
        const minCanvasArmPx = 85 * effectiveGizmoScale;
        const userDistMultiplier = (state.gizmoDistance || 75) / 75;

        // Nesne yarıçapının tuvaldeki gerçek piksel boyutu
        const objCanvasPx = objRadius * (state.gizmoAutoFit ? autoRatio : 1.0) * avgPixelsPerUnit;

        // Hedef tuval kol uzunluğu (en az minCanvasArmPx, nesne büyükse nesneyi saracak kadar)
        const targetArmPx = Math.max(minCanvasArmPx, objCanvasPx * 1.25) * userDistMultiplier;

        // Bu pikseli üretecek yerel 3D mesafe (baseLen)
        const baseLen = targetArmPx / Math.max(0.001, avgPixelsPerUnit);

        // Eksen Çizgisi Bitişleri (Ok uçları)
        const pLineX = projectLocalPoint(new THREE.Vector3(baseLen, 0, 0));
        const pLineY = projectLocalPoint(new THREE.Vector3(0, baseLen, 0));
        const pLineZ = projectLocalPoint(new THREE.Vector3(0, 0, baseLen));

        // Eksen Ucu Butonları (X, Y, Z harfleri - çizginin hemen ucunda)
        const pTipX = projectLocalPoint(new THREE.Vector3(baseLen * 1.15, 0, 0));
        const pTipY = projectLocalPoint(new THREE.Vector3(0, baseLen * 1.15, 0));
        const pTipZ = projectLocalPoint(new THREE.Vector3(0, 0, baseLen * 1.15));

        // 3D Yaylar (Quadrant Arcs) ve Üzerindeki Renkli Noktalar
        const arcR = baseLen * 0.72;

        // 🎯 Kırmızı YZ Yayının teğet yön vektörü (Yay üzerinde döndürme yönü)
        const pMidYZ = projectLocalPoint(new THREE.Vector3(0, arcR * 0.7071, arcR * 0.7071));
        const pFwdYZ = projectLocalPoint(new THREE.Vector3(0, arcR * 0.6428, arcR * 0.7660)); // 50°
        const tLenYZ = Math.hypot(pFwdYZ.x - pMidYZ.x, pFwdYZ.y - pMidYZ.y);
        if (tLenYZ > 0.5) {
            arcScreenTangents.yz = { x: (pFwdYZ.x - pMidYZ.x) / tLenYZ, y: (pFwdYZ.y - pMidYZ.y) / tLenYZ };
        }

        function build3DArc(vStartDir, vEndDir, steps = 32) {
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

        if (originDot) {
            originDot.setAttribute('cx', cx);
            originDot.setAttribute('cy', cy);
            originDot.setAttribute('r', (3.5 * effectiveGizmoScale).toFixed(1));
        }

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
                const sf = (typeof window.scaleFactor === 'number' && window.scaleFactor > 0) ? window.scaleFactor : 1.0;
                const dx = (e.clientX - startClientX) / sf;
                const dy = (e.clientY - startClientY) / sf;
                const proj = dx * axisScreenDirs.x.x + dy * axisScreenDirs.x.y;
                state.posX = Math.round(origPosX + proj / Math.max(0.001, axisPixelsPerUnit.x));
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
                const sf = (typeof window.scaleFactor === 'number' && window.scaleFactor > 0) ? window.scaleFactor : 1.0;
                const dx = (e.clientX - startClientX) / sf;
                const dy = (e.clientY - startClientY) / sf;
                const proj = dx * axisScreenDirs.y.x + dy * axisScreenDirs.y.y;
                state.posY = Math.round(origPosY + proj / Math.max(0.001, axisPixelsPerUnit.y));
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
                const sf = (typeof window.scaleFactor === 'number' && window.scaleFactor > 0) ? window.scaleFactor : 1.0;
                const dx = (e.clientX - startClientX) / sf;
                const dy = (e.clientY - startClientY) / sf;
                // 🎯 Ok hangi yöne bakıyorsa fareyi o yöne çekince çalışır
                const proj = dx * axisScreenDirs.z.x + dy * axisScreenDirs.z.y;
                state.posZ = Math.round(origPosZ + proj / Math.max(0.001, axisPixelsPerUnit.z));
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
                const sf = (typeof window.scaleFactor === 'number' && window.scaleFactor > 0) ? window.scaleFactor : 1.0;
                const dx = (e.clientX - startClientX) / sf;
                const dy = (e.clientY - startClientY) / sf;

                if (e.shiftKey) {
                    // Shift basılıyken: Derinlik (Z ekseni - Odanın içine/dışına)
                    state.sunPosZ = Math.round(startSunZ - dy * 2.0);
                } else {
                    // Normal sürükleme: X (Sol/Sağ - Pencereye doğru) ve Y (Aşağı/Yukarı)
                    const container = document.getElementById('canvas-container');
                    const ch = container ? (container.offsetHeight || 1080) : 1080;
                    const sunWorldScale = 704 / Math.max(1, ch);
                    state.sunPosX = Math.round(startSunX + dx * sunWorldScale);
                    state.sunPosY = Math.round(startSunY - dy * sunWorldScale);
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
        if (!state.active || !camera || elements.length === 0 || !canvasEl) return null;
        const container = document.getElementById('canvas-container');
        if (!container) return null;
        const rect = container.getBoundingClientRect();
        if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return null;

        const mouseVec = new THREE.Vector2(
            ((clientX - rect.left) / rect.width) * 2 - 1,
            -((clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseVec, camera);

        // En üstteki (son eklenen) nesneden başlayarak tara
        for (let i = elements.length - 1; i >= 0; i--) {
            const el = elements[i];
            if (el.visible === false || !el.contentGroup) continue;

            const targetObjects = [];
            if (el.textMesh) targetObjects.push(el.textMesh);
            if (el.iconMesh) targetObjects.push(el.iconMesh);
            if (el.badgeMesh) targetObjects.push(el.badgeMesh);
            if (targetObjects.length === 0) {
                el.contentGroup.traverse((child) => {
                    if (child.isMesh && child !== el.shadowPlane) targetObjects.push(child);
                });
            }
            const intersects = raycaster.intersectObjects(targetObjects, true);
            if (intersects && intersects.length > 0) {
                return el;
            }

            // Harfler arası boşluklar için tolerans payı (Bounding box testi)
            try {
                const box = new THREE.Box3().setFromObject(el.contentGroup);
                if (!box.isEmpty()) {
                    box.expandByScalar(15);
                    if (raycaster.ray.intersectsBox(box)) return el;
                }
            } catch (ex) {}
        }
        return null;
    }

    /**
     * 🎯 3D Stüdyo Panelini Varsayılan Olarak Sol Panelin (.panel) Üzerine Hizalar
     * Böylece tuval ve fotoğraf alanı tamamen açık kalır, kullanıcının görüşünü kapatmaz.
     */
    function positionStudioPanelOverLeftPanel(panel) {
        if (!panel) return;
        if (panel._hasBeenManuallyDragged) return;

        const leftPanel = document.querySelector('.container > .panel') || document.querySelector('.panel');
        if (leftPanel) {
            const rect = leftPanel.getBoundingClientRect();
            const targetLeft = Math.max(8, Math.round(rect.left));
            const targetTop = Math.max(65, Math.round(rect.top));
            panel.style.left = targetLeft + 'px';
            panel.style.top = targetTop + 'px';
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            if (rect.width > 320) {
                panel.style.width = Math.min(430, Math.round(rect.width)) + 'px';
            }
        } else {
            panel.style.left = '15px';
            panel.style.top = '75px';
        }
    }

    /**
     * 8.2. 3D Öge Seçim Yönetimi
     * Görsel serbestken seçimi düşürür, tuşla/tıklamayla yeniden seçildiğinde fotoğrafı kilitler.
     * Boşa tıklandığında 3D panel ve tutamaçlar birlikte kapanır; ögeye tıklandığında panel sol panelde açılır.
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

            // 🎯 Panel de sol panel üzerinde açılsın
            const panel = ensureStudioPanel();
            if (panel) {
                positionStudioPanelOverLeftPanel(panel);
                panel.style.display = 'flex';
            }

            if (!options.silent && window.showToast) {
                window.showToast('🎯 3D Öge Seçildi — Tutamaçlar & Panel Aktif (Kısayol: 3 | Bırakmak: Boşa Tıkla/ESC)', 'info');
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

            // 🎯 Boşa tıklanınca veya seçim bırakılınca panel de kapansın!
            const panel = document.getElementById('threeDStudioPanel');
            if (panel) {
                panel.style.display = 'none';
            }

            if (!options.silent && window.showToast) {
                window.showToast('🔓 3D Seçimi Bırakıldı — Panel & Tutamaçlar Kapandı (Seçmek İçin Ögeye Tıkla/[3])', 'info');
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
            const hitEl = check3DHit(e.clientX, e.clientY);
            const isRotateModifier = (e.button === 2 || e.altKey || e.shiftKey);
            if (!hitEl && !isRotateModifier) {
                // Boş alana tıklandı: 3D seçimini bırak, tutamaçlar ve grid kapansın, görsel serbest kalsın!
                setSelected(false);
                return;
            }

            if (hitEl && hitEl.id !== activeElementId) {
                setActiveElement(hitEl);
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

            const screenDx = e.clientX - dragStart.x;
            const screenDy = e.clientY - dragStart.y;
            dragStart.x = e.clientX;
            dragStart.y = e.clientY;

            if (dragMode === 'rotate') {
                state.planeYaw = Math.round((state.planeYaw + screenDx * 0.5) % 360);
                state.planePitch = Math.max(-90, Math.min(90, Math.round(state.planePitch - screenDy * 0.5)));
                updatePlaneTransform();
                syncControlsUI();
                showGizmoHud(`🔄 Yatay: ${state.planeYaw}°, Eğim: ${state.planePitch}°`, e.clientX, e.clientY);
            } else {
                // 🎯 3D Perspektif Eksen İzdüşümleriyle Doğal Taşıma
                const sf = (typeof window.scaleFactor === 'number' && window.scaleFactor > 0) ? window.scaleFactor : 1.0;
                const dx = screenDx / sf;
                const dy = screenDy / sf;
                const projX = dx * axisScreenDirs.x.x + dy * axisScreenDirs.x.y;
                const projY = dx * axisScreenDirs.y.x + dy * axisScreenDirs.y.y;
                state.posX += projX / Math.max(0.001, axisPixelsPerUnit.x);
                state.posY += projY / Math.max(0.001, axisPixelsPerUnit.y);
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
                const hitEl = check3DHit(e.clientX, e.clientY);
                if (hitEl) {
                    e.stopPropagation();
                    e.preventDefault();
                    setActiveElement(hitEl);
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
                } else if ((e.key === 'Delete' || e.key === 'Backspace') && state.active && state.selected) {
                    e.preventDefault();
                    delete3DElement();
                }
            });
        }

        // 🎯 Tuval dışı boş alana (preview-area veya workArea) tıklandığında seçimi ve paneli kapat
        const previewArea = document.getElementById('preview-area') || document.getElementById('workArea');
        if (previewArea && !previewArea._threeDPreviewAreaEventsAttached) {
            previewArea._threeDPreviewAreaEventsAttached = true;
            previewArea.addEventListener('pointerdown', (e) => {
                if (!state.active || !state.selected) return;
                if (e.button !== 0) return;
                // Panel, gizmo, dock kontrolleri veya tuval içi tıklamaları koru
                if (e.target.closest('#threeDStudioPanel, .three-d-panel, #threeDGizmoOverlay, #threeDCornerPinOverlay, #threeDCanvasBadge, #threeDDockControls, .dock-3d-controls, #canvas-container')) {
                    return;
                }
                setSelected(false);
            });
        }

        // 🎯 Sol menüde başka bir sekmeye tıklandığında seçimi ve 3D paneli kapat
        const mainTabs = document.getElementById('mainTabs');
        if (mainTabs && !mainTabs._threeDTabsEventsAttached) {
            mainTabs._threeDTabsEventsAttached = true;
            mainTabs.addEventListener('click', (e) => {
                const btn = e.target.closest('.tab-btn');
                if (btn && state.active && state.selected) {
                    setSelected(false);
                }
            });
        }

        // 🎯 Pencere yeniden boyutlandırıldığında paneli sol panel üzerinde tut
        if (!window._threeDResizePositionAttached) {
            window._threeDResizePositionAttached = true;
            window.addEventListener('resize', () => {
                const p = document.getElementById('threeDStudioPanel');
                if (p && !p._hasBeenManuallyDragged && p.style.display !== 'none') {
                    positionStudioPanelOverLeftPanel(p);
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
     * 10. Tuvale Aktar (Hi-Res Bake & Transfer)
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

        // 🌟 2D Kaynak Elemanını ve Çiftleri Kalıcı Olarak Temizle
        if (state.source2DEl && state.source2DEl.parentNode) {
            try { state.source2DEl.remove(); } catch(e){}
            state.source2DEl = null;
        }
        document.querySelectorAll('[data-converted-to-3d="true"]').forEach(el => {
            try { el.remove(); } catch(e){}
        });

        // 3D Canvas'ı Tuvale Aktarıldığı İçin Gizle
        if (canvasEl) canvasEl.style.display = 'none';

        // 3D Paneli ve Tutamaçları Kapat
        closeStudio();

        if (typeof window.renderLayers === 'function') window.renderLayers();
        if (typeof window.recordHistory === 'function') window.recordHistory('3D Öge Tuvale Aktarıldı');
        if (typeof window.requestAutoSave === 'function') window.requestAutoSave();

        if (window.showToast) {
            window.showToast('✅ 3D Öge Başarıyla Tuvale Aktarıldı!', 3500);
        } else {
            alert('3D Öge Başarıyla Tuvale Aktarıldı!');
        }
        return true;
    }

    /**
     * 10.1. Export & Çıktı Entegrasyonu
     * İhracat, baskı ve indirme işlemlerinde 3D sahneyi hedef çözünürlükte (Ultra-HD / 4K / 1080p),
     * grid ve kılavuzlardan arındırılmış saf haliyle hazırlar ve context'e aktarır.
     * Üstteki gizle butonu aktifse (state.visible === false) çıktıya dahil edilmez.
     */
    function prepareForExport(targetW, targetH) {
        if (!state.active || !renderer || !canvasEl || !scene || !camera || elements.length === 0) {
            return null;
        }

        const hasVisible = elements.some(e => e.visible !== false);
        if (!hasVisible) return null;

        // Yardımcı kılavuzları geçici olarak gizle
        const prevGrid = gridHelper ? gridHelper.visible : false;
        const prevSun = sunGroup ? sunGroup.visible : false;
        const prevRay = sunRayLine ? sunRayLine.visible : false;
        if (gridHelper) gridHelper.visible = false;
        if (sunGroup) sunGroup.visible = false;
        if (sunRayLine) sunRayLine.visible = false;

        // Her ögenin görünürlük durumunu Three.js grubuna uygula
        elements.forEach(e => {
            if (e.planeGroup) e.planeGroup.visible = (e.visible !== false);
        });

        const curW = canvasEl.width;
        const curH = canvasEl.height;
        const curAspect = camera.aspect;

        const outW = targetW || curW;
        const outH = targetH || curH;

        renderer.setSize(outW, outH, false);
        camera.aspect = outW / outH;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);

        return {
            canvas: canvasEl,
            restore: () => {
                renderer.setSize(curW, curH, false);
                camera.aspect = curAspect;
                camera.updateProjectionMatrix();
                if (gridHelper) gridHelper.visible = !!(state.selected && prevGrid);
                if (sunGroup) sunGroup.visible = !!(state.selected && prevSun);
                if (sunRayLine) sunRayLine.visible = !!(state.selected && prevRay);
                requestRender();
            }
        };
    }

    /**
     * 10.2. 3D Ögeyi Tuvalden Silme / Temizleme (Tekil ve Çoklu)
     */
    function delete3DElement(elementId) {
        let elToDelete = null;
        if (elementId) {
            elToDelete = elements.find(e => e.id === elementId);
        } else {
            elToDelete = getActiveElement();
        }
        if (!elToDelete) return;

        // Sahneden temizle
        if (elToDelete.planeGroup && scene) {
            if (gridHelper && gridHelper.parent === elToDelete.planeGroup) {
                elToDelete.planeGroup.remove(gridHelper);
            }
            scene.remove(elToDelete.planeGroup);
        }

        const disposeMesh = (m) => {
            if (!m) return;
            if (m.geometry) m.geometry.dispose();
            if (m.material) {
                if (Array.isArray(m.material)) {
                    m.material.forEach(mat => {
                        if (mat && mat.map) mat.map.dispose();
                        if (mat) mat.dispose();
                    });
                } else {
                    if (m.material.map) m.material.map.dispose();
                    m.material.dispose();
                }
            }
        };
        disposeMesh(elToDelete.textMesh);
        disposeMesh(elToDelete.iconMesh);
        disposeMesh(elToDelete.badgeMesh);
        disposeMesh(elToDelete.shadowPlane);

        const idx = elements.indexOf(elToDelete);
        if (idx !== -1) {
            elements.splice(idx, 1);
        }

        if (elements.length > 0) {
            const nextEl = elements[Math.max(0, idx - 1)] || elements[0];
            setActiveElement(nextEl);
            if (window.showToast) {
                window.showToast(`🗑️ "${elToDelete.name}" silindi. Kalan 3D öge: ${elements.length}`, 'info');
            }
        } else {
            activeElementId = null;
            state.active = false;
            state.selected = false;
            if (canvasEl) canvasEl.style.display = 'none';
            if (gridHelper) gridHelper.visible = false;
            if (sunGroup) sunGroup.visible = false;
            if (sunRayLine) sunRayLine.visible = false;
            if (gizmoOverlayEl) gizmoOverlayEl.style.display = 'none';
            if (cornerPinOverlayEl) cornerPinOverlayEl.style.display = 'none';
            if (canvasBadgeEl) canvasBadgeEl.style.display = 'none';
            const panel = document.getElementById('threeDStudioPanel');
            if (panel) panel.style.display = 'none';
            if (window.showToast) {
                window.showToast('🗑️ Tüm 3D ögeler tuvalden silindi.', 'info');
            }
        }

        updateElementSelectorUI();
        updateDock3DControlsState();
        notifyExternalUpdates();
        if (typeof window.renderLayers === 'function') window.renderLayers();
        if (typeof window.recordHistory === 'function') window.recordHistory('3D Öge Silindi');
        if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
        requestRender();
    }

    function clearAll3D() {
        while (elements.length > 0) {
            delete3DElement(elements[0].id);
        }
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

        // 🌟 Birebir 3D Öge UI Senkronizasyonu
        const exactBtn = panel.querySelector('#threeDElemExactBtn');
        const exactSection = panel.querySelector('#threeDExactSection');
        const isExact = state.elementType === 'element_3d' && !!state.sourceSvg;

        if (exactBtn) {
            exactBtn.style.display = state.sourceSvg ? 'inline-flex' : 'none';
            exactBtn.classList.toggle('active', isExact);
            if (state.sourceItemName) {
                const lbl = panel.querySelector('#threeDElemExactBtnLabel');
                if (lbl) lbl.textContent = '✨ 3D: ' + state.sourceItemName;
            }
        }
        if (exactSection) {
            exactSection.style.display = isExact ? 'block' : 'none';
            if (isExact && state.sourceItemName) {
                const tit = panel.querySelector('#threeDExactItemTitle');
                if (tit) tit.textContent = '✨ ' + state.sourceItemName;
            }
        }

        // 🌟 Rozet & İkon Paneli Senkronizasyonu
        const badgeSection = panel.querySelector('#threeDBadgeSection');
        const textRow = panel.querySelector('#threeDTextRow');
        const sizeRow = panel.querySelector('#threeDSizeRow');
        const textSecTitle = panel.querySelector('#threeDTextSectionTitle');

        const isBadge = state.elementType && (state.elementType.startsWith('badge_') || state.elementType === 'icon_3d');
        if (badgeSection) badgeSection.style.display = isBadge ? 'block' : 'none';
        if (textRow) textRow.style.display = (isBadge || isExact) ? 'none' : 'flex';
        if (sizeRow) sizeRow.style.display = (isBadge || isExact) ? 'none' : 'flex';
        if (textSecTitle) textSecTitle.textContent = (isBadge || isExact) ? '📐 3D KALINLIK & IŞIK PAHI' : '🔤 METİN & 3D KALINLIK';

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
        updateDock3DControlsState();
    }

    /**
     * 🎯 Tuval Altı Hızlı 3D Eksen & Tutamaç Kontrol Çubuğu (Dock 3D Controls)
     */
    function updateDock3DControlsState() {
        const dock3D = document.getElementById('dock3DControls');
        const divider = document.getElementById('dock3DDivider');
        if (!dock3D) return;

        if (!state.active) {
            dock3D.style.display = 'none';
            if (divider) divider.style.display = 'none';
            return;
        }

        dock3D.style.display = 'inline-flex';
        if (divider) divider.style.display = 'block';

        const targetItemBtn = dock3D.querySelector('#dock3DTargetItemBtn');
        const targetSunBtn = dock3D.querySelector('#dock3DTargetSunBtn');
        const btnX = dock3D.querySelector('#dock3DBtnX');
        const btnY = dock3D.querySelector('#dock3DBtnY');
        const btnZ = dock3D.querySelector('#dock3DBtnZ');
        const btnFree = dock3D.querySelector('#dock3DBtnFree');

        if (targetItemBtn) targetItemBtn.classList.toggle('active', !!state.selected);
        if (targetSunBtn) targetSunBtn.classList.toggle('active', !state.selected || !!state.sunGizmoVisible);
        if (btnFree) btnFree.classList.toggle('active', !!state.gizmoActive);
    }

    function initDock3DControls() {
        const dock3D = document.getElementById('dock3DControls');
        if (!dock3D || dock3D.dataset.bound === 'true') return;
        dock3D.dataset.bound = 'true';

        const targetItemBtn = dock3D.querySelector('#dock3DTargetItemBtn');
        if (targetItemBtn) {
            targetItemBtn.onclick = () => {
                setSelected(true);
                state.sunGizmoVisible = false;
                updateDock3DControlsState();
            };
        }

        const targetSunBtn = dock3D.querySelector('#dock3DTargetSunBtn');
        if (targetSunBtn) {
            targetSunBtn.onclick = () => {
                state.sunGizmoVisible = true;
                if (gizmoOverlayEl) {
                    const sunEl = gizmoOverlayEl.querySelector('#threeDGizmoSun');
                    if (sunEl) {
                        sunEl.style.transform = 'translate(-50%, -50%) scale(1.4)';
                        sunEl.style.boxShadow = '0 0 24px rgba(245, 158, 11, 1)';
                        setTimeout(() => {
                            if (sunEl) {
                                sunEl.style.transform = 'translate(-50%, -50%) scale(1)';
                                sunEl.style.boxShadow = '';
                            }
                        }, 400);
                    }
                }
                updateDock3DControlsState();
            };
        }

        const btnX = dock3D.querySelector('#dock3DBtnX');
        if (btnX) {
            btnX.onclick = () => {
                state.planePitch = (state.planePitch >= 75) ? -75 : (state.planePitch + 15);
                updatePlaneTransform();
                syncControlsUI();
                requestRender();
                if (gizmoOverlayEl) {
                    const dotX = gizmoOverlayEl.querySelector('#threeDGizmoDotX');
                    if (dotX) {
                        dotX.style.transform = 'scale(1.4)';
                        setTimeout(() => { if (dotX) dotX.style.transform = 'scale(1)'; }, 250);
                    }
                }
            };
        }

        const btnY = dock3D.querySelector('#dock3DBtnY');
        if (btnY) {
            btnY.onclick = () => {
                state.planeYaw = (state.planeYaw >= 165) ? -180 : (state.planeYaw + 15);
                updatePlaneTransform();
                syncControlsUI();
                requestRender();
                if (gizmoOverlayEl) {
                    const dotY = gizmoOverlayEl.querySelector('#threeDGizmoDotY');
                    if (dotY) {
                        dotY.style.transform = 'scale(1.4)';
                        setTimeout(() => { if (dotY) dotY.style.transform = 'scale(1)'; }, 250);
                    }
                }
            };
        }

        const btnZ = dock3D.querySelector('#dock3DBtnZ');
        if (btnZ) {
            btnZ.onclick = () => {
                state.planeRoll = (state.planeRoll >= 165) ? -180 : (state.planeRoll + 15);
                updatePlaneTransform();
                syncControlsUI();
                requestRender();
                if (gizmoOverlayEl) {
                    const dotZ = gizmoOverlayEl.querySelector('#threeDGizmoDotZ');
                    if (dotZ) {
                        dotZ.style.transform = 'scale(1.4)';
                        setTimeout(() => { if (dotZ) dotZ.style.transform = 'scale(1)'; }, 250);
                    }
                }
            };
        }

        const btnFree = dock3D.querySelector('#dock3DBtnFree');
        if (btnFree) {
            btnFree.onclick = () => {
                toggleGizmoMode();
                updateDock3DControlsState();
            };
        }

        const centerBtn = dock3D.querySelector('#dock3DCenterBtn');
        if (centerBtn) {
            centerBtn.onclick = () => {
                centerOnScreen();
            };
        }

        const resetBtn = dock3D.querySelector('#dock3DResetBtn');
        if (resetBtn) {
            resetBtn.onclick = () => {
                resetToDefaults();
            };
        }
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

            <!-- 🌟 ÇOKLU ÖGE SEÇİCİ VE YENİ ÖGE EKLEME ÇUBUĞU -->
            <div id="threeDMultiElementBar" style="display:flex; align-items:center; gap:8px; padding:8px 12px; background:rgba(15, 23, 42, 0.85); border-bottom:1px solid rgba(255, 255, 255, 0.08);">
                <div style="flex:1; display:flex; align-items:center; gap:6px; min-width:0;">
                    <span style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; white-space:nowrap;">Öge:</span>
                    <select id="threeDElementSelector" style="flex:1; min-width:0; background:#1e293b; color:#f8fafc; border:1px solid rgba(56, 189, 248, 0.35); border-radius:6px; padding:4px 8px; font-size:12px; font-weight:600; outline:none; cursor:pointer;">
                    </select>
                </div>
                <button type="button" id="threeDAddNewElementBtn" style="background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; border:none; border-radius:6px; padding:5px 9px; font-size:11px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:4px; box-shadow:0 2px 6px rgba(14,165,233,0.3); white-space:nowrap;" title="Tuvale Yeni Bir 3D Öge Ekle">
                    <i class="fas fa-plus"></i> Yeni 3D
                </button>
                <button type="button" id="threeDDeleteElementBtn" style="background:rgba(239, 68, 68, 0.15); color:#ef4444; border:1px solid rgba(239, 68, 68, 0.35); border-radius:6px; padding:5px 8px; font-size:11px; font-weight:700; cursor:pointer;" title="Seçili 3D Ögeyi Tuvalden Sil">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>

            <div id="threeDLoadingStatus" class="three-d-loading" style="display:none;">
                <i class="fas fa-circle-notch fa-spin"></i> 3D Motoru Hazırlanıyor...
            </div>

            <div class="three-d-body custom-scrollbar">
                <!-- 1. ÖGE TÜRÜ SEÇİMİ -->
                <div class="three-d-section">
                    <div class="three-d-section-title">📦 3D ÖGE TÜRÜ</div>
                    <!-- 🌟 Birebir 3D Öge Butonu -->
                    <div style="margin-bottom:8px;" id="threeDExactBtnWrap">
                        <button class="three-d-elem-btn active" data-type="element_3d" id="threeDElemExactBtn" style="width:100%; display:none; background:linear-gradient(135deg, rgba(99,102,241,0.35), rgba(168,85,247,0.35)); border:1.5px solid #818cf8; color:#fff; font-weight:700; padding:9px 12px; justify-content:center; gap:8px; border-radius:8px; box-shadow:0 2px 10px rgba(99,102,241,0.25);" title="Kütüphaneden veya tuvalden seçilen orijinal 2D ögenin birebir 3D hali">
                            <i class="fas fa-cube" style="color:#a78bfa; font-size:14px;"></i> <span id="threeDElemExactBtnLabel">✨ Birebir 3D Öge</span>
                        </button>
                    </div>
                    <div class="three-d-elem-subhead">🔤 Standart 3D Kalıplar</div>
                    <div class="three-d-elem-grid">
                        <button class="three-d-elem-btn" data-type="text"><i class="fas fa-font"></i> Metin</button>
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

                <!-- 🌟 1A. BİREBİR 3D ÖGE BİLGİ KARTI -->
                <div class="three-d-section" id="threeDExactSection" style="display:none; background:rgba(99,102,241,0.12); border:1px solid rgba(129,140,248,0.35); border-radius:10px; padding:12px; margin-bottom:12px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:20px;">💎</span>
                        <div style="flex:1;">
                            <div style="font-size:13px; font-weight:700; color:#e0e7ff;" id="threeDExactItemTitle">Birebir 3D Tasarım</div>
                            <div style="font-size:11px; color:#94a3b8; line-height:1.4; margin-top:2px;">Orijinal vektör öge kendi şekli ve dokusuyla 3D derinlik ve ışık kazandı.</div>
                        </div>
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

                    <!-- 🌟 Hızlı Konumlandırma & Sıfırlama Butonları -->
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-bottom:8px;">
                        <button type="button" id="threeDPanelCenterBtn" class="three-d-action-subbtn" style="display:flex; align-items:center; justify-content:center; gap:6px; padding:7px 10px; background:rgba(14,165,233,0.12); border:1px solid rgba(14,165,233,0.35); border-radius:6px; color:#38bdf8; font-size:12px; font-weight:600; cursor:pointer;" title="3D Ögeyi Tuvalin Tam Ortasına Getir">
                            <i class="fas fa-crosshairs"></i> Ekrana Ortala
                        </button>
                        <button type="button" id="threeDPanelResetBtn" class="three-d-action-subbtn" style="display:flex; align-items:center; justify-content:center; gap:6px; padding:7px 10px; background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.35); border-radius:6px; color:#fbbf24; font-size:12px; font-weight:600; cursor:pointer;" title="Tüm Açı, Konum ve Kalınlık Düzenlemelerini Varsayılana Sıfırlar">
                            <i class="fas fa-rotate-left"></i> Varsayılana Döndür
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
                        <span class="three-d-label"><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#ef4444; margin-right:5px; box-shadow:0 0 6px rgba(239,68,68,0.7); vertical-align:middle;"></span>Eğim (X Pitch):</span>
                        <input type="range" id="threeDPitchInput" class="three-d-range" min="-90" max="90" value="${state.planePitch}">
                        <span id="threeDPitchVal" class="three-d-val">${state.planePitch}°</span>
                    </div>
                    <div class="three-d-row">
                        <span class="three-d-label"><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; margin-right:5px; box-shadow:0 0 6px rgba(16,185,129,0.7); vertical-align:middle;"></span>Yatay (Y Yaw):</span>
                        <input type="range" id="threeDYawInput" class="three-d-range" min="-180" max="180" value="${state.planeYaw}">
                        <span id="threeDYawVal" class="three-d-val">${state.planeYaw}°</span>
                    </div>
                    <div class="three-d-row">
                        <span class="three-d-label"><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#00d2ff; margin-right:5px; box-shadow:0 0 6px rgba(0,210,255,0.7); vertical-align:middle;"></span>Yatırma (Z Roll):</span>
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
        `;

        document.body.appendChild(panel);
        positionStudioPanelOverLeftPanel(panel);

        // 🛡️ Panel içi tıklama ve sürüklemelerin tuvale veya sayfa dışına sızmasını engelle (kapanmayı önler)
        panel.addEventListener('pointerdown', (e) => e.stopPropagation());
        panel.addEventListener('mousedown', (e) => e.stopPropagation());
        panel.addEventListener('click', (e) => e.stopPropagation());

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

        // 🌟 Ekrana Ortala ve Varsayılana Döndür Butonları
        const panelCenterBtn = panel.querySelector('#threeDPanelCenterBtn');
        if (panelCenterBtn) {
            panelCenterBtn.addEventListener('click', centerOnScreen);
        }
        const panelResetBtn = panel.querySelector('#threeDPanelResetBtn');
        if (panelResetBtn) {
            panelResetBtn.addEventListener('click', resetToDefaults);
        }

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

        // Çoklu Öge Çubuğu Dinleyicileri
        const elemSelector = panel.querySelector('#threeDElementSelector');
        if (elemSelector) {
            elemSelector.addEventListener('change', (e) => {
                setActiveElement(e.target.value);
            });
        }
        const addBtn = panel.querySelector('#threeDAddNewElementBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const count = elements.length + 1;
                const newEl = createDefaultElement({
                    name: '3D Metin ' + count,
                    text: '3D ÖGE ' + count,
                    posX: (elements.length % 5) * 35,
                    posY: (elements.length % 5) * -35
                });
                initElementThreeObjects(newEl);
                elements.push(newEl);
                setActiveElement(newEl);
                recreateContentMeshes(newEl);
                updateElementSelectorUI();
                if (typeof window.renderLayers === 'function') window.renderLayers();
                if (typeof window.recordHistory === 'function') window.recordHistory('Yeni 3D Öge Eklendi');
                if (window.showToast) window.showToast('✨ Yeni 3D öge tuvale eklendi!', 'success');
            });
        }
        const delBtn = panel.querySelector('#threeDDeleteElementBtn');
        if (delBtn) {
            delBtn.addEventListener('click', () => {
                delete3DElement();
            });
        }
        updateElementSelectorUI();

        // Header Actions
        panel.querySelector('#threeDResetBtn').addEventListener('click', resetToDefaults);
        panel.querySelector('#threeDVisHeaderBtn').addEventListener('click', () => toggleVisibility());
        panel.querySelector('#threeDCloseBtn').addEventListener('click', closeStudio);
    }

    function updateElementSelectorUI() {
        const sel = document.getElementById('threeDElementSelector');
        if (!sel) return;
        sel.innerHTML = '';
        elements.forEach((el, idx) => {
            const opt = document.createElement('option');
            opt.value = el.id;
            opt.textContent = `${idx + 1}. ${el.sourceItemName || el.name || '3D Öge'}${el.visible === false ? ' (Gizli)' : ''}`;
            if (el.id === activeElementId) {
                opt.selected = true;
            }
            sel.appendChild(opt);
        });
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
            el._hasBeenManuallyDragged = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = el.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            handle.setPointerCapture(e.pointerId);
            e.preventDefault();
            e.stopPropagation();
        });

        handle.addEventListener('pointermove', (e) => {
            if (!isDown) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            el.style.left = Math.max(10, Math.min(window.innerWidth - el.offsetWidth - 10, initialLeft + dx)) + 'px';
            el.style.top = Math.max(10, Math.min(window.innerHeight - el.offsetHeight - 10, initialTop + dy)) + 'px';
            el.style.right = 'auto';
            el.style.bottom = 'auto';
            e.stopPropagation();
        });

        const onUp = (e) => {
            if (!isDown) return;
            isDown = false;
            try { handle.releasePointerCapture(e.pointerId); } catch(ex){}
            e.stopPropagation();
        };

        handle.addEventListener('pointerup', onUp);
        handle.addEventListener('pointercancel', onUp);
    }

    /**
     * 15. Modalı Aç / Kapat
     */
    async function openStudio(skipAutoConvert = false) {
        // Eğer bir 2D rozet veya ikon varsa ve henüz dönüştürülmediyse, otomatik olarak onu 3D'ye dönüştür
        if (!skipAutoConvert && !state.source2DEl) {
            const candidate = (typeof window.selectedCalloutEl !== 'undefined' && window.selectedCalloutEl) ||
                              (typeof selectedCalloutEl !== 'undefined' && selectedCalloutEl) ||
                              (typeof window.selectedEl !== 'undefined' && window.selectedEl) ||
                              document.querySelector('#canvas-container .callout-wrap:not([data-converted-to-3d="true"]), #workArea .callout-wrap:not([data-converted-to-3d="true"]), #ui-layer .added-icon:not([data-converted-to-3d="true"])');
            if (candidate && candidate.style.display !== 'none') {
                return convert2DBadgeTo3D(candidate);
            }
        }

        const panel = ensureStudioPanel();
        positionStudioPanelOverLeftPanel(panel);
        panel.style.display = 'flex';
        state.active = true;
        state.hasBaked = false;

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
        initDock3DControls();
        updateDock3DControlsState();
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

        // 🎯 Seçimi bırak (tutamaçlar ve eksenler gizlenir), 3D öge tuvalde aktif ve görünür kalmaya devam eder!
        setSelected(false, { silent: true });
        updateDock3DControlsState();
        notifyExternalUpdates();
        requestRender();
    }

    function toggleElementVisibility(elementId, forceVisible) {
        const targetId = elementId || activeElementId;
        const target = elements.find(e => e.id === targetId) || getActiveElement();
        if (!target) return;
        const newVisible = (forceVisible !== undefined) ? !!forceVisible : (target.visible === false);
        target.visible = newVisible;
        if (target.state) target.state.visible = newVisible;
        if (target.planeGroup) target.planeGroup.visible = newVisible;

        if (target.id === activeElementId) {
            state.visible = newVisible;
            if (cornerPinOverlayEl) cornerPinOverlayEl.style.display = (newVisible && state.cornerPinActive && state.selected) ? 'block' : 'none';
            if (gizmoOverlayEl) gizmoOverlayEl.style.display = (newVisible && state.gizmoActive && !state.cornerPinActive && state.selected) ? 'block' : 'none';
            if (canvasBadgeEl) canvasBadgeEl.style.display = (newVisible && state.active && state.selected) ? 'flex' : 'none';
            if (gridHelper) gridHelper.visible = newVisible && !!state.selected && state.showPlaneGrid;
            if (sunGroup) sunGroup.visible = newVisible && !!state.selected;
            if (sunRayLine) sunRayLine.visible = newVisible && !!state.selected;

            const btn = document.getElementById('threeDVisHeaderBtn');
            if (btn) {
                btn.innerHTML = newVisible ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash" style="color:#ef4444;"></i>';
                btn.title = newVisible ? '3D Ögeyi Gizle (Tuval ve Çıktıdan Gizlenir)' : '3D Ögeyi Göster (Tuval ve Çıktıya Dahil)';
            }
        }

        const anyVisible = elements.some(e => e.visible !== false);
        if (canvasEl) {
            canvasEl.style.display = anyVisible ? 'block' : 'none';
        }

        if (window.showToast) {
            const name = target.sourceItemName || target.name || '3D Öge';
            window.showToast(newVisible ? `👁️ "${name}" Görünür (Tuval ve Çıktıya Dahil)` : `🚫 "${name}" Gizlendi (Tuval ve Çıktıda Görünmez)`, 'info');
        }

        if (typeof window.renderLayers === 'function') window.renderLayers();
        notifyExternalUpdates();
        requestRender();
    }

    function toggleVisibility(forceVisible) {
        toggleElementVisibility(activeElementId, forceVisible);
    }

    /**
     * 🎯 3D Ögeyi Tuvalin Tam Ortasına Hizala
     */
    function centerOnScreen() {
        state.posX = 0;
        state.posY = 0;
        state.posZ = 0;
        state.planeElevation = 0;
        state.planeLocalRot = 0;

        updatePlaneTransform();
        updateContentTransform();
        if (cornerPinOverlayEl && state.cornerPinActive) updateCornerPinOverlay();
        if (gizmoOverlayEl) updateGizmoPositions();
        syncControlsUI();
        requestRender();
        notifyExternalUpdates();

        if (typeof window.showToast === 'function') {
            window.showToast('🎯 3D Öge ekranın tam ortasına hizalandı.', 'info');
        }
    }

    /**
     * 🔄 Öge Üzerindeki Düzenlemeleri Sıfırlayıp Varsayılan Açı ve Konuma Döndür
     */
    function resetToDefaults() {
        // 1. Konum, derinlik ve dönüşleri sıfırla (Ekranın tam ortası)
        state.posX = 0;
        state.posY = 0;
        state.posZ = 0;
        state.planeElevation = 0;
        state.planeLocalRot = 0;
        state.planeScale = 1.0;

        // 2. Açıları öge türüne göre en ideal varsayılana getir
        const isPin = state.elementType === 'pin' || state.elementType === 'combo_pin' || 
                      (state.elementType === 'element_3d' && state.orientation === 'standing');
        if (isPin) {
            state.orientation = 'standing';
            state.planePitch = -35;
            state.planeYaw = 15;
            state.planeRoll = 0;
        } else if (state.elementType === 'arrow' || state.elementType === 'combo_arrow') {
            state.orientation = 'flat';
            state.planePitch = -55;
            state.planeYaw = 0;
            state.planeRoll = 0;
        } else {
            state.orientation = 'flat';
            state.planePitch = -60;
            state.planeYaw = 15;
            state.planeRoll = 0;
        }

        // 3. Geometri kalınlık ve pahı sıfırla
        state.depth = 16;
        state.bevelEnabled = true;
        state.bevelThickness = 2;
        state.bevelSize = 1.5;

        // 4. Işıklandırmayı varsayılana getir
        state.sunPosX = 550;
        state.sunPosY = 250;
        state.sunPosZ = -50;
        state.lightIntensity = 1.3;
        state.shadowOpacity = 0.45;
        state.shadowSoftness = 1.5;

        // 5. Tutamaçları ve modları güncelle
        state.cornerPinActive = false;
        state.gizmoActive = true;
        state.selected = true;

        cornerPins[0] = { x: 0, y: 0 };
        if (cornerPinOverlayEl) cornerPinOverlayEl.style.display = 'none';
        if (gizmoOverlayEl) {
            gizmoOverlayEl.style.display = 'block';
            updateGizmoPositions();
        }

        const p = document.getElementById('threeDStudioPanel');
        if (p) {
            p._hasBeenManuallyDragged = false;
            positionStudioPanelOverLeftPanel(p);
        }

        setSelected(true, { silent: true, autoLockPhoto: false });
        updatePlaneTransform();
        updateContentTransform();
        updateLighting();
        recreateContentMeshes();
        syncControlsUI();
        requestRender();
        notifyExternalUpdates();

        if (typeof window.showToast === 'function') {
            window.showToast('🔄 3D öge düzenlemeleri varsayılan ayarlara sıfırlandı.', 'info');
        }
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
     * Otomatik 3D Yan Kalınlık / Gölge Rengi Oluşturucu
     */
    function autoGenerateSideColor(colorStr) {
        if (!colorStr) return '#1e293b';
        try {
            if (typeof THREE !== 'undefined' && THREE.Color) {
                const c = new THREE.Color(colorStr);
                c.multiplyScalar(0.62); // %38 daha koyu zengin 3D yan kalınlık gölgesi
                return '#' + c.getHexString();
            }
        } catch(e){}

        if (typeof colorStr === 'string' && colorStr.startsWith('#')) {
            let hex = colorStr.replace('#', '');
            if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
            if (hex.length === 6) {
                const r = Math.max(0, Math.floor(parseInt(hex.substr(0, 2), 16) * 0.62));
                const g = Math.max(0, Math.floor(parseInt(hex.substr(2, 2), 16) * 0.62));
                const b = Math.max(0, Math.floor(parseInt(hex.substr(4, 2), 16) * 0.62));
                return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
            }
        }
        return '#0f172a';
    }

    /**
     * 15. 2D Rozet / İğne / İkonu 3D'ye Dönüştürme Köprüsü (2D-to-3D Bridge)
     */
    async function convert2DBadgeTo3D(badgeEl, meta = {}) {
        const el = badgeEl || (typeof window.selectedCalloutEl !== 'undefined' ? window.selectedCalloutEl : (typeof selectedCalloutEl !== 'undefined' ? selectedCalloutEl : (typeof window.selectedEl !== 'undefined' ? window.selectedEl : null)));
        if (!el) {
            const autoEl = document.querySelector('#canvas-container .callout-wrap:not([data-converted-to-3d="true"]), #workArea .callout-wrap:not([data-converted-to-3d="true"]), #ui-layer .added-icon:not([data-converted-to-3d="true"])');
            if (autoEl) {
                return convert2DBadgeTo3D(autoEl, meta);
            }
            if (typeof window.showToast === 'function') {
                window.showToast('⚠️ Lütfen önce tuvalde dönüştürmek istediğiniz rozet veya ikonu seçin.', 'warning');
            }
            return false;
        }

        const root = el.closest('.callout-wrap, .callout-wrapper, .draggable, .added-icon, .canvas-el') || el;
        const classList = ((el.className || '') + ' ' + (root.className || '')).toLowerCase();

        // SVG Node ve ham SVG metni
        const svgNode = el.querySelector('svg') || root.querySelector('svg');
        const rawSvg = (meta && meta.rawSvg) || (svgNode ? svgNode.outerHTML : (el.innerHTML || root.innerHTML));

        // 1. Pozisyon Tespiti: 2D elemanın tuvaldeki fiziksel merkez koordinatını hesapla
        const container = document.getElementById('canvas-container');
        let initX = 0, initY = 0;
        if (container && root) {
            const cRect = container.getBoundingClientRect();
            const rRect = root.getBoundingClientRect();
            if (rRect.width > 0 && rRect.height > 0 && cRect.width > 0) {
                const rCenterX = rRect.left + rRect.width / 2;
                const rCenterY = rRect.top + rRect.height / 2;
                const cCenterX = cRect.left + cRect.width / 2;
                const cCenterY = cRect.top + cRect.height / 2;
                const sf = (typeof window.scaleFactor === 'number' && window.scaleFactor > 0) ? window.scaleFactor : 1.0;
                initX = Math.round((rCenterX - cCenterX) / sf);
                initY = Math.round(-(rCenterY - cCenterY) / sf);
            }
        }
        if (initX === 0 && initY === 0 && elements.length > 0) {
            initX = (elements.length % 5) * 35;
            initY = (elements.length % 5) * -35;
        }

        // 2. 2D Elemanı Tuvalden Kalıcı Olarak Temizle (Artık 3D olarak sahnede yaşar)
        if (root && root.parentNode) {
            root.remove();
        }
        if (root !== el && el && el.parentNode) {
            el.remove();
        }
        if (typeof window.removeCalloutControls === 'function') {
            window.removeCalloutControls();
        }
        if (typeof window.selectedCalloutEl !== 'undefined') window.selectedCalloutEl = null;
        if (typeof window.selectedEl !== 'undefined') window.selectedEl = null;

        // 3. Renk Çıkarımı
        let primaryColor = el.dataset.coBgColor || root.dataset.coBgColor || '';
        if (!primaryColor && svgNode) {
            const stop = svgNode.querySelector('stop');
            if (stop && stop.getAttribute('stop-color')) {
                primaryColor = stop.getAttribute('stop-color');
            } else {
                const fillEl = svgNode.querySelector('[fill]:not([fill="none"]):not([fill^="url"]):not([fill="white"]):not([fill="#fff"]):not([fill="#ffffff"])');
                if (fillEl) primaryColor = fillEl.getAttribute('fill');
            }
        }
        if (!primaryColor || primaryColor === 'none') {
            primaryColor = el.style.color || root.style.color || el.dataset.storedBgHex || root.dataset.storedBgHex || '#e63946';
        }

        // 4. Metin Çıkarımı
        let label = (meta && meta.text) || el.dataset.coLabel || root.dataset.coLabel || '';
        let hasRealText = false;
        if (!label) {
            const textNodes = (el.querySelectorAll ? el : root).querySelectorAll('text, span, .co-text, p, h1, h2, h3, h4');
            const texts = [];
            textNodes.forEach(t => {
                const s = t.textContent.trim();
                if (s && s.length > 0) texts.push(s);
            });
            if (texts.length > 0) {
                const joined = texts.join(' ').trim();
                if (texts.length === 1 && joined.length <= 2 && (/^\d+$/.test(joined) || joined === '📍')) {
                    hasRealText = false;
                } else {
                    label = texts.join('\n');
                    hasRealText = true;
                }
            }
        } else {
            hasRealText = true;
        }

        // 5. Tip Tespiti
        const itemName = (meta && meta.itemName ? meta.itemName : (el.dataset.name || root.dataset.name || '')).toLowerCase();
        const isPin = (meta && meta.isPin) || 
                      classList.includes('pin') || classList.includes('konum') || classList.includes('marker') ||
                      itemName.includes('pin') || itemName.includes('konum') ||
                      (rawSvg && (
                          (rawSvg.includes('190') && rawSvg.includes('80')) ||
                          /M\s*80\s*15\s*C/i.test(rawSvg) ||
                          /M\s*60\s*10\s*C/i.test(rawSvg) ||
                          /M\s*90\s*15\s*C/i.test(rawSvg) ||
                          /M\s*60\s*20\s*C/i.test(rawSvg)
                      ));

        const isArrow = (meta && meta.isArrow) ||
                        classList.includes('arrow') || classList.includes('yön') || itemName.includes('ok') || itemName.includes('arrow') ||
                        (rawSvg && /M\s*0\s*50|arrow/i.test(rawSvg));

        let elemType = 'text';
        if (rawSvg && rawSvg.includes('<svg')) elemType = 'element_3d';
        else if (isPin) elemType = 'pin';
        else if (isArrow) elemType = 'arrow';

        let planePitch = -60, planeYaw = 15, orientation = 'flat';
        if (isPin) {
            orientation = 'standing';
            planePitch = -35;
            planeYaw = 15;
        } else if (isArrow) {
            orientation = 'flat';
            planePitch = -55;
            planeYaw = 0;
        }

        const newEl = createDefaultElement({
            name: itemName || (isPin ? 'Konum Pini' : (isArrow ? 'Yön Oku' : '3D Öge')),
            sourceItemName: itemName || (isPin ? 'Konum Pini' : (isArrow ? 'Yön Oku' : '3D Öge')),
            sourceSvg: (elemType === 'element_3d') ? rawSvg : null,
            elementType: elemType,
            text: hasRealText ? (label.split(/\r?\n/)[0] || '') : (elemType === 'element_3d' ? '' : (label || '3D ÖGE')),
            badgeSubtext: hasRealText ? (label.split(/\r?\n/).slice(1).join(' ') || '') : '',
            frontColor: primaryColor,
            sideColor: autoGenerateSideColor(primaryColor),
            depth: 16,
            bevelEnabled: true,
            bevelThickness: 2,
            bevelSize: 1.5,
            orientation: orientation,
            planePitch: planePitch,
            planeYaw: planeYaw,
            planeRoll: 0,
            posX: initX,
            posY: initY,
            posZ: 0,
            planeScale: 1.0,
            visible: true
        });

        await openStudio(true);
        initElementThreeObjects(newEl);
        elements.push(newEl);
        setActiveElement(newEl);
        recreateContentMeshes(newEl);
        syncControlsUI();
        updateElementSelectorUI();
        setSelected(true);
        if (typeof window.renderLayers === 'function') window.renderLayers();
        if (typeof window.recordHistory === 'function') window.recordHistory('Yeni 3D Öge Eklendi');
        if (typeof window.requestAutoSave === 'function') window.requestAutoSave();

        if (typeof window.showToast === 'function') {
            const toastIcon = isPin ? '📍' : (isArrow ? '🏹' : '✨');
            window.showToast(`${toastIcon} "${newEl.sourceItemName}" 3D olarak eklendi! (Tuvalde toplam ${elements.length} adet 3D öge)`, 'success');
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
        prepareForExport: prepareForExport,
        delete3DElement: delete3DElement,
        clearAll3D: clearAll3D,
        clearScene: clearAll3D,
        getElements: () => elements,
        getActiveElementId: () => activeElementId,
        getActiveElement: getActiveElement,
        selectElement: (id) => { setActiveElement(id); setSelected(true); },
        resize: resize,
        toggleVisibility: toggleVisibility,
        toggleElementVisibility: toggleElementVisibility,
        resetToDefaults: resetToDefaults,
        centerOnScreen: centerOnScreen,
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
