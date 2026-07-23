// ==================== CANVAS CORE ====================
window.getCurrentPhotoState = function() {
    const pnl = typeof getActivePhotoPanel === 'function' ? getActivePhotoPanel() : null;
    const pl = typeof getActiveV4Element === 'function' ? getActiveV4Element() : null;
    const sx = parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50);
    const sy = parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50);
    
    if (pl && pl.dataset.zpReady === '1') {
        return {
            v4: true,
            z: parseFloat(pl.dataset.zpScale) || 1,
            px: parseFloat(pl.dataset.zpX) || 0,
            py: parseFloat(pl.dataset.zpY) || 0,
            panelW: pnl ? pnl.w : 1920,
            panelH: pnl ? pnl.h : 1080,
            panelL: pnl ? pnl.left : 0,
            panelT: pnl ? pnl.top : 0,
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
            panelW: pnl ? pnl.w : 1920,
            panelH: pnl ? pnl.h : 1080,
            panelL: pnl ? pnl.left : 0,
            panelT: pnl ? pnl.top : 0,
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
    if (formatSelect && typeof EXPORT_FORMATS !== 'undefined' && EXPORT_FORMATS[formatSelect.value]) {
        canvasW = EXPORT_FORMATS[formatSelect.value].w;
        canvasH = EXPORT_FORMATS[formatSelect.value].h;
    } else {
        if (window.innerWidth <= 768) {
            canvasW = 1080;
            canvasH = 1920;
        }
    }
    
    if (typeof canvasEl !== 'undefined' && canvasEl) {
        canvasEl.style.width = canvasW + 'px';
        canvasEl.style.height = canvasH + 'px';
    }
    
    const availableW = pa.clientWidth - 0;
    const availableH = window.innerHeight - 150;
    
    const scaleW = availableW / canvasW;
    const scaleH = availableH / canvasH;
    
    scaleFactor = Math.min(scaleW, scaleH);
    
    w.style.width = (canvasW * scaleFactor) + 'px';
    w.style.height = (canvasH * scaleFactor) + 'px';
    w.style.aspectRatio = 'auto';
    
    if(typeof canvasEl !== 'undefined' && canvasEl) {
        canvasEl.style.transformOrigin = 'top left';
        canvasEl.style.transform = 'scale(' + scaleFactor + ')';
    }
}

function applyStylePos(el,c){
    el.style.top='';
    el.style.bottom='';
    el.style.left='';
    el.style.right='';
    el.style.transform='';
    if(c.top!==undefined)el.style.top=typeof c.top==='number'?c.top+'px':c.top;
    if(c.bottom!==undefined)el.style.bottom=typeof c.bottom==='number'?c.bottom+'px':c.bottom;
    if(c.left!==undefined)el.style.left=typeof c.left==='number'?c.left+'px':c.left;
    if(c.right!==undefined)el.style.right=typeof c.right==='number'?c.right+'px':c.right;
    if(c.transform)el.style.transform=c.transform;
    if(c.bg)el.style.background=c.bg;
    if(c.color)el.style.color=c.color;
    if(c.radius!==undefined)el.style.borderRadius=c.radius+'px';
    if(c.border)el.style.border=c.border;
    if(c.padding)el.style.padding=c.padding;
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
            AbsCX = ScaledLocalCX + s.px * s.z;
            AbsCY = ScaledLocalCY + s.py * s.z;
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
            
            AbsCX = ScaledLocalCX + (s.extraPx || 0) * (s.extraZ || 1);
            AbsCY = ScaledLocalCY + (s.extraPy || 0) * (s.extraZ || 1);
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