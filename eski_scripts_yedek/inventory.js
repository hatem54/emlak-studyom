const fs = require('fs');
const path = require('path');

// 1. Parse HTML files for loaded JS
const loadedJs = new Set();
const checkHtml = (file) => {
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(/src=["']([^"']+\.js)[^"']*["']/g) || [];
    matches.forEach(m => {
        let src = m.split(/["']/)[1];
        src = src.split('?')[0]; // remove query params
        if (!src.startsWith('http')) {
            // resolve relative to root
            loadedJs.add(path.normalize(src).replace(/\\/g, '/'));
        }
    });
};

checkHtml('index.html');
checkHtml('app.html');
checkHtml('scratch_tab_batch.html'); // just in case

// 2. Scan root directory for JS/PY files
const rootFiles = fs.readdirSync('.').filter(f => {
    return fs.statSync(f).isFile() && (f.endsWith('.js') || f.endsWith('.py'));
});

// 3. Mark Dead Code
const deadCode = [];
const activeFiles = [];
rootFiles.forEach(f => {
    // Only check files in root against the loadedJs set
    // Note: loadedJs contains paths like "main.js" or "js/main.js"
    if (loadedJs.has(f)) {
        activeFiles.push(f);
    } else {
        // Also check if they are imported inside other active JS files?
        // EmlakStudyom is vanilla JS, mostly loaded via HTML.
        // Let's do a quick text search in active JS files just to be absolutely sure
        let isDynamicallyLoaded = false;
        activeFiles.forEach(af => {
            if(fs.existsSync(af)) {
                const txt = fs.readFileSync(af, 'utf8');
                if (txt.includes(f)) {
                    isDynamicallyLoaded = true;
                }
            }
        });
        
        if (isDynamicallyLoaded) {
            activeFiles.push(f);
        } else {
            deadCode.push(f);
        }
    }
});

// 4. Identify Collision Risk (similar names)
const collisions = [];
const allJsFiles = [];
function walk(d){
    fs.readdirSync(d).forEach(f=>{
        const p=path.join(d,f);
        if(fs.statSync(p).isDirectory() && f !== 'node_modules' && f !== '.git' && f !== 'eski_scripts_yedek') walk(p);
        else if(f.endsWith('.js')){
            allJsFiles.push({ name: f, path: p.replace(/\\/g, '/') });
        }
    });
}
walk('.');

const nameMap = new Map();
allJsFiles.forEach(obj => {
    if(!nameMap.has(obj.name)) nameMap.set(obj.name, []);
    nameMap.get(obj.name).push(obj.path);
});

nameMap.forEach((paths, name) => {
    if(paths.length > 1) {
        collisions.push({ name, paths });
    }
});

// Output Report
console.log('--- ENVANTER RAPORU ---');
console.log('Aktif Kök Dosyalar:', activeFiles.length);
console.log('Ölü Kök Dosyalar:', deadCode.length);
console.log('Çakışma Riski Taşıyan İsimler:', collisions.length);
console.log('\nAktif Dosyalar:');
console.log(activeFiles.join(', '));
console.log('\nÖrnek Ölü Dosyalar (ilk 20):');
console.log(deadCode.slice(0, 20).join(', '));
console.log('\nÇakışma Riskleri:');
collisions.forEach(c => {
    console.log(`- ${c.name}: ${c.paths.join(' | ')}`);
});

fs.writeFileSync('inventory_report.json', JSON.stringify({
    activeCount: activeFiles.length,
    deadCount: deadCode.length,
    deadFiles: deadCode,
    collisions: collisions
}, null, 2));

