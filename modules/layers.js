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
                if (window.forceRedrawAll) window.forceRedrawAll();
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
    } else {
        el.dataset.hiddenLayer = 'true';
        el.dataset.oldDisplay = el.style.display;
        el.style.display = 'none';
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
                if (window.forceRedrawAll) window.forceRedrawAll();
                window.renderLayers();
            }
        }
        return;
    }

    if (uid === 'photo-layer') {
        const photoToggle = document.getElementById('photoLockToggle');
        const isLocked = photoToggle ? photoToggle.checked : (window.isPhotoLocked === true);
        const newState = !isLocked;
        window.isPhotoLocked = newState;
        if (photoToggle) photoToggle.checked = newState;
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
    }
    window.renderLayers();
};

window.layerSelect = function(uid, event, isDoubleClick = false) {
    // If it's a fixed layer like photo or canva, skip
    if (uid === 'photo-layer' || uid === 'canva-render-layer') return;
    
    if (uid.startsWith('draw_')) {
        let drawIndex = parseInt(uid.split('_')[1]);
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

    const templateEls = allRawEls.filter(el => el.closest('#canva-render-layer'));
    const normalEls = allRawEls.filter(el => !el.closest('#canva-render-layer'));

    const generateItemHtml = (el) => {
        let name = el.dataset.label || 'Nesne';
        if (!el.dataset.label) {
            if (el.id === 'elBadge') name = 'Durum Rozeti';
            else if (el.id === 'elPrice') name = 'Fiyat Etiketi';
            else if (el.id === 'elDetails') name = 'Bilgi Paneli';
            else if (el.id === 'elLogo') name = 'Firma Logosu';
            else if (el.classList.contains('callout-wrap') || el.classList.contains('svg-callout')) name = 'Callout Etiketi';
            else if (el.classList.contains('is-svg-icon')) name = 'SVG Ikon';
            else if (el.classList.contains('normal-el')) name = 'Serbest Yazi';
        }

        let iconClass = 'fa-layer-group';
        if (name.toLowerCase().includes('yazi') || name.toLowerCase().includes('metin') || name.toLowerCase().includes('fiyat') || name.toLowerCase().includes('bilgi')) iconClass = 'fa-font';
        else if (name.toLowerCase().includes('rozet')) iconClass = 'fa-tag';
        else if (name.toLowerCase().includes('callout')) iconClass = 'fa-comment-dots';
        else if (name.toLowerCase().includes('ikon') || name.toLowerCase().includes('logo')) iconClass = 'fa-image';

        const isSelected = window.selectedElements && window.selectedElements.includes(el);
        const bg = isSelected ? 'rgba(56,189,248, 0.2)' : 'var(--dark-3)';
        const border = isSelected ? '1px solid #38bdf8' : '1px solid rgba(108,92,231,0.2)';

        if (!el.dataset.layerUid) el.dataset.layerUid = 'layer_' + Math.random().toString(36).substr(2, 9);
        const uid = el.dataset.layerUid;
        
        const isHidden = el.dataset.hiddenLayer === 'true';
        const isLocked = el.dataset.locked === 'true';
        const eyeClass = isHidden ? 'fa-eye-slash' : 'fa-eye';
        const lockClass = isLocked ? 'fa-lock' : 'fa-lock-open';
        const nameStyle = isHidden ? 'text-decoration: line-through; opacity: 0.5;' : '';

        return `
        <div class="layer-item" 
             draggable="true" 
             ondragstart="window.layerDragStart(event, '${uid}')"
             ondragover="window.layerDragOver(event)"
             ondrop="window.layerDrop(event, '${uid}')"
             style="display:flex; justify-content:space-between; align-items:center; background:${bg}; border:${border}; padding:10px 12px; border-radius:6px; cursor:grab; transition:all 0.2s; margin-bottom: 5px;" 
             onclick="window.layerSelect('${uid}', event, false)" >
            <div style="display:flex; align-items:center; gap:8px; overflow:hidden;">
                <i class="fas fa-grip-vertical" style="color:rgba(255,255,255,0.2); font-size:10px; margin-right:4px; cursor:grab;"></i>
                <i class="fas ${iconClass}" style="color:var(--text-muted); font-size:12px;"></i>
                <span style="font-size:13px; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; ${nameStyle}">${name}</span>
            </div>
            <div style="display:flex; gap:10px; align-items:center;" onclick="event.stopPropagation();">
                <i class="fas ${eyeClass}" style="cursor:pointer;" onclick="window.layerToggleVisibility('${uid}')" title="Gizle/Goster"></i>
                <i class="fas ${lockClass}" style="cursor:pointer;" onclick="window.layerToggleLock('${uid}')" title="Kilitle/Ac"></i>
            </div>
        </div>`;
    };

    const sortEls = (els) => {
        return els.sort((a, b) => {
            let zA = parseInt(window.getComputedStyle(a).zIndex) || 10;
            let zB = parseInt(window.getComputedStyle(b).zIndex) || 10;
            return zB - zA; // Highest z-index first
        });
    };

    // 1. Sablon Ogeleri
    if (templateEls.length > 0) {
        const openAttr = isTemplateDetailsOpen ? 'open' : '';
        html += `
        <details id="template-layers-details" ${openAttr} style="margin-bottom: 10px; background: var(--dark-3); border: 1px solid rgba(108,92,231,0.2); border-radius: 6px; padding: 5px;">
            <summary style="padding: 10px; cursor: pointer; color: var(--text); font-size: 13px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-layer-group" style="color:var(--primary);"></i> Sablon Ogeleri
            </summary>
            <div style="padding: 5px 10px; display: flex; flex-direction: column; gap: 5px;">
        `;
        const sortedTemplateEls = sortEls(templateEls);
        html += sortedTemplateEls.map(el => generateItemHtml(el)).join('');
        html += `
            </div>
        </details>`;
    }

    // 2. Fotograf Paneli
    const photoLayer = document.getElementById('photo-layer');
    if (photoLayer) {
        const isHidden = photoLayer.dataset.hiddenLayer === 'true';
        const photoToggle = document.getElementById('photoLockToggle');
        const isLocked = photoToggle ? photoToggle.checked : (window.isPhotoLocked === true);
        const eyeClass = isHidden ? 'fa-eye-slash' : 'fa-eye';
        const lockClass = isLocked ? 'fa-lock' : 'fa-lock-open';
        const lockColor = isLocked ? '#ef4444' : 'var(--text-muted)';
        const nameStyle = isHidden ? 'text-decoration: line-through; opacity: 0.5;' : '';
        
        html += `
        <div class="layer-item" 
             style="display:flex; justify-content:space-between; align-items:center; background:var(--dark-3); border:1px solid rgba(108,92,231,0.2); padding:10px 12px; border-radius:6px; margin-bottom: 5px; cursor:default;" >
            <div style="display:flex; align-items:center; gap:8px; overflow:hidden;">
                <i class="fas fa-image" style="color:var(--text-muted); font-size:12px;"></i>
                <span style="font-size:13px; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; ${nameStyle}">Ana Fotoğraf Paneli</span>
            </div>
            <div style="display:flex; gap:10px; align-items:center;" onclick="event.stopPropagation();">
                <i class="fas ${eyeClass}" style="cursor:pointer;" onclick="window.layerToggleVisibility('photo-layer')" title="Gizle/Göster"></i>
                <i class="fas ${lockClass}" style="cursor:pointer; color:${lockColor};" onclick="window.layerToggleLock('photo-layer')" title="Kilitle / Aç"></i>
            </div>
        </div>`;
    }

    // 3. Normal Nesneler
    const sortedNormalEls = sortEls(normalEls);
    html += sortedNormalEls.map(el => generateItemHtml(el)).join('');

    // 4. Cizimler
    let drawHtml = '';
    if (typeof drawPaths !== 'undefined') {
        const paths = drawPaths;
        if (paths && paths.length > 0) {
            const drawOpenAttr = isDrawDetailsOpen ? 'open' : '';
            drawHtml += `
            <details id="draw-layers-details" ${drawOpenAttr} style="margin-top: 15px; background: var(--dark-3); border: 1px solid rgba(108,92,231,0.2); border-radius: 6px; padding: 5px;">
                <summary style="padding: 10px; cursor: pointer; color: var(--text); font-size: 13px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-palette" style="color:var(--primary);"></i> Cizimler (${paths.length})
                </summary>
                <div style="padding: 5px 10px; display: flex; flex-direction: column; gap: 5px;">
            `;
            const pnames = {free:'Serbest',line:'Cizgi',arrow:'Ok',rect:'Kare',circle:'Daire',polygon:'Cokgen'};
            paths.forEach((p, idx) => {
                const name = (pnames[p.type] || p.type) + ' ' + (idx + 1);
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
                        <span style="width:12px; height:12px; border-radius:3px; background:${p.color}"></span>
                        <span style="font-size:12px; color:var(--text); ${isHidden ? 'text-decoration:line-through; opacity:0.5;' : ''}">${name}</span>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center;" onclick="event.stopPropagation();">
                        <i class="fas ${eyeIcon}" style="cursor:pointer; font-size:12px; color: ${isHidden ? 'var(--primary)' : 'var(--text-muted)'};" onclick="window.layerToggleVisibility(null, true, ${idx})" title="Gizle/Goster"></i>
                        <i class="fas ${lockIcon}" style="cursor:pointer; font-size:12px; color: var(--text-muted);" onclick="window.layerToggleLock(null, true, ${idx})" title="Kilitle/Ac"></i>
                    </div>
                </div>`;
            });
            drawHtml += `
                </div>
            </details>`;
        }
    }

    if (html === '' && drawHtml === '') {
         container.innerHTML = '<div style="padding:15px;text-align:center;color:rgba(255,255,255,0.4);font-size:12px;">Tuvalde henuz nesne yok</div>';
    } else {
         container.innerHTML = html + drawHtml;
    }
};


window.layerDragStart = function(e, uid) {
    e.dataTransfer.setData('text/plain', uid);
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
            let lastTab = '';
            setInterval(() => {
                const activeBtn = document.querySelector('#mainTabs .tab-btn.active');
                if (activeBtn) {
                    const currentTab = activeBtn.dataset.tab;
                    if (currentTab === 'layers' && lastTab !== 'layers') {
                        window.renderLayers();
                    }
                    lastTab = currentTab;
                }
            }, 500);
        }
        
        document.addEventListener('mouseup', (e) => {
            if (e && e.target && e.target.closest && e.target.closest('#layersListContainer')) return;
            const activeBtn = document.querySelector('#mainTabs .tab-btn.active');
            if (activeBtn && activeBtn.dataset.tab === 'layers') {
                setTimeout(window.renderLayers, 50);
            }
        });
    } catch (e) {
        console.error("Init layers error:", e);
    }
})();






