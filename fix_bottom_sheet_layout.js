const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

// Update dynamic-field to sit above the tab bar and not cover it
css = css.replace(/\.dynamic-field\.show\s*\{\s*bottom:\s*0\s*!important;\s*\}/g, '.dynamic-field.show { bottom: 60px !important; }');

// Bring mainTabs to the front so it is never covered by the overlay or bottom sheet
css = css.replace(/#mainTabs\s*\{[^}]+\}/, match => {
    return match.replace(/z-index:\s*\d+\s*!important;/, 'z-index: 205 !important;');
});

// Update dynamic field height so it doesn't take too much space if it's sitting above 60px
css = css.replace(/height:\s*65vh\s*!important;/g, 'height: 55vh !important;');

fs.writeFileSync('styles.css', css, 'utf8');
console.log('Fixed bottom sheet layout to keep tab bar visible');
