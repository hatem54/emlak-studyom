const fs = require('fs');
let html = fs.readFileSync('app.html', 'utf8');

const missingJS = `
<script>
// Dummy function for toggleMobileMenu to prevent Uncaught ReferenceError
function toggleMobileMenu() {
    console.log('Mobile menu toggled');
    // We can copy the side-panel logic from index.html here later if needed
    alert('Menü yakında eklenecek!');
}
</script>
`;

if (!html.includes('function toggleMobileMenu()')) {
    html = html.replace('</body>', missingJS + '\n</body>');
    fs.writeFileSync('app.html', html, 'utf8');
    console.log('Added toggleMobileMenu to app.html');
} else {
    console.log('toggleMobileMenu already exists');
}
