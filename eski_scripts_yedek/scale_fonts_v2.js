const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Apply a second layer of aggressive scaling to fix the "tiny text in huge space" issue
    content = content.replace(/font-size:\s*\$\{scaleMin\((\d+)\)\}px/g, (m, sizeStr) => {
        let size = parseInt(sizeStr);
        // We already scaled once, so the current sizes are roughly 24 to 80
        if (size <= 28) size = Math.round(size * 1.45); // Features, small labels
        else if (size <= 50) size = Math.round(size * 1.40); // Subtitles, prices
        else if (size <= 75) size = Math.round(size * 1.35); // Main titles
        else size = Math.round(size * 1.20); // Very large titles
        return `font-size:\${scaleMin(${size})}px`;
    });

    // Also bump up hardcoded font-sizes if they exist (rare, but just in case)
    content = content.replace(/font-size:\s*(\d+)px/g, (m, sizeStr) => {
        let size = parseInt(sizeStr);
        // exclude very small stuff which might be icons or borders (e.g. font-size:10px)
        if (size > 15) {
            if (size <= 28) size = Math.round(size * 1.45);
            else if (size <= 50) size = Math.round(size * 1.40);
            else if (size <= 75) size = Math.round(size * 1.35);
            else size = Math.round(size * 1.20);
        }
        return `font-size:${size}px`;
    });
    
    // In some templates, features text box line height might be too huge if font size is 40px
    // Let's reduce line-height slightly to compensate for massive font sizes, so they don't push each other too far
    content = content.replace(/line-height:\s*2\.5;/g, 'line-height:2.0;');
    content = content.replace(/line-height:\s*2\.2;/g, 'line-height:1.8;');
    content = content.replace(/line-height:\s*2;/g, 'line-height:1.6;');

    if(content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Scaled massively: " + filePath);
    }
}

const dirs = fs.readdirSync('.', {withFileTypes: true});
for (const dir of dirs) {
    if (dir.isDirectory() && dir.name.startsWith('tpl_')) {
        const files = fs.readdirSync(dir.name).filter(f => f.endsWith('.js'));
        for (const file of files) {
            processFile(path.join(dir.name, file));
        }
    }
}
