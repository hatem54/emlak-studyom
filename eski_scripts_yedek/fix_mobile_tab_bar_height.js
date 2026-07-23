const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

// Replace height: 60px in #mainTabs
css = css.replace(/height:\s*60px\s*!important;\s*margin:\s*0\s*!important;\s*padding:\s*0\s*!important;/, 'height: 90px !important; margin: 0 !important; padding: 0 0 30px 0 !important;');

// Replace height: 60px in .panel::after
css = css.replace(/height:\s*60px;\s*width:\s*30px;/, 'height: 90px; width: 30px;');

// Replace bottom: 60px in .dynamic-field.show
css = css.replace(/\.dynamic-field\.show\s*\{\s*bottom:\s*60px\s*!important;\s*\}/, '.dynamic-field.show { bottom: 90px !important; }');

// Replace 60px in .container height calc
css = css.replace(/calc\(100vh - 50px - 60px\)/g, 'calc(100vh - 50px - 90px)');

fs.writeFileSync('styles.css', css);
console.log('Mobile tab bar height increased to 90px (30px padding).');
