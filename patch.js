const fs = require('fs');
let dragContent = fs.readFileSync('core/drag.js', 'utf8');
const addTextHandles = fs.readFileSync('addTextHandles.js', 'utf8');

const targetInject = 'window.selectedElements = window.selectedElements || [];';
if (!dragContent.includes('window.addTextHandles = function')) {
    dragContent = dragContent.replace(targetInject, addTextHandles + '\n' + targetInject);
}

const targetResize = 'const c = e.touches ? e.touches[0] : e;\r\n        \r\n        if (c.clientX >= rect.right - 20 && c.clientY >= rect.bottom - 20) {';
const replacementResize = 'const c = e.touches ? e.touches[0] : e;\n        \n        const hasOwnResizer = el.classList.contains(\'svg-callout\') || el.classList.contains(\'callout-wrap\');\n        \n        if (!hasOwnResizer && wasSelected && (e.target.closest(\'.text-resize-handle\') || (c.clientX >= rect.right - 20 && c.clientY >= rect.bottom - 20))) {';
const targetResizeLF = targetResize.replace(/\r\n/g, '\n');

if (dragContent.includes(targetResize)) {
    dragContent = dragContent.replace(targetResize, replacementResize);
} else if (dragContent.includes(targetResizeLF)) {
    dragContent = dragContent.replace(targetResizeLF, replacementResize);
}

const targetTab = "if(typeof switchTab === 'function' && !el.classList.contains('co-neon-block') && !el.classList.contains('callout-wrap') && !el.classList.contains('svg-callout') && !el.classList.contains('callout-item')) switchTab('element');";
const replacementTab = "if(typeof switchTab === 'function' && !el.classList.contains('co-neon-block') && !el.classList.contains('callout-wrap') && !el.classList.contains('svg-callout') && !el.classList.contains('callout-item')) switchTab('element');\n        if (el.classList.contains('canvas-el') && typeof window.addTextHandles === 'function') window.addTextHandles(el);";

if (dragContent.includes(targetTab)) {
    dragContent = dragContent.replace(targetTab, replacementTab);
}

fs.writeFileSync('core/drag.js', dragContent, 'utf8');
console.log('All changes applied successfully!');
