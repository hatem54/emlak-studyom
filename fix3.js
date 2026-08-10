const fs = require('fs');
let content = fs.readFileSync('core/drag.js', 'latin1');

// Clean up any double additions
content = content.replace(/window\.activeShape = null; window\.isDraggingShape = false;\s*if \(!e\.target\.closest\('\.editable-draw'\)/g, "if (!e.target.closest('.editable-draw')");

// Add it correctly
content = content.replace(
  /if \(!e\.target\.closest\('\.editable-draw'\)/g,
  `window.activeShape = null; window.isDraggingShape = false;
      if (!e.target.closest('.editable-draw')`
);

fs.writeFileSync('core/drag.js', content, 'latin1');
