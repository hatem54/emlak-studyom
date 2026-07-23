const fs = require('fs');
const html = fs.readFileSync('app.html', 'utf8');
const scripts = html.match(/src="(.*?)"/g).map(s => s.replace('src="', '').replace(/"$/, '').split('?')[0]);
scripts.forEach(s => {
    try {
        if(s.startsWith('http')) return;
        const code = fs.readFileSync(s, 'utf8');
        if(code.includes('Bu hazır bir şablondur') || code.includes('svgCalloutWarning')) {
            console.log('FOUND IN', s);
        }
    } catch(e) {}
});
