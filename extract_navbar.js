const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const navMatch = html.match(/<nav class=\"navbar\"[\s\S]*?<\/nav>/);
if (navMatch) console.log(navMatch[0]);
