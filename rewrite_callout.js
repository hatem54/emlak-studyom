const fs = require('fs');
let js = fs.readFileSync('modules/callout.js', 'utf8');

// 1. Rewrite selectCallout
const selectCalloutStart = js.indexOf('function selectCallout(el)');
const selectCalloutEnd = js.indexOf('function closeCalloutPanel()', selectCalloutStart);
const oldSelectCallout = js.substring(selectCalloutStart, selectCalloutEnd);

const newSelectCallout = `function selectCallout(el) {
    if (selectedCalloutEl && selectedCalloutEl !== el) {
        selectedCalloutEl.style.outline = 'none';
    }
    
    // Switch to callout tab
    const tab = document.getElementById('tab-callout');
    if (tab && tab.style.display === 'none') {
        if (typeof switchTab === 'function') switchTab('callout');
    }
    
    document.querySelectorAll('.co-neon-block').forEach(e => {
        if (!window.selectedElements || !window.selectedElements.includes(e)) {
            e.style.outline = 'none';
        }
    });
    el.style.outline = '1px dashed rgba(255,255,255,0.4)';
    selectedCalloutEl = el;

    const panel = document.getElementById('calloutSettingsPanel');
    if (!panel) return;

    // Show panel and controls for ALL callouts now!
    panel.style.display = 'block';
    panel.querySelectorAll('.color-row, .slider-group, .input-group').forEach(e => e.style.display = 'flex');
    
    // Remove warning div if exists
    const wDiv = document.getElementById('svgCalloutWarning');
    if (wDiv) wDiv.remove();

    const isNeon = el.classList.contains('co-neon-block');
    const d = el.dataset;
    const ic = document.getElementById('coIconColor');
    const tc = document.getElementById('coTextColor');
    const bc = document.getElementById('coBgColor');
    
    if (isNeon) {
        if (ic) ic.value = d.coIconColor || '#93c5fd';
        if (tc) tc.value = d.coTextColor || '#ffffff';
        if (bc) bc.value = d.coBgColor || '#0d1b2e';
        
        const bop = document.getElementById('coBgOpacity');
        const is = document.getElementById('coIconSize');
        const ts = document.getElementById('coTextSize');
        const gw = document.getElementById('coGlow');
        const rd = document.getElementById('coRadius');
        const pd = document.getElementById('coPadding');
        const lt = document.getElementById('coLabelText');

        if (bop) { bop.value = d.coBgOpacity || 0; document.getElementById('coBgOpacityVal').textContent = bop.value + '%'; }
        if (is) { is.value = d.coIconSize || 64; document.getElementById('coIconSizeVal').textContent = is.value + 'px'; }
        if (ts) { ts.value = d.coTextSize || 14; document.getElementById('coTextSizeVal').textContent = ts.value + 'px'; }
        if (gw) { gw.value = d.coGlow || 80; document.getElementById('coGlowVal').textContent = gw.value + '%'; }
        if (rd) { rd.value = d.coRadius || 12; document.getElementById('coRadiusVal').textContent = rd.value + 'px'; }
        if (pd) { pd.value = d.coPadding || 10; document.getElementById('coPaddingVal').textContent = pd.value + 'px'; }
        if (lt) lt.value = (d.coLabel || '').replace(/\n/g, ' ');
    } else {
        // Hide neon-specific sliders for standard SVG callouts
        const bop = document.getElementById('coBgOpacity');
        const is = document.getElementById('coIconSize');
        const ts = document.getElementById('coTextSize');
        const gw = document.getElementById('coGlow');
        const rd = document.getElementById('coRadius');
        const pd = document.getElementById('coPadding');
        const lt = document.getElementById('coLabelText');
        
        if (bop) bop.parentElement.style.display = 'none';
        if (is) is.parentElement.style.display = 'none';
        if (ts) ts.parentElement.style.display = 'none';
        if (gw) gw.parentElement.style.display = 'none';
        if (rd) rd.parentElement.style.display = 'none';
        if (pd) pd.parentElement.style.display = 'none';
        if (lt) lt.parentElement.style.display = 'none';
        
        // Try to read SVG colors
        const svg = el.querySelector('svg');
        if (svg) {
            // Text color (first text)
            const textEl = svg.querySelector('text, tspan');
            if (textEl && tc) {
                const fill = textEl.getAttribute('fill') || textEl.style.fill;
                if (fill && fill.startsWith('#')) tc.value = fill.substring(0,7);
            }
            // BG color (first rect/circle/polygon)
            const bgEl = svg.querySelector('rect, circle, polygon, path');
            if (bgEl && bc) {
                const fill = bgEl.getAttribute('fill') || bgEl.style.fill;
                if (fill && fill.startsWith('#')) bc.value = fill.substring(0,7);
            }
            // Border color (first element with stroke)
            const borderEl = svg.querySelector('[stroke]');
            if (borderEl && ic) {
                const stroke = borderEl.getAttribute('stroke') || borderEl.style.stroke;
                if (stroke && stroke.startsWith('#')) ic.value = stroke.substring(0,7);
            }
        }
    }
}
`;
js = js.replace(oldSelectCallout, newSelectCallout);

// 2. Rewrite applyCalloutSettings
const applyStart = js.indexOf('function applyCalloutSettings() {');
const applyEnd = js.indexOf('function closeCalloutPanel()', applyStart); // wait, applyCalloutSettings is usually before or after closeCalloutPanel.
// Let's just use regex to match the body of applyCalloutSettings
// It ends with el.dataset.coTextColor = textColor; etc.
