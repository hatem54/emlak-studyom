const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. FIX SYNTAX ERROR IN TOGGLE MOBILE MENU
const startIdx = html.indexOf('function toggleMobileMenu()');
const changeMockupIdx = html.indexOf('function changeMockupStep');

if (startIdx !== -1 && changeMockupIdx !== -1) {
    const fixedFunction = `function toggleMobileMenu() {
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
                if(icon) icon.className = 'fas fa-times';
            }
        }

        `;
    
    html = html.substring(0, startIdx) + fixedFunction + html.substring(changeMockupIdx);
}

// 2. OPAQUE PANEL & BACKDROP
html = html.replace('background: var(--dark-2);\n                z-index: 1001;', 'background: #0a0a1a !important;\n                z-index: 1001;\n                opacity: 1 !important;');
html = html.replace('background: rgba(0, 0, 0, 0.6);\n                backdrop-filter: blur(4px);', 'background: rgba(0, 0, 0, 0.7);\n                backdrop-filter: blur(4px);');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Syntax error fixed and menu stylized');
