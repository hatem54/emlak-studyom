const fs = require('fs');
let content = fs.readFileSync('core/drag.js', 'latin1');

// 1. Revert previous bad logic (which blocked stopPropagation and caused photo to pan)
content = content.replace(
  /if \(!wasSelected\) \{ e\.preventDefault\(\); if \(el\.classList\.contains\('editable-draw'\) && \(e\.pointerType === 'pen' \|\| e\.pointerType === 'touch' \|\| e\.touches\)\) \{ return; \} \}  /,
  'if (!wasSelected) { e.preventDefault(); }  '
);

// 2. Set activeShape and isDraggingShape on pointerdown/touchstart
content = content.replace(
  /e\.stopPropagation\(\);\s*moved=false;/g,
  `e.stopPropagation();
        moved=false;
        if (el.classList.contains('editable-draw')) {
            window.activeShape = el;
            window.isDraggingShape = true;
        }`
);

// 3. Prevent move if not activeShape, or if isDraggingShape is false
content = content.replace(
  /if\(!dragging && !resizing\)return;/g,
  `if(!dragging && !resizing)return;
        if (el.classList.contains('editable-draw')) {
            if (window.isDraggingShape === false) return;
            if (window.activeShape && window.activeShape !== el) return;
        }`
);

// 4. Reset on up
content = content.replace(
  /function up\(e\)\{/g,
  `function up(e){
        if (el.classList.contains('editable-draw')) {
            window.isDraggingShape = false;
        }`
);

// 5. Reset activeShape when clicking empty space
content = content.replace(
  /if \(!e\.target\.closest\('\.editable-draw'\)/g,
  `window.activeShape = null; window.isDraggingShape = false;
      if (!e.target.closest('.editable-draw')`
);

fs.writeFileSync('core/drag.js', content, 'latin1');
