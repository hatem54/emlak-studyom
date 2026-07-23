const fs = require('fs');
let calloutJs = fs.readFileSync('modules/callout.js', 'utf8');

const regexSVG = /let isDragging = false, dsx, dsy, dix, diy;[\s\S]*?window\.addEventListener\('mouseup', function\(\)\{\s*isDragging = false;\s*\}\);/;
const regexStandard = /let isDragging = false, dsx, dsy, dix, diy;[\s\S]*?document\.addEventListener\('mouseup', function\(\)\{ isDragging = false; \}\);/;

const replacement = `let isDragging = false, dsx, dsy, dix, diy;
      let isInnerDragging = false, innerTarget = null, innerStartX, innerStartY, innerStartTx = 0, innerStartTy = 0;

      wrap.addEventListener('mousedown', function(e){
          if(e.button !== 0) return;
          if(e.target.closest('.callout-controls')) return;
          if(e.target.closest('.callout-resizer')) return;
          if(e.target.closest('.callout-rotator')) return;
          
          if (e.altKey && e.target !== wrap && e.target !== el && e.target.tagName !== 'svg' && !e.target.classList.contains('callout-svg-container')) {
              isInnerDragging = true;
              innerTarget = e.target;
              innerStartX = e.clientX;
              innerStartY = e.clientY;
              innerStartTx = parseFloat(innerTarget.dataset.tx) || 0;
              innerStartTy = parseFloat(innerTarget.dataset.ty) || 0;
              e.stopPropagation();
              e.preventDefault();
              return;
          }

          isDragging = true;
          dsx = e.clientX;
          dsy = e.clientY;
          dix = parseFloat(wrap.style.left) || 0;
          diy = parseFloat(wrap.style.top) || 0;
          e.stopPropagation();
      });

      document.addEventListener('mousemove', function(e){
          if (isInnerDragging && innerTarget) {
              let z = typeof getZoom === 'function' ? getZoom() : 1;
              let scale = parseFloat(el.dataset.scale) || 1;
              let dx = (e.clientX - innerStartX) / (z * scale);
              let dy = (e.clientY - innerStartY) / (z * scale);
              
              let newTx = innerStartTx + dx;
              let newTy = innerStartTy + dy;
              
              innerTarget.dataset.tx = newTx;
              innerTarget.dataset.ty = newTy;
              innerTarget.style.transform = \`translate(\${newTx}px, \${newTy}px)\`;
              return;
          }

          if(!isDragging) return;
          let z = typeof getZoom === 'function' ? getZoom() : 1;
          wrap.style.left = (dix + (e.clientX - dsx)/z) + 'px';
          wrap.style.top = (diy + (e.clientY - dsy)/z) + 'px';
      });

      document.addEventListener('mouseup', function(){
          isDragging = false;
          if (isInnerDragging) {
              isInnerDragging = false;
              innerTarget = null;
          }
      });`;

calloutJs = calloutJs.replace(regexSVG, replacement);
calloutJs = calloutJs.replace(regexStandard, replacement);

fs.writeFileSync('modules/callout.js', calloutJs, 'utf8');
console.log('Fixed ALT+drag for internal callout elements.');
