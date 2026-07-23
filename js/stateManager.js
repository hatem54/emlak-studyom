/**
 * ============================================
 * EMLAK STÜDYOM - MERKEZİ DURUM YÖNETİCİSİ (STATE MANAGER)
 * js/stateManager.js
 * ============================================
 * 
 * Bu dosya, projede global olarak dağınık şekilde tutulan durumları (selectedEl vb.)
 * merkezi bir yapıda tutarak "Event-Driven" (Olay Odaklı) bir mimari sağlar.
 */

class EmlakStateManager extends EventTarget {
    constructor() {
        super();
        this._state = {
            selectedEl: null,
            drawMode: 'off'
        };
    }

    get selectedEl() {
        return this._state.selectedEl;
    }

    setSelected(el) {
        if (this._state.selectedEl === el) return;
        
        const prevEl = this._state.selectedEl;
        this._state.selectedEl = el;
        
        // Seçim değiştiğinde projeye haber ver!
        this.dispatchEvent(new CustomEvent('selectionChanged', {
            detail: { newEl: el, prevEl: prevEl }
        }));
    }

    get drawMode() {
        return this._state.drawMode;
    }

    setDrawMode(mode) {
        if (this._state.drawMode === mode) return;
        const prevMode = this._state.drawMode;
        this._state.drawMode = mode;
        
        this.dispatchEvent(new CustomEvent('drawModeChanged', {
            detail: { newMode: mode, prevMode: prevMode }
        }));
    }
}

// Tüm projenin erişebileceği global yönetici nesnesi:
window.EmlakState = new EmlakStateManager();

/**
 * Geriye Dönük Uyumluluk (Backwards Compatibility)
 * Eski kodlar "selectedEl = el;" yazdığında otomatik olarak
 * StateManager üzerinden geçmesini sağlar.
 */
Object.defineProperty(window, 'selectedEl', {
    get: function() { return window.EmlakState.selectedEl; },
    set: function(val) { window.EmlakState.setSelected(val); }
});

Object.defineProperty(window, 'drawMode', {
    get: function() { return window.EmlakState.drawMode; },
    set: function(val) { window.EmlakState.setDrawMode(val); }
});
