/**
 * ============================================
 * EXPORT & IMPORT MODULE
 * modules/export.js
 * ============================================
 * 
 * Bağımlılıklar:
 * - config.js
 * - core/drag.js
 * 
 * Kullanılan yerler:
 * - main.js
 */

function switchPreviewFormat(){
    const formatName=$('previewFormat').value;
    const format=EXPORT_FORMATS[formatName];
    if(!format)return;

    const oldW = parseInt(canvasEl.style.width) || 1920;
    const oldH = parseInt(canvasEl.style.height) || 1080;
    const newW = format.w;
    const newH = format.h;

    canvasEl.style.width=format.w+'px';
    canvasEl.style.height=format.h+'px';
    drawCanvas.width=format.w;
    drawCanvas.height=format.h;
    drawCanvas.style.width=format.w+'px';
    drawCanvas.style.height=format.h+'px';

    // Saber canvas resize
    if (window.SaberEngine && typeof SaberEngine.resize === 'function') {
        SaberEngine.resize(format.w, format.h);
    }

    // Scale custom draggable items (Callouts, Texts, Icons) to maintain relative position
    if (oldW && oldH && newW && newH && (oldW !== newW || oldH !== newH)) {
        const scaleX = newW / oldW;
        const scaleY = newH / oldH;
        
        // Find custom elements wrapper classes
        const customItems = document.querySelectorAll('#canvas-container .draggable, #canvas-container .callout-wrap');
        customItems.forEach(el => {
            if (el.style.left) el.style.left = (parseFloat(el.style.left) * scaleX) + 'px';
            if (el.style.top) el.style.top = (parseFloat(el.style.top) * scaleY) + 'px';
        });
    }

    resizeCanvas();
    redrawAll();
    if(window.SaberEngine && typeof window.SaberEngine.resize === 'function') window.SaberEngine.resize(format.w, format.h);

    // Standart rozet/fiyat/detay katmanları yalnızca 1920x1080'de göster
    var isBase = (format.w===1920 && format.h===1080);
    var hasStandardTemplate = (typeof activeLayout !== 'undefined' && activeLayout !== '');
    var vis = (hasStandardTemplate && !(typeof isCanvaMode !== 'undefined' && isCanvaMode)) ? '' : 'hidden';
    if(typeof elBadge !== 'undefined' && elBadge) elBadge.style.visibility = vis;
    if(typeof elPrice !== 'undefined' && elPrice) elPrice.style.visibility = vis;
    if(typeof elDetails !== 'undefined' && elDetails) elDetails.style.visibility = vis;
    if(typeof elLogo !== 'undefined' && elLogo) elLogo.style.visibility = vis;
    var _iL = document.getElementById('infoLineText');
    if(_iL) _iL.style.visibility = vis;

    setTimeout(refreshActiveCanvaTemplate, 50);
}

function buildExportFormats(){
    const sel1=$('exportFormat'),sel2=$('previewFormat');
    if(!sel1||!sel2)return;
    sel1.innerHTML='';
    sel2.innerHTML='';
    Object.keys(EXPORT_FORMATS).forEach(name=>{
        const f=EXPORT_FORMATS[name];
        const label=f.icon+' '+name+' — '+f.w+'x'+f.h;
        const opt1=document.createElement('option');
        opt1.value=name;
        opt1.textContent=label;
        sel1.appendChild(opt1);
        const opt2=document.createElement('option');
        opt2.value=name;
        opt2.textContent=label;
        sel2.appendChild(opt2);
    });
}


function drawMasterPhotoManually(ctx, el, masterImg, outputScale, canvasRect, actualElement = null) {
    if(!actualElement) actualElement = el; // Fallback
    const rect = actualElement.getBoundingClientRect();
    const x = (rect.left - canvasRect.left) * outputScale;
    const y = (rect.top - canvasRect.top) * outputScale;
    const w = rect.width * outputScale;
    const h = rect.height * outputScale;

    // Parse border-radius
    const style = window.getComputedStyle(actualElement);
    let br = style.borderRadius;
    let radius = 0;
    if (br && br.indexOf('px') !== -1) {
        radius = parseFloat(br) * outputScale;
    }

    ctx.save();
    ctx.beginPath();
    if (radius > 0) {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
    } else {
        ctx.rect(x, y, w, h);
    }
    ctx.closePath();
    ctx.clip();

    let drawW, drawH, drawX, drawY;

    if (el.classList.contains('photo-inner-zoom')) {
        // Handle photo-zoom.js math
        const parent = actualElement;
        const s = parseFloat(parent.dataset.zpScale) || 1;
        const pX = parseFloat(parent.dataset.zpX) || 0;
        const pY = parseFloat(parent.dataset.zpY) || 0;
        
        let sX = 50, sY = 50;
        const xCtrl = document.getElementById('photoXCtrl');
        const yCtrl = document.getElementById('photoYCtrl');
        if (xCtrl) sX = parseFloat(xCtrl.value) || 50;
        if (yCtrl) sY = parseFloat(yCtrl.value) || 50;

        const imgRatio = masterImg.width / masterImg.height;
        const boxRatio = w / h;
        
        let coverW, coverH;
        if (imgRatio > boxRatio) {
            coverH = h;
            coverW = masterImg.width * (h / masterImg.height);
        } else {
            coverW = w;
            coverH = masterImg.height * (w / masterImg.width);
        }

        const offsetX_percent = (w - coverW) * (sX / 100);
        const offsetY_percent = (h - coverH) * (sY / 100);
        
        const unscaledX = x + offsetX_percent + (pX * outputScale);
        const unscaledY = y + offsetY_percent + (pY * outputScale);

        const cx = x + w/2;
        const cy = y + h/2;

        drawW = coverW * s;
        drawH = coverH * s;
        drawX = cx + (unscaledX - cx) * s;
        drawY = cy + (unscaledY - cy) * s;

    } else {
        let bgSize = el.style.backgroundSize;
        let bgPos = el.style.backgroundPosition;
        
        if (bgSize && bgSize.indexOf('px') !== -1 && bgPos && bgPos.indexOf('px') !== -1 && bgSize.indexOf('cover') === -1) {
            // Pixel based positioning (user dragged or zoomed)
            const sizeParts = bgSize.split(' ');
            const posParts = bgPos.split(' ');
            
            const cssW = parseFloat(sizeParts[0]);
            const cssH = parseFloat(sizeParts[1] || sizeParts[0]);
            const cssX = parseFloat(posParts[0]);
            const cssY = parseFloat(posParts[1] || posParts[0]);
            
            drawW = cssW * outputScale;
            drawH = cssH * outputScale;
            drawX = x + (cssX * outputScale);
            drawY = y + (cssY * outputScale);
        } else {
            // Fallback to "cover" and "center center"
            const imgRatio = masterImg.width / masterImg.height;
            const boxRatio = w / h;
            
            if (imgRatio > boxRatio) {
                drawH = h;
                drawW = masterImg.width * (h / masterImg.height);
                drawX = x + (w - drawW) / 2;
                drawY = y;
            } else {
                drawW = w;
                drawH = masterImg.height * (w / masterImg.width);
                drawX = x;
                drawY = y + (h - drawH) / 2;
            }
        }
    }
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const computedFilter = window.getComputedStyle(actualElement).filter;
    if (computedFilter && computedFilter !== 'none') {
        ctx.filter = computedFilter;
    }
    ctx.drawImage(masterImg, drawX, drawY, drawW, drawH);
    ctx.filter = 'none'; // reset
    ctx.restore();
}

async function saveImage(){
    if(typeof deselectAll === 'function') deselectAll(); else document.querySelectorAll('.el-selected').forEach(e=>e.classList.remove('el-selected'));
    const wz=drawCanvas.style.zIndex,wp=drawCanvas.style.pointerEvents;
    drawCanvas.style.zIndex='7';
    drawCanvas.style.pointerEvents='none';
    const formatName=$('exportFormat')?$('exportFormat').value:'16:9 Full HD';
    const format=EXPORT_FORMATS[formatName]||{w:1920,h:1080};
    const fitMode=$('exportFitMode')?$('exportFitMode').value:'cover';
    const bgColor=$('exportBgColor')?$('exportBgColor').value:'#ffffff';
    let outputScale = 1.5;
    const scaleVal1 = $('exportScale')?$('exportScale').value:'1.5';

    let safeMasterImage = (typeof uploadedImgUrl !== 'undefined' ? uploadedImgUrl : null) || (typeof masterImageBase64 !== 'undefined' ? masterImageBase64 : null);
    if (!safeMasterImage) {
        const pLayer = document.getElementById('photo-layer');
        if (pLayer && pLayer.style.backgroundImage && pLayer.style.backgroundImage !== 'none') {
            safeMasterImage = pLayer.style.backgroundImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
        }
    }

    if (scaleVal1 === 'original' && safeMasterImage) {
        outputScale = 1; // Temporary sync value, async will fix it below
    } else {
        outputScale = parseFloat(scaleVal1) || 1.5;
    }
    const currentW=parseInt(canvasEl.style.width)||1920;
    const currentH=parseInt(canvasEl.style.height)||1080;
      if (scaleVal1 === 'original' && safeMasterImage) {
          const tempImg = new Image();
          await new Promise(r => { tempImg.onload = r; tempImg.onerror = r; tempImg.src = safeMasterImage; });
          if (tempImg.width > 0) {
              outputScale = Math.min(tempImg.width / currentW, tempImg.height / currentH);
          }
      }
    
    // Geçişi tamamen kapat
    canvasEl.style.transition='none';
    canvasEl.style.transform='none';
    
    // html2canvas offset/shift bug fix:
    // Ekrandaki ortalama (margin/flex) nedeniyle html2canvas resmi kaydırarak (offset ile) çekiyor.
    // Bunu engellemek için capture anında tuvali sol üste sabitliyoruz.
    const overlay = document.createElement('div');
    overlay.id = 'download-overlay-mask';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = '#0f172a';
    overlay.style.zIndex = '9999999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.color = '#fbbf24';
    overlay.style.fontSize = '24px';
    overlay.style.fontWeight = 'bold';
    overlay.style.fontFamily = 'sans-serif';
    overlay.style.flexDirection = 'column';
    overlay.style.gap = '15px';
    overlay.innerHTML = '<div style="width: 50px; height: 50px; border: 5px solid #fbbf24; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div><div>Görsel Hazırlanıyor...</div><style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>';
    document.body.appendChild(overlay);
    setTimeout(async () => { const o = document.getElementById('download-overlay-mask'); if(o) o.remove(); }, 5000);

    const oldPosition = canvasEl.style.position;
    const oldLeft = canvasEl.style.left;
    const oldTop = canvasEl.style.top;
    const oldMargin = canvasEl.style.margin;
    
    canvasEl.style.position = 'fixed';
    canvasEl.style.left = '0px';
    canvasEl.style.top = '0px';
    canvasEl.style.margin = '0px';
    
    setTimeout(async () => {


        const __allEls = canvasEl.querySelectorAll('*');
        const __snapshots = [];
        __allEls.forEach(el => {
            const cs = el.style;
            const computed = window.getComputedStyle(el);
            if (computed.boxShadow && computed.boxShadow !== 'none') {
                __snapshots.push({ el: el, shadow: cs.getPropertyValue('box-shadow') });
                cs.setProperty('box-shadow', 'none', 'important');
            }
        });

        if (window.SaberEngine && typeof window.SaberEngine.updateTextSaberPositions === "function") window.SaberEngine.updateTextSaberPositions();
        
        
        // DUAL-LAYER SWAP LOGIC
        
        // DUAL-LAYER MANUAL DRAW LOGIC
        const swapTargets = canvasEl.querySelectorAll('#photo-layer, .canva-bg, .photo-panel, .photo-inner-zoom');
        const originalStyles = new Map();
        let masterImgElement = null;
        

          if (safeMasterImage && (outputScale > 1.5 || scaleVal1 === 'original')) {
            // Preload master image
            masterImgElement = new Image();
            const loadPromise = new Promise(r => {
                masterImgElement.onload = r;
                masterImgElement.onerror = r;
            });
            masterImgElement.src = safeMasterImage;
            await loadPromise;
            
            originalStyles.set(canvasEl, { bg: canvasEl.style.backgroundImage, bgColor: canvasEl.style.backgroundColor });
              canvasEl.style.backgroundColor = 'transparent';
              
              swapTargets.forEach(el => {
                const bg = el.style.backgroundImage;
                if (bg && bg !== 'none' && bg !== '') {
                    originalStyles.set(el, {
                        bg: bg,
                        bgColor: el.style.backgroundColor
                    });
                    el.style.setProperty('background-image', 'none', 'important');
                    el.style.setProperty('background-color', 'transparent', 'important');
                }
            });
        }


  html2canvas(canvasEl,{width:currentW,height:currentH,scale:outputScale,useCORS:true,allowTaint:true,imageTimeout:0,letterRendering:true,logging:false,backgroundColor:null,ignoreElements:el=>(el.classList&&el.classList.contains('el-selected'))||el.tagName==='CANVAS'||el.tagName==='canvas'}).then(async sourceCanvas=>{
            
            
            
            // RESTORE DUAL-LAYER SWAP
            originalStyles.forEach((styles, el) => {
                el.style.setProperty('background-image', styles.bg);
                if (styles.bgColor) el.style.setProperty('background-color', styles.bgColor);
                else el.style.removeProperty('background-color');
            });



            const targetW = Math.round(currentW * outputScale);
            const targetH = Math.round(currentH * outputScale);

            // RESTORE DOM STATE EARLY SO REDRAW LOGIC READS CORRECT MEASUREMENTS
            __snapshots.forEach(snap => {
                if (snap.shadow) snap.el.style.setProperty('box-shadow', snap.shadow, 'important');
                else snap.el.style.removeProperty('box-shadow');
            });
            canvasEl.style.position = oldPosition;
            canvasEl.style.left = oldLeft;
            canvasEl.style.top = oldTop;
            canvasEl.style.margin = oldMargin;
            canvasEl.style.transition = 'transform 0.2s';
            if (typeof resizeCanvas === 'function') resizeCanvas();

            // Draw the drawCanvas manually over the sourceCanvas to avoid html2canvas canvas bugs
            const sCtx = sourceCanvas.getContext('2d');
              sCtx.imageSmoothingEnabled=true;
              sCtx.imageSmoothingQuality='high';
            if (window.redrawAllToContext) {
                window.redrawAllToContext(sCtx, outputScale);
            } else {
                sCtx.drawImage(drawCanvas, 0, 0, targetW, targetH);
            }
            
            // Draw Saber Layer manually to ensure it's captured
            if (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') {
                const saberApp = window.SaberEngine.getApp();
                if (saberApp && saberApp.view) {
                    // Zorla senkron render yaparak arka plan silinmeden yakala (preserveDrawingBuffer gerektirmez)
                    if (saberApp.renderer && saberApp.stage) saberApp.renderer.render(saberApp.stage);
                    sCtx.drawImage(saberApp.view, 0, 0, targetW, targetH);
                }
            }

            const finalCanvas=document.createElement('canvas');
            finalCanvas.width=targetW;
            finalCanvas.height=targetH;
            const ctx=finalCanvas.getContext('2d');
            ctx.imageSmoothingEnabled=true;
            ctx.imageSmoothingQuality='high';
            
            if(bgColor && bgColor !== 'transparent') {
                ctx.fillStyle=bgColor;
                ctx.fillRect(0,0,targetW,targetH);
            }
            
            
            
            // sourceCanvas zaten outputScale ile natively büyütüldüğü için sündürme YOK.
            
              // DUAL-LAYER: Draw Master Photo manually at the bottom
              if (masterImgElement && masterImgElement.complete && masterImgElement.width > 0) {
                  const canvasRect = canvasEl.getBoundingClientRect();
                  if (originalStyles.size === 0) {
                      alert("DEBUG: originalStyles is EMPTY! The photo was not hidden by swapTargets!");
                  }
                  originalStyles.forEach((styles, el) => {
                      let actualElement = el;
                      if (el.classList.contains('photo-inner-zoom')) {
                          actualElement = el.parentElement;
                      }
                      drawMasterPhotoManually(ctx, el, masterImgElement, outputScale, canvasRect, actualElement);
                  });
              }

              // Birebir kopyaliyoruz.
              ctx.drawImage(sourceCanvas, 0, 0, targetW, targetH);

            
            const a=document.createElement('a');
            const fmtSafe=formatName.replace(/[^a-z0-9]/gi,'-').toLowerCase();
            const fileType = document.getElementById('exportFileType') ? document.getElementById('exportFileType').value : 'jpg';
            if (fileType === 'jpg') {
                a.download='emlak-'+fmtSafe+'-'+targetW+'x'+targetH+'.jpg';
                a.href=finalCanvas.toDataURL('image/jpeg', 1.0);
            } else {
                a.download='emlak-'+fmtSafe+'-'+targetW+'x'+targetH+'.png';
                a.href=finalCanvas.toDataURL('image/png', 1.0);
            }
            a.click();
            drawCanvas.style.zIndex=wz;
            drawCanvas.style.pointerEvents=wp;
            canvasEl.style.transition='transform 0.2s';
            resizeCanvas();
            setTimeout(async () => { const o = document.getElementById('download-overlay-mask'); if(o) o.remove(); }, 300);
                }).catch(err => {
            console.error("html2canvas hatası:", err);
            
            
            
            // --- CLEANUP RESTORE ON ERROR ---
            originalStyles.forEach((styles, el) => {
                el.style.setProperty('background-image', styles.bg);
                if (styles.bgColor) el.style.setProperty('background-color', styles.bgColor);
                else el.style.removeProperty('background-color');
            });

            __snapshots
.forEach(snap => {
                if (snap.shadow) snap.el.style.setProperty('box-shadow', snap.shadow, 'important');
                else snap.el.style.removeProperty('box-shadow');
            });

            canvasEl.style.position = oldPosition;
            canvasEl.style.left = oldLeft;
            canvasEl.style.top = oldTop;
            canvasEl.style.margin = oldMargin;
            // --- END CLEANUP ---

            alert("İndirme sırasında bir hata oluştu. Bazı harici görseller engelliyor olabilir.");
            drawCanvas.style.zIndex=wz;
            drawCanvas.style.pointerEvents=wp;
            canvasEl.style.transition='transform 0.2s';
            resizeCanvas();
            setTimeout(() => { const o = document.getElementById('download-overlay-mask'); if(o) o.remove(); }, 300);
        });
    }, 50);
}

function renderBatchList(){
    const l=$('batchFileList');
    l.innerHTML='';
    batchFiles.forEach((f,i)=>{
        const d=document.createElement('div');
        d.className='batch-file-item';
        d.innerHTML='<span>'+(i+1)+'. '+f.name+'</span><span>'+(f.size/1024).toFixed(0)+'KB</span>';
        l.appendChild(d);
    });
}

function clearBatchFiles(){
    batchFiles=[];
    $('batchInput').value='';
    renderBatchList();
    $('batchProgress').style.display='none';
}

async function startBatchExport(){
    if(!batchFiles.length){alert('Dosya ekleyin!');return}
    $('batchProgress').style.display='block';
    if(drawMode!=='off')setDrawMode('off');
    const formatName=$('exportFormat').value;
    const format=EXPORT_FORMATS[formatName]||{w:1920,h:1080};
    const fitMode=$('exportFitMode').value;
    const bgColor=$('exportBgColor').value;
    let outputScale = 1.5;
    const scaleVal2 = $('exportScale').value;

    let safeMasterImage = (typeof uploadedImgUrl !== 'undefined' ? uploadedImgUrl : null) || (typeof masterImageBase64 !== 'undefined' ? masterImageBase64 : null);
    if (!safeMasterImage) {
        const pLayer = document.getElementById('photo-layer');
        if (pLayer && pLayer.style.backgroundImage && pLayer.style.backgroundImage !== 'none') {
            safeMasterImage = pLayer.style.backgroundImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
        }
    }

    if (scaleVal2 === 'original' && safeMasterImage) {
        outputScale = 1; // Temporary
    } else {
        outputScale = parseFloat(scaleVal2) || 1.5;
    }
    const currentW=parseInt(canvasEl.style.width)||1920;
    const currentH=parseInt(canvasEl.style.height)||1080;
    if (scaleVal2 === 'original' && safeMasterImage) {
          const tempImg = new Image();
          await new Promise(r => { tempImg.onload = r; tempImg.onerror = r; tempImg.src = safeMasterImage; });
          if (tempImg.width > 0) {
              outputScale = Math.min(tempImg.width / currentW, tempImg.height / currentH);
          }
      }
      for(let i=0;i<batchFiles.length;i++){
        $('batchStatus').textContent=batchFiles[i].name;
        $('batchPercent').textContent=Math.round(i/batchFiles.length*100)+'%';
        $('batchBar').style.width=Math.round(i/batchFiles.length*100)+'%';
        const url=await readFileUrl(batchFiles[i]);
        uploadedImgUrl=url; if(typeof trackImageSize==='function') trackImageSize(uploadedImgUrl);
        photoLayer.style.backgroundImage="url('"+url+"')";
        if(isCanvaMode && typeof refreshActiveCanvaTemplate === 'function') refreshActiveCanvaTemplate();
        else if(isCanvaMode) buildCanvaRender();
        await sleep(400);
        if(typeof deselectAll === 'function') deselectAll(); else document.querySelectorAll('.el-selected').forEach(e=>e.classList.remove('el-selected'));
        drawCanvas.style.zIndex='7';
        drawCanvas.style.pointerEvents='none';
        canvasEl.style.transition='none';
        canvasEl.style.transform='none';
        await new Promise(r => setTimeout(r, 50));
        
        let sourceCanvas;
        try {
            
        const __allEls = canvasEl.querySelectorAll('*');
        const __snapshots = [];
        __allEls.forEach(el => {
            const cs = el.style;
            const computed = window.getComputedStyle(el);
            if (computed.boxShadow && computed.boxShadow !== 'none') {
                __snapshots.push({ el: el, shadow: cs.getPropertyValue('box-shadow') });
                cs.setProperty('box-shadow', 'none', 'important');
            }
        });

        if (window.SaberEngine && typeof window.SaberEngine.updateTextSaberPositions === "function") window.SaberEngine.updateTextSaberPositions();
            const targetW = Math.round(currentW * outputScale);
            const targetH = Math.round(currentH * outputScale);
            
            
        // DUAL-LAYER SWAP LOGIC FOR BATCH
        
        // DUAL-LAYER MANUAL DRAW LOGIC FOR BATCH
        const swapTargetsBatch = canvasEl.querySelectorAll('#photo-layer, .canva-bg, .photo-panel, .photo-inner-zoom');
        const originalStylesBatch = new Map();
        let masterImgElementBatch = null;
        
        if (safeMasterImage && (outputScale > 1.5 || scaleVal2 === 'original')) {
            masterImgElementBatch = new Image();
            const loadPromiseBatch = new Promise(r => {
                masterImgElementBatch.onload = r;
                masterImgElementBatch.onerror = r;
            });
            masterImgElementBatch.src = safeMasterImage;
            await loadPromiseBatch;
            
            originalStylesBatch.set(canvasEl, { bg: canvasEl.style.backgroundImage, bgColor: canvasEl.style.backgroundColor });
              canvasEl.style.backgroundColor = 'transparent';
              
              swapTargetsBatch.forEach(el => {
                const bg = el.style.backgroundImage;
                if (bg && bg !== 'none' && bg !== '') {
                    originalStylesBatch.set(el, {
                        bg: bg,
                        bgColor: el.style.backgroundColor
                    });
                    el.style.setProperty('background-image', 'none', 'important');
                    el.style.setProperty('background-color', 'transparent', 'important');
                }
            });
        }


            sourceCanvas=await html2canvas(canvasEl,{width:currentW,height:currentH,scale:outputScale,useCORS:true,allowTaint:true,imageTimeout:0,letterRendering:true,logging:false,backgroundColor:null,ignoreElements:el=>(el.classList&&el.classList.contains('el-selected'))||el.tagName==='CANVAS'||el.tagName==='canvas'});
            
            
            
            // RESTORE DUAL-LAYER SWAP FOR BATCH
            originalStylesBatch.forEach((styles, el) => {
                el.style.setProperty('background-image', styles.bg);
                if (styles.bgColor) el.style.setProperty('background-color', styles.bgColor);
                else el.style.removeProperty('background-color');
            });



            // RESTORE DOM STATE EARLY SO REDRAW LOGIC READS CORRECT MEASUREMENTS
            canvasEl.style.position = oldPos;
            canvasEl.style.left = oldL;
            canvasEl.style.top = oldT;
            canvasEl.style.margin = oldM;
            canvasEl.style.transition = 'transform 0.2s';
            if (typeof resizeCanvas === 'function') resizeCanvas();

            const sCtx = sourceCanvas.getContext('2d');
              sCtx.imageSmoothingEnabled=true;
              sCtx.imageSmoothingQuality='high';
            if (window.redrawAllToContext) {
                window.redrawAllToContext(sCtx, outputScale);
            } else {
                sCtx.drawImage(drawCanvas, 0, 0, targetW, targetH);
            }
            
            if (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') {
                const saberApp = window.SaberEngine.getApp();
                if (saberApp && saberApp.view) {
                    if (saberApp.renderer && saberApp.stage) saberApp.renderer.render(saberApp.stage);
                    sCtx.drawImage(saberApp.view, 0, 0, targetW, targetH);
                }
            }
        } catch(err) {
            canvasEl.style.position = oldPos;
            canvasEl.style.left = oldL;
            canvasEl.style.top = oldT;
            canvasEl.style.margin = oldM;
            console.error(err);
            alert("Toplu çıkarma hatası (Resim " + (i+1) + ").");
            resizeCanvas();
            return;
        }

        const targetW=Math.round(format.w*outputScale);
        const targetH=Math.round(format.h*outputScale);
        const finalCanvas=document.createElement('canvas');
        finalCanvas.width=targetW;
        finalCanvas.height=targetH;
        const ctx=finalCanvas.getContext('2d');
        ctx.imageSmoothingEnabled=true;
        ctx.imageSmoothingQuality='high';
        
        if(bgColor && bgColor !== 'transparent') {
            ctx.fillStyle=bgColor;
            ctx.fillRect(0,0,targetW,targetH);
        }
        
        const pLayer = document.getElementById('photo-layer');
        let bgElement = pLayer;
        if (pLayer) {
            const innerZoom = pLayer.querySelector('.photo-inner-zoom');
            if (innerZoom && innerZoom.style.backgroundImage && innerZoom.style.backgroundImage !== 'none') {
                bgElement = innerZoom;
            }
        }
        
        if (bgElement && bgElement.style.backgroundImage && bgElement.style.backgroundImage !== 'none') {
            const imgUrl = bgElement.style.backgroundImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
            if (imgUrl && imgUrl.trim() !== '') {
                try {
                    const originalImg = new Image();
                    if (imgUrl.startsWith('http')) { originalImg.crossOrigin = 'anonymous'; }
                    await new Promise((resolve) => {
                        originalImg.onload = resolve;
                        originalImg.onerror = resolve;
                        originalImg.src = imgUrl;
                    });
                    if (originalImg.width > 0) {
                        drawMasterPhotoManually(ctx, bgElement, originalImg, outputScale, canvasEl.getBoundingClientRect(), pLayer);
                    }
                } catch(e) { console.error('Photo draw error:', e); }
            }
        }
        
        ctx.drawImage(sourceCanvas, 0, 0, targetW, targetH);
        
        const a=document.createElement('a');
        const fmtSafe=formatName.replace(/[^a-z0-9]/gi,'-').toLowerCase();
        a.download='emlak-'+batchFiles[i].name.replace(/\.[^/.]+$/,'')+'-'+fmtSafe+'.png';
        a.href=finalCanvas.toDataURL('image/png', 1.0);
        a.click();
        resizeCanvas();
        await sleep(200);
    }
    $('batchStatus').textContent='Tamamlandı!';
    $('batchPercent').textContent='100%';
    $('batchBar').style.width='100%';
}

function readFileUrl(f){
    return new Promise(r=>{
        const fr=new FileReader();
        fr.onload=e=>r(e.target.result);
        fr.readAsDataURL(f);
    });
}

async function shareImage(platform) {
    if(!window.html2canvas) return alert('html2canvas yklenmedi!');
    try {
        const c = await html2canvas(canvasEl, {
            useCORS: true,
            allowTaint: true,
            scale: 1, // just standard scale for sharing to be fast
            backgroundColor: null
        });
        
        c.toBlob(async (blob) => {
            if (!blob) {
                return alert('Resim oluturulamad!');
            }
            const file = new File([blob], 'emlak_tasarimi.jpg', { type: 'image/jpeg' });
            
            // Web Share API support check
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: 'Emlak Tasarm',
                        text: 'Yeni emlak tasarmma gz atn!',
                        files: [file]
                    });
                } catch (err) {
                    console.log('Share API iptal veya hata:', err);
                }
            } else {
                alert(platform.charAt(0).toUpperCase() + platform.slice(1) + ' iin dorudan paylama taraycnzda desteklenmiyor. Ltfen resmi indirip manuel paylan.');
            }
        }, 'image/jpeg', 0.9);
    } catch(err) {
        console.error(err);
        alert('Paylama hatas: ' + err.message);
    }
}

async function getBase64FromBlobUrl(blobUrl) {
    if(!blobUrl || !blobUrl.startsWith('blob:')) return blobUrl;
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => resolve('');
        img.src = blobUrl;
    });
}

async function getBase64FromCSSUrl(cssUrl) {
    if(!cssUrl || cssUrl === 'none') return '';
    const match = cssUrl.match(/url\(['"]?(.*?)['"]?\)/);
    if(match && match[1]) {
        return await getBase64FromBlobUrl(match[1]);
    }
    return '';
}

async function saveProject() {
    try {
        const state = {
            version: 1,
            currentMode, activeLayout, isCanvaMode, activeCanvaId,
            uploadedImgW, uploadedImgH,
            drawMode, drawPaths, extraFieldCounter, extraFieldsData,
            inputs: {},
            customElements: []
        };

        // Resimleri Base64'e çevir ki kalıcı olsun
        state.uploadedImgUrl = await getBase64FromBlobUrl(uploadedImgUrl);

        const logoUrl = typeof elLogo !== 'undefined' && elLogo && elLogo.style.backgroundImage !== 'none' 
            ? elLogo.style.backgroundImage 
            : '';
        state.logoImgUrl = await getBase64FromCSSUrl(logoUrl);

        // Tüm inputları tara
        document.querySelectorAll('input, select, textarea').forEach(el => {
            if(el.id && el.type !== 'file') {
                state.inputs[el.id] = (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value;
            }
        });

        // Tüm özel elemanları (ikonlar ve yazılar) kaydet
        document.querySelectorAll('#photo-layer .draggable').forEach(el => {
            if(['badge', 'price', 'details', 'logo_overlay'].includes(el.id)) return;
            state.customElements.push({
                id: el.id,
                className: el.className,
                innerHTML: el.innerHTML,
                style: el.getAttribute('style'),
                dataset: Object.assign({}, el.dataset)
            });
        });

        // JSON olarak indir
        const jsonString = JSON.stringify(state);
        const blob = new Blob([jsonString], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'emlak_proje.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch(err) {
        console.error("Save error:", err);
        alert("Proje kaydedilirken bir hata oluştu: " + err.message);
    }
}

function loadProject() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const state = JSON.parse(event.target.result);
                if(!state.version) throw new Error("Geçersiz proje dosyası");

                currentMode = state.currentMode || 'konut';
                activeLayout = typeof state.activeLayout !== 'undefined' ? state.activeLayout : 't1';
                isCanvaMode = !!state.isCanvaMode;
                activeCanvaId = state.activeCanvaId || '';
                if(isCanvaMode && !activeCanvaId) isCanvaMode = false;
                uploadedImgW = state.uploadedImgW || 1920;
                uploadedImgH = state.uploadedImgH || 1080;
                drawPaths = state.drawPaths || [];
                extraFieldCounter = state.extraFieldCounter || 0;
                
                // extraFieldsData is a const, we must mutate its properties
                const newExtra = state.extraFieldsData || {konut:[],arazi:[]};
                extraFieldsData.konut = newExtra.konut || [];
                extraFieldsData.arazi = newExtra.arazi || [];

                document.querySelectorAll('#photo-layer .draggable').forEach(el => {
                    if(['badge', 'price', 'details', 'logo_overlay'].includes(el.id)) return;
                    el.remove();
                });
                allIcons = [];

                if(state.inputs) {
                    Object.keys(state.inputs).forEach(id => {
                        const el = document.getElementById(id);
                        if(el && el.type !== 'file') {
                            if(el.type === 'checkbox' || el.type === 'radio') el.checked = state.inputs[id];
                            else el.value = state.inputs[id];
                        }
                    });
                }

                Object.keys(extraFieldsData).forEach(mode => {
                    const c = document.getElementById(mode+'ExtraFields');
                    if(c) {
                        c.innerHTML = '';
                        extraFieldsData[mode].forEach(id => {
                            const row = document.createElement('div');
                            row.className = 'extra-field-row';
                            row.id = 'row_'+id;
                            row.innerHTML = '<input type="text" id="lbl_'+id+'" placeholder="Başlık"><input type="text" id="val_'+id+'" placeholder="Değer"><button class="remove-field" onclick="removeExtraField(\''+id+'\',\''+mode+'\')">🗑️</button>';
                            c.appendChild(row);
                            document.getElementById('lbl_'+id).addEventListener('input', renderData);
                            document.getElementById('val_'+id).addEventListener('input', renderData);
                            
                            if(state.inputs && state.inputs['lbl_'+id]) document.getElementById('lbl_'+id).value = state.inputs['lbl_'+id];
                            if(state.inputs && state.inputs['val_'+id]) document.getElementById('val_'+id).value = state.inputs['val_'+id];
                        });
                    }
                });

                if(state.customElements) {
                    state.customElements.forEach(data => {
                        const el = document.createElement('div');
                        if(data.id) el.id = data.id;
                        el.className = data.className;
                        el.innerHTML = data.innerHTML;
                        if(data.style) el.setAttribute('style', data.style);
                        if(data.dataset) {
                            Object.keys(data.dataset).forEach(k => el.dataset[k] = data.dataset[k]);
                        }
                        const pl = document.getElementById('photo-layer');
                        if (pl) pl.appendChild(el);
                        makeDraggable(el);
                        if(el.classList.contains('icon-el')) {
                            allIcons.push(el);
                        }
                    });
                }

                uploadedImgUrl = state.uploadedImgUrl || '';
                const pl = document.getElementById('photo-layer');
                if(uploadedImgUrl) {
                    if(pl) pl.style.backgroundImage = "url('" + uploadedImgUrl + "')";
                    if(typeof trackImageSize === 'function') trackImageSize(uploadedImgUrl);
                } else {
                    if(pl) pl.style.backgroundImage = "none";
                }

                if(state.logoImgUrl && typeof elLogo !== 'undefined' && elLogo) {
                    elLogo.style.backgroundImage = "url('" + state.logoImgUrl + "')";
                    elLogo.src = state.logoImgUrl; 
                }

                if(typeof switchMode === 'function') switchMode(currentMode);
                
                if(isCanvaMode) {
                    if(typeof refreshActiveCanvaTemplate === 'function') refreshActiveCanvaTemplate();
                } else {
                    if(activeLayout) {
                        if(typeof setTemplate === 'function') setTemplate(activeLayout);
                    } else {
                        if(typeof clearAllTemplates === 'function') clearAllTemplates();
                        if(typeof elBadge !== 'undefined' && elBadge) elBadge.style.visibility='hidden';
                        if(typeof elPrice !== 'undefined' && elPrice) elPrice.style.visibility='hidden';
                        if(typeof elDetails !== 'undefined' && elDetails) elDetails.style.visibility='hidden';
                    }
                }

                if(typeof renderData === 'function') renderData();
                if(typeof redrawAll === 'function') redrawAll();
                if(typeof updateDrawHistory === 'function') updateDrawHistory();

                alert('Proje başarıyla yüklendi!');
            } catch(e) {
                console.error("Load error:", e);
                alert("Hata Detayı:\n" + e.message + "\n\nStack:\n" + (e.stack || '').split('\n').slice(0,3).join('\n'));
            }
        };
        reader.readAsText(file);
    };
    input.click();
}


