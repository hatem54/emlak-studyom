(function() {
    // Toplu Islemler UI Entegrasyonu
    let multiPanel = null;

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
                <h3 style="margin:0; font-size:14px; color:var(--primary);"><i class="fas fa-layer-group"></i> Toplu Islemler (<span id="multi-select-count">0</span>)</h3>
            </div>
            
            <div class="section-title" style="margin-top:5px; margin-bottom:5px;">Metin Hizalama</div>
            <div style="display:flex; gap:5px; margin-bottom:15px; flex-wrap:wrap;">
                <button class="tab-btn" style="padding:4px 8px; flex:1;" onclick="multiSelectTextAlign('left')" title="Sola Yasla"><i class="fas fa-align-left"></i></button>
                <button class="tab-btn" style="padding:4px 8px; flex:1;" onclick="multiSelectTextAlign('center')" title="Ortala"><i class="fas fa-align-center"></i></button>
                <button class="tab-btn" style="padding:4px 8px; flex:1;" onclick="multiSelectTextAlign('right')" title="Saga Yasla"><i class="fas fa-align-right"></i></button>
            </div>

            <div class="section-title" style="margin-top:5px; margin-bottom:5px;">Dagitma & Islemler</div>
            <div style="display:flex; gap:5px; margin-bottom:15px; flex-wrap:wrap;">
                <button class="tab-btn" style="padding:4px 8px; flex:1;" onclick="multiSelectSnapToGrid()" title="Izgaraya Oturt (Snap to Grid)"><i class="fas fa-border-all"></i></button>
                <button class="tab-btn" style="padding:4px 8px; flex:1;" onclick="multiSelectDistribute('horizontal')" title="Yatay Esit Dagit"><i class="fas fa-arrows-alt-h"></i></button>
                <button class="tab-btn" style="padding:4px 8px; flex:1;" onclick="multiSelectDistribute('vertical')" title="Dikey Esit Dagit"><i class="fas fa-arrows-alt-v"></i></button>
                <button class="tab-btn" style="padding:4px 8px; flex:1;" onclick="if(window.groupSelected) window.groupSelected();" title="Grup Yap"><i class="fas fa-object-group"></i></button>
                <button class="tab-btn" style="padding:4px 8px; flex:1;" onclick="if(window.ungroupSelected) window.ungroupSelected();" title="Grubu Boz"><i class="fas fa-object-ungroup"></i></button>
                <button class="tab-btn" style="padding:4px 8px; flex:1;" onclick="multiSelectBringToFront()" title="Ene One Getir"><i class="fas fa-level-up-alt"></i></button>
                <button class="tab-btn" style="padding:4px 8px; flex:1;" onclick="multiSelectSendToBack()" title="Ene Arkaya Gonder"><i class="fas fa-level-down-alt"></i></button>
                <button class="tab-btn" style="padding:4px 8px; flex:1;" onclick="multiSelectDuplicate()" title="Cogalt"><i class="fas fa-copy"></i></button>
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

    window.multiSelectDistribute = function(axis) {
        if (!window.selectedElements || window.selectedElements.length < 3) {
            alert('Dagitma islemi icin en az 3 oge secmelisiniz.');
            return;
        }
        
        let items = window.selectedElements.map(el => {
            return {
                el,
                l: parseFloat(el.style.left) || el.offsetLeft,
                t: parseFloat(el.style.top) || el.offsetTop,
                w: el.offsetWidth,
                h: el.offsetHeight
            };
        });

        if (axis === 'horizontal') {
            items.sort((a, b) => a.l - b.l);
            const first = items[0];
            const last = items[items.length - 1];
            const totalSpace = (last.l) - (first.l + first.w);
            let combinedWidth = 0;
            for(let i=1; i<items.length-1; i++) combinedWidth += items[i].w;
            
            const gap = (totalSpace - combinedWidth) / (items.length - 1);
            let currentX = first.l + first.w + gap;
            
            for(let i=1; i<items.length-1; i++) {
                items[i].el.style.left = currentX + 'px';
                currentX += items[i].w + gap;
            }
        } else {
            items.sort((a, b) => a.t - b.t);
            const first = items[0];
            const last = items[items.length - 1];
            const totalSpace = (last.t) - (first.t + first.h);
            let combinedHeight = 0;
            for(let i=1; i<items.length-1; i++) combinedHeight += items[i].h;
            
            const gap = (totalSpace - combinedHeight) / (items.length - 1);
            let currentY = first.t + first.h + gap;
            
            for(let i=1; i<items.length-1; i++) {
                items[i].el.style.top = currentY + 'px';
                currentY += items[i].h + gap;
            }
        }
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
