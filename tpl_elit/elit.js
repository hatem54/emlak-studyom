/* ============================================================
   canva.js "” v14.3
   ✅ Çoklu format desteği
   ✅ Fotoğraflar tuval dışına taşmaz (cover mode)
   ✅ Beyaz/renkli paneller fotoğrafı kesin gizler (z-index düzeltmesi)
============================================================ */

// ========== YARDIMCI: Mevcut canvas boyutunu al ==========
function getCanvasSize(){
    return {
        w: parseInt(canvasEl.style.width) || 1920,
        h: parseInt(canvasEl.style.height) || 1080
    };
}

// ========== YARDIMCI: Referans 1920x1080'e göre koordinat ölçekle ==========
function scaleX(v){ return (v / 1920) * getCanvasSize().w; }
function scaleY(v){ return (v / 1080) * getCanvasSize().h; }
function scaleSize(v){
    const size = getCanvasSize();
    const scale = Math.min(size.w / 1920, size.h / 1080);
    return v * scale;
}

// ========== CANVA PANEL EKLEYİCİ (Ölçekli) ==========
function addCanvaPanel(left, top, width, height, bg, radius, border, shadow, extraStyle){
    const el = document.createElement('div');
    el.className = 'draggable canvas-el canva-panel';
    el.dataset.label = 'Canva Panel/Çerçeve';
    el.dataset.defaultFont = '0';
    el.dataset.rotation = '0';
    el.dataset.shadowVal = '0';
    el.dataset.blurVal = '0';
    el.dataset.storedBgHex = '#0f172a';
    el.dataset.storedBgOpacity = '85';
    el.dataset.storedBorderColor = '#38bdf8';
    el.dataset.storedBorderWidth = '0';
    el.style.position = 'absolute';
    el.style.left = scaleX(left) + 'px';
    el.style.top = scaleY(top) + 'px';
    el.style.width = scaleX(width) + 'px';
    el.style.height = scaleY(height) + 'px';
    el.style.background = bg;
    el.style.borderRadius = (radius || 0) + 'px';
    if(border) el.style.border = border;
    if(shadow) el.style.boxShadow = shadow;
    if(extraStyle) Object.keys(extraStyle).forEach(k => el.style[k] = extraStyle[k]);
    el.style.zIndex = '7';
    el.style.pointerEvents = 'auto';
    const cvrBase = document.querySelector('.cvr-base');
    if (cvrBase) cvrBase.appendChild(el);
    else uiLayer.appendChild(el);
    bindDrag(el);
    canvaOverlays.push(el);
    return el;
}

// ========== CANVA METİN EKLEYİCİ (Ölçekli) ==========
function addCanvaItem(content, left, top, fontSize, color, bg, radius, padding, width, align){
    const el = document.createElement('div');
    el.className = 'draggable canvas-el canva-generated';
    el.dataset.label = 'Canva Ögesi';
    el.dataset.defaultFont = String(fontSize);
    el.dataset.rotation = '0';
    el.dataset.shadowVal = '0';
    el.dataset.blurVal = '0';
    el.dataset.storedBgHex = bg.startsWith('#') ? bg : '#0f172a';
    el.dataset.storedBgOpacity = bg === 'transparent' ? '0' : '85';
    el.dataset.storedBorderColor = '#38bdf8';
    el.dataset.storedBorderWidth = '0';
    el.style.left = scaleX(left) + 'px';
    el.style.top = scaleY(top) + 'px';
    el.style.fontSize = scaleSize(fontSize) + 'px';
    el.style.color = color;
    if (bg === 'transparent' || bg === 'none' || bg === '') {
        // HACK: html2canvas has a nasty bug where 100% transparent elements placed over a 
        // semi-transparent parent will cause the parent background to render twice inside the child bounds!
        // We use an invisible 1% opacity color to trick html2canvas into NOT doing this punch-through.
        el.style.background = 'transparent';
    } else {
        el.style.background = bg;
    }
    el.style.borderRadius = (radius || 0) + 'px';
    el.style.padding = (padding || 0) + 'px ' + (padding ? padding * 1.4 : 0) + 'px';
    if(width) el.style.width = scaleX(width) + 'px';
    if(align) el.style.textAlign = align;
    el.style.zIndex = '20';
    el.style.fontFamily = currentFont;
    el.style.fontWeight = '700';
    el.style.lineHeight = '1.4';
    if(content.includes('<div')) el.innerHTML = content;
    else el.textContent = content;
    const cvrBase = document.querySelector('.cvr-base');
    if (cvrBase) cvrBase.appendChild(el);
    else uiLayer.appendChild(el);
    bindDrag(el);
    enableInlineEdit(el);
    canvaOverlays.push(el);
    return el;
}

function _elitInit(){
    const container = document.getElementById('tpl-content-elit');
    if(!container) {
        setTimeout(_elitInit, 500);
        return;
    }
    
    // Inject the HTML structure for Canva/Elit settings
    container.innerHTML = `
        <div class="edit-hint">💡 Yazıya/panele ÇİFT TIKLA düzenle, TEK TIKLA seç!</div>
        <button class="btn-action btn-purple" onclick="addCustomTextBox()" style="margin-bottom:8px">�• Özel Çerçeveli Kutu / Metin Ekle</button>
        <div class="canva-tpl-grid" id="canvaTplGrid"></div>
        <div id="canvaSettings" class="settings-box">
            <div class="section-title" style="margin-top:0">✏ Hızlı Metin Düzenleyici</div>
            <div class="input-group"><label>Ana Başlık</label><input type="text" id="canvaTitle" value="SATILIK MÜSTAKİL EV"></div>
            <div class="input-group"><label>Fiyat</label><input type="text" id="canvaPrice" value="6.750.000 TL"></div>
            <div class="input-group"><label>Özellikler</label><textarea id="canvaFeatures" rows="4" style="width:100%;padding:6px;background:#0f172a;border:1px solid #334155;color:#fff;border-radius:5px;font-size:11px;resize:vertical">• 4+1 Geniş Salon
• 180 m² Brüt / 155 m² Net
• Site İçi Ebeveyn Banyolu
• Serdivan AVM Karşısı</textarea></div>
            <div class="input-group"><label>İletişim</label><input type="text" id="canvaContact" value="SÜMER GAYRİMENKUL | 0532 790 74 86"></div>
        </div>
        <button class="btn-action btn-green" onclick="buildCanvaRender()">✅ Seçili Şablonu Uygula</button>
        <button class="btn-action btn-yellow" onclick="clearCanvaTemplate()" style="margin-top:3px">🔄 Şablonu Kaldır (Normal Dön)</button>
    `;
    
    // Bind inputs for live update
    ['canvaTitle','canvaPrice','canvaFeatures','canvaContact'].forEach(id=>{
        const el = document.getElementById(id);
        if(el) el.addEventListener('input',()=>{if(isCanvaMode)buildCanvaRender()});
    });

    // Once the grid container is created, generate the cards
    buildCanvaCards();
}

// ========== CANVA KART OLUŞTUR ==========
function buildCanvaCards(){
    const grid = $('canvaTplGrid');
    if(!grid) return;
    grid.innerHTML = ''; // Prevent duplicates
    CANVA_CARDS.forEach(c => {
        const card = document.createElement('div');
        card.className = 'canva-tpl-card';
        card.dataset.id = c.id;
        card.innerHTML = `<div class="tpl-preview" style="display:flex;gap:0;border-radius:4px;overflow:hidden"><div style="flex:1.2;background:${c.bg1};display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px;padding:4px"><div style="font-size:9px;font-weight:900;color:${c.accent}">SATILIK</div><div style="font-size:7px;color:${c.accent}">6.750.000 TL</div></div><div style="flex:1;background:${c.bg2}"></div><span class="tpl-tag">${c.tag}</span></div><div class="tpl-name">${c.name}</div>`;
        card.onclick = () => {
            document.querySelectorAll('.canva-tpl-card').forEach(x => x.classList.remove('active'));
            card.classList.add('active');
            activeCanvaId = c.id;
            buildCanvaRender();
        };
        grid.appendChild(card);
    });
}

// ========== CANVA RENDER (Tüm şablonlar "” cover mode) ==========
function buildCanvaRender(){
    try {
        if(!activeCanvaId){alert('Önce bir Canva Şablonu seçin!');return}
        if(typeof _kolajTemizle === 'function') _kolajTemizle();
        
        // Sadece şablonun oluşturduğu eski elementleri sil (Yazı Ekle ile eklenenlere dokunma)
        document.querySelectorAll('.canva-generated, .canva-panel').forEach(el => {
            if(el.parentNode) el.remove();
            if(typeof canvaOverlays !== 'undefined') {
                const idx = canvaOverlays.indexOf(el);
                if(idx > -1) canvaOverlays.splice(idx, 1);
            }
        });
    
        document.querySelectorAll('.normal-el').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
        isCanvaMode = true;
    
        photoLayer.style.display = 'none';
        canvaRenderLayer.style.display = 'block';
    
        const title = $('canvaTitle').value;
        const price = $('canvaPrice').value || 'FİYAT İÇİN BİZE ULAŞIN';
        const contact = $('canvaContact').value;
        const feats = $('canvaFeatures').value.split('\n').map(l => `<div style="margin-bottom:4px">${l}</div>`).join('');
        const bgImg = uploadedImgUrl ? `background-image:url('${uploadedImgUrl}')` : 'background-color:#94a3b8';
        const x = $('photoXCtrl').value, y = $('photoYCtrl').value;
        const canvasSize = getCanvasSize();
    
        // 🔴 COVER MODE 👉 fotoğraf panele tam sığar, taşmaz
        const bgPos = `${bgImg};background-size:cover;background-position:${x}% ${y}%;background-repeat:no-repeat`;
    
    // ==== ŞABLONLAR ====

    if(activeCanvaId === 'canva1'){
        const leftW = scaleX(800), photoW = scaleX(1120), fullH = canvasSize.h;
        canvaRenderLayer.innerHTML = `
            <div class="cvr-base cvr-c1" style="width:100%;height:100%;position:relative;overflow:hidden">
                <div class="photo-panel" style="width:${photoW}px;height:${fullH}px;position:absolute;right:0;top:0;${bgPos}"></div>
                <div class="left-panel" style="width:${leftW}px;height:${fullH}px;position:absolute;left:0;top:0;background:linear-gradient(180deg,#f0ebe3 0%,#e6dfd5 100%);z-index:5"></div>
            </div>`;
        addCanvaItem('LÜKS YAŞAM', 80, 80, 36, '#4a3b32', 'transparent', 0, 0);
        addCanvaItem(title, 80, 140, 85, '#2c1e15', 'transparent', 0, 0, 650);
        addCanvaItem(price, 80, 380, 54, '#b45309', 'transparent', 0, 0);
        addCanvaItem(feats, 80, 510, 28, '#4a3b32', 'transparent', 16, 0, 640);
        addCanvaItem(contact, 80, 980, 26, '#2c1e15', 'transparent', 0, 0);
    }
    else if(activeCanvaId === 'canva2'){
        const photoW = scaleX(1800), photoH = scaleY(480);
        canvaRenderLayer.innerHTML = `
            <div class="cvr-base cvr-c2" style="width:100%;height:100%;position:relative;overflow:hidden;background:#f4f4f5">
                <div class="photo-panel" style="width:${photoW}px;height:${photoH}px;position:absolute;left:${scaleX(60)}px;top:${scaleY(200)}px;border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,.15);${bgPos}"></div>
            </div>`;
        addCanvaItem(title, 60, 60, 95, '#18181b', 'transparent', 0, 0, 1800, 'center');
        addCanvaItem(price, 750, 640, 48, '#ffffff', '#f59e0b', 50, 15, 420, 'center');
        addCanvaItem(`<div style="color:#f59e0b;font-weight:900;font-size:${scaleSize(36)}px;margin-bottom:10px">MÜLK ÖZELLİKLERİ</div>` + feats, 80, 750, 30, '#3f3f46', 'transparent', 0, 0, 900);
        addCanvaItem(`<div style="font-weight:900;margin-bottom:10px">DAHA FAZLA BİLGİ İÇİN</div><div>${contact}</div>`, 1150, 770, 30, '#18181b', 'rgba(245,158,11,0.15)', 16, 20, 650, 'right');
    }
    else if(activeCanvaId === 'canva3'){
        const bluePanelW = scaleX(680), fullH = canvasSize.h;
    
    // Neon stripe köşe koordinatları (SVG polygon için)
    const stripeOffset = scaleX(30);
    const lineWidth = scaleX(14);
    const topX1 = bluePanelW - stripeOffset;
    const topX2 = topX1 + lineWidth;
    const bottomX1 = (bluePanelW * 0.80) - stripeOffset;
    const bottomX2 = bottomX1 + lineWidth; // ~8.6°
    
    canvaRenderLayer.innerHTML = `
        <div class="cvr-base cvr-c3" style="width:100%;height:100%;position:relative;overflow:hidden">
            <div class="photo-panel" style="width:100%;height:${fullH}px;position:absolute;right:0;top:0;${bgPos}"></div>
            <svg style="position:absolute;left:0;top:0;width:100%;height:${fullH}px;z-index:5;overflow:visible;pointer-events:none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="panelGrad3" x1="0" y1="0" x2="${bluePanelW}" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#0f172a"/>
                    <stop offset="100%" stop-color="#1e293b"/>
                  </linearGradient>
                </defs>
                <polygon points="0,0 ${bluePanelW},0 ${bluePanelW*0.80},${fullH} 0,${fullH}" fill="url(#panelGrad3)"/>
            </svg>
                        <svg style="position:absolute;left:0;top:0;width:100%;height:100%;z-index:6;overflow:visible;pointer-events:none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="lineGrad3" x1="0" y1="0" x2="0" y2="${fullH}" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#38bdf8"/>
                    <stop offset="100%" stop-color="#0ea5e9"/>
                  </linearGradient>
                </defs>
                <polygon points="${topX1},0 ${topX2},0 ${bottomX2},${fullH} ${bottomX1},${fullH}" fill="url(#lineGrad3)"/>
                <polygon points="${topX1},0 ${topX2},0 ${bottomX2},${fullH} ${bottomX1},${fullH}" fill="rgba(56,189,248,0.35)" filter="blur(8px)"/>
            </svg>
        </div>`;
    const words = title.split(' ');
    addCanvaItem(words[0] || 'YENİ', 60, 80, 90, '#38bdf8', 'transparent', 0, 0);
    addCanvaItem(words.slice(1).join(' ') || 'İLAN', 60, 180, 32, '#94a3b8', 'transparent', 0, 0);
    addCanvaItem(feats, 60, 300, 26, '#f1f5f9', 'transparent', 0, 0, 500);
    addCanvaItem(price, 60, 820, 52, '#38bdf8', 'rgba(56,189,248,0.12)', 12, 15, 500, 'center');
    addCanvaItem(contact, 60, 960, 22, '#94a3b8', 'transparent', 0, 0, 500, 'center');
}
    else if(activeCanvaId === 'canva4'){
    const fullW = canvasSize.w, fullH = canvasSize.h;
    
    // ═══ PANEL BOYUTLARI ═══
    const panelX = scaleX(1220);
    const panelY = scaleY(90);
    const panelW = scaleX(620);
    const panelH = scaleY(900);
    const panelPad = scaleX(50);
    const textX = panelX + panelPad;
    const textW = panelW - (panelPad * 2);

    canvaRenderLayer.innerHTML = `
        <div class="cvr-base cvr-c4" style="width:100%;height:100%;position:relative;overflow:hidden">
            <!-- Arka fotoğraf (tam ekran) -->
            <div class="photo-panel" style="width:${fullW}px;height:${fullH}px;position:absolute;left:0;top:0;${bgPos}"></div>
            
            <!-- Fotoğraf üstü hafif karartma (sol taraf okunabilirlik için) -->
            <div style="position:absolute;left:0;top:0;width:${fullW}px;height:${fullH}px;
                background:linear-gradient(90deg, rgba(0,0,0,.2) 0%, transparent 40%, transparent 60%, rgba(6,78,59,.3) 100%);
                pointer-events:none;z-index:1;"></div>
        </div>`;
    
    // ═══ ANA CAM PANEL (Glassmorphism) ═══
    addCanvaPanel(1220, 90, 620, 900, 'rgba(6,78,59,0.88)', 24, '1px solid rgba(16,185,129,0.35)', '0 30px 60px rgba(0,0,0,0.5)');
    
    // ═══ İÇ İNCE ÇERÇEVE (Süsleme) ═══
    addCanvaPanel(1240, 110, 580, 860, 'transparent', 18, '1px solid rgba(251,191,36,0.25)', null);
    
    // ═══ ÜST DEKORATİF ÇİZGİ (Panel ortasında) ═══
    addCanvaPanel(1220 + 310 - 40, 210, 80, 3, 'linear-gradient(90deg,#fbbf24,#f59e0b)', 2, null, null);
    
    // ═══ YAZILAR - HEPSİ ORTALI ═══
    addCanvaItem('◆ PRESTIGE COLLECTION', 1240, 250, 22, '#fbbf24', 'transparent', 0, 0, 580, 'center');
    addCanvaItem(title, 1240, 320, 60, '#ffffff', 'transparent', 0, 0, 580, 'center');
    
    // Başlık altı ince ayırıcı
    addCanvaPanel(1220 + 310 - 100, 500, 200, 1, 'rgba(251,191,36,0.4)', 0, null, null);
    
    // Fiyat (altın vurgulu, ortada)
    addCanvaItem(price, 1240, 540, 54, '#fbbf24', 'transparent', 0, 0, 580, 'center');
    
    // Özellikler etiketi
    addCanvaItem('▸ ÖZELLİKLER', 1240, 680, 16, '#a7f3d0', 'transparent', 0, 0, 580, 'center');
    
    // Özellikler listesi
    addCanvaItem(feats, 1240, 725, 24, '#d1fae5', 'transparent', 0, 0, 580, 'center');
    
    // Alt ayırıcı
    addCanvaPanel(1220 + 310 - 100, 920, 200, 1, 'rgba(251,191,36,0.4)', 0, null, null);
    
    // İletişim
    addCanvaItem('✆ ' + contact, 1240, 950, 20, '#a7f3d0', 'transparent', 0, 0, 580, 'center');
}
    else if(activeCanvaId === 'canva5'){
    const fullW = canvasSize.w, fullH = canvasSize.h;
    
    canvaRenderLayer.innerHTML = `
        <div class="cvr-base cvr-c5" style="width:100%;height:100%;position:relative;overflow:hidden;background:#0a0a0a">
            <!-- Arka fotoğraf tam ekran (vinyet YOK) -->
            <div class="photo-panel" style="width:${fullW}px;height:${fullH}px;position:absolute;left:0;top:0;${bgPos}"></div>
            
            <!-- ═══ DIŞ ALTIN ÇERÇEVE ═══ -->
            <div style="position:absolute;left:${scaleX(30)}px;top:${scaleY(30)}px;
                width:${fullW - scaleX(60)}px;height:${fullH - scaleY(60)}px;
                border:2px solid #fbbf24;border-radius:12px;
                pointer-events:none;z-index:10;"></div>
        </div>`;
    
    // ═ ═ ═  VIP ROZET (Sağ üst) ═ ═ ═ 
    // addCanvaPanel/Item internalize scaleX/Y, so we pass 1920/1080 based values
    const vipX = 1920 - 180;
    const vipY = 60;
    addCanvaPanel(vipX, vipY, 130, 60, 
        'linear-gradient(135deg,#fbbf24,#f59e0b)', 30, 
        '1px solid rgba(255,255,255,.4)', '0 8px 20px rgba(251,191,36,.5)');
    addCanvaItem('★ VIP', vipX, vipY + 18, 24, '#000000', 'transparent', 0, 0, 130, 'center');
    
    // ═ ═ ═  ALT BİLGİ PANELİ (Aşağıda, altın çerçeveye yakın) ═ ═ ═ 
    const infoY = 800;
    const infoX = 80;
    
    addCanvaPanel(infoX, infoY, 1760, 220, 
        'rgba(15,15,15,0.88)', 20, 
        '1px solid rgba(251,191,36,0.4)', '0 20px 40px rgba(0,0,0,.5)');
    
    // Sol bölüm: Başlık + Fiyat
    addCanvaItem(title, infoX + 50, infoY + 40, 48, '#ffffff', 'transparent', 0, 0, 700);
    addCanvaItem(price, infoX + 50, infoY + 110, 42, '#fbbf24', 'transparent', 0, 0, 700);
    
    // Dikey ayırıcı çizgi (ortada)
    addCanvaPanel(infoX + 900, infoY + 30, 1, 150, 
        'rgba(251,191,36,0.3)', 0, null, null);
    
    // Sağ bölüm: Özellikler
    addCanvaItem(feats, infoX + 925, infoY + 30, 24, '#e5e5e5', 'transparent', 0, 0, 750);
    
    // Alt ayırıcı çizgi
    addCanvaPanel(infoX + 50, infoY + 180, 1660, 1, 
        'rgba(251,191,36,0.3)', 0, null, null);
    
    // İletişim (alt orta)
    addCanvaItem('✆ ' + contact, infoX + 50, infoY + 190, 20, '#fbbf24', 'transparent', 0, 0, 1660, 'center');
}
    else if(activeCanvaId === 'canva6'){
    const photoW = scaleX(1050), photoH = scaleY(880);
    // ✅ Fotoğrafın başladığı X noktası: canvasW - photoW - 80
    const photoStartX = canvasSize.w - photoW - scaleX(80);
    // Yazı max genişlik: fotodan 40px önce bitsin
    const textMaxW = photoStartX - scaleX(110) - scaleX(40);
    
    canvaRenderLayer.innerHTML = `
        <div class="cvr-base cvr-c6" style="width:100%;height:100%;position:relative;overflow:hidden;background:#ffffff;background-image:linear-gradient(rgba(0,0,0,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.03) 1px,transparent 1px);background-size:60px 60px">
            
            <!-- Fotoğraf (ince siyah çerçeve eklendi - Pro dokunuş) -->
            <div class="photo-panel" style="width:${photoW}px;height:${photoH}px;position:absolute;right:${scaleX(110)}px;top:${scaleY(90)}px;border-radius:30px;box-shadow:0 40px 80px rgba(0,0,0,.2);${bgPos}"></div>      
            <!-- Sol dikey aksan çizgisi -->
            <div class="accent-line" style="width:${scaleX(6)}px;height:${scaleY(600)}px;background:linear-gradient(180deg,#0f172a,#334155);position:absolute;left:${scaleX(50)}px;top:${scaleY(200)}px;z-index:5"></div>
            
            <!-- Üst nokta -->
            <div class="black-dot" style="width:${scaleX(24)}px;height:${scaleX(24)}px;background:#0f172a;border-radius:50%;position:absolute;left:${scaleX(41)}px;top:${scaleY(180)}px;z-index:6"></div>
            
            <!-- ✨ PRO: Alt baklava nokta (çizgi sonu) -->
            <div style="width:${scaleX(16)}px;height:${scaleX(16)}px;background:#0f172a;position:absolute;left:${scaleX(45)}px;top:${scaleY(795)}px;z-index:6;transform:rotate(45deg)"></div>
            
            <!-- ✨ PRO: Sağ üst köşe L süsleme -->
            <div style="position:absolute;top:${scaleY(50)}px;right:${scaleX(50)}px;width:${scaleX(60)}px;height:${scaleY(60)}px;border-top:2px solid #0f172a;border-right:2px solid #0f172a;z-index:3;pointer-events:none"></div>
            
            <!-- ✨ PRO: Sol alt köşe L süsleme -->
            <div style="position:absolute;bottom:${scaleY(50)}px;left:${scaleX(50)}px;width:${scaleX(60)}px;height:${scaleY(60)}px;border-bottom:2px solid #0f172a;border-left:2px solid #0f172a;z-index:3;pointer-events:none"></div>
            
            <!-- ✨ PRO: Alt iletişim ayırıcı çizgi -->
            <div style="position:absolute;left:${scaleX(110)}px;bottom:${scaleY(140)}px;width:${scaleX(300)}px;height:2px;background:linear-gradient(90deg,#0f172a 0%,transparent 100%);z-index:3"></div>
        </div>`;
    
    // Yazılar - textMaxW ile taşma engellendi
    addCanvaItem('✔ PROPERTY', 110, 220, 28, '#64748b', 'transparent', 0, 0);
    addCanvaItem(title, 110, 270, 80, '#0f172a', 'transparent', 0, 0, Math.min(780, textMaxW));
    addCanvaItem(price, 110, 500, 58, '#ffffff', 'linear-gradient(135deg,#0f172a 0%,#334155 100%)', 12, 20);
    addCanvaItem('▸ ÖZELLİKLER', 110, 630, 18, '#64748b', 'transparent', 0, 0);
    addCanvaItem(feats, 110, 675, 26, '#334155', 'transparent', 0, 0, Math.min(750, textMaxW));
    addCanvaItem('★ ' + contact, 110, 960, 22, '#0f172a', 'transparent', 0, 0);
}
    else if(activeCanvaId === 'canva7'){
        const bordoW = scaleX(760), photoW = scaleX(1160), fullH = canvasSize.h;
        canvaRenderLayer.innerHTML = `
            <div class="cvr-base cvr-c7" style="width:100%;height:100%;position:relative;overflow:hidden">
                <div class="photo-panel" style="width:${photoW}px;height:${fullH}px;position:absolute;right:0;top:0;${bgPos}"></div>
                <div class="bordo-panel" style="width:${bordoW}px;height:${fullH}px;background:linear-gradient(135deg,#450a0a 0%,#7f1d1d 100%);position:absolute;left:0;top:0;z-index:5"></div>
                <div class="gold-strip" style="width:${scaleX(8)}px;height:${fullH}px;background:linear-gradient(180deg,#fbbf24,#f59e0b,#fbbf24);position:absolute;left:${scaleX(756)}px;top:0;z-index:6;box-shadow:0 0 20px rgba(251,191,36,.5)"></div>
                <div class="royal-crown" style="position:absolute;top:${scaleY(60)}px;left:${scaleX(60)}px;font-size:${scaleSize(80)}px;z-index:6;filter:drop-shadow(0 5px 15px rgba(251,191,36,.5))">👑</div>
            </div>`;
        addCanvaItem('◆ EXCLUSIVE', 80, 180, 26, '#fbbf24', 'transparent', 0, 0);
        addCanvaItem(title, 80, 230, 72, '#ffffff', 'transparent', 0, 0, 640);
        addCanvaItem(price, 80, 470, 56, '#fef08a', 'rgba(0,0,0,0.35)', 12, 20, 620);
        addCanvaItem(feats, 80, 610, 26, '#fecaca', 'transparent', 0, 0, 620);
        addCanvaItem('✆ ' + contact, 80, 960, 22, '#fbbf24', 'transparent', 0, 0);
    }
    else if(activeCanvaId === 'canva8'){
    const fullW = canvasSize.w, fullH = canvasSize.h;
    canvaRenderLayer.innerHTML = `
        <div class="cvr-base cvr-c8" style="width:100%;height:100%;position:relative;overflow:hidden">
            <div class="photo-panel" style="width:${fullW}px;height:${fullH}px;position:absolute;left:0;top:0;${bgPos}"></div>
        </div>`;
    addCanvaPanel(80, 80, 820, 180, 'rgba(255,255,255,0.12)', 20, '1px solid rgba(255,255,255,0.25)', '0 20px 50px rgba(0,0,0,0.3)');
    
    // ✅ Alt panel: Üst panelle aynı açık tonlu buzlu cam
    addCanvaPanel(80, 850, 1760, 180, 'rgba(255,255,255,0.12)', 24, '1px solid rgba(255,255,255,0.25)', '0 20px 50px rgba(0,0,0,0.4)');
    
    // Mavi iletişim şeridi
    addCanvaPanel(1230, 970, 590, 50, 'rgba(56,189,248,0.85)', 12, '1px solid rgba(125,211,252,0.6)', '0 10px 30px rgba(0,0,0,0.3)');
    
    addCanvaItem(title, 110, 115, 60, '#ffffff', 'transparent', 0, 0, 760);
    addCanvaItem(price, 110, 205, 40, '#38bdf8', 'transparent', 0, 0, 760);
    addCanvaItem(feats, 120, 865, 24, '#f1f5f9', 'transparent', 0, 0, 1100);
    addCanvaItem(contact, 1250, 980, 24, '#0f172a', 'transparent', 0, 0, 550, 'center');
}
    else if(activeCanvaId === 'canva9'){
        const photoW = canvasSize.w, photoH = scaleY(720);
        const slateW = canvasSize.w, slateH = scaleY(400);
        canvaRenderLayer.innerHTML = `
            <div class="cvr-base cvr-c9" style="width:100%;height:100%;position:relative;overflow:hidden">
                <div class="photo-panel" style="width:${photoW}px;height:${photoH}px;position:absolute;top:0;left:0;${bgPos}"></div>
                <div class="slate-panel" style="width:${slateW}px;height:${slateH}px;background:linear-gradient(135deg,#18181b 0%,#27272a 100%);position:absolute;bottom:0;left:0;border-top:6px solid #06b6d4;z-index:5"></div>
                <div class="cyan-corner" style="width:${scaleX(200)}px;height:${scaleX(6)}px;background:#06b6d4;position:absolute;top:0;right:0;z-index:6;box-shadow:0 0 20px rgba(6,182,212,.6)"></div>
                <div class="cyan-badge" style="position:absolute;top:${scaleY(60)}px;left:${scaleX(80)}px;background:#06b6d4;color:#0f172a;padding:${scaleY(8)}px ${scaleX(20)}px;font-weight:900;font-size:${scaleSize(18)}px;letter-spacing:4px;border-radius:4px;z-index:6">◆ INDUSTRIAL</div>
            </div>`;
        addCanvaItem(title, 80, 760, 72, '#ffffff', 'transparent', 0, 0, 900);
        addCanvaItem(price, 80, 880, 52, '#22d3ee', 'transparent', 0, 0);
        addCanvaItem(feats, 1100, 760, 24, '#d1d5db', 'transparent', 0, 0, 750);
        addCanvaItem('▸ ' + contact, 80, 1000, 22, '#06b6d4', 'transparent', 0, 0);
    }
    else if(activeCanvaId === 'canva10'){
    // ═══════════════════════════════════════════
    // 🎨 RENK PALETİ SEÇ (Birini aktif bırak)
    // ═══════════════════════════════════════════
    
    // ✅ PALET 1: LACİVERT + ALTIN (Klasik Lüks)
    const C = {
        bg1:'#f8fafc', bg2:'#e2e8f0', bg3:'#cbd5e1',
        primary:'#1e293b',      // Ana koyu renk (lacivert)
        accent:'#c9a961',       // Altın vurgu
        accentDark:'#a67c3f',   // Koyu altın
        text:'#0f172a',         // Ana yazı
        textSoft:'#475569',     // Soft yazı
        dotColor:'#1e293b'      // Pattern rengi
    };
    
    /* ✅ PALET 2: ZÜMRÜT + KREM (Doğal Prestij)
    const C = {
        bg1:'#fefce8', bg2:'#fef3c7', bg3:'#fde68a',
        primary:'#064e3b',
        accent:'#059669',
        accentDark:'#047857',
        text:'#022c22',
        textSoft:'#065f46',
        dotColor:'#064e3b'
    }; */
    
    /* ✅ PALET 3: ANTRASİT + BAKIR (Modern Endüstriyel)
    const C = {
        bg1:'#fafaf9', bg2:'#e7e5e4', bg3:'#d6d3d1',
        primary:'#292524',
        accent:'#b45309',
        accentDark:'#92400e',
        text:'#1c1917',
        textSoft:'#57534e',
        dotColor:'#292524'
    }; */
    
    /* ✅ PALET 4: BORDO + KREM (Zarif Klasik)
    const C = {
        bg1:'#fdf4f5', bg2:'#fce7e9', bg3:'#fbcfd4',
        primary:'#7f1d1d',
        accent:'#991b1b',
        accentDark:'#7f1d1d',
        text:'#450a0a',
        textSoft:'#7f1d1d',
        dotColor:'#7f1d1d'
    }; */

    const photoW = scaleX(1080), photoH = scaleY(920);
    const photoX = scaleX(90), photoY = scaleY(90);

    canvaRenderLayer.innerHTML = `
        <div class="cvr-base cvr-c10" style="width:100%;height:100%;position:relative;overflow:hidden;
            background: linear-gradient(135deg, ${C.bg1} 0%, ${C.bg2} 60%, ${C.bg3} 100%);">
            
            <div style="position:absolute;inset:0;opacity:.12;
                background-image:radial-gradient(${C.dotColor} 1px, transparent 1px);
                background-size:${scaleX(24)}px ${scaleX(24)}px;pointer-events:none;"></div>

            <div class="photo-panel" style="
                width:${photoW}px !important;
                height:${photoH}px !important;
                position:absolute;
                left:${photoX}px;top:${photoY}px;
                border-radius:18px !important;
                box-shadow:0 30px 60px ${C.primary}55, 0 10px 20px ${C.primary}33;
                ${bgPos}"></div>

            <div style="
                width:${photoW + scaleX(24)}px;
                height:${photoH + scaleY(24)}px;
                position:absolute;
                left:${photoX - scaleX(12)}px;
                top:${photoY - scaleY(12)}px;
                border:3px solid ${C.accent};
                border-radius:22px;
                z-index:5;pointer-events:none;
                box-shadow:0 0 0 1px ${C.accent}33;"></div>

            <div style="
                width:${photoW + scaleX(48)}px;
                height:${photoH + scaleY(48)}px;
                position:absolute;
                left:${photoX - scaleX(24)}px;
                top:${photoY - scaleY(24)}px;
                border:1px solid ${C.primary};
                border-radius:28px;
                z-index:4;pointer-events:none;opacity:.5;"></div>

            <div style="position:absolute;top:${photoY + scaleY(30)}px;left:${photoX + scaleX(30)}px;
                background:linear-gradient(135deg, ${C.accent}, ${C.accentDark});
                color:#fff;padding:${scaleY(8)}px ${scaleX(18)}px;
                border-radius:4px;font-size:${scaleSize(16)}px;font-weight:800;
                letter-spacing:2px;z-index:7;
                box-shadow:0 6px 15px ${C.accent}80;
                border:1px solid rgba(255,255,255,.4);">
                ★ PREMIUM
            </div>

            <div style="position:absolute;top:${scaleY(180)}px;left:${scaleX(1230)}px;
                width:4px;height:${scaleY(180)}px;
                background:linear-gradient(180deg, ${C.accent}, transparent);
                border-radius:2px;z-index:6;"></div>

            <div style="position:absolute;top:${scaleY(240)}px;left:${scaleX(1260)}px;
                width:${scaleX(60)}px;height:2px;
                background:${C.accent};z-index:6;"></div>

            <div style="position:absolute;top:${scaleY(630)}px;left:${scaleX(1260)}px;
                width:${scaleX(580)}px;height:1px;
                background:linear-gradient(90deg, ${C.accent} 0%, transparent 100%);
                z-index:6;"></div>

            <div style="position:absolute;bottom:${scaleY(60)}px;left:${scaleX(1260)}px;
                width:${scaleX(580)}px;height:${scaleY(60)}px;
                background:linear-gradient(90deg, ${C.accent}20 0%, transparent 100%);
                border-left:4px solid ${C.accent};
                border-radius:0 8px 8px 0;z-index:4;"></div>
        </div>`;

    // METİN YERLEŞİMİ - Renk değişkenli
    addCanvaItem('◆ SAHİL EVLERİ KOLEKSİYONU', 1260, 195, 24, C.accent, 'transparent', 0, 0);
    addCanvaItem(title, 1260, 275, 66, C.text, 'transparent', 0, 0, 600);
    addCanvaItem(price, 1260, 490, 52, '#ffffff', C.primary, 55, 18, 520, 'center');
    addCanvaItem('▸ ÖZELLİKLER', 1260, 660, 18, C.accent, 'transparent', 0, 0);
    addCanvaItem(feats, 1260, 705, 25, C.text, 'transparent', 0, 0, 580);
    addCanvaItem('✆ ' + contact, 1285, 985, 22, C.textSoft, 'transparent', 0, 0, 550);
}

    document.querySelectorAll('.photo-panel').forEach(p => enablePhotoDrag(p));
        requestAnimationFrame(() => {
            if(typeof redrawAll === 'function') redrawAll();
        });
    } catch (err) {
        console.error("buildCanvaRender ERROR:", err);
        const errDiv = document.createElement('div');
        errDiv.style.position = 'fixed';
        errDiv.style.top = '10px';
        errDiv.style.left = '10px';
        errDiv.style.background = 'black';
        errDiv.style.color = 'lime';
        errDiv.style.zIndex = '999999';
        errDiv.style.padding = '10px';
        errDiv.style.fontSize = '14px';
        errDiv.innerText = "buildCanvaRender HATA: " + err.message + "\n\n" + err.stack;
        document.body.appendChild(errDiv);
    }
}

function clearCanvaTemplate(skipSetTemplate){
    // Sadece şablon elementlerini temizle (özel yazılara dokunma)
    document.querySelectorAll('.canva-generated, .canva-panel').forEach(el => {
        if(el.parentNode) el.remove();
        const idx = canvaOverlays.indexOf(el);
        if(idx > -1) canvaOverlays.splice(idx, 1);
    });
    canvaRenderLayer.innerHTML = '';
    canvaRenderLayer.style.display = 'none';
    document.querySelectorAll('.canva-tpl-card').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.normal-el').forEach(el => { el.style.display = ''; el.style.visibility = ''; });
    photoLayer.style.display = '';
    isCanvaMode = false;
    activeCanvaId = '';
    if(!skipSetTemplate) {
        setTemplate(activeLayout);
    }
}

// Yüklenince akordiyon içine inject et
_elitInit();
