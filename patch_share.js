const fs = require('fs');
let c = fs.readFileSync('modules/export.js', 'utf8');

const shareImgRegex = /scale: 1, \/\/ just standard scale for sharing to be fast\r?\n\s*backgroundColor: null/;
const replacement = `scale: 1, // just standard scale for sharing to be fast
              backgroundColor: null,
              ignoreElements: (el) => {
                  if(el.classList && (el.classList.contains('text-handle') || el.classList.contains('el-selected') || el.classList.contains('photo-inner-zoom'))) return true;
                  return false;
              }`;

c = c.replace(shareImgRegex, replacement);
fs.writeFileSync('modules/export.js', c);
