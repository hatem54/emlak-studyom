const fs = require('fs');
let coreJs = fs.readFileSync('core.js', 'utf8');

coreJs = coreJs.replace(
    "elBadge.innerText=$('statusInput').value;",
    "elBadge.innerText= $('statusInput') ? $('statusInput').value : '';"
);

coreJs = coreJs.replace(
    "elPrice.innerText=$('priceInput').value || 'FİYAT İÇİN BİZE ULAŞIN';",
    "elPrice.innerText= $('priceInput') ? ($('priceInput').value || 'FİYAT İÇİN BİZE ULAŞIN') : 'FİYAT İÇİN BİZE ULAŞIN';"
);

fs.writeFileSync('core.js', coreJs);
console.log('Fixed renderData null issue safely');
