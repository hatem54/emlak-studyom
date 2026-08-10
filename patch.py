with open('main.js', 'r', encoding='utf-8') as f:
    data = f.read()

inject = """
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
"""

data = data.replace('function buildTemplates', inject + '\nfunction buildTemplates')

data = data.replace(
"""        $('logoInput').addEventListener('change', e => {
            const f = e.target.files[0];
            if(f){""", 
"""        $('logoInput').addEventListener('change', e => {
            const f = e.target.files[0];
            if(!f) return;
            if(!window.validateImageUpload(f)) { e.target.value = ''; return; }
            if(f){"""
)

data = data.replace(
"""        $('imageInput').addEventListener('change',e=>{
            const f=e.target.files[0];
            if(!f) return;

            const processPhotoChange = () => {""", 
"""        $('imageInput').addEventListener('change',e=>{
            const f=e.target.files[0];
            if(!f) return;
            if(!window.validateImageUpload(f)) { e.target.value = ''; return; }

            const processPhotoChange = () => {"""
)

data = data.replace(
"""        if($('batchInput'))$('batchInput').addEventListener('change',e=>{batchFiles=batchFiles.concat(Array.from(e.target.files));renderBatchList();e.target.value='';});""",
"""        if($('batchInput'))$('batchInput').addEventListener('change',e=>{
            const validFiles = Array.from(e.target.files).filter(f => window.validateImageUpload(f));
            if(validFiles.length > 0) {
                batchFiles=batchFiles.concat(validFiles);
                renderBatchList();
            }
            e.target.value='';
        });"""
)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(data)
