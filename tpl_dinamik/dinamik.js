/* ============================================================
   Dinamik Şablon Seti - V3 (UNIQUE PRO)
============================================================ */

function _dinamikInit(){
    const container = document.getElementById('tpl-content-dinamik');
    if(!container) {
        setTimeout(_dinamikInit, 500);
        return;
    }
    container.innerHTML = `
        <div class="section-title" style="margin-top:0">&#10024; H&#305;zl&#305; Metin D&#252;zenleyici</div>
        <div class="input-group"><label>Ana Ba&#351;l&#305;k (Title)</label><input type="text" id="canvaDTitle" value="SATILIK M&#220;STAK&#304;L EV"></div>
        <div class="input-group"><label>Fiyat</label><input type="text" id="canvaDPrice" value="12.500.000 TL"></div>
        <div class="input-group"><label>&#304;leti&#351;im</label><input type="text" id="canvaDContact" value="EMLAK STUDYOM | 0532 000 0000"></div>
        <div class="input-group"><label>&#214;zellikler (Alt alta)</label><textarea id="canvaDFeats" rows="4">Yeni Yap&#305;\nL&#252;ks Donan&#305;m\nMerkezi Konum</textarea></div>
        
        
        `;

    ['canvaDTitle','canvaDPrice','canvaDContact','canvaDFeats'].forEach(id=>{
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', () => { if(isCanvaMode) renderDTemplate(activeCanvaId) });
    });
    buildDCards();
}

function buildDCards(){
    let grid = document.getElementById('canvaTplGridD');
    if(!grid) {
        grid = document.createElement('div');
        grid.className = 'canva-tpl-grid';
        grid.id = 'canvaTplGridD';
        const cont = document.getElementById('tpl-content-dinamik'); if(cont) cont.insertBefore(grid, cont.firstChild);
    }
    grid.innerHTML = '';
    if(typeof DINAMIK_CARDS !== 'undefined') {
        DINAMIK_CARDS.forEach((c, idx) => {
            const card = document.createElement('div');
            card.className = 'canva-tpl-card';
            card.dataset.id = c.id;
            const tBg = 'linear-gradient(135deg, '+c.bg1+', '+c.bg2+')';
            card.innerHTML = '<div class="tpl-preview" style="display:flex;gap:0;border-radius:4px;overflow:hidden;background:'+tBg+'"><div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px;padding:4px;background:rgba(0,0,0,0.3)"><div style="font-size:13px;font-weight:900;color:'+c.accent+'">PRO</div><div style="font-size:10px;color:#fff">YEN&#304; KALIP '+(idx+1)+'</div></div></div>';
            card.onclick = () => {
                if(card.classList.contains('active')) return;
                document.querySelectorAll('#canvaTplGridD .canva-tpl-card').forEach(x => x.classList.remove('active'));
                card.classList.add('active');
                activeCanvaId = c.id;
                renderDTemplate(c.id);
            };
            grid.appendChild(card);
        });
    }
}

function renderDTemplate(id){
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

    const title = $('canvaDTitle').value.toUpperCase();
    const price = $('canvaDPrice').value;
    const contact = $('canvaDContact').value;
    const featsArr = $('canvaDFeats').value.split('\n').filter(x => x.trim().length > 0);
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


    if (id === 'canvaD1') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#4c1d95;font-family:Poppins,sans-serif;">    <div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};clip-path:polygon(0 0, 100% 0, 100% 75%, 0 100%);"></div>    <div style="position:absolute;bottom:0;left:0;width:100%;height:${scaleY(350)}px;background:#4c1d95;z-index:1;"></div>        <!-- Title & Price (Pulled Down - anchored to bottom:80px to make room for contact at 20px) -->    <div style="position:absolute;bottom:${scaleY(80)}px;left:${scaleX(80)}px;z-index:2;">        <div style="font-size:${scaleMin(83)}px;color:#fff;font-weight:900;text-transform:uppercase;font-style:italic;line-height:0.9;">            <span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span>        </div>        <div style="margin-top:${scaleY(20)}px;">            <div style="display:inline-block;background:#fbbf24;color:#000;padding:${scaleY(10)}px ${scaleX(30)}px;font-size:${scaleMin(57)}px;font-weight:900;transform:skew(-15deg);">                <div style="transform:skew(15deg);">                    <span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span>                </div>            </div>        </div>    </div>    <!-- Features on the Right -->    <div style="position:absolute;bottom:${scaleY(80)}px;right:${scaleX(80)}px;z-index:2;text-align:right;">        <div style="font-size:${scaleMin(35)}px;color:#ccc;font-family:Nunito,sans-serif;line-height:1.6;">            <span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span>        </div>    </div>    <!-- Contact at bottom left -->    <div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:1px;z-index:20;">        <span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span>    </div></div>`;
    }
    else if (id === 'canvaD2') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#111;font-family:Poppins,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};"></div><div style="position:absolute;left:0;top:0;width:${scaleX(800)}px;height:100%;background:linear-gradient(90deg, #4c1d95, transparent);z-index:2;"></div><div style="position:absolute;left:${scaleX(100)}px;top:50%;transform:translateY(-50%);z-index:3;"><div style="font-size:${scaleMin(104)}px;color:#fbbf24;font-weight:900;line-height:1;text-shadow:0 0 20px #fbbf24;margin-bottom:${scaleY(20)}px;font-style:italic;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(53)}px;color:#fff;font-weight:900;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(32)}px;color:#ddd;font-family:Nunito,sans-serif;line-height:1.6;font-weight:700;border-left:4px solid #fbbf24;padding-left:${scaleX(20)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(40)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaD3') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#000;font-family:Poppins,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;right:0;top:0;width:${scaleX(950)}px;height:${scaleY(950)}px;background:#4c1d95;clip-path:polygon(100% 0, 0 0, 100% 100%);"></div><div style="position:absolute;right:0;top:0;width:${scaleX(850)}px;height:${scaleY(850)}px;background:#fbbf24;clip-path:polygon(100% 0, 0 0, 100% 100%);"></div><div style="position:absolute;right:${scaleX(40)}px;top:${scaleY(40)}px;max-width:${scaleX(650)}px;text-align:right;display:flex;flex-direction:column;align-items:flex-end;"><div style="font-size:${scaleMin(64)}px;color:#000;font-weight:900;line-height:1.1;margin-bottom:${scaleY(15)}px;font-style:italic;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(47)}px;color:#4c1d95;font-weight:900;margin-bottom:${scaleY(15)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(40)}px;color:#333;font-family:Nunito,sans-serif;line-height:1.8;font-weight:700;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaD4') {
        const d = scaleMin(1000);
        const topPos = Math.round((fullH - d) / 2);
        const rightPos = Math.round(scaleX(50));
        const borderW = Math.max(4, Math.round(scaleMin(15)));
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#4c1d95;font-family:Poppins,sans-serif;"><div class="photo-panel" style="width:${d}px;height:${d}px;border-radius:50%;position:absolute;right:${rightPos}px;top:${topPos}px;${bgPos};"></div><div style="width:${d}px;height:${d}px;border-radius:50%;position:absolute;right:${rightPos}px;top:${topPos}px;border:${borderW}px solid #fbbf24;box-sizing:border-box;pointer-events:none;z-index:2;"></div><div style="position:absolute;left:${scaleX(80)}px;top:28%;transform:translateY(-50%);width:${scaleX(850)}px;"><div style="font-size:${scaleMin(29)}px;color:#fbbf24;letter-spacing:5px;margin-bottom:${scaleY(20)}px;font-weight:900;">FIRSAT</div><div style="font-size:${scaleMin(93)}px;color:#fff;font-weight:900;line-height:1;margin-bottom:${scaleY(30)}px;font-style:italic;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(64)}px;color:#fbbf24;font-weight:900;margin-bottom:${scaleY(40)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(80)}px;left:${scaleX(80)}px;font-size:${scaleMin(35)}px;color:#ccc;font-family:Nunito,sans-serif;z-index:20;line-height:1.6;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(28)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaD5') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#fff;font-family:Poppins,sans-serif;"><div class="photo-panel" style="width:${scaleX(1400)}px;height:${scaleY(800)}px;position:absolute;left:${scaleX(100)}px;top:${scaleY(100)}px;${bgPos};box-shadow:20px 20px 0 #fbbf24, 40px 40px 0 #4c1d95;"></div><div style="position:absolute;left:${scaleX(50)}px;bottom:${scaleY(50)}px;background:#000;color:#fff;padding:${scaleY(30)}px ${scaleX(50)}px;box-shadow:15px 15px 0 #fbbf24;"><div style="font-size:${scaleMin(76)}px;font-weight:900;font-style:italic;line-height:1;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div></div><div style="position:absolute;right:${scaleX(50)}px;top:${scaleY(50)}px;background:#4c1d95;color:#fff;padding:${scaleY(20)}px ${scaleX(40)}px;box-shadow:-10px 10px 0 #fbbf24;"><div style="font-size:${scaleMin(53)}px;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(30)}px;right:${scaleX(50)}px;text-align:right;font-size:${scaleMin(35)}px;color:#000000;font-family:sans-serif;font-weight:800;letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaD6') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#4c1d95;font-family:Poppins,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};clip-path:polygon(0 0, 100% 0, 60% 100%, 0% 100%);"></div><div style="position:absolute;right:${scaleX(50)}px;bottom:${scaleY(60)}px;max-width:${scaleX(800)}px;text-align:right;display:flex;flex-direction:column;align-items:flex-end;"><div style="font-size:${scaleMin(32)}px;color:#ccc;font-family:Nunito,sans-serif;line-height:1.6;margin-bottom:${scaleY(20)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div><div style="font-size:${scaleMin(57)}px;color:#fff;font-weight:900;margin-bottom:${scaleY(15)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(60)}px;color:#fbbf24;font-weight:900;font-style:italic;line-height:1;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div></div><div style="position:absolute;bottom:${scaleY(30)}px;left:${scaleX(50)}px;text-align:left;font-size:${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div>
</div>`;
    }
    else if (id === 'canvaD7') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#222;font-family:Poppins,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};"></div><div style="position:absolute;top:${scaleY(150)}px;left:-${scaleX(50)}px;background:#fbbf24;padding:${scaleY(20)}px ${scaleX(100)}px;transform:rotate(-5deg);box-shadow:0 20px 40px rgba(0,0,0,0.5);"><div style="font-size:${scaleMin(76)}px;color:#000;font-weight:900;font-style:italic;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div></div><div style="position:absolute;top:${scaleY(350)}px;left:${scaleX(50)}px;background:#4c1d95;padding:${scaleY(15)}px ${scaleX(80)}px;transform:rotate(3deg);box-shadow:0 20px 40px rgba(0,0,0,0.5);"><div style="font-size:${scaleMin(57)}px;color:#fff;font-weight:900;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(100)}px;right:${scaleX(100)}px;background:rgba(76, 29, 149, 0.95);padding:${scaleY(40)}px;border-radius:20px;border-bottom:5px solid #fbbf24;"><div style="font-size:${scaleMin(29)}px;color:#fff;font-family:Nunito,sans-serif;line-height:1.8;font-weight:700;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(40)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaD8') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#4c1d95;font-family:Poppins,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos}"></div><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${scaleX(1200)}px;height:${scaleY(500)}px;background:rgba(76, 29, 149, 0.85);border:4px solid #fbbf24;backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;transform:translate(-50%,-50%) skew(-10deg);"><div style="transform:skew(10deg);"><div style="font-size:${scaleMin(89)}px;color:#fff;font-weight:900;font-style:italic;line-height:1;margin-bottom:${scaleY(20)}px;text-shadow:0 10px 20px rgba(0,0,0,0.8);"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(64)}px;color:#fbbf24;font-weight:900;margin-bottom:${scaleY(30)}px;text-shadow:0 5px 10px rgba(0,0,0,0.8);"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(40)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaD9') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#000;font-family:Poppins,sans-serif;"><div style="position:absolute;left:0;top:0;width:50%;height:100%;background:#4c1d95;padding:${scaleY(100)}px;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;"><div style="font-size:${scaleMin(73)}px;color:#fbbf24;font-weight:900;line-height:1.1;margin-bottom:${scaleY(30)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(57)}px;color:#fff;font-weight:900;margin-bottom:${scaleY(50)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div><div style="font-size:${scaleMin(32)}px;color:#ccc;font-family:Nunito,sans-serif;line-height:1.8;font-weight:700;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:pre-wrap;">${feats}</span></div></div><div class="photo-panel" style="width:50%;height:100%;position:absolute;right:0;top:0;${bgPos};clip-path:polygon(10% 0, 100% 0, 100% 100%, 0 100%);"></div><div style="position:absolute;bottom:${scaleY(40)}px;left:${scaleX(100)}px;text-align:left;font-size:${scaleMin(35)}px;color:#ffffff;font-family:sans-serif;font-weight:800;letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div>`;
    }
    else if (id === 'canvaD10') {
        canvaRenderLayer.innerHTML = `<div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#000;font-family:Poppins,sans-serif;"><div class="photo-panel" style="width:100%;height:100%;position:absolute;left:0;top:0;${bgPos};"></div><div style="position:absolute;bottom:0;left:0;width:100%;height:${scaleY(450)}px;background:#4c1d95;clip-path:polygon(0 30%, 100% 0, 100% 100%, 0 100%);z-index:1;"></div><div style="position:absolute;bottom:0;left:0;width:100%;height:${scaleY(460)}px;background:#fbbf24;clip-path:polygon(0 28%, 100% -2%, 100% 100%, 0 100%);z-index:0;"></div><div style="position:absolute;bottom:${scaleY(80)}px;left:${scaleX(80)}px;z-index:5;width:100%;"><div style="font-size:${scaleMin(104)}px;color:#fff;font-weight:900;text-transform:uppercase;font-style:italic;line-height:0.9;text-shadow:0 4px 15px rgba(0,0,0,0.9);"><span class="editable-text" style="display:inline-block;min-width:50px;">${title}</span></div><div style="font-size:${scaleMin(64)}px;color:#4c1d95;font-weight:900;text-shadow:0 2px 5px rgba(255,255,255,0.5);margin-top:${scaleY(20)}px;"><span class="editable-text" style="display:inline-block;min-width:50px;">${price}</span></div></div><div style="position:absolute;bottom:${scaleY(20)}px;left:0;width:100%;text-align:center;font-size:${scaleMin(40)}px;color:#ffffff;font-family:sans-serif;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,0.8);letter-spacing:2px;z-index:20;"><span class="editable-text" style="display:inline-block;min-width:50px;white-space:nowrap;">${contact}</span></div></div>`;
    }
    canvaRenderLayer.querySelectorAll('.photo-panel').forEach(el => enablePhotoDrag(el));
        canvaRenderLayer.querySelectorAll('.editable-text').forEach(el => enableInlineEdit(el));
    requestAnimationFrame(() => {
        if(typeof redrawAll === 'function') redrawAll();
    });
}
setTimeout(_dinamikInit, 200);


