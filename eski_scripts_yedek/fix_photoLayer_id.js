const fs = require('fs');
let mainJs = fs.readFileSync('main.js', 'utf8');

mainJs = mainJs.replace(
    /const photoLayer = document\.getElementById\('photoLayer'\);/g,
    "// Use global photoLayer"
);

fs.writeFileSync('main.js', mainJs, 'utf8');
console.log('Fixed photoLayer reference in main.js');
