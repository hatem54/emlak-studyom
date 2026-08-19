window.addTextHandles = function(el) {
    if(!el) return;
    if(!el.querySelector('.text-rotate-handle')) {
        const rot = document.createElement('div');
        rot.className = 'text-handle text-rotate-handle';
        rot.contentEditable = 'false';
        rot.title = 'Döndür';
        rot.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.22-10.27l-5.3 5.3"></path></svg>';
        
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
            document.addEventListener('touchcancel', rotUp);
        };
        
        const rotMove = function(e) {
            if(!isRotating) return;
            if(!document.body.contains(rot)) { rotUp(); return; }
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
            const currentScale = el.dataset.scale || 1; el.style.transform = `rotate(${newRotation}deg) scale(${currentScale})`;;
            
            if (typeof selectedEl !== 'undefined' && selectedEl === el) {
                const rotSlider = document.getElementById('elRotate');
                if (rotSlider) rotSlider.value = newRotation;
                const rotVal = document.getElementById('elRotateVal');
                if (rotVal) rotVal.textContent = newRotation + 'Â°';
            }
        };
        
        window._rotUp = function() { rotUp(); };
        const rotUp = function() {
            isRotating = false;
            document.removeEventListener('mousemove', rotMove);
            document.removeEventListener('touchmove', rotMove);
            document.removeEventListener('mouseup', rotUp);
            document.removeEventListener('touchend', rotUp);
            document.removeEventListener('touchcancel', rotUp);
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
        del.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
        
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
        res.title = 'Boyutlandır';
        res.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:block; pointer-events:none;"><path d="M21 15v6h-6M3 9V3h6M21 21l-7-7M3 3l7 7"></path></svg>';
        
        let isResizing = false;
        let startX = 0, startY = 0, startW = 0, startH = 0, startFontSize = 0;
        
        const resDown = function(e) {
            e.preventDefault();
            e.stopPropagation();
            isResizing = true;
            const c = e.touches ? e.touches[0] : e;
            startX = c.clientX;
            startY = c.clientY;
            startW = el.offsetWidth;
            startH = el.offsetHeight;
            startFontSize = parseFloat(window.getComputedStyle(el).fontSize) || parseFloat(el.dataset.defaultFont) || 60;
            
            document.addEventListener('mousemove', resMove);
            document.addEventListener('touchmove', resMove, {passive: false});
            document.addEventListener('mouseup', resUp);
            document.addEventListener('touchend', resUp);
            document.addEventListener('touchcancel', resUp);
        };
        
        const resMove = function(e) {
            if(!isResizing) return;
            if(!document.body.contains(res)) { resUp(); return; }
            e.preventDefault();
            const c = e.touches ? e.touches[0] : e;
            const sf = typeof window.getGlobalScale === 'function' ? window.getGlobalScale() : 1;
            const rawDx = (c.clientX - startX) / sf;
            const rawDy = (c.clientY - startY) / sf;
            
            const rotDeg = parseFloat(el.dataset.rotation) || 0;
            let dx = rawDx;
            let dy = rawDy;
            if (rotDeg !== 0) {
                const rotRad = rotDeg * Math.PI / 180;
                const cos = Math.cos(rotRad);
                const sin = Math.sin(rotRad);
                dx = rawDx * cos + rawDy * sin;
                dy = -rawDx * sin + rawDy * cos;
            }
            
            const ratio = Math.max(0.2, (startW + dx) / Math.max(1, startW));
            const newFontSize = Math.max(8, Math.round(startFontSize * ratio));
            el.style.fontSize = newFontSize + 'px';
            
            if (el.dataset.label === 'Özel Kutu') {
                el.style.width = Math.max(30, startW + dx) + 'px';
                el.style.height = Math.max(30, startH + dy) + 'px';
            } else if (el.style.width && el.style.width !== 'auto') {
                el.style.width = Math.max(40, Math.round(startW * ratio)) + 'px';
                if (el.style.minHeight && el.style.minHeight !== 'auto') {
                    el.style.minHeight = Math.max(20, Math.round(startH * ratio)) + 'px';
                }
            }
            
            // Update font slider if panel is active
            if (typeof selectedEl !== 'undefined' && selectedEl === el) {
                const fsSlider = document.getElementById('elFontSize') || document.getElementById('fontSize');
                if (fsSlider) {
                    fsSlider.value = newFontSize;
                    const fsVal = document.getElementById('elFontSizeVal') || document.getElementById('fontSizeVal');
                    if (fsVal) fsVal.textContent = newFontSize + 'px';
                }
            }
        };
        
        const resUp = function() {
            if(!isResizing) return;
            isResizing = false;
            document.removeEventListener('mousemove', resMove);
            document.removeEventListener('touchmove', resMove);
            document.removeEventListener('mouseup', resUp);
            document.removeEventListener('touchend', resUp);
            document.removeEventListener('touchcancel', resUp);
            if(typeof saveState === 'function') saveState();
        };
        
        const stopClick = function(e) { e.stopPropagation(); if (e.type === 'click') e.preventDefault(); };
        res.addEventListener('mousedown', resDown);
        res.addEventListener('touchstart', resDown, {passive: false});
        res.addEventListener('click', stopClick);
        el.appendChild(res);
    }
    
    if(!el.querySelector('.text-lock-handle')) {
        const lock = document.createElement('div');
        lock.className = 'text-handle text-lock-handle';
        lock.contentEditable = 'false';
        const lockSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
        const unlockSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>';
        const isLocked = el.dataset.locked === 'true' || el.classList.contains('locked-el');
        lock.innerHTML = isLocked ? lockSvg : unlockSvg;
        lock.title = isLocked ? 'Kilidi Aç' : 'Kilitle';
        if (isLocked) lock.classList.add('is-locked');
        
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
                const nowLocked = el.dataset.locked === 'true' || el.classList.contains('locked-el');
                lock.innerHTML = nowLocked ? lockSvg : unlockSvg;
                lock.title = nowLocked ? 'Kilidi Aç' : 'Kilitle';
                lock.classList.toggle('is-locked', nowLocked);
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

