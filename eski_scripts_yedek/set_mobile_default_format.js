const fs = require('fs');

let mainjs = fs.readFileSync('main.js', 'utf8');

const oldInitLogic = "if(window.innerWidth <= 768) {";
const newInitLogic = `if(window.innerWidth <= 768) {
            // Set default format to 9:16 on mobile load
            const formatSelect = document.getElementById('previewFormat');
            const exportSelect = document.getElementById('exportFormat');
            if (formatSelect) {
                formatSelect.value = '9:16 Instagram/TikTok Story';
                if (typeof switchPreviewFormat === 'function') switchPreviewFormat();
            }
            if (exportSelect) {
                exportSelect.value = '9:16 Instagram/TikTok Story';
            }`;

if (mainjs.includes(oldInitLogic)) {
    mainjs = mainjs.replace(oldInitLogic, newInitLogic);
    fs.writeFileSync('main.js', mainjs, 'utf8');
    console.log('Added mobile default format logic to main.js');
}

// Invalidate cache
let html = fs.readFileSync('app.html', 'utf8');
const ts = Date.now();
html = html.replace(/main\.js\?v=\d+/, `main.js?v=${ts}`);
fs.writeFileSync('app.html', html, 'utf8');
console.log('Cache invalidated');
