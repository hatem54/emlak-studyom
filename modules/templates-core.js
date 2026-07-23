// ==================== TEMPLATES CORE ====================
function refreshActiveCanvaTemplate(){
    if(document.getElementById('kolaj-wrapper')){
        if(typeof _kolajFormatGuncelle === 'function') _kolajFormatGuncelle();
        return;
    }

    if(typeof isCanvaMode === 'undefined' || !isCanvaMode) return;

    if(window.lastClickedTemplateElement) {
        window.lastClickedTemplateElement.classList.remove('active');
        window.lastClickedTemplateElement.click();
        return;
    }

    if (typeof activeCanvaId !== 'undefined' && activeCanvaId) {
        const exactCard = document.querySelector('.canva-tpl-card[data-id="' + activeCanvaId + '"]');
        if (exactCard) {
            exactCard.classList.remove('active');
            exactCard.click();
            return;
        }
    }

    const luksBtn = document.querySelector('#tpl-content-luks .template-btn.active');
    if(luksBtn){
        luksBtn.classList.remove('active');
        luksBtn.click();
        return;
    }

    const activeCard = document.querySelector('.canva-tpl-card.active');
    if(activeCard){
        activeCard.classList.remove('active');
        activeCard.click();
        return;
    }

    if(typeof activeCanvaId !== 'undefined' && activeCanvaId && typeof buildCanvaRender === 'function'){
        buildCanvaRender();
    }
}

window.showGlobalLoadingOverlay = function(durationMs, text) {
    if (document.getElementById('global-loading-mask')) return;
    const overlay = document.createElement('div');
    overlay.id = 'global-loading-mask';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = '#0f172a';
    overlay.style.zIndex = '9999999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.color = '#fbbf24';
    overlay.style.fontSize = '24px';
    overlay.style.fontWeight = 'bold';
    overlay.style.fontFamily = 'sans-serif';
    overlay.style.flexDirection = 'column';
    overlay.style.gap = '15px';
    const displayTxt = text || 'Şablon Yükleniyor...';
    overlay.innerHTML = '<div style="width: 50px; height: 50px; border: 5px solid #fbbf24; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div><div>' + displayTxt + '</div><style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>';
    document.body.appendChild(overlay);
    setTimeout(() => { if(overlay) overlay.remove(); }, durationMs || 500);
}

function setTemplate(k){
    try {
        if(window.showGlobalLoadingOverlay) window.showGlobalLoadingOverlay(400, "Görsel Hazırlanıyor...");
        if(typeof isCanvaMode !== 'undefined' && isCanvaMode) {
            isCanvaMode = false;
            if(typeof clearCanvaTemplate === 'function') clearCanvaTemplate(true);
        }
        activeLayout=k;
        document.querySelectorAll('.template-btn').forEach(b=>b.classList.toggle('active',b.id==='tpl-'+k));
        const t=TPL[k];
        if(!t) return; // Güvenlik kontrolü, eğer boş şablon veya geçersiz bir k geldiyse dur.
        applyStylePos(elBadge,t.badge);
        applyStylePos(elPrice,t.price);
        applyStylePos(elDetails,t.details);
        if(typeof elLogo !== 'undefined' && elLogo && t.logo) {
            applyStylePos(elLogo, t.logo);
        }
        deselectAll();
        renderData();
    } catch(err) {
        console.error("setTemplate HATA:", err);
        const errDiv = document.createElement('div');
        errDiv.style.position = 'fixed'; errDiv.style.top = '50px'; errDiv.style.left = '10px';
        errDiv.style.background = 'red'; errDiv.style.color = 'white'; errDiv.style.zIndex = '999999';
        errDiv.style.padding = '10px'; errDiv.style.fontSize = '14px';
        errDiv.innerText = "setTemplate HATA: " + err.message + "\n\n" + err.stack;
        document.body.appendChild(errDiv);
    }
}