/**
 * ============================================
 * PHOTO MODULE
 * modules/photo.js
 * ============================================
 * 
 * Bağımlılıklar:
 * - core/utils.js
 * - core/drag.js
 * 
 * Kullanılan yerler:
 * - main.js
 * - ui/element.js vb.
 */

function enablePhotoDrag(el){
    let dragging=false,startX,startY,startPX,startPY;
    function down(e){
        if(e.target.closest('.canvas-el')||e.target.closest('.draggable'))return;
        if(drawMode!=='off')return;
        e.preventDefault();
        dragging=true;
        el.classList.add('grabbing');
        const c=e.touches?e.touches[0]:e;
        startX=c.clientX;
        startY=c.clientY;
        startPX=parseFloat($('photoXCtrl').value);
        startPY=parseFloat($('photoYCtrl').value);
    }
    function move(e){
        if(!dragging)return;
        e.preventDefault();
        const c=e.touches?e.touches[0]:e;
        const zoom=parseFloat($('photoZoomCtrl').value);
        const sensitivity=100/Math.max(zoom-50,50);
        const dx=(c.clientX-startX)/scaleFactor*sensitivity/19.2;
        const dy=(c.clientY-startY)/scaleFactor*sensitivity/10.8;
        $('photoXCtrl').value=Math.max(0,Math.min(100,startPX-dx));
        $('photoYCtrl').value=Math.max(0,Math.min(100,startPY-dy));
        applyPhotoPos();
    }
    function up(){
        if(!dragging)return;
        dragging=false;
        el.classList.remove('grabbing');
    }
    el.addEventListener('mousedown',down);
    el.addEventListener('touchstart',down,{passive:false});
    document.addEventListener('mousemove',move);
    document.addEventListener('touchmove',move,{passive:false});
    document.addEventListener('mouseup',up);
    document.addEventListener('touchend',up);
}

function applyPhotoPos(){
    const zoom=parseFloat($('photoZoomCtrl').value);
    const x=parseFloat($('photoXCtrl').value);
    const y=parseFloat($('photoYCtrl').value);
    
    $('photoZoomVal').textContent=zoom+'%';
    $('photoXVal').textContent=x+'%';
    $('photoYVal').textContent=y+'%';
    
    // YENİ: Çizim kaymasını önlemek için matematiksel olarak birebir aynı piksel hesabı
    let pW = photoLayer.offsetWidth || 1920;
    let pH = photoLayer.offsetHeight || 1080;
    let imgW = typeof uploadedImgW !== 'undefined' ? uploadedImgW : 1920;
    let imgH = typeof uploadedImgH !== 'undefined' ? uploadedImgH : 1080;
    
    if (photoLayer.dataset.naturalW) {
        imgW = parseFloat(photoLayer.dataset.naturalW) || imgW;
        imgH = parseFloat(photoLayer.dataset.naturalH) || imgH;
    }
    
    let coverScale = Math.max(pW / imgW, pH / imgH);
    if (zoom !== 100) {
        coverScale = (pW * (zoom / 100)) / imgW;
    }
    
    let renderedW = imgW * coverScale;
    let renderedH = imgH * coverScale;
    
    let offsetX = pW / 2 - renderedW / 2;
    let offsetY = pH / 2 - renderedH / 2;
    
    if (renderedW > pW) {
        offsetX = (pW - renderedW) * (x / 100);
    }
    if (renderedH > pH) {
        offsetY = (pH - renderedH) * (y / 100);
    }
    
    const sizeStr = renderedW + 'px ' + renderedH + 'px';
    const posStr = offsetX + 'px ' + offsetY + 'px';
    
    photoLayer.style.backgroundSize=sizeStr;
    photoLayer.style.backgroundPosition=posStr;
    photoLayer.style.backgroundRepeat='no-repeat';
    document.querySelectorAll('.photo-panel').forEach(p=>{
        p.style.backgroundSize=sizeStr;
        p.style.backgroundPosition=posStr;
        p.style.backgroundRepeat='no-repeat';
    });
    if(typeof redrawAll === 'function') redrawAll();
}

function resetPhotoPos(){
    $('photoZoomCtrl').value=100;
    $('photoXCtrl').value=50;
    $('photoYCtrl').value=50;
    applyPhotoPos();
}

function applyPhotoFilters(){
    if(typeof isShowingBefore !== 'undefined' && isShowingBefore) { toggleBeforeAfter(); }
    const exp=+$('exposure').value,con=+$('contrast').value,sat=+$('saturate').value;
    const blur=+$('fblur').value,sep=+$('sepia').value,hue=+$('hueRotate').value;
    const gray=+$('grayscale').value,inv=+$('invertCtrl').value,temp=+$('tempCtrl').value;
    const tint=+$('tintCtrl').value,vib=+$('vibranceCtrl').value;
    const sharp=+$('sharpnessCtrl').value,clarity=+$('clarityCtrl').value,dehaze=+$('dehazeCtrl').value;
    let effectiveSat=sat+vib*0.5;
    let effectiveContrast=con+clarity*0.4+dehaze*0.3;
    let effectiveBrightness=exp+dehaze*0.15;
    let effectiveHue=hue+temp*0.3-tint*0.3;
    let filter='brightness('+effectiveBrightness+'%) contrast('+effectiveContrast+'%) saturate('+effectiveSat+'%) blur('+blur+'px) sepia('+sep+'%) hue-rotate('+effectiveHue+'deg) grayscale('+gray+'%) invert('+inv+'%)';
    if(sharp>0)filter+=' drop-shadow(0 0 0.5px rgba(0,0,0,'+(sharp/200)+'))';
    photoLayer.style.filter=filter;
    document.querySelectorAll('.photo-panel').forEach(p=>p.style.filter=filter);
    $('exposureVal').textContent=exp+'%';
    $('contrastVal').textContent=con+'%';
    $('saturateVal').textContent=sat+'%';
    $('fblurVal').textContent=blur+'px';
    $('sepiaVal').textContent=sep+'%';
    $('hueRotateVal').textContent=hue+'°';
    $('grayscaleVal').textContent=gray+'%';
    $('invertVal').textContent=inv+'%';
    $('tempVal').textContent=temp;
    $('tintVal').textContent=tint;
    $('vibranceVal').textContent=vib;
    $('sharpnessVal').textContent=sharp;
    $('clarityVal').textContent=clarity;
    $('dehazeVal').textContent=dehaze;
    const v=$('vignette').value;
    vignetteLayer.style.opacity=v/100;
    $('vignetteVal').textContent=v+'%';
}

function resetFilters(){
    Object.keys(FILTER_DEFAULTS).forEach(id=>{if($(id))$(id).value=FILTER_DEFAULTS[id]});
    document.querySelectorAll('.hsl-slider').forEach(s => {
        s.value = 0;
        const valSpan = document.getElementById('hsl_'+s.dataset.type+'_'+s.dataset.color+'Val');
        if(valSpan) valSpan.textContent = '0';
    });
    if(typeof processHSL === 'function') processHSL();
    applyPhotoFilters();
    if(typeof applyShadowHighlight === 'function') applyShadowHighlight();

}

function applyPreset(name){
    const p = PRESETS[name];
    if(!p) return;
    
    Object.keys(FILTER_DEFAULTS).forEach(id=>{if(document.getElementById(id))document.getElementById(id).value=FILTER_DEFAULTS[id]});
    Object.keys(p).forEach(k=>{if(document.getElementById(k))document.getElementById(k).value=p[k]});
    
    // CSS filtreleri (brightness/contrast/sat) anında uygula
    if(typeof applyPhotoFilters === 'function') applyPhotoFilters();
    // Piksel motoru (gölge/highlight) senkron çalıştır
    if(typeof processPixels === 'function') processPixels(true);
}

function _preparePhoto(el){
    if(el.dataset.zpReady === '1') return;
    el.dataset.zpReady = '1';
    el.dataset.zpScale = 1;
    el.dataset.zpX = 0;
    el.dataset.zpY = 0;
    
    // Photo panel'in overflow hidden olmalı
    el.style.overflow = 'hidden';
    
    // İç div oluştur (background bunun üstüne taşınacak)
    var inner = document.createElement('div');
    inner.className = 'photo-inner-zoom';
    inner.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background-image:' + el.style.backgroundImage + ';background-size:cover;background-position:center;background-repeat:no-repeat;transform-origin:center center;transition:none;pointer-events:none;';
    
    // Orijinal background'ı iç div'e taşı, dış div'den kaldır
    el.style.backgroundImage = 'none';
    el.appendChild(inner);
    
    console.log('✅ Foto hazırlandı:', el);
}

function _applyPhotoTransform(el){
    var inner = el.querySelector('.photo-inner-zoom');
    if(!inner) return;
    
    var s = parseFloat(el.dataset.zpScale) || 1;
    var x = parseFloat(el.dataset.zpX) || 0;
    var y = parseFloat(el.dataset.zpY) || 0;
    
    var sX = document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50;
    var sY = document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50;
    
    inner.style.backgroundPosition = 'calc(' + sX + '% + ' + x + 'px) calc(' + sY + '% + ' + y + 'px)';
    inner.style.transform = 'scale(' + s + ')';
}

