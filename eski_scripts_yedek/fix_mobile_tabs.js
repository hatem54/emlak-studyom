const fs = require('fs');

let mainjs = fs.readFileSync('main.js', 'utf8');

const closeTabsLogic = `
        // Close all tabs by default on mobile
        if(window.innerWidth <= 768) {
            document.querySelectorAll('#mainTabs .tab-btn').forEach(b=>b.classList.remove('active'));
            document.querySelectorAll('.panel>.dynamic-field').forEach(f=>f.classList.remove('show'));
            const mo = document.getElementById('mobileSheetOverlay');
            if(mo) { mo.style.display='none'; mo.style.opacity='0'; }
        }
        
        console.log('🎉 Init tamamlandı');`;

// Replace the console.log line to inject our logic right before it
if (mainjs.includes('Init tamamland')) {
    mainjs = mainjs.replace(/console\.log\(['"`].*Init tamamland.*['"`]\);/, closeTabsLogic);
    fs.writeFileSync('main.js', mainjs, 'utf8');
    console.log('Injected mobile tab closer logic into main.js');
}

// Also invalidate cache in app.html
let html = fs.readFileSync('app.html', 'utf8');
const newTimestamp = Date.now();
html = html.replace(/main\.js\?v=\d+/, `main.js?v=${newTimestamp}`);
fs.writeFileSync('app.html', html, 'utf8');
console.log('Invalidated caches');
