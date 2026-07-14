/**
 * ============================================
 * CALLOUT MODULE
 * modules/callout.js
 * ============================================
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
    wrap.className = 'callout-wrap svg-callout';
    wrap.style.cssText = `
        position: absolute;
        left: 100px;
        top: 100px;
        z-index: 100;
        cursor: move;
    `;
    
    const el = document.createElement('div');
    el.className = 'callout-item callout-svg-container';
    el.style.cssText = `
        transform-origin: top left;
        user-select: none;
    `;
    el.innerHTML = item.svg;
    
    const controls = document.createElement('div');
    controls.className = 'callout-controls';
    controls.style.display = 'none';
    controls.innerHTML = `
        <button class="cbtn cbtn-del" title="Sil"><i class="fas fa-trash"></i></button>
    `;
    
    const resizer = document.createElement('div');
    resizer.className = 'callout-resizer';
    resizer.style.cssText = `
        position: absolute;
        width: 16px;
        height: 16px;
        background: #3b82f6;
        bottom: -8px;
        right: -8px;
        border-radius: 50%;
        cursor: se-resize;
        border: 2px solid #fff;
        box-shadow: 0 1px 3px rgba(0,0,0,0.5);
        z-index: 10;
        display: none;
    `;
    
    const selectBorder = document.createElement('div');
    selectBorder.className = 'callout-select-border';
    selectBorder.style.cssText = `
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        border: 2px dashed #3b82f6;
        pointer-events: none;
        display: none;
    `;
    
    wrap.appendChild(selectBorder);
    wrap.appendChild(el);
    wrap.appendChild(controls);
    wrap.appendChild(resizer);
    
    el.dataset.scale = 1;

    function applyScale(scale){
        el.dataset.scale = scale;
        el.style.zoom = scale;
        setTimeout(() => {
            if(window.selectedEl === el) selectCallout();
        }, 10);
    }
    
    function selectCallout(){
        document.querySelectorAll('.callout-controls').forEach(function(c){ c.style.display = 'none'; });
        document.querySelectorAll('.callout-resizer').forEach(function(c){ c.style.display = 'none'; });
        document.querySelectorAll('.callout-select-border').forEach(function(c){ c.style.display = 'none'; });
        controls.style.display = 'flex';
        resizer.style.display = 'block';
        selectBorder.style.display = 'block';
    }
    
    wrap.addEventListener('mousedown', function(e){
        if(!e.target.closest('.callout-controls') && !e.target.closest('.callout-resizer')){
            selectCallout();
        }
    });
    
    document.addEventListener('mousedown', function(e){
        if(!wrap.contains(e.target)){
            controls.style.display = 'none';
            resizer.style.display = 'none';
            selectBorder.style.display = 'none';
        }
    });
    
    controls.querySelector('.cbtn-del').addEventListener('click', function(e){
        e.stopPropagation();
        wrap.remove();
    });
    
    wrap.addEventListener('contextmenu', function(e){
        e.preventDefault();
        e.stopPropagation();
        wrap.remove();
    });
    
    el.addEventListener('dblclick', function(e){
        e.stopPropagation();
        if (e.target.tagName === 'text' || e.target.tagName === 'tspan') {
            const newText = prompt('Metni düzenle:', e.target.textContent);
            if(newText !== null && newText.trim()) e.target.textContent = newText;
        } else {
            const texts = Array.from(el.querySelectorAll('text, tspan'));
            if (texts.length > 0) {
                 texts.forEach(t => {
                     const val = prompt('Metni düzenle:', t.textContent);
                     if (val !== null && val.trim()) t.textContent = val;
                 });
            }
        }
    });
    
    let isDragging = false, dsx, dsy, dix, diy;
    wrap.addEventListener('mousedown', function(e){
        if(e.button !== 0) return;
        if(e.target.closest('.callout-controls')) return;
        if(e.target.closest('.callout-resizer')) return;
        
        isDragging = true;
        dsx = e.clientX;
        dsy = e.clientY;
        dix = parseFloat(wrap.style.left) || 0;
        diy = parseFloat(wrap.style.top) || 0;
        e.stopPropagation();
    });
    window.addEventListener('mousemove', function(e){
        if(!isDragging) return;
        wrap.style.left = (dix + (e.clientX - dsx)) + 'px';
        wrap.style.top = (diy + (e.clientY - dsy)) + 'px';
    });
    window.addEventListener('mouseup', function(){
        isDragging = false;
    });

    let isResizing = false, rsx, rsy, startScale;
    resizer.addEventListener('mousedown', function(e){
        e.stopPropagation();
        e.preventDefault();
        isResizing = true;
        rsx = e.clientX;
        rsy = e.clientY;
        startScale = parseFloat(el.dataset.scale) || 1;
    });
    document.addEventListener('mousemove', function(e){
        if(!isResizing) return;
        const dx = e.clientX - rsx;
        const dy = e.clientY - rsy;
        const delta = (dx + dy) / 2;
        const newScale = Math.max(0.3, Math.min(4, startScale + (delta / 200)));
        applyScale(newScale);
    });
    document.addEventListener('mouseup', function(){
        isResizing = false;
    });
    
    if(typeof allIcons !== 'undefined') allIcons.push(wrap);
    workArea.appendChild(wrap);
}

function addCalloutToCanvas(co){
    const workArea = document.getElementById('workArea') || document.getElementById('canvas-container') || document.querySelector('.main-preview');
    if(!workArea) { alert('Canvas alanı bulunamadı!'); return; }
    
    const el = document.createElement('div');
    el.className = 'callout-item ' + (co.customClass || '');
    el.style.cssText = `
        position: absolute;
        left: 100px;
        top: 100px;
        background: ${co.bg || 'transparent'};
        color: ${co.color || '#000'};
        border: ${co.border || 'none'};
        border-radius: ${co.radius !== undefined ? co.radius + (typeof co.radius === 'number' ? 'px' : '') : '0px'};
        padding: ${co.padding || '0'};
        font-size: ${co.fontSize || 16}px;
        font-weight: ${co.fontWeight || 'normal'};
        ${co.letterSpacing !== undefined ? 'letter-spacing: ' + co.letterSpacing + ';' : ''}
        ${co.shadow !== undefined ? 'box-shadow: ' + co.shadow + ';' : ''}
        font-family: 'Montserrat', sans-serif;
        ${co.borderBottom ? 'border-bottom: ' + co.borderBottom + ';' : ''}
        ${co.borderTop ? 'border-top: ' + co.borderTop + ';' : ''}
        ${co.backdropFilter ? 'backdrop-filter: ' + co.backdropFilter + ';' : ''}
        cursor: move;
        z-index: 100;
        user-select: none;
        white-space: nowrap;`;
        el.dataset.text = co.text;
    if (co.htmlTemplate) {
        el.dataset.template = co.htmlTemplate;
        el.innerHTML = co.htmlTemplate.replace('{{text}}', co.text);
    } else {
        el.textContent = co.text;
    }
      if (co['--co-bg']) el.style.setProperty('--co-bg', co['--co-bg']);
      if (co['--co-bc']) el.style.setProperty('--co-bc', co['--co-bc']);
      if (co['--co-bw']) el.style.setProperty('--co-bw', co['--co-bw']);
      if (co['--co-dot']) el.style.setProperty('--co-dot', co['--co-dot']);
      if (co['--co-len']) el.style.setProperty('--co-len', co['--co-len']);
      if (co['--co-bg-color']) el.style.setProperty('--co-bg-color', co['--co-bg-color']);
      if (co['--co-border-color']) el.style.setProperty('--co-border-color', co['--co-border-color']);
      if (co['--co-border-width']) el.style.setProperty('--co-border-width', co['--co-border-width']);
      if (co['--co-tail-size']) el.style.setProperty('--co-tail-size', co['--co-tail-size']);
      if (co['--co-tail-pos']) el.style.setProperty('--co-tail-pos', co['--co-tail-pos']);
    
    // Çift tık → metni düzenle
    el.addEventListener('dblclick', function(e){
        e.stopPropagation();
        const newText = prompt('Callout metnini düzenle:', this.textContent);
        if(newText !== null && newText.trim()) this.textContent = newText;
    });
    
    // Sürükleme
    makeDraggable(el);
    
    // Tek tık → seç (böylece "Seçili Sil" çalışır)
          el.addEventListener('mousedown', function(e){
          if(e.button !== 0) return;
          // Do not call selectElement for Callouts to prevent the Element tab from breaking them!
      });
    
    // Sağ tık → sil
    el.addEventListener('contextmenu', function(e){
        e.preventDefault();
        if(true) {
            const idx = allIcons.indexOf(el);
            if(idx > -1) allIcons.splice(idx, 1);
            el.remove();
            if(typeof deselectAll === 'function') deselectAll();
        }
    });
    
    // allIcons listesine kaydet (Sil butonu için)
    if(typeof allIcons !== 'undefined') allIcons.push(el);
    
    const uiLayer = document.getElementById('ui-layer');
    if(uiLayer) uiLayer.appendChild(el);
    else workArea.appendChild(el);
}

function addCallout(co){
    const workArea = document.getElementById('workArea') || document.getElementById('canvas-container') || document.querySelector('.main-preview');
    if(!workArea) { alert('Canvas alanı bulunamadı!'); return; }
    
    const wrap = document.createElement('div');
    wrap.className = 'callout-wrap';
    wrap.style.cssText = `
        position: absolute;
        left: 100px;
        top: 100px;
        z-index: 100;
    `;
    
    const el = document.createElement('div');
    el.className = 'callout-item ' + (co.customClass || '');
    el.style.cssText = `
        background: ${co.bg || 'transparent'};
        color: ${co.color || '#000'};
        border: ${co.border || 'none'};
        border-radius: ${co.radius !== undefined ? co.radius + (typeof co.radius === 'number' ? 'px' : '') : '0px'};
        padding: ${co.padding || '0'};
        font-size: ${co.fontSize || 16}px;
        font-weight: ${co.fontWeight || 'normal'};
        ${co.letterSpacing !== undefined ? 'letter-spacing: ' + co.letterSpacing + ';' : ''}
        ${co.shadow !== undefined ? 'box-shadow: ' + co.shadow + ';' : ''}
        font-family: 'Montserrat', sans-serif;
        ${co.borderBottom ? 'border-bottom: ' + co.borderBottom + ';' : ''}
        ${co.borderTop ? 'border-top: ' + co.borderTop + ';' : ''}
        ${co.backdropFilter ? 'backdrop-filter: ' + co.backdropFilter + ';' : ''}
        white-space: nowrap;
        user-select: none;
        transform-origin: top left;
    `;
    el.textContent = co.text;
      if (co['--co-bg']) el.style.setProperty('--co-bg', co['--co-bg']);
      if (co['--co-bc']) el.style.setProperty('--co-bc', co['--co-bc']);
      if (co['--co-bw']) el.style.setProperty('--co-bw', co['--co-bw']);
      if (co['--co-dot']) el.style.setProperty('--co-dot', co['--co-dot']);
      if (co['--co-len']) el.style.setProperty('--co-len', co['--co-len']);
      if (co['--co-bg-color']) el.style.setProperty('--co-bg-color', co['--co-bg-color']);
      if (co['--co-border-color']) el.style.setProperty('--co-border-color', co['--co-border-color']);
      if (co['--co-border-width']) el.style.setProperty('--co-border-width', co['--co-border-width']);
      if (co['--co-tail-size']) el.style.setProperty('--co-tail-size', co['--co-tail-size']);
      if (co['--co-tail-pos']) el.style.setProperty('--co-tail-pos', co['--co-tail-pos']);
    
    const controls = document.createElement('div');
    controls.className = 'callout-controls';
    controls.style.display = 'none';
    controls.innerHTML = `
        <button class="cbtn cbtn-arr-up" title="Oku Uzat"><i class="fas fa-arrow-down"></i></button>
        <button class="cbtn cbtn-arr-down" title="Oku Kısalt"><i class="fas fa-arrow-up"></i></button>
        <button class="cbtn cbtn-edit" title="Metni Düzenle"><i class="fas fa-edit"></i></button>
        <button class="cbtn cbtn-del" title="Sil"><i class="fas fa-trash"></i></button>
    `;
    
    const resizer = document.createElement('div');
    resizer.className = 'callout-resizer';
    resizer.style.display = 'none';
    
    const selectBorder = document.createElement('div');
    selectBorder.className = 'callout-select-border';
    selectBorder.style.display = 'none';
    
    wrap.appendChild(selectBorder);
    wrap.appendChild(el);
    wrap.appendChild(controls);
    wrap.appendChild(resizer);
    
    // Dataset for scaling
    el.dataset.scale = 1;
    el.dataset.baseFontSize = co.fontSize;
    el.dataset.basePaddingV = parseInt(co.padding.split(' ')[0]) || 0;
    el.dataset.basePaddingH = parseInt(co.padding.split(' ')[1] || co.padding.split(' ')[0]) || 0;

        function applyScale(scale){
        el.dataset.scale = scale;
        // Zoom property scales everything proportionally (text, padding, borders, pseudo-elements like arrows)
        el.style.zoom = scale;
        
        // Update the resizer and selection border to match the new size immediately
        setTimeout(() => {
            if(window.selectedEl === el) selectCallout();
        }, 10);
    }
    
    // SEÇİM YÖNETİMİ
    function selectCallout(){
        document.querySelectorAll('.callout-controls').forEach(function(c){ c.style.display = 'none'; });
        document.querySelectorAll('.callout-resizer').forEach(function(c){ c.style.display = 'none'; });
        document.querySelectorAll('.callout-select-border').forEach(function(c){ c.style.display = 'none'; });
        controls.style.display = 'flex';
        resizer.style.display = 'block';
        selectBorder.style.display = 'block';
    }
    
    wrap.addEventListener('mousedown', function(e){
        if(!e.target.closest('.callout-controls') && !e.target.closest('.callout-resizer')){
            selectCallout();
        }
    });
    
    // Dışarı tıkla → gizle
    document.addEventListener('mousedown', function(e){
        if(!wrap.contains(e.target)){
            controls.style.display = 'none';
            resizer.style.display = 'none';
            selectBorder.style.display = 'none';
        }
    });
    
    // BUTON: Düzenle
    controls.querySelector('.cbtn-edit').addEventListener('click', function(e){
        e.stopPropagation();
        const newText = prompt('Metni düzenle:', el.textContent);
        if(newText !== null && newText.trim()) el.textContent = newText;
    });
    
    // BUTON: Sil
    controls.querySelector('.cbtn-del').addEventListener('click', function(e){
        e.stopPropagation();
        wrap.remove();
    });
    
    // Çift tık → Düzenle
    el.addEventListener('dblclick', function(e){
        e.stopPropagation();
        const newText = prompt('Metni düzenle:', this.textContent);
        if(newText !== null && newText.trim()) this.textContent = newText;
    });
    
    // Sağ tık → Sil
    wrap.addEventListener('contextmenu', function(e){
        e.preventDefault();
        e.stopPropagation();
        wrap.remove();
    });
    
    // SÜRÜKLEME
    let isDragging = false, dsx, dsy, dix, diy;
    wrap.addEventListener('mousedown', function(e){
        if(e.button !== 0) return;
        if(e.target.closest('.callout-controls')) return;
        if(e.target.closest('.callout-resizer')) return;
        isDragging = true;
        dsx = e.clientX; dsy = e.clientY;
        dix = parseInt(wrap.style.left) || 0;
        diy = parseInt(wrap.style.top) || 0;
        e.preventDefault();
    });
    document.addEventListener('mousemove', function(e){
        if(!isDragging) return;
        wrap.style.left = (dix + e.clientX - dsx) + 'px';
        wrap.style.top = (diy + e.clientY - dsy) + 'px';
    });
    document.addEventListener('mouseup', function(){ isDragging = false; });
    
    // BOYUTLANDIRMA (Köşeden çekme)
    let isResizing = false, rsx, rsy, startWidth, startScale;
    resizer.addEventListener('mousedown', function(e){
        e.stopPropagation();
        e.preventDefault();
        isResizing = true;
        rsx = e.clientX;
        rsy = e.clientY;
        startWidth = el.getBoundingClientRect().width;
        startScale = parseFloat(el.dataset.scale) || 1;
    });
    document.addEventListener('mousemove', function(e){
        if(!isResizing) return;
        const dx = e.clientX - rsx;
        const dy = e.clientY - rsy;
        // İki eksenin ortalaması (diyagonal çekme hissi)
        const delta = (dx + dy) / 2;
        // Ölçek değişimi: her 100px için 0.5 ölçek
        const newScale = Math.max(0.3, Math.min(4, startScale + (delta / 200)));
        applyScale(newScale);
    });
    document.addEventListener('mouseup', function(){ isResizing = false; });
    
    const uiLayer = document.getElementById('ui-layer');
    if(uiLayer) uiLayer.appendChild(wrap);
    else workArea.appendChild(wrap);
    setTimeout(function(){ selectCallout(); }, 50);
    
    console.log('✅ Callout eklendi:', co.text);
}

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

    const iconColor = '#93c5fd';
    const textColor = '#ffffff';
    const bgColor = '#0d1b2e';
    const bgOpacity = 0; // Default transparent
    const iconSize = 64;
    const textSize = 14;
    const glowPct = 80;
    const radius = 12;
    const padding = 10;
    const boxSize = 140; // Uniform box size for all icons
    
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
        left: 120px;
        top: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 12px;
        cursor: move;
        z-index: 200;
        user-select: none;
        padding: ${padding}px;
        border-radius: ${radius}px;
        background: transparent;
        border: none;
        width: ${boxSize}px;
        height: ${boxSize}px;
    `;

    // Parlaklık değerine göre 2 kademeli drop-shadow
    const glowPx1 = Math.round(glowPct * 0.15); // Örn: 12px
    const glowPx2 = Math.round(glowPct * 0.3);  // Örn: 24px

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

    // Sürükleme
    makeDraggable(el);

    // Tek tık → seç + panel aç
    el.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        selectCalloutEl(el);
        e.stopPropagation();
    });

    // Sağ tık → sil
    el.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        const idx = typeof allIcons !== 'undefined' ? allIcons.indexOf(el) : -1;
        if (idx > -1) allIcons.splice(idx, 1);
        el.remove();
        closeCalloutPanel();
    });

    // allIcons'a kaydet
    if (typeof allIcons !== 'undefined') allIcons.push(el);

    workArea.appendChild(el);
    selectCalloutEl(el);
}

function selectCalloutEl(el) {
    // Diğer seçimleri kaldır
    document.querySelectorAll('.co-neon-block').forEach(e => e.style.outline = 'none');
    el.style.outline = '1px dashed rgba(255,255,255,0.4)';

    selectedCalloutEl = el;

    // Paneli doldur ve göster
    const panel = document.getElementById('calloutSettingsPanel');
    if (!panel) return;

    // Callout sekmesi aktif değilse, oraya geç
    const tab = document.getElementById('tab-callout');
    if (tab && tab.style.display === 'none') {
        if (typeof switchTab === 'function') switchTab('callout');
    }

    // Mevcut değerleri panele yükle
    const d = el.dataset;
    const ic = document.getElementById('coIconColor');
    const tc = document.getElementById('coTextColor');
    const bc = document.getElementById('coBgColor');
    const bop = document.getElementById('coBgOpacity');
    const is = document.getElementById('coIconSize');
    const ts = document.getElementById('coTextSize');
    const gw = document.getElementById('coGlow');
    const rd = document.getElementById('coRadius');
    const pd = document.getElementById('coPadding');
    const lt = document.getElementById('coLabelText');

    if (ic) ic.value = d.coIconColor || '#93c5fd';
    if (tc) tc.value = d.coTextColor || '#ffffff';
    if (bc) bc.value = d.coBgColor || '#0d1b2e';
    if (bop) { bop.value = d.coBgOpacity || 0; document.getElementById('coBgOpacityVal').textContent = bop.value + '%'; }
    if (is) { is.value = d.coIconSize || 64; document.getElementById('coIconSizeVal').textContent = is.value + 'px'; }
    if (ts) { ts.value = d.coTextSize || 14; document.getElementById('coTextSizeVal').textContent = ts.value + 'px'; }
    if (gw) { gw.value = d.coGlow || 80; document.getElementById('coGlowVal').textContent = gw.value + '%'; }
    if (rd) { rd.value = d.coRadius || 12; document.getElementById('coRadiusVal').textContent = rd.value + 'px'; }
    if (pd) { pd.value = d.coPadding || 10; document.getElementById('coPaddingVal').textContent = pd.value + 'px'; }
    if (lt) lt.value = (d.coLabel || '').replace('\n', ' ');

    panel.style.display = 'block';
}

function closeCalloutPanel() {
    selectedCalloutEl = null;
    document.querySelectorAll('.co-neon-block').forEach(e => e.style.outline = 'none');
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
    const glowPx1 = Math.round(glowPct * 0.15);
    const glowPx2 = Math.round(glowPct * 0.3);

    // İkon güncelle
    const iconEl = el.querySelector('i');
    if (iconEl) {
        iconEl.style.fontSize = iconSize + 'px';
        iconEl.style.color = iconColor;
        iconEl.style.filter = `drop-shadow(0 0 ${glowPx1}px ${iconColor}) drop-shadow(0 0 ${glowPx2}px ${iconColor})`;
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
    const bgOpacity = parseInt(document.getElementById('coBgOpacity')?.value || 0);
    const iconSize = parseInt(document.getElementById('coIconSize')?.value || 64);
    const textSize = parseInt(document.getElementById('coTextSize')?.value || 14);
    const glowPct = parseInt(document.getElementById('coGlow')?.value || 80);
    const radius = parseInt(document.getElementById('coRadius')?.value || 12);
    const padding = parseInt(document.getElementById('coPadding')?.value || 10);
    const labelRaw = document.getElementById('coLabelText')?.value || '';

    // Dataset güncelle
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
}

function resetCalloutSetting(type) {
    if (!selectedCalloutEl) return;
    const defaults = {
        'iconColor': '#93c5fd',
        'textColor': '#ffffff',
        'bgColor': '#0d1b2e',
        'bgOpacity': 0,
        'iconSize': 64,
        'textSize': 14,
        'glow': 80,
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
            applyCalloutSettings();
        }
    }
}

function deleteSelectedCallout() {
    if (!selectedCalloutEl) return;
    const idx = typeof allIcons !== 'undefined' ? allIcons.indexOf(selectedCalloutEl) : -1;
    if (idx > -1) allIcons.splice(idx, 1);
    selectedCalloutEl.remove();
    closeCalloutPanel();
}

