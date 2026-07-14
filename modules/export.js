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

async function saveImage(){
    document.querySelectorAll('.el-selected').forEach(e=>e.classList.remove('el-selected'));
    const wz=drawCanvas.style.zIndex,wp=drawCanvas.style.pointerEvents;
    drawCanvas.style.zIndex='7';
    drawCanvas.style.pointerEvents='none';
    const formatName=$('exportFormat')?$('exportFormat').value:'16:9 Full HD';
    const format=EXPORT_FORMATS[formatName]||{w:1920,h:1080};
    const fitMode=$('exportFitMode')?$('exportFitMode').value:'cover';
    const bgColor=$('exportBgColor')?$('exportBgColor').value:'#ffffff';
    const outputScale=parseFloat($('exportScale')?$('exportScale').value:'1.5');
    const currentW=parseInt(canvasEl.style.width)||1920;
    const currentH=parseInt(canvasEl.style.height)||1080;
    
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
    setTimeout(() => { const o = document.getElementById('download-overlay-mask'); if(o) o.remove(); }, 5000);

    const oldPosition = canvasEl.style.position;
    const oldLeft = canvasEl.style.left;
    const oldTop = canvasEl.style.top;
    const oldMargin = canvasEl.style.margin;
    
    canvasEl.style.position = 'fixed';
    canvasEl.style.left = '0px';
    canvasEl.style.top = '0px';
    canvasEl.style.margin = '0px';
    
    setTimeout(() => {


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
  html2canvas(canvasEl,{width:currentW,height:currentH,scale:1,useCORS:true,allowTaint:true,imageTimeout:0,letterRendering:true,logging:false,backgroundColor:null,ignoreElements:el=>(el.classList&&el.classList.contains('el-selected'))||el.tagName==='CANVAS'||el.tagName==='canvas'}).then(sourceCanvas=>{
            // Draw the drawCanvas manually over the sourceCanvas to avoid html2canvas canvas bugs
            const sCtx = sourceCanvas.getContext('2d');
              sCtx.imageSmoothingEnabled=true;
              sCtx.imageSmoothingQuality='high';
            sCtx.drawImage(drawCanvas, 0, 0, currentW, currentH);
            
            // Draw Saber Layer manually to ensure it's captured
            if (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') {
                const saberApp = window.SaberEngine.getApp();
                if (saberApp && saberApp.view) {
                    // Zorla senkron render yaparak arka plan silinmeden yakala (preserveDrawingBuffer gerektirmez)
                    if (saberApp.renderer && saberApp.stage) saberApp.renderer.render(saberApp.stage);
                    sCtx.drawImage(saberApp.view, 0, 0, currentW, currentH);
                }
            }
            
            // Restore position fixes
            
            __snapshots.forEach(snap => {
                if (snap.shadow) snap.el.style.setProperty('box-shadow', snap.shadow, 'important');
                else snap.el.style.removeProperty('box-shadow');
            });

            canvasEl.style.position = oldPosition;
            canvasEl.style.left = oldLeft;
            canvasEl.style.top = oldTop;
            canvasEl.style.margin = oldMargin;


            const targetW=Math.round(format.w*outputScale);
            const targetH=Math.round(format.h*outputScale);
            const finalCanvas=document.createElement('canvas');
            finalCanvas.width=targetW;
            finalCanvas.height=targetH;
            const ctx=finalCanvas.getContext('2d');
            ctx.imageSmoothingEnabled=true;
            ctx.imageSmoothingQuality='high';
            if(fitMode==='contain'){ctx.fillStyle=bgColor;ctx.fillRect(0,0,targetW,targetH)}
            if(fitMode==='stretch'){ctx.drawImage(sourceCanvas,0,0,targetW,targetH)}
            else if(fitMode==='cover'){
                const scale=Math.max(targetW/currentW,targetH/currentH);
                const sw=targetW/scale,sh=targetH/scale;
                const sx=(currentW-sw)/2,sy=(currentH-sh)/2;
                ctx.drawImage(sourceCanvas,sx,sy,sw,sh,0,0,targetW,targetH);
            }else{
                const scale=Math.min(targetW/currentW,targetH/currentH);
                const dw=currentW*scale,dh=currentH*scale;
                const dx=(targetW-dw)/2,dy=(targetH-dh)/2;
                ctx.drawImage(sourceCanvas,0,0,currentW,currentH,dx,dy,dw,dh);
            }
            const a=document.createElement('a');
            const fmtSafe=formatName.replace(/[^a-z0-9]/gi,'-').toLowerCase();
            a.download='emlak-'+fmtSafe+'-'+targetW+'x'+targetH+'.png';
            a.href=finalCanvas.toDataURL('image/png', 1.0);
            a.click();
            drawCanvas.style.zIndex=wz;
            drawCanvas.style.pointerEvents=wp;
            canvasEl.style.transition='transform 0.2s';
            resizeCanvas();
            setTimeout(() => { const o = document.getElementById('download-overlay-mask'); if(o) o.remove(); }, 300);
                }).catch(err => {
            console.error("html2canvas hatası:", err);
            
            // --- CLEANUP RESTORE ON ERROR ---
            
            __snapshots.forEach(snap => {
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
    const outputScale=parseFloat($('exportScale').value);
    const currentW=parseInt(canvasEl.style.width)||1920;
    const currentH=parseInt(canvasEl.style.height)||1080;
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
        document.querySelectorAll('.el-selected').forEach(e=>e.classList.remove('el-selected'));
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
            sourceCanvas=await html2canvas(canvasEl,{width:currentW,height:currentH,scale:1,useCORS:true,allowTaint:true,imageTimeout:0,letterRendering:true,logging:false,backgroundColor:null,ignoreElements:el=>(el.classList&&el.classList.contains('el-selected'))||el.tagName==='CANVAS'||el.tagName==='canvas'});
            const sCtx = sourceCanvas.getContext('2d');
              sCtx.imageSmoothingEnabled=true;
              sCtx.imageSmoothingQuality='high';
            sCtx.drawImage(drawCanvas, 0, 0, currentW, currentH);
            // Draw Saber Layer manually to ensure it's captured
            // Draw Saber Layer manually to ensure it's captured
            if (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') {
                const saberApp = window.SaberEngine.getApp();
                if (saberApp && saberApp.view) {
                    // Zorla senkron render yaparak arka plan silinmeden yakala (preserveDrawingBuffer gerektirmez)
                    if (saberApp.renderer && saberApp.stage) saberApp.renderer.render(saberApp.stage);
                    sCtx.drawImage(saberApp.view, 0, 0, currentW, currentH);
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
        
        canvasEl.style.position = oldPos;
        canvasEl.style.left = oldL;
        canvasEl.style.top = oldT;
        canvasEl.style.margin = oldM;

        const targetW=Math.round(format.w*outputScale);
        const targetH=Math.round(format.h*outputScale);
        const finalCanvas=document.createElement('canvas');
        finalCanvas.width=targetW;
        finalCanvas.height=targetH;
        const ctx=finalCanvas.getContext('2d');
            ctx.imageSmoothingEnabled=true;
            ctx.imageSmoothingQuality='high';
        if(fitMode==='contain'){ctx.fillStyle=bgColor;ctx.fillRect(0,0,targetW,targetH)}
        if(fitMode==='stretch')ctx.drawImage(sourceCanvas,0,0,targetW,targetH);
        else if(fitMode==='cover'){
            const scale=Math.max(targetW/currentW,targetH/currentH);
            const sw=targetW/scale,sh=targetH/scale;
            const sx=(currentW-sw)/2,sy=(currentH-sh)/2;
            ctx.drawImage(sourceCanvas,sx,sy,sw,sh,0,0,targetW,targetH);
        }else{
            const scale=Math.min(targetW/currentW,targetH/currentH);
            const dw=currentW*scale,dh=currentH*scale;
            const dx=(targetW-dw)/2,dy=(targetH-dh)/2;
            ctx.drawImage(sourceCanvas,0,0,currentW,currentH,dx,dy,dw,dh);
        }
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

