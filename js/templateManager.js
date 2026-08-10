console.log('🚀 templateManager.js yükleniyor...');

const TEMPLATE_CATEGORIES = [
    { id: 'favorites', name: '⭐ Favori Şablonlar' },
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

window.getFavoriteTemplates = function() {
    try {
        return JSON.parse(localStorage.getItem('canvaFavorites')) || [];
    } catch(e) { return []; }
};

window.isTemplateFavorited = function(cat, idx) {
    const favs = getFavoriteTemplates();
    return favs.some(f => f.cat === cat && f.idx === idx);
};

window.toggleFavoriteTemplate = function(cat, idx, cardElement) {
    let favs = getFavoriteTemplates();
    const existingIdx = favs.findIndex(f => f.cat === cat && f.idx === idx);
    
    if (existingIdx >= 0) {
        favs.splice(existingIdx, 1);
        if (cardElement) {
            const star = cardElement.querySelector('.fav-star');
            if (star) star.classList.remove('active');
        }
    } else {
        favs.push({ cat, idx });
        if (cardElement) {
            const star = cardElement.querySelector('.fav-star');
            if (star) star.classList.add('active');
        }
    }
    
    localStorage.setItem('canvaFavorites', JSON.stringify(favs));
    
    renderFavoritesTab();
};

window.injectFavoriteStars = function() {
    const cards = document.querySelectorAll('.accordion-content:not(#tpl-content-favorites) .template-btn, .accordion-content:not(#tpl-content-favorites) .canva-tpl-card');
    
    cards.forEach(card => {
        if (!card.querySelector('.fav-star')) {
            card.style.position = 'relative';
            
            const star = document.createElement('div');
            star.className = 'fav-star';
            star.innerHTML = '⭐';
            star.title = 'Favorilere Ekle / Çıkar';
            
            const accordionContent = card.closest('.accordion-content');
            if (!accordionContent) return;
            
            const cat = accordionContent.id.replace('tpl-content-', '');
            if (cat === 'favorites') return;
            
            const siblings = Array.from(card.parentNode.children).filter(c => c.classList.contains('template-btn') || c.classList.contains('canva-tpl-card'));
            const idx = siblings.indexOf(card);
            
            if (isTemplateFavorited(cat, idx)) {
                star.classList.add('active');
            }
            
            star.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavoriteTemplate(cat, idx, card);
            };
            
            card.appendChild(star);
        }
    });
};

window.renderFavoritesTab = function() {
    const favContainer = document.getElementById('tpl-content-favorites');
    if (!favContainer) return;
    
    const favs = getFavoriteTemplates();
    
    if (favs.length === 0) {
        favContainer.innerHTML = '<div style="padding:15px; text-align:center; color:#94a3b8; font-size:12px; line-height:1.5;">Henüz favori şablonunuz yok.</div>';
        return;
    }
    
    favContainer.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'canva-tpl-grid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    grid.style.gap = '10px';
    grid.style.padding = '10px';
    
    let renderedCount = 0;
    
    favs.forEach(fav => {
        const originalContainer = document.getElementById(`tpl-content-${fav.cat}`);
        if (!originalContainer) return;
        
        const originalCards = Array.from(originalContainer.querySelectorAll('.template-btn, .canva-tpl-card'));
        const originalCard = originalCards[fav.idx];
        
        if (originalCard) {
            renderedCount++;
            const clone = originalCard.cloneNode(true);
            clone.classList.remove('active');
            
            clone.onclick = (e) => {
                grid.querySelectorAll('.template-btn, .canva-tpl-card').forEach(c => c.classList.remove('active'));
                clone.classList.add('active');
                originalCard.click();
            };
            
            const cloneStar = clone.querySelector('.fav-star');
            if (cloneStar) {
                cloneStar.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavoriteTemplate(fav.cat, fav.idx, originalCard);
                };
            }
            
            grid.appendChild(clone);
        }
    });
    
    if (renderedCount === 0) {
        favContainer.innerHTML = '<div style="padding:15px; text-align:center; color:#94a3b8; font-size:12px; line-height:1.5;">Şablonlar yükleniyor...</div>';
    } else {
        favContainer.appendChild(grid);
    }
};

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
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        };
        
        item.appendChild(header);
        item.appendChild(content);
        container.appendChild(item);
    });
    
    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        mutations.forEach(mut => {
            // Ignore mutations happening inside the favorites tab itself to prevent infinite loops
            if (mut.target && (mut.target.id === 'tpl-content-favorites' || mut.target.closest('#tpl-content-favorites'))) return;
            
            if (mut.addedNodes.length > 0) {
                // Ignore if the ONLY added nodes are the .fav-star elements we inject
                let hasNonStarNode = false;
                mut.addedNodes.forEach(n => {
                    if (n.nodeType === 1 && n.classList && !n.classList.contains('fav-star')) {
                        hasNonStarNode = true;
                    }
                });
                if (hasNonStarNode) shouldUpdate = true;
            }
        });
        if (shouldUpdate) {
            if (typeof injectFavoriteStars === 'function') injectFavoriteStars();
            if (typeof renderFavoritesTab === 'function') renderFavoritesTab();
        }
    });
    observer.observe(container, { childList: true, subtree: true });
    
    setTimeout(() => {
        if (typeof injectFavoriteStars === 'function') injectFavoriteStars();
        if (typeof renderFavoritesTab === 'function') renderFavoritesTab();
    }, 1000);
    
    console.log('✅ Akordiyon yapısı başarıyla oluşturuldu.');
}

initTemplateManager();

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

    // FAZ 2: Sablon Foto Enjeksiyonu
    const zoomLayer = document.querySelector('#photo-layer .photo-inner-zoom');
    let bgImg = '';
    if (zoomLayer) {
        bgImg = window.getComputedStyle(zoomLayer).backgroundImage;
    } else {
        const photoLayer = document.getElementById('photo-layer');
        if (photoLayer) bgImg = window.getComputedStyle(photoLayer).backgroundImage;
    }
    
    console.log('Enjekte edilen arka plan:', bgImg);
    
    if (bgImg && bgImg !== 'none' && bgImg !== '') {
        const slots = baseNode.querySelectorAll('[data-photo-slot]');
        slots.forEach(slot => {
            slot.style.backgroundImage = bgImg;
            if (!slot.style.backgroundSize) slot.style.backgroundSize = 'cover';
            if (!slot.style.backgroundPosition) slot.style.backgroundPosition = 'center';
            if (!slot.style.backgroundRepeat) slot.style.backgroundRepeat = 'no-repeat';
        });
        
        if (baseNode.hasAttribute('data-photo-slot')) {
            baseNode.style.backgroundImage = bgImg;
            if (!baseNode.style.backgroundSize) baseNode.style.backgroundSize = 'cover';
            if (!baseNode.style.backgroundPosition) baseNode.style.backgroundPosition = 'center';
            if (!baseNode.style.backgroundRepeat) baseNode.style.backgroundRepeat = 'no-repeat';
        }
    }

    for (let child of baseNode.children) {
        if (child.classList.contains('photo-panel') || 
            child.id === 'photo-panel' ||
            child.classList.contains('kolaj-foto') ||
            child.classList.contains('kolaj-cerceve') ||
            child.classList.contains('photo-layer')) {
            // Z-index bilerek kaldirildi (Doğal HTML sirasi kullanilacak)
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
            
            // Düzenlenebilir metin veya canvas objesi ise tıklamaya izin ver, diğer dekoratifleri kitle
            if (child.classList.contains('editable-text') || child.classList.contains('canvas-el') || child.querySelector('.editable-text') || child.querySelector('.canvas-el')) {
                child.style.pointerEvents = 'auto';
                child.style.setProperty('pointer-events', 'auto', 'important');
            } else {
                child.style.pointerEvents = 'none';
                child.style.setProperty('pointer-events', 'none', 'important');
            }
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

        // GLOBAL CANVA ID TRACKER
        // Prevents autoSave from loading the wrong template if a specific template file
        // forgot to update activeCanvaId in its click handler.
        document.addEventListener('click', function(e) {
            const card = e.target.closest('.canva-tpl-card');
            if (card && card.dataset && card.dataset.id) {
                if (typeof activeCanvaId !== 'undefined') {
                    activeCanvaId = card.dataset.id;
                } else {
                    window.activeCanvaId = card.dataset.id;
                }
                if (typeof isCanvaMode !== 'undefined') {
                    isCanvaMode = true;
                } else {
                    window.isCanvaMode = true;
                }
                // Trigger autoSave to persist the selected template
                if (typeof requestAutoSave === 'function') {
                    requestAutoSave();
                }
            }
        }, true); // use capture phase so it runs before any stopPropagation        
        
        console.log('✅ Katman düzenleyici aktif');
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryStart);
    } else {
        tryStart();
    }
})();
