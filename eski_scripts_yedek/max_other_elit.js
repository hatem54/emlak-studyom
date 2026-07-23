const fs = require('fs');

let content = fs.readFileSync('tpl_elit/elit.js', 'utf8');

// I will find each block for canva2, canva3, canva4, canva5, canva6, canva8, canva9, canva10
// and scale up their font sizes.

const blocks = ['canva2', 'canva3', 'canva4', 'canva5', 'canva6', 'canva8', 'canva9', 'canva10'];

for (let b of blocks) {
    let regexStr = `else if\\(activeCanvaId === '${b}'\\)[\\s\\S]*?\\n\\}`;
    if(b === 'canva2') regexStr = `else if\\(activeCanvaId === 'canva2'\\)[\\s\\S]*?addCanvaItem\\('✆ ' \\+ contact, 1530, 960, 22, '#f1f5f9', 'transparent', 0, 0\\);\\n\\}`;
    
    // I'll just use indexOf to be safe instead of regex for the block boundaries.
    let startIdx = content.indexOf(`activeCanvaId === '${b}'`);
    if(startIdx === -1) continue;
    
    // find the end of the block
    let endIdx = content.indexOf(`activeCanvaId === 'canva`, startIdx + 20);
    if(endIdx === -1) endIdx = content.indexOf('function bindCanvaEvents');
    if(endIdx === -1) endIdx = content.length;
    
    let block = content.slice(startIdx, endIdx);
    
    // Scale up font sizes in addCanvaItem
    // addCanvaItem(text, x, y, size, color, ...)
    block = block.replace(/(addCanvaItem\([^,]+,\s*\d+,\s*\d+,\s*)(\d+)/g, (match, prefix, sizeStr) => {
        let s = parseInt(sizeStr);
        // title/price are usually large, feats/contact are small
        if (s > 45) {
            s = Math.round(s * 1.8);
        } else if (s > 30) {
            s = Math.round(s * 1.6);
        } else {
            s = Math.round(s * 1.5);
        }
        return prefix + s;
    });

    // In Canva 8, make the bottom panel taller so 4 lines fit without overflow
    if (b === 'canva8') {
        block = block.replace(/addCanvaPanel\(80,\s*850,\s*1760,\s*180/g, 'addCanvaPanel(80, 750, 1760, 280');
        block = block.replace(/addCanvaItem\(feats,\s*120,\s*865/g, 'addCanvaItem(feats, 120, 780');
        block = block.replace(/addCanvaPanel\(1230,\s*970,\s*590,\s*50/g, 'addCanvaPanel(1230, 950, 590, 60');
        block = block.replace(/addCanvaItem\(contact,\s*1250,\s*980/g, 'addCanvaItem(contact, 1250, 960');
    }

    content = content.slice(0, startIdx) + block + content.slice(endIdx);
}

fs.writeFileSync('tpl_elit/elit.js', content, 'utf8');
console.log("Successfully scaled remaining Elit templates!");
