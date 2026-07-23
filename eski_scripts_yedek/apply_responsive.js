const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. REWRITE RESPONSIVE CSS
const responsiveCSS = `
        /* ===== RESPONSIVE ===== */
        
        /* Utility for mobile menu open state */
        body.menu-open {
            overflow: hidden;
        }

        @media (max-width: 1200px) {
            .hero-content { padding: 0 20px; }
            .hero h1 { font-size: 56px; }
            .navbar { padding: 12px 30px !important; }
        }

        @media (max-width: 992px) {
            .navbar {
                padding: 12px 20px !important;
            }
            .nav-links, .nav-buttons {
                display: none;
            }
            .mobile-menu-btn {
                display: block;
                z-index: 1001;
            }

            /* Mobile Menu Overlay */
            .mobile-menu-overlay {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(10, 10, 26, 0.98);
                z-index: 1000;
                display: flex;
                flex-direction: column;
                padding: 80px 24px 40px;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                overflow-y: auto;
            }
            .mobile-menu-overlay.active {
                transform: translateX(0);
            }
            .mobile-menu-overlay .nav-links {
                display: flex;
                flex-direction: column;
                gap: 20px;
                list-style: none;
                margin-bottom: 40px;
            }
            .mobile-menu-overlay .nav-links li a {
                color: white;
                text-decoration: none;
                font-size: 20px;
                font-weight: 500;
            }
            .mobile-menu-overlay .nav-buttons {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            .mobile-menu-overlay .btn-ghost, 
            .mobile-menu-overlay .btn-primary {
                width: 100%;
                text-align: center;
                padding: 15px;
                font-size: 16px;
            }

            /* Hero Section */
            .hero {
                padding-top: 100px;
                min-height: auto !important;
                padding-bottom: 60px;
            }
            .hero-content {
                grid-template-columns: 1fr;
                text-align: center;
                gap: 40px;
            }
            .hero-left {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .hero h1 {
                font-size: 48px;
            }
            .hero-desc {
                max-width: 100% !important;
                margin-left: auto;
                margin-right: auto;
            }
            .hero-actions {
                justify-content: center;
                flex-wrap: wrap;
                gap: 15px;
            }
            .hero-stats {
                justify-content: center;
                flex-wrap: wrap;
            }
            .hero-visual {
                max-width: 100%;
                margin: 0 auto;
            }
            .hero-float-card {
                display: none; /* Hide floating cards on tablet/mobile to prevent overflow */
            }

            /* Sections & Grids */
            .section {
                padding: 60px 20px;
            }
            .features-grid, .pricing-grid, .testimonials-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
            }
            .steps-grid {
                grid-template-columns: 1fr;
                gap: 30px;
            }
            .steps-line {
                display: none;
            }
            .footer-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 30px;
            }
        }

        @media (max-width: 768px) {
            .hero h1 {
                font-size: 36px !important;
            }
            .hero-actions {
                flex-direction: column;
                width: 100%;
            }
            .btn-hero {
                width: 100%;
                justify-content: center;
            }
            .hero-stat-number {
                font-size: 24px;
            }
            
            .features-grid, .pricing-grid, .testimonials-grid {
                grid-template-columns: 1fr;
                max-width: 500px;
                margin: 0 auto;
            }
            
            .pricing-card.featured {
                transform: none;
            }
            .pricing-card.featured:hover {
                transform: translateY(-8px);
            }

            .section-title {
                font-size: 28px;
            }
            
            .footer-grid {
                grid-template-columns: 1fr;
                text-align: center;
            }
            .footer-links ul {
                align-items: center;
            }
        }

        @media (max-width: 576px) {
            .hero {
                padding-top: 90px;
            }
            .hero h1 {
                font-size: 32px !important;
            }
            .section-title {
                font-size: 24px;
            }
            .mockup-header {
                padding: 8px 12px;
            }
            .mockup-body {
                height: 300px;
            }
            .btn-ghost, .btn-primary {
                padding: 10px 16px;
                font-size: 14px;
            }
        }
    </style>`;

// Replace existing responsive block
html = html.replace(/\/\*\s*=====\s*RESPONSIVE\s*=====\s*\*\/[\s\S]*?<\/style>/, responsiveCSS);

// 2. INJECT MOBILE OVERLAY HTML IF NOT EXISTS
const overlayHTML = `
    <div class="mobile-menu-overlay" id="mobileMenuOverlay">
        <ul class="nav-links">
            <li><a href="#features" onclick="toggleMobileMenu()">Özellikler</a></li>
            <li><a href="#demo" onclick="toggleMobileMenu()">Demo</a></li>
            <li><a href="#how-it-works" onclick="toggleMobileMenu()">Nasıl Çalışır</a></li>
            <li><a href="#pricing" onclick="toggleMobileMenu()">Fiyatlandırma</a></li>
            <li><a href="#faq" onclick="toggleMobileMenu()">SSS</a></li>
        </ul>
        <div class="nav-buttons">
            <button class="btn-ghost" onclick="toggleMobileMenu(); openModal('login')">Giriş Yap</button>
            <button class="btn-primary" onclick="toggleMobileMenu(); goToDemo()">Ücretsiz Dene</button>
        </div>
    </div>
`;
if (!html.includes('id="mobileMenuOverlay"')) {
    html = html.replace('<!-- Hero -->', overlayHTML + '\n    <!-- Hero -->');
}

// 3. REWRITE TOGGLE FUNCTION
const newToggleFunction = `
        function toggleMobileMenu() {
            const overlay = document.getElementById('mobileMenuOverlay');
            const icon = document.querySelector('.mobile-menu-btn i');
            
            if (overlay.classList.contains('active')) {
                overlay.classList.remove('active');
                document.body.classList.remove('menu-open');
                icon.className = 'fas fa-bars';
            } else {
                overlay.classList.add('active');
                document.body.classList.add('menu-open');
                icon.className = 'fas fa-times';
            }
        }
`;
html = html.replace(/function toggleMobileMenu\(\)\s*\{[\s\S]*?\n\s*\}/, newToggleFunction.trim());

// 4. FIX .mobile-menu-btn DISPLAY BUG IN EXISTING CSS
html = html.replace(/\.mobile-menu-btn\s*\{\s*display:\s*none;/, '.mobile-menu-btn { display: none;'); // Clean just in case
// Note: We already redefine .mobile-menu-btn in the media queries correctly.

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully applied responsive fixes to index.html');
