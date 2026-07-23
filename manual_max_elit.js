const fs = require('fs');

let content = fs.readFileSync('tpl_elit/elit.js', 'utf8');

// The goal is to aggressively scale up font sizes in elit.js
// elit.js uses addCanvaItem(content, left, top, fontSize, color, ...)
// Let's replace them carefully.

// T1 (canvaE1)
content = content.replace(/addCanvaItem\('LÜKS YAŞAM', 80, 80, 36/g, "addCanvaItem('LÜKS YAŞAM', 80, 80, 50");
content = content.replace(/addCanvaItem\(title, 80, 140, 85/g, "addCanvaItem(title, 80, 140, 110");
content = content.replace(/addCanvaItem\(price, 80, 380, 54/g, "addCanvaItem(price, 80, 380, 75");
content = content.replace(/addCanvaItem\(feats, 80, 510, 28/g, "addCanvaItem(feats, 80, 510, 42");
content = content.replace(/addCanvaItem\(contact, 80, 980, 26/g, "addCanvaItem(contact, 80, 980, 35");

// T2 (canvaE2)
content = content.replace(/addCanvaItem\(title, 60, 60, 95/g, "addCanvaItem(title, 60, 60, 130");
content = content.replace(/addCanvaItem\(price, 750, 640, 48/g, "addCanvaItem(price, 750, 640, 70");
// it has an inner div font-size:scaleSize(36)
content = content.replace(/font-size:\$\{scaleSize\(36\)\}px/g, "font-size:${scaleSize(50)}px");
content = content.replace(/80, 750, 30, '#3f3f46'/g, "80, 750, 45, '#3f3f46'");
content = content.replace(/1150, 770, 30, '#18181b'/g, "1150, 770, 45, '#18181b'");

// T3 (canvaE3)
content = content.replace(/addCanvaItem\(words\[0\] \|\| 'YENİ', 60, 80, 90/g, "addCanvaItem(words[0] || 'YENİ', 60, 80, 120");
content = content.replace(/addCanvaItem\(words\.slice\(1\)\.join\(' '\) \|\| 'İLAN', 60, 180, 32/g, "addCanvaItem(words.slice(1).join(' ') || 'İLAN', 60, 180, 50");
content = content.replace(/addCanvaItem\(feats, 60, 300, 26/g, "addCanvaItem(feats, 60, 300, 40");
content = content.replace(/addCanvaItem\(price, 60, 820, 52/g, "addCanvaItem(price, 60, 820, 75");
content = content.replace(/addCanvaItem\(contact, 60, 960, 22/g, "addCanvaItem(contact, 60, 960, 35");

// ... wait, instead of manually typing everything, I can write a replacer function for addCanvaItem
let finalContent = "";
let lines = content.split('\n');
for (let i=0; i<lines.length; i++) {
    let line = lines[i];
    // We only want to touch addCanvaItem inside case blocks or variations
    if (line.includes('addCanvaItem(')) {
        // Parse addCanvaItem arguments. Usually looks like:
        // addCanvaItem(content, 120, 120, 30, '#000', ...)
        line = line.replace(/(addCanvaItem\([^,]+(?:,[^,]+){2},\s*)(\d+)(,\s*['"`])/g, (match, prefix, num, suffix) => {
            let n = parseInt(num);
            if(n <= 28) n = Math.round(n * 1.5);
            else if(n <= 50) n = Math.round(n * 1.4);
            else if(n <= 80) n = Math.round(n * 1.35);
            else n = Math.round(n * 1.25);
            return prefix + n + suffix;
        });
    }
    finalContent += line + "\n";
}

fs.writeFileSync('tpl_elit/elit.js', finalContent, 'utf8');
console.log("elit.js dynamically maxed out!");
