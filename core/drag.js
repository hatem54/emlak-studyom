/**
 * ============================================
 * DRAG & SELECT MODULE
 * core/drag.js
 * ============================================
 * 
 * Bağımlılıklar:
 * - core/utils.js
 */

window.updatePhotoLockState = function(isLocked) {
    window.isPhotoLocked = isLocked;
    const lockToggle = document.getElementById('photoLockToggle');
    if (lockToggle && lockToggle.checked !== isLocked) lockToggle.checked = isLocked;
    if (isLocked) {
        document.body.classList.remove('photo-unlocked');
    } else {
        document.body.classList.add('photo-unlocked');
        if (typeof deselectAll === 'function') deselectAll();
    }
    if (typeof window.updateDockLockUI === 'function') {
        window.updateDockLockUI(isLocked);
    }
};

function getActiveV4Element() {
    if (typeof isCanvaMode !== 'undefined' && isCanvaMode) {
        let p = document.querySelector('.photo-panel');
        if (p) return p;
    }
    return document.getElementById('photo-layer');
}

function getActivePhotoPanel() {
    if (typeof isCanvaMode !== 'undefined' && isCanvaMode) {
        let p = document.querySelector('.photo-panel');
        let renderLayer = document.getElementById('canva-render-layer');
        if (p && renderLayer) {
            let r1 = p.getBoundingClientRect();
            let r2 = renderLayer.getBoundingClientRect();
            if (r2.width > 0 && r2.height > 0) {
                let scaleX = r2.width / renderLayer.offsetWidth;
                let scaleY = r2.height / renderLayer.offsetHeight;
                
                let comp = window.getComputedStyle(p);
                let bL = parseFloat(comp.borderLeftWidth) || 0;
                let bT = parseFloat(comp.borderTopWidth) || 0;
                let bR = parseFloat(comp.borderRightWidth) || 0;
                let bB = parseFloat(comp.borderBottomWidth) || 0;
                
                let left = (r1.left - r2.left) / scaleX + bL;
                let top = (r1.top - r2.top) / scaleY + bT;
                let w = r1.width / scaleX - (bL + bR);
                let h = r1.height / scaleY - (bT + bB);
                
                return { w, h, left, top };
            }
        }
    }
    if (typeof getActiveV4Element === 'function') {
        const pl = getActiveV4Element();
        if(pl && pl.dataset.zpReady === '1') {
            return { w: pl.offsetWidth, h: pl.offsetHeight, left: pl.offsetLeft, top: pl.offsetTop };
        }
    }
    const photoEl = document.getElementById('photo-1');
    if(photoEl) {
        return { w: photoEl.offsetWidth, h: photoEl.offsetHeight, left: photoEl.offsetLeft, top: photoEl.offsetTop };
    }
    const photoLayer = document.getElementById('photo-layer');
    if(photoLayer && photoLayer.offsetWidth > 0) {
        return { w: photoLayer.offsetWidth, h: photoLayer.offsetHeight, left: photoLayer.offsetLeft, top: photoLayer.offsetTop };
    }
    return { w: 1920, h: 1080, left: 0, top: 0 };
}

function _getZoomTarget(target){
    var el = target;
    // İç eleman ise parent'a çık
    if(el && el.classList && el.classList.contains('photo-inner-zoom')) {
        el = el.parentElement;
    }
    if(!el || !el.classList) return null;
    
    // photo-panel VEYA photo-layer üzerinde çalışsın
    if(el.classList.contains('photo-panel') || el.id === 'photo-layer') {
        return el;
    }
    // Eğer tıklanan #photo-layer'ın içindeyse, onu döndür
    var photoLayer = el.closest && el.closest('#photo-layer');
    if(photoLayer) return photoLayer;
    
    return null;
}

function bindDrag(el){
    let dragging=false, resizing=false, sx, sy, il, it, iw, ih, moved=false, downTime=0, multiSelectKey=false, moveRAF=null, lastClientX=0, lastClientY=0;
    
    el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        if (e.clientX >= rect.right - 20 && e.clientY >= rect.bottom - 20) {
            el.style.cursor = 'se-resize';
        } else {
            el.style.cursor = dragging ? 'grabbing' : (el.dataset.editingText ? 'text' : 'grab');
        }
    });

    function down(e){
        if (e.touches && e.touches.length > 1) return;
        if (e.type === 'mousedown' && e.button !== 0) return; // Sağ tık sürüklemeyi ve seçimi bozmasın
        if(typeof window._rotUp === 'function') window._rotUp();
        window.isLongPressOpen = false;
        if (typeof drawMode !== 'undefined' && drawMode !== null && drawMode !== 'off') return;
        
        multiSelectKey = e.ctrlKey || e.shiftKey;
        if (e.touches && typeof longPressTimer !== 'undefined') { /* mobile long press logic handled separately */ }
          
          if(el.dataset.locked === 'true') {
                if (typeof selectElement === 'function') selectElement(el, multiSelectKey, true);
                e.preventDefault();
                return;
            }
          if(el.contentEditable==='true')return;
        if (e.target.closest('.vertex-handle, .text-rotate-handle, .text-resize-handle, .callout-controls, .callout-resizer, .callout-rotator')) {
            if (!window.selectedElements || window.selectedElements.length <= 1) {
                return;
            }
        }
        
        if(el.dataset.editingText)return;
          
        let wasSelected = true;
        const isAlreadySelected = window.selectedElements && (
            window.selectedElements.includes(el) ||
            window.selectedElements.some(s => s === el || (s && (s.contains(el) || el.contains(s))))
        );

        if (!isAlreadySelected) {
            wasSelected = false;
            if (typeof selectElement === 'function') selectElement(el, multiSelectKey, true);
        }
          
        e.preventDefault();
        e.stopPropagation();
        moved=false;
        downTime=Date.now();
        
        const rect = el.getBoundingClientRect();
        const c = e.touches ? e.touches[0] : e;
        
        const isCallout = el.classList.contains('callout-wrap') || el.classList.contains('svg-callout') || el.classList.contains('co-neon-block');
        
        if (!isCallout && (!window.selectedElements || window.selectedElements.length <= 1) && (c.clientX >= rect.right - 20 && c.clientY >= rect.bottom - 20)) {
            resizing = true;
            iw = el.offsetWidth;
            ih = el.offsetHeight;
            el.dataset.startFontSize = parseFloat(window.getComputedStyle(el).fontSize) || 16;
        } else {
            dragging = true;
            el.classList.add('dragging');
        }
        
        sx=c.clientX;
        sy=c.clientY;
        const cs=getComputedStyle(el);
        il=parseFloat(el.style.left) || parseFloat(cs.left) || el.offsetLeft || 0;
        it=parseFloat(el.style.top) || parseFloat(cs.top) || el.offsetTop || 0;
        
        if (window.selectedElements && window.selectedElements.length > 0) {
            window.selectedElements.forEach(selEl => {
                const s_cs = getComputedStyle(selEl);
                selEl.dataset.dragStartX = parseFloat(selEl.style.left) || parseFloat(s_cs.left) || selEl.offsetLeft || 0;
                selEl.dataset.dragStartY = parseFloat(selEl.style.top) || parseFloat(s_cs.top) || selEl.offsetTop || 0;
                selEl.dataset.dragStartWidth = selEl.offsetWidth;
                selEl.dataset.dragStartHeight = selEl.offsetHeight;
                selEl.dataset.dragStartFontSize = parseFloat(window.getComputedStyle(selEl).fontSize) || 16;
            });
        }
    }
    function move(e){
        if(!dragging && !resizing)return;
        if(el.dataset.editingText){dragging=false;resizing=false;return}
        
        if(e.touches && e.touches.length > 1) {
            dragging = false;
            resizing = false;
            return;
        }
        
        e.preventDefault();
        moved=true;
        
        const tc = e.touches ? e.touches[0] : e;
        lastClientX = tc.clientX;
        lastClientY = tc.clientY;
        
        if (moveRAF) return;
        
        moveRAF = requestAnimationFrame(() => {
            moveRAF = null;
            if(!dragging && !resizing) return;
            const c = { clientX: lastClientX, clientY: lastClientY };
            
            if (resizing) {
            const rawDx = (c.clientX - sx) / window.getGlobalScale();
            const rawDy = (c.clientY - sy) / window.getGlobalScale();
            let dx = rawDx;
            let dy = rawDy;
            const rotDeg = parseFloat(el.dataset.rotation) || 0;
            if (rotDeg !== 0) {
                const rotRad = rotDeg * Math.PI / 180;
                const cos = Math.cos(rotRad);
                const sin = Math.sin(rotRad);
                dx = rawDx * cos + rawDy * sin;
                dy = -rawDx * sin + rawDy * cos;
            }
            let newW = Math.max(20, iw + dx);
            let newH = Math.max(20, ih + dy);
            
            if (el.classList.contains('co-neon-block')) {
                const ratio = Math.min(newW / iw, newH / ih);
                const newIconSize = Math.max(10, Math.round(parseFloat(el.dataset.startIconSize) * ratio));
                const newTextSize = Math.max(5, Math.round(parseFloat(el.dataset.startTextSize) * ratio));
                const newPadding = Math.round(parseFloat(el.dataset.startPadding) * ratio);
                const newRadius = Math.round(parseFloat(el.dataset.startRadius) * ratio);
                const newBoxSize = Math.max(50, Math.round(parseFloat(el.dataset.startBoxSize) * ratio));

                el.dataset.coIconSize = newIconSize;
                el.dataset.coTextSize = newTextSize;
                el.dataset.coPadding = newPadding;
                el.dataset.coRadius = newRadius;
                el.dataset.coBoxSize = newBoxSize;
                
                if (typeof renderCalloutFromDataset === 'function') {
                    renderCalloutFromDataset(el);
                }
                
                if (typeof selectedCalloutEl !== 'undefined' && selectedCalloutEl === el) {
                    const is = document.getElementById('coIconSize');
                    if (is) { is.value = newIconSize; document.getElementById('coIconSizeVal').textContent = newIconSize + 'px'; }
                    const ts = document.getElementById('coTextSize');
                    if (ts) { ts.value = newTextSize; document.getElementById('coTextSizeVal').textContent = newTextSize + 'px'; }
                    const rd = document.getElementById('coRadius');
                    if (rd) { rd.value = newRadius; document.getElementById('coRadiusVal').textContent = newRadius + 'px'; }
                    const pd = document.getElementById('coPadding');
                    if (pd) { pd.value = newPadding; document.getElementById('coPaddingVal').textContent = newPadding + 'px'; }
                }
            } else {
                if (el.id === 'elLogo' || el.classList.contains('sh-logo') || el.querySelector('img') || el.tagName === 'IMG') {
                    el.style.width = newW + 'px';
                    el.style.height = 'auto';
                } else if (el.classList.contains('editable-text') || el.classList.contains('canvas-el') || el.classList.contains('cvi-item')) {
                    if (el.dataset.label === 'Özel Kutu') {
                        // Kutu serbest boyutlandırılır, yazı boyutu değişmez (Ratcheting / küçülme bug'ını çözer)
                    } else {
                        // Serbest yazı veya diğerleri orantılı büyür/küçülür
                        const ratio = newW / iw;
                        newH = ih * ratio; // Kutu en-boy oranını korur
                        
                        const newFontSize = Math.max(8, parseFloat(el.dataset.startFontSize) * ratio);
                        el.style.fontSize = newFontSize + 'px';
                        
                        if (typeof selectedEl !== 'undefined' && selectedEl === el) {
                            const fsInput = document.getElementById('elFontSize');
                            const fsVal = document.getElementById('elFontSizeVal');
                            if(fsInput) { fsInput.value = newFontSize; if(fsVal) fsVal.textContent = Math.round(newFontSize); }
                        }
                    }
                    
                    el.style.width = newW + 'px';
                    if (el.classList.contains('canvas-el') && !el.classList.contains('co-neon-block')) {
                        el.style.minHeight = newH + 'px';
                        el.style.height = 'auto';
                    } else {
                        el.style.height = newH + 'px';
                    }
                } else {
                    el.style.width = newW + 'px';
                    el.style.height = newH + 'px';
                }
                
                if (typeof selectedEl !== 'undefined' && selectedEl === el) {
                    const wInput = document.getElementById('elWidth');
                    const wVal = document.getElementById('elWidthVal');
                    const hInput = document.getElementById('elHeight');
                    const hVal = document.getElementById('elHeightVal');
                    if(wInput) { wInput.value = newW; if(wVal) wVal.textContent = Math.round(newW) + 'px'; }
                    if(hInput && el.tagName !== 'IMG') { hInput.value = newH; if(hVal) hVal.textContent = Math.round(newH) + 'px'; }
                }
            }
            
            if (window.selectedElements && window.selectedElements.length > 1) {
                const ratio = Math.max(0.1, newW / (iw || 1));
                window.selectedElements.forEach(selEl => {
                    if (selEl !== el) {
                        const s_w = parseFloat(selEl.dataset.dragStartWidth) || selEl.offsetWidth;
                        const s_h = parseFloat(selEl.dataset.dragStartHeight) || selEl.offsetHeight;
                        selEl.style.width = Math.max(20, Math.round(s_w * ratio)) + 'px';
                        selEl.style.height = Math.max(20, Math.round(s_h * ratio)) + 'px';
                        
                        if (selEl.classList.contains('editable-text') || selEl.classList.contains('canvas-el')) {
                            const s_fs = parseFloat(selEl.dataset.dragStartFontSize) || 16;
                            selEl.style.fontSize = Math.max(8, Math.round(s_fs * ratio)) + 'px';
                        }
                    }
                });
            }
        } else {
            const deltaX = (c.clientX - sx) / window.getGlobalScale();
            const deltaY = (c.clientY - sy) / window.getGlobalScale();
            
            let newL = il + deltaX;
            let newT = it + deltaY;
            
            if (window.getSnapGuides && !multiSelectKey && !resizing) {
                // Determine logic dimensions based on parent container scale if v4
                const rect = el.getBoundingClientRect();
                const snap = window.getSnapGuides(newL + (el.offsetWidth)/2, newT + (el.offsetHeight)/2, el, false);
                newL = snap.x - (el.offsetWidth)/2;
                newT = snap.y - (el.offsetHeight)/2;
                if (window.drawSnapGuides) window.drawSnapGuides(snap.guides);
            }

            el.style.left = newL + 'px';
            el.style.top = newT + 'px';
            el.style.bottom = 'auto';
            el.style.right = 'auto';
            const rot = el.dataset.rotation || 0;
            const scale = el.dataset.scale || 1;
            el.style.transform = `rotate(${rot}deg) scale(${scale})`;
            
            if (window.selectedElements && window.selectedElements.length > 1 && window.selectedElements.includes(el)) {
                window.selectedElements.forEach(selEl => {
                    if (selEl !== el) {
                        const s_il = parseFloat(selEl.dataset.dragStartX) || 0;
                        const s_it = parseFloat(selEl.dataset.dragStartY) || 0;
                        selEl.style.left = (s_il + deltaX) + 'px';
                        selEl.style.top = (s_it + deltaY) + 'px';
                        selEl.style.bottom = 'auto';
                        selEl.style.right = 'auto';
                    }
                });
            }
        }
        });
    }
    function up(){
        if (window.clearSnapGuides) window.clearSnapGuides();
        if(!dragging && !resizing)return;
        dragging=false;
        resizing=false;
        el.classList.remove('dragging');
        const clickDuration=Date.now()-downTime;
        if(!moved && drawMode==='off' && typeof selectElement === 'function') {
            if (!multiSelectKey && (!window.selectedElements || window.selectedElements.length <= 1)) {
                selectElement(el, false, true);
            }
        }
            
            // --- ADDED LOGIC FOR DRAWING STICKINESS AFTER DRAG ---
            if (moved && window.selectedElements) {
                let photoRefUpdated = false;
                let currentRef = typeof window.getCurrentPhotoState === 'function' ? window.getCurrentPhotoState() : null;
                
                window.selectedElements.forEach(selEl => {
                    if (selEl.classList.contains('editable-draw')) {
                        let bL = parseFloat(selEl.dataset.baseLeft) || 0;
                        let bT = parseFloat(selEl.dataset.baseTop) || 0;
                        let newBL = parseFloat(selEl.style.left) || 0;
                        let newBT = parseFloat(selEl.style.top) || 0;
                        selEl.dataset.baseLeft = newBL;
                        selEl.dataset.baseTop = newBT;
                        
                        let deltaL = newBL - bL;
                        let deltaT = newBT - bT;
                        
                        if (typeof drawPaths !== 'undefined' && (deltaL !== 0 || deltaT !== 0)) {
                            const pathObj = drawPaths.find(p => p.el === selEl);
                            if (pathObj && pathObj.points && Array.isArray(pathObj.points)) {
                                pathObj.points.forEach(pt => {
                                    pt.x += deltaL;
                                    pt.y += deltaT;
                                });
                            } else if (pathObj && typeof pathObj.x1 !== 'undefined') {
                                pathObj.x1 += deltaL;
                                pathObj.y1 += deltaT;
                                pathObj.x2 += deltaL;
                                pathObj.y2 += deltaT;
                            }
                        }
                        if (typeof drawPaths !== 'undefined' && currentRef) {
                            const pathObj = drawPaths.find(p => p.el === selEl);
                            if (pathObj) {
                                pathObj.photoRef = currentRef;
                                photoRefUpdated = true;
                            }
                        }
                    }
                });
                if (photoRefUpdated && typeof updateDrawHistory === 'function') {
                    updateDrawHistory();
                }
            }
            if (moved && typeof window.recordHistory === 'function') {
                window.recordHistory('Nesne taşındı/boyutlandırıldı');
            }
    }
    el.addEventListener('mousedown',down);
    el.addEventListener('touchstart',down,{passive:false});
    document.addEventListener('mousemove',move);
    document.addEventListener('touchmove',move,{passive:false});
    document.addEventListener('mouseup',up);
    document.addEventListener('touchend',up);
document.addEventListener('touchcancel',up);
}

window.selectedElements = window.selectedElements || [];
function selectElement(el, isMulti = false, noTabSwitch = false){
    /* removed lock check to allow unlocking */
    if(el && (el.classList.contains('co-neon-block') || el.classList.contains('callout-wrap') || el.classList.contains('svg-callout') || el.classList.contains('callout-item'))) {
        if(typeof selectCalloutEl === 'function') selectCalloutEl(el);
    }
    
    const groupId = el.dataset.groupId;
    if(groupId && !isMulti) {
        deselectAll();
        window.selectedElements = Array.from(document.querySelectorAll(`[data-group-id="${groupId}"]`));
        window.selectedElements.forEach(e => e.classList.add('el-selected'));
        selectedEl = el;
    } else if (groupId && isMulti) {
        const groupEls = Array.from(document.querySelectorAll(`[data-group-id="${groupId}"]`));
        const adding = !window.selectedElements.includes(el);
        groupEls.forEach(e => {
            if (adding) {
                if(!window.selectedElements.includes(e)) {
                    window.selectedElements.push(e);
                    e.classList.add('el-selected');
                }
            } else {
                const idx = window.selectedElements.indexOf(e);
                if(idx > -1) window.selectedElements.splice(idx, 1);
                e.classList.remove('el-selected');
            }
        });
        selectedEl = window.selectedElements.length > 0 ? window.selectedElements[window.selectedElements.length - 1] : null;
        if(window.selectedElements.length === 0) deselectAll();
    } else if(isMulti) {
        if(!window.selectedElements.includes(el)) {
            window.selectedElements.push(el);
            el.classList.add('el-selected');
        }
        selectedEl = window.selectedElements[window.selectedElements.length - 1]; // last one selected is primary
    } else {
        deselectAll();
        window.selectedElements = [el];
        selectedEl=el;
        el.classList.add('el-selected');
    }
    
    // Restore visuals for all selected callouts
    if (window.selectedElements && window.selectedElements.length > 0) {
        window.selectedElements.forEach(selEl => {
            const isCallout = selEl.classList.contains('co-neon-block') || selEl.classList.contains('callout-wrap') || selEl.classList.contains('svg-callout');
            if (isCallout && selEl.dataset.locked !== 'true') {
                if(selEl.classList.contains('co-neon-block')) {
                    selEl.style.outline = '1px dashed rgba(255,255,255,0.4)';
                } 
                
                const ctl = selEl.querySelector('.callout-controls');
                const res = selEl.querySelector('.callout-resizer');
                const rot = selEl.querySelector('.callout-rotator');
                const lk = selEl.querySelector('.callout-lock-btn');
                const brd = selEl.querySelector('.callout-select-border');
                if(ctl) ctl.style.display = 'flex';
                if(res) res.style.display = 'flex';
                if(rot) rot.style.display = 'flex';
                if(lk) lk.style.display = 'flex';
                if(brd) brd.style.display = 'block';
            }
        });
    }

    // Check if grouping is active or can be activated
    if(typeof updateGroupUI === 'function') updateGroupUI();
    if(typeof window.updateMultiSelectUI === 'function') window.updateMultiSelectUI();
    
    if(el.classList.contains('editable-draw') || el.closest('.editable-draw')) {
        const drawEl = el.classList.contains('editable-draw') ? el : el.closest('.editable-draw');
        el = drawEl;
        const isMobile = typeof window.isMobileDevice === 'function' ? window.isMobileDevice() : window.innerWidth <= 768;
        // noTabSwitch true ise (örn. Katmanlar panelinden tıklanmışsa) sekme değiştirme
        if (!noTabSwitch && (!isMobile || window.isLongPressOpen)) {
            if(typeof switchTab === 'function') switchTab('draw');
        }
        if(typeof loadDrawSettings === 'function') loadDrawSettings(el);
        if(!isMulti && (!window.selectedElements || window.selectedElements.length <= 1)) {
            if(typeof showVertexHandles === 'function') showVertexHandles(el);
        } else {
            if(typeof hideVertexHandles === 'function') hideVertexHandles();
        }
        
        // Çizim sekmesinde o çizimi aktif et, geçmiş panelinde vurgula ve düzenleme panelini aç
        if (typeof drawPaths !== 'undefined') {
            const idx = drawPaths.findIndex(p => p.el === el || (p.el && el && (p.el === el || p.el.contains(el) || el.contains(p.el))));
            if (idx > -1) {
                if (typeof window.startDrawEdit === 'function') {
                    window.startDrawEdit(idx, !isMulti, isMulti);
                } else if (typeof startDrawEdit === 'function') {
                    startDrawEdit(idx, !isMulti, isMulti);
                }
            }
        }
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof renderLayers === 'function') renderLayers();
    } else {
        if(document.getElementById('noSelMsg')) document.getElementById('noSelMsg').style.display='none';
        if(document.getElementById('elSettings')) document.getElementById('elSettings').style.display='block';
        if(document.getElementById('elLabel')) document.getElementById('elLabel').textContent=el.dataset.label||'Eleman';
        if(typeof loadElSettings === 'function') loadElSettings(el);
        if(typeof loadElFont === 'function') loadElFont(el);
        if(!noTabSwitch && typeof switchTab === 'function' && !el.classList.contains('co-neon-block') && !el.classList.contains('callout-wrap') && !el.classList.contains('svg-callout') && !el.classList.contains('callout-item')) switchTab('element');
        if (el.classList.contains('canvas-el') && typeof window.addTextHandles === 'function') window.addTextHandles(el);
    }
}

function deselectAll(){
    document.querySelectorAll('.el-selected').forEach(e=>e.classList.remove('el-selected'));
    document.querySelectorAll('.text-handle:not(.text-lock-handle)').forEach(h=>h.remove());
    document.querySelectorAll('.callout-controls, .callout-resizer, .callout-rotator, .callout-select-border').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.callout-lock-btn').forEach(c => c.style.display = 'flex');
    document.querySelectorAll('.co-neon-block').forEach(n => n.style.outline = 'none');
    selectedEl=null;
    window.selectedElements = [];
    if(document.getElementById('noSelMsg')) document.getElementById('noSelMsg').style.display='block';
    if(document.getElementById('elSettings')) document.getElementById('elSettings').style.display='none';
    if(typeof hideVertexHandles === 'function') hideVertexHandles();
    if(typeof window.updateMultiSelectUI === 'function') window.updateMultiSelectUI();
}

function makeDraggable(el){
    // Use the exact same advanced logic for makeDraggable!
    bindDrag(el);
}


window.groupSelected = function() {
    if(!window.selectedElements || window.selectedElements.length < 2) return;
    const groupId = 'group_' + Date.now();
    window.selectedElements.forEach(el => {
        el.dataset.groupId = groupId;
    });
    if(typeof renderLayers === 'function') renderLayers();
    updateGroupUI();
};

window.ungroupSelected = function() {
    if(!window.selectedElements || window.selectedElements.length === 0) return;
    window.selectedElements.forEach(el => {
        delete el.dataset.groupId;
    });
    if(typeof renderLayers === 'function') renderLayers();
    updateGroupUI();
};

window.updateGroupUI = function() {
    if (typeof checkConvertPolygonButton === "function") checkConvertPolygonButton();

    const isLocked = window.selectedElements && window.selectedElements.length > 0 && window.selectedElements[0].dataset.locked === 'true';
    const lockText = isLocked ? '🔓 Kilidi Aç' : '🔒 Kilitle';
    const lockBtns = ['btnLock', 'coBtnLock', 'lpBtnLock', 'drawBtnLock'];
    lockBtns.forEach(id => {
        const b = document.getElementById(id);
        if(b) b.innerHTML = lockText;
    });
    const btnGroup = document.getElementById('btnGroup');
    const btnUngroup = document.getElementById('btnUngroup');
    const lpBtnGroup = document.getElementById('lpBtnGroup');
    const lpBtnUngroup = document.getElementById('lpBtnUngroup');
    const lpGroupActions = document.getElementById('lpGroupActions');
    const coBtnGroup = document.getElementById('coBtnGroup');
    const coBtnUngroup = document.getElementById('coBtnUngroup');
    const drawBtnGroup = document.getElementById('drawBtnGroup');
    const drawBtnUngroup = document.getElementById('drawBtnUngroup');
    
    if(window.selectedElements && window.selectedElements.length > 1) {
        const firstGroup = window.selectedElements[0].dataset.groupId;
        let allSameGroup = firstGroup ? true : false;
        if(firstGroup) {
            for(let i=1; i<window.selectedElements.length; i++) {
                if(window.selectedElements[i].dataset.groupId !== firstGroup) {
                    allSameGroup = false; break;
                }
            }
        }
        if(allSameGroup) {
            if(btnGroup) btnGroup.style.display = 'none';
            if(btnUngroup) btnUngroup.style.display = 'inline-block';
            if(lpBtnGroup) lpBtnGroup.style.display = 'none';
            if(lpBtnUngroup) lpBtnUngroup.style.display = 'inline-block';
            if(lpGroupActions) lpGroupActions.style.display = 'flex';
            if(coBtnGroup) coBtnGroup.style.display = 'none';
            if(coBtnUngroup) coBtnUngroup.style.display = 'inline-block';
            if(drawBtnGroup) drawBtnGroup.style.display = 'none';
            if(drawBtnUngroup) drawBtnUngroup.style.display = 'inline-block';
        } else {
            if(btnGroup) btnGroup.style.display = 'inline-block';
            if(btnUngroup) btnUngroup.style.display = 'none';
            if(lpBtnGroup) lpBtnGroup.style.display = 'inline-block';
            if(lpBtnUngroup) lpBtnUngroup.style.display = 'none';
            if(coBtnGroup) coBtnGroup.style.display = 'inline-block';
            if(coBtnUngroup) coBtnUngroup.style.display = 'none';
            if(drawBtnGroup) drawBtnGroup.style.display = 'inline-block';
            if(drawBtnUngroup) drawBtnUngroup.style.display = 'none';
            if(lpGroupActions) lpGroupActions.style.display = 'flex';
            if(coBtnGroup) coBtnGroup.style.display = 'none';
            if(coBtnUngroup) coBtnUngroup.style.display = 'inline-block';
        }
    } else if (window.selectedElements && window.selectedElements.length === 1) {
        if(btnGroup) btnGroup.style.display = 'none';
        const showUngroup = window.selectedElements[0].dataset.groupId ? 'inline-block' : 'none';
        if(btnUngroup) btnUngroup.style.display = showUngroup;
        if(lpBtnGroup) lpBtnGroup.style.display = 'none';
        if(lpBtnUngroup) lpBtnUngroup.style.display = showUngroup;
        if(coBtnGroup) coBtnGroup.style.display = 'none';
        if(coBtnUngroup) coBtnUngroup.style.display = showUngroup;
        if(drawBtnGroup) drawBtnGroup.style.display = 'none';
        if(drawBtnUngroup) drawBtnUngroup.style.display = showUngroup;
        if(lpGroupActions) lpGroupActions.style.display = showUngroup === 'inline-block' ? 'flex' : 'none';
    } else {
        if(btnGroup) btnGroup.style.display = 'none';
        if(btnUngroup) btnUngroup.style.display = 'none';
        if(lpGroupActions) lpGroupActions.style.display = 'none';
        if(coBtnGroup) coBtnGroup.style.display = 'none';
        if(coBtnUngroup) coBtnUngroup.style.display = 'none';
        if(drawBtnGroup) drawBtnGroup.style.display = 'none';
        if(drawBtnUngroup) drawBtnUngroup.style.display = 'none';
    }
};

window.toggleLockSelected = function() {
    if(!window.selectedElements || window.selectedElements.length === 0) return;
    const isLocked = window.selectedElements[0].dataset.locked === 'true';
    const newState = isLocked ? 'false' : 'true';
    window.selectedElements.forEach(el => {
        el.dataset.locked = newState;
    });
    // Do NOT deselect, so user can see it's selected and unlocked!
    updateGroupUI();
    if(typeof renderLayers === 'function') renderLayers();
    if(window.LayerPanelV2 && window.LayerPanelV2.refresh) window.LayerPanelV2.refresh();
};



// --- CONVERT TO POLYGON ---
function createPolygonFromSelectedLines() {
    if (!window.selectedElements || window.selectedElements.length < 2) return;
    
    // Sadece line (Düz Çizgi) olanları filtrele
    const lines = window.selectedElements.filter(el => {
        if (!el.classList.contains('editable-draw')) return false;
        const pObj = drawPaths.find(p => p.el === el);
        return pObj && pObj.type === 'line';
    });
    
    if (lines.length < 2) {
        alert('Çokgene çevirmek için en az 2 düz çizgi seçili olmalıdır.');
        return;
    }
    
    // Çizgilerin noktalarını topla
    let points = [];
    lines.forEach((el, index) => {
        const pObj = drawPaths.find(p => p.el === el);
        if (pObj) {
            if (pObj.points && pObj.points.length >= 2) {
                points.push({x: pObj.points[0].x, y: pObj.points[0].y});
                points.push({x: pObj.points[pObj.points.length-1].x, y: pObj.points[pObj.points.length-1].y});
            } else if (pObj.x1 !== undefined && pObj.x2 !== undefined) {
                points.push({x: pObj.x1, y: pObj.y1});
                points.push({x: pObj.x2, y: pObj.y2});
            }
        }
    });
    
    // Çizgileri kaldır
    lines.forEach(el => {
        const idx = drawPaths.findIndex(p => p.el === el);
        if (idx > -1) drawPaths.splice(idx, 1);
        if (el.parentNode) el.parentNode.removeChild(el);
    });
    
    // Noktaları birleştirme algoritması
    let orderedPoints = [points[0], points[1]];
    points.splice(0, 2);
    
    while(points.length > 0) {
        let lastPt = orderedPoints[orderedPoints.length - 1];
        let closestIdx = -1;
        let closestDist = Infinity;
        let p1_or_p2 = 0; // 0 for p1, 1 for p2
        
        for(let i=0; i<points.length; i+=2) {
            let d1 = Math.hypot(points[i].x - lastPt.x, points[i].y - lastPt.y);
            let d2 = Math.hypot(points[i+1].x - lastPt.x, points[i+1].y - lastPt.y);
            
            if (d1 < closestDist) { closestDist = d1; closestIdx = i; p1_or_p2 = 0; }
            if (d2 < closestDist) { closestDist = d2; closestIdx = i; p1_or_p2 = 1; }
        }
        
        if (closestIdx !== -1) {
            if (p1_or_p2 === 0) {
                orderedPoints.push(points[closestIdx], points[closestIdx+1]);
            } else {
                orderedPoints.push(points[closestIdx+1], points[closestIdx]);
            }
            points.splice(closestIdx, 2);
        } else {
            break;
        }
    }
    
    // Yeni bir çokgen (polygon) oluştur
    const firstLineObj = drawPaths.find(p => p.el === lines[0]) || { color: '#ef4444', size: 4, opacity: 1 };
    
    const pObj = {
        type: 'polygon',
        closed: true,
        points: orderedPoints,
        color: firstLineObj.color || '#ef4444',
        size: firstLineObj.size || 4,
        opacity: firstLineObj.opacity || 1,
        fillColor: 'transparent',
        fillOpacity: 0
    };
    
    pObj.photoRef = typeof window.getCurrentPhotoState === 'function' ? window.getCurrentPhotoState() : null;
    
    drawPaths.push(pObj);
    if(typeof drawSinglePath === 'function') drawSinglePath(pObj);
    if(typeof createSVGFromPath === 'function') {
        const svgEl = createSVGFromPath(pObj);
        if(svgEl) {
            pObj.el = svgEl;
            const container = getActiveV4Element();
            if(container) container.appendChild(svgEl);
        }
    }
    
    if(typeof updateDrawHistory === 'function') updateDrawHistory();
    deselectAll();
    if(pObj.el && typeof selectElement === 'function') selectElement(pObj.el);
}
