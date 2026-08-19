// ==================== CANVAS CORE ====================
window.getCurrentPhotoState = function() {
    const pl = typeof getActiveV4Element === 'function' ? getActiveV4Element() : null;
    const sx = parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50);
    const sy = parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50);
    
    const container = document.getElementById('canvas-container');
    const defaultW = container ? (parseInt(container.style.width) || 1920) : 1920;
    const defaultH = container ? (parseInt(container.style.height) || 1080) : 1080;

    const pb = typeof getActivePhotoPanel === 'function' ? getActivePhotoPanel() : null;
    const pW = pb ? pb.w : defaultW;
    const pH = pb ? pb.h : defaultH;
    const pL = pb ? (pb.left !== undefined ? pb.left : (pb.x || 0)) : 0;
    const pT = pb ? (pb.top !== undefined ? pb.top : (pb.y || 0)) : 0;

    const isV4 = (pl && pl.dataset.zpReady === '1') || (typeof isCanvaMode !== 'undefined' && isCanvaMode);

    if (isV4 && pl) {
        return {
            v4: true,
            z: parseFloat(pl.dataset.zpScale) || 1,
            px: parseFloat(pl.dataset.zpX) || 0,
            py: parseFloat(pl.dataset.zpY) || 0,
            panelW: pW,
            panelH: pH,
            panelL: pL,
            panelT: pT,
            sliderX: sx,
            sliderY: sy
        };
    } else {
        const pLayer = document.getElementById('photo-layer');
        return {
            v4: false,
            z: parseInt(document.getElementById('photoZoomCtrl') ? document.getElementById('photoZoomCtrl').value : 100),
            px: sx,
            py: sy,
            panelW: pW,
            panelH: pH,
            panelL: pL,
            panelT: pT,
            sliderX: sx,
            sliderY: sy,
            extraZ: (pLayer && pLayer.dataset.zpReady === '1') ? (parseFloat(pLayer.dataset.zpScale) || 1) : 1,
            extraPx: (pLayer && pLayer.dataset.zpReady === '1') ? (parseFloat(pLayer.dataset.zpX) || 0) : 0,
            extraPy: (pLayer && pLayer.dataset.zpReady === '1') ? (parseFloat(pLayer.dataset.zpY) || 0) : 0
        };
    }
}

function resizeCanvas(){
    const w = document.querySelector('.canvas-wrapper');
    const pa = document.querySelector('.preview-area');
    if (!w || !pa) return;
    
    let canvasW = 1920;
    let canvasH = 1080;
    
    const formatSelect = document.getElementById('previewFormat');
    let hasImage = typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl && typeof uploadedImgW !== 'undefined' && uploadedImgW > 0;

    if (!hasImage && window.isMobileDevice() && !window.userHasManuallyChangedFormat) {
        const isLand = window.innerWidth > window.innerHeight;
        
        // Cihaz yönüne göre varsayılan formatı otomatik seç (Dikey için daha geniş 4:5 Instagram Portrait)
        if (formatSelect) {
            const targetFormat = isLand ? '16:9 Full HD (YouTube/Banner)' : '4:5 Instagram Portrait';
            if (formatSelect.value !== targetFormat) {
                formatSelect.value = targetFormat;
                const exportSelect = document.getElementById('exportFormat');
                if(exportSelect) exportSelect.value = targetFormat;
            }
        }

        canvasW = isLand ? 1920 : 1080;
        canvasH = isLand ? 1080 : 1350;
    } else if (hasImage && window.isMobileDevice()) {
        // [MOBİL] Canvas oranı yüklenen görselin orijinal oranını korur
        canvasW = uploadedImgW;
        canvasH = uploadedImgH;
    } else if (formatSelect && typeof EXPORT_FORMATS !== 'undefined' && EXPORT_FORMATS[formatSelect.value]) {
        canvasW = EXPORT_FORMATS[formatSelect.value].w;
        canvasH = EXPORT_FORMATS[formatSelect.value].h;
    } else if (hasImage) {
        canvasW = uploadedImgW;
        canvasH = uploadedImgH;
    }
    
    if (typeof canvasEl !== 'undefined' && canvasEl) {
        canvasEl.style.width = canvasW + 'px';
        canvasEl.style.height = canvasH + 'px';
    }
    const drawLayerEl = document.getElementById('draw-layer');
    if (drawLayerEl && (drawLayerEl.width !== canvasW || drawLayerEl.height !== canvasH)) {
        drawLayerEl.width = canvasW;
        drawLayerEl.height = canvasH;
        drawLayerEl.style.width = canvasW + 'px';
        drawLayerEl.style.height = canvasH + 'px';
        if (typeof redrawAll === 'function') redrawAll();
    }
    
    const isMob = typeof window.isMobileDevice === 'function' ? window.isMobileDevice() : window.innerWidth <= 768;
    const isLand = isMob && window.innerWidth > window.innerHeight;
    const availableW = isMob ? (isLand ? window.innerWidth - 40 : window.innerWidth) : (pa.clientWidth || window.innerWidth);
    let availableH = isMob ? (isLand ? window.innerHeight - 40 : (window.innerHeight - 135)) : (window.innerHeight - 150);
    
    const scaleW = availableW / canvasW;
    const scaleH = availableH / canvasH;
    
    // Mobilde dikey modda yatay/kare görseller için genişliği tam %100 ekrana oturt (yanlardaki boşlukları sıfırla)
    if (isMob && !isLand && canvasW >= canvasH) {
        scaleFactor = scaleW;
    } else {
        scaleFactor = Math.min(scaleW, scaleH);
    }
    window.scaleFactor = scaleFactor;
    
    w.style.width = (canvasW * scaleFactor) + 'px';
    w.style.height = (canvasH * scaleFactor) + 'px';
    w.style.aspectRatio = 'auto';
    
    if(typeof canvasEl !== 'undefined' && canvasEl) {
        canvasEl.style.transformOrigin = 'top left';
        canvasEl.style.transform = 'scale(' + scaleFactor + ')';
    }

    // Dinamik Handle Boyutlandırma (Görsel varken ikon/callout butonlarının küçülmesini engeller)
    let hScale = 1;
    if (scaleFactor > 0 && scaleFactor < 1) {
        // Masaüstü için net 1:1 boyut (ekranda 22px sabit kalır, devasa büyümez)
        // Mobil için hafifçe büyütülür (1.2x)
        const baseMultiplier = isMob ? 1.2 : 0.95;
        hScale = Math.min(isMob ? 2.8 : 2.0, (1 / scaleFactor) * baseMultiplier);
    } else if (isMob) {
        hScale = 1.15;
    }
    document.documentElement.style.setProperty('--handle-scale', hScale);
}

function applyStylePos(el,c){
    if(!el || !c) return;
    el.style.top='';
    el.style.bottom='';
    el.style.left='';
    el.style.right='';
    el.style.width='';
    el.style.height='';
    el.style.transform='';
    
    // Canvas gerçek piksel çözünürlüğü (1920x1080, 3840x2160, 1200x630, 2480x3508 vb.)
    const canvasContainer = document.getElementById('canvas-container');
    const cW = canvasContainer ? (parseInt(canvasContainer.style.width) || canvasContainer.offsetWidth || 1920) : 1920;
    const cH = canvasContainer ? (parseInt(canvasContainer.style.height) || canvasContainer.offsetHeight || 1080) : 1080;
    const baseW = 1920;
    const baseH = 1080;
    const aspect = cW / cH;

    // Gerçek çözünürlük ölçeği (Resolution-based Scaling)
    let resScale = 1.0;
    if (aspect >= 1.6) {
        // Yatay Geniş (16:9, 4K 3840x2160, 1200x630 vb.)
        resScale = cH / baseH;
    } else if (aspect >= 1.2) {
        // Orta Yatay (3:2 1200x800, 4:3 1600x1200, A4 Yatay 3508x2480 vb.)
        resScale = (cW / baseW) * 0.40 + (cH / baseH) * 0.48;
    } else if (aspect >= 0.85) {
        // Kare / Yakın Kare (1:1 1080x1080, 1920x1920, 4:5 1080x1350 vb.)
        resScale = (cW / baseW) * 1.20;
    } else {
        // Dikey / Story / A4 Dikey (9:16 1080x1920, A4 Dikey 2480x3508 vb.)
        resScale = (cW / baseW) * 1.15;
    }

    // Dengeli ve zarif 1.18x baz çarpan
    const finalScale = resScale * 1.18;

    // Koordinatları formata göre oranla
    if(c.top!==undefined) {
        let val = typeof c.top==='number' ? c.top : parseFloat(c.top);
        if(typeof c.top === 'number') val = Math.round(val * (cH / baseH));
        el.style.top = val + 'px';
    }
    if(c.bottom!==undefined) {
        let val = typeof c.bottom==='number' ? c.bottom : parseFloat(c.bottom);
        if(typeof c.bottom === 'number') val = Math.round(val * (cH / baseH));
        el.style.bottom = val + 'px';
    }
    if(c.left!==undefined) {
        let val = typeof c.left==='number' ? c.left : parseFloat(c.left);
        if(typeof c.left === 'number') val = Math.round(val * (cW / baseW));
        el.style.left = val + 'px';
    }
    if(c.right!==undefined) {
        let val = typeof c.right==='number' ? c.right : parseFloat(c.right);
        if(typeof c.right === 'number') val = Math.round(val * (cW / baseW));
        el.style.right = val + 'px';
    }
    
    if(c.transform) el.style.transform = c.transform;
    if(c.bg) el.style.background = c.bg;
    if(c.color) el.style.color = c.color;
    if(c.radius!==undefined) {
        el.style.borderRadius = Math.max(2, Math.round(c.radius * (finalScale / 1.18))) + 'px';
    }
    if(c.border) el.style.border = c.border;
    
    // Padding'i format oranına göre ölçekle
    if(c.padding) {
        const scaledPadding = c.padding.replace(/(\d+(\.\d+)?)px/g, (match, num) => {
            return Math.max(4, Math.round(parseFloat(num) * (finalScale / 1.18))) + 'px';
        });
        el.style.padding = scaledPadding;
    }
    
    // FONT VE TİPOGRAFİ ÖZELLİKLERİ (EKSİKSİZ UYGULA)
    if(c.fontSize) {
        let rawSize = typeof c.fontSize === 'number' ? c.fontSize : parseFloat(c.fontSize);
        let finalFontSize = Math.max(11, Math.round(rawSize * finalScale));
        el.style.fontSize = finalFontSize + 'px';
        el.dataset.defaultFont = finalFontSize.toString();
    }
    if(c.fontFamily) el.style.fontFamily = c.fontFamily;
    if(c.fontWeight) el.style.fontWeight = c.fontWeight;
    if(c.letterSpacing) el.style.letterSpacing = c.letterSpacing;
    if(c.lineHeight) el.style.lineHeight = c.lineHeight;
    if(c.boxShadow) el.style.boxShadow = c.boxShadow;
    if(c.textShadow) el.style.textShadow = c.textShadow;
    if(c.backdropFilter) {
        el.style.backdropFilter = c.backdropFilter;
        el.style.webkitBackdropFilter = c.backdropFilter;
    }
    
    el.dataset.storedBgHex='#0f172a';
    el.dataset.storedBgOpacity='85';
    el.dataset.rotation='0';
    el.dataset.shadowVal='0';
    el.dataset.blurVal='0';
    el.dataset.storedBorderColor='#38bdf8';
    el.dataset.storedBorderWidth='0';
}

function calculateTransformParams(ref, curr) {
    if(!ref || !curr) return { scale: 1, dx: 0, dy: 0, v4: false };
    
    let imgW = typeof uploadedImgW !== 'undefined' ? uploadedImgW : 1920;
    let imgH = typeof uploadedImgH !== 'undefined' ? uploadedImgH : 1080;
    
    function getMetricsForState(s) {
        let AbsCX, AbsCY, TotalScale;
        let pW = s.panelW || 1920;
        let pH = s.panelH || 1080;
        let pL = s.panelL || 0;
        let pT = s.panelT || 0;
        let sX = s.sliderX !== undefined ? s.sliderX : 50;
        let sY = s.sliderY !== undefined ? s.sliderY : 50;
        
        if (s.v4) {
            let coverScale = Math.max(pW / imgW, pH / imgH);
            TotalScale = coverScale * s.z;
            
            // Calculate base offset due to background-position
            let offsetX = pW / 2 - (imgW * coverScale) / 2;
            let offsetY = pH / 2 - (imgH * coverScale) / 2;
            if (imgW * coverScale > pW) {
                offsetX = (pW - imgW * coverScale) * (sX / 100);
            }
            if (imgH * coverScale > pH) {
                offsetY = (pH - imgH * coverScale) * (sY / 100);
            }
            
            let BaseLocalCX = offsetX + (imgW * coverScale) / 2;
            let BaseLocalCY = offsetY + (imgH * coverScale) / 2;
            
            // Apply scale distance transform
            let DistX = BaseLocalCX - pW / 2;
            let DistY = BaseLocalCY - pH / 2;
            
            let ScaledLocalCX = pW / 2 + DistX * s.z;
            let ScaledLocalCY = pH / 2 + DistY * s.z;
            
            // Apply translation (scaled by z since it's a DOM transform)
            AbsCX = ScaledLocalCX + s.px * s.z + pL;
            AbsCY = ScaledLocalCY + s.py * s.z + pT;
        } else {
            let coverScale = Math.max(pW / imgW, pH / imgH);
            if (s.z != 100) coverScale = (pW * (s.z / 100)) / imgW;
            TotalScale = coverScale * (s.extraZ || 1);
            
            let offsetX = pW / 2 - (imgW * coverScale) / 2;
            let offsetY = pH / 2 - (imgH * coverScale) / 2;
            if (imgW * coverScale > pW) {
                offsetX = (pW - imgW * coverScale) * (s.px / 100);
            }
            if (imgH * coverScale > pH) {
                offsetY = (pH - imgH * coverScale) * (s.py / 100);
            }
            let BaseLocalCX = offsetX + (imgW * coverScale) / 2;
            let BaseLocalCY = offsetY + (imgH * coverScale) / 2;
            
            let DistX = BaseLocalCX - pW / 2;
            let DistY = BaseLocalCY - pH / 2;
            
            let ScaledLocalCX = pW / 2 + DistX * (s.extraZ || 1);
            let ScaledLocalCY = pH / 2 + DistY * (s.extraZ || 1);
            
            AbsCX = ScaledLocalCX + (s.extraPx || 0) * (s.extraZ || 1) + pL;
            AbsCY = ScaledLocalCY + (s.extraPy || 0) * (s.extraZ || 1) + pT;
        }
        return { AbsCX, AbsCY, TotalScale };
    }
    
    let m1 = getMetricsForState(ref);
    let m2 = getMetricsForState(curr);
    
    let relScale = m1.TotalScale === 0 ? 1 : m2.TotalScale / m1.TotalScale;
    let dx = m2.AbsCX - m1.AbsCX * relScale;
    let dy = m2.AbsCY - m1.AbsCY * relScale;
    
    return { scale: relScale, dx: dx, dy: dy, v4: curr.v4 };
}

// ==================== CANVAS BOTTOM DOCK CONTROLLER ====================
window.updateDockLockUI = function(isLocked) {
    const dockBtn = document.getElementById('dockLockBtn');
    const dockIcon = document.getElementById('dockLockIcon');
    const dockText = document.getElementById('dockLockText');
    if (!dockBtn) return;

    if (isLocked) {
        dockBtn.className = 'dock-btn lock-active';
        if (dockIcon) dockIcon.innerText = '📌';
        if (dockText) dockText.innerText = 'Görüntü Sabit';
        dockBtn.title = 'Görüntü sabitlendi (Tıklayarak serbest bırakın)';
    } else {
        dockBtn.className = 'dock-btn lock-unlocked';
        if (dockIcon) dockIcon.innerText = '🔓';
        if (dockText) dockText.innerText = 'Görüntü Serbest';
        dockBtn.title = 'Görüntü serbest (Fotoğrafı sürükleyip ölçekleyebilirsiniz)';
    }
};

window.togglePhotoLockFromDock = function() {
    const newState = !window.isPhotoLocked;
    if (typeof window.updatePhotoLockState === 'function') {
        window.updatePhotoLockState(newState);
    } else {
        window.isPhotoLocked = newState;
    }
    window.updateDockLockUI(newState);
};

window.quickSetFormat = function(formatKey) {
    window.userHasManuallyChangedFormat = true;
    const exp = document.getElementById('exportFormat');
    const prv = document.getElementById('previewFormat');
    if (exp) exp.value = formatKey;
    if (prv) prv.value = formatKey;
    if (typeof switchPreviewFormat === 'function') switchPreviewFormat();
    
    // Dock format butonlarının aktiflik durumunu güncelle
    document.querySelectorAll('.dock-pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.format === formatKey);
    });
};

window.resetCanvasZoomAndPan = function() {
    if (typeof window.resetCanvasZoom === 'function') {
        window.resetCanvasZoom();
    }
    const xCtrl = document.getElementById('photoXCtrl');
    const yCtrl = document.getElementById('photoYCtrl');
    const zoomCtrl = document.getElementById('photoZoomCtrl');
    if (xCtrl) xCtrl.value = 50;
    if (yCtrl) yCtrl.value = 50;
    if (zoomCtrl) zoomCtrl.value = 100;
    if (typeof applyPhotoPos === 'function') applyPhotoPos();
    if (typeof redrawAll === 'function') redrawAll();
};

window.rotateBackgroundPhoto = function(direction = 90) {
    let currentUrl = (typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl) ? uploadedImgUrl : '';
    if (!currentUrl) {
        const pl = document.getElementById('photo-layer');
        if (pl && pl.style.backgroundImage && pl.style.backgroundImage !== 'none') {
            currentUrl = pl.style.backgroundImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        }
    }
    
    if (!currentUrl || currentUrl === 'none') {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'info',
                title: 'Fotoğraf Yok',
                text: 'Döndürmek için lütfen önce bir fotoğraf yükleyin.',
                timer: 2000,
                showConfirmButton: false,
                background: '#1e293b',
                color: '#fff'
            });
        } else {
            alert('Lütfen önce bir fotoğraf yükleyin!');
        }
        return;
    }

    const img = new Image();
    if (currentUrl.startsWith('http')) img.crossOrigin = 'anonymous';
    img.onload = function() {
        const offCanvas = document.createElement('canvas');
        const ctx = offCanvas.getContext('2d');
        
        const normAngle = ((direction % 360) + 360) % 360;
        const isSwapped = (normAngle === 90 || normAngle === 270);
        
        const srcW = img.naturalWidth || img.width;
        const srcH = img.naturalHeight || img.height;
        
        offCanvas.width = isSwapped ? srcH : srcW;
        offCanvas.height = isSwapped ? srcW : srcH;
        
        ctx.translate(offCanvas.width / 2, offCanvas.height / 2);
        ctx.rotate((normAngle * Math.PI) / 180);
        ctx.drawImage(img, -srcW / 2, -srcH / 2);
        
        const rotatedDataUrl = offCanvas.toDataURL('image/jpeg', 0.95);
        
        uploadedImgUrl = rotatedDataUrl;
        if (typeof masterImg !== 'undefined' && masterImg) {
            masterImg.src = rotatedDataUrl;
        }
        window._globalNativeImgSrc = rotatedDataUrl;
        window._globalNativeImg = null;

        const pl = document.getElementById('photo-layer');
        if (pl) {
            pl.style.backgroundImage = 'url("' + rotatedDataUrl + '")';
            pl._nativeImg = null;
            pl._nativeImgSrc = null;
        }
        document.querySelectorAll('.photo-inner-zoom').forEach(iz => {
            iz.style.backgroundImage = 'url("' + rotatedDataUrl + '")';
        });
        document.querySelectorAll('.photo-panel').forEach(p => {
            p.style.backgroundImage = 'url("' + rotatedDataUrl + '")';
            p._nativeImg = null;
            p._nativeImgSrc = null;
        });

        if (typeof cacheOriginalImageForPixels === 'function') {
            cacheOriginalImageForPixels();
        }
        
        document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => {
            if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p);
        });
        if (typeof applyPhotoFilters === 'function') applyPhotoFilters();
        if (typeof processPixels === 'function') processPixels(true);
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
    };
    img.src = currentUrl;
};

// ==================== ADVANCED CANVAS GRID SYSTEM ====================
const DEFAULT_GRID_SETTINGS = {
    type: 'all',          // 'all', 'thirds', 'square', 'center', 'golden'
    lineStyle: 'dashed',  // 'solid', 'dashed', 'dotted'
    thickness: 4,         // 1 - 25 px
    opacity: 80,          // 10 - 100 %
    color: '#38bdf8',     // Hex
    cellSize: 80          // 40 - 160 px
};

window.getGridSettings = function() {
    try {
        const saved = localStorage.getItem('emlakstudiom_gridSettings');
        if (saved) {
            return Object.assign({}, DEFAULT_GRID_SETTINGS, JSON.parse(saved));
        }
    } catch (e) {}
    return Object.assign({}, DEFAULT_GRID_SETTINGS);
};

window.saveGridSettings = function(settings) {
    try {
        localStorage.setItem('emlakstudiom_gridSettings', JSON.stringify(settings));
    } catch (e) {}
};

window.renderCanvasGridOverlay = function() {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    
    let grid = document.getElementById('canvasGridOverlay');
    if (!grid) {
        grid = document.createElement('div');
        grid.id = 'canvasGridOverlay';
        grid.className = 'canvas-grid-overlay';
        container.appendChild(grid);
    }
    
    const s = window.getGridSettings();
    const cW = parseInt(container.style.width) || container.offsetWidth || 1920;
    const cH = parseInt(container.style.height) || container.offsetHeight || 1080;

    let strokeDash = 'none';
    if (s.lineStyle === 'dashed') {
        strokeDash = `${s.thickness * 4} ${s.thickness * 3}`;
    } else if (s.lineStyle === 'dotted') {
        strokeDash = `${s.thickness} ${s.thickness * 2}`;
    }

    grid.style.opacity = (s.opacity / 100).toString();
    grid.style.borderColor = s.color;
    grid.style.borderWidth = s.thickness + 'px';
    grid.style.borderStyle = s.lineStyle;

    let svgContent = `<svg width="100%" height="100%" viewBox="0 0 ${cW} ${cH}" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;">
        <defs>
            <filter id="gridDropShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="0" stdDeviation="1" flood-color="#000000" flood-opacity="0.85"/>
            </filter>
            <pattern id="gridPatternCell" width="${s.cellSize}" height="${s.cellSize}" patternUnits="userSpaceOnUse">
                <path d="M ${s.cellSize} 0 L 0 0 0 ${s.cellSize}" fill="none" stroke="${s.color}" stroke-width="${Math.max(1, Math.round(s.thickness * 0.75))}" stroke-dasharray="${strokeDash}" opacity="0.65"/>
            </pattern>
        </defs>`;

    // 1. Square Grid Pattern
    if (s.type === 'square' || s.type === 'all') {
        svgContent += `<rect width="${cW}" height="${cH}" fill="url(#gridPatternCell)" filter="url(#gridDropShadow)"/>`;
    }

    // 2. Rule of Thirds
    if (s.type === 'thirds' || s.type === 'all') {
        const x1 = cW * 0.333333;
        const x2 = cW * 0.666667;
        const y1 = cH * 0.333333;
        const y2 = cH * 0.666667;
        const pointRadius = Math.min(18, Math.max(3, s.thickness * 1.8 + 2));

        svgContent += `
            <g stroke="${s.color}" stroke-width="${s.thickness}" stroke-dasharray="${strokeDash}" filter="url(#gridDropShadow)">
                <line x1="${x1}" y1="0" x2="${x1}" y2="${cH}" />
                <line x1="${x2}" y1="0" x2="${x2}" y2="${cH}" />
                <line x1="0" y1="${y1}" x2="${cW}" y2="${y1}" />
                <line x1="0" y1="${y2}" x2="${cW}" y2="${y2}" />
            </g>
            <g fill="${s.color}" filter="url(#gridDropShadow)">
                <circle cx="${x1}" cy="${y1}" r="${pointRadius}" />
                <circle cx="${x2}" cy="${y1}" r="${pointRadius}" />
                <circle cx="${x1}" cy="${y2}" r="${pointRadius}" />
                <circle cx="${x2}" cy="${y2}" r="${pointRadius}" />
            </g>
        `;
    }

    // 3. Golden Ratio
    if (s.type === 'golden') {
        const gx1 = cW * 0.382;
        const gx2 = cW * 0.618;
        const gy1 = cH * 0.382;
        const gy2 = cH * 0.618;

        svgContent += `
            <g stroke="${s.color}" stroke-width="${s.thickness}" stroke-dasharray="${strokeDash}" filter="url(#gridDropShadow)">
                <line x1="${gx1}" y1="0" x2="${gx1}" y2="${cH}" />
                <line x1="${gx2}" y1="0" x2="${gx2}" y2="${cH}" />
                <line x1="0" y1="${gy1}" x2="${cW}" y2="${gy1}" />
                <line x1="0" y1="${gy2}" x2="${cW}" y2="${gy2}" />
            </g>
        `;
    }

    // 4. Center Crosshair
    if (s.type === 'center' || s.type === 'all') {
        const cx = cW / 2;
        const cy = cH / 2;
        const centerColor = (s.type === 'all') ? '#facc15' : s.color;
        const centerRadius = Math.min(24, Math.max(4, s.thickness * 2.2 + 3));

        svgContent += `
            <g stroke="${centerColor}" stroke-width="${s.thickness}" stroke-dasharray="${s.lineStyle === 'solid' ? 'none' : '4 4'}" filter="url(#gridDropShadow)">
                <line x1="${cx}" y1="0" x2="${cx}" y2="${cH}" />
                <line x1="0" y1="${cy}" x2="${cW}" y2="${cy}" />
            </g>
            <circle cx="${cx}" cy="${cy}" r="${centerRadius}" fill="none" stroke="${centerColor}" stroke-width="${Math.max(1, Math.round(s.thickness * 0.8))}" />
        `;
    }

    svgContent += `</svg>`;
    grid.innerHTML = svgContent;
};

window.toggleCanvasGrid = function() {
    let grid = document.getElementById('canvasGridOverlay');
    const container = document.getElementById('canvas-container');
    if (!container) return;

    if (!grid) {
        window.renderCanvasGridOverlay();
        grid = document.getElementById('canvasGridOverlay');
        grid.style.display = 'block';
    } else {
        const isCurrentlyHidden = (grid.style.display === 'none' || getComputedStyle(grid).display === 'none');
        if (isCurrentlyHidden) {
            window.renderCanvasGridOverlay();
            grid.style.display = 'block';
        } else {
            grid.style.display = 'none';
        }
    }
    
    const isVisible = (grid.style.display !== 'none');
    const btn = document.getElementById('dockGridBtn');
    if (btn) {
        btn.classList.toggle('active', isVisible);
    }
};

window.openGridSettingsPopover = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    let popover = document.getElementById('gridSettingsPopover');
    if (!popover) return;

    // Grid'i otomatik aç
    let grid = document.getElementById('canvasGridOverlay');
    if (!grid || grid.style.display === 'none') {
        window.toggleCanvasGrid();
    }

    // UI Inputlarını Güncel Ayarlarla Senkronize Et
    const s = window.getGridSettings();

    // Type pills
    document.querySelectorAll('#gridTypeGroup .popover-pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.gridType === s.type);
    });

    // Style pills
    document.querySelectorAll('#gridStyleGroup .popover-pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.gridStyle === s.lineStyle);
    });

    // Sliders & Badges
    const thickInput = document.getElementById('gridThicknessInput');
    if (thickInput) thickInput.value = s.thickness;
    const thickVal = document.getElementById('gridThicknessVal');
    if (thickVal) thickVal.textContent = s.thickness + 'px';

    const opInput = document.getElementById('gridOpacityInput');
    if (opInput) opInput.value = s.opacity;
    const opVal = document.getElementById('gridOpacityVal');
    if (opVal) opVal.textContent = s.opacity + '%';

    const cellInput = document.getElementById('gridCellSizeInput');
    if (cellInput) cellInput.value = s.cellSize;
    const cellVal = document.getElementById('gridCellSizeVal');
    if (cellVal) cellVal.textContent = s.cellSize + 'px';

    // Color dots
    document.querySelectorAll('.grid-color-dot').forEach(dot => {
        dot.classList.toggle('active', dot.dataset.color.toLowerCase() === s.color.toLowerCase());
    });
    const customColor = document.getElementById('gridCustomColorInput');
    if (customColor) customColor.value = s.color;

    // Popover'ı göster
    popover.style.display = 'block';
};

window.closeGridSettingsPopover = function() {
    const popover = document.getElementById('gridSettingsPopover');
    if (popover) popover.style.display = 'none';
};

window.setGridType = function(type) {
    const s = window.getGridSettings();
    s.type = type;
    window.saveGridSettings(s);
    document.querySelectorAll('#gridTypeGroup .popover-pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.gridType === type);
    });
    window.renderCanvasGridOverlay();
};

window.setGridLineStyle = function(style) {
    const s = window.getGridSettings();
    s.lineStyle = style;
    window.saveGridSettings(s);
    document.querySelectorAll('#gridStyleGroup .popover-pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.gridStyle === style);
    });
    window.renderCanvasGridOverlay();
};

window.updateGridThickness = function(val) {
    val = parseInt(val) || 2;
    const s = window.getGridSettings();
    s.thickness = val;
    window.saveGridSettings(s);
    const badge = document.getElementById('gridThicknessVal');
    if (badge) badge.textContent = val + 'px';
    window.renderCanvasGridOverlay();
};

window.updateGridOpacity = function(val) {
    val = parseInt(val) || 75;
    const s = window.getGridSettings();
    s.opacity = val;
    window.saveGridSettings(s);
    const badge = document.getElementById('gridOpacityVal');
    if (badge) badge.textContent = val + '%';
    window.renderCanvasGridOverlay();
};

window.updateGridCellSize = function(val) {
    val = parseInt(val) || 80;
    const s = window.getGridSettings();
    s.cellSize = val;
    window.saveGridSettings(s);
    const badge = document.getElementById('gridCellSizeVal');
    if (badge) badge.textContent = val + 'px';
    window.renderCanvasGridOverlay();
};

window.setGridColor = function(hex) {
    if (!hex) return;
    const s = window.getGridSettings();
    s.color = hex;
    window.saveGridSettings(s);

    document.querySelectorAll('.grid-color-dot').forEach(dot => {
        dot.classList.toggle('active', dot.dataset.color.toLowerCase() === hex.toLowerCase());
    });
    const customColor = document.getElementById('gridCustomColorInput');
    if (customColor) customColor.value = hex;

    window.renderCanvasGridOverlay();
};

// Global dışa tıklamada Popover'ı kapat & Sağ Tık Bağlantısı
document.addEventListener('DOMContentLoaded', () => {
    const gridBtn = document.getElementById('dockGridBtn');
    if (gridBtn) {
        gridBtn.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.openGridSettingsPopover(e);
        });

        // Mobil uzun basma (Long press) desteği
        let pressTimer = null;
        gridBtn.addEventListener('touchstart', function(e) {
            pressTimer = setTimeout(() => {
                window.openGridSettingsPopover(e);
            }, 450);
        }, { passive: true });
        gridBtn.addEventListener('touchend', function() {
            clearTimeout(pressTimer);
        });
    }

    document.addEventListener('click', function(e) {
        const popover = document.getElementById('gridSettingsPopover');
        const gridBtn = document.getElementById('dockGridBtn');
        if (popover && popover.style.display !== 'none') {
            if (!popover.contains(e.target) && (!gridBtn || !gridBtn.contains(e.target))) {
                window.closeGridSettingsPopover();
            }
        }
    });
});