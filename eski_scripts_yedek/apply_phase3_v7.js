const fs = require('fs');
let html = fs.readFileSync('app.html', 'utf-8');

const tplStr = `<div class="section-title">💾 Şablon Yönetimi</div>
    <p class="info-text">Tasarımınızı ve şablonunuzu bilgisayara kaydedip daha sonra yükleyebilirsiniz.</p>
          <div class="row-2" style="margin-bottom: 15px;">
          <button class="btn-action btn-blue" onclick="saveProject()">💾 Şablonu Kaydet</button>
          <button class="btn-action btn-green" onclick="loadProject()">📂 Şablon Aç</button>
      </div>`;

const tplRep = `<div class="section-title" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;" onclick="const acc = document.getElementById('templateAccordion'); const icon = this.querySelector('i'); if(acc.style.display === 'none'){acc.style.display='block'; icon.style.transform='rotate(180deg)';}else{acc.style.display='none'; icon.style.transform='rotate(0deg)';}">
        <span>💾 Şablon Yönetimi</span>
        <i class="fa-solid fa-chevron-down" style="transition: transform 0.3s; transform: rotate(0deg);"></i>
    </div>
    <div id="templateAccordion" style="display:none; margin-top:5px; margin-bottom:15px;">
        <p class="info-text" style="margin-bottom:8px;">Tasarımınızı ve şablonunuzu bilgisayara kaydedip daha sonra yükleyebilirsiniz.</p>
        <div class="row-2">
            <button class="btn-action btn-blue" onclick="saveProject()">💾 Şablonu Kaydet</button>
            <button class="btn-action btn-green" onclick="loadProject()">📂 Şablon Aç</button>
        </div>
    </div>`;

const histStr = `<div class="section-title">⭐ Proje Geçmişi</div>
      <p class="info-text">Geçmişteki otomatik kayıtlara buradan dönebilirsiniz (Maks. 10 kayıt).</p>
      <div id="projectHistoryContainer" style="display:flex; flex-direction:column; gap:6px; margin-bottom:15px; max-height:200px; overflow-y:auto;">
          <div style="font-size:11px; color:#94a3b8; text-align:center; padding:10px;">Geçmiş kayıt aranıyor...</div>
      </div>`;

const histRep = `<div class="section-title" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;" onclick="const acc = document.getElementById('historyAccordion'); const icon = this.querySelector('i'); if(acc.style.display === 'none'){acc.style.display='block'; icon.style.transform='rotate(180deg)';}else{acc.style.display='none'; icon.style.transform='rotate(0deg)';}">
        <span>⭐ Proje Geçmişi</span>
        <i class="fa-solid fa-chevron-down" style="transition: transform 0.3s; transform: rotate(0deg);"></i>
    </div>
    <div id="historyAccordion" style="display:none; margin-top:5px; margin-bottom:15px;">
        <p class="info-text" style="margin-bottom:8px;">Geçmişteki otomatik kayıtlara buradan dönebilirsiniz (Maks. 10 kayıt).</p>
        <div id="projectHistoryContainer" style="display:flex; flex-direction:column; gap:6px; max-height:200px; overflow-y:auto;">
            <div style="font-size:11px; color:#94a3b8; text-align:center; padding:10px;">Geçmiş kayıt aranıyor...</div>
        </div>
    </div>`;

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceLoose(source, findStr, replaceStr) {
    const escapedFind = escapeRegExp(findStr).replace(/\\s\+/g, '\\s*').replace(/ /g, '\\s*');
    const regex = new RegExp(escapedFind, 'g');
    return source.replace(regex, replaceStr);
}

// Just simpler exact replace with removed whitespace
function stripSpace(str) { return str.replace(/\s/g, ''); }

let startIdx = 0;
// We manually replace by checking stripped strings to be 100% safe
const strippedSource = stripSpace(html);
const strippedTpl = stripSpace(tplStr);
const strippedHist = stripSpace(histStr);

if (strippedSource.includes(strippedTpl)) {
    // using regex
    html = replaceLoose(html, tplStr, tplRep);
}

if (strippedSource.includes(strippedHist)) {
    html = replaceLoose(html, histStr, histRep);
}

fs.writeFileSync('app.html', html);
console.log('Phase 3 complete.');
