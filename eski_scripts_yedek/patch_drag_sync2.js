const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core/drag.js';
let content = fs.readFileSync(file, 'utf8');

// I need to fix the calculation of dx and dy to use the main element's delta, because 'il' is for 'el'.
const badDx = `const dx = parseFloat(selEl.style.left) - il;
                                const dy = parseFloat(selEl.style.top) - it;`;
const goodDx = `const dx = parseFloat(el.style.left) - il;
                                const dy = parseFloat(el.style.top) - it;`;
content = content.replace(badDx, goodDx);
fs.writeFileSync(file, content);
