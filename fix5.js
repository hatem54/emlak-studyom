const fs = require('fs');

let dragJs = fs.readFileSync('core/drag.js', 'utf8');

// In `down` function
dragJs = dragJs.replace(
  /if \(el\.classList\.contains\('editable-draw'\)\) \{\s*window\.activeShape = el;\s*window\.isDraggingShape = true;\s*\}/g,
  `window.activeShape = el;\n        window.isDraggingShape = true;`
);

// In `move` function
dragJs = dragJs.replace(
  /if \(el\.classList\.contains\('editable-draw'\)\) \{\s*if \(window\.isDraggingShape === false\) return;\s*if \(window\.activeShape && window\.activeShape !== el\) return;\s*\}/g,
  `if (window.isDraggingShape === false) return;\n        if (window.activeShape && window.activeShape !== el) return;`
);

// In `up` function
// First remove the old failed logic if it exists (it doesn't, but just in case)
dragJs = dragJs.replace(
  /if \(el\.classList\.contains\('editable-draw'\)\) \{\s*if \(window\.isDraggingShape === false\) return;\s*if \(window\.activeShape && window\.activeShape !== el\) return;\s*\}/g,
  `if (window.isDraggingShape === false) return;\n        if (window.activeShape && window.activeShape !== el) return;\n        window.isDraggingShape = false;\n        window.activeShape = null;`
);

fs.writeFileSync('core/drag.js', dragJs, 'utf8');
console.log("drag.js updated successfully.");
