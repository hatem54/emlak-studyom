const fs = require('fs');
let c = fs.readFileSync('js/formConfig.js', 'utf8');
c = c.replace(/value: "120 m²"/g, 'value: ""');
fs.writeFileSync('js/formConfig.js', c);
console.log('formConfig.js updated');
