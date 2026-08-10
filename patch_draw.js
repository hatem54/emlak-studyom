const fs = require('fs');
let code = fs.readFileSync('modules/draw.js', 'utf8');

// 1. Fix rotHandleDown bubbling
let target1 = "function rotHandleDown(e) {\n          console.log('\uD83D\uDD04 ROT HANDLE DOWN', { targetClass: e?.target?.className });\n          if (e.type === 'mousedown') { e.preventDefault(); e.stopPropagation(); }";
let replacement1 = "function rotHandleDown(e) {\n          console.log('\uD83D\uDD04 ROT HANDLE DOWN', { targetClass: e?.target?.className });\n          e.preventDefault(); e.stopPropagation();";

code = code.replace(target1, replacement1);

// 2. Add resize handle
let target2 = "    rotHandle.addEventListener('touchstart', rotHandleDown, {passive: false});\n      container.appendChild(rotHandle);\n      \n      el.appendChild(container);\n      el.dataset.hasHandles = 'true';";
let replacement2 = "    rotHandle.addEventListener('touchstart', rotHandleDown, {passive: false});\n      container.appendChild(rotHandle);\n\n      const resizeHandle = document.createElement('div');\n      resizeHandle.className = 'text-handle text-resize-handle';\n      resizeHandle.title = 'Boyutlandýr';\n      resizeHandle.innerHTML = '<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7\"></path></svg>';\n      container.appendChild(resizeHandle);\n      \n      el.appendChild(container);\n      el.dataset.hasHandles = 'true';";

code = code.replace(target2, replacement2);

fs.writeFileSync('modules/draw.js', code, 'utf8');
console.log('Patched draw.js');
