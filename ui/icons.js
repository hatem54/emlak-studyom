
const defaultLucideCategories = {
    "☕ Sosyal & Tesis": [
        "home", "building", "building2", "warehouse", "bed", "bath", "car", "dumbbell", "waves", "coffee", "utensils", "store", "shopping-cart", "school", "hospital"
    ],
    "🔒 Güvenlik": [
        "shield", "shield-check", "shield-alert", "lock", "unlock", "key", "eye", "bell", "alert-circle", "siren"
    ],
    "🌿 Doğa": [
        "tree-pine", "tree-deciduous", "trees", "flower", "sun", "cloud", "cloud-rain", "snowflake", "wind", "droplet", "flame"
    ],
    "🌄 Manzara": [
        "mountain", "waves", "sun-dim", "image", "camera", "video", "tv"
    ],
    "💬 İletişim": [
        "phone", "phone-call", "mail", "message-circle", "message-square", "user", "users", "map-pin", "map", "compass"
    ],
    "🛠️ Araçlar": [
        "hammer", "wrench", "paint-roller", "drafting-compass", "hard-hat", "ruler", "layers", "box", "package", "printer"
    ],
    "⭐ Diğer": [
        "star", "heart", "check", "plus", "minus", "arrow-right", "arrow-left", "arrow-up", "arrow-down", "zap", "gem", "sparkles"
    ],
    "🎨 Tüm Çizgi İkonlar": []
};

window.ICON_CATEGORIES = {};

// 🛡️ SVG ID ve Gradyan / Filtre / Maske Güvenlik Kalkanı
// SVG içindeki id="..." ve url(#...) referanslarını benzersiz kılar;
// Sekme geçişlerinde (display:none) ve dışa aktarım sonrasında gradyanların kaybolmasını kesinlikle önler.
window.makeSvgIdsUnique = function(svgString, prefix = 'cnv_') {
    if (!svgString || typeof svgString !== 'string') return svgString;
    if (!svgString.includes('id=')) return svgString;
    
    const uid = prefix + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    const idMatches = Array.from(svgString.matchAll(/\bid=(["'])([^"'\s>]+)\1/g));
    if (idMatches.length === 0) return svgString;
    
    const seen = new Set();
    const oldIds = [];
    idMatches.forEach(m => {
        const id = m[2];
        if (!seen.has(id)) {
            seen.add(id);
            oldIds.push(id);
        }
    });

    let result = svgString;
    oldIds.forEach(oldId => {
        const newId = `${oldId}_${uid}`;
        result = result.replace(new RegExp(`\\bid=(["'])${oldId}\\1`, 'g'), `id=$1${newId}$1`);
        result = result.replace(new RegExp(`url\\((['"]?)#${oldId}\\1\\)`, 'g'), `url($1#${newId}$1)`);
        result = result.replace(new RegExp(`href=(["'])#${oldId}\\1`, 'g'), `href=$1#${newId}$1`);
    });
    return result;
};

window.healSvgElementIds = function(container) {
    const target = container || document.getElementById('ui-layer') || document.getElementById('canvas-container');
    if (!target) return;
    const svgs = target.querySelectorAll('svg');
    svgs.forEach(svg => {
        const defEls = svg.querySelectorAll('linearGradient[id], radialGradient[id], filter[id], clipPath[id], mask[id]');
        if (defEls.length === 0) return;
        
        let needsHeal = false;
        defEls.forEach(el => {
            if (!el.id.includes('_cnv_') && !el.id.includes('_uid_') && !el.id.includes('_svg_')) {
                needsHeal = true;
            }
        });
        
        if (needsHeal) {
            const uid = 'cnv_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
            defEls.forEach(el => {
                const oldId = el.id;
                if (oldId.includes('_cnv_') || oldId.includes('_uid_')) return;
                const newId = `${oldId}_${uid}`;
                el.id = newId;
                
                const allReferencing = svg.querySelectorAll(`[fill*="#${oldId}"], [stroke*="#${oldId}"], [filter*="#${oldId}"], [clip-path*="#${oldId}"]`);
                allReferencing.forEach(r => {
                    ['fill', 'stroke', 'filter', 'clip-path'].forEach(attr => {
                        const val = r.getAttribute(attr);
                        if (val && val.includes(`#${oldId}`)) {
                            r.setAttribute(attr, val.replace(new RegExp(`#${oldId}\\b`, 'g'), `#${newId}`));
                        }
                    });
                });
            });
        }
    });
};

function buildIconCategoriesUI() {
    // 1. Sıralama: Görselli Premium İkonlar (ICON_LIBRARY) EN ÜSTTE, ardından Lucide / Çizgi İkonlar
    const mergedCategories = {};

    if (window.ICON_LIBRARY) {
        Object.keys(window.ICON_LIBRARY).forEach(key => {
            const catData = window.ICON_LIBRARY[key];
            const catTitle = catData.title || key;
            mergedCategories[catTitle] = catData.items.map(item => ({
                id: item.id,
                name: item.name,
                svg: item.svg
            }));
        });
    }

    Object.keys(defaultLucideCategories).forEach(catTitle => {
        mergedCategories[catTitle] = [...defaultLucideCategories[catTitle]];
    });

    window.ICON_CATEGORIES = mergedCategories;

    const container=document.getElementById('iconCategoryList');
    if(!container)return;
    container.innerHTML='';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';
    container.style.maxHeight = 'none'; // Overwrite inline style
    container.style.overflowY = 'visible';
    container.style.background = 'transparent';
    container.style.border = 'none';
    container.style.padding = '0';
    
    // Hide the global iconPool
    const globalPool = document.getElementById('iconPool');
    if(globalPool) globalPool.style.display = 'none';
    
    // Move the search wrapper to the top of the container
    const searchWrapper = document.getElementById('lucideSearchWrapper');
    if(searchWrapper) {
        container.appendChild(searchWrapper);
        searchWrapper.style.display = 'block'; // Always show search at top
        searchWrapper.style.marginBottom = '10px';
    }
    
    // Create a dedicated search results body
    const searchResultsBody = document.createElement('div');
    searchResultsBody.id = 'lucideSearchResults';
    searchResultsBody.style.cssText = 'display:none; padding:10px; background:var(--dark-3); grid-template-columns:repeat(auto-fill, minmax(45px, 1fr)); gap:6px; border-radius:5px; margin-bottom:10px; border:1px solid rgba(108,92,231,0.3);';
    container.appendChild(searchResultsBody);
    
    Object.keys(window.ICON_CATEGORIES).forEach(cat=>{
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.gap = '0';
        wrapper.style.borderRadius = '6px';
        wrapper.style.overflow = 'hidden';
        wrapper.style.border = '1px solid rgba(255,255,255,0.05)';
        wrapper.style.background = '#162035';
        
        const btn=document.createElement('div');
        btn.className='cat-btn';
        btn.style.cssText = 'padding:14px; background:transparent; color:#f8fafc; cursor:pointer; font-weight:bold; display:flex; justify-content:space-between; align-items:center; transition:background 0.2s; width:100%; box-sizing:border-box;';
        
        const chevron = document.createElement('i');
        chevron.className = 'fa-solid fa-chevron-down';
        chevron.style.fontSize = '12px';
        chevron.style.color = '#94a3b8';
        chevron.style.transition = 'transform 0.2s';
        
        btn.innerHTML = `<span>${cat}</span>`;
        btn.appendChild(chevron);
        
        const body = document.createElement('div');
        body.className = 'cat-body';
        // Use auto-fill with minmax(45px, 1fr) so icons are not too big and not too small, and NO horizontal scroll!
        body.style.cssText = 'display:none; padding:12px; background:var(--dark-3); grid-template-columns:repeat(auto-fill, minmax(45px, 1fr)); gap:8px; border-top:1px solid rgba(255,255,255,0.05);';
        
        btn.onclick = () => {
            const isClosing = (body.style.display === 'grid');
            
            // Close all
            document.querySelectorAll('#iconCategoryList .cat-body').forEach(b => b.style.display = 'none');
            document.querySelectorAll('#iconCategoryList .cat-btn i').forEach(i => i.style.transform = 'rotate(0deg)');
            document.querySelectorAll('#iconCategoryList .cat-btn').forEach(b => {
                b.style.background = 'transparent';
                b.parentElement.style.borderColor = 'rgba(255,255,255,0.05)';
            });
            
            // Hide search results when opening a category
            searchResultsBody.style.display = 'none';
            
            if(!isClosing) {
                // Open this
                body.style.display = 'grid';
                chevron.style.transform = 'rotate(180deg)';
                btn.style.background = 'rgba(108, 92, 231, 0.2)';
                wrapper.style.borderColor = 'var(--primary)';
                
                if(body.innerHTML === '') {
                    renderIconsToContainer(cat, body);
                }
            }
        };
        
        wrapper.appendChild(btn);
        wrapper.appendChild(body);
        container.appendChild(wrapper);
    });
}

function renderIconsToContainer(cat, p) {
    p.innerHTML='';
    
    if (cat === 'Lucide İkonları (500+)' || cat.includes('Çizgi') || cat.includes('Lucide')) {
        const toAdd = new Set();
        if (typeof lucide !== 'undefined') {
            const allKeys = Object.keys(lucide.icons);
            allKeys.slice(0, 500).forEach(k => toAdd.add(k));
            Array.from(toAdd).forEach(name => {
                const svgNode = lucide.createElement(lucide.icons[name]);
                svgNode.setAttribute('stroke', 'currentColor');
                svgNode.setAttribute('stroke-width', '2.2');
                svgNode.setAttribute('width', '100%');
                svgNode.setAttribute('height', '100%');
                window.ICON_CATEGORIES[cat].push(svgNode.outerHTML);
            });
        }
        
        (window.ICON_CATEGORIES[cat]||[]).forEach((ch)=>{
            appendIconToPool(ch, p);
        });
        
    } else {
        (window.ICON_CATEGORIES[cat]||[]).forEach(ch=>{
            let itemObj = ch;
            // Convert lucide name to SVG
            if (typeof ch === 'string' && !ch.trim().startsWith('<svg') && typeof lucide !== 'undefined') {
                const pascalKey = ch.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
                if (lucide.icons[pascalKey] || lucide.icons[ch]) {
                    const iconDef = lucide.icons[pascalKey] || lucide.icons[ch];
                    const svgNode = lucide.createElement(iconDef);
                    svgNode.setAttribute('stroke', 'currentColor');
                    svgNode.setAttribute('stroke-width', '2.2');
                    svgNode.setAttribute('width', '100%');
                    svgNode.setAttribute('height', '100%');
                    itemObj = {
                        name: ch,
                        svg: svgNode.outerHTML
                    };
                }
            }
            appendIconToPool(itemObj, p);
        });
    }
}

function appendIconToPool(ch, p) {
    const d=document.createElement('div');
    d.className='pool-icon-item';
    // Remove padding and fixed size from pool-icon-item so it fits grid
    d.style.cssText = 'background:var(--dark-2); border:1px solid rgba(108,92,231,0.1); color:var(--text); padding:10px; text-align:center; border-radius:5px; cursor:pointer; transition:0.2s; display:flex; align-items:center; justify-content:center; aspect-ratio:1;';
    
    d.onmouseover = () => { d.style.background = 'var(--gradient-1)'; d.style.color = '#fff'; d.style.transform = 'scale(1.05)'; };
    d.onmouseout = () => { d.style.background = 'var(--dark-2)'; d.style.color = 'var(--text)'; d.style.transform = 'scale(1)'; };
    
    let svgContent = (ch && typeof ch === 'object' && ch.svg) ? ch.svg : (typeof ch === 'string' ? ch : '');
    let itemName = (ch && typeof ch === 'object' && ch.name) ? ch.name : '';

    if (itemName) {
        d.title = itemName;
        d.dataset.name = itemName;
    }

    if (typeof svgContent === 'string' && svgContent.trim().startsWith('<svg')) {
        // Adjust the SVG inside to fit its container
        let modSvg = svgContent;
        if(modSvg.includes('width=')) modSvg = modSvg.replace(/width="[^"]*"/, 'width="100%"');
        else modSvg = modSvg.replace('<svg', '<svg width="100%"');
        if(modSvg.includes('height=')) modSvg = modSvg.replace(/height="[^"]*"/, 'height="100%"');
        else modSvg = modSvg.replace('<svg', '<svg height="100%"');
        
        // 🛡️ Havuz içi SVG ID'lerini 'pool_' önekiyle tekilleştir (Tuval kopyalarıyla asla çakışmaz)
        if (typeof window.makeSvgIdsUnique === 'function') {
            modSvg = window.makeSvgIdsUnique(modSvg, 'pool_');
        }
        
        d.innerHTML = modSvg;
    } else {
        d.textContent = typeof ch === 'string' ? ch : (itemName || '');
    }
    d.onclick=()=>addIcon(ch);
    p.appendChild(d);
}

const trToEnMap = {
    'ev': 'home', 'bina': 'building', 'apartman': 'building2', 'harita': 'map', 'konum': 'map-pin', 'yatak': 'bed', 'banyo': 'bath', 'araba': 'car', 'ağaç': 'tree', 'güneş': 'sun', 'telefon': 'phone', 'posta': 'mail', 'kullanıcı': 'user', 'bilgi': 'info', 'onay': 'check', 'yıldız': 'star', 'sağ': 'arrow-right', 'sol': 'arrow-left', 'kalp': 'heart', 'resim': 'image', 'video': 'video', 'koltuk': 'sofa', 'deniz': 'waves', 'dağ': 'mountain', 'pusula': 'compass', 'cetvel': 'ruler', 'katman': 'layers', 'ok': 'arrow', 'arti': 'plus', 'eksi': 'minus', 'sil': 'trash', 'çöp': 'trash', 'düzenle': 'edit', 'kaydet': 'save', 'kilit': 'lock', 'ayarlar': 'settings', 'çark': 'cog', 'dosya': 'file', 'kutu': 'box', 'paket': 'package', 'göz': 'eye', 'saat': 'clock', 'zaman': 'clock', 'takvim': 'calendar', 'zil': 'bell', 'mesaj': 'message', 'sohbet': 'message-circle', 'ara': 'search', 'mercek': 'search', 'link': 'link', 'kopyala': 'copy', 'yapıştır': 'clipboard', 'yazdır': 'printer', 'indirim': 'tag', 'etiket': 'tag', 'para': 'banknote', 'dolar': 'dollar-sign', 'euro': 'euro', 'cüzdan': 'wallet', 'kredi': 'credit-card', 'kart': 'credit-card', 'alışveriş': 'shopping-cart', 'sepet': 'shopping-cart', 'mağaza': 'store', 'dükkan': 'store', 'uçak': 'plane', 'bilet': 'ticket', 'ateş': 'flame', 'yangın': 'flame', 'su': 'droplet', 'damla': 'droplet', 'rüzgar': 'wind', 'bulut': 'cloud', 'yağmur': 'cloud-rain', 'kar': 'snowflake', 'okul': 'school', 'mezun': 'graduation-cap', 'kitap': 'book', 'kahve': 'coffee', 'yemek': 'utensils', 'çatal': 'utensils', 'hastane': 'hospital', 'sağlık': 'heart-pulse', 'spor': 'dumbbell', 'koşu': 'footprints', 'müzik': 'music', 'kulaklık': 'headphones', 'mikrofon': 'mic', 'hoparlör': 'speaker', 'tv': 'tv', 'bilgisayar': 'monitor', 'laptop': 'laptop', 'tablet': 'tablet', 'mouse': 'mouse', 'klavye': 'keyboard', 'wifi': 'wifi', 'bluetooth': 'bluetooth', 'pil': 'battery', 'şarj': 'battery-charging', 'kamera': 'camera', 'fotoğraf': 'camera', 'oda': 'bed', 'salon': 'sofa', 'mutfak': 'chef-hat', 'bahçe': 'flower', 'havuz': 'waves', 'garaj': 'warehouse', 'asansör': 'arrow-up-down', 'merdiven': 'stairs', 'balkon': 'columns', 'teras': 'sun-dim', 'çatı': 'home', 'arsa': 'map', 'tarla': 'tractor', 'çiftlik': 'tractor', 'orman': 'trees', 'manzara': 'image', 'şömine': 'flame', 'güvenlik': 'shield', 'klima': 'wind', 'ısıtma': 'thermometer', 'doğalgaz': 'flame', 'lüks': 'gem', 'fırsat': 'alert-circle', 'acil': 'siren', 'satılık': 'tag', 'kiralık': 'key', 'yeni': 'sparkles', 'sıfır': 'sparkles', 'proje': 'drafting-compass', 'inşaat': 'hard-hat', 'vinç': 'crane', 'usta': 'hammer', 'boya': 'paint-roller', 'tadilat': 'wrench', 'tapu': 'file-text', 'sözleşme': 'file-signature', 'imza': 'pen', 'kalem': 'pen', 'emlakçı': 'user', 'müşteri': 'users', 'anlaşma': 'handshake', 'başarı': 'award', 'ödül': 'trophy', 'hedef': 'target', 'rozet': 'badge', 'hızlı': 'zap', 'enerji': 'zap', 'fatura': 'receipt'
};
window.trToEnMap = trToEnMap;

window.filterLucideIcons = function(query) {
    const p=document.getElementById('lucideSearchResults');
    if(!p) return;
    p.innerHTML='';
    
    if(!query || query.trim() === '') {
        p.style.display = 'none';
        return;
    }
    
    // Close all accordions when searching
    document.querySelectorAll('#iconCategoryList .cat-body').forEach(b => b.style.display = 'none');
    document.querySelectorAll('#iconCategoryList .cat-btn i').forEach(i => i.style.transform = 'rotate(0deg)');
    document.querySelectorAll('#iconCategoryList .cat-btn').forEach(b => {
        b.style.background = 'transparent';
        b.parentElement.style.borderColor = 'rgba(255,255,255,0.05)';
    });
    
    if(typeof lucide === 'undefined') return;
    
    p.style.display = 'grid';
    
    const q = query.toLowerCase().trim();
    const allKeys = Object.keys(lucide.icons);
    
    let searchTerms = [q];
    Object.keys(trToEnMap).forEach(trWord => {
        if (trWord.includes(q)) {
            searchTerms.push(trToEnMap[trWord]);
        }
    });
    
    const matches = allKeys.filter(k => {
        const keyLower = k.toLowerCase();
        return searchTerms.some(term => keyLower.includes(term.replace(/-/g, '')));
    }).slice(0, 50);
    
    matches.forEach(name => {
        const svgNode = lucide.createElement(lucide.icons[name]);
        svgNode.setAttribute('stroke', 'currentColor');
        svgNode.setAttribute('stroke-width', '2.2');
        svgNode.setAttribute('width', '100%');
        svgNode.setAttribute('height', '100%');
        const ch = {
            name: name,
            svg: svgNode.outerHTML
        };
        appendIconToPool(ch, p);
    });
}

function addIcon(ch){
    if (window.CanvasEmptyState && typeof window.CanvasEmptyState.dismiss === 'function') {
        window.CanvasEmptyState.dismiss();
    }
    const svgStr = (ch && typeof ch === 'object' && ch.svg) ? ch.svg : (typeof ch === 'string' ? ch : '');
    const itemName = (ch && typeof ch === 'object' && ch.name) ? ch.name : '';

    const icon=document.createElement('div');
    icon.className='draggable added-icon canvas-el';
    if (itemName) icon.dataset.name = itemName;
    if (svgStr && svgStr.trim().startsWith('<svg')) { 
        let modSvg = svgStr;
        if(modSvg.includes('width=')) modSvg = modSvg.replace(/width="[^"]*"/, 'width="1em"');
        else modSvg = modSvg.replace('<svg', '<svg width="1em"');
        if(modSvg.includes('height=')) modSvg = modSvg.replace(/height="[^"]*"/, 'height="1em"');
        else modSvg = modSvg.replace('<svg', '<svg height="1em"');
        
        // 🛡️ Tuvale eklenen SVG'nin tüm ID ve gradyan referanslarını benzersiz kıl
        // (Panel gizlendiğinde veya dışa aktarımda gradyanların kaybolmasını kesinlikle önler)
        if (typeof window.makeSvgIdsUnique === 'function') {
            modSvg = window.makeSvgIdsUnique(modSvg, 'cnv_');
        }
        
        icon.innerHTML = modSvg;
        icon.classList.add('is-svg-icon');
    } else { 
        icon.textContent=typeof ch === 'string' ? ch : (itemName || ''); 
    }
    icon.dataset.label='İkon: ' + (itemName || (svgStr.length > 50 ? 'SVG' : svgStr));
    let fSize = 60;
    if (window.isMobileDevice && window.isMobileDevice()) {
        const sf = typeof scaleFactor !== 'undefined' && scaleFactor > 0 ? scaleFactor : 1;
        const isLand = window.innerWidth > window.innerHeight;
        const defaultCanvasW = isLand ? 1920 : 1080;
        const defaultCanvasH = isLand ? 1080 : 1920;
        const pa = document.querySelector('.main-preview') || document.body;
        const availableW = pa.clientWidth - (isLand ? 40 : 0);
        const availableH = window.innerHeight - (isLand ? 40 : 145);
        const base_sf = Math.min(availableW / defaultCanvasW, availableH / defaultCanvasH);
        const multiplier = base_sf / sf;
        fSize = Math.round(fSize * multiplier);
    } else {
        const sf = typeof scaleFactor !== 'undefined' && scaleFactor > 0 ? scaleFactor : 1;
        if (sf < 1) fSize = Math.round(fSize / sf);
    }

    const isMob = (typeof window.isMobileDevice === 'function' && window.isMobileDevice()) || window.innerWidth <= 768;
    const isLight = !isMob && (document.documentElement.getAttribute('data-theme') === 'light' || 
                    document.body.getAttribute('data-theme') === 'light' || 
                    localStorage.getItem('emlak_app_theme') !== 'dark');

    icon.dataset.defaultFont = fSize.toString();
    icon.dataset.rotation='0';
    icon.dataset.shadowVal='0';
    icon.dataset.blurVal='0';
    icon.dataset.storedBorderColor='#38bdf8';
    icon.dataset.storedBorderWidth='0';

    if (isLight) {
        icon.dataset.storedBgHex='#ffffff';
        icon.dataset.storedBgOpacity='0';
        icon.style.background='transparent';
        icon.style.padding='0';
        icon.style.borderRadius='0';
        icon.style.color='#000000';
    } else {
        icon.dataset.storedBgHex='#0f172a';
        icon.dataset.storedBgOpacity='60';
        icon.style.background='rgba(15,23,42,0.6)';
        icon.style.padding='0.28em';
        icon.style.borderRadius='50%';
        icon.style.color='#ffffff';
    }

    const cContainer = document.getElementById('canvas-container');
    const cW = (cContainer && parseFloat(cContainer.style.width)) || (cContainer && cContainer.offsetWidth) || (typeof uploadedImgW !== 'undefined' && uploadedImgW > 0 ? uploadedImgW : 1920);
    const cH = (cContainer && parseFloat(cContainer.style.height)) || (cContainer && cContainer.offsetHeight) || (typeof uploadedImgH !== 'undefined' && uploadedImgH > 0 ? uploadedImgH : 1080);
    const cx = cW / 2;
    const cy = cH / 2;
    icon.style.left = (cx - (fSize/2) + (Math.random()*40 - 20)) + 'px';
    icon.style.top = (cy - (fSize/2) + (Math.random()*40 - 20)) + 'px';
    icon.style.fontSize= fSize + 'px';
    icon.style.opacity='1';
    icon.style.border='none';
    icon.style.zIndex='10';
    icon.style.boxShadow='none';
    uiLayer.appendChild(icon);
    bindDrag(icon);
    enableInlineEdit(icon);
    allIcons.push(icon);
    if (typeof window.healSvgElementIds === 'function') {
        window.healSvgElementIds();
    }
    const countEl = document.getElementById('iconCount');
    if (countEl) countEl.textContent=allIcons.length;
    if (typeof window.recordHistory === 'function') window.recordHistory('İkon eklendi');
    if (typeof requestAutoSave === 'function') requestAutoSave();
}

window._iconsDeleteSelected = function(){
    if(!selectedEl)return;
    const ai=allIcons.indexOf(selectedEl);
    const ci=typeof canvaOverlays !== 'undefined' ? canvaOverlays.indexOf(selectedEl) : -1;
    if(ai>-1){
        allIcons.splice(ai,1);
        selectedEl.remove();
        const countEl = document.getElementById('iconCount');
        if (countEl) countEl.textContent=allIcons.length;
        if (typeof window.recordHistory === 'function') window.recordHistory('İkon silindi');
        if (typeof requestAutoSave === 'function') requestAutoSave();
    }else if(ci>-1){
        canvaOverlays.splice(ci,1);
        selectedEl.remove();
        if (typeof window.recordHistory === 'function') window.recordHistory('Öğe silindi');
        if (typeof requestAutoSave === 'function') requestAutoSave();
    }else{
        if (window.SaberEngine && typeof window.SaberEngine.removeTextSaber === 'function') {
            window.SaberEngine.removeTextSaber(selectedEl);
        }
        document.querySelectorAll('.text-handle').forEach(h => h.remove());
        selectedEl.remove();
        if (typeof window.recordHistory === 'function') window.recordHistory('Öğe silindi');
        if (typeof requestAutoSave === 'function') requestAutoSave();
    }
    deselectAll();
};

window.deleteAllIcons = function(){
    allIcons.forEach(i=>i.remove());
    allIcons=[];
    const countEl = document.getElementById('iconCount');
    if (countEl) countEl.textContent=0;
    if (typeof window.recordHistory === 'function') window.recordHistory('Tüm ikonlar silindi');
    if (typeof requestAutoSave === 'function') requestAutoSave();
    deselectAll();
};

// ==================== İKON AYARLARI PANELİ & NEON YÖNETİMİ ====================

function _safeRgbToHex(col) {
    if (!col) return '#000000';
    if (col.startsWith('#')) return col;
    if (typeof rgbToHex === 'function') {
        try { 
            const res = rgbToHex(col);
            if (res && res.startsWith('#')) return res;
        } catch(e) {}
    }
    const match = col.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
        const r = parseInt(match[1]).toString(16).padStart(2, '0');
        const g = parseInt(match[2]).toString(16).padStart(2, '0');
        const b = parseInt(match[3]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }
    return '#000000';
}

window.loadIconSettings = function(el) {
    el = el || window.selectedEl || (typeof selectedEl !== 'undefined' ? selectedEl : null) || document.querySelector('.added-icon.el-selected, .is-svg-icon.el-selected');
    if (!el) return;
    const isIcon = (el.classList && (el.classList.contains('added-icon') || el.classList.contains('is-svg-icon') || el.classList.contains('canvas-icon'))) ||
        (typeof allIcons !== 'undefined' && Array.isArray(allIcons) && allIcons.includes(el));
    if (!isIcon) return;

    const panel = document.getElementById('iconSettingsPanel');
    if (panel) {
        panel.style.display = 'block';
        panel.open = true;
    }

    const cs = window.getComputedStyle ? window.getComputedStyle(el) : el.style;

    // 1. İkon Boyutu
    const fs = parseInt(el.style.fontSize) || parseInt(cs.fontSize) || parseInt(el.dataset.defaultFont) || 60;
    const sizeSlider = document.getElementById('iconSizeSlider');
    const sizeVal = document.getElementById('iconSizeVal');
    if (sizeSlider) sizeSlider.value = fs;
    if (sizeVal) sizeVal.textContent = fs + 'px';

    // 2. İkon Rengi
    const col = el.style.color || cs.color || '#000000';
    const hexCol = _safeRgbToHex(col);
    const colorPicker = document.getElementById('iconColorPicker');
    if (colorPicker) colorPicker.value = hexCol;

    // 3. Arka Plan
    const bgHex = el.dataset.storedBgHex || (cs.backgroundColor && cs.backgroundColor !== 'transparent' ? _safeRgbToHex(cs.backgroundColor) : '#ffffff');
    const bgOpacity = (el.dataset.storedBgOpacity !== undefined && el.dataset.storedBgOpacity !== null) ? parseInt(el.dataset.storedBgOpacity) : (el.style.background === 'transparent' || !el.style.background ? 0 : 60);
    const bgPicker = document.getElementById('iconBgColorPicker');
    const bgOpSlider = document.getElementById('iconBgOpacitySlider');
    const bgOpVal = document.getElementById('iconBgOpacityVal');
    if (bgPicker) bgPicker.value = bgHex;
    if (bgOpSlider) bgOpSlider.value = bgOpacity;
    if (bgOpVal) bgOpVal.textContent = bgOpacity + '%';

    // 4. Köşe Yuvarlama
    const rad = parseInt(el.style.borderRadius) || (el.style.borderRadius === '50%' ? 50 : 0);
    const radSlider = document.getElementById('iconRadiusSlider');
    const radVal = document.getElementById('iconRadiusVal');
    if (radSlider) radSlider.value = rad;
    if (radVal) radVal.textContent = rad + '%';

    // 5. Döndürme
    const rot = parseInt(el.dataset.rotation) || 0;
    const rotSlider = document.getElementById('iconRotationSlider');
    const rotVal = document.getElementById('iconRotationVal');
    if (rotSlider) rotSlider.value = rot;
    if (rotVal) rotVal.textContent = rot + '°';

    // 6. Opaklık
    const op = Math.round(parseFloat(el.style.opacity !== '' && el.style.opacity !== undefined ? el.style.opacity : 1) * 100);
    const opSlider = document.getElementById('iconOpacitySlider');
    const opVal = document.getElementById('iconOpacityVal');
    if (opSlider) opSlider.value = op;
    if (opVal) opVal.textContent = op + '%';

    // 7. Gölge
    const sh = parseInt(el.dataset.shadowVal) || 0;
    const shSlider = document.getElementById('iconShadowSlider');
    const shVal = document.getElementById('iconShadowVal');
    if (shSlider) shSlider.value = sh;
    if (shVal) shVal.textContent = sh + 'px';

    // 8. Neon
    if (typeof window.syncIconNeonUI === 'function') {
        window.syncIconNeonUI(el);
    }
};

window.applyIconSettings = function() {
    const el = window.selectedEl || (typeof selectedEl !== 'undefined' ? selectedEl : null) || document.querySelector('.added-icon.el-selected, .is-svg-icon.el-selected');
    if (!el) return;

    // 1. İkon Boyutu
    const sizeSlider = document.getElementById('iconSizeSlider');
    if (sizeSlider) {
        const fs = parseInt(sizeSlider.value) || 60;
        el.style.fontSize = fs + 'px';
        el.dataset.defaultFont = fs.toString();
    }

    // 2. İkon Rengi
    const colorPicker = document.getElementById('iconColorPicker');
    if (colorPicker) {
        const hex = colorPicker.value || '#000000';
        el.style.color = hex;
        const svgs = el.querySelectorAll('svg');
        svgs.forEach(svg => {
            const paths = svg.querySelectorAll('path, circle, rect, polygon, line, polyline');
            paths.forEach(p => {
                const s = p.getAttribute('stroke');
                if (s && s !== 'none' && !s.startsWith('url(')) p.setAttribute('stroke', 'currentColor');
                const f = p.getAttribute('fill');
                if (f && f !== 'none' && f !== 'transparent' && !f.startsWith('url(')) p.setAttribute('fill', 'currentColor');
            });
        });
    }

    // 3. Arka Plan & Köşe Yuvarlama
    const bgPicker = document.getElementById('iconBgColorPicker');
    const bgOpSlider = document.getElementById('iconBgOpacitySlider');
    const radSlider = document.getElementById('iconRadiusSlider');
    const bgHex = bgPicker ? bgPicker.value : '#ffffff';
    const bgOp = bgOpSlider ? parseInt(bgOpSlider.value) : 0;
    const radius = radSlider ? parseInt(radSlider.value) : 0;

    el.dataset.storedBgHex = bgHex;
    el.dataset.storedBgOpacity = bgOp.toString();

    if (bgOp > 0) {
        const r = parseInt(bgHex.slice(1, 3), 16) || 0;
        const g = parseInt(bgHex.slice(3, 5), 16) || 0;
        const b = parseInt(bgHex.slice(5, 7), 16) || 0;
        el.style.background = `rgba(${r}, ${g}, ${b}, ${bgOp / 100})`;
        el.style.padding = '0.28em';
    } else {
        el.style.background = 'transparent';
        el.style.padding = '0';
    }
    el.style.borderRadius = radius + '%';

    // 4. Döndürme
    const rotSlider = document.getElementById('iconRotationSlider');
    if (rotSlider) {
        const rot = parseInt(rotSlider.value) || 0;
        el.dataset.rotation = rot.toString();
        const currentScale = el.dataset.scale || 1;
        el.style.transform = 'rotate(' + rot + 'deg) scale(' + currentScale + ')';
    }

    // 5. Opaklık
    const opSlider = document.getElementById('iconOpacitySlider');
    if (opSlider) {
        const op = parseInt(opSlider.value) || 100;
        el.style.opacity = (op / 100).toString();
    }

    // 6. Gölge (Neon aktif değilse)
    const shSlider = document.getElementById('iconShadowSlider');
    if (shSlider) {
        const sh = parseInt(shSlider.value) || 0;
        el.dataset.shadowVal = sh.toString();
        if (el.dataset.neonActive !== 'true') {
            if (bgOp > 0) {
                el.style.boxShadow = sh > 0 ? `0 ${sh}px ${sh * 2}px rgba(0,0,0,0.5)` : 'none';
                el.style.filter = 'none';
            } else {
                el.style.boxShadow = 'none';
                el.style.filter = sh > 0 ? `drop-shadow(0 ${sh}px ${sh}px rgba(0,0,0,0.5))` : 'none';
            }
        }
    }

    if (typeof requestAutoSave === 'function') requestAutoSave();
};

window.toggleIconNeon = function() {
    const el = window.selectedEl || (typeof selectedEl !== 'undefined' ? selectedEl : null) || document.querySelector('.added-icon.el-selected, .is-svg-icon.el-selected');
    if (!el) return;

    const isCurrentlyNeon = el.dataset.neonActive === 'true' || (parseInt(el.dataset.neonGlowSize || 0) > 0);
    const newNeonState = !isCurrentlyNeon;
    el.dataset.neonActive = newNeonState ? 'true' : 'false';

    if (newNeonState) {
        const glowCol = document.getElementById('iconNeonGlowColor')?.value || '#00f0ff';
        const glowSize = parseInt(document.getElementById('iconNeonGlowSize')?.value || 35);
        const intensity = parseFloat(document.getElementById('iconNeonIntensity')?.value || 3.0);
        window.applyIconNeonSettings(glowSize, intensity, glowCol);
    } else {
        window.applyIconNeonSettings(0, 0, '#000000');
    }

    window.syncIconNeonUI(el);
    if (typeof requestAutoSave === 'function') requestAutoSave();
};

window.applyIconNeonSettings = function(overrideSize, overrideIntensity, overrideGlow) {
    const el = window.selectedEl || (typeof selectedEl !== 'undefined' ? selectedEl : null) || document.querySelector('.added-icon.el-selected, .is-svg-icon.el-selected');
    if (!el) return;

    const glowCol = overrideGlow !== undefined ? overrideGlow : (document.getElementById('iconNeonGlowColor')?.value || '#00f0ff');
    const glowSize = overrideSize !== undefined ? overrideSize : parseInt(document.getElementById('iconNeonGlowSize')?.value || 35);
    const intensity = overrideIntensity !== undefined ? overrideIntensity : parseFloat(document.getElementById('iconNeonIntensity')?.value || 3.0);

    el.dataset.neonActive = (glowSize > 0) ? 'true' : 'false';
    el.dataset.neonGlowColor = glowCol;
    el.dataset.neonGlowSize = glowSize.toString();
    el.dataset.neonIntensity = intensity.toString();

    if (glowSize > 0) {
        const normInt = Math.max(0.5, Math.min(8.0, intensity));
        const glow1 = Math.max(1, Math.round(glowSize * 0.2 * normInt));
        const glow2 = Math.max(2, Math.round(glowSize * 0.5 * normInt));
        const glow3 = Math.max(4, Math.round(glowSize * 1.0 * normInt));
        el.style.filter = `drop-shadow(0 0 ${glow1}px ${glowCol}) drop-shadow(0 0 ${glow2}px ${glowCol}) drop-shadow(0 0 ${glow3}px ${glowCol})`;
        el.style.boxShadow = 'none';
    } else {
        const sh = parseInt(el.dataset.shadowVal) || 0;
        const bgOp = parseInt(el.dataset.storedBgOpacity) || 0;
        if (bgOp > 0) {
            el.style.boxShadow = sh > 0 ? `0 ${sh}px ${sh * 2}px rgba(0,0,0,0.5)` : 'none';
            el.style.filter = 'none';
        } else {
            el.style.boxShadow = 'none';
            el.style.filter = sh > 0 ? `drop-shadow(0 ${sh}px ${sh}px rgba(0,0,0,0.5))` : 'none';
        }
    }
    if (typeof requestAutoSave === 'function') requestAutoSave();
};

window.syncIconNeonUI = function(el) {
    el = el || window.selectedEl || (typeof selectedEl !== 'undefined' ? selectedEl : null);
    if (!el) return;
    const isNeon = el.dataset.neonActive === 'true' || (parseInt(el.dataset.neonGlowSize || 0) > 0);
    const btn = document.getElementById('btnToggleIconNeon');
    const btnText = document.getElementById('btnToggleIconNeonText');
    const controls = document.getElementById('iconNeonControls');

    if (btn) {
        if (isNeon) {
            btn.classList.add('active');
            if (btnText) btnText.textContent = 'Neon Kapat';
        } else {
            btn.classList.remove('active');
            if (btnText) btnText.textContent = 'Neon Aç';
        }
    }
    if (controls) {
        controls.style.display = isNeon ? 'flex' : 'none';
    }
    if (isNeon) {
        if (el.dataset.neonGlowColor) {
            const gc = document.getElementById('iconNeonGlowColor');
            if (gc) gc.value = el.dataset.neonGlowColor;
        }
        if (el.dataset.neonGlowSize) {
            const gs = document.getElementById('iconNeonGlowSize');
            const gsv = document.getElementById('iconNeonGlowSizeVal');
            if (gs) gs.value = el.dataset.neonGlowSize;
            if (gsv) gsv.textContent = el.dataset.neonGlowSize + 'px';
        }
        if (el.dataset.neonIntensity) {
            const gi = document.getElementById('iconNeonIntensity');
            const giv = document.getElementById('iconNeonIntensityVal');
            if (gi) gi.value = el.dataset.neonIntensity;
            if (giv) giv.textContent = el.dataset.neonIntensity;
        }
    }
};

window.resetIconSetting = function(type) {
    const el = window.selectedEl || (typeof selectedEl !== 'undefined' ? selectedEl : null) || document.querySelector('.added-icon.el-selected, .is-svg-icon.el-selected');
    if (type === 'size') {
        const s = document.getElementById('iconSizeSlider');
        const sv = document.getElementById('iconSizeVal');
        const def = (el && el.dataset.defaultFont) ? parseInt(el.dataset.defaultFont) : 60;
        if (s) s.value = def;
        if (sv) sv.textContent = def + 'px';
    } else if (type === 'color') {
        const cp = document.getElementById('iconColorPicker');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || document.body.getAttribute('data-theme') === 'dark';
        const def = isDark ? '#ffffff' : '#000000';
        if (cp) cp.value = def;
    } else if (type === 'bgColor') {
        const bgp = document.getElementById('iconBgColorPicker');
        if (bgp) bgp.value = '#ffffff';
    } else if (type === 'bgOpacity') {
        const bo = document.getElementById('iconBgOpacitySlider');
        const bov = document.getElementById('iconBgOpacityVal');
        if (bo) bo.value = 0;
        if (bov) bov.textContent = '0%';
    } else if (type === 'radius') {
        const r = document.getElementById('iconRadiusSlider');
        const rv = document.getElementById('iconRadiusVal');
        if (r) r.value = 0;
        if (rv) rv.textContent = '0%';
    } else if (type === 'rotation') {
        const rot = document.getElementById('iconRotationSlider');
        const rotv = document.getElementById('iconRotationVal');
        if (rot) rot.value = 0;
        if (rotv) rotv.textContent = '0°';
    } else if (type === 'opacity') {
        const op = document.getElementById('iconOpacitySlider');
        const opv = document.getElementById('iconOpacityVal');
        if (op) op.value = 100;
        if (opv) opv.textContent = '100%';
    } else if (type === 'shadow') {
        const sh = document.getElementById('iconShadowSlider');
        const shv = document.getElementById('iconShadowVal');
        if (sh) sh.value = 0;
        if (shv) shv.textContent = '0px';
    } else if (type === 'neonGlowSize') {
        const ngs = document.getElementById('iconNeonGlowSize');
        const ngsv = document.getElementById('iconNeonGlowSizeVal');
        if (ngs) ngs.value = 35;
        if (ngsv) ngsv.textContent = '35px';
    } else if (type === 'neonIntensity') {
        const ni = document.getElementById('iconNeonIntensity');
        const niv = document.getElementById('iconNeonIntensityVal');
        if (ni) ni.value = 3.0;
        if (niv) niv.textContent = '3.0';
    }

    if (type === 'neonGlowSize' || type === 'neonIntensity') {
        if (typeof window.applyIconNeonSettings === 'function') {
            window.applyIconNeonSettings();
        }
    } else if (el) {
        window.applyIconSettings();
        if (typeof window.recordHistory === 'function') window.recordHistory('İkon ayarı sıfırlandı: ' + type);
    }
};

window.resetIconToDefault = function() {
    const el = window.selectedEl || (typeof selectedEl !== 'undefined' ? selectedEl : null) || document.querySelector('.added-icon.el-selected, .is-svg-icon.el-selected');
    if (!el) return;

    ['size', 'color', 'bgColor', 'bgOpacity', 'radius', 'rotation', 'opacity', 'shadow'].forEach(t => window.resetIconSetting(t));
    if (el.dataset.neonActive === 'true') {
        window.toggleIconNeon();
    }
    if (typeof window.recordHistory === 'function') window.recordHistory('İkon varsayılana sıfırlandı');
};


