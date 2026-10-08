/* ============================================================
   Kurumsal Şablon Seti - V3 (UNIQUE PRO)
============================================================ */

function _kurumsalInit(){
    const container = document.getElementById('tpl-content-kurumsal');
    if(!container) {
        setTimeout(_kurumsalInit, 500);
        return;
    }
    container.innerHTML = '';
    buildKurumsalCards();
}

function buildKurumsalCards(){
    let grid = document.getElementById('canvaTplGridKurumsal');
    if(!grid) {
        grid = document.createElement('div');
        grid.className = 'canva-tpl-grid';
        grid.id = 'canvaTplGridKurumsal';
        const cont = document.getElementById('tpl-content-kurumsal');
        if(cont) cont.appendChild(grid);
    }
    grid.innerHTML = '';
    if(typeof KURUMSAL_CARDS !== 'undefined') {
        KURUMSAL_CARDS.forEach((c, idx) => {
            const card = window.createTemplateCard(c, idx, 'Kurumsal', (id) => {
                renderKurumsalTemplate(id);
            });
            grid.appendChild(card);
        });
    }
}

function renderKurumsalTemplate(id){
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
        : { title: 'SATILIK MÜSTAKİL EV', price: '12.500.000 TL', contact: 'EMLAK STUDYOM | 0532 000 00 00', feats: '• Yeni Yapı<br>• Lüks Donanım' };

    const title = tData.title;
    const price = tData.price;
    const contact = tData.contact;
    const feats = tData.feats;
    
    const bgImg = (typeof window.getTemplateActiveBg === 'function') ? window.getTemplateActiveBg('Kurumsal') : (uploadedImgUrl ? "background-image:url('" + uploadedImgUrl + "')" : "background-image:url('assets/luxury_villa.jpg')");
    const x = $('photoXCtrl') ? $('photoXCtrl').value : 50;
    const y = $('photoYCtrl') ? $('photoYCtrl').value : 50;
    const bgPos = bgImg + ";background-position:" + x + "% " + y + "%;background-size:cover;";

    const canvasSize = getCanvasSize();
    const fullW = canvasSize.w;
    const fullH = canvasSize.h;
    const scaleX = v => (v / 1920) * fullW;
    const scaleY = v => (v / 1080) * fullH;
    const scaleMin = v => (v * 0.75) * Math.min(fullW/1920, fullH/1080);

    if (id === 'canvaKurumsal1') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#fff;font-family:Montserrat,sans-serif;"><div class="photo-panel" style="width:100%;height:${scaleY(700)}px;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;left:0;bottom:0;width:100%;height:${scaleY(380)}px;background:#1e293b;display:flex;align-items:center;padding:0 ${scaleX(100)}px;box-sizing:border-box;"><div style="flex:2;"><div style="font-size:${scaleMin(80)}px;color:#fff;font-weight:900;margin-bottom:${scaleY(10)}px;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(35)}px;color:#cbd5e1;font-family:Roboto,sans-serif;line-height:1.5;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="flex:1;text-align:right;border-left:2px solid rgba(255,255,255,0.2);padding-left:${scaleX(50)}px;"><div style="font-size:${scaleMin(85)}px;color:#38bdf8;font-weight:900;margin-bottom:${scaleY(15)}px;margin-top:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(53)}px;color:#fff;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div></div></div>`;
    }
    else if (id === 'canvaKurumsal2') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#f8fafc;font-family:Montserrat,sans-serif;"><div class="photo-panel" style="width:${scaleX(1320)}px;height:100%;position:absolute;right:0;top:0;${bgPos}"></div><div style="position:absolute;left:0;top:0;width:${scaleX(600)}px;height:100%;background:#1e293b;padding:${scaleY(100)}px ${scaleX(60)}px;box-sizing:border-box;display:flex;flex-direction:column;"><div style="font-size:${scaleMin(39)}px;color:#38bdf8;font-weight:900;letter-spacing:2px;margin-bottom:${scaleY(20)}px;">GAYRİMENKUL PORTFÖYÜ</div><div style="font-size:${scaleMin(93)}px;color:#fff;font-weight:900;line-height:1.2;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(70)}px;color:#fff;background:#38bdf8;padding:${scaleY(15)}px;display:inline-block;margin-bottom:${scaleY(60)}px;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(53)}px;color:#e2e8f0;font-family:Roboto,sans-serif;line-height:1.6;font-weight:700;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div><div style="margin-top:auto;padding-top:${scaleY(40)}px;font-size:${scaleMin(30)}px;color:#cbd5e1;font-family:sans-serif;font-weight:800;letter-spacing:2px;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div></div>`;
    }
    else if (id === 'canvaKurumsal3') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#fff;font-family:Montserrat,sans-serif;border:${scaleX(20)}px solid #1e293b;box-sizing:border-box;"><div class="photo-panel" style="width:100%;height:${scaleY(700)}px;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;left:0;bottom:0;width:100%;height:${scaleY(340)}px;background:#fff;padding:${scaleY(50)}px ${scaleX(40)}px ${scaleY(50)}px ${scaleX(80)}px;box-sizing:border-box;display:flex;justify-content:space-between;"><div><div style="font-size:${scaleMin(85)}px;color:#1e293b;font-weight:900;margin-bottom:${scaleY(15)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(62)}px;color:#38bdf8;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(35)}px;color:#1e293b;font-family:sans-serif;font-weight:800;letter-spacing:1px;margin-top:${scaleY(20)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div><div style="font-size:${scaleMin(39)}px;color:#333;font-family:Roboto,sans-serif;line-height:1.6;width:${scaleX(450)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div></div>`;
    }
    else if (id === 'canvaKurumsal4') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#1e293b;font-family:Montserrat,sans-serif;"><div class="photo-panel" style="width:${scaleX(960)}px;height:100%;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;right:0;top:0;width:${scaleX(960)}px;height:50%;background:#fff;padding:${scaleY(80)}px;box-sizing:border-box;"><div style="font-size:${scaleMin(97)}px;color:#1e293b;font-weight:900;line-height:1.1;margin-bottom:${scaleY(30)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(76)}px;color:#38bdf8;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;right:0;bottom:0;width:${scaleX(960)}px;height:50%;background:#1e293b;padding:${scaleY(80)}px;box-sizing:border-box;"><div style="font-size:${scaleMin(45)}px;color:#cbd5e1;font-family:Roboto,sans-serif;line-height:1.8;font-weight:700;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div><div style="position:absolute;bottom:${scaleY(40)}px;right:${scaleX(80)}px;font-size:${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:1px;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div></div>`;
    }
    else if (id === 'canvaKurumsal5') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#fff;font-family:Montserrat,sans-serif;"><div style="position:absolute;left:0;top:0;width:100%;height:${scaleY(250)}px;background:#1e293b;display:flex;align-items:center;padding:0 ${scaleX(80)}px;box-sizing:border-box;justify-content:space-between;"><div style="font-size:${scaleMin(101)}px;color:#fff;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(70)}px;color:#fff;background:#38bdf8;padding:${scaleY(15)}px ${scaleX(30)}px;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div class="photo-panel" style="width:${scaleX(1300)}px;height:${scaleY(830)}px;position:absolute;right:0;bottom:0;${bgPos}"></div><div style="position:absolute;left:${scaleX(80)}px;top:${scaleY(320)}px;width:${scaleX(500)}px;font-size:${scaleMin(42)}px;color:#333;font-family:Roboto,sans-serif;line-height:1.8;font-weight:700;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div><div style="position:absolute;bottom:${scaleY(40)}px;left:${scaleX(80)}px;font-size:${scaleMin(35)}px;color:#1e293b;font-family:sans-serif;font-weight:800;letter-spacing:1px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaKurumsal6') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#fff;font-family:Montserrat,sans-serif;"><div class="photo-panel" style="width:100%;height:${scaleY(800)}px;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;left:0;top:${scaleY(800)}px;width:100%;height:${scaleY(280)}px;display:flex;"><div style="flex:1;border-right:2px solid #eee;padding:${scaleY(50)}px ${scaleX(60)}px;display:flex;flex-direction:column;justify-content:center;"><div style="font-size:${scaleMin(76)}px;color:#1e293b;font-weight:900;margin-bottom:${scaleY(10)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(57)}px;color:#38bdf8;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(30)}px;color:#1e293b;font-family:sans-serif;font-weight:800;letter-spacing:1px;margin-top:${scaleY(15)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div><div style="flex:1;padding:${scaleY(50)}px ${scaleX(60)}px;font-size:${scaleMin(53)}px;color:#444;font-family:Roboto,sans-serif;line-height:1.6;display:flex;align-items:center;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div></div>`;
    }
    else if (id === 'canvaKurumsal7') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#1e293b;font-family:Montserrat,sans-serif;"><div class="photo-panel" style="width:${scaleX(1500)}px;height:${scaleY(700)}px;position:absolute;left:${scaleX(210)}px;top:${scaleY(80)}px;${bgPos}"></div><div style="position:absolute;left:${scaleX(210)}px;bottom:${scaleY(80)}px;width:${scaleX(1500)}px;display:flex;justify-content:space-between;align-items:flex-end;"><div><div style="font-size:${scaleMin(85)}px;color:#fff;font-weight:900;margin-bottom:${scaleY(15)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(39)}px;color:#cbd5e1;font-family:Roboto,sans-serif;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="font-size:${scaleMin(76)}px;color:#38bdf8;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(53)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaKurumsal8') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#f8fafc;font-family:Montserrat,sans-serif;"><div style="position:absolute;left:${scaleX(60)}px;top:${scaleY(60)}px;width:${scaleX(1800)}px;height:${scaleY(960)}px;border:4px solid #1e293b;pointer-events:none;"></div><div class="photo-panel" style="width:${scaleX(1200)}px;height:${scaleY(700)}px;position:absolute;right:${scaleX(100)}px;top:${scaleY(100)}px;${bgPos}"></div><div style="position:absolute;left:${scaleX(100)}px;top:${scaleY(100)}px;width:${scaleX(550)}px;"><div style="font-size:${scaleMin(101)}px;color:#1e293b;font-weight:900;line-height:1.1;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(70)}px;color:#38bdf8;font-weight:900;margin-bottom:${scaleY(60)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(39)}px;color:#333;font-family:Roboto,sans-serif;line-height:1.8;font-weight:700;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(80)}px;right:${scaleX(100)}px;font-size:${scaleMin(35)}px;color:#1e293b;font-family:sans-serif;font-weight:800;letter-spacing:1px;z-index:20;text-align:right;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaKurumsal9') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#1e293b;font-family:Montserrat,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;left:${scaleX(100)}px;bottom:${scaleY(100)}px;background:#fff;width:${scaleX(700)}px;padding:${scaleY(50)}px;border-top:10px solid #38bdf8;box-shadow:0 20px 40px rgba(0,0,0,0.3);"><div style="font-size:${scaleMin(76)}px;color:#1e293b;font-weight:900;margin-bottom:${scaleY(20)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(62)}px;color:#38bdf8;font-weight:900;margin-bottom:${scaleY(30)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(53)}px;color:#555;font-family:Roboto,sans-serif;line-height:1.6;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaKurumsal10') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#fff;font-family:Montserrat,sans-serif;"><div class="photo-panel" style="width:${scaleX(1000)}px;height:${scaleY(800)}px;position:absolute;left:${scaleX(100)}px;top:${scaleY(140)}px;${bgPos};box-shadow:20px 20px 0 #1e293b;"></div><div style="position:absolute;right:${scaleX(100)}px;top:${scaleY(200)}px;width:${scaleX(600)}px;"><div style="font-size:${scaleMin(39)}px;color:#38bdf8;font-weight:900;margin-bottom:${scaleY(10)}px;letter-spacing:2px;">ÖZEL PORTFÖY</div><div style="font-size:${scaleMin(101)}px;color:#1e293b;font-weight:900;line-height:1.1;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(70)}px;color:#fff;background:#1e293b;padding:${scaleY(10)}px ${scaleX(20)}px;display:inline-block;margin-bottom:${scaleY(50)}px;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(39)}px;color:#444;font-family:Roboto,sans-serif;line-height:1.8;font-weight:700;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(53)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div>`;
    }
    canvaRenderLayer.querySelectorAll('.photo-panel').forEach(el => enablePhotoDrag(el));
    canvaRenderLayer.querySelectorAll('.editable-text').forEach(el => enableInlineEdit(el));
    requestAnimationFrame(() => {
        if(typeof redrawAll === 'function') redrawAll();
    });
}

window.renderKurumsalTemplate = renderKurumsalTemplate;
window.buildKurumsalCards = buildKurumsalCards;
window._kurumsalInit = _kurumsalInit;

setTimeout(_kurumsalInit, 200);




