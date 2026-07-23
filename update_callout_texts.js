const fs = require('fs');
let html = fs.readFileSync('app.html', 'utf8');

html = html.replace('Seçili İkon Ayarları', 'Seçili Callout Ayarları');
html = html.replace('Bu İkonu Sil', 'Callout\'u Sil');

fs.writeFileSync('app.html', html);
console.log("app.html text updated.");
