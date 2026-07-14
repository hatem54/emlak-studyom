/* ============================================================
   kolaj.js — v10 PRO
   - Tüm çerçeveler absolute (bağımsız)
   - Seçim + Taşıma + Boyutlandırma + Döndürme
   - Sağ panel özellik editörü
   - Ctrl+Z geri al
   - Foto zoom/pan
============================================================ */
console.log('📸 Kolaj v10 PRO yükleniyor...');

// ==================== GLOBAL DURUM ====================
var _kolajAktif = null;
var _kolajGecmis = [];
var _kolajMaxGecmis = 50;

// Yeni: Format (ölçü) değiştiğinde fotoğrafları yeni ölçüye göre tekrar ölçeklendir
function _kolajFormatGuncelle(){
    document.querySelectorAll('.kolaj-foto').forEach(function(el){
        if(el.dataset.kzReady !== '1') return;
        var fotoW = parseFloat(el.dataset.kzFotoW), fotoH = parseFloat(el.dataset.kzFotoH);
        var kutuW = el.offsetWidth, kutuH = el.offsetHeight;
        if(fotoW && fotoH && kutuW && kutuH) {
            var minScale = Math.max(kutuW/fotoW, kutuH/fotoH);
            el.dataset.kzScale = String(minScale);
            el.dataset.kzMinScale = String(minScale * 0.5);
            el.dataset.kzX = String((kutuW - fotoW * minScale) / 2);
            el.dataset.kzY = String((kutuH - fotoH * minScale) / 2);
            if(typeof _kzTransform === 'function') _kzTransform(el);
        }
    });
}
var _seciliCerceve = null;
var _kolajBilgiler = {
    baslik: 'SATILIK LÜKS DAİRE',
    altBaslik: 'MERKEZİ KONUM',
    fiyat: '6.750.000 TL',
    ozellik1: '4+1',
    ozellik2: '180 m²',
    ozellik3: 'Doğalgaz',
    telefon: '0532 000 00 00',
    aciklama: 'Merkezi konumda profesyonel yaşam alanı',
    bgRenk: ''
};

// ==================== SEKME OLUŞTUR ====================
function _kolajInit(){
    var canvaPanel = document.getElementById('tpl-content-kolaj');
    if(!canvaPanel){ setTimeout(_kolajInit, 500); return; }
    
    if(document.getElementById('kolaj-icerik')) return; // already added
    
    var panel = document.createElement('div');
    panel.id = 'kolaj-icerik';
    // Removed margins and borders because accordion already has padding
    panel.innerHTML = _kolajPanelHTML();
    
    canvaPanel.appendChild(panel);
    
    _kolajBtnBind();
    _kolajBilgiInputlariBind();
    console.log('✅ Kolaj şablonları Şablonlar sekmesine eklendi');
}

function _kolajPanelHTML(){
    return '<div class="edit-hint">📸 Alt+Sürükle: Taşı | Alt+Köşe: Boyutlandır | Tekerlek: Zoom | Sürükle: Kaydır | <b>Yazıya çift tık: Düzenle</b></div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">'+
            '<button class="btn-action" style="background:#f59e0b;color:#000;font-weight:700;" onclick="_kolajGeriAl()">↩️ Geri Al</button>'+
            '<button class="btn-action" style="background:#ef4444;color:#fff;font-weight:700;" onclick="_kolajSifirla()">🔄 Sıfırla</button>'+
        '</div>'+
        '<div class="section-title">🎨 Kolaj Şablonları</div>'+
        ''+
        '<div class="template-grid" id="kolajGrid"></div>'+
        
        '<div class="section-title" style="margin-top:20px;">🖼️ Arka Plan</div>'+
        '<div class="row-2">'+
            '<div class="input-group"><label>Renk 1</label><input type="color" id="kolajBgRenk1" value="#0d1b3d" style="width:100%;height:40px;"></div>'+
            '<div class="input-group"><label>Renk 2</label><input type="color" id="kolajBgRenk2" value="#1a2f5c" style="width:100%;height:40px;"></div>'+
        '</div>'+
        '<button class="btn-action btn-purple" onclick="_kolajBgUygula()" style="width:100%;margin-bottom:15px;">🎨 Arka Planı Uygula</button>'+
        
        '<div class="section-title">📝 Kolaj Bilgileri</div>'+
        '<div class="input-group"><label>Başlık</label><input type="text" id="kolajBaslik" value="SATILIK LÜKS DAİRE"></div>'+
        '<div class="input-group"><label>Alt Başlık</label><input type="text" id="kolajAltBaslik" value="MERKEZİ KONUM"></div>'+
        '<div class="input-group"><label>💰 Fiyat</label><input type="text" id="kolajFiyat" value="6.750.000 TL"></div>'+
        '<div class="row-2">'+
            '<div class="input-group"><label>Özellik 1</label><input type="text" id="kolajOzellik1" value="4+1"></div>'+
            '<div class="input-group"><label>Özellik 2</label><input type="text" id="kolajOzellik2" value="180 m²"></div>'+
        '</div>'+
        '<div class="input-group"><label>Özellik 3</label><input type="text" id="kolajOzellik3" value="Doğalgaz"></div>'+
        '<div class="input-group"><label>📞 Telefon</label><input type="text" id="kolajTelefon" value="0532 000 00 00"></div>'+
        '<div class="input-group"><label>Açıklama</label><input type="text" id="kolajAciklama" value="Merkezi konumda profesyonel yaşam alanı"></div>'+
        
        // Seçili çerçeve editörü (dinamik doldurulacak)
        '<div id="cerceveEditor" style="display:none;margin-top:20px;padding:12px;background:#1e293b;border:2px solid #0ff;border-radius:8px;">'+
            '<div class="section-title" style="color:#0ff;">🎯 Seçili Çerçeve</div>'+
            '<div id="cerceveEditorIcerik"></div>'+
        '</div>';
}

function _kolajBilgiInputlariBind(){
    var alanlar = ['Baslik','AltBaslik','Fiyat','Ozellik1','Ozellik2','Ozellik3','Telefon','Aciklama'];
    alanlar.forEach(function(a){
        var el = document.getElementById('kolaj'+a);
        if(el){
            el.addEventListener('input', function(){
                _kolajBilgiler[a.charAt(0).toLowerCase()+a.slice(1)] = el.value;
                _kolajBilgiGuncelle();
            });
        }
    });
}

function _kolajBilgiGuncelle(){
    var wrap = document.getElementById('kolaj-wrapper');
    if(!wrap) return;
    Object.keys(_kolajBilgiler).forEach(function(k){
        var els = wrap.querySelectorAll('[data-bilgi="'+k+'"]');
        els.forEach(function(el){ el.textContent = _kolajBilgiler[k]; });
    });
}

function _kolajBgUygula(){
    var wrap = document.getElementById('kolaj-wrapper');
    if(!wrap) return;
    var r1 = document.getElementById('kolajBgRenk1').value;
    var r2 = document.getElementById('kolajBgRenk2').value;
    wrap.style.background = 'linear-gradient(135deg,'+r1+' 0%,'+r2+' 100%)';
    _kolajDurumKaydet();
}

// ==================== 10 ŞABLON ====================
var KOLAJ_SABLONLARI = [
    {id:1,  ad:'🏢 Kurumsal Ofis',    fn:'_kolaj1',  bg1:'#0d1b3d', bg2:'#1a2f5c'},
    {id:2,  ad:'🏠 Modern Daire',     fn:'_kolaj2',  bg1:'#000000', bg2:'#1a1a1a'},
    {id:3,  ad:'🌿 Doğa & Arazi',     fn:'_kolaj3',  bg1:'#0d3520', bg2:'#1a5c3a'},
    {id:4,  ad:'🌊 Deniz Manzara',    fn:'_kolaj4',  bg1:'#0a2540', bg2:'#1e5f8e'},
    {id:5,  ad:'💎 Lüks Rezidans',    fn:'_kolaj5',  bg1:'#3d0d1b', bg2:'#5c1a2f'},
    {id:6,  ad:'❄️ Glacier Crystal',  fn:'_kolaj6',  bg1:'#a8d5e2', bg2:'#5b9bb8'},
    {id:7,  ad:'📰 Minimalist Vogue', fn:'_kolaj7',  bg1:'#faf8f3', bg2:'#ede7d9'},
    {id:8,  ad:'🌿 Botanica Estate',  fn:'_kolaj8',  bg1:'#1a3a2a', bg2:'#2d5c42'},
    {id:9,  ad:'💎 Diamond Boutique', fn:'_kolaj9',  bg1:'#0f1a2e', bg2:'#1a2a44'},
    {id:10, ad:'💠 Elmas Magazine',   fn:'_kolaj10', bg1:'#1a1a2e', bg2:'#16213e'}
];

function _kolajBtnBind(){
    var grid = document.getElementById('kolajGrid');
    if(!grid) return;
    grid.innerHTML = '';
    KOLAJ_SABLONLARI.forEach(function(s){
        var btn = document.createElement('button');
        btn.className = 'template-btn';
        btn.textContent = s.ad;
        btn.onclick = function(){
            if(btn.classList.contains('active')) return;

            _cerceveSecimKaldir();
            if(typeof clearAllTemplates === 'function') clearAllTemplates();
            window[s.fn]();
            document.querySelectorAll('#kolajGrid .template-btn').forEach(function(b){b.classList.remove('active');});
            btn.classList.add('active');
            _kolajAktif = s.id;
            document.getElementById('kolajBgRenk1').value = s.bg1;
            document.getElementById('kolajBgRenk2').value = s.bg2;
            _kolajGecmis = [];
            setTimeout(_kolajDurumKaydet, 100);
        };
        grid.appendChild(btn);
    });
}

// ==================== YARDIMCILAR ====================
function _kolajCanvas(){
    return document.getElementById('canvas-container') 
        || document.getElementById('canvas-container')
        || document.getElementById('photo-layer');
}

function _kolajTemizle(){
    var eski = document.getElementById('kolaj-wrapper');
    if(eski) eski.remove();
    
    // Şablonlar arası geçişte eski şablon elementlerini temizle
    document.querySelectorAll('.canva-generated').forEach(el => {
        if(el.parentNode) el.remove();
        if(typeof canvaOverlays !== 'undefined') {
            const idx = canvaOverlays.indexOf(el);
            if(idx > -1) canvaOverlays.splice(idx, 1);
        }
    });
}

function _kolajWrapper(bg1, bg2){
    _kolajTemizle();
    var w = document.createElement('div');
    w.id = 'kolaj-wrapper';
    w.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:5;box-sizing:border-box;overflow:hidden;'+
        'background:linear-gradient(135deg,'+bg1+' 0%,'+bg2+' 100%);';
    return w;
}

// Foto kutusu - ABSOLUTE pozisyon ile
// x,y,w,h => yüzdelik (0-100)
function _foto(no, x, y, w, h, opts){
    opts = opts || {};
    var radius = opts.radius || '8px';
    var border = opts.border || '2px dashed rgba(255,255,255,0.4)';
    var extra = opts.extra || '';
    return '<div class="kolaj-cerceve kolaj-foto" data-kolaj-no="'+no+'" data-tip="foto" '+
           'style="position:absolute;z-index:10;left:'+x+'%;top:'+y+'%;width:'+w+'%;height:'+h+'%;'+
           'background:rgba(255,255,255,0.05);border:'+border+';border-radius:'+radius+';'+
           'overflow:hidden;cursor:pointer;display:flex;align-items:center;justify-content:center;'+
           'color:#fff;font-weight:600;box-sizing:border-box;'+extra+'">'+
           '<div class="kolaj-placeholder" style="pointer-events:none;text-align:center;font-size:13px;opacity:0.7;">'+
           '📷<br>Foto '+no+'<br><span style="font-size:10px;">Tıkla</span>'+
           '</div>'+
           '</div>';
}

// Yazı kutusu - ABSOLUTE pozisyon
function _yazi(x, y, w, h, icerik, opts){
    opts = opts || {};
    var bg = opts.bg || 'transparent';
    var color = opts.color || '#fff';
    var padding = opts.padding || '15px';
    var radius = opts.radius || '0';
    var border = opts.border || 'none';
    var extra = opts.extra || '';
    return '<div class="kolaj-cerceve kolaj-yazi" data-tip="yazi" '+
           'style="position:absolute;z-index:10;left:'+x+'%;top:'+y+'%;width:'+w+'%;height:'+h+'%;'+
           'background:'+bg+';color:'+color+';padding:'+padding+';border-radius:'+radius+';'+
           'border:'+border+';box-sizing:border-box;overflow:hidden;'+extra+'">'+
           icerik+
           '</div>';
}

function _b(alan, defaultText){
    return '<span data-bilgi="'+alan+'">'+(_kolajBilgiler[alan] || defaultText)+'</span>';
}

// ==================== 10 ŞABLON (Hepsi absolute) ====================

function _kolaj1(){
    var c = _kolajCanvas(); if(!c) return;
    var w = _kolajWrapper('#0d1b3d','#1a2f5c');
    w.innerHTML = 
        _yazi(2, 5, 40, 30, 
            '<div style="display:inline-block;background:#c9a961;padding:8px 20px;border-radius:4px;font-size:14px;font-weight:700;color:#0d1b3d;letter-spacing:3px;">'+_b('altBaslik','KİRALIK')+'</div>'+
            '<div style="font-size:56px;font-weight:900;line-height:1;margin-top:15px;color:#fff;">'+_b('baslik','MERKEZ OFİS')+'</div>'+
            '<div style="font-size:16px;margin-top:15px;color:#fff;opacity:0.9;">'+_b('aciklama','Merkezi konumda...')+'</div>')+
        _yazi(2, 65, 40, 30,
            '<div style="border-top:2px solid #c9a961;padding-top:15px;color:#fff;">'+
            '<div style="font-size:14px;opacity:0.7;">KİRA BEDELİ</div>'+
            '<div style="font-size:42px;font-weight:900;color:#c9a961;">'+_b('fiyat','18.000 TL')+'</div>'+
            '<div style="font-size:14px;margin-top:10px;">📞 '+_b('telefon','0532 000 00 00')+'</div></div>')+
        _foto(1, 45, 5, 53, 60, {radius:'8px', border:'2px dashed #c9a961'})+
        _foto(2, 45, 68, 17, 27, {radius:'8px', border:'2px dashed #c9a961'})+
        _foto(3, 63.5, 68, 17, 27, {radius:'8px', border:'2px dashed #c9a961'})+
        _foto(4, 82, 68, 16, 27, {radius:'8px', border:'2px dashed #c9a961'});
    c.appendChild(w);
}

function _kolaj2(){
    var c = _kolajCanvas(); if(!c) return;
    var w = _kolajWrapper('#000','#1a1a1a');
    w.innerHTML = 
        _yazi(5, 3, 90, 12,
            '<div style="text-align:center;">'+
            '<div style="font-size:42px;font-weight:900;color:#d4af37;">'+_b('baslik','SATILIK LÜKS DAİRE')+'</div>'+
            '<div style="font-size:16px;opacity:0.7;letter-spacing:5px;margin-top:5px;color:#fff;">'+_b('altBaslik','MERKEZİ KONUM')+'</div></div>')+
        _foto(1, 5, 17, 90, 45, {radius:'12px', border:'2px dashed #d4af37'})+
        _foto(2, 5, 64, 21.5, 20, {radius:'8px', border:'2px dashed #d4af37'})+
        _foto(3, 28, 64, 21.5, 20, {radius:'8px', border:'2px dashed #d4af37'})+
        _foto(4, 51, 64, 21.5, 20, {radius:'8px', border:'2px dashed #d4af37'})+
        _foto(5, 74, 64, 21, 20, {radius:'8px', border:'2px dashed #d4af37'})+
        _yazi(5, 86, 90, 12,
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;background:#d4af37;padding:15px;border-radius:8px;color:#000;height:100%;box-sizing:border-box;">'+
            '<div style="text-align:center;"><div style="font-size:11px;opacity:0.7;font-weight:700;">FİYAT</div><div style="font-size:22px;font-weight:900;">'+_b('fiyat','15.000 TL')+'</div></div>'+
            '<div style="text-align:center;border-left:1px solid rgba(0,0,0,0.3);border-right:1px solid rgba(0,0,0,0.3);"><div style="font-size:11px;opacity:0.7;font-weight:700;">ALAN</div><div style="font-size:22px;font-weight:900;">'+_b('ozellik2','120 m²')+'</div></div>'+
            '<div style="text-align:center;"><div style="font-size:11px;opacity:0.7;font-weight:700;">TELEFON</div><div style="font-size:18px;font-weight:900;">'+_b('telefon','0532 000 00 00')+'</div></div>'+
            '</div>', {padding:'0'});
    c.appendChild(w);
}

function _kolaj3(){
    var c = _kolajCanvas(); if(!c) return;
    var w = _kolajWrapper('#0d3520','#1a5c3a');
    w.innerHTML = 
        _yazi(3, 3, 60, 15,
            '<div style="display:inline-block;background:#c9a961;color:#0d3520;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:800;">'+_b('altBaslik','🌿 SATILIK ARAZİ')+'</div>'+
            '<div style="font-size:38px;font-weight:900;margin-top:8px;letter-spacing:2px;color:#fff;">'+_b('baslik','SÖĞÜTLÜ MAH.')+'</div>')+
        _yazi(65, 3, 32, 15,
            '<div style="text-align:right;color:#fff;"><div style="font-size:14px;opacity:0.7;">TOPLAM ALAN</div>'+
            '<div style="font-size:36px;font-weight:900;color:#c9a961;">'+_b('ozellik2','7.824 m²')+'</div></div>')+
        _foto(1, 3, 20, 94, 50, {radius:'12px', border:'3px dashed #c9a961'})+
        _foto(2, 3, 72, 15, 15, {radius:'6px', border:'2px dashed #c9a961'})+
        _foto(3, 19.5, 72, 15, 15, {radius:'6px', border:'2px dashed #c9a961'})+
        _foto(4, 36, 72, 15, 15, {radius:'6px', border:'2px dashed #c9a961'})+
        _foto(5, 52.5, 72, 15, 15, {radius:'6px', border:'2px dashed #c9a961'})+
        _foto(6, 69, 72, 15, 15, {radius:'6px', border:'2px dashed #c9a961'})+
        _foto(7, 85.5, 72, 11.5, 15, {radius:'6px', border:'2px dashed #c9a961'})+
        _yazi(3, 89, 63, 9,
            '<div style="background:rgba(0,0,0,0.4);border-left:4px solid #c9a961;padding:12px;border-radius:6px;color:#fff;font-size:14px;height:100%;box-sizing:border-box;">'+
            '✓ '+_b('ozellik1','Fındık Bahçesi')+' &nbsp;•&nbsp; ✓ '+_b('ozellik3','2 Katlı Ev')+' &nbsp;•&nbsp; 📞 '+_b('telefon','0532 000 00 00')+'</div>', {padding:'0'})+
        _yazi(68, 89, 29, 9,
            '<div style="background:#c9a961;color:#0d3520;padding:10px;border-radius:6px;text-align:center;height:100%;box-sizing:border-box;">'+
            '<div style="font-size:10px;font-weight:700;opacity:0.7;">FİYAT</div><div style="font-size:24px;font-weight:900;">'+_b('fiyat','11.000.000 TL')+'</div></div>', {padding:'0'});
    c.appendChild(w);
}

function _kolaj4(){
    var c = _kolajCanvas(); if(!c) return;
    var w = _kolajWrapper('#0a2540','#1e5f8e');
    w.innerHTML = 
        _foto(1, 0, 0, 50, 50, {radius:'0', border:'2px dashed #7dd3fc'})+
        _foto(2, 50, 0, 50, 50, {radius:'0', border:'2px dashed #7dd3fc'})+
        _foto(3, 0, 50, 50, 50, {radius:'0', border:'2px dashed #7dd3fc'})+
        _foto(4, 50, 50, 50, 50, {radius:'0', border:'2px dashed #7dd3fc'})+
        _yazi(20, 30, 60, 40,
            '<div style="background:rgba(10,37,64,0.95);padding:30px;border-radius:16px;border:2px solid #7dd3fc;text-align:center;color:#fff;box-shadow:0 20px 60px rgba(0,0,0,0.5);height:100%;box-sizing:border-box;">'+
            '<div style="font-size:13px;letter-spacing:6px;color:#7dd3fc;font-weight:700;">'+_b('altBaslik','🌊 DENİZ MANZARALI')+'</div>'+
            '<div style="font-size:44px;font-weight:900;margin:10px 0;">'+_b('baslik','SAHİL VİLLA')+'</div>'+
            '<div style="font-size:15px;opacity:0.8;">'+_b('ozellik1','5+2')+' • '+_b('ozellik2','320 m²')+' • '+_b('ozellik3','Havuzlu')+'</div>'+
            '<div style="width:80px;height:2px;background:#7dd3fc;margin:15px auto;"></div>'+
            '<div style="font-size:32px;font-weight:900;color:#7dd3fc;">'+_b('fiyat','25.000.000 TL')+'</div>'+
            '<div style="font-size:13px;margin-top:5px;opacity:0.7;">📞 '+_b('telefon','0532 000 00 00')+'</div></div>', {padding:'0'});
    c.appendChild(w);
}

function _kolaj5(){
    var c = _kolajCanvas(); if(!c) return;
    var w = _kolajWrapper('#3d0d1b','#5c1a2f');
    w.innerHTML = 
        // SOL BÜYÜK FOTO (diagonal clip)
        _foto(1, 0, 0, 58, 100, {radius:'0', border:'2px dashed #f5e6d3', extra:'clip-path:polygon(0 0, 100% 0, 85% 100%, 0 100%);'})+
        // SAĞ 5 KÜÇÜK FOTO
        _foto(2, 62, 3, 35, 30, {radius:'8px', border:'2px dashed #f5e6d3'})+
        _foto(3, 62, 35, 16.5, 30, {radius:'8px', border:'2px dashed #f5e6d3'})+
        _foto(4, 80.5, 35, 16.5, 30, {radius:'8px', border:'2px dashed #f5e6d3'})+
        _foto(5, 62, 67, 16.5, 30, {radius:'8px', border:'2px dashed #f5e6d3'})+
        _foto(6, 80.5, 67, 16.5, 30, {radius:'8px', border:'2px dashed #f5e6d3'})+
        // SOL ALT YAZI (foto üzerinde)
        _yazi(3, 70, 45, 27,
            '<div style="color:#f5e6d3;">'+
            '<div style="font-size:14px;letter-spacing:8px;opacity:0.7;">'+_b('altBaslik','EXCLUSIVE')+'</div>'+
            '<div style="font-size:48px;font-weight:900;line-height:1;text-shadow:2px 2px 8px rgba(0,0,0,0.8);">'+_b('baslik','LÜKS Rezidans')+'</div>'+
            '<div style="font-size:28px;font-weight:700;color:#fff;margin-top:12px;text-shadow:1px 1px 6px rgba(0,0,0,0.8);">'+_b('fiyat','42.000.000 TL')+'</div>'+
            '<div style="font-size:14px;margin-top:5px;text-shadow:1px 1px 4px rgba(0,0,0,0.8);">📞 '+_b('telefon','0532 000 00 00')+'</div>'+
            '</div>', {padding:'0', extra:'z-index:5;'});
    c.appendChild(w);
}

function _kolaj6(){
    var c = _kolajCanvas(); if(!c) return;
    var w = _kolajWrapper('#a8d5e2','#5b9bb8');
    
    w.innerHTML = 
        // ARKA PLAN - Buz kristali efekti (radial glow)
        '<div style="position:absolute;top:0;left:0;width:100%;height:100%;'+
            'background-image:radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0%, transparent 40%),'+
            'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 40%),'+
            'radial-gradient(circle at 50% 50%, rgba(200,230,240,0.2) 0%, transparent 60%);'+
            'pointer-events:none;z-index:1;"></div>'+
        
        // ARKA PLAN - Diagonal ışık huzmesi
        '<div style="position:absolute;top:-20%;left:-10%;width:120%;height:200%;'+
            'background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,0.15) 50%,transparent 60%);'+
            'pointer-events:none;z-index:1;transform:rotate(-5deg);"></div>'+
        
        // ÜST SOL - Kristal madalya (frosted circle)
        '<div style="position:absolute;top:3%;left:3%;width:80px;height:80px;'+
            'border-radius:50%;border:1px solid rgba(255,255,255,0.6);'+
            'background:rgba(255,255,255,0.2);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);'+
            'display:flex;flex-direction:column;align-items:center;justify-content:center;'+
            'color:#1e3a5f;z-index:5;box-shadow:0 8px 30px rgba(30,58,95,0.2);">'+
            '<div style="font-size:20px;line-height:1;">❄</div>'+
            '<div style="font-size:7px;letter-spacing:2px;margin-top:2px;font-weight:600;">PREMIUM</div>'+
            '<div style="font-size:7px;letter-spacing:2px;font-weight:600;">CRYSTAL</div>'+
        '</div>'+
        
        // ÜST SAĞ - Marka etiketi (buzlu cam)
        _yazi(65, 3, 32, 8,
            '<div style="text-align:right;color:#1e3a5f;background:rgba(255,255,255,0.25);'+
                'backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);'+
                'padding:8px 15px;border:1px solid rgba(255,255,255,0.5);border-radius:4px;'+
                'box-shadow:0 4px 20px rgba(30,58,95,0.15);">'+
                '<div style="font-family:Playfair Display,Georgia,serif;font-size:20px;font-weight:400;letter-spacing:4px;font-style:italic;">Glacier</div>'+
                '<div style="font-size:9px;letter-spacing:5px;opacity:0.85;">E S T A T E &nbsp; · &nbsp; 2025</div>'+
            '</div>', {padding:'0'})+
        
        // ANA BAŞLIK - Merkezde
        _yazi(15, 14, 70, 14,
            '<div style="text-align:center;color:#0f2540;">'+
                '<div style="font-size:11px;letter-spacing:10px;color:#2c5f7f;font-weight:600;">'+_b('altBaslik','CRYSTAL COLLECTION')+'</div>'+
                '<div style="font-family:Playfair Display,serif;font-size:68px;font-weight:400;line-height:1;margin-top:6px;font-style:italic;text-shadow:0 2px 20px rgba(255,255,255,0.5);">'+_b('baslik','Sıcak Yuvanız')+'</div>'+
                '<div style="display:flex;align-items:center;justify-content:center;margin-top:8px;">'+
                    '<div style="width:50px;height:1px;background:#2c5f7f;"></div>'+
                    '<div style="margin:0 12px;color:#2c5f7f;font-size:14px;">❄</div>'+
                    '<div style="width:50px;height:1px;background:#2c5f7f;"></div>'+
                '</div>'+
            '</div>', {padding:'0'})+
        
                // FOTO 1 - SOL BÜYÜK (yuvarlak köşeli kare - dikey)
        _foto(1, 3, 32, 34, 51, {radius:'20px', border:'2px solid rgba(255,255,255,0.7)', extra:'box-shadow:0 20px 60px rgba(30,58,95,0.3), 0 0 40px rgba(255,255,255,0.4);'})+
        
                // ÜST SOL - Kare (yuvarlak köşe)
        _foto(2, 44, 32, 27, 24, {radius:'16px', border:'2px solid rgba(255,255,255,0.7)', extra:'box-shadow:0 15px 40px rgba(30,58,95,0.3);'})+
        
        // ÜST SAĞ - Yuvarlak
        _foto(3, 74, 32, 13.5, 24, {radius:'50%', border:'3px solid rgba(255,255,255,0.8)', extra:'box-shadow:0 15px 40px rgba(30,58,95,0.3), 0 0 30px rgba(255,255,255,0.5);'})+
        
        // ALT SOL - Yuvarlak
        _foto(4, 44, 59, 13.5, 24, {radius:'50%', border:'3px solid rgba(255,255,255,0.8)', extra:'box-shadow:0 15px 40px rgba(30,58,95,0.3), 0 0 30px rgba(255,255,255,0.5);'})+
        
        // ALT SAĞ - Kare (yuvarlak köşe)
        _foto(5, 61, 59, 27, 24, {radius:'16px', border:'2px solid rgba(255,255,255,0.7)', extra:'box-shadow:0 15px 40px rgba(30,58,95,0.3);'})+
        
        // ALT - FROSTED GLASS BİLGİ ŞERİDİ
        _yazi(3, 85, 94, 13,
            '<div style="height:100%;box-sizing:border-box;padding:15px 30px;'+
                'background:rgba(255,255,255,0.35);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);'+
                'border:1px solid rgba(255,255,255,0.6);border-radius:16px;'+
                'display:flex;align-items:center;justify-content:space-between;'+
                'box-shadow:0 10px 40px rgba(30,58,95,0.2);">'+
                
                // SOL - Detaylar
                '<div style="color:#0f2540;">'+
                    '<div style="font-size:9px;letter-spacing:5px;color:#2c5f7f;font-weight:600;">❄ FEATURES ❄</div>'+
                    '<div style="font-family:Playfair Display,serif;font-size:20px;letter-spacing:2px;margin-top:4px;font-style:italic;">'+_b('ozellik1','4+1')+' <span style="color:#5b9bb8;">❄</span> '+_b('ozellik2','180 m²')+' <span style="color:#5b9bb8;">❄</span> '+_b('ozellik3','Doğalgaz')+'</div>'+
                '</div>'+
                
                // ORTA - Fiyat
                '<div style="text-align:center;padding:0 30px;border-left:1px solid rgba(30,58,95,0.2);border-right:1px solid rgba(30,58,95,0.2);">'+
                    '<div style="font-size:9px;letter-spacing:5px;color:#2c5f7f;font-weight:600;">❄ '+_b('fiyatEtiket','VALUATION')+' ❄</div>'+
                    '<div style="font-family:Playfair Display,serif;font-size:34px;font-weight:400;color:#0f2540;line-height:1;margin-top:4px;">'+_b('fiyat','8.500.000 TL')+'</div>'+
                '</div>'+
                
                // SAĞ - İletişim
                '<div style="text-align:right;color:#0f2540;">'+
                    '<div style="font-size:9px;letter-spacing:5px;color:#2c5f7f;font-weight:600;">❄ CONTACT ❄</div>'+
                    '<div style="font-family:Playfair Display,serif;font-size:20px;letter-spacing:2px;margin-top:4px;font-style:italic;">📞 '+_b('telefon','0532 000 00 00')+'</div>'+
                '</div>'+
            '</div>', {padding:'0'});
    c.appendChild(w);
}

function _kolaj7(){
    var c = _kolajCanvas(); if(!c) return;
    var w = _kolajWrapper('#faf8f3','#ede7d9');
    w.innerHTML = 
        // SOL ÜST - Rozet
        _yazi(4, 4, 20, 5,
            '<div style="display:inline-block;border:1px solid #1a1a1a;padding:5px 14px;font-size:10px;letter-spacing:4px;color:#1a1a1a;font-weight:600;">EXCLUSIVE PROPERTY</div>', {padding:'0'})+
        
        // SAĞ ÜST - Numara + Tarih hissi
        _yazi(76, 4, 20, 5,
            '<div style="text-align:right;font-size:10px;letter-spacing:3px;color:#8b7355;">Nº 001 • 2025</div>', {padding:'0'})+
        
        // SOL ÜST - Alt başlık (küçük)
        _yazi(4, 12, 60, 4,
            '<div style="font-size:11px;letter-spacing:6px;color:#8b7355;font-weight:500;">'+_b('altBaslik','SATILIK / MERKEZ')+'</div>', {padding:'0'})+
        
        // ANA BAŞLIK - Büyük serif
        _yazi(4, 16, 70, 12,
            '<div style="font-family:Playfair Display,Georgia,serif;font-size:68px;font-weight:400;color:#1a1a1a;line-height:1;">'+_b('baslik','Modern Villa')+'</div>', {padding:'0'})+
        
        // İnce altın çizgi
        '<div style="position:absolute;left:4%;top:29%;width:92%;height:1px;background:#c9a961;"></div>'+
        
        // 4 FOTOĞRAF - Aralarında ince altın çizgi
        _foto(1, 4, 32, 22, 45, {radius:'0', border:'1px solid #d4c9a8'})+
        _foto(2, 27, 32, 22, 45, {radius:'0', border:'1px solid #d4c9a8'})+
        _foto(3, 50, 32, 22, 45, {radius:'0', border:'1px solid #d4c9a8'})+
        _foto(4, 73, 32, 23, 45, {radius:'0', border:'1px solid #d4c9a8'})+
        
        // Foto altına dergi tarzı numara
        _yazi(4, 78, 22, 3,
            '<div style="font-family:Playfair Display,serif;font-size:14px;color:#8b7355;font-style:italic;">— 01 —</div>', {padding:'0'})+
        _yazi(27, 78, 22, 3,
            '<div style="font-family:Playfair Display,serif;font-size:14px;color:#8b7355;font-style:italic;">— 02 —</div>', {padding:'0'})+
        _yazi(50, 78, 22, 3,
            '<div style="font-family:Playfair Display,serif;font-size:14px;color:#8b7355;font-style:italic;">— 03 —</div>', {padding:'0'})+
        _yazi(73, 78, 23, 3,
            '<div style="font-family:Playfair Display,serif;font-size:14px;color:#8b7355;font-style:italic;">— 04 —</div>', {padding:'0'})+
        
        // Alt İnce çizgi
        '<div style="position:absolute;left:4%;top:83%;width:92%;height:1px;background:#1a1a1a;"></div>'+
        
        // ALT - Özellikler (dergi tarzı)
        _yazi(4, 85, 25, 12,
            '<div style="color:#1a1a1a;">'+
            '<div style="font-size:9px;letter-spacing:3px;color:#8b7355;font-weight:600;">ODA SAYISI</div>'+
            '<div style="font-family:Playfair Display,serif;font-size:28px;font-weight:400;margin-top:2px;">'+_b('ozellik1','5+2')+'</div>'+
            '</div>', {padding:'0'})+
        _yazi(29, 85, 25, 12,
            '<div style="color:#1a1a1a;border-left:1px solid #d4c9a8;padding-left:20px;height:100%;">'+
            '<div style="font-size:9px;letter-spacing:3px;color:#8b7355;font-weight:600;">TOPLAM ALAN</div>'+
            '<div style="font-family:Playfair Display,serif;font-size:28px;font-weight:400;margin-top:2px;">'+_b('ozellik2','320 m²')+'</div>'+
            '</div>', {padding:'0'})+
        _yazi(54, 85, 22, 12,
            '<div style="color:#1a1a1a;border-left:1px solid #d4c9a8;padding-left:20px;height:100%;">'+
            '<div style="font-size:9px;letter-spacing:3px;color:#8b7355;font-weight:600;">DETAY</div>'+
            '<div style="font-family:Playfair Display,serif;font-size:20px;font-weight:400;margin-top:4px;font-style:italic;">'+_b('ozellik3','Bahçeli & Havuzlu')+'</div>'+
            '</div>', {padding:'0'})+
        
        // SAĞ ALT - FİYAT KUTUSU (Vurgu)
        _yazi(76, 85, 20, 12,
    '<div style="background:#3d2f1a;color:#faf8f3;padding:14px 18px;text-align:right;height:100%;box-sizing:border-box;border:1px solid #c9a961;">'+
    '<div style="font-size:9px;letter-spacing:4px;color:#c9a961;font-weight:600;">FİYAT</div>'+
    '<div style="font-family:Playfair Display,serif;font-size:22px;font-weight:600;margin-top:4px;line-height:1;">'+_b('fiyat','12.500.000 TL')+'</div>'+
    '<div style="font-size:10px;letter-spacing:2px;margin-top:8px;color:#c9a961;">📞 '+_b('telefon','0532 000 00 00')+'</div>'+
    '</div>', {padding:'0'});
    c.appendChild(w);
}

function _kolaj8(){
    var c = _kolajCanvas(); if(!c) return;
    var w = _kolajWrapper('#1a3a2a','#2d5c42');
    
    w.innerHTML = 
        // ARKA PLAN DOKUSAL
        '<div style="position:absolute;top:0;left:0;width:100%;height:100%;'+
            'background-image:radial-gradient(circle at 20% 30%, rgba(212,175,120,0.08) 0%, transparent 40%),'+
            'radial-gradient(circle at 80% 70%, rgba(212,175,120,0.08) 0%, transparent 40%);'+
            'pointer-events:none;z-index:1;"></div>'+
        
        // ÜST MONOGRAM
        _yazi(30, 3, 40, 10,
            '<div style="text-align:center;color:#d4af78;">'+
                '<div style="font-size:24px;line-height:1;">❦</div>'+
                '<div style="font-family:Playfair Display,Georgia,serif;font-size:24px;font-weight:400;letter-spacing:8px;font-style:italic;margin-top:2px;">Botanica</div>'+
                '<div style="font-size:9px;letter-spacing:6px;opacity:0.8;margin-top:2px;">E S T A T E &nbsp; C O L L E C T I O N</div>'+
            '</div>', {padding:'0'})+
        
        // Üst altın çizgi
        '<div style="position:absolute;top:16%;left:15%;width:70%;height:1px;background:linear-gradient(90deg,transparent 0%,#d4af78 50%,transparent 100%);z-index:2;"></div>'+
        
        // SOL DİKEY PANORAMİK FOTO (yüksek, dar)
        _foto(1, 3, 20, 22, 55, {radius:'2px', border:'1px solid #d4af78', extra:'box-shadow:0 15px 40px rgba(0,0,0,0.5);'})+
        
        // SAĞ DİKEY PANORAMİK FOTO
        _foto(2, 75, 20, 22, 55, {radius:'2px', border:'1px solid #d4af78', extra:'box-shadow:0 15px 40px rgba(0,0,0,0.5);'})+
        
        // MERKEZ - BÜYÜK BAŞLIK VE BİLGİ KUTUSU
        _yazi(28, 22, 44, 51,
            '<div style="height:100%;box-sizing:border-box;padding:20px;text-align:center;color:#f5f0e0;'+
                'background:linear-gradient(180deg,rgba(26,58,42,0.5) 0%,rgba(26,58,42,0.8) 100%);'+
                'border:1px solid rgba(212,175,120,0.3);display:flex;flex-direction:column;justify-content:space-between;">'+
                
                // ÜST - Alt başlık + Başlık
                '<div>'+
                    '<div style="font-size:11px;letter-spacing:10px;color:#d4af78;font-weight:500;">'+_b('altBaslik','SERENITY ESTATE')+'</div>'+
                    '<div style="font-family:Playfair Display,serif;font-size:52px;font-weight:400;line-height:1.1;margin-top:8px;font-style:italic;">'+_b('baslik','Ferah Yuva')+'</div>'+
                    // Süs ayraç
                    '<div style="display:flex;align-items:center;justify-content:center;margin-top:10px;">'+
                        '<div style="width:40px;height:1px;background:#d4af78;"></div>'+
                        '<div style="margin:0 12px;color:#d4af78;font-size:10px;">❋</div>'+
                        '<div style="width:40px;height:1px;background:#d4af78;"></div>'+
                    '</div>'+
                '</div>'+
                
                // ORTA - Açıklama
                '<div style="font-size:14px;line-height:1.7;opacity:0.85;font-style:italic;padding:0 15px;">'+_b('aciklama','Merkezi konumda profesyonel yaşam alanı')+'</div>'+
                
                // ALT - Özellikler
                '<div>'+
                    '<div style="display:flex;justify-content:space-around;margin-bottom:15px;">'+
                        '<div style="text-align:center;">'+
                            '<div style="color:#d4af78;font-size:14px;">❋</div>'+
                            '<div style="font-family:Playfair Display,serif;font-size:18px;">'+_b('ozellik1','4+1')+'</div>'+
                            '<div style="font-size:8px;letter-spacing:2px;opacity:0.6;">ODA</div>'+
                        '</div>'+
                        '<div style="text-align:center;">'+
                            '<div style="color:#d4af78;font-size:14px;">❋</div>'+
                            '<div style="font-family:Playfair Display,serif;font-size:18px;">'+_b('ozellik2','200 m²')+'</div>'+
                            '<div style="font-size:8px;letter-spacing:2px;opacity:0.6;">ALAN</div>'+
                        '</div>'+
                        '<div style="text-align:center;">'+
                            '<div style="color:#d4af78;font-size:14px;">❋</div>'+
                            '<div style="font-family:Playfair Display,serif;font-size:14px;font-style:italic;">'+_b('ozellik3','Müstakil')+'</div>'+
                            '<div style="font-size:8px;letter-spacing:2px;opacity:0.6;">TİP</div>'+
                        '</div>'+
                    '</div>'+
                    
                    // Alt çizgi
                    '<div style="width:80%;height:1px;background:rgba(212,175,120,0.4);margin:0 auto 12px;"></div>'+
                    
                    // Fiyat
                    '<div style="font-size:9px;letter-spacing:5px;color:#d4af78;">◆ VALUATION ◆</div>'+
                    '<div style="font-family:Playfair Display,serif;font-size:32px;font-weight:400;color:#f5f0e0;margin-top:2px;">'+_b('fiyat','9.500.000 TL')+'</div>'+
                    '<div style="font-size:11px;letter-spacing:3px;color:#d4af78;margin-top:6px;">📞 '+_b('telefon','0532 000 00 00')+'</div>'+
                '</div>'+
            '</div>', {padding:'0'})+
        
        // ALT ORTA ALTINCI ÇİZGİ + SÜS
        '<div style="position:absolute;top:76%;left:3%;width:94%;height:1px;background:linear-gradient(90deg,transparent 0%,#d4af78 20%,#d4af78 80%,transparent 100%);z-index:2;"></div>'+
        
        // ALT YATAY ŞERİT - 5 KÜÇÜK FOTO
        _foto(3, 3,  79, 18.5, 18, {radius:'2px', border:'1px solid #d4af78', extra:'box-shadow:0 6px 15px rgba(0,0,0,0.4);'})+
        _foto(4, 22.5, 79, 18.5, 18, {radius:'2px', border:'1px solid #d4af78', extra:'box-shadow:0 6px 15px rgba(0,0,0,0.4);'})+
        _foto(5, 42, 79, 18.5, 18, {radius:'2px', border:'1px solid #d4af78', extra:'box-shadow:0 6px 15px rgba(0,0,0,0.4);'})+
        _foto(6, 61.5, 79, 18.5, 18, {radius:'2px', border:'1px solid #d4af78', extra:'box-shadow:0 6px 15px rgba(0,0,0,0.4);'})+
        _foto(7, 81, 79, 16, 18, {radius:'2px', border:'1px solid #d4af78', extra:'box-shadow:0 6px 15px rgba(0,0,0,0.4);'});
    c.appendChild(w);
}

function _kolaj9(){
    var c = _kolajCanvas(); if(!c) return;
    var w = _kolajWrapper('#0f1a2e','#1a2a44');
    
    w.innerHTML = 
        // ARKA PLAN DOKUSAL - İnce çizgi paterni (art deco)
        '<div style="position:absolute;top:0;left:0;width:100%;height:100%;'+
            'background-image:repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(212,175,55,0.03) 40px,rgba(212,175,55,0.03) 42px);'+
            'pointer-events:none;z-index:1;"></div>'+
        
        // KÖŞE SÜSLERİ (art deco corners) - 4 köşe
        '<div style="position:absolute;top:20px;left:20px;width:60px;height:60px;border-top:2px solid #d4af37;border-left:2px solid #d4af37;z-index:4;"></div>'+
        '<div style="position:absolute;top:20px;right:20px;width:60px;height:60px;border-top:2px solid #d4af37;border-right:2px solid #d4af37;z-index:4;"></div>'+
        '<div style="position:absolute;bottom:20px;left:20px;width:60px;height:60px;border-bottom:2px solid #d4af37;border-left:2px solid #d4af37;z-index:4;"></div>'+
        '<div style="position:absolute;bottom:20px;right:20px;width:60px;height:60px;border-bottom:2px solid #d4af37;border-right:2px solid #d4af37;z-index:4;"></div>'+
        
        // ÜST MONOGRAM (Logo alanı)
        _yazi(35, 4, 30, 8,
            '<div style="text-align:center;color:#d4af37;">'+
                '<div style="font-size:10px;letter-spacing:8px;opacity:0.8;">◆ ESTABLISHED ◆</div>'+
                '<div style="font-family:Playfair Display,serif;font-size:28px;font-weight:400;letter-spacing:12px;font-style:italic;">Maison</div>'+
                '<div style="font-size:9px;letter-spacing:6px;opacity:0.7;">R E A L &nbsp; E S T A T E</div>'+
            '</div>', {padding:'0'})+
        
        // ANA BAŞLIK
        _yazi(10, 15, 80, 12,
            '<div style="text-align:center;color:#fff;">'+
                '<div style="font-family:Playfair Display,serif;font-size:72px;font-weight:400;line-height:1;letter-spacing:4px;">'+_b('baslik','SATILIK LÜKS')+'</div>'+
                // Süs çizgisi
                '<div style="display:flex;align-items:center;justify-content:center;margin-top:6px;">'+
                    '<div style="width:60px;height:1px;background:#d4af37;"></div>'+
                    '<div style="margin:0 12px;color:#d4af37;font-size:14px;">◆</div>'+
                    '<div style="width:60px;height:1px;background:#d4af37;"></div>'+
                '</div>'+
                '<div style="font-size:11px;letter-spacing:10px;color:#d4af37;margin-top:6px;font-style:italic;">'+_b('altBaslik','ÖZEL KOLEKSİYON')+'</div>'+
            '</div>', {padding:'0'})+
        
        // SOL BÜYÜK HERO FOTO (Elmas kesim - clip-path)
        _foto(1, 6, 30, 45, 50, {radius:'0', border:'2px solid #d4af37', extra:'box-shadow:0 15px 50px rgba(212,175,55,0.3), inset 0 0 30px rgba(0,0,0,0.3);'})+
        
        // SAĞ 4 FOTO ASİMETRİK DÜZEN
        _foto(2, 54, 30, 20, 23, {radius:'0', border:'2px solid #d4af37', extra:'box-shadow:0 10px 30px rgba(0,0,0,0.5);'})+
        _foto(3, 76, 30, 18, 23, {radius:'0', border:'2px solid #d4af37', extra:'box-shadow:0 10px 30px rgba(0,0,0,0.5);'})+
        _foto(4, 54, 55, 18, 25, {radius:'0', border:'2px solid #d4af37', extra:'box-shadow:0 10px 30px rgba(0,0,0,0.5);'})+
        _foto(5, 74, 55, 20, 25, {radius:'0', border:'2px solid #d4af37', extra:'box-shadow:0 10px 30px rgba(0,0,0,0.5);'})+
        
        // SOL ALT - SÜSLÜ FİYAT KUTUSU
        _yazi(6, 84, 45, 12,
            '<div style="height:100%;box-sizing:border-box;padding:10px 20px;background:linear-gradient(135deg,rgba(212,175,55,0.15) 0%,rgba(212,175,55,0.05) 100%);border:1px solid #d4af37;position:relative;">'+
                // Sol üst köşe süsü
                '<div style="position:absolute;top:-1px;left:-1px;width:20px;height:20px;border-top:2px solid #d4af37;border-left:2px solid #d4af37;"></div>'+
                '<div style="position:absolute;bottom:-1px;right:-1px;width:20px;height:20px;border-bottom:2px solid #d4af37;border-right:2px solid #d4af37;"></div>'+
                '<div style="display:flex;align-items:center;justify-content:space-between;height:100%;">'+
                    '<div>'+
                        '<div style="font-size:9px;letter-spacing:5px;color:#d4af37;">◆ INVESTMENT ◆</div>'+
                        '<div style="font-family:Playfair Display,serif;font-size:34px;font-weight:400;color:#fff;line-height:1;margin-top:4px;letter-spacing:2px;">'+_b('fiyat','18.500.000 TL')+'</div>'+
                    '</div>'+
                    '<div style="color:#d4af37;font-size:42px;opacity:0.6;">✦</div>'+
                '</div>'+
            '</div>', {padding:'0'})+
        
        // SAĞ ALT - DETAY & İLETİŞİM
        _yazi(53, 84, 41, 12,
            '<div style="height:100%;box-sizing:border-box;padding:10px 15px;text-align:right;">'+
                '<div style="color:#d4af37;font-size:9px;letter-spacing:5px;margin-bottom:3px;">◆ DETAILS ◆</div>'+
                '<div style="color:#fff;font-size:14px;letter-spacing:3px;font-style:italic;margin-bottom:6px;">'+_b('ozellik1','4+1')+' &nbsp;<span style="color:#d4af37;">◆</span>&nbsp; '+_b('ozellik2','180 m²')+' &nbsp;<span style="color:#d4af37;">◆</span>&nbsp; '+_b('ozellik3','Doğalgaz')+'</div>'+
                '<div style="border-top:1px solid rgba(212,175,55,0.4);padding-top:6px;">'+
                    '<div style="color:#d4af37;font-size:9px;letter-spacing:5px;">◆ CONTACT ◆</div>'+
                    '<div style="color:#fff;font-size:18px;font-weight:600;letter-spacing:2px;margin-top:2px;">📞 '+_b('telefon','0532 000 00 00')+'</div>'+
                '</div>'+
            '</div>', {padding:'0'});
    c.appendChild(w);
}

function _kolaj10(){
    var c = _kolajCanvas(); if(!c) return;
    var w = _kolajWrapper('#1a1a2e','#16213e');
    w.innerHTML = 
        _foto(1, 0, 0, 100, 100, {radius:'0', border:'none'})+
        // Overlay
        '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(180deg,rgba(26,26,46,0.3) 0%,rgba(26,26,46,0.9) 100%);pointer-events:none;z-index:1;"></div>'+
        _yazi(3, 3, 60, 8,
            '<div style="font-size:28px;font-weight:900;letter-spacing:8px;color:#c0c0c0;">EMLAK</div>', {padding:'0', extra:'z-index:2;'})+
        _yazi(63, 3, 34, 8,
            '<div style="text-align:right;font-size:12px;letter-spacing:4px;opacity:0.7;color:#c0c0c0;margin-top:10px;">'+_b('altBaslik','EDITION №1')+'</div>', {padding:'0', extra:'z-index:2;'})+
        _foto(2, 84, 12, 13, 15, {radius:'4px', border:'2px solid #c0c0c0', extra:'z-index:2;'})+
        _foto(3, 84, 28, 13, 15, {radius:'4px', border:'2px solid #c0c0c0', extra:'z-index:2;'})+
        _foto(4, 84, 44, 13, 15, {radius:'4px', border:'2px solid #c0c0c0', extra:'z-index:2;'})+
        _foto(5, 3, 65, 12, 14, {radius:'4px', border:'2px solid #c0c0c0', extra:'z-index:2;'})+
        _foto(6, 16, 65, 12, 14, {radius:'4px', border:'2px solid #c0c0c0', extra:'z-index:2;'})+
        _foto(7, 29, 65, 12, 14, {radius:'4px', border:'2px solid #c0c0c0', extra:'z-index:2;'})+
        _yazi(3, 82, 94, 16,
            '<div style="color:#fff;">'+
            '<div style="font-size:13px;letter-spacing:6px;color:#c0c0c0;">'+_b('altBaslik','EXCLUSIVE COVER')+'</div>'+
            '<div style="font-size:56px;font-weight:900;line-height:1;">'+_b('baslik','Elmas Rezidans')+'</div>'+
            '<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:10px;border-top:1px solid #c0c0c0;padding-top:10px;">'+
            '<div style="font-size:15px;opacity:0.8;">'+_b('ozellik1','5+2')+' • '+_b('ozellik2','400 m²')+' • '+_b('ozellik3','Havuzlu')+'</div>'+
            '<div style="font-size:32px;font-weight:900;color:#c0c0c0;">'+_b('fiyat','55.000.000 TL')+'</div></div></div>', {padding:'0', extra:'z-index:2;'});
    c.appendChild(w);
}

// ==================== FOTOĞRAF YÜKLEME ====================
var _kolajMdEl = null, _kolajMdX = 0, _kolajMdY = 0;

document.addEventListener('mousedown', function(e){
    if(e.altKey) return;
    var el = e.target.closest('.kolaj-foto');
    if(!el) return;
    if(el.dataset.kzReady === '1'){ _kolajMdEl = null; return; }
    _kolajMdEl = el;
    _kolajMdX = e.clientX;
    _kolajMdY = e.clientY;
}, true);

document.addEventListener('mouseup', function(e){
    if(!_kolajMdEl) return;
    var el = _kolajMdEl;
    _kolajMdEl = null;
    if(Math.abs(e.clientX - _kolajMdX) > 5 || Math.abs(e.clientY - _kolajMdY) > 5) return;
    _kolajFotoSec(el);
}, true);

function _kolajFotoSec(el){
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    input.onchange = function(ev){
        var f = ev.target.files[0];
        if(!f) return;
        var r = new FileReader();
        r.onload = function(evt){
            var img = new Image();
            img.onload = function(){
                var fotoW = img.naturalWidth, fotoH = img.naturalHeight;
                var kutuW = el.offsetWidth, kutuH = el.offsetHeight;
                var minScale = Math.max(kutuW/fotoW, kutuH/fotoH);
                
                var ph = el.querySelector('.kolaj-placeholder');
                if(ph) ph.remove();
                el.style.border = 'none';
                el.style.cursor = 'grab';
                
                el.dataset.kzReady = '1';
                el.dataset.kzScale = String(minScale);
                el.dataset.kzMinScale = String(minScale * 0.5);
                el.dataset.kzFotoW = String(fotoW);
                el.dataset.kzFotoH = String(fotoH);
                el.dataset.kzX = String((kutuW - fotoW * minScale) / 2);
                el.dataset.kzY = String((kutuH - fotoH * minScale) / 2);
                
                var inner = document.createElement('div');
                inner.className = 'kolaj-inner-zoom';
                inner.style.cssText = 'position:absolute;top:0;left:0;width:'+fotoW+'px;height:'+fotoH+'px;'+
                    "background-image:url('"+evt.target.result+"');"+
                    'background-size:'+fotoW+'px '+fotoH+'px;background-repeat:no-repeat;'+
                    'transform-origin:0 0;transition:none;pointer-events:none;';
                el.appendChild(inner);
                _kzTransform(el);
                _kolajDurumKaydet();
                console.log('✅ Foto '+el.dataset.kolajNo+' yüklendi');
            };
            img.src = evt.target.result;
        };
        r.readAsDataURL(f);
    };
    document.body.appendChild(input);
    input.click();
    setTimeout(function(){ if(input.parentElement) input.remove(); }, 60000);
}

// ==================== FOTO ZOOM/PAN ====================
function _kzTransform(el){
    var inner = el.querySelector('.kolaj-inner-zoom');
    if(!inner) return;
    var s = parseFloat(el.dataset.kzScale) || 1;
    var x = parseFloat(el.dataset.kzX) || 0;
    var y = parseFloat(el.dataset.kzY) || 0;
    inner.style.transform = 'translate('+x+'px,'+y+'px) scale('+s+')';
}

document.addEventListener('wheel', function(e){
    var el = e.target.closest('.kolaj-foto');
    if(!el || el.dataset.kzReady !== '1') return;
    e.preventDefault(); e.stopPropagation();
    var s = parseFloat(el.dataset.kzScale) || 1;
    var minS = parseFloat(el.dataset.kzMinScale) || 0.1;
    var oldS = s;
    s = e.deltaY < 0 ? s * 1.1 : s / 1.1;
    if(s < minS) s = minS;
    if(s > 10) s = 10;
    var rect = el.getBoundingClientRect();
    var mx = e.clientX - rect.left, my = e.clientY - rect.top;
    var x = parseFloat(el.dataset.kzX) || 0, y = parseFloat(el.dataset.kzY) || 0;
    el.dataset.kzX = mx - (mx - x) * (s / oldS);
    el.dataset.kzY = my - (my - y) * (s / oldS);
    el.dataset.kzScale = s;
    _kzTransform(el);
}, { passive: false, capture: true });

var _kzDrag = null, _kzSX, _kzSY, _kzIX, _kzIY;
document.addEventListener('mousedown', function(e){
    if(e.altKey || e.button !== 0) return;
    var el = e.target.closest('.kolaj-foto');
    if(!el || el.dataset.kzReady !== '1') return;
    _kzDrag = el;
    _kzSX = e.clientX; _kzSY = e.clientY;
    _kzIX = parseFloat(el.dataset.kzX) || 0;
    _kzIY = parseFloat(el.dataset.kzY) || 0;
    el.style.cursor = 'grabbing';
    e.preventDefault(); e.stopPropagation();
}, true);

document.addEventListener('mousemove', function(e){
    if(!_kzDrag) return;
    _kzDrag.dataset.kzX = String(_kzIX + (e.clientX - _kzSX));
    _kzDrag.dataset.kzY = String(_kzIY + (e.clientY - _kzSY));
    _kzTransform(_kzDrag);
});

document.addEventListener('mouseup', function(){
    if(_kzDrag){ _kzDrag.style.cursor = 'grab'; _kzDrag = null; _kolajDurumKaydet(); }
});

document.addEventListener('dblclick', function(e){
    var el = e.target.closest('.kolaj-foto');
    if(!el || el.dataset.kzReady !== '1') return;
    var fotoW = parseFloat(el.dataset.kzFotoW), fotoH = parseFloat(el.dataset.kzFotoH);
    var kutuW = el.offsetWidth, kutuH = el.offsetHeight;
    var minScale = Math.max(kutuW/fotoW, kutuH/fotoH);
    el.dataset.kzScale = String(minScale);
    el.dataset.kzX = String((kutuW - fotoW * minScale) / 2);
    el.dataset.kzY = String((kutuH - fotoH * minScale) / 2);
    _kzTransform(el);
});

// ==================== ÇERÇEVE SEÇİMİ ====================
function _cerceveSec(cerceve){
    if(!cerceve) return;
    _cerceveSecimKaldir();
    _seciliCerceve = cerceve;
    cerceve.style.outline = '2px dashed #0ff';
    cerceve.style.outlineOffset = '2px';
    
    // 8 köşe tutamacı (4 köşe + 4 kenar)
    var tutamaclar = [
        {pos:'nw', style:'top:-8px;left:-8px;cursor:nwse-resize;'},
        {pos:'n',  style:'top:-8px;left:50%;margin-left:-8px;cursor:ns-resize;'},
        {pos:'ne', style:'top:-8px;right:-8px;cursor:nesw-resize;'},
        {pos:'e',  style:'top:50%;right:-8px;margin-top:-8px;cursor:ew-resize;'},
        {pos:'se', style:'bottom:-8px;right:-8px;cursor:nwse-resize;'},
        {pos:'s',  style:'bottom:-8px;left:50%;margin-left:-8px;cursor:ns-resize;'},
        {pos:'sw', style:'bottom:-8px;left:-8px;cursor:nesw-resize;'},
        {pos:'w',  style:'top:50%;left:-8px;margin-top:-8px;cursor:ew-resize;'}
    ];
    tutamaclar.forEach(function(k){
        var tut = document.createElement('div');
        tut.className = 'kolaj-tutamac';
        tut.dataset.corner = k.pos;
        tut.style.cssText = 'position:absolute;width:16px;height:16px;background:#0ff;border:2px solid #fff;border-radius:3px;z-index:99999;pointer-events:auto;box-shadow:0 2px 6px rgba(0,0,0,0.5);'+k.style;
        cerceve.appendChild(tut);
    });
    
    // Rotate tutamacı (üstten)
    var rot = document.createElement('div');
    rot.className = 'kolaj-tutamac';
    rot.dataset.corner = 'rotate';
    rot.style.cssText = 'position:absolute;top:-35px;left:50%;margin-left:-8px;width:16px;height:16px;background:#f59e0b;border:2px solid #fff;border-radius:50%;z-index:99999;pointer-events:auto;box-shadow:0 2px 6px rgba(0,0,0,0.5);cursor:grab;';
    cerceve.appendChild(rot);
    
    _cerceveEditoruAc(cerceve);
}

function _cerceveSecimKaldir(){
    if(!_seciliCerceve) return;
    _seciliCerceve.style.outline = '';
    _seciliCerceve.style.outlineOffset = '';
    _seciliCerceve.querySelectorAll('.kolaj-tutamac').forEach(function(t){ t.remove(); });
    _seciliCerceve = null;
    var editor = document.getElementById('cerceveEditor');
    if(editor) editor.style.display = 'none';
}

// Alt basılıyken hover → seç
document.addEventListener('mousemove', function(e){
    if(!e.altKey){ return; }
    if(_resizeEl || _cerDrag) return;
    var yeni = e.target.closest('.kolaj-cerceve');
    if(!yeni || yeni === _seciliCerceve) return;
    _cerceveSec(yeni);
});

document.addEventListener('keyup', function(e){
    if(e.key === 'Alt' && !_resizeEl && !_cerDrag){
        // Seçim kalabilir, sadece cursor değişsin
    }
});

// ==================== ÇERÇEVE EDİTÖRÜ (Sol Panel) ====================
function _cerceveEditoruAc(cerceve){
    var editor = document.getElementById('cerceveEditor');
    var icerik = document.getElementById('cerceveEditorIcerik');
    if(!editor || !icerik) return;
    editor.style.display = 'block';
    
    var cs = window.getComputedStyle(cerceve);
    var bgColor = _rgbToHex(cs.backgroundColor) || '#ffffff';
    var borderColor = _rgbToHex(cs.borderColor) || '#ffffff';
    var borderWidth = parseInt(cs.borderWidth) || 0;
    var borderRadius = parseInt(cs.borderRadius) || 0;
    var rotate = _getRotate(cerceve);
    
    icerik.innerHTML = 
        '<div class="row-2">'+
            '<div class="input-group"><label>Arka Plan</label><input type="color" id="ceBg" value="'+bgColor+'" style="width:100%;height:36px;"></div>'+
            '<div class="input-group"><label>Border Renk</label><input type="color" id="ceBorderColor" value="'+borderColor+'" style="width:100%;height:36px;"></div>'+
        '</div>'+
        '<div class="row-2">'+
            '<div class="input-group"><label>Border Kalınlık: <span id="ceBwLbl">'+borderWidth+'</span>px</label><input type="range" id="ceBw" min="0" max="20" value="'+borderWidth+'"></div>'+
            '<div class="input-group"><label>Yuvarlaklık: <span id="ceBrLbl">'+borderRadius+'</span>px</label><input type="range" id="ceBr" min="0" max="200" value="'+borderRadius+'"></div>'+
        '</div>'+
        '<div class="input-group"><label>Border Stili</label>'+
            '<select id="ceBs" style="width:100%;padding:8px;background:#0f172a;color:#fff;border:1px solid #334155;border-radius:6px;">'+
                '<option value="solid">Solid (Düz)</option>'+
                '<option value="dashed">Dashed (Kesikli)</option>'+
                '<option value="dotted">Dotted (Noktalı)</option>'+
                '<option value="double">Double (Çift)</option>'+
                '<option value="none">Yok</option>'+
            '</select></div>'+
        '<div class="input-group"><label>Döndür: <span id="ceRotLbl">'+rotate+'</span>°</label><input type="range" id="ceRot" min="-180" max="180" value="'+rotate+'"></div>'+
        '<div class="row-2">'+
            '<div class="input-group"><label>Yazı Rengi</label><input type="color" id="ceColor" value="'+(_rgbToHex(cs.color)||'#ffffff')+'" style="width:100%;height:36px;"></div>'+
            '<div class="input-group"><label>Gölge</label>'+
                '<select id="ceShadow" style="width:100%;padding:8px;background:#0f172a;color:#fff;border:1px solid #334155;border-radius:6px;">'+
                    '<option value="none">Yok</option>'+
                    '<option value="0 4px 12px rgba(0,0,0,0.3)">Hafif</option>'+
                    '<option value="0 10px 30px rgba(0,0,0,0.5)">Orta</option>'+
                    '<option value="0 20px 60px rgba(0,0,0,0.7)">Güçlü</option>'+
                    '<option value="0 0 30px #0ff">Neon Cyan</option>'+
                    '<option value="0 0 30px #ff00ff">Neon Pembe</option>'+
                    '<option value="0 0 30px gold">Altın</option>'+
                '</select></div>'+
        '</div>'+
        '<button class="btn-action" style="background:#ef4444;color:#fff;width:100%;margin-top:8px;" onclick="_cerceveSil()">🗑️ Bu Çerçeveyi Sil</button>';
    
    // Bind
    _bindCerceveEditor(cerceve);
}

function _bindCerceveEditor(cerceve){
    document.getElementById('ceBg').oninput = function(){ cerceve.style.background = this.value; _kolajDurumKaydet(); };
    document.getElementById('ceBorderColor').oninput = function(){ cerceve.style.borderColor = this.value; _kolajDurumKaydet(); };
    document.getElementById('ceBw').oninput = function(){ 
        cerceve.style.borderWidth = this.value+'px'; 
        document.getElementById('ceBwLbl').textContent = this.value;
        _kolajDurumKaydet();
    };
    document.getElementById('ceBr').oninput = function(){ 
        cerceve.style.borderRadius = this.value+'px'; 
        document.getElementById('ceBrLbl').textContent = this.value;
        _kolajDurumKaydet();
    };
    document.getElementById('ceBs').onchange = function(){ cerceve.style.borderStyle = this.value; _kolajDurumKaydet(); };
    document.getElementById('ceColor').oninput = function(){ cerceve.style.color = this.value; _kolajDurumKaydet(); };
    document.getElementById('ceShadow').onchange = function(){ cerceve.style.boxShadow = this.value; _kolajDurumKaydet(); };
    document.getElementById('ceRot').oninput = function(){ 
        _setRotate(cerceve, this.value);
        document.getElementById('ceRotLbl').textContent = this.value;
        _kolajDurumKaydet();
    };
}

function _cerceveSil(){
    if(!_seciliCerceve) return;
    if(!confirm('Bu çerçeveyi sil?')) return;
    _seciliCerceve.remove();
    _cerceveSecimKaldir();
    _kolajDurumKaydet();
}

function _rgbToHex(rgb){
    if(!rgb || rgb.indexOf('rgb') !== 0) return null;
    var m = rgb.match(/\d+/g);
    if(!m || m.length < 3) return null;
    return '#' + m.slice(0,3).map(function(x){ var h = parseInt(x).toString(16); return h.length<2?'0'+h:h; }).join('');
}

function _getRotate(el){
    var t = el.style.transform || '';
    var m = t.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/);
    return m ? parseFloat(m[1]) : 0;
}

function _setRotate(el, deg){
    var t = el.style.transform || '';
    t = t.replace(/rotate\([^)]*\)/, '').trim();
    el.style.transform = (t + ' rotate('+deg+'deg)').trim();
}

// ==================== ÇERÇEVE TAŞIMA (Alt+Sürükle Gövde) ====================
var _cerDrag = null, _cerSX, _cerSY, _cerIL, _cerIT;

document.addEventListener('mousedown', function(e){
    if(!e.altKey || e.button !== 0) return;
    if(e.target.classList && e.target.classList.contains('kolaj-tutamac')) return;
    var el = e.target.closest('.kolaj-cerceve');
    if(!el) return;
    e.preventDefault(); e.stopPropagation();
    _cerDrag = el;
    _cerceveSec(el);
    _cerSX = e.clientX; _cerSY = e.clientY;
    _cerIL = el.offsetLeft;
    _cerIT = el.offsetTop;
    el.style.cursor = 'move';
}, true);

document.addEventListener('mousemove', function(e){
    if(!_cerDrag) return;
    var dx = e.clientX - _cerSX, dy = e.clientY - _cerSY;
    _cerDrag.style.left = (_cerIL + dx) + 'px';
    _cerDrag.style.top = (_cerIT + dy) + 'px';
});

document.addEventListener('mouseup', function(){
    if(_cerDrag){ _cerDrag.style.cursor = ''; _cerDrag = null; _kolajDurumKaydet(); }
});

// ==================== ÇERÇEVE BOYUTLANDIRMA ====================
var _resizeEl = null, _resizeCorner = '', _resizeSX, _resizeSY;
var _resizeW, _resizeH, _resizeL, _resizeT;

document.addEventListener('mousedown', function(e){
    if(!e.target.classList || !e.target.classList.contains('kolaj-tutamac')) return;
    if(e.target.dataset.corner === 'rotate'){ _rotateStart(e); return; }
    e.preventDefault(); e.stopPropagation();
    _resizeEl = e.target.parentElement;
    _resizeCorner = e.target.dataset.corner;
    _resizeSX = e.clientX; _resizeSY = e.clientY;
    _resizeW = _resizeEl.offsetWidth;
    _resizeH = _resizeEl.offsetHeight;
    _resizeL = _resizeEl.offsetLeft;
    _resizeT = _resizeEl.offsetTop;
}, true);

document.addEventListener('mousemove', function(e){
    if(!_resizeEl) return;
    var dx = e.clientX - _resizeSX, dy = e.clientY - _resizeSY;
    var newW = _resizeW, newH = _resizeH, newL = _resizeL, newT = _resizeT;
    var c = _resizeCorner;
    if(c.indexOf('e') > -1) newW = _resizeW + dx;
    if(c.indexOf('w') > -1){ newW = _resizeW - dx; newL = _resizeL + dx; }
    if(c.indexOf('s') > -1) newH = _resizeH + dy;
    if(c.indexOf('n') > -1){ newH = _resizeH - dy; newT = _resizeT + dy; }
    if(newW < 30) newW = 30;
    if(newH < 30) newH = 30;
    _resizeEl.style.width = newW + 'px';
    _resizeEl.style.height = newH + 'px';
    if(c.indexOf('w') > -1) _resizeEl.style.left = newL + 'px';
    if(c.indexOf('n') > -1) _resizeEl.style.top = newT + 'px';
});

document.addEventListener('mouseup', function(){
    if(_resizeEl){ _resizeEl = null; _kolajDurumKaydet(); }
});

// ==================== DÖNDÜRME ====================
var _rotateEl = null, _rotateCX, _rotateCY, _rotateStartDeg = 0, _rotateStartMouseDeg = 0;
function _rotateStart(e){
    e.preventDefault(); e.stopPropagation();
    _rotateEl = e.target.parentElement;
    var rect = _rotateEl.getBoundingClientRect();
    _rotateCX = rect.left + rect.width/2;
    _rotateCY = rect.top + rect.height/2;
    _rotateStartDeg = _getRotate(_rotateEl);
    _rotateStartMouseDeg = Math.atan2(e.clientY - _rotateCY, e.clientX - _rotateCX) * 180 / Math.PI;
}

document.addEventListener('mousemove', function(e){
    if(!_rotateEl) return;
    var cur = Math.atan2(e.clientY - _rotateCY, e.clientX - _rotateCX) * 180 / Math.PI;
    var deg = _rotateStartDeg + (cur - _rotateStartMouseDeg);
    _setRotate(_rotateEl, deg);
});

document.addEventListener('mouseup', function(){
    if(_rotateEl){ _rotateEl = null; _kolajDurumKaydet(); }
});

// ==================== UNDO / GERİ AL ====================
function _kolajDurumKaydet(){
    var wrap = document.getElementById('kolaj-wrapper');
    if(!wrap) return;
    var d = { bg: wrap.style.background, cers: [] };
    wrap.querySelectorAll('.kolaj-cerceve').forEach(function(c){
        d.cers.push({
            style: c.getAttribute('style') || '',
            html: c.innerHTML,
            kzScale: c.dataset.kzScale || '',
            kzX: c.dataset.kzX || '',
            kzY: c.dataset.kzY || ''
        });
    });
    _kolajGecmis.push(JSON.stringify(d));
    if(_kolajGecmis.length > _kolajMaxGecmis) _kolajGecmis.shift();
}

function _kolajGeriAl(){
    if(_kolajGecmis.length < 2){ console.log('⚠️ Geri alınacak yok'); return; }
    _kolajGecmis.pop();
    var d = JSON.parse(_kolajGecmis[_kolajGecmis.length - 1]);
    var wrap = document.getElementById('kolaj-wrapper');
    if(!wrap) return;
    wrap.style.background = d.bg;
    var cers = wrap.querySelectorAll('.kolaj-cerceve');
    d.cers.forEach(function(cd, i){
        if(cers[i]){
            cers[i].setAttribute('style', cd.style);
            cers[i].innerHTML = cd.html;
            if(cd.kzScale) cers[i].dataset.kzScale = cd.kzScale;
            if(cd.kzX) cers[i].dataset.kzX = cd.kzX;
            if(cd.kzY) cers[i].dataset.kzY = cd.kzY;
        }
    });
    _cerceveSecimKaldir();
    console.log('↩️ Geri alındı');
}

document.addEventListener('keydown', function(e){
    if((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')){
        var wrap = document.getElementById('kolaj-wrapper');
        if(!wrap) return;
        var aktif = document.activeElement;
        if(aktif && (aktif.tagName === 'INPUT' || aktif.tagName === 'TEXTAREA')) return;
        e.preventDefault();
        _kolajGeriAl();
    }
    // ESC → seçimi kaldır
    if(e.key === 'Escape'){
        _cerceveSecimKaldir();
    }
    // Delete → seçili çerçeveyi sil
    if(e.key === 'Delete' && _seciliCerceve){
        var aktif = document.activeElement;
        if(aktif && (aktif.tagName === 'INPUT' || aktif.tagName === 'TEXTAREA')) return;
        _cerceveSil();
    }
});

// ==================== SIFIRLA ====================
function _kolajSifirla(){
    if(!_kolajAktif){ alert('⚠️ Önce şablon seç'); return; }
    if(!confirm('🔄 Tüm değişiklikler silinecek. Devam?')) return;
    var s = KOLAJ_SABLONLARI.find(function(x){ return x.id === _kolajAktif; });
    if(s){
        _cerceveSecimKaldir();
        window[s.fn]();
        _kolajGecmis = [];
        setTimeout(_kolajDurumKaydet, 100);
    }
}
// ============================================================
// KOLAJDA ÇİFT TIKLA-DÜZENLE (Sabit yazılar için)
// ============================================================
document.addEventListener('dblclick', function(e){
    var wrap = document.getElementById('kolaj-wrapper');
    if(!wrap) return;
    if(!wrap.contains(e.target)) return;
    
    // Foto veya çerçeve gövdesi ise atla (onların kendi çift tık davranışı var)
    if(e.target.closest('.kolaj-foto')) return;
    if(e.target.classList.contains('kolaj-tutamac')) return;
    
    // Yazı içeren en yakın element bul (span, div, p vs.)
    var el = e.target;
    // Text içeriği olan ve içinde başka element olmayan bir yer bul
    if(el.children.length > 0){
        // Metin doğrudan bu elementin içinde değil, alt elementte olabilir
        // O yüzden text node'lu en dip elementi bul
        var texted = null;
        for(var i=0; i<el.childNodes.length; i++){
            if(el.childNodes[i].nodeType === 3 && el.childNodes[i].textContent.trim()){
                texted = el;
                break;
            }
        }
        if(!texted){
            // Alt elementlerden metin içeren birini bul
            var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            var node = walker.nextNode();
            if(node) texted = node.parentElement;
        }
        if(texted) el = texted;
    }
    
    if(!el || !el.textContent.trim()) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Düzenlenebilir yap
    el.contentEditable = 'true';
    el.style.outline = '2px dashed #0ff';
    el.style.outlineOffset = '4px';
    el.style.cursor = 'text';
    el.focus();
    
    // Metni seç
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    
    // Bitirince (blur olunca) kaydet
    var kaydet = function(){
        el.contentEditable = 'false';
        el.style.outline = '';
        el.style.outlineOffset = '';
        el.style.cursor = '';
        el.removeEventListener('blur', kaydet);
        el.removeEventListener('keydown', enterBitir);
        _kolajDurumKaydet();
        console.log('✏️ Yazı düzenlendi:', el.textContent.substring(0, 30));
    };
    
    // Enter tuşu → bitir
    var enterBitir = function(ev){
        if(ev.key === 'Enter' && !ev.shiftKey){
            ev.preventDefault();
            el.blur();
        }
        if(ev.key === 'Escape'){
            el.blur();
        }
    };
    
    el.addEventListener('blur', kaydet);
    el.addEventListener('keydown', enterBitir);
}, true);

console.log('✏️ Çift tık düzenleme sistemi yüklendi');

// ============================================================
// SEKME GEÇİŞ YÖNETİMİ - v21 FİNAL
// Duplicate wrapper temizler + Sadece 3 ana sekmede müdahale
// ============================================================

// Canva'ya ait katmanlar (photo-layer HARİÇ)
var _canvaKatmanlariV21 = ['shadow-overlay', 'highlight-overlay', 'vignette-layer', 'mask-layer', 'canva-render-layer', 'ui-layer'];

// TÜM duplicate kolaj-wrapper'ları sil (sadece 1 tane kalsın)
function _duplicateKolajTemizle(){
    var wraps = document.querySelectorAll('#kolaj-wrapper');
    if(wraps.length > 1){
        console.log('⚠️ ' + wraps.length + ' kolaj-wrapper bulundu, temizleniyor');
        // En sonuncusu (en yeni) hariç hepsini sil
        for(var i = 0; i < wraps.length - 1; i++){
            wraps[i].remove();
        }
    }
}

function _sekmeGecisYonet(tab){
    console.log('🔀 v24 Sekme:', tab);
    
    // ÖNCE duplicate kolaj-wrapper'ları temizle
    _duplicateKolajTemizle();
    
    var kolajVar = document.querySelector('#kolaj-wrapper') !== null;

    // 1) KOLAJ WRAPPER görünürlüğü
    //    - 'kolaj' sekmesinde: her zaman göster
    //    - 'canva' sekmesinde: kolaj seçiliyse göster, değilse gizle
    //    - diğer sekmelerde: DOKUNMA
    document.querySelectorAll('#kolaj-wrapper').forEach(function(kolajWrap){
        if(tab === 'kolaj'){
            kolajWrap.style.setProperty('display', 'block', 'important');
        } else if(tab === 'canva'){
            // Canva (Şablonlar) sekmesine geçince kolaj hâlâ görünür kalsın
            kolajWrap.style.setProperty('display', 'block', 'important');
        }
        // Diğer sekmelerde (callout, element vb.) dokunma
    });
    
    // 2) CANVA KATMANLARI - Sadece 'kolaj' sekmesinde gizle
    if(tab === 'kolaj'){
        _canvaKatmanlariV21.forEach(function(id){
            var el = document.getElementById(id);
            if(!el) return;
            el.style.setProperty('display', 'none', 'important');
        });
    } else if(tab === 'canva'){
        // Canva sekmesine geçince canva katmanlarına DOKUNMA
        // (normal Canva şablonları çalışsın, kolaj üstüne çıkmasın)
    }
    
    // 3) PHOTO-LAYER'ı GARANTİLE (asla gizlenmesin)
    var pl = document.getElementById('photo-layer');
    if(pl && pl.style.display === 'none'){
        pl.style.removeProperty('display');
    }
    
    console.log('  ✅ v24 Yönetildi: ' + tab + ' | kolajVar=' + kolajVar);
}

function _kolajSwitchTabWrap(){
    if(typeof window.switchTab !== 'function'){
        setTimeout(_kolajSwitchTabWrap, 500);
        return;
    }
    if(window._switchTabWrappedV22) return;
    window._switchTabWrappedV22 = true;
    
    var _origSwitchTab = window.switchTab;
    window.switchTab = function(tab){
        // ÖNCE orijinal switchTab çalışsın (canva render vb.)
        _origSwitchTab(tab);
        // SONRA bizim yönetim — 3 farklı zamanda dene (garanti)
        setTimeout(function(){ _sekmeGecisYonet(tab); }, 100);
        setTimeout(function(){ _sekmeGecisYonet(tab); }, 300);
        setTimeout(function(){ _sekmeGecisYonet(tab); }, 600);
    };
    console.log('✅ Kolaj v23 FİNAL (3 kez tetikleme)');
}

// Sayfa yüklenince garantile ve temizle
function _kolajBaslangicTemizlik(){
    _duplicateKolajTemizle();
    var pl = document.getElementById('photo-layer');
    if(pl && pl.style.display === 'none'){
        pl.style.removeProperty('display');
    }
}
setTimeout(_kolajBaslangicTemizlik, 500);
setTimeout(_kolajBaslangicTemizlik, 2000);

_kolajSwitchTabWrap();

// ==================== BAŞLAT ====================
if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', _kolajInit);
} else {
    _kolajInit();
}

console.log('📸 Kolaj v10 PRO yüklendi - Tam düzenleme aktif');