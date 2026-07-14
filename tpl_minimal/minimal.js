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
    
    container.innerHTML = `
        <div class="edit-hint">💡 Yazıya/panele ÇİFT TIKLA | Sürükle Bırak | Sağ Tık (Ayarlar)</div>
        <div class="section-title" style="margin-top:0">✍️ Hızlı Metin Düzenleyici</div>
        
        <div class="input-group">
            <label>Ana Başlık (Title)</label>
            <input type="text" id="canvaMTitle" value="SATILIK MÜSTAKİL EV">
        </div>
        <div class="input-group">
            <label>Fiyat</label>
            <input type="text" id="canvaMPrice" value="12.500.000 TL">
        </div>
        <div class="input-group">
            <label>Marka / İletişim</label>
            <input type="text" id="canvaMContact" value="EMLAK STUDIO | 0532 000 0000">
        </div>
        <div class="input-group">
            <label>Özellikler (Alt alta)</label>
            <textarea id="canvaMFeats" rows="4">Yeni Yapı\nLüks Donanım\nMerkezi Konum</textarea>
        </div>
        <button class="btn-action btn-green" onclick="renderMTemplate(activeCanvaId)">✔️ Seçili Şablonu Uygula</button>
        
        <button class="btn-action btn-yellow" onclick="clearCanvaTemplate()" style="margin-top:8px">❌ Şablonu Kaldır (Normal Dön)</button>
    `;

    ['canvaMTitle','canvaMPrice','canvaMContact','canvaMFeats'].forEach(id=>{
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', () => { if(isCanvaMode) renderMTemplate(activeCanvaId) });
    });

    buildMCards();
}

function buildMCards(){
    let grid = document.getElementById('canvaTplGridM');
    if(!grid) {
        grid = document.createElement('div');
        grid.className = 'canva-tpl-grid';
        grid.id = 'canvaTplGridM';
        const hint = document.querySelector('#tpl-content-minimal .edit-hint');
        if(hint) hint.parentNode.insertBefore(grid, hint.nextSibling);
    }
    grid.innerHTML = '';
    
    if(typeof MINIMAL_CARDS !== 'undefined') {
        MINIMAL_CARDS.forEach((c, idx) => {
            const card = document.createElement('div');
            card.className = 'canva-tpl-card';
            card.dataset.id = c.id;
            
            // Generate a visually distinct thumbnail per layout type
            const bgs = [
                'linear-gradient(to right, '+c.bg1+' 40%, '+c.bg2+' 40%)',
                'radial-gradient(circle, '+c.bg2+' 30%, '+c.bg1+' 70%)',
                'linear-gradient(135deg, '+c.bg1+', '+c.bg2+')',
                'linear-gradient(110deg, '+c.bg1+' 50%, '+c.bg2+' 50%)',
                'linear-gradient(to top, '+c.bg2+' 30%, '+c.bg1+' 30%)',
                'conic-gradient(from 45deg, '+c.bg1+', '+c.bg2+', '+c.bg1+')',
                'linear-gradient(to bottom right, '+c.bg1+', '+c.bg2+')',
                'radial-gradient(circle at top right, '+c.bg2+', '+c.bg1+')',
                'linear-gradient(to right, '+c.bg1+' 10%, '+c.bg2+' 10% 90%, '+c.bg1+' 90%)',
                'linear-gradient(to bottom, '+c.bg1+' 20%, '+c.bg2+' 80%)'
            ];
            const tBg = bgs[idx % 10];

            card.innerHTML = '<div class="tpl-preview" style="display:flex;gap:0;border-radius:4px;overflow:hidden;background:'+tBg+'"><div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px;padding:4px;background:rgba(0,0,0,0.3)"><div style="font-size:9px;font-weight:900;color:'+c.accent+'">PRO</div><div style="font-size:7px;color:#fff">TASARIM '+(idx+1)+'</div></div></div><div class="tpl-name">'+c.name+'</div>';
            
            card.onclick = () => {
                if(card.classList.contains('active')) return;
                document.querySelectorAll('#canvaTplGridM .canva-tpl-card').forEach(x => x.classList.remove('active'));
                card.classList.add('active');
                activeCanvaId = c.id;
                renderMTemplate(c.id);
            };
            grid.appendChild(card);
        });
    }
}

function renderMTemplate(id){
    if(!id) return;
    if(typeof _kolajTemizle === 'function') _kolajTemizle();
    document.querySelectorAll('.normal-el').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.canva-generated, .canva-panel').forEach(e => e.remove());
      var baseCanvas = document.getElementById('draw-layer');
      // if(baseCanvas) { var ctx = baseCanvas.getContext('2d'); ctx.clearRect(0,0,1920,1080); }
    document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
    isCanvaMode = true;
    
    if(typeof elLogo !== 'undefined' && elLogo && elLogo.src && elLogo.src !== window.location.href) {
        elLogo.style.visibility = 'visible';
        elLogo.style.top = 'auto';
        elLogo.style.left = 'auto';
        elLogo.style.bottom = '50px';
        elLogo.style.right = '50px';
    }
    photoLayer.style.display = 'none';
    canvaRenderLayer.style.display = 'block';

    const title = $('canvaMTitle').value.toUpperCase();
    const price = $('canvaMPrice').value;
    const contact = $('canvaMContact').value;
    // Format feats as bullet points
    const featsArr = $('canvaMFeats').value.split('\n').filter(x => x.trim().length > 0);
    const feats = featsArr.map(l => '<div style="margin-bottom:12px;display:flex;align-items:center;gap:10px;"><div style="width:8px;height:8px;background:#111827;border-radius:50%;flex-shrink:0;"></div> ' + l + '</div>').join('');
    
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
    let photoW = fullW;
    let photoH = fullH;


    if (id === 'canvaM1') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#f3f4f6;font-family:Inter,sans-serif;"><div class="photo-panel" style="width:${scaleX(1200)}px;height:${fullH}px;position:absolute;right:0;top:0;${bgPos}"></div><div style="position:absolute;left:0;top:0;width:${scaleX(720)}px;height:${fullH}px;background:linear-gradient(135deg, #f3f4f6, #000);box-shadow:20px 0 50px rgba(0,0,0,0.6);z-index:2;display:flex;flex-direction:column;justify-content:center;padding:0 ${scaleX(80)}px;box-sizing:border-box;"><div style="font-size:${scaleMin(24)}px;color:#111827;letter-spacing:6px;text-transform:uppercase;margin-bottom:${scaleY(20)}px;font-weight:700;">Minimal Tasarim</div><div style="font-size:${scaleMin(72)}px;color:#111827;font-weight:900;line-height:1.1;margin-bottom:${scaleY(40)}px;text-shadow:0 4px 15px rgba(0,0,0,0.3);"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(48)}px;color:#111827;font-family:Roboto,sans-serif;font-weight:800;background:rgba(0,0,0,0.3);padding:${scaleY(15)}px ${scaleX(25)}px;border-left:5px solid #111827;border-radius:0 12px 12px 0;width:fit-content;margin-bottom:${scaleY(60)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(22)}px;color:#374151;line-height:1.6;margin-bottom:${scaleY(60)}px;background:rgba(255,255,255,0.05);padding:${scaleY(20)}px;border-radius:12px;backdrop-"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div><div style="font-size:${scaleMin(28)}px;color:#4b5563;letter-spacing:2px;font-weight:600;margin-top:auto;padding-bottom:${scaleY(50)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div></div>`;
    }
    else if (id === 'canvaM2') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#000;font-family:Inter,sans-serif;"><div class="photo-panel" style="width:${fullW}px;height:${fullH}px;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.2);"></div><div style="position:absolute;left:50%;top:50%;transform:translate(-50%, -50%);width:${scaleX(1300)}px;height:${scaleY(700)}px;background:linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02));backdrop-border:1px solid rgba(255,255,255,0.2);border-radius:40px;box-shadow:0 30px 80px rgba(0,0,0,0.6);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:${scaleY(60)}px;box-sizing:border-box;"><div style="background:#111827;color:#fff;padding:${scaleY(10)}px ${scaleX(30)}px;border-radius:30px;font-weight:800;letter-spacing:4px;font-size:${scaleMin(20)}px;margin-bottom:${scaleY(40)}px;">PREMIUM</div><div style="font-size:${scaleMin(80)}px;color:#fff;font-weight:900;line-height:1.2;text-shadow:0 10px 30px rgba(0,0,0,0.5);margin-bottom:${scaleY(30)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(56)}px;color:#111827;font-weight:800;text-shadow:0 5px 15px rgba(0,0,0,0.4);margin-bottom:${scaleY(50)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(24)}px;color:#e2e8f0;line-height:1.8;max-width:80%;font-weight:500;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(40)}px;width:100%;text-align:center;font-size:${scaleMin(22)}px;color:#fff;letter-spacing:3px;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaM3') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#f3f4f6;font-family:Inter,sans-serif;box-sizing:border-box;border:${scaleX(30)}px solid #f3f4f6;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;left:${scaleX(30)}px;top:${scaleY(30)}px;right:${scaleX(30)}px;bottom:${scaleY(30)}px;border:2px solid #111827;pointer-events:none;z-index:10;"></div><div style="position:absolute;top:0;left:0;width:100%;height:${scaleY(350)}px;"></div><div style="position:absolute;top:${scaleY(80)}px;left:${scaleX(80)}px;z-index:5;"><div style="font-size:${scaleMin(64)}px;color:#fff;font-weight:900;text-shadow:0 4px 20px rgba(0,0,0,0.8);margin-bottom:${scaleY(10)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(40)}px;color:#111827;font-weight:700;text-shadow:0 2px 10px rgba(0,0,0,0.8);"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(80)}px;right:${scaleX(80)}px;z-index:5;text-align:right;"><div style="font-size:${scaleMin(24)}px;color:#fff;font-weight:600;text-shadow:0 4px 15px rgba(0,0,0,0.8);background:rgba(0,0,0,0.6);padding:${scaleY(20)}px ${scaleX(30)}px;border-radius:16px;border:1px solid #111827;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaM4') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#000;font-family:Inter,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;left:0;top:0;width:100%;height:100%;background:#f3f4f6;clip-path:polygon(0 0, 55% 0, 35% 100%, 0% 100%);z-index:2;box-shadow:20px 0 50px rgba(0,0,0,0.8);"></div><div style="position:absolute;left:0;top:0;width:100%;height:100%;background:#111827;clip-path:polygon(55% 0, 56% 0, 36% 100%, 35% 100%);z-index:3;"></div><div style="position:absolute;left:${scaleX(80)}px;top:${scaleY(150)}px;z-index:5;width:${scaleX(600)}px;"><div style="font-size:${scaleMin(72)}px;color:#111827;font-weight:900;line-height:1.1;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(48)}px;color:#111827;font-weight:800;background:rgba(0,0,0,0.2);padding:${scaleY(10)}px ${scaleX(20)}px;border-radius:8px;display:inline-block;margin-bottom:${scaleY(60)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(24)}px;color:#374151;line-height:1.6;font-weight:600;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaM5') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#f3f4f6;font-family:Inter,sans-serif;"><div class="photo-panel" style="width:100%;height:${scaleY(650)}px;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;left:0;top:${scaleY(650)}px;width:100%;height:${scaleY(430)}px;background:linear-gradient(to right, #f3f4f6, #000);z-index:2;display:flex;align-items:center;padding:0 ${scaleX(80)}px;justify-content:space-between;box-sizing:border-box;"><div style="width:${scaleX(900)}px;"><div style="font-size:${scaleMin(64)}px;color:#111827;font-weight:900;margin-bottom:${scaleY(20)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(22)}px;color:#374151;line-height:1.8;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="width:${scaleX(500)}px;background:#111827;padding:${scaleY(40)}px;border-radius:24px;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.5);transform:translateY(-${scaleY(80)}px);box-sizing:border-box;"><div style="font-size:${scaleMin(20)}px;color:#fff;font-weight:800;letter-spacing:2px;margin-bottom:${scaleY(10)}px;">SATILIK</div><div style="font-size:${scaleMin(48)}px;color:#fff;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaM6') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#000;font-family:Inter,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};"></div><div style="position:absolute;top:${scaleY(80)}px;left:${scaleX(80)}px;background:rgba(255,255,255,0.9);backdrop-padding:${scaleY(40)}px ${scaleX(60)}px;border-radius:24px;box-shadow:0 30px 60px rgba(0,0,0,0.4);max-width:${scaleX(800)}px;border-left:8px solid #111827;box-sizing:border-box;"><div style="font-size:${scaleMin(56)}px;color:#000;font-weight:900;line-height:1.2;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div></div><div style="position:absolute;bottom:${scaleY(80)}px;left:${scaleX(80)}px;background:#f3f4f6;padding:${scaleY(30)}px ${scaleX(50)}px;border-radius:20px;box-shadow:0 20px 40px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.1);box-sizing:border-box;"><div style="font-size:${scaleMin(40)}px;color:#111827;font-weight:800;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(80)}px;right:${scaleX(80)}px;background:rgba(0,0,0,0.7);backdrop-padding:${scaleY(40)}px;border-radius:24px;box-shadow:0 20px 40px rgba(0,0,0,0.5);border:1px solid #111827;width:${scaleX(500)}px;box-sizing:border-box;"><div style="font-size:${scaleMin(22)}px;color:#fff;line-height:1.8;font-weight:500;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaM7') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#050505;font-family:Inter,sans-serif;"><div style="position:absolute;left:50%;top:50%;transform:translate(-50%, -50%);width:${scaleX(1000)}px;height:${scaleX(1000)}px;background:#f3f4f6;border-radius:50%;"></div><div class="photo-panel" style="width:${scaleX(1600)}px;height:${scaleY(650)}px;position:absolute;left:${scaleX(160)}px;top:${scaleY(160)}px;${bgPos};border-radius:32px;box-shadow:0 0 100px #f3f4f640;border:2px solid rgba(255,255,255,0.1);"></div><div style="position:absolute;top:${scaleY(80)}px;width:100%;text-align:center;"><div style="font-size:${scaleMin(64)}px;color:#fff;font-weight:900;letter-spacing:4px;text-shadow:0 0 20px #111827;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div></div><div style="position:absolute;bottom:${scaleY(80)}px;width:100%;display:flex;justify-content:space-around;align-items:center;padding:0 ${scaleX(160)}px;box-sizing:border-box;"><div style="font-size:${scaleMin(48)}px;color:#111827;font-weight:900;text-shadow:0 0 30px #111827;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(20)}px;color:#fff;background:rgba(255,255,255,0.1);padding:${scaleY(15)}px ${scaleX(30)}px;border-radius:100px;backdrop-border:1px solid #111827;box-sizing:border-box;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaM8') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#ffffff;font-family:Inter,sans-serif;"><div class="photo-panel" style="width:${scaleX(1320)}px;height:${scaleY(920)}px;position:absolute;right:${scaleX(40)}px;top:${scaleY(40)}px;${bgPos};border-radius:12px;"></div><div style="position:absolute;left:${scaleX(40)}px;top:${scaleY(40)}px;width:${scaleX(480)}px;height:${scaleY(920)}px;background:#f3f4f6;border-radius:12px;padding:${scaleY(60)}px ${scaleX(40)}px;display:flex;flex-direction:column;box-sizing:border-box;"><div style="width:40px;height:4px;background:#111827;margin-bottom:${scaleY(40)}px;"></div><div style="font-size:${scaleMin(48)}px;color:#111827;font-weight:900;line-height:1.2;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(36)}px;color:#111827;font-weight:700;margin-bottom:${scaleY(60)}px;padding-bottom:${scaleY(20)}px;border-bottom:1px solid rgba(255,255,255,0.2);"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(28)}px;color:#374151;line-height:2;font-weight:500;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div><div style="margin-top:auto;font-size:${scaleMin(14)}px;color:#4b5563;letter-spacing:2px;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div></div>`;
    }
    else if (id === 'canvaM9') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#000;font-family:Inter,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};"></div><div style="position:absolute;top:0;left:0;width:100%;height:100%;"></div><div style="position:absolute;top:${scaleY(60)}px;width:100%;text-align:center;"><div style="font-size:${scaleMin(140)}px;color:#111827;font-family:Roboto,serif;font-weight:400;text-transform:uppercase;letter-spacing:10px;line-height:1;text-shadow:0 10px 40px rgba(0,0,0,0.8);"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div></div><div style="position:absolute;bottom:${scaleY(80)}px;left:${scaleX(80)}px;"><div style="font-size:${scaleMin(64)}px;color:#fff;font-weight:900;text-shadow:0 5px 20px rgba(0,0,0,0.8);"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(80)}px;right:${scaleX(80)}px;text-align:right;width:${scaleX(600)}px;"><div style="font-size:${scaleMin(20)}px;color:#d1d5db;line-height:2;text-shadow:0 2px 10px rgba(0,0,0,0.8);border-right:4px solid #111827;padding-right:${scaleX(20)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaM10') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#f3f4f6;font-family:Inter,sans-serif;"><div style="position:absolute;left:${scaleX(60)}px;top:${scaleY(60)}px;right:${scaleX(60)}px;bottom:${scaleY(60)}px;border:1px solid #111827;pointer-events:none;z-index:1;"></div><div style="position:absolute;left:${scaleX(80)}px;top:${scaleY(80)}px;right:${scaleX(80)}px;bottom:${scaleY(80)}px;border:1px dashed #111827;pointer-events:none;z-index:1;"></div><div class="photo-panel" style="width:${scaleX(1000)}px;height:${scaleY(600)}px;position:absolute;right:${scaleX(120)}px;top:${scaleY(240)}px;${bgPos};border:4px solid #fff;box-shadow:0 30px 60px rgba(0,0,0,0.4);"></div><div style="position:absolute;left:${scaleX(120)}px;top:${scaleY(240)}px;width:${scaleX(600)}px;z-index:5;"><div style="background:#111827;color:#fff;font-size:${scaleMin(16)}px;font-weight:800;display:inline-block;padding:${scaleY(5)}px ${scaleX(15)}px;margin-bottom:${scaleY(20)}px;">NO. 01</div><div style="font-size:${scaleMin(72)}px;color:#111827;font-weight:900;line-height:1;margin-bottom:${scaleY(40)}px;text-transform:uppercase;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(40)}px;color:#111827;font-weight:700;margin-bottom:${scaleY(60)}px;border-bottom:2px solid #111827;padding-bottom:${scaleY(20)}px;display:inline-block;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(20)}px;color:#374151;line-height:2;font-weight:500;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;right:${scaleX(120)}px;bottom:${scaleY(120)}px;font-size:${scaleMin(16)}px;color:#4b5563;font-family:monospace;">PROJECT DETAILS // <span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    
    // Convert inline text blocks to Draggable overlays
    canvaRenderLayer.querySelectorAll('.photo-panel').forEach(el => enablePhotoDrag(el));
        canvaRenderLayer.querySelectorAll('.editable-text').forEach(el => enableInlineEdit(el));
    requestAnimationFrame(() => {
        if(typeof redrawAll === 'function') redrawAll();
    });
}

// Start
setTimeout(_minimalInit, 200);
