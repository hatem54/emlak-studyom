import re

with open('main.js', 'r', encoding='utf-8') as f:
    data = f.read()

start_idx = data.find("    if($('imageInput')){")
end_idx = data.find("function bindPhotoFilters(){")

image_block = """    if($('imageInput')){
        $('imageInput').addEventListener('change',e=>{
            const f=e.target.files[0];
            if(!f) return;
            if(!window.validateImageUpload(f)) { e.target.value = ''; return; }

            const processPhotoChange = () => {
                const r=new FileReader();
                r.onload=ev=>{
                    uploadedImgUrl=ev.target.result; if(typeof trackImageSize==='function') trackImageSize(uploadedImgUrl);
                    
                    // PRELOAD NATIVE IMAGE FOR INSTANT CANVAS RENDERING
                    window._globalNativeImgSrc = uploadedImgUrl;
                    window._globalNativeImg = new Image();
                    window._globalNativeImg.onload = () => console.log('Preloaded global image for instant drag');
                    window._globalNativeImg.src = uploadedImgUrl;
                    
                    photoLayer.style.backgroundImage=`url('${ev.target.result}')`;
                    if (isCanvaMode) {
                        if (typeof refreshActiveCanvaTemplate === 'function') refreshActiveCanvaTemplate();
                        else if (typeof buildCanvaRender === 'function') buildCanvaRender();
                    }
                    if ($('clearBgBtn')) $('clearBgBtn').style.display = 'block';
                };
                r.readAsDataURL(f);
                $('imageInput').value = '';
            };

            // Eğer çizim varsa kullanıcıyı uyar (AŞAMA 3 - KORUMA KURALLARI)
            if (typeof drawPaths !== 'undefined' && drawPaths.length > 0) {
                const modal = document.createElement('div');
                modal.id = 'photo-change-warning-modal';
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100%';
                modal.style.height = '100%';
                modal.style.backgroundColor = 'rgba(15,23,42,0.9)';
                modal.style.zIndex = '9999999';
                modal.style.display = 'flex';
                modal.style.alignItems = 'center';
                modal.style.justifyContent = 'center';
                modal.style.backdropFilter = 'blur(5px)';

                modal.innerHTML = `
                    <div style="background: #1e293b; padding: 30px; border-radius: 12px; width: 420px; max-width: 90%; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; color: white; font-family: 'Inter', sans-serif;">
                        <h3 style="margin-top:0; color:#f87171; font-size: 1.3rem;">⚠️ Çizimler Bulunuyor</h3>
                        <p style="font-size: 1rem; line-height: 1.5; margin-bottom: 25px; color:#cbd5e1;">Bu tasarımda fotoğraf üzerine eklenmiş çizimler bulunuyor. Fotoğraf değişirse bu işaretler yeni görselle uyumunu kaybedebilir.</p>
                        <div style="display:flex; justify-content:center; gap: 15px;">
                            <button id="photo-change-cancel" style="background: #475569; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: background 0.2s;">Vazgeç</button>
                            <button id="photo-change-confirm" style="background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: background 0.2s;">Değiştir ve Çizimleri Sil</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);

                document.getElementById('photo-change-cancel').onclick = () => {
                    modal.remove();
                    $('imageInput').value = ''; 
                };

                document.getElementById('photo-change-confirm').onclick = () => {
                    modal.remove();
                    drawPaths.length = 0; // Çizimleri temizle
                    if (typeof redrawAll === 'function') redrawAll(); // DOM'dan sil
                    processPhotoChange();
                };
            } else {
                processPhotoChange();
            }
        });
    }
}
"""

if start_idx != -1 and end_idx != -1:
    data = data[:start_idx] + image_block + data[end_idx:]
    with open('main.js', 'w', encoding='utf-8') as f:
        f.write(data)
    print("PATCH APPLIED!")
else:
    print("COULD NOT FIND INDEX!")
