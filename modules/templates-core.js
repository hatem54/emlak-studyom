// ==================== TEMPLATES CORE ====================

// ==================== UNIFIED TEMPLATE DATA HELPER ====================
window.getUnifiedTemplateData = function() {
    // 1. Başlık
    let title = '';
    const titleCandidates = ['canvaTitle', 'statusInput', 'canvaKTitle', 'canvaKurumsalTitle', 'canvaMTitle'];
    for (let id of titleCandidates) {
        const el = document.getElementById(id);
        if (el && el.value && el.value.trim() && el.value.trim() !== 'SATILIK MÜSTAKİL EV') {
            title = el.value.trim();
            break;
        }
    }
    if (!title && window.lastParsedData && window.lastParsedData.title) {
        title = window.lastParsedData.title;
    }
    if (!title) {
        const el = document.getElementById('canvaTitle') || document.getElementById('statusInput');
        title = el && el.value ? el.value.trim() : 'SATILIK MÜSTAKİL EV';
    }

    // 2. Fiyat
    let price = '';
    const priceCandidates = ['priceInput', 'canvaPrice', 'canvaKPrice', 'canvaKurumsalPrice'];
    for (let id of priceCandidates) {
        const el = document.getElementById(id);
        if (el && el.value && el.value.trim()) {
            price = el.value.trim();
            break;
        }
    }
    if (!price && window.lastParsedData && window.lastParsedData.price) {
        price = window.lastParsedData.price;
    }
    if (!price) price = '12.500.000 TL';

    // 3. Bölge ve Alt Başlık
    let sub = '';
    const locCandidates = ['locationInput', 'canvaSub', 'canvaKSub'];
    for (let id of locCandidates) {
        const el = document.getElementById(id);
        if (el && el.value && el.value.trim()) {
            sub = el.value.trim();
            break;
        }
    }
    if (!sub && window.lastParsedData && window.lastParsedData.location) {
        sub = window.lastParsedData.location;
    }
    if (!sub) sub = 'Merkezi Konum • Prestij Yaşam Alanı';

    // 4. İletişim / Danışman
    let contact = '';
    const phoneCandidates = ['phoneInput', 'contactInput', 'canvaContact', 'canvaKContact', 'brandPhoneInput'];
    for (let id of phoneCandidates) {
        const el = document.getElementById(id);
        if (el && el.value && el.value.trim()) {
            contact = el.value.trim();
            break;
        }
    }
    if (contact && !contact.toUpperCase().includes('EMLAK')) {
        contact = 'EMLAK STÜDYOM | ' + contact;
    }
    if (!contact) contact = 'EMLAK STÜDYOM | 0532 000 0000';

    // 5. Özellikler
    let featsLines = [];
    const featsCandidates = ['canvaFeatures', 'descInput', 'canvaKFeats', 'canvaKurumsalFeats'];
    for (let id of featsCandidates) {
        const el = document.getElementById(id);
        if (el && el.value && el.value.trim()) {
            featsLines = el.value.split('\n').map(x => x.trim()).filter(x => x.length > 0);
            if (featsLines.length > 0) break;
        }
    }
    if (featsLines.length === 0) {
        featsLines = [
            'BRÜT M²: 145 m²',
            'ODA SAYISI: 3+1',
            'BULUNDUĞU KAT: 4. KAT',
            'ISITMA: DOĞALGAZ KOMBİ',
            'BİNA YAŞI: SIFIR (0)'
        ];
    }

    // 6. Rozet / Vurgu
    let badge = '★★★ FIRSAT PORTFÖY ★★★';
    const badgeCandidates = ['canvaBadge', 'canvaKBadge', 'badgeInput'];
    for (let id of badgeCandidates) {
        const el = document.getElementById(id);
        if (el && el.value && el.value.trim()) {
            badge = el.value.trim();
            break;
        }
    }

    return {
        title: title.toUpperCase(),
        price: price,
        sub: sub,
        contact: contact,
        featsLines: featsLines,
        feats: featsLines.map(l => '<div style="margin-bottom:8px;">• ' + l.replace(/^[•\-\*]\s*/, '') + '</div>').join(''),
        badge: badge
    };
};

// ==================== UNIFIED TEMPLATE CARD CREATOR & DIVERSE PREVIEW PHOTOS ====================
window.PREVIEW_PHOTO_POOL = [
    'assets/previews/penthouse_living.jpg',   // 0: Dubleks penthouse salon
    'assets/previews/villa_white.jpg',        // 1: Modern beyaz villa & sonsuzluk havuzu
    'assets/previews/kitchen.jpg',            // 2: Lüks mermer ada mutfak
    'assets/bodrum_luxury_villa.jpg',         // 3: Bodrum taş villa & marina gün batımı
    'assets/previews/bedroom.jpg',            // 4: Penthouse cam cepheli yatak odası
    'assets/previews/terrace.jpg',            // 5: Çatı terası lounge & ateş çukuru
    'assets/horizontal_interior.jpg',         // 6: Deniz manzaralı ferah salon
    'assets/previews/infinity_pool.jpg',      // 7: Uçurum kıyısı sonsuzluk havuzu
    'assets/previews/detached_house.jpg',     // 8: Müstakil bahçeli iki katlı aile evi
    'assets/previews/dining.jpg',             // 9: İskandinav açık yemek odası
    'assets/previews/plaza.jpg',              // 10: Kurumsal cam iş merkezi / plaza
    'assets/previews/bathroom.jpg'            // 11: Spa konseptli ebeveyn banyosu
];

window.CATEGORY_PHOTO_PRESETS = {
    'özel': [
        'assets/previews/penthouse_living.jpg',
        'assets/previews/villa_white.jpg',
        'assets/previews/kitchen.jpg',
        'assets/previews/terrace.jpg',
        'assets/previews/bedroom.jpg',
        'assets/horizontal_interior.jpg',
        'assets/previews/infinity_pool.jpg',
        'assets/previews/detached_house.jpg',
        'assets/previews/bathroom.jpg',
        'assets/previews/dining.jpg'
    ],
    'elit': [
        'assets/previews/villa_white.jpg',
        'assets/previews/penthouse_living.jpg',
        'assets/bodrum_luxury_villa.jpg',
        'assets/previews/terrace.jpg',
        'assets/horizontal_interior.jpg',
        'assets/previews/kitchen.jpg',
        'assets/previews/infinity_pool.jpg',
        'assets/previews/bedroom.jpg',
        'assets/previews/detached_house.jpg',
        'assets/previews/dining.jpg'
    ],
    'lüks': [
        'assets/bodrum_luxury_villa.jpg',
        'assets/previews/infinity_pool.jpg',
        'assets/previews/penthouse_living.jpg',
        'assets/previews/villa_white.jpg',
        'assets/previews/terrace.jpg',
        'assets/previews/bedroom.jpg',
        'assets/horizontal_interior.jpg',
        'assets/previews/bathroom.jpg',
        'assets/previews/kitchen.jpg',
        'assets/previews/detached_house.jpg'
    ],
    'kurumsal': [
        'assets/previews/plaza.jpg',
        'assets/previews/detached_house.jpg',
        'assets/previews/villa_white.jpg',
        'assets/horizontal_interior.jpg',
        'assets/previews/penthouse_living.jpg',
        'assets/previews/kitchen.jpg',
        'assets/previews/terrace.jpg',
        'assets/previews/dining.jpg',
        'assets/previews/bedroom.jpg',
        'assets/previews/plaza.jpg'
    ],
    'minimal': [
        'assets/previews/dining.jpg',
        'assets/previews/kitchen.jpg',
        'assets/horizontal_interior.jpg',
        'assets/previews/bedroom.jpg',
        'assets/previews/villa_white.jpg',
        'assets/previews/detached_house.jpg',
        'assets/previews/penthouse_living.jpg',
        'assets/previews/bathroom.jpg',
        'assets/previews/terrace.jpg',
        'assets/previews/infinity_pool.jpg'
    ],
    'portföy': [
        'assets/previews/detached_house.jpg',
        'assets/bodrum_luxury_villa.jpg',
        'assets/previews/villa_white.jpg',
        'assets/previews/penthouse_living.jpg',
        'assets/previews/terrace.jpg',
        'assets/previews/kitchen.jpg',
        'assets/horizontal_interior.jpg',
        'assets/previews/infinity_pool.jpg',
        'assets/previews/bedroom.jpg',
        'assets/previews/dining.jpg'
    ],
    'dinamik': [
        'assets/previews/terrace.jpg',
        'assets/previews/villa_white.jpg',
        'assets/previews/infinity_pool.jpg',
        'assets/previews/penthouse_living.jpg',
        'assets/previews/kitchen.jpg',
        'assets/horizontal_interior.jpg',
        'assets/previews/bedroom.jpg',
        'assets/previews/detached_house.jpg',
        'assets/previews/dining.jpg',
        'assets/bodrum_luxury_villa.jpg'
    ],
    'klasik': [
        'assets/previews/detached_house.jpg',
        'assets/bodrum_luxury_villa.jpg',
        'assets/previews/dining.jpg',
        'assets/previews/kitchen.jpg',
        'assets/horizontal_interior.jpg',
        'assets/previews/villa_white.jpg',
        'assets/previews/penthouse_living.jpg',
        'assets/previews/terrace.jpg',
        'assets/previews/bedroom.jpg',
        'assets/previews/bathroom.jpg'
    ],
    'sosyal': [
        'assets/previews/infinity_pool.jpg',
        'assets/previews/terrace.jpg',
        'assets/previews/penthouse_living.jpg',
        'assets/previews/villa_white.jpg',
        'assets/horizontal_interior.jpg',
        'assets/previews/kitchen.jpg',
        'assets/previews/bedroom.jpg',
        'assets/bodrum_luxury_villa.jpg',
        'assets/previews/detached_house.jpg',
        'assets/previews/dining.jpg'
    ],
    'afiş': [
        'assets/previews/villa_white.jpg',
        'assets/previews/detached_house.jpg',
        'assets/bodrum_luxury_villa.jpg',
        'assets/previews/plaza.jpg',
        'assets/previews/penthouse_living.jpg',
        'assets/previews/terrace.jpg',
        'assets/previews/infinity_pool.jpg',
        'assets/horizontal_interior.jpg',
        'assets/previews/kitchen.jpg',
        'assets/previews/bedroom.jpg'
    ]
};

window.getTemplateDefaultPhoto = function(catOrTag, name, idx) {
    const s = ((catOrTag || '') + ' ' + (name || '')).toLowerCase();
    for (const k in window.CATEGORY_PHOTO_PRESETS) {
        if (s.includes(k)) {
            const list = window.CATEGORY_PHOTO_PRESETS[k];
            let i = typeof idx === 'number' ? idx : 0;
            return list[Math.abs(i) % list.length];
        }
    }
    if (typeof idx === 'number' && !isNaN(idx) && window.PREVIEW_PHOTO_POOL.length > 0) {
        return window.PREVIEW_PHOTO_POOL[Math.abs(idx) % window.PREVIEW_PHOTO_POOL.length];
    }
    return 'assets/previews/villa_white.jpg';
};

window.getTemplateActiveBg = function(cardOrCat, cardId) {
    if (typeof window.uploadedImgUrl !== 'undefined' && window.uploadedImgUrl && window.uploadedImgUrl.length > 50 && !window.uploadedImgUrl.includes('empty')) {
        return "background-image:url('" + window.uploadedImgUrl + "')";
    }
    if (typeof window.masterImageBase64 !== 'undefined' && window.masterImageBase64 && window.masterImageBase64.length > 50 && !window.masterImageBase64.includes('empty')) {
        return "background-image:url('" + window.masterImageBase64 + "')";
    }
    const targetId = cardId || (cardOrCat && typeof cardOrCat === 'object' && cardOrCat.id) || window.activeCanvaId;
    if (targetId) {
        const cardEl = document.querySelector(`.canva-tpl-card[data-id="${targetId}"]`);
        if (cardEl) {
            const cardIdx = cardEl.dataset.idx ? parseInt(cardEl.dataset.idx) : 0;
            const cat = cardEl.dataset.cat || (typeof cardOrCat === 'string' ? cardOrCat : '');
            return "background-image:url('" + window.getTemplateCardBg({ id: targetId }, cardIdx, cat) + "')";
        }
    }
    let defaultImg = 'assets/previews/villa_white.jpg';
    if (typeof cardOrCat === 'string') {
        defaultImg = window.getTemplateDefaultPhoto(cardOrCat, '', 0);
    } else if (cardOrCat && typeof cardOrCat === 'object') {
        defaultImg = window.getTemplateDefaultPhoto(cardOrCat.tag || cardOrCat.cat, cardOrCat.name, cardOrCat.idx || 0);
    }
    return "background-image:url('" + defaultImg + "')";
};

window.getTemplateCardBg = function(c, idx, catName) {
    if (c && c.previewImg) return c.previewImg;
    const cat = ((catName || (c ? (c.tag || c.cat) : '')) || '').toLowerCase().trim();
    for (const k in window.CATEGORY_PHOTO_PRESETS) {
        if (cat.includes(k)) {
            const list = window.CATEGORY_PHOTO_PRESETS[k];
            let i = typeof idx === 'number' ? idx : 0;
            return list[Math.abs(i) % list.length];
        }
    }
    if (typeof idx === 'number' && !isNaN(idx) && window.PREVIEW_PHOTO_POOL.length > 0) {
        return window.PREVIEW_PHOTO_POOL[Math.abs(idx) % window.PREVIEW_PHOTO_POOL.length];
    }
    return window.getTemplateDefaultPhoto(c ? (c.tag || c.cat) : '', c ? c.name : '', idx);
};

function getTemplateMockupHtml(c, catName, accent, bg1, bg2, cardImg) {
    if (c.layout && c.layout.startsWith('kolaj-')) {
        return getKolajMockupHtml(c.layout, accent, bg1, bg2);
    }
    
    let lType = c.layout;
    if (!lType) {
        const id = c.id || '';
        const name = (c.name || '').toLowerCase();
        if (id.includes('Kurumsal1') || id.includes('canva1') || id.includes('canva2') || id.includes('canvaK5') || id.includes('canvaP9') || name.includes('alt bant') || name.includes('alt panel') || name.includes('şerit')) {
            lType = 'bottom-banner';
        } else if (id.includes('Kurumsal2') || id.includes('Kurumsal9') || id.includes('canvaP2') || id.includes('canvaP3') || id.includes('canvaC3') || id.includes('canvaM7') || name.includes('sol')) {
            lType = 'left-panel';
        } else if (id.includes('Kurumsal10') || id.includes('Kurumsal5') || id.includes('canvaS4') || name.includes('sağ')) {
            lType = 'right-panel';
        } else if (id.includes('canvaL') || id.includes('canva5') || id.includes('canvaC1') || id.includes('canvaC4') || id.includes('Kurumsal3') || id.includes('Kurumsal8') || name.includes('altın') || name.includes('çerçeve') || name.includes('vip')) {
            lType = 'gold-frame';
        } else if (id.includes('canvaD') || id.includes('canvaK6') || name.includes('çapraz') || name.includes('açılı') || name.includes('geometrik')) {
            lType = 'diagonal-cut';
        } else if (id.includes('canvaC2') || id.includes('canvaD4') || id.includes('canvaM4') || name.includes('dairesel') || name.includes('madalyon')) {
            lType = 'circle-frame';
        } else if (id.includes('canvaK') || id.includes('Kurumsal4') || id.includes('Kurumsal6') || id.includes('canvaS7') || name.includes('vitrin') || name.includes('afiş')) {
            lType = 'afis-overlay';
        } else if (id.includes('canvaS6') || id.includes('canvaP4') || id.includes('canva8') || id.includes('canvaK3') || id.includes('canvaM6') || name.includes('cam') || name.includes('odak') || name.includes('kart')) {
            lType = 'frosted-card';
        } else {
            lType = 'bottom-banner';
        }
    }

    if (!cardImg) {
        cardImg = window.getTemplateCardBg(c, 0, catName);
    }

    switch(lType) {
        case 'arch-frame':
            return `
                <div class="m-arch-frame" style="background:#08080a;">
                    <div class="m-arch-top">
                        <div style="font-size:4px; color:${accent}; font-weight:800; letter-spacing:1px; line-height:1;">PENTHOUSE SUITE</div>
                        <div class="mk-bar" style="background:${accent}; width:40%; height:1px; margin:1.5px auto 0;"></div>
                    </div>
                    <div class="m-arch-window">
                        <div class="m-arch-photo m-arch-slot" style="border-color:${accent}; background-image:url('${cardImg}');"></div>
                        <div class="m-arch-circle m-arch-slot" style="border-color:${accent}; background-image:url('${cardImg}');"></div>
                    </div>
                    <div class="m-arch-metrics">
                        <div><span style="font-size:3.5px; color:${accent}; font-weight:800;">360°</span></div>
                        <div><span style="font-size:3.5px; color:${accent}; font-weight:800;">A+</span></div>
                        <div><span style="font-size:3.5px; color:${accent}; font-weight:800;">SPA</span></div>
                    </div>
                    <div class="m-arch-footer">
                        <span style="font-size:5.5px; font-weight:800; color:${accent};">₺ 28.5M</span>
                        <span style="font-size:3.5px; font-weight:700; color:#000; background:${accent}; padding:0.5px 3px; border-radius:3px;">REZİDANS</span>
                    </div>
                </div>
            `;
        case 'bottom-banner':
            return `
                <div class="m-bottom-banner">
                    <span class="m-top-badge" style="background:${accent};">FIRSAT</span>
                    <div class="m-price-row">
                        <span class="m-price-pill" style="color:${accent};">₺ 12.5M</span>
                        <span style="font-size:6px; color:#cbd5e1; font-weight:600;">Merkez</span>
                    </div>
                    <div class="m-spec-row">
                        <span class="m-spec-dot" style="width:26px;"></span>
                        <span class="m-spec-dot" style="width:20px;"></span>
                        <span class="m-spec-dot" style="width:16px;"></span>
                    </div>
                </div>
            `;
        case 'left-panel':
            return `
                <div class="m-left-panel" style="border-right-color:${accent};">
                    <div class="m-pill" style="background:${accent};"></div>
                    <div class="m-line" style="width:85%;"></div>
                    <div class="m-line" style="width:60%;"></div>
                    <div style="font-size:6.5px; font-weight:800; color:${accent};">₺ 12.5M</div>
                </div>
            `;
        case 'right-panel':
            return `
                <div class="m-right-panel" style="border-left-color:${accent};">
                    <div class="m-pill" style="background:${accent};"></div>
                    <div class="m-line" style="width:85%;"></div>
                    <div class="m-line" style="width:60%;"></div>
                    <div style="font-size:6.5px; font-weight:800; color:${accent};">₺ 12.5M</div>
                </div>
            `;
        case 'gold-frame':
            return `
                <div class="m-gold-frame" style="border-color:${accent}; outline-color:${accent}66;">
                    <div class="m-gold-badge" style="background:${accent}; color:#0f172a;">PRESTİJ</div>
                    <div class="m-gold-price" style="border-color:${accent}; color:${accent};">₺ 12.5M</div>
                </div>
            `;
        case 'frosted-card':
            return `
                <div class="m-frosted-card" style="border-color:rgba(255,255,255,0.35);">
                    <div style="width:34px; height:3.5px; border-radius:2px; background:${accent};"></div>
                    <div style="font-size:7.5px; font-weight:800; color:#ffffff;">₺ 12.5M</div>
                    <div style="display:flex; gap:3px; margin-top:1px;">
                        <span style="width:14px; height:2.5px; border-radius:1px; background:rgba(255,255,255,0.6);"></span>
                        <span style="width:14px; height:2.5px; border-radius:1px; background:rgba(255,255,255,0.6);"></span>
                    </div>
                </div>
            `;
        case 'diagonal-cut':
            return `
                <div class="m-diagonal-cut" style="background: linear-gradient(135deg, ${bg1}ee, ${bg2}ee);">
                    <div style="width:32px; height:3.5px; border-radius:2px; background:${accent};"></div>
                    <div style="font-size:7.5px; font-weight:800; color:#ffffff;">₺ 12.5M</div>
                </div>
            `;
        case 'circle-frame':
            return `
                <div class="m-circle-frame" style="border-color:${accent};">
                    <span style="font-size:6.5px; font-weight:900; color:#ffffff;">FIRSAT</span>
                </div>
                <div class="m-bottom-banner" style="height:28%;">
                    <div class="m-price-row">
                        <span class="m-price-pill" style="color:${accent};">₺ 12.5M</span>
                    </div>
                </div>
            `;
        case 'afis-overlay':
            return `
                <div class="m-afis-overlay">
                    <div class="m-afis-top" style="background:${accent};">SATILIK VİLLA</div>
                    <div class="m-afis-thumbs">
                        <div class="m-afis-thumb"></div>
                        <div class="m-afis-thumb"></div>
                        <div class="m-afis-thumb"></div>
                    </div>
                    <div class="m-afis-bottom">
                        <span style="font-size:6.5px; font-weight:800; color:${accent};">₺ 12.5M</span>
                        <span style="font-size:5.5px; color:#cbd5e1;">4+1 240m²</span>
                    </div>
                </div>
            `;
        default:
            return `
                <div class="m-bottom-banner">
                    <div class="m-price-row">
                        <span class="m-price-pill" style="color:${accent};">₺ 12.5M</span>
                    </div>
                </div>
            `;
    }
}

function getKolajMockupHtml(layout, accent, bg1, bg2) {
    const P_USER = (typeof window.uploadedImgUrl !== 'undefined' && window.uploadedImgUrl && window.uploadedImgUrl.length > 50 && !window.uploadedImgUrl.includes('empty'))
        ? window.uploadedImgUrl
        : ((typeof window.masterImageBase64 !== 'undefined' && window.masterImageBase64 && window.masterImageBase64.length > 50 && !window.masterImageBase64.includes('empty'))
            ? window.masterImageBase64
            : 'assets/luxury_villa.jpg');
            
    const P1 = P_USER;                                      // Ana Dış Cephe & Havuz
    const P2 = 'assets/horizontal_interior.jpg';             // Modern Salon & Yaşam Alanı
    const P3 = 'assets/bodrum_luxury_villa.jpg';             // Deniz Manzaralı Teras
    const P4 = 'assets/previews/kitchen.jpg';                // Lüks Ada Mutfak
    const P5 = 'assets/previews/bedroom.jpg';                // Penthouse Yatak Odası
    const P6 = 'assets/previews/terrace.jpg';                // Çatı Terası Lounge
    const P7 = 'assets/previews/detached_house.jpg';         // Müstakil Villa
    const P8 = 'assets/previews/dining.jpg';                 // İskandinav Yemek Odası
    const P9 = 'assets/previews/infinity_pool.jpg';          // Sonsuzluk Havuzu
    const P10 = 'assets/previews/penthouse_living.jpg';      // Dubleks Penthouse Salon

    switch(layout) {
        case 'kolaj-1':
            return `
                <div class="mockup-kolaj" style="background: linear-gradient(135deg, ${bg1}, ${bg2});">
                    <div class="mk-k1-left">
                        <div class="mk-bar" style="background:${accent}; width:70%;"></div>
                        <div class="mk-bar" style="width:90%;"></div>
                        <div class="mk-bar" style="width:50%;"></div>
                    </div>
                    <div class="mk-k1-right">
                        <div class="mk-k1-hero mk-k-hero-slot" style="background-image:url('${P1}');"></div>
                        <div class="mk-k1-thumbs">
                            <div class="mk-k-thumb" style="background-image:url('${P2}');"></div>
                            <div class="mk-k-thumb" style="background-image:url('${P3}');"></div>
                            <div class="mk-k-thumb" style="background-image:url('${P4}');"></div>
                        </div>
                    </div>
                </div>
            `;
        case 'kolaj-2':
            return `
                <div class="mockup-kolaj" style="background: linear-gradient(135deg, ${bg1}, ${bg2});">
                    <div class="mk-k2-hero mk-k-hero-slot" style="background-image:url('${P1}');"></div>
                    <div class="mk-k2-thumbs">
                        <div class="mk-k-thumb" style="background-image:url('${P2}');"></div>
                        <div class="mk-k-thumb" style="background-image:url('${P3}');"></div>
                        <div class="mk-k-thumb" style="background-image:url('${P5}');"></div>
                        <div class="mk-k-thumb" style="background-image:url('${P4}');"></div>
                    </div>
                    <div class="mk-k2-bar" style="background:${accent};"></div>
                </div>
            `;
        case 'kolaj-3':
            return `
                <div class="mockup-kolaj" style="background: linear-gradient(135deg, ${bg1}, ${bg2});">
                    <div class="mk-k3-hero mk-k-hero-slot" style="background-image:url('${P1}');"></div>
                    <div class="mk-k3-thumbs">
                        <div class="mk-k-thumb" style="background-image:url('${P2}');"></div>
                        <div class="mk-k-thumb" style="background-image:url('${P3}');"></div>
                        <div class="mk-k-thumb" style="background-image:url('${P4}');"></div>
                        <div class="mk-k-thumb" style="background-image:url('${P5}');"></div>
                        <div class="mk-k-thumb" style="background-image:url('${P6}');"></div>
                        <div class="mk-k-thumb" style="background-image:url('${P7}');"></div>
                    </div>
                </div>
            `;
        case 'kolaj-4':
            return `
                <div class="mockup-kolaj" style="background: linear-gradient(135deg, ${bg1}, ${bg2});">
                    <div class="mk-k4-grid">
                        <div class="mk-k-quad mk-k-hero-slot" style="background-image:url('${P1}');"></div>
                        <div class="mk-k-quad" style="background-image:url('${P2}');"></div>
                        <div class="mk-k-quad" style="background-image:url('${P3}');"></div>
                        <div class="mk-k-quad" style="background-image:url('${P5}');"></div>
                    </div>
                    <div class="mk-k4-center" style="border-color:${accent};">
                        <span style="font-size:6px; font-weight:800; color:${accent};">VİLLA</span>
                    </div>
                </div>
            `;
        case 'kolaj-5':
            return `
                <div class="mockup-kolaj" style="background: linear-gradient(135deg, ${bg1}, ${bg2});">
                    <div class="mk-k5-diag mk-k-hero-slot" style="background-image:url('${P1}');"></div>
                    <div class="mk-k5-right">
                        <div class="mk-k-thumb" style="height:26px; background-image:url('${P2}');"></div>
                        <div class="mk-k5-grid4">
                            <div class="mk-k-thumb" style="background-image:url('${P3}');"></div>
                            <div class="mk-k-thumb" style="background-image:url('${P4}');"></div>
                            <div class="mk-k-thumb" style="background-image:url('${P5}');"></div>
                            <div class="mk-k-thumb" style="background-image:url('${P6}');"></div>
                        </div>
                    </div>
                </div>
            `;
        case 'kolaj-6':
            return `
                <div class="mockup-kolaj" style="background: linear-gradient(135deg, ${bg1}, ${bg2});">
                    <div class="mk-k6-left mk-k-hero-slot" style="background-image:url('${P1}');"></div>
                    <div class="mk-k6-right">
                        <div class="mk-k-thumb" style="background-image:url('${P2}');"></div>
                        <div class="mk-k-thumb" style="border-radius:50% !important; background-image:url('${P3}');"></div>
                        <div class="mk-k-thumb" style="border-radius:50% !important; background-image:url('${P5}');"></div>
                        <div class="mk-k-thumb" style="background-image:url('${P4}');"></div>
                    </div>
                    <div class="mk-k6-bottom" style="display:flex;align-items:center;justify-content:space-between;padding:0 6px;">
                        <div class="mk-bar" style="background:#2c5f7f;width:35%;height:2px;border-radius:1px;"></div>
                        <div style="font-size:5.5px;font-weight:800;color:#0f2540;">8.500.000 TL</div>
                    </div>
                </div>
            `;
        case 'kolaj-7':
            return `
                <div class="mockup-kolaj" style="background: linear-gradient(135deg, ${bg1}, ${bg2});">
                    <div class="mk-k7-strips">
                        <div class="mk-k7-strip mk-k-hero-slot" style="background-image:url('${P1}');"></div>
                        <div class="mk-k7-strip" style="background-image:url('${P2}');"></div>
                        <div class="mk-k7-strip" style="background-image:url('${P3}');"></div>
                        <div class="mk-k7-strip" style="background-image:url('${P4}');"></div>
                    </div>
                    <div class="mk-k7-footer" style="display:flex;align-items:center;justify-content:space-between;padding:0 6px;">
                        <span style="font-size:5.5px;color:#d4af78;font-weight:700;letter-spacing:1px;">EXCLUSIVE</span>
                        <span style="font-size:5.5px;color:#fff;font-weight:700;">PORTFÖY</span>
                    </div>
                </div>
            `;
        case 'kolaj-8':
            return `
                <div class="mockup-kolaj" style="background: linear-gradient(135deg, ${bg1}, ${bg2});">
                    <div class="mk-k8-top">
                        <div class="mk-k8-side mk-k-hero-slot" style="background-image:url('${P1}');"></div>
                        <div class="mk-k8-mid" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2px;gap:2px;">
                            <div style="font-size:6px;letter-spacing:1px;color:#d4af78;font-weight:700;line-height:1;">BOTANICA</div>
                            <div class="mk-bar" style="background:#d4af78;width:50%;height:1px;margin:1px 0;"></div>
                            <div style="font-size:5px;color:#f5f0e0;opacity:0.8;line-height:1;">VİLLA PORTFÖY</div>
                        </div>
                        <div class="mk-k8-side" style="background-image:url('${P3}');"></div>
                    </div>
                    <div class="mk-k8-bottom">
                        <div class="mk-k-thumb" style="background-image:url('${P2}');"></div>
                        <div class="mk-k-thumb" style="background-image:url('${P4}');"></div>
                        <div class="mk-k-thumb" style="background-image:url('${P5}');"></div>
                        <div class="mk-k-thumb" style="background-image:url('${P6}');"></div>
                        <div class="mk-k-thumb" style="background-image:url('${P7}');"></div>
                    </div>
                </div>
            `;
        case 'kolaj-9':
            return `
                <div class="mockup-kolaj" style="background: linear-gradient(135deg, ${bg1}, ${bg2});">
                    <div class="mk-k9-hero mk-k-hero-slot" style="border-color:${accent}; background-image:url('${P1}');"></div>
                    <div class="mk-k9-right">
                        <div class="mk-k-thumb" style="background-image:url('${P2}');"></div>
                        <div class="mk-k-thumb" style="background-image:url('${P3}');"></div>
                        <div class="mk-k-thumb" style="background-image:url('${P4}');"></div>
                        <div class="mk-k-thumb" style="background-image:url('${P5}');"></div>
                    </div>
                </div>
            `;
        case 'kolaj-10':
            return `
                <div class="mockup-kolaj mk-k-hero-slot" style="background-image: url('${P1}'); background-size:cover; background-position:center;">
                    <div class="mk-k10-overlay"></div>
                    <div class="mk-k10-right">
                        <div class="mk-k-thumb" style="background-image:url('${P2}');"></div>
                        <div class="mk-k-thumb" style="background-image:url('${P3}');"></div>
                        <div class="mk-k-thumb" style="background-image:url('${P4}');"></div>
                    </div>
                    <div class="mk-k10-bottom" style="display:flex;align-items:center;justify-content:space-between;padding:0 6px;background:rgba(0,0,0,0.65);border:1px solid rgba(255,255,255,0.2);">
                        <div style="font-size:6px;font-weight:800;color:#fff;letter-spacing:0.5px;">ELMAS REZİDANS</div>
                        <div style="font-size:5.5px;font-weight:700;color:#c0c0c0;">55.000.000 TL</div>
                    </div>
                </div>
            `;
        default:
            return `<div class="mockup-kolaj"></div>`;
    }
}

window.generateCardPreviewThumb = function(sourceUrl, callback) {
    if (!sourceUrl) return;
    if (typeof sourceUrl === 'string' && !sourceUrl.startsWith('data:') && sourceUrl.length < 500) {
        window.activePreviewThumbUrl = sourceUrl;
        if (callback) callback(sourceUrl);
        return;
    }
    if (window.PhotoStagingArchive && window.PhotoStagingArchive.activeItemId && Array.isArray(window.PhotoStagingArchive.items)) {
        const item = window.PhotoStagingArchive.items.find(it => it.id === window.PhotoStagingArchive.activeItemId);
        if (item && item.thumbUrl) {
            window.activePreviewThumbUrl = item.thumbUrl;
            if (callback) callback(item.thumbUrl);
            return;
        }
    }
    const img = new Image();
    img.onload = () => {
        try {
            const maxDim = 320;
            const aspect = (img.naturalHeight || 1080) / (img.naturalWidth || 1920);
            const w = Math.min(maxDim, img.naturalWidth || maxDim);
            const h = Math.round(w * aspect);
            const c = document.createElement('canvas');
            c.width = w; c.height = h;
            const ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            window.activePreviewThumbUrl = c.toDataURL('image/jpeg', 0.65);
            if (callback) callback(window.activePreviewThumbUrl);
        } catch(e) {
            window.activePreviewThumbUrl = sourceUrl;
            if (callback) callback(sourceUrl);
        }
    };
    img.onerror = () => {
        window.activePreviewThumbUrl = sourceUrl;
        if (callback) callback(sourceUrl);
    };
    img.src = sourceUrl;
};

window.updateTemplateCardPreviews = function() {
    // Sol paneldeki şablon kart önizlemelerinin tuvaldeki kullanıcı görselinden etkilenmesini engelle.
    // Şablon kartları her zaman kendi standart/profesyonel örnek görselini (villa, salon vb.) gösterir.
    document.querySelectorAll('.canva-tpl-card').forEach((card, domIdx) => {
        const id = card.dataset.id;
        if (!id) return;
        let cObj = null;
        if (typeof ALL_CANVA_CARDS !== 'undefined') cObj = ALL_CANVA_CARDS.find(x => x.id === id);
        if (!cObj && typeof KALIP_CARDS !== 'undefined') cObj = KALIP_CARDS.find(x => x.id === id);
        if (!cObj && typeof CANVA_CARDS !== 'undefined') cObj = CANVA_CARDS.find(x => x.id === id);
        if (!cObj && typeof MINIMAL_CARDS !== 'undefined') cObj = MINIMAL_CARDS.find(x => x.id === id);
        if (!cObj && typeof LUKS_CARDS !== 'undefined') cObj = LUKS_CARDS.find(x => x.id === id);
        if (!cObj && typeof KURUMSAL_CARDS !== 'undefined') cObj = KURUMSAL_CARDS.find(x => x.id === id);
        if (!cObj && typeof DINAMIK_CARDS !== 'undefined') cObj = DINAMIK_CARDS.find(x => x.id === id);
        if (!cObj && typeof KLASIK_CARDS !== 'undefined') cObj = KLASIK_CARDS.find(x => x.id === id);
        if (!cObj && typeof SOSYAL_CARDS !== 'undefined') cObj = SOSYAL_CARDS.find(x => x.id === id);
        if (!cObj && typeof PORTFOY_CARDS !== 'undefined') cObj = PORTFOY_CARDS.find(x => x.id === id);
        if (!cObj && typeof OZEL_CARDS !== 'undefined') cObj = OZEL_CARDS.find(x => x.id === id);
        
        const cardIdx = (card.dataset.idx !== undefined) ? parseInt(card.dataset.idx) : domIdx;
        const cat = card.dataset.cat || card.querySelector('.tpl-card-tag')?.textContent || '';
        const defBg = window.getTemplateCardBg(cObj || { id: id }, cardIdx, cat);
        const prevEl = card.querySelector('.tpl-card-preview');
        if (prevEl) prevEl.style.backgroundImage = "url('" + defBg + "')";
        const slotEl = card.querySelector('.mockup-kolaj .mk-k-hero-slot, .m-arch-slot');
        if (slotEl) slotEl.style.backgroundImage = "url('" + defBg + "')";
    });
};

window.createTemplateCard = function(c, idx, catName, onClick) {
    const card = document.createElement('div');
    card.className = 'canva-tpl-card';
    card.dataset.id = c.id;
    card.dataset.idx = idx;
    if (catName) card.dataset.cat = catName;
    
    const cleanName = (c.name || (catName + ' ' + (idx + 1))).replace(/^[A-Za-z0-9]+\.\s*/, '');
    const tag = c.tag || catName;
    const accent = c.accent || '#0284c7';
    const bg1 = c.bg1 || '#1e293b';
    const bg2 = c.bg2 || '#334155';
    
    const bgImg = window.getTemplateCardBg(c, idx, catName);
    const mockupHtml = getTemplateMockupHtml(c, catName, accent, bg1, bg2, bgImg);

    card.innerHTML = `
        <div class="tpl-card-top">
            <span class="tpl-card-tag">${tag}</span>
            <span class="tpl-card-index">#${idx + 1}</span>
        </div>
        <div class="tpl-card-preview" style="background-image: url('${bgImg}');">
            <div class="tpl-preview-bg"></div>
            ${mockupHtml}
        </div>
        <div class="tpl-card-info">
            <div class="tpl-card-title" title="${cleanName}">${cleanName}</div>
            ${c.desc ? `<div class="tpl-card-desc" title="${c.desc}">${c.desc}</div>` : ''}
        </div>
    `;

    card.onclick = (e) => {
        if (card.classList.contains('active') && !window.isSilentTemplateRefresh && !window.isForceTemplateReload && e && e.isTrusted) return;
        document.querySelectorAll('.canva-tpl-card').forEach(x => x.classList.remove('active'));
        card.classList.add('active');
        window.activeCanvaId = c.id;
        if (typeof activeCanvaId !== 'undefined') activeCanvaId = c.id;
        window.lastActiveTemplateId = c.id;
        const canvaL = document.getElementById('canva-render-layer');
        if (canvaL) canvaL.dataset.activeTemplateId = c.id;

        window.isCanvaMode = true;
        if (typeof isCanvaMode !== 'undefined') isCanvaMode = true;
        if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
            window.CanvasEmptyState.dismiss();
        } else {
            const es = document.getElementById('canvasEmptyState');
            if (es) { es.classList.add('is-hidden'); es.style.display = 'none'; }
        }
        if (typeof onClick === 'function') onClick(c.id, card);
        if (window.TemplateFrame && typeof window.TemplateFrame.onTemplateChanged === 'function') {
            window.TemplateFrame.onTemplateChanged(c.id, 'canva');
        }
        if (typeof redrawAll === 'function') {
            setTimeout(redrawAll, 50);
        }
    };

    return card;
};

function refreshActiveCanvaTemplate(retryCount = 0){
    if(document.getElementById('kolaj-wrapper')){
        if(typeof _kolajFormatGuncelle === 'function') _kolajFormatGuncelle();
        if(typeof window.syncKolajFromForm === 'function') window.syncKolajFromForm();
        return;
    }

    const isCanva = !!(window.isCanvaMode || (typeof isCanvaMode !== 'undefined' && isCanvaMode));
    if(!isCanva) return;

    const canvaL = document.getElementById('canva-render-layer');
    const curCanvaId = window.activeCanvaId || 
                       (typeof activeCanvaId !== 'undefined' ? activeCanvaId : '') ||
                       (canvaL ? canvaL.dataset.activeTemplateId : '') ||
                       window.lastActiveTemplateId ||
                       '';
    if (!curCanvaId) return;

    const pl = document.getElementById('photo-layer');
    if (pl) {
        pl.style.setProperty('display', 'none', 'important');
        pl.style.opacity = '0';
    }
    if (canvaL) {
        canvaL.style.display = 'block';
    }

    if (curCanvaId === 'custom' && window.activeCustomTemplateData && typeof window.renderCustomDynamicTemplate === 'function') {
        window.renderCustomDynamicTemplate(window.activeCustomTemplateData);
        return;
    }

    window.isSilentTemplateRefresh = true;
    try {
        if (curCanvaId) {
            // Direct renderer lookup for instant live update without re-triggering click events
            if (curCanvaId.startsWith('canvaKurumsal') && (typeof renderKurumsalTemplate === 'function' || typeof window.renderKurumsalTemplate === 'function')) {
                const fn = typeof renderKurumsalTemplate === 'function' ? renderKurumsalTemplate : window.renderKurumsalTemplate;
                fn(curCanvaId);
                return;
            }
            if (curCanvaId.startsWith('canvaD') && (typeof renderDTemplate === 'function' || typeof window.renderDTemplate === 'function')) {
                const fn = typeof renderDTemplate === 'function' ? renderDTemplate : window.renderDTemplate;
                fn(curCanvaId);
                return;
            }
            if (curCanvaId.startsWith('canvaC') && (typeof renderCTemplate === 'function' || typeof window.renderCTemplate === 'function')) {
                const fn = typeof renderCTemplate === 'function' ? renderCTemplate : window.renderCTemplate;
                fn(curCanvaId);
                return;
            }
            if (curCanvaId.startsWith('canvaS') && (typeof renderSTemplate === 'function' || typeof window.renderSTemplate === 'function')) {
                const fn = typeof renderSTemplate === 'function' ? renderSTemplate : window.renderSTemplate;
                fn(curCanvaId);
                return;
            }
            if (curCanvaId.startsWith('canvaP') && (typeof renderPTemplate === 'function' || typeof window.renderPTemplate === 'function')) {
                const fn = typeof renderPTemplate === 'function' ? renderPTemplate : window.renderPTemplate;
                fn(curCanvaId);
                return;
            }
            if (curCanvaId.startsWith('canvaO') && (typeof renderOTemplate === 'function' || typeof window.renderOTemplate === 'function')) {
                const fn = typeof renderOTemplate === 'function' ? renderOTemplate : window.renderOTemplate;
                fn(curCanvaId);
                return;
            }
            if (curCanvaId.startsWith('canvaK') && (typeof renderKTemplate === 'function' || typeof window.renderKTemplate === 'function')) {
                const fn = typeof renderKTemplate === 'function' ? renderKTemplate : window.renderKTemplate;
                fn(curCanvaId);
                return;
            }
            if (curCanvaId.startsWith('canvaM') && (typeof renderMTemplate === 'function' || typeof window.renderMTemplate === 'function')) {
                const fn = typeof renderMTemplate === 'function' ? renderMTemplate : window.renderMTemplate;
                fn(curCanvaId);
                return;
            }
            if (curCanvaId.startsWith('canvaL') && (typeof renderLTemplate === 'function' || typeof window.renderLTemplate === 'function')) {
                const fn = typeof renderLTemplate === 'function' ? renderLTemplate : window.renderLTemplate;
                fn(curCanvaId);
                return;
            }
            if (/^canva\d+$/.test(curCanvaId) && typeof buildCanvaRender === 'function') {
                buildCanvaRender();
                return;
            }

            const exactCard = document.querySelector('.canva-tpl-card[data-id="' + curCanvaId + '"]');
            if (exactCard) {
                document.querySelectorAll('.canva-tpl-card').forEach(x => x.classList.remove('active'));
                exactCard.classList.add('active');
                exactCard.click();
                return;
            } else if (retryCount < 20) {
                setTimeout(() => refreshActiveCanvaTemplate(retryCount + 1), 300);
                return;
            }
            console.warn('refreshActiveCanvaTemplate: ' + curCanvaId + ' bulunamadi.');
            return;
        }

        const activeCard = document.querySelector('.canva-tpl-card.active');
        if (activeCard && activeCard.dataset.id) {
            window.activeCanvaId = activeCard.dataset.id;
            if (typeof activeCanvaId !== 'undefined') activeCanvaId = activeCard.dataset.id;
            refreshActiveCanvaTemplate();
            return;
        }
    } finally {
        setTimeout(() => { window.isSilentTemplateRefresh = false; }, 60);
    }
}

// Global click listener to track active template ID for auto-save and re-renders
document.addEventListener('click', function(e) {
    const card = e.target.closest('.canva-tpl-card');
    if (card && card.dataset.id) {
        if (!window.isSilentTemplateRefresh && typeof window.showGlobalLoadingOverlay === 'function') {
            window.showGlobalLoadingOverlay(1200, 'Şablon Yükleniyor...', 'Tasarım ve renkler hazırlanıyor...');
        }
        document.querySelectorAll('.canva-tpl-card').forEach(x => x.classList.remove('active'));
        card.classList.add('active');
        window.activeCanvaId = card.dataset.id;
        if (typeof activeCanvaId !== 'undefined') activeCanvaId = card.dataset.id;
        window.lastActiveTemplateId = card.dataset.id;
        const canvaL = document.getElementById('canva-render-layer');
        if (canvaL) canvaL.dataset.activeTemplateId = card.dataset.id;
        
        if (typeof isCanvaMode !== 'undefined') isCanvaMode = true;
        window.isCanvaMode = true;
        
        // Force an immediate auto-save so we don't lose the selection if they refresh instantly
        if (typeof performAutoSave === 'function') {
            performAutoSave();
        }
        if (typeof redrawAll === 'function') {
            setTimeout(redrawAll, 80);
        }
    }
});

window.showGlobalLoadingOverlay = function(durationMs, text, subtext) {
    if (window.isRestoringState || window.isSilentTemplateRefresh) return;
    if (typeof window.showAppLoading === 'function') {
        window.showAppLoading(text || 'Şablon Yükleniyor...', subtext || 'Tasarım ve renkler hazırlanıyor...', 8000);
        setTimeout(() => {
            if (!window.isRestoringState && typeof window.hideAppLoading === 'function') {
                window.hideAppLoading(250);
            }
        }, durationMs || 1200);
    }
};

function setTemplate(k){
    try {
        if (k && k !== 'empty') {
            if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
                window.CanvasEmptyState.dismiss();
            } else {
                const es = document.getElementById('canvasEmptyState');
                if (es) { es.classList.add('is-hidden'); es.style.display = 'none'; }
            }
        }
        if(typeof setOriginalView === 'function') setOriginalView(false);
        if(window.AppState && typeof window.AppState.resetOnTemplateChange === 'function') {
            window.AppState.resetOnTemplateChange(k);
        }
        if(!window.isRestoringState && window.showGlobalLoadingOverlay) window.showGlobalLoadingOverlay(1200, "Şablon Yükleniyor...", "Tasarım ve renkler hazırlanıyor...");
        
        isCanvaMode = false;
        if(typeof clearCanvaTemplate === 'function') clearCanvaTemplate(true);
        const canvaLayer = document.getElementById('canva-render-layer');
        if (canvaLayer) { canvaLayer.innerHTML = ''; canvaLayer.style.display = 'none'; }
        const photoL = document.getElementById('photo-layer');
        if (photoL) {
            photoL.style.display = 'block';
            const userPhoto = (typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl && uploadedImgUrl.length > 50 && !uploadedImgUrl.includes('empty'))
                ? uploadedImgUrl
                : ((typeof masterImageBase64 !== 'undefined' && masterImageBase64 && masterImageBase64.length > 50 && !masterImageBase64.includes('empty'))
                    ? masterImageBase64
                    : 'assets/luxury_villa.jpg');
            photoL.style.backgroundImage = "url('" + userPhoto + "')";
            photoL.style.backgroundSize = 'cover';
            photoL.style.backgroundPosition = 'center';
        }

        activeLayout=k;
        document.querySelectorAll('.template-btn').forEach(b=>b.classList.toggle('active',b.id==='tpl-'+k));
        const t=TPL[k];
        if(!t) return; // Güvenlik kontrolü, eğer boş şablon veya geçersiz bir k geldiyse dur.
        
        document.querySelectorAll('.normal-el').forEach(el => {
            el.style.display = 'block';
            el.style.visibility = 'visible';
        });

        applyStylePos(elBadge,t.badge);
        applyStylePos(elPrice,t.price);
        applyStylePos(elDetails,t.details);
        if(typeof elBadge !== 'undefined' && elBadge) { elBadge.style.display = 'block'; elBadge.style.visibility = 'visible'; }
        if(typeof elPrice !== 'undefined' && elPrice) { elPrice.style.display = 'block'; elPrice.style.visibility = 'visible'; }
        if(typeof elDetails !== 'undefined' && elDetails) { elDetails.style.display = 'block'; elDetails.style.visibility = 'visible'; }
        const il = document.getElementById('infoLineText');
        if(il) il.style.visibility = 'visible';
        if(typeof elLogo !== 'undefined' && elLogo && t.logo) {
            applyStylePos(elLogo, t.logo);
        }

        // Haritadan gelen ada/parsel rozetinin yazı tipini standart şablon fontuyla senkronize et (özel kilitli değilse)
        if (t && t.badge && t.badge.fontFamily && typeof window.updateParcelBadgeFont === 'function') {
            const badges = document.querySelectorAll('.parcel-badge-callout, [data-parcel-badge="true"]');
            badges.forEach(b => {
                if (!b.dataset.customFont) {
                    window.updateParcelBadgeFont(b, { fontFamily: t.badge.fontFamily });
                }
            });
        }

        // Dış çerçeve neon çizgisini standart şablon için uygula
        if (window.TemplateFrame && typeof window.TemplateFrame.applyStandard === 'function') {
            window.TemplateFrame.applyStandard(k);
        }

        deselectAll();
        renderData();
        if(typeof resizeCanvas === 'function') resizeCanvas();
        if(typeof applyPhotoFilters === 'function') applyPhotoFilters();
        if(typeof redrawAll === 'function') redrawAll();
        
        if(typeof requestAutoSave === 'function') requestAutoSave();
    } catch(err) {
        console.error("setTemplate HATA:", err);
        const errDiv = document.createElement('div');
        errDiv.style.position = 'fixed'; errDiv.style.top = '50px'; errDiv.style.left = '10px';
        errDiv.style.background = 'red'; errDiv.style.color = 'white'; errDiv.style.zIndex = '999999';
        errDiv.style.padding = '10px'; errDiv.style.fontSize = '14px';
        errDiv.innerText = "setTemplate HATA: " + err.message + "\n\n" + err.stack;
        document.body.appendChild(errDiv);
    }
}
// ========== UNIFIED TEMPLATE ENGINE ==========
window.renderCanvaTemplate = function(htmlString) {
    if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
        window.CanvasEmptyState.dismiss();
    } else {
        const es = document.getElementById('canvasEmptyState');
        if (es) { es.classList.add('is-hidden'); es.style.display = 'none'; }
    }
    if(window.AppState && typeof window.AppState.resetOnTemplateChange === 'function') {
        window.AppState.resetOnTemplateChange('canva');
    }
    if(typeof _kolajTemizle === 'function') _kolajTemizle();
    
    document.querySelectorAll('.normal-el').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.canva-generated, .canva-panel').forEach(e => e.remove());
    
    const photoLayer = document.getElementById('photo-layer');
    const canvaRenderLayer = document.getElementById('canva-render-layer');
    if(!canvaRenderLayer) return;
        // IMPORTANT: Keep photo-layer visible for background!
      if(photoLayer) {
          photoLayer.style.display = 'block';
          
          // Apply background settings globally
          const xCtrl = document.getElementById('photoXCtrl');
          const yCtrl = document.getElementById('photoYCtrl');
          const zoomCtrl = document.getElementById('photoZoomCtrl');
          
          // YENİ: Şablon değiştiğinde zoom ve pan'i zorla sıfırla ki görsel patlamasın/zoomlu gelmesin!
          if (xCtrl) xCtrl.value = 50;
          if (yCtrl) yCtrl.value = 50;
          if (zoomCtrl) zoomCtrl.value = 100;
          
          const x = 50;
          const y = 50;
          const zoom = 100;
          const sizeStr = 'cover';
          
          if(typeof applyPhotoPos === 'function') applyPhotoPos();
          
          const userPhoto = (typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl && uploadedImgUrl.length > 50 && !uploadedImgUrl.includes('empty'))
              ? uploadedImgUrl
              : ((typeof masterImageBase64 !== 'undefined' && masterImageBase64 && masterImageBase64.length > 50 && !masterImageBase64.includes('empty'))
                  ? masterImageBase64
                  : 'assets/luxury_villa.jpg');
          photoLayer.style.backgroundImage = "url('" + userPhoto + "')";
          
          photoLayer.style.backgroundPosition = x + "% " + y + "%";
          photoLayer.style.backgroundSize = sizeStr;
      }
    canvaRenderLayer.style.display = 'block';
    if(typeof isCanvaMode !== 'undefined') isCanvaMode = true;
    else window.isCanvaMode = true;
    
    // 1920x1080 referansina gore gercek cozunurluk hesaplamalari
    const canvasEl = document.getElementById('canvas-container');
    const fullW = parseInt(canvasEl.style.width) || 1920;
    const fullH = parseInt(canvasEl.style.height) || 1080;
    const scaleXFn = (val) => (val / 1920) * fullW;
    const scaleYFn = (val) => (val / 1080) * fullH;
    
    const isMob = window.innerWidth <= 768 || (typeof window.isMobileDevice === 'function' && window.isMobileDevice());
    const scaleMin = (val, isFont = false) => {
        let scaled = val * Math.min(fullW/1920, fullH/1080);
        if (isFont && isMob) {
            // Akıllı Mobil Okunabilirlik Ölçekleme:
            // 16-24px arası küçük detay/özellik yazılarını %38 artırarak taban 26px yapar
            if (val <= 24) scaled = Math.max(scaled * 1.38, 26 * Math.min(fullW/1920, fullH/1080));
            else if (val <= 32) scaled = Math.max(scaled * 1.25, 34 * Math.min(fullW/1920, fullH/1080));
            else if (val <= 44) scaled = Math.max(scaled * 1.12, 46 * Math.min(fullW/1920, fullH/1080));
        }
        return scaled;
    };
    
    let fHtml = htmlString;
    // Scale inline CSS
    fHtml = fHtml.replace(/font-size:\$\{scaleY\((\d+)\)\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10), true)));
    fHtml = fHtml.replace(/font-size:\$\{scaleX\((\d+)\)\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10), true)));
    fHtml = fHtml.replace(/font-size:\$\{scaleMin\((\d+)\)\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10), true)));
    fHtml = fHtml.replace(/padding:\$\{scaleMin\((\d+)\)\}/g, (m, p1) => 'padding:' + Math.round(scaleMin(parseInt(p1, 10), false)));
    fHtml = fHtml.replace(/\$\{scaleMin\((\d+)\)\}/g, (m, p1) => Math.round(scaleMin(parseInt(p1, 10), false)));
    fHtml = fHtml.replace(/\$\{scaleX\((\d+)\)\}/g, (m, p1) => Math.round(scaleXFn(parseInt(p1, 10))));
    fHtml = fHtml.replace(/\$\{scaleY\((\d+)\)\}/g, (m, p1) => Math.round(scaleYFn(parseInt(p1, 10))));
    fHtml = fHtml.replace(/\$\{fullH\}/g, fullH);
    
    canvaRenderLayer.innerHTML = fHtml;
    
    // Bind interaction logic
    canvaRenderLayer.querySelectorAll('.photo-panel').forEach(el => {
        if(typeof _preparePhoto === 'function') _preparePhoto(el);
        if(typeof bindPhotoPanel === 'function') enablePhotoDrag(el);
        el.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            el.dataset.zpScale = '1';
            el.dataset.zpX = '0';
            el.dataset.zpY = '0';
            delete el.dataset.sX;
            delete el.dataset.sY;
            if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(el);
            if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
        });
    });
    canvaRenderLayer.querySelectorAll('.editable-text').forEach(el => {
        if(typeof enableInlineEdit === 'function') enableInlineEdit(el);
    });
    
    requestAnimationFrame(() => {
        if(typeof applyPhotoFilters === 'function') applyPhotoFilters();
        if(typeof redrawAll === 'function') redrawAll();
        if(window.TemplateFrame && typeof window.TemplateFrame.onTemplateChanged === 'function') {
            window.TemplateFrame.onTemplateChanged(window.activeCanvaId || 'canva', 'canva');
        }
    });
};

/**
 * Tuvale Serbest / Yalın Metin Ekle (ui/element.js köprüsü)
 */
window.addCustomTextOnly = function(initialText) {
    if (typeof window.createCustomTextOnly === 'function') {
        return window.createCustomTextOnly(initialText);
    } else if (typeof addCustomTextOnly === 'function' && addCustomTextOnly !== window.addCustomTextOnly) {
        return addCustomTextOnly(initialText);
    }
};

/**
 * Tuvale Çerçeveli Kutu Başlık / Metin Ekle (ui/element.js köprüsü)
 */
window.addCustomTextBox = function(initialText) {
    if (typeof window.createCustomTextBox === 'function') {
        return window.createCustomTextBox(initialText);
    } else if (typeof addCustomTextBox === 'function' && addCustomTextBox !== window.addCustomTextBox) {
        return addCustomTextBox(initialText);
    }
};

/**
 * Rozet ve Vurgu Kısayolları (OmniSearch Uyumlu)
 */
window.addCallout = function() {
    if (typeof window.addCalloutPreset === 'function') {
        window.addCalloutPreset('gold');
    } else if (typeof window.addSVGCalloutToCanvas === 'function') {
        window.addSVGCalloutToCanvas({ name: 'Fırsat', svg: '<svg width="200" height="50" viewBox="0 0 200 50"><rect width="200" height="50" rx="8" fill="rgba(15,23,42,0.9)" stroke="#f59e0b" stroke-width="2"/><text x="100" y="30" text-anchor="middle" fill="#fff" font-size="16" font-weight="700">FIRSAT PORTFÖY</text></svg>' });
    }
};

window.addNeonCallout = function() {
    if (typeof window.addNeonText === 'function') {
        window.addNeonText('fully-lit', '#00f0ff', 'NEON VURGU');
    }
};

/**
 * Giriş Sekmesi Örnek Veri Doldurucu
 */
window.fillSampleData = function() {
    const desc = document.getElementById('descInput');
    if (desc) {
        desc.value = "📍 Sakarya / Karasu / Yalı Mah.\n📐 450 m² İmarlı Arsa\n🏗️ %40 - 2 Kat Konut İmarlı\n🛣️ Yola 22m Cepheli\n⚡ Elektrik, Su ve Doğalgaz Hazır\n🏖️ Denize 600m Mesafede\n💰 Fiyat: 2.850.000 TL";
        if (typeof window.onDescInputChanged === 'function') window.onDescInputChanged();
        if (typeof smartParse === 'function') smartParse();
        if (typeof showToast === 'function') showToast('Örnek ilan yüklendi ve süzüldü.', 'success');
    }
};

/**
 * Fotoğraf Ayarlarını Sıfırlama
 */
window.resetAllPhotoAdjustments = function() {
    if (typeof resetFilters === 'function') resetFilters();
    if (typeof resetPhotoPos === 'function') resetPhotoPos();
    if (typeof showToast === 'function') showToast('Tüm fotoğraf ayarları sıfırlandı.', 'info');
};

/**
 * Pano Metnini Ayarlama ve Süzme
 */
window.setRawText = function(text) {
    const desc = document.getElementById('descInput');
    if (desc) {
        desc.value = text || '';
        if (typeof window.onDescInputChanged === 'function') window.onDescInputChanged();
    }
};

window.parseText = function() {
    if (typeof smartParse === 'function') {
        smartParse();
    }
};

/**
 * Seslendirme Stüdyosunu Açma
 */
window.openVoiceoverStudio = function() {
    if (typeof switchTab === 'function') switchTab('data');
    if (typeof window.switchAiMainTab === 'function') {
        window.switchAiMainTab('voiceover');
    }
};


