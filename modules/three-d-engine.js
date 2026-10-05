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
        useGradient: false,    // Ön yüz rengi için uyumlu yumuşak stüdyo gradyanı
        neonFrontIntensity: 0, // 🌟 Ön yüz neon parlama şiddeti (0 = kapalı, 1 - 100%)
        neonEdgeGlow: false,   // 🌟 Harf köşe hatları neon kontur parlaması açık mı?
        neonEdgeIntensity: 0,  // 🌟 Köşe hatları parlama şiddeti (0 = kapalı, 1 - 100%)
        neonColor: '#00f0ff',  // 🌟 Neon ışık rengi (varsayılan elektrik cyan)
        neonPreset: 'fully-lit', // 🌟 Hazır neon efekti ('fully-lit' | 'fire' | 'vortex' | 'electric' | 'sparks' | 'rainbow')
        roughness: 0.35,       // Pürüzlülük
        metalness: 0.40,       // Metalik yansıma
        orientation: 'flat',   // 'flat' (zemine/duvara yatık) | 'standing' (zemine dik totem)
        groupEditMode: 'all',  // 'all' (birlikte düzenle) | 'base' (sadece zemin) | 'child' (sadece ön yüz)
        planePitch: 0,         // Eğim (-90° yatay zemin, 0° dikey duvar - varsayılan düz 0°)
        planeYaw: 0,           // Yatay dönüş (varsayılan düz 0°)
        planeRoll: 0,          // Yan yatırma
        planeElevation: 0,     // Düzlemden yukarı yükseklik (havada süzülme offseti)
        planeLocalRot: 0,      // Düzlem yüzeyinde kendi etrafında dönüş / Yatay Yaw (0° - 360°)
        itemPitch: 0,          // 3D Ögenin kendi öne/arkaya eğimi (-75° ile 75°)
        itemRoll: 0,           // 3D Ögenin kendi sağa/sola yatırma açısı (-180° ile 180°)
        planeScale: 1.0,
        scaleX: 1.0,
        heightScale: 1.0,
        showPlaneGrid: false,
        gridColor: '#00d2ff',
        sunPosX: 280,          // 3D Güneş X Konumu (Doğal Sağ-Ön stüdyo açısı: +280)
        sunPosY: 600,          // 3D Güneş Y Konumu (Üst Aydınlatma: +600)
        sunPosZ: 450,          // 3D Güneş Z Konumu (Ön Derinlik: +450)
        lightAngle: 45,        // Güneş ışığı açısı (0° - 360°)
        lightIntensity: 1.2,
        shadowOpacity: 0.20,   // Zemin gölgesi koyuluğu (Varsayılan %20 - açık, zarif ve şık)
        shadowSoftness: 2.5,   // Gölge yumuşaklığı (Doğal yumuşak geçiş blur radius)
        posX: 0,               // Düzlem üzerinde X konumu
        posY: 0,               // Düzlem üzerinde Y konumu
        posZ: 0,               // Düzlem üzerinde Z derinlik konumu (Grid ile birlikte hareket eder)
        cornerPinActive: false,// 4 Köşe Tutamaç modu aktif mi?
        gizmoActive: true,     // 🌟 Varsayılan 3D Gizmo Aktif (Öge seçilince/eklenince gizmo gelir, serbest taşıma için alttan kapatılabilir)
        gizmoScale: 1.0,       // Tutamaç boyutu ölçeği (0.6 - 2.0) -> Varsayılan %100 (zarif, estetik ve kompakt)
        gizmoAutoFit: true,    // Nesne ve metin boyutuna göre akıllı orantılama
        gizmoDistance: 75,     // Eksen açılma mesafesi (40px - 200px) -> Varsayılan 75px (ögeye yakın ve dengeli)
        gizmoShowLabels: false,// Eksen rozet metinleri (false: şık dairesel X,Y,Z,⟳ rozetleri | true: metinli mikro-kapsül)
        gizmoShowHud: true,    // Canlı derece HUD bildirimini göster
        gizmoOpacity: 1.0,     // Gizmo opaklığı (0.3 - 1.0)
        gizmoSettingsOpen: false, // Sol panel ayar kutusu açık mı?
        selected: true,        // 3D öge tuvalde seçili mi? (Görsel serbestken false olur)
        dockTarget: 'item',    // 'item' (3D Öge) | 'sun' (3D Güneş)
        hasBaked: false,
        // 🌟 3D ROZET & İKON DURUMU
        badgeBgColor: '#0f172a',      // Rozet taban zemin rengi
        badgeSubtext: '',             // Rozet alt başlık (Slogan)
        selectedIconId: 'ev-14',      // Seçili ikon ID'si (window.ICON_LIBRARY)
        customIconSvg: null,          // Tuvalden aktarılan özel SVG içeriği
        sourceSvg: null,              // 🌟 Birebir 3D'ye aktarılan orijinal SVG içeriği
        sourceItemName: '',           // Orijinal ögenin adı (örn. Klasik Kırmızı)
        // 🌟 3D ALT METİN / YAZI AYARLARI
        show3DText: false,            // İkon veya rozet altında 3D metin oluşturulsun mu?
        text3DOffset: -25,            // İkon ile yazı arasındaki dikey aralık (px)
        text3DXOffset: 0,             // 3D yazı sağa / sola kaydırma (px)
        text3DSize: 22,               // 3D yazı boyutu
        text3DDepth: 8,               // 3D yazı kalınlığı (derinlik)
        text3DColor: '#ffffff',       // 3D yazı rengi
        text3DMode: 'together',       // 'together' (birlikte yönlendir) | 'separate' (ayrı yönlendir)
        text3DPitch: 0,               // Ayrı yazı eğimi (-90° ile 90°)
        text3DYaw: 0,                 // Ayrı yazı açısı (-180° ile 180°)
        text3DRoll: 0,                // Ayrı yazı yatırma (-180° ile 180°)
        // 🌟 3D ROZET ÖGE VE KABARTMA AYARLARI
        badgeElementMode: 'emboss',   // 'emboss' (3D Kabartma Heykelcik) | 'flat' (Yassı Resim Baskı)
        embossDepth: 12,              // Kabartma derinliği (2 - 40px)
        embossScale: 85,              // Öge boyutu / ölçeği (30% - 150%)
        embossOffsetY: 0,             // Dikey konum kaydırma (-100px - +100px)
        embossOffsetX: 0,             // Yatay konum kaydırma (-120px - +120px)
        badgeSideColor: '#cbd5e1'     // Rozet yan/kenarlık rengi (platin varsayılan)
    };

    // 🌟 ÇOKLU 3D ÖGE KOLEKSİYONU (Unlimited Multi-Element System)
    const elements = [];
    let activeElementId = null;
    let isBatchRestoring = false;

    function createDefaultElement(overrides = {}) {
        const id = overrides.id || ('elem_3d_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
        const name = overrides.name || overrides.sourceItemName || ('3D Öge ' + (elements.length + 1));
        const elemType = overrides.elementType || 'text';
        let defaultText = '';
        if (elemType === 'text') {
            defaultText = '3D METİN';
        }
        return {
            id: id,
            name: name,
            layerIndex: overrides.layerIndex !== undefined ? overrides.layerIndex : elements.length,
            visible: overrides.visible !== undefined ? !!overrides.visible : true,
            locked: overrides.locked !== undefined ? !!overrides.locked : false,
            elementType: elemType,
            text: overrides.text !== undefined ? overrides.text : defaultText,
            textSize: overrides.textSize || 36,
            depth: overrides.depth !== undefined ? overrides.depth : 16,
            bevelEnabled: overrides.bevelEnabled !== undefined ? !!overrides.bevelEnabled : true,
            bevelThickness: overrides.bevelThickness !== undefined ? overrides.bevelThickness : 2,
            bevelSize: overrides.bevelSize !== undefined ? overrides.bevelSize : 1.5,
            frontColor: overrides.frontColor || '#f59e0b',
            sideColor: overrides.sideColor || '#92400e',
            useGradient: overrides.useGradient !== undefined ? !!overrides.useGradient : false,
            neonFrontIntensity: overrides.neonFrontIntensity !== undefined ? overrides.neonFrontIntensity : 0,
            neonEdgeGlow: overrides.neonEdgeGlow !== undefined ? !!overrides.neonEdgeGlow : false,
            neonEdgeIntensity: overrides.neonEdgeIntensity !== undefined ? overrides.neonEdgeIntensity : 0,
            neonColor: overrides.neonColor || '#00f0ff',
            neonPreset: overrides.neonPreset || 'fully-lit',
            roughness: overrides.roughness !== undefined ? overrides.roughness : 0.35,
            metalness: overrides.metalness !== undefined ? overrides.metalness : 0.40,
            orientation: overrides.orientation || 'flat',
            planePitch: overrides.planePitch !== undefined ? overrides.planePitch : 0,
            planeYaw: overrides.planeYaw !== undefined ? overrides.planeYaw : 0,
            planeRoll: overrides.planeRoll !== undefined ? overrides.planeRoll : 0,
            planeElevation: overrides.planeElevation !== undefined ? overrides.planeElevation : 0,
            planeLocalRot: overrides.planeLocalRot !== undefined ? overrides.planeLocalRot : 0,
            itemPitch: overrides.itemPitch !== undefined ? overrides.itemPitch : 0,
            itemRoll: overrides.itemRoll !== undefined ? overrides.itemRoll : 0,
            planeScale: overrides.planeScale !== undefined ? overrides.planeScale : 1.0,
            scaleX: overrides.scaleX !== undefined ? overrides.scaleX : 1.0,
            scaleY: overrides.scaleY !== undefined ? overrides.scaleY : 1.0,
            scaleZ: overrides.scaleZ !== undefined ? overrides.scaleZ : 1.0,
            heightScale: overrides.heightScale !== undefined ? overrides.heightScale : 1.0,
            shadowOpacity: overrides.shadowOpacity !== undefined ? overrides.shadowOpacity : 0.20,
            shadowSoftness: overrides.shadowSoftness !== undefined ? overrides.shadowSoftness : 2.5,
            posX: overrides.posX !== undefined ? overrides.posX : 0,
            posY: overrides.posY !== undefined ? overrides.posY : 0,
            posZ: overrides.posZ !== undefined ? overrides.posZ : 0,
            badgeBgColor: overrides.badgeBgColor || '#0f172a',
            badgeSubtext: overrides.badgeSubtext || '',
            selectedIconId: overrides.selectedIconId || 'ev-14',
            customIconSvg: overrides.customIconSvg || null,
            sourceSvg: overrides.sourceSvg || null,
            sourceSvgOriginal: overrides.sourceSvgOriginal || overrides.sourceSvg || null,
            sourceItemName: overrides.sourceItemName || name,
            shapeMode: overrides.shapeMode || 'auto',
            cachedSilhouette: overrides.cachedSilhouette || null,
            isExactSilhouette: overrides.isExactSilhouette !== undefined ? !!overrides.isExactSilhouette : false,
            isRound: overrides.isRound !== undefined ? !!overrides.isRound : false,
            isAutoDefault: !!overrides.isAutoDefault,
            // 🌟 3D Alt Metin Özellikleri
            show3DText: overrides.show3DText !== undefined ? !!overrides.show3DText : false,
            text3DOffset: overrides.text3DOffset !== undefined ? overrides.text3DOffset : -25,
            text3DXOffset: overrides.text3DXOffset !== undefined ? overrides.text3DXOffset : 0,
            text3DSize: overrides.text3DSize !== undefined ? overrides.text3DSize : 22,
            text3DDepth: overrides.text3DDepth !== undefined ? overrides.text3DDepth : 8,
            text3DColor: overrides.text3DColor || overrides.frontColor || '#ffffff',
            text3DMode: overrides.text3DMode || 'together',
            text3DPitch: overrides.text3DPitch !== undefined ? overrides.text3DPitch : 0,
            text3DYaw: overrides.text3DYaw !== undefined ? overrides.text3DYaw : 0,
            text3DRoll: overrides.text3DRoll !== undefined ? overrides.text3DRoll : 0,
            estateItemId: overrides.estateItemId || null,
            isBaseAligned: overrides.isBaseAligned !== undefined ? !!overrides.isBaseAligned : false,
            isFence: overrides.isFence !== undefined ? !!overrides.isFence : false,
            // 🌟 3D Rozet Öge ve Kabartma Özellikleri
            badgeElementMode: overrides.badgeElementMode || 'emboss',
            embossDepth: overrides.embossDepth !== undefined ? overrides.embossDepth : 12,
            embossScale: overrides.embossScale !== undefined ? overrides.embossScale : 85,
            embossOffsetY: overrides.embossOffsetY !== undefined ? overrides.embossOffsetY : 0,
            embossOffsetX: overrides.embossOffsetX !== undefined ? overrides.embossOffsetX : 0,
            badgeSideColor: overrides.badgeSideColor || '#cbd5e1',
            // Three.js groups & meshes
            planeGroup: null,
            contentGroup: null,
            shadowPlane: null,
            textMesh: null,
            iconMesh: null,
            badgeMesh: null,
            reliefMesh: null
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
        state.useGradient = !!el.useGradient;
        state.neonFrontIntensity = el.neonFrontIntensity !== undefined ? el.neonFrontIntensity : 0;
        state.neonEdgeGlow = el.neonEdgeGlow !== undefined ? !!el.neonEdgeGlow : false;
        state.neonEdgeIntensity = el.neonEdgeIntensity !== undefined ? el.neonEdgeIntensity : 0;
        state.neonColor = el.neonColor || '#00f0ff';
        state.neonPreset = el.neonPreset || 'fully-lit';
        state.roughness = el.roughness;
        state.metalness = el.metalness;
        state.orientation = el.orientation;
        state.planePitch = el.planePitch;
        state.planeYaw = el.planeYaw;
        state.planeRoll = el.planeRoll;
        state.planeElevation = el.planeElevation;
        state.planeLocalRot = el.planeLocalRot || 0;
        state.itemPitch = el.itemPitch || 0;
        state.itemRoll = el.itemRoll || 0;
        state.planeScale = el.planeScale;
        state.scaleX = el.scaleX !== undefined ? el.scaleX : 1.0;
        state.heightScale = el.heightScale !== undefined ? el.heightScale : 1.0;
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
        state.shapeMode = el.shapeMode || 'auto';
        state.cachedSilhouette = el.cachedSilhouette || null;
        state.isExactSilhouette = !!el.isExactSilhouette;
        // 🌟 3D Alt Metin / Yazı Senkronizasyonu
        state.show3DText = el.show3DText !== undefined ? !!el.show3DText : false;
        state.text3DOffset = el.text3DOffset !== undefined ? el.text3DOffset : -25;
        state.text3DXOffset = el.text3DXOffset !== undefined ? el.text3DXOffset : 0;
        state.text3DSize = el.text3DSize !== undefined ? el.text3DSize : 22;
        state.text3DDepth = el.text3DDepth !== undefined ? el.text3DDepth : 8;
        state.text3DColor = el.text3DColor || el.frontColor || '#ffffff';
        state.text3DMode = el.text3DMode || 'together';
        state.text3DPitch = el.text3DPitch !== undefined ? el.text3DPitch : 0;
        state.text3DYaw = el.text3DYaw !== undefined ? el.text3DYaw : 0;
        state.text3DRoll = el.text3DRoll !== undefined ? el.text3DRoll : 0;
        // 🌟 3D Rozet Öge ve Kabartma Senkronizasyonu
        state.badgeElementMode = el.badgeElementMode || 'emboss';
        state.embossDepth = el.embossDepth !== undefined ? el.embossDepth : 12;
        state.embossScale = el.embossScale !== undefined ? el.embossScale : 85;
        state.embossOffsetY = el.embossOffsetY !== undefined ? el.embossOffsetY : 0;
        state.embossOffsetX = el.embossOffsetX !== undefined ? el.embossOffsetX : 0;
        state.badgeSideColor = el.badgeSideColor || '#cbd5e1';

        planeGroup = el.planeGroup;
        contentGroup = el.contentGroup;
        shadowPlane = el.shadowPlane;
        textMesh = el.textMesh;
        iconMesh = el.iconMesh;
        badgeMesh = el.badgeMesh;
    }

    function syncActiveElementFromState() {
        if (isBatchRestoring) return;
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
        el.useGradient = !!state.useGradient;
        el.neonFrontIntensity = state.neonFrontIntensity !== undefined ? state.neonFrontIntensity : 0;
        el.neonEdgeGlow = state.neonEdgeGlow !== undefined ? !!state.neonEdgeGlow : false;
        el.neonEdgeIntensity = state.neonEdgeIntensity !== undefined ? state.neonEdgeIntensity : 0;
        el.neonColor = state.neonColor || '#00f0ff';
        el.neonPreset = state.neonPreset || 'fully-lit';
        el.roughness = state.roughness;
        el.metalness = state.metalness;
        el.orientation = state.orientation;
        el.planePitch = state.planePitch;
        el.planeYaw = state.planeYaw;
        el.planeRoll = state.planeRoll;
        el.planeElevation = state.planeElevation;
        el.planeLocalRot = state.planeLocalRot || 0;
        el.itemPitch = state.itemPitch || 0;
        el.itemRoll = state.itemRoll || 0;
        el.planeScale = state.planeScale;
        el.heightScale = state.heightScale !== undefined ? state.heightScale : 1.0;
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
        if (state.shapeMode !== undefined) el.shapeMode = state.shapeMode;
        if (state.cachedSilhouette !== undefined) el.cachedSilhouette = state.cachedSilhouette;
        if (state.isExactSilhouette !== undefined) el.isExactSilhouette = state.isExactSilhouette;
        // 🌟 3D Alt Metin / Yazı
        el.show3DText = state.show3DText !== undefined ? !!state.show3DText : false;
        el.text3DOffset = state.text3DOffset !== undefined ? state.text3DOffset : -25;
        el.text3DXOffset = state.text3DXOffset !== undefined ? state.text3DXOffset : 0;
        el.text3DSize = state.text3DSize !== undefined ? state.text3DSize : 22;
        el.text3DDepth = state.text3DDepth !== undefined ? state.text3DDepth : 8;
        el.text3DColor = state.text3DColor || state.frontColor || '#ffffff';
        el.text3DMode = state.text3DMode || 'together';
        el.text3DPitch = state.text3DPitch !== undefined ? state.text3DPitch : 0;
        el.text3DYaw = state.text3DYaw !== undefined ? state.text3DYaw : 0;
        el.text3DRoll = state.text3DRoll !== undefined ? state.text3DRoll : 0;
        // 🌟 3D Rozet Öge ve Kabartma
        el.badgeElementMode = state.badgeElementMode || 'emboss';
        el.embossDepth = state.embossDepth !== undefined ? state.embossDepth : 12;
        el.embossScale = state.embossScale !== undefined ? state.embossScale : 85;
        el.embossOffsetY = state.embossOffsetY !== undefined ? state.embossOffsetY : 0;
        el.embossOffsetX = state.embossOffsetX !== undefined ? state.embossOffsetX : 0;
        el.badgeSideColor = state.badgeSideColor || '#cbd5e1';
    }

    function getElementLocalBoundingBox(el) {
        if (!el) return new THREE.Box3();
        if (el._localBoundingBox && !el._localBoundingBox.isEmpty()) {
            return el._localBoundingBox;
        }
        const box = new THREE.Box3();
        if (el.contentGroup) {
            el.contentGroup.traverse(ch => {
                if (ch.isMesh && ch.geometry && ch !== el.shadowPlane && ch.type !== 'GridHelper') {
                    if (!ch.geometry.boundingBox) ch.geometry.computeBoundingBox();
                    if (ch.geometry.boundingBox) {
                        const b = ch.geometry.boundingBox.clone();
                        let cur = ch;
                        const m = new THREE.Matrix4();
                        while (cur && cur !== el.contentGroup) {
                            m.premultiply(cur.matrix);
                            cur = cur.parent;
                        }
                        b.applyMatrix4(m);
                        box.union(b);
                    }
                }
            });
        }
        if (box.isEmpty()) {
            const m = el.badgeMesh || el.iconMesh || el.textMesh || el.neonPlaneMesh;
            if (m && m.geometry) {
                if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
                if (m.geometry.boundingBox) box.copy(m.geometry.boundingBox);
            }
        }
        if (box.isEmpty()) {
            box.min.set(-50, -50, -10);
            box.max.set(50, 50, 10);
        }
        el._localBoundingBox = box;
        return box;
    }

    function getElementEstimatedDimensions(el) {
        if (!el) return { w: 200, h: 80 };
        try {
            const lBox = getElementLocalBoundingBox(el);
            if (lBox && !lBox.isEmpty()) {
                const scale = (el.planeScale || 1.0);
                const w = Math.max(40, (lBox.max.x - lBox.min.x) * scale);
                const h = Math.max(30, (lBox.max.y - lBox.min.y) * scale);
                return { w: Math.round(w), h: Math.round(h) };
            }
        } catch(e){}
        return { w: 200, h: 80 };
    }

    function getGlobalShadowPlane() {
        if (!scene || !window.THREE) return null;
        if (!globalShadowPlane) {
            const shadowGeo = new THREE.PlaneGeometry(25000, 25000);
            const shadowMat = new THREE.ShadowMaterial({
                opacity: (state && state.shadowOpacity !== undefined) ? state.shadowOpacity : 0.20,
                side: THREE.FrontSide,
                transparent: true,
                depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: 1,
                polygonOffsetUnits: 1
            });
            globalShadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
            globalShadowPlane.name = 'globalGroundShadowPlane';
            globalShadowPlane.receiveShadow = true;
            globalShadowPlane.position.set(0, 0, -1);
            globalShadowPlane.rotation.set(0, 0, 0);
            globalShadowPlane.renderOrder = 0;
            scene.add(globalShadowPlane);
        }
        return globalShadowPlane;
    }

    function updateGlobalShadowPlaneZ() {
        if (!globalShadowPlane) return;
        let minZ = 0;
        elements.forEach(e => {
            if (e && e.visible !== false) {
                if (typeof e.posZ === 'number' && e.posZ < minZ) minZ = e.posZ;
            }
        });
        globalShadowPlane.position.z = minZ - 1.0;
        globalShadowPlane.visible = elements.some(e => e && e.visible !== false);
    }

    function updateShadowPlaneGeometry(el) {
        if (!el || !window.THREE) return;
        if (el.shadowPlane) el.shadowPlane.visible = false;
        updateGlobalShadowPlaneZ();
    }

    function initElementThreeObjects(el) {
        if (!scene || !window.THREE) return;
        if (!el.planeGroup) {
            el.planeGroup = new THREE.Group();
            scene.add(el.planeGroup);

            // 🛡️ Bıçak kesiği ve çakışan koyu kutu hatasını önlemek için tek parça birleşik zemin düzlemi kullanılır
            getGlobalShadowPlane();

            // Eski bağımlılıkları korumak için el.shadowPlane varlığı sürdürülür ancak gizli tutulur
            const shadowPlaneGeo = new THREE.PlaneGeometry(10, 10);
            const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0, transparent: true });
            el.shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
            el.shadowPlane.visible = false;
            el.planeGroup.add(el.shadowPlane);

            el.contentGroup = new THREE.Group();
            el.contentGroup.renderOrder = 1;
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
            gridHelper.position.set(0, 0, 0);
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
    let globalShadowPlane = null; // 🌟 Sahne geneli kesintisiz birleşik zemin gölge düzlemi (bıçak kesiği ve çakışma önleyici)
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
    let rawDragPos = { x: 0, y: 0 };
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
        yz: { x: 0, y: 1 },
        xy: { x: 1, y: 0 }
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

        // 1.5. GLTF Loader yükle (Önce yerel assets/vendor, sonra CDN fallback)
        if (!THREE.GLTFLoader) {
            try {
                await loadScript('./assets/vendor/GLTFLoader.js');
            } catch (err) {
                try {
                    await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js');
                } catch (e) {}
            }
        }

        // 2. 3D Font yükle
        if (typeof onProgress === 'function') onProgress('3D Font Hazırlanıyor...');
        
        // 🌟 2.1. Önceden yüklenmiş / gömülü font kontrolü (0ms, Sıfır CORS, Çevrimdışı Garantili)
        if (!loadedFont && window.THREE_FONT_HELVETIKER_BOLD) {
            try {
                loadedFont = new THREE.FontLoader().parse(window.THREE_FONT_HELVETIKER_BOLD);
            } catch (e) {
                console.warn('[ThreeDEngine] Önceden yüklenmiş font çözümlenemedi:', e);
            }
        }

        // 🌟 2.2. Yerel script üzerinden yükleme (file:/// protokolünde CORS hatası vermez)
        if (!loadedFont) {
            try {
                await loadScript('./assets/fonts/helvetiker_bold.js');
                if (window.THREE_FONT_HELVETIKER_BOLD) {
                    loadedFont = new THREE.FontLoader().parse(window.THREE_FONT_HELVETIKER_BOLD);
                }
            } catch (e) {
                console.warn('[ThreeDEngine] helvetiker_bold.js yüklenemedi, json deneniyor...', e);
            }
        }

        // 🌟 2.3. Doğrudan JSON / CDN yükleyici (Fallback)
        if (!loadedFont) {
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
        }

        state.loaded = true;
        return true;
    }

    /**
     * 3D Font için Türkçe ve Özel Karakter Temizleyici / Güvenli Harf Eşleyici
     */
    function sanitizeTextForFont(text, font) {
        if (!text || typeof text !== 'string') return '';
        const map = {
            'İ': 'I', 'ı': 'i',
            'Ş': 'S', 'ş': 's',
            'Ğ': 'G', 'ğ': 'g',
            'Ü': 'U', 'ü': 'u',
            'Ö': 'O', 'ö': 'o',
            'Ç': 'C', 'ç': 'c',
            '₺': 'TL'
        };
        let out = '';
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const rep = (map[ch] !== undefined) ? map[ch] : ch;
            if (font && font.data && font.data.glyphs) {
                if (font.data.glyphs[rep]) {
                    out += rep;
                } else if (font.data.glyphs[rep.toUpperCase()]) {
                    out += rep.toUpperCase();
                } else {
                    out += ' ';
                }
            } else {
                out += rep;
            }
        }
        return out.trim();
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
    function initScene(options = {}) {
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
            dirLight.shadow.camera.near = 50;
            dirLight.shadow.camera.far = 4500;
            const d = 900;
            dirLight.shadow.camera.left = -d;
            dirLight.shadow.camera.right = d;
            dirLight.shadow.camera.top = d;
            dirLight.shadow.camera.bottom = -d;
            dirLight.shadow.bias = -0.00002;
            dirLight.shadow.normalBias = 0.05;
            dirLight.shadow.radius = state.shadowSoftness || 2.5;
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
            sunRayLine.visible = false;
            scene.add(sunRayLine);

            // Ortak 3D Izgara (Grid Helper)
            createOrUpdateGridHelper();
        } else if (camera) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }

        // Sahnedeki tüm kayıtlı ögelerin Three.js nesnelerini hazırla
        elements.forEach(el => initElementThreeObjects(el));

        if (elements.length === 0 && options.createDefault !== false) {
            const defEl = createDefaultElement({ isAutoDefault: true });
            initElementThreeObjects(defEl);
            elements.push(defEl);
            setActiveElement(defEl);
            recreateContentMeshes(defEl);
        } else if (elements.length > 0) {
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
     * 2.05 3D Referans Izgara Boyutlandırma (Ekrana Rahat Sığma & Taşmayı Önleme)
     */
    function createOrUpdateGridHelper() {
        if (typeof THREE === 'undefined' || !scene) return null;
        const container = document.getElementById('canvas-container');
        const w = container ? (container.offsetWidth || 1920) : 1920;
        const h = container ? (container.offsetHeight || 1080) : 1080;
        const aspect = (w > 0 && h > 0) ? (w / h) : (16 / 9);
        const visibleH = 704;
        const visibleW = visibleH * aspect;
        const minDim = Math.min(visibleH, visibleW);

        // 🌟 3D Referans Izgarasının Ekrana Rahat Sığması ve Üst/Alt Taşmaları Önlemek İçin:
        // Standart görünür yükseklik 704 birimdir. 500 birim boyut ve 10 bölme (50px hücreler),
        // ızgaranın tuvalin üst ve alt sınırları içinde ~102 birim nefes payıyla rahatça kalmasını sağlar.
        let targetSize = 500;
        if (minDim < 550) {
            targetSize = Math.max(300, Math.floor((minDim * 0.72) / 50) * 50);
        }
        let subdivisions = Math.round(targetSize / 50);
        if (subdivisions % 2 !== 0) subdivisions += 1;

        if (gridHelper && gridHelper.geometry) {
            if (gridHelper.userData && gridHelper.userData.gridSize === targetSize) {
                return gridHelper;
            }
        }

        const wasVisible = gridHelper ? gridHelper.visible : false;
        const parent = gridHelper ? gridHelper.parent : null;
        const pos = gridHelper ? gridHelper.position.clone() : new THREE.Vector3(0, 0, 0);

        if (gridHelper) {
            if (gridHelper.parent) gridHelper.parent.remove(gridHelper);
            if (gridHelper.geometry) gridHelper.geometry.dispose();
            if (gridHelper.material) {
                if (Array.isArray(gridHelper.material)) gridHelper.material.forEach(m => m.dispose());
                else gridHelper.material.dispose();
            }
        }

        gridHelper = new THREE.GridHelper(targetSize, subdivisions, 0x00d2ff, 0x334155);
        gridHelper.rotation.x = Math.PI / 2; // XY düzlemine yatır
        gridHelper.position.copy(pos);
        gridHelper.visible = wasVisible;
        gridHelper.userData = { gridSize: targetSize, subdivisions: subdivisions };

        if (parent) {
            parent.add(gridHelper);
        }
        return gridHelper;
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

        if (camera && scene && typeof THREE !== 'undefined') {
            createOrUpdateGridHelper();
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
        if (typeof iconId === 'string' && iconId.trim().startsWith('<svg')) {
            return iconId;
        }
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
     * 🌟 Birebir 3D Öge: SVG Metnini Güncelleme (Ana Başlık & Alt Başlık)
     */
    function updateSvgText(svgStr, newText, newSubtext) {
        if (!svgStr) return svgStr;
        try {
            const safeSvg = ensureSvgXmlns(svgStr);
            const parser = new DOMParser();
            const doc = parser.parseFromString(safeSvg, 'image/svg+xml');
            const textNodes = Array.from(doc.querySelectorAll('text'));
            if (textNodes.length > 0) {
                textNodes.sort((a, b) => {
                    const fsA = parseFloat(a.getAttribute('font-size')) || 0;
                    const fsB = parseFloat(b.getAttribute('font-size')) || 0;
                    return fsB - fsA;
                });
                if (typeof newText === 'string' && newText.trim()) {
                    textNodes[0].textContent = newText;
                }
                if (typeof newSubtext === 'string' && newSubtext.trim() && textNodes.length > 1) {
                    textNodes[1].textContent = newSubtext;
                }
                return new XMLSerializer().serializeToString(doc.documentElement);
            }
        } catch(e){}
        return svgStr;
    }

    /**
     * 🌟 Birebir 3D Öge: Ramer-Douglas-Peucker (RDP) Poligon Basitleştirici
     */
    function douglasPeucker(points, epsilon) {
        if (!points || points.length <= 2) return points || [];
        let dmax = 0;
        let index = 0;
        const end = points.length - 1;

        for (let i = 1; i < end; i++) {
            const d = perpendicularDistance(points[i], points[0], points[end]);
            if (d > dmax) {
                index = i;
                dmax = d;
            }
        }

        if (dmax > epsilon) {
            const rec1 = douglasPeucker(points.slice(0, index + 1), epsilon);
            const rec2 = douglasPeucker(points.slice(index), epsilon);
            return rec1.slice(0, rec1.length - 1).concat(rec2);
        } else {
            return [points[0], points[end]];
        }
    }

    function perpendicularDistance(p, p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        if (dx === 0 && dy === 0) return Math.hypot(p.x - p1.x, p.y - p1.y);
        const num = Math.abs(dy * p.x - dx * p.y + p2.x * p1.y - p2.y * p1.x);
        const den = Math.hypot(dx, dy);
        return num / den;
    }

    /**
     * 🌟 Birebir 3D Öge: Moore-Neighbor 8-Yönlü Dış Sınır İzleyici
     */
    function traceMooreNeighborContour(grid, width, height, startX = -1, startY = -1) {
        const dx = [0, 1, 1, 1, 0, -1, -1, -1];
        const dy = [-1, -1, 0, 1, 1, 1, 0, -1];

        let sx = startX, sy = startY;
        if (sx < 0 || sy < 0 || !grid[sy * width + sx]) {
            sx = -1; sy = -1;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (grid[y * width + x]) {
                        sx = x;
                        sy = y;
                        break;
                    }
                }
                if (sx !== -1) break;
            }
        }

        if (sx === -1) return [];

        const contour = [];
        let cx = sx;
        let cy = sy;
        let enterDir = 6;

        contour.push({ x: cx, y: cy });

        const maxSteps = width * height;
        let steps = 0;

        while (steps++ < maxSteps) {
            let foundNext = false;
            let nextX = -1, nextY = -1;
            let nextDir = -1;

            for (let i = 0; i < 8; i++) {
                const dir = (enterDir + i) % 8;
                const nx = cx + dx[dir];
                const ny = cy + dy[dir];

                if (nx >= 0 && nx < width && ny >= 0 && ny < height && grid[ny * width + nx]) {
                    nextX = nx;
                    nextY = ny;
                    nextDir = dir;
                    foundNext = true;
                    break;
                }
            }

            if (!foundNext) break;

            enterDir = (nextDir + 5) % 8;
            cx = nextX;
            cy = nextY;

            if (cx === sx && cy === sy) break;

            contour.push({ x: cx, y: cy });
        }

        return contour;
    }

    const svgSilhouetteCache = new Map();

    /**
     * SVG ViewBox ve Doğal Boyut Çözümleyici
     * SVG'nin en-boy oranını ve hedef 3D boyutlarını kesin olarak hesaplar.
     */
    function parseSvgDimensions(rawSvg) {
        let vbW = 200, vbH = 200;
        if (!rawSvg) return { vbW, vbH, maxDim: 200, scaleFactor: 1, targetW: 220, targetH: 220 };
        const safeSvg = ensureSvgXmlns(rawSvg);
        const vbMatch = safeSvg.match(/viewBox\s*=\s*["']\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*["']/i);
        if (vbMatch) {
            vbW = Math.abs(parseFloat(vbMatch[3])) || 200;
            vbH = Math.abs(parseFloat(vbMatch[4])) || 200;
        } else {
            const wMatch = safeSvg.match(/\bwidth\s*=\s*["']\s*([\d.]+)/i);
            const hMatch = safeSvg.match(/\bheight\s*=\s*["']\s*([\d.]+)/i);
            if (wMatch && hMatch) {
                vbW = Math.abs(parseFloat(wMatch[1])) || 200;
                vbH = Math.abs(parseFloat(hMatch[1])) || 200;
            }
        }
        if (vbW <= 0) vbW = 200;
        if (vbH <= 0) vbH = 200;
        const maxDim = Math.max(vbW, vbH) || 200;
        const scaleFactor = 220 / maxDim;
        const targetW = vbW * scaleFactor;
        const targetH = vbH * scaleFactor;
        return { vbW, vbH, maxDim, scaleFactor, targetW, targetH };
    }

    /**
     * 🌟 Birebir 3D Öge: SVG'den Otomatik Katı 3D Silüet (THREE.Shape) Çıkarıcı
     * Gökdelen, ağaç, bina, ev, araba gibi katı kütleli ikonları ve hazır rozetleri algılar ve konturlarından 3D model üretir.
     * En-boy oranını SVG viewBox'a 1:1 kilitler; suni letterbox ve kırpılmaları tamamen engeller.
     */
    async function extractSvgSilhouetteShape(rawSvg, targetW = 220, targetH = 220, options = {}) {
        if (!rawSvg || typeof window.THREE === 'undefined') return null;

        const dims = parseSvgDimensions(rawSvg);
        const svgVbW = dims.vbW;
        const svgVbH = dims.vbH;
        const maxVbDim = dims.maxDim;

        // Hedeflenen 3D boyutları SVG'nin doğal en-boy oranına kilitler (asla kareye zorlanmaz)
        let actualTargetW = targetW;
        let actualTargetH = targetH;
        if (!actualTargetW || !actualTargetH || Math.abs(actualTargetW - actualTargetH) < 1) {
            const baseDim = Math.max(actualTargetW || 0, actualTargetH || 0) || 220;
            actualTargetW = (svgVbW / maxVbDim) * baseDim;
            actualTargetH = (svgVbH / maxVbDim) * baseDim;
        }

        const cacheKey = rawSvg.length + '_' + rawSvg.slice(0, 120) + '_' + Math.round(actualTargetW) + '_' + Math.round(actualTargetH);
        if (!options.forceSilhouette && svgSilhouetteCache.has(cacheKey)) {
            return svgSilhouetteCache.get(cacheKey);
        }

        // SVG'nin orijinal en-boy oranına göre dinamik analiz tuvali boyutu (Maksimum 240px)
        const maxCanvasDim = 240;
        const W = Math.max(32, Math.round(maxCanvasDim * (svgVbW / maxVbDim)));
        const H = Math.max(32, Math.round(maxCanvasDim * (svgVbH / maxVbDim)));

        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        let cleanSvg = ensureSvgXmlns(rawSvg);
        cleanSvg = cleanSvg.replace(/(<svg\b[^>]*?)\s+width="[^"]*"/i, '$1');
        cleanSvg = cleanSvg.replace(/(<svg\b[^>]*?)\s+height="[^"]*"/i, '$1');
        cleanSvg = cleanSvg.replace(/currentColor/g, '#000000');
        cleanSvg = cleanSvg.replace(/preserveAspectRatio="[^"]*"/gi, '');
        cleanSvg = cleanSvg.replace('<svg', `<svg width="${W}" height="${H}" preserveAspectRatio="none"`);

        const blob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();

        try {
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = url;
            });
        } catch (e) {
            URL.revokeObjectURL(url);
            return null;
        }
        URL.revokeObjectURL(url);

        ctx.drawImage(img, 0, 0, W, H);
        const imgData = ctx.getImageData(0, 0, W, H).data;

        const grid = new Uint8Array(W * H);
        let solidCount = 0;
        let minX = W, maxX = 0, minY = H, maxY = 0;

        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                const alpha = imgData[(y * W + x) * 4 + 3];
                if (alpha > 40) {
                    grid[y * W + x] = 1;
                    solidCount++;
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }

        const bboxW = (maxX >= minX) ? (maxX - minX + 1) : 0;
        const bboxH = (maxY >= minY) ? (maxY - minY + 1) : 0;
        const bboxArea = bboxW * bboxH;
        const fillDensity = bboxArea > 0 ? (solidCount / bboxArea) : 0;

        // Katı nesne kontrolü (Kullanıcı: yaprak, damla gibi çok narin ikonlar rozet üzerinde kalsın)
        const totalPixels = W * H;
        if (!options.forceSilhouette) {
            // Yazı (<text>) veya tipografik callout rozetleri katı silüet yapılmaz; rozet/kart plaketi olarak kalmalıdır
            if (/<text\b/i.test(rawSvg)) return null;
            if (solidCount < totalPixels * 0.04) return null; // < %4 tuval doluluğu
            if (fillDensity < 0.15) return null; // Çok ince veya seyrek çizgiler
            if (bboxW < Math.max(16, W * 0.10) || bboxH < Math.max(16, H * 0.10)) return null;
        } else {
            if (solidCount < totalPixels * 0.01) return null;
        }

        // 🌟 Morfolojik Kapatma (Morphological Closing):
        // 2-3px'lik boşlukları (araba gövdesi ile tekerlekler, tren ile raylar, paratoner vb.)
        // tek bir yekpare gövde olarak birbirine bağlar ve dış kontur sınırlarını korur.
        function morphologicalCloseGrid(srcGrid, width, height, radius = 2) {
            const dilated = new Uint8Array(width * height);
            for (let y = 0; y < height; y++) {
                const minY = Math.max(0, y - radius);
                const maxY = Math.min(height - 1, y + radius);
                for (let x = 0; x < width; x++) {
                    if (!srcGrid[y * width + x]) continue;
                    const minX = Math.max(0, x - radius);
                    const maxX = Math.min(width - 1, x + radius);
                    for (let ny = minY; ny <= maxY; ny++) {
                        const dy = ny - y;
                        for (let nx = minX; nx <= maxX; nx++) {
                            const dx = nx - x;
                            if (dx * dx + dy * dy <= radius * radius) {
                                dilated[ny * width + nx] = 1;
                            }
                        }
                    }
                }
            }

            const closed = new Uint8Array(width * height);
            for (let y = 0; y < height; y++) {
                const minY = Math.max(0, y - radius);
                const maxY = Math.min(height - 1, y + radius);
                for (let x = 0; x < width; x++) {
                    if (!dilated[y * width + x]) continue;
                    let keep = true;
                    const minX = Math.max(0, x - radius);
                    const maxX = Math.min(width - 1, x + radius);
                    for (let ny = minY; ny <= maxY; ny++) {
                        const dy = ny - y;
                        for (let nx = minX; nx <= maxX; nx++) {
                            const dx = nx - x;
                            if (dx * dx + dy * dy <= radius * radius && !dilated[ny * width + nx]) {
                                keep = false;
                                break;
                            }
                        }
                        if (!keep) break;
                    }
                    if (keep) closed[y * width + x] = 1;
                }
            }
            return closed;
        }

        // 🌟 Bağlantılı Bileşen Analizi (CCA):
        // Gökyüzünde veya köşede asılı duran minik süslemeleri (örn. Metro "M" logosu, güneş, madeni para)
        // ana nesneden ayırır ve en büyük/baskın gövdenin (örn. Metro treni) kontur başlangıç noktasını seçer.
        function findDominantComponent(gridData, width, height) {
            const visited = new Uint8Array(width * height);
            const queue = new Int32Array(width * height);
            let bestSize = 0;
            let bestTopX = -1, bestTopY = -1;
            let bestMinX = width, bestMaxX = 0, bestMinY = height, bestMaxY = 0;

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = y * width + x;
                    if (!gridData[idx] || visited[idx]) continue;

                    let head = 0, tail = 0;
                    queue[tail++] = idx;
                    visited[idx] = 1;

                    let count = 0;
                    let cMinX = x, cMaxX = x, cMinY = y, cMaxY = y;
                    let topX = x, topY = y;

                    while (head < tail) {
                        const cur = queue[head++];
                        const cx = cur % width;
                        const cy = (cur / width) | 0;
                        count++;

                        if (cx < cMinX) cMinX = cx;
                        if (cx > cMaxX) cMaxX = cx;
                        if (cy < cMinY) {
                            cMinY = cy;
                            topX = cx;
                            topY = cy;
                        } else if (cy === cMinY && cx < topX) {
                            topX = cx;
                        }
                        if (cy > cMaxY) cMaxY = cy;

                        for (let dy = -1; dy <= 1; dy++) {
                            const ny = cy + dy;
                            if (ny < 0 || ny >= height) continue;
                            for (let dx = -1; dx <= 1; dx++) {
                                if (dx === 0 && dy === 0) continue;
                                const nx = cx + dx;
                                if (nx < 0 || nx >= width) continue;
                                const nidx = ny * width + nx;
                                if (gridData[nidx] && !visited[nidx]) {
                                    visited[nidx] = 1;
                                    queue[tail++] = nidx;
                                }
                            }
                        }
                    }

                    if (count > bestSize) {
                        bestSize = count;
                        bestTopX = topX;
                        bestTopY = topY;
                        bestMinX = cMinX;
                        bestMaxX = cMaxX;
                        bestMinY = cMinY;
                        bestMaxY = cMaxY;
                    }
                }
            }

            return {
                size: bestSize,
                topX: bestTopX,
                topY: bestTopY,
                bbox: { minX: bestMinX, maxX: bestMaxX, minY: bestMinY, maxY: bestMaxY }
            };
        }

        const workGrid = morphologicalCloseGrid(grid, W, H, 2);
        const dominant = findDominantComponent(workGrid, W, H);
        const startX = dominant.topX;
        const startY = dominant.topY;

        const rawContour = traceMooreNeighborContour(workGrid, W, H, startX, startY);
        if (!rawContour || rawContour.length < 16) return null;

        const simplified = douglasPeucker(rawContour, 1.2);
        if (!simplified || simplified.length < 5) return null;

        const points3D = simplified.map(p => ({
            x: (p.x / W - 0.5) * actualTargetW,
            y: -(p.y / H - 0.5) * actualTargetH
        }));

        // Counter-Clockwise (CCW) yön kontrolü
        let signedArea = 0;
        for (let i = 0; i < points3D.length; i++) {
            const j = (i + 1) % points3D.length;
            signedArea += points3D[i].x * points3D[j].y - points3D[j].x * points3D[i].y;
        }
        if (signedArea < 0) {
            points3D.reverse();
        }

        const shape = new THREE.Shape();
        shape.moveTo(points3D[0].x, points3D[0].y);
        for (let i = 1; i < points3D.length; i++) {
            shape.lineTo(points3D[i].x, points3D[i].y);
        }
        shape.closePath();

        // 🌟 Bounding Box: Doku (UV) hizalamasını kesinleştirmek için çıkarılan asıl silüet konturunun sınırlarını kullan
        let cMinX = W, cMaxX = 0, cMinY = H, cMaxY = 0;
        for (const p of simplified) {
            if (p.x < cMinX) cMinX = p.x;
            if (p.x > cMaxX) cMaxX = p.x;
            if (p.y < cMinY) cMinY = p.y;
            if (p.y > cMaxY) cMaxY = p.y;
        }

        const result = {
            shape: shape,
            bounds: {
                minX: -actualTargetW / 2,
                maxX: actualTargetW / 2,
                minY: -actualTargetH / 2,
                maxY: actualTargetH / 2,
                width: actualTargetW,
                height: actualTargetH,
                vbW: actualTargetW,
                vbH: actualTargetH,
                isCircle: false
            },
            pixelBBox: {
                minX: Math.max(0, Math.floor(cMinX - 1)),
                maxX: Math.min(W - 1, Math.ceil(cMaxX + 1)),
                minY: Math.max(0, Math.floor(cMinY - 1)),
                maxY: Math.min(H - 1, Math.ceil(cMaxY + 1)),
                W: W,
                H: H
            },
            isExactSilhouette: true,
            pointsCount: points3D.length,
            solidCount: dominant.size || solidCount,
            fillDensity: fillDensity
        };

        svgSilhouetteCache.set(cacheKey, result);
        return result;
    }

    /**
     * Kontrast Renk Hesaplayıcı (Açık renklere koyu, koyu renklere beyaz)
     */
    function getContrastingColor(hex) {
        try {
            if (typeof THREE !== 'undefined' && THREE.Color) {
                const c = new THREE.Color(hex || '#38bdf8');
                const lum = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
                return lum > 0.65 ? '#0f172a' : '#ffffff';
            }
        } catch(e) {}
        return '#ffffff';
    }

    /**
     * 🎨 SVG Akıllı Renklendirici (İkon Renk Değişimi & Katı Silüet / Rozet Uyumu)
     * - Çizgisel ve tek renkli ikonları (Lucide vb.) 100% hedef renge dönüştürür.
     * - Çok renkli zengin ikonlarda (havuz, villa, bina vb.) beyaz yansımaları ve detayları koruyarak
     *   tüm parçaları hedef rengin zengin ton paletine (monochromatic harmony) uyarlar.
     */
    function recolorSvg(rawSvg, targetHexColor, options = {}) {
        if (!rawSvg || !targetHexColor || typeof THREE === 'undefined') return rawSvg;
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
            const svgEl = doc.querySelector('svg');
            if (!svgEl) return rawSvg;

            const targetColor = new THREE.Color(targetHexColor);
            const targetHsl = {};
            targetColor.getHSL(targetHsl);
            const targetIsGrayscale = (targetHsl.s < 0.08);

            // Renk çeşitliliği tespiti
            const allNodes = Array.from(doc.querySelectorAll('*'));
            const uniqueColors = new Set();
            allNodes.forEach(node => {
                const f = (node.getAttribute('fill') || '').trim().toLowerCase();
                const s = (node.getAttribute('stroke') || '').trim().toLowerCase();
                if (f && f !== 'none' && f !== 'transparent' && f !== '#fff' && f !== '#ffffff' && f !== 'white' && !f.startsWith('url(')) {
                    uniqueColors.add(f);
                }
                if (s && s !== 'none' && s !== 'transparent' && s !== '#fff' && s !== '#ffffff' && s !== 'white' && !s.startsWith('url(')) {
                    uniqueColors.add(s);
                }
            });
            const isMultiColor = uniqueColors.size >= 2;

            if (isMultiColor && !options.forceRecolor) {
                // Çok renkli zengin illüstrasyonların (ağaçlar, evler, peyzaj, renkli vektörler)
                // orijinal zengin doğal renklerini koru; parçaları tek bir monokrom renge boğma!
                return rawSvg;
            }

            let svgGradId = null;
            if (options.useGradient) {
                try {
                    let defs = svgEl.querySelector('defs');
                    if (!defs) {
                        defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs');
                        svgEl.insertBefore(defs, svgEl.firstChild);
                    }
                    const topCol = '#' + new THREE.Color().setHSL(targetHsl.h, Math.min(1.0, targetHsl.s * 1.05), Math.min(0.96, targetHsl.l + 0.16)).getHexString();
                    const botCol = '#' + new THREE.Color().setHSL(targetHsl.h, Math.min(1.0, targetHsl.s * 1.05), Math.max(0.08, targetHsl.l - 0.16)).getHexString();
                    svgGradId = 'threeDGrad_' + Math.round(Math.random() * 100000);
                    defs.innerHTML += `<linearGradient id="${svgGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="${topCol}"/>
                        <stop offset="50%" stop-color="${targetHexColor}"/>
                        <stop offset="100%" stop-color="${botCol}"/>
                    </linearGradient>`;
                } catch(e) {}
            }
            const gradFillVal = svgGradId ? ('url(#' + svgGradId + ')') : targetHexColor;

            allNodes.forEach(node => {
                const tag = node.tagName.toLowerCase();

                // 1. <stop stop-color="...">
                if (tag === 'stop') {
                    const sc = node.getAttribute('stop-color');
                    if (sc && sc !== 'none' && sc !== 'transparent') {
                        try {
                            const c = new THREE.Color(sc);
                            const hsl = {};
                            c.getHSL(hsl);
                            const stopS = targetIsGrayscale ? 0 : Math.max(0.4, targetHsl.s);
                            const newC = new THREE.Color().setHSL(targetHsl.h, stopS, Math.max(0.15, Math.min(0.92, hsl.l)));
                            node.setAttribute('stop-color', '#' + newC.getHexString());
                        } catch(e) {
                            node.setAttribute('stop-color', targetHexColor);
                        }
                    }
                }

                // 2. fill
                const fill = node.getAttribute('fill');
                if (fill && fill !== 'none' && fill !== 'transparent' && !fill.startsWith('url(')) {
                    const lower = fill.toLowerCase().trim();
                    if (lower === 'currentcolor') {
                        node.setAttribute('fill', gradFillVal);
                    } else if (lower === 'white' || lower === '#fff' || lower === '#ffffff') {
                        // Beyaz vurguları/merdivenleri/yansımaları koru
                    } else if (!isMultiColor) {
                        node.setAttribute('fill', gradFillVal);
                    } else {
                        try {
                            const c = new THREE.Color(fill);
                            const hsl = {};
                            c.getHSL(hsl);
                            if (hsl.l > 0.95 && hsl.s < 0.12) {
                                // Beyaz aksan koru
                            } else if (hsl.l < 0.05) {
                                // Siyah kontur koru
                            } else {
                                const newS = targetIsGrayscale ? 0 : Math.max(0.35, targetHsl.s);
                                const newL = targetIsGrayscale ? Math.max(0.18, Math.min(0.96, hsl.l)) : Math.max(0.15, Math.min(0.90, hsl.l));
                                const newC = new THREE.Color().setHSL(targetHsl.h, newS, newL);
                                node.setAttribute('fill', '#' + newC.getHexString());
                            }
                        } catch(e) {
                            node.setAttribute('fill', targetHexColor);
                        }
                    }
                }

                // 3. stroke
                const stroke = node.getAttribute('stroke');
                if (stroke && stroke !== 'none' && stroke !== 'transparent' && !stroke.startsWith('url(')) {
                    const lower = stroke.toLowerCase().trim();
                    if (lower === 'currentcolor') {
                        node.setAttribute('stroke', targetHexColor);
                    } else if (lower === 'white' || lower === '#fff' || lower === '#ffffff') {
                        // Beyaz çizgi vurgularını koru
                    } else if (!isMultiColor) {
                        node.setAttribute('stroke', targetHexColor);
                    } else {
                        try {
                            const c = new THREE.Color(stroke);
                            const hsl = {};
                            c.getHSL(hsl);
                            if (hsl.l > 0.95 && hsl.s < 0.12) {
                                // Beyaz çizgi
                            } else if (hsl.l < 0.05) {
                                // Siyah çizgi
                            } else {
                                const strokeS = targetIsGrayscale ? 0 : Math.max(0.35, targetHsl.s);
                                const strokeL = targetIsGrayscale ? Math.max(0.10, Math.min(0.85, hsl.l)) : Math.max(0.18, Math.min(0.90, hsl.l));
                                const newC = new THREE.Color().setHSL(targetHsl.h, strokeS, strokeL);
                                node.setAttribute('stroke', '#' + newC.getHexString());
                            }
                        } catch(e) {
                            node.setAttribute('stroke', targetHexColor);
                        }
                    }
                }
            });

            if (svgEl) {
                if (svgEl.style) {
                    svgEl.style.color = targetHexColor;
                } else if (typeof svgEl.setAttribute === 'function') {
                    svgEl.setAttribute('color', targetHexColor);
                }
            }
            const s = new XMLSerializer();
            return s.serializeToString(doc);
        } catch (ex) {
            console.warn('[ThreeDEngine] recolorSvg hatası:', ex);
            return rawSvg;
        }
    }

    /**
     * 🌟 Birebir 3D Öge: SVG'den Yüksek Çözünürlüklü Vektör Dokusu Oluşturucu
     */
    function createExactSvgTexture(rawSvg, vbW, vbH, onUpdate, iconColor, bgColor, isRound = false, isExactSilhouette = false, options = {}) {
        const dims = parseSvgDimensions(rawSvg);
        const resolvedVbW = vbW || dims.vbW || 200;
        const resolvedVbH = vbH || dims.vbH || 200;

        const maxTexDim = 1024;
        let cw = maxTexDim;
        let ch = Math.round(maxTexDim * ((resolvedVbH || 1) / (resolvedVbW || 1)));
        if ((resolvedVbH || 1) > (resolvedVbW || 1)) {
            ch = maxTexDim;
            cw = Math.round(maxTexDim * ((resolvedVbW || 1) / (resolvedVbH || 1)));
        }
        cw = Math.max(256, Math.min(2048, cw));
        ch = Math.max(256, Math.min(2048, ch));

        let canvas;
        let texture;
        const existingTex = options && options.existingTexture;
        if (existingTex && existingTex.image && existingTex.image.getContext && existingTex.image.width === cw && existingTex.image.height === ch) {
            texture = existingTex;
            canvas = existingTex.image;
        } else {
            canvas = document.createElement('canvas');
            canvas.width = cw;
            canvas.height = ch;
            texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            if (renderer && renderer.capabilities) {
                texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            }
        }
        const ctx = canvas.getContext('2d');

        const isShape = !!(options && options.isShape);
        const useGradient = !!(options && options.useGradient);
        const isEstate = !!(options && options.isEstate);

        // 🌟 1. Anında Senkron Taban Rengi: Katı silüet veya şekillerde asla yabancı beyaz kenar oluşmasın!
        const baseColor = isExactSilhouette
            ? (iconColor || '#38bdf8')
            : (isShape ? (iconColor || '#38bdf8') : ((bgColor && bgColor !== 'transparent' && bgColor !== 'none') ? bgColor : '#ffffff'));

        function getFillStyle() {
            if (useGradient && baseColor && baseColor !== 'transparent') {
                try {
                    const c = new THREE.Color(baseColor);
                    const hsl = {};
                    c.getHSL(hsl);
                    const topCol = new THREE.Color().setHSL(hsl.h, Math.min(1.0, hsl.s * 1.05), Math.min(0.96, hsl.l + 0.16));
                    const botCol = new THREE.Color().setHSL(hsl.h, Math.min(1.0, hsl.s * 1.05), Math.max(0.08, hsl.l - 0.16));
                    const grad = ctx.createLinearGradient(0, 0, 0, ch);
                    grad.addColorStop(0, '#' + topCol.getHexString());
                    grad.addColorStop(0.5, '#' + c.getHexString());
                    grad.addColorStop(1, '#' + botCol.getHexString());
                    return grad;
                } catch(e) {}
            }
            return baseColor;
        }

        // 🌟 Rozet ve kartlarda zemin çizilir; silüet ve emlak/çit ögelerinde arka plan daima şeffaf kalır!
        // Eğer var olan doku yeniden kullanılıyorsa, önceki görseli img.onload anına kadar temizleme!
        if (!existingTex && !isEstate && !isExactSilhouette) {
            ctx.save();
            ctx.fillStyle = getFillStyle();
            if (isRound) {
                ctx.beginPath();
                ctx.arc(cw / 2, ch / 2, (cw / 2) - 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                const r = Math.min(32, cw * 0.12, ch * 0.12);
                drawRoundRect(ctx, 0, 0, cw, ch, r);
                ctx.fill();
            }
            ctx.restore();
        }

        // 2. SVG Akıllı Renklendirme ve Çözünürlük Büyütme
        let recolored = (options && options.skipRecolor) ? rawSvg : ((iconColor && iconColor !== 'none') ? recolorSvg(rawSvg, iconColor, { isExactSilhouette, bgColor, useGradient, isShape, forceRecolor: !!options.forceRecolor }) : rawSvg);
        let safeSvg = ensureSvgXmlns(recolored);

        // Var olan '1em', '100%' veya küçük piksel boyutlarını temizle ve yüksek çözünürlüğe ölçekle
        safeSvg = safeSvg.replace(/(<svg\b[^>]*?)\s+width="[^"]*"/i, '$1');
        safeSvg = safeSvg.replace(/(<svg\b[^>]*?)\s+height="[^"]*"/i, '$1');

        if (!safeSvg.includes('viewBox=') && resolvedVbW && resolvedVbH) {
            safeSvg = safeSvg.replace('<svg', `<svg viewBox="0 0 ${resolvedVbW} ${resolvedVbH}"`);
        }
        safeSvg = safeSvg.replace(/preserveAspectRatio="[^"]*"/gi, '');
        safeSvg = safeSvg.replace('<svg', `<svg width="${cw}" height="${ch}" preserveAspectRatio="none"`);

        // 3. İkon Tipine Göre Akıllı Renk Analizi:
        // İkon sadece çizgisel/kontur mu (Lucide, stroke="currentColor", fill="none") yoksa zengin renkli mi?
        const isStrokeOnly = (/stroke\s*=\s*["']currentColor["']/i.test(safeSvg) || /stroke-width/i.test(safeSvg)) &&
                             (!safeSvg.includes('fill=') || /fill\s*=\s*["']none["']/i.test(safeSvg));

        if (isStrokeOnly) {
            // Çizgisel ikonlarda zemin rozet/plaket rengi, çizgiler seçili ikon rengi (veya silüette kontrastlı) olsun
            const strokeColor = (!isExactSilhouette && iconColor) ? iconColor : getContrastingColor(baseColor);
            safeSvg = safeSvg.replace(/currentColor/g, strokeColor);
            safeSvg = safeSvg.replace(/stroke="[^"]*"/g, `stroke="${strokeColor}"`);
            const styleTag = `<style>:root, svg { color: ${strokeColor}; stroke: ${strokeColor}; }</style>`;
            safeSvg = safeSvg.replace(/(<svg[^>]*>)/, `$1${styleTag}`);
        } else {
            // Renkli ikonlarda currentColor varsa ön yüz rengini ver, özel renklerini koru
            const resolvedColor = iconColor || '#ffffff';
            safeSvg = safeSvg.replace(/currentColor/g, resolvedColor);
            const styleTag = `<style>:root, svg { color: ${resolvedColor}; }</style>`;
            safeSvg = safeSvg.replace(/(<svg[^>]*>)/, `$1${styleTag}`);
        }

        const blob = new Blob([safeSvg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();

        texture._svgLoadId = (texture._svgLoadId || 0) + 1;
        const currentLoadId = texture._svgLoadId;

        img.onload = () => {
            if (texture._svgLoadId !== currentLoadId) {
                URL.revokeObjectURL(url);
                return;
            }
            // 4. Yeniden Çizim ve Vektör Bindirme
            ctx.clearRect(0, 0, cw, ch);

            // Zemin Doldurma: Emlak/çit ögeleri hariç katı silüet veya rozet zemininde içi asla boş/şeffaf kalmaz
            if (!isEstate) {
                ctx.save();
                ctx.fillStyle = getFillStyle();
                if (!isExactSilhouette && isRound) {
                    ctx.beginPath();
                    ctx.arc(cw / 2, ch / 2, (cw / 2) - 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (!isExactSilhouette) {
                    const r = Math.min(32, cw * 0.12, ch * 0.12);
                    drawRoundRect(ctx, 0, 0, cw, ch, r);
                    ctx.fill();
                } else {
                    ctx.fillRect(0, 0, cw, ch);
                }
                ctx.restore();
            }

            // 5. Vektör Çizimi
            if (isExactSilhouette || isEstate) {
                ctx.drawImage(img, 0, 0, cw, ch);
            } else {
                // Rozet ve Kart Plaket modunda: Rozetler kendi zeminine veya metne sahipse tam boy çizilir
                const hasOwnPlate = isShape || /<rect|<polygon|<circle|<ellipse|<path/i.test(safeSvg) || /<text/i.test(safeSvg);
                if (hasOwnPlate) {
                    ctx.drawImage(img, 0, 0, cw, ch);
                } else {
                    const imgW = img.naturalWidth || img.width || cw;
                    const imgH = img.naturalHeight || img.height || ch;
                    const imgAspect = imgW / imgH;
                    let dw = cw * 0.88;
                    let dh = ch * 0.88;
                    if (imgAspect > (cw / ch)) {
                        dh = dw / imgAspect;
                    } else {
                        dw = dh * imgAspect;
                    }
                    const dx = (cw - dw) / 2;
                    const dy = (ch - dh) / 2;
                    ctx.drawImage(img, dx, dy, dw, dh);
                }
            }

            // 🌟 6. 3D Stüdyo Işık & Gölge Gradyanı Bindirme (Source-Atop ile Şeffaflığı Koruyarak)
            if (useGradient) {
                ctx.save();
                ctx.globalCompositeOperation = 'source-atop';
                const grad = ctx.createLinearGradient(0, 0, 0, ch);
                grad.addColorStop(0, 'rgba(255, 255, 255, 0.40)');
                grad.addColorStop(0.48, 'rgba(255, 255, 255, 0.0)');
                grad.addColorStop(0.52, 'rgba(0, 0, 0, 0.0)');
                grad.addColorStop(1, 'rgba(0, 0, 0, 0.42)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, cw, ch);
                ctx.restore();
            }

            URL.revokeObjectURL(url);
            texture.needsUpdate = true;
            if (typeof onUpdate === 'function') onUpdate(texture);
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
    function createShapeAndBoundsFromSvg(rawSvg, options = {}) {
        if (!rawSvg) return null;

        const dims = parseSvgDimensions(rawSvg);
        const safeSvg = ensureSvgXmlns(rawSvg);
        const parser = new DOMParser();
        const doc = parser.parseFromString(safeSvg, 'image/svg+xml');
        const svgEl = doc.querySelector('svg');
        if (!svgEl) return null;

        const vbW = dims.vbW;
        const vbH = dims.vbH;
        let ox = 0, oy = 0;
        let vb = svgEl.getAttribute('viewBox');
        if (vb) {
            const parts = vb.trim().split(/[\s,]+/).map(parseFloat);
            if (parts.length === 4 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                ox = parts[0]; oy = parts[1];
            }
        }

        const scaleFactor = dims.scaleFactor;
        let targetW = dims.targetW;
        let targetH = dims.targetH;

        let shape = null;
        const shapeMode = options.shapeMode || 'auto';
        let isCircle = (shapeMode === 'coin') || (!options.shapeMode && !!options.isRound);
        let isExactSilhouette = false;

        // Kontur Önceliği 0: Katı Silüet (Silhouette) Kontrolü
        if (shapeMode === 'silhouette' || (shapeMode !== 'coin' && shapeMode !== 'card')) {
            if (options.cachedSilhouette && options.cachedSilhouette.shape) {
                shape = options.cachedSilhouette.shape;
                isExactSilhouette = true;
            } else {
                const cacheKey = rawSvg.length + '_' + rawSvg.slice(0, 120) + '_' + Math.round(targetW) + '_' + Math.round(targetH);
                if (svgSilhouetteCache.has(cacheKey)) {
                    const cached = svgSilhouetteCache.get(cacheKey);
                    if (cached && cached.shape) {
                        shape = cached.shape;
                        isExactSilhouette = true;
                    }
                }
            }
        }

        // Eğer kullanıcı silüet modunu seçtiyse ve henüz önbellekte yoksa arka planda çıkar
        if (!shape && shapeMode === 'silhouette' && options.el) {
            const isFenceEl = !!(options.el.isFence || (options.el.tags && options.el.tags.includes('çit')));
            if (isFenceEl) {
                // Tel çit panelleri şeffaf alfa dokusu ile çalıştığı için hafif kart geometrisi kullanır
                shape = createCardShape(targetW, targetH, 2);
            } else {
                extractSvgSilhouetteShape(rawSvg, targetW, targetH, { forceSilhouette: true }).then(res => {
                    if (res && res.shape && options.el) {
                        options.el.cachedSilhouette = res;
                        options.el.isExactSilhouette = true;
                        recreateContentMeshes(options.el);
                        requestRender();
                    }
                });
            }
        }

        // Kontur Önceliği 1: SVG içinde belirgin bir <circle> arka plan var mı? (Sadece rozet modunda)
        if (!shape && shapeMode !== 'silhouette' && shapeMode !== 'card') {
            const circleNodes = Array.from(svgEl.querySelectorAll('circle')).filter(c => !c.closest('defs'));
            if (circleNodes.length > 0) {
                let maxR = 0;
                for (const c of circleNodes) {
                    const r = parseFloat(c.getAttribute('r')) || 0;
                    if (r > maxR) maxR = r;
                }
                if (maxR >= Math.min(vbW, vbH) * 0.35) {
                    isCircle = true;
                }
            }

            if (isCircle && (shapeMode === 'coin' || Math.abs(targetW - targetH) <= Math.max(targetW, targetH) * 0.2)) {
                const radius = (Math.min(targetW, targetH) / 2) * 0.98;
                shape = createCoinShape(radius);
            }
        }

        // Kontur Önceliği 2: SVG içinde belirgin bir <rect> arka plan var mı?
        if (!shape && shapeMode !== 'silhouette' && shapeMode !== 'coin') {
            const rectNodes = Array.from(svgEl.querySelectorAll('rect')).filter(r => !r.closest('defs'));
            if (rectNodes.length > 0) {
                let bestRect = null;
                let maxArea = 0;
                for (const r of rectNodes) {
                    const rw = parseFloat(r.getAttribute('width')) || 0;
                    const rh = parseFloat(r.getAttribute('height')) || 0;
                    const area = rw * rh;
                    if (area > maxArea) {
                        maxArea = area;
                        bestRect = r;
                    }
                }
                if (bestRect && maxArea >= (vbW * vbH) * 0.35) {
                    const rxRaw = parseFloat(bestRect.getAttribute('rx') || bestRect.getAttribute('ry') || '16');
                    const rxVal = Math.min(rxRaw * scaleFactor, targetW / 4, targetH / 4);
                    shape = createCardShape(targetW, targetH, Math.max(8, rxVal));
                }
            }
        }

        // Kontur Önceliği 3: SVG içinde belirgin bir <polygon> (bayrak, ribbon) var mı?
        // Sadece polygon tüm SVG alanının en az %35'ini kaplıyorsa (arka plan gövdesi ise) kullanılır.
        // Ok uçları (< %35) asla rozet geometrisini gasp edemez!
        if (!shape && shapeMode !== 'silhouette' && shapeMode !== 'card' && shapeMode !== 'coin') {
            const polyNodes = Array.from(svgEl.querySelectorAll('polygon')).filter(p => !p.closest('defs'));
            if (polyNodes.length > 0) {
                let bestPoly = null;
                let maxPolyArea = 0;
                for (const poly of polyNodes) {
                    const rawPts = (poly.getAttribute('points') || '').trim().split(/[\s,]+/).map(parseFloat).filter(n => !isNaN(n));
                    if (rawPts.length >= 6) {
                        let pMinX = Infinity, pMaxX = -Infinity, pMinY = Infinity, pMaxY = -Infinity;
                        for (let i = 0; i < rawPts.length; i += 2) {
                            if (rawPts[i] < pMinX) pMinX = rawPts[i];
                            if (rawPts[i] > pMaxX) pMaxX = rawPts[i];
                            if (rawPts[i + 1] < pMinY) pMinY = rawPts[i + 1];
                            if (rawPts[i + 1] > pMaxY) pMaxY = rawPts[i + 1];
                        }
                        const pArea = Math.max(0, pMaxX - pMinX) * Math.max(0, pMaxY - pMinY);
                        if (pArea > maxPolyArea) {
                            maxPolyArea = pArea;
                            bestPoly = { poly, rawPts };
                        }
                    }
                }
                if (bestPoly && maxPolyArea >= (vbW * vbH) * 0.35) {
                    const rawPts = bestPoly.rawPts;
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

        // Kontur Önceliği 4: Standart Yüksek Kaliteli 3D Rozet / Plaket (İkonlar ve Genel Ögeler İçin)
        if (!shape) {
            if (shapeMode === 'coin' || (Math.abs(targetW - targetH) <= 6 && options.isRound)) {
                shape = createCoinShape((targetW / 2) * 0.98);
                isCircle = true;
            } else {
                let cardW = targetW;
                let cardH = targetH;
                // Doğal olarak dikdörtgen olan SVG'lerde (örn. 140x200 veya 300x80) SVG'nin kendi en-boy oranını (targetW x targetH) koru!
                const isSvgNaturalRect = Math.abs(vbW - vbH) > 8;
                if (!isSvgNaturalRect && options.cachedSilhouette && options.cachedSilhouette.pixelBBox) {
                    const pbox = options.cachedSilhouette.pixelBBox;
                    const bw = pbox.maxX - pbox.minX + 1;
                    const bh = pbox.maxY - pbox.minY + 1;
                    const aspect = bw / bh;
                    if (aspect < 0.65) {
                        // Dikey/uzun ikonlar (örn. gökdelen) için şık orantılı dikey plaket
                        cardW = Math.max(140, Math.round(targetH * 0.70));
                        cardH = targetH;
                    } else if (aspect > 1.5) {
                        // Yatay ikonlar için şık orantılı yatay plaket
                        cardW = targetW;
                        cardH = Math.max(130, Math.round(targetW * 0.65));
                    }
                }
                const rx = Math.min(22, cardW * 0.16, cardH * 0.16);
                shape = createCardShape(cardW, cardH, Math.max(8, rx));
                targetW = cardW;
                targetH = cardH;
            }
        }

        const bounds = {
            minX: -targetW / 2,
            maxX: targetW / 2,
            minY: -targetH / 2,
            maxY: targetH / 2,
            width: targetW,
            height: targetH,
            vbW: targetW,
            vbH: targetH,
            isCircle
        };

        return { shape, bounds, isExactSilhouette: isExactSilhouette };
    }

    function createBadgeTexture(type, text, subtext, iconId, bgColor, textColor, accentColor, onUpdate, options = {}) {
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
            if (options && options.useGradient && bgColor && bgColor !== 'transparent') {
                try {
                    const c = new THREE.Color(bgColor);
                    const hsl = {};
                    c.getHSL(hsl);
                    const topCol = new THREE.Color().setHSL(hsl.h, Math.min(1.0, hsl.s * 1.05), Math.min(0.96, hsl.l + 0.16));
                    const botCol = new THREE.Color().setHSL(hsl.h, Math.min(1.0, hsl.s * 1.05), Math.max(0.08, hsl.l - 0.16));
                    const bGrad = ctx.createLinearGradient(0, 0, 0, ch);
                    bGrad.addColorStop(0, '#' + topCol.getHexString());
                    bGrad.addColorStop(0.5, '#' + c.getHexString());
                    bGrad.addColorStop(1, '#' + botCol.getHexString());
                    ctx.fillStyle = bGrad;
                } catch(e) {
                    ctx.fillStyle = bgColor || '#0f172a';
                }
            } else {
                ctx.fillStyle = bgColor || '#0f172a';
            }
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
            const hasRelief = !!options.hasRelief;
            const hasText = !!options.hasText || (!hasRelief && !!(mainStr || subStr));
            const userScale = (options.embossScale !== undefined ? options.embossScale : 85) / 85;
            const offX = (options.embossOffsetX || 0) * 3;
            const offY = -(options.embossOffsetY || 0) * 3;

            function drawFittedImage(img, cx, cy, maxW, maxH) {
                if (!img) return;
                const targetW = maxW;
                const targetH = maxH || maxW;
                const imgW = img.naturalWidth || img.width || 1;
                const imgH = img.naturalHeight || img.height || 1;
                const aspect = imgW / imgH;
                let dw = targetW;
                let dh = targetH;
                if (aspect > (targetW / targetH)) {
                    dh = targetW / aspect;
                } else {
                    dw = targetH * aspect;
                }
                ctx.save();
                ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
                ctx.restore();
            }

            if (type === 'badge_pill') {
                if (hasText) {
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
                    ctx.restore();

                    if (!hasRelief && hasIcon) {
                        drawFittedImage(iconImg, iconCenterX + offX, iconCenterY + offY, iconBoxSize * userScale, iconBoxSize * userScale);
                    }

                    const textLeft = 295;
                    const textMaxW = cw - textLeft - 60;
                    drawBadgeText(ctx, mainStr, subStr, textLeft, ch / 2, textMaxW, textColor, accentColor, 'left');
                } else {
                    if (!hasRelief && hasIcon) {
                        const iconBoxSize = (ch - 36) * userScale;
                        drawFittedImage(iconImg, (cw / 2) + offX, (ch / 2) + offY, cw * 0.75, iconBoxSize);
                    }
                }
            } else if (type === 'badge_shield') {
                if (hasText) {
                    if (!hasRelief && hasIcon) {
                        const iconSize = 340 * userScale;
                        const iconY = 320;
                        drawFittedImage(iconImg, (cw / 2) + offX, iconY + offY, iconSize, iconSize);
                    }
                    const textY = 660;
                    drawBadgeText(ctx, mainStr, subStr, cw / 2, textY, cw - 160, textColor, accentColor, 'center');
                } else {
                    if (!hasRelief && hasIcon) {
                        const iconSize = Math.min(cw * 0.75, ch * 0.70) * userScale;
                        drawFittedImage(iconImg, (cw / 2) + offX, (ch / 2) + offY, iconSize, iconSize);
                    }
                }
            } else if (type === 'badge_card') {
                if (hasText) {
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
                    ctx.restore();

                    if (!hasRelief && hasIcon) {
                        drawFittedImage(iconImg, iconCenterX + offX, iconCenterY + offY, 170 * userScale, 170 * userScale);
                    }

                    const textLeft = 330;
                    const textMaxW = cw - textLeft - 50;
                    drawBadgeText(ctx, mainStr, subStr, textLeft, ch / 2, textMaxW, textColor, accentColor, 'left');
                } else {
                    if (!hasRelief && hasIcon) {
                        drawFittedImage(iconImg, (cw / 2) + offX, (ch / 2) + offY, cw * 0.8, (ch - 60) * userScale);
                    }
                }
            } else if (type === 'badge_coin' || type === 'icon_3d') {
                if (hasText) {
                    if (!hasRelief && hasIcon) {
                        const iconSize = 400 * userScale;
                        const iconY = 410;
                        drawFittedImage(iconImg, (cw / 2) + offX, iconY + offY, iconSize, iconSize);
                    }
                    drawBadgeText(ctx, mainStr, subStr, cw / 2, 770, cw - 200, textColor, accentColor, 'center');
                } else {
                    if (!hasRelief && hasIcon) {
                        const iconSize = (cw - 120) * userScale;
                        drawFittedImage(iconImg, (cw / 2) + offX, (ch / 2) + offY, iconSize, iconSize);
                    }
                }
            }

            texture.needsUpdate = true;
            if (typeof onUpdate === 'function') onUpdate();
        }

        // Pass 1: Senkron çizim
        let initialImg = null;
        const rawSvgToRender = options.sourceSvg || state.customIconSvg;
        const iconKey = rawSvgToRender ? ('raw_' + rawSvgToRender.length + '_' + rawSvgToRender.slice(0, 40)) : iconId;

        if (iconKey && iconKey !== 'none' && svgImageCache.has(iconKey)) {
            const cached = svgImageCache.get(iconKey);
            if (cached && cached.complete) initialImg = cached;
        }
        renderPass(initialImg);

        // Pass 2: Asenkron (eğer önbellekte yoksa)
        if (!initialImg) {
            if (rawSvgToRender) {
                getSvgImageFromRaw(rawSvgToRender, (loadedImg) => {
                    if (loadedImg) {
                        svgImageCache.set(iconKey, loadedImg);
                        renderPass(loadedImg);
                    }
                });
            } else if (iconId && iconId !== 'none') {
                getSvgImage(iconId, (loadedImg) => {
                    if (loadedImg) {
                        renderPass(loadedImg);
                    }
                });
            }
        }

        return texture;
    }

    /**
     * 🌟 3D Rozet Kabartma Heykelcik Üretici (3D Relief / Emboss Mesh)
     * - Emlak ögeleri, mimari yapılar veya ikonları rozet yüzeyinden öne çıkan gerçek 3D kabartma gövde olarak üretir.
     */
    function createBadgeReliefMesh(el, badgeType, badgeDepth, cGroup, badgeW, badgeH, hasText) {
        if (!el || !cGroup) return null;
        if (el.reliefMesh) {
            cGroup.remove(el.reliefMesh);
            if (el.reliefMesh.geometry) el.reliefMesh.geometry.dispose();
            if (el.reliefMesh.material) {
                if (Array.isArray(el.reliefMesh.material)) el.reliefMesh.material.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
                else { if (el.reliefMesh.material.map) el.reliefMesh.material.map.dispose(); el.reliefMesh.material.dispose(); }
            }
            el.reliefMesh = null;
        }

        const elementSvg = el.sourceSvg || (el.selectedIconId && el.selectedIconId !== 'none' ? getIconSvgById(el.selectedIconId) : null) || el.customIconSvg;
        if (!elementSvg) return null;

        const shapeRes = createShapeAndBoundsFromSvg(elementSvg, {
            shapeMode: 'silhouette',
            cachedSilhouette: el.cachedSilhouette,
            el: el
        });
        if (!shapeRes || !shapeRes.shape) return null;

        let targetCenterX = 0;
        let targetCenterY = 0;
        let targetAreaW = 100;
        let targetAreaH = 80;

        if (badgeType === 'badge_pill') {
            if (hasText) {
                targetCenterX = -65;
                targetCenterY = 0;
                targetAreaW = 65;
                targetAreaH = 55;
            } else {
                targetCenterX = 0;
                targetCenterY = 0;
                targetAreaW = 175;
                targetAreaH = 55;
            }
        } else if (badgeType === 'badge_card') {
            if (hasText) {
                targetCenterX = -55;
                targetCenterY = 0;
                targetAreaW = 85;
                targetAreaH = 85;
            } else {
                targetCenterX = 0;
                targetCenterY = 0;
                targetAreaW = 180;
                targetAreaH = 95;
            }
        } else if (badgeType === 'badge_shield') {
            if (hasText) {
                targetCenterX = 0;
                targetCenterY = 25;
                targetAreaW = 110;
                targetAreaH = 85;
            } else {
                targetCenterX = 0;
                targetCenterY = 5;
                targetAreaW = 125;
                targetAreaH = 125;
            }
        } else {
            // coin / icon_3d
            if (hasText) {
                targetCenterX = 0;
                targetCenterY = 15;
                targetAreaW = 95;
                targetAreaH = 80;
            } else {
                targetCenterX = 0;
                targetCenterY = 0;
                targetAreaW = 120;
                targetAreaH = 120;
            }
        }

        const userScale = (el.embossScale !== undefined ? el.embossScale : 85) / 100;
        const offsetX = el.embossOffsetX || 0;
        const offsetY = el.embossOffsetY || 0;
        const reliefDepth = Math.max(2, Math.min(60, el.embossDepth !== undefined ? el.embossDepth : 12));

        const bW = shapeRes.bounds.width || 1;
        const bH = shapeRes.bounds.height || 1;
        const fitScale = Math.min(targetAreaW / bW, targetAreaH / bH) * userScale;

        const uvGen = getNormalizedUVGenerator(shapeRes.bounds.minX, shapeRes.bounds.maxX, shapeRes.bounds.minY, shapeRes.bounds.maxY);
        const reliefExtrudeOpts = {
            depth: reliefDepth,
            bevelEnabled: !!el.bevelEnabled,
            bevelThickness: Math.min(0.8, el.bevelThickness || 1.0),
            bevelSize: Math.min(0.6, el.bevelSize || 0.8),
            bevelSegments: 2,
            curveSegments: 16,
            UVGenerator: uvGen
        };

        const reliefGeo = new THREE.ExtrudeGeometry(shapeRes.shape, reliefExtrudeOpts);
        reliefGeo.center();

        const reliefTex = createExactSvgTexture(
            elementSvg,
            shapeRes.bounds.vbW,
            shapeRes.bounds.vbH,
            () => requestRender(),
            el.frontColor,
            'transparent',
            false,
            true,
            {
                useGradient: !!el.useGradient,
                isEstate: !!el.estateItemId,
                forceRecolor: !!el._userHasChangedColor
            }
        );

        const reliefFrontMat = new THREE.MeshStandardMaterial({
            map: reliefTex,
            roughness: el.roughness !== undefined ? el.roughness : 0.55,
            metalness: el.metalness !== undefined ? el.metalness : 0.08,
            transparent: true,
            alphaTest: 0.04,
            depthWrite: true,
            side: THREE.DoubleSide
        });

        const reliefSideColor = el.sideColor || (el.estateItemId ? '#52361b' : '#334155');
        const reliefSideMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(reliefSideColor),
            roughness: 0.6,
            metalness: 0.1,
            side: THREE.DoubleSide
        });

        if (reliefGeo.groups && reliefGeo.groups.length >= 2) {
            const lidGroup = reliefGeo.groups[0];
            const halfLid = Math.floor(lidGroup.count / 2);
            // lidGroup.start = Back cap -> reliefSideMat (index 1)
            reliefGeo.groups[0] = { start: lidGroup.start, count: halfLid, materialIndex: 1 };
            // lidGroup.start + halfLid = Front cap -> reliefFrontMat (index 0)
            reliefGeo.groups.splice(1, 0, { start: lidGroup.start + halfLid, count: lidGroup.count - halfLid, materialIndex: 0 });
        }

        const reliefMesh = new THREE.Mesh(reliefGeo, [reliefFrontMat, reliefSideMat]);
        reliefMesh.scale.set(fitScale, fitScale, 1.0);
        reliefMesh.position.x = targetCenterX + offsetX;
        reliefMesh.position.y = targetCenterY + offsetY;
        reliefMesh.position.z = (badgeDepth / 2) + (reliefDepth / 2) + 0.3;
        reliefMesh.castShadow = true;
        reliefMesh.receiveShadow = true;
        cGroup.add(reliefMesh);
        el.reliefMesh = reliefMesh;
        return reliefMesh;
    }

    function createPinShape() {
        const s = new THREE.Shape();
        s.moveTo(0, 0);
        s.bezierCurveTo(-14, 22, -24, 42, -24, 60);
        // Dış hat saat yönünde (clockwise) çizilmeli (üzerinden geçmesi için true)
        s.absarc(0, 60, 24, Math.PI, 0, true);
        s.bezierCurveTo(24, 42, 14, 22, 0, 0);

        const hole = new THREE.Path();
        // Delik (hole) dış hattın tersi yönünde (counter-clockwise) olmalı
        hole.absarc(0, 60, 9, 0, Math.PI * 2, false);
        s.holes.push(hole);
        return s;
    }

    function createArrowShape() {
        const s = new THREE.Shape();
        // ExtrudeGeometry'nin düzgün çalışması için dış hattı saat yönünün tersine (CCW) çiziyoruz
        s.moveTo(0, 50);
        s.lineTo(-24, 18);
        s.lineTo(-10, 18);
        s.lineTo(-10, -35);
        s.lineTo(10, -35);
        s.lineTo(10, 18);
        s.lineTo(24, 18);
        s.lineTo(0, 50);
        return s;
    }

    /**
     * 3.5. Hızlı Renk & Doku Güncelleyici (0ms Gecikme, Sıfır Geometri Yeniden Üretimi)
     */
    let colorUpdateRaf = null;
    let pendingColorEl = null;

    function updateBadgeTextureOnly(el) {
        if (!el || !el.badgeMesh) return;
        const type = el.elementType;
        let newTex = null;

        if (type === 'element_3d' && el.sourceSvg) {
            if (!el.sourceSvgOriginal) el.sourceSvgOriginal = el.sourceSvg;
            const rawSource = el.sourceSvgOriginal || el.sourceSvg;
            const shouldRecolor = !!(el._userHasChangedColor && el.frontColor);
            const recoloredSvg = shouldRecolor ? recolorSvg(rawSource, el.frontColor, { forceRecolor: true }) : rawSource;
            const svgToRender = (el.text || el.badgeSubtext) ? updateSvgText(recoloredSvg, el.text, el.badgeSubtext) : recoloredSvg;
            const shapeMode = el.shapeMode || (el.isExactSilhouette ? 'silhouette' : (el.isRound ? 'coin' : 'card'));
            const isRound = (shapeMode === 'coin');
            const res = createShapeAndBoundsFromSvg(svgToRender, {
                isRound: isRound,
                shapeMode: shapeMode,
                cachedSilhouette: el.cachedSilhouette,
                el: el
            });
            if (res && res.bounds) {
                const bounds = res.bounds;
                const isExactSilhouette = !!res.isExactSilhouette;
                const mat = Array.isArray(el.badgeMesh.material) ? el.badgeMesh.material[0] : el.badgeMesh.material;
                const existingTex = (mat && mat.map) ? mat.map : null;

                createExactSvgTexture(
                    svgToRender,
                    bounds.vbW,
                    bounds.vbH,
                    (readyTex) => {
                        if (!el || !el.badgeMesh) return;
                        const curMat = Array.isArray(el.badgeMesh.material) ? el.badgeMesh.material[0] : el.badgeMesh.material;
                        if (curMat) {
                            if (curMat.map && curMat.map !== readyTex) {
                                try { curMat.map.dispose(); } catch(e) {}
                            }
                            curMat.map = readyTex;
                            curMat.needsUpdate = true;
                            requestRender();
                        }
                    },
                    el.frontColor,
                    el.badgeBgColor,
                    bounds.isCircle,
                    isExactSilhouette,
                    { 
                        useGradient: !!el.useGradient, 
                        isShape: !!(el.isShape || el.isSurfaceBase),
                        isEstate: !!el.estateItemId,
                        forceRecolor: !!el._userHasChangedColor,
                        skipRecolor: shouldRecolor,
                        existingTexture: existingTex
                    }
                );
            }
        } else if (type && (type.startsWith('badge_') || type === 'icon_3d')) {
            const elementSvg = el.sourceSvg || (el.selectedIconId && el.selectedIconId !== 'none' ? getIconSvgById(el.selectedIconId) : null) || el.customIconSvg;
            const hasElement = !!elementSvg;
            const elementMode = el.badgeElementMode || 'emboss';
            const hasText = !el.show3DText && !!((el.text || '').trim() || (el.badgeSubtext || '').trim());
            newTex = createBadgeTexture(
                type,
                el.show3DText ? '' : el.text,
                el.show3DText ? '' : el.badgeSubtext,
                el.selectedIconId,
                el.badgeBgColor || '#ffffff',
                el.frontColor,
                el.frontColor,
                () => requestRender(),
                {
                    useGradient: !!el.useGradient,
                    sourceSvg: (elementMode === 'flat') ? elementSvg : null,
                    elementMode: elementMode,
                    embossScale: el.embossScale !== undefined ? el.embossScale : 85,
                    embossOffsetX: el.embossOffsetX || 0,
                    embossOffsetY: el.embossOffsetY || 0,
                    hasRelief: (elementMode === 'emboss') && hasElement,
                    hasText: hasText
                }
            );
            if (newTex) {
                const mat = Array.isArray(el.badgeMesh.material) ? el.badgeMesh.material[0] : el.badgeMesh.material;
                if (mat) {
                    if (mat.map && mat.map !== newTex) {
                        try { mat.map.dispose(); } catch(e) {}
                    }
                    mat.map = newTex;
                    mat.needsUpdate = true;
                    requestRender();
                }
            }
        }

        if (el.reliefMesh) {
            const elementSvg = el.sourceSvg || (el.selectedIconId && el.selectedIconId !== 'none' ? getIconSvgById(el.selectedIconId) : null) || el.customIconSvg;
            if (elementSvg) {
                const reliefShapeRes = createShapeAndBoundsFromSvg(elementSvg, { forceSilhouette: true });
                if (reliefShapeRes && reliefShapeRes.bounds) {
                    const rTex = createExactSvgTexture(
                        elementSvg,
                        reliefShapeRes.bounds.vbW,
                        reliefShapeRes.bounds.vbH,
                        () => requestRender(),
                        el.frontColor,
                        'transparent',
                        false,
                        true,
                        {
                            useGradient: !!el.useGradient,
                            isEstate: !!el.estateItemId,
                            forceRecolor: !!el._userHasChangedColor
                        }
                    );
                    const rMat = Array.isArray(el.reliefMesh.material) ? el.reliefMesh.material[0] : el.reliefMesh.material;
                    if (rMat) {
                        if (rMat.map && rMat.map !== rTex) {
                            try { rMat.map.dispose(); } catch(e) {}
                        }
                        rMat.map = rTex;
                        rMat.needsUpdate = true;
                        requestRender();
                    }
                }
            }
        }
    }

    function queueBadgeTextureUpdate(el) {
        pendingColorEl = el;
        if (!colorUpdateRaf) {
            colorUpdateRaf = requestAnimationFrame(() => {
                colorUpdateRaf = null;
                if (pendingColorEl) {
                    const target = pendingColorEl;
                    pendingColorEl = null;
                    updateBadgeTextureOnly(target);
                }
            });
        }
    }

    /**
     * 🌟 3D Metin Ön Yüz UV Koordinatlarını Bounding Box ile [0, 1] Aralığına Normalize Etme
     * (Böylece gradyanlar, akrilik neon dokuları ve desenler harflerin ön yüzeyine kusursuz oturur)
     */
    function normalizeTextMeshUVs(geometry) {
        if (!geometry || !geometry.attributes || !geometry.attributes.position || !geometry.attributes.uv) return;
        try {
            geometry.computeBoundingBox();
            const bb = geometry.boundingBox;
            if (!bb) return;
            const w = (bb.max.x - bb.min.x) || 1;
            const h = (bb.max.y - bb.min.y) || 1;
            const posAttr = geometry.attributes.position;
            const uvAttr = geometry.attributes.uv;
            const frontZ = bb.max.z - 0.25;

            for (let i = 0; i < posAttr.count; i++) {
                const z = posAttr.getZ(i);
                if (z >= frontZ) {
                    const x = posAttr.getX(i);
                    const y = posAttr.getY(i);
                    const u = Math.max(0.001, Math.min(0.999, (x - bb.min.x) / w));
                    const v = Math.max(0.001, Math.min(0.999, (y - bb.min.y) / h));
                    uvAttr.setXY(i, u, v);
                }
            }
            uvAttr.needsUpdate = true;
        } catch (e) {
            console.warn('[ThreeD] normalizeTextMeshUVs hatası:', e);
        }
    }

    /**
     * 🌟 Göz Alıcı Lazer & Akrilik Neon Ön Yüz Dokusu (Hot Core + Vibrant Edge Glow)
     */
    function createNeonFaceTexture(neonColorHex, baseColorHex, intensity) {
        if (typeof document === 'undefined' || typeof THREE === 'undefined') return null;
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');

            const nCol = new THREE.Color(neonColorHex || '#00f0ff');
            const hsl = {};
            nCol.getHSL(hsl);

            const intProgress = Math.max(0.1, Math.min(1.0, (intensity !== undefined ? intensity : 80) / 100));

            // 1. Akkor Parlak Beyaz-Neon Lazer Çekirdek (Hot Core)
            const coreCol = new THREE.Color().setHSL(hsl.h, Math.max(0.05, 0.20 - intProgress * 0.15), 0.98);
            // 2. Canlı, Ultra-Doygun Elektrik Neon Tonu
            const vibrantCol = new THREE.Color().setHSL(hsl.h, 1.0, 0.55);
            // 3. Derin, Yoğun Neon Gövde Tonu
            const deepCol = new THREE.Color().setHSL(hsl.h, 1.0, Math.max(0.20, 0.45 - intProgress * 0.15));

            // Zemin: Derin ve canlı neon rengi
            ctx.fillStyle = '#' + deepCol.getHexString();
            ctx.fillRect(0, 0, 512, 512);

            // Dikey degrade (üst ve alt koyu, ortada akkor lazer/ışık bandı)
            const grad = ctx.createLinearGradient(0, 0, 0, 512);
            grad.addColorStop(0, '#' + deepCol.getHexString());
            grad.addColorStop(0.15, '#' + vibrantCol.getHexString());
            grad.addColorStop(0.40, '#' + coreCol.getHexString());
            grad.addColorStop(0.50, '#ffffff'); // Tam ortada akkor beyaz lazer çekirdeği
            grad.addColorStop(0.60, '#' + coreCol.getHexString());
            grad.addColorStop(0.85, '#' + vibrantCol.getHexString());
            grad.addColorStop(1, '#' + deepCol.getHexString());

            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 512, 512);

            // Merkez radyal akrilik parlama (pleksi kutu harf hissi)
            const radGrad = ctx.createRadialGradient(256, 256, 8, 256, 256, 255);
            const coreAlpha = Math.min(0.98, 0.40 + intProgress * 0.58);
            radGrad.addColorStop(0, `rgba(255, 255, 255, ${coreAlpha})`);
            radGrad.addColorStop(0.25, '#' + vibrantCol.getHexString());
            radGrad.addColorStop(0.70, '#' + deepCol.getHexString());
            radGrad.addColorStop(1, 'rgba(0, 0, 0, 0.30)');
            ctx.fillStyle = radGrad;
            ctx.fillRect(0, 0, 512, 512);

            const tex = new THREE.CanvasTexture(canvas);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            return tex;
        } catch(e) {
            return null;
        }
    }

    /**
     * 🌟 2D Yüksek Çözünürlüklü Saber Neon Dokusu Üretici
     * (Saf Neon, Alev, Dönme, Elektrik, Kıvılcım, Gökkuşağı efektleri ile çok katmanlı akkor ışıma)
     */
    function createSaberTextTexture(text, options) {
        if (typeof document === 'undefined' || typeof THREE === 'undefined') return null;
        try {
            const rawText = (text || '').trim() || 'METİN';
            const lines = rawText.split('\n');
            const preset = (options && options.preset) || 'fully-lit';
            const neonColorHex = (options && options.neonColor) || '#00f0ff';
            const intensity = (options && options.intensity !== undefined) ? options.intensity : 80;
            const spread = (options && options.spread !== undefined) ? options.spread : 50;

            const intProg = Math.max(0.1, Math.min(1.0, intensity / 100));
            const spreadProg = Math.max(0.2, Math.min(1.5, (spread > 0 ? spread : 50) / 50));

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const fontSize = 160;
            const fontFamily = '"Space Grotesk", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.font = `900 ${fontSize}px ${fontFamily}`;

            let maxLineWidth = 0;
            lines.forEach(l => {
                const w = ctx.measureText(l).width;
                if (w > maxLineWidth) maxLineWidth = w;
            });
            maxLineWidth = Math.ceil(maxLineWidth);

            const lineSpacing = fontSize * 1.15;
            const totalTextH = lines.length * lineSpacing;

            const paddingX = Math.ceil(100 * spreadProg);
            const paddingY = Math.ceil(90 * spreadProg);

            const canvasW = Math.max(256, maxLineWidth + paddingX * 2);
            const canvasH = Math.max(128, Math.ceil(totalTextH + paddingY * 2));

            canvas.width = canvasW;
            canvas.height = canvasH;

            ctx.font = `900 ${fontSize}px ${fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const cx = canvasW / 2;
            const startY = (canvasH / 2) - ((lines.length - 1) * lineSpacing) / 2;

            ctx.save();

            if (preset === 'fire') {
                // 🔥 FIRE (Alev): Altın sarı tepe, turuncu-kırmızı gövde, akkor merkez filament
                const grad = ctx.createLinearGradient(0, startY - fontSize * 0.5, 0, startY + totalTextH);
                grad.addColorStop(0, '#fff3b0');
                grad.addColorStop(0.25, '#ffb703');
                grad.addColorStop(0.65, '#fb8500');
                grad.addColorStop(1, '#d90429');

                // 1. Duman ve ısı halesi (Geniş yayılım)
                ctx.shadowColor = '#d90429';
                ctx.shadowBlur = Math.round(70 * spreadProg * intProg);
                ctx.strokeStyle = '#d90429';
                ctx.lineWidth = 26;
                ctx.globalAlpha = 0.35 * intProg;
                lines.forEach((l, i) => ctx.strokeText(l, cx, startY + i * lineSpacing));

                // 2. Parlak alev korası
                ctx.shadowColor = '#ff6600';
                ctx.shadowBlur = Math.round(35 * spreadProg * intProg);
                ctx.strokeStyle = '#ff9900';
                ctx.lineWidth = 14;
                ctx.globalAlpha = 0.70 * intProg;
                lines.forEach((l, i) => ctx.strokeText(l, cx, startY + i * lineSpacing));

                // 3. Alev gövdesi dolgusu
                ctx.shadowColor = '#ffaa00';
                ctx.shadowBlur = Math.round(15 * intProg);
                ctx.fillStyle = grad;
                ctx.globalAlpha = 0.95;
                lines.forEach((l, i) => ctx.fillText(l, cx, startY + i * lineSpacing));

                // 4. Akkor beyaz-sarı iç çekirdek
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 4;
                ctx.strokeStyle = '#fff9db';
                ctx.lineWidth = 4;
                ctx.globalAlpha = 1.0;
                lines.forEach((l, i) => ctx.strokeText(l, cx, startY + i * lineSpacing));

            } else if (preset === 'vortex') {
                // 🌪️ VORTEX (Dönme): Kozmik mor, eflatun ve neon camgöbeği
                const grad = ctx.createLinearGradient(cx - maxLineWidth / 2, startY, cx + maxLineWidth / 2, startY + totalTextH);
                grad.addColorStop(0, '#4cc9f0');
                grad.addColorStop(0.5, '#f72585');
                grad.addColorStop(1, '#7209b7');

                // 1. Kozmik dış aura
                ctx.shadowColor = '#b5179e';
                ctx.shadowBlur = Math.round(65 * spreadProg * intProg);
                ctx.strokeStyle = '#7209b7';
                ctx.lineWidth = 24;
                ctx.globalAlpha = 0.38 * intProg;
                lines.forEach((l, i) => ctx.strokeText(l, cx, startY + i * lineSpacing));

                // 2. Canlı eflatun korona
                ctx.shadowColor = '#f72585';
                ctx.shadowBlur = Math.round(30 * spreadProg * intProg);
                ctx.strokeStyle = '#f72585';
                ctx.lineWidth = 12;
                ctx.globalAlpha = 0.75 * intProg;
                lines.forEach((l, i) => ctx.strokeText(l, cx, startY + i * lineSpacing));

                // 3. Işıltılı gövde dolgusu
                ctx.shadowColor = '#4cc9f0';
                ctx.shadowBlur = Math.round(14 * intProg);
                ctx.fillStyle = grad;
                ctx.globalAlpha = 0.95;
                lines.forEach((l, i) => ctx.fillText(l, cx, startY + i * lineSpacing));

                // 4. Lazer çekirdek
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 4;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 4;
                ctx.globalAlpha = 1.0;
                lines.forEach((l, i) => ctx.strokeText(l, cx, startY + i * lineSpacing));

            } else if (preset === 'electric') {
                // ⚡ ELECTRIC (Elektrik): Yüksek voltaj buz mavisi ve elektrik arkı
                const cyan = '#00f0ff';
                const deepBlue = '#0066ff';

                // 1. Yüksek voltaj difüz aura
                ctx.shadowColor = deepBlue;
                ctx.shadowBlur = Math.round(60 * spreadProg * intProg);
                ctx.strokeStyle = deepBlue;
                ctx.lineWidth = 24;
                ctx.globalAlpha = 0.40 * intProg;
                lines.forEach((l, i) => ctx.strokeText(l, cx, startY + i * lineSpacing));

                // 2. Yoğun elektrik korona
                ctx.shadowColor = cyan;
                ctx.shadowBlur = Math.round(28 * spreadProg * intProg);
                ctx.strokeStyle = cyan;
                ctx.lineWidth = 12;
                ctx.globalAlpha = 0.85 * intProg;
                lines.forEach((l, i) => ctx.strokeText(l, cx, startY + i * lineSpacing));

                // 3. Neon tüp dolgusu
                ctx.shadowColor = cyan;
                ctx.shadowBlur = Math.round(12 * intProg);
                ctx.fillStyle = cyan;
                ctx.globalAlpha = 0.90;
                lines.forEach((l, i) => ctx.fillText(l, cx, startY + i * lineSpacing));

                // 4. Beyaz akkor deşarj teli
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 5;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 4.5;
                ctx.globalAlpha = 1.0;
                lines.forEach((l, i) => ctx.strokeText(l, cx, startY + i * lineSpacing));

            } else if (preset === 'sparks') {
                // 💫 SPARKS (Kıvılcım): Sıcak kehribar ve akkor altın filamenti
                const amber = '#f59e0b';
                const gold = '#fbbf24';
                const grad = ctx.createLinearGradient(0, startY - fontSize * 0.5, 0, startY + totalTextH);
                grad.addColorStop(0, '#fffbeb');
                grad.addColorStop(0.5, gold);
                grad.addColorStop(1, '#d97706');

                // 1. Akkor altın halesi
                ctx.shadowColor = amber;
                ctx.shadowBlur = Math.round(65 * spreadProg * intProg);
                ctx.strokeStyle = amber;
                ctx.lineWidth = 25;
                ctx.globalAlpha = 0.38 * intProg;
                lines.forEach((l, i) => ctx.strokeText(l, cx, startY + i * lineSpacing));

                // 2. Kıvılcım korona
                ctx.shadowColor = gold;
                ctx.shadowBlur = Math.round(30 * spreadProg * intProg);
                ctx.strokeStyle = gold;
                ctx.lineWidth = 13;
                ctx.globalAlpha = 0.75 * intProg;
                lines.forEach((l, i) => ctx.strokeText(l, cx, startY + i * lineSpacing));

                // 3. Altın tüp dolgusu
                ctx.shadowColor = gold;
                ctx.shadowBlur = Math.round(14 * intProg);
                ctx.fillStyle = grad;
                ctx.globalAlpha = 0.95;
                lines.forEach((l, i) => ctx.fillText(l, cx, startY + i * lineSpacing));

                // 4. Kıvılcım beyaz çekirdeği
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 4;
                ctx.strokeStyle = '#fffbeb';
                ctx.lineWidth = 4;
                ctx.globalAlpha = 1.0;
                lines.forEach((l, i) => ctx.strokeText(l, cx, startY + i * lineSpacing));

            } else if (preset === 'rainbow') {
                // 🌈 RAINBOW (Gökkuşağı): Spektrum boydan boya renk gradyanı
                const grad = ctx.createLinearGradient(cx - maxLineWidth / 2, 0, cx + maxLineWidth / 2, 0);
                grad.addColorStop(0.00, '#ff0055');
                grad.addColorStop(0.18, '#ff7700');
                grad.addColorStop(0.36, '#ffdd00');
                grad.addColorStop(0.54, '#00e676');
                grad.addColorStop(0.72, '#00d2ff');
                grad.addColorStop(0.88, '#2979ff');
                grad.addColorStop(1.00, '#aa00ff');

                // 1. Spektrum dış aura
                ctx.shadowColor = '#00d2ff';
                ctx.shadowBlur = Math.round(65 * spreadProg * intProg);
                ctx.strokeStyle = grad;
                ctx.lineWidth = 24;
                ctx.globalAlpha = 0.45 * intProg;
                lines.forEach((l, i) => ctx.strokeText(l, cx, startY + i * lineSpacing));

                // 2. Sıcak taraf ikinci aura
                ctx.shadowColor = '#ff0055';
                ctx.shadowBlur = Math.round(35 * spreadProg * intProg);
                ctx.strokeStyle = grad;
                ctx.lineWidth = 14;
                ctx.globalAlpha = 0.75 * intProg;
                lines.forEach((l, i) => ctx.strokeText(l, cx, startY + i * lineSpacing));

                // 3. Gökkuşağı gövde dolgusu
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = Math.round(12 * intProg);
                ctx.fillStyle = grad;
                ctx.globalAlpha = 0.95;
                lines.forEach((l, i) => ctx.fillText(l, cx, startY + i * lineSpacing));

                // 4. Akkor beyaz çekirdek
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 4;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3.5;
                ctx.globalAlpha = 0.95;
                lines.forEach((l, i) => ctx.strokeText(l, cx, startY + i * lineSpacing));

            } else {
                // ✨ FULLY-LIT (Saf Neon - Kullanıcı rengi ile)
                const nCol = neonColorHex || '#00f0ff';

                // 1. Geniş atmosferik neon aura
                ctx.shadowColor = nCol;
                ctx.shadowBlur = Math.round(60 * spreadProg * intProg);
                ctx.strokeStyle = nCol;
                ctx.lineWidth = 24;
                ctx.globalAlpha = 0.40 * intProg;
                lines.forEach((l, i) => ctx.strokeText(l, cx, startY + i * lineSpacing));

                // 2. Canlı iç korona
                ctx.shadowColor = nCol;
                ctx.shadowBlur = Math.round(28 * spreadProg * intProg);
                ctx.strokeStyle = nCol;
                ctx.lineWidth = 12;
                ctx.globalAlpha = 0.80 * intProg;
                lines.forEach((l, i) => ctx.strokeText(l, cx, startY + i * lineSpacing));

                // 3. Neon tüp gövdesi
                ctx.shadowColor = nCol;
                ctx.shadowBlur = Math.round(12 * intProg);
                ctx.fillStyle = nCol;
                ctx.globalAlpha = 0.92;
                lines.forEach((l, i) => ctx.fillText(l, cx, startY + i * lineSpacing));

                // 4. Akkor beyaz merkez tüpü
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 4;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 4;
                ctx.globalAlpha = 1.0;
                lines.forEach((l, i) => ctx.strokeText(l, cx, startY + i * lineSpacing));
            }

            ctx.restore();

            const tex = new THREE.CanvasTexture(canvas);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.generateMipmaps = false;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.needsUpdate = true;

            return {
                texture: tex,
                canvasW: canvasW,
                canvasH: canvasH,
                fontSize: fontSize
            };
        } catch (e) {
            console.warn('[ThreeD] createSaberTextTexture hatası:', e);
            return null;
        }
    }

    /**
     * 🌟 3D Sahnede Metin Neon Düzlemini Güncelleme (Yöntem A: 2D Saber Düzlem Tabelası)
     */
    function updateNeonPlane(targetEl) {
        const el = targetEl || getActiveElement();
        if (!el || !el.contentGroup) return;

        // 3D metin her zaman saf 3D extrusion/kabartma olarak kalır. 2D düzlem varsa temizle
        if (el.neonPlaneMesh) {
            el.contentGroup.remove(el.neonPlaneMesh);
            if (el.neonPlaneMesh.geometry) el.neonPlaneMesh.geometry.dispose();
            if (el.neonPlaneMesh.material) {
                if (el.neonPlaneMesh.material.map) el.neonPlaneMesh.material.map.dispose();
                el.neonPlaneMesh.material.dispose();
            }
            el.neonPlaneMesh = null;
        }
        if (el.textMesh) {
            el.textMesh.visible = true;
        }
    }

    /**
     * 🌟 Eski 3D Metin Tel Kafes Çizgilerini Temizleme (Eski Yöntemi Kaldırma)
     */
    function applyNeonEdgesToTextMesh(targetEl) {
        const el = targetEl || getActiveElement();
        if (!el || !el.textMesh) return;

        const oldGroup = el.textMesh.getObjectByName('neonEdgeGroup');
        if (oldGroup) {
            el.textMesh.remove(oldGroup);
            oldGroup.traverse(ch => {
                if (ch.geometry) ch.geometry.dispose();
                if (ch.material) ch.material.dispose();
            });
        }
        const oldFrontOverlay = el.textMesh.getObjectByName('neonFrontGlowMesh');
        if (oldFrontOverlay) {
            el.textMesh.remove(oldFrontOverlay);
            if (oldFrontOverlay.geometry) oldFrontOverlay.geometry.dispose();
            if (oldFrontOverlay.material) oldFrontOverlay.material.dispose();
        }
    }

    /**
     * 🌟 Neon Efektini Anlık Güncelleme (2D Saber Düzlemi, İkon Emissive Işıması)
     */
    function updateNeonEffect(targetEl) {
        const el = targetEl || getActiveElement();
        if (!el || !el.contentGroup) return;

        const neonColHex = el.neonColor || state.neonColor || '#00f0ff';
        const neonFrontInt = (el.neonFrontIntensity !== undefined) ? el.neonFrontIntensity : (state.neonFrontIntensity || 0);

        // 1. Eski tel kafes çizgilerini temizle
        applyNeonEdgesToTextMesh(el);

        // 2. 2D Saber Neon Düzlemini Güncelle (Yöntem A)
        updateNeonPlane(el);

        // 3. İğne / Ok gibi ek 3D ikonlar varsa onların da neon renginde parlamasını sağla
        if (el.iconMesh && Array.isArray(el.iconMesh.material) && el.iconMesh.material[0]) {
            const m0 = el.iconMesh.material[0];
            if (neonFrontInt > 0) {
                const frontProg = Math.max(0, Math.min(1.0, neonFrontInt / 100));
                m0.emissive.set(neonColHex);
                m0.emissiveIntensity = frontProg * 3.5;
                m0.toneMapped = false;
            } else {
                m0.emissive.set(0x000000);
                m0.emissiveIntensity = 0;
                m0.toneMapped = true;
            }
            m0.needsUpdate = true;
        }

        // 4. Alt metin grubu varsa
        const subGroup = el.contentGroup.getObjectByName('threeDSubtextGroup');
        if (subGroup) {
            subGroup.traverse(node => {
                if (node.isMesh && Array.isArray(node.material) && node.material[0]) {
                    if (neonFrontInt > 0) {
                        const frontProg = Math.max(0, Math.min(1.0, neonFrontInt / 100));
                        node.material[0].emissive.set(neonColHex);
                        node.material[0].emissiveIntensity = frontProg * 3.5;
                        node.material[0].toneMapped = false;
                    } else {
                        node.material[0].emissive.set(0x000000);
                        node.material[0].emissiveIntensity = 0;
                        node.material[0].toneMapped = true;
                    }
                    node.material[0].needsUpdate = true;
                }
            });
        }

        requestRender();
    }

    function updateElementColorsFast(targetEl, options = {}) {
        const el = targetEl || getActiveElement();
        if (!el || !el.contentGroup) return;

        if (el === getActiveElement()) {
            if (state.frontColor) {
                el.frontColor = state.frontColor;
            }
            if (state.sideColor) {
                el.sideColor = state.sideColor;
                if (!el.badgeSideColor) el.badgeSideColor = state.sideColor;
            }
            if (state.badgeBgColor) el.badgeBgColor = state.badgeBgColor;
            if (state.text3DColor) el.text3DColor = state.text3DColor;
        }

        const onlySide = !!options.onlySide;
        const onlyFront = !!options.onlyFront;
        const sideColorHex = el.sideColor || '#cbd5e1';
        const effectiveSide = el.badgeSideColor || sideColorHex;

        // 🌟 1. YAN KALINLIK RENK GÜNCELLEMESİ (onlyFront DEĞİLSE ÇALIŞIR)
        if (!onlyFront) {
            // Düz renk seçildiğinde yan kalınlık doku kaydını temizle (varsa all dokusunu ön yüze aktar)
            if (el._textureConfigs) {
                if (el._textureConfigs.all) {
                    const prevAll = el._textureConfigs.all;
                    el._textureConfigs.face = Object.assign({}, prevAll);
                    delete el._textureConfigs.all;
                }
                delete el._textureConfigs.frame;
            }

            // Yan yüz renkleri (material[1] ve el.sideMesh) - Doku map'ini temizleyip düz renge dön
            el.contentGroup.traverse((node) => {
                if (node.isMesh) {
                    if (Array.isArray(node.material) && node.material[1]) {
                        const m1 = node.material[1];
                        if (m1.map) {
                            m1.map.dispose();
                            m1.map = null;
                        }
                        m1.color.set(effectiveSide);
                        m1.roughness = (el.roughness !== undefined && el.roughness !== null) ? Math.min(1.0, el.roughness + 0.15) : 0.65;
                        m1.metalness = (el.metalness !== undefined && el.metalness !== null) ? Math.max(0.05, el.metalness - 0.05) : 0.08;
                        m1.needsUpdate = true;
                    }
                    if (node === el.sideMesh && node.material && !Array.isArray(node.material)) {
                        const sm = node.material;
                        if (sm.map) {
                            sm.map.dispose();
                            sm.map = null;
                        }
                        sm.color.set(effectiveSide);
                        sm.roughness = (el.roughness !== undefined && el.roughness !== null) ? Math.min(1.0, el.roughness + 0.15) : 0.65;
                        sm.metalness = (el.metalness !== undefined && el.metalness !== null) ? Math.max(0.05, el.metalness - 0.05) : 0.08;
                        sm.needsUpdate = true;
                    }
                }
            });

            if (onlySide) {
                if (window.ThreeDTextures && typeof window.ThreeDTextures.syncUI === 'function') {
                    window.ThreeDTextures.syncUI();
                }
                requestRender();
                return;
            }
        }

        // 🌟 2. ÖN YÜZ RENK GÜNCELLEMESİ (onlySide DEĞİLSE ÇALIŞIR)
        if (el._textureConfigs) {
            if (el._textureConfigs.all) {
                const prevAll = el._textureConfigs.all;
                el._textureConfigs.frame = Object.assign({}, prevAll);
                delete el._textureConfigs.all;
            }
            delete el._textureConfigs.face;
        }

        const frontColorHex = el.frontColor || '#ffffff';
        const text3DColorHex = el.text3DColor || frontColorHex;

        // Pin / Ok gibi standart geometriler
        if (el.iconMesh && Array.isArray(el.iconMesh.material) && el.iconMesh.material[0]) {
            const m0 = el.iconMesh.material[0];
            if (el.useGradient) {
                if (m0.map) m0.map.dispose();
                m0.map = createColorGradientTexture(frontColorHex);
                m0.color.set(0xffffff);
            } else {
                if (m0.map) {
                    m0.map.dispose();
                    m0.map = null;
                }
                m0.color.set(frontColorHex);
                m0.roughness = (el.roughness !== undefined && el.roughness !== null) ? el.roughness : 0.5;
                m0.metalness = (el.metalness !== undefined && el.metalness !== null) ? el.metalness : 0.1;
            }
            m0.needsUpdate = true;
        }

        // 3D Metin Mesh'leri
        if (el.textMesh) {
            el.textMesh.traverse(node => {
                if (node.isMesh && Array.isArray(node.material) && node.material[0]) {
                    const m0 = node.material[0];
                    if (el.useGradient) {
                        if (m0.map) m0.map.dispose();
                        m0.map = createColorGradientTexture(text3DColorHex);
                        m0.color.set(0xffffff);
                    } else {
                        if (m0.map) {
                            m0.map.dispose();
                            m0.map = null;
                        }
                        m0.color.set(text3DColorHex);
                        m0.roughness = (el.roughness !== undefined && el.roughness !== null) ? el.roughness : 0.5;
                        m0.metalness = (el.metalness !== undefined && el.metalness !== null) ? el.metalness : 0.1;
                    }
                    m0.needsUpdate = true;
                }
            });
        }

        // 3D Alt Metin Grubu
        const subGroup = el.contentGroup.getObjectByName('threeDSubtextGroup');
        if (subGroup) {
            subGroup.traverse(node => {
                if (node.isMesh && Array.isArray(node.material) && node.material[0]) {
                    if (el.useGradient) {
                        if (node.material[0].map) node.material[0].map.dispose();
                        node.material[0].map = createColorGradientTexture(text3DColorHex);
                        node.material[0].color.set(0xffffff);
                    } else {
                        if (node.material[0].map) {
                            node.material[0].map.dispose();
                            node.material[0].map = null;
                        }
                        node.material[0].color.set(text3DColorHex);
                    }
                    node.material[0].needsUpdate = true;
                }
            });
        }

        // Rozet / SVG dokulu ön yüzler (Geometriyi yıkmadan rAF ile dokuyu güncelle)
        if (el.badgeMesh && (el.elementType === 'element_3d' || (el.elementType && el.elementType.startsWith('badge_')) || el.elementType === 'icon_3d')) {
            queueBadgeTextureUpdate(el);
        }

        // 🌟 GLB / GLTF 3D Modelleri İçin Anlık Renk Ayarı (Diffuse Tint / Renk Değişimi)
        if (el.customGltfModel) {
            const frontCol = (el.frontColor || state.frontColor || '').toLowerCase();
            const sideCol = (el.sideColor || state.sideColor || '').toLowerCase();
            const tintCol = (frontCol && frontCol !== '#ffffff') ? new THREE.Color(frontCol) : null;
            const sideTintCol = (sideCol && sideCol !== '#ffffff') ? new THREE.Color(sideCol) : tintCol;

            el.customGltfModel.traverse(node => {
                if (node.isMesh && node.material) {
                    const mats = Array.isArray(node.material) ? node.material : [node.material];
                    mats.forEach((m, idx) => {
                        if (!m._origColor) {
                            m._origColor = m.color ? m.color.clone() : new THREE.Color(0xffffff);
                        }
                        const activeTint = (idx > 0 && sideTintCol) ? sideTintCol : tintCol;
                        if (activeTint) {
                            // Doku ve malzeme kimliğini koruyarak doğal tonlama uygula (monokrom plastiğe dönüştürmez)
                            m.color.copy(m._origColor).multiply(activeTint);
                        } else if (m._origColor) {
                            m.color.copy(m._origColor);
                        }
                        m.needsUpdate = true;
                    });
                }
            });
        }

        if (window.ThreeDTextures && typeof window.ThreeDTextures.syncUI === 'function') {
            window.ThreeDTextures.syncUI();
        }

        updateNeonEffect(el);
        requestRender();
    }

    /**
     * 4. 3D Geometrileri ve Mesh'leri Yeniden Oluşturma
     */
    function recreateContentMeshes(targetEl) {
        const el = targetEl || getActiveElement();
        if (!el || !el.contentGroup) return;

        if (el.customGltfModel) {
            updateContentTransform(el);
            return;
        }

        el._localBoundingBox = null;

        // Hedef aktif ögeyse state'ten en güncel değerleri aktar
        if (el === getActiveElement()) {
            syncActiveElementFromState();
        }

        const cGroup = el.contentGroup;

        if (el.textMesh) {
            cGroup.remove(el.textMesh);
            if (el.textMesh.geometry) el.textMesh.geometry.dispose();
            if (el.textMesh.children && el.textMesh.children.length > 0) {
                el.textMesh.traverse(ch => {
                    if (ch !== el.textMesh) {
                        if (ch.geometry) ch.geometry.dispose();
                        if (ch.material) {
                            if (Array.isArray(ch.material)) ch.material.forEach(m => m && m.dispose && m.dispose());
                            else if (ch.material.dispose) ch.material.dispose();
                        }
                    }
                });
            }
            el.textMesh = null;
        }
        if (el.neonPlaneMesh) {
            cGroup.remove(el.neonPlaneMesh);
            if (el.neonPlaneMesh.geometry) el.neonPlaneMesh.geometry.dispose();
            if (el.neonPlaneMesh.material) {
                if (el.neonPlaneMesh.material.map) el.neonPlaneMesh.material.map.dispose();
                el.neonPlaneMesh.material.dispose();
            }
            el.neonPlaneMesh = null;
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
        if (el.reliefMesh) {
            cGroup.remove(el.reliefMesh);
            if (el.reliefMesh.geometry) el.reliefMesh.geometry.dispose();
            if (el.reliefMesh.material) {
                if (Array.isArray(el.reliefMesh.material)) {
                    el.reliefMesh.material.forEach(m => {
                        if (m && m.map) m.map.dispose();
                        if (m) m.dispose();
                    });
                } else {
                    if (el.reliefMesh.material.map) el.reliefMesh.material.map.dispose();
                    el.reliefMesh.material.dispose();
                }
            }
            el.reliefMesh = null;
        }

        const neonFrontInt = (el.neonFrontIntensity !== undefined) ? el.neonFrontIntensity : (state.neonFrontIntensity || 0);
        const neonColHex = el.neonColor || state.neonColor || '#00f0ff';
        const frontProg = Math.max(0, Math.min(1.0, neonFrontInt / 100));

        let frontGradTex = null;
        if (neonFrontInt > 0) {
            frontGradTex = createNeonFaceTexture(neonColHex, el.frontColor, neonFrontInt);
        } else if (el.useGradient) {
            frontGradTex = createColorGradientTexture(el.frontColor);
        }

        const baseFrontColor = new THREE.Color(el.frontColor || '#ffffff');
        const targetNeonColor = new THREE.Color(neonColHex);
        const effectiveFrontColor = (neonFrontInt > 0)
            ? baseFrontColor.clone().lerp(targetNeonColor, Math.min(1.0, frontProg * 1.2))
            : (el.useGradient ? new THREE.Color(0xffffff) : baseFrontColor);

        const frontMat = new THREE.MeshStandardMaterial({
            color: effectiveFrontColor,
            map: frontGradTex,
            roughness: (neonFrontInt > 0) ? Math.max(0.02, 0.35 - frontProg * 0.32) : el.roughness,
            metalness: (neonFrontInt > 0) ? Math.min(0.95, 0.30 + frontProg * 0.62) : el.metalness
        });

        // 🌟 3D Ön Yüz Neon Parlaması (Emissive Işıma & Pleksi Akrilik Yansıma)
        if (neonFrontInt > 0) {
            const emissiveCol = targetNeonColor.clone();
            if (frontProg > 0.65) {
                emissiveCol.lerp(new THREE.Color(0xffffff), (frontProg - 0.65) * 0.45);
            }
            frontMat.emissive = emissiveCol;
            frontMat.emissiveIntensity = frontProg * 4.2;
            frontMat.toneMapped = false;
            frontMat._isNeonTex = true;
            frontMat._lastNeonColor = neonColHex;
            frontMat._lastFrontInt = neonFrontInt;
        }

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

        const type = (el && el.elementType) ? String(el.elementType) : 'text';

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
            const rawText = (el.text || '').trim() || 'METİN';
            const textString = sanitizeTextForFont(rawText, loadedFont) || 'METIN';
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
            normalizeTextMeshUVs(textGeo);

            el.textMesh = new THREE.Mesh(textGeo, [frontMat, sideMat]);
            el.textMesh.castShadow = true;
            cGroup.add(el.textMesh);

            // 🌟 3D Metin Neon Düzlemi (Yöntem A: 2D Saber Düzlem Tabelası)
            updateNeonPlane(el);
        } else if (type === 'element_3d' && el.sourceSvg) {
            if (!el.sourceSvgOriginal) el.sourceSvgOriginal = el.sourceSvg;
            const rawSource = el.sourceSvgOriginal || el.sourceSvg;
            const shouldRecolor = !!(el._userHasChangedColor && el.frontColor);
            const recoloredSvg = shouldRecolor ? recolorSvg(rawSource, el.frontColor, { forceRecolor: true }) : rawSource;
            const svgToRender = (el.text || el.badgeSubtext) ? updateSvgText(recoloredSvg, el.text, el.badgeSubtext) : recoloredSvg;
            const shapeMode = el.shapeMode || (el.isExactSilhouette ? 'silhouette' : (el.isRound ? 'coin' : 'card'));
            const isRound = (shapeMode === 'coin');
            const res = createShapeAndBoundsFromSvg(svgToRender, {
                isRound: isRound,
                shapeMode: shapeMode,
                cachedSilhouette: el.cachedSilhouette,
                el: el
            });
            if (res && res.shape) {
                const shape = res.shape;
                const bounds = res.bounds;
                const isExactSilhouette = !!res.isExactSilhouette;
                el.isExactSilhouette = isExactSilhouette;
                const uvGen = getNormalizedUVGenerator(bounds.minX, bounds.maxX, bounds.minY, bounds.maxY);

                const isEstateItem = !!el.estateItemId;
                const isFenceItem = !!(el.isFence || (el.tags && el.tags.includes('çit')));
                // Sadece tel çitler veya açıkça düzlem istenen nesneler tek parça PlaneGeometry kalır:
                const isPurePlane = isFenceItem || (!isExactSilhouette && el.shapeMode === 'plane');

                const badgeTex = createExactSvgTexture(
                    svgToRender,
                    bounds.vbW,
                    bounds.vbH,
                    () => requestRender(),
                    el.frontColor,
                    el.badgeBgColor,
                    bounds.isCircle,
                    isExactSilhouette,
                    { 
                        useGradient: !!el.useGradient, 
                        isShape: !!(el.isShape || el.isSurfaceBase),
                        isEstate: isEstateItem,
                        forceRecolor: !!el._userHasChangedColor
                    }
                );

                const badgeFrontMat = new THREE.MeshStandardMaterial({
                    map: badgeTex,
                    roughness: el.roughness !== undefined ? el.roughness : 0.55,
                    metalness: el.metalness !== undefined ? el.metalness : 0.08,
                    transparent: isPurePlane || (!isExactSilhouette && (!el.badgeBgColor || el.badgeBgColor === 'transparent')),
                    alphaTest: isPurePlane ? 0.04 : 0.02,
                    depthWrite: true,
                    side: THREE.DoubleSide
                });

                let badgeGeo;

                if (isPurePlane) {
                    // 🌟 TEK PARÇA 3D DÜZLEM: Tel çitler için hafif, şeffaf ve pürüzsüz düzlem
                    const geoW = bounds.targetW || 220;
                    const geoH = bounds.targetH || 220;
                    badgeGeo = new THREE.PlaneGeometry(geoW, geoH);
                    badgeGeo.computeBoundingBox();

                    // Taban Hizalama (Base Alignment): Alt kenarı tam Y = 0 çizgi/zemin hizasına oturt
                    if (el.isBaseAligned || isFenceItem) {
                        el.isBaseAligned = true;
                        badgeGeo.translate(0, geoH / 2, 0);
                        badgeGeo.computeBoundingBox();
                    }

                    el.badgeMesh = new THREE.Mesh(badgeGeo, badgeFrontMat);
                } else {
                    // 🌟 GERÇEK 3D KATI GÖVDE (Extruded Solid 3D Geometry):
                    // Evler, villalar, binalar, ağaçlar ve 3D rozetler için gerçek mimari kalınlık,
                    // masif yan duvarlar ve arka kapak!
                    const isSilhouette = (shapeMode === 'silhouette');
                    const safeBevelSize = isSilhouette ? Math.min(0.8, el.bevelSize || 1.5) : el.bevelSize;
                    const safeBevelThickness = isSilhouette ? Math.min(1.2, el.bevelThickness || 2) : el.bevelThickness;
                    const effectiveDepth = Math.max(12, el.depth || (isEstateItem ? 60 : 20));

                    const badgeExtrudeOpts = {
                        depth: effectiveDepth,
                        bevelEnabled: !!el.bevelEnabled,
                        bevelThickness: safeBevelThickness,
                        bevelSize: safeBevelSize,
                        bevelSegments: 3,
                        curveSegments: 24,
                        UVGenerator: uvGen
                    };

                    badgeGeo = new THREE.ExtrudeGeometry(shape, badgeExtrudeOpts);
                    badgeGeo.center();
                    badgeGeo.computeBoundingBox();

                    // Taban Hizalama (Base Alignment): Alt kenarı zemin hizasına oturt (pivot tam tabanda)
                    const isBaseAligned = !!(el.isBaseAligned || el.isFence || el.estateItemId);
                    if (isBaseAligned) {
                        el.isBaseAligned = true;
                        const minY = badgeGeo.boundingBox.min.y;
                        badgeGeo.translate(0, -minY, 0);
                        badgeGeo.computeBoundingBox();
                    }

                    // 🌟 Silüet için Sub-Pixel Hassasiyetinde UV Düzeltmesi (1:1 Vektör Hizalama)
                    if (isExactSilhouette && el.cachedSilhouette && el.cachedSilhouette.pixelBBox) {
                        const pBox = el.cachedSilhouette.pixelBBox;
                        const W = pBox.W, H = pBox.H;
                        const bb = badgeGeo.boundingBox;
                        const geoW = bb.max.x - bb.min.x || 1;
                        const geoH = bb.max.y - bb.min.y || 1;
                        const uvAttr = badgeGeo.attributes.uv;
                        const posAttr = badgeGeo.attributes.position;
                        const frontZThreshold = (effectiveDepth / 2) - 0.5;

                        for (let i = 0; i < posAttr.count; i++) {
                            const z = posAttr.getZ(i);
                            if (z >= frontZThreshold) {
                                // 🌟 Ön yüz UV hizalaması (Kameraya bakan mimari ön cephe)
                                const x = posAttr.getX(i);
                                const y = posAttr.getY(i);
                                const nx = Math.max(0, Math.min(1, (x - bb.min.x) / geoW));
                                const ny = Math.max(0, Math.min(1, (y - bb.min.y) / geoH));
                                const u = (pBox.minX / W) + nx * ((pBox.maxX - pBox.minX) / W);
                                const v = (1 - pBox.maxY / H) + ny * ((pBox.maxY - pBox.minY) / H);
                                uvAttr.setXY(i, Math.max(0.0001, Math.min(0.9999, u)), Math.max(0.0001, Math.min(0.9999, v)));
                            } else if (isEstateItem && z <= -frontZThreshold) {
                                // 🌟 Arka yüz UV hizalaması (Aynalanmış mimari arka cephe - ev arkadan da pencereli ve tam görünür)
                                const x = posAttr.getX(i);
                                const y = posAttr.getY(i);
                                const nx = Math.max(0, Math.min(1, (bb.max.x - x) / geoW));
                                const ny = Math.max(0, Math.min(1, (y - bb.min.y) / geoH));
                                const u = (pBox.minX / W) + nx * ((pBox.maxX - pBox.minX) / W);
                                const v = (1 - pBox.maxY / H) + ny * ((pBox.maxY - pBox.minY) / H);
                                uvAttr.setXY(i, Math.max(0.0001, Math.min(0.9999, u)), Math.max(0.0001, Math.min(0.9999, v)));
                            }
                        }
                        uvAttr.needsUpdate = true;
                    }

                    // 🌟 Kapak Malzeme İndeksleri:
                    // Three.js ExtrudeGeometry'de:
                    // start: lidGroup.start -> Z = -depth/2 (ARKA KAPAK)
                    // start: lidGroup.start + halfLid -> Z = +depth/2 (ÖN KAPAK, KAMERAYA BAKAN YÜZ)
                    if (badgeGeo.groups && badgeGeo.groups.length >= 2) {
                        const lidGroup = badgeGeo.groups[0];
                        const halfLid = Math.floor(lidGroup.count / 2);
                        if (!isEstateItem) {
                            // Rozetler için: Arka kapağa katı malzeme ata (çift parça illüzyonunu önle)
                            badgeGeo.groups[0] = { start: lidGroup.start, count: halfLid, materialIndex: 1 };
                            badgeGeo.groups.splice(1, 0, { start: lidGroup.start + halfLid, count: lidGroup.count - halfLid, materialIndex: 0 });
                        } else {
                            // 🏡 Emlak Ögeleri (Evler, Villalar, Ağaçlar):
                            // Ön kapak daima detaylı mimari ön cephe görselini (materialIndex: 0) alır!
                            // Arka kapak da mimari dokuyu (materialIndex: 0) alarak evin her açıdan pencereli ve tam bir yapı olarak görünmesini sağlar.
                            badgeGeo.groups[0] = { start: lidGroup.start, count: halfLid, materialIndex: 0 };
                            badgeGeo.groups.splice(1, 0, { start: lidGroup.start + halfLid, count: lidGroup.count - halfLid, materialIndex: 0 });
                        }
                    }

                    // 🌟 Masif ve Gerçekçi 3D Mimari Gövde Malzemesi:
                    // Yan duvarlar ve çatı asla hayalet/şeffaf (%15) kalmaz; katı ve kaliteli mat yüzey olarak çizilir.
                    const effectiveSideMat = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(el.sideColor || (isEstateItem ? (el.isFence ? '#14532d' : (el.category === 'landscape' ? '#166534' : '#475569')) : '#334155')),
                        roughness: el.roughness !== undefined ? el.roughness : 0.65,
                        metalness: el.metalness !== undefined ? el.metalness : 0.08,
                        transparent: false,
                        opacity: 1.0,
                        depthWrite: true,
                        side: THREE.DoubleSide
                    });

                    el.badgeMesh = new THREE.Mesh(badgeGeo, [badgeFrontMat, effectiveSideMat]);
                }

                el.badgeMesh.castShadow = true;
                const hasAttached = elements.some(e => e && e.attachedTo === el.id);
                el.badgeMesh.receiveShadow = hasAttached;
                cGroup.add(el.badgeMesh);
            }
        } else if (type && (type.startsWith('badge_') || type === 'icon_3d')) {
            let shape = null;
            let badgeW = 220, badgeH = 70;
            if (type === 'badge_pill') {
                shape = createPillShape(220, 70);
                badgeW = 220; badgeH = 70;
            } else if (type === 'badge_shield') {
                shape = createShieldShape(160, 180);
                badgeW = 160; badgeH = 180;
            } else if (type === 'badge_card') {
                shape = createCardShape(220, 120, 16);
                badgeW = 220; badgeH = 120;
            } else if (type === 'badge_coin' || type === 'icon_3d') {
                shape = createCoinShape(75);
                badgeW = 150; badgeH = 150;
            } else {
                shape = createPillShape(220, 70);
                badgeW = 220; badgeH = 70;
            }

            const bounds = getShapeBounds(shape);
            const uvGen = getNormalizedUVGenerator(bounds.minX, bounds.maxX, bounds.minY, bounds.maxY);

            const badgeDepth = Math.max(1, el.depth || 16);
            const badgeExtrudeOpts = {
                depth: badgeDepth,
                bevelEnabled: !!el.bevelEnabled,
                bevelThickness: el.bevelThickness,
                bevelSize: el.bevelSize,
                bevelSegments: 3,
                curveSegments: 16,
                UVGenerator: uvGen
            };

            const badgeGeo = new THREE.ExtrudeGeometry(shape, badgeExtrudeOpts);
            badgeGeo.center();

            // 🌟 Kapak Malzeme İndeksleri:
            // start: lidGroup.start -> Z = -depth/2 (ARKA KAPAK) -> materialIndex: 1 (badgeSideMat)
            // start: lidGroup.start + halfLid -> Z = +depth/2 (ÖN KAPAK, KAMERAYA BAKAN YÜZ) -> materialIndex: 0 (badgeFrontMat)
            if (badgeGeo.groups && badgeGeo.groups.length >= 2) {
                const lidGroup = badgeGeo.groups[0];
                const halfLid = Math.floor(lidGroup.count / 2);
                badgeGeo.groups[0] = { start: lidGroup.start, count: halfLid, materialIndex: 1 };
                badgeGeo.groups.splice(1, 0, { start: lidGroup.start + halfLid, count: lidGroup.count - halfLid, materialIndex: 0 });
            }

            const elementSvg = el.sourceSvg || (el.selectedIconId && el.selectedIconId !== 'none' ? getIconSvgById(el.selectedIconId) : null) || el.customIconSvg;
            const hasElement = !!elementSvg;
            const elementMode = el.badgeElementMode || 'emboss';
            const hasText = !el.show3DText && !!((el.text || '').trim() || (el.badgeSubtext || '').trim());

            const badgeTex = createBadgeTexture(
                type,
                el.show3DText ? '' : el.text,
                el.show3DText ? '' : el.badgeSubtext,
                el.selectedIconId,
                el.badgeBgColor || '#ffffff',
                el.frontColor,
                el.frontColor,
                () => requestRender(),
                {
                    useGradient: !!el.useGradient,
                    sourceSvg: (elementMode === 'flat') ? elementSvg : null,
                    elementMode: elementMode,
                    embossScale: el.embossScale !== undefined ? el.embossScale : 85,
                    embossOffsetX: el.embossOffsetX || 0,
                    embossOffsetY: el.embossOffsetY || 0,
                    hasRelief: (elementMode === 'emboss') && hasElement,
                    hasText: hasText
                }
            );

            const badgeFrontMat = new THREE.MeshStandardMaterial({
                map: badgeTex,
                roughness: el.roughness !== undefined ? el.roughness : 0.45,
                metalness: el.metalness !== undefined ? el.metalness : 0.15
            });

            const badgeSideColorHex = el.badgeSideColor || '#cbd5e1';
            const badgeSideMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(badgeSideColorHex),
                roughness: el.roughness !== undefined ? el.roughness : 0.45,
                metalness: el.metalness !== undefined ? el.metalness : 0.15,
                side: THREE.DoubleSide
            });

            el.badgeMesh = new THREE.Mesh(badgeGeo, [badgeFrontMat, badgeSideMat]);
            el.badgeMesh.castShadow = true;
            const hasAttCard = elements.some(e => e && e.attachedTo === el.id);
            el.badgeMesh.receiveShadow = hasAttCard || (elementMode === 'emboss');
            cGroup.add(el.badgeMesh);

            // 🌟 3D Kabartma / Emboss Mesh
            if (elementMode === 'emboss' && hasElement) {
                createBadgeReliefMesh(el, type, badgeDepth, cGroup, badgeW, badgeH, hasText);
            }
        }

        // 🌟 3D Alt Metin / Yazı Oluşturucu (İkonlar, Rozetler, Silüetler ve Pinler İçin)
        const canHaveSubtext = (type === 'element_3d' || type === 'pin' || type === 'arrow' || (type && type.startsWith('badge_')));
        if (canHaveSubtext && el.show3DText && loadedFont) {
            const mainClean = sanitizeTextForFont(el.text || '', loadedFont);
            const subClean = sanitizeTextForFont(el.badgeSubtext || '', loadedFont);

            if (mainClean || subClean) {
                const textGroup = new THREE.Group();
                textGroup.name = 'threeDSubtextGroup';

                const subSize = el.text3DSize || 22;
                const subDepth = el.text3DDepth || Math.max(4, Math.round(el.depth * 0.5));
                const textExtrudeOpts = {
                    font: loadedFont,
                    size: subSize,
                    height: subDepth,
                    curveSegments: 6,
                    bevelEnabled: !!el.bevelEnabled,
                    bevelThickness: Math.min(1.0, el.bevelThickness || 1.5),
                    bevelSize: Math.min(0.8, el.bevelSize || 1),
                    bevelSegments: 2
                };

                const textFrontColor = el.text3DColor || el.frontColor || '#ffffff';
                const textGradTex = el.useGradient ? createColorGradientTexture(textFrontColor) : null;
                const textFrontMat = new THREE.MeshStandardMaterial({
                    color: el.useGradient ? new THREE.Color(0xffffff) : new THREE.Color(textFrontColor),
                    map: textGradTex,
                    roughness: el.roughness,
                    metalness: el.metalness
                });
                const textSideMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(autoGenerateSideColor(textFrontColor)),
                    roughness: Math.min(1.0, el.roughness + 0.15),
                    metalness: Math.max(0.1, el.metalness - 0.1)
                });

                let line1Mesh = null;
                let line2Mesh = null;

                if (mainClean) {
                    const g1 = new THREE.TextGeometry(mainClean, textExtrudeOpts);
                    g1.center();
                    line1Mesh = new THREE.Mesh(g1, [textFrontMat, textSideMat]);
                    line1Mesh.castShadow = true;
                    textGroup.add(line1Mesh);
                }

                if (subClean) {
                    const subExtrudeOpts = Object.assign({}, textExtrudeOpts, {
                        size: Math.max(10, Math.round(subSize * 0.65)),
                        height: Math.max(2, Math.round(subDepth * 0.8))
                    });
                    const g2 = new THREE.TextGeometry(subClean, subExtrudeOpts);
                    g2.center();
                    line2Mesh = new THREE.Mesh(g2, [textFrontMat, textSideMat]);
                    line2Mesh.castShadow = true;
                    if (line1Mesh) {
                        const lineGap = subSize * 0.95;
                        line1Mesh.position.y = (lineGap / 2);
                        line2Mesh.position.y = -(lineGap / 2);
                    }
                    textGroup.add(line2Mesh);
                }

                // Y Pozisyonu: İkon veya rozetin üst/alt sınırını tespit et
                const isStanding = !!(el.isBaseAligned || el.isFence || el.estateItemId);
                let anchorY = -50;
                if (el.badgeMesh && el.badgeMesh.geometry) {
                    if (!el.badgeMesh.geometry.boundingBox) el.badgeMesh.geometry.computeBoundingBox();
                    const bb = el.badgeMesh.geometry.boundingBox;
                    anchorY = isStanding ? (bb.max.y + 12) : bb.min.y;
                } else if (el.iconMesh && el.iconMesh.geometry) {
                    if (!el.iconMesh.geometry.boundingBox) el.iconMesh.geometry.computeBoundingBox();
                    const bb = el.iconMesh.geometry.boundingBox;
                    anchorY = isStanding ? (bb.max.y + 12) : bb.min.y;
                }

                const userXOffset = (el.text3DXOffset !== undefined) ? el.text3DXOffset : 0;
                const defaultOffset = isStanding ? 0 : -25;
                const userOffset = (el.text3DOffset !== undefined) ? el.text3DOffset : defaultOffset;
                const totalY = anchorY + (isStanding ? (userOffset === -25 ? 0 : userOffset) : userOffset);

                textGroup.position.set(userXOffset, totalY, 0);

                // Yönlendirme Modu: "together" (birlikte) vs "separate" (ayrı açı/eğim)
                if (el.text3DMode === 'separate') {
                    const pRad = THREE.MathUtils.degToRad(el.text3DPitch || 0);
                    const yRad = THREE.MathUtils.degToRad(el.text3DYaw || 0);
                    const rRad = THREE.MathUtils.degToRad(el.text3DRoll || 0);
                    textGroup.rotation.set(pRad, yRad, rRad);
                } else {
                    textGroup.rotation.set(0, 0, 0);
                }

                el.textMesh = textGroup;
                cGroup.add(textGroup);
            }
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
            if (type === 'text' && el.textMesh) el.textMesh.position.set(0, 0, 0);
            if (el.badgeMesh) el.badgeMesh.position.set(0, 0, 0);
        }

        if (el.neonPlaneMesh) {
            if (el.textMesh) {
                el.neonPlaneMesh.position.set(el.textMesh.position.x, el.textMesh.position.y, 0.5);
            } else {
                el.neonPlaneMesh.position.set(0, 0, 0.5);
            }
        }

        // Aktif öge ise modül referanslarını güncelle
        if (el === getActiveElement()) {
            textMesh = el.textMesh;
            iconMesh = el.iconMesh;
            badgeMesh = el.badgeMesh;
        }

        updateContentTransform(el);

        // 🌟 Eğer bu öge başka bir ögeye yapıştırılmışsa veya buna bağlı ögeler varsa yüzey temasını ve ofsetlerini anında güncelle
        if (el.attachedTo) {
            const baseEl = elements.find(item => item.id === el.attachedTo);
            if (baseEl && window.ThreeDAlign && typeof window.ThreeDAlign.snapToSurface === 'function') {
                window.ThreeDAlign.snapToSurface(el, baseEl, { silent: true });
            }
        }
        const attachedChildren = elements.filter(item => item.attachedTo === el.id);
        if (attachedChildren.length > 0 && window.ThreeDAlign && typeof window.ThreeDAlign.snapToSurface === 'function') {
            attachedChildren.forEach(child => {
                window.ThreeDAlign.snapToSurface(child, el, { silent: true });
            });
        }

        // 🌟 Özel Doku / Malzemeleri Yeniden Giydir
        if (window.ThreeDTextures && typeof window.ThreeDTextures.reapplyElementTextures === 'function') {
            window.ThreeDTextures.reapplyElementTextures(el);
        }

        notifyExternalUpdates();
        requestRender();
    }

    function getSurfacePair(specificEl) {
        const activeEl = specificEl || getActiveElement();
        if (!activeEl) return null;
        let baseEl = null;
        let childEl = null;
        if (activeEl.attachedTo) {
            childEl = activeEl;
            baseEl = elements.find(e => e.id === activeEl.attachedTo);
        } else {
            const child = elements.find(e => e.attachedTo === activeEl.id);
            if (child) {
                baseEl = activeEl;
                childEl = child;
            } else if (activeEl.groupId) {
                const groupMembers = elements.filter(e => e.groupId === activeEl.groupId);
                if (groupMembers.length >= 2) {
                    baseEl = groupMembers.find(e => e.isSurfaceBase || e.elementType !== 'text') || groupMembers[0];
                    childEl = groupMembers.find(e => e !== baseEl) || groupMembers[1];
                }
            }
        }
        if (baseEl && childEl && baseEl !== childEl) {
            return { baseEl, childEl };
        }
        return null;
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

        const isBaseAligned = !!(el.isBaseAligned || el.isFence || el.estateItemId);
        const zPos = (el.posZ || 0);

        // 🎯 planeGroup nesnenin gerçek dünya koordinatında (el.posX, el.posY, zPos) durur; dönüşler kendi eksenindedir
        el.planeGroup.position.set(el.posX || 0, el.posY || 0, zPos);

        if (isBaseAligned) {
            // 🛡️ Taban hizalı ögelerde planeGroup dünya merkezinde savrulmaz; yerinde durur
            el.planeGroup.rotation.set(0, 0, 0);
            el.planeGroup.scale.set(1, 1, 1);
        } else {
            const pitchRad = THREE.MathUtils.degToRad(el.planePitch);
            const yawRad = THREE.MathUtils.degToRad(el.planeYaw);
            const rollRad = THREE.MathUtils.degToRad(el.planeRoll);

            el.planeGroup.rotation.order = 'ZYX';
            el.planeGroup.rotation.set(pitchRad, yawRad, rollRad);
            el.planeGroup.scale.set(1, 1, 1);
        }

        if (el.shadowPlane) {
            el.shadowPlane.visible = false;
        }
        const gPlane = getGlobalShadowPlane();
        if (gPlane && gPlane.material) {
            gPlane.material.opacity = (state && state.shadowOpacity !== undefined) ? state.shadowOpacity : 0.20;
            gPlane.material.needsUpdate = true;
            updateGlobalShadowPlaneZ();
        }

        updateContentTransform(el);

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

        // 🌟 Eğer bu öge bir tabana yapışık (child) ise: tabanın contentGroup'u içine ekle ve yerel yüzey koordinatlarında konumlandır!
        if (el.attachedTo) {
            const baseEl = elements.find(b => b && b.id === el.attachedTo);
            if (baseEl && baseEl.id !== el.id && baseEl.contentGroup) {
                // Döngüsel sahne ağacı koruması (Circular reference guard)
                if (baseEl.attachedTo === el.id) {
                    delete baseEl.attachedTo;
                }
                if (el.contentGroup.parent !== baseEl.contentGroup) {
                    if (el.contentGroup.parent) el.contentGroup.parent.remove(el.contentGroup);
                    baseEl.contentGroup.add(el.contentGroup);
                }
                if (el.planeGroup) el.planeGroup.visible = false;
                if (el.shadowPlane) el.shadowPlane.visible = false;

                // 🌟 Zemin ögesinin (baseEl) yüzeyinin ön yüz ögelerinden temiz ve doğal gölge almasını sağla
                baseEl.contentGroup.traverse(ch => {
                    if (ch.isMesh && ch !== baseEl.shadowPlane) {
                        ch.receiveShadow = true;
                    }
                });
                const baseScale = baseEl.planeScale || 1.0;
                const childScale = (el.planeScale || 1.0) / (baseScale || 1.0);
                const baseD = Math.max(1, baseEl.depth || 16) + (baseEl.bevelEnabled ? (baseEl.bevelThickness || 2) * 2 : 0);
                const childD = Math.max(1, el.depth || 8) + (el.bevelEnabled ? (el.bevelThickness || 2) * 2 : 0);
                const offset = (el.surfaceOffset !== undefined) ? el.surfaceOffset : 2.5;
                const totalD = (baseD / 2) + (childD / 2) * childScale + (offset / (baseScale || 1.0));
                const locX = (el.surfaceLocalX !== undefined) ? el.surfaceLocalX : 0;
                const locY = (el.surfaceLocalZ !== undefined) ? el.surfaceLocalZ : 0;
                const angleDeg = (el.surfaceAngle !== undefined) ? el.surfaceAngle : 0;
                const angleRad = THREE.MathUtils.degToRad(angleDeg);

                el.contentGroup.position.set(locX, locY, totalD);
                el.contentGroup.rotation.order = 'ZYX';
                el.contentGroup.rotation.set(0, 0, -angleRad);
                el.contentGroup.scale.set(childScale, childScale, childScale);
                const isBehind = totalD < -(baseD / 2);
                const rOrder = (baseEl.contentGroup.renderOrder || 10) + (isBehind ? -5 : 5);
                el.contentGroup.renderOrder = rOrder;
                el.contentGroup.traverse(ch => {
                    if (ch.isMesh) {
                        ch.renderOrder = rOrder;
                        ch.castShadow = true;
                        ch.receiveShadow = isBehind ? true : false;
                    }
                });
                if (el === getActiveElement()) updateGizmoPositions();
                return;
            }
        }

        const camZ = (camera && camera.position && typeof camera.position.z === 'number') ? camera.position.z : 850;
        const maxSafeZ = Math.min(600, camZ - 250);
        const minSafeZ = -2000;
        if (typeof el.posZ === 'number') {
            el.posZ = Math.max(minSafeZ, Math.min(maxSafeZ, el.posZ));
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
            } else if (el.customGltfModel) {
                const lBox = getElementLocalBoundingBox(el);
                if (lBox && !lBox.isEmpty()) {
                    halfHeight = Math.max(20, (lBox.max.y - lBox.min.y) / 2);
                }
            }
        } catch (e) {}

        const scale = (el.planeScale !== undefined && el.planeScale !== null) ? el.planeScale : (state.planeScale || 1.0);
        const halfDepth = (Math.max(1, el.depth) / 2 + (el.bevelEnabled ? (el.bevelThickness || 2) : 0)) * scale;
        const isBaseAligned = !!(el.isBaseAligned || el.isFence || el.estateItemId);
        
        // 🌟 Taban hizalı çit/duvar/binalarda taban tam Y=0'da olduğu için zemin kaldırması sadece yarım derinliktir
        const groundLift = isBaseAligned ? halfDepth : (isStanding ? (halfHeight * scale) : halfDepth);

        // 🌟 3D Katman Yüksekliği (Öne Al / Geriye At Derinliği)
        const layerIdx = (typeof el.layerIndex === 'number') ? el.layerIndex : elements.indexOf(el);
        const layerLift = Math.max(0, layerIdx) * 6.0;

        const scaleX = scale * (el.scaleX !== undefined ? el.scaleX : 1.0);
        const scaleY = scale * (el.scaleY !== undefined ? el.scaleY : 1.0) * (el.heightScale !== undefined ? el.heightScale : 1.0);
        const scaleZ = scale * (el.scaleZ !== undefined ? el.scaleZ : 1.0);
        if (el.planeGroup) {
            el.planeGroup.position.set(el.posX || 0, el.posY || 0, zPos);
        }
        el.contentGroup.position.set(0, 0, elev + groundLift + layerLift);
        el.contentGroup.scale.set(scaleX, scaleY, scaleZ);

        // 🌟 Three.js Render Sıralaması (Üstteki katman her zaman önde çizilir)
        const rOrder = 10 + Math.max(0, layerIdx) * 10;
        el.contentGroup.renderOrder = rOrder;
        el.contentGroup.traverse(ch => {
            if (ch.isMesh) {
                ch.renderOrder = (ch === el.shadowPlane) ? 1 : rOrder;
            }
        });

        // 🎯 3D Ögenin Düzlem Üzerinde Kendi Ekseni Etrafında Dönüşü (Plakayı/Izgarayı döndürmez!)
        el.contentGroup.rotation.order = 'ZYX';
        const isFenceEl = !!(el.isFence || el.isFenceGroup);
        const pitchRad = THREE.MathUtils.degToRad(el.itemPitch || el.planePitch || 0);
        const yawRad = THREE.MathUtils.degToRad(el.planeLocalRot || 0);
        const rollRad = THREE.MathUtils.degToRad(el.itemRoll || 0);
        const localRotRad = THREE.MathUtils.degToRad(el.planeLocalRot || 0);

        if (isFenceEl) {
            // 🛡️ Çit Segmenti: Taban çizgisi üzerinde localRotRad ile Z ekseninde çizgiye hizalanır.
            // pitchRad ile doğrudan taban çizgisi etrafında öne/arkaya yatar.
            const fenceYaw = THREE.MathUtils.degToRad(el.planeYaw || 0);
            el.contentGroup.rotation.set(pitchRad, fenceYaw, localRotRad);
        } else {
            // 🎯 Evler, Villalar, Ağaçlar, 3D Rozetler ve Simgeler:
            // Slot 0 (X - Kırmızı Dot X): Öne/Arkaya Eğim (Pitch)
            // Slot 1 (Y - Yeşil Dot Y): Kendi Ekseni Etrafında 360° Yatay Dönüş (Yaw)
            // Slot 2 (Z - Mavi Dot Z): Sağa/Sola Yatırma (Roll)
            el.contentGroup.rotation.set(pitchRad, yawRad, -rollRad);
        }

        if (el.shadowPlane) {
            el.shadowPlane.visible = false;
        }
        updateGlobalShadowPlaneZ();

        if (el === getActiveElement()) {
            if (gridHelper) {
                gridHelper.position.set(0, 0, 0);
                gridHelper.visible = !!state.selected && !!state.showPlaneGrid && el.visible !== false;
            }
            updateLighting();
            updateGizmoPositions();
        }

        // 🌟 Bu ögeye bağlı yüzey çocukları varsa onların da transformunu güncelle
        const attachedChildren = elements.filter(c => c && c.attachedTo === el.id);
        if (attachedChildren.length > 0) {
            attachedChildren.forEach(child => updateContentTransform(child));
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

        // ☀️ Işık Hedefi: Sahnedeki tüm ögeleri kapsayan dinamik ağırlık merkezine odaklanır.
        // Böylece tuvalin kenarındaki nesnelerde bile gölgeler bıçak gibi kesilmez.
        const sceneCenter = new THREE.Vector3(0, 0, 0);
        let maxSceneDim = 2500;
        if (elements && elements.length > 0) {
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            elements.forEach(e => {
                if (e && e.visible !== false) {
                    const x = e.posX || 0;
                    const y = e.posY || 0;
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            });
            if (minX !== Infinity) {
                sceneCenter.set((minX + maxX) / 2, (minY + maxY) / 2, 0);
                const spanX = Math.abs(maxX - minX);
                const spanY = Math.abs(maxY - minY);
                maxSceneDim = Math.max(spanX, spanY) * 1.3 + 800;
            }
        }

        dirLight.position.set(state.sunPosX, state.sunPosY, state.sunPosZ);
        if (dirLight.target) {
            dirLight.target.position.copy(sceneCenter);
            dirLight.target.updateMatrixWorld(true);
        }
        dirLight.updateMatrixWorld(true);
        dirLight.intensity = state.lightIntensity;

        const gPlane = getGlobalShadowPlane();
        if (gPlane && gPlane.material) {
            gPlane.material.opacity = (state && state.shadowOpacity !== undefined) ? state.shadowOpacity : 0.20;
            gPlane.material.needsUpdate = true;
            updateGlobalShadowPlaneZ();
        }

        if (renderer && renderer.shadowMap && renderer.shadowMap.type !== THREE.PCFSoftShadowMap) {
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }

        if (dirLight.shadow) {
            dirLight.shadow.radius = state.shadowSoftness || 2.5;
            dirLight.shadow.needsUpdate = true;
            const dist = dirLight.position.distanceTo(sceneCenter);
            // Sahnedeki tüm ögeleri kesintisiz kapsayan yüksek çözünürlüklü gölge kamerası
            const d = Math.max(900, Math.min(2600, maxSceneDim));
            dirLight.shadow.camera.left = -d;
            dirLight.shadow.camera.right = d;
            dirLight.shadow.camera.top = d;
            dirLight.shadow.camera.bottom = -d;
            dirLight.shadow.camera.near = 50;
            dirLight.shadow.camera.far = Math.max(7000, dist + d * 2);
            dirLight.shadow.bias = -0.00002;
            dirLight.shadow.normalBias = 0.05;
            dirLight.shadow.camera.updateProjectionMatrix();
        }

        // Dekoratif Güneş Işını Çizgisi: Seçili ögeye veya merkeze rehberlik eder
        if (sunRayLine && sunRayLine.geometry && sunGroup) {
            const rayTarget = new THREE.Vector3(0, 0, 0);
            const activeEl = getActiveElement();
            if (activeEl && activeEl.contentGroup) {
                activeEl.contentGroup.getWorldPosition(rayTarget);
            }
            const pts = [sunGroup.position.clone(), rayTarget];
            sunRayLine.geometry.setFromPoints(pts);
            sunRayLine.computeLineDistances();
        }
    }

    /**
     * 6. Akıllı On-Demand Render Yöneticisi (GPU & Batarya Dostu)
     */
    let renderScheduled = false;

    function startRenderLoop() {
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }
        renderScheduled = false; // 🌟 İptal edilen animasyon karesinin kilidini mutlaka aç
        requestRender();
    }

    function requestRender() {
        if (!renderScheduled) {
            renderScheduled = true;
            animFrameId = requestAnimationFrame(() => {
                renderScheduled = false;
                animFrameId = null;
                if (state.active && renderer && scene && camera) {
                    try {
                        renderer.render(scene, camera);
                    } catch (renderErr) {
                        console.error('[ThreeDEngine] Render hatası:', renderErr);
                    }
                }
            });
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
                ? '<i class="fas fa-bullseye"></i> 4 Köşe'
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
        const oldScale = state.planeScale || 1.0;
        state.planeScale = Math.max(0.25, Math.min(3.0, parseFloat((avgW / 360).toFixed(2))));
        if (Math.abs(state.planeScale - oldScale) > 0.001 && window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateScaleDelta === 'function') {
            window.ThreeDGrouping.propagateScaleDelta(getActiveElement(), state.planeScale, oldScale);
        }

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
                    <marker id="gizmoArrowX" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#ef4444"/>
                    </marker>
                    <marker id="gizmoArrowY" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#10b981"/>
                    </marker>
                    <marker id="gizmoArrowZ" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#00d2ff"/>
                    </marker>
                </defs>
                <!-- Şeffaf Geniş Tutma Çizgileri (Ok çizgisi ve ucu boyunca doğrudan sürüklenebilir) -->
                <line id="threeDGizmoHitX" class="three-d-gizmo-hit-line" x1="0" y1="0" x2="0" y2="0"></line>
                <line id="threeDGizmoHitY" class="three-d-gizmo-hit-line" x1="0" y1="0" x2="0" y2="0"></line>
                <line id="threeDGizmoHitZ" class="three-d-gizmo-hit-line" x1="0" y1="0" x2="0" y2="0"></line>
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
                <!-- Merkez Serbest Taşıma Tutamacı (Gizmo açıkken bile merkezden tutup serbest taşıma sağlar) -->
                <circle id="threeDGizmoCenterMove" class="three-d-gizmo-center-move" cx="0" cy="0" r="16" title="Serbest Taşı"></circle>
            </svg>
            <!-- Eksen Ucu Tutamaçları (Kaydırma / Eksen Boyunca Taşıma) -->
            <div id="threeDGizmoTipX" class="three-d-gizmo-tip three-d-gizmo-tip-x" title="X Ekseni: Sol / Sağ">X</div>
            <div id="threeDGizmoTipY" class="three-d-gizmo-tip three-d-gizmo-tip-y" title="Y Ekseni: Aşağı / Yukarı">Y</div>
            <div id="threeDGizmoTipZ" class="three-d-gizmo-tip three-d-gizmo-tip-z" title="Z Ekseni: İleri / Geri Derinlik">Z</div>
            <!-- Yay Üzerindeki Renkli Döndürme Noktaları (Beads / Dots) -->
            <div id="threeDGizmoDotX" class="three-d-gizmo-dot three-d-gizmo-dot-x" title="Öge Eğimi: Öne / Arkaya"><span class="three-d-gizmo-dot-lbl">Eğim</span></div>
            <div id="threeDGizmoDotY" class="three-d-gizmo-dot three-d-gizmo-dot-y" title="Öge Yatay Dönüşü: 360°"><span class="three-d-gizmo-dot-lbl">Yatay</span></div>
            <div id="threeDGizmoDotZ" class="three-d-gizmo-dot three-d-gizmo-dot-z" title="Öge Yatırma: Sağa / Sola"><span class="three-d-gizmo-dot-lbl">Yatır</span></div>
            <!-- Tuval Üstü 360° Güneş Işık Tutamacı -->
            <div id="threeDGizmoSun" class="three-d-gizmo-sun" title="Güneş Işık Yönü: 360°"><i class="fas fa-sun"></i></div>
            <div id="threeDGizmoHud" class="three-d-gizmo-hud"></div>
        `;

        container.appendChild(overlay);
        gizmoOverlayEl = overlay;
        attachGizmoEvents(overlay);
        overlay.addEventListener('dblclick', (e) => {
            if (e.button !== 0) return;
            showStudioPanel();
            e.stopPropagation();
            e.preventDefault();
        });
        overlay.addEventListener('contextmenu', (e) => {
            if (!state.active) return;
            if (e.target.closest && e.target.closest('.callout-wrap, .callout-item, .co-neon-block, .canvas-icon, .draggable, .added-icon, .cvi-item, .editable-draw, .canvas-el, .cvi-badge-box, [data-layer-uid]')) {
                return;
            }

            // 🎯 Çoklu 3D seçim varsa doğrudan çoklu 3D menüsünü aç
            if (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function') {
                const multi = window.ThreeDGrouping.getSelected3DElements();
                if (multi.length > 1) {
                    const hitEl = check3DHit(e.clientX, e.clientY);
                    if (!hitEl || multi.some(m => m.id === hitEl.id)) {
                        e.preventDefault();
                        e.stopPropagation();
                        window.ThreeDGrouping.openMulti3DContextMenu(e.clientX, e.clientY);
                        return;
                    } else {
                        window.ThreeDGrouping.clearSelection();
                    }
                }
            }

            const hitEl = check3DHit(e.clientX, e.clientY);
            const isGizmo = e.target.closest && e.target.closest('.three-d-gizmo-tip, .three-d-gizmo-dot, .three-d-gizmo-sun, .three-d-gizmo-hit-line, .three-d-gizmo-arc');
            if (hitEl || isGizmo) {
                e.preventDefault();
                e.stopPropagation();
                const targetEl = hitEl || getActiveElement();
                if (targetEl) {
                    if (targetEl !== getActiveElement()) {
                        setActiveElement(targetEl);
                        setSelected(true);
                    }
                    open3DElementContextMenu(targetEl, e.clientX, e.clientY);
                }
            }
        });
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
            btn.innerHTML = '<i class="fas fa-arrows-spin"></i> 3D Eksen Gizmo';
        }

        // Alt Dock butonlarını senkronize et
        const btnFree = document.getElementById('dock3DBtnFree');
        const btnGizmo = document.getElementById('dock3DBtnGizmo');
        if (btnFree) btnFree.classList.toggle('active', !state.gizmoActive);
        if (btnGizmo) btnGizmo.classList.toggle('active', !!state.gizmoActive);

        notifyExternalUpdates();
    }

    function updateGizmoPositions() {
        if (!gizmoOverlayEl || !state.gizmoActive || !state.selected || !contentGroup || !camera) return;

        const container = document.getElementById('canvas-container');
        if (!container) return;

        const cw = container.offsetWidth || 1920;
        const ch = container.offsetHeight || 1080;

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

        const el = getActiveElement();
        if (!el || !el.contentGroup || !el.planeGroup) return;

        // 🌟 Birlikte Düzenle (All) modunda veya çoklu seçimde tek ortak grup merkezi (Centroid Pivot):
        let groupCenter = null;
        let groupMembers = [];
        const isGroupAll = (state.groupEditMode === 'all');
        if (isGroupAll && el.groupId) {
            groupMembers = elements.filter(m => m && m.groupId === el.groupId && !m.attachedTo);
        } else if (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function') {
            const multi = window.ThreeDGrouping.getSelected3DElements();
            if (multi.length > 1 && multi.some(m => m && m.id === el.id)) {
                groupMembers = multi.filter(m => m && !m.attachedTo);
            }
        }
        if (groupMembers.length > 1) {
            let sumX = 0, sumY = 0, sumZ = 0;
            groupMembers.forEach(m => {
                sumX += (m.posX || 0);
                sumY += (m.posY || 0);
                sumZ += (m.posZ || 0);
            });
            groupCenter = new THREE.Vector3(
                sumX / groupMembers.length,
                sumY / groupMembers.length,
                sumZ / groupMembers.length
            );
        }

        // 3D Düzlem koordinatlarını (posX, posY, posZ) tuval ekranına yansıtan fonksiyon
        function projectPlaneOffset(offset) {
            let pWorld;
            if (groupCenter) {
                pWorld = new THREE.Vector3(groupCenter.x, groupCenter.y, groupCenter.z + (el.contentGroup ? el.contentGroup.position.z : 0));
                if (offset) {
                    pWorld.x += (offset.x || 0);
                    pWorld.y += (offset.y || 0);
                    pWorld.z += (offset.z || 0);
                }
            } else {
                let pLocal = (el.contentGroup ? el.contentGroup.position.clone() : new THREE.Vector3(0, 0, 0));
                if (offset) {
                    pLocal.x += (offset.x || 0);
                    pLocal.y += (offset.y || 0);
                    pLocal.z += (offset.z || 0);
                }
                if (el.contentGroup && el.contentGroup.parent) {
                    pWorld = pLocal;
                    el.contentGroup.parent.localToWorld(pWorld);
                } else if (el.planeGroup) {
                    pWorld = pLocal;
                    el.planeGroup.localToWorld(pWorld);
                } else {
                    pWorld = pLocal;
                }
            }
            // 🛡️ Kamera yakın düzlem (near-plane) patlaması koruması:
            const pCam = pWorld.clone().applyMatrix4(camera.matrixWorldInverse);
            if (pCam.z > -10) {
                pCam.z = -10;
            }
            pCam.applyMatrix4(camera.projectionMatrix);
            return {
                x: (pCam.x + 1) * cw / 2,
                y: (-pCam.y + 1) * ch / 2,
                z: pCam.z
            };
        }

        // Merkez (Origin)
        const pOrigin = projectPlaneOffset(new THREE.Vector3(0, 0, 0));
        const cx = pOrigin.x;
        const cy = pOrigin.y;

        // 🎯 Eksenlerin 1 yerel birim başına tuvalde ürettiği gerçek 2D piksel vektörleri
        const pUnitX = projectPlaneOffset(new THREE.Vector3(1, 0, 0));
        const pUnitY = projectPlaneOffset(new THREE.Vector3(0, 1, 0));
        const pUnitZReal = projectPlaneOffset(new THREE.Vector3(0, 0, 1));

        const dVx = { x: pUnitX.x - cx, y: pUnitX.y - cy };
        const dVy = { x: pUnitY.x - cx, y: pUnitY.y - cy };
        const dVzReal = { x: pUnitZReal.x - cx, y: pUnitZReal.y - cy };

        const lenX = Math.hypot(dVx.x, dVx.y);
        const lenY = Math.hypot(dVy.x, dVy.y);
        const lenZReal = Math.hypot(dVzReal.x, dVzReal.y);

        // 1 yerel 3D birimi (state.posX/Y/Z) başına düşen tuval pikseli
        axisPixelsPerUnit.x = lenX > 0.0001 ? lenX : 1.0;
        axisPixelsPerUnit.y = lenY > 0.0001 ? lenY : 1.0;

        // Ekrana yansıyan yön birim vektörleri
        axisScreenDirs.x = { x: dVx.x / axisPixelsPerUnit.x, y: dVy.y / axisPixelsPerUnit.x };
        axisScreenDirs.y = { x: dVy.x / axisPixelsPerUnit.y, y: dVy.y / axisPixelsPerUnit.y };

        const avgPixelsPerUnit = (axisPixelsPerUnit.x + axisPixelsPerUnit.y) / 2;
        const userDistMultiplier = (state.gizmoDistance || 75) / 75;

        // 🧠 Akıllı ve Nesneyle Birebir Orantılı Yerel Boyutlandırma:
        const curScale = (contentGroup && contentGroup.scale && contentGroup.scale.x > 0.001) ? contentGroup.scale.x : 1.0;
        let localRadius = 60;
        if (state.gizmoAutoFit && contentGroup) {
            try {
                const m = (el && (el.badgeMesh || el.iconMesh || el.textMesh)) || (contentGroup.children && contentGroup.children.find(c => c.isMesh));
                if (m && m.geometry) {
                    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
                    const bb = m.geometry.boundingBox;
                    const hX = Math.abs(bb.max.x - bb.min.x) / 2;
                    const hY = Math.abs(bb.max.y - bb.min.y) / 2;
                    const hZ = Math.abs(bb.max.z - bb.min.z) / 2;
                    localRadius = Math.max(30, hX, hY, hZ);
                } else {
                    const bbox = new THREE.Box3().setFromObject(contentGroup);
                    if (!bbox.isEmpty()) {
                        const sz = new THREE.Vector3();
                        bbox.getSize(sz);
                        localRadius = Math.max(30, Math.max(sz.x, sz.y, sz.z) / (curScale * 2));
                    }
                }
            } catch (ex) {
                localRadius = 60;
            }
        }

        let arcR = localRadius * 1.14 * userDistMultiplier;
        let baseLen = localRadius * 1.38 * userDistMultiplier;

        const minScreenArmPx = 82 * effectiveGizmoScale;
        const currentScreenArmPx = baseLen * curScale * avgPixelsPerUnit;
        if (currentScreenArmPx < minScreenArmPx) {
            const boost = minScreenArmPx / Math.max(0.001, currentScreenArmPx);
            baseLen *= boost;
            arcR = baseLen * 0.82;
        }

        // Eksen Çizgisi Bitişleri (Ok uçları)
        const pLineX = projectPlaneOffset(new THREE.Vector3(baseLen, 0, 0));
        const pLineY = projectPlaneOffset(new THREE.Vector3(0, baseLen, 0));

        // Z derinlik oku: Düzlem kameraya dikken sıfıra çökmesini önle, estetik aksonometrik açı (sol-aşağı 135°)
        const pLineZReal = projectPlaneOffset(new THREE.Vector3(0, 0, baseLen));
        const dVzRealArm = { x: pLineZReal.x - cx, y: pLineZReal.y - cy };
        const lenZArm = Math.hypot(dVzRealArm.x, dVzRealArm.y);

        let pLineZ;
        axisPixelsPerUnit.z = Math.max(0.1, avgPixelsPerUnit); // 🎯 1:1 tutarlı ve pürüzsüz sürükleme hassasiyeti (asla 0'a yakın lenZReal kullanılmaz)
        if (lenZArm >= 25) {
            axisScreenDirs.z = { x: dVzRealArm.x / lenZArm, y: dVzRealArm.y / lenZArm };
            const armLen = Math.max(lenZArm, baseLen * 0.8);
            pLineZ = {
                x: cx + axisScreenDirs.z.x * armLen,
                y: cy + axisScreenDirs.z.y * armLen
            };
        } else {
            const isoDir = { x: -0.7071, y: 0.7071 };
            axisScreenDirs.z = isoDir;
            pLineZ = {
                x: cx + isoDir.x * (baseLen * 0.85),
                y: cy + isoDir.y * (baseLen * 0.85)
            };
        }

        // Eksen Ucu Butonları (X, Y, Z harfleri - tam ok ucunda)
        const pTipX = pLineX;
        const pTipY = pLineY;
        const pTipZ = pLineZ;

        function build3DArc(vStartDir, vEndDir, steps = 32) {
            const pts = [];
            let midPt = null;
            for (let i = 0; i <= steps; i++) {
                const angle = (i / steps) * (Math.PI / 2);
                const vx = (vStartDir.x * Math.cos(angle) + vEndDir.x * Math.sin(angle)) * arcR;
                const vy = (vStartDir.y * Math.cos(angle) + vEndDir.y * Math.sin(angle)) * arcR;
                const vz = (vStartDir.z * Math.cos(angle) + vEndDir.z * Math.sin(angle)) * arcR;

                let pt;
                if (lenZArm < 25 && (vStartDir.z > 0 || vEndDir.z > 0)) {
                    const pPlane = projectPlaneOffset(new THREE.Vector3(vx, vy, 0));
                    const isoDir = { x: -0.7071, y: 0.7071 };
                    pt = {
                        x: pPlane.x + isoDir.x * vz * 0.85,
                        y: pPlane.y + isoDir.y * vz * 0.85
                    };
                } else {
                    pt = projectPlaneOffset(new THREE.Vector3(vx, vy, vz));
                }
                pts.push(pt);
                if (i === Math.floor(steps / 2)) {
                    midPt = pt;
                }
            }
            const d = 'M ' + pts.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ');
            return { d, midPt, pts };
        }

        // 1. Kırmızı Yay YZ (Pitch / Eğim: Y ile Z ekseni arası, X etrafında döner)
        const arcYZ = build3DArc(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
        // 2. Yeşil Yay XZ (Yaw / Yatay: X ile Z ekseni arası, Y etrafında döner)
        const arcXZ = build3DArc(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1));
        // 3. Mavi Yay XY (Roll / Yatır: X ile Y ekseni arası, Z etrafında döner)
        const arcXY = build3DArc(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0));

        if (arcYZ.pts && arcYZ.pts.length > 17) {
            const p1 = arcYZ.pts[16];
            const p2 = arcYZ.pts[17];
            const tLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            if (tLen > 0.001) {
                arcScreenTangents.yz = { x: (p2.x - p1.x) / tLen, y: (p2.y - p1.y) / tLen };
            }
        }
        if (arcXY.pts && arcXY.pts.length > 17) {
            const p1 = arcXY.pts[16];
            const p2 = arcXY.pts[17];
            const tLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            if (tLen > 0.001) {
                arcScreenTangents.xy = { x: (p2.x - p1.x) / tLen, y: (p2.y - p1.y) / tLen };
            }
        }

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

        const hitX = gizmoOverlayEl.querySelector('#threeDGizmoHitX');
        const hitY = gizmoOverlayEl.querySelector('#threeDGizmoHitY');
        const hitZ = gizmoOverlayEl.querySelector('#threeDGizmoHitZ');
        if (hitX) { hitX.setAttribute('x1', cx); hitX.setAttribute('y1', cy); hitX.setAttribute('x2', pLineX.x); hitX.setAttribute('y2', pLineX.y); }
        if (hitY) { hitY.setAttribute('x1', cx); hitY.setAttribute('y1', cy); hitY.setAttribute('x2', pLineY.x); hitY.setAttribute('y2', pLineY.y); }
        if (hitZ) { hitZ.setAttribute('x1', cx); hitZ.setAttribute('y1', cy); hitZ.setAttribute('x2', pLineZ.x); hitZ.setAttribute('y2', pLineZ.y); }

        if (arcXEl) arcXEl.setAttribute('d', arcYZ.d);
        if (arcYEl) arcYEl.setAttribute('d', arcXZ.d);
        if (arcZEl) arcZEl.setAttribute('d', arcXY.d);

        if (originDot) {
            originDot.setAttribute('cx', cx);
            originDot.setAttribute('cy', cy);
            originDot.setAttribute('r', (3.5 * effectiveGizmoScale).toFixed(1));
        }

        const centerMove = gizmoOverlayEl.querySelector('#threeDGizmoCenterMove');
        if (centerMove) {
            centerMove.setAttribute('cx', cx);
            centerMove.setAttribute('cy', cy);
            centerMove.setAttribute('r', (16 * effectiveGizmoScale).toFixed(1));
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
        // 0. Merkez Serbest Taşıma Tutamacı (Gizmo açıkken bile merkezden tutup 2D serbest taşıma sağlar)
        const centerMove = overlay.querySelector('#threeDGizmoCenterMove');
        if (centerMove) {
            let isDragging = false;
            let lastClientX = 0, lastClientY = 0;
            let rawPosX = 0, rawPosY = 0;
            const startCenterDrag = (e) => {
                isDragging = true;
                lastClientX = e.clientX;
                lastClientY = e.clientY;
                rawPosX = (state.posX || 0);
                rawPosY = (state.posY || 0);
                try { centerMove.setPointerCapture(e.pointerId); } catch(ex){}
                e.stopPropagation();
                e.preventDefault();
            };
            centerMove.addEventListener('pointerdown', startCenterDrag);

            const onCenterMove = (e) => {
                if (!isDragging) return;
                const sf = (typeof window.getGlobalScale === 'function') ? window.getGlobalScale() : ((typeof window.scaleFactor === 'number' && window.scaleFactor > 0) ? window.scaleFactor : 1.0);
                const screenDx = e.clientX - lastClientX;
                const screenDy = e.clientY - lastClientY;
                lastClientX = e.clientX;
                lastClientY = e.clientY;

                const dx = screenDx / sf;
                const dy = screenDy / sf;
                const projX = dx * axisScreenDirs.x.x + dy * axisScreenDirs.x.y;
                const projY = dx * axisScreenDirs.y.x + dy * axisScreenDirs.y.y;
                const deltaPosX = projX / Math.max(0.001, axisPixelsPerUnit.x);
                const deltaPosY = projY / Math.max(0.001, axisPixelsPerUnit.y);
                rawPosX += deltaPosX;
                rawPosY += deltaPosY;

                // 🧲 Akıllı Manyetik Hizalama (Smart Guides)
                if (window.isSmartGuidesEnabled && window.SmartGuides && typeof window.SmartGuides.snap === 'function') {
                    const { w: cw, h: ch } = window.SmartGuides.getCanvasDimensions();
                    const dims = getElementEstimatedDimensions(getActiveElement());
                    const curW = dims.w;
                    const curH = dims.h;
                    const unSnappedLeft = (cw / 2 + rawPosX) - curW / 2;
                    const unSnappedTop = (ch / 2 - rawPosY) - curH / 2;
                    const snapped = window.SmartGuides.snap({ is3D: true, activeElementId }, unSnappedLeft, unSnappedTop, curW, curH);
                    state.posX = Math.round((snapped.left + curW / 2) - cw / 2);
                    state.posY = Math.round(-((snapped.top + curH / 2) - ch / 2));
                } else {
                    state.posX = Math.round(rawPosX);
                    state.posY = Math.round(rawPosY);
                    if (window.SmartGuides) window.SmartGuides.clear();
                }

                updateContentTransform();
                updateGizmoPositions();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateDragDelta === 'function') {
                    window.ThreeDGrouping.propagateDragDelta(getActiveElement(), deltaPosX, deltaPosY);
                } else if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
                notifyExternalUpdates(false);
                requestRender();
                showGizmoHud(`📍 Konum: X: ${Math.round(state.posX)}, Y: ${Math.round(state.posY)}`, e.clientX, e.clientY);
            };

            const onCenterUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                try { centerMove.releasePointerCapture(e.pointerId); } catch(ex){}
                if (window.SmartGuides && typeof window.SmartGuides.clear === 'function') {
                    window.SmartGuides.clear();
                }
                hideGizmoHud();
                syncControlsUI();
                notifyExternalUpdates(true);
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
                if (typeof window.recordHistory === 'function') {
                    window.recordHistory('3D Öge Taşındı');
                }
            };

            centerMove.addEventListener('pointermove', onCenterMove);
            centerMove.addEventListener('pointerup', onCenterUp);
            centerMove.addEventListener('pointercancel', onCenterUp);
            window.addEventListener('pointermove', onCenterMove);
            window.addEventListener('pointerup', onCenterUp);
        }

        // 1. Tip X & Ok Ucu / Çizgisi (X Ekseni Kaydırma - Ok Yönünde İzdüşüm)
        const tipX = overlay.querySelector('#threeDGizmoTipX');
        const lineX = overlay.querySelector('#threeDGizmoLineX');
        const hitX = overlay.querySelector('#threeDGizmoHitX');
        if (tipX) {
            let isDragging = false;
            let startClientX, startClientY, origPosX;
            let dragDirX = { x: 1, y: 0 };
            let dragPpuX = 1.0;
            const startDragX = (e) => {
                isDragging = true;
                startClientX = e.clientX;
                startClientY = e.clientY;
                origPosX = (state.posX || 0);
                dragDirX = { ...axisScreenDirs.x };
                dragPpuX = Math.max(0.1, axisPixelsPerUnit.x);
                try { tipX.setPointerCapture(e.pointerId); } catch(ex){}
                e.stopPropagation();
                e.preventDefault();
            };
            tipX.addEventListener('pointerdown', startDragX);
            if (lineX) lineX.addEventListener('pointerdown', startDragX);
            if (hitX) hitX.addEventListener('pointerdown', startDragX);

            const onMove = (e) => {
                if (!isDragging) return;
                const sf = (typeof window.scaleFactor === 'number' && window.scaleFactor > 0) ? window.scaleFactor : 1.0;
                const dx = (e.clientX - startClientX) / sf;
                const dy = (e.clientY - startClientY) / sf;
                const proj = dx * dragDirX.x + dy * dragDirX.y;
                const newPosX = Math.round(origPosX + proj / dragPpuX);
                const deltaX = newPosX - (state.posX || 0);
                if (deltaX === 0) return;
                state.posX = newPosX;
                updateContentTransform();
                notifyExternalUpdates(false);
                requestRender();
                showGizmoHud(`📐 X Konumu: ${Math.round(state.posX)}px`, e.clientX, e.clientY);
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateDragDelta === 'function' && deltaX !== 0) {
                    window.ThreeDGrouping.propagateDragDelta(getActiveElement(), deltaX, 0);
                } else if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
            };
            const onUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                hideGizmoHud();
                syncControlsUI();
                notifyExternalUpdates(true);
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
                try { tipX.releasePointerCapture(e.pointerId); } catch(ex){}
            };
            tipX.addEventListener('pointermove', onMove);
            tipX.addEventListener('pointerup', onUp);
            tipX.addEventListener('pointercancel', onUp);
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
        }

        // 2. Tip Y & Ok Ucu / Çizgisi (Yeşil Ok: Y Ekseni - Düzlem Boyu Aşağı / Yukarı)
        const tipY = overlay.querySelector('#threeDGizmoTipY');
        const lineY = overlay.querySelector('#threeDGizmoLineY');
        const hitY = overlay.querySelector('#threeDGizmoHitY');
        if (tipY) {
            let isDragging = false;
            let startClientX, startClientY, origPosY;
            let dragDirY = { x: 0, y: -1 };
            let dragPpuY = 1.0;
            const startDragY = (e) => {
                isDragging = true;
                startClientX = e.clientX;
                startClientY = e.clientY;
                origPosY = (state.posY || 0);
                dragDirY = { ...axisScreenDirs.y };
                dragPpuY = Math.max(0.1, axisPixelsPerUnit.y);
                try { tipY.setPointerCapture(e.pointerId); } catch(ex){}
                e.stopPropagation();
                e.preventDefault();
            };
            tipY.addEventListener('pointerdown', startDragY);
            if (lineY) lineY.addEventListener('pointerdown', startDragY);
            if (hitY) hitY.addEventListener('pointerdown', startDragY);

            const onMove = (e) => {
                if (!isDragging) return;
                const sf = (typeof window.scaleFactor === 'number' && window.scaleFactor > 0) ? window.scaleFactor : 1.0;
                const dx = (e.clientX - startClientX) / sf;
                const dy = (e.clientY - startClientY) / sf;
                const proj = dx * dragDirY.x + dy * dragDirY.y;
                const newPosY = Math.round(origPosY + proj / dragPpuY);
                const deltaY = newPosY - (state.posY || 0);
                if (deltaY === 0) return;
                state.posY = newPosY;
                updateContentTransform();
                notifyExternalUpdates(false);
                requestRender();
                showGizmoHud(`📐 Y Konumu: ${Math.round(state.posY)}px`, e.clientX, e.clientY);
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateDragDelta === 'function' && deltaY !== 0) {
                    window.ThreeDGrouping.propagateDragDelta(getActiveElement(), 0, deltaY);
                } else if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
            };
            const onUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                hideGizmoHud();
                syncControlsUI();
                notifyExternalUpdates(true);
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
                try { tipY.releasePointerCapture(e.pointerId); } catch(ex){}
            };
            tipY.addEventListener('pointermove', onMove);
            tipY.addEventListener('pointerup', onUp);
            tipY.addEventListener('pointercancel', onUp);
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
        }

        // 3. Tip Z & Ok Ucu / Çizgisi (Cyan Ok: Z Ekseni - İleri / Geri Derinlik)
        const tipZ = overlay.querySelector('#threeDGizmoTipZ');
        const lineZ = overlay.querySelector('#threeDGizmoLineZ');
        const hitZ = overlay.querySelector('#threeDGizmoHitZ');
        if (tipZ) {
            let isDragging = false;
            let startClientX, startClientY, origPosZ;
            let dragDirZ = { x: -0.7071, y: 0.7071 };
            let dragPpuZ = 1.0;
            const startDragZ = (e) => {
                isDragging = true;
                startClientX = e.clientX;
                startClientY = e.clientY;
                origPosZ = (state.posZ || 0);
                dragDirZ = { ...axisScreenDirs.z };
                dragPpuZ = Math.max(0.1, axisPixelsPerUnit.z);
                try { tipZ.setPointerCapture(e.pointerId); } catch(ex){}
                e.stopPropagation();
                e.preventDefault();
            };
            tipZ.addEventListener('pointerdown', startDragZ);
            if (lineZ) lineZ.addEventListener('pointerdown', startDragZ);
            if (hitZ) hitZ.addEventListener('pointerdown', startDragZ);

            const onMove = (e) => {
                if (!isDragging) return;
                const sf = (typeof window.scaleFactor === 'number' && window.scaleFactor > 0) ? window.scaleFactor : 1.0;
                const dx = (e.clientX - startClientX) / sf;
                const dy = (e.clientY - startClientY) / sf;
                const proj = dx * dragDirZ.x + dy * dragDirZ.y;
                const rawPosZ = Math.round(origPosZ + proj / dragPpuZ);

                // 🛡️ Kamera mesafesi güvenli sınırları (Flaşör / Runaway Z patlama koruması):
                const camZ = (camera && camera.position && typeof camera.position.z === 'number') ? camera.position.z : 850;
                const maxSafeZ = Math.min(600, camZ - 250);
                const minSafeZ = -2000;
                const newPosZ = Math.max(minSafeZ, Math.min(maxSafeZ, rawPosZ));

                const deltaZ = newPosZ - (state.posZ || 0);
                if (deltaZ === 0) return;

                state.posZ = newPosZ;
                updateContentTransform();
                notifyExternalUpdates(false);
                requestRender();
                showGizmoHud(`📐 Z Derinlik: ${Math.round(state.posZ)}px`, e.clientX, e.clientY);
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateDragDelta === 'function' && deltaZ !== 0) {
                    window.ThreeDGrouping.propagateDragDelta(getActiveElement(), 0, 0, deltaZ);
                } else if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
            };
            const onUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                hideGizmoHud();
                syncControlsUI();
                notifyExternalUpdates(true);
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
                try { tipZ.releasePointerCapture(e.pointerId); } catch(ex){}
            };
            tipZ.addEventListener('pointermove', onMove);
            tipZ.addEventListener('pointerup', onUp);
            tipZ.addEventListener('pointercancel', onUp);
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
        }

        // 4. Dot X & Kırmızı Yay (Kırmızı Nokta: Öge Eğimi / Pitch - Öne/Arkaya Eğim)
        const dotX = overlay.querySelector('#threeDGizmoDotX');
        const arcXEl = overlay.querySelector('#threeDGizmoArcX');
        if (dotX) {
            let isDragging = false;
            let startClientX, startClientY, startPitch;
            let dragTangent = { x: 0, y: 1 };
            const startDragPitch = (e) => {
                isDragging = true;
                startClientX = e.clientX;
                startClientY = e.clientY;
                const activeEl = getActiveElement();
                const isGroupAll = (state.groupEditMode === 'all');
                const baseEl = (isGroupAll && activeEl && activeEl.attachedTo) ? elements.find(b => b.id === activeEl.attachedTo) : null;
                startPitch = (baseEl ? baseEl.itemPitch : state.itemPitch) || 0;
                dragTangent = { ...arcScreenTangents.yz };
                try { dotX.setPointerCapture(e.pointerId); } catch(ex){}
                e.stopPropagation();
                e.preventDefault();
            };
            dotX.addEventListener('pointerdown', startDragPitch);
            if (arcXEl) arcXEl.addEventListener('pointerdown', startDragPitch);

            const onMove = (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startClientX;
                const dy = e.clientY - startClientY;
                const proj = dx * dragTangent.x + dy * dragTangent.y;
                const newPitch = Math.max(-75, Math.min(75, Math.round(startPitch + proj * 0.75)));
                const deltaPitch = newPitch - (state.itemPitch || 0);
                if (deltaPitch === 0) return;
                state.itemPitch = newPitch;
                const activeEl = getActiveElement();
                if (activeEl) {
                    activeEl.itemPitch = newPitch;
                    if (activeEl.isFence || activeEl.isBaseAligned) {
                        activeEl.planePitch = newPitch;
                    }
                }
                const isGroupAll = (state.groupEditMode === 'all');
                const baseEl = (isGroupAll && activeEl && activeEl.attachedTo) ? elements.find(b => b.id === activeEl.attachedTo) : null;
                if (baseEl) {
                    baseEl.itemPitch = newPitch;
                    updateContentTransform(baseEl);
                }
                updateContentTransform();
                notifyExternalUpdates(false);
                requestRender();
                showGizmoHud(`📐 Öge Eğimi: ${newPitch}°`, e.clientX, e.clientY);
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateRotationDelta === 'function') {
                    window.ThreeDGrouping.propagateRotationDelta(getActiveElement(), 0, deltaPitch, 0, 'item');
                } else if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
            };
            const onUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                hideGizmoHud();
                syncControlsUI();
                notifyExternalUpdates(true);
                updateGizmoPositions();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
                try { dotX.releasePointerCapture(e.pointerId); } catch(ex){}
            };
            dotX.addEventListener('pointermove', onMove);
            dotX.addEventListener('pointerup', onUp);
            dotX.addEventListener('pointercancel', onUp);
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
        }

        // 5. Dot Y & Yeşil Yay (Yeşil Nokta: Düzlem İçi Yatay Dönüş / Yaw - Zeminde Kendi Etrafında 360°)
        const dotY = overlay.querySelector('#threeDGizmoDotY');
        const arcYEl = overlay.querySelector('#threeDGizmoArcY');
        if (dotY) {
            let isDragging = false;
            let startClientX, startClientY, startYaw;
            const startDragYaw = (e) => {
                isDragging = true;
                startClientX = e.clientX;
                startClientY = e.clientY;
                const activeEl = getActiveElement();
                const isGroupAll = (state.groupEditMode === 'all');
                const baseEl = (isGroupAll && activeEl && activeEl.attachedTo) ? elements.find(b => b.id === activeEl.attachedTo) : null;
                startYaw = (baseEl ? baseEl.planeLocalRot : state.planeLocalRot) || 0;
                try { dotY.setPointerCapture(e.pointerId); } catch(ex){}
                e.stopPropagation();
                e.preventDefault();
            };
            dotY.addEventListener('pointerdown', startDragYaw);
            if (arcYEl) arcYEl.addEventListener('pointerdown', startDragYaw);

            const onMove = (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startClientX;
                // Fareyi sağa çekerken öge sağa, sola çekerken sola döner (+dx)
                const proj = dx; 
                let val = Math.round(startYaw + proj * 0.5);
                while (val > 180) val -= 360;
                while (val < -180) val += 360;
                let deltaYaw = val - (state.planeLocalRot || 0);
                while (deltaYaw > 180) deltaYaw -= 360;
                while (deltaYaw < -180) deltaYaw += 360;
                if (deltaYaw === 0) return;
                state.planeLocalRot = val;
                const activeEl = getActiveElement();
                if (activeEl) {
                    activeEl.planeLocalRot = val;
                }
                const isGroupAll = (state.groupEditMode === 'all');
                const baseEl = (isGroupAll && activeEl && activeEl.attachedTo) ? elements.find(b => b.id === activeEl.attachedTo) : null;
                if (baseEl) {
                    baseEl.planeLocalRot = val;
                    updateContentTransform(baseEl);
                }
                updateContentTransform();
                notifyExternalUpdates(false);
                requestRender();
                showGizmoHud(`🔄 Öge Yatay Dönüş: ${val}°`, e.clientX, e.clientY);
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateRotationDelta === 'function') {
                    window.ThreeDGrouping.propagateRotationDelta(getActiveElement(), deltaYaw, 0, 0, 'item');
                } else if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
            };
            const onUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                hideGizmoHud();
                syncControlsUI();
                notifyExternalUpdates(true);
                updateGizmoPositions();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
                try { dotY.releasePointerCapture(e.pointerId); } catch(ex){}
            };
            dotY.addEventListener('pointermove', onMove);
            dotY.addEventListener('pointerup', onUp);
            dotY.addEventListener('pointercancel', onUp);
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
        }

        // 6. Dot Z & Mavi Yay (Mavi Nokta: Öge Yatırma / Roll - Sağa/Sola Yatırma)
        const dotZ = overlay.querySelector('#threeDGizmoDotZ');
        const arcZEl = overlay.querySelector('#threeDGizmoArcZ');
        if (dotZ) {
            let isDragging = false;
            let prevPointerAngle = 0;
            let accumRot = 0;
            let originScreenX = 0;
            let originScreenY = 0;
            const startDragRoll = (e) => {
                isDragging = true;
                const activeEl = getActiveElement();
                const isGroupAll = (state.groupEditMode === 'all');
                const baseEl = (isGroupAll && activeEl && activeEl.attachedTo) ? elements.find(b => b.id === activeEl.attachedTo) : null;
                const targetGroup = (baseEl && baseEl.contentGroup) ? baseEl.contentGroup : (contentGroup || (activeEl && activeEl.contentGroup));
                const vOrigin = new THREE.Vector3(0, 0, 0);
                if (targetGroup) targetGroup.localToWorld(vOrigin);
                vOrigin.project(camera);
                const container = document.getElementById('canvas-container');
                const rect = container ? container.getBoundingClientRect() : { left: 0, top: 0, width: 1920, height: 1080 };
                originScreenX = rect.left + (vOrigin.x + 1) * rect.width / 2;
                originScreenY = rect.top + (-vOrigin.y + 1) * rect.height / 2;

                prevPointerAngle = Math.atan2(e.clientY - originScreenY, e.clientX - originScreenX);
                accumRot = (baseEl ? baseEl.itemRoll : state.itemRoll) || 0;
                try { dotZ.setPointerCapture(e.pointerId); } catch(ex){}
                e.stopPropagation();
                e.preventDefault();
            };
            dotZ.addEventListener('pointerdown', startDragRoll);
            if (arcZEl) arcZEl.addEventListener('pointerdown', startDragRoll);

            const onMove = (e) => {
                if (!isDragging) return;
                const curAngle = Math.atan2(e.clientY - originScreenY, e.clientX - originScreenX);
                let diff = curAngle - prevPointerAngle;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                prevPointerAngle = curAngle;

                // Mavi yay saat yönünde döndüğünde sağa yatması için diff doğrudan eklenir (kullanıcı hissi)
                const deltaRoll = Math.round(diff * (180 / Math.PI));
                accumRot += diff * (180 / Math.PI);
                let newRot = Math.round(accumRot);
                while (newRot > 180) newRot -= 360;
                while (newRot < -180) newRot += 360;
                if (deltaRoll === 0) return;
                state.itemRoll = newRot;
                const activeEl = getActiveElement();
                if (activeEl) {
                    activeEl.itemRoll = newRot;
                }
                const isGroupAll = (state.groupEditMode === 'all');
                const baseEl = (isGroupAll && activeEl && activeEl.attachedTo) ? elements.find(b => b.id === activeEl.attachedTo) : null;
                if (baseEl) {
                    baseEl.itemRoll = newRot;
                    updateContentTransform(baseEl);
                }
                updateContentTransform();
                notifyExternalUpdates(false);
                requestRender();
                showGizmoHud(`📐 Öge Yatırma: ${newRot}°`, e.clientX, e.clientY);
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateRotationDelta === 'function') {
                    window.ThreeDGrouping.propagateRotationDelta(getActiveElement(), 0, 0, deltaRoll, 'item');
                } else if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
            };
            const onUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                hideGizmoHud();
                syncControlsUI();
                notifyExternalUpdates(true);
                updateGizmoPositions();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
                try { dotZ.releasePointerCapture(e.pointerId); } catch(ex){}
            };
            dotZ.addEventListener('pointermove', onMove);
            dotZ.addEventListener('pointerup', onUp);
            dotZ.addEventListener('pointercancel', onUp);
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
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
                state.dockTarget = 'sun';
                updateDock3DControlsState();
                refreshDockStepperPopoverUI();
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
                updateGizmoPositions();
                notifyExternalUpdates(false);
                requestRender();
                showGizmoHud(`☀️ 3D Güneş: X: ${state.sunPosX}, Y: ${state.sunPosY}, Z: ${state.sunPosZ}px`, e.clientX, e.clientY);
                refreshDockStepperPopoverUI();
            });

            // Tekerlek ile Güneş Derinliği (Z)
            sunEl.addEventListener('wheel', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const delta = e.deltaY > 0 ? -30 : 30;
                state.sunPosZ = Math.max(-1200, Math.min(1200, state.sunPosZ + delta));
                updateLighting();
                updateGizmoPositions();
                notifyExternalUpdates(false);
                requestRender();
                showGizmoHud(`☀️ 3D Güneş Derinlik (Z): ${state.sunPosZ}px`, e.clientX, e.clientY);
                refreshDockStepperPopoverUI();
            }, { passive: false });

            const onSunUp = (e) => {
                if (!isDraggingSun) return;
                isDraggingSun = false;
                hideGizmoHud();
                syncControlsUI();
                notifyExternalUpdates(true);
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
            if (el.neonPlaneMesh) targetObjects.push(el.neonPlaneMesh);
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
                const lBox = getElementLocalBoundingBox(el);
                if (lBox && !lBox.isEmpty()) {
                    const box = lBox.clone().applyMatrix4(el.contentGroup.matrixWorld);
                    box.expandByScalar(15);
                    if (raycaster.ray.intersectsBox(box)) return el;
                }
            } catch (ex) {}
        }
        return null;
    }

    /**
     * 🎯 Ekrandaki tüm 3D ögelerin 2D piksel sınırlarını (Bounding Box) döner.
     * Mavi seçim penceresi (Marquee) ve çoklu seçim hizalaması için kullanılır.
     */
    function getElementsScreenBounds() {
        if (!state.active || !camera || elements.length === 0) return [];
        const container = document.getElementById('canvas-container');
        if (!container) return [];
        const rect = container.getBoundingClientRect();
        const results = [];

        // 🌟 Sahne nesnelerinin dünya matrislerini hiyerarşik olarak anında güncelle
        if (scene) {
            scene.updateMatrixWorld(true);
        }

        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            if (el.visible === false || !el.contentGroup) continue;
            try {
                el.contentGroup.updateMatrixWorld(true);
                const lBox = getElementLocalBoundingBox(el);
                if (!lBox || lBox.isEmpty()) continue;

                const corners = [
                    new THREE.Vector3(lBox.min.x, lBox.min.y, lBox.min.z),
                    new THREE.Vector3(lBox.min.x, lBox.min.y, lBox.max.z),
                    new THREE.Vector3(lBox.min.x, lBox.max.y, lBox.min.z),
                    new THREE.Vector3(lBox.min.x, lBox.max.y, lBox.max.z),
                    new THREE.Vector3(lBox.max.x, lBox.min.y, lBox.min.z),
                    new THREE.Vector3(lBox.max.x, lBox.min.y, lBox.max.z),
                    new THREE.Vector3(lBox.max.x, lBox.max.y, lBox.min.z),
                    new THREE.Vector3(lBox.max.x, lBox.max.y, lBox.max.z)
                ];

                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                corners.forEach(c => {
                    c.applyMatrix4(el.contentGroup.matrixWorld);
                    // 🛡️ Kamera yakın düzlem patlaması koruması:
                    const cCam = c.clone().applyMatrix4(camera.matrixWorldInverse);
                    if (cCam.z > -10) cCam.z = -10;
                    cCam.applyMatrix4(camera.projectionMatrix);
                    const sx = (cCam.x * 0.5 + 0.5) * rect.width + rect.left;
                    const sy = (-cCam.y * 0.5 + 0.5) * rect.height + rect.top;
                    if (sx < minX) minX = sx;
                    if (sx > maxX) maxX = sx;
                    if (sy < minY) minY = sy;
                    if (sy > maxY) maxY = sy;
                });

                results.push({
                    id: el.id,
                    el: el,
                    name: el.name || '3D Öge',
                    rect: {
                        left: minX,
                        top: minY,
                        right: maxX,
                        bottom: maxY,
                        width: Math.max(1, maxX - minX),
                        height: Math.max(1, maxY - minY)
                    }
                });
            } catch (ex) {}
        }
        return results;
    }

    /**
     * 🎯 3D Stüdyo Panelini Varsayılan Olarak Sol Panelin (.panel) Üzerine Hizalar
     * Alt kısmın ekran dışına taşmasını kesin olarak engeller, ilk açılışta da panelin tamamını ekranda tutar.
     */
    function positionStudioPanelOverLeftPanel(panel) {
        if (!panel) return;
        if (panel._hasBeenManuallyDragged) return;

        const leftPanel = document.querySelector('.container > .panel') || document.querySelector('.panel');
        const minTop = 10;
        const bottomMargin = 14;

        let targetLeft = 15;
        let preferredTop = 65;

        if (leftPanel) {
            const rect = leftPanel.getBoundingClientRect();
            targetLeft = Math.max(8, Math.min(window.innerWidth - 340, Math.round(rect.left)));
            preferredTop = Math.max(minTop, Math.round(rect.top));
            if (rect.width > 320) {
                panel.style.width = Math.min(430, Math.round(rect.width)) + 'px';
            }
        }

        panel.style.left = targetLeft + 'px';
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';

        // Panel yüksekliğini tam ve doğru ölçmek için gizliyse geçici olarak flex yap
        let measuredHeight = panel.offsetHeight;
        if (!measuredHeight || measuredHeight === 0) {
            const prevDisp = panel.style.display;
            const prevVis = panel.style.visibility;
            panel.style.visibility = 'hidden';
            panel.style.display = 'flex';
            measuredHeight = panel.offsetHeight;
            panel.style.display = prevDisp;
            panel.style.visibility = prevVis;
        }

        const panelH = measuredHeight > 100 ? measuredHeight : 680;

        // Ekranın altına taşmayı önleyen en yüksek izin verilen top değeri
        const maxAllowedTop = Math.max(minTop, window.innerHeight - panelH - bottomMargin);

        // Tercih edilen konumu (rect.top) ekran alt sınırıyla sınırla:
        // Eğer panel alt kısma taşıyorsa, otomatik olarak yukarı çekilir ve asla ekran altına girmez!
        const finalTop = Math.max(minTop, Math.min(preferredTop, maxAllowedTop));
        panel.style.top = finalTop + 'px';

        // Panel boyunun ekran altına taşmaması için max-height tanımla
        const maxAvailableHeight = Math.max(200, window.innerHeight - finalTop - bottomMargin);
        panel.style.maxHeight = maxAvailableHeight + 'px';

        // DOM reflow ve display:flex sonrası gerçek sınırları tekrar doğrula (çift emniyet)
        requestAnimationFrame(() => {
            if (!panel || panel._hasBeenManuallyDragged) return;
            const curRect = panel.getBoundingClientRect();
            if (curRect.height > 0 && curRect.bottom > window.innerHeight - bottomMargin) {
                const overflow = curRect.bottom - (window.innerHeight - bottomMargin);
                const adjustedTop = Math.max(minTop, Math.round(curRect.top - overflow));
                panel.style.top = adjustedTop + 'px';
                panel.style.maxHeight = Math.max(200, window.innerHeight - adjustedTop - bottomMargin) + 'px';
            }
        });
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
            state.dockTarget = 'item';
            // 🎯 2D seçimleri kaldır ki sadece tıklanan 3D öge aktif kalsın
            document.querySelectorAll('.el-selected').forEach(e => e.classList.remove('el-selected'));
            window.selectedEl = null;
            window.selectedElements = [];

            // 🎯 Tuval altındaki ana dock'a 3D ögenin seçildiğini bildir (Çoğalt, Kilit, En Öne, Sil)
            if (window.DockContextManager && typeof window.DockContextManager.on3DElementSelected === 'function') {
                window.DockContextManager.on3DElementSelected(getActiveElement());
            }

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
            if (sunRayLine) sunRayLine.visible = false;
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

            // 🎯 Panel sadece kullanıcı açıkça çift tıkladığında veya panel zaten açıkken güncellensin
            const panel = document.getElementById('threeDStudioPanel');
            if (options && options.openPanel === true) {
                const p = ensureStudioPanel();
                if (p) {
                    p.style.display = 'flex';
                    positionStudioPanelOverLeftPanel(p);
                }
            } else if (panel && panel.style.display === 'flex') {
                positionStudioPanelOverLeftPanel(panel);
            }

            // 🌟 Seçili 3D nesnelerin çoklu seçim ve grup kutularını güncelle
            if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                window.ThreeDGrouping.updateSelectionVisuals();
            }

            if (!options.silent && window.showToast) {
                window.showToast('🎯 3D Öge Seçildi — Tutamaçlar & Panel Aktif (Kısayol: 3 | Bırakmak: Boşa Tıkla/ESC)', 'info');
            }
        } else {
            // 3D öge seçimi bırakıldı
            if (canvasEl) canvasEl.style.pointerEvents = 'none';
            if (gridHelper) {
                gridHelper.visible = false;
            }
            if (sunGroup) sunGroup.visible = false;
            if (sunRayLine) sunRayLine.visible = false;
            if (gizmoOverlayEl) gizmoOverlayEl.style.display = 'none';
            if (cornerPinOverlayEl) cornerPinOverlayEl.style.display = 'none';

            // 🎯 3D öge seçimi bırakıldığında paneli otomatik kapat (boşa veya başka bir ögeye tıklandığında)
            if (!options || !options.keepPanel) {
                const panel = document.getElementById('threeDStudioPanel');
                if (panel) {
                    panel.style.display = 'none';
                }
            }

            // 🌟 Çoklu 3D seçim çerçevelerini de temizle
            if (window.ThreeDGrouping && typeof window.ThreeDGrouping.clearSelection === 'function') {
                window.ThreeDGrouping.clearSelection();
            }

            // 🎯 Seçim bırakıldığında 2D öge de seçili değilse ana dock'u varsayılan sekmeye döndür
            if (window.DockContextManager && typeof window.DockContextManager.onElementDeselected === 'function') {
                if (!window.selectedEl && (!window.selectedElements || window.selectedElements.length === 0)) {
                    window.DockContextManager.onElementDeselected();
                }
            }
        }

        updateSelectionUI();
        updateDock3DControlsState();
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
        badge.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            e.preventDefault();
            showStudioPanel();
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
        let lastCvsDownTime = 0;
        let lastCvsDownX = 0;
        let lastCvsDownY = 0;

        cvs.addEventListener('pointerdown', (e) => {
            if (!state.active || state.cornerPinActive) return;

            // 🎯 Sağ tık (e.button === 2) contextmenu olayını tetiklesin, pointer yakalama veya preventDefault yapma!
            if (e.button === 2) {
                return;
            }

            // 🎯 Tuval veya 3D öge üzerine Çift Tıklama Yakalayıcı (3D metne çift tıklandığında paneli açar)
            if (e.button === 0) {
                const now = Date.now();
                const timeDiff = now - lastCvsDownTime;
                const distDiff = Math.hypot(e.clientX - lastCvsDownX, e.clientY - lastCvsDownY);
                if (timeDiff > 40 && timeDiff < 450 && distDiff < 30) {
                    const hit3DEl = check3DHit(e.clientX, e.clientY);
                    if (hit3DEl) {
                        setActiveElement(hit3DEl);
                        state.gizmoActive = true;
                        setSelected(true, { silent: true, openPanel: true });
                        showStudioPanel();
                        lastCvsDownTime = 0;
                        isPointerDown = false;
                        e.stopPropagation();
                        e.preventDefault();
                        return;
                    }
                    const isCanvasZoomed = typeof window.pinchScale !== 'undefined' && 
                        (window.pinchScale !== 1 || window.pinchPanX !== 0 || window.pinchPanY !== 0);
                    if (isCanvasZoomed && typeof window.resetCanvasZoom === 'function') {
                        lastCvsDownTime = 0;
                        isPointerDown = false;
                        window.resetCanvasZoom(true);
                        e.stopPropagation();
                        e.preventDefault();
                        return;
                    }
                }
                lastCvsDownTime = now;
                lastCvsDownX = e.clientX;
                lastCvsDownY = e.clientY;
            }

            // 🎯 3D üzeri 2D öge tıklama koruması: Sadece gerçekten görünür bir 2D öğe varsa engelle
            try {
                const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);
                const has2DEl = elementsAtPoint && elementsAtPoint.some(node => {
                    if (node === cvs || node.closest('#three-d-layer, #threeDCanvas')) return false;
                    const c = node.closest && node.closest('.callout-wrap, .callout-item, .co-neon-block, .neon-text-el, .canvas-icon, .draggable, .added-icon, .svg-icon, .icon-wrapper, .cvi-item, .editable-draw, .canvas-el, .cvi-badge-box, .tb-image-frame, [data-layer-uid]');
                    if (!c) return false;
                    const style = window.getComputedStyle(c);
                    return style && style.display !== 'none' && style.visibility !== 'hidden';
                });
                if (has2DEl) {
                    return;
                }
            } catch(ex){}

            if (window.spaceBarPressed || (e.type === 'pointerdown' && e.button === 1)) return; // Space veya orta tık tuval pan'e aittir
            const hitEl = check3DHit(e.clientX, e.clientY);
            const isRotateModifier = (e.altKey || e.shiftKey);
            if (!hitEl && !isRotateModifier) {
                // Boş alana tıklandı: 3D seçimini, çoklu seçimi ve tutamaçları bırak, görsel serbest kalsın!
                setSelected(false, { silent: true });
                if (gridHelper) gridHelper.visible = false;
                requestRender();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.clearSelection === 'function') {
                    window.ThreeDGrouping.clearSelection();
                }
                if (typeof deselectAll === 'function') deselectAll();
                return;
            }

            if (hitEl) {
                if (hitEl.groupId) {
                    const groupMembers = elements.filter(e => e.groupId === hitEl.groupId);
                    if (groupMembers.length > 1 && window.ThreeDGrouping && typeof window.ThreeDGrouping.setSelected3DElements === 'function') {
                        window.ThreeDGrouping.setSelected3DElements(groupMembers);
                    }
                }
                const isGroupAll = (state.groupEditMode === 'all');
                const targetEl = (isGroupAll && hitEl.attachedTo ? elements.find(e => e.id === hitEl.attachedTo) : null) || hitEl;
                if (targetEl.id !== activeElementId) {
                    setActiveElement(targetEl);
                }
                // 🌟 Ögeye tıklandığında Gizmo'yu aktif yap ve seçimi tazele
                state.gizmoActive = true;
                setSelected(true, { silent: true });
                updateDock3DControlsState();
            }

            if (hitEl && hitEl.locked && !isRotateModifier) {
                showGizmoHud('🔒 3D Öge Kilitli', e.clientX, e.clientY);
                e.stopPropagation();
                e.preventDefault();
                return;
            }

            isPointerDown = true;
            dragStart.x = e.clientX;
            dragStart.y = e.clientY;
            rawDragPos.x = (state.posX || 0);
            rawDragPos.y = (state.posY || 0);
            dragMode = isRotateModifier ? 'rotate' : 'move';
            cvs.style.cursor = (dragMode === 'move') ? 'default' : 'crosshair';
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
                // Boşta gezinirken ağır raycasting hesaplamasını atla (120 FPS akıcı tuval)
                cvs.style.cursor = 'default';
                return;
            }

            const screenDx = e.clientX - dragStart.x;
            const screenDy = e.clientY - dragStart.y;
            dragStart.x = e.clientX;
            dragStart.y = e.clientY;

            if (dragMode === 'rotate') {
                const deltaYaw = Math.round(screenDx * 0.5);
                const deltaPitch = Math.round(-screenDy * 0.5);
                state.planeYaw = Math.round((state.planeYaw + deltaYaw) % 360);
                state.planePitch = Math.max(-90, Math.min(90, Math.round(state.planePitch + deltaPitch)));
                updatePlaneTransform();
                showGizmoHud(`🔄 Yatay: ${state.planeYaw}°, Eğim: ${state.planePitch}°`, e.clientX, e.clientY);
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateRotationDelta === 'function') {
                    window.ThreeDGrouping.propagateRotationDelta(getActiveElement(), deltaYaw, deltaPitch, 0, 'plane');
                } else if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
            } else {
                // 🎯 3D Perspektif Eksen İzdüşümleriyle Doğal Taşıma
                const sf = (typeof window.getGlobalScale === 'function') ? window.getGlobalScale() : ((typeof window.scaleFactor === 'number' && window.scaleFactor > 0) ? window.scaleFactor : 1.0);
                const dx = screenDx / sf;
                const dy = screenDy / sf;
                const projX = dx * axisScreenDirs.x.x + dy * axisScreenDirs.x.y;
                const projY = dx * axisScreenDirs.y.x + dy * axisScreenDirs.y.y;
                const deltaPosX = projX / Math.max(0.001, axisPixelsPerUnit.x);
                const deltaPosY = projY / Math.max(0.001, axisPixelsPerUnit.y);
                rawDragPos.x += deltaPosX;
                rawDragPos.y += deltaPosY;

                // 🧲 Akıllı Manyetik Hizalama (Smart Guides)
                if (window.isSmartGuidesEnabled && window.SmartGuides && typeof window.SmartGuides.snap === 'function') {
                    const { w: cw, h: ch } = window.SmartGuides.getCanvasDimensions();
                    const dims = getElementEstimatedDimensions(getActiveElement());
                    const curW = dims.w;
                    const curH = dims.h;
                    const unSnappedLeft = (cw / 2 + rawDragPos.x) - curW / 2;
                    const unSnappedTop = (ch / 2 - rawDragPos.y) - curH / 2;
                    const snapped = window.SmartGuides.snap({ is3D: true, activeElementId }, unSnappedLeft, unSnappedTop, curW, curH);
                    state.posX = Math.round((snapped.left + curW / 2) - cw / 2);
                    state.posY = Math.round(-((snapped.top + curH / 2) - ch / 2));
                } else {
                    state.posX = Math.round(rawDragPos.x);
                    state.posY = Math.round(rawDragPos.y);
                    if (window.SmartGuides) window.SmartGuides.clear();
                }

                updateContentTransform();
                showGizmoHud(`📍 Konum: X: ${Math.round(state.posX)}, Y: ${Math.round(state.posY)}`, e.clientX, e.clientY);

                // 🌟 Çoklu seçim veya Grup içindeki kardeşlere delta aktarımı (Birlikte Hareket)
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateDragDelta === 'function') {
                    window.ThreeDGrouping.propagateDragDelta(getActiveElement(), deltaPosX, deltaPosY);
                } else if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
            }
            notifyExternalUpdates(false);
            requestRender();
        });

        const onPointerUp = (e) => {
            if (!isPointerDown) return;
            isPointerDown = false;
            if (window.SmartGuides && typeof window.SmartGuides.clear === 'function') {
                window.SmartGuides.clear();
            }
            hideGizmoHud();
            try { cvs.releasePointerCapture(e.pointerId); } catch(ex){}
            cvs.style.cursor = 'default';
            syncControlsUI();
            notifyExternalUpdates(true);
            if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                window.ThreeDGrouping.updateSelectionVisuals();
            }
        };

        cvs.addEventListener('pointerup', onPointerUp);
        cvs.addEventListener('pointercancel', onPointerUp);

        cvs.addEventListener('contextmenu', (e) => {
            if (!state.active) return;
            if (e.target.closest && e.target.closest('.callout-wrap, .callout-item, .co-neon-block, .canvas-icon, .draggable, .added-icon, .cvi-item, .editable-draw, .canvas-el, .cvi-badge-box, [data-layer-uid]')) {
                return;
            }

            // 🎯 Çoklu 3D seçim varsa doğrudan çoklu 3D menüsünü aç
            if (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function') {
                const multi = window.ThreeDGrouping.getSelected3DElements();
                if (multi.length > 1) {
                    const hitEl = check3DHit(e.clientX, e.clientY);
                    if (!hitEl || multi.some(m => m.id === hitEl.id)) {
                        e.preventDefault();
                        e.stopPropagation();
                        window.ThreeDGrouping.openMulti3DContextMenu(e.clientX, e.clientY);
                        return;
                    } else {
                        window.ThreeDGrouping.clearSelection();
                    }
                }
            }

            const hitEl = check3DHit(e.clientX, e.clientY);
            if (hitEl) {
                e.preventDefault();
                e.stopPropagation();
                if (hitEl !== getActiveElement()) {
                    setActiveElement(hitEl);
                    setSelected(true);
                }
                open3DElementContextMenu(hitEl, e.clientX, e.clientY);
            }
        });

        cvs.addEventListener('wheel', (e) => {
            if (!state.active || !state.selected || window.isPhotoLocked === false) return;
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.05 : 0.05;
            const oldScale = state.planeScale || 1.0;
            state.planeScale = Math.max(0.2, Math.min(3.0, parseFloat((state.planeScale + delta).toFixed(2))));
            if (Math.abs(state.planeScale - oldScale) > 0.001 && window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateScaleDelta === 'function') {
                window.ThreeDGrouping.propagateScaleDelta(getActiveElement(), state.planeScale, oldScale);
            }
            updatePlaneTransform();
            syncControlsUI();
            notifyExternalUpdates();
            requestRender();
        }, { passive: false });

        cvs.addEventListener('dblclick', (e) => {
            if (e.button !== 0) return;
            const hitEl = check3DHit(e.clientX, e.clientY);
            if (hitEl) {
                setActiveElement(hitEl);
                state.gizmoActive = true;
                setSelected(true, { silent: true, openPanel: true });
                showStudioPanel();
                e.stopPropagation();
                e.preventDefault();
            }
        });

        // 🎯 Tuval Konteyneri Dinleyicileri (Seçim kapalıyken tıklamayla doğrudan seçme & Hover cursor)
        const container = document.getElementById('canvas-container');
        if (container && !container._threeDContainerEventsAttached) {
            container._threeDContainerEventsAttached = true;

            // 🎯 Sağ tık: 2D ögelere öncelik ver, 3D ögeye veya gizmoya tıklandıysa 3D menüyü aç
            container.addEventListener('contextmenu', (e) => {
                if (!state.active) return;
                // Form alanları hariç
                if (e.target.closest && e.target.closest('input:not([type="button"]):not([type="submit"]):not([type="range"]), textarea, [contenteditable="true"]')) {
                    return;
                }
                // 2D Elemana tıklandıysa (Callout, İkon, Yazı, Çizim vb.) capture'da engelleme, 2D menünün açılmasına izin ver!
                if (e.target.closest && e.target.closest('.callout-wrap, .callout-item, .co-neon-block, .canvas-icon, .draggable, .added-icon, .cvi-item, .editable-draw, .canvas-el, .cvi-badge-box, [data-layer-uid]')) {
                    return;
                }

                // 🌟 ÇOKLU SEÇİM KONTROLÜ: Eğer 3D ögelerden birden fazlası seçilmişse (pencere/marquee ile), çoklu seçim menüsünü aç!
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function') {
                    const multi = window.ThreeDGrouping.getSelected3DElements();
                    if (multi.length > 1) {
                        const hitEl = check3DHit(e.clientX, e.clientY);
                        // Eğer tıklandığında seçili ögelerden birine tıklandıysa veya sahne/tuval alanına tıklandıysa çoklu menüyü aç
                        if (!hitEl || multi.some(m => m.id === hitEl.id)) {
                            e.preventDefault();
                            e.stopPropagation();
                            window.ThreeDGrouping.openMulti3DContextMenu(e.clientX, e.clientY);
                            return;
                        } else {
                            // Farklı bir ögeye tıklandıysa çoklu seçimi temizle
                            window.ThreeDGrouping.clearSelection();
                        }
                    }
                }

                const hitEl = check3DHit(e.clientX, e.clientY);
                const isGizmo = e.target.closest && e.target.closest('.three-d-gizmo-tip, .three-d-gizmo-dot, .three-d-gizmo-sun, .three-d-gizmo-hit-line, .three-d-gizmo-arc');
                if (hitEl || isGizmo) {
                    e.preventDefault();
                    e.stopPropagation();
                    const targetEl = hitEl || getActiveElement() || (elements.length > 0 ? elements[elements.length - 1] : null);
                    if (targetEl) {
                        if (targetEl !== getActiveElement()) {
                            setActiveElement(targetEl);
                            setSelected(true);
                        }
                        open3DElementContextMenu(targetEl, e.clientX, e.clientY);
                    }
                }
            }, true);

            // Capture phase: 3D öge seçili değilken tıklanırsa seç ve hemen taşımaya başla;
            // 3D öge seçiliyken de boş alana tıklanırsa seçimi ve ızgarayı (grid) hemen kapat!
            container.addEventListener('pointerdown', (e) => {
                if (!state.active) return;
                if (e.button !== 0) return; // Yalnızca sol tık

                // Panel, gizmo, stepper popover veya dock kontrollerine tıklandıysa dokunma
                if (e.target && e.target.closest && e.target.closest('#threeDStudioPanel, .three-d-panel, #threeDGizmoOverlay, #threeDCornerPinOverlay, #threeDCanvasBadge, #threeDDockControls, .dock-3d-controls, .three-d-context-menu, #dock3DStepperPopover')) {
                    return;
                }

                // 2D öğeye tıklandıysa: Eğer 3D seçiliyse seçimi bırak ki 2D öge seçilebilsin!
                const is2DTarget = e.target && e.target.closest && e.target.closest('.callout-wrap, .callout-item, .co-neon-block, .neon-text-el, .canvas-icon, .draggable, .added-icon, .svg-icon, .icon-wrapper, .cvi-item, .editable-draw, .canvas-el, .cvi-badge-box, .tb-image-frame, [data-layer-uid]');
                if (is2DTarget) {
                    if (state.selected) {
                        setSelected(false, { silent: true });
                        if (gridHelper) gridHelper.visible = false;
                        requestRender();
                    }
                    return;
                }

                const hitEl = check3DHit(e.clientX, e.clientY);
                if (hitEl) {
                    if (!state.selected || getActiveElement() !== hitEl) {
                        e.stopPropagation();
                        e.preventDefault();
                        if (hitEl.groupId) {
                            const groupMembers = elements.filter(e => e.groupId === hitEl.groupId);
                            if (groupMembers.length > 1 && window.ThreeDGrouping && typeof window.ThreeDGrouping.setSelected3DElements === 'function') {
                                window.ThreeDGrouping.setSelected3DElements(groupMembers);
                            }
                        }
                        setActiveElement(hitEl);
                        setSelected(true, { autoLockPhoto: true });
                        // İlk tıklamada bırakmadan hemen taşımaya başla
                        if (!hitEl.locked) {
                            isPointerDown = true;
                            dragStart.x = e.clientX;
                            dragStart.y = e.clientY;
                            dragMode = 'move';
                            cvs.style.cursor = 'default';
                            try { cvs.setPointerCapture(e.pointerId); } catch(ex){}
                            showGizmoHud(`📍 Konum: X: ${Math.round(state.posX)}, Y: ${Math.round(state.posY)}`, e.clientX, e.clientY);
                        } else {
                            showGizmoHud('🔒 3D Öge Kilitli', e.clientX, e.clientY);
                        }
                    }
                } else if (state.selected) {
                    // 🎯 Boş alana tıklandı: 3D seçimini ve referans ızgarasını (grid) hemen kapat!
                    setSelected(false, { silent: true });
                    if (gridHelper) gridHelper.visible = false;
                    requestRender();
                    if (window.ThreeDGrouping && typeof window.ThreeDGrouping.clearSelection === 'function') {
                        window.ThreeDGrouping.clearSelection();
                    }
                    if (typeof deselectAll === 'function') deselectAll();
                }
            }, true);

            // 🎯 Tuval konteynerinde 3D ögeye çift tıklandığında paneli aç
            container.addEventListener('dblclick', (e) => {
                if (e.button !== 0) return;
                const hitEl = check3DHit(e.clientX, e.clientY);
                if (hitEl) {
                    setActiveElement(hitEl);
                    state.gizmoActive = true;
                    setSelected(true, { silent: true, openPanel: true });
                    showStudioPanel();
                    e.stopPropagation();
                    e.preventDefault();
                }
            });

            // Hover imleci (Üzerine gelindiğinde standart Windows oku)
            let lastCheckTime = 0;
            container.addEventListener('pointermove', (e) => {
                if (!state.active || state.selected) return;
                const now = Date.now();
                if (now - lastCheckTime < 60) return;
                lastCheckTime = now;

                if (check3DHit(e.clientX, e.clientY)) {
                    container.style.cursor = 'default';
                } else if (container.style.cursor === 'pointer' || container.style.cursor === 'grab') {
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
                // Panel, gizmo, dock kontrolleri veya popover tıklamalarını koru
                if (e.target.closest('#threeDStudioPanel, .three-d-panel, #threeDGizmoOverlay, #threeDCornerPinOverlay, #threeDCanvasBadge, #threeDDockControls, .dock-3d-controls, #dock3DStepperPopover, .three-d-context-menu')) {
                    return;
                }
                const hitEl = check3DHit(e.clientX, e.clientY);
                if (!hitEl) {
                    setSelected(false, { silent: true });
                    if (gridHelper) gridHelper.visible = false;
                    requestRender();
                }
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
                if (p && p.style.display !== 'none') {
                    if (!p._hasBeenManuallyDragged) {
                        positionStudioPanelOverLeftPanel(p);
                    } else {
                        const rect = p.getBoundingClientRect();
                        const maxLeft = Math.max(10, window.innerWidth - p.offsetWidth - 10);
                        const maxTop = Math.max(10, window.innerHeight - p.offsetHeight - 14);
                        p.style.left = Math.min(Math.max(10, rect.left), maxLeft) + 'px';
                        p.style.top = Math.min(Math.max(10, rect.top), maxTop) + 'px';
                        p.style.maxHeight = Math.max(200, window.innerHeight - parseInt(p.style.top, 10) - 14) + 'px';
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
                state.planeLocalRot = 0;
                state.orientation = 'flat';
                break;
            case 'straight':
            default:
                state.planePitch = 0;
                state.planeYaw = 0;
                state.planeRoll = 0;
                state.planeLocalRot = 0;
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
     * 10. Dışa Aktarma & Tuvale Aktarma (modules/three-d-export.js üzerinden yönetilir)
     */
    function getExportContext() {
        return {
            state: state,
            renderer: renderer,
            canvasEl: canvasEl,
            scene: scene,
            camera: camera,
            elements: elements,
            gridHelper: gridHelper,
            sunGroup: sunGroup,
            sunRayLine: sunRayLine,
            cornerPinOverlayEl: cornerPinOverlayEl,
            gizmoOverlayEl: gizmoOverlayEl,
            requestRender: requestRender,
            notifyExternalUpdates: notifyExternalUpdates,
            closeStudio: closeStudio
        };
    }

    function bakeToCanvas() {
        if (window.ThreeDExport && typeof window.ThreeDExport.bakeToCanvas === 'function') {
            return window.ThreeDExport.bakeToCanvas();
        }
        return false;
    }

    function prepareForExport(targetW, targetH) {
        if (window.ThreeDExport && typeof window.ThreeDExport.prepareForExport === 'function') {
            return window.ThreeDExport.prepareForExport(targetW, targetH);
        }
        return null;
    }

    /**
     * 10.2. 3D Ögeyi Tuvalden Silme / Temizleme (Tekil ve Çoklu)
     */
    function delete3DElement(elementId, isSilent = false) {
        let elToDelete = null;
        if (elementId) {
            elToDelete = elements.find(e => e.id === elementId);
        } else {
            elToDelete = getActiveElement();
        }
        if (!elToDelete) return;

        // 🌟 Grup / Birlikte Silme: Eğer öge bir gruptaysa ve 'all' modundaysa tüm grup üyelerini birlikte sil
        if (elToDelete.groupId && state.groupEditMode === 'all') {
            const targetGroupId = elToDelete.groupId;
            elToDelete.groupId = null;
            const groupMembers = elements.filter(e => e.groupId === targetGroupId);
            groupMembers.forEach(mem => {
                if (mem !== elToDelete) {
                    mem.groupId = null;
                    delete3DElement(mem.id, true);
                }
            });
        }

        // Ebeveyne bağlı bir çocuksa, ebeveyn hiyerarşisinden temizle
        if (elToDelete.contentGroup && elToDelete.contentGroup.parent) {
            elToDelete.contentGroup.parent.remove(elToDelete.contentGroup);
        }

        // Bu ögeye bağlı yüzey çocukları varsa onları güvenle serbest bırak
        const attachedChildren = elements.filter(e => e && e.attachedTo === elToDelete.id);
        attachedChildren.forEach(child => {
            delete child.attachedTo;
            delete child.isSurfaceBase;
            if (child.contentGroup && elToDelete.contentGroup) {
                elToDelete.contentGroup.remove(child.contentGroup);
            }
            if (child.planeGroup) {
                child.planeGroup.add(child.contentGroup);
                child.planeGroup.visible = true;
                if (scene && !child.planeGroup.parent) {
                    scene.add(child.planeGroup);
                }
            }
            updatePlaneTransform(child);
            updateContentTransform(child);
        });

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
        disposeMesh(elToDelete.neonPlaneMesh);
        disposeMesh(elToDelete.iconMesh);
        disposeMesh(elToDelete.badgeMesh);
        disposeMesh(elToDelete.reliefMesh);
        disposeMesh(elToDelete.shadowPlane);

        const idx = elements.indexOf(elToDelete);
        if (idx !== -1) {
            elements.splice(idx, 1);
        }

        if (elements.length > 0) {
            const nextEl = elements[Math.max(0, idx - 1)] || elements[0];
            setActiveElement(nextEl);
            if (!isSilent && window.showToast) {
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
            if (!isSilent && window.showToast) {
                window.showToast('🗑️ Tüm 3D ögeler tuvalden silindi.', 'info');
            }
        }

        if (elements.length > 0) {
            update3DLayersOrder();
        } else {
            updateElementSelectorUI();
            if (typeof window.renderLayers === 'function') window.renderLayers();
            requestRender();
        }
        updateDock3DControlsState();
        notifyExternalUpdates();
        if (!isSilent) {
            if (typeof window.recordHistory === 'function') window.recordHistory('3D Öge Silindi');
            if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
        }
    }

    /**
     * 3D Modeli Merkezle / Pivotu Merkeze Al (Center Model Pivot)
     */
    function autoCenterActiveElement(pivotMode = 'center') {
        const el = getActiveElement();
        if (!el || !el.contentGroup) return;

        if (el.customGltfModel) {
            const modelPivot = el.customGltfModel;
            const root = (modelPivot.children && modelPivot.children.length > 0) ? modelPivot.children[0] : modelPivot;

            modelPivot.updateMatrixWorld(true);
            root.updateMatrixWorld(true);

            // 🎯 Modelin modelPivot yerel koordinat sistemindeki gerçek geometrik sınırlarını hesapla
            const localBox = new THREE.Box3();
            const invPivot = new THREE.Matrix4().copy(modelPivot.matrixWorld).invert();
            root.traverse(c => {
                if (c.isMesh && c.geometry) {
                    if (!c.geometry.boundingBox) c.geometry.computeBoundingBox();
                    const b = c.geometry.boundingBox.clone();
                    c.updateWorldMatrix(true, false);
                    const m = invPivot.clone().multiply(c.matrixWorld);
                    b.applyMatrix4(m);
                    localBox.union(b);
                }
            });

            if (!localBox.isEmpty()) {
                const localCenter = new THREE.Vector3();
                localBox.getCenter(localCenter);

                if (pivotMode === 'base') {
                    // Tabanı tam pivot seviyesine (Y=0) oturt, X ve Z merkezde kalsın
                    root.position.x -= localCenter.x;
                    root.position.y -= localBox.min.y;
                    root.position.z -= localCenter.z;
                } else {
                    // Geometrik ağırlık merkezini tam (0,0,0) pivot noktasına oturt
                    root.position.x -= localCenter.x;
                    root.position.y -= localCenter.y;
                    root.position.z -= localCenter.z;
                }
                root.updateMatrixWorld(true);
            }

            el._localBoundingBox = new THREE.Box3().setFromObject(modelPivot);
            updateShadowPlaneGeometry(el);
        } else {
            el.posX = 0;
            el.posY = 0;
            state.posX = 0;
            state.posY = 0;
            if (pivotMode === 'base') {
                el.planeElevation = 0;
                state.planeElevation = 0;
            }
        }

        syncActiveElementFromState();
        updateContentTransform(el);
        updateGizmoPositions();
        syncControlsUI();
        requestRender();
        if (typeof window.recordHistory === 'function') {
            window.recordHistory(pivotMode === 'base' ? '3D Model Tabana Oturtuldu' : '3D Model Merkezlendi');
        }
    }

    function clearAll3D(isSilent = false) {
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

        // Sahnedeki tüm 3D öge gruplarını ve mesh'lerini tamamen temizle
        elements.forEach(el => {
            if (el && el.planeGroup && scene) {
                if (gridHelper && gridHelper.parent === el.planeGroup) {
                    el.planeGroup.remove(gridHelper);
                }
                scene.remove(el.planeGroup);
            }
            if (el) {
                disposeMesh(el.textMesh);
                disposeMesh(el.neonPlaneMesh);
                disposeMesh(el.iconMesh);
                disposeMesh(el.badgeMesh);
                disposeMesh(el.shadowPlane);
            }
        });

        elements.length = 0;
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

        updateElementSelectorUI();
        if (typeof window.renderLayers === 'function') window.renderLayers();
        updateDock3DControlsState();
        notifyExternalUpdates();
        requestRender();

        if (!isSilent) {
            if (window.showToast) window.showToast('🗑️ Tüm 3D ögeler tuvalden silindi.', 'info');
            if (typeof window.recordHistory === 'function') window.recordHistory('Tüm 3D Ögeler Silindi');
            if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
        }
    }

    /**
     * 10.3. 3D Ögeyi Çoğaltma (Kopyalama)
     */
    function duplicate3DElement(targetEl) {
        const src = targetEl || getActiveElement();
        if (!src) return null;

        // 🌟 Grup / Birlikte Çoğaltma: Eğer öge bir gruptaysa tüm grup üyelerini birlikte çoğalt
        if (src.groupId && state.groupEditMode === 'all') {
            const groupMembers = elements.filter(e => e.groupId === src.groupId);
            if (groupMembers.length > 1) {
                const newGroupId = 'grp_3d_' + Date.now();
                const duplicatedGroup = [];
                groupMembers.forEach(mem => {
                    const cloned = createDefaultElement(Object.assign({}, mem, {
                        id: 'el_3d_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                        name: (mem.name || '3D Öge') + ' Kopya',
                        posX: (mem.posX || 0) + 50,
                        posY: (mem.posY || 0) + 40,
                        groupId: newGroupId,
                        locked: false
                    }));
                    initElementThreeObjects(cloned);
                    elements.push(cloned);
                    recreateContentMeshes(cloned);
                    duplicatedGroup.push(cloned);
                });
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.setSelected3DElements === 'function') {
                    window.ThreeDGrouping.setSelected3DElements(duplicatedGroup);
                }
                setActiveElement(duplicatedGroup[0]);
                syncControlsUI();
                update3DLayersOrder();
                requestRender();
                if (typeof window.recordHistory === 'function') window.recordHistory('3D Grup Çoğaltıldı');
                return duplicatedGroup[0];
            }
        }

        const count = elements.length + 1;
        const newEl = createDefaultElement({
            name: (src.name || '3D Öge') + ' Kopya',
            sourceItemName: src.sourceItemName,
            sourceSvg: src.sourceSvg,
            sourceSvgOriginal: src.sourceSvgOriginal || src.sourceSvg,
            elementType: src.elementType,
            shapeMode: src.shapeMode,
            cachedSilhouette: src.cachedSilhouette,
            isExactSilhouette: src.isExactSilhouette,
            text: src.text,
            badgeSubtext: src.badgeSubtext,
            frontColor: src.frontColor,
            badgeBgColor: src.badgeBgColor,
            sideColor: src.sideColor,
            neonFrontIntensity: src.neonFrontIntensity,
            neonEdgeGlow: src.neonEdgeGlow,
            neonEdgeIntensity: src.neonEdgeIntensity,
            neonColor: src.neonColor,
            neonPreset: src.neonPreset || 'fully-lit',
            isRound: src.isRound,
            depth: src.depth,
            bevelEnabled: src.bevelEnabled,
            bevelThickness: src.bevelThickness,
            bevelSize: src.bevelSize,
            orientation: src.orientation,
            planePitch: src.planePitch,
            planeYaw: src.planeYaw,
            planeRoll: src.planeRoll,
            planeLocalRot: src.planeLocalRot,
            planeElevation: src.planeElevation,
            posX: (src.posX || 0) + 50,
            posY: (src.posY || 0) + 40,
            posZ: src.posZ || 0,
            planeScale: src.planeScale || 1.0,
            scaleX: src.scaleX !== undefined ? src.scaleX : 1.0,
            scaleY: src.scaleY !== undefined ? src.scaleY : 1.0,
            scaleZ: src.scaleZ !== undefined ? src.scaleZ : 1.0,
            isBaseAligned: !!src.isBaseAligned,
            isFence: !!src.isFence,
            estateItemId: src.estateItemId || null,
            show3DText: src.show3DText,
            text3DOffset: src.text3DOffset,
            text3DXOffset: src.text3DXOffset !== undefined ? src.text3DXOffset : 0,
            text3DSize: src.text3DSize,
            text3DDepth: src.text3DDepth,
            text3DColor: src.text3DColor,
            text3DMode: src.text3DMode,
            text3DPitch: src.text3DPitch,
            text3DYaw: src.text3DYaw,
            text3DRoll: src.text3DRoll,
            badgeElementMode: src.badgeElementMode,
            embossDepth: src.embossDepth,
            embossScale: src.embossScale,
            embossOffsetY: src.embossOffsetY,
            embossOffsetX: src.embossOffsetX,
            badgeSideColor: src.badgeSideColor,
            visible: true,
            locked: false
        });

        elements.push(newEl);
        activeElementId = newEl.id;
        initElementThreeObjects(newEl);
        setActiveElement(newEl);
        recreateContentMeshes(newEl);
        setSelected(true);
        syncControlsUI();
        update3DLayersOrder();
        if (typeof window.recordHistory === 'function') window.recordHistory('3D Öge Çoğaltıldı');
        if (typeof window.showToast === 'function') window.showToast(`📋 "${newEl.name}" çoğaltıldı`, 'info');
        return newEl;
    }

    /**
     * 10.4. 3D Ögeyi Sayfada 9 Yöne Konumlandırma / Hizalama
     */
    function align3DElement(targetEl, posKey) {
        const el = targetEl || getActiveElement();
        if (!el) return;

        // 🧠 Kamera Frustum ve Görünür Alan Hesabı (Three.js Dünya Koordinatları)
        const fov = (camera && camera.fov) ? camera.fov : 45;
        const aspect = (camera && camera.aspect) ? camera.aspect : (16 / 9);
        const camZ = (camera && camera.position && typeof camera.position.z === 'number') ? camera.position.z : 850;
        const dist = Math.max(300, camZ - (el.posZ || 0));
        const halfFrustumH = dist * Math.tan(THREE.MathUtils.degToRad(fov / 2));
        const halfFrustumW = halfFrustumH * aspect;

        // 🧠 Ögenin Gerçek Yarı Genişlik ve Yarı Yüksekliğini Hesapla
        let elHalfW = 90;
        let elHalfH = 50;
        try {
            const curScale = (el.planeScale !== undefined && el.planeScale !== null) ? el.planeScale : (state.planeScale || 1.0);
            const m = el.badgeMesh || el.iconMesh || el.textMesh;
            if (m && m.geometry) {
                if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
                const bb = m.geometry.boundingBox;
                elHalfW = Math.max(25, ((bb.max.x - bb.min.x) / 2) * curScale);
                elHalfH = Math.max(20, ((bb.max.y - bb.min.y) / 2) * curScale);
            }
        } catch (e) {}

        // Güvenli kenar boşluğu (viewport dışına taşmayı kesinlikle önler)
        const marginX = 35;
        const marginY = 30;
        const xSpan = Math.max(80, Math.round(halfFrustumW - elHalfW - marginX));
        const ySpan = Math.max(60, Math.round(halfFrustumH - elHalfH - marginY));

        let px = 0, py = 0;
        if (posKey.includes('left')) px = -xSpan;
        else if (posKey.includes('right')) px = xSpan;

        // Three.js koordinat sisteminde +Y yukarı, -Y aşağıdır!
        if (posKey.includes('top')) py = ySpan;
        else if (posKey.includes('bottom')) py = -ySpan;

        const oldX = el.posX || 0;
        const oldY = el.posY || 0;
        const deltaX = px - oldX;
        const deltaY = py - oldY;

        el.posX = px;
        el.posY = py;
        if (el === getActiveElement()) {
            state.posX = px;
            state.posY = py;
        }

        // 🌟 Eğer çoklu seçim veya grup varsa diğer kardeşleri de aynı oranda taşı
        if (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function') {
            const groupList = window.ThreeDGrouping.getSelected3DElements();
            if (groupList.length > 1 && groupList.includes(el)) {
                groupList.forEach(sib => {
                    if (sib !== el) {
                        sib.posX = (sib.posX || 0) + deltaX;
                        sib.posY = (sib.posY || 0) + deltaY;
                        updateContentTransform(sib);
                    }
                });
                window.ThreeDGrouping.updateSelectionVisuals();
            }
        }

        updateContentTransform(el);
        updatePlaneTransform(el);
        updateGizmoPositions();
        syncControlsUI();
        notifyExternalUpdates();
        requestRender();
    }

    /**
     * 10.4B. 🌟 3D KATMAN SIRALAMASI (Öne Al / Geriye At)
     * Her ögenin zemin derinliği (layerLift) ve Three.js renderOrder değeri katman sırasına göre güncellenir.
     */
    function update3DLayersOrder() {
        elements.forEach((elem, i) => {
            elem.layerIndex = i;
            if (elem.planeGroup && scene) {
                scene.add(elem.planeGroup);
            }
            if (elem.contentGroup) {
                const rOrder = 10 + i * 10;
                elem.contentGroup.renderOrder = rOrder;
                elem.contentGroup.traverse(ch => {
                    if (ch.isMesh) {
                        ch.renderOrder = (ch === elem.shadowPlane) ? 1 : rOrder;
                    }
                });
            }
            updateContentTransform(elem);
        });
        updateElementSelectorUI();
        if (typeof window.renderLayers === 'function') window.renderLayers();
        notifyExternalUpdates();
        requestRender();
    }

    function bring3DElementForward(targetEl) {
        const el = targetEl || getActiveElement();
        if (!el) return;
        const idx = elements.indexOf(el);
        if (idx >= 0 && idx < elements.length - 1) {
            const temp = elements[idx];
            elements[idx] = elements[idx + 1];
            elements[idx + 1] = temp;
            update3DLayersOrder();
        }
    }

    function send3DElementBackward(targetEl) {
        const el = targetEl || getActiveElement();
        if (!el) return;
        const idx = elements.indexOf(el);
        if (idx > 0) {
            const temp = elements[idx];
            elements[idx] = elements[idx - 1];
            elements[idx - 1] = temp;
            update3DLayersOrder();
        }
    }

    function bring3DElementToFront(targetEl) {
        const el = targetEl || getActiveElement();
        if (!el) return;
        const idx = elements.indexOf(el);
        if (idx >= 0 && idx < elements.length - 1) {
            elements.splice(idx, 1);
            elements.push(el);
            update3DLayersOrder();
        }
    }

    function send3DElementToBack(targetEl) {
        const el = targetEl || getActiveElement();
        if (!el) return;
        const idx = elements.indexOf(el);
        if (idx > 0) {
            elements.splice(idx, 1);
            elements.unshift(el);
            update3DLayersOrder();
        }
    }

    /**
     * 10.5. 🎯 3D ÖGE ZENGİN SAĞ TIK KISAYOL MENÜSÜ (Context Menu)
     * Normal ögelerdeki gibi hizalama (9 yön), kopyalama, silme, katman ve açı kısayolları.
     */
    function open3DElementContextMenu(targetEl, clientX, clientY) {
        if (typeof targetEl === 'number' && typeof clientX === 'number') {
            const tempX = targetEl;
            const tempY = clientX;
            targetEl = clientY;
            clientX = tempX;
            clientY = tempY;
        }

        // 🌟 Çoklu 3D Seçim Koruma: Eğer 2 veya daha fazla 3D öge seçiliyse çoklu menüyü aç
        if (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function') {
            const multi = window.ThreeDGrouping.getSelected3DElements();
            if (multi.length > 1) {
                window.ThreeDGrouping.openMulti3DContextMenu(clientX, clientY);
                return;
            }
        }

        const el = targetEl || getActiveElement();
        if (!el) return;

        if (el !== getActiveElement()) {
            setActiveElement(el);
            setSelected(true);
        }

        // Varsa açık menüyü kapat
        const existing = document.getElementById('app-custom-context-menu');
        if (existing) existing.remove();

        const menu = document.createElement('div');
        menu.id = 'app-custom-context-menu';
        menu.className = 'app-context-menu';
        menu.style.zIndex = '100000';

        const itemName = el.name || '3D Öğe';
        const isElem3D = (el.elementType === 'element_3d');
        const activeShape = el.shapeMode || (el.isExactSilhouette ? 'silhouette' : (el.isRound ? 'coin' : 'card'));

        menu.innerHTML = `
            <div class="app-context-header" id="acm-drag-header" title="Sürüklemek için basılı tutun">
                <span style="display:flex; align-items:center; gap:6px; pointer-events:none; font-weight:700;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    <span>${itemName}</span>
                </span>
                <button class="acm-close-btn" id="acm-close-btn" title="Kapat">✕</button>
            </div>

            ${isElem3D ? `
            <div class="acm-section-label">💎 3D ŞEKİL FORMU</div>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:4px; margin-bottom:4px;">
                <button class="acm-grid-btn ${activeShape === 'silhouette' ? 'active' : ''}" id="acm3d-shape-sil" title="Katı Silüet"><span style="font-size:10.5px;">Silüet</span></button>
                <button class="acm-grid-btn ${activeShape === 'coin' ? 'active' : ''}" id="acm3d-shape-coin" title="Daire Rozet"><span style="font-size:10.5px;">Rozet</span></button>
                <button class="acm-grid-btn ${activeShape === 'card' ? 'active' : ''}" id="acm3d-shape-card" title="Kart Plaket"><span style="font-size:10.5px;">Plaket</span></button>
            </div>
            ` : ''}

            <div class="acm-section-label">📐 DURUŞ VE AÇI</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; margin-bottom:4px;">
                <button class="acm-grid-btn ${el.orientation === 'flat' ? 'active' : ''}" id="acm3d-orient-flat" title="Zemin ve Duvara Yatık"><span>Yatık</span></button>
                <button class="acm-grid-btn ${el.orientation === 'standing' ? 'active' : ''}" id="acm3d-orient-stand" title="Zemine Dik / Tabela"><span>Dik</span></button>
            </div>
            <button class="app-context-item" id="acm3d-ground">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><line x1="2" y1="20" x2="22" y2="20"/><path d="m7 15 5 5 5-5"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                <span>Zemine Oturt</span>
            </button>
            <button class="app-context-item" id="acm3d-align-camera">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <span>Kameraya Çevir</span>
            </button>
            <button class="app-context-item" id="acm3d-flip-face">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><path d="m3 12 7-7v4h8v6h-8v4z"/></svg>
                <span>Yüzü Ters Çevir</span>
            </button>

            <div class="acm-section-label">🎯 SAYFADA KONUMLANDIR</div>
            <div class="acm-grid-btns">
                <button class="acm-grid-btn" id="acm3d-pos-top-left" title="Sol Üst"><span>↖ Sol Üst</span></button>
                <button class="acm-grid-btn" id="acm3d-pos-top-center" title="Üst Orta"><span>⬆ Üst Orta</span></button>
                <button class="acm-grid-btn" id="acm3d-pos-top-right" title="Sağ Üst"><span>↗ Sağ Üst</span></button>
                <button class="acm-grid-btn" id="acm3d-pos-middle-left" title="Orta Sol"><span>⬅ Orta Sol</span></button>
                <button class="acm-grid-btn" id="acm3d-pos-center" title="Sayfa Merkezi" style="background:rgba(56,189,248,0.2); border-color:#38bdf8; color:#fff; font-weight:bold;"><span>🎯 Merkez</span></button>
                <button class="acm-grid-btn" id="acm3d-pos-middle-right" title="Orta Sağ"><span>➡ Orta Sağ</span></button>
                <button class="acm-grid-btn" id="acm3d-pos-bottom-left" title="Sol Alt"><span>↙ Sol Alt</span></button>
                <button class="acm-grid-btn" id="acm3d-pos-bottom-center" title="Alt Orta"><span>⬇ Alt Orta</span></button>
                <button class="acm-grid-btn" id="acm3d-pos-bottom-right" title="Sağ Alt"><span>↘ Sağ Alt</span></button>
            </div>

            <div class="acm-section-label">🔄 BOYUT VE DÖNDÜRME</div>
            <button class="app-context-item" id="acm3d-rot-cw">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                <span>90° Döndür</span>
            </button>
            <button class="app-context-item" id="acm3d-rot-reset">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                <span>Açıları Sıfırla</span>
            </button>
            <button class="app-context-item" id="acm3d-center-model">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
                <span>Modeli Merkezle</span>
            </button>
            <button class="app-context-item" id="acm3d-align-base">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M12 3v13m-4-4 4 4 4-4M3 21h18"/></svg>
                <span>Tabana Oturt</span>
            </button>
            <button class="app-context-item" id="acm3d-scale-up">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                <span>Büyüt</span>
            </button>
            <button class="app-context-item" id="acm3d-scale-down">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                <span>Küçült</span>
            </button>

            <div class="acm-section-label">🛠️ HIZLI ARAÇLAR</div>
            <button class="app-context-item item-lock" id="acm3d-lock">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${el.locked ? '#ef4444' : '#f59e0b'}" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>${el.locked ? 'Kilidi Aç' : 'Kilitle'}</span>
            </button>
            ${el.groupId ? `
            <button class="app-context-item" id="acm3d-ungroup-single">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="m10 10 4 4m0-4-4 4"/></svg>
                <span>Grubu Dağıt</span>
            </button>
            ` : ''}
            <button class="app-context-item" id="acm3d-toggle-gizmo">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" stroke-width="2.2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span>${state.gizmoActive ? 'Gizmoyu Kapat' : 'Gizmoyu Aç'}</span>
            </button>

            <div class="acm-section-label">📑 KATMAN SIRALAMASI</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; margin-bottom:4px;">
                <button class="acm-grid-btn" id="acm3d-step-forward" title="1 Katman Öne Al"><span style="font-size:11px;">Öne Al</span></button>
                <button class="acm-grid-btn" id="acm3d-step-backward" title="1 Katman Arkaya Gönder"><span style="font-size:11px;">Geriye At</span></button>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; margin-bottom:4px;">
                <button class="acm-grid-btn" id="acm3d-front" title="En Üst Katmana Getir"><span style="font-size:11px;">En Öne</span></button>
                <button class="acm-grid-btn" id="acm3d-back" title="En Alt Katmana Gönder"><span style="font-size:11px;">En Arkaya</span></button>
            </div>
            <button class="app-context-item" id="acm3d-duplicate">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span>Çoğalt</span>
            </button>

            <div class="acm-divider"></div>
            <button class="app-context-item item-delete" id="acm3d-delete">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                <span>Sil</span>
            </button>
        `;

        document.body.appendChild(menu);

        // Akıllı Yüzer Konumlandırma
        const menuWidth = 195;
        const menuHeight = menu.offsetHeight || 380;
        let posX = (typeof clientX === 'number' && clientX > 0) ? clientX + 10 : 200;
        let posY = (typeof clientY === 'number' && clientY > 0) ? clientY + 10 : 150;

        if (posX + menuWidth > window.innerWidth - 10) posX = window.innerWidth - menuWidth - 10;
        if (posY + menuHeight > window.innerHeight - 10) posY = window.innerHeight - menuHeight - 10;
        if (posX < 10) posX = 10;
        if (posY < 10) posY = 10;

        menu.style.left = posX + 'px';
        menu.style.top = posY + 'px';

        let onMouseMove = null;
        let onMouseUp = null;

        const closeMenu = () => {
            if (menu.parentElement) menu.remove();
            document.removeEventListener('pointerdown', onDocClick, true);
            document.removeEventListener('keydown', onKeyDown, true);
            if (onMouseMove) document.removeEventListener('mousemove', onMouseMove);
            if (onMouseUp) document.removeEventListener('mouseup', onMouseUp);
        };

        let didDrag = false;
        const onDocClick = (e) => {
            if (didDrag) return;
            if (e.target && (e.target.closest('#app-custom-context-menu') || menu.contains(e.target))) return;
            closeMenu();
        };
        const onKeyDown = (e) => {
            if (e.key === 'Escape') closeMenu();
        };

        setTimeout(() => {
            document.addEventListener('pointerdown', onDocClick, true);
            document.addEventListener('keydown', onKeyDown, true);
        }, 30);

        // Header Sürükleme
        const header = menu.querySelector('#acm-drag-header');
        if (header) {
            let isDragging = false;
            let dragStartX = 0, dragStartY = 0, startLeft = 0, startTop = 0;
            header.style.cursor = 'grab';

            onMouseMove = (e) => {
                if (!isDragging) return;
                const dx = e.clientX - dragStartX;
                const dy = e.clientY - dragStartY;
                if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag = true;
                let nx = startLeft + dx;
                let ny = startTop + dy;
                nx = Math.max(5, Math.min(window.innerWidth - menu.offsetWidth - 5, nx));
                ny = Math.max(5, Math.min(window.innerHeight - menu.offsetHeight - 5, ny));
                menu.style.left = nx + 'px';
                menu.style.top = ny + 'px';
            };

            onMouseUp = () => {
                if (isDragging) {
                    isDragging = false;
                    header.style.cursor = 'grab';
                    setTimeout(() => { didDrag = false; }, 100);
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                }
            };

            header.addEventListener('pointerdown', (e) => {
                if (e.target.closest('#acm-close-btn')) return;
                isDragging = true;
                didDrag = false;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                startLeft = menu.offsetLeft;
                startTop = menu.offsetTop;
                header.style.cursor = 'grabbing';
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
                e.preventDefault();
                e.stopPropagation();
            });
        }

        const closeBtn = menu.querySelector('#acm-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMenu();
            });
        }

        const bindItem = (id, fn) => {
            const btn = menu.querySelector(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMenu();
                    setTimeout(() => {
                        try { fn(); } catch(err) { console.error('3D Context action error:', err); }
                    }, 10);
                });
            }
        };

        // Şekil Formları
        bindItem('#acm3d-shape-sil', () => setElementShapeMode('silhouette', el));
        bindItem('#acm3d-shape-coin', () => setElementShapeMode('coin', el));
        bindItem('#acm3d-shape-card', () => setElementShapeMode('card', el));

        // Duruş
        bindItem('#acm3d-orient-flat', () => {
            state.orientation = 'flat';
            el.orientation = 'flat';
            updateContentTransform(el);
            syncControlsUI();
            notifyExternalUpdates();
            requestRender();
        });
        bindItem('#acm3d-orient-stand', () => {
            state.orientation = 'standing';
            el.orientation = 'standing';
            updateContentTransform(el);
            syncControlsUI();
            notifyExternalUpdates();
            requestRender();
        });
        bindItem('#acm3d-ground', () => {
            if (window.ThreeDAlign && typeof window.ThreeDAlign.groundElements === 'function') {
                window.ThreeDAlign.groundElements(el);
            } else {
                el.planeElevation = 0;
                el.posZ = 0;
                updateContentTransform(el);
                requestRender();
            }
        });
        bindItem('#acm3d-align-camera', () => {
            if (window.ThreeDAlign && typeof window.ThreeDAlign.alignToCamera === 'function') {
                window.ThreeDAlign.alignToCamera(el);
            }
        });
        bindItem('#acm3d-flip-face', () => {
            el.planeYaw = ((el.planeYaw || 0) + 180) % 360;
            state.planeYaw = el.planeYaw;
            updatePlaneTransform(el);
            syncControlsUI();
            requestRender();
        });

        // 9 Yön Konumlandırma
        bindItem('#acm3d-pos-top-left', () => align3DElement(el, 'top-left'));
        bindItem('#acm3d-pos-top-center', () => align3DElement(el, 'top-center'));
        bindItem('#acm3d-pos-top-right', () => align3DElement(el, 'top-right'));
        bindItem('#acm3d-pos-middle-left', () => align3DElement(el, 'middle-left'));
        bindItem('#acm3d-pos-center', () => align3DElement(el, 'center'));
        bindItem('#acm3d-pos-middle-right', () => align3DElement(el, 'middle-right'));
        bindItem('#acm3d-pos-bottom-left', () => align3DElement(el, 'bottom-left'));
        bindItem('#acm3d-pos-bottom-center', () => align3DElement(el, 'bottom-center'));
        bindItem('#acm3d-pos-bottom-right', () => align3DElement(el, 'bottom-right'));

        // Boyut & Döndürme
        bindItem('#acm3d-rot-cw', () => {
            const cur = el.planeLocalRot || 0;
            let next = Math.round(cur / 90) * 90 + 90;
            while (next > 180) next -= 360;
            while (next < -180) next += 360;
            let deltaYaw = next - cur;
            while (deltaYaw > 180) deltaYaw -= 360;
            while (deltaYaw < -180) deltaYaw += 360;
            el.planeLocalRot = next;
            state.planeLocalRot = next;
            updateContentTransform(el);
            updateGizmoPositions();
            syncControlsUI();
            notifyExternalUpdates();
            requestRender();
            if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateRotationDelta === 'function' && deltaYaw !== 0) {
                window.ThreeDGrouping.propagateRotationDelta(el, deltaYaw, 0, 0, 'item');
            }
        });
        bindItem('#acm3d-rot-reset', () => {
            el.orientation = 'flat';
            el.planePitch = 0;
            el.planeYaw = 0;
            el.planeRoll = 0;
            el.planeLocalRot = 0;
            el.planeElevation = 0;
            el.itemPitch = 0;
            el.itemRoll = 0;
            state.orientation = 'flat';
            state.planePitch = 0;
            state.planeYaw = 0;
            state.planeRoll = 0;
            state.planeLocalRot = 0;
            state.planeElevation = 0;
            state.itemPitch = 0;
            state.itemRoll = 0;
            updatePlaneTransform(el);
            updateGizmoPositions();
            syncControlsUI();
            notifyExternalUpdates();
            requestRender();
        });
        bindItem('#acm3d-center-model', () => {
            autoCenterActiveElement('center');
        });
        bindItem('#acm3d-align-base', () => {
            autoCenterActiveElement('base');
        });
        bindItem('#acm3d-scale-up', () => {
            const oldSc = el.planeScale || 1.0;
            const sc = Math.min(3.0, parseFloat((oldSc * 1.15).toFixed(2)));
            el.planeScale = sc;
            state.planeScale = sc;
            if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateScaleDelta === 'function') {
                window.ThreeDGrouping.propagateScaleDelta(el, sc, oldSc);
            }
            updatePlaneTransform(el);
            updateGizmoPositions();
            syncControlsUI();
            notifyExternalUpdates();
            requestRender();
        });
        bindItem('#acm3d-scale-down', () => {
            const oldSc = el.planeScale || 1.0;
            const sc = Math.max(0.2, parseFloat((oldSc * 0.85).toFixed(2)));
            el.planeScale = sc;
            state.planeScale = sc;
            if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateScaleDelta === 'function') {
                window.ThreeDGrouping.propagateScaleDelta(el, sc, oldSc);
            }
            updatePlaneTransform(el);
            updateGizmoPositions();
            syncControlsUI();
            notifyExternalUpdates();
            requestRender();
        });

        // Hızlı Araçlar
        bindItem('#acm3d-lock', () => {
            el.locked = !el.locked;
        });
        bindItem('#acm3d-ungroup-single', () => {
            if (window.ThreeDGrouping && typeof window.ThreeDGrouping.ungroupElements === 'function') {
                window.ThreeDGrouping.ungroupElements(el.groupId);
            }
        });
        bindItem('#acm3d-toggle-gizmo', () => toggleGizmoMode());

        // Katmanlar
        bindItem('#acm3d-step-forward', () => bring3DElementForward(el));
        bindItem('#acm3d-step-backward', () => send3DElementBackward(el));
        bindItem('#acm3d-front', () => bring3DElementToFront(el));
        bindItem('#acm3d-back', () => send3DElementToBack(el));

        // Çoğalt & Sil
        bindItem('#acm3d-duplicate', () => duplicate3DElement(el));
        bindItem('#acm3d-delete', () => delete3DElement(el.id));
    }

    /**
     * 11. Arayüz ve Kontrol Paneli Eşitlemesi
     */
    function syncControlsUI() {
        const panel = document.getElementById('threeDStudioPanel');
        if (!panel) return;

        const headerTextInput = panel.querySelector('#threeDHeaderTextInput');
        if (headerTextInput && document.activeElement !== headerTextInput) {
            headerTextInput.value = state.text || '';
        }
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
            const dv = panel.querySelector('#threeDDepthVal');
            if (dv) dv.textContent = state.depth + 'px';
            panel.querySelectorAll('.three-d-depth-chip').forEach(chip => {
                chip.classList.toggle('active', parseInt(chip.getAttribute('data-depth'), 10) === parseInt(state.depth, 10));
            });
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
            const sc = Math.round(state.planeScale * 100);
            scaleInput.value = sc;
            const sv = panel.querySelector('#threeDScaleVal');
            if (sv) sv.textContent = sc + '%';
            panel.querySelectorAll('.three-d-size-chip:not(.three-d-height-chip)').forEach(chip => {
                chip.classList.toggle('active', parseInt(chip.getAttribute('data-scale'), 10) === sc);
            });
        }
        const heightScaleInput = panel.querySelector('#threeDHeightScaleInput');
        if (heightScaleInput) {
            const hVal = Math.round((state.heightScale || 1.0) * 100);
            heightScaleInput.value = hVal;
            const hv = panel.querySelector('#threeDHeightScaleVal');
            if (hv) hv.textContent = hVal + '%';
            panel.querySelectorAll('.three-d-height-chip').forEach(chip => {
                chip.classList.toggle('active', parseInt(chip.getAttribute('data-hscale'), 10) === hVal);
            });
        }
        if (elevInput) {
            elevInput.value = state.planeElevation;
            panel.querySelector('#threeDElevationVal').textContent = state.planeElevation + 'px';
        }
        if (localRotInput) {
            localRotInput.value = state.planeLocalRot;
            panel.querySelector('#threeDLocalRotVal').textContent = (state.planeLocalRot > 0 ? '+' : '') + state.planeLocalRot + '°';
        }
        if (bevelCheck) bevelCheck.checked = !!state.bevelEnabled;
        const gridCheck = panel.querySelector('#threeDGridCheck');
        if (gridCheck) gridCheck.checked = !!state.showPlaneGrid;
        if (frontColor) frontColor.value = safeHexColor(state.frontColor, '#38bdf8');
        if (sideColor) sideColor.value = safeHexColor(state.sideColor, '#94a3b8');
        const gradCheck = panel.querySelector('#threeDGradientCheck');
        if (gradCheck) gradCheck.checked = !!state.useGradient;

        const neonColorInput = panel.querySelector('#threeDNeonColor');
        const neonFrontInput = panel.querySelector('#threeDNeonFrontInput');
        const neonEdgeInput = panel.querySelector('#threeDNeonEdgeInput');
        if (neonColorInput) neonColorInput.value = safeHexColor(state.neonColor, '#00f0ff');
        if (neonFrontInput) {
            const fVal = state.neonFrontIntensity || 0;
            neonFrontInput.value = fVal;
            const fValEl = panel.querySelector('#threeDNeonFrontVal');
            if (fValEl) fValEl.textContent = fVal + '%';
        }
        if (neonEdgeInput) {
            const eVal = (state.neonEdgeIntensity !== undefined ? state.neonEdgeIntensity : 50);
            neonEdgeInput.value = eVal;
            const eValEl = panel.querySelector('#threeDNeonEdgeVal');
            if (eValEl) eValEl.textContent = eVal + '%';
        }
        const activePreset = state.neonPreset || 'fully-lit';
        panel.querySelectorAll('.neon-preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-preset') === activePreset);
        });

        const plaketBg = panel.querySelector('#threeDPlaketBgColor');
        const plaketBgCol = panel.querySelector('#threeDPlaketBgColorCol');
        const activeShapeMode = state.shapeMode || (state.isExactSilhouette ? 'silhouette' : (state.isRound ? 'coin' : 'card'));
        if (plaketBgCol) {
            plaketBgCol.style.display = (state.elementType === 'element_3d' && (activeShapeMode === 'coin' || activeShapeMode === 'card')) ? 'block' : 'none';
        }
        if (plaketBg && state.badgeBgColor) {
            plaketBg.value = safeHexColor(state.badgeBgColor, '#ffffff');
        }

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

        panel.querySelectorAll('.three-d-elem-btn[data-type]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-type') === state.elementType);
        });

        // 🏡 3D Emlak & Çit Stili Butonları Senkronizasyonu
        const curActiveEl = getActiveElement();
        panel.querySelectorAll('.three-d-estate-btn').forEach(btn => {
            const eId = btn.getAttribute('data-estate-id');
            btn.classList.toggle('active', !!(curActiveEl && curActiveEl.estateItemId === eId));
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

                const activeMode = state.shapeMode || (state.isExactSilhouette ? 'silhouette' : (state.isRound ? 'coin' : 'card'));
                panel.querySelectorAll('.three-d-shape-mode-btn').forEach(b => {
                    b.classList.toggle('active', b.getAttribute('data-mode') === activeMode);
                });
                const shapeBadge = panel.querySelector('#threeDExactShapeBadge');
                if (shapeBadge) {
                    if (activeMode === 'silhouette') {
                        shapeBadge.textContent = '💎 3D Katı Silüet';
                        shapeBadge.style.color = '#38bdf8';
                        shapeBadge.style.background = 'rgba(56,189,248,0.2)';
                    } else if (activeMode === 'coin') {
                        shapeBadge.textContent = '🟡 Dairesel Rozet';
                        shapeBadge.style.color = '#f59e0b';
                        shapeBadge.style.background = 'rgba(245,158,11,0.2)';
                    } else {
                        shapeBadge.textContent = '💳 Kart Plaket';
                        shapeBadge.style.color = '#a78bfa';
                        shapeBadge.style.background = 'rgba(167,139,250,0.2)';
                    }
                }

                const plaqueColorRow = panel.querySelector('#threeDExactPlaqueColorRow');
                if (plaqueColorRow) {
                    const showPlaqueColors = (activeMode === 'coin' || activeMode === 'card');
                    plaqueColorRow.style.display = showPlaqueColors ? 'block' : 'none';
                    if (showPlaqueColors) {
                        const exBg = panel.querySelector('#threeDExactBadgeBgColor');
                        if (exBg && state.badgeBgColor) exBg.value = safeHexColor(state.badgeBgColor, '#ffffff');
                        const exSide = panel.querySelector('#threeDExactSideColor');
                        if (exSide && state.sideColor) exSide.value = safeHexColor(state.sideColor, '#94a3b8');
                    }
                }
            }
        }

        // 🌟 Rozet & İkon Paneli Senkronizasyonu
        const badgeSection = panel.querySelector('#threeDBadgeSection');
        const textRow = panel.querySelector('#threeDTextRow');
        const sizeRow = panel.querySelector('#threeDSizeRow');
        const textSecTitle = panel.querySelector('#threeDTextSectionTitle');

        const isBadge = state.elementType && (state.elementType.startsWith('badge_') || state.elementType === 'icon_3d');
        const isIconOnly = state.elementType === 'pin' || state.elementType === 'arrow' || state.elementType === 'element_3d';
        if (badgeSection) badgeSection.style.display = isBadge ? 'block' : 'none';
        const colorSec = panel.querySelector('#threeDColorSection');
        if (colorSec) colorSec.style.display = isBadge ? 'none' : 'block';
        if (textRow) textRow.style.display = (isBadge || isExact || isIconOnly) ? 'none' : 'block';
        if (sizeRow) sizeRow.style.display = (isBadge || isExact || isIconOnly) ? 'none' : 'flex';
        if (textSecTitle) textSecTitle.textContent = '📐 3D BOYUT, AÇI & KONUM';

        if (isBadge) {
            const bMainText = panel.querySelector('#threeDBadgeMainText');
            if (bMainText && bMainText.value !== state.text) bMainText.value = state.text;

            const bSubText = panel.querySelector('#threeDBadgeSubText');
            if (bSubText && bSubText.value !== (state.badgeSubtext || '')) bSubText.value = state.badgeSubtext || '';

            const bBgColor = panel.querySelector('#threeDBadgeBgColor');
            if (bBgColor) bBgColor.value = safeHexColor(state.badgeBgColor || '#ffffff', '#ffffff');

            const bTextColor = panel.querySelector('#threeDBadgeTextColor');
            if (bTextColor) bTextColor.value = safeHexColor(state.frontColor, '#f59e0b');

            const bSideColor = panel.querySelector('#threeDBadgeSideColor');
            if (bSideColor) bSideColor.value = safeHexColor(state.badgeSideColor || '#cbd5e1', '#cbd5e1');

            // 🌟 Görünüm Modu Senkronizasyonu (3D Kabartma vs Yassı Resim)
            const activeElemMode = state.badgeElementMode || 'emboss';
            const embossBtn = panel.querySelector('#threeDBadgeModeEmboss');
            const flatBtn = panel.querySelector('#threeDBadgeModeFlat');
            if (embossBtn) embossBtn.classList.toggle('active', activeElemMode === 'emboss');
            if (flatBtn) flatBtn.classList.toggle('active', activeElemMode === 'flat');

            // Kabartma Yüksekliği Satırı (Sadece 3D Kabartma Modunda görünür)
            const depthRow = panel.querySelector('#threeDBadgeEmbossDepthRow');
            if (depthRow) depthRow.style.display = (activeElemMode === 'emboss') ? 'flex' : 'none';

            const depthInput = panel.querySelector('#threeDBadgeEmbossDepthInput');
            const depthVal = panel.querySelector('#threeDBadgeEmbossDepthVal');
            const curDepth = state.embossDepth !== undefined ? state.embossDepth : 12;
            if (depthInput) depthInput.value = curDepth;
            if (depthVal) depthVal.textContent = curDepth + 'px';

            const scaleInput = panel.querySelector('#threeDBadgeEmbossScaleInput');
            const scaleVal = panel.querySelector('#threeDBadgeEmbossScaleVal');
            const curScale = state.embossScale !== undefined ? state.embossScale : 85;
            if (scaleInput) scaleInput.value = curScale;
            if (scaleVal) scaleVal.textContent = curScale + '%';

            const offYInput = panel.querySelector('#threeDBadgeEmbossOffsetYInput');
            const offYVal = panel.querySelector('#threeDBadgeEmbossOffsetYVal');
            const curOffY = state.embossOffsetY !== undefined ? state.embossOffsetY : 0;
            if (offYInput) offYInput.value = curOffY;
            if (offYVal) offYVal.textContent = (curOffY > 0 ? '+' : '') + curOffY + 'px';

            const offXInput = panel.querySelector('#threeDBadgeEmbossOffsetXInput');
            const offXVal = panel.querySelector('#threeDBadgeEmbossOffsetXVal');
            const curOffX = state.embossOffsetX !== undefined ? state.embossOffsetX : 0;
            if (offXInput) offXInput.value = curOffX;
            if (offXVal) offXVal.textContent = (curOffX > 0 ? '+' : '') + curOffX + 'px';

            // İkon & Öge Önizleme
            const iconPreview = panel.querySelector('#threeDSelectedIconPreview');
            if (iconPreview) {
                if (state.sourceSvg) {
                    iconPreview.innerHTML = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; padding:2px; overflow:hidden;">${state.sourceSvg}</div>`;
                } else if (state.selectedIconId && state.selectedIconId !== 'none') {
                    const svgStr = getIconSvgById(state.selectedIconId);
                    iconPreview.innerHTML = svgStr || '<span style="font-size:11px; color:#64748b;">İkonsuz</span>';
                } else {
                    iconPreview.innerHTML = '<span style="font-size:11px; color:#64748b;">İkonsuz</span>';
                }
            }
        }

        // 🌟 3D Alt Metin / Yazı Paneli Senkronizasyonu
        const subtextSec = panel.querySelector('#threeDSubtextSection');
        const canHaveSubtext = state.elementType === 'element_3d' || 
                               state.elementType === 'pin' || 
                               state.elementType === 'arrow' || 
                               (state.elementType && state.elementType.startsWith('badge_'));

        if (subtextSec) {
            subtextSec.style.display = canHaveSubtext ? 'block' : 'none';
            if (canHaveSubtext) {
                const togBtn = panel.querySelector('#threeDToggle3DTextBtn');
                const subContent = panel.querySelector('#threeDSubtextContent');
                if (togBtn) {
                    if (state.show3DText) {
                        togBtn.innerHTML = '<i class="fas fa-toggle-on"></i> 3D Yazı: Açık';
                        togBtn.style.color = '#38bdf8';
                        togBtn.style.background = 'rgba(56,189,248,0.2)';
                        togBtn.style.borderColor = 'rgba(56,189,248,0.5)';
                    } else {
                        togBtn.innerHTML = '<i class="fas fa-toggle-off"></i> 3D Yazı: Kapalı';
                        togBtn.style.color = '#94a3b8';
                        togBtn.style.background = 'rgba(255,255,255,0.06)';
                        togBtn.style.borderColor = 'rgba(255,255,255,0.15)';
                    }
                }
                if (subContent) {
                    const activeEl = getActiveElement();
                    const hasSub = !!(state.show3DText || state.badgeSubtext || (activeEl && activeEl.badgeSubtext));
                    subContent.style.display = hasSub ? 'block' : 'none';
                }

                const subMainIn = panel.querySelector('#threeDSubtextMainInput');
                if (subMainIn && subMainIn.value !== (state.text || '')) {
                    subMainIn.value = state.text || '';
                }

                const subSubIn = panel.querySelector('#threeDSubtextSubInput');
                if (subSubIn && subSubIn.value !== (state.badgeSubtext || '')) {
                    subSubIn.value = state.badgeSubtext || '';
                }

                const togTogether = panel.querySelector('#threeDTextModeTogether');
                const togSeparate = panel.querySelector('#threeDTextModeSeparate');
                const sepControls = panel.querySelector('#threeDSeparateControls');
                const isSep = (state.text3DMode === 'separate');

                if (togTogether) {
                    togTogether.style.background = !isSep ? '#0284c7' : 'rgba(255,255,255,0.05)';
                    togTogether.style.color = !isSep ? '#ffffff' : '#94a3b8';
                    togTogether.style.borderColor = !isSep ? '#0284c7' : 'rgba(255,255,255,0.15)';
                }
                if (togSeparate) {
                    togSeparate.style.background = isSep ? '#0284c7' : 'rgba(255,255,255,0.05)';
                    togSeparate.style.color = isSep ? '#ffffff' : '#94a3b8';
                    togSeparate.style.borderColor = isSep ? '#0284c7' : 'rgba(255,255,255,0.15)';
                }
                if (sepControls) {
                    sepControls.style.display = isSep ? 'block' : 'none';
                }

                const offSlider = panel.querySelector('#threeDTextOffsetSlider');
                const offVal = panel.querySelector('#threeDTextOffsetVal');
                const curOff = (state.text3DOffset !== undefined) ? state.text3DOffset : -25;
                if (offSlider) offSlider.value = curOff;
                if (offVal) offVal.textContent = curOff + 'px';

                const xOffSlider = panel.querySelector('#threeDTextXOffsetSlider');
                const xOffVal = panel.querySelector('#threeDTextXOffsetVal');
                const curXOff = (state.text3DXOffset !== undefined) ? state.text3DXOffset : 0;
                if (xOffSlider) xOffSlider.value = curXOff;
                if (xOffVal) xOffVal.textContent = curXOff + 'px';

                const szSlider = panel.querySelector('#threeDTextSizeSlider');
                const szVal = panel.querySelector('#threeDTextSizeVal');
                const curSz = state.text3DSize || 22;
                if (szSlider) szSlider.value = curSz;
                if (szVal) szVal.textContent = curSz + 'px';

                const dpSlider = panel.querySelector('#threeDTextDepthSlider');
                const dpVal = panel.querySelector('#threeDTextDepthVal');
                const curDp = state.text3DDepth || 8;
                if (dpSlider) dpSlider.value = curDp;
                if (dpVal) dpVal.textContent = curDp + 'px';

                const colPicker = panel.querySelector('#threeDTextColorPicker');
                if (colPicker) colPicker.value = safeHexColor(state.text3DColor || '#ffffff', '#ffffff');

                const pitchSlider = panel.querySelector('#threeDTextPitchSlider');
                const pitchVal = panel.querySelector('#threeDTextPitchVal');
                if (pitchSlider) pitchSlider.value = state.text3DPitch || 0;
                if (pitchVal) pitchVal.textContent = (state.text3DPitch || 0) + '°';

                const yawSlider = panel.querySelector('#threeDTextYawSlider');
                const yawVal = panel.querySelector('#threeDTextYawVal');
                if (yawSlider) yawSlider.value = state.text3DYaw || 0;
                if (yawVal) yawVal.textContent = (state.text3DYaw || 0) + '°';
            }
        }

        const flatBtn = panel.querySelector('#threeDOrientFlatBtn');
        const standBtn = panel.querySelector('#threeDOrientStandBtn');
        if (flatBtn) flatBtn.classList.toggle('active', state.orientation === 'flat');
        if (standBtn) standBtn.classList.toggle('active', state.orientation === 'standing');

        const localRotGroup = panel.querySelector('#threeDLocalRotGroup');
        if (localRotGroup) localRotGroup.style.display = (state.orientation === 'flat') ? 'block' : 'none';

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

        const currentDist = state.gizmoDistance || 75;
        const distInput = panel.querySelector('#threeDGizmoDistanceInput');
        if (distInput) {
            distInput.value = currentDist;
            const distLbl = panel.querySelector('#threeDGizmoDistanceVal');
            if (distLbl) distLbl.textContent = currentDist + 'px';
        }

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
        updateElementSelectorUI();
        if (window.ThreeDTextures && typeof window.ThreeDTextures.syncUI === 'function') {
            window.ThreeDTextures.syncUI();
        }
    }

    /**
     * 🎯 Tuval Altı Hızlı 3D Eksen & Tutamaç Kontrol Çubuğu (Dock 3D Controls)
     */
    let currentStepperProp = null;
    let currentStepMode = 'small'; // 'small' | 'large'

    function applyDepthChange(newDepth, targetEl) {
        state.depth = newDepth;
        const panel = document.getElementById('threeDStudioPanel');
        if (panel) {
            const dv = panel.querySelector('#threeDDepthVal');
            if (dv) dv.textContent = state.depth + 'px';
            const depthInput = panel.querySelector('#threeDDepthInput');
            if (depthInput) depthInput.value = state.depth;
        }
        const isGroupAll = (state.groupEditMode === 'all');
        const activeEl = targetEl || getActiveElement();
        if (activeEl) activeEl.depth = newDepth;

        const groupMembers = (isGroupAll && activeEl && activeEl.groupId) ? elements.filter(e => e.groupId === activeEl.groupId) : null;
        if (groupMembers && groupMembers.length > 1) {
            groupMembers.forEach(mem => {
                mem.depth = state.depth;
                recreateContentMeshes(mem);
            });
        } else {
            const pair = getSurfacePair();
            if (isGroupAll && pair) {
                pair.baseEl.depth = state.depth;
                pair.childEl.depth = Math.max(1, Math.round(state.depth * 0.6));
                recreateContentMeshes(pair.baseEl);
                recreateContentMeshes(pair.childEl);
            } else {
                recreateContentMeshes(activeEl);
            }
        }
        syncControlsUI();
        notifyExternalUpdates();
        requestRender();
    }

    const STEPPER_CONFIGS = {
        pitch: {
            title: () => (state.dockTarget === 'sun' ? 'Güneş Eğimi' : 'X Eğim'),
            unit: '°',
            smallStep: 1,
            largeStep: 5,
            min: () => (state.dockTarget === 'sun' ? 5 : -90),
            max: () => (state.dockTarget === 'sun' ? 85 : 90),
            get: () => {
                if (state.dockTarget === 'sun') {
                    const rXZ = Math.sqrt(state.sunPosX * state.sunPosX + state.sunPosZ * state.sunPosZ);
                    const elev = Math.round(Math.atan2(state.sunPosY, Math.max(1, rXZ)) * 180 / Math.PI);
                    return Math.max(5, Math.min(85, elev));
                }
                return Math.round(state.itemPitch || 0);
            },
            set: (val) => {
                if (state.dockTarget === 'sun') {
                    val = Math.max(5, Math.min(85, val));
                    const R = Math.sqrt(state.sunPosX * state.sunPosX + state.sunPosY * state.sunPosY + state.sunPosZ * state.sunPosZ) || 800;
                    const azRad = Math.atan2(state.sunPosX, state.sunPosZ);
                    const elevRad = val * Math.PI / 180;
                    state.sunPosY = Math.round(R * Math.sin(elevRad));
                    const newRXZ = R * Math.cos(elevRad);
                    state.sunPosX = Math.round(newRXZ * Math.sin(azRad));
                    state.sunPosZ = Math.round(newRXZ * Math.cos(azRad));
                    updateLighting();
                    updateGizmoPositions();
                    notifyExternalUpdates();
                    requestRender();
                    return;
                }
                val = Math.max(-90, Math.min(90, val));
                const oldVal = state.itemPitch || 0;
                const deltaPitch = val - oldVal;
                state.itemPitch = val;
                const el = getActiveElement();
                if (el) {
                    el.itemPitch = val;
                    if (el.isFence || el.isBaseAligned) el.planePitch = val;
                }
                updateContentTransform();
                syncControlsUI();
                notifyExternalUpdates();
                requestRender();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateRotationDelta === 'function' && deltaPitch !== 0) {
                    window.ThreeDGrouping.propagateRotationDelta(getActiveElement(), 0, deltaPitch, 0, 'item');
                } else if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
                if (gizmoOverlayEl) {
                    const dotX = gizmoOverlayEl.querySelector('#threeDGizmoDotX');
                    if (dotX) {
                        dotX.style.transform = 'scale(1.3)';
                        setTimeout(() => { if (dotX) dotX.style.transform = 'scale(1)'; }, 200);
                    }
                }
            }
        },
        yaw: {
            title: () => (state.dockTarget === 'sun' ? 'Güneş Açısı' : 'Y Yatay'),
            unit: '°',
            smallStep: 1,
            largeStep: 5,
            min: -180,
            max: 180,
            get: () => {
                if (state.dockTarget === 'sun') {
                    let az = Math.round(Math.atan2(state.sunPosX, state.sunPosZ) * 180 / Math.PI);
                    while (az > 180) az -= 360;
                    while (az < -180) az += 360;
                    return az;
                }
                return Math.round(state.planeLocalRot || 0);
            },
            set: (val) => {
                while (val > 180) val -= 360;
                while (val < -180) val += 360;
                if (state.dockTarget === 'sun') {
                    const rXZ = Math.max(50, Math.sqrt(state.sunPosX * state.sunPosX + state.sunPosZ * state.sunPosZ));
                    const rad = val * Math.PI / 180;
                    state.sunPosX = Math.round(rXZ * Math.sin(rad));
                    state.sunPosZ = Math.round(rXZ * Math.cos(rad));
                    state.lightAngle = (val + 360) % 360;
                    updateLighting();
                    updateGizmoPositions();
                    notifyExternalUpdates();
                    requestRender();
                    return;
                }
                const oldVal = state.planeLocalRot || 0;
                let deltaYaw = val - oldVal;
                while (deltaYaw > 180) deltaYaw -= 360;
                while (deltaYaw < -180) deltaYaw += 360;
                state.planeLocalRot = val;
                const el = getActiveElement();
                if (el) el.planeLocalRot = val;
                updateContentTransform();
                syncControlsUI();
                notifyExternalUpdates();
                requestRender();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateRotationDelta === 'function' && deltaYaw !== 0) {
                    window.ThreeDGrouping.propagateRotationDelta(getActiveElement(), deltaYaw, 0, 0, 'item');
                } else if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
                if (gizmoOverlayEl) {
                    const dotY = gizmoOverlayEl.querySelector('#threeDGizmoDotY');
                    if (dotY) {
                        dotY.style.transform = 'scale(1.3)';
                        setTimeout(() => { if (dotY) dotY.style.transform = 'scale(1)'; }, 200);
                    }
                }
            }
        },
        roll: {
            title: () => (state.dockTarget === 'sun' ? 'Güneş Yatırma' : 'Z Yatır'),
            unit: '°',
            smallStep: 1,
            largeStep: 5,
            min: -90,
            max: 90,
            get: () => {
                if (state.dockTarget === 'sun') {
                    let tilt = Math.round(Math.atan2(state.sunPosX, Math.max(1, state.sunPosY)) * 180 / Math.PI);
                    return Math.max(-90, Math.min(90, tilt));
                }
                return Math.round(state.itemRoll || 0);
            },
            set: (val) => {
                val = Math.max(-90, Math.min(90, val));
                if (state.dockTarget === 'sun') {
                    const rXY = Math.max(50, Math.sqrt(state.sunPosX * state.sunPosX + state.sunPosY * state.sunPosY));
                    const rad = val * Math.PI / 180;
                    state.sunPosX = Math.round(rXY * Math.sin(rad));
                    state.sunPosY = Math.round(rXY * Math.cos(rad));
                    updateLighting();
                    updateGizmoPositions();
                    notifyExternalUpdates();
                    requestRender();
                    return;
                }
                const oldVal = state.itemRoll || 0;
                let deltaRoll = val - oldVal;
                while (deltaRoll > 180) deltaRoll -= 360;
                while (deltaRoll < -180) deltaRoll += 360;
                state.itemRoll = val;
                const el = getActiveElement();
                if (el) el.itemRoll = val;
                updateContentTransform();
                syncControlsUI();
                notifyExternalUpdates();
                requestRender();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateRotationDelta === 'function' && deltaRoll !== 0) {
                    window.ThreeDGrouping.propagateRotationDelta(getActiveElement(), 0, 0, deltaRoll, 'item');
                } else if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
                if (gizmoOverlayEl) {
                    const dotZ = gizmoOverlayEl.querySelector('#threeDGizmoDotZ');
                    if (dotZ) {
                        dotZ.style.transform = 'scale(1.3)';
                        setTimeout(() => { if (dotZ) dotZ.style.transform = 'scale(1)'; }, 200);
                    }
                }
            }
        },
        depth: {
            title: () => (state.dockTarget === 'sun' ? 'Güneş Derinliği' : 'Derinlik'),
            unit: 'px',
            smallStep: () => (state.dockTarget === 'sun' ? 20 : 1),
            largeStep: () => (state.dockTarget === 'sun' ? 100 : 5),
            min: () => (state.dockTarget === 'sun' ? -1200 : 1),
            max: () => (state.dockTarget === 'sun' ? 1200 : 200),
            get: () => {
                if (state.dockTarget === 'sun') {
                    return Math.round(state.sunPosZ || 450);
                }
                return Math.round(state.depth || 16);
            },
            set: (val) => {
                if (state.dockTarget === 'sun') {
                    val = Math.max(-1200, Math.min(1200, val));
                    state.sunPosZ = val;
                    updateLighting();
                    updateGizmoPositions();
                    notifyExternalUpdates();
                    requestRender();
                    return;
                }
                val = Math.max(1, Math.min(200, val));
                const el = getActiveElement();
                applyDepthChange(val, el);
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
            }
        },
        width: {
            title: () => (state.dockTarget === 'sun' ? 'Güneş Konumu X' : 'Genişlik'),
            unit: () => (state.dockTarget === 'sun' ? 'px' : '%'),
            smallStep: () => (state.dockTarget === 'sun' ? 20 : 5),
            largeStep: () => (state.dockTarget === 'sun' ? 100 : 25),
            min: () => (state.dockTarget === 'sun' ? -1000 : 30),
            max: () => (state.dockTarget === 'sun' ? 1000 : 400),
            get: () => {
                if (state.dockTarget === 'sun') {
                    return Math.round(state.sunPosX || 280);
                }
                const el = getActiveElement();
                const sX = (el && el.scaleX !== undefined) ? el.scaleX : (state.scaleX !== undefined ? state.scaleX : 1.0);
                return Math.round(sX * 100);
            },
            set: (val) => {
                if (state.dockTarget === 'sun') {
                    val = Math.max(-1000, Math.min(1000, val));
                    state.sunPosX = val;
                    updateLighting();
                    updateGizmoPositions();
                    notifyExternalUpdates();
                    requestRender();
                    return;
                }
                val = Math.max(30, Math.min(400, val));
                const scaleVal = val / 100;
                state.scaleX = scaleVal;
                const el = getActiveElement();
                if (el) {
                    el.scaleX = scaleVal;
                    updateContentTransform(el);
                    if (state.groupEditMode === 'all' && el.groupId) {
                        elements.filter(m => m.groupId === el.groupId).forEach(m => {
                            m.scaleX = scaleVal;
                            updateContentTransform(m);
                        });
                    }
                }
                syncControlsUI();
                notifyExternalUpdates();
                requestRender();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
            }
        },
        elevation: {
            title: () => (state.dockTarget === 'sun' ? 'Güneş Yüksekliği' : 'Yükseklik'),
            unit: 'px',
            smallStep: () => (state.dockTarget === 'sun' ? 20 : 2),
            largeStep: () => (state.dockTarget === 'sun' ? 100 : 10),
            min: () => (state.dockTarget === 'sun' ? -600 : -100),
            max: () => (state.dockTarget === 'sun' ? 1200 : 300),
            get: () => {
                if (state.dockTarget === 'sun') {
                    return Math.round(state.sunPosY || 600);
                }
                return Math.round(state.planeElevation || 0);
            },
            set: (val) => {
                if (state.dockTarget === 'sun') {
                    val = Math.max(-600, Math.min(1200, val));
                    state.sunPosY = val;
                    updateLighting();
                    updateGizmoPositions();
                    notifyExternalUpdates();
                    requestRender();
                    return;
                }
                val = Math.max(-100, Math.min(300, val));
                const oldVal = state.planeElevation || 0;
                const deltaElev = val - oldVal;
                state.planeElevation = val;
                const el = getActiveElement();
                if (el) el.planeElevation = val;
                updateContentTransform();
                syncControlsUI();
                notifyExternalUpdates();
                requestRender();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateDragDelta === 'function' && deltaElev !== 0) {
                    window.ThreeDGrouping.propagateDragDelta(getActiveElement(), 0, 0, deltaElev);
                } else if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
            }
        },
        height: {
            title: 'Dikey Boy',
            unit: '%',
            smallStep: 5,
            largeStep: 25,
            min: 30,
            max: 400,
            get: () => Math.round((state.heightScale || 1.0) * 100),
            set: (val) => {
                val = Math.max(30, Math.min(400, val));
                state.heightScale = val / 100;
                const el = getActiveElement();
                if (el) {
                    el.heightScale = state.heightScale;
                    updateContentTransform(el);
                    if (state.groupEditMode === 'all' && el.groupId) {
                        elements.filter(m => m.groupId === el.groupId).forEach(m => {
                            m.heightScale = state.heightScale;
                            updateContentTransform(m);
                        });
                    }
                }
                syncControlsUI();
                notifyExternalUpdates();
                requestRender();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
            }
        }
    };

    function getStepperConfig(propKey) {
        let key = propKey;
        const curEl = getActiveElement();
        if (state.dockTarget !== 'sun' && key === 'elevation' && curEl && (curEl.isBaseAligned || curEl.isFence)) {
            key = 'height';
        }
        const raw = STEPPER_CONFIGS[key];
        if (!raw) return null;
        return {
            key: key,
            title: typeof raw.title === 'function' ? raw.title() : raw.title,
            unit: typeof raw.unit === 'function' ? raw.unit() : raw.unit,
            smallStep: typeof raw.smallStep === 'function' ? raw.smallStep() : raw.smallStep,
            largeStep: typeof raw.largeStep === 'function' ? raw.largeStep() : raw.largeStep,
            min: typeof raw.min === 'function' ? raw.min() : raw.min,
            max: typeof raw.max === 'function' ? raw.max() : raw.max,
            get: raw.get,
            set: raw.set
        };
    }

    function refreshDockStepperPopoverUI() {
        const popover = document.getElementById('dock3DStepperPopover');
        if (!popover || popover.style.display === 'none' || !currentStepperProp) return;
        const cfg = getStepperConfig(currentStepperProp);
        if (!cfg) return;

        const titleEl = document.getElementById('stepperTitle');
        const badgeEl = document.getElementById('stepperBadge');
        const directInput = document.getElementById('stepperDirectInput');

        if (titleEl) titleEl.textContent = cfg.title;
        if (badgeEl && (!directInput || directInput.style.display === 'none')) {
            badgeEl.textContent = cfg.get() + cfg.unit;
        }
    }

    function openDockStepperPopover(propKey, targetBtn) {
        const popover = document.getElementById('dock3DStepperPopover');
        const cfg = getStepperConfig(propKey);
        if (!popover || !cfg) return;

        // Aynı butona tekrar tıklandıysa popover'ı kapat
        if (currentStepperProp === propKey && popover.style.display !== 'none') {
            closeDockStepperPopover();
            return;
        }

        stopHoldRepeat();
        cancelDirectInput();

        currentStepperProp = propKey;

        const titleEl = document.getElementById('stepperTitle');
        const badgeEl = document.getElementById('stepperBadge');
        if (titleEl) titleEl.textContent = cfg.title;
        if (badgeEl) badgeEl.textContent = cfg.get() + cfg.unit;

        updateStepPillUI();

        document.querySelectorAll('.dock-3d-btn[data-prop]').forEach(b => b.classList.remove('popover-open'));
        if (targetBtn) targetBtn.classList.add('popover-open');

        popover.style.display = 'block';
        if (targetBtn) {
            const bRect = targetBtn.getBoundingClientRect();
            const popW = popover.offsetWidth || 200;
            const popH = popover.offsetHeight || 72;
            let left = bRect.left + (bRect.width / 2) - (popW / 2);
            left = Math.max(8, Math.min(window.innerWidth - popW - 8, left));
            popover.style.left = left + 'px';

            const spaceBelow = window.innerHeight - bRect.bottom;
            if (spaceBelow >= popH + 10) {
                popover.style.top = (bRect.bottom + 6) + 'px';
                popover.style.bottom = 'auto';
            } else {
                popover.style.bottom = (window.innerHeight - bRect.top + 8) + 'px';
                popover.style.top = 'auto';
            }
        }
    }

    let holdTimer = null;
    let repeatInterval = null;

    function stopHoldRepeat() {
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
        if (repeatInterval) {
            clearInterval(repeatInterval);
            repeatInterval = null;
        }
    }

    function bindHoldStepper(btn, direction) {
        if (!btn) return;

        function start(e) {
            if (e.button !== undefined && e.button !== 0) return; // Sadece sol tık
            e.stopPropagation();

            // İlk adımı hemen işlet
            stepCurrentProp(direction);

            stopHoldRepeat();

            // 320ms basılı tutulursa sürekli hızlı akış başlat (her 50ms)
            holdTimer = setTimeout(() => {
                repeatInterval = setInterval(() => {
                    stepCurrentProp(direction);
                }, 50);
            }, 320);

            const onRelease = () => {
                stopHoldRepeat();
                window.removeEventListener('mouseup', onRelease, true);
                window.removeEventListener('touchend', onRelease, true);
                window.removeEventListener('touchcancel', onRelease, true);
            };

            window.addEventListener('mouseup', onRelease, true);
            window.addEventListener('touchend', onRelease, true);
            window.addEventListener('touchcancel', onRelease, true);
        }

        btn.addEventListener('mousedown', start);
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            start(e);
        }, { passive: false });

        btn.addEventListener('mouseleave', () => stopHoldRepeat());

        // Mousedown ile tetiklendiği için click olayında mükerrer adımı engelle
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        // Klavye ile erişim için Space/Enter tuşları
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                stepCurrentProp(direction);
            }
        });
    }

    let isCommittingDirectInput = false;

    function startDirectInput() {
        if (!currentStepperProp) return;
        const cfg = getStepperConfig(currentStepperProp);
        if (!cfg) return;
        const badgeEl = document.getElementById('stepperBadge');
        const directInput = document.getElementById('stepperDirectInput');
        if (!badgeEl || !directInput) return;

        stopHoldRepeat();
        directInput.value = cfg.get();
        if (cfg.min !== undefined) directInput.min = cfg.min;
        if (cfg.max !== undefined) directInput.max = cfg.max;
        directInput.step = cfg.smallStep || 1;

        badgeEl.style.display = 'none';
        directInput.style.display = 'inline-block';
        directInput.focus();
        directInput.select();
    }

    function commitDirectInput() {
        if (isCommittingDirectInput) return;
        isCommittingDirectInput = true;

        const badgeEl = document.getElementById('stepperBadge');
        const directInput = document.getElementById('stepperDirectInput');
        if (!directInput || directInput.style.display === 'none') {
            isCommittingDirectInput = false;
            return;
        }

        if (currentStepperProp) {
            const cfg = getStepperConfig(currentStepperProp);
            if (cfg) {
                const raw = directInput.value.trim();
                let val = parseFloat(raw);
                if (!isNaN(val)) {
                    if (cfg.min !== undefined) val = Math.max(cfg.min, val);
                    if (cfg.max !== undefined) val = Math.min(cfg.max, val);
                    cfg.set(Math.round(val));
                }
                if (badgeEl) badgeEl.textContent = cfg.get() + cfg.unit;
            }
        }

        directInput.style.display = 'none';
        if (badgeEl) badgeEl.style.display = '';

        isCommittingDirectInput = false;
    }

    function cancelDirectInput() {
        const badgeEl = document.getElementById('stepperBadge');
        const directInput = document.getElementById('stepperDirectInput');
        if (!directInput || directInput.style.display === 'none') return;
        directInput.style.display = 'none';
        if (badgeEl) badgeEl.style.display = '';
    }

    function closeDockStepperPopover() {
        stopHoldRepeat();
        cancelDirectInput();
        const popover = document.getElementById('dock3DStepperPopover');
        if (popover) popover.style.display = 'none';
        document.querySelectorAll('.dock-3d-btn[data-prop]').forEach(b => b.classList.remove('popover-open'));
        currentStepperProp = null;
    }

    function stepCurrentProp(direction) {
        if (!currentStepperProp) return;
        const cfg = getStepperConfig(currentStepperProp);
        if (!cfg) return;
        cancelDirectInput();
        const step = currentStepMode === 'large' ? cfg.largeStep : cfg.smallStep;
        const cur = cfg.get();
        let next = cur + (direction > 0 ? step : -step);
        if (cfg.min !== undefined) next = Math.max(cfg.min, next);
        if (cfg.max !== undefined) next = Math.min(cfg.max, next);
        cfg.set(next);

        const badgeEl = document.getElementById('stepperBadge');
        if (badgeEl) badgeEl.textContent = cfg.get() + cfg.unit;
    }

    function updateStepPillUI() {
        const smallBtn = document.getElementById('stepSmallBtn');
        const largeBtn = document.getElementById('stepLargeBtn');
        if (smallBtn) smallBtn.classList.toggle('active', currentStepMode === 'small');
        if (largeBtn) largeBtn.classList.toggle('active', currentStepMode === 'large');
    }

    function updateDock3DControlsState() {
        if (window.DockContextManager) {
            if (state.active && state.selected) {
                window.DockContextManager.on3DElementSelected(getActiveElement());
            } else if (!state.selected) {
                window.DockContextManager.onElementDeselected();
            }
        }

        const btnFree = document.getElementById('dock3DBtnFree');
        const btnGizmo = document.getElementById('dock3DBtnGizmo');
        if (btnFree) btnFree.classList.toggle('active', !state.gizmoActive);
        if (btnGizmo) btnGizmo.classList.toggle('active', !!state.gizmoActive);

        const dock3D = document.getElementById('dock3DControls');
        const divider = document.getElementById('dock3DDivider');
        if (!dock3D) return;

        // 🌟 3D stüdyo açık olduğu sürece alt dock kontrolleri DAİMA görünür olmalıdır
        if (!state.active) {
            dock3D.style.display = 'none';
            if (divider) divider.style.display = 'none';
            closeDockStepperPopover();
            return;
        }

        dock3D.style.display = 'inline-flex';
        if (divider) divider.style.display = 'none';

        // 2D element kontrollerini gizle ki 3D kontrolleriyle çakışmasın
        const dock2D = document.getElementById('dock2DControls');
        const dock2DDiv = document.getElementById('dock2DDivider');
        if (dock2D) dock2D.style.display = 'none';
        if (dock2DDiv) dock2DDiv.style.display = 'none';

        if (window.DockContextManager) {
            if (state.selected) {
                window.DockContextManager.on3DElementSelected(getActiveElement());
            }
        }

        if (!state.dockTarget) state.dockTarget = 'item';
        const isSun = (state.dockTarget === 'sun');

        const targetItemBtn = dock3D.querySelector('#dock3DTargetItemBtn');
        const targetSunBtn = dock3D.querySelector('#dock3DTargetSunBtn');

        if (targetItemBtn) targetItemBtn.classList.toggle('active', !isSun && !!state.selected);
        if (targetSunBtn) targetSunBtn.classList.toggle('active', isSun);

        const btnX = dock3D.querySelector('#dock3DBtnX');
        const btnY = dock3D.querySelector('#dock3DBtnY');
        const btnZ = dock3D.querySelector('#dock3DBtnZ');
        const btnDepth = dock3D.querySelector('#dock3DBtnDepth');
        const btnWidth = dock3D.querySelector('#dock3DBtnWidth');
        const btnElev = dock3D.querySelector('#dock3DBtnElev');

        if (btnX) btnX.title = isSun ? "Güneş Dikey Eğim Açısı" : "X Eğim Açısı";
        if (btnY) btnY.title = isSun ? "Güneş Yatay Dönüş Açısı" : "Y Yatay Açısı";
        if (btnZ) btnZ.title = isSun ? "Güneş Yanal Yatırma Açısı" : "Z Yatırma Açısı";
        if (btnDepth) btnDepth.title = isSun ? "Güneş Derinlik Konumu (Z)" : "3D Kalınlık ve Derinlik";
        if (btnWidth) btnWidth.title = isSun ? "Güneş Yatay Konumu (X)" : "Öge Genişliği";
        if (btnElev) btnElev.title = isSun ? "Güneş Yükseklik Konumu (Y)" : "Yerden Yükseklik";

        // Canlı stepper açık ise değer rozetini ve başlığını güncelle
        if (currentStepperProp) {
            const cfg = getStepperConfig(currentStepperProp);
            if (cfg) {
                const titleEl = document.getElementById('stepperTitle');
                const badgeEl = document.getElementById('stepperBadge');
                const directInput = document.getElementById('stepperDirectInput');
                if (titleEl) titleEl.textContent = cfg.title;
                if (badgeEl && (!directInput || directInput.style.display === 'none')) {
                    badgeEl.textContent = cfg.get() + cfg.unit;
                }
            }
        }
    }

    function initDock3DControls() {
        const btnFree = document.getElementById('dock3DBtnFree');
        if (btnFree && btnFree.dataset.bound !== 'true') {
            btnFree.dataset.bound = 'true';
            btnFree.onclick = () => {
                toggleGizmoMode(false);
                updateDock3DControlsState();
            };
        }

        const btnGizmo = document.getElementById('dock3DBtnGizmo');
        if (btnGizmo && btnGizmo.dataset.bound !== 'true') {
            btnGizmo.dataset.bound = 'true';
            btnGizmo.onclick = () => {
                toggleGizmoMode(true);
                updateDock3DControlsState();
            };
        }

        const dock3D = document.getElementById('dock3DControls');
        if (!dock3D || dock3D.dataset.bound === 'true') return;
        dock3D.dataset.bound = 'true';

        const targetItemBtn = dock3D.querySelector('#dock3DTargetItemBtn');
        if (targetItemBtn) {
            targetItemBtn.onclick = () => {
                state.dockTarget = 'item';
                state.sunGizmoVisible = false;
                setSelected(true);
                updateDock3DControlsState();
                refreshDockStepperPopoverUI();
            };
        }

        const targetSunBtn = dock3D.querySelector('#dock3DTargetSunBtn');
        if (targetSunBtn) {
            targetSunBtn.onclick = () => {
                state.dockTarget = 'sun';
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
                refreshDockStepperPopoverUI();
            };
        }

        // 🌟 Stepper Tetikleyici Butonlar (X Eğim, Y Yatay, Z Yatır, Derinlik, Yükseklik)
        dock3D.querySelectorAll('.dock-3d-btn[data-prop]').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const prop = btn.getAttribute('data-prop');
                openDockStepperPopover(prop, btn);
            };
        });

        // 🌟 Stepper Popover Olay Dinleyicileri
        const popover = document.getElementById('dock3DStepperPopover');
        if (popover && popover.dataset.bound !== 'true') {
            popover.dataset.bound = 'true';

            const btnDown = document.getElementById('stepperBtnDown');
            const btnUp = document.getElementById('stepperBtnUp');
            const closeBtn = document.getElementById('stepperCloseBtn');
            const smallBtn = document.getElementById('stepSmallBtn');
            const largeBtn = document.getElementById('stepLargeBtn');
            const badgeEl = document.getElementById('stepperBadge');
            const directInput = document.getElementById('stepperDirectInput');

            if (btnDown) {
                bindHoldStepper(btnDown, -1);
            }
            if (btnUp) {
                bindHoldStepper(btnUp, 1);
            }
            if (badgeEl) {
                badgeEl.onclick = (e) => {
                    e.stopPropagation();
                    startDirectInput();
                };
            }
            if (directInput) {
                directInput.onclick = (e) => e.stopPropagation();
                directInput.onkeydown = (e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                        commitDirectInput();
                    } else if (e.key === 'Escape') {
                        cancelDirectInput();
                    }
                };
                directInput.onblur = () => {
                    commitDirectInput();
                };
            }
            if (closeBtn) {
                closeBtn.onclick = (e) => {
                    e.stopPropagation();
                    closeDockStepperPopover();
                };
            }
            if (smallBtn) {
                smallBtn.onclick = (e) => {
                    e.stopPropagation();
                    currentStepMode = 'small';
                    updateStepPillUI();
                };
            }
            if (largeBtn) {
                largeBtn.onclick = (e) => {
                    e.stopPropagation();
                    currentStepMode = 'large';
                    updateStepPillUI();
                };
            }

            document.addEventListener('mousedown', (e) => {
                if (popover.style.display !== 'none' && !popover.contains(e.target) && !e.target.closest('.dock-3d-btn[data-prop]')) {
                    closeDockStepperPopover();
                }
            });
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
                    <span>3D Düzlem & Metin</span>
                </div>
                <div class="three-d-header-actions">
                    <button id="threeDResetBtn" title="Varsayılana Sıfırla" class="three-d-icon-btn"><i class="fas fa-rotate-left"></i></button>
                    <button id="threeDVisHeaderBtn" title="Görünürlüğü Aç/Kapat" class="three-d-icon-btn"><i class="fas fa-eye"></i></button>
                    <button id="threeDCloseBtn" title="Kapat" class="three-d-icon-btn"><i class="fas fa-times"></i></button>
                </div>
            </div>

            <!-- 🌟 ÇOKLU ÖGE SEÇİCİ VE DOĞRUDAN METİN DÜZENLEME ÇUBUĞU -->
            <div id="threeDMultiElementBar" class="three-d-multi-bar" style="display:flex; flex-direction:column; gap:6px; align-items:stretch;">
                <div style="display:flex; align-items:center; gap:6px; width:100%;">
                    <span style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; white-space:nowrap;">Öge:</span>
                    <select id="threeDElementSelector" class="three-d-multi-select" style="flex:1; min-width:0;">
                    </select>
                    <button type="button" id="threeDAddNewElementBtn" class="three-d-add-btn" title="Tuvale Yeni Bir 3D Öge Ekle">
                        <i class="fas fa-plus"></i> Yeni 3D
                    </button>
                    <button type="button" id="threeDDuplicateElementBtn" class="three-d-add-btn" title="Seçili 3D Ögeyi Çoğalt" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#38bdf8;">
                        <i class="fas fa-clone"></i> Çoğalt
                    </button>
                    <button type="button" id="threeDLayerUpBtn" class="three-d-icon-btn" title="Seçili Ögeyi 1 Katman Öne Al" style="width:26px; height:26px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#38bdf8; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:11px;">
                        <i class="fas fa-chevron-up"></i>
                    </button>
                    <button type="button" id="threeDLayerDownBtn" class="three-d-icon-btn" title="Seçili Ögeyi 1 Katman Geriye At" style="width:26px; height:26px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#94a3b8; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:11px;">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <!-- 🌟 Başlıkta Belirtilen 3D Öge İsmi / Metni Doğrudan Düzenleme -->
                <div class="three-d-header-title-box">
                    <i class="fas fa-pen" style="font-size:11px; color:#0ea5e9;"></i>
                    <input type="text" id="threeDHeaderTextInput" class="three-d-header-title-input" placeholder="3D Öge Metni / Başlığı Girin..." value="${state.text || ''}" title="3D metni buradan doğrudan düzenleyin">
                </div>
            </div>

            <div id="threeDLoadingStatus" class="three-d-loading" style="display:none;">
                <i class="fas fa-circle-notch fa-spin"></i> 3D Motoru Hazırlanıyor...
            </div>

            <div class="three-d-body custom-scrollbar">
                <!-- 🌟 0. GRUP & YÜZEY BİRLEŞİMİ AYARLARI (Seçili öge bir gruba dahilse görünür) -->
                <div class="three-d-section" id="threeDGroupControlsSection" style="display:none; margin-bottom:12px;">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                        <div class="three-d-section-title" style="margin-bottom:0; display:flex; align-items:center; gap:6px;">
                            <i class="fas fa-layer-group"></i> GRUP VE YÜZEY AYARLARI
                        </div>
                        <button type="button" id="threeDUngroupBtn" class="three-d-btn-group-action" style="padding:3px 8px; font-size:10px; width:auto; border-radius:4px;" title="Grubu ayır ve ögeleri bağımsız yap">
                            <i class="fas fa-unlink"></i> Grubu Ayır
                        </button>
                    </div>

                    <!-- Düzenleme Modu ve Öge Seçimi -->
                    <div style="font-size:10.5px; font-weight:700; color:#475569; margin-bottom:6px; display:flex; align-items:center; justify-content:space-between;">
                        <span>Düzenleme Modu:</span>
                        <span id="threeDActiveMemberBadge" style="font-size:10px; font-weight:600; color:#0284c7;">Tüm Grup Seçili</span>
                    </div>

                    <!-- Birlikte Düzenle Butonu (İki alt butonun genişliğinde tam boy) -->
                    <div style="margin-bottom:6px;">
                        <button type="button" id="threeDGroupEditAllBtn" class="three-d-btn-group-action active" style="width:100%; justify-content:center; gap:6px; padding:6px 10px; font-size:11px;" title="Tüm grubu birlikte yönetir (boyut, renk, kalınlık, konum)">
                            <i class="fa-solid fa-link"></i> Birlikte Düzenle
                        </button>
                    </div>

                    <!-- Zemin ve Ön Yüz Ayrı Seçim Butonları -->
                    <div id="threeDGroupMembersList" style="display:flex; gap:6px; margin-bottom:8px;">
                    </div>

                    <!-- Yüzey Rolünü Değiştir Butonu -->
                    <div style="margin-bottom:10px;">
                        <button type="button" id="threeDQuickSwapBtn" class="three-d-btn-group-action" style="width:100%; justify-content:center; gap:6px; padding:5px 10px; font-size:10.5px;" title="Zemin ve ön yüz rollerini birbirleriyle değiştirir">
                            <i class="fa-solid fa-right-left"></i> Rol Değiştir
                        </button>
                    </div>

                    <!-- Yüzey Üzerinde Konumlandırma (Dikey, Yatay, İçeri / Dışarı ve Açı) -->
                    <div id="threeDSurfacePositionControls" style="display:flex; flex-direction:column; gap:8px; padding-top:8px; border-top:1px solid rgba(226,232,240,0.6);">
                        <div class="three-d-row" style="flex-direction:column; align-items:stretch; gap:4px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span class="three-d-label" style="width:auto;">Dikey Konum:</span>
                                <span id="threeDSurfaceVertOffsetVal" class="three-d-val" style="color:#0ea5e9; font-weight:700;">0px</span>
                            </div>
                            <input type="range" id="threeDSurfaceVertOffsetInput" min="-500" max="500" step="1" value="0" class="three-d-slider-range" style="width:100%;" title="Ön yüzün zemin üzerinde serbest dikey konumu">
                        </div>

                        <div class="three-d-row" style="flex-direction:column; align-items:stretch; gap:4px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span class="three-d-label" style="width:auto;">Yatay Konum:</span>
                                <span id="threeDSurfaceHorizOffsetVal" class="three-d-val" style="color:#0ea5e9; font-weight:700;">0px</span>
                            </div>
                            <input type="range" id="threeDSurfaceHorizOffsetInput" min="-500" max="500" step="1" value="0" class="three-d-slider-range" style="width:100%;" title="Ön yüzün zemin üzerinde serbest yatay konumu">
                        </div>

                        <div class="three-d-row" style="flex-direction:column; align-items:stretch; gap:4px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span class="three-d-label" style="width:auto;">İçeri / Dışarı:</span>
                                <span id="threeDSurfaceOffsetVal" class="three-d-val" style="color:#0ea5e9; font-weight:700;">+2.5px</span>
                            </div>
                            <input type="range" id="threeDSurfaceOffsetInput" min="-200" max="200" step="0.5" value="2.5" class="three-d-slider-range" style="width:100%;" title="Ön yüzün zeminin önüne, içine veya arkasına derinlik mesafesi">
                        </div>

                        <!-- Hızlı Derinlik Ayarları: Dışarıda, Yüzeyde, İçeride, Arkasında -->
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:4px; margin-bottom:2px;">
                            <button type="button" id="threeDQuickOutBtn" class="three-d-btn-group-action" style="padding:4px 2px; font-size:10px; justify-content:center;" title="Ön yüzü zeminden dışarı çıkarır">
                                Dışarıda
                            </button>
                            <button type="button" id="threeDQuickFlushBtn" class="three-d-btn-group-action" style="padding:4px 2px; font-size:10px; justify-content:center;" title="Ön yüzü zemin yüzeyine tam oturtur">
                                Yüzeyde
                            </button>
                            <button type="button" id="threeDQuickInBtn" class="three-d-btn-group-action" style="padding:4px 2px; font-size:10px; justify-content:center;" title="Ön yüzü zemin içine gömer">
                                İçeride
                            </button>
                            <button type="button" id="threeDQuickBackBtn" class="three-d-btn-group-action" style="padding:4px 2px; font-size:10px; justify-content:center;" title="Ön yüzü zeminin arkasına geçirir">
                                Arkasında
                            </button>
                        </div>

                        <div class="three-d-row" style="flex-direction:column; align-items:stretch; gap:4px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span class="three-d-label" style="width:auto;">Yüzey Açısı:</span>
                                <span id="threeDSurfaceAngleVal" class="three-d-val" style="color:#0ea5e9; font-weight:700;">0°</span>
                            </div>
                            <input type="range" id="threeDSurfaceAngleInput" min="-180" max="180" step="1" value="0" class="three-d-slider-range" style="width:100%;" title="Ön yüzün zemin üzerindeki dönüş açısı">
                        </div>

                        <div>
                            <button type="button" id="threeDSurfaceCenterBtn" class="three-d-btn-group-action" style="width:100%; justify-content:center; gap:6px; padding:4px 10px; font-size:10.5px;" title="Ön yüz ögesini zemin üzerinde tam merkeze hizalar">
                                <i class="fa-solid fa-arrows-to-dot"></i> Yüzeyde Ortala
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 1. ÖGE TÜRÜ SEÇİMİ -->
                <div class="three-d-section" id="threeDTypeSection">
                    <div class="three-d-section-title" id="threeDTypeSectionToggle" style="cursor:pointer; display:flex; align-items:center; justify-content:space-between; user-select:none;" title="Öge Türleri Menüsünü Aç veya Kapat">
                        <span><i class="fas fa-cube" style="color:#0ea5e9;"></i> 3D ÖGE TÜRÜ</span>
                        <i class="fas fa-chevron-down" id="threeDTypeChevron" style="font-size:10px; transition:transform 0.2s;"></i>
                    </div>
                    <!-- 🌟 Birebir 3D Öge Butonu -->
                    <div style="margin-bottom:8px;" id="threeDExactBtnWrap">
                        <button class="three-d-elem-btn active" data-type="element_3d" id="threeDElemExactBtn" style="width:100%; display:none; padding:8px 12px; justify-content:center; gap:8px;" title="Kütüphaneden veya tuvalden seçilen orijinal 2D ögenin birebir 3D hali">
                            <i class="fas fa-cube" style="color:#0ea5e9; font-size:14px;"></i> <span id="threeDElemExactBtnLabel">Birebir 3D Öge</span>
                        </button>
                    </div>
                    <div id="threeDElemTypesContainer" style="display:none;">
                        <div class="three-d-elem-subhead">Standart 3D Kalıplar</div>
                        <div class="three-d-elem-grid">
                            <button class="three-d-elem-btn" data-type="text"><i class="fas fa-font"></i> Metin</button>
                            <button class="three-d-elem-btn" data-type="pin"><i class="fas fa-map-marker-alt"></i> 3D İğne</button>
                            <button class="three-d-elem-btn" data-type="arrow"><i class="fas fa-arrow-up"></i> 3D Yön Oku</button>
                            <button class="three-d-elem-btn" data-type="combo_pin"><i class="fas fa-map-pin"></i> İğne & Metin</button>
                            <button class="three-d-elem-btn" data-type="combo_arrow"><i class="fas fa-location-arrow"></i> Ok & Metin</button>
                        </div>
                        <div class="three-d-elem-subhead" style="margin-top:8px;">Rozetler & İkon</div>
                        <div class="three-d-elem-grid">
                            <button class="three-d-elem-btn" data-type="badge_pill" title="Kapsül Rozet"><i class="fas fa-capsules"></i> Kapsül Rozet</button>
                            <button class="three-d-elem-btn" data-type="badge_shield" title="Güvenlik Kalkanı"><i class="fas fa-shield-halved"></i> Kalkan Rozet</button>
                            <button class="three-d-elem-btn" data-type="badge_card" title="Bilgi Kartı / Plaket"><i class="fas fa-id-card"></i> Plaket Kart</button>
                            <button class="three-d-elem-btn" data-type="badge_coin" title="Dairesel Madalyon"><i class="fas fa-coins"></i> Madalyon</button>
                            <button class="three-d-elem-btn" data-type="icon_3d" title="3D Bağımsız İkon"><i class="fas fa-gem"></i> 3D İkon</button>
                        </div>
                        <div class="three-d-elem-subhead" style="margin-top:8px;">Emlak & Çit Stili</div>
                        <div class="three-d-elem-grid" id="threeDEstateStylesGrid">
                            <button type="button" class="three-d-elem-btn three-d-estate-btn" data-estate-id="fence_panel_green" title="Yeşil Panel Çit"><i class="fas fa-border-all"></i> Panel Çit</button>
                            <button type="button" class="three-d-elem-btn three-d-estate-btn" data-estate-id="fence_wire_mesh" title="Galvaniz Tel Örgü"><i class="fas fa-bars"></i> Tel Örgü</button>
                            <button type="button" class="three-d-elem-btn three-d-estate-btn" data-estate-id="fence_stone_wall" title="Doğal Taş Duvar"><i class="fas fa-cubes-stacked"></i> Taş Duvar</button>
                            <button type="button" class="three-d-elem-btn three-d-estate-btn" data-estate-id="fence_grass_modern" title="Modern Çim Çit"><i class="fas fa-seedling"></i> Çim Çit</button>
                            <button type="button" class="three-d-elem-btn three-d-estate-btn" data-estate-id="fence_wood_picket" title="Beyaz Ahşap Çit"><i class="fas fa-grip-lines-vertical"></i> Ahşap Çit</button>
                            <button type="button" class="three-d-elem-btn three-d-estate-btn" data-estate-id="bld_bungalow_wood" title="Ahşap Bungalov"><i class="fas fa-campground"></i> Bungalov</button>
                            <button type="button" class="three-d-elem-btn three-d-estate-btn" data-estate-id="sign_for_sale_luxury" title="Lüks Satılık Tabela"><i class="fas fa-sign-hanging"></i> Tabela</button>
                            <button type="button" class="three-d-elem-btn three-d-estate-btn" data-estate-id="bld_modern_villa" title="Modern Villa"><i class="fas fa-house-chimney"></i> Villa</button>
                        </div>
                    </div>
                </div>

                <!-- 🌟 1A. BİREBİR 3D ÖGE BİLGİ KARTI & ŞEKİL SEÇİCİ -->
                <div class="three-d-section" id="threeDExactSection" style="display:none; margin-bottom:12px;">
                    <span id="threeDExactItemTitle" style="display:none;"></span>
                    <span id="threeDExactShapeBadge" style="display:none;"></span>

                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px;">
                        <button type="button" class="three-d-shape-mode-btn active" id="threeDShapeModeSilhouette" data-mode="silhouette" title="İkonun kendi dış konturlarıyla katı 3D nesne">Katı Silüet</button>
                        <button type="button" class="three-d-shape-mode-btn" id="threeDShapeModeCoin" data-mode="coin" title="Dairesel rozet madalyon zemininde">Daire Rozet</button>
                        <button type="button" class="three-d-shape-mode-btn" id="threeDShapeModeCard" data-mode="card" title="Köşeleri yuvarlatılmış kart plaketi zemininde">Kart Plaket</button>
                    </div>

                    <div id="threeDExactPlaqueColorRow" style="display:none; margin-top:10px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08);">
                        <div style="font-size:11px; font-weight:700; color:#64748b; margin-bottom:6px;">🎨 PLAKET / ZEMİN RENGİ</div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div class="three-d-color-item" style="flex:1;">
                                <span class="three-d-color-lbl">Zemin:</span>
                                <input type="color" id="threeDExactBadgeBgColor" value="${state.badgeBgColor || '#ffffff'}" class="three-d-color-picker">
                            </div>
                            <div class="three-d-color-item" style="flex:1;">
                                <span class="three-d-color-lbl">Yan Kalınlık:</span>
                                <input type="color" id="threeDExactSideColor" value="${state.sideColor || '#94a3b8'}" class="three-d-color-picker">
                            </div>
                        </div>
                        <div style="display:flex; gap:4px; margin-top:6px;">
                            <button type="button" class="three-d-plaque-chip" data-bg="#ffffff" data-side="#94a3b8" style="flex:1; padding:3px 2px; font-size:10px; background:#f8fafc; color:#0f172a; border-radius:4px; border:1px solid #cbd5e1; cursor:pointer; font-weight:600;">⚪ Beyaz</button>
                            <button type="button" class="three-d-plaque-chip" data-bg="#fef08a" data-side="#ca8a04" style="flex:1; padding:3px 2px; font-size:10px; background:#fef08a; color:#713f12; border-radius:4px; border:1px solid #eab308; cursor:pointer; font-weight:600;">🟡 Altın</button>
                            <button type="button" class="three-d-plaque-chip" data-bg="#0284c7" data-side="#0369a1" style="flex:1; padding:3px 2px; font-size:10px; background:#0284c7; color:#ffffff; border-radius:4px; border:1px solid #0369a1; cursor:pointer; font-weight:600;">🔵 Mavi</button>
                            <button type="button" class="three-d-plaque-chip" data-bg="#dc2626" data-side="#991b1b" style="flex:1; padding:3px 2px; font-size:10px; background:#dc2626; color:#ffffff; border-radius:4px; border:1px solid #991b1b; cursor:pointer; font-weight:600;">🔴 Kırmızı</button>
                            <button type="button" class="three-d-plaque-chip" data-bg="#0f172a" data-side="#334155" style="flex:1; padding:3px 2px; font-size:10px; background:#0f172a; color:#f8fafc; border-radius:4px; border:1px solid #334155; cursor:pointer; font-weight:600;">⚫ Koyu</button>
                        </div>
                    </div>
                </div>

                <!-- 🌟 1B. 3D ROZET & İKON AYARLARI -->
                <div class="three-d-section" id="threeDBadgeSection" style="display:none;">
                    <div class="three-d-section-title"><i class="fa-solid fa-tag" style="color:#0284c7; margin-right:6px;"></i>3D ROZET & İKON AYARLARI</div>
                    
                    <!-- İkon Seçimi & Önizleme -->
                    <div class="three-d-badge-icon-row">
                        <div class="three-d-selected-icon-preview" id="threeDSelectedIconPreview" title="Seçili İkon Önizleme">
                        </div>
                        <div style="flex:1; display:flex; gap:6px;">
                            <button type="button" id="threeDOpenIconPickerBtn" class="three-d-icon-picker-btn">
                                <i class="fas fa-icons"></i> İkon Seç
                            </button>
                            <button type="button" id="threeDRemoveIconBtn" class="three-d-icon-clear-btn" title="İkonsuz Kullan">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Öge Görünüm Modu: 3D Kabartma vs Yassı Resim -->
                    <div id="threeDBadgeElementModeRow" style="margin-top:8px; margin-bottom:8px;">
                        <div style="font-size:10px; font-weight:700; color:#64748b; margin-bottom:4px;">ÖGE GÖRÜNÜMÜ:</div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
                            <button type="button" class="three-d-badge-mode-btn active" id="threeDBadgeModeEmboss" data-mode="emboss" title="Ögeyi 3D kabartma heykelcik olarak rozet üzerine yerleştirir">
                                <i class="fas fa-layer-group"></i> 3D Kabartma
                            </button>
                            <button type="button" class="three-d-badge-mode-btn" id="threeDBadgeModeFlat" data-mode="flat" title="Ögeyi rozet yüzeyine düz baskı resim olarak basar">
                                <i class="fas fa-image"></i> Yassı Resim
                            </button>
                        </div>
                    </div>

                    <!-- 🌟 3D Kabartma & Öge Konum/Boyut Sliderları -->
                    <div id="threeDBadgeSliderControls" style="display:flex; flex-direction:column; gap:8px; margin-top:8px; margin-bottom:8px; padding-top:6px; border-top:1px solid rgba(226,232,240,0.6);">
                        <!-- Kabartma Yüksekliği (Sadece 3D Kabartma Modunda) -->
                        <div class="three-d-row" id="threeDBadgeEmbossDepthRow" style="flex-direction:column; align-items:stretch; gap:4px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span class="three-d-label" style="width:auto;">Kabartma Yüksekliği:</span>
                                <span id="threeDBadgeEmbossDepthVal" class="three-d-val" style="color:#0ea5e9; font-weight:700;">${state.embossDepth || 12}px</span>
                            </div>
                            <input type="range" id="threeDBadgeEmbossDepthInput" min="2" max="40" step="1" value="${state.embossDepth || 12}" class="three-d-slider-range" style="width:100%;" title="3D kabartmanın rozet yüzeyinden öne çıkma mesafesi">
                        </div>

                        <!-- Öge Boyutu -->
                        <div class="three-d-row" style="flex-direction:column; align-items:stretch; gap:4px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span class="three-d-label" style="width:auto;">Öge Boyutu:</span>
                                <span id="threeDBadgeEmbossScaleVal" class="three-d-val" style="color:#0ea5e9; font-weight:700;">${state.embossScale || 85}%</span>
                            </div>
                            <input type="range" id="threeDBadgeEmbossScaleInput" min="30" max="150" step="1" value="${state.embossScale || 85}" class="three-d-slider-range" style="width:100%;" title="Ögenin rozet üzerindeki boyut ölçeği">
                        </div>

                        <!-- Dikey Konum -->
                        <div class="three-d-row" style="flex-direction:column; align-items:stretch; gap:4px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span class="three-d-label" style="width:auto;">Dikey Konum:</span>
                                <span id="threeDBadgeEmbossOffsetYVal" class="three-d-val" style="color:#0ea5e9; font-weight:700;">${state.embossOffsetY || 0}px</span>
                            </div>
                            <input type="range" id="threeDBadgeEmbossOffsetYInput" min="-100" max="100" step="1" value="${state.embossOffsetY || 0}" class="three-d-slider-range" style="width:100%;" title="Ögenin rozet üzerindeki yukarı/aşağı konumu">
                        </div>

                        <!-- Yatay Konum -->
                        <div class="three-d-row" style="flex-direction:column; align-items:stretch; gap:4px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span class="three-d-label" style="width:auto;">Yatay Konum:</span>
                                <span id="threeDBadgeEmbossOffsetXVal" class="three-d-val" style="color:#0ea5e9; font-weight:700;">${state.embossOffsetX || 0}px</span>
                            </div>
                            <input type="range" id="threeDBadgeEmbossOffsetXInput" min="-120" max="120" step="1" value="${state.embossOffsetX || 0}" class="three-d-slider-range" style="width:100%;" title="Ögenin rozet üzerindeki sağa/sola konumu">
                        </div>
                    </div>

                    <!-- Hidden Main Text (managed from header bar) -->
                    <input type="hidden" id="threeDBadgeMainText" value="${state.text || ''}">

                    <!-- Rozet Alt Başlık -->
                    <div class="three-d-row" style="margin-top:8px; margin-bottom:8px;">
                        <input type="text" id="threeDBadgeSubText" class="three-d-input" placeholder="Alt Başlık / Slogan (örn: MÜSTAKİL TAPU)..." value="${state.badgeSubtext || ''}">
                    </div>

                    <!-- Rozet Zemin & Kenarlık Renkleri -->
                    <div class="three-d-color-row" style="margin-bottom:8px;">
                        <div class="three-d-color-item">
                            <span class="three-d-color-lbl">Rozet Gövde</span>
                            <input type="color" id="threeDBadgeBgColor" value="${state.badgeBgColor || '#ffffff'}" class="three-d-color-picker">
                        </div>
                        <div class="three-d-color-item">
                            <span class="three-d-color-lbl">Yazı / Vurgu</span>
                            <input type="color" id="threeDBadgeTextColor" value="${state.frontColor}" class="three-d-color-picker">
                        </div>
                        <div class="three-d-color-item">
                            <span class="three-d-color-lbl">3D Yan Kalınlık</span>
                            <input type="color" id="threeDBadgeSideColor" value="${state.badgeSideColor || '#cbd5e1'}" class="three-d-color-picker">
                        </div>
                    </div>

                    <!-- Hızlı Emlak Rozet Temaları (Clean Single Dot!) -->
                    <div class="three-d-badge-themes-title">Hızlı Emlak Rozet Temaları:</div>
                    <div class="three-d-badge-themes-row">
                        <button type="button" class="three-d-badge-theme-chip" data-bg="#b91c1c" data-front="#ffffff" data-side="#7f1d1d" title="Emlak Kırmızı">🔴 Kırmızı</button>
                        <button type="button" class="three-d-badge-theme-chip" data-bg="#0f172a" data-front="#f59e0b" data-side="#92400e" title="Altın Lüks">🟡 Altın</button>
                        <button type="button" class="three-d-badge-theme-chip" data-bg="#1e3a8a" data-front="#ffffff" data-side="#172554" title="Kurumsal Mavi">🔵 Kurumsal</button>
                        <button type="button" class="three-d-badge-theme-chip" data-bg="#047857" data-front="#ffffff" data-side="#064e3b" title="Fırsat Zümrüt">🟢 Fırsat</button>
                        <button type="button" class="three-d-badge-theme-chip" data-bg="#ffffff" data-front="#0f172a" data-side="#94a3b8" title="Mat Beyaz">⚪ Beyaz</button>
                        <button type="button" class="three-d-badge-theme-chip" data-bg="#581c87" data-front="#facc15" data-side="#3b0764" title="VIP Mor">🟣 VIP Mor</button>
                        <button type="button" class="three-d-badge-theme-chip" data-bg="#c2410c" data-front="#ffffff" data-side="#7c2d12" title="Canlı Turuncu">🟠 Turuncu</button>
                        <button type="button" class="three-d-badge-theme-chip" data-bg="#1e293b" data-front="#38bdf8" data-side="#0284c7" title="Neon Cyan">💎 Neon</button>
                    </div>
                </div>

                <!-- 🌟 1C. 3D YAZI & ALT METİN PANELİ -->
                <div class="three-d-section" id="threeDSubtextSection" style="display:none; margin-bottom:12px;">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                        <div style="font-size:11px; font-weight:800; color:#0284c7; display:flex; align-items:center; gap:5px;">
                            <i class="fas fa-font"></i> 3D YAZI & ALT METİN
                        </div>
                        <button type="button" id="threeDToggle3DTextBtn" class="three-d-mode-toggle-btn" style="padding:4px 9px; font-size:10px; font-weight:700; border-radius:5px; border:1px solid rgba(14,165,233,0.3); background:#f0f9ff; color:#0284c7; cursor:pointer; display:flex; align-items:center; gap:4px; transition:all 0.2s;">
                            <i class="fas fa-toggle-on"></i> 3D Yazı: Açık
                        </button>
                    </div>

                    <div id="threeDSubtextContent" style="display:block;">
                        <!-- Hidden Main Input (handled from header bar) -->
                        <input type="hidden" id="threeDSubtextMainInput" value="${state.text || ''}">
                        <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:8px;">
                            <input type="text" id="threeDSubtextSubInput" class="three-d-input" placeholder="3D Alt Başlık (örn: LÜKS DAİRE)..." value="${state.badgeSubtext || ''}" style="font-size:11px;">
                        </div>

                        <!-- Yönlendirme Modu: Birlikte vs Ayrı Yönlendir Butonları -->
                        <div style="margin-bottom:8px;">
                            <div style="font-size:10px; font-weight:700; color:#64748b; margin-bottom:4px;">YÖNLENDİRME KONTROLÜ:</div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
                                <button type="button" class="three-d-text-mode-btn active" id="threeDTextModeTogether" data-mode="together" style="padding:6px 4px; font-size:10px; font-weight:700; border-radius:5px; border:1px solid #0284c7; background:#0284c7; color:#ffffff; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px; transition:all 0.2s;">
                                    <i class="fas fa-link"></i> Birlikte Yönlendir
                                </button>
                                <button type="button" class="three-d-text-mode-btn" id="threeDTextModeSeparate" data-mode="separate" style="padding:6px 4px; font-size:10px; font-weight:700; border-radius:5px; border:1px solid rgba(0,0,0,0.12); background:#f8fafc; color:#64748b; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px; transition:all 0.2s;">
                                    <i class="fas fa-unlink"></i> Ayrı Yönlendir
                                </button>
                            </div>
                        </div>

                        <!-- Mesafe (Dikey Aralık) & Sağa / Sola Kaydırma -->
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
                            <div>
                                <div style="display:flex; justify-content:space-between; font-size:10px; color:#475569; font-weight:600; margin-bottom:3px;">
                                    <span>Dikey Mesafe:</span>
                                    <span id="threeDTextOffsetVal">${state.text3DOffset !== undefined ? state.text3DOffset : -25}px</span>
                                </div>
                                <input type="range" id="threeDTextOffsetSlider" min="-400" max="400" step="2" value="${state.text3DOffset !== undefined ? state.text3DOffset : -25}" class="three-d-slider-range" style="width:100%;">
                            </div>
                            <div>
                                <div style="display:flex; justify-content:space-between; font-size:10px; color:#475569; font-weight:600; margin-bottom:3px;">
                                    <span>Sağa / Sola:</span>
                                    <span id="threeDTextXOffsetVal" title="Sıfırlamak için tıklayın" style="cursor:pointer; color:#0284c7; font-weight:700;">${state.text3DXOffset !== undefined ? state.text3DXOffset : 0}px</span>
                                </div>
                                <input type="range" id="threeDTextXOffsetSlider" min="-400" max="400" step="1" value="${state.text3DXOffset !== undefined ? state.text3DXOffset : 0}" class="three-d-slider-range" style="width:100%;" title="Yazıyı sağa veya sola kaydır">
                            </div>
                        </div>

                        <!-- Boyut & Kalınlık Seçimi -->
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
                            <div>
                                <div style="display:flex; justify-content:space-between; font-size:10px; color:#475569; font-weight:600; margin-bottom:3px;">
                                    <span>Yazı Boyutu:</span>
                                    <span id="threeDTextSizeVal">${state.text3DSize || 22}px</span>
                                </div>
                                <input type="range" id="threeDTextSizeSlider" min="12" max="60" step="1" value="${state.text3DSize || 22}" class="three-d-slider-range" style="width:100%;">
                            </div>
                            <div>
                                <div style="display:flex; justify-content:space-between; font-size:10px; color:#475569; font-weight:600; margin-bottom:3px;">
                                    <span>Yazı Kalınlığı:</span>
                                    <span id="threeDTextDepthVal">${state.text3DDepth || 8}px</span>
                                </div>
                                <input type="range" id="threeDTextDepthSlider" min="2" max="30" step="1" value="${state.text3DDepth || 8}" class="three-d-slider-range" style="width:100%;">
                            </div>
                        </div>

                        <!-- Yazı Rengi Seçimi -->
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                            <div class="three-d-color-item" style="flex:1;">
                                <span class="three-d-color-lbl">Yazı Rengi:</span>
                                <input type="color" id="threeDTextColorPicker" value="${safeHexColor(state.text3DColor || state.frontColor || '#ffffff', '#ffffff')}" class="three-d-color-picker">
                            </div>
                        </div>

                        <!-- Ayrı Yönlendirme Kontrolleri -->
                        <div id="threeDSeparateControls" style="display:${state.text3DMode === 'separate' ? 'block' : 'none'}; padding-top:8px; border-top:1px dashed rgba(0,0,0,0.12);">
                            <div style="font-size:10px; font-weight:700; color:#0284c7; margin-bottom:6px;">
                                <i class="fas fa-compass"></i> AYRI AÇI & EĞİM (SADECE YAZI)
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                                <div>
                                    <div style="display:flex; justify-content:space-between; font-size:10px; color:#475569; margin-bottom:3px;">
                                        <span>Yazı Eğimi:</span>
                                        <span id="threeDTextPitchVal">${state.text3DPitch || 0}°</span>
                                    </div>
                                    <input type="range" id="threeDTextPitchSlider" min="-90" max="90" step="2" value="${state.text3DPitch || 0}" class="three-d-slider-range" style="width:100%;">
                                </div>
                                <div>
                                    <div style="display:flex; justify-content:space-between; font-size:10px; color:#475569; margin-bottom:3px;">
                                        <span>Yazı Açısı:</span>
                                        <span id="threeDTextYawVal">${state.text3DYaw || 0}°</span>
                                    </div>
                                    <input type="range" id="threeDTextYawSlider" min="-180" max="180" step="5" value="${state.text3DYaw || 0}" class="three-d-slider-range" style="width:100%;">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 🌟 2. 3D BOYUT, AÇI & KONUM AYARLARI (GÜNEŞ HARİÇ TÜM SLIDERLAR ALT ALTA) -->
                <div class="three-d-section" id="threeDTextSection">
                    <div class="three-d-section-title" id="threeDTextSectionTitle"><i class="fa-solid fa-ruler-combined" style="color:#0284c7; margin-right:6px;"></i>3D BOYUT, AÇI & KONUM</div>
                    

                    <!-- Duruş Modu: Yatık Mod / Dik Tabela -->
                    <div class="three-d-btn-group" style="margin-bottom:8px;">
                        <button type="button" id="threeDOrientFlatBtn" class="three-d-tab-btn active"><i class="fas fa-layer-group"></i> Yatık Mod</button>
                        <button type="button" id="threeDOrientStandBtn" class="three-d-tab-btn"><i class="fas fa-monument"></i> Dik Tabela</button>
                    </div>

                    <!-- Araçlar: Tutamaç Ayarları -->
                    <div style="margin-bottom:10px;">
                        <button type="button" id="threeDGizmoSettingsToggleBtn" class="three-d-action-subbtn ${state.gizmoSettingsOpen ? 'active' : ''}" title="Tutamaç & Eksen Ayarları" style="width:100%; display:flex; align-items:center; justify-content:center; gap:6px; padding:7px 10px; font-size:11.5px; border-radius:6px; cursor:pointer;">
                            <i class="fas fa-sliders"></i> Tutamaç Ayarları
                        </button>
                    </div>

                    <!-- TUTAMAÇ & GİZMO AYARLARI ALT PANELİ -->
                    <div id="threeDGizmoSettingsBox" class="three-d-gizmo-settings-box" style="display:${state.gizmoSettingsOpen ? 'block' : 'none'}; margin-bottom:10px;">
                        <div class="three-d-settings-box-header">
                            <div class="three-d-settings-box-title">
                                <i class="fas fa-sliders" style="color:#0284c7;"></i> Tutamaç & Eksen Ayarları
                            </div>
                            <button id="threeDGizmoSettingsCloseBtn" class="three-d-box-close-btn" title="Kapat">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="three-d-setting-item">
                            <label class="three-d-checkbox-label">
                                <input type="checkbox" id="threeDGizmoAutoFitCheck" ${state.gizmoAutoFit ? 'checked' : ''}>
                                <span class="three-d-setting-name">Nesneye Göre Akıllı Orantıla</span>
                            </label>
                        </div>
                        <div class="three-d-slider-group">
                            <div class="three-d-slider-header">
                                <span class="three-d-slider-label">Tutamaç Boyutu:</span>
                                <span id="threeDGizmoScaleVal" class="three-d-slider-val">${Math.round((state.gizmoScale || 1.0) * 100)}%</span>
                            </div>
                            <input type="range" id="threeDGizmoScaleInput" class="three-d-slider-range" min="60" max="200" step="5" value="${Math.round((state.gizmoScale || 1.0) * 100)}">
                        </div>
                        <div class="three-d-slider-group" style="margin-top:6px;">
                            <div class="three-d-slider-header">
                                <span class="three-d-slider-label">Eksen Mesafesi:</span>
                                <span id="threeDGizmoDistanceVal" class="three-d-slider-val">${state.gizmoDistance || 75}px</span>
                            </div>
                            <input type="range" id="threeDGizmoDistanceInput" class="three-d-slider-range" min="40" max="200" step="5" value="${state.gizmoDistance || 75}">
                        </div>
                        <div class="three-d-slider-group" style="margin-top:6px;">
                            <div class="three-d-slider-header">
                                <span class="three-d-slider-label">Gizmo Opaklığı:</span>
                                <span id="threeDGizmoOpacityVal" class="three-d-slider-val">${Math.round((state.gizmoOpacity || 1.0) * 100)}%</span>
                            </div>
                            <input type="range" id="threeDGizmoOpacityInput" class="three-d-slider-range" min="30" max="100" step="5" value="${Math.round((state.gizmoOpacity || 1.0) * 100)}">
                        </div>
                        <div class="three-d-setting-toggles" style="margin-top:6px; padding-top:6px;">
                            <label class="three-d-checkbox-label">
                                <input type="checkbox" id="threeDGizmoShowLabelsCheck" ${state.gizmoShowLabels ? 'checked' : ''}>
                                <span>Eksen Rozet Metinleri</span>
                            </label>
                            <label class="three-d-checkbox-label">
                                <input type="checkbox" id="threeDGizmoShowHudCheck" ${state.gizmoShowHud !== false ? 'checked' : ''}>
                                <span>Canlı Derece Bildirimi</span>
                            </label>
                        </div>
                    </div>

                    <!-- Hızlı Açı Presetleri -->
                    <div style="display:flex; gap:6px; margin-bottom:8px;">
                        <button type="button" class="three-d-preset-btn" data-preset="ground" style="flex:1;" title="Arsa ve Zemin Kuşbakışı Açısı"><i class="fas fa-mountain"></i> Arsa & Zemin</button>
                        <button type="button" class="three-d-preset-btn" data-preset="straight" style="flex:1;" title="Açıları Sıfırla"><i class="fas fa-rotate-left"></i> Açıları Sıfırla</button>
                    </div>

                    <!-- Model Hizalama & Pivot Butonları -->
                    <div style="display:flex; gap:6px; margin-bottom:12px;">
                        <button type="button" id="threeDAutoCenterBtn" class="three-d-preset-btn" style="flex:1;" title="Modelin geometrik merkezini pivot noktasına hizalar"><i class="fas fa-crosshairs"></i> Modeli Merkezle</button>
                        <button type="button" id="threeDAlignBaseBtn" class="three-d-preset-btn" style="flex:1;" title="Modelin tabanını zemin düzlemine oturtur"><i class="fas fa-arrows-down-to-line"></i> Tabana Oturt</button>
                    </div>

                    <!-- 🌟 1. 3D Öge Boyutu -->
                    <div class="three-d-slider-group" style="margin-bottom:8px;">
                        <div class="three-d-slider-header">
                            <span class="three-d-slider-label"><i class="fas fa-expand-arrows-alt" style="color:#0ea5e9;"></i> 3D Öge Boyutu:</span>
                            <div style="display:flex; align-items:center; gap:5px;">
                                <button type="button" class="three-d-step-btn" id="threeDScaleDecBtn" title="Boyutu Azalt">−</button>
                                <span id="threeDScaleVal" class="three-d-slider-val">${Math.round(state.planeScale * 100)}%</span>
                                <button type="button" class="three-d-step-btn" id="threeDScaleIncBtn" title="Boyutu Artır">+</button>
                            </div>
                        </div>
                        <input type="range" id="threeDScaleInput" class="three-d-slider-range" min="20" max="300" step="5" value="${Math.round(state.planeScale * 100)}">
                    </div>

                    <!-- 🌟 2. 3D Kalınlık -->
                    <div class="three-d-slider-group" style="margin-bottom:8px;">
                        <div class="three-d-slider-header">
                            <span class="three-d-slider-label"><i class="fas fa-layer-group" style="color:#38bdf8;"></i> 3D Kalınlık:</span>
                            <div style="display:flex; align-items:center; gap:5px;">
                                <button type="button" class="three-d-step-btn" id="threeDDepthDecBtn" title="Kalınlığı Azalt">−</button>
                                <span id="threeDDepthVal" class="three-d-slider-val">${state.depth}px</span>
                                <button type="button" class="three-d-step-btn" id="threeDDepthIncBtn" title="Kalınlığı Artır">+</button>
                            </div>
                        </div>
                        <input type="range" id="threeDDepthInput" class="three-d-slider-range" min="1" max="80" value="${state.depth}">
                    </div>

                    <!-- 🌟 2.5 Dikey Yükseklik (Taban Çizgisinden Yukarı Uzatma) -->
                    <div class="three-d-slider-group" id="threeDHeightScaleRow" style="margin-bottom:8px;">
                        <div class="three-d-slider-header">
                            <span class="three-d-slider-label"><i class="fas fa-arrows-up-down" style="color:#0ea5e9;"></i> Dikey Yükseklik:</span>
                            <div style="display:flex; align-items:center; gap:5px;">
                                <button type="button" class="three-d-step-btn" id="threeDHeightScaleDecBtn" title="Yüksekliği Azalt">−</button>
                                <span id="threeDHeightScaleVal" class="three-d-slider-val">${Math.round((state.heightScale || 1.0) * 100)}%</span>
                                <button type="button" class="three-d-step-btn" id="threeDHeightScaleIncBtn" title="Yüksekliği Artır">+</button>
                            </div>
                        </div>
                        <input type="range" id="threeDHeightScaleInput" class="three-d-slider-range" min="30" max="400" step="5" value="${Math.round((state.heightScale || 1.0) * 100)}">
                    </div>

                    <!-- 🌟 3. Eğim X -->
                    <div class="three-d-slider-group" style="margin-bottom:8px;">
                        <div class="three-d-slider-header">
                            <span class="three-d-slider-label"><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#ef4444; margin-right:4px;"></span> Eğim X:</span>
                            <span id="threeDPitchVal" class="three-d-slider-val">${state.planePitch}°</span>
                        </div>
                        <input type="range" id="threeDPitchInput" class="three-d-slider-range" min="-90" max="90" value="${state.planePitch}">
                    </div>

                    <!-- 🌟 4. Yatay Y -->
                    <div class="three-d-slider-group" style="margin-bottom:8px;">
                        <div class="three-d-slider-header">
                            <span class="three-d-slider-label"><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; margin-right:4px;"></span> Yatay Y:</span>
                            <span id="threeDYawVal" class="three-d-slider-val">${state.planeYaw}°</span>
                        </div>
                        <input type="range" id="threeDYawInput" class="three-d-slider-range" min="-180" max="180" value="${state.planeYaw}">
                    </div>

                    <!-- 🌟 5. Yatırma Z -->
                    <div class="three-d-slider-group" style="margin-bottom:8px;">
                        <div class="three-d-slider-header">
                            <span class="three-d-slider-label"><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#00d2ff; margin-right:4px;"></span> Yatırma Z:</span>
                            <span id="threeDRollVal" class="three-d-slider-val">${state.planeRoll}°</span>
                        </div>
                        <input type="range" id="threeDRollInput" class="three-d-slider-range" min="-180" max="180" value="${state.planeRoll}">
                    </div>

                    <!-- 🌟 6. Düzlem İçi Dönüş (Sadece Yatık Mod için zemin açısı) -->
                    <div class="three-d-slider-group" id="threeDLocalRotGroup" style="margin-bottom:8px; display:${state.orientation === 'flat' ? 'block' : 'none'};">
                        <div class="three-d-slider-header">
                            <span class="three-d-slider-label"><i class="fas fa-arrows-spin" style="color:#a855f7;"></i> Düzlem İçi Dönüş:</span>
                            <span id="threeDLocalRotVal" class="three-d-slider-val">${state.planeLocalRot > 0 ? '+' : ''}${state.planeLocalRot}°</span>
                        </div>
                        <input type="range" id="threeDLocalRotInput" class="three-d-slider-range" min="-180" max="180" value="${state.planeLocalRot}">
                    </div>

                    <!-- 🌟 7. Yerden Yükseklik -->
                    <div class="three-d-slider-group" style="margin-bottom:8px;">
                        <div class="three-d-slider-header">
                            <span class="three-d-slider-label"><i class="fas fa-arrow-up-from-bracket" style="color:#0ea5e9;"></i> Yerden Yükseklik:</span>
                            <span id="threeDElevationVal" class="three-d-slider-val">${state.planeElevation}px</span>
                        </div>
                        <input type="range" id="threeDElevationInput" class="three-d-slider-range" min="0" max="500" value="${state.planeElevation}">
                    </div>

                    <!-- 🌟 8. Yazı Font Boyutu (Sadece Metin Ögeleri İçin) -->
                    <div class="three-d-slider-group" id="threeDSizeRow" style="margin-bottom:8px;">
                        <div class="three-d-slider-header">
                            <span class="three-d-slider-label"><i class="fas fa-text-height" style="color:#94a3b8;"></i> Yazı Font Boyutu:</span>
                            <span id="threeDSizeVal" class="three-d-slider-val">${state.textSize}px</span>
                        </div>
                        <input type="range" id="threeDSizeInput" class="three-d-slider-range" min="14" max="110" value="${state.textSize}">
                    </div>

                    <!-- Gizli Metin Fallback -->
                    <div id="threeDTextRow" style="display:none;">
                        <input type="hidden" id="threeDTextInput" value="${state.text || ''}">
                    </div>

                    <!-- Seçenekler: Işık Pahı & 3D Izgara -->
                    <div style="display:flex; flex-direction:column; gap:6px; margin-top:10px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08);">
                        <label style="font-size:11.5px; display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:600;">
                            <input type="checkbox" id="threeDBevelCheck" checked> Kenarlarda Işık Pahı
                        </label>
                        <label style="font-size:11.5px; display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:600;">
                            <input type="checkbox" id="threeDGridCheck"${state.showPlaneGrid ? ' checked' : ''}> 3D Referans Izgarası
                        </label>
                    </div>
                </div>

                <!-- 5. 3D RENK AYARLARI (METİN / İĞNE / OK İÇİN) -->
                <div class="three-d-section" id="threeDColorSection">
                    <div class="three-d-section-title"><i class="fa-solid fa-palette" style="color:#0284c7; margin-right:6px;"></i>3D RENK AYARLARI</div>

                    <div class="three-d-color-row">
                        <div class="three-d-color-item" id="threeDFrontColorCol">
                            <span class="three-d-color-lbl" id="threeDFrontColorLbl">Ön Yüz Rengi</span>
                            <input type="color" id="threeDFrontColor" value="${state.frontColor}" class="three-d-color-picker">
                        </div>
                        <div class="three-d-color-item" id="threeDPlaketBgColorCol" style="display:${(state.shapeMode === 'coin' || state.shapeMode === 'card') ? 'block' : 'none'};">
                            <span class="three-d-color-lbl">Plaket Zemin</span>
                            <input type="color" id="threeDPlaketBgColor" value="${safeHexColor(state.badgeBgColor, '#ffffff')}" class="three-d-color-picker">
                        </div>
                        <div class="three-d-color-item">
                            <span class="three-d-color-lbl">Yan Kalınlık Rengi</span>
                            <input type="color" id="threeDSideColor" value="${state.sideColor}" class="three-d-color-picker">
                        </div>
                    </div>

                    <div style="margin-top:6px; margin-bottom:8px;">
                        <label style="font-size:11.5px; display:inline-flex; align-items:center; gap:6px; cursor:pointer; font-weight:600; color:#334155;">
                            <input type="checkbox" id="threeDGradientCheck" ${state.useGradient ? 'checked' : ''}> Renk Gradyanı
                        </label>
                    </div>

                    <div class="three-d-chips-row">
                        <button type="button" class="three-d-chip" style="background:linear-gradient(135deg, #ef4444, #f59e0b, #10b981, #00d2ff, #6366f1);" data-reset="true" title="Orijinal Renk"></button>
                        <button type="button" class="three-d-chip" style="background:#f59e0b;" data-front="#f59e0b" data-side="#92400e" title="Altın Sarısı"></button>
                        <button type="button" class="three-d-chip" style="background:#ffffff;" data-front="#ffffff" data-side="#64748b" title="Mat Beyaz"></button>
                        <button type="button" class="three-d-chip" style="background:#00d2ff;" data-front="#00d2ff" data-side="#0284c7" title="Neon Cyan"></button>
                        <button type="button" class="three-d-chip" style="background:#ef4444;" data-front="#ef4444" data-side="#991b1b" title="Emlak Kırmızısı"></button>
                        <button type="button" class="three-d-chip" style="background:#10b981;" data-front="#10b981" data-side="#065f46" title="Zümrüt Yeşili"></button>
                    </div>
                </div>

                <!-- 🌟 5B. EMLAK MALZEME & DOKU BÖLÜMÜ (modules/three-d-textures.js) -->
                <div id="threeDTextureSectionHost"></div>

                <!-- 6. 3D GÜNEŞ & ODA IŞIK KAYNAĞI -->
                <div class="three-d-section" id="threeDSunSection">
                    <div class="three-d-section-title"><i class="fa-solid fa-sun" style="color:#f59e0b; margin-right:6px;"></i>3D GÜNEŞ & ODA IŞIK KAYNAĞI</div>
                    
                    <!-- Hızlı Oda Işığı Presetleri -->
                    <div class="three-d-presets-grid" style="margin-bottom:10px;">
                        <button class="three-d-preset-btn" id="threeDSunPresetRight" type="button" title="Sağ Pencere"><i class="fas fa-sun"></i> Sağ Pencere</button>
                        <button class="three-d-preset-btn" id="threeDSunPresetLeft" type="button" title="Sol Pencere"><i class="fas fa-sun"></i> Sol Pencere</button>
                        <button class="three-d-preset-btn" id="threeDSunPresetTop" type="button" title="Tavan / Tepe Işığı"><i class="fas fa-lightbulb"></i> Tavan</button>
                        <button class="three-d-preset-btn" id="threeDSunPresetFront" type="button" title="Karşı / Flaş Işık"><i class="fas fa-camera"></i> Karşı</button>
                    </div>

                    <!-- Gölge ve Işık Ayarları (Alt Alta) -->
                    <div class="three-d-slider-group">
                        <div class="three-d-slider-header">
                            <span class="three-d-slider-label"><i class="fas fa-circle-half-stroke" style="color:#64748b;"></i> Gölge Tonu:</span>
                            <span id="threeDShadowVal" class="three-d-slider-val">${Math.round(state.shadowOpacity * 100)}%</span>
                        </div>
                        <input type="range" id="threeDShadowOpacity" class="three-d-slider-range" min="0" max="100" value="${Math.round(state.shadowOpacity * 100)}">
                    </div>

                    <div class="three-d-slider-group">
                        <div class="three-d-slider-header">
                            <span class="three-d-slider-label"><i class="fas fa-feather" style="color:#64748b;"></i> Gölge Yumuşaklığı:</span>
                            <span id="threeDShadowSoftVal" class="three-d-slider-val">${state.shadowSoftness || 2.5}x</span>
                        </div>
                        <input type="range" id="threeDShadowSoftness" class="three-d-slider-range" min="1" max="10" step="0.5" value="${state.shadowSoftness || 2.5}">
                    </div>

                    <div class="three-d-slider-group">
                        <div class="three-d-slider-header">
                            <span class="three-d-slider-label"><i class="fas fa-bolt" style="color:#f59e0b;"></i> Işık Gücü:</span>
                            <span id="threeDLightIntensityVal" class="three-d-slider-val">${state.lightIntensity}x</span>
                        </div>
                        <input type="range" id="threeDLightIntensity" class="three-d-slider-range" min="0.5" max="3.0" step="0.1" value="${state.lightIntensity}">
                    </div>

                    <!-- Gelişmiş Işık Konum Koordinatları (Akordeon) -->
                    <div style="margin-top:10px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.08);">
                        <button type="button" id="threeDToggleAdvSunBtn" class="three-d-action-subbtn" style="width:100%; display:flex; align-items:center; justify-content:center; gap:6px; padding:6px 10px; font-size:11px; border-radius:6px; cursor:pointer;" title="Işık Konum Koordinatları">
                            <i class="fas fa-sliders"></i> Gelişmiş Işık Konumu
                        </button>
                        <div id="threeDAdvSunBox" style="display:none; margin-top:8px;">
                            <div class="three-d-slider-group">
                                <div class="three-d-slider-header">
                                    <span class="three-d-slider-label"><i class="fas fa-arrows-alt-h" style="color:#f59e0b;"></i> X (Yatay Konum):</span>
                                    <span id="threeDSunPosXVal" class="three-d-slider-val">${state.sunPosX}px</span>
                                </div>
                                <input type="range" id="threeDSunPosX" class="three-d-slider-range" min="-1000" max="1000" value="${state.sunPosX}">
                            </div>
                            <div class="three-d-slider-group" style="margin-top:6px;">
                                <div class="three-d-slider-header">
                                    <span class="three-d-slider-label"><i class="fas fa-arrows-alt-v" style="color:#10b981;"></i> Y (Işık Yüksekliği):</span>
                                    <span id="threeDSunPosYVal" class="three-d-slider-val">${state.sunPosY}px</span>
                                </div>
                                <input type="range" id="threeDSunPosY" class="three-d-slider-range" min="-600" max="1000" value="${state.sunPosY}">
                            </div>
                            <div class="three-d-slider-group" style="margin-top:6px;">
                                <div class="three-d-slider-header">
                                    <span class="three-d-slider-label"><i class="fas fa-cube" style="color:#00d2ff;"></i> Z (Oda Derinliği):</span>
                                    <span id="threeDSunPosZVal" class="three-d-slider-val">${state.sunPosZ}px</span>
                                </div>
                                <input type="range" id="threeDSunPosZ" class="three-d-slider-range" min="-1200" max="1200" value="${state.sunPosZ}">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
`;

        document.body.appendChild(panel);
        positionStudioPanelOverLeftPanel(panel);

        // 🛡️ Panel içi tıklamaların tuvale veya sayfa dışına sızmasını engelle (kabarcık aşamasında durdur)
        ['pointerdown', 'mousedown', 'click'].forEach(evt => {
            panel.addEventListener(evt, (e) => e.stopPropagation());
        });

        bindPanelEvents(panel);
        if (window.ThreeDTextures && typeof window.ThreeDTextures.init === 'function') {
            window.ThreeDTextures.init(panel);
        }
        makeDraggable(panel, document.getElementById('threeDPanelHeader'));
        return panel;
    }

    /**
     * 🌟 Birebir 3D Öge: Şekil Modunu Değiştirme (Katı Silüet ↔ Yuvarlak Rozet ↔ Kart Plaket)
     */
    function setElementShapeMode(mode, targetEl) {
        const el = targetEl || getActiveElement();
        if (!el || el.elementType !== 'element_3d') return;
        el.shapeMode = mode;
        state.shapeMode = mode;

        if (mode === 'silhouette') {
            el.isRound = false;
            state.isRound = false;
            el.sideColor = autoGenerateSideColor(el.frontColor);
            state.sideColor = el.sideColor;
            if (!el.cachedSilhouette && el.sourceSvg) {
                const svgDims = parseSvgDimensions(el.sourceSvg);
                extractSvgSilhouetteShape(el.sourceSvg, svgDims.targetW, svgDims.targetH, { forceSilhouette: true }).then(res => {
                    if (res && res.shape) {
                        el.cachedSilhouette = res;
                        el.isExactSilhouette = true;
                        state.isExactSilhouette = true;
                        recreateContentMeshes(el);
                        syncControlsUI();
                        requestRender();
                    }
                });
                return;
            }
            el.isExactSilhouette = !!(el.cachedSilhouette && el.cachedSilhouette.shape);
            state.isExactSilhouette = el.isExactSilhouette;
        } else if (mode === 'coin' || mode === 'card') {
            el.isRound = (mode === 'coin');
            state.isRound = (mode === 'coin');
            el.isExactSilhouette = false;
            state.isExactSilhouette = false;

            // Koyu renkli ikonlarda rozet/plaket zeminini beyaz yaparak maksimum kontrast sağla
            let isDark = false;
            try {
                const c = new THREE.Color(el.frontColor);
                if ((0.299 * c.r + 0.587 * c.g + 0.114 * c.b) < 0.45) isDark = true;
            } catch(e){}
            if (!el.badgeBgColor || (isDark && (el.badgeBgColor === '#0f172a' || el.badgeBgColor === '#001d3d'))) {
                el.badgeBgColor = '#ffffff';
                state.badgeBgColor = '#ffffff';
                el.sideColor = '#94a3b8';
                state.sideColor = '#94a3b8';
            }
        }

        recreateContentMeshes(el);
        syncControlsUI();
        requestRender();
    }

    /**
     * 13. Panel Kontrol Olay Dinleyicileri
     */
    function bindPanelEvents(panel) {
        // Öge Türü Menüsü Aç/Kapat (Akordeon)
        const typeToggle = panel.querySelector('#threeDTypeSectionToggle');
        const typeContainer = panel.querySelector('#threeDElemTypesContainer');
        const typeChevron = panel.querySelector('#threeDTypeChevron');
        if (typeToggle && typeContainer) {
            typeToggle.addEventListener('click', () => {
                const isOpen = typeContainer.style.display !== 'none';
                typeContainer.style.display = isOpen ? 'none' : 'block';
                if (typeChevron) {
                    typeChevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
                }
            });
        }

        // Öge Türü
        panel.querySelectorAll('.three-d-elem-btn[data-type]').forEach(btn => {
            btn.addEventListener('click', () => {
                const dType = btn.getAttribute('data-type');
                if (!dType) return;
                panel.querySelectorAll('.three-d-elem-btn[data-type]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.elementType = dType;
                const el = getActiveElement();
                if (el) {
                    el.elementType = dType;
                    if (dType.startsWith('badge_') || dType === 'icon_3d') {
                        // Rozet moduna geçerken plaket zeminini temiz beyaz akrilik ve kenarları platin yap
                        if (!el.badgeBgColor || el.badgeBgColor === 'transparent') {
                            el.badgeBgColor = '#ffffff';
                            state.badgeBgColor = '#ffffff';
                        }
                        if (!el.badgeSideColor) {
                            el.badgeSideColor = '#cbd5e1';
                            state.badgeSideColor = '#cbd5e1';
                        }
                        if (!el.badgeElementMode) {
                            el.badgeElementMode = 'emboss';
                            state.badgeElementMode = 'emboss';
                        }
                    }
                }
                recreateContentMeshes();
                syncControlsUI();
                requestRender();
            });
        });

        // 🏡 3D Emlak & Çit Stili Hızlı Butonları
        panel.querySelectorAll('.three-d-estate-btn[data-estate-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const estateId = btn.getAttribute('data-estate-id');
                if (estateId) {
                    setElementEstateStyle(estateId);
                }
            });
        });

        // 🌟 Birebir 3D Öge Şekil Modu Butonları (Katı Silüet ↔ Yuvarlak Rozet ↔ Kart Plaket)
        panel.querySelectorAll('#threeDExactSection .three-d-shape-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                setElementShapeMode(mode);
            });
        });

        // 🌟 Birebir 3D Öge: Plaket / Zemin Renkleri ve Hızlı Temalar
        const exBadgeBgColor = panel.querySelector('#threeDExactBadgeBgColor');
        if (exBadgeBgColor) {
            exBadgeBgColor.addEventListener('input', (e) => {
                state.badgeBgColor = e.target.value;
                const origBg = panel.querySelector('#threeDBadgeBgColor');
                if (origBg) origBg.value = state.badgeBgColor;
                const el = getActiveElement();
                if (el) el.badgeBgColor = state.badgeBgColor;
                updateElementColorsFast(el);
            });
        }

        const exSideColor = panel.querySelector('#threeDExactSideColor');
        if (exSideColor) {
            exSideColor.addEventListener('input', (e) => {
                state.sideColor = e.target.value;
                const origSide = panel.querySelector('#threeDSideColor');
                if (origSide) origSide.value = state.sideColor;
                const el = getActiveElement();
                if (el) el.sideColor = state.sideColor;
                updateElementColorsFast(el, { onlySide: true });
            });
        }

        panel.querySelectorAll('.three-d-plaque-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const bg = chip.getAttribute('data-bg');
                const side = chip.getAttribute('data-side');
                const el = getActiveElement();
                if (bg) {
                    state.badgeBgColor = bg;
                    if (el) {
                        el.badgeBgColor = bg;
                        el._userHasChangedColor = true;
                    }
                    const exBg = panel.querySelector('#threeDExactBadgeBgColor');
                    if (exBg) exBg.value = bg;
                    const origBg = panel.querySelector('#threeDBadgeBgColor');
                    if (origBg) origBg.value = bg;
                }
                if (side) {
                    state.sideColor = side;
                    if (el) {
                        el.sideColor = side;
                        el.badgeSideColor = side;
                    }
                    const exSide = panel.querySelector('#threeDExactSideColor');
                    if (exSide) exSide.value = side;
                    const origSide = panel.querySelector('#threeDSideColor');
                    if (origSide) origSide.value = side;
                }
                updateElementColorsFast(el);
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
                const el = getActiveElement();
                if (el) {
                    el.badgeBgColor = state.badgeBgColor;
                    el._userHasChangedColor = true;
                }
                updateElementColorsFast(el);
            });
        }

        const bTextColor = panel.querySelector('#threeDBadgeTextColor');
        if (bTextColor) {
            bTextColor.addEventListener('input', (e) => {
                const val = e.target.value;
                state.frontColor = val;
                const el = getActiveElement();
                if (el) {
                    el.frontColor = val;
                    el._userHasChangedColor = true;
                }
                const origFront = panel.querySelector('#threeDFrontColor');
                if (origFront) origFront.value = val;
                // Eğer yazı ve ikon ayrı değilse 3D yazı rengini de güncelle
                if (state.text3DMode !== 'separate') {
                    state.text3DColor = val;
                    if (el) el.text3DColor = val;
                    const tc = panel.querySelector('#threeDTextColorPicker');
                    if (tc) tc.value = val;
                }
                updateElementColorsFast(el);
            });
        }

        const bSideColor = panel.querySelector('#threeDBadgeSideColor');
        if (bSideColor) {
            bSideColor.addEventListener('input', (e) => {
                const val = e.target.value;
                state.badgeSideColor = val;
                state.sideColor = val;
                const el = getActiveElement();
                if (el) {
                    el.badgeSideColor = state.badgeSideColor;
                    el.sideColor = state.badgeSideColor;
                }
                updateElementColorsFast(el, { onlySide: true });
            });
        }

        // 🌟 Rozet Öge Görünüm Modu: 3D Kabartma vs Yassı Resim
        panel.querySelectorAll('#threeDBadgeModeEmboss, #threeDBadgeModeFlat').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode') || 'emboss';
                state.badgeElementMode = mode;
                const el = getActiveElement();
                if (el) el.badgeElementMode = mode;
                panel.querySelectorAll('#threeDBadgeModeEmboss, #threeDBadgeModeFlat').forEach(b => b.classList.toggle('active', b === btn));
                const depthRow = panel.querySelector('#threeDBadgeEmbossDepthRow');
                if (depthRow) depthRow.style.display = (mode === 'emboss') ? 'flex' : 'none';
                recreateContentMeshes();
                syncControlsUI();
                requestRender();
            });
        });

        // 🌟 Rozet 3D Kabartma & Öge Konum/Boyut Slider Dinleyicileri
        const bEmbossDepth = panel.querySelector('#threeDBadgeEmbossDepthInput');
        if (bEmbossDepth) {
            bEmbossDepth.addEventListener('input', (e) => {
                const val = parseInt(e.target.value, 10) || 12;
                state.embossDepth = val;
                const el = getActiveElement();
                if (el) el.embossDepth = val;
                const lbl = panel.querySelector('#threeDBadgeEmbossDepthVal');
                if (lbl) lbl.textContent = val + 'px';
                recreateContentMeshes();
                requestRender();
            });
        }

        const bEmbossScale = panel.querySelector('#threeDBadgeEmbossScaleInput');
        if (bEmbossScale) {
            bEmbossScale.addEventListener('input', (e) => {
                const val = parseInt(e.target.value, 10) || 85;
                state.embossScale = val;
                const el = getActiveElement();
                if (el) el.embossScale = val;
                const lbl = panel.querySelector('#threeDBadgeEmbossScaleVal');
                if (lbl) lbl.textContent = val + '%';
                recreateContentMeshes();
                requestRender();
            });
        }

        const bEmbossOffsetY = panel.querySelector('#threeDBadgeEmbossOffsetYInput');
        if (bEmbossOffsetY) {
            bEmbossOffsetY.addEventListener('input', (e) => {
                const val = parseInt(e.target.value, 10) || 0;
                state.embossOffsetY = val;
                const el = getActiveElement();
                if (el) el.embossOffsetY = val;
                const lbl = panel.querySelector('#threeDBadgeEmbossOffsetYVal');
                if (lbl) lbl.textContent = (val > 0 ? '+' : '') + val + 'px';
                recreateContentMeshes();
                requestRender();
            });
        }

        const bEmbossOffsetX = panel.querySelector('#threeDBadgeEmbossOffsetXInput');
        if (bEmbossOffsetX) {
            bEmbossOffsetX.addEventListener('input', (e) => {
                const val = parseInt(e.target.value, 10) || 0;
                state.embossOffsetX = val;
                const el = getActiveElement();
                if (el) el.embossOffsetX = val;
                const lbl = panel.querySelector('#threeDBadgeEmbossOffsetXVal');
                if (lbl) lbl.textContent = (val > 0 ? '+' : '') + val + 'px';
                recreateContentMeshes();
                requestRender();
            });
        }

        // Hızlı Rozet Temaları
        panel.querySelectorAll('.three-d-badge-theme-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const bg = chip.getAttribute('data-bg');
                const front = chip.getAttribute('data-front');
                const side = chip.getAttribute('data-side');
                const el = getActiveElement();
                if (bg) { state.badgeBgColor = bg; if (el) el.badgeBgColor = bg; }
                if (front) {
                    state.frontColor = front;
                    if (el) el.frontColor = front;
                    if (state.text3DMode !== 'separate') {
                        state.text3DColor = front;
                        if (el) el.text3DColor = front;
                        const tc = panel.querySelector('#threeDTextColorPicker');
                        if (tc) tc.value = front;
                    }
                }
                if (side) { state.badgeSideColor = side; if (el) el.badgeSideColor = side; }
                updateElementColorsFast(el);
                syncControlsUI();
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
                state.sourceSvg = null;
                state.customIconSvg = null;
                const el = getActiveElement();
                if (el) {
                    el.selectedIconId = 'none';
                    el.sourceSvg = null;
                    el.customIconSvg = null;
                    if (el.reliefMesh && el.contentGroup) {
                        el.contentGroup.remove(el.reliefMesh);
                        if (el.reliefMesh.geometry) el.reliefMesh.geometry.dispose();
                        el.reliefMesh = null;
                    }
                }
                recreateContentMeshes();
                syncControlsUI();
                requestRender();
            });
        }

        // 🌟 3D Alt Metin / Yazı Kontrol Dinleyicileri
        const tog3DTextBtn = panel.querySelector('#threeDToggle3DTextBtn');
        if (tog3DTextBtn) {
            tog3DTextBtn.addEventListener('click', () => {
                state.show3DText = !state.show3DText;
                const el = getActiveElement();
                if (el) {
                    el.show3DText = state.show3DText;
                    if (el.show3DText && !el.text && !el.badgeSubtext) {
                        el.text = el.sourceItemName || '3D METİN';
                        state.text = el.text;
                    }
                }
                recreateContentMeshes();
                syncControlsUI();
                requestRender();
            });
        }

        const togTogether = panel.querySelector('#threeDTextModeTogether');
        const togSeparate = panel.querySelector('#threeDTextModeSeparate');
        if (togTogether) {
            togTogether.addEventListener('click', () => {
                state.text3DMode = 'together';
                const el = getActiveElement();
                if (el) {
                    el.text3DMode = 'together';
                    el.text3DPitch = 0;
                    el.text3DYaw = 0;
                    el.text3DRoll = 0;
                    // Birlikte yönlendir seçildiğinde yazı rengini ikon rengiyle eşitle
                    state.text3DColor = state.frontColor;
                    el.text3DColor = state.frontColor;
                }
                recreateContentMeshes();
                syncControlsUI();
                requestRender();
                if (window.showToast) window.showToast('🔗 3D Yazı ve İkon Birlikte Yönlendiriliyor', 'info');
            });
        }
        if (togSeparate) {
            togSeparate.addEventListener('click', () => {
                state.text3DMode = 'separate';
                const el = getActiveElement();
                if (el) el.text3DMode = 'separate';
                recreateContentMeshes();
                syncControlsUI();
                requestRender();
                if (window.showToast) window.showToast('🔓 3D Yazı Ayrı Yönlendirme Modu Açıldı', 'info');
            });
        }

        const subMainIn = panel.querySelector('#threeDSubtextMainInput');
        if (subMainIn) {
            subMainIn.addEventListener('input', (e) => {
                state.text = e.target.value;
                const el = getActiveElement();
                if (el) el.text = state.text;
                const origText = panel.querySelector('#threeDTextInput');
                if (origText) origText.value = state.text;
                const bMain = panel.querySelector('#threeDBadgeMainText');
                if (bMain) bMain.value = state.text;
                recreateContentMeshes();
                requestRender();
            });
        }

        const subSubIn = panel.querySelector('#threeDSubtextSubInput');
        if (subSubIn) {
            subSubIn.addEventListener('input', (e) => {
                state.badgeSubtext = e.target.value;
                const el = getActiveElement();
                if (el) {
                    el.badgeSubtext = state.badgeSubtext;
                    const hasSvgText = !!(el.sourceSvg && el.sourceSvg.includes('<text'));
                    if (!hasSvgText && !el.text && state.badgeSubtext.trim() && el.elementType === 'element_3d') {
                        el.show3DText = true;
                        state.show3DText = true;
                    }
                }
                const bSub = panel.querySelector('#threeDBadgeSubText');
                if (bSub) bSub.value = state.badgeSubtext;
                recreateContentMeshes();
                requestRender();
            });
        }

        const textOffSlider = panel.querySelector('#threeDTextOffsetSlider');
        if (textOffSlider) {
            textOffSlider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                state.text3DOffset = val;
                const el = getActiveElement();
                if (el) el.text3DOffset = val;
                const lbl = panel.querySelector('#threeDTextOffsetVal');
                if (lbl) lbl.textContent = val + 'px';
                recreateContentMeshes();
                requestRender();
            });
        }

        const textXOffSlider = panel.querySelector('#threeDTextXOffsetSlider');
        if (textXOffSlider) {
            textXOffSlider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                state.text3DXOffset = val;
                const el = getActiveElement();
                if (el) el.text3DXOffset = val;
                const lbl = panel.querySelector('#threeDTextXOffsetVal');
                if (lbl) lbl.textContent = val + 'px';
                recreateContentMeshes();
                requestRender();
            });
        }
        const textXOffVal = panel.querySelector('#threeDTextXOffsetVal');
        if (textXOffVal) {
            textXOffVal.addEventListener('click', () => {
                state.text3DXOffset = 0;
                const el = getActiveElement();
                if (el) el.text3DXOffset = 0;
                if (textXOffSlider) textXOffSlider.value = 0;
                textXOffVal.textContent = '0px';
                recreateContentMeshes();
                requestRender();
            });
        }

        const textSzSlider = panel.querySelector('#threeDTextSizeSlider');
        if (textSzSlider) {
            textSzSlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                state.text3DSize = val;
                const el = getActiveElement();
                if (el) el.text3DSize = val;
                const lbl = panel.querySelector('#threeDTextSizeVal');
                if (lbl) lbl.textContent = val + 'px';
                recreateContentMeshes();
                requestRender();
            });
        }

        const textDpSlider = panel.querySelector('#threeDTextDepthSlider');
        if (textDpSlider) {
            textDpSlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                state.text3DDepth = val;
                const el = getActiveElement();
                if (el) el.text3DDepth = val;
                const lbl = panel.querySelector('#threeDTextDepthVal');
                if (lbl) lbl.textContent = val + 'px';
                recreateContentMeshes();
                requestRender();
            });
        }

        const textColPicker = panel.querySelector('#threeDTextColorPicker');
        if (textColPicker) {
            textColPicker.addEventListener('input', (e) => {
                const val = e.target.value;
                state.text3DColor = val;
                const el = getActiveElement();
                if (el) el.text3DColor = val;
                // Eğer yazı ve ikon ayrı değilse (birlikte modundaysa), ikon/rozet rengi de güncellensin
                if (state.text3DMode !== 'separate') {
                    state.frontColor = val;
                    if (el) el.frontColor = val;
                    const fc = panel.querySelector('#threeDFrontColor');
                    if (fc) fc.value = val;
                    const btc = panel.querySelector('#threeDBadgeTextColor');
                    if (btc) btc.value = val;
                }
                updateElementColorsFast(el);
            });
        }

        const textPitchSlider = panel.querySelector('#threeDTextPitchSlider');
        if (textPitchSlider) {
            textPitchSlider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                state.text3DPitch = val;
                const el = getActiveElement();
                if (el) el.text3DPitch = val;
                const lbl = panel.querySelector('#threeDTextPitchVal');
                if (lbl) lbl.textContent = val + '°';
                recreateContentMeshes();
                requestRender();
            });
        }

        const textYawSlider = panel.querySelector('#threeDTextYawSlider');
        if (textYawSlider) {
            textYawSlider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                state.text3DYaw = val;
                const el = getActiveElement();
                if (el) el.text3DYaw = val;
                const lbl = panel.querySelector('#threeDTextYawVal');
                if (lbl) lbl.textContent = val + '°';
                recreateContentMeshes();
                requestRender();
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

        // Tutamaç Boyutu Slider
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

        // Eksen Mesafesi Slider
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

        // Corner Pin Butonu (kaldırıldı, geriye dönük güvenli kontrol)
        const pinToggleBtn = panel.querySelector('#threeDCornerPinToggleBtn');
        if (pinToggleBtn) {
            pinToggleBtn.addEventListener('click', () => {
                toggleCornerPinMode();
            });
        }

        // 🌟 Ekrana Ortala ve Varsayılana Döndür Butonları
        const panelCenterBtn = panel.querySelector('#threeDPanelCenterBtn');
        if (panelCenterBtn) {
            panelCenterBtn.addEventListener('click', centerOnScreen);
        }
        const panelResetBtn = panel.querySelector('#threeDPanelResetBtn');
        if (panelResetBtn) {
            panelResetBtn.addEventListener('click', resetToDefaults);
        }

        // 🌟 Başlıkta Belirtilen 3D Öge İsmi / Metni Doğrudan Düzenleme Dinleyicisi
        const headerTextInput = panel.querySelector('#threeDHeaderTextInput');
        if (headerTextInput) {
            headerTextInput.addEventListener('input', (e) => {
                const val = e.target.value;
                state.text = val;
                const el = getActiveElement();
                if (el) {
                    el.text = val;
                    if (val.trim()) el.name = val;
                    // Eğer ögenin SVG içeriğinde <text> yoksa (villa, bina, çit, ağaç vb.)
                    // metin girildiğinde 3D metin modunu otomatik aç, silindiğinde kapat:
                    const hasSvgText = !!(el.sourceSvg && el.sourceSvg.includes('<text'));
                    if (!hasSvgText && el.elementType === 'element_3d') {
                        el.show3DText = !!val.trim();
                        state.show3DText = el.show3DText;
                    }
                }
                const origText = panel.querySelector('#threeDTextInput');
                if (origText) origText.value = val;
                const bMain = panel.querySelector('#threeDBadgeMainText');
                if (bMain) bMain.value = val;
                const subMain = panel.querySelector('#threeDSubtextMainInput');
                if (subMain) subMain.value = val;

                recreateContentMeshes();
                updateElementSelectorUI();
                requestRender();
            });
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
        if (depthInput) {
            depthInput.addEventListener('input', (e) => {
                applyDepthChange(parseInt(e.target.value) || 16);
            });
        }

        const depthDecBtn = panel.querySelector('#threeDDepthDecBtn');
        if (depthDecBtn) {
            depthDecBtn.addEventListener('click', () => {
                applyDepthChange(Math.max(1, (parseInt(state.depth, 10) || 15) - 1));
            });
        }

        const depthIncBtn = panel.querySelector('#threeDDepthIncBtn');
        if (depthIncBtn) {
            depthIncBtn.addEventListener('click', () => {
                applyDepthChange(Math.min(80, (parseInt(state.depth, 10) || 15) + 1));
            });
        }

        const bevelCheck = panel.querySelector('#threeDBevelCheck');
        if (bevelCheck) {
            bevelCheck.addEventListener('change', (e) => {
                state.bevelEnabled = e.target.checked;
                const isGroupAll = (state.groupEditMode === 'all');
                const pair = getSurfacePair();
                if (isGroupAll && pair) {
                    pair.baseEl.bevelEnabled = state.bevelEnabled;
                    pair.childEl.bevelEnabled = state.bevelEnabled;
                    recreateContentMeshes(pair.baseEl);
                    recreateContentMeshes(pair.childEl);
                } else {
                    recreateContentMeshes();
                }
            });
        }

        // Düzlem Açısı
        const pitchInput = panel.querySelector('#threeDPitchInput');
        if (pitchInput) {
            pitchInput.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) || 0;
                const deltaPitch = val - (state.planePitch || 0);
                state.planePitch = val;
                const pValEl = panel.querySelector('#threeDPitchVal');
                if (pValEl) pValEl.textContent = state.planePitch + '°';
                const el = getActiveElement();
                if (el) {
                    el.planePitch = val;
                    if (el.isFence || el.isBaseAligned) {
                        el.itemPitch = val;
                    }
                }
                updatePlaneTransform();
                if (state.cornerPinActive) updateCornerPinHandlesFromScene();
                notifyExternalUpdates();
                requestRender();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateRotationDelta === 'function' && deltaPitch !== 0) {
                    window.ThreeDGrouping.propagateRotationDelta(getActiveElement(), 0, deltaPitch, 0, 'plane');
                }
            });
        }

        const yawInput = panel.querySelector('#threeDYawInput');
        if (yawInput) {
            yawInput.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) || 0;
                const deltaYaw = val - (state.planeYaw || 0);
                state.planeYaw = val;
                const yValEl = panel.querySelector('#threeDYawVal');
                if (yValEl) yValEl.textContent = state.planeYaw + '°';
                const el = getActiveElement();
                if (el) {
                    el.planeYaw = val;
                }
                updatePlaneTransform();
                if (state.cornerPinActive) updateCornerPinHandlesFromScene();
                notifyExternalUpdates();
                requestRender();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateRotationDelta === 'function' && deltaYaw !== 0) {
                    window.ThreeDGrouping.propagateRotationDelta(getActiveElement(), deltaYaw, 0, 0, 'plane');
                }
            });
        }

        const rollInput = panel.querySelector('#threeDRollInput');
        if (rollInput) {
            rollInput.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) || 0;
                const deltaRoll = val - (state.planeRoll || 0);
                state.planeRoll = val;
                const rValEl = panel.querySelector('#threeDRollVal');
                if (rValEl) rValEl.textContent = state.planeRoll + '°';
                const el = getActiveElement();
                if (el) {
                    el.planeRoll = val;
                }
                updatePlaneTransform();
                if (state.cornerPinActive) updateCornerPinHandlesFromScene();
                notifyExternalUpdates();
                requestRender();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateRotationDelta === 'function' && deltaRoll !== 0) {
                    window.ThreeDGrouping.propagateRotationDelta(getActiveElement(), 0, 0, deltaRoll, 'plane');
                }
            });
        }

        const scaleInput = panel.querySelector('#threeDScaleInput');
        if (scaleInput) {
            scaleInput.addEventListener('input', (e) => {
                const oldScale = state.planeScale || 1.0;
                state.planeScale = (parseFloat(e.target.value) || 100) / 100;
                const sc = Math.round(state.planeScale * 100);
                const sv = panel.querySelector('#threeDScaleVal');
                if (sv) sv.textContent = sc + '%';
                panel.querySelectorAll('.three-d-size-chip').forEach(c => {
                    c.classList.toggle('active', parseInt(c.getAttribute('data-scale'), 10) === sc);
                });
                updatePlaneTransform();
                if (state.cornerPinActive) updateCornerPinHandlesFromScene();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateScaleDelta === 'function') {
                    window.ThreeDGrouping.propagateScaleDelta(getActiveElement(), state.planeScale, oldScale);
                }
                notifyExternalUpdates();
                requestRender();
            });
        }

        const scaleDecBtn = panel.querySelector('#threeDScaleDecBtn');
        if (scaleDecBtn) {
            scaleDecBtn.addEventListener('click', () => {
                const oldScale = state.planeScale || 1.0;
                let cur = Math.round(state.planeScale * 100);
                cur = Math.max(20, cur - 5);
                state.planeScale = cur / 100;
                if (scaleInput) scaleInput.value = cur;
                const sv = panel.querySelector('#threeDScaleVal');
                if (sv) sv.textContent = cur + '%';
                panel.querySelectorAll('.three-d-size-chip').forEach(c => {
                    c.classList.toggle('active', parseInt(c.getAttribute('data-scale'), 10) === cur);
                });
                updatePlaneTransform();
                if (state.cornerPinActive) updateCornerPinHandlesFromScene();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateScaleDelta === 'function') {
                    window.ThreeDGrouping.propagateScaleDelta(getActiveElement(), state.planeScale, oldScale);
                }
                notifyExternalUpdates();
                requestRender();
            });
        }

        const scaleIncBtn = panel.querySelector('#threeDScaleIncBtn');
        if (scaleIncBtn) {
            scaleIncBtn.addEventListener('click', () => {
                const oldScale = state.planeScale || 1.0;
                let cur = Math.round(state.planeScale * 100);
                cur = Math.min(300, cur + 5);
                state.planeScale = cur / 100;
                if (scaleInput) scaleInput.value = cur;
                const sv = panel.querySelector('#threeDScaleVal');
                if (sv) sv.textContent = cur + '%';
                panel.querySelectorAll('.three-d-size-chip').forEach(c => {
                    c.classList.toggle('active', parseInt(c.getAttribute('data-scale'), 10) === cur);
                });
                updatePlaneTransform();
                if (state.cornerPinActive) updateCornerPinHandlesFromScene();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateScaleDelta === 'function') {
                    window.ThreeDGrouping.propagateScaleDelta(getActiveElement(), state.planeScale, oldScale);
                }
                notifyExternalUpdates();
                requestRender();
            });
        }

        panel.querySelectorAll('.three-d-size-chip:not(.three-d-height-chip)').forEach(chip => {
            chip.addEventListener('click', () => {
                const oldScale = state.planeScale || 1.0;
                const sc = parseInt(chip.getAttribute('data-scale'), 10) || 100;
                state.planeScale = sc / 100;
                if (scaleInput) scaleInput.value = sc;
                const sv = panel.querySelector('#threeDScaleVal');
                if (sv) sv.textContent = sc + '%';
                panel.querySelectorAll('.three-d-size-chip:not(.three-d-height-chip)').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                updatePlaneTransform();
                if (state.cornerPinActive) updateCornerPinHandlesFromScene();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateScaleDelta === 'function') {
                    window.ThreeDGrouping.propagateScaleDelta(getActiveElement(), state.planeScale, oldScale);
                }
                notifyExternalUpdates();
                requestRender();
            });
        });

        // Dikey Boy / Yükseklik (Tabandan Yukarı Uzatma)
        const applyHeightScaleChange = (val) => {
            const hVal = Math.max(30, Math.min(400, val));
            state.heightScale = hVal / 100;
            const hInput = panel.querySelector('#threeDHeightScaleInput');
            if (hInput) hInput.value = hVal;
            const hSpan = panel.querySelector('#threeDHeightScaleVal');
            if (hSpan) hSpan.textContent = hVal + '%';
            const el = getActiveElement();
            if (el) {
                el.heightScale = state.heightScale;
                updateContentTransform(el);
                if (state.groupEditMode === 'all') {
                    let sibs = [];
                    if (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function') {
                        const sel = window.ThreeDGrouping.getSelected3DElements();
                        if (sel.length > 1 && sel.some(m => m && m.id === el.id)) {
                            sibs = sel.filter(m => m && m.id !== el.id);
                        }
                    }
                    if (sibs.length === 0 && el.groupId) {
                        sibs = elements.filter(m => m && m.groupId === el.groupId && m.id !== el.id);
                    }
                    sibs.forEach(m => {
                        m.heightScale = state.heightScale;
                        updateContentTransform(m);
                    });
                }
            }
            notifyExternalUpdates();
            requestRender();
            if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                window.ThreeDGrouping.updateSelectionVisuals();
            }
        };

        const heightScaleInput = panel.querySelector('#threeDHeightScaleInput');
        if (heightScaleInput) {
            heightScaleInput.addEventListener('input', (e) => {
                applyHeightScaleChange(parseInt(e.target.value, 10) || 100);
            });
        }

        const heightScaleDecBtn = panel.querySelector('#threeDHeightScaleDecBtn');
        if (heightScaleDecBtn) {
            heightScaleDecBtn.addEventListener('click', () => {
                const cur = Math.round((state.heightScale || 1.0) * 100);
                applyHeightScaleChange(cur - 10);
            });
        }

        const heightScaleIncBtn = panel.querySelector('#threeDHeightScaleIncBtn');
        if (heightScaleIncBtn) {
            heightScaleIncBtn.addEventListener('click', () => {
                const cur = Math.round((state.heightScale || 1.0) * 100);
                applyHeightScaleChange(cur + 10);
            });
        }

        const gridCheck = panel.querySelector('#threeDGridCheck');
        if (gridCheck) {
            gridCheck.addEventListener('change', (e) => {
                state.showPlaneGrid = e.target.checked;
                if (gridHelper) gridHelper.visible = !!state.selected && state.showPlaneGrid;
                requestRender();
            });
        }

        // İnce Ayarlar: Düzlem İçi Dönüş & Yükseklik
        const localRotInput = panel.querySelector('#threeDLocalRotInput');
        if (localRotInput) {
            localRotInput.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) || 0;
                let deltaYaw = val - (state.planeLocalRot || 0);
                while (deltaYaw > 180) deltaYaw -= 360;
                while (deltaYaw < -180) deltaYaw += 360;
                state.planeLocalRot = val;
                const lValEl = panel.querySelector('#threeDLocalRotVal');
                if (lValEl) lValEl.textContent = (state.planeLocalRot > 0 ? '+' : '') + state.planeLocalRot + '°';
                const el = getActiveElement();
                if (el) {
                    el.planeLocalRot = val;
                }
                syncActiveElementFromState();
                updateContentTransform();
                updateGizmoPositions();
                notifyExternalUpdates();
                requestRender();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateRotationDelta === 'function' && deltaYaw !== 0) {
                    window.ThreeDGrouping.propagateRotationDelta(getActiveElement(), deltaYaw, 0, 0, 'item');
                }
            });
        }

        const elevInput = panel.querySelector('#threeDElevationInput');
        if (elevInput) {
            elevInput.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) || 0;
                const deltaElev = val - (state.planeElevation || 0);
                state.planeElevation = val;
                const eValEl = panel.querySelector('#threeDElevationVal');
                if (eValEl) eValEl.textContent = state.planeElevation + 'px';
                const el = getActiveElement();
                if (el) {
                    el.planeElevation = val;
                }
                syncActiveElementFromState();
                updateContentTransform();
                updateGizmoPositions();
                notifyExternalUpdates();
                requestRender();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateDragDelta === 'function' && deltaElev !== 0) {
                    window.ThreeDGrouping.propagateDragDelta(getActiveElement(), 0, 0, deltaElev);
                }
            });
        }

        // Presets
        panel.querySelectorAll('.three-d-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const p = btn.getAttribute('data-preset');
                if (p) applyPreset(p);
            });
        });

        // Modeli Merkezle & Tabana Oturt
        const autoCenterBtn = panel.querySelector('#threeDAutoCenterBtn');
        if (autoCenterBtn) {
            autoCenterBtn.addEventListener('click', () => {
                autoCenterActiveElement('center');
            });
        }
        const alignBaseBtn = panel.querySelector('#threeDAlignBaseBtn');
        if (alignBaseBtn) {
            alignBaseBtn.addEventListener('click', () => {
                autoCenterActiveElement('base');
            });
        }

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
        if (frontColor) {
            frontColor.addEventListener('input', (e) => {
                const val = e.target.value;
                state.frontColor = val;
                const el = getActiveElement();
                const isGroupAll = (state.groupEditMode === 'all');
                const pair = getSurfacePair();
                if (isGroupAll && pair) {
                    pair.baseEl.frontColor = val;
                    pair.baseEl._userHasChangedColor = true;
                    pair.childEl.frontColor = val;
                    pair.childEl._userHasChangedColor = true;
                    if (state.text3DMode !== 'separate') {
                        pair.childEl.text3DColor = val;
                        const tc = panel.querySelector('#threeDTextColorPicker');
                        if (tc) tc.value = val;
                    }
                    updateElementColorsFast(pair.baseEl, { onlyFront: true });
                    updateElementColorsFast(pair.childEl, { onlyFront: true });
                } else if (el) {
                    el.frontColor = val;
                    el._userHasChangedColor = true;
                    if (state.text3DMode !== 'separate') {
                        state.text3DColor = val;
                        el.text3DColor = val;
                        const tc = panel.querySelector('#threeDTextColorPicker');
                        if (tc) tc.value = val;
                    }
                    updateElementColorsFast(el, { onlyFront: true });
                }
            });
        }

        const plaketBgColor = panel.querySelector('#threeDPlaketBgColor');
        if (plaketBgColor) {
            plaketBgColor.addEventListener('input', (e) => {
                state.badgeBgColor = e.target.value;
                const el = getActiveElement();
                const isGroupAll = (state.groupEditMode === 'all');
                const pair = getSurfacePair();
                const target = (isGroupAll && pair) ? pair.baseEl : el;
                if (target) {
                    target.badgeBgColor = e.target.value;
                    target._userHasChangedColor = true;
                    const exBg = panel.querySelector('#threeDExactBadgeBgColor');
                    if (exBg) exBg.value = e.target.value;
                    updateElementColorsFast(target);
                }
            });
        }

        const sideColor = panel.querySelector('#threeDSideColor');
        if (sideColor) {
            sideColor.addEventListener('input', (e) => {
                const val = e.target.value;
                state.sideColor = val;
                const el = getActiveElement();
                const isGroupAll = (state.groupEditMode === 'all');
                const pair = getSurfacePair();
                if (isGroupAll && pair) {
                    pair.baseEl.sideColor = val;
                    pair.baseEl.badgeSideColor = val;
                    pair.childEl.sideColor = val;
                    pair.childEl.badgeSideColor = val;
                    updateElementColorsFast(pair.baseEl, { onlySide: true });
                    updateElementColorsFast(pair.childEl, { onlySide: true });
                } else if (el) {
                    el.sideColor = val;
                    el.badgeSideColor = val;
                    updateElementColorsFast(el, { onlySide: true });
                }
            });
        }

        panel.querySelectorAll('.three-d-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                if (chip.hasAttribute('data-neon')) return;
                const isReset = (chip.getAttribute('data-reset') === 'true');
                const el = getActiveElement();
                const isGroupAll = (state.groupEditMode === 'all');
                const pair = getSurfacePair();

                if (isReset) {
                    if (isGroupAll && pair) {
                        pair.baseEl._userHasChangedColor = false;
                        pair.baseEl.frontColor = pair.baseEl._originalFrontColor || '#ffffff';
                        pair.baseEl.sideColor = pair.baseEl._originalSideColor || '#334155';
                        pair.baseEl.badgeSideColor = pair.baseEl.sideColor;
                        pair.childEl._userHasChangedColor = false;
                        pair.childEl.frontColor = pair.childEl._originalFrontColor || '#ffffff';
                        pair.childEl.sideColor = pair.childEl._originalSideColor || '#334155';
                        pair.childEl.badgeSideColor = pair.childEl.sideColor;
                        state.frontColor = pair.baseEl.frontColor;
                        state.sideColor = pair.baseEl.sideColor;
                        if (frontColor) frontColor.value = safeHexColor(state.frontColor, '#ffffff');
                        if (sideColor) sideColor.value = safeHexColor(state.sideColor, '#334155');
                        updateElementColorsFast(pair.baseEl);
                        updateElementColorsFast(pair.childEl);
                    } else if (el) {
                        el._userHasChangedColor = false;
                        el.frontColor = el._originalFrontColor || '#ffffff';
                        el.sideColor = el._originalSideColor || '#334155';
                        el.badgeSideColor = el.sideColor;
                        state.frontColor = el.frontColor;
                        state.sideColor = el.sideColor;
                        if (frontColor) frontColor.value = safeHexColor(state.frontColor, '#ffffff');
                        if (sideColor) sideColor.value = safeHexColor(state.sideColor, '#334155');
                        updateElementColorsFast(el);
                    }
                    return;
                }

                state.frontColor = chip.getAttribute('data-front');
                state.sideColor = chip.getAttribute('data-side');
                if (frontColor) frontColor.value = state.frontColor;
                if (sideColor) sideColor.value = state.sideColor;
                if (isGroupAll && pair) {
                    pair.baseEl.frontColor = state.frontColor;
                    pair.baseEl.sideColor = state.sideColor;
                    pair.baseEl.badgeSideColor = state.sideColor;
                    pair.baseEl._userHasChangedColor = true;
                    pair.childEl.frontColor = state.frontColor;
                    pair.childEl.sideColor = state.sideColor;
                    pair.childEl.badgeSideColor = state.sideColor;
                    pair.childEl._userHasChangedColor = true;
                    if (state.text3DMode !== 'separate') {
                        pair.childEl.text3DColor = state.frontColor;
                        const tc = panel.querySelector('#threeDTextColorPicker');
                        if (tc) tc.value = state.frontColor;
                    }
                    updateElementColorsFast(pair.baseEl);
                    updateElementColorsFast(pair.childEl);
                } else if (el) {
                    el.frontColor = state.frontColor;
                    el.sideColor = state.sideColor;
                    el.badgeSideColor = state.sideColor;
                    el._userHasChangedColor = true;
                    if (state.text3DMode !== 'separate') {
                        state.text3DColor = state.frontColor;
                        el.text3DColor = state.frontColor;
                        const tc = panel.querySelector('#threeDTextColorPicker');
                        if (tc) tc.value = state.frontColor;
                    }
                    updateElementColorsFast(el);
                }
            });
        });

        // 🌟 3D Neon ve Parlama Olay Dinleyicileri
        const neonColorInput = panel.querySelector('#threeDNeonColor');
        if (neonColorInput) {
            neonColorInput.addEventListener('input', (e) => {
                const val = e.target.value;
                state.neonColor = val;
                const el = getActiveElement();
                if (el) {
                    el.neonColor = val;
                    updateNeonEffect(el);
                }
            });
        }

        panel.querySelectorAll('.three-d-chip[data-neon]').forEach(chip => {
            chip.addEventListener('click', () => {
                const nColor = chip.getAttribute('data-neon');
                if (!nColor) return;
                state.neonColor = nColor;
                const ncInput = panel.querySelector('#threeDNeonColor');
                if (ncInput) ncInput.value = nColor;
                const el = getActiveElement();
                if (el) {
                    el.neonColor = nColor;
                    updateNeonEffect(el);
                }
            });
        });

        // 🌟 Hazır Neon Efekti Preset Butonları
        panel.querySelectorAll('.neon-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const presetKey = btn.getAttribute('data-preset');
                if (!presetKey) return;
                state.neonPreset = presetKey;
                const el = getActiveElement();
                if (el) {
                    el.neonPreset = presetKey;
                    // Eğer parlaklık 0 ise, otomatik olarak 80% seviyesinde aç
                    const curInt = el.neonFrontIntensity !== undefined ? el.neonFrontIntensity : (state.neonFrontIntensity || 0);
                    if (curInt === 0) {
                        state.neonFrontIntensity = 80;
                        el.neonFrontIntensity = 80;
                        const frontIn = panel.querySelector('#threeDNeonFrontInput');
                        if (frontIn) frontIn.value = 80;
                        const frontValEl = panel.querySelector('#threeDNeonFrontVal');
                        if (frontValEl) frontValEl.textContent = '80%';
                    }
                    updateNeonEffect(el);
                }
                panel.querySelectorAll('.neon-preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                requestRender();
            });
        });

        const neonFrontInput = panel.querySelector('#threeDNeonFrontInput');
        if (neonFrontInput) {
            neonFrontInput.addEventListener('input', (e) => {
                const val = parseInt(e.target.value, 10) || 0;
                state.neonFrontIntensity = val;
                const valEl = panel.querySelector('#threeDNeonFrontVal');
                if (valEl) valEl.textContent = val + '%';
                const el = getActiveElement();
                if (el) {
                    el.neonFrontIntensity = val;
                    updateNeonEffect(el);
                }
            });
        }

        const neonEdgeInput = panel.querySelector('#threeDNeonEdgeInput');
        if (neonEdgeInput) {
            neonEdgeInput.addEventListener('input', (e) => {
                const val = parseInt(e.target.value, 10) || 0;
                state.neonEdgeIntensity = val;
                state.neonEdgeGlow = (val > 0);
                const valEl = panel.querySelector('#threeDNeonEdgeVal');
                if (valEl) valEl.textContent = val + '%';
                const el = getActiveElement();
                if (el) {
                    el.neonEdgeIntensity = val;
                    el.neonEdgeGlow = (val > 0);
                    updateNeonEffect(el);
                }
            });
        }

        const gradCheck = panel.querySelector('#threeDGradientCheck');
        if (gradCheck) {
            gradCheck.addEventListener('change', (e) => {
                const val = !!e.target.checked;
                state.useGradient = val;
                const el = getActiveElement();
                const isGroupAll = (state.groupEditMode === 'all');
                const pair = getSurfacePair();
                if (isGroupAll && pair) {
                    pair.baseEl.useGradient = val;
                    pair.childEl.useGradient = val;
                    updateElementColorsFast(pair.baseEl);
                    updateElementColorsFast(pair.childEl);
                } else if (el) {
                    el.useGradient = val;
                    updateElementColorsFast(el);
                }
                requestRender();
            });
        }

        // ☀️ 3D Güneş & Oda Işığı Dinleyicileri
        const presetRight = panel.querySelector('#threeDSunPresetRight');
        if (presetRight) {
            presetRight.addEventListener('click', () => {
                state.sunPosX = 350;
                state.sunPosY = 600;
                state.sunPosZ = 450;
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
                state.sunPosX = -350;
                state.sunPosY = 600;
                state.sunPosZ = 450;
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
                state.sunPosY = 750;
                state.sunPosZ = 450;
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
                state.sunPosY = 450;
                state.sunPosZ = 650;
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

        const toggleAdvSunBtn = panel.querySelector('#threeDToggleAdvSunBtn');
        const advSunBox = panel.querySelector('#threeDAdvSunBox');
        if (toggleAdvSunBtn && advSunBox) {
            toggleAdvSunBtn.addEventListener('click', () => {
                const isOpen = advSunBox.style.display !== 'none';
                advSunBox.style.display = isOpen ? 'none' : 'block';
                toggleAdvSunBtn.classList.toggle('active', !isOpen);
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
                state.shadowOpacity = (parseFloat(e.target.value) || 20) / 100;
                panel.querySelector('#threeDShadowVal').textContent = Math.round(state.shadowOpacity * 100) + '%';
                updatePlaneTransform();
                notifyExternalUpdates();
                requestRender();
            });
        }

        const shadowSoft = panel.querySelector('#threeDShadowSoftness');
        if (shadowSoft) {
            shadowSoft.addEventListener('input', (e) => {
                state.shadowSoftness = parseFloat(e.target.value) || 2.5;
                panel.querySelector('#threeDShadowSoftVal').textContent = state.shadowSoftness + 'x';
                syncActiveElementFromState();
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
                update3DLayersOrder();
                if (window.showToast) window.showToast('Yeni 3D öge tuvale eklendi', 'success');
            });
        }
        const dupBtn = panel.querySelector('#threeDDuplicateElementBtn');
        if (dupBtn) {
            dupBtn.addEventListener('click', () => {
                const act = getActiveElement();
                if (act) {
                    duplicate3DElement(act);
                }
            });
        }
        const delBtn = panel.querySelector('#threeDDeleteElementBtn');
        if (delBtn) {
            delBtn.addEventListener('click', () => {
                delete3DElement();
            });
        }
        const layerUpBtn = panel.querySelector('#threeDLayerUpBtn');
        if (layerUpBtn) {
            layerUpBtn.addEventListener('click', () => {
                bring3DElementForward();
            });
        }
        const layerDownBtn = panel.querySelector('#threeDLayerDownBtn');
        if (layerDownBtn) {
            layerDownBtn.addEventListener('click', () => {
                send3DElementBackward();
            });
        }

        // 🌟 Grup & Yüzey Kontrolleri Dinleyicileri
        const ungroupBtn = panel.querySelector('#threeDUngroupBtn');
        if (ungroupBtn) {
            ungroupBtn.addEventListener('click', () => {
                const activeEl = getActiveElement();
                if (activeEl && activeEl.groupId && window.ThreeDGrouping) {
                    window.ThreeDGrouping.ungroupElements(activeEl.groupId);
                    updateElementSelectorUI();
                    requestRender();
                }
            });
        }

        const editAllBtn = panel.querySelector('#threeDGroupEditAllBtn');
        if (editAllBtn) {
            editAllBtn.addEventListener('click', () => {
                state.groupEditMode = 'all';
                const pair = getSurfacePair();
                if (pair) {
                    setActiveElement(pair.baseEl.id);
                }
                syncControlsUI();
                updateElementSelectorUI();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                    window.ThreeDGrouping.updateSelectionVisuals();
                }
                requestRender();
            });
        }


        const swapBtn = panel.querySelector('#threeDQuickSwapBtn');
        if (swapBtn) {
            swapBtn.addEventListener('click', () => {
                const pair = getSurfacePair();
                if (pair && window.ThreeDAlign) {
                    window.ThreeDAlign.swapSurfaceRoles(pair.baseEl, pair.childEl);
                    syncControlsUI();
                    updateElementSelectorUI();
                    requestRender();
                }
            });
        }

        const offsetInput = panel.querySelector('#threeDSurfaceOffsetInput');
        const offsetValLbl = panel.querySelector('#threeDSurfaceOffsetVal');
        if (offsetInput) {
            offsetInput.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                if (offsetValLbl) {
                    offsetValLbl.textContent = (val > 0 ? '+' : '') + val + 'px';
                }
                const pair = getSurfacePair();
                if (pair && window.ThreeDAlign) {
                    window.ThreeDAlign.setSurfaceOffset(pair.childEl, pair.baseEl, val);
                    requestRender();
                }
            });
        }

        const applyQuickOffset = (val) => {
            if (offsetInput) offsetInput.value = val;
            if (offsetValLbl) offsetValLbl.textContent = (val > 0 ? '+' : '') + val + 'px';
            const pair = getSurfacePair();
            if (pair && window.ThreeDAlign) {
                window.ThreeDAlign.setSurfaceOffset(pair.childEl, pair.baseEl, val);
                requestRender();
            }
        };

        const quickOutBtn = panel.querySelector('#threeDQuickOutBtn');
        if (quickOutBtn) quickOutBtn.addEventListener('click', () => applyQuickOffset(15));

        const quickFlushBtn = panel.querySelector('#threeDQuickFlushBtn');
        if (quickFlushBtn) quickFlushBtn.addEventListener('click', () => applyQuickOffset(0));

        const quickInBtn = panel.querySelector('#threeDQuickInBtn');
        if (quickInBtn) quickInBtn.addEventListener('click', () => applyQuickOffset(-15));

        const quickBackBtn = panel.querySelector('#threeDQuickBackBtn');
        if (quickBackBtn) quickBackBtn.addEventListener('click', () => applyQuickOffset(-50));

        // Yüzey Üzerinde Dikey & Yatay Konumlandırma Dinleyicileri
        const vertInput = panel.querySelector('#threeDSurfaceVertOffsetInput');
        const vertValLbl = panel.querySelector('#threeDSurfaceVertOffsetVal');
        if (vertInput) {
            vertInput.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) || 0;
                if (vertValLbl) vertValLbl.textContent = (val > 0 ? '+' : '') + val + 'px';
                const pair = getSurfacePair();
                if (pair && window.ThreeDAlign) {
                    window.ThreeDAlign.setSurfaceLocalOffsets(pair.childEl, pair.baseEl, pair.childEl.surfaceLocalX, val);
                    requestRender();
                }
            });
        }

        const horizInput = panel.querySelector('#threeDSurfaceHorizOffsetInput');
        const horizValLbl = panel.querySelector('#threeDSurfaceHorizOffsetVal');
        if (horizInput) {
            horizInput.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) || 0;
                if (horizValLbl) horizValLbl.textContent = (val > 0 ? '+' : '') + val + 'px';
                const pair = getSurfacePair();
                if (pair && window.ThreeDAlign) {
                    window.ThreeDAlign.setSurfaceLocalOffsets(pair.childEl, pair.baseEl, val, pair.childEl.surfaceLocalZ);
                    requestRender();
                }
            });
        }

        const angleInput = panel.querySelector('#threeDSurfaceAngleInput');
        const angleValLbl = panel.querySelector('#threeDSurfaceAngleVal');
        if (angleInput) {
            angleInput.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) || 0;
                if (angleValLbl) angleValLbl.textContent = (val > 0 ? '+' : '') + val + '°';
                const pair = getSurfacePair();
                if (pair && pair.childEl) {
                    if (window.ThreeDAlign && typeof window.ThreeDAlign.setSurfaceAngle === 'function') {
                        window.ThreeDAlign.setSurfaceAngle(pair.childEl, pair.baseEl, val);
                    } else {
                        pair.childEl.surfaceAngle = val;
                        updateContentTransform(pair.childEl);
                        requestRender();
                    }
                }
            });
        }

        const centerBtn = panel.querySelector('#threeDSurfaceCenterBtn');
        if (centerBtn) {
            centerBtn.addEventListener('click', () => {
                if (vertInput) vertInput.value = 0;
                if (vertValLbl) vertValLbl.textContent = '0px';
                if (horizInput) horizInput.value = 0;
                if (horizValLbl) horizValLbl.textContent = '0px';
                if (offsetInput) offsetInput.value = 2.5;
                if (offsetValLbl) offsetValLbl.textContent = '+2.5px';
                if (angleInput) angleInput.value = 0;
                if (angleValLbl) angleValLbl.textContent = '0°';
                const pair = getSurfacePair();
                if (pair) {
                    if (window.ThreeDAlign) {
                        window.ThreeDAlign.setSurfaceLocalOffsets(pair.childEl, pair.baseEl, 0, 0);
                        window.ThreeDAlign.setSurfaceOffset(pair.childEl, pair.baseEl, 2.5);
                        if (typeof window.ThreeDAlign.setSurfaceAngle === 'function') {
                            window.ThreeDAlign.setSurfaceAngle(pair.childEl, pair.baseEl, 0);
                        }
                    }
                    if (pair.childEl) {
                        pair.childEl.surfaceAngle = 0;
                        pair.childEl.surfaceOffset = 2.5;
                        updateContentTransform(pair.childEl);
                    }
                    requestRender();
                }
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
        if (sel) {
            sel.innerHTML = '';
            elements.forEach((el, idx) => {
                const opt = document.createElement('option');
                opt.value = el.id;
                opt.textContent = (idx + 1) + '. ' + (el.text || el.sourceItemName || el.name || '3D Öge') + (el.visible === false ? ' (Gizli)' : '');
                if (el.id === activeElementId) {
                    opt.selected = true;
                }
                sel.appendChild(opt);
            });
        }

        const headerTextInput = document.getElementById('threeDHeaderTextInput');
        if (headerTextInput && document.activeElement !== headerTextInput) {
            const el = getActiveElement();
            if (el) {
                const displayName = el.sourceItemName || el.name || '3D Öge';
                headerTextInput.placeholder = (el.elementType === 'element_3d' && !el.text) ? ('Metin Ekle: ' + displayName) : '3D Öge Metni Girin...';
                headerTextInput.value = el.text || (el.elementType === 'text' ? displayName : '');
            }
        }

        // 🌟 Grup & Yüzey Kontrolleri Paneli Güncelleme
        const groupSec = document.getElementById('threeDGroupControlsSection');
        if (groupSec) {
            const activeEl = getActiveElement();
            const hasGroupOrAttach = activeEl && (activeEl.groupId || activeEl.attachedTo || elements.some(e => e.attachedTo === activeEl.id));
            if (hasGroupOrAttach) {
                let groupMembers = [];
                if (activeEl.groupId) {
                    groupMembers = elements.filter(e => e.groupId === activeEl.groupId);
                }
                if (groupMembers.length <= 1) {
                    if (activeEl.attachedTo) {
                        const base = elements.find(e => e.id === activeEl.attachedTo);
                        groupMembers = base ? [base, activeEl] : [activeEl];
                    } else {
                        const children = elements.filter(e => e.attachedTo === activeEl.id);
                        groupMembers = [activeEl, ...children];
                    }
                }
                if (groupMembers.length > 1) {
                    groupSec.style.display = 'block';

                    // Zemin ve Ön Yüz alt butonları
                    const listEl = document.getElementById('threeDGroupMembersList');
                    const badgeEl = document.getElementById('threeDActiveMemberBadge');
                    const editAllBtn = document.getElementById('threeDGroupEditAllBtn');
                    const isAllMode = (state.groupEditMode === 'all');

                    if (editAllBtn) {
                        editAllBtn.classList.toggle('active', isAllMode);
                    }

                    if (listEl) {
                        listEl.innerHTML = '';
                        let baseEl = groupMembers.find(e => e.isSurfaceBase || e.elementType !== 'text');
                        if (!baseEl) baseEl = groupMembers[0];
                        let childEl = groupMembers.find(e => e !== baseEl) || groupMembers[1];

                        if (badgeEl) {
                            if (isAllMode) {
                                badgeEl.textContent = 'Tüm Grup Seçili';
                            } else {
                                const isActBase = (activeElementId === baseEl.id);
                                badgeEl.textContent = isActBase ? 'Zemin Seçili' : 'Ön Yüz Seçili';
                            }
                        }

                        groupMembers.forEach(mem => {
                            const isBase = (mem === baseEl);
                            const isActive = !isAllMode && (mem.id === activeElementId);
                            const btn = document.createElement('button');
                            btn.type = 'button';
                            btn.className = 'three-d-btn-group-action' + (isActive ? ' active' : '');
                            btn.style.flex = '1';
                            btn.style.fontSize = '10.5px';
                            btn.style.padding = '5px 6px';
                            btn.style.justifyContent = 'center';
                            btn.style.alignItems = 'center';
                            btn.style.gap = '5px';
                            btn.style.textOverflow = 'ellipsis';
                            btn.style.overflow = 'hidden';
                            btn.style.whiteSpace = 'nowrap';
                            const iconHtml = isBase 
                                ? '<i class="fa-solid fa-layer-group"></i> ' 
                                : ((mem.elementType === 'text') ? '<i class="fa-solid fa-font"></i> ' : '<i class="fa-solid fa-shapes"></i> ');
                            const roleTag = isBase ? 'Zemin: ' : 'Ön Yüz: ';
                            const nameText = mem.text || mem.sourceItemName || mem.name || (isBase ? 'Şekil' : 'Metin');
                            btn.innerHTML = iconHtml + roleTag + nameText;
                            btn.title = (isBase ? 'Zemin Ögesi' : 'Ön Yüz Ögesi') + ' - Sadece bu ögeyi düzenlemek için seçin';
                            btn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                state.groupEditMode = isBase ? 'base' : 'child';
                                setActiveElement(mem.id);
                                syncControlsUI();
                                updateElementSelectorUI();
                                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                                    window.ThreeDGrouping.updateSelectionVisuals();
                                }
                                requestRender();
                            });
                            listEl.appendChild(btn);
                        });
                    }

                    // Yüzey mesafesi (derinlik) slider ve etiketi
                    let childEl = groupMembers.find(e => !e.isSurfaceBase) || groupMembers[1] || activeEl;
                    const offsetVal = (typeof childEl.surfaceOffset === 'number') ? childEl.surfaceOffset : 2.5;
                    const slider = document.getElementById('threeDSurfaceOffsetInput');
                    const valLbl = document.getElementById('threeDSurfaceOffsetVal');
                    if (slider && document.activeElement !== slider) {
                        slider.value = offsetVal;
                    }
                    if (valLbl) {
                        valLbl.textContent = (offsetVal > 0 ? '+' : '') + offsetVal + 'px';
                    }

                    // Yüzey dikey, yatay ve açı slider ve etiketleri
                    const vertInput = document.getElementById('threeDSurfaceVertOffsetInput');
                    const vertValLbl = document.getElementById('threeDSurfaceVertOffsetVal');
                    const horizInput = document.getElementById('threeDSurfaceHorizOffsetInput');
                    const horizValLbl = document.getElementById('threeDSurfaceHorizOffsetVal');
                    const angleInput = document.getElementById('threeDSurfaceAngleInput');
                    const angleValLbl = document.getElementById('threeDSurfaceAngleVal');
                    const curVert = (typeof childEl.surfaceLocalZ === 'number') ? childEl.surfaceLocalZ : 0;
                    const curHoriz = (typeof childEl.surfaceLocalX === 'number') ? childEl.surfaceLocalX : 0;
                    const curAngle = (typeof childEl.surfaceAngle === 'number') ? childEl.surfaceAngle : 0;
                    if (vertInput && document.activeElement !== vertInput) vertInput.value = curVert;
                    if (vertValLbl) vertValLbl.textContent = (curVert > 0 ? '+' : '') + curVert + 'px';
                    if (horizInput && document.activeElement !== horizInput) horizInput.value = curHoriz;
                    if (horizValLbl) horizValLbl.textContent = (curHoriz > 0 ? '+' : '') + curHoriz + 'px';
                    if (angleInput && document.activeElement !== angleInput) angleInput.value = curAngle;
                    if (angleValLbl) angleValLbl.textContent = (curAngle > 0 ? '+' : '') + curAngle + '°';
                } else {
                    groupSec.style.display = 'none';
                }
            } else {
                groupSec.style.display = 'none';
            }
        }
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
            e.stopPropagation();
        });

        handle.addEventListener('pointermove', (e) => {
            if (!isDown) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.hypot(dx, dy) > 2) {
                el._hasBeenManuallyDragged = true;
            }
            const currentTop = Math.max(10, Math.min(window.innerHeight - el.offsetHeight - 14, initialTop + dy));
            el.style.left = Math.max(10, Math.min(window.innerWidth - el.offsetWidth - 10, initialLeft + dx)) + 'px';
            el.style.top = currentTop + 'px';
            el.style.maxHeight = Math.max(200, window.innerHeight - currentTop - 14) + 'px';
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
    async function openStudio(skipAutoConvert = false, createDefaultIfEmpty = true, showPanel = true) {
        const panel = ensureStudioPanel();
        if (showPanel) {
            panel.style.display = 'flex';
            positionStudioPanelOverLeftPanel(panel);
        } else {
            panel.style.display = 'none';
        }
        state.active = true;
        state.hasBaked = false;
        if (typeof window.selectedCalloutEl !== 'undefined') window.selectedCalloutEl = null;
        if (typeof window.selectedEl !== 'undefined') window.selectedEl = null;
        if (Array.isArray(window.selectedElements)) window.selectedElements = [];

        if (!state.loaded) {
            const statusEl = panel.querySelector('#threeDLoadingStatus');
            if (statusEl && showPanel) statusEl.style.display = 'block';

            try {
                await loadThreeLibraries((msg) => {
                    if (statusEl && showPanel) statusEl.textContent = msg;
                });
                if (statusEl) statusEl.style.display = 'none';
            } catch (err) {
                if (statusEl && showPanel) statusEl.textContent = 'Hata: ' + err.message;
                console.error(err);
                return;
            }
        }

        initScene({ createDefault: createDefaultIfEmpty });
        setSelected(true, { silent: true, autoLockPhoto: false, openPanel: showPanel });
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

    function showStudioPanel() {
        const panel = ensureStudioPanel();
        if (panel) {
            panel.style.display = 'flex';
            positionStudioPanelOverLeftPanel(panel);
            syncControlsUI();
            notifyExternalUpdates();
        }
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
            if (sunRayLine) sunRayLine.visible = false;

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
        const el = getActiveElement();
        state.posX = 0;
        state.posY = 0;
        state.posZ = 0;
        state.planeElevation = 0;
        state.planeLocalRot = 0;

        if (el) {
            el.posX = 0;
            el.posY = 0;
            el.posZ = 0;
            el.planeElevation = 0;
            el.planeLocalRot = 0;
        }

        updatePlaneTransform();
        updateContentTransform();
        if (cornerPinOverlayEl && state.cornerPinActive) updateCornerPinOverlay();
        if (gizmoOverlayEl) updateGizmoPositions();
        syncControlsUI();
        requestRender();
        notifyExternalUpdates();
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
        state.itemPitch = 0;
        state.itemRoll = 0;
        state.planeScale = 1.0;

        // 2. Açıları varsayılan olarak kullanıcıya karşı tam düz getir
        state.orientation = 'flat';
        state.planePitch = 0;
        state.planeYaw = 0;
        state.planeRoll = 0;

        // 3. Geometri kalınlık ve pahı sıfırla
        state.depth = 16;
        state.bevelEnabled = true;
        state.bevelThickness = 2;
        state.bevelSize = 1.5;

        // 4. Işıklandırmayı varsayılana getir
        state.sunPosX = 280;
        state.sunPosY = 600;
        state.sunPosZ = 450;
        state.lightIntensity = 1.2;
        state.shadowOpacity = 0.20;
        state.shadowSoftness = 2.5;

        // 5. Tutamaçları ve modları güncelle (Varsayılan: Serbest Taşıma)
        state.cornerPinActive = false;
        state.gizmoActive = false;
        state.selected = true;

        cornerPins[0] = { x: 0, y: 0 };
        if (cornerPinOverlayEl) cornerPinOverlayEl.style.display = 'none';
        if (gizmoOverlayEl) {
            gizmoOverlayEl.style.display = 'none';
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
     * Sürükleme ve akıcı hareket anında 300ms gecikmeli, bırakma (pointerup) veya doğrudan çağrılarda anında çalışır.
     */
    let notifyExternalDebounceTimer = null;
    function notifyExternalUpdates(immediate = false) {
        if (immediate) {
            if (notifyExternalDebounceTimer) {
                clearTimeout(notifyExternalDebounceTimer);
                notifyExternalDebounceTimer = null;
            }
            if (typeof window.renderLayers === 'function') {
                window.renderLayers();
            }
            if (typeof window.triggerAutoSave === 'function') {
                window.triggerAutoSave();
            }
            return;
        }
        if (notifyExternalDebounceTimer) return;
        notifyExternalDebounceTimer = setTimeout(() => {
            notifyExternalDebounceTimer = null;
            if (typeof window.renderLayers === 'function') {
                window.renderLayers();
            }
            if (typeof window.triggerAutoSave === 'function') {
                window.triggerAutoSave();
            }
        }, 300);
    }

    /**
     * 17. 💾 Proje Kaydetme & Geri Yükleme API'si (Faz 3)
     */
    function getDataToSave() {
        if (!state.active && !canvasEl && elements.length === 0) return null;
        if (activeElementId) {
            syncActiveElementFromState();
        }
        const studioPanel = document.getElementById('threeDStudioPanel');
        const studioOpen = !!(studioPanel && studioPanel.style.display !== 'none');

        const serializeElement = (el) => ({
            id: el.id,
            name: el.name,
            visible: el.visible !== false,
            elementType: el.elementType,
            text: el.text,
            textSize: el.textSize,
            depth: el.depth,
            bevelEnabled: el.bevelEnabled,
            bevelThickness: el.bevelThickness,
            bevelSize: el.bevelSize,
            frontColor: el.frontColor,
            sideColor: el.sideColor,
            neonFrontIntensity: el.neonFrontIntensity,
            neonEdgeGlow: el.neonEdgeGlow,
            neonEdgeIntensity: el.neonEdgeIntensity,
            neonColor: el.neonColor,
            neonPreset: el.neonPreset || 'fully-lit',
            roughness: el.roughness,
            metalness: el.metalness,
            orientation: el.orientation,
            planePitch: el.planePitch,
            planeYaw: el.planeYaw,
            planeRoll: el.planeRoll,
            planeElevation: el.planeElevation,
            planeLocalRot: el.planeLocalRot || 0,
            itemPitch: el.itemPitch || 0,
            itemRoll: el.itemRoll || 0,
            planeScale: el.planeScale,
            shadowOpacity: el.shadowOpacity,
            shadowSoftness: el.shadowSoftness,
            posX: el.posX,
            posY: el.posY,
            posZ: el.posZ,
            badgeBgColor: el.badgeBgColor,
            badgeSubtext: el.badgeSubtext,
            selectedIconId: el.selectedIconId,
            customIconSvg: el.customIconSvg,
            sourceSvg: el.sourceSvg,
            sourceSvgOriginal: el.sourceSvgOriginal || el.sourceSvg || null,
            sourceItemName: el.sourceItemName,
            shapeMode: el.shapeMode,
            cachedSilhouette: el.cachedSilhouette,
            isExactSilhouette: el.isExactSilhouette,
            isRound: !!el.isRound,
            isAutoDefault: !!el.isAutoDefault,
            layerIndex: (typeof el.layerIndex === 'number') ? el.layerIndex : elements.indexOf(el),
            show3DText: el.show3DText,
            text3DOffset: el.text3DOffset,
            text3DXOffset: el.text3DXOffset,
            text3DSize: el.text3DSize,
            text3DDepth: el.text3DDepth,
            text3DColor: el.text3DColor,
            text3DMode: el.text3DMode,
            text3DPitch: el.text3DPitch,
            text3DYaw: el.text3DYaw,
            text3DRoll: el.text3DRoll,
            groupId: el.groupId || null,
            surfaceOffset: (typeof el.surfaceOffset === 'number') ? el.surfaceOffset : 2.5,
            attachedTo: el.attachedTo || null,
            isSurfaceBase: !!el.isSurfaceBase,
            badgeElementMode: el.badgeElementMode,
            embossDepth: el.embossDepth,
            embossScale: el.embossScale,
            embossOffsetY: el.embossOffsetY,
            embossOffsetX: el.embossOffsetX,
            badgeSideColor: el.badgeSideColor
        });

        return {
            active: !!state.active,
            studioOpen: studioOpen,
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
            planeLocalRot: state.planeLocalRot || 0,
            itemPitch: state.itemPitch || 0,
            itemRoll: state.itemRoll || 0,
            planeScale: state.planeScale,
            showPlaneGrid: state.showPlaneGrid,
            lightAngle: state.lightAngle,
            lightIntensity: state.lightIntensity,
            shadowOpacity: state.shadowOpacity,
            shadowSoftness: state.shadowSoftness,
            sunPosX: state.sunPosX !== undefined ? state.sunPosX : 280,
            sunPosY: state.sunPosY !== undefined ? state.sunPosY : 600,
            sunPosZ: state.sunPosZ !== undefined ? state.sunPosZ : 450,
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
            badgeSideColor: state.badgeSideColor,
            badgeElementMode: state.badgeElementMode,
            embossDepth: state.embossDepth,
            embossScale: state.embossScale,
            embossOffsetY: state.embossOffsetY,
            embossOffsetX: state.embossOffsetX,
            badgeSubtext: state.badgeSubtext,
            selectedIconId: state.selectedIconId,
            customIconSvg: state.customIconSvg,
            sourceSvg: state.sourceSvg,
            sourceItemName: state.sourceItemName,
            shapeMode: state.shapeMode,
            cachedSilhouette: state.cachedSilhouette,
            isExactSilhouette: state.isExactSilhouette,
            show3DText: state.show3DText,
            text3DOffset: state.text3DOffset,
            text3DXOffset: state.text3DXOffset,
            text3DSize: state.text3DSize,
            text3DDepth: state.text3DDepth,
            text3DColor: state.text3DColor,
            text3DMode: state.text3DMode,
            text3DPitch: state.text3DPitch,
            text3DYaw: state.text3DYaw,
            text3DRoll: state.text3DRoll,
            activeElementId: activeElementId,
            elementsData: elements.map(el => serializeElement(el))
        };
    }

    async function restoreData(data) {
        if (!data) return;
        Object.assign(state, data);
        if (data.itemPitch !== undefined) state.itemPitch = data.itemPitch;
        if (data.itemRoll !== undefined) state.itemRoll = data.itemRoll;
        if (data.planeLocalRot !== undefined) state.planeLocalRot = data.planeLocalRot;
        if (data.badgeBgColor) state.badgeBgColor = data.badgeBgColor;
        if (data.badgeSideColor !== undefined) state.badgeSideColor = data.badgeSideColor;
        if (data.badgeElementMode !== undefined) state.badgeElementMode = data.badgeElementMode;
        if (data.embossDepth !== undefined) state.embossDepth = data.embossDepth;
        if (data.embossScale !== undefined) state.embossScale = data.embossScale;
        if (data.embossOffsetY !== undefined) state.embossOffsetY = data.embossOffsetY;
        if (data.embossOffsetX !== undefined) state.embossOffsetX = data.embossOffsetX;
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

        const shouldBeActive = data.active || data.visible || (data.elementsData && data.elementsData.length > 0);
        if (shouldBeActive) {
            await openStudio(true, false, false);

            if (data.elementsData && Array.isArray(data.elementsData) && data.elementsData.length > 0) {
                isBatchRestoring = true;
                // Sahnedeki eski ögeleri temizle
                elements.forEach(el => {
                    if (el.planeGroup && scene) scene.remove(el.planeGroup);
                });
                elements.length = 0;
                activeElementId = null;

                // Tüm kayıtlı 3D ögeleri sırayla oluştur ve dönüştür
                data.elementsData.forEach(elData => {
                    const restoredEl = createDefaultElement(elData);
                    Object.assign(restoredEl, elData);
                    initElementThreeObjects(restoredEl);
                    elements.push(restoredEl);
                    recreateContentMeshes(restoredEl);
                    updatePlaneTransform(restoredEl);
                    updateContentTransform(restoredEl);
                });

                isBatchRestoring = false;

                const actId = data.activeElementId || (elements[elements.length - 1] && elements[elements.length - 1].id);
                if (actId) {
                    setActiveElement(actId);
                }
            }

            updateLighting();
            updatePlaneTransform();
            update3DLayersOrder();
            updateElementSelectorUI();
            syncControlsUI();
            requestRender();

            if (data.visible === false) {
                toggleVisibility(false);
            }
            if (!data.studioOpen) {
                closeStudio();
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
                    state.sourceSvg = item.svg || null;
                    const el = getActiveElement();
                    if (el) {
                        el.selectedIconId = item.id;
                        el.sourceSvg = item.svg || null;
                        el.cachedSilhouette = null;
                    }
                    recreateContentMeshes();
                    syncControlsUI();
                    closeIconPicker();
                    requestRender();
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
     * Güvenli Hex Renk Çözücü (#rrggbb)
     */
    function safeHexColor(colorStr, fallback = '#ffffff') {
        if (!colorStr || colorStr === 'none' || colorStr === 'currentColor' || colorStr === 'inherit' || colorStr === 'transparent') return fallback;
        try {
            if (typeof THREE !== 'undefined' && THREE.Color) {
                const c = new THREE.Color(colorStr);
                return '#' + c.getHexString();
            }
        } catch(e) {}
        if (typeof colorStr === 'string' && colorStr.startsWith('#')) return colorStr;
        return fallback;
    }

    /**
     * Otomatik 3D Yan Kalınlık / Gölge Rengi Oluşturucu
     */
    function autoGenerateSideColor(colorStr) {
        if (!colorStr || colorStr === 'none' || colorStr === 'currentColor' || colorStr === 'transparent') return '#1e293b';
        try {
            if (typeof THREE !== 'undefined' && THREE.Color) {
                const c = new THREE.Color(colorStr);
                const lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
                if (lum < 0.14) {
                    return '#334155'; // Slate Steel - çok koyu tonlarda zifiri karanlık yerine net 3D hacim
                }
                c.multiplyScalar(0.62); // %38 daha koyu zengin 3D yan kalınlık gölgesi
                return '#' + c.getHexString();
            }
        } catch(e){}

        if (typeof colorStr === 'string' && colorStr.startsWith('#')) {
            let hex = colorStr.replace('#', '');
            if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
            if (hex.length === 6) {
                const r0 = parseInt(hex.substr(0, 2), 16);
                const g0 = parseInt(hex.substr(2, 2), 16);
                const b0 = parseInt(hex.substr(4, 2), 16);
                const lum = (0.2126 * r0 + 0.7152 * g0 + 0.0722 * b0) / 255;
                if (lum < 0.14) {
                    return '#334155';
                }
                const r = Math.max(0, Math.floor(r0 * 0.62));
                const g = Math.max(0, Math.floor(g0 * 0.62));
                const b = Math.max(0, Math.floor(b0 * 0.62));
                return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
            }
        }
        return '#0f172a';
    }

    /**
     * Seçilen Renk Tabanlı Uyumlu 3D Stüdyo Gradyan Dokusu Üretici
     */
    function createColorGradientTexture(colorStr) {
        if (typeof document === 'undefined' || typeof THREE === 'undefined') return null;
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            const grad = ctx.createLinearGradient(0, 0, 0, 256);
            const c = new THREE.Color(colorStr || '#38bdf8');
            const hsl = {};
            c.getHSL(hsl);
            const topCol = new THREE.Color().setHSL(hsl.h, Math.min(1.0, hsl.s * 1.05), Math.min(0.96, hsl.l + 0.16));
            const botCol = new THREE.Color().setHSL(hsl.h, Math.min(1.0, hsl.s * 1.05), Math.max(0.08, hsl.l - 0.14));
            grad.addColorStop(0, '#' + topCol.getHexString());
            grad.addColorStop(0.5, '#' + c.getHexString());
            grad.addColorStop(1, '#' + botCol.getHexString());

            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 128, 256);

            const tex = new THREE.CanvasTexture(canvas);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            return tex;
        } catch(e) {
            return null;
        }
    }

    /**
     * 15. 2D Rozet / İğne / İkonu 3D'ye Dönüştürme Köprüsü (2D-to-3D Bridge)
     */
    async function convert2DBadgeTo3D(badgeEl, meta = {}) {
        // Eğer doğrudan veri objesi verilmişse doğrudan add3DElementFromData'ya aktar
        if (badgeEl && typeof badgeEl === 'object' && !badgeEl.nodeType && (badgeEl.svg || badgeEl.rawSvg || badgeEl.name || badgeEl.itemName)) {
            return add3DElementFromData(Object.assign({}, badgeEl, meta));
        }

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

        // 🌟 2D Şekil Tespiti (Ekstra Araçlar -> Şekiller: Dikdörtgen, Daire, Yıldız, Üçgen, vb.)
        const isShape = classList.includes('shape-el') || !!(el.dataset && el.dataset.shapeType) || !!(root.dataset && root.dataset.shapeType);
        let shapeType = '';
        let shapeGeneratedSvg = '';
        if (isShape) {
            shapeType = el.dataset?.shapeType || root.dataset?.shapeType || 'rectangle';
            const sBg = el.dataset?.bgColor || root.dataset?.bgColor || '#3b82f6';
            const sBorder = el.dataset?.borderColor || root.dataset?.borderColor || '#ffffff';
            const sBw = parseFloat(el.dataset?.borderWidth || root.dataset?.borderWidth || '0') || 0;
            const sRad = parseFloat(el.dataset?.radius || root.dataset?.radius || '0') || 0;
            const w = Math.max(30, (el || root).offsetWidth || 120);
            const h = Math.max(20, (el || root).offsetHeight || 80);

            if (shapeType === 'rectangle') {
                const rx = sRad > 0 ? sRad : 8;
                shapeGeneratedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect x="${sBw/2}" y="${sBw/2}" width="${w - sBw}" height="${h - sBw}" rx="${rx}" ry="${rx}" fill="${sBg}" stroke="${sBorder}" stroke-width="${sBw}"/></svg>`;
            } else if (shapeType === 'circle') {
                const r = Math.min(w, h) / 2;
                shapeGeneratedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><circle cx="${w/2}" cy="${h/2}" r="${r - sBw/2}" fill="${sBg}" stroke="${sBorder}" stroke-width="${sBw}"/></svg>`;
            } else {
                const innerSvg = (el || root).querySelector('svg');
                if (innerSvg) {
                    let sHtml = innerSvg.outerHTML;
                    sHtml = sHtml.replace(/var\(--shape-bg\)/g, sBg);
                    sHtml = sHtml.replace(/var\(--shape-border\)/g, sBorder);
                    sHtml = sHtml.replace(/var\(--shape-border-width\)/g, sBw + 'px');
                    shapeGeneratedSvg = sHtml;
                }
            }
        }

        // SVG Node ve ham SVG metni (Tutamaç, sil/boyutlandır kontrol butonlarının SVG'lerini ASLA alma!)
        const allCandidateSvgs = Array.from((el || root).querySelectorAll('svg')).filter(s => {
            return !s.closest('.callout-controls, .callout-resizer, .callout-rotator, .callout-lock-btn, .callout-select-border, .cbtn-del, .text-handle, .text-resize-handle, .text-rotate-handle');
        });
        const svgNode = allCandidateSvgs.length > 0 ? allCandidateSvgs[0] : null;
        let rawSvg = shapeGeneratedSvg || (meta && (meta.rawSvg || meta.svg)) || (svgNode ? svgNode.outerHTML : '');

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

        // 2. Renk Çıkarımı (Öğe DOM'dayken doğru computed değerleri oku)
        let primaryColor = el.dataset?.coIconColor || el.dataset?.coTextColor || root.dataset?.coIconColor || root.dataset?.coTextColor || '';
        let bgCol = '#ffffff';

        // Çok renkli zengin illüstrasyon / vektör tespiti
        let isMultiColorSvg = false;
        if (svgNode) {
            const distinctFills = new Set();
            svgNode.querySelectorAll('*').forEach(n => {
                const f = (n.getAttribute('fill') || '').trim().toLowerCase();
                const s = (n.getAttribute('stroke') || '').trim().toLowerCase();
                if (f && f !== 'none' && f !== 'transparent' && f !== '#fff' && f !== '#ffffff' && f !== 'white' && f !== 'currentcolor' && !f.startsWith('url(')) {
                    distinctFills.add(f);
                }
                if (s && s !== 'none' && s !== 'transparent' && s !== '#fff' && s !== '#ffffff' && s !== 'white' && s !== 'currentcolor' && !s.startsWith('url(')) {
                    distinctFills.add(s);
                }
            });
            if (distinctFills.size >= 2) isMultiColorSvg = true;
        }

        if (!primaryColor && svgNode) {
            const stop = svgNode.querySelector('stop');
            if (stop && stop.getAttribute('stop-color')) {
                primaryColor = stop.getAttribute('stop-color');
            } else if (!isMultiColorSvg) {
                const fillEl = svgNode.querySelector('[fill]:not([fill="none"]):not([fill^="url"]):not([fill="white"]):not([fill="#fff"]):not([fill="#ffffff"]):not([fill="currentColor"])');
                if (fillEl) primaryColor = fillEl.getAttribute('fill');
            } else {
                primaryColor = '#38bdf8';
            }
        }
        if (!primaryColor || primaryColor === 'none' || primaryColor === 'currentColor' || primaryColor === 'inherit') {
            primaryColor = el.style?.color || root.style?.color || '';
            if (!primaryColor && typeof window !== 'undefined' && window.getComputedStyle) {
                try {
                    const csCol = window.getComputedStyle(el).color;
                    if (csCol && csCol !== 'rgba(0, 0, 0, 0)' && csCol !== 'transparent') {
                        primaryColor = csCol;
                    }
                } catch(e) {}
            }
            if (!primaryColor) {
                primaryColor = el.dataset?.storedBorderColor || root.dataset?.storedBorderColor || '#38bdf8';
            }
        }
        if (isShape) {
            const sBg = el.dataset?.bgColor || root.dataset?.bgColor || '#3b82f6';
            const sBorder = el.dataset?.borderColor || root.dataset?.borderColor || '#ffffff';
            const sBw = parseFloat(el.dataset?.borderWidth || root.dataset?.borderWidth || '0') || 0;
            primaryColor = safeHexColor(sBg, '#3b82f6');
            bgCol = (sBw > 0) ? safeHexColor(sBorder, '#ffffff') : primaryColor;
        } else {
            primaryColor = safeHexColor(primaryColor, '#38bdf8');
            let bgColCandidate = el.dataset?.storedBgHex || root.dataset?.storedBgHex || el.dataset?.coBgColor || root.dataset?.coBgColor || '';
            if (!bgColCandidate || bgColCandidate === '#0f172a') {
                let isDarkIcon = false;
                try {
                    const c = new THREE.Color(primaryColor);
                    if ((0.299 * c.r + 0.587 * c.g + 0.114 * c.b) < 0.45) isDarkIcon = true;
                } catch(e){}
                bgCol = isDarkIcon ? '#ffffff' : '#0f172a';
            } else {
                bgCol = safeHexColor(bgColCandidate, '#ffffff');
            }
        }

        // 3. Metin Çıkarımı
        let label = (meta && meta.text) || el.dataset?.coLabel || root.dataset?.coLabel || '';
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
            } else {
                // Doğrudan öğenin text içeriğini kontrol et (örn. Serbest Yazı veya Çerçeveli Kutu)
                // Tutamaç veya kontrol butonlarının yazılarını süzmek için temiz klon oluştur
                let directText = '';
                try {
                    const clone = (el || root).cloneNode(true);
                    clone.querySelectorAll('.text-handle, .text-resize-handle, .text-rotate-handle, .callout-controls, .callout-resizer, .callout-rotator, .callout-lock-btn, .cbtn-del, [class*="handle"]').forEach(h => h.remove());
                    directText = (clone.innerText || clone.textContent || '').trim();
                } catch(e) {
                    directText = (el.innerText || el.textContent || root.innerText || root.textContent || '').trim();
                }

                if (directText && directText.length > 0) {
                    if (directText.length <= 2 && (/^\d+$/.test(directText) || directText === '📍')) {
                        hasRealText = false;
                    } else {
                        label = directText;
                        hasRealText = true;
                    }
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

        const isFramedBox = (meta && (meta.isFramed || meta.isBox || meta.elementType === 'badge_card')) ||
                            (el.dataset && (el.dataset.label === 'Özel Kutu' || el.dataset.label === 'Çerçeveli Metin' || el.dataset.label === 'Çerçeveli Yazı')) ||
                            (root.dataset && (root.dataset.label === 'Özel Kutu' || root.dataset.label === 'Çerçeveli Metin' || root.dataset.label === 'Çerçeveli Yazı')) ||
                            (parseFloat(el.dataset?.storedBorderWidth || root.dataset?.storedBorderWidth || '0') > 0) ||
                            (el.style && el.style.border && el.style.border !== 'none' && !el.style.border.startsWith('0px') && !el.style.border.startsWith('none'));

        const isPureIcon = classList.includes('added-icon') || classList.includes('is-svg-icon') || classList.includes('canvas-icon');
        if (isPureIcon) {
            hasRealText = false;
            label = '';
        }
        const isRound = isPureIcon || classList.includes('added-icon') || root.style.borderRadius === '50%' || el.style.borderRadius === '50%';

        const isNeon = classList.includes('co-neon-block') || !!(el.dataset && el.dataset.coIcon) || !!(root.dataset && root.dataset.coIcon);
        const neonIconClass = isNeon ? (el.dataset.coIcon || root.dataset.coIcon || (el.querySelector('i')?.className || '')) : '';
        let neonSvg = null;
        if (isNeon && typeof window.getNeonIconSvg === 'function') {
            neonSvg = window.getNeonIconSvg(neonIconClass, primaryColor || '#93c5fd');
        }

        let elemType = 'text';
        if (isShape && rawSvg) {
            elemType = 'element_3d';
        } else if (isNeon && neonSvg) {
            rawSvg = neonSvg;
            elemType = 'element_3d';
        } else if (isNeon) {
            elemType = 'badge_card';
        } else if (rawSvg && rawSvg.includes('<svg') && !isPin && !isArrow) {
            elemType = 'element_3d';
        } else if (isPin) {
            elemType = 'pin';
        } else if (isArrow) {
            elemType = 'arrow';
        } else if (isFramedBox) {
            elemType = 'badge_card';
        }

        const isGraphicOnly = (elemType === 'element_3d' || elemType === 'pin' || elemType === 'arrow');
        const finalMainText = hasRealText ? (label.split(/\r?\n/)[0] || '') : (isGraphicOnly && !isNeon ? '' : (label || ''));
        const finalSubText = hasRealText ? (label.split(/\r?\n/).slice(1).join(' ') || '') : '';
        
        const shapeNames = {
            'rectangle': 'Dikdörtgen Tabela',
            'circle': 'Daire Plaket',
            'triangle': 'Üçgen Tabela',
            'star': 'Yıldız Rozet',
            'heart': 'Kalp Plaket',
            'hexagon': 'Altıgen Tabela',
            'arrow-right': 'Sağ Ok',
            'arrow-left': 'Sol Ok',
            'arrow-up': 'Üst Ok'
        };
        const shapeDisplayName = isShape ? (shapeNames[shapeType] || '3D Şekil') : '';
        const displayName = itemName || shapeDisplayName || (isPin ? 'Konum Pini' : (isArrow ? 'Yön Oku' : (isFramedBox ? (finalMainText ? finalMainText : 'Çerçeveli Metin') : (elemType === 'element_3d' ? (finalMainText ? finalMainText : '3D İkon') : (finalMainText || '3D Öge')))));

        let planePitch = (meta && meta.planePitch !== undefined) ? meta.planePitch : 0;
        let planeYaw = (meta && meta.planeYaw !== undefined) ? meta.planeYaw : 0;
        let orientation = (meta && meta.orientation) ? meta.orientation : 'standing';

        // Eğer sahnede dokunulmamış boş bir varsayılan metin varsa, onu temizle
        const autoDefIdx = elements.findIndex(e => e.isAutoDefault);
        if (autoDefIdx !== -1) {
            delete3DElement(elements[autoDefIdx].id);
        }

        let cachedSilhouette = null;
        let isSilhouette = false;
        let shapeMode = isNeon ? 'card' : (isFramedBox ? 'card' : 'auto');
        const hasSvgText = !!(rawSvg && /<text\b/i.test(rawSvg));

        if (elemType === 'element_3d' && rawSvg) {
            if (isShape) {
                shapeMode = (shapeType === 'circle') ? 'coin' : ((shapeType === 'rectangle') ? 'card' : 'silhouette');
                isSilhouette = (shapeType !== 'circle' && shapeType !== 'rectangle');
            } else if (hasSvgText) {
                // Sadece metin içeren rozet plaketleri kart/plaket olarak kalır
                shapeMode = isRound ? 'coin' : 'card';
            } else {
                // 🌟 Ögeler, vektörler ve ikonlar varsayılan olarak KATI SİLÜET olarak açılır (asla yapay daire/plaket konmaz)
                try {
                    const svgDims = parseSvgDimensions(rawSvg);
                    cachedSilhouette = await extractSvgSilhouetteShape(rawSvg, svgDims.targetW, svgDims.targetH, {
                        forceSilhouette: true
                    });
                    if (cachedSilhouette && cachedSilhouette.shape) {
                        isSilhouette = true;
                        shapeMode = 'silhouette';
                    } else {
                        shapeMode = isRound ? 'coin' : 'card';
                    }
                } catch(e) {}
            }
        }

        // 🌟 Yan Renk / Kalınlık Kontrastı:
        // Eğer zemin beyazsa veya yazı rengi siyah/koyu ise, 3D yazının siyah bir leke gibi dolu/kapalı görünmemesi için
        // yan pah rengi lüks gümüş metalik (#94a3b8) olarak üretilir.
        let isDarkPrimary = false;
        try {
            const tc = new THREE.Color(primaryColor);
            if ((0.299 * tc.r + 0.587 * tc.g + 0.114 * tc.b) < 0.35) isDarkPrimary = true;
        } catch(e){}

        let initialSideColor = null;
        if (isShape) {
            const sBw = parseFloat(el?.dataset?.borderWidth || root?.dataset?.borderWidth || '0') || 0;
            initialSideColor = sBw > 0 ? (bgCol || '#94a3b8') : autoGenerateSideColor(primaryColor);
        } else if (isMultiColorSvg) {
            initialSideColor = '#334155'; // Çok renkli ögeler için nötr şık antrasit yan kalınlık
        } else if (isSilhouette) {
            initialSideColor = autoGenerateSideColor(primaryColor);
        } else if (bgCol === '#ffffff' || primaryColor === '#000000' || isDarkPrimary) {
            initialSideColor = '#94a3b8';
        } else {
            initialSideColor = autoGenerateSideColor(bgCol || primaryColor);
        }

        // 🌟 3D Sahnede Standart ve Dengeli Metin Boyutu:
        // 2D tuvaldeki yüksek çözünürlüklü piksel font boyutu (72px - 140px) 3D dünya koordinatlarına
        // doğrudan aktarılmamalıdır; 3D sahnede devasa olmaması için standart boyuta (36) sabitlenir.
        const normal3DTextSize = 36;

        const newEl = createDefaultElement({
            name: displayName,
            sourceItemName: displayName,
            sourceSvg: (elemType === 'element_3d') ? rawSvg : null,
            sourceSvgOriginal: (elemType === 'element_3d') ? rawSvg : null,
            isMultiColorSvg: isMultiColorSvg,
            selectedIconId: isShape ? 'none' : ((isNeon && neonSvg) ? neonSvg : (isFramedBox || elemType === 'badge_card' ? 'none' : (meta && meta.selectedIconId ? meta.selectedIconId : 'ev-14'))),
            elementType: elemType,
            shapeMode: shapeMode,
            cachedSilhouette: cachedSilhouette,
            isExactSilhouette: isSilhouette,
            isSurfaceBase: isShape || !!(meta && meta.isSurfaceBase),
            isShape: isShape,
            text: finalMainText,
            textSize: normal3DTextSize,
            badgeSubtext: finalSubText,
            show3DText: isNeon ? !!(finalMainText || finalSubText) : false,
            text3DColor: primaryColor || (isNeon ? '#93c5fd' : '#ffffff'),
            text3DXOffset: 0,
            frontColor: primaryColor || (isNeon ? '#93c5fd' : '#ffffff'),
            badgeBgColor: isShape ? primaryColor : (isNeon ? (bgCol || '#0d1b2e') : bgCol),
            sideColor: isNeon ? '#1e3a8a' : initialSideColor,
            isRound: isShape ? (shapeType === 'circle') : (shapeMode === 'coin'),
            depth: isShape ? 16 : (isSilhouette ? 20 : 16),
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

        // 🌟 2D Elemanı Tuvalden Kalıcı Olarak Temizle (Artık 3D olarak sahnede yaşar)
        if (root && root.parentNode) {
            root.remove();
        }
        if (root !== el && el && el.parentNode) {
            el.remove();
        }
        if (typeof window.removeCalloutControls === 'function') {
            window.removeCalloutControls();
        }
        const shapeSettingsPanelEl = document.getElementById('shapeSettingsPanel');
        if (shapeSettingsPanelEl) shapeSettingsPanelEl.style.display = 'none';
        if (typeof window.selectedCalloutEl !== 'undefined') window.selectedCalloutEl = null;
        if (typeof window.selectedEl !== 'undefined') window.selectedEl = null;
        if (Array.isArray(window.selectedElements)) window.selectedElements = [];

        // 🌟 Önce yeni ögeyi koleksiyona ekle ki initScene boş zannedip varsayılan metin oluşturmasın!
        elements.push(newEl);
        activeElementId = newEl.id;

        await openStudio(true, false, false);
        initElementThreeObjects(newEl);
        setActiveElement(newEl);
        recreateContentMeshes(newEl);
        syncControlsUI();
        update3DLayersOrder();
        setSelected(true, { silent: true, openPanel: false });
        const p2d = document.getElementById('threeDStudioPanel');
        if (p2d) p2d.style.display = 'none';
        updateDock3DControlsState();
        if (window.DockManager && typeof window.DockManager.setContext === 'function') {
            window.DockManager.setContext('3d');
        }

        // 🌟 İlk kareyi anında senkron olarak tuvale boya (0ms gecikme garantisi)
        if (renderer && scene && camera) {
            try {
                renderer.render(scene, camera);
            } catch (e) {}
        }
        requestRender();

        if (typeof window.renderLayers === 'function') window.renderLayers();
        if (typeof window.recordHistory === 'function') window.recordHistory('Yeni 3D Öge Eklendi');
        if (typeof window.requestAutoSave === 'function') window.requestAutoSave();

        if (typeof window.showToast === 'function') {
            const toastIcon = isPin ? '📍' : (isArrow ? '🏹' : '✨');
            window.showToast(`${toastIcon} "${newEl.sourceItemName}" 3D olarak eklendi! (Tuvalde toplam ${elements.length} adet 3D öge)`, 'success');
        }
        return true;
    }

    /**
     * 15.0 Tuvale Yeni 3D Metin Ekleme
     */
    async function add3DText(text = '3D METİN', options = {}) {
        const count = elements.length + 1;
        const textVal = text || ('3D METİN ' + count);
        const nameVal = options.name || ('3D Metin ' + count);
        return await add3DElementFromData(Object.assign({
            elementType: 'text',
            name: nameVal,
            text: textVal,
            textSize: 36,
            depth: 16
        }, options));
    }

    /**
     * 15.1 Doğrudan Veri / Vektörden Yeni 3D Öge Ekleme (Data-driven 3D Addition)
     * İkon kütüphanesinden veya rozetlerden tıklandığında anında 3D sahneye yeni bir öge ekler.
     */
    async function add3DElementFromData(options = {}) {
        const shouldShowPanel = options.showPanel === true; // Varsayılan kapalı, çift tıklamayla açılır!
        await openStudio(true, false, shouldShowPanel);

        const count = elements.length + 1;
        const rawSvg = options.svg || options.rawSvg || null;
        const itemName = options.name || options.title || options.itemName || ('3D Öge ' + count);
        const isPin = !!options.isPin;
        const isArrow = !!options.isArrow;
        let elemType = options.elementType;
        if (!elemType) {
            if (rawSvg && rawSvg.includes('<svg') && !isPin && (!isArrow || options.isCallout)) elemType = 'element_3d';
            else if (isPin) elemType = 'pin';
            else if (isArrow) elemType = 'arrow';
            else elemType = 'text';
        }

        // Çok renkli zengin illüstrasyon / vektör tespiti
        let isMultiColorSvg = false;
        if (rawSvg) {
            try {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = rawSvg;
                const distinctFills = new Set();
                tempDiv.querySelectorAll('*').forEach(n => {
                    const f = (n.getAttribute('fill') || '').trim().toLowerCase();
                    const s = (n.getAttribute('stroke') || '').trim().toLowerCase();
                    if (f && f !== 'none' && f !== 'transparent' && f !== '#fff' && f !== '#ffffff' && f !== 'white' && f !== 'currentcolor' && !f.startsWith('url(')) {
                        distinctFills.add(f);
                    }
                    if (s && s !== 'none' && s !== 'transparent' && s !== '#fff' && s !== '#ffffff' && s !== 'white' && s !== 'currentcolor' && !s.startsWith('url(')) {
                        distinctFills.add(s);
                    }
                });
                if (distinctFills.size >= 2) isMultiColorSvg = true;
            } catch(e){}
        }

        // Renk Çıkarımı
        let primaryColor = options.frontColor || options.color || '';
        let bgCol = options.badgeBgColor || options.bgColor || '';

        if (!primaryColor && rawSvg) {
            try {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = rawSvg;
                const stop = tempDiv.querySelector('stop');
                if (stop && stop.getAttribute('stop-color')) {
                    primaryColor = stop.getAttribute('stop-color');
                } else if (!isMultiColorSvg) {
                    const fillEl = tempDiv.querySelector('[fill]:not([fill="none"]):not([fill^="url"]):not([fill="white"]):not([fill="#fff"]):not([fill="#ffffff"]):not([fill="currentColor"])');
                    if (fillEl) primaryColor = fillEl.getAttribute('fill');
                } else {
                    primaryColor = '#38bdf8';
                }
            } catch(e){}
        }
        primaryColor = safeHexColor(primaryColor, '#38bdf8');

        if (!bgCol) {
            let isDarkIcon = false;
            try {
                const c = new THREE.Color(primaryColor);
                if ((0.299 * c.r + 0.587 * c.g + 0.114 * c.b) < 0.45) isDarkIcon = true;
            } catch(e){}
            bgCol = isDarkIcon ? '#ffffff' : '#0f172a';
        } else {
            bgCol = safeHexColor(bgCol, '#ffffff');
        }

        // Metin Çıkarımı
        const text = (options.text !== undefined) ? options.text : (elemType === 'text' ? itemName : '');
        const subtext = (options.subtext !== undefined) ? options.subtext : (options.badgeSubtext || '');

        // Staggered konumlandırma (yeni ögeler önceki ögelerin tam üzerine binmez)
        const offsets = [
            { x: 0, y: 0 },
            { x: 75, y: -50 },
            { x: -75, y: 50 },
            { x: 130, y: 30 },
            { x: -120, y: -60 },
            { x: 50, y: 90 },
            { x: -60, y: -80 }
        ];
        const step = elements.length % offsets.length;
        let initX = (options.posX !== undefined) ? options.posX : (elements.length > 0 ? offsets[step].x : 0);
        let initY = (options.posY !== undefined) ? options.posY : (elements.length > 0 ? offsets[step].y : 0);

        let orientation = options.orientation || 'standing';
        let planePitch = options.planePitch !== undefined ? options.planePitch : (state && typeof state.planePitch === 'number' ? state.planePitch : 0);
        let planeYaw = options.planeYaw !== undefined ? options.planeYaw : (state && typeof state.planeYaw === 'number' ? state.planeYaw : 0);
        let planeRoll = options.planeRoll !== undefined ? options.planeRoll : (state && typeof state.planeRoll === 'number' ? state.planeRoll : 0);
        let planeScale = (options.planeScale !== undefined && options.planeScale !== null) ? options.planeScale : 1.0;
        let planeLocalRot = options.planeLocalRot !== undefined ? options.planeLocalRot : 0;

        // Eğer sahnede dokunulmamış boş bir varsayılan metin varsa, onu temizle
        const autoDefIdx = elements.findIndex(e => e.isAutoDefault);
        if (autoDefIdx !== -1) {
            const defEl = elements[autoDefIdx];
            // Eğer metin veya renk değiştirildiyse kullanıcı bu ögeyi kullanıyor demektir, silme.
            if (defEl.text === '3D METİN' && defEl.frontColor === '#f59e0b') {
                delete3DElement(defEl.id);
            } else {
                defEl.isAutoDefault = false;
            }
        }

        let cachedSilhouette = null;
        let isSilhouette = false;
        let shapeMode = options.shapeMode || (elemType === 'badge_card' ? 'card' : 'auto');
        const hasSvgText = !!(rawSvg && /<text\b/i.test(rawSvg));

        if (elemType === 'element_3d' && rawSvg) {
            if (hasSvgText && !options.shapeMode) {
                if (shapeMode === 'auto') {
                    const svgDims = parseSvgDimensions(rawSvg);
                    const isRoundOrSquare = Math.abs(svgDims.vbW - svgDims.vbH) <= 8 || options.isRound;
                    shapeMode = isRoundOrSquare ? (options.isRound ? 'coin' : 'card') : 'card';
                }
            } else if (shapeMode !== 'coin' && shapeMode !== 'card') {
                try {
                    const svgDims = parseSvgDimensions(rawSvg);
                    cachedSilhouette = await extractSvgSilhouetteShape(rawSvg, svgDims.targetW, svgDims.targetH, {
                        forceSilhouette: true
                    });
                    if (cachedSilhouette && cachedSilhouette.shape) {
                        isSilhouette = true;
                        shapeMode = 'silhouette';
                    } else if (shapeMode === 'auto') {
                        shapeMode = (Math.abs(svgDims.targetW - svgDims.targetH) > 10) ? 'card' : (options.isRound ? 'coin' : 'card');
                    }
                } catch(e) {
                    console.warn('[ThreeDEngine] Silüet analizi hatası:', e);
                }
            }
        }

        let isDarkPrimary = false;
        try {
            const tc = new THREE.Color(primaryColor);
            if ((0.299 * tc.r + 0.587 * tc.g + 0.114 * tc.b) < 0.35) isDarkPrimary = true;
        } catch(e){}

        let initialSideColor = options.sideColor;
        if (!initialSideColor) {
            if (options.isShape) {
                initialSideColor = autoGenerateSideColor(primaryColor);
            } else if (isMultiColorSvg) {
                initialSideColor = '#334155';
            } else if (isSilhouette) {
                initialSideColor = autoGenerateSideColor(primaryColor);
            } else if (bgCol === '#ffffff' || primaryColor === '#000000' || isDarkPrimary) {
                initialSideColor = '#94a3b8';
            } else {
                initialSideColor = autoGenerateSideColor(bgCol || primaryColor);
            }
        }

        const newEl = createDefaultElement({
            name: itemName,
            sourceItemName: itemName,
            sourceSvg: (elemType === 'element_3d' && rawSvg) ? rawSvg : (options.sourceSvg || null),
            sourceSvgOriginal: (elemType === 'element_3d' && rawSvg) ? rawSvg : (options.sourceSvgOriginal || options.sourceSvg || null),
            isMultiColorSvg: isMultiColorSvg,
            selectedIconId: options.selectedIconId !== undefined ? options.selectedIconId : (elemType === 'badge_card' ? 'none' : 'ev-14'),
            elementType: elemType,
            shapeMode: shapeMode,
            cachedSilhouette: cachedSilhouette,
            isExactSilhouette: isSilhouette,
            text: text,
            badgeSubtext: subtext,
            show3DText: (options.show3DText !== undefined) ? !!options.show3DText : (elemType === 'badge_card' || elemType === 'text' ? false : (!!(text || subtext))),
            text3DOffset: options.text3DOffset !== undefined ? options.text3DOffset : -25,
            text3DXOffset: options.text3DXOffset !== undefined ? options.text3DXOffset : 0,
            text3DSize: options.text3DSize !== undefined ? options.text3DSize : 22,
            text3DDepth: options.text3DDepth !== undefined ? options.text3DDepth : 8,
            text3DColor: options.text3DColor || primaryColor || '#ffffff',
            text3DMode: options.text3DMode || 'together',
            text3DPitch: options.text3DPitch !== undefined ? options.text3DPitch : 0,
            text3DYaw: options.text3DYaw !== undefined ? options.text3DYaw : 0,
            text3DRoll: options.text3DRoll !== undefined ? options.text3DRoll : 0,
            frontColor: primaryColor,
            badgeBgColor: bgCol,
            sideColor: initialSideColor,
            isRound: (shapeMode === 'coin'),
            depth: options.depth !== undefined ? options.depth : (isSilhouette ? 20 : 16),
            bevelEnabled: options.bevelEnabled !== undefined ? !!options.bevelEnabled : true,
            bevelThickness: options.bevelThickness !== undefined ? options.bevelThickness : 2,
            bevelSize: options.bevelSize !== undefined ? options.bevelSize : 1.5,
            orientation: orientation,
            planePitch: planePitch,
            planeYaw: planeYaw,
            planeRoll: planeRoll,
            planeLocalRot: planeLocalRot,
            itemPitch: options.itemPitch !== undefined ? options.itemPitch : 0,
            itemRoll: options.itemRoll !== undefined ? options.itemRoll : 0,
            posX: initX,
            posY: initY,
            posZ: options.posZ !== undefined ? options.posZ : 0,
            planeScale: planeScale,
            scaleX: options.scaleX !== undefined ? options.scaleX : 1.0,
            scaleY: options.scaleY !== undefined ? options.scaleY : 1.0,
            scaleZ: options.scaleZ !== undefined ? options.scaleZ : 1.0,
            estateItemId: options.estateItemId || null,
            isBaseAligned: options.isBaseAligned !== undefined ? !!options.isBaseAligned : false,
            isFence: options.isFence !== undefined ? !!options.isFence : false,
            visible: true
        });

        initElementThreeObjects(newEl);
        elements.push(newEl);
        setActiveElement(newEl);
        recreateContentMeshes(newEl);
        syncControlsUI();
        update3DLayersOrder();
        state.gizmoActive = true;
        setSelected(true, { silent: true, openPanel: shouldShowPanel });
        if (!shouldShowPanel) {
            const p = document.getElementById('threeDStudioPanel');
            if (p) p.style.display = 'none';
        }
        updateDock3DControlsState();

        // 🌟 İlk kareyi anında senkron olarak tuvale boya (0ms gecikme garantisi)
        if (renderer && scene && camera) {
            try {
                renderer.render(scene, camera);
            } catch (e) {}
        }
        requestRender();

        if (typeof window.renderLayers === 'function') window.renderLayers();
        if (typeof window.recordHistory === 'function') window.recordHistory('Yeni 3D Öge Eklendi');
        if (typeof window.requestAutoSave === 'function') window.requestAutoSave();

        if (typeof window.showToast === 'function') {
            const toastIcon = isPin ? '📍' : (isArrow ? '🏹' : (elemType === 'element_3d' ? '✨' : '🧊'));
            window.showToast(`${toastIcon} "${itemName}" 3D sahneye eklendi! (Tuvalde toplam ${elements.length} adet 3D öge)`, 'success');
        }
        return newEl;
    }

    /**
     * 15.2 Emlak ve Mimari 3D Öge Ekleme (Estate 3D Addition)
     */
    async function add3DEstateElement(item, customOpts = {}) {
        if (!item) return null;
        await openStudio(true, false, customOpts.showPanel === true);

        const isFenceItem = item.category === 'fences' || (item.tags && item.tags.includes('çit')) || !!customOpts.isFence;

        // Binalar, evler ve peyzaj ögeleri için gerçekçi mimari 3D derinlik:
        let itemDepth = item.depth;
        if (!itemDepth) {
            if (isFenceItem) itemDepth = 3;
            else if (item.category === 'buildings') itemDepth = 65;
            else if (item.category === 'landscape') itemDepth = 20;
            else itemDepth = 30;
        }

        const opts = Object.assign({
            name: item.name,
            text: customOpts.text || '',
            badgeSubtext: customOpts.badgeSubtext || customOpts.subtext || '',
            show3DText: customOpts.show3DText !== undefined ? !!customOpts.show3DText : false,
            svg: item.svg,
            elementType: 'element_3d',
            shapeMode: 'silhouette',
            orientation: item.orientation || (isFenceItem ? 'flat' : 'standing'),
            isBaseAligned: true,
            isFence: isFenceItem,
            frontColor: item.frontColor || '#16a34a',
            sideColor: item.sideColor || (isFenceItem ? '#14532d' : (item.category === 'landscape' ? '#166534' : '#475569')),
            depth: itemDepth,
            bevelEnabled: !isFenceItem,
            bevelThickness: isFenceItem ? 0 : 1.2,
            bevelSize: isFenceItem ? 0 : 0.8,
            planePitch: 0,
            planeYaw: 0,
            planeRoll: 0,
            itemPitch: 0,
            itemRoll: 0,
            planeLocalRot: 0,
            estateItemId: item.id
        }, customOpts);

        // Binalar ve evler için silüeti önceden çıkar (ilk anda bile masif 3D kütle olarak render edilir)
        if (!isFenceItem && item.svg && typeof extractSvgSilhouetteShape === 'function') {
            try {
                const preRes = await extractSvgSilhouetteShape(item.svg, 220, 220, { forceSilhouette: true });
                if (preRes && preRes.shape) {
                    opts.cachedSilhouette = preRes;
                    opts.isExactSilhouette = true;
                }
            } catch(e) {}
        }

        const newEl = await add3DElementFromData(opts);
        if (newEl) {
            newEl.estateItemId = item.id;
            newEl.isBaseAligned = true;
            newEl.isFence = isFenceItem;
            newEl._originalFrontColor = newEl.frontColor;
            newEl._originalSideColor = newEl.sideColor;
            newEl._userHasChangedColor = false;
            newEl.text = opts.text || '';
            newEl.badgeSubtext = opts.badgeSubtext || '';
            newEl.show3DText = !!opts.show3DText;
            if (opts.cachedSilhouette) {
                newEl.cachedSilhouette = opts.cachedSilhouette;
                newEl.isExactSilhouette = true;
            }
            if (opts.orientation) newEl.orientation = opts.orientation;
            if (opts.planeScale !== undefined) newEl.planeScale = opts.planeScale;
            if (opts.scaleX !== undefined) newEl.scaleX = opts.scaleX;
            if (opts.scaleY !== undefined) newEl.scaleY = opts.scaleY;
            if (opts.scaleZ !== undefined) newEl.scaleZ = opts.scaleZ;
            if (opts.planeLocalRot !== undefined) newEl.planeLocalRot = opts.planeLocalRot;
            if (opts.itemPitch !== undefined) newEl.itemPitch = opts.itemPitch;
            if (opts.itemRoll !== undefined) newEl.itemRoll = opts.itemRoll;
            updateContentTransform(newEl);
            syncControlsUI();
            requestRender();
        }
        return newEl;
    }

    /**
     * 15.3 Seçili 3D Ögeye Emlak / Çit Stili Uygulama
     */
    async function setElementEstateStyle(styleIdOrItem) {
        let item = null;
        if (typeof styleIdOrItem === 'string') {
            if (window.Estate3DLibrary && typeof window.Estate3DLibrary.getItemById === 'function') {
                item = window.Estate3DLibrary.getItemById(styleIdOrItem);
            }
        } else if (styleIdOrItem && typeof styleIdOrItem === 'object') {
            item = styleIdOrItem;
        }
        if (!item) return null;

        const activeEl = getActiveElement();
        let targetEls = [];
        if (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function') {
            const sel = window.ThreeDGrouping.getSelected3DElements();
            if (sel && sel.length > 0) targetEls = sel.slice();
        }
        if (targetEls.length === 0 && activeEl) {
            targetEls = [activeEl];
        }

        if (targetEls.length === 0) {
            return await add3DEstateElement(item);
        }

        const isFenceItem = item.category === 'fences' || (item.tags && item.tags.includes('çit'));
        let preSilhouette = null;
        if (!isFenceItem && item.svg && typeof extractSvgSilhouetteShape === 'function') {
            try {
                preSilhouette = await extractSvgSilhouetteShape(item.svg, 220, 220, { forceSilhouette: true });
            } catch(e) {}
        }

        let itemDepth = item.depth;
        if (!itemDepth) {
            if (isFenceItem) itemDepth = 3;
            else if (item.category === 'buildings') itemDepth = 65;
            else if (item.category === 'landscape') itemDepth = 20;
            else itemDepth = 30;
        }

        for (let el of targetEls) {
            el.estateItemId = item.id;
            el.name = item.name;
            el.sourceItemName = item.name;
            el.sourceSvg = item.svg;
            el.sourceSvgOriginal = item.svg;
            el.elementType = 'element_3d';
            el.shapeMode = 'silhouette';
            el.isExactSilhouette = !!(preSilhouette && preSilhouette.shape);
            el.cachedSilhouette = preSilhouette;
            el.orientation = item.orientation || (isFenceItem ? 'flat' : 'standing');
            if (item.frontColor) el.frontColor = item.frontColor;
            el.sideColor = item.sideColor || (isFenceItem ? '#14532d' : (item.category === 'landscape' ? '#166534' : '#475569'));
            el.depth = itemDepth;
            el.isFence = isFenceItem;
            el.isBaseAligned = true;

            if (item.svg && item.svg.includes('<text')) {
                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(item.svg, 'image/svg+xml');
                    const tNodes = Array.from(doc.querySelectorAll('text'));
                    if (tNodes.length > 0) {
                        tNodes.sort((a, b) => {
                            const fsA = parseFloat(a.getAttribute('font-size')) || 0;
                            const fsB = parseFloat(b.getAttribute('font-size')) || 0;
                            return fsB - fsA;
                        });
                        el.text = tNodes[0].textContent.trim();
                        if (tNodes.length > 1) {
                            el.badgeSubtext = tNodes[1].textContent.trim();
                        }
                    }
                } catch(e) {}
            }

            recreateContentMeshes(el);
            updateContentTransform(el);
        }

        syncActiveElementFromState();
        syncControlsUI();
        requestRender();

        if (typeof window.recordHistory === 'function') window.recordHistory('Emlak Stili Değiştirildi');
        if (typeof window.renderLayers === 'function') window.renderLayers();
        return targetEls[0];
    }

    /**
     * 15.4 Çizilen 2D Çizgi / Çokgen Sınırını Tabanı Çizgiye Oturan 3D Çit / Duvara Dönüştürme
     */
    async function convertLineTo3DFence(targetOrPoints, styleId = 'fence_panel_green') {
        let pts = [];
        let domElement = null;
        let isPolygonType = false;

        // 1. Hedef nesneden veya parametreden 2D noktaları ayıkla
        if (Array.isArray(targetOrPoints)) {
            pts = targetOrPoints.slice();
            isPolygonType = pts.length >= 3;
        } else if (targetOrPoints) {
            domElement = (targetOrPoints.nodeType === 1) ? targetOrPoints : null;
            if (domElement) {
                // Wrapper elemente ulaş
                const drawEl = domElement.closest ? 
                    (domElement.closest('.editable-draw, .cvi-item, [data-path-id], [data-path-index]') || domElement) : domElement;

                // A) drawPaths üzerinden orijinal çizim koordinatlarını ara
                if (typeof drawPaths !== 'undefined' && Array.isArray(drawPaths)) {
                    let pObj = drawPaths.find(p => 
                        p.el === drawEl || 
                        p.el === domElement || 
                        (p.el && (p.el.contains(domElement) || domElement.contains(p.el))) ||
                        (p.id && (drawEl.dataset && drawEl.dataset.pathId === p.id || domElement.dataset && domElement.dataset.pathId === p.id))
                    );
                    if (!pObj && drawEl.dataset && drawEl.dataset.pathIndex !== undefined) {
                        const idx = parseInt(drawEl.dataset.pathIndex, 10);
                        if (!isNaN(idx) && drawPaths[idx]) pObj = drawPaths[idx];
                    }
                    if (pObj) {
                        if (pObj.type === 'polygon' || pObj.closed) isPolygonType = true;
                        const curLeft = parseFloat(drawEl.style ? drawEl.style.left : 0) || 0;
                        const curTop = parseFloat(drawEl.style ? drawEl.style.top : 0) || 0;
                        const baseLeft = parseFloat(drawEl.dataset && drawEl.dataset.baseLeft !== undefined ? drawEl.dataset.baseLeft : curLeft);
                        const baseTop = parseFloat(drawEl.dataset && drawEl.dataset.baseTop !== undefined ? drawEl.dataset.baseTop : curTop);
                        const shiftX = curLeft - baseLeft;
                        const shiftY = curTop - baseTop;

                        if (Array.isArray(pObj.points) && pObj.points.length >= 2) {
                            pts = pObj.points.map(p => ({ x: p.x + shiftX, y: p.y + shiftY }));
                        } else if (pObj.x1 !== undefined && pObj.x2 !== undefined) {
                            pts = [
                                { x: pObj.x1 + shiftX, y: pObj.y1 + shiftY },
                                { x: pObj.x2 + shiftX, y: pObj.y2 + shiftY }
                            ];
                        }
                    }
                }

                // B) dataset.polygonPoints kontrolü
                if (pts.length < 2 && drawEl.dataset && drawEl.dataset.polygonPoints) {
                    try {
                        const parsed = JSON.parse(drawEl.dataset.polygonPoints);
                        if (Array.isArray(parsed) && parsed.length >= 2) {
                            const baseL = parseFloat(drawEl.dataset.baseLeft || drawEl.style.left) || 0;
                            const baseT = parseFloat(drawEl.dataset.baseTop || drawEl.style.top) || 0;
                            pts = parsed.map(p => ({ x: baseL + p.x, y: baseT + p.y }));
                            isPolygonType = true;
                        }
                    } catch(e) {}
                }

                // C) SVG içindeki etiketlerden koordinat çıkarımı
                if (pts.length < 2) {
                    const polygon = drawEl.querySelector ? (drawEl.querySelector('polygon') || (drawEl.tagName && drawEl.tagName.toLowerCase() === 'polygon' ? drawEl : null)) : null;
                    const polyline = drawEl.querySelector ? (drawEl.querySelector('polyline') || (drawEl.tagName && drawEl.tagName.toLowerCase() === 'polyline' ? drawEl : null)) : null;
                    const line = drawEl.querySelector ? (drawEl.querySelector('line') || (drawEl.tagName && drawEl.tagName.toLowerCase() === 'line' ? drawEl : null)) : null;
                    
                    const baseL = parseFloat(drawEl.dataset && drawEl.dataset.baseLeft !== undefined ? drawEl.dataset.baseLeft : (drawEl.style ? drawEl.style.left : 0)) || 0;
                    const baseT = parseFloat(drawEl.dataset && drawEl.dataset.baseTop !== undefined ? drawEl.dataset.baseTop : (drawEl.style ? drawEl.style.top : 0)) || 0;

                    if (polygon || polyline) {
                        const ptsAttr = (polygon || polyline).getAttribute('points');
                        if (ptsAttr) {
                            pts = ptsAttr.trim().split(/\s+/).map(p => {
                                const [x, y] = p.split(',').map(Number);
                                return { x: baseL + (x || 0), y: baseT + (y || 0) };
                            });
                            isPolygonType = !!polygon || pts.length >= 3;
                        }
                    } else if (line) {
                        pts = [
                            { x: baseL + parseFloat(line.getAttribute('x1') || 0), y: baseT + parseFloat(line.getAttribute('y1') || 0) },
                            { x: baseL + parseFloat(line.getAttribute('x2') || 0), y: baseT + parseFloat(line.getAttribute('y2') || 0) }
                        ];
                    }
                }

                // D) Global polygonPoints kontrolü
                if (pts.length < 2 && typeof polygonPoints !== 'undefined' && Array.isArray(polygonPoints) && polygonPoints.length >= 2) {
                    pts = polygonPoints.map(p => ({ x: p.x, y: p.y }));
                    isPolygonType = true;
                }

                domElement = drawEl;
            }
        }

        // 2. Güvenlik ve Varsayılan Noktalar
        if (!pts || pts.length < 2) {
            const container = document.getElementById('canvas-container');
            const cw = container ? container.offsetWidth : 1200;
            const ch = container ? container.offsetHeight : 800;
            pts = [
                { x: cw / 2 - 150, y: ch / 2 },
                { x: cw / 2 + 150, y: ch / 2 }
            ];
        }

        // Çokgen kapalı mı kontrolü: Eğer ilk ve son nokta çakışıyorsa son noktayı ayıkla
        if (pts.length >= 3) {
            const first = pts[0];
            const last = pts[pts.length - 1];
            if (Math.hypot(first.x - last.x, first.y - last.y) < 12) {
                pts.pop();
            }
            if (isPolygonType || (domElement && (domElement.querySelector('polygon') || (domElement.dataset && domElement.dataset.drawType === 'polygon')))) {
                isPolygonType = true;
            }
        }

        await openStudio(true, false, false);

        let item = null;
        if (window.Estate3DLibrary) {
            item = window.Estate3DLibrary.getItemById(styleId) || window.Estate3DLibrary.getItems()[0];
        }
        if (!item) {
            console.warn('[ThreeDEngine] Emlak stili bulunamadı:', styleId);
            return null;
        }

        const container = document.getElementById('canvas-container') || document.getElementById('preview-area');
        const cRect = container ? container.getBoundingClientRect() : { left: 0, top: 0, width: 1200, height: 800 };
        const cWidth = (container && container.offsetWidth > 0) ? container.offsetWidth : (cRect.width || 1200);
        const cHeight = (container && container.offsetHeight > 0) ? container.offsetHeight : (cRect.height || 800);

        // 🌟 1. WebGL Tuval ve Kamera En-Boy Oranını Container ile Kesin Olarak Senkronize Et (Açı Bozulmasını Önler)
        if (canvasEl && (canvasEl.width !== cWidth || canvasEl.height !== cHeight)) {
            canvasEl.width = cWidth;
            canvasEl.height = cHeight;
        }
        if (renderer) {
            renderer.setSize(cWidth, cHeight, false);
        }
        if (camera) {
            camera.aspect = cWidth / cHeight;
            camera.updateProjectionMatrix();
        }

        const fov = (camera && camera.fov) ? camera.fov : 45;
        const camZ = (camera && camera.position && typeof camera.position.z === 'number') ? camera.position.z : 850;
        const visibleHeightAtZ0 = 2 * camZ * Math.tan(THREE.MathUtils.degToRad(fov / 2));
        const unitsPerPixelY = visibleHeightAtZ0 / cHeight;
        const visibleWidthAtZ0 = visibleHeightAtZ0 * camera.aspect;
        const unitsPerPixelX = visibleWidthAtZ0 / cWidth;

        // 3. 2D Çizim Koordinatlarını Doğrudan 3D Z=0 Kamera İzdüşüm Düzlemine 1:1 Aktarma
        const ground3DPoints = pts.map(pt => ({
            x: (pt.x - cWidth / 2) * unitsPerPixelX,
            y: -(pt.y - cHeight / 2) * unitsPerPixelY
        }));

        if (ground3DPoints.length < 2) return null;

        // 4. Çizimin / Parselin Boyutunu ve Orantılı Çit Ölçeğini Hesaplama
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        pts.forEach(p => {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        });
        const drawSpanX = Math.max(10, maxX - minX);
        const drawSpanY = Math.max(10, maxY - minY);
        const drawDiagonalPx = Math.hypot(drawSpanX, drawSpanY);

        // 🌟 GERÇEKÇİ ÇİT ÖLÇEĞİ:
        // Dron fotoğraflarında parsel uzaktan görünür. Çit yüksekliği parsel boyutunun yaklaşık %2.5 - %3'ü olmalıdır.
        // Asgari 16px, azami 26px sınırıyla devasa duvar etkisi kesinlikle önlenir.
        const targetFenceHeightPx = Math.max(16, Math.min(26, drawDiagonalPx * 0.028));
        const targetHeight3D = targetFenceHeightPx * unitsPerPixelY;

        const baseMeshHeight = 110; // 3D silüet taban yüksekliği
        const baseMeshWidth = 220;  // 3D silüet taban genişliği (2:1 en-boy oranı)
        const desiredScaleY = Math.max(0.04, Math.min(0.35, targetHeight3D / baseMeshHeight));

        // 5. Kenarlar ve Modüler Çit Panelleri Hesaplama
        const isClosed = isPolygonType && ground3DPoints.length >= 3;
        const numEdges = isClosed ? ground3DPoints.length : (ground3DPoints.length - 1);
        const segments = [];

        for (let i = 0; i < numEdges; i++) {
            let p1 = ground3DPoints[i];
            let p2 = ground3DPoints[(i + 1) % ground3DPoints.length];
            let dx = p2.x - p1.x;
            let dy = p2.y - p1.y;
            let segLen = Math.hypot(dx, dy);
            if (segLen < 4) continue;

            // 🎯 YÖN HİZALAMA: Çit daima gökyüzüne / yukarıya doğru yükselsin (asla toprağın içine ters bakmasın)
            // Three.js koordinatında +Y yukarıdır. Segment soldan sağa akarsa (+X) normal yukarı bakar.
            if (dx < 0 || (Math.abs(dx) < 0.001 && dy < 0)) {
                const tmp = p1; p1 = p2; p2 = tmp;
                dx = -dx;
                dy = -dy;
            }

            const angleRad = Math.atan2(dy, dx);
            const angleDeg = THREE.MathUtils.radToDeg(angleRad);

            // 🌟 KULLANICI KURALI: "bir parça için max 3 parça olsun"
            // Çizilen kenar uzunluğuna göre 1, 2 veya azami 3 panel oluşturulur.
            const naturalPanelWidth3D = baseMeshWidth * desiredScaleY * 2.5;
            const panelCount = Math.min(3, Math.max(1, Math.round(segLen / Math.max(60, naturalPanelWidth3D))));
            const stepX = dx / panelCount;
            const stepY = dy / panelCount;
            const subLen = segLen / panelCount;

            // X ölçeği subLen uzunluğunu uç uca tam kaplayacak şekilde hesaplanır
            const panelScaleX = subLen / baseMeshWidth;
            const panelScaleY = desiredScaleY;

            for (let k = 0; k < panelCount; k++) {
                const midX = p1.x + stepX * (k + 0.5);
                const midY = p1.y + stepY * (k + 0.5);

                segments.push({
                    posX: Math.round(midX),
                    posY: Math.round(midY),
                    scale: 1.0,
                    scaleX: panelScaleX,
                    scaleY: panelScaleY,
                    rot: Math.round(angleDeg)
                });
            }
        }

        if (segments.length === 0) return null;

        // 6. 3D Sahneye Çit Ögelerini Ekle
        const createdElements = [];
        const fenceGroupId = 'grp_fence_' + Date.now();

        for (let s of segments) {
            const el = await add3DEstateElement(item, {
                posX: s.posX,
                posY: s.posY,
                posZ: 0,
                planeScale: s.scale,
                scaleX: s.scaleX,
                scaleY: s.scaleY,
                planeLocalRot: s.rot,
                planePitch: 0,
                planeYaw: 0,
                planeRoll: 0,
                itemPitch: 0,
                orientation: 'flat',
                isBaseAligned: true,
                isFence: true,
                depth: 3,             // Gerçekçi ince tel çit kalınlığı
                bevelEnabled: false   // Tel çitlerde pah olmaz, düz ve net şeffaf kalır
            });
            if (el) {
                el.groupId = fenceGroupId;
                el.isFenceGroup = true;
                createdElements.push(el);
            }
        }

        // 6. Eski 2D Çizimi Kaldır
        if (domElement) {
            if (domElement.parentNode) domElement.remove();
            if (typeof drawPaths !== 'undefined' && Array.isArray(drawPaths)) {
                const idx = drawPaths.findIndex(p => p.el === domElement || (p.id && domElement.dataset && domElement.dataset.pathId === p.id));
                if (idx > -1) drawPaths.splice(idx, 1);
            }
            if (typeof redrawAll === 'function') redrawAll();
            if (typeof renderLayers === 'function') renderLayers();
        }

        // 7. Oluşturulan Çitleri Seç ve Grupla
        if (createdElements.length > 0) {
            state.groupEditMode = 'all'; // Birlikte düzenle modu varsayılan aktif
            if (window.ThreeDGrouping && typeof window.ThreeDGrouping.setSelected3DElements === 'function') {
                window.ThreeDGrouping.setSelected3DElements(createdElements);
            }
            const midIdx = Math.floor(createdElements.length / 2);
            setActiveElement(createdElements[midIdx]);
            syncControlsUI();
            requestRender();
            if (typeof window.showToast === 'function') {
                window.showToast(`${createdElements.length} adet 3D çit paneli birleşik olarak yerleştirildi!`, 'info');
            }
        }

        return createdElements;
    }

    /**
     * 15.5 Harici 3D GLB / GLTF Dosyası İçe Aktarma
     */
    async function loadGLBFile(file) {
        if (!file) return;
        await openStudio(true, false, false);

        if (!window.THREE) {
            await loadThreeLibraries();
        }

        if (!THREE.GLTFLoader) {
            try {
                await loadScript('./assets/vendor/GLTFLoader.js');
            } catch(e) {
                try {
                    await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js');
                } catch(err2) {
                    console.error('[ThreeDEngine] GLTFLoader yüklenemedi:', err2);
                    if (window.showToast) window.showToast('GLTFLoader yüklenemedi!', 'error');
                    return;
                }
            }
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const contents = e.target.result;
            const loader = new THREE.GLTFLoader();
            loader.parse(contents, '', (gltf) => {
                const rootModel = gltf.scene || gltf.scenes[0];
                if (!rootModel) return;

                // 1. Model içindeki tüm mesh'lerde gölge ve PBR materyal ayarlarını optimize et
                rootModel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        if (child.material) {
                            const mats = Array.isArray(child.material) ? child.material : [child.material];
                            mats.forEach(m => {
                                m.side = THREE.DoubleSide;
                                if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) {
                                    if (m.roughness === undefined || m.roughness < 0.35) m.roughness = 0.55;
                                    if (m.metalness !== undefined && m.metalness > 0.5) m.metalness = 0.25;
                                }
                            });
                        }
                    }
                });

                // 2. Ham model matrislerini sıfırla ve sınırları yalnızca gerçek mesh'ler üzerinden ölç
                rootModel.position.set(0, 0, 0);
                rootModel.rotation.set(0, 0, 0);
                rootModel.scale.set(1, 1, 1);
                rootModel.updateMatrixWorld(true);

                const rawBox = new THREE.Box3();
                let hasValidMesh = false;
                rootModel.traverse(node => {
                    if (node.isMesh && node.geometry) {
                        if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
                        const b = node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld);
                        rawBox.union(b);
                        hasValidMesh = true;
                    }
                });
                if (!hasValidMesh || rawBox.isEmpty()) {
                    rawBox.setFromObject(rootModel);
                }

                const rawSize = new THREE.Vector3();
                rawBox.getSize(rawSize);

                // 3. Orantılı 3D hedef boyutlandırma (sahneye ideal 220px uyum)
                const maxDim = Math.max(rawSize.x, rawSize.y, rawSize.z);
                const targetSize = 220;
                const autoScale = (maxDim > 0 && isFinite(maxDim)) ? (targetSize / maxDim) : 1.0;
                rootModel.scale.set(autoScale, autoScale, autoScale);
                rootModel.updateMatrixWorld(true);

                // 4. Ölçeklendirilmiş modelin gerçek mesh merkezini (centroid) hesapla
                const scaledBox = new THREE.Box3();
                let hasScaledMesh = false;
                rootModel.traverse(node => {
                    if (node.isMesh && node.geometry) {
                        node.geometry.computeBoundingBox();
                        const b = node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld);
                        scaledBox.union(b);
                        hasScaledMesh = true;
                    }
                });
                if (!hasScaledMesh || scaledBox.isEmpty()) {
                    scaledBox.setFromObject(rootModel);
                }
                const scaledCenter = new THREE.Vector3();
                scaledBox.getCenter(scaledCenter);
                const scaledSize = new THREE.Vector3();
                scaledBox.getSize(scaledSize);

                // 5. 🎯 KUSURSUZ GEOMETRİK MERKEZLEME (Centroid Centering):
                if (isFinite(scaledCenter.x) && isFinite(scaledCenter.y) && isFinite(scaledCenter.z)) {
                    rootModel.position.x = -scaledCenter.x;
                    rootModel.position.y = -scaledCenter.y;
                    rootModel.position.z = -scaledCenter.z;
                }
                rootModel.updateMatrixWorld(true);

                // 6. Özel Pivot Grubu ile sar (hiyerarşik koruma)
                const modelPivot = new THREE.Group();
                modelPivot.name = 'gltfPivotGroup';
                modelPivot.add(rootModel);

                // Otomatik oluşturulmuş boş varsayılan rozet varsa temizle
                if (elements.length === 1 && elements[0].isAutoDefault) {
                    delete3DElement(elements[0].id, true);
                }

                const cleanName = file.name.replace(/\.[^/.]+$/, "");
                const newEl = createDefaultElement({
                    name: cleanName,
                    sourceItemName: cleanName,
                    elementType: 'element_3d',
                    orientation: 'standing',
                    posX: 0,
                    posY: 0,
                    posZ: 0,
                    depth: Math.round(scaledSize.z) || 100,
                    planeScale: 1.0,
                    visible: true
                });

                initElementThreeObjects(newEl);
                newEl.customGltfModel = modelPivot;
                newEl.contentGroup.add(modelPivot);
                newEl._localBoundingBox = new THREE.Box3().setFromObject(modelPivot);
                newEl.frontColor = '#ffffff';
                newEl.sideColor = '#ffffff';

                modelPivot.traverse(node => {
                    if (node.isMesh && node.material) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                        const mats = Array.isArray(node.material) ? node.material : [node.material];
                        mats.forEach(m => {
                            if (!m._origColor && m.color) m._origColor = m.color.clone();
                            m.needsUpdate = true;
                        });
                    }
                });

                updateShadowPlaneGeometry(newEl);

                elements.push(newEl);
                setActiveElement(newEl);
                updateContentTransform(newEl);
                syncControlsUI();
                update3DLayersOrder();
                requestRender();

                if (typeof window.recordHistory === 'function') window.recordHistory('3D Model Yüklendi');
                if (typeof window.renderLayers === 'function') window.renderLayers();
            }, (error) => {
                console.error('[ThreeDEngine] GLTF çözümleme hatası:', error);
                if (window.showToast) window.showToast('3D Model yüklenemedi: ' + (error && error.message ? error.message : 'Uyumsuz dosya'), 'error');
            });
        };
        reader.readAsArrayBuffer(file);
    }

    // 🌟 DIŞA AÇILAN API (Public API)
    window.ThreeDEngine = {
        state: state,
        requestRender: requestRender,
        loadLibraries: loadThreeLibraries,
        openStudio: openStudio,
        closeStudio: closeStudio,
        showStudioPanel: showStudioPanel,
        openStudioPanel: showStudioPanel,
        applyPreset: applyPreset,
        autoCenter: autoCenterActiveElement,
        getExportContext: getExportContext,
        bakeToCanvas: bakeToCanvas,
        prepareForExport: prepareForExport,
        capture3DScreenshot: (fn) => (window.ThreeDExport ? window.ThreeDExport.capture3DScreenshot(fn) : null),
        delete3DElement: delete3DElement,
        clearAll3D: clearAll3D,
        clearScene: clearAll3D,
        getElements: () => elements,
        getCamera: () => camera,
        getElementsScreenBounds: getElementsScreenBounds,
        getActiveElementId: () => activeElementId,
        getActiveElement: getActiveElement,
        setActiveElement: setActiveElement,
        getElementDimensions: getElementEstimatedDimensions,
        selectElement: (id) => { setActiveElement(id); state.gizmoActive = true; setSelected(true); updateDock3DControlsState(); },
        updatePlaneTransform: updatePlaneTransform,
        updateContentTransform: updateContentTransform,
        recreateContentMeshes: recreateContentMeshes,
        syncControlsUI: syncControlsUI,
        update3DLayersOrder: update3DLayersOrder,
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
        updateDockControls: updateDock3DControlsState,
        toggleCornerPin: toggleCornerPinMode,
        toggleGizmo: toggleGizmoMode,
        isGizmoActive: () => !!state.gizmoActive,
        updateGizmo: updateGizmoPositions,
        updateGizmoPositions: updateGizmoPositions,
        setGizmoScale: (s) => { state.gizmoScale = parseFloat(s) || 1.0; updateGizmoPositions(); syncControlsUI(); },
        setGizmoAutoFit: (af) => { state.gizmoAutoFit = !!af; updateGizmoPositions(); syncControlsUI(); },
        setGizmoDistance: (d) => { state.gizmoDistance = parseInt(d) || 75; updateGizmoPositions(); syncControlsUI(); },
        setGizmoOpacity: (op) => { state.gizmoOpacity = parseFloat(op) || 1.0; updateGizmoPositions(); syncControlsUI(); },
        getCanvas: () => canvasEl,
        isLayerActive: () => (canvasEl && canvasEl.style.display !== 'none'),
        getDataToSave: getDataToSave,
        restoreData: restoreData,
        convert2DBadgeTo3D: convert2DBadgeTo3D,
        add3DText: add3DText,
        add3DElementFromData: add3DElementFromData,
        add3DEstateElement: add3DEstateElement,
        setElementEstateStyle: setElementEstateStyle,
        convertLineTo3DFence: convertLineTo3DFence,
        loadGLBFile: loadGLBFile,
        add3DIcon: (svg, name, opts) => add3DElementFromData(Object.assign({ svg: svg, name: name, elementType: 'element_3d' }, opts)),
        openIconPicker: openIconPicker,
        getActiveElement: getActiveElement,
        updateElementSelectorUI: updateElementSelectorUI,
        setShapeMode: setElementShapeMode,
        setBadgeBgColor: (c) => { state.badgeBgColor = c; const el = getActiveElement(); if (el) el.badgeBgColor = c; updateElementColorsFast(el); syncControlsUI(); },
        setBadgeSubtext: (s) => { state.badgeSubtext = s; recreateContentMeshes(); syncControlsUI(); },
        setSelectedIcon: (id) => { state.selectedIconId = id; recreateContentMeshes(); syncControlsUI(); },
        openContextMenu: open3DElementContextMenu,
        checkHit: check3DHit,
        bringElementForward: bring3DElementForward,
        sendElementBackward: send3DElementBackward,
        bringElementToFront: bring3DElementToFront,
        sendElementToBack: send3DElementToBack,
        duplicateElement: duplicate3DElement,
        duplicate3DElement: duplicate3DElement,
        deleteElement: delete3DElement,
        delete3DElement: delete3DElement,
        alignElement: align3DElement,
        align3DElement: align3DElement,

        // Canlı Parametre Güncelleyiciler
        setElementType: (t) => { state.elementType = t; recreateContentMeshes(); syncControlsUI(); },
        setText: (t) => { state.text = t; recreateContentMeshes(); },
        setSize: (s) => { state.textSize = parseInt(s) || 36; recreateContentMeshes(); },
        setDepth: (d) => { state.depth = parseInt(d) || 16; recreateContentMeshes(); },
        setBevel: (b) => { state.bevelEnabled = !!b; recreateContentMeshes(); },
        setFrontColor: (c) => {
            state.frontColor = c;
            const el = getActiveElement();
            const isGroupAll = (state.groupEditMode === 'all');
            const pair = getSurfacePair();
            if (isGroupAll && pair) {
                pair.baseEl.frontColor = c;
                pair.childEl.frontColor = c;
                if (state.text3DMode !== 'separate') {
                    pair.childEl.text3DColor = c;
                }
                updateElementColorsFast(pair.baseEl, { onlyFront: true });
                updateElementColorsFast(pair.childEl, { onlyFront: true });
            } else if (el) {
                el.frontColor = c;
                if (state.text3DMode !== 'separate') {
                    el.text3DColor = c;
                }
                updateElementColorsFast(el, { onlyFront: true });
            }
        },
        setSideColor: (c) => {
            state.sideColor = c;
            const el = getActiveElement();
            const isGroupAll = (state.groupEditMode === 'all');
            const pair = getSurfacePair();
            if (isGroupAll && pair) {
                pair.baseEl.sideColor = c;
                pair.childEl.sideColor = c;
                updateElementColorsFast(pair.baseEl, { onlySide: true });
                updateElementColorsFast(pair.childEl, { onlySide: true });
            } else if (el) {
                el.sideColor = c;
                updateElementColorsFast(el, { onlySide: true });
            }
        },
        setUseGradient: (val) => {
            const b = !!val;
            state.useGradient = b;
            const el = getActiveElement();
            const isGroupAll = (state.groupEditMode === 'all');
            const pair = getSurfacePair();
            if (isGroupAll && pair) {
                pair.baseEl.useGradient = b;
                pair.childEl.useGradient = b;
                updateElementColorsFast(pair.baseEl);
                updateElementColorsFast(pair.childEl);
            } else if (el) {
                el.useGradient = b;
                updateElementColorsFast(el);
            }
            syncControlsUI();
            requestRender();
        },
        setPitch: (p) => { state.planePitch = parseFloat(p) || 0; updatePlaneTransform(); requestRender(); },
        setYaw: (y) => { state.planeYaw = parseFloat(y) || 0; updatePlaneTransform(); requestRender(); },
        setRoll: (r) => { state.planeRoll = parseFloat(r) || 0; updatePlaneTransform(); requestRender(); },
        setScale: (s) => {
            const oldScale = state.planeScale || 1.0;
            state.planeScale = (parseFloat(s) || 100) / 100;
            if (Math.abs(state.planeScale - oldScale) > 0.001 && window.ThreeDGrouping && typeof window.ThreeDGrouping.propagateScaleDelta === 'function') {
                window.ThreeDGrouping.propagateScaleDelta(getActiveElement(), state.planeScale, oldScale);
            }
            updatePlaneTransform();
            requestRender();
        },
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
        setShadowOpacity: (o) => { state.shadowOpacity = (parseFloat(o) || 20) / 100; updatePlaneTransform(); requestRender(); },
        setShadowSoftness: (s) => { state.shadowSoftness = parseFloat(s) || 2.5; syncActiveElementFromState(); updateLighting(); syncControlsUI(); requestRender(); },
        toggleGrid: (show) => { 
            state.showPlaneGrid = (show !== undefined) ? !!show : !state.showPlaneGrid;
            if (gridHelper) gridHelper.visible = !!state.selected && state.showPlaneGrid;
            requestRender();
        },
        getGroupEditMode: () => state.groupEditMode || 'all',
        setGroupEditMode: (m) => {
            state.groupEditMode = m || 'all';
            syncControlsUI();
            updateElementSelectorUI();
            requestRender();
        },
        setNeonColor: (c) => {
            state.neonColor = c;
            const el = getActiveElement();
            if (el) {
                el.neonColor = c;
                updateNeonEffect(el);
            }
            syncControlsUI();
        },
        setNeonFrontIntensity: (val) => {
            const num = parseInt(val, 10) || 0;
            state.neonFrontIntensity = num;
            const el = getActiveElement();
            if (el) {
                el.neonFrontIntensity = num;
                updateNeonEffect(el);
            }
            syncControlsUI();
        },
        setNeonEdgeIntensity: (val) => {
            const num = parseInt(val, 10) || 0;
            state.neonEdgeIntensity = num;
            state.neonEdgeGlow = (num > 0);
            const el = getActiveElement();
            if (el) {
                el.neonEdgeIntensity = num;
                el.neonEdgeGlow = (num > 0);
                updateNeonEffect(el);
            }
            syncControlsUI();
        },
        setNeonPreset: (p) => {
            state.neonPreset = p || 'fully-lit';
            const el = getActiveElement();
            if (el) {
                el.neonPreset = state.neonPreset;
                updateNeonEffect(el);
            }
            syncControlsUI();
        }
    };

})(window);
