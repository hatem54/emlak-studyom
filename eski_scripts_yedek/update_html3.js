const fs = require('fs');
let html = fs.readFileSync('app.html', 'utf8');

const replacement = `
          <div class="section-title">🎛️ Genel Metin Stil</div>
          <div class="row-2" style="margin-bottom:10px;">
              <div class="color-row"><label style="font-size:10px;">Yazı Rengi</label><input type="color" id="globalTextColor" value="#ffffff" oninput="if(typeof applyFontSettings === 'function') applyFontSettings()"></div>
              <div class="color-row"><label style="font-size:10px;">Arka Plan</label>
                  <div style="display:flex; align-items:center; gap:5px;">
                      <input type="color" id="globalTextBg" value="#000000" oninput="document.getElementById('globalBgTransparent').checked = false; if(typeof applyFontSettings === 'function') applyFontSettings();">
                      <label style="font-size:10px; display:flex; align-items:center; gap:2px; cursor:pointer;"><input type="checkbox" id="globalBgTransparent" checked onchange="if(typeof applyFontSettings === 'function') applyFontSettings()"> Şeffaf</label>
                  </div>
              </div>
          </div>
          <div class="row-2">
`;

html = html.replace(/<div class="section-title">🎛️ Genel Metin Stil<\/div>\s*<div class="row-2">/, replacement.trim() + "\n");

fs.writeFileSync('app.html', html);
console.log("app.html updated successfully!");
