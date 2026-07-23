const fs = require('fs');

let corejs = fs.readFileSync('core.js', 'utf8');

// The most reliable way to replace resizeCanvas is string manipulation
const fnStart = 'function resizeCanvas(){';
const fnEndStr = "canvasEl.style.transform='scale('+scaleFactor+')';";

const startIndex = corejs.indexOf(fnStart);
if (startIndex !== -1) {
    const endIndex = corejs.indexOf(fnEndStr, startIndex);
    if (endIndex !== -1) {
        const fullEndIndex = endIndex + fnEndStr.length;
        
        const newFnBody = `function resizeCanvas(){
    const w=document.querySelector('.canvas-wrapper');
    const pa=document.querySelector('.preview-area');
    if(!w || !pa) return;
    
    let canvasW = 1920;
    let canvasH = 1080;
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        canvasW = 1080;
        canvasH = 1920;
        if(canvasEl) {
            canvasEl.style.width = '1080px';
            canvasEl.style.height = '1920px';
        }
    } else {
        canvasW = parseInt(canvasEl.style.width) || 1920;
        canvasH = parseInt(canvasEl.style.height) || 1080;
    }
    
    const availableW = pa.clientWidth - 40; // padding
    const availableH = window.innerHeight - 150; // padding for top bar/margins
    
    const scaleW = availableW / canvasW;
    const scaleH = availableH / canvasH;
    
    scaleFactor = Math.min(scaleW, scaleH);
    
    w.style.width = (canvasW * scaleFactor) + 'px';
    w.style.height = (canvasH * scaleFactor) + 'px';
    w.style.aspectRatio = 'auto';
    
    // Crucial fix: center it horizontally using margin: 0 auto; on wrapper is fine.
    // Ensure the container fills the wrapper exactly.
    if(canvasEl) {
        canvasEl.style.transformOrigin = 'top left';
        canvasEl.style.transform = 'scale('+scaleFactor+')';
    }
`;
        corejs = corejs.substring(0, startIndex) + newFnBody + corejs.substring(fullEndIndex);
        fs.writeFileSync('core.js', corejs, 'utf8');
        console.log('Replaced resizeCanvas in core.js');
    }
}

// Invalidate cache
let html = fs.readFileSync('app.html', 'utf8');
const newTimestamp = Date.now();
html = html.replace(/core\.js\?+v=\d+/, `core.js?v=${newTimestamp}`);
html = html.replace(/core\.js"/, `core.js?v=${newTimestamp}"`);
fs.writeFileSync('app.html', html, 'utf8');
console.log('Cache invalidated');
