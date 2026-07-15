const fs = require('fs');

// 1. Update main.js
let mainjs = fs.readFileSync('main.js', 'utf8');

const oldInitLogic = `        if(canvasEl){
            canvasEl.style.width='1920px';
            canvasEl.style.height='1080px';
        }`;

const newInitLogic = `        if(canvasEl){
            if (window.innerWidth <= 768) {
                canvasEl.style.width='1080px';
                canvasEl.style.height='1920px';
            } else {
                canvasEl.style.width='1920px';
                canvasEl.style.height='1080px';
            }
            
            // Sync draw layer just in case
            const dl = document.getElementById('draw-layer');
            if(dl) { 
                dl.width = parseInt(canvasEl.style.width);
                dl.height = parseInt(canvasEl.style.height);
                dl.style.width = canvasEl.style.width;
                dl.style.height = canvasEl.style.height;
            }
        }`;

if (mainjs.includes('if(canvasEl)')) {
    mainjs = mainjs.replace(oldInitLogic, newInitLogic);
    fs.writeFileSync('main.js', mainjs, 'utf8');
    console.log('Updated main.js');
}

// 2. We also need to update core.js where it reads natural width fallback:
let corejs = fs.readFileSync('core.js', 'utf8');
// core.js uses 1920 fallback multiple times. We can replace them with a dynamic fallback.
corejs = corejs.replace(/uploadedImgW = img.naturalWidth \|\| 1920;/g, "uploadedImgW = img.naturalWidth || (window.innerWidth <= 768 ? 1080 : 1920);");
corejs = corejs.replace(/uploadedImgH = img.naturalHeight \|\| 1080;/g, "uploadedImgH = img.naturalHeight || (window.innerWidth <= 768 ? 1920 : 1080);");

corejs = corejs.replace(/const canvasW=parseInt\(canvasEl\.style\.width\)\|\|1920;/g, "const canvasW=parseInt(canvasEl.style.width)||(window.innerWidth<=768?1080:1920);");
corejs = corejs.replace(/const canvasH=parseInt\(canvasEl\.style\.height\)\|\|1080;/g, "const canvasH=parseInt(canvasEl.style.height)||(window.innerWidth<=768?1920:1080);");

fs.writeFileSync('core.js', corejs, 'utf8');
console.log('Updated core.js');

// Invalidate caches in app.html
let html = fs.readFileSync('app.html', 'utf8');
const newTimestamp = Date.now();
html = html.replace(/styles\.css\?v=\d+/, `styles.css?v=${newTimestamp}`);
html = html.replace(/main\.js\?v=\d+/, `main.js?v=${newTimestamp}`);
html = html.replace(/core\.js\?v=\d+/, `core.js?v=${newTimestamp}`);
fs.writeFileSync('app.html', html, 'utf8');
console.log('Invalidated caches');
