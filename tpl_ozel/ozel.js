/* ============================================================
   Özel Şablon Seti - V3 (UNIQUE PRO)
============================================================ */

function _ozelInit(){
    const container = document.getElementById('tpl-content-ozel');
    if(!container) {
        setTimeout(_ozelInit, 500);
        return;
    }
    container.innerHTML = `
        <div class="edit-hint">💡 Yazıya/panele ÇİFT TIKLA | Sürükle Bırak | Sağ Tık (Ayarlar)</div>
        <div class="section-title" style="margin-top:0">✍️ Hızlı Metin Düzenleyici</div>
        <div class="input-group"><label>Ana Başlık (Title)</label><input type="text" id="canvaOTitle" value="SATILIK MÜSTAKİL EV"></div>
        <div class="input-group"><label>Fiyat</label><input type="text" id="canvaOPrice" value="12.500.000 TL"></div>
        <div class="input-group"><label>Marka / İletişim</label><input type="text" id="canvaOContact" value="EMLAK STUDIO | 0532 000 0000"></div>
        <div class="input-group"><label>Özellikler (Alt alta)</label><textarea id="canvaOFeats" rows="4">Yeni Yapı\nLüks Donanım\nMerkezi Konum</textarea></div>
        <button class="btn-action btn-green" onclick="renderOTemplate(activeCanvaId)">✔️ Seçili Şablonu Uygula</button>
        
        <button class="btn-action btn-yellow" onclick="clearCanvaTemplate()" style="margin-top:8px">❌ Şablonu Kaldır</button>`;

    ['canvaOTitle','canvaOPrice','canvaOContact','canvaOFeats'].forEach(id=>{
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', () => { if(isCanvaMode) renderOTemplate(activeCanvaId) });
    });
    buildOCards();
}

function buildOCards(){
    let grid = document.getElementById('canvaTplGridO');
    if(!grid) {
        grid = document.createElement('div');
        grid.className = 'canva-tpl-grid';
        grid.id = 'canvaTplGridO';
        const hint = document.querySelector('#tpl-content-ozel .edit-hint');
        if(hint) hint.parentNode.insertBefore(grid, hint.nextSibling);
    }
    grid.innerHTML = '';
    if(typeof OZEL_CARDS !== 'undefined') {
        OZEL_CARDS.forEach((c, idx) => {
            const card = document.createElement('div');
            card.className = 'canva-tpl-card';
            card.dataset.id = c.id;
            const tBg = 'linear-gradient(135deg, '+c.bg1+', '+c.bg2+')';
            card.innerHTML = '<div class="tpl-preview" style="display:flex;gap:0;border-radius:4px;overflow:hidden;background:'+tBg+'"><div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px;padding:4px;background:rgba(0,0,0,0.3)"><div style="font-size:9px;font-weight:900;color:'+c.accent+'">PRO</div><div style="font-size:7px;color:#fff">YENİ KALIP '+(idx+1)+'</div></div></div><div class="tpl-name">'+c.name+'</div>';
            card.onclick = () => {
                if(card.classList.contains('active')) return;
                document.querySelectorAll('#canvaTplGridO .canva-tpl-card').forEach(x => x.classList.remove('active'));
                card.classList.add('active');
                activeCanvaId = c.id;
                renderOTemplate(c.id);
            };
            grid.appendChild(card);
        });
    }
}

function renderOTemplate(id){
    if(!id) return;
    if(typeof _kolajTemizle === 'function') _kolajTemizle();
    document.querySelectorAll('.normal-el').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.canva-generated, .canva-panel').forEach(e => e.remove());
      var baseCanvas = document.getElementById('draw-layer');
      // if(baseCanvas) { var ctx = baseCanvas.getContext('2d'); ctx.clearRect(0,0,1920,1080); }
    document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
    isCanvaMode = true;
    
    if(typeof elLogo !== 'undefined' && elLogo && elLogo.src && elLogo.src !== window.location.href) {
        elLogo.style.visibility = 'visible'; elLogo.style.top = 'auto'; elLogo.style.left = 'auto'; elLogo.style.bottom = '50px'; elLogo.style.right = '50px';
    }
    photoLayer.style.display = 'none';
    canvaRenderLayer.style.display = 'block';

    const title = $('canvaOTitle').value.toUpperCase();
    const price = $('canvaOPrice').value;
    const contact = $('canvaOContact').value;
    const feats = $('canvaOFeats').value;
    const featsArr = feats.split('\n').filter(x => x.trim().length > 0);
    const featsHtml = featsArr.map(l => '<div style="margin-bottom:8px;">• ' + l + '</div>').join('');
    
    const bgImg = uploadedImgUrl ? "background-image:url('" + uploadedImgUrl + "')" : "background-color:#94a3b8";
    const x = $('photoXCtrl') ? $('photoXCtrl').value : 50;
    const y = $('photoYCtrl') ? $('photoYCtrl').value : 50;
    const bgPos = bgImg + ";background-position:" + x + "% " + y + "%;background-size:cover;";

    const canvasSize = getCanvasSize();
    const fullW = canvasSize.w;
    const fullH = canvasSize.h;
    const scaleX = v => (v / 1920) * fullW;
    const scaleY = v => (v / 1080) * fullH;
    const scaleMin = v => v * Math.min(fullW/1920, fullH/1080);


    if (id === 'canvaO1') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#000000;font-family:Oswald,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};"></div><div style="position:absolute;left:${scaleX(100)}px;top:${scaleY(100)}px;width:${scaleX(4)}px;height:${scaleY(400)}px;background:#a78bfa;box-shadow:0 0 20px #a78bfa;"></div><div style="position:absolute;left:${scaleX(140)}px;top:${scaleY(150)}px;width:${scaleX(800)}px;"><div style="font-size:${scaleMin(20)}px;color:#a78bfa;font-family:monospace;letter-spacing:10px;margin-bottom:${scaleY(20)}px;text-shadow:0 0 10px #a78bfa;">// PREMIUM.ESTATE //</div><div style="font-size:${scaleMin(90)}px;color:#fff;font-family:Archivo Black,sans-serif;line-height:0.9;margin-bottom:${scaleY(40)}px;text-shadow:2px 2px 0 #a78bfa;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(50)}px;color:#000000;background:#a78bfa;padding:${scaleY(10)}px ${scaleX(20)}px;display:inline-block;font-weight:900;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(20)}px;color:#fff;font-family:monospace;line-height:2;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaO2') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#050505;font-family:Oswald,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};"></div><div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(45deg);width:${scaleX(700)}px;height:${scaleX(700)}px;border:2px solid #a78bfa;box-shadow:0 0 50px rgba(167, 139, 250, 0.5), inset 0 0 50px rgba(167, 139, 250, 0.5);"></div><div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;width:${scaleX(900)}px;"><div style="font-size:${scaleMin(80)}px;color:#fff;font-family:Archivo Black,sans-serif;text-shadow:0 0 20px #a78bfa;margin-bottom:${scaleY(30)}px;letter-spacing:5px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(40)}px;color:#a78bfa;letter-spacing:8px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaO3') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#000;font-family:Archivo Black,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};"></div><div style="position:absolute;left:${scaleX(100)}px;top:50%;transform:translateY(-50%);width:${scaleX(750)}px;background:rgba(10,10,15,0.75);backdrop-filter:blur(25px);border:1px solid rgba(167,139,250,0.2);border-left:8px solid #a78bfa;border-radius:30px;padding:${scaleY(80)}px ${scaleX(60)}px;box-sizing:border-box;box-shadow:0 40px 80px rgba(0,0,0,0.6);"><div style="font-size:${scaleMin(20)}px;color:#a78bfa;letter-spacing:4px;margin-bottom:${scaleY(20)}px;text-transform:uppercase;">ÖZEL TASARIM</div><div style="font-size:${scaleMin(75)}px;color:#fff;font-weight:900;line-height:1.1;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(45)}px;color:#000;font-weight:800;background:linear-gradient(90deg, #a78bfa, #c084fc);padding:${scaleY(15)}px ${scaleX(40)}px;border-radius:20px;display:inline-block;margin-bottom:${scaleY(50)}px;box-shadow:0 10px 30px rgba(167,139,250,0.3);"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(22)}px;color:#d1d5db;font-family:Roboto,sans-serif;line-height:1.8;letter-spacing:1px;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(30)}px;right:${scaleX(50)}px;background:rgba(0,0,0,0.8);backdrop-filter:blur(10px);border:1px solid #a78bfa;padding:${scaleY(15)}px ${scaleX(40)}px;border-radius:30px;font-size:${scaleMin(22)}px;color:#fff;font-family:Roboto,sans-serif;font-weight:700;letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaO4') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#050505;font-family:monospace;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};"></div><div style="position:absolute;top:${scaleY(50)}px;left:${scaleX(50)}px;width:${scaleX(100)}px;height:${scaleX(100)}px;border-top:4px solid #a78bfa;border-left:4px solid #a78bfa;"></div><div style="position:absolute;bottom:${scaleY(50)}px;right:${scaleX(50)}px;width:${scaleX(100)}px;height:${scaleX(100)}px;border-bottom:4px solid #a78bfa;border-right:4px solid #a78bfa;"></div><div style="position:absolute;top:${scaleY(150)}px;left:${scaleX(150)}px;"><div style="font-size:${scaleMin(20)}px;color:#a78bfa;">[ SYS.OVERRIDE ]</div><div style="font-size:${scaleMin(70)}px;color:#fff;font-family:Archivo Black,sans-serif;margin-top:${scaleY(20)}px;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(40)}px;color:#000;background:#a78bfa;padding:${scaleY(5)}px ${scaleX(15)}px;display:inline-block;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(150)}px;left:${scaleX(150)}px;font-size:${scaleMin(28)}px;color:#fff;line-height:2;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(18)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaO5') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#111;font-family:Oswald,sans-serif;"><div class="photo-panel" style="width:${scaleX(1500)}px;height:${scaleY(800)}px;position:absolute;right:0;top:${scaleY(140)}px;${bgPos}"></div><div style="position:absolute;left:${scaleX(100)}px;top:${scaleY(200)}px;width:${scaleX(650)}px;background:#050505;padding:${scaleY(80)}px ${scaleX(60)}px;box-shadow:30px 30px 0 rgba(167,139,250,0.2), 0 0 50px rgba(0,0,0,0.9);"><div style="font-size:${scaleMin(65)}px;color:#fff;font-family:Archivo Black,sans-serif;line-height:1.1;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(40)}px;color:#a78bfa;margin-bottom:${scaleY(50)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(20)}px;color:#aaa;line-height:2;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaO6') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#0a0a0a;font-family:Oswald,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};"></div><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:100%;"><div style="font-size:${scaleMin(130)}px;color:transparent;font-family:Archivo Black,sans-serif;line-height:1;margin-bottom:${scaleY(40)}px;-webkit-text-stroke:2px #a78bfa;text-shadow:0 0 30px rgba(167,139,250,0.5);"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(55)}px;color:#fff;font-weight:700;text-shadow:0 0 20px #fff;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(80)}px;left:0;width:100%;display:flex;justify-content:center;gap:${scaleX(40)}px;font-size:${scaleMin(20)}px;color:#ccc;letter-spacing:2px;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaO7') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#000;font-family:Oswald,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};"></div><div style="position:absolute;left:${scaleX(80)}px;top:${scaleY(80)}px;width:${scaleX(800)}px;height:${scaleY(920)}px;background:rgba(0,0,0,0.8);border-left:5px solid #a78bfa;border-right:2px solid #0ff;padding:${scaleY(80)}px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;"><div style="font-size:${scaleMin(80)}px;color:#fff;font-family:Archivo Black,sans-serif;line-height:1;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(45)}px;color:#a78bfa;margin-bottom:${scaleY(50)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(22)}px;color:#ddd;line-height:1.8;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaO8') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#1a1a1a;font-family:Archivo Black,sans-serif;"><div style="position:absolute;left:0;top:0;width:100%;height:${scaleY(200)}px;background:#a78bfa;display:flex;align-items:center;padding:0 ${scaleX(80)}px;box-sizing:border-box;"><div style="font-size:${scaleMin(80)}px;color:#000;font-weight:900;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div></div><div class="photo-panel" style="width:${scaleX(1200)}px;height:${scaleY(880)}px;position:absolute;left:0;top:${scaleY(200)}px;${bgPos}"></div><div style="position:absolute;right:0;top:${scaleY(200)}px;width:${scaleX(720)}px;height:${scaleY(880)}px;background:#000;padding:${scaleY(100)}px ${scaleX(80)}px;box-sizing:border-box;display:flex;flex-direction:column;"><div style="font-size:${scaleMin(60)}px;color:#fff;font-weight:900;margin-bottom:${scaleY(60)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(24)}px;color:#aaa;line-height:2;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaO9') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#000;font-family:Oswald,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};clip-path:polygon(0 0, 100% 0, 100% 50%, 0 80%);"></div><div style="position:absolute;bottom:${scaleY(80)}px;left:${scaleX(100)}px;width:${scaleX(900)}px;"><div style="font-size:${scaleMin(60)}px;color:#fff;font-family:Archivo Black,sans-serif;margin-bottom:${scaleY(20)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(40)}px;color:#a78bfa;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(20)}px;color:#888;line-height:2;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaO10') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:linear-gradient(to bottom, #111, #2d0b3f);font-family:Oswald,sans-serif;"><div class="photo-panel" style="width:${scaleX(1400)}px;height:${scaleY(600)}px;position:absolute;left:${scaleX(260)}px;top:${scaleY(100)}px;${bgPos};border-bottom:4px solid #f0f;box-shadow:0 20px 50px rgba(255,0,255,0.2);"></div><div style="position:absolute;left:${scaleX(100)}px;bottom:${scaleY(100)}px;width:${scaleX(1720)}px;display:flex;justify-content:space-between;align-items:flex-end;"><div><div style="font-size:${scaleMin(70)}px;color:#fff;font-family:Archivo Black,sans-serif;text-shadow:2px 2px 0 #0ff;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(22)}px;color:#fff;font-family:monospace;margin-top:${scaleY(20)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="font-size:${scaleMin(50)}px;color:#f0f;text-shadow:0 0 10px #f0f;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    canvaRenderLayer.querySelectorAll('.photo-panel').forEach(el => enablePhotoDrag(el));
        canvaRenderLayer.querySelectorAll('.editable-text').forEach(el => enableInlineEdit(el));
    requestAnimationFrame(() => {
        if(typeof redrawAll === 'function') redrawAll();
    });
}
setTimeout(_ozelInit, 200);
