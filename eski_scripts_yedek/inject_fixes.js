const fs = require('fs');

let html = fs.readFileSync('app.html', 'utf8');

const injection = `
<!-- GUARANTEED MOBILE FIXES -->
<style>
@media (max-width: 768px) {
    /* Fix dark overlay hiding the active tab */
    .panel { z-index: 200 !important; }
    .mobile-overlay { z-index: 150 !important; background: rgba(0,0,0,0.4) !important; }
    
    /* Force canvas-wrapper to be perfectly centered */
    .canvas-wrapper {
        margin: 0 auto !important;
        position: relative !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
    }
}
</style>
<script>
(function() {
    function forceMobileCanvas() {
        if (window.innerWidth <= 768) {
            const c = document.getElementById('canvas-container');
            const w = document.querySelector('.canvas-wrapper');
            const pa = document.querySelector('.preview-area');
            if (c && w && pa) {
                // Ensure logical dimensions are strictly portrait
                c.style.width = '1080px';
                c.style.height = '1920px';
                
                // Calculate correct mobile scale
                const availableW = window.innerWidth - 40;
                const availableH = window.innerHeight - 150;
                const scaleFactor = Math.min(availableW / 1080, availableH / 1920);
                
                // Size wrapper to exact visual size
                w.style.width = (1080 * scaleFactor) + 'px';
                w.style.height = (1920 * scaleFactor) + 'px';
                
                // Scale container to fit exactly inside wrapper
                c.style.transformOrigin = 'top left';
                c.style.transform = 'scale(' + scaleFactor + ')';
            }
            
            // Re-apply toggle logic to mainTabs in case core.js cache failed
            document.querySelectorAll('#mainTabs .tab-btn').forEach(btn => {
                // Remove old event listener by replacing node
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                newBtn.addEventListener('click', function(e) {
                    const tabName = this.dataset.tab;
                    const isAlreadyActive = this.classList.contains('active');
                    
                    if (isAlreadyActive) {
                        // TOGGLE OFF
                        this.classList.remove('active');
                        const panel = document.getElementById('tab-' + tabName);
                        if (panel) panel.classList.remove('show');
                        const mo = document.getElementById('mobileSheetOverlay');
                        if (mo) { mo.style.display = 'none'; mo.style.opacity = '0'; }
                    } else {
                        // Normal Switch
                        if(typeof window.switchTab === 'function') window.switchTab(tabName);
                    }
                });
            });
        }
    }
    
    // Run multiple times to guarantee override
    window.addEventListener('resize', forceMobileCanvas);
    document.addEventListener('DOMContentLoaded', forceMobileCanvas);
    setTimeout(forceMobileCanvas, 500);
    setTimeout(forceMobileCanvas, 1500);
    setTimeout(forceMobileCanvas, 3000);
})();
</script>
</body>
`;

if (!html.includes('GUARANTEED MOBILE FIXES')) {
    html = html.replace('</body>', injection);
    
    // Invalidate main files just in case
    const ts = Date.now();
    html = html.replace(/main\.js\?v=\d+/, `main.js?v=${ts}`);
    html = html.replace(/core\.js\?v=\d+/, `core.js?v=${ts}`);
    html = html.replace(/styles\.css\?v=\d+/, `styles.css?v=${ts}`);
    
    fs.writeFileSync('app.html', html, 'utf8');
    console.log('Injected guaranteed fixes into app.html');
} else {
    console.log('Fixes already injected.');
}
