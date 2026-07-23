const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

const mobileMenuCSS = `
/* Mobile Menu Panel */
.mobile-menu-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
    z-index: 9999999; display: none; opacity: 0; transition: opacity 0.3s;
}
.mobile-menu-overlay.active { display: block; opacity: 1; }

.mobile-menu-panel {
    position: fixed; top: 0; right: -300px; width: 280px; height: 100vh;
    background: #0a0a1a; z-index: 10000000; transition: right 0.3s ease;
    display: flex; flex-direction: column; box-shadow: -5px 0 25px rgba(0,0,0,0.5);
}
.mobile-menu-panel.active { right: 0; }

.mobile-menu-panel .menu-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);
}
.mobile-menu-panel .close-menu-btn {
    background: transparent; border: none; color: white; font-size: 28px; cursor: pointer;
}

@media (max-width: 768px) {
    /* Hide floating items on mobile by default to prevent clutter */
    body > #modeBanner, body > .help-assistant-fab {
        display: none !important;
    }
    
    /* Show them when moved inside the mobile menu */
    .mobile-menu-panel #modeBanner {
        display: flex !important; position: static !important; width: 90% !important; margin: 20px auto !important; transform: none !important;
    }
    .mobile-menu-panel .help-assistant-fab {
        display: flex !important; position: static !important; width: 90% !important; margin: 0 auto !important; border-radius: 8px !important;
        justify-content: center; gap: 8px; font-size: 14px; padding: 12px !important; height: auto !important;
    }
}
`;

if (!css.includes('mobile-menu-panel')) {
    css += '\n' + mobileMenuCSS;
    fs.writeFileSync('styles.css', css, 'utf8');
    console.log('Added mobile menu CSS');
}

let html = fs.readFileSync('app.html', 'utf8');

const oldToggleFn = `function toggleMobileMenu() {
    console.log('Mobile menu toggled');
    // We can copy the side-panel logic from index.html here later if needed
    alert('Menü yakında eklenecek!');
}`;

const newToggleFn = `function toggleMobileMenu() {
    let menu = document.getElementById('mobileMenuPanel');
    let overlay = document.getElementById('mobileMenuOverlay');
    
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'mobileMenuPanel';
        menu.className = 'mobile-menu-panel';
        menu.innerHTML = \`
            <div class="menu-header">
                <div style="font-weight:bold; font-size:18px; color:#fff;">Menü</div>
                <button class="close-menu-btn" onclick="toggleMobileMenu()">×</button>
            </div>
            <div class="menu-content" id="mobileMenuContent" style="display:flex; flex-direction:column; gap: 15px; padding-top:15px;">
                <a href="index.html" class="menu-link" style="display:block; padding:0 20px; color:#cbd5e1; text-decoration:none; font-size: 16px;"><i class="fa-solid fa-home"></i> Ana Sayfa</a>
                <hr style="border-color: rgba(255,255,255,0.1); margin: 5px 20px;">
            </div>
        \`;
        document.body.appendChild(menu);
        
        overlay = document.createElement('div');
        overlay.id = 'mobileMenuOverlay';
        overlay.className = 'mobile-menu-overlay';
        overlay.onclick = toggleMobileMenu;
        document.body.appendChild(overlay);
    }

    const isActive = menu.classList.contains('active');
    
    if (isActive) {
        menu.classList.remove('active');
        overlay.classList.remove('active');
    } else {
        menu.classList.add('active');
        overlay.classList.add('active');
        
        // Move banner and assistant into the menu content
        const banner = document.getElementById('modeBanner');
        const assistant = document.querySelector('.help-assistant-fab');
        const content = document.getElementById('mobileMenuContent');
        
        if (banner && banner.parentNode !== content) {
            content.appendChild(banner);
        }
        
        if (assistant && assistant.parentNode !== content) {
            assistant.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Akıllı Asistan';
            content.appendChild(assistant);
        }
    }
}`;

if (html.includes('alert(\'Menü yakında eklenecek!\');')) {
    html = html.replace(oldToggleFn, newToggleFn);
    
    // Invalidate cache
    const newTimestamp = Date.now();
    html = html.replace(/styles\.css\?v=\d+/, `styles.css?v=${newTimestamp}`);
    html = html.replace(/main\.js\?v=\d+/, `main.js?v=${newTimestamp}`);
    
    fs.writeFileSync('app.html', html, 'utf8');
    console.log('Replaced toggleMobileMenu logic in app.html');
} else {
    console.log('toggleMobileMenu not found or already replaced');
}
