const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const oldCss = `display: flex !important; justify-content: center !important; align-items: center !important; overflow: hidden !important;`;
const newCss = `display: flex !important; justify-content: center !important; align-items: flex-start !important; padding-top: 20px !important; overflow: hidden !important;`;

if (css.includes(oldCss)) {
    css = css.replace(oldCss, newCss);
    fs.writeFileSync('styles.css', css, 'utf8');
    console.log('Updated styles.css successfully.');
} else {
    console.log('Could not find the target CSS string.');
}

// Invalidate cache
let html = fs.readFileSync('app.html', 'utf8');
const ts = Date.now();
html = html.replace(/styles\.css\?v=\d+/, `styles.css?v=${ts}`);
fs.writeFileSync('app.html', html, 'utf8');
console.log('Cache invalidated in app.html');
