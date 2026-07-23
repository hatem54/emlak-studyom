const fs = require('fs');
let js = fs.readFileSync('modules/callout.js', 'utf8');

const applyRegex = /function applyCalloutSettings\(\)\s*\{[\s\S]*?\}\n/m;
const oldApply = js.match(applyRegex);

if(oldApply) {
    const newApply = `function applyCalloutSettings() {
    if (!selectedCalloutEl) return;
    const el = selectedCalloutEl;

    const iconColor = document.getElementById('coIconColor')?.value || '#93c5fd';
    const textColor = document.getElementById('coTextColor')?.value || '#ffffff';
    const bgColor = document.getElementById('coBgColor')?.value || '#0d1b2e';

    if (el.classList.contains('co-neon-block')) {
        const bgOpacity = parseInt(document.getElementById('coBgOpacity')?.value || 0);
        const iconSize = parseInt(document.getElementById('coIconSize')?.value || 64);
        const textSize = parseInt(document.getElementById('coTextSize')?.value || 14);
        const glowPct = parseInt(document.getElementById('coGlow')?.value || 80);
        const radius = parseInt(document.getElementById('coRadius')?.value || 12);
        const padding = parseInt(document.getElementById('coPadding')?.value || 10);
        const labelRaw = document.getElementById('coLabelText')?.value || '';

        el.dataset.coIconColor = iconColor;
        el.dataset.coTextColor = textColor;
        el.dataset.coBgColor = bgColor;
        el.dataset.coBgOpacity = bgOpacity;
        el.dataset.coIconSize = iconSize;
        el.dataset.coTextSize = textSize;
        el.dataset.coGlow = glowPct;
        el.dataset.coRadius = radius;
        el.dataset.coPadding = padding;
        el.dataset.coLabel = labelRaw;

        renderCalloutFromDataset(el);
    } else {
        // Standard SVG Callout! Let's color it dynamically!
        const svg = el.querySelector('svg');
        if (svg) {
            // Text color
            svg.querySelectorAll('text, tspan').forEach(t => {
                if (t.getAttribute('fill') && t.getAttribute('fill') !== 'none') t.setAttribute('fill', textColor);
                if (t.style.fill && t.style.fill !== 'none') t.style.fill = textColor;
            });
            // BG Color
            svg.querySelectorAll('rect, circle, polygon, path').forEach(bg => {
                const fill = bg.getAttribute('fill');
                if (fill && fill !== 'none' && !fill.includes('url(#')) bg.setAttribute('fill', bgColor);
                if (bg.style.fill && bg.style.fill !== 'none' && !bg.style.fill.includes('url(')) bg.style.fill = bgColor;
            });
            // Border Color (coIconColor reused for Border)
            svg.querySelectorAll('[stroke]').forEach(s => {
                const stroke = s.getAttribute('stroke');
                if (stroke && stroke !== 'none' && !stroke.includes('url(#')) s.setAttribute('stroke', iconColor);
                if (s.style.stroke && s.style.stroke !== 'none' && !s.style.stroke.includes('url(')) s.style.stroke = iconColor;
            });
        }
    }
}
`;
    // We need to replace it safely. The regex might not capture the full function if it has nested braces.
    // Let's use substring replacement.
}

const applyStart = js.indexOf('function applyCalloutSettings() {');
// Find the end of the function. We can find the next function definition.
const applyEnd = js.indexOf('function ', applyStart + 10);
const oldCode = js.substring(applyStart, applyEnd);

const newApplyCode = `function applyCalloutSettings() {
    if (!selectedCalloutEl) return;
    const el = selectedCalloutEl;

    const iconColor = document.getElementById('coIconColor')?.value || '#93c5fd';
    const textColor = document.getElementById('coTextColor')?.value || '#ffffff';
    const bgColor = document.getElementById('coBgColor')?.value || '#0d1b2e';

    if (el.classList.contains('co-neon-block')) {
        const bgOpacity = parseInt(document.getElementById('coBgOpacity')?.value || 0);
        const iconSize = parseInt(document.getElementById('coIconSize')?.value || 64);
        const textSize = parseInt(document.getElementById('coTextSize')?.value || 14);
        const glowPct = parseInt(document.getElementById('coGlow')?.value || 80);
        const radius = parseInt(document.getElementById('coRadius')?.value || 12);
        const padding = parseInt(document.getElementById('coPadding')?.value || 10);
        const labelRaw = document.getElementById('coLabelText')?.value || '';

        el.dataset.coIconColor = iconColor;
        el.dataset.coTextColor = textColor;
        el.dataset.coBgColor = bgColor;
        el.dataset.coBgOpacity = bgOpacity;
        el.dataset.coIconSize = iconSize;
        el.dataset.coTextSize = textSize;
        el.dataset.coGlow = glowPct;
        el.dataset.coRadius = radius;
        el.dataset.coPadding = padding;
        el.dataset.coLabel = labelRaw;

        renderCalloutFromDataset(el);
    } else {
        const svg = el.querySelector('svg');
        if (svg) {
            svg.querySelectorAll('text, tspan').forEach(t => {
                if (t.getAttribute('fill') && t.getAttribute('fill') !== 'none') t.setAttribute('fill', textColor);
            });
            svg.querySelectorAll('rect, circle, polygon, path').forEach(bg => {
                const fill = bg.getAttribute('fill');
                if (fill && fill !== 'none' && !fill.includes('url(#')) bg.setAttribute('fill', bgColor);
            });
            svg.querySelectorAll('[stroke]').forEach(s => {
                const stroke = s.getAttribute('stroke');
                if (stroke && stroke !== 'none' && !stroke.includes('url(#')) s.setAttribute('stroke', iconColor);
            });
        }
    }
}

`;
js = js.replace(oldCode, newApplyCode);
fs.writeFileSync('modules/callout.js', js);
console.log("applyCalloutSettings updated.");
