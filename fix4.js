const fs = require('fs');

// Patch 1: modules/export.js
let exportJs = fs.readFileSync('modules/export.js', 'utf8');
const searchString = `let customBg = window.getComputedStyle(canvasEl).backgroundColor;
        if (customBg && customBg !== 'rgba(0, 0, 0, 0)' && customBg !== 'transparent') {
            ctx.fillStyle = customBg;
            ctx.fillRect(0, 0, targetW, targetH);
        }`;
const replaceString = `let customBg = window.getComputedStyle(canvasEl).backgroundColor;
        if (customBg && customBg !== 'rgba(0, 0, 0, 0)' && customBg !== 'transparent') {
            ctx.fillStyle = customBg;
            ctx.fillRect(0, 0, targetW, targetH);
        } else if (!masterImgObj || masterImgObj.width === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetW, targetH);
        }`;

exportJs = exportJs.replace(searchString, replaceString);
fs.writeFileSync('modules/export.js', exportJs, 'utf8');

// Patch 2: main.js
let mainJs = fs.readFileSync('main.js', 'utf8');
const mainSearchString = `// EYer izim varsa kullancy uyar (A?AMA 3 - KORUMA KURALLARI)
            if (typeof drawPaths !== 'undefined' && drawPaths.length > 0) {`;

// We use regex to match despite encoding differences in comments
mainJs = mainJs.replace(/if\s*\(\s*typeof\s+drawPaths\s*!==\s*'undefined'\s*&&\s*drawPaths\.length\s*>\s*0\s*\)\s*\{/, 
  "if (typeof drawPaths !== 'undefined' && drawPaths.length > 0 && typeof uploadedImgUrl !== 'undefined' && uploadedImgUrl) {");

fs.writeFileSync('main.js', mainJs, 'utf8');

console.log("Patched successfully!");
