const fs = require('fs');

let content = fs.readFileSync('tpl_luks/luks.js', 'utf8');

// I will systematically scale up ALL font-sizes in luks.js by a massive factor (like 1.8x to 2.2x depending on size)
// luks.js uses HTML flexbox so scaling them up will NOT cause overlap! They will just grow proportionally and wrap gracefully.

content = content.replace(/font-size:\s*\$\{scaleMin\((\d+)\)\}px/g, (match, num) => {
    let n = parseInt(num);
    if(n < 30) n = Math.round(n * 1.8);
    else if(n <= 50) n = Math.round(n * 1.9);
    else if(n <= 80) n = Math.round(n * 2.0);
    else n = Math.round(n * 2.1);
    
    // Don't go too crazy to avoid destroying the container
    if(n > 140) n = 140;
    
    return `font-size:\${scaleMin(${n})}px`;
});

// Reduce padding aggressively to allow text to breathe
content = content.replace(/padding:\s*\$\{scaleMin\((\d+)\)\}px/g, (match, num) => {
    let n = parseInt(num);
    n = Math.round(n * 0.4); // 60% reduction in padding
    return `padding:\${scaleMin(${n})}px`;
});

fs.writeFileSync('tpl_luks/luks.js', content, 'utf8');
console.log("luks.js dynamically maxed out again, perfectly!");
