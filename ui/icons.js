
const defaultLucideCategories = {
    "Sosyal & Tesis": [
        "home", "building", "building2", "warehouse", "bed", "bath", "car", "dumbbell", "waves", "coffee", "utensils", "store", "shopping-cart", "school", "hospital"
    ],
    "Güvenlik": [
        "shield", "shield-check", "shield-alert", "lock", "unlock", "key", "eye", "bell", "alert-circle", "siren"
    ],
    "Doğa": [
        "tree-pine", "tree-deciduous", "trees", "flower", "sun", "cloud", "cloud-rain", "snowflake", "wind", "droplet", "flame"
    ],
    "Manzara": [
        "mountain", "waves", "sun-dim", "image", "camera", "video", "tv"
    ],
    "İletişim": [
        "phone", "phone-call", "mail", "message-circle", "message-square", "user", "users", "map-pin", "map", "compass"
    ],
    "Araçlar": [
        "hammer", "wrench", "paint-roller", "drafting-compass", "hard-hat", "ruler", "layers", "box", "package", "printer"
    ],
    "Diğer": [
        "star", "heart", "check", "plus", "minus", "arrow-right", "arrow-left", "arrow-up", "arrow-down", "zap", "gem", "sparkles"
    ],
    "Lucide İkonları (500+)": []
};

window.ICON_CATEGORIES = {};

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
    
    if (cat === 'Lucide İkonları (500+)') {
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
    const svgStr = (ch && typeof ch === 'object' && ch.svg) ? ch.svg : (typeof ch === 'string' ? ch : '');
    const itemName = (ch && typeof ch === 'object' && ch.name) ? ch.name : '';

    // 🌟 3D MODU KONTROLÜ: Eğer 3D stüdyo aktifse veya 3D katmanı açıksa, ikonu doğrudan 3D sahneye ekle!
    const is3DActive = !window._tempForce2D && window.ThreeDEngine && (
        (typeof window.ThreeDEngine.isActive === 'function' && window.ThreeDEngine.isActive()) ||
        (typeof window.ThreeDEngine.isLayerActive === 'function' && window.ThreeDEngine.isLayerActive())
    );

    if (is3DActive) {
        if (typeof window.ThreeDEngine.add3DElementFromData === 'function') {
            window.ThreeDEngine.add3DElementFromData({
                svg: svgStr,
                name: itemName || '3D İkon',
                elementType: 'element_3d'
            });
            return;
        }
    }

    const icon=document.createElement('div');
    icon.className='draggable added-icon canvas-el';
    if (itemName) icon.dataset.name = itemName;
    if (svgStr && svgStr.trim().startsWith('<svg')) { 
        let modSvg = svgStr;
        if(modSvg.includes('width=')) modSvg = modSvg.replace(/width="[^"]*"/, 'width="1em"');
        else modSvg = modSvg.replace('<svg', '<svg width="1em"');
        if(modSvg.includes('height=')) modSvg = modSvg.replace(/height="[^"]*"/, 'height="1em"');
        else modSvg = modSvg.replace('<svg', '<svg height="1em"');
        
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
    const countEl = document.getElementById('iconCount');
    if (countEl) countEl.textContent=allIcons.length;
    if (typeof window.recordHistory === 'function') window.recordHistory('İkon eklendi');
    if (typeof requestAutoSave === 'function') requestAutoSave();
}

window.deleteSelected = function(){
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
        selectedEl.style.display=selectedEl.style.display==='none'?'block':'none';
        if (typeof requestAutoSave === 'function') requestAutoSave();
    }
    deselectAll();
}

window.deleteAllIcons = function(){
    allIcons.forEach(i=>i.remove());
    allIcons=[];
    const countEl = document.getElementById('iconCount');
    if (countEl) countEl.textContent=0;
    if (typeof window.recordHistory === 'function') window.recordHistory('Tüm ikonlar silindi');
    if (typeof requestAutoSave === 'function') requestAutoSave();
    deselectAll();
}


