const fs = require('fs');
let calloutJs = fs.readFileSync('modules/callout.js', 'utf8');

// 1. Patch selectCalloutEl
const selectCalloutEl_Regex = /function selectCalloutEl\(el\) \{[\s\S]*?panel\.style\.display = 'block';\n\}/;
const selectCalloutEl_Replacement = `function selectCalloutEl(el) {
    // Diğer seçimleri kaldır
    document.querySelectorAll('.co-neon-block').forEach(e => e.style.outline = 'none');
    el.style.outline = '1px dashed rgba(255,255,255,0.4)';

    selectedCalloutEl = el;

    // Paneli doldur ve göster
    const panel = document.getElementById('calloutSettingsPanel');
    if (!panel) return;

    // Callout sekmesi aktif değilse, oraya geç
    const tab = document.getElementById('tab-callout');
    if (tab && tab.style.display === 'none') {
        if (typeof switchTab === 'function') switchTab('callout');
    }

    const isNeon = el.classList.contains('co-neon-block');

    let warningDiv = document.getElementById('svgCalloutWarning');
    if (!warningDiv) {
        warningDiv = document.createElement('div');
        warningDiv.id = 'svgCalloutWarning';
        warningDiv.style.cssText = 'color:#94a3b8; font-size:11px; margin-bottom:10px; text-align:center; padding:10px; background:rgba(0,0,0,0.2); border-radius:8px; border: 1px dashed rgba(255,255,255,0.1); line-height:1.4;';
        warningDiv.innerHTML = '<i>Bu hazır bir şablondur. Renk ve boyut ayarları panelden yapılamaz. Yazıyı değiştirmek için tuvaldeki şeklin üzerine <b>çift tıklayın</b>. Büyütmek için kenarlarından çekin.</i>';
        
        // title ın altına ekle
        const titleEl = panel.querySelector('div');
        if (titleEl) {
            titleEl.insertAdjacentElement('afterend', warningDiv);
        } else {
            panel.insertBefore(warningDiv, panel.firstChild);
        }
    }

    if (isNeon) {
        warningDiv.style.display = 'none';
        panel.querySelectorAll('.color-row, .slider-group, .input-group').forEach(e => e.style.display = 'flex');

        // Mevcut değerleri panele yükle
        const d = el.dataset;
        const ic = document.getElementById('coIconColor');
        const tc = document.getElementById('coTextColor');
        const bc = document.getElementById('coBgColor');
        const bop = document.getElementById('coBgOpacity');
        const is = document.getElementById('coIconSize');
        const ts = document.getElementById('coTextSize');
        const gw = document.getElementById('coGlow');
        const rd = document.getElementById('coRadius');
        const pd = document.getElementById('coPadding');
        const lt = document.getElementById('coLabelText');

        if (ic) ic.value = d.coIconColor || '#93c5fd';
        if (tc) tc.value = d.coTextColor || '#ffffff';
        if (bc) bc.value = d.coBgColor || '#0d1b2e';
        if (bop) { bop.value = d.coBgOpacity || 0; document.getElementById('coBgOpacityVal').textContent = bop.value + '%'; }
        if (is) { is.value = d.coIconSize || 64; document.getElementById('coIconSizeVal').textContent = is.value + 'px'; }
        if (ts) { ts.value = d.coTextSize || 14; document.getElementById('coTextSizeVal').textContent = ts.value + 'px'; }
        if (gw) { gw.value = d.coGlow || 80; document.getElementById('coGlowVal').textContent = gw.value + '%'; }
        if (rd) { rd.value = d.coRadius || 12; document.getElementById('coRadiusVal').textContent = rd.value + 'px'; }
        if (pd) { pd.value = d.coPadding || 10; document.getElementById('coPaddingVal').textContent = pd.value + 'px'; }
        if (lt) lt.value = (d.coLabel || '').replace(/\\n/g, ' ');
    } else {
        warningDiv.style.display = 'block';
        panel.querySelectorAll('.color-row, .slider-group, .input-group').forEach(e => e.style.display = 'none');
    }

    panel.style.display = 'block';
}`;

calloutJs = calloutJs.replace(selectCalloutEl_Regex, selectCalloutEl_Replacement);

// 2. Patch applyCalloutSettings
const applyCalloutSettings_Regex = /function applyCalloutSettings\(\) \{[\s\S]*?renderCalloutFromDataset\(el\);\n\}/;
const applyCalloutSettings_Replacement = `function applyCalloutSettings() {
    if (!selectedCalloutEl) return;
    const el = selectedCalloutEl;

    // Sadece Neon bloklar panelden güncellenebilir
    if (!el.classList.contains('co-neon-block')) return;

    const iconColor = document.getElementById('coIconColor')?.value || '#93c5fd';
    const textColor = document.getElementById('coTextColor')?.value || '#ffffff';
    const bgColor = document.getElementById('coBgColor')?.value || '#0d1b2e';
    const bgOpacity = parseInt(document.getElementById('coBgOpacity')?.value || 0);
    const iconSize = parseInt(document.getElementById('coIconSize')?.value || 64);
    const textSize = parseInt(document.getElementById('coTextSize')?.value || 14);
    const glowPct = parseInt(document.getElementById('coGlow')?.value || 80);
    const radius = parseInt(document.getElementById('coRadius')?.value || 12);
    const padding = parseInt(document.getElementById('coPadding')?.value || 10);
    const labelRaw = document.getElementById('coLabelText')?.value || '';

    // Dataset güncelle
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
}`;

calloutJs = calloutJs.replace(applyCalloutSettings_Regex, applyCalloutSettings_Replacement);

fs.writeFileSync('modules/callout.js', calloutJs, 'utf8');
console.log('Fixed SVG Callout Settings Panel overrides.');
