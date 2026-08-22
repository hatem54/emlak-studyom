/**
 * ============================================
 * CALLOUT MODULE
 * modules/callout.js
 * ============================================
 * 
 * --- MOBIL DOKUNMATIK DESTEGI ICIN TOUCH-TO-MOUSE PROXY ---
 * (Otomatik enjekte edildi)
 */
// Touch handling is managed per element and via core/drag.js
/**
 * 

 * Bağımlılıklar:
 * - config.js
 * - core/drag.js
 * 
 * Kullanılan yerler:
 * - main.js
 */

function renderCalloutPanel(){
    const acc = document.getElementById('calloutAccordion');
    if (!acc) return;
    acc.innerHTML = '';
    acc.style.background = '#0d1b2e';
    acc.style.border = '1px solid rgba(255,255,255,0.1)';
    acc.style.padding = '5px';
    
    if(typeof NEON_CALLOUTS !== 'undefined') {
        const header = document.createElement('div');
        header.className = 'accordion-header';
        header.style.cssText = 'padding:10px; background:#1a2744; color:#93c5fd; cursor:pointer; border-radius:5px; margin-bottom:5px; font-weight:bold; display:flex; justify-content:space-between; align-items:center; transition:background 0.2s; border: 1px solid rgba(147,197,253,0.2);';
        header.innerHTML = `<span>✨ Mavi Neon İkonlar</span><span class="icon-toggle">▼</span>`;
        
        const body = document.createElement('div');
        body.className = 'accordion-body';
        body.style.cssText = 'display:none; padding:10px; background:#0d1b2e; border-radius:5px; margin-bottom:10px; grid-template-columns:repeat(3, 1fr); gap:8px; border: 1px solid rgba(255,255,255,0.05);';
        
        NEON_CALLOUTS.forEach((n, idx) => {
            const card = document.createElement('div');
            card.style.cssText = `
                background: linear-gradient(145deg, #0d1b2e, #1a2744);
                border: 1px solid rgba(96,165,250,0.25);
                border-radius: 10px;
                padding: 10px 4px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
                overflow: hidden;
            `;

            const lines = n.text.split('\n');
            card.innerHTML = `
                <div style="width:36px; height:36px; display:flex; align-items:center; justify-content:center;
                    background: rgba(96,165,250,0.08); border: 1.5px solid rgba(96,165,250,0.4);
                    border-radius:50%; position:relative;">
                    <i class="${n.icon}" style="font-size:16px; color:#93c5fd;
                        filter: drop-shadow(0 0 6px rgba(147,197,253,0.8));"></i>
                </div>
                <div style="text-align:center; font-size:8px; font-weight:800; color:#e2e8f0;
                    letter-spacing:0.5px; line-height:1.2; text-transform:uppercase;">
                    ${lines.join('<br>')}
                </div>
            `;
            card.addEventListener('mouseenter', () => {
                card.style.background = 'linear-gradient(145deg, #162035, #1e3160)';
                card.style.borderColor = 'rgba(96,165,250,0.6)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.background = 'linear-gradient(145deg, #0d1b2e, #1a2744)';
                card.style.borderColor = 'rgba(96,165,250,0.25)';
            });
            card.onclick = () => addNeonToCanvas(n);
            body.appendChild(card);
        });
        
        header.onclick = () => {
            const isOpen = body.style.display === 'grid';
            document.querySelectorAll('.accordion-body').forEach(b => b.style.display = 'none');
            document.querySelectorAll('.accordion-header .icon-toggle').forEach(i => i.textContent = '▼');
            if(!isOpen) {
                body.style.display = 'grid';
                header.querySelector('.icon-toggle').textContent = '▲';
            }
        };
        
        acc.appendChild(header);
        acc.appendChild(body);
    }
    
    if(typeof CALLOUT_LIBRARY === 'undefined') return;

    Object.keys(CALLOUT_LIBRARY).forEach(catKey => {
        const cat = CALLOUT_LIBRARY[catKey];
        
        const header = document.createElement('div');
        header.className = 'accordion-header';
        header.style.cssText = 'padding:10px; background:#162035; color:#f8fafc; cursor:pointer; border-radius:5px; margin-bottom:5px; font-weight:bold; display:flex; justify-content:space-between; align-items:center; transition:background 0.2s; border: 1px solid rgba(255,255,255,0.05);';
        header.innerHTML = `<span>${cat.title}</span><span class="icon-toggle">▼</span>`;
        
        const body = document.createElement('div');
        body.className = 'accordion-body';
        body.style.cssText = 'display:none; padding:10px; background:#0d1b2e; border-radius:5px; margin-bottom:10px; grid-template-columns:1fr; gap:10px; border: 1px solid rgba(255,255,255,0.05);';
        
        if(cat.items && cat.items.length > 0) {
            cat.items.forEach(item => {
                const btn = document.createElement('div');
                btn.className = 'callout-svg-btn';
                btn.style.cssText = 'padding:10px; background:#1a2744; border:1px solid #334155; border-radius:8px; cursor:pointer; text-align:center; transition:all 0.2s; overflow:hidden;';
                
                btn.innerHTML = `<div style="transform:scale(0.8); transform-origin:center; pointer-events:none;">${item.svg}</div><div style="font-size:11px; margin-top:5px; color:#cbd5e1; font-weight:600;">${item.name}</div>`;
                
                btn.addEventListener('mouseenter', () => { btn.style.borderColor = '#3b82f6'; btn.style.boxShadow = '0 2px 8px rgba(59,130,246,0.2)'; });
                btn.addEventListener('mouseleave', () => { btn.style.borderColor = '#334155'; btn.style.boxShadow = 'none'; });
                
                btn.onclick = () => addSVGCalloutToCanvas(item);
                body.appendChild(btn);
            });
        }
        
        header.onclick = () => {
            const isOpen = body.style.display === 'grid';
            document.querySelectorAll('.accordion-body').forEach(b => b.style.display = 'none');
            document.querySelectorAll('.accordion-header .icon-toggle').forEach(i => i.textContent = '▼');
            if(!isOpen) {
                body.style.display = 'grid';
                header.querySelector('.icon-toggle').textContent = '▲';
            }
        };
        
        acc.appendChild(header);
        acc.appendChild(body);
    });
}

function addSVGCalloutToCanvas(item) {
    const workArea = document.getElementById('workArea') || document.getElementById('canvas-container') || document.querySelector('.main-preview');
    if(!workArea) { alert('Canvas alanı bulunamadı!'); return; }
    
    const wrap = document.createElement('div');
    wrap.className = 'callout-wrap svg-callout draggable';
    wrap.style.cssText = `
        position: absolute;
        left: 100px;
        top: 100px;
        z-index: 500;
        cursor: move;
    `;
    
    const el = document.createElement('div');
    el.className = 'callout-item callout-svg-container';
    el.style.cssText = `
        transform-origin: top left;
        user-select: none;
    `;
    let svgHtml = item.svg;
    const uniqueSuffix = '_' + Math.random().toString(36).substr(2, 6);
    
    // Benzersiz ID'ler oluşturarak sekmedeki orijinal SVG ile Canvas'a eklenen kopyanın ID çakışmasını engelle (Filtre/Gradyan kaybolma sorunu çözümü)
    const idMatches = svgHtml.match(/id="([^"]+)"/g);
    if (idMatches) {
        idMatches.forEach(match => {
            const originalId = match.match(/id="([^"]+)"/)[1];
            const newId = originalId + uniqueSuffix;
            // ID tanımını değiştir
            svgHtml = svgHtml.replace(new RegExp(`id="${originalId}"`, 'g'), `id="${newId}"`);
            // ID referansını (url(#id)) değiştir
            svgHtml = svgHtml.replace(new RegExp(`url\\(#${originalId}\\)`, 'g'), `url(#${newId})`);
        });
    }
    
    const wMatch = item.svg ? item.svg.match(/width="([\d.]+)"/) : null;
    const hMatch = item.svg ? item.svg.match(/height="([\d.]+)"/) : null;
    const vbMatch = item.svg ? item.svg.match(/viewBox="([^"]+)"/) : null;
    
    let defaultW = 240;
    let defaultH = 120;
    
    if (wMatch && hMatch) {
        defaultW = parseFloat(wMatch[1]) || 240;
        defaultH = parseFloat(hMatch[1]) || 120;
    } else if (vbMatch) {
        const parts = vbMatch[1].trim().split(/[\s,]+/);
        if (parts.length === 4) {
            defaultW = parseFloat(parts[2]) || 240;
            defaultH = parseFloat(parts[3]) || 120;
        }
    }
    
    if (!svgHtml.includes('viewBox=')) {
        svgHtml = svgHtml.replace(/<svg\b([^>]*)>/i, `<svg viewBox="0 0 ${defaultW} ${defaultH}" $1>`);
    }
    
    // Subpixel & geometric precision for crisp lines
    if (!svgHtml.includes('shape-rendering=')) {
        svgHtml = svgHtml.replace(/<svg\b([^>]*)>/i, `<svg shape-rendering="geometricPrecision" text-rendering="geometricPrecision" $1>`);
    }
    
    svgHtml = svgHtml.replace(/width="[^"]*"/, 'width="100%"').replace(/height="[^"]*"/, 'height="100%"');
    
    const cContainer = document.getElementById('canvas-container');
    const cW = (cContainer && parseFloat(cContainer.style.width)) || (typeof uploadedImgW !== 'undefined' && uploadedImgW > 0 ? uploadedImgW : 1920);
    const formatRatio = Math.max(1, cW / 1920);

    const targetW = Math.round(defaultW * 1.5 * formatRatio);
    const targetH = Math.round(defaultH * 1.5 * formatRatio);

    el.style.width = targetW + 'px';
    el.style.height = targetH + 'px';
    wrap.style.width = targetW + 'px';
    wrap.style.height = targetH + 'px';
    wrap.style.left = Math.round(100 * formatRatio) + 'px';
    wrap.style.top = Math.round(100 * formatRatio) + 'px';

    el.innerHTML = svgHtml;
    el.dataset.originalSvg = encodeURIComponent(svgHtml);
    
    function isLocked() {
        return wrap.dataset.locked === 'true' || el.dataset.locked === 'true' || (typeof drawMode !== 'undefined' && drawMode !== null && drawMode !== 'off');
    }

    const controls = document.createElement('div');
    controls.className = 'callout-controls cbtn-del';
    controls.title = 'Sil';
    controls.style.cssText = 'position:absolute; bottom:-8px; left:-8px; cursor:pointer; z-index:100; display:none;';
    controls.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:block; pointer-events:none; flex-shrink:0;"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
    
    const resizer = document.createElement('div');
    resizer.className = 'callout-resizer';
    resizer.title = 'Boyutlandır';
    resizer.style.cssText = 'position:absolute; bottom:-8px; right:-8px; cursor:nwse-resize; z-index:10; display:none;';
    resizer.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:block; pointer-events:none; flex-shrink:0;"><path d="M21 15v6h-6M3 9V3h6M21 21l-7-7M3 3l7 7"></path></svg>';
    
    const selectBorder = document.createElement('div');
    selectBorder.className = 'callout-select-border';
    selectBorder.style.cssText = `
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        border: 2px dashed #00d2ff;
        pointer-events: none;
        display: none;
    `;

    const rotator = document.createElement('div');
    rotator.className = 'callout-rotator';
    rotator.style.cssText = 'position:absolute; top:-28px; left:50%; transform:translateX(-50%); cursor:grab; display:none; z-index:100;';
    rotator.title = 'Döndür';
    rotator.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:block; pointer-events:none; flex-shrink:0;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.22-10.27l-5.3 5.3"></path></svg>';

    const lockBtn = document.createElement('div');
    lockBtn.className = 'callout-lock-btn';
    lockBtn.style.cssText = 'position:absolute; top:-8px; right:-8px; cursor:pointer; display:flex; z-index:100;';
    lockBtn.title = 'Kilitle';
    const lockSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:block; pointer-events:none; flex-shrink:0;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
    const unlockSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:block; pointer-events:none; flex-shrink:0;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>';
    lockBtn.innerHTML = (wrap.dataset.locked === 'true' || el.dataset.locked === 'true') ? lockSvg : unlockSvg;

    let lastLockToggle = 0;
    const lockAction = function(e) {
        e.stopPropagation();
        e.preventDefault();
        if (Date.now() - lastLockToggle < 300) return;
        lastLockToggle = Date.now();
        if (!wrap.dataset.layerUid) {
            wrap.dataset.layerUid = 'layer_' + Math.random().toString(36).substr(2, 9);
        }
        if (typeof window.layerToggleLock === 'function') {
            window.layerToggleLock(wrap.dataset.layerUid);
        }
        const isNowLocked = (wrap.dataset.locked === 'true' || el.dataset.locked === 'true');
        lockBtn.innerHTML = isNowLocked ? lockSvg : unlockSvg;
        lockBtn.title = isNowLocked ? 'Kilidi Aç' : 'Kilitle';
        lockBtn.classList.toggle('is-locked', isNowLocked);
    };
    const stopLockDown = function(e) { e.stopPropagation(); e.preventDefault(); };
    lockBtn.addEventListener('mousedown', stopLockDown);
    lockBtn.addEventListener('touchstart', stopLockDown, {passive: false});
    lockBtn.addEventListener('click', lockAction);
    lockBtn.addEventListener('touchend', lockAction);

    wrap.appendChild(selectBorder);
    wrap.appendChild(el);
    wrap.appendChild(controls);
    wrap.appendChild(resizer);
    wrap.appendChild(rotator);
    wrap.appendChild(lockBtn);
    
    // Touch Proxy (Mobil için mousedown simülasyonu)
    function localTouchProxy(event) {
        if(isLocked()) return;
        const touch = event.changedTouches[0];
        const simulatedEvent = new MouseEvent({
            touchstart: 'mousedown',
            touchmove: 'mousemove',
            touchend: 'mouseup'
        }[event.type], {
            bubbles: true, cancelable: true, view: window,
            clientX: touch.clientX, clientY: touch.clientY,
            screenX: touch.screenX, screenY: touch.screenY
        });
        wrap.dispatchEvent(simulatedEvent);
        if (event.type === 'touchmove') event.preventDefault();
    }
    wrap.addEventListener('touchstart', localTouchProxy, {passive: false});
    wrap.addEventListener('touchmove', localTouchProxy, {passive: false});
    wrap.addEventListener('touchend', localTouchProxy, {passive: false});
    
    const curCanvasW = (typeof canvasEl !== 'undefined' && canvasEl && parseInt(canvasEl.style.width)) ? parseInt(canvasEl.style.width) : ((typeof uploadedImgW !== 'undefined' && uploadedImgW) ? uploadedImgW : 1920);
    const curCanvasH = (typeof canvasEl !== 'undefined' && canvasEl && parseInt(canvasEl.style.height)) ? parseInt(canvasEl.style.height) : ((typeof uploadedImgH !== 'undefined' && uploadedImgH) ? uploadedImgH : 1080);
    wrap.dataset.origCanvasW = curCanvasW;
    wrap.dataset.origCanvasH = curCanvasH;
    wrap.dataset.userScale = 1;
    wrap.dataset.scale = 1;
    wrap.dataset.rotation = 0;
    el.dataset.scale = 1;

    function applyScale(scale){
        el.dataset.scale = scale;
        wrap.dataset.scale = scale;
        const origW = parseFloat(wrap.dataset.origCanvasW) || 1920;
        const origH = parseFloat(wrap.dataset.origCanvasH) || 1080;
        const curW = (typeof canvasEl !== 'undefined' && canvasEl && parseInt(canvasEl.style.width)) ? parseInt(canvasEl.style.width) : ((typeof uploadedImgW !== 'undefined' && uploadedImgW) ? uploadedImgW : 1920);
        const curH = (typeof canvasEl !== 'undefined' && canvasEl && parseInt(canvasEl.style.height)) ? parseInt(canvasEl.style.height) : ((typeof uploadedImgH !== 'undefined' && uploadedImgH) ? uploadedImgH : 1080);
        const formatRatio = Math.min(curW / origW, curH / origH);
        wrap.dataset.userScale = formatRatio > 0 ? (scale / formatRatio) : scale;
        const rot = wrap.dataset.rotation || 0;
        wrap.style.transform = `rotate(${rot}deg) scale(${scale})`;
        controls.style.transform = '';
        resizer.style.transform = '';
        lockBtn.style.transform = '';
        rotator.style.transform = 'translateX(-50%)';
    }
    
    function selectCallout(){
        if(isLocked()) return;
        document.querySelectorAll('.callout-controls').forEach(function(c){ c.style.display = 'none'; });
        document.querySelectorAll('.callout-resizer').forEach(function(c){ c.style.display = 'none'; });
        document.querySelectorAll('.callout-rotator').forEach(function(c){ c.style.display = 'none'; });
        document.querySelectorAll('.callout-lock-btn').forEach(function(c){ c.style.display = 'none'; });
        document.querySelectorAll('.callout-select-border').forEach(function(c){ c.style.display = 'none'; });
        controls.style.display = 'flex';
        resizer.style.display = 'flex';
        rotator.style.display = 'flex';
        lockBtn.style.display = 'flex';
        selectBorder.style.display = 'block';
        if (typeof selectCalloutEl === 'function') selectCalloutEl(el, true);
    }
    
    function selectWrap(e){
        if(isLocked()) return;
        if(!e.target.closest('.callout-controls') && !e.target.closest('.callout-resizer') && !e.target.closest('.callout-rotator') && !e.target.closest('.callout-lock-btn')){
            selectCallout();
        }
    }
    wrap.addEventListener('mousedown', selectWrap);
    wrap.addEventListener('touchstart', selectWrap, {passive: true});
    
    function handleOutsideClick(e){
        if(e.target.closest('#tab-callout')) return;
        if(!wrap.contains(e.target)){
            controls.style.display = 'none';
            resizer.style.display = 'none';
            if(typeof rotator !== 'undefined') rotator.style.display = 'none';
            selectBorder.style.display = 'none';
            lockBtn.style.display = 'flex';
        }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick, {passive: true});
    
    let delBtnIsDrag = false, delStartX = 0, delStartY = 0;
    controls.addEventListener('touchstart', (e) => {
        delBtnIsDrag = false;
        if (e.touches.length) { delStartX = e.touches[0].clientX; delStartY = e.touches[0].clientY; }
    }, {passive: true});
    controls.addEventListener('touchmove', (e) => {
        if (e.touches.length) {
            if (Math.abs(e.touches[0].clientX - delStartX) > 10 || Math.abs(e.touches[0].clientY - delStartY) > 10) delBtnIsDrag = true;
        }
    }, {passive: true});
    controls.addEventListener('click', function(e){
        e.stopPropagation();
        if(delBtnIsDrag) { delBtnIsDrag = false; return; }
        if (typeof deleteSelectedCallout === 'function') { deleteSelectedCallout(); } else { wrap.remove(); }
    });

    

    el.addEventListener('dblclick', function(e){
        e.stopPropagation();
        if (e.target.tagName === 'text' || e.target.tagName === 'tspan') {
            const newText = prompt('Metni düzenle (Silmek için boş bırakın):', e.target.textContent);
            if(newText !== null) e.target.textContent = newText.trim();
        } else {
            const texts = Array.from(el.querySelectorAll('text, tspan'));
            if (texts.length > 0) {
                 texts.forEach(t => {
                     const val = prompt('Metni düzenle (Silmek için boş bırakın):', t.textContent);
                     if (val !== null) t.textContent = val.trim();
                 });
            }
        }
    });
    
    let isDragging = false, dsx, dsy, dix, diy;
      let isInnerDragging = false, innerTarget = null, innerStartX, innerStartY, innerStartTx = 0, innerStartTy = 0;

      const wrapMove = function(e){
          const globalScale = typeof window.getGlobalScale === 'function' ? window.getGlobalScale() : ((typeof scaleFactor !== 'undefined' ? scaleFactor : 1) * (window.pinchScale || 1));
          if (isInnerDragging && innerTarget) {
              let scale = parseFloat(el.dataset.scale) || 1;
              let dx = (e.clientX - innerStartX) / (globalScale * scale);
              let dy = (e.clientY - innerStartY) / (globalScale * scale);
              let newTx = innerStartTx + dx;
              let newTy = innerStartTy + dy;
              innerTarget.dataset.tx = newTx;
              innerTarget.dataset.ty = newTy;
              innerTarget.style.transform = `translate(${newTx}px, ${newTy}px)`;
              return;
          }
          if(!isDragging) return;
          wrap.style.left = (dix + (e.clientX - dsx) / globalScale) + 'px';
          wrap.style.top = (diy + (e.clientY - dsy) / globalScale) + 'px';
      };
      const wrapUp = function(){
          isDragging = false;
          if (isInnerDragging) {
              isInnerDragging = false;
              innerTarget = null;
          }
          document.removeEventListener('mousemove', wrapMove);
          document.removeEventListener('mouseup', wrapUp);
      };
      
      wrap.addEventListener('mousedown', function(e){
          if(e.button !== 0) return;
          if(e.target.closest('.callout-controls')) return;
          if(e.target.closest('.callout-resizer')) return;
          if(e.target.closest('.callout-rotator')) return;
          
          if (e.altKey && e.target !== wrap && e.target !== el && e.target.tagName !== 'svg' && !e.target.classList.contains('callout-svg-container')) {
              isInnerDragging = true;
              innerTarget = e.target;
              innerStartX = e.clientX;
              innerStartY = e.clientY;
              innerStartTx = parseFloat(innerTarget.dataset.tx) || 0;
              innerStartTy = parseFloat(innerTarget.dataset.ty) || 0;
              e.stopPropagation();
              e.preventDefault();
              document.addEventListener('mousemove', wrapMove);
              document.addEventListener('mouseup', wrapUp);
              return;
          }
          isDragging = true;
          dsx = e.clientX;
          dsy = e.clientY;
          dix = parseFloat(wrap.style.left) || 0;
          diy = parseFloat(wrap.style.top) || 0;
          e.stopPropagation();
          document.addEventListener('mousemove', wrapMove);
          document.addEventListener('mouseup', wrapUp);
      });
    
    // BOYUTLANDIRMA (Köşeden çekme)
    let isResizing = false, rsx, rsy, startWidth, startScale;
    function rsDown(e){
        e.stopPropagation();
        e.preventDefault();
        isResizing = true;
        rsx = e.touches ? e.touches[0].clientX : e.clientX;
        rsy = e.touches ? e.touches[0].clientY : e.clientY;
        startWidth = el.getBoundingClientRect().width;
        startScale = parseFloat(el.dataset.scale) || 1;
        document.addEventListener('mousemove', rsMove);
        document.addEventListener('touchmove', rsMove, {passive: false});
        document.addEventListener('mouseup', rsUp);
        document.addEventListener('touchend', rsUp);
    }
    resizer.addEventListener('mousedown', rsDown);
    resizer.addEventListener('touchstart', rsDown, {passive: false});

    function rsMove(e){
        if(!isResizing) return;
        if(e.cancelable) e.preventDefault();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        const sf = typeof window.getGlobalScale === 'function' ? window.getGlobalScale() : ((typeof scaleFactor !== 'undefined' ? scaleFactor : 1) * (window.pinchScale || 1));
        const dx = (cx - rsx) / sf;
        const dy = (cy - rsy) / sf;
        const delta = (dx + dy) / 2;
        const newScale = Math.max(0.3, Math.min(4, startScale + (delta / 200)));
        applyScale(newScale);
    }

    function rsUp(){ 
        isResizing = false; 
        document.removeEventListener('mousemove', rsMove);
        document.removeEventListener('touchmove', rsMove);
        document.removeEventListener('mouseup', rsUp);
        document.removeEventListener('touchend', rsUp);
    }
    
    // DÖNDÜRME (Rotator)
    let isRotating = false;
    function rotDown(e){
        e.stopPropagation();
        e.preventDefault();
        isRotating = true;
        rotator.style.cursor = 'grabbing';
        document.addEventListener('mousemove', rotMove);
        document.addEventListener('touchmove', rotMove, {passive: false});
        document.addEventListener('mouseup', rotUp);
        document.addEventListener('touchend', rotUp);
    }
    rotator.addEventListener('mousedown', rotDown);
    rotator.addEventListener('touchstart', rotDown, {passive: false});
    
    function rotMove(e){
        if(!isRotating) return;
        if(e.cancelable) e.preventDefault();
        const rect = wrap.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = cx - centerX;
        const dy = cy - centerY;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        angle += 90; 
        wrap.dataset.rotation = angle;
        const scale = parseFloat(wrap.dataset.scale) || 1;
        wrap.style.transform = `rotate(${angle}deg) scale(${scale})`;
    }
    
    function rotUp(){ 
        if(isRotating) {
            isRotating = false;
            rotator.style.cursor = 'grab';
        }
        document.removeEventListener('mousemove', rotMove);
        document.removeEventListener('touchmove', rotMove);
        document.removeEventListener('mouseup', rotUp);
        document.removeEventListener('touchend', rotUp);
    }
    
    // Doğrudan workArea'ya ekle (canvas-container).
    // ui-layer (z-index:50) içine eklersek şablon elemanları (z-index:100+) arkasında kalır.
    if (typeof makeDraggable === 'function') makeDraggable(wrap);
    workArea.appendChild(wrap);
    if (typeof window.recordHistory === 'function') window.recordHistory('Rozet eklendi');
    if (typeof window.renderLayers === 'function') window.renderLayers();
    
    console.log('✅ Rozet eklendi:', item.name);
}

window.rebindSVGCallout = function(wrap) {
    if (!wrap) return;
    const el = wrap.querySelector('.callout-item') || wrap;
    const controls = wrap.querySelector('.callout-controls.cbtn-del');
    const resizer = wrap.querySelector('.callout-resizer');
    const rotator = wrap.querySelector('.callout-rotator');
    const lockBtn = wrap.querySelector('.callout-lock-btn');
    const selectBorder = wrap.querySelector('.callout-select-border');

    function isLocked() {
        return wrap.dataset.locked === 'true' || el.dataset.locked === 'true' || (typeof drawMode !== 'undefined' && drawMode !== null && drawMode !== 'off');
    }

    function applyScale(scale) {
        el.dataset.scale = scale;
        wrap.dataset.scale = scale;
        const origW = parseFloat(wrap.dataset.origCanvasW) || 1920;
        const origH = parseFloat(wrap.dataset.origCanvasH) || 1080;
        const curW = (typeof canvasEl !== 'undefined' && canvasEl && parseInt(canvasEl.style.width)) ? parseInt(canvasEl.style.width) : ((typeof uploadedImgW !== 'undefined' && uploadedImgW) ? uploadedImgW : 1920);
        const curH = (typeof canvasEl !== 'undefined' && canvasEl && parseInt(canvasEl.style.height)) ? parseInt(canvasEl.style.height) : ((typeof uploadedImgH !== 'undefined' && uploadedImgH) ? uploadedImgH : 1080);
        const formatRatio = Math.min(curW / origW, curH / origH);
        wrap.dataset.userScale = formatRatio > 0 ? (scale / formatRatio) : scale;
        const rot = wrap.dataset.rotation || 0;
        wrap.style.transform = `rotate(${rot}deg) scale(${scale})`;
    }

    function selectCallout() {
        if(isLocked()) return;
        document.querySelectorAll('.callout-controls').forEach(c => c.style.display = 'none');
        document.querySelectorAll('.callout-resizer').forEach(c => c.style.display = 'none');
        document.querySelectorAll('.callout-rotator').forEach(c => c.style.display = 'none');
        document.querySelectorAll('.callout-lock-btn').forEach(c => c.style.display = 'none');
        document.querySelectorAll('.callout-select-border').forEach(c => c.style.display = 'none');
        if (controls) controls.style.display = 'flex';
        if (resizer) resizer.style.display = 'flex';
        if (rotator) rotator.style.display = 'flex';
        if (lockBtn) lockBtn.style.display = 'flex';
        if (selectBorder) selectBorder.style.display = 'block';
        if (typeof selectCalloutEl === 'function') selectCalloutEl(el, true);
    }

    wrap.onclick = function(e) {
        if (isLocked()) return;
        selectCallout();
    };

    if (controls) {
        controls.onclick = function(e) {
            e.stopPropagation();
            wrap.remove();
            if (typeof window.recordHistory === 'function') window.recordHistory('Callout silindi');
            if (typeof window.renderLayers === 'function') window.renderLayers();
            if (typeof requestAutoSave === 'function') requestAutoSave();
        };
    }

    if (lockBtn) {
        lockBtn.onclick = function(e) {
            e.stopPropagation();
            const isCurrentlyLocked = wrap.dataset.locked === 'true';
            wrap.dataset.locked = isCurrentlyLocked ? 'false' : 'true';
            const iconSvg = lockBtn.querySelector('svg');
            if (iconSvg) {
                iconSvg.innerHTML = wrap.dataset.locked === 'true' 
                    ? '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>'
                    : '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>';
            }
            if (typeof requestAutoSave === 'function') requestAutoSave();
        };
    }

    if (resizer) {
        let isResizing = false, rsx, rsy, startScale;
        function rsDown(e) {
            e.stopPropagation();
            e.preventDefault();
            isResizing = true;
            rsx = e.touches ? e.touches[0].clientX : e.clientX;
            rsy = e.touches ? e.touches[0].clientY : e.clientY;
            startScale = parseFloat(wrap.dataset.scale || el.dataset.scale) || 1;
            document.addEventListener('mousemove', rsMove);
            document.addEventListener('touchmove', rsMove, {passive: false});
            document.addEventListener('mouseup', rsUp);
            document.addEventListener('touchend', rsUp);
        }
        function rsMove(e) {
            if(!isResizing) return;
            if(e.cancelable) e.preventDefault();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            const sf = typeof window.getGlobalScale === 'function' ? window.getGlobalScale() : ((typeof scaleFactor !== 'undefined' ? scaleFactor : 1) * (window.pinchScale || 1));
            const dx = (cx - rsx) / sf;
            const dy = (cy - rsy) / sf;
            const delta = (dx + dy) / 2;
            const newScale = Math.max(0.3, Math.min(4, startScale + (delta / 200)));
            applyScale(newScale);
        }
        function rsUp() {
            isResizing = false;
            document.removeEventListener('mousemove', rsMove);
            document.removeEventListener('touchmove', rsMove);
            document.removeEventListener('mouseup', rsUp);
            document.removeEventListener('touchend', rsUp);
            if (typeof requestAutoSave === 'function') requestAutoSave();
        }
        resizer.onmousedown = rsDown;
        resizer.ontouchstart = rsDown;
    }

    if (rotator) {
        let isRotating = false;
        function rotDown(e) {
            e.stopPropagation();
            e.preventDefault();
            isRotating = true;
            rotator.style.cursor = 'grabbing';
            document.addEventListener('mousemove', rotMove);
            document.addEventListener('touchmove', rotMove, {passive: false});
            document.addEventListener('mouseup', rotUp);
            document.addEventListener('touchend', rotUp);
        }
        function rotMove(e) {
            if(!isRotating) return;
            if(e.cancelable) e.preventDefault();
            const rect = wrap.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            const dx = cx - centerX;
            const dy = cy - centerY;
            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
            angle += 90;
            wrap.dataset.rotation = angle;
            const scale = parseFloat(wrap.dataset.scale) || 1;
            wrap.style.transform = `rotate(${angle}deg) scale(${scale})`;
        }
        function rotUp() {
            if(isRotating) {
                isRotating = false;
                rotator.style.cursor = 'grab';
            }
            document.removeEventListener('mousemove', rotMove);
            document.removeEventListener('touchmove', rotMove);
            document.removeEventListener('mouseup', rotUp);
            document.removeEventListener('touchend', rotUp);
            if (typeof requestAutoSave === 'function') requestAutoSave();
        }
        rotator.onmousedown = rotDown;
        rotator.ontouchstart = rotDown;
    }

    if (typeof makeDraggable === 'function') makeDraggable(wrap);
};

function renderNeonCallouts() {
    const pool = document.getElementById('neonCalloutPool');
    if (!pool) return;
    pool.innerHTML = '';

    NEON_CALLOUTS.forEach((n, idx) => {
        const card = document.createElement('div');
        card.style.cssText = `
            background: linear-gradient(145deg, #0d1b2e, #1a2744);
            border: 1px solid rgba(96,165,250,0.25);
            border-radius: 10px;
            padding: 14px 8px 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
        `;

        const lines = n.text.split('\n');
        card.innerHTML = `
            <div style="width:44px; height:44px; display:flex; align-items:center; justify-content:center;
                background: rgba(96,165,250,0.08); border: 1.5px solid rgba(96,165,250,0.4);
                border-radius:50%; position:relative;">
                <i class="${n.icon}" style="font-size:20px; color:#93c5fd;
                    filter: drop-shadow(0 0 6px rgba(147,197,253,0.8));"></i>
            </div>
            <div style="text-align:center; font-size:9px; font-weight:800; color:#e2e8f0;
                letter-spacing:0.5px; line-height:1.3; text-transform:uppercase;">
                ${lines.join('<br>')}
            </div>
        `;

        card.addEventListener('mouseenter', () => {
            card.style.background = 'linear-gradient(145deg, #162035, #1e3160)';
            card.style.borderColor = 'rgba(96,165,250,0.6)';
            card.style.transform = 'translateY(-2px)';
            card.style.boxShadow = '0 6px 20px rgba(96,165,250,0.2)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.background = 'linear-gradient(145deg, #0d1b2e, #1a2744)';
            card.style.borderColor = 'rgba(96,165,250,0.25)';
            card.style.transform = '';
            card.style.boxShadow = '';
        });

        card.onclick = () => addNeonToCanvas(n);
        pool.appendChild(card);
    });
}

function addNeonToCanvas(n) {
    const workArea = document.getElementById('workArea') || document.getElementById('canvas-container') || document.querySelector('.main-preview');
    if (!workArea) { alert('Canvas alanı bulunamadı!'); return; }

    const cContainer = document.getElementById('canvas-container');
    const cW = (cContainer && parseFloat(cContainer.style.width)) || (typeof uploadedImgW !== 'undefined' && uploadedImgW > 0 ? uploadedImgW : 1920);
    const formatRatio = Math.max(1, cW / 1920);

    const iconColor = '#93c5fd';
    const textColor = '#ffffff';
    const bgColor = '#0d1b2e';
    const bgOpacity = 0; // Default transparent
    const iconSize = Math.round(76 * formatRatio);
    const textSize = Math.round(16 * formatRatio);
    const glowPct = 45;
    const radius = Math.round(14 * formatRatio);
    const padding = Math.round(12 * formatRatio);
    const boxSize = Math.round(180 * formatRatio); // Uniform box size for all icons
    
    const lines = n.text.split('\n');

    const el = document.createElement('div');
    el.className = 'callout-item co-neon-block';
    el.dataset.coIcon = n.icon;
    el.dataset.coIconColor = iconColor;
    el.dataset.coTextColor = textColor;
    el.dataset.coBgColor = bgColor;
    el.dataset.coBgOpacity = bgOpacity;
    el.dataset.coIconSize = iconSize;
    el.dataset.coTextSize = textSize;
    el.dataset.coGlow = glowPct;
    el.dataset.coRadius = radius;
    el.dataset.coPadding = padding;
    el.dataset.coBoxSize = boxSize;
    el.dataset.coLabel = lines.join('\n');

    el.style.cssText = `
        position: absolute;
        left: ${Math.round(120 * formatRatio)}px;
        top: ${Math.round(120 * formatRatio)}px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: ${Math.round(12 * formatRatio)}px;
        cursor: move;
        z-index: 500;
        user-select: none;
        padding: ${padding}px;
        border-radius: ${radius}px;
        background: transparent;
        border: none;
        width: ${boxSize}px;
        height: ${boxSize}px;
    `;

    // Parlaklık değerine göre dengeli neon drop-shadow
    const glowPx1 = Math.max(2, Math.round(glowPct * 0.06)); // Örn: 3-5px
    const glowPx2 = Math.max(4, Math.round(glowPct * 0.12)); // Örn: 6-10px

    el.innerHTML = `
        <div class="co-icon-wrap" style="display:flex; align-items:center; justify-content:center;">
            <i class="${n.icon}" style="font-size:${iconSize}px; color:${iconColor};
                filter: drop-shadow(0 0 ${glowPx1}px ${iconColor}) drop-shadow(0 0 ${glowPx2}px ${iconColor});"></i>
        </div>
        <div class="co-label" style="text-align:center; font-size:${textSize}px; font-weight:800;
            color:${textColor}; letter-spacing:1.5px; line-height:1.4; text-transform:uppercase;
            font-family:'Montserrat',sans-serif;
            text-shadow: 0 2px 4px rgba(0,0,0,0.8);">${lines.join('<br>')}</div>
    `;

    function isLocked() {
        return el.dataset.locked === 'true' || (typeof drawMode !== 'undefined' && drawMode !== null && drawMode !== 'off');
    }

    // KONTROLLER
    const controls = document.createElement('div');
    controls.className = 'callout-controls cbtn-del';
    controls.title = 'Sil';
    controls.style.cssText = 'position:absolute; bottom:-8px; left:-8px; cursor:pointer; z-index:100; display:none;';
    controls.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:block; pointer-events:none; flex-shrink:0;"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
    
    const resizer = document.createElement('div');
    resizer.className = 'callout-resizer';
    resizer.title = 'Boyutlandır';
    resizer.style.cssText = 'position:absolute; bottom:-8px; right:-8px; cursor:nwse-resize; z-index:10; display:none;';
    resizer.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:block; pointer-events:none; flex-shrink:0;"><path d="M21 15v6h-6M3 9V3h6M21 21l-7-7M3 3l7 7"></path></svg>';
    
    const selectBorder = document.createElement('div');
    selectBorder.className = 'callout-select-border';
    selectBorder.style.cssText = `
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        border: 2px dashed #3b82f6;
        pointer-events: none;
        display: none;
    `;

    const rotator = document.createElement('div');
    rotator.className = 'callout-rotator';
    rotator.style.cssText = 'position:absolute; top:-28px; left:50%; transform:translateX(-50%); cursor:grab; display:none; z-index:100;';
    rotator.title = 'Döndür';
    rotator.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:block; pointer-events:none; flex-shrink:0;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.22-10.27l-5.3 5.3"></path></svg>';

    const lockBtn = document.createElement('div');
    lockBtn.className = 'callout-lock-btn';
    lockBtn.style.cssText = 'position:absolute; top:-8px; right:-8px; cursor:pointer; display:flex; z-index:100;';
    lockBtn.title = 'Kilitle';
    const lockSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:block; pointer-events:none; flex-shrink:0;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
    const unlockSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:block; pointer-events:none; flex-shrink:0;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>';
    lockBtn.innerHTML = (el.dataset.locked === 'true') ? lockSvg : unlockSvg;

    let lastLockToggle = 0;
    const lockAction = function(e) {
        e.stopPropagation();
        e.preventDefault();
        if (Date.now() - lastLockToggle < 300) return;
        lastLockToggle = Date.now();
        if (!el.dataset.layerUid) {
            el.dataset.layerUid = 'layer_' + Math.random().toString(36).substr(2, 9);
        }
        if (typeof window.layerToggleLock === 'function') {
            window.layerToggleLock(el.dataset.layerUid);
        }
        const isNowLocked = (el.dataset.locked === 'true');
        lockBtn.innerHTML = isNowLocked ? lockSvg : unlockSvg;
        lockBtn.title = isNowLocked ? 'Kilidi Aç' : 'Kilitle';
        lockBtn.classList.toggle('is-locked', isNowLocked);
    };
    const stopLockDown = function(e) { e.stopPropagation(); e.preventDefault(); };
    lockBtn.addEventListener('mousedown', stopLockDown);
    lockBtn.addEventListener('touchstart', stopLockDown, {passive: false});
    lockBtn.addEventListener('click', lockAction);
    lockBtn.addEventListener('touchend', lockAction);

    el.appendChild(selectBorder);
    el.appendChild(controls);
    el.appendChild(resizer);
    el.appendChild(rotator);
    el.appendChild(lockBtn);
    
    el.dataset.scale = 1;
    el.dataset.rotation = 0;
    
    function applyScale(scale){
        el.dataset.scale = scale;
        const rot = el.dataset.rotation || 0;
        el.style.transform = `rotate(${rot}deg) scale(${scale})`;
        controls.style.transform = '';
        resizer.style.transform = '';
        lockBtn.style.transform = '';
        rotator.style.transform = 'translateX(-50%)';
    }
    
    controls.onclick = (e) => {
        e.stopPropagation();
        if (typeof deleteSelectedCallout === 'function') {
            deleteSelectedCallout();
        } else {
            el.remove();
            if(window.selectedCalloutEl === el) closeCalloutPanel();
        }
    };

    // BOYUTLANDIRMA (Resizer)
    let isResizing = false, rsx = 0, rsy = 0, startScale = 1;
    function rsDown(e){
        e.stopPropagation();
        e.preventDefault();
        isResizing = true;
        rsx = e.touches ? e.touches[0].clientX : e.clientX;
        rsy = e.touches ? e.touches[0].clientY : e.clientY;
        startScale = parseFloat(el.dataset.scale) || 1;
        document.addEventListener('mousemove', rsMove);
        document.addEventListener('touchmove', rsMove, {passive: false});
        document.addEventListener('mouseup', rsUp);
        document.addEventListener('touchend', rsUp);
    }
    resizer.addEventListener('mousedown', rsDown);
    resizer.addEventListener('touchstart', rsDown, {passive: false});

    function rsMove(e){
        if(!isResizing) return;
        if(e.cancelable) e.preventDefault();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        const sf = typeof window.getGlobalScale === 'function' ? window.getGlobalScale() : ((typeof scaleFactor !== 'undefined' ? scaleFactor : 1) * (window.pinchScale || 1));
        const dx = (cx - rsx) / sf;
        const dy = (cy - rsy) / sf;
        const delta = (dx + dy) / 2;
        const newScale = Math.max(0.3, Math.min(4, startScale + (delta / 200)));
        applyScale(newScale);
    }

    function rsUp(){ 
        isResizing = false; 
        document.removeEventListener('mousemove', rsMove);
        document.removeEventListener('touchmove', rsMove);
        document.removeEventListener('mouseup', rsUp);
        document.removeEventListener('touchend', rsUp);
    }
    
    // DÖNDÜRME (Rotator)
    let isRotating = false;
    function rotDown(e){
        e.stopPropagation();
        e.preventDefault();
        isRotating = true;
        rotator.style.cursor = 'grabbing';
        document.addEventListener('mousemove', rotMove);
        document.addEventListener('touchmove', rotMove, {passive: false});
        document.addEventListener('mouseup', rotUp);
        document.addEventListener('touchend', rotUp);
    }
    rotator.addEventListener('mousedown', rotDown);
    rotator.addEventListener('touchstart', rotDown, {passive: false});
    
    function rotMove(e){
        if(!isRotating) return;
        if(e.cancelable) e.preventDefault();
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = cx - centerX;
        const dy = cy - centerY;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        angle += 90; 
        el.dataset.rotation = angle;
        const scale = parseFloat(el.dataset.scale) || 1;
        el.style.transform = `rotate(${angle}deg) scale(${scale})`;
    }
    
    function rotUp(){ 
        if(isRotating) {
            isRotating = false;
            rotator.style.cursor = 'grab';
        }
        document.removeEventListener('mousemove', rotMove);
        document.removeEventListener('touchmove', rotMove);
        document.removeEventListener('mouseup', rotUp);
        document.removeEventListener('touchend', rotUp);
    }

    function selectNeon(e) {
        if (isLocked()) return;
        if (!e.target.closest('.callout-controls') && !e.target.closest('.callout-resizer') && !e.target.closest('.callout-rotator') && !e.target.closest('.callout-lock-btn')) {
            if (typeof selectElement === 'function') selectElement(el);
            else selectCalloutEl(el, true);
        }
    }
    el.addEventListener('mousedown', selectNeon);
    el.addEventListener('touchstart', selectNeon, {passive: true});

    function handleNeonOutside(e) {
        if (e.target.closest('#tab-callout')) return;
        if (!el.contains(e.target)) {
            controls.style.display = 'none';
            resizer.style.display = 'none';
            rotator.style.display = 'none';
            selectBorder.style.display = 'none';
            el.style.outline = 'none';
            lockBtn.style.display = 'flex';
        }
    }
    document.addEventListener('mousedown', handleNeonOutside);
    document.addEventListener('touchstart', handleNeonOutside, {passive: true});

    // allIcons'a kaydet
    if (typeof allIcons !== 'undefined') allIcons.push(el);

    if (typeof makeDraggable === 'function') makeDraggable(el);
    if (typeof enableInlineEdit === 'function') enableInlineEdit(el);
    workArea.appendChild(el);
    if (typeof window.recordHistory === 'function') window.recordHistory('Neon Callout eklendi');
    if (typeof window.renderLayers === 'function') window.renderLayers();
}

function selectCalloutEl(el, isUserClick = false) {
  try {
    if (typeof selectedCalloutEl !== 'undefined' && selectedCalloutEl && selectedCalloutEl !== el) {
        selectedCalloutEl.style.outline = 'none';
    }
    
    // Switch to callout tab
    const tab = document.getElementById('tab-callout');
    if (tab && tab.style.display === 'none') {
        if (!(typeof window.isMobileDevice === 'function' && window.isMobileDevice())) {
            if (typeof switchTab === 'function') switchTab('callout');
        }
    }
    
    document.querySelectorAll('.co-neon-block').forEach(e => {
        if (!window.selectedElements || !window.selectedElements.includes(e)) {
            e.style.outline = 'none';
            // Hide neon controls
            const ctrls = e.querySelector('.callout-controls');
            if (ctrls) {
                ctrls.style.display = 'none';
                e.querySelector('.callout-resizer').style.display = 'none';
                e.querySelector('.callout-rotator').style.display = 'none';
            }
        }
    });
    el.style.outline = '1px dashed rgba(255,255,255,0.4)';
    selectedCalloutEl = el;
    
    // Show controls for neon block
    if (el.classList.contains('co-neon-block')) {
        const ctrls = el.querySelector('.callout-controls');
        const res = el.querySelector('.callout-resizer');
        const rot = el.querySelector('.callout-rotator');
        const lk = el.querySelector('.callout-lock-btn');
        const brd = el.querySelector('.callout-select-border');
        if (ctrls) ctrls.style.display = 'flex';
        if (res) res.style.display = 'flex';
        if (rot) rot.style.display = 'flex';
        if (lk) lk.style.display = 'flex';
        if (brd) brd.style.display = 'block';
    }

    const panel = document.getElementById('calloutSettingsPanel');
    if (!panel) return;

    // Conditionally show panel on mobile
    const isMobile = (typeof window.isMobileDevice === 'function' && window.isMobileDevice()) || window.innerWidth <= 900;
    
    if (isMobile) {
        if (window.isLongPressOpen) {
            panel.style.display = 'block';
            panel.querySelectorAll('.color-row, .slider-group, .input-group').forEach(e => e.style.display = 'flex');
            window.isLongPressOpen = false;
        } else {
            // Do not open if just programmatically added
        }
    } else {
        panel.style.display = 'block';
        panel.querySelectorAll('.color-row, .slider-group, .input-group').forEach(e => e.style.display = 'flex');
    }
    
    // Remove warning div if exists
    const wDiv = document.getElementById('svgCalloutWarning');
    if (wDiv) wDiv.remove();

    const isNeon = el.classList.contains('co-neon-block');
    const d = el.dataset;
    const ic = document.getElementById('coIconColor');
    const tc = document.getElementById('coTextColor');
    const bc = document.getElementById('coBgColor');
    
    if (isNeon) {
        if (ic) ic.value = d.coIconColor || '#93c5fd';
        if (tc) tc.value = d.coTextColor || '#ffffff';
        if (bc) bc.value = d.coBgColor || '#0d1b2e';
        
        const bop = document.getElementById('coBgOpacity');
        const is = document.getElementById('coIconSize');
        const ts = document.getElementById('coTextSize');
        const gw = document.getElementById('coGlow');
        const rd = document.getElementById('coRadius');
        const pd = document.getElementById('coPadding');
        const lt = document.getElementById('coLabelText');

        if (bop) { bop.value = d.coBgOpacity || 0; document.getElementById('coBgOpacityVal').textContent = bop.value + '%'; }
        if (is) { is.value = d.coIconSize || 64; document.getElementById('coIconSizeVal').textContent = is.value + 'px'; }
        if (ts) { ts.value = d.coTextSize || 14; document.getElementById('coTextSizeVal').textContent = ts.value + 'px'; }
        if (gw) { gw.value = d.coGlow || 80; document.getElementById('coGlowVal').textContent = gw.value + '%'; }
        if (rd) { rd.value = d.coRadius || 12; document.getElementById('coRadiusVal').textContent = rd.value + 'px'; }
        if (pd) { pd.value = d.coPadding || 10; document.getElementById('coPaddingVal').textContent = pd.value + 'px'; }
        if (lt) lt.value = (d.coLabel || '').replace(/\\n/g, ' ');
    } else {
        // Hide neon-specific sliders for standard SVG callouts
        const bop = document.getElementById('coBgOpacity');
        const is = document.getElementById('coIconSize');
        const ts = document.getElementById('coTextSize');
        const gw = document.getElementById('coGlow');
        const rd = document.getElementById('coRadius');
        const pd = document.getElementById('coPadding');
        const lt = document.getElementById('coLabelText');
        
        if (bop) bop.parentElement.style.display = 'none';
        if (is) is.parentElement.style.display = 'none';
        if (ts) ts.parentElement.style.display = 'none';
        if (gw) gw.parentElement.style.display = 'none';
        if (rd) rd.parentElement.style.display = 'none';
        if (pd) pd.parentElement.style.display = 'none';
        if (lt) lt.parentElement.style.display = 'none';
        
        // Try to read SVG colors
        const svg = el.querySelector('svg');
        if (svg) {
            // Text color (first text)
            const textEl = svg.querySelector('text, tspan');
            if (textEl && tc) {
                const fill = textEl.getAttribute('fill') || textEl.style.fill;
                if (fill && fill.startsWith('#')) tc.value = fill.substring(0,7);
            }
            // BG color (first rect/circle/polygon)
            const bgEl = svg.querySelector('rect, circle, polygon, path');
            if (bgEl && bc) {
                const fill = bgEl.getAttribute('fill') || bgEl.style.fill;
                if (fill && fill.startsWith('#')) bc.value = fill.substring(0,7);
            }
            // Border color (first element with stroke)
            const borderEl = svg.querySelector('[stroke]');
            if (borderEl && ic) {
                const stroke = borderEl.getAttribute('stroke') || borderEl.style.stroke;
                if (stroke && stroke.startsWith('#')) ic.value = stroke.substring(0,7);
            }
        }
    }
  } catch(err) {
    console.error("SELECT CALLOUT ERROR:", err);
    alert("SELECT CALLOUT ERROR: " + err.message + "\n" + err.stack);
  }
}

function closeCalloutPanel() {
    selectedCalloutEl = null;
    document.querySelectorAll('.co-neon-block').forEach(e => {
        if (!window.selectedElements || !window.selectedElements.includes(e)) {
            e.style.outline = 'none';
            // Hide neon controls
            const ctrls = e.querySelector('.callout-controls');
            if (ctrls) {
                ctrls.style.display = 'none';
                e.querySelector('.callout-resizer').style.display = 'none';
                e.querySelector('.callout-rotator').style.display = 'none';
            }
        }
    });
    const panel = document.getElementById('calloutSettingsPanel');
    if (panel) panel.style.display = 'none';
}

function renderCalloutFromDataset(el) {
    const iconColor = el.dataset.coIconColor || '#93c5fd';
    const textColor = el.dataset.coTextColor || '#ffffff';
    const bgColor = el.dataset.coBgColor || '#0d1b2e';
    const bgOpacity = (parseInt(el.dataset.coBgOpacity || 0) / 100).toFixed(2);
    const iconSize = parseInt(el.dataset.coIconSize || 64);
    const textSize = parseInt(el.dataset.coTextSize || 14);
    const glowPct = parseInt(el.dataset.coGlow || 80);
    const radius = parseInt(el.dataset.coRadius || 12);
    const padding = parseInt(el.dataset.coPadding || 10);
    const boxSize = parseInt(el.dataset.coBoxSize || 140);
    const labelRaw = el.dataset.coLabel || '';

    // Stil güncelle
    el.style.padding = padding + 'px';
    el.style.borderRadius = radius + 'px';
    el.style.width = boxSize + 'px';
    el.style.height = boxSize + 'px';
    el.style.justifyContent = 'center';
    el.style.alignItems = 'center';
    el.style.textAlign = 'center';

    // Hex → rgb for rgba
    const hex2rgb = h => {
        const r = parseInt(h.slice(1,3),16);
        const g = parseInt(h.slice(3,5),16);
        const b = parseInt(h.slice(5,7),16);
        return `${r},${g},${b}`;
    };
    el.style.background = `rgba(${hex2rgb(bgColor)},${bgOpacity})`;

    // Parlaklık
    const glowPx1 = Math.max(2, Math.round(glowPct * 0.06));
    const glowPx2 = Math.max(4, Math.round(glowPct * 0.12));

    // İkon güncelle
    const iconEl = el.querySelector('i');
    if (iconEl) {
        iconEl.style.fontSize = iconSize + 'px';
        iconEl.style.color = iconColor;
        iconEl.style.textShadow = 'none';
        iconEl.style.filter = (glowPct > 0) ? `drop-shadow(0 0 ${glowPx1}px ${iconColor}) drop-shadow(0 0 ${glowPx2}px ${iconColor})` : 'none';
    }

    // Metin güncelle
    const labelEl = el.querySelector('.co-label');
    if (labelEl) {
        labelEl.style.fontSize = textSize + 'px';
        labelEl.style.color = textColor;
        if (labelRaw) labelEl.innerHTML = labelRaw.replace('\n', '<br>');
    }
}

function applyCalloutSettings() {
    if (!selectedCalloutEl) return;
    const el = selectedCalloutEl;

    const iconColor = document.getElementById('coIconColor')?.value || '#93c5fd';
    const textColor = document.getElementById('coTextColor')?.value || '#ffffff';
    const bgColor = document.getElementById('coBgColor')?.value || '#0d1b2e';

    if (el.classList.contains('co-neon-block')) {
        const bgOpacity = parseInt(document.getElementById('coBgOpacity')?.value || 0);
        const iconSize = parseInt(document.getElementById('coIconSize')?.value || 64);
        const textSize = parseInt(document.getElementById('coTextSize')?.value || 14);
        const glowPct = parseInt(document.getElementById('coGlow')?.value || 80);
        const radius = parseInt(document.getElementById('coRadius')?.value || 12);
        const padding = parseInt(document.getElementById('coPadding')?.value || 10);
        const labelRaw = document.getElementById('coLabelText')?.value || '';

        el.dataset.coIconColor = iconColor;
        el.dataset.coTextColor = textColor;
        el.dataset.coBgColor = bgColor;
        el.dataset.coBgOpacity = bgOpacity;
        el.dataset.coIconSize = iconSize;
        el.dataset.coTextSize = textSize;
        el.dataset.coGlow = glowPct;
        el.dataset.coRadius = radius;
        el.dataset.coPadding = padding;
        el.dataset.coLabel = labelRaw;

        renderCalloutFromDataset(el);
    } else {
        const svg = el.querySelector('svg');
        if (svg) {
            svg.querySelectorAll('text, tspan').forEach(t => {
                if (t.getAttribute('fill') && t.getAttribute('fill') !== 'none') t.setAttribute('fill', textColor);
            });
            svg.querySelectorAll('rect, circle, polygon, path').forEach(bg => {
                const fill = bg.getAttribute('fill');
                if (fill && fill !== 'none' && !fill.includes('url(#')) bg.setAttribute('fill', bgColor);
            });
            svg.querySelectorAll('[stroke]').forEach(s => {
                const stroke = s.getAttribute('stroke');
                if (stroke && stroke !== 'none' && !stroke.includes('url(#')) s.setAttribute('stroke', iconColor);
            });
        }
    }
}

function resetCalloutSetting(type) {
    const defaults = {
        'iconColor': '#93c5fd',
        'textColor': '#ffffff',
        'bgColor': '#0d1b2e',
        'bgOpacity': 0,
        'iconSize': 64,
        'textSize': 14,
        'glow': 45,
        'radius': 12,
        'padding': 10
    };
    
    if (defaults[type] !== undefined) {
        const idMap = {
            'iconColor': 'coIconColor', 'textColor': 'coTextColor', 'bgColor': 'coBgColor',
            'bgOpacity': 'coBgOpacity', 'iconSize': 'coIconSize', 'textSize': 'coTextSize',
            'glow': 'coGlow', 'radius': 'coRadius', 'padding': 'coPadding'
        };
        const el = document.getElementById(idMap[type]);
        if (el) {
            el.value = defaults[type];
            // Update display values if it's a slider
            const valEl = document.getElementById(idMap[type] + 'Val');
            if (valEl) {
                let unit = '';
                if (['iconSize', 'textSize', 'radius', 'padding'].includes(type)) unit = 'px';
                if (['bgOpacity', 'glow'].includes(type)) unit = '%';
                valEl.textContent = defaults[type] + unit;
            }
            if (selectedCalloutEl) {
                applyCalloutSettings();
                if (typeof window.recordHistory === 'function') window.recordHistory('Rozet ayarı sıfırlandı: ' + type);
            }
        }
    }
}
window.resetCalloutSetting = resetCalloutSetting;

function deleteSelectedCallout() {
    if (!selectedCalloutEl) return;
    const idx = typeof allIcons !== 'undefined' ? allIcons.indexOf(selectedCalloutEl) : -1;
    if (idx > -1) allIcons.splice(idx, 1);
    
    const wrap = selectedCalloutEl.closest('.callout-wrap');
    const elToRemove = selectedCalloutEl;
    
    // Ghost clickleri absürbe etmek için DOM'dan silinmeyi kısa bir süre geciktiriyoruz.
    // Ancak kullanıcıya anında silinmiş gibi gösteriyoruz.
    if (wrap) {
        wrap.style.opacity = '0';
        wrap.style.pointerEvents = 'none';
        setTimeout(() => wrap.remove(), 150);
    } else {
        elToRemove.style.opacity = '0';
        elToRemove.style.pointerEvents = 'none';
        setTimeout(() => elToRemove.remove(), 150);
    }
    
    selectedCalloutEl = null;
    closeCalloutPanel();
    if (typeof window.recordHistory === 'function') window.recordHistory('Callout silindi');
    if (typeof window.renderLayers === 'function') window.renderLayers();
}


function resetCalloutToDefault() {
    if (!selectedCalloutEl) return;
    
    const d = selectedCalloutEl.dataset;
    const isNeon = selectedCalloutEl.classList.contains('co-neon-block');
    
    if (isNeon) {
        document.getElementById('coIconColor').value = '#93c5fd';
        document.getElementById('coTextColor').value = '#ffffff';
        document.getElementById('coBgColor').value = '#0d1b2e';
        document.getElementById('coBgOpacity').value = '0';
        document.getElementById('coIconSize').value = '64';
        document.getElementById('coTextSize').value = '14';
        document.getElementById('coGlow').value = '45';
        document.getElementById('coRadius').value = '12';
        document.getElementById('coPadding').value = '10';
        applyCalloutSettings();
    } else if (d.originalSvg) {
        const rawSvg = decodeURIComponent(d.originalSvg);
        selectedCalloutEl.innerHTML = (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') ? window.DOMPurify.sanitize(rawSvg) : rawSvg;

        // Remove style overrides if any exist natively on SVG (handled by innerHTML)
        // Reset scale/rotation optionally? Usually we just want to reset colors.
        // We'll keep scale/rotation but reset colors.
        
        // Update UI Panel by re-triggering selectCalloutEl logic
        const tc = document.getElementById('coTextColor');
        const bc = document.getElementById('coBgColor');
        const ic = document.getElementById('coIconColor');
        
        const svg = selectedCalloutEl.querySelector('svg');
        if (svg) {
            const textEl = svg.querySelector('text, tspan');
            if (textEl && tc) {
                const fill = textEl.getAttribute('fill') || textEl.style.fill;
                if (fill && fill.startsWith('#')) tc.value = fill.substring(0,7);
            }
            const bgEl = svg.querySelector('rect, circle, polygon, path');
            if (bgEl && bc) {
                const fill = bgEl.getAttribute('fill') || bgEl.style.fill;
                if (fill && fill.startsWith('#')) bc.value = fill.substring(0,7);
            }
            const borderEl = svg.querySelector('[stroke]');
            if (borderEl && ic) {
                const stroke = borderEl.getAttribute('stroke') || borderEl.style.stroke;
                if (stroke && stroke.startsWith('#')) ic.value = stroke.substring(0,7);
            }
        }
    }
}
window.resetCalloutToDefault = resetCalloutToDefault;

// Slider ve ayar kontrollerine çift tıklama ile varsayılana sıfırlama dinleyicilerini bağla
function initCalloutSliderResetListeners() {
    const mapping = [
        { id: 'coIconColor', type: 'iconColor' },
        { id: 'coTextColor', type: 'textColor' },
        { id: 'coBgColor', type: 'bgColor' },
        { id: 'coBgOpacity', type: 'bgOpacity' },
        { id: 'coIconSize', type: 'iconSize' },
        { id: 'coTextSize', type: 'textSize' },
        { id: 'coGlow', type: 'glow' },
        { id: 'coRadius', type: 'radius' },
        { id: 'coPadding', type: 'padding' }
    ];

    mapping.forEach(m => {
        const inputEl = document.getElementById(m.id);
        if (inputEl) {
            inputEl.title = 'Varsayılana dönmek için çift tıklayın';
            inputEl.addEventListener('dblclick', function(e) {
                e.stopPropagation();
                resetCalloutSetting(m.type);
            });
            const parentGroup = inputEl.closest('.slider-group, .color-row');
            if (parentGroup) {
                parentGroup.title = 'Varsayılana dönmek için çift tıklayın';
                parentGroup.addEventListener('dblclick', function(e) {
                    if (e.target.tagName !== 'INPUT') {
                        resetCalloutSetting(m.type);
                    }
                });
            }
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalloutSliderResetListeners);
} else {
    initCalloutSliderResetListeners();
}

