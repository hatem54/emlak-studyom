const fs = require('fs');
const code = fs.readFileSync('C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core.js', 'utf8');
const start = code.indexOf('if (typeof drawPaths !== \\'undefined\\') {');
console.log(code.substring(start, start + 1000));
