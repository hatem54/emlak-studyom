function showTemplateColorModal() {
    const existing = document.getElementById('proColorMatcherPanel');
    if (existing) {
        existing.remove();
        return;
    }
    
    // 1. Extract Colors from Canvas
    const colorsMap = new Map(); // hex -> count
    
    const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => { 
        const hex = parseInt(x).toString(16); 
        return hex.length === 1 ? '0' + hex : hex; 
    }).join('');
    
    const addColor = (c) => {
        if(!c || c === 'none' || c === 'transparent' || c === 'rgba(0, 0, 0, 0)') return;
        let hex = '';
        if(c.startsWith('#')) {
            hex = c;
            if(hex.length === 4) hex = '#' + hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
        }
        else if (c.startsWith('rgb')) {
            const match = c.match(/\d+/g);
            if(match && match.length >= 3) {
                hex = rgbToHex(match[0], match[1], match[2]);
            }
        }
        if(hex) {
            hex = hex.toLowerCase();
            colorsMap.set(hex, (colorsMap.get(hex) || 0) + 1);
        }
    };
    
    // Extract from DOM elements
    document.querySelectorAll('#kolaj-wrapper *, #canvas-container *').forEach(el => {
        if(el.style && el.style.color) addColor(el.style.color);
        if(el.style && el.style.backgroundColor) addColor(el.style.backgroundColor);
        if(el.style && el.style.borderColor) addColor(el.style.borderColor);
        if(el.getAttribute('fill')) addColor(el.getAttribute('fill'));
        if(el.getAttribute('stroke')) addColor(el.getAttribute('stroke'));
        
        // Also check computed styles for specific elements only to avoid grabbing defaults
        if(el.classList.contains('callout-bg') || el.classList.contains('callout-text') || el.classList.contains('saber-text')) {
            const style = window.getComputedStyle(el);
            if(style.color) addColor(style.color);
            if(style.backgroundColor) addColor(style.backgroundColor);
            if(style.fill) addColor(style.fill);
        }
    });
    
    // Sort colors by frequency
    const sortedColors = Array.from(colorsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
        
    // Ensure we have at least some fallbacks
    if(!sortedColors.includes('#ffffff')) sortedColors.push('#ffffff');
    if(!sortedColors.includes('#000000')) sortedColors.push('#000000');
    
    const palette = sortedColors.slice(0, 7); // Take top 7 colors
    let paletteHtml = '';
    palette.forEach(c => {
        paletteHtml += '<div class="tc-palette-color" data-color="' + c + '" style="width:24px; height:24px; border-radius:50%; background-color:' + c + '; cursor:pointer; border:2px solid #fff; box-shadow:0 0 5px rgba(0,0,0,0.5); transition:transform 0.2s;"></div>';
    });

    // 2. Extract Canvas User Elements only
    let targetEls = [];
    const mainChildren = document.querySelectorAll('.canva-el, .callout-wrapper, .saber-text, .dynamic-box, .svg-icon');
    
    mainChildren.forEach((el, index) => {
        // Skip template overlays, main images, or full canvas elements
        if(el.id === 'masterImage' || el.id === 'masterImageContainer' || el.id === 'workArea' || el.id === 'drawCanvas' ||
           el.classList.contains('photo-inner-img') || el.classList.contains('canva-tpl-card') ||
           el.tagName.toLowerCase() === 'canvas') {
            return; 
        }
        
        if(!el.id) el.id = 'tc_target_' + index + '_' + Date.now();
        
        let typeName = 'Şekil';
        let groupName = 'shape';
        let icon = 'fas fa-shapes';
        
        if(el.classList.contains('callout-wrapper')) { 
            typeName = 'Callout'; groupName = 'callout'; icon = 'fas fa-comment-dots'; 
        }
        else if(el.classList.contains('saber-text')) { 
            typeName = 'Serbest Yazı'; groupName = 'text'; icon = 'fas fa-font'; 
        }
        else if(el.classList.contains('dynamic-box')) { 
            typeName = 'Özel Kutu'; groupName = 'box'; icon = 'fas fa-square'; 
        }
        else if(el.querySelector('svg') || el.tagName.toLowerCase() === 'svg' || el.classList.contains('icon-wrapper') || el.classList.contains('svg-icon')) {
            // Check if it's a drawPaths element for perfect naming
            let pObj = null;
            if(typeof drawPaths !== 'undefined') pObj = drawPaths.find(p => p.el === el || (el.id && p.el && p.el.id === el.id));
            
            if (pObj) {
                if(pObj.type === 'rect') { typeName = 'Kare'; groupName = 'draw'; icon = 'fas fa-square'; }
                else if(pObj.type === 'circle') { typeName = 'Daire'; groupName = 'draw'; icon = 'fas fa-circle'; }
                else if(pObj.type === 'polygon') { typeName = 'Çokgen'; groupName = 'draw'; icon = 'fas fa-draw-polygon'; }
                else if(pObj.type === 'arrow' || pObj.type === 'line') { typeName = 'Çizgi/Ok'; groupName = 'draw'; icon = 'fas fa-arrow-right'; }
                else { typeName = 'Çizim'; groupName = 'draw'; icon = 'fas fa-pen'; }
            } else {
                typeName = 'İkon'; groupName = 'icon'; icon = 'fas fa-star';
            }
        } 
        else {
            typeName = 'Çizim'; groupName = 'draw'; icon = 'fas fa-pen';
        }
        
        targetEls.push({ id: el.id, type: typeName, group: groupName, icon: icon, el: el, domIndex: index });
    });

    // Sort: First by Group, then by DOM index (insertion order)
    const groupOrder = { 'callout': 1, 'text': 2, 'box': 3, 'icon': 4, 'shape': 5, 'draw': 6 };
    targetEls.sort((a, b) => {
        if (groupOrder[a.group] !== groupOrder[b.group]) {
            return groupOrder[a.group] - groupOrder[b.group];
        }
        return a.domIndex - b.domIndex;
    });

    // Assign sequential names (e.g. Callout 1, Callout 2)
    const typeCounters = {};
    targetEls = targetEls.map(t => {
        if (!typeCounters[t.type]) typeCounters[t.type] = 1;
        else typeCounters[t.type]++;
        
        let contentText = '';
        if (t.group === 'callout') {
            const txt = t.el.querySelector('.callout-text');
            if (txt) contentText = txt.innerText || txt.textContent;
        } else if (t.group === 'text' || t.group === 'box') {
            contentText = t.el.innerText || t.el.textContent;
        }
        
        if(contentText && contentText.trim().length > 0) {
            let shortText = contentText.trim();
            if(shortText.length > 15) shortText = shortText.substring(0, 15) + '...';
            t.displayName = `${t.type} ${typeCounters[t.type]} ("${shortText}")`;
        } else {
            t.displayName = `${t.type} ${typeCounters[t.type]}`;
        }
        return t;
    });

    let targetsHtml = '';
    if (targetEls.length === 0) {
        targetsHtml = '<div style="padding:10px; text-align:center; color:#94a3b8; font-size:12px;">Tuvalde uygun öğe bulunamadı. Lütfen önce yazı, ikon veya etiket ekleyin.</div>';
    } else {
        targetEls.forEach((t) => {
            targetsHtml += '<div style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:#1e1b38; margin-bottom:6px; border-radius:6px; font-size:13px; color:#e2e8f0; border:1px solid #2d264f; transition:background 0.2s;" onmouseover="this.style.background=\'#2a254d\'" onmouseout="this.style.background=\'#1e1b38\'">' +
                '<div style="display:flex; align-items:center; gap:10px;">' +
                    '<i class="' + t.icon + '" style="color:#6366f1; width:16px; text-align:center;"></i> <span style="font-weight:500;">' + t.displayName + '</span>' +
                '</div>' +
                // Toggle Switch
                '<label class="tc-switch">' +
                    '<input type="checkbox" class="tc-target-cb" value="' + t.id + '" checked>' +
                    '<span class="tc-slider"></span>' +
                '</label>' +
            '</div>';
        });
    }

    // 3. Create Floating Panel
    const panel = document.createElement('div');
    panel.id = 'proColorMatcherPanel';
    panel.style.position = 'fixed';
    panel.style.top = '100px';
    panel.style.left = '320px';
    panel.style.width = '450px';
    panel.style.backgroundColor = '#110c22';
    panel.style.borderRadius = '12px';
    panel.style.boxShadow = '0 15px 50px rgba(0,0,0,0.8)';
    panel.style.zIndex = '9999999';
    panel.style.border = '1px solid #322659';
    panel.style.fontFamily = '"Inter", sans-serif';
    panel.style.color = '#fff';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.overflow = 'hidden';

    // Panel Header (Draggable)
    const headerHtml = '<div id="tcPanelHeader" style="padding:16px 20px; background:linear-gradient(90deg, #1e1b38, #110c22); display:flex; justify-content:space-between; align-items:center; cursor:move; border-bottom:1px solid #322659;">' +
        '<div style="font-weight:bold; font-size:16px; display:flex; align-items:center; gap:10px;"><i class="fas fa-magic" style="color:#a855f7;"></i> PRO Renk Eşleştirici</div>' +
        '<button id="tcCloseBtn" style="background:transparent; border:none; color:#94a3b8; font-size:18px; cursor:pointer; padding:0; transition:color 0.2s;" onmouseover="this.style.color=\'#fff\'" onmouseout="this.style.color=\'#94a3b8\'"><i class="fas fa-times"></i></button>' +
    '</div>';

    // Extract dominant color to be default (or palette[0])
    const defaultBg = palette[0] || '#0f172a';
    const defaultAccent = palette[1] || '#3b82f6';
    const defaultText = palette[2] || '#ffffff';

    // Panel Body
    const bodyHtml = '<div style="padding:20px; display:flex; flex-direction:column; gap:16px; max-height:80vh; overflow-y:auto;" class="tc-scrollbar">' +
        // Section: Ana Arka Plan
        '<div class="tc-section" style="background:#1a1630; padding:15px; border-radius:10px; border:1px solid #2d264f;">' +
            '<div style="font-size:11px; font-weight:700; color:#a5b4fc; margin-bottom:12px; letter-spacing:1px; display:flex; justify-content:space-between;">' +
                '<span>ANA ARKA PLAN</span>' +
                '<div style="display:flex; align-items:center; gap:8px;">' +
                    '<span style="font-size:10px; color:#94a3b8; text-transform:none; letter-spacing:0;">Aktif</span>' +
                    '<label class="tc-switch">' +
                        '<input type="checkbox" id="tcHasBg" checked>' +
                        '<span class="tc-slider"></span>' +
                    '</label>' +
                '</div>' +
            '</div>' +
            '<div id="tcBgContainer" style="display:flex; justify-content:space-between; align-items:center; transition:opacity 0.2s;">' +
                '<div style="display:flex; gap:8px; align-items:center;" class="tc-palettes-container" data-target="tcBgColor">' +
                    paletteHtml +
                '</div>' +
                '<input type="color" id="tcBgColor" value="' + defaultBg + '" style="width:36px; height:36px; border:2px solid #2d264f; border-radius:6px; padding:0; cursor:pointer; background:transparent;">' +
            '</div>' +
        '</div>' +
        
        // Section: Vurgu Rengi
        '<div class="tc-section" style="background:#1a1630; padding:15px; border-radius:10px; border:1px solid #2d264f;">' +
            '<div style="font-size:11px; font-weight:700; color:#a5b4fc; margin-bottom:12px; letter-spacing:1px;">VURGU RENGİ (ÇERÇEVE/İKON)</div>' +
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<div style="display:flex; gap:8px; align-items:center;" class="tc-palettes-container" data-target="tcAccentColor">' +
                    paletteHtml +
                '</div>' +
                '<input type="color" id="tcAccentColor" value="' + defaultAccent + '" style="width:36px; height:36px; border:2px solid #2d264f; border-radius:6px; padding:0; cursor:pointer; background:transparent;">' +
            '</div>' +
        '</div>' +
        
        // Section: Yazı Rengi
        '<div class="tc-section" style="background:#1a1630; padding:15px; border-radius:10px; border:1px solid #2d264f;">' +
            '<div style="font-size:11px; font-weight:700; color:#a5b4fc; margin-bottom:12px; letter-spacing:1px;">YAZI RENGİ</div>' +
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<div style="display:flex; gap:8px; align-items:center;" class="tc-palettes-container" data-target="tcTextColor">' +
                    paletteHtml +
                '</div>' +
                '<input type="color" id="tcTextColor" value="' + defaultText + '" style="width:36px; height:36px; border:2px solid #2d264f; border-radius:6px; padding:0; cursor:pointer; background:transparent;">' +
            '</div>' +
        '</div>' +
        
        // Targets List
        '<div style="margin-top:5px;">' +
            '<div style="font-size:12px; font-weight:600; color:#fff; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">' +
                '<span>Hedef Ögeleri Seçin</span>' +
                '<button id="tcSelectAll" style="background:transparent; border:none; color:#a5b4fc; cursor:pointer; font-size:11px; font-weight:bold; transition:color 0.2s;" onmouseover="this.style.color=\'#fff\'" onmouseout="this.style.color=\'#a5b4fc\'">Tümünü Seç / Kaldır</button>' +
            '</div>' +
            '<div style="max-height:200px; overflow-y:auto; padding-right:5px; border-radius:6px;" class="tc-scrollbar">' +
                targetsHtml +
            '</div>' +
        '</div>' +
        
        // Action Buttons
        '<div style="display:flex; gap:12px; margin-top:10px;">' +
            '<button id="tcBtnApply" style="flex:1; padding:14px; background:linear-gradient(45deg, #6366f1, #8b5cf6); color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:14px; box-shadow:0 4px 15px rgba(99,102,241,0.5); transition:transform 0.1s, box-shadow 0.2s;" onmousedown="this.style.transform=\'scale(0.98)\'" onmouseup="this.style.transform=\'scale(1)\'">Seçili Ögelere Uygula</button>' +
        '</div>' +
    '</div>';

    panel.innerHTML = headerHtml + bodyHtml;
    
    // Add custom styles (including the Toggle Switch styling!)
    const style = document.createElement('style');
    style.innerHTML = `
        .tc-scrollbar::-webkit-scrollbar { width: 8px; } 
        .tc-scrollbar::-webkit-scrollbar-track { background: #110c22; border-radius: 4px; }
        .tc-scrollbar::-webkit-scrollbar-thumb { background: #322659; border-radius: 4px; border: 2px solid #110c22; }
        .tc-palette-color:hover { transform: scale(1.2); }
        
        /* Custom Toggle Switch CSS */
        .tc-switch { position: relative; display: inline-block; width: 36px; height: 20px; margin: 0; }
        .tc-switch input { opacity: 0; width: 0; height: 0; }
        .tc-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #334155; transition: .4s; border-radius: 34px; border: 1px solid #1e293b; }
        .tc-slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%; }
        .tc-switch input:checked + .tc-slider { background-color: #6366f1; border-color: #4f46e5; }
        .tc-switch input:checked + .tc-slider:before { transform: translateX(16px); }
    `;
    panel.appendChild(style);

    document.body.appendChild(panel);

    // 4. Logic & Events
    const closePanel = () => panel.remove();
    document.getElementById('tcCloseBtn').addEventListener('click', closePanel);
    
    // Toggle Background input
    const tcHasBg = document.getElementById('tcHasBg');
    const tcBgContainer = document.getElementById('tcBgContainer');
    tcHasBg.addEventListener('change', (e) => {
        tcBgContainer.style.opacity = e.target.checked ? '1' : '0.4';
        tcBgContainer.style.pointerEvents = e.target.checked ? 'auto' : 'none';
    });

    // Select all logic
    const tcSelectAllBtn = document.getElementById('tcSelectAll');
    if(tcSelectAllBtn) {
        tcSelectAllBtn.addEventListener('click', () => {
            const allCbs = document.querySelectorAll('.tc-target-cb');
            // If all are checked, uncheck all. Otherwise, check all.
            const allChecked = Array.from(allCbs).every(cb => cb.checked);
            allCbs.forEach(cb => cb.checked = !allChecked);
        });
    }

    // Palette clicks to update inputs
    document.querySelectorAll('.tc-palettes-container').forEach(container => {
        const targetInputId = container.getAttribute('data-target');
        container.querySelectorAll('.tc-palette-color').forEach(dot => {
            dot.addEventListener('click', function() {
                const col = this.getAttribute('data-color');
                document.getElementById(targetInputId).value = col;
            });
        });
    });

    // Apply Logic
    document.getElementById('tcBtnApply').addEventListener('click', () => {
        const bgCol = document.getElementById('tcBgColor').value;
        const acCol = document.getElementById('tcAccentColor').value;
        const txtCol = document.getElementById('tcTextColor').value;
        const applyBg = document.getElementById('tcHasBg').checked;
        
        const checkedCbs = document.querySelectorAll('.tc-target-cb:checked');
        if(checkedCbs.length === 0) {
            alert('Lütfen uygulanacak en az bir öğe seçin.');
            return;
        }

        checkedCbs.forEach(cb => {
            const el = document.getElementById(cb.value);
            if(!el) return;
            
            // If the element is currently selected globally, update global inputs too
            const isSelected = (typeof selectedCalloutEl !== 'undefined' && selectedCalloutEl === el);
            
            if(el.classList.contains('callout-wrapper')) {
                if(applyBg) {
                    const bgEl = el.querySelector('.callout-bg');
                    if(bgEl) bgEl.style.fill = bgCol;
                    if(isSelected && document.getElementById('coBgColor')) document.getElementById('coBgColor').value = bgCol;
                }
                const txtEl = el.querySelector('.callout-text');
                if(txtEl) txtEl.style.color = txtCol;
                if(isSelected && document.getElementById('coTextColor')) document.getElementById('coTextColor').value = txtCol;
                
                const iconEl = el.querySelector('.callout-icon');
                if(iconEl) iconEl.style.fill = acCol;
                const pathEl = el.querySelector('.callout-path');
                if(pathEl && pathEl.getAttribute('stroke')) pathEl.setAttribute('stroke', acCol);
                if(isSelected && document.getElementById('coIconColor')) document.getElementById('coIconColor').value = acCol;
            }
            else if(el.classList.contains('saber-text')) {
                el.style.color = txtCol;
                el.style.textShadow = '0 0 10px ' + acCol; // Custom effect for text
            }
            else if(el.classList.contains('dynamic-box')) {
                if(applyBg) el.style.backgroundColor = bgCol;
                el.style.color = txtCol;
                el.style.borderColor = acCol;
            }
            else {
                // Generic handler for SVGs, Icons, Shapes
                let isSvgWrapper = (el.tagName.toLowerCase() === 'svg' || el.querySelector('svg'));
                
                if (isSvgWrapper) {
                    const svg = el.tagName.toLowerCase() === 'svg' ? el : el.querySelector('svg');
                    const paths = svg.querySelectorAll('path, rect, circle, polygon, ellipse, line, polyline');
                    
                    if (applyBg) {
                        if (svg.getAttribute('fill') && svg.getAttribute('fill') !== 'none') {
                            svg.setAttribute('fill', bgCol);
                        }
                        paths.forEach(p => {
                            if (p.getAttribute('fill') && p.getAttribute('fill') !== 'none') {
                                p.setAttribute('fill', bgCol);
                            }
                        });
                    }
                    
                    // Stroke color should always apply, regardless of applyBg (since it's a separate option)
                    paths.forEach(p => {
                        if (p.getAttribute('stroke') && p.getAttribute('stroke') !== 'none') {
                            p.setAttribute('stroke', acCol);
                        }
                    });
                } else if(applyBg && !el.classList.contains('drawing-layer') && !el.classList.contains('icon-wrapper') && !el.classList.contains('canva-el')) {
                    // Only apply background color if it's a pure HTML element that is meant to have a background
                    el.style.backgroundColor = bgCol;
                }
                
                if(!isSvgWrapper) {
                    el.style.color = txtCol;
                    el.style.borderColor = acCol;
                }
                
                // Keep drawing paths in sync so it survives redraws!
                if(typeof drawPaths !== 'undefined' && Array.isArray(drawPaths)) {
                    const pObj = drawPaths.find(p => p.el === el || (el.id && p.el && p.el.id === el.id));
                    if(pObj) {
                        if(applyBg) {
                            pObj.fillColor = bgCol;
                            pObj.fillOpacity = 1; // Force opacity so redraw shows the fill
                        }
                        pObj.color = acCol; // Stroke color
                    }
                }
            }
        });
        
        if(typeof applyCalloutSettings === 'function') applyCalloutSettings();
        if(typeof updateDrawHistory === 'function') updateDrawHistory();
        if(typeof redrawAll === 'function') redrawAll();

        const btn = document.getElementById('tcBtnApply');
        const origText = btn.innerText;
        btn.innerText = '✓ Uygulandı!';
        btn.style.background = '#10b981';
        setTimeout(() => {
            btn.innerText = origText;
            btn.style.background = 'linear-gradient(45deg, #6366f1, #8b5cf6)';
        }, 1500);
    });

    // Make Panel Draggable
    const header = document.getElementById('tcPanelHeader');
    let isDragging = false, startX, startY, initialLeft, initialTop;

    header.addEventListener('mousedown', (e) => {
        if(e.target.id === 'tcCloseBtn' || e.target.closest('#tcCloseBtn')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = panel.offsetLeft;
        initialTop = panel.offsetTop;
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if(!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        panel.style.left = (initialLeft + dx) + 'px';
        panel.style.top = (initialTop + dy) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.style.userSelect = '';
    });
}
