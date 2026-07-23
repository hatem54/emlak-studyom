const fs = require('fs');

let autoSaveJs = fs.readFileSync('js/autoSave.js', 'utf8');

// 1. Update save logic
autoSaveJs = autoSaveJs.replace(
    /propertyType: document\.getElementById\('propertyTypeSelect'\) \? document\.getElementById\('propertyTypeSelect'\)\.value : 'satilik_daire'/,
    "propertyType: window.currentMode || 'satilik_daire'"
);

// 2. Update restore logic
// First find where propertyTypeSelect was restored
const oldRestore = `if(state.propertyType && document.getElementById('propertyTypeSelect')) {
            document.getElementById('propertyTypeSelect').value = state.propertyType;
        }`;
const newRestore = `if(state.propertyType) {
            // Restore accordion active state
            document.querySelectorAll('.cat-item').forEach(item => item.classList.remove('active'));
            const targetEl = document.querySelector('.cat-item[onclick*="' + state.propertyType + '"]');
            if(targetEl) {
                targetEl.classList.add('active');
                if (targetEl.closest('.cat-body')) {
                    targetEl.closest('.cat-body').classList.add('open');
                    const icon = targetEl.closest('.cat-group').querySelector('i');
                    if(icon) {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                    }
                }
            }
            window.switchPropertyType(state.propertyType);
        }`;

if (autoSaveJs.includes(oldRestore)) {
    autoSaveJs = autoSaveJs.replace(oldRestore, newRestore);
} else {
    // If it's not exactly that string, let's just insert it before renderData() in loadProject
    const renderCall = autoSaveJs.indexOf('if(typeof renderData === \'function\') renderData();');
    if (renderCall > -1) {
        autoSaveJs = autoSaveJs.substring(0, renderCall) + newRestore + '\n        ' + autoSaveJs.substring(renderCall);
    }
}

// 3. Update extraFieldsData initialization fallback
autoSaveJs = autoSaveJs.replace(
    /extraFieldsData\.daire = newExtra\.daire \|\| newExtra\.konut \|\| \[\];/,
    "extraFieldsData.dynamic = newExtra.dynamic || newExtra.daire || newExtra.konut || [];"
);

fs.writeFileSync('js/autoSave.js', autoSaveJs);
console.log('Successfully updated js/autoSave.js');
