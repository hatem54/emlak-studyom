/* ============================================================
   🖼️ Afiş ve Vitrin Şablon Seti
   10 Adet Özel Mimaride Profesyonel Emlak Kalıbı (İlgi Çekici İlan Metinleri)
============================================================ */

function _kalipInit(){
    const container = document.getElementById('tpl-content-kalip');
    if(!container) {
        setTimeout(_kalipInit, 500);
        return;
    }
    
    container.innerHTML = `
        <div class="edit-hint" style="display:none;">💡 Yazıya/panele ÇİFT TIKLA | Sürükle Bırak | Sağ Tık (Ayarlar)</div>
        <div class="section-title" style="margin-top:0">🖼️ Afiş ve Vitrin Metin Düzenleyici</div>
        <div class="input-group">
            <label>Ana Başlık (Title)</label>
            <input type="text" id="canvaKTitle" value="🔥 4+1 ULTRA LÜKS REZİDANS DAİRE">
        </div>
        <div class="input-group">
            <label>Bölge / Alt Başlık</label>
            <input type="text" id="canvaKSub" value="Çankaya / Ovacık Sınırında • Elit Site İçerisinde">
        </div>
        <div class="input-group">
            <label>Fiyat</label>
            <input type="text" id="canvaKPrice" value="8.450.000 ₺">
        </div>
        <div class="input-group">
            <label>Özel Rozet / Vurgu</label>
            <input type="text" id="canvaKBadge" value="★★★ İSKANLI • HEMEN TAŞINMAYA HAZIR ★★★">
        </div>
        <div class="input-group">
            <label>İletişim / Danışman</label>
            <input type="text" id="canvaKContact" value="EMLAK STUDYOM | 0532 000 00 00">
        </div>
        <div class="input-group">
            <label>Özellikler (Alt alta)</label>
            <textarea id="canvaKFeats" rows="5">Geniş Teras Balkonlu & Panoramik Manzaralı
Jakuzili Ebeveyn Banyolu & Giyinme Odalı
2 Araçlık Kapalı Otopark & Çift Asansör
Kat Mülkiyetli • Yüksek Krediye Uygun
Depreme Dayanıklı C35 Radye Temel</textarea>
        </div>
    `;

    ['canvaKTitle','canvaKSub','canvaKPrice','canvaKBadge','canvaKContact','canvaKFeats'].forEach(id=>{
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', () => { if(isCanvaMode) renderKTemplate(activeCanvaId); });
    });
    
    buildKCards();
}

function buildKCards(){
    let grid = document.getElementById('canvaTplGridK');
    if(!grid) {
        grid = document.createElement('div');
        grid.className = 'canva-tpl-grid';
        grid.id = 'canvaTplGridK';
        const hint = document.querySelector('#tpl-content-kalip .edit-hint');
        if(hint) hint.parentNode.insertBefore(grid, hint.nextSibling);
    }
    grid.innerHTML = '';
    if(typeof KALIP_CARDS !== 'undefined') {
        KALIP_CARDS.forEach((c, idx) => {
            const card = document.createElement('div');
            card.className = 'canva-tpl-card';
            card.dataset.id = c.id;
            const tBg = 'linear-gradient(135deg, '+c.bg1+', '+c.bg2+')';
            card.innerHTML = `
                <div class="tpl-preview" style="display:flex;gap:0;border-radius:6px;overflow:hidden;background:${tBg};border:1px solid rgba(255,255,255,0.15);box-shadow:0 3px 8px rgba(0,0,0,0.15);">
                    <div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:3px;padding:6px;background:rgba(0,0,0,0.3);">
                        <div style="font-size:12px;font-weight:900;color:${c.accent};letter-spacing:1px;">AFİŞ ${idx+1}</div>
                        <div style="font-size:10px;font-weight:800;color:#fff;text-align:center;">${c.name.split('.')[1] || c.name}</div>
                        <div style="font-size:8.5px;color:#cbd5e1;opacity:0.85;">${c.desc || ''}</div>
                    </div>
                </div>`;
            card.onclick = () => {
                if(card.classList.contains('active')) return;
                document.querySelectorAll('.canva-tpl-card').forEach(x => x.classList.remove('active'));
                card.classList.add('active');
                activeCanvaId = c.id;
                renderKTemplate(c.id);
            };
            grid.appendChild(card);
        });
    }
}

function renderKTemplate(id){
    if(!id) return;
    if(typeof _kolajTemizle === 'function') _kolajTemizle();
    document.querySelectorAll('.normal-el').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.canva-generated, .canva-panel').forEach(e => e.remove());
    document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
    isCanvaMode = true;
    
    if(typeof elLogo !== 'undefined' && elLogo && elLogo.src && elLogo.src !== window.location.href) {
        elLogo.style.visibility = 'visible'; 
        elLogo.style.top = 'auto'; 
        elLogo.style.left = 'auto'; 
        elLogo.style.bottom = '50px'; 
        elLogo.style.right = '50px';
    }
    
    if(typeof photoLayer !== 'undefined' && photoLayer) photoLayer.style.display = 'none';
    if(typeof canvaRenderLayer !== 'undefined' && canvaRenderLayer) canvaRenderLayer.style.display = 'block';

    const getVal = (id, fallback) => {
        const el = document.getElementById(id);
        return el && el.value ? el.value : fallback;
    };

    const title = getVal('canvaKTitle', '🔥 4+1 ULTRA LÜKS REZİDANS DAİRE').toUpperCase();
    const sub = getVal('canvaKSub', 'Çankaya / Ovacık Sınırında • Elit Site İçerisinde');
    const price = getVal('canvaKPrice', '8.450.000 ₺');
    const badge = getVal('canvaKBadge', '★★★ İSKANLI • HEMEN TAŞINMAYA HAZIR ★★★');
    const contact = getVal('canvaKContact', 'EMLAK STUDYOM | 0532 000 00 00');
    const feats = getVal('canvaKFeats', 'Geniş Teras Balkonlu & Panoramik Manzaralı\nJakuzili Ebeveyn Banyolu & Giyinme Odalı\n2 Araçlık Kapalı Otopark & Çift Asansör\nKat Mülkiyetli • Yüksek Krediye Uygun\nDepreme Dayanıklı C35 Radye Temel');
    const featsArr = feats.split('\n').map(x => x.trim()).filter(x => x.length > 0);

    const bgImg = typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl ? "background-image:url('" + uploadedImgUrl + "')" : "background-color:#1e293b";
    const x = document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50;
    const y = document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50;
    const bgPos = bgImg + ";background-position:" + x + "% " + y + "%;background-size:cover;";

    const canvasSize = typeof getCanvasSize === 'function' ? getCanvasSize() : { w: 1080, h: 1080 };
    const fullW = canvasSize.w;
    const fullH = canvasSize.h;
    const scaleMin = v => v * (Math.min(fullW, fullH) / 1080);

    // ============================================================
    // 1. ŞABLON: Ovacık Gold Afiş (Örnek Görsel 1 - Çarpıcı İlan Kurgusu)
    // ============================================================
    if (id === 'canvaK1') {
        const featPillsHtml = featsArr.slice(0, 5).map(f => `
            <div style="background:rgba(255,255,255,0.1); border-left:5px solid #f59e0b; border-radius:8px; padding:${scaleMin(7)}px ${scaleMin(14)}px; display:flex; align-items:center; justify-content:space-between; margin-bottom:${scaleMin(7)}px; backdrop-filter:blur(5px); box-shadow:0 3px 10px rgba(0,0,0,0.3);">
                <span class="editable-text" style="color:#ffffff; font-size:${scaleMin(18)}px; font-weight:800; letter-spacing:0.5px;">${f}</span>
                <span style="background:#10b981; color:#fff; border-radius:50%; width:${scaleMin(24)}px; height:${scaleMin(24)}px; display:flex; align-items:center; justify-content:center; font-size:${scaleMin(13)}px; font-weight:900;">✓</span>
            </div>
        `).join('');

        canvaRenderLayer.innerHTML = `
        <div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:radial-gradient(circle at 30% 30%, #0c2352 0%, #020a1a 100%);font-family:'Montserrat',sans-serif;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;padding:${scaleMin(24)}px;">
            
            <!-- Üst Gövde: Sol Metinler + Sağ Çoklu Fotoğraf -->
            <div style="display:flex; width:100%; height:75%; gap:${scaleMin(18)}px;">
                <!-- Sol Kolon -->
                <div style="flex:1.15; display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div style="font-family:'Great Vibes',cursive; font-size:${scaleMin(64)}px; color:#ffffff; line-height:1; text-shadow:0 4px 15px rgba(0,0,0,0.9);"><span class="editable-text">Ayrıcalıklı Yaşam</span></div>
                        <div style="background:linear-gradient(90deg, #f59e0b, #d97706); color:#000; padding:${scaleMin(5)}px ${scaleMin(16)}px; border-radius:20px; font-size:${scaleMin(15.5)}px; font-weight:900; display:inline-flex; align-items:center; gap:6px; margin-top:${scaleMin(4)}px; box-shadow:0 4px 12px rgba(245,158,11,0.4);">
                            <span>📍</span><span class="editable-text">${sub}</span>
                        </div>
                        <div style="font-family:'Archivo Black',sans-serif; font-size:${scaleMin(64)}px; color:#fbbf24; line-height:0.95; margin-top:${scaleMin(10)}px; text-shadow:2px 2px 0 #fff, 4px 4px 0 #b45309, 0 10px 25px rgba(0,0,0,0.9); letter-spacing:-1px;">
                            <span class="editable-text">${title}</span>
                        </div>
                        <div style="font-family:'Dancing Script',cursive; font-size:${scaleMin(26)}px; color:#e0f2fe; margin-top:${scaleMin(6)}px; font-style:italic;">
                            Panoramik Manzara, Ferah Teras ve Eşsiz Konfor!
                        </div>
                    </div>

                    <!-- Özellik Maddeleri -->
                    <div style="margin-top:${scaleMin(8)}px;">
                        ${featPillsHtml}
                    </div>

                    <!-- Fiyat Kutusu -->
                    <div style="background:linear-gradient(135deg, #020c24, #0f172a); border:3px solid #f59e0b; border-radius:14px; padding:${scaleMin(10)}px ${scaleMin(20)}px; display:inline-flex; align-items:center; gap:${scaleMin(12)}px; width:fit-content; box-shadow:0 8px 25px rgba(0,0,0,0.7);">
                        <span style="font-size:${scaleMin(34)}px;">🏠</span>
                        <span class="editable-text" style="font-size:${scaleMin(38)}px; font-weight:900; color:#fbbf24; letter-spacing:1px;">${price}</span>
                        <span style="background:#f59e0b; color:#000; font-size:${scaleMin(13)}px; font-weight:900; padding:3px 8px; border-radius:4px;">FIRSAT</span>
                    </div>
                </div>

                <!-- Sağ Kolon: Çoklu Fotoğraf Vitrini -->
                <div style="flex:0.85; position:relative; display:flex; gap:${scaleMin(8)}px;">
                    <!-- Sol Ana Foto -->
                    <div class="photo-panel" style="flex:1.2; height:100%; border:3.5px solid #f59e0b; border-radius:14px; box-shadow:0 10px 30px rgba(0,0,0,0.6); ${bgPos};"></div>
                    <!-- Sağ İki Küçük Foto -->
                    <div style="flex:0.8; display:flex; flex-direction:column; gap:${scaleMin(8)}px;">
                        <div class="photo-panel" style="flex:1; border:3px solid #f59e0b; border-radius:10px; box-shadow:0 8px 20px rgba(0,0,0,0.5); ${bgPos};"></div>
                        <div class="photo-panel" style="flex:1; border:3px solid #f59e0b; border-radius:10px; box-shadow:0 8px 20px rgba(0,0,0,0.5); ${bgPos};"></div>
                    </div>

                    <!-- Ortadaki Altın Rozet -->
                    <div style="position:absolute; bottom:${scaleMin(12)}px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%); color:#000; padding:${scaleMin(8)}px ${scaleMin(18)}px; border-radius:30px; font-size:${scaleMin(14.5)}px; font-weight:900; border:2px solid #ffffff; box-shadow:0 6px 20px rgba(0,0,0,0.8); text-align:center; white-space:nowrap; z-index:10;">
                        <span class="editable-text">${badge}</span>
                    </div>
                </div>
            </div>

            <!-- Alt Gövde: 6'lı İkon Şeridi + Slogan & İletişim -->
            <div style="height:22%; display:flex; flex-direction:column; justify-content:space-between;">
                <!-- 6'lı İkon Şeridi -->
                <div style="background:rgba(255,255,255,0.96); border-radius:12px; padding:${scaleMin(8)}px ${scaleMin(10)}px; display:grid; grid-template-columns:repeat(6, 1fr); gap:${scaleMin(6)}px; border:2.5px solid #f59e0b; box-shadow:0 6px 20px rgba(0,0,0,0.5);">
                    <div style="text-align:center; color:#0f172a;"><div style="font-size:${scaleMin(24)}px;">📍</div><div style="font-size:${scaleMin(14)}px; font-weight:900;">MERKEZİ</div><div style="font-size:${scaleMin(11.5)}px; color:#475569; font-weight:700;">SEÇKİN KONUM</div></div>
                    <div style="text-align:center; color:#0f172a;"><div style="font-size:${scaleMin(24)}px;">🛏️</div><div style="font-size:${scaleMin(14)}px; font-weight:900;">4+1 PLAN</div><div style="font-size:${scaleMin(11.5)}px; color:#475569; font-weight:700;">220 M² BRÜT</div></div>
                    <div style="text-align:center; color:#0f172a;"><div style="font-size:${scaleMin(24)}px;">🚿</div><div style="font-size:${scaleMin(14)}px; font-weight:900;">EBEVEYN</div><div style="font-size:${scaleMin(11.5)}px; color:#475569; font-weight:700;">JAKUZİLİ</div></div>
                    <div style="text-align:center; color:#0f172a;"><div style="font-size:${scaleMin(24)}px;">🚗</div><div style="font-size:${scaleMin(14)}px; font-weight:900;">2 OTOPARK</div><div style="font-size:${scaleMin(11.5)}px; color:#475569; font-weight:700;">KAPALI & VALE</div></div>
                    <div style="text-align:center; color:#0f172a;"><div style="font-size:${scaleMin(24)}px;">📦</div><div style="font-size:${scaleMin(14)}px; font-weight:900;">ÖZEL KİLER</div><div style="font-size:${scaleMin(11.5)}px; color:#475569; font-weight:700;">DEPO ALANI</div></div>
                    <div style="text-align:center; color:#0f172a;"><div style="font-size:${scaleMin(24)}px;">🏢</div><div style="font-size:${scaleMin(14)}px; font-weight:900;">KAT MÜLK.</div><div style="font-size:${scaleMin(11.5)}px; color:#475569; font-weight:700;">HEMEN TESLİM</div></div>
                </div>

                <!-- Slogan & İletişim -->
                <div style="display:flex; justify-content:space-between; align-items:center; padding:0 ${scaleMin(6)}px;">
                    <div style="font-size:${scaleMin(15.5)}px; color:#fef08a; font-style:italic; font-weight:600;">
                        Hayallerinizdeki lüks yaşama bugün adım atın... Kaçırılmayacak fırsat portföy! 🔑
                    </div>
                    <div style="font-size:${scaleMin(17)}px; font-weight:900; color:#ffffff; background:rgba(0,0,0,0.65); padding:${scaleMin(6)}px ${scaleMin(16)}px; border-radius:25px; border:1.5px solid #f59e0b;">
                        <span class="editable-text">${contact}</span>
                    </div>
                </div>
            </div>
        </div>`;
    }

    // ============================================================
    // 2. ŞABLON: İnfografik Emlak Rehberi (Yatırım Güvence Rehberi)
    // ============================================================
    else if (id === 'canvaK2') {
        canvaRenderLayer.innerHTML = `
        <div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#faf7f2;font-family:'Montserrat',sans-serif;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;">
            
            <!-- Üst & Orta İçerik -->
            <div style="display:flex; flex:1; padding:${scaleMin(26)}px; gap:${scaleMin(22)}px; overflow:hidden;">
                
                <!-- Sol Kolon: İnfografik Emlak Maddeleri -->
                <div style="flex:1.2; display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div style="color:#78350f; font-size:${scaleMin(15)}px; font-weight:900; letter-spacing:2px; text-transform:uppercase;">
                            🔥 EN DOĞRU ZAMANDA EN GÜVENLİ YATIRIM FIRSATI!
                        </div>
                        <div style="font-family:'Archivo Black',sans-serif; font-size:${scaleMin(42)}px; color:#4a1525; line-height:1.05; margin:${scaleMin(6)}px 0;">
                            <span class="editable-text">PRESTİJLİ VE AYRICALIKLI YAŞAM ZİRVESİ</span>
                        </div>
                        <div style="color:#44403c; font-size:${scaleMin(15.5)}px; line-height:1.4; margin-bottom:${scaleMin(10)}px; font-weight:600;">
                            <span class="editable-text">Değeri her gün katlanan seçkin lokasyonda, A+ malzeme kalitesi ve kusursuz konfor mimarisi!</span>
                        </div>
                    </div>

                    <!-- 4 İnfografik Özellik Kapsülü -->
                    <div style="display:flex; flex-direction:column; gap:${scaleMin(10)}px;">
                        <div style="display:flex; align-items:center; gap:${scaleMin(12)}px;">
                            <div style="width:${scaleMin(46)}px; height:${scaleMin(46)}px; border-radius:50%; background:#4a1525; color:#fff; display:flex; align-items:center; justify-content:center; font-size:${scaleMin(22)}px; flex-shrink:0; box-shadow:0 4px 10px rgba(74,21,37,0.3);">🛡️</div>
                            <div>
                                <div style="font-size:${scaleMin(16.5)}px; font-weight:900; color:#4a1525;">DEPREME TAM GÜVENLİ C35 RADYE TEMEL</div>
                                <div style="font-size:${scaleMin(13)}px; color:#57534e; font-weight:600;">Zemin etüdü onaylı, yüksek mukavemetli çelik donatılı statik proje.</div>
                            </div>
                        </div>

                        <div style="display:flex; align-items:center; gap:${scaleMin(12)}px;">
                            <div style="width:${scaleMin(46)}px; height:${scaleMin(46)}px; border-radius:50%; background:#4a1525; color:#fff; display:flex; align-items:center; justify-content:center; font-size:${scaleMin(22)}px; flex-shrink:0; box-shadow:0 4px 10px rgba(74,21,37,0.3);">🌡️</div>
                            <div>
                                <div style="font-size:${scaleMin(16.5)}px; font-weight:900; color:#4a1525;">1. SINIF YERDEN ISITMA & ISI YALITIMI</div>
                                <div style="font-size:${scaleMin(13)}px; color:#57534e; font-weight:600;">Taş yünü dış mantolama, konfor cam ve minimum enerji gideri.</div>
                            </div>
                        </div>

                        <div style="display:flex; align-items:center; gap:${scaleMin(12)}px;">
                            <div style="width:${scaleMin(46)}px; height:${scaleMin(46)}px; border-radius:50%; background:#4a1525; color:#fff; display:flex; align-items:center; justify-content:center; font-size:${scaleMin(22)}px; flex-shrink:0; box-shadow:0 4px 10px rgba(74,21,37,0.3);">📹</div>
                            <div>
                                <div style="font-size:${scaleMin(16.5)}px; font-weight:900; color:#4a1525;">7/24 FİZİKİ GÜVENLİK & AKILLI EV</div>
                                <div style="font-size:${scaleMin(13)}px; color:#57534e; font-weight:600;">Yüz tanıma, akıllı cep otomasyonu, görüntülü diafon ve kamera.</div>
                            </div>
                        </div>

                        <div style="display:flex; align-items:center; gap:${scaleMin(12)}px;">
                            <div style="width:${scaleMin(46)}px; height:${scaleMin(46)}px; border-radius:50%; background:#4a1525; color:#fff; display:flex; align-items:center; justify-content:center; font-size:${scaleMin(22)}px; flex-shrink:0; box-shadow:0 4px 10px rgba(74,21,37,0.3);">📑</div>
                            <div>
                                <div style="font-size:${scaleMin(16.5)}px; font-weight:900; color:#4a1525;">KAT MÜLKİYETLİ & YÜKSEK KREDİYE UYGUN</div>
                                <div style="font-size:${scaleMin(13)}px; color:#57534e; font-weight:600;">Eksiksiz iskan belgesi, sorunsuz tek tapu ve yüksek kredi limiti.</div>
                            </div>
                        </div>
                    </div>

                    <!-- Fark & Değerlendirme Kutusu -->
                    <div style="background:rgba(74,21,37,0.05); border:2px solid #4a1525; border-radius:10px; padding:${scaleMin(10)}px ${scaleMin(14)}px; margin-top:${scaleMin(8)}px;">
                        <div style="font-size:${scaleMin(14)}px; font-weight:900; color:#4a1525;">💡 BU MÜLKÜN EMSALLERİNDEN FARKI:</div>
                        <div style="font-size:${scaleMin(12.5)}px; color:#292524; font-weight:600; line-height:1.35; margin-top:2px;">Bölgedeki emsallerine göre %25 daha geniş net metrekare, özel iç mimari ve en hızlı prim yapan cadde konumu.</div>
                    </div>

                    <!-- Alıntı / Broker Mesajı -->
                    <div style="border-left:4px solid #78350f; padding-left:${scaleMin(12)}px; margin-top:${scaleMin(8)}px;">
                        <div style="font-size:${scaleMin(13.5)}px; font-style:italic; color:#78350f; font-weight:800; line-height:1.35;">
                            “ Gayrimenkul sadece bir ev değil; ailenizin geleceğini inşa eden en karlı finansal kaledir. ”
                        </div>
                    </div>
                </div>

                <!-- Sağ Kolon: Vurgulu Mülk Fotoğrafı -->
                <div style="flex:0.8; display:flex; flex-direction:column; justify-content:space-between; align-items:center; position:relative;">
                    <!-- Fotoğraf Çerçevesi -->
                    <div class="photo-panel" style="width:100%; height:72%; border-radius:20px; border:4px solid #ffffff; box-shadow:0 15px 35px rgba(0,0,0,0.18); ${bgPos}; position:relative;">
                        <!-- Üst Sağ Rozet -->
                        <div style="position:absolute; top:${scaleMin(14)}px; right:${scaleMin(14)}px; background:#4a1525; color:#fff; border-radius:12px; padding:${scaleMin(8)}px ${scaleMin(16)}px; text-align:center; box-shadow:0 6px 15px rgba(74,21,37,0.4);">
                            <div style="font-size:${scaleMin(14)}px; font-weight:900;">ÖZEL MİMARİ</div>
                            <div style="font-size:${scaleMin(11)}px; color:#fde047; font-weight:700;">PANORAMİK CEPHE</div>
                        </div>
                    </div>

                    <!-- Fiyat ve İletişim Kartı -->
                    <div style="width:100%; text-align:center; margin-top:${scaleMin(10)}px;">
                        <div style="background:#4a1525; color:#fff; font-size:${scaleMin(34)}px; font-weight:900; padding:${scaleMin(10)}px ${scaleMin(24)}px; border-radius:35px; display:inline-block; box-shadow:0 8px 25px rgba(74,21,37,0.35);">
                            <span class="editable-text">${price}</span>
                        </div>
                        <div style="font-size:${scaleMin(16)}px; font-weight:900; color:#4a1525; margin-top:${scaleMin(8)}px;">
                            <span class="editable-text">${contact}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Alt Bant: 4 Güvence Sütunu + İmza -->
            <div style="background:#3b111f; color:#ffffff; padding:${scaleMin(12)}px ${scaleMin(24)}px;">
                <div style="display:flex; justify-content:space-around; font-size:${scaleMin(14.5)}px; font-weight:900; border-bottom:1px solid rgba(255,255,255,0.25); padding-bottom:${scaleMin(8)}px;">
                    <div>🛡️ TAM İSKANLI</div>
                    <div>🌿 DOĞA & ŞEHİR MANZARALI</div>
                    <div>📈 YÜKSEK PRİM POTANSİYELİ</div>
                    <div>🚗 NUMARALI KAPALI OTOPARK</div>
                </div>
                <div style="text-align:center; font-size:${scaleMin(13.5)}px; color:#fef08a; font-style:italic; margin-top:${scaleMin(6)}px; font-weight:600;">
                    — Değer Katan Gayrimenkuller, Güven Veren Profesyonel Hizmet —
                </div>
            </div>
        </div>`;
    }

    // ============================================================
    // 3. ŞABLON: Lüks Magazin Editoryal (Architectural Digest)
    // ============================================================
    else if (id === 'canvaK3') {
        canvaRenderLayer.innerHTML = `
        <div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#faf8f5;font-family:'Playfair Display',serif;display:flex;box-sizing:border-box;">
            
            <!-- Sol %52: Boydan Boya Fotoğraf + Altın Çerçeve -->
            <div style="flex:1.1; position:relative; overflow:hidden;">
                <div class="photo-panel" style="width:100%; height:100%; ${bgPos};"></div>
                <!-- İnce İç Çerçeve -->
                <div style="position:absolute; inset:${scaleMin(18)}px; border:1.5px solid rgba(212,175,55,0.8); pointer-events:none; z-index:2;"></div>
                <div style="position:absolute; top:${scaleMin(32)}px; left:${scaleMin(32)}px; background:rgba(0,0,0,0.7); color:#d4af37; padding:${scaleMin(6)}px ${scaleMin(16)}px; font-family:'Montserrat',sans-serif; font-size:${scaleMin(13)}px; font-weight:800; letter-spacing:2px; border-radius:4px;">
                    VIP PORTFÖY • ÖZEL DOSYA
                </div>
            </div>

            <!-- Sağ %48: Editoryal Tipografi Kartı -->
            <div style="flex:0.9; padding:${scaleMin(40)}px ${scaleMin(32)}px; display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box; font-family:'Montserrat',sans-serif;">
                <div>
                    <div style="color:#854d0e; font-size:${scaleMin(14)}px; font-weight:900; letter-spacing:3px; text-transform:uppercase;">
                        PORTFOLIO NO: #2026-VIP
                    </div>
                    <div style="font-family:'Playfair Display',serif; font-size:${scaleMin(48)}px; color:#1e293b; line-height:1.05; margin-top:${scaleMin(10)}px; font-weight:900;">
                        <span class="editable-text">VİLLA BELLA VISTA</span>
                    </div>
                    <div style="color:#475569; font-size:${scaleMin(16)}px; margin-top:${scaleMin(8)}px; letter-spacing:1px; font-weight:600;">
                        <span class="editable-text">Doğanın Koynunda, Sonsuzluk Havuzlu Müstakil Malikane</span>
                    </div>
                    <div style="width:${scaleMin(80)}px; height:3px; background:#d4af37; margin:${scaleMin(16)}px 0;"></div>
                    
                    <!-- 2x3 Özellik Izgarası -->
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:${scaleMin(14)}px; margin-top:${scaleMin(14)}px;">
                        <div style="border-bottom:1.5px solid #e2e8f0; padding-bottom:6px;"><span style="color:#64748b; font-size:${scaleMin(13)}px; font-weight:700;">ARSA PAYI:</span> <span style="font-weight:900; font-size:${scaleMin(16)}px; color:#0f172a;">850 m²</span></div>
                        <div style="border-bottom:1.5px solid #e2e8f0; padding-bottom:6px;"><span style="color:#64748b; font-size:${scaleMin(13)}px; font-weight:700;">NET ALAN:</span> <span style="font-weight:900; font-size:${scaleMin(16)}px; color:#0f172a;">380 m²</span></div>
                        <div style="border-bottom:1.5px solid #e2e8f0; padding-bottom:6px;"><span style="color:#64748b; font-size:${scaleMin(13)}px; font-weight:700;">PLAN:</span> <span style="font-weight:900; font-size:${scaleMin(16)}px; color:#0f172a;">5+2 Triplex</span></div>
                        <div style="border-bottom:1.5px solid #e2e8f0; padding-bottom:6px;"><span style="color:#64748b; font-size:${scaleMin(13)}px; font-weight:700;">BANYO:</span> <span style="font-weight:900; font-size:${scaleMin(16)}px; color:#0f172a;">5 Ebeveyn</span></div>
                        <div style="border-bottom:1.5px solid #e2e8f0; padding-bottom:6px;"><span style="color:#64748b; font-size:${scaleMin(13)}px; font-weight:700;">HAVUZ:</span> <span style="font-weight:900; font-size:${scaleMin(16)}px; color:#0f172a;">Isıtmalı</span></div>
                        <div style="border-bottom:1.5px solid #e2e8f0; padding-bottom:6px;"><span style="color:#64748b; font-size:${scaleMin(13)}px; font-weight:700;">DURUM:</span> <span style="font-weight:900; font-size:${scaleMin(16)}px; color:#0f172a;">Sıfır Teslim</span></div>
                    </div>
                </div>

                <!-- Alt Bölüm: Fiyat & İletişim -->
                <div>
                    <div style="font-family:'Playfair Display',serif; font-size:${scaleMin(46)}px; color:#1e293b; font-weight:900;">
                        <span class="editable-text">${price}</span>
                    </div>
                    <div style="margin-top:${scaleMin(10)}px; font-size:${scaleMin(16)}px; font-weight:800; color:#475569; border-top:1.5px solid #cbd5e1; padding-top:${scaleMin(10)}px;">
                        <span class="editable-text">${contact}</span>
                    </div>
                </div>
            </div>
        </div>`;
    }

    // ============================================================
    // 4. ŞABLON: 3-Fotoğraflı Vitrin İlanı (Baskı Formatı)
    // ============================================================
    else if (id === 'canvaK4') {
        canvaRenderLayer.innerHTML = `
        <div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#ffffff;font-family:'Montserrat',sans-serif;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;padding:${scaleMin(20)}px;">
            
            <!-- Üst Acil Satılık Şeridi -->
            <div style="background:linear-gradient(90deg, #dc2626, #991b1b); color:#ffffff; padding:${scaleMin(10)}px ${scaleMin(20)}px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 4px 14px rgba(220,38,38,0.4);">
                <span style="font-size:${scaleMin(17)}px; font-weight:900; letter-spacing:1px;">⚡ ACİL SATILIK • EMSALLERİNE GÖRE ÇOK UYGUN FİYAT</span>
                <span style="font-size:${scaleMin(14)}px; font-weight:800; background:rgba(0,0,0,0.3); padding:3px 10px; border-radius:6px;">TEK YETKİLİ</span>
            </div>

            <!-- Başlık & Muhit -->
            <div style="margin:${scaleMin(8)}px 0 0 0;">
                <div style="font-family:'Archivo Black',sans-serif; font-size:${scaleMin(42)}px; color:#0f172a; line-height:1.05;">
                    <span class="editable-text">3+1 ARA KAT MASRAFSIZ LÜKS DAİRE</span>
                </div>
                <div style="font-size:${scaleMin(17)}px; color:#475569; font-weight:800; margin-top:3px;">
                    📍 <span class="editable-text">Metroya 2 Dakika • Okullar ve AVM Bölgesinde</span>
                </div>
            </div>

            <!-- Orta Bölüm: 3 Fotoğraflı Grid -->
            <div style="display:flex; gap:${scaleMin(10)}px; height:45%; margin:${scaleMin(8)}px 0;">
                <div class="photo-panel" style="flex:1.4; height:100%; border-radius:10px; border:2.5px solid #cbd5e1; ${bgPos}; position:relative;">
                    <div style="position:absolute; bottom:8px; left:8px; background:rgba(0,0,0,0.75); color:#fff; font-size:${scaleMin(12)}px; font-weight:900; padding:3px 8px; border-radius:4px;">ANA SALON</div>
                </div>
                <div style="flex:0.8; display:flex; flex-direction:column; gap:${scaleMin(10)}px;">
                    <div class="photo-panel" style="flex:1; border-radius:10px; border:2.5px solid #cbd5e1; ${bgPos}; position:relative;">
                        <div style="position:absolute; bottom:8px; left:8px; background:rgba(0,0,0,0.75); color:#fff; font-size:${scaleMin(12)}px; font-weight:900; padding:3px 8px; border-radius:4px;">LAKE MUTFAK</div>
                    </div>
                    <div class="photo-panel" style="flex:1; border-radius:10px; border:2.5px solid #cbd5e1; ${bgPos}; position:relative;">
                        <div style="position:absolute; bottom:8px; left:8px; background:rgba(0,0,0,0.75); color:#fff; font-size:${scaleMin(12)}px; font-weight:900; padding:3px 8px; border-radius:4px;">MANZARA</div>
                    </div>
                </div>
            </div>

            <!-- 6'lı Veri Matrisi (Büyük Renkli Kutular) -->
            <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:${scaleMin(8)}px; height:14%;">
                <div style="background:#f1f5f9; border-radius:8px; padding:${scaleMin(8)}px; text-align:center;"><div style="font-size:${scaleMin(12)}px; color:#64748b; font-weight:700;">KAT</div><div style="font-size:${scaleMin(16.5)}px; font-weight:900; color:#0f172a;">3. Ara Kat</div></div>
                <div style="background:#f1f5f9; border-radius:8px; padding:${scaleMin(8)}px; text-align:center;"><div style="font-size:${scaleMin(12)}px; color:#64748b; font-weight:700;">NET M²</div><div style="font-size:${scaleMin(16.5)}px; font-weight:900; color:#0f172a;">155 m² Net</div></div>
                <div style="background:#f1f5f9; border-radius:8px; padding:${scaleMin(8)}px; text-align:center;"><div style="font-size:${scaleMin(12)}px; color:#64748b; font-weight:700;">ODA</div><div style="font-size:${scaleMin(16.5)}px; font-weight:900; color:#0f172a;">3+1 Ferah</div></div>
                <div style="background:#f1f5f9; border-radius:8px; padding:${scaleMin(8)}px; text-align:center;"><div style="font-size:${scaleMin(12)}px; color:#64748b; font-weight:700;">ISITMA</div><div style="font-size:${scaleMin(16.5)}px; font-weight:900; color:#0f172a;">Kombi</div></div>
                <div style="background:#f1f5f9; border-radius:8px; padding:${scaleMin(8)}px; text-align:center;"><div style="font-size:${scaleMin(12)}px; color:#64748b; font-weight:700;">OTOPARK</div><div style="font-size:${scaleMin(16.5)}px; font-weight:900; color:#0f172a;">Kapalı Alan</div></div>
                <div style="background:#f1f5f9; border-radius:8px; padding:${scaleMin(8)}px; text-align:center;"><div style="font-size:${scaleMin(12)}px; color:#64748b; font-weight:700;">DURUM</div><div style="font-size:${scaleMin(16.5)}px; font-weight:900; color:#16a34a;">Boş & Masrafsız</div></div>
            </div>

            <!-- Alt Fiyat ve İletişim Şeridi -->
            <div style="display:flex; justify-content:space-between; align-items:center; background:#0f172a; padding:${scaleMin(12)}px ${scaleMin(20)}px; border-radius:10px; margin-top:${scaleMin(8)}px;">
                <div style="background:#facc15; color:#000; font-size:${scaleMin(36)}px; font-weight:900; padding:${scaleMin(6)}px ${scaleMin(20)}px; border-radius:8px; display:inline-flex; align-items:center; gap:8px;">
                    <span>🏠</span><span class="editable-text">${price}</span>
                </div>
                <div style="text-align:right;">
                    <div style="color:#facc15; font-size:${scaleMin(13)}px; font-weight:800;">PAZARLIK PAYI VARDIR • HEMEN ARAYIN</div>
                    <div style="color:#ffffff; font-size:${scaleMin(18)}px; font-weight:900;"><span class="editable-text">${contact}</span></div>
                </div>
            </div>
        </div>`;
    }

    // ============================================================
    // 5. ŞABLON: Panoramik Alt Bant & Modern Glassmorphism
    // ============================================================
    else if (id === 'canvaK5') {
        canvaRenderLayer.innerHTML = `
        <div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#0f172a;font-family:'Montserrat',sans-serif;box-sizing:border-box;">
            <!-- Geniş Panoramik Fotoğraf -->
            <div class="photo-panel" style="width:100%; height:100%; ${bgPos};"></div>
            
            <!-- Üst Rozetler -->
            <div style="position:absolute; top:${scaleMin(24)}px; left:${scaleMin(24)}px; right:${scaleMin(24)}px; display:flex; justify-content:space-between; z-index:10;">
                <div style="background:rgba(15,23,42,0.88); backdrop-filter:blur(10px); color:#fff; font-size:${scaleMin(15)}px; font-weight:900; padding:${scaleMin(8)}px ${scaleMin(20)}px; border-radius:25px; border:1.5px solid rgba(255,255,255,0.25);">
                    ⭐ GÜNÜN FIRSAT İLANI
                </div>
                <div style="background:rgba(15,23,42,0.88); backdrop-filter:blur(10px); color:#38bdf8; font-size:${scaleMin(15)}px; font-weight:900; padding:${scaleMin(8)}px ${scaleMin(20)}px; border-radius:25px; border:1.5px solid rgba(255,255,255,0.25);">
                    🌊 KESİNTİSİZ ŞEHİR & GÖL MANZARASI
                </div>
            </div>

            <!-- Alt Yüzen Cam Panel (Glass Deck) -->
            <div style="position:absolute; bottom:${scaleMin(24)}px; left:${scaleMin(24)}px; right:${scaleMin(24)}px; background:rgba(15,23,42,0.92); backdrop-filter:blur(25px); border:1.5px solid rgba(255,255,255,0.25); border-radius:22px; padding:${scaleMin(22)}px ${scaleMin(28)}px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 25px 60px rgba(0,0,0,0.7); z-index:10;">
                <!-- Sol Başlık & Muhit -->
                <div style="flex:1.2;">
                    <div style="font-family:'Archivo Black',sans-serif; font-size:${scaleMin(38)}px; color:#ffffff; line-height:1.05;">
                        <span class="editable-text">PANORAMİK TERASLI 4+1 REZİDANS</span>
                    </div>
                    <div style="font-size:${scaleMin(16)}px; color:#cbd5e1; font-weight:700; margin-top:${scaleMin(6)}px;">
                        📍 <span class="editable-text">Bulvar Cepheli • A+ Yaşam Kompleksi</span>
                    </div>
                </div>

                <!-- Orta 4 Sayaç -->
                <div style="flex:1; display:flex; justify-content:space-around; border-left:1.5px solid rgba(255,255,255,0.2); border-right:1.5px solid rgba(255,255,255,0.2); padding:0 ${scaleMin(18)}px;">
                    <div style="text-align:center;"><div style="font-size:${scaleMin(24)}px; font-weight:900; color:#38bdf8;">240</div><div style="font-size:${scaleMin(12.5)}px; color:#e2e8f0; font-weight:800;">M² BRÜT</div></div>
                    <div style="text-align:center;"><div style="font-size:${scaleMin(24)}px; font-weight:900; color:#38bdf8;">4+1</div><div style="font-size:${scaleMin(12.5)}px; color:#e2e8f0; font-weight:800;">PLAN</div></div>
                    <div style="text-align:center;"><div style="font-size:${scaleMin(24)}px; font-weight:900; color:#38bdf8;">2</div><div style="font-size:${scaleMin(12.5)}px; color:#e2e8f0; font-weight:800;">BANYO</div></div>
                    <div style="text-align:center;"><div style="font-size:${scaleMin(24)}px; font-weight:900; color:#38bdf8;">0</div><div style="font-size:${scaleMin(12.5)}px; color:#e2e8f0; font-weight:800;">SIFIR BİNA</div></div>
                </div>

                <!-- Sağ Fiyat & İletişim Butonu -->
                <div style="flex:0.9; text-align:right;">
                    <div style="font-size:${scaleMin(38)}px; font-weight:900; color:#38bdf8; text-shadow:0 0 25px rgba(56,189,248,0.6);">
                        <span class="editable-text">${price}</span>
                    </div>
                    <div style="background:#38bdf8; color:#0f172a; font-size:${scaleMin(15)}px; font-weight:900; padding:${scaleMin(8)}px ${scaleMin(18)}px; border-radius:25px; display:inline-block; margin-top:${scaleMin(6)}px;">
                        <span class="editable-text">${contact}</span>
                    </div>
                </div>
            </div>
        </div>`;
    }

    // ============================================================
    // 6. ŞABLON: Çapraz Dinamik Kesim (Diagonal Geometric)
    // ============================================================
    else if (id === 'canvaK6') {
        canvaRenderLayer.innerHTML = `
        <div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#064e3b;font-family:'Montserrat',sans-serif;box-sizing:border-box;">
            <!-- Fotoğraf Katmanı (Çapraz Maskelenmiş) -->
            <div class="photo-panel" style="width:100%; height:100%; position:absolute; left:0; top:0; ${bgPos}; clip-path:polygon(30% 0, 100% 0, 100% 100%, 0% 100%);"></div>
            
            <!-- Sol Ön Yeşil Katman -->
            <div style="position:absolute; left:0; top:0; width:56%; height:100%; background:linear-gradient(135deg, #064e3b 0%, #022c22 100%); clip-path:polygon(0 0, 100% 0, 62% 100%, 0 100%); z-index:2;"></div>
            
            <!-- Sol İçerik -->
            <div style="position:absolute; left:${scaleMin(32)}px; top:${scaleMin(32)}px; bottom:${scaleMin(32)}px; width:48%; z-index:5; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <div style="background:#fbbf24; color:#000; font-size:${scaleMin(13)}px; font-weight:900; padding:5px 14px; border-radius:5px; display:inline-block; letter-spacing:1.5px;">
                        // 2026 PRESTİJ KOLEKSİYONU //
                    </div>
                    <div style="font-family:'Archivo Black',sans-serif; font-size:${scaleMin(48)}px; color:#ffffff; line-height:1.05; margin-top:${scaleMin(14)}px;">
                        <span class="editable-text">HAYALİNİZDEKİ MÜSTAKİL YAŞAM</span>
                    </div>
                    <div style="font-size:${scaleMin(17)}px; color:#a7f3d0; margin-top:${scaleMin(8)}px; font-weight:700;">
                        <span class="editable-text">Geniş Bahçeli, Şömineli ve Özel Tasarım Akıllı Villa</span>
                    </div>
                    
                    <!-- 4 Geometrik Madde -->
                    <div style="display:flex; flex-direction:column; gap:${scaleMin(12)}px; margin-top:${scaleMin(22)}px;">
                        <div style="display:flex; align-items:center; gap:10px; color:#fff; font-size:${scaleMin(17)}px; font-weight:800;"><span style="color:#fbbf24;">◆</span> 450 m² Özel Peyzajlı Bahçe</div>
                        <div style="display:flex; align-items:center; gap:10px; color:#fff; font-size:${scaleMin(17)}px; font-weight:800;"><span style="color:#fbbf24;">◆</span> Entegre Akıllı Ev Otomasyonu</div>
                        <div style="display:flex; align-items:center; gap:10px; color:#fff; font-size:${scaleMin(17)}px; font-weight:800;"><span style="color:#fbbf24;">◆</span> Yerden Isıtma & Döküm Şömine</div>
                        <div style="display:flex; align-items:center; gap:10px; color:#fff; font-size:${scaleMin(17)}px; font-weight:800;"><span style="color:#fbbf24;">◆</span> Kat Mülkiyetli & Masrafsız Sıfır</div>
                    </div>
                </div>

                <div>
                    <div style="background:#fbbf24; color:#000; font-size:${scaleMin(38)}px; font-weight:900; padding:${scaleMin(10)}px ${scaleMin(22)}px; border-radius:10px; display:inline-block; box-shadow:0 8px 25px rgba(0,0,0,0.6);">
                        <span class="editable-text">${price}</span>
                    </div>
                    <div style="margin-top:${scaleMin(12)}px; color:#ffffff; font-size:${scaleMin(17)}px; font-weight:900;">
                        <span class="editable-text">${contact}</span>
                    </div>
                </div>
            </div>
        </div>`;
    }

    // ============================================================
    // 7. ŞABLON: Arsa & İmar Teknik Blueprint (Ada / Parsel Planı)
    // ============================================================
    else if (id === 'canvaK7') {
        canvaRenderLayer.innerHTML = `
        <div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#0a192f;font-family:'Space Grotesk',sans-serif;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;padding:${scaleMin(24)}px;">
            
            <!-- Üst Teknik Başlık -->
            <div style="border-bottom:2.5px solid #38bdf8; padding-bottom:${scaleMin(12)}px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-size:${scaleMin(14)}px; color:#38bdf8; letter-spacing:2px; font-weight:900;">📐 RESMİ İMAR & KADASTRAL DOSYA</div>
                    <div style="font-family:'Archivo Black',sans-serif; font-size:${scaleMin(40)}px; color:#ffffff; line-height:1.05; margin-top:4px;">
                        <span class="editable-text">YATIRIMLIK TİCARİ + KONUT İMARLI PARSEL</span>
                    </div>
                </div>
                <div style="background:rgba(56,189,248,0.18); border:1.5px solid #38bdf8; border-radius:8px; padding:${scaleMin(8)}px ${scaleMin(16)}px; text-align:right;">
                    <div style="font-size:${scaleMin(11)}px; color:#cbd5e1; font-weight:700;">LOKASYON:</div>
                    <div style="font-size:${scaleMin(16)}px; font-weight:900; color:#38bdf8;"><span class="editable-text">Gelişen Sanayi & Lojistik Aksı</span></div>
                </div>
            </div>

            <!-- Orta Bölüm: CAD Çerçeveli Fotoğraf + Teknik Tablo -->
            <div style="display:flex; gap:${scaleMin(18)}px; height:62%; margin:${scaleMin(10)}px 0;">
                <!-- Sol Fotoğraf -->
                <div class="photo-panel" style="flex:1.1; height:100%; border:2.5px solid #38bdf8; border-radius:10px; ${bgPos}; position:relative;">
                    <div style="position:absolute; top:8px; left:8px; color:#38bdf8; font-size:${scaleMin(18)}px;">+</div>
                    <div style="position:absolute; top:8px; right:8px; color:#38bdf8; font-size:${scaleMin(18)}px;">+</div>
                    <div style="position:absolute; bottom:8px; left:8px; color:#38bdf8; font-size:${scaleMin(18)}px;">+</div>
                    <div style="position:absolute; bottom:8px; right:8px; color:#38bdf8; font-size:${scaleMin(18)}px;">+</div>
                </div>

                <!-- Sağ Teknik Çizelge -->
                <div style="flex:0.9; background:rgba(15,23,42,0.85); border:1.5px solid rgba(56,189,248,0.35); border-radius:10px; padding:${scaleMin(16)}px; display:flex; flex-direction:column; justify-content:space-between;">
                    <div style="font-size:${scaleMin(16)}px; font-weight:900; color:#38bdf8; border-bottom:1.5px dashed #38bdf8; padding-bottom:8px;">TEKNİK İMAR BİLGİLERİ</div>
                    
                    <div style="display:flex; flex-direction:column; gap:${scaleMin(10)}px;">
                        <div style="display:flex; justify-content:space-between; font-size:${scaleMin(15)}px;"><span style="color:#94a3b8; font-weight:700;">📌 ADA / PARSEL:</span><span style="color:#fff; font-weight:900;">204 Ada / 12 Parsel</span></div>
                        <div style="display:flex; justify-content:space-between; font-size:${scaleMin(15)}px;"><span style="color:#94a3b8; font-weight:700;">📐 YÜZÖLÇÜMÜ:</span><span style="color:#fff; font-weight:900;">2.450 m² Müstakil</span></div>
                        <div style="display:flex; justify-content:space-between; font-size:${scaleMin(15)}px;"><span style="color:#94a3b8; font-weight:700;">🏗️ İMAR DURUMU:</span><span style="color:#fff; font-weight:900;">Emsal: 1.60 • Hmax: Serbest</span></div>
                        <div style="display:flex; justify-content:space-between; font-size:${scaleMin(15)}px;"><span style="color:#94a3b8; font-weight:700;">🛣️ YOLA CEPHE:</span><span style="color:#fff; font-weight:900;">35 Metre Ana Bulvara Cephe</span></div>
                        <div style="display:flex; justify-content:space-between; font-size:${scaleMin(15)}px;"><span style="color:#94a3b8; font-weight:700;">⚡ ALTYAPI:</span><span style="color:#10b981; font-weight:900;">Elektrik, Su, Fiber Hazır</span></div>
                        <div style="display:flex; justify-content:space-between; font-size:${scaleMin(15)}px;"><span style="color:#94a3b8; font-weight:700;">📑 TAPU TÜRÜ:</span><span style="color:#10b981; font-weight:900;">Sorunsuz Tek Tapu Devir</span></div>
                    </div>

                    <div style="background:rgba(56,189,248,0.12); border-radius:6px; padding:${scaleMin(8)}px; text-align:center; font-size:${scaleMin(13)}px; color:#38bdf8; font-weight:900;">
                        ✓ HEMEN İNŞAATA UYGUN YATIRIMLIK ARSA
                    </div>
                </div>
            </div>

            <!-- Alt Fiyat ve İletişim Şeridi -->
            <div style="background:#0284c7; color:#fff; border-radius:10px; padding:${scaleMin(12)}px ${scaleMin(22)}px; display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:${scaleMin(36)}px; font-weight:900;">
                    <span class="editable-text">${price}</span>
                </div>
                <div style="font-size:${scaleMin(17)}px; font-weight:900; letter-spacing:1px;">
                    <span class="editable-text">${contact}</span>
                </div>
            </div>
        </div>`;
    }

    // ============================================================
    // 8. ŞABLON: Penthouse Gece Rezidans (Ultra Lüks Koyu Tema)
    // ============================================================
    else if (id === 'canvaK8') {
        canvaRenderLayer.innerHTML = `
        <div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#08080a;font-family:'Montserrat',sans-serif;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;padding:${scaleMin(30)}px;">
            
            <!-- Üst Minimalist Lüks Başlık -->
            <div style="text-align:center;">
                <div style="color:#e5c07b; font-size:${scaleMin(14)}px; letter-spacing:6px; text-transform:uppercase; font-weight:800;">
                    THE RESIDENCE COLLECTION • SKY VILLA
                </div>
                <div style="font-family:'Archivo Black',sans-serif; font-size:${scaleMin(44)}px; color:#ffffff; line-height:1.05; margin-top:${scaleMin(8)}px;">
                    <span class="editable-text">KULE REZİDANS PENTHOUSE SUITE</span>
                </div>
                <div style="color:#cbd5e1; font-size:${scaleMin(16)}px; margin-top:4px; letter-spacing:2px; font-weight:600;">
                    <span class="editable-text">Şehrin Işıkları Ayaklarınızın Altında • 36. Kat Zirve Yaşamı</span>
                </div>
            </div>

            <!-- Orta Bölüm: Kemerli Lüks Fotoğraf + İkincil Yuvarlak Detay -->
            <div style="height:50%; position:relative; margin:${scaleMin(10)}px 0;">
                <!-- Kemerli Ana Foto -->
                <div class="photo-panel" style="width:100%; height:100%; border-radius:${scaleMin(90)}px ${scaleMin(90)}px 14px 14px; border:2.5px solid #e5c07b; box-shadow:0 20px 50px rgba(0,0,0,0.85); ${bgPos};"></div>
                <!-- Yuvarlak İkincil Detay Foto -->
                <div class="photo-panel" style="position:absolute; bottom:-${scaleMin(18)}px; right:${scaleMin(24)}px; width:${scaleMin(100)}px; height:${scaleMin(100)}px; border-radius:50%; border:3.5px solid #e5c07b; box-shadow:0 10px 30px rgba(0,0,0,0.9); ${bgPos};"></div>
            </div>

            <!-- 3 Lüks Metrik Çubuğu -->
            <div style="display:flex; justify-content:space-between; gap:${scaleMin(16)}px;">
                <div style="flex:1; background:#18181b; border:1px solid #3f3f46; border-radius:10px; padding:${scaleMin(10)}px ${scaleMin(14)}px; text-align:center;">
                    <div style="color:#e5c07b; font-size:${scaleMin(12)}px; font-weight:800;">MANZARA</div>
                    <div style="color:#fff; font-size:${scaleMin(16)}px; font-weight:900; margin-top:2px;">360° Kesintisiz</div>
                </div>
                <div style="flex:1; background:#18181b; border:1px solid #3f3f46; border-radius:10px; padding:${scaleMin(10)}px ${scaleMin(14)}px; text-align:center;">
                    <div style="color:#e5c07b; font-size:${scaleMin(12)}px; font-weight:800;">DONANIM</div>
                    <div style="color:#fff; font-size:${scaleMin(16)}px; font-weight:900; margin-top:2px;">A+ Akıllı Otomasyon</div>
                </div>
                <div style="flex:1; background:#18181b; border:1px solid #3f3f46; border-radius:10px; padding:${scaleMin(10)}px ${scaleMin(14)}px; text-align:center;">
                    <div style="color:#e5c07b; font-size:${scaleMin(12)}px; font-weight:800;">AYRICALIK</div>
                    <div style="color:#fff; font-size:${scaleMin(16)}px; font-weight:900; margin-top:2px;">7/24 Concierge & SPA</div>
                </div>
            </div>

            <!-- Alt Fiyat ve İletişim -->
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1.5px solid #27272a; padding-top:${scaleMin(14)}px;">
                <div style="font-size:${scaleMin(40)}px; font-weight:900; color:#e5c07b; text-shadow:0 0 25px rgba(229,192,123,0.5);">
                    <span class="editable-text">${price}</span>
                </div>
                <div style="background:#e5c07b; color:#000; font-size:${scaleMin(16)}px; font-weight:900; padding:${scaleMin(8)}px ${scaleMin(22)}px; border-radius:25px;">
                    <span class="editable-text">${contact}</span>
                </div>
            </div>
        </div>`;
    }

    // ============================================================
    // 9. ŞABLON: İskandinav Villa & Müstakil Yaşam
    // ============================================================
    else if (id === 'canvaK9') {
        canvaRenderLayer.innerHTML = `
        <div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#f6f4ee;font-family:'Outfit',sans-serif;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;padding:${scaleMin(28)}px;">
            
            <!-- Üst İnce Başlık -->
            <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                <div>
                    <div style="color:#4a5d4e; font-size:${scaleMin(15)}px; font-weight:900; letter-spacing:2px;">DOĞAL YAŞAM & ÇAĞDAŞ MİMARİ</div>
                    <div style="font-family:'Archivo Black',sans-serif; font-size:${scaleMin(44)}px; color:#1c1917; line-height:1.05; margin-top:4px;">
                        <span class="editable-text">ORMAN CEPHELİ MÜSTAKİL TAŞ VİLLA</span>
                    </div>
                </div>
                <div style="font-size:${scaleMin(17)}px; color:#57534e; font-weight:800;">
                    📍 <span class="editable-text">Huzurlu Muhit • Çam Ormanı Bitişiğinde</span>
                </div>
            </div>

            <!-- Orta Bölüm: Polaroid Foto + Numaralı Avantajlar -->
            <div style="display:flex; gap:${scaleMin(24)}px; height:58%; margin:${scaleMin(12)}px 0;">
                <!-- Sol Polaroid Foto -->
                <div style="flex:1.1; background:#ffffff; padding:${scaleMin(12)}px ${scaleMin(12)}px ${scaleMin(26)}px ${scaleMin(12)}px; border-radius:12px; box-shadow:0 15px 35px rgba(0,0,0,0.1); display:flex; flex-direction:column;">
                    <div class="photo-panel" style="flex:1; border-radius:8px; ${bgPos};"></div>
                    <div style="font-size:${scaleMin(14)}px; color:#57534e; text-align:center; font-style:italic; font-weight:700; margin-top:${scaleMin(8)}px;">Müstakil Doğal Yaşam</div>
                </div>

                <!-- Sağ Numaralı 3 Avantaj -->
                <div style="flex:0.9; display:flex; flex-direction:column; justify-content:space-around;">
                    <div>
                        <div style="font-size:${scaleMin(16)}px; font-weight:900; color:#4a5d4e;">01 / 600 M² PEYZAJLI MÜSTAKİL BAHÇE</div>
                        <div style="font-size:${scaleMin(14)}px; color:#44403c; font-weight:600; margin-top:3px; line-height:1.35;">Zeytin ve çam ağaçlarıyla çevrili, otomatik sulamalı özel yeşil vaha.</div>
                    </div>
                    <div>
                        <div style="font-size:${scaleMin(16)}px; font-weight:900; color:#4a5d4e;">02 / DOĞAL MASİF AHŞAP & TAŞ İŞÇİLİĞİ</div>
                        <div style="font-size:${scaleMin(14)}px; color:#44403c; font-weight:600; margin-top:3px; line-height:1.35;">İthal şömine, 3.40m yüksek tavan ve geniş cam cephe ferahlığı.</div>
                    </div>
                    <div>
                        <div style="font-size:${scaleMin(16)}px; font-weight:900; color:#4a5d4e;">03 / TAM GÜVENLİKLİ & MÜSTAKİL GİRİŞ</div>
                        <div style="font-size:${scaleMin(14)}px; color:#44403c; font-weight:600; margin-top:3px; line-height:1.35;">Şehrin gürültüsünden uzak, tam bağımsız otoparklı seçkin villa.</div>
                    </div>
                </div>
            </div>

            <!-- Alt Fiyat ve İletişim -->
            <div style="background:#3d4a3e; color:#ffffff; border-radius:14px; padding:${scaleMin(14)}px ${scaleMin(24)}px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-size:${scaleMin(12)}px; color:#e7e5e4; font-weight:700;">SATIŞ BEDELİ</div>
                    <div style="font-size:${scaleMin(36)}px; font-weight:900; color:#fef08a;"><span class="editable-text">${price}</span></div>
                </div>
                <div style="text-align:right; font-size:${scaleMin(17)}px; font-weight:900;">
                    <span class="editable-text">${contact}</span>
                </div>
            </div>
        </div>`;
    }

    // ============================================================
    // 10. ŞABLON: Lansman & Proje Ön Satış Broşürü
    // ============================================================
    else if (id === 'canvaK10') {
        canvaRenderLayer.innerHTML = `
        <div class="cvr-base" style="width:100%;height:100%;position:relative;overflow:hidden;background:#ffffff;font-family:'Montserrat',sans-serif;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;padding:${scaleMin(20)}px;">
            
            <!-- Üst Lansman Vurgusu -->
            <div style="background:linear-gradient(90deg, #b91c1c, #991b1b); color:#fff; padding:${scaleMin(10)}px ${scaleMin(20)}px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 4px 14px rgba(185,28,28,0.4);">
                <span style="font-size:${scaleMin(16)}px; font-weight:900;">🚀 LANSMANA ÖZEL İLK 10 DAİREDE %25 PEŞİN İNDİRİMİ!</span>
                <span style="font-size:${scaleMin(13)}px; font-weight:900; background:#facc15; color:#000; padding:3px 10px; border-radius:6px;">ÖN TALEP</span>
            </div>

            <!-- Proje İsmi -->
            <div style="margin-top:${scaleMin(8)}px;">
                <div style="font-family:'Archivo Black',sans-serif; font-size:${scaleMin(42)}px; color:#0f172a; line-height:1.05;">
                    <span class="editable-text">VADİ REZİDANS & YAŞAM MERKEZİ</span>
                </div>
                <div style="font-size:${scaleMin(16)}px; color:#475569; font-weight:700; margin-top:3px;">
                    📍 <span class="editable-text">Yeni Nesil Mimari • Esnek Ödeme Seçenekleriyle Satışta</span>
                </div>
            </div>

            <!-- Orta Render Fotoğrafı -->
            <div class="photo-panel" style="width:100%; height:42%; border-radius:10px; border:2.5px solid #cbd5e1; ${bgPos};"></div>

            <!-- İki Kanatlı Bilgi Kartları: Ödeme Planı + Sosyal Tesisler -->
            <div style="display:flex; gap:${scaleMin(14)}px; height:20%;">
                <!-- Sol Kart: Ödeme Planı -->
                <div style="flex:1; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; padding:${scaleMin(10)}px ${scaleMin(14)}px; display:flex; flex-direction:column; justify-content:space-around;">
                    <div style="font-size:${scaleMin(15)}px; font-weight:900; color:#b91c1c;">💳 ESNEK ÖDEME PLANI</div>
                    <div style="font-size:${scaleMin(13.5)}px; color:#1e293b; font-weight:700;">• %30 Peşinat ile Başlayan Fırsat</div>
                    <div style="font-size:${scaleMin(13.5)}px; color:#1e293b; font-weight:700;">• 36 Ay Sıfır Faiz Taksit İmkanı</div>
                    <div style="font-size:${scaleMin(13.5)}px; color:#1e293b; font-weight:700;">• Daire ve Araç Takas Desteği</div>
                </div>

                <!-- Sağ Kart: Sosyal Tesisler -->
                <div style="flex:1; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; padding:${scaleMin(10)}px ${scaleMin(14)}px; display:flex; flex-direction:column; justify-content:space-around;">
                    <div style="font-size:${scaleMin(15)}px; font-weight:900; color:#0284c7;">🏊 360° AYRICALIKLI YAŞAM</div>
                    <div style="font-size:${scaleMin(13.5)}px; color:#1e293b; font-weight:700;">• Açık & Kapalı Yüzme Havuzları</div>
                    <div style="font-size:${scaleMin(13.5)}px; color:#1e293b; font-weight:700;">• Fitness, SPA, Hamam & Sauna</div>
                    <div style="font-size:${scaleMin(13.5)}px; color:#1e293b; font-weight:700;">• 7/24 Güvenlik & Kapalı Otopark</div>
                </div>
            </div>

            <!-- Alt Fiyat ve Lansman İletişim -->
            <div style="background:#0f172a; color:#fff; border-radius:10px; padding:${scaleMin(12)}px ${scaleMin(20)}px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-size:${scaleMin(11)}px; color:#94a3b8; font-weight:700;">LANSMAN BAŞLANGIÇ FİYATI</div>
                    <div style="font-size:${scaleMin(36)}px; font-weight:900; color:#facc15;"><span class="editable-text">${price}</span></div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:${scaleMin(13)}px; color:#38bdf8; font-weight:800;">PROJE SATIŞ OFİSİ</div>
                    <div style="font-size:${scaleMin(17)}px; font-weight:900;"><span class="editable-text">${contact}</span></div>
                </div>
            </div>
        </div>`;
    }

    // Dinamik Foto ve Metin Düzenleme Olaylarını Bağla
    if (typeof enablePhotoDrag === 'function') {
        canvaRenderLayer.querySelectorAll('.photo-panel').forEach(el => enablePhotoDrag(el));
    }
    if (typeof enableInlineEdit === 'function') {
        canvaRenderLayer.querySelectorAll('.editable-text').forEach(el => enableInlineEdit(el));
    }
    
    requestAnimationFrame(() => {
        if(typeof redrawAll === 'function') redrawAll();
    });
}

// Sayfa yüklendiğinde otomatik başlat
setTimeout(_kalipInit, 300);
