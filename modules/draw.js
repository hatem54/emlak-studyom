/**
 * ============================================
 * DRAW MODULE
 * modules/draw.js
 * ============================================
 * 
 * BaÃ„Å¸Ã„Â±mlÃ„Â±lÃ„Â±klar:
 * - config.js
 * 
 * KullanÃ„Â±lan yerler:
 * - main.js
 */

function applyGlowAndStroke(ctx, p) {
    const isNeon = !!(p.saber || p.hasSaber || (window.saberState && window.saberState.active));
    if (isNeon) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const origW = p.width || 4;
        const sOpts = p.saberOptions || (window.saberState && window.saberState.active ? window.saberState : {}) || {};
        const coreW = Math.max(1.5, Math.min(sOpts.coreSize || (origW * 0.6) || 3, 8));
        const glowSize = Math.max(12, sOpts.glowSize || 28);
        const op = p.opacity || 1;
        
        let glowColor = '#00CEC9';
        if (sOpts.glowColor) {
            glowColor = typeof sOpts.glowColor === 'number' ? '#' + sOpts.glowColor.toString(16).padStart(6, '0') : sOpts.glowColor;
        } else if (p.color) {
            glowColor = p.color;
        }
        let coreColor = '#FFFFFF';
        if (sOpts.coreColor) {
            coreColor = typeof sOpts.coreColor === 'number' ? '#' + sOpts.coreColor.toString(16).padStart(6, '0') : sOpts.coreColor;
        }

        // Toplamsal ışık karışımı (Additive Screen Blend)
        ctx.globalCompositeOperation = 'screen';

        // 1. Kademe: Geniş Zemin Yayılımı (Volumetric Ground Spill)
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowSize * 2.2;
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = origW + 12;
        ctx.globalAlpha = 0.35 * op;
        ctx.stroke();

        // 2. Kademe: Dış Atmosferik Neon Halesi (Outer Aura)
        ctx.shadowBlur = glowSize * 1.2;
        ctx.lineWidth = origW + 6;
        ctx.globalAlpha = 0.65 * op;
        ctx.stroke();

        // 3. Kademe: Yoğun İç Korona (Inner Corona)
        ctx.shadowBlur = glowSize * 0.4;
        ctx.lineWidth = origW + 2;
        ctx.globalAlpha = 0.9 * op;
        ctx.stroke();

        // 4. Kademe: Akkor Beyaz Çekirdek (Hot White Core Tube)
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 4;
        ctx.strokeStyle = coreColor;
        ctx.lineWidth = coreW;
        ctx.globalAlpha = 1.0 * op;
        ctx.stroke();

        ctx.restore();
    } else {
        if (p.glow > 0) {
            ctx.shadowBlur = p.glow;
            ctx.shadowColor = p.color;
        } else {
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
        }
        ctx.globalAlpha = p.opacity;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    }
}

function drawSinglePath(p){

    if(p.hidden) return;

    // ⚡ SELF-HEALING: Ensure p.el is connected to the DOM SVG element
    if (!p.el && p.id) {
        p.el = document.querySelector(`.editable-draw[data-path-id="${p.id}"]`);
    }
    if (!p.el && typeof drawPaths !== 'undefined') {
        const pIdx = drawPaths.indexOf(p);
        if (pIdx >= 0) {
            p.el = document.querySelector(`.editable-draw[data-path-index="${pIdx}"]`);
        }
    }
    if (!p.el && typeof createSVGFromPath === 'function') {
        p.el = createSVGFromPath(p);
    }
    // Ensure p.el is in DOM
    if (p.el && !p.el.parentElement) {
        const container = typeof getActiveV4Element === 'function' ? getActiveV4Element() : (document.getElementById('photo-layer') || document.getElementById('canvas-container'));
        if (container) {
            container.appendChild(p.el);
            if (typeof bindDrag === 'function') bindDrag(p.el);
        }
    }

    drawCtx.save();
    let tParams = null;
    if(p.photoRef && (typeof uploadedImgW !== 'undefined' ? uploadedImgW : 1920) > 0) {
        const currObj = typeof window.getCurrentPhotoState === 'function' ? window.getCurrentPhotoState() : null;
        if (currObj) {
            const hasChanged = 
                currObj.z !== p.photoRef.z || 
                currObj.px !== p.photoRef.px || 
                currObj.py !== p.photoRef.py ||
                currObj.sliderX !== p.photoRef.sliderX ||
                currObj.sliderY !== p.photoRef.sliderY ||
                (currObj.extraZ || 1) !== (p.photoRef.extraZ || 1) ||
                (currObj.extraPx || 0) !== (p.photoRef.extraPx || 0) ||
                (currObj.extraPy || 0) !== (p.photoRef.extraPy || 0) ||
                currObj.panelW !== p.photoRef.panelW ||
                currObj.panelH !== p.photoRef.panelH ||
                currObj.panelL !== p.photoRef.panelL ||
                currObj.panelT !== p.photoRef.panelT ||
                currObj.v4 !== p.photoRef.v4;

            if (hasChanged && typeof calculateTransformParams === 'function') {
                tParams = calculateTransformParams(p.photoRef, currObj);
            }
        }
    }
    
    if(tParams) {
        drawCtx.translate(tParams.dx, tParams.dy);
        drawCtx.scale(tParams.scale, tParams.scale);
        
        if (p.el && p.el.dataset && p.el.dataset.baseLeft !== undefined && !p.el.classList.contains('dragging')) {
            const baseL = parseFloat(p.el.dataset.baseLeft);
            const baseT = parseFloat(p.el.dataset.baseTop);
            const baseW = parseFloat(p.el.dataset.baseWidth);
            const baseH = parseFloat(p.el.dataset.baseHeight);
            
            p.el.style.left = (baseL * tParams.scale + tParams.dx) + 'px';
            p.el.style.top = (baseT * tParams.scale + tParams.dy) + 'px';
            p.el.style.width = (baseW * tParams.scale) + 'px';
            p.el.style.height = (baseH * tParams.scale) + 'px';
        }
        
        if (p.hasSaber) {
            if (!p.saberRef && typeof window.applySaberToPath === 'function') {
                const pIdx = drawPaths.indexOf(p);
                if (pIdx >= 0) {
                    p.saberRef = window.applySaberToPath(pIdx, p.saberOptions || window.saberState);
                }
            }
            if (p.saberRef && window.SaberEngine && SaberEngine.setSaberTransform) {
                const rot = (p.rotation !== undefined) ? p.rotation : (p.el && p.el.dataset.rotation ? parseFloat(p.el.dataset.rotation) : 0);
                let cx = p.saberRef.centerX;
                let cy = p.saberRef.centerY;
                if (p.el) {
                    const baseL = parseFloat(p.el.dataset.baseLeft !== undefined ? p.el.dataset.baseLeft : p.el.style.left) || 0;
                    const baseT = parseFloat(p.el.dataset.baseTop !== undefined ? p.el.dataset.baseTop : p.el.style.top) || 0;
                    const baseW = parseFloat(p.el.dataset.baseWidth) || p.el.offsetWidth || 0;
                    const baseH = parseFloat(p.el.dataset.baseHeight) || p.el.offsetHeight || 0;
                    if (baseW > 0 && baseH > 0) {
                        cx = baseL + baseW / 2;
                        cy = baseT + baseH / 2;
                    }
                }
                SaberEngine.setSaberTransform(p.saberRef, tParams.scale, tParams.dx, tParams.dy, false, rot, cx, cy);
            }
        }
    } else {
        if (p.el && p.el.dataset && p.el.dataset.baseLeft !== undefined && !p.el.classList.contains('dragging')) {
            const baseL = parseFloat(p.el.dataset.baseLeft);
            const baseT = parseFloat(p.el.dataset.baseTop);
            const baseW = parseFloat(p.el.dataset.baseWidth);
            const baseH = parseFloat(p.el.dataset.baseHeight);
            
            p.el.style.left = baseL + 'px';
            p.el.style.top = baseT + 'px';
            p.el.style.width = baseW + 'px';
            p.el.style.height = baseH + 'px';
        }
        if (p.hasSaber) {
            if (!p.saberRef && typeof window.applySaberToPath === 'function') {
                const pIdx = drawPaths.indexOf(p);
                if (pIdx >= 0) {
                    p.saberRef = window.applySaberToPath(pIdx, p.saberOptions || window.saberState);
                }
            }
            if (p.saberRef && window.SaberEngine && SaberEngine.setSaberTransform) {
                const rot = (p.rotation !== undefined) ? p.rotation : (p.el && p.el.dataset.rotation ? parseFloat(p.el.dataset.rotation) : 0);
                const curScale = (p.scale !== undefined) ? p.scale : (p.el && p.el.dataset.scale ? parseFloat(p.el.dataset.scale) : 1);
                let cx = p.saberRef.centerX;
                let cy = p.saberRef.centerY;
                if (p.el) {
                    const baseL = parseFloat(p.el.dataset.baseLeft !== undefined ? p.el.dataset.baseLeft : p.el.style.left) || 0;
                    const baseT = parseFloat(p.el.dataset.baseTop !== undefined ? p.el.dataset.baseTop : p.el.style.top) || 0;
                    const baseW = parseFloat(p.el.dataset.baseWidth) || p.el.offsetWidth || 0;
                    const baseH = parseFloat(p.el.dataset.baseHeight) || p.el.offsetHeight || 0;
                    if (baseW > 0 && baseH > 0) {
                        cx = baseL + baseW / 2;
                        cy = baseT + baseH / 2;
                    }
                }
                SaberEngine.setSaberTransform(p.saberRef, curScale, 0, 0, false, rot, cx, cy);
            }
        }
    }

    // ⚡ Asla etkileşimli tuvalde (drawCanvas / draw-layer) raster çizim yapma!
    // Tüm çizimler DOM SVG elementi olarak mevcuttur. Tuvale çizmek çift/kopya şekil oluşturur!
    if (drawCtx && drawCtx.canvas && (drawCtx.canvas.id === 'drawCanvas' || drawCtx.canvas.id === 'draw-layer')) {
        drawCtx.restore();
        return;
    }
    
    drawCtx.globalAlpha = p.opacity;
    drawCtx.strokeStyle = p.color;
    drawCtx.lineWidth = p.width;
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
    
    
    
    drawCtx.setLineDash(getDash(p.dashStyle, p.width));
    
    drawCtx.beginPath();
    
    if(p.type === 'free'){
        if(p.points && p.points.length > 0){
            drawCtx.moveTo(p.points[0].x, p.points[0].y);
            for(let i=1; i<p.points.length; i++) {
                drawCtx.lineTo(p.points[i].x, p.points[i].y);
            }
            applyGlowAndStroke(drawCtx, p);
        }
    } else if(p.type === 'line' || p.type === 'arrow'){
        if(typeof p.x1 !== 'undefined' && typeof p.x2 !== 'undefined') {
            if(p.type === 'arrow'){
                const a = Math.atan2(p.y2 - p.y1, p.x2 - p.x1);
                const s = p.arrowStyle || 1;
                const dir = p.arrowDir || 'outward';
                const baseH = Math.max(p.width * 4.5, 14);
                const cutDist = (s === 3 || s === 11 || s === 12) ? 0 : Math.min(baseH * 0.45, 14);
                
                let lx1 = p.x1, ly1 = p.y1, lx2 = p.x2, ly2 = p.y2;
                if(dir === 'outward' || dir === 'both' || s >= 18) {
                    lx2 -= cutDist * Math.cos(a);
                    ly2 -= cutDist * Math.sin(a);
                }
                if(dir === 'inward' || dir === 'both' || s >= 18) {
                    lx1 += cutDist * Math.cos(a);
                    ly1 += cutDist * Math.sin(a);
                }
                drawCtx.moveTo(lx1, ly1);
                drawCtx.lineTo(lx2, ly2);
                applyGlowAndStroke(drawCtx, p);
                arrowHead(drawCtx, p.x1, p.y1, p.x2, p.y2, p.width, p.color, p.opacity, p.arrowStyle, p.arrowDir);
            } else {
                drawCtx.moveTo(p.x1, p.y1);
                drawCtx.lineTo(p.x2, p.y2);
                applyGlowAndStroke(drawCtx, p);
            }
        }
    } else if(p.type === 'rect'){
        if(typeof p.x1 !== 'undefined' && typeof p.x2 !== 'undefined') {
            const rx = Math.min(p.x1, p.x2);
            const ry = Math.min(p.y1, p.y2);
            const rw = Math.abs(p.x2 - p.x1);
            const rh = Math.abs(p.y2 - p.y1);
            drawCtx.rect(rx, ry, rw, rh);
            if(p.fillOpacity > 0){
                drawCtx.fillStyle = p.fillColor;
                drawCtx.globalAlpha = p.fillOpacity;
                if(p.fillGlow > 0){
                    drawCtx.shadowBlur = p.fillGlow;
                    drawCtx.shadowColor = p.fillColor;
                } else {
                    drawCtx.shadowBlur = 0;
                    drawCtx.shadowColor = 'transparent';
                }
                drawCtx.fill();
                drawCtx.shadowBlur = 0;
                drawCtx.shadowColor = 'transparent';
            }
            applyGlowAndStroke(drawCtx, p);
        }
    } else if(p.type === 'circle'){
        if(typeof p.x1 !== 'undefined' && typeof p.x2 !== 'undefined') {
            const cx = (p.x1 + p.x2) / 2;
            const cy = (p.y1 + p.y2) / 2;
            const rx2 = Math.max(Math.abs(p.x2 - p.x1) / 2, 1);
            const ry2 = Math.max(Math.abs(p.y2 - p.y1) / 2, 1);
            drawCtx.ellipse(cx, cy, rx2, ry2, 0, 0, Math.PI*2);
            if(p.fillOpacity > 0){
                drawCtx.fillStyle = p.fillColor;
                drawCtx.globalAlpha = p.fillOpacity;
                if(p.fillGlow > 0){
                    drawCtx.shadowBlur = p.fillGlow;
                    drawCtx.shadowColor = p.fillColor;
                } else {
                    drawCtx.shadowBlur = 0;
                    drawCtx.shadowColor = 'transparent';
                }
                drawCtx.fill();
                drawCtx.shadowBlur = 0;
                drawCtx.shadowColor = 'transparent';
            }
            applyGlowAndStroke(drawCtx, p);
        }
    } else if(p.type === 'polygon'){
        if(p.points && p.points.length > 0){
            drawCtx.moveTo(p.points[0].x, p.points[0].y);
            for(let i=1; i<p.points.length; i++){
                drawCtx.lineTo(p.points[i].x, p.points[i].y);
            }
            if(p.closed){
                drawCtx.closePath();
                if(p.fillOpacity > 0){
                    drawCtx.fillStyle = p.fillColor;
                    drawCtx.globalAlpha = p.fillOpacity;
                    if(p.fillGlow > 0){
                        drawCtx.shadowBlur = p.fillGlow;
                        drawCtx.shadowColor = p.fillColor;
                    } else {
                        drawCtx.shadowBlur = 0;
                        drawCtx.shadowColor = 'transparent';
                    }
                    drawCtx.fill();
                    drawCtx.shadowBlur = 0;
                    drawCtx.shadowColor = 'transparent';
                }
                applyGlowAndStroke(drawCtx, p);
            } else {
                applyGlowAndStroke(drawCtx, p);
            }
            
            const isNeonForPts = !!(p.saber || p.hasSaber || (window.saberState && window.saberState.active));
            const sOptsForPts = p.saberOptions || (window.saberState && window.saberState.active ? window.saberState : {}) || {};
            const showNodesForPts = isNeonForPts ? (sOptsForPts.energyNodes !== false) : p.showVertices;
            if(showNodesForPts){
                drawCtx.save();
                if (isNeonForPts) {
                    drawCtx.globalCompositeOperation = 'screen';
                    let glowColor = '#00CEC9';
                    if (sOptsForPts.glowColor) {
                        glowColor = typeof sOptsForPts.glowColor === 'number' ? '#' + sOptsForPts.glowColor.toString(16).padStart(6, '0') : sOptsForPts.glowColor;
                    } else if (p.color) {
                        glowColor = p.color;
                    }
                    const pinR = Math.max(3.5, Math.round(p.width * 0.75));
                    p.points.forEach(pt => {
                        // Dış halo
                        drawCtx.beginPath();
                        drawCtx.shadowColor = glowColor;
                        drawCtx.shadowBlur = 12;
                        drawCtx.strokeStyle = glowColor;
                        drawCtx.lineWidth = 2;
                        drawCtx.arc(pt.x, pt.y, pinR * 2.2, 0, Math.PI * 2);
                        drawCtx.stroke();
                        // İç akkor çekirdek
                        drawCtx.beginPath();
                        drawCtx.shadowColor = '#FFFFFF';
                        drawCtx.shadowBlur = 4;
                        drawCtx.fillStyle = '#FFFFFF';
                        drawCtx.arc(pt.x, pt.y, pinR, 0, Math.PI * 2);
                        drawCtx.fill();
                    });
                } else {
                    drawCtx.globalAlpha = 1;
                    drawCtx.fillStyle = p.color;
                    drawCtx.setLineDash([]);
                    p.points.forEach(pt => {
                        drawCtx.beginPath();
                        drawCtx.arc(pt.x, pt.y, p.width + 2, 0, Math.PI*2);
                        drawCtx.fill();
                    });
                }
                drawCtx.restore();
            }
        }
    }
    
    drawCtx.restore();
}

function updateTempPolygonSaber() {
    if (!window.saberState || !window.saberState.active || !window.SaberEngine) return;
    removeTempPolygonSaber();
    if (polygonPoints.length < 2) return;
    try {
        if (!SaberEngine.getApp()) SaberEngine.init(document.getElementById('canvas-container'));
        window.tempPolygonSaberRef = SaberEngine.drawSaberLine(polygonPoints, window.saberState);
    } catch(e) {}
}

function removeTempPolygonSaber() {
    if (window.tempPolygonSaberRef && window.SaberEngine) {
        try {
            const sabers = SaberEngine.getSabers();
            const idx = sabers.indexOf(window.tempPolygonSaberRef);
            if (idx > -1) {
                const s = sabers[idx];
                if (s.graphics?.parent) s.graphics.parent.removeChild(s.graphics);
                if (s.particleContainer?.parent) s.particleContainer.parent.removeChild(s.particleContainer);
                if (s.branchContainer?.parent) s.branchContainer.parent.removeChild(s.branchContainer);
                sabers.splice(idx, 1);
            }
        } catch(e) {}
        window.tempPolygonSaberRef = null;
    }
}
function setDrawMode(mode){
    if (mode !== 'off') {
        // Çizim aracı seçildiğinde fotoğraf serbestse otomatik olarak sabitle
        if (window.isPhotoLocked === false) {
            if (typeof window.updatePhotoLockState === 'function') {
                window.updatePhotoLockState(true);
            } else {
                window.isPhotoLocked = true;
                if (typeof window.updateDockLockUI === 'function') window.updateDockLockUI(true);
            }
        }
    }
    if (mode === 'off') {
        document.querySelectorAll('.editable-draw').forEach(el => {
            el.style.pointerEvents = 'auto';
            const children = el.querySelectorAll('*');
            children.forEach(child => child.style.pointerEvents = '');
        });
        if (typeof deselectAll === 'function') deselectAll();
        if (typeof window.deselectAll === 'function') window.deselectAll();
        if (typeof hideVertexHandles === 'function') hideVertexHandles();
        if (typeof window.hideVertexHandles === 'function') window.hideVertexHandles();
        if (typeof saveDrawEdit === 'function' && typeof editingDrawIndex !== 'undefined' && editingDrawIndex >= 0) {
            saveDrawEdit();
        } else if (typeof window.saveDrawEdit === 'function' && typeof editingDrawIndex !== 'undefined' && editingDrawIndex >= 0) {
            window.saveDrawEdit();
        }
    } else {
        document.querySelectorAll('.editable-draw').forEach(el => {
            el.style.pointerEvents = 'none';
            const children = el.querySelectorAll('*');
            children.forEach(child => child.style.pointerEvents = 'none');
        });
        if (typeof deselectAll === 'function') deselectAll();
        if (typeof window.deselectAll === 'function') window.deselectAll();
        if (typeof hideVertexHandles === 'function') hideVertexHandles();
        if (typeof window.hideVertexHandles === 'function') window.hideVertexHandles();
    }
    removeTempPolygonSaber();
    if(mode!=='polygon'&&polygonBuilding){polygonPoints=[];polygonBuilding=false;redrawAll()}
    drawMode=mode;
    ['dmOff','dmFree','dmLine','dmArrow','dmRect','dmCircle','dmPoly'].forEach(id=>{if($(id))$(id).classList.remove('active')});
    const map={off:'dmOff',free:'dmFree',line:'dmLine',arrow:'dmArrow',rect:'dmRect',circle:'dmCircle',polygon:'dmPoly'};
    if($(map[mode]))$(map[mode]).classList.add('active');
    $('polyInfo').style.display=mode==='polygon'?'block':'none';
    if(document.getElementById('arrowSettingsContainer')) {
        document.getElementById('arrowSettingsContainer').style.display = mode === 'arrow' ? 'block' : 'none';
    }
    if(document.getElementById('arrowStyleContainer')) {
        document.getElementById('arrowStyleContainer').style.display = mode === 'arrow' ? 'block' : 'none';
    }
    if(mode==='off'){
        drawCanvas.style.pointerEvents='none';
        drawCanvas.style.zIndex='5';
        document.body.classList.remove('draw-mode-active');
        $('drawIndicator').classList.remove('show');
        $('canvasHint').textContent='💡 Tek tık: Seç | Çift tık: Yazıyı Düzenle | Sürükle: Taşı';
    }else{
        drawCanvas.style.pointerEvents='auto';
        drawCanvas.style.zIndex='90';
        document.body.classList.add('draw-mode-active');
        drawCanvas.style.cursor='default';
        $('drawIndicator').classList.add('show');
        $('canvasHint').textContent=mode==='polygon'?'📍 Tıklayarak köşe ekle, çift tıkla kapat':'✏️ ÇİZİM AKTİF';
    }
}
window.setDrawMode = setDrawMode;

function getDrawScaleRatio(){
    if (typeof window.scaleFactor !== 'undefined' && window.scaleFactor > 0) {
        return Math.max(0.2, 0.5 / window.scaleFactor);
    }
    if (typeof scaleFactor !== 'undefined' && scaleFactor > 0) {
        return Math.max(0.2, 0.5 / scaleFactor);
    }
    let canvasW = 1920;
    const cContainer = document.getElementById('canvas-container');
    if (cContainer && parseFloat(cContainer.style.width)) {
        canvasW = parseFloat(cContainer.style.width);
    } else if (typeof uploadedImgW !== 'undefined' && uploadedImgW > 0) {
        canvasW = uploadedImgW;
    }
    return Math.max(0.2, canvasW / 1920);
}

function getDS(){
    const baseW = +$('drawWidth').value || 6;
    const scaleRatio = getDrawScaleRatio();
    const effWidth = Math.max(1, Math.round(baseW * scaleRatio));
    const isNeonActive = !!(window.saberState && window.saberState.active);
    
    let drawCol = $('drawColor') ? $('drawColor').value : '#ef4444';
    if (isNeonActive && window.saberState) {
        const gc = window.saberState.glowColor;
        if (gc) drawCol = typeof gc === 'number' ? '#' + gc.toString(16).padStart(6, '0') : gc;
    }

    return{
        color: drawCol,
        width: effWidth,
        rawWidth: baseW,
        opacity:+$('drawOpacity').value/100,
        dashStyle:$('drawDash').value,
        fillColor:$('fillColor').value,
        fillOpacity:+$('fillOpacity').value/100,
        showVertices:$('polyShowVertices')?$('polyShowVertices').checked:true,
        arrowStyle:$('arrowStyleSelect')?parseInt($('arrowStyleSelect').value):1,
        arrowDir:$('arrowDirSelect')?$('arrowDirSelect').value:'outward',
        saber: isNeonActive,
        hasSaber: isNeonActive,
        saberOptions: isNeonActive ? JSON.parse(JSON.stringify(window.saberState)) : null
    };
}

function getDash(s,w){
    if(s==='dashed')return[w*4,w*2];
    if(s==='dotted')return[w,w*2];
    return[];
}

function canvasXY(e) {
    const rect = drawCanvas.getBoundingClientRect();
    let src = e;
    if (e.touches && e.touches.length > 0) src = e.touches[0];
    else if (e.changedTouches && e.changedTouches.length > 0) src = e.changedTouches[0];
    
    const x = (src.clientX - rect.left) * (drawCanvas.width / rect.width);
    const y = (src.clientY - rect.top) * (drawCanvas.height / rect.height);
    
    return { x: x, y: y };
}

let lastGlobalDStartTime = 0;
function dStart(e){
    if(drawMode==='off')return;
    if (e.button !== undefined && e.button !== 0) return; // Sağ tık çizim başlatmasın, contextmenu açılmasına izin versin!
    
    // Pointer events: PC'de mouse tıklaması zaten mousedown ile işlenir.
    // pointerdown'da mouse geldiğinde erken dönüyoruz ki lastGlobalDStartTime güncellenip mousedown'u bloklamasın!
    if (e.type === 'pointerdown' && e.pointerType === 'mouse') return;

    const nowGlobal = Date.now();
    if (nowGlobal - lastGlobalDStartTime < 50) {
        if(e.cancelable !== false) e.preventDefault();
        if(e.stopPropagation) e.stopPropagation();
        return;
    }
    lastGlobalDStartTime = nowGlobal;

    if (e.cancelable !== false) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    let p=canvasXY(e);
    if(window.clearSnapGuides) window.clearSnapGuides();
    if(window.getSnapGuides && (drawMode==='line' || drawMode==='arrow' || drawMode==='polygon' || drawMode==='free')) {
        const snap = window.getSnapGuides(p.x, p.y, null, true);
        p.x = snap.x;
        p.y = snap.y;
    }
    if(drawMode==='polygon'){
        const now=Date.now();
        
        // AkÃ„Â±llÃ„Â± hizalama ile baÃ…Å¸langÃ„Â±ÃƒÂ§ noktasÃ„Â±na tÃ„Â±klandÃ„Â±Ã„Å¸Ã„Â±nda (veya ÃƒÂ§ok yakÃ„Â±nsa) direkt kapat
        if (polygonPoints.length >= 3) {
            let firstPt = polygonPoints[0];
            let dist = Math.sqrt(Math.pow(p.x - firstPt.x, 2) + Math.pow(p.y - firstPt.y, 2));
            // Touch ve kalem için toleransı genişlet (40px), mouse için 20px
            const polyTolerance = (typeof window.isMobileDevice === 'function' && window.isMobileDevice()) ? 40 : 20;
            if (dist < polyTolerance / (typeof window.getGlobalScale === 'function' ? window.getGlobalScale() : 1)) {
                closePolygon();
                return;
            }
        }
        
        if(now-lastClickTime<350&&polygonPoints.length>=3){closePolygon();lastClickTime=0;return}
        lastClickTime=now;
        polygonPoints.push(p);
        polygonBuilding=true;
        updateTempPolygonSaber();
        redrawAll();
        drawTempPolygon();
        return;
    }
    isDrawing=true;
    drawStartX=p.x;
    drawStartY=p.y;
    currentPath=[p];
}

function dMove(e){
    if(drawMode==='off')return;
    
    // PC mouse pointermove zaten mousemove ile yakalanıyor, çift tetiklemeyi atla
    if (e.type === 'pointermove' && e.pointerType === 'mouse') return;
    
    if (e.cancelable !== false) {
        e.preventDefault();
    }
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    let p=canvasXY(e);
    if(window.getSnapGuides && (drawMode==='line' || drawMode==='arrow' || drawMode==='polygon' || drawMode==='free' || drawMode==='rect' || drawMode==='circle')) {
        const snap = window.getSnapGuides(p.x, p.y, null, true);
        p.x = snap.x;
        p.y = snap.y;
        if(window.drawSnapGuides) window.drawSnapGuides(snap.guides);
    }
    
    // SADECE mobilde çokgen çiziminde parmak takibi (preview line)
    if(drawMode==='polygon'){
        if(polygonBuilding && polygonPoints.length > 0){
            redrawAll();
            drawTempPolygon(p);
        }
        return;
    }
    if(!isDrawing)return;
    const s=getDS();
    if(drawMode==='free'){
        currentPath.push(p);
        redrawAll();
        drawCtx.save();
        drawCtx.globalAlpha=s.opacity;
        drawCtx.strokeStyle=s.color;
        drawCtx.lineWidth=s.width;
        drawCtx.lineCap='round';
        drawCtx.lineJoin='round';
        
        drawCtx.beginPath();
        drawCtx.moveTo(currentPath[0].x, currentPath[0].y);
        for(let i=1; i<currentPath.length; i++){
            drawCtx.lineTo(currentPath[i].x, currentPath[i].y);
        }
        
        if (s.saber) { 
            applyGlowAndStroke(drawCtx, s); 
        } else { 
            if (s.glow > 0) { 
                drawCtx.shadowBlur = s.glow; 
                drawCtx.shadowColor = s.color; 
            } else { 
                drawCtx.shadowBlur = 0; 
                drawCtx.shadowColor = 'transparent'; 
            } 
            drawCtx.stroke(); 
            drawCtx.shadowBlur = 0; 
            drawCtx.shadowColor = 'transparent'; 
        }
        drawCtx.restore();
    }else{
        redrawAll();
        drawCtx.save();
        drawCtx.globalAlpha=s.opacity;
        drawCtx.strokeStyle=s.color;
        drawCtx.lineWidth=s.width;
        drawCtx.lineCap='round';
        if(!s.saber) { if (s.glow > 0) { drawCtx.shadowBlur = s.glow; drawCtx.shadowColor = s.color; } else { drawCtx.shadowBlur = 0; drawCtx.shadowColor = 'transparent'; } }
        drawCtx.setLineDash(getDash(s.dashStyle,s.width));
        if(drawMode==='line'||drawMode==='arrow'){
            drawCtx.beginPath();
            if(drawMode==='arrow'){
                const a = Math.atan2(p.y - drawStartY, p.x - drawStartX);
                const sStyle = s.arrowStyle || 1;
                const dir = s.arrowDir || 'outward';
                const baseH = Math.max(s.width * 4.5, 14);
                const cutDist = (sStyle === 3 || sStyle === 11 || sStyle === 12) ? 0 : Math.min(baseH * 0.45, 14);
                let lx1 = drawStartX, ly1 = drawStartY, lx2 = p.x, ly2 = p.y;
                if(dir === 'outward' || dir === 'both' || sStyle >= 18) {
                    lx2 -= cutDist * Math.cos(a);
                    ly2 -= cutDist * Math.sin(a);
                }
                if(dir === 'inward' || dir === 'both' || sStyle >= 18) {
                    lx1 += cutDist * Math.cos(a);
                    ly1 += cutDist * Math.sin(a);
                }
                drawCtx.moveTo(lx1, ly1);
                drawCtx.lineTo(lx2, ly2);
                if (s.saber) { applyGlowAndStroke(drawCtx, s); } else { drawCtx.stroke(); }
                arrowHead(drawCtx, drawStartX, drawStartY, p.x, p.y, s.width, s.color, s.opacity, s.arrowStyle, s.arrowDir);
            } else {
                drawCtx.moveTo(drawStartX, drawStartY);
                drawCtx.lineTo(p.x, p.y);
                if (s.saber) { applyGlowAndStroke(drawCtx, s); } else { drawCtx.stroke(); }
            }
        }else if(drawMode==='rect'){
            const rx=Math.min(drawStartX,p.x),ry=Math.min(drawStartY,p.y);
            const rw=Math.abs(p.x-drawStartX),rh=Math.abs(p.y-drawStartY);
            if(s.fillOpacity>0){drawCtx.save();if(s.fillGlow>0){drawCtx.shadowBlur=s.fillGlow; drawCtx.shadowColor=s.fillColor;}else{drawCtx.shadowBlur=0;drawCtx.shadowColor='transparent';}drawCtx.globalAlpha=s.fillOpacity;drawCtx.fillStyle=s.fillColor;drawCtx.fillRect(rx,ry,rw,rh);drawCtx.restore()}
            drawCtx.beginPath();
            drawCtx.rect(rx,ry,rw,rh);
            if (s.saber) { applyGlowAndStroke(drawCtx, s); } else { drawCtx.stroke(); }
        }else if(drawMode==='circle'){
            const cx=(drawStartX+p.x)/2,cy=(drawStartY+p.y)/2;
            const rx2=Math.max(Math.abs(p.x-drawStartX)/2,1),ry2=Math.max(Math.abs(p.y-drawStartY)/2,1);
            if(s.fillOpacity>0){drawCtx.save();if(s.fillGlow>0){drawCtx.shadowBlur=s.fillGlow; drawCtx.shadowColor=s.fillColor;}else{drawCtx.shadowBlur=0;drawCtx.shadowColor='transparent';}drawCtx.globalAlpha=s.fillOpacity;drawCtx.fillStyle=s.fillColor;drawCtx.beginPath();drawCtx.ellipse(cx,cy,rx2,ry2,0,0,Math.PI*2);drawCtx.fill();drawCtx.restore()}
            drawCtx.beginPath();
            drawCtx.ellipse(cx,cy,rx2,ry2,0,0,Math.PI*2);
            if (s.saber) { applyGlowAndStroke(drawCtx, s); } else { drawCtx.stroke(); }
        }
        drawCtx.restore();
    }
}

function dEnd(e){
    // pointerup'ta mouse tipi geliyorsa mouseup zaten ele alıyor, atla
    if (e && e.type === 'pointerup' && e.pointerType === 'mouse') return;
    if(window.clearSnapGuides) window.clearSnapGuides();
    if(drawMode==='off'||drawMode==='polygon')return;
    if(!isDrawing)return;
    isDrawing=false;
    const s=getDS();
    let ep;
    if(e.changedTouches)ep=canvasXY(e.changedTouches[0]);
    else if(e.clientX!==undefined)ep=canvasXY(e);
    else ep={x:drawStartX,y:drawStartY};
    
    if(window.getSnapGuides) {
        const snap = window.getSnapGuides(ep.x, ep.y, null, true);
        ep.x = snap.x;
        ep.y = snap.y;
    }
    
    const z = parseInt(document.getElementById('photoZoomCtrl') ? document.getElementById('photoZoomCtrl').value : 100);
    const px = parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50);
    const py = parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50);
    const panel = getActivePhotoPanel();
    const pl = getActiveV4Element();
    const photoRef = typeof window.getCurrentPhotoState === 'function' ? window.getCurrentPhotoState() : null;
    
    let pObj = null;
    if(drawMode==='free'&&currentPath.length>1) {
        pObj = Object.assign({type:'free',points:currentPath.slice(),photoRef},s);
    } else if(drawMode==='line'||drawMode==='arrow') {
        pObj = Object.assign({type:drawMode,x1:drawStartX,y1:drawStartY,x2:ep.x,y2:ep.y,photoRef},s);
    } else if(drawMode==='rect') {
        pObj = Object.assign({type:'rect',x1:drawStartX,y1:drawStartY,x2:ep.x,y2:ep.y,photoRef},s);
    } else if(drawMode==='circle') {
        pObj = Object.assign({type:'circle',x1:drawStartX,y1:drawStartY,x2:ep.x,y2:ep.y,photoRef},s);
    }

    if (pObj) {
        const isNeonNow = !!(window.saberState && window.saberState.active);
        let activeNeonColor = pObj.color;
        if (isNeonNow && window.saberState && window.saberState.glowColor) {
            const gc = window.saberState.glowColor;
            activeNeonColor = typeof gc === 'number' ? '#' + gc.toString(16).padStart(6, '0') : gc;
        }
        if (isNeonNow) {
            pObj.color = activeNeonColor;
            if (!pObj.fillColor || pObj.fillColor === '#ef4444' || pObj.fillColor === '#e74c3c') {
                pObj.fillColor = activeNeonColor;
            }
            pObj.hasSaber = true;
            pObj.saber = true;
            pObj.saberOptions = JSON.parse(JSON.stringify(window.saberState));
        }

        const el = createSVGFromPath(pObj);
        if (el) {
            const container = typeof getActiveV4Element === 'function' ? getActiveV4Element() : (document.getElementById('photo-layer') || document.getElementById('canvas-container'));
            if (container && !el.parentElement) {
                container.appendChild(el);
            }
            if (typeof bindDrag === 'function') {
                bindDrag(el);
            }
            if (typeof allIcons !== 'undefined') {
                if (!allIcons.includes(el)) allIcons.push(el);
                if (document.getElementById('iconCount')) document.getElementById('iconCount').textContent = allIcons.length;
            }
            if (typeof drawPaths !== 'undefined') {
                const hasEl = drawPaths.some(p => p.el === el);
                if (!hasEl) {
                    drawRedoPaths = [];
                    const newPathObj = Object.assign({}, pObj, {
                        id: pObj.id || ('draw-path-' + Date.now() + '-' + Math.floor(Math.random()*10000)),
                        color: isNeonNow ? activeNeonColor : pObj.color,
                        hasSaber: isNeonNow,
                        saber: isNeonNow,
                        saberOptions: isNeonNow ? JSON.parse(JSON.stringify(window.saberState)) : null,
                        photoRef: photoRef,
                        el: el
                    });
                    drawPaths.push(newPathObj);
                    const newIdx = drawPaths.length - 1;
                    el.dataset.pathIndex = newIdx;
                    el.dataset.pathId = newPathObj.id;
                    if (typeof updateSinglePathSvg === 'function') {
                        updateSinglePathSvg(newPathObj);
                    }
                    if (typeof updateDrawHistory === 'function') updateDrawHistory();
                }
            }
            if (typeof window.selectElement === 'function') {
                window.selectElement(el, false, true);
            }
        }
    }

    currentPath=[];

    // ─── ⚡ SABER HOOK (redrawAll'dan ÖNCE çalıştır ki transform ve referanslar hemen bağlansın!) ───
    if (window.saberState && window.saberState.active && window.applySaberToPath) {
        window.applySaberToPath(drawPaths.length - 1, JSON.parse(JSON.stringify(window.saberState)));
    }

    redrawAll();
    updateDrawHistory();
}

function drawTempPolygon(cursor){
    const s=getDS();
    drawCtx.save();
    drawCtx.globalAlpha=s.opacity;
    drawCtx.strokeStyle=s.color;
    drawCtx.lineWidth=s.width;
    drawCtx.lineCap='round';
    drawCtx.lineJoin='round';
    if (!s.saber) { if (s.glow > 0) { drawCtx.shadowBlur = s.glow; drawCtx.shadowColor = s.color; } else { drawCtx.shadowBlur = 0; drawCtx.shadowColor = 'transparent'; } }
    drawCtx.setLineDash(getDash(s.dashStyle,s.width));
    if(s.fillOpacity>0&&polygonPoints.length>=2){
        drawCtx.save();
        if(s.fillGlow>0){drawCtx.shadowBlur=s.fillGlow; drawCtx.shadowColor=s.fillColor;}else{drawCtx.shadowBlur=0;drawCtx.shadowColor='transparent';}
        drawCtx.globalAlpha=s.fillOpacity;
        drawCtx.fillStyle=s.fillColor;
        drawCtx.beginPath();
        drawCtx.moveTo(polygonPoints[0].x,polygonPoints[0].y);
        for(let i=1;i<polygonPoints.length;i++)drawCtx.lineTo(polygonPoints[i].x,polygonPoints[i].y);
        if(cursor)drawCtx.lineTo(cursor.x,cursor.y);
        drawCtx.closePath();
        drawCtx.fill();
        drawCtx.restore();
    }
    drawCtx.beginPath();
    drawCtx.moveTo(polygonPoints[0].x,polygonPoints[0].y);
    for(let i=1;i<polygonPoints.length;i++)drawCtx.lineTo(polygonPoints[i].x,polygonPoints[i].y);
    if(cursor)drawCtx.lineTo(cursor.x,cursor.y);
    if (s.saber) { applyGlowAndStroke(drawCtx, s); } else { drawCtx.stroke(); }
    const showV = document.getElementById('polyShowVertices') ? document.getElementById('polyShowVertices').checked : true;
    if(showV) {
        polygonPoints.forEach(pt=>{drawCtx.fillStyle=s.color;drawCtx.beginPath();drawCtx.arc(pt.x,pt.y,s.width+2,0,Math.PI*2);drawCtx.fill()});
    }
    drawCtx.restore();
}

function closePolygon(){
    if(polygonPoints.length<3)return;
    if(window.clearSnapGuides) window.clearSnapGuides();
    removeTempPolygonSaber();
    const s=getDS();
    const showV = document.getElementById('polyShowVertices') ? document.getElementById('polyShowVertices').checked : true;
        const z = parseInt(document.getElementById('photoZoomCtrl') ? document.getElementById('photoZoomCtrl').value : 100);
    const px = parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50);
    const py = parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50);
    const panel = getActivePhotoPanel();
    
    const isNeonNow = !!(window.saberState && window.saberState.active);
    let activeNeonColor = s.color;
    if (isNeonNow && window.saberState && window.saberState.glowColor) {
        const gc = window.saberState.glowColor;
        activeNeonColor = typeof gc === 'number' ? '#' + gc.toString(16).padStart(6, '0') : gc;
    }

    const pObj = Object.assign({
        type: 'polygon',
        closed: true,
        points: polygonPoints.slice(),
        showVertices: showV,
        photoRef: typeof window.getCurrentPhotoState === 'function' ? window.getCurrentPhotoState() : null,
        hasSaber: isNeonNow,
        saber: isNeonNow,
        saberOptions: isNeonNow ? JSON.parse(JSON.stringify(window.saberState)) : null
    }, s);
    if (isNeonNow) {
        pObj.color = activeNeonColor;
        if (!pObj.fillColor || pObj.fillColor === '#ef4444' || pObj.fillColor === '#e74c3c') {
            pObj.fillColor = activeNeonColor;
        }
    }
    
    const el = createSVGFromPath(pObj);
    if (el) {
        const container = typeof getActiveV4Element === 'function' ? getActiveV4Element() : (document.getElementById('photo-layer') || document.getElementById('canvas-container'));
        if (container && !el.parentElement) {
            container.appendChild(el);
        }
        if (typeof bindDrag === 'function') {
            bindDrag(el);
        }
        if (typeof allIcons !== 'undefined') {
            if (!allIcons.includes(el)) allIcons.push(el);
            if (document.getElementById('iconCount')) document.getElementById('iconCount').textContent = allIcons.length;
        }
        if (typeof drawPaths !== 'undefined') {
            const hasEl = drawPaths.some(p => p.el === el);
            if (!hasEl) {
                const newPathObj = Object.assign({}, pObj, {
                    id: pObj.id || ('draw-path-' + Date.now() + '-' + Math.floor(Math.random()*10000)),
                    color: isNeonNow ? activeNeonColor : pObj.color,
                    hasSaber: isNeonNow,
                    saber: isNeonNow,
                    saberOptions: isNeonNow ? JSON.parse(JSON.stringify(window.saberState)) : null,
                    photoRef: typeof window.getCurrentPhotoState === 'function' ? window.getCurrentPhotoState() : null,
                    el: el
                });
                drawPaths.push(newPathObj);
                const newIdx = drawPaths.length - 1;
                el.dataset.pathIndex = newIdx;
                el.dataset.pathId = newPathObj.id;
                if (typeof updateSinglePathSvg === 'function') {
                    updateSinglePathSvg(newPathObj);
                }
                if (typeof updateDrawHistory === 'function') updateDrawHistory();
            }
        }
        if (typeof window.selectElement === 'function') {
            window.selectElement(el, false, true);
        }
    }

    // ─── ⚡ SABER HOOK ───
    if (window.saberState && window.saberState.active && window.applySaberToPath) {
        window.applySaberToPath(drawPaths.length - 1, JSON.parse(JSON.stringify(window.saberState)));
    }
    
    polygonPoints=[];
    polygonBuilding=false;
    redrawAll();
    updateDrawHistory();
}

// ==================== 🏹 20 PROFESYONEL OK STİLİ TANIMI ====================
window.ARROW_STYLES = [
    { id: 1, name: 'Klasik Keskin Ok', desc: 'Modern keskin üçgen ok ucu (Varsayılan)', iconSvg: '<path d="M4 12 L14 12 M11 7 L19 12 L11 17 Z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>' },
    { id: 2, name: 'Stealth / Çentikli Kanat', desc: 'Aerodinamik içe kıvrık modern askeri ok', iconSvg: '<path d="M4 12 L13 12 M10 7 L19 12 L10 17 L13 12 Z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>' },
    { id: 3, name: 'Zarif Açık V', desc: 'İçi boş, minimalist ve ince çift kanatlı çizgi', iconSvg: '<path d="M4 12 L18 12 M12 6 L19 12 L12 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' },
    { id: 4, name: 'Kalın Dolu Chevron', desc: 'Geniş açılı ve dolgulu modern yönlendirici', iconSvg: '<path d="M4 12 L12 12 M11 6 L18 12 L11 18 L8 18 L14 12 L8 6 Z" fill="currentColor"/>' },
    { id: 5, name: 'Dolu Elmas (Baklava)', desc: 'Lüks odaklama ve mülk işaretleme baklavası', iconSvg: '<path d="M4 12 L12 12 M12 12 L15 7 L19 12 L15 17 Z" fill="currentColor" stroke="currentColor" stroke-width="1"/>' },
    { id: 6, name: 'İçi Boş Elmas', desc: 'Zarif ve şeffaf merkezli elmas gösterge', iconSvg: '<path d="M4 12 L11 12 M11 12 L15 7 L19 12 L15 17 Z" fill="none" stroke="currentColor" stroke-width="1.8"/>' },
    { id: 7, name: 'Dairesel Dolu Nokta', desc: 'Yuvarlak dolu nokta ile kesin konum belirtici', iconSvg: '<path d="M4 12 L13 12" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="12" r="3.5" fill="currentColor"/>' },
    { id: 8, name: 'Hedef / Halka', desc: 'İçi boş halka odaklama göstergesi', iconSvg: '<path d="M4 12 L13 12" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/>' },
    { id: 9, name: 'Kare / Teknik Blok', desc: 'Plan ve mimari ölçü için dolu kare blok', iconSvg: '<path d="M4 12 L13 12" stroke="currentColor" stroke-width="2"/><rect x="13" y="8.5" width="6.5" height="7" fill="currentColor"/>' },
    { id: 10, name: 'İçi Boş Kare', desc: 'Teknik mimari çerçeve blok', iconSvg: '<path d="M4 12 L13 12" stroke="currentColor" stroke-width="2"/><rect x="13" y="8.5" width="6.5" height="7" fill="none" stroke="currentColor" stroke-width="1.8"/>' },
    { id: 11, name: 'T-Çizgi / Stoper', desc: 'Mimari sınır, limit ve cephe çizgisi', iconSvg: '<path d="M4 12 L17 12 M17 6 L17 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
    { id: 12, name: '45° Çapraz Kesit', desc: 'AutoCAD / Mimari ölçülendirme çentiği', iconSvg: '<path d="M4 12 L16 12 M12 17 L18 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
    { id: 13, name: 'Çift Katman Ok', desc: 'Arka arkaya çift kademeli vurgulayıcı ok', iconSvg: '<path d="M3 12 L12 12 M8 7 L14 12 L8 17 Z M13 7 L19 12 L13 17 Z" fill="currentColor"/>' },
    { id: 14, name: 'Üç Katman Akış', desc: 'Yön ve akış belirten 3 kademeli ok', iconSvg: '<path d="M6 7 L11 12 L6 17 M10 7 L15 12 L10 17 M14 7 L19 12 L14 17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' },
    { id: 15, name: 'Kavisli Bıçak', desc: 'Dışa bombeli kavisli dinamik uç', iconSvg: '<path d="M4 12 L13 12 M11 7 Q16 10 19 12 Q16 14 11 17 Q13 12 11 7 Z" fill="currentColor"/>' },
    { id: 16, name: 'Yumuşak Yuvarlak Üçgen', desc: 'Köşeleri yuvarlatılmış estetik üçgen uç', iconSvg: '<path d="M4 12 L13 12 M11 7 L18 12 L11 17 Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' },
    { id: 17, name: 'İğne Roket Dart', desc: 'Uzun ve çok keskin fırlatma oku', iconSvg: '<path d="M4 12 L11 12 M8 9 L20 12 L8 15 L10 12 Z" fill="currentColor"/>' },
    { id: 18, name: 'Harita Pini (Nokta-Ok)', desc: 'Başlangıçta nokta, bitişte keskin ok ucu', iconSvg: '<circle cx="5" cy="12" r="2.5" fill="currentColor"/><path d="M7 12 L14 12 M11 7 L19 12 L11 17 Z" fill="currentColor" stroke="currentColor" stroke-width="1.2"/>' },
    { id: 19, name: 'Çift Yönlü Mimari Ok', desc: 'İki ucunda da keskin üçgen olan ölçü oku', iconSvg: '<path d="M8 12 L16 12 M9 7 L4 12 L9 17 Z M15 7 L20 12 L15 17 Z" fill="currentColor"/>' },
    { id: 20, name: 'T-Bar ve Ok Kombosu', desc: 'Başlangıçta T stoper, bitişte keskin ok', iconSvg: '<path d="M5 6 L5 18 M5 12 L14 12 M11 7 L19 12 L11 17 Z" fill="currentColor" stroke="currentColor" stroke-width="1.5"/>' }
];

window.currentSelectedArrowStyle = 1;

function arrowHead(ctx, x1, y1, x2, y2, w, color, op, style, dir = 'outward') {
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.save();
    ctx.setLineDash([]);
    ctx.globalAlpha = op || 1;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = w;
    
    function drawHeadAt(tipX, tipY, angle, isStart = false) {
        ctx.beginPath();
        const s = parseInt(style) || 1;
        const baseH = Math.max(w * 4.5, 14);
        const baseW = Math.max(w * 2.2, 7);

        switch(s) {
            case 1: { // 1. Klasik Keskin Ok (Sharp Triangle)
                const h = baseH;
                ctx.moveTo(tipX, tipY);
                ctx.lineTo(tipX - h * Math.cos(angle - 0.42), tipY - h * Math.sin(angle - 0.42));
                ctx.lineTo(tipX - h * Math.cos(angle + 0.42), tipY - h * Math.sin(angle + 0.42));
                ctx.closePath();
                ctx.fill();
                break;
            }
            case 2: { // 2. Stealth / Çentikli Kanat (Stealth Wing)
                const h = baseH * 1.1;
                ctx.moveTo(tipX, tipY);
                ctx.lineTo(tipX - h * Math.cos(angle - 0.45), tipY - h * Math.sin(angle - 0.45));
                ctx.lineTo(tipX - (h * 0.5) * Math.cos(angle), tipY - (h * 0.5) * Math.sin(angle));
                ctx.lineTo(tipX - h * Math.cos(angle + 0.45), tipY - h * Math.sin(angle + 0.45));
                ctx.closePath();
                ctx.fill();
                break;
            }
            case 3: { // 3. Zarif Açık V (Minimalist Open V)
                const h = baseH * 1.1;
                ctx.lineWidth = Math.max(w * 1.1, 2.5);
                ctx.moveTo(tipX - h * Math.cos(angle - 0.5), tipY - h * Math.sin(angle - 0.5));
                ctx.lineTo(tipX, tipY);
                ctx.lineTo(tipX - h * Math.cos(angle + 0.5), tipY - h * Math.sin(angle + 0.5));
                ctx.stroke();
                break;
            }
            case 4: { // 4. Kalın Dolu Chevron
                const h = baseH;
                const thick = Math.max(w * 1.5, 5);
                ctx.moveTo(tipX, tipY);
                ctx.lineTo(tipX - h * Math.cos(angle - 0.5), tipY - h * Math.sin(angle - 0.5));
                ctx.lineTo(tipX - (h - thick) * Math.cos(angle - 0.5) - thick * Math.cos(angle), tipY - (h - thick) * Math.sin(angle - 0.5) - thick * Math.sin(angle));
                ctx.lineTo(tipX - thick * 1.2 * Math.cos(angle), tipY - thick * 1.2 * Math.sin(angle));
                ctx.lineTo(tipX - (h - thick) * Math.cos(angle + 0.5) - thick * Math.cos(angle), tipY - (h - thick) * Math.sin(angle + 0.5) - thick * Math.sin(angle));
                ctx.lineTo(tipX - h * Math.cos(angle + 0.5), tipY - h * Math.sin(angle + 0.5));
                ctx.closePath();
                ctx.fill();
                break;
            }
            case 5: { // 5. Dolu Elmas (Baklava)
                const h = baseH * 0.7;
                ctx.moveTo(tipX, tipY);
                ctx.lineTo(tipX - h * Math.cos(angle - 0.5), tipY - h * Math.sin(angle - 0.5));
                ctx.lineTo(tipX - (h * 2) * Math.cos(angle), tipY - (h * 2) * Math.sin(angle));
                ctx.lineTo(tipX - h * Math.cos(angle + 0.5), tipY - h * Math.sin(angle + 0.5));
                ctx.closePath();
                ctx.fill();
                break;
            }
            case 6: { // 6. İçi Boş Elmas
                const h = baseH * 0.7;
                ctx.lineWidth = Math.max(w, 2);
                ctx.moveTo(tipX, tipY);
                ctx.lineTo(tipX - h * Math.cos(angle - 0.5), tipY - h * Math.sin(angle - 0.5));
                ctx.lineTo(tipX - (h * 2) * Math.cos(angle), tipY - (h * 2) * Math.sin(angle));
                ctx.lineTo(tipX - h * Math.cos(angle + 0.5), tipY - h * Math.sin(angle + 0.5));
                ctx.closePath();
                ctx.stroke();
                break;
            }
            case 7: { // 7. Dairesel Dolu Nokta
                const r = baseW;
                ctx.arc(tipX, tipY, r, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 8: { // 8. Hedef / Halka
                const r = baseW;
                ctx.lineWidth = Math.max(w, 2.5);
                ctx.arc(tipX, tipY, r, 0, Math.PI * 2);
                ctx.stroke();
                break;
            }
            case 9: { // 9. Kare / Teknik Blok
                const s = baseW * 1.6;
                ctx.save();
                ctx.translate(tipX, tipY);
                ctx.rotate(angle);
                ctx.fillRect(-s / 2, -s / 2, s, s);
                ctx.restore();
                break;
            }
            case 10: { // 10. İçi Boş Kare
                const s = baseW * 1.6;
                ctx.lineWidth = Math.max(w, 2);
                ctx.save();
                ctx.translate(tipX, tipY);
                ctx.rotate(angle);
                ctx.strokeRect(-s / 2, -s / 2, s, s);
                ctx.restore();
                break;
            }
            case 11: { // 11. T-Çizgi / Stoper
                const barLen = Math.max(w * 5, 16);
                ctx.lineWidth = Math.max(w * 1.1, 2.5);
                ctx.moveTo(tipX - (barLen / 2) * Math.cos(angle + Math.PI / 2), tipY - (barLen / 2) * Math.sin(angle + Math.PI / 2));
                ctx.lineTo(tipX + (barLen / 2) * Math.cos(angle + Math.PI / 2), tipY + (barLen / 2) * Math.sin(angle + Math.PI / 2));
                ctx.stroke();
                break;
            }
            case 12: { // 12. 45° Çapraz Kesit
                const slashLen = Math.max(w * 5, 16);
                ctx.lineWidth = Math.max(w * 1.1, 2.5);
                ctx.moveTo(tipX - (slashLen / 2) * Math.cos(angle + Math.PI / 4), tipY - (slashLen / 2) * Math.sin(angle + Math.PI / 4));
                ctx.lineTo(tipX + (slashLen / 2) * Math.cos(angle + Math.PI / 4), tipY + (slashLen / 2) * Math.sin(angle + Math.PI / 4));
                ctx.stroke();
                break;
            }
            case 13: { // 13. Çift Katman Ok
                const h = baseH * 0.85;
                ctx.moveTo(tipX, tipY);
                ctx.lineTo(tipX - h * Math.cos(angle - 0.45), tipY - h * Math.sin(angle - 0.45));
                ctx.lineTo(tipX - h * Math.cos(angle + 0.45), tipY - h * Math.sin(angle + 0.45));
                ctx.closePath();
                ctx.fill();
                
                ctx.beginPath();
                const offset = h * 0.8;
                ctx.moveTo(tipX - offset * Math.cos(angle), tipY - offset * Math.sin(angle));
                ctx.lineTo(tipX - (offset + h) * Math.cos(angle - 0.45), tipY - (offset + h) * Math.sin(angle - 0.45));
                ctx.lineTo(tipX - (offset + h) * Math.cos(angle + 0.45), tipY - (offset + h) * Math.sin(angle + 0.45));
                ctx.closePath();
                ctx.fill();
                break;
            }
            case 14: { // 14. Üç Katman Akış
                const h = baseH * 0.7;
                ctx.lineWidth = Math.max(w, 2);
                for (let i = 0; i < 3; i++) {
                    const off = i * (h * 0.65);
                    const tx = tipX - off * Math.cos(angle);
                    const ty = tipY - off * Math.sin(angle);
                    ctx.beginPath();
                    ctx.moveTo(tx - h * Math.cos(angle - 0.5), ty - h * Math.sin(angle - 0.5));
                    ctx.lineTo(tx, ty);
                    ctx.lineTo(tx - h * Math.cos(angle + 0.5), ty - h * Math.sin(angle + 0.5));
                    ctx.stroke();
                }
                break;
            }
            case 15: { // 15. Kavisli Bıçak
                const h = baseH * 1.1;
                ctx.moveTo(tipX, tipY);
                const cp1x = tipX - h * 0.4 * Math.cos(angle) - h * 0.6 * Math.sin(angle);
                const cp1y = tipY - h * 0.4 * Math.sin(angle) + h * 0.6 * Math.cos(angle);
                const p1x = tipX - h * Math.cos(angle - 0.5);
                const p1y = tipY - h * Math.sin(angle - 0.5);
                ctx.quadraticCurveTo(cp1x, cp1y, p1x, p1y);
                ctx.lineTo(tipX - (h * 0.4) * Math.cos(angle), tipY - (h * 0.4) * Math.sin(angle));
                const p2x = tipX - h * Math.cos(angle + 0.5);
                const p2y = tipY - h * Math.sin(angle + 0.5);
                ctx.lineTo(p2x, p2y);
                const cp2x = tipX - h * 0.4 * Math.cos(angle) + h * 0.6 * Math.sin(angle);
                const cp2y = tipY - h * 0.4 * Math.sin(angle) - h * 0.6 * Math.cos(angle);
                ctx.quadraticCurveTo(cp2x, cp2y, tipX, tipY);
                ctx.closePath();
                ctx.fill();
                break;
            }
            case 16: { // 16. Yumuşak Yuvarlak Üçgen
                const h = baseH;
                ctx.lineWidth = Math.max(w, 2);
                ctx.lineJoin = 'round';
                ctx.moveTo(tipX, tipY);
                ctx.lineTo(tipX - h * Math.cos(angle - 0.45), tipY - h * Math.sin(angle - 0.45));
                ctx.lineTo(tipX - h * Math.cos(angle + 0.45), tipY - h * Math.sin(angle + 0.45));
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
            }
            case 17: { // 17. İğne Roket Dart
                const h = baseH * 1.5;
                ctx.moveTo(tipX, tipY);
                ctx.lineTo(tipX - h * Math.cos(angle - 0.28), tipY - h * Math.sin(angle - 0.28));
                ctx.lineTo(tipX - (h * 0.65) * Math.cos(angle), tipY - (h * 0.65) * Math.sin(angle));
                ctx.lineTo(tipX - h * Math.cos(angle + 0.28), tipY - h * Math.sin(angle + 0.28));
                ctx.closePath();
                ctx.fill();
                break;
            }
            case 18: { // 18. Harita Pini (Nokta-Ok)
                if (isStart) {
                    ctx.arc(tipX, tipY, baseW, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    const h = baseH;
                    ctx.moveTo(tipX, tipY);
                    ctx.lineTo(tipX - h * Math.cos(angle - 0.42), tipY - h * Math.sin(angle - 0.42));
                    ctx.lineTo(tipX - h * Math.cos(angle + 0.42), tipY - h * Math.sin(angle + 0.42));
                    ctx.closePath();
                    ctx.fill();
                }
                break;
            }
            case 19: { // 19. Çift Yönlü Mimari Ok
                const h = baseH;
                ctx.moveTo(tipX, tipY);
                ctx.lineTo(tipX - h * Math.cos(angle - 0.42), tipY - h * Math.sin(angle - 0.42));
                ctx.lineTo(tipX - h * Math.cos(angle + 0.42), tipY - h * Math.sin(angle + 0.42));
                ctx.closePath();
                ctx.fill();
                break;
            }
            case 20: { // 20. T-Bar ve Ok Kombosu
                if (isStart) {
                    const barLen = Math.max(w * 5, 16);
                    ctx.lineWidth = Math.max(w * 1.1, 2.5);
                    ctx.moveTo(tipX - (barLen / 2) * Math.cos(angle + Math.PI / 2), tipY - (barLen / 2) * Math.sin(angle + Math.PI / 2));
                    ctx.lineTo(tipX + (barLen / 2) * Math.cos(angle + Math.PI / 2), tipY + (barLen / 2) * Math.sin(angle + Math.PI / 2));
                    ctx.stroke();
                } else {
                    const h = baseH;
                    ctx.moveTo(tipX, tipY);
                    ctx.lineTo(tipX - h * Math.cos(angle - 0.42), tipY - h * Math.sin(angle - 0.42));
                    ctx.lineTo(tipX - h * Math.cos(angle + 0.42), tipY - h * Math.sin(angle + 0.42));
                    ctx.closePath();
                    ctx.fill();
                }
                break;
            }
            default: {
                const h = baseH;
                ctx.moveTo(tipX, tipY);
                ctx.lineTo(tipX - h * Math.cos(angle - 0.42), tipY - h * Math.sin(angle - 0.42));
                ctx.lineTo(tipX - h * Math.cos(angle + 0.42), tipY - h * Math.sin(angle + 0.42));
                ctx.closePath();
                ctx.fill();
                break;
            }
        }
    }
    
    const sId = parseInt(style) || 1;
    // Kombinasyon stilleri için (18, 19, 20):
    if (sId === 18 || sId === 19 || sId === 20) {
        drawHeadAt(x2, y2, a, false);
        drawHeadAt(x1, y1, a + Math.PI, true);
    } else {
        if (dir === 'outward' || dir === 'both') {
            drawHeadAt(x2, y2, a, false);
        }
        if (dir === 'inward' || dir === 'both') {
            drawHeadAt(x1, y1, a + Math.PI, true);
        }
    }
    ctx.restore();
}

// ==================== 🏹 20 OK STİLİ SVG RENDER YARDIMCISI ====================
window.renderSvgArrowHeadsGroup = function(x1, y1, x2, y2, angle, width, color, fillStr, filterAttr, styleId, dir) {
    const s = parseInt(styleId) || 1;
    const baseH = Math.max(width * 4.5, 14);
    const baseW = Math.max(width * 2.2, 7);
    
    function renderSingleHead(tipX, tipY, headAngle, isStart = false) {
        const cos = (rad) => Math.cos(headAngle + rad);
        const sin = (rad) => Math.sin(headAngle + rad);
        let headSvg = '';
        
        switch(s) {
            case 1: { // 1. Klasik Keskin Ok
                const h = baseH;
                headSvg = `<polygon points="${tipX},${tipY} ${tipX - h * cos(-0.42)},${tipY - h * sin(-0.42)} ${tipX - h * cos(0.42)},${tipY - h * sin(0.42)}" ${fillStr} ${filterAttr} />`;
                break;
            }
            case 2: { // 2. Stealth / Çentikli Kanat
                const h = baseH * 1.1;
                headSvg = `<polygon points="${tipX},${tipY} ${tipX - h * cos(-0.45)},${tipY - h * sin(-0.45)} ${tipX - (h*0.5)*cos(0)},${tipY - (h*0.5)*sin(0)} ${tipX - h * cos(0.45)},${tipY - h * sin(0.45)}" ${fillStr} ${filterAttr} />`;
                break;
            }
            case 3: { // 3. Zarif Açık V
                const h = baseH * 1.1;
                const strokeW = Math.max(width * 1.1, 2.5);
                headSvg = `<polyline points="${tipX - h * cos(-0.5)},${tipY - h * sin(-0.5)} ${tipX},${tipY} ${tipX - h * cos(0.5)},${tipY - h * sin(0.5)}" stroke="${color}" stroke-width="${strokeW}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${filterAttr} />`;
                break;
            }
            case 4: { // 4. Kalın Dolu Chevron
                const h = baseH;
                const thick = Math.max(width * 1.5, 5);
                const p1x = tipX - h * cos(-0.5), p1y = tipY - h * sin(-0.5);
                const p2x = tipX - (h - thick) * cos(-0.5) - thick * cos(0), p2y = tipY - (h - thick) * sin(-0.5) - thick * sin(0);
                const p3x = tipX - thick * 1.2 * cos(0), p3y = tipY - thick * 1.2 * sin(0);
                const p4x = tipX - (h - thick) * cos(0.5) - thick * cos(0), p4y = tipY - (h - thick) * sin(0.5) - thick * sin(0);
                const p5x = tipX - h * cos(0.5), p5y = tipY - h * sin(0.5);
                headSvg = `<polygon points="${tipX},${tipY} ${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y} ${p4x},${p4y} ${p5x},${p5y}" ${fillStr} ${filterAttr} />`;
                break;
            }
            case 5: { // 5. Dolu Elmas
                const h = baseH * 0.7;
                headSvg = `<polygon points="${tipX},${tipY} ${tipX - h * cos(-0.5)},${tipY - h * sin(-0.5)} ${tipX - h * 2 * cos(0)},${tipY - h * 2 * sin(0)} ${tipX - h * cos(0.5)},${tipY - h * sin(0.5)}" ${fillStr} ${filterAttr} />`;
                break;
            }
            case 6: { // 6. İçi Boş Elmas
                const h = baseH * 0.7;
                const strokeW = Math.max(width, 2);
                headSvg = `<polygon points="${tipX},${tipY} ${tipX - h * cos(-0.5)},${tipY - h * sin(-0.5)} ${tipX - h * 2 * cos(0)},${tipY - h * 2 * sin(0)} ${tipX - h * cos(0.5)},${tipY - h * sin(0.5)}" stroke="${color}" stroke-width="${strokeW}" fill="none" ${filterAttr} />`;
                break;
            }
            case 7: { // 7. Dairesel Dolu Nokta
                headSvg = `<circle cx="${tipX}" cy="${tipY}" r="${baseW}" ${fillStr} ${filterAttr} />`;
                break;
            }
            case 8: { // 8. Hedef / Halka
                const strokeW = Math.max(width, 2.5);
                headSvg = `<circle cx="${tipX}" cy="${tipY}" r="${baseW}" stroke="${color}" stroke-width="${strokeW}" fill="none" ${filterAttr} />`;
                break;
            }
            case 9: { // 9. Kare Blok
                const sSize = baseW * 1.6;
                headSvg = `<g transform="translate(${tipX},${tipY}) rotate(${headAngle * 180 / Math.PI})" ${filterAttr}><rect x="${-sSize/2}" y="${-sSize/2}" width="${sSize}" height="${sSize}" ${fillStr} /></g>`;
                break;
            }
            case 10: { // 10. İçi Boş Kare
                const sSize = baseW * 1.6;
                const strokeW = Math.max(width, 2);
                headSvg = `<g transform="translate(${tipX},${tipY}) rotate(${headAngle * 180 / Math.PI})" ${filterAttr}><rect x="${-sSize/2}" y="${-sSize/2}" width="${sSize}" height="${sSize}" stroke="${color}" stroke-width="${strokeW}" fill="none" /></g>`;
                break;
            }
            case 11: { // 11. T-Çizgi / Stoper
                const barLen = Math.max(width * 5, 16);
                const strokeW = Math.max(width * 1.1, 2.5);
                headSvg = `<line x1="${tipX - (barLen/2) * cos(Math.PI/2)}" y1="${tipY - (barLen/2) * sin(Math.PI/2)}" x2="${tipX + (barLen/2) * cos(Math.PI/2)}" y2="${tipY + (barLen/2) * sin(Math.PI/2)}" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round" ${filterAttr} />`;
                break;
            }
            case 12: { // 12. 45° Çapraz Kesit
                const slashLen = Math.max(width * 5, 16);
                const strokeW = Math.max(width * 1.1, 2.5);
                headSvg = `<line x1="${tipX - (slashLen/2) * cos(Math.PI/4)}" y1="${tipY - (slashLen/2) * sin(Math.PI/4)}" x2="${tipX + (slashLen/2) * cos(Math.PI/4)}" y2="${tipY + (slashLen/2) * sin(Math.PI/4)}" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round" ${filterAttr} />`;
                break;
            }
            case 13: { // 13. Çift Katman Ok
                const h = baseH * 0.85;
                const off = h * 0.8;
                headSvg = `<polygon points="${tipX},${tipY} ${tipX - h * cos(-0.45)},${tipY - h * sin(-0.45)} ${tipX - h * cos(0.45)},${tipY - h * sin(0.45)}" ${fillStr} ${filterAttr} />`;
                headSvg += `<polygon points="${tipX - off * cos(0)},${tipY - off * sin(0)} ${tipX - (off+h) * cos(-0.45)},${tipY - (off+h) * sin(-0.45)} ${tipX - (off+h) * cos(0.45)},${tipY - (off+h) * sin(0.45)}" ${fillStr} ${filterAttr} />`;
                break;
            }
            case 14: { // 14. Üç Katman Akış
                const h = baseH * 0.7;
                const strokeW = Math.max(width, 2);
                for (let i = 0; i < 3; i++) {
                    const off = i * (h * 0.65);
                    const tx = tipX - off * cos(0);
                    const ty = tipY - off * sin(0);
                    headSvg += `<polyline points="${tx - h * cos(-0.5)},${ty - h * sin(-0.5)} ${tx},${ty} ${tx - h * cos(0.5)},${ty - h * sin(0.5)}" stroke="${color}" stroke-width="${strokeW}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${filterAttr} />`;
                }
                break;
            }
            case 15: { // 15. Kavisli Bıçak
                const h = baseH * 1.1;
                headSvg = `<polygon points="${tipX},${tipY} ${tipX - h * cos(-0.5)},${tipY - h * sin(-0.5)} ${tipX - (h*0.4)*cos(0)},${tipY - (h*0.4)*sin(0)} ${tipX - h * cos(0.5)},${tipY - h * sin(0.5)}" ${fillStr} ${filterAttr} />`;
                break;
            }
            case 16: { // 16. Yumuşak Yuvarlak Üçgen
                const h = baseH;
                headSvg = `<polygon points="${tipX},${tipY} ${tipX - h * cos(-0.45)},${tipY - h * sin(-0.45)} ${tipX - h * cos(0.45)},${tipY - h * sin(0.45)}" ${fillStr} stroke="${color}" stroke-width="${Math.max(width, 2)}" stroke-linejoin="round" ${filterAttr} />`;
                break;
            }
            case 17: { // 17. İğne Roket Dart
                const h = baseH * 1.5;
                headSvg = `<polygon points="${tipX},${tipY} ${tipX - h * cos(-0.28)},${tipY - h * sin(-0.28)} ${tipX - (h*0.65)*cos(0)},${tipY - (h*0.65)*sin(0)} ${tipX - h * cos(0.28)},${tipY - h * sin(0.28)}" ${fillStr} ${filterAttr} />`;
                break;
            }
            case 18: { // 18. Harita Pini (Nokta-Ok)
                if (isStart) {
                    headSvg = `<circle cx="${tipX}" cy="${tipY}" r="${baseW}" ${fillStr} ${filterAttr} />`;
                } else {
                    const h = baseH;
                    headSvg = `<polygon points="${tipX},${tipY} ${tipX - h * cos(-0.42)},${tipY - h * sin(-0.42)} ${tipX - h * cos(0.42)},${tipY - h * sin(0.42)}" ${fillStr} ${filterAttr} />`;
                }
                break;
            }
            case 19: { // 19. Çift Yönlü Mimari Ok
                const h = baseH;
                headSvg = `<polygon points="${tipX},${tipY} ${tipX - h * cos(-0.42)},${tipY - h * sin(-0.42)} ${tipX - h * cos(0.42)},${tipY - h * sin(0.42)}" ${fillStr} ${filterAttr} />`;
                break;
            }
            case 20: { // 20. T-Bar ve Ok Kombosu
                if (isStart) {
                    const barLen = Math.max(width * 5, 16);
                    const strokeW = Math.max(width * 1.1, 2.5);
                    headSvg = `<line x1="${tipX - (barLen/2) * cos(Math.PI/2)}" y1="${tipY - (barLen/2) * sin(Math.PI/2)}" x2="${tipX + (barLen/2) * cos(Math.PI/2)}" y2="${tipY + (barLen/2) * sin(Math.PI/2)}" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round" ${filterAttr} />`;
                } else {
                    const h = baseH;
                    headSvg = `<polygon points="${tipX},${tipY} ${tipX - h * cos(-0.42)},${tipY - h * sin(-0.42)} ${tipX - h * cos(0.42)},${tipY - h * sin(0.42)}" ${fillStr} ${filterAttr} />`;
                }
                break;
            }
            default: {
                const h = baseH;
                headSvg = `<polygon points="${tipX},${tipY} ${tipX - h * cos(-0.42)},${tipY - h * sin(-0.42)} ${tipX - h * cos(0.42)},${tipY - h * sin(0.42)}" ${fillStr} ${filterAttr} />`;
                break;
            }
        }
        return headSvg;
    }
    
    let result = '';
    const sId = parseInt(s) || 1;
    if (sId === 18 || sId === 19 || sId === 20) {
        result += renderSingleHead(x2, y2, angle, false);
        result += renderSingleHead(x1, y1, angle + Math.PI, true);
    } else {
        if (dir === 'outward' || dir === 'both') {
            result += renderSingleHead(x2, y2, angle, false);
        }
        if (dir === 'inward' || dir === 'both') {
            result += renderSingleHead(x1, y1, angle + Math.PI, true);
        }
    }
    return result;
};

// ==================== 🎯 OK STİLİ SEÇİCİ POPOVER ====================
window.toggleArrowPicker = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    let popover = document.getElementById('arrowPickerPopover');
    if (!popover) {
        window.createArrowPickerPopover();
        popover = document.getElementById('arrowPickerPopover');
    }
    if (!popover) return;
    
    const isVisible = popover.style.display === 'block';
    if (isVisible) {
        window.closeArrowPicker();
    } else {
        window.openArrowPicker(e);
    }
};

window.arrowPickerDocClick = function(e) {
    if (!e.target.closest('#arrowPickerPopover') && !e.target.closest('#dmArrow')) {
        window.closeArrowPicker();
    }
};

window.openArrowPicker = function(e) {
    let popover = document.getElementById('arrowPickerPopover');
    if (!popover) {
        window.createArrowPickerPopover();
        popover = document.getElementById('arrowPickerPopover');
    }
    if (!popover) return;
    
    // Aktif kartı güncelle
    const currId = window.currentSelectedArrowStyle || ($('arrowStyleSelect') ? parseInt($('arrowStyleSelect').value) : 1);
    popover.querySelectorAll('.arrow-style-card').forEach(card => {
        const id = parseInt(card.dataset.styleId);
        card.classList.toggle('active', id === currId);
    });
    
    // Konumlandırma
    const btn = document.getElementById('dmArrow');
    if (btn) {
        const rect = btn.getBoundingClientRect();
        let top = rect.bottom + 6;
        let left = rect.left;
        
        // Ekrandan taşma kontrolü
        if (left + 320 > window.innerWidth - 10) {
            left = window.innerWidth - 330;
        }
        if (left < 10) left = 10;
        if (top + 320 > window.innerHeight - 10) {
            top = Math.max(10, rect.top - 320);
        }
        
        popover.style.top = top + 'px';
        popover.style.left = left + 'px';
    }
    popover.style.display = 'block';

    // Click handler'ı bağla
    document.removeEventListener('click', window.arrowPickerDocClick);
    setTimeout(() => {
        document.addEventListener('click', window.arrowPickerDocClick);
    }, 10);
};

window.closeArrowPicker = function() {
    const popover = document.getElementById('arrowPickerPopover');
    if (popover) popover.style.display = 'none';
    if (typeof window.arrowPickerDocClick === 'function') {
        document.removeEventListener('click', window.arrowPickerDocClick);
    }
};

window.selectArrowStyle = function(styleId) {
    styleId = parseInt(styleId) || 1;
    window.currentSelectedArrowStyle = styleId;
    
    // Form elemanlarını güncelle
    if ($('arrowStyleSelect')) $('arrowStyleSelect').value = styleId;
    if ($('deArrowStyle')) $('deArrowStyle').value = styleId;
    
    // Çizim modunu ok yap
    setDrawMode('arrow');
    
    // Seçili ok varsa anında güncelle
    if (typeof liveUpdateDrawEdit === 'function') {
        liveUpdateDrawEdit();
    }
    
    window.closeArrowPicker();
};

window.createArrowPickerPopover = function() {
    if (document.getElementById('arrowPickerPopover')) return;
    
    const popover = document.createElement('div');
    popover.id = 'arrowPickerPopover';
    popover.className = 'arrow-picker-popover';
    popover.style.display = 'none';
    
    let cardsHtml = '';
    window.ARROW_STYLES.forEach(st => {
        cardsHtml += `
            <div class="arrow-style-card" data-style-id="${st.id}" onclick="window.selectArrowStyle(${st.id})" title="${st.name}: ${st.desc}">
                <div class="arrow-style-svg">
                    <svg viewBox="0 0 24 24" width="24" height="24" style="overflow:visible;">${st.iconSvg}</svg>
                </div>
                <div class="arrow-style-num">#${st.id}</div>
            </div>
        `;
    });
    
    popover.innerHTML = `
        <div class="arrow-picker-header">
            <div class="arrow-picker-title">
                <span>🏹 20 Profesyonel Ok Ucu</span>
            </div>
            <button type="button" class="arrow-picker-close" onclick="window.closeArrowPicker()">✕</button>
        </div>
        <div class="arrow-style-grid">
            ${cardsHtml}
        </div>
    `;
    
    document.body.appendChild(popover);
};

function redrawAll(){
    const w=drawCanvas.width||1920;
    const h=drawCanvas.height||1080;
    drawCtx.clearRect(0,0,w,h);
    
    // Saber motorunu drawCanvas boyutuna tam uydur
    if (window.SaberEngine && typeof window.SaberEngine.resize === 'function') {
        window.SaberEngine.resize(w, h);
    }
    
    // draw-layer and ui-layer now sit in canvas-container natively.
    // Since canva-render-layer no longer creates a stacking context,
    // they interleave with cvr-base children (photo-panel z:1, decorations z:100) automatically!
    const container = document.getElementById('canvas-container');
    if (container && drawCanvas.parentNode !== container) {
        container.appendChild(drawCanvas);
    }

    try {
        drawPaths.forEach(p=>drawSinglePath(p));
    } catch(e) {
        console.error("RedrawAll error:", e);
        const errDiv = document.createElement("div");
        errDiv.style.position = "fixed";
        errDiv.style.top = "10px";
        errDiv.style.left = "10px";
        errDiv.style.background = "red";
        errDiv.style.color = "white";
        errDiv.style.padding = "10px";
        errDiv.style.zIndex = "999999";
        errDiv.innerText = "DRAW ERROR: " + e.message;
        document.body.appendChild(errDiv);
    }

    // Statik neon modunda Pixi WebGL tuvalini anında render et (kaydırma sırasında milimetrik senkronizasyon)
    if (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') {
        const sApp = window.SaberEngine.getApp();
        if (sApp && sApp.renderer && sApp.stage && (!sApp.ticker || !sApp.ticker.started)) {
            try { sApp.renderer.render(sApp.stage); } catch(e) {}
        }
    }
}

function undoLastDraw() {
    if (typeof window.undoGlobal === 'function') {
        window.undoGlobal();
        return;
    }
    if (drawPaths.length > 0) {
        const last = drawPaths.pop();
        if (typeof drawRedoPaths !== 'undefined') drawRedoPaths.push(last);
        if (last.el) {
            last.el.remove();
            last.el = null; // Ensure it gets recreated on redo
        }
        if (last.saberRef && window.SaberEngine) {
            try {
                const sabers = SaberEngine.getSabers();
                const saberIdx = sabers.indexOf(last.saberRef);
                if (saberIdx > -1) {
                    const s = sabers[saberIdx];
                    if (s.graphics && s.graphics.parent) s.graphics.parent.removeChild(s.graphics);
                    if (s.particleContainer && s.particleContainer.parent) s.particleContainer.parent.removeChild(s.particleContainer);
                    if (s.branchContainer && s.branchContainer.parent) s.branchContainer.parent.removeChild(s.branchContainer);
                    sabers.splice(saberIdx, 1);
                }
                last.saberRef = null;
            } catch(e) { console.warn('Saber undo hatası:', e); }
        }
    }
    redrawAll();
    updateDrawHistory();
    cancelDrawEdit();
}

function redoLastDraw() {
    if (typeof window.redoGlobal === 'function') {
        window.redoGlobal();
        return;
    }
    if (typeof drawRedoPaths !== 'undefined' && drawRedoPaths.length > 0) {
        const next = drawRedoPaths.pop();
        drawPaths.push(next);
        if(typeof createSVGFromPath === 'function') {
            const svgEl = createSVGFromPath(next);
            if(svgEl) {
                next.el = svgEl;
                const container = typeof getActiveV4Element === 'function' ? getActiveV4Element() : document.getElementById('photo-layer');
                if(container) container.appendChild(svgEl);
            }
        }
    }
    redrawAll();
    updateDrawHistory();
    cancelDrawEdit();
}

function clearAllDrawings(){
    removeTempPolygonSaber();
    drawPaths.forEach(path => {
        if (path.saberRef && window.SaberEngine) {
            try {
                const app = SaberEngine.getApp();
                const sabers = SaberEngine.getSabers();
                const saberIdx = sabers.indexOf(path.saberRef);
                if (saberIdx > -1) {
                    const s = sabers[saberIdx];
                    if (s.graphics && s.graphics.parent) s.graphics.parent.removeChild(s.graphics);
                    if (s.particleContainer && s.particleContainer.parent) s.particleContainer.parent.removeChild(s.particleContainer);
                    if (s.branchContainer && s.branchContainer.parent) s.branchContainer.parent.removeChild(s.branchContainer);
                    sabers.splice(saberIdx, 1);
                }
            } catch(e) { console.warn('Saber temizleme hatasÃ„Â±:', e); }
        }
        if (path.el) {
            path.el.remove();
            if (typeof allIcons !== 'undefined') {
                const idx = allIcons.indexOf(path.el);
                if(idx > -1) allIcons.splice(idx, 1);
            }
        }
    });
    // Ensure absolutely all SVG drawings are removed even if orphaned
    document.querySelectorAll('.editable-draw').forEach(el => el.remove());
    
    drawPaths=[];
    polygonPoints=[];
    polygonBuilding=false;
    redrawAll();
    updateDrawHistory();
    cancelDrawEdit();
}

function updateDrawHistory(){
    const h=$('drawHistory');
    if (h) {
        if(!drawPaths.length){
            h.innerHTML='<div style="text-align:center;color:#475569;font-size:10px;padding:8px">Henüz çizim yok</div>';
        } else {
            h.innerHTML='';
            const names={free:'<i class="fas fa-pencil-alt"></i> Serbest',line:'<i class="fas fa-grip-lines"></i> Çizgi',arrow:'<i class="fas fa-arrow-right"></i> Ok',rect:'<i class="far fa-square"></i> Kare',circle:'<i class="far fa-circle"></i> Daire',polygon:'<i class="fas fa-draw-polygon"></i> Çokgen'};
            drawPaths.forEach((p,i)=>{
                const item=document.createElement('div');
                item.className='draw-history-item' + (i === editingDrawIndex ? ' active' : '');
                item.onclick = function(e) {
                    if (e.target.closest('.dh-del, .dh-saber, .dh-saber-add, .dh-edit')) return;
                    startDrawEdit(i, false);
                };
                const saberBtn = p.hasSaber ? '' : `<button class="dh-btn dh-saber-add" onclick="addSaberToPath(${i})" title="Neon Ekle"><i class="fas fa-bolt"></i></button>`;
                let activeColor = p.color;
                if (p.hasSaber || p.saber) {
                    const sOpts = p.saberOptions || (window.saberState && window.saberState.active ? window.saberState : null);
                    if (sOpts && sOpts.glowColor) {
                        activeColor = typeof sOpts.glowColor === 'number' 
                            ? '#' + sOpts.glowColor.toString(16).padStart(6, '0') 
                            : sOpts.glowColor;
                    }
                }
                item.innerHTML='<span><span class="dh-color" style="background:'+activeColor+'"></span>'+(names[p.type]||p.type)+' #'+(i+1)+(p.fillOpacity>0?' <i class="fas fa-fill-drip" style="font-size:10px; margin-left:4px;"></i>':'')+'</span><span>'+saberBtn+'<button class="dh-btn dh-edit" onclick="startDrawEdit('+i+', true)" title="Düzenle"><i class="fas fa-pen"></i></button><button class="dh-btn dh-del" onclick="deleteDrawItem('+i+')" title="Sil"><i class="fas fa-trash"></i></button></span>';
                h.appendChild(item);
            });
        }
    }
    if (typeof window.recordHistory === 'function') {
        window.recordHistory('Çizim / Katman güncellendi');
    }
}

function deleteDrawItem(i){
    const path = drawPaths[i];
    if (path) {
        if (path.saberRef && window.SaberEngine) {
            try {
                const app = SaberEngine.getApp();
                const sabers = SaberEngine.getSabers();
                const saberIdx = sabers.indexOf(path.saberRef);
                if (saberIdx > -1) {
                    const s = sabers[saberIdx];
                    if (s.graphics && s.graphics.parent) s.graphics.parent.removeChild(s.graphics);
                    if (s.particleContainer && s.particleContainer.parent) s.particleContainer.parent.removeChild(s.particleContainer);
                    if (s.branchContainer && s.branchContainer.parent) s.branchContainer.parent.removeChild(s.branchContainer);
                    sabers.splice(saberIdx, 1);
                }
            } catch(e) { console.warn('Saber temizleme hatasÄ±:', e); }
        }
        if (path.el) {
            path.el.remove();
            if (typeof allIcons !== 'undefined') {
                const idx = allIcons.indexOf(path.el);
                if(idx > -1) allIcons.splice(idx, 1);
            }
        }
    }
    drawPaths.splice(i,1);
    redrawAll();
    updateDrawHistory();
    cancelDrawEdit();
}

let originalDrawState = null;

function startDrawEdit(i, showPanel = true, isMulti = false){
    editingDrawIndex=i;
    const p=drawPaths[i];
    if(!p) return;
    
    // Canvas üzerinde o ögeyi seç ve tutamaçları göster (yalnızca tekli seçimde!)
    if (!isMulti && (!window.selectedElements || window.selectedElements.length <= 1)) {
        if (p.el && typeof window.selectElement === 'function') {
            if (window.selectedEl !== p.el) {
                window.selectElement(p.el, false, true);
            } else if (typeof showVertexHandles === 'function') {
                showVertexHandles(p.el);
            }
        }
    } else {
        if (typeof hideVertexHandles === 'function') hideVertexHandles();
    }
    
    // Backup original state without circular refs
    const backup = { ...p };
    delete backup.saberRef; 
    delete backup.el;
    delete backup.photoRef;
    try {
        originalDrawState = JSON.parse(JSON.stringify(backup));
        originalDrawState.photoRef = p.photoRef;
    } catch (err) {
        console.error('startDrawEdit JSON error:', err);
        originalDrawState = backup;
    }
    originalDrawState.hasSaber = p.hasSaber;
    if (p.saberOptions) originalDrawState.saberOptions = JSON.parse(JSON.stringify(p.saberOptions));
    originalDrawState.el = p.el;
    originalDrawState.saberRef = p.saberRef;
    
    let activePathColor = p.color;
    if (p.hasSaber || p.saber) {
        const sOpts = p.saberOptions || (window.saberState && window.saberState.active ? window.saberState : null);
        if (sOpts && sOpts.glowColor) {
            activePathColor = typeof sOpts.glowColor === 'number'
                ? '#' + sOpts.glowColor.toString(16).padStart(6, '0')
                : sOpts.glowColor;
        } else if (window.saberState && window.saberState.glowColor) {
            activePathColor = typeof window.saberState.glowColor === 'number'
                ? '#' + window.saberState.glowColor.toString(16).padStart(6, '0')
                : window.saberState.glowColor;
        }
        p.color = activePathColor;
        if (!p.fillColor || p.fillColor === '#ef4444' || p.fillColor === '#e74c3c') {
            p.fillColor = activePathColor;
        }
    }
    
    if($('deColor')) $('deColor').value=activePathColor;
    if($('deWidth')) {
        const scaleRatio = getDrawScaleRatio();
        const rawW = p.rawWidth || Math.max(1, Math.round(p.width / scaleRatio)) || p.width;
        p.rawWidth = rawW;
        $('deWidth').value = rawW;
        if($('deWidthVal')) $('deWidthVal').textContent = rawW;
    }
    if($('deDash')) $('deDash').value = p.dashStyle || 'solid';
    if($('deOpacity'))$('deOpacity').value=Math.round(p.opacity*100);
    if($('deOpacityVal'))$('deOpacityVal').textContent=Math.round(p.opacity*100)+'%';
    if($('deFillColor'))$('deFillColor').value=p.fillColor||activePathColor;
    if($('deFillOp'))$('deFillOp').value=Math.round((p.fillOpacity||0)*100);
    if($('deFillOpVal'))$('deFillOpVal').textContent=Math.round((p.fillOpacity||0)*100)+'%';
    if($('dePolyShowVertices')) {
        $('dePolyShowVertices').checked = p.showVertices !== false;
        $('dePolyShowVertices').parentElement.style.display = (p.type === 'polygon' || p.type === 'rect') ? 'flex' : 'none';
    }
    if($('deArrowSettings')) {
        $('deArrowSettings').style.display = (p.type === 'arrow') ? 'block' : 'none';
        if (p.type === 'arrow') {
            if ($('deArrowDir')) $('deArrowDir').value = p.arrowDir || 'outward';
            if ($('deArrowStyle')) $('deArrowStyle').value = p.arrowStyle || 1;
        }
    }
    
    const isNeon = !!(p.hasSaber || p.saber);
    
    // Normal ayarlar grubu: Sadece Neon KAPALIYKEN görünür
    const normGroup = $('deNormalSettingsGroup');
    if (normGroup) normGroup.style.display = isNeon ? 'none' : 'block';
    
    // Dolgu ayarları grubu: Sadece doldurulabilir şekillerde görünür
    const fillGroup = $('deFillGroup');
    if (fillGroup) {
        const isFillable = (p.type === 'rect' || p.type === 'circle' || p.type === 'polygon' || p.type === 'free');
        fillGroup.style.display = isFillable ? 'block' : 'none';
    }
    
    // SABER UI SETUP
    const toggle = $('deSaberToggle');
    const settings = $('deSaberSettings');
    if (toggle) toggle.checked = isNeon;
    if (settings) {
        settings.style.display = isNeon ? 'flex' : 'none';
        
        const presets = window.SaberEngine ? SaberEngine.presets : {};
        const colors = window.SaberEngine ? SaberEngine.colorPresets : {};
        const currentOpts = p.saberOptions || window.saberState || {};
        
        if ($('deSaberPresets')) {
            $('deSaberPresets').querySelectorAll('.sep-preset').forEach(el => {
                el.classList.toggle('active', el.dataset.preset === (currentOpts.preset || 'fully-lit'));
            });
        }
        
        let colorsHTML = '';
        Object.keys(colors).forEach(key => {
            const c = colors[key];
            const hex = '#' + c.glow.toString(16).padStart(6, '0');
            colorsHTML += `<div class="sep-color" data-color="${key}" style="background:${hex}" title="${key}" onclick="setDrawEditSaberColor('${key}')"></div>`;
        });
        if ($('deSaberColors')) {
            $('deSaberColors').innerHTML = colorsHTML;
            $('deSaberColors').dataset.activeColor = ''; 
        }
        
        if ($('deSaberCoreSize')) { $('deSaberCoreSize').value = currentOpts.coreSize || 4; $('deSaberCoreSizeVal').textContent = currentOpts.coreSize || 4; }
        if ($('deSaberGlowSize')) { $('deSaberGlowSize').value = currentOpts.glowSize || 30; $('deSaberGlowSizeVal').textContent = currentOpts.glowSize || 30; }
        if ($('deSaberIntensity')) { $('deSaberIntensity').value = currentOpts.intensity || 2.5; $('deSaberIntensityVal').textContent = currentOpts.intensity || 2.5; }
        if ($('deSaberFlicker')) { 
            const flicker = Math.round((currentOpts.flickerAmount || 0.05) * 100);
            $('deSaberFlicker').value = flicker; 
            $('deSaberFlickerVal').textContent = flicker; 
        }
        if ($('deSaberPulse')) { $('deSaberPulse').value = currentOpts.pulseSpeed || 0; $('deSaberPulseVal').textContent = currentOpts.pulseSpeed || 0; }
        if ($('deSaberGroundSpill')) {
            const spill = Math.round((currentOpts.groundSpill !== undefined ? currentOpts.groundSpill : 0.4) * 100);
            $('deSaberGroundSpill').value = spill;
            $('deSaberGroundSpillVal').textContent = spill + '%';
        }
        if ($('deSaberEnergyNodes')) {
            $('deSaberEnergyNodes').checked = currentOpts.energyNodes !== false;
        }
    }
    
    if($('drawEditPanel')) {
        $('drawEditPanel').style.display = showPanel ? 'block' : 'none';
    }
    const names={free:'<i class="fas fa-pencil-alt"></i> Serbest',line:'<i class="fas fa-grip-lines"></i> Çizgi',arrow:'<i class="fas fa-arrow-right"></i> Ok',rect:'<i class="far fa-square"></i> Kare',circle:'<i class="far fa-circle"></i> Daire',polygon:'<i class="fas fa-draw-polygon"></i> Çokgen'};
    if($('drawEditLabel')) $('drawEditLabel').innerHTML='#'+(i+1)+' '+(names[p.type]||'');
    if(typeof updateDrawHistory === 'function') updateDrawHistory();
    if(typeof renderLayers === 'function') renderLayers();
}

window.setDrawEditSaberPreset = function(key) {
    if (!$('deSaberPresets')) return;
    $('deSaberPresets').querySelectorAll('.sep-preset').forEach(el => {
        el.classList.toggle('active', el.dataset.preset === key);
    });
    liveUpdateDrawEdit();
};

window.setDrawEditSaberColor = function(key) {
    if (!$('deSaberColors')) return;
    $('deSaberColors').dataset.activeColor = key;
    $('deSaberColors').querySelectorAll('.sep-color').forEach(el => {
        el.classList.toggle('active', el.dataset.color === key);
    });
    liveUpdateDrawEdit();
};

window.cancelDrawEdit = function(){
    if (originalDrawState && editingDrawIndex >= 0 && editingDrawIndex < drawPaths.length) {
        const preservedEl = drawPaths[editingDrawIndex].el || originalDrawState.el;
        const preservedSaber = drawPaths[editingDrawIndex].saberRef || originalDrawState.saberRef;
        drawPaths[editingDrawIndex] = Object.assign({}, originalDrawState);
        if (preservedEl) drawPaths[editingDrawIndex].el = preservedEl;
        if (preservedSaber) drawPaths[editingDrawIndex].saberRef = preservedSaber;
        if (drawPaths[editingDrawIndex].el && typeof updateSinglePathSvg === 'function') {
            updateSinglePathSvg(drawPaths[editingDrawIndex]);
        }
        redrawAll();
    }
    editingDrawIndex=-1;
    originalDrawState=null;
    if($('drawEditPanel'))$('drawEditPanel').style.display='none';
    if(typeof updateDrawHistory === 'function') updateDrawHistory();
    if(typeof renderLayers === 'function') renderLayers();
};

window.saveDrawEdit = function(){
    if(editingDrawIndex<0||editingDrawIndex>=drawPaths.length)return;
    const p=drawPaths[editingDrawIndex];
    if (p.hasSaber && p.saberRef && window.SaberEngine && window.getGlobalScale) {
        const s = window.getGlobalScale();
        p.saberRef.scaleX = s;
        p.saberRef.scaleY = s;
    }
    if (p.el && typeof updateSinglePathSvg === 'function') {
        updateSinglePathSvg(p);
    }
    editingDrawIndex=-1;
    originalDrawState=null;
    if($('drawEditPanel'))$('drawEditPanel').style.display='none';
    redrawAll();
    updateDrawHistory();
    if(typeof renderLayers === 'function') renderLayers();
    if (typeof window.recordHistory === 'function') {
        window.recordHistory('Çizim Düzenlendi');
    }
};

window.applyDrawEdit = function(){
    window.saveDrawEdit();
};

window.toggleCurrentDrawNeon = function() {
    if (typeof editingDrawIndex === 'undefined' || editingDrawIndex < 0 || typeof drawPaths === 'undefined' || !drawPaths[editingDrawIndex]) return;
    const p = drawPaths[editingDrawIndex];
    if (p.hasSaber || p.saber) {
        if (window.removeSaberFromPath) window.removeSaberFromPath(editingDrawIndex);
        p.hasSaber = false;
        p.saber = false;
    } else {
        if (window.addSaberToPath) window.addSaberToPath(editingDrawIndex);
        p.hasSaber = true;
        p.saber = true;
    }
    startDrawEdit(editingDrawIndex, true);
    if (typeof updateDrawHistory === 'function') updateDrawHistory();
};

window.startDrawEdit = startDrawEdit;
window.updateDrawHistory = updateDrawHistory;

let updateSaberTimer = null;

window.liveUpdateDrawEdit = function(){
    if(editingDrawIndex<0||editingDrawIndex>=drawPaths.length)return;
    const p=drawPaths[editingDrawIndex];
    const scaleRatio = getDrawScaleRatio();
    
    if($('deColor')) p.color=$('deColor').value;
    let rawW = 6;
    if($('deWidth')) {
        rawW = +$('deWidth').value;
        p.rawWidth = rawW;
        p.width = Math.max(1, Math.round(rawW * scaleRatio));
    }
    if($('deDash')) p.dashStyle = $('deDash').value;
    if($('deOpacity')) p.opacity=+$('deOpacity').value/100;
    if($('deFillColor')) p.fillColor=$('deFillColor').value;
    if($('deFillOp')) p.fillOpacity=+$('deFillOp').value/100;
    if($('dePolyShowVertices')) p.showVertices = $('dePolyShowVertices').checked;
    if(p.type === 'arrow') {
        if($('deArrowDir')) p.arrowDir = $('deArrowDir').value;
        if($('deArrowStyle')) p.arrowStyle = parseInt($('deArrowStyle').value) || 1;
    }
    
    // Update span labels
    if ($('deWidthVal') && $('deWidth')) $('deWidthVal').textContent = $('deWidth').value;
    if ($('deOpacityVal') && $('deOpacity')) $('deOpacityVal').textContent = $('deOpacity').value + '%';
    if ($('deFillOpVal') && $('deFillOp')) $('deFillOpVal').textContent = $('deFillOp').value + '%';
    
    // SABER UPDATE
    const toggle = $('deSaberToggle');
    const settings = $('deSaberSettings');
    const isNeonActive = !!(p.hasSaber) || !!(p.saber);
    if (toggle) toggle.checked = isNeonActive;
    
    const normGroup = $('deNormalSettingsGroup');
    if (normGroup) normGroup.style.display = isNeonActive ? 'none' : 'block';
    const fillGroup = $('deFillGroup');
    if (fillGroup) {
        const isFillable = (p.type === 'rect' || p.type === 'circle' || p.type === 'polygon' || p.type === 'free');
        fillGroup.style.display = isFillable ? 'block' : 'none';
    }
    if (isNeonActive) {
        if (settings) settings.style.display = 'flex';
        
        const activePresetEl = $('deSaberPresets') ? $('deSaberPresets').querySelector('.active') : null;
        const presetKey = activePresetEl ? activePresetEl.dataset.preset : ((p.saberOptions && p.saberOptions.preset) || (window.saberState && window.saberState.preset) || 'fully-lit');
        
        let coreColor = 0xFFFFFF;
        let glowColor = 0x00CEC9;
        
        const activeColorKey = $('deSaberColors') ? $('deSaberColors').dataset.activeColor : null;
        if (activeColorKey && window.SaberEngine && SaberEngine.colorPresets[activeColorKey]) {
            coreColor = SaberEngine.colorPresets[activeColorKey].core;
            glowColor = SaberEngine.colorPresets[activeColorKey].glow;
        } else if (p.color && p.color.startsWith('#')) {
            glowColor = parseInt(p.color.replace('#', ''), 16) || 0x00CEC9;
            if (p.saberOptions && p.saberOptions.coreColor) coreColor = p.saberOptions.coreColor;
            else if (window.saberState && window.saberState.coreColor) coreColor = window.saberState.coreColor;
        } else if (p.saberOptions && p.saberOptions.glowColor) {
            glowColor = typeof p.saberOptions.glowColor === 'number' ? p.saberOptions.glowColor : (parseInt(p.saberOptions.glowColor.replace('#',''), 16) || 0x00CEC9);
            if (p.saberOptions.coreColor) coreColor = p.saberOptions.coreColor;
            else if (window.saberState && window.saberState.coreColor) coreColor = window.saberState.coreColor;
        } else if (window.saberState) {
            coreColor = saberState.coreColor;
            glowColor = saberState.glowColor;
        }
        
        const dynCore = Math.max(2, Math.round(rawW * 0.7));
        const dynGlow = Math.max(12, Math.round(rawW * 4.2));

        const newOptions = {
            preset: presetKey,
            coreColor: coreColor,
            glowColor: glowColor,
            coreSize: parseInt($('deSaberCoreSize') ? $('deSaberCoreSize').value : dynCore),
            glowSize: parseInt($('deSaberGlowSize') ? $('deSaberGlowSize').value : dynGlow),
            intensity: parseFloat($('deSaberIntensity') ? $('deSaberIntensity').value : 2.5),
            flickerAmount: parseInt($('deSaberFlicker') ? $('deSaberFlicker').value : 5) / 100,
            pulseSpeed: parseFloat($('deSaberPulse') ? $('deSaberPulse').value : 0),
            groundSpill: parseInt($('deSaberGroundSpill') ? $('deSaberGroundSpill').value : 40) / 100,
            energyNodes: $('deSaberEnergyNodes') ? $('deSaberEnergyNodes').checked : true,
            dashStyle: p.dashStyle || 'solid'
        };
        
        // update span labels
        if ($('deSaberCoreSizeVal')) $('deSaberCoreSizeVal').textContent = newOptions.coreSize;
        if ($('deSaberGlowSizeVal')) $('deSaberGlowSizeVal').textContent = newOptions.glowSize;
        if ($('deSaberIntensityVal')) $('deSaberIntensityVal').textContent = newOptions.intensity;
        if ($('deSaberFlickerVal')) $('deSaberFlickerVal').textContent = Math.round(newOptions.flickerAmount * 100);
        if ($('deSaberPulseVal')) $('deSaberPulseVal').textContent = newOptions.pulseSpeed;
        if ($('deSaberGroundSpillVal') && $('deSaberGroundSpill')) $('deSaberGroundSpillVal').textContent = $('deSaberGroundSpill').value + '%';
        
        p.hasSaber = true;
        p.saber = true;
        p.saberOptions = newOptions;
        
        if (window.applySaberToPath) {
            clearTimeout(updateSaberTimer);
            updateSaberTimer = setTimeout(() => {
                applySaberToPath(editingDrawIndex, newOptions);
            }, 30);
        }
    } else {
        if (settings) settings.style.display = 'none';
        p.hasSaber = false;
        p.saber = false;
        if (window.removeSaberFromPath && p.saberRef) {
            removeSaberFromPath(editingDrawIndex);
        }
    }
    
    // Doğrudan mevcut SVG elementini güncelle
    if (p.el) {
        updateSinglePathSvg(p);
    }
    
    redrawAll();
    updateDrawHistory();
};

// ════════════════════════════════════════════════════════════════
// 🌟 TEKİL ÇİZİM SVG GÜNCELLEME (NEON BLOOM, HOT CORE, ENERGY PINS)
// ════════════════════════════════════════════════════════════════
function updateSinglePathSvg(p) {
    if (!p || !p.el) return;
    const isNeon = !!(p.hasSaber || p.saber || (window.saberState && window.saberState.active && p.hasSaber !== false));
    if (isNeon) {
        p.el.classList.add('neon-active');
    } else {
        p.el.classList.remove('neon-active');
    }
    p.el.style.mixBlendMode = 'normal';
    if (!p.el.parentElement) {
        const container = typeof getActiveV4Element === 'function' ? getActiveV4Element() : (document.getElementById('photo-layer') || document.getElementById('canvas-container'));
        if (container) container.appendChild(p.el);
    }
    const svg = p.el.querySelector('svg');
    if (!svg) return;

    let vbW = 0;
    if (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width > 0) {
        vbW = svg.viewBox.baseVal.width;
    } else {
        const vbAttr = svg.getAttribute('viewBox');
        if (vbAttr) {
            const parts = vbAttr.trim().split(/[\s,]+/).map(Number);
            if (parts.length === 4 && parts[2] > 0) vbW = parts[2];
        }
    }
    const elW = parseFloat(p.el.style.width) || p.el.offsetWidth;
    const internalScale = (vbW > 0 && elW > 0) ? (elW / vbW) : 1;
    const effectiveSvgWidth = Math.max(1, p.width / internalScale);
    const dotRadius = Math.max(2.5, Math.round((p.width * 0.75) / internalScale));

    const sOpts = p.saberOptions || (window.saberState && window.saberState.active ? window.saberState : {}) || {};
    let glowColor = '#00CEC9';
    if (sOpts.glowColor) {
        glowColor = typeof sOpts.glowColor === 'number' ? '#' + sOpts.glowColor.toString(16).padStart(6, '0') : sOpts.glowColor;
    } else if (p.color && p.color.toLowerCase() !== '#ef4444') {
        glowColor = p.color;
    }
    let coreColor = '#FFFFFF';
    if (sOpts.coreColor) {
        coreColor = typeof sOpts.coreColor === 'number' ? '#' + sOpts.coreColor.toString(16).padStart(6, '0') : sOpts.coreColor;
    }
    const glowSize = Math.max(12, sOpts.glowSize || 28);
    const coreSize = Math.max(1.5, Math.min(sOpts.coreSize || Math.round(effectiveSvgWidth * 0.6) || 3, 30));
    const showEnergyNodes = (sOpts.energyNodes !== false) && (p.type === 'polygon' || p.type === 'rect' || p.type === 'line' || p.showVertices);

    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.insertBefore(defs, svg.firstChild);
    }
    while (defs.firstChild) defs.removeChild(defs.firstChild);

    const pathId = p.id || (p.el && p.el.dataset && p.el.dataset.pathId) || ('draw-' + Math.floor(Math.random() * 100000));
    let filterId = 'neon-bloom-' + pathId;

    if (isNeon) {
        const dev1 = (glowSize * 0.85).toFixed(1);  // Geniş Zemin Yayılımı
        const dev2 = (glowSize * 0.35).toFixed(1);  // Dış Neon Halesi
        const dev3 = (glowSize * 0.12).toFixed(1);  // İç Plazma Koronası

        const filterEl = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filterEl.setAttribute('id', filterId);
        filterEl.setAttribute('x', '-100%');
        filterEl.setAttribute('y', '-100%');
        filterEl.setAttribute('width', '300%');
        filterEl.setAttribute('height', '300%');

        const b1 = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        b1.setAttribute('in', 'SourceGraphic');
        b1.setAttribute('stdDeviation', dev1);
        b1.setAttribute('result', 'blurSpill');
        filterEl.appendChild(b1);

        const b2 = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        b2.setAttribute('in', 'SourceGraphic');
        b2.setAttribute('stdDeviation', dev2);
        b2.setAttribute('result', 'blurAura');
        filterEl.appendChild(b2);

        const b3 = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        b3.setAttribute('in', 'SourceGraphic');
        b3.setAttribute('stdDeviation', dev3);
        b3.setAttribute('result', 'blurCorona');
        filterEl.appendChild(b3);

        const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        ['blurSpill', 'blurAura', 'blurCorona', 'SourceGraphic'].forEach(r => {
            const node = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
            node.setAttribute('in', r);
            merge.appendChild(node);
        });
        defs.appendChild(filterEl);

        const fillFilterId = 'neon-fill-bloom-' + pathId;
        const fillFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        fillFilter.setAttribute('id', fillFilterId);
        fillFilter.setAttribute('x', '-50%');
        fillFilter.setAttribute('y', '-50%');
        fillFilter.setAttribute('width', '200%');
        fillFilter.setAttribute('height', '200%');
        
        const fb1 = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        fb1.setAttribute('in', 'SourceGraphic');
        fb1.setAttribute('stdDeviation', '14');
        fb1.setAttribute('result', 'softGlow');
        fillFilter.appendChild(fb1);
        
        const fb2 = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        fb2.setAttribute('in', 'SourceGraphic');
        fb2.setAttribute('stdDeviation', '4');
        fb2.setAttribute('result', 'innerGlow');
        fillFilter.appendChild(fb2);
        
        const fMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        ['softGlow', 'innerGlow', 'SourceGraphic'].forEach(r => {
            const mNode = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
            mNode.setAttribute('in', r);
            fMerge.appendChild(mNode);
        });
        fillFilter.appendChild(fMerge);
        defs.appendChild(fillFilter);
    } else if (p.glow > 0) {
        const std = (p.glow / 2).toFixed(1);
        const filterEl = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filterEl.setAttribute('id', filterId);
        const b = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        b.setAttribute('stdDeviation', std);
        b.setAttribute('result', 'coloredBlur');
        filterEl.appendChild(b);
        const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        ['coloredBlur', 'SourceGraphic'].forEach(r => {
            const node = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
            node.setAttribute('in', r);
            merge.appendChild(node);
        });
        filterEl.appendChild(merge);
        defs.appendChild(filterEl);
    }
    const strokeColor = isNeon ? 'transparent' : p.color;
    const strokeOpacity = isNeon ? 0 : (p.opacity || 1);
    const strokeWidth = effectiveSvgWidth;
    const dashArr = (!isNeon && typeof getDash === 'function') ? getDash(p.dashStyle, effectiveSvgWidth) : [];

    if (p.type === 'arrow') {
        const shaft = svg.querySelector('.arrow-shaft, line');
        if (shaft) {
            const rawX1 = shaft.dataset.rawX1 !== undefined ? parseFloat(shaft.dataset.rawX1) : (parseFloat(shaft.getAttribute('x1')) || 0);
            const rawY1 = shaft.dataset.rawY1 !== undefined ? parseFloat(shaft.dataset.rawY1) : (parseFloat(shaft.getAttribute('y1')) || 0);
            const rawX2 = shaft.dataset.rawX2 !== undefined ? parseFloat(shaft.dataset.rawX2) : (parseFloat(shaft.getAttribute('x2')) || 0);
            const rawY2 = shaft.dataset.rawY2 !== undefined ? parseFloat(shaft.dataset.rawY2) : (parseFloat(shaft.getAttribute('y2')) || 0);

            const a = Math.atan2(rawY2 - rawY1, rawX2 - rawX1);
            const s = p.arrowStyle || 1;
            const dir = p.arrowDir || 'outward';
            const baseH = Math.max(effectiveSvgWidth * 4.5, 14);
            const cutDist = (s === 3 || s === 11 || s === 12) ? 0 : Math.min(baseH * 0.45, 14);

            let lx1 = rawX1, ly1 = rawY1, lx2 = rawX2, ly2 = rawY2;
            if(dir === 'outward' || dir === 'both' || s >= 18) {
                lx2 -= cutDist * Math.cos(a);
                ly2 -= cutDist * Math.sin(a);
            }
            if(dir === 'inward' || dir === 'both' || s >= 18) {
                lx1 += cutDist * Math.cos(a);
                ly1 += cutDist * Math.sin(a);
            }
            shaft.setAttribute('x1', lx1);
            shaft.setAttribute('y1', ly1);
            shaft.setAttribute('x2', lx2);
            shaft.setAttribute('y2', ly2);
            shaft.setAttribute('stroke', strokeColor);
            shaft.setAttribute('stroke-width', strokeWidth);
            shaft.setAttribute('stroke-opacity', strokeOpacity);
            shaft.removeAttribute('filter');

            if (dashArr.length > 0) shaft.setAttribute('stroke-dasharray', dashArr.join(','));
            else shaft.removeAttribute('stroke-dasharray');

            // SVG içindeki çekirdek ve kalıntı çizgileri temizle (SaberEngine WebGL üzerinden çizer)
            let coreLine = svg.querySelector('.arrow-shaft-core, .neon-hot-core');
            if (coreLine) coreLine.remove();

            const oldHeads = svg.querySelectorAll('.arrow-heads-group, polygon:not(.main-polygon), polyline, circle, rect');
            oldHeads.forEach(h => h.remove());

            const fillStr = `fill="${isNeon ? 'transparent' : p.color}"`;
            const headsHtml = window.renderSvgArrowHeadsGroup(rawX1, rawY1, rawX2, rawY2, a, effectiveSvgWidth, strokeColor, fillStr, '', p.arrowStyle, p.arrowDir);
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.className.baseVal = 'arrow-heads-group';
            g.innerHTML = headsHtml;
            svg.appendChild(g);
        }
    } else {
        const shapes = svg.querySelectorAll('.main-shape, .main-line, .main-polygon, polygon, ellipse, circle:not(.neon-node-halo):not(.neon-node-core):not(.poly-vertex-dot), rect, path, line:not(.arrow-shaft-core):not(.neon-hot-core)');
        shapes.forEach(mainShape => {
            mainShape.setAttribute('stroke', strokeColor);
            mainShape.setAttribute('stroke-width', strokeWidth);
            mainShape.setAttribute('stroke-opacity', strokeOpacity);
            mainShape.removeAttribute('filter');

            const isFillable = mainShape.tagName.toLowerCase() === 'polygon' || mainShape.tagName.toLowerCase() === 'ellipse' || mainShape.tagName.toLowerCase() === 'circle' || mainShape.tagName.toLowerCase() === 'rect' || (mainShape.tagName.toLowerCase() === 'path' && p.fillOpacity > 0);
            if (isFillable) {
                if (isNeon && p.fillOpacity > 0) {
                    mainShape.setAttribute('fill', p.fillColor || '#00e5ff');
                    mainShape.setAttribute('fill-opacity', Math.min(1, (p.fillOpacity || 0.3) * 1.15));
                    mainShape.setAttribute('filter', `url(#neon-fill-bloom-${pathId})`);
                    mainShape.style.mixBlendMode = 'screen';
                } else {
                    mainShape.removeAttribute('filter');
                    mainShape.style.mixBlendMode = 'normal';
                    mainShape.setAttribute('fill', p.fillOpacity > 0 ? p.fillColor : 'transparent');
                    mainShape.setAttribute('fill-opacity', p.fillOpacity || 0);
                }
            }
            if (dashArr.length > 0) mainShape.setAttribute('stroke-dasharray', dashArr.join(','));
            else mainShape.removeAttribute('stroke-dasharray');
        });

        // Neon aktifken ek güvenlik: SVG içindeki tüm çizim şekillerinin stroke'u şeffaf olmalı
        if (isNeon) {
            svg.querySelectorAll('polygon, rect, ellipse, circle:not(.poly-vertex-dot), path, line, polyline').forEach(s => {
                s.setAttribute('stroke', 'transparent');
                s.setAttribute('stroke-opacity', '0');
            });
        }

        // SVG içindeki çekirdek ve kalıntı çizgileri temizle (SaberEngine WebGL üzerinden çizer)
        let coreShape = svg.querySelector('.neon-hot-core');
        if (coreShape) coreShape.remove();

        // Enerji Pinleri / Köşe Noktaları temizle (SaberEngine WebGL üzerinden çizer)
        svg.querySelectorAll('.neon-node-halo, .neon-node-core').forEach(n => n.remove());

        const circles = svg.querySelectorAll('.poly-vertex-dot');
        circles.forEach(c => {
            c.setAttribute('fill', p.color);
            c.setAttribute('r', dotRadius);
            c.style.display = (!isNeon && p.showVertices) ? 'block' : 'none';
        });
    }

    if (p.el) {
        if (isNeon) {
            p.el.classList.add('neon-active');
            p.el.dataset.drawColor = 'transparent';
        } else {
            p.el.classList.remove('neon-active');
            p.el.dataset.drawColor = p.color;
        }
    }
}
window.updateSinglePathSvg = updateSinglePathSvg;


window.redrawAllToContext = function(targetCtx, scaleMultiplier) {
    const oldCtx = drawCtx;
    drawCtx = targetCtx;
    drawCtx.save();
    drawCtx.setTransform(1, 0, 0, 1, 0, 0); // Reset html2canvas's residual transform!
    drawCtx.scale(scaleMultiplier, scaleMultiplier);
    if (typeof drawPaths !== 'undefined' && drawPaths.length > 0) {
        drawPaths.forEach(p => {
            if (typeof drawSinglePath === 'function') {
                drawSinglePath(p);
            }
        });
    }
    drawCtx.restore();
    drawCtx = oldCtx;
};


function createSVGFromPath(p) {
    if (!p.id) p.id = 'draw-path-' + Date.now() + '-' + Math.floor(Math.random()*10000);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const pts = p.type === 'free' ? p.points : (p.type === 'polygon' ? p.points : [{x:p.x1,y:p.y1},{x:p.x2,y:p.y2}]);
    if(!pts || pts.length === 0) return null;
    
    pts.forEach(pt => {
        if(pt.x < minX) minX = pt.x;
        if(pt.y < minY) minY = pt.y;
        if(pt.x > maxX) maxX = pt.x;
        if(pt.y > maxY) maxY = pt.y;
    });

    // Tek nokta tıklamaları için güvenlik
    if(minX === maxX) { maxX += 1; }
    if(minY === maxY) { maxY += 1; }

    const isNeon = !!(p.hasSaber || p.saber || (window.saberState && window.saberState.active));
    const sOpts = p.saberOptions || (window.saberState && window.saberState.active ? window.saberState : {}) || {};

    let glowColor = '#00CEC9';
    if (sOpts.glowColor) {
        glowColor = typeof sOpts.glowColor === 'number' ? '#' + sOpts.glowColor.toString(16).padStart(6, '0') : sOpts.glowColor;
    } else if (p.color && p.color.toLowerCase() !== '#ef4444') {
        glowColor = p.color;
    }

    let coreColor = '#FFFFFF';
    if (sOpts.coreColor) {
        coreColor = typeof sOpts.coreColor === 'number' ? '#' + sOpts.coreColor.toString(16).padStart(6, '0') : sOpts.coreColor;
    }

    const glowSize = Math.max(12, sOpts.glowSize || 28);
    const coreSize = (sOpts.coreSize !== undefined && sOpts.coreSize !== null) ? Number(sOpts.coreSize) : 0;
    const showEnergyNodes = (sOpts.energyNodes !== false) && (p.type === 'polygon' || p.type === 'rect' || p.type === 'line' || p.showVertices);

    // Elemanın seçim alanı (blue bounding box) tam şekil üzerine otursun; SVG overflow:visible olduğundan taşan efektler kırpılmaz
    const padding = 0;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    const w = Math.max(20, maxX - minX);
    const h = Math.max(20, maxY - minY);
    
    const filterId = `neon-bloom-${p.id}`;
    const fillFilterId = `neon-fill-bloom-${p.id}`;
    let svgDefs = '';
    let filterAttr = '';

    if (isNeon) {
        const dev1 = (glowSize * 0.85).toFixed(1);  // Geniş Zemin Yayılımı
        const dev2 = (glowSize * 0.35).toFixed(1);  // Dış Neon Halesi
        const dev3 = (glowSize * 0.12).toFixed(1);  // İç Plazma Koronası
        svgDefs = `<defs>
            <filter id="${filterId}" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="${dev1}" result="blurSpill" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="${dev2}" result="blurAura" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="${dev3}" result="blurCorona" />
                <feMerge>
                    <feMergeNode in="blurSpill" />
                    <feMergeNode in="blurAura" />
                    <feMergeNode in="blurCorona" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
            <filter id="${fillFilterId}" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="softGlow" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="innerGlow" />
                <feMerge>
                    <feMergeNode in="softGlow" />
                    <feMergeNode in="innerGlow" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>`;
        filterAttr = `filter="url(#${filterId})"`;
    } else if (p.glow > 0) {
        const std = (p.glow / 2).toFixed(1);
        svgDefs = `<defs><filter id="${filterId}"><feGaussianBlur stdDeviation="${std}" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
        filterAttr = `filter="url(#${filterId})"`;
    }

    // Neon modu aktifken çizgiyi WebGL Saber motoru çizdiğinden, alt SVG'nin stroke'u 'transparent' yapılır.
    const strokeColor = isNeon ? 'transparent' : p.color;
    const strokeWidth = p.width;
    const dashArr = (!isNeon && typeof getDash === 'function') ? getDash(p.dashStyle, p.width) : [];
    const dashStr = dashArr.length > 0 ? ` stroke-dasharray="${dashArr.join(',')}"` : '';
    const isNeonFill = isNeon && (p.fillOpacity > 0);
    const fillFilterAttr = isNeonFill ? ` filter="url(#${fillFilterId})"` : '';
    const fillBlendStyle = isNeonFill ? ' style="mix-blend-mode:screen;"' : '';
    const styleStr = `stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="${p.fillOpacity > 0 ? (p.fillColor || '#00e5ff') : 'transparent'}" fill-opacity="${p.fillOpacity || 0}" stroke-opacity="${isNeon ? 0 : p.opacity}"${dashStr}${fillFilterAttr}${fillBlendStyle}`;
    const fillStr = `fill="${p.color}" fill-opacity="${p.opacity}"`;
    const dotRadius = Math.max(2.5, Math.round(p.width * 0.75));
    
    let body = '';
    
    if(p.type === 'free') {
        let d = `M ${pts[0].x - minX} ${pts[0].y - minY}`;
        for(let i=1; i<pts.length; i++) d += ` L ${pts[i].x - minX} ${pts[i].y - minY}`;
        body = `<path class="main-line" d="${d}" ${styleStr} />`;
    } else if(p.type === 'polygon') {
        let ptStr = pts.map(pt => `${(pt.x - minX).toFixed(1)},${(pt.y - minY).toFixed(1)}`).join(' ');
        body = `<polygon class="main-polygon" points="${ptStr}" ${styleStr} />`;
    } else if(p.type === 'rect') {
        const rX = Math.min(p.x1, p.x2) - minX;
        const rY = Math.min(p.y1, p.y2) - minY;
        const rW = Math.abs(p.x2 - p.x1);
        const rH = Math.abs(p.y2 - p.y1);
        const ptStr = `${rX},${rY} ${rX+rW},${rY} ${rX+rW},${rY+rH} ${rX},${rY+rH}`;
        body = `<polygon class="main-polygon" points="${ptStr}" ${styleStr} />`;
    } else if(p.type === 'circle') {
        const cx = (p.x1 + p.x2)/2 - minX;
        const cy = (p.y1 + p.y2)/2 - minY;
        const rx = Math.abs(p.x2 - p.x1)/2;
        const ry = Math.abs(p.y2 - p.y1)/2;
        body = `<ellipse class="main-shape" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${styleStr} />`;
    } else if(p.type === 'line' || p.type === 'arrow') {
        if(p.type === 'arrow') {
            const a = Math.atan2(p.y2 - p.y1, p.x2 - p.x1);
            const x2 = p.x2 - minX, y2 = p.y2 - minY;
            const x1 = p.x1 - minX, y1 = p.y1 - minY;
            const s = p.arrowStyle || 1;
            const dir = p.arrowDir || 'outward';
            const baseH = Math.max(p.width * 4.5, 14);
            const cutDist = (s === 3 || s === 11 || s === 12) ? 0 : Math.min(baseH * 0.45, 14);
            
            let lx1 = x1, ly1 = y1, lx2 = x2, ly2 = y2;
            if(dir === 'outward' || dir === 'both' || s >= 18) {
                lx2 -= cutDist * Math.cos(a);
                ly2 -= cutDist * Math.sin(a);
            }
            if(dir === 'inward' || dir === 'both' || s >= 18) {
                lx1 += cutDist * Math.cos(a);
                ly1 += cutDist * Math.sin(a);
            }
            
            body = `<line class="arrow-shaft" data-raw-x1="${x1}" data-raw-y1="${y1}" data-raw-x2="${x2}" data-raw-y2="${y2}" x1="${lx1}" y1="${ly1}" x2="${lx2}" y2="${ly2}" ${styleStr} />`;
            body += `<g class="arrow-heads-group">` + window.renderSvgArrowHeadsGroup(x1, y1, x2, y2, a, p.width, strokeColor, fillStr, '', s, dir) + `</g>`;
        } else {
            body = `<line class="main-line" x1="${p.x1 - minX}" y1="${p.y1 - minY}" x2="${p.x2 - minX}" y2="${p.y2 - minY}" ${styleStr} />`;
        }
    }

    const svgString = `<svg style="overflow:visible;" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 ${w} ${h}">${svgDefs}${body}</svg>`;

    const icon = document.createElement('div');
    icon.className = 'cvi-item canva-el is-svg-icon editable-draw' + (isNeon ? ' neon-active' : '');
    icon.innerHTML = svgString;
    p.el = icon;
    icon.dataset.label = 'Çizim: ' + p.type;
    icon.dataset.drawType = p.type;
    icon.dataset.drawColor = strokeColor;
    icon.dataset.drawWidth = p.width;
    icon.dataset.drawRawWidth = p.rawWidth || (p.width ? Math.max(1, Math.round(p.width / getDrawScaleRatio())) : 6);
    icon.dataset.drawOpacity = p.opacity;
    icon.dataset.baseWidth = w;
    icon.dataset.baseHeight = h;
    icon.dataset.baseLeft = minX;
    icon.dataset.baseTop = minY;
    if (p.type === 'arrow') {
        icon.dataset.arrowStyle = p.arrowStyle || 1;
        icon.dataset.arrowDir = p.arrowDir || 'outward';
    }
    icon.dataset.pathId = p.id;
    const fIdx = (typeof drawPaths !== 'undefined') ? drawPaths.indexOf(p) : -1;
    if (fIdx >= 0) icon.dataset.pathIndex = fIdx;
    
    // Boyut ve konumlandırma
    icon.style.width = w + 'px';
    icon.style.height = h + 'px';
    icon.style.left = minX + 'px';
    icon.style.top = minY + 'px';
    icon.style.position = 'absolute';
    icon.style.zIndex = '50';
    icon.style.pointerEvents = (typeof drawMode !== 'undefined' && drawMode !== null && drawMode !== 'off') ? 'none' : 'auto';
    if (p.rotation) {
        icon.dataset.rotation = p.rotation;
        icon.style.transform = `rotate(${p.rotation}deg) scale(${p.scale || 1})`;
    }
    
    // Güvenli container ekleme ve drag bağlama
    const container = typeof getActiveV4Element === 'function' ? getActiveV4Element() : (document.getElementById('photo-layer') || document.getElementById('canvas-container'));
    if (container && !icon.parentElement) {
        container.appendChild(icon);
    }
    if (typeof bindDrag === 'function') {
        bindDrag(icon);
    }
    return icon;
}
window.createSVGFromPath = createSVGFromPath;



window.loadDrawSettings = function(el) {
    if(!el) return;
    const drawEl = (el.classList && el.classList.contains('editable-draw')) ? el : (el.closest ? el.closest('.editable-draw') : el);
    if(!drawEl) return;
    const svg = drawEl.querySelector('svg');
    if(!svg) return;
    
    let p = null;
    if (typeof drawPaths !== 'undefined') {
        p = drawPaths.find(item => item.el === drawEl || (item.el && (item.el === drawEl || item.el.contains(drawEl) || drawEl.contains(item.el))));
        if (!p && drawEl.dataset.pathIndex !== undefined) {
            const idx = parseInt(drawEl.dataset.pathIndex);
            if (!isNaN(idx) && idx >= 0 && drawPaths[idx]) p = drawPaths[idx];
        }
    }
    if (typeof window.syncSaberUIWithDrawing === 'function') {
        window.syncSaberUIWithDrawing(p);
    }
    
    const isNeon = !!(p && (p.hasSaber || p.saber)) || drawEl.classList.contains('neon-active') || !!(window.saberState && window.saberState.active);

    // COLOR: Neon aktifse kırmızı veya stroke ile ezme
    let shapeColor = null;
    if (p && p.color && p.color !== 'transparent') {
        shapeColor = p.color;
    } else {
        const firstShape = svg.querySelector('path, polygon, rect, ellipse, line, circle, polyline');
        if (firstShape) {
            const stroke = firstShape.getAttribute('stroke');
            if (stroke && stroke !== 'none' && stroke !== 'transparent') shapeColor = stroke;
            else if (firstShape.getAttribute('fill') && firstShape.getAttribute('fill') !== 'none' && firstShape.getAttribute('fill') !== 'transparent') shapeColor = firstShape.getAttribute('fill');
        }
    }
    if (shapeColor && document.getElementById('drawColor') && !isNeon) {
        document.getElementById('drawColor').value = shapeColor;
    }

    // WIDTH: Ham slider değerini geri yükle (ölçeklenmiş veya +4 eklenmiş SVG stroke-width'i ASLA slidera yazma!)
    let rawW = null;
    if (p && p.rawWidth) {
        rawW = p.rawWidth;
    } else if (p && p.width) {
        rawW = Math.max(1, Math.round(p.width / getDrawScaleRatio()));
    } else if (drawEl.dataset.drawRawWidth) {
        rawW = parseFloat(drawEl.dataset.drawRawWidth);
    } else if (drawEl.dataset.drawWidth) {
        rawW = Math.max(1, Math.round(parseFloat(drawEl.dataset.drawWidth) / getDrawScaleRatio()));
    }
    if (rawW !== null && !isNaN(rawW) && document.getElementById('drawWidth')) {
        document.getElementById('drawWidth').value = rawW;
        if (document.getElementById('drawWidthVal')) document.getElementById('drawWidthVal').textContent = rawW;
    }

    // OPACITY
    let opVal = null;
    if (p && p.opacity !== undefined) {
        opVal = Math.round(p.opacity * 100);
    } else {
        const firstShape = svg.querySelector('path, polygon, rect, ellipse, line, circle, polyline');
        if (firstShape) {
            const op = firstShape.getAttribute('stroke-opacity') || firstShape.getAttribute('fill-opacity');
            if (op) opVal = Math.round(parseFloat(op) * 100);
        }
    }
    if (opVal !== null && !isNaN(opVal) && document.getElementById('drawOpacity')) {
        document.getElementById('drawOpacity').value = opVal;
        if (document.getElementById('drawOpacityVal')) document.getElementById('drawOpacityVal').textContent = opVal + '%';
    }
};

window.updateSelectedDraw = function() {
    const targets = (window.selectedElements && window.selectedElements.length > 0) 
        ? window.selectedElements.filter(e => e.classList.contains('editable-draw'))
        : (window.selectedEl && window.selectedEl.classList.contains('editable-draw') ? [window.selectedEl] : []);
    
    if (targets.length === 0) return;
    
    const colorInput = document.getElementById('drawColor');
    const color = colorInput ? colorInput.value : null;
    const wInput = document.getElementById('drawWidth');
    const rawW = wInput ? parseFloat(wInput.value) : null;
    const opInput = document.getElementById('drawOpacity');
    const op = opInput ? parseFloat(opInput.value) / 100 : null;
    
    const scaleRatio = getDrawScaleRatio();
    const effW = (rawW !== null && !isNaN(rawW)) ? Math.max(1, Math.round(rawW * scaleRatio)) : null;

    targets.forEach(el => {
        let p = null;
        if (typeof drawPaths !== 'undefined') {
            p = drawPaths.find(item => item.el === el || (item.el && (item.el === el || item.el.contains(el) || el.contains(item.el))));
            if (!p && el.dataset.pathIndex !== undefined) {
                const idx = parseInt(el.dataset.pathIndex);
                if (!isNaN(idx) && idx >= 0 && drawPaths[idx]) p = drawPaths[idx];
            }
        }

        const isNeon = !!(p && (p.hasSaber || p.saber)) || el.classList.contains('neon-active') || !!(window.saberState && window.saberState.active);

        if (p) {
            if (rawW !== null && !isNaN(rawW)) {
                p.rawWidth = rawW;
                p.width = effW;
            }
            if (op !== null && !isNaN(op)) {
                p.opacity = op;
            }
            if (!isNeon && color) {
                p.color = color;
            }
            if (isNeon && typeof window.updateSinglePathSvg === 'function') {
                window.updateSinglePathSvg(p);
                if (p.hasSaber && p.saberRef && window.applySaberToPath) {
                    const pIdx = drawPaths.indexOf(p);
                    if (pIdx >= 0) window.applySaberToPath(pIdx, p.saberOptions || window.saberState);
                }
                return;
            }
        }

        const svg = el.querySelector('svg');
        if(!svg) return;
        const shapes = svg.querySelectorAll('path, polygon, rect, ellipse, line, circle, polyline');
        if (isNeon) {
            shapes.forEach(shape => {
                shape.setAttribute('stroke', 'transparent');
                shape.setAttribute('stroke-opacity', '0');
            });
            el.classList.add('neon-active');
            el.dataset.drawColor = 'transparent';
            return;
        }
        shapes.forEach(shape => {
            if(color !== null && shape.hasAttribute('stroke') && shape.getAttribute('stroke') !== 'none') {
                shape.setAttribute('stroke', color);
            }
            if (effW !== null && !isNaN(effW) && shape.hasAttribute('stroke')) {
                shape.setAttribute('stroke-width', effW);
            }
            if (op !== null && !isNaN(op) && shape.hasAttribute('stroke')) {
                shape.setAttribute('stroke-opacity', op);
            }
            if(color !== null && shape.hasAttribute('fill') && shape.getAttribute('fill') !== 'none') {
                shape.setAttribute('fill', color);
                if (op !== null && !isNaN(op)) shape.setAttribute('fill-opacity', op);
            }
        });
        if (color) el.dataset.drawColor = color;
        if (rawW) el.dataset.drawRawWidth = rawW;
        if (effW) el.dataset.drawWidth = effW;
        if (op) el.dataset.drawOpacity = op;
    });
};

window.showVertexHandles = function(el) {
    if (!el) return;
    
    const oldContainers = el.querySelectorAll('.vertex-handles-container');
    if (oldContainers) oldContainers.forEach(c => c.remove());
    el.dataset.hasHandles = 'false';
    
    if (el.classList.contains('added-icon') || el.classList.contains('callout-wrap') || el.classList.contains('svg-callout')) return;
    const svg = el.querySelector('svg');
    if (!svg) return;
    const isArrow = (el.dataset.drawType === 'arrow') || (el.dataset.label && el.dataset.label.includes('arrow')) || !!svg.querySelector('.arrow-shaft');
    const polygon = isArrow ? null : svg.querySelector('polygon.main-polygon, polygon');
    const lineEl = svg.querySelector('line.arrow-shaft, line.main-line, line');
    
    let baseW = parseFloat(el.dataset.baseWidth) || el.offsetWidth;
    let baseH = parseFloat(el.dataset.baseHeight) || el.offsetHeight;
    const vb = svg.viewBox && svg.viewBox.baseVal;
    if (vb && vb.width > 0 && vb.height > 0) {
        baseW = vb.width;
        baseH = vb.height;
    } else {
        const vbAttr = svg.getAttribute('viewBox');
        if (vbAttr) {
            const parts = vbAttr.trim().split(/[\s,]+/).map(Number);
            if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
                baseW = parts[2];
                baseH = parts[3];
            }
        }
    }
    
    let points = [];
    if (isArrow && lineEl) {
        points = [
            {x: parseFloat(lineEl.getAttribute('x1')), y: parseFloat(lineEl.getAttribute('y1'))},
            {x: parseFloat(lineEl.getAttribute('x2')), y: parseFloat(lineEl.getAttribute('y2'))}
        ];
    } else if (polygon) {
        const ptsStr = polygon.getAttribute('points');
        if (ptsStr) {
            points = ptsStr.trim().split(/\s+/).map(p => {
                const [x,y] = p.split(',').map(Number);
                return {x,y};
            });
            el.dataset.polygonPoints = JSON.stringify(points);
        } else if (el.dataset.polygonPoints) {
            try { points = JSON.parse(el.dataset.polygonPoints); } catch(e) {}
        }
    } else if (lineEl) {
        points = [
            {x: parseFloat(lineEl.getAttribute('x1')), y: parseFloat(lineEl.getAttribute('y1'))},
            {x: parseFloat(lineEl.getAttribute('x2')), y: parseFloat(lineEl.getAttribute('y2'))}
        ];
    }
    
    const container = document.createElement('div');
    container.className = 'vertex-handles-container';
    container.style.position = 'absolute';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none'; 
    container.style.zIndex = '10005';
    
    function recalcElementBoundsAfterVertexMove(el, pts, isArrowOrLine) {
        if (!el || !pts || pts.length === 0) return;
        const svgEl = el.querySelector('svg');
        if (!svgEl) return;
        
        const baseL = parseFloat(el.dataset.baseLeft !== undefined ? el.dataset.baseLeft : el.style.left) || 0;
        const baseT = parseFloat(el.dataset.baseTop !== undefined ? el.dataset.baseTop : el.style.top) || 0;
        
        // Canvas üzerindeki mutlak koordinatlar
        const absPts = pts.map(p => ({ x: baseL + p.x, y: baseT + p.y }));
        if (absPts.length === 0) return;
        
        const minX = Math.min(...absPts.map(p => p.x));
        const maxX = Math.max(...absPts.map(p => p.x));
        const minY = Math.min(...absPts.map(p => p.y));
        const maxY = Math.max(...absPts.map(p => p.y));
        
        const newW = Math.max(20, Math.round(maxX - minX));
        const newH = Math.max(20, Math.round(maxY - minY));
        const newL = Math.round(minX);
        const newT = Math.round(minY);
        
        // 1. Element sınırlarını güncelle (Mavi seçim alanı .el-selected el'in box-shadow'udur, anında yeni şekli sarar!)
        el.style.left = newL + 'px';
        el.style.top = newT + 'px';
        el.style.width = newW + 'px';
        el.style.height = newH + 'px';
        
        el.dataset.baseLeft = newL;
        el.dataset.baseTop = newT;
        el.dataset.baseWidth = newW;
        el.dataset.baseHeight = newH;
        
        // 2. SVG viewBox'ı yeni sınırlara uyarla
        svgEl.setAttribute('viewBox', `0 0 ${newW} ${newH}`);
        
        // 3. Noktaları yeni lokal koordinat sistemine kaydır
        const localPts = absPts.map(p => ({
            x: Math.round((p.x - newL) * 10) / 10,
            y: Math.round((p.y - newT) * 10) / 10
        }));
        
        if (isArrowOrLine) {
            const lEl = svgEl.querySelector('line.arrow-shaft, line.main-line, line');
            if (lEl && localPts.length >= 2) {
                lEl.setAttribute('x1', localPts[0].x);
                lEl.setAttribute('y1', localPts[0].y);
                lEl.setAttribute('x2', localPts[1].x);
                lEl.setAttribute('y2', localPts[1].y);
                lEl.dataset.rawX1 = localPts[0].x;
                lEl.dataset.rawY1 = localPts[0].y;
                lEl.dataset.rawX2 = localPts[1].x;
                lEl.dataset.rawY2 = localPts[1].y;
            }
        } else {
            const newPtsStr = localPts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
            svgEl.querySelectorAll('polygon').forEach(poly => {
                poly.setAttribute('points', newPtsStr);
            });
            el.dataset.polygonPoints = JSON.stringify(localPts);
        }
        
        // 4. drawPaths içerisindeki pObj verilerini ve neon efektini senkronize et
        let pIdx = parseInt(el.dataset.pathIndex);
        let pObj = (typeof drawPaths !== 'undefined' && drawPaths[pIdx]) ? drawPaths[pIdx] : (typeof drawPaths !== 'undefined' ? drawPaths.find(dp => dp.el === el) : null);
        if (pObj) {
            pObj.x1 = newL;
            pObj.y1 = newT;
            pObj.x2 = newL + newW;
            pObj.y2 = newT + newH;
            if (isArrowOrLine && absPts.length >= 2) {
                pObj.x1 = absPts[0].x;
                pObj.y1 = absPts[0].y;
                pObj.x2 = absPts[1].x;
                pObj.y2 = absPts[1].y;
            } else {
                pObj.type = 'polygon';
                pObj.points = absPts;
            }
            if (typeof updateSinglePathSvg === 'function') updateSinglePathSvg(pObj);
            if (pObj.hasSaber && typeof window.applySaberToPath === 'function') {
                window.applySaberToPath(pIdx, pObj.saberOptions || window.saberState);
            }
        }
        
        // 5. Tutamaçları yeni sınırlara ve yüzdelere göre yeniden oluştur
        window.showVertexHandles(el);
    }
    
    function createHandle(pt, i, onUpdate) {
        const handle = document.createElement('div');
        handle.className = 'vertex-handle';
        handle.style.position = 'absolute';
        handle.style.left = (pt.x / baseW * 100) + '%';
        handle.style.top = (pt.y / baseH * 100) + '%';
        handle.style.width = '30px';
        handle.style.height = '30px';
        handle.style.transform = 'translate(-50%, -50%)';
        handle.style.background = 'transparent';
        handle.style.borderRadius = '50%';
        handle.style.cursor = 'grab';
        handle.style.pointerEvents = 'auto';
        handle.style.zIndex = '10010';
        
        const visual = document.createElement('div');
        visual.className = 'vertex-handle-visual';
        visual.style.position = 'absolute';
        visual.style.left = '50%';
        visual.style.top = '50%';
        visual.style.transform = 'translate(-50%, -50%)';
        visual.style.width = '18px';
        visual.style.height = '18px';
        visual.style.background = '#ffffff';
        visual.style.border = '2.5px solid #2563eb';
        visual.style.borderRadius = '50%';
        visual.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.5), 0 0 10px rgba(37,99,235,0.6)';
        visual.style.pointerEvents = 'none';
        visual.style.transition = 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease';
        handle.appendChild(visual);

        handle.addEventListener('mouseenter', () => {
            if (!handle.classList.contains('active-drag')) {
                visual.style.transform = 'translate(-50%, -50%) scale(1.25)';
                visual.style.borderColor = '#00e5ff';
                visual.style.boxShadow = '0 0 0 2px #ffffff, 0 0 12px #00e5ff';
            }
        });
        handle.addEventListener('mouseleave', () => {
            if (!handle.classList.contains('active-drag')) {
                visual.style.transform = 'translate(-50%, -50%)';
                visual.style.borderColor = '#2563eb';
                visual.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.5), 0 0 10px rgba(37,99,235,0.6)';
            }
        });
        
        function handleDown(e) {
            if (e.type === 'mousedown' || e.type === 'touchstart') { e.preventDefault(); e.stopPropagation(); }
            const evt = e.touches ? e.touches[0] : e;
            const startX = evt.clientX;
            const startY = evt.clientY;
            const startPtX = pt.x;
            const startPtY = pt.y;
            
            handle.classList.add('active-drag');
            handle.style.cursor = 'grabbing';
            visual.style.transform = 'translate(-50%, -50%) scale(1.35)';
            visual.style.borderColor = '#00f0ff';
            visual.style.boxShadow = '0 0 0 2px #fff, 0 0 16px #00f0ff';
            
            const globalScale = typeof window.getGlobalScale === 'function' ? window.getGlobalScale() : 1;
            const curScaleX = (el.offsetWidth / baseW) * globalScale;
            const curScaleY = (el.offsetHeight / baseH) * globalScale;
            
            let moveRAF = null;
            function onMove(me) {
                if (me.touches && me.touches.length > 1) return;
                const meEvt = me.touches ? me.touches[0] : me;
                const cX = meEvt.clientX;
                const cY = meEvt.clientY;
                
                if (moveRAF) return;
                moveRAF = requestAnimationFrame(() => {
                    moveRAF = null;
                    const rawDx = (cX - startX) / (curScaleX || 1);
                    const rawDy = (cY - startY) / (curScaleY || 1);
                    
                    let localDx = rawDx;
                    let localDy = rawDy;
                    const rotDeg = parseFloat(el.dataset.rotation) || 0;
                    if (rotDeg !== 0) {
                        const rotRad = rotDeg * Math.PI / 180;
                        const cos = Math.cos(rotRad);
                        const sin = Math.sin(rotRad);
                        localDx = rawDx * cos + rawDy * sin;
                        localDy = -rawDx * sin + rawDy * cos;
                    }
                    
                    let newX = startPtX + localDx;
                    let newY = startPtY + localDy;
                    
                    pt.x = newX;
                    pt.y = newY;
                    
                    handle.style.left = (newX / baseW * 100) + '%';
                    handle.style.top = (newY / baseH * 100) + '%';
                    onUpdate(newX, newY);
                });
            }
            
            function onUp() {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('touchend', onUp);
                
                handle.classList.remove('active-drag');
                handle.style.cursor = 'grab';
                visual.style.transform = 'translate(-50%, -50%)';
                visual.style.borderColor = '#2563eb';
                visual.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.5), 0 0 10px rgba(37,99,235,0.6)';
                
                if (typeof updateDrawHistory === 'function') updateDrawHistory();
                if (typeof window.recordHistory === 'function') window.recordHistory('Köşe Noktası Düzenlendi');

                const isLineOrArrow = isArrow || (!polygon && !!lineEl);
                recalcElementBoundsAfterVertexMove(el, points, isLineOrArrow);
            }
            
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
            document.addEventListener('touchmove', onMove, {passive: false});
            document.addEventListener('touchend', onUp);
        }
        
        handle.addEventListener('mousedown', handleDown);
        handle.addEventListener('touchstart', handleDown, {passive: false});
        return handle;
    }
    
    if (lineEl && points.length >= 2) {
        const updateArrowOrLineSvg = () => {
            const nx1 = points[0].x, ny1 = points[0].y;
            const nx2 = points[1].x, ny2 = points[1].y;
            
            if (isArrow) {
                let pIdx = parseInt(el.dataset.pathIndex);
                let pObj = (typeof drawPaths !== 'undefined' && drawPaths[pIdx]) ? drawPaths[pIdx] : (typeof drawPaths !== 'undefined' ? drawPaths.find(dp => dp.el === el) : null);
                
                const pWidth = pObj ? pObj.width : (parseFloat(el.dataset.drawWidth) || 6);
                const pColor = pObj ? pObj.color : (el.dataset.drawColor || lineEl.getAttribute('stroke') || '#ef4444');
                const s = pObj ? (pObj.arrowStyle || 1) : (parseInt(el.dataset.arrowStyle) || 1);
                const dir = pObj ? (pObj.arrowDir || 'outward') : (el.dataset.arrowDir || 'outward');
                const filterAttr = (pObj && pObj.hasSaber) ? `filter="url(#saber-glow-${pIdx})"` : '';
                const fillStr = `fill="${pColor}"`;
                
                const a = Math.atan2(ny2 - ny1, nx2 - nx1);
                const baseH = Math.max(pWidth * 4.5, 14);
                const cutDist = (s === 3 || s === 11 || s === 12) ? 0 : Math.min(baseH * 0.45, 14);
                
                let lx1 = nx1, ly1 = ny1, lx2 = nx2, ly2 = ny2;
                if(dir === 'outward' || dir === 'both' || s >= 18) {
                    lx2 -= cutDist * Math.cos(a);
                    ly2 -= cutDist * Math.sin(a);
                }
                if(dir === 'inward' || dir === 'both' || s >= 18) {
                    lx1 += cutDist * Math.cos(a);
                    ly1 += cutDist * Math.sin(a);
                }
                lineEl.setAttribute('x1', lx1);
                lineEl.setAttribute('y1', ly1);
                lineEl.setAttribute('x2', lx2);
                lineEl.setAttribute('y2', ly2);
                lineEl.dataset.rawX1 = nx1;
                lineEl.dataset.rawY1 = ny1;
                lineEl.dataset.rawX2 = nx2;
                lineEl.dataset.rawY2 = ny2;
                
                const oldHeads = svg.querySelectorAll('.arrow-heads-group, polygon:not(.main-polygon), polyline, circle, rect');
                oldHeads.forEach(h => h.remove());
                
                const headsHtml = window.renderSvgArrowHeadsGroup(nx1, ny1, nx2, ny2, a, pWidth, pColor, fillStr, filterAttr, s, dir);
                
                const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                g.className.baseVal = 'arrow-heads-group';
                g.innerHTML = headsHtml;
                svg.appendChild(g);
            } else {
                lineEl.setAttribute('x1', nx1);
                lineEl.setAttribute('y1', ny1);
                lineEl.setAttribute('x2', nx2);
                lineEl.setAttribute('y2', ny2);
                
                const coreLine = svg.querySelector('.arrow-shaft-core, .neon-hot-core');
                if (coreLine) {
                    coreLine.setAttribute('x1', nx1);
                    coreLine.setAttribute('y1', ny1);
                    coreLine.setAttribute('x2', nx2);
                    coreLine.setAttribute('y2', ny2);
                }
            }
                
                if (pObj) {
                    const baseL = parseFloat(el.dataset.baseLeft !== undefined ? el.dataset.baseLeft : el.style.left) || 0;
                    const baseT = parseFloat(el.dataset.baseTop !== undefined ? el.dataset.baseTop : el.style.top) || 0;
                    pObj.x1 = baseL + nx1;
                    pObj.y1 = baseT + ny1;
                    pObj.x2 = baseL + nx2;
                    pObj.y2 = baseT + ny2;
                    
                    if (pObj.hasSaber && window.applySaberToPath) {
                        applySaberToPath(pIdx, pObj.saberOptions);
                    }
                }
        };

        const h1 = createHandle(points[0], 0, (nx, ny) => {
            points[0] = {x: nx, y: ny};
            updateArrowOrLineSvg();
        });
        
        const h2 = createHandle(points[1], 1, (nx, ny) => {
            points[1] = {x: nx, y: ny};
            updateArrowOrLineSvg();
        });
        
        container.appendChild(h1);
        container.appendChild(h2);
    } else if (polygon && points.length > 0) {
        points.forEach((pt, i) => {
            const handle = createHandle(pt, i, (nx, ny) => {
                points[i] = {x: nx, y: ny};
                const newPtsStr = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
                
                // 1. SVG içindeki TÜM polygonları güncelle (hem neon glow hem neon-hot-core beyaz çizim!)
                svg.querySelectorAll('polygon').forEach(poly => {
                    poly.setAttribute('points', newPtsStr);
                });
                el.dataset.polygonPoints = JSON.stringify(points);
                
                // 2. Enerji pinleri ve köşe dairelerini birebir senkronize et
                try {
                    const halos = svg.querySelectorAll('.neon-node-halo');
                    if (halos[i]) {
                        halos[i].setAttribute('cx', nx.toFixed(1));
                        halos[i].setAttribute('cy', ny.toFixed(1));
                    }
                    const cores = svg.querySelectorAll('.neon-node-core');
                    if (cores[i]) {
                        cores[i].setAttribute('cx', nx.toFixed(1));
                        cores[i].setAttribute('cy', ny.toFixed(1));
                    }
                    const polyDots = svg.querySelectorAll('.poly-vertex-dot');
                    if (polyDots[i]) {
                        polyDots[i].setAttribute('cx', nx.toFixed(1));
                        polyDots[i].setAttribute('cy', ny.toFixed(1));
                    }
                } catch(e) {}

                // 3. drawPaths içindeki pObj koordinatlarını ve saber efektini güncelle
                try {
                    let pIdx = parseInt(el.dataset.pathIndex);
                    let pObj = (typeof drawPaths !== 'undefined' && drawPaths[pIdx]) ? drawPaths[pIdx] : (typeof drawPaths !== 'undefined' ? drawPaths.find(dp => dp.el === el) : null);
                    if (pObj) {
                        const baseL = parseFloat(el.dataset.baseLeft !== undefined ? el.dataset.baseLeft : el.style.left) || 0;
                        const baseT = parseFloat(el.dataset.baseTop !== undefined ? el.dataset.baseTop : el.style.top) || 0;
                        pObj.type = 'polygon';
                        pObj.points = points.map(p => ({ x: baseL + p.x, y: baseT + p.y }));
                        if (pObj.hasSaber && window.applySaberToPath) {
                            applySaberToPath(pIdx, pObj.saberOptions);
                        }
                    }
                } catch(e) {}
            });
            container.appendChild(handle);
        });
    }
    
    const rotHandle = document.createElement('div');
    rotHandle.className = 'text-handle text-rotate-handle';
    rotHandle.style.position = 'absolute';
    rotHandle.style.top = '-28px';
    rotHandle.style.left = '50%';
    rotHandle.style.transform = 'translateX(-50%)';
    rotHandle.style.cursor = 'grab';
    rotHandle.style.pointerEvents = 'auto';
    rotHandle.style.zIndex = '10020';
    rotHandle.title = 'Döndür';
    rotHandle.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" stroke-width="2.5" style="pointer-events:none;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.22-10.27l-5.3 5.3"></path></svg>';
    
    function rotHandleDown(e) {
        if (e.type === 'mousedown' || e.type === 'touchstart') { e.preventDefault(); e.stopPropagation(); }
        const evt = e.touches ? e.touches[0] : e;
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const startAngle = Math.atan2(evt.clientY - centerY, evt.clientX - centerX);
        const prevAngle = parseFloat(el.dataset.rotation) || 0;
        rotHandle.style.cursor = 'grabbing';
        
        if (window.selectedElements && window.selectedElements.length > 1) {
            window.selectedElements.forEach(selEl => {
                selEl.dataset.dragStartRot = parseFloat(selEl.dataset.rotation) || 0;
            });
        }
        
        let moveRAF = null;
        function onMove(me) {
            if (me.touches && me.touches.length > 1) return;
            const meEvt = me.touches ? me.touches[0] : me;
            const cX = meEvt.clientX;
            const cY = meEvt.clientY;
            
            if (moveRAF) return;
            moveRAF = requestAnimationFrame(() => {
                moveRAF = null;
                const currentAngleRad = Math.atan2(cY - centerY, cX - centerX);
                const diffRad = currentAngleRad - startAngle;
                const diffDeg = diffRad * (180 / Math.PI);
                
                let newRotation = prevAngle + diffDeg;
                newRotation = newRotation % 360;
                if (newRotation > 180) newRotation -= 360;
                else if (newRotation < -180) newRotation += 360;
                newRotation = Math.round(newRotation);
                
                el.dataset.rotation = newRotation;
                const curScale = el.dataset.scale || 1;
                el.style.transform = `rotate(${newRotation}deg) scale(${curScale})`;
                
                if (window.selectedElements && window.selectedElements.length > 1) {
                    window.selectedElements.forEach(selEl => {
                        if (selEl !== el) {
                            const s_prev = parseFloat(selEl.dataset.dragStartRot) || 0;
                            let s_new = (s_prev + diffDeg) % 360;
                            if (s_new > 180) s_new -= 360;
                            else if (s_new < -180) s_new += 360;
                            s_new = Math.round(s_new);
                            selEl.dataset.rotation = s_new;
                            const s_scale = selEl.dataset.scale || 1;
                            selEl.style.transform = `rotate(${s_new}deg) scale(${s_scale})`;
                        }
                    });
                }
                
                // ⚡ SABER NEON ANLIK DÖNDÜRME SENKRONİZASYONU (Sıfır Gecikme - WebGL Eşzamanlı)
                const rotTargets = (window.selectedElements && window.selectedElements.length > 1 && window.selectedElements.includes(el))
                    ? window.selectedElements
                    : [el];
                    
                rotTargets.forEach(targetEl => {
                    const tRot = (targetEl === el) ? newRotation : (parseFloat(targetEl.dataset.rotation) || 0);
                    const tScale = parseFloat(targetEl.dataset.scale) || 1;
                    
                    if (targetEl.classList.contains('editable-draw')) {
                        const pIdx = parseInt(targetEl.dataset.pathIndex);
                        const pObj = (typeof drawPaths !== 'undefined')
                            ? (drawPaths[pIdx] || drawPaths.find(p => p.el === targetEl || (p.id && p.id === targetEl.dataset.pathId)))
                            : null;
                            
                        if (pObj) {
                            pObj.rotation = tRot;
                            if (pObj.hasSaber && pObj.saberRef && window.SaberEngine && typeof window.SaberEngine.setSaberTransform === 'function') {
                                const baseL = parseFloat(targetEl.dataset.baseLeft !== undefined ? targetEl.dataset.baseLeft : targetEl.style.left) || 0;
                                const baseT = parseFloat(targetEl.dataset.baseTop !== undefined ? targetEl.dataset.baseTop : targetEl.style.top) || 0;
                                const baseW = parseFloat(targetEl.dataset.baseWidth) || targetEl.offsetWidth || 0;
                                const baseH = parseFloat(targetEl.dataset.baseHeight) || targetEl.offsetHeight || 0;
                                const pCx = baseL + baseW / 2;
                                const pCy = baseT + baseH / 2;
                                window.SaberEngine.setSaberTransform(pObj.saberRef, tScale, 0, 0, false, tRot, pCx, pCy);
                            }
                        }
                    }
                });
                
                const sApp = (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') ? window.SaberEngine.getApp() : null;
                if (sApp && sApp.renderer && sApp.stage && (!sApp.ticker || !sApp.ticker.started)) {
                    try { sApp.renderer.render(sApp.stage); } catch(e) {}
                }
                
                if (typeof selectedEl !== 'undefined' && selectedEl === el) {
                    const rotSlider = document.getElementById('elRotate');
                    const rotVal = document.getElementById('elRotateVal');
                    if(rotSlider) rotSlider.value = newRotation;
                    if(rotVal) rotVal.textContent = newRotation + '°';
                }
            });
        }
        
        function onUp() {
            rotHandle.style.cursor = 'grab';
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onUp);
            
            const curRot = parseFloat(el.dataset.rotation) || 0;
            const pIdx = parseInt(el.dataset.pathIndex);
            const pObj = (typeof drawPaths !== 'undefined')
                ? (drawPaths[pIdx] || drawPaths.find(p => p.el === el || (p.id && p.id === el.dataset.pathId)))
                : null;
            if (pObj) {
                pObj.rotation = curRot;
            }
            
            if (typeof updateDrawHistory === 'function') updateDrawHistory();
            if (typeof window.recordHistory === 'function') window.recordHistory('Çizim Döndürüldü');
        }
        
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchmove', onMove, {passive: false});
        document.addEventListener('touchend', onUp);
    }
    rotHandle.addEventListener('mousedown', rotHandleDown);
    rotHandle.addEventListener('touchstart', rotHandleDown, {passive: false});
    container.appendChild(rotHandle);

    // ════════════════════════════════════════════════════════════════
    // 🗑️ SOL ALT KÖŞE SİLME BUTONU (.text-delete-handle)
    // Normal ve neon çizimlerde ikon/rozet standartlarında silme
    // ════════════════════════════════════════════════════════════════
    const delHandle = document.createElement('div');
    delHandle.className = 'text-handle text-delete-handle';
    delHandle.style.position = 'absolute';
    delHandle.style.bottom = '0px';
    delHandle.style.left = '0px';
    delHandle.style.transform = 'translate(-50%, 50%)';
    delHandle.style.cursor = 'pointer';
    delHandle.style.pointerEvents = 'auto';
    delHandle.style.zIndex = '10020';
    delHandle.title = 'Sil';
    delHandle.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';

    function delHandleClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        let pIdx = (typeof drawPaths !== 'undefined') ? drawPaths.findIndex(p => p.el === el) : -1;
        if (pIdx === -1 && el.dataset.pathIndex !== undefined) {
            pIdx = parseInt(el.dataset.pathIndex);
        }
        
        if (pIdx > -1 && typeof deleteDrawItem === 'function') {
            deleteDrawItem(pIdx);
        } else {
            if (pIdx > -1 && typeof window.removeSaberFromPath === 'function') {
                window.removeSaberFromPath(pIdx);
            }
            el.remove();
            if (pIdx > -1 && typeof drawPaths !== 'undefined') {
                drawPaths.splice(pIdx, 1);
            }
            if (typeof redrawAll === 'function') redrawAll();
            if (typeof updateDrawHistory === 'function') updateDrawHistory();
            if (typeof window.recordHistory === 'function') window.recordHistory('Çizim Silindi');
        }
        if (typeof deselectAll === 'function') deselectAll();
        if (typeof window.renderLayers === 'function') window.renderLayers();
    }
    delHandle.addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); });
    delHandle.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); }, {passive: false});
    delHandle.addEventListener('click', delHandleClick);
    delHandle.addEventListener('touchend', delHandleClick);
    container.appendChild(delHandle);
    
    // ════════════════════════════════════════════════════════════════
    // 📐 SAĞ ALT KÖŞE BOYUTLANDIRMA BUTONU (.text-resize-handle)
    // Köşede tam merkezli (translate 50%, 50%), kayma yok
    // ════════════════════════════════════════════════════════════════
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'text-handle text-resize-handle';
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.bottom = '0px';
    resizeHandle.style.right = '0px';
    resizeHandle.style.transform = 'translate(50%, 50%)';
    resizeHandle.style.cursor = 'nwse-resize';
    resizeHandle.style.pointerEvents = 'auto';
    resizeHandle.style.zIndex = '10020';
    resizeHandle.title = 'Boyutlandır';
    resizeHandle.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" stroke-width="2.5" style="pointer-events:none;"><path d="M21 15v6h-6M3 9V3h6M21 21l-7-7M3 3l7 7"></path></svg>';
    
    function rsDown(e) {
        e.preventDefault();
        e.stopPropagation();
        const evt = e.touches ? e.touches[0] : e;
        const startX = evt.clientX;
        const startY = evt.clientY;
        const startW = el.offsetWidth;
        const startH = el.offsetHeight;
        const rotDeg = parseFloat(el.dataset.rotation) || 0;
        const rotRad = rotDeg * Math.PI / 180;
        const cos = Math.cos(rotRad);
        const sin = Math.sin(rotRad);
        
        if (window.selectedElements && window.selectedElements.length > 1) {
            window.selectedElements.forEach(selEl => {
                selEl.dataset.dragStartW = selEl.offsetWidth;
                selEl.dataset.dragStartH = selEl.offsetHeight;
            });
        }
        
        function rsMove(me) {
            const meEvt = me.touches ? me.touches[0] : me;
            const globalScale = typeof window.getGlobalScale === 'function' ? window.getGlobalScale() : 1;
            const rawDx = (meEvt.clientX - startX) / globalScale;
            const rawDy = (meEvt.clientY - startY) / globalScale;
            
            let localDx = rawDx;
            let localDy = rawDy;
            if (rotDeg !== 0) {
                localDx = rawDx * cos + rawDy * sin;
                localDy = -rawDx * sin + rawDy * cos;
            }
            
            // Pürüzsüz köşegen projeksiyonu ile orantılı ölçekleme (takılmayı ve atlamayı önler)
            const diagLen = Math.sqrt(startW * startW + startH * startH);
            const proj = (localDx * startW + localDy * startH) / diagLen;
            const scale = Math.max(0.05, 1 + proj / diagLen);
            
            let newW = Math.max(20, Math.round(startW * scale));
            let newH = Math.max(20, Math.round(startH * scale));
            
            el.style.width = newW + 'px';
            el.style.height = newH + 'px';
            
            if (el.dataset.baseWidth !== undefined) el.dataset.baseWidth = newW;
            if (el.dataset.baseHeight !== undefined) el.dataset.baseHeight = newH;

            if (window.selectedElements && window.selectedElements.length > 1) {
                window.selectedElements.forEach(selEl => {
                    if (selEl !== el) {
                        const s_w = parseFloat(selEl.dataset.dragStartW) || selEl.offsetWidth;
                        const s_h = parseFloat(selEl.dataset.dragStartH) || selEl.offsetHeight;
                        const finalW = Math.max(20, Math.round(s_w * scale));
                        const finalH = Math.max(20, Math.round(s_h * scale));
                        selEl.style.width = finalW + 'px';
                        selEl.style.height = finalH + 'px';
                        if (selEl.dataset.baseWidth !== undefined) selEl.dataset.baseWidth = finalW;
                        if (selEl.dataset.baseHeight !== undefined) selEl.dataset.baseHeight = finalH;
                    }
                });
            }
        }
        
        function rsUp() {
            document.removeEventListener('mousemove', rsMove);
            document.removeEventListener('mouseup', rsUp);
            document.removeEventListener('touchmove', rsMove);
            document.removeEventListener('touchend', rsUp);
            
            const curW = el.offsetWidth;
            const curH = el.offsetHeight;
            const baseL = parseFloat(el.dataset.baseLeft !== undefined ? el.dataset.baseLeft : el.style.left) || 0;
            const baseT = parseFloat(el.dataset.baseTop !== undefined ? el.dataset.baseTop : el.style.top) || 0;
            const svgEl = el.querySelector('svg');
            if (svgEl) {
                svgEl.setAttribute('viewBox', `0 0 ${curW} ${curH}`);
            }
            
            const scaleX = startW > 0 ? (curW / startW) : 1;
            const scaleY = startH > 0 ? (curH / startH) : 1;

            const pIdx = (typeof drawPaths !== 'undefined') ? drawPaths.findIndex(p => p.el === el) : -1;
            if (pIdx > -1) {
                const pObj = drawPaths[pIdx];
                pObj.x1 = baseL;
                pObj.y1 = baseT;
                pObj.x2 = baseL + curW;
                pObj.y2 = baseT + curH;
                
                if (pObj.type === 'rect') {
                    const rPts = [
                        {x: 0, y: 0},
                        {x: curW, y: 0},
                        {x: curW, y: curH},
                        {x: 0, y: curH}
                    ];
                    el.dataset.polygonPoints = JSON.stringify(rPts);
                    if (svgEl) {
                        const rPtsStr = rPts.map(p => `${p.x},${p.y}`).join(' ');
                        svgEl.querySelectorAll('polygon').forEach(poly => poly.setAttribute('points', rPtsStr));
                    }
                    pObj.points = rPts.map(p => ({ x: baseL + p.x, y: baseT + p.y }));
                } else if (pObj.points && pObj.points.length > 0) {
                    pObj.points = pObj.points.map(pt => ({
                        x: baseL + (pt.x - baseL) * scaleX,
                        y: baseT + (pt.y - baseT) * scaleY
                    }));
                    if (el.dataset.polygonPoints) {
                        try {
                            const oldPts = JSON.parse(el.dataset.polygonPoints);
                            const newLocalPts = oldPts.map(pt => ({
                                x: Math.round(pt.x * scaleX * 10) / 10,
                                y: Math.round(pt.y * scaleY * 10) / 10
                            }));
                            el.dataset.polygonPoints = JSON.stringify(newLocalPts);
                            if (svgEl) {
                                const newPtsStr = newLocalPts.map(p => `${p.x},${p.y}`).join(' ');
                                svgEl.querySelectorAll('polygon').forEach(poly => poly.setAttribute('points', newPtsStr));
                            }
                        } catch(e) {}
                    }
                }
                
                if (typeof updateSinglePathSvg === 'function') updateSinglePathSvg(pObj);
                if (pObj.hasSaber && typeof window.applySaberToPath === 'function') {
                    window.applySaberToPath(pIdx, pObj.saberOptions || window.saberState);
                }
            }
            if (typeof updateDrawHistory === 'function') updateDrawHistory();
            if (typeof window.recordHistory === 'function') window.recordHistory('Çizim Boyutlandırıldı');
            window.showVertexHandles(el);
        }
        
        document.addEventListener('mousemove', rsMove);
        document.addEventListener('mouseup', rsUp);
        document.addEventListener('touchmove', rsMove, {passive: false});
        document.addEventListener('touchend', rsUp);
    }
    resizeHandle.addEventListener('mousedown', rsDown);
    resizeHandle.addEventListener('touchstart', rsDown, {passive: false});
    container.appendChild(resizeHandle);
    
    el.appendChild(container);
    el.dataset.hasHandles = 'true';
};





    const style = document.createElement('style');
    style.innerHTML = `
        body.draw-mode-active #ui-layer,
        body.draw-mode-active #ui-layer *,
        body.draw-mode-active #canva-render-layer,
        body.draw-mode-active #canva-render-layer *,
        body.draw-mode-active #mask-layer,
        body.draw-mode-active .callout-wrap,
        body.draw-mode-active .callout-wrap *,
        body.draw-mode-active .svg-callout,
        body.draw-mode-active .svg-callout *,
        body.draw-mode-active .co-neon-block,
        body.draw-mode-active .co-neon-block *,
        body.draw-mode-active .canvas-el,
        body.draw-mode-active .canvas-el *,
        body.draw-mode-active .draggable,
        body.draw-mode-active .draggable *,
        body.draw-mode-active .editable-draw,
        body.draw-mode-active .editable-draw *,
        body.draw-mode-active .cvi-item,
        body.draw-mode-active .cvi-item *,
        body.draw-mode-active .callout-controls,
        body.draw-mode-active .callout-resizer,
        body.draw-mode-active .callout-rotator,
        body.draw-mode-active .callout-select-border,
        body.draw-mode-active .text-handle,
        body.draw-mode-active .draw-handle,
        body.draw-mode-active .vertex-handle { 
            pointer-events: none !important; 
        }
        body:not(.draw-mode-active) .editable-draw { 
            pointer-events: none !important; 
        }
        body:not(.draw-mode-active) .editable-draw.el-selected { 
            pointer-events: auto !important; 
        }
        body:not(.draw-mode-active) .editable-draw svg { 
            pointer-events: none !important; 
        }
        body:not(.draw-mode-active) .editable-draw svg path, 
        body:not(.draw-mode-active) .editable-draw svg polygon, 
        body:not(.draw-mode-active) .editable-draw svg rect, 
        body:not(.draw-mode-active) .editable-draw svg ellipse, 
        body:not(.draw-mode-active) .editable-draw svg line, 
        body:not(.draw-mode-active) .editable-draw svg circle, 
        body:not(.draw-mode-active) .editable-draw svg polyline,
        body:not(.draw-mode-active) .editable-draw svg g {
            pointer-events: all !important;
            cursor: pointer;
        }
    `;
    if (document.head) document.head.appendChild(style);
    else document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));

    if(document.getElementById('drawColor')) document.getElementById('drawColor').addEventListener('input', updateSelectedDraw);
    if(document.getElementById('drawWidth')) document.getElementById('drawWidth').addEventListener('input', updateSelectedDraw);
    if(document.getElementById('drawOpacity')) document.getElementById('drawOpacity').addEventListener('input', updateSelectedDraw);
    
    const polyShowCheck = document.getElementById('polyShowVertices');
    if (polyShowCheck) {
        polyShowCheck.addEventListener('change', function() {
            const isChecked = this.checked;
            if (document.getElementById('dePolyShowVertices')) {
                document.getElementById('dePolyShowVertices').checked = isChecked;
            }
            if (typeof drawPaths !== 'undefined' && drawPaths.length > 0) {
                drawPaths.forEach(p => {
                    if (p.type === 'rect' || p.type === 'polygon') {
                        p.showVertices = isChecked;
                        if (p.el) {
                            p.el.querySelectorAll('circle').forEach(c => {
                                c.style.display = isChecked ? 'block' : 'none';
                            });
                        }
                    }
                });
                if (typeof redrawAll === 'function') redrawAll();
            }
        });
    }
window.hideVertexHandles = function() {
    document.querySelectorAll('.vertex-handles-container').forEach(c => {
        if(c.parentElement) c.parentElement.dataset.hasHandles = 'false';
        c.remove();
    });
};


