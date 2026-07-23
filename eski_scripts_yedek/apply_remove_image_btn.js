const fs = require('fs');

// 1. UPDATE APP.HTML
let appHtml = fs.readFileSync('app.html', 'utf8');

const oldImageInputGroup = `<div class="input-group"><label>📸 Arka Plan Fotoğrafı</label><input type="file" id="imageInput" onclick="this.value=null" accept="image/*"></div>`;
const newImageInputGroup = `<div class="input-group">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
        <label style="margin-bottom:0;">📸 Arka Plan Fotoğrafı</label>
        <button id="removeImageBtn" class="btn-remove-outline" onclick="removeBackgroundImage()" style="display:none;">
            <i class="fa-solid fa-trash-can"></i> Kaldır
        </button>
    </div>
    <input type="file" id="imageInput" onclick="this.value=null" accept="image/*">
</div>`;

if (appHtml.includes(oldImageInputGroup)) {
    appHtml = appHtml.replace(oldImageInputGroup, newImageInputGroup);
    // Bump cache
    appHtml = appHtml.replace(/main\.js\?v=\d+/, 'main.js?v=' + Date.now());
    fs.writeFileSync('app.html', appHtml, 'utf8');
    console.log('Updated app.html');
} else {
    console.log('Could not find exact match for image input group in app.html');
}

// 2. UPDATE STYLES.CSS
let css = fs.readFileSync('styles.css', 'utf8');
if (!css.includes('.btn-remove-outline')) {
    css += `\n
/* Remove Image Button */
.btn-remove-outline {
    background: transparent;
    border: 1px solid #ef4444;
    color: #ef4444;
    border-radius: 4px;
    padding: 3px 8px;
    font-size: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600;
    text-transform: uppercase;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}
.btn-remove-outline:hover {
    background: #ef4444;
    color: white;
}
`;
    fs.writeFileSync('styles.css', css, 'utf8');
    console.log('Updated styles.css');
} else {
    console.log('.btn-remove-outline already exists in styles.css');
}

// 3. UPDATE MAIN.JS
let mainJs = fs.readFileSync('main.js', 'utf8');

const oldImageInputEvent = `$('imageInput').addEventListener('change',e=>{
        const f=e.target.files[0];
        if(f){
            const r=new FileReader();
            r.onload=ev=>{
                uploadedImgUrl=ev.target.result; if(typeof trackImageSize==='function') trackImageSize(uploadedImgUrl);
                photoLayer.style.backgroundImage=\`url('\${ev.target.result}')\`;
                if(isCanvaMode)buildCanvaRender();
            };
            r.readAsDataURL(f);
        }
    });`;

const newImageInputEvent = `$('imageInput').addEventListener('change',e=>{
        const f=e.target.files[0];
        if(f){
            const r=new FileReader();
            r.onload=ev=>{
                uploadedImgUrl=ev.target.result; if(typeof trackImageSize==='function') trackImageSize(uploadedImgUrl);
                photoLayer.style.backgroundImage=\`url('\${ev.target.result}')\`;
                if(isCanvaMode)buildCanvaRender();
                
                const rmBtn = document.getElementById('removeImageBtn');
                if (rmBtn) rmBtn.style.display = 'inline-flex';
            };
            r.readAsDataURL(f);
        }
    });`;

if (mainJs.includes(oldImageInputEvent)) {
    mainJs = mainJs.replace(oldImageInputEvent, newImageInputEvent);
    fs.writeFileSync('main.js', mainJs, 'utf8');
    console.log('Updated image input listener in main.js');
} else {
    console.log('Could not find image input listener in main.js');
}

if (!mainJs.includes('function removeBackgroundImage()')) {
    mainJs += `\n
function removeBackgroundImage() {
    const imgInput = document.getElementById('imageInput');
    if (imgInput) imgInput.value = '';
    
    uploadedImgUrl = '';
    if (typeof trackImageSize === 'function') trackImageSize(null);
    
    const photoLayer = document.getElementById('photoLayer');
    if (photoLayer) {
        photoLayer.style.backgroundImage = 'none';
    }
    
    if (typeof isCanvaMode !== 'undefined' && isCanvaMode && typeof buildCanvaRender === 'function') {
        buildCanvaRender();
    }
    
    const btn = document.getElementById('removeImageBtn');
    if (btn) btn.style.display = 'none';
}
`;
    fs.writeFileSync('main.js', mainJs, 'utf8');
    console.log('Added removeBackgroundImage to main.js');
} else {
    console.log('removeBackgroundImage already exists in main.js');
}
