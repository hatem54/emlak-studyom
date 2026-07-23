/**
 * Fix remaining unmatched Luks templates with a safer approach:
 * Replace ALL scaleMin values in sequence for each template.
 */
const fs = require('fs');

let luks = fs.readFileSync('tpl_luks/luks.js', 'utf8');
const match = luks.match(/const variations = (\[[\s\S]*?\]);/);
if (!match) { console.error("variations bulunamadı!"); process.exit(1); }

let vars = JSON.parse(match[1]);

// Helper: replace Nth occurrence of scaleMin(X) with scaleMin(Y)
function replaceNth(html, n, newVal) {
    let count = 0;
    return html.replace(/scaleMin\((\d+)\)/g, (full, num) => {
        count++;
        if (count === n) return `scaleMin(${newVal})`;
        return full;
    });
}

// Lüks 1: [24,51,43,20,17,15] → [28,62,50,22,20,20]
vars[0].html = replaceNth(vars[0].html, 1, 28);
vars[0].html = replaceNth(vars[0].html, 2, 62);
vars[0].html = replaceNth(vars[0].html, 3, 50);
vars[0].html = replaceNth(vars[0].html, 4, 22);
vars[0].html = replaceNth(vars[0].html, 5, 20);
vars[0].html = replaceNth(vars[0].html, 6, 20);

// Lüks 3: [20,68,38,19] → [24,68,46,24]  (68 already updated, fix 38→46 and 19→24)
vars[2].html = replaceNth(vars[2].html, 3, 46);
vars[2].html = replaceNth(vars[2].html, 4, 24);

// Lüks 4: [17,43,30,15] → [21,54,38,21]
vars[3].html = replaceNth(vars[3].html, 1, 21);
vars[3].html = replaceNth(vars[3].html, 2, 54);
vars[3].html = replaceNth(vars[3].html, 3, 38);
vars[3].html = replaceNth(vars[3].html, 4, 21);

// Lüks 6: [60,42,17,17] → [60,42,22,20]  (60 and 42 already updated)
vars[5].html = replaceNth(vars[5].html, 3, 22);
vars[5].html = replaceNth(vars[5].html, 4, 20);

// Write back
const newVariationsStr = JSON.stringify(vars);
const updatedLuks = luks.replace(match[0], 'const variations = ' + newVariationsStr + ';');
fs.writeFileSync('tpl_luks/luks.js', updatedLuks, 'utf8');
console.log("Remaining templates fixed!");
