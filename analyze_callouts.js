const fs = require('fs');

// 1. Parse the text files (HTML galleries)
function parseFile(filename) {
    if (!fs.existsSync(filename)) return [];
    const html = fs.readFileSync(filename, 'utf8');
    const items = [];
    
    // Split by categories
    const catBlocks = html.split('<div class="category">');
    for (let i = 1; i < catBlocks.length; i++) {
        const block = catBlocks[i];
        const titleMatch = block.match(/<div class="category-title">([\s\S]*?)<\/div>/);
        let categoryName = 'Diğer';
        if (titleMatch) {
            categoryName = titleMatch[1].replace(/<span.*<\/span>/, '').trim();
        }
        
        // Find items in this category
        const itemBlocks = block.split('<div class="item">');
        for (let j = 1; j < itemBlocks.length; j++) {
            const itemBlock = itemBlocks[j];
            const svgMatch = itemBlock.match(/<svg[\s\S]*?<\/svg>/i);
            const nameMatch = itemBlock.match(/<h3>(.*?)<\/h3>/);
            
            if (svgMatch && nameMatch) {
                let svg = svgMatch[0];
                let name = nameMatch[1].trim();
                svg = svg.replace(/\s+/g, ' ').trim();
                items.push({ category: categoryName, name, svg });
            }
        }
    }
    return items;
}

const newItems1 = parseFile('yeni_calloutlar.txt');
const newItems2 = parseFile('yeni_calloutlar2.txt');

let allNewItems = [...newItems1, ...newItems2];

// 2. Parse EXISTING callouts from modules/callouts-library.js
let existingLib = fs.readFileSync('modules/callouts-library.js', 'utf8');
let existingItems = [];
try {
    const window = {}; // mock window
    eval(existingLib);
    
    // Check if CALLOUT_LIBRARY is defined globally or on window
    const lib = typeof CALLOUT_LIBRARY !== 'undefined' ? CALLOUT_LIBRARY : window.CALLOUT_LIBRARY;
    
    if (lib) {
        for (const catKey in lib) {
            const cat = lib[catKey];
            if (cat.items) {
                cat.items.forEach(item => {
                    existingItems.push({
                        category: cat.title,
                        name: item.name,
                        svg: item.svg.replace(/\s+/g, ' ').trim()
                    });
                });
            }
        }
    }
} catch (e) {
    console.error("Error parsing existing library:", e);
}

// 3. Deduplicate and Analyze
const report = {
    totalNewFiles: allNewItems.length,
    totalExisting: existingItems.length,
    duplicatesBetweenNewFiles: 0,
    exactMatchesWithExisting: 0,
    nameCollisionsResolved: 0,
    finalItemsToAdd: [],
    categories: {}
};

// Map existing SVGs and Names for quick lookup
const existingSvgMap = new Set();
const existingNameMap = new Map();

existingItems.forEach(item => {
    existingSvgMap.add(item.svg);
    // Track how many times a name is used in a category
    const key = item.category + '|' + item.name;
    existingNameMap.set(key, (existingNameMap.get(key) || 0) + 1);
});

// Map for deduplicating new items among themselves
const uniqueNewItemsMap = new Map();

allNewItems.forEach(item => {
    if (uniqueNewItemsMap.has(item.svg)) {
        report.duplicatesBetweenNewFiles++;
        return; // skip duplicate in new files
    }
    uniqueNewItemsMap.set(item.svg, item);
});

// Now compare against existing
for (const [svg, item] of uniqueNewItemsMap.entries()) {
    if (existingSvgMap.has(svg)) {
        report.exactMatchesWithExisting++;
        continue; // Skip exact match
    }
    
    // Check for name collision
    const nameKey = item.category + '|' + item.name;
    if (existingNameMap.has(nameKey)) {
        // Name collision, but different SVG
        let count = existingNameMap.get(nameKey);
        item.name = item.name + ' (' + (count + 1) + ')';
        existingNameMap.set(nameKey, count + 1);
        report.nameCollisionsResolved++;
    } else {
        existingNameMap.set(nameKey, 1);
    }
    
    // Add to final list
    report.finalItemsToAdd.push(item);
    
    if (!report.categories[item.category]) report.categories[item.category] = 0;
    report.categories[item.category]++;
}

fs.writeFileSync('callout_analysis_report.json', JSON.stringify(report, null, 2));
console.log("Analysis Complete");
