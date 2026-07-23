const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core/drag.js';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `          if (!window.selectedElements || !window.selectedElements.includes(el)) {
              if (typeof selectElement === 'function') selectElement(el, multiSelectKey);
          }
        
        const rect = el.getBoundingClientRect();`;

const replaceStr = `          let wasSelected = true;
          if (!window.selectedElements || !window.selectedElements.includes(el)) {
              wasSelected = false;
              if (typeof selectElement === 'function') selectElement(el, multiSelectKey);
          }
        
        const rect = el.getBoundingClientRect();`;

const targetStr2 = `        } else {
            dragging = true;
            el.classList.add('dragging');
        }`;

const replaceStr2 = `        } else {
            if (wasSelected) {
                dragging = true;
                el.classList.add('dragging');
            } else {
                // Sadece seçildi, sürüklemeyi başlatma
                dragging = false;
            }
        }`;

if (content.includes(targetStr) && content.includes(targetStr2)) {
    content = content.replace(targetStr, replaceStr);
    content = content.replace(targetStr2, replaceStr2);
    fs.writeFileSync(file, content, 'utf8');
    console.log("drag.js dragging logic patched successfully.");
} else {
    console.log("Could not find target strings for dragging logic patch.");
}
