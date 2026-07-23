// ==================== STATE MANAGEMENT ====================
// Uygulamanın global state ve geçmiş (Undo/Redo) yönetim sistemi

// --- Global Variables ---
window.undoStack = [];
window.redoStack = [];
window.currentHistoryState = "";
window.isUndoing = false;

// --- UNDO (GERİ AL) / REDO (İLERİ AL) SİSTEMİ ---
window.initUndoSystem = function() {
    const renderLayer = document.getElementById('canvas-container');
    if (!renderLayer) return;
    
    window.currentHistoryState = renderLayer.innerHTML;
    
    let historyTimeout;
    const observer = new MutationObserver(() => {
        if (window.isUndoing) return;
        
        clearTimeout(historyTimeout);
        historyTimeout = setTimeout(() => {
            const newState = renderLayer.innerHTML;
            if (window.currentHistoryState !== "" && window.currentHistoryState !== newState) {
                window.undoStack.push(window.currentHistoryState);
                if (window.undoStack.length > 30) window.undoStack.shift();
                window.redoStack = []; // Yeni bir hamle yapıldığında ileri al listesi sıfırlanır
            }
            window.currentHistoryState = newState;
        }, 300); // 300ms bekler, peş peşe olan değişiklikleri (sürükleme gibi) tek adım sayar.
    });
    
    observer.observe(renderLayer, { childList: true, subtree: true, attributes: true, characterData: true });
};

window.undoGlobal = function() {
    if (window.undoStack.length === 0) {
        console.log("Geri alınacak işlem yok.");
        return;
    }
    
    window.redoStack.push(window.currentHistoryState);
    const previousState = window.undoStack.pop();
    const renderLayer = document.getElementById('canvas-container');
    if (!renderLayer) return;
    
    window.isUndoing = true;
    renderLayer.innerHTML = previousState;
    window.currentHistoryState = previousState;
    
    if (typeof makeDraggable === 'function') {
        renderLayer.querySelectorAll('.draggable, .canvas-el, .callout-item, .callout-wrap, .co-neon-block').forEach(el => makeDraggable(el));
    }
    if (typeof deselectAll === 'function') deselectAll();
    
    // Küçük bir gecikmeyle isUndoing'i kapatıyoruz ki observer hemen tetiklenmesin
    setTimeout(() => { window.isUndoing = false; }, 50);
};

window.redoGlobal = function() {
    if (window.redoStack.length === 0) {
        console.log("İleri alınacak işlem yok.");
        return;
    }
    
    window.undoStack.push(window.currentHistoryState);
    const nextState = window.redoStack.pop();
    const renderLayer = document.getElementById('canvas-container');
    if (!renderLayer) return;
    
    window.isUndoing = true;
    renderLayer.innerHTML = nextState;
    window.currentHistoryState = nextState;
    
    if (typeof makeDraggable === 'function') {
        renderLayer.querySelectorAll('.draggable, .canvas-el, .callout-item, .callout-wrap, .co-neon-block').forEach(el => makeDraggable(el));
    }
    if (typeof deselectAll === 'function') deselectAll();
    
    setTimeout(() => { window.isUndoing = false; }, 50);
};
