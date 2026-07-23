const fs = require('fs');

let luks = fs.readFileSync('tpl_luks/luks.js', 'utf8');

// 1. Translate the last remaining English word "PREMIUM"
luks = luks.replace(/PREMIUM EMLAK/g, 'SEÇKİN EMLAK');

// 2. Reduce the original massive sizes by 0.85x (so they are smaller than the overflowing 1.0x, but larger than the 0.65x the user complained about)
// Wait! The user complained about 0.65x being "başlangıca döndürdün" (reverted to beginning). 
// Let's use 0.85x. But first I need to find the ORIGINAL sizes. 
// Since my current luks.js is at 1.0x (because I reverted it to git in the previous step), I can just multiply by 0.85.
luks = luks.replace(/font-size:\$\{scaleMin\((\d+)\)\}px/g, (match, num) => {
    let n = Math.round(parseInt(num) * 0.85);
    return `font-size:\${scaleMin(${n})}px`;
});

// 3. Fix the overlapping layouts (Luks 5 and Luks 8, etc.) by adjusting text container widths and adding word-break
// We will find all editable-text spans and ensure they can wrap
luks = luks.replace(/<span class="editable-text"/g, '<span class="editable-text" style="display:inline-block;word-break:break-word;white-space:pre-wrap;max-width:100%;"');

// Fix Luks 5 specifically: width of text container was 850px, which bleeds into the 1200px photo (leaving only 720px solid color).
// Change width from 850 to 580 (so 120 + 580 = 700px < 720px).
luks = luks.replace(/width:\$\{scaleX\(850\)\}px;display:flex;flex-direction:column;/, 'width:${scaleX(580)}px;display:flex;flex-direction:column;');

// Fix Luks 8 specifically: width of text container was 600px, but photo is 1500px on the right, leaving only 420px solid color!
// Change width from 600 to 350 (so 60 + 350 = 410px < 420px).
luks = luks.replace(/width:\$\{scaleX\(600\)\}px;display:flex;flex-direction:column;/, 'width:${scaleX(350)}px;display:flex;flex-direction:column;');

fs.writeFileSync('tpl_luks/luks.js', luks, 'utf8');

console.log("Luks layout and text sizing fixed!");
