/**
 * ============================================================================
 * SMART SUGGESTIONS & DYNAMIC BADGE GENERATOR (PERFECT FITTED SVGS)
 * modules/smart-suggestions.js
 * ============================================================================
 */

window.smartBadges = [];
window.smartMatchedCallouts = [];
window.smartMatchedIcons = [];
window.smartDefaultFramedText = '';
window.smartRegionalHighlights = [];
window.smartAiDescription = '';
window.smartAiSocialPost = '';
window.smartReelsHook = '';
window.smartVoiceoverScript = '';
window.activeAiDescTab = 'sahibinden';

// ==================== AI KOTA YÖNETİCİSİ (SINIRSIZ KOTA) ====================
window.getAiDailyQuota = function() {
    return { used: 0, max: 'Sınırsız', remaining: 999999, isUnlimited: true };
};

window.consumeAiQuota = function() {
    return { used: 0, max: 'Sınırsız', remaining: 999999, isUnlimited: true };
};

// ==================== METİN VE FONT BOYUTLANDIRMA YARDIMCILARI ====================
function sanitizeBadgeText(txt, maxLen = 35) {
    if (!txt) return '';
    let clean = String(txt)
        .replace(/[*_#`~]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    if (clean.length > maxLen) {
        clean = clean.substring(0, maxLen - 1).trim() + '…';
    }
    return clean;
}

function getSafeFontSize(text, defaultFs = 24, minFs = 10) {
    const len = (text || '').length;
    if (len <= 8) return defaultFs;
    if (len <= 12) return Math.max(minFs, defaultFs - 2);
    if (len <= 16) return Math.max(minFs, defaultFs - 5);
    if (len <= 20) return Math.max(minFs, defaultFs - 8);
    if (len <= 26) return Math.max(minFs, defaultFs - 11);
    return minFs;
}

// ==================== MÜKEMMEL BOYUTLANDIRILMIŞ DİNAMİK SVG ROZET MOTORU ====================
function createFittedSvgBadge(badgeType, val1, val2) {
    val1 = sanitizeBadgeText(val1, 35);
    val2 = sanitizeBadgeText(val2, 35);

    // 1. FİYAT ROZETİ (EmlakStüdyom Klasik Altın / Gold Rozeti)
    if (badgeType === 'fiyat') {
        const price = val1 || '₺ 4.500.000';
        const fs = getSafeFontSize(price, 26, 16);
        return `<svg width="280" height="120" viewBox="0 0 280 120">
  <defs>
    <linearGradient id="g_fiyat_gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#B8860B"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="260" height="100" rx="12" fill="#0a0e27" stroke="url(#g_fiyat_gold)" stroke-width="2"/>
  <text x="140" y="44" text-anchor="middle" fill="url(#g_fiyat_gold)" font-size="11" font-weight="700" letter-spacing="4">💰 SATILIK</text>
  <line x1="70" y1="53" x2="210" y2="53" stroke="url(#g_fiyat_gold)" stroke-width="0.8" opacity="0.8"/>
  <text x="140" y="88" text-anchor="middle" fill="#ffffff" font-size="${fs}" font-weight="800" letter-spacing="0.5">${price}</text>
</svg>`;
    }

    // 2. ALAN & NİTELİK ROZETİ (Zümrüt Yeşil Müstakil / Toplam Alan Rozeti)
    if (badgeType === 'arsa_alan' || badgeType === 'metrekare') {
        const size = val1 || '2.500 m²';
        const sub = (val2 || 'MÜSTAKİL PARSEL').toUpperCase();
        const fs_sub = getSafeFontSize(sub, 11, 8);
        const fs_size = getSafeFontSize(size, 26, 18);
        return `<svg width="280" height="120" viewBox="0 0 280 120">
  <defs>
    <linearGradient id="g_alan_emr" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#022c22"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="260" height="100" rx="12" fill="url(#g_alan_emr)" stroke="#10b981" stroke-width="2"/>
  <text x="140" y="40" text-anchor="middle" fill="#34d399" font-size="10.5" font-weight="700" letter-spacing="3">📐 TOPLAM ALAN</text>
  <line x1="70" y1="49" x2="210" y2="49" stroke="#10b981" stroke-width="0.8" opacity="0.6"/>
  <text x="140" y="80" text-anchor="middle" fill="#ffffff" font-size="${fs_size}" font-weight="800">${size}</text>
  <text x="140" y="102" text-anchor="middle" fill="#6ee7b7" font-size="${fs_sub}" font-weight="700" letter-spacing="1.5">${sub}</text>
</svg>`;
    }

    // 3. ADA / PARSEL ROZETİ (Tapu & Kadastro Rozeti)
    if (badgeType === 'ada_parsel') {
        const ada = (val1 || 'TAPU KAYITLI').toUpperCase();
        const size = val2 || '';
        const fs_ada = getSafeFontSize(ada, 15, 10);
        return `<svg width="280" height="120" viewBox="0 0 280 120">
  <defs>
    <linearGradient id="g_tapu_amb" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="260" height="100" rx="12" fill="url(#g_tapu_amb)" stroke="#fbbf24" stroke-width="2"/>
  <text x="140" y="40" text-anchor="middle" fill="#fbbf24" font-size="10.5" font-weight="700" letter-spacing="3">🏛️ TAPU & KADASTRO</text>
  <line x1="70" y1="49" x2="210" y2="49" stroke="#fbbf24" stroke-width="0.8" opacity="0.6"/>
  <text x="140" y="80" text-anchor="middle" fill="#ffffff" font-size="${fs_ada}" font-weight="800" letter-spacing="0.5">${ada}</text>
  <text x="140" y="102" text-anchor="middle" fill="#fde68a" font-size="11.5" font-weight="700">${size}</text>
</svg>`;
    }

    // 4. İMAR / NİTELİK ROZETİ
    if (badgeType === 'imar') {
        const imar = (val1 || 'İMARLI ARSA').toUpperCase();
        const size = val2 || '';
        const fs_imar = getSafeFontSize(imar, 15, 10);
        return `<svg width="280" height="120" viewBox="0 0 280 120">
  <defs>
    <linearGradient id="g_imar_pur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="260" height="100" rx="12" fill="url(#g_imar_pur)" stroke="#818cf8" stroke-width="2"/>
  <text x="140" y="40" text-anchor="middle" fill="#a5b4fc" font-size="10.5" font-weight="700" letter-spacing="3">🌱 İMAR & NİTELİK</text>
  <line x1="70" y1="49" x2="210" y2="49" stroke="#818cf8" stroke-width="0.8" opacity="0.6"/>
  <text x="140" y="80" text-anchor="middle" fill="#ffffff" font-size="${fs_imar}" font-weight="800" letter-spacing="0.5">${imar}</text>
  <text x="140" y="102" text-anchor="middle" fill="#c7d2fe" font-size="11.5" font-weight="700">${size}</text>
</svg>`;
    }

    // 5. KONUM KARTI ROZETİ
    if (badgeType === 'konum') {
        const loc = val1 || 'Merkezi Lokasyon';
        const parts = loc.split('/').map(p => p.trim()).filter(p => p.length > 0);
        let city = 'TÜRKİYE';
        let mainLoc = loc.toUpperCase();

        if (parts.length >= 3) {
            city = parts[0].toUpperCase();
            mainLoc = `${parts[1]} / ${parts[2]}`.toUpperCase();
        } else if (parts.length === 2) {
            city = parts[0].toUpperCase();
            mainLoc = parts[1].toUpperCase();
        }

        const fs_main = getSafeFontSize(mainLoc, 15, 10);
        return `<svg width="280" height="120" viewBox="0 0 280 120">
  <defs>
    <linearGradient id="g_loc_sky" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#03254c"/>
      <stop offset="100%" stop-color="#0b132b"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="260" height="100" rx="12" fill="url(#g_loc_sky)" stroke="#38bdf8" stroke-width="2"/>
  <text x="140" y="40" text-anchor="middle" fill="#38bdf8" font-size="10.5" font-weight="700" letter-spacing="3">📍 LOKASYON BİLGİSİ</text>
  <line x1="70" y1="49" x2="210" y2="49" stroke="#38bdf8" stroke-width="0.8" opacity="0.6"/>
  <text x="140" y="80" text-anchor="middle" fill="#ffffff" font-size="${fs_main}" font-weight="800" letter-spacing="0.5">${mainLoc}</text>
  <text x="140" y="102" text-anchor="middle" fill="#fbbf24" font-size="11.5" font-weight="700" letter-spacing="2">${city}</text>
</svg>`;
    }

    // 6. ODA / DAİRE TİPİ ROZETİ
    if (badgeType === 'oda') {
        const rooms = (val1 || '3+1').toUpperCase();
        const sub = (val2 || 'ODA + SALON').toUpperCase();
        const fs_rooms = getSafeFontSize(rooms, 28, 18);
        return `<svg width="280" height="120" viewBox="0 0 280 120">
  <defs>
    <linearGradient id="g_oda_mag" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#311042"/>
      <stop offset="100%" stop-color="#180724"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="260" height="100" rx="12" fill="url(#g_oda_mag)" stroke="#e879f9" stroke-width="2"/>
  <text x="140" y="40" text-anchor="middle" fill="#f0abfc" font-size="10.5" font-weight="700" letter-spacing="3">🏠 ODA PLANI</text>
  <line x1="70" y1="49" x2="210" y2="49" stroke="#e879f9" stroke-width="0.8" opacity="0.6"/>
  <text x="140" y="82" text-anchor="middle" fill="#ffffff" font-size="${fs_rooms}" font-weight="800">${rooms}</text>
  <text x="140" y="102" text-anchor="middle" fill="#e879f9" font-size="10.5" font-weight="700" letter-spacing="2">${sub}</text>
</svg>`;
    }

    // 7. ÖZELLİK / VURGU ROZETİ
    if (badgeType === 'ozellik') {
        const feat = (val1 || 'LÜKS YAŞAM').toUpperCase();
        const fs_feat = getSafeFontSize(feat, 15, 10);
        return `<svg width="280" height="120" viewBox="0 0 280 120">
  <defs>
    <linearGradient id="g_feat_gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="260" height="100" rx="12" fill="url(#g_feat_gold)" stroke="#fbbf24" stroke-width="2"/>
  <text x="140" y="40" text-anchor="middle" fill="#fbbf24" font-size="10.5" font-weight="700" letter-spacing="3">⭐ ÖNE ÇIKAN ÖZELLİK</text>
  <line x1="70" y1="49" x2="210" y2="49" stroke="#fbbf24" stroke-width="0.8" opacity="0.6"/>
  <text x="140" y="84" text-anchor="middle" fill="#ffffff" font-size="${fs_feat}" font-weight="800" letter-spacing="1">${feat}</text>
</svg>`;
    }

    // 8. FIRSAT m² ROZETİ (Göz Alıcı Ateş / Değerleme Rozeti)
    if (badgeType === 'firsat') {
        const m2P = val1 || 'FIRSAT m² FİYATI';
        const sub = (val2 || 'BÖLGENİN EN UYGUNU').toUpperCase();
        const fs_m2 = getSafeFontSize(m2P, 22, 14);
        return `<svg width="280" height="120" viewBox="0 0 280 120">
  <defs>
    <linearGradient id="g_firsat_red" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7f1d1d"/>
      <stop offset="100%" stop-color="#450a0a"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="260" height="100" rx="12" fill="url(#g_firsat_red)" stroke="#ef4444" stroke-width="2"/>
  <text x="140" y="40" text-anchor="middle" fill="#fca5a5" font-size="10.5" font-weight="700" letter-spacing="3">🔥 m² BİRİM FİYATI</text>
  <line x1="70" y1="49" x2="210" y2="49" stroke="#ef4444" stroke-width="0.8" opacity="0.6"/>
  <text x="140" y="82" text-anchor="middle" fill="#ffffff" font-size="${fs_m2}" font-weight="800">${m2P}</text>
  <text x="140" y="102" text-anchor="middle" fill="#fef08a" font-size="10.5" font-weight="700" letter-spacing="1.5">${sub}</text>
</svg>`;
    }

    // 9. YÜKSEK PRİM / YATIRIM ROZETİ
    if (badgeType === 'yatirim') {
        const title = (val1 || 'YATIRIMLIK FIRSAT').toUpperCase();
        const sub = (val2 || 'YÜKSEK PRİM POTANSİYELİ').toUpperCase();
        const fs_tit = getSafeFontSize(title, 15, 10);
        return `<svg width="280" height="120" viewBox="0 0 280 120">
  <defs>
    <linearGradient id="g_yatirim_vip" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#312e81"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="260" height="100" rx="12" fill="url(#g_yatirim_vip)" stroke="#a855f7" stroke-width="2"/>
  <text x="140" y="40" text-anchor="middle" fill="#d8b4fe" font-size="10.5" font-weight="700" letter-spacing="3">💎 DEĞERLEME & ANALİZ</text>
  <line x1="70" y1="49" x2="210" y2="49" stroke="#a855f7" stroke-width="0.8" opacity="0.6"/>
  <text x="140" y="80" text-anchor="middle" fill="#ffffff" font-size="${fs_tit}" font-weight="800" letter-spacing="0.5">${title}</text>
  <text x="140" y="102" text-anchor="middle" fill="#38bdf8" font-size="10.5" font-weight="700" letter-spacing="1.5">${sub}</text>
</svg>`;
    }

    return '';
}

// Geriye dönük uyumluluk için injectDynamicSVGText fonksiyonu
function injectDynamicSVGText(svgStr, type, value, extraVal) {
    const custom = createFittedSvgBadge(type, value, extraVal);
    if (custom) return custom;
    return svgStr;
}

// ==================== ŞABLONLAR SEKMESİNDEN ÖNERİ VE UYGULAMA MOTORU ====================
window.getRecommendedCanvaTemplates = function(data = {}, rawText = '') {
    rawText = (rawText || '').toLowerCase();
    const type = (data.type || '').toLowerCase();

    const isArsa = rawText.includes('arsa') || rawText.includes('tarla') || rawText.includes('arazi') || rawText.includes('parsel') || rawText.includes('hisse') || (data.imar && data.imar.length > 0) || type.includes('arsa') || type.includes('tarla');
    const isVilla = !isArsa && (rawText.includes('villa') || rawText.includes('müstakil') || rawText.includes('malikane') || rawText.includes('triplex') || rawText.includes('dubleks') || rawText.includes('havuz') || type.includes('villa'));
    const isTicari = !isArsa && (rawText.includes('ofis') || rawText.includes('dükkan') || rawText.includes('plaza') || rawText.includes('ticari') || rawText.includes('mağaza') || rawText.includes('depo') || type.includes('ticari') || type.includes('ofis'));
    const isLuks = isVilla || rawText.includes('rezidans') || rawText.includes('residence') || rawText.includes('yalı') || rawText.includes('penthouse') || rawText.includes('lüks');

    if (isArsa) {
        return [
            { catId: 'portfoy', idx: 0, name: '🌾 Portföy Arsa Şablonu', tag: 'PORTFÖY · 16:9', icon: '🌾', colorTheme: 'green', colorLabel: 'Zümrüt Doğa', colorGradient: 'linear-gradient(135deg, #059669, #022c22)' },
            { catId: 'minimal', idx: 1, name: '✨ Minimal Arazi Kartı', tag: 'MİNİMAL · 16:9', icon: '🌱', colorTheme: 'green', colorLabel: 'Canlı Yeşil', colorGradient: 'linear-gradient(135deg, #10b981, #047857)' },
            { catId: 'klasik', idx: 1, name: '🏛️ Klasik Kadastro İlanı', tag: 'KLASİK · 16:9', icon: '📍', colorTheme: 'gold', colorLabel: 'Altın & Kehribar', colorGradient: 'linear-gradient(135deg, #d97706, #78350f)' },
            { catId: 'kolaj', idx: 0, name: '🖼️ Çoklu Arazi Kolajı', tag: 'KOLAJ · 16:9', icon: '📐', colorTheme: 'blue', colorLabel: 'Safir Mavi', colorGradient: 'linear-gradient(135deg, #0284c7, #0369a1)' }
        ];
    } else if (isVilla) {
        return [
            { catId: 'luks', idx: 0, name: '👑 Lüks Villa Prestij', tag: 'LÜKS · 16:9', icon: '👑', colorTheme: 'gold', colorLabel: 'Altın & Kehribar', colorGradient: 'linear-gradient(135deg, #f59e0b, #b45309)' },
            { catId: 'elit', idx: 0, name: '💎 Elit VIP Müstakil', tag: 'ELİT · 16:9', icon: '💎', colorTheme: 'blue', colorLabel: 'Safir & Deniz', colorGradient: 'linear-gradient(135deg, #0284c7, #1e3a8a)' },
            { catId: 'dinamik', idx: 0, name: '⚡ Dinamik Havuzlu Afiş', tag: 'DİNAMİK · 16:9', icon: '✨', colorTheme: 'purple', colorLabel: 'İndigo VIP', colorGradient: 'linear-gradient(135deg, #6366f1, #4338ca)' },
            { catId: 'sosyal', idx: 0, name: '📱 Sosyal Medya Vitrini', tag: 'SOSYAL · 16:9', icon: '🌟', colorTheme: 'rose', colorLabel: 'Rose Gold', colorGradient: 'linear-gradient(135deg, #ec4899, #be185d)' }
        ];
    } else if (isTicari) {
        return [
            { catId: 'kurumsal', idx: 0, name: '🏢 Kurumsal Ticari Kart', tag: 'KURUMSAL · 16:9', icon: '🏢', colorTheme: 'blue', colorLabel: 'Kurumsal Mavi', colorGradient: 'linear-gradient(135deg, #0284c7, #0f172a)' },
            { catId: 'minimal', idx: 0, name: '💼 Minimal Ticari Vitrin', tag: 'MİNİMAL · 16:9', icon: '📊', colorTheme: 'dark', colorLabel: 'Koyu Çelik', colorGradient: 'linear-gradient(135deg, #334155, #0f172a)' },
            { catId: 'klasik', idx: 0, name: '🏛️ Klasik Yatırım Kartı', tag: 'KLASİK · 16:9', icon: '📈', colorTheme: 'gold', colorLabel: 'Gold & Çelik', colorGradient: 'linear-gradient(135deg, #d97706, #1e293b)' },
            { catId: 'sosyal', idx: 0, name: '📱 Sosyal Ticari İlan', tag: 'SOSYAL · 16:9', icon: '🏬', colorTheme: 'purple', colorLabel: 'İndigo Kart', colorGradient: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }
        ];
    } else if (isLuks) {
        return [
            { catId: 'elit', idx: 0, name: '🏙️ Elit Rezidans Vitrini', tag: 'ELİT · 16:9', icon: '🏙️', colorTheme: 'blue', colorLabel: 'Gök Mavisi', colorGradient: 'linear-gradient(135deg, #38bdf8, #0284c7)' },
            { catId: 'luks', idx: 0, name: '👑 Lüks Konut Prestij', tag: 'LÜKS · 16:9', icon: '👑', colorTheme: 'purple', colorLabel: 'VIP Mor', colorGradient: 'linear-gradient(135deg, #a855f7, #6366f1)' },
            { catId: 'dinamik', idx: 0, name: '⚡ Modern Rezidans Afişi', tag: 'DİNAMİK · 16:9', icon: '💎', colorTheme: 'gold', colorLabel: 'Altın Kehribar', colorGradient: 'linear-gradient(135deg, #eab308, #ca8a04)' },
            { catId: 'sosyal', idx: 0, name: '📱 Sosyal Lüks Vitrin', tag: 'SOSYAL · 16:9', icon: '🌟', colorTheme: 'rose', colorLabel: 'Rose Gold', colorGradient: 'linear-gradient(135deg, #ec4899, #be185d)' }
        ];
    } else {
        return [
            { catId: 'elit', idx: 0, name: '🏙️ Elit Daire Vitrini', tag: 'ELİT · 16:9', icon: '🏙️', colorTheme: 'blue', colorLabel: 'Gök Mavisi', colorGradient: 'linear-gradient(135deg, #38bdf8, #0284c7)' },
            { catId: 'dinamik', idx: 0, name: '⚡ Modern Şehir Dairesi', tag: 'DİNAMİK · 16:9', icon: '🌟', colorTheme: 'gold', colorLabel: 'Sarı & Kehribar', colorGradient: 'linear-gradient(135deg, #eab308, #ca8a04)' },
            { catId: 'minimal', idx: 0, name: '✨ Minimal Daire İlanı', tag: 'MİNİMAL · 16:9', icon: '🎨', colorTheme: 'dark', colorLabel: 'Minimal Karbon', colorGradient: 'linear-gradient(135deg, #1e293b, #0f172a)' },
            { catId: 'luks', idx: 0, name: '👑 Lüks Daire Prestij', tag: 'LÜKS · 16:9', icon: '🏢', colorTheme: 'purple', colorLabel: 'İndigo VIP', colorGradient: 'linear-gradient(135deg, #6366f1, #3b82f6)' }
        ];
    }
};

window.applyCanvaTabTemplate = function(catId, idx) {
    const targetCat = catId || 'luks';
    const targetIdx = (typeof idx === 'number') ? idx : 0;

    // 1. İlan formundaki bilgileri şablon girdi kutularına aktar
    if (typeof window.syncKolajFromForm === 'function') {
        window.syncKolajFromForm();
    }

    const pData = window.lastParsedData || {};
    const rawText = (window.lastRawText || '').toLowerCase();

    // 2. Fiyat Değeri
    const priceVal = pData.price || document.getElementById('priceInput')?.value || '';

    // 3. Kısa & Şık Başlık (2-3 kelimelik rozet başlığı - asla uzun cümle olmamalı)
    let titleVal = '';
    
    // Form config'deki badge kontrolü
    if (window.currentMode && window.propertyForms && window.propertyForms[window.currentMode]?.badge) {
        titleVal = window.propertyForms[window.currentMode].badge;
    } else if (pData.type && window.propertyForms && window.propertyForms[pData.type]?.badge) {
        titleVal = window.propertyForms[pData.type].badge;
    }

    // Eğer badge yoksa veya çok uzunsa / generic ise içerikten en uygun 2-3 kelimelik başlığı üret
    if (!titleVal || titleVal === 'ÖZEL İLAN' || titleVal.length > 25) {
        const isArsa = rawText.includes('arsa') || rawText.includes('tarla') || rawText.includes('arazi') || rawText.includes('parsel') || (pData.type && (pData.type.includes('arsa') || pData.type.includes('tarla')));
        const isVilla = !isArsa && (rawText.includes('villa') || rawText.includes('müstakil') || rawText.includes('malikane') || rawText.includes('triplex') || (pData.type && pData.type.includes('villa')));
        const isTicari = !isArsa && (rawText.includes('ofis') || rawText.includes('dükkan') || rawText.includes('plaza') || rawText.includes('ticari') || (pData.type && pData.type.includes('ticari')));
        const isKiralik = rawText.includes('kiralık') || (pData.type && pData.type.includes('kiralik'));

        if (isArsa) {
            if (rawText.includes('tarla')) titleVal = isKiralik ? 'KİRALIK TARLA' : 'SATILIK TARLA';
            else if (rawText.includes('zeytinlik')) titleVal = 'SATILIK ZEYTİNLİK';
            else if (rawText.includes('bahçe') || rawText.includes('bağ')) titleVal = 'SATILIK BAĞ & BAHÇE';
            else if (rawText.includes('ticari')) titleVal = 'SATILIK TİCARİ ARSA';
            else titleVal = isKiralik ? 'KİRALIK ARSA' : 'SATILIK ARSA';
        } else if (isVilla) {
            if (rawText.includes('müstakil')) titleVal = isKiralik ? 'KİRALIK MÜSTAKİL EV' : 'SATILIK MÜSTAKİL EV';
            else titleVal = isKiralik ? 'KİRALIK VİLLA' : 'SATILIK VİLLA';
        } else if (isTicari) {
            if (rawText.includes('ofis') || rawText.includes('büro')) titleVal = isKiralik ? 'KİRALIK OFİS' : 'SATILIK OFİS';
            else if (rawText.includes('dükkan') || rawText.includes('mağaza')) titleVal = isKiralik ? 'KİRALIK DÜKKAN' : 'SATILIK DÜKKAN';
            else titleVal = isKiralik ? 'KİRALIK TİCARİ' : 'SATILIK TİCARİ';
        } else {
            if (rawText.includes('rezidans') || rawText.includes('residence')) titleVal = isKiralik ? 'KİRALIK RESIDENCE' : 'SATILIK RESIDENCE';
            else titleVal = isKiralik ? 'KİRALIK DAİRE' : 'SATILIK DAİRE';
        }
    }

    // 4. Şablon Özellikleri (Maksimum 3-4 kısa satır - taşmaları ve karmaşayı önler)
    const sizeVal = pData.size || document.getElementById('sizeInput')?.value || document.getElementById('araziSizeInput')?.value || '';
    const roomsVal = pData.rooms || document.getElementById('roomsInput')?.value || '';
    const districtVal = pData.district || '';
    const cityVal = pData.city || '';
    const locVal = (districtVal && cityVal && districtVal !== cityVal) ? `${districtVal} / ${cityVal}` : (districtVal || cityVal || pData.location || document.getElementById('locationInput')?.value || '');

    const featsLines = [];
    // Satır 1: Alan veya Oda + Alan
    if (roomsVal && sizeVal && !roomsVal.includes('m²')) {
        featsLines.push(`${roomsVal}  •  ${sizeVal}`);
    } else if (sizeVal) {
        featsLines.push(sizeVal);
    } else if (roomsVal) {
        featsLines.push(roomsVal);
    }

    // Satır 2: Lokasyon (İlçe / İl)
    if (locVal && locVal.toLowerCase() !== 'null' && locVal.toLowerCase() !== 'yok') {
        const cleanLoc = locVal.length > 26 ? locVal.substring(0, 24) + '..' : locVal;
        featsLines.push(cleanLoc);
    }

    // Satır 3: İmar / Tapu / Parsel Durumu
    if (pData.imar && pData.imar.toLowerCase() !== 'null' && pData.imar.toLowerCase() !== 'yok') {
        featsLines.push(pData.imar.length > 25 ? pData.imar.substring(0, 23) + '..' : pData.imar);
    } else if (pData.tapu && pData.tapu.toLowerCase() !== 'null' && pData.tapu.toLowerCase() !== 'yok') {
        featsLines.push(pData.tapu.length > 25 ? pData.tapu.substring(0, 23) + '..' : pData.tapu);
    } else if (pData.ada && pData.parsel) {
        featsLines.push(`Ada: ${pData.ada} / Parsel: ${pData.parsel}`);
    }

    // Satır 4: Vurgu (Havuz, Otopark, Sıfır Yapı, Kredi, Müstakil Parsel vs.)
    if (featsLines.length < 4) {
        if (rawText.includes('havuz')) featsLines.push('Özel Yüzme Havuzlu');
        else if (rawText.includes('sıfır') || rawText.includes('yeni yapı')) featsLines.push('Sıfır Yapı / Hemen Teslim');
        else if (rawText.includes('deniz')) featsLines.push('Deniz Manzaralı');
        else if (rawText.includes('kredi')) featsLines.push('Krediye Uygun');
        else if (rawText.includes('müstakil parsel')) featsLines.push('Müstakil Parsel');
        else if (rawText.includes('yatırım')) featsLines.push('Yüksek Yatırım Değeri');
    }

    const featsText = [...new Set(featsLines)].slice(0, 4).join('\n');

    // 5. Her şablon modülü için girdi alanlarını doldur
    const titlePrefixes = ['canvaTitle', 'canvaLTitle', 'canvaETitle', 'canvaDTitle', 'canvaMTitle', 'canvaKTitle', 'canvaPTitle', 'canvaSTitle', 'canvaCTitle', 'canvaOTitle'];
    titlePrefixes.forEach(tid => {
        const el = document.getElementById(tid);
        if (el && titleVal) {
            el.value = titleVal;
            try { localStorage.setItem(tid, titleVal); } catch(e){}
        }
    });

    const pricePrefixes = ['canvaPrice', 'canvaLPrice', 'canvaEPrice', 'canvaDPrice', 'canvaMPrice', 'canvaKPrice', 'canvaPPrice', 'canvaSPrice', 'canvaCPrice', 'canvaOPrice'];
    pricePrefixes.forEach(pid => {
        const el = document.getElementById(pid);
        if (el && priceVal) {
            el.value = priceVal;
            try { localStorage.setItem(pid, priceVal); } catch(e){}
        }
    });

    const featsPrefixes = ['canvaFeatures', 'canvaLFeats', 'canvaEFeats', 'canvaDFeats', 'canvaMFeats', 'canvaKFeats', 'canvaPFeats', 'canvaSFeats', 'canvaCFeats', 'canvaOFeats'];
    featsPrefixes.forEach(fid => {
        const el = document.getElementById(fid);
        if (el && featsText) {
            el.value = featsText;
            try { localStorage.setItem(fid, featsText); } catch(e){}
        }
    });

    // 6. Şablonlar sekmesindeki akordeon içeriğini bul ve kartı tıkla
    const container = document.getElementById('tpl-content-' + targetCat);
    if (container) {
        // İlgili akordiyon başlığını açık yap
        const accItem = container.closest('.accordion-item');
        if (accItem) {
            document.querySelectorAll('#template-accordion-container .accordion-item').forEach(i => i.classList.remove('active'));
            accItem.classList.add('active');
        }

        const cards = Array.from(container.querySelectorAll('.canva-tpl-card, .template-btn'));
        const targetCard = cards[targetIdx] || cards[0];
        if (targetCard) {
            targetCard.classList.remove('active');
            targetCard.click();
        }
    }

    // 7. Tuvali yenile
    window.isCanvaMode = true;
    if (typeof window.renderData === 'function') window.renderData();
    if (typeof window.refreshActiveCanvaTemplate === 'function') window.refreshActiveCanvaTemplate();
    if (typeof window.requestAutoSave === 'function') window.requestAutoSave();

    // 8. Öneri kartı görsel durumunu güncelle
    document.querySelectorAll('.smart-tpl-rec-card').forEach(c => {
        c.style.borderColor = '#334155';
        c.style.background = 'rgba(15,23,42,0.6)';
    });
    if (typeof event !== 'undefined' && event && event.target) {
        const clickedCard = event.target.closest('.smart-tpl-rec-card');
        if (clickedCard) {
            clickedCard.style.borderColor = '#6366f1';
            clickedCard.style.background = 'rgba(99, 102, 241, 0.15)';
        }
    }

    let ind = document.getElementById('autosave-indicator');
    if (ind) {
        ind.innerHTML = '✨ Şablon tuvale uygulandı!';
        ind.style.opacity = '1';
        setTimeout(() => { ind.style.opacity = '0'; }, 2000);
    }
};

// ==================== CALLOUT LIBRARY ROZETİNİ AL ====================
function getLibraryCalloutBadge(category, nameKeywords) {
    if (typeof window.CALLOUT_LIBRARY !== 'undefined' && window.CALLOUT_LIBRARY[category] && Array.isArray(window.CALLOUT_LIBRARY[category].items)) {
        const items = window.CALLOUT_LIBRARY[category].items;
        const kw = (nameKeywords || '').toLowerCase();
        const found = items.find(i => i.name.toLowerCase().includes(kw));
        if (found) return { name: found.name, svg: found.svg, category: category };
        if (items.length > 0) return { name: items[0].name, svg: items[0].svg, category: category };
    }
    return null;
}

// ==================== AKILLI EMLAK REKLAM SESLENDİRME METNİ ÜRETİCİSİ ====================
window.generateSmartVoiceoverScript = function(data = {}, isRescan = false) {
    const rawText = (data.desc || data.title || '').toLowerCase();
    const type = (data.type || '').toLowerCase();
    const isArsa = rawText.includes('arsa') || rawText.includes('tarla') || rawText.includes('arazi') || rawText.includes('parsel') || (data.imar && data.imar.length > 0) || type.includes('arsa') || type.includes('tarla');
    
    // Konum metnini temizle (Slaş / taksim 'bölü' olarak okunmasın, Mah. açılsın)
    let locName = data.location || (data.district ? (data.district + (data.city ? ', ' + data.city : '')) : 'Merkezi ve Seçkin Lokasyonda');
    locName = locName
        .replace(/\s*[\/\\]\s*/g, ', ')
        .replace(/\s*\|\s*/g, ', ')
        .replace(/\b(Mah|mah|Mh|mh)\b\.?/gi, 'Mahallesi')
        .replace(/\b(Cad|cad|Cd|cd)\b\.?/gi, 'Caddesi')
        .replace(/\b(Sok|sok|Sk|sk)\b\.?/gi, 'Sokağı')
        .replace(/\b(Bul|bul|Blv|blv)\b\.?/gi, 'Bulvarı')
        .replace(/,\s*,+/g, ', ')
        .replace(/\s+/g, ' ')
        .trim();

    const propPrice = data.price && data.price !== 'Fiyat İçin İletişime Geçiniz' ? data.price : '';
    const propSize = data.size || '';
    const propRooms = data.rooms || '';
    const propImar = data.imar || '';
    const propTapu = data.tapu || '';

    let script = '';

    if (isArsa) {
        script = 'Geleceğinize değer katacak büyük bir yatırım fırsatı şimdi satışta. ';
        script += locName + ' bölgesinde, hızla prim yapan ve ana ulaşım akslarına yakın stratejik bir noktada yer alan bu eşsiz arsamız yeni sahibini bekliyor. ';
        if (propSize) script += 'Toplam ' + propSize + ' geniş kullanım alanına sahip olup, ';
        if (propImar) script += propImar + ' imar avantajıyla hemen projelendirmeye uygundur. ';
        else script += 'yüksek imar ve prim potansiyeliyle her geçen gün değerine değer katmaktadır. ';
        if (propTapu) script += 'Mülkiyet durumu ' + propTapu + ' olup sorunsuz ve güvenli bir altyapıya sahiptir. ';
        if (propPrice) script += 'Sadece ' + propPrice + ' cazip fırsat fiyatıyla sunulan bu kaçırılmayacak arsa portföyü için ';
        else script += 'Kaçırılmayacak bu değerli gayrimenkul fırsatı için ';
        script += 'hemen bizimle iletişime geçin, yer gösterimi ve detaylı sunum randevunuzu bugünden ayırtın.';
    } else {
        script = 'Hayalinizdeki konforlu ve prestijli yaşam kapılarını aralıyor. ';
        script += locName + ' lokasyonunun en nezih ve hızla değerlenen seçkin noktasında, ulaşım ağlarına ve sosyal yaşam merkezlerine çok yakın mesafede harika bir mülk satışa sunuldu. ';
        if (propRooms) script += propRooms + ' ferah ve aydınlık oda dağılımı, ';
        if (propSize) script += propSize + ' geniş brüt kullanım alanı, ';
        script += 'modern mimari çizgileri ve kaliteli iç donatılarıyla aileniz için huzur dolu bir yaşam vadediyor. ';
        if (propTapu) script += 'Tapu durumu ' + propTapu + ' olup krediye ve hemen taşınmaya uygundur. ';
        if (propPrice) script += 'Bu seçkin portföy ' + propPrice + ' avantajlı fiyatıyla sizleri bekliyor. ';
        script += 'Ayrıntılı bilgi almak, yerinde görmek ve sunum fırsatından yararlanmak için hemen bizi arayın.';
    }

    if (window.VoiceStudio && typeof window.VoiceStudio.convertNumbersToWords === 'function') {
        script = window.VoiceStudio.convertNumbersToWords(script);
    }

    return script;
};

// ==================== 1. AKILLI ANALİZ & ÖNERİ ÜRETİMİ (SADECE GERÇEK VERİLERLE ROZET ÜRETİR) ====================
window.generateSmartSuggestions = function(data = {}, rawText = '') {
    window.lastParsedData = data;
    window.lastRawText = rawText;
    window.smartBadges = [];
    window.smartMatchedCallouts = [];
    window.smartMatchedIcons = [];
    window.smartRegionalHighlights = [];
    window.smartAiDescription = '';
    window.smartAiSocialPost = '';
    window.smartReelsHook = '';
    window.smartVoiceoverScript = '';

    rawText = (rawText || '').toLowerCase();
    const type = (data.type || '').toLowerCase();

    // 1. İLAN TÜRÜNÜ KESİN TESPİT ET
    const isArsa = rawText.includes('arsa') || rawText.includes('tarla') || rawText.includes('arazi') || rawText.includes('parsel') || rawText.includes('hisse') || (data.imar && data.imar.length > 0) || type.includes('arsa') || type.includes('tarla');
    const isVilla = !isArsa && (rawText.includes('villa') || rawText.includes('müstakil') || rawText.includes('malikane') || rawText.includes('triplex') || rawText.includes('dubleks') || rawText.includes('havuz') || type.includes('villa'));
    const isTicari = !isArsa && (rawText.includes('ofis') || rawText.includes('dükkan') || rawText.includes('plaza') || rawText.includes('ticari') || rawText.includes('mağaza') || rawText.includes('depo') || type.includes('ticari') || type.includes('ofis'));
    const isKonut = !isArsa && !isVilla && !isTicari;

    // 2. HAM VERİLERİ VE ALANLARIN VARLIĞINI KONTROL ET (BOŞ/NULL/YOK OLANLARI ELLERİZ)
    const rawPrice = (data.price || document.getElementById('priceInput')?.value || '').trim();
    const rawSize = (data.size || document.getElementById('sizeInput')?.value || document.getElementById('araziSizeInput')?.value || '').trim();
    const rawRooms = (data.rooms || document.getElementById('roomsInput')?.value || '').trim();
    const rawImar = (data.imar || document.getElementById('imarInput')?.value || '').trim();
    const rawTapu = (data.tapu || document.getElementById('tapuInput')?.value || '').trim();
    const rawFloor = (data.floor || document.getElementById('floorInput')?.value || '').trim();
    const rawAda = String(data.ada || '').trim();
    const rawParsel = String(data.parsel || '').trim();
    const rawAdaParsel = (data.adaParsel || document.getElementById('adaParselInput')?.value || '').trim();

    const hasPrice = Boolean(rawPrice && rawPrice.toLowerCase() !== 'null' && rawPrice.toLowerCase() !== 'yok' && rawPrice.length > 2);
    const hasSize = Boolean(rawSize && rawSize.toLowerCase() !== 'null' && rawSize.toLowerCase() !== 'yok' && rawSize.length > 1);
    const hasRooms = Boolean(rawRooms && rawRooms.toLowerCase() !== 'null' && rawRooms.toLowerCase() !== 'yok' && rawRooms.match(/\d+/));
    const hasAda = Boolean(rawAda && rawAda.toLowerCase() !== 'null' && rawAda !== '0' && rawAda.toLowerCase() !== 'yok');
    const hasParsel = Boolean(rawParsel && rawParsel.toLowerCase() !== 'null' && rawParsel !== '0' && rawParsel.toLowerCase() !== 'yok');
    const hasAdaParsel = hasAda || hasParsel || Boolean(rawAdaParsel && rawAdaParsel.match(/\d+/) && !rawAdaParsel.toLowerCase().includes('yok'));
    const hasImar = Boolean(rawImar && rawImar.toLowerCase() !== 'null' && rawImar.toLowerCase() !== 'yok' && rawImar.length > 2);

    // Ortak Konum
    let activeLoc = (data.location || '').trim();
    if (!activeLoc || activeLoc.toLowerCase() === 'null') {
        const parts = [];
        if (data.city && data.city.toLowerCase() !== 'null') parts.push(data.city);
        if (data.district && data.district.toLowerCase() !== 'null') parts.push(data.district);
        if (data.neighborhood && data.neighborhood.toLowerCase() !== 'null') parts.push(data.neighborhood);
        activeLoc = parts.join(' / ') || (document.getElementById('locationInput')?.value || '').trim();
    }
    const hasLocation = Boolean(activeLoc && activeLoc !== 'Merkezi Konum' && activeLoc.length > 2);

    const locParts = activeLoc.split('/').map(p => p.trim()).filter(p => p.length > 0);
    const cityStr = locParts.length > 0 ? locParts[0] : '';
    const districtStr = locParts.length > 1 ? locParts[1] : (locParts[0] || '');

    // Ortak Fiyat
    const formattedPrice = hasPrice ? ((rawPrice.includes('TL') || rawPrice.includes('₺') || rawPrice.includes('$') || rawPrice.includes('€')) ? rawPrice : rawPrice + ' TL') : '';

    // Ortak m²
    const formattedSize = hasSize ? ((rawSize.includes('m²') || rawSize.includes('m2') || rawSize.includes('Dönüm')) ? rawSize : rawSize + ' m²') : '';
    const cleanSizeNum = formattedSize.replace(/[^0-9\.\,]/g, '').trim();

    // 💡 Akıllı m² Birim Fiyatı Hesaplama (Değerleme Analizi)
    let calculatedM2Price = '';
    if (hasPrice && hasSize) {
        const cleanP = parseFloat(formattedPrice.replace(/[^0-9]/g, ''));
        const cleanS = parseFloat(formattedSize.replace(/[^0-9]/g, ''));
        if (cleanP > 1000 && cleanS > 0) {
            const m2Val = Math.round(cleanP / cleanS);
            calculatedM2Price = `₺ ${m2Val.toLocaleString('tr-TR')} / m²`;
        }
    }

    const matchedBadges = [];

    // ==========================================
    // 🌾 1. ARSA / TARLA / ARAZİ ROZETLERİ
    // ==========================================
    if (isArsa) {
        // 1.1 Fiyat Rozeti ("Klasik Altın" Ana Rozet)
        if (hasPrice) {
            let fItem = getLibraryCalloutBadge('fiyat', 'Klasik Altın');
            if (fItem) {
                const fs = getSafeFontSize(formattedPrice, 28, 16);
                fItem.svg = fItem.svg.replace(/>₺?\s*[0-9\.\,]+\s*(?:TL|₺)?</g, `>${formattedPrice}<`);
                fItem.svg = fItem.svg.replace(/font-size="28"/, `font-size="${fs}"`);
                fItem.name = `💰 ${formattedPrice}`;
                matchedBadges.push(fItem);
            } else {
                matchedBadges.push({ name: `💰 ${formattedPrice}`, category: 'fiyat', svg: createFittedSvgBadge('fiyat', formattedPrice) });
            }
        }

        // 1.2 Alan Rozeti ("Tarla Kart" Ana Rozet)
        if (hasSize) {
            let subAraziTag = rawTapu ? rawTapu.toUpperCase() : (rawText.includes('tarla') ? 'MÜSTAKİL TARLA' : 'ARAZİ ALANI');
            let aItem = getLibraryCalloutBadge('arsa', 'Tarla Kart');
            if (aItem) {
                const fs = getSafeFontSize(formattedSize, 26, 18);
                aItem.svg = aItem.svg
                    .replace(/>3\.500\s*m²</g, `>${formattedSize}<`)
                    .replace(/>TARLA\s*·\s*SULU</g, `>${subAraziTag}<`);
                aItem.svg = aItem.svg.replace(/font-size="26"/, `font-size="${fs}"`);
                aItem.name = `🌳 ${formattedSize}`;
                matchedBadges.push(aItem);
            } else {
                matchedBadges.push({ name: `📐 ${formattedSize}`, category: 'arsa', svg: createFittedSvgBadge('arsa_alan', formattedSize, subAraziTag) });
            }
        }

        // 1.3 Ada / Parsel Rozeti ("Tapu Belgesi" Ana Rozet - SADECE İLANDA VARSA)
        if (hasAdaParsel) {
            let adaText = '';
            if (hasAda && hasParsel) adaText = `ADA: ${rawAda} / PARSEL: ${rawParsel}`;
            else if (hasAda) adaText = `ADA NO: ${rawAda}`;
            else if (hasParsel) adaText = `PARSEL NO: ${rawParsel}`;
            else adaText = rawAdaParsel;

            let tapuItem = getLibraryCalloutBadge('arsa', 'Tapu Belgesi');
            if (tapuItem) {
                const fs_ada = getSafeFontSize(adaText, 11, 8.5);
                tapuItem.svg = tapuItem.svg
                    .replace(/>850\s*m²</g, `>${formattedSize || 'MÜSTAKİL'}<`)
                    .replace(/>Pafta:\s*12\s*·\s*Ada:\s*456</g, `>${adaText}<`);
                tapuItem.svg = tapuItem.svg.replace(/font-size="9"/, `font-size="${fs_ada}"`);
                tapuItem.name = `🏛️ ${adaText}`;
                matchedBadges.push(tapuItem);
            } else {
                matchedBadges.push({ name: `🏛️ ${adaText}`, category: 'arsa', svg: createFittedSvgBadge('ada_parsel', adaText, formattedSize) });
            }
        }

        // 1.4 İmar / Nitelik Rozeti ("İmarlı Damga" Ana Rozet - SADECE İLANDA VARSA)
        if (hasImar) {
            let imarTitle = rawImar.toUpperCase();
            let imarItem = getLibraryCalloutBadge('arsa', 'İmarlı Damga');
            if (imarItem) {
                imarItem.svg = imarItem.svg
                    .replace(/>İMARLI</g, `>${imarTitle}<`)
                    .replace(/>1\.250</g, `>${cleanSizeNum || 'ARSA'}<`);
                imarItem.name = `🌱 ${imarTitle}`;
                matchedBadges.push(imarItem);
            } else {
                matchedBadges.push({ name: `🌱 ${imarTitle}`, category: 'arsa', svg: createFittedSvgBadge('imar', imarTitle, formattedSize) });
            }
        }

        // 1.5 Konum Rozeti ("Kare Etiket" Ana Rozet - SADECE İLANDA VARSA)
        if (hasLocation) {
            let locItem = getLibraryCalloutBadge('konum', 'Kare Etiket');
            const displayLoc = (districtStr && cityStr && districtStr !== cityStr) ? `${districtStr} / ${cityStr}` : (districtStr || cityStr || activeLoc);
            if (locItem && (districtStr || cityStr)) {
                locItem.svg = locItem.svg
                    .replace(/>Kadıköy</g, `>${districtStr || cityStr}<`)
                    .replace(/>İstanbul</g, `>${cityStr || 'TÜRKİYE'}<`);
                locItem.name = `📍 ${displayLoc}`;
                matchedBadges.push(locItem);
            } else {
                matchedBadges.push({ name: `📍 ${displayLoc}`, category: 'konum', svg: createFittedSvgBadge('konum', displayLoc) });
            }
        }

        // 1.6 Özellik Rozeti (Yol / Manzara / vb. Varsa)
        if (rawText.includes('kadastro') || rawText.includes('yol') || rawText.includes('asfalt')) {
            matchedBadges.push({
                name: `🛣️ Yola Cepheli`,
                category: 'arsa',
                svg: createFittedSvgBadge('ozellik', 'RESMİ YOLA CEPHELİ')
            });
        } else if (rawText.includes('deniz') || rawText.includes('manzara') || rawText.includes('göl')) {
            matchedBadges.push({
                name: `🌅 Doğa & Manzara`,
                category: 'arsa',
                svg: createFittedSvgBadge('ozellik', 'DOĞA & MANZARA')
            });
        }

        // 1.7 🔥 m² Birim Fiyatı Rozeti (Ekstra Değerleme)
        if (calculatedM2Price) {
            matchedBadges.push({
                name: `🔥 ${calculatedM2Price}`,
                category: 'firsat',
                svg: createFittedSvgBadge('firsat', calculatedM2Price, 'ARAZİ m² BİRİM FİYATI')
            });
        }

        // 1.8 💎 Yatırımlık Fırsat Rozeti
        matchedBadges.push({
            name: `💎 Yüksek Prim Potansiyeli`,
            category: 'yatirim',
            svg: createFittedSvgBadge('yatirim', 'YATIRIMLIK ARSA', 'YÜKSEK PRİM DEĞERİ')
        });
    }

    // ==========================================
    // 🏡 2. VİLLA / LÜKS MÜSTAKİL ROZETLERİ
    // ==========================================
    else if (isVilla) {
        // 2.1 Fiyat Rozeti ("F2 Lüks Gold" Ana Rozet)
        if (hasPrice) {
            let fItem = getLibraryCalloutBadge('fiyat', 'F2  Lüks Gold') || getLibraryCalloutBadge('fiyat', 'Klasik Altın');
            if (fItem) {
                const fs = getSafeFontSize(formattedPrice, 24, 16);
                fItem.svg = fItem.svg.replace(/>₺?\s*[0-9\.\,]+\s*(?:TL|₺)?</g, `>${formattedPrice}<`);
                fItem.svg = fItem.svg.replace(/font-size="24"/, `font-size="${fs}"`);
                fItem.name = `💰 ${formattedPrice}`;
                matchedBadges.push(fItem);
            } else {
                matchedBadges.push({ name: `💰 ${formattedPrice}`, category: 'fiyat', svg: createFittedSvgBadge('fiyat', formattedPrice) });
            }
        }

        // 2.2 Villa Tipi / Oda (SADECE VARSA)
        if (hasRooms) {
            const villaRooms = rawRooms.toUpperCase();
            let odaItem = getLibraryCalloutBadge('oda', 'Altın Büyük Rakam') || getLibraryCalloutBadge('oda', 'Plan Kartı');
            if (odaItem) {
                odaItem.svg = odaItem.svg.replace(/>3\+1</g, `>${villaRooms}<`).replace(/>DAİRE\s*TİPİ</g, `>VİLLA TİPİ<`);
                odaItem.name = `🏡 ${villaRooms} Villa`;
                matchedBadges.push(odaItem);
            } else {
                matchedBadges.push({ name: `🏡 ${villaRooms} Villa`, category: 'oda', svg: createFittedSvgBadge('oda', villaRooms + ' Villa', 'MÜSTAKİL YAŞAM') });
            }
        }

        // 2.3 Alan
        if (hasSize) {
            let m2Item = getLibraryCalloutBadge('metrekare', 'Altın Rozet');
            if (m2Item) {
                m2Item.svg = m2Item.svg.replace(/>220</g, `>${cleanSizeNum}<`);
                m2Item.name = `📐 ${formattedSize}`;
                matchedBadges.push(m2Item);
            } else {
                matchedBadges.push({ name: `📐 ${formattedSize}`, category: 'metrekare', svg: createFittedSvgBadge('metrekare', formattedSize, 'GENİŞ KULLANIM ALANI') });
            }
        }

        // 2.4 Özel Nitelik (Havuz / Deniz / Akıllı Ev)
        let feat = rawText.includes('havuz') ? 'ÖZEL HAVUZLU' : (rawText.includes('deniz') ? 'DENİZ MANZARALI' : (rawText.includes('akıllı') ? 'AKILLI EV SİSTEMİ' : ''));
        if (feat) {
            matchedBadges.push({ name: `⭐ ${feat}`, category: 'ozellik', svg: createFittedSvgBadge('ozellik', feat) });
        }

        // 2.5 Konum (SADECE VARSA)
        if (hasLocation) {
            let locItem = getLibraryCalloutBadge('konum', 'Kare Etiket');
            const displayLoc = (districtStr && cityStr && districtStr !== cityStr) ? `${districtStr} / ${cityStr}` : (districtStr || cityStr || activeLoc);
            if (locItem && (districtStr || cityStr)) {
                locItem.svg = locItem.svg.replace(/>Kadıköy</g, `>${districtStr || cityStr}<`).replace(/>İstanbul</g, `>${cityStr || 'TÜRKİYE'}<`);
                locItem.name = `📍 ${displayLoc}`;
                matchedBadges.push(locItem);
            } else {
                matchedBadges.push({ name: `📍 ${displayLoc}`, category: 'konum', svg: createFittedSvgBadge('konum', displayLoc) });
            }
        }

        // 2.6 🔥 m² Birim Fiyatı Rozeti
        if (calculatedM2Price) {
            matchedBadges.push({ name: `🔥 ${calculatedM2Price}`, category: 'firsat', svg: createFittedSvgBadge('firsat', calculatedM2Price, 'BÖLGE m² DEĞERİ') });
        }

        // 2.7 💎 Yatırımlık Fırsat Rozeti
        matchedBadges.push({ name: `💎 VIP Prestij Portföy`, category: 'yatirim', svg: createFittedSvgBadge('yatirim', 'PRESTİJ VİLLA', 'YÜKSEK PRİM DEĞERİ') });
    }

    // ==========================================
    // 🏢 3. TİCARİ / OFİS ROZETLERİ
    // ==========================================
    else if (isTicari) {
        // 3.1 Fiyat
        if (hasPrice) {
            let fItem = getLibraryCalloutBadge('fiyat', 'Klasik Altın');
            if (fItem) {
                const fs = getSafeFontSize(formattedPrice, 28, 16);
                fItem.svg = fItem.svg.replace(/>₺?\s*[0-9\.\,]+\s*(?:TL|₺)?</g, `>${formattedPrice}<`);
                fItem.svg = fItem.svg.replace(/font-size="28"/, `font-size="${fs}"`);
                fItem.name = `💰 ${formattedPrice}`;
                matchedBadges.push(fItem);
            } else {
                matchedBadges.push({ name: `💰 ${formattedPrice}`, category: 'fiyat', svg: createFittedSvgBadge('fiyat', formattedPrice) });
            }
        }

        // 3.2 Alan
        if (hasSize) {
            let m2Item = getLibraryCalloutBadge('metrekare', 'Altın Rozet');
            if (m2Item) {
                m2Item.svg = m2Item.svg.replace(/>220</g, `>${cleanSizeNum}<`);
                m2Item.name = `📐 ${formattedSize}`;
                matchedBadges.push(m2Item);
            } else {
                matchedBadges.push({ name: `📐 ${formattedSize}`, category: 'metrekare', svg: createFittedSvgBadge('metrekare', formattedSize, 'KULLANIM ALANI') });
            }
        }

        // 3.3 Tip / Nitelik
        matchedBadges.push({ name: `🏢 Ticari İşyeri`, category: 'oda', svg: createFittedSvgBadge('oda', 'TİCARİ', 'PLAZA / İŞYERİ') });

        // 3.4 Konum (SADECE VARSA)
        if (hasLocation) {
            let locItem = getLibraryCalloutBadge('konum', 'Kare Etiket');
            const displayLoc = (districtStr && cityStr && districtStr !== cityStr) ? `${districtStr} / ${cityStr}` : (districtStr || cityStr || activeLoc);
            if (locItem && (districtStr || cityStr)) {
                locItem.svg = locItem.svg.replace(/>Kadıköy</g, `>${districtStr || cityStr}<`).replace(/>İstanbul</g, `>${cityStr || 'TÜRKİYE'}<`);
                locItem.name = `📍 ${displayLoc}`;
                matchedBadges.push(locItem);
            } else {
                matchedBadges.push({ name: `📍 ${displayLoc}`, category: 'konum', svg: createFittedSvgBadge('konum', displayLoc) });
            }
        }

        // 3.5 Özellik
        if (rawText.includes('cadde') || rawText.includes('yol') || rawText.includes('vitrin')) {
            matchedBadges.push({ name: `🛣️ Cadde Cepheli`, category: 'ozellik', svg: createFittedSvgBadge('ozellik', 'CADDE CEPHELİ') });
        }

        // 3.6 🔥 m² Birim Fiyatı Rozeti
        if (calculatedM2Price) {
            matchedBadges.push({ name: `🔥 ${calculatedM2Price}`, category: 'firsat', svg: createFittedSvgBadge('firsat', calculatedM2Price, 'TİCARİ m² DEĞERİ') });
        }

        // 3.7 💎 Yüksek Kira Getirisi Rozeti
        matchedBadges.push({ name: `💎 Yüksek Kira Getirisi`, category: 'yatirim', svg: createFittedSvgBadge('yatirim', 'TİCARİ YATIRIM', 'YÜKSEK KİRA GETİRİSİ') });
    }

    // ==========================================
    // 🏠 4. DAİRE / KONUT ROZETLERİ
    // ==========================================
    else {
        // 4.1 Fiyat
        if (hasPrice) {
            let fItem = getLibraryCalloutBadge('fiyat', 'Klasik Altın');
            if (fItem) {
                const fs = getSafeFontSize(formattedPrice, 28, 16);
                fItem.svg = fItem.svg.replace(/>₺?\s*[0-9\.\,]+\s*(?:TL|₺)?</g, `>${formattedPrice}<`);
                fItem.svg = fItem.svg.replace(/font-size="28"/, `font-size="${fs}"`);
                fItem.name = `💰 ${formattedPrice}`;
                matchedBadges.push(fItem);
            } else {
                matchedBadges.push({ name: `💰 ${formattedPrice}`, category: 'fiyat', svg: createFittedSvgBadge('fiyat', formattedPrice) });
            }
        }

        // 4.2 Alan
        if (hasSize) {
            let m2Item = getLibraryCalloutBadge('metrekare', 'Altın Rozet');
            if (m2Item) {
                m2Item.svg = m2Item.svg.replace(/>220</g, `>${cleanSizeNum}<`);
                m2Item.name = `📐 ${formattedSize}`;
                matchedBadges.push(m2Item);
            } else {
                matchedBadges.push({ name: `📐 ${formattedSize}`, category: 'metrekare', svg: createFittedSvgBadge('metrekare', formattedSize, 'BRÜT KULLANIM ALANI') });
            }
        }

        // 4.3 Oda (SADECE VARSA)
        if (hasRooms) {
            const daireRooms = rawRooms.toUpperCase();
            let odaItem = getLibraryCalloutBadge('oda', 'Altın Büyük Rakam') || getLibraryCalloutBadge('oda', 'Plan Kartı');
            if (odaItem) {
                odaItem.svg = odaItem.svg.replace(/>3\+1</g, `>${daireRooms}<`);
                odaItem.name = `🏠 ${daireRooms} Daire`;
                matchedBadges.push(odaItem);
            } else {
                matchedBadges.push({ name: `🏠 ${daireRooms} Daire`, category: 'oda', svg: createFittedSvgBadge('oda', daireRooms, 'ODA + SALON') });
            }
        }

        // 4.4 Konum (SADECE VARSA)
        if (hasLocation) {
            let locItem = getLibraryCalloutBadge('konum', 'Kare Etiket');
            const displayLoc = (districtStr && cityStr && districtStr !== cityStr) ? `${districtStr} / ${cityStr}` : (districtStr || cityStr || activeLoc);
            if (locItem && (districtStr || cityStr)) {
                locItem.svg = locItem.svg.replace(/>Kadıköy</g, `>${districtStr || cityStr}<`).replace(/>İstanbul</g, `>${cityStr || 'TÜRKİYE'}<`);
                locItem.name = `📍 ${displayLoc}`;
                matchedBadges.push(locItem);
            } else {
                matchedBadges.push({ name: `📍 ${displayLoc}`, category: 'konum', svg: createFittedSvgBadge('konum', displayLoc) });
            }
        }

        // 4.5 Kat / Nitelik (SADECE VARSA)
        const featText = rawFloor || (rawText.includes('sıfır') ? 'SIFIR YENİ BİNA' : (rawText.includes('kredi') ? 'KREDİYE UYGUN' : (rawText.includes('deniz') ? 'DENİZ MANZARALI' : '')));
        if (featText) {
            matchedBadges.push({ name: `⭐ ${featText}`, category: 'ozellik', svg: createFittedSvgBadge('ozellik', featText) });
        }

        // 4.6 🔥 m² Birim Fiyatı Rozeti
        if (calculatedM2Price) {
            matchedBadges.push({ name: `🔥 ${calculatedM2Price}`, category: 'firsat', svg: createFittedSvgBadge('firsat', calculatedM2Price, 'BÖLGE m² FİYATI') });
        }

        // 4.7 💎 Yatırımlık Fırsat Rozeti
        matchedBadges.push({ name: `💎 Yüksek Prim Potansiyeli`, category: 'yatirim', svg: createFittedSvgBadge('yatirim', 'FIRSAT KONUT', 'YÜKSEK PRİM DEĞERİ') });
    }

    window.smartMatchedCallouts = matchedBadges;

    // 1.3 BÖLGE VE ÇEVRESEL VURGULAR (REGIONAL HIGHLIGHTS)
    const highlights = [];
    if (hasLocation) {
        highlights.push(`📍 ${activeLoc} Bölgesinde`);
    }
    if (rawText.includes('metro') || rawText.includes('metrobüs') || rawText.includes('ulaşım') || rawText.includes('dolmuş') || rawText.includes('otobüs')) {
        highlights.push(`🚇 Ulaşıma & Ana Arterlere Yakın`);
    }
    if (rawText.includes('okul') || rawText.includes('kolej') || rawText.includes('üniversite')) {
        highlights.push(`🎓 Eğitim Kurumları Aksında`);
    }
    if (rawText.includes('hastane') || rawText.includes('sağlık')) {
        highlights.push(`🏥 Sağlık Kuruluşlarına Yakın`);
    }
    if (rawText.includes('deniz') || rawText.includes('sahil') || rawText.includes('marina') || rawText.includes('plaj')) {
        highlights.push(`⛵ Sahil & Marina Aksında`);
    }
    if (rawText.includes('cadde') || rawText.includes('yol') || rawText.includes('asfalt') || rawText.includes('kadastro')) {
        highlights.push(`🛣️ Kadastro Yoluna Cepheli`);
    }
    if (rawText.includes('yatırım') || rawText.includes('prim') || rawText.includes('kira getiri') || rawText.includes('fırsat')) {
        highlights.push(`📈 Yüksek Prim & Yatırım Değeri`);
    }
    if (highlights.length === 0) {
        highlights.push(`📍 Seçkin ve Gelişen Lokasyon`);
        highlights.push(`📈 Yüksek Yatırım Değeri`);
        highlights.push(`🚗 Kolay Ulaşım İmkanı`);
    }
    window.smartRegionalHighlights = [...new Set(highlights)];

    // 1.4 METİN ROZETLERİ (Pill Badges - SADECE GERÇEKTEN MEVCUT VERİLER)
    if (hasPrice) window.smartBadges.push({ text: `💰 ${formattedPrice}`, category: 'price', style: 'gold' });
    if (hasSize) window.smartBadges.push({ text: `📐 ${formattedSize}`, category: 'size', style: 'emerald' });
    if (hasRooms && !isArsa) window.smartBadges.push({ text: `🏠 ${rawRooms} Daire`, category: 'rooms', style: 'blue' });
    if (hasImar) window.smartBadges.push({ text: `🌾 İmar: ${rawImar}`, category: 'imar', style: 'purple' });
    if (hasAdaParsel) {
        let pText = hasAda && hasParsel ? `🗺️ Ada: ${rawAda} / Parsel: ${rawParsel}` : (hasAda ? `🗺️ Ada: ${rawAda}` : `🗺️ Parsel: ${rawParsel}`);
        window.smartBadges.push({ text: pText, category: 'parsel', style: 'modern' });
    }
    if (rawTapu && rawTapu.toLowerCase() !== 'null') window.smartBadges.push({ text: `🔑 ${rawTapu}`, category: 'tapu', style: 'gold' });
    if (rawFloor && rawFloor.toLowerCase() !== 'null') window.smartBadges.push({ text: `🏢 ${rawFloor}`, category: 'floor', style: 'modern' });
    if (rawText.includes('havuz')) window.smartBadges.push({ text: `🏊 Yüzme Havuzlu`, category: 'pool', style: 'blue' });
    if (rawText.includes('deniz')) window.smartBadges.push({ text: `🌅 Deniz Manzaralı`, category: 'view', style: 'blue' });
    if (rawText.includes('otopark') || rawText.includes('garaj')) window.smartBadges.push({ text: `🚗 Otoparklı`, category: 'parking', style: 'modern' });
    if (rawText.includes('kredi')) window.smartBadges.push({ text: `💳 Krediye Uygun`, category: 'credit', style: 'emerald' });
    if (rawText.includes('sıfır') || rawText.includes('yeni yapı')) window.smartBadges.push({ text: `✨ Sıfır / Hemen Teslim`, category: 'new', style: 'gold' });

    // 1.5 İKONLAR
    const icons = ['🏠', '📐', '💰', '📍', '🔑'];
    if (hasImar || isArsa || rawText.includes('arsa') || rawText.includes('tarla')) icons.push('🌳', '🌾');
    if (rawText.includes('havuz')) icons.push('🏊');
    if (rawText.includes('otopark') || rawText.includes('garaj')) icons.push('🚗');
    if (rawText.includes('deniz')) icons.push('🌅');
    if (rawText.includes('kredi')) icons.push('💳');
    window.smartMatchedIcons = [...new Set(icons)];

    // 1.6 BÖLGE VE İLAN AÇIKLAMALARI
    const locName = activeLoc || 'Merkezi Lokasyon';
    const propTitle = data.title || `${locName} Satılık Gayrimenkul`;
    const propPrice = formattedPrice || 'Fiyat İçin İletişime Geçiniz';
    const propSize = formattedSize || '';
    const propRooms = hasRooms ? `${rawRooms} Oda Dağılımı` : '';

    if (!window.smartAiDescription) {
        window.smartAiDescription = `✨ ${propTitle}\n\n📍 LOKASYON & BÖLGE AVANTAJLARI:\n• ${locName} bölgesinin en seçkin ve prim potansiyeli yüksek lokasyonunda\n• Ulaşım ağlarına, ana arterlere ve sosyal donatılara yakın\n• Nezih çevre ve huzurlu yaşam alanı\n\n🏡 ÖNE ÇIKAN ÖZELLİKLER:\n• ${propRooms ? propRooms + ' ferah yaşam alanı' : 'Kullanışlı mimari plan'}\n• ${propSize ? propSize + ' geniş kullanım alanı' : 'Ferah kullanım alanı'}\n• Fiyat: ${propPrice}\n• ${rawTapu ? 'Tapu Durumu: ' + rawTapu : 'Sorunsuz ve krediye uygun mülkiyet'}\n\n📞 Detaylı bilgi, randevu ve sunum için lütfen iletişime geçiniz.`;
    }

    if (!window.smartAiSocialPost) {
        window.smartAiSocialPost = `🔥 ${propTitle}!\n\n📍 ${locName}\n💰 ${propPrice}\n📐 ${propSize || 'Geniş Alan'}\n🏠 ${propRooms || 'Özel Mimari'}\n\n✨ Bölgenin en cazip portföyü için detaylar profildeki linkte ve DM'de!\n\n#emlak #satılık #${(data.district || 'gayrimenkul').replace(/\s+/g, '')} #${(data.city || 'konut').replace(/\s+/g, '')} #fırsat #yatırım`;
    }

    if (!window.smartReelsHook) {
        window.smartReelsHook = `🎬 3 SANİYELİK REELS KANCASI (Seslendirme / Başlık):\n"Bu fiyata bu lokasyonda yer bulmak artık imkansız! ${locName} bölgesindeki ${propSize} fırsatını kaçırmayın..."\n\n📌 INSTAGRAM REELS BAŞLIĞI:\n"Yatırımcısını Zengin Edecek Fırsat Portföy! 🚀 Detaylar açıklamada ⬇️"`;
    }

    if (!window.smartVoiceoverScript) {
        window.smartVoiceoverScript = window.generateSmartVoiceoverScript({
            title: propTitle,
            price: propPrice,
            size: propSize,
            rooms: propRooms,
            imar: data.imar,
            tapu: data.tapu,
            location: locName,
            type: data.type,
            desc: rawText
        });
    }

    // 1.7 ARAYÜZÜ YENİLE VE PANELİ OTOMATİK AÇ
    window.renderSmartSuggestionsUI();

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
    
    const totalCount = ((window.smartBadges && Array.isArray(window.smartBadges)) ? window.smartBadges.length : 0) + 
                       ((window.smartMatchedCallouts && Array.isArray(window.smartMatchedCallouts)) ? window.smartMatchedCallouts.length : 0);
    
    if (badgeCount) {
        badgeCount.textContent = `${totalCount} Öneri`;
        if (totalCount > 0) badgeCount.classList.add('pulse');
        else badgeCount.classList.remove('pulse');
    }

    if (!body) return;

    if (totalCount === 0 && (!window.smartMatchedCallouts || window.smartMatchedCallouts.length === 0)) {
        body.innerHTML = `
            <div style="padding:14px; text-align:center; color:#94a3b8; font-size:12px; line-height:1.5;">
                <span>💡 İlan metnini yapıştırıp <strong>"🤖 Metni Süz"</strong> butonuna bastığınızda, bölge analizli açıklamalar, grafik rozetler ve onaylanabilir öğeler burada listelenir.</span>
            </div>
        `;
        return;
    }

    let html = '';

    // Bölüm 1: 🌟 İLAN BİLGİLERİYLE DOLDURULMUŞ GRAFİK ROZETLER (CALLOUT)
    if (window.smartMatchedCallouts && window.smartMatchedCallouts.length > 0) {
        html += `
            <div class="smart-sub-section">
                <div class="smart-sub-title" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span class="smart-section-header">✨ İlana Özel Grafik Rozetler (${window.smartMatchedCallouts.length})</span>
                    <span class="smart-section-hint">Tıkla Tuvale Ekle</span>
                </div>
                <div class="smart-callouts-scroll" style="display:flex; gap:10px; overflow-x:auto; padding-bottom:6px;">
        `;

        window.smartMatchedCallouts.forEach((item, idx) => {
            html += `
                <div class="smart-callout-mini-card" onclick="if(window.addSVGCalloutToCanvas) window.addSVGCalloutToCanvas(window.smartMatchedCallouts[${idx}])" title="${item.name} - Tuvale Ekle" style="min-width:125px; max-width:140px; background:rgba(15,23,42,0.6); border:1.5px solid rgba(250,204,21,0.5); border-radius:8px; padding:6px; cursor:pointer; text-align:center; transition:all 0.2s;">
                    <div class="mini-svg-wrap" style="transform:scale(0.42); transform-origin:center; height:48px; display:flex; align-items:center; justify-content:center; pointer-events:none;">${item.svg}</div>
                    <span class="mini-card-name" style="font-size:10.5px; font-weight:700; color:#f8fafc; display:block; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</span>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    // Bölüm 1.5: 🎨 ŞABLONLAR SEKMESİNDEN EN UYGUN ŞABLONLAR
    const recTemplates = window.getRecommendedCanvaTemplates(window.lastParsedData || {}, window.lastRawText || '');
    if (recTemplates && recTemplates.length > 0) {
        html += `
            <div class="smart-sub-section" style="margin-top: 12px; border-top:1px solid rgba(255,255,255,0.06); padding-top:10px;">
                <div class="smart-sub-title" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span class="smart-section-header purple"><i class="fa-solid fa-wand-magic-sparkles"></i> 🎨 Bu İlana Uyumlu Şablon Önerileri</span>
                    <span class="smart-section-hint">Tıkla & Tuvale Giydir</span>
                </div>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:8px;">
        `;

        recTemplates.forEach((t) => {
            html += `
                <div class="smart-tpl-rec-card" onclick="window.applyCanvaTabTemplate('${t.catId}', ${t.idx})" title="${t.name} (${t.colorLabel}) şablonunu tuvale uygula" style="border:1.5px solid #334155; border-radius:10px; padding:8px 6px; cursor:pointer; text-align:center; transition:all 0.2s; background:rgba(15,23,42,0.6); position:relative; overflow:hidden;">
                    <div style="position:absolute; top:0; left:0; right:0; height:3px; background:${t.colorGradient};"></div>
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; margin-top:2px;">
                        <span style="font-size:16px;">${t.icon}</span>
                        <span style="font-size:8px; font-weight:800; background:rgba(255,255,255,0.1); color:#cbd5e1; padding:1px 5px; border-radius:4px; text-transform:uppercase;">${t.tag}</span>
                    </div>
                    <strong class="rec-tpl-name" style="font-size:11px; font-weight:700; color:#f8fafc; display:block; margin:2px 0 4px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.name}</strong>
                    <div style="display:flex; align-items:center; justify-content:center; gap:4px; margin-bottom:6px;">
                        <span style="width:8px; height:8px; border-radius:50%; background:${t.colorGradient}; display:inline-block;"></span>
                        <span style="font-size:9px; color:#cbd5e1;">${t.colorLabel}</span>
                    </div>
                    <button type="button" class="smart-tpl-apply-btn" style="width:100%; border:none; background:${t.colorGradient}; color:#fff; font-size:10px; font-weight:800; padding:4px 0; border-radius:6px; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,0.3);">Uygula</button>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    // Bölüm 2: 📍 BÖLGE AVANTAJLARI & KULLANICI ONAYLI VURGULAR
    if (window.smartRegionalHighlights && window.smartRegionalHighlights.length > 0) {
        html += `
            <div class="smart-sub-section" style="margin-top: 12px; border-top:1px solid rgba(255,255,255,0.06); padding-top:10px;">
                <div class="smart-sub-title" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span class="smart-section-header blue">📍 Bölge Özellikleri (Onaylayıp Tuvale Ekleyin)</span>
                    <span class="smart-section-hint">Tek Tıkla Ekle</span>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:6px;">
        `;

        window.smartRegionalHighlights.forEach((reg, idx) => {
            const escaped = String(reg).replace(/'/g, "\'");
            html += `
                <button type="button" class="smart-outline-pill-btn" onclick="window.createFramedBadgeOnCanvas('${escaped}', 'blue')" title="Bu bölge vurgusunu tuvale rozet olarak ekle">
                    <span>${reg}</span>
                    <i class="fa-solid fa-plus" style="font-size:9px; color:#38bdf8;"></i>
                </button>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    // Bölüm 3: 📝 AKILLI İLAN AÇIKLAMASI, REELS & SESLENDİRME METNİ
    let activeTab = window.activeAiDescTab || 'sahibinden';
    if (window.innerWidth <= 768 && activeTab === 'voiceover') {
        activeTab = 'sahibinden';
        window.activeAiDescTab = 'sahibinden';
    }
    let descText = window.smartAiDescription || '';
    if (activeTab === 'social') descText = window.smartAiSocialPost || '';
    else if (activeTab === 'reels') descText = window.smartReelsHook || '';
    else if (activeTab === 'voiceover') descText = window.smartVoiceoverScript || '';

    html += `
        <div class="smart-sub-section" style="margin-top: 14px; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="smart-section-header purple">
                    <i class="fa-solid fa-feather-pointed" style="color:#a855f7;"></i> Akıllı İlan & Reels
                </span>
                <div style="display:flex; gap:3px;">
                    <button type="button" onclick="window.switchAiDescTab('sahibinden')" class="smart-outline-tab-btn ${activeTab === 'sahibinden' ? 'active' : ''}" style="background:${activeTab === 'sahibinden' ? 'rgba(168,85,247,0.2)' : 'transparent'}; border:1px solid ${activeTab === 'sahibinden' ? '#a855f7' : 'rgba(255,255,255,0.15)'}; color:${activeTab === 'sahibinden' ? '#e9d5ff' : '#94a3b8'}; font-size:9.5px; font-weight:700; padding:2px 6px; border-radius:4px; cursor:pointer;">Sahibinden</button>
                    <button type="button" onclick="window.switchAiDescTab('social')" class="smart-outline-tab-btn ${activeTab === 'social' ? 'active' : ''}" style="background:${activeTab === 'social' ? 'rgba(56,189,248,0.2)' : 'transparent'}; border:1px solid ${activeTab === 'social' ? '#38bdf8' : 'rgba(255,255,255,0.15)'}; color:${activeTab === 'social' ? '#bae6fd' : '#94a3b8'}; font-size:9.5px; font-weight:700; padding:2px 6px; border-radius:4px; cursor:pointer;">Instagram</button>
                    <button type="button" onclick="window.switchAiDescTab('reels')" class="smart-outline-tab-btn ${activeTab === 'reels' ? 'active' : ''}" style="background:${activeTab === 'reels' ? 'rgba(234,179,8,0.2)' : 'transparent'}; border:1px solid ${activeTab === 'reels' ? '#eab308' : 'rgba(255,255,255,0.15)'}; color:${activeTab === 'reels' ? '#fef08a' : '#94a3b8'}; font-size:9.5px; font-weight:700; padding:2px 6px; border-radius:4px; cursor:pointer;">🎬 Reels</button>
                    <button type="button" onclick="window.switchAiDescTab('voiceover')" class="smart-outline-tab-btn smart-voiceover-tab pc-only ${activeTab === 'voiceover' ? 'active' : ''}" style="background:${activeTab === 'voiceover' ? 'rgba(16,185,129,0.2)' : 'transparent'}; border:1px solid ${activeTab === 'voiceover' ? '#10b981' : 'rgba(255,255,255,0.15)'}; color:${activeTab === 'voiceover' ? '#a7f3d0' : '#94a3b8'}; font-size:9.5px; font-weight:700; padding:2px 6px; border-radius:4px; cursor:pointer;">🎙️ Seslendirme</button>
                </div>
            </div>

            <textarea id="smartGeneratedDescArea" class="smart-desc-area" rows="4" style="width:100%; height:95px; resize:vertical; line-height:1.5; font-size:11.5px; border-radius:8px; padding:8px 10px; box-sizing:border-box;">${descText}</textarea>

            <div style="display:flex; gap:6px; margin-top:6px;">
                <button type="button" onclick="window.copySmartDescription()" class="smart-outline-action-btn smart-copy-btn" title="Metni Panoya Kopyalar">
                    <i class="fa-solid fa-copy"></i> Metni Kopyala
                </button>
                <button type="button" onclick="window.applySmartDescToForm()" class="smart-outline-action-btn smart-apply-btn" title="İlan Açıklamasına Aktarır">
                    <i class="fa-solid fa-file-pen"></i> Açıklamaya Aktar
                </button>
                <button type="button" onclick="if(window.VoiceStudio) window.VoiceStudio.rescanFormAndRegenerate()" class="smart-outline-action-btn smart-rescan-btn pc-only" title="Formdaki güncel fiyat, m² ve detayları yeniden tarar">
                    <i class="fa-solid fa-arrows-rotate"></i> Yeniden Tara
                </button>
            </div>

            <!-- 🎙️ SESLENDİRME STÜDYOSU PANELİ (AI VOICEOVER & MP3 ENGINE - Sadece PC) -->
            <div id="smartVoiceoverStudioPanel" class="voice-studio-panel pc-only" style="display:${activeTab === 'voiceover' ? 'block' : 'none'};">
                <div class="voice-studio-header">
                    <span class="voice-studio-title">
                        <i class="fa-solid fa-headphones"></i> Emlak Reklam Seslendirme Motoru
                    </span>
                    <div id="voiceQuotaDisplay" class="voice-studio-quota">
                        ${(window.VoiceStudio && typeof window.VoiceStudio.isAdmin === 'function' && window.VoiceStudio.isAdmin()) ? `🛡️ Admin (Nöral) • Kalan Kota: <strong class="voice-quota-val">${window.VoiceStudio.getQuotaStatus().remaining}/${window.VoiceStudio.getQuotaStatus().total}</strong>` : `<span class="voice-quota-free">⚡ Hızlı & Ücretsiz Seslendirme</span>`}
                    </div>
                </div>

                <!-- 🪄 AI İLE DÜZENLE / KOMUT VER ÇUBUĞU -->
                <div class="voice-studio-ai-box">
                    <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:6px;">
                        <button type="button" onclick="if(window.VoiceStudio) window.VoiceStudio.refineVoiceoverWithAI('Daha kısa, öz ve 20 saniyelik vurucu bir reklam spotu olarak yaz')" class="voice-studio-quick-btn kisa">⚡ Daha Kısa</button>
                        <button type="button" onclick="if(window.VoiceStudio) window.VoiceStudio.refineVoiceoverWithAI('Daha heyecanlı, dinamik ve aciliyet hissi veren bir satış spotu olarak yaz')" class="voice-studio-quick-btn vurgu">📢 Daha Vurgulu</button>
                        <button type="button" onclick="if(window.VoiceStudio) window.VoiceStudio.refineVoiceoverWithAI('Lüks, prestijli, seçkin ve elit yaşam vurgulu bir reklam filmi dış sesi olarak yaz')" class="voice-studio-quick-btn luks">💎 Lüks & Prestij</button>
                        <button type="button" onclick="if(window.VoiceStudio) window.VoiceStudio.refineVoiceoverWithAI('Yüksek prim getirisi, geleceğe yatırım ve kazanç potansiyelini öne çıkararak yaz')" class="voice-studio-quick-btn yatirim">🌾 Yatırım Odaklı</button>
                    </div>
                    <div style="display:flex; gap:4px;">
                        <input type="text" id="voiceCustomPromptInput" class="voice-studio-input" placeholder="Özel komut (örn: 'Deniz manzarasını öne çıkar', 'Daha samimi dille yaz')..." onkeydown="if(event.key==='Enter'&&window.VoiceStudio) window.VoiceStudio.refineVoiceoverWithAI(this.value)">
                        <button type="button" onclick="if(window.VoiceStudio) window.VoiceStudio.refineVoiceoverWithAI()" class="voice-studio-btn-refine" title="AI ile Yeniden Üret">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Düzenle
                        </button>
                    </div>
                </div>

                <!-- Ses ve Hız Seçimi -->
                <div style="display:flex; gap:6px; align-items:center; width:100%; box-sizing:border-box; margin-bottom:8px;">
                    <select id="voiceEngineSelect" class="voice-studio-select" style="flex:1; min-width:0;" title="Ses Motoru Seçimi">
                        ${(window.VoiceStudio && typeof window.VoiceStudio.isAdmin === 'function' && window.VoiceStudio.isAdmin()) ? `
                            <option value="charon_neural" selected>🌟 Charon Neural (HD Erkek - Karizmatik) [Admin]</option>
                            <option value="zephyr_neural">🌟 Zephyr Neural (HD Kadın - Prestijli) [Admin]</option>
                            <option value="wavenet_male">📻 WaveNet Klasik (Erkek - Spiker) [Admin]</option>
                            <option value="wavenet_female">📻 WaveNet Kadın (Spiker) [Admin]</option>
                            <option value="ahmet_neural">🔊 Ahmet (Erkek - Doğal)</option>
                            <option value="emel_neural">🔊 Emel (Kadın - Kurumsal)</option>
                            <option value="free_tts">🌐 Standart TTS (Hızlı)</option>
                        ` : `
                            <option value="ahmet_neural" selected>🔊 Ahmet (Erkek - Doğal Reklam)</option>
                            <option value="emel_neural">🔊 Emel (Kadın - Kurumsal & Akıcı)</option>
                            <option value="free_tts">🌐 Standart Hızlı Seslendirme</option>
                        `}
                    </select>
                    
                    <select id="voiceSpeedSelect" class="voice-studio-select" style="width:104px; flex-shrink:0; padding-left:4px; padding-right:2px;" title="Seslendirme Hızı">
                        <option value="0.95">0.95x (Sakin)</option>
                        <option value="1.0">1.0x (Doğal)</option>
                        <option value="1.05" selected>1.05x (Dinamik)</option>
                        <option value="1.15">1.15x (Hızlı)</option>
                    </select>
                </div>

                <!-- Aksiyon Butonları (Seslendir & Dinle / Durdur / MP3 İndir) -->
                <div style="display:flex; gap:6px;">
                    <button type="button" id="btnVoiceoverPlay" onclick="if(window.VoiceStudio) window.VoiceStudio.generateVoiceover()" class="voice-studio-btn-play">
                        <i class="fa-solid fa-play"></i> Seslendir ve Dinle
                    </button>
                    <button type="button" id="btnVoiceoverStop" onclick="if(window.VoiceStudio) window.VoiceStudio.stopPlayback()" class="voice-studio-btn-stop">
                        <i class="fa-solid fa-stop"></i>
                    </button>
                    <button type="button" id="btnVoiceoverDownload" onclick="if(window.VoiceStudio) window.VoiceStudio.downloadMP3()" disabled class="voice-studio-btn-download" title="Önce seslendirmeniz gerekir">
                        <i class="fa-solid fa-download"></i> MP3 İndir
                    </button>
                </div>

                <!-- Durum Bildirimi ve Oynatıcı -->
                <div id="voiceStudioStatus" class="voice-studio-status"></div>
                <audio id="voiceoverAudioPlayer" controls style="width:100%; height:32px; margin-top:6px; display:none; outline:none; border-radius:6px;"></audio>
            </div>
        </div>
    `;

    // Bölüm 4: 🏷️ DİĞER VURGU ROZETLERİ (Pill Şeklinde)
    if (window.smartBadges && window.smartBadges.length > 0) {
        html += `
            <div class="smart-sub-section" style="margin-top: 12px; border-top:1px solid rgba(255,255,255,0.06); padding-top:10px;">
                <div class="smart-sub-title" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span class="smart-section-header neutral">🏷️ Metin Vurgu Rozetleri</span>
                    <span class="smart-section-hint">Hızlı Seçim</span>
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

    // Bölüm 5: 🎯 İLGİLİ İKONLAR
    if (window.smartMatchedIcons && window.smartMatchedIcons.length > 0) {
        html += `
            <div class="smart-sub-section" style="margin-top: 10px;">
                <div class="smart-sub-title" style="font-size:11px; font-weight:700; color:#cbd5e1; margin-bottom:6px;">
                    <span>🎯 İlgili İkonlar</span>
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

    body.innerHTML = html;
};

// ==================== 3. ETKİLEŞİM & AKSIYON FONKSİYONLARI ====================
window.toggleSmartSuggestions = function() {
    const body = document.getElementById('smartSuggestionsBody');
    const chevron = document.getElementById('smartSuggestionsChevron');
    if (!body) return;

    if (body.style.display === 'none' || !body.style.display) {
        body.style.display = 'block';
        if (chevron) chevron.style.transform = 'rotate(180deg)';
    } else {
        body.style.display = 'none';
        if (chevron) chevron.style.transform = 'rotate(0deg)';
    }
};

window.switchAiDescTab = function(tabName) {
    window.activeAiDescTab = tabName;
    const area = document.getElementById('smartGeneratedDescArea');
    if (area) {
        if (tabName === 'sahibinden') area.value = window.smartAiDescription || '';
        else if (tabName === 'social') area.value = window.smartAiSocialPost || '';
        else if (tabName === 'reels') area.value = window.smartReelsHook || '';
        else if (tabName === 'voiceover') area.value = window.smartVoiceoverScript || '';
    }

    // Seslendirme paneli görünürlüğünü güncelle
    const voicePanel = document.getElementById('smartVoiceoverStudioPanel');
    if (voicePanel) {
        voicePanel.style.display = (tabName === 'voiceover') ? 'block' : 'none';
        if (tabName === 'voiceover' && window.VoiceStudio && typeof window.VoiceStudio.updateQuotaUI === 'function') {
            window.VoiceStudio.updateQuotaUI();
        }
    }

    document.querySelectorAll('.smart-outline-tab-btn').forEach(b => {
        const txt = b.innerText.toLowerCase();
        let isActive = false;
        if (tabName === 'sahibinden' && txt.includes('sahibinden')) isActive = true;
        if (tabName === 'social' && txt.includes('instagram')) isActive = true;
        if (tabName === 'reels' && txt.includes('reels')) isActive = true;
        if (tabName === 'voiceover' && (txt.includes('seslendirme') || txt.includes('ses'))) isActive = true;

        if (isActive) {
            b.classList.add('active');
            let bg = 'rgba(168,85,247,0.2)';
            let border = '#a855f7';
            let color = '#e9d5ff';
            if (tabName === 'social') { bg = 'rgba(56,189,248,0.2)'; border = '#38bdf8'; color = '#bae6fd'; }
            else if (tabName === 'reels') { bg = 'rgba(234,179,8,0.2)'; border = '#eab308'; color = '#fef08a'; }
            else if (tabName === 'voiceover') { bg = 'rgba(16,185,129,0.2)'; border = '#10b981'; color = '#a7f3d0'; }
            b.style.background = bg;
            b.style.borderColor = border;
            b.style.color = color;
        } else {
            b.classList.remove('active');
            b.style.background = 'transparent';
            b.style.borderColor = 'rgba(255,255,255,0.15)';
            b.style.color = '#94a3b8';
        }
    });
};

window.copySmartDescription = function() {
    const area = document.getElementById('smartGeneratedDescArea');
    let textToCopy = area ? area.value : '';
    if (!textToCopy) {
        if (window.activeAiDescTab === 'sahibinden') textToCopy = window.smartAiDescription;
        else if (window.activeAiDescTab === 'social') textToCopy = window.smartAiSocialPost;
        else if (window.activeAiDescTab === 'reels') textToCopy = window.smartReelsHook;
        else if (window.activeAiDescTab === 'voiceover') textToCopy = window.smartVoiceoverScript;
    }
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
        let ind = document.getElementById('autosave-indicator');
        if (ind) {
            ind.innerHTML = '📋 Açıklama panoya kopyalandı!';
            ind.style.opacity = '1';
            setTimeout(() => { ind.style.opacity = '0'; }, 2000);
        }
    }).catch(err => {
        console.error('Kopyalama hatası:', err);
    });
};

window.applySmartDescToForm = function() {
    const area = document.getElementById('smartGeneratedDescArea');
    const textToApply = area ? area.value : window.smartAiDescription;
    const descInput = document.getElementById('descInput');
    if (descInput && textToApply) {
        descInput.value = textToApply;
        if (typeof window.syncDescToggles === 'function') window.syncDescToggles();
        if (typeof window.renderData === 'function') window.renderData();
        if (typeof window.requestAutoSave === 'function') window.requestAutoSave();

        let ind = document.getElementById('autosave-indicator');
        if (ind) {
            ind.innerHTML = '✨ Açıklama alanına aktarıldı!';
            ind.style.opacity = '1';
            setTimeout(() => { ind.style.opacity = '0'; }, 2000);
        }
    }
};

window.addSmartBadgeToCanvas = function(idx) {
    if (!window.smartBadges || !window.smartBadges[idx]) return;
    const b = window.smartBadges[idx];
    if (typeof window.createFramedBadgeOnCanvas === 'function') {
        window.createFramedBadgeOnCanvas(b.text, b.style || 'modern');
    }
};

window.removeSmartBadge = function(idx) {
    if (window.smartBadges && window.smartBadges[idx]) {
        window.smartBadges.splice(idx, 1);
        window.renderSmartSuggestionsUI();
    }
};

window.createFramedBadgeOnCanvas = function(text, styleType = 'modern') {
    if (!text) return;
    const colors = {
        gold: { bg: 'rgba(10, 14, 39, 0.92)', border: '#f59e0b', text: '#ffffff' },
        emerald: { bg: 'rgba(2, 44, 34, 0.92)', border: '#10b981', text: '#ffffff' },
        blue: { bg: 'rgba(3, 37, 76, 0.92)', border: '#38bdf8', text: '#ffffff' },
        purple: { bg: 'rgba(30, 27, 75, 0.92)', border: '#a855f7', text: '#ffffff' },
        modern: { bg: 'rgba(15, 23, 42, 0.92)', border: '#cbd5e1', text: '#ffffff' }
    };
    const c = colors[styleType] || colors.modern;

    const fs = text.length > 28 ? 10.5 : (text.length > 20 ? 12 : 14);
    const badgeSvg = `<svg width="260" height="60" viewBox="0 0 260 60">
        <rect x="4" y="4" width="252" height="52" rx="10" fill="${c.bg}" stroke="${c.border}" stroke-width="2"/>
        <text x="130" y="35" text-anchor="middle" fill="${c.text}" font-size="${fs}" font-weight="700" letter-spacing="0.5">${text}</text>
    </svg>`;

    if (typeof window.addSVGCalloutToCanvas === 'function') {
        window.addSVGCalloutToCanvas({ name: text, svg: badgeSvg });
    }
};
