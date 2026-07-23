const fs = require('fs');
let c = fs.readFileSync('tpl_kolaj/kolaj.js', 'utf8');

const regex = /function _kolaj9\(\)\{[\s\S]*?c\.appendChild\(w\);\n\}/;
const oldMatch = c.match(regex);

if(oldMatch) {
    const newFunc = `function _kolaj9(){
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
                '<div style="font-size:14px;letter-spacing:8px;opacity:0.8;">◆ ÖZEL PORTFÖY ◆</div>'+
                '<div style="font-family:Playfair Display,serif;font-size:53px;font-weight:600;letter-spacing:12px;font-style:italic;">Maison</div>'+
                '<div style="font-size:13px;letter-spacing:6px;opacity:0.7;">G A Y R İ M E N K U L</div>'+
            '</div>', {padding:'0'})+
        
        // ANA BAŞLIK
        _yazi(10, 15, 80, 12,
            '<div style="text-align:center;color:#fff;">'+
                '<div style="font-family:Playfair Display,serif;font-size:100px;font-weight:600;line-height:1;letter-spacing:4px;">'+_b('baslik','SATILIK LÜKS')+'</div>'+
                // Süs çizgisi
                '<div style="display:flex;align-items:center;justify-content:center;margin-top:6px;">'+
                    '<div style="width:60px;height:1px;background:#d4af37;"></div>'+
                    '<div style="margin:0 12px;color:#d4af37;font-size:29px;">◆</div>'+
                    '<div style="width:60px;height:1px;background:#d4af37;"></div>'+
                '</div>'+
                '<div style="font-size:15px;letter-spacing:10px;color:#d4af37;margin-top:6px;font-style:italic;">'+_b('altBaslik','ÖZEL KOLEKSİYON')+'</div>'+
            '</div>', {padding:'0'})+
        
        // SOL BÜYÜK HERO FOTO (Elmas kesim - clip-path)
        _foto(1, 6, 30, 45, 50, {radius:'0', border:'2px solid #d4af37', extra:'box-shadow:0 15px 50px rgba(212,175,55,0.3), inset 0 0 30px rgba(0,0,0,0.3);'})+
        
        // SAĞ 4 FOTO ASİMETRİK DÜZEN
        _foto(2, 54, 30, 20, 23, {radius:'0', border:'2px solid #d4af37', extra:'box-shadow:0 10px 30px rgba(0,0,0,0.5);'})+
        _foto(3, 76, 30, 18, 23, {radius:'0', border:'2px solid #d4af37', extra:'box-shadow:0 10px 30px rgba(0,0,0,0.5);'})+
        _foto(4, 54, 55, 18, 25, {radius:'0', border:'2px solid #d4af37', extra:'box-shadow:0 10px 30px rgba(0,0,0,0.5);'})+
        _foto(5, 74, 55, 20, 25, {radius:'0', border:'2px solid #d4af37', extra:'box-shadow:0 10px 30px rgba(0,0,0,0.5);'})+
        
        // SOL ALT - SÜSLÜ FİYAT KUTUSU
        _yazi(6, 82, 45, 15,
            '<div style="height:100%;box-sizing:border-box;padding:10px 20px;background:linear-gradient(135deg,rgba(212,175,55,0.15) 0%,rgba(212,175,55,0.05) 100%);border:1px solid #d4af37;position:relative;">'+
                // Sol üst köşe süsü
                '<div style="position:absolute;top:-1px;left:-1px;width:20px;height:20px;border-top:2px solid #d4af37;border-left:2px solid #d4af37;"></div>'+
                '<div style="position:absolute;bottom:-1px;right:-1px;width:20px;height:20px;border-bottom:2px solid #d4af37;border-right:2px solid #d4af37;"></div>'+
                '<div style="display:flex;align-items:center;justify-content:space-between;height:100%;">'+
                    '<div style="display:flex;flex-direction:column;justify-content:center;padding-top:4px;">'+
                        '<div style="font-size:13px;letter-spacing:5px;color:#d4af37;">◆ YATIRIM FIRSATI ◆</div>'+
                        '<div style="font-family:Playfair Display,serif;font-size:60px;font-weight:600;color:#fff;line-height:1;margin-top:2px;letter-spacing:2px;">'+_b('fiyat','18.500.000 TL')+'</div>'+
                    '</div>'+
                    '<div style="color:#d4af37;font-size:72px;opacity:0.6;display:flex;align-items:center;">✦</div>'+
                '</div>'+
            '</div>', {padding:'0'})+
        
        // SAĞ ALT - DETAY & İLETİŞİM
        _yazi(53, 82, 41, 15,
            '<div style="height:100%;box-sizing:border-box;padding:10px 15px;text-align:right;display:flex;flex-direction:column;justify-content:center;">'+
                '<div style="color:#d4af37;font-size:13px;letter-spacing:5px;margin-bottom:3px;">◆ DETAYLAR ◆</div>'+
                '<div style="color:#fff;font-size:29px;letter-spacing:3px;font-style:italic;margin-bottom:6px;">'+_b('ozellik1','4+1')+' &nbsp;<span style="color:#d4af37;">◆</span>&nbsp; '+_b('ozellik2','180 m²')+' &nbsp;<span style="color:#d4af37;">◆</span>&nbsp; '+_b('ozellik3','Doğalgaz')+'</div>'+
                '<div style="border-top:1px solid rgba(212,175,55,0.4);padding-top:6px;">'+
                    '<div style="color:#d4af37;font-size:13px;letter-spacing:5px;">◆ İLETİŞİM ◆</div>'+
                    '<div style="color:#fff;font-size:35px;font-weight:800;letter-spacing:2px;margin-top:2px;">📞 '+_b('telefon','0532 000 00 00')+'</div>'+
                '</div>'+
            '</div>', {padding:'0'});
    c.appendChild(w);
}`;

    c = c.replace(oldMatch[0], newFunc);
    fs.writeFileSync('tpl_kolaj/kolaj.js', c);
    console.log('Successfully updated Kolaj 9 (Diamond Butik) layout and translations');
} else {
    console.log('FAILED to match regex');
}
