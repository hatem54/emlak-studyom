const fs = require('fs');
let cElit = fs.readFileSync('tpl_elit/elit.js', 'utf8');

cElit = cElit.replace(
    "<div style=\"position:absolute;top:${scaleY(630)}px;left:${scaleX(1260)}px;",
    "<div style=\"position:absolute;top:${scaleY(455)}px;left:${scaleX(1260)}px;"
);

fs.writeFileSync('tpl_elit/elit.js', cElit);
console.log("Fixed horizontal line overlap in canva10!");
