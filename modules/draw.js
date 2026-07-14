/**
 * ============================================
 * DRAW MODULE
 * modules/draw.js
 * ============================================
 * 
 * Bağımlılıklar:
 * - config.js
 * 
 * Kullanılan yerler:
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
        
        if (p.hasSaber && p.saberRef && window.SaberEngine && SaberEngine.setSaberTransform) {
            SaberEngine.setSaberTransform(p.saberRef, tParams.scale, tParams.dx, tParams.dy);
        }
    } else {
        if (p.hasSaber && p.saberRef && window.SaberEngine && SaberEngine.setSaberTransform) {
            SaberEngine.setSaberTransform(p.saberRef, 1, 0, 0);
        }
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
                const angle = Math.atan2(p.y2 - p.y1, p.x2 - p.x1);
                const headLen = 20;
                drawCtx.beginPath();
                drawCtx.moveTo(p.x2, p.y2);
                drawCtx.lineTo(p.x2 - headLen * Math.cos(angle - Math.PI/6), p.y2 - headLen * Math.sin(angle - Math.PI/6));
                drawCtx.moveTo(p.x2, p.y2);
                drawCtx.lineTo(p.x2 - headLen * Math.cos(angle + Math.PI/6), p.y2 - headLen * Math.sin(angle + Math.PI/6));
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
    removeTempPolygonSaber();
    if(mode!=='polygon'&&polygonBuilding){polygonPoints=[];polygonBuilding=false;redrawAll()}
    drawMode=mode;
    ['dmOff','dmFree','dmLine','dmArrow','dmRect','dmCircle','dmPoly'].forEach(id=>{if($(id))$(id).classList.remove('active')});
    const map={off:'dmOff',free:'dmFree',line:'dmLine',arrow:'dmArrow',rect:'dmRect',circle:'dmCircle',polygon:'dmPoly'};
    if($(map[mode]))$(map[mode]).classList.add('active');
    $('polyInfo').style.display=mode==='polygon'?'block':'none';
    if(mode==='off'){
        drawCanvas.style.pointerEvents='none';
        // z-index handled by CSS (#draw-layer z:5, below canva-render-layer z:10)
        $('drawIndicator').classList.remove('show');
        $('canvasHint').textContent='💡 Tek tık: Seç | Çift tık: Yazıyı Düzenle | Sürükle: Taşı';
    }else{
        drawCanvas.style.pointerEvents='auto';
        // z-index handled by CSS (#draw-layer z:5, below canva-render-layer z:10)
        drawCanvas.style.cursor='crosshair';
        $('drawIndicator').classList.add('show');
        $('canvasHint').textContent=mode==='polygon'?'🔷 Tıklayarak köşe ekle, çift tıkla kapat':'✏️ ÇİZİM AKTİF';
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
        showVertices:$('polyShowVertices')?$('polyShowVertices').checked:true
    };
}

function getDash(s,w){
    if(s==='dashed')return[w*4,w*2];
    if(s==='dotted')return[w,w*2];
    return[];
}

function canvasXY(e){
    const r=drawCanvas.getBoundingClientRect();
    return{x:(e.clientX-r.left)/scaleFactor,y:(e.clientY-r.top)/scaleFactor};
}

function dStart(e){
    if(drawMode==='off')return;
    e.preventDefault();
    e.stopPropagation();
    const p=canvasXY(e.touches?e.touches[0]:e);
    if(drawMode==='polygon'){
        const now=Date.now();
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
    e.preventDefault();
    e.stopPropagation();
    const p=canvasXY(e.touches?e.touches[0]:e);
    if(drawMode==='polygon'){
        if(polygonBuilding&&polygonPoints.length>0){redrawAll();drawTempPolygon(p)}
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
            if(drawMode==='arrow')arrowHead(drawCtx,drawStartX,drawStartY,p.x,p.y,s.width,s.color,s.opacity);
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
    if(drawMode==='off'||drawMode==='polygon')return;
    if(!isDrawing)return;
    isDrawing=false;
    const s=getDS();
    let ep;
    if(e.changedTouches)ep=canvasXY(e.changedTouches[0]);
    else if(e.clientX!==undefined)ep=canvasXY(e);
    else ep={x:drawStartX,y:drawStartY};
    
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
    
    if(drawMode==='free'&&currentPath.length>1)drawPaths.push(Object.assign({type:'free',points:currentPath.slice(),photoRef},s));
    else if(drawMode==='line'||drawMode==='arrow')drawPaths.push(Object.assign({type:drawMode,x1:drawStartX,y1:drawStartY,x2:ep.x,y2:ep.y,photoRef},s));
    else if(drawMode==='rect')drawPaths.push(Object.assign({type:'rect',x1:drawStartX,y1:drawStartY,x2:ep.x,y2:ep.y,photoRef},s));
    else if(drawMode==='circle')drawPaths.push(Object.assign({type:'circle',x1:drawStartX,y1:drawStartY,x2:ep.x,y2:ep.y,photoRef},s));
    currentPath=[];
    redrawAll();
    updateDrawHistory();

    // ═══ ⚡ SABER HOOK ═══
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
    removeTempPolygonSaber();
    const s=getDS();
    const showV = document.getElementById('polyShowVertices') ? document.getElementById('polyShowVertices').checked : true;
        const z = parseInt(document.getElementById('photoZoomCtrl') ? document.getElementById('photoZoomCtrl').value : 100);
    const px = parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50);
    const py = parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50);
    const panel = getActivePhotoPanel();
    drawPaths.push(Object.assign({type:'polygon', closed:true, points:polygonPoints.slice(), showVertices: showV, photoRef: (function(){
    const pnl = getActivePhotoPanel();
    const pl = getActiveV4Element();
    if (pl && pl.dataset.zpReady === '1') {
        return { v4: true, z: parseFloat(pl.dataset.zpScale) || 1, px: parseFloat(pl.dataset.zpX) || 0, py: parseFloat(pl.dataset.zpY) || 0, panelW: pnl.w, panelH: pnl.h, panelL: pnl.left, panelT: pnl.top, sliderX: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), sliderY: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50) };
    } else {
        return { v4: false, z: parseInt(document.getElementById('photoZoomCtrl') ? document.getElementById('photoZoomCtrl').value : 100), px: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), py: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50), panelW: pnl.w, panelH: pnl.h, panelL: pnl.left, panelT: pnl.top, sliderX: parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50), sliderY: parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50) , extraZ: (document.getElementById('photo-layer') && document.getElementById('photo-layer').dataset.zpReady === '1') ? (parseFloat(document.getElementById('photo-layer').dataset.zpScale) || 1) : 1, extraPx: (document.getElementById('photo-layer') && document.getElementById('photo-layer').dataset.zpReady === '1') ? (parseFloat(document.getElementById('photo-layer').dataset.zpX) || 0) : 0, extraPy: (document.getElementById('photo-layer') && document.getElementById('photo-layer').dataset.zpReady === '1') ? (parseFloat(document.getElementById('photo-layer').dataset.zpY) || 0) : 0
          };
    }
})()},s));
    
    // ═══ ⚡ SABER HOOK ═══
    if (window.saberState && window.saberState.active && window.applySaberToPath) {
        window.applySaberToPath(drawPaths.length - 1, JSON.parse(JSON.stringify(window.saberState)));
    }
    
    polygonPoints=[];
    polygonBuilding=false;
    redrawAll();
    updateDrawHistory();
}

function arrowHead(ctx,x1,y1,x2,y2,w,color,op){
    const a=Math.atan2(y2-y1,x2-x1),h=w*5;
    ctx.save();
    ctx.setLineDash([]);
    ctx.globalAlpha=op||1;
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.moveTo(x2,y2);
    ctx.lineTo(x2-h*Math.cos(a-Math.PI/6),y2-h*Math.sin(a-Math.PI/6));
    ctx.lineTo(x2-h*Math.cos(a+Math.PI/6),y2-h*Math.sin(a+Math.PI/6));
    ctx.closePath();
    ctx.fill();
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

function undoLastDraw(){drawPaths.pop();redrawAll();updateDrawHistory();cancelDrawEdit()}

function clearAllDrawings(){removeTempPolygonSaber();drawPaths=[];polygonPoints=[];polygonBuilding=false;redrawAll();updateDrawHistory();cancelDrawEdit()}

function updateDrawHistory(){
    const h=$('drawHistory');
    if(!drawPaths.length){h.innerHTML='<div style="text-align:center;color:#475569;font-size:10px;padding:8px">Henüz çizim yok</div>';return}
    h.innerHTML='';
    const names={free:'✏️ Serbest',line:'📏 Çizgi',arrow:'➡️ Ok',rect:'⬜ Kare',circle:'⭕ Daire',polygon:'🔷 Çokgen'};
    drawPaths.forEach((p,i)=>{
        const item=document.createElement('div');
        item.className='draw-history-item';
        const saberBtn = p.hasSaber ? `<button class="dh-btn dh-saber" onclick="startDrawEdit(${i})" title="Saber Ayarları">⚡</button>` : `<button class="dh-btn dh-saber-add" onclick="addSaberToPath(${i})" title="Saber Ekle">✨</button>`;
        item.innerHTML='<span><span class="dh-color" style="background:'+p.color+'"></span>'+(names[p.type]||p.type)+' #'+(i+1)+(p.fillOpacity>0?' 🎨':'')+'</span><span>'+saberBtn+'<button class="dh-btn dh-edit" onclick="startDrawEdit('+i+')">✏️</button><button class="dh-btn dh-del" onclick="deleteDrawItem('+i+')">✕</button></span>';
        h.appendChild(item);
    });
}

function deleteDrawItem(i){
    // Saber varsa onu da temizle
    const path = drawPaths[i];
    if (path && path.saberRef && window.SaberEngine) {
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
        } catch(e) { console.warn('Saber temizleme hatası:', e); }
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
    originalDrawState = JSON.parse(JSON.stringify(backup));
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
    const names={free:'Serbest',line:'Çizgi',arrow:'Ok',rect:'Kare',circle:'Daire',polygon:'Çokgen'};
    if($('drawEditLabel'))$('drawEditLabel').textContent='#'+(i+1)+' '+(names[p.type]||'');
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
    
    redrawAll();
};

function cancelDrawEdit(){
    if (originalDrawState && editingDrawIndex >= 0 && editingDrawIndex < drawPaths.length) {
        const currentPath = drawPaths[editingDrawIndex];
        const oldRef = currentPath.saberRef;
        
        // Revert to backup
        drawPaths[editingDrawIndex] = JSON.parse(JSON.stringify(originalDrawState));
        // Restore reference for cleaning up
        drawPaths[editingDrawIndex].saberRef = oldRef;
        
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

