window.addTextHandles = function(el) {
    if(!el) return;
    // Şablon içi metinlere (canva-render-layer, cvr-base, editable-text, canva-panel) asla tutamaç ekleme;
    // bu tutamaçlar metin ve butonların üzerini kapatır, mizanpajı bozar!
    if (el.closest('#canva-render-layer, .cvr-base, .canva-panel, .canva-generated')) {
        return;
    }
    if(!el.querySelector('.text-rotate-handle')) {
        const rot = document.createElement('div');
        rot.className = 'text-handle text-rotate-handle';
        rot.contentEditable = 'false';
        rot.title = 'Döndür';
        rot.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.22-10.27l-5.3 5.3"></path></svg>';
        
        let isRotating = false;
        let startAngle = 0;
        let startRotation = 0;
        let startCenterX = 0;
        let startCenterY = 0;
        let rotMoveRAF = null;
        
        const rotDown = function(e) {
            e.preventDefault();
            e.stopPropagation();
            isRotating = true;
            const rect = el.getBoundingClientRect();
            startCenterX = rect.left + rect.width / 2;
            startCenterY = rect.top + rect.height / 2;
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            startAngle = Math.atan2(cy - startCenterY, cx - startCenterX) * (180 / Math.PI);
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
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            
            if (rotMoveRAF) return;
            rotMoveRAF = requestAnimationFrame(() => {
                rotMoveRAF = null;
                if (!isRotating) return;

                const currentAngle = Math.atan2(cy - startCenterY, cx - startCenterX) * (180 / Math.PI);
                let newRotation = startRotation + (currentAngle - startAngle);
                newRotation = newRotation % 360;
                if (newRotation > 180) newRotation -= 360;
                else if (newRotation < -180) newRotation += 360;
                newRotation = Math.round(newRotation);
                
                el.dataset.rotation = newRotation;
                const currentScale = el.dataset.scale || 1;
                el.style.transform = `rotate(${newRotation}deg) scale(${currentScale})`;
                
                if (typeof selectedEl !== 'undefined' && selectedEl === el) {
                    const rotSlider = document.getElementById('elRotate');
                    if (rotSlider) rotSlider.value = newRotation;
                    const rotVal = document.getElementById('elRotateVal');
                    if (rotVal) rotVal.textContent = newRotation + '°';
                }

                // ⚡ SABER NEON ANLIK DÖNDÜRME SENKRONİZASYONU (Sıfır Gecikme)
                if (window.SaberEngine && typeof window.SaberEngine.updateTextSaberPositions === 'function') {
                    window.SaberEngine.updateTextSaberPositions();
                }
            });
        };
        
        window._rotUp = function() { rotUp(); };
        const rotUp = function() {
            if (rotMoveRAF) {
                cancelAnimationFrame(rotMoveRAF);
                rotMoveRAF = null;
            }
            if (!isRotating) return;
            isRotating = false;
            document.removeEventListener('mousemove', rotMove);
            document.removeEventListener('touchmove', rotMove);
            document.removeEventListener('mouseup', rotUp);
            document.removeEventListener('touchend', rotUp);
            document.removeEventListener('touchcancel', rotUp);

            // ⚡ Saber Neon son kare güncellemesi
            if (window.SaberEngine && typeof window.SaberEngine.updateTextSaberPositions === 'function') {
                window.SaberEngine.updateTextSaberPositions();
            }
            if(typeof saveState === 'function') saveState();
            if(typeof window.recordHistory === 'function') window.recordHistory('Metin Döndürüldü');
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
                if (el.id === 'elLogo' || el.classList.contains('sh-logo')) {
                    if (typeof clearLogoImage === 'function') {
                        clearLogoImage();
                    } else {
                        el.style.display = 'none';
                        el.style.visibility = 'hidden';
                    }
                    el.style.opacity = '1';
                } else {
                    if (window.SaberEngine && typeof window.SaberEngine.removeTextSaber === 'function') {
                        window.SaberEngine.removeTextSaber(el);
                    }
                    el.remove();
                }
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
        let resMoveRAF = null;
        
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
            
            if (window.selectedElements && window.selectedElements.length > 1 && window.selectedElements.includes(el)) {
                window.selectedElements.forEach(sEl => {
                    sEl._handleStartW = sEl.offsetWidth;
                    sEl._handleStartH = sEl.offsetHeight;
                    sEl._handleStartFs = parseFloat(window.getComputedStyle(sEl).fontSize) || parseFloat(sEl.dataset.defaultFont) || 16;
                });
            }

            if (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function') {
                const sel3D = window.ThreeDGrouping.getSelected3DElements();
                if (sel3D && sel3D.length > 0) {
                    sel3D.forEach(s3 => {
                        s3._handleStartScaleX = s3.scaleX !== undefined ? s3.scaleX : 1.0;
                        s3._handleStartScaleY = s3.scaleY !== undefined ? s3.scaleY : 1.0;
                        s3._handleStartScaleZ = s3.scaleZ !== undefined ? s3.scaleZ : 1.0;
                    });
                }
            }

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
            const clientX = c.clientX;
            const clientY = c.clientY;

            if (resMoveRAF) return;
            resMoveRAF = requestAnimationFrame(() => {
                resMoveRAF = null;
                if (!isResizing) return;

                const sf = typeof window.getGlobalScale === 'function' ? window.getGlobalScale() : 1;
                const rawDx = (clientX - startX) / sf;
                const rawDy = (clientY - startY) / sf;
                
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
                
                const ratio = Math.max(0.1, (startW + dx) / Math.max(1, startW));
                
                if (el.dataset.label === 'Özel Kutu' || el.classList.contains('shape-el')) {
                    const isProportional = el.dataset.shapeType === 'circle' || el.dataset.shapeType === 'square';
                    if (isProportional) {
                        el.style.width = Math.max(30, startW + dx) + 'px';
                        el.style.height = el.style.width;
                    } else {
                        el.style.width = Math.max(30, startW + dx) + 'px';
                        el.style.height = Math.max(10, startH + dy) + 'px';
                    }
                } else if (el.id === 'elLogo' || el.classList.contains('sh-logo') || el.querySelector('img') || el.tagName === 'IMG') {
                    const newW = Math.max(30, Math.round(startW * ratio));
                    el.style.width = newW + 'px';
                    el.style.height = 'auto';
                } else {
                    const newFontSize = Math.max(8, Math.round(startFontSize * ratio));
                    el.style.fontSize = newFontSize + 'px';
                    if (el.style.width && el.style.width !== 'auto') {
                        el.style.width = Math.max(40, Math.round(startW * ratio)) + 'px';
                        if (el.style.minHeight && el.style.minHeight !== 'auto') {
                            el.style.minHeight = Math.max(20, Math.round(startH * ratio)) + 'px';
                        }
                    }
                }

                if (window.selectedElements && window.selectedElements.length > 1 && window.selectedElements.includes(el)) {
                    window.selectedElements.forEach(sEl => {
                        if (sEl !== el) {
                            if (sEl.id === 'elLogo' || sEl.classList.contains('sh-logo') || sEl.querySelector('img') || sEl.tagName === 'IMG') {
                                const newSW = Math.max(20, Math.round((sEl._handleStartW || sEl.offsetWidth) * ratio));
                                sEl.style.width = newSW + 'px';
                                sEl.style.height = 'auto';
                            } else {
                                const sFs = sEl._handleStartFs || parseFloat(window.getComputedStyle(sEl).fontSize) || 16;
                                const newSFs = Math.max(8, Math.round(sFs * ratio));
                                sEl.style.fontSize = newSFs + 'px';
                            }
                        }
                    });
                }

                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function') {
                    const sel3D = window.ThreeDGrouping.getSelected3DElements();
                    if (sel3D && sel3D.length > 0) {
                        sel3D.forEach(s3 => {
                            const startSx = s3._handleStartScaleX !== undefined ? s3._handleStartScaleX : 1.0;
                            const startSy = s3._handleStartScaleY !== undefined ? s3._handleStartScaleY : 1.0;
                            const startSz = s3._handleStartScaleZ !== undefined ? s3._handleStartScaleZ : 1.0;
                            s3.scaleX = +(startSx * ratio).toFixed(3);
                            s3.scaleY = +(startSy * ratio).toFixed(3);
                            s3.scaleZ = +(startSz * ratio).toFixed(3);
                            if (window.ThreeDEngine && typeof window.ThreeDEngine.updateContentTransform === 'function') {
                                window.ThreeDEngine.updateContentTransform(s3);
                            }
                        });
                        if (window.ThreeDEngine && typeof window.ThreeDEngine.requestRender === 'function') {
                            window.ThreeDEngine.requestRender();
                        }
                        if (typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                            window.ThreeDGrouping.updateSelectionVisuals();
                        }
                    }
                }
                
                // Update font slider if panel is active
                if (typeof selectedEl !== 'undefined' && selectedEl === el) {
                    const fsSlider = document.getElementById('elFontSize') || document.getElementById('fontSize');
                    if (fsSlider && !el.querySelector('img') && el.id !== 'elLogo') {
                        const newFontSize = parseFloat(el.style.fontSize) || 16;
                        fsSlider.value = newFontSize;
                        const fsVal = document.getElementById('elFontSizeVal') || document.getElementById('fontSizeVal');
                        if (fsVal) fsVal.textContent = newFontSize + 'px';
                    }
                }

                // ⚡ SABER NEON ANLIK BOYUTLANDIRMA SENKRONİZASYONU (Sıfır Gecikme)
                if (window.SaberEngine && typeof window.SaberEngine.updateTextSaberPositions === 'function') {
                    window.SaberEngine.updateTextSaberPositions();
                }
            });
        };
        
        const resUp = function() {
            if (resMoveRAF) {
                cancelAnimationFrame(resMoveRAF);
                resMoveRAF = null;
            }
            if(!isResizing) return;
            isResizing = false;
            document.removeEventListener('mousemove', resMove);
            document.removeEventListener('touchmove', resMove);
            document.removeEventListener('mouseup', resUp);
            document.removeEventListener('touchend', resUp);
            document.removeEventListener('touchcancel', resUp);

            // ⚡ Saber Neon son kare güncellemesi
            if (window.SaberEngine && typeof window.SaberEngine.updateTextSaberPositions === 'function') {
                window.SaberEngine.updateTextSaberPositions();
            }
            if(typeof saveState === 'function') saveState();
            if(typeof window.recordHistory === 'function') window.recordHistory('Metin Boyutlandırıldı');
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
            if(!el.dataset.layerUid) {
                el.dataset.layerUid = 'layer_' + Math.random().toString(36).substr(2, 9);
            }
            if (typeof window.layerToggleLock === 'function') {
                window.layerToggleLock(el.dataset.layerUid);
            } else {
                const isCurrentlyLocked = el.dataset.locked === 'true';
                el.dataset.locked = isCurrentlyLocked ? 'false' : 'true';
            }
            const nowLocked = el.dataset.locked === 'true' || el.classList.contains('locked-el');
            lock.innerHTML = nowLocked ? lockSvg : unlockSvg;
            lock.title = nowLocked ? 'Kilidi Aç' : 'Kilitle';
            lock.classList.toggle('is-locked', nowLocked);
            if(typeof saveState === 'function') saveState();
            if (typeof window.syncDockElementLock === 'function') {
                window.syncDockElementLock(el);
            } else if (window.DockContextManager && typeof window.DockContextManager.syncStateValues === 'function') {
                window.DockContextManager.syncStateValues('element', el);
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


