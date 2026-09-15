/**
 * Emlak Stüdyom - 3D Düzlem & Metin Yerleştirici Motoru (ThreeDEngine)
 * Faz 2: 4 Köşe Tutamaç (Corner Pin), 3D Vektörel İkonlar (İğne, Ok, Rozet),
 * Düzlem İçi Döndürme, Havada Süzülme ve Gelişmiş Zemin Gölgesi.
 * 
 * Lisans: MIT (Three.js r128 tabanlı, %100 ticari kullanıma uygun)
 */

(function(window) {
    'use strict';

    // 🌟 MOTOR DURUMU VE AYARLARI (FAZ 2)
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
        lightAngle: 45,        // Güneş ışığı açısı (0° - 360°)
        lightIntensity: 1.3,
        shadowOpacity: 0.45,   // Zemin gölgesi koyuluğu
        posX: 0,               // Düzlem üzerinde X konumu
        posY: 0,               // Düzlem üzerinde Y konumu
        cornerPinActive: false,// 4 Köşe Tutamaç modu aktif mi?
        hasBaked: false
    };

    // 🌟 THREE.JS SAHNE NESNELERİ
    let scene = null;
    let camera = null;
    let renderer = null;
    let canvasEl = null;       // #three-d-layer canvas
    let animFrameId = null;

    let planeGroup = null;     // Açı ve pozisyon alan ana düzlem grubu
    let gridHelper = null;     // Görsel 3D ızgara
    let shadowPlane = null;    // Gerçekçi zemin gölgesi alan şeffaf düzlem
    let contentGroup = null;   // Metin ve ögeleri taşıyan grup
    let textMesh = null;       // 3D kabartma harf mesh'i
    let iconMesh = null;       // 3D ikon mesh'i (İğne veya Ok)
    let dirLight = null;       // Güneş ışığı
    let ambLight = null;       // Çevre ışığı

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
        dirLight.position.set(250, 450, 600);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 10;
        dirLight.shadow.camera.far = 2500;
        const d = 600;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        dirLight.shadow.bias = -0.0005;
        scene.add(dirLight);

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

        // Zemin Gölge Düzlemi (Şeffaf ShadowMaterial)
        const shadowPlaneGeo = new THREE.PlaneGeometry(1600, 1600);
        const shadowPlaneMat = new THREE.ShadowMaterial({
            opacity: state.shadowOpacity
        });
        shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
        shadowPlane.receiveShadow = true;
        shadowPlane.position.z = -0.2; // Harflerin hemen arkasında
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
    function createPinShape() {
        const s = new THREE.Shape();
        // Konum İğnesi (Damla formu + merkez delik)
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
        // Kalın Yön Oku (Arsa girişi ve cephe yönlendirmesi için)
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
     * 4. 3D Geometrileri ve Mesh'leri Yeniden Oluşturma (Faz 2)
     */
    function recreateContentMeshes() {
        if (!contentGroup) return;

        // Eski nesneleri temizle
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

        // Materyaller
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

        // 1. 3D İkon Oluştur (Gerekiyorsa)
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

        // 2. 3D Metin Oluştur (Gerekiyorsa)
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
        }

        // 3. Kombine Yerleşim (İkon + Metin yan yana veya bağımsız)
        if (type === 'combo_pin' && iconMesh && textMesh) {
            // İğneyi sola, metni sağa al
            const iconWidth = 55;
            textMesh.position.set(iconWidth / 2 + 10, 0, 0);
            iconMesh.position.set(-100, 0, 0);
        } else if (type === 'combo_arrow' && iconMesh && textMesh) {
            // Oku sola (metni gösterecek şekilde), metni sağa al
            iconMesh.rotation.set(0, 0, -Math.PI / 2); // Sağa bak
            iconMesh.position.set(-110, 0, 0);
            textMesh.position.set(30, 0, 0);
        } else {
            if (iconMesh) iconMesh.position.set(0, 0, 0);
            if (textMesh) textMesh.position.set(0, 0, 0);
        }

        updateContentTransform();
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
            gridHelper.visible = !!state.showPlaneGrid;
        }
        if (shadowPlane && shadowPlane.material) {
            shadowPlane.material.opacity = state.shadowOpacity;
        }
    }

    function updateContentTransform() {
        if (!contentGroup) return;

        // Düzlem üzerinde X-Y konumu ve havada süzülme yüksekliği (Elevation Z)
        contentGroup.position.set(state.posX, state.posY, state.planeElevation);

        // Düzlem içi kendi etrafında dönüş (Local Rotation)
        const localRotRad = THREE.MathUtils.degToRad(state.planeLocalRot);

        // Duruş Modu: 'flat' (zemine/duvara yatık) vs 'standing' (zemine 90° dik totem)
        const standX = (state.orientation === 'standing') ? (Math.PI / 2) : 0;

        contentGroup.rotation.set(standX, 0, localRotRad);
    }

    function updateLighting() {
        if (!dirLight) return;
        const rad = THREE.MathUtils.degToRad(state.lightAngle);
        const distance = 600;
        const lx = Math.cos(rad) * distance;
        const ly = Math.sin(rad) * distance;
        const lz = 500;
        dirLight.position.set(lx, ly, lz);
        dirLight.intensity = state.lightIntensity;
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
     * Kullanıcının ekrandaki 4 tutamacı arsa/duvar köşelerine sürükleyerek
     * 3D açıyı ve düzlemi tam yüzeye oturtmasını sağlar.
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
        const btn = document.getElementById('threeDCornerPinToggleBtn');
        if (btn) {
            btn.classList.toggle('active', state.cornerPinActive);
            btn.innerHTML = state.cornerPinActive
                ? '<i class="fas fa-bullseye"></i> 4 Köşe Tutamaç (Aktif)'
                : '<i class="fas fa-crosshairs"></i> 4 Köşe ile Yüzeye Oturt';
        }
    }

    function updateCornerPinHandlesFromScene() {
        const container = document.getElementById('canvas-container');
        if (!container || !cornerPinOverlayEl) return;

        const cw = container.offsetWidth || 1920;
        const ch = container.offsetHeight || 1080;
        const cx = cw / 2 + state.posX;
        const cy = ch / 2 - state.posY;

        // Düzlemin mevcut açısına göre 4 köşe hesapla
        const halfW = 180 * state.planeScale;
        const halfH = 90 * state.planeScale;

        // Eğer ilk kez açılıyorsa varsayılan açılı dörtgen yerleştir
        if (cornerPins[0].x === 0 && cornerPins[0].y === 0) {
            cornerPins[0] = { x: cx - halfW * 0.75, y: cy - halfH * 1.1 }; // P0: Sol-Üst
            cornerPins[1] = { x: cx + halfW * 0.75, y: cy - halfH * 1.1 }; // P1: Sağ-Üst
            cornerPins[2] = { x: cx + halfW * 1.1,  y: cy + halfH * 1.1 }; // P2: Sağ-Alt
            cornerPins[3] = { x: cx - halfW * 1.1,  y: cy + halfH * 1.1 }; // P3: Sol-Alt
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

    /**
     * 🎯 4 Köşe Geometrisinden 3D Açı Çözücü (Perspective Solver)
     */
    function solvePerspectiveFromCornerPins() {
        const container = document.getElementById('canvas-container');
        if (!container) return;
        const cw = container.offsetWidth || 1920;
        const ch = container.offsetHeight || 1080;

        const p0 = cornerPins[0]; // Sol-Üst
        const p1 = cornerPins[1]; // Sağ-Üst
        const p2 = cornerPins[2]; // Sağ-Alt
        const p3 = cornerPins[3]; // Sol-Alt

        // 1. Merkez Konum
        const cx = (p0.x + p1.x + p2.x + p3.x) / 4;
        const cy = (p0.y + p1.y + p2.y + p3.y) / 4;
        state.posX = Math.round(cx - cw / 2);
        state.posY = Math.round(-(cy - ch / 2));

        // 2. Kenar Uzunlukları
        const topW = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        const botW = Math.hypot(p2.x - p3.x, p2.y - p3.y);
        const leftH = Math.hypot(p3.x - p0.x, p3.y - p0.y);
        const rightH = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        // 3. Eğim (Pitch): Üst genişlik ile alt genişlik oranı
        // Üst kenar dar ise zemin geriye doğru yatıyor demektir (negatif pitch).
        const widthRatio = topW / Math.max(1, botW);
        let solvedPitch = 0;
        if (widthRatio < 1) {
            solvedPitch = -Math.round((1 - widthRatio) * 115);
        } else {
            solvedPitch = Math.round((widthRatio - 1) * 115);
        }
        state.planePitch = Math.max(-85, Math.min(85, solvedPitch));

        // 4. Yatay Açı (Yaw): Sol yükseklik ile sağ yükseklik oranı
        // Sol kenar sağ kenardan daha uzunsa sağa doğru açı vardır (pozitif yaw).
        const heightRatio = leftH / Math.max(1, rightH);
        let solvedYaw = 0;
        if (heightRatio > 1) {
            solvedYaw = Math.round((heightRatio - 1) * 85);
        } else {
            solvedYaw = -Math.round((1 / heightRatio - 1) * 85);
        }
        state.planeYaw = Math.max(-80, Math.min(80, solvedYaw));

        // 5. Yatırma (Roll): Alt kenarın ufuk çizgisine göre açısı
        const rollRad = Math.atan2(p2.y - p3.y, p2.x - p3.x);
        state.planeRoll = Math.round(rollRad * (180 / Math.PI));

        // 6. Ölçek (Scale): Ortalama genişlik referansı
        const avgW = (topW + botW) / 2;
        state.planeScale = Math.max(0.25, Math.min(3.0, parseFloat((avgW / 360).toFixed(2))));

        updatePlaneTransform();
        updateContentTransform();
        syncControlsUI();
        requestRender();
    }

    /**
     * 8. Tuval Etkileşim Dinleyicileri (Sürükleme ve Döndürme)
     */
    function attachCanvasEvents(cvs) {
        let isPointerDown = false;

        cvs.addEventListener('pointerdown', (e) => {
            if (!state.active || state.cornerPinActive) return;
            isPointerDown = true;
            dragStart.x = e.clientX;
            dragStart.y = e.clientY;
            dragMode = (e.button === 2 || e.altKey || e.shiftKey) ? 'rotate' : 'move';
            cvs.setPointerCapture(e.pointerId);
            e.preventDefault();
        });

        cvs.addEventListener('pointermove', (e) => {
            if (!isPointerDown || !state.active || state.cornerPinActive) return;
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            dragStart.x = e.clientX;
            dragStart.y = e.clientY;

            if (dragMode === 'rotate') {
                state.planeYaw = Math.round((state.planeYaw + dx * 0.5) % 360);
                state.planePitch = Math.max(-90, Math.min(90, Math.round(state.planePitch - dy * 0.5)));
                updatePlaneTransform();
                syncControlsUI();
            } else {
                // Düzlem üzerinde taşıma
                state.posX += dx * (1 / state.planeScale);
                state.posY -= dy * (1 / state.planeScale);
                updateContentTransform();
            }
            requestRender();
        });

        const onPointerUp = (e) => {
            if (!isPointerDown) return;
            isPointerDown = false;
            try { cvs.releasePointerCapture(e.pointerId); } catch(ex){}
        };

        cvs.addEventListener('pointerup', onPointerUp);
        cvs.addEventListener('pointercancel', onPointerUp);

        cvs.addEventListener('contextmenu', (e) => {
            if (state.active) e.preventDefault();
        });

        cvs.addEventListener('wheel', (e) => {
            if (!state.active) return;
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.05 : 0.05;
            state.planeScale = Math.max(0.2, Math.min(3.0, parseFloat((state.planeScale + delta).toFixed(2))));
            updatePlaneTransform();
            syncControlsUI();
            requestRender();
        }, { passive: false });
    }

    /**
     * 9. Hazır Perspektif Şablonları (Presets)
     */
    function applyPreset(presetKey) {
        switch (presetKey) {
            case 'ground': // Arsa Zemin Düzlemi (Yatık)
                state.planePitch = -65;
                state.planeYaw = 15;
                state.planeRoll = 0;
                state.orientation = 'flat';
                break;
            case 'totem': // Arsa Tabelası / Totem (Zemine 90° Dik)
                state.planePitch = -65;
                state.planeYaw = 15;
                state.planeRoll = 0;
                state.orientation = 'standing';
                break;
            case 'left_wall': // Bina Sol Cephesi (Açılı Duvar)
                state.planePitch = 0;
                state.planeYaw = 35;
                state.planeRoll = 0;
                state.orientation = 'flat';
                break;
            case 'right_wall': // Bina Sağ Cephesi (Açılı Duvar)
                state.planePitch = 0;
                state.planeYaw = -35;
                state.planeRoll = 0;
                state.orientation = 'flat';
                break;
            case 'roof': // Eğimli Çatı Düzlemi
                state.planePitch = -35;
                state.planeYaw = 25;
                state.planeRoll = 10;
                state.orientation = 'flat';
                break;
            case 'straight': // Düz Ön Cephe
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
        requestRender();
    }

    /**
     * 10. Tuvale Fırınlama (Bake to Main 2D Canvas)
     */
    function bakeToCanvas() {
        if (!renderer || !canvasEl) return false;

        // Izgarayı ve Corner Pin tutamaçlarını geçici gizle
        const prevGrid = state.showPlaneGrid;
        const prevPinActive = state.cornerPinActive;
        if (gridHelper) gridHelper.visible = false;
        if (cornerPinOverlayEl) cornerPinOverlayEl.style.display = 'none';
        requestRender();

        const drawCanvas = document.getElementById('draw-layer') || document.getElementById('drawCanvas');
        if (drawCanvas && drawCanvas.getContext) {
            const ctx = drawCanvas.getContext('2d');
            ctx.drawImage(canvasEl, 0, 0, drawCanvas.width, drawCanvas.height);
            state.hasBaked = true;
        }

        // Durumları geri getir
        if (gridHelper) gridHelper.visible = prevGrid;
        if (cornerPinOverlayEl && prevPinActive) cornerPinOverlayEl.style.display = 'block';
        requestRender();

        if (window.showToast) {
            window.showToast('✅ 3D Ögeler Başarıyla Tuvale Fırınlandı!', 3000);
        } else {
            alert('3D Ögeler Başarıyla Tuvale Fırınlandı!');
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
        const lightAngle = panel.querySelector('#threeDLightAngle');
        const shadowOp = panel.querySelector('#threeDShadowOpacity');
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
        if (lightAngle) {
            lightAngle.value = state.lightAngle;
            panel.querySelector('#threeDLightVal').textContent = state.lightAngle + '°';
        }
        if (shadowOp) {
            shadowOp.value = Math.round(state.shadowOpacity * 100);
            panel.querySelector('#threeDShadowVal').textContent = Math.round(state.shadowOpacity * 100) + '%';
        }

        // Öge türü seçici butonları
        panel.querySelectorAll('.three-d-elem-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-type') === state.elementType);
        });

        // Duruş modu butonları
        const flatBtn = panel.querySelector('#threeDOrientFlatBtn');
        const standBtn = panel.querySelector('#threeDOrientStandBtn');
        if (flatBtn) flatBtn.classList.toggle('active', state.orientation === 'flat');
        if (standBtn) standBtn.classList.toggle('active', state.orientation === 'standing');

        // Corner pin butonu
        const pinBtn = panel.querySelector('#threeDCornerPinToggleBtn');
        if (pinBtn) pinBtn.classList.toggle('active', !!state.cornerPinActive);
    }

    /**
     * 12. Kayan Pro Kontrol Panelini Dinamik Oluşturma (Faz 2)
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
                <!-- 1. ÖGE TÜRÜ SEÇİMİ (FAZ 2) -->
                <div class="three-d-section">
                    <div class="three-d-section-title">📦 3D ÖGE TÜRÜ</div>
                    <div class="three-d-elem-grid">
                        <button class="three-d-elem-btn active" data-type="text"><i class="fas fa-font"></i> Metin</button>
                        <button class="three-d-elem-btn" data-type="pin"><i class="fas fa-map-marker-alt"></i> 3D İğne</button>
                        <button class="three-d-elem-btn" data-type="arrow"><i class="fas fa-arrow-up"></i> 3D Yön Oku</button>
                        <button class="three-d-elem-btn" data-type="combo_pin"><i class="fas fa-map-pin"></i> İğne + Metin</button>
                        <button class="three-d-elem-btn" data-type="combo_arrow"><i class="fas fa-location-arrow"></i> Ok + Metin</button>
                    </div>
                </div>

                <!-- 2. METİN & 3D KALINLIK -->
                <div class="three-d-section" id="threeDTextSection">
                    <div class="three-d-section-title">🔤 METİN & 3D KALINLIK</div>
                    <div class="three-d-row" style="margin-bottom:8px;">
                        <input type="text" id="threeDTextInput" class="three-d-input" placeholder="Yazı metni girin..." value="${state.text}">
                    </div>
                    <div class="three-d-row">
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

                <!-- 3. DÜZLEM VE AÇI AYARLARI (CORNER PIN ENTEGRE) -->
                <div class="three-d-section">
                    <div class="three-d-section-title">📐 DÜZLEM & AÇI (ARAZİ / DUVAR UYUMU)</div>
                    
                    <!-- 🎯 CORNER PIN BUTTON (FAZ 2) -->
                    <button id="threeDCornerPinToggleBtn" class="three-d-corner-pin-btn">
                        <i class="fas fa-crosshairs"></i> 4 Köşe ile Yüzeye Oturt
                    </button>

                    <div class="three-d-presets-grid" style="margin-top:8px;">
                        <button class="three-d-preset-btn" data-preset="ground"><i class="fas fa-mountain"></i> Arsa / Zemin</button>
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

                <!-- 4. İNCE AYARLAR (DÖNÜŞ & HAVADA SÜZÜLME) (FAZ 2) -->
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
                        <button id="threeDOrientFlatBtn" class="three-d-tab-btn active"><i class="fas fa-layer-group"></i> Zemine / Duvara Yatık</button>
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

                <!-- 6. GÜNEŞ IŞIĞI & GÖLGE -->
                <div class="three-d-section">
                    <div class="three-d-section-title">☀️ GÜNEŞ IŞIĞI & ZEMİN GÖLGESİ</div>
                    <div class="three-d-row">
                        <span class="three-d-label">Güneş Açısı:</span>
                        <input type="range" id="threeDLightAngle" class="three-d-range" min="0" max="360" value="${state.lightAngle}">
                        <span id="threeDLightVal" class="three-d-val">${state.lightAngle}°</span>
                    </div>
                    <div class="three-d-row">
                        <span class="three-d-label">Zemin Gölgesi:</span>
                        <input type="range" id="threeDShadowOpacity" class="three-d-range" min="0" max="100" value="${Math.round(state.shadowOpacity * 100)}">
                        <span id="threeDShadowVal" class="three-d-val">${Math.round(state.shadowOpacity * 100)}%</span>
                    </div>
                </div>

                <div style="font-size:10.5px; color:#64748b; line-height:1.4; padding:0 2px;">
                    💡 <em>İpucu: "4 Köşe ile Yüzeye Oturt" butonuna basarak arsanın 4 sınırını tutamaçlarla işaretleyebilirsiniz.</em>
                </div>
            </div>

            <!-- FOOTER AKSİYONLAR -->
            <div class="three-d-footer">
                <button id="threeDBakeBtn" class="three-d-primary-btn">
                    <i class="fas fa-magic"></i> Tuvale Fırınla / Aktar
                </button>
            </div>
        `;

        document.body.appendChild(panel);
        bindPanelEvents(panel);
        makeDraggable(panel, document.getElementById('threeDPanelHeader'));
        return panel;
    }

    /**
     * 13. Panel Kontrol Olay Dinleyicileri (Faz 2)
     */
    function bindPanelEvents(panel) {
        // Öge Türü Seçimi (Faz 2)
        panel.querySelectorAll('.three-d-elem-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                panel.querySelectorAll('.three-d-elem-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.elementType = btn.getAttribute('data-type');
                recreateContentMeshes();
            });
        });

        // Corner Pin Butonu (Faz 2)
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
            requestRender();
        });

        const yawInput = panel.querySelector('#threeDYawInput');
        yawInput.addEventListener('input', (e) => {
            state.planeYaw = parseFloat(e.target.value) || 0;
            panel.querySelector('#threeDYawVal').textContent = state.planeYaw + '°';
            updatePlaneTransform();
            if (state.cornerPinActive) updateCornerPinHandlesFromScene();
            requestRender();
        });

        const rollInput = panel.querySelector('#threeDRollInput');
        rollInput.addEventListener('input', (e) => {
            state.planeRoll = parseFloat(e.target.value) || 0;
            panel.querySelector('#threeDRollVal').textContent = state.planeRoll + '°';
            updatePlaneTransform();
            if (state.cornerPinActive) updateCornerPinHandlesFromScene();
            requestRender();
        });

        const scaleInput = panel.querySelector('#threeDScaleInput');
        scaleInput.addEventListener('input', (e) => {
            state.planeScale = (parseFloat(e.target.value) || 100) / 100;
            panel.querySelector('#threeDScaleVal').textContent = Math.round(state.planeScale * 100) + '%';
            updatePlaneTransform();
            if (state.cornerPinActive) updateCornerPinHandlesFromScene();
            requestRender();
        });

        const gridCheck = panel.querySelector('#threeDGridCheck');
        gridCheck.addEventListener('change', (e) => {
            state.showPlaneGrid = e.target.checked;
            if (gridHelper) gridHelper.visible = state.showPlaneGrid;
            requestRender();
        });

        // İnce Ayarlar: Düzlem İçi Dönüş & Yükseklik (Faz 2)
        const localRotInput = panel.querySelector('#threeDLocalRotInput');
        localRotInput.addEventListener('input', (e) => {
            state.planeLocalRot = parseFloat(e.target.value) || 0;
            panel.querySelector('#threeDLocalRotVal').textContent = state.planeLocalRot + '°';
            updateContentTransform();
            requestRender();
        });

        const elevInput = panel.querySelector('#threeDElevationInput');
        elevInput.addEventListener('input', (e) => {
            state.planeElevation = parseFloat(e.target.value) || 0;
            panel.querySelector('#threeDElevationVal').textContent = state.planeElevation + 'px';
            updateContentTransform();
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
            requestRender();
        });
        standBtn.addEventListener('click', () => {
            state.orientation = 'standing';
            syncControlsUI();
            updateContentTransform();
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

        // Işık ve Gölge
        const lightAngle = panel.querySelector('#threeDLightAngle');
        lightAngle.addEventListener('input', (e) => {
            state.lightAngle = parseFloat(e.target.value) || 45;
            panel.querySelector('#threeDLightVal').textContent = state.lightAngle + '°';
            updateLighting();
            requestRender();
        });

        const shadowOp = panel.querySelector('#threeDShadowOpacity');
        shadowOp.addEventListener('input', (e) => {
            state.shadowOpacity = (parseFloat(e.target.value) || 45) / 100;
            panel.querySelector('#threeDShadowVal').textContent = Math.round(state.shadowOpacity * 100) + '%';
            updatePlaneTransform();
            requestRender();
        });

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
        syncControlsUI();
        if (canvasEl) canvasEl.style.display = 'block';
    }

    function closeStudio() {
        const panel = document.getElementById('threeDStudioPanel');
        if (panel) panel.style.display = 'none';
        state.active = false;
        if (gridHelper) gridHelper.visible = false;
        if (cornerPinOverlayEl) cornerPinOverlayEl.style.display = 'none';
        state.cornerPinActive = false;
        requestRender();
    }

    function toggleVisibility(forceVisible) {
        if (!canvasEl) return;
        const isVisible = (forceVisible !== undefined) ? forceVisible : (canvasEl.style.display !== 'none');
        canvasEl.style.display = isVisible ? 'none' : 'block';
        if (cornerPinOverlayEl) cornerPinOverlayEl.style.display = (isVisible && state.cornerPinActive) ? 'block' : 'none';
        const btn = document.getElementById('threeDVisHeaderBtn');
        if (btn) {
            btn.innerHTML = isVisible ? '<i class="fas fa-eye-slash" style="color:#ef4444;"></i>' : '<i class="fas fa-eye"></i>';
        }
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
        state.frontColor = '#f59e0b';
        state.sideColor = '#92400e';
        state.orientation = 'flat';
        state.showPlaneGrid = true;
        state.shadowOpacity = 0.45;
        state.cornerPinActive = false;

        cornerPins[0] = { x: 0, y: 0 };
        if (cornerPinOverlayEl) cornerPinOverlayEl.style.display = 'none';

        updatePlaneTransform();
        recreateContentMeshes();
        syncControlsUI();
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
        toggleCornerPin: toggleCornerPinMode,
        getCanvas: () => canvasEl,
        isLayerActive: () => (canvasEl && canvasEl.style.display !== 'none'),

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
        setShadowOpacity: (o) => { state.shadowOpacity = (parseFloat(o) || 45) / 100; updatePlaneTransform(); requestRender(); },
        toggleGrid: (show) => { 
            state.showPlaneGrid = (show !== undefined) ? !!show : !state.showPlaneGrid;
            if (gridHelper) gridHelper.visible = state.showPlaneGrid;
            requestRender();
        }
    };

})(window);
