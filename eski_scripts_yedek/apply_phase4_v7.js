const fs = require('fs');
let html = fs.readFileSync('app.html', 'utf-8');

// We match the block from <div class="section-title"> to the closing </div> of row-2
// We use a regex that matches any character for the emojis

const regex = /<div class="section-title">[^<]*Şablon Yönetimi<\/div>\s*<p class="info-text">Tasarımınızı ve şablonunuzu bilgisayara kaydedip daha sonra yükleyebilirsiniz\.<\/p>\s*<div class="row-2" style="margin-bottom: 15px;">\s*<button class="btn-action btn-blue" onclick="saveProject\(\)">[^<]*Şablonu Kaydet<\/button>\s*<button class="btn-action btn-green" onclick="loadProject\(\)">[^<]*Şablon Aç<\/button>\s*<\/div>/;

const replaceStr = `<div class="section-title" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;" onclick="const acc = document.getElementById('templateAccordion'); const icon = this.querySelector('i'); if(acc.style.display === 'none'){acc.style.display='block'; icon.style.transform='rotate(180deg)';}else{acc.style.display='none'; icon.style.transform='rotate(0deg)';}">
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

html = html.replace(regex, replaceStr);

fs.writeFileSync('app.html', html);
console.log("Template Accordion applied securely.");
