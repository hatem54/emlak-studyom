// ==================== UNIFIED APPLICATION STATE (AppState / AppStore) ====================
// Tekil Durum Yöneticisi: Global değişken kirliliğini önler, şablon/sekme geçişlerinde
// tuval durumunu temizler ve tüm modüllerin tek kaynaktan veri okumasını sağlar.

window.AppState = {
    // 1. Viewport & Canvas Ölçeği
    viewport: {
        get scaleFactor() { return window.scaleFactor || 1; },
        set scaleFactor(v) { window.scaleFactor = v; }
    },
    // 2. Fotoğraf ve Tuval Konumlandırma Durumu
    photo: {
        get isLocked() { return window.isPhotoLocked !== false; },
        set isLocked(v) { window.isPhotoLocked = v; },
        get zoom() { return parseInt(document.getElementById('photoZoomCtrl') ? document.getElementById('photoZoomCtrl').value : 100); },
        get x() { return parseFloat(document.getElementById('photoXCtrl') ? document.getElementById('photoXCtrl').value : 50); },
        get y() { return parseFloat(document.getElementById('photoYCtrl') ? document.getElementById('photoYCtrl').value : 50); }
    },
    // 3. Çizim Durumu
    draw: {
        get mode() { return typeof drawMode !== 'undefined' ? drawMode : 'off'; },
        set mode(v) { if (typeof setDrawMode === 'function') setDrawMode(v); else window.drawMode = v; },
        get editingIndex() { return typeof editingDrawIndex !== 'undefined' ? editingDrawIndex : -1; }
    },
    // 4. Seçili Nesneler
    selection: {
        get selectedEl() { return typeof selectedEl !== 'undefined' ? selectedEl : window.selectedEl; },
        get selectedElements() { return window.selectedElements || []; }
    },
    // 5. Şablon ve Mod Durumu
    template: {
        get currentMode() { return typeof currentMode !== 'undefined' ? currentMode : 'klasik'; },
        get activeLayout() { return (typeof activeLayout !== 'undefined' && activeLayout) ? activeLayout : ''; },
        get isCanvaMode() { return typeof isCanvaMode !== 'undefined' ? isCanvaMode : false; }
    },
    // 6. Şablon veya Mod Geçişlerinde Güvenli Sıfırlama (State Cleanup)
    resetOnTemplateChange: function(newLayoutKey) {
        if (typeof deselectAll === 'function') deselectAll();
        if (typeof cancelDrawEdit === 'function') cancelDrawEdit();
        if (typeof hideVertexHandles === 'function') hideVertexHandles();
        
        // Çizim modunu kapat
        if (typeof setDrawMode === 'function') setDrawMode('off');
        
        // Seçimleri temizle
        window.selectedEl = null;
        window.selectedElements = [];
        
        // Çift seçim tutamaçlarını kaldır
        document.querySelectorAll('.text-handle, .text-resize-handle, .text-rotate-handle').forEach(h => {
            if (!h.classList.contains('text-lock-handle')) h.remove();
        });
    }
};

window.AppStore = window.AppState; // Alias for AppStore

// ==================== UNIFIED GLOBAL HISTORY MANAGER ====================
// Çizim, Metin, Callout, İkon ve Şablon eylemlerini birleştiren tekil State Stack

window.undoStack = [];
window.redoStack = [];
window.isHistoryRestoring = false;

const MAX_HISTORY_STEPS = 40;
let historyRecordTimeout = null;

// Çizim yollarını Saber ve DOM referanslarından arındırarak kopyalar
function cloneDrawPaths(paths) {
    if (!paths || !Array.isArray(paths)) return [];
    return paths.map(p => {
        const copy = Object.assign({}, p);
        delete copy.el;
        delete copy.saberRef;
        if (copy.points && Array.isArray(copy.points)) {
            copy.points = copy.points.map(pt => Object.assign({}, pt));
        }
        return copy;
    });
}

// Tuval üzerindeki tüm özel nesnelerin (Callout, Metin, İkon, Neon Blok vb.) temiz durumunu yakalar
function captureCustomElements() {
    const elements = [];
    const builtInIds = new Set([
        'photo-layer', 'draw-layer', 'ui-layer', 'mask-layer', 'canva-render-layer',
        'shadow-overlay', 'highlight-overlay', 'vignette-layer',
        'elBadge', 'elPrice', 'elDetails', 'elLogo', 'infoLineText'
    ]);

    const selector = '#canvas-container > .callout-wrap, #canvas-container > .co-neon-block, #canvas-container > .draggable, ' +
                     '#ui-layer > .draggable, #ui-layer > .canvas-el, #ui-layer > .callout-wrap, #ui-layer > .co-neon-block, #ui-layer > .cvi-item, #ui-layer > .svg-icon, #ui-layer > .dynamic-box, ' +
                     '#canva-render-layer > .draggable, #canva-render-layer > .canvas-el';

    const seen = new Set();
    document.querySelectorAll(selector).forEach(el => {
        if (builtInIds.has(el.id)) return;
        if (el.classList.contains('editable-draw')) return; // Çizimler drawPaths ile bağımsız yönetilir
        if (seen.has(el)) return;
        seen.add(el);

        const parent = el.parentElement;
        const parentId = parent ? parent.id : 'ui-layer';

        // Temiz HTML kopyası al (tutamaçlar ve geçici seçim borderları hariç)
        const clone = el.cloneNode(true);
        clone.classList.remove('selected', 'active', 'dragging');
        clone.querySelectorAll('.callout-controls, .callout-resizer, .callout-rotator, .callout-select-border, .text-handle, .text-resize-handle, .text-rotate-handle, .text-delete-handle').forEach(h => {
            if (h.classList.contains('callout-select-border')) h.style.display = 'none';
            if (h.classList.contains('callout-controls') || h.classList.contains('callout-resizer') || h.classList.contains('callout-rotator')) {
                h.style.display = 'none';
            }
        });

        elements.push({
            id: el.id || ('el_' + Math.random().toString(36).substr(2, 9)),
            parentId: parentId,
            className: el.className.replace(/\b(selected|active|dragging)\b/g, '').trim(),
            style: el.getAttribute('style') || '',
            dataset: Object.assign({}, el.dataset),
            innerHTML: clone.innerHTML
        });
    });

    return elements;
}

// Sabit şablon metinlerinin durumunu yakalar
function captureStandardElements() {
    const std = {};
    ['elBadge', 'elPrice', 'elDetails', 'elLogo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            std[id] = {
                visibility: el.style.visibility,
                display: el.style.display,
                innerText: el.innerText,
                innerHTML: id === 'elDetails' ? el.innerHTML : undefined,
                style: el.getAttribute('style') || '',
                dataset: Object.assign({}, el.dataset)
            };
        }
    });
    return std;
}

// Tüm tuvalin eksiksiz JSON snapshot'ını oluşturur
function captureFullState() {
    const activeDrawPaths = (typeof drawPaths !== 'undefined' && Array.isArray(drawPaths)) ? drawPaths : (window.drawPaths || []);
    const canvaLayer = document.getElementById('canva-render-layer');
    const kolajWrap = document.getElementById('kolaj-wrapper');
    const canvasContainer = document.getElementById('canvas-container');

    return {
        timestamp: Date.now(),
        drawPaths: cloneDrawPaths(activeDrawPaths),
        customElements: captureCustomElements(),
        standardElements: captureStandardElements(),
        canvaHtml: (canvaLayer && canvaLayer.style.display !== 'none' && canvaLayer.children.length > 0) ? canvaLayer.innerHTML : null,
        kolajState: kolajWrap ? {
            html: kolajWrap.innerHTML,
            bg: kolajWrap.style.background || kolajWrap.style.backgroundColor || ''
        } : null,
        canvasBgColor: canvasContainer ? canvasContainer.style.backgroundColor : '',
        lastAppliedPalette: window.lastAppliedPalette ? Object.assign({}, window.lastAppliedPalette) : null,
        currentMode: typeof currentMode !== 'undefined' ? currentMode : window.currentMode,
        activeLayout: typeof activeLayout !== 'undefined' ? activeLayout : window.activeLayout
    };
}

// Snapshot'ı tuvale eksiksiz ve güvenli şekilde geri yükler
function applySnapshot(state) {
    if (!state) return;
    window.isHistoryRestoring = true;

    try {
        // 1. Seçimleri kapat
        if (typeof deselectAll === 'function') deselectAll();
        if (typeof cancelDrawEdit === 'function') cancelDrawEdit();

        // 2. Çizimleri Geri Yükle
        if (typeof drawPaths !== 'undefined') {
            drawPaths.length = 0;
            if (state.drawPaths && Array.isArray(state.drawPaths)) {
                state.drawPaths.forEach(p => drawPaths.push(Object.assign({}, p)));
            }
            window.drawPaths = drawPaths;
        }

        // Eski çizim SVG elemanlarını temizle ve yeniden çiz
        document.querySelectorAll('.editable-draw, .draw-svg-item').forEach(el => el.remove());
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();

        // 3. Canva ve Kolaj Şablon Durumlarını Geri Yükle
        if (state.canvaHtml) {
            const canvaLayer = document.getElementById('canva-render-layer');
            if (canvaLayer) {
                // Güvenlik (XSS)
                if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
                    canvaLayer.innerHTML = window.DOMPurify.sanitize(state.canvaHtml);
                } else {
                    canvaLayer.innerHTML = state.canvaHtml;
                }
                canvaLayer.style.display = 'block';
                canvaLayer.querySelectorAll('.photo-panel').forEach(p => {
                    if (typeof _preparePhoto === 'function') _preparePhoto(p);
                    if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p);
                });
                canvaLayer.querySelectorAll('.editable-text').forEach(el => {
                    if (typeof enableInlineEdit === 'function') enableInlineEdit(el);
                    if (typeof bindDrag === 'function') bindDrag(el);
                });
            }
        }

        if (state.kolajState) {
            const kolajWrap = document.getElementById('kolaj-wrapper');
            if (kolajWrap) {
                // Güvenlik (XSS)
                if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
                    kolajWrap.innerHTML = window.DOMPurify.sanitize(state.kolajState.html);
                } else {
                    kolajWrap.innerHTML = state.kolajState.html;
                }
                kolajWrap.style.background = state.kolajState.bg;
                if (typeof _kolajFormatGuncelle === 'function') _kolajFormatGuncelle();
            }
        }

        if (state.canvasBgColor) {
            const canvasContainer = document.getElementById('canvas-container');
            if (canvasContainer) {
                canvasContainer.style.setProperty('background-color', state.canvasBgColor, 'important');
            }
        }

        if (state.lastAppliedPalette) {
            window.lastAppliedPalette = state.lastAppliedPalette;
        }

        // 4. Mevcut Özel Elemanları Temizle
        const builtInIds = new Set([
            'photo-layer', 'draw-layer', 'ui-layer', 'mask-layer', 'canva-render-layer',
            'shadow-overlay', 'highlight-overlay', 'vignette-layer',
            'elBadge', 'elPrice', 'elDetails', 'elLogo', 'infoLineText'
        ]);

        const selector = '#canvas-container > .callout-wrap, #canvas-container > .co-neon-block, #canvas-container > .draggable, ' +
                         '#ui-layer > .draggable, #ui-layer > .canvas-el, #ui-layer > .callout-wrap, #ui-layer > .co-neon-block, #ui-layer > .cvi-item, #ui-layer > .svg-icon, #ui-layer > .dynamic-box, ' +
                         '#canva-render-layer > .draggable, #canva-render-layer > .canvas-el';

        document.querySelectorAll(selector).forEach(el => {
            if (!builtInIds.has(el.id)) {
                el.remove();
            }
        });

        // 5. Özel Elemanları (Callout, Metin, İkon) Yeniden Yarat
        if (state.customElements && Array.isArray(state.customElements)) {
            state.customElements.forEach(data => {
                let parent = document.getElementById(data.parentId);
                if (!parent) parent = document.getElementById('ui-layer') || document.getElementById('canvas-container');
                if (!parent) return;

                const el = document.createElement('div');
                if (data.id) el.id = data.id;
                el.className = data.className;
                
                // Güvenlik (XSS): Geri yüklenen HTML içeriğini temizle
                if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
                    el.innerHTML = window.DOMPurify.sanitize(data.innerHTML);
                } else {
                    el.innerHTML = data.innerHTML;
                }
                
                if (data.style) el.setAttribute('style', data.style);
                if (data.dataset) {
                    Object.keys(data.dataset).forEach(k => el.dataset[k] = data.dataset[k]);
                }

                parent.appendChild(el);

                if (typeof makeDraggable === 'function') makeDraggable(el);
                if (el.classList.contains('callout-wrap') && typeof window.rebindSVGCallout === 'function') {
                    window.rebindSVGCallout(el);
                }
                if (el.classList.contains('co-neon-block') && typeof window.rebindNeonCallout === 'function') {
                    window.rebindNeonCallout(el);
                }
            });
        }

        // 6. Standart Elemanları Geri Yükle
        if (state.standardElements) {
            Object.keys(state.standardElements).forEach(id => {
                const el = document.getElementById(id);
                const data = state.standardElements[id];
                if (el && data) {
                    if (data.innerText !== undefined && id !== 'elDetails') el.innerText = data.innerText;
                    if (data.innerHTML !== undefined && id === 'elDetails') {
                        if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
                            el.innerHTML = window.DOMPurify.sanitize(data.innerHTML);
                        } else {
                            el.innerHTML = data.innerHTML;
                        }
                    }
                    if (data.style) el.setAttribute('style', data.style);
                    if (data.visibility) el.style.visibility = data.visibility;
                    if (data.display) el.style.display = data.display;
                }
            });
        }

        // 7. Katmanlar Panelini Güncelle
        if (typeof window.renderLayers === 'function') window.renderLayers();

    } catch (err) {
        console.error("History restore error:", err);
    } finally {
        setTimeout(() => {
            window.isHistoryRestoring = false;
        }, 60);
    }
}

// Global Geçmiş Kaydetme Fonksiyonu (Debounced & Duplicate Korumalı)
window.recordHistory = function(desc = '') {
    if (window.isHistoryRestoring) return;

    clearTimeout(historyRecordTimeout);
    historyRecordTimeout = setTimeout(() => {
        if (window.isHistoryRestoring) return;
        const snap = captureFullState();
        
        // Önceki durumla aynıysa gereksiz adım ekleme
        const lastSnap = window.undoStack[window.undoStack.length - 1];
        if (lastSnap) {
            const sameDraw = JSON.stringify(lastSnap.drawPaths) === JSON.stringify(snap.drawPaths);
            const sameCustom = JSON.stringify(lastSnap.customElements) === JSON.stringify(snap.customElements);
            const sameStd = JSON.stringify(lastSnap.standardElements) === JSON.stringify(snap.standardElements);
            if (sameDraw && sameCustom && sameStd) {
                return;
            }
        }

        window.undoStack.push(snap);
        if (window.undoStack.length > MAX_HISTORY_STEPS) {
            window.undoStack.shift();
        }
        window.redoStack = []; // Yeni bir aksiyon yapıldığında redo temizlenir
        console.log(`📜 Geçmiş kaydedildi: ${desc} (Toplam: ${window.undoStack.length} adım)`);
        if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
    }, 100);
};

// Evrensel Geri Al (Global Undo)
window.undoGlobal = function() {
    if (window.isHistoryRestoring) return;
    if (window.undoStack.length <= 1) {
        console.log("ℹ️ Geri alınacak başka işlem yok.");
        return;
    }

    const currentState = window.undoStack.pop();
    window.redoStack.push(currentState);

    const previousState = window.undoStack[window.undoStack.length - 1];
    if (previousState) {
        applySnapshot(previousState);
        console.log(`↩️ Geri alındı (Kalan: ${window.undoStack.length} adım)`);
        if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
    }
};

// Evrensel İleri Al (Global Redo)
window.redoGlobal = function() {
    if (window.isHistoryRestoring) return;
    if (window.redoStack.length === 0) {
        console.log("ℹ️ İleri alınacak işlem yok.");
        return;
    }

    const nextState = window.redoStack.pop();
    window.undoStack.push(nextState);
    applySnapshot(nextState);
    console.log(`↪️ İleri alındı (Toplam: ${window.undoStack.length} adım)`);
    if (typeof window.requestAutoSave === 'function') window.requestAutoSave();
};

// Geriye Dönük Uyumluluk (Legacy Alias)
window.undoLastDraw = function() {
    window.undoGlobal();
};
window.redoLastDraw = function() {
    window.redoGlobal();
};
window.initUndoSystem = function() {
    if (typeof window.recordHistory === 'function') {
        window.recordHistory('Başlangıç Durumu');
    }
};

// Başlangıç ilk durumunu kaydet
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.recordHistory('Başlangıç Durumu');
    }, 800);
});
