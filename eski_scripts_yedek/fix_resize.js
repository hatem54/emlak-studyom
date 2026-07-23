const fs = require('fs');
let drawJs = fs.readFileSync('modules/draw.js', 'utf8');

// 1. Update drawSelectionUI
drawJs = drawJs.replace(
    /if \(p\.type === 'line' \|\| p\.type === 'arrow' \|\| p\.type === 'polygon'\) \{/g, 
    "if (p.type === 'line' || p.type === 'arrow' || p.type === 'polygon' || p.type === 'rect' || p.type === 'circle') {"
);

// 2. Update hitTestSelection
drawJs = drawJs.replace(
    /if \(p\.type === 'line' \|\| p\.type === 'arrow'\) \{/g,
    "if (p.type === 'line' || p.type === 'arrow' || p.type === 'rect' || p.type === 'circle') {"
);

// 3. Update dMove
drawJs = drawJs.replace(
    /if \(path\.type === 'line' \|\| path\.type === 'arrow'\) \{/g,
    "if (path.type === 'line' || path.type === 'arrow' || path.type === 'rect' || path.type === 'circle') {"
);

fs.writeFileSync('modules/draw.js', drawJs, 'utf8');
console.log('Successfully enabled resizing for rect and circle');
