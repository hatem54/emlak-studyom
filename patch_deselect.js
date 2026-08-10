const fs = require('fs');
let dragContent = fs.readFileSync('core/drag.js', 'utf8');

const targetDeselect = `function deselectAll(){
    document.querySelectorAll('.el-selected').forEach(e=>e.classList.remove('el-selected'));`;
const replacementDeselect = `function deselectAll(){
    document.querySelectorAll('.el-selected').forEach(e => {
        e.classList.remove('el-selected');
        e.querySelectorAll('.text-handle').forEach(h => h.remove());
    });`;

if (dragContent.includes(targetDeselect)) {
    dragContent = dragContent.replace(targetDeselect, replacementDeselect);
    fs.writeFileSync('core/drag.js', dragContent, 'utf8');
    console.log('deselectAll patched successfully!');
} else {
    console.log('target not found!');
}
