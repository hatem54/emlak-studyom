const fs = require('fs');

let coreJs = fs.readFileSync('core.js', 'utf8');

const regex = /let h='';[\s\S]*?\$\('infoLineText'\)\.innerHTML=h;/m;

const replacement = `let h='';
        
        if (window.propertyForms && window.propertyForms[window.currentMode]) {
            const config = window.propertyForms[window.currentMode];
            config.fields.forEach(f => {
                if(f.id === 'priceInput') return; // fiyatı yukarda basıyoruz
                const val = v(f.id);
                if (val && val.toLowerCase() !== 'yok') {
                    let icon = 'fa-check-circle';
                    const lbl = f.label.toLowerCase();
                    if(lbl.includes('oda') || lbl.includes('daire')) icon = 'fa-bed';
                    else if(lbl.includes('m²') || lbl.includes('alan')) icon = 'fa-ruler-combined';
                    else if(lbl.includes('kat') || lbl.includes('gabari')) icon = 'fa-layer-group';
                    else if(lbl.includes('yaş') || lbl.includes('tarih')) icon = 'fa-calendar-alt';
                    else if(lbl.includes('ısıtma') || lbl.includes('enerji')) icon = 'fa-fire';
                    else if(lbl.includes('banyo')) icon = 'fa-bath';
                    else if(lbl.includes('havuz')) icon = 'fa-swimming-pool';
                    else if(lbl.includes('imar') || lbl.includes('ada') || lbl.includes('parsel') || lbl.includes('konum') || lbl.includes('lokasyon')) icon = 'fa-map-marker-alt';
                    else if(lbl.includes('cephe')) icon = 'fa-compass';
                    else if(lbl.includes('tapu') || lbl.includes('emsal') || lbl.includes('kaks')) icon = 'fa-file-contract';
                    else if(lbl.includes('otopark')) icon = 'fa-car';
                    else if(lbl.includes('asansör')) icon = 'fa-sort-numeric-up';
                    else if(lbl.includes('deniz') || lbl.includes('manzara') || lbl.includes('su')) icon = 'fa-water';
                    else if(lbl.includes('ağaç') || lbl.includes('bahçe') || lbl.includes('peyzaj') || lbl.includes('ahır')) icon = 'fa-tree';
                    else if(lbl.includes('akıllı') || lbl.includes('elektrik')) icon = 'fa-bolt';

                    let cleanLabel = f.label.replace(' Sayısı', '').replace(' Durumu', '').replace(' Alanı', '').replace(' Türü', '').replace(' Ölçüsü', '').replace(' Bedeli', '');
                    h += '<div><i class="fas ' + icon + '"></i> ' + cleanLabel + ': <b>' + val + '</b></div>';
                }
            });
            
            const extraContainer = document.getElementById('dynamicExtraFields');
            if (extraContainer) {
                const rows = extraContainer.querySelectorAll('.row-2');
                rows.forEach(r => {
                    const inputs = r.querySelectorAll('input');
                    if (inputs.length === 2 && inputs[0].value && inputs[1].value) {
                        h += '<div><i class="fas fa-check-circle"></i> ' + inputs[0].value + ': <b>' + inputs[1].value + '</b></div>';
                    }
                });
            }
        } else if (window.currentMode === 'custom') {
            if(v('c_rooms')) h += '<div><i class="fas fa-bed"></i> Oda: <b>' + v('c_rooms') + '</b></div>';
            if(v('c_size')) h += '<div><i class="fas fa-ruler-combined"></i> Alan: <b>' + v('c_size') + '</b></div>';
            if(v('c_floor')) h += '<div><i class="fas fa-layer-group"></i> Kat: <b>' + v('c_floor') + '</b></div>';
            if(v('c_age')) h += '<div><i class="fas fa-calendar-alt"></i> Yaş: <b>' + v('c_age') + '</b></div>';
        }
        
        $('infoLineText').innerHTML=h;`;

if (regex.test(coreJs)) {
    coreJs = coreJs.replace(regex, replacement);
    fs.writeFileSync('core.js', coreJs);
    console.log('infoLineText generation updated successfully.');
} else {
    console.log('Regex failed.');
}
