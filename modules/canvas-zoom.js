// ========== CANVAS VIEWPORT ZOOM & PAN (Sadece Görsel Yokken Aktif) ==========
window.pinchScale = 1;
window.pinchPanX = 0;
window.pinchPanY = 0;

(function() {
    function hasUploadedPhoto() {
        if (typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl) return true;
        const pl = document.getElementById('photo-layer');
        if (pl && pl.style.backgroundImage && pl.style.backgroundImage !== 'none' && pl.style.backgroundImage !== '') return true;
        const panel = document.querySelector('.photo-panel');
        if (panel && ((panel.style.backgroundImage && panel.style.backgroundImage !== 'none') || panel.querySelector('img'))) return true;
        return false;
    }

    function isInteractiveTarget(target) {
        if (!target || typeof target.closest !== 'function') return false;
        return !!target.closest(
            '.draggable, .canvas-el, .is-svg-icon, .editable-draw, .callout-wrap, .callout-item, .co-neon-block, ' +
            '.cvi-item, .polygon-vertex, .text-handle, .text-resize-handle, .text-rotate-handle, .text-delete-handle, ' +
            '.text-lock-handle, .callout-controls, .callout-resizer, .callout-rotator, .callout-lock-btn, .callout-select-border, ' +
            '.draw-handle, .vertex-handle, .cbtn-del, input, button, select, textarea, .panel, .mobile-panel, .tab-content, .preset-picker, .swal2-container'
        );
    }

    function applyTransform() {
        const wrap = document.querySelector('.canvas-wrapper');
        if (wrap) {
            if (window.pinchScale === 1 && window.pinchPanX === 0 && window.pinchPanY === 0) {
                wrap.style.transform = '';
            } else {
                wrap.style.transform = `translate(${window.pinchPanX}px, ${window.pinchPanY}px) scale(${window.pinchScale})`;
                wrap.style.transformOrigin = 'center center';
            }
            wrap.style.transition = 'none';
        }
    }
    
    window.resetCanvasZoom = function() {
        window.pinchScale = 1;
        window.pinchPanX = 0;
        window.pinchPanY = 0;
        applyTransform();
    };

    function setupZoom() {
        const previewArea = document.querySelector('.preview-area');
        if (!previewArea) return;
        if (previewArea.dataset.zoomReady === '1') return;
        previewArea.dataset.zoomReady = '1';

        // Sayfa açıldığında transform'u sıfırla
        window.resetCanvasZoom();

        // --- MASAÜSTÜ FARE TEKERLEĞİ ZOOM (Ctrl tuşuyla veya pinch ile çalışır) ---
        previewArea.addEventListener('wheel', function(e) {
            if (hasUploadedPhoto()) {
                if (window.pinchScale !== 1 || window.pinchPanX !== 0 || window.pinchPanY !== 0) {
                    window.resetCanvasZoom();
                }
                return;
            }

            // Normal tekerlek kaydırmasında sayfayı kaydırmaya izin ver (tuvali bozma)
            if (!e.ctrlKey) return;

            if (e.target.closest && e.target.closest('input, select, textarea, .panel, .mobile-panel, .tab-content, .preset-picker, .font-list, .swal2-container')) return;
            
            e.preventDefault();
            e.stopPropagation();

            const oldScale = window.pinchScale || 1;
            const delta = e.deltaY < 0 ? 1.12 : 0.89;
            let newScale = oldScale * delta;
            if (newScale < 0.3) newScale = 0.3;
            if (newScale > 6) newScale = 6;

            const rect = previewArea.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - rect.width / 2;
            const mouseY = e.clientY - rect.top - rect.height / 2;

            window.pinchPanX -= (mouseX - window.pinchPanX) * (newScale / oldScale - 1);
            window.pinchPanY -= (mouseY - window.pinchPanY) * (newScale / oldScale - 1);
            window.pinchScale = newScale;

            applyTransform();
        }, { passive: false });

        // --- MASAÜSTÜ PAN (Sadece görsel yokken) ---
        let isPanningDesktop = false;
        let pStartX = 0, pStartY = 0;
        let pInitialPanX = 0, pInitialPanY = 0;

        previewArea.addEventListener('mousedown', function(e) {
            if (hasUploadedPhoto()) return;

            const isMiddle = e.button === 1;
            const isSpacePan = e.button === 0 && window.spaceBarPressed;
            const isCanvasEmpty = e.button === 0 && !isInteractiveTarget(e.target) && (typeof drawMode === 'undefined' || drawMode === 'off' || drawMode === null);

            if (isMiddle || isSpacePan || (window.pinchScale > 1.05 && isCanvasEmpty)) {
                isPanningDesktop = true;
                pStartX = e.clientX;
                pStartY = e.clientY;
                pInitialPanX = window.pinchPanX;
                pInitialPanY = window.pinchPanY;
                previewArea.style.cursor = 'grabbing';
                e.preventDefault();
                e.stopPropagation();
            }
        });

        window.addEventListener('mousemove', function(e) {
            if (!isPanningDesktop) return;
            if (hasUploadedPhoto()) {
                isPanningDesktop = false;
                previewArea.style.cursor = '';
                return;
            }
            e.preventDefault();
            const dx = e.clientX - pStartX;
            const dy = e.clientY - pStartY;
            window.pinchPanX = pInitialPanX + dx;
            window.pinchPanY = pInitialPanY + dy;
            applyTransform();
        });

        window.addEventListener('mouseup', function(e) {
            if (isPanningDesktop) {
                isPanningDesktop = false;
                previewArea.style.cursor = '';
            }
        });

        // Çift tık ile tuvali sıfırla (görsel yokken)
        previewArea.addEventListener('dblclick', function(e) {
            if (hasUploadedPhoto()) return;
            if (isInteractiveTarget(e.target)) return;
            if (typeof drawMode !== 'undefined' && drawMode !== 'off') return;
            window.resetCanvasZoom();
        });

        // --- MOBİL DOKUNMATİK PINCH ZOOM & PAN (Sadece görsel yokken) ---
        let initialDist = 0;
        let initialScale = 1;
        let isPinching = false;
        let isPanningMobile = false;
        let initialMidX = 0, initialMidY = 0;
        let initialTouchX = 0, initialTouchY = 0;
        let tInitialPanX = 0, tInitialPanY = 0;
        let lastTapTime = 0;

        function getDistance(t) {
            return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
        }
        function getMidpoint(t) {
            return { x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 };
        }

        previewArea.addEventListener('touchstart', function(e) {
            if (hasUploadedPhoto()) return;

            if (e.touches.length === 2) {
                isPinching = true;
                isPanningMobile = false;
                initialDist = getDistance(e.touches);
                if (initialDist < 15) initialDist = 15;
                initialScale = window.pinchScale || 1;
                const mid = getMidpoint(e.touches);
                initialMidX = mid.x;
                initialMidY = mid.y;
                tInitialPanX = window.pinchPanX;
                tInitialPanY = window.pinchPanY;
                e.preventDefault();
            } else if (e.touches.length === 1) {
                const currentTime = Date.now();
                const tapLength = currentTime - lastTapTime;
                lastTapTime = currentTime;

                // Çift dokunma -> Sıfırla
                if (tapLength < 350 && tapLength > 0) {
                    window.resetCanvasZoom();
                    if (e.cancelable) e.preventDefault();
                    return;
                }

                // Yakınlaşılmışsa ve boş alana dokunulduysa 1 parmak pan
                if (window.pinchScale > 1.05 && !isInteractiveTarget(e.target) && (typeof drawMode === 'undefined' || drawMode === 'off' || drawMode === null)) {
                    isPanningMobile = true;
                    initialTouchX = e.touches[0].clientX;
                    initialTouchY = e.touches[0].clientY;
                    tInitialPanX = window.pinchPanX;
                    tInitialPanY = window.pinchPanY;
                }
            }
        }, { passive: false });

        previewArea.addEventListener('touchmove', function(e) {
            if (hasUploadedPhoto()) return;

            if (isPinching && e.touches.length === 2) {
                if (e.cancelable) e.preventDefault();
                const curDist = getDistance(e.touches);
                const scaleFactorChange = curDist / initialDist;
                let newScale = initialScale * scaleFactorChange;
                if (newScale < 0.5) newScale = 0.5;
                if (newScale > 6) newScale = 6;

                window.pinchScale = newScale;

                const curMid = getMidpoint(e.touches);
                const dx = curMid.x - initialMidX;
                const dy = curMid.y - initialMidY;
                window.pinchPanX = tInitialPanX + dx;
                window.pinchPanY = tInitialPanY + dy;

                applyTransform();
            } else if (isPanningMobile && e.touches.length === 1) {
                if (e.cancelable) e.preventDefault();
                const dx = e.touches[0].clientX - initialTouchX;
                const dy = e.touches[0].clientY - initialTouchY;
                window.pinchPanX = tInitialPanX + dx;
                window.pinchPanY = tInitialPanY + dy;
                applyTransform();
            }
        }, { passive: false });

        previewArea.addEventListener('touchend', function(e) {
            if (e.touches.length < 2) isPinching = false;
            if (e.touches.length === 0) isPanningMobile = false;
        });

        previewArea.addEventListener('touchcancel', function() {
            isPinching = false;
            isPanningMobile = false;
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupZoom);
    } else {
        setupZoom();
    }
    setTimeout(setupZoom, 500);
})();
