const fs = require('fs');
let txt = fs.readFileSync('tpl_klasik/klasik.js', 'utf8');

// 1. Change EMLAK STUDIO to EMLAK STUDYOM in the init function
txt = txt.replace(/value="EMLAK STUDIO \| 0532 000 0000"/g, 'value="EMLAK STUDYOM | 0532 000 0000"');

const lines = txt.split('\n');

// We will iterate through each canva Render Layer and update its contact string.
let templateIndex = 0;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('canvaRenderLayer.innerHTML = `')) {
        templateIndex++;
        // The contact div is usually the last div in the innerHTML
        // It has style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;..."
        
        let alignStr = 'right:${scaleX(80)}px;text-align:right;';
        if (templateIndex === 3 || templateIndex === 8) {
            alignStr = 'left:${scaleX(80)}px;text-align:left;';
        }
        
        // For C4, border is at 40px, so bottom 60px is good.
        // For C9, white box bottom is 100px. Bottom 40px is good.
        let bottomVal = 60;
        if (templateIndex === 9) bottomVal = 40;
        
        // Replace the contact div styling
        // We look for: <div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(53)}px;...
        // Or similar variations.
        
        // Using a regex to catch the contact div wrapper
        const regex = /<div style="position:absolute;bottom:\$\{scaleY\(\d+\)\}px;(?:left:0;width:100%;text-align:center;|width:100%;text-align:center;)[^>]*><span class="editable-text"[^>]*>\$\{contact\}<\/span><\/div>/;
        
        if (regex.test(lines[i])) {
            const newDiv = `<div style="position:absolute;bottom:\$\{scaleY(${bottomVal})\}px;${alignStr}font-size:\$\{scaleMin(35)\}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:2px;z-index:20;text-shadow:0 2px 5px rgba(0,0,0,0.8);"><span class="editable-text" style="display:inline-block;min-width:50px;">\$\{contact\}</span></div>`;
            lines[i] = lines[i].replace(regex, newDiv);
        }
    }
}

fs.writeFileSync('tpl_klasik/klasik.js', lines.join('\n'));
console.log('Fixed Klasik Layouts - Changed EMLAK STUDIO and repositioned contact infos.');
