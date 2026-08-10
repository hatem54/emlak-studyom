// ==================== TEMPLATES CORE ====================
function refreshActiveCanvaTemplate(retryCount = 0){
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
        } else if (retryCount < 20) {
            // Wait for dynamic template cards to generate (e.g. during page load / recovery)
            setTimeout(() => refreshActiveCanvaTemplate(retryCount + 1), 300);
            return;
        }
        console.warn('refreshActiveCanvaTemplate: ' + activeCanvaId + ' bulunamadi. Geri yukleme iptal edildi.');
        return;
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

// Global click listener to track active template ID for auto-save and re-renders
document.addEventListener('click', function(e) {
    const card = e.target.closest('.canva-tpl-card');
    if (card && card.dataset.id) {
        if (typeof activeCanvaId !== 'undefined') activeCanvaId = card.dataset.id;
        else window.activeCanvaId = card.dataset.id;
        
        if (typeof isCanvaMode !== 'undefined') isCanvaMode = true;
        else window.isCanvaMode = true;
        
        // Force an immediate auto-save so we don't lose the selection if they refresh instantly
        if (typeof performAutoSave === 'function') {
            performAutoSave();
        }
    }
});

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
        if(typeof applyPhotoFilters === 'function') applyPhotoFilters();
        
        if(typeof requestAutoSave === 'function') requestAutoSave();
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
// ========== UNIFIED TEMPLATE ENGINE ==========
window.renderCanvaTemplate = function(htmlString) {
    if(typeof _kolajTemizle === 'function') _kolajTemizle();
    
    document.querySelectorAll('.normal-el').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.canva-generated, .canva-panel').forEach(e => e.remove());
    
    const photoLayer = document.getElementById('photo-layer');
    const canvaRenderLayer = document.getElementById('canva-render-layer');
    if(!canvaRenderLayer) return;
        // IMPORTANT: Keep photo-layer visible for background!
      if(photoLayer) {
          photoLayer.style.display = 'block';
          
          // Apply background settings globally
          const xCtrl = document.getElementById('photoXCtrl');
          const yCtrl = document.getElementById('photoYCtrl');
          const zoomCtrl = document.getElementById('photoZoomCtrl');
          
          // YENİ: Şablon değiştiğinde zoom ve pan'i zorla sıfırla ki görsel patlamasın/zoomlu gelmesin!
          if (xCtrl) xCtrl.value = 50;
          if (yCtrl) yCtrl.value = 50;
          if (zoomCtrl) zoomCtrl.value = 100;
          
          const x = 50;
          const y = 50;
          const zoom = 100;
          const sizeStr = 'cover';
          
          if(typeof applyPhotoPos === 'function') applyPhotoPos();
          
          if (typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl) {
              photoLayer.style.backgroundImage = "url('" + uploadedImgUrl + "')";
          } else if (typeof masterImageBase64 !== 'undefined' && masterImageBase64) {
              photoLayer.style.backgroundImage = "url('" + masterImageBase64 + "')";
          }
          
          photoLayer.style.backgroundPosition = x + "% " + y + "%";
          photoLayer.style.backgroundSize = sizeStr;
      }
    canvaRenderLayer.style.display = 'block';
    if(typeof isCanvaMode !== 'undefined') isCanvaMode = true;
    else window.isCanvaMode = true;
    
    // 1920x1080 referansina gore gercek cozunurluk hesaplamalari
    const canvasEl = document.getElementById('canvas-container');
    const fullW = parseInt(canvasEl.style.width) || 1920;
    const fullH = parseInt(canvasEl.style.height) || 1080;
    const scaleXFn = (val) => (val / 1920) * fullW;
    const scaleYFn = (val) => (val / 1080) * fullH;
    const scaleMin = (val) => val * Math.min(fullW/1920, fullH/1080);
    
    let fHtml = htmlString;
    // Scale inline CSS
    fHtml = fHtml.replace(/font-size:\$\{scaleY\((\d+)\)\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10))));
    fHtml = fHtml.replace(/font-size:\$\{scaleX\((\d+)\)\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10))));
    fHtml = fHtml.replace(/font-size:\$\{scaleMin\((\d+)\)\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10))));
    fHtml = fHtml.replace(/padding:\$\{scaleMin\((\d+)\)\}/g, (m, p1) => 'padding:' + Math.round(scaleMin(parseInt(p1, 10))));
    fHtml = fHtml.replace(/\$\{scaleMin\((\d+)\)\}/g, (m, p1) => Math.round(scaleMin(parseInt(p1, 10))));
    fHtml = fHtml.replace(/\$\{scaleX\((\d+)\)\}/g, (m, p1) => Math.round(scaleXFn(parseInt(p1, 10))));
    fHtml = fHtml.replace(/\$\{scaleY\((\d+)\)\}/g, (m, p1) => Math.round(scaleYFn(parseInt(p1, 10))));
    fHtml = fHtml.replace(/\$\{fullH\}/g, fullH);
    
    canvaRenderLayer.innerHTML = fHtml;
    
    // Bind interaction logic
    canvaRenderLayer.querySelectorAll('.photo-panel').forEach(el => {
        if(typeof bindPhotoPanel === 'function') enablePhotoDrag(el);
    });
    canvaRenderLayer.querySelectorAll('.editable-text').forEach(el => {
        if(typeof enableInlineEdit === 'function') enableInlineEdit(el);
    });
    
    requestAnimationFrame(() => {
        if(typeof applyPhotoFilters === 'function') applyPhotoFilters();
        if(typeof redrawAll === 'function') redrawAll();
    });
};

