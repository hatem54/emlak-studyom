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
