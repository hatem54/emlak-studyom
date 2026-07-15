const fs = require('fs');

let html = fs.readFileSync('app.html', 'utf8');
// Replace styles.css?v=... with a new timestamp
const newTimestamp = Date.now();
html = html.replace(/styles\.css\?v=\d+/, `styles.css?v=${newTimestamp}`);

fs.writeFileSync('app.html', html, 'utf8');
console.log('Cache invalidated for styles.css in app.html');
