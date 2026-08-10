const fs = require('fs');
let code = fs.readFileSync('modules/draw.js', 'utf8');

// Fix handleDown touchstart
code = code.replace(
    "if (e.type === 'mousedown') { e.preventDefault(); e.stopPropagation(); }",
    "if (e.type === 'mousedown' || e.type === 'touchstart') { e.preventDefault(); e.stopPropagation(); }"
);

// Fix onMove in handleDown
let handleOnMove = "function onMove(me) {\n                  const meEvt = me.touches ? me.touches[0] : me;";
let handleOnMoveFix = "function onMove(me) {\n                  if (me.type === 'touchmove') { me.preventDefault(); me.stopPropagation(); }\n                  const meEvt = me.touches ? me.touches[0] : me;";
code = code.replace(handleOnMove, handleOnMoveFix);

// Fix onMove in rotHandleDown
let rotOnMove = "function onMove(me) {\n              const meEvt = me.touches ? me.touches[0] : me;";
let rotOnMoveFix = "function onMove(me) {\n              if (me.type === 'touchmove') { me.preventDefault(); me.stopPropagation(); }\n              const meEvt = me.touches ? me.touches[0] : me;";
code = code.replace(rotOnMove, rotOnMoveFix);

// Add else block for non-polygon rotation
let rotConditionEnd = "                  // Vertex handle'lar gOncelle\n                  const handles = el.querySelectorAll('.vertex-handle');\n                  newPoints.forEach((pt, i) => {\n                      if (handles[i]) {\n                          handles[i].style.left = (pt.x / bW * 100) + '%';\n                          handles[i].style.top = (pt.y / bH * 100) + '%';\n                      }\n                  });\n              }";
let rotConditionEndFix = "                  // Vertex handle'lari guncelle\n                  const handles = el.querySelectorAll('.vertex-handle');\n                  newPoints.forEach((pt, i) => {\n                      if (handles[i]) {\n                          handles[i].style.left = (pt.x / bW * 100) + '%';\n                          handles[i].style.top = (pt.y / bH * 100) + '%';\n                      }\n                  });\n              } else {\n                  const diffDeg = diffRad * (180 / Math.PI);\n                  let newRotation = prevAngle + diffDeg;\n                  newRotation = newRotation % 360;\n                  if (newRotation > 180) newRotation -= 360;\n                  else if (newRotation < -180) newRotation += 360;\n                  newRotation = Math.round(newRotation);\n                  \n                  el.dataset.rotation = newRotation;\n                  el.style.transform = 'rotate(' + newRotation + 'deg)';\n                  if (typeof selectedEl !== 'undefined' && selectedEl === el) {\n                      const rotSlider = document.getElementById('elRotate');\n                      if (rotSlider) rotSlider.value = newRotation;\n                      const rotVal = document.getElementById('elRotateVal');\n                      if (rotVal) rotVal.textContent = newRotation + '°';\n                  }\n              }";
// I will not use replace for this long string. I'll use regex or replace_file_content.
fs.writeFileSync('modules/draw.js', code, 'utf8');
console.log('Patched draw.js');
