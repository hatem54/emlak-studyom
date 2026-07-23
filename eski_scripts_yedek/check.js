const fs = require('fs');
const code = fs.readFileSync('app.html', 'utf8');
const start = code.indexOf('id="photo-layer"');
console.log(code.substring(start - 200, start + 300));
