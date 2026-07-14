/* ============================================================
   Sosyal Medya Şablon Seti - V3 (UNIQUE PRO)
============================================================ */

function _sosyalInit(){
    const container = document.getElementById('tpl-content-sosyal');
    if(!container) {
        setTimeout(_sosyalInit, 500);
        return;
    }
    container.innerHTML = `
        <div class="edit-hint">💡 Yazıya/panele ÇİFT TIKLA | Sürükle Bırak | Sağ Tık (Ayarlar)</div>
        <div class="section-title" style="margin-top:0">✍️ Hızlı Metin Düzenleyici</div>
        <div class="input-group"><label>Ana Başlık (Title)</label><input type="text" id="canvaSTitle" value="SATILIK MÜSTAKİL EV"></div>
        <div class="input-group"><label>Fiyat</label><input type="text" id="canvaSPrice" value="12.500.000 TL"></div>
        <div class="input-group"><label>Marka / İletişim</label><input type="text" id="canvaSContact" value="EMLAK STUDIO | 0532 000 0000"></div>
        <div class="input-group"><label>Özellikler (Alt alta)</label><textarea id="canvaSFeats" rows="4">Yeni Yapı\nLüks Donanım\nMerkezi Konum</textarea></div>
        <button class="btn-action btn-green" onclick="renderSTemplate(activeCanvaId)">✔️ Seçili Şablonu Uygula</button>
        
        <button class="btn-action btn-yellow" onclick="clearCanvaTemplate()" style="margin-top:8px">❌ Şablonu Kaldır</button>`;

    ['canvaSTitle','canvaSPrice','canvaSContact','canvaSFeats'].forEach(id=>{
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', () => { if(isCanvaMode) renderSTemplate(activeCanvaId) });
    });
    buildSCards();
}

function buildSCards(){
    let grid = document.getElementById('canvaTplGridS');
    if(!grid) {
        grid = document.createElement('div');
        grid.className = 'canva-tpl-grid';
        grid.id = 'canvaTplGridS';
        const hint = document.querySelector('#tpl-content-sosyal .edit-hint');
        if(hint) hint.parentNode.insertBefore(grid, hint.nextSibling);
    }
    grid.innerHTML = '';
    if(typeof SOSYAL_CARDS !== 'undefined') {
        SOSYAL_CARDS.forEach((c, idx) => {
            const card = document.createElement('div');
            card.className = 'canva-tpl-card';
            card.dataset.id = c.id;
            const tBg = 'linear-gradient(135deg, '+c.bg1+', '+c.bg2+')';
            card.innerHTML = '<div class="tpl-preview" style="display:flex;gap:0;border-radius:4px;overflow:hidden;background:'+tBg+'"><div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px;padding:4px;background:rgba(0,0,0,0.3)"><div style="font-size:9px;font-weight:900;color:'+c.accent+'">PRO</div><div style="font-size:7px;color:#fff">YENİ KALIP '+(idx+1)+'</div></div></div><div class="tpl-name">'+c.name+'</div>';
            card.onclick = () => {
                if(card.classList.contains('active')) return;
                document.querySelectorAll('#canvaTplGridS .canva-tpl-card').forEach(x => x.classList.remove('active'));
                card.classList.add('active');
                activeCanvaId = c.id;
                renderSTemplate(c.id);
            };
            grid.appendChild(card);
        });
    }
}

function renderSTemplate(id){
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

    const title = $('canvaSTitle').value.toUpperCase();
    const price = $('canvaSPrice').value;
    const contact = $('canvaSContact').value;
    const featsArr = $('canvaSFeats').value.split('\n').filter(x => x.trim().length > 0);
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


    if (id === 'canvaS1') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#fdf2f8;font-family:Poppins,sans-serif;"><div class="photo-panel" style="width:${scaleX(1500)}px;height:${scaleY(800)}px;position:absolute;left:50%;top:${scaleY(100)}px;transform:translateX(-50%);${bgPos};border-radius:60px;box-shadow:0 30px 60px rgba(190,24,93,0.3);"></div><div style="position:absolute;top:${scaleY(50)}px;left:${scaleX(150)}px;background:#be185d;color:#fff;padding:${scaleY(15)}px ${scaleX(30)}px;border-radius:40px;font-size:${scaleMin(24)}px;font-weight:700;box-shadow:0 10px 20px rgba(190,24,93,0.4);">YENİ İLAN</div><div style="position:absolute;bottom:${scaleY(50)}px;left:50%;transform:translateX(-50%);background:#fff;padding:${scaleY(30)}px ${scaleX(60)}px;border-radius:40px;box-shadow:0 20px 50px rgba(0,0,0,0.1);display:flex;align-items:center;gap:${scaleX(40)}px;"><div style="font-size:${scaleMin(45)}px;color:#000;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="width:3px;height:${scaleY(50)}px;background:#eee;"></div><div style="font-size:${scaleMin(35)}px;color:#be185d;font-weight:800;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaS2') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#fff;font-family:Poppins,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;bottom:${scaleY(80)}px;left:${scaleX(80)}px;width:${scaleX(1000)}px;"><div style="font-size:${scaleMin(65)}px;color:#fff;font-weight:900;line-height:1.1;margin-bottom:${scaleY(20)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(20)}px;color:#ddd;font-family:Inter,sans-serif;line-height:1.8;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(80)}px;right:${scaleX(80)}px;background:#be185d;padding:${scaleY(20)}px ${scaleX(40)}px;border-radius:20px;"><div style="font-size:${scaleMin(40)}px;color:#fff;font-weight:800;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaS3') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#fafafa;font-family:Poppins,sans-serif;"><div class="photo-panel" style="width:${scaleX(1200)}px;height:${scaleY(960)}px;position:absolute;right:${scaleX(60)}px;top:${scaleY(60)}px;${bgPos};border-radius:40px;box-shadow:0 20px 40px rgba(0,0,0,0.1);"></div><div style="position:absolute;left:${scaleX(80)}px;top:${scaleY(150)}px;width:${scaleX(500)}px;"><div style="width:${scaleX(60)}px;height:${scaleX(60)}px;background:#be185d;border-radius:50%;margin-bottom:${scaleY(30)}px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:30px;">★</div><div style="font-size:${scaleMin(60)}px;color:#000;font-weight:900;line-height:1.1;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(35)}px;color:#be185d;font-weight:800;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(28)}px;color:#555;font-family:Inter,sans-serif;line-height:2;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(18)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaS4') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#ffe4e6;font-family:Poppins,sans-serif;"><div style="position:absolute;left:0;bottom:0;width:100%;height:${scaleY(600)}px;background:#be185d;border-radius:50% 50% 0 0 / 200px 200px 0 0;"></div><div class="photo-panel" style="width:${scaleX(1000)}px;height:${scaleY(700)}px;position:absolute;left:50%;top:${scaleY(80)}px;transform:translateX(-50%);${bgPos};border-radius:400px 400px 0 0;border:10px solid #fff;box-shadow:0 30px 60px rgba(0,0,0,0.2);"></div><div style="position:absolute;bottom:${scaleY(80)}px;width:100%;text-align:center;color:#fff;"><div style="font-size:${scaleMin(55)}px;font-weight:900;margin-bottom:${scaleY(15)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(35)}px;font-weight:700;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaS5') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#000;font-family:Poppins,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};"></div><div style="position:absolute;left:${scaleX(100)}px;top:50%;transform:translateY(-50%);width:${scaleX(700)}px;"><div style="font-size:${scaleMin(80)}px;color:#fff;font-weight:900;line-height:1;margin-bottom:${scaleY(30)}px;text-shadow:2px 2px 0 #000, -2px -2px 0 #be185d;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(45)}px;color:#fff;background:#be185d;padding:${scaleY(10)}px ${scaleX(20)}px;display:inline-block;font-weight:900;transform:rotate(-3deg);margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(22)}px;color:#fff;font-family:Inter,sans-serif;background:rgba(0,0,0,0.5);padding:${scaleY(20)}px;border-radius:20px;backdrop-"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaS6') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#fff;font-family:Poppins,sans-serif;"><div style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,0.85);backdrop-filter:blur(10px);"></div><div class="photo-panel" style="width:${scaleX(1200)}px;height:${scaleY(500)}px;position:absolute;left:${scaleX(360)}px;top:${scaleY(290)}px;${bgPos};border-radius:30px;box-shadow:0 30px 60px rgba(0,0,0,0.3);"></div><div style="position:absolute;top:${scaleY(100)}px;width:100%;text-align:center;"><div style="font-size:${scaleMin(90)}px;color:#be185d;font-weight:900;letter-spacing:5px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div></div><div style="position:absolute;bottom:${scaleY(100)}px;width:100%;text-align:center;"><div style="font-size:${scaleMin(50)}px;color:#000;font-weight:800;background:#fff;padding:${scaleY(15)}px ${scaleX(50)}px;border-radius:50px;display:inline-block;box-shadow:0 10px 30px rgba(0,0,0,0.1);"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaS7') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#fdf2f8;font-family:Poppins,sans-serif;"><div style="position:absolute;left:${scaleX(870)}px;top:${scaleY(100)}px;width:${scaleX(900)}px;height:${scaleY(900)}px;background:#fff;padding:${scaleX(40)}px ${scaleX(40)}px ${scaleY(150)}px ${scaleX(40)}px;box-sizing:border-box;box-shadow:0 30px 60px rgba(0,0,0,0.15);transform:rotate(5deg);"><div class="photo-panel" style="width:100%;height:100%;${bgPos}"></div></div><div style="position:absolute;left:${scaleX(100)}px;top:${scaleY(300)}px;width:${scaleX(650)}px;"><div style="font-size:${scaleMin(75)}px;color:#000;font-weight:900;line-height:1;margin-bottom:${scaleY(30)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(45)}px;color:#be185d;font-weight:800;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(20)}px;color:#555;font-family:Inter,sans-serif;line-height:1.8;background:#fff;padding:${scaleY(30)}px;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,0.05);"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaS8') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#fff;font-family:Poppins,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;top:${scaleY(200)}px;left:0;background:#be185d;color:#fff;padding:${scaleY(40)}px ${scaleX(80)}px;border-radius:0 50px 50px 0;box-shadow:0 20px 40px rgba(190,24,93,0.4);"><div style="font-size:${scaleMin(65)}px;font-weight:900;line-height:1.1;margin-bottom:${scaleY(10)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(35)}px;font-weight:700;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(100)}px;right:${scaleX(100)}px;background:rgba(255,255,255,0.95);padding:${scaleY(30)}px ${scaleX(50)}px;border-radius:30px;box-shadow:0 20px 50px rgba(0,0,0,0.2);width:${scaleX(500)}px;"><div style="font-size:${scaleMin(28)}px;color:#333;font-family:Inter,sans-serif;line-height:1.8;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(18)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaS9') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#111;font-family:Poppins,sans-serif;"><div class="photo-panel" style="width:100%;height:${scaleY(600)}px;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;left:0;top:${scaleY(600)}px;width:100%;height:${scaleY(480)}px;background:#111;display:flex;align-items:center;padding:0 ${scaleX(100)}px;box-sizing:border-box;"><div style="flex:1;"><div style="font-size:${scaleMin(60)}px;color:#fff;font-weight:900;margin-bottom:${scaleY(20)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(20)}px;color:#aaa;font-family:Inter,sans-serif;line-height:1.8;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="flex:1;text-align:right;"><div style="font-size:${scaleMin(55)}px;color:#be185d;font-weight:900;background:rgba(190,24,93,0.1);padding:${scaleY(20)}px ${scaleX(40)}px;border-radius:20px;display:inline-block;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaS10') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#be185d;font-family:Poppins,sans-serif;"><div class="photo-panel" style="width:${scaleX(1720)}px;height:${scaleY(880)}px;position:absolute;left:${scaleX(100)}px;top:${scaleY(100)}px;${bgPos};border-radius:40px;box-shadow:0 30px 60px rgba(0,0,0,0.5);"></div><div style="position:absolute;bottom:${scaleY(100)}px;left:50%;transform:translateX(-50%);background:#fff;padding:${scaleY(30)}px ${scaleX(60)}px;border-radius:30px;display:flex;align-items:center;gap:${scaleX(50)}px;box-shadow:0 20px 40px rgba(0,0,0,0.3);"><div style="font-size:${scaleMin(40)}px;color:#000;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="width:4px;height:${scaleY(40)}px;background:#be185d;"></div><div style="font-size:${scaleMin(35)}px;color:#be185d;font-weight:800;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;top:${scaleY(150)}px;left:${scaleX(150)}px;background:rgba(0,0,0,0.6);backdrop-padding:${scaleY(20)}px ${scaleX(40)}px;border-radius:20px;font-size:${scaleMin(28)}px;color:#fff;font-family:Inter,sans-serif;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(18)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    canvaRenderLayer.querySelectorAll('.photo-panel').forEach(el => enablePhotoDrag(el));
        canvaRenderLayer.querySelectorAll('.editable-text').forEach(el => enableInlineEdit(el));
    requestAnimationFrame(() => {
        if(typeof redrawAll === 'function') redrawAll();
    });
}
setTimeout(_sosyalInit, 200);
