import re
import subprocess
import os

# 1. Reset main.js to git baseline
subprocess.run(['git', 'checkout', 'main.js'])

with open('main.js', 'r', encoding='utf-8') as f:
    data = f.read()

# 2. Inject validateImageUpload
inject = '''
// Global image validation logic (Format and Size restriction)
window.validateImageUpload = function(file) {
    if (!file) return false;
    
    // 1. Format Check (Block RAW, HEIC, TIFF etc.)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Desteklenmeyen Format!',
                html: 'Lütfen sadece <b>JPG</b>, <b>PNG</b> veya <b>WebP</b> türünde bir görsel yükleyin.<br><br><span style="font-size: 0.9em; color: #cbd5e1;">RAW, TIFF veya HEIC gibi ham/ağır formatlar tarayıcıda doğrudan açılamaz.</span>',
                icon: 'error',
                background: '#1e293b',
                color: '#fff',
                confirmButtonColor: '#3b82f6'
            });
        } else {
            alert('Desteklenmeyen Format! Lütfen sadece JPG, PNG veya WebP türünde bir görsel yükleyin.');
        }
        return false;
    }
    
    // 2. Size Check (Max 20MB)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Dosya Çok Büyük!',
                text: 'Dosya boyutu çok yüksek (maksimum 20 MB). Lütfen küçültüp tekrar deneyin.',
                icon: 'warning',
                background: '#1e293b',
                color: '#fff',
                confirmButtonColor: '#3b82f6'
            });
        } else {
            alert('Dosya Çok Büyük! Maksimum 20 MB yükleyebilirsiniz.');
        }
        return false;
    }
    
    return true;
};
'''

if 'window.validateImageUpload' not in data:
    data = data.replace('function buildTemplates', inject + '\nfunction buildTemplates')

# 3. Patch logoInput
logo_target = """        $('logoInput').addEventListener('change', e => {
            const f = e.target.files[0];
            if(f){"""
logo_replace = """        $('logoInput').addEventListener('change', e => {
            const f = e.target.files[0];
            if (!f) return;
            if (!window.validateImageUpload(f)) { e.target.value = ''; return; }
            if(f){"""
data = data.replace(logo_target, logo_replace)


# 4. Patch imageInput (complete replacement to include AŞAMA 3)
start_idx = data.find("    if($('imageInput')){")
end_idx = data.find("    function bindPhotoFilters(){")

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
"""

if start_idx != -1 and end_idx != -1:
    data = data[:start_idx] + image_block + data[end_idx:]


# 5. Patch batchInput
batch_target = "if($('batchInput'))$('batchInput').addEventListener('change',e=>{batchFiles=batchFiles.concat(Array.from(e.target.files));renderBatchList();e.target.value='';});"
batch_replace = """if($('batchInput'))$('batchInput').addEventListener('change',e=>{
            const validFiles = Array.from(e.target.files).filter(f => window.validateImageUpload(f));
            if(validFiles.length > 0) {
                batchFiles=batchFiles.concat(validFiles);
                renderBatchList();
            }
            e.target.value='';
        });"""
data = data.replace(batch_target, batch_replace)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(data)
