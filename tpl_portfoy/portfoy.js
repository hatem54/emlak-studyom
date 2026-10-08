/* ============================================================
   Portföy Şablon Seti - V3 (UNIQUE PRO & ULTRA QUALITY)
   10 Adet Özel Zümrüt & Altın Prestij Tasarım
============================================================ */

function _portfoyInit(){
    const container = document.getElementById('tpl-content-portfoy');
    if(!container) {
        setTimeout(_portfoyInit, 500);
        return;
    }
    container.innerHTML = '';
    buildPCards();
}

function buildPCards(){
    let grid = document.getElementById('canvaTplGridP');
    if(!grid) {
        grid = document.createElement('div');
        grid.className = 'canva-tpl-grid';
        grid.id = 'canvaTplGridP';
        const cont = document.getElementById('tpl-content-portfoy');
        if(cont) cont.appendChild(grid);
    }
    grid.innerHTML = '';
    if(typeof PORTFOY_CARDS !== 'undefined') {
        PORTFOY_CARDS.forEach((c, idx) => {
            const card = window.createTemplateCard ? window.createTemplateCard(c, idx, 'Portföy', (id) => {
                renderPTemplate(id);
            }) : null;
            if (card) grid.appendChild(card);
        });
    }
}

function parsePortfoyFeatures(rawLines) {
    if (typeof window.parseMinimalFeatures === 'function') {
        return window.parseMinimalFeatures(rawLines);
    }
    if (!rawLines) return [];
    const lines = Array.isArray(rawLines) ? rawLines : String(rawLines).split('\n');
    return lines.map(line => {
        let clean = line.replace(/^[•\-\*\d\.]+\s*/, '').trim();
        if (!clean) return null;
        let label = '';
        let value = '';
        if (clean.includes(':')) {
            const parts = clean.split(':');
            label = parts[0].trim();
            value = parts.slice(1).join(':').trim();
        } else {
            label = clean;
            value = '';
        }
        
        const l = (label + ' ' + value).toLowerCase();
        let icon = 'fa-circle-check';
        if (l.includes('m²') || l.includes('m2') || l.includes('alan') || l.includes('brüt') || l.includes('net') || l.includes('metrekare')) icon = 'fa-ruler-combined';
        else if (l.includes('oda') || l.includes('salon') || l.includes('yatak')) icon = 'fa-bed';
        else if (l.includes('kat') || l.includes('bina') || l.includes('site') || l.includes('blok')) icon = 'fa-building';
        else if (l.includes('yaş') || l.includes('yıl') || l.includes('tarih')) icon = 'fa-calendar-days';
        else if (l.includes('ısıtma') || l.includes('kombi') || l.includes('doğalgaz') || l.includes('yerden')) icon = 'fa-fire-flame-curved';
        else if (l.includes('otopark') || l.includes('garaj') || l.includes('araç')) icon = 'fa-car';
        else if (l.includes('banyo') || l.includes('wc') || l.includes('duş')) icon = 'fa-bath';
        else if (l.includes('havuz')) icon = 'fa-water-ladder';
        else if (l.includes('manzara') || l.includes('deniz') || l.includes('doğa') || l.includes('şehir')) icon = 'fa-mountain-sun';
        else if (l.includes('konum') || l.includes('cadde') || l.includes('mahalle') || l.includes('mevkii')) icon = 'fa-location-dot';
        else if (l.includes('kredi') || l.includes('tapu') || l.includes('aidat') || l.includes('fiyat')) icon = 'fa-file-invoice-dollar';
        else if (l.includes('asansör')) icon = 'fa-elevator';
        else if (l.includes('balkon') || l.includes('teras')) icon = 'fa-sun';
        else if (l.includes('güvenlik') || l.includes('kamera')) icon = 'fa-shield-halved';
        
        return { label, value, icon, raw: clean };
    }).filter(Boolean);
}

function renderPTemplate(id){
    if(!id) return;
    if (typeof id === 'object' && id && id.id) id = id.id;
    window.activeCanvaId = id;
    if (typeof activeCanvaId !== 'undefined') activeCanvaId = id;
    window.lastActiveTemplateId = id;
    if (typeof canvaRenderLayer !== 'undefined' && canvaRenderLayer) canvaRenderLayer.dataset.activeTemplateId = id;
    window.isCanvaMode = true;
    isCanvaMode = true;
    if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
        window.CanvasEmptyState.dismiss();
    } else {
        const es = document.getElementById('canvasEmptyState');
        if (es) { es.classList.add('is-hidden'); es.style.display = 'none'; }
    }
    if(typeof _kolajTemizle === 'function') _kolajTemizle();
    document.querySelectorAll('.normal-el').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.canva-generated, .canva-panel').forEach(e => e.remove());
    var baseCanvas = document.getElementById('draw-layer');
    document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
    
    if(typeof elLogo !== 'undefined' && elLogo && elLogo.src && elLogo.src !== window.location.href) {
        elLogo.style.visibility = 'visible'; elLogo.style.top = 'auto'; elLogo.style.left = 'auto'; elLogo.style.bottom = '50px'; elLogo.style.right = '50px';
    }
    photoLayer.style.display = 'none';
    canvaRenderLayer.style.display = 'block';

    const tData = (typeof window.getUnifiedTemplateData === 'function')
        ? window.getUnifiedTemplateData()
        : null;

    const title = (tData ? tData.title : 'SATILIK MÜSTAKİL VİLLA').toUpperCase();
    const price = tData ? tData.price : '12.500.000 TL';
    const contact = tData ? tData.contact : 'EMLAK STÜDYOM | 0532 000 00 00';
    const feats = tData ? tData.feats : '';
    
    const rawLines = (tData && tData.featsLines && tData.featsLines.length > 0)
        ? tData.featsLines
        : (feats ? feats.replace(/<[^>]+>/g, '\n').split('\n').map(s => s.trim()).filter(Boolean) : []);
    const effectiveLines = (rawLines && rawLines.length > 0) ? rawLines : [
        'BRÜT M²: 145 m²',
        'ODA SAYISI: 3+1',
        'BULUNDUĞU KAT: 4. KAT',
        'ISITMA: DOĞALGAZ KOMBİ',
        'BİNA YAŞI: SIFIR (0)'
    ];
    
    const bgImg = (typeof window.getTemplateActiveBg === 'function') ? window.getTemplateActiveBg('Portföy') : (uploadedImgUrl ? "background-image:url('" + uploadedImgUrl + "')" : "background-image:url('assets/bodrum_luxury_villa.jpg')");
    const x = $('photoXCtrl') ? $('photoXCtrl').value : 50;
    const y = $('photoYCtrl') ? $('photoYCtrl').value : 50;
    const bgPos = bgImg + ";background-position:" + x + "% " + y + "%;background-size:cover;";

    const canvasSize = getCanvasSize();
    const fullW = canvasSize.w;
    const fullH = canvasSize.h;
    const scaleX = v => (v / 1920) * fullW;
    const scaleY = v => (v / 1080) * fullH;
    const scaleMin = v => (v * 0.75) * Math.min(fullW/1920, fullH/1080);

    if (id === 'canvaP1') {
        const itemsP1 = parsePortfoyFeatures(effectiveLines).slice(0, 4);
        const featsHtmlP1 = itemsP1.map(item => {
            if (item.value) {
                return `<div style="background:rgba(255,255,255,0.06);border:1px solid rgba(187,247,208,0.22);border-radius:${scaleMin(14)}px;padding:${scaleY(10)}px ${scaleX(14)}px;display:flex;align-items:center;gap:${scaleX(12)}px;min-width:0;">
                    <div style="width:${scaleMin(42)}px;height:${scaleMin(42)}px;border-radius:${scaleMin(10)}px;background:rgba(187,247,208,0.18);color:#bbf7d0;display:flex;align-items:center;justify-content:center;font-size:${scaleMin(20)}px;flex-shrink:0;">
                        <i class="fa-solid ${item.icon}"></i>
                    </div>
                    <div style="display:flex;flex-direction:column;min-width:0;overflow:hidden;">
                        <span class="editable-text" style="font-size:${scaleMin(17)}px;color:#86efac;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                        <span class="editable-text" style="font-size:${scaleMin(23)}px;color:#ffffff;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.value}</span>
                    </div>
                </div>`;
            } else {
                return `<div style="background:rgba(255,255,255,0.06);border:1px solid rgba(187,247,208,0.22);border-radius:${scaleMin(14)}px;padding:${scaleY(10)}px ${scaleX(14)}px;display:flex;align-items:center;gap:${scaleX(12)}px;min-width:0;">
                    <div style="width:${scaleMin(42)}px;height:${scaleMin(42)}px;border-radius:${scaleMin(10)}px;background:rgba(187,247,208,0.18);color:#bbf7d0;display:flex;align-items:center;justify-content:center;font-size:${scaleMin(20)}px;flex-shrink:0;">
                        <i class="fa-solid ${item.icon}"></i>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(22)}px;color:#ffffff;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#091a12;font-family:'Space Grotesk',Inter,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;bottom:0;left:0;width:100%;height:${scaleY(340)}px;background:linear-gradient(180deg, rgba(6,78,59,0.92) 0%, rgba(4,40,30,0.98) 100%);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(187,247,208,0.25);z-index:2;display:flex;align-items:center;padding:0 ${scaleX(70)}px;justify-content:space-between;box-sizing:border-box;gap:${scaleX(36)}px;"><div style="display:flex;align-items:flex-end;gap:${scaleX(40)}px;min-width:0;flex:1;"><div style="font-size:${scaleMin(140)}px;color:#bbf7d0;font-weight:200;line-height:0.8;opacity:0.9;font-family:'Space Grotesk',sans-serif;">01</div><div style="min-width:0;"><div style="font-size:${scaleMin(64)}px;color:#ffffff;font-weight:900;line-height:1.15;margin-bottom:${scaleY(12)}px;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(54)}px;color:#bbf7d0;font-weight:900;letter-spacing:-0.5px;line-height:1;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div></div><div style="width:${scaleX(640)}px;display:grid;grid-template-columns:repeat(2, 1fr);gap:${scaleMin(12)}px;flex-shrink:0;">${featsHtmlP1}</div><div style="flex-shrink:0;"><div style="display:inline-flex;align-items:center;gap:${scaleX(10)}px;background:rgba(255,255,255,0.08);border:1px solid rgba(187,247,208,0.3);padding:${scaleY(12)}px ${scaleX(24)}px;border-radius:999px;font-size:${scaleMin(22)}px;color:#e2e8f0;font-weight:800;"><i class="fa-solid fa-phone" style="color:#bbf7d0;"></i> <span class="editable-text">${contact}</span></div></div></div></div>`;
    }
    else if (id === 'canvaP2') {
        const itemsP2 = parsePortfoyFeatures(effectiveLines).slice(0, 5);
        const featsHtmlP2 = itemsP2.map(item => {
            if (item.value) {
                return `<div style="display:flex;align-items:center;justify-content:space-between;padding:${scaleY(12)}px 0;border-bottom:1px solid rgba(22,101,52,0.12);gap:${scaleX(14)}px;">
                    <div style="display:flex;align-items:center;gap:${scaleX(10)}px;min-width:0;">
                        <i class="fa-solid ${item.icon}" style="color:#166534;font-size:${scaleMin(22)}px;width:${scaleMin(24)}px;text-align:center;flex-shrink:0;"></i>
                        <span class="editable-text" style="font-size:${scaleMin(22)}px;color:#475569;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(24)}px;color:#14532d;font-weight:800;white-space:nowrap;flex-shrink:0;">${item.value}</span>
                </div>`;
            } else {
                return `<div style="display:flex;align-items:center;gap:${scaleX(10)}px;padding:${scaleY(12)}px 0;border-bottom:1px solid rgba(22,101,52,0.12);">
                    <i class="fa-solid ${item.icon}" style="color:#166534;font-size:${scaleMin(22)}px;width:${scaleMin(24)}px;text-align:center;flex-shrink:0;"></i>
                    <span class="editable-text" style="font-size:${scaleMin(23)}px;color:#14532d;font-weight:700;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#f8faf9;font-family:'Space Grotesk',Inter,sans-serif;"><div class="photo-panel" style="width:${fullW - scaleX(640)}px;height:100%;position:absolute;right:0;top:0;${bgPos}"></div><div style="position:absolute;left:0;top:0;width:${scaleX(640)}px;height:100%;background:#ffffff;border-right:1px solid #e2e8f0;box-shadow:20px 0 50px rgba(0,0,0,0.1);padding:${scaleY(60)}px ${scaleX(50)}px;box-sizing:border-box;display:flex;flex-direction:column;z-index:2;"><div style="font-size:${scaleMin(18)}px;color:#166534;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:${scaleY(14)}px;">PORTFÖY KOLEKSİYONU</div><div style="font-size:${scaleMin(66)}px;color:#14532d;font-weight:900;line-height:1.15;margin-bottom:${scaleY(20)}px;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(58)}px;color:#166534;font-weight:900;margin-bottom:${scaleY(32)}px;padding-bottom:${scaleY(14)}px;border-bottom:2px solid #166534;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="display:flex;flex-direction:column;margin-bottom:${scaleY(30)}px;">${featsHtmlP2}</div><div style="margin-top:auto;display:flex;align-items:center;gap:${scaleX(10)}px;background:#f1f5f9;padding:${scaleY(12)}px ${scaleX(20)}px;border-radius:${scaleMin(12)}px;font-size:${scaleMin(22)}px;color:#334155;font-weight:700;"><i class="fa-solid fa-phone" style="color:#166534;"></i> <span class="editable-text">${contact}</span></div></div></div>`;
    }
    else if (id === 'canvaP3') {
        const itemsP3 = parsePortfoyFeatures(effectiveLines).slice(0, 5);
        const featsHtmlP3 = itemsP3.map(item => {
            if (item.value) {
                return `<div style="display:flex;align-items:center;justify-content:space-between;padding:${scaleY(12)}px 0;border-bottom:1px solid rgba(251,191,36,0.18);gap:${scaleX(16)}px;">
                    <div style="display:flex;align-items:center;gap:${scaleX(10)}px;min-width:0;">
                        <span style="color:#fbbf24;font-size:${scaleMin(18)}px;flex-shrink:0;">✦</span>
                        <span class="editable-text" style="font-size:${scaleMin(23)}px;color:#bbf7d0;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(26)}px;color:#fef08a;font-weight:800;white-space:nowrap;flex-shrink:0;">${item.value}</span>
                </div>`;
            } else {
                return `<div style="display:flex;align-items:center;gap:${scaleX(10)}px;padding:${scaleY(12)}px 0;border-bottom:1px solid rgba(251,191,36,0.18);">
                    <span style="color:#fbbf24;font-size:${scaleMin(18)}px;flex-shrink:0;">✦</span>
                    <span class="editable-text" style="font-size:${scaleMin(24)}px;color:#ffffff;font-weight:700;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#064e3b;font-family:'Space Grotesk',Inter,sans-serif;"><div class="photo-panel" style="width:${fullW - scaleX(740)}px;height:100%;position:absolute;right:0;top:0;${bgPos}"></div><div style="position:absolute;left:0;top:0;width:${scaleX(740)}px;height:100%;background:linear-gradient(180deg,#064e3b 0%,#022c22 100%);padding:${scaleY(70)}px ${scaleX(60)}px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:flex-start;border-right:1px solid rgba(251,191,36,0.3);box-shadow:25px 0 60px rgba(0,0,0,0.6);z-index:2;"><div style="display:inline-flex;align-items:center;gap:${scaleX(10)}px;color:#fbbf24;font-size:${scaleMin(22)}px;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:${scaleY(14)}px;"><i class="fa-solid fa-gem"></i> <span class="editable-text">VIP PORTFÖY</span></div><div style="font-size:${scaleMin(72)}px;color:#ffffff;font-weight:900;line-height:1.15;margin-bottom:${scaleY(20)}px;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(66)}px;color:#fbbf24;font-weight:900;margin-bottom:${scaleY(34)}px;padding-bottom:${scaleY(14)}px;border-bottom:2px solid rgba(251,191,36,0.3);text-shadow:0 0 20px rgba(251,191,36,0.3);"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="display:flex;flex-direction:column;margin-bottom:${scaleY(34)}px;">${featsHtmlP3}</div><div style="margin-top:auto;display:inline-flex;align-items:center;gap:${scaleX(12)}px;background:rgba(0,0,0,0.35);border:1px solid rgba(251,191,36,0.3);padding:${scaleY(12)}px ${scaleX(28)}px;border-radius:999px;font-size:${scaleMin(24)}px;color:#ffffff;font-weight:700;"><i class="fa-solid fa-phone" style="color:#fbbf24;"></i> <span class="editable-text">${contact}</span></div></div></div>`;
    }
    else if (id === 'canvaP4') {
        const itemsP4 = parsePortfoyFeatures(effectiveLines).slice(0, 4);
        const featsHtmlP4 = itemsP4.map(item => {
            if (item.value) {
                return `<div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:${scaleMin(14)}px;padding:${scaleY(10)}px ${scaleX(16)}px;display:flex;align-items:center;gap:${scaleX(12)}px;box-shadow:0 4px 12px rgba(0,0,0,0.05);min-width:0;">
                    <div style="width:${scaleMin(40)}px;height:${scaleMin(40)}px;border-radius:${scaleMin(8)}px;background:rgba(22,101,52,0.1);color:#166534;display:flex;align-items:center;justify-content:center;font-size:${scaleMin(20)}px;flex-shrink:0;">
                        <i class="fa-solid ${item.icon}"></i>
                    </div>
                    <div style="display:flex;flex-direction:column;min-width:0;overflow:hidden;">
                        <span class="editable-text" style="font-size:${scaleMin(16)}px;color:#64748b;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                        <span class="editable-text" style="font-size:${scaleMin(22)}px;color:#0f172a;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.value}</span>
                    </div>
                </div>`;
            } else {
                return `<div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:${scaleMin(14)}px;padding:${scaleY(10)}px ${scaleX(16)}px;display:flex;align-items:center;gap:${scaleX(12)}px;box-shadow:0 4px 12px rgba(0,0,0,0.05);min-width:0;">
                    <div style="width:${scaleMin(40)}px;height:${scaleMin(40)}px;border-radius:${scaleMin(8)}px;background:rgba(22,101,52,0.1);color:#166534;display:flex;align-items:center;justify-content:center;font-size:${scaleMin(20)}px;flex-shrink:0;">
                        <i class="fa-solid ${item.icon}"></i>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(22)}px;color:#0f172a;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#f1f5f9;font-family:'Space Grotesk',Inter,sans-serif;"><div style="position:absolute;top:${scaleY(34)}px;left:0;width:100%;text-align:center;padding:0 ${scaleX(60)}px;box-sizing:border-box;"><div style="font-size:${scaleMin(18)}px;color:#166534;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:${scaleY(4)}px;">YATAY VİTRİN KUŞAĞI</div><div style="font-size:${scaleMin(64)}px;color:#14532d;font-weight:900;letter-spacing:1px;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div></div><div class="photo-panel" style="width:${scaleX(1760)}px;height:${scaleY(580)}px;position:absolute;left:${scaleX(80)}px;top:${scaleY(160)}px;${bgPos};border-radius:${scaleMin(18)}px;box-shadow:0 30px 60px rgba(0,0,0,0.18);"></div><div style="position:absolute;bottom:${scaleY(30)}px;left:${scaleX(80)}px;right:${scaleX(80)}px;display:flex;align-items:center;justify-content:space-between;gap:${scaleX(20)}px;"><div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:${scaleMin(12)}px;flex:1;">${featsHtmlP4}</div><div style="display:flex;align-items:center;gap:${scaleX(14)}px;flex-shrink:0;"><div style="background:#166534;color:#ffffff;padding:${scaleY(12)}px ${scaleX(28)}px;border-radius:${scaleMin(14)}px;font-size:${scaleMin(46)}px;font-weight:900;box-shadow:0 10px 25px rgba(22,101,52,0.3);"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="background:#ffffff;border:1px solid #cbd5e1;padding:${scaleY(12)}px ${scaleX(24)}px;border-radius:${scaleMin(14)}px;font-size:${scaleMin(22)}px;color:#334155;font-weight:700;"><i class="fa-solid fa-phone" style="color:#166534;margin-right:${scaleX(8)}px;"></i><span class="editable-text">${contact}</span></div></div></div></div>`;
    }
    else if (id === 'canvaP5') {
        const itemsP5 = parsePortfoyFeatures(effectiveLines).slice(0, 5);
        const featsHtmlP5 = itemsP5.map(item => {
            if (item.value) {
                return `<div style="display:flex;align-items:center;justify-content:space-between;padding:${scaleY(12)}px 0;border-bottom:1px solid rgba(22,101,52,0.12);gap:${scaleX(14)}px;">
                    <div style="display:flex;align-items:center;gap:${scaleX(10)}px;min-width:0;">
                        <i class="fa-solid ${item.icon}" style="color:#166534;font-size:${scaleMin(22)}px;width:${scaleMin(24)}px;text-align:center;flex-shrink:0;"></i>
                        <span class="editable-text" style="font-size:${scaleMin(22)}px;color:#475569;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(24)}px;color:#14532d;font-weight:800;white-space:nowrap;flex-shrink:0;">${item.value}</span>
                </div>`;
            } else {
                return `<div style="display:flex;align-items:center;gap:${scaleX(10)}px;padding:${scaleY(12)}px 0;border-bottom:1px solid rgba(22,101,52,0.12);">
                    <i class="fa-solid ${item.icon}" style="color:#166534;font-size:${scaleMin(22)}px;width:${scaleMin(24)}px;text-align:center;flex-shrink:0;"></i>
                    <span class="editable-text" style="font-size:${scaleMin(23)}px;color:#14532d;font-weight:700;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#ffffff;font-family:'Space Grotesk',Inter,sans-serif;"><div style="position:absolute;left:${scaleX(40)}px;top:${scaleY(40)}px;right:${scaleX(40)}px;bottom:${scaleY(40)}px;border:2px solid #166534;pointer-events:none;z-index:10;"></div><div class="photo-panel" style="width:${scaleX(1180)}px;height:${scaleY(760)}px;position:absolute;right:${scaleX(80)}px;top:${scaleY(80)}px;${bgPos};border-radius:${scaleMin(12)}px;box-shadow:0 25px 50px rgba(0,0,0,0.12);"></div><div style="position:absolute;left:${scaleX(80)}px;top:${scaleY(90)}px;width:${scaleX(520)}px;z-index:5;"><div style="font-size:${scaleMin(18)}px;color:#166534;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:${scaleY(14)}px;">MİMARİ KOLEKSİYON</div><div style="font-size:${scaleMin(68)}px;color:#14532d;font-weight:900;line-height:1.15;margin-bottom:${scaleY(20)}px;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(58)}px;color:#0f172a;font-weight:900;margin-bottom:${scaleY(34)}px;padding-bottom:${scaleY(14)}px;border-bottom:2px solid #166534;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="display:flex;flex-direction:column;margin-bottom:${scaleY(34)}px;">${featsHtmlP5}</div><div style="display:inline-flex;align-items:center;gap:${scaleX(10)}px;background:#f8faf9;border:1px solid #cbd5e1;padding:${scaleY(10)}px ${scaleX(22)}px;border-radius:${scaleMin(10)}px;font-size:${scaleMin(22)}px;color:#334155;font-weight:700;"><i class="fa-solid fa-phone" style="color:#166534;"></i> <span class="editable-text">${contact}</span></div></div></div>`;
    }
    else if (id === 'canvaP6') {
        const itemsP6 = parsePortfoyFeatures(effectiveLines).slice(0, 4);
        const featsHtmlP6 = itemsP6.map(item => {
            if (item.value) {
                return `<div style="background:rgba(0,0,0,0.28);border:1px solid rgba(187,247,208,0.25);border-radius:${scaleMin(12)}px;padding:${scaleY(10)}px ${scaleX(14)}px;display:flex;align-items:center;gap:${scaleX(12)}px;">
                    <div style="width:${scaleMin(40)}px;height:${scaleMin(40)}px;border-radius:${scaleMin(8)}px;background:rgba(187,247,208,0.18);color:#bbf7d0;display:flex;align-items:center;justify-content:center;font-size:${scaleMin(20)}px;flex-shrink:0;">
                        <i class="fa-solid ${item.icon}"></i>
                    </div>
                    <div style="display:flex;flex-direction:column;min-width:0;overflow:hidden;">
                        <span class="editable-text" style="font-size:${scaleMin(17)}px;color:#86efac;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                        <span class="editable-text" style="font-size:${scaleMin(23)}px;color:#ffffff;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.value}</span>
                    </div>
                </div>`;
            } else {
                return `<div style="background:rgba(0,0,0,0.28);border:1px solid rgba(187,247,208,0.25);border-radius:${scaleMin(12)}px;padding:${scaleY(10)}px ${scaleX(14)}px;display:flex;align-items:center;gap:${scaleX(12)}px;">
                    <div style="width:${scaleMin(40)}px;height:${scaleMin(40)}px;border-radius:${scaleMin(8)}px;background:rgba(187,247,208,0.18);color:#bbf7d0;display:flex;align-items:center;justify-content:center;font-size:${scaleMin(20)}px;flex-shrink:0;">
                        <i class="fa-solid ${item.icon}"></i>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(22)}px;color:#ffffff;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#064e3b;font-family:'Space Grotesk',Inter,sans-serif;"><div style="position:absolute;bottom:${scaleY(-40)}px;left:${scaleX(20)}px;font-size:${scaleMin(420)}px;color:rgba(255,255,255,0.06);font-weight:900;line-height:0.8;white-space:nowrap;pointer-events:none;">01</div><div class="photo-panel" style="width:${scaleX(1020)}px;height:${scaleY(820)}px;position:absolute;right:${scaleX(60)}px;top:${scaleY(100)}px;${bgPos};box-shadow:0 30px 70px rgba(0,0,0,0.55);border-radius:${scaleMin(18)}px;border:1px solid rgba(255,255,255,0.15);"></div><div style="position:absolute;left:${scaleX(70)}px;top:${scaleY(100)}px;width:${scaleX(680)}px;z-index:5;"><div style="font-size:${scaleMin(18)}px;color:#bbf7d0;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:${scaleY(12)}px;">ÖZEL SEÇKİ</div><div style="font-size:${scaleMin(66)}px;color:#ffffff;font-weight:900;line-height:1.15;margin-bottom:${scaleY(20)}px;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="display:inline-block;font-size:${scaleMin(58)}px;color:#064e3b;font-weight:900;background:#bbf7d0;padding:${scaleY(10)}px ${scaleX(28)}px;border-radius:${scaleMin(14)}px;margin-bottom:${scaleY(30)}px;box-shadow:0 12px 30px rgba(0,0,0,0.3);"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:${scaleMin(12)}px;margin-bottom:${scaleY(30)}px;">${featsHtmlP6}</div><div style="display:inline-flex;align-items:center;gap:${scaleX(10)}px;background:rgba(0,0,0,0.35);border:1px solid rgba(187,247,208,0.25);padding:${scaleY(10)}px ${scaleX(24)}px;border-radius:999px;font-size:${scaleMin(24)}px;color:#e2e8f0;font-weight:700;"><i class="fa-solid fa-phone" style="color:#bbf7d0;"></i> <span class="editable-text">${contact}</span></div></div></div>`;
    }
    else if (id === 'canvaP7') {
        const itemsP7 = parsePortfoyFeatures(effectiveLines).slice(0, 5);
        const featsHtmlP7 = itemsP7.map(item => {
            if (item.value) {
                return `<div style="display:flex;align-items:center;justify-content:space-between;padding:${scaleY(10)}px 0;border-bottom:1px solid #e2e8f0;gap:${scaleX(14)}px;">
                    <div style="display:flex;align-items:center;gap:${scaleX(10)}px;min-width:0;">
                        <i class="fa-solid ${item.icon}" style="color:#166534;font-size:${scaleMin(22)}px;width:${scaleMin(24)}px;text-align:center;flex-shrink:0;"></i>
                        <span class="editable-text" style="font-size:${scaleMin(22)}px;color:#475569;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(24)}px;color:#0f172a;font-weight:800;white-space:nowrap;flex-shrink:0;">${item.value}</span>
                </div>`;
            } else {
                return `<div style="display:flex;align-items:center;gap:${scaleX(10)}px;padding:${scaleY(10)}px 0;border-bottom:1px solid #e2e8f0;">
                    <i class="fa-solid ${item.icon}" style="color:#166534;font-size:${scaleMin(22)}px;width:${scaleMin(24)}px;text-align:center;flex-shrink:0;"></i>
                    <span class="editable-text" style="font-size:${scaleMin(23)}px;color:#0f172a;font-weight:700;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#ffffff;font-family:'Space Grotesk',Inter,sans-serif;"><div class="photo-panel" style="width:100%;height:${scaleY(600)}px;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;left:0;top:${scaleY(600)}px;width:50%;height:${scaleY(480)}px;background:linear-gradient(180deg,#064e3b 0%,#043327 100%);padding:${scaleY(46)}px ${scaleX(60)}px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;"><div style="font-size:${scaleMin(18)}px;color:#bbf7d0;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:${scaleY(8)}px;">LÜKS YAŞAM</div><div style="font-size:${scaleMin(64)}px;color:#ffffff;font-weight:900;line-height:1.2;margin-bottom:${scaleY(18)}px;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(58)}px;color:#bbf7d0;font-weight:900;margin-bottom:${scaleY(20)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="display:inline-flex;align-items:center;gap:${scaleX(10)}px;font-size:${scaleMin(22)}px;color:#e2e8f0;font-weight:700;"><i class="fa-solid fa-phone" style="color:#bbf7d0;"></i> <span class="editable-text">${contact}</span></div></div><div style="position:absolute;right:0;top:${scaleY(600)}px;width:50%;height:${scaleY(480)}px;background:#f8fafc;padding:${scaleY(46)}px ${scaleX(60)}px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;border-left:1px solid #e2e8f0;"><div style="font-size:${scaleMin(18)}px;color:#166534;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:${scaleY(12)}px;">PORTFÖY BİLGİLERİ</div><div style="display:flex;flex-direction:column;">${featsHtmlP7}</div></div></div>`;
    }
    else if (id === 'canvaP8') {
        const itemsP8 = parsePortfoyFeatures(effectiveLines).slice(0, 5);
        const featsHtmlP8 = itemsP8.map(item => {
            if (item.value) {
                return `<div style="display:flex;align-items:center;justify-content:space-between;padding:${scaleY(10)}px 0;border-bottom:1px solid rgba(187,247,208,0.2);gap:${scaleX(14)}px;">
                    <div style="display:flex;align-items:center;gap:${scaleX(10)}px;min-width:0;">
                        <span style="color:#bbf7d0;font-size:${scaleMin(16)}px;flex-shrink:0;">✦</span>
                        <span class="editable-text" style="font-size:${scaleMin(22)}px;color:#86efac;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(24)}px;color:#ffffff;font-weight:800;white-space:nowrap;flex-shrink:0;">${item.value}</span>
                </div>`;
            } else {
                return `<div style="display:flex;align-items:center;gap:${scaleX(10)}px;padding:${scaleY(10)}px 0;border-bottom:1px solid rgba(187,247,208,0.2);">
                    <span style="color:#bbf7d0;font-size:${scaleMin(16)}px;flex-shrink:0;">✦</span>
                    <span class="editable-text" style="font-size:${scaleMin(23)}px;color:#ffffff;font-weight:700;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#091a12;font-family:'Space Grotesk',Inter,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};"></div><svg style="position:absolute;left:0;top:0;width:100%;height:100%;z-index:1;pointer-events:none;" preserveAspectRatio="none" viewBox="0 0 100 100"><polygon points="0,0 46,0 36,100 0,100" fill="#bbf7d0" /></svg><svg style="position:absolute;left:0;top:0;width:100%;height:100%;z-index:2;pointer-events:none;" preserveAspectRatio="none" viewBox="0 0 100 100"><polygon points="0,0 45,0 35,100 0,100" fill="#064e3b" /></svg><div style="position:absolute;left:0;top:0;width:100%;height:100%;z-index:3;display:flex;flex-direction:column;justify-content:center;padding-left:${scaleX(70)}px;box-sizing:border-box;pointer-events:none;"><div style="width:${scaleX(580)}px;pointer-events:auto;"><div style="font-size:${scaleMin(18)}px;color:#bbf7d0;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:${scaleY(10)}px;">GEOMETRİK SERİ</div><div style="font-size:${scaleMin(68)}px;color:#ffffff;font-weight:900;line-height:1.15;margin-bottom:${scaleY(20)}px;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(54)}px;color:#064e3b;font-weight:900;background:#bbf7d0;padding:${scaleY(10)}px ${scaleX(28)}px;border-radius:${scaleMin(14)}px;display:inline-block;margin-bottom:${scaleY(30)}px;box-shadow:0 10px 25px rgba(0,0,0,0.3);"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="display:flex;flex-direction:column;margin-bottom:${scaleY(30)}px;max-width:${scaleX(520)}px;">${featsHtmlP8}</div></div></div><div style="position:absolute;bottom:${scaleY(30)}px;right:${scaleX(40)}px;background:rgba(6, 78, 59, 0.95);backdrop-filter:blur(15px);padding:${scaleY(12)}px ${scaleX(32)}px;border-radius:999px;font-size:${scaleMin(24)}px;color:#ffffff;font-weight:700;letter-spacing:1px;z-index:20;border:1px solid #bbf7d0;box-shadow:0 15px 35px rgba(0,0,0,0.4);"><i class="fa-solid fa-phone" style="color:#bbf7d0;margin-right:${scaleX(8)}px;"></i><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaP9') {
        const itemsP9 = parsePortfoyFeatures(effectiveLines).slice(0, 4);
        const featsHtmlP9 = itemsP9.map(item => {
            if (item.value) {
                return `<div style="background:rgba(255,255,255,0.06);border:1px solid rgba(187,247,208,0.22);border-radius:${scaleMin(12)}px;padding:${scaleY(10)}px ${scaleX(14)}px;display:flex;align-items:center;gap:${scaleX(12)}px;">
                    <div style="width:${scaleMin(38)}px;height:${scaleMin(38)}px;border-radius:${scaleMin(8)}px;background:rgba(187,247,208,0.18);color:#bbf7d0;display:flex;align-items:center;justify-content:center;font-size:${scaleMin(18)}px;flex-shrink:0;">
                        <i class="fa-solid ${item.icon}"></i>
                    </div>
                    <div style="display:flex;flex-direction:column;min-width:0;overflow:hidden;">
                        <span class="editable-text" style="font-size:${scaleMin(16)}px;color:#86efac;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                        <span class="editable-text" style="font-size:${scaleMin(22)}px;color:#ffffff;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.value}</span>
                    </div>
                </div>`;
            } else {
                return `<div style="background:rgba(255,255,255,0.06);border:1px solid rgba(187,247,208,0.22);border-radius:${scaleMin(12)}px;padding:${scaleY(10)}px ${scaleX(14)}px;display:flex;align-items:center;gap:${scaleX(12)}px;">
                    <div style="width:${scaleMin(38)}px;height:${scaleMin(38)}px;border-radius:${scaleMin(8)}px;background:rgba(187,247,208,0.18);color:#bbf7d0;display:flex;align-items:center;justify-content:center;font-size:${scaleMin(18)}px;flex-shrink:0;">
                        <i class="fa-solid ${item.icon}"></i>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(22)}px;color:#ffffff;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#091a12;font-family:'Space Grotesk',Inter,sans-serif;"><div class="photo-panel" style="width:100%;height:${scaleY(940)}px;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;top:${scaleY(50)}px;right:${scaleX(60)}px;background:rgba(6,78,59,0.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(187,247,208,0.25);border-radius:${scaleMin(20)}px;padding:${scaleY(24)}px ${scaleX(28)}px;width:${scaleX(520)}px;box-sizing:border-box;box-shadow:0 25px 60px rgba(0,0,0,0.6);z-index:10;"><div style="font-size:${scaleMin(18)}px;color:#bbf7d0;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:${scaleY(14)}px;border-bottom:1px solid rgba(187,247,208,0.2);padding-bottom:${scaleY(8)}px;">MÜLK ÖZELLİKLERİ</div><div style="display:flex;flex-direction:column;gap:${scaleY(10)}px;margin-bottom:${scaleY(16)}px;">${featsHtmlP9}</div><div style="display:flex;align-items:center;gap:${scaleX(10)}px;font-size:${scaleMin(20)}px;color:#ffffff;font-weight:700;"><i class="fa-solid fa-phone" style="color:#bbf7d0;"></i> <span class="editable-text">${contact}</span></div></div><div style="position:absolute;bottom:0;left:0;width:100%;height:${scaleY(140)}px;background:linear-gradient(180deg,#064e3b 0%,#043327 100%);display:flex;align-items:center;padding:0 ${scaleX(70)}px;box-sizing:border-box;justify-content:space-between;border-top:1px solid rgba(187,247,208,0.25);z-index:10;"><div style="font-size:${scaleMin(54)}px;color:#ffffff;font-weight:900;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(58)}px;color:#bbf7d0;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div></div>`;
    }
    else if (id === 'canvaP10') {
        const itemsP10 = parsePortfoyFeatures(effectiveLines).slice(0, 4);
        const featsHtmlP10 = itemsP10.map(item => {
            if (item.value) {
                return `<div style="display:flex;align-items:center;justify-content:space-between;padding:${scaleY(10)}px 0;border-bottom:1px solid #e2e8f0;gap:${scaleX(14)}px;">
                    <div style="display:flex;align-items:center;gap:${scaleX(10)}px;min-width:0;">
                        <span style="color:#166534;font-size:${scaleMin(16)}px;flex-shrink:0;">✦</span>
                        <span class="editable-text" style="font-size:${scaleMin(20)}px;color:#64748b;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(24)}px;color:#14532d;font-weight:800;white-space:nowrap;flex-shrink:0;">${item.value}</span>
                </div>`;
            } else {
                return `<div style="display:flex;align-items:center;gap:${scaleX(10)}px;padding:${scaleY(10)}px 0;border-bottom:1px solid #e2e8f0;">
                    <span style="color:#166534;font-size:${scaleMin(16)}px;flex-shrink:0;">✦</span>
                    <span class="editable-text" style="font-size:${scaleMin(22)}px;color:#14532d;font-weight:700;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#f1f5f9;font-family:'Space Grotesk',Inter,sans-serif;"><div class="photo-panel" style="width:${scaleX(1660)}px;height:${scaleY(740)}px;position:absolute;left:${scaleX(130)}px;top:${scaleY(60)}px;${bgPos};border-radius:${scaleMin(20)}px;box-shadow:0 35px 70px rgba(0,0,0,0.18);"></div><div style="position:absolute;bottom:${scaleY(40)}px;left:50%;transform:translateX(-50%);background:#ffffff;padding:${scaleY(34)}px ${scaleX(64)}px;border-radius:${scaleMin(22)}px;box-shadow:0 25px 60px rgba(0,0,0,0.15);width:${scaleX(1200)}px;box-sizing:border-box;border:1px solid #e2e8f0;z-index:10;"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:${scaleY(16)}px;border-bottom:2px solid #166534;padding-bottom:${scaleY(12)}px;"><div><div style="font-size:${scaleMin(16)}px;color:#166534;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:${scaleY(4)}px;">PRESTİJ VİTRİN</div><div style="font-size:${scaleMin(58)}px;color:#14532d;font-weight:900;text-transform:uppercase;line-height:1.1;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div></div><div style="font-size:${scaleMin(58)}px;color:#166534;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:${scaleX(28)}px;margin-bottom:${scaleY(16)}px;">${featsHtmlP10}</div><div style="text-align:center;font-size:${scaleMin(22)}px;color:#64748b;font-weight:700;"><i class="fa-solid fa-phone" style="color:#166534;margin-right:${scaleX(8)}px;"></i><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div></div>`;
    }

    canvaRenderLayer.querySelectorAll('.photo-panel').forEach(el => enablePhotoDrag(el));
    canvaRenderLayer.querySelectorAll('.editable-text').forEach(el => enableInlineEdit(el));
    requestAnimationFrame(() => {
        if(typeof redrawAll === 'function') redrawAll();
    });
}

window.renderPTemplate = renderPTemplate;
setTimeout(_portfoyInit, 200);


