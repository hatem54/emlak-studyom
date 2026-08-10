const fs = require('fs');
let dragJs = fs.readFileSync('core/drag.js', 'utf8');

dragJs = dragJs.replace(
  /function _getZoomTarget\(target\)\{/,
  `function _getZoomTarget(target){
    if (typeof uploadedImgUrl === 'undefined' || !uploadedImgUrl) return null;`
);

fs.writeFileSync('core/drag.js', dragJs, 'utf8');
console.log("Zoom disabled successfully for empty canvas.");
