const fs = require('fs');

const fileToPatch = "C:\\Users\\Hatemi\\Desktop\\emlak düzenlemeleri için uygulama\\emlak-studiom v7-0\\tpl_luks\\luks.js";
const varTextPath = "C:\\Users\\Hatemi\\Desktop\\emlak düzenlemeleri için uygulama\\emlak-studiom v7-0\\luks_correct_variations.txt";

let code = fs.readFileSync(fileToPatch, 'utf8');
let varText = fs.readFileSync(varTextPath, 'utf8');

// Replace the variations array completely
code = code.replace(/const variations = \[\{"html":[\s\S]*?\}\];/, varText);

// Apply other changes:
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

// Hide edit-hint
code = code.replace(/<div class="edit-hint">💡 Yazıya\/panele ÇİFT TIKLA \| Sürükle Bırak \| Sağ Tık \(Ayarlar\)<\/div>/, '<div class="edit-hint" style="display:none;">💡 Yazıya/panele ÇİFT TIKLA | Sürükle Bırak | Sağ Tık (Ayarlar)</div>');

// Update apply button selector
code = code.replace(/var b=document\.querySelector\('#luksTemplateGrid \.template-btn\.active'\);/, "var b=document.querySelector('#luksTemplateGrid .canva-tpl-card.active');");

// Update input listeners selector
code = code.replace(/const activeBtn = grid\.querySelector\('\.template-btn\.active'\);/, "const activeBtn = grid.querySelector('.canva-tpl-card.active');");

// Update clear selection selector
code = code.replace(/document\.querySelectorAll\('\.template-btn'\)\.forEach\(b => b\.classList\.remove\('active'\)\);/, "document.querySelectorAll('.template-btn, .canva-tpl-card').forEach(b => b.classList.remove('active'));");

fs.writeFileSync(fileToPatch, code, 'utf8');
console.log("Successfully patched luks.js without escaping issues.");
