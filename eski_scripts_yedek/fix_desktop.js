const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const desktopFix = `
        /* ===== DESKTOP HAMBURGER HIDER ===== */
        @media (min-width: 993px) {
            .mobile-menu-panel, .mobile-menu-backdrop { display: none !important; }
        }
`;

if (!html.includes('DESKTOP HAMBURGER HIDER')) {
    html = html.replace('/* ===== RESPONSIVE ===== */', desktopFix + '\n        /* ===== RESPONSIVE ===== */');
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('Desktop fix applied.');
}
