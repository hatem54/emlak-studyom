// Katmanlar (Layers) Modulu

window.layerToggleVisibility = function(uid, isDrawPath = false, pathIndex = 0) {
    if (isDrawPath) {
        if (typeof drawPaths !== 'undefined') {
            let paths = drawPaths;
            if (paths[pathIndex]) {
                const p = paths[pathIndex];
                p.hidden = !p.hidden;
                if (p.el) {
                    p.el.style.display = p.hidden ? 'none' : '';
                }
                if (p.saberRef) {
                    if (window.SaberEngine && typeof window.SaberEngine.setSaberVisibility === 'function') {
                        window.SaberEngine.setSaberVisibility(p.saberRef, !p.hidden);
                    } else {
                        if (p.saberRef.graphics) p.saberRef.graphics.visible = !p.hidden;
                        if (p.saberRef.particleContainer) p.saberRef.particleContainer.visible = !p.hidden;
                        if (p.saberRef.branchContainer) p.saberRef.branchContainer.visible = !p.hidden;
                    }
                }
                if (p.hidden) {
                    if (typeof editingDrawIndex !== 'undefined' && editingDrawIndex === pathIndex) {
                        if (typeof deselectAll === 'function') deselectAll();
                    }
                    if (p.el && p.el.classList.contains('el-selected')) {
                        p.el.classList.remove('el-selected');
                    }
                }
                if (typeof redrawAll === 'function') redrawAll();
                window.renderLayers();
            }
        }
        return;
    }
    
    if (uid === 'canva-render-layer') {
        const el = document.getElementById(uid);
        if (!el) return;
        const isHidden = el.dataset.hiddenLayer === 'true';
        el.dataset.hiddenLayer = isHidden ? 'false' : 'true';
        
        const cvrBases = el.querySelectorAll('.cvr-base, .cvr-main');
        cvrBases.forEach(base => {
            if (base.dataset.originalBg === undefined) {
                base.dataset.originalBg = base.style.background || '';
            }
            if (base.dataset.originalBgColor === undefined) {
                base.dataset.originalBgColor = base.style.backgroundColor || '';
            }
            base.style.background = isHidden ? base.dataset.originalBg : 'transparent';
            base.style.backgroundColor = isHidden ? base.dataset.originalBgColor : 'transparent';
        });

        const templateElements = el.querySelectorAll('*');
        templateElements.forEach(child => {
            if (child.classList.contains('photo-panel') || child.classList.contains('kolaj-foto') || child.classList.contains('cvr-base') || child.classList.contains('cvr-main') || child.closest('.photo-panel') || child.closest('.kolaj-foto')) {
                return;
            }
            if (child.dataset.originalPointerEvents === undefined) {
                child.dataset.originalPointerEvents = child.style.pointerEvents || '';
            }
            child.style.visibility = isHidden ? '' : 'hidden';
            if (isHidden) {
                if (child.dataset.originalPointerEvents === 'none') {
                    child.style.setProperty('pointer-events', 'none', 'important');
                } else {
                    child.style.pointerEvents = child.dataset.originalPointerEvents;
                }
            } else {
                child.style.setProperty('pointer-events', 'none', 'important');
            }
        });
        window.renderLayers();
        return;
    }

    if (uid === 'photo-layer') {
        const el = document.getElementById(uid);
        if (!el) return;
        const isHidden = el.dataset.hiddenLayer === 'true';
        
        if (!isHidden) {
            el.dataset.oldDisplay = (el.style.display && el.style.display !== 'none') ? el.style.display : 'block';
            el.dataset.hiddenLayer = 'true';
            el.style.display = 'none';
            document.querySelectorAll('.photo-panel, .kolaj-foto, #photo-layer, .photo-inner-zoom, .photo-render-canvas').forEach(p => {
                p.style.visibility = 'hidden';
                p.style.pointerEvents = 'none';
            });
        } else {
            el.dataset.hiddenLayer = 'false';
            el.style.display = (el.dataset.oldDisplay && el.dataset.oldDisplay !== 'none') ? el.dataset.oldDisplay : 'block';
            document.querySelectorAll('.photo-panel, .kolaj-foto, #photo-layer, .photo-inner-zoom, .photo-render-canvas').forEach(p => {
                p.style.visibility = '';
                p.style.pointerEvents = '';
            });
            if (typeof _applyPhotoTransform === 'function') {
                document.querySelectorAll('.photo-panel, #photo-layer').forEach(p => _applyPhotoTransform(p));
            }
            if (typeof redrawAll === 'function') redrawAll();
        }
        window.renderLayers();
        return;
    }

    const el = document.querySelector('[data-layer-uid="' + uid + '"]');
    if (!el) return;
    if (el.dataset.hiddenLayer === 'true') {
        el.dataset.hiddenLayer = 'false';
        el.style.display = el.dataset.oldDisplay || '';
        if (el.style.display === 'none') el.style.display = 'block'; 
        const saberId = el.id || (el.dataset && el.dataset.saberElId);
        if (window.SaberEngine && typeof window.SaberEngine.setTextSaberVisibility === 'function') {
            window.SaberEngine.setTextSaberVisibility(el, true);
            if (saberId) window.SaberEngine.setTextSaberVisibility(saberId, true);
        }
    } else {
        el.dataset.hiddenLayer = 'true';
        el.dataset.oldDisplay = el.style.display;
        el.style.display = 'none';
        el.classList.remove('el-selected');
        el.querySelectorAll('.callout-controls, .callout-resizer, .callout-rotator, .callout-select-border, .text-resize-handle, .text-delete-handle, .text-rotate-handle, .vertex-handle').forEach(c => c.style.display = 'none');
        if (window.selectedEl === el) window.selectedEl = null;
        if (window.selectedElements) window.selectedElements = window.selectedElements.filter(x => x !== el);
        if (el.classList.contains('tb-image-frame') && window.TemplateBuilder && window.TemplateBuilder.selectedFrame === el) {
            window.TemplateBuilder.deselectFrame();
        }
        if (typeof deselectAll === 'function') deselectAll();
        if (typeof window.deselectAll === 'function') window.deselectAll();
        const saberId = el.id || (el.dataset && el.dataset.saberElId);
        if (window.SaberEngine && typeof window.SaberEngine.setTextSaberVisibility === 'function') {
            window.SaberEngine.setTextSaberVisibility(el, false);
            if (saberId) window.SaberEngine.setTextSaberVisibility(saberId, false);
        }
    }
    if (window.SaberEngine && typeof window.SaberEngine.updateTextSaberPositions === 'function') {
        window.SaberEngine.updateTextSaberPositions();
    }
    window.renderLayers();
};

window.layerToggleLock = function(uid, isDrawPath = false, pathIndex = 0) {
    if (isDrawPath) {
        if (typeof drawPaths !== 'undefined') {
            let paths = drawPaths;
            if (paths[pathIndex]) {
                const p = paths[pathIndex];
                p.locked = !p.locked;
                if (p.el) {
                    p.el.dataset.locked = p.locked ? 'true' : 'false';
                    if (p.locked) {
                        p.el.classList.add('locked-el');
                    } else {
                        p.el.classList.remove('locked-el');
                        if (p.el.style.pointerEvents === 'none') p.el.style.pointerEvents = 'auto'; // Unlock fallback
                    }
                }
                if (typeof redrawAll === 'function') redrawAll();
                window.renderLayers();
            }
        }
        return;
    }

    if (uid === 'photo-layer') {
        const photoToggle = document.getElementById('photoLockToggle');
        const isLocked = photoToggle ? photoToggle.checked : (window.isPhotoLocked === true);
        const newState = !isLocked;
        if (typeof window.updatePhotoLockState === 'function') {
            window.updatePhotoLockState(newState);
        } else {
            window.isPhotoLocked = newState;
            if (photoToggle) photoToggle.checked = newState;
        }
        const pl = document.getElementById('photo-layer');
        if (pl) pl.dataset.locked = newState ? 'true' : 'false';
        window.renderLayers();
        return;
    }

    const el = document.querySelector('[data-layer-uid="' + uid + '"]');
    if (!el) return;
    
    if (el.dataset.locked === 'true') {
        el.dataset.locked = 'false';
        el.classList.remove('locked-el');
        el.style.pointerEvents = 'auto';
        const inner = el.querySelector('.callout-item, .callout-svg-container, .co-neon-block');
        if (inner) {
            inner.dataset.locked = 'false';
            inner.style.pointerEvents = 'auto';
        }
        const lockBtn = el.querySelector('.callout-lock-btn');
        if (lockBtn) {
            lockBtn.style.background = '#1e2238';
            lockBtn.title = 'Kilitle';
            lockBtn.classList.remove('is-locked');
            lockBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:block; pointer-events:none;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>';
        }
        const textLock = el.querySelector('.text-lock-handle');
        if (textLock) {
            textLock.title = 'Kilitle';
            textLock.classList.remove('is-locked');
            textLock.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:block; pointer-events:none;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>';
        }

    } else {
        el.dataset.locked = 'true';
        el.classList.add('locked-el');
        el.style.pointerEvents = 'none';
        const inner = el.querySelector('.callout-item, .callout-svg-container, .co-neon-block');
        if (inner) {
            inner.dataset.locked = 'true';
            inner.style.pointerEvents = 'none';
        }
        
        // Hide other handles immediately
        el.querySelectorAll('.callout-controls, .callout-resizer, .callout-rotator, .callout-select-border, .text-resize-handle, .text-delete-handle, .text-rotate-handle, .vertex-handle').forEach(c => c.style.display = 'none');
        
        const lockBtn = el.querySelector('.callout-lock-btn');
        if (lockBtn) {
            lockBtn.style.background = '#1e2238';
            lockBtn.title = 'Kilidi Aç';
            lockBtn.classList.add('is-locked');
            lockBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:block; pointer-events:none;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
            lockBtn.style.display = 'flex';
            lockBtn.style.pointerEvents = 'auto';
        }
        const textLock = el.querySelector('.text-lock-handle');
        if (textLock) {
            textLock.title = 'Kilidi Aç';
            textLock.classList.add('is-locked');
            textLock.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:block; pointer-events:none;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
        }
        
        // Deselect if locked
        if (typeof window.deselectAll === 'function') window.deselectAll();
        if (typeof closeCalloutPanel === 'function') closeCalloutPanel();
        if (el.classList.contains('tb-image-frame') && window.TemplateBuilder && typeof window.TemplateBuilder.deselectFrame === 'function') {
            window.TemplateBuilder.deselectFrame();
        }
    }
    if (typeof window.syncDockElementLock === 'function') {
        window.syncDockElementLock(el);
    } else if (window.DockContextManager && typeof window.DockContextManager.syncStateValues === 'function') {
        window.DockContextManager.syncStateValues('element', el);
    }
    window.renderLayers();
};

window.layerSelect = function(uid, event, isDoubleClick = false) {
    // If it's a fixed layer like photo or canva, skip
    if (uid === 'photo-layer' || uid === 'canva-render-layer') return;
    
    if (uid.startsWith('draw_')) {
        let drawIndex = parseInt(uid.split('_')[1]);
        if (typeof drawPaths !== 'undefined' && drawPaths[drawIndex]) {
            if (drawPaths[drawIndex].hidden) return; // Gizliyse seçme
            if (drawPaths[drawIndex].locked) return; // Kilitliyse seçme
        }
        if (typeof editingDrawIndex !== 'undefined') editingDrawIndex = drawIndex;
        if (typeof drawPaths !== 'undefined' && drawPaths[drawIndex] && drawPaths[drawIndex].el) {
            if (typeof window.selectElement === 'function') window.selectElement(drawPaths[drawIndex].el, false, true);
        }
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        window.renderLayers();
        return;
    }

    const el = document.querySelector('[data-layer-uid="' + uid + '"]');
    if (!el) return;
    
    if (el.dataset.locked === 'true') return; // Do not select if locked
    if (el.dataset.hiddenLayer === 'true') return; // Do not select if hidden

    if (el.classList.contains('tb-image-frame')) {
        if (window.TemplateBuilder && typeof window.TemplateBuilder.selectFrame === 'function') {
            window.TemplateBuilder.selectFrame(el);
        }
        window.renderLayers();
        return;
    }
    
    if (typeof window.selectElement === 'function') {
        const noTabSwitch = !Boolean(isDoubleClick);
        window.selectElement(el, (event && event.shiftKey) ? true : false, noTabSwitch);
    }
    window.renderLayers();
};


window.renderLayers = function() {
    const container = document.getElementById('layersListContainer');
    if (!container) return;

    let isTemplateDetailsOpen = false;
    const existingDetails = document.getElementById('template-layers-details');
    if (existingDetails) {
        isTemplateDetailsOpen = existingDetails.open;
    }

    let isDrawDetailsOpen = true;
    const existingDrawDetails = document.getElementById('draw-layers-details');
    if (existingDrawDetails) {
        isDrawDetailsOpen = existingDrawDetails.open;
    }

    let html = '';

    // Gorunmez olan standart UI elemanlarini filtrele
    let allRawEls = Array.from(document.querySelectorAll('#canvas-container .canvas-el, #canvas-container .draggable, #canvas-container .callout-wrap, #canvas-container .svg-callout'));
    allRawEls = allRawEls.filter(el => {
        if (el.style.display === 'none' && el.dataset.hiddenLayer !== 'true') return false;
        if (el.id === 'elLogo') {
            const hasImg = el.querySelector('img') && el.querySelector('img').src && el.querySelector('img').src !== window.location.href && el.querySelector('img').src.length > 10;
            const hasBg = el.style.backgroundImage && el.style.backgroundImage !== 'none';
            const hasSrc = el.src && el.src !== window.location.href && el.src.length > 10;
            if (!hasImg && !hasBg && !hasSrc) return false;
        }
        if (el.classList.contains('normal-el') || el.id === 'elBadge' || el.id === 'elPrice' || el.id === 'elDetails' || el.id === 'elTitle') {
            if (!el.querySelector('img') && !el.querySelector('svg') && el.innerText.trim() === '') return false;
        }
        return true;
    });
    allRawEls = [...new Set(allRawEls)];

    const generateItemHtml = (el) => {
        let name = el.dataset.label || 'Nesne';
        const isNeon = el.classList.contains('neon-text-el') || el.dataset.saberActive === 'true';

        if (el.classList.contains('tb-image-frame')) {
            const isCirc = el.dataset.isCircle === 'true';
            const isPoly = el.dataset.isPolygon === 'true';
            const shape = el.dataset.shape;
            const has3D = (parseFloat(el.dataset.pitch) || 0) !== 0 || (parseFloat(el.dataset.yaw) || 0) !== 0 || (parseFloat(el.dataset.elevation) || 0) !== 0;

            if (isCirc) name = 'Tam Daire Çerçeve';
            else if (isPoly) name = 'Serbest Çokgen Çerçeve';
            else if (shape && shape !== 'none') name = 'Şekilli Çerçeve';
            else name = el.dataset.label || 'Görsel Çerçevesi';

            if (has3D) name += ' 3D';
        } else if (!el.dataset.label) {
            if (el.id === 'elBadge') name = 'Durum Rozeti';
            else if (el.id === 'elPrice') name = 'Fiyat Etiketi';
            else if (el.id === 'elDetails') name = 'Bilgi Paneli';
            else if (el.id === 'elLogo') name = 'Firma Logosu';
            else if (el.classList.contains('callout-wrap') || el.classList.contains('svg-callout')) name = 'Callout Etiketi';
            else if (el.classList.contains('is-svg-icon')) name = 'SVG Ikon';
            else if (el.classList.contains('normal-el')) name = isNeon ? 'Neon Yazı' : 'Serbest Yazı';
        }

        let iconClass = 'fa-layer-group';
        if (isNeon) {
            iconClass = 'fa-bolt';
        } else if (el.classList.contains('tb-image-frame')) {
            const isCirc = el.dataset.isCircle === 'true';
            const isPoly = el.dataset.isPolygon === 'true';
            const has3D = (parseFloat(el.dataset.pitch) || 0) !== 0 || (parseFloat(el.dataset.yaw) || 0) !== 0 || (parseFloat(el.dataset.elevation) || 0) !== 0;
            iconClass = has3D ? 'fa-cube' : (isCirc ? 'fa-circle' : (isPoly ? 'fa-draw-polygon' : 'fa-image'));
        } else if (name.toLowerCase().includes('yazi') || name.toLowerCase().includes('metin') || name.toLowerCase().includes('fiyat') || name.toLowerCase().includes('bilgi')) {
            iconClass = 'fa-font';
        } else if (name.toLowerCase().includes('rozet')) {
            iconClass = 'fa-tag';
        } else if (name.toLowerCase().includes('callout')) {
            iconClass = 'fa-comment-dots';
        } else if (name.toLowerCase().includes('ikon') || name.toLowerCase().includes('logo')) {
            iconClass = 'fa-image';
        }

        const isFrameSelected = (window.TemplateBuilder && window.TemplateBuilder.selectedFrame === el);
        const isSelected = isFrameSelected || (window.selectedElements && window.selectedElements.includes(el)) || (window.selectedEl === el);
        const bg = isSelected ? 'rgba(56,189,248, 0.2)' : 'var(--dark-3)';
        const border = isSelected ? '1px solid #38bdf8' : '1px solid rgba(108,92,231,0.2)';

        if (!el.dataset.layerUid) el.dataset.layerUid = 'layer_' + Math.random().toString(36).substr(2, 9);
        const uid = el.dataset.layerUid;
        
        const isHidden = el.dataset.hiddenLayer === 'true';
        const isLocked = el.dataset.locked === 'true';
        const eyeClass = isHidden ? 'fa-eye-slash' : 'fa-eye';
        const lockClass = isLocked ? 'fa-lock' : 'fa-lock-open';
        const lockColor = isLocked ? '#ef4444' : 'var(--text-muted)';
        const eyeColor = isHidden ? 'var(--primary)' : 'var(--text-muted)';
        const nameStyle = isHidden ? 'text-decoration: line-through; opacity: 0.5;' : '';

        return `
        <div class="layer-item" 
             draggable="true" 
             ondragstart="window.layerDragStart(event, '${uid}')"
             ondragover="window.layerDragOver(event)"
             ondragleave="window.layerDragLeave(event)"
             ondrop="window.layerDrop(event, '${uid}')"
             style="display:flex; justify-content:space-between; align-items:center; background:${bg}; border:${border}; padding:10px 12px; border-radius:6px; cursor:grab; transition:all 0.2s; margin-bottom: 5px;" 
             onclick="window.layerSelect('${uid}', event, false)" >
            <div style="display:flex; align-items:center; gap:8px; overflow:hidden;">
                <i class="fas fa-grip-vertical" style="color:rgba(255,255,255,0.2); font-size:10px; margin-right:4px; cursor:grab;"></i>
                <i class="fas ${iconClass}" style="color:${isNeon ? '#00f0ff' : 'var(--text-muted)'}; font-size:12px;"></i>
                <span style="font-size:13px; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; ${nameStyle}">${name}</span>
            </div>
            <div style="display:flex; gap:6px; align-items:center;" onclick="event.stopPropagation();">
                <i class="fas fa-arrow-up" style="cursor:pointer; font-size:11px; color:#38bdf8; opacity:0.85;" onclick="window.layerMoveUp('${uid}')" title="Öne Al"></i>
                <i class="fas fa-arrow-down" style="cursor:pointer; font-size:11px; color:#94a3b8; opacity:0.85;" onclick="window.layerMoveDown('${uid}')" title="Geriye At"></i>
                <i class="fas ${eyeClass}" style="cursor:pointer; font-size:12px; color:${eyeColor};" onclick="window.layerToggleVisibility('${uid}')" title="Gizle/Göster"></i>
                <i class="fas ${lockClass}" style="cursor:pointer; font-size:12px; color:${lockColor};" onclick="window.layerToggleLock('${uid}')" title="Kilitle/Aç"></i>
                <i class="fas fa-trash-alt" style="cursor:pointer; font-size:12px; color:#ef4444; opacity:0.75;" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0.75'" onclick="window.layerDelete('${uid}')" title="Sil"></i>
            </div>
        </div>`;
    };

    const generate3DItemHtml = (el) => {
        let label = el.name || el.sourceItemName || (el.text ? `3D: ${el.text}` : '3D Öge');
        let iconClass = 'fa-cube';
        if (!el.name && !el.sourceItemName) {
            if (el.elementType === 'pin') { label = '3D Konum İğnesi'; iconClass = 'fa-location-dot'; }
            else if (el.elementType === 'arrow') { label = '3D Yönlendirme Oku'; iconClass = 'fa-arrow-right'; }
            else if (el.elementType === 'combo_pin') { label = '3D İğne ve Metin'; iconClass = 'fa-map-pin'; }
            else if (el.elementType === 'combo_arrow') { label = '3D Ok ve Metin'; iconClass = 'fa-location-arrow'; }
            else if (el.elementType === 'badge') { label = '3D Rozet'; iconClass = 'fa-shield-halved'; }
        }

        const activeId = (window.ThreeDEngine && typeof window.ThreeDEngine.getActiveElementId === 'function')
            ? window.ThreeDEngine.getActiveElementId()
            : null;
        const isEngineSelected = (window.ThreeDEngine && typeof window.ThreeDEngine.isSelected === 'function')
            ? window.ThreeDEngine.isSelected()
            : true;

        const isVis = el.visible !== false;
        const eyeIcon = isVis ? 'fa-eye' : 'fa-eye-slash';
        const isSelected = (el.id === activeId) && isEngineSelected;
        const bg = isSelected ? 'rgba(14,165,233, 0.22)' : 'var(--dark-3)';
        const border = isSelected ? '1px solid #0ea5e9' : '1px solid rgba(14,165,233, 0.3)';
        const uid = '3d_' + el.id;

        return `
        <div class="layer-item three-d-layer-item ${isSelected ? 'selected' : ''}" 
             draggable="true" 
             ondragstart="window.layerDragStart(event, '${uid}')"
             ondragover="window.layerDragOver(event)"
             ondragleave="window.layerDragLeave(event)"
             ondrop="window.layerDrop(event, '${uid}')"
             style="display:flex; justify-content:space-between; align-items:center; background:${bg}; border:${border}; padding:10px 12px; border-radius:6px; margin-bottom:5px; cursor:grab; box-shadow: 0 2px 10px rgba(14,165,233,0.15);"
             onclick="if(window.ThreeDEngine) { window.ThreeDEngine.selectElement('${el.id}'); window.renderLayers(); }">
            <div style="display:flex; align-items:center; gap:8px; overflow:hidden;">
                <i class="fas fa-grip-vertical" style="color:rgba(255,255,255,0.2); font-size:10px; margin-right:4px; cursor:grab;"></i>
                <i class="fas ${iconClass}" style="color:#0ea5e9; font-size:13px;"></i>
                <span style="font-size:12px; font-weight:700; color:#38bdf8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px;" title="${label}">${label}</span>
            </div>
            <div style="display:flex; gap:6px; align-items:center;" onclick="event.stopPropagation();">
                <i class="fas fa-arrow-up" style="cursor:pointer; font-size:11px; color:#38bdf8; opacity:0.85;" 
                   onclick="window.layerMoveUp('${uid}')" title="Öne Al"></i>
                <i class="fas fa-arrow-down" style="cursor:pointer; font-size:11px; color:#94a3b8; opacity:0.85;" 
                   onclick="window.layerMoveDown('${uid}')" title="Geriye At"></i>
                <i class="fas ${eyeIcon}" style="cursor:pointer; font-size:12px; color: ${isVis ? 'var(--text-muted)' : '#ef4444'};" 
                   onclick="if(window.ThreeDEngine) { window.ThreeDEngine.toggleElementVisibility('${el.id}'); window.renderLayers(); }" title="Gizle/Göster"></i>
                <i class="fas fa-trash-alt" style="cursor:pointer; font-size:12px; color: #ef4444; opacity:0.75;" 
                   onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0.75'"
                   onclick="window.layerDelete('${uid}')" title="Sil"></i>
                <span style="font-size:10px; font-weight:bold; color:#0ea5e9; background:rgba(14,165,233,0.15); padding:2px 6px; border-radius:4px;">3D</span>
            </div>
        </div>`;
    };

    const generate3DLegacyHtml = () => {
        const tState = (window.ThreeDEngine && window.ThreeDEngine.state) || {};
        let label = '3D: ' + (tState.text || 'Metin');
        let iconClass = 'fa-cube';
        if (tState.elementType === 'pin') { label = '3D Konum İğnesi'; iconClass = 'fa-location-dot'; }
        else if (tState.elementType === 'arrow') { label = '3D Yönlendirme Oku'; iconClass = 'fa-arrow-right'; }
        else if (tState.elementType === 'combo_pin') { label = '3D İğne ve Metin'; iconClass = 'fa-map-pin'; }
        else if (tState.elementType === 'combo_arrow') { label = '3D Ok ve Metin'; iconClass = 'fa-location-arrow'; }

        const cvs = (window.ThreeDEngine && window.ThreeDEngine.getCanvas) ? window.ThreeDEngine.getCanvas() : document.getElementById('three-d-layer');
        const isVis = cvs ? (cvs.style.display !== 'none') : true;
        const eyeIcon = isVis ? 'fa-eye' : 'fa-eye-slash';
        const isSelected = !!tState.active;
        const bg = isSelected ? 'rgba(14,165,233, 0.2)' : 'var(--dark-3)';
        const border = isSelected ? '1px solid #0ea5e9' : '1px solid rgba(14,165,233, 0.3)';
        const uid = '3d_canvas_layer';

        return `
        <div class="layer-item three-d-layer-item ${isSelected ? 'selected' : ''}" 
             draggable="true" 
             ondragstart="window.layerDragStart(event, '${uid}')"
             ondragover="window.layerDragOver(event)"
             ondragleave="window.layerDragLeave(event)"
             ondrop="window.layerDrop(event, '${uid}')"
             style="display:flex; justify-content:space-between; align-items:center; background:${bg}; border:${border}; padding:10px 12px; border-radius:6px; margin-bottom:5px; cursor:grab; box-shadow: 0 2px 10px rgba(14,165,233,0.15);"
             onclick="if(window.ThreeDEngine) window.ThreeDEngine.openStudio();">
            <div style="display:flex; align-items:center; gap:8px; overflow:hidden;">
                <i class="fas fa-grip-vertical" style="color:rgba(255,255,255,0.2); font-size:10px; margin-right:4px; cursor:grab;"></i>
                <i class="fas ${iconClass}" style="color:#0ea5e9; font-size:13px;"></i>
                <span style="font-size:12px; font-weight:700; color:#38bdf8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px;">${label}</span>
            </div>
            <div style="display:flex; gap:6px; align-items:center;" onclick="event.stopPropagation();">
                <i class="fas fa-arrow-up" style="cursor:pointer; font-size:11px; color:#38bdf8; opacity:0.85;" 
                   onclick="window.layerMoveUp('${uid}')" title="Öne Al"></i>
                <i class="fas fa-arrow-down" style="cursor:pointer; font-size:11px; color:#94a3b8; opacity:0.85;" 
                   onclick="window.layerMoveDown('${uid}')" title="Geriye At"></i>
                <i class="fas ${eyeIcon}" style="cursor:pointer; font-size:12px; color: ${isVis ? 'var(--text-muted)' : '#ef4444'};" 
                   onclick="if(window.ThreeDEngine) { window.ThreeDEngine.toggleVisibility(); window.renderLayers(); }" title="Gizle/Göster"></i>
                <span style="font-size:10px; font-weight:bold; color:#0ea5e9; background:rgba(14,165,233,0.15); padding:2px 6px; border-radius:4px;">3D</span>
            </div>
        </div>`;
    };

    // Tüm katmanları birleşik z-index sırasına göre topla
    const layers = window.getCanvasLayersList();
    let contentHtml = '';

    layers.forEach(item => {
        if (item.type === '2d') {
            contentHtml += generateItemHtml(item.el);
        } else if (item.type === '3d') {
            contentHtml += generate3DItemHtml(item.thEl);
        } else if (item.type === '3d_legacy') {
            contentHtml += generate3DLegacyHtml();
        }
    });

    // Ana Fotoğraf Paneli: DAİMA TÜM İÇERİK KATMANLARININ EN ALTINDA (Background Layer)
    let photoHtml = '';
    const photoLayer = document.getElementById('photo-layer');
    if (photoLayer) {
        const isHidden = photoLayer.dataset.hiddenLayer === 'true';
        const photoToggle = document.getElementById('photoLockToggle');
        const isLocked = photoToggle ? photoToggle.checked : (window.isPhotoLocked === true);
        const eyeClass = isHidden ? 'fa-eye-slash' : 'fa-eye';
        const lockClass = isLocked ? 'fa-lock' : 'fa-lock-open';
        const lockColor = isLocked ? '#ef4444' : 'var(--text-muted)';
        const eyeColor = isHidden ? 'var(--primary)' : 'var(--text-muted)';
        const nameStyle = isHidden ? 'text-decoration: line-through; opacity: 0.5;' : '';
        
        photoHtml = `
        <div class="layer-item photo-layer-item" 
             style="display:flex; justify-content:space-between; align-items:center; background:var(--dark-3); border:1px solid rgba(108,92,231,0.2); padding:10px 12px; border-radius:6px; margin-top:4px; margin-bottom: 5px; cursor:default;" >
            <div style="display:flex; align-items:center; gap:8px; overflow:hidden;">
                <i class="fas fa-image" style="color:var(--text-muted); font-size:12px;"></i>
                <span style="font-size:13px; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; ${nameStyle}">Ana Fotoğraf Paneli</span>
            </div>
            <div style="display:flex; gap:10px; align-items:center;" onclick="event.stopPropagation();">
                <i class="fas ${eyeClass}" style="cursor:pointer; font-size:12px; color:${eyeColor};" onclick="window.layerToggleVisibility('photo-layer')" title="Gizle/Göster"></i>
                <i class="fas ${lockClass}" style="cursor:pointer; font-size:12px; color:${lockColor};" onclick="window.layerToggleLock('photo-layer')" title="Kilitle / Aç"></i>
            </div>
        </div>`;
    }

    // Çizimler Grubu
    let drawHtml = '';
    if (typeof drawPaths !== 'undefined') {
        const paths = drawPaths;
        if (paths && paths.length > 0) {
            const drawOpenAttr = isDrawDetailsOpen ? 'open' : '';
            drawHtml += `
            <details id="draw-layers-details" ${drawOpenAttr} style="margin-top: 10px; background: var(--dark-3); border: 1px solid rgba(108,92,231,0.2); border-radius: 6px; padding: 5px;">
                <summary style="padding: 10px; cursor: pointer; color: var(--text); font-size: 13px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-palette" style="color:var(--primary);"></i> Çizimler (${paths.length})
                </summary>
                <div style="padding: 5px 10px; display: flex; flex-direction: column; gap: 5px;">
            `;
            const pnames = {free:'Serbest',line:'Çizgi',arrow:'Ok',rect:'Kare',circle:'Daire',polygon:'Çokgen'};
            paths.forEach((p, idx) => {
                let name = (pnames[p.type] || p.type) + ' ' + (idx + 1);
                if (p.isParcel) {
                    name = (p.hasSaber || p.saber) ? 'Neon Arsa Sınırı' : 'Arsa Sınırı';
                }
                const isHidden = p.hidden === true;
                const isLocked = p.locked === true;
                const eyeIcon = isHidden ? 'fa-eye-slash' : 'fa-eye';
                const lockIcon = isLocked ? 'fa-lock' : 'fa-lock-open';
                
                let isSelected = false;
                if (typeof editingDrawIndex !== 'undefined' && editingDrawIndex === idx) {
                    isSelected = true;
                }
                
                const bg = isSelected ? 'rgba(56,189,248, 0.2)' : 'var(--dark-3)';
                const border = isSelected ? '1px solid #38bdf8' : '1px solid rgba(108,92,231,0.2)';

                drawHtml += `
                <div class="layer-item ${p.locked ? 'locked' : ''} ${isSelected ? 'selected' : ''}" 
                     style="display:flex; justify-content:space-between; align-items:center; background:${bg}; border:${border}; padding:10px 12px; border-radius:6px; margin-bottom:5px; cursor:pointer;"
                     onclick="window.layerSelect('draw_${idx}', event, false)">
                    <div style="display:flex; align-items:center; gap:8px; overflow:hidden;">
                        <span style="width:12px; height:12px; border-radius:3px; background:${p.color}; ${(p.hasSaber || p.saber) ? 'box-shadow: 0 0 8px ' + p.color + ';' : ''}"></span>
                        <span style="font-size:12px; color:var(--text); ${isHidden ? 'text-decoration:line-through; opacity:0.5;' : ''}">${name}</span>
                    </div>
                    <div style="display:flex; gap:8px; align-items:center;" onclick="event.stopPropagation();">
                        <i class="fas ${eyeIcon}" style="cursor:pointer; font-size:12px; color: ${isHidden ? 'var(--primary)' : 'var(--text-muted)'};" onclick="window.layerToggleVisibility(null, true, ${idx})" title="Gizle/Göster"></i>
                        <i class="fas ${lockIcon}" style="cursor:pointer; font-size:12px; color: var(--text-muted);" onclick="window.layerToggleLock(null, true, ${idx})" title="Kilitle/Aç"></i>
                        <i class="fas fa-trash-alt" style="cursor:pointer; font-size:12px; color: #ef4444; opacity:0.75;" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0.75'" onclick="window.layerDelete('draw_${idx}')" title="Sil"></i>
                    </div>
                </div>`;
            });
            drawHtml += `
                </div>
            </details>`;
        }
    }

    if (contentHtml === '' && photoHtml === '' && drawHtml === '') {
        container.innerHTML = '<div style="padding:15px;text-align:center;color:rgba(255,255,255,0.4);font-size:12px;">Tuvalde henüz nesne yok</div>';
    } else {
        container.innerHTML = contentHtml + photoHtml + drawHtml;
    }
};

window.getCanvasLayersList = function() {
    const list = [];

    // 1. 2D Elemanlar
    let allRawEls = Array.from(document.querySelectorAll('#canvas-container .canvas-el, #canvas-container .draggable, #canvas-container .callout-wrap, #canvas-container .svg-callout'));
    allRawEls = allRawEls.filter(el => {
        if (el.style.display === 'none' && el.dataset.hiddenLayer !== 'true') return false;
        if (el.id === 'elLogo') {
            const hasImg = el.querySelector('img') && el.querySelector('img').src && el.querySelector('img').src !== window.location.href && el.querySelector('img').src.length > 10;
            const hasBg = el.style.backgroundImage && el.style.backgroundImage !== 'none';
            const hasSrc = el.src && el.src !== window.location.href && el.src.length > 10;
            if (!hasImg && !hasBg && !hasSrc) return false;
        }
        if (el.classList.contains('normal-el') || el.id === 'elBadge' || el.id === 'elPrice' || el.id === 'elDetails' || el.id === 'elTitle') {
            if (!el.querySelector('img') && !el.querySelector('svg') && el.innerText.trim() === '') return false;
        }
        return true;
    });
    allRawEls = [...new Set(allRawEls)];

    allRawEls.forEach(el => {
        if (!el.dataset.layerUid) el.dataset.layerUid = 'layer_' + Math.random().toString(36).substr(2, 9);
        let rawZ = el.dataset.layerZIndex || el.style.zIndex;
        let z = parseInt(rawZ, 10);
        if (isNaN(z)) {
            z = parseInt(window.getComputedStyle ? window.getComputedStyle(el).zIndex : 10, 10);
            if (isNaN(z)) z = 60;
        } else if (z >= 900) {
            z = 60;
        }
        list.push({
            type: '2d',
            uid: el.dataset.layerUid,
            el: el,
            zIndex: z
        });
    });

    // 2. 3D Elemanlar
    if (window.ThreeDEngine) {
        const thElements = (typeof window.ThreeDEngine.getElements === 'function') 
            ? window.ThreeDEngine.getElements() 
            : [];
        const cvs = document.getElementById('three-d-layer') || (window.ThreeDEngine.getCanvas ? window.ThreeDEngine.getCanvas() : null);
        let rawCvsZ = cvs?.dataset?.layerZIndex || cvs?.style?.zIndex;
        let cvsZ = parseInt(rawCvsZ, 10);
        if (isNaN(cvsZ) || cvsZ >= 900) cvsZ = 54;

        if (thElements.length > 0) {
            [...thElements].reverse().forEach((thEl, idx) => {
                list.push({
                    type: '3d',
                    uid: '3d_' + thEl.id,
                    thEl: thEl,
                    zIndex: cvsZ - idx * 0.05
                });
            });
        } else if (typeof window.ThreeDEngine.isLayerActive === 'function' && window.ThreeDEngine.isLayerActive()) {
            list.push({
                type: '3d_legacy',
                uid: '3d_canvas_layer',
                zIndex: cvsZ
            });
        }
    }

    // zIndex değerine göre azalan sırada sırala (En yüksek zIndex = En üst katman)
    list.sort((a, b) => b.zIndex - a.zIndex);
    return list;
};

window.applyCanvasLayersOrder = function(layers) {
    if (!layers || layers.length === 0) return;
    const total = layers.length;
    const baseZ = 30;

    let maxNeonZ = null;
    let max3DZ = null;

    layers.forEach((item, i) => {
        const assignedZ = baseZ + (total - 1 - i) * 5;
        item.zIndex = assignedZ;

        if (item.type === '2d' && item.el) {
            item.el.dataset.layerZIndex = String(assignedZ);
            item.el.style.setProperty('z-index', String(assignedZ), 'important');
            const isNeon = item.el.classList.contains('neon-text-el') || item.el.dataset.saberActive === 'true';
            if (isNeon) {
                if (maxNeonZ === null || assignedZ > maxNeonZ) {
                    maxNeonZ = assignedZ;
                }
            }
        } else if (item.type === '3d' || item.type === '3d_legacy') {
            if (max3DZ === null || assignedZ > max3DZ) {
                max3DZ = assignedZ;
            }
        }
    });

    if (max3DZ !== null) {
        const cvs = document.getElementById('three-d-layer') || (window.ThreeDEngine && window.ThreeDEngine.getCanvas ? window.ThreeDEngine.getCanvas() : null);
        if (cvs) {
            cvs.dataset.layerZIndex = String(max3DZ);
            cvs.style.setProperty('z-index', String(max3DZ), 'important');
        }
    }

    const saberLayer = document.getElementById('saber-layer');
    if (saberLayer) {
        const finalSaberZ = (maxNeonZ !== null) ? maxNeonZ : 15;
        saberLayer.dataset.layerZIndex = String(finalSaberZ);
        saberLayer.style.setProperty('z-index', String(finalSaberZ), 'important');
    }

    if (window.ThreeDEngine && typeof window.ThreeDEngine.getElements === 'function') {
        const thElements = window.ThreeDEngine.getElements();
        if (thElements && thElements.length > 1) {
            const thOrderIds = layers.filter(l => l.type === '3d').map(l => l.thEl?.id).filter(Boolean);
            if (thOrderIds.length > 1) {
                thElements.sort((a, b) => {
                    const idxA = thOrderIds.indexOf(a.id);
                    const idxB = thOrderIds.indexOf(b.id);
                    return idxB - idxA;
                });
                if (typeof window.ThreeDEngine.update3DLayersOrder === 'function') {
                    window.ThreeDEngine.update3DLayersOrder();
                }
            }
        }
    }

    if (typeof window.recordHistory === 'function') {
        window.recordHistory('Katman Sırası Değiştirildi');
    }
    if (window.SaberEngine && typeof window.SaberEngine.updateTextSaberPositions === 'function') {
        window.SaberEngine.updateTextSaberPositions();
    }
    if (window.ThreeDEngine && typeof window.ThreeDEngine.requestRender === 'function') {
        window.ThreeDEngine.requestRender();
    }
};

window.layerMoveUp = function(uid) {
    const layers = window.getCanvasLayersList();
    const idx = layers.findIndex(l => l.uid === uid);
    if (idx > 0) {
        const temp = layers[idx];
        layers[idx] = layers[idx - 1];
        layers[idx - 1] = temp;
        window.applyCanvasLayersOrder(layers);
        window.renderLayers();
    }
};

window.layerMoveDown = function(uid) {
    const layers = window.getCanvasLayersList();
    const idx = layers.findIndex(l => l.uid === uid);
    if (idx >= 0 && idx < layers.length - 1) {
        const temp = layers[idx];
        layers[idx] = layers[idx + 1];
        layers[idx + 1] = temp;
        window.applyCanvasLayersOrder(layers);
        window.renderLayers();
    }
};

window.layerDelete = function(uid) {
    if (!uid) return;
    if (uid.startsWith('3d_')) {
        const thId = uid.replace('3d_', '');
        if (window.ThreeDEngine && typeof window.ThreeDEngine.delete3DElement === 'function') {
            window.ThreeDEngine.delete3DElement(thId);
        }
        window.renderLayers();
        return;
    }
    if (uid.startsWith('draw_')) {
        const drawIndex = parseInt(uid.split('_')[1]);
        if (typeof drawPaths !== 'undefined' && drawPaths[drawIndex]) {
            const p = drawPaths[drawIndex];
            if (p.el) p.el.remove();
            drawPaths.splice(drawIndex, 1);
            if (typeof redrawAll === 'function') redrawAll();
        }
        window.renderLayers();
        return;
    }
    const el = document.querySelector(`[data-layer-uid="${uid}"]`);
    if (!el) return;
    const saberId = el.id || (el.dataset && el.dataset.saberElId);
    if (window.SaberEngine && typeof window.SaberEngine.removeTextSaber === 'function') {
        if (saberId) window.SaberEngine.removeTextSaber(saberId);
        window.SaberEngine.removeTextSaber(el);
        const app = window.SaberEngine.getApp();
        if (app && app.renderer && app.stage) {
            try { app.renderer.render(app.stage); } catch(e) {}
        }
    }
    if (el.classList.contains('tb-image-frame') && window.TemplateBuilder && typeof window.TemplateBuilder.deselectFrame === 'function') {
        window.TemplateBuilder.deselectFrame();
    }
    if (window.selectedEl === el) window.selectedEl = null;
    if (window.selectedElements) window.selectedElements = window.selectedElements.filter(x => x !== el);
    if (typeof deselectAll === 'function') deselectAll();
    if (typeof window.deselectAll === 'function') window.deselectAll();
    el.remove();
    if (typeof window.recordHistory === 'function') window.recordHistory('Katman Silindi');
    window.renderLayers();
};

window._layerDraggedUid = null;

window.layerDragStart = function(e, uid) {
    window._layerDraggedUid = uid;
    e.dataTransfer.setData('text/plain', uid);
    e.dataTransfer.effectAllowed = 'move';
};

window.layerDragOver = function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const item = e.target.closest('.layer-item');
    if (!item) return;

    const rect = item.getBoundingClientRect();
    const isAbove = (e.clientY - rect.top) < (rect.height / 2);
    item.classList.toggle('drop-indicator-top', isAbove);
    item.classList.toggle('drop-indicator-bottom', !isAbove);
};

window.layerDragLeave = function(e) {
    const item = e.target.closest('.layer-item');
    if (item) {
        item.classList.remove('drop-indicator-top', 'drop-indicator-bottom');
    }
};

window.layerDrop = function(e, targetUid) {
    e.preventDefault();
    const sourceUid = e.dataTransfer.getData('text/plain') || window._layerDraggedUid;
    window._layerDraggedUid = null;

    document.querySelectorAll('.layer-item').forEach(item => {
        item.classList.remove('drop-indicator-top', 'drop-indicator-bottom');
    });

    if (!sourceUid || sourceUid === targetUid) return;

    const layers = window.getCanvasLayersList();
    const srcIdx = layers.findIndex(l => l.uid === sourceUid);
    const tgtIdx = layers.findIndex(l => l.uid === targetUid);
    if (srcIdx === -1 || tgtIdx === -1) return;

    const targetItem = e.target.closest('.layer-item');
    const targetRect = targetItem ? targetItem.getBoundingClientRect() : null;
    const isAbove = targetRect ? ((e.clientY - targetRect.top) < (targetRect.height / 2)) : false;

    const [moved] = layers.splice(srcIdx, 1);
    let insertIdx = layers.findIndex(l => l.uid === targetUid);
    if (!isAbove) insertIdx += 1;
    layers.splice(insertIdx, 0, moved);

    window.applyCanvasLayersOrder(layers);
    window.renderLayers();
};

(function initLayersPanel() {
    try {
        if (typeof window.switchTab === 'function') {
            const origSwitch = window.switchTab;
            window.switchTab = function(tabName) {
                try {
                    origSwitch(tabName);
                } catch(e) {
                    console.error("origSwitch error:", e);
                    const errDiv = document.createElement('div');
                    errDiv.style.position = 'fixed'; errDiv.style.top = '100px'; errDiv.style.left = '10px';
                    errDiv.style.background = 'orange'; errDiv.style.color = 'black'; errDiv.style.zIndex = '999999';
                    errDiv.innerText = "SWITCHTAB ERROR: " + e.stack;
                    document.body.appendChild(errDiv);
                }
                if (tabName === 'layers') {
                    window.renderLayers();
                }
            };
        } else {
            const tabsEl = document.getElementById('mainTabs');
            if (tabsEl) {
                tabsEl.addEventListener('click', (e) => {
                    const btn = e.target.closest('.tab-btn');
                    if (btn && btn.dataset.tab === 'layers') {
                        setTimeout(() => { if (typeof window.renderLayers === 'function') window.renderLayers(); }, 30);
                    }
                });
            }
        }
        
        let _layersDebounceTimer = null;
        document.addEventListener('mouseup', (e) => {
            if (e && e.target && e.target.closest && e.target.closest('#layersListContainer')) return;
            const activeBtn = document.querySelector('#mainTabs .tab-btn.active');
            if (activeBtn && activeBtn.dataset.tab === 'layers') {
                if (_layersDebounceTimer) clearTimeout(_layersDebounceTimer);
                _layersDebounceTimer = setTimeout(() => {
                    _layersDebounceTimer = null;
                    if (typeof window.renderLayers === 'function') window.renderLayers();
                }, 100);
            }
        });
    } catch (e) {
        console.error("Init layers error:", e);
    }
})();






