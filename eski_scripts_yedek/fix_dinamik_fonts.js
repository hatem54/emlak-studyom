const fs = require('fs');
let txt = fs.readFileSync('tpl_dinamik/dinamik.js', 'utf8');
const lines = txt.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('canvaRenderLayer.innerHTML = `')) {
        // We found a template line. Let's process it.
        let html = lines[i];

        // 1. Scale down font sizes
        html = html.replace(/scaleMin\((\d+)\)/g, (match, p1) => {
            const num = parseInt(p1);
            // Don't reduce contact if it's already 35
            if (num <= 35) return match;
            const newNum = Math.round(num * 0.75);
            return `scaleMin(${newNum})`;
        });

        // 2. Ensure contact span has white-space:nowrap;
        html = html.replace(/<span class="editable-text" style="display:inline-block;min-width:50px;">\$\{contact\}<\/span>/g, '<span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span>');

        // 3. For feats, let's ensure it has pre-wrap if it doesn't already, but most do.
        // Wait, the prompt says "metn yerleşimi dogru degil". 
        // By reducing font sizes by 25%, the text will take up 25% less space, preventing overlaps.
        // Also let's set default brand text to "EMLAK STUDYOM" instead of "EMLAK STUDIO"
        // Wait, the default brand is in the HTML inputs, not the template itself.

        lines[i] = html;
    }
}

// 4. Change default contact value in the UI to EMLAK STUDYOM
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('id="canvaDContact" value="EMLAK STUDIO')) {
        lines[i] = lines[i].replace('EMLAK STUDIO', 'EMLAK STUDYOM');
    }
}

fs.writeFileSync('tpl_dinamik/dinamik.js', lines.join('\n'));
console.log('Fixed Dinamik template font sizes and wrapped contact text.');
