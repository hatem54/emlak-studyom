
function switchTab(name){
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
}

window.closeBottomSheet = function() {
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.panel>.dynamic-field').forEach(f => f.classList.remove('show'));
        document.querySelectorAll('#mainTabs .tab-btn').forEach(b => b.classList.remove('active'));
        const mo = document.getElementById('mobileSheetOverlay');
        if (mo) { mo.style.display = 'none'; mo.style.opacity = '0'; }
    }
};
