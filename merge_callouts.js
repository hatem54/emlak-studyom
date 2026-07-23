const fs = require('fs');

// Emoji cleaning function (keeps standard ascii and extended latin for Turkish)
function cleanName(str) {
    if (!str) return 'Diğer';
    // Remove anything that is not a word character, space, or standard punctuation we want
    // Emojis are outside the standard Latin range.
    let cleaned = str.replace(/[^\x00-\x7F\u00C0-\u017F\s\(\)-]/g, '');
    return cleaned.trim() || 'Diğer';
}

function parseFile(filename) {
    if (!fs.existsSync(filename)) return [];
    const html = fs.readFileSync(filename, 'utf8');
    const items = [];
    
    const catBlocks = html.split('<div class="category">');
    for (let i = 1; i < catBlocks.length; i++) {
        const block = catBlocks[i];
        const titleMatch = block.match(/<div class="category-title">([\s\S]*?)<\/div>/);
        let categoryName = 'Diğer';
        if (titleMatch) {
            categoryName = titleMatch[1].replace(/<span.*<\/span>/, '').trim();
            categoryName = cleanName(categoryName);
        }
        
        const itemBlocks = block.split('<div class="item">');
        for (let j = 1; j < itemBlocks.length; j++) {
            const itemBlock = itemBlocks[j];
            const svgMatch = itemBlock.match(/<svg[\s\S]*?<\/svg>/i);
            const nameMatch = itemBlock.match(/<h3>(.*?)<\/h3>/);
            
            if (svgMatch && nameMatch) {
                let svg = svgMatch[0].replace(/\s+/g, ' ').trim();
                let name = cleanName(nameMatch[1]);
                items.push({ category: categoryName, name, svg });
            }
        }
    }
    return items;
}

const newItems = [...parseFile('yeni_calloutlar.txt'), ...parseFile('yeni_calloutlar2.txt')];

let existingLibStr = fs.readFileSync('modules/callouts-library.js', 'utf8');
let libObj = {};
try {
    const window = {};
    eval(existingLibStr);
    libObj = typeof CALLOUT_LIBRARY !== 'undefined' ? CALLOUT_LIBRARY : window.CALLOUT_LIBRARY;
} catch (e) {
    console.error("Error evaluating library:", e);
    process.exit(1);
}

// Convert existing library to a flat list for comparison, but KEEP the original category structure.
const existingSvgSet = new Set();
const existingNameMap = new Map(); // key -> count

for (const catKey in libObj) {
    const cat = libObj[catKey];
    cat.items.forEach(item => {
        const normSvg = item.svg.replace(/\s+/g, ' ').trim();
        existingSvgSet.add(normSvg);
        
        const nameKey = cat.title + '|' + item.name;
        existingNameMap.set(nameKey, (existingNameMap.get(nameKey) || 0) + 1);
    });
}

// Deduplicate new items among themselves
const uniqueNewItemsMap = new Map(); // normSvg -> item
newItems.forEach(item => {
    if (!uniqueNewItemsMap.has(item.svg)) {
        uniqueNewItemsMap.set(item.svg, item);
    }
});

// Now filter and add
let addedCount = 0;
for (const [svg, item] of uniqueNewItemsMap.entries()) {
    if (existingSvgSet.has(svg)) {
        // Exact match with existing -> SKIP
        continue;
    }
    
    // Check name collision
    const nameKey = item.category + '|' + item.name;
    if (existingNameMap.has(nameKey)) {
        let count = existingNameMap.get(nameKey);
        item.name = item.name + ' (' + (count + 1) + ')';
        existingNameMap.set(nameKey, count + 1);
    } else {
        existingNameMap.set(nameKey, 1);
    }
    
    // Find or create category in libObj
    let targetCatKey = null;
    for (const key in libObj) {
        if (libObj[key].title === item.category) {
            targetCatKey = key;
            break;
        }
    }
    
    if (!targetCatKey) {
        // Create new category key like 'cat_1', 'cat_2'
        targetCatKey = 'cat_' + (Object.keys(libObj).length + 1);
        libObj[targetCatKey] = {
            title: item.category,
            items: []
        };
    }
    
    libObj[targetCatKey].items.push({
        name: item.name,
        svg: svg
    });
    addedCount++;
}

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
        // Use string literal backticks for SVG to be safe
        newContent += `                svg: \`${item.svg}\`\n`;
        newContent += `            },\n`;
    });
    
    newContent += `        ]\n`;
    newContent += `    },\n`;
}
newContent += '};\n';

fs.writeFileSync('modules/callouts-library.js', newContent, 'utf8');
console.log(`Merge complete! Added ${addedCount} new unique callouts.`);
