const fs = require('fs');
let calloutJs = fs.readFileSync('modules/callout.js', 'utf8');

// Patch 1: addSVGCalloutToCanvas dblclick
const searchSvgDblClick = `      el.addEventListener('dblclick', function(e){
          e.stopPropagation();
          if (e.target.tagName === 'text' || e.target.tagName === 'tspan') {
              const newText = prompt('Metni düzenle:', e.target.textContent);
              if(newText !== null && newText.trim()) e.target.textContent = newText;
          } else {
              const texts = Array.from(el.querySelectorAll('text, tspan'));
              if (texts.length > 0) {
                   texts.forEach(t => {
                       const val = prompt('Metni düzenle:', t.textContent);
                       if (val !== null && val.trim()) t.textContent = val;
                   });
              }
          }
      });`;

const replaceSvgDblClick = `      el.addEventListener('dblclick', function(e){
          e.stopPropagation();
          if (e.target.tagName === 'text' || e.target.tagName === 'tspan') {
              const newText = prompt('Metni düzenle (Silmek için boş bırakın):', e.target.textContent);
              if(newText !== null) e.target.textContent = newText.trim();
          } else {
              const texts = Array.from(el.querySelectorAll('text, tspan'));
              if (texts.length > 0) {
                   texts.forEach(t => {
                       const val = prompt('Metni düzenle (Silmek için boş bırakın):', t.textContent);
                       if (val !== null) t.textContent = val.trim();
                   });
              }
          }
      });`;

// Because of possible encoding/indentation differences, let's use regex for safety:
calloutJs = calloutJs.replace(/if\(newText !== null && newText\.trim\(\)\) e\.target\.textContent = newText;/g, "if(newText !== null) e.target.textContent = newText.trim();");
calloutJs = calloutJs.replace(/if \(val !== null && val\.trim\(\)\) t\.textContent = val;/g, "if (val !== null) t.textContent = val.trim();");
calloutJs = calloutJs.replace(/prompt\('Metni d[ü\u00fc\u0130\u0131]zenle:'/g, "prompt('Metni düzenle (Silmek için boş bırakın):'");

// Patch 2: addCallout text editing
calloutJs = calloutJs.replace(/if\(newText !== null && newText\.trim\(\)\) el\.textContent = newText;/g, "if(newText !== null) el.textContent = newText.trim();");
calloutJs = calloutJs.replace(/if\(newText !== null && newText\.trim\(\)\) this\.textContent = newText;/g, "if(newText !== null) this.textContent = newText.trim();");

fs.writeFileSync('modules/callout.js', calloutJs, 'utf8');
console.log('Fixed SVG text deletion on empty prompt.');
