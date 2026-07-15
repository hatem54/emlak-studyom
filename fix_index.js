const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Fix CSS
html = html.replace(/\.modal-overlay\.active\s*\{\s*display:\s*flex;\s*\}/, '.modal-overlay.active { display: flex !important; }');

// Bust auth.js cache
html = html.replace(/src="js\/auth\.js"/, 'src="js/auth.js?v=' + Date.now() + '"');

// Hide nav-buttons on mobile
html = html.replace(/\.nav-links\s*\{\s*display:\s*none;\s*\}/g, '.nav-links, .nav-buttons {\n                display: none;\n            }');

fs.writeFileSync('index.html', html);
console.log('Fixed CSS, bumped cache, and hid nav-buttons');
