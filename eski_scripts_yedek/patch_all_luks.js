const fs = require('fs');

const v0Path = "C:\\Users\\Hatemi\\Desktop\\emlak düzenlemeleri için uygulama\\emlak-studiom v7-0\\tpl_luks\\luks.js";
const v11Path = "C:\\Users\\Hatemi\\Desktop\\emlak düzenlemeleri için uygulama\\emlak-studiom v7-11\\tpl_luks\\luks.js";

let code = fs.readFileSync(v0Path, 'utf8');
let v11Code = fs.readFileSync(v11Path, 'utf8');

// 1. Copy variations from v11
let match = v11Code.match(/const variations = \[\{"html":[\s\S]*?\}\];/);
if (match) {
    code = code.replace(/const variations = \[\{"html":[\s\S]*?\}\];/, match[0]);
}

// 2. Apply UI changes (buttons)
code = code.replace(/variations\.forEach\(\(v, idx\) => \{[\s\S]*?grid\.appendChild\(btn\);\n    \}\);/, 
    `variations.forEach((v, idx) => {
        const c = typeof LUKS_CARDS !== 'undefined' ? LUKS_CARDS[idx] : {id:'canvaL'+(idx+1), name:'L'+(idx+1)+'. Lüks Tasarım', bg1:'#0f172a', bg2:'#d4af37', accent:'#d4af37'};
        const btn = document.createElement('div');
        btn.className = 'canva-tpl-card';
        btn.dataset.id = c.id;
        const tBg = 'linear-gradient(135deg, '+c.bg1+', '+c.bg2+')';
        btn.innerHTML = '<div class="tpl-preview" style="display:flex;gap:0;border-radius:4px;overflow:hidden;background:'+tBg+'"><div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px;padding:4px;background:rgba(0,0,0,0.3)"><div style="font-size:13px;font-weight:900;color:'+c.accent+'">PRO</div><div style="font-size:10px;color:#fff">YENİ KALIP '+(idx+1)+'</div></div></div><div class="tpl-name">'+c.name+'</div>';
        
        btn.onclick = () => {
            if(btn.classList.contains('active')) return;
            document.querySelectorAll('#tpl-content-luks .canva-tpl-card').forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            renderLuksTemplate(v.html);
            
            // Seçimi kaydet
            localStorage.setItem('canvaActiveLuks', idx);
            // Kategori seçimi
            localStorage.setItem('canvaActiveCat', 'luks');
        };
        grid.appendChild(btn);
    });`
);

// 3. Hide edit-hint
code = code.replace(/<div class="edit-hint">💡 Yazıya\/panele ÇİFT TIKLA \| Sürükle Bırak \| Sağ Tık \(Ayarlar\)<\/div>/, '<div class="edit-hint" style="display:none;">💡 Yazıya/panele ÇİFT TIKLA | Sürükle Bırak | Sağ Tık (Ayarlar)</div>');

// 4. Update apply button selector
code = code.replace(/var b=document\.querySelector\('#luksTemplateGrid \.template-btn\.active'\);/, "var b=document.querySelector('#luksTemplateGrid .canva-tpl-card.active');");

// 5. Update input listeners selector
code = code.replace(/const activeBtn = grid\.querySelector\('\.template-btn\.active'\);/, "const activeBtn = grid.querySelector('.canva-tpl-card.active');");

// 6. Update clear selection selector (can match multiple times, or just be safe)
code = code.replace(/document\.querySelectorAll\('\.template-btn'\)\.forEach\(b => b\.classList\.remove\('active'\)\);/g, "document.querySelectorAll('.template-btn, .canva-tpl-card').forEach(b => b.classList.remove('active'));");

// 7. Fix scaleMin in renderLuksTemplate
const replacements = `    parsedHtml = parsedHtml.replace(/font-size:\\$\\{scaleY\\((\\d+)\\)\\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10))));
    parsedHtml = parsedHtml.replace(/font-size:\\$\\{scaleX\\((\\d+)\\)\\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10))));
    parsedHtml = parsedHtml.replace(/font-size:\\$\\{scaleMin\\((\\d+)\\)\\}/g, (m, p1) => 'font-size:' + Math.round(scaleMin(parseInt(p1, 10))));
    parsedHtml = parsedHtml.replace(/padding:\\$\\{scaleMin\\((\\d+)\\)\\}/g, (m, p1) => 'padding:' + Math.round(scaleMin(parseInt(p1, 10))));
    parsedHtml = parsedHtml.replace(/\\$\\{scaleMin\\((\\d+)\\)\\}/g, (m, p1) => Math.round(scaleMin(parseInt(p1, 10))));
    parsedHtml = parsedHtml.replace(/\\$\\{scaleX\\((\\d+)\\)\\}/g, (m, p1) => Math.round(scaleXFn(parseInt(p1, 10))));
    parsedHtml = parsedHtml.replace(/\\$\\{scaleY\\((\\d+)\\)\\}/g, (m, p1) => Math.round(scaleYFn(parseInt(p1, 10))));`;

code = code.replace(/    parsedHtml = parsedHtml\.replace\(\/font-size:\\\$\\\{scaleY\\\(\(\\d\+\)\\\)\\\}\/g,[\s\S]*?parsedHtml = parsedHtml\.replace\(\/\\\$\\\{scaleY\\\(\(\\d\+\)\\\)\\\}\/g, \(m, p1\) => Math\.round\(scaleYFn\(parseInt\(p1, 10\)\)\)\);/, replacements);

// 8. Fix localStorage English trap
const lsFix = `    let lsTitle = localStorage.getItem('canvaLTitle');
    if (lsTitle && lsTitle.toUpperCase().includes('DETACHED')) {
        lsTitle = 'SATILIK MÜSTAKİL EV';
        localStorage.setItem('canvaLTitle', lsTitle);
    }
    const lsPrice = localStorage.getItem('canvaLPrice');
    const lsFeats = localStorage.getItem('canvaLFeats');
    
    if(lsTitle) document.getElementById('canvaLTitle').value = lsTitle;`;

code = code.replace(/    const lsTitle = localStorage\.getItem\('canvaLTitle'\);\n    const lsPrice = localStorage\.getItem\('canvaLPrice'\);\n    const lsFeats = localStorage\.getItem\('canvaLFeats'\);\n    \n    if\(lsTitle\) document\.getElementById\('canvaLTitle'\)\.value = lsTitle;/, lsFix);

fs.writeFileSync(v0Path, code, 'utf8');
console.log("Successfully patched ALL changes!");
