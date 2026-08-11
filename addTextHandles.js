window.addTextHandles = function(el) {
    if(!el) return;
    if(!el.querySelector('.text-rotate-handle')) {
        const rot = document.createElement('div');
        rot.className = 'text-handle text-rotate-handle';
        rot.contentEditable = 'false';
        rot.title = 'Çevir';
        rot.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.22-10.27l-5.3 5.3"></path></svg>';
        
        let isRotating = false;
        let startAngle = 0;
        let startRotation = 0;
        
        const rotDown = function(e) {
            e.preventDefault();
            e.stopPropagation();
            isRotating = true;
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            startAngle = Math.atan2(cy - centerY, cx - centerX) * (180 / Math.PI);
            startRotation = parseFloat(el.dataset.rotation) || 0;
            
            document.addEventListener('mousemove', rotMove);
            document.addEventListener('touchmove', rotMove, {passive: false});
            document.addEventListener('mouseup', rotUp);
            document.addEventListener('touchend', rotUp);
        };
        
        const rotMove = function(e) {
            if(!isRotating) return;
            e.preventDefault();
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            const currentAngle = Math.atan2(cy - centerY, cx - centerX) * (180 / Math.PI);
            
            let newRotation = startRotation + (currentAngle - startAngle);
            newRotation = newRotation % 360;
            if (newRotation > 180) newRotation -= 360;
            else if (newRotation < -180) newRotation += 360;
            newRotation = Math.round(newRotation);
            
            el.dataset.rotation = newRotation;
            el.style.transform = `rotate(${newRotation}deg)`;
            
            if (typeof selectedEl !== 'undefined' && selectedEl === el) {
                const rotSlider = document.getElementById('elRotate');
                if (rotSlider) rotSlider.value = newRotation;
                const rotVal = document.getElementById('elRotateVal');
                if (rotVal) rotVal.textContent = newRotation + 'Â°';
            }
        };
        
        const rotUp = function() {
            isRotating = false;
            document.removeEventListener('mousemove', rotMove);
            document.removeEventListener('touchmove', rotMove);
            document.removeEventListener('mouseup', rotUp);
            document.removeEventListener('touchend', rotUp);
            if(typeof saveState === 'function') saveState();
        };
        
        const stopEvent = function(e) { e.stopPropagation(); if (e.type === 'click') e.preventDefault(); };
        rot.addEventListener('mousedown', rotDown);
        rot.addEventListener('touchstart', rotDown, {passive: false});
        rot.addEventListener('click', stopEvent);
        rot.addEventListener('touchend', stopEvent);
        el.appendChild(rot);
    }
    
    if(!el.querySelector('.text-delete-handle')) {
        const del = document.createElement('div');
        del.className = 'text-handle text-delete-handle';
        del.contentEditable = 'false';
        del.title = 'Sil';
        del.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
        
        let isDeleting = false;
        const delAction = function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (isDeleting) return;
            isDeleting = true;
            el.style.opacity = '0';
            setTimeout(() => {
                el.remove();
                if(typeof deselectAll === 'function') deselectAll();
                if(typeof saveState === 'function') saveState();
            }, 300);
        };
        const stopDown = function(e) { e.preventDefault(); e.stopPropagation(); };
        const stopUp = function(e) { e.stopPropagation(); };
        del.addEventListener('mousedown', stopDown);
        del.addEventListener('touchstart', stopDown, {passive: false});
        del.addEventListener('click', delAction);
        del.addEventListener('touchend', delAction);
        el.appendChild(del);
    }
    
    if(!el.querySelector('.text-resize-handle')) {
        const res = document.createElement('div');
        res.className = 'text-handle text-resize-handle';
        res.contentEditable = 'false';
        res.title = 'Boyutlandr';
        res.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg>';
        const stopEvent = function(e) { e.stopPropagation(); if (e.type === 'click') e.preventDefault(); };
        res.addEventListener('click', stopEvent);
        // Do NOT stop touchend, otherwise drag.js up() won't fire and resizing stays stuck true!
        el.appendChild(res);
    }
    
    if(!el.querySelector('.text-lock-handle')) {
        const lock = document.createElement('div');
        lock.className = 'text-handle text-lock-handle';
        lock.contentEditable = 'false';
        lock.title = 'Kilitle / A�';
        const lockSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
        const unlockSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>';
        const isLocked = el.dataset.locked === 'true';
        lock.innerHTML = isLocked ? lockSvg : unlockSvg;
        
        let lastToggle = 0;
        const lockAction = function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (Date.now() - lastToggle < 300) return;
            lastToggle = Date.now();
            if (window.layerToggleLock) {
                if(!el.dataset.layerUid) {
                    el.dataset.layerUid = 'layer_' + Math.random().toString(36).substr(2, 9);
                }
                window.layerToggleLock(el.dataset.layerUid);
                const nowLocked = el.dataset.locked === 'true';
                lock.innerHTML = nowLocked ? lockSvg : unlockSvg;
            }
        };
        
        const stopDown = function(e) { e.preventDefault(); e.stopPropagation(); };
        lock.addEventListener('mousedown', stopDown);
        lock.addEventListener('touchstart', stopDown, {passive: false});
        lock.addEventListener('click', lockAction);
        lock.addEventListener('touchend', lockAction);
        el.appendChild(lock);
    }
}

