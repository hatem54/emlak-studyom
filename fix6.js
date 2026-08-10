const fs = require('fs');

let dragJs = fs.readFileSync('core/drag.js', 'utf8');

// The file was modified by regex that missed replacing up().
// Let's ensure up() has the clear variables.
dragJs = dragJs.replace(
  /if \(window\.isDraggingShape === false\) return;\s*if \(window\.activeShape && window\.activeShape !== el\) return;\s*dragging=false;/g,
  `if (window.isDraggingShape === false) return;
        if (window.activeShape && window.activeShape !== el) return;
        
        window.isDraggingShape = false;
        
        dragging=false;`
);

fs.writeFileSync('core/drag.js', dragJs, 'utf8');
console.log("drag.js updated successfully.");
