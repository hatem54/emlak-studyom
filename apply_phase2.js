const fs = require('fs');
let html = fs.readFileSync('app.html', 'utf-8');

const target1 = `<div class="section-title">💾 Şablon Yönetimi</div>
      <p class="info-text">Tasarımınızı ve şablonunuzu bilgisayara kaydedip daha sonra yükleyebilirsiniz.</p>
      <div class="row-2" style="margin-bottom: 15px;">
          <button class="btn-action btn-blue" onclick="saveProject()">💾 Şablonu Kaydet</button>
          <button class="btn-action btn-green" onclick="loadProject()">📂 Şablon Aç</button>
      </div>`;

const replace1 = `<div class="section-title" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;" onclick="const acc = document.getElementById('templateAccordion'); const icon = this.querySelector('i'); if(acc.style.display === 'none'){acc.style.display='block'; icon.style.transform='rotate(180deg)';}else{acc.style.display='none'; icon.style.transform='rotate(0deg)';}">
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

const target2 = `<div class="section-title">📦 Toplu Çıktı</div>
      <p class="info-text">Çoklu resim yükle, hepsini seçili formatta indir.</p>
      <div class="input-group"><label>📁 Çoklu Resim</label><input type="file" id="batchInput" accept="image/*" multiple></div>
      <div class="batch-file-list" id="batchFileList"></div>
      <div class="row-2" style="margin-top:6px">
          <button class="btn-action btn-blue" onclick="startBatchExport()">📸 Toplu Çıktı</button>
          <button class="btn-action btn-red" onclick="clearBatchFiles()">🗑️ Temizle</button>
      </div>
      <div class="batch-progress" id="batchProgress">
          <div style="font-size:11px;color:#94a3b8"><span id="batchStatus">...</span> <span id="batchPercent">0%</span></div>
          <div class="bar"><div class="bar-fill" id="batchBar"></div></div>
      </div>`;

const replace2 = `<div class="section-title" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;" onclick="const acc = document.getElementById('batchAccordion'); const icon = this.querySelector('i'); if(acc.style.display === 'none'){acc.style.display='block'; icon.style.transform='rotate(180deg)';}else{acc.style.display='none'; icon.style.transform='rotate(0deg)';}">
        <span>📦 Toplu Çıktı</span>
        <i class="fa-solid fa-chevron-down" style="transition: transform 0.3s; transform: rotate(0deg);"></i>
    </div>
    <div id="batchAccordion" style="display:none; margin-top:5px; margin-bottom:15px;">
        <p class="info-text" style="margin-bottom:8px;">Çoklu resim yükle, hepsini seçili formatta indir.</p>
        <div class="input-group"><label>📁 ÇOKLU RESİM</label><input type="file" id="batchInput" accept="image/*" multiple></div>
        <div class="batch-file-list" id="batchFileList"></div>
        <div class="row-2" style="margin-top:6px">
            <button class="btn-action btn-blue" onclick="startBatchExport()">📸 Toplu Çıktı</button>
            <button class="btn-action btn-red" onclick="clearBatchFiles()">🗑️ Temizle</button>
        </div>
        <div class="batch-progress" id="batchProgress">
            <div style="font-size:11px;color:#94a3b8"><span id="batchStatus">...</span> <span id="batchPercent">0%</span></div>
            <div class="bar"><div class="bar-fill" id="batchBar"></div></div>
        </div>
    </div>`;

const target3 = `<div class="section-title">⭐ Proje Geçmişi</div>
      <p class="info-text">Geçmişteki otomatik kayıtlara buradan dönebilirsiniz (Maks. 10 kayıt).</p>
      <div id="projectHistoryContainer" style="display:flex; flex-direction:column; gap:6px; max-height:200px; overflow-y:auto;">
          <div style="font-size:11px; color:#94a3b8; text-align:center; padding:10px;">Geçmiş kayıt aranıyor...</div>
      </div>`;

const replace3 = `<div class="section-title" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;" onclick="const acc = document.getElementById('historyAccordion'); const icon = this.querySelector('i'); if(acc.style.display === 'none'){acc.style.display='block'; icon.style.transform='rotate(180deg)';}else{acc.style.display='none'; icon.style.transform='rotate(0deg)';}">
        <span>⭐ Proje Geçmişi</span>
        <i class="fa-solid fa-chevron-down" style="transition: transform 0.3s; transform: rotate(0deg);"></i>
    </div>
    <div id="historyAccordion" style="display:none; margin-top:5px; margin-bottom:15px;">
        <p class="info-text" style="margin-bottom:8px;">Geçmişteki otomatik kayıtlara buradan dönebilirsiniz (Maks. 10 kayıt).</p>
        <div id="projectHistoryContainer" style="display:flex; flex-direction:column; gap:6px; max-height:200px; overflow-y:auto;">
            <div style="font-size:11px; color:#94a3b8; text-align:center; padding:10px;">Geçmiş kayıt aranıyor...</div>
        </div>
    </div>`;

// Regex based replacement to ignore exact whitespace differences
function replaceLoose(source, findStr, replaceStr) {
    const escapedFind = findStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*');
    const regex = new RegExp(escapedFind, 'g');
    return source.replace(regex, replaceStr);
}

html = replaceLoose(html, target1, replace1);
html = replaceLoose(html, target2, replace2);
html = replaceLoose(html, target3, replace3);

fs.writeFileSync('app.html', html);
console.log('Phase 2 complete: Accordions added securely.');
