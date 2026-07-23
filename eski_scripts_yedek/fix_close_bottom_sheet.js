const fs = require('fs');
let corejs = fs.readFileSync('core.js', 'utf8');

if (!corejs.includes('window.closeBottomSheet')) {
    const fn = `
// Expose closeBottomSheet to global scope
window.closeBottomSheet = function() {
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.panel>.dynamic-field').forEach(f => f.classList.remove('show'));
        document.querySelectorAll('#mainTabs .tab-btn').forEach(b => b.classList.remove('active'));
        const mo = document.getElementById('mobileSheetOverlay');
        if (mo) { mo.style.display = 'none'; mo.style.opacity = '0'; }
    }
};
`;
    fs.writeFileSync('core.js', corejs + '\n' + fn, 'utf8');
    console.log('Added closeBottomSheet to core.js');
} else {
    console.log('closeBottomSheet already exists.');
}
