const fs = require('fs');
let content = fs.readFileSync('tpl_luks/luks.js', 'utf8');

// The goal is to aggressively scale up the sizes for all 10 LUKS templates
// and adjust their paddings so they take up more vertical and horizontal space.

// Template 0 (canvaL1)
// Current padding: padding:${scaleY(60)}px ${scaleX(40)}px
content = content.replace(/padding:\$\{scaleY\(60\)\}px \$\{scaleX\(40\)\}px/g, 'padding:${scaleY(120)}px ${scaleX(60)}px');
// Font sizes
content = content.replace(/font-size:\$\{scaleMin\(101\)\}px/g, 'font-size:${scaleMin(130)}px');
content = content.replace(/font-size:\$\{scaleMin\(70\)\}px/g, 'font-size:${scaleMin(90)}px');
content = content.replace(/font-size:\$\{scaleMin\(39\)\}px/g, 'font-size:${scaleMin(50)}px');
content = content.replace(/font-size:\$\{scaleMin\(35\)\}px/g, 'font-size:${scaleMin(45)}px');

// Template 1 (canvaL2)
content = content.replace(/padding:\$\{scaleY\(40\)\}px \$\{scaleX\(60\)\}px/g, 'padding:${scaleY(80)}px ${scaleX(80)}px');
content = content.replace(/font-size:\$\{scaleMin\(93\)\}px/g, 'font-size:${scaleMin(130)}px');
content = content.replace(/font-size:\$\{scaleMin\(76\)\}px/g, 'font-size:${scaleMin(95)}px');
content = content.replace(/font-size:\$\{scaleMin\(42\)\}px/g, 'font-size:${scaleMin(55)}px');

// Template 3 (canvaL4 - The Burgundy one from the screenshot!)
// Update the star icon
content = content.replace(/width:60px;height:60px;.*font-size:41px;/, 'width:100px;height:100px;border:3px solid #d4af37;border-radius:50%;margin:0 auto ${scaleY(50)}px auto;display:flex;align-items:center;justify-content:center;color:#d4af37;font-size:65px;');
// Update padding of the right container
content = content.replace(/padding:\$\{scaleY\(80\)\}px \$\{scaleX\(40\)\}px/g, 'padding:${scaleY(150)}px ${scaleX(50)}px');
content = content.replace(/font-size:\$\{scaleMin\(85\)\}px/g, 'font-size:${scaleMin(125)}px'); // Title
content = content.replace(/font-size:\$\{scaleMin\(62\)\}px/g, 'font-size:${scaleMin(90)}px'); // Price
// The previous feats font size was 35. Let's make it 42
content = content.replace(/font-size:\$\{scaleMin\(35\)\}px/g, 'font-size:${scaleMin(42)}px'); 

// Template 4 (canvaL5)
content = content.replace(/font-size:\$\{scaleMin\(103\)\}px/g, 'font-size:${scaleMin(140)}px');
// Template 6 (canvaL7)
content = content.replace(/font-size:\$\{scaleMin\(85\)\}px/g, 'font-size:${scaleMin(120)}px');
// Template 7 (canvaL8)
content = content.replace(/font-size:\$\{scaleMin\(101\)\}px/g, 'font-size:${scaleMin(140)}px');
// Template 9 (canvaL10)
content = content.replace(/font-size:\$\{scaleMin\(93\)\}px/g, 'font-size:${scaleMin(130)}px');

fs.writeFileSync('tpl_luks/luks.js', content, 'utf8');
console.log('luks.js completely maxed out manually.');
