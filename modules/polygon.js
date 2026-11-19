// ==================== POLYGON & MARQUEE ====================
// ========== CONVERT TO POLYGON ==========
function createPolygonFromSelectedLines() {
    if (!window.selectedElements || window.selectedElements.length < 2) return;
    
    const lines = window.selectedElements.filter(el => {
        if (!el || !el.classList || !el.classList.contains('editable-draw')) return false;
        const pObj = (typeof window.findDrawPathForElement === 'function')
            ? window.findDrawPathForElement(el)
            : (typeof drawPaths !== 'undefined' ? drawPaths.find(p => p.el === el || (p.id && el.dataset && p.id === el.dataset.pathId) || (el.dataset && el.dataset.pathIndex !== undefined && drawPaths[parseInt(el.dataset.pathIndex)] === p)) : null);
        return pObj && (pObj.type === 'line' || pObj.x1 !== undefined);
    });
    
    if (lines.length < 2) {
        alert('Çokgene çevirmek için en az 2 düz çizgi seçili olmalıdır.');
        return;
    }
    
    let linesData = [];
    lines.forEach((el) => {
        const pObj = (typeof window.findDrawPathForElement === 'function')
            ? window.findDrawPathForElement(el)
            : (typeof drawPaths !== 'undefined' ? drawPaths.find(p => p.el === el || (p.id && el.dataset && p.id === el.dataset.pathId) || (el.dataset && el.dataset.pathIndex !== undefined && drawPaths[parseInt(el.dataset.pathIndex)] === p)) : null);
        if (pObj) {
            if (pObj.points && pObj.points.length >= 2) {
                linesData.push({ el, p1: {x: pObj.points[0].x, y: pObj.points[0].y}, p2: {x: pObj.points[pObj.points.length-1].x, y: pObj.points[pObj.points.length-1].y} });
            } else if (pObj.x1 !== undefined && pObj.x2 !== undefined) {
                linesData.push({ el, p1: {x: pObj.x1, y: pObj.y1}, p2: {x: pObj.x2, y: pObj.y2} });
            }
        }
    });
    
    if (linesData.length < 2) {
        alert('Çokgene çevirmek için en az 2 düz çizgi seçili olmalıdır.');
        return;
    }
    
    let firstLine = linesData.shift();
    let orderedPoints = [firstLine.p1, firstLine.p2];
    let usedEls = [firstLine.el];
    
    while(linesData.length > 0) {
        let lastPt = orderedPoints[orderedPoints.length - 1];
        let closestIdx = -1;
        let closestDist = Infinity;
        let p1_or_p2 = 0;
        
        for(let i=0; i<linesData.length; i++) {
            let lData = linesData[i];
            let d1 = Math.hypot(lData.p1.x - lastPt.x, lData.p1.y - lastPt.y);
            let d2 = Math.hypot(lData.p2.x - lastPt.x, lData.p2.y - lastPt.y);
            
            if (d1 < closestDist) { closestDist = d1; closestIdx = i; p1_or_p2 = 0; }
            if (d2 < closestDist) { closestDist = d2; closestIdx = i; p1_or_p2 = 1; }
        }
        
        if (closestIdx !== -1 && closestDist <= 30) {
            let closestLine = linesData[closestIdx];
            usedEls.push(closestLine.el);
            if (p1_or_p2 === 0) {
                orderedPoints.push(closestLine.p2);
            } else {
                orderedPoints.push(closestLine.p1);
            }
            linesData.splice(closestIdx, 1);
        } else {
            break; // No connected line found nearby
        }
    }
    
    if (usedEls.length < 2) {
        alert('Bağlanabilecek yeterli çizgi bulunamadı. Çizgilerinizin birbirine (en az 30px) yakın olduğundan emin olun.');
        return;
    }

    const firstLineObj = Object.assign({}, drawPaths.find(p => p.el === usedEls[0]) || { color: '#ef4444', width: 4, opacity: 1 });
    
    usedEls.forEach(el => {
        const idx = drawPaths.findIndex(p => p.el === el);
        if (idx > -1) drawPaths.splice(idx, 1);
        if (el.parentNode) el.parentNode.removeChild(el);
    });
    
    if (orderedPoints.length > 2) {
        let firstPt = orderedPoints[0];
        let lastPt = orderedPoints[orderedPoints.length - 1];
        if (Math.hypot(firstPt.x - lastPt.x, firstPt.y - lastPt.y) <= 30) {
            orderedPoints.pop();
        }
    }
    
    const pObj = {
        type: 'polygon',
        closed: true,
        points: orderedPoints,
        color: firstLineObj.color || '#ef4444',
        width: firstLineObj.width || 4,
        opacity: firstLineObj.opacity || 1,
        dashStyle: firstLineObj.dashStyle || 'solid',
        glow: firstLineObj.glow || 0,
        fillColor: 'transparent',
        fillOpacity: 0,
        hasSaber: !!firstLineObj.hasSaber,
        saberOptions: firstLineObj.hasSaber && firstLineObj.saberOptions ? JSON.parse(JSON.stringify(firstLineObj.saberOptions)) : null
    };
    
    if (typeof getActivePhotoPanel === 'function' && window.getCurrentPhotoState) {
        pObj.photoRef = window.getCurrentPhotoState();
    }
    
    drawPaths.push(pObj);
    if(typeof createSVGFromPath === 'function') {
        const svgEl = createSVGFromPath(pObj);
        if(svgEl) {
            pObj.el = svgEl;
            const container = (typeof getDrawContainer === 'function') ? getDrawContainer() : (document.getElementById('ui-layer') || document.getElementById('canvas-container'));
            if(container) container.appendChild(svgEl);
        }
    }
    
    if(typeof updateDrawHistory === 'function') updateDrawHistory();
    if (pObj.hasSaber && typeof window.applySaberToPath === 'function') {
        window.applySaberToPath(drawPaths.length - 1, pObj.saberOptions || window.saberState);
    }
    if(typeof redrawAll === 'function') redrawAll();
    if(typeof deselectAll === 'function') deselectAll();
    if(pObj.el && typeof selectElement === 'function') selectElement(pObj.el, true);
}
window.createPolygonFromSelectedLines = createPolygonFromSelectedLines;

// ========== MARQUEE CONSTANTS & SCREEN RECT HELPERS ==========
const MARQUEE_SELECTOR = '.cvi-item, .co-neon-block, .draggable, .added-icon, .canvas-el, .editable-draw, .callout-wrap, .callout-wrapper, .svg-callout, .parcel-badge-callout, .sat-measure-callout, .shape-el, .editable-text, .custom-graphic-badge, .brand-element, .tb-image-frame';

function getElementScreenRect(el) {
    if (!el || typeof el.getBoundingClientRect !== 'function') return null;
    let rect = el.getBoundingClientRect();
    
    // SVG ve içerisindeki alt şekillerin (polygon, rect, circle, ellipse, path, line) gerçek ekran sınırlarını da kapsama ekle
    try {
        const svg = el.querySelector('svg');
        if (svg) {
            const sRect = svg.getBoundingClientRect();
            if (sRect && sRect.width > 0 && sRect.height > 0) {
                if (!rect || rect.width === 0 || rect.height === 0) {
                    rect = sRect;
                } else {
                    rect = {
                        left: Math.min(rect.left, sRect.left),
                        right: Math.max(rect.right, sRect.right),
                        top: Math.min(rect.top, sRect.top),
                        bottom: Math.max(rect.bottom, sRect.bottom),
                        width: Math.max(rect.right, sRect.right) - Math.min(rect.left, sRect.left),
                        height: Math.max(rect.bottom, sRect.bottom) - Math.min(rect.top, sRect.top)
                    };
                }
            }
            const shapes = svg.querySelectorAll('polygon, rect, ellipse, circle, path, line');
            shapes.forEach(sh => {
                if (typeof sh.getBoundingClientRect === 'function') {
                    const shRect = sh.getBoundingClientRect();
                    if (shRect && shRect.width > 0 && shRect.height > 0) {
                        rect = {
                            left: Math.min(rect.left, shRect.left),
                            right: Math.max(rect.right, shRect.right),
                            top: Math.min(rect.top, shRect.top),
                            bottom: Math.max(rect.bottom, shRect.bottom),
                            width: Math.max(rect.right, shRect.right) - Math.min(rect.left, shRect.left),
                            height: Math.max(rect.bottom, shRect.bottom) - Math.min(rect.top, shRect.top)
                        };
                    }
                }
            });
        }
    } catch(e) {}
    return rect;
}

// ========== MARQUEE SELECTION ==========
let polyMarqueeBox = null;
let polyMarqueeStartX = 0;
let polyMarqueeStartY = 0;

window.startMobileMarquee = function(x, y) {
    if(typeof drawMode !== 'undefined' && drawMode !== 'off') return;
    // Kaydırma / Pan modunda veya fotoğraf serbest modundayken mavi seçim kutusu kesinlikle açılmasın
    if (window.spaceBarPressed || window._isPhotoDragging || window.isPhotoLocked === false || document.body.classList.contains('photo-unlocked') || document.querySelector('.tb-image-frame.tb-pan-mode')) {
        return;
    }
    
    // Önceki açık kalan veya yetim seçim kutularını kesin olarak temizle
    document.querySelectorAll('.poly-marquee-box').forEach(el => el.remove());
    if (polyMarqueeBox) {
        try { polyMarqueeBox.remove(); } catch(e) {}
        polyMarqueeBox = null;
    }

    polyMarqueeStartX = x;
    polyMarqueeStartY = y;
    
    polyMarqueeBox = document.createElement('div');
    polyMarqueeBox.className = 'poly-marquee-box';
    polyMarqueeBox.style.position = 'fixed';
    polyMarqueeBox.style.border = '1px dashed #3b82f6';
    polyMarqueeBox.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    polyMarqueeBox.style.zIndex = '9999';
    polyMarqueeBox.style.pointerEvents = 'none';
    polyMarqueeBox.style.left = polyMarqueeStartX + 'px';
    polyMarqueeBox.style.top = polyMarqueeStartY + 'px';
    polyMarqueeBox.style.width = '0px';
    polyMarqueeBox.style.height = '0px';
    document.body.appendChild(polyMarqueeBox);
    document.addEventListener('mousemove', handleMarqueeMove);
    document.addEventListener('touchmove', handleMarqueeMove, {passive: true});
    document.addEventListener('mouseup', handleMarqueeEnd);
    document.addEventListener('touchend', handleMarqueeEnd);
};

document.addEventListener('mousedown', e => {
    if (e.button !== 0) return; // Sağ tık seçim kutusu başlatmasın
    if(typeof drawMode !== 'undefined' && drawMode !== 'off') return;
    
    // Kaydırma (Pan), Space-pan, Görsel Sürükleme veya Serbest modda mavi seçim kutusunu engelle
    if (window.spaceBarPressed || window._isPhotoDragging || window._isThreeDDragging || document.querySelector('.dragging') || window.isPhotoLocked === false || document.body.classList.contains('photo-unlocked') || e.altKey || document.querySelector('.tb-image-frame.tb-pan-mode')) {
        return;
    }

    if(!e.target || !e.target.closest) return;
    const cTarget = e.target.closest('.canvas-el, .added-icon, .draggable, .cvi-item, .co-neon-block, .vertex-handle, .text-handle, .callout-controls, .callout-resizer, .callout-rotator, .lp-item, .panel, .lp-header, .editable-draw, .callout-wrap, .callout-item, .svg-callout, .sat-measure-callout, .parcel-badge-callout, .tb-image-frame, .tb-frame-handle, .tb-frame-floating-tools, .tb-floating-btn, .tb-frame-clip, .tb-frame-inner, .tb-frame-img');
    
    if (e.target.closest('.panel, .lp-header, button, input, select, textarea, .modal-overlay, .app-context-menu, #threeDStudioPanel, .three-d-panel, #threeDDockControls, .dock-3d-controls, #dock3DStepperPopover, .three-d-context-menu')) return;
    
    const isBackground = e.target.id === 'photo-layer' || 
                         e.target.id === 'drawCanvas' || 
                         e.target.id === 'canva-render-layer' || 
                         e.target.id === 'canvas-container' || 
                         e.target.id === 'ui-layer' || 
                         e.target.id === 'three-d-layer' ||
                         e.target.classList.contains('three-d-canvas') ||
                         e.target.classList.contains('photo-wrap') || 
                         e.target.classList.contains('workspace') || 
                         e.target.classList.contains('main-preview') || 
                         e.target.closest('#canvas-container, .main-canvas');
    
    const canCheck3DHit = window.ThreeDEngine && typeof window.ThreeDEngine.checkHit === 'function' && (
        (typeof window.ThreeDEngine.hasElements === 'function' && window.ThreeDEngine.hasElements()) ||
        (typeof window.ThreeDEngine.getElements === 'function' && window.ThreeDEngine.getElements().length > 0) ||
        (typeof window.ThreeDEngine.isActive === 'function' && window.ThreeDEngine.isActive())
    );
    const is3DObjectHit = canCheck3DHit ? window.ThreeDEngine.checkHit(e.clientX, e.clientY) : null;

    if(!cTarget && !is3DObjectHit && isBackground) {
        window.startMobileMarquee(e.clientX, e.clientY);
    }
});

const handleMarqueeMove = function(e) {
    if (window.spaceBarPressed || window._isPhotoDragging || window.isPhotoLocked === false || document.body.classList.contains('photo-unlocked')) {
        if (polyMarqueeBox) {
            try { polyMarqueeBox.remove(); } catch(err) {}
            polyMarqueeBox = null;
        }
        document.querySelectorAll('.poly-marquee-box').forEach(el => el.remove());
        document.querySelectorAll('.marquee-candidate').forEach(el => el.classList.remove('marquee-candidate'));
        return;
    }
    if(polyMarqueeBox) {
        let currentX = e.clientX;
        let currentY = e.clientY;
        if(e.touches && e.touches.length > 0) {
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        }
        const left = Math.min(polyMarqueeStartX, currentX);
        const top = Math.min(polyMarqueeStartY, currentY);
        const width = Math.abs(currentX - polyMarqueeStartX);
        const height = Math.abs(currentY - polyMarqueeStartY);
        
        polyMarqueeBox.style.left = left + 'px';
        polyMarqueeBox.style.top = top + 'px';
        polyMarqueeBox.style.width = width + 'px';
        polyMarqueeBox.style.height = height + 'px';

        // 🎯 Sürükleme anında kapsanan ögeleri anlık (real-time) vurgula
        if (width > 6 && height > 6) {
            const mBox = {
                left: left,
                top: top,
                right: left + width,
                bottom: top + height
            };
            const rawElements = Array.from(document.querySelectorAll(MARQUEE_SELECTOR));
            const elements = rawElements.filter(el => {
                return !rawElements.some(parent => parent !== el && parent.contains(el));
            });
            const tol = 12;
            elements.forEach(el => {
                if(el.style.display === 'none' || el.style.visibility === 'hidden' || el.dataset.locked === 'true') return;
                const rect = getElementScreenRect(el);
                if (!rect) return;
                const hit = (
                    rect.left < mBox.right + tol &&
                    rect.right > mBox.left - tol &&
                    rect.top < mBox.bottom + tol &&
                    rect.bottom > mBox.top - tol
                );
                if (hit) {
                    el.classList.add('marquee-candidate');
                } else {
                    el.classList.remove('marquee-candidate');
                }
            });
        } else {
            document.querySelectorAll('.marquee-candidate').forEach(el => el.classList.remove('marquee-candidate'));
        }
    }
};


const handleMarqueeEnd = function(e) {
    document.removeEventListener('mousemove', handleMarqueeMove);
    document.removeEventListener('touchmove', handleMarqueeMove);
    document.removeEventListener('mouseup', handleMarqueeEnd);
    document.removeEventListener('touchend', handleMarqueeEnd);
    
    let mRect = null;
    if(polyMarqueeBox) {
        mRect = polyMarqueeBox.getBoundingClientRect();
        try { polyMarqueeBox.remove(); } catch(err) {}
        polyMarqueeBox = null;
    }
    document.querySelectorAll('.poly-marquee-box').forEach(el => el.remove());
    
    if (mRect && mRect.width > 5 && mRect.height > 5) {
            const multiSelectKey = e.ctrlKey || e.shiftKey;
            if (!multiSelectKey && typeof deselectAll === 'function') {
                deselectAll();
            }
            const rawElements = Array.from(document.querySelectorAll(MARQUEE_SELECTOR));
            // Sadece en üst seviye elemanları seç (iç içe seçimi ve çift sayımı önle)
            const elements = rawElements.filter(el => {
                return !rawElements.some(parent => parent !== el && parent.contains(el));
            });
            
            const matchedElements = [];
            const tol = 12;
            elements.forEach(el => {
                if(el.style.display === 'none' || el.style.visibility === 'hidden' || el.dataset.locked === 'true') return;
                const rect = getElementScreenRect(el);
                if (!rect) return;
                
                if (rect.left < mRect.right + tol &&
                    rect.right > mRect.left - tol &&
                    rect.top < mRect.bottom + tol &&
                    rect.bottom > mRect.top - tol) {
                    matchedElements.push(el);
                }
            });
            
            let selectedAny = false;
            let lastEl = null;

            if (matchedElements.length > 0) {
                selectedAny = true;
                lastEl = matchedElements[matchedElements.length - 1];
                if (matchedElements.length === 1 && !multiSelectKey && (!window.selectedElements || window.selectedElements.length <= 1)) {
                    if (typeof selectElement === 'function') {
                        try { selectElement(matchedElements[0], false, true); } catch(e) {}
                    }
                } else {
                    if (!window.selectedElements) window.selectedElements = [];
                    matchedElements.forEach(el => {
                        try {
                            if (!window.selectedElements.includes(el)) {
                                window.selectedElements.push(el);
                                el.classList.add('el-selected');
                            }
                            if (el.classList.contains('editable-draw')) {
                                const isNeon = el.classList.contains('neon-active') || el.dataset.saberActive === 'true';
                                el.style.outline = isNeon ? '2px dashed #38bdf8' : '2px dashed #0284c7';
                                el.style.outlineOffset = isNeon ? '6px' : '4px';
                                el.style.borderRadius = '4px';
                            }
                        } catch(e) {}
                    });
                }
            }
            
            if(selectedAny && lastEl) {
                if(typeof window.selectedEl !== 'undefined') window.selectedEl = lastEl;
                if (window.TemplateBuilder && Array.isArray(window.selectedElements)) {
                    const selectedFrames = window.selectedElements.filter(f => f && f.classList && f.classList.contains('tb-image-frame'));
                    const primaryFrame = selectedFrames.length > 0 ? selectedFrames[selectedFrames.length - 1] : null;
                    window.TemplateBuilder.selectedFrame = primaryFrame;
                    if (primaryFrame && typeof window.TemplateBuilder.syncSettingsPanelWithFrame === 'function') {
                        window.TemplateBuilder.syncSettingsPanelWithFrame(primaryFrame);
                    }
                }
                if (typeof window.saveDrawEdit === 'function' && typeof editingDrawIndex !== 'undefined' && editingDrawIndex >= 0) {
                    try { window.saveDrawEdit(); } catch(e) {}
                }
                if(typeof updateGroupUI === 'function') updateGroupUI();
                if(typeof window.updateMultiSelectUI === 'function') window.updateMultiSelectUI();
                if(typeof window.updateDockContextUI === 'function') window.updateDockContextUI(lastEl);
                if(typeof updateDrawHistory === 'function') updateDrawHistory();
                if(typeof renderLayers === 'function') renderLayers();
                
                if(window.LayerPanelV2 && window.LayerPanelV2.highlightActiveLayer) {
                    setTimeout(() => window.LayerPanelV2.highlightActiveLayer(), 80);
                }
            }

            // 🌟 3D Ögeleri Seçim Kutusuyla Tespit Et
            const hit3DElements = [];
            const canScan3D = window.ThreeDEngine && (
                (typeof window.ThreeDEngine.hasElements === 'function' && window.ThreeDEngine.hasElements()) ||
                (typeof window.ThreeDEngine.getElements === 'function' && window.ThreeDEngine.getElements().length > 0) ||
                (typeof window.ThreeDEngine.isActive === 'function' && window.ThreeDEngine.isActive())
            );

            if (canScan3D) {
                const boundsList = (typeof window.ThreeDEngine.getElementsScreenBounds === 'function')
                    ? window.ThreeDEngine.getElementsScreenBounds()
                    : [];

                boundsList.forEach(item => {
                    if (!item.el || item.el.visible === false || item.el.locked) return;
                    const r = item.rect;
                    if (r && r.left < mRect.right && r.right > mRect.left &&
                        r.top < mRect.bottom && r.bottom > mRect.top) {
                        hit3DElements.push(item.el);
                    }
                });
            }

            if (hit3DElements.length > 0) {
                const keep2D = selectedAny || (Array.isArray(window.selectedElements) && window.selectedElements.length > 0);
                if (!multiSelectKey && !keep2D && typeof deselectAll === 'function') {
                    deselectAll();
                }

                // Çoklu veya tekli 3D seçim çerçevelerini ThreeDGrouping ile çiz
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.setSelected3DElements === 'function') {
                    window.ThreeDGrouping.setSelected3DElements(hit3DElements, { keep2DSelection: keep2D });
                }

                // İlk 3D ögeyi ThreeDEngine tarafında aktif yap ve seçildi durumunu tetikle
                const primary = hit3DElements[0];
                if (window.ThreeDEngine) {
                    if (typeof window.ThreeDEngine.setActiveElement === 'function') {
                        window.ThreeDEngine.setActiveElement(primary, { select: true });
                    }
                    if (typeof window.ThreeDEngine.setSelected === 'function') {
                        window.ThreeDEngine.setSelected(true, { silent: true, keep2DSelection: keep2D });
                    }
                }

                if (hit3DElements.length > 1 || keep2D) {
                    if (typeof window.updateMultiSelectUI === 'function') {
                        window.updateMultiSelectUI();
                    }
                    if (typeof window.updateGroupUI === 'function') {
                        window.updateGroupUI();
                    }
                }
                if (window.ThreeDEngine && typeof window.ThreeDEngine.updateDockControls === 'function') {
                    window.ThreeDEngine.updateDockControls();
                }
            } else if (!selectedAny) {
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.clearSelection === 'function') {
                    window.ThreeDGrouping.clearSelection();
                }
            } else {
                if (!multiSelectKey) {
                    if (window.ThreeDGrouping && typeof window.ThreeDGrouping.clearSelection === 'function') {
                        window.ThreeDGrouping.clearSelection();
                    }
                    if (window.ThreeDEngine && typeof window.ThreeDEngine.setSelected === 'function') {
                        window.ThreeDEngine.setSelected(false, { silent: true });
                    }
                }
            }
        } else {
            // 🛡️ Tıklama 3D Studio Paneli, 3D Kontrolleri veya Popover içine yapıldıysa asla boş alana tıklandı sayma
            if (e.target && e.target.closest && e.target.closest(
                '#threeDStudioPanel, .three-d-panel, #threeDDockControls, .dock-3d-controls, ' +
                '#threeDGizmoOverlay, #threeDCornerPinOverlay, #threeDCanvasBadge, #dock3DStepperPopover, ' +
                '.three-d-context-menu, #threeDTextureSectionHost, .three-d-section, #threeDTextureSection'
            )) {
                return;
            }

            // 🛡️ Sürükleme aktifken veya az önce bittiyse window capture mouseup seçimi düşürmesin
            if (window._isThreeDDragging || (window._justFinishedThreeDDragUntil && Date.now() < window._justFinishedThreeDDragUntil) || document.querySelector('.dragging')) {
                return;
            }

            // Tıklama boş alana yapıldıysa (çerçeve açmadan tek tık):
            const isClickOnObject = (e.target && e.target.closest && e.target.closest(
                '.canvas-el, .added-icon, .draggable, .cvi-item, .co-neon-block, .vertex-handle, .text-handle, ' +
                '.callout-controls, .callout-resizer, .callout-rotator, .lp-item, .panel, .lp-header, .editable-draw, ' +
                '.callout-wrap, .callout-item, .svg-callout, .sat-measure-callout, .parcel-badge-callout, ' +
                '.tb-image-frame, .tb-frame-handle, .tb-frame-floating-tools, .tb-floating-btn, .tb-frame-clip, .tb-frame-inner, .tb-frame-img, ' +
                '.three-d-gizmo-tip, .three-d-gizmo-dot, .three-d-gizmo-sun, button, input, select, textarea, .modal, .context-menu, .app-context-menu, ' +
                '#threeDStudioPanel, .three-d-panel, #threeDDockControls, .dock-3d-controls, #threeDGizmoOverlay, #threeDCornerPinOverlay, #threeDCanvasBadge, #dock3DStepperPopover, .three-d-context-menu, ' +
                '.tb-3d-gizmo, .three-d-gizmo-overlay, .three-d-gizmo-svg, .three-d-gizmo-arc, .three-d-gizmo-hit-line, .three-d-gizmo-axis-x, .three-d-gizmo-axis-y, .three-d-gizmo-axis-z, .three-d-gizmo-origin-dot, .three-d-gizmo-hud, .three-d-gizmo-close-btn, #tbFrameSettingsSection'
            )) || (window.Template3DFrame && window.Template3DFrame.isInteracting);
            const is3DObjectHit = (window.ThreeDEngine && typeof window.ThreeDEngine.isActive === 'function' && window.ThreeDEngine.isActive() && typeof window.ThreeDEngine.checkHit === 'function')
                ? window.ThreeDEngine.checkHit(e.clientX, e.clientY)
                : null;

            if (!isClickOnObject && !is3DObjectHit && !e.ctrlKey && !e.shiftKey) {
                if (typeof deselectAll === 'function') deselectAll();
                if (window.ThreeDGrouping && typeof window.ThreeDGrouping.clearSelection === 'function') {
                    window.ThreeDGrouping.clearSelection();
                }
                if (window.ThreeDEngine && typeof window.ThreeDEngine.setSelected === 'function') {
                    window.ThreeDEngine.setSelected(false, { silent: true, autoUnlockPhoto: false });
                }
            }
        }
};

window.addEventListener('mouseup', handleMarqueeEnd, true);
window.addEventListener('touchend', handleMarqueeEnd, true);
window.addEventListener('touchcancel', handleMarqueeEnd, true);
window.addEventListener('blur', () => {
    document.querySelectorAll('.poly-marquee-box').forEach(el => el.remove());
    if (polyMarqueeBox) { try { polyMarqueeBox.remove(); } catch(e) {} polyMarqueeBox = null; }
}, true);
window.selectAllCanvasElements = function() {
    if (typeof deselectAll === 'function') deselectAll();
    
    const rawElements = Array.from(document.querySelectorAll(MARQUEE_SELECTOR));
    const elements = rawElements.filter(el => {
        if (el.style.display === 'none' || el.style.visibility === 'hidden' || el.dataset.locked === 'true') return false;
        return !rawElements.some(parent => parent !== el && parent.contains(el));
    });

    if (elements.length > 0) {
        if (!window.selectedElements) window.selectedElements = [];
        elements.forEach(el => {
            try {
                if (!window.selectedElements.includes(el)) {
                    window.selectedElements.push(el);
                    el.classList.add('el-selected');
                }
                if (el.classList.contains('editable-draw')) {
                    const isNeon = el.classList.contains('neon-active') || el.dataset.saberActive === 'true';
                    el.style.outline = isNeon ? '2px dashed #38bdf8' : '2px dashed #0284c7';
                    el.style.outlineOffset = isNeon ? '6px' : '4px';
                    el.style.borderRadius = '4px';
                }
            } catch(e) {}
        });
        window.selectedEl = elements[elements.length - 1];
        if (typeof updateGroupUI === 'function') updateGroupUI();
        if (typeof window.updateMultiSelectUI === 'function') window.updateMultiSelectUI();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof renderLayers === 'function') renderLayers();
    }

    // 🌟 3D Ögeleri de seç (eğer sahnede varsa)
    if (window.ThreeDEngine && (
        (typeof window.ThreeDEngine.hasElements === 'function' && window.ThreeDEngine.hasElements()) ||
        (typeof window.ThreeDEngine.getElements === 'function' && window.ThreeDEngine.getElements().length > 0) ||
        (typeof window.ThreeDEngine.isActive === 'function' && window.ThreeDEngine.isActive())
    )) {
        const all3D = (typeof window.ThreeDEngine.getElements === 'function') ? window.ThreeDEngine.getElements() : [];
        const visible3D = all3D.filter(it => it && it.visible !== false && !it.locked);
        if (visible3D.length > 0 && window.ThreeDGrouping) {
            if (typeof window.ThreeDGrouping.selectMultiple3D === 'function') {
                window.ThreeDGrouping.selectMultiple3D(visible3D, true);
            } else if (typeof window.ThreeDGrouping.setSelected3DElements === 'function') {
                window.ThreeDGrouping.setSelected3DElements(visible3D, { keep2DSelection: true });
            }
        }
    }
};

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.poly-marquee-box').forEach(el => el.remove());
        document.querySelectorAll('.marquee-candidate').forEach(el => el.classList.remove('marquee-candidate'));
        if (polyMarqueeBox) { try { polyMarqueeBox.remove(); } catch(e) {} polyMarqueeBox = null; }
        if (typeof deselectAll === 'function') deselectAll();
        if (window.ThreeDGrouping && typeof window.ThreeDGrouping.clearSelection === 'function') {
            window.ThreeDGrouping.clearSelection();
        }
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
        const isInput = e.target.closest('input, textarea, select, [contenteditable="true"]');
        if (!isInput) {
            e.preventDefault();
            e.stopPropagation();
            if (typeof window.selectAllCanvasElements === 'function') {
                window.selectAllCanvasElements();
            }
        }
    }
}, true);
