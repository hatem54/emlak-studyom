const fs = require('fs');

let corejs = fs.readFileSync('core.js', 'utf8');

// 1. Fix resizeCanvas math
const oldResizeCanvasRegex = /function resizeCanvas\(\)\s*\{[\s\S]*?canvasEl\.style\.transform='scale'\+scaleFactor\+'\)';/m;

const newResizeCanvas = `function resizeCanvas(){
    const w=document.querySelector('.canvas-wrapper');
    const pa=document.querySelector('.preview-area');
    if(!w || !pa) return;
    
    // FORCE portrait on mobile for accurate math regardless of cached main.js
    let canvasW = 1920;
    let canvasH = 1080;
    if (window.innerWidth <= 768) {
        canvasW = 1080;
        canvasH = 1920;
        // Make sure inline styles match so no mismatch occurs
        if(canvasEl) { canvasEl.style.width = '1080px'; canvasEl.style.height = '1920px'; }
    } else {
        canvasW = parseInt(canvasEl.style.width) || 1920;
        canvasH = parseInt(canvasEl.style.height) || 1080;
    }
    
    const availableW = pa.clientWidth - 40; // padding
    const availableH = window.innerHeight - 150; // padding for top bar/margins
    
    const scaleW = availableW / canvasW;
    const scaleH = availableH / canvasH;
    
    scaleFactor = Math.min(scaleW, scaleH);
    
    w.style.width = (canvasW * scaleFactor) + 'px';
    w.style.height = (canvasH * scaleFactor) + 'px';
    w.style.aspectRatio = 'auto'; // Remove aspect ratio since height is fixed
    
    // Center it visually in wrapper using CSS flex or just relying on wrapper
    canvasEl.style.transform='scale('+scaleFactor+')';
`;

if (corejs.match(oldResizeCanvasRegex)) {
    corejs = corejs.replace(oldResizeCanvasRegex, newResizeCanvas);
    console.log('Fixed resizeCanvas math in core.js');
} else {
    console.log('Could not match resizeCanvas in core.js');
}

// 2. Fix switchTab to allow toggling off on mobile
const oldSwitchTabRegex = /function switchTab\(name\)\s*\{[\s\S]*?canvaRenderLayer\.style\.display = 'none';\s*\} else if\(typeof isCanvaMode !== 'undefined' && isCanvaMode\) \{\s*canvaRenderLayer\.style\.display = 'block';\s*photoLayer\.style\.display = 'none';\s*\}\s*\}/m;

const newSwitchTab = `function switchTab(name){
    const isMobile = window.innerWidth <= 768;
    const btn = document.querySelector('#mainTabs .tab-btn[data-tab="'+name+'"]');
    const isAlreadyActive = btn && btn.classList.contains('active');

    if (isMobile && isAlreadyActive) {
        // Toggle OFF if already active on mobile
        btn.classList.remove('active');
        const panel = document.getElementById('tab-'+name);
        if (panel) panel.classList.remove('show');
        
        // Hide overlay if it exists
        const mo = document.getElementById('mobileSheetOverlay');
        if (mo) { mo.style.display = 'none'; mo.style.opacity = '0'; }
        return; // stop execution
    }

    document.querySelectorAll('#mainTabs .tab-btn').forEach(b => {
        if(b.dataset.tab === name) b.classList.add('active');
        else b.classList.remove('active');
    });
    
    document.querySelectorAll('.panel>.dynamic-field').forEach(f=>f.classList.remove('show'));
    const targetPanel = document.getElementById('tab-'+name);
    if(targetPanel) targetPanel.classList.add('show');
    
    // Show overlay on mobile when a tab opens
    if (isMobile) {
        const mo = document.getElementById('mobileSheetOverlay');
        if (mo) { mo.style.display = 'block'; mo.style.opacity = '1'; }
    }

    if(name!=='draw' && typeof drawMode !== 'undefined' && drawMode!=='off') setDrawMode('off');
    if(name!=='draw' && typeof cancelDrawEdit==='function') cancelDrawEdit();
    if(name==='callout' && typeof renderCalloutPanel==='function') renderCalloutPanel();

    if(document.getElementById('kolaj-wrapper')){
        const photoLayer = document.getElementById('photo-layer');
        const canvaRenderLayer = document.getElementById('canva-render-layer');
        if(photoLayer) photoLayer.style.display = 'block';
        if(canvaRenderLayer) canvaRenderLayer.style.display = 'none';
    } else if(typeof isCanvaMode !== 'undefined' && isCanvaMode) {
        const photoLayer = document.getElementById('photo-layer');
        const canvaRenderLayer = document.getElementById('canva-render-layer');
        if(canvaRenderLayer) canvaRenderLayer.style.display = 'block';
        if(photoLayer) photoLayer.style.display = 'none';
    }
}`;

if (corejs.match(oldSwitchTabRegex)) {
    corejs = corejs.replace(oldSwitchTabRegex, newSwitchTab);
    console.log('Fixed switchTab toggle logic in core.js');
} else {
    console.log('Could not match switchTab in core.js');
}

fs.writeFileSync('core.js', corejs, 'utf8');

// Invalidate cache
let html = fs.readFileSync('app.html', 'utf8');
const newTimestamp = Date.now();
html = html.replace(/core\.js\?v=\d+/, `core.js?v=${newTimestamp}`);
fs.writeFileSync('app.html', html, 'utf8');
console.log('Invalidated core.js cache in app.html');
