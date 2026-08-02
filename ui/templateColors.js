function showTemplateColorModal() {
    // Check if modal exists
    if(document.getElementById('templateColorModal')) {
        document.getElementById('templateColorModal').remove();
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'templateColorModal';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
    overlay.style.zIndex = '9999999';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    
    const box = document.createElement('div');
    box.style.background = '#1e293b';
    box.style.padding = '20px';
    box.style.borderRadius = '10px';
    box.style.width = '320px';
    box.style.color = '#fff';
    box.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    
    box.innerHTML = 
        '<h3 style="margin-top:0; border-bottom:1px solid #334155; padding-bottom:10px; font-size:16px;">Şablon Renklerini Eşleştir</h3>' +
        '<div style="margin-bottom:15px;">' +
            '<label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">' +
                '<input type="checkbox" id="tcHasBg" checked> ' +
                'Şablon arka plan rengi var mı?' +
            '</label>' +
            '<div id="tcBgContainer" style="margin-top:8px; display:flex; align-items:center; gap:10px;">' +
                '<input type="color" id="tcBgColor" value="#ffffff" style="width:30px; height:30px; padding:0; border:none;">' +
                '<span style="font-size:12px;">Arka Plan Rengi</span>' +
            '</div>' +
        '</div>' +
        '<div style="margin-bottom:15px; display:flex; align-items:center; gap:10px;">' +
            '<input type="color" id="tcTextColor" value="#000000" style="width:30px; height:30px; padding:0; border:none;">' +
            '<span style="font-size:12px;">Yazı Rengi</span>' +
        '</div>' +
        '<div style="margin-bottom:20px; display:flex; align-items:center; gap:10px;">' +
            '<input type="color" id="tcAccentColor" value="#3b82f6" style="width:30px; height:30px; padding:0; border:none;">' +
            '<span style="font-size:12px;">Vurgu / Çerçeve Rengi</span>' +
        '</div>' +
        '<div style="display:flex; gap:10px;">' +
            '<button id="tcCancelBtn" style="flex:1; padding:8px; background:#475569; color:#fff; border:none; border-radius:5px; cursor:pointer;">İptal</button>' +
            '<button id="tcApplyBtn" style="flex:1; padding:8px; background:#3b82f6; color:#fff; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">Onayla</button>' +
        '</div>';
    
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    
    const tcHasBg = document.getElementById('tcHasBg');
    const tcBgContainer = document.getElementById('tcBgContainer');
    
    tcHasBg.addEventListener('change', (e) => {
        tcBgContainer.style.opacity = e.target.checked ? '1' : '0.4';
        tcBgContainer.style.pointerEvents = e.target.checked ? 'auto' : 'none';
    });
    
    document.getElementById('tcCancelBtn').addEventListener('click', () => {
        overlay.remove();
    });
    
    document.getElementById('tcApplyBtn').addEventListener('click', () => {
        if(typeof selectedCalloutEl === 'undefined' || !selectedCalloutEl) {
            alert('Lütfen eşleştirmek için bir Callout (Etiket) seçin!');
            overlay.remove();
            return;
        }
        
        const textColor = document.getElementById('tcTextColor').value;
        const accentColor = document.getElementById('tcAccentColor').value;
        const hasBg = document.getElementById('tcHasBg').checked;
        const bgColor = document.getElementById('tcBgColor').value;
        
        const txtEl = selectedCalloutEl.querySelector('.callout-text');
        if(txtEl) txtEl.style.color = textColor;
        if(document.getElementById('coTextColor')) {
            document.getElementById('coTextColor').value = textColor;
        }
        
        if(hasBg) {
            const bgEl = selectedCalloutEl.querySelector('.callout-bg');
            if(bgEl) bgEl.style.fill = bgColor;
            if(document.getElementById('coBgColor')) {
                document.getElementById('coBgColor').value = bgColor;
            }
        }
        
        const iconEl = selectedCalloutEl.querySelector('.callout-icon');
        if(iconEl) iconEl.style.fill = accentColor;
        
        const pathEl = selectedCalloutEl.querySelector('.callout-path');
        if(pathEl && pathEl.getAttribute('stroke')) {
            pathEl.setAttribute('stroke', accentColor);
        }
        
        if(document.getElementById('coIconColor')) {
            document.getElementById('coIconColor').value = accentColor;
        }
        
        if(typeof applyCalloutSettings === 'function') {
            applyCalloutSettings();
        }
        
        overlay.remove();
    });
}
