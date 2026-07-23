const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const navLinksMatch = html.match(/<ul class=\"nav-links\">([\s\S]*?)<\/ul>/);
if (navLinksMatch) console.log('NAV LINKS:\n', navLinksMatch[1]);

const toggleMatch = html.match(/function toggleMobileMenu[\s\S]*?\}/);
if (toggleMatch) console.log('TOGGLE FUNCTION:\n', toggleMatch[0]);
