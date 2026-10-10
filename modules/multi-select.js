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

        multiPanel = document.createElement('div');
        multiPanel.id = 'multi-select-panel';
        multiPanel.style.display = 'none';
        multiPanel.style.padding = '15px';
        multiPanel.style.backgroundColor = 'var(--dark-2)';
        multiPanel.style.borderBottom = '1px solid var(--dark-3)';
        multiPanel.style.position = 'sticky';
        multiPanel.style.top = '0';
        multiPanel.style.zIndex = '999';
        multiPanel.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';

        multiPanel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h3 style="margin:0; font-size:14px; color:var(--primary);"><i class="fas fa-layer-group"></i> Toplu İşlemler (<span id="multi-select-count">0</span>)</h3>
            </div>
            
            <div class="section-title" style="margin-top:5px; margin-bottom:5px;"><i class="fa-solid fa-up-right-and-down-left-from-center" style="color:#0284c7; margin-right:6px;"></i>Toplu Boyutlandırma</div>
            <div style="display:flex; gap:6px; margin-bottom:10px;">
                <button type="button" class="tab-btn" style="flex:1; padding:6px 8px; font-size:11px;" onclick="window.multiSelectScale(1.15)" title="Tüm seçili öğeleri %15 büyüt"><i class="fa-solid fa-magnifying-glass-plus"></i> Büyüt</button>
                <button type="button" class="tab-btn" style="flex:1; padding:6px 8px; font-size:11px;" onclick="window.multiSelectScale(0.85)" title="Tüm seçili öğeleri %15 küçült"><i class="fa-solid fa-magnifying-glass-minus"></i> Küçült</button>
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
                <button type="button" class="tab-btn" style="flex:1; padding:6px 8px; font-size:11px;" onclick="window.multiSelectStack('vertical')" title="Öğeleri alt alta eşit boşlukla dizer"><i class="fa-solid fa-bars"></i> Alt Alta Diz</button>
                <button type="button" class="tab-btn" style="flex:1; padding:6px 8px; font-size:11px;" onclick="window.multiSelectStack('horizontal')" title="Öğeleri yan yana eşit boşlukla dizer"><i class="fa-solid fa-table-columns"></i> Yan Yana Diz</button>
            </div>

            <div class="section-title" style="margin-top:5px; margin-bottom:5px;"><i class="fa-solid fa-arrows-left-right" style="color:#0284c7; margin-right:6px;"></i>Birbirine Göre Hizala</div>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:4px; margin-bottom:10px;">
                <button class="tab-btn" style="padding:5px 4px; font-size:11px;" onclick="multiSelectAlign('left')" title="Sola Hizala"><i class="fas fa-align-left"></i> Sola</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:11px;" onclick="multiSelectAlign('center')" title="Yatay Ortala"><i class="fas fa-align-center"></i> Ortala</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:11px;" onclick="multiSelectAlign('right')" title="Sağa Hizala"><i class="fas fa-align-right"></i> Sağa</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:11px;" onclick="multiSelectAlign('top')" title="Üste Hizala"><i class="fas fa-arrow-up"></i> Üste</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:11px;" onclick="multiSelectAlign('middle')" title="Dikey Ortala"><i class="fas fa-arrows-alt-v"></i> Dikey</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:11px;" onclick="multiSelectAlign('bottom')" title="Alta Hizala"><i class="fas fa-arrow-down"></i> Alta</button>
            </div>

            <div class="section-title" style="margin-top:5px; margin-bottom:5px;"><i class="fa-solid fa-crosshairs" style="color:#0284c7; margin-right:6px;"></i>Sayfada 9 Yön Konumlandırma</div>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:4px; margin-bottom:10px;">
                <button class="tab-btn" style="padding:5px 4px; font-size:10px;" onclick="multiSelectPositionOnPage('top-left')" title="Sol Üst"><i class="fas fa-arrow-up-left"></i> Sol Üst</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:10px;" onclick="multiSelectPositionOnPage('top-center')" title="Üst Orta"><i class="fas fa-arrow-up"></i> Üst Orta</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:10px;" onclick="multiSelectPositionOnPage('top-right')" title="Sağ Üst"><i class="fas fa-arrow-up-right"></i> Sağ Üst</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:10px;" onclick="multiSelectPositionOnPage('middle-left')" title="Orta Sol"><i class="fas fa-arrow-left"></i> Orta Sol</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:10px; font-weight:600;" onclick="multiSelectPositionOnPage('center')" title="Tam Sayfa Ortası"><i class="fas fa-crosshairs"></i> Merkez</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:10px;" onclick="multiSelectPositionOnPage('middle-right')" title="Orta Sağ"><i class="fas fa-arrow-right"></i> Orta Sağ</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:10px;" onclick="multiSelectPositionOnPage('bottom-left')" title="Sol Alt"><i class="fas fa-arrow-down-left"></i> Sol Alt</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:10px;" onclick="multiSelectPositionOnPage('bottom-center')" title="Alt Orta"><i class="fas fa-arrow-down"></i> Alt Orta</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:10px;" onclick="multiSelectPositionOnPage('bottom-right')" title="Sağ Alt"><i class="fas fa-arrow-down-right"></i> Sağ Alt</button>
            </div>

            <div class="section-title" style="margin-top:5px; margin-bottom:5px;"><i class="fa-solid fa-ruler-combined" style="color:#0284c7; margin-right:6px;"></i>Sayfada Ortala & Boşluk Eşitle</div>
            <div style="display:flex; gap:4px; margin-bottom:6px; flex-wrap:wrap;">
                <button class="tab-btn" style="padding:4px 8px; flex:1; font-size:11px;" onclick="multiSelectCenterOnPage('horizontal')" title="Sayfada Yatay Ortala"><i class="fas fa-arrows-alt-h"></i> Sayfa Yatay</button>
                <button class="tab-btn" style="padding:4px 8px; flex:1; font-size:11px;" onclick="multiSelectCenterOnPage('vertical')" title="Sayfada Dikey Ortala"><i class="fas fa-arrows-alt-v"></i> Sayfa Dikey</button>
            </div>
            <div style="display:flex; gap:4px; margin-bottom:10px; flex-wrap:wrap;">
                <button class="tab-btn" style="padding:4px 8px; flex:1; font-size:11px;" onclick="multiSelectDistribute('vertical')" title="Dikey Eşit Aralık"><i class="fas fa-grip-lines"></i> Dikey Eşitle</button>
                <button class="tab-btn" style="padding:4px 8px; flex:1; font-size:11px;" onclick="multiSelectDistribute('horizontal')" title="Yatay Eşit Aralık"><i class="fas fa-grip-lines-vertical"></i> Yatay Eşitle</button>
            </div>

            <div class="section-title" style="margin-top:5px; margin-bottom:5px;"><i class="fa-solid fa-layer-group" style="color:#0284c7; margin-right:6px;"></i>Grup & Katman İşlemleri</div>
            <div style="display:flex; gap:4px; margin-bottom:12px; flex-wrap:wrap;">
                <button class="tab-btn" id="msBtnGroup" style="padding:4px 8px; flex:1;" onclick="if(window.groupSelected) window.groupSelected();" title="Grup Yap"><i class="fas fa-object-group"></i></button>
                <button class="tab-btn" id="msBtnUngroup" style="padding:4px 8px; flex:1;" onclick="if(window.ungroupSelected) window.ungroupSelected();" title="Grubu Boz"><i class="fas fa-object-ungroup"></i></button>
                <button class="tab-btn" style="padding:4px 8px; flex:1;" onclick="multiSelectBringToFront()" title="En Öne Getir"><i class="fas fa-level-up-alt"></i></button>
                <button class="tab-btn" style="padding:4px 8px; flex:1;" onclick="multiSelectSendToBack()" title="En Arkaya Gönder"><i class="fas fa-level-down-alt"></i></button>
                <button class="tab-btn" style="padding:4px 8px; flex:1;" onclick="multiSelectDuplicate()" title="Çoğalt"><i class="fas fa-copy"></i></button>
                <button class="tab-btn" style="padding:4px 8px; flex:1; color:#ef4444; border-color:rgba(239, 68, 68, 0.3);" onclick="multiSelectDelete()" title="Toplu Sil"><i class="fas fa-trash"></i></button>
            </div>

            <div class="section-title" style="margin-top:5px; margin-bottom:5px;"><i class="fa-solid fa-palette" style="color:#0284c7; margin-right:6px;"></i>Toplu Renk</div>
            <div class="color-row" style="margin-bottom:0;">
                <label>Ortak Renk</label>
                <input type="color" id="multi-color-picker" value="#ffffff" oninput="multiSelectChangeColor(this.value)">
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

        if (totalCount > 1) {
            multiPanel.style.display = 'block';
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
        } else {
            multiPanel.style.display = 'none';
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

    // 🌟 Çoklu işlem sonrası çizim ve neon (Saber) senkronizasyonu
    function syncMovedDrawElements(items) {
        if (typeof drawPaths === 'undefined' || !items || items.length === 0) return;
        items.forEach(it => {
            const el = it ? (it.el || it) : null;
            if (!el || !el.classList || !el.classList.contains('editable-draw')) return;
            const pIdx = drawPaths.findIndex(p => p.el === el);
            if (pIdx > -1) {
                const pObj = drawPaths[pIdx];
                if (typeof window.updateSinglePathSvg === 'function') {
                    window.updateSinglePathSvg(pObj);
                }
                if (pObj.hasSaber && typeof window.applySaberToPath === 'function') {
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

    // Akıllı Sıralama & Üst Üste Binmeyi Önleme (Smart Stacking)
    window.multiSelectStack = function(direction = 'vertical', customGap = null, record = true) {
        window.lastMultiSelectStackDirection = direction;
        const elements = (window.selectedElements && window.selectedElements.length > 1)
            ? window.selectedElements.filter(el => el.dataset.locked !== 'true')
            : [];

        if (elements.length < 2) return;

        const cContainer = document.getElementById('canvas-container');
        const cW = (cContainer && parseFloat(cContainer.style.width)) || 1920;
        const formatRatio = Math.max(1, cW / 1920);
        const activeGap = (typeof customGap === 'number' && !isNaN(customGap)) ? customGap : (window.multiSelectGap !== undefined ? window.multiSelectGap : 14);
        const gap = Math.round(activeGap * formatRatio);

        let items = elements.map(el => {
            const rect = el.getBoundingClientRect();
            return {
                el,
                l: parseFloat(el.style.left) || el.offsetLeft,
                t: parseFloat(el.style.top) || el.offsetTop,
                w: el.offsetWidth || (rect ? rect.width : 50) || 50,
                h: el.offsetHeight || (rect ? rect.height : 30) || 30
            };
        });

        let minL = Math.min(...items.map(i => i.l));
        let maxR = Math.max(...items.map(i => i.l + i.w));
        let centerX = (minL + maxR) / 2;

        let minT = Math.min(...items.map(i => i.t));
        let maxB = Math.max(...items.map(i => i.t + i.h));
        let centerY = (minT + maxB) / 2;

        if (direction === 'vertical') {
            const isCurrentlyHorizontal = (maxR - minL) > (maxB - minT) * 1.2;
            if (isCurrentlyHorizontal) {
                items.sort((a, b) => a.l - b.l);
            } else {
                items.sort((a, b) => a.t - b.t);
            }

            let currentY = minT;

            items.forEach(item => {
                const newL = minL;
                const newT = currentY;
                const dx = newL - item.l;
                const dy = newT - item.t;

                item.el.style.left = newL + 'px';
                item.el.style.top = newT + 'px';

                if (item.el.classList.contains('editable-draw') && typeof drawPaths !== 'undefined') {
                    const pObj = drawPaths.find(p => p.el === item.el);
                    if (pObj) {
                        if (pObj.x1 !== undefined && pObj.x2 !== undefined) {
                            pObj.x1 += dx; pObj.y1 += dy;
                            pObj.x2 += dx; pObj.y2 += dy;
                        }
                        if (pObj.points) pObj.points.forEach(pt => { pt.x += dx; pt.y += dy; });
                        item.el.dataset.baseLeft = (parseFloat(item.el.dataset.baseLeft) || 0) + dx;
                        item.el.dataset.baseTop = (parseFloat(item.el.dataset.baseTop) || 0) + dy;
                    }
                }

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
                const newL = currentX;
                const newT = Math.round(centerY - (item.h / 2));
                const dx = newL - item.l;
                const dy = newT - item.t;

                item.el.style.left = newL + 'px';
                item.el.style.top = newT + 'px';

                if (item.el.classList.contains('editable-draw') && typeof drawPaths !== 'undefined') {
                    const pObj = drawPaths.find(p => p.el === item.el);
                    if (pObj) {
                        if (pObj.x1 !== undefined && pObj.x2 !== undefined) {
                            pObj.x1 += dx; pObj.y1 += dy;
                            pObj.x2 += dx; pObj.y2 += dy;
                        }
                        if (pObj.points) pObj.points.forEach(pt => { pt.x += dx; pt.y += dy; });
                        item.el.dataset.baseLeft = (parseFloat(item.el.dataset.baseLeft) || 0) + dx;
                        item.el.dataset.baseTop = (parseFloat(item.el.dataset.baseTop) || 0) + dy;
                    }
                }

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
    };

    // Çoklu Hizalama (Birbirine Göre)
    window.multiSelectAlign = function(type) {
        if (!window.selectedElements || window.selectedElements.length < 2) return;
        const elements = window.selectedElements.filter(el => el.dataset.locked !== 'true');
        if (elements.length < 2) return;

        let minL = Infinity, maxR = -Infinity;
        let minT = Infinity, maxB = -Infinity;

        const items = elements.map(el => {
            const l = parseFloat(el.style.left) || el.offsetLeft;
            const t = parseFloat(el.style.top) || el.offsetTop;
            const w = el.offsetWidth || parseFloat(el.style.width) || 50;
            const h = el.offsetHeight || parseFloat(el.style.height) || 50;
            if (l < minL) minL = l;
            if (l + w > maxR) maxR = l + w;
            if (t < minT) minT = t;
            if (t + h > maxB) maxB = t + h;
            return { el, l, t, w, h };
        });

        const centerX = (minL + maxR) / 2;
        const centerY = (minT + maxB) / 2;

        // Dikey ortalamada üst üste binme kontrolü
        if (type === 'middle') {
            const sumH = items.reduce((acc, it) => acc + it.h, 0);
            if ((maxB - minT) <= sumH * 1.1) {
                // Öğeler alt alta veya çakışık duruyorsa, üst üste binmelerini önleyip alt alta diz!
                window.multiSelectStack('vertical', 14);
                return;
            }
        }

        items.forEach(item => {
            let newL = item.l;
            let newT = item.t;

            switch(type) {
                case 'left':
                    newL = minL;
                    break;
                case 'center':
                    newL = centerX - (item.w / 2);
                    break;
                case 'right':
                    newL = maxR - item.w;
                    break;
                case 'top':
                    newT = minT;
                    break;
                case 'middle':
                    newT = centerY - (item.h / 2);
                    break;
                case 'bottom':
                    newT = maxB - item.h;
                    break;
            }

            const dx = newL - item.l;
            const dy = newT - item.t;

            item.el.style.left = newL + 'px';
            item.el.style.top = newT + 'px';

            if (item.el.classList.contains('editable-draw') && typeof drawPaths !== 'undefined') {
                const pObj = drawPaths.find(p => p.el === item.el);
                if (pObj) {
                    if (pObj.x1 !== undefined && pObj.x2 !== undefined) {
                        pObj.x1 += dx; pObj.y1 += dy;
                        pObj.x2 += dx; pObj.y2 += dy;
                    }
                    if (pObj.points) {
                        pObj.points.forEach(pt => { pt.x += dx; pt.y += dy; });
                    }
                    item.el.dataset.baseLeft = (parseFloat(item.el.dataset.baseLeft) || 0) + dx;
                    item.el.dataset.baseTop = (parseFloat(item.el.dataset.baseTop) || 0) + dy;
                }
            }
        });

        syncMovedDrawElements(items);
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof renderLayers === 'function') renderLayers();
        if (typeof window.recordHistory === 'function') window.recordHistory('Öğeler Hizalandı (' + type + ')');
    };

    // Sayfada / Tuvalde 9 Yön ve Ortaya Konumlandırma
    window.multiSelectPositionOnPage = function(pos) {
        let rawElements = (window.selectedElements && window.selectedElements.length > 0)
            ? window.selectedElements.filter(el => el.dataset.locked !== 'true')
            : (window.selectedEl ? [window.selectedEl] : []);

        // 🌟 3D Öge Seçiliyse veya Tuvalde 2D Seçim Yokken 3D Aktifse: 3D Ögeyi Sayfada Konumlandır!
        if ((!rawElements.length || (window.ThreeDEngine && window.ThreeDEngine.state && window.ThreeDEngine.state.selected)) &&
            window.ThreeDEngine && typeof window.ThreeDEngine.isActive === 'function' && window.ThreeDEngine.isActive()) {
            if (pos === 'center' || pos === 'horizontal-center' || pos === 'vertical-center') {
                if (typeof window.ThreeDEngine.centerOnScreen === 'function') {
                    window.ThreeDEngine.centerOnScreen();
                    return;
                }
            }
            if (typeof window.ThreeDEngine.alignElement === 'function') {
                window.ThreeDEngine.alignElement(null, pos);
                return;
            }
            return;
        }

        // Her öğenin en üstteki taşınabilir ana kapsayıcısını bul (.callout-wrap, .draggable, .canvas-el, .added-icon)
        const elements = Array.from(new Set(rawElements.map(el => el.closest('.callout-wrap, .draggable, .canvas-el, .added-icon, [data-layer-uid]') || el)));

        if (elements.length === 0) return;

        const canvasContainer = document.getElementById('canvas-container') || document.querySelector('.main-canvas') || document.body;
        const cW = parseFloat(canvasContainer.style.width) || canvasContainer.offsetWidth || 1920;
        const cH = parseFloat(canvasContainer.style.height) || canvasContainer.offsetHeight || 1080;
        const formatRatio = Math.max(1, cW / 1920);
        const margin = Math.round(40 * formatRatio);

        let minL = Infinity, maxR = -Infinity;
        let minT = Infinity, maxB = -Infinity;

        const items = elements.map(el => {
            const l = parseFloat(el.style.left) || el.offsetLeft;
            const t = parseFloat(el.style.top) || el.offsetTop;
            const w = el.offsetWidth || parseFloat(el.style.width) || 50;
            const h = el.offsetHeight || parseFloat(el.style.height) || 50;
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
                targetGroupL = (cW - groupW) / 2;
                targetGroupT = margin;
                break;
            case 'top-right':
                targetGroupL = cW - groupW - margin;
                targetGroupT = margin;
                break;
            case 'middle-left':
                targetGroupL = margin;
                targetGroupT = (cH - groupH) / 2;
                break;
            case 'center':
                targetGroupL = (cW - groupW) / 2;
                targetGroupT = (cH - groupH) / 2;
                break;
            case 'middle-right':
                targetGroupL = cW - groupW - margin;
                targetGroupT = (cH - groupH) / 2;
                break;
            case 'bottom-left':
                targetGroupL = margin;
                targetGroupT = cH - groupH - margin;
                break;
            case 'bottom-center':
                targetGroupL = (cW - groupW) / 2;
                targetGroupT = cH - groupH - margin;
                break;
            case 'bottom-right':
                targetGroupL = cW - groupW - margin;
                targetGroupT = cH - groupH - margin;
                break;
            case 'horizontal-center':
                targetGroupL = (cW - groupW) / 2;
                targetGroupT = minT;
                break;
            case 'vertical-center':
                targetGroupL = minL;
                targetGroupT = (cH - groupH) / 2;
                break;
        }

        const deltaX = targetGroupL - minL;
        const deltaY = targetGroupT - minT;

        items.forEach(item => {
            let newL = item.l + deltaX;
            let newT = item.t + deltaY;

            // Eğer tek bir dikey sütun halindelerse ve yatay merkezleme istenmişse tek tek de merkezle
            if (pos === 'top-center' || pos === 'center' || pos === 'bottom-center' || pos === 'horizontal-center') {
                if (items.length > 1 && groupW < cW * 0.45) {
                    newL = (cW - item.w) / 2;
                }
            }

            const dx = newL - item.l;
            const dy = newT - item.t;

            item.el.style.left = newL + 'px';
            item.el.style.top = newT + 'px';

            if (item.el.classList.contains('editable-draw') && typeof drawPaths !== 'undefined') {
                const pObj = drawPaths.find(p => p.el === item.el);
                if (pObj) {
                    if (pObj.x1 !== undefined && pObj.x2 !== undefined) {
                        pObj.x1 += dx; pObj.y1 += dy;
                        pObj.x2 += dx; pObj.y2 += dy;
                    }
                    if (pObj.points) {
                        pObj.points.forEach(pt => { pt.x += dx; pt.y += dy; });
                    }
                    item.el.dataset.baseLeft = (parseFloat(item.el.dataset.baseLeft) || 0) + dx;
                    item.el.dataset.baseTop = (parseFloat(item.el.dataset.baseTop) || 0) + dy;
                }
            }
        });

        syncMovedDrawElements(items);
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof renderLayers === 'function') renderLayers();
        if (typeof window.recordHistory === 'function') window.recordHistory('Sayfada Konumlandırıldı (' + pos + ')');
    };

    // Sayfaya / Tuvale Göre Ortala
    window.multiSelectCenterOnPage = function(axis = 'both') {
        if (axis === 'horizontal') window.multiSelectPositionOnPage('horizontal-center');
        else if (axis === 'vertical') window.multiSelectPositionOnPage('vertical-center');
        else window.multiSelectPositionOnPage('center');
    };

    window.multiSelectDistribute = function(axis) {
        if (!window.selectedElements || window.selectedElements.length < 2) {
            alert('Dağıtma işlemi için en az 2 öğe seçmelisiniz.');
            return;
        }
        
        const elements = window.selectedElements.filter(el => el.dataset.locked !== 'true');
        if (elements.length < 2) return;

        let items = elements.map(el => {
            return {
                el,
                l: parseFloat(el.style.left) || el.offsetLeft,
                t: parseFloat(el.style.top) || el.offsetTop,
                w: el.offsetWidth || parseFloat(el.style.width) || 50,
                h: el.offsetHeight || parseFloat(el.style.height) || 50
            };
        });

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
                const dx = currentX - items[i].l;
                items[i].el.style.left = currentX + 'px';
                if (items[i].el.classList.contains('editable-draw') && typeof drawPaths !== 'undefined') {
                    const pObj = drawPaths.find(p => p.el === items[i].el);
                    if (pObj) {
                        if (pObj.x1 !== undefined) { pObj.x1 += dx; pObj.x2 += dx; }
                        if (pObj.points) pObj.points.forEach(pt => pt.x += dx);
                        items[i].el.dataset.baseLeft = (parseFloat(items[i].el.dataset.baseLeft) || 0) + dx;
                    }
                }
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
                const dy = currentY - items[i].t;
                items[i].el.style.top = currentY + 'px';
                if (items[i].el.classList.contains('editable-draw') && typeof drawPaths !== 'undefined') {
                    const pObj = drawPaths.find(p => p.el === items[i].el);
                    if (pObj) {
                        if (pObj.y1 !== undefined) { pObj.y1 += dy; pObj.y2 += dy; }
                        if (pObj.points) pObj.points.forEach(pt => pt.y += dy);
                        items[i].el.dataset.baseTop = (parseFloat(items[i].el.dataset.baseTop) || 0) + dy;
                    }
                }
                currentY += items[i].h + gap;
            }
        }

        syncMovedDrawElements(items);
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof window.recordHistory === 'function') window.recordHistory('Aralıklar Eşitlendi (' + axis + ')');
    };

    window.multiSelectDuplicate = function() {
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

            // Gorseli drawPaths dizisine de ekleyelim (eger cizim ise)
            if (el.classList.contains('editable-draw') && typeof drawPaths !== 'undefined') {
                const origPath = drawPaths.find(p => p.el === el);
                if (origPath) {
                    const clonedPath = Object.assign({}, origPath);
                    clonedPath.el = clone;
                    clonedPath.saberRef = null;
                    delete clonedPath.saberRef;
                    if (Array.isArray(origPath.points)) {
                        clonedPath.points = origPath.points.map(pt => ({ ...pt }));
                    }
                    drawPaths.push(clonedPath);
                    clone.dataset.pathIndex = drawPaths.length - 1;
                }
            }
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
            if (el.classList.contains('editable-draw')) {
                const isNeon = el.classList.contains('neon-active');
                if (!isNeon) {
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
            }
        });
    };

    window.multiSelectBringToFront = function() {
        if (!window.selectedElements) return;
        window.selectedElements.forEach(el => {
            const parent = el.parentNode;
            if (parent) {
                parent.appendChild(el);
            }
        });
        if (typeof renderLayers === 'function') renderLayers();
    };

    window.multiSelectSendToBack = function() {
        if (!window.selectedElements) return;
        window.selectedElements.forEach(el => {
            const parent = el.parentNode;
            if (parent && parent.firstChild) {
                parent.insertBefore(el, parent.firstChild);
            }
        });
        if (typeof renderLayers === 'function') renderLayers();
    };

    window.multiSelectToggleLock = function() {
        if (!window.selectedElements || window.selectedElements.length === 0) return;
        const anyUnlocked = window.selectedElements.some(el => el.dataset.locked !== 'true');
        const newState = anyUnlocked ? 'true' : 'false';
        window.selectedElements.forEach(el => {
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
        if (!window.selectedElements || window.selectedElements.length === 0) return;
        const targets = Array.from(new Set(window.selectedElements.map(el => el.closest('.callout-wrap, .draggable, .canvas-el, .added-icon, [data-layer-uid]') || el)));
        targets.forEach(el => {
            const curRot = parseFloat(el.dataset.rotation) || 0;
            let newRot = (curRot + deltaDeg) % 360;
            if (newRot > 180) newRot -= 360;
            else if (newRot < -180) newRot += 360;
            newRot = Math.round(newRot);
            el.dataset.rotation = newRot;
            const curScale = el.dataset.scale || 1;
            el.style.transform = `rotate(${newRot}deg) scale(${curScale})`;
        });
        syncMovedDrawElements(targets);
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof renderLayers === 'function') renderLayers();
        if (typeof window.recordHistory === 'function') window.recordHistory('Toplu Döndürme');
    };

    window.multiSelectScale = function(factor = 1.1) {
        // 🌟 Seçili 3D ögeleri de orantılı boyutlandır
        if (window.ThreeDGrouping && typeof window.ThreeDGrouping.getSelected3DElements === 'function') {
            const sel3D = window.ThreeDGrouping.getSelected3DElements();
            if (sel3D && sel3D.length > 0) {
                sel3D.forEach(item => {
                    item.scaleX = +((item.scaleX !== undefined ? item.scaleX : 1.0) * factor).toFixed(3);
                    item.scaleY = +((item.scaleY !== undefined ? item.scaleY : 1.0) * factor).toFixed(3);
                    item.scaleZ = +((item.scaleZ !== undefined ? item.scaleZ : 1.0) * factor).toFixed(3);
                    if (window.ThreeDEngine && typeof window.ThreeDEngine.updateContentTransform === 'function') {
                        window.ThreeDEngine.updateContentTransform(item);
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

        if (!window.selectedElements || window.selectedElements.length === 0) return;
        const targets = Array.from(new Set(window.selectedElements.map(el => el.closest('.callout-wrap, .draggable, .canvas-el, .added-icon, [data-layer-uid]') || el)));
        if (targets.length === 0) return;

        // 1. Calculate bounding box of all targets to find the group center
        let minL = Infinity, maxR = -Infinity;
        let minT = Infinity, maxB = -Infinity;

        targets.forEach(el => {
            const l = parseFloat(el.style.left) || el.offsetLeft || 0;
            const t = parseFloat(el.style.top) || el.offsetTop || 0;
            const w = el.offsetWidth || parseFloat(el.style.width) || 50;
            const h = el.offsetHeight || parseFloat(el.style.height) || 50;
            if (l < minL) minL = l;
            if (l + w > maxR) maxR = l + w;
            if (t < minT) minT = t;
            if (t + h > maxB) maxB = t + h;
        });

        const centerX = (minL + maxR) / 2;
        const centerY = (minT + maxB) / 2;

        targets.forEach(el => {
            const curL = parseFloat(el.style.left) || el.offsetLeft || 0;
            const curT = parseFloat(el.style.top) || el.offsetTop || 0;
            const curW = el.offsetWidth || parseFloat(el.style.width) || 100;
            const curH = el.offsetHeight || parseFloat(el.style.height) || 100;
            
            const newW = Math.max(20, Math.round(curW * factor));
            const newH = Math.max(20, Math.round(curH * factor));
            
            // Adjust position relative to group center if multiple items
            if (targets.length > 1) {
                const elCenterX = curL + curW / 2;
                const elCenterY = curT + curH / 2;
                const newElCenterX = centerX + (elCenterX - centerX) * factor;
                const newElCenterY = centerY + (elCenterY - centerY) * factor;
                el.style.left = Math.round(newElCenterX - newW / 2) + 'px';
                el.style.top = Math.round(newElCenterY - newH / 2) + 'px';
            }

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
            }
            if (el.classList.contains('editable-draw')) {
                if (el.dataset.baseWidth !== undefined) el.dataset.baseWidth = newW;
                if (el.dataset.baseHeight !== undefined) el.dataset.baseHeight = newH;
            }
        });

        syncMovedDrawElements(targets);
        if (typeof redrawAll === 'function') redrawAll();
        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof renderLayers === 'function') renderLayers();
        if (typeof window.recordHistory === 'function') window.recordHistory('Toplu Boyutlandırma');
    };

    document.addEventListener('DOMContentLoaded', initMultiSelectUI);
})();

