(function() {
    // Toplu Islemler UI Entegrasyonu
    let multiPanel = null;
    window.multiSelectGap = 14;

    window.setMultiSelectGap = function(val) {
        let num = parseInt(val);
        if (isNaN(num) || num < 0) num = 0;
        if (num > 300) num = 300;
        window.multiSelectGap = num;

        const inputs = document.querySelectorAll('#multi-gap-val, #acm-gap-val');
        inputs.forEach(inp => { if (inp) inp.value = num; });

        document.querySelectorAll('.gap-preset-btn').forEach(btn => {
            if (parseInt(btn.innerText) === num) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    };

    window.stepMultiSelectGap = function(delta) {
        window.setMultiSelectGap((window.multiSelectGap || 14) + delta);
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
            
            <div class="section-title" style="margin-top:5px; margin-bottom:5px;">↕️ Boşluklu Sırala (Anti-Overlap)</div>
            
            <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:6px; margin-bottom:6px; border:1px solid rgba(255,255,255,0.08);">
                <span style="font-size:11px; color:#cbd5e1; font-weight:600;"><i class="fas fa-arrows-alt-v" style="color:var(--primary); margin-right:4px;"></i> Boşluk:</span>
                <div style="display:flex; align-items:center; gap:4px;">
                    <button type="button" class="tab-btn" style="padding:2px 7px; font-size:12px; font-weight:bold; min-width:24px;" onclick="window.stepMultiSelectGap(-2)">-</button>
                    <input type="number" id="multi-gap-val" value="${window.multiSelectGap || 14}" min="0" max="200" step="2" onchange="window.setMultiSelectGap(this.value)" oninput="window.setMultiSelectGap(this.value)" style="width:42px; text-align:center; padding:2px 4px; font-size:11px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:4px; font-weight:bold;">
                    <span style="font-size:10px; color:#94a3b8;">px</span>
                    <button type="button" class="tab-btn" style="padding:2px 7px; font-size:12px; font-weight:bold; min-width:24px;" onclick="window.stepMultiSelectGap(2)">+</button>
                </div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:3px; margin-bottom:8px;">
                <button type="button" class="tab-btn gap-preset-btn ${window.multiSelectGap === 6 ? 'active' : ''}" style="padding:3px 2px; font-size:10px;" onclick="window.setMultiSelectGap(6)">6px</button>
                <button type="button" class="tab-btn gap-preset-btn ${(!window.multiSelectGap || window.multiSelectGap === 14) ? 'active' : ''}" style="padding:3px 2px; font-size:10px;" onclick="window.setMultiSelectGap(14)">14px</button>
                <button type="button" class="tab-btn gap-preset-btn ${window.multiSelectGap === 24 ? 'active' : ''}" style="padding:3px 2px; font-size:10px;" onclick="window.setMultiSelectGap(24)">24px</button>
                <button type="button" class="tab-btn gap-preset-btn ${window.multiSelectGap === 40 ? 'active' : ''}" style="padding:3px 2px; font-size:10px;" onclick="window.setMultiSelectGap(40)">40px</button>
            </div>

            <div style="display:flex; gap:4px; margin-bottom:10px;">
                <button class="tab-btn" style="padding:6px 6px; flex:1; font-size:11px; background:rgba(99, 102, 241, 0.2); border-color:#6366f1; color:#fff;" onclick="multiSelectStack('vertical')" title="Alt Alta Boşlukla Diz"><i class="fas fa-bars"></i> Alt Alta Diz</button>
                <button class="tab-btn" style="padding:6px 6px; flex:1; font-size:11px; background:rgba(99, 102, 241, 0.2); border-color:#6366f1; color:#fff;" onclick="multiSelectStack('horizontal')" title="Yan Yana Boşlukla Diz"><i class="fas fa-columns"></i> Yan Yana Diz</button>
            </div>

            <div class="section-title" style="margin-top:5px; margin-bottom:5px;">↔️ Birbirine Göre Hizala</div>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:4px; margin-bottom:10px;">
                <button class="tab-btn" style="padding:5px 4px; font-size:11px;" onclick="multiSelectAlign('left')" title="Sola Hizala"><i class="fas fa-align-left"></i> Sola</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:11px;" onclick="multiSelectAlign('center')" title="Yatay Ortala"><i class="fas fa-align-center"></i> Ortala</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:11px;" onclick="multiSelectAlign('right')" title="Sağa Hizala"><i class="fas fa-align-right"></i> Sağa</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:11px;" onclick="multiSelectAlign('top')" title="Üste Hizala"><i class="fas fa-arrow-up"></i> Üste</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:11px;" onclick="multiSelectAlign('middle')" title="Dikey Ortala"><i class="fas fa-arrows-alt-v"></i> Dikey</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:11px;" onclick="multiSelectAlign('bottom')" title="Alta Hizala"><i class="fas fa-arrow-down"></i> Alta</button>
            </div>

            <div class="section-title" style="margin-top:5px; margin-bottom:5px;">🎯 Sayfada 9 Yön Konumlandırma</div>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:4px; margin-bottom:10px;">
                <button class="tab-btn" style="padding:5px 4px; font-size:10px;" onclick="multiSelectPositionOnPage('top-left')" title="Sol Üst"><i class="fas fa-arrow-up-left"></i> Sol Üst</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:10px;" onclick="multiSelectPositionOnPage('top-center')" title="Üst Orta"><i class="fas fa-arrow-up"></i> Üst Orta</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:10px;" onclick="multiSelectPositionOnPage('top-right')" title="Sağ Üst"><i class="fas fa-arrow-up-right"></i> Sağ Üst</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:10px;" onclick="multiSelectPositionOnPage('middle-left')" title="Orta Sol"><i class="fas fa-arrow-left"></i> Orta Sol</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:10px; font-weight:bold; background:rgba(56, 189, 248, 0.2); border-color:#38bdf8;" onclick="multiSelectPositionOnPage('center')" title="Tam Sayfa Ortası"><i class="fas fa-crosshairs"></i> Merkez</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:10px;" onclick="multiSelectPositionOnPage('middle-right')" title="Orta Sağ"><i class="fas fa-arrow-right"></i> Orta Sağ</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:10px;" onclick="multiSelectPositionOnPage('bottom-left')" title="Sol Alt"><i class="fas fa-arrow-down-left"></i> Sol Alt</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:10px;" onclick="multiSelectPositionOnPage('bottom-center')" title="Alt Orta"><i class="fas fa-arrow-down"></i> Alt Orta</button>
                <button class="tab-btn" style="padding:5px 4px; font-size:10px;" onclick="multiSelectPositionOnPage('bottom-right')" title="Sağ Alt"><i class="fas fa-arrow-down-right"></i> Sağ Alt</button>
            </div>

            <div class="section-title" style="margin-top:5px; margin-bottom:5px;">📏 Sayfada Ortala & Boşluk Eşitle</div>
            <div style="display:flex; gap:4px; margin-bottom:6px; flex-wrap:wrap;">
                <button class="tab-btn" style="padding:4px 8px; flex:1; font-size:11px;" onclick="multiSelectCenterOnPage('horizontal')" title="Sayfada Yatay Ortala"><i class="fas fa-arrows-alt-h"></i> Sayfa Yatay</button>
                <button class="tab-btn" style="padding:4px 8px; flex:1; font-size:11px;" onclick="multiSelectCenterOnPage('vertical')" title="Sayfada Dikey Ortala"><i class="fas fa-arrows-alt-v"></i> Sayfa Dikey</button>
            </div>
            <div style="display:flex; gap:4px; margin-bottom:10px; flex-wrap:wrap;">
                <button class="tab-btn" style="padding:4px 8px; flex:1; font-size:11px;" onclick="multiSelectDistribute('vertical')" title="Dikey Eşit Aralık"><i class="fas fa-grip-lines"></i> Dikey Eşitle</button>
                <button class="tab-btn" style="padding:4px 8px; flex:1; font-size:11px;" onclick="multiSelectDistribute('horizontal')" title="Yatay Eşit Aralık"><i class="fas fa-grip-lines-vertical"></i> Yatay Eşitle</button>
            </div>

            <div class="section-title" style="margin-top:5px; margin-bottom:5px;">Grup & Katman İşlemleri</div>
            <div style="display:flex; gap:4px; margin-bottom:12px; flex-wrap:wrap;">
                <button class="tab-btn" style="padding:4px 8px; flex:1;" onclick="if(window.groupSelected) window.groupSelected();" title="Grup Yap"><i class="fas fa-object-group"></i></button>
                <button class="tab-btn" style="padding:4px 8px; flex:1;" onclick="if(window.ungroupSelected) window.ungroupSelected();" title="Grubu Boz"><i class="fas fa-object-ungroup"></i></button>
                <button class="tab-btn" style="padding:4px 8px; flex:1;" onclick="multiSelectBringToFront()" title="En Öne Getir"><i class="fas fa-level-up-alt"></i></button>
                <button class="tab-btn" style="padding:4px 8px; flex:1;" onclick="multiSelectSendToBack()" title="En Arkaya Gönder"><i class="fas fa-level-down-alt"></i></button>
                <button class="tab-btn" style="padding:4px 8px; flex:1;" onclick="multiSelectDuplicate()" title="Çoğalt"><i class="fas fa-copy"></i></button>
                <button class="tab-btn" style="padding:4px 8px; flex:1; background:#ef4444; color:white;" onclick="multiSelectDelete()" title="Toplu Sil"><i class="fas fa-trash"></i></button>
            </div>

            <div class="section-title" style="margin-top:5px; margin-bottom:5px;">Toplu Renk</div>
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

        if (window.selectedElements && window.selectedElements.length > 1) {
            multiPanel.style.display = 'block';
            document.getElementById('multi-select-count').innerText = window.selectedElements.length;
            const gapInp = document.getElementById('multi-gap-val');
            if (gapInp) gapInp.value = window.multiSelectGap || 14;
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

    // Akıllı Sıralama & Üst Üste Binmeyi Önleme (Smart Stacking)
    window.multiSelectStack = function(direction = 'vertical', customGap = null) {
        const elements = (window.selectedElements && window.selectedElements.length > 1)
            ? window.selectedElements.filter(el => el.dataset.locked !== 'true')
            : [];

        if (elements.length < 2) return;

        const cContainer = document.getElementById('canvas-container');
        const cW = (cContainer && parseFloat(cContainer.style.width)) || 1920;
        const formatRatio = Math.max(1, cW / 1920);
        const activeGap = (typeof customGap === 'number' && !isNaN(customGap)) ? customGap : (window.multiSelectGap || 14);
        const gap = Math.round(activeGap * formatRatio);

        let items = elements.map(el => {
            return {
                el,
                l: parseFloat(el.style.left) || el.offsetLeft,
                t: parseFloat(el.style.top) || el.offsetTop,
                w: el.offsetWidth || parseFloat(el.style.width) || 50,
                h: el.offsetHeight || parseFloat(el.style.height) || 50
            };
        });

        let minL = Math.min(...items.map(i => i.l));
        let maxR = Math.max(...items.map(i => i.l + i.w));
        let centerX = (minL + maxR) / 2;

        let minT = Math.min(...items.map(i => i.t));
        let maxB = Math.max(...items.map(i => i.t + i.h));
        let centerY = (minT + maxB) / 2;

        if (direction === 'vertical') {
            items.sort((a, b) => a.t - b.t);
            let currentY = items[0].t;

            items.forEach(item => {
                const newL = centerX - (item.w / 2);
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
            items.sort((a, b) => a.l - b.l);
            let currentX = items[0].l;

            items.forEach(item => {
                const newL = currentX;
                const newT = centerY - (item.h / 2);
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

        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof window.recordHistory === 'function') window.recordHistory('Öğeler Sıralandı (' + direction + ')');
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

        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof window.recordHistory === 'function') window.recordHistory('Öğeler Hizalandı (' + type + ')');
    };

    // Sayfada / Tuvalde 9 Yön ve Ortaya Konumlandırma
    window.multiSelectPositionOnPage = function(pos) {
        const elements = (window.selectedElements && window.selectedElements.length > 0)
            ? window.selectedElements.filter(el => el.dataset.locked !== 'true')
            : (window.selectedEl ? [window.selectedEl] : []);

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

        if (typeof updateDrawHistory === 'function') updateDrawHistory();
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

        if (typeof updateDrawHistory === 'function') updateDrawHistory();
        if (typeof window.recordHistory === 'function') window.recordHistory('Aralıklar Eşitlendi (' + axis + ')');
    };

    window.multiSelectDuplicate = function() {
        if (!window.selectedElements || window.selectedElements.length === 0) return;
        
        let newElements = [];
        window.selectedElements.forEach(el => {
            const clone = el.cloneNode(true);
            clone.classList.remove('el-selected');
            clone.style.left = (parseFloat(el.style.left || el.offsetLeft) + 20) + 'px';
            clone.style.top = (parseFloat(el.style.top || el.offsetTop) + 20) + 'px';
            
            if (clone.id) clone.id = 'clone_' + Math.random().toString(36).substr(2, 9);
            
            el.parentNode.appendChild(clone);
            
            if (typeof makeDraggable === 'function') {
                makeDraggable(clone);
            }
            
            clone.querySelectorAll('.text-handle').forEach(h => h.remove());
            newElements.push(clone);

            // Gorseli drawPaths dizisine de ekleyelim (eger cizim ise)
            if (el.classList.contains('editable-draw') && typeof drawPaths !== 'undefined') {
                const origPath = drawPaths.find(p => p.el === el);
                if (origPath) {
                    const clonedPath = Object.assign({}, origPath);
                    clonedPath.el = clone;
                    drawPaths.push(clonedPath);
                }
            }
        });
        
        if (typeof deselectAll === 'function') deselectAll();
        
        newElements.forEach(el => {
            if(!window.selectedElements.includes(el)) {
                window.selectedElements.push(el);
                el.classList.add('el-selected');
            }
        });
        
        if (typeof updateMultiSelectUI === 'function') updateMultiSelectUI();
        if (typeof window.renderLayers === 'function') window.renderLayers();
    };

    window.multiSelectDelete = function() {
        if (!window.selectedElements || window.selectedElements.length === 0) return;
        
        let toDelete = [...window.selectedElements].filter(el => el.dataset.locked !== 'true');
        if (toDelete.length === 0) {
            alert('Seçili tüm öğeler kilitli olduğu için silinemez.');
            return;
        }

        const confirmDelete = confirm(toDelete.length + ' adet öğeyi silmek istediğinize emin misiniz?');
        if (!confirmDelete) return;
        
        if (typeof deselectAll === 'function') deselectAll();
        
        toDelete.forEach(el => {
            el.remove();
            if (typeof drawPaths !== 'undefined') {
                const idx = drawPaths.findIndex(p => p.el === el);
                if (idx > -1) drawPaths.splice(idx, 1);
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

    document.addEventListener('DOMContentLoaded', initMultiSelectUI);
})();
