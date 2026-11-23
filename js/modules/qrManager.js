/**
 * QR Code Manager
 */

window.generateQRCode = function() {
    const urlInput = document.getElementById('qrUrlInput');
    if (!urlInput) return;
    
    const url = urlInput.value.trim();
    if (!url) {
        if (typeof window.showAppToast === 'function') window.showAppToast('Lütfen bir bağlantı adresi girin.', 'warning', 3000);
        else alert("Lütfen bir bağlantı adresi girin.");
        return;
    }

    // Geçici bir alan oluşturup QR'ı orada çizdiriyoruz
    const tempDiv = document.createElement('div');
    
    // QR kodu 512x512 yüksek çözünürlükte oluştur
    new QRCode(tempDiv, {
        text: url,
        width: 512,
        height: 512,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    // qrcode.js render işlemini genelde canvas'a asenkron olmadan anında yapar.
    // Ancak bazı durumlarda base64 img etiketini doldurması çok kısa süre alabilir.
    setTimeout(() => {
        let qrDataUrl = "";
        
        // Önce qrcode.js'nin ürettiği img elementini kontrol edelim (eğer varsa)
        const generatedImg = tempDiv.querySelector('img');
        if (generatedImg && generatedImg.src && generatedImg.src.startsWith('data:image')) {
            qrDataUrl = generatedImg.src;
        } else {
            // Eğer img yoksa canvas'ı alalım
            const generatedCanvas = tempDiv.querySelector('canvas');
            if (generatedCanvas) {
                qrDataUrl = generatedCanvas.toDataURL('image/png');
            }
        }

        if (!qrDataUrl) {
            if (typeof window.showAppToast === 'function') window.showAppToast('QR Kod oluşturulamadı. Lütfen tekrar deneyin.', 'error', 3500);
            else alert("QR Kod oluşturulamadı. Lütfen tekrar deneyin.");
            return;
        }

        // Tuvale ekleme işlemi
        addQRElementToCanvas(qrDataUrl);
        
        // Inputu temizle
        urlInput.value = '';
        
        // Tasarım / Yazı & Font sekmesine geçir
        if (typeof switchTab === 'function') {
            switchTab('font');
        }

    }, 50);
};

function addQRElementToCanvas(dataUrl) {
    const renderLayer = document.getElementById('canvas-container');
    if (!renderLayer) return;

    const imgEl = document.createElement('img');
    imgEl.src = dataUrl;
    imgEl.className = 'draggable canvas-el';
    
    // Varsayılan özellikler
    imgEl.style.position = 'absolute';
    imgEl.style.width = '150px';
    imgEl.style.height = 'auto';
    imgEl.style.aspectRatio = '1 / 1';
    imgEl.style.left = '50px';
    imgEl.style.top = '50px';
    imgEl.style.zIndex = '50'; // Callout'ların altında ama bg'nin üstünde mantıklı bir z-index
    imgEl.style.cursor = 'grab';
    imgEl.style.objectFit = 'contain';
    imgEl.style.borderRadius = '0px';
    imgEl.style.boxShadow = 'none';

    // Veri attributeları (Element panelinde düzenlenebilmesi için)
    imgEl.dataset.type = 'qr';
    imgEl.dataset.rotation = '0';
    imgEl.dataset.shadowVal = '0';
    imgEl.dataset.blurVal = '0';
    imgEl.dataset.storedBgOpacity = '100';

    renderLayer.appendChild(imgEl);

    // makeDraggable sistemini tetikle
    if (typeof makeDraggable === 'function') {
        makeDraggable(imgEl);
    }
    
    // Yeni eklenen elemanı otomatik olarak seç
    if (typeof selectElement === 'function') {
        setTimeout(() => selectElement(imgEl), 50);
    }

    // Geçmişe kaydet
    if (typeof window.recordHistory === 'function') {
        window.recordHistory('QR Kod Eklendi');
    }
}
