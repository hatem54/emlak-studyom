/**
 * ============================================
 * FONTS UI MODULE
 * ui/fonts.js
 * ============================================
 * 
 * Bağımlılıklar:
 * - config.js
 * 
 * Kullanılan yerler:
 * - ui/element.js
 * - main.js vb.
 */


// RECENT & FAVORITE FONTS LOGIC
let favFonts = [];
let recentFonts = [];

function loadFontPreferences() {
    try {
        favFonts = JSON.parse(localStorage.getItem('emlakstudiom_fav_fonts')) || [];
        recentFonts = JSON.parse(localStorage.getItem('emlakstudiom_recent_fonts')) || [];
        const sf = localStorage.getItem('emlakstudiom_currentFont');
        if (sf && !sf.includes('Playfair')) {
            currentFont = sf;
        } else {
            currentFont = "'Archivo Black',sans-serif";
            try { localStorage.setItem('emlakstudiom_currentFont', currentFont); } catch(e){}
        }
        if (typeof window !== 'undefined') window.currentFont = currentFont;
    } catch(e) {
        favFonts = [];
        recentFonts = [];
    }
}

function saveFontPreferences() {
    localStorage.setItem('emlakstudiom_fav_fonts', JSON.stringify(favFonts));
    localStorage.setItem('emlakstudiom_recent_fonts', JSON.stringify(recentFonts));
}

function toggleFavFont(family, e) {
    if(e) e.stopPropagation();
    if(favFonts.includes(family)) {
        favFonts = favFonts.filter(f => f !== family);
    } else {
        favFonts.push(family);
    }
    saveFontPreferences();
    buildFontUI(); // re-render
}

function addRecentFont(family) {
    recentFonts = recentFonts.filter(f => f !== family);
    recentFonts.unshift(family);
    if(recentFonts.length > 5) recentFonts = recentFonts.slice(0, 5);
    saveFontPreferences();
    // We don't re-render immediately to avoid UI jumping while clicking
}

function buildFontUI(){
    const sel=$('fontQuickSelect'), grid=$('fontGrid');
    if(!sel || !grid) return;
    
    sel.innerHTML = '<option value="">-- Font Seçin --</option>';
    grid.innerHTML = '';
    
    loadFontPreferences();
    
    // Group fonts
    const grouped = {};
    FONTS.forEach(f => {
        if(!grouped[f.cat]) grouped[f.cat] = [];
        grouped[f.cat].push(f);
        
        const opt=document.createElement('option');
        opt.value=f.family;
        opt.textContent=f.name;
        sel.appendChild(opt);
    });

    // Helper to render a font item
    const renderFontItem = (f, container) => {
        const prev = document.createElement('div');
        prev.className = 'font-preview' + (f.family === currentFont ? ' active' : '');
        prev.style.fontFamily = f.family;
        prev.dataset.family = f.family;
        prev.style.position = 'relative';
        
        // Heart icon
        const isFav = favFonts.includes(f.family);
        const heart = document.createElement('i');
        heart.className = isFav ? 'fas fa-heart' : 'far fa-heart';
        heart.style.position = 'absolute';
        heart.style.right = '10px';
        heart.style.top = '50%';
        heart.style.transform = 'translateY(-50%)';
        heart.style.color = isFav ? '#ef4444' : '#64748b';
        heart.style.cursor = 'pointer';
        heart.onclick = (e) => toggleFavFont(f.family, e);
        
        const textSpan = document.createElement('span');
        textSpan.textContent = f.name.replace(/[✒️👑🚀💥🎯]/g, '').trim() + ' - Emlak 123';
        
        prev.appendChild(textSpan);
        prev.appendChild(heart);
        
        prev.onclick = () => {
            document.querySelectorAll('.font-preview').forEach(x => x.classList.remove('active'));
            prev.classList.add('active');
            sel.value = f.family;
            currentFont = f.family;
            try { localStorage.setItem('emlakstudiom_currentFont', f.family); } catch(e){}
            addRecentFont(f.family);
            applyFontSettings();
            if(typeof window.requestAutoSave === 'function') window.requestAutoSave();
        };
        container.appendChild(prev);
    };

    // 1. Render Favorites
    if(favFonts.length > 0) {
        const tit = document.createElement('div');
        tit.className = 'font-cat-title';
        tit.innerHTML = '<i class="fas fa-star" style="color:#fbbf24"></i> Favori Fontlar';
        grid.appendChild(tit);
        
        favFonts.forEach(fam => {
            const f = FONTS.find(x => x.family === fam);
            if(f) renderFontItem(f, grid);
        });
    }

    // 2. Render Recent
    if(recentFonts.length > 0) {
        const tit = document.createElement('div');
        tit.className = 'font-cat-title';
        tit.innerHTML = '<i class="fas fa-clock" style="color:#38bdf8"></i> Son Kullanılanlar';
        grid.appendChild(tit);
        
        recentFonts.forEach(fam => {
            const f = FONTS.find(x => x.family === fam);
            if(f) renderFontItem(f, grid);
        });
    }

    // 3. Render All Categories
    Object.keys(grouped).forEach(cat => {
        const tit = document.createElement('div');
        tit.className = 'font-cat-title';
        tit.textContent = cat;
        grid.appendChild(tit);
        
        grouped[cat].forEach(f => renderFontItem(f, grid));
    });
    if (sel && typeof currentFont !== 'undefined' && currentFont) {
        sel.value = currentFont;
    }
}

function buildElFontSelect(){
    const s=$('elFontFamily');if(!s)return;
    FONTS.forEach(f=>{const o=document.createElement('option');o.value=f.family;o.textContent=f.name;s.appendChild(o)});
}

function applyFontFromSelect(){
    const v=$('fontQuickSelect').value;
    if(!v)return;
    currentFont=v;
    try { localStorage.setItem('emlakstudiom_currentFont', v); } catch(e){}
    document.querySelectorAll('.font-preview').forEach(x=>x.classList.toggle('active',x.dataset.family===v));
    applyFontSettings();
    if(typeof window.requestAutoSave === 'function') window.requestAutoSave();
}

window.applyGlobalColors = function(){
    const tcEl = $('globalTextColor');
    const tbEl = $('globalTextBg');
    const tbTrans = $('globalBgTransparent');
    const tscEl = $('globalTextStrokeColor');
    const tswEl = $('globalTextStrokeWidth');
    const textColor = tcEl ? tcEl.value : '#ffffff';
    const textBgColor = (tbTrans && tbTrans.checked) ? 'transparent' : (tbEl ? tbEl.value : 'transparent');
    const textStrokeColor = tscEl ? tscEl.value : '#000000';
    const textStrokeWidth = tswEl ? tswEl.value : '0';

    if($('globalTextStrokeWidthVal')) $('globalTextStrokeWidthVal').textContent=textStrokeWidth+'px';

    document.querySelectorAll('#canvas-container .canvas-el, #canvas-container .draggable').forEach(el=>{
        if(el.dataset.customFont)return;
        
        const isTemplateElement = el.id === 'elBadge' || el.id === 'elPrice' || el.id === 'infoLineText' || el.id.startsWith('canva');
        const isCallout = el.classList.contains('callout-wrap') || el.classList.contains('svg-callout') || el.classList.contains('co-neon-block');
        const isCerCeva = el.classList.contains('cerceve');
        
        if (!isTemplateElement && !isCallout && !isCerCeva) {
            el.style.color = textColor;
            el.style.backgroundColor = textBgColor;
            el.style.webkitTextStroke = textStrokeWidth > 0 ? `${textStrokeWidth}px ${textStrokeColor}` : '';
        }
    });
};

function applyFontSettings(){
    const weight=$('fontWeight').value,style=$('fontStyle').value,spacing=$('letterSpacing').value;
    const lh=($('lineHeight').value/10).toFixed(1),align=$('textAlign').value;
    const tsc=$('textShadowColor').value,tsv=$('textShadow').value,tt=$('textTransform').value;
    
    $('letterSpacingVal').textContent=spacing+'px';
    $('lineHeightVal').textContent=lh;
    $('textShadowVal').textContent=tsv;
    
    const shadow=parseInt(tsv)>0?tsv+'px '+tsv+'px '+(tsv*2)+'px '+tsc:'none';

    // Standart şablon öğeleri (elBadge, elPrice, elDetails, infoLineText)
    // Genel yazı tipi değiştirildiğinde her zaman genel fonta tam uyum sağlar
    const stdEls = [
        document.getElementById('elBadge'),
        document.getElementById('elPrice'),
        document.getElementById('elDetails'),
        document.getElementById('infoLineText')
    ];
    stdEls.forEach(el => {
        if (el) {
            delete el.dataset.customFont;
            el.style.fontFamily = currentFont;
            if (weight) el.style.fontWeight = weight;
            if (style) el.style.fontStyle = style;
            if (spacing) el.style.letterSpacing = spacing + 'px';
            if (lh && el.id !== 'elBadge' && el.id !== 'elPrice') el.style.lineHeight = lh;
            if (align && el.id !== 'elBadge' && el.id !== 'elPrice') el.style.textAlign = align;
            if (shadow) el.style.textShadow = shadow;
            if (tt) el.style.textTransform = tt;
        }
    });

    document.querySelectorAll('#canvas-container .canvas-el, #canvas-container .draggable').forEach(el=>{
        if(el.dataset.customFont)return;
        el.style.fontFamily=currentFont;
        el.style.fontWeight=weight;
        el.style.fontStyle=style;
        el.style.letterSpacing=spacing+'px';
        el.style.lineHeight=lh;
        el.style.textAlign=align;
        el.style.textShadow=shadow;
        el.style.textTransform=tt;
    });

    // Haritadan gelen ada/parsel rozetlerini de genel font ile senkronize et
    if (typeof window.updateParcelBadgeFont === 'function') {
        const parcelBadges = document.querySelectorAll('.parcel-badge-callout, [data-parcel-badge="true"]');
        parcelBadges.forEach(b => {
            if (!b.dataset.customFont) {
                window.updateParcelBadgeFont(b, { fontFamily: currentFont, fontWeight: weight, fontStyle: style, letterSpacing: spacing });
            }
        });
    }
}

function applyElFont(){
    if(!selectedEl)return;
    if(window._loadingElSettings)return;
    const ff=$('elFontFamily').value,fw=$('elFontWeight2').value,fs=$('elFontStyle2').value,ls=$('elLetterSp').value;
    $('elLetterSpVal').textContent=ls;

    const isParcelBadge = selectedEl.classList.contains('parcel-badge-callout') ||
                          selectedEl.dataset.parcelBadge === 'true' ||
                          selectedEl.dataset.isParcelBadge === 'true' ||
                          (selectedEl.closest && selectedEl.closest('.parcel-badge-callout')) ||
                          (selectedEl.querySelector && selectedEl.querySelector('.parcel-badge-callout')) ||
                          (selectedEl.querySelector && selectedEl.querySelector('svg text') && (selectedEl.textContent.includes('Ada') || selectedEl.textContent.includes('Parsel')));

    if (isParcelBadge) {
        const badgeWrap = selectedEl.closest('.parcel-badge-callout') || 
                          (selectedEl.classList.contains('parcel-badge-callout') ? selectedEl : selectedEl.closest('.callout-wrapper') || selectedEl);
        if (ff || fw || fs || parseInt(ls) !== 0) {
            badgeWrap.dataset.customFont = '1';
            if (typeof window.updateParcelBadgeFont === 'function') {
                window.updateParcelBadgeFont(badgeWrap, { fontFamily: ff || currentFont, fontWeight: fw, fontStyle: fs, letterSpacing: ls });
            }
        } else {
            delete badgeWrap.dataset.customFont;
            if (typeof window.updateParcelBadgeFont === 'function') {
                window.updateParcelBadgeFont(badgeWrap, { fontFamily: currentFont });
            }
        }
    } else {
        // Kullanıcı standart şablon veya herhangi bir öğe seçiliyken Element sekmesinden font değiştirdiğinde:
        // Haritadan gelen ada/parsel rozeti de bu fonta otomatik uyum sağlar (eğer özel kilitlenmemişse)
        if (ff && typeof window.updateParcelBadgeFont === 'function') {
            const badges = document.querySelectorAll('.parcel-badge-callout, [data-parcel-badge="true"]');
            badges.forEach(b => {
                if (!b.dataset.customFont) {
                    window.updateParcelBadgeFont(b, { fontFamily: ff, fontWeight: fw || '800', fontStyle: fs || 'normal', letterSpacing: ls });
                }
            });
        }
    }

    if(ff||fw||fs||parseInt(ls)!==0){
        selectedEl.dataset.customFont='1';
        if(ff)selectedEl.style.fontFamily=ff;
        if(fw){selectedEl.style.fontWeight=fw;$('elWeightSlider').value=fw;$('elWeightVal').textContent=fw}
        if(fs)selectedEl.style.fontStyle=fs;
        selectedEl.style.letterSpacing=ls+'px';
        if(selectedEl.id === 'elDetails') {
            const il = document.getElementById('infoLineText');
            if (il) {
                if(ff) il.style.fontFamily = ff;
                if(fw) il.style.fontWeight = fw;
                if(fs) il.style.fontStyle = fs;
                il.style.letterSpacing = ls + 'px';
            }
        }
    }else{
        delete selectedEl.dataset.customFont;
        if(selectedEl.id === 'elDetails') {
            const il = document.getElementById('infoLineText');
            if (il) delete il.dataset.customFont;
        }
        applyFontSettings();
    }
}

function applyElWeight(){
    if(!selectedEl)return;
    if(window._loadingElSettings)return;
    const w = parseInt(document.getElementById('elWeightSlider').value);
    document.getElementById('elWeightVal').textContent=w;

    const isParcelBadge = selectedEl.classList.contains('parcel-badge-callout') ||
                          selectedEl.dataset.parcelBadge === 'true' ||
                          selectedEl.dataset.isParcelBadge === 'true' ||
                          (selectedEl.closest && selectedEl.closest('.parcel-badge-callout'));
    if (isParcelBadge && typeof window.updateParcelBadgeFont === 'function') {
        const badgeWrap = selectedEl.closest('.parcel-badge-callout') || selectedEl;
        badgeWrap.dataset.customFont = '1';
        window.updateParcelBadgeFont(badgeWrap, { fontWeight: w });
    }
    
    if (w <= 900) {
        selectedEl.style.fontWeight = w;
        const tsw = parseInt(selectedEl.dataset.storedTextStrokeWidth) || 0;
        const tsc = selectedEl.dataset.storedTextStrokeColor || '#000000';
        selectedEl.style.webkitTextStroke = tsw > 0 ? tsw + 'px ' + tsc : '';
    } else {
        selectedEl.style.fontWeight = '900';
        let strokeW = ((w - 900) / 100); 
        const color = selectedEl.style.color || '#000000';
        selectedEl.style.webkitTextStroke = strokeW + 'px ' + color;
    }
    
    selectedEl.dataset.customFont='1';
    document.getElementById('elFontWeight2').value=w;
}

function loadElFont(el){
    window._loadingElSettings=true;
    const isParcelBadge = el.classList.contains('parcel-badge-callout') ||
                          el.dataset.parcelBadge === 'true' ||
                          el.dataset.isParcelBadge === 'true' ||
                          (el.closest && el.closest('.parcel-badge-callout')) ||
                          (el.querySelector && el.querySelector('.parcel-badge-callout')) ||
                          (el.querySelector && el.querySelector('svg text') && (el.textContent.includes('Ada') || el.textContent.includes('Parsel')));

    if (isParcelBadge) {
        const badgeWrap = el.closest('.parcel-badge-callout') || (el.classList.contains('parcel-badge-callout') ? el : el.closest('.callout-wrapper') || el);
        const svg = badgeWrap.querySelector('svg');
        const textNode = svg ? svg.querySelector('text') : null;
        const currentFam = (textNode && (textNode.style.fontFamily || textNode.getAttribute('font-family'))) || badgeWrap.dataset.fontFamily || '';
        
        $('elFontFamily').value='';
        if (currentFam) {
            FONTS.forEach(f => {
                const cleanName = f.name.replace(/[✒️👑🚀💥🎯 ]/g,'');
                if (currentFam.toLowerCase().includes(cleanName.toLowerCase()) || f.family.toLowerCase().includes(currentFam.toLowerCase())) {
                    $('elFontFamily').value = f.family;
                }
            });
        }
        $('elFontWeight2').value = (textNode && (textNode.style.fontWeight || textNode.getAttribute('font-weight'))) || '';
        $('elFontStyle2').value = (textNode && (textNode.style.fontStyle || textNode.getAttribute('font-style'))) || '';
        const ls = parseInt((textNode && (textNode.style.letterSpacing || textNode.getAttribute('letter-spacing'))) || 0);
        $('elLetterSp').value = ls;
        $('elLetterSpVal').textContent = ls;
        const w = parseInt((textNode && (textNode.style.fontWeight || textNode.getAttribute('font-weight'))) || 800);
        $('elWeightSlider').value = w;
        $('elWeightVal').textContent = w;
        setTimeout(()=>{window._loadingElSettings=false},100);
        return;
    }

    if(el.dataset.customFont){
        $('elFontFamily').value='';
        FONTS.forEach(f=>{if(el.style.fontFamily.includes(f.name.replace(/[✒️👑🚀💥🎯 ]/g,'')))$('elFontFamily').value=f.family});
        $('elFontWeight2').value=el.style.fontWeight||'';
        $('elFontStyle2').value=el.style.fontStyle||'';
    }else{
        $('elFontFamily').value='';
        $('elFontWeight2').value='';
        $('elFontStyle2').value='';
    }
    const ls=parseInt(el.style.letterSpacing)||0;
    $('elLetterSp').value=ls;
    $('elLetterSpVal').textContent=ls;
    const w=parseInt(el.style.fontWeight)||700;
    $('elWeightSlider').value=w;
    $('elWeightVal').textContent=w;
    setTimeout(()=>{window._loadingElSettings=false},100);
}
