// ==================== EVENTS CORE ====================
// Global Event Delegates (Undo sonrasi yeniden baglanmayan eventleri yakalamak icin)
document.addEventListener('contextmenu', function(e) {
    const callout = e.target.closest('.callout-item, .callout-wrap, .co-neon-block, .canvas-icon');
    if (callout) {
        e.preventDefault();
        if (confirm('Bu öğeyi silmek istediğinize emin misiniz?')) {
            callout.remove();
        }
    }
});

document.addEventListener('dblclick', function(e) {
    const callout = e.target.closest('.callout-item');
    if (callout && !callout.classList.contains('callout-wrap')) {
        e.stopPropagation();
        const newText = prompt('Metni düzenle:', callout.textContent);
        if(newText !== null && newText.trim()) callout.textContent = newText;
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
        panel.insertBefore(handle, panel.firstChild);

        let startY = 0;
        let startHeight = 0;
        let isDragging = false;

        handle.addEventListener('touchstart', (e) => {
            if(window.innerWidth > 768) return; // Only on mobile
            isDragging = true;
            startY = e.touches[0].clientY;
            startHeight = panel.getBoundingClientRect().height;
            panel.classList.add('dragging');
        }, {passive: true});

        handle.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            let newHeight = startHeight - deltaY;
            
            // Clamp between 20vh and 85vh
            const minHeight = window.innerHeight * 0.2;
            const maxHeight = window.innerHeight * 0.85;
            
            if (newHeight < minHeight) newHeight = minHeight;
            if (newHeight > maxHeight) newHeight = maxHeight;
            
            panel.style.setProperty('height', newHeight + 'px', 'important');
        }, {passive: true});

        handle.addEventListener('touchend', () => {
            isDragging = false;
            panel.classList.remove('dragging');
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
