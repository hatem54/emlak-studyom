const fs = require('fs');

const dragLogicCode = `
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
`;

let coreJs = fs.readFileSync('core.js', 'utf8');
if (!coreJs.includes('DRAGGABLE BOTTOM SHEET LOGIC')) {
    fs.writeFileSync('core.js', coreJs + '\n' + dragLogicCode);
    console.log("Added draggable bottom sheet logic to core.js");
} else {
    console.log("Logic already exists in core.js");
}
