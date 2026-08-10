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
    if (p.saber) {
        ctx.globalAlpha = p.opacity;
        ctx.filter = 'none';
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const originalWidth = p.width;
        
        ctx.shadowColor = p.color;
        
        ctx.lineWidth = originalWidth + 6;
        ctx.strokeStyle = p.color;
        ctx.shadowBlur = 20;
        ctx.stroke();
        
        ctx.lineWidth = originalWidth + 2;
        ctx.shadowBlur = 10;
        ctx.stroke();
        
        ctx.lineWidth = originalWidth * 0.4 < 1 ? 1 : originalWidth * 0.4;
        ctx.strokeStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.stroke();
        
        ctx.lineWidth = originalWidth;
        ctx.strokeStyle = p.color;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
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


    drawCtx.save();
    let tParams = null;
    if(p.photoRef && uploadedImgW > 0) {
        const pl = getActiveV4Element();
        const activePanel = getActivePhotoPanel();
        
        let currObj;
        if(pl && pl.dataset.zpReady === '1') {
            currObj = { 
                v4: true, 
                z: parseFloat(pl.dataset.zpScale)||1, 
                px: parseFloat(pl.dataset.zpX)||0, 
                py: parseFloat(pl.dataset.zpY)||0,
                panelW: activePanel.w,
                panelH: activePanel.h,
                panelL: activePanel.left,
                panelT: activePanel.top
            , sliderX: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), sliderY: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50)
              };
        } else {
            currObj = { 
                v4: false, 
                z: parseInt(document.getElementById('photoZoomCtrl') ? document.getElementById('photoZoomCtrl').value : 100), 
                px: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), 
                py: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50),
                panelW: activePanel.w,
                panelH: activePanel.h,
                panelL: activePanel.left,
                panelT: activePanel.top
            , sliderX: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), sliderY: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50)
              };
        }
        
        if(currObj.z !== p.photoRef.z || 
             currObj.px !== p.photoRef.px || 
             currObj.py !== p.photoRef.py ||
             currObj.sliderX !== p.photoRef.sliderX ||
             currObj.sliderY !== p.photoRef.sliderY ||
             currObj.extraZ !== p.photoRef.extraZ ||
             currObj.extraPx !== p.photoRef.extraPx ||
             currObj.extraPy !== p.photoRef.extraPy ||
           currObj.panelW !== p.photoRef.panelW ||
           currObj.panelH !== p.photoRef.panelH ||
           currObj.panelL !== p.photoRef.panelL ||
           currObj.panelT !== p.photoRef.panelT ||
           currObj.v4 !== p.photoRef.v4) {
            tParams = calculateTransformParams(p.photoRef, currObj);
        }
    }
    
    if(tParams) {
        drawCtx.translate(tParams.dx, tParams.dy);
        drawCtx.scale(tParams.scale, tParams.scale);
        
        if (p.el && p.el.dataset && p.el.dataset.baseLeft !== undefined) {
            const baseL = parseFloat(p.el.dataset.baseLeft);
            const baseT = parseFloat(p.el.dataset.baseTop);
            const baseW = parseFloat(p.el.dataset.baseWidth);
            const baseH = parseFloat(p.el.dataset.baseHeight);
            
            p.el.style.left = (baseL * tParams.scale + tParams.dx) + 'px';
            p.el.style.top = (baseT * tParams.scale + tParams.dy) + 'px';
            p.el.style.width = (baseW * tParams.scale) + 'px';
            p.el.style.height = (baseH * tParams.scale) + 'px';
        }
        
        if (p.hasSaber && p.saberRef && window.SaberEngine && SaberEngine.setSaberTransform) {
            SaberEngine.setSaberTransform(p.saberRef, tParams.scale, tParams.dx, tParams.dy);
        }
    } else {
        if (p.el && p.el.dataset && p.el.dataset.baseLeft !== undefined) {
            const baseL = parseFloat(p.el.dataset.baseLeft);
            const baseT = parseFloat(p.el.dataset.baseTop);
            const baseW = parseFloat(p.el.dataset.baseWidth);
            const baseH = parseFloat(p.el.dataset.baseHeight);
            
            p.el.style.left = baseL + 'px';
            p.el.style.top = baseT + 'px';
            p.el.style.width = baseW + 'px';
            p.el.style.height = baseH + 'px';
        }
        if (p.hasSaber && p.saberRef && window.SaberEngine && SaberEngine.setSaberTransform) {
            SaberEngine.setSaberTransform(p.saberRef, 1, 0, 0);
        }
    }
    
    if (p.el && drawCtx && drawCtx.canvas && (drawCtx.canvas.id === 'drawCanvas' || drawCtx.canvas.id === 'draw-layer')) {
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
            drawCtx.moveTo(p.x1, p.y1);
            drawCtx.lineTo(p.x2, p.y2);
            applyGlowAndStroke(drawCtx, p);
            
            if(p.type === 'arrow'){
                arrowHead(drawCtx, p.x1, p.y1, p.x2, p.y2, p.width, p.color, p.opacity, p.arrowStyle);
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
            
            if(p.showVertices){
                drawCtx.save();
                drawCtx.globalAlpha = 1;
                drawCtx.fillStyle = p.color;
                drawCtx.setLineDash([]);
                p.points.forEach(pt => {
                    drawCtx.beginPath();
                    drawCtx.arc(pt.x, pt.y, p.width + 2, 0, Math.PI*2);
                    drawCtx.fill();
                });
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
    if (mode === 'off') {
        document.querySelectorAll('.editable-draw').forEach(el => {
            el.style.pointerEvents = 'none';
            // Ã„Â°ÃƒÂ§indeki ÃƒÂ§izim elemanlarÃ„Â± tÃ„Â±klanabilsin diye
            const children = el.querySelectorAll('*');
            children.forEach(child => child.style.pointerEvents = 'all');
        });
    } else {
        document.querySelectorAll('.editable-draw').forEach(el => el.style.pointerEvents = 'none');
        if (typeof deselectAll === 'function') deselectAll();
    }
    removeTempPolygonSaber();
    if(mode!=='polygon'&&polygonBuilding){polygonPoints=[];polygonBuilding=false;redrawAll()}
    drawMode=mode;
    ['dmOff','dmFree','dmLine','dmArrow','dmRect','dmCircle','dmPoly'].forEach(id=>{if($(id))$(id).classList.remove('active')});
    const map={off:'dmOff',free:'dmFree',line:'dmLine',arrow:'dmArrow',rect:'dmRect',circle:'dmCircle',polygon:'dmPoly'};
    if($(map[mode]))$(map[mode]).classList.add('active');
    $('polyInfo').style.display=mode==='polygon'?'block':'none';
    if(document.getElementById('arrowStyleContainer')) {
        document.getElementById('arrowStyleContainer').style.display = mode === 'arrow' ? 'block' : 'none';
    }
    if(mode==='off'){
        drawCanvas.style.pointerEvents='none';
        // z-index handled by CSS (#draw-layer z:5, below canva-render-layer z:10)
        $('drawIndicator').classList.remove('show');
        $('canvasHint').textContent='💡 Tek tık: Seç | Çift tık: Yazıyı Düzenle | Sürükle: Taşı';
    }else{
        drawCanvas.style.pointerEvents='auto';
        // z-index handled by CSS (#draw-layer z:5, below canva-render-layer z:10)
        drawCanvas.style.cursor='default';
        $('drawIndicator').classList.add('show');
        $('canvasHint').textContent=mode==='polygon'?'📍 Tıklayarak köşe ekle, çift tıkla kapat':'✏️ ÇİZİM AKTİF';
    }
}

function getDS(){
    return{
        color:$('drawColor').value,
        width:+$('drawWidth').value,
        opacity:+$('drawOpacity').value/100,
        dashStyle:$('drawDash').value,
        fillColor:$('fillColor').value,
        fillOpacity:+$('fillOpacity').value/100,
        showVertices:$('polyShowVertices')?$('polyShowVertices').checked:true,
          arrowStyle:$('arrowStyleSelect')?parseInt($('arrowStyleSelect').value):1
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
    const nowGlobal = Date.now();
    if (nowGlobal - lastGlobalDStartTime < 50) {
        if(e.cancelable !== false) e.preventDefault();
        e.stopPropagation();
        return;
    }
    lastGlobalDStartTime = nowGlobal;
    // Pointer events: sadece pen ve touch işle (mouse zaten ayrıca bağlı)
    if (e.type === 'pointerdown') {
        if (e.pointerType === 'mouse') return; // mouse zaten mousedown ile işleniyor
        e.preventDefault();
        e.stopPropagation();
    } else {
        e.preventDefault();
        e.stopPropagation();
    }
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
            if (dist < polyTolerance / (typeof scaleFactor !== "undefined" ? scaleFactor : 1)) {
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
            drawCtx.moveTo(drawStartX,drawStartY);
            drawCtx.lineTo(p.x,p.y);
            if (s.saber) { applyGlowAndStroke(drawCtx, s); } else { drawCtx.stroke(); }
            if(drawMode==='arrow')arrowHead(drawCtx,drawStartX,drawStartY,p.x,p.y,s.width,s.color,s.opacity,s.arrowStyle);
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
    let photoRef;
    if (pl && pl.dataset.zpReady === '1') {
        photoRef = {
            v4: true,
            z: parseFloat(pl.dataset.zpScale) || 1,
            px: parseFloat(pl.dataset.zpX) || 0,
            py: parseFloat(pl.dataset.zpY) || 0,
            panelW: panel.w, panelH: panel.h, panelL: panel.left, panelT: panel.top
        };
    } else {
        photoRef = {
            v4: false,
            z: parseInt(document.getElementById('photoZoomCtrl') ? document.getElementById('photoZoomCtrl').value : 100),
            px: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50),
            py: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50),
            panelW: panel.w, panelH: panel.h, panelL: panel.left, panelT: panel.top
        };
    }
    
    
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
        const el = createSVGFromPath(pObj);
    if (el) {
        if (typeof allIcons !== 'undefined') {
            allIcons.push(el);
            if (document.getElementById('iconCount')) document.getElementById('iconCount').textContent = allIcons.length;
        }
        if (typeof drawPaths !== 'undefined') {
            const hasEl = drawPaths.some(p => p.el === el);
            if (!hasEl) {
                drawRedoPaths = [];
                drawPaths.push(Object.assign({}, pObj, {
                    hasSaber: false,
                    photoRef:  (typeof getActivePhotoPanel === 'function' ? (function(){
                            const pnl = getActivePhotoPanel();
                            const pl = typeof getActiveV4Element === 'function' ? getActiveV4Element() : null;
                            if (pl && pl.dataset.zpReady === '1') {
                                return { v4: true, z: parseFloat(pl.dataset.zpScale) || 1, px: parseFloat(pl.dataset.zpX) || 0, py: parseFloat(pl.dataset.zpY) || 0, panelW: pnl.w, panelH: pnl.h, panelL: pnl.left, panelT: pnl.top, sliderX: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), sliderY: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50) };
                            } else {
                                return { v4: false, z: parseInt(document.getElementById('photoZoomCtrl') ? document.getElementById('photoZoomCtrl').value : 100), px: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), py: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50), panelW: pnl.w, panelH: pnl.h, panelL: pnl.left, panelT: pnl.top, sliderX: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), sliderY: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50) , extraZ: (document.getElementById('photo-layer') && document.getElementById('photo-layer').dataset.zpReady === '1') ? (parseFloat(document.getElementById('photo-layer').dataset.zpScale) || 1) : 1, extraPx: (document.getElementById('photo-layer') && document.getElementById('photo-layer').dataset.zpReady === '1') ? (parseFloat(document.getElementById('photo-layer').dataset.zpX) || 0) : 0, extraPy: (document.getElementById('photo-layer') && document.getElementById('photo-layer').dataset.zpReady === '1') ? (parseFloat(document.getElementById('photo-layer').dataset.zpY) || 0) : 0 };
                            }
                        })() : null),
                    el: el
                }));
                if (typeof updateDrawHistory === 'function') updateDrawHistory();
            }
        }
            // Optionally, switch draw mode to off so they can interact with the element
            // setDrawMode('off'); removed for continuous drawing
        }
    }

    currentPath=[];
    redrawAll();
    updateDrawHistory();

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â Ã¢Å¡Â¡ SABER HOOK Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
    if (window.saberState && window.saberState.active && window.applySaberToPath) {
        window.applySaberToPath(drawPaths.length - 1, JSON.parse(JSON.stringify(window.saberState)));
    }
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
    
    const pObj = Object.assign({type:'polygon', closed:true, points:polygonPoints.slice(), showVertices: showV, photoRef: (function(){
        const pnl = getActivePhotoPanel();
        const pl = getActiveV4Element();
        if (pl && pl.dataset.zpReady === '1') {
            return { v4: true, z: parseFloat(pl.dataset.zpScale) || 1, px: parseFloat(pl.dataset.zpX) || 0, py: parseFloat(pl.dataset.zpY) || 0, panelW: pnl.w, panelH: pnl.h, panelL: pnl.left, panelT: pnl.top, sliderX: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), sliderY: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50) };
        } else {
            return { v4: false, z: parseInt(document.getElementById('photoZoomCtrl') ? document.getElementById('photoZoomCtrl').value : 100), px: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), py: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50), panelW: pnl.w, panelH: pnl.h, panelL: pnl.left, panelT: pnl.top, sliderX: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), sliderY: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50) , extraZ: (document.getElementById('photo-layer') && document.getElementById('photo-layer').dataset.zpReady === '1') ? (parseFloat(document.getElementById('photo-layer').dataset.zpScale) || 1) : 1, extraPx: (document.getElementById('photo-layer') && document.getElementById('photo-layer').dataset.zpReady === '1') ? (parseFloat(document.getElementById('photo-layer').dataset.zpX) || 0) : 0, extraPy: (document.getElementById('photo-layer') && document.getElementById('photo-layer').dataset.zpReady === '1') ? (parseFloat(document.getElementById('photo-layer').dataset.zpY) || 0) : 0 };
        }
    })()},s);
    
    const el = createSVGFromPath(pObj);
    if (el) {
        if (typeof allIcons !== 'undefined') {
                allIcons.push(el);
                if (document.getElementById('iconCount')) document.getElementById('iconCount').textContent = allIcons.length;
            }
            if (typeof drawPaths !== 'undefined') {
            const hasEl = drawPaths.some(p => p.el === el);
            if (!hasEl) {
                drawPaths.push(Object.assign({}, pObj, {
    hasSaber: false,
    photoRef:  (typeof getActivePhotoPanel === 'function' ? (function(){
            const pnl = getActivePhotoPanel();
            const pl = typeof getActiveV4Element === 'function' ? getActiveV4Element() : null;
            if (pl && pl.dataset.zpReady === '1') {
                return { v4: true, z: parseFloat(pl.dataset.zpScale) || 1, px: parseFloat(pl.dataset.zpX) || 0, py: parseFloat(pl.dataset.zpY) || 0, panelW: pnl.w, panelH: pnl.h, panelL: pnl.left, panelT: pnl.top, sliderX: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), sliderY: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50) };
            } else {
                return { v4: false, z: parseInt(document.getElementById('photoZoomCtrl') ? document.getElementById('photoZoomCtrl').value : 100), px: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), py: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50), panelW: pnl.w, panelH: pnl.h, panelL: pnl.left, panelT: pnl.top };
            }
        })() : null),
    el: el
}));
                if (typeof updateDrawHistory === 'function') updateDrawHistory();
            }
        }
        // setDrawMode('off'); removed for continuous drawing
    }

    
    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â Ã¢Å¡Â¡ SABER HOOK Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
    if (window.saberState && window.saberState.active && window.applySaberToPath) {
        window.applySaberToPath(drawPaths.length - 1, JSON.parse(JSON.stringify(window.saberState)));
    }
    
    polygonPoints=[];
    polygonBuilding=false;
    redrawAll();
    updateDrawHistory();
}

function arrowHead(ctx,x1,y1,x2,y2,w,color,op,style){
    const a=Math.atan2(y2-y1,x2-x1);
    let h=w*5;
    ctx.save();
    ctx.setLineDash([]);
    ctx.globalAlpha=op||1;
    ctx.fillStyle=color;
    ctx.strokeStyle=color;
    ctx.lineCap='round';
    ctx.lineJoin='round';
    ctx.lineWidth=w;
    
    ctx.beginPath();
    const s = parseInt(style) || 1;
    switch(s) {
        case 1: // Standart IÃƒÂ§i Dolu
            ctx.moveTo(x2,y2);
            ctx.lineTo(x2-h*Math.cos(a-Math.PI/6),y2-h*Math.sin(a-Math.PI/6));
            ctx.lineTo(x2-h*Math.cos(a+Math.PI/6),y2-h*Math.sin(a+Math.PI/6));
            ctx.closePath();
            ctx.fill();
            break;
        case 2: // Ince V (IÃƒÂ§i Bos)
            h = w*6;
            ctx.moveTo(x2-h*Math.cos(a-Math.PI/6),y2-h*Math.sin(a-Math.PI/6));
            ctx.lineTo(x2,y2);
            ctx.lineTo(x2-h*Math.cos(a+Math.PI/6),y2-h*Math.sin(a+Math.PI/6));
            ctx.stroke();
            break;
        case 3: // Genis ÃƒÅ“ÃƒÂ§gen
            h = w*5;
            ctx.moveTo(x2,y2);
            ctx.lineTo(x2-h*Math.cos(a-Math.PI/4),y2-h*Math.sin(a-Math.PI/4));
            ctx.lineTo(x2-h*Math.cos(a+Math.PI/4),y2-h*Math.sin(a+Math.PI/4));
            ctx.closePath();
            ctx.fill();
            break;
        case 4: // Stealth (IÃƒÂ§e Kivrik)
            h = w*6;
            ctx.moveTo(x2,y2);
            ctx.lineTo(x2-h*Math.cos(a-Math.PI/6),y2-h*Math.sin(a-Math.PI/6));
            ctx.lineTo(x2-(h*0.5)*Math.cos(a),y2-(h*0.5)*Math.sin(a));
            ctx.lineTo(x2-h*Math.cos(a+Math.PI/6),y2-h*Math.sin(a+Math.PI/6));
            ctx.closePath();
            ctx.fill();
            break;
        case 5: // Elmas (Diamond)
            h = w*4;
            ctx.moveTo(x2,y2);
            ctx.lineTo(x2-h*Math.cos(a-Math.PI/6),y2-h*Math.sin(a-Math.PI/6));
            ctx.lineTo(x2-(h*2)*Math.cos(a),y2-(h*2)*Math.sin(a));
            ctx.lineTo(x2-h*Math.cos(a+Math.PI/6),y2-h*Math.sin(a+Math.PI/6));
            ctx.closePath();
            ctx.fill();
            break;
        case 6: // Yuvarlak Baslik
            h = w*3;
            ctx.arc(x2,y2,h,0,Math.PI*2);
            ctx.fill();
            break;
        case 7: // Kare Baslik
            h = w*3;
            ctx.save();
            ctx.translate(x2,y2);
            ctx.rotate(a);
            ctx.fillRect(-h, -h, h*2, h*2);
            ctx.restore();
            break;
        case 8: // Ãƒâ€¡ift YÃƒÂ¶nlÃƒÂ¼ Ok
            ctx.moveTo(x2,y2);
            ctx.lineTo(x2-h*Math.cos(a-Math.PI/6),y2-h*Math.sin(a-Math.PI/6));
            ctx.lineTo(x2-h*Math.cos(a+Math.PI/6),y2-h*Math.sin(a+Math.PI/6));
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x1,y1);
            ctx.lineTo(x1+h*Math.cos(a-Math.PI/6),y1+h*Math.sin(a-Math.PI/6));
            ctx.lineTo(x1+h*Math.cos(a+Math.PI/6),y1+h*Math.sin(a+Math.PI/6));
            ctx.closePath();
            ctx.fill();
            break;
        case 9: // T-Sekli
            h = w*5;
            ctx.moveTo(x2-h*Math.cos(a+Math.PI/2),y2-h*Math.sin(a+Math.PI/2));
            ctx.lineTo(x2+h*Math.cos(a+Math.PI/2),y2+h*Math.sin(a+Math.PI/2));
            ctx.stroke();
            break;
        case 10: // DÃƒÂ¼z Ãƒâ€¡izgi (Basliksiz)
            break;
    }
    ctx.restore();
}

function redrawAll(){
    const w=drawCanvas.width||1920;
    const h=drawCanvas.height||1080;
    drawCtx.clearRect(0,0,w,h);
    
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
}

function undoLastDraw() {
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
            } catch(e) { console.warn('Saber undo hatasÃ„Â±:', e); }
        }
    }
    redrawAll();
    updateDrawHistory();
    cancelDrawEdit();
}

function redoLastDraw() {
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
    if(!drawPaths.length){
    h.innerHTML='<div style="text-align:center;color:#475569;font-size:10px;padding:8px">Henüz çizim yok</div>';return}
    h.innerHTML='';
    const names={free:'<i class="fas fa-pencil-alt"></i> Serbest',line:'<i class="fas fa-grip-lines"></i> Çizgi',arrow:'<i class="fas fa-arrow-right"></i> Ok',rect:'<i class="far fa-square"></i> Kare',circle:'<i class="far fa-circle"></i> Daire',polygon:'<i class="fas fa-draw-polygon"></i> Çokgen'};
    drawPaths.forEach((p,i)=>{
        const item=document.createElement('div');
        item.className='draw-history-item' + (i === editingDrawIndex ? ' active' : '');
        const saberBtn = p.hasSaber ? `<button class="dh-btn dh-saber" onclick="startDrawEdit(${i})" title="Saber AyarlarÄ±"><i class="fas fa-magic"></i></button>` : `<button class="dh-btn dh-saber-add" onclick="addSaberToPath(${i})" title="Saber Ekle"><i class="fas fa-bolt"></i></button>`;
        item.innerHTML='<span><span class="dh-color" style="background:'+p.color+'"></span>'+(names[p.type]||p.type)+' #'+(i+1)+(p.fillOpacity>0?' <i class="fas fa-fill-drip" style="font-size:10px; margin-left:4px;"></i>':'')+'</span><span>'+saberBtn+'<button class="dh-btn dh-edit" onclick="startDrawEdit('+i+')" title="Düzenle"><i class="fas fa-pen" style="font-size:11px;"></i></button><button class="dh-btn dh-del" onclick="deleteDrawItem('+i+')" title="Sil"><i class="fas fa-trash" style="font-size:11px;"></i></button></span>';
        h.appendChild(item);
    });
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

function startDrawEdit(i){
    editingDrawIndex=i;
    const p=drawPaths[i];
    
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
    
    $('deColor').value=p.color;
    $('deWidth').value=p.width;
    $('deWidthVal').textContent=p.width;
    if($('deOpacity'))$('deOpacity').value=Math.round(p.opacity*100);
    if($('deOpacityVal'))$('deOpacityVal').textContent=Math.round(p.opacity*100)+'%';
    if($('deFillColor'))$('deFillColor').value=p.fillColor||'#ef4444';
    if($('deFillOp'))$('deFillOp').value=Math.round((p.fillOpacity||0)*100);
    if($('deFillOpVal'))$('deFillOpVal').textContent=Math.round((p.fillOpacity||0)*100)+'%';
    if($('dePolyShowVertices')) {
        $('dePolyShowVertices').checked = p.showVertices !== false;
        $('dePolyShowVertices').parentElement.style.display = (p.type === 'polygon') ? 'flex' : 'none';
    }
    
    // SABER UI SETUP
    const toggle = $('deSaberToggle');
    const settings = $('deSaberSettings');
    if (toggle && settings) {
        toggle.checked = !!p.hasSaber;
        settings.style.display = p.hasSaber ? 'flex' : 'none';
        
        const presets = window.SaberEngine ? SaberEngine.presets : {};
        const colors = window.SaberEngine ? SaberEngine.colorPresets : {};
        const currentOpts = p.saberOptions || window.saberState || {};
        
        let presetsHTML = '';
        Object.keys(presets).forEach(key => {
            const presetData = presets[key];
            const active = (key === currentOpts.preset || (!currentOpts.preset && key === 'fully-lit')) ? 'active' : '';
            presetsHTML += `<div class="sep-preset ${active}" data-preset="${key}" onclick="setDrawEditSaberPreset('${key}')"><div>${presetData.icon}</div><div class="sep-preset-name">${presetData.name}</div></div>`;
        });
        if ($('deSaberPresets')) $('deSaberPresets').innerHTML = presetsHTML;
        
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
    }
    
    if($('drawEditPanel'))$('drawEditPanel').style.display='block';
    const names={free:'<i class="fas fa-pencil-alt"></i> Serbest',line:'<i class="fas fa-grip-lines"></i> Çizgi',arrow:'<i class="fas fa-arrow-right"></i> Ok',rect:'<i class="far fa-square"></i> Kare',circle:'<i class="far fa-circle"></i> Daire',polygon:'<i class="fas fa-draw-polygon"></i> Çokgen'};
    if($('drawEditLabel'))$('drawEditLabel').textContent='#'+(i+1)+' '+(names[p.type]||'');
    if(typeof updateDrawHistory === 'function') updateDrawHistory();
}

window.setDrawEditSaberPreset = function(key) {
    if (!$('deSaberPresets')) return;
    $('deSaberPresets').querySelectorAll('.sep-preset').forEach(x => x.classList.remove('active'));
    const el = $('deSaberPresets').querySelector(`[data-preset="${key}"]`);
    if (el) el.classList.add('active');
    
    if (window.SaberEngine && window.SaberEngine.presets[key]) {
        const pData = SaberEngine.presets[key];
        if ($('deSaberCoreSize')) { $('deSaberCoreSize').value = pData.settings.coreSize || 4; $('deSaberCoreSizeVal').textContent = pData.settings.coreSize || 4; }
        if ($('deSaberGlowSize')) { $('deSaberGlowSize').value = pData.settings.glowSize || 30; $('deSaberGlowSizeVal').textContent = pData.settings.glowSize || 30; }
    }
    liveUpdateDrawEdit();
};

window.setDrawEditSaberColor = function(key) {
    if (window.SaberEngine && window.SaberEngine.colorPresets[key]) {
        if ($('deSaberColors')) $('deSaberColors').dataset.activeColor = key;
    }
    liveUpdateDrawEdit();
};

function applyDrawEdit(){
    liveUpdateDrawEdit();
    updateDrawHistory();
    originalDrawState = null; // Clear backup so cancelDrawEdit doesn't revert
    cancelDrawEdit();
}

let updateSaberTimer = null;

window.liveUpdateDrawEdit = function(){
    if(editingDrawIndex<0||editingDrawIndex>=drawPaths.length)return;
    const p=drawPaths[editingDrawIndex];
    if($('deColor')) p.color=$('deColor').value;
    if($('deWidth')) p.width=+$('deWidth').value;
    if($('deOpacity')) p.opacity=+$('deOpacity').value/100;
    if($('deFillColor')) p.fillColor=$('deFillColor').value;
    if($('deFillOp')) p.fillOpacity=+$('deFillOp').value/100;
    if($('dePolyShowVertices')) p.showVertices = $('dePolyShowVertices').checked;
    
    // Update span labels
    if ($('deWidthVal') && $('deWidth')) $('deWidthVal').textContent = $('deWidth').value;
    if ($('deOpacityVal') && $('deOpacity')) $('deOpacityVal').textContent = $('deOpacity').value + '%';
    if ($('deFillOpVal') && $('deFillOp')) $('deFillOpVal').textContent = $('deFillOp').value + '%';
    
    // SABER UPDATE
    const toggle = $('deSaberToggle');
    const settings = $('deSaberSettings');
    if (toggle && toggle.checked) {
        if (settings) settings.style.display = 'flex';
        
        const activePresetEl = $('deSaberPresets') ? $('deSaberPresets').querySelector('.active') : null;
        const presetKey = activePresetEl ? activePresetEl.dataset.preset : 'fully-lit';
        
        let coreColor = 0xFFFFFF;
        let glowColor = 0x00AAFF;
        
        const activeColorKey = $('deSaberColors') ? $('deSaberColors').dataset.activeColor : null;
        if (activeColorKey && window.SaberEngine && SaberEngine.colorPresets[activeColorKey]) {
            coreColor = SaberEngine.colorPresets[activeColorKey].core;
            glowColor = SaberEngine.colorPresets[activeColorKey].glow;
        } else if (p.saberOptions) {
            coreColor = p.saberOptions.coreColor;
            glowColor = p.saberOptions.glowColor;
        } else if (window.saberState) {
            coreColor = saberState.coreColor;
            glowColor = saberState.glowColor;
        }
        
        const newOptions = {
            preset: presetKey,
            coreColor: coreColor,
            glowColor: glowColor,
            coreSize: parseInt($('deSaberCoreSize') ? $('deSaberCoreSize').value : 4),
            glowSize: parseInt($('deSaberGlowSize') ? $('deSaberGlowSize').value : 30),
            intensity: parseFloat($('deSaberIntensity') ? $('deSaberIntensity').value : 2.5),
            flickerAmount: parseInt($('deSaberFlicker') ? $('deSaberFlicker').value : 5) / 100,
            pulseSpeed: parseFloat($('deSaberPulse') ? $('deSaberPulse').value : 0)
        };
        
        // update span labels
        if ($('deSaberCoreSizeVal')) $('deSaberCoreSizeVal').textContent = newOptions.coreSize;
        if ($('deSaberGlowSizeVal')) $('deSaberGlowSizeVal').textContent = newOptions.glowSize;
        if ($('deSaberIntensityVal')) $('deSaberIntensityVal').textContent = newOptions.intensity;
        if ($('deSaberFlickerVal')) $('deSaberFlickerVal').textContent = Math.round(newOptions.flickerAmount * 100);
        if ($('deSaberPulseVal')) $('deSaberPulseVal').textContent = newOptions.pulseSpeed;
        
        if (window.applySaberToPath) {
            clearTimeout(updateSaberTimer);
            updateSaberTimer = setTimeout(() => {
                applySaberToPath(editingDrawIndex, newOptions);
            }, 50);
        }
    } else {
        if (settings) settings.style.display = 'none';
        if (window.removeSaberFromPath) {
            removeSaberFromPath(editingDrawIndex);
        }
    }
    
    // Update SVG element if it exists
    if (p.el && p.el.parentNode) {
        const oldEl = p.el;
        const newEl = createSVGFromPath(p);
        if (newEl) {
            oldEl.parentNode.replaceChild(newEl, oldEl);
            p.el = newEl;
            if (window.selectedEl === oldEl) {
                window.selectedEl = newEl;
                newEl.classList.add('el-selected');
            }
        }
    }
    
    redrawAll();
};

function cancelDrawEdit(){
    if (originalDrawState && editingDrawIndex >= 0 && editingDrawIndex < drawPaths.length) {
        const currentPath = drawPaths[editingDrawIndex];
        const oldRef = currentPath.saberRef;
        const oldEl = currentPath.el;
        const oldPhotoRef = currentPath.photoRef;
        
        // Revert to backup
        drawPaths[editingDrawIndex] = JSON.parse(JSON.stringify(originalDrawState));
        // Restore references
        drawPaths[editingDrawIndex].saberRef = oldRef;
        drawPaths[editingDrawIndex].photoRef = oldPhotoRef;
        
        // Recreate SVG with original state to visually revert
        const newEl = createSVGFromPath(drawPaths[editingDrawIndex]);
        if (newEl && oldEl && oldEl.parentNode) {
            oldEl.parentNode.replaceChild(newEl, oldEl);
            drawPaths[editingDrawIndex].el = newEl;
            if (window.selectedEl === oldEl) {
                window.selectedEl = newEl;
                newEl.classList.add('el-selected');
            }
        } else {
            drawPaths[editingDrawIndex].el = oldEl;
        }
        
        // Restore saber effect state
        if (originalDrawState.hasSaber && window.applySaberToPath) {
            applySaberToPath(editingDrawIndex, originalDrawState.saberOptions);
        } else if (!originalDrawState.hasSaber && window.removeSaberFromPath) {
            removeSaberFromPath(editingDrawIndex);
        }
        
        redrawAll();
    }
    editingDrawIndex=-1;
    originalDrawState=null;
    if($('drawEditPanel'))$('drawEditPanel').style.display='none';
}


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
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const pts = p.type === 'free' ? p.points : (p.type === 'polygon' ? p.points : [{x:p.x1,y:p.y1},{x:p.x2,y:p.y2}]);
    if(!pts || pts.length === 0) return null;
    
    pts.forEach(pt => {
        if(pt.x < minX) minX = pt.x;
        if(pt.y < minY) minY = pt.y;
        if(pt.x > maxX) maxX = pt.x;
        if(pt.y > maxY) maxY = pt.y;
    });

    // Handle single clicks
    if(minX === maxX) { maxX += 1; }
    if(minY === maxY) { maxY += 1; }

    const padding = p.width * 10 + (p.glow || 0) + 30; 
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    const w = maxX - minX;
    const h = maxY - minY;
    
    let svgDefs = p.glow > 0 ? `<defs><filter id="glow-${Date.now()}"><feGaussianBlur stdDeviation="${p.glow/2}" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>` : '';
    const filterAttr = p.glow > 0 ? `filter="url(#glow-${Date.now()})"` : '';
    const dashArr = typeof getDash === 'function' ? getDash(p.dashStyle, p.width) : [];
    const dashStr = dashArr.length > 0 ? ` stroke-dasharray="${dashArr.join(',')}"` : '';
    const styleStr = `stroke="${p.color}" stroke-width="${p.width}" stroke-linecap="round" stroke-linejoin="round" fill="${p.fillOpacity > 0 ? p.fillColor : 'transparent'}" fill-opacity="${p.fillOpacity}" stroke-opacity="${p.opacity}"${dashStr}`;
    const fillStr = `fill="${p.color}" fill-opacity="${p.opacity}"`;
    
    let body = '';
    
    if(p.type === 'free') {
        let d = `M ${pts[0].x - minX} ${pts[0].y - minY}`;
        for(let i=1; i<pts.length; i++) d += ` L ${pts[i].x - minX} ${pts[i].y - minY}`;
        body = `<path d="${d}" ${styleStr} ${filterAttr} />`;
    } else if(p.type === 'polygon') {
        let ptStr = pts.map(pt => `${pt.x - minX},${pt.y - minY}`).join(' ');
        body = `<polygon points="${ptStr}" ${styleStr} ${filterAttr} />`;
        if (p.showVertices) {
            pts.forEach(pt => {
                body += `<circle cx="${pt.x - minX}" cy="${pt.y - minY}" r="${p.width + 2}" fill="${p.color}" ${filterAttr} />`;
            });
        }
    } else if(p.type === 'rect') {
        const rX = Math.min(p.x1, p.x2) - minX;
        const rY = Math.min(p.y1, p.y2) - minY;
        const rW = Math.abs(p.x2 - p.x1);
        const rH = Math.abs(p.y2 - p.y1);
        const ptStr = `${rX},${rY} ${rX+rW},${rY} ${rX+rW},${rY+rH} ${rX},${rY+rH}`;
        body = `<polygon points="${ptStr}" ${styleStr} ${filterAttr} />`;
    } else if(p.type === 'circle') {
        const cx = (p.x1 + p.x2)/2 - minX;
        const cy = (p.y1 + p.y2)/2 - minY;
        const rx = Math.abs(p.x2 - p.x1)/2;
        const ry = Math.abs(p.y2 - p.y1)/2;
        body = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${styleStr} ${filterAttr} />`;
    } else if(p.type === 'line' || p.type === 'arrow') {
        body = `<line x1="${p.x1 - minX}" y1="${p.y1 - minY}" x2="${p.x2 - minX}" y2="${p.y2 - minY}" ${styleStr} ${filterAttr} />`;
        if(p.type === 'arrow') {
            const a = Math.atan2(p.y2 - p.y1, p.x2 - p.x1);
            const x2 = p.x2 - minX, y2 = p.y2 - minY;
            const x1 = p.x1 - minX, y1 = p.y1 - minY;
            let hw = p.width * 5;
            const s = p.arrowStyle || 1;
            
            const cos = (deg) => Math.cos(a + deg * Math.PI / 180);
            const sin = (deg) => Math.sin(a + deg * Math.PI / 180);
            
            switch(s) {
                case 1:
                    body += `<polygon points="${x2},${y2} ${x2 - hw * cos(-30)},${y2 - hw * sin(-30)} ${x2 - hw * cos(30)},${y2 - hw * sin(30)}" ${fillStr} ${filterAttr} />`;
                    break;
                case 2:
                    hw = p.width * 6;
                    body += `<polyline points="${x2 - hw * cos(-30)},${y2 - hw * sin(-30)} ${x2},${y2} ${x2 - hw * cos(30)},${y2 - hw * sin(30)}" stroke="${p.color}" stroke-width="${p.width}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${filterAttr} />`;
                    break;
                case 3:
                    hw = p.width * 5;
                    body += `<polygon points="${x2},${y2} ${x2 - hw * cos(-45)},${y2 - hw * sin(-45)} ${x2 - hw * cos(45)},${y2 - hw * sin(45)}" ${fillStr} ${filterAttr} />`;
                    break;
                case 4:
                    hw = p.width * 6;
                    body += `<polygon points="${x2},${y2} ${x2 - hw * cos(-30)},${y2 - hw * sin(-30)} ${x2 - hw/2 * cos(0)},${y2 - hw/2 * sin(0)} ${x2 - hw * cos(30)},${y2 - hw * sin(30)}" ${fillStr} ${filterAttr} />`;
                    break;
                case 5:
                    hw = p.width * 4;
                    body += `<polygon points="${x2},${y2} ${x2 - hw * cos(-30)},${y2 - hw * sin(-30)} ${x2 - hw*2 * cos(0)},${y2 - hw*2 * sin(0)} ${x2 - hw * cos(30)},${y2 - hw * sin(30)}" ${fillStr} ${filterAttr} />`;
                    break;
                case 6:
                    hw = p.width * 3;
                    body += `<circle cx="${x2}" cy="${y2}" r="${hw}" ${fillStr} ${filterAttr} />`;
                    break;
                case 7:
                    hw = p.width * 3;
                    body += `<g transform="translate(${x2},${y2}) rotate(${a * 180 / Math.PI})" ${filterAttr}><rect x="${-hw}" y="${-hw}" width="${hw*2}" height="${hw*2}" ${fillStr} /></g>`;
                    break;
                case 8:
                    body += `<polygon points="${x2},${y2} ${x2 - hw * cos(-30)},${y2 - hw * sin(-30)} ${x2 - hw * cos(30)},${y2 - hw * sin(30)}" ${fillStr} ${filterAttr} />`;
                    body += `<polygon points="${x1},${y1} ${x1 + hw * cos(-30)},${y1 + hw * sin(-30)} ${x1 + hw * cos(30)},${y1 + hw * sin(30)}" ${fillStr} ${filterAttr} />`;
                    break;
                case 9:
                    hw = p.width * 5;
                    body += `<line x1="${x2 - hw * cos(90)}" y1="${y2 - hw * sin(90)}" x2="${x2 + hw * cos(90)}" y2="${y2 + hw * sin(90)}" stroke="${p.color}" stroke-width="${p.width}" stroke-linecap="round" ${filterAttr} />`;
                    break;
            }
        }
    }

    const svgString = `<svg style="overflow:visible;" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 ${w} ${h}">${svgDefs}${body}</svg>`;

    const icon = document.createElement('div');
    icon.className = 'cvi-item canva-el is-svg-icon editable-draw';
    icon.innerHTML = svgString;
    icon.dataset.label = 'Çizim: ' + p.type;
    // Set aspect ratio correctly
    icon.style.width = w + 'px';
    icon.style.height = h + 'px';
    icon.style.left = minX + 'px';
    icon.style.top = minY + 'px';
    icon.style.position = 'absolute';
    icon.style.zIndex = '50';
    icon.style.pointerEvents = 'none';
    icon.style.cursor = 'default';
    icon.dataset.baseWidth = w;
    icon.dataset.baseHeight = h;
    icon.dataset.baseLeft = minX;
    icon.dataset.baseTop = minY;
    
    const uiLayer = document.getElementById('ui-layer') || document.getElementById('canvas-container');
    if(uiLayer) uiLayer.appendChild(icon);
    
    if(typeof bindDrag !== 'undefined') bindDrag(icon);
    if(typeof renderLayers === 'function') renderLayers();
    if(typeof makeDraggable !== 'undefined') makeDraggable(icon);
    
    if (typeof drawMode !== 'undefined' && drawMode === 'off') {
        const children = icon.querySelectorAll('*');
        children.forEach(child => child.style.pointerEvents = 'visiblePainted');
    }
    
    return icon;
}



window.loadDrawSettings = function(el) {
    if(!el) return;
    const svg = el.querySelector('svg');
    if(!svg) return;
    
    const firstShape = svg.querySelector('path, polygon, rect, ellipse, line, circle, polyline');
    if(firstShape) {
        const color = firstShape.getAttribute('stroke');
        if(color && color !== 'none') {
            if(document.getElementById('drawColor')) document.getElementById('drawColor').value = color;
        } else if(firstShape.getAttribute('fill') && firstShape.getAttribute('fill') !== 'none') {
            if(document.getElementById('drawColor')) document.getElementById('drawColor').value = firstShape.getAttribute('fill');
        }
        
        const w = firstShape.getAttribute('stroke-width');
        if(w && document.getElementById('drawWidth')) {
            document.getElementById('drawWidth').value = parseFloat(w);
            if(document.getElementById('drawWidthVal')) document.getElementById('drawWidthVal').textContent = parseFloat(w);
        }
        
        const op = firstShape.getAttribute('stroke-opacity') || firstShape.getAttribute('fill-opacity');
        if(op && document.getElementById('drawOpacity')) {
            document.getElementById('drawOpacity').value = Math.round(parseFloat(op) * 100);
            if(document.getElementById('drawOpacityVal')) document.getElementById('drawOpacityVal').textContent = Math.round(parseFloat(op) * 100) + '%';
        }
    }
};

window.updateSelectedDraw = function() {
    if(!window.selectedEl || !window.selectedEl.classList.contains('editable-draw')) return;
    const el = window.selectedEl;
    const svg = el.querySelector('svg');
    if(!svg) return;
    
    const color = document.getElementById('drawColor').value;
    const w = parseFloat(document.getElementById('drawWidth').value);
    const op = parseFloat(document.getElementById('drawOpacity').value) / 100;
    
    const shapes = svg.querySelectorAll('path, polygon, rect, ellipse, line, circle, polyline');
    shapes.forEach(shape => {
        if(shape.hasAttribute('stroke') && shape.getAttribute('stroke') !== 'none') {
            shape.setAttribute('stroke', color);
            shape.setAttribute('stroke-width', w);
            shape.setAttribute('stroke-opacity', op);
        }
        if(shape.hasAttribute('fill') && shape.getAttribute('fill') !== 'none') {
            shape.setAttribute('fill', color);
            shape.setAttribute('fill-opacity', op);
        }
    });
};

window.showVertexHandles = function(el) {
    if (!el) return;
    
    // YENİ: Eski (stale) container'ları her halükarda tamamen temizle
    const oldContainers = el.querySelectorAll('.vertex-handles-container');
    if (oldContainers) oldContainers.forEach(c => c.remove());
    el.dataset.hasHandles = 'false';
    
    if (el.classList.contains('added-icon') || el.classList.contains('callout-wrap') || el.classList.contains('svg-callout')) return;
    const svg = el.querySelector('svg');
    if (!svg) return;
    const polygon = svg.querySelector('polygon');
    const lineEl = svg.querySelector('line');
    let shape = svg.querySelector('ellipse, path, line, polyline, rect');
    if(!shape && polygon) shape = polygon;
    
    // YENÃ„Â° EKLENEN FONKSÃ„Â°YON: Ã…Âeklin (ÃƒÂ¶zellikle ÃƒÂ§okgenin) sÃ„Â±nÃ„Â±rlarÃ„Â±nÃ„Â± yeniden hesapla
    function recalculateShapeBounds(el) {
        const svg = el.querySelector('svg');
        const polygon = svg.querySelector('polygon');
        const lineEl = svg.querySelector('line');
        const shape = svg.querySelector('ellipse, path, line, polyline, rect') || polygon;
        
        let pObj = null;
        if (typeof drawPaths !== 'undefined') pObj = drawPaths.find(p => p.el === el);
        
        const strokeW = pObj ? parseFloat(pObj.width) : (shape ? (parseFloat(shape.getAttribute('stroke-width')) || 4) : 4);
        const glow = pObj ? parseFloat(pObj.glow || 0) : 0;
        const padding = strokeW * 10 + glow + 30;
        
        let pts = [];
        if (polygon && el.dataset.polygonPoints) {
            pts = JSON.parse(el.dataset.polygonPoints);
        } else if (lineEl) {
            pts = [
                {x: parseFloat(lineEl.getAttribute('x1')), y: parseFloat(lineEl.getAttribute('y1'))},
                {x: parseFloat(lineEl.getAttribute('x2')), y: parseFloat(lineEl.getAttribute('y2'))}
            ];
        }
        if (pts.length === 0) return;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        pts.forEach(pt => {
            if (pt.x < minX) minX = pt.x;
            if (pt.y < minY) minY = pt.y;
            if (pt.x > maxX) maxX = pt.x;
            if (pt.y > maxY) maxY = pt.y;
        });
        
        const shiftX = padding - minX;
        const shiftY = padding - minY;
        
        const newW = (maxX - minX) + padding * 2;
        const newH = (maxY - minY) + padding * 2;
        
        let bL = parseFloat(el.dataset.baseLeft) || 0;
        let bT = parseFloat(el.dataset.baseTop) || 0;
        
        let newBL = bL - shiftX;
        let newBT = bT - shiftY;
        
        const newPts = pts.map(pt => ({
            x: pt.x + shiftX,
            y: pt.y + shiftY
        }));
        
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.setAttribute('viewBox', `0 0 ${newW} ${newH}`);
        
        let oldBW = parseFloat(el.dataset.baseWidth) || 1;
        let tScale = parseFloat(el.style.width) / oldBW;
        if (isNaN(tScale) || tScale <= 0) tScale = 1;

        el.dataset.baseLeft = newBL;
        el.dataset.baseTop = newBT;
        el.dataset.baseWidth = newW;
        el.dataset.baseHeight = newH;
        
        el.style.width = (newW * tScale) + 'px';
        el.style.height = (newH * tScale) + 'px';
        el.style.left = (parseFloat(el.style.left) - shiftX * tScale) + 'px';
        el.style.top = (parseFloat(el.style.top) - shiftY * tScale) + 'px';
        
        const cx = newW / 2;
        const cy = newH / 2;
        
        if (polygon) {
            polygon.setAttribute('points', newPts.map(p => `${p.x},${p.y}`).join(' '));
            el.dataset.polygonPoints = JSON.stringify(newPts);
            
            // FIX: SVG içindeki circle'ları da yeni shifted (kaydırılmış) koordinatlarla güncelle!
            const circles = svg.querySelectorAll('circle');
            circles.forEach((c, idx) => {
                if (newPts[idx]) {
                    c.setAttribute('cx', newPts[idx].x);
                    c.setAttribute('cy', newPts[idx].y);
                }
            });

            if(pObj) {
                pObj.points = newPts.map(pt => ({
                    x: pt.x + newBL,
                    y: pt.y + newBT
                }));
                if (pObj.type === 'rect') pObj.type = 'polygon';
            }

        } else if (lineEl) {
            const newX1 = newPts[0].x;
            const newY1 = newPts[0].y;
            const newX2 = newPts[1].x;
            const newY2 = newPts[1].y;
            lineEl.setAttribute('x1', newX1);
            lineEl.setAttribute('y1', newY1);
            lineEl.setAttribute('x2', newX2);
            lineEl.setAttribute('y2', newY2);
            if(pObj) { 
                pObj.x1 = newX1 + newBL; 
                pObj.y1 = newY1 + newBT; 
                pObj.x2 = newX2 + newBL; 
                pObj.y2 = newY2 + newBT; 
            }

        }

        
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        
        if (window.hideVertexHandles) {
            const container = el.querySelector('.vertex-handles-container');
            if (container) {
                container.remove();
                delete el.dataset.hasHandles;
                setTimeout(() => {
                    if (window.showVertexHandles) window.showVertexHandles(el);
                }, 10);
            }
        }
    }
    
    let baseW = parseFloat(el.dataset.baseWidth) || el.offsetWidth;
    let baseH = parseFloat(el.dataset.baseHeight) || el.offsetHeight;
    let points = [];
    
    if (polygon) {
        if (el.dataset.polygonPoints) {
            points = JSON.parse(el.dataset.polygonPoints);
        } else {
            const ptsStr = polygon.getAttribute('points');
            if (ptsStr) {
                points = ptsStr.split(' ').map(p => {
                    const [x,y] = p.split(',').map(Number);
                    return {x,y};
                });
                el.dataset.polygonPoints = JSON.stringify(points);
            }
        }
    } else if (lineEl) {
        points = [
            {x: parseFloat(lineEl.getAttribute('x1')), y: parseFloat(lineEl.getAttribute('y1'))},
            {x: parseFloat(lineEl.getAttribute('x2')), y: parseFloat(lineEl.getAttribute('y2'))}
        ];
    }
    
    if (points.length === 0 && !shape) return;
    
    const container = document.createElement('div');
    container.className = 'vertex-handles-container';
    container.style.position = 'absolute';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none'; 
    container.style.zIndex = '9999';
    
    if (lineEl) {
        const h1 = createHandle(points[0], (nx, ny) => {
            lineEl.setAttribute('x1', nx);
            lineEl.setAttribute('y1', ny);
            let pObj = null;
            if (typeof drawPaths !== 'undefined') pObj = drawPaths.find(p => p.el === el);
            if (pObj) {
                let baseLeft = parseFloat(el.dataset.baseLeft) || 0;
                let baseTop = parseFloat(el.dataset.baseTop) || 0;
                pObj.x1 = nx + baseLeft;
                pObj.y1 = ny + baseTop;
            }
        }, baseW, baseH);
        
        const h2 = createHandle(points[1], (nx, ny) => {
            lineEl.setAttribute('x2', nx);
            lineEl.setAttribute('y2', ny);
            let pObj = null;
            if (typeof drawPaths !== 'undefined') pObj = drawPaths.find(p => p.el === el);
            if (pObj) {
                let baseLeft = parseFloat(el.dataset.baseLeft) || 0;
                let baseTop = parseFloat(el.dataset.baseTop) || 0;
                pObj.x2 = nx + baseLeft;
                pObj.y2 = ny + baseTop;
            }
        }, baseW, baseH);
        
        container.appendChild(h1);
        container.appendChild(h2);
    } else if (polygon) {
        points.forEach((pt, i) => {
            const handle = createHandle(pt, (nx, ny) => {
                points[i] = {x: nx, y: ny};
                polygon.setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' '));
                el.dataset.polygonPoints = JSON.stringify(points);
                
                try {
                    const circles = el.querySelectorAll('circle');
                    // Geriye dönük uyumluluk veya ekstra circle'lar varsa sadece points kadarını güncelle
                    for (let cIdx = 0; cIdx < points.length; cIdx++) {
                        if (circles[cIdx]) {
                            circles[cIdx].setAttribute('cx', points[cIdx].x);
                            circles[cIdx].setAttribute('cy', points[cIdx].y);
                        }
                    }
                } catch(e) {}
                
                let pObj = null;
                if (typeof drawPaths !== 'undefined') pObj = drawPaths.find(p => p.el === el);
                if (pObj) {
                    let baseLeft = parseFloat(el.dataset.baseLeft) || 0;
                    let baseTop = parseFloat(el.dataset.baseTop) || 0;
                    let absolutePoints = points.map(p => ({ x: p.x + baseLeft, y: p.y + baseTop }));
                    pObj.points = absolutePoints;
                }
            }, baseW, baseH);
            container.appendChild(handle);
        });
    }

    function createHandle(pt, onUpdate, bW, bH) {
        const handle = document.createElement('div');
        handle.className = 'vertex-handle';
        handle.style.position = 'absolute';
        handle.style.left = (pt.x / bW * 100) + '%';
        handle.style.top = (pt.y / bH * 100) + '%';
        handle.style.width = '30px';
        handle.style.height = '30px';
        handle.style.transform = 'translate(-50%, -50%)';
        handle.style.background = 'transparent';
        handle.style.borderRadius = '50%';
        handle.style.cursor = 'default';
        handle.style.pointerEvents = 'auto';
        
        const visual = document.createElement('div');
        visual.style.position = 'absolute';
        visual.style.left = '50%';
        visual.style.top = '50%';
        visual.style.transform = 'translate(-50%, -50%)';
        visual.style.width = '12px';
        visual.style.height = '12px';
        visual.style.background = '#fff';
        visual.style.border = '2px solid #3b82f6';
        visual.style.borderRadius = '50%';
        visual.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
        visual.style.pointerEvents = 'none';
        handle.appendChild(visual);
        
        function handleDown(e) {
            if (e.type === 'mousedown' || e.type === 'touchstart') { e.preventDefault(); e.stopPropagation(); }
            const evt = e.touches ? e.touches[0] : e;
            const startX = evt.clientX;
            const startY = evt.clientY;
            const startPtX = pt.x;
            const startPtY = pt.y;
            
            const rect = el.getBoundingClientRect();
            
            // FIX #3: Read current base width and height to prevent stale values after shape recalculation
            const currentBW = parseFloat(el.dataset.baseWidth) || bW;
            const currentBH = parseFloat(el.dataset.baseHeight) || bH;
            
            // FIX #1: The getBoundingClientRect already includes the parent transform's scale factor.
            // Using it directly with current base width gives the true real-time visual scale.
            const scaleX = rect.width / currentBW;
            const scaleY = rect.height / currentBH;
            
            function onMove(me) {
                const meEvt = me.touches ? me.touches[0] : me;
                const dx = (meEvt.clientX - startX) / scaleX;
                const dy = (meEvt.clientY - startY) / scaleY;
                
                // Element dönmüşse mouse delta'sını element-local koordinatına çevir
                let localDx = dx;
                let localDy = dy;
                const rotDeg = parseFloat(el.dataset.rotation) || 0;
                if (rotDeg !== 0) {
                    const rotRad = rotDeg * Math.PI / 180;
                    const cos = Math.cos(rotRad);
                    const sin = Math.sin(rotRad);
                    // FIX #2: Convert global mouse delta back to local unrotated space (Inverse Rotation)
                    localDx = dx * cos + dy * sin;
                    localDy = -dx * sin + dy * cos;
                }
                
                let newX = startPtX + localDx;
                let newY = startPtY + localDy;
                if(window.getSnapGuides) {
                    let globalX = newX + (parseFloat(el.style.left) || 0);
                    let globalY = newY + (parseFloat(el.style.top) || 0);
                    const snap = window.getSnapGuides(globalX, globalY, el, true);
                    newX = snap.x - (parseFloat(el.style.left) || 0);
                    newY = snap.y - (parseFloat(el.style.top) || 0);
                    if(window.drawSnapGuides) window.drawSnapGuides(snap.guides);
                }
                handle.style.left = (newX / currentBW * 100) + '%';
                handle.style.top = (newY / currentBH * 100) + '%';
                onUpdate(newX, newY);
            }
            
            function onUp() {
                if(window.clearSnapGuides) window.clearSnapGuides();
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('touchend', onUp);
                
                recalculateShapeBounds(el);
                
                if (typeof createSVGFromPath === 'function') {
                    let pObj = null;
                    if (typeof drawPaths !== 'undefined') pObj = drawPaths.find(p => p.el === el);
                    if (pObj) {
                        const newIcon = createSVGFromPath(pObj);
                        if (newIcon) {
                            const oldSvg = el.querySelector('svg');
                            const newSvg = newIcon.querySelector('svg');
                            if (oldSvg && newSvg) {
                                oldSvg.replaceWith(newSvg);
                            } else if(newSvg) {
                                el.appendChild(newSvg);
                            }
                            
                            el.style.left = newIcon.style.left;
                            el.style.top = newIcon.style.top;
                            el.style.width = newIcon.style.width;
                            el.style.height = newIcon.style.height;
                            el.dataset.baseLeft = newIcon.dataset.baseLeft;
                            el.dataset.baseTop = newIcon.dataset.baseTop;
                            el.dataset.baseWidth = newIcon.dataset.baseWidth;
                            el.dataset.baseHeight = newIcon.dataset.baseHeight;
                            
                            if (newSvg) {
                                const poly = newSvg.querySelector('polygon');
                                if (poly) {
                                    const ptsStr = poly.getAttribute('points');
                                    if (ptsStr) {
                                        const newPoints = ptsStr.split(' ').map(p => {
                                            const [x,y] = p.split(',').map(Number);
                                            return {x,y};
                                        });
                                        el.dataset.polygonPoints = JSON.stringify(newPoints);
                                    }
                                }
                            }
                            
                            if (newIcon.parentNode) {
                                newIcon.parentNode.removeChild(newIcon);
                            }
                        }
                    }
                }
                
                const isPolyOrLine = el.dataset.polygonPoints || (el.querySelector('svg') && el.querySelector('svg').querySelector('line, polyline'));
                if (typeof showVertexHandles === 'function' && isPolyOrLine) {
                    if (typeof hideVertexHandles === 'function') hideVertexHandles();
                    else {
                        const oldContainer = el.querySelector('.vertex-handles-container');
                        if (oldContainer) oldContainer.remove();
                        delete el.dataset.hasHandles;
                    }
                    showVertexHandles(el);
                }
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

    const rotHandle = document.createElement('div');
    rotHandle.style.position = 'absolute';
    rotHandle.style.left = '50%';
    rotHandle.style.top = '-30px';
    rotHandle.style.width = '30px';
    rotHandle.style.height = '30px';
    rotHandle.style.transform = 'translate(-50%, -50%)';
    rotHandle.style.background = 'transparent';
    rotHandle.style.borderRadius = '50%';
    rotHandle.style.cursor = 'grab';
    rotHandle.style.pointerEvents = 'auto';

    const rotVisual = document.createElement('div');
    rotVisual.style.position = 'absolute';
    rotVisual.style.left = '50%';
    rotVisual.style.top = '50%';
    rotVisual.style.transform = 'translate(-50%, -50%)';
    rotVisual.style.width = '16px';
    rotVisual.style.height = '16px';
    rotVisual.style.background = '#fff';
    rotVisual.style.border = '2px solid #10b981';
    rotVisual.style.borderRadius = '50%';
    rotVisual.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
    rotVisual.style.pointerEvents = 'none';
    rotHandle.appendChild(rotVisual);
    
    const rotLine = document.createElement('div');
    rotLine.style.position = 'absolute';
    rotLine.style.left = '50%';
    rotLine.style.top = '-22px';
    rotLine.style.width = '2px';
    rotLine.style.height = '22px';
    rotLine.style.transform = 'translateX(-50%)';
    rotLine.style.background = '#10b981';
    container.appendChild(rotLine);
    
    function rotHandleDown(e) {
        if (e.type === 'mousedown' || e.type === 'touchstart') { e.preventDefault(); e.stopPropagation(); }
        const evt = e.touches ? e.touches[0] : e;
        rotHandle.style.cursor = 'grabbing';
        
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let startAngle = Math.atan2(evt.clientY - centerY, evt.clientX - centerX);
        let prevAngle = el.dataset.rotation ? parseFloat(el.dataset.rotation) : 0;
        
        let initialPoints = [];
        let points = [];
        if (polygon && el.dataset.polygonPoints) {
            points = JSON.parse(el.dataset.polygonPoints);
            initialPoints = points.map(p => ({x: p.x, y: p.y}));
            startAngle = Math.atan2(evt.clientY - centerY, evt.clientX - centerX);
        }
        
        function onMove(me) {
            const meEvt = me.touches ? me.touches[0] : me;
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const currentAngleRad = Math.atan2(meEvt.clientY - centerY, meEvt.clientX - centerX);
            const diffRad = currentAngleRad - startAngle;

            // Points matematiksel olarak dönüyor (el div dönmüyor!)
            const bW = parseFloat(el.dataset.baseWidth) || el.offsetWidth;
            const bH = parseFloat(el.dataset.baseHeight) || el.offsetHeight;
            
            // Merkezi initialPoints ortalamasından hesapla (kümülatif ve sabit)
            let cx = bW / 2;
            let cy = bH / 2;
            if (initialPoints && initialPoints.length > 0) {
                let sumX = 0, sumY = 0;
                initialPoints.forEach(p => { sumX += p.x; sumY += p.y; });
                cx = sumX / initialPoints.length;
                cy = sumY / initialPoints.length;
            }
            
            const cos = Math.cos(diffRad);
            const sin = Math.sin(diffRad);

            if (initialPoints && initialPoints.length > 0) {
                const newPoints = initialPoints.map(pt => {
                    const dx = pt.x - cx;
                    const dy = pt.y - cy;
                    return {
                        x: cx + dx * cos - dy * sin,
                        y: cy + dx * sin + dy * cos
                    };
                });
                
                el.dataset.polygonPoints = JSON.stringify(newPoints);
                
                // SVG polygon güncelle
                const polygon = el.querySelector('svg polygon');
                if (polygon) {
                    polygon.setAttribute('points', newPoints.map(p => `${p.x},${p.y}`).join(' '));
                    
                    // SVG içindeki circle'ları (showVertices noktalarını) da güncelle
                    const circles = el.querySelectorAll('svg circle');
                    circles.forEach((c, idx) => {
                        if (newPoints[idx]) {
                            c.setAttribute('cx', newPoints[idx].x);
                            c.setAttribute('cy', newPoints[idx].y);
                        }
                    });
                }
                
                // Vertex handle'ları güncelle
                const handles = el.querySelectorAll('.vertex-handle');
                newPoints.forEach((pt, i) => {
                    if (handles[i]) {
                        handles[i].style.left = (pt.x / bW * 100) + '%';
                        handles[i].style.top = (pt.y / bH * 100) + '%';
                    }
                });
            } else {
                const diffDeg = diffRad * (180 / Math.PI);
                let newRotation = prevAngle + diffDeg;
                newRotation = newRotation % 360;
                if (newRotation > 180) newRotation -= 360;
                else if (newRotation < -180) newRotation += 360;
                newRotation = Math.round(newRotation);
                
                el.dataset.rotation = newRotation;
                el.style.transform = `rotate(${newRotation}deg)`;
                
                if (typeof selectedEl !== 'undefined' && selectedEl === el) {
                    const rotSlider = document.getElementById('elRotate');
                    if (rotSlider) rotSlider.value = newRotation;
                    const rotVal = document.getElementById('elRotateVal');
                    if (rotVal) rotVal.textContent = newRotation + '°';
                }
            }
            // startAngle BURADA GÜNCELLENMİYOR, kümülatif açı (initial duruma göre) kullanılıyor.
        }
        function onUp() {
            // mouseup/touchend listener'ları temizle
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onUp);
            
            recalculateShapeBounds(el);
            
            // Handle refresh (kopya oluşmasın)
            el.dataset.hasHandles = 'false';
            const oldContainer = el.querySelector('.vertex-handles-container');
            if (oldContainer) oldContainer.remove();
            if (typeof showVertexHandles === 'function') {
                showVertexHandles(el);
            }
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchmove', onMove, {passive: false});
        document.addEventListener('touchend', onUp);
    }
    rotHandle.addEventListener('mousedown', rotHandleDown);
    rotHandle.addEventListener('touchstart', rotHandleDown, {passive: false});
    container.appendChild(rotHandle);
    
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'text-handle text-resize-handle';
    resizeHandle.title = 'Boyutlandır';
    resizeHandle.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg>';
    container.appendChild(resizeHandle);
    
    el.appendChild(container);
    el.dataset.hasHandles = 'true';
};

window.recalculateShapeBounds = function(el) {
        const svg = el.querySelector('svg');
        const polygon = svg.querySelector('polygon');
        const lineEl = svg.querySelector('line');
        const shape = svg.querySelector('ellipse, path, line, polyline, rect') || polygon;
        
        let pObj = null;
        if (typeof drawPaths !== 'undefined') pObj = drawPaths.find(p => p.el === el);
        
        const strokeW = pObj ? parseFloat(pObj.width) : (shape ? (parseFloat(shape.getAttribute('stroke-width')) || 4) : 4);
        const glow = pObj ? parseFloat(pObj.glow || 0) : 0;
        const padding = strokeW * 10 + glow + 30;
        
        let pts = [];
        if (polygon && el.dataset.polygonPoints) {
            pts = JSON.parse(el.dataset.polygonPoints);
        } else if (lineEl) {
            pts = [
                {x: parseFloat(lineEl.getAttribute('x1')), y: parseFloat(lineEl.getAttribute('y1'))},
                {x: parseFloat(lineEl.getAttribute('x2')), y: parseFloat(lineEl.getAttribute('y2'))}
            ];
        }
        if (pts.length === 0) return;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        pts.forEach(pt => {
            if (pt.x < minX) minX = pt.x;
            if (pt.y < minY) minY = pt.y;
            if (pt.x > maxX) maxX = pt.x;
            if (pt.y > maxY) maxY = pt.y;
        });
        
        const shiftX = padding - minX;
        const shiftY = padding - minY;
        
        const newW = (maxX - minX) + padding * 2;
        const newH = (maxY - minY) + padding * 2;
        
        let bL = parseFloat(el.dataset.baseLeft) || 0;
        let bT = parseFloat(el.dataset.baseTop) || 0;
        
        let newBL = bL - shiftX;
        let newBT = bT - shiftY;
        
        const newPts = pts.map(pt => ({
            x: pt.x + shiftX,
            y: pt.y + shiftY
        }));
        
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.setAttribute('viewBox', `0 0 ${newW} ${newH}`);
        
        let oldBW = parseFloat(el.dataset.baseWidth) || 1;
        let tScale = parseFloat(el.style.width) / oldBW;
        if (isNaN(tScale) || tScale <= 0) tScale = 1;

        el.dataset.baseLeft = newBL;
        el.dataset.baseTop = newBT;
        el.dataset.baseWidth = newW;
        el.dataset.baseHeight = newH;
        
        el.style.width = (newW * tScale) + 'px';
        el.style.height = (newH * tScale) + 'px';
        el.style.left = (parseFloat(el.style.left) - shiftX * tScale) + 'px';
        el.style.top = (parseFloat(el.style.top) - shiftY * tScale) + 'px';
        
        const cx = newW / 2;
        const cy = newH / 2;
        
        if (polygon) {
            polygon.setAttribute('points', newPts.map(p => `${p.x},${p.y}`).join(' '));
            el.dataset.polygonPoints = JSON.stringify(newPts);
            
            // FIX: SVG içindeki circle'ları da yeni shifted (kaydırılmış) koordinatlarla güncelle!
            const circles = svg.querySelectorAll('circle');
            circles.forEach((c, idx) => {
                if (newPts[idx]) {
                    c.setAttribute('cx', newPts[idx].x);
                    c.setAttribute('cy', newPts[idx].y);
                }
            });

            if(pObj) {
                pObj.points = newPts.map(pt => ({
                    x: pt.x + newBL,
                    y: pt.y + newBT
                }));
                if (pObj.type === 'rect') pObj.type = 'polygon';
            }

        } else if (lineEl) {
            const newX1 = newPts[0].x;
            const newY1 = newPts[0].y;
            const newX2 = newPts[1].x;
            const newY2 = newPts[1].y;
            lineEl.setAttribute('x1', newX1);
            lineEl.setAttribute('y1', newY1);
            lineEl.setAttribute('x2', newX2);
            lineEl.setAttribute('y2', newY2);
            if(pObj) { 
                pObj.x1 = newX1 + newBL; 
                pObj.y1 = newY1 + newBT; 
                pObj.x2 = newX2 + newBL; 
                pObj.y2 = newY2 + newBT; 
            }

        }

        
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        
        if (window.hideVertexHandles) {
            const container = el.querySelector('.vertex-handles-container');
            if (container) {
                container.remove();
                delete el.dataset.hasHandles;
                setTimeout(() => {
                    if (window.showVertexHandles) window.showVertexHandles(el);
                }, 10);
            }
        }
};





    const style = document.createElement('style');
    style.innerHTML = `
        .editable-draw { pointer-events: none !important; }
        .editable-draw.el-selected { pointer-events: auto !important; }
        .editable-draw svg { pointer-events: none !important; }
        .editable-draw svg path, 
        .editable-draw svg polygon, 
        .editable-draw svg rect, 
        .editable-draw svg ellipse, 
        .editable-draw svg line, 
        .editable-draw svg circle, 
        .editable-draw svg polyline,
        .editable-draw svg g {
            pointer-events: all !important;
            cursor: pointer;
        }
    `;
    if (document.head) document.head.appendChild(style);
    else document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));

    if(document.getElementById('drawColor')) document.getElementById('drawColor').addEventListener('input', updateSelectedDraw);
    if(document.getElementById('drawWidth')) document.getElementById('drawWidth').addEventListener('input', updateSelectedDraw);
    if(document.getElementById('drawOpacity')) document.getElementById('drawOpacity').addEventListener('input', updateSelectedDraw);
window.hideVertexHandles = function() {
    document.querySelectorAll('.vertex-handles-container').forEach(c => {
        if(c.parentElement) c.parentElement.dataset.hasHandles = 'false';
        c.remove();
    });
};


