const fs = require('fs');

let content = fs.readFileSync('modules/export.js', 'utf8');

// The new logic to inject for safeMasterImage
const safeMasterLogic = `    let safeMasterImage = window.masterImageBase64;
    if (!safeMasterImage) {
        const pLayer = document.getElementById('photo-layer');
        if (pLayer && pLayer.style.backgroundImage && pLayer.style.backgroundImage !== 'none') {
            safeMasterImage = pLayer.style.backgroundImage.replace(/^url\\(['"]?/, '').replace(/['"]?\\)$/, '');
        }
    }`;

// 1. In saveImage()
content = content.replace(
    /const scaleVal1 = \$\('exportScale'\)\?\$\('exportScale'\)\.value:'1\.5';\s*if \(scaleVal1 === 'original' && window\.masterImageBase64\)/g,
    `const scaleVal1 = $('exportScale')?$('exportScale').value:'1.5';\n\n${safeMasterLogic}\n\n    if (scaleVal1 === 'original' && safeMasterImage)`
);
content = content.replace(
    /if \(scaleVal1 === 'original' && window\.masterImageBase64\) \{\s*const tempImg = new Image\(\);\s*await new Promise\(r => \{ tempImg\.onload = r; tempImg\.onerror = r; tempImg\.src = window\.masterImageBase64; \}\);/g,
    `if (scaleVal1 === 'original' && safeMasterImage) {\n          const tempImg = new Image();\n          await new Promise(r => { tempImg.onload = r; tempImg.onerror = r; tempImg.src = safeMasterImage; });`
);
// replace the `if (window.masterImageBase64 && outputScale > 1.5)`
content = content.replace(
    /if \(window\.masterImageBase64 && outputScale > 1\.5\) \{\s*\/\/ Preload master image\s*masterImgElement = new Image\(\);\s*const loadPromise = new Promise\(r => \{\s*masterImgElement\.onload = r;\s*masterImgElement\.onerror = r;\s*\}\);\s*masterImgElement\.src = window\.masterImageBase64;/g,
    `if (safeMasterImage && outputScale > 1.5) {\n            // Preload master image\n            masterImgElement = new Image();\n            const loadPromise = new Promise(r => {\n                masterImgElement.onload = r;\n                masterImgElement.onerror = r;\n            });\n            masterImgElement.src = safeMasterImage;`
);

// 2. In processBatchExport()
content = content.replace(
    /const scaleVal2 = \$\('exportScale'\)\.value;\s*if \(scaleVal2 === 'original' && window\.masterImageBase64\)/g,
    `const scaleVal2 = $('exportScale').value;\n\n${safeMasterLogic}\n\n    if (scaleVal2 === 'original' && safeMasterImage)`
);
content = content.replace(
    /if \(scaleVal2 === 'original' && window\.masterImageBase64\) \{\s*const tempImg = new Image\(\);\s*await new Promise\(r => \{ tempImg\.onload = r; tempImg\.onerror = r; tempImg\.src = window\.masterImageBase64; \}\);/g,
    `if (scaleVal2 === 'original' && safeMasterImage) {\n          const tempImg = new Image();\n          await new Promise(r => { tempImg.onload = r; tempImg.onerror = r; tempImg.src = safeMasterImage; });`
);
content = content.replace(
    /if \(window\.masterImageBase64 && outputScale > 1\.5\) \{\s*masterImgElementBatch = new Image\(\);\s*const loadPromiseBatch = new Promise\(r => \{\s*masterImgElementBatch\.onload = r;\s*masterImgElementBatch\.onerror = r;\s*\}\);\s*masterImgElementBatch\.src = window\.masterImageBase64;/g,
    `if (safeMasterImage && outputScale > 1.5) {\n            masterImgElementBatch = new Image();\n            const loadPromiseBatch = new Promise(r => {\n                masterImgElementBatch.onload = r;\n                masterImgElementBatch.onerror = r;\n            });\n            masterImgElementBatch.src = safeMasterImage;`
);


fs.writeFileSync('modules/export.js', content);
console.log('Successfully ported v1.7 export logic.');
