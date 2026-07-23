const fs = require('fs');
let calloutJs = fs.readFileSync('modules/callout.js', 'utf8');

// The selectCallout() in addSVGCalloutToCanvas was replaced, but rotator wasn't created.
// We need to create it and append it.
const searchStr = `
    const selectBorder = document.createElement('div');
    selectBorder.className = 'callout-select-border';
    selectBorder.style.cssText = \`
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        border: 2px dashed #3b82f6;
        pointer-events: none;
        display: none;
    \`;
    
    wrap.appendChild(selectBorder);
    wrap.appendChild(el);
    wrap.appendChild(controls);
    wrap.appendChild(resizer);
`;

const replaceStr = `
    const selectBorder = document.createElement('div');
    selectBorder.className = 'callout-select-border';
    selectBorder.style.cssText = \`
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        border: 2px dashed #3b82f6;
        pointer-events: none;
        display: none;
    \`;

    const rotator = document.createElement('div');
    rotator.className = 'callout-rotator';
    rotator.style.cssText = 'position:absolute; width:16px; height:16px; background:#10b981; border:2px solid #fff; border-radius:50%; top:-25px; left:50%; transform:translateX(-50%); cursor:grab; display:none; z-index:100; box-shadow:0 0 5px rgba(0,0,0,0.5);';
    rotator.title = 'Döndür';

    wrap.appendChild(selectBorder);
    wrap.appendChild(el);
    wrap.appendChild(controls);
    wrap.appendChild(resizer);
    wrap.appendChild(rotator);
`;

calloutJs = calloutJs.replace(searchStr, replaceStr);

// Also add rotation logic to addSVGCalloutToCanvas
const rotationLogicSVG = `
    // DÖNDÜRME
    let isRotating = false, rotStartX, rotStartY, startAngle = 0;
    el.dataset.rotation = 0;

    rotator.addEventListener('mousedown', function(e){
        e.stopPropagation();
        e.preventDefault();
        isRotating = true;
        rotStartX = e.clientX;
        rotStartY = e.clientY;
        startAngle = parseFloat(el.dataset.rotation) || 0;
    });

    document.addEventListener('mousemove', function(e){
        if(!isRotating) return;
        const rect = wrap.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
        const newAngle = angle + 90;
        el.dataset.rotation = newAngle;
        wrap.style.transform = 'rotate(' + newAngle + 'deg)';
    });

    document.addEventListener('mouseup', function(){
        isRotating = false;
    });
`;

// Insert it before "const uiLayer = document.getElementById('ui-layer');" inside addSVGCalloutToCanvas
// Wait, addSVGCalloutToCanvas doesn't have "const uiLayer". It ends with "workArea.appendChild(wrap);"
calloutJs = calloutJs.replace(
    /document\.addEventListener\('mouseup', function\(\)\{ isResizing = false; \}\);\s*setTimeout\(function\(\)\{ selectCallout\(\); \}, 50\);\s*workArea\.appendChild\(wrap\);\s*}/g,
    `document.addEventListener('mouseup', function(){ isResizing = false; });
    ${rotationLogicSVG}
    setTimeout(function(){ selectCallout(); }, 50);
    workArea.appendChild(wrap);
}`
);

// We need to also patch addNeonToCanvas which throws because there's no selectCallout() but maybe it has other issues?
// No, addNeonToCanvas has no rotator and doesn't call selectCallout(). It calls selectCalloutEl(el). 

fs.writeFileSync('modules/callout.js', calloutJs, 'utf8');
console.log('Fixed SVG Callout rotator error.');
