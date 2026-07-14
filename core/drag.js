/**
 * ============================================
 * DRAG & SELECT MODULE
 * core/drag.js
 * ============================================
 * 
 * Bağımlılıklar:
 * - core/utils.js
 * 
 * Kullanılan yerler:
 * - Tüm ui ve modüller
 */

function getActiveV4Element() {
    if (typeof isCanvaMode !== 'undefined' && isCanvaMode) {
        let p = document.querySelector('.photo-panel');
        if (p) return p;
    }
    return document.getElementById('photo-layer');
}

function getActivePhotoPanel() {
    if (typeof isCanvaMode !== 'undefined' && isCanvaMode) {
        let p = document.querySelector('.photo-panel');
        let renderLayer = document.getElementById('canva-render-layer');
        if (p && renderLayer) {
            let r1 = p.getBoundingClientRect();
            let r2 = renderLayer.getBoundingClientRect();
            if (r2.width > 0 && r2.height > 0) {
                let scaleX = r2.width / renderLayer.offsetWidth;
                let scaleY = r2.height / renderLayer.offsetHeight;
                
                let comp = window.getComputedStyle(p);
                let bL = parseFloat(comp.borderLeftWidth) || 0;
                let bT = parseFloat(comp.borderTopWidth) || 0;
                let bR = parseFloat(comp.borderRightWidth) || 0;
                let bB = parseFloat(comp.borderBottomWidth) || 0;
                
                let left = (r1.left - r2.left) / scaleX + bL;
                let top = (r1.top - r2.top) / scaleY + bT;
                let w = r1.width / scaleX - (bL + bR);
                let h = r1.height / scaleY - (bT + bB);
                
                return { w, h, left, top };
            }
        }
    }
    if (typeof getActiveV4Element === 'function') {
        const pl = getActiveV4Element();
        if(pl && pl.dataset.zpReady === '1') {
            return { w: pl.offsetWidth, h: pl.offsetHeight, left: pl.offsetLeft, top: pl.offsetTop };
        }
    }
    const photoEl = document.getElementById('photo-1');
    if(photoEl) {
        return { w: photoEl.offsetWidth, h: photoEl.offsetHeight, left: photoEl.offsetLeft, top: photoEl.offsetTop };
    }
    const photoLayer = document.getElementById('photo-layer');
    if(photoLayer && photoLayer.offsetWidth > 0) {
        return { w: photoLayer.offsetWidth, h: photoLayer.offsetHeight, left: photoLayer.offsetLeft, top: photoLayer.offsetTop };
    }
    return { w: 1920, h: 1080, left: 0, top: 0 };
}

function _getZoomTarget(target){
    var el = target;
    // İç eleman ise parent'a çık
    if(el && el.classList && el.classList.contains('photo-inner-zoom')) {
        el = el.parentElement;
    }
    if(!el || !el.classList) return null;
    
    // photo-panel VEYA photo-layer üzerinde çalışsın
    if(el.classList.contains('photo-panel') || el.id === 'photo-layer') {
        return el;
    }
    // Eğer tıklanan #photo-layer'ın içindeyse, onu döndür
    var photoLayer = el.closest && el.closest('#photo-layer');
    if(photoLayer) return photoLayer;
    
    return null;
}

function bindDrag(el){
    let dragging=false, resizing=false, sx, sy, il, it, iw, ih, moved=false, downTime=0;
    
    el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        if (e.clientX >= rect.right - 20 && e.clientY >= rect.bottom - 20) {
            el.style.cursor = 'se-resize';
        } else {
            el.style.cursor = dragging ? 'grabbing' : (el.dataset.editingText ? 'text' : 'move');
        }
    });

    function down(e){
        if(drawMode!=='off')return;
        if(el.contentEditable==='true')return;
        if(el.dataset.editingText)return;
        e.preventDefault();
        e.stopPropagation();
        moved=false;
        downTime=Date.now();
        
        const rect = el.getBoundingClientRect();
        const c = e.touches ? e.touches[0] : e;
        
        if (c.clientX >= rect.right - 20 && c.clientY >= rect.bottom - 20) {
            resizing = true;
            iw = el.offsetWidth;
            ih = el.offsetHeight;
            if (el.classList.contains('co-neon-block')) {
                el.dataset.startIconSize = el.dataset.coIconSize || 64;
                el.dataset.startTextSize = el.dataset.coTextSize || 14;
                el.dataset.startPadding = el.dataset.coPadding || 10;
                el.dataset.startRadius = el.dataset.coRadius || 12;
                el.dataset.startBoxSize = el.dataset.coBoxSize || 140;
            }
        } else {
            dragging = true;
            el.classList.add('dragging');
        }
        
        sx=c.clientX;
        sy=c.clientY;
        const cs=getComputedStyle(el);
        il=parseFloat(cs.left)||0;
        it=parseFloat(cs.top)||0;
    }
    function move(e){
        if(!dragging && !resizing)return;
        if(el.dataset.editingText){dragging=false;resizing=false;return}
        e.preventDefault();
        moved=true;
        const c=e.touches?e.touches[0]:e;
        
        if (resizing) {
            const dx = (c.clientX - sx) / scaleFactor;
            const dy = (c.clientY - sy) / scaleFactor;
            const newW = Math.max(20, iw + dx);
            const newH = Math.max(20, ih + dy);
            
            if (el.classList.contains('co-neon-block')) {
                const ratio = newW / iw;
                const newIconSize = Math.max(10, Math.round(parseFloat(el.dataset.startIconSize) * ratio));
                const newTextSize = Math.max(5, Math.round(parseFloat(el.dataset.startTextSize) * ratio));
                const newPadding = Math.round(parseFloat(el.dataset.startPadding) * ratio);
                const newRadius = Math.round(parseFloat(el.dataset.startRadius) * ratio);
                const newBoxSize = Math.max(50, Math.round(parseFloat(el.dataset.startBoxSize) * ratio));

                el.dataset.coIconSize = newIconSize;
                el.dataset.coTextSize = newTextSize;
                el.dataset.coPadding = newPadding;
                el.dataset.coRadius = newRadius;
                el.dataset.coBoxSize = newBoxSize;
                
                if (typeof renderCalloutFromDataset === 'function') {
                    renderCalloutFromDataset(el);
                }
                
                if (typeof selectedCalloutEl !== 'undefined' && selectedCalloutEl === el) {
                    const is = document.getElementById('coIconSize');
                    if (is) { is.value = newIconSize; document.getElementById('coIconSizeVal').textContent = newIconSize + 'px'; }
                    const ts = document.getElementById('coTextSize');
                    if (ts) { ts.value = newTextSize; document.getElementById('coTextSizeVal').textContent = newTextSize + 'px'; }
                    const rd = document.getElementById('coRadius');
                    if (rd) { rd.value = newRadius; document.getElementById('coRadiusVal').textContent = newRadius + 'px'; }
                    const pd = document.getElementById('coPadding');
                    if (pd) { pd.value = newPadding; document.getElementById('coPaddingVal').textContent = newPadding + 'px'; }
                }
            } else {
                el.style.width = newW + 'px';
                if (el.tagName !== 'IMG') {
                    el.style.height = newH + 'px';
                }
                
                if (typeof selectedEl !== 'undefined' && selectedEl === el) {
                    const wInput = document.getElementById('elWidth');
                    const wVal = document.getElementById('elWidthVal');
                    const hInput = document.getElementById('elHeight');
                    const hVal = document.getElementById('elHeightVal');
                    if(wInput) { wInput.value = newW; if(wVal) wVal.textContent = Math.round(newW) + 'px'; }
                    if(hInput && el.tagName !== 'IMG') { hInput.value = newH; if(hVal) hVal.textContent = Math.round(newH) + 'px'; }
                }
            }
        } else {
            el.style.left=(il+(c.clientX-sx)/scaleFactor)+'px';
            el.style.top=(it+(c.clientY-sy)/scaleFactor)+'px';
            el.style.bottom='auto';
            el.style.right='auto';
            const rot=el.dataset.rotation||0;
            el.style.transform='rotate('+rot+'deg)';
        }
    }
    function up(){
        if(!dragging && !resizing)return;
        dragging=false;
        resizing=false;
        el.classList.remove('dragging');
        const clickDuration=Date.now()-downTime;
        if(!moved && drawMode==='off' && clickDuration<200){
            setTimeout(()=>{
                if(!el.dataset.editingText && typeof selectElement === 'function'){
                    selectElement(el);
                }
            },220);
        } else if(!moved && drawMode==='off' && typeof selectElement === 'function'){
            selectElement(el);
        }
    }
    el.addEventListener('mousedown',down);
    el.addEventListener('touchstart',down,{passive:false});
    document.addEventListener('mousemove',move);
    document.addEventListener('touchmove',move,{passive:false});
    document.addEventListener('mouseup',up);
    document.addEventListener('touchend',up);
}

function selectElement(el){
    if(el && el.classList.contains('co-neon-block')) {
        if(typeof selectCalloutEl === 'function') selectCalloutEl(el);
        return;
    }
    deselectAll();
    selectedEl=el;
    el.classList.add('el-selected');
    $('noSelMsg').style.display='none';
    $('elSettings').style.display='block';
    $('elLabel').textContent=el.dataset.label||'Eleman';
    loadElSettings(el);
    loadElFont(el);
    switchTab('element');
}

function deselectAll(){
    document.querySelectorAll('.el-selected').forEach(e=>e.classList.remove('el-selected'));
    selectedEl=null;
    $('noSelMsg').style.display='block';
    $('elSettings').style.display='none';
}

function makeDraggable(el){
    // Use the exact same advanced logic for makeDraggable!
    bindDrag(el);
}

