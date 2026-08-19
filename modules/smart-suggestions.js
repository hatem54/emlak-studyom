/**
 * ============================================
 * SMART SUGGESTIONS & BADGE GENERATOR
 * modules/smart-suggestions.js
 * ============================================
 */

window.smartBadges = [];
window.smartMatchedCallouts = [];
window.smartMatchedIcons = [];
window.smartDefaultFramedText = '';

// ==================== 1. AKILLI ANALİZ & ÖNERİ ÜRETİMİ ====================
window.generateSmartSuggestions = function(data = {}, rawText = '') {
    window.smartBadges = [];
    window.smartMatchedCallouts = [];
    window.smartMatchedIcons = [];

    rawText = (rawText || '').toLowerCase();

    // 1.1 VURGU ROZETLERİNİ OLUŞTUR
    // Fiyat
    const priceVal = (data.price || document.getElementById('priceInput')?.value || '').trim();
    if (priceVal && priceVal !== '0') {
        const formattedPrice = priceVal.includes('TL') || priceVal.includes('₺') ? priceVal : priceVal + ' TL';
        window.smartBadges.push({ text: `💰 ${formattedPrice}`, category: 'price', style: 'gold' });
    }

    // m² Fiyatı
    const m2PriceVal = (data.m2Price || '').trim();
    if (m2PriceVal) {
        window.smartBadges.push({ text: `🏷️ ${m2PriceVal}`, category: 'm2price', style: 'modern' });
    }

    // Konum (İl / İlçe / Mahalle)
    if (data.location && typeof data.location === 'string' && data.location.trim()) {
        window.smartBadges.push({ text: `📍 ${data.location.trim()}`, category: 'location', style: 'modern' });
    } else {
        const locParts = [];
        if (data.city) locParts.push(data.city);
        if (data.district) locParts.push(data.district);
        if (data.neighborhood && locParts.length < 2) locParts.push(data.neighborhood);
        if (locParts.length > 0) {
            window.smartBadges.push({ text: `📍 ${locParts.join(' / ')}`, category: 'location', style: 'modern' });
        }
    }

    // Alan (m²)
    const sizeVal = (data.size || document.getElementById('sizeInput')?.value || document.getElementById('araziSizeInput')?.value || '').trim();
    if (sizeVal) {
        const formattedSize = sizeVal.includes('m²') ? sizeVal : sizeVal + ' m²';
        window.smartBadges.push({ text: `📐 ${formattedSize}`, category: 'size', style: 'modern' });
    }

    // Oda Sayısı
    const roomsVal = (data.rooms || document.getElementById('roomsInput')?.value || '').trim();
    if (roomsVal) {
        window.smartBadges.push({ text: `🏠 ${roomsVal} Daire`, category: 'rooms', style: 'modern' });
    }

    // İmar Durumu / Arazi Tipi
    const imarVal = (data.imar || document.getElementById('imarInput')?.value || '').trim();
    if (imarVal) {
        window.smartBadges.push({ text: `🌾 İmar: ${imarVal}`, category: 'imar', style: 'emerald' });
    }

    // Ada & Parsel
    const adaVal = (data.ada || '').trim();
    const parselVal = (data.parsel || '').trim();
    if (adaVal && parselVal) {
        window.smartBadges.push({ text: `🗺️ Ada: ${adaVal} | Parsel: ${parselVal}`, category: 'parsel', style: 'modern' });
    } else if (data.adaParsel || document.getElementById('adaParselInput')?.value) {
        const ap = (data.adaParsel || document.getElementById('adaParselInput').value).trim();
        if (ap) window.smartBadges.push({ text: `🗺️ Ada/Parsel: ${ap}`, category: 'parsel', style: 'modern' });
    }

    // Tapu Durumu
    const tapuVal = (data.tapu || document.getElementById('tapuInput')?.value || '').trim();
    if (tapuVal) {
        window.smartBadges.push({ text: `🔑 ${tapuVal}`, category: 'tapu', style: 'gold' });
    }

    // Kat Bilgisi
    const floorVal = (data.floor || document.getElementById('floorInput')?.value || '').trim();
    if (floorVal) {
        window.smartBadges.push({ text: `🏢 ${floorVal}`, category: 'floor', style: 'modern' });
    }

    // Isıtma
    const heatingVal = (data.heating || document.getElementById('heatingInput')?.value || '').trim();
    if (heatingVal && !heatingVal.toLowerCase().includes('yok')) {
        window.smartBadges.push({ text: `🔥 ${heatingVal}`, category: 'heating', style: 'modern' });
    }

    // Metin İçinden Akıllı Özellik Taraması
    if (rawText.includes('kredi') && (rawText.includes('uygun') || rawText.includes('evet'))) {
        window.smartBadges.push({ text: `💳 Krediye Uygun`, category: 'credit', style: 'emerald' });
    }
    if (rawText.includes('takas') && (rawText.includes('olur') || rawText.includes('evet') || rawText.includes('uygun'))) {
        window.smartBadges.push({ text: `🔄 Takasa Uygun`, category: 'trade', style: 'modern' });
    }
    if (rawText.includes('deniz manzar') || rawText.includes('deniz gör')) {
        window.smartBadges.push({ text: `🌅 Deniz Manzaralı`, category: 'view', style: 'blue' });
    }
    if (rawText.includes('doğa manzar') || rawText.includes('orman manzar')) {
        window.smartBadges.push({ text: `🌲 Doğa Manzaralı`, category: 'view', style: 'emerald' });
    }
    if (rawText.includes('havuz') || rawText.includes('yüzme')) {
        window.smartBadges.push({ text: `🏊 Yüzme Havuzlu`, category: 'pool', style: 'blue' });
    }
    if (rawText.includes('otopark') || rawText.includes('garaj')) {
        window.smartBadges.push({ text: `🚗 Otoparklı`, category: 'parking', style: 'modern' });
    }
    if (rawText.includes('asansör')) {
        window.smartBadges.push({ text: `🛗 Asansörlü`, category: 'elevator', style: 'modern' });
    }
    if (rawText.includes('balkon') || rawText.includes('teras')) {
        window.smartBadges.push({ text: `☕ Geniş Balkonlu`, category: 'balcony', style: 'modern' });
    }
    if (rawText.includes('sıfır') || rawText.includes('yeni yapı') || rawText.includes('0 bina')) {
        window.smartBadges.push({ text: `✨ Sıfır / Yeni Bina`, category: 'new', style: 'gold' });
    }
    if (rawText.includes('kira getir') || rawText.includes('yüksek kira')) {
        window.smartBadges.push({ text: `📈 Yüksek Kira Getirili`, category: 'rent', style: 'emerald' });
    }
    if (rawText.includes('yatırım') || rawText.includes('kelepir') || rawText.includes('fırsat')) {
        window.smartBadges.push({ text: `🎯 Yatırımlık Fırsat`, category: 'deal', style: 'rose' });
    }

    // 1.2 EŞLEŞEN CALLOUT'LARI SEÇ
    if (typeof CALLOUT_LIBRARY !== 'undefined') {
        const matched = [];
        if (priceVal && CALLOUT_LIBRARY['fiyat']) matched.push(...CALLOUT_LIBRARY['fiyat'].items.slice(0, 3));
        if (sizeVal && CALLOUT_LIBRARY['metrekare']) matched.push(...CALLOUT_LIBRARY['metrekare'].items.slice(0, 2));
        if (roomsVal && CALLOUT_LIBRARY['oda']) matched.push(...CALLOUT_LIBRARY['oda'].items.slice(0, 2));
        if (imarVal && CALLOUT_LIBRARY['arsa']) matched.push(...CALLOUT_LIBRARY['arsa'].items.slice(0, 2));
        if (tapuVal && CALLOUT_LIBRARY['tapu']) matched.push(...CALLOUT_LIBRARY['tapu'].items.slice(0, 2));
        if (CALLOUT_LIBRARY['ozellik']) matched.push(...CALLOUT_LIBRARY['ozellik'].items.slice(0, 2));
        window.smartMatchedCallouts = matched.slice(0, 6);
    }

    // 1.3 EŞLEŞEN İKONLARI SEÇ
    const icons = ['🏠', '📐', '💰', '📍', '🔑'];
    if (imarVal || rawText.includes('arsa') || rawText.includes('tarla')) icons.push('🌳', '🌾', '🚜');
    if (rawText.includes('havuz')) icons.push('🏊');
    if (rawText.includes('otopark') || rawText.includes('garaj')) icons.push('🚗');
    if (rawText.includes('deniz')) icons.push('🌅');
    if (rawText.includes('asansör')) icons.push('🛗');
    if (rawText.includes('ısıtma') || rawText.includes('kombi') || rawText.includes('doğalgaz')) icons.push('🔥');
    if (rawText.includes('kredi')) icons.push('💳');
    window.smartMatchedIcons = [...new Set(icons)];

    // 1.4 İLAVE BİLGİLER / VARSAYILAN ÇERÇEVELİ ŞABLON METNİ OLUŞTUR
    const extraLines = [];
    if (floorVal) extraLines.push(`🏢 ${floorVal}`);
    if (heatingVal && !heatingVal.toLowerCase().includes('yok')) extraLines.push(`🔥 ${heatingVal}`);
    if (data.cephe) extraLines.push(`🛣️ ${data.cephe}`);
    if (data.age) extraLines.push(`🏗️ ${data.age}`);
    if (rawText.includes('balkon') || rawText.includes('teras')) extraLines.push(`☕ Geniş Balkonlu`);
    if (rawText.includes('otopark') || rawText.includes('garaj')) extraLines.push(`🚗 Otopark Alanı`);
    if (rawText.includes('asansör')) extraLines.push(`🛗 Asansörlü Bina`);
    if (rawText.includes('havuz')) extraLines.push(`🏊 Yüzme Havuzu`);
    if (rawText.includes('site')) extraLines.push(`🛡️ Güvenlikli Site İçi`);
    if (rawText.includes('kredi') && (rawText.includes('uygun') || rawText.includes('evet'))) extraLines.push(`💳 Krediye Uygun`);
    if (rawText.includes('takas') && (rawText.includes('olur') || rawText.includes('evet') || rawText.includes('uygun'))) extraLines.push(`🔄 Takasa Açık`);
    if (data.aidat) extraLines.push(`💵 Aidat: ${data.aidat}`);
    if (data.kullanim) extraLines.push(`🔑 ${data.kullanim}`);

    if (extraLines.length === 0) {
        extraLines.push('🏢 4. Kat | Çift Asansörlü');
        extraLines.push('🔥 Doğalgaz Kombi Isıtma');
        extraLines.push('☕ Geniş Balkon & Manzara');
        extraLines.push('🚗 Kapalı Otopark');
        extraLines.push('💳 Krediye ve Takasa Uygun');
    }

    window.smartDefaultFramedText = extraLines.join('\n');

    // 1.5 ARAYÜZÜ YENİLE VE PANELİ GÖSTER
    window.renderSmartSuggestionsUI();

    // Paneli otomatik açık hale getir
    const body = document.getElementById('smartSuggestionsBody');
    const chevron = document.getElementById('smartSuggestionsChevron');
    if (body) {
        body.style.display = 'block';
        if (chevron) chevron.style.transform = 'rotate(180deg)';
    }
};

// ==================== 2. ARAYÜZ RENDER FONKSİYONU ====================
window.renderSmartSuggestionsUI = function() {
    const body = document.getElementById('smartSuggestionsBody');
    const badgeCount = document.getElementById('smartSuggestionsBadge');
    
    // Başlık sayacını daima güncelle
    const totalCount = ((window.smartBadges && Array.isArray(window.smartBadges)) ? window.smartBadges.length : 0) + 
                       ((window.smartMatchedCallouts && Array.isArray(window.smartMatchedCallouts)) ? window.smartMatchedCallouts.length : 0);
    if (badgeCount) {
        badgeCount.textContent = `${totalCount} Öneri`;
        if (totalCount > 0) {
            badgeCount.classList.add('pulse');
        } else {
            badgeCount.classList.remove('pulse');
        }
    }

    if (!body) return;

    if (totalCount === 0) {
        body.innerHTML = `
            <div style="padding:14px; text-align:center; color:#94a3b8; font-size:12px; line-height:1.5;">
                <span>💡 İlan metnini yapıştırıp <strong>"🤖 Metni Süz"</strong> butonuna bastığınızda, ilana özel rozetler, eşleşen grafik rozetler ve ikonlar burada otomatik listelenir.</span>
            </div>
        `;
        return;
    }

    let html = '';

    // Bölüm 1: 🏷️ İLANA ÖZEL VURGU ROZETLERİ
    if (window.smartBadges && window.smartBadges.length > 0) {
        html += `
            <div class="smart-sub-section">
                <div class="smart-sub-title">
                    <span>🏷️ İlana Özel Vurgu Rozetleri</span>
                    <span style="font-size:10px; color:#94a3b8;">Tıkla Tuvale Ekle</span>
                </div>
                <div class="smart-badges-grid">
        `;

        window.smartBadges.forEach((b, idx) => {
            html += `
                <div class="smart-badge-pill ${b.style || 'modern'}" onclick="window.addSmartBadgeToCanvas(${idx})" title="Tuvale Çerçeveli Rozet Olarak Ekle">
                    <span class="badge-text">${b.text}</span>
                    <button type="button" class="badge-del-btn" onclick="event.stopPropagation(); window.removeSmartBadge(${idx});" title="Listeden Kaldır">✕</button>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    // Bölüm 2: 🌟 EŞLEŞEN CALLOUT'LAR
    if (window.smartMatchedCallouts && window.smartMatchedCallouts.length > 0) {
        html += `
            <div class="smart-sub-section" style="margin-top: 10px;">
                <div class="smart-sub-title">
                    <span>🌟 Eşleşen Rozet Kartları</span>
                    <span style="font-size:10px; color:#94a3b8;">Hazır Grafik</span>
                </div>
                <div class="smart-callouts-scroll">
        `;

        window.smartMatchedCallouts.forEach((item, idx) => {
            html += `
                <div class="smart-callout-mini-card" onclick="if(window.addSVGCalloutToCanvas) window.addSVGCalloutToCanvas(window.smartMatchedCallouts[${idx}])" title="${item.name} Tuvale Ekle">
                    <div class="mini-svg-wrap">${item.svg}</div>
                    <span class="mini-card-name">${item.name}</span>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    // Bölüm 3: 🎯 İLGİLİ İKONLAR
    if (window.smartMatchedIcons && window.smartMatchedIcons.length > 0) {
        html += `
            <div class="smart-sub-section" style="margin-top: 10px;">
                <div class="smart-sub-title">
                    <span>🎯 İlgili İkonlar</span>
                    <span style="font-size:10px; color:#94a3b8;">Hızlı İkon</span>
                </div>
                <div class="smart-icons-row">
        `;

        window.smartMatchedIcons.forEach(iconChar => {
            html += `
                <button type="button" class="smart-icon-btn" onclick="if(window.addIcon) window.addIcon('${iconChar}')" title="${iconChar} İkonunu Ekle">
                    ${iconChar}
                </button>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    // Bölüm 4: ✍️ ÖZEL ÇERÇEVELİ YAZI / İLAVE BİLGİ ŞABLONU EKLEME ALANI
    const defaultTextVal = window.smartDefaultFramedText || '🏢 4. Kat | Çift Asansörlü\n🔥 Doğalgaz Kombi Isıtma\n☕ Geniş Balkon & Manzara\n🚗 Kapalı Otopark\n💳 Krediye ve Takasa Uygun';

    html += `
        <div class="smart-sub-section custom-badge-builder" style="margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px;">
            <div class="smart-sub-title">
                <span>✍️ Çerçeveli Yazı / İlave Bilgiler Şablonu</span>
                <span style="font-size:10.5px; color:#38bdf8; cursor:pointer;" onclick="document.getElementById('customSmartTextInput').value=''; document.getElementById('customSmartTextInput').focus();">🗑️ Temizle</span>
            </div>
            <div class="custom-badge-inputs">
                <textarea id="customSmartTextInput" rows="4" placeholder="İlave bilgilerinizi satır satır yazın veya yapıştırın..." style="width:100%; height:90px; resize:vertical; line-height:1.5; font-size:12px; font-family:'Plus Jakarta Sans','Inter',sans-serif; background:#1e293b; color:#f8fafc; border:1px solid #334155; border-radius:8px; padding:8px 10px; box-sizing:border-box; outline:none;">${defaultTextVal}</textarea>
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px; font-size:10.5px; color:#94a3b8;">
                    <span>💡 Beğenmezseniz (Ctrl+A / Ctrl+V) ile düzenleyip tek tıkla ekleyin.</span>
                </div>

                <div style="display:flex; gap:6px; margin-top:8px;">
                    <select id="customSmartStyleSelect" style="flex:1; background:#1e293b; color:#cbd5e1; border:1px solid #334155; border-radius:6px; padding:7px 8px; font-size:11.5px;">
                        <option value="modern">💎 Modern Koyu Cam</option>
                        <option value="gold">🏆 Gold / Lüks Altın</option>
                        <option value="blue">⚡ Mavi Neon</option>
                        <option value="emerald">🌿 Zümrüt Yeşili</option>
                        <option value="rose">🔥 Fırsat Kırmızı</option>
                        <option value="white">⚪ Sade Beyaz</option>
                    </select>
                    <button type="button" class="btn-action" onclick="window.addDirectFramedTextFromInput()" style="background:linear-gradient(135deg, #0ea5e9, #6366f1); border:none; color:#fff; font-weight:700; padding:7px 14px; font-size:11.5px; border-radius:6px; white-space:nowrap; cursor:pointer; box-shadow:0 4px 14px rgba(14,165,233,0.3);">
                        🖼️ Tuvale Çerçeveli Ekle
                    </button>
                </div>
            </div>
        </div>
    `;

    body.innerHTML = html;
};

// ==================== 3. TUVALE ÇERÇEVELİ ROZET EKLEME ====================
window.addSmartBadgeToCanvas = function(badgeIndex) {
    const badge = window.smartBadges[badgeIndex];
    if (!badge || !badge.text) return;

    window.createFramedBadgeOnCanvas(badge.text, badge.style || 'modern');
};

window.createFramedBadgeOnCanvas = function(text, styleType = 'modern') {
    const uiLayer = document.getElementById('ui-layer');
    if (!uiLayer) return;

    // Tuvalin o anki genişliğine / formatına göre dinamik varsayılan boyut
    const cContainer = document.getElementById('canvas-container');
    const cW = (cContainer && parseFloat(cContainer.style.width)) || (typeof uploadedImgW !== 'undefined' && uploadedImgW > 0 ? uploadedImgW : 1920);
    const formatRatio = Math.max(1, cW / 1920);

    const baseFontSize = Math.round(26 * formatRatio);
    const baseW = Math.round(280 * formatRatio);
    const baseMinH = Math.round(52 * formatRatio);
    const basePadV = Math.round(12 * formatRatio);
    const basePadH = Math.round(18 * formatRatio);
    const baseRadius = Math.round(12 * formatRatio);

    const el = document.createElement('div');
    el.className = 'draggable canvas-el';
    el.textContent = text;
    el.dataset.label = 'Rozet: ' + text;
    el.dataset.defaultFont = baseFontSize.toString();
    el.dataset.rotation = '0';
    el.dataset.shadowVal = '10';
    el.dataset.blurVal = '0';

    // Şablon fontunu miras al
    const activeFont = (typeof currentFont !== 'undefined' && currentFont) ? currentFont : 'Inter';
    el.style.fontFamily = activeFont;
    el.style.fontWeight = '700';
    el.style.fontSize = baseFontSize + 'px';
    
    // STANDART DENGELİ ÇERÇEVE BOYUTU (Klasik tutamaçlara tam uyumlu)
    el.style.width = baseW + 'px';
    el.style.minHeight = baseMinH + 'px';
    el.style.padding = `${basePadV}px ${basePadH}px`;
    el.style.borderRadius = baseRadius + 'px';
    el.style.letterSpacing = '0.3px';
    el.style.cursor = 'move';
    el.style.position = 'absolute';
    el.style.left = Math.round(120 * formatRatio) + 'px';
    el.style.top = Math.round((120 + Math.floor(Math.random() * 80)) * formatRatio) + 'px';
    el.style.zIndex = '9999';
    el.style.display = 'block';
    el.style.textAlign = 'center';
    el.style.boxSizing = 'border-box';
    el.style.overflow = 'visible';

    // Stil profilleri
    applyBadgeColorProfile(el, styleType);

    uiLayer.appendChild(el);

    if (typeof bindDrag === 'function') bindDrag(el);
    if (typeof enableInlineEdit === 'function') enableInlineEdit(el);
    el.addEventListener('dblclick', () => {
        if (typeof switchTab === 'function') switchTab('element');
    });
    if (typeof isCanvaMode !== 'undefined' && isCanvaMode && typeof canvaOverlays !== 'undefined') {
        canvaOverlays.push(el);
    }
    if (typeof window.renderLayers === 'function') window.renderLayers();
    if (typeof window.recordHistory === 'function') window.recordHistory('Vurgu Rozeti Eklendi');
    if (typeof window.requestAutoSave === 'function') window.requestAutoSave();

    // Toast bildirim
    let ind = document.getElementById('autosave-indicator');
    if (ind) {
        ind.innerHTML = `✓ "${text}" tuvale eklendi`;
        ind.style.opacity = '1';
        setTimeout(() => { ind.style.opacity = '0'; }, 2000);
    }
};

// ==================== 4. ÇOK SATIRLI ÇERÇEVELİ İLAVE BİLGİ KARTI ====================
window.createFramedCardOnCanvas = function(multilineText, styleType = 'modern') {
    const uiLayer = document.getElementById('ui-layer');
    if (!uiLayer) return;

    const cContainer = document.getElementById('canvas-container');
    const cW = (cContainer && parseFloat(cContainer.style.width)) || (typeof uploadedImgW !== 'undefined' && uploadedImgW > 0 ? uploadedImgW : 1920);
    const formatRatio = Math.max(1, cW / 1920);

    const baseFontSize = Math.round(22 * formatRatio);
    const baseMinW = Math.round(320 * formatRatio);
    const baseMaxW = Math.round(520 * formatRatio);
    const basePadV = Math.round(16 * formatRatio);
    const basePadH = Math.round(22 * formatRatio);
    const baseRadius = Math.round(14 * formatRatio);

    const el = document.createElement('div');
    el.className = 'draggable canvas-el';
    el.textContent = multilineText;
    el.dataset.label = 'Çerçeveli İlave Bilgiler';
    el.dataset.defaultFont = baseFontSize.toString();
    el.dataset.rotation = '0';
    el.dataset.shadowVal = '12';
    el.dataset.blurVal = '0';

    // Şablon fontunu miras al
    const activeFont = (typeof currentFont !== 'undefined' && currentFont) ? currentFont : 'Inter';
    el.style.fontFamily = activeFont;
    el.style.fontWeight = '600';
    el.style.fontSize = baseFontSize + 'px';
    
    // ÇOK SATIRLI ÇERÇEVELİ KART BOYUT VE DÜZENİ
    el.style.minWidth = baseMinW + 'px';
    el.style.maxWidth = baseMaxW + 'px';
    el.style.padding = `${basePadV}px ${basePadH}px`;
    el.style.borderRadius = baseRadius + 'px';
    el.style.cursor = 'move';
    el.style.position = 'absolute';
    el.style.left = Math.round(140 * formatRatio) + 'px';
    el.style.top = Math.round(160 * formatRatio) + 'px';
    el.style.zIndex = '9999';
    el.style.display = 'block';
    el.style.whiteSpace = 'pre-line';
    el.style.lineHeight = '1.55';
    el.style.textAlign = 'left';
    el.style.boxSizing = 'border-box';
    el.style.overflow = 'visible';

    // Stil profilleri
    applyBadgeColorProfile(el, styleType);

    uiLayer.appendChild(el);

    if (typeof bindDrag === 'function') bindDrag(el);
    if (typeof enableInlineEdit === 'function') enableInlineEdit(el);
    el.addEventListener('dblclick', () => {
        if (typeof switchTab === 'function') switchTab('element');
    });
    if (typeof isCanvaMode !== 'undefined' && isCanvaMode && typeof canvaOverlays !== 'undefined') {
        canvaOverlays.push(el);
    }
    if (typeof window.renderLayers === 'function') window.renderLayers();
    if (typeof window.recordHistory === 'function') window.recordHistory('Çerçeveli İlave Bilgi Kartı Eklendi');
    if (typeof window.requestAutoSave === 'function') window.requestAutoSave();

    // Toast bildirim
    let ind = document.getElementById('autosave-indicator');
    if (ind) {
        ind.innerHTML = `✓ Çerçeveli Bilgi Kartı tuvale eklendi`;
        ind.style.opacity = '1';
        setTimeout(() => { ind.style.opacity = '0'; }, 2000);
    }
};

function applyBadgeColorProfile(el, styleType) {
    switch (styleType) {
        case 'gold':
            el.style.background = 'linear-gradient(135deg, #facc15, #ca8a04)';
            el.style.color = '#0f172a';
            el.style.border = '2px solid #ffffff';
            el.style.boxShadow = '0 12px 25px rgba(202, 138, 4, 0.45), 0 0 15px rgba(250, 204, 21, 0.3)';
            el.dataset.storedBgHex = '#ca8a04';
            el.dataset.storedBgOpacity = '100';
            el.dataset.storedBorderColor = '#ffffff';
            el.dataset.storedBorderWidth = '2';
            break;
        case 'blue':
            el.style.background = 'rgba(14, 165, 233, 0.92)';
            el.style.color = '#ffffff';
            el.style.border = '2px solid #38bdf8';
            el.style.boxShadow = '0 12px 25px rgba(14, 165, 233, 0.4), 0 0 15px rgba(56, 189, 248, 0.35)';
            el.dataset.storedBgHex = '#0ea5e9';
            el.dataset.storedBgOpacity = '92';
            el.dataset.storedBorderColor = '#38bdf8';
            el.dataset.storedBorderWidth = '2';
            break;
        case 'emerald':
            el.style.background = 'rgba(16, 185, 129, 0.92)';
            el.style.color = '#ffffff';
            el.style.border = '2px solid #34d399';
            el.style.boxShadow = '0 12px 25px rgba(16, 185, 129, 0.4)';
            el.dataset.storedBgHex = '#10b981';
            el.dataset.storedBgOpacity = '92';
            el.dataset.storedBorderColor = '#34d399';
            el.dataset.storedBorderWidth = '2';
            break;
        case 'rose':
            el.style.background = 'linear-gradient(135deg, #e11d48, #be123c)';
            el.style.color = '#ffffff';
            el.style.border = '2px solid #fda4af';
            el.style.boxShadow = '0 12px 25px rgba(225, 29, 72, 0.45)';
            el.dataset.storedBgHex = '#e11d48';
            el.dataset.storedBgOpacity = '100';
            el.dataset.storedBorderColor = '#fda4af';
            el.dataset.storedBorderWidth = '2';
            break;
        case 'white':
            el.style.background = 'rgba(255, 255, 255, 0.95)';
            el.style.color = '#0f172a';
            el.style.border = '2px solid #0f172a';
            el.style.boxShadow = '0 12px 25px rgba(0, 0, 0, 0.35)';
            el.dataset.storedBgHex = '#ffffff';
            el.dataset.storedBgOpacity = '95';
            el.dataset.storedBorderColor = '#0f172a';
            el.dataset.storedBorderWidth = '2';
            break;
        case 'modern':
        default:
            el.style.background = 'rgba(15, 23, 42, 0.9)';
            el.style.backdropFilter = 'blur(12px)';
            el.style.color = '#ffffff';
            el.style.border = '2px solid rgba(56, 189, 248, 0.6)';
            el.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(56, 189, 248, 0.2)';
            el.dataset.storedBgHex = '#0f172a';
            el.dataset.storedBgOpacity = '90';
            el.dataset.storedBorderColor = '#38bdf8';
            el.dataset.storedBorderWidth = '2';
            break;
    }
}

// ==================== 5. KULLANICI AKSİYONLARI ====================
window.addDirectFramedTextFromInput = function() {
    const input = document.getElementById('customSmartTextInput');
    const styleSel = document.getElementById('customSmartStyleSelect');
    if (!input) return;

    const text = input.value.trim();
    if (!text) {
        alert('Lütfen çerçeve içine eklenecek metin veya bilgileri yazın!');
        return;
    }

    const style = styleSel ? styleSel.value : 'modern';
    
    // Eğer çok satırlıysa kart olarak, tek satırlıysa rozet olarak ekle
    if (text.includes('\n')) {
        window.createFramedCardOnCanvas(text, style);
    } else {
        window.createFramedBadgeOnCanvas(text, style);
    }
};

window.removeSmartBadge = function(index) {
    if (index >= 0 && index < window.smartBadges.length) {
        window.smartBadges.splice(index, 1);
        window.renderSmartSuggestionsUI();

        const badgeCount = document.getElementById('smartSuggestionsBadge');
        if (badgeCount) {
            badgeCount.textContent = `${window.smartBadges.length + window.smartMatchedCallouts.length} Öneri`;
        }
    }
};

window.toggleSmartSuggestions = function() {
    const body = document.getElementById('smartSuggestionsBody');
    const chevron = document.getElementById('smartSuggestionsChevron');
    if (!body) return;

    const isHidden = (body.style.display === 'none' || getComputedStyle(body).display === 'none');
    body.style.display = isHidden ? 'block' : 'none';
    if (chevron) {
        chevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    }
};

window.renderSmartSuggestions = window.renderSmartSuggestionsUI;
window.updateSmartSuggestions = function(data) {
    if (data && typeof data === 'object') {
        window.generateSmartSuggestions(data);
    } else if (window.lastParsedData) {
        window.generateSmartSuggestions(window.lastParsedData);
    } else {
        window.renderSmartSuggestionsUI();
    }
};
