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

    // 2. Extract Elements to target (and show their text)
    const targetEls = [];
    document.querySelectorAll('.callout-wrapper, .saber-text, .dynamic-box').forEach((el, index) => {
        if(!el.id) el.id = 'tc_target_' + index + '_' + Date.now();
        
        let typeName = 'Öğe';
        let icon = 'fas fa-cube';
        let contentText = '';
        
        if(el.classList.contains('callout-wrapper')) { 
            typeName = 'Callout Etiketi'; icon = 'fas fa-comment-dots'; 
            const txt = el.querySelector('.callout-text');
            if(txt) contentText = txt.innerText || txt.textContent;
        }
        else if(el.classList.contains('saber-text')) { 
            typeName = 'Serbest Yazı'; icon = 'fas fa-font'; 
            contentText = el.innerText || el.textContent;
        }
        else if(el.classList.contains('dynamic-box')) { 
            typeName = 'Özel Kutu'; icon = 'fas fa-square'; 
            contentText = el.innerText || el.textContent;
        }
        
        if(contentText && contentText.length > 20) contentText = contentText.substring(0, 20) + '...';
        const displayName = contentText ? `${typeName}: "${contentText}"` : typeName;
        
        targetEls.push({ id: el.id, name: displayName, icon: icon, el: el });
    });

    let targetsHtml = '';
    if (targetEls.length === 0) {
        targetsHtml = '<div style="padding:10px; text-align:center; color:#94a3b8; font-size:12px;">Tuvalde öğe bulunamadı. Lütfen önce yazı veya etiket ekleyin.</div>';
    } else {
        targetEls.forEach((t) => {
            targetsHtml += '<label style="display:flex; align-items:center; gap:10px; padding:10px 12px; background:#1e1b38; margin-bottom:6px; border-radius:6px; cursor:pointer; font-size:13px; color:#e2e8f0; border:1px solid #2d264f; transition:background 0.2s;" onmouseover="this.style.background=\'#2a254d\'" onmouseout="this.style.background=\'#1e1b38\'">' +
                '<input type="checkbox" class="tc-target-cb" value="' + t.id + '" checked style="accent-color:#6366f1; width:16px; height:16px;"> ' +
                '<i class="' + t.icon + '" style="color:#6366f1; width:16px; text-align:center;"></i> <span style="font-weight:500;">' + t.name + '</span>' +
            '</label>';
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
                '<label style="display:flex; align-items:center; gap:5px; cursor:pointer; color:#fff; text-transform:none; letter-spacing:0;"><input type="checkbox" id="tcHasBg" checked style="accent-color:#a5b4fc;"> Aktif</label>' +
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
                '<button id="tcSelectAll" style="background:transparent; border:none; color:#a5b4fc; cursor:pointer; font-size:11px; font-weight:bold;">Tümünü Seç</button>' +
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
    
    // Add custom styles
    const style = document.createElement('style');
    style.innerHTML = `
        .tc-scrollbar::-webkit-scrollbar { width: 8px; } 
        .tc-scrollbar::-webkit-scrollbar-track { background: #110c22; border-radius: 4px; }
        .tc-scrollbar::-webkit-scrollbar-thumb { background: #322659; border-radius: 4px; border: 2px solid #110c22; }
        .tc-palette-color:hover { transform: scale(1.2); }
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
            const allChecked = Array.from(allCbs).every(cb => cb.checked);
            allCbs.forEach(cb => cb.checked = !allChecked);
            tcSelectAllBtn.innerText = allChecked ? "Tümünü Seç" : "Hiçbirini Seçme";
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
                el.style.textShadow = '0 0 10px ' + acCol;
            }
            else if(el.classList.contains('dynamic-box')) {
                if(applyBg) el.style.backgroundColor = bgCol;
                el.style.color = txtCol;
                el.style.borderColor = acCol;
            }
        });
        
        if(typeof applyCalloutSettings === 'function') applyCalloutSettings();
        if(typeof updateDrawHistory === 'function') updateDrawHistory();

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
