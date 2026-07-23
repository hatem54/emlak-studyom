const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/modules/draw.js';
let content = fs.readFileSync(file, 'utf8');

let targetStr = "icon.style.pointerEvents = (typeof drawMode !== 'undefined' && drawMode === 'off') ? 'auto' : 'none';";
let replaceStr = "icon.style.pointerEvents = 'none';\n    icon.style.cursor = 'default';";

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    
    const styleInject = `
    const style = document.createElement('style');
    style.innerHTML = \`
        .editable-draw { pointer-events: none !important; }
        .editable-draw svg { pointer-events: none !important; }
        .editable-draw svg path, 
        .editable-draw svg polygon, 
        .editable-draw svg rect, 
        .editable-draw svg ellipse, 
        .editable-draw svg line, 
        .editable-draw svg circle, 
        .editable-draw svg polyline,
        .editable-draw svg g {
            pointer-events: visiblePainted !important;
            cursor: pointer;
        }
    \`;
    document.head.appendChild(style);
`;
    
    content = content.replace("document.addEventListener('DOMContentLoaded', () => {", "document.addEventListener('DOMContentLoaded', () => {\n" + styleInject);
    
    fs.writeFileSync(file, content, 'utf8');
    console.log("draw.js patched successfully.");
} else {
    console.log("Could not find target string. Already patched?");
}
