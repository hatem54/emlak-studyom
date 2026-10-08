/* ============================================================
   Minimal Tasarim Şablon Seti - V2 (ULTRA PRO)
   10 Adet Ultra Premium Tasarım
============================================================ */

function _minimalInit(){
    const container = document.getElementById('tpl-content-minimal');
    if(!container) {
        setTimeout(_minimalInit, 500);
        return;
    }
    container.innerHTML = '';
    buildMCards();
}

function buildMCards(){
    let grid = document.getElementById('canvaTplGridM');
    if(!grid) {
        grid = document.createElement('div');
        grid.className = 'canva-tpl-grid';
        grid.id = 'canvaTplGridM';
        const cont = document.getElementById('tpl-content-minimal');
        if(cont) cont.appendChild(grid);
    }
    grid.innerHTML = '';
    
    if(typeof MINIMAL_CARDS !== 'undefined') {
        MINIMAL_CARDS.forEach((c, idx) => {
            const card = window.createTemplateCard ? window.createTemplateCard(c, idx, 'Minimal', (id) => renderMTemplate(id)) : null;
            if (card) grid.appendChild(card);
        });
    }
}

function parseMinimalFeatures(rawLines) {
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
        if (l.includes('m²') || l.includes('m2') || l.includes('alan') || l.includes('brüt') || l.includes('net') || l.includes('metrekare') || l.includes('yüzölçüm')) icon = 'fa-ruler-combined';
        else if (l.includes('oda') || l.includes('yatak') || l.includes('salon')) icon = 'fa-bed';
        else if (l.includes('kat') || l.includes('bina') || l.includes('apartman') || l.includes('blok') || l.includes('site')) icon = 'fa-building';
        else if (l.includes('yaş') || l.includes('yapım') || l.includes('tarih') || l.includes('yıl')) icon = 'fa-calendar-days';
        else if (l.includes('ısıtma') || l.includes('kombi') || l.includes('doğalgaz') || l.includes('yerden')) icon = 'fa-fire-flame-curved';
        else if (l.includes('otopark') || l.includes('garaj') || l.includes('araç')) icon = 'fa-car';
        else if (l.includes('banyo') || l.includes('wc') || l.includes('duş')) icon = 'fa-bath';
        else if (l.includes('havuz')) icon = 'fa-water-ladder';
        else if (l.includes('manzara') || l.includes('doğa') || l.includes('deniz') || l.includes('şehir') || l.includes('dağ')) icon = 'fa-mountain-sun';
        else if (l.includes('konum') || l.includes('bölge') || l.includes('cadde') || l.includes('mahalle') || l.includes('mevkii')) icon = 'fa-location-dot';
        else if (l.includes('kredi') || l.includes('tapu') || l.includes('aidat') || l.includes('kira') || l.includes('fiyat')) icon = 'fa-file-invoice-dollar';
        else if (l.includes('asansör')) icon = 'fa-elevator';
        else if (l.includes('balkon') || l.includes('teras')) icon = 'fa-sun';
        else if (l.includes('güvenlik') || l.includes('kamera')) icon = 'fa-shield-halved';
        
        return { label, value, icon, raw: clean };
    }).filter(Boolean);
}
window.parseMinimalFeatures = parseMinimalFeatures;

function renderMTemplate(id){
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
    
    if(typeof elLogo !== 'undefined' && elLogo) {
        const img = elLogo.querySelector('img');
        if (img && img.src && img.src.length > 10 && !img.src.includes('empty')) {
            elLogo.style.visibility = 'visible';
            elLogo.style.top = 'auto';
            elLogo.style.left = 'auto';
            elLogo.style.bottom = '50px';
            elLogo.style.right = '50px';
        }
    }
    photoLayer.style.display = 'none';
    canvaRenderLayer.style.display = 'block';

    const uData = (typeof window.getUnifiedTemplateData === 'function') ? window.getUnifiedTemplateData() : null;
    const title = (uData ? uData.title : ($('canvaMTitle') ? $('canvaMTitle').value : 'SATILIK MÜSTAKİL EV')).toUpperCase();
    const price = uData ? uData.price : ($('canvaMPrice') ? $('canvaMPrice').value : '12.500.000 TL');
    const contact = uData ? uData.contact : ($('canvaMContact') ? $('canvaMContact').value : 'EMLAK STUDYOM | 0532 000 00 00');
    const feats = uData ? uData.feats : '';
    
    const rawLines = (uData && uData.featsLines && uData.featsLines.length > 0) 
        ? uData.featsLines 
        : (feats ? feats.replace(/<[^>]+>/g, '\n').split('\n').map(s => s.trim()).filter(Boolean) : []);
    const effectiveLines = (rawLines && rawLines.length > 0) ? rawLines : [
        'BRÜT M²: 145 m²',
        'ODA SAYISI: 3+1',
        'BULUNDUĞU KAT: 4. KAT',
        'ISITMA: DOĞALGAZ KOMBİ',
        'BİNA YAŞI: SIFIR (0)'
    ];
    
    const bgImg = (typeof window.getTemplateActiveBg === 'function') ? window.getTemplateActiveBg('Minimal') : (uploadedImgUrl ? "background-image:url('" + uploadedImgUrl + "')" : "background-image:url('assets/horizontal_interior.jpg')");
    const x = $('photoXCtrl') ? $('photoXCtrl').value : 50;
    const y = $('photoYCtrl') ? $('photoYCtrl').value : 50;
    const bgPos = bgImg + ";background-position:" + x + "% " + y + "%;background-size:cover;";

    const canvasSize = getCanvasSize();
    const fullW = canvasSize.w;
    const fullH = canvasSize.h;

    const scaleX = v => (v / 1920) * fullW;
    const scaleY = v => (v / 1080) * fullH;
    const scaleMin = v => (v * 0.75) * Math.min(fullW/1920, fullH/1080);
    let photoW = fullW;
    let photoH = fullH;

    if (id === 'canvaM1') {
        const itemsM1 = parseMinimalFeatures(effectiveLines).slice(0, 5);
        const featsHtmlM1 = itemsM1.map(item => {
            if (item.value) {
                return `<div style="display:flex;align-items:center;justify-content:space-between;padding:${scaleY(12)}px 0;border-bottom:1px solid rgba(255,255,255,0.08);gap:${scaleX(16)}px;">
                    <div style="display:flex;align-items:center;gap:${scaleX(12)}px;min-width:0;">
                        <i class="fa-solid ${item.icon}" style="color:#38bdf8;font-size:${scaleMin(24)}px;width:${scaleMin(26)}px;text-align:center;flex-shrink:0;"></i>
                        <span class="editable-text" style="font-size:${scaleMin(26)}px;color:#94a3b8;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(28)}px;color:#ffffff;font-weight:800;white-space:nowrap;flex-shrink:0;text-align:right;">${item.value}</span>
                </div>`;
            } else {
                return `<div style="display:flex;align-items:center;gap:${scaleX(12)}px;padding:${scaleY(12)}px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                    <i class="fa-solid ${item.icon}" style="color:#38bdf8;font-size:${scaleMin(24)}px;width:${scaleMin(26)}px;text-align:center;flex-shrink:0;"></i>
                    <span class="editable-text" style="font-size:${scaleMin(28)}px;color:#ffffff;font-weight:700;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#090d16;font-family:'Space Grotesk',Inter,sans-serif;"><div class="photo-panel" style="width:${fullW - scaleX(760)}px;height:${fullH}px;position:absolute;left:${scaleX(760)}px;top:0;${bgPos}"><div style="position:absolute;left:0;top:0;bottom:0;width:${scaleX(100)}px;background:linear-gradient(to right, rgba(9,13,22,0.65), transparent);pointer-events:none;"></div></div><div style="position:absolute;left:0;top:0;width:${scaleX(760)}px;height:${fullH}px;background:linear-gradient(180deg, #090d16 0%, #0f172a 100%);border-right:1px solid rgba(255,255,255,0.08);box-shadow:25px 0 60px rgba(0,0,0,0.65);z-index:2;display:flex;flex-direction:column;justify-content:flex-start;padding:${scaleY(56)}px ${scaleX(64)}px;box-sizing:border-box;"><div style="display:flex;align-items:center;gap:${scaleX(12)}px;margin-bottom:${scaleY(16)}px;"><span style="width:${scaleX(32)}px;height:3px;background:#38bdf8;border-radius:2px;"></span><span class="editable-text" style="font-size:${scaleMin(24)}px;color:#38bdf8;font-weight:800;letter-spacing:4px;text-transform:uppercase;">ÖZEL PORTFÖY</span></div><div style="font-size:${scaleMin(76)}px;color:#ffffff;font-weight:900;line-height:1.15;letter-spacing:-0.5px;margin-bottom:${scaleY(20)}px;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="margin-bottom:${scaleY(28)}px;padding-bottom:${scaleY(16)}px;border-bottom:2px solid rgba(56,189,248,0.35);"><div style="font-size:${scaleMin(20)}px;color:#94a3b8;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:${scaleY(4)}px;">SATIŞ FİYATI</div><div style="font-size:${scaleMin(72)}px;color:#38bdf8;font-weight:900;letter-spacing:-1px;line-height:1;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="display:flex;flex-direction:column;margin-bottom:${scaleY(28)}px;">${featsHtmlM1}</div><div style="margin-top:auto;display:flex;align-items:center;gap:${scaleX(14)}px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);padding:${scaleY(14)}px ${scaleX(22)}px;border-radius:${scaleMin(12)}px;"><i class="fa-solid fa-phone" style="color:#38bdf8;font-size:${scaleMin(26)}px;flex-shrink:0;"></i><span class="editable-text" style="font-size:${scaleMin(26)}px;color:#e2e8f0;font-weight:800;letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${contact}</span></div></div></div>`;
    }
    else if (id === 'canvaM2') {
        const itemsM2 = parseMinimalFeatures(effectiveLines).slice(0, 4);
        const featsHtmlM2 = itemsM2.map(item => {
            if (item.value) {
                return `<div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:${scaleMin(14)}px;padding:${scaleY(12)}px ${scaleX(16)}px;display:flex;align-items:center;gap:${scaleX(14)}px;text-align:left;min-width:0;">
                    <div style="width:${scaleMin(48)}px;height:${scaleMin(48)}px;border-radius:${scaleMin(10)}px;background:rgba(56,189,248,0.15);color:#38bdf8;display:flex;align-items:center;justify-content:center;font-size:${scaleMin(24)}px;flex-shrink:0;">
                        <i class="fa-solid ${item.icon}"></i>
                    </div>
                    <div style="display:flex;flex-direction:column;min-width:0;overflow:hidden;">
                        <span class="editable-text" style="font-size:${scaleMin(19)}px;color:#94a3b8;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                        <span class="editable-text" style="font-size:${scaleMin(26)}px;color:#ffffff;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.value}</span>
                    </div>
                </div>`;
            } else {
                return `<div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:${scaleMin(14)}px;padding:${scaleY(12)}px ${scaleX(16)}px;display:flex;align-items:center;gap:${scaleX(14)}px;text-align:left;min-width:0;">
                    <div style="width:${scaleMin(48)}px;height:${scaleMin(48)}px;border-radius:${scaleMin(10)}px;background:rgba(56,189,248,0.15);color:#38bdf8;display:flex;align-items:center;justify-content:center;font-size:${scaleMin(24)}px;flex-shrink:0;">
                        <i class="fa-solid ${item.icon}"></i>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(24)}px;color:#ffffff;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#090d16;font-family:'Space Grotesk',Inter,sans-serif;"><div class="photo-panel" style="width:${fullW}px;height:${fullH}px;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;left:${scaleMin(32)}px;top:${scaleMin(32)}px;right:${scaleMin(32)}px;bottom:${scaleMin(32)}px;border:1.5px solid rgba(56,189,248,0.75);border-radius:${scaleMin(20)}px;box-shadow:0 0 20px rgba(56,189,248,0.45), inset 0 0 20px rgba(56,189,248,0.15);pointer-events:none;z-index:4;"></div><div style="position:absolute;left:50%;top:50%;transform:translate(-50%, -50%);width:${scaleX(1060)}px;max-width:92%;background:rgba(15,23,42,0.65);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1.5px solid rgba(56,189,248,0.45);border-radius:${scaleMin(32)}px;box-shadow:0 0 35px rgba(56,189,248,0.22), 0 35px 80px rgba(0,0,0,0.65);padding:${scaleY(46)}px ${scaleX(54)}px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;text-align:center;z-index:5;"><div style="display:inline-flex;align-items:center;gap:${scaleX(10)}px;background:rgba(56,189,248,0.14);border:1px solid rgba(56,189,248,0.35);color:#38bdf8;padding:${scaleY(8)}px ${scaleX(24)}px;border-radius:999px;font-size:${scaleMin(22)}px;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:${scaleY(18)}px;"><i class="fa-solid fa-star"></i> <span class="editable-text">PREMİUM YAŞAM</span></div><div style="font-size:${scaleMin(72)}px;color:#ffffff;font-weight:900;line-height:1.2;margin-bottom:${scaleY(16)}px;letter-spacing:-0.5px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0284c7,#0369a1);color:#ffffff;padding:${scaleY(12)}px ${scaleX(40)}px;border-radius:${scaleMin(16)}px;font-size:${scaleMin(62)}px;font-weight:900;letter-spacing:-0.5px;box-shadow:0 12px 30px rgba(2,132,199,0.4), inset 0 1px 0 rgba(255,255,255,0.3);margin-bottom:${scaleY(28)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:${scaleMin(14)}px;width:100%;margin-bottom:${scaleY(28)}px;">${featsHtmlM2}</div><div style="display:inline-flex;align-items:center;gap:${scaleX(12)}px;background:rgba(15,23,42,0.9);border:1px solid rgba(255,255,255,0.15);padding:${scaleY(10)}px ${scaleX(28)}px;border-radius:999px;font-size:${scaleMin(26)}px;color:#cbd5e1;font-weight:800;"><i class="fa-solid fa-phone" style="color:#38bdf8;"></i> <span class="editable-text">${contact}</span></div></div></div>`;
    }
    else if (id === 'canvaM3') {
        const itemsM3 = parseMinimalFeatures(effectiveLines).slice(0, 5);
        const featsHtmlM3 = itemsM3.map(item => {
            if (item.value) {
                return `<div style="display:flex;align-items:center;justify-content:space-between;padding:${scaleY(10)}px 0;border-bottom:1px solid rgba(255,255,255,0.06);gap:${scaleX(16)}px;">
                    <div style="display:flex;align-items:center;gap:${scaleX(10)}px;min-width:0;">
                        <span style="color:#f59e0b;font-size:${scaleMin(18)}px;flex-shrink:0;">✦</span>
                        <span class="editable-text" style="font-size:${scaleMin(24)}px;color:#cbd5e1;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(26)}px;color:#fef08a;font-weight:800;white-space:nowrap;flex-shrink:0;">${item.value}</span>
                </div>`;
            } else {
                return `<div style="display:flex;align-items:center;gap:${scaleX(10)}px;padding:${scaleY(10)}px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <span style="color:#f59e0b;font-size:${scaleMin(18)}px;flex-shrink:0;">✦</span>
                    <span class="editable-text" style="font-size:${scaleMin(24)}px;color:#ffffff;font-weight:700;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#0b0f19;font-family:'Space Grotesk',Inter,sans-serif;box-sizing:border-box;border:${scaleMin(26)}px solid #0b0f19;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;left:${scaleMin(36)}px;top:${scaleMin(36)}px;right:${scaleMin(36)}px;bottom:${scaleMin(36)}px;border:1px solid rgba(245,158,11,0.5);pointer-events:none;z-index:10;"></div><div style="position:absolute;top:${scaleY(56)}px;left:${scaleX(56)}px;z-index:12;background:rgba(11,15,25,0.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(245,158,11,0.3);border-radius:${scaleMin(18)}px;padding:${scaleY(24)}px ${scaleX(32)}px;box-shadow:0 25px 60px rgba(0,0,0,0.7);max-width:${scaleX(680)}px;"><div style="display:inline-flex;align-items:center;gap:${scaleX(10)}px;color:#f59e0b;font-size:${scaleMin(22)}px;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:${scaleY(8)}px;"><i class="fa-solid fa-gem"></i> <span class="editable-text">VIP SEÇKİ</span></div><div style="font-size:${scaleMin(64)}px;color:#ffffff;font-weight:900;line-height:1.2;margin-bottom:${scaleY(12)}px;letter-spacing:-0.5px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(68)}px;color:#fef08a;font-weight:900;letter-spacing:-0.5px;text-shadow:0 0 25px rgba(245,158,11,0.35);"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(56)}px;right:${scaleX(56)}px;z-index:12;background:rgba(11,15,25,0.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(245,158,11,0.25);border-radius:${scaleMin(18)}px;padding:${scaleY(24)}px ${scaleX(32)}px;min-width:${scaleX(480)}px;max-width:${scaleX(620)}px;box-shadow:0 25px 60px rgba(0,0,0,0.7);box-sizing:border-box;"><div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:${scaleY(10)}px;margin-bottom:${scaleY(10)}px;border-bottom:1px solid rgba(245,158,11,0.2);"><span style="font-size:${scaleMin(20)}px;color:#f59e0b;font-weight:800;letter-spacing:2px;text-transform:uppercase;"><span style="color:#fbbf24;margin-right:6px;">✦</span>MÜLK DETAYLARI</span><span style="font-size:${scaleMin(18)}px;color:#94a3b8;font-weight:600;letter-spacing:1px;">PORTFÖY BİLGİSİ</span></div><div style="display:flex;flex-direction:column;">${featsHtmlM3}</div></div><div style="position:absolute;bottom:${scaleY(56)}px;left:${scaleX(56)}px;z-index:12;background:rgba(11,15,25,0.92);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);border:1px solid rgba(245,158,11,0.3);border-radius:999px;padding:${scaleY(12)}px ${scaleX(30)}px;display:flex;align-items:center;gap:${scaleX(12)}px;box-shadow:0 15px 35px rgba(0,0,0,0.6);"><i class="fa-solid fa-phone" style="color:#f59e0b;font-size:${scaleMin(22)}px;"></i><span class="editable-text" style="font-size:${scaleMin(26)}px;color:#ffffff;font-weight:800;letter-spacing:1px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaM4') {
        const itemsM4 = parseMinimalFeatures(effectiveLines).slice(0, 5);
        const featsHtmlM4 = itemsM4.map(item => {
            if (item.value) {
                return `<div style="display:flex;align-items:center;justify-content:space-between;padding:${scaleY(10)}px 0;border-bottom:1px solid rgba(15,23,42,0.12);gap:${scaleX(14)}px;">
                    <div style="display:flex;align-items:center;gap:${scaleX(10)}px;min-width:0;">
                        <i class="fa-solid ${item.icon}" style="color:#0f172a;font-size:${scaleMin(22)}px;width:${scaleMin(24)}px;text-align:center;flex-shrink:0;"></i>
                        <span class="editable-text" style="font-size:${scaleMin(22)}px;color:#475569;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(24)}px;color:#0f172a;font-weight:800;white-space:nowrap;flex-shrink:0;">${item.value}</span>
                </div>`;
            } else {
                return `<div style="display:flex;align-items:center;gap:${scaleX(10)}px;padding:${scaleY(10)}px 0;border-bottom:1px solid rgba(15,23,42,0.12);">
                    <i class="fa-solid ${item.icon}" style="color:#0f172a;font-size:${scaleMin(22)}px;width:${scaleMin(24)}px;text-align:center;flex-shrink:0;"></i>
                    <span class="editable-text" style="font-size:${scaleMin(23)}px;color:#0f172a;font-weight:700;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#090d16;font-family:'Space Grotesk',Inter,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos}"></div><svg style="position:absolute;left:0;top:0;width:100%;height:100%;z-index:2;pointer-events:none;filter:drop-shadow(20px 0 50px rgba(0,0,0,0.8));" preserveAspectRatio="none" viewBox="0 0 100 100"><polygon points="0,0 55,0 35,100 0,100" fill="#f8fafc" /></svg><svg style="position:absolute;left:0;top:0;width:100%;height:100%;z-index:3;pointer-events:none;" preserveAspectRatio="none" viewBox="0 0 100 100"><polygon points="55,0 56,0 36,100 35,100" fill="#0f172a" /></svg><div style="position:absolute;left:${scaleX(70)}px;top:${scaleY(80)}px;z-index:5;width:${scaleX(580)}px;"><div style="font-size:${scaleMin(20)}px;color:#0284c7;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:${scaleY(12)}px;">PORTFÖY DETAYI</div><div style="font-size:${scaleMin(72)}px;color:#0f172a;font-weight:900;line-height:1.15;margin-bottom:${scaleY(20)}px;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(64)}px;color:#ffffff;background:#0f172a;padding:${scaleY(10)}px ${scaleX(28)}px;border-radius:${scaleMin(12)}px;display:inline-block;margin-bottom:${scaleY(30)}px;font-weight:900;box-shadow:0 10px 25px rgba(15,23,42,0.3);"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="display:flex;flex-direction:column;width:100%;max-width:${scaleX(520)}px;">${featsHtmlM4}</div></div><div style="position:absolute;bottom:${scaleY(30)}px;right:${scaleX(40)}px;text-align:right;font-size:${scaleMin(26)}px;color:#ffffff;font-weight:800;letter-spacing:1px;z-index:20;background:rgba(9,13,22,0.65);backdrop-filter:blur(12px);padding:${scaleY(12)}px ${scaleX(28)}px;border-radius:999px;border:1px solid rgba(255,255,255,0.15);"><i class="fa-solid fa-phone" style="color:#38bdf8;margin-right:${scaleX(8)}px;"></i><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaM5') {
        const itemsM5 = parseMinimalFeatures(effectiveLines).slice(0, 4);
        const featsHtmlM5 = itemsM5.map(item => {
            if (item.value) {
                return `<div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:${scaleMin(12)}px;padding:${scaleY(10)}px ${scaleX(14)}px;display:flex;align-items:center;gap:${scaleX(12)}px;min-width:0;">
                    <div style="width:${scaleMin(42)}px;height:${scaleMin(42)}px;border-radius:${scaleMin(10)}px;background:rgba(56,189,248,0.15);color:#38bdf8;display:flex;align-items:center;justify-content:center;font-size:${scaleMin(20)}px;flex-shrink:0;">
                        <i class="fa-solid ${item.icon}"></i>
                    </div>
                    <div style="display:flex;flex-direction:column;min-width:0;overflow:hidden;">
                        <span class="editable-text" style="font-size:${scaleMin(17)}px;color:#94a3b8;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                        <span class="editable-text" style="font-size:${scaleMin(23)}px;color:#ffffff;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.value}</span>
                    </div>
                </div>`;
            } else {
                return `<div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:${scaleMin(12)}px;padding:${scaleY(10)}px ${scaleX(14)}px;display:flex;align-items:center;gap:${scaleX(12)}px;min-width:0;">
                    <div style="width:${scaleMin(42)}px;height:${scaleMin(42)}px;border-radius:${scaleMin(10)}px;background:rgba(56,189,248,0.15);color:#38bdf8;display:flex;align-items:center;justify-content:center;font-size:${scaleMin(20)}px;flex-shrink:0;">
                        <i class="fa-solid ${item.icon}"></i>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(22)}px;color:#ffffff;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#090d16;font-family:'Space Grotesk',Inter,sans-serif;"><div class="photo-panel" style="width:100%;height:${scaleY(670)}px;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;left:0;top:${scaleY(670)}px;width:100%;height:${scaleY(410)}px;background:linear-gradient(180deg, #0b0f19 0%, #090d16 100%);border-top:1px solid rgba(255,255,255,0.1);z-index:2;display:flex;align-items:center;padding:0 ${scaleX(60)}px;justify-content:space-between;box-sizing:border-box;gap:${scaleX(36)}px;"><div style="flex:1;min-width:0;"><div style="font-size:${scaleMin(18)}px;color:#38bdf8;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:${scaleY(8)}px;">İSKANDİNAV MİMARİ</div><div style="font-size:${scaleMin(64)}px;color:#ffffff;font-weight:900;line-height:1.2;margin-bottom:${scaleY(14)}px;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="display:inline-flex;align-items:center;gap:${scaleX(10)}px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);padding:${scaleY(8)}px ${scaleX(20)}px;border-radius:999px;font-size:${scaleMin(22)}px;color:#cbd5e1;font-weight:700;"><i class="fa-solid fa-phone" style="color:#38bdf8;"></i> <span class="editable-text">${contact}</span></div></div><div style="width:${scaleX(620)}px;display:grid;grid-template-columns:repeat(2, 1fr);gap:${scaleMin(12)}px;flex-shrink:0;">${featsHtmlM5}</div><div style="width:${scaleX(340)}px;background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);padding:${scaleY(30)}px ${scaleX(24)}px;border-radius:${scaleMin(20)}px;text-align:center;box-shadow:0 15px 35px rgba(2,132,199,0.35);border:1px solid rgba(255,255,255,0.2);flex-shrink:0;box-sizing:border-box;"><div style="font-size:${scaleMin(20)}px;color:#e0f2fe;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:${scaleY(6)}px;">FIRSAT FİYAT</div><div style="font-size:${scaleMin(54)}px;color:#ffffff;font-weight:900;line-height:1;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div></div></div>`;
    }
    else if (id === 'canvaM6') {
        const itemsM6 = parseMinimalFeatures(effectiveLines).slice(0, 5);
        const featsHtmlM6 = itemsM6.map(item => {
            if (item.value) {
                return `<div style="display:flex;align-items:center;justify-content:space-between;padding:${scaleY(9)}px 0;border-bottom:1px solid rgba(255,255,255,0.08);gap:${scaleX(14)}px;">
                    <div style="display:flex;align-items:center;gap:${scaleX(10)}px;min-width:0;">
                        <span style="color:#38bdf8;font-size:${scaleMin(16)}px;flex-shrink:0;">✦</span>
                        <span class="editable-text" style="font-size:${scaleMin(21)}px;color:#cbd5e1;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(23)}px;color:#ffffff;font-weight:800;white-space:nowrap;flex-shrink:0;">${item.value}</span>
                </div>`;
            } else {
                return `<div style="display:flex;align-items:center;gap:${scaleX(10)}px;padding:${scaleY(9)}px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                    <span style="color:#38bdf8;font-size:${scaleMin(16)}px;flex-shrink:0;">✦</span>
                    <span class="editable-text" style="font-size:${scaleMin(22)}px;color:#ffffff;font-weight:700;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#090d16;font-family:'Space Grotesk',Inter,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};"></div><div style="position:absolute;top:${scaleY(60)}px;left:${scaleX(60)}px;background:rgba(9,13,22,0.65);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);padding:${scaleY(28)}px ${scaleX(44)}px;border-radius:${scaleMin(20)}px;box-shadow:0 30px 60px rgba(0,0,0,0.6);max-width:${scaleX(800)}px;border-left:${scaleMin(6)}px solid #38bdf8;border:1px solid rgba(255,255,255,0.1);box-sizing:border-box;"><div style="font-size:${scaleMin(18)}px;color:#38bdf8;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:${scaleY(8)}px;">ÖNE ÇIKAN İLAN</div><div style="font-size:${scaleMin(68)}px;color:#ffffff;font-weight:900;line-height:1.2;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div></div><div style="position:absolute;bottom:${scaleY(60)}px;left:${scaleX(60)}px;display:flex;flex-direction:column;gap:${scaleY(14)}px;z-index:10;"><div style="background:linear-gradient(135deg,#0284c7,#0369a1);padding:${scaleY(18)}px ${scaleX(36)}px;border-radius:${scaleMin(16)}px;box-shadow:0 20px 40px rgba(2,132,199,0.4);border:1px solid rgba(255,255,255,0.25);box-sizing:border-box;display:inline-block;"><div style="font-size:${scaleMin(62)}px;color:#ffffff;font-weight:900;line-height:1;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="display:inline-flex;align-items:center;gap:${scaleX(10)}px;background:rgba(9,13,22,0.65);backdrop-filter:blur(15px);padding:${scaleY(10)}px ${scaleX(24)}px;border-radius:999px;border:1px solid rgba(255,255,255,0.12);font-size:${scaleMin(24)}px;color:#cbd5e1;font-weight:700;"><i class="fa-solid fa-phone" style="color:#38bdf8;"></i> <span class="editable-text">${contact}</span></div></div><div style="position:absolute;bottom:${scaleY(60)}px;right:${scaleX(60)}px;background:rgba(9,13,22,0.65);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:${scaleMin(22)}px;box-shadow:0 25px 60px rgba(0,0,0,0.65);border:1px solid rgba(255,255,255,0.15);width:${scaleX(560)}px;padding:${scaleY(24)}px ${scaleX(32)}px;box-sizing:border-box;z-index:10;"><div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:${scaleY(8)}px;margin-bottom:${scaleY(8)}px;border-bottom:1px solid rgba(255,255,255,0.12);"><span style="font-size:${scaleMin(18)}px;color:#38bdf8;font-weight:800;letter-spacing:2px;text-transform:uppercase;">MÜLK ÖZELLİKLERİ</span></div><div style="display:flex;flex-direction:column;">${featsHtmlM6}</div></div></div>`;
    }
    else if (id === 'canvaM7') {
        const itemsM7 = parseMinimalFeatures(effectiveLines).slice(0, 5);
        const featsHtmlM7 = itemsM7.map(item => {
            if (item.value) {
                return `<div style="display:flex;align-items:center;justify-content:space-between;padding:${scaleY(12)}px 0;border-bottom:1px solid rgba(255,255,255,0.08);gap:${scaleX(16)}px;">
                    <div style="display:flex;align-items:center;gap:${scaleX(12)}px;min-width:0;">
                        <i class="fa-solid ${item.icon}" style="color:#38bdf8;font-size:${scaleMin(24)}px;width:${scaleMin(26)}px;text-align:center;flex-shrink:0;"></i>
                        <span class="editable-text" style="font-size:${scaleMin(24)}px;color:#94a3b8;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(26)}px;color:#ffffff;font-weight:800;white-space:nowrap;flex-shrink:0;">${item.value}</span>
                </div>`;
            } else {
                return `<div style="display:flex;align-items:center;gap:${scaleX(12)}px;padding:${scaleY(12)}px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                    <i class="fa-solid ${item.icon}" style="color:#38bdf8;font-size:${scaleMin(24)}px;width:${scaleMin(26)}px;text-align:center;flex-shrink:0;"></i>
                    <span class="editable-text" style="font-size:${scaleMin(26)}px;color:#ffffff;font-weight:700;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#090d16;font-family:'Space Grotesk',Inter,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;left:0;top:0;width:${scaleX(760)}px;height:100%;background:linear-gradient(to right, rgba(9,13,22,0.95) 0%, rgba(9,13,22,0.7) 100%);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-right:1px solid rgba(255,255,255,0.1);display:flex;flex-direction:column;justify-content:flex-start;padding:${scaleY(60)}px ${scaleX(60)}px;box-sizing:border-box;z-index:5;"><div style="font-size:${scaleMin(20)}px;color:#38bdf8;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:${scaleY(12)}px;">PRESTİJ KOLEKSİYONU</div><div style="font-size:${scaleMin(72)}px;color:#ffffff;font-weight:900;line-height:1.2;margin-bottom:${scaleY(30)}px;border-left:${scaleMin(6)}px solid #38bdf8;padding-left:${scaleX(24)}px;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="margin-bottom:${scaleY(34)}px;padding-left:${scaleX(30)}px;"><div style="font-size:${scaleMin(64)}px;color:#ffffff;font-weight:900;background:rgba(255,255,255,0.08);padding:${scaleY(12)}px ${scaleX(28)}px;border-radius:${scaleMin(14)}px;display:inline-block;border:1px solid rgba(255,255,255,0.18);box-shadow:0 15px 30px rgba(0,0,0,0.4);"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="display:flex;flex-direction:column;padding-left:${scaleX(30)}px;margin-bottom:${scaleY(40)}px;">${featsHtmlM7}</div><div style="margin-top:auto;padding-left:${scaleX(30)}px;"><div style="display:inline-flex;align-items:center;gap:${scaleX(12)}px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);padding:${scaleY(12)}px ${scaleX(26)}px;border-radius:999px;font-size:${scaleMin(24)}px;color:#cbd5e1;font-weight:700;"><i class="fa-solid fa-phone" style="color:#38bdf8;"></i> <span class="editable-text">${contact}</span></div></div></div></div>`;
    }
    else if (id === 'canvaM8') {
        const itemsM8 = parseMinimalFeatures(effectiveLines).slice(0, 4);
        const featsHtmlM8 = itemsM8.map(item => {
            if (item.value) {
                return `<div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:${scaleMin(12)}px;padding:${scaleY(12)}px ${scaleX(16)}px;display:flex;align-items:center;gap:${scaleX(14)}px;box-shadow:0 2px 8px rgba(15,23,42,0.04);">
                    <div style="width:${scaleMin(44)}px;height:${scaleMin(44)}px;border-radius:${scaleMin(10)}px;background:#f1f5f9;color:#0284c7;display:flex;align-items:center;justify-content:center;font-size:${scaleMin(22)}px;flex-shrink:0;">
                        <i class="fa-solid ${item.icon}"></i>
                    </div>
                    <div style="display:flex;flex-direction:column;min-width:0;overflow:hidden;">
                        <span class="editable-text" style="font-size:${scaleMin(18)}px;color:#64748b;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                        <span class="editable-text" style="font-size:${scaleMin(24)}px;color:#0f172a;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.value}</span>
                    </div>
                </div>`;
            } else {
                return `<div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:${scaleMin(12)}px;padding:${scaleY(12)}px ${scaleX(16)}px;display:flex;align-items:center;gap:${scaleX(14)}px;">
                    <div style="width:${scaleMin(44)}px;height:${scaleMin(44)}px;border-radius:${scaleMin(10)}px;background:#f1f5f9;color:#0284c7;display:flex;align-items:center;justify-content:center;font-size:${scaleMin(22)}px;flex-shrink:0;">
                        <i class="fa-solid ${item.icon}"></i>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(24)}px;color:#0f172a;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#f8fafc;font-family:'Space Grotesk',Inter,sans-serif;"><div class="photo-panel" style="width:${scaleX(1300)}px;height:${scaleY(940)}px;position:absolute;right:${scaleX(40)}px;top:${scaleY(40)}px;${bgPos};border-radius:${scaleMin(20)}px;box-shadow:0 25px 50px rgba(15,23,42,0.12);"></div><div style="position:absolute;left:${scaleX(40)}px;top:${scaleY(40)}px;width:${scaleX(520)}px;height:${scaleY(940)}px;background:#ffffff;border-radius:${scaleMin(20)}px;border:1px solid #e2e8f0;padding:${scaleY(50)}px ${scaleX(44)}px;display:flex;flex-direction:column;box-sizing:border-box;box-shadow:0 20px 40px rgba(15,23,42,0.06);"><div style="width:${scaleX(40)}px;height:4px;background:#0284c7;border-radius:2px;margin-bottom:${scaleY(24)}px;"></div><div style="font-size:${scaleMin(68)}px;color:#0f172a;font-weight:900;line-height:1.2;margin-bottom:${scaleY(24)}px;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(58)}px;color:#0284c7;font-weight:900;margin-bottom:${scaleY(34)}px;padding-bottom:${scaleY(16)}px;border-bottom:1px solid #e2e8f0;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="display:flex;flex-direction:column;gap:${scaleY(12)}px;margin-bottom:${scaleY(28)}px;">${featsHtmlM8}</div><div style="margin-top:auto;display:flex;align-items:center;gap:${scaleX(10)}px;background:#f1f5f9;padding:${scaleY(12)}px ${scaleX(20)}px;border-radius:${scaleMin(12)}px;font-size:${scaleMin(22)}px;color:#334155;font-weight:700;"><i class="fa-solid fa-phone" style="color:#0284c7;"></i> <span class="editable-text">${contact}</span></div></div></div>`;
    }
    else if (id === 'canvaM9') {
        const itemsM9 = parseMinimalFeatures(effectiveLines).slice(0, 5);
        const featsHtmlM9 = itemsM9.map(item => {
            if (item.value) {
                return `<div style="display:flex;align-items:center;justify-content:space-between;padding:${scaleY(10)}px 0;border-bottom:1px solid rgba(255,255,255,0.08);gap:${scaleX(16)}px;">
                    <div style="display:flex;align-items:center;gap:${scaleX(10)}px;min-width:0;">
                        <span style="color:#38bdf8;font-size:${scaleMin(16)}px;flex-shrink:0;">✦</span>
                        <span class="editable-text" style="font-size:${scaleMin(22)}px;color:#cbd5e1;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(24)}px;color:#ffffff;font-weight:800;white-space:nowrap;flex-shrink:0;">${item.value}</span>
                </div>`;
            } else {
                return `<div style="display:flex;align-items:center;gap:${scaleX(10)}px;padding:${scaleY(10)}px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                    <span style="color:#38bdf8;font-size:${scaleMin(16)}px;flex-shrink:0;">✦</span>
                    <span class="editable-text" style="font-size:${scaleMin(23)}px;color:#ffffff;font-weight:700;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#090d16;font-family:'Space Grotesk',Inter,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};"></div><div style="position:absolute;top:${scaleY(46)}px;width:100%;text-align:center;z-index:20;"><div style="display:inline-flex;align-items:center;background:rgba(9,13,22,0.65);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,0.16);padding:${scaleY(14)}px ${scaleX(48)}px;border-radius:999px;box-shadow:0 15px 35px rgba(0,0,0,0.5);"><div style="font-size:${scaleMin(68)}px;color:#ffffff;font-weight:900;text-transform:uppercase;letter-spacing:4px;line-height:1;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div></div></div><div style="position:absolute;bottom:${scaleY(50)}px;left:${scaleX(60)}px;z-index:20;background:rgba(9,13,22,0.65);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:${scaleMin(22)}px;border:1px solid rgba(255,255,255,0.15);padding:${scaleY(22)}px ${scaleX(36)}px;box-shadow:0 25px 60px rgba(0,0,0,0.65);"><div style="font-size:${scaleMin(18)}px;color:#38bdf8;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:${scaleY(6)}px;">LÜKS SEÇENEK</div><div style="font-size:${scaleMin(72)}px;color:#ffffff;font-weight:900;line-height:1;margin-bottom:${scaleY(16)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="display:inline-flex;align-items:center;gap:${scaleX(10)}px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:${scaleY(8)}px ${scaleX(20)}px;border-radius:999px;font-size:${scaleMin(22)}px;color:#cbd5e1;font-weight:700;"><i class="fa-solid fa-phone" style="color:#38bdf8;"></i> <span class="editable-text">${contact}</span></div></div><div style="position:absolute;bottom:${scaleY(50)}px;right:${scaleX(60)}px;background:rgba(9,13,22,0.65);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:${scaleMin(22)}px;border:1px solid rgba(255,255,255,0.15);padding:${scaleY(24)}px ${scaleX(32)}px;width:${scaleX(560)}px;box-sizing:border-box;box-shadow:0 25px 60px rgba(0,0,0,0.65);z-index:20;"><div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:${scaleY(8)}px;margin-bottom:${scaleY(8)}px;border-bottom:1px solid rgba(255,255,255,0.12);"><span style="font-size:${scaleMin(18)}px;color:#38bdf8;font-weight:800;letter-spacing:2px;text-transform:uppercase;">ÖZEL DETAYLAR</span></div><div style="display:flex;flex-direction:column;">${featsHtmlM9}</div></div></div>`;
    }
    else if (id === 'canvaM10') {
        const itemsM10 = parseMinimalFeatures(effectiveLines).slice(0, 4);
        const featsHtmlM10 = itemsM10.map(item => {
            if (item.value) {
                return `<div style="display:flex;align-items:center;justify-content:space-between;padding:${scaleY(12)}px 0;border-bottom:1px solid rgba(15,23,42,0.12);gap:${scaleX(14)}px;">
                    <div style="display:flex;align-items:center;gap:${scaleX(10)}px;min-width:0;">
                        <span style="color:#0284c7;font-size:${scaleMin(16)}px;flex-shrink:0;">✦</span>
                        <span class="editable-text" style="font-size:${scaleMin(22)}px;color:#475569;font-weight:700;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.label}</span>
                    </div>
                    <span class="editable-text" style="font-size:${scaleMin(24)}px;color:#0f172a;font-weight:800;white-space:nowrap;flex-shrink:0;">${item.value}</span>
                </div>`;
            } else {
                return `<div style="display:flex;align-items:center;gap:${scaleX(10)}px;padding:${scaleY(12)}px 0;border-bottom:1px solid rgba(15,23,42,0.12);">
                    <span style="color:#0284c7;font-size:${scaleMin(16)}px;flex-shrink:0;">✦</span>
                    <span class="editable-text" style="font-size:${scaleMin(23)}px;color:#0f172a;font-weight:700;">${item.label}</span>
                </div>`;
            }
        }).join('');

        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#f8fafc;font-family:'Space Grotesk',Inter,sans-serif;"><div style="position:absolute;left:${scaleX(50)}px;top:${scaleY(50)}px;right:${scaleX(50)}px;bottom:${scaleY(50)}px;border:2px solid #0f172a;pointer-events:none;z-index:1;"></div><div style="position:absolute;left:${scaleX(65)}px;top:${scaleY(65)}px;right:${scaleX(65)}px;bottom:${scaleY(65)}px;border:1px dashed #94a3b8;pointer-events:none;z-index:1;"></div><div class="photo-panel" style="width:${scaleX(1040)}px;height:${scaleY(680)}px;position:absolute;right:${scaleX(100)}px;top:${scaleY(180)}px;${bgPos};border:${scaleMin(8)}px solid #ffffff;box-shadow:0 30px 60px rgba(15,23,42,0.2);"></div><div style="position:absolute;left:${scaleX(110)}px;top:${scaleY(180)}px;width:${scaleX(580)}px;z-index:5;"><div style="background:#0f172a;color:#ffffff;font-size:${scaleMin(22)}px;font-weight:800;letter-spacing:3px;display:inline-block;padding:${scaleY(6)}px ${scaleX(18)}px;border-radius:${scaleMin(6)}px;margin-bottom:${scaleY(20)}px;">NO. 01 // KOLEKSİYON</div><div style="font-size:${scaleMin(72)}px;color:#0f172a;font-weight:900;line-height:1.15;margin-bottom:${scaleY(24)}px;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(60)}px;color:#0284c7;font-weight:900;margin-bottom:${scaleY(34)}px;border-bottom:2px solid #0f172a;padding-bottom:${scaleY(16)}px;display:inline-block;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="display:flex;flex-direction:column;width:100%;max-width:${scaleX(520)}px;">${featsHtmlM10}</div></div><div style="position:absolute;right:${scaleX(110)}px;bottom:${scaleY(100)}px;font-size:${scaleMin(24)}px;color:#475569;font-weight:800;letter-spacing:1px;z-index:10;"><i class="fa-solid fa-phone" style="color:#0284c7;margin-right:${scaleX(8)}px;"></i><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    
    // Convert inline text blocks to Draggable overlays
    canvaRenderLayer.querySelectorAll('.photo-panel').forEach(el => enablePhotoDrag(el));
        canvaRenderLayer.querySelectorAll('.editable-text').forEach(el => enableInlineEdit(el));
    requestAnimationFrame(() => {
        if(typeof redrawAll === 'function') redrawAll();
    });
}

// Start
window.renderMTemplate = renderMTemplate;
setTimeout(_minimalInit, 200);






