/* ============================================================
   Klasik Şablon Seti - V3 (UNIQUE PRO)
============================================================ */

function _klasikInit(){
    const container = document.getElementById('tpl-content-klasik');
    if(!container) {
        setTimeout(_klasikInit, 500);
        return;
    }
    container.innerHTML = `
        <div class="section-title" style="margin-top:0">&#10024; H&#305;zl&#305; Metin D&#252;zenleyici</div>
        <div class="input-group"><label>Ana Ba&#351;l&#305;k (Title)</label><input type="text" id="canvaCTitle" value="SATILIK M&#220;STAK&#304;L EV"></div>
        <div class="input-group"><label>Fiyat</label><input type="text" id="canvaCPrice" value="12.500.000 TL"></div>
        <div class="input-group"><label>&#304;leti&#351;im</label><input type="text" id="canvaCContact" value="EMLAK STUDYOM | 0532 000 0000"></div>
        <div class="input-group"><label>&#214;zellikler (Alt alta)</label><textarea id="canvaCFeats" rows="4">Yeni Yap&#305;\nL&#252;ks Donan&#305;m\nMerkezi Konum</textarea></div>
        
        
        `;

    ['canvaCTitle','canvaCPrice','canvaCContact','canvaCFeats'].forEach(id=>{
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', () => { if(isCanvaMode) renderCTemplate(activeCanvaId) });
    });
    buildCCards();
}

function buildCCards(){
    let grid = document.getElementById('canvaTplGridC');
    if(!grid) {
        grid = document.createElement('div');
        grid.className = 'canva-tpl-grid';
        grid.id = 'canvaTplGridC';
        const cont = document.getElementById('tpl-content-klasik'); if(cont) cont.insertBefore(grid, cont.firstChild);
    }
    grid.innerHTML = '';
    if(typeof KLASIK_CARDS !== 'undefined') {
        KLASIK_CARDS.forEach((c, idx) => {
            const card = document.createElement('div');
            card.className = 'canva-tpl-card';
            card.dataset.id = c.id;
            const tBg = 'linear-gradient(135deg, '+c.bg1+', '+c.bg2+')';
            card.innerHTML = '<div class="tpl-preview" style="display:flex;gap:0;border-radius:4px;overflow:hidden;background:'+tBg+'"><div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px;padding:4px;background:rgba(0,0,0,0.3)"><div style="font-size:13px;font-weight:900;color:'+c.accent+'">PRO</div><div style="font-size:10px;color:#fff">YEN&#304; KALIP '+(idx+1)+'</div></div></div>';
            card.onclick = () => {
                if(card.classList.contains('active')) return;
                document.querySelectorAll('#canvaTplGridC .canva-tpl-card').forEach(x => x.classList.remove('active'));
                card.classList.add('active');
                activeCanvaId = c.id;
                renderCTemplate(c.id);
            };
            grid.appendChild(card);
        });
    }
}

function renderCTemplate(id){
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

    const title = $('canvaCTitle').value.toUpperCase();
    const price = $('canvaCPrice').value;
    const contact = $('canvaCContact').value;
    const featsArr = $('canvaCFeats').value.split('\n').filter(x => x.trim().length > 0);
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


    if (id === 'canvaC1') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#450a0a;font-family:Cinzel,serif;"><div class="photo-panel" style="width:${scaleX(1600)}px;height:${scaleY(700)}px;position:absolute;left:${scaleX(160)}px;top:${scaleY(160)}px;${bgPos};border:8px double #fef3c7;"></div><div style="position:absolute;top:${scaleY(40)}px;width:100%;text-align:center;"><div style="font-size:${scaleMin(65)}px;color:#fef3c7;font-weight:700;letter-spacing:10px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div></div><div style="position:absolute;bottom:${scaleY(140)}px;width:100%;text-align:center;z-index:10;"><div style="font-size:${scaleMin(70)}px;color:#fef3c7;font-weight:800;text-shadow:0 3px 10px rgba(0,0,0,0.8);"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(40)}px;right:${scaleX(160)}px;text-align:right;display:flex;flex-direction:column;align-items:flex-end;"><div style="font-size:${scaleMin(28)}px;color:#fff;font-family:Lora,serif;letter-spacing:1px;line-height:1.4;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(40)}px;left:${scaleX(160)}px;text-align:left;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:600;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div>
</div>`;
    }
    else if (id === 'canvaC2') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#1a1a1a;font-family:Cinzel,serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};"></div><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${scaleX(700)}px;height:${scaleX(700)}px;background:#450a0a;border-radius:50%;border:15px double #fef3c7;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:${scaleX(50)}px;box-sizing:border-box;box-shadow:0 30px 60px rgba(0,0,0,0.6);"><div style="font-size:${scaleMin(39)}px;color:#fef3c7;letter-spacing:4px;margin-bottom:${scaleY(20)}px;">PRESTİJLİ MÜLK</div><div style="font-size:${scaleMin(85)}px;color:#fff;font-weight:900;line-height:1.2;margin-bottom:${scaleY(30)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(62)}px;color:#fef3c7;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(60)}px;right:${scaleX(80)}px;text-align:right;font-size:${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:2px;z-index:20;text-shadow:0 2px 5px rgba(0,0,0,0.8);"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaC3') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#fff;font-family:Cinzel,serif;"><div class="photo-panel" style="width:${scaleX(1200)}px;height:100%;position:absolute;right:0;top:0;${bgPos}"></div><div style="position:absolute;left:0;top:0;width:${scaleX(720)}px;height:100%;background:#450a0a;border-right:10px solid #fef3c7;padding:${scaleY(100)}px ${scaleX(80)}px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;"><div style="font-size:${scaleMin(97)}px;color:#fef3c7;font-weight:900;line-height:1.1;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(76)}px;color:#fff;border-bottom:2px solid #fef3c7;padding-bottom:${scaleY(20)}px;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(42)}px;color:#eee;font-family:Lora,serif;line-height:1.6;font-weight:700;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(60)}px;left:${scaleX(80)}px;text-align:left;font-size:${scaleMin(26)}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:2px;z-index:20;text-shadow:0 2px 5px rgba(0,0,0,0.8);"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaC4') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#450a0a;font-family:Cinzel,serif;padding:${scaleY(40)}px;box-sizing:border-box;"><div style="width:100%;height:100%;border:4px solid #fef3c7;position:relative;box-sizing:border-box;"><div class="photo-panel" style="width:${scaleX(1000)}px;height:${scaleY(600)}px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);${bgPos};border:2px solid #fef3c7;"></div><div style="position:absolute;top:${scaleY(60)}px;width:100%;text-align:center;font-size:${scaleMin(103)}px;color:#fef3c7;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="position:absolute;bottom:${scaleY(60)}px;width:100%;text-align:center;font-size:${scaleMin(76)}px;color:#fff;font-family:Lora,serif;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(60)}px;right:${scaleX(80)}px;text-align:right;font-size:${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:2px;z-index:20;text-shadow:0 2px 5px rgba(0,0,0,0.8);"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaC5') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#222;font-family:Cinzel,serif;"><div class="photo-panel" style="width:100%;height:${scaleY(540)}px;position:absolute;left:0;top:0;${bgPos};border-bottom:10px solid #fef3c7;"></div><div style="position:absolute;left:0;top:${scaleY(550)}px;width:100%;height:${scaleY(530)}px;background:#450a0a;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;"><div style="font-size:${scaleMin(110)}px;color:#fff;margin-bottom:${scaleY(20)}px;letter-spacing:5px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(70)}px;color:#fef3c7;font-family:Lora,serif;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(40)}px;left:${scaleX(80)}px;text-align:left;display:flex;flex-direction:column;justify-content:flex-end;"><div style="font-size:${scaleMin(30)}px;color:#ddd;font-family:Lora,serif;letter-spacing:2px;line-height:1.4;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(40)}px;right:${scaleX(80)}px;text-align:right;font-size:${scaleMin(30)}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:2px;z-index:20;text-shadow:0 2px 5px rgba(0,0,0,0.8);"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div>
</div>`;
    }
    else if (id === 'canvaC6') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#111;font-family:Cinzel,serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};"></div><div style="position:absolute;left:0;top:${scaleY(200)}px;width:100%;background:rgba(69, 10, 10, 0.9);border-top:4px solid #fef3c7;border-bottom:4px solid #fef3c7;padding:${scaleY(60)}px 0;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.8);"><div style="font-size:${scaleMin(110)}px;color:#fef3c7;font-weight:900;margin-bottom:${scaleY(15)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(62)}px;color:#fff;font-family:Lora,serif;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(60)}px;right:${scaleX(80)}px;text-align:right;font-size:${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:2px;z-index:20;text-shadow:0 2px 5px rgba(0,0,0,0.8);"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaC7') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#450a0a;font-family:Cinzel,serif;"><div class="photo-panel" style="width:${scaleX(1400)}px;height:${scaleY(800)}px;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);${bgPos};border:1px solid #fef3c7;"></div><div style="position:absolute;left:${scaleX(80)}px;top:${scaleY(80)}px;width:${scaleX(150)}px;height:${scaleX(150)}px;border-top:10px solid #fef3c7;border-left:10px solid #fef3c7;"></div><div style="position:absolute;right:${scaleX(80)}px;bottom:${scaleY(80)}px;width:${scaleX(150)}px;height:${scaleX(150)}px;border-bottom:10px solid #fef3c7;border-right:10px solid #fef3c7;"></div><div style="position:absolute;bottom:${scaleY(140)}px;left:50%;transform:translateX(-50%);background:#450a0a;padding:${scaleY(20)}px ${scaleX(60)}px;border:2px solid #fef3c7;text-align:center;"><div style="font-size:${scaleMin(85)}px;color:#fff;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(57)}px;color:#fef3c7;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(60)}px;left:${scaleX(80)}px;text-align:left;font-size:${scaleMin(30)}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:2px;z-index:20;text-shadow:0 2px 5px rgba(0,0,0,0.8);"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaC8') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#efece6;font-family:Cinzel,serif;"><div style="position:absolute;right:${scaleX(70)}px;top:${scaleY(70)}px;width:${scaleX(1000)}px;height:${scaleY(850)}px;border:2px solid #450a0a;pointer-events:none;"></div><div class="photo-panel" style="width:${scaleX(1000)}px;height:${scaleY(850)}px;position:absolute;right:${scaleX(100)}px;top:${scaleY(100)}px;${bgPos};box-shadow:15px 15px 50px rgba(0,0,0,0.2);"></div><div style="position:absolute;left:${scaleX(100)}px;top:${scaleY(200)}px;width:${scaleX(600)}px;"><div style="font-size:${scaleMin(118)}px;color:#450a0a;font-weight:900;line-height:1;margin-bottom:${scaleY(30)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(76)}px;color:#555;font-family:Lora,serif;margin-bottom:${scaleY(50)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(39)}px;color:#333;font-family:Lora,serif;line-height:1.6;font-weight:700;border-left:4px solid #450a0a;padding-left:${scaleX(20)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(60)}px;left:${scaleX(80)}px;text-align:left;font-size:${scaleMin(26)}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:2px;z-index:20;text-shadow:0 2px 5px rgba(0,0,0,0.8);"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaC9') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#450a0a;font-family:Cinzel,serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};"></div><div style="position:absolute;left:${scaleX(100)}px;top:${scaleY(100)}px;right:${scaleX(100)}px;bottom:${scaleY(100)}px;background:rgba(255,255,255,0.95);border:6px double #450a0a;padding:${scaleY(80)}px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;"><div style="font-size:${scaleMin(124)}px;color:#450a0a;font-weight:900;margin-bottom:${scaleY(20)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="width:${scaleX(200)}px;height:2px;background:#450a0a;margin-bottom:${scaleY(30)}px;"></div><div style="font-size:${scaleMin(85)}px;color:#444;font-family:Lora,serif;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(42)}px;color:#666;font-family:Lora,serif;line-height:1.6;font-weight:700;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(40)}px;right:${scaleX(80)}px;text-align:right;font-size:${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:2px;z-index:20;text-shadow:0 2px 5px rgba(0,0,0,0.8);"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaC10') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#2c1b18;font-family:Cinzel,serif;"><div class="photo-panel" style="width:${scaleX(1600)}px;height:${scaleY(650)}px;position:absolute;left:${scaleX(160)}px;top:${scaleY(100)}px;${bgPos};border:10px solid #efece6;"></div><div style="position:absolute;left:0;width:100%;bottom:${scaleY(220)}px;text-align:center;"><div style="font-size:${scaleMin(70)}px;color:#fff;font-family:Lora,serif;font-weight:800;text-shadow:0 3px 10px rgba(0,0,0,0.8);"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;left:${scaleX(160)}px;bottom:${scaleY(120)}px;white-space:nowrap;"><div style="font-size:${scaleMin(65)}px;color:#fef3c7;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div></div><div style="position:absolute;left:${scaleX(160)}px;bottom:${scaleY(50)}px;font-size:${scaleMin(28)}px;color:#ccc;font-family:sans-serif;letter-spacing:2px;text-shadow:0 2px 5px rgba(0,0,0,0.8);"><span class="editable-text" style="display:inline-block;min-width:50px;">${contact}</span></div><div style="position:absolute;right:${scaleX(160)}px;bottom:${scaleY(50)}px;text-align:right;display:flex;flex-direction:column;align-items:flex-end;"><div style="font-size:${scaleMin(26)}px;color:#fff;font-family:Lora,serif;letter-spacing:1px;line-height:1.4;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div>
</div>`;
    }
    canvaRenderLayer.querySelectorAll('.photo-panel').forEach(el => enablePhotoDrag(el));
        canvaRenderLayer.querySelectorAll('.editable-text').forEach(el => enableInlineEdit(el));
    requestAnimationFrame(() => {
        if(typeof redrawAll === 'function') redrawAll();
    });
}
setTimeout(_klasikInit, 200);


