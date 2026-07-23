const fs = require('fs');

let existingLibStr = fs.readFileSync('modules/callouts-library.js', 'utf8');
let libObj = {};
try {
    const window = {};
    eval(existingLibStr);
    libObj = window.CALLOUT_LIBRARY;
} catch (e) {
    console.error("Error evaluating library:", e);
    process.exit(1);
}

const keysToDelete = [];

for (const key in libObj) {
    if (key.startsWith('cat_')) {
        const newCat = libObj[key];
        const rawTitle = newCat.title; // e.g., "Fiyat Etiketleri"
        
        // Find matching old category
        let targetOldKey = null;
        for (const oldKey in libObj) {
            if (!oldKey.startsWith('cat_')) {
                const oldTitle = libObj[oldKey].title; // e.g., "💰 Fiyat Etiketleri"
                if (oldTitle.includes(rawTitle) || rawTitle.includes(oldTitle.replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/gi, '').trim())) {
                    targetOldKey = oldKey;
                    break;
                }
            }
        }
        
        if (targetOldKey) {
            console.log(`Merging '${rawTitle}' into '${libObj[targetOldKey].title}' (${targetOldKey})`);
            // Merge items
            newCat.items.forEach(item => {
                libObj[targetOldKey].items.push(item);
            });
            keysToDelete.push(key);
        } else {
            console.log(`No match found for '${rawTitle}'`);
        }
    }
}

// Delete merged categories
keysToDelete.forEach(k => delete libObj[k]);

// Generate the new file content
let newContent = 'window.CALLOUT_LIBRARY = {\n';
for (const key in libObj) {
    const cat = libObj[key];
    newContent += `    "${key}": {\n`;
    newContent += `        title: "${cat.title}",\n`;
    newContent += `        items: [\n`;
    
    cat.items.forEach(item => {
        newContent += `            {\n`;
        newContent += `                name: "${item.name.replace(/"/g, '\\"')}",\n`;
        newContent += `                svg: \`${item.svg}\`\n`;
        newContent += `            },\n`;
    });
    
    newContent += `        ]\n`;
    newContent += `    },\n`;
}
newContent += '};\n';

fs.writeFileSync('modules/callouts-library.js', newContent, 'utf8');
console.log('Categories merged successfully.');
