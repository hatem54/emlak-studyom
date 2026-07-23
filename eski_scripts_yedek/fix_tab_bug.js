const fs = require('fs');
let html = fs.readFileSync('app.html', 'utf8');

const buggyLogicRegex = /\/\/\s*Re-apply toggle logic to mainTabs[\s\S]*?\}\);\s*\}\);/m;

if (html.match(buggyLogicRegex)) {
    html = html.replace(buggyLogicRegex, '');
    
    // Invalidate caches just in case
    const ts = Date.now();
    html = html.replace(/main\.js\?v=\d+/, `main.js?v=${ts}`);
    html = html.replace(/core\.js\?v=\d+/, `core.js?v=${ts}`);
    html = html.replace(/styles\.css\?v=\d+/, `styles.css?v=${ts}`);
    
    fs.writeFileSync('app.html', html, 'utf8');
    console.log('Removed buggy event listener logic from app.html');
} else {
    console.log('Buggy logic not found in app.html');
}
