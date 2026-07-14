/**
 * ============================================
 * ICONS UI MODULE
 * ui/icons.js
 * ============================================
 * 
 * Bağımlılıklar:
 * - config.js
 * - core/drag.js
 * 
 * Kullanılan yerler:
 * - main.js
 */

function buildIconCategoriesUI(){
    if (window.ICON_LIBRARY && !window._iconLibraryMerged) {
        Object.keys(window.ICON_LIBRARY).forEach(key => {
            const catData = window.ICON_LIBRARY[key];
            const catTitle = catData.title || key;
            if(!ICON_CATEGORIES[catTitle]) {
                ICON_CATEGORIES[catTitle] = catData.items.map(item => item.svg);
            }
        });
        window._iconLibraryMerged = true;
    }

    const sel=$('iconCategory');if(!sel)return;
    sel.innerHTML='';
    Object.keys(ICON_CATEGORIES).forEach(cat=>{
        const opt=document.createElement('option');opt.value=cat;opt.textContent=cat;sel.appendChild(opt);
    });
    renderIconPool();
}

function renderIconPool(){
    const cat=$('iconCategory').value;
    const p=$('iconPool');
    const searchWrapper = $('lucideSearchWrapper');
    if(!p) return;
    p.innerHTML='';
    
    if(cat === '✨ Emlak (Lucide SVG)') {
        if(searchWrapper) searchWrapper.style.display = 'block';
        
        const defaultLucideIcons = [
            'Home', 'Building', 'Building2', 'Key', 'MapPin', 'Camera', 'Bed', 'Bath',
            'Car', 'TreePine', 'Sun', 'Signpost', 'Phone', 'Mail', 'User',
            'Info', 'Check', 'Star', 'ArrowRight', 'Share2', 'Heart', 'Image',
            'Video', 'Sofa', 'TreeDeciduous', 'Waves', 'Mountain', 'Compass',
            'Ruler', 'Layers', 'Maximize'
        ];
        
        if(ICON_CATEGORIES[cat].length === 0 && typeof lucide !== 'undefined') {
            defaultLucideIcons.forEach(name => {
                if(lucide.icons[name]) {
                    const svgNode = lucide.createElement(lucide.icons[name]);
                    svgNode.setAttribute('stroke', '#cbd5e1');
                    svgNode.setAttribute('stroke-width', '2');
                    svgNode.setAttribute('width', '32');
                    svgNode.setAttribute('height', '32');
                    ICON_CATEGORIES[cat].push(svgNode.outerHTML);
                }
            });
        }
        
        (ICON_CATEGORIES[cat]||[]).forEach((ch)=>{
            const d=document.createElement('div');
            d.className='pool-icon-item';
            d.innerHTML=ch;
            d.style.display = 'flex';
            d.style.alignItems = 'center';
            d.style.justifyContent = 'center';
            d.onclick=()=>addIcon(ch);
            p.appendChild(d);
        });
        
    } else {
        if(searchWrapper) searchWrapper.style.display = 'none';
        
        (ICON_CATEGORIES[cat]||[]).forEach(ch=>{
            const d=document.createElement('div');
            d.className='pool-icon-item';
            if (typeof ch === 'string' && ch.trim().startsWith('<svg')) {
                d.innerHTML = ch;
                d.style.display = 'flex';
                d.style.alignItems = 'center';
                d.style.justifyContent = 'center';
            } else {
                d.textContent=ch;
            }
            d.onclick=()=>addIcon(ch);
            p.appendChild(d);
        });
    }
}

const trToEnMap = {
    'ev': 'home', 'bina': 'building', 'apartman': 'building2', 'harita': 'map', 'konum': 'map-pin', 'yatak': 'bed', 'banyo': 'bath', 'araba': 'car', 'ağaç': 'tree', 'güneş': 'sun', 'telefon': 'phone', 'posta': 'mail', 'kullanıcı': 'user', 'bilgi': 'info', 'onay': 'check', 'yıldız': 'star', 'sağ': 'arrow-right', 'sol': 'arrow-left', 'kalp': 'heart', 'resim': 'image', 'video': 'video', 'koltuk': 'sofa', 'deniz': 'waves', 'dağ': 'mountain', 'pusula': 'compass', 'cetvel': 'ruler', 'katman': 'layers', 'ok': 'arrow', 'arti': 'plus', 'eksi': 'minus', 'sil': 'trash', 'çöp': 'trash', 'düzenle': 'edit', 'kaydet': 'save', 'kilit': 'lock', 'ayarlar': 'settings', 'çark': 'cog', 'dosya': 'file', 'kutu': 'box', 'paket': 'package', 'göz': 'eye', 'saat': 'clock', 'zaman': 'clock', 'takvim': 'calendar', 'zil': 'bell', 'mesaj': 'message', 'sohbet': 'message-circle', 'ara': 'search', 'mercek': 'search', 'link': 'link', 'kopyala': 'copy', 'yapıştır': 'clipboard', 'yazdır': 'printer', 'indirim': 'tag', 'etiket': 'tag', 'para': 'banknote', 'dolar': 'dollar-sign', 'euro': 'euro', 'cüzdan': 'wallet', 'kredi': 'credit-card', 'kart': 'credit-card', 'alışveriş': 'shopping-cart', 'sepet': 'shopping-cart', 'mağaza': 'store', 'dükkan': 'store', 'uçak': 'plane', 'bilet': 'ticket', 'ateş': 'flame', 'yangın': 'flame', 'su': 'droplet', 'damla': 'droplet', 'rüzgar': 'wind', 'bulut': 'cloud', 'yağmur': 'cloud-rain', 'kar': 'snowflake', 'okul': 'school', 'mezun': 'graduation-cap', 'kitap': 'book', 'kahve': 'coffee', 'yemek': 'utensils', 'çatal': 'utensils', 'hastane': 'hospital', 'sağlık': 'heart-pulse', 'spor': 'dumbbell', 'koşu': 'footprints', 'müzik': 'music', 'kulaklık': 'headphones', 'mikrofon': 'mic', 'hoparlör': 'speaker', 'tv': 'tv', 'bilgisayar': 'monitor', 'laptop': 'laptop', 'tablet': 'tablet', 'mouse': 'mouse', 'klavye': 'keyboard', 'wifi': 'wifi', 'bluetooth': 'bluetooth', 'pil': 'battery', 'şarj': 'battery-charging', 'kamera': 'camera', 'fotoğraf': 'camera', 'oda': 'bed', 'salon': 'sofa', 'mutfak': 'chef-hat', 'bahçe': 'flower', 'havuz': 'waves', 'garaj': 'warehouse', 'asansör': 'arrow-up-down', 'merdiven': 'stairs', 'balkon': 'columns', 'teras': 'sun-dim', 'çatı': 'home', 'arsa': 'map', 'tarla': 'tractor', 'çiftlik': 'tractor', 'orman': 'trees', 'manzara': 'image', 'şömine': 'flame', 'güvenlik': 'shield', 'klima': 'wind', 'ısıtma': 'thermometer', 'doğalgaz': 'flame', 'lüks': 'gem', 'fırsat': 'alert-circle', 'acil': 'siren', 'satılık': 'tag', 'kiralık': 'key', 'yeni': 'sparkles', 'sıfır': 'sparkles', 'proje': 'drafting-compass', 'inşaat': 'hard-hat', 'vinç': 'crane', 'usta': 'hammer', 'boya': 'paint-roller', 'tadilat': 'wrench', 'tapu': 'file-text', 'sözleşme': 'file-signature', 'imza': 'pen', 'kalem': 'pen', 'emlakçı': 'user', 'müşteri': 'users', 'anlaşma': 'handshake', 'başarı': 'award', 'ödül': 'trophy', 'hedef': 'target', 'rozet': 'badge', 'hızlı': 'zap', 'enerji': 'zap', 'fatura': 'receipt'
};

window.filterLucideIcons = function(query) {
    const p=$('iconPool');
    if(!p) return;
    p.innerHTML='';
    
    if(!query || query.trim() === '') {
        renderIconPool();
        return;
    }
    
    if(typeof lucide === 'undefined') return;
    
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
        return searchTerms.some(term => keyLower.includes(term));
    }).slice(0, 50);
    
    matches.forEach(name => {
        const svgNode = lucide.createElement(lucide.icons[name]);
        svgNode.setAttribute('stroke', '#cbd5e1');
        svgNode.setAttribute('stroke-width', '2');
        svgNode.setAttribute('width', '32');
        svgNode.setAttribute('height', '32');
        const ch = svgNode.outerHTML;
        
        const d=document.createElement('div');
        d.className='pool-icon-item';
        d.innerHTML=ch;
        d.title = name;
        d.style.display = 'flex';
        d.style.alignItems = 'center';
        d.style.justifyContent = 'center';
        d.onclick=()=>addIcon(ch);
        p.appendChild(d);
    });
}

function addIcon(ch){
    const icon=document.createElement('div');
    icon.className='draggable added-icon canvas-el';
    if (ch && ch.trim().startsWith('<svg')) { icon.innerHTML = ch; } else { icon.textContent=ch; }
    icon.dataset.label='İkon: ' + (ch.length > 50 ? 'SVG' : ch);
    icon.dataset.defaultFont='60';
    icon.dataset.rotation='0';
    icon.dataset.shadowVal='15';
    icon.dataset.blurVal='0';
    icon.dataset.storedBgHex='#0f172a';
    icon.dataset.storedBgOpacity='60';
    icon.dataset.storedBorderColor='#38bdf8';
    icon.dataset.storedBorderWidth='0';
    icon.style.left=(750+Math.random()*300)+'px';
    icon.style.top=(350+Math.random()*300)+'px';
    icon.style.fontSize='60px';
    icon.style.padding='15px';
    icon.style.borderRadius='50%';
    icon.style.background='rgba(15,23,42,0.6)';
    icon.style.opacity='1';
    icon.style.border='none';
    icon.style.zIndex='10';
    icon.style.boxShadow='0 15px 30px rgba(0,0,0,0.5)';
    uiLayer.appendChild(icon);
    bindDrag(icon);
    enableInlineEdit(icon);
    allIcons.push(icon);
    $('iconCount').textContent=allIcons.length;
    selectElement(icon);
}

function deleteSelected(){
    if(!selectedEl)return;
    const ai=allIcons.indexOf(selectedEl);
    const ci=canvaOverlays.indexOf(selectedEl);
    if(ai>-1){
        allIcons.splice(ai,1);
        selectedEl.remove();
        $('iconCount').textContent=allIcons.length;
    }else if(ci>-1){
        canvaOverlays.splice(ci,1);
        selectedEl.remove();
    }else{
        selectedEl.style.display=selectedEl.style.display==='none'?'block':'none';
    }
    deselectAll();
}

function deleteAllIcons(){
    allIcons.forEach(i=>i.remove());
    allIcons=[];
    $('iconCount').textContent=0;
    deselectAll();
}
