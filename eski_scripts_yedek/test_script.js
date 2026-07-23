
// Dummy function for toggleMobileMenu to prevent Uncaught ReferenceError
function toggleMobileMenu() {
    let menu = document.getElementById('mobileMenuPanel');
    let overlay = document.getElementById('mobileMenuOverlay');
    
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'mobileMenuPanel';
        menu.className = 'mobile-menu-panel';
        menu.innerHTML = `
            <div class="menu-header">
                <div style="font-weight:bold; font-size:18px; color:#fff;">Menü</div>
                <button class="close-menu-btn" onclick="toggleMobileMenu()">×</button>
            </div>
            <div class="menu-content" id="mobileMenuContent" style="display:flex; flex-direction:column; gap: 15px; padding-top:15px;">
                <a href="index.html" class="menu-link" style="display:block; padding:0 20px; color:#cbd5e1; text-decoration:none; font-size: 16px;"><i class="fa-solid fa-home"></i> Ana Sayfa</a>
                
                <hr style="border-color: rgba(255,255,255,0.1); margin: 5px 20px;">
                <button id="resetRedirectBtn" class="menu-link mobile-only" style="display:none; padding:0 20px; color:#cbd5e1; text-decoration:none; font-size: 16px; background:transparent; border:none; text-align:left; cursor:pointer; width:100%; margin-top:10px;">
                    <i class="fa-solid fa-rotate-right"></i> Normal Görünüme Dön
                </button>
            </div>
        `;
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
}
