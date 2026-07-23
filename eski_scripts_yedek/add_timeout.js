const fs = require('fs');
let js = fs.readFileSync('main.js', 'utf8');

const oldLogic = `const evt = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window });
            e.target.dispatchEvent(evt);`;

const newLogic = `setTimeout(() => {
                const evt = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window });
                e.target.dispatchEvent(evt);
            }, 50);`;

if (js.includes(oldLogic)) {
    js = js.replace(oldLogic, newLogic);
    
    // Also increase the tap length tolerance
    js = js.replace('tapLength < 400', 'tapLength < 600');
    
    fs.writeFileSync('main.js', js);
    console.log('Replaced double tap logic with setTimeout and 600ms tolerance.');
} else {
    console.log('Could not find old logic to replace.');
}
