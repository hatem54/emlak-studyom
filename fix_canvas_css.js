const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

// The canvas override was too aggressive and broke the layout
css = css.replace(/canvas\s*\{\s*width:\s*100%\s*!important;\s*height:\s*auto\s*!important;\s*max-height:\s*100%\s*!important;\s*transform:\s*none\s*!important;\s*display:\s*block\s*!important;\s*margin:\s*0\s*auto\s*!important;\s*\}/, '');

// The canvas-wrapper override was also breaking resizeCanvas() dimension logic
css = css.replace(/\.canvas-wrapper\s*\{[^}]+\}/, '.canvas-wrapper { margin: 0 auto !important; position: relative !important; }');

fs.writeFileSync('styles.css', css, 'utf8');
console.log('Canvas CSS override fixed');
