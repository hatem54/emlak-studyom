
function renderLayersPanel() {
    try {
        const list = document.getElementById('layersList');
        if (!list) return;
        list.innerHTML = '';
        
        const els = Array.from(document.querySelectorAll('.callout-wrap, .icon-wrap, .canvas-el, .editable-text, .cvr-base > *, .icon-item'));
        
        const validEls = els.filter(el => {
            if (el.classList.contains('cvr-c1') && el.children.length === 0) return false; 
            if (el.style.display === 'none' || window.getComputedStyle(el).display === 'none') return false;
            if (el.tagName.toLowerCase() === 'style' || el.tagName.toLowerCase() === 'script') return false;
            if (el.classList.contains('icon-item') && el.parentElement && el.parentElement.classList.contains('icon-wrap')) return false;
            return true;
        });
        
        validEls.sort((a, b) => {
            let zA = parseInt(window.getComputedStyle(a).zIndex) || 1;
            let zB = parseInt(window.getComputedStyle(b).zIndex) || 1;
            return zB - zA;
        });
        
        validEls.forEach(el => {
            const item = document.createElement('div');
            item.className = 'layer-item';
            
            let label = 'Nesne';
            let icon = '<i class="fa-solid fa-cube"></i>';
            
            if (el.classList.contains('callout-wrap')) {
                let coItem = el.querySelector('.co-neon-block');
                label = 'Callout: ' + (coItem ? coItem.textContent.trim().substring(0, 15) : 'Şekil');
                icon = '<i class="fa-solid fa-comment-dots"></i>';
            } else if (el.classList.contains('icon-item') || el.classList.contains('icon-wrap') || el.tagName.toLowerCase() === 'i') {
                label = 'İkon';
                icon = '<i class="fa-solid fa-star"></i>';
            } else if (el.classList.contains('editable-text') || el.dataset.label) {
                let textContent = el.textContent || el.value || '';
                label = el.dataset.label || ('Yazı: ' + textContent.substring(0, 15));
                icon = '<i class="fa-solid fa-font"></i>';
            } else if (el.classList.contains('cvr-bg-img')) {
                label = 'Şablon Arkaplanı';
                icon = '<i class="fa-solid fa-image"></i>';
            } else if (el.classList.contains('cvr-black-gradient')) {
                label = 'Şablon Degradesi';
                icon = '<i class="fa-solid fa-fill-drip"></i>';
            } else if (el.classList.contains('cvr-details-box')) {
                label = 'Şablon Kutusu';
                icon = '<i class="fa-regular fa-square"></i>';
            } else if (el.classList.contains('photo-panel')) {
                label = 'Fotoğraf Paneli';
                icon = '<i class="fa-regular fa-image"></i>';
            } else if (el.classList.contains('left-panel') || el.classList.contains('blue-panel')) {
                label = 'Yan Panel';
                icon = '<i class="fa-solid fa-columns"></i>';
            }
            
            item.innerHTML = `<div style="display:flex; align-items:center; gap:8px; overflow:hidden;">${icon}<span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">${label}</span></div><span style="font-size:11px; opacity:0.6; min-width:35px; text-align:right;">Z: ${parseInt(window.getComputedStyle(el).zIndex) || 1}</span>`;
            
            let isSelected = false;
            if (typeof selectedEl !== 'undefined' && selectedEl === el) isSelected = true;
            if (typeof selectedCalloutEl !== 'undefined' && selectedCalloutEl) {
                if (el.classList.contains('callout-wrap') && el.contains(selectedCalloutEl)) isSelected = true;
            }
            
            if (isSelected) {
                item.classList.add('active');
            }
            
            item.onclick = () => {
                if (el.classList.contains('callout-wrap')) {
                    let calloutItem = el.querySelector('.callout-item');
                    if (calloutItem && typeof selectCalloutEl === 'function') {
                        selectCalloutEl(calloutItem);
                    }
                } else {
                    if (typeof deselectAll === 'function') deselectAll();
                    if (el.classList.contains('draggable') || el.classList.contains('canvas-el') || el.classList.contains('editable-text')) {
                        if (typeof selectElement === 'function') selectElement(el);
                    } else {
                        window.selectedEl = el;
                        document.querySelectorAll('.layer-item').forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                        if (document.getElementById('elSettings')) {
                            document.getElementById('elSettings').style.display = 'block';
                            document.getElementById('noSelMsg').style.display = 'none';
                            if (document.getElementById('elSize')) document.getElementById('elSize').parentElement.style.display = 'none';
                        }
                    }
                }
                renderLayersPanel();
            };
            
            list.appendChild(item);
        });
    } catch (e) {
        console.error("Error in renderLayersPanel:", e);
        const errDiv = document.createElement('div');
        errDiv.style.position = 'fixed'; errDiv.style.top = '50px'; errDiv.style.left = '10px';
        errDiv.style.background = 'blue'; errDiv.style.color = 'white'; errDiv.style.zIndex = '999999';
        errDiv.innerText = "LAYERS PANEL ERROR: " + e.stack;
        document.body.appendChild(errDiv);
    }
}

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
                    renderLayersPanel();
                }
            };
        } else {
            let lastTab = '';
            setInterval(() => {
                const activeBtn = document.querySelector('#mainTabs .tab-btn.active');
                if (activeBtn) {
                    const currentTab = activeBtn.dataset.tab;
                    if (currentTab === 'layers' && lastTab !== 'layers') {
                        renderLayersPanel();
                    }
                    lastTab = currentTab;
                }
            }, 500);
        }
        
        document.addEventListener('mouseup', () => {
            const activeBtn = document.querySelector('#mainTabs .tab-btn.active');
            if (activeBtn && activeBtn.dataset.tab === 'layers') {
                setTimeout(renderLayersPanel, 50);
            }
        });
    } catch (e) {
        console.error("Init layers error:", e);
    }
})();

function getSortedZIndexes(excludeEl) {
    const arr = Array.from(document.querySelectorAll(".canvas-el, .callout-wrap, .callout-item, .co-neon-block, .canvas-icon"))
        .filter(el => el !== excludeEl && el.id !== "canva-render-layer" && el.id !== "photo-layer" && !el.closest("svg"))
        .map(el => parseInt(window.getComputedStyle(el).zIndex) || 10)
        .sort((a,b) => a - b);
    return arr;
}
window.moveLayerUp = function() {
    if(!selectedEl) return;
    const currentZ = parseInt(window.getComputedStyle(selectedEl).zIndex) || 10;
    const zIndexes = getSortedZIndexes(selectedEl).filter(z => z > currentZ);
    if(zIndexes.length > 0) {
        selectedEl.style.setProperty("z-index", zIndexes[0] + 1, "important");
    } else {
        selectedEl.style.setProperty("z-index", currentZ + 1, "important");
    }
};
window.moveLayerDown = function() {
    if(!selectedEl) return;
    const currentZ = parseInt(window.getComputedStyle(selectedEl).zIndex) || 10;
    const zIndexes = getSortedZIndexes(selectedEl).filter(z => z < currentZ);
    if(zIndexes.length > 0) {
        selectedEl.style.setProperty("z-index", zIndexes[zIndexes.length-1] - 1, "important");
    } else {
        selectedEl.style.setProperty("z-index", Math.max(1, currentZ - 1), "important");
    }
};
window.moveLayerFront = function() {
    if(!selectedEl) return;
    const zIndexes = getSortedZIndexes(selectedEl);
    if(zIndexes.length > 0) {
        selectedEl.style.setProperty("z-index", zIndexes[zIndexes.length-1] + 10, "important");
    }
};
window.moveLayerBack = function() {
    if(!selectedEl) return;
    const zIndexes = getSortedZIndexes(selectedEl);
    if(zIndexes.length > 0) {
        selectedEl.style.setProperty("z-index", Math.max(1, zIndexes[0] - 10), "important");
    }
};

