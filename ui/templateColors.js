function showTemplateColorModal() {
    const existing = document.getElementById('proColorMatcherPanel');
    if (existing) {
        existing.remove();
        return; // Toggle behavior
    }
    
    // 1. Extract Colors from Canvas
    const colors = new Set();
    const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => { const hex = parseInt(x).toString(16); return hex.length === 1 ? '0' + hex : hex; }).join('');
    
    const addColor = (c) => {
        if(!c || c === 'none' || c === 'transparent') return;
        if(c.startsWith('#')) {
            if(c.length === 4) c = '#' + c[1]+c[1]+c[2]+c[2]+c[3]+c[3];
            colors.add(c.toLowerCase());
        }
        else if (c.startsWith('rgb')) {
            const match = c.match(/\d+/g);
            if(match && match.length >= 3) {
                colors.add(rgbToHex(match[0], match[1], match[2]));
            }
        }
    };
    
    // Basic defaults in case canvas is empty
    ['#ffffff', '#000000', '#3b82f6', '#94a3b8', '#0f172a'].forEach(c => colors.add(c));
    
    const elements = document.querySelectorAll('#kolaj-wrapper *, #canvas-container *');
    elements.forEach(el => {
        const style = window.getComputedStyle(el);
        addColor(style.color);
        addColor(style.backgroundColor);
        addColor(style.fill);
        addColor(style.stroke);
        if(el.getAttribute('fill')) addColor(el.getAttribute('fill'));
        if(el.getAttribute('stroke')) addColor(el.getAttribute('stroke'));
    });
    
    const palette = Array.from(colors).slice(0, 6);
    let paletteHtml = '';
    palette.forEach(c => {
        paletteHtml += '<div class="tc-palette-color" data-color="' + c + '" style="width:24px; height:24px; border-radius:50%; background-color:' + c + '; cursor:pointer; border:2px solid #fff; box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>';
    });

    // 2. Extract Elements to target
    const targetEls = [];
    document.querySelectorAll('.callout-wrapper, .saber-text, .dynamic-box').forEach(el => {
        let typeName = 'Öğe';
        let icon = 'fas fa-cube';
        if(el.classList.contains('callout-wrapper')) { typeName = 'Callout Etiketi'; icon = 'fas fa-comment-dots'; }
        if(el.classList.contains('saber-text')) { typeName = 'Serbest Yazı'; icon = 'fas fa-font'; }
        if(el.classList.contains('dynamic-box')) { typeName = 'Özel Kutu'; icon = 'fas fa-square'; }
        
        targetEls.push({ id: el.id, name: typeName, icon: icon, el: el });
    });

    let targetsHtml = '';
    if (targetEls.length === 0) {
        targetsHtml = '<div style="padding:10px; text-align:center; color:#94a3b8; font-size:12px;">Tuvalde uygun öğe bulunamadı.</div>';
    } else {
        targetEls.forEach((t, i) => {
            targetsHtml += '<label style="display:flex; align-items:center; gap:10px; padding:8px 12px; background:#1e1b38; margin-bottom:5px; border-radius:6px; cursor:pointer; font-size:13px; color:#e2e8f0; border:1px solid #2d264f;">' +
                '<input type="checkbox" class="tc-target-cb" value="' + t.id + '" checked style="accent-color:#6366f1;"> ' +
                '<i class="' + t.icon + '" style="color:#6366f1;"></i> ' + t.name +
            '</label>';
        });
    }

    // 3. Create Floating Panel
    const panel = document.createElement('div');
    panel.id = 'proColorMatcherPanel';
    panel.style.position = 'fixed';
    panel.style.top = '100px';
    panel.style.left = '320px'; // Next to sidebar
    panel.style.width = '440px';
    panel.style.backgroundColor = '#110c22'; // Dark purple/blue
    panel.style.borderRadius = '12px';
    panel.style.boxShadow = '0 15px 50px rgba(0,0,0,0.7)';
    panel.style.zIndex = '9999999';
    panel.style.border = '1px solid #322659';
    panel.style.fontFamily = 'sans-serif';
    panel.style.color = '#fff';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.overflow = 'hidden';

    // Panel Header (Draggable)
    const headerHtml = '<div id="tcPanelHeader" style="padding:15px 20px; background:linear-gradient(90deg, #1e1b38, #110c22); display:flex; justify-content:space-between; align-items:center; cursor:move; border-bottom:1px solid #322659;">' +
        '<div style="font-weight:bold; font-size:15px; display:flex; align-items:center; gap:8px;"><i class="fas fa-magic" style="color:#a855f7;"></i> PRO Renk Eşleştirici</div>' +
        '<button id="tcCloseBtn" style="background:transparent; border:none; color:#94a3b8; font-size:16px; cursor:pointer;"><i class="fas fa-times"></i></button>' +
    '</div>';

    // Panel Body
    const bodyHtml = '<div style="padding:20px; display:flex; flex-direction:column; gap:20px;">' +
        // Section: Ana Arka Plan
        '<div class="tc-section" style="background:#1a1630; padding:15px; border-radius:8px; border:1px solid #2d264f;">' +
            '<div style="font-size:10px; font-weight:bold; color:#a5b4fc; margin-bottom:10px; letter-spacing:1px;">ANA ARKA PLAN</div>' +
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<div style="display:flex; gap:8px; align-items:center;" class="tc-palettes-container" data-target="tcBgColor">' +
                    paletteHtml +
                '</div>' +
                '<input type="color" id="tcBgColor" value="#0f172a" style="width:28px; height:28px; border:none; border-radius:4px; padding:0; cursor:pointer;">' +
            '</div>' +
        '</div>' +
        
        // Section: Vurgu Rengi
        '<div class="tc-section" style="background:#1a1630; padding:15px; border-radius:8px; border:1px solid #2d264f;">' +
            '<div style="font-size:10px; font-weight:bold; color:#a5b4fc; margin-bottom:10px; letter-spacing:1px;">VURGU RENGİ</div>' +
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<div style="display:flex; gap:8px; align-items:center;" class="tc-palettes-container" data-target="tcAccentColor">' +
                    paletteHtml +
                '</div>' +
                '<input type="color" id="tcAccentColor" value="#3b82f6" style="width:28px; height:28px; border:none; border-radius:4px; padding:0; cursor:pointer;">' +
            '</div>' +
        '</div>' +
        
        // Section: Yazı Rengi
        '<div class="tc-section" style="background:#1a1630; padding:15px; border-radius:8px; border:1px solid #2d264f;">' +
            '<div style="font-size:10px; font-weight:bold; color:#a5b4fc; margin-bottom:10px; letter-spacing:1px;">YAZI RENGİ</div>' +
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<div style="display:flex; gap:8px; align-items:center;" class="tc-palettes-container" data-target="tcTextColor">' +
                    paletteHtml +
                '</div>' +
                '<input type="color" id="tcTextColor" value="#ffffff" style="width:28px; height:28px; border:none; border-radius:4px; padding:0; cursor:pointer;">' +
            '</div>' +
        '</div>' +
        
        // Info Text
        '<div style="font-size:11px; color:#94a3b8; display:flex; gap:8px;"><i class="fas fa-info-circle" style="margin-top:2px;"></i> Sistem renkleri otomatik buldu. İsterseniz yukarıdaki paletlerden tıklayarak renkleri değiştirebilirsiniz.</div>' +
        
        // Targets List
        '<div style="max-height:140px; overflow-y:auto; padding-right:5px; margin-top:5px;" class="tc-scrollbar">' +
            targetsHtml +
        '</div>' +
        
        // Action Buttons
        '<div style="display:flex; gap:12px; margin-top:10px;">' +
            '<button id="tcBtnCancel" style="flex:1; padding:12px; background:#1e1b38; color:#94a3b8; border:1px solid #2d264f; border-radius:8px; cursor:pointer; font-weight:bold; font-size:13px; transition:0.2s;">İptal</button>' +
            '<button id="tcBtnApply" style="flex:1; padding:12px; background:linear-gradient(45deg, #6366f1, #0ea5e9); color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:13px; box-shadow:0 4px 15px rgba(99,102,241,0.4); transition:0.2s;">Uygula</button>' +
        '</div>' +
    '</div>';

    panel.innerHTML = headerHtml + bodyHtml;
    
    // Add custom scrollbar style just for this panel
    const style = document.createElement('style');
    style.innerHTML = '.tc-scrollbar::-webkit-scrollbar { width: 6px; } .tc-scrollbar::-webkit-scrollbar-thumb { background: #322659; border-radius: 4px; }';
    panel.appendChild(style);

    document.body.appendChild(panel);

    // 4. Logic & Events
    
    // Close & Cancel
    const closePanel = () => panel.remove();
    document.getElementById('tcCloseBtn').addEventListener('click', closePanel);
    document.getElementById('tcBtnCancel').addEventListener('click', closePanel);
    
    // Palette clicks
    document.querySelectorAll('.tc-palettes-container').forEach(container => {
        const targetInputId = container.getAttribute('data-target');
        container.querySelectorAll('.tc-palette-color').forEach(dot => {
            dot.addEventListener('click', function() {
                const col = this.getAttribute('data-color');
                document.getElementById(targetInputId).value = col;
            });
        });
    });

    // Apply Button
    document.getElementById('tcBtnApply').addEventListener('click', () => {
        const bgCol = document.getElementById('tcBgColor').value;
        const acCol = document.getElementById('tcAccentColor').value;
        const txtCol = document.getElementById('tcTextColor').value;
        
        const checkedCbs = document.querySelectorAll('.tc-target-cb:checked');
        if(checkedCbs.length === 0) {
            alert('Lütfen uygulanacak en az bir öğe seçin.');
            return;
        }

        checkedCbs.forEach(cb => {
            const el = document.getElementById(cb.value);
            if(!el) return;
            
            if(el.classList.contains('callout-wrapper')) {
                const bgEl = el.querySelector('.callout-bg');
                if(bgEl) bgEl.style.fill = bgCol;
                const txtEl = el.querySelector('.callout-text');
                if(txtEl) txtEl.style.color = txtCol;
                const iconEl = el.querySelector('.callout-icon');
                if(iconEl) iconEl.style.fill = acCol;
                const pathEl = el.querySelector('.callout-path');
                if(pathEl && pathEl.getAttribute('stroke')) pathEl.setAttribute('stroke', acCol);
            }
            else if(el.classList.contains('saber-text')) {
                el.style.color = txtCol;
                el.style.textShadow = '0 0 10px ' + acCol;
            }
            else if(el.classList.contains('dynamic-box')) {
                el.style.backgroundColor = bgCol;
                el.style.color = txtCol;
                el.style.borderColor = acCol;
            }
        });
        
        // Sync with sidebar inputs if applicable
        if(document.getElementById('coBgColor')) document.getElementById('coBgColor').value = bgCol;
        if(document.getElementById('coTextColor')) document.getElementById('coTextColor').value = txtCol;
        if(document.getElementById('coIconColor')) document.getElementById('coIconColor').value = acCol;
        
        if(typeof applyCalloutSettings === 'function') applyCalloutSettings();

        // Don't close panel automatically, let user keep matching
        // (Just flash apply button to show success)
        const btn = document.getElementById('tcBtnApply');
        const origText = btn.innerText;
        btn.innerText = 'Uygulandı!';
        btn.style.background = '#10b981';
        setTimeout(() => {
            btn.innerText = origText;
            btn.style.background = 'linear-gradient(45deg, #6366f1, #0ea5e9)';
        }, 1500);
    });

    // Draggable Logic
    const header = document.getElementById('tcPanelHeader');
    let isDragging = false, startX, startY, initialLeft, initialTop;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = panel.offsetLeft;
        initialTop = panel.offsetTop;
        document.body.style.userSelect = 'none'; // Prevent text selection
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
