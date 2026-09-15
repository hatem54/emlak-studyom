/**
 * Emlak Stüdyom - 3D Düzlem & Metin Yerleştirici Motoru (ThreeDEngine)
 * 
 * After Effects 3D Planar Perspective mantığı ile fotoğraflar üzerine
 * arsa eğimine, bina cephesine veya duvar açısına uygun 3D kalınlıklı
 * kabartma metin, zemin gölgesi ve düzlem yerleştirme motoru.
 * 
 * Lisans: MIT (Three.js r128 tabanlı, %100 ticari kullanıma uygun)
 */

(function(window) {
    'use strict';

    // 🌟 MOTOR DURUMU VE AYARLARI
    const state = {
        loaded: false,
        active: false,
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
        planeElevation: 4,     // Düzlemden yukarı yükseklik (offset)
        planeScale: 1.0,
        showPlaneGrid: true,
        gridColor: '#00d2ff',
        lightAngle: 45,        // Güneş ışığı açısı (0° - 360°)
        lightIntensity: 1.3,
        shadowOpacity: 0.45,   // Zemin gölgesi koyuluğu
        posX: 0,               // Düzlem üzerinde X konumu
        posY: 0,               // Düzlem üzerinde Y konumu
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
    let dirLight = null;       // Güneş ışığı
    let ambLight = null;       // Çevre ışığı

    let loadedFont = null;
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let dragMode = 'move';     // 'move' | 'rotate'

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
        recreateTextMesh();

        // Render döngüsü
        startRenderLoop();
        return true;
    }

    /**
     * 3. 3D Kabartma Metin Geometrisini Oluşturma (TextGeometry)
     */
    function recreateTextMesh() {
        if (!loadedFont || !contentGroup) return;

        if (textMesh) {
            contentGroup.remove(textMesh);
            if (textMesh.geometry) textMesh.geometry.dispose();
            textMesh = null;
        }

        const textString = state.text.trim() || 'METİN';

        const textGeo = new THREE.TextGeometry(textString, {
            font: loadedFont,
            size: state.textSize,
            height: Math.max(1, state.depth), // Kalınlık (extrusion)
            curveSegments: 8,
            bevelEnabled: !!state.bevelEnabled,
            bevelThickness: state.bevelThickness,
            bevelSize: state.bevelSize,
            bevelOffset: 0,
            bevelSegments: 3
        });

        textGeo.computeBoundingBox();
        textGeo.center(); // Metni geometrik olarak merkezle

        // Ön yüz ve yan kalınlık materyalleri
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

        textMesh = new THREE.Mesh(textGeo, [frontMat, sideMat]);
        textMesh.castShadow = true;
        textMesh.receiveShadow = false;

        contentGroup.add(textMesh);
        updateContentTransform();
        requestRender();
    }

    /**
     * 4. Düzlem ve İçerik Dönüşüm Güncellemeleri
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
        if (!contentGroup || !textMesh) return;

        // Düzlem üzerinde konumlandırma
        contentGroup.position.set(state.posX, state.posY, state.planeElevation);

        // Duruş Modu: 'flat' (zemine/duvara yatık) vs 'standing' (zemine dik)
        if (state.orientation === 'standing') {
            textMesh.rotation.set(Math.PI / 2, 0, 0); // Zemin üzerinden 90° dik yüksel
        } else {
            textMesh.rotation.set(0, 0, 0);          // Düzlemle paralel yat
        }
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
     * 5. Render Ticker Döngüsü
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
     * 6. Tuval Etkileşim Dinleyicileri (Sürükleme ve Döndürme)
     */
    function attachCanvasEvents(cvs) {
        let isPointerDown = false;

        cvs.addEventListener('pointerdown', (e) => {
            if (!state.active) return;
            isPointerDown = true;
            dragStart.x = e.clientX;
            dragStart.y = e.clientY;
            dragMode = (e.button === 2 || e.altKey || e.shiftKey) ? 'rotate' : 'move';
            cvs.setPointerCapture(e.pointerId);
            e.preventDefault();
        });

        cvs.addEventListener('pointermove', (e) => {
            if (!isPointerDown || !state.active) return;
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

        // Sağ tıkla serbest açı döndürme için context menu'yü engelle
        cvs.addEventListener('contextmenu', (e) => {
            if (state.active) e.preventDefault();
        });

        // Fare tekerleğiyle ölçekleme (zoom)
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
     * 7. Hazır Perspektif Şablonları (Presets)
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
        requestRender();
    }

    /**
     * 8. Tuvale Fırınlama (Bake to Main 2D Canvas)
     */
    function bakeToCanvas() {
        if (!renderer || !canvasEl) return false;

        // Izgarayı geçici olarak gizle
        const prevGrid = state.showPlaneGrid;
        if (gridHelper) gridHelper.visible = false;
        requestRender();

        const drawCanvas = document.getElementById('draw-layer') || document.getElementById('drawCanvas');
        if (drawCanvas && drawCanvas.getContext) {
            const ctx = drawCanvas.getContext('2d');
            ctx.drawImage(canvasEl, 0, 0, drawCanvas.width, drawCanvas.height);
            state.hasBaked = true;
        }

        // Izgara durumunu geri getir
        if (gridHelper) gridHelper.visible = prevGrid;
        requestRender();

        if (window.showToast) {
            window.showToast('✅ 3D Metin Başarıyla Tuvale Fırınlandı!', 3000);
        } else {
            alert('3D Metin Başarıyla Tuvale Fırınlandı!');
        }
        return true;
    }

    /**
     * 9. Arayüz ve Kontrol Paneli Eşitlemesi
     */
    function syncControlsUI() {
        const textInput = document.getElementById('threeDTextInput');
        const sizeInput = document.getElementById('threeDSizeInput');
        const depthInput = document.getElementById('threeDDepthInput');
        const pitchInput = document.getElementById('threeDPitchInput');
        const yawInput = document.getElementById('threeDYawInput');
        const rollInput = document.getElementById('threeDRollInput');
        const scaleInput = document.getElementById('threeDScaleInput');
        const bevelCheck = document.getElementById('threeDBevelCheck');
        const frontColor = document.getElementById('threeDFrontColor');
        const sideColor = document.getElementById('threeDSideColor');
        const lightAngle = document.getElementById('threeDLightAngle');
        const shadowOp = document.getElementById('threeDShadowOpacity');

        if (textInput && textInput.value !== state.text) textInput.value = state.text;
        if (sizeInput) {
            sizeInput.value = state.textSize;
            const lbl = document.getElementById('threeDSizeVal');
            if (lbl) lbl.textContent = state.textSize + 'px';
        }
        if (depthInput) {
            depthInput.value = state.depth;
            const lbl = document.getElementById('threeDDepthVal');
            if (lbl) lbl.textContent = state.depth + 'px';
        }
        if (pitchInput) {
            pitchInput.value = state.planePitch;
            const lbl = document.getElementById('threeDPitchVal');
            if (lbl) lbl.textContent = state.planePitch + '°';
        }
        if (yawInput) {
            yawInput.value = state.planeYaw;
            const lbl = document.getElementById('threeDYawVal');
            if (lbl) lbl.textContent = state.planeYaw + '°';
        }
        if (rollInput) {
            rollInput.value = state.planeRoll;
            const lbl = document.getElementById('threeDRollVal');
            if (lbl) lbl.textContent = state.planeRoll + '°';
        }
        if (scaleInput) {
            scaleInput.value = Math.round(state.planeScale * 100);
            const lbl = document.getElementById('threeDScaleVal');
            if (lbl) lbl.textContent = Math.round(state.planeScale * 100) + '%';
        }
        if (bevelCheck) bevelCheck.checked = !!state.bevelEnabled;
        if (frontColor) frontColor.value = state.frontColor;
        if (sideColor) sideColor.value = state.sideColor;
        if (lightAngle) {
            lightAngle.value = state.lightAngle;
            const lbl = document.getElementById('threeDLightVal');
            if (lbl) lbl.textContent = state.lightAngle + '°';
        }
        if (shadowOp) {
            shadowOp.value = Math.round(state.shadowOpacity * 100);
            const lbl = document.getElementById('threeDShadowVal');
            if (lbl) lbl.textContent = Math.round(state.shadowOpacity * 100) + '%';
        }

        // Duruş modu butonları
        const flatBtn = document.getElementById('threeDOrientFlatBtn');
        const standBtn = document.getElementById('threeDOrientStandBtn');
        if (flatBtn) flatBtn.classList.toggle('active', state.orientation === 'flat');
        if (standBtn) standBtn.classList.toggle('active', state.orientation === 'standing');
    }

    /**
     * 10. Kayan Pro Kontrol Panelini Dinamik Oluşturma (Floating Studio Panel)
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
                <!-- 1. METİN & 3D KALINLIK -->
                <div class="three-d-section">
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
                            <input type="checkbox" id="threeDBevelCheck" checked> Harf Kenarlarında Pah (Bevel)
                        </label>
                    </div>
                </div>

                <!-- 2. DÜZLEM VE AÇI AYARLARI -->
                <div class="three-d-section">
                    <div class="three-d-section-title">📐 DÜZLEM & AÇI (ARAZİ / DUVAR UYUMU)</div>
                    <div class="three-d-presets-grid">
                        <button class="three-d-preset-btn" data-preset="ground"><i class="fas fa-mountain"></i> Arsa / Zemin</button>
                        <button class="three-d-preset-btn" data-preset="totem"><i class="fas fa-sign-hanging"></i> Arsa Totem (Dik)</button>
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

                <!-- 3. RENK & DURUŞ MODU -->
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

                <!-- 4. GÜNEŞ IŞIĞI & GÖLGE -->
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
                    💡 <em>İpucu: Tuval üzerinde sol tık ile metni taşıyabilir, sağ tık veya tekerlek ile 3D açıyı serbestçe çevirebilirsiniz.</em>
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
     * 11. Panel Kontrol Olay Dinleyicileri
     */
    function bindPanelEvents(panel) {
        // Metin ve Kalınlık
        const textInput = panel.querySelector('#threeDTextInput');
        textInput.addEventListener('input', (e) => {
            state.text = e.target.value;
            recreateTextMesh();
        });

        const sizeInput = panel.querySelector('#threeDSizeInput');
        sizeInput.addEventListener('input', (e) => {
            state.textSize = parseInt(e.target.value) || 36;
            panel.querySelector('#threeDSizeVal').textContent = state.textSize + 'px';
            recreateTextMesh();
        });

        const depthInput = panel.querySelector('#threeDDepthInput');
        depthInput.addEventListener('input', (e) => {
            state.depth = parseInt(e.target.value) || 16;
            panel.querySelector('#threeDDepthVal').textContent = state.depth + 'px';
            recreateTextMesh();
        });

        const bevelCheck = panel.querySelector('#threeDBevelCheck');
        bevelCheck.addEventListener('change', (e) => {
            state.bevelEnabled = e.target.checked;
            recreateTextMesh();
        });

        // Düzlem Açısı
        const pitchInput = panel.querySelector('#threeDPitchInput');
        pitchInput.addEventListener('input', (e) => {
            state.planePitch = parseFloat(e.target.value) || 0;
            panel.querySelector('#threeDPitchVal').textContent = state.planePitch + '°';
            updatePlaneTransform();
            requestRender();
        });

        const yawInput = panel.querySelector('#threeDYawInput');
        yawInput.addEventListener('input', (e) => {
            state.planeYaw = parseFloat(e.target.value) || 0;
            panel.querySelector('#threeDYawVal').textContent = state.planeYaw + '°';
            updatePlaneTransform();
            requestRender();
        });

        const rollInput = panel.querySelector('#threeDRollInput');
        rollInput.addEventListener('input', (e) => {
            state.planeRoll = parseFloat(e.target.value) || 0;
            panel.querySelector('#threeDRollVal').textContent = state.planeRoll + '°';
            updatePlaneTransform();
            requestRender();
        });

        const scaleInput = panel.querySelector('#threeDScaleInput');
        scaleInput.addEventListener('input', (e) => {
            state.planeScale = (parseFloat(e.target.value) || 100) / 100;
            panel.querySelector('#threeDScaleVal').textContent = Math.round(state.planeScale * 100) + '%';
            updatePlaneTransform();
            requestRender();
        });

        const gridCheck = panel.querySelector('#threeDGridCheck');
        gridCheck.addEventListener('change', (e) => {
            state.showPlaneGrid = e.target.checked;
            if (gridHelper) gridHelper.visible = state.showPlaneGrid;
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
            recreateTextMesh();
        });

        const sideColor = panel.querySelector('#threeDSideColor');
        sideColor.addEventListener('input', (e) => {
            state.sideColor = e.target.value;
            recreateTextMesh();
        });

        panel.querySelectorAll('.three-d-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                state.frontColor = chip.getAttribute('data-front');
                state.sideColor = chip.getAttribute('data-side');
                frontColor.value = state.frontColor;
                sideColor.value = state.sideColor;
                recreateTextMesh();
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
     * 12. Masaüstü Taşıma (Draggable Header)
     */
    function makeDraggable(el, handle) {
        let isDown = false;
        let startX, startY, initialLeft, initialTop;

        handle.addEventListener('pointerdown', (e) => {
            if (e.target.closest('button')) return; // Butonlara basıldığında taşıma
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
     * 13. Modalı Aç / Kapat
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
        // Izgarayı gizle, ama fırınlanmamışsa metni görünür tut
        if (gridHelper) gridHelper.visible = false;
        requestRender();
    }

    function toggleVisibility(forceVisible) {
        if (!canvasEl) return;
        const isVisible = (forceVisible !== undefined) ? forceVisible : (canvasEl.style.display !== 'none');
        canvasEl.style.display = isVisible ? 'none' : 'block';
        const btn = document.getElementById('threeDVisHeaderBtn');
        if (btn) {
            btn.innerHTML = isVisible ? '<i class="fas fa-eye-slash" style="color:#ef4444;"></i>' : '<i class="fas fa-eye"></i>';
        }
    }

    function resetToDefaults() {
        state.text = 'SATILIK 1.250 m²';
        state.textSize = 36;
        state.depth = 16;
        state.bevelEnabled = true;
        state.planePitch = -65;
        state.planeYaw = 15;
        state.planeRoll = 0;
        state.planeScale = 1.0;
        state.posX = 0;
        state.posY = 0;
        state.frontColor = '#f59e0b';
        state.sideColor = '#92400e';
        state.orientation = 'flat';
        state.showPlaneGrid = true;
        state.shadowOpacity = 0.45;

        updatePlaneTransform();
        recreateTextMesh();
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
        getCanvas: () => canvasEl,
        isLayerActive: () => (canvasEl && canvasEl.style.display !== 'none'),

        // Canlı Parametre Güncelleyiciler
        setText: (t) => { state.text = t; recreateTextMesh(); },
        setSize: (s) => { state.textSize = parseInt(s) || 36; recreateTextMesh(); },
        setDepth: (d) => { state.depth = parseInt(d) || 16; recreateTextMesh(); },
        setBevel: (b) => { state.bevelEnabled = !!b; recreateTextMesh(); },
        setFrontColor: (c) => { state.frontColor = c; recreateTextMesh(); },
        setSideColor: (c) => { state.sideColor = c; recreateTextMesh(); },
        setPitch: (p) => { state.planePitch = parseFloat(p) || 0; updatePlaneTransform(); requestRender(); },
        setYaw: (y) => { state.planeYaw = parseFloat(y) || 0; updatePlaneTransform(); requestRender(); },
        setRoll: (r) => { state.planeRoll = parseFloat(r) || 0; updatePlaneTransform(); requestRender(); },
        setScale: (s) => { state.planeScale = (parseFloat(s) || 100) / 100; updatePlaneTransform(); requestRender(); },
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
