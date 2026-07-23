const fs = require('fs');
let calloutJs = fs.readFileSync('modules/callout.js', 'utf8');

// 1. Add rotator element creation & append to wrap
const rotatorHtml = `
    const selectBorder = document.createElement('div');
    selectBorder.className = 'callout-select-border';
    selectBorder.style.display = 'none';

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
calloutJs = calloutJs.replace(
    /const selectBorder = document\.createElement\('div'\);\s*selectBorder\.className = 'callout-select-border';\s*selectBorder\.style\.display = 'none';\s*wrap\.appendChild\(selectBorder\);\s*wrap\.appendChild\(el\);\s*wrap\.appendChild\(controls\);\s*wrap\.appendChild\(resizer\);/g,
    rotatorHtml
);

// 2. Update selectCallout to show rotator and call selectCalloutEl
const selectCalloutReplacement = `
    function selectCallout(){
        document.querySelectorAll('.callout-controls').forEach(function(c){ c.style.display = 'none'; });
        document.querySelectorAll('.callout-resizer').forEach(function(c){ c.style.display = 'none'; });
        document.querySelectorAll('.callout-rotator').forEach(function(c){ c.style.display = 'none'; });
        document.querySelectorAll('.callout-select-border').forEach(function(c){ c.style.display = 'none'; });
        controls.style.display = 'flex';
        resizer.style.display = 'block';
        rotator.style.display = 'block';
        selectBorder.style.display = 'block';
        if (typeof selectCalloutEl === 'function') selectCalloutEl(el);
    }
`;
calloutJs = calloutJs.replace(
    /function selectCallout\(\)\{\s*document\.querySelectorAll\('\.callout-controls'\)\.forEach\(function\(c\)\{\s*c\.style\.display = 'none';\s*\}\);\s*document\.querySelectorAll\('\.callout-resizer'\)\.forEach\(function\(c\)\{\s*c\.style\.display = 'none';\s*\}\);\s*document\.querySelectorAll\('\.callout-select-border'\)\.forEach\(function\(c\)\{\s*c\.style\.display = 'none';\s*\}\);\s*controls\.style\.display = 'flex';\s*resizer\.style\.display = 'block';\s*selectBorder\.style\.display = 'block';\s*\}/g,
    selectCalloutReplacement
);

// 3. Prevent rotator from triggering drag
calloutJs = calloutJs.replace(
    /if\(e\.target\.closest\('\.callout-resizer'\)\) return;/g,
    "if(e.target.closest('.callout-resizer')) return;\n        if(e.target.closest('.callout-rotator')) return;"
);
calloutJs = calloutJs.replace(
    /!e\.target\.closest\('\.callout-resizer'\)/g,
    "!e.target.closest('.callout-resizer') && !e.target.closest('.callout-rotator')"
);
calloutJs = calloutJs.replace(
    /resizer\.style\.display = 'none';/g,
    "resizer.style.display = 'none';\n            if(typeof rotator !== 'undefined') rotator.style.display = 'none';"
);

// 4. Add rotation math logic
const rotateLogic = `
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
        // Adjust angle since rotator is at top
        const newAngle = angle + 90;
        el.dataset.rotation = newAngle;
        wrap.style.transform = 'rotate(' + newAngle + 'deg)';
    });

    document.addEventListener('mouseup', function(){
        isRotating = false;
    });

    if(typeof allIcons !== 'undefined') allIcons.push(wrap);
`;
calloutJs = calloutJs.replace(
    /if\(typeof allIcons !== 'undefined'\) allIcons\.push\(wrap\);/g,
    rotateLogic
);

fs.writeFileSync('modules/callout.js', calloutJs, 'utf8');
console.log('Successfully injected callout rotation and selection logic.');
