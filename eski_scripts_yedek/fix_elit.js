const fs = require('fs');
let content = fs.readFileSync('tpl_elit/elit.js', 'utf8');

// T1 (canvaE1)
content = content.replace(/addCanvaItem\('LÜKS YAŞAM'.*/g, "addCanvaItem('LÜKS YAŞAM', 80, 60, 45, '#4a3b32', 'transparent', 0, 0);");
content = content.replace(/addCanvaItem\(title, 80, \d+, \d+.*/g, "addCanvaItem(title, 80, 120, 100, '#2c1e15', 'transparent', 0, 0, 650);");
content = content.replace(/addCanvaItem\(price, 80, \d+, \d+.*/g, "addCanvaItem(price, 80, 420, 75, '#b45309', 'transparent', 0, 0);");
content = content.replace(/addCanvaItem\(feats, 80, \d+, \d+.*/g, "addCanvaItem(feats, 80, 560, 40, '#4a3b32', 'transparent', 16, 0, 640);");
content = content.replace(/addCanvaItem\(contact, 80, \d+, \d+.*/g, "addCanvaItem(contact, 80, 980, 35, '#2c1e15', 'transparent', 0, 0);");

// T2 (canvaE2)
content = content.replace(/addCanvaItem\(title, 60, \d+, \d+.*/g, "addCanvaItem(title, 60, 60, 120, '#18181b', 'transparent', 0, 0, 1800, 'center');");
content = content.replace(/addCanvaItem\(price, 750, \d+, \d+.*/g, "addCanvaItem(price, 750, 620, 75, '#ffffff', '#f59e0b', 50, 15, 420, 'center');");
content = content.replace(/font-size:\$\{scaleSize\(\d+\)\}px/g, "font-size:${scaleSize(50)}px");
content = content.replace(/80, \d+, \d+, '#3f3f46'/g, "80, 780, 40, '#3f3f46'");
content = content.replace(/1150, \d+, \d+, '#18181b'/g, "1150, 780, 40, '#18181b'");

// T3 (canvaE3)
content = content.replace(/addCanvaItem\(words\[0\] \|\| 'YENİ', 60, \d+, \d+.*/g, "addCanvaItem(words[0] || 'YENİ', 60, 80, 110, '#38bdf8', 'transparent', 0, 0);");
content = content.replace(/addCanvaItem\(words\.slice\(1\)\.join\(' '\) \|\| 'İLAN', 60, \d+, \d+.*/g, "addCanvaItem(words.slice(1).join(' ') || 'İLAN', 60, 210, 45, '#94a3b8', 'transparent', 0, 0);");
content = content.replace(/addCanvaItem\(feats, 60, \d+, \d+.*/g, "addCanvaItem(feats, 60, 320, 36, '#f1f5f9', 'transparent', 0, 0, 500);");
content = content.replace(/addCanvaItem\(price, 60, \d+, \d+.*/g, "addCanvaItem(price, 60, 820, 70, '#38bdf8', 'rgba(56,189,248,0.12)', 12, 15, 500, 'center');");
content = content.replace(/addCanvaItem\(contact, 60, \d+, \d+.*/g, "addCanvaItem(contact, 60, 960, 30, '#94a3b8', 'transparent', 0, 0, 500, 'center');");

// Ensure other templates don't overlap as badly
let finalContent = "";
let lines = content.split('\n');
for (let i=0; i<lines.length; i++) {
    let line = lines[i];
    if (line.includes('addCanvaItem(') && !line.includes('LÜKS YAŞAM') && !line.includes('title, 80') && !line.includes('words[0]')) {
        // If font sizes are super big (>80) reduce them slightly to prevent overlap for templates 4-10
        line = line.replace(/(addCanvaItem\([^,]+(?:,[^,]+){2},\s*)(\d+)(,\s*['"`])/g, (match, prefix, num, suffix) => {
            let n = parseInt(num);
            if (n > 90) n = 90;
            if (n > 60 && n <= 90) n = Math.round(n * 0.85); 
            return prefix + n + suffix;
        });
    }
    finalContent += line + "\n";
}

fs.writeFileSync('tpl_elit/elit.js', finalContent, 'utf8');
console.log("elit.js top coordinates completely fixed for T1-T3.");
