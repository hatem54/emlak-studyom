const fs = require('fs');

// 1. Update core.js
let corejs = fs.readFileSync('core.js', 'utf8');

// A. Replace resizeCanvas
const resizeRegex = /function resizeCanvas\(\)\{[\s\S]*?canvasEl\.style\.transform\s*=\s*'scale\('\+scaleFactor\+'\)';\s*\}/m;
const newResize = `function resizeCanvas(){
    const w = document.querySelector('.canvas-wrapper');
    const pa = document.querySelector('.preview-area');
    if (!w || !pa) return;
    
    let canvasW = 1920;
    let canvasH = 1080;
    
    const formatSelect = document.getElementById('previewFormat');
    if (formatSelect && typeof EXPORT_FORMATS !== 'undefined' && EXPORT_FORMATS[formatSelect.value]) {
        canvasW = EXPORT_FORMATS[formatSelect.value].w;
        canvasH = EXPORT_FORMATS[formatSelect.value].h;
    } else {
        if (window.innerWidth <= 768) {
            canvasW = 1080;
            canvasH = 1920;
        }
    }
    
    if (typeof canvasEl !== 'undefined' && canvasEl) {
        canvasEl.style.width = canvasW + 'px';
        canvasEl.style.height = canvasH + 'px';
    }
    
    const availableW = pa.clientWidth - 0;
    const availableH = window.innerHeight - 150;
    
    const scaleW = availableW / canvasW;
    const scaleH = availableH / canvasH;
    
    scaleFactor = Math.min(scaleW, scaleH);
    
    w.style.width = (canvasW * scaleFactor) + 'px';
    w.style.height = (canvasH * scaleFactor) + 'px';
    w.style.aspectRatio = 'auto';
    
    if(typeof canvasEl !== 'undefined' && canvasEl) {
        canvasEl.style.transformOrigin = 'top left';
        canvasEl.style.transform = 'scale(' + scaleFactor + ')';
    }
}`;
if (corejs.match(resizeRegex)) {
    corejs = corejs.replace(resizeRegex, newResize);
} else {
    console.log('Could not find resizeCanvas to replace in core.js');
}

// B. Replace trackImageSize
const trackRegex = /function trackImageSize\(url\)\s*\{[\s\S]*?img\.src = url;\s*\}/m;
const newTrack = `function trackImageSize(url) {
    const img = new Image();
    img.onload = function() {
        uploadedImgW = img.naturalWidth || (window.innerWidth <= 768 ? 1080 : 1920);
        uploadedImgH = img.naturalHeight || (window.innerWidth <= 768 ? 1920 : 1080);
        const pl = document.getElementById('photo-layer');
        if (pl) {
            pl.dataset.naturalW = uploadedImgW;
            pl.dataset.naturalH = uploadedImgH;
        }
        
        // Auto-adjust format
        if (typeof autoAdjustFormat === 'function') {
            autoAdjustFormat(uploadedImgW, uploadedImgH);
        }
        
        if(typeof redrawAll === 'function') redrawAll();
    };
    img.src = url;
}

function autoAdjustFormat(imgW, imgH) {
    if (typeof EXPORT_FORMATS === 'undefined' || !imgW || !imgH) return;
    
    const imgRatio = imgW / imgH;
    let closestFormatName = '';
    let smallestDiff = Infinity;
    
    for (const [name, data] of Object.entries(EXPORT_FORMATS)) {
        const formatRatio = data.w / data.h;
        const diff = Math.abs(imgRatio - formatRatio);
        if (diff < smallestDiff) {
            smallestDiff = diff;
            closestFormatName = name;
        }
    }
    
    if (closestFormatName) {
        console.log('Auto-adjusting format to:', closestFormatName, 'based on image size:', imgW, imgH);
        const formatSelect = document.getElementById('previewFormat');
        const exportSelect = document.getElementById('exportFormat');
        
        if (formatSelect) {
            formatSelect.value = closestFormatName;
            if (typeof switchPreviewFormat === 'function') {
                switchPreviewFormat();
            }
        }
        if (exportSelect) {
            exportSelect.value = closestFormatName;
        }
    }
}
`;
if (corejs.match(trackRegex)) {
    corejs = corejs.replace(trackRegex, newTrack);
} else {
    console.log('Could not find trackImageSize to replace in core.js');
}
fs.writeFileSync('core.js', corejs, 'utf8');

// 2. Update app.html
let html = fs.readFileSync('app.html', 'utf8');

const injectedScriptRegex = /<script>\s*\(function\(\)\s*\{\s*function forceMobileCanvas\(\)\s*\{[\s\S]*?\}\)\(\);\s*<\/script>/m;
if (html.match(injectedScriptRegex)) {
    html = html.replace(injectedScriptRegex, '');
}

const ts = Date.now();
html = html.replace(/core\.js\?v=\d+/, `core.js?v=${ts}`);
html = html.replace(/main\.js\?v=\d+/, `main.js?v=${ts}`);

fs.writeFileSync('app.html', html, 'utf8');
console.log('Updates applied successfully.');
