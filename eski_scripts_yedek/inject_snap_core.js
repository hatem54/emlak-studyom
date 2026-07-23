const fs = require('fs');

const coreJs = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core.js';
let coreCode = fs.readFileSync(coreJs, 'utf8');

if (!coreCode.includes('getSnapGuides')) {
    const snapLogic = `
// ==========================================
// OBJECT SNAP LOGIC (Hizalama Sistemi)
// ==========================================
window.getSnapGuides = function(px, py, excludeEl) {
    const snapToggle = document.getElementById('drawSnapToggle');
    if (!snapToggle || !snapToggle.checked) return { x: px, y: py, guides: [] };
    
    const snapThreshold = 15; // 15px yaklaştığında yapış
    let closestX = null, closestY = null;
    let minDistX = snapThreshold, minDistY = snapThreshold;
    const guides = [];

    const baseW = window.baseW || 1080;
    const baseH = window.baseH || 1080;

    // Hedef noktalar (Tuval kenarları ve ortası)
    const targetsX = [0, baseW / 2, baseW];
    const targetsY = [0, baseH / 2, baseH];

    // Ekrandaki elementler
    const allEls = document.querySelectorAll('.editable-text, .editable-draw, .canvas-el, .cvi-item, .callout-wrap, .svg-callout');
    allEls.forEach(el => {
        if (el === excludeEl || el.dataset.locked === 'true' || el.style.display === 'none') return;
        
        let left = parseFloat(el.style.left);
        let top = parseFloat(el.style.top);
        let w = el.offsetWidth;
        let h = el.offsetHeight;
        
        if (!isNaN(left) && !isNaN(top) && w > 0 && h > 0) {
            targetsX.push(left, left + w / 2, left + w);
            targetsY.push(top, top + h / 2, top + h);
        }
    });

    // En yakın X'i bul
    targetsX.forEach(tx => {
        if (Math.abs(tx - px) < minDistX) {
            minDistX = Math.abs(tx - px);
            closestX = tx;
        }
    });

    // En yakın Y'yi bul
    targetsY.forEach(ty => {
        if (Math.abs(ty - py) < minDistY) {
            minDistY = Math.abs(ty - py);
            closestY = ty;
        }
    });

    let finalX = px, finalY = py;
    if (closestX !== null) { finalX = closestX; guides.push({ type: 'v', x: closestX }); }
    if (closestY !== null) { finalY = closestY; guides.push({ type: 'h', y: closestY }); }

    return { x: finalX, y: finalY, guides };
};

window.drawSnapGuides = function(guides) {
    // Canvas içinde değilsek, DOM tabanlı guideline'lar çizelim
    const container = document.getElementById('photo-layer') || document.body;
    
    // Eski guide'ları temizle
    document.querySelectorAll('.snap-guide-line').forEach(e => e.remove());
    
    if (!guides || guides.length === 0) return;
    
    guides.forEach(g => {
        const line = document.createElement('div');
        line.className = 'snap-guide-line';
        line.style.position = 'absolute';
        line.style.background = '#f59e0b';
        line.style.zIndex = '9999';
        line.style.pointerEvents = 'none';
        
        if (g.type === 'v') {
            line.style.left = g.x + 'px';
            line.style.top = '0';
            line.style.width = '1px';
            line.style.height = '100%';
            line.style.borderLeft = '1px dashed #f59e0b';
            line.style.background = 'transparent';
        } else {
            line.style.top = g.y + 'px';
            line.style.left = '0';
            line.style.width = '100%';
            line.style.height = '1px';
            line.style.borderTop = '1px dashed #f59e0b';
            line.style.background = 'transparent';
        }
        container.appendChild(line);
    });
};

window.clearSnapGuides = function() {
    document.querySelectorAll('.snap-guide-line').forEach(e => e.remove());
};
`;
    fs.appendFileSync(coreJs, snapLogic);
    console.log('Appended snap logic to core.js');
} else {
    console.log('Snap logic already exists in core.js');
}
