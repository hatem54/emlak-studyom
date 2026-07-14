/* ============================================================
   Portföy Şablon Seti - V3 (UNIQUE PRO)
============================================================ */

function _portfoyInit(){
    const container = document.getElementById('tpl-content-portfoy');
    if(!container) {
        setTimeout(_portfoyInit, 500);
        return;
    }
    container.innerHTML = `
        <div class="edit-hint">💡 Yazıya/panele ÇİFT TIKLA | Sürükle Bırak | Sağ Tık (Ayarlar)</div>
        <div class="section-title" style="margin-top:0">✍️ Hızlı Metin Düzenleyici</div>
        <div class="input-group"><label>Ana Başlık (Title)</label><input type="text" id="canvaPTitle" value="SATILIK MÜSTAKİL EV"></div>
        <div class="input-group"><label>Fiyat</label><input type="text" id="canvaPPrice" value="12.500.000 TL"></div>
        <div class="input-group"><label>Marka / İletişim</label><input type="text" id="canvaPContact" value="EMLAK STUDIO | 0532 000 0000"></div>
        <div class="input-group"><label>Özellikler (Alt alta)</label><textarea id="canvaPFeats" rows="4">Yeni Yapı\nLüks Donanım\nMerkezi Konum</textarea></div>
        <button class="btn-action btn-green" onclick="renderPTemplate(activeCanvaId)">✔️ Seçili Şablonu Uygula</button>
        
        <button class="btn-action btn-yellow" onclick="clearCanvaTemplate()" style="margin-top:8px">❌ Şablonu Kaldır</button>`;

    ['canvaPTitle','canvaPPrice','canvaPContact','canvaPFeats'].forEach(id=>{
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', () => { if(isCanvaMode) renderPTemplate(activeCanvaId) });
    });
    buildPCards();
}

function buildPCards(){
    let grid = document.getElementById('canvaTplGridP');
    if(!grid) {
        grid = document.createElement('div');
        grid.className = 'canva-tpl-grid';
        grid.id = 'canvaTplGridP';
        const hint = document.querySelector('#tpl-content-portfoy .edit-hint');
        if(hint) hint.parentNode.insertBefore(grid, hint.nextSibling);
    }
    grid.innerHTML = '';
    if(typeof PORTFOY_CARDS !== 'undefined') {
        PORTFOY_CARDS.forEach((c, idx) => {
            const card = document.createElement('div');
            card.className = 'canva-tpl-card';
            card.dataset.id = c.id;
            const tBg = 'linear-gradient(135deg, '+c.bg1+', '+c.bg2+')';
            card.innerHTML = '<div class="tpl-preview" style="display:flex;gap:0;border-radius:4px;overflow:hidden;background:'+tBg+'"><div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px;padding:4px;background:rgba(0,0,0,0.3)"><div style="font-size:9px;font-weight:900;color:'+c.accent+'">PRO</div><div style="font-size:7px;color:#fff">YENİ KALIP '+(idx+1)+'</div></div></div><div class="tpl-name">'+c.name+'</div>';
            card.onclick = () => {
                if(card.classList.contains('active')) return;
                document.querySelectorAll('#canvaTplGridP .canva-tpl-card').forEach(x => x.classList.remove('active'));
                card.classList.add('active');
                activeCanvaId = c.id;
                renderPTemplate(c.id);
            };
            grid.appendChild(card);
        });
    }
}

function renderPTemplate(id){
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

    const title = $('canvaPTitle').value.toUpperCase();
    const price = $('canvaPPrice').value;
    const contact = $('canvaPContact').value;
    const featsArr = $('canvaPFeats').value.split('\n').filter(x => x.trim().length > 0);
    const feats = featsArr.map(l => '<div style="margin-bottom:8px;">• ' + l + '</div>').join('');
    
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


    if (id === 'canvaP1') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#000;font-family:Raleway,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;bottom:0;left:0;width:100%;height:${scaleY(350)}px;"></div><div style="position:absolute;bottom:${scaleY(60)}px;left:${scaleX(80)}px;width:${scaleX(1200)}px;display:flex;align-items:flex-end;gap:${scaleX(60)}px;"><div style="font-size:${scaleMin(120)}px;color:#bbf7d0;font-weight:200;line-height:0.8;">01</div><div><div style="font-size:${scaleMin(60)}px;color:#fff;font-weight:700;margin-bottom:${scaleY(15)}px;letter-spacing:2px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(20)}px;color:#ccc;font-family:Roboto,sans-serif;letter-spacing:4px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaP2') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#fff;font-family:Raleway,sans-serif;"><div style="position:absolute;left:0;top:0;width:${scaleX(450)}px;height:100%;background:#f8f9fa;padding:${scaleY(80)}px ${scaleX(60)}px;box-sizing:border-box;display:flex;flex-direction:column;"><div style="font-size:${scaleMin(45)}px;color:#166534;font-weight:800;line-height:1.1;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(30)}px;color:#000;font-weight:600;margin-bottom:${scaleY(60)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(28)}px;color:#666;font-family:Roboto,sans-serif;line-height:2;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div><div style="margin-top:auto;font-size:${scaleMin(14)}px;color:#aaa;letter-spacing:3px;">PORTFOLIO COLLECTION</div></div><div class="photo-panel" style="width:${scaleX(1470)}px;height:100%;position:absolute;right:0;top:0;${bgPos}"></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(18)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaP3') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#000;font-family:Raleway,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;left:0;top:0;width:${scaleX(700)}px;height:100%;background:#166534;padding:${scaleY(100)}px ${scaleX(80)}px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;"><div style="width:${scaleX(80)}px;height:4px;background:#bbf7d0;margin-bottom:${scaleY(40)}px;"></div><div style="font-size:${scaleMin(65)}px;color:#fff;font-weight:700;line-height:1.2;margin-bottom:${scaleY(30)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(40)}px;color:#bbf7d0;font-weight:600;margin-bottom:${scaleY(50)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(20)}px;color:#e2e8f0;font-family:Roboto,sans-serif;line-height:2;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaP4') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#e5e7eb;font-family:Raleway,sans-serif;"><div class="photo-panel" style="width:100%;height:${scaleY(600)}px;position:absolute;left:0;top:50%;transform:translateY(-50%);${bgPos};box-shadow:0 30px 60px rgba(0,0,0,0.2);"></div><div style="position:absolute;top:${scaleY(50)}px;width:100%;text-align:center;"><div style="font-size:${scaleMin(55)}px;color:#166534;font-weight:800;letter-spacing:5px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div></div><div style="position:absolute;bottom:${scaleY(60)}px;width:100%;text-align:center;"><div style="font-size:${scaleMin(35)}px;color:#333;font-weight:600;letter-spacing:2px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaP5') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#fff;font-family:Raleway,sans-serif;"><div style="position:absolute;left:${scaleX(40)}px;top:${scaleY(40)}px;right:${scaleX(40)}px;bottom:${scaleY(40)}px;border:2px solid #166534;"></div><div class="photo-panel" style="width:${scaleX(1200)}px;height:${scaleY(700)}px;position:absolute;right:${scaleX(80)}px;top:${scaleY(80)}px;${bgPos}"></div><div style="position:absolute;left:${scaleX(80)}px;top:${scaleY(150)}px;width:${scaleX(500)}px;"><div style="font-size:${scaleMin(80)}px;color:#166534;font-weight:900;line-height:1;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(40)}px;color:#000;font-weight:600;margin-bottom:${scaleY(50)}px;border-bottom:2px solid #166534;padding-bottom:${scaleY(20)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(28)}px;color:#555;font-family:Roboto,sans-serif;line-height:2;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(18)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaP6') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#166534;font-family:Raleway,sans-serif;"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:${scaleMin(400)}px;color:rgba(255,255,255,0.05);font-weight:900;line-height:0.8;white-space:nowrap;pointer-events:none;">01</div><div class="photo-panel" style="width:${scaleX(1000)}px;height:${scaleY(800)}px;position:absolute;right:${scaleX(100)}px;top:${scaleY(140)}px;${bgPos};box-shadow:0 30px 60px rgba(0,0,0,0.5);"></div><div style="position:absolute;left:${scaleX(80)}px;top:${scaleY(250)}px;width:${scaleX(650)}px;"><div style="font-size:${scaleMin(65)}px;color:#fff;font-weight:800;line-height:1.1;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(40)}px;color:#bbf7d0;font-weight:600;background:rgba(0,0,0,0.3);padding:${scaleY(15)}px ${scaleX(25)}px;border-radius:10px;display:inline-block;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaP7') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#fff;font-family:Raleway,sans-serif;"><div class="photo-panel" style="width:100%;height:${scaleY(540)}px;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;left:0;top:${scaleY(540)}px;width:50%;height:${scaleY(540)}px;background:#166534;padding:${scaleY(80)}px;box-sizing:border-box;"><div style="font-size:${scaleMin(65)}px;color:#fff;font-weight:800;line-height:1.2;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div></div><div style="position:absolute;right:0;top:${scaleY(540)}px;width:50%;height:${scaleY(540)}px;background:#f8f9fa;padding:${scaleY(80)}px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;"><div style="font-size:${scaleMin(45)}px;color:#166534;font-weight:700;margin-bottom:${scaleY(30)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(20)}px;color:#444;font-family:Roboto,sans-serif;line-height:1.8;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaP8') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#000;font-family:Raleway,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};"></div><div style="position:absolute;left:0;top:0;width:100%;height:100%;background:#bbf7d0;clip-path:polygon(0 0, 46% 0, 36% 100%, 0 100%);z-index:1;"></div><div style="position:absolute;left:0;top:0;width:100%;height:100%;background:#166534;clip-path:polygon(0 0, 45% 0, 35% 100%, 0 100%);z-index:2;display:flex;flex-direction:column;justify-content:center;padding-left:${scaleX(80)}px;box-sizing:border-box;"><div style="width:${scaleX(600)}px;"><div style="font-size:${scaleMin(75)}px;color:#fff;font-weight:900;line-height:1.1;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(45)}px;color:#166534;font-weight:800;background:#bbf7d0;padding:${scaleY(15)}px ${scaleX(30)}px;border-radius:15px;display:inline-block;margin-bottom:${scaleY(50)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(24)}px;color:#e2e8f0;font-family:Roboto,sans-serif;line-height:2;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div></div><div style="position:absolute;bottom:${scaleY(40)}px;right:${scaleX(50)}px;background:rgba(22, 101, 52, 0.95);padding:${scaleY(15)}px ${scaleX(40)}px;border-radius:30px;font-size:${scaleMin(24)}px;color:#fff;font-weight:700;letter-spacing:2px;z-index:20;border:2px solid #bbf7d0;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaP9') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#fff;font-family:Raleway,sans-serif;"><div class="photo-panel" style="width:100%;height:${scaleY(960)}px;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;bottom:0;left:0;width:100%;height:${scaleY(120)}px;background:#166534;display:flex;align-items:center;padding:0 ${scaleX(80)}px;box-sizing:border-box;justify-content:space-between;"><div style="font-size:${scaleMin(40)}px;color:#fff;font-weight:700;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(30)}px;color:#bbf7d0;font-weight:600;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaP10') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#e5e7eb;font-family:Raleway,sans-serif;"><div class="photo-panel" style="width:${scaleX(1600)}px;height:${scaleY(800)}px;position:absolute;left:${scaleX(160)}px;top:${scaleY(60)}px;${bgPos};border-radius:10px;box-shadow:0 40px 80px rgba(0,0,0,0.15);"></div><div style="position:absolute;bottom:${scaleY(60)}px;left:50%;transform:translateX(-50%);background:#fff;padding:${scaleY(40)}px ${scaleX(80)}px;border-radius:15px;box-shadow:0 20px 40px rgba(0,0,0,0.1);text-align:center;width:${scaleX(1000)}px;"><div style="font-size:${scaleMin(45)}px;color:#166534;font-weight:800;margin-bottom:${scaleY(15)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(30)}px;color:#333;font-weight:600;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    canvaRenderLayer.querySelectorAll('.photo-panel').forEach(el => enablePhotoDrag(el));
        canvaRenderLayer.querySelectorAll('.editable-text').forEach(el => enableInlineEdit(el));
    requestAnimationFrame(() => {
        if(typeof redrawAll === 'function') redrawAll();
    });
}
setTimeout(_portfoyInit, 200);
