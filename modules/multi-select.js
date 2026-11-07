(function() {
    // Toplu Islemler UI Entegrasyonu
    let multiPanel = null;
    window.multiSelectGap = 14;

    window.setMultiSelectGap = function(val, record = false) {
        let num = parseInt(val);
        if (isNaN(num) || num < 0) num = 0;
        if (num > 300) num = 300;
        window.multiSelectGap = num;

        const displays = document.querySelectorAll('#multi-gap-display, #acm-gap-display');
        displays.forEach(d => { if (d) d.innerText = num + 'px'; });

        const sliders = document.querySelectorAll('#multi-gap-slider, #acm-gap-slider');
        sliders.forEach(s => { if (s && parseInt(s.value) !== num) s.value = num; });

        const inputs = document.querySelectorAll('#multi-gap-val, #acm-gap-val');
        inputs.forEach(inp => { if (inp && parseInt(inp.value) !== num) inp.value = num; });

        if (window.selectedElements && window.selectedElements.length > 1) {
            const dir = window.lastMultiSelectStackDirection || 'vertical';
            window.multiSelectStack(dir, num, record);
        }
    };

    window.stepMultiSelectGap = function(delta) {
        window.setMultiSelectGap((window.multiSelectGap || 14) + delta, true);
    };

    function initMultiSelectUI() {
        if (multiPanel) return;
        const panelContainer = document.querySelector('.panel');
        if (!panelContainer) return;

        multiPanel = document.createElement('details');
        multiPanel.id = 'multi-select-panel';
        multiPanel.className = 'hsl-accordion';
        multiPanel.style.display = 'none';
        multiPanel.style.position = 'sticky';
        multiPanel.style.top = '0';
        multiPanel.style.zIndex = '999';
        multiPanel.style.marginBottom = '12px';
        multiPanel.open = true;

        multiPanel.innerHTML = `
            <summary style="border-left: 3.5px solid #0284c7 !important;">
                <span><i class="fa-solid fa-layer-group" style="color:#0284c7; margin-right:6px;"></i>Toplu İşlemler (<span id="multi-select-count">0</span>)</span>
                <i class="fa-solid fa-chevron-down" style="font-size:11px;"></i>
            </summary>
            <div style="padding:10px;">
                <div class="section-title" style="margin-top:2px; margin-bottom:5px;"><i class="fa-solid fa-up-right-and-down-left-from-center" style="color:#0284c7; margin-right:6px;"></i>Toplu Boyutlandırma</div>
                <div style="display:flex; gap:6px; margin-bottom:10px;">
                    <button type="button" class="btn-action" style="flex:1; height:32px; margin:0 !important; font-size:11.5px;" onclick="window.multiSelectScale(1.15)" title="Tüm seçili öğeleri %15 büyüt"><i class="fa-solid fa-magnifying-glass-plus"></i> Büyüt</button>
                    <button type="button" class="btn-action" style="flex:1; height:32px; margin:0 !important; font-size:11.5px;" onclick="window.multiSelectScale(0.85)" title="Tüm seçili öğeleri %15 küçült"><i class="fa-solid fa-magnifying-glass-minus"></i> Küçült</button>
                </div>
                
                <div class="section-title" style="margin-top:5px; margin-bottom:5px;"><i class="fa-solid fa-arrows-up-down" style="color:#0284c7; margin-right:6px;"></i>Boşluklu Sırala</div>
                
                <div class="slider-group" style="margin-bottom:8px;">
                    <label>
                        <span>Boşluk</span>
                        <span id="multi-gap-display">${window.multiSelectGap || 14}px</span>
                    </label>
                    <input type="range" id="multi-gap-slider" min="0" max="100" value="${window.multiSelectGap || 14}" oninput="window.setMultiSelectGap(this.value, false)" onchange="window.setMultiSelectGap(this.value, true)">
                </div>

                <div style="display:flex; gap:6px; margin-bottom:10px;">
                    <button type="button" class="btn-action" style="flex:1; height:32px; margin:0 !important; font-size:11px;" onclick="window.multiSelectStack('vertical')" title="Öğeleri alt alta eşit boşlukla dizer"><i class="fa-solid fa-bars"></i> Alt Alta Diz</button>
                    <button type="button" class="btn-action" style="flex:1; height:32px; margin:0 !important; font-size:11px;" onclick="window.multiSelectStack('horizontal')" title="Öğeleri yan yana eşit boşlukla dizer"><i class="fa-solid fa-table-columns"></i> Yan Yana Diz</button>
                </div>

                <div class="section-title" style="margin-top:5px; margin-bottom:5px;"><i class="fa-solid fa-arrows-left-right" style="color:#0284c7; margin-right:6px;"></i>Birbirine Göre Hizala</div>
                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:4px; margin-bottom:10px;">
                    <button class="btn-action" style="height:30px; margin:0 !important; font-size:11px;" onclick="multiSelectAlign('left')" title="Sola Hizala"><i class="fa-solid fa-align-left"></i> Sola</button>
                    <button class="btn-action" style="height:30px; margin:0 !important; font-size:11px;" onclick="multiSelectAlign('center')" title="Yatay Ortala"><i class="fa-solid fa-align-center"></i> Ortala</button>
                    <button class="btn-action" style="height:30px; margin:0 !important; font-size:11px;" onclick="multiSelectAlign('right')" title="Sağa Hizala"><i class="fa-solid fa-align-right"></i> Sağa</button>
                    <button class="btn-action" style="height:30px; margin:0 !important; font-size:11px;" onclick="multiSelectAlign('top')" title="Üste Hizala"><i class="fa-solid fa-arrow-up"></i> Üste</button>
                    <button class="btn-action" style="height:30px; margin:0 !important; font-size:11px;" onclick="multiSelectAlign('middle')" title="Dikey Ortala"><i class="fa-solid fa-arrows-up-down"></i> Dikey</button>
                    <button class="btn-action" style="height:30px; margin:0 !important; font-size:11px;" onclick="multiSelectAlign('bottom')" title="Alta Hizala"><i class="fa-solid fa-arrow-down"></i> Alta</button>
                </div>

                <div class="section-title" style="margin-top:5px; margin-bottom:5px;"><i class="fa-solid fa-crosshairs" style="color:#0284c7; margin-right:6px;"></i>Sayfada 9 Yön Konumlandırma</div>
                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:4px; margin-bottom:10px;">
                    <button class="btn-action" style="height:30px; margin:0 !important; font-size:10px;" onclick="multiSelectPositionOnPage('top-left')" title="Sol Üst"><i class="fa-solid fa-arrow-up-long"></i> Sol Üst</button>
                    <button class="btn-action" style="height:30px; margin:0 !important; font-size:10px;" onclick="multiSelectPositionOnPage('top-center')" title="Üst Orta"><i class="fa-solid fa-arrow-up"></i> Üst Orta</button>
                    <button class="btn-action" style="height:30px; margin:0 !important; font-size:10px;" onclick="multiSelectPositionOnPage('top-right')" title="Sağ Üst"><i class="fa-solid fa-arrow-up-long"></i> Sağ Üst</button>
                    <button class="btn-action" style="height:30px; margin:0 !important; font-size:10px;" onclick="multiSelectPositionOnPage('middle-left')" title="Orta Sol"><i class="fa-solid fa-arrow-left"></i> Orta Sol</button>
                    <button class="btn-action" style="height:30px; margin:0 !important; font-size:10px; font-weight:700;" onclick="multiSelectPositionOnPage('center')" title="Tam Sayfa Ortası"><i class="fa-solid fa-crosshairs"></i> Merkez</button>
                    <button class="btn-action" style="height:30px; margin:0 !important; font-size:10px;" onclick="multiSelectPositionOnPage('middle-right')" title="Orta Sağ"><i class="fa-solid fa-arrow-right"></i> Orta Sağ</button>
                    <button class="btn-action" style="height:30px; margin:0 !important; font-size:10px;" onclick="multiSelectPositionOnPage('bottom-left')" title="Sol Alt"><i class="fa-solid fa-arrow-down-long"></i> Sol Alt</button>
                    <button class="btn-action" style="height:30px; margin:0 !important; font-size:10px;" onclick="multiSelectPositionOnPage('bottom-center')" title="Alt Orta"><i class="fa-solid fa-arrow-down"></i> Alt Orta</button>
                    <button class="btn-action" style="height:30px; margin:0 !important; font-size:10px;" onclick="multiSelectPositionOnPage('bottom-right')" title="Sağ Alt"><i class="fa-solid fa-arrow-down-long"></i> Sağ Alt</button>
                </div>

                <div class="section-title" style="margin-top:5px; margin-bottom:5px;"><i class="fa-solid fa-ruler-combined" style="color:#0284c7; margin-right:6px;"></i>Sayfada Ortala &amp; Boşluk Eşitle</div>
                <div style="display:flex; gap:4px; margin-bottom:6px; flex-wrap:wrap;">
                    <button class="btn-action" style="height:30px; margin:0 !important; padding:4px 8px; flex:1; font-size:11px;" onclick="multiSelectCenterOnPage('horizontal')" title="Sayfada Yatay Ortala"><i class="fa-solid fa-arrows-left-right"></i> Sayfa Yatay</button>
                    <button class="btn-action" style="height:30px; margin:0 !important; padding:4px 8px; flex:1; font-size:11px;" onclick="multiSelectCenterOnPage('vertical')" title="Sayfada Dikey Ortala"><i class="fa-solid fa-arrows-up-down"></i> Sayfa Dikey</button>
                </div>
                <div style="display:flex; gap:4px; margin-bottom:10px; flex-wrap:wrap;">
                    <button class="btn-action" style="height:30px; margin:0 !important; padding:4px 8px; flex:1; font-size:11px;" onclick="multiSelectDistribute('vertical')" title="Dikey Eşit Aralık"><i class="fa-solid fa-grip-lines"></i> Dikey Eşitle</button>
                    <button class="btn-action" style="height:30px; margin:0 !important; padding:4px 8px; flex:1; font-size:11px;" onclick="multiSelectDistribute('horizontal')" title="Yatay Eşit Aralık"><i class="fa-solid fa-grip-lines-vertical"></i> Yatay Eşitle</button>
                </div>

                <div class="section-title" style="margin-top:5px; margin-bottom:5px;"><i class="fa-solid fa-layer-group" style="color:#0284c7; margin-right:6px;"></i>Grup &amp; Katman İşlemleri</div>
                <div style="display:flex; gap:4px; margin-bottom:12px; flex-wrap:wrap;">
                    <button class="btn-action" id="msBtnGroup" style="height:30px; margin:0 !important; padding:4px 8px; flex:1;" onclick="if(window.groupSelected) window.groupSelected(); if(window.ThreeDGrouping && typeof window.ThreeDGrouping.groupSelectedElements === 'function') window.ThreeDGrouping.groupSelectedElements();" title="Grup Yap"><i class="fa-solid fa-object-group"></i></button>
                    <button class="btn-action" id="msBtnUngroup" style="height:30px; margin:0 !important; padding:4px 8px; flex:1;" onclick="if(window.ungroupSelected) window.ungroupSelected(); if(window.ThreeDGrouping && typeof window.ThreeDGrouping.ungroupSelectedElements === 'function') window.ThreeDGrouping.ungroupSelectedElements();" title="Grubu Boz"><i class="fa-solid fa-object-ungroup"></i></button>
                    <button class="btn-action" style="height:30px; margin:0 !important; padding:4px 8px; flex:1;" onclick="multiSelectBringToFront()" title="En Öne Getir"><i class="fa-solid fa-arrow-up-from-bracket"></i></button>
                    <button class="btn-action" style="height:30px; margin:0 !important; padding:4px 8px; flex:1;" onclick="multiSelectSendToBack()" title="En Arkaya Gönder"><i class="fa-solid fa-arrow-down-to-bracket"></i></button>
                    <button class="btn-action" style="height:30px; margin:0 !important; padding:4px 8px; flex:1;" onclick="multiSelectDuplicate()" title="Çoğalt"><i class="fa-solid fa-clone"></i></button>
                    <button class="btn-action" style="height:30px; margin:0 !important; padding:4px 8px; flex:1; color:#ef4444; border-color:rgba(239, 68, 68, 0.3);" onclick="multiSelectDelete()" title="Toplu Sil"><i class="fa-solid fa-trash-can"></i></button>
                </div>

                <div class="section-title" style="margin-top:5px; margin-bottom:5px;"><i class="fa-solid fa-palette" style="color:#0284c7; margin-right:6px;"></i>Toplu Renk</div>
                <div class="color-row" style="margin-bottom:0;">
                    <label>Ortak Renk</label>
                    <input type="color" id="multi-color-picker" value="#ffffff" oninput="multiSelectChangeColor(this.value)">
                </div>
            </div>
        `;
        
        panelContainer.insertBefore(multiPanel, panelContainer.firstChild);
    }

    window.updateMultiSelectUI = function() {
        if (!multiPanel) initMultiSelectUI();
        if (!multiPanel) return;

        const count2D = (window.selectedElements && window.selectedElements.length) || 0;
        const sel3D = (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function')
            ? window.ThreeDGrouping.getSelected3DElements()
            : [];
        const count3D = (sel3D && sel3D.length) || 0;
        const totalCount = count2D + count3D;

        const drawPanel = document.getElementById('drawEditPanel');
        const drawTitle = document.getElementById('drawEditAccordionTitle');
        const selectedDrawings = (window.selectedElements || []).filter(el => el && el.classList && el.classList.contains('editable-draw'));
        const drawCount = selectedDrawings.length;

        if (totalCount > 1) {
            multiPanel.style.display = 'block';
            multiPanel.open = true; // Toplu işlemler seçilince varsayılan açık
            const countEl = document.getElementById('multi-select-count');
            if (countEl) {
                if (count2D > 0 && count3D > 0) {
                    countEl.innerText = `${totalCount} (${count2D} Metin/Öge, ${count3D} 3D)`;
                } else {
                    countEl.innerText = totalCount;
                }
            }
            const gapVal = window.multiSelectGap !== undefined ? window.multiSelectGap : 14;
            const gapInp = document.getElementById('multi-gap-val');
            if (gapInp) gapInp.value = gapVal;
            const gapSlider = document.getElementById('multi-gap-slider');
            if (gapSlider) gapSlider.value = gapVal;
            const gapDisplay = document.getElementById('multi-gap-display');
            if (gapDisplay) gapDisplay.innerText = gapVal + 'px';
            if (typeof updateGroupUI === 'function') updateGroupUI();

            // 🎨 Tekil Öge Ayar Akordiyonlarını Gizle (Panel Binişmesini ve Kalabalığı Önler)
            const elSettings = document.getElementById('elSettings');
            if (elSettings) { elSettings.style.display = 'none'; elSettings.open = false; }
            const accDetails = document.getElementById('accordionDetailsEdit');
            if (accDetails) { accDetails.style.display = 'none'; accDetails.open = false; }
            const coPanel = document.getElementById('calloutSettingsPanel');
            if (coPanel) { coPanel.style.display = 'none'; coPanel.open = false; }
            const cbgPanel = document.getElementById('customBadgeSettingsPanel');
            if (cbgPanel) { cbgPanel.style.display = 'none'; }
            const shapePanel = document.getElementById('shapeSettingsPanel');
            if (shapePanel) { shapePanel.style.display = 'none'; }

            // 🎨 Çizim & Neon Ayarları Akordiyonu ile Koordinasyon:
            // Toplu çizim varsa sol paneldeki çizim ayarları da görünür yapılır, ancak kullanıcıyı boğmamak için varsayılan KAPALI gelir
            if (drawPanel) {
                if (drawCount > 0) {
                    drawPanel.style.display = 'block';
                    drawPanel.open = false; // Kullanıcı isterse tıklar müdahale eder, varsayılan kapalı
                    if (drawTitle) {
                        drawTitle.textContent = `Toplu Çizim & Neon Ayarları (${drawCount} Çizim)`;
                    }
                    if (typeof drawPaths !== 'undefined' && drawPaths.length > 0) {
                        const firstDrawEl = selectedDrawings[0];
                        const idx = drawPaths.findIndex(p => p.el === firstDrawEl || (p.id && firstDrawEl.dataset && p.id === firstDrawEl.dataset.pathId));
                        if (idx > -1 && typeof window.syncDrawEditControls === 'function') {
                            window.syncDrawEditControls(idx);
                        }
                    }
                } else {
                    drawPanel.style.display = 'none';
                    drawPanel.open = false;
                }
            }
        } else {
            multiPanel.style.display = 'none';
            multiPanel.open = false;

            if (drawCount === 1) {
                if (drawPanel) {
                    drawPanel.style.display = 'block';
                    drawPanel.open = true; // Tekil seçimde çizim paneli varsayılan açık
                }
            } else if (drawCount === 0 && (!window.selectedEl || !window.selectedEl.classList || !window.selectedEl.classList.contains('editable-draw'))) {
                if (drawPanel && (typeof editingDrawIndex === 'undefined' || editingDrawIndex < 0)) {
                    drawPanel.style.display = 'none';
                    drawPanel.open = false;
                }
            }
        }
    };

    window.multiSelectTextAlign = function(align) {
        if (!window.selectedElements) return;
        window.selectedElements.forEach(el => {
            if (el.classList.contains('editable-text')) {
                el.style.textAlign = align;
            } else {
                const textContent = el.querySelector('.callout-content, .cvi-text');
                if (textContent) textContent.style.textAlign = align;
            }
        });
    };

    window.multiSelectSnapToGrid = function() {
        if (!window.selectedElements) return;
        const gridSize = 20;
        window.selectedElements.forEach(el => {
            const currentLeft = parseFloat(el.style.left) || el.offsetLeft;
            const currentTop = parseFloat(el.style.top) || el.offsetTop;
            
            el.style.left = (Math.round(currentLeft / gridSize) * gridSize) + 'px';
            el.style.top = (Math.round(currentTop / gridSize) * gridSize) + 'px';
            
            if (typeof updateDrawHistory === 'function') updateDrawHistory();
        });
    };

    // 🌟 Çoklu seçim elemanlarını üst taşınabilir ana kapsayıcıya normalize et
    function getValidMultiSelectElements(rawList) {
        let list = rawList;
        if (!list || list.length === 0) {
            list = (window.selectedElements && window.selectedElements.length > 0)
                ? window.selectedElements
                : (window.selectedEl ? [window.selectedEl] : []);
        }
        if (!Array.isArray(list)) list = [list];

        const rootElements = list.filter(Boolean).map(el => {
            if (!el || !el.closest) return el;
            return el.closest('.shape-el, .callout-wrap, .callout-item, .draggable, .canvas-el, .added-icon, [data-layer-uid], .editable-draw, .canva-el, .cvi-item, [data-path-id], [data-path-index], .tb-image-frame') || el;
        }).filter(el => el && el.parentNode && (!el.dataset || el.dataset.locked !== 'true'));

        return Array.from(new Set(rootElements));
    }
    window.getValidMultiSelectElements = getValidMultiSelectElements;

    // 🌟 Çizim elemanının drawPaths içindeki nesnesini hatasız ve toleranslı bul
    function findDrawPathForElement(el) {
        if (!el || typeof drawPaths === 'undefined' || !Array.isArray(drawPaths)) return null;
        const targetEl = (el.classList && el.classList.contains('editable-draw')) ? el : (el.closest ? el.closest('.editable-draw') : el);
        if (!targetEl) return null;
        const pathId = targetEl.dataset ? targetEl.dataset.pathId : null;
        const pathIndex = (targetEl.dataset && targetEl.dataset.pathIndex !== undefined) ? parseInt(targetEl.dataset.pathIndex) : -1;
        
        let pObj = drawPaths.find(p => p.el === targetEl || (pathId && p.id === pathId) || (pathIndex >= 0 && drawPaths[pathIndex] === p));
        if (pObj && pObj.el !== targetEl) {
            pObj.el = targetEl;
        }
        return pObj;
    }
    window.findDrawPathForElement = findDrawPathForElement;

    // 🌟 Tekil öğeyi hedef koordinata taşı ve çizim/neon/3D katmanlarıyla kusursuz eşle
    function applyMoveToItem(item, newL, newT, currPhotoRef) {
        if (!item || !item.el) return;
        const el = item.el;
        const dx = newL - item.l;
        const dy = newT - item.t;
        
        el.style.left = newL + 'px';
        el.style.top = newT + 'px';
        el.style.bottom = 'auto';
        el.style.right = 'auto';

        if (el.classList && el.classList.contains('editable-draw')) {
            el.dataset.baseLeft = newL;
            el.dataset.baseTop = newT;
            el.dataset.dragStartX = newL;
            el.dataset.dragStartY = newT;

            const pObj = findDrawPathForElement(el);
            if (pObj) {
                let tParams = null;
                if (pObj.photoRef && typeof window.calculateTransformParams === 'function' && currPhotoRef) {
                    tParams = window.calculateTransformParams(pObj.photoRef, currPhotoRef);
                }
                const tScale = (tParams && tParams.scale) ? tParams.scale : 1;
                const tDx = (tParams && tParams.dx !== undefined) ? tParams.dx : 0;
                const tDy = (tParams && tParams.dy !== undefined) ? tParams.dy : 0;

                if (pObj.points && Array.isArray(pObj.points)) {
                    pObj.points.forEach(pt => {
                        pt.x = (pt.x * tScale + tDx) + dx;
                        pt.y = (pt.y * tScale + tDy) + dy;
                    });
                }
                if (typeof pObj.x1 !== 'undefined') {
                    pObj.x1 = (pObj.x1 * tScale + tDx) + dx;
                    pObj.y1 = (pObj.y1 * tScale + tDy) + dy;
                    pObj.x2 = (pObj.x2 * tScale + tDx) + dx;
                    pObj.y2 = (pObj.y2 * tScale + tDy) + dy;
                }

                if (currPhotoRef) {
                    pObj.photoRef = currPhotoRef;
                }

                if (typeof originalDrawState !== 'undefined' && originalDrawState && typeof editingDrawIndex !== 'undefined' && editingDrawIndex >= 0 && drawPaths[editingDrawIndex] === pObj) {
                    originalDrawState.photoRef = pObj.photoRef;
                }

                if (pObj.hasSaber && pObj.saberRef && window.SaberEngine && typeof window.SaberEngine.setSaberTransform === 'function') {
                    const rot = (pObj.rotation !== undefined) ? pObj.rotation : (parseFloat(el.dataset.rotation) || 0);
                    const curScale = (pObj.scale !== undefined) ? pObj.scale : (parseFloat(el.dataset.scale) || 1);
                    const baseW = parseFloat(el.dataset.baseWidth) || el.offsetWidth || 0;
                    const baseH = parseFloat(el.dataset.baseHeight) || el.offsetHeight || 0;
                    const cx = newL + baseW / 2;
                    const cy = newT + baseH / 2;
                    window.SaberEngine.setSaberTransform(pObj.saberRef, curScale, 0, 0, false, rot, cx, cy);
                }
            }
        }

        if (el.classList && el.classList.contains('tb-image-frame') && window.Template3DFrame && typeof window.Template3DFrame.applyTransform === 'function') {
            window.Template3DFrame.applyTransform(el);
            if (typeof window.Template3DFrame.updateGizmoPosition === 'function') {
                window.Template3DFrame.updateGizmoPosition(el);
            }
        }
    }

    // 🌟 Çoklu işlem sonrası çizim ve neon (Saber) senkronizasyonu
    function syncMovedDrawElements(items) {
        if (typeof drawPaths === 'undefined' || !items || items.length === 0) return;
        items.forEach(it => {
            const el = it ? (it.el || it) : null;
            if (!el || !el.classList || !el.classList.contains('editable-draw')) return;
            const pObj = findDrawPathForElement(el);
            if (pObj) {
                const pIdx = drawPaths.indexOf(pObj);
                if (typeof window.updateSinglePathSvg === 'function') {
                    window.updateSinglePathSvg(pObj);
                }
                if (pObj.hasSaber && typeof window.applySaberToPath === 'function' && pIdx >= 0) {
                    window.applySaberToPath(pIdx, pObj.saberOptions || window.saberState);
                }
            }
        });
        if (window.SaberEngine) {
            const app = window.SaberEngine.getApp();
            if (app && app.renderer && app.stage) {
                try { app.renderer.render(app.stage); } catch(e) {}
            }
        }
    }
    window.syncMovedDrawElements = syncMovedDrawElements;

    // Akıllı Sıralama & Üst Üste Binmeyi Önleme (Smart Stacking)
    window.multiSelectStack = function(direction = 'vertical', customGap = null, record = true) {
        window.lastMultiSelectStackDirection = direction;
        const elements = getValidMultiSelectElements(window.selectedElements);
        if (elements.length < 2) return;

        const cContainer = document.getElementById('canvas-container');
        const cW = (cContainer && (parseFloat(cContainer.style.width) || cContainer.offsetWidth)) || (typeof uploadedImgW !== 'undefined' ? uploadedImgW : 1920);
        const formatRatio = Math.max(1, cW / 1920);
        const activeGap = (typeof customGap === 'number' && !isNaN(customGap)) ? customGap : (window.multiSelectGap !== undefined ? window.multiSelectGap : 14);
        const gap = Math.round(activeGap * formatRatio);

        let items = elements.map(el => {
            const rect = el.getBoundingClientRect();
            return {
                el,
                l: parseFloat(el.style.left) || parseFloat(el.dataset.baseLeft) || el.offsetLeft || 0,
                t: parseFloat(el.style.top) || parseFloat(el.dataset.baseTop) || el.offsetTop || 0,
                w: el.offsetWidth || (rect ? rect.width : 50) || 50,
                h: el.offsetHeight || (rect ? rect.height : 30) || 30
            };
        });

        let minL = Math.min(...items.map(i => i.l));
        let maxR = Math.max(...items.map(i => i.l + i.w));
        let minT = Math.min(...items.map(i => i.t));
        let maxB = Math.max(...items.map(i => i.t + i.h));
        let centerY = (minT + maxB) / 2;

        const currPhotoRef = (typeof window.getCurrentPhotoState === 'function') ? window.getCurrentPhotoState() : null;

        if (direction === 'vertical') {
            const isCurrentlyHorizontal = (maxR - minL) > (maxB - minT) * 1.2;
            if (isCurrentlyHorizontal) {
                items.sort((a, b) => a.l - b.l);
            } else {
                items.sort((a, b) => a.t - b.t);
            }

            let currentY = minT;
            items.forEach(item => {
                applyMoveToItem(item, minL, currentY, currPhotoRef);
                currentY += item.h + gap;
            });
        } else {
            const isCurrentlyVertical = (maxB - minT) > (maxR - minL) * 1.2;
            if (isCurrentlyVertical) {
                items.sort((a, b) => a.t - b.t);
            } else {
                items.sort((a, b) => a.l - b.l);
            }

            let currentX = minL;
            items.forEach(item => {
                const newT = Math.round(centerY - (item.h / 2));
                applyMoveToItem(item, currentX, newT, currPhotoRef);
                currentX += item.w + gap;
            });
        }

        syncMovedDrawElements(items);
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof renderLayers === 'function') renderLayers();
        if (record && typeof window.recordHistory === 'function') {
            window.recordHistory('Öğeler Sıralandı (' + direction + ')');
        }
        items.forEach(it => {
            if (it.el && it.el.classList && it.el.classList.contains('editable-draw')) {
                if (typeof window.showVertexHandles === 'function' && (document.querySelector('.draw-vertex-handle') || it.el.classList.contains('el-selected') || window.selectedEl === it.el)) {
                    window.showVertexHandles(it.el);
                }
            }
        });
    };

    // Çoklu Hizalama (Birbirine Göre)
    window.multiSelectAlign = function(type) {
        // 🌟 3D Ögeler Seçiliyse: ThreeDAlign motoruna yönlendir
        const sel3D = (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function')
            ? window.ThreeDGrouping.getSelected3DElements()
            : [];
        if (sel3D && sel3D.length >= 2) {
            if (window.ThreeDAlign && typeof window.ThreeDAlign.alignElements === 'function') {
                window.ThreeDAlign.alignElements(sel3D, type);
            }
            return;
        }

        const elements = getValidMultiSelectElements(window.selectedElements);
        if (elements.length < 2) return;

        let minL = Infinity, maxR = -Infinity;
        let minT = Infinity, maxB = -Infinity;

        const items = elements.map(el => {
            const l = parseFloat(el.style.left) || parseFloat(el.dataset.baseLeft) || el.offsetLeft || 0;
            const t = parseFloat(el.style.top) || parseFloat(el.dataset.baseTop) || el.offsetTop || 0;
            const w = el.offsetWidth || parseFloat(el.style.width) || parseFloat(el.dataset.baseWidth) || 50;
            const h = el.offsetHeight || parseFloat(el.style.height) || parseFloat(el.dataset.baseHeight) || 50;
            if (l < minL) minL = l;
            if (l + w > maxR) maxR = l + w;
            if (t < minT) minT = t;
            if (t + h > maxB) maxB = t + h;
            return { el, l, t, w, h };
        });

        const centerX = (minL + maxR) / 2;
        const centerY = (minT + maxB) / 2;
        const currPhotoRef = (typeof window.getCurrentPhotoState === 'function') ? window.getCurrentPhotoState() : null;

        items.forEach(item => {
            let newL = item.l;
            let newT = item.t;

            switch(type) {
                case 'left':
                    newL = minL;
                    break;
                case 'center':
                    newL = Math.round(centerX - (item.w / 2));
                    break;
                case 'right':
                    newL = maxR - item.w;
                    break;
                case 'top':
                    newT = minT;
                    break;
                case 'middle':
                    newT = Math.round(centerY - (item.h / 2));
                    break;
                case 'bottom':
                    newT = maxB - item.h;
                    break;
            }

            applyMoveToItem(item, newL, newT, currPhotoRef);
        });

        syncMovedDrawElements(items);
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof renderLayers === 'function') renderLayers();
        if (typeof window.recordHistory === 'function') window.recordHistory('Öğeler Hizalandı (' + type + ')');
        items.forEach(it => {
            if (it.el && it.el.classList && it.el.classList.contains('editable-draw')) {
                if (typeof window.showVertexHandles === 'function' && (document.querySelector('.draw-vertex-handle') || it.el.classList.contains('el-selected') || window.selectedEl === it.el)) {
                    window.showVertexHandles(it.el);
                }
            }
        });
    };

    // Sayfada / Tuvalde 9 Yön ve Ortaya Konumlandırma
    window.multiSelectPositionOnPage = function(pos) {
        const sel3D = (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function')
            ? window.ThreeDGrouping.getSelected3DElements()
            : [];
        const has3D = sel3D && sel3D.length > 0;

        // 🌟 3D Ögeleri Sayfada Konumlandır
        if (has3D) {
            if (window.ThreeDAlign && typeof window.ThreeDAlign.positionElementsOnPage === 'function') {
                window.ThreeDAlign.positionElementsOnPage(sel3D, pos);
            } else if (window.ThreeDEngine && typeof window.ThreeDEngine.alignElement === 'function') {
                window.ThreeDEngine.alignElement(null, pos);
            }
        }

        // 🌟 2D Ögeleri Belirle: Eğer 3D seçiliyse sadece gerçek çoklu 2D seçim listesini al (bayat selectedEl kalıntısını yok say)
        let raw2D = (window.selectedElements && window.selectedElements.length > 0) ? window.selectedElements : [];
        const elements = raw2D.length > 0 ? getValidMultiSelectElements(raw2D) : (!has3D ? getValidMultiSelectElements() : []);

        if (elements.length === 0) {
            return;
        }

        const cContainer = document.getElementById('canvas-container');
        const cW = (cContainer && (parseFloat(cContainer.style.width) || cContainer.offsetWidth)) || (typeof uploadedImgW !== 'undefined' ? uploadedImgW : 1920);
        const cH = (cContainer && (parseFloat(cContainer.style.height) || cContainer.offsetHeight)) || (typeof uploadedImgH !== 'undefined' ? uploadedImgH : 1080);
        const formatRatio = Math.max(1, cW / 1920);
        const margin = Math.round(40 * formatRatio);

        let minL = Infinity, maxR = -Infinity;
        let minT = Infinity, maxB = -Infinity;

        const items = elements.map(el => {
            const l = parseFloat(el.style.left) || parseFloat(el.dataset.baseLeft) || el.offsetLeft || 0;
            const t = parseFloat(el.style.top) || parseFloat(el.dataset.baseTop) || el.offsetTop || 0;
            const w = el.offsetWidth || parseFloat(el.style.width) || parseFloat(el.dataset.baseWidth) || 50;
            const h = el.offsetHeight || parseFloat(el.style.height) || parseFloat(el.dataset.baseHeight) || 50;
            if (l < minL) minL = l;
            if (l + w > maxR) maxR = l + w;
            if (t < minT) minT = t;
            if (t + h > maxB) maxB = t + h;
            return { el, l, t, w, h };
        });

        const groupW = maxR - minL;
        const groupH = maxB - minT;

        let targetGroupL = minL;
        let targetGroupT = minT;

        switch(pos) {
            case 'top-left':
                targetGroupL = margin;
                targetGroupT = margin;
                break;
            case 'top-center':
                targetGroupL = Math.round((cW - groupW) / 2);
                targetGroupT = margin;
                break;
            case 'top-right':
                targetGroupL = cW - groupW - margin;
                targetGroupT = margin;
                break;
            case 'middle-left':
                targetGroupL = margin;
                targetGroupT = Math.round((cH - groupH) / 2);
                break;
            case 'center':
                targetGroupL = Math.round((cW - groupW) / 2);
                targetGroupT = Math.round((cH - groupH) / 2);
                break;
            case 'middle-right':
                targetGroupL = cW - groupW - margin;
                targetGroupT = Math.round((cH - groupH) / 2);
                break;
            case 'bottom-left':
                targetGroupL = margin;
                targetGroupT = cH - groupH - margin;
                break;
            case 'bottom-center':
                targetGroupL = Math.round((cW - groupW) / 2);
                targetGroupT = cH - groupH - margin;
                break;
            case 'bottom-right':
                targetGroupL = cW - groupW - margin;
                targetGroupT = cH - groupH - margin;
                break;
            case 'horizontal-center':
                targetGroupL = Math.round((cW - groupW) / 2);
                targetGroupT = minT;
                break;
            case 'vertical-center':
                targetGroupL = minL;
                targetGroupT = Math.round((cH - groupH) / 2);
                break;
        }

        const deltaX = targetGroupL - minL;
        const deltaY = targetGroupT - minT;
        const currPhotoRef = (typeof window.getCurrentPhotoState === 'function') ? window.getCurrentPhotoState() : null;

        items.forEach(item => {
            const newL = Math.round(item.l + deltaX);
            const newT = Math.round(item.t + deltaY);
            applyMoveToItem(item, newL, newT, currPhotoRef);
        });

        syncMovedDrawElements(items);
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof renderLayers === 'function') renderLayers();
        if (typeof window.recordHistory === 'function') window.recordHistory('Sayfada Konumlandırıldı (' + pos + ')');
        items.forEach(it => {
            if (it.el && it.el.classList && it.el.classList.contains('editable-draw')) {
                if (typeof window.showVertexHandles === 'function' && (document.querySelector('.draw-vertex-handle') || it.el.classList.contains('el-selected') || window.selectedEl === it.el)) {
                    window.showVertexHandles(it.el);
                }
            }
        });
    };

    // Sayfaya / Tuvale Göre Ortala
    window.multiSelectCenterOnPage = function(axis = 'both') {
        const sel3D = (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function')
            ? window.ThreeDGrouping.getSelected3DElements()
            : [];
        const has3D = sel3D && sel3D.length > 0;
        if (has3D && window.ThreeDAlign && typeof window.ThreeDAlign.centerInPage === 'function') {
            window.ThreeDAlign.centerInPage(sel3D, axis);
        }

        let raw2D = (window.selectedElements && window.selectedElements.length > 0) ? window.selectedElements : [];
        const elements = raw2D.length > 0 ? getValidMultiSelectElements(raw2D) : (!has3D ? getValidMultiSelectElements() : []);

        if (elements.length > 0) {
            if (axis === 'horizontal') window.multiSelectPositionOnPage('horizontal-center');
            else if (axis === 'vertical') window.multiSelectPositionOnPage('vertical-center');
            else window.multiSelectPositionOnPage('center');
        }
    };

    window.multiSelectDistribute = function(axis) {
        // 🌟 3D Ögeler Seçiliyse: ThreeDAlign aralık dağıtım motoruna yönlendir
        const sel3D = (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function')
            ? window.ThreeDGrouping.getSelected3DElements()
            : [];
        if (sel3D && sel3D.length >= 2) {
            if (window.ThreeDAlign && typeof window.ThreeDAlign.distributeElements === 'function') {
                window.ThreeDAlign.distributeElements(sel3D, axis);
            }
            return;
        }

        const elements = getValidMultiSelectElements(window.selectedElements);
        if (elements.length < 2) {
            if (typeof window.showToast === 'function') {
                window.showToast('Dağıtma işlemi için en az 2 öğe seçmelisiniz.', 'warning');
            }
            return;
        }

        let items = elements.map(el => {
            return {
                el,
                l: parseFloat(el.style.left) || parseFloat(el.dataset.baseLeft) || el.offsetLeft || 0,
                t: parseFloat(el.style.top) || parseFloat(el.dataset.baseTop) || el.offsetTop || 0,
                w: el.offsetWidth || parseFloat(el.style.width) || parseFloat(el.dataset.baseWidth) || 50,
                h: el.offsetHeight || parseFloat(el.style.height) || parseFloat(el.dataset.baseHeight) || 50
            };
        });

        const currPhotoRef = (typeof window.getCurrentPhotoState === 'function') ? window.getCurrentPhotoState() : null;

        if (axis === 'horizontal') {
            items.sort((a, b) => a.l - b.l);
            const first = items[0];
            const last = items[items.length - 1];
            const totalSpace = (last.l) - (first.l + first.w);
            let combinedWidth = 0;
            for(let i=1; i<items.length-1; i++) combinedWidth += items[i].w;
            
            let gap = (totalSpace - combinedWidth) / (items.length - 1);
            if (isNaN(gap) || gap < 12) gap = 14;

            let currentX = first.l + first.w + gap;
            for(let i=1; i<items.length-1; i++) {
                applyMoveToItem(items[i], Math.round(currentX), items[i].t, currPhotoRef);
                currentX += items[i].w + gap;
            }
        } else {
            items.sort((a, b) => a.t - b.t);
            const first = items[0];
            const last = items[items.length - 1];
            const totalSpace = (last.t) - (first.t + first.h);
            let combinedHeight = 0;
            for(let i=1; i<items.length-1; i++) combinedHeight += items[i].h;
            
            let gap = (totalSpace - combinedHeight) / (items.length - 1);
            if (isNaN(gap) || gap < 12) gap = 14;

            let currentY = first.t + first.h + gap;
            for(let i=1; i<items.length-1; i++) {
                applyMoveToItem(items[i], items[i].l, Math.round(currentY), currPhotoRef);
                currentY += items[i].h + gap;
            }
        }

        syncMovedDrawElements(items);
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof window.recordHistory === 'function') window.recordHistory('Aralıklar Eşitlendi (' + axis + ')');
        items.forEach(it => {
            if (it.el && it.el.classList && it.el.classList.contains('editable-draw')) {
                if (typeof window.showVertexHandles === 'function' && (document.querySelector('.draw-vertex-handle') || it.el.classList.contains('el-selected') || window.selectedEl === it.el)) {
                    window.showVertexHandles(it.el);
                }
            }
        });
    };

    window.multiSelectDuplicate = function() {
        // 🌟 3D Ögeler Seçiliyse: ThreeDGrouping çoğaltma motorunu çalıştır
        const sel3D = (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function')
            ? window.ThreeDGrouping.getSelected3DElements()
            : [];
        if ((!window.selectedElements || window.selectedElements.length === 0) && sel3D && sel3D.length > 0) {
            if (typeof window.ThreeDGrouping.duplicateSelectedElements === 'function') {
                window.ThreeDGrouping.duplicateSelectedElements();
            }
            return;
        }

        if (!window.selectedElements || window.selectedElements.length === 0) {
            if (window.selectedEl && window.selectedEl.parentNode) window.selectedElements = [window.selectedEl];
            else return;
        }
        
        let newElements = [];
        const targets = Array.from(new Set(window.selectedElements
            .filter(el => el && el.parentNode)
            .map(el => el.closest('.callout-wrap, .draggable, .canvas-el, .added-icon, [data-layer-uid]') || el)
            .filter(el => el && el.parentNode)
        ));
        if (targets.length === 0) return;
        targets.forEach(el => {
            // 🌟 2D Çizim Elemanları İçin Özel Çoğaltma Motoru (WebGL Saber & Noktalar Dahil)
            if (el.classList.contains('editable-draw') || (el.closest && el.closest('.editable-draw'))) {
                const drawEl = el.classList.contains('editable-draw') ? el : el.closest('.editable-draw');
                if (typeof window.duplicateDrawPath === 'function') {
                    const clonedDraw = window.duplicateDrawPath(drawEl, 30);
                    if (clonedDraw) newElements.push(clonedDraw);
                    return;
                }
            }

            const clone = el.cloneNode(true);
            clone.classList.remove('el-selected');
            clone.style.left = (parseFloat(el.style.left || el.offsetLeft) + 20) + 'px';
            clone.style.top = (parseFloat(el.style.top || el.offsetTop) + 20) + 'px';
            
            if (clone.id) clone.id = 'clone_' + Math.random().toString(36).substr(2, 9);
            if (clone.dataset.layerUid) clone.dataset.layerUid = 'layer_' + Math.random().toString(36).substr(2, 9);
            
            // Drag ve bound bayraklarını temizle ki bindDrag engellenmesin
            delete clone.dataset.dragBound;
            delete clone.dataset.bound;
            clone.querySelectorAll('[data-drag-bound]').forEach(c => {
                delete c.dataset.dragBound;
                delete c.dataset.bound;
            });

            // SVG içindeki ID'leri (filtreler, gradyanlar) çakışmayı önlemek için benzersiz yap
            const svgEl = clone.querySelector('svg') || (clone.tagName && clone.tagName.toLowerCase() === 'svg' ? clone : null);
            if (svgEl) {
                const uniqueSuffix = '_' + Math.random().toString(36).substr(2, 6);
                let svgHtml = svgEl.outerHTML;
                const idMatches = svgHtml.match(/id="([^"]+)"/g);
                if (idMatches) {
                    idMatches.forEach(match => {
                        const m = match.match(/id="([^"]+)"/);
                        if (m && m[1]) {
                            const originalId = m[1];
                            const newId = originalId + uniqueSuffix;
                            svgHtml = svgHtml.replace(new RegExp(`id="${originalId}"`, 'g'), `id="${newId}"`);
                            svgHtml = svgHtml.replace(new RegExp(`url\\(#${originalId}\\)`, 'g'), `url(#${newId})`);
                        }
                    });
                    const tempWrap = document.createElement('div');
                    tempWrap.innerHTML = svgHtml;
                    if (tempWrap.firstElementChild) {
                        svgEl.parentNode.replaceChild(tempWrap.firstElementChild, svgEl);
                    }
                }
            }
            
            if (el.parentNode) {
                el.parentNode.appendChild(clone);
            }

            // Callout (SVG veya Neon) yeniden bağlama
            if (clone.classList.contains('callout-wrap') || clone.classList.contains('svg-callout') || clone.querySelector('.callout-item')) {
                if (typeof window.rebindSVGCallout === 'function') {
                    window.rebindSVGCallout(clone);
                }
            } else if (clone.classList.contains('co-neon-block')) {
                if (typeof window.rebindNeonCallout === 'function') {
                    window.rebindNeonCallout(clone);
                }
            }
            
            if (typeof makeDraggable === 'function') {
                makeDraggable(clone);
            }
            if (typeof enableInlineEdit === 'function') {
                enableInlineEdit(clone);
                clone.querySelectorAll('.editable-text, [data-editable], span').forEach(t => enableInlineEdit(t));
            }
            
            clone.querySelectorAll('.text-handle').forEach(h => h.remove());
            newElements.push(clone);
        });
        
        if (typeof deselectAll === 'function') deselectAll();
        
        if (newElements.length === 1) {
            if (typeof selectElement === 'function') {
                selectElement(newElements[0]);
            } else {
                window.selectedElements = [newElements[0]];
                newElements[0].classList.add('el-selected');
            }
        } else if (newElements.length > 1) {
            window.selectedElements = [];
            newElements.forEach(el => {
                if (typeof selectElement === 'function') {
                    selectElement(el, true);
                } else {
                    window.selectedElements.push(el);
                    el.classList.add('el-selected');
                }
            });
        }
        
        if (typeof updateMultiSelectUI === 'function') updateMultiSelectUI();
        if (typeof window.renderLayers === 'function') window.renderLayers();
        if (typeof window.recordHistory === 'function') window.recordHistory('Öğe Çoğaltıldı');
    };

    window.multiSelectDelete = function() {
        // 🌟 3D Ögeler Seçiliyse: ThreeDGrouping silme motorunu çalıştır
        const sel3D = (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function')
            ? window.ThreeDGrouping.getSelected3DElements()
            : [];
        if ((!window.selectedElements || window.selectedElements.length === 0) && sel3D && sel3D.length > 0) {
            if (typeof window.ThreeDGrouping.deleteSelectedElements === 'function') {
                window.ThreeDGrouping.deleteSelectedElements();
            }
            return;
        }

        if (!window.selectedElements || window.selectedElements.length === 0) return;
        
        let toDelete = [...window.selectedElements].filter(el => el.dataset.locked !== 'true');
        if (toDelete.length === 0) {
            if (typeof window.showToast === 'function') {
                window.showToast('Kilitli öğeler silinemez', 'warning');
            }
            return;
        }

        // Önce editingDrawIndex'i sıfırla ki deselectAll çağrıldığında saveDrawEdit ögeyi diriltmesin
        if (typeof editingDrawIndex !== 'undefined') editingDrawIndex = -1;
        if (typeof originalDrawState !== 'undefined') originalDrawState = null;

        if (typeof deselectAll === 'function') deselectAll();
        
        toDelete.forEach(el => {
            if (window.SaberEngine && typeof window.SaberEngine.removeTextSaber === 'function') {
                window.SaberEngine.removeTextSaber(el);
            }
            el.remove();
            if (typeof drawPaths !== 'undefined') {
                const idx = drawPaths.findIndex(p => p.el === el || (p.id && el.dataset && p.id === el.dataset.pathId));
                if (idx > -1) {
                    if (typeof window.deleteDrawItem === 'function') {
                        window.deleteDrawItem(idx);
                    } else {
                        const p = drawPaths[idx];
                        if (p.hasSaber && typeof window.removeSaberFromPath === 'function') {
                            window.removeSaberFromPath(idx);
                        }
                        drawPaths.splice(idx, 1);
                    }
                }
            }
        });
        
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof window.recordHistory === 'function') window.recordHistory('Toplu Silme');
        if (typeof window.renderLayers === 'function') window.renderLayers();
        window.updateMultiSelectUI();
    };

    window.multiSelectChangeColor = function(color) {
        if (!window.selectedElements) return;
        window.selectedElements.forEach(el => {
            if (el.classList.contains('editable-text') || el.classList.contains('canvas-el') || el.classList.contains('cvi-item')) {
                el.style.color = color;
            }
            if (el.classList.contains('shape-el')) {
                const svg = el.querySelector('svg');
                if (svg) {
                    const shapes = svg.querySelectorAll('path, polygon, rect, ellipse, line, circle, polyline');
                    shapes.forEach(shape => {
                        if (shape.hasAttribute('fill') && shape.getAttribute('fill') !== 'none') {
                            shape.setAttribute('fill', color);
                        }
                        if (shape.hasAttribute('stroke') && shape.getAttribute('stroke') !== 'none') {
                            shape.setAttribute('stroke', color);
                        }
                    });
                }
            }
            if (el.classList.contains('callout-wrap') || el.classList.contains('callout-item')) {
                const item = el.classList.contains('callout-item') ? el : el.querySelector('.callout-item');
                if (item) {
                    item.style.color = color;
                    item.dataset.coTextColor = color;
                }
            }
            if (el.classList.contains('editable-draw')) {
                if (typeof drawPaths !== 'undefined') {
                    const pIdx = drawPaths.findIndex(p => p.el === el || (p.id && el.dataset && p.id === el.dataset.pathId));
                    if (pIdx > -1) {
                        const p = drawPaths[pIdx];
                        p.color = color;
                        if (p.hasSaber || p.saber) {
                            const glowInt = parseInt(color.replace('#', ''), 16) || 0x00CEC9;
                            p.saberOptions = p.saberOptions || {};
                            p.saberOptions.glowColor = glowInt;
                            if (window.applySaberToPath) {
                                window.applySaberToPath(pIdx, p.saberOptions);
                            }
                        } else {
                            if (typeof updateSinglePathSvg === 'function') {
                                updateSinglePathSvg(p);
                            }
                        }
                    }
                }
                const svg = el.querySelector('svg');
                if (svg) {
                    const shapes = svg.querySelectorAll('path, polygon, rect, ellipse, line, circle, polyline');
                    shapes.forEach(shape => {
                        if(shape.hasAttribute('stroke') && shape.getAttribute('stroke') !== 'none') {
                            shape.setAttribute('stroke', color);
                        }
                    });
                }
            }
        });

        // 🌟 Seçili 3D ögelerin de rengini güncelle
        if (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function') {
            const multi3D = window.ThreeDGrouping.getSelected3DElements();
            if (multi3D && multi3D.length > 0) {
                multi3D.forEach(item => {
                    if (item && window.ThreeDEngine && typeof window.ThreeDEngine.setElementColor === 'function') {
                        window.ThreeDEngine.setElementColor(item, color);
                    }
                });
            }
        }
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
    };

    window.multiSelectBringToFront = function() {
        const sel3D = (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function')
            ? window.ThreeDGrouping.getSelected3DElements()
            : [];
        if ((!window.selectedElements || window.selectedElements.length === 0) && sel3D && sel3D.length > 0) {
            sel3D.forEach(el => {
                if (window.ThreeDEngine && typeof window.ThreeDEngine.bringElementToFront === 'function') {
                    window.ThreeDEngine.bringElementToFront(el);
                }
            });
            return;
        }

        const elements = getValidMultiSelectElements(window.selectedElements);
        if (!elements.length) return;
        elements.forEach(el => {
            const parent = el.parentNode;
            if (parent) {
                parent.appendChild(el);
            }
            if (el.classList.contains('editable-draw') && typeof drawPaths !== 'undefined') {
                const pObj = findDrawPathForElement(el);
                if (pObj) {
                    const idx = drawPaths.indexOf(pObj);
                    if (idx > -1 && idx < drawPaths.length - 1) {
                        drawPaths.splice(idx, 1);
                        drawPaths.push(pObj);
                    }
                }
            }
        });
        if (typeof drawPaths !== 'undefined') {
            drawPaths.forEach((item, i) => { if (item.el) item.el.dataset.pathIndex = i; });
        }
        if (typeof window.getCanvasLayersList === 'function' && typeof window.applyCanvasLayersOrder === 'function') {
            try {
                const layers = window.getCanvasLayersList();
                if (layers && layers.length > 0) {
                    const selectedSet = new Set(elements);
                    const front = layers.filter(l => l.el && selectedSet.has(l.el));
                    const others = layers.filter(l => !l.el || !selectedSet.has(l.el));
                    window.applyCanvasLayersOrder([...front, ...others]);
                }
            } catch(e) {}
        }
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof renderLayers === 'function') renderLayers();
    };

    window.multiSelectSendToBack = function() {
        const sel3D = (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function')
            ? window.ThreeDGrouping.getSelected3DElements()
            : [];
        if ((!window.selectedElements || window.selectedElements.length === 0) && sel3D && sel3D.length > 0) {
            sel3D.forEach(el => {
                if (window.ThreeDEngine && typeof window.ThreeDEngine.sendElementToBack === 'function') {
                    window.ThreeDEngine.sendElementToBack(el);
                }
            });
            return;
        }

        const elements = getValidMultiSelectElements(window.selectedElements);
        if (!elements.length) return;
        [...elements].reverse().forEach(el => {
            const parent = el.parentNode;
            if (parent && parent.firstChild) {
                parent.insertBefore(el, parent.firstChild);
            }
            if (el.classList.contains('editable-draw') && typeof drawPaths !== 'undefined') {
                const pObj = findDrawPathForElement(el);
                if (pObj) {
                    const idx = drawPaths.indexOf(pObj);
                    if (idx > 0) {
                        drawPaths.splice(idx, 1);
                        drawPaths.unshift(pObj);
                    }
                }
            }
        });
        if (typeof drawPaths !== 'undefined') {
            drawPaths.forEach((item, i) => { if (item.el) item.el.dataset.pathIndex = i; });
        }
        if (typeof window.getCanvasLayersList === 'function' && typeof window.applyCanvasLayersOrder === 'function') {
            try {
                const layers = window.getCanvasLayersList();
                if (layers && layers.length > 0) {
                    const selectedSet = new Set(elements);
                    const back = layers.filter(l => l.el && selectedSet.has(l.el));
                    const others = layers.filter(l => !l.el || !selectedSet.has(l.el));
                    window.applyCanvasLayersOrder([...others, ...back]);
                }
            } catch(e) {}
        }
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof renderLayers === 'function') renderLayers();
    };

    window.multiSelectToggleLock = function() {
        const sel3D = (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function')
            ? window.ThreeDGrouping.getSelected3DElements()
            : [];
        if ((!window.selectedElements || window.selectedElements.length === 0) && sel3D && sel3D.length > 0) {
            const anyUnlocked = sel3D.some(el => !el.locked);
            sel3D.forEach(el => { el.locked = anyUnlocked; });
            return;
        }

        const elements = getValidMultiSelectElements(window.selectedElements);
        if (!elements || elements.length === 0) return;
        const anyUnlocked = elements.some(el => el.dataset.locked !== 'true');
        const newState = anyUnlocked ? 'true' : 'false';
        elements.forEach(el => {
            el.dataset.locked = newState;
            if (newState === 'true') {
                el.classList.add('locked-el');
            } else {
                el.classList.remove('locked-el');
            }
        });
        if (typeof updateGroupUI === 'function') updateGroupUI();
        if (typeof renderLayers === 'function') renderLayers();
    };

    window.multiSelectRotate = function(deltaDeg = 90) {
        const sel3D = (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function')
            ? window.ThreeDGrouping.getSelected3DElements()
            : [];
        if ((!window.selectedElements || window.selectedElements.length === 0) && sel3D && sel3D.length > 0) {
            sel3D.forEach(el => {
                const cur = el.planeLocalRot || 0;
                let next = Math.round(cur / 90) * 90 + deltaDeg;
                while (next > 180) next -= 360;
                while (next < -180) next += 360;
                el.planeLocalRot = next;
                if (window.ThreeDEngine) {
                    if (typeof window.ThreeDEngine.updatePlaneTransform === 'function') window.ThreeDEngine.updatePlaneTransform(el);
                    if (typeof window.ThreeDEngine.updateContentTransform === 'function') window.ThreeDEngine.updateContentTransform(el);
                }
            });
            if (window.ThreeDEngine) {
                if (typeof window.ThreeDEngine.updateGizmoPositions === 'function') window.ThreeDEngine.updateGizmoPositions();
                if (typeof window.ThreeDEngine.syncControlsUI === 'function') window.ThreeDEngine.syncControlsUI();
                if (typeof window.ThreeDEngine.requestRender === 'function') window.ThreeDEngine.requestRender();
            }
            if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                window.ThreeDGrouping.updateSelectionVisuals();
            }
            return;
        }

        const targets = getValidMultiSelectElements(window.selectedElements);
        if (!targets || targets.length === 0) return;
        targets.forEach(el => {
            const curRot = parseFloat(el.dataset.rotation) || 0;
            let newRot = (curRot + deltaDeg) % 360;
            if (newRot > 180) newRot -= 360;
            else if (newRot < -180) newRot += 360;
            newRot = Math.round(newRot);
            el.dataset.rotation = newRot;
            const curScale = el.dataset.scale || 1;
            el.style.transform = `rotate(${newRot}deg) scale(${curScale})`;
            if (el.classList.contains('editable-draw') && typeof drawPaths !== 'undefined') {
                const p = findDrawPathForElement(el);
                if (p) p.rotation = newRot;
            }
        });
        syncMovedDrawElements(targets);
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof renderLayers === 'function') renderLayers();
        if (typeof window.recordHistory === 'function') window.recordHistory('Toplu Döndürme');
        targets.forEach(el => {
            if (el && el.classList && el.classList.contains('editable-draw')) {
                if (typeof window.showVertexHandles === 'function' && (document.querySelector('.draw-vertex-handle') || el.classList.contains('el-selected') || window.selectedEl === el)) {
                    window.showVertexHandles(el);
                }
            }
        });
    };

    /**
     * 🌟 Sadece 2D Elemanları (çizim, metin, rozet, callout, görsel çerçeve vb.) Orantılı Boyutlandırır
     */
    window.multiSelectScale2DElements = function(factor = 1.1, customTargets = null) {
        const rawList = customTargets || window.selectedElements;
        const targets = getValidMultiSelectElements(rawList);
        if (!targets || targets.length === 0) return;

        // 1. Calculate bounding box of all targets to find the group center
        let minL = Infinity, maxR = -Infinity;
        let minT = Infinity, maxB = -Infinity;

        targets.forEach(el => {
            const l = parseFloat(el.style.left) || parseFloat(el.dataset.baseLeft) || el.offsetLeft || 0;
            const t = parseFloat(el.style.top) || parseFloat(el.dataset.baseTop) || el.offsetTop || 0;
            const w = el.offsetWidth || parseFloat(el.style.width) || parseFloat(el.dataset.baseWidth) || 50;
            const h = el.offsetHeight || parseFloat(el.style.height) || parseFloat(el.dataset.baseHeight) || 50;
            if (l < minL) minL = l;
            if (l + w > maxR) maxR = l + w;
            if (t < minT) minT = t;
            if (t + h > maxB) maxB = t + h;
        });

        const centerX = (minL + maxR) / 2;
        const centerY = (minT + maxB) / 2;
        const currPhotoRef = (typeof window.getCurrentPhotoState === 'function') ? window.getCurrentPhotoState() : null;

        targets.forEach(el => {
            const curL = parseFloat(el.style.left) || parseFloat(el.dataset.baseLeft) || el.offsetLeft || 0;
            const curT = parseFloat(el.style.top) || parseFloat(el.dataset.baseTop) || el.offsetTop || 0;
            const curW = el.offsetWidth || parseFloat(el.style.width) || parseFloat(el.dataset.baseWidth) || 100;
            const curH = el.offsetHeight || parseFloat(el.style.height) || parseFloat(el.dataset.baseHeight) || 100;
            
            const newW = Math.max(20, Math.round(curW * factor));
            const newH = Math.max(20, Math.round(curH * factor));
            
            // Adjust position relative to group center if multiple items
            let newLeft, newTop;
            if (targets.length > 1) {
                const elCenterX = curL + curW / 2;
                const elCenterY = curT + curH / 2;
                const newElCenterX = centerX + (elCenterX - centerX) * factor;
                const newElCenterY = centerY + (elCenterY - centerY) * factor;
                newLeft = Math.round(newElCenterX - newW / 2);
                newTop = Math.round(newElCenterY - newH / 2);
            } else {
                const elCenterX = curL + curW / 2;
                const elCenterY = curT + curH / 2;
                newLeft = Math.round(elCenterX - newW / 2);
                newTop = Math.round(elCenterY - newH / 2);
            }
            el.style.left = newLeft + 'px';
            el.style.top = newTop + 'px';

            // Scale dimensions
            if (el.querySelector('img') || el.tagName === 'IMG') {
                el.style.width = newW + 'px';
                el.style.height = 'auto';
            } else if (el.classList.contains('editable-text') || el.classList.contains('canvas-el') || el.classList.contains('brand-element')) {
                const curFs = parseFloat(window.getComputedStyle(el).fontSize) || 16;
                el.style.fontSize = Math.max(8, Math.round(curFs * factor)) + 'px';
                el.style.width = 'auto';
                el.style.height = 'auto';
            } else {
                el.style.width = newW + 'px';
                el.style.height = newH + 'px';
            }

            if (el.classList.contains('callout-wrap') || el.classList.contains('svg-callout') || el.classList.contains('co-neon-block')) {
                const item = el.querySelector('.callout-item, .callout-svg-container');
                if (item) {
                    item.style.width = '100%';
                    item.style.height = '100%';
                }
                const svg = el.querySelector('svg');
                if (svg) {
                    svg.setAttribute('preserveAspectRatio', 'none');
                }
                el.dataset.customW = newW;
                el.dataset.customH = newH;
                const innerText = el.querySelector('.callout-text, .badge-text, .co-neon-text');
                if (innerText) {
                    const curInnerFs = parseFloat(window.getComputedStyle(innerText).fontSize) || 14;
                    innerText.style.fontSize = Math.max(8, Math.round(curInnerFs * factor)) + 'px';
                }
            }

            if (el.classList.contains('tb-image-frame')) {
                if (window.Template3DFrame && typeof window.Template3DFrame.applyTransform === 'function') {
                    window.Template3DFrame.applyTransform(el);
                    if (typeof window.Template3DFrame.updateGizmoPosition === 'function') {
                        window.Template3DFrame.updateGizmoPosition(el);
                    }
                }
            }

            if (el.classList.contains('editable-draw') && typeof drawPaths !== 'undefined') {
                const pObj = findDrawPathForElement(el);
                if (pObj) {
                    el.dataset.baseLeft = newLeft;
                    el.dataset.baseTop = newTop;
                    el.dataset.baseWidth = newW;
                    el.dataset.baseHeight = newH;

                    const itemCenterX = curL + curW / 2;
                    const itemCenterY = curT + curH / 2;
                    const newElCenterX = targets.length > 1 ? (centerX + (itemCenterX - centerX) * factor) : itemCenterX;
                    const newElCenterY = targets.length > 1 ? (centerY + (itemCenterY - centerY) * factor) : itemCenterY;

                    if (Array.isArray(pObj.points) && pObj.points.length > 0) {
                        pObj.points.forEach(pt => {
                            pt.x = newElCenterX + (pt.x - itemCenterX) * factor;
                            pt.y = newElCenterY + (pt.y - itemCenterY) * factor;
                            if (pt.cpIn) {
                                pt.cpIn.x = newElCenterX + (pt.cpIn.x - itemCenterX) * factor;
                                pt.cpIn.y = newElCenterY + (pt.cpIn.y - itemCenterY) * factor;
                            }
                            if (pt.cpOut) {
                                pt.cpOut.x = newElCenterX + (pt.cpOut.x - itemCenterX) * factor;
                                pt.cpOut.y = newElCenterY + (pt.cpOut.y - itemCenterY) * factor;
                            }
                        });
                    }
                    if (pObj.x1 !== undefined && pObj.x2 !== undefined) {
                        pObj.x1 = newElCenterX + (pObj.x1 - itemCenterX) * factor;
                        pObj.y1 = newElCenterY + (pObj.y1 - itemCenterY) * factor;
                        pObj.x2 = newElCenterX + (pObj.x2 - itemCenterX) * factor;
                        pObj.y2 = newElCenterY + (pObj.y2 - itemCenterY) * factor;
                    }
                    if (currPhotoRef) {
                        pObj.photoRef = currPhotoRef;
                    }
                    if (typeof window.refreshDrawElement === 'function') {
                        window.refreshDrawElement(pObj);
                    }
                }
            }
        });

        syncMovedDrawElements(window.selectedElements || targets);
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof renderLayers === 'function') renderLayers();
        if (typeof window.recordHistory === 'function') window.recordHistory('Toplu Boyutlandırma');

        targets.forEach(el => {
            if (el && el.classList && el.classList.contains('editable-draw')) {
                if (typeof window.showVertexHandles === 'function' && (document.querySelector('.draw-vertex-handle') || el.classList.contains('el-selected') || window.selectedEl === el)) {
                    window.showVertexHandles(el);
                }
            }
        });

        if (window.SaberEngine && typeof window.SaberEngine.updateTextSaberPositions === 'function') {
            window.SaberEngine.updateTextSaberPositions();
        }
        if (window.SaberEngine && typeof window.SaberEngine.getApp === 'function') {
            const sApp = window.SaberEngine.getApp();
            if (sApp && sApp.renderer && sApp.stage) {
                try { sApp.renderer.render(sApp.stage); } catch(e) {}
            }
        }
    };

    /**
     * 🌟 Hibrit Çoklu Boyutlandırma (2D & 3D Birleşik)
     */
    window.multiSelectScale = function(factor = 1.1) {
        // 1. Seçili 3D ögeleri orantılı boyutlandır
        let sel3D = [];
        if (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function') {
            sel3D = (window.ThreeDGrouping.getSelected3DElements() || []).slice();
        }
        if (window.ThreeDEngine && typeof window.ThreeDEngine.getActiveElement === 'function') {
            const activeEl = window.ThreeDEngine.getActiveElement();
            const is3DActive = (typeof window.ThreeDEngine.is3DSelected === 'function')
                ? window.ThreeDEngine.is3DSelected()
                : true;
            if (activeEl && is3DActive && !sel3D.some(e => e.id === activeEl.id)) {
                sel3D.push(activeEl);
            }
        }

        if (sel3D.length > 0) {
            sel3D.forEach(item => {
                const oldSc = item.planeScale || 1.0;
                const newSc = Math.max(0.15, Math.min(5.0, parseFloat((oldSc * factor).toFixed(3))));
                item.planeScale = newSc;
                if (window.ThreeDEngine) {
                    if (typeof window.ThreeDEngine.updatePlaneTransform === 'function') {
                        window.ThreeDEngine.updatePlaneTransform(item);
                    }
                    if (typeof window.ThreeDEngine.updateContentTransform === 'function') {
                        window.ThreeDEngine.updateContentTransform(item);
                    }
                }
            });

            // Aktif öge güncellendiyse ThreeDEngine state ve UI'ı eşitle
            if (window.ThreeDEngine && typeof window.ThreeDEngine.getActiveElement === 'function') {
                const act = window.ThreeDEngine.getActiveElement();
                if (act && act.planeScale) {
                    if (typeof window.ThreeDEngine.syncControlsUI === 'function') {
                        window.ThreeDEngine.syncControlsUI();
                    }
                }
            }
            if (window.ThreeDEngine && typeof window.ThreeDEngine.updateGizmoPositions === 'function') {
                window.ThreeDEngine.updateGizmoPositions();
            }
            if (window.ThreeDEngine && typeof window.ThreeDEngine.requestRender === 'function') {
                window.ThreeDEngine.requestRender();
            }
            if (window.ThreeDGrouping && typeof window.ThreeDGrouping.updateSelectionVisuals === 'function') {
                window.ThreeDGrouping.updateSelectionVisuals();
            }
        }

        // 2. Seçili 2D ögeleri boyutlandır
        if (window.selectedElements && window.selectedElements.length > 0) {
            window.multiSelectScale2DElements(factor);
        }
    };

    document.addEventListener('DOMContentLoaded', initMultiSelectUI);
})();

