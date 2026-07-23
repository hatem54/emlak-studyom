const fs = require('fs');

// 1. UPDATE APP.HTML
let appHtml = fs.readFileSync('app.html', 'utf8');

const regex = /<div class="input-group">\s*<label>[^<]*Arka Plan Fotoğrafı[^<]*<\/label>\s*<input type="file" id="imageInput" onclick="this\.value=null" accept="image\/\*">\s*<\/div>/g;

const newImageInputGroup = `<div class="input-group">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
            <label style="margin-bottom:0;">📸 Arka Plan Fotoğrafı</label>
            <button id="removeImageBtn" class="btn-remove-outline" onclick="removeBackgroundImage()" style="display:none;">
                <i class="fa-solid fa-trash-can"></i> Sil
            </button>
        </div>
        <input type="file" id="imageInput" onclick="this.value=null" accept="image/*">
    </div>`;

if (appHtml.match(regex)) {
    appHtml = appHtml.replace(regex, newImageInputGroup);
    appHtml = appHtml.replace(/main\.js\?v=\d+/, 'main.js?v=' + Date.now());
    fs.writeFileSync('app.html', appHtml, 'utf8');
    console.log('Updated app.html via regex');
} else {
    console.log('Could not find match using regex in app.html');
}

// 2. UPDATE MAIN.JS
let mainJs = fs.readFileSync('main.js', 'utf8');

const mainJsRegex = /\$\('imageInput'\)\.addEventListener\('change',e=>\{[\s\S]*?r\.readAsDataURL\(f\);\s*\}\s*\}\);/g;

const newMainJsEvent = `$('imageInput').addEventListener('change',e=>{
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

if (mainJs.match(mainJsRegex)) {
    mainJs = mainJs.replace(mainJsRegex, newMainJsEvent);
    fs.writeFileSync('main.js', mainJs, 'utf8');
    console.log('Updated main.js event via regex');
} else {
    console.log('Could not find match using regex in main.js');
}
