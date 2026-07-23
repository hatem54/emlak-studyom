const fs = require('fs');
let js = fs.readFileSync('main.js', 'utf8');

const oldLogic = `// Mobile Double-Tap to Reset Sliders
let lastSliderTap = 0;
document.addEventListener('touchend', function(e) {
    if (e.target.tagName && e.target.tagName.toLowerCase() === 'input' && e.target.type === 'range') {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastSliderTap;
        if (tapLength < 600 && tapLength > 0) {
            // Double tap detected, trigger dblclick
            setTimeout(() => {
                const evt = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window });
                e.target.dispatchEvent(evt);
            }, 50);
        }
        lastSliderTap = currentTime;
    }
}, {passive: true});`;

const newLogic = `// Mobile Double-Tap to Reset Sliders
let lastSliderTap = 0;
document.addEventListener('touchstart', function(e) {
    if (e.target.tagName && e.target.tagName.toLowerCase() === 'input' && e.target.type === 'range') {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastSliderTap;
        if (tapLength < 600 && tapLength > 0) {
            // Double tap detected, trigger dblclick and PREVENT default browser behavior
            e.preventDefault(); 
            const evt = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window });
            e.target.dispatchEvent(evt);
        }
        lastSliderTap = currentTime;
    }
}, {passive: false});`;

if (js.includes('Mobile Double-Tap to Reset Sliders')) {
    const startIdx = js.indexOf('// Mobile Double-Tap to Reset Sliders');
    js = js.substring(0, startIdx) + newLogic;
    fs.writeFileSync('main.js', js);
    console.log('Replaced double tap logic with touchstart and preventDefault.');
} else {
    console.log('Could not find old logic to replace.');
}
