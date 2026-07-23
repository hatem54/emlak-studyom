const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The mockup is inside .hero-visual
const extraCSS = `
            .hero-visual {
                display: none !important;
            }
            .hero {
                padding-bottom: 40px !important;
            }
`;

if (!html.includes('.hero-visual {\\n                display: none !important;')) {
    html = html.replace('@media (max-width: 768px) {', '@media (max-width: 768px) {\n' + extraCSS);
}

// Replace missing assets/demo/mockup- images
html = html.replace(/src="assets\/demo\/mockup-[^"]*\.jpg"/g, 'src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Mobil düzeltmeleri güvenle uygulandı');
