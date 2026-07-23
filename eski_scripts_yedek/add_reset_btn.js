const fs = require('fs');

// 1. Update app.html to add the Reset button
let appHtml = fs.readFileSync('app.html', 'utf8');
const oldBtnStr = '<button class="btn-action btn-red" onclick="deleteSelectedCallout()" style="margin-top:8px; width:100%;">🗑️ Callout\'u Sil</button>';
const newBtnStr = oldBtnStr + '\n          <button class="btn-action" onclick="resetCalloutToDefault()" style="margin-top:8px; width:100%; background-color:#3b82f6; color:#fff;">🔄 Varsayılana Dön</button>';

if (appHtml.includes(oldBtnStr) && !appHtml.includes('resetCalloutToDefault()')) {
    appHtml = appHtml.replace(oldBtnStr, newBtnStr);
    
    // Also bump cache version for callout_v2.js
    appHtml = appHtml.replace(/modules\/callout_v2\.js\?v=\d+/, 'modules/callout_v2.js?v=4');
    fs.writeFileSync('app.html', appHtml, 'utf8');
    console.log("Updated app.html with reset button");
}

// 2. Update modules/callout_v2.js
let calloutJs = fs.readFileSync('modules/callout_v2.js', 'utf8');

// Inject originalSvg saving into addSVGCalloutToCanvas
if (!calloutJs.includes('el.dataset.originalSvg = encodeURIComponent(svgHtml);')) {
    calloutJs = calloutJs.replace('el.innerHTML = svgHtml;', 'el.innerHTML = svgHtml;\n    el.dataset.originalSvg = encodeURIComponent(svgHtml);');
}

// Define resetCalloutToDefault()
if (!calloutJs.includes('function resetCalloutToDefault()')) {
    const resetFunc = `
function resetCalloutToDefault() {
    if (!selectedCalloutEl) return;
    
    const d = selectedCalloutEl.dataset;
    const isNeon = selectedCalloutEl.classList.contains('co-neon-block');
    
    if (!isNeon && d.originalSvg) {
        // Restore SVG HTML
        selectedCalloutEl.innerHTML = decodeURIComponent(d.originalSvg);
        
        // Remove style overrides if any exist natively on SVG (handled by innerHTML)
        // Reset scale/rotation optionally? Usually we just want to reset colors.
        // We'll keep scale/rotation but reset colors.
        
        // Update UI Panel by re-triggering selectCalloutEl logic
        const tc = document.getElementById('coTextColor');
        const bc = document.getElementById('coBgColor');
        const ic = document.getElementById('coIconColor');
        
        const svg = selectedCalloutEl.querySelector('svg');
        if (svg) {
            const textEl = svg.querySelector('text, tspan');
            if (textEl && tc) {
                const fill = textEl.getAttribute('fill') || textEl.style.fill;
                if (fill && fill.startsWith('#')) tc.value = fill.substring(0,7);
            }
            const bgEl = svg.querySelector('rect, circle, polygon, path');
            if (bgEl && bc) {
                const fill = bgEl.getAttribute('fill') || bgEl.style.fill;
                if (fill && fill.startsWith('#')) bc.value = fill.substring(0,7);
            }
            const borderEl = svg.querySelector('[stroke]');
            if (borderEl && ic) {
                const stroke = borderEl.getAttribute('stroke') || borderEl.style.stroke;
                if (stroke && stroke.startsWith('#')) ic.value = stroke.substring(0,7);
            }
        }
    }
}
`;
    // Append the function to the end of the file
    calloutJs += resetFunc;
}

fs.writeFileSync('modules/callout_v2.js', calloutJs, 'utf8');
console.log("Updated callout_v2.js");
