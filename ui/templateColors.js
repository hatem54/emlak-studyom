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
    
    const colorNames = {
        'white': '#ffffff', 'black': '#000000', 'red': '#ff0000', 'green': '#008000', 
        'blue': '#0000ff', 'yellow': '#ffff00', 'transparent': 'none'
    };
    
    const addColor = (c) => {
        if(!c || c === 'none' || c === 'transparent' || c === 'rgba(0, 0, 0, 0)') return;
        let hex = '';
        
        // Convert basic colors to hex if present
        if(colorNames[c.toLowerCase()]) {
            c = colorNames[c.toLowerCase()];
            if (c === 'none') return;
        }

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
        // Ignore UI control elements
        if(el.classList.contains('callout-select-border') || 
           el.classList.contains('callout-controls') || 
           el.classList.contains('callout-resizer') || 
           el.classList.contains('callout-rotator') || 
           el.classList.contains('text-handle') || 
           el.classList.contains('text-lock-handle') || 
           el.classList.contains('resize-handle') || 
           el.classList.contains('rot-handle')) return;

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

    // 2. Extract Canvas User Elements (All possible objects)
    let targetEls = [];
    const elements = document.querySelectorAll('#kolaj-wrapper > *, #canvas-container > *, #ui-layer > *, .editable-text, .canvas-el, .cvi-item, .canva-el, .callout-wrapper, .callout-wrap, .co-neon-block, .saber-text, .dynamic-box, .svg-icon, .lp-item');
    let uniqueElements = Array.from(new Set(elements));
    
    // First, REMOVE structural layers from the list so they don't act as parents and accidentally filter out their children
    uniqueElements = uniqueElements.filter(el => {
        const id = el.id || '';
        if(id === 'masterImage' || id === 'masterImageContainer' || 
           id === 'workArea' || id === 'drawCanvas' || id === 'draw-layer' ||
           id === 'photo-layer' || id === 'shadow-overlay' || 
           id === 'highlight-overlay' || id === 'vignette-layer' || 
           id === 'mask-layer' || id === 'canva-render-layer' || 
           id === 'ui-layer') {
            return false; 
        }
        
        if(el.classList.contains('photo-inner-img') || 
           el.classList.contains('canva-tpl-card') ||
           el.classList.contains('drawing-layer') ||
           el.classList.contains('resize-handle') || 
           el.classList.contains('rot-handle') ||
           el.tagName.toLowerCase() === 'canvas') {
            return false; 
        }
        return true;
    });

    // Now filter out nested duplicates (e.g. an svg-icon inside a callout-wrapper or callout-wrap)
    const topLevelElements = uniqueElements.filter(el => {
        return !uniqueElements.some(parentEl => parentEl !== el && parentEl.contains(el));
    });
    
    topLevelElements.forEach((el, index) => {
        if(!el.id) el.id = 'tc_target_' + index + '_' + Date.now();
        
        let typeName = 'Öge';
        let groupName = 'shape';
        let icon = 'fas fa-layer-group';
        
        if(el.classList.contains('callout-wrapper') || el.classList.contains('callout-wrap') || el.classList.contains('co-neon-block')) {
            typeName = 'Callout'; groupName = 'callout'; icon = 'fas fa-comment-dots'; 
        }
        else if(el.classList.contains('editable-draw')) {
            let pObj = null;
            if(typeof drawPaths !== 'undefined') pObj = drawPaths.find(p => p.el === el || (el.id && p.el && p.el.id === el.id));
            if (!pObj) {
                // This is a zombie clone restored by autoSave! Clean it up.
                el.remove();
                return;
            }
            if(pObj.type === 'rect') { typeName = 'Kare'; groupName = 'draw'; icon = 'fas fa-square'; }
            else if(pObj.type === 'circle') { typeName = 'Daire'; groupName = 'draw'; icon = 'fas fa-circle'; }
            else if(pObj.type === 'polygon') { typeName = 'Çokgen'; groupName = 'draw'; icon = 'fas fa-draw-polygon'; }
            else if(pObj.type === 'arrow' || pObj.type === 'line') { typeName = 'Çizgi/Ok'; groupName = 'draw'; icon = 'fas fa-arrow-right'; }
            else { typeName = 'Çizim'; groupName = 'draw'; icon = 'fas fa-pen'; }
        }
        else if(el.classList.contains('saber-text') || el.dataset.label === 'Serbest Yazı') { 
            typeName = 'Serbest Yazı'; groupName = 'free-text'; icon = 'fas fa-font'; 
        }
        else if(el.classList.contains('dynamic-box') || el.dataset.label === 'Özel Kutu') { 
            typeName = 'Özel Kutu'; groupName = 'free-text'; icon = 'fas fa-square'; 
        }
        else if(el.querySelector('svg') || el.tagName.toLowerCase() === 'svg' || el.classList.contains('icon-wrapper') || el.classList.contains('svg-icon')) {
            typeName = 'İkon'; groupName = 'icon'; icon = 'fas fa-star';
        } 
        else if (el.classList.contains('editable-text') || el.classList.contains('lp-item') || el.classList.contains('sh-badge') || el.classList.contains('sh-price') || el.classList.contains('sh-box') || el.classList.contains('cvi-item') || el.classList.contains('canva-el') || el.classList.contains('canvas-el')) {
            typeName = 'Yazı/Etiket'; groupName = 'text'; icon = 'fas fa-font';
        }
        else {
            typeName = 'Öge'; groupName = 'shape'; icon = 'fas fa-layer-group';
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

    // Assign Names (User wants raw text without numbering)
    targetEls = targetEls.map(t => {
        let contentText = '';
        if (t.group === 'callout') {
            const txt = t.el.querySelector('.callout-text');
            if (txt) contentText = txt.innerText || txt.textContent;
        } else if (t.group === 'text' || t.group === 'box' || t.group === 'free-text') {
            contentText = t.el.innerText || t.el.textContent;
        }
        
        if(contentText && contentText.trim().length > 0) {
            let shortText = contentText.trim().replace(/\n/g, ' ');
            if(shortText.length > 25) shortText = shortText.substring(0, 25) + '...';
            t.displayName = shortText;
        } else {
            t.displayName = t.type;
        }
        return t;
    });

    let targetsHtml = '';
    if (targetEls.length === 0) {
        targetsHtml = '<div style="padding:10px; text-align:center; color:#94a3b8; font-size:12px;">Tuvalde uygun öge bulunamadı. Lütfen önce yazı, ikon veya etiket ekleyin.</div>';
    } else {
        const groupTitles = {
            'text': 'Şablon Öğeleri (Yazılar)',
            'free-text': 'Serbest Yazılar',
            'draw': 'Çizim ve Şekiller',
            'callout': 'Callout Etiketleri',
            'box': 'Özel Kutular',
            'icon': 'İkonlar',
            'shape': 'Diğer Öğeler'
        };

        const groupedEls = {};
        targetEls.forEach(t => {
            if(!groupedEls[t.group]) groupedEls[t.group] = [];
            groupedEls[t.group].push(t);
        });

        for (const [gKey, items] of Object.entries(groupedEls)) {
            const title = groupTitles[gKey] || 'Öğeler';
            const isTemplate = (gKey === 'text');
            const displayStyle = isTemplate ? 'none' : 'block';
            const chevronTransform = isTemplate ? 'rotate(0deg)' : 'rotate(180deg)';
            const isCheckedStr = isTemplate ? '' : 'checked';
            let itemsHtml = '';
            
            items.forEach((t) => {
                itemsHtml += `<div class="tc-item-row" data-id="${t.id}" style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:#1e1b38; margin-bottom:6px; border-radius:6px; font-size:13px; color:#e2e8f0; border:1px solid #2d264f; transition:background 0.2s, border 0.2s; cursor:pointer;" onmouseover="if(this.style.borderColor !== 'rgb(168, 85, 247)') this.style.background='#2a254d'" onmouseout="if(this.style.borderColor !== 'rgb(168, 85, 247)') this.style.background='#1e1b38'" onclick="if(typeof selectElement === 'function' && event.target.tagName !== 'INPUT' && !event.target.classList.contains('tc-slider')) { selectElement(document.getElementById('${t.id}')); }">` +
                    '<div style="display:flex; align-items:center; gap:10px; flex:1; overflow:hidden;">' +
                        '<i class="' + t.icon + '" style="color:#6366f1; width:16px; text-align:center; flex-shrink:0;"></i> <span style="font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="' + t.displayName + '">' + t.displayName + '</span>' +
                    '</div>' +
                    // Toggle Switch
                    '<label class="tc-switch" style="flex-shrink:0;">' +
                        '<input type="checkbox" class="tc-target-cb" value="' + t.id + '" ' + isCheckedStr + '>' +
                        '<span class="tc-slider"></span>' +
                    '</label>' +
                '</div>';
            });
            
            targetsHtml += `
            <div class="tc-accordion" style="margin-bottom:8px; border:1px solid #2d264f; border-radius:6px; overflow:hidden;">
                <div class="tc-accordion-header" style="padding:10px 12px; background:#1a1630; cursor:pointer; display:flex; justify-content:space-between; align-items:center; color:#a5b4fc; font-weight:600; font-size:12px; transition:background 0.2s;" onclick="const content = this.nextElementSibling; const icon = this.querySelector('i'); if(content.style.display === 'none') { content.style.display = 'block'; icon.style.transform = 'rotate(180deg)'; } else { content.style.display = 'none'; icon.style.transform = 'rotate(0deg)'; }">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span>${title}</span>
                        <span style="background:#322659; color:#e2e8f0; padding:2px 6px; border-radius:10px; font-size:10px;">${items.length}</span>
                    </div>
                    <i class="fas fa-chevron-down" style="transition:transform 0.3s; transform:${chevronTransform};"></i>
                </div>
                <div class="tc-accordion-content" style="padding:8px; background:#110c22; display:${displayStyle};">
                    ${itemsHtml}
                </div>
            </div>`;
        }
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
        '<div style="display:flex; align-items:center; gap:15px;">' +
            '<button id="tcRefreshBtn" title="Listeyi Yenile" style="background:transparent; border:none; color:#94a3b8; font-size:16px; cursor:pointer; padding:0; transition:color 0.2s;" onmouseover="this.style.color=\'#fff\'" onmouseout="this.style.color=\'#94a3b8\'" onclick="document.getElementById(\'proColorMatcherPanel\').remove(); setTimeout(() => showTemplateColorModal(), 10)"><i class="fas fa-sync-alt"></i></button>' +
            '<button id="tcCloseBtn" style="background:transparent; border:none; color:#94a3b8; font-size:18px; cursor:pointer; padding:0; transition:color 0.2s;" onmouseover="this.style.color=\'#fff\'" onmouseout="this.style.color=\'#94a3b8\'"><i class="fas fa-times"></i></button>' +
        '</div>' +
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
            
            if(el.classList.contains('callout-wrapper') || el.classList.contains('callout-wrap') || el.classList.contains('co-neon-block')) {
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
                // Categorize the element
                let isSvgWrapper = (el.tagName.toLowerCase() === 'svg' || el.querySelector('svg'));
                let isPureText = el.classList.contains('editable-text') || el.classList.contains('lp-item') || el.classList.contains('cvi-item') || el.classList.contains('sh-price') || el.classList.contains('sh-badge');
                
                // Find if this is a draw.js managed shape
                let pObj = null;
                if(typeof drawPaths !== 'undefined' && Array.isArray(drawPaths)) {
                    pObj = drawPaths.find(p => p.el === el || (el.id && p.el && p.el.id === el.id));
                }
                
                if (pObj) {
                    // Drawn Shapes (Kare, Daire, vb)
                    // User explicit request: "çizimlerin içi boyanmasın sadece rengi degişecek"
                    // ONLY update stroke color (acCol). Do NOT touch fillColor or fillOpacity.
                    pObj.color = acCol;
                    
                    // Rebuild the perfect SVG from the engine and inject it!
                    if (typeof createSVGFromPath === 'function') {
                        const newEl = createSVGFromPath(pObj);
                        if (newEl && newEl.innerHTML) {
                            el.innerHTML = newEl.innerHTML;
                        }
                    }
                } 
                else if (isSvgWrapper) {
                    // Normal non-drawn SVG (e.g. static icons in template)
                    const svg = el.tagName.toLowerCase() === 'svg' ? el : el.querySelector('svg');
                    const paths = svg.querySelectorAll('path, rect, circle, polygon, ellipse, line, polyline');
                    
                    if (applyBg) {
                        if (svg.hasAttribute('fill') && svg.getAttribute('fill') !== 'none') {
                            svg.setAttribute('fill', bgCol);
                            svg.setAttribute('fill-opacity', '1');
                        }
                        paths.forEach(p => {
                            if (p.hasAttribute('fill') && p.getAttribute('fill') !== 'none') {
                                p.setAttribute('fill', bgCol);
                                p.setAttribute('fill-opacity', '1');
                            }
                        });
                    }
                    
                    paths.forEach(p => {
                        if (p.getAttribute('stroke') && p.getAttribute('stroke') !== 'none') {
                            p.setAttribute('stroke', acCol);
                        }
                    });
                } 
                else if (isPureText) {
                    // Pure text elements
                    // User explicit request: "sadece yazı varsa yazı rengi seçilen ona uygulanacak"
                    el.style.color = txtCol;
                }
                else {
                    // Generic HTML elements
                    if(applyBg && !el.classList.contains('drawing-layer') && !el.classList.contains('icon-wrapper') && !el.classList.contains('canva-el')) {
                        el.style.backgroundColor = bgCol;
                    }
                    el.style.color = txtCol;
                    el.style.borderColor = acCol;
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
    
    // Highlight currently selected element in the list
    const syncInterval = setInterval(() => {
        if(!document.getElementById('proColorMatcherPanel')) {
            clearInterval(syncInterval);
            return;
        }
        
        const activeEl = typeof selectedCalloutEl !== 'undefined' ? selectedCalloutEl : 
                         (typeof selectedElement !== 'undefined' ? selectedElement : null);
                         
        document.querySelectorAll('.tc-item-row').forEach(row => {
            if(activeEl && row.getAttribute('data-id') === activeEl.id) {
                row.style.borderColor = '#a855f7';
                row.style.background = '#2a254d';
            } else {
                row.style.borderColor = '#2d264f';
                row.style.background = '#1e1b38';
            }
        });
    }, 500);
}
