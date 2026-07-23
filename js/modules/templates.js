
function buildTemplates(){
    const g=$('templateGrid');if(!g)return;
    g.innerHTML=''; // Önce temizle
    
    // Boş Sayfa butonu (İlk sırada)
    const emptyBtn=document.createElement('button');
    emptyBtn.className='template-btn active'; // Başlangıçta aktif
    emptyBtn.id='tpl-empty';
    emptyBtn.textContent='⬜ Boş Sayfa';
    emptyBtn.onclick=function(){
        if(typeof clearAllTemplates === 'function') clearAllTemplates();
        if(elBadge)elBadge.style.visibility='hidden';
        if(elPrice)elPrice.style.visibility='hidden';
        if(elDetails)elDetails.style.visibility='hidden';
        if(elLogo)elLogo.style.visibility='hidden';
        const il=document.getElementById('infoLineText');
        if(il)il.style.visibility='hidden';
        document.querySelectorAll('.template-btn').forEach(function(b){b.classList.remove('active');});
        activeLayout = '';
        emptyBtn.classList.add('active');
        console.log('Boş sayfa moduna geçildi');
        if(typeof redrawAll === 'function') redrawAll();
    };
    g.appendChild(emptyBtn);
    
    // Diğer şablonlar
    Object.keys(TPL).forEach(function(k){
        const b=document.createElement('button');
        b.className='template-btn';
        b.id='tpl-'+k;
        b.textContent=TPL[k].name;
        b.onclick=function(){
            if(typeof clearAllTemplates === 'function') clearAllTemplates();
            if(elBadge)elBadge.style.visibility='visible';
            if(elPrice)elPrice.style.visibility='visible';
            if(elDetails)elDetails.style.visibility='visible';
            if(elLogo && elLogo.src && elLogo.src !== window.location.href) elLogo.style.visibility='visible';
            const il=document.getElementById('infoLineText');
            if(il)il.style.visibility='visible';
            setTemplate(k);
        };
        g.appendChild(b);
    });
    
    console.log('✅ Şablonlar oluşturuldu (Boş Sayfa dahil)');
}

function clearAllTemplates(){
    // 1. Canva şablonunu kaldır
    if(typeof clearCanvaTemplate === 'function' && isCanvaMode){
        clearCanvaTemplate(true);
    }
    
    // 2. Standart şablon elemanlarını GİZLE
    if(elBadge) elBadge.style.visibility = 'hidden';
    if(elPrice) elPrice.style.visibility = 'hidden';
    if(elDetails) elDetails.style.visibility = 'hidden';
    var infoLine = document.getElementById('infoLineText');
    if(infoLine) infoLine.style.visibility = 'hidden';
    
    // 3. Aktif şablon değişkenini sıfırla
    if(typeof activeTemplate !== 'undefined') activeTemplate = null;
    
    // 4. Tüm şablon butonlarından "active" class'ını kaldır
    document.querySelectorAll('.template-btn').forEach(function(b){
        b.classList.remove('active');
    });
    
    // 5. Canva kartlarından da active kaldır (varsa)
    document.querySelectorAll('.canva-tpl-card, [class*="canva-card"]').forEach(function(b){
        b.classList.remove('active', 'selected');
    });
    
    console.log('🗑️ Tüm şablonlar temizlendi - Boş sayfa');
}

function setTemplate(k){
    try {
        if(window.showGlobalLoadingOverlay) window.showGlobalLoadingOverlay(400, "Görsel Hazırlanıyor...");
        if(typeof isCanvaMode !== 'undefined' && isCanvaMode) {
            isCanvaMode = false;
            if(typeof clearCanvaTemplate === 'function') clearCanvaTemplate(true);
        }
        activeLayout=k;
        document.querySelectorAll('.template-btn').forEach(b=>b.classList.toggle('active',b.id==='tpl-'+k));
        const t=TPL[k];
        if(!t) return; // Güvenlik kontrolü, eğer boş şablon veya geçersiz bir k geldiyse dur.
        applyStylePos(elBadge,t.badge);
        applyStylePos(elPrice,t.price);
        applyStylePos(elDetails,t.details);
        if(typeof elLogo !== 'undefined' && elLogo && t.logo) {
            applyStylePos(elLogo, t.logo);
        }
        deselectAll();
        renderData();
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
console.log('🚀 templateManager.js yükleniyor...');

const TEMPLATE_CATEGORIES = [
    { id: 'elit', name: '💎 Elit (Canva)' },
    { id: 'kolaj', name: '🖼️ Kolaj' },
    { id: 'minimal', name: '✨ Minimal' },
    { id: 'luks', name: '👑 Lüks' },
    { id: 'kurumsal', name: '🏢 Kurumsal' },
    { id: 'dinamik', name: '⚡ Dinamik' },
    { id: 'klasik', name: '🏛️ Klasik' },
    { id: 'sosyal', name: '📱 Sosyal Medya' },
    { id: 'portfoy', name: '📁 Portföy' },
    { id: 'ozel', name: '🎯 Özel' }
];

function initTemplateManager() {
    const container = document.getElementById('template-accordion-container');
    if (!container) {
        setTimeout(initTemplateManager, 100);
        return;
    }

    container.innerHTML = '';

    TEMPLATE_CATEGORIES.forEach((cat, index) => {
        const item = document.createElement('div');
        item.className = 'accordion-item';
        
        const header = document.createElement('div');
        header.className = 'accordion-header';
        header.innerHTML = `<span>${cat.name}</span><span class="arrow">▼</span>`;
        
        const content = document.createElement('div');
        content.className = 'accordion-content';
        content.id = `tpl-content-${cat.id}`;
        
        

        header.onclick = () => {
            // Toggle active state
            const isActive = item.classList.contains('active');
            
            // Close all
            document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
            
            // Open this one if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        };
        
        item.appendChild(header);
        item.appendChild(content);
        container.appendChild(item);
    });
    
    console.log('✅ Akordiyon yapısı başarıyla oluşturuldu.');
}

// Start immediately
initTemplateManager();

// ========================================
// KATMAN DÜZENLEYİCİ
// Şablon her yüklendiğinde çizim şablonun altında kalır
// Foto (z:1) → Çizim (z:5) → Şablon süslemeleri (z:10)
// ========================================

// Global erişilebilir fonksiyon - draw.js de kullanır
window.arrangeLayers = function(baseNode) {
    if (!baseNode) return;
    
    // Orijinal yapıyı bozmadan yazıları yerinde sürüklenebilir yap (In-place draggable)
    const editables = baseNode.querySelectorAll('.editable-text:not(.drag-bound)');
    editables.forEach(el => {
        // Class eklemeden ÖNCE pozisyonu kontrol etmeliyiz, çünkü .draggable class'ı otomatik olarak position: absolute yapıyor.
        // Eğer absolute yaparsa, getComputedStyle 'absolute' döner ve şablon düzeni (flexbox) kırılır!
        const currentPos = window.getComputedStyle(el).position;
        
        el.classList.add('drag-bound', 'draggable', 'canvas-el');
        
        // Şablon düzeninin (Flexbox/Grid vb.) KESİNLİKLE kırılmaması için position: relative zorluyoruz.
        // Böylece yazılar orijinal yerlerinde kalır, ancak sürükleme offset'i çalışır.
        if (currentPos === 'static' || currentPos === 'absolute') {
            el.style.position = 'relative';
            el.style.setProperty('position', 'relative', 'important');
        }
        
        el.style.zIndex = '20';
        el.style.cursor = 'move';
        el.dataset.label = 'Şablon Yazısı';
        
        if (!el.dataset.rotation) el.dataset.rotation = '0';
        if (!el.dataset.shadowVal) el.dataset.shadowVal = '0';
        if (!el.dataset.blurVal) el.dataset.blurVal = '0';
        
        if (typeof bindDrag === 'function') bindDrag(el);
    });

    for (let child of baseNode.children) {
        if (child.classList.contains('photo-panel') || 
            child.id === 'photo-panel' ||
            child.classList.contains('kolaj-foto') ||
            child.classList.contains('kolaj-cerceve') ||
            child.classList.contains('photo-layer')) {
            child.style.zIndex = '1';
            child.style.setProperty('z-index', '1', 'important');
        }
        else if (child.id === 'draw-layer') {
            child.style.zIndex = '5';
            child.style.setProperty('z-index', '5', 'important');
        }
        else {
            const currentPos = getComputedStyle(child).position;
            if (currentPos === 'static') {
                child.style.position = 'relative';
            }
            // z:100 — draw canvas (z:5) altında kesinlikle kalır
            child.style.zIndex = '100';
            child.style.setProperty('z-index', '100', 'important');
        }
    }
};

(function initLayerObserver() {
    const tryStart = () => {
        const targetNode = document.getElementById('canva-render-layer');
        if (!targetNode) {
            setTimeout(tryStart, 200);
            return;
        }
        
        const observer = new MutationObserver(() => {
            const base = targetNode.querySelector('.cvr-base') || targetNode;
            window.arrangeLayers(base);
        });
        
        observer.observe(targetNode, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ Katman düzenleyici aktif');
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryStart);
    } else {
        tryStart();
    }
})();
