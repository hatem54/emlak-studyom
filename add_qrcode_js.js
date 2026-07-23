const fs = require('fs');
let html = fs.readFileSync('app.html', 'utf-8');

const target = '<script src="js/modules/qrManager.js?v=2"></script>';
const replacement = '<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>\n<script src="js/modules/qrManager.js?v=2"></script>';

if (!html.includes('qrcode.min.js')) {
    html = html.replace(target, replacement);
    fs.writeFileSync('app.html', html);
    console.log('Added qrcode.min.js');
} else {
    console.log('qrcode.min.js already exists');
}
