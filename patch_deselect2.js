const fs = require('fs');
let content = fs.readFileSync('core/drag.js', 'utf8');

const target = "function deselectAll(){\r\n    document.querySelectorAll('.el-selected').forEach(e=>e.classList.remove('el-selected'));\r\n    selectedEl=null;";
const targetLf = "function deselectAll(){\n    document.querySelectorAll('.el-selected').forEach(e=>e.classList.remove('el-selected'));\n    selectedEl=null;";

const replacement = `function deselectAll(){
    document.querySelectorAll('.el-selected').forEach(e => {
        e.classList.remove('el-selected');
        e.querySelectorAll('.text-handle').forEach(h => h.remove());
    });
    selectedEl=null;`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    console.log('Replaced target with CRLF');
} else if (content.includes(targetLf)) {
    content = content.replace(targetLf, replacement);
    console.log('Replaced target with LF');
} else {
    console.log('Target not found in drag.js');
}

fs.writeFileSync('core/drag.js', content, 'utf8');
