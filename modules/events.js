// ==================== EVENTS CORE ====================
// Global Event Delegates

// Yardımcı Fonksiyon: SweetAlert2 ile Obje Seçenekleri Menüsü
function openObjectContextMenu(targetElement, isText) {
    let htmlContent = `
        <div style="display:flex; flex-direction:column; gap:10px;">
            <button id="cm-delete" class="swal2-confirm swal2-styled" style="background-color:#ef4444; width:100%;">🗑️ Sil</button>
            <button id="cm-front" class="swal2-confirm swal2-styled" style="background-color:#3b82f6; width:100%;">⏫ Öne Al</button>
            <button id="cm-back" class="swal2-confirm swal2-styled" style="background-color:#64748b; width:100%;">⏬ Arkaya At</button>
    `;
    if (isText) {
        htmlContent += `<button id="cm-edit" class="swal2-confirm swal2-styled" style="background-color:#10b981; width:100%;">✏️ Metni Düzenle</button>`;
    }
    htmlContent += `</div>`;

    Swal.fire({
        title: 'Öğe Seçenekleri',
        html: htmlContent,
        showConfirmButton: false,
        showCloseButton: true,
        didOpen: () => {
            const popup = Swal.getPopup();
            popup.querySelector('#cm-delete').addEventListener('click', () => {
                targetElement.remove();
                if(typeof updateDrawHistory === 'function') updateDrawHistory();
                Swal.close();
            });
            popup.querySelector('#cm-front').addEventListener('click', () => {
                const parent = targetElement.parentElement;
                if(parent) parent.appendChild(targetElement); // En sona taşı (öne gelir)
                if(typeof updateDrawHistory === 'function') updateDrawHistory();
                Swal.close();
            });
            popup.querySelector('#cm-back').addEventListener('click', () => {
                const parent = targetElement.parentElement;
                if(parent && parent.firstChild) parent.insertBefore(targetElement, parent.firstChild); // En başa taşı (arkaya gider)
                if(typeof updateDrawHistory === 'function') updateDrawHistory();
                Swal.close();
            });
            if (isText) {
                const editBtn = popup.querySelector('#cm-edit');
                if(editBtn) {
                    editBtn.addEventListener('click', async () => {
                        Swal.close();
                        const { value: text } = await Swal.fire({
                            title: 'Metni Düzenle',
                            input: 'textarea',
                            inputValue: targetElement.textContent,
                            showCancelButton: true
                        });
                        if (text) {
                            targetElement.textContent = text;
                            if(typeof updateDrawHistory === 'function') updateDrawHistory();
                        }
                    });
                }
            }
        }
    });
}

// 1. PC: Mouse Sağ Tık (Context Menu)
document.addEventListener('contextmenu', function(e) {
    const callout = e.target.closest('.callout-item, .callout-wrap, .co-neon-block, .canvas-icon, .draggable');
    if (callout) {
        e.preventDefault();
        const isText = callout.classList.contains('callout-item') && !callout.classList.contains('callout-wrap');
        openObjectContextMenu(callout, isText);
    }
});

// 2. Mobil: Uzun Basma (Long Press) Sensörü
let longPressTimer;
let touchStartX, touchStartY;
const LONG_PRESS_DURATION = 500;

document.addEventListener('touchstart', function(e) {
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

// 3. Çift Tıklama (Double Click) ile Hızlı Metin Düzenleme (PC)
document.addEventListener('dblclick', function(e) {
    const callout = e.target.closest('.callout-item');
    if (callout && !callout.classList.contains('callout-wrap')) {
        e.stopPropagation();
        openObjectContextMenu(callout, true); // Menüyü açmak daha güvenli (Sil/Düzenle)
    }
});

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initUndoSystem, 1000); // Uygulama tamamen yüklendikten sonra geçmişi dinlemeye başla
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
