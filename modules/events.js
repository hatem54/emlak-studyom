// ==================== EVENTS CORE ====================
// Global Event Delegates

// Yardımcı Fonksiyon: Zarif, Kompakt & Yüzer Obje Sağ Tık Menüsü
function openObjectContextMenu(targetElement, isText, clientX, clientY) {
    if (!targetElement) return;

    // Varsa önceki açık menüyü kapat
    const existing = document.getElementById('app-custom-context-menu');
    if (existing) existing.remove();

    const isLocked = targetElement.dataset.locked === 'true' || targetElement.classList.contains('locked-el');
    const isCallout = targetElement.classList.contains('callout-wrap') || targetElement.classList.contains('co-neon-block') || targetElement.classList.contains('callout-item');
    
    // Label belirle
    let label = targetElement.dataset.label || 'Öğe';
    if (targetElement.classList.contains('added-icon')) label = 'İkon';
    else if (isCallout) label = 'Callout';
    else if (targetElement.classList.contains('canvas-el')) label = 'Metin';

    const menu = document.createElement('div');
    menu.id = 'app-custom-context-menu';
    menu.className = 'app-context-menu';

    // Sürüklenebilir Header
    let html = `
        <div class="app-context-header" id="acm-drag-header" title="Sürüklemek için basılı tutun">
            <span style="display:flex; align-items:center; gap:5px; pointer-events:none;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style="opacity:0.6;"><circle cx="9" cy="6" r="2"></circle><circle cx="15" cy="6" r="2"></circle><circle cx="9" cy="12" r="2"></circle><circle cx="15" cy="12" r="2"></circle><circle cx="9" cy="18" r="2"></circle><circle cx="15" cy="18" r="2"></circle></svg>
                ${label} İşlemleri
            </span>
            <button class="acm-close-btn" id="acm-close-btn" title="Kapat">✕</button>
        </div>
    `;

    // Metni Düzenle (Eğer metin düzenlenebilir ise)
    if (isText || targetElement.classList.contains('canvas-el') || targetElement.querySelector('.callout-text, .co-neon-text')) {
        html += `
            <button class="app-context-item item-edit" id="acm-edit">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <span>Metni Düzenle</span>
            </button>
        `;
    }

    // Kilitle / Kilidi Aç
    if (isLocked) {
        html += `
            <button class="app-context-item item-lock" id="acm-lock">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>Kilidi Aç</span>
            </button>
        `;
    } else {
        html += `
            <button class="app-context-item item-lock" id="acm-lock">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                <span>Kilitle</span>
            </button>
        `;
    }

    // Katman Sırası: En Öne / En Arkaya
    html += `
        <button class="app-context-item item-front" id="acm-front">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" stroke-width="2.2"><polyline points="17 11 12 6 7 11"></polyline><polyline points="17 18 12 13 7 18"></polyline></svg>
            <span>En Öne Getir</span>
        </button>
        <button class="app-context-item item-back" id="acm-back">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.2"><polyline points="7 13 12 18 17 13"></polyline><polyline points="7 6 12 11 17 6"></polyline></svg>
            <span>En Arkaya Gönder</span>
        </button>
    `;

    // Sil
    html += `
        <div style="height: 1px; background: rgba(255,255,255,0.06); margin: 2px 0;"></div>
        <button class="app-context-item item-delete" id="acm-delete">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <span>Sil</span>
        </button>
    `;

    menu.innerHTML = html;
    document.body.appendChild(menu);

    // Akıllı Yüzer Konumlandırma (Öğenin hemen yanına yerleştir, üzerini kapatma)
    const rect = targetElement.getBoundingClientRect();
    const menuWidth = 180;
    const menuHeight = menu.offsetHeight || 190;

    let posX, posY;

    // Eğer öğenin sağında yer varsa sağ yanına yerleştir
    if (rect.right + menuWidth + 15 <= window.innerWidth) {
        posX = rect.right + 12;
        posY = Math.max(10, rect.top);
    } 
    // Yoksa sol yanına yerleştir
    else if (rect.left - menuWidth - 15 >= 0) {
        posX = rect.left - menuWidth - 12;
        posY = Math.max(10, rect.top);
    } 
    // İki tarafta da yer yoksa tıklama noktasından hafif ofsetli yerleştir
    else {
        posX = (typeof clientX === 'number' && clientX > 0) ? clientX + 15 : rect.left + 20;
        posY = (typeof clientY === 'number' && clientY > 0) ? clientY + 15 : rect.top + 20;
    }

    // Ekran sınırlarına sabitle
    if (posX + menuWidth > window.innerWidth - 10) posX = window.innerWidth - menuWidth - 10;
    if (posY + menuHeight > window.innerHeight - 10) posY = window.innerHeight - menuHeight - 10;
    if (posX < 10) posX = 10;
    if (posY < 10) posY = 10;

    menu.style.left = posX + 'px';
    menu.style.top = posY + 'px';

    const closeMenu = () => {
        if (menu.parentElement) menu.remove();
        document.removeEventListener('pointerdown', onDocClick, true);
        document.removeEventListener('keydown', onKeyDown, true);
    };

    let didDrag = false;
    const onDocClick = (e) => {
        if (didDrag) return;
        if (!menu.contains(e.target)) closeMenu();
    };
    const onKeyDown = (e) => {
        if (e.key === 'Escape') closeMenu();
    };

    setTimeout(() => {
        document.addEventListener('pointerdown', onDocClick, true);
        document.addEventListener('keydown', onKeyDown, true);
    }, 50);

    // Yüzer Panel Sürükleme (Draggable PC)
    const header = menu.querySelector('#acm-drag-header');
    if (header) {
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let startLeft = 0;
        let startTop = 0;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('#acm-close-btn')) return;
            isDragging = true;
            didDrag = false;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            startLeft = menu.offsetLeft;
            startTop = menu.offsetTop;
            header.style.cursor = 'grabbing';
            e.preventDefault();
            e.stopPropagation();
        });

        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag = true;
            let nx = startLeft + dx;
            let ny = startTop + dy;
            nx = Math.max(5, Math.min(window.innerWidth - menu.offsetWidth - 5, nx));
            ny = Math.max(5, Math.min(window.innerHeight - menu.offsetHeight - 5, ny));
            menu.style.left = nx + 'px';
            menu.style.top = ny + 'px';
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                header.style.cursor = 'grab';
                setTimeout(() => { didDrag = false; }, 100);
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    const closeBtn = menu.querySelector('#acm-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu();
        });
    }

    // Event Handlers
    const delBtn = menu.querySelector('#acm-delete');
    if (delBtn) {
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu();
            targetElement.remove();
            if (typeof updateDrawHistory === 'function') updateDrawHistory();
            if (typeof deselectAll === 'function') deselectAll();
            if (typeof renderLayers === 'function') renderLayers();
        });
    }

    const lockBtn = menu.querySelector('#acm-lock');
    if (lockBtn) {
        lockBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu();
            if (!targetElement.dataset.layerUid) {
                targetElement.dataset.layerUid = 'layer_' + Math.random().toString(36).substr(2, 9);
            }
            if (typeof window.layerToggleLock === 'function') {
                window.layerToggleLock(targetElement.dataset.layerUid);
            }
        });
    }

    const frontBtn = menu.querySelector('#acm-front');
    if (frontBtn) {
        frontBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu();
            const parent = targetElement.parentElement;
            if (parent) parent.appendChild(targetElement);
            if (typeof updateDrawHistory === 'function') updateDrawHistory();
            if (typeof renderLayers === 'function') renderLayers();
        });
    }

    const backBtn = menu.querySelector('#acm-back');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu();
            const parent = targetElement.parentElement;
            if (parent && parent.firstChild) parent.insertBefore(targetElement, parent.firstChild);
            if (typeof updateDrawHistory === 'function') updateDrawHistory();
            if (typeof renderLayers === 'function') renderLayers();
        });
    }

    const editBtn = menu.querySelector('#acm-edit');
    if (editBtn) {
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu();
            const textEl = targetElement.querySelector('.callout-text, .co-neon-text, span, div') || targetElement;
            const curVal = textEl.innerText || textEl.textContent || '';
            const newT = prompt('Metni düzenleyin:', curVal);
            if (newT !== null && newT !== undefined) {
                if (textEl !== targetElement) textEl.innerText = newT;
                else targetElement.innerText = newT;
                if (typeof updateDrawHistory === 'function') updateDrawHistory();
            }
        });
    }
}

// 1. PC: Mouse Sağ Tık (Context Menu)
document.addEventListener('contextmenu', function(e) {
    // Tutamaç butonları, form kontrolleri veya panellere sağ tıklandığında menü açma
    if (e.target.closest && e.target.closest(
        '.callout-controls, .callout-resizer, .callout-rotator, .text-handle, .text-resize-handle, ' +
        '.text-rotate-handle, .text-delete-handle, .text-lock-handle, .draw-handle, .vertex-handle, .cbtn-del, input, button, select, textarea, .panel, .mobile-panel'
    )) {
        return;
    }
    const callout = e.target.closest('.callout-item, .callout-wrap, .co-neon-block, .canvas-icon, .draggable, .added-icon');
    if (callout) {
        e.preventDefault();
        const isText = callout.classList.contains('callout-item') && !callout.classList.contains('callout-wrap');
        openObjectContextMenu(callout, isText, e.clientX, e.clientY);
    }
});

// 2. Mobil: Uzun Basma (Long Press) Sensörü
let longPressTimer;
let touchStartX, touchStartY;
const LONG_PRESS_DURATION = 500;

document.addEventListener('touchstart', function(e) {
    // Tutamaçlara veya butonlara basıldığında uzun basma menüsünü tetikleme
    if (e.target.closest && e.target.closest(
        '.callout-controls, .callout-resizer, .callout-rotator, .text-handle, .text-resize-handle, ' +
        '.text-rotate-handle, .text-delete-handle, .text-lock-handle, .draw-handle, .vertex-handle, .cbtn-del, input, button, select, textarea, .panel, .mobile-panel'
    )) {
        return;
    }
    const callout = e.target.closest('.callout-item, .callout-wrap, .co-neon-block, .canvas-icon, .draggable, .editable-draw');
    if (callout && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        
        longPressTimer = setTimeout(() => {
            // Eğer hala aynı elementteyse
            const isText = callout.classList.contains('callout-item') && !callout.classList.contains('callout-wrap');
            // Haptic feedback (titreşim)
            if (navigator.vibrate) navigator.vibrate(50);
            
            if (typeof window.isMobileDevice === 'function' && window.isMobileDevice()) {
                window.isLongPressOpen = true;
                const isCallout = callout.classList.contains('callout-wrap') || callout.classList.contains('co-neon-block') || callout.classList.contains('callout-item');
                if (isCallout) {
                    const innerEl = callout.classList.contains('callout-wrap') ? callout.querySelector('.callout-svg-container, .callout-item') || callout : callout;
                    if (typeof selectCalloutEl === 'function') selectCalloutEl(innerEl, true);
                } else {
                    if (typeof selectElement === 'function') selectElement(callout, false, true);
                }
                if (typeof switchTab === 'function') switchTab(isCallout ? 'callout' : (callout.classList.contains('editable-draw') ? 'draw' : 'element'));
            } else {
                openObjectContextMenu(callout, isText);
            }
        }, LONG_PRESS_DURATION);
    }
}, { passive: true, capture: true });

document.addEventListener('touchmove', function(e) {
    if (longPressTimer) {
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        // Eğer parmak 10 pikselden fazla kayarsa, uzun basmayı iptal et
        if (dx > 10 || dy > 10) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    }
}, { passive: true, capture: true });

document.addEventListener('touchend', function(e) {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
}, { passive: true, capture: true });

// 3. Çift Tıklama (Double Click) ile Hızlı Metin / İkon Düzenleme ve Sıfırlama (PC)
document.addEventListener('dblclick', function(e) {
    const icon = e.target.closest('.added-icon, .svg-icon, .icon-wrapper');
    if (icon) {
        e.stopPropagation();
        e.preventDefault();
        let defSize = parseFloat(icon.dataset.defaultFont);
        if (!defSize || isNaN(defSize) || defSize <= 0) {
            const sf = typeof scaleFactor !== 'undefined' && scaleFactor > 0 ? scaleFactor : 1;
            defSize = Math.round(60 / sf);
        }
        icon.style.fontSize = defSize + 'px';
        icon.dataset.rotation = '0';
        const currentScale = icon.dataset.scale || 1;
        icon.style.transform = `rotate(0deg) scale(${currentScale})`;
        
        const fsSlider = document.getElementById('elFontSize') || document.getElementById('fontSize');
        if (fsSlider) fsSlider.value = defSize;
        const fsVal = document.getElementById('elFontSizeVal') || document.getElementById('fontSizeVal');
        if (fsVal) fsVal.textContent = defSize + 'px';
        
        const rotSlider = document.getElementById('elRotate');
        if (rotSlider) rotSlider.value = 0;
        const rotVal = document.getElementById('elRotateVal');
        if (rotVal) rotVal.textContent = '0°';
        
        if (typeof saveState === 'function') saveState();
        return;
    }

    const callout = e.target.closest('.callout-item');
    if (callout && !callout.classList.contains('callout-wrap')) {
        e.stopPropagation();
        openObjectContextMenu(callout, true); // Menüyü açmak daha güvenli (Sil/Düzenle)
    }
});

// Boş tuvale veya canvas zeminine tıklandığında seçimi ve tutamaçları temizle
document.addEventListener('pointerdown', function(e) {
    if (e.target.closest(
        '.draggable, .canvas-el, .callout-wrap, .callout-item, .co-neon-block, ' +
        '.text-handle, .text-resize-handle, .text-rotate-handle, .text-delete-handle, .text-lock-handle, ' +
        '.callout-controls, .callout-resizer, .callout-rotator, .callout-lock-btn, .callout-select-border, ' +
        '.draw-handle, .vertex-handle, .cbtn-del, .sidebar, .right-sidebar, .panel, .mobile-panel, ' +
        '.tab-content, .dynamic-field, .tab-btn, button, input, select, textarea, .swal2-container, .modal, .context-menu'
    )) {
        return;
    }
    if (typeof drawMode === 'undefined' || drawMode === 'off' || drawMode === null) {
        if (typeof deselectAll === 'function') deselectAll();
        if (typeof closeCalloutPanel === 'function') closeCalloutPanel();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof window.initUndoSystem === 'function') window.initUndoSystem();
    }, 1000);
});


// ==========================================
// DRAGGABLE BOTTOM SHEET LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const panels = document.querySelectorAll('.dynamic-field');
    
    panels.forEach(panel => {
        // Create drag handle
        const handle = document.createElement('div');
        handle.className = 'drag-handle';
        const bar = document.createElement('div');
        bar.className = 'drag-bar';
        handle.appendChild(bar);
        
        // Create scroll container wrapper for panel content ONLY ON MOBILE to prevent PC layout breaks
        let updatePanelScale = () => {}; // No-op for PC
        
        if (window.isMobileDevice && window.isMobileDevice()) {
            const scrollContainer = document.createElement('div');
            scrollContainer.className = 'panel-scroll-container';
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'panel-content-wrapper';
            
            updatePanelScale = () => {
                const baseWidth = 320;
                const currentWidth = panel.offsetWidth;
                if(currentWidth > 50) {
                    const scale = Math.max(0.65, Math.min(1.4, currentWidth / baseWidth));
                    if (scrollContainer.style.zoom != scale) {
                        const scrollRatio = scrollContainer.scrollHeight > scrollContainer.clientHeight 
                            ? scrollContainer.scrollTop / (scrollContainer.scrollHeight - scrollContainer.clientHeight) 
                            : 0;
                        
                        contentWrapper.style.zoom = scale;
                        
                        if (scrollContainer.scrollHeight > scrollContainer.clientHeight) {
                            scrollContainer.scrollTop = scrollRatio * (scrollContainer.scrollHeight - scrollContainer.clientHeight);
                        }
                    }
                }
            };
            setTimeout(updatePanelScale, 100);

            // Move everything EXCEPT the handle into the wrapper
            Array.from(panel.childNodes).forEach(child => {
                if (child.className !== 'drag-handle') {
                    contentWrapper.appendChild(child);
                }
            });
            scrollContainer.appendChild(contentWrapper);
            panel.appendChild(scrollContainer);
        }
        
        const closeBtn = document.createElement('div');
        closeBtn.className = 'floating-close-btn';
        closeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            if(document.getElementById('toggleFloatingPanel')) {
                document.getElementById('toggleFloatingPanel').checked = false;
            }
            if(typeof toggleFloatingPanelMode === 'function') {
                toggleFloatingPanelMode(false);
            }
            document.querySelectorAll('.dynamic-field').forEach(f => f.classList.remove('show'));
            document.querySelectorAll('#mainTabs .tab-btn').forEach(b => b.classList.remove('active'));
        };
        panel.appendChild(closeBtn);
        
        const expandBtn = document.createElement('div');
        expandBtn.className = 'floating-expand-btn';
        expandBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>';
        let isResizing = false;
        let startResizeWidth = 0;
        let startResizeHeight = 0;
        let startResizeX = 0;
        let startResizeY = 0;

        const startResize = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if(!document.body.classList.contains('floating-panels-active')) return;
            isResizing = true;
            panel.classList.add('dragging');
            startResizeWidth = panel.offsetWidth;
            startResizeHeight = panel.offsetHeight;
            const touch = e.touches ? e.touches[0] : e;
            startResizeX = touch.clientX;
            startResizeY = touch.clientY;
        };

        const doResize = (e) => {
            if (!isResizing) return;
            e.preventDefault();
            e.stopPropagation();
            const touch = e.touches ? e.touches[0] : e;
            const dx = touch.clientX - startResizeX;
            const dy = touch.clientY - startResizeY;
            
            let newWidth = startResizeWidth + dx;
            let newHeight = startResizeHeight + dy;
            
            // Constrain
            if (newWidth < 200) newWidth = 200;
            if (newHeight < 200) newHeight = 200;
            
            panel.style.setProperty('width', newWidth + 'px', 'important');
                  updatePanelScale();
            panel.style.setProperty('height', newHeight + 'px', 'important');
            updatePanelScale();
        };

        const stopResize = (e) => {
            if (!isResizing) return;
            isResizing = false;
            panel.classList.remove('dragging');
        };

        expandBtn.addEventListener('mousedown', startResize, {passive: false});
        expandBtn.addEventListener('touchstart', startResize, {passive: false});
        expandBtn.addEventListener('pointerdown', startResize, {passive: false});
        
        document.addEventListener('mousemove', doResize, {passive: false});
        document.addEventListener('touchmove', doResize, {passive: false});
        document.addEventListener('pointermove', doResize, {passive: false});
        
        document.addEventListener('mouseup', stopResize);
        document.addEventListener('touchend', stopResize);
        document.addEventListener('pointerup', stopResize);
        document.addEventListener('pointercancel', stopResize);
        
        panel.appendChild(expandBtn);
        
        panel.appendChild(handle);

        let startY = 0, startX = 0;
        let startHeight = 0, startWidth = 0;
        let isDragging = false;
        let isLandscape = false;

        let startPanelX = 0, startPanelY = 0;

        panel.addEventListener('touchstart', (e) => {
            if((!window.isMobileDevice())) return; // Only on mobile
            
            const isFloating = document.body.classList.contains('floating-panels-active');
            const tgt = e.target;
            if (tgt.closest('button, input, select, textarea, .floating-close-btn, .range-slider, .color-picker, .preset-btn, .accordion-content, a')) return;
            
            if (!isFloating) {
                if (!tgt.closest('.drag-handle') ) return;
            }
            
            if (isFloating) {
                if (tgt.closest('.panel-scroll-container') && !tgt.closest('.section-title')) {
                    return;
                }
            }
            
            isDragging = true;
            isLandscape = window.innerWidth > window.innerHeight;
            
            if (isFloating) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                const rect = panel.getBoundingClientRect();
                startPanelX = rect.left;
                startPanelY = rect.top;
            } else {
                if (isLandscape) {
                    startX = e.touches[0].clientX;
                    startWidth = panel.getBoundingClientRect().width;
                } else {
                    startY = e.touches[0].clientY;
                    startHeight = panel.getBoundingClientRect().height;
                }
            }
            panel.classList.add('dragging');
        }, {passive: true});

        panel.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            if (document.body.classList.contains('floating-panels-active')) {
                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;
                const newX = startPanelX + (currentX - startX);
                const newY = startPanelY + (currentY - startY);
                panel.style.setProperty('left', newX + 'px', 'important');
                panel.style.setProperty('top', newY + 'px', 'important');
                panel.style.setProperty('bottom', 'auto', 'important');
                panel.style.setProperty('right', 'auto', 'important');
                return;
            }
            
            if (isLandscape) {
                const deltaX = e.touches[0].clientX - startX;
                let newWidth = startWidth - deltaX;
                const minWidth = 150;
                const maxWidth = window.innerWidth * 0.8;
                if (newWidth > maxWidth) newWidth = maxWidth;
                if (newWidth < minWidth) newWidth = minWidth;
                panel.style.setProperty('width', newWidth + 'px', 'important');
                  updatePanelScale();
            } else {
                const currentY = e.touches[0].clientY;
                const deltaY = currentY - startY;
                let newHeight = startHeight - deltaY;
                const minHeight = window.innerHeight * 0.2;
                const maxHeight = window.innerHeight * 0.85;
                if (newHeight < minHeight) newHeight = minHeight;
                if (newHeight > maxHeight) newHeight = maxHeight;
                panel.style.setProperty('height', newHeight + 'px', 'important');
            updatePanelScale();
            }
        }, {passive: false});

        panel.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            panel.classList.remove('dragging');
            // Auto-close logic removed per user request.
        });

        
        handle.addEventListener('touchcancel', () => {
            isDragging = false;
            panel.classList.remove('dragging');
        });
    });
});


// Expose closeBottomSheet to global scope
// Moved closeBottomSheet to module
;

// ==========================================
// ORIENTATION CHANGE LISTENER FOR PANELS
// ==========================================
let lastOrientationWasLandscape = window.innerWidth > window.innerHeight;
window.addEventListener('resize', () => {
    if (typeof window.isMobileDevice === 'function' && !window.isMobileDevice()) return;
    const isLandscape = window.innerWidth > window.innerHeight;
    
    // Yön değişimi gerçekleştiyse inline stilleri temizle
    if (isLandscape !== lastOrientationWasLandscape) {
        lastOrientationWasLandscape = isLandscape;
        
        if (!document.body.classList.contains('floating-panels-active')) {
            document.querySelectorAll('.dynamic-field').forEach(panel => {
                panel.style.removeProperty('width');
                panel.style.removeProperty('height');
                panel.style.removeProperty('top');
                panel.style.removeProperty('left');
                panel.style.removeProperty('bottom');
                panel.style.removeProperty('right');
                
                const contentWrapper = panel.querySelector('.panel-content-wrapper');
                if (contentWrapper) {
                    contentWrapper.style.removeProperty('zoom');
                }
            });
        }
    }






});
