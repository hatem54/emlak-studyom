const fs = require('fs');

function clearLocalStorageTrap(file, id) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Inject a trap that clears 'DETACHED HOUSE FOR SALE' from local storage
    const trap = `
            const saved = localStorage.getItem(id);
            if(saved) {
                // If the user's browser is stuck with the English test text, clear it to Turkish!
                if(saved.toUpperCase().includes('DETACHED HOUSE')) {
                    el.value = 'SATILIK MÜSTAKİL EV';
                    localStorage.setItem(id, 'SATILIK MÜSTAKİL EV');
                } else {
                    el.value = saved;
                }
            }
`;
    content = content.replace(/const saved = localStorage\.getItem\(id\);\s*if\(saved\) el\.value = saved;/g, trap);
    
    fs.writeFileSync(file, content, 'utf8');
}

clearLocalStorageTrap('tpl_luks/luks.js', 'id');
clearLocalStorageTrap('tpl_elit/elit.js', 'id');

console.log("Local storage trap injected!");
