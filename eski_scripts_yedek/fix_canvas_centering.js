const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

// The first `.canvas-wrapper` block:
// .canvas-wrapper { margin: 0 auto !important; position: relative !important; }
// I will ensure it's there.

if (!css.includes('.canvas-wrapper { margin: 0 auto !important; position: relative !important; }')) {
    css += '\n.canvas-wrapper { margin: 0 auto !important; position: relative !important; }\n';
}

// Now I will remove the problematic `.canvas-wrapper` block inside the media query
const mediaWrapperRegex = /\.canvas-wrapper\s*\{\s*width:\s*100%\s*!important;\s*min-width:\s*100vw\s*!important;\s*height:\s*100%\s*!important;\s*padding:\s*0\s*!important;\s*margin:\s*0\s*!important;\s*display:\s*flex\s*!important;\s*justify-content:\s*center\s*!important;\s*align-items:\s*center\s*!important;\s*\}/g;

css = css.replace(mediaWrapperRegex, '');

// Wait, the regex might fail due to whitespace variations. Let's use a simpler one.
css = css.replace(/\.canvas-wrapper\s*\{\s*width:\s*100%\s*!important;\s*min-width:\s*100vw\s*!important;[\s\S]*?align-items:\s*center\s*!important;\s*\}/g, '');

fs.writeFileSync('styles.css', css, 'utf8');
console.log('Fixed canvas-wrapper mobile overrides');
