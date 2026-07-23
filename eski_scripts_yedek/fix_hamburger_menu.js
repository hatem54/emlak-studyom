const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. REWRITE HTML
const newOverlayHTML = `
    <div class="mobile-menu-backdrop" id="mobileMenuBackdrop" onclick="toggleMobileMenu()"></div>
    <div class="mobile-menu-panel" id="mobileMenuPanel">
        <div class="mobile-menu-header">
            <button class="mobile-close-btn" onclick="toggleMobileMenu()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="mobile-menu-content">
            <div class="mobile-menu-actions">
                <button class="btn-ghost" onclick="toggleMobileMenu(); openModal('login')" style="width: 100%; justify-content: center; margin-bottom: 10px; border: 1px solid rgba(0, 206, 201, 0.3); color: #00CEC9;">Giriş Yap</button>
                <button class="btn-primary" onclick="toggleMobileMenu(); goToDemo()" style="width: 100%; justify-content: center;">Ücretsiz Dene</button>
            </div>
            
            <div class="mobile-menu-divider"></div>
            
            <ul class="mobile-nav-links">
                <li><a href="#features" onclick="toggleMobileMenu()">Özellikler</a></li>
                <li><a href="#pricing" onclick="toggleMobileMenu()">Fiyatlandırma</a></li>
                <li><a href="#faq" onclick="toggleMobileMenu()">SSS</a></li>
            </ul>
        </div>
    </div>
`;

// Remove the old overlay
html = html.replace(/<div class="mobile-menu-overlay" id="mobileMenuOverlay">[\s\S]*?<\/div>\s*<!-- Hero -->/, newOverlayHTML + '\n    <!-- Hero -->');

// 2. REWRITE CSS
// We need to add styles for the new panel and backdrop.
const newPanelCSS = `
            /* Mobile Menu Panel */
            .mobile-menu-backdrop {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
                z-index: 1000;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }
            .mobile-menu-backdrop.active {
                opacity: 1;
                pointer-events: auto;
            }

            .mobile-menu-panel {
                position: fixed;
                top: 0; right: -280px;
                width: 280px;
                height: 100vh;
                background: var(--dark-2);
                z-index: 1001;
                box-shadow: -5px 0 25px rgba(0,0,0,0.5);
                transition: right 0.3s ease;
                display: flex;
                flex-direction: column;
            }
            .mobile-menu-panel.active {
                right: 0;
            }

            .mobile-menu-header {
                display: flex;
                justify-content: flex-end;
                padding: 20px;
            }
            
            .mobile-close-btn {
                background: transparent;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: rgba(255,255,255,0.05);
            }

            .mobile-menu-content {
                padding: 0 20px 20px 20px;
                flex: 1;
                overflow-y: auto;
            }

            .mobile-menu-divider {
                height: 1px;
                background: rgba(255,255,255,0.1);
                margin: 20px 0;
            }

            .mobile-nav-links {
                list-style: none;
                padding: 0;
                margin: 0;
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .mobile-nav-links li a {
                color: var(--text);
                text-decoration: none;
                font-size: 18px;
                font-weight: 500;
                display: flex;
                align-items: center;
                min-height: 48px;
                padding: 0 10px;
                border-radius: 8px;
                transition: background 0.2s;
            }

            .mobile-nav-links li a:active {
                background: rgba(255,255,255,0.05);
            }
`;

// Insert the CSS inside the @media (max-width: 992px)
// Let's replace the old overlay CSS
html = html.replace(/\/\* Mobile Menu Overlay \*\/[\s\S]*?\/\* Hero Section \*\//, newPanelCSS + '\n\n            /* Hero Section */');


// 3. REWRITE JS TOGGLE FUNCTION
const newToggleScript = `
        function toggleMobileMenu() {
            const panel = document.getElementById('mobileMenuPanel');
            const backdrop = document.getElementById('mobileMenuBackdrop');
            const icon = document.querySelector('.mobile-menu-btn i');
            
            if (panel.classList.contains('active')) {
                panel.classList.remove('active');
                if(backdrop) backdrop.classList.remove('active');
                document.body.classList.remove('menu-open');
                if(icon) icon.className = 'fas fa-bars';
            } else {
                panel.classList.add('active');
                if(backdrop) backdrop.classList.add('active');
                document.body.classList.add('menu-open');
                if(icon) icon.className = 'fas fa-times'; // Even though we have an X in the panel, we can update the header icon too
            }
        }
`;

html = html.replace(/function toggleMobileMenu\(\)\s*\{[\s\S]*?\n\s*\}/, newToggleScript.trim());


fs.writeFileSync('index.html', html, 'utf8');
console.log('Hamburger menu fix applied');
