const fs = require('fs');

const doubleTapLogic = `
// Mobile Double-Tap to Reset Sliders
let lastSliderTap = 0;
document.addEventListener('touchstart', function(e) {
    if (e.target.tagName && e.target.tagName.toLowerCase() === 'input' && e.target.type === 'range') {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastSliderTap;
        if (tapLength < 400 && tapLength > 0) {
            // Double tap detected, trigger dblclick
            const evt = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window });
            e.target.dispatchEvent(evt);
        }
        lastSliderTap = currentTime;
    }
}, {passive: true});
`;

let js = fs.readFileSync('main.js', 'utf8');
if (!js.includes('Mobile Double-Tap to Reset Sliders')) {
    fs.writeFileSync('main.js', js + '\n' + doubleTapLogic);
    console.log('Added double tap logic');
}
